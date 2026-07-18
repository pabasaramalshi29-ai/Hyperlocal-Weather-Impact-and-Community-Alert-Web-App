// src/utils/districtAlertService.js
// ─────────────────────────────────────────────────────────────────────────────
// District Alert Email Notification Service
//
// Logic (one alert cluster per district PER DAY):
//  1. Each report for a district is merged into a single Firestore doc
//     `alerts/{district}_{YYYY-MM-DD}` instead of creating a new alert doc
//     per submission. The doc's `reportCount` increments with every report.
//  2. Only reports submitted on the SAME calendar day count toward the
//     threshold — a report today and 2 more tomorrow will NOT combine.
//  3. While reportCount < ALERT_THRESHOLD (3), the cluster stays
//     status: 'pending' and is only visible on the Alerts page.
//  4. The moment reportCount reaches ALERT_THRESHOLD, the cluster flips to
//     status: 'confirmed' (shown on the Map page too) and a one-time email
//     blast goes out to every user registered for that district.
//  5. Further reports the same day keep incrementing reportCount but the
//     cluster is already confirmed, so no duplicate emails are sent.
// ─────────────────────────────────────────────────────────────────────────────

import { db } from '../firebase';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import emailjs from '@emailjs/browser';

// ── Configuration ────────────────────────────────────────────────────────────
const ALERT_THRESHOLD = 3; // Number of same-day reports that triggers confirmation + email blast

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const IMGBB_API_KEY       = import.meta.env.VITE_IMGBB_API_KEY;

const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';

const uploadImageToImgbb = async (file) => {
  if (!file) return null;
  if (!IMGBB_API_KEY) {
    console.warn('⚠️ ImgBB API key not configured. Set VITE_IMGBB_API_KEY in your .env file.');
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch(IMGBB_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('ImgBB upload failed:', response.status, response.statusText, errorBody);
      alert(`Image upload failed: ${response.statusText} (${response.status}). Please try again or remove the file.`);
      return null;
    }

    const data = await response.json();
    return data?.data?.url || null;
  } catch (err) {
    console.error('ImgBB upload error:', err);
    return null;
  }
};

// ── Sri Lanka Districts ───────────────────────────────────────────────────────
export const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

// ── Severity ranking, used to escalate a cluster to its worst reported severity ──
const SEVERITY_RANK = { low: 1, medium: 2, high: 3 };
const higherSeverity = (a = 'medium', b = 'medium') => {
  const ra = SEVERITY_RANK[(a || 'medium').toLowerCase()] ?? 2;
  const rb = SEVERITY_RANK[(b || 'medium').toLowerCase()] ?? 2;
  return ra >= rb ? a : b;
};

// ── Today's date key in Asia/Colombo time, e.g. "2026-07-10" ─────────────────
const getDayKey = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });

const normalizeLocationKey = (text) =>
  (text || '').trim().toLowerCase();

const isSameExactLocation = (data, loc, location) => {
  if (!data) return false;

  const currentLocText = normalizeLocationKey(loc);
  const existingLocText = normalizeLocationKey(data.loc);
  const sameLocText = currentLocText && existingLocText && currentLocText === existingLocText;

  const currentCoords = location || {};
  const existingCoords = data.location || {};
  const sameCoords =
    typeof existingCoords.lat === 'number' &&
    typeof existingCoords.lng === 'number' &&
    typeof currentCoords.lat === 'number' &&
    typeof currentCoords.lng === 'number' &&
    Math.abs(existingCoords.lat - currentCoords.lat) < 0.0001 &&
    Math.abs(existingCoords.lng - currentCoords.lng) < 0.0001;

  return sameLocText || sameCoords;
};

// ── Send one email via EmailJS ─────────────────────────────────────────────
const sendAlertEmail = async ({ toEmail, toName, district, alertCount, description, location }) => {
  // Validate EmailJS is configured before attempting
  if (
    !EMAILJS_SERVICE_ID ||
    EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' ||
    !EMAILJS_TEMPLATE_ID ||
    EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' ||
    !EMAILJS_PUBLIC_KEY ||
    EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY'
  ) {
    console.warn(
      '⚠️  EmailJS is not configured. Please set VITE_EMAILJS_SERVICE_ID, ' +
      'VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in your .env file.'
    );
    return false;
  }

  const templateParams = {
    to_name:      toName || 'Community Member',
    to_email:     toEmail,
    district:     district,
    alert_count:  alertCount,
    description:  description || 'Multiple community alerts reported.',
    location:     location || district,
    report_time:  new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' }),
  };

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    console.log(`✅ Email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send email to ${toEmail}:`, err);
    return false;
  }
};

// ── Get TODAY's report count for a district (for the progress bar in Report.jsx) ──
export const getTodayDistrictReportCount = async (district, loc, location) => {
  if (!district) return 0;
  try {
    const dayKey = getDayKey();
    const q = query(
      collection(db, 'alerts'),
      where('district', '==', district),
      where('dayKey', '==', dayKey)
    );
    const snap = await getDocs(q);
    if (!loc && !location) return snap.size;

    const sameLocationCount = snap.docs.filter((docSnap) =>
      isSameExactLocation(docSnap.data(), loc, location)
    ).length;

    return sameLocationCount;
  } catch (err) {
    console.error('Error fetching today district report count:', err);
    return 0;
  }
};

// ── Main function: write a separate alert doc for every report,
// while still tracking same-location daily progress and confirmation.
export const submitDistrictReport = async ({
  district,
  description,
  severity,
  loc,
  location,
  imageUrl,
}) => {
  if (!district) return { reportCount: 0, status: 'pending', justConfirmed: false };

  const dayKey = getDayKey();
  const alertsRef = collection(db, 'alerts');

  try {
    const reportsQuery = query(
      alertsRef,
      where('district', '==', district),
      where('dayKey', '==', dayKey)
    );
    const snap = await getDocs(reportsQuery);
    const existingReports = snap.docs;

    const sameLocationReports = existingReports.filter((docSnap) =>
      isSameExactLocation(docSnap.data(), loc, location)
    );
    const currentLocationCount = sameLocationReports.length + 1;
    const wasLocationConfirmed = sameLocationReports.some((d) => d.data().status === 'confirmed');
    const status = wasLocationConfirmed || currentLocationCount >= ALERT_THRESHOLD ? 'confirmed' : 'pending';
    const mergedSeverity = sameLocationReports.reduce(
      (prev, d) => higherSeverity(prev, d.data()?.severity),
      severity
    );

    const alertData = {
      title: 'Community Report',
      district,
      dayKey,
      reportCount: currentLocationCount,
      status,
      severity: mergedSeverity,
      description,
      loc,
      location,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const newAlertRef = await addDoc(alertsRef, alertData);

    if (sameLocationReports.length > 0) {
      const batch = writeBatch(db);
      sameLocationReports.forEach((docSnap) => {
        const data = docSnap.data();
        batch.update(doc(db, 'alerts', docSnap.id), {
          reportCount: currentLocationCount,
          status,
          severity: higherSeverity(data.severity, severity),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
    }

    let usersNotified = 0;
    const justConfirmed = !wasLocationConfirmed && status === 'confirmed';

    if (justConfirmed) {
      console.log(`🚨 "${district}" at location "${loc}" hit ${ALERT_THRESHOLD} reports today — confirming + notifying residents.`);

      const usersQuery = query(collection(db, 'users'), where('district', '==', district));
      const usersSnap = await getDocs(usersQuery);
      const users = [];
      usersSnap.forEach((d) => users.push(d.data()));

      if (users.length > 0) {
        const emailPromises = users.map((u) =>
          sendAlertEmail({
            toEmail: u.email,
            toName: u.name,
            district,
            alertCount: ALERT_THRESHOLD,
            description,
            location: loc,
          })
        );
        await Promise.allSettled(emailPromises);
      }
      usersNotified = users.length;
    }

    return { reportCount: currentLocationCount, status, justConfirmed, usersNotified };
  } catch (err) {
    console.error('Error in submitDistrictReport:', err);
    return { reportCount: 0, status: 'pending', justConfirmed: false, error: err.message };
  }
};

// ── Save user to Firestore (called from SignUp) ───────────────────────────────
export { uploadImageToImgbb };

export const saveUserToFirestore = async ({ name, email, district }) => {
  if (!email) return false;

  try {
    // Use email as the document ID (safe for Firestore doc keys after sanitization)
    const safeId = email.replace(/[.#$[\]]/g, '_');
    await setDoc(doc(db, 'users', safeId), {
      name:      name || '',
      email,
      district:  district || '',
      createdAt: serverTimestamp(),
    }, { merge: true });

    console.log(`✅ User ${email} saved to Firestore (district: ${district})`);
    return true;
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
    return false;
  }
};
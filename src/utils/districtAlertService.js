// src/utils/districtAlertService.js
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp, runTransaction, increment, arrayUnion } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const ALERT_THRESHOLD = 3;

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

const SEVERITY_RANK = { low: 1, medium: 2, high: 3 };
const higherSeverity = (a = 'medium', b = 'medium') => {
  const ra = SEVERITY_RANK[(a || 'medium').toLowerCase()] ?? 2;
  const rb = SEVERITY_RANK[(b || 'medium').toLowerCase()] ?? 2;
  return ra >= rb ? a : b;
};

const getDayKey = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });

const getClusterDocId = (district, dayKey = getDayKey()) =>
  `${district.replace(/\s+/g, '_')}_${dayKey}`;

const sendAlertEmail = async ({ toEmail, toName, district, alertCount, description, location }) => {
  if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' ||
      !EMAILJS_TEMPLATE_ID || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' ||
      !EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn('⚠️ EmailJS not configured.');
    return false;
  }

  const templateParams = {
    to_name: toName || 'Community Member',
    to_email: toEmail,
    district,
    alert_count: alertCount,
    description: description || 'Multiple community alerts reported.',
    location: location || district,
    report_time: new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' }),
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
    console.log(`✅ Email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send email to ${toEmail}:`, err);
    return false;
  }
};

export const getTodayDistrictReportCount = async (district) => {
  if (!district) return 0;
  try {
    const snap = await getDoc(doc(db, 'alerts', getClusterDocId(district)));
    return snap.exists() ? (snap.data().reportCount || 0) : 0;
  } catch (err) {
    console.error('Error fetching today district report count:', err);
    return 0;
  }
};

// ─── MAIN: Submit report with location ──────────────────────────────────────
export const submitDistrictReport = async ({
  district,
  description,
  severity,
  loc,
  location,
}) => {
  if (!district) return { reportCount: 0, status: 'pending', justConfirmed: false };

  const dayKey = getDayKey();
  const alertRef = doc(db, 'alerts', getClusterDocId(district, dayKey));

  let reportCount = 1;
  let status = 'pending';
  let justConfirmed = false;
  let usersNotified = 0;

  // Create a unique ID for this report (using timestamp + random)
  const reportId = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(alertRef);

      if (snap.exists()) {
        const data = snap.data();
        const wasConfirmed = data.status === 'confirmed';

        reportCount = (data.reportCount || 0) + 1;
        status = wasConfirmed || reportCount >= ALERT_THRESHOLD ? 'confirmed' : 'pending';
        justConfirmed = !wasConfirmed && status === 'confirmed';

        // Calculate highest severity among all reports
        const currentSeverity = data.severity || 'medium';
        const newSeverity = higherSeverity(currentSeverity, severity);

        // Add new report to the reports array
        const newReport = {
          id: reportId,
          description,
          severity,
          loc,
          location,
          createdAt: serverTimestamp(),
        };

        transaction.set(alertRef, {
          district,
          dayKey,
          reportCount,
          status,
          severity: newSeverity,
          // Keep first location as primary loc (optional)
          loc: data.loc || loc,
          location: data.location || location,
          updatedAt: serverTimestamp(),
          reports: arrayUnion(newReport), // Firebase arrayUnion to add unique report
        }, { merge: true });
      } else {
        status = ALERT_THRESHOLD <= 1 ? 'confirmed' : 'pending';
        justConfirmed = status === 'confirmed';

        const firstReport = {
          id: reportId,
          description,
          severity,
          loc,
          location,
          createdAt: serverTimestamp(),
        };

        transaction.set(alertRef, {
          title: 'Community Report',
          district,
          dayKey,
          reportCount: 1,
          status,
          severity,
          loc,
          location,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          reports: [firstReport], // Array with first report
        });
      }
    });

    if (justConfirmed) {
      console.log(`🚨 "${district}" hit ${ALERT_THRESHOLD} reports today — confirming + notifying residents.`);

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
        usersNotified = users.length;
      }
    }

    return { reportCount, status, justConfirmed, usersNotified };
  } catch (err) {
    console.error('Error in submitDistrictReport:', err);
    return { reportCount: 0, status: 'pending', justConfirmed: false, error: err.message };
  }
};

export const saveUserToFirestore = async ({ name, email, district }) => {
  if (!email) return false;
  try {
    const safeId = email.replace(/[.#$[\]]/g, '_');
    await setDoc(doc(db, 'users', safeId), {
      name: name || '',
      email,
      district: district || '',
      createdAt: serverTimestamp(),
    }, { merge: true });
    console.log(`✅ User ${email} saved to Firestore (district: ${district})`);
    return true;
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
    return false;
  }
};
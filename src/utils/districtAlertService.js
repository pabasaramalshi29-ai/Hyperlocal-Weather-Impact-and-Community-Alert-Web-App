// src/utils/districtAlertService.js
import { db } from "../firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc,
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  runTransaction 
} from "firebase/firestore";
import emailjs from "@emailjs/browser";

// --- Configuration ---
const ALERT_THRESHOLD = 3;

export const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", 
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", 
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", 
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", 
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

/**
 * Saves or updates a user profile in Firestore to capture their location/district for alerts
 */
export const saveUserToFirestore = async (userData) => {
  if (!userData || !userData.email) return;
  
  try {
    const safeDocId = userData.email.replace(/[.#$[\]]/g, "_");
    const userRef = doc(db, "users", safeDocId);
    
    await setDoc(userRef, {
      name: userData.name || "Anonymous User",
      email: userData.email,
      district: userData.district || "",
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log(`User profile successfully mapped to district: ${userData.district}`);
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    throw error;
  }
};

/**
 * Sends weather alert emails to all registered users in a specific district using EmailJS
 */
export const sendDistrictEmailAlerts = async (district, weatherCondition, severity) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("district", "==", district));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No registered users found in ${district} to notify.`);
      return;
    }

    console.log(`Initializing automated EmailJS alerts for ${querySnapshot.size} users in ${district}...`);

    querySnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      
      const templateParams = {
        to_name: userData.name,
        to_email: userData.email,
        district_name: district,
        weather_status: weatherCondition,
        alert_level: severity || "Warning",
        message: `Emergency Weather Notification: Severe ${weatherCondition} conditions have been reported in ${district}. Please take necessary precautions.`
      };

      emailjs.send(
        "YOUR_SERVICE_ID",     // Replace with your real EmailJS Service ID
        "YOUR_TEMPLATE_ID",    // Replace with your real EmailJS Template ID
        templateParams,
        "YOUR_PUBLIC_KEY"      // Replace with your real EmailJS Public Key
      )
      .then((response) => {
         console.log(`Alert dispatch success to ${userData.email}:`, response.status, response.text);
      })
      .catch((err) => {
         console.error(`Failed to dispatch email to ${userData.email}:`, err);
      });
    });

  } catch (error) {
    console.error("Critical error inside district alerting system:", error);
  }
};

/**
 * Fetches the number of weather reports submitted today for a specific district
 */
export const getTodayDistrictReportCount = async (district) => {
  try {
    if (!district) return 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const reportsRef = collection(db, "reports"); 
    const q = query(
      reportsRef,
      where("district", "==", district),
      where("createdAt", ">=", startOfToday)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching today's report count:", error);
    return 0;
  }
};

/**
 * Submits a new weather report for a specific district and triggers email alerts
 * (This fixes the missing export named 'submitDistrictReport' error)
 */
export const submitDistrictReport = async (reportData) => {
  try {
    if (!reportData || !reportData.district) {
      throw new Error("Invalid report data provided.");
    }

    const reportsRef = collection(db, "reports");
    
    // 1. Report එක Firestore එකට Save කිරීම
    const finalReport = {
      ...reportData,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(reportsRef, finalReport);
    console.log("Report submitted successfully with ID:", docRef.id);

    // 2. අද දිනට මේ දිස්ත්‍රික්කයෙන් ලැබුණු මුළු reports ගණන බැලීම
    const todayCount = await getTodayDistrictReportCount(reportData.district);
    
    // 3. Reports ගණන සීමාව ඉක්මවා ඇත්නම් දිස්ත්‍රික්කයේ අයට Email Alerts යැවීම
    if (todayCount >= ALERT_THRESHOLD) {
      console.log(`Alert threshold (${ALERT_THRESHOLD}) reached for ${reportData.district}! Sending emails...`);
      await sendDistrictEmailAlerts(
        reportData.district, 
        reportData.weatherCondition || reportData.condition || "Severe Weather", 
        reportData.severity || "High Alert"
      );
    }

    return docRef.id;
  } catch (error) {
    console.error("Error in submitDistrictReport:", error);
    throw error;
  }
};
// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navbar
      nav_home: "Home",
      nav_alerts: "Alerts",
      nav_map: "Map",
      nav_report: "Report",
      // Home Page
      hero_title: "Hyperlocal Weather Impact & Community Alerts",
      hero_sub: "Get real-time weather updates and community alerts for your area.",
      search_placeholder: "Enter your location...",
      btn_search: "Search",
      card_curr_weather: "Current Weather",
      card_priority_alert: "High Priority Alert",
      alert_msg: "Heavy rain expected in your area. Prepare for localized flooding in low-lying areas.",
      btn_view_details: "View Details",
      // Login Page
      login_welcome: "Welcome Back",
      login_sub: "Sign in to your account to continue",
      login_or: "or",
      login_btn: "Sign In",
      login_no_acc: "Don't have an account?",
      login_signup_here: "Sign up here",
      login_footer: "Stay updated with real-time weather alerts",
      // SignUp Page
      signup_title: "Create Account",
      signup_sub: "Join our community to report and track weather impacts",
      signup_btn: "Create Account",
      signup_btn_loading: "Creating Account...",
      signup_have_acc: "Already have an account?",
      signup_login_here: "Sign in here",
      signup_terms: "I agree to the Terms of Service and Privacy Policy",
      signup_footer: "Secure and private • No spam • Cancel anytime",
      // Alerts Page
      alerts_title: "Community Alerts",
      alerts_loading: "Loading live alerts...",
      alerts_empty: "No alerts reported yet.",
      // Report Page
      report_title: "Report Weather Impact / Alert",
      report_loc_label: "Location Name / Landmark",
      report_desc_label: "Description of the Impact",
      report_severity_label: "Severity Level",
      report_upload_label: "Upload Image (optional)",
      report_map_label: "Click on the map to mark the exact spot:",
      report_btn_submit: "Submit Alert",
      report_btn_submitting: "Submitting...",
      report_success: "Alert Submitted Successfully!",
      report_success_sub: "Thank you for keeping the community safe.",
      report_btn_new: "Report Another Alert",
      // Map Page
      map_title: "Weather Map",
      map_sub: "Track live alert zones and weather impact.",
      map_btn_center: "Center on Sri Lanka"
    }
  },
  si: {
    translation: {
      // Navbar
      nav_home: "මුල් පිටුව",
      nav_alerts: "දැනුම්දීම්",
      nav_map: "සිතියම",
      nav_report: "වාර්තා කිරීම",
      // Home Page
      hero_title: "ප්‍රදේශීය කාලගුණ බලපෑම් සහ ප්‍රජා දැනුම්දීම්",
      hero_sub: "ඔබේ ප්‍රදේශයේ තත්කාලීන කාලගුණ යාවත්කාලීන කිරීම් සහ ප්‍රජා දැනුම්දීම් ලබා ගන්න.",
      search_placeholder: "ඔබේ ස්ථානය ඇතුළත් කරන්න...",
      btn_search: "සොයන්න",
      card_curr_weather: "වත්මන් කාලගුණය",
      card_priority_alert: "ඉහළ ප්‍රමුඛතා දැනුම්දීම",
      alert_msg: "ඔබේ ප්‍රදේශයට තද වැසි අපේක්ෂා කෙරේ. පහත් බිම්වල සුළු ගංවතුර තත්ත්වයන් සඳහා සූදානම් වන්න.",
      btn_view_details: "විස්තර බලන්න",
      // Login Page
      login_welcome: "නැවතත් සාදරයෙන් පිළිගනිමු",
      login_sub: "ඉදිරියට යාමට ඔබේ ගිණුමට ලොග් වන්න",
      login_or: "නැතහොත්",
      login_btn: "ඇතුළු වන්න",
      login_no_acc: "ගිණුමක් නොමැතිද?",
      login_signup_here: "මෙහි ලියාපදිංචි වන්න",
      login_footer: "තත්කාලීන කාලගුණ දැනුම්දීම් සමඟ සැමවිටම යාවත්කාලීන වන්න",
      // SignUp Page
      signup_title: "ගිණුමක් සාදන්න",
      signup_sub: "කාලගුණ බලපෑම් වාර්තා කිරීමට සහ නිරීක්ෂණය කිරීමට අපගේ ප්‍රජාව හා සම්බන්ධ වන්න",
      signup_btn: "ගිණුම සාදන්න",
      signup_btn_loading: "ගිණුම සාදමින් පවතී...",
      signup_have_acc: "දැනටමත් ගිණුමක් තිබේද?",
      signup_login_here: "මෙහි ඇතුළු වන්න",
      signup_terms: "මම සේවා කොන්දේසි සහ රීති වලට එකඟ වෙමි",
      signup_footer: "ආරක්ෂිත සහ පෞද්ගලිකයි • අනවශ්‍ය පණිවිඩ එවනු නොලැබේ",
      // Alerts Page
      alerts_title: "ප්‍රජා දැනුම්දීම්",
      alerts_loading: "දැනුම්දීම් ලෝඩ් වෙමින් පවතී...",
      alerts_empty: "තවමත් කිසිදු දැනුම්දීමක් වාර්තා වී නොමැත.",
      // Report Page
      report_title: "කාලගුණ බලපෑම් / අනතුරු ඇඟවීම් වාර්තා කරන්න",
      report_loc_label: "ස්ථානයේ නම / සලකුණ",
      report_desc_label: "බලපෑම පිළිබඳ විස්තරය",
      report_severity_label: "බලපෑමේ මට්ටම (Severity)",
      report_upload_label: "ඡායාරූපයක් එක් කරන්න (අනිවාර්ය නැත)",
      report_map_label: "නිවැරදිම ස්ථානය සලකුණු කිරීමට සිතියම මත ක්ලික් කරන්න:",
      report_btn_submit: "දැනුම්දීම ඉදිරිපත් කරන්න",
      report_btn_submitting: "ඉදිරිපත් කරමින් පවතී...",
      report_success: "දැනුම්දීම සාර්ථකව ඉදිරිපත් කරන ලදී!",
      report_success_sub: "ප්‍රජාව ආරක්ෂිතව තැබීමට දායක වීම ගැන ස්තූතියි.",
      report_btn_new: "තවත් දැනුම්දීමක් වාර්තා කරන්න",
      // Map Page
      map_title: "කාලගුණ සිතියම",
      map_sub: "සජීවී අනතුරු ඇඟවීම් කලාප සහ කාලගුණ බලපෑම් නිරීක්ෂණය කරන්න.",
      map_btn_center: "ශ්‍රී ලංකාව මැදට ගන්න"
    }
  },
  ta: {
    translation: {
      // Navbar
      nav_home: "முகப்பு",
      nav_alerts: "அறிவிப்புகள்",
      nav_map: "வரைபடம்",
      nav_report: "அறிக்கையிடல்",
      // Home Page
      hero_title: "உள்ளூர் வானிலை பாதிப்பு மற்றும் சமூக விழிப்பூட்டல்கள்",
      hero_sub: "உங்கள் பகுதிக்கான நிகழ்நேர வானிலை அறிவிப்புகள் மற்றும் சமூக விழிப்பூட்டல்களைப் பெறுங்கள்.",
      search_placeholder: "உங்கள் இருப்பிடத்தை உள்ளிடவும்...",
      btn_search: "தேடு",
      card_curr_weather: "தற்போதைய வானிலை",
      card_priority_alert: "உயர் முன்னுரிமை அறிவிப்பு",
      alert_msg: "உங்கள் பகுதியில் பலத்த மழை எதிர்பார்க்கப்படுகிறது. தாழ்வான பகுதிகளில் வெள்ளம் ஏற்பட வாய்ப்புள்ளது, தயாராக இருக்கவும்.",
      btn_view_details: "விவரங்களைப் பார்",
      // Login Page
      login_welcome: "மீண்டும் வரவேற்கிறோம்",
      login_sub: "தொடர உங்கள் கணக்கில் உள்நுழையவும்",
      login_or: "அல்லது",
      login_btn: "உள்நுழை",
      login_no_acc: "கணக்கு இல்லையா?",
      login_signup_here: "இங்கே பதிவு செய்க",
      login_footer: "நிகழ்நேர வானிலை விழிப்பூட்டல்களுடன் புதுப்பித்த நிலையில் இருங்கள்",
      // SignUp Page
      signup_title: "கணக்கை உருவாக்கு",
      signup_sub: "வானிலை பாதிப்புகளைப் புகாரளிக்கவும் கண்காணிக்கவும் எங்கள் சமூகத்தில் இணையுங்கள்",
      signup_btn: "கணக்கை உருவாக்கு",
      signup_btn_loading: "கணக்கு உருவாக்கப்படுகிறது...",
      signup_have_acc: "ஏற்கனவே கணக்கு உள்ளதா?",
      signup_login_here: "இங்கே உள்நுழைக",
      signup_terms: "சேவை விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை நான் ஒப்புக்கொள்கிறேன்",
      signup_footer: "பாதுகாப்பானது மற்றும் தனிப்பட்டது • ஸ்பேம் இல்லை",
      // Alerts Page
      alerts_title: "சமூக அறிவிப்புகள்",
      alerts_loading: "அறிவிப்புகள் ஏற்றப்படுகின்றன...",
      alerts_empty: "இன்னும் அறிவிப்புகள் எதுவும் புகாரளிக்கப்படவில்லை.",
      // Report Page
      report_title: "வானிலை பாதிப்பு / விழிப்பூட்டலைப் புகாரளிக்கவும்",
      report_loc_label: "இருப்பிடத்தின் பெயர் / அடையாளம்",
      report_desc_label: "பாதிப்பு பற்றிய விபரம்",
      report_severity_label: "தீவிரத்தன்மை நிலை",
      report_upload_label: "படம் பதிவேற்றவும் (விருப்பத்திற்குரியது)",
      report_map_label: "சரியான இடத்தை அடையாளப்படுத்த வரைபடத்தில் கிளிக் செய்யவும்:",
      report_btn_submit: "அறிவிப்பைச் சமர்ப்பி",
      report_btn_submitting: "சமர்ப்பிக்கப்படுகிறது...",
      report_success: "அறிவிப்பு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!",
      report_success_sub: "சமூகத்தைப் பாதுகாப்பாக வைத்திருப்பதற்கு நன்றி.",
      report_btn_new: "மற்றொரு அறிவிப்பைப் புகாரளிக்கவும்",
      // Map Page
      map_title: "வானிலை வரைபடம்",
      map_sub: "நேரடி விழிப்பூட்டல் மண்டலங்கள் மற்றும் வானிலை பாதிப்புகளைக் கண்காணிக்கவும்.",
      map_btn_center: "இலங்கையை மையப்படுத்துக"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default Language
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
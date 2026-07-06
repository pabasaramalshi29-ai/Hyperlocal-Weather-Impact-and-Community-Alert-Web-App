// 25 district capitals of Sri Lanka
export const SRI_LANKA_CITIES = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle"
];

export const ALERT_TYPES = [
  { value: "flood", label: "Flood", icon: "fa-water" },
  { value: "storm", label: "Storm", icon: "fa-bolt" },
  { value: "heavy-rain", label: "Heavy Rain", icon: "fa-cloud-showers-heavy" },
  { value: "high-wind", label: "High Wind", icon: "fa-wind" },
  { value: "landslide", label: "Landslide", icon: "fa-mountain" },
  { value: "fire", label: "Fire", icon: "fa-fire" },
  { value: "power-outage", label: "Power Outage", icon: "fa-plug" },
  { value: "other", label: "Other", icon: "fa-exclamation-circle" }
];

// Threshold: city needs at least this many reports of the same type to become an active alert
export const ALERT_THRESHOLD = 3;

// Approximate lat/lng for each city — used by the Map page
export const CITY_COORDINATES = {
  "Colombo": { lat: 6.9271, lng: 79.8612 },
  "Gampaha": { lat: 7.0840, lng: 79.9920 },
  "Kalutara": { lat: 6.5854, lng: 79.9607 },
  "Kandy": { lat: 7.2906, lng: 80.6337 },
  "Matale": { lat: 7.4675, lng: 80.6234 },
  "Nuwara Eliya": { lat: 6.9497, lng: 80.7891 },
  "Galle": { lat: 6.0535, lng: 80.2210 },
  "Matara": { lat: 5.9549, lng: 80.5550 },
  "Hambantota": { lat: 6.1241, lng: 81.1185 },
  "Jaffna": { lat: 9.6615, lng: 80.0255 },
  "Kilinochchi": { lat: 9.3961, lng: 80.4042 },
  "Mannar": { lat: 8.9810, lng: 79.9043 },
  "Vavuniya": { lat: 8.7514, lng: 80.4971 },
  "Mullaitivu": { lat: 9.2671, lng: 80.8142 },
  "Batticaloa": { lat: 7.7172, lng: 81.7000 },
  "Ampara": { lat: 7.2978, lng: 81.6747 },
  "Trincomalee": { lat: 8.5874, lng: 81.2152 },
  "Kurunegala": { lat: 7.4863, lng: 80.3647 },
  "Puttalam": { lat: 8.0362, lng: 79.8283 },
  "Anuradhapura": { lat: 8.3114, lng: 80.4037 },
  "Polonnaruwa": { lat: 7.9403, lng: 81.0188 },
  "Badulla": { lat: 6.9934, lng: 81.0550 },
  "Monaragala": { lat: 6.8728, lng: 81.3507 },
  "Ratnapura": { lat: 6.6828, lng: 80.3992 },
  "Kegalle": { lat: 7.2513, lng: 80.3464 }
};

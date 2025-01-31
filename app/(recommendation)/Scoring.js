import contentBasedMatch from "./ContentBased";
import { getDistance } from "geolib";

// Google Maps API Key
const GOOGLE_API_KEY = "AIzaSyDF6yHbRQ7JvSLoW-HyygByuI2vz0la3Kc"; // Replace with your key

// 🔹 Cache API Responses to Avoid Repeated Calls
const locationCache = new Map();

// Function to fetch latitude and longitude using Google Geocoding API
const fetchCoordinates = async (district, province) => {
  const locationKey = `${district},${province}`; // Create cache key

  if (locationCache.has(locationKey)) return locationCache.get(locationKey);

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    locationKey
  )}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const coords = data.results[0].geometry.location;
      locationCache.set(locationKey, { latitude: coords.lat, longitude: coords.lng });
      return { latitude: coords.lat, longitude: coords.lng };
    } else {
      console.error(`Error fetching coordinates for ${locationKey}: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching coordinates for ${locationKey}:`, error);
    return null;
  }
};

// 🔹 Function to calculate the location score
export const calculateLocationScore = async (currentUser, otherUser, maxDistance = 10000) => {
  try {
    const coords1 = await fetchCoordinates(currentUser.district, currentUser.province);
    const coords2 = await fetchCoordinates(otherUser.district, otherUser.province);

    if (!coords1 || !coords2) {
      console.error("Unable to fetch coordinates for one or both users.");
      return 0;
    }

    const distance = getDistance(
      { latitude: coords1.latitude, longitude: coords1.longitude },
      { latitude: coords2.latitude, longitude: coords2.longitude }
    ) / 1000;

    return distance > maxDistance ? 0 : 1 - distance / maxDistance;
  } catch (error) {
    console.error("Error calculating location score:", error);
    return 0;
  }
};

// 🔹 Function to calculate preference score using set similarity
export const calculatePreferenceScore = (currentHobbies, otherHobbies) => {
  if (!currentHobbies.length || !otherHobbies.length) return 0;

  const set1 = new Set(currentHobbies);
  const set2 = new Set(otherHobbies);
  const intersection = [...set1].filter((hobby) => set2.has(hobby)).length;
  const union = set1.size + set2.size - intersection;

  return union === 0 ? 0 : intersection / union;
};

// 🔹 Function to normalize and calculate rating score
export const calculateRatingScore = (rating, maxRating = 5) => {
  return rating > 0 ? rating / maxRating : 0;
};
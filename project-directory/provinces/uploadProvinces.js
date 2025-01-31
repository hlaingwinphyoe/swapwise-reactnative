const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK
const serviceAccount = require("./service-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read the JSON file
const provincesData = JSON.parse(fs.readFileSync("./provinces.json", "utf-8"));

// Function to upload provinces to Firestore
const uploadProvinces = async () => {
  try {
    const provinces = provincesData.provinces;

    for (const province of provinces) {
      // Create a document for each province
      const docRef = db.collection("provinces").doc(province.name);
      await docRef.set({
        districts: province.districts,
      });
      console.log(`Uploaded: ${province.name}`);
    }

    console.log("All provinces uploaded successfully!");
  } catch (error) {
    console.error("Error uploading provinces: ", error);
  }
};

// Run the upload function
uploadProvinces();

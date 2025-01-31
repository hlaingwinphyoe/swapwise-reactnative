const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK
const serviceAccount = require("./service-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read the JSON file
const universitiesData = JSON.parse(fs.readFileSync("./universities.json", "utf-8"));

// Function to upload universities to Firestore
const uploadUniversities = async () => {
  try {
    const universities = universitiesData.universities;

    for (const university of universities) {
      // Create a document for each university
      const docRef = db.collection("universities").doc(university);
      await docRef.set({
        name: university,
      });
      console.log(`Uploaded: ${university}`);
    }

    console.log("All universities uploaded successfully!");
  } catch (error) {
    console.error("Error uploading universities: ", error);
  }
};

// Run the upload function
uploadUniversities();

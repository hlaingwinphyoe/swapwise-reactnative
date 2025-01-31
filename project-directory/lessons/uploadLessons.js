const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK
const serviceAccount = require("./service-key.json"); // Ensure this file exists in the same folder

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read the JSON file
const lessonsData = JSON.parse(fs.readFileSync("./lessons.json", "utf-8"));

// Function to upload lessons to Firestore
const uploadLessons = async () => {
  try {
    const lessons = lessonsData.lessons;

    for (const lesson of lessons) {
      // Create a document for each category
      const docRef = db.collection("lessons").doc(lesson.categories);
      await docRef.set({
        names: lesson.names,
      });
      console.log(`Uploaded: ${lesson.categories}`);
    }

    console.log("All lessons uploaded successfully!");
  } catch (error) {
    console.error("Error uploading lessons: ", error);
  }
};

// Run the upload function
uploadLessons();

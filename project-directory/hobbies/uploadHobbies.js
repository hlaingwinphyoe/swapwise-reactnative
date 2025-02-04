const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK
const serviceAccount = require("./service-key.json"); // Ensure this file exists in the same folder

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read the JSON file
const hobbiesData = JSON.parse(fs.readFileSync("./hobbies.json", "utf-8"));

// Function to upload hobbies to Firestore
const uploadHobbies = async () => {
  try {
    const hobbies = hobbiesData.hobbies;

    for (const hobby of hobbies) {
      // Create a document for each category
      const docRef = db.collection("hobbies").doc(hobby.categories);
      await docRef.set({
        names: hobby.names,
      });
      console.log(`Uploaded: ${hobby.categories}`);
    }

    console.log("All hobbies uploaded successfully!");
  } catch (error) {
    console.error("Error uploading hobbies:", error);
  }
};

// Run the upload function
uploadHobbies();

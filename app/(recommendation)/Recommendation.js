import contentBasedMatch from "./ContentBased";
import {
  calculateLocationScore,
  calculatePreferenceScore,
  calculateRatingScore,
} from "./Scoring";

export const recommendProfiles = async (currentUser, users) => {
  const matches = contentBasedMatch(currentUser, users);

  if (matches.length === 0) {
    console.log("No mutual matches found.");
    return [];
  }

  // 🔹 Compute scores for each matched user
  const scoredUsers = await Promise.all(
    matches.map(async (user) => {
      const locationScore = await calculateLocationScore(currentUser, user);
      const preferenceScore = calculatePreferenceScore(
        currentUser.hobbies || [],
        user.hobbies || []
      );
      const ratingScore = calculateRatingScore(user.rating || 0);

      // 🔹 Weighted scoring: 40% Location, 30% Preference, 30% Rating
      const totalScore =
        0.4 * locationScore + 0.3 * preferenceScore + 0.3 * ratingScore;

      // Debug logs
      console.log(`--- Scoring for ${user.name} ---`);
      console.log(`Location Score: ${locationScore}`);
      console.log(`Preference Score: ${preferenceScore}`);
      console.log(`Rating Score: ${ratingScore}`);
      console.log(`Total Score: ${totalScore}`);
      console.log(`------------------------------`);

      return { ...user, totalScore };
    })
  );

  // 🔹 Sort by highest score
  return scoredUsers.sort((a, b) => b.totalScore - a.totalScore);
};

export default recommendProfiles;

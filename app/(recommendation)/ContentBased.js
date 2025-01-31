// ContentBased.js
export const contentBasedMatch = (currentUser, users) => {
  return users.filter((user) => {
    const teachLearnMatch =
      currentUser.teach?.some((teach) => user.learn?.includes(teach)) || false;
    const learnTeachMatch =
      user.teach?.some((teach) => currentUser.learn?.includes(teach)) || false;

    return teachLearnMatch && learnTeachMatch; // Only return users who satisfy both conditions
  });
};

export default contentBasedMatch;

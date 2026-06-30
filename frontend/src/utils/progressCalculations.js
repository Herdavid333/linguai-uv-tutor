export const calculateProgressStats = (practiceHistory = []) => {
  const activitiesCompleted = practiceHistory.length;
  const practiceSessions = practiceHistory.length;

  const uniqueTopics = new Set(
    practiceHistory
      .map((item) => item.topicId)
      .filter(Boolean)
  );

  const topicsLearned = uniqueTopics.size;

  const learningStreak = calculateLearningStreak(practiceHistory);

  return {
    activitiesCompleted,
    practiceSessions,
    topicsLearned,
    learningStreak,
  };
};

export const calculateUnitProgress = (practiceHistory = [], learningUnits = []) => {
  return learningUnits.map((unit) => {
    const unitPractices = practiceHistory.filter(
      (item) => item.unitId === unit.id
    );

    const unitTopics = unit.topics?.length || 1;

    const practicedTopics = new Set(
      unitPractices
        .map((item) => item.topicId)
        .filter(Boolean)
    ).size;

    const progress = Math.min(
      Math.round((practicedTopics / unitTopics) * 100),
      100
    );

    return {
      id: unit.id,
      unitTitle: `${unit.shortTitle} - ${unit.title}`,
      score: progress,
    };
  });
};

const calculateLearningStreak = (practiceHistory = []) => {
  if (practiceHistory.length === 0) return 0;

  const practiceDates = new Set(
    practiceHistory
      .map((item) => {
        const date = item.startedAt?.toDate
          ? item.startedAt.toDate()
          : new Date(item.startedAt);

        if (Number.isNaN(date.getTime())) return null;

        return date.toISOString().split("T")[0];
      })
      .filter(Boolean)
  );

  let streak = 0;
  const currentDate = new Date();

  while (true) {
    const dateKey = currentDate.toISOString().split("T")[0];

    if (practiceDates.has(dateKey)) {
      streak += 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
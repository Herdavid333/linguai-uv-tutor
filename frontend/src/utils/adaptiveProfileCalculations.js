/**
 * Construye el perfil adaptativo longitudinal del estudiante
 * usando su historial de prácticas.
 *
 * No modifica Firestore.
 */

const normalizeMetric = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.min(
    100,
    Math.max(0, Math.round(numericValue))
  );
};

const calculateAverage = (values = []) => {
  const validValues = values
    .map(normalizeMetric)
    .filter((value) => value !== null);

  if (validValues.length === 0) {
    return null;
  }

  return Math.round(
    validValues.reduce(
      (sum, value) => sum + value,
      0
    ) / validValues.length
  );
};

const normalizeText = (value) => {
  return typeof value === "string"
    ? value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
    : "";
};

const getSkillLevel = (score) => {
  const normalizedScore =
    normalizeMetric(score);

  if (normalizedScore === null) {
    return "unknown";
  }

  if (normalizedScore < 50) {
    return "needs_support";
  }

  if (normalizedScore < 70) {
    return "developing";
  }

  if (normalizedScore < 86) {
    return "competent";
  }

  return "strong";
};

const getRecommendedDifficulty = ({
  averageScore,
  performance,
}) => {
  const availableValues = [
    averageScore,
    performance.accuracy,
    performance.grammar,
    performance.vocabulary,
    performance.interaction,
  ].filter((value) =>
    Number.isFinite(Number(value))
  );

  if (availableValues.length === 0) {
    return "beginner_standard";
  }

  const overall = Math.round(
    availableValues.reduce(
      (sum, value) => sum + Number(value),
      0
    ) / availableValues.length
  );

  if (overall < 50) {
    return "beginner_supported";
  }

  if (overall < 70) {
    return "beginner_standard";
  }

  if (overall < 86) {
    return "beginner_challenging";
  }

  return "pre_intermediate_transition";
};

const getCorrectionIntensity = ({
  grammar,
  accuracy,
  frequentErrors,
}) => {
  const importantErrors =
    frequentErrors.filter(
      (error) => error.occurrences >= 2
    ).length;

  if (
    grammar === null &&
    accuracy === null
  ) {
    return "balanced";
  }

  if (
    Number(grammar) < 55 ||
    Number(accuracy) < 55 ||
    importantErrors >= 4
  ) {
    return "guided";
  }

  if (
    Number(grammar) >= 80 &&
    Number(accuracy) >= 80
  ) {
    return "selective";
  }

  return "balanced";
};

const getQuestionStyle = ({
  interaction,
  recommendedDifficulty,
}) => {
  if (
    interaction !== null &&
    interaction < 55
  ) {
    return "closed_with_examples";
  }

  if (
    recommendedDifficulty ===
      "beginner_challenging" ||
    recommendedDifficulty ===
      "pre_intermediate_transition"
  ) {
    return "open_guided";
  }

  return "guided_open";
};

const getResponseLength = ({
  interaction,
  vocabulary,
}) => {
  if (
    interaction !== null &&
    interaction < 50
  ) {
    return "very_short";
  }

  if (
    vocabulary !== null &&
    vocabulary < 55
  ) {
    return "short";
  }

  return "short_complete";
};

const getScaffoldingLevel = ({
  grammar,
  vocabulary,
  interaction,
}) => {
  const values = [
    grammar,
    vocabulary,
    interaction,
  ].filter((value) =>
    Number.isFinite(Number(value))
  );

  if (values.length === 0) {
    return "medium";
  }

  const average =
    values.reduce(
      (sum, value) =>
        sum + Number(value),
      0
    ) / values.length;

  if (average < 55) {
    return "high";
  }

  if (average < 75) {
    return "medium";
  }

  return "low";
};

const calculateFrequentErrors = (
  practiceHistory = []
) => {
  const errorsMap = new Map();

  practiceHistory.forEach((practice) => {
    const corrections = Array.isArray(
      practice?.corrections
    )
      ? practice.corrections
      : [];

    corrections.forEach((correction) => {
      const wrong =
        typeof correction?.wrong ===
        "string"
          ? correction.wrong.trim()
          : "";

      const correct =
        typeof correction?.correct ===
        "string"
          ? correction.correct.trim()
          : "";

      if (!wrong || !correct) {
        return;
      }

      const type =
        normalizeText(
          correction?.type
        ) || "other";

      const key = [
        type,
        normalizeText(wrong),
        normalizeText(correct),
      ].join("|");

      const storedOccurrences =
        Number(
          correction?.occurrences
        );

      const occurrences =
        Number.isFinite(
          storedOccurrences
        ) &&
        storedOccurrences > 0
          ? storedOccurrences
          : 1;

      const current =
        errorsMap.get(key);

      if (current) {
        current.occurrences +=
          occurrences;

        if (
          !current.explanation &&
          correction?.explanation
        ) {
          current.explanation =
            correction.explanation;
        }

        return;
      }

      errorsMap.set(key, {
        type,
        wrong,
        correct,
        explanation:
          correction?.explanation ||
          "",
        occurrences,
      });
    });
  });

  return Array.from(
    errorsMap.values()
  )
    .sort(
      (first, second) =>
        second.occurrences -
        first.occurrences
    )
    .slice(0, 8);
};

const calculateLearnedVocabulary = (
  practiceHistory = []
) => {
  const vocabularyMap = new Map();

  practiceHistory.forEach((practice) => {
    const words = Array.isArray(
      practice?.newWords
    )
      ? practice.newWords
      : [];

    words.forEach((item) => {
      const word =
        typeof item === "string"
          ? item.trim()
          : String(
              item?.word ?? ""
            ).trim();

      if (!word) {
        return;
      }

      const key =
        word.toLowerCase();

      if (
        !vocabularyMap.has(key)
      ) {
        vocabularyMap.set(key, {
          word,
          meaning:
            typeof item === "object"
              ? item?.meaning || ""
              : "",
        });
      }
    });
  });

  return Array.from(
    vocabularyMap.values()
  ).slice(0, 20);
};

const buildTeachingPriorities = ({
  performance,
  frequentErrors,
}) => {
  const priorities = [];

  if (
    performance.grammar !== null &&
    performance.grammar < 65
  ) {
    priorities.push(
      "Reinforce the target grammar with short examples and guided reformulation."
    );
  }

  if (
    performance.vocabulary !== null &&
    performance.vocabulary < 65
  ) {
    priorities.push(
      "Use familiar A1 vocabulary and introduce no more than one useful new expression at a time."
    );
  }

  if (
    performance.interaction !== null &&
    performance.interaction < 65
  ) {
    priorities.push(
      "Ask one clear question at a time and provide answer starters when the student hesitates."
    );
  }

  if (
    performance.accuracy !== null &&
    performance.accuracy < 65
  ) {
    priorities.push(
      "Check whether the student's response communicates the intended meaning before increasing difficulty."
    );
  }

  if (frequentErrors.length > 0) {
    const mainErrors =
      frequentErrors
        .slice(0, 3)
        .map(
          (error) =>
            `${error.wrong} → ${error.correct}`
        )
        .join("; ");

    priorities.push(
      `Naturally reinforce recurring errors when relevant: ${mainErrors}.`
    );
  }

  if (priorities.length === 0) {
    priorities.push(
      "Maintain the current level and gradually encourage longer, more independent responses."
    );
  }

  return priorities;
};

const getWeakestSkill = (
  performance = {}
) => {
  const availableSkills = [
    {
      name: "accuracy",
      value: performance.accuracy,
    },
    {
      name: "grammar",
      value: performance.grammar,
    },
    {
      name: "vocabulary",
      value: performance.vocabulary,
    },
    {
      name: "interaction",
      value: performance.interaction,
    },
  ].filter((skill) =>
    Number.isFinite(
      Number(skill.value)
    )
  );

  if (
    availableSkills.length === 0
  ) {
    return null;
  }

  availableSkills.sort(
    (firstSkill, secondSkill) =>
      Number(firstSkill.value) -
      Number(secondSkill.value)
  );

  return availableSkills[0].name;
};

const getStrongestSkill = (
  performance = {}
) => {
  const availableSkills = [
    {
      name: "accuracy",
      value: performance.accuracy,
    },
    {
      name: "grammar",
      value: performance.grammar,
    },
    {
      name: "vocabulary",
      value: performance.vocabulary,
    },
    {
      name: "interaction",
      value: performance.interaction,
    },
  ].filter((skill) =>
    Number.isFinite(
      Number(skill.value)
    )
  );

  if (
    availableSkills.length === 0
  ) {
    return null;
  }

  availableSkills.sort(
    (firstSkill, secondSkill) =>
      Number(secondSkill.value) -
      Number(firstSkill.value)
  );

  return availableSkills[0].name;
};

const buildFeedbackStrategy = ({
  performance,
  frequentErrors = [],
  evaluatedPractices = 0,
}) => {
  const weakestSkill =
    getWeakestSkill(performance);

  const strongestSkill =
    getStrongestSkill(performance);

  const grammarScore =
    Number(performance?.grammar);

  const interactionScore =
    Number(performance?.interaction);

  const accuracyScore =
    Number(performance?.accuracy);

  const hasReliableHistory =
    evaluatedPractices >= 2;

  let correctionMode =
    "balanced";

  if (
    hasReliableHistory &&
    (
      grammarScore < 60 ||
      accuracyScore < 60
    )
  ) {
    correctionMode =
      "guided";
  } else if (
    hasReliableHistory &&
    grammarScore >= 80 &&
    accuracyScore >= 80
  ) {
    correctionMode =
      "selective";
  }

  let interactionSupport =
    "standard";

  if (
    hasReliableHistory &&
    interactionScore < 60
  ) {
    interactionSupport =
      "high";
  } else if (
    hasReliableHistory &&
    interactionScore >= 80
  ) {
    interactionSupport =
      "low";
  }

  const recurringTargets =
    frequentErrors
      .slice(0, 3)
      .map((error) => ({
        type:
          error?.type || "other",

        wrong:
          error?.wrong || "",

        correct:
          error?.correct || "",

        occurrences:
          Number(
            error?.occurrences || 1
          ),
      }));

  return {
    hasReliableHistory,

    weakestSkill,
    strongestSkill,

    correctionMode,
    interactionSupport,

    maximumCorrectionsPerTurn:
      correctionMode === "guided"
        ? 2
        : 1,

    requestReformulation:
      correctionMode === "guided",

    praiseSpecificStrength:
      true,

    recurringTargets,
  };
};

export const buildAdaptiveStudentProfile = (
  practiceHistory = []
) => {
  const history = Array.isArray(
    practiceHistory
  )
    ? practiceHistory
    : [];

  const completedPractices =
    history.filter(
      (practice) =>
        practice?.status ===
        "completed"
    );

  const evaluatedPractices =
    completedPractices.filter(
      (practice) =>
        practice?.evaluationStatus ===
          "evaluated" &&
        practice?.performance &&
        typeof practice.performance ===
          "object"
    );

  const performance = {
    accuracy: calculateAverage(
      evaluatedPractices.map(
        (practice) =>
          practice.performance
            ?.accuracy
      )
    ),

    grammar: calculateAverage(
      evaluatedPractices.map(
        (practice) =>
          practice.performance
            ?.grammar
      )
    ),

    vocabulary: calculateAverage(
      evaluatedPractices.map(
        (practice) =>
          practice.performance
            ?.vocabulary
      )
    ),

    interaction: calculateAverage(
      evaluatedPractices.map(
        (practice) =>
          practice.performance
            ?.interaction
      )
    ),
  };

  const averageScore =
    calculateAverage(
      evaluatedPractices.map(
        (practice) =>
          practice.finalScore
      )
    );

  const frequentErrors =
    calculateFrequentErrors(history);

  const feedbackStrategy =
    buildFeedbackStrategy({
      performance,
      frequentErrors,

      evaluatedPractices:
        evaluatedPractices.length,
    });

  const learnedVocabulary =
    calculateLearnedVocabulary(
      history
    );

  const recommendedDifficulty =
    getRecommendedDifficulty({
      averageScore,
      performance,
    });

  const adaptation = {
    correctionIntensity:
      getCorrectionIntensity({
        grammar:
          performance.grammar,
        accuracy:
          performance.accuracy,
        frequentErrors,
      }),

    questionStyle:
      getQuestionStyle({
        interaction:
          performance.interaction,
        recommendedDifficulty,
      }),

    responseLength:
      getResponseLength({
        interaction:
          performance.interaction,
        vocabulary:
          performance.vocabulary,
      }),

    scaffoldingLevel:
      getScaffoldingLevel({
        grammar:
          performance.grammar,
        vocabulary:
          performance.vocabulary,
        interaction:
          performance.interaction,
      }),
  };

  const teachingPriorities =
    buildTeachingPriorities({
      performance,
      frequentErrors,
    });

  return {
    hasHistoricalData:
      history.length > 0,

    hasEvaluatedData:
      evaluatedPractices.length > 0,

    totalPracticeSessions:
      history.length,

    completedPractices:
      completedPractices.length,

    evaluatedPractices:
      evaluatedPractices.length,

    averageScore,

    performance,

    skillLevels: {
      accuracy:
        getSkillLevel(
          performance.accuracy
        ),

      grammar:
        getSkillLevel(
          performance.grammar
        ),

      vocabulary:
        getSkillLevel(
          performance.vocabulary
        ),

      interaction:
        getSkillLevel(
          performance.interaction
        ),
    },

    recommendedDifficulty,

    frequentErrors,

    learnedVocabulary,

    teachingPriorities,

    feedbackStrategy,
    adaptation,
  };
};
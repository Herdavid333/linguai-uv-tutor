/**
 * Construye un perfil pedagógico resumido a partir del historial
 * de prácticas almacenado en Firestore.
 *
 * Este archivo no modifica Firestore.
 */

const normalizeText = (value = "") => {
  return typeof value === "string"
    ? value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
    : "";
};

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
      (total, value) => total + value,
      0
    ) / validValues.length
  );
};

const getEvaluatedPractices = (
  practiceHistory = []
) => {
  if (!Array.isArray(practiceHistory)) {
    return [];
  }

  return practiceHistory.filter(
    (practice) =>
      practice?.status === "completed" &&
      practice?.evaluationStatus === "evaluated" &&
      Number.isFinite(
        Number(practice?.finalScore)
      )
  );
};

const getCorrectionLabel = (
  correction = {}
) => {
  const wrong =
    typeof correction?.wrong === "string"
      ? correction.wrong.trim()
      : "";

  const correct =
    typeof correction?.correct === "string"
      ? correction.correct.trim()
      : "";

  if (wrong && correct) {
    return `${wrong} → ${correct}`;
  }

  return (
    correct ||
    wrong ||
    correction?.explanation ||
    "Unspecified error"
  );
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
      const wrong = normalizeText(
        correction?.wrong
      );

      const correct = normalizeText(
        correction?.correct
      );

      if (!wrong && !correct) {
        return;
      }

      const type =
        normalizeText(correction?.type) ||
        "other";

      const key = `${type}|${wrong}|${correct}`;

      const storedOccurrences = Number(
        correction?.occurrences
      );

      const occurrences =
        Number.isFinite(storedOccurrences) &&
        storedOccurrences > 0
          ? storedOccurrences
          : 1;

      const existingError =
        errorsMap.get(key);

      if (existingError) {
        errorsMap.set(key, {
          ...existingError,
          occurrences:
            existingError.occurrences +
            occurrences,
        });

        return;
      }

      errorsMap.set(key, {
        type,
        label:
          getCorrectionLabel(correction),
        explanation:
          correction?.explanation || "",
        occurrences,
      });
    });
  });

  return Array.from(
    errorsMap.values()
  ).sort(
    (firstError, secondError) =>
      secondError.occurrences -
      firstError.occurrences
  );
};

const calculateVocabulary = (
  practiceHistory = []
) => {
  const vocabularyMap = new Map();

  practiceHistory.forEach((practice) => {
    const newWords = Array.isArray(
      practice?.newWords
    )
      ? practice.newWords
      : [];

    newWords.forEach((item) => {
      const word =
        typeof item === "string"
          ? item.trim()
          : String(
              item?.word ??
                item?.term ??
                ""
            ).trim();

      if (!word) {
        return;
      }

      const key = normalizeText(word);

      const existingWord =
        vocabularyMap.get(key);

      const occurrences =
        Number.isFinite(
          Number(item?.occurrences)
        ) &&
        Number(item?.occurrences) > 0
          ? Number(item.occurrences)
          : 1;

      if (existingWord) {
        vocabularyMap.set(key, {
          ...existingWord,
          occurrences:
            existingWord.occurrences +
            occurrences,
        });

        return;
      }

      vocabularyMap.set(key, {
        word,
        meaning:
          typeof item === "object"
            ? item?.meaning ||
              item?.definition ||
              ""
            : "",
        occurrences,
      });
    });
  });

  return Array.from(
    vocabularyMap.values()
  ).sort(
    (firstWord, secondWord) =>
      secondWord.occurrences -
      firstWord.occurrences
  );
};

const getSkillLevel = (score) => {
  if (!Number.isFinite(score)) {
    return "unknown";
  }

  if (score >= 85) {
    return "strong";
  }

  if (score >= 70) {
    return "developing";
  }

  return "needs_support";
};

const getRecommendedDifficulty = ({
  averageScore,
  grammar,
  vocabulary,
  interaction,
}) => {
  const availableMetrics = [
    averageScore,
    grammar,
    vocabulary,
    interaction,
  ].filter(Number.isFinite);

  if (availableMetrics.length === 0) {
    return "beginner_standard";
  }

  const overall = calculateAverage(
    availableMetrics
  );

  if (overall >= 85) {
    return "beginner_challenging";
  }

  if (overall >= 65) {
    return "beginner_standard";
  }

  return "beginner_supported";
};

const buildTeachingPriorities = ({
  grammar,
  vocabulary,
  accuracy,
  interaction,
  frequentErrors,
}) => {
  const priorities = [];

  if (
    Number.isFinite(grammar) &&
    grammar < 70
  ) {
    priorities.push(
      "Provide additional support with grammar structures."
    );
  }

  if (
    Number.isFinite(vocabulary) &&
    vocabulary < 70
  ) {
    priorities.push(
      "Use familiar vocabulary and introduce new words gradually."
    );
  }

  if (
    Number.isFinite(accuracy) &&
    accuracy < 70
  ) {
    priorities.push(
      "Check whether the student's sentences communicate the intended meaning clearly."
    );
  }

  if (
    Number.isFinite(interaction) &&
    interaction < 70
  ) {
    priorities.push(
      "Encourage slightly longer and more complete answers."
    );
  }

  if (frequentErrors.length > 0) {
    priorities.push(
      "Reinforce the student's recurring errors naturally during practice."
    );
  }

  if (priorities.length === 0) {
    priorities.push(
      "Maintain the current level and introduce small challenges."
    );
  }

  return priorities;
};

export const buildAdaptiveStudentProfile = (
  practiceHistory = []
) => {
  const normalizedHistory =
    Array.isArray(practiceHistory)
      ? practiceHistory
      : [];

  const evaluatedPractices =
    getEvaluatedPractices(
      normalizedHistory
    );

  const averageScore =
    calculateAverage(
      evaluatedPractices.map(
        (practice) =>
          practice?.finalScore
      )
    );

  const accuracy = calculateAverage(
    evaluatedPractices.map(
      (practice) =>
        practice?.performance?.accuracy
    )
  );

  const grammar = calculateAverage(
    evaluatedPractices.map(
      (practice) =>
        practice?.performance?.grammar
    )
  );

  const vocabulary = calculateAverage(
    evaluatedPractices.map(
      (practice) =>
        practice?.performance?.vocabulary
    )
  );

  const interaction = calculateAverage(
    evaluatedPractices.map(
      (practice) =>
        practice?.performance?.interaction
    )
  );

  const frequentErrors =
    calculateFrequentErrors(
      normalizedHistory
    );

  const learnedVocabulary =
    calculateVocabulary(
      normalizedHistory
    );

  const completedTopicIds = [
    ...new Set(
      evaluatedPractices
        .map(
          (practice) =>
            practice?.topicId
        )
        .filter(Boolean)
    ),
  ];

  const recommendedDifficulty =
    getRecommendedDifficulty({
      averageScore,
      grammar,
      vocabulary,
      interaction,
    });

  const teachingPriorities =
    buildTeachingPriorities({
      grammar,
      vocabulary,
      accuracy,
      interaction,
      frequentErrors,
    });

  return {
    hasHistoricalData:
      normalizedHistory.length > 0,

    hasEvaluatedData:
      evaluatedPractices.length > 0,

    totalPracticeSessions:
      normalizedHistory.length,

    evaluatedPractices:
      evaluatedPractices.length,

    averageScore,

    performance: {
      accuracy,
      grammar,
      vocabulary,
      interaction,
    },

    skillLevels: {
      accuracy:
        getSkillLevel(accuracy),

      grammar:
        getSkillLevel(grammar),

      vocabulary:
        getSkillLevel(vocabulary),

      interaction:
        getSkillLevel(interaction),
    },

    recommendedDifficulty,

    teachingPriorities,

    frequentErrors:
      frequentErrors
        .slice(0, 5),

    learnedVocabulary:
      learnedVocabulary
        .slice(0, 12),

    completedTopicIds,
  };
};
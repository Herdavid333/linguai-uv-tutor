/**
 * Utilidades para calcular el progreso del estudiante a partir
 * de los documentos almacenados en practiceHistory.
 *
 * Este archivo no modifica Firestore. Únicamente recibe datos
 * y devuelve estadísticas calculadas.
 */

const VALID_COMPLETED_STATUS = "completed";
const VALID_EVALUATED_STATUS = "evaluated";

/**
 * Convierte diferentes formatos de fecha en un objeto Date válido.
 *
 * Soporta:
 * - Firestore Timestamp
 * - Date
 * - string ISO
 * - número de milisegundos
 */
const parsePracticeDate = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value?.toDate === "function") {
    const convertedDate = value.toDate();

    return Number.isNaN(convertedDate.getTime())
      ? null
      : convertedDate;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  const convertedDate = new Date(value);

  return Number.isNaN(convertedDate.getTime())
    ? null
    : convertedDate;
};

/**
 * Genera una clave de fecha local con formato YYYY-MM-DD.
 *
 * Se utiliza tiempo local para evitar que una práctica realizada
 * cerca de la medianoche cambie de día debido a UTC.
 */
const getLocalDateKey = (date) => {
  if (!(date instanceof Date)) {
    return null;
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Devuelve únicamente las prácticas finalizadas.
 */
export const getCompletedPractices = (
  practiceHistory = []
) => {
  if (!Array.isArray(practiceHistory)) {
    return [];
  }

  return practiceHistory.filter(
    (practice) =>
      practice?.status === VALID_COMPLETED_STATUS
  );
};

/**
 * Devuelve únicamente las prácticas finalizadas que cuentan
 * con una evaluación válida y una puntuación final.
 */
export const getEvaluatedPractices = (
  practiceHistory = []
) => {
  return getCompletedPractices(
    practiceHistory
  ).filter((practice) => {
    const finalScore = Number(
      practice?.finalScore
    );

    return (
      practice?.evaluationStatus ===
        VALID_EVALUATED_STATUS &&
      Number.isFinite(finalScore)
    );
  });
};

/**
 * Calcula el promedio de una lista de valores numéricos.
 */
const calculateAverage = (values = []) => {
  const validValues = values
    .map(Number)
    .filter(Number.isFinite);

  if (validValues.length === 0) {
    return null;
  }

  const total = validValues.reduce(
    (accumulator, value) =>
      accumulator + value,
    0
  );

  return Math.round(
    total / validValues.length
  );
};

/**
 * Calcula la racha de aprendizaje consecutiva.
 *
 * La racha cuenta desde hoy. Si no existe práctica hoy,
 * también comprueba ayer para permitir mostrar una racha
 * que todavía no se ha perdido durante el día actual.
 */
export const calculateLearningStreak = (
  practiceHistory = []
) => {
  if (
    !Array.isArray(practiceHistory) ||
    practiceHistory.length === 0
  ) {
    return 0;
  }

  const practiceDates = new Set(
    practiceHistory
      .map((item) => {
        const practiceDate =
          parsePracticeDate(
            item?.startedAt ??
              item?.completedAt ??
              item?.updatedAt
          );

        return practiceDate
          ? getLocalDateKey(practiceDate)
          : null;
      })
      .filter(Boolean)
  );

  if (practiceDates.size === 0) {
    return 0;
  }

  const today = new Date();

  const todayKey = getLocalDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayKey =
    getLocalDateKey(yesterday);

  let currentDate;

  if (practiceDates.has(todayKey)) {
    currentDate = new Date(today);
  } else if (
    practiceDates.has(yesterdayKey)
  ) {
    currentDate = new Date(yesterday);
  } else {
    return 0;
  }

  let streak = 0;

  while (true) {
    const currentDateKey =
      getLocalDateKey(currentDate);

    if (
      !practiceDates.has(currentDateKey)
    ) {
      break;
    }

    streak += 1;

    currentDate.setDate(
      currentDate.getDate() - 1
    );
  }

  return streak;
};

/**
 * Calcula las estadísticas generales del progreso.
 */
export const calculateProgressStats = (
  practiceHistory = []
) => {
  const normalizedHistory = Array.isArray(
    practiceHistory
  )
    ? practiceHistory
    : [];

  const completedPractices =
    getCompletedPractices(
      normalizedHistory
    );

  const evaluatedPractices =
    getEvaluatedPractices(
      normalizedHistory
    );

  const activitiesCompleted =
    completedPractices.length;

  /*
   * Cada documento de practiceHistory representa una sesión
   * iniciada, incluso si fue abandonada o quedó incompleta.
   */
  const practiceSessions =
    normalizedHistory.length;

  /*
   * Solo se considera aprendido un tema cuando existe al menos
   * una práctica finalizada asociada a él.
   */
  const uniqueTopics = new Set(
    completedPractices
      .map((item) => item?.topicId)
      .filter(Boolean)
  );

  const topicsLearned =
    uniqueTopics.size;

  const learningStreak =
    calculateLearningStreak(
      normalizedHistory
    );

  const averageScore = calculateAverage(
    evaluatedPractices.map(
      (practice) =>
        practice.finalScore
    )
  );

  const insufficientPractices =
    completedPractices.filter(
      (practice) =>
        practice?.evaluationStatus ===
        "insufficient"
    ).length;

  const inProgressPractices =
    normalizedHistory.filter(
      (practice) =>
        practice?.status ===
        "in_progress"
    ).length;

  const totalCorrections =
    completedPractices.reduce(
      (total, practice) =>
        total +
        Number(
          practice?.correctionsCount ??
            practice?.corrections?.length ??
            0
        ),
      0
    );

  const totalNewWords =
    completedPractices.reduce(
      (total, practice) =>
        total +
        Number(
          practice?.newWordsCount ??
            practice?.newWords?.length ??
            0
        ),
      0
    );

  return {
    activitiesCompleted,
    practiceSessions,
    topicsLearned,
    learningStreak,

    averageScore,

    evaluatedPractices:
      evaluatedPractices.length,

    insufficientPractices,
    inProgressPractices,

    totalCorrections,
    totalNewWords,
  };
};

/**
 * Calcula el progreso de cada unidad.
 *
 * El progreso se basa en la cantidad de temas distintos que
 * tienen al menos una práctica finalizada.
 *
 * También calcula:
 * - puntuación promedio de la unidad
 * - sesiones realizadas
 * - prácticas completadas
 * - temas practicados
 */
export const calculateUnitProgress = (
  practiceHistory = [],
  learningUnits = []
) => {
  const normalizedHistory = Array.isArray(
    practiceHistory
  )
    ? practiceHistory
    : [];

  const normalizedUnits = Array.isArray(
    learningUnits
  )
    ? learningUnits
    : [];

  const completedPractices =
    getCompletedPractices(
      normalizedHistory
    );

  const evaluatedPractices =
    getEvaluatedPractices(
      normalizedHistory
    );

  return normalizedUnits.map(
    (unit) => {
      const unitId = unit?.id;

      const unitSessions =
        normalizedHistory.filter(
          (item) =>
            item?.unitId === unitId
        );

      const unitCompletedPractices =
        completedPractices.filter(
          (item) =>
            item?.unitId === unitId
        );

      const unitEvaluatedPractices =
        evaluatedPractices.filter(
          (item) =>
            item?.unitId === unitId
        );

      const unitTopics = Array.isArray(
        unit?.topics
      )
        ? unit.topics
        : [];

      const totalTopics =
        unitTopics.length;

      const practicedTopicIds =
        new Set(
          unitCompletedPractices
            .map(
              (practice) =>
                practice?.topicId
            )
            .filter(Boolean)
        );

      const practicedTopics =
        practicedTopicIds.size;

      /*
       * Una unidad sin temas configurados no debe producir
       * división por cero.
       */
      const progress =
        totalTopics > 0
          ? Math.min(
              Math.round(
                (practicedTopics /
                  totalTopics) *
                  100
              ),
              100
            )
          : 0;

      const averageScore =
        calculateAverage(
          unitEvaluatedPractices.map(
            (practice) =>
              practice.finalScore
          )
        );

      const insufficientPractices =
        unitCompletedPractices.filter(
          (practice) =>
            practice
              ?.evaluationStatus ===
            "insufficient"
        ).length;

      return {
        id: unitId,

        unitTitle: [
          unit?.shortTitle,
          unit?.title,
        ]
          .filter(Boolean)
          .join(" - "),

        /*
         * Se conserva score por compatibilidad con la interfaz
         * que anteriormente esperaba esa propiedad.
         */
        score: progress,
        progress,

        averageScore,

        totalTopics,
        practicedTopics,

        practiceSessions:
          unitSessions.length,

        completedPractices:
          unitCompletedPractices.length,

        evaluatedPractices:
          unitEvaluatedPractices.length,

        insufficientPractices,
      };
    }
  );
};

/**
 * Calcula la puntuación promedio general del estudiante.
 */
export const calculateOverallAverageScore = (
  practiceHistory = []
) => {
  const evaluatedPractices =
    getEvaluatedPractices(
      practiceHistory
    );

  return calculateAverage(
    evaluatedPractices.map(
      (practice) =>
        practice.finalScore
    )
  );
};

/**
 * Calcula el porcentaje general de temas completados
 * considerando todas las unidades.
 */
export const calculateOverallProgress = (
  practiceHistory = [],
  learningUnits = []
) => {
  const unitProgress =
    calculateUnitProgress(
      practiceHistory,
      learningUnits
    );

  const validUnits =
    unitProgress.filter(
      (unit) =>
        Number.isFinite(
          Number(unit.progress)
        )
    );

  if (validUnits.length === 0) {
    return 0;
  }

  const totalProgress =
    validUnits.reduce(
      (total, unit) =>
        total +
        Number(unit.progress),
      0
    );

  return Math.round(
    totalProgress /
      validUnits.length
  );
};

/**
 * Devuelve un resumen de vocabulario aprendido sin duplicados.
 *
 * Soporta palabras guardadas como strings o como objetos:
 * { word, meaning }
 */
export const calculateVocabularyStats = (
  practiceHistory = []
) => {
  const completedPractices =
    getCompletedPractices(
      practiceHistory
    );

  const vocabularyMap = new Map();

  completedPractices.forEach(
    (practice) => {
      const newWords = Array.isArray(
        practice?.newWords
      )
        ? practice.newWords
        : [];

      newWords.forEach((item) => {
        if (typeof item === "string") {
          const normalizedWord =
            item.trim();

          if (!normalizedWord) {
            return;
          }

          vocabularyMap.set(
            normalizedWord.toLowerCase(),
            {
              word: normalizedWord,
            }
          );

          return;
        }

        if (
          item &&
          typeof item === "object"
        ) {
          const normalizedWord =
            String(
              item.word ??
                item.term ??
                ""
            ).trim();

          if (!normalizedWord) {
            return;
          }

          const key =
            normalizedWord.toLowerCase();

          if (
            !vocabularyMap.has(key)
          ) {
            vocabularyMap.set(
              key,
              item
            );
          }
        }
      });
    }
  );

  const words = Array.from(
    vocabularyMap.values()
  );

  return {
    totalWords: words.length,
    words,
  };
};

/**
 * Devuelve las estructuras gramaticales registradas,
 * eliminando duplicados.
 */
export const calculateGrammarStats = (
  practiceHistory = []
) => {
  const completedPractices =
    getCompletedPractices(
      practiceHistory
    );

  const grammarMap = new Map();

  completedPractices.forEach(
    (practice) => {
      const grammarStructures =
        Array.isArray(
          practice?.grammarStructures
        )
          ? practice.grammarStructures
          : [];

      grammarStructures.forEach(
        (item) => {
          if (
            typeof item === "string"
          ) {
            const normalizedStructure =
              item.trim();

            if (!normalizedStructure) {
              return;
            }

            grammarMap.set(
              normalizedStructure.toLowerCase(),
              {
                structure:
                  normalizedStructure,
              }
            );

            return;
          }

          if (
            item &&
            typeof item === "object"
          ) {
            const normalizedStructure =
              String(
                item.structure ??
                  item.name ??
                  item.title ??
                  ""
              ).trim();

            if (!normalizedStructure) {
              return;
            }

            const key =
              normalizedStructure.toLowerCase();

            if (!grammarMap.has(key)) {
              grammarMap.set(
                key,
                item
              );
            }
          }
        }
      );
    }
  );

  const structures =
    Array.from(
      grammarMap.values()
    );

  return {
    totalStructures:
      structures.length,
    structures,
  };
};

/**
 * Normaliza una métrica para garantizar que esté entre 0 y 100.
 */
const normalizePerformanceValue = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.min(
    100,
    Math.max(0, Math.round(numericValue))
  );
};

/**
 * Calcula el promedio de una lista de métricas válidas.
 */
const calculateMetricAverage = (values = []) => {
  const validValues = values
    .map(normalizePerformanceValue)
    .filter((value) => value !== null);

  if (validValues.length === 0) {
    return null;
  }

  const total = validValues.reduce(
    (sum, value) => sum + value,
    0
  );

  return Math.round(total / validValues.length);
};

/**
 * Calcula el rendimiento acumulado del estudiante.
 *
 * Solo utiliza prácticas:
 * - completadas;
 * - evaluadas;
 * - con métricas de rendimiento válidas.
 *
 * Devuelve null en cada métrica cuando todavía no existe
 * evidencia suficiente para calcularla.
 */
export const calculatePerformanceStats = (
  practiceHistory = []
) => {
  const normalizedHistory = Array.isArray(
    practiceHistory
  )
    ? practiceHistory
    : [];

  const evaluatedPractices =
    normalizedHistory.filter((practice) => {
      return (
        practice?.status === "completed" &&
        practice?.evaluationStatus === "evaluated" &&
        practice?.performance &&
        typeof practice.performance === "object"
      );
    });

  const accuracy = calculateMetricAverage(
    evaluatedPractices.map(
      (practice) => practice.performance?.accuracy
    )
  );

  const grammar = calculateMetricAverage(
    evaluatedPractices.map(
      (practice) => practice.performance?.grammar
    )
  );

  const vocabulary = calculateMetricAverage(
    evaluatedPractices.map(
      (practice) => practice.performance?.vocabulary
    )
  );

  const interaction = calculateMetricAverage(
    evaluatedPractices.map(
      (practice) => practice.performance?.interaction
    )
  );

  const availableMetrics = [
    accuracy,
    grammar,
    vocabulary,
    interaction,
  ].filter((value) => value !== null);

  const overallPerformance =
    availableMetrics.length > 0
      ? Math.round(
          availableMetrics.reduce(
            (sum, value) => sum + value,
            0
          ) / availableMetrics.length
        )
      : null;

  return {
    accuracy,
    grammar,
    vocabulary,
    interaction,
    overallPerformance,

    evaluatedPractices:
      evaluatedPractices.length,

    hasPerformanceData:
      availableMetrics.length > 0,
  };
};
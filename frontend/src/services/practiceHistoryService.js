import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../lib/firebase";

/*
 * Cantidad mínima de intervenciones significativas del estudiante
 * para que una práctica pueda evaluarse.
 */
const MIN_MEANINGFUL_INTERACTIONS = 5;

/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

/**
 * Limita una métrica numérica al rango de 0 a 100.
 *
 * Devuelve null cuando el valor recibido no es válido.
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

/**
 * Limpia un texto para evitar almacenar valores undefined.
 */
const normalizeText = (value) => {
  return typeof value === "string"
    ? value.trim()
    : "";
};

/**
 * Determina si un mensaje del estudiante aporta evidencia
 * suficiente para contarse como una interacción significativa.
 *
 * Por ahora se consideran significativos los mensajes que:
 * - contienen al menos tres palabras; o
 * - tienen al menos quince caracteres.
 */
const isMeaningfulStudentMessage = (
  studentMessage
) => {
  const normalizedMessage =
    normalizeText(studentMessage);

  if (!normalizedMessage) {
    return false;
  }

  const wordCount = normalizedMessage
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    wordCount >= 3 ||
    normalizedMessage.length >= 15
  );
};

/**
 * Calcula el promedio de valores numéricos válidos.
 */
const calculateAverage = (values = []) => {
  const validValues = values
    .map(Number)
    .filter(Number.isFinite);

  if (validValues.length === 0) {
    return null;
  }

  const total = validValues.reduce(
    (sum, value) => sum + value,
    0
  );

  return Math.round(
    total / validValues.length
  );
};

/**
 * Calcula el promedio de una métrica concreta almacenada
 * dentro de performanceHistory.
 */
const calculatePerformanceMetric = (
  performanceHistory,
  metricName
) => {
  const values = performanceHistory
    .map((item) =>
      normalizeMetric(item?.[metricName])
    )
    .filter((value) => value !== null);

  return calculateAverage(values);
};

/**
 * Convierte la respuesta de rendimiento de Gemini en una
 * estructura segura para Firestore.
 */
const normalizePerformance = (
  performance
) => {
  if (
    !performance ||
    typeof performance !== "object"
  ) {
    return null;
  }

  const normalizedPerformance = {
    accuracy: normalizeMetric(
      performance.accuracy
    ),

    grammar: normalizeMetric(
      performance.grammar
    ),

    vocabulary: normalizeMetric(
      performance.vocabulary
    ),

    interaction: normalizeMetric(
      performance.interaction
    ),
  };

  const hasAtLeastOneMetric =
    Object.values(
      normalizedPerformance
    ).some((value) => value !== null);

  return hasAtLeastOneMetric
    ? normalizedPerformance
    : null;
};

/* =========================================================
   CREAR ESTRUCTURA INICIAL DE UNA SESIÓN
========================================================= */

export const createPracticeHistoryItem = ({
  userId,

  unitId,
  unitTitle,

  topicId,
  topicTitle,

  activityType,
  activityName,

  status = "in_progress",
}) => {
  if (!userId) {
    throw new Error("user-id-required");
  }

  return {
    userId,

    unitId: unitId || "",
    unitTitle: unitTitle || "",

    topicId: topicId || "",
    topicTitle: topicTitle || "",

    activityType: activityType || "",
    activityName: activityName || "",

    /*
     * latestScore corresponde únicamente a la evaluación
     * de la intervención más reciente.
     */
    latestScore: null,

    /*
     * scoreHistory almacena todas las puntuaciones parciales
     * de la práctica.
     */
    scoreHistory: [],

    /*
     * finalScore únicamente se calcula al cerrar la práctica.
     */
    finalScore: null,

    evaluationStatus: "pending",

    performance: {
      accuracy: null,
      grammar: null,
      vocabulary: null,
      interaction: null,
    },

    performanceHistory: [],

    messagesCount: 0,
    studentMessagesCount: 0,
    assistantMessagesCount: 0,
    meaningfulInteractionsCount: 0,

    correctionsCount: 0,
    newWordsCount: 0,

    corrections: [],
    newWords: [],
    grammarStructures: [],
    feedbackHistory: [],

    lastStudentMessage: "",
    lastAssistantReply: "",
    nextSuggestion: "",

    /*
     * Gemini puede recomendar terminar la actividad, pero
     * este campo no cambia el estado por sí solo.
     */
    modelSuggestedCompletion: false,

    activityCompleted: false,

    status,

    startedAt: null,
    completedAt: null,
    createdAt: null,
    updatedAt: null,
  };
};

/* =========================================================
   GUARDAR UNA NUEVA SESIÓN
========================================================= */

export const savePracticeHistory = async (
  historyItem
) => {
  if (!historyItem?.userId) {
    throw new Error("user-id-required");
  }

  const docRef = await addDoc(
    collection(db, "practiceHistory"),
    {
      ...historyItem,

      status:
        historyItem.status ||
        "in_progress",

      startedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return docRef.id;
};

/* =========================================================
   ACTUALIZAR SESIÓN CON RESPUESTA PEDAGÓGICA DE GEMINI
========================================================= */

export const updatePracticeHistoryWithAI = async ({
  practiceHistoryId,
  aiResponse,
  studentMessage,
}) => {
  if (!practiceHistoryId) {
    throw new Error(
      "practice-history-id-required"
    );
  }

  if (!aiResponse) {
    throw new Error(
      "ai-response-required"
    );
  }

  const normalizedStudentMessage =
    normalizeText(studentMessage);

  const meaningfulInteraction =
    isMeaningfulStudentMessage(
      normalizedStudentMessage
    );

  const corrections = Array.isArray(
    aiResponse.corrections
  )
    ? aiResponse.corrections
    : [];

  const newWords = Array.isArray(
    aiResponse.newWords
  )
    ? aiResponse.newWords
    : [];

  const grammarStructures = Array.isArray(
    aiResponse.grammarStructures
  )
    ? aiResponse.grammarStructures
    : [];

  const latestScore = normalizeMetric(
    aiResponse.score
  );

  const performance =
    normalizePerformance(
      aiResponse.performance
    );

  const practiceRef = doc(
    db,
    "practiceHistory",
    practiceHistoryId
  );

  const practiceSnapshot =
    await getDoc(practiceRef);

  if (!practiceSnapshot.exists()) {
    throw new Error(
      "practice-history-not-found"
    );
  }

  const currentPractice =
    practiceSnapshot.data();

  if (
    currentPractice.status ===
    "completed"
  ) {
    throw new Error(
      "practice-already-completed"
    );
  }

  const now =
    new Date().toISOString();

  const updateData = {
    lastStudentMessage:
      normalizedStudentMessage,

    lastAssistantReply:
      normalizeText(
        aiResponse.assistantReply
      ),

    nextSuggestion:
      normalizeText(
        aiResponse.nextSuggestion
      ),

    modelSuggestedCompletion:
      Boolean(
        aiResponse.activityCompleted
      ),

    messagesCount: increment(2),
    studentMessagesCount:
      increment(1),

    assistantMessagesCount:
      increment(1),

    status: "in_progress",
    updatedAt: serverTimestamp(),
  };

  if (meaningfulInteraction) {
    updateData.meaningfulInteractionsCount =
      increment(1);
  }

  /*
   * La puntuación de Gemini es parcial.
   * No se utiliza como resultado final.
   */
  if (latestScore !== null) {
    updateData.latestScore =
      latestScore;

    updateData.scoreHistory =
      arrayUnion({
        score: latestScore,
        createdAt: now,
      });
  }

  /*
   * Se almacena el rendimiento parcial de esta intervención.
   */
  if (performance) {
    updateData.performanceHistory =
      arrayUnion({
        ...performance,
        createdAt: now,
      });
  }

  if (corrections.length > 0) {
    const normalizedCorrections =
      corrections
        .map((correction) => ({
          wrong: normalizeText(
            correction?.wrong
          ),

          correct: normalizeText(
            correction?.correct
          ),

          explanation: normalizeText(
            correction?.explanation
          ),

          type:
            normalizeText(
              correction?.type
            ) || "grammar",

          createdAt: now,
        }))
        .filter(
          (correction) =>
            correction.wrong ||
            correction.correct
        );

    if (
      normalizedCorrections.length > 0
    ) {
      updateData.corrections =
        arrayUnion(
          ...normalizedCorrections
        );

      updateData.correctionsCount =
        increment(
          normalizedCorrections.length
        );
    }
  }

  if (newWords.length > 0) {
    const normalizedNewWords =
      newWords
        .map((word) => ({
          word: normalizeText(
            word?.word
          ),

          meaning: normalizeText(
            word?.meaning
          ),

          example: normalizeText(
            word?.example
          ),

          createdAt: now,
        }))
        .filter(
          (word) => word.word
        );

    if (
      normalizedNewWords.length > 0
    ) {
      updateData.newWords =
        arrayUnion(
          ...normalizedNewWords
        );

      updateData.newWordsCount =
        increment(
          normalizedNewWords.length
        );
    }
  }

  if (
    grammarStructures.length > 0
  ) {
    const normalizedStructures =
      grammarStructures
        .map((structure) => {
          if (
            typeof structure ===
            "string"
          ) {
            return {
              structure:
                structure.trim(),

              explanation: "",
              example: "",
              createdAt: now,
            };
          }

          return {
            structure:
              normalizeText(
                structure?.structure ??
                  structure?.name ??
                  structure?.title
              ),

            explanation:
              normalizeText(
                structure?.explanation
              ),

            example:
              normalizeText(
                structure?.example
              ),

            createdAt: now,
          };
        })
        .filter(
          (structure) =>
            structure.structure
        );

    if (
      normalizedStructures.length > 0
    ) {
      updateData.grammarStructures =
        arrayUnion(
          ...normalizedStructures
        );
    }
  }

  if (
    aiResponse.feedback &&
    typeof aiResponse.feedback ===
      "object"
  ) {
    updateData.feedbackHistory =
      arrayUnion({
        overall:
          normalizeText(
            aiResponse.feedback.overall
          ),

        strengths: Array.isArray(
          aiResponse.feedback.strengths
        )
          ? aiResponse.feedback.strengths
              .map(normalizeText)
              .filter(Boolean)
          : [],

        improvements: Array.isArray(
          aiResponse.feedback
            .improvements
        )
          ? aiResponse.feedback.improvements
              .map(normalizeText)
              .filter(Boolean)
          : [],

        createdAt: now,
      });
  }

  await updateDoc(
    practiceRef,
    updateData
  );
};

/* =========================================================
   FINALIZAR Y EVALUAR UNA PRÁCTICA
========================================================= */

export const finalizePracticeHistory = async (
  practiceHistoryId
) => {
  if (!practiceHistoryId) {
    throw new Error(
      "practice-history-id-required"
    );
  }

  const practiceRef = doc(
    db,
    "practiceHistory",
    practiceHistoryId
  );

  const practiceSnapshot =
    await getDoc(practiceRef);

  if (!practiceSnapshot.exists()) {
    throw new Error(
      "practice-history-not-found"
    );
  }

  const practice =
    practiceSnapshot.data();

  /*
   * Evita finalizar dos veces la misma práctica.
   */
  if (
    practice.status === "completed"
  ) {
    return {
      id: practiceSnapshot.id,
      ...practice,
    };
  }

  const meaningfulInteractionsCount =
    Number(
      practice
        .meaningfulInteractionsCount ??
        0
    );

  /*
   * Una práctica corta se cierra, pero no recibe nota.
   */
  if (
    meaningfulInteractionsCount <
    MIN_MEANINGFUL_INTERACTIONS
  ) {
    await updateDoc(
      practiceRef,
      {
        status: "completed",

        evaluationStatus:
          "insufficient",

        finalScore: null,

        performance: {
          accuracy: null,
          grammar: null,
          vocabulary: null,
          interaction: null,
        },

        activityCompleted: true,

        completedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      }
    );

    const updatedSnapshot =
      await getDoc(practiceRef);

    return {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data(),
    };
  }

  const scoreHistory =
    Array.isArray(
      practice.scoreHistory
    )
      ? practice.scoreHistory
      : [];

  const validScores =
    scoreHistory
      .map((item) =>
        normalizeMetric(item?.score)
      )
      .filter(
        (value) => value !== null
      );

  const finalScore =
    calculateAverage(validScores);

  const performanceHistory =
    Array.isArray(
      practice.performanceHistory
    )
      ? practice.performanceHistory
      : [];

  const performance = {
    accuracy:
      calculatePerformanceMetric(
        performanceHistory,
        "accuracy"
      ),

    grammar:
      calculatePerformanceMetric(
        performanceHistory,
        "grammar"
      ),

    vocabulary:
      calculatePerformanceMetric(
        performanceHistory,
        "vocabulary"
      ),

    interaction:
      calculatePerformanceMetric(
        performanceHistory,
        "interaction"
      ),
  };

  const hasPerformanceData =
    Object.values(performance).some(
      (value) => value !== null
    );

  const evaluationStatus =
    finalScore !== null &&
    hasPerformanceData
      ? "evaluated"
      : "insufficient";

  await updateDoc(
    practiceRef,
    {
      status: "completed",

      evaluationStatus,

      finalScore:
        evaluationStatus ===
        "evaluated"
          ? finalScore
          : null,

      performance:
        evaluationStatus ===
        "evaluated"
          ? performance
          : {
              accuracy: null,
              grammar: null,
              vocabulary: null,
              interaction: null,
            },

      activityCompleted: true,

      completedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    }
  );

  const updatedSnapshot =
    await getDoc(practiceRef);

  return {
    id: updatedSnapshot.id,
    ...updatedSnapshot.data(),
  };
};

/* =========================================================
   CONSULTAR UNA PRÁCTICA POR ID
========================================================= */

export const getPracticeHistoryById =
  async (practiceHistoryId) => {
    if (!practiceHistoryId) {
      return null;
    }

    const practiceRef = doc(
      db,
      "practiceHistory",
      practiceHistoryId
    );

    const practiceSnapshot =
      await getDoc(practiceRef);

    if (
      !practiceSnapshot.exists()
    ) {
      return null;
    }

    return {
      id: practiceSnapshot.id,
      ...practiceSnapshot.data(),
    };
  };

/* =========================================================
   CONSULTAR HISTORIAL POR USUARIO
========================================================= */

export const getUserPracticeHistory =
  async (userId) => {
    if (!userId) {
      return [];
    }

    const historyQuery = query(
      collection(
        db,
        "practiceHistory"
      ),

      where(
        "userId",
        "==",
        userId
      ),

      orderBy(
        "startedAt",
        "desc"
      )
    );

    const querySnapshot =
      await getDocs(historyQuery);

    return querySnapshot.docs.map(
      (document) => ({
        id: document.id,
        ...document.data(),
      })
    );
  };
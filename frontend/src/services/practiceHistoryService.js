import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  getDoc,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../lib/firebase";

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
  score = 0,
  messagesCount = 0,
  correctionsCount = 0,
  newWordsCount = 0,
  status = "started",
}) => {
  return {
    userId,

    unitId,
    unitTitle,

    topicId,
    topicTitle,

    activityType,
    activityName,

    score,
    scoreHistory: [],

    messagesCount,
    correctionsCount,
    newWordsCount,

    corrections: [],
    newWords: [],
    grammarStructures: [],
    feedbackHistory: [],

    lastAssistantReply: "",
    nextSuggestion: "",
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
export const savePracticeHistory = async (historyItem) => {
  const docRef = await addDoc(collection(db, "practiceHistory"), {
    ...historyItem,
    startedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

/* =========================================================
   ACTUALIZAR SESIÓN CON RESPUESTA PEDAGÓGICA DE GEMINI
========================================================= */
export const updatePracticeHistoryWithAI = async ({
  practiceHistoryId,
  aiResponse,
}) => {
  if (!practiceHistoryId) {
    throw new Error("practice-history-id-required");
  }

  if (!aiResponse) {
    throw new Error("ai-response-required");
  }

  const corrections = Array.isArray(aiResponse.corrections)
    ? aiResponse.corrections
    : [];

  const newWords = Array.isArray(aiResponse.newWords)
    ? aiResponse.newWords
    : [];

  const grammarStructures = Array.isArray(aiResponse.grammarStructures)
    ? aiResponse.grammarStructures
    : [];

  const score =
    typeof aiResponse.score === "number"
      ? Math.max(0, Math.min(100, aiResponse.score))
      : 0;

  const practiceRef = doc(
    db,
    "practiceHistory",
    practiceHistoryId
  );

  const updateData = {
    score,

    scoreHistory: arrayUnion({
      score,
      createdAt: new Date().toISOString(),
    }),

    messagesCount: increment(2),
    correctionsCount: increment(corrections.length),
    newWordsCount: increment(newWords.length),

    lastAssistantReply: aiResponse.assistantReply || "",
    nextSuggestion: aiResponse.nextSuggestion || "",
    activityCompleted: Boolean(aiResponse.activityCompleted),

    status: aiResponse.activityCompleted ? "completed" : "started",
    updatedAt: serverTimestamp(),
  };

  if (corrections.length > 0) {
    updateData.corrections = arrayUnion(
      ...corrections.map((correction) => ({
        wrong: correction.wrong || "",
        correct: correction.correct || "",
        explanation: correction.explanation || "",
        type: correction.type || "grammar",
        createdAt: new Date().toISOString(),
      }))
    );
  }

  if (newWords.length > 0) {
    updateData.newWords = arrayUnion(
      ...newWords.map((word) => ({
        word: word.word || "",
        meaning: word.meaning || "",
        example: word.example || "",
        createdAt: new Date().toISOString(),
      }))
    );
  }

  if (grammarStructures.length > 0) {
    updateData.grammarStructures = arrayUnion(
      ...grammarStructures
    );
  }

  if (aiResponse.feedback) {
    updateData.feedbackHistory = arrayUnion({
      overall: aiResponse.feedback.overall || "",
      strengths: Array.isArray(aiResponse.feedback.strengths)
        ? aiResponse.feedback.strengths
        : [],
      improvements: Array.isArray(aiResponse.feedback.improvements)
        ? aiResponse.feedback.improvements
        : [],
      createdAt: new Date().toISOString(),
    });
  }

  if (aiResponse.activityCompleted) {
    updateData.completedAt = serverTimestamp();
  }

  await updateDoc(practiceRef, updateData);
};

/* =========================================================
   CONSULTAR UNA PRÁCTICA POR SU ID
========================================================= */
export const getPracticeHistoryById = async (practiceHistoryId) => {
  if (!practiceHistoryId) return null;

  const practiceRef = doc(
    db,
    "practiceHistory",
    practiceHistoryId
  );

  const practiceSnapshot = await getDoc(practiceRef);

  if (!practiceSnapshot.exists()) {
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
export const getUserPracticeHistory = async (userId) => {
  if (!userId) return [];

  const historyQuery = query(
    collection(db, "practiceHistory"),
    where("userId", "==", userId),
    orderBy("startedAt", "desc")
  );

  const querySnapshot = await getDocs(historyQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
};
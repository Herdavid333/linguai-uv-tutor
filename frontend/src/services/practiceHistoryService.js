import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

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
    messagesCount,
    correctionsCount,
    newWordsCount,

    status,

    startedAt: new Date().toISOString(),
    completedAt: null,
    createdAt: new Date().toISOString(),
  };
};

export const savePracticeHistory = async (historyItem) => {
  const docRef = await addDoc(collection(db, "practiceHistory"), {
    ...historyItem,
    startedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};
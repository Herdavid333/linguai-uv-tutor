"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bot,
  Home,
  Menu,
  User,
  Volume2,
  Lightbulb,
} from "lucide-react";

import {
  getConversation,
  saveConversation,
  clearConversation,
  createNewConversation,
  createMessage,
  addMessageToConversation,
  createEmptyLearningSummary,
  MESSAGE_ROLES,
} from "../../utils/chatModel";

import ChatSideMenu from "../../components/chat/ChatSideMenu";
import { learningUnits } from "../../data/learningContent";
import PracticeReviewPanel from "../../components/chat/PracticeReviewPanel";
import { useAuth } from "../../context/AuthContext";
import {
  createPracticeHistoryItem,
  getPracticeHistoryById,
  savePracticeHistory,
  updatePracticeHistoryWithAI,
  finalizePracticeHistory,
  getUserPracticeHistory,
  abandonPracticeHistory,
} from "../../services/practiceHistoryService";

import {
  buildAdaptiveStudentProfile,
} from "../../utils/adaptiveProfileCalculations";

import ActivePracticeModal from "../../components/practice/ActivePracticeModal";  
import ChatFooter from "../../components/chat/ChatFooter";
import {
  mergeCorrections,
  mergeNewWords,
  mergeGrammarStructures,
} from "../../utils/chatLearningSummary";

const buildChatUrl = (
  activityContext
) => {
  if (
    !activityContext?.unitId ||
    !activityContext?.topicId ||
    !activityContext?.activityType ||
    !activityContext?.activityName
  ) {
    console.error(
      "Incomplete practice context:",
      activityContext
    );

    return null;
  }

  const params =
    new URLSearchParams({
      unitId:
        activityContext.unitId,

      unitTitle:
        activityContext.unitTitle ||
        "",

      topicId:
        activityContext.topicId,

      topicTitle:
        activityContext.topicTitle ||
        "",

      activityId:
        activityContext.activityId ||
        "",

      activityType:
        activityContext.activityType,

      activityName:
        activityContext.activityName,

      activityDescription:
        activityContext
          .activityDescription ||
        "",
    });

  return `/chat?${params.toString()}`;
};

export default function ChatPage() {
  /* =========================================================
     HOOKS Y ESTADOS PRINCIPALES
  ========================================================= */
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const studentFirstName =
    user?.fullName
      ?.trim()
      .split(/\s+/)[0] ||
    "Student";

  const [conversation, setConversation] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showPracticeReview, setShowPracticeReview] = useState(false);
  const [animatedAssistantText, setAnimatedAssistantText] = useState("");
  const [isAnimatingAssistant, setIsAnimatingAssistant] = useState(false);

  const practiceIdFromUrl =
    searchParams.get("practiceId");

  const unitIdFromUrl =
  searchParams.get("unitId");

  const unitTitleFromUrl =
    searchParams.get("unitTitle");

  const topicIdFromUrl =
    searchParams.get("topicId");

  const topicTitleFromUrl =
    searchParams.get("topicTitle");

  const activityIdFromUrl =
    searchParams.get("activityId");

  const activityTypeFromUrl =
    searchParams.get("activityType");

  const activityNameFromUrl =
    searchParams.get("activityName");

  const activityDescriptionFromUrl =
    searchParams.get("activityDescription");

  const hasNewPracticeContext =
    Boolean(
      !practiceIdFromUrl &&
      unitIdFromUrl &&
      topicIdFromUrl &&
      activityTypeFromUrl &&
      activityNameFromUrl
    );

  const [
    isFinishingPractice,
    setIsFinishingPractice,
  ] = useState(false);

  const [
    isLeavingChat,
    setIsLeavingChat,
  ] = useState(false);

  const [
    pendingPracticeContext,
    setPendingPracticeContext,
  ] = useState(null);

  const [
    showChangePracticeModal,
    setShowChangePracticeModal,
  ] = useState(false);

  const [
    isAbandoningPractice,
    setIsAbandoningPractice,
  ] = useState(false);

  const [
    adaptiveStudentProfile,
    setAdaptiveStudentProfile,
  ] = useState(null);

  const [
    loadingAdaptiveProfile,
    setLoadingAdaptiveProfile,
  ] = useState(false);

  const handleFinishPractice =
    async () => {
      const practiceId =
        conversation
          ?.practiceHistoryId;

      if (
        !user?.uid ||
        !practiceId ||
        isFinishingPractice ||
        isAssistantTyping ||
        isAbandoningPractice

      ) {
        return;
      }

      try {
        setIsFinishingPractice(true);

        const result =
          await finalizePracticeHistory(
            conversation.practiceHistoryId
          );

        console.log(
          "Practice finalized:",
          result
        );
        
        clearConversation();
        
        await refreshAdaptiveProfile();

        router.push("/progress");
      } catch (error) {
        console.error(
          "Error finishing practice:",
          error
        );
      } finally {
        setIsFinishingPractice(false);
      }
    };

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const practiceCreationRef = useRef(null);
  const typingAnimationRef = useRef(null);

  const learningSummary  =
    conversation?.learningSummary  ||
    createEmptyLearningSummary ();


  /*
 * Si existe practiceId en la URL,
 * Firestore tiene prioridad sobre
 * cualquier conversación local.
 */
  useEffect(() => {
    let cancelled = false;

    const restorePracticeFromFirestore =
      async () => {
        if (
          !user?.uid ||
          !practiceIdFromUrl
        ) {
          return;
        }

        try {
          const practice =
            await getPracticeHistoryById(
              practiceIdFromUrl,
              user.uid
            );

          if (cancelled) {
            return;
          }

          if (
            !practice ||
            practice.status !==
              "in_progress"
          ) {
            console.error(
              "Active practice not found."
            );

            router.replace("/home");
            return;
          }

          const feedbackHistory =
            Array.isArray(
              practice.feedbackHistory
            )
              ? practice.feedbackHistory
              : [];

          const latestFeedback =
            feedbackHistory.length > 0
              ? feedbackHistory[
                  feedbackHistory.length - 1
                ]
              : null;

          const restoredConversation = {
            id:
              practice.conversationId ||
              crypto.randomUUID(),

            context: {
              unitId:
                practice.unitId || "",

              unitTitle:
                practice.unitTitle || "",

              topicId:
                practice.topicId || "",

              topicTitle:
                practice.topicTitle || "",

              activityId:
                practice.activityId || "",

              activityType:
                practice.activityType ||
                "conversation",

              activityName:
                practice.activityName || "",

              activityDescription:
                practice.activityDescription ||
                "",
            },

            practiceHistoryId:
              practice.id,

            messages:
              Array.isArray(
                practice.messages
              ) &&
              practice.messages.length > 0
                ? practice.messages
                : [
                    createMessage({
                      role:
                        MESSAGE_ROLES.ASSISTANT,

                      content:
                        `Hello! Let’s continue practicing ${practice.topicTitle} through ${practice.activityName}.`,
                    }),
                  ],

            learningSummary: {
              corrections:
                mergeCorrections(
                  [],
                  Array.isArray(
                    practice.corrections
                  )
                    ? practice.corrections
                    : []
                ),

              newWords:
                mergeNewWords(
                  [],
                  Array.isArray(
                    practice.newWords
                  )
                    ? practice.newWords
                    : []
                ),

              grammarStructures:
                mergeGrammarStructures(
                  [],
                  Array.isArray(
                    practice
                      .grammarStructures
                  )
                    ? practice
                        .grammarStructures
                    : []
                ),

              feedback:
                latestFeedback
                  ? {
                      overall:
                        latestFeedback
                          .overall || "",

                      strengths:
                        Array.isArray(
                          latestFeedback
                            .strengths
                        )
                          ? latestFeedback
                              .strengths
                          : [],

                      improvements:
                        Array.isArray(
                          latestFeedback
                            .improvements
                        )
                          ? latestFeedback
                              .improvements
                          : [],
                    }
                  : {
                      overall: "",
                      strengths: [],
                      improvements: [],
                    },

              nextSuggestion:
                practice.nextSuggestion ||
                "",

              latestScore:
                Number.isFinite(
                  Number(
                    practice.latestScore
                  )
                )
                  ? Number(
                      practice.latestScore
                    )
                  : null,
            },

            createdAt:
              practice.startedAt
                ?.toMillis?.() ||
              Date.now(),

            updatedAt:
              Date.now(),
          };

          practiceCreationRef.current =
            null;

          setConversation(
            restoredConversation
          );

          saveConversation(
            restoredConversation
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            "Error restoring active practice:",
            error
          );
          router.replace("/home");
        }
      };

    restorePracticeFromFirestore();

    return () => {
      cancelled = true;
    };
  }, [
    user?.uid,
    practiceIdFromUrl,
    router,
  ]);

  useEffect(() => {
    if (!isFinishingPractice) {
      return;
    }
      setShowSideMenu(false);
      setShowPracticeReview(false);
      setShowChangePracticeModal(false);
      setPendingPracticeContext(null);

  }, [isFinishingPractice]);

  /* =========================================================
   CREAR CONVERSACIÓN DESDE UNA ACTIVIDAD NUEVA
  ========================================================= */
  useEffect(() => {
    if (
      !user?.uid ||
      !hasNewPracticeContext
    ) {
      return;
    }

    const newContext = {
      unitId:
        unitIdFromUrl || "",

      unitTitle:
        unitTitleFromUrl || "",

      topicId:
        topicIdFromUrl || "",

      topicTitle:
        topicTitleFromUrl || "",

      activityId:
        activityIdFromUrl || "",

      activityType:
        activityTypeFromUrl ||
        "conversation",

      activityName:
        activityNameFromUrl ||
        "English practice",

      activityDescription:
        activityDescriptionFromUrl || "",
    };

    const initialTutorMessage =
      createMessage({
        role:
          MESSAGE_ROLES.ASSISTANT,

        content:
          `Hello! Let’s practice ${newContext.topicTitle} through ${newContext.activityName}.`,
      });

    const newConversation = {
      ...createNewConversation(
        newContext
      ),

      practiceHistoryId: null,

      learningSummary:
        createEmptyLearningSummary(),

      messages: [
        initialTutorMessage,
      ],
    };

    practiceCreationRef.current =
      null;

    setConversation(
      newConversation
    );

    saveConversation(
      newConversation
    );
  }, [
    user?.uid,
    hasNewPracticeContext,
    unitIdFromUrl,
    unitTitleFromUrl,
    topicIdFromUrl,
    topicTitleFromUrl,
    activityIdFromUrl,
    activityTypeFromUrl,
    activityNameFromUrl,
    activityDescriptionFromUrl,
  ]);

  /* =========================================================
     CARGA INICIAL DE LA CONVERSACIÓN
  ========================================================= */
  useEffect(() => {
    const loadSavedConversation = async () => {

      if (practiceIdFromUrl || hasNewPracticeContext || !user?.uid) {
        return;
      }

      const savedConversation = getConversation();

      if (!savedConversation) return;

      let conversationToLoad = savedConversation;

      const savedMessages =
        Array.isArray(
          savedConversation.messages
        )
          ? savedConversation.messages
          : [];

      if (savedMessages.length === 0) {
        const firstBotMessage = createMessage({
          role: MESSAGE_ROLES.ASSISTANT,
          content: `Hello! Let’s practice ${savedConversation.context.topicTitle} through ${savedConversation.context.activityName}.`,
        });

        conversationToLoad = addMessageToConversation(
          savedConversation,
          firstBotMessage
        );
      }

      /*
        Firestore será la fuente persistente del resumen.
        Si existe una práctica asociada, se recupera y se
        combina con la conversación local.
      */
      if (conversationToLoad.practiceHistoryId) {
        try {
          const practiceData =
            await getPracticeHistoryById(
              conversationToLoad.practiceHistoryId,
              user.uid
            );

          const feedbackHistory =
            Array.isArray(
              practiceData.feedbackHistory
            )
              ? practiceData.feedbackHistory
              : [];

          const latestFeedback =
            feedbackHistory.length > 0
              ? feedbackHistory[
                  feedbackHistory.length - 1
                ]
              : null;

          if (
            !practiceData ||
            practiceData.status !== "in_progress"
          ) {
            router.replace("/home");
            return;
          }

          conversationToLoad = {
            ...conversationToLoad,

            learningSummary: {
              corrections: mergeCorrections(
                [],
                Array.isArray(practiceData.corrections)
                  ? practiceData.corrections
                  : []
              ),

              newWords: mergeNewWords(
                [],
                Array.isArray(practiceData.newWords)
                  ? practiceData.newWords
                  : []
              ),

              grammarStructures:
                mergeGrammarStructures(
                  [],
                  Array.isArray(
                    practiceData.grammarStructures
                  )
                    ? practiceData.grammarStructures
                    : []
                ),
              
              feedback:
                latestFeedback
                  ? {
                      overall:
                        latestFeedback.overall ||
                        "",

                      strengths:
                        Array.isArray(
                          latestFeedback.strengths
                        )
                          ? latestFeedback.strengths
                          : [],

                      improvements:
                        Array.isArray(
                          latestFeedback.improvements
                        )
                          ? latestFeedback.improvements
                          : [],
                    }
                  : {
                      overall: "",
                      strengths: [],
                      improvements: [],
                    },

              nextSuggestion:
                practiceData.nextSuggestion ||
                "",

              latestScore:
                Number.isFinite(
                  Number(
                    practiceData.latestScore
                  )
                )
                  ? Number(
                      practiceData.latestScore
                    )
                  : null,
              
            },

            updatedAt: Date.now(),
          };
        } catch (error) {
          console.error(
            "Error loading conversation from Firestore:",
            error
          );

          router.replace("/home");
          return;
        }
      }

      setConversation(conversationToLoad);
      saveConversation(conversationToLoad);
    };

    loadSavedConversation();
  }, [practiceIdFromUrl, hasNewPracticeContext, user?.uid]);

  useEffect(() => {
    return () => {
      if (typingAnimationRef.current) {
        clearInterval(typingAnimationRef.current);
      }
    };
  }, []);

  /* =========================================================
     AUTO SCROLL AL ÚLTIMO MENSAJE
  ========================================================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    conversation?.messages,
    isAssistantTyping,
    animatedAssistantText,
  ]);


  useEffect(() => {
    if (!isAssistantTyping && conversation) {
      inputRef.current?.focus();
    }
  }, [isAssistantTyping, conversation]);

  useEffect(() => {
    if (
      !conversation?.context ||
      !user?.uid ||
      conversation.practiceHistoryId
    ) {
      return;
    }

    registerPracticeHistory(
      conversation.context,
      conversation
    );
  }, [
    conversation?.context,
    conversation?.practiceHistoryId,
    user?.uid
  ]);

  useEffect(() => {
    const loadAdaptiveProfile = async () => {
      if (!user?.uid) {
        setAdaptiveStudentProfile(null);
        return;
      }

      try {
        setLoadingAdaptiveProfile(true);

        const history =
          await getUserPracticeHistory(
            user.uid
          );

        const studentProfile =
          buildAdaptiveStudentProfile(
            Array.isArray(history)
              ? history
              : []
          );

        setAdaptiveStudentProfile(
          studentProfile
        );

        console.log(
          "Adaptive student profile:",
          studentProfile
        );
      } catch (error) {
        console.error(
          "Error loading adaptive student profile:",
          error
        );

        setAdaptiveStudentProfile(null);
      } finally {
        setLoadingAdaptiveProfile(false);
      }
    };

    loadAdaptiveProfile();
  }, [user?.uid]);

  const animateAssistantReply = (text) => {
    return new Promise((resolve) => {
      if (!text) {
        resolve();
        return;
      }

      if (typingAnimationRef.current) {
        clearInterval(typingAnimationRef.current);
      }

      const characters = Array.from(text);
      let currentIndex = 0;

      setAnimatedAssistantText("");
      setIsAnimatingAssistant(true);

      typingAnimationRef.current = setInterval(() => {
        currentIndex += 1;

        setAnimatedAssistantText(
          characters.slice(0, currentIndex).join("")
        );

        if (currentIndex >= characters.length) {
          clearInterval(typingAnimationRef.current);
          typingAnimationRef.current = null;
          setIsAnimatingAssistant(false);
          resolve();
        }
      }, 14);
    });
  };

  /* =========================================================
     ENVÍO DE MENSAJES AL CHAT
  ========================================================= */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = inputMessage.trim();
    
    if (!trimmedMessage || !conversation || isAssistantTyping || isFinishingPractice) {
      return;
    }

    const userMessage = createMessage({
      role: MESSAGE_ROLES.USER,
      content: trimmedMessage,
    });

    const updatedConversation = addMessageToConversation(
      conversation,
      userMessage
    );

    setConversation(updatedConversation);
    saveConversation(updatedConversation);

    setInputMessage("");
    setIsAssistantTyping(true);

    try {
      const { context } = updatedConversation;

      const payload = {
        unit: {
          id: context.unitId,
          title: context.unitTitle,
        },

        topic: {
          id: context.topicId,
          title: context.topicTitle,
        },

        activity: {
          type: context.activityType || "conversation",
          name: context.activityName,
          instructions:
            context.activityDescription ||
            "Guide the student through a complete A1 practice activity.",
        },

        difficulty: "Beginner",
        studentProfile:
          adaptiveStudentProfile || {
            hasHistoricalData: false,
            hasEvaluatedData: false,

            averageScore: null,

            performance: {
              accuracy: null,
              grammar: null,
              vocabulary: null,
              interaction: null,
            },

            skillLevels: {
              accuracy: "unknown",
              grammar: "unknown",
              vocabulary: "unknown",
              interaction: "unknown",
            },

            recommendedDifficulty:
              "beginner_standard",

            frequentErrors: [],
            learnedVocabulary: [],

            teachingPriorities: [
              "Use a balanced A1 approach and observe the student's current response before adapting.",
            ],

            adaptation: {
              correctionIntensity:
                "balanced",

              questionStyle:
                "guided_open",

              responseLength:
                "short_complete",

              scaffoldingLevel:
                "medium",
            },

            feedbackStrategy: {
              hasReliableHistory: false,

              weakestSkill: null,
              strongestSkill: null,

              correctionMode:
                "balanced",

              interactionSupport:
                "standard",

              maximumCorrectionsPerTurn:
                1,

              requestReformulation:
                false,

              praiseSpecificStrength:
                true,

              recurringTargets: [],
            },
          },

        // El último mensaje se envía por separado como userMessage.
        recentMessages: updatedConversation.messages
          .slice(0, -1)
          .filter(
            (message) =>
              message &&
              typeof message.content === "string" &&
              message.content.trim()
          )
          .map((message) => ({
            role:
              message.role === MESSAGE_ROLES.ASSISTANT
                ? "assistant"
                : "user",
            content: message.content,
          })),

        userMessage: trimmedMessage,
      };

      console.log("Payload enviado a Gemini:", payload);

      console.log(
        "Feedback strategy sent:",
        payload
          .studentProfile
          ?.feedbackStrategy
      );

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("STATUS:", response.status);
      console.log("DATA:", data);

      if (!response.ok) {
        console.error("Backend response error:", data);

        throw new Error(
          data.details ||
            data.error ||
            "Chat request failed."
        );
      }

      console.log("Respuesta pedagógica de Gemini:", data);

      if (!data.assistantReply) {
        throw new Error(
          "Gemini did not return assistantReply."
        );
      }

      const currentSummary =
        updatedConversation.learningSummary ||
        createEmptyLearningSummary();

      const updatedLearningSummary = {
        corrections:
          mergeCorrections(
            currentSummary.corrections,
            Array.isArray(
              data.corrections
            )
              ? data.corrections
              : []
          ),

        newWords:
          mergeNewWords(
            currentSummary.newWords,
            Array.isArray(
              data.newWords
            )
              ? data.newWords
              : []
          ),

        grammarStructures:
          mergeGrammarStructures(
            currentSummary
              .grammarStructures,
            Array.isArray(
              data.grammarStructures
            )
              ? data.grammarStructures
              : []
          ),

        feedback:
          data?.feedback &&
          typeof data.feedback ===
            "object"
            ? {
                overall:
                  data.feedback
                    .overall || "",

                strengths:
                  Array.isArray(
                    data.feedback
                      .strengths
                  )
                    ? data.feedback
                        .strengths
                    : [],

                improvements:
                  Array.isArray(
                    data.feedback
                      .improvements
                  )
                    ? data.feedback
                        .improvements
                    : [],
              }
            : currentSummary.feedback ||
              {
                overall: "",
                strengths: [],
                improvements: [],
              },

        nextSuggestion:
          data?.nextSuggestion ||
          currentSummary
            .nextSuggestion ||
          "",

        latestScore:
          Number.isFinite(
            Number(data?.score)
          )
            ? Number(data.score)
            : currentSummary
                .latestScore ??
              null,
      };

      let activePracticeHistoryId =
        updatedConversation.practiceHistoryId || null;

      if (!activePracticeHistoryId) {
        activePracticeHistoryId =
          await registerPracticeHistory(
            updatedConversation.context,
            updatedConversation
          );
      }

      const conversationWithSummary = {
        ...updatedConversation,

        practiceHistoryId:
          activePracticeHistoryId || null,

        learningSummary: updatedLearningSummary,

        updatedAt: Date.now(),
      };

      /*
        Guarda primero el resumen local para que la conversación
        mantenga los datos aunque la animación tarde.
      */
      setConversation(
        conversationWithSummary
      );

      saveConversation(
        conversationWithSummary
      );

      /*
        Persiste en Firestore antes de iniciar la animación.
      */

      const assistantMessage =
        createMessage({
          role:
            MESSAGE_ROLES.ASSISTANT,

          content:
            data.assistantReply,
        });

      const persistedMessages = [
        ...conversationWithSummary.messages,
        assistantMessage,
      ];

      if (activePracticeHistoryId) {
        try {
          await updatePracticeHistoryWithAI({
            practiceHistoryId:
              activePracticeHistoryId,

            aiResponse: data,

            studentMessage:
              trimmedMessage,

            messages:
              persistedMessages,
          });
        } catch (persistenceError) {
          console.error(
            "The tutor replied, but the practice history could not be updated:",
            persistenceError
          );
        }
      }

      await animateAssistantReply(
        data.assistantReply
      );

      const conversationWithAssistant =
        addMessageToConversation(
          conversationWithSummary,
          assistantMessage
        );

      setConversation(conversationWithAssistant);
      saveConversation(conversationWithAssistant);

      /*
        La burbuja temporal se limpia porque el mensaje completo
        ya forma parte de la conversación.
      */
      setAnimatedAssistantText("");

      console.log("Corrections:", data.corrections);
      console.log("New words:", data.newWords);
      console.log(
        "Grammar structures:",
        data.grammarStructures
      );
      console.log("Feedback:", data.feedback);
      console.log("Score:", data.score);
      console.log(
        "Activity completed:",
        data.activityCompleted
      );
      console.log(
        "Next suggestion:",
        data.nextSuggestion
      );
    } catch (error) {
      console.error(
        "Error sending message to backend:",
        error
      );

      if (typingAnimationRef.current) {
        clearInterval(typingAnimationRef.current);
        typingAnimationRef.current = null;
      }

      setAnimatedAssistantText("");
      setIsAnimatingAssistant(false);

      const errorMessage = createMessage({
        role: MESSAGE_ROLES.ASSISTANT,
        content:
          "Sorry, I could not process your message right now. Please try again.",
      });

      const conversationWithError =
        addMessageToConversation(
          updatedConversation,
          errorMessage
        );

      setConversation(conversationWithError);
      saveConversation(conversationWithError);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  const registerPracticeHistory = async (
    context,
    sourceConversation = conversation
  ) => {
    if (!user?.uid || !context) {
      return null;
    }

    /*
      Si la conversación ya está vinculada con una práctica,
      se reutiliza el documento existente.
    */
    if (sourceConversation?.practiceHistoryId) {
      return sourceConversation.practiceHistoryId;
    }

    /*
      Si ya hay una creación en curso, se devuelve la misma
      promesa para evitar documentos duplicados.
    */
    if (practiceCreationRef.current) {
      return practiceCreationRef.current;
    }

    const createPractice = async () => {
      try {
        const historyItem = createPracticeHistoryItem({
          userId: user.uid,

          unitId: context.unitId,
          unitTitle: context.unitTitle,

          topicId: context.topicId,
          topicTitle: context.topicTitle,

          activityType: context.activityType,
          activityName: context.activityName,

          activityDescription:
            context.activityDescription || "",
          
          activityId: context.activityId || "",

          status: "in_progress",
        });

        const createdHistoryId =
          await savePracticeHistory(historyItem);

        setConversation((previousConversation) => {
          if (!previousConversation) {
            return previousConversation;
          }

          /*
            Si otra ejecución ya asignó un ID, no se reemplaza.
          */
          if (previousConversation.practiceHistoryId) {
            return previousConversation;
          }

          const updatedConversation = {
            ...previousConversation,
            practiceHistoryId: createdHistoryId,
            updatedAt: Date.now(),
          };

          saveConversation(updatedConversation);

          return updatedConversation;
        });

        return createdHistoryId;
      } catch (error) {
        console.error(
          "Error registering practice history:",
          error
        );

        return null;
      } finally {
        practiceCreationRef.current = null;
      }
    };

    practiceCreationRef.current = createPractice();

    return practiceCreationRef.current;
  };

  const handleGoHome = async () => {
    if (
      !conversation ||
      !user?.uid ||
      isLeavingChat ||
      isFinishingPractice ||
      isAbandoningPractice ||
      isAssistantTyping
    ) {
      return;
    }

    try {
      setIsLeavingChat(true);

      let activePracticeId =
        conversation.practiceHistoryId ||
        null;

      /*
      * Si la conversación todavía no está asociada
      * a un documento, se crea antes de salir.
      */
      if (
        !activePracticeId &&
        conversation.context
      ) {
        activePracticeId =
          await registerPracticeHistory(
            conversation.context,
            conversation
          );
      }

      if (!activePracticeId) {
        throw new Error(
          "practice-history-could-not-be-created"
        );
      }

      /*
      * Guarda localmente el ID antes de navegar,
      * para que Continue Here también pueda
      * restaurar correctamente la conversación.
      */
      const conversationToSave = {
        ...conversation,

        practiceHistoryId:
          activePracticeId,

        updatedAt:
          Date.now(),
      };

      setConversation(
        conversationToSave
      );

      saveConversation(
        conversationToSave
      );

      router.push("/home");
    } catch (error) {
      console.error(
        "Error saving practice before going home:",
        error
      );
    } finally {
      setIsLeavingChat(false);
    }
  };

  const refreshAdaptiveProfile =
    async () => {
      if (!user?.uid) {
        return;
      }

      try {
        const history =
          await getUserPracticeHistory(
            user.uid
          );

        const updatedProfile =
          buildAdaptiveStudentProfile(
            Array.isArray(history)
              ? history
              : []
          );

        setAdaptiveStudentProfile(
          updatedProfile
        );
      } catch (error) {
        console.error(
          "Error refreshing adaptive student profile:",
          error
        );
      }
    };

  const handleChangeContext = (
    newContext
  ) => {
    if (
      !newContext ||
      isAssistantTyping ||
      isFinishingPractice ||
      isAbandoningPractice
    ) {
      return;
    }

    const currentContext =
      conversation?.context;

    const isSameActivity =
      currentContext?.unitId ===
        newContext.unitId &&
      currentContext?.topicId ===
        newContext.topicId &&
      currentContext?.activityType ===
        newContext.activityType &&
      currentContext?.activityName ===
        newContext.activityName;

    if (isSameActivity) {
      setShowSideMenu(false);
      return;
    }

    if (
      conversation
        ?.practiceHistoryId
    ) {
      setPendingPracticeContext(
        newContext
      );

      setShowChangePracticeModal(
        true
      );

      return;
    }
    const chatUrl =
      buildChatUrl(newContext);

    if (!chatUrl) {
      return;
    }

    clearConversation();
    setShowSideMenu(false);
    router.replace(chatUrl);
  };

  const handleContinueCurrentPractice =
    () => {
      setPendingPracticeContext(
        null
      );

      setShowChangePracticeModal(
        false
      );

      setShowSideMenu(false);
    };

  const handleAbandonAndChange =
    async () => {
      const practiceId =
        conversation
          ?.practiceHistoryId;

      if (
        !user?.uid ||
        !practiceId ||
        !pendingPracticeContext ||
        isAbandoningPractice ||
        isFinishingPractice ||
        isAssistantTyping
      ) {
        return;
      }

      try {
        setIsAbandoningPractice(
          true
        );

        const nextContext =
          pendingPracticeContext;

        await abandonPracticeHistory({
          userId: user.uid,
          practiceId,
        });

        const chatUrl =
          buildChatUrl(
            nextContext
          );

        if (!chatUrl) {
          return;
        }

        clearConversation();

        setShowChangePracticeModal(false);

        setPendingPracticeContext(null);

        setShowSideMenu(false);
        setConversation(null);

        router.replace(chatUrl);
      } catch (error) {
        console.error(
          "Error abandoning practice:",
          error
        );
      } finally {
        setIsAbandoningPractice(
          false
        );
      }
    };

  /* =========================================================
     ESTADO CUANDO NO HAY CONVERSACIÓN SELECCIONADA
  ========================================================= */
  if (!conversation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e6e6e6] overflow-hidden">
        <p className="font-bold text-black">Loading practice...</p>
      </main>
    );
  }


  return (
    /* =========================================================
       CONTENEDOR GENERAL DE LA PÁGINA
    ========================================================= */
    <main className="h-screen bg-[#e6e6e6] flex justify-center px-2 sm:px-4 py-2 sm:py-4 overflow-hidden">
      {/* =========================================================
         CONTENEDOR PRINCIPAL DEL CHAT
      ========================================================= */}
      <section className="relative w-full max-w-[390px] sm:max-w-[520px] md:max-w-[620px] h-full bg-white border-2 border-[#f3a3a3] rounded-[8px] shadow-md overflow-hidden flex flex-col">
        
        {/* =========================================================
           HEADER PRINCIPAL
           Branding LINGUAI UV
        ========================================================= */}
        <header className="shrink-0 bg-[#b8b8b8]">
          <div className="grid grid-cols-[1fr_1px_1fr] items-center px-3 py-2">
            <div className="text-center">
              <h1 className="text-[25px] font-extrabold leading-none text-black">
                LINGUAI
              </h1>

              <p className="text-[20px] font-extrabold leading-none text-red-600">
                UV
              </p>
            </div>

            <div className="h-10 bg-white" />

            <p className="text-center text-[14px] sm:text-[16px] font-bold leading-tight text-black">
              Univalle&apos;s AI tutor for 
              <br />  
              learning English
            </p>
          </div>
        </header>

        {/* =========================================================
           BARRA DE NAVEGACIÓN Y CONTEXTO
           Menú + Unidad actual + Home
        ========================================================= */}
        <div className="shrink-0 grid grid-cols-[38px_1fr_46px] items-center bg-[#9d9d9d] border-b border-white">
          {/* Botón de menú */}
          <button
            type="button"
            onClick={() =>setShowSideMenu(true)}
            disabled={isFinishingPractice || isAbandoningPractice || isAssistantTyping || isLeavingChat}
            aria-label="Open practice menu"
            className="flex items-center justify-center border-r border-white py-1 disabled:cursor-not-allowed disabled:opacity-40 "
          >
            <Menu
              size={25}
              className="text-black"
            />
          </button>

          {/* Contexto actual de la unidad */}
          <div className="flex justify-center px-2 text-[18px] font-extrabold text-black truncate text-center">
            {conversation.context.unitTitle}
          </div>

          {/* Botón para volver al Home */}
          <button
            type="button"
            onClick={handleGoHome}
            disabled={
              isLeavingChat ||
              isFinishingPractice ||
              isAbandoningPractice ||
              isAssistantTyping
            }
            aria-label={
              isLeavingChat
                ? "Saving practice"
                : "Go to Home"
            }
            className="flex items-center justify-center border-l border-white py-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Home size={25} className="text-black fill-black" />
          </button>
        </div>

        {/* =========================================================
           ÁREA SCROLLEABLE DEL CHAT
        ========================================================= */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#f8f8f8] px-3 sm:px-5 py-5 sm:py-6 space-y-5">
          
          {/* =========================================================
             MENSAJES DE LA CONVERSACIÓN
          ========================================================= */}
          {(
            Array.isArray(conversation.messages)
              ? conversation.messages
              : []
          ).map((message) => {
            const isUser = message.role === MESSAGE_ROLES.USER;

            return (
              <div
                key={message.id}
                className={`flex items-end gap-5 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* =========================================================
                   AVATAR DEL TUTOR
                ========================================================= */}
                {!isUser && (
                  <div className="ml-2 flex flex-col items-center w-[42px] shrink-0">
                    <div className="h-8 w-8 rounded-full border border-black flex items-center justify-center bg-white">
                      <Bot size={20} />
                    </div>

                    <span className="text-[15px] font-bold text-red-600">
                      LINGUAI
                    </span>
                  </div>
                )}

                {/* =========================================================
                   BURBUJA DEL MENSAJE
                ========================================================= */}
                <div
                  className={`relative max-w-[72%] sm:max-w-[70%] whitespace-pre-wrap break-words rounded-[22px] px-4 py-3 text-[13px] sm:text-[14px] font-semibold leading-tight ${
                    isUser
                      ? "bg-[#d9d9d9] text-black rounded-br-[4px]"
                      : "bg-[#ffb3b3] text-black rounded-bl-[4px]"
                  }`}
                >
                  {message.content}
                </div>

                {/* =========================================================
                   AVATAR DEL USUARIO / ACCIONES DEL TUTOR
                ========================================================= */}
                {isUser ? (
                  /* Avatar del usuario */
                  <div className="mr-2 flex flex-col items-center w-[38px] shrink-0">
                    <User size={24} className="text-black fill-black" />

                    <span className="text-[15px] font-bold text-black">
                      {studentFirstName}
                    </span>
                  </div>
                ) : (
                  /* Acciones del tutor: audio + hint */
                  <div className="flex flex-col gap-2">
                    <Volume2 size={18} className="text-black" />
                    <Lightbulb size={18} className="text-black" />
                  </div>
                )}
              </div>
            );
          })}

          {/* =========================================================
             ESTADO VISUAL "LINGUAI IS TYPING"
          ========================================================= */}
          {isAssistantTyping && (
            <div className="flex items-end justify-start gap-5">
              {/* Avatar temporal del tutor */}
              <div className="ml-2 flex w-[42px] shrink-0 flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black bg-white">
                  <Bot size={20} />
                </div>

                <span className="text-[15px] font-bold text-red-600">
                  LINGUAI
                </span>
              </div>

              {/* Burbuja temporal */}
              <div className="relative max-w-[72%] whitespace-pre-wrap break-words rounded-[22px] rounded-bl-[4px] bg-[#ffb3b3] px-4 py-3 text-[13px] font-semibold leading-tight text-black sm:max-w-[70%] sm:text-[14px]">
                {isAnimatingAssistant || animatedAssistantText ? (
                  <>
                    {animatedAssistantText}

                    <span className="ml-[2px] inline-block animate-pulse font-bold">
                      |
                    </span>
                  </>
                ) : (
                  <div className="flex h-5 items-center gap-[3px]">
                    <span
                      className="inline-block animate-bounce text-[20px] leading-none"
                      style={{
                        animationDelay: "0ms",
                        animationDuration: "900ms",
                      }}
                    >
                      •
                    </span>

                    <span
                      className="inline-block animate-bounce text-[20px] leading-none"
                      style={{
                        animationDelay: "150ms",
                        animationDuration: "900ms",
                      }}
                    >
                      •
                    </span>

                    <span
                      className="inline-block animate-bounce text-[20px] leading-none"
                      style={{
                        animationDelay: "300ms",
                        animationDuration: "900ms",
                      }}
                    >
                      •
                    </span>
                  </div>
                )}
              </div>

              {/* Acciones visuales del tutor */}
              <div className="flex flex-col gap-2">
                <Volume2 size={18} className="text-black" />
                <Lightbulb size={18} className="text-black" />
              </div>
            </div>
          )}

          {/* =========================================================
             REFERENCIA PARA AUTO SCROLL
          ========================================================= */}
          <div ref={messagesEndRef} />
        </div>

        <PracticeReviewPanel
          isOpen={
            showPracticeReview
          }

          onClose={() =>
            setShowPracticeReview(
              false
            )
          }

          context={
            conversation?.context ||
            {}
          }

          corrections={
            learningSummary
              .corrections
          }

          newWords={
            learningSummary
              .newWords
          }

          grammarStructures={
            learningSummary
              .grammarStructures
          }

          feedback={
            learningSummary
              .feedback
          }

          nextSuggestion={
            learningSummary
              .nextSuggestion
          }

          latestScore={
            learningSummary
              .latestScore
          }

          messages={
            conversation?.messages ||
            []
          }
        />

        <ChatFooter
          inputRef={inputRef}
          inputMessage={inputMessage}
          onInputChange={(event) =>
            setInputMessage(
              event.target.value
            )
          }
          onSubmit={handleSendMessage}
          showPracticeReview={
            showPracticeReview
          }
          onTogglePracticeReview={() =>
            setShowPracticeReview(
              (previous) => !previous
            )
          }
          onFinishPractice={
            handleFinishPractice
          }
          isAssistantTyping={
            isAssistantTyping
          }
          isFinishingPractice={
            isFinishingPractice
          }
          hasPracticeHistory={Boolean(
            conversation
              ?.practiceHistoryId
          )}
        />

        <ChatSideMenu
          isOpen={showSideMenu && !isFinishingPractice}
          onClose={() => setShowSideMenu(false)}
          units={learningUnits}
          currentContext={conversation.context}
          onChangeContext={handleChangeContext}
        />

        <ActivePracticeModal
          isOpen={
            showChangePracticeModal
          }

          activePractice={{
            topicTitle:
              conversation
                ?.context?.topicTitle,

            activityName:
              conversation
                ?.context?.activityName,
          }}

          isProcessing={
            isAbandoningPractice
          }

          onContinue={
            handleContinueCurrentPractice
          }

          onAbandon={
            handleAbandonAndChange
          }

          onClose={() => {
            if (
              isAbandoningPractice
            ) {
              return;
            }

            setShowChangePracticeModal(
              false
            );

            setPendingPracticeContext(
              null
            );
          }}
        />
      </section>
    </main>
  );
}
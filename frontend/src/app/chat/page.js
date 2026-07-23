"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Home,
  Menu,
  Mic,
  Send,
  User,
  Volume2,
  Lightbulb,
} from "lucide-react";

import {
  getConversation,
  saveConversation,
  createMessage,
  addMessageToConversation,
  createEmptyLearningSummary,
  MESSAGE_ROLES,
} from "../../utils/chatModel";

import ChatSideMenu from "../../components/chat/ChatSideMenu";
import { learningUnits } from "../../data/learningContent";
import LearningSummaryPanel from "../../components/chat/LearningSummaryPanel";
import { useAuth } from "../../context/AuthContext";
import {
  createPracticeHistoryItem,
  getPracticeHistoryById,
  savePracticeHistory,
  updatePracticeHistoryWithAI,
  finalizePracticeHistory,
  getUserPracticeHistory,
} from "../../services/practiceHistoryService";

import {
  buildAdaptiveStudentProfile,
} from "../../utils/adaptiveProfileCalculations";


export default function ChatPage() {
  /* =========================================================
     HOOKS Y ESTADOS PRINCIPALES
  ========================================================= */
  const router = useRouter();
  const { user } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showLearningSummary, setShowLearningSummary] = useState(false);
  const [animatedAssistantText, setAnimatedAssistantText] = useState("");
  const [isAnimatingAssistant, setIsAnimatingAssistant] = useState(false);

  const [
    adaptiveStudentProfile,
    setAdaptiveStudentProfile,
  ] = useState(null);

  const [
    loadingAdaptiveProfile,
    setLoadingAdaptiveProfile,
  ] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const practiceCreationRef = useRef(null);
  const typingAnimationRef = useRef(null);

  const learningSummary =
    conversation?.learningSummary ||
    createEmptyLearningSummary();
    

  /* =========================================================
     CARGA INICIAL DE LA CONVERSACIÓN
  ========================================================= */
  useEffect(() => {
    const loadSavedConversation = async () => {
      const savedConversation = getConversation();

      if (!savedConversation) return;

      let conversationToLoad = savedConversation;

      if (savedConversation.messages.length === 0) {
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
              conversationToLoad.practiceHistoryId
            );

          if (practiceData) {
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
              },

              updatedAt: Date.now(),
            };
          }
        } catch (error) {
          console.error(
            "Error loading learning summary from Firestore:",
            error
          );
        }
      }

      setConversation(conversationToLoad);
      saveConversation(conversationToLoad);
    };

    loadSavedConversation();
  }, []);

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
    user?.uid,
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
    
    if (!trimmedMessage || !conversation || isAssistantTyping) {
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
        studentProfile: adaptiveStudentProfile,

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
        corrections: mergeCorrections(
          currentSummary.corrections,
          Array.isArray(data.corrections)
            ? data.corrections
            : []
        ),

        newWords: mergeNewWords(
          currentSummary.newWords,
          Array.isArray(data.newWords)
            ? data.newWords
            : []
        ),

        grammarStructures: mergeGrammarStructures(
          currentSummary.grammarStructures,
          Array.isArray(data.grammarStructures)
            ? data.grammarStructures
            : []
        ),
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

      if (activePracticeHistoryId) {
        try {
          await updatePracticeHistoryWithAI({
            practiceHistoryId: activePracticeHistoryId,
            aiResponse: data,
            studentMessage: trimmedMessage,
          });
        } catch (persistenceError) {
          console.error(
            "The tutor replied, but the practice history could not be updated:",
            persistenceError
          );
        }
      }

      /*
        Después de persistir, se muestra la respuesta
        progresivamente.
      */

      await animateAssistantReply(data.assistantReply);

      const assistantMessage = createMessage({
        role: MESSAGE_ROLES.ASSISTANT,
        content: data.assistantReply,
      });

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

  const handleChangeContext = async (newContext) => {
    if (!newContext || isAssistantTyping) {
      return;
    }

    const currentContext = conversation?.context;

    const isSameActivity =
      currentContext?.unitId === newContext.unitId &&
      currentContext?.topicId === newContext.topicId &&
      currentContext?.activityType === newContext.activityType &&
      currentContext?.activityName === newContext.activityName;

    if (isSameActivity) {
      setShowSideMenu(false);
      return;
    }

    try {
      if (conversation?.practiceHistoryId) {
        await finalizePracticeHistory(
          conversation.practiceHistoryId
        );

        await refreshAdaptiveProfile();
      }

      const initialTutorMessage = createMessage({
        role: MESSAGE_ROLES.ASSISTANT,
        content: `Great! Now let’s practice ${newContext.topicTitle} through ${newContext.activityName}.`,
      });

      const newConversation = {
        id: crypto.randomUUID(),

        context: {
          unitId: newContext.unitId,
          unitTitle: newContext.unitTitle,

          topicId: newContext.topicId,
          topicTitle: newContext.topicTitle,

          activityType:
            newContext.activityType ||
            "conversation",

          activityName:
            newContext.activityName,

          activityDescription:
            newContext.activityDescription || "",
        },

        practiceHistoryId: null,

        learningSummary:
          createEmptyLearningSummary(),

        messages: [initialTutorMessage],

        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setConversation(newConversation);
      saveConversation(newConversation);

      setShowLearningSummary(false);
      setShowSideMenu(false);
      setInputMessage("");
      setAnimatedAssistantText("");
    } catch (error) {
      console.error(
        "Error changing practice activity:",
        error
      );
    }
  };

  /* =========================================================
     ESTADO CUANDO NO HAY CONVERSACIÓN SELECCIONADA
  ========================================================= */
  if (!conversation) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#e6e6e6] overflow-hidden">
        <p className="font-bold text-black">No conversation selected.</p>
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
            onClick={() => setShowSideMenu(true)}
            className="flex items-center justify-center border-r border-white py-1">
            <Menu size={25} className="text-black" />
          </button>

          {/* Contexto actual de la unidad */}
          <div className="flex justify-center px-2 text-[18px] font-extrabold text-black truncate text-center">
            {conversation.context.unitTitle}
          </div>

          {/* Botón para volver al Home */}
          <button
            onClick={() => router.push("/home")}
            className="flex items-center justify-center border-l border-white py-1"
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
          {conversation.messages.map((message) => {
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
                      Hernan
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

        <LearningSummaryPanel
          isOpen={showLearningSummary}
          onClose={() => setShowLearningSummary(false)}
          corrections={learningSummary.corrections}
          newWords={learningSummary.newWords}
          grammarStructures={learningSummary.grammarStructures}
        />

        {/* =========================================================
           FOOTER DEL CHAT
           Learning Summary + Input de mensaje
        ========================================================= */}
        <div className="shrink-0 bg-[#eeeeee] px-3 py-2">
          
          {/* =========================================================
             BOTÓN LEARNING SUMMARY
          ========================================================= */}
          <button
            type="button"
            onClick={() => setShowLearningSummary((prev) => !prev)}
            className={`mb-2 rounded-md px-3 py-1 text-[14px] font-extrabold text-white shadow transition-all duration-100 hover:scale-[1.02] active:scale-95 active:translate-y-[1px] ${
              showLearningSummary
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#9d9d9d] hover:bg-[#8c8c8c]"
            }`}
          >
            Learning summary
          </button>

          {/* =========================================================
             FORMULARIO DE ENVÍO DE MENSAJES
          ========================================================= */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 rounded-full bg-[#d9d9d9] px-3 py-2"
          >
            {/* Botón de micrófono */}
            <button
              type="button"
              className="h-8 w-8 rounded-full bg-black flex items-center justify-center"
            >
              <Mic size={18} className="text-white" />
            </button>

            {/* Input de texto */}
            <input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isAssistantTyping}
              placeholder="Type a message here"
              className="flex-1 bg-transparent text-[14px] font-semibold text-black outline-none placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            />

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={
                isAssistantTyping ||
                !inputMessage.trim()
              }
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={22} className="text-black" />
            </button>
          </form>
        </div>

        <ChatSideMenu
          isOpen={showSideMenu}
          onClose={() => setShowSideMenu(false)}
          units={learningUnits}
          currentContext={conversation.context}
          onChangeContext={handleChangeContext}
        />
      </section>
    </main>
  );
}

function normalizeText(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"`´]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeCorrectionType(type = "") {
  const normalizedType = normalizeText(type);

  const supportedTypes = [
    "grammar",
    "vocabulary",
    "spelling",
    "capitalization",
    "coherence",
    "word_order",
    "other",
  ];

  return supportedTypes.includes(normalizedType)
    ? normalizedType
    : "grammar";
}

function buildCorrectionKey(correction) {
  const wrong = normalizeText(correction?.wrong);
  const correct = normalizeText(correction?.correct);
  const type = normalizeCorrectionType(correction?.type);

  return `${type}|${wrong}|${correct}`;
}

function mergeCorrections(currentCorrections, incomingCorrections) {
  const correctionsMap = new Map();

  currentCorrections.forEach((correction) => {
    if (!correction?.wrong || !correction?.correct) return;

    const key = buildCorrectionKey(correction);

    correctionsMap.set(key, {
      wrong: correction.wrong.trim(),
      correct: correction.correct.trim(),
      explanation: correction.explanation || "",
      type: normalizeCorrectionType(correction.type),
      occurrences:
        typeof correction.occurrences === "number"
          ? correction.occurrences
          : 1,
    });
  });

  incomingCorrections.forEach((correction) => {
    if (!correction?.wrong || !correction?.correct) return;

    const key = buildCorrectionKey(correction);
    const existingCorrection = correctionsMap.get(key);

    if (existingCorrection) {
      correctionsMap.set(key, {
        ...existingCorrection,

        // Conserva la explicación más completa.
        explanation:
          (correction.explanation || "").length >
          (existingCorrection.explanation || "").length
            ? correction.explanation
            : existingCorrection.explanation,

        occurrences: existingCorrection.occurrences + 1,
      });

      return;
    }

    correctionsMap.set(key, {
      wrong: correction.wrong.trim(),
      correct: correction.correct.trim(),
      explanation: correction.explanation || "",
      type: normalizeCorrectionType(correction.type),
      occurrences: 1,
    });
  });

  return Array.from(correctionsMap.values());
}

function mergeNewWords(currentWords, incomingWords) {
  const wordsMap = new Map();

  currentWords.forEach((item) => {
    if (!item?.word) return;

    const key = normalizeText(item.word);

    wordsMap.set(key, {
      word: item.word.trim(),
      meaning: item.meaning || item.definition || "",
      example: item.example || "",
      occurrences:
        typeof item.occurrences === "number"
          ? item.occurrences
          : 1,
    });
  });

  incomingWords.forEach((item) => {
    if (!item?.word) return;

    const key = normalizeText(item.word);
    const existingWord = wordsMap.get(key);

    if (existingWord) {
      wordsMap.set(key, {
        ...existingWord,

        meaning:
          existingWord.meaning ||
          item.meaning ||
          item.definition ||
          "",

        example:
          existingWord.example ||
          item.example ||
          "",

        occurrences: existingWord.occurrences + 1,
      });

      return;
    }

    wordsMap.set(key, {
      word: item.word.trim(),
      meaning: item.meaning || item.definition || "",
      example: item.example || "",
      occurrences: 1,
    });
  });

  return Array.from(wordsMap.values());
}

function mergeGrammarStructures(
  currentStructures = [],
  incomingStructures = []
) {
  const structuresMap = new Map();

  [...currentStructures, ...incomingStructures].forEach(
    (item) => {
      let normalizedItem;

      if (typeof item === "string") {
        normalizedItem = {
          structure: item.trim(),
          explanation: "",
          example: "",
        };
      } else if (
        item &&
        typeof item === "object"
      ) {
        normalizedItem = {
          structure:
            item.structure?.trim() ||
            item.name?.trim() ||
            item.title?.trim() ||
            "",

          explanation:
            item.explanation?.trim() || "",

          example:
            item.example?.trim() || "",
        };
      } else {
        return;
      }

      if (!normalizedItem.structure) {
        return;
      }

      const key = normalizeText(
        normalizedItem.structure
      );

      const existingStructure =
        structuresMap.get(key);

      if (existingStructure) {
        structuresMap.set(key, {
          structure:
            existingStructure.structure,

          explanation:
            existingStructure.explanation ||
            normalizedItem.explanation,

          example:
            existingStructure.example ||
            normalizedItem.example,
        });

        return;
      }

      structuresMap.set(
        key,
        normalizedItem
      );
    }
  );

  return Array.from(
    structuresMap.values()
  );
}
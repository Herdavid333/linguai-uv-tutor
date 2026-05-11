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
  MESSAGE_ROLES,
} from "../../utils/chatModel";

import { buildChatPayload } from "../../utils/buildChatPayload";

export default function ChatPage() {
  /* =========================================================
     HOOKS Y ESTADOS PRINCIPALES
  ========================================================= */
  const router = useRouter();

  const [conversation, setConversation] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const messagesEndRef = useRef(null);

  /* =========================================================
     CARGA INICIAL DE LA CONVERSACIÓN
  ========================================================= */
  useEffect(() => {
    const saved = getConversation();

    if (saved) {
      if (saved.messages.length === 0) {
        const firstBotMessage = createMessage({
          role: MESSAGE_ROLES.ASSISTANT,
          content: `Hello! Let’s practice ${saved.context.topicTitle} through ${saved.context.activityName}.`,
        });

        const updated = addMessageToConversation(saved, firstBotMessage);

        setConversation(updated);
        saveConversation(updated);
      } else {
        setConversation(saved);
      }
    }
  }, []);

  /* =========================================================
     AUTO SCROLL AL ÚLTIMO MENSAJE
  ========================================================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [conversation?.messages, isAssistantTyping]);

  /* =========================================================
     ENVÍO DE MENSAJES AL CHAT
  ========================================================= */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !conversation || isAssistantTyping) return;

    const userMessage = createMessage({
      role: MESSAGE_ROLES.USER,
      content: inputMessage.trim(),
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
      const payload = buildChatPayload(updatedConversation, userMessage);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chat request failed.");
      }

      const assistantMessage = createMessage({
        role: MESSAGE_ROLES.ASSISTANT,
        content: data.content,
      });

      const conversationWithAssistant = addMessageToConversation(
        updatedConversation,
        assistantMessage
      );

      setConversation(conversationWithAssistant);
      saveConversation(conversationWithAssistant);
    } catch (error) {
      console.error("Error sending message to backend:", error);

      const errorMessage = createMessage({
        role: MESSAGE_ROLES.ASSISTANT,
        content:
          "Sorry, I could not process your message right now. Please try again.",
      });

      const conversationWithError = addMessageToConversation(
        updatedConversation,
        errorMessage
      );

      setConversation(conversationWithError);
      saveConversation(conversationWithError);
    } finally {
      setIsAssistantTyping(false);
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
      <section className="w-full max-w-[390px] sm:max-w-[520px] md:max-w-[620px] h-full bg-white border-2 border-[#f3a3a3] rounded-[8px] shadow-md overflow-hidden flex flex-col">
        
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

            <p className="text-center text-[16px] font-bold leading-tight text-black">
              Univalle&apos;s AI tutor for learning English
            </p>
          </div>
        </header>

        {/* =========================================================
           BARRA DE NAVEGACIÓN Y CONTEXTO
           Menú + Unidad actual + Home
        ========================================================= */}
        <div className="shrink-0 grid grid-cols-[38px_1fr_46px] items-center bg-[#9d9d9d] border-b border-white">
          {/* Botón de menú */}
          <button className="flex items-center justify-center border-r border-white py-1">
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
            <div className="flex justify-end items-center gap-2 pr-8">
              <span className="text-[22px] tracking-[3px] text-black">
                •••
              </span>

              <span className="text-[11px] font-extrabold text-black">
                LINGUAI is Typing
              </span>
            </div>
          )}

          {/* =========================================================
             REFERENCIA PARA AUTO SCROLL
          ========================================================= */}
          <div ref={messagesEndRef} />
        </div>

        {/* =========================================================
           FOOTER DEL CHAT
           Learning Summary + Input de mensaje
        ========================================================= */}
        <div className="shrink-0 bg-[#eeeeee] px-3 py-2">
          
          {/* =========================================================
             BOTÓN LEARNING SUMMARY
          ========================================================= */}
          <button className="mb-2 rounded-md bg-[#9d9d9d] px-3 py-1 text-[14px] font-extrabold text-white shadow">
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
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isAssistantTyping}
              placeholder={
                isAssistantTyping
                  ? "LINGUAI is responding..."
                  : "Type a message here"
              }
              className="flex-1 bg-transparent text-[14px] font-semibold text-black outline-none placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            />

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isAssistantTyping}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={22} className="text-black" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
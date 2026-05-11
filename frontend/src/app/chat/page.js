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
  const router = useRouter();
  const [conversation, setConversation] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [conversation?.messages, isAssistantTyping]);

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

  if (!conversation) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#e6e6e6] overflow-hidden">
        <p className="font-bold text-black">No conversation selected.</p>
      </main>
    );
  }

  return (
    <main className="h-screen bg-[#e6e6e6] flex justify-center px-3 py-3 overflow-hidden">
      <section className="w-full max-w-[550px] h-full bg-white border-2 border-[#f3a3a3] rounded-[8px] shadow-md overflow-hidden flex flex-col">
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

        <div className="shrink-0 grid grid-cols-[38px_1fr_46px] items-center bg-[#9d9d9d] border-b border-white">
          <button className="flex items-center justify-center border-r border-white py-1">
            <Menu size={25} className="text-black" />
          </button>

          <div className="flex justify-center px-2 text-[18px] font-extrabold text-black truncate text-center">
            {conversation.context.unitTitle}
          </div>

          <button
            onClick={() => router.push("/home")}
            className="flex items-center justify-center border-l border-white py-1"
          >
            <Home size={25} className="text-black fill-black" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto bg-[#f8f8f8] px-3 py-6 space-y-5">
          {conversation.messages.map((message) => {
            const isUser = message.role === MESSAGE_ROLES.USER;

            return (
              <div
                key={message.id}
                className={`flex items-end gap-5 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
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

                <div
                  className={`relative max-w-[70%] whitespace-pre-wrap break-words rounded-[22px] px-4 py-3 text-[14px] font-semibold leading-tight ${
                    isUser
                      ? "bg-[#d9d9d9] text-black rounded-br-[4px]"
                      : "bg-[#ffb3b3] text-black rounded-bl-[4px]"
                  }`}
                >
                  {message.content}
                </div>

                {isUser ? (
                  <div className="flex flex-col items-center w-[38px] shrink-0">
                    <User size={24} className="text-black fill-black" />
                    <span className="text-[15px] font-bold text-black">
                      Hernan
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Volume2 size={18} className="text-black" />
                    <Lightbulb size={18} className="text-black" />
                  </div>
                )}
              </div>
            );
          })}

          {isAssistantTyping && (
            <div className="flex justify-end items-center gap-2 pr-8">
              <span className="text-[22px] tracking-[3px] text-black">•••</span>
              <span className="text-[11px] font-extrabold text-black">
                LINGUAI is Typing
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />

        </div>

        <div className="shrink-0 bg-[#eeeeee] px-3 py-2">
          <button className="mb-2 rounded-md bg-[#9d9d9d] px-3 py-1 text-[14px] font-extrabold text-white shadow">
            Learning summary
          </button>

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 rounded-full bg-[#d9d9d9] px-3 py-2"
          >
            <button
              type="button"
              className="h-8 w-8 rounded-full bg-black flex items-center justify-center"
            >
              <Mic size={18} className="text-white" />
            </button>

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
"use client";

import { useEffect, useState } from "react";
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

export default function ChatPage() {
  const router = useRouter();
  const [conversation, setConversation] = useState(null);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    const saved = getConversation();

    if (saved) {
      if (saved.messages.length === 0) {
        const firstBotMessage = createMessage({
          role: MESSAGE_ROLES.ASSISTANT,
          content: "Hello! Let’s practice about introductions.",
        });

        const updated = addMessageToConversation(saved, firstBotMessage);
        setConversation(updated);
        saveConversation(updated);
      } else {
        setConversation(saved);
      }
    }
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !conversation) return;

    const userMessage = createMessage({
      role: MESSAGE_ROLES.USER,
      content: inputMessage.trim(),
    });

    const updated = addMessageToConversation(conversation, userMessage);

    const botMessage = createMessage({
      role: MESSAGE_ROLES.ASSISTANT,
      content: "Nice to meet you! Where are you from?",
    });

    const updatedWithBot = addMessageToConversation(updated, botMessage);

    setConversation(updatedWithBot);
    saveConversation(updatedWithBot);
    setInputMessage("");
  };

  if (!conversation) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#e6e6e6]">
        <p className="font-bold text-black">No conversation selected.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e6e6e6] flex justify-center px-3 py-3">
      <section className="w-full max-w-[390px] min-h-[720px] bg-white border-2 border-[#f3a3a3] rounded-[8px] shadow-md overflow-hidden flex flex-col">
        {/* Top Header */}
        <header className="bg-[#b8b8b8] border-b-4 border-[#0099ff]">
          <div className="grid grid-cols-[1fr_1px_1fr] items-center px-3 py-2">
            <div className="text-center">
              <h1 className="text-[24px] font-extrabold leading-none text-black">
                LINGUAI
              </h1>
              <p className="text-[18px] font-extrabold leading-none text-red-600">
                UV
              </p>
            </div>

            <div className="h-10 bg-white" />

            <p className="text-center text-[13px] font-bold leading-tight text-white">
              Univalle&apos;s AI tutor for learning English
            </p>
          </div>
        </header>

        {/* Context Bar */}
        <div className="grid grid-cols-[38px_1fr_46px] items-center bg-[#9d9d9d] border-b border-white">
          <button className="flex items-center justify-center border-r border-white py-1">
            <Menu size={22} className="text-black" />
          </button>

          <div className="px-2 text-[13px] font-extrabold text-black truncate">
            {conversation.context.unitTitle}
          </div>

          <button
            onClick={() => router.push("/home")}
            className="flex items-center justify-center border-l border-white py-1"
          >
            <Home size={23} className="text-black fill-black" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto bg-[#f8f8f8] px-3 py-6 space-y-5">
          {conversation.messages.map((message) => {
            const isUser = message.role === MESSAGE_ROLES.USER;

            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="flex flex-col items-center w-[42px] shrink-0">
                    <div className="h-8 w-8 rounded-full border border-black flex items-center justify-center bg-white">
                      <Bot size={20} />
                    </div>
                    <span className="text-[8px] font-bold text-red-600">
                      LINGUAI
                    </span>
                  </div>
                )}

                <div
                  className={`relative max-w-[230px] rounded-[22px] px-4 py-3 text-[14px] font-semibold leading-tight ${
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
                    <span className="text-[8px] font-bold text-black">
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

          <div className="flex justify-end items-center gap-2 pr-8">
            <span className="text-[22px] tracking-[3px] text-black">•••</span>
            <span className="text-[11px] font-extrabold text-black">
              LINGUAI is Typing
            </span>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="bg-[#eeeeee] px-3 py-2">
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
              placeholder="Type a message here"
              className="flex-1 bg-transparent text-[14px] font-semibold text-black outline-none placeholder:text-gray-600"
            />

            <button type="submit">
              <Send size={22} className="text-black" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
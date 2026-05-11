"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, User, Settings, Bot } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { learningUnits } from "../../data/learningContent";
import TopicModal from "../../components/home/TopicModal";
import ActivityModal from "../../components/home/ActivityModal";
import UnitList from "../../components/home/UnitList";
import {
  createNewConversation,
  saveConversation,
} from "../../utils/chatModel";

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const firstName = user?.fullName?.split(" ")[0] || "Student";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
    setSelectedTopic(null);
    setShowTopicModal(true);
  };

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setShowTopicModal(false);
    setShowActivityModal(true);
  };

  const handleSelectActivity = (activity) => {
    if (!selectedUnit || !selectedTopic || !activity) {
      console.error("Missing conversation context", {
        selectedUnit,
        selectedTopic,
        activity,
      });
      return;
    }

    const context = {
      unitId: selectedUnit.id,
      unitTitle: selectedUnit.title,
      topicId: selectedTopic.id,
      topicTitle: selectedTopic.title,
      activityType: activity.type,
      activityName: activity.name,
      activityDescription: activity.description,
    };

    const newConversation = createNewConversation(context);
    saveConversation(newConversation);

    router.push("/chat");
  };


  return (
    <>
      <main className="min-h-screen bg-[#e6e6e6] flex justify-center px-4 py-6">
        <section className="w-full max-w-[390px] min-h-[720px] bg-white border-2 border-[#f3a3a3] rounded-[10px] shadow-md overflow-hidden">
          {/* Header */}
          <header className="bg-[#b8b8b8] border-b-4 border-white">
            <div className="grid grid-cols-[1fr_1px_1fr] items-center px-4 py-3">
              <div className="text-center">
                <h1 className="text-[30px] font-extrabold leading-none text-black">
                  LINGUAI
                </h1>
                <p className="text-[20px] font-extrabold leading-none text-red-600">
                  UV
                </p>
              </div>

              <div className="h-10 bg-white" />

              <p className="text-center text-[16px] font-bold leading-tight text-white">
                Univalle&apos;s AI tutor for learning English
              </p>
            </div>
          </header>

          {/* Welcome */}
          <section className="bg-[#b8b8b8] px-4 py-3 flex gap-3 items-center">
            <div className="bg-white rounded-full p-2">
              <Bot size={24} className="text-black" />
            </div>

            <div>
              <h2 className="text-[20px] font-bold text-white">
                Hello {user?.fullName?.split(" ")[0] || "Student"} 👋
              </h2>
              <p className="text-[18px] font-semibold text-white">
                Ready to practice English?
              </p>
            </div>
          </section>

          {/* Current activity */}
          <section className="px-4 py-3">
            <h3 className="text-[18px] font-extrabold text-black">
              Continue where you left off?
            </h3>

            <div className="mt-2 grid grid-cols-[1fr_auto] gap-3 items-center">
              <div>
                <p className="text-[14px] font-semibold text-black">
                  Unit 1 - Greetings and Introductions
                </p>
                <p className="text-[13px] text-black">80% completed</p>

                <div className="mt-1 h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full w-[80%] bg-red-600 rounded-full" />
                </div>

                <p className="mt-1 text-[12px] font-bold text-red-600">
                  Introducing yourself
                </p>
              </div>

              <button
                onClick={() => handleSelectUnit(learningUnits[0])}
                className="rounded-[5px] bg-red-600 px-4 py-2 text-[13px] font-bold text-white shadow hover:bg-red-700"
              >
                Continue here
              </button>
            </div>
          </section>

          <section className="px-4 pb-3">
            <div className="flex items-center justify-between border-y border-black py-1">
              <h3 className="text-[17px] font-extrabold text-black">
                Course Units
              </h3>
              <span className="text-[11px] text-black">Tap to select one</span>
            </div>

            <UnitList units={learningUnits} onSelectUnit={handleSelectUnit} />

          </section>

          <section className="px-4 py-3 grid grid-cols-[1fr_1fr] gap-3 items-center">
            <button
              onClick={() => handleSelectUnit(learningUnits[0])}
              className="rounded-[5px] bg-red-600 py-2 text-center text-[15px] font-bold text-white shadow hover:bg-red-700"
            >
              Free Practice
            </button>

            <p className="text-center text-[12px] font-semibold text-black leading-tight">
              [Context-aware]
              <br />
              Last unit + Last topic
            </p>
          </section>

          <nav className="border-t border-black bg-[#b8b8b8] px-4 py-2">
            <div className="grid grid-cols-3 text-center">
              <Link
                href="/profile"
                className="flex flex-col items-center gap-1 text-black"
              >
                <User size={28} />
                <span className="text-[13px] font-bold">My Profile</span>
              </Link>

              <Link
                href="/progress"
                className="flex flex-col items-center gap-1 text-black border-x border-white"
              >
                <BarChart3 size={28} />
                <span className="text-[13px] font-bold">My Progress</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 text-black"
              >
                <Settings size={28} />
                <span className="text-[13px] font-bold">Log out</span>
              </button>
            </div>
          </nav>
        </section>
      </main>

      {showTopicModal && selectedUnit && (
        <TopicModal
          unit={selectedUnit}
          onClose={() => setShowTopicModal(false)}
          onSelectTopic={handleSelectTopic}
        />
      )}

      {showActivityModal && selectedUnit && selectedTopic && (
        <ActivityModal
          unit={selectedUnit}
          topic={selectedTopic}
          onClose={() => setShowActivityModal(false)}
          onBack={() => {
            setShowActivityModal(false);
            setShowTopicModal(true);
          }}
          onSelectActivity={handleSelectActivity}
        />
      )}
    </>
  );
}
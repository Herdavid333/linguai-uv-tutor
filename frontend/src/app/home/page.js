"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, User, Bot } from "lucide-react";
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
  /* =========================================================
     AUTH Y NAVEGACIÓN
  ========================================================= */
  const { user, logout } = useAuth();
  const router = useRouter();

  /* =========================================================
     ESTADOS DE MODALES Y SELECCIÓN
  ========================================================= */
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  /* =========================================================
     DATOS DEL USUARIO
  ========================================================= */
  const firstName = user?.fullName?.split(" ")[0] || "Student";

  /* =========================================================
     LOGOUT
  ========================================================= */
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  /* =========================================================
     SELECCIÓN DE UNIDAD
  ========================================================= */
  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);

    setSelectedTopic(null);

    setShowTopicModal(true);
  };

  /* =========================================================
     SELECCIÓN DE TEMA
  ========================================================= */
  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);

    setShowTopicModal(false);

    setShowActivityModal(true);
  };

  /* =========================================================
     SELECCIÓN DE ACTIVIDAD
     CREACIÓN DE CONTEXTO CONVERSACIONAL
  ========================================================= */
  const handleSelectActivity = (activity) => {
    if (!selectedUnit || !selectedTopic || !activity) {
      console.error("Missing conversation context", {
        selectedUnit,
        selectedTopic,
        activity,
      });

      return;
    }

    /* =========================================================
       CONTEXTO DE LA CONVERSACIÓN
    ========================================================= */
    const context = {
      unitId: selectedUnit.id,
      unitTitle: selectedUnit.title,

      topicId: selectedTopic.id,
      topicTitle: selectedTopic.title,

      activityType: activity.type,
      activityName: activity.name,
      activityDescription: activity.description,
    };

    /* =========================================================
       CREACIÓN Y GUARDADO DE CONVERSACIÓN
    ========================================================= */
    const newConversation = createNewConversation(context);

    saveConversation(newConversation);

    /* =========================================================
       REDIRECCIÓN AL CHAT
    ========================================================= */
    router.push("/chat");
  };

  return (
    <>
      {/* =========================================================
         CONTENEDOR GENERAL DE LA PÁGINA
      ========================================================= */}
      <main className="min-h-screen bg-[#e6e6e6] flex justify-center px-4 py-6 overflow-hidden">
        
        {/* =========================================================
           CONTENEDOR PRINCIPAL DEL HOME
        ========================================================= */}
        <section className="w-full max-w-[390px] h-full bg-white border-2 border-[#f3a3a3] rounded-[10px] shadow-md overflow-hidden flex flex-col justify-evenly">
          
          {/* =========================================================
             HEADER PRINCIPAL
             Branding LINGUAI UV
          ========================================================= */}
          <header className="shrink-0 bg-[#b8b8b8] border-b-4 border-white">
            <div className="grid grid-cols-[1fr_1px_1fr] items-center px-4 py-3">
              
              {/* Logo */}
              <div className="text-center">
                <h1 className="text-[30px] font-extrabold leading-none text-black">
                  LINGUAI
                </h1>

                <p className="text-[20px] font-extrabold leading-none text-red-600">
                  UV
                </p>
              </div>

              {/* Separador */}
              <div className="h-10 bg-white" />

              {/* Subtítulo */}
              <p className="text-center text-[16px] font-bold leading-tight text-white">
                Univalle&apos;s AI tutor for learning English
              </p>
            </div>
          </header>

          {/* =========================================================
             SECCIÓN DE BIENVENIDA
          ========================================================= */}
          <section className="shrink-0 bg-[#b8b8b8] px-4 py-3">
            {/* FILA SUPERIOR */}
            <div className="flex justify-between items-start">

              {/* IZQUIERDA */}
              <div className="flex gap-3 items-center">
                
                {/* Avatar tutor */}
                <div className="bg-white rounded-full p-2">
                  <Bot size={24} className="text-black" />
                </div>

                {/* Texto bienvenida */}
                <div>
                  <h2 className="text-[20px] font-bold text-white leading-tight">
                    Hello {firstName} 👋
                  </h2>

                  <p className="text-[18px] font-semibold text-white leading-tight">
                    Ready to practice English?
                  </p>
                </div>
              </div>

              {/* BOTÓN LOGOUT */}
              <button
                onClick={handleLogout}
                className="
                  rounded-[5px]
                  bg-red-600
                  px-2
                  py-1
                  -mt-1
                  text-[13px]
                  font-bold
                  text-white
                  shadow
                  hover:bg-red-700
                  transition
                  duration-100
                  active:scale-95
                  active:translate-y-[1px]
                "
              >
                Log out
              </button>

            </div>
          </section>

          {/* =========================================================
             CONTINUAR ÚLTIMA ACTIVIDAD
          ========================================================= */}
          <section className="px-4 py-3">
            
            {/* Título */}
            <h3 className="text-[18px] font-extrabold text-black">
              Continue where you left off?
            </h3>

            {/* Contenido */}
            <div className="mt-2 grid grid-cols-[1fr_auto] gap-3 items-center">
              
              {/* Información de progreso */}
              <div>
                <p className="text-[14px] font-semibold text-black">
                  Unit 1 - Greetings and Introductions
                </p>

                <p className="text-[13px] text-black">
                  80% completed
                </p>

                {/* Barra de progreso */}
                <div className="mt-1 h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full w-[80%] bg-red-600 rounded-full" />
                </div>

                {/* Tema actual */}
                <p className="mt-1 text-[12px] font-bold text-red-600">
                  Introducing yourself
                </p>
              </div>

              {/* Botón continuar */}
              <button
                onClick={() => handleSelectUnit(learningUnits[3])}
                className="rounded-[5px] bg-red-600 text-[13px] px-4 py-2 whitespace-nowrap font-bold text-white shadow hover:bg-red-700"
              >
                Continue here
              </button>
            </div>
          </section>

          {/* =========================================================
             LISTA DE UNIDADES DEL CURSO
          ========================================================= */}
          <section className="px-4 pb-3">
            
            {/* Header de sección */}
            <div className="flex items-center justify-between border-y border-black py-1">
              <h3 className="text-[17px] font-extrabold text-black">
                Course Units
              </h3>

              <span className="text-[15px] text-black">
                Tap to select one
              </span>
            </div>

            {/* Lista de unidades */}
            <UnitList
              units={learningUnits}
              onSelectUnit={handleSelectUnit}
            />
          </section>

          {/* =========================================================
             FREE PRACTICE
          ========================================================= */}
          <section className="px-4 py-3 grid grid-cols-[1fr_1fr] gap-3 items-center">
            
            {/* Botón Free Practice */}
            <button
              onClick={() => handleSelectUnit(learningUnits[0])}
              className="rounded-[5px] bg-red-600 py-2 text-center text-[15px] font-bold text-white shadow hover:bg-red-700"
            >
              Free Practice
            </button>

            {/* Texto contextual */}
            <p className="text-center text-[15px] font-semibold text-black leading-tight">
              [Context-aware]
              <br />
              Last unit + Last topic
            </p>
          </section>

          {/* =========================================================
             FOOTER / NAVEGACIÓN INFERIOR
          ========================================================= */}
          <nav className="border-t border-black bg-[#b8b8b8] px-2 sm:px-4 py-2 shrink-0">
            <div className="grid grid-cols-[1fr_2px_1fr] items-center text-center">

              {/* Perfil */}
              <Link
                href="/profile"
                className="
                  flex flex-col items-center gap-1 text-black
                  hover:scale-[1.1]
                  active:scale-95
                  active:translate-y-[2px]
                  rounded-md
                  py-1
                  "
              >
                <User size={40} className="sm:w-9 sm:h-9 fill-black" />

                <span className="text-[15px] font-bold">
                  My Profile
                </span>
              </Link>

              <div className="h-full bg-white" />

              {/* Progreso */}
              <Link
                href="/progress"
                className="
                  flex flex-col items-center gap-1 text-black
                  hover:scale-[1.1]
                  active:scale-95
                  active:translate-y-[2px]
                  rounded-md
                  py-1
                  "
              >
                <BarChart3 size={40} className="sm:w-9 sm:h-9" />

                <span className="text-[15px] font-bold">
                  My Progress
                </span>
              </Link>

            </div>
          </nav>
        </section>
      </main>

      {/* =========================================================
         MODAL DE TEMAS
      ========================================================= */}
      {showTopicModal && selectedUnit && (
        <TopicModal
          unit={selectedUnit}
          onClose={() => setShowTopicModal(false)}
          onSelectTopic={handleSelectTopic}
        />
      )}

      {/* =========================================================
         MODAL DE ACTIVIDADES
      ========================================================= */}
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
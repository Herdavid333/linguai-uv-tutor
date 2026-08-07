"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, User, Bot } from "lucide-react";
import { useState, useEffect } from "react";

import { useAuth } from "../../context/AuthContext";

import { learningUnits } from "../../data/learningContent";

import TopicModal from "../../components/home/TopicModal";
import ActivityModal from "../../components/home/ActivityModal";
import UnitList from "../../components/home/UnitList";
import AuthInput from "../../components/auth/AuthInput.jsx";
import AuthSelect from "../../components/auth/AuthSelect.jsx";
import PasswordRequirements from "../../components/auth/PasswordRequirements.jsx";
import AuthButton from "../../components/auth/AuthButton.jsx";

import {
  getActivePractice,
  abandonPracticeHistory,
} from "../../services/practiceHistoryService";

import {
  createNewConversation,
  saveConversation,
} from "../../utils/chatModel";

import ActivePracticeModal
  from "../../components/practice/ActivePracticeModal.js";

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

  const [
    activePractice,
    setActivePractice,
  ] = useState(null);

  const [
    loadingActivePractice,
    setLoadingActivePractice,
  ] = useState(true);

  const [
    selectedNewActivity,
    setSelectedNewActivity,
  ] = useState(null);

  const [
    showActivePracticeModal,
    setShowActivePracticeModal,
  ] = useState(false);

  const [
    isChangingPractice,
    setIsChangingPractice,
  ] = useState(false);

  const [
    isAbandoning,
    setIsAbandoning,
  ] = useState(false);

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
        "Incomplete activity context:",
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

  const hasActivePractice =
    Boolean(
      activePractice?.id &&
      activePractice?.status ===
        "in_progress"
    );

  const activePracticeProgress =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          activePractice
            ?.progressPercentage ??
          activePractice
            ?.completionPercentage ??
          0
        )
      )
    );

  useEffect(() => {

    let cancelled = false;

    const loadActivePractice =
      async () => {
        console.log(
          "Home user UID:",
          user?.uid
        );

        if (!user?.uid) {
          if (!cancelled) {
            setActivePractice(null);
            setLoadingActivePractice(false);
          }
          return;
        }
        try {
          setLoadingActivePractice(true);
          const practice =
            await getActivePractice(user.uid);

          console.log(
            "Practice received in Home:",
            practice
          )

          if (cancelled) {
            return;
          }

          const isResumable =
            Boolean(
              practice?.id &&
              practice?.status ===
                "in_progress"
            );

          console.log(
            "Is resumable:",
            isResumable
          );

          setActivePractice(
            isResumable
              ? practice
              : null
          );
          
        } catch (error) {
          console.error(
            "Error loading active practice:",
            error
          );
          
          if (!cancelled) {
            setActivePractice(null);
          }
        } finally {
          if (!cancelled) {
            setLoadingActivePractice(false);
          }
        }
      };

    loadActivePractice();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const handleContinuePractice =
    () => {
      if (!activePractice?.id) {
        return;
      }

      router.push(
        `/chat?practiceId=${encodeURIComponent(
          activePractice.id
        )}`
      );
    };

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
  const handleSelectActivity =
    async (activity) => {
      if (
        !user?.uid ||
        !selectedUnit ||
        !selectedTopic ||
        !activity
      ) {
        console.error(
          "Missing information to start practice:",
          {
            userId: user?.uid,
            selectedUnit,
            selectedTopic,
            activity,
          }
        );

        return;
      }

      const generatedActivityId = [
        selectedTopic.id,
        activity.type,
        activity.name,
      ]
        .filter(Boolean)
        .join("-")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const completeActivityContext = {
        unitId:
          selectedUnit.id,

        unitTitle:
          selectedUnit.title,

        topicId:
          selectedTopic.id,

        topicTitle:
          selectedTopic.title,

        activityId:
          activity.id ||
          generatedActivityId,

        activityType:
          activity.type ||
          "Conversation",

        activityName:
          activity.name ||
          "English Practice",

        activityDescription:
          activity.description ||
          "",
      };

      try {
        const currentPractice =
          await getActivePractice(
            user.uid
          );

        console.log(
          "Current active practice:",
          currentPractice
        );

        const hasResumablePractice =
          Boolean(
            currentPractice?.id &&
            currentPractice?.status ===
              "in_progress"
          );

        if (hasResumablePractice) {
          setActivePractice(
            currentPractice
          );

          setSelectedNewActivity(
            completeActivityContext
          );

          setShowActivePracticeModal(
            true
          );

          return;
        }

        setActivePractice(null);
        setSelectedNewActivity(null);
        setShowActivePracticeModal(false);

        const chatUrl =
          buildChatUrl(
            completeActivityContext
          );

        if (!chatUrl) {
          return;
        }

        setShowActivityModal(false);

        router.push(chatUrl);
      } catch (error) {
        console.error(
          "Error checking active practice:",
          error
        );
      }
    };

  const handleContinueExisting =
    () => {
      if (!activePractice?.id) {
        return;
      }

      setShowActivePracticeModal(
        false
      );

      router.push(
        `/chat?practiceId=${activePractice.id}`
      );
    };

  const handleAbandonAndStart =
    async () => {
      if (
        !user?.uid ||
        !activePractice?.id ||
        !selectedNewActivity
      ) {
        return;
      }

      try {
        setIsAbandoning(true);

        await abandonPracticeHistory({
          userId: user.uid,
          practiceId:
            activePractice.id,
        });

        const newActivity =
          selectedNewActivity;

        setActivePractice(null);
        setSelectedNewActivity(null);
        setShowActivePracticeModal(
          false
        );

        router.push(
          buildChatUrl(newActivity)
        );
      } catch (error) {
        console.error(
          "Error abandoning practice:",
          error
        );
      } finally {
        setIsAbandoning(false);
      }
    };

  const handleContinueCurrentPractice =
    () => {
      if (!activePractice?.id) {
        return;
      }

      const practiceId =
        activePractice.id;

      setShowActivePracticeModal(
        false
      );

      setShowActivityModal(false);
      setSelectedNewActivity(null);

      router.push(
        `/chat?practiceId=${encodeURIComponent(
          practiceId
        )}`
      );
    };

  const handleAbandonAndChange =
    async () => {
      if (
        isChangingPractice ||
        !user?.uid ||
        !activePractice?.id ||
        !selectedNewActivity
      ) {
        return;
      }

      try {
        setIsChangingPractice(true);

        const newActivity =
          selectedNewActivity;

        await abandonPracticeHistory({
          userId: user.uid,
          practiceId:
            activePractice.id,
        });

        const chatUrl =
          buildChatUrl(
            newActivity
          );

        if (!chatUrl) {
          return;
        }

        setShowActivePracticeModal(
          false
        );

        setShowActivityModal(false);
        setActivePractice(null);
        setSelectedNewActivity(null);

        router.push(chatUrl);
      } catch (error) {
        console.error(
          "Error abandoning practice:",
          error
        );
      } finally {
        setIsChangingPractice(false);
      }
    };

    console.log({
      loadingActivePractice,
      activePractice,
      hasActivePractice,
    });

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
                  <h2 className=" mt-5 text-[25px] font-bold text-white leading-tight">
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
                  py-2
                  text-[15px]
                  -mt-1
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
            PRÁCTICA ACTIVA O INVITACIÓN A COMENZAR
          ========================================================= */}
          {loadingActivePractice ? (
            <section className="px-4 py-3">
              <div className="min-h-[92px] flex items-center justify-center rounded-[6px] bg-[#f5f5f5]">
                <p className="text-[13px] font-semibold text-gray-600">
                  Loading your practice...
                </p>
              </div>
            </section>
          ) : hasActivePractice ? (
            <section className="px-4 py-3">
              {/* Título */}
              <h3 className="text-[18px] font-extrabold text-black">
                Continue where you left off?
              </h3>

              {/* Información de la práctica */}
              <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="min-w-0">
                  {/* Unidad */}
                  <p className="truncate text-[14px] font-semibold text-black">
                    {activePractice.unitTitle ||
                      "Current unit"}
                  </p>

                  {/* Porcentaje */}
                  <p className="text-[13px] text-black">
                    {activePracticeProgress}%
                    {" "}completed
                  </p>

                  {/* Barra de progreso */}
                  <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-red-600 transition-[width] duration-300"
                      style={{
                        width: `${activePracticeProgress}%`,
                      }}
                    />
                  </div>

                  {/* Tema y actividad */}
                  <p className="mt-1 truncate text-[12px] font-bold text-red-600">
                    {activePractice.topicTitle ||
                      activePractice.activityName ||
                      "English practice"}
                  </p>

                  {activePractice.topicTitle &&
                    activePractice.activityName && (
                      <p className="truncate text-[11px] font-semibold text-gray-600">
                        {activePractice.activityName}
                      </p>
                    )}
                </div>

                {/* Botón para retomar */}
                <button
                  type="button"
                  onClick={
                    handleContinuePractice
                  }
                  aria-label="Continue active practice"
                  className="
                    whitespace-nowrap
                    rounded-[5px]
                    bg-red-600
                    px-4
                    py-2
                    text-[13px]
                    font-bold
                    text-white
                    shadow-md
                    transition-all
                    duration-150
                    hover:bg-red-700
                    hover:shadow-lg
                    active:scale-95
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Continue Here
                </button>
              </div>
            </section>
          ) : (
            <section className="px-4 py-3">
              <div className="rounded-[7px] border border-gray-300 bg-[#f7f7f7] px-3 py-3">
                <h3 className="text-[17px] font-extrabold text-black">
                  Ready for a new practice?
                </h3>

                <p className="mt-1 text-[13px] font-semibold leading-snug text-gray-700">
                  Choose a unit, topic and
                  activity below to start
                  learning.
                </p>
              </div>
            </section>
          )}

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
            <AuthButton
              className="py-1 text-[20px]"
            >
              Free Practice
            </AuthButton>

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

      {/* =========================================================
        MODAL DE PRÁCTICA ACTIVA
      ========================================================= */}
      <ActivePracticeModal
        isOpen={
          showActivePracticeModal
        }
        activePractice={
          activePractice
        }
        isProcessing={
          isChangingPractice
        }
        onContinue={
          handleContinueCurrentPractice
        }
        onAbandon={
          handleAbandonAndChange
        }
        onClose={() => {
          if (isChangingPractice) {
            return;
          }

          setShowActivePracticeModal(
            false
          );

          setSelectedNewActivity(
            null
          );
        }}
      />
    </>
  );
}
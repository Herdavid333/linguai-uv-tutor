"use client";

import { useRouter } from "next/navigation";
import { BarChart3, User, Bot, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

import { useAuth } from "../../context/AuthContext";

import { learningUnits } from "../../data/learningContent";

import TopicModal from "../../components/home/TopicModal";
import ActivityModal from "../../components/home/ActivityModal";
import UnitList from "../../components/home/UnitList";
import { englishTips } from "../../data/englishTips";
import AppShell from "../../components/layout/AppShell";
import BottomNavigation from "../../components/layout/BottomNavigation";

import {
  CircleUserRound,
  ChartNoAxesCombined,
} from "lucide-react";

import {
  getActivePractice,
  getUserPracticeHistory,
  abandonPracticeHistory,
} from "../../services/practiceHistoryService";

import ActivePracticeModal
  from "../../components/practice/ActivePracticeModal.js";

import {
  calculateProgressStats,
  calculateOverallProgress,
} from "../../utils/progressCalculations";

export default function HomePage() {
  /*AUTH Y NAVEGACIÓN*/
  const { user, logout } = useAuth();
  const router = useRouter();

  /*ESTADOS DE MODALES Y SELECCIÓN*/
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
    practiceHistory,
    setPracticeHistory,
  ] = useState([]);

  const [
    loadingLearningData,
    setLoadingLearningData,
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

  const [
    showMobileUnits,
    setShowMobileUnits,
  ] = useState(false);

  const [
    homeEnglishTip,
    setHomeEnglishTip,
  ] = useState(null);

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

  useEffect(() => {
    let cancelled = false;

    const loadLearningData =
      async () => {
        if (!user?.uid) {
          if (!cancelled) {
            setPracticeHistory([]);
            setLoadingLearningData(
              false
            );
          }

          return;
        }

        try {
          setLoadingLearningData(
            true
          );

          const history =
            await getUserPracticeHistory(
              user.uid
            );

          if (cancelled) {
            return;
          }

          setPracticeHistory(
            Array.isArray(history)
              ? history
              : []
          );
        } catch (error) {
          console.error(
            "Error loading learning data:",
            error
          );

          if (!cancelled) {
            setPracticeHistory([]);
          }
        } finally {
          if (!cancelled) {
            setLoadingLearningData(
              false
            );
          }
        }
      };

    loadLearningData();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);


  useEffect(() => {
    if (!englishTips.length) {
      return;
    }

    const randomIndex =
      Math.floor(
        Math.random() *
          englishTips.length
      );

    setHomeEnglishTip(
      englishTips[randomIndex]
    );
  }, []);

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

  const homeProgressStats =
    useMemo(() => {
      return calculateProgressStats(
        practiceHistory
      );
    }, [practiceHistory]);

  const homeOverallProgress =
    useMemo(() => {
      return calculateOverallProgress(
        practiceHistory,
        learningUnits
      );
    }, [practiceHistory]);

  return (
    <>
      <AppShell
        footer={
          <BottomNavigation/>
        }
      >
        {/*BIENVENIDA*/}
        <section
          className="
            shrink-0
            bg-[#b8b8b8]
            px-4 py-3

            sm:px-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            {/* USUARIO */}
            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                "
              >
                <Bot
                  size={28}
                  className="text-black"
                />
              </div>

              <div className="min-w-0">
                <h2
                  className="
                    truncate
                    font-extrabold
                    leading-tight
                    text-red-600

                    text-[15px]
                    md:text-[20px]
                    lg:text-[20px]
                    xl:text-[25px]
                  "
                >
                  Hello {firstName} 👋
                </h2>

                <p
                  className="
                    font-semibold
                    leading-tight
                    text-black

                    text-[14px]
                    md:text-[10px]
                    lg:text-[20px]
                    xl:text-[20px]
                  "
                >
                  Ready to practice English?
                </p>
              </div>
            </div>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              className="
                shrink-0
                rounded-md
                bg-red-600
                px-3
                py-2
                font-bold
                text-white
                shadow
                transition-all
                duration-100
                hover:bg-red-700
                active:translate-y-[1px]
                active:scale-95

                text-[12px]
                md:text-[15px]
                lg:text-[20px]
              "
            >
              Log out
            </button>
          </div>
        </section>

        {/*CONTENIDO CENTRAL*/}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-3
            py-3

            sm:px-4
            sm:py-4

            lg:overflow-hidden
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-4

              lg:h-full
              lg:min-h-0
              lg:grid-cols-[1.15fr_0.85fr]
            "
          >
            {/*COLUMNA IZQUIERDA
                Course Units + Your Learning*/}
            <div
              className="
                flex
                flex-col
                gap-4

                lg:min-h-0
              "
            >
              {/*COURSE UNITS*/}
              <section
                className="
                  flex
                  flex-col
                  overflow-hidden
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  shadow-sm

                  lg:min-h-0
                  lg:flex-1
                "
              >
                {/*HEADER MÓVIL / TABLET*/}
                <button
                  type="button"
                  onClick={() =>
                    setShowMobileUnits(
                      (previous) => !previous
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3
                    bg-[#b8b8b8]
                    px-3
                    py-2
                    text-left

                    lg:hidden
                  "
                >
                  <h3
                    className="
                      
                      font-extrabold
                      text-black

                      text-[17px]
                      md:text-[18px]
                      lg:text-[20px]
                      xl:text-[21px]
                    "
                  >
                    Course Units
                  </h3>

                  <ChevronDown
                    size={24}
                    strokeWidth={3}
                    className={`
                      shrink-0
                      text-black
                      transition-transform
                      duration-200

                      ${
                        showMobileUnits
                          ? "rotate-180"
                          : ""
                      }
                    `}
                  />
                </button>

                {/*HEADER DESKTOP*/}
                <div
                  className="
                    hidden
                    shrink-0
                    items-center
                    justify-between
                    gap-3
                    bg-[#b8b8b8]
                    px-3
                    py-1.5

                    lg:flex
                  "
                >
                  <h3
                    className="
                      font-extrabold
                      text-black

                      lg:text-[20px]
                      xl:text-[21px]
                    "
                  >
                    Course Units
                  </h3>

                  <span
                    className="
                      font-semibold
                      text-black

                      lg:text-[18px]
                      xl:text-[20px]
                    "
                  >
                    Tap to select one
                  </span>
                </div>

                {/*LISTA MÓVIL
                    Sin scroll interno*/}
                {showMobileUnits && (
                  <div
                    className="
                      p-2
                      lg:hidden
                    "
                  >
                    <UnitList
                      units={learningUnits}
                      onSelectUnit={(unit) => {
                        handleSelectUnit(unit);

                        setShowMobileUnits(false);
                      }}
                    />
                  </div>
                )}

                {/*LISTA DESKTOP
                    Con scroll propio*/}
                <div
                  className="
                    hidden
                    min-h-0
                    flex-1
                    overflow-y-auto
                    overscroll-contain
                    p-2

                    lg:block
                  "
                >
                  <UnitList
                    units={learningUnits}
                    onSelectUnit={
                      handleSelectUnit
                    }
                  />
                </div>
              </section>

              {/*YOUR LEARNING */}
              <section
                className="
                  shrink-0
                  overflow-hidden
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  shadow-sm
                "
              >
                {/* HEADER */}
                <div
                  className="
                    bg-[#b8b8b8]
                    px-3
                    py-1.5
                  "
                >
                  <h3
                    className="
                      font-extrabold
                      text-black

                      text-[17px]
                      md:text-[18px]
                      lg:text-[20px]
                      xl:text-[21px]
                    "
                  >
                    Your Learning
                  </h3>
                </div>

                {loadingLearningData ? (
                  <p
                    className="
                      px-3
                      py-3
                      text-center
                      font-semibold
                      text-gray-600

                      text-[13px]
                      md:text-[14px]
                      lg:text-[17px]
                    "
                  >
                    Loading your progress...
                  </p>
                ) : (
                  <div
                    className="
                      grid
                      grid-cols-3
                      gap-2
                      p-2
                    "
                  >
                    {/* OVERALL PROGRESS */}
                    <article
                      className="
                        rounded-md
                        border
                        border-gray-300
                        bg-[#fafafa]
                        px-2
                        py-2
                        text-center
                      "
                    >
                      <p
                        className="
                          
                          font-extrabold
                          uppercase
                          tracking-wide
                          text-gray-500

                          text-[13px]
                          md:text-[14px]
                          lg:text-[17px]
                        "
                      >
                        Overall Progress
                      </p>

                      <p
                        className="
                          mt-0.5
                          
                          font-extrabold
                          text-red-600

                          text-[13px]
                          md:text-[14px]
                          lg:text-[17px]
                        "
                      >
                        {homeOverallProgress}%
                      </p>

                      <div
                        className="
                          mx-auto
                          mt-1
                          h-1.5
                          max-w-[90px]
                          overflow-hidden
                          rounded-full
                          bg-gray-300
                        "
                      >
                        <div
                          className="
                            h-full
                            rounded-full
                            bg-red-600
                          "
                          style={{
                            width: `${homeOverallProgress}%`,
                          }}
                        />
                      </div>
                    </article>

                    {/* AVERAGE SCORE */}
                    <article
                      className="
                        rounded-md
                        border
                        border-gray-300
                        bg-[#fafafa]
                        px-2
                        py-2
                        text-center
                      "
                    >
                      <p
                        className="
                          font-extrabold
                          uppercase
                          tracking-wide
                          text-gray-500

                          text-[13px]
                          md:text-[14px]
                          lg:text-[17px]
                        "
                      >
                        Average Score
                      </p>

                      <p
                        className="
                          mt-0.5
                          font-extrabold
                          text-red-600

                          text-[13px]
                          md:text-[14px]
                          lg:text-[17px]                        
                          "
                      >
                        {homeProgressStats
                          .averageScore !== null
                          ? `${homeProgressStats.averageScore}%`
                          : "N/A"}
                      </p>
                    </article>

                    {/* LEARNING STREAK */}
                    <article
                      className="
                        rounded-md
                        border
                        border-gray-300
                        bg-[#fafafa]
                        px-2
                        py-2
                        text-center
                      "
                    >
                      <p
                        className="
                          font-extrabold
                          uppercase
                          tracking-wide
                          text-gray-500

                          text-[13px]
                          md:text-[14px]
                          lg:text-[17px]
                        "
                      >
                        Learning Streak
                      </p>

                      <p className="
                        mt-1 
                        font-extrabold 
                        text-black 

                        text-[13px]
                        md:text-[14px]
                        lg:text-[17px]
                      ">
                        🔥 {homeProgressStats.learningStreak} {homeProgressStats.learningStreak === 1
                          ? "day"
                          : "days"}
                      </p>

                    </article>
                  </div>
                )}
              </section>
            </div>

            {/*COLUMNA DERECHA
                Continue Practice + Free Practice*/}
            <div
              className="
                flex
                flex-col
                gap-4

                lg:min-h-0
              "
            >
              {/*PRÁCTICA ACTIVA*/}
              {loadingActivePractice ? (
                <section
                  className="
                    flex
                    min-h-[120px]
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-gray-300
                    bg-[#fafafa]
                    p-4
                    shadow-sm
                  "
                >
                  <p
                    className="
                      text-center
                      font-semibold
                      text-gray-600

                      text-[13px]
                      md:text-[14px]
                      lg:text-[17px]
                    "
                  >
                    Loading your practice...
                  </p>
                </section>
              ) : hasActivePractice ? (
                <section
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    bg-[#fafafa]
                    p-4
                    shadow-sm
                  "
                >
                  <h3
                    className="
                      font-extrabold
                      text-red-600
                      text-center

                      text-[17px]
                      md:text-[18px]
                      lg:text-[20px]
                      xl:text-[21px]
                    "
                  >
                    Continue your practice
                  </h3>

                  {/* UNIDAD */}
                  <p
                    className="
                      mt-2
                      
                      font-extrabold
                      leading-snug
                      text-black

                      text-[13px]
                      md:text-[14px]
                      lg:text-[17px]
                    "
                  >
                    {activePractice.unitTitle ||
                      "Current unit"}
                  </p>

                  {/* INFORMACIÓN COMPACTA */}
                  <div
                    className="
                      mt-2
                      space-y-1
                      
                      leading-snug

                      text-[12px]
                      md:text-[13px]
                      lg:text-[16px]
                    "
                  >
                    <p>
                      <span className="font-extrabold text-black">
                        Topic:
                      </span>{" "}
                      <span className="font-bold text-red-600">
                        {activePractice.topicTitle ||
                          "Current topic"}
                      </span>
                    </p>

                    <p>
                      <span className="font-extrabold text-black">
                        Activity:
                      </span>{" "}
                      <span className="font-semibold text-gray-700">
                        {activePractice.activityName ||
                          activePractice.activityType ||
                          "English practice"}
                      </span>
                    </p>

                    <p>
                      <span className="font-extrabold text-black">
                        Meaningful interactions:
                      </span>{" "}
                      <span className="font-semibold text-gray-700">
                        {Number(
                          activePractice
                            .meaningfulInteractionsCount ??
                            0
                        )}
                      </span>
                    </p>
                  </div>

                  {/* PROGRESO */}
                  <div className="mt-3">
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <span
                        className="
                          
                          font-semibold
                          text-gray-600

                          text-[12px]
                          md:text-[13px]
                          lg:text-[16px]
                        "
                      >
                        Practice progress
                      </span>

                      <span
                        className="
                          
                          font-extrabold
                          text-red-600

                          text-[12px]
                          md:text-[13px]
                          lg:text-[16px]
                        "
                      >
                        {activePracticeProgress}%
                      </span>
                    </div>

                    <div
                      className="
                        mt-1
                        h-2.5
                        overflow-hidden
                        rounded-full
                        bg-gray-300
                      "
                    >
                      <div
                        className="
                          h-full
                          rounded-full
                          bg-red-600
                          transition-[width]
                          duration-300
                        "
                        style={{
                          width: `${activePracticeProgress}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* RESUME */}
                  <button
                    type="button"
                    onClick={
                      handleContinuePractice
                    }
                    className="
                      mt-3
                      w-full
                      rounded-md
                      bg-red-600
                      px-4
                      py-2.5
                      font-extrabold
                      text-white
                      shadow
                      transition-all
                      hover:bg-red-700
                      active:scale-[0.98]

                      text-[18px]
                      md:text-[20px]
                      lg:text-[24px]
                    "
                  >
                    Resume Practice
                  </button>
                </section>
              ) : (
                /* =============================================
                    SIN PRÁCTICA ACTIVA
                ============================================== */
                <section
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    bg-[#fafafa]
                    p-4
                    shadow-sm
                  "
                >
                  <h3
                    className="
                      font-extrabold
                      text-red-600
                      text-center

                      text-[17px]
                      md:text-[18px]
                      lg:text-[21px]
                      xl:text-[25px]
                    "
                  >
                    Ready for a new practice?
                  </h3>

                  <p
                    className="
                      mt-2
                      font-semibold
                      leading-relaxed
                      text-gray-700
                      text-center

                      text-[13px]
                      md:text-[14px]
                      lg:text-[17px]
                    "
                  >
                    Choose a unit, topic and
                    activity to start practicing
                    English with LINGUAI.
                  </p>
                </section>
              )}

              {/* ===============================================
                  FREE PRACTICE
              ================================================ */}
              <section
                className="
                  flex
                  flex-col
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  p-4
                  shadow-sm

                  lg:flex-1
                "
              >
                <h3
                  className="
                    font-extrabold
                    text-red-600
                    text-center

                    text-[17px]
                    md:text-[18px]
                    lg:text-[21px]
                    xl:text-[25px]
                  "
                >
                  Free Practice
                </h3>

                <p
                  className="
                    mt-2
                    mb-3
                    font-semibold
                    leading-relaxed
                    text-gray-600
                    text-center

                    text-[13px]
                    md:text-[14px]
                    lg:text-[17px]
                  "
                >
                  Practice freely with LINGUAI
                  using your recent learning
                  context.
                </p>

                <button
                  type="button"
                  className="
                    mt-4
                    w-full
                    rounded-md
                    bg-red-600
                    px-4
                    py-2.5
                    font-extrabold
                    text-white
                    shadow
                    transition-all
                    hover:bg-red-700
                    active:scale-[0.98]

                    lg:mt-auto

                    text-[18px]
                    md:text-[20px]
                    lg:text-[24px]
                  "
                >
                  Start Free Practice
                </button>
              </section>

              {homeEnglishTip && (
                <section
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-1
                    shadow-sm
                  "
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">
                      💡
                    </span>

                    <h3
                      className="
                        font-extrabold
                        text-red-600

                        text-[17px]
                        lg:text-[20px]
                      "
                    >
                      {homeEnglishTip.title}
                    </h3>
                  </div>

                  <p
                    className="
                      mt-2
                      font-semibold
                      leading-relaxed
                      text-gray-700

                      text-[14px]
                      lg:text-[18px]
                    "
                  >
                    {homeEnglishTip.text}
                  </p>

                  <p
                    className="
                      mt-2
                      text-[12px]
                      font-semibold

                      text-gray-500
                      lg:text-[16px]
                    "
                  >
                    <span className="font-extrabold text-black">
                      Example:
                    </span>{" "}
                    <span className="italic">
                      {homeEnglishTip.example}
                    </span>
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>
      </AppShell>

    {/* =========================================================
        MODAL DE TEMAS
    ========================================================= */}
    {showTopicModal &&
      selectedUnit && (
        <TopicModal
          unit={
            selectedUnit
          }
          onClose={() =>
            setShowTopicModal(
              false
            )
          }
          onSelectTopic={
            handleSelectTopic
          }
        />
      )}

    {/* =========================================================
        MODAL DE ACTIVIDADES
    ========================================================= */}
    {showActivityModal &&
      selectedUnit &&
      selectedTopic && (
        <ActivityModal
          unit={
            selectedUnit
          }
          topic={
            selectedTopic
          }
          onClose={() =>
            setShowActivityModal(
              false
            )
          }
          onBack={() => {
            setShowActivityModal(
              false
            );

            setShowTopicModal(
              true
            );
          }}
          onSelectActivity={
            handleSelectActivity
          }
        />
      )}

    {/* =========================================================
        MODAL DE PRÁCTICA ACTIVA

        Conserva aquí tu implementación actual.
    ========================================================= */}
    <ActivePracticeModal
      isOpen={
        showActivePracticeModal
      }

      activePractice={
        activePractice
      }

      isProcessing={
        isAbandoning ||
        isChangingPractice
      }

      onContinue={
        handleContinueCurrentPractice
      }

      onAbandon={
        handleAbandonAndChange
      }

      onClose={() => {
        if (
          isAbandoning ||
          isChangingPractice
        ) {
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
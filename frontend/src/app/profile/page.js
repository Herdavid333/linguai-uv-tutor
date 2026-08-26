"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Home,
  Pencil,
  User,
  Volume2,
  Globe,
  MessageSquareText,
  SlidersHorizontal,
  Bell,
  Eye,
  X,
  House,
  ChartNoAxesCombined,
} from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { LEARNING_GOALS } from "../../data/learningGoals";
import AuthInput from "../../components/auth/AuthInput.jsx";
import AuthSelect from "../../components/auth/AuthSelect.jsx";
import PasswordRequirements from "../../components/auth/PasswordRequirements.jsx";
import AuthButton from "../../components/auth/AuthButton.jsx";
import VoiceSettingsPanel from "../../components/settings/VoiceSettingsPanel";
import LanguageSettingsPanel from "../../components/settings/LanguageSettingsPanel";
import FeedbackSettingsPanel from "../../components/settings/FeedbackSettingsPanel";
import PracticeDifficultySettingsPanel from "../../components/settings/PracticeDifficultySettingsPanel";
import NotificationsSettingsPanel from "../../components/settings/NotificationsSettingsPanel";
import AppShell from "../../components/layout/AppShell";
import BottomNavigation from "../../components/layout/BottomNavigation";

import { db, auth } from "../../lib/firebase";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUserData } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const firstName = user?.fullName || "Student";
  const email = user?.email || "student@email.com";
  const role = user?.role || "Student";
  const englishLevel = user?.englishLevel || "Beginner (A1)";
  const [learningGoal, setLearningGoal] = useState(user?.learningGoal || "");
  const [profileImage, setProfileImage] = useState(user?.photoBase64 || null);
  const fileInputRef = useRef(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [activeSetting, setActiveSetting] = useState(null);

  const handleOpenEdit = () => {
    setMessage("");
    setFullName(user?.fullName || "");
    setLearningGoal(user?.learningGoal || "");
    setShowEditModal(true);
    setShowPasswordModal(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!user?.uid) {
      setMessage("User information is not available.");
      return;
    }

    if (!fullName.trim()) {
      setMessage("Name is required.");
      return;
    }

    if (!learningGoal) {
      setMessage("Learning goal is required.");
      return;
    }

    try {
      setSaving(true);

      await updateDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        learningGoal,
      });

      await refreshUserData();

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const isPasswordValid =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+=]/.test(newPassword);

    if (!isPasswordValid) {
      setMessage("Password does not meet the requirements.");
      return;
    }

    try {
      setSaving(true);

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password update error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        setMessage("Current password is incorrect.");
      } else {
        setMessage("Could not update password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        if (userData.photoBase64) {
          setProfileImage(userData.photoBase64);
        }

        if (userData.fullName) {
          setFullName(userData.fullName);
        }

        if (userData.learningGoal) {
          setLearningGoal(userData.learningGoal);
        }
      }
    };

    loadUserData();
  }, [user?.uid]);

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!user?.uid) {
      setMessage("User information is not available.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      return;
    }

    if (file.size > 700 * 1024) {
      setMessage("Image is too large. Please select an image under 700 KB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const base64Image = reader.result;

      try {
        setSaving(true);
        setMessage("Saving profile photo...");

        await updateDoc(doc(db, "users", user.uid), {
          photoBase64: base64Image,
        });

        setProfileImage(base64Image);

        if (refreshUserData) {
          await refreshUserData();
        }

        setMessage("Profile photo updated successfully.");
      } catch (error) {
        console.error("Error saving profile photo:", error);
        setMessage("Could not save profile photo.");
      } finally {
        setSaving(false);
        e.target.value = "";
      }
    };

    reader.readAsDataURL(file);
  };

  const passwordRequirements = [
    {
      label: "Minimum 8 characters",
      valid: newPassword.length >= 8,
    },
    {
      label: "At least one uppercase letter (A-Z)",
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: "At least one lowercase letter (a-z)",
      valid: /[a-z]/.test(newPassword),
    },
    {
      label: "At least one number (0-9)",
      valid: /[0-9]/.test(newPassword),
    },
    {
      label: "At least one special character (!@#$%^&*)",
      valid: /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+=]/.test(newPassword),
    },
  ];

  return (
    <AppShell
      footer={
        <BottomNavigation /> 
      }
    >
        {/* MAIN PROFILE CONTENT */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-3
            py-3

            sm:px-4
            sm:py-4

            lg:grid
            lg:grid-cols-[0.85fr_1.15fr]
            lg:gap-4
            lg:overflow-hidden
          "
        >
          {/* =====================================================
              LEFT COLUMN - PROFILE
          ====================================================== */}
          <section
            className="
              flex
              min-h-0
              flex-col
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
                shrink-0
                bg-[#b8b8b8]
                px-4
                py-2
              "
            >
              <h2
                className="
                  text-center
                  font-extrabold
                  text-black

                  text-[18px]
                  md:text-[20px]
                  lg:text-[25px]
                "
              >
                My Profile
              </h2>
            </div>

            {/* CONTENT */}
            <div
              className="
                flex
                min-h-0
                flex-1
                flex-col
                p-4

                sm:p-5
                lg:p-4
              "
            >
              {/* =================================================
                  PROFILE INFO
              ================================================== */}
              <div
                className="
                  flex
                  items-start
                  gap-4
                  
                  lg:gap-5
                "
              >
                {/* PHOTO */}
                <div
                  className="
                    flex
                    shrink-0
                    flex-col
                    items-center
                  "
                >
                  <div
                    className="
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-full
                      border
                      border-black
                      bg-[#9d9d9d]

                      sm:h-24
                      sm:w-24

                      lg:h-28
                      lg:w-29
                    "
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    ) : (
                      <User
                        size={48}
                        className="
                          fill-black
                          text-black
                        "
                      />
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={
                      handleProfileImageChange
                    }
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="
                      mt-2
                      flex
                      items-center
                      gap-1
                      font-semibold
                      text-red-600
                      underline
                      transition
                      hover:text-red-600
                      active:scale-95

                      text-[14px]
                      lg:text-[16px]
                    "
                  >
                    Edit
                    <Pencil size={15} />
                  </button>
                </div>

                {/* USER DATA */}
                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <h3
                    className="
                      break-words
                      font-extrabold
                      text-black

                      text-[18px]
                      md:text-[20px]
                      lg:text-[25px]
                    "
                  >
                    {firstName}
                  </h3>

                  <p
                    className="
                      mt-1
                      font-semibold
                      capitalize
                      text-gray-700

                      text-[16px]
                      lg:text-[19px]
                    "
                  >
                    {role}
                  </p>

                  <p
                    className="
                      mt-1
                      break-all
                      font-semibold
                      text-cyan-600
                      underline

                      text-[16px]
                      lg:text-[19px]
                    "
                  >
                    {email}
                  </p>
                </div>
              </div>
              {/* =================================================
                  LEARNING SUMMARY CARD
              ================================================== */}
              <div
                className="
                  mt-auto
                  mb-auto
                  overflow-hidden
                  rounded-lg
                  border
                  border-gray-300
                  bg-gray-100
                  shadow-sm
                "
              >
                {/* ENGLISH LEVEL */}
                <div
                  className="
                    px-4
                    py-5
                    text-center

                    lg:px-5
                    lg:py-6
                  "
                >
                  <p
                    className="
                      font-semibold
                      text-gray-600

                      text-[14px]
                      md:text-[15px]
                      lg:text-[18px]
                    "
                  >
                    Based on your performance
                  </p>

                  <p
                    className="
                      mt-2
                      font-extrabold
                      text-red-600

                      text-[20px]
                      md:text-[22px]
                      lg:text-[26px]
                    "
                  >
                    {englishLevel}
                  </p>
                </div>

                {/* DIVIDER */}
                <div
                  className="
                    mx-4
                    border-t
                    border-black

                    lg:mx-5
                  "
                />

                {/* LEARNING GOAL */}
                <div
                  className="
                    px-4
                    py-5
                    text-center

                    lg:px-5
                    lg:py-6
                  "
                >
                  <p
                    className="
                      font-semibold
                      text-gray-600

                      text-[14px]
                      md:text-[15px]
                      lg:text-[18px]
                    "
                  >
                    Learning Goal
                  </p>

                  <p
                    className="
                      mt-auto
                      break-words
                      font-extrabold
                      text-red-600

                      text-[20px]
                      md:text-[22px]
                      lg:text-[25px]
                    "
                  >
                    {learningGoal || "Not defined yet"}
                  </p>
                </div>
              </div>

              {/* =================================================
                  EDIT PROFILE BUTTON
              ================================================== */}
              <AuthButton
                onClick={handleOpenEdit}
                type="button"
                className="
                  mx-auto
                
                  mt-auto
                  block
                  w-[85%]

                  sm:w-[75%]
                  lg:w-[80%]

                  lg:text-[25px]
                "
              >
                Edit Profile Info
              </AuthButton>
            </div>
          </section>

          {/* =====================================================
              RIGHT COLUMN - SETTINGS
          ====================================================== */}
          <section
            className="
              mt-4
              flex
              min-h-0
              flex-col
              overflow-hidden
              rounded-lg
              border
              border-gray-300
              bg-white
              shadow-sm

              lg:mt-0
            "
          >
            <div
              className="
                shrink-0
                bg-[#b8b8b8]
                px-4
                py-2
              "
            >
              <h2
                className="
                  text-center
                  font-extrabold
                  text-black

                  text-[18px]
                  md:text-[20px]
                  lg:text-[25px]
                "
              >
                Settings
              </h2>
            </div>

            <div
              className="
                min-h-0
                flex-1
                p-3

                sm:p-4
              "
            >
              {activeSetting === null ? (
                <div
                  className="
                    flex
                    h-full
                    min-h-0
                    flex-col
                  "
                >
                  {/* SETTINGS LIST */}
                  <div className="space-y-3">
                    <SettingRow
                      icon={<Volume2 size={24} />}
                      label="Voice settings"
                      onClick={() =>
                        setActiveSetting("voice")
                      }
                    />

                    <SettingRow
                      icon={<Globe size={24} />}
                      label="Language settings"
                      onClick={() =>
                        setActiveSetting("language")
                      }
                    />

                    <SettingRow
                      icon={
                        <MessageSquareText
                          size={24}
                        />
                      }
                      label="Feedback settings"
                      onClick={() =>
                        setActiveSetting("feedback")
                      }
                    />

                    <SettingRow
                      icon={
                        <SlidersHorizontal
                          size={24}
                        />
                      }
                      label="Practice difficulty"
                      onClick={() =>
                        setActiveSetting(
                          "practiceDifficulty"
                        )
                      }
                    />

                    <SettingRow
                      icon={<Bell size={24} />}
                      label="Notifications"
                      onClick={() =>
                        setActiveSetting(
                          "notifications"
                        )
                      }
                    />
                  </div>

                  {/* SETTINGS INFORMATION */}
                  <div
                    className="
                      mt-auto
                      rounded-lg
                      border
                      border-gray-300
                      bg-gray-100
                      px-5
                      py-4
                    "
                  >
                    <h3
                      className="
                        grid
                        grid-cols-1
                        gap-4
                        items-center

                        lg:grid-cols-2
                        lg:gap-4
                      "
                    >
                      {/* LEFT COLUMN */}
                      <div
                        className="
                          text-center
                          lg:text-left
                        "
                      >
                        <p
                          className="
                            mt-auto
                            font-extrabold
                            text-black

                            text-[15px]
                            md:text-[17px]
                            lg:text-[19px]
                          "
                        >
                          Personalize your experience
                        </p>

                        <p
                          className="
                            mt-2
                            font-semibold
                            leading-relaxed
                            text-gray-600

                            text-[12px]
                            md:text-[13px]
                            lg:text-[16px]
                          "
                        >
                          Customize how LINGUAI
                          communicates with you and
                          adapts your practice sessions.
                        </p>
                      </div>

                      {/* RIGHT COLUMN */}
                      <div
                        className="
                          border-t
                          border-gray-300
                          pt-4
                          text-center

                          lg:border-t-0
                          lg:border-l
                          lg:pl-6
                          lg:pt-0
                          lg:text-left
                        "
                      >
                        <p
                          className="
                            font-extrabold
                            text-black

                            text-[14px]
                            md:text-[15px]
                            lg:text-[19px]
                          "
                        >
                          Your preferences matter
                        </p>

                        <p
                          className="
                            mt-2
                            font-semibold
                            leading-relaxed
                            text-gray-600

                            text-[12px]
                            md:text-[13px]
                            lg:text-[16px]
                          "
                        >
                          Your settings help create a
                          learning experience that better
                          matches your needs and study
                          preferences.
                        </p>
                      </div>
                    </h3>
                  </div>
                </div>
              ) : (
                <ActiveSettingPanel
                  activeSetting={activeSetting}
                  onBack={() =>
                    setActiveSetting(null)
                  }
                />
              )}
            </div>
          </section>
        </div>

        {/* EDIT PROFILE MODAL */}
        {showEditModal && (
          <Modal maxWidth="max-w-[860px]">
            {/* HEADER */}
            <div
              className="
                relative
                flex
                items-center
                justify-center
                bg-[#b8b8b8]
                px-5
                py-3
              "
            >
              <h3
                className="
                  text-center
                  font-extrabold
                  text-black

                  text-[20px]
                  md:text-[23px]
                  lg:text-[28px]
                "
              >
                Edit Profile Information
              </h3>

              <button
                type="button"
                onClick={() =>
                  setShowEditModal(false)
                }
                aria-label="Close edit profile"
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rounded-full
                  p-1
                  text-red-600
                  transition
                  hover:bg-white/40
                  hover:text-red-700
                  active:scale-90
                "
              >
                <X
                  size={26}
                  strokeWidth={3}
                />
              </button>
            </div>

            {/* CONTENT */}
            <form
              onSubmit={handleSaveProfile}
              className="
                grid
                grid-cols-1
                gap-x-6
                gap-y-2
                px-5
                py-5

                sm:px-7

                md:grid-cols-2
                md:gap-x-8

                lg:px-10
                lg:py-8
                lg:gap-x-10
                lg:gap-y-3
              "
            >
              {/* NAME */}
              <AuthInput
                label="Name"
                name="fullName"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                wrapperClassName="mb-4"
                variant="field"
              />

              {/* STUDENT ID */}
              <AuthInput
                label="Student ID"
                name="studentId"
                value={user?.studentId || ""}
                disabled
                wrapperClassName="mb-4"
                variant="field"
              />

              {/* EMAIL */}
              <AuthInput
                label="E-mail address"
                name="email"
                value={email}
                disabled
                wrapperClassName="mb-4"
                variant="field"
              />

              {/* ROLE */}
              <AuthInput
                label="Role"
                name="role"
                value={role}
                disabled
                wrapperClassName="mb-4"
                variant="field"
              />

              {/* ENGLISH LEVEL */}
              <AuthInput
                label="English Level"
                name="englishLevel"
                value={englishLevel}
                disabled
                wrapperClassName="mb-4"
                variant="field"
              />

              {/* LEARNING GOAL */}
              <AuthSelect
                label="Learning Goal"
                name="learningGoal"
                value={learningGoal}
                onChange={(e) =>
                  setLearningGoal(
                    e.target.value
                  )
                }
                options={LEARNING_GOALS}
                wrapperClassName="mb-4"
                variant="field"
              />

              {/* PASSWORD SECTION */}
              <div
                className="
                  mt-3
                  rounded-lg
                  border
                  border-gray-300
                  bg-gray-100
                  px-4
                  py-4

                  md:col-span-2

                  lg:px-6
                  lg:py-5
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-between
                    gap-3

                    sm:flex-row
                  "
                >
                  <div>
                    <p
                      className="
                        font-extrabold
                        text-black

                        text-[15px]
                        lg:text-[20px]
                      "
                    >
                      Password
                    </p>

                    <p
                      className="
                        mt-1
                        font-semibold
                        text-gray-600

                        text-[15px]
                        lg:text-[19px]
                      "
                    >
                      For security reasons,
                      your password is hidden.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setShowPasswordModal(
                        true
                      );
                      setMessage("");
                    }}
                    className="
                      shrink-0
                      rounded-md
                      bg-red-600
                      px-4
                      py-2
                      font-bold
                      text-white
                      transition
                      hover:bg-red-700
                      active:scale-95

                      text-[15px]
                      lg:text-[20px]
                    "
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* MESSAGE */}
              {message && (
                <p
                  className="
                    mt-2
                    text-center
                    font-bold
                    text-red-600

                    text-[13px]
                    md:col-span-2
                    lg:text-[15px]
                  "
                >
                  {message}
                </p>
              )}

              {/* SAVE */}
              <div
                className="
                  mt-4
                  md:col-span-2
                "
              >
                <AuthButton
                  disabled={saving}
                  className="
                    mx-auto
                    block
                    w-[85%]

                    sm:w-[70%]
                    lg:w-[60%]

                    lg:text-[20px]
                    lg:py-3.5

                    lg:text-[25px]
                  "
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </AuthButton>
              </div>
            </form>
          </Modal>
        )}

        {/* CHANGE PASSWORD MODAL */}
        {showPasswordModal && (
          <Modal maxWidth="max-w-[880px]">
            {/* HEADER */}
            <div
              className="
                relative
                flex
                items-center
                justify-center
                bg-[#b8b8b8]
                px-5
                py-3
              "
            >
              <h3
                className="
                  text-center
                  font-extrabold
                  text-black

                  text-[20px]
                  md:text-[23px]
                  lg:text-[28px]
                "
              >
                Change Password
              </h3>

              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setShowEditModal(true);
                  setMessage("");
                }}
                aria-label="Close change password"
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rounded-full
                  p-1
                  text-red-600
                  transition
                  hover:bg-white/40
                  hover:text-red-700
                  active:scale-90
                "
              >
                <X
                  size={26}
                  strokeWidth={3}
                />
              </button>
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-6
                px-5
                py-5

                sm:px-7

                lg:grid-cols-[1.05fr_0.95fr]
                lg:gap-10
                lg:px-10
                lg:py-8
              "
            >
              {/* LEFT - PASSWORD FORM */}
              <form
                onSubmit={handleSavePassword}
                className="space-y-3"
              >
                <AuthInput
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  showToggle
                  variant="underline"
                  labelClassName="
                    text-[16px]
                    md:text-[18px]
                    lg:text-[22px]
                    text-red-600
                  "
                  inputClassName="
                    text-[14px]
                    md:text-[16px]
                    lg:text-[19px]
                  "
                  wrapperClassName="mb-6"
                />

                <AuthInput
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  showToggle
                  variant="underline"
                  labelClassName="
                    text-[16px]
                    md:text-[18px]
                    lg:text-[22px]
                    text-red-600
                  "
                  inputClassName="
                    text-[14px]
                    md:text-[16px]
                    lg:text-[19px]
                  "
                  wrapperClassName="mb-6"
                />

                <AuthInput
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  showToggle
                  variant="underline"
                  labelClassName="
                    text-[16px]
                    md:text-[18px]
                    lg:text-[22px]
                    text-red-600
                  "
                  inputClassName="
                    text-[14px]
                    md:text-[16px]
                    lg:text-[19px]
                  "
                  wrapperClassName="mb-6"
              />

                {message && (
                  <p
                    className="
                      text-center
                      font-bold
                      text-red-600

                      text-[13px]
                      lg:text-[15px]
                    "
                  >
                    {message}
                  </p>
                )}

                <AuthButton
                  disabled={saving}
                  className="
                    mx-auto
                    mt-4
                    block
                    w-[90%]

                    sm:w-[80%]

                    lg:w-[85%]
                    lg:py-3.5
                    lg:text-[22px]
                  "
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </AuthButton>
              </form>

              {/* RIGHT - REQUIREMENTS */}
              <section
                className="
                  rounded-lg
                  bg-gray-100
                  px-4
                  py-4
                "
              >
                <h4
                  className="
                    mb-3
                    text-center
                    font-extrabold
                    text-black

                    text-[16px]
                    md:text-[18px]
                    lg:text-[22px]
                  "
                >
                  Password Requirements
                </h4>

                <p
                  className="
                    mb-4
                    text-center
                    text-gray-600

                    text-[12px]
                    md:text-[15px]
                    lg:text-[18px]
                  "
                >
                  Your new password must meet
                  all of the following
                  requirements.
                </p>

                <PasswordRequirements
                  password={newPassword}
                  isOpen={true}
                  compact={true}
                />
              </section>
            </div>
          </Modal>
        )}
    </AppShell>
  );
}



function ActiveSettingPanel({
  activeSetting,
  onBack,
}) {
  const settings = {
    voice: {
      icon: <Volume2 size={25} />,
      title: "Voice settings",
      content: <VoiceSettingsPanel />,
    },

    language: {
      icon: <Globe size={25} />,
      title: "Language settings",
      content:
        <LanguageSettingsPanel />,
    },

    feedback: {
      icon: (
        <MessageSquareText
          size={25}
        />
      ),
      title: "Feedback settings",
      content:
        <FeedbackSettingsPanel />,
    },

    practiceDifficulty: {
      icon: (
        <SlidersHorizontal
          size={25}
        />
      ),
      title: "Practice difficulty",
      content:
        <PracticeDifficultySettingsPanel />,
    },

    notifications: {
      icon: <Bell size={25} />,
      title: "Notifications",
      content:
        <NotificationsSettingsPanel />,
    },
  };

  const current =
    settings[activeSetting];

  if (!current) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="
          mb-3
          flex
          items-center
          gap-2
          font-bold
          text-red-600
          transition
          hover:underline
          active:scale-[0.98]

          text-[15px]
          md:text-[18px]
          lg:text-[20px]
        "
      >
        ← Back to settings
      </button>

      <section
        className="
          overflow-hidden
          rounded-md
          
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            bg-[#ff9c9c]
            px-4
            py-3
          "
        >
          {current.icon}

          <h3
            className="
              font-extrabold
              text-black

              text-[18px]
              md:text-[20px]
              lg:text-[25px]
            "
          >
            {current.title}
          </h3>
        </div>

        <div
          className="
            bg-[#d8d8d8]
            px-4
            py-4
          "
        >
          {current.content}
        </div>
      </section>
    </div>
  );
}
function SettingRow({
  icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        justify-between
        rounded-md
        bg-[#ff9c9c]
        px-4
        py-3
        text-left
        transition
        duration-100
        hover:bg-[#ff8c8c]
        active:scale-[0.99]
      "
    >
      <span
        className="
          flex
          items-center
          gap-3
          font-extrabold
          text-black

          text-[14px]
          md:text-[15px]
          lg:text-[18px]
        "
      >
        {icon}
        {label}
      </span>

      <span className="text-[18px] font-extrabold text-black">
        ▶
      </span>
    </button>
  );
}
function Modal({
  children,
  maxWidth = "max-w-[760px]",
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        px-3
        py-4
        backdrop-blur-[2px]

        sm:px-5
      "
    >
      <div
        className={`
          max-h-[92vh]
          w-full
          overflow-y-auto
          rounded-[10px]
          border
          border-gray-300
          bg-white
          shadow-xl

          ${maxWidth}
        `}
      >
        {children}
      </div>
    </div>
  );
}
function ProfileInput({ label, value, onChange, disabled = false, type = "text" }) {
  return (
    <div>
      <label className="text-[12px] font-bold text-white">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded px-2 py-1 text-[12px] font-semibold outline-none ${
          disabled
            ? "bg-[#d8bfc2] text-gray-700"
            : "bg-white text-black"
        }`}
      />
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  showPassword,
  onToggleShow,
}) {
  return (
    <div>
      <label className="text-[12px] font-bold text-white">
        {label}
      </label>

      <div className="flex items-center rounded bg-white px-2">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full py-1 text-[12px] font-semibold text-black outline-none"
        />

        <button
          type="button"
          onClick={onToggleShow}
          className="ml-2 flex items-center justify-center text-black transition duration-100 active:scale-90"
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
}
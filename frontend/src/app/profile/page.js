"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Home,
  Pencil,
  Settings,
  User,
  Volume2,
  Globe,
  MessageSquareText,
  SlidersHorizontal,
  Bell,
  Eye,
  X,
} from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { LEARNING_GOALS } from "../../data/learningGoals";

/* import { db, auth, storage } from "../../lib/firebase";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
 */
import { db, auth } from "../../lib/firebase";
export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, refreshUserData } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const firstName = user?.fullName || "Student";
  const email = user?.email || "student@email.com";
  const role = user?.role || "Student";
  const englishLevel = user?.englishLevel || "Beginner (A1)";
  const [learningGoal, setLearningGoal] = useState(user?.learningGoal || "");
  const [profileImage, setProfileImage] = useState(user?.photoBase64 || null);
  const fileInputRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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

    if (!newPassword || !confirmPassword) {
      setMessage("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      await updatePassword(auth.currentUser, newPassword);

      setMessage("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      setMessage(
        "Could not update password. You may need to log in again before changing it."
      );
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
    <main className="min-h-screen bg-[#e6e6e6] flex justify-center px-4 py-6 overflow-hidden">
      <section className="w-full max-w-[390px] bg-white border-2 border-[#f3a3a3] rounded-[10px] shadow-md overflow-hidden flex flex-col justify-evenly">
        {/* HEADER */}
        <header className="shrink-0 bg-[#b8b8b8] ">
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

        {/* PROFILE MAIN */}
        <section className="px-6 py-5">
          <div className="flex justify-end mt-2 -mr-4">
            <button
              onClick={handleLogout}
              className="rounded-[5px] bg-red-600 text-[18px] -mt-5 px-5 py-1 whitespace-nowrap font-bold text-white shadow hover:bg-red-700"
            >
              Log out
            </button>
          </div>

          <div className="-mt-2 -ml-2 grid grid-cols-[70px_1fr] gap-9 items-start">
            <div className="flex flex-col items-center w-fit">
              <div className="h-24 w-24 rounded-full bg-[#9d9d9d] flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={42} className="text-black fill-black" />
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full flex items-center justify-center gap-2 text-[12px] text-black transition duration-100 active:scale-95 active:translate-y-[1px] underline hover:text-red-600"
              >
                Edit <Pencil size={12} />
              </button>
            </div>

            <div>
              <h2 className="text-[20px] font-extrabold text-black leading-tight">
                My Profile
              </h2>
              <p className="text-[16px] font-bold text-black leading-tight">{firstName}</p>
              <p className="text-[16px] font-semibold text-black leading-tight">{role}</p>
              <p className="text-[16px] underline text-cyan-600 leading-tight">{email}</p>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="mt-5 w-full rounded-md bg-red-600 py-2 text-[18px] font-extrabold text-white shadow hover:bg-red-700"
          >
            Edit Profile information
          </button>

          <div className="mt-6 border-y border-black py-3 text-center">
            <p className="text-[16px] font-semibold text-black">
              Base in your performance:
            </p>
            <p className="text-[20px] font-extrabold text-black">
              English Level : {englishLevel}
            </p>
          </div>

          <h3 className="mt-3 text-center text-[18px] font-extrabold text-black">
            Settings
          </h3>

          <div className="mt-3 space-y-2">
            <SettingRow icon={<Volume2 size={18} />} label="Voice" />
            <SettingRow icon={<Globe size={18} />} label="Language" />
            <SettingRow icon={<MessageSquareText size={18} />} label="Feedback" />
            <SettingRow icon={<SlidersHorizontal size={18} />} label="Learning level" />
            <SettingRow icon={<Bell size={18} />} label="Notifications" />
          </div>
        </section>

        {/* FOOTER NAV */}
        <nav className="border-t border-black bg-[#b8b8b8] px-4 py-2">
          <div className="grid grid-cols-[1fr_2px_1fr] items-center text-center">
            <Link
              href="/home"
              className="
                  flex flex-col items-center gap-1 text-black
                  hover:scale-[1.1]
                  active:scale-95
                  active:translate-y-[2px]
                  rounded-md
                  py-1
                  "
            >
              <Home size={34} className="fill-black" />
              <span className="text-[15px] font-bold">Home</span>
            </Link>

            <div className="h-full bg-white" />

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
              <BarChart3 size={34} />
              <span className="text-[15px] font-bold">My Progress</span>
            </Link>
          </div>
        </nav>

        {/* EDIT PROFILE MODAL */}
        {showEditModal && (
          <Modal>
            <div className="flex items-center justify-between mb-4">
              <h3 className="rounded-md bg-[#555] px-4 py-1 text-white font-bold text-[18px]">
                Edit Profile information
              </h3>

              <button onClick={() => setShowEditModal(false)}>
                <X size={30} className="text-black" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="size={20} space-y-3">
              <ProfileInput
                label="Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <ProfileInput label="E-mail address" value={email} disabled />

              <ProfileInput label="Role" value={role} disabled />

              <ProfileInput
                label="English Level"
                value={englishLevel}
                disabled
              />

              <div>
                <label className="text-[12px] font-bold text-white">
                  Learning Goal
                </label>

                <select
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  className="w-full rounded px-2 py-1 text-[12px] font-semibold outline-none bg-white text-black"
                >
                  <option value=""></option>

                  {LEARNING_GOALS.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[12px] font-bold text-white">
                  Password
                </label>

                <input
                  value="**************"
                  disabled
                  className="w-full rounded px-2 py-1 text-[12px] text-black outline-none bg-white"
                />
              </div>

              <p className="text-center text-[12px] text-white">
                Do you want to change your password?
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setShowPasswordModal(true);
                  setMessage("");
                }}
                className="block mx-auto text-[12px] font-extrabold underline text-black"
              >
                Change it here
              </button>

              {message && (
                <p className="text-center text-[12px] font-bold text-black">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-md bg-red-600 py-2 text-white font-bold disabled:opacity-60 shadow hover:bg-red-700"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          </Modal>
        )}

        {/* CHANGE PASSWORD MODAL */}
        {showPasswordModal && (
          <Modal>
            <div className="flex items-center justify-between mb-4">
              <h3 className="rounded-md bg-[#555] px-4 py-1 text-white font-bold text-[18px]">
                Edit Profile information
              </h3>

              <button onClick={() => setShowPasswordModal(false)}>
                <X size={30} className="text-black" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <PasswordInput
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                showPassword={showNewPassword}
                onToggleShow={() => setShowNewPassword((prev) => !prev)}
              />

              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                showPassword={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
              />
              
              <button
                type="submit"
                disabled={saving}
                className="block mx-auto rounded-md bg-red-600 px-5 py-2 text-white font-bold disabled:opacity-60
                shadow hover:bg-red-700"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              {message && (
                <p className="text-center text-[12px] font-bold text-black">
                  {message}
                </p>
              )}
            </form>

            <div className="mt-5 border-t-4 border-[#f3a3a3] pt-3 text-[12px] font-semibold text-white">
              <p className="font-extrabold text-white">Password Requirements</p>
              <p>✓ Minimum 8 characters</p>
              <p>✓ At least one uppercase letter (A-Z)</p>
              <p>✓ At least one lowercase letter (a-z)</p>
              <p>✓ At least one number (0-9)</p>
              <p>✓ At least one special character (!@#$%^&*)</p>
            </div>
          </Modal>
        )}
      </section>
    </main>
  );
}

function SettingRow({ icon, label }) {
  return (
    <button className="w-full rounded-sm bg-[#ffb3b3] px-3 py-1 flex items-center justify-between shadow">
      <span className="flex items-center gap-3 text-[14px] font-bold text-black">
        {icon}
        {label}
      </span>
      <span className="text-black font-extrabold">▶</span>
    </button>
  );
}

function Modal({ children }) {
  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center px-5 z-20">
      <div className="w-full max-w-[340px] rounded-[8px] bg-[#9d9d9d] border border-gray-500 shadow-lg px-4 py-4">
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
"use client";

import Link from "next/link";
import { useState } from "react";
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
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";

import { useAuth } from "../../context/AuthContext";
import { db, auth } from "../../lib/firebase";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleOpenEdit = () => {
    setMessage("");
    setFullName(user?.fullName || "");
    setShowEditModal(true);
    setShowPasswordModal(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setMessage("Name is required.");
      return;
    }

    try {
      setSaving(true);

      await updateDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
      });

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
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
          <div className="flex justify-end">
            <button
              className="rounded-[5px] bg-red-600 text-[18px] -mt-5 px-5 py-1 whitespace-nowrap font-bold text-white shadow hover:bg-red-700"
            >
              Log out
            </button>
          </div>

          <div className="-mt-5 grid grid-cols-[64px_1fr] gap-4 items-start">
            <div>
              <div className="mt-3 h-16 w-16 bg-[#9d9d9d] flex items-center justify-center">
                <User size={50} className="text-black fill-black" />
              </div>

              <button
                onClick={handleOpenEdit}
                className="ml-4 mt-1 flex items-center gap-1 text-[15px] underline text-black
                hover:text-red-600"
              >
                Edit <Pencil size={15} />
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
          <div className="grid grid-cols-2 text-center">
            <Link
              href="/home"
              className="flex flex-col items-center gap-1 text-black border-r border-white"
            >
              <Home size={34} className="fill-black" />
              <span className="text-[13px] font-bold">Home</span>
            </Link>

            <Link
              href="/progress"
              className="flex flex-col items-center gap-1 text-black"
            >
              <BarChart3 size={34} />
              <span className="text-[13px] font-bold">My Progress</span>
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

              <div>
                <label className="text-[12px] font-bold text-white">
                  Password
                </label>
                <div className="flex items-center bg-white rounded px-2">
                  <input
                    value="**************"
                    disabled
                    className="w-full py-1 text-[12px] text-black outline-none"
                  />
                  <Eye size={16} className="text-black" />
                </div>
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
              <ProfileInput
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <ProfileInput
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
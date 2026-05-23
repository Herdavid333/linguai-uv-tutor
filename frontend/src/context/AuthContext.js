"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...docSnap.data(),
            });
          } else {
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (studentId, password) => {
    const q = query(
      collection(db, "users"),
      where("studentId", "==", studentId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("student-id-not-found");
    }

    const userData = querySnapshot.docs[0].data();
    const email = userData.email;

    return await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async ({
    fullName,
    studentId,
    email,
    password,
    learningGoal,
  }) => {
    const existingStudentQuery = query(
      collection(db, "users"),
      where("studentId", "==", studentId)
    );

    const existingStudentSnapshot = await getDocs(existingStudentQuery);

    if (!existingStudentSnapshot.empty) {
      throw new Error("student-id-already-in-use");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = userCredential.user;

    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      fullName,
      studentId,
      email,
      role: "student",
      englishLevel: "Beginner (A1)",
      learningGoal,
      createdAt: new Date().toISOString(),
    });

    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email) => {
    const actionCodeSettings = {
      url: "http://localhost:3000/resetPassword", //se debe de cambiar por la url de producción cuando se despliegue
      handleCodeInApp: true,
    };

    return await sendPasswordResetEmail(auth, email, actionCodeSettings);
  };

  const refreshUserData = async () => {
  if (!auth.currentUser) return;

  const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setUser({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        ...docSnap.data(),
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        resetPassword,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
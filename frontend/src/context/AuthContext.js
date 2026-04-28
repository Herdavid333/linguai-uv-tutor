"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { doc, setDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
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

  const register = async ({ fullName, studentId, email, password }) => {
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

    await setDoc(doc(db, "users", firebaseUser.uid), {
      uid: firebaseUser.uid,
      fullName,
      studentId,
      email,
      createdAt: serverTimestamp(),
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
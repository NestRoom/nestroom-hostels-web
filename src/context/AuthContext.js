"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import apiClient from "@/lib/apiClient";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * INITIAL LOAD: Check if we have a valid JWT and fetch user profile
   */
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('nestroom_jwt');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.get('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.error('Failed to load user session:', err.message);
        localStorage.removeItem('nestroom_jwt');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  /**
   * HELPER: Successful Authentication Handler
   * Stores the JWT and the user object in state
   */
  const handleAuthSuccess = (data) => {
    if (data.token) {
      localStorage.setItem('nestroom_jwt', data.token);
    }
    setUser(data.user);
    return data;
  };

  /**
   * GOOGLE SSO FLOW
   */
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Send Firebase ID token to our backend to exchange for our JWT
      const data = await apiClient.post('/auth/google', { idToken });
      return handleAuthSuccess(data);
    } catch (err) {
      console.error('Google Sign-In Error:', err.message);
      throw err;
    }
  };

  /**
   * EMAIL / PASSWORD FLOWS
   */
  const loginWithEmail = async (email, password) => {
    const data = await apiClient.post('/auth/login', { email, password });
    return handleAuthSuccess(data);
  };

  const signUpWithEmail = async (name, email, password, hostelName) => {
    const data = await apiClient.post('/auth/register', { name, email, password, hostelName });
    return handleAuthSuccess(data);
  };

  /**
   * WHATSAPP OTP FLOW
   */
  const sendWhatsAppOtp = async (phone) => {
    return apiClient.post('/auth/whatsapp/send-otp', { phone });
  };

  const verifyWhatsAppOtp = async (phone, otp) => {
    const data = await apiClient.post('/auth/whatsapp/verify-otp', { phone, otp });
    return handleAuthSuccess(data);
  };

  /**
   * LOGOUT
   */
  const logout = async () => {
    localStorage.removeItem('nestroom_jwt');
    setUser(null);
    try {
      await firebaseSignOut(auth); // Clean up Firebase session
    } catch (e) {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        sendWhatsAppOtp,
        verifyWhatsAppOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./NavBar.module.css";
import { secureFetch } from "../../utils/auth";

export default function NavBar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('owner');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await secureFetch('/v1/auth/me');
        if (res.status === 429) {
           console.warn("Auth check rate limited");
           return; // Keep current state
        }
        
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
          setUserType(data.data.user.userType);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        // Skip logging if it's just a session redirect from secureFetch
        if (err.message !== "Session expired. Please log in again.") {
          console.error("Auth check failed:", err);
        }
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);


  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <h1 className={styles.nest}>nest</h1>
        <h1 className={styles.room}>room</h1>
      </div>
      <div className={styles.navLinks}>
        <div className={styles.link}>about</div>
        <div className={styles.link}>features</div>
        <div className={styles.link}>pricing</div>
      </div>
      <div className={styles.buttons}>
        {!isAuthenticated ? (
          <>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <div className={styles.loginButton}>continue</div>
            </Link>
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <button className={styles.signUpButton}>sign up</button>
            </Link>
          </>
        ) : (
          <Link href={userType === 'resident' ? '/student/dashboard' : '/dashboard'} style={{ textDecoration: 'none' }}>
            <button className={styles.signUpButton}>dashboard</button>
          </Link>
        )}

      </div>
    </nav>
  );
}

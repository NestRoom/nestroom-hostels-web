"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./NavBar.module.css";

export default function NavBar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('owner');

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);

    if (token) {
      fetch('http://localhost:5001/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserType(data.data.user.userType);
        }
      })
      .catch(err => console.error(err));
    }
  }, []);


  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <h1 className={styles.nest}>nest</h1>
        <h1 className={styles.room}>room</h1>
      </div>
      <div className={styles.navLinks}>
        <div className={styles.link}>about</div>
        <div className={styles.link}>contact</div>
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

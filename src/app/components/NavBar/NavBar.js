"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import styles from "./NavBar.module.css";
import { secureFetch } from "../../utils/auth";

export default function NavBar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('owner');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
           return;
        }
        
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
          setUserType(data.data.user.userType);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
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
      <div className={styles.logo} onClick={() => window.location.href = "/"}>
        <h1 className={styles.nest}>nest</h1>
        <h1 className={styles.room}>room</h1>
      </div>

      {/* Desktop Links */}
      <div className={styles.navLinks}>
        <div className={styles.link}>about</div>
        <div className={styles.link}>features</div>
        <div className={styles.link}>pricing</div>
      </div>

      <div className={styles.buttons}>
        <div className={styles.desktopButtons}>
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

        {/* Hamburger Toggle */}
        <button 
          className={styles.hamburger} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileLinks}>
            <div className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>about</div>
            <div className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>features</div>
            <div className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>pricing</div>
            
            <div className={styles.mobileActions}>
              {!isAuthenticated ? (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <div className={styles.mobileActionLink}>continue</div>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <button className={styles.mobileSignUpBtn}>sign up</button>
                  </Link>
                </>
              ) : (
                <Link href={userType === 'resident' ? '/student/dashboard' : '/dashboard'} onClick={() => setIsMenuOpen(false)}>
                  <button className={styles.mobileSignUpBtn}>dashboard</button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

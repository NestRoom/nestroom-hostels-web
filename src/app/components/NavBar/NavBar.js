"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./NavBar.module.css";
import { secureFetch } from "../../utils/auth";

export default function NavBar() {
  const router = useRouter();
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
              <button 
                className={styles.loginButton} 
                onClick={() => router.push('/login')}
              >
                continue
              </button>
              <button 
                className={styles.signUpButton} 
                onClick={() => router.push('/signup')}
              >
                sign up
              </button>
            </>
          ) : (
            <button 
              className={styles.signUpButton} 
              onClick={() => router.push(userType === 'resident' ? '/student/dashboard' : '/dashboard')}
            >
              dashboard
            </button>
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
            <div className={styles.mobileLink} onClick={() => { setIsMenuOpen(false); router.push('/'); }}>about</div>
            <div className={styles.mobileLink} onClick={() => { setIsMenuOpen(false); router.push('/'); }}>features</div>
            <div className={styles.mobileLink} onClick={() => { setIsMenuOpen(false); router.push('/'); }}>pricing</div>
            
            <div className={styles.mobileActions}>
              {!isAuthenticated ? (
                <>
                  <button 
                    className={styles.mobileActionLink} 
                    onClick={() => { setIsMenuOpen(false); router.push('/login'); }}
                  >
                    continue
                  </button>
                  <button 
                    className={styles.mobileSignUpBtn} 
                    onClick={() => { setIsMenuOpen(false); router.push('/signup'); }}
                  >
                    sign up
                  </button>
                </>
              ) : (
                <button 
                  className={styles.mobileSignUpBtn} 
                  onClick={() => { setIsMenuOpen(false); router.push(userType === 'resident' ? '/student/dashboard' : '/dashboard'); }}
                >
                  dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

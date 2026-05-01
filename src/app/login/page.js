"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import NavBar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
import LoginCard from "../components/AuthCard/LoginCard";
import { secureFetch } from "../utils/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await secureFetch("/v1/auth/me");
        const data = await res.json();
        
        if (data.success) {
          if (data.data.user.userType === 'resident') {
            router.push("/student/dashboard");
          } else {
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    
    checkAuth();
  }, [router]);


  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <NavBar />
        <main className={styles.main}>
          <div className={styles.leftContent}>
            <div className={styles.hero}>
              <h1 className={styles.titleBlack}>hostel</h1>
              <h1 className={styles.titleBlack}>
                management, <span className={styles.titleBlue}>finally simple.</span>
              </h1>
            </div>
            
            <p className={styles.description}>
              Join over 500+ hostels streamlining their operations with Nestroom. Automate check-ins, manage inventory, and grow revenue.
            </p>

            <div className={styles.trustedBadge}>
              <div className={styles.avatars}>
                <div className={styles.avatar}>
                  <img src="https://i.pravatar.cc/100?img=33" className={styles.avatarImage} alt="Hostel owner" />
                </div>
                <div className={styles.avatar}>
                  <img src="https://i.pravatar.cc/100?img=47" className={styles.avatarImage} alt="Hostel owner" />
                </div>
                <div className={styles.avatar}>
                  <img src="https://i.pravatar.cc/100?img=12" className={styles.avatarImage} alt="Hostel owner" />
                </div>
              </div>
              <span className={styles.trustedText}>Trusted by modern hostels</span>
            </div>
          </div>
          
          <div className={styles.rightContent}>
            <LoginCard />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

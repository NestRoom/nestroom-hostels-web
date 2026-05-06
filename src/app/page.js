"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";

export default function Home() {
  const [mobileNumber, setMobileNumber] = useState("");
  const router = useRouter();

  const handleStartSignup = () => {
    if (mobileNumber) {
      router.push(`/signup?phone=${encodeURIComponent(mobileNumber)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleStartSignup();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <NavBar />
        <main className={styles.main}>
          <div className={styles.leftContent}>
            <div className={styles.hero}>
              <h1 className={styles.titleBlack}>hostel</h1>
              <h1 className={styles.titleBlack}>management,</h1>
              <h1 className={styles.titleBlue}>finally simple.</h1>
            </div>
            
            <div className={styles.inputContainer}>
              <div className={styles.topDivBg}></div>
              
              <div className={styles.inputContent}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.phoneIcon}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <div className={styles.inputFieldWrapper}>
                   <input 
                    type="tel" 
                    placeholder="mobile number" 
                    className={styles.inputField}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button className={styles.submitButton} onClick={handleStartSignup}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.arrowIcon}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 16 16 12 12 8"></polyline>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className={styles.videoContainer}>
            <video className={styles.videoContent} src="/StopmotionAnimationNestRoom.mp4" autoPlay loop muted playsInline></video>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

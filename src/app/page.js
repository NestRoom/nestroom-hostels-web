"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default function Home() {
  const [phone, setPhone] = useState("");

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  };

  return (
    <div className={styles.page}>
      
      <Navbar />

      {/* Main Content */}
      <main className={styles.main}>
        
        {/* Left Column: Text & Input */}
        <div className={styles.heroLeft}>
          <h1 className={styles.heroHeading}>
            hostel<br />
            management,<br />
            <span className={styles.blueText}>finally simple.</span>
          </h1>

          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <PhoneIcon />
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="mobile number"
                className={styles.phoneInput}
                value={phone}
                onChange={handlePhoneChange}
              />
            </div>
            <button className={styles.arrowBtn}>
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        {/* Right Column: Video */}
        <div className={styles.heroRight}>
          <div className={styles.imageWrapper}>
            <video
              src="/StopmotionAnimationNestRoom.mp4"
              autoPlay
              loop
              muted
              playsInline
              className={styles.heroVideo}
            />
            <div className={styles.innerShadowOverlay}></div>
          </div>
        </div>

      </main>

      <Footer />

    </div>
  );
}

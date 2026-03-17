"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./signup.module.css";

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <path d="M9 22v-4h6v4"></path>
    <path d="M8 6h.01"></path>
    <path d="M16 6h.01"></path>
    <path d="M12 6h.01"></path>
    <path d="M12 10h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M16 10h.01"></path>
    <path d="M16 14h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M8 14h.01"></path>
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default function SignUpPage() {
  const [hostelName, setHostelName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement sign up logic
    console.log("Sign up:", { hostelName, email, password });
  };

  return (
    <div className={styles.page}>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          nest<span className={styles.blueText}>room</span>
        </Link>

        <div className={styles.navLinks}>
          <a href="#">about</a>
          <a href="#">features</a>
          <a href="#">pricing</a>
        </div>

        <div className={styles.navCtas}>
          <Link href="/login" className={styles.continueBtn}>continue</Link>
          <Link href="/signup" className={styles.signupBtn}>sign up</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.main}>

        {/* Left Column */}
        <div className={styles.heroLeft}>
          <h1 className={styles.heroHeading}>
            hostel<br />
            management,<br />
            <span className={styles.blueText}>finally simple.</span>
          </h1>

          <p className={styles.heroSubtext}>
            Join over 500+ hostels streamlining their operations with Nestroom. Automate check-ins, manage inventory, and grow revenue.
          </p>

          <div className={styles.trustBadge}>
            <div className={styles.avatarStack}>
              <div className={styles.avatar} style={{ background: "#343df4" }}></div>
              <div className={styles.avatar} style={{ background: "#6366f1" }}></div>
              <div className={styles.avatar} style={{ background: "#818cf8" }}></div>
            </div>
            <span className={styles.trustText}>Trusted by modern hostels</span>
          </div>
        </div>

        {/* Right Column: Form Card */}
        <div className={styles.heroRight}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Get Started</h2>
            <p className={styles.formSubtitle}>Create your admin account in seconds.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Hostel Name</label>
                <div className={styles.inputRow}>
                  <BuildingIcon />
                  <input
                    type="text"
                    placeholder="e.g. Sunny Backpackers"
                    className={styles.input}
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Work Email</label>
                <div className={styles.inputRow}>
                  <MailIcon />
                  <input
                    type="email"
                    placeholder="name@hostel.com"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Create Password</label>
                <div className={styles.inputRow}>
                  <LockIcon />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Sign Up <ArrowRightIcon />
              </button>
            </form>

            <p className={styles.switchText}>
              Already have an account?{" "}
              <Link href="/login" className={styles.switchLink}>Log in</Link>
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.divider}></div>
        <div className={styles.footerInner}>
          <p className={styles.copyright}>© nestroom, 2026</p>
          <div className={styles.footerLinks}>
            <a href="#">T&C apply</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

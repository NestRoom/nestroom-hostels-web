"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./login.module.css";

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login:", { email, password });
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
            Welcome back! Sign in to manage your hostel operations seamlessly.
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
            <h2 className={styles.formTitle}>Welcome Back</h2>
            <p className={styles.formSubtitle}>Sign in to your admin account.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
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
                <label className={styles.fieldLabel}>Password</label>
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
                Log In <ArrowRightIcon />
              </button>
            </form>

            <p className={styles.switchText}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className={styles.switchLink}>Sign up</Link>
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

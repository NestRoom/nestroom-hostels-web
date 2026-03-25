"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
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

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.18 11.18 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function LoginContent() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone") || "";
  const initialTab = initialPhone ? "phone" : "email";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef([]);
  const { loginWithEmail, signInWithGoogle, sendWhatsAppOtp, verifyWhatsAppOtp } = useAuth();
  const router = useRouter();

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await sendWhatsAppOtp(`+91${phone}`);
      setOtpSent(true);
      setResendTimer(60);
    } catch (err) {
      console.error("WhatsApp OTP error:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await verifyWhatsAppOtp(`+91${phone}`, code);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setOtpSent(false);
    setTimeout(() => handleSendOtp(), 100);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError("");
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setConfirmationResult(null);
  };

  return (
    <div className={styles.page}>

      <Navbar />

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

            {/* Tab Switcher */}
            <div className={styles.tabSwitcher}>
              <button
                className={`${styles.tab} ${activeTab === "email" ? styles.tabActive : ""}`}
                onClick={() => switchTab("email")}
                type="button"
              >
                Email
              </button>
              <button
                className={`${styles.tab} ${activeTab === "phone" ? styles.tabActive : ""}`}
                onClick={() => switchTab("phone")}
                type="button"
              >
                Phone
              </button>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            {/* Email Tab */}
            {activeTab === "email" && (
              <form onSubmit={handleEmailSubmit} className={styles.form}>
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

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <span className={styles.spinner}></span>
                  ) : (
                    <>Log In <ArrowRightIcon /></>
                  )}
                </button>
              </form>
            )}

            {/* Phone Tab */}
            {activeTab === "phone" && !otpSent && (
              <form onSubmit={handleSendOtp} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Mobile Number</label>
                  <div className={styles.inputRow}>
                    <PhoneIcon />
                    <span className={styles.countryCode}>+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      className={styles.input}
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="send-otp-btn"
                  className={styles.submitBtn}
                  disabled={loading || phone.length !== 10}
                >
                  {loading ? (
                    <span className={styles.spinner}></span>
                  ) : (
                    <>Send OTP <ArrowRightIcon /></>
                  )}
                </button>
              </form>
            )}

            {/* OTP Verification Step */}
            {activeTab === "phone" && otpSent && (
              <form onSubmit={handleVerifyOtp} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Enter verification code</label>
                  <p className={styles.otpHint}>
                    Sent to +91 {phone.slice(0, 5)} {phone.slice(5)}
                  </p>
                  <div className={styles.otpContainer}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        className={styles.otpInput}
                        autoFocus={i === 0}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <span className={styles.spinner}></span>
                  ) : (
                    <>Verify <ArrowRightIcon /></>
                  )}
                </button>

                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </form>
            )}

            <div className={styles.orDivider}>
              <span className={styles.orLine}></span>
              <span className={styles.orText}>or</span>
              <span className={styles.orLine}></span>
            </div>

            <button
              type="button"
              className={styles.googleBtn}
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className={styles.switchText}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className={styles.switchLink}>Sign up</Link>
            </p>
          </div>
        </div>

      </main>

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>

      <Footer />

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.page}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

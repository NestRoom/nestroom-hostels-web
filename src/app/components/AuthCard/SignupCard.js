import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Loading from '../Loading/Loading';
import styles from './AuthCard.module.css';
import { setTokens } from '../../utils/auth';

export default function SignupCard() {

  const router = useRouter();
  const [step, setStep] = useState(1);
  
  const [hostelName, setHostelName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;
    
    const newOtp = [...emailOtp];
    newOtp[index] = value.substring(value.length - 1);
    setEmailOtp(newOtp);
    setError("");

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).replace(/[^0-9]/g, '');
    if (pastedData) {
      const newOtp = [...emailOtp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setEmailOtp(newOtp);
      setError("");
      const nextEmptyIndex = pastedData.length < 6 ? pastedData.length : 5;
      otpRefs.current[nextEmptyIndex]?.focus();
    }
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = () => {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain a number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain a special character.";
    if (password !== repeatPassword) return "Passwords do not match.";
    return "";
  };

  const handleSignupSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/v1/auth/owner/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostelName,
          ownerName,
          whatsappNumber: countryCode + whatsappNumber,
          email,
          password,
          confirmPassword: repeatPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setStep(3);
      } else {
        let errMsg = data.error?.message || data.message || "Signup failed";
        if (data.error?.details && data.error.details.length > 0) {
          errMsg = data.error.details[0].message;
        }
        setError(errMsg);
      }
    } catch (err) {
      setError("Connection to server failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/v1/auth/owner/verify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hostelName,
          ownerName,
          email, 
          emailOtp: emailOtp.join(''),
          whatsappNumber: countryCode + whatsappNumber,
          password
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setTokens(data.data.accessToken, data.data.refreshToken);
        router.push('/profile');
      } else {
        let errMsg = data.error?.message || data.message || "Verification failed";
        if (data.error?.details && data.error.details.length > 0) {
          errMsg = data.error.details[0].message;
        }
        setError(errMsg);
      }
    } catch (err) {
      setError("Connection to server failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const passError = validatePassword();
      if (passError) {
        setError(passError);
        return;
      }
      handleSignupSubmit();
    } else if (step === 3) {
      handleVerifySubmit();
    }
  };

  return (
    <>
      {loading && <Loading text="Securely processing your request..." />}
      <div className={styles.card}>
        <div className={styles.cardGlow}></div>
      
      <h2 className={styles.title}>Get Started</h2>
      <p className={styles.subtitle}>
        {step === 1 && "Create your admin account in seconds."}
        {step === 2 && "Secure your account with a password."}
        {step === 3 && "Verify your contact details."}
      </p>
      
      <form className={styles.form} onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Hostel Name</label>
              <div className={styles.inputWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="e.g. Sunrise PG" 
                  className={styles.input} 
                  required 
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Owner Name</label>
              <div className={styles.inputWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  className={styles.input} 
                  required 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Owner Email</label>
              <div className={styles.inputWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input 
                  type="email" 
                  placeholder="name@hostel.com" 
                  className={styles.input} 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Owner WhatsApp Number</label>
              <div className={styles.inputWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <select className={styles.countrySelect} value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US/CA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+971">+971 (UAE)</option>
                  <option value="+61">+61 (AU)</option>
                </select>
                <input 
                  type="tel" 
                  placeholder="9876543210" 
                  className={styles.input} 
                  required 
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Create Password</label>
              <div className={styles.inputWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={styles.input} 
                  required 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                />
                <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Repeat Password</label>
              <div className={styles.inputWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input 
                  type={showRepeatPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={styles.input} 
                  required 
                  value={repeatPassword}
                  onChange={(e) => { setRepeatPassword(e.target.value); setError(""); }}
                />
                <button type="button" className={styles.passwordToggle} onClick={() => setShowRepeatPassword(!showRepeatPassword)}>
                  {showRepeatPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Verification OTP</label>
              <div className={styles.otpContainer}>
                {emailOtp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={styles.otpBoxInput}
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={handleOtpPaste}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        
        {error && (
          <p className={styles.errorText} style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>
        )}

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Processing..." : step === 3 ? "Complete Signup" : "Continue"} 
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.buttonIcon}>
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </form>
      
      {step === 1 && (
        <p className={styles.footerText}>
          Already have an account? <Link href="/login" className={styles.link}>Log in</Link>
        </p>
      )}
      {step > 1 && !loading && (
        <p className={styles.footerText}>
          <span style={{cursor: 'pointer'}} onClick={() => { setStep(step - 1); setError(""); }} className={styles.link}>Go Back</span>
        </p>
      )}
    </div>
    </>
  );
}

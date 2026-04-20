import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Loading from '../Loading/Loading';
import styles from './AuthCard.module.css';

import { setTokens } from '../../utils/auth';

export default function LoginCard() {
  const router = useRouter();
  const [loginType, setLoginType] = useState('owner'); // 'owner' or 'resident'
  const [email, setEmail] = useState('');
  const [residentId, setResidentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = loginType === 'resident' 
      ? 'http://localhost:5001/v1/auth/resident/login' 
      : 'http://localhost:5001/v1/auth/login';

    const body = loginType === 'resident'
      ? { residentId, email, password }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setTokens(data.data.accessToken, data.data.refreshToken);
        if (loginType === 'resident') {
          router.push('/student/dashboard');
        } else {
          router.push('/dashboard'); 
        }
      } else {
        setError(data.error?.message || data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loading text="Authenticating..." />}
      <div className={styles.card}>
        <div className={styles.cardGlow}></div>
      
      <div className={styles.typeToggle}>
        <button 
          className={`${styles.toggleBtn} ${loginType === 'owner' ? styles.active : ''}`}
          onClick={() => setLoginType('owner')}
        >
          Owner / Staff
        </button>
        <button 
          className={`${styles.toggleBtn} ${loginType === 'resident' ? styles.active : ''}`}
          onClick={() => setLoginType('resident')}
        >
          Resident
        </button>
      </div>

      <h2 className={styles.title}>{loginType === 'owner' ? 'Welcome Back' : 'Resident Portal'}</h2>
      <p className={styles.subtitle}>
        {loginType === 'owner' ? 'Log in to manage your hostel.' : 'Log in to access your dashboard.'}
      </p>
      
      <form className={styles.form} onSubmit={handleLogin}>
        {loginType === 'resident' && (
          <div className={styles.inputGroup}>
            <label className={styles.label}>Assigned Code</label>
            <div className={styles.inputWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input 
                type="text" 
                placeholder="e.g. RES-H01-2024-001" 
                className={styles.input} 
                required 
                value={residentId}
                onChange={(e) => setResidentId(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className={styles.inputGroup}>
          <label className={styles.label}>{loginType === 'owner' ? 'Owner Email' : 'Email Address'}</label>
          <div className={styles.inputWrapper}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
              <path d="M4 10v11" />
              <path d="M20 10v11" />
              <path d="M10 21v-5a2 2 0 0 1 4 0v5" />
              <path d="M4 10L12 3l8 7" />
            </svg>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className={styles.input} 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Password</label>
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
              onChange={(e) => setPassword(e.target.value)}
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

        {error && (
          <p className={styles.errorText} style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>
        )}
        
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Log In"} 
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.buttonIcon}>
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </form>
      
      {loginType === 'owner' && (
        <p className={styles.footerText}>
          Don&apos;t have an account? <Link href="/signup" className={styles.link}>Sign up</Link>
        </p>
      )}
      </div>
    </>
  );
}

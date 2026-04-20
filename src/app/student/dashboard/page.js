"use client";

import { useState, useEffect } from "react";
import Loading from "../../components/Loading/Loading";
import styles from "./page.module.css";
import { secureFetch } from "../../utils/auth";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { success, message, status }

  // Password states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const checkAttendance = async () => {
    try {
      const res = await secureFetch("http://localhost:5001/v1/residents/attendance/active");
      const data = await res.json();
      if (data.status === 'success' && data.data.activeRequest) {
        setActiveRequest(data.data.activeRequest);
      } else {
        setActiveRequest(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAttendance();
    // Poll every 30 seconds for surprise checks
    const interval = setInterval(checkAttendance, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAttendance = () => {
    setSubmitting(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setSubmitting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          const res = await secureFetch("http://localhost:5001/v1/residents/attendance/submit", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              status: "Present",
              latitude,
              longitude,
              accuracy
            })
          });

          const data = await res.json();
          if (data.status === 'success') {
            setResult({ success: true, message: data.data.message, status: data.data.status });
            setActiveRequest(null);
          } else {
            setResult({ success: false, message: data.message });
          }
        } catch (e) {
             setResult({ success: false, message: "Server error occurred" });
        } finally {
          setSubmitting(false);
        }
      },
      (error) => {
        alert("Please enable location access to mark attendance.");
        setSubmitting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await secureFetch("http://localhost:5001/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert("Password changed successfully!");
        setIsPasswordModalOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.message || "Failed to change password");
      }
    } catch (e) {
      alert("Error connecting to server");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {loading && <Loading />}
      
      <div className={styles.content}>
        <div className={styles.header}>
            <div className={styles.logo}>
                <span className={styles.nest}>nest</span><span className={styles.room}>room</span>
            </div>
            <div className={styles.userBadge}>Student Portal</div>
        </div>

        <div className={styles.welcome}>
             <h1 className={styles.welcomeTitle}>Hi there! 👋</h1>
             <p className={styles.welcomeSub}>Stay updated with your hostel activities.</p>
        </div>

        {activeRequest && (
          <div className={styles.attendanceCard}>
            <div className={styles.attendanceGlow}></div>
            <div className={styles.attendanceContent}>
              <div className={styles.alertIcon}>
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h2 className={styles.attendanceTitle}>Attendance Required</h2>
              <p className={styles.attendanceDesc}>{activeRequest.remarks || "Regular daily check-in is active."}</p>
              
              <button 
                className={styles.markBtn} 
                onClick={handleMarkAttendance}
                disabled={submitting}
              >
                {submitting ? "Verifying Location..." : "Verify & Mark Present"}
              </button>
              
              <p className={styles.geoHint}>Verification uses your secure GPS location.</p>
            </div>
          </div>
        )}

        {result && (
          <div className={`${styles.resultCard} ${result.success ? styles.resSuccess : styles.resError}`}>
            <div className={styles.resultHeader}>
                {result.success ? "Success!" : "Verification Failed"}
                <button onClick={() => setResult(null)}>&times;</button>
            </div>
            <p>{result.message}</p>
          </div>
        )}

        <div className={styles.grid}>
             <div className={styles.miniCard}>
                <div className={styles.miniIcon} style={{ background: '#3b3bff1a', color: '#3b3bff' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h3 className={styles.miniCardTitle}>Attendance History</h3>
                <p className={styles.miniCardDesc}>View your past presence records.</p>
             </div>
             <div className={styles.miniCard}>
                <div className={styles.miniIcon} style={{ background: '#10b9811a', color: '#10b981' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h3 className={styles.miniCardTitle}>Leave Request</h3>
                <p className={styles.miniCardDesc}>Apply for home leave or medical leave.</p>
             </div>
             <div className={styles.miniCard} onClick={() => setIsPasswordModalOpen(true)} style={{ cursor: 'pointer' }}>
                <div className={styles.miniIcon} style={{ background: '#2C1DFF1a', color: '#2C1DFF' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h3 className={styles.miniCardTitle}>Security Settings</h3>
                <p className={styles.miniCardDesc}>Update your portal login password.</p>
             </div>
        </div>

        {isPasswordModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsPasswordModalOpen(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Change Password</h2>
              <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
                <div className={styles.inputGroup}>
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} className={styles.cancelBtn}>Cancel</button>
                  <button type="submit" className={styles.submitBtn} disabled={passwordLoading}>
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { secureFetch } from "../../utils/auth";
import Loading from "../../components/Loading/Loading";

export default function StudentOverview() {
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const fetchData = async () => {
    try {
      const [profileRes, activeRes, notifRes] = await Promise.all([
        secureFetch("/v1/residents/profile"),
        secureFetch("/v1/residents/attendance/active"),
        secureFetch("/v1/residents/notifications?limit=5")
      ]);

      const profileData = await profileRes.json();
      if (profileData.success) {
        setResident(profileData.data.resident);
      }

      const activeData = await activeRes.json();
      if (activeData.status === 'success' && activeData.data.activeRequest) {
        setActiveRequest(activeData.data.activeRequest);
      }

      const notifData = await notifRes.json();
      if (notifData.success) {
        setNotifications(notifData.data.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
          const res = await secureFetch("/v1/residents/attendance/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Present", latitude, longitude, accuracy })
          });

          const data = await res.json();
          if (data.status === 'success') {
            setResult({ success: true, message: data.data.message });
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

  if (loading) return null;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.mainFeed}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Welcome back, {resident?.fullName?.split(" ")[0] || "Resident"}</h1>
          <p className={styles.subtitle}>Here&apos;s a live overview of your residency at {resident?.hostelId?.hostelName || "NestRoom"}.</p>
        </header>

        {/* Attendance Banner */}
        {activeRequest && (
          <div className={styles.attendanceAlert}>
            <div className={styles.alertContent}>
              <div className={styles.alertIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M8 17A5 5 0 0 1 12 7a5 5 0 0 1 4 10"/><path d="M12 2v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 6.3 1.4-1.4"/><path d="M22 12h-2"/><path d="M4 12H2"/><path d="m17.7 17.7 1.4 1.4"/><path d="m4.9 19.1 1.4-1.4"/></svg>
              </div>
              <div className={styles.alertText}>
                <h4>Attendance Verification Active</h4>
                <p>{activeRequest.remarks || "A surprise check has been triggered by the administration."}</p>
              </div>
              <button 
                className={styles.markBtn} 
                onClick={handleMarkAttendance}
                disabled={submitting}
              >
                {submitting ? "Verifying Location..." : "Confirm Presence"}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className={`${styles.resultAlert} ${result.success ? styles.resSuccess : styles.resError}`}>
            <p>{result.message}</p>
            <button onClick={() => setResult(null)}>&times;</button>
          </div>
        )}

        <div className={styles.statGrid}>
          <div className={styles.roomCard}>
            <div className={styles.cardHeader}>
              <h3>Your Sanctuary</h3>
              <span className={styles.tag}>Assigned</span>
            </div>
            <div className={styles.roomNumber}>
              <span className={styles.label}>Room Number</span>
              <h2>{resident?.roomId?.roomNumber || "N/A"}</h2>
            </div>
            <div className={styles.roomMeta}>
              <div className={styles.metaItem}>
                 <span className={styles.metaLabel}>Bed</span>
                 <span className={styles.metaValue}>{resident?.bedId?.bedNumber || "A"}</span>
              </div>
              <div className={styles.metaItem}>
                 <span className={styles.metaLabel}>Building</span>
                 <span className={styles.metaValue}>{resident?.buildingId?.buildingNumber || "Main"}</span>
              </div>
              <div className={styles.metaItem}>
                 <span className={styles.metaLabel}>Floor</span>
                 <span className={styles.metaValue}>{resident?.roomId?.floorNumber || "1"}</span>
              </div>
              <div className={styles.metaItem}>
                 <span className={styles.metaLabel}>Type</span>
                 <span className={styles.metaValue}>{resident?.roomId?.roomType || "Standard"}</span>
              </div>
            </div>
          </div>

          <div className={styles.kycCard}>
            <div className={styles.cardHeader}>
              <h3>Identity Status</h3>
            </div>
            <div className={styles.kycStatusWrapper}>
              <div 
                className={`${styles.kycIndicator} ${styles[resident?.kyc?.kycStatus?.toLowerCase() || 'pending']}`}
              >
                {resident?.kyc?.kycStatus || "Pending"}
              </div>
              <p className={styles.kycHint}>
                {resident?.kyc?.kycStatus === 'Verified' 
                  ? "Your identity documents are verified. You have full access to all hostel amenities." 
                  : "Please ensure your Aadhaar and College ID are uploaded to avoid any service interruptions."}
              </p>
              {resident?.kyc?.kycStatus !== 'Verified' && (
                <button className={styles.actionLink} onClick={() => window.location.href = "/student/profile"}>
                  Complete KYC Now
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Financial Timeline</h3>
          <div className={styles.eventItem}>
            <div className={styles.eventDate}>
               <span>{resident?.nextDueDate ? new Date(resident.nextDueDate).getDate() : "17"}</span>
               <small>{resident?.nextDueDate ? new Date(resident.nextDueDate).toLocaleString('default', { month: 'short' }) : "MAY"}</small>
            </div>
            <div className={styles.eventInfo}>
              <h4>Rent Payment Cycle</h4>
              <p>Due in {resident?.nextDueDate ? Math.ceil((new Date(resident.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24)) : "27"} days • Monthly Subscription</p>
            </div>
            <button className={styles.payBtnSmall} onClick={() => window.location.href = "/student/payments"}>
              Pay ₹{resident?.feeAmount?.toLocaleString() || 0}
            </button>
          </div>
        </section>
      </div>

      <aside className={styles.infoPanel}>
        <div className={styles.panelSection}>
          <h4 className={styles.panelTitle}>Digital Notice Board</h4>
          <div className={styles.announcementList}>
            {notifications.length === 0 ? (
              <p className={styles.emptyText}>No recent updates from administration.</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className={styles.announcement} onClick={() => window.location.href = "/student/notifications"}>
                   <div 
                     className={styles.annIcon} 
                     style={{ 
                       background: notif.type === 'Emergency' ? '#FFF5F5' : notif.type === 'Announcement' ? '#ECFDF5' : '#F0F9FF', 
                       color: notif.type === 'Emergency' ? '#E53E3E' : notif.type === 'Announcement' ? '#059669' : '#0369A1' 
                     }}
                   >
                     {notif.type === 'Emergency' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                     ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                     )}
                   </div>
                   <div className={styles.annText}>
                     <h6>{notif.title}</h6>
                     <p>{notif.message.substring(0, 60)}...</p>
                     <span className={notif.isRead ? styles.isRead : styles.isUnread}>
                        {notif.isRead ? "Viewed" : "New Notice"} • {new Date(notif.sentAt).toLocaleDateString()}
                     </span>
                   </div>
                </div>
              ))
            )}
          </div>
          <button className={styles.actionBtnFull} onClick={() => window.location.href = "/student/notifications"}>
            View Archive
          </button>
        </div>

      </aside>
    </div>
  );
}

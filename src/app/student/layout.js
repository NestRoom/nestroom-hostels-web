"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./layout.module.css";
import { secureFetch, clearTokens } from "../utils/auth";
import Loading from "../components/Loading/Loading";
import ResidentNav from "../components/ResidentNav/ResidentNav";

export default function StudentLayout({ children }) {
  const pathname = usePathname();
  const [resident, setResident] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const [profileRes, notifRes] = await Promise.all([
        secureFetch("/v1/residents/profile"),
        secureFetch("/v1/residents/notifications")
      ]);

      const profileData = await profileRes.json();
      if (profileData.success) {
        setResident(profileData.data.resident);
        
        // Nudge to profile if KYC is pending and they are on dashboard
        if (profileData.data.resident.kyc?.kycStatus === 'Pending' && pathname === '/student/dashboard' && !profileData.data.resident.kyc?.profilePhoto) {
           router.push("/student/profile");
        }
      }

      const notifData = await notifRes.json();
      if (notifData.success) {
        // Count notifications where resident is not in viewedBy (viewedBy is not returned by student API for safety, but we can check a flag if backend provides it)
        // Actually, let's update the backend getMyNotifications to include an 'isRead' flag.
        const unread = notifData.data.notifications.filter(n => !n.isRead).length; 
        setUnreadCount(unread);
      }
    } catch (e) {
      console.error("Failed to fetch resident data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [pathname]);

  if (loading) return <Loading text="Setting up your portal..." />;

  return (
    <div className={styles.container}>
      <ResidentNav />
      <main className={styles.mainContent}>
        <div className={styles.centerWrapper}>
          {children}
        </div>
      </main>

      {/* Global Floating Emergency Button */}
      <div className={styles.emergencyFabContainer}>
        <div className={styles.fabOptions}>
          <div className={styles.fabOption} onClick={() => window.open('tel:+919876543210')}>
            <span>Warden</span>
            <div className={styles.optionIcon}>👤</div>
          </div>
          <div className={styles.fabOption} onClick={() => window.open('tel:104')}>
            <span>Maintenance</span>
            <div className={styles.optionIcon}>🛠️</div>
          </div>
        </div>
        <button 
          className={styles.fabMain} 
          onClick={() => window.open('tel:+919876543210')}
          title="Emergency Contact"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </button>
      </div>
    </div>
  );
}

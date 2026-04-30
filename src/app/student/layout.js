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
        secureFetch("http://localhost:5001/v1/residents/profile"),
        secureFetch("http://localhost:5001/v1/residents/notifications")
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
    </div>
  );
}

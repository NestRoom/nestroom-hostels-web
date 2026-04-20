"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./layout.module.css";
import { secureFetch, clearTokens } from "../utils/auth";
import Loading from "../components/Loading/Loading";

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
  }, [pathname]); // Refresh on navigation to clear unread if they visited notifications

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  if (loading) return <Loading text="Setting up your portal..." />;

  const navItems = [
    { 
      name: "Overview", 
      path: "/student/dashboard", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      )
    },
    { 
      name: "My Profile", 
      path: "/student/profile", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      )
    },
    { 
      name: "Payments", 
      path: "/student/payments", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
      )
    },
    { 
      name: "Complaints", 
      path: "/student/complaints", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      )
    },
    { 
      name: "Notice Board", 
      path: "/student/notifications", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      )
    },
  ];

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.nest}>nest</span><span className={styles.room}>room</span>
          </div>
          <p className={styles.portalTag}>Student Portal</p>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`${styles.navItem} ${pathname === item.path ? styles.active : ""}`}
            >
              <div className={styles.iconWrapper}>
                <span className={styles.navIcon}>{item.icon}</span>
                {item.name === "Notice Board" && unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{unreadCount}</span>
                )}
              </div>
              <span className={styles.navName}>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userBrief}>
            <div className={styles.avatar}>
               {resident?.kyc?.profilePhoto ? (
                 <img src={resident.kyc.profilePhoto} alt="Profile" />
               ) : (
                 <div className={styles.avatarPlaceholder}>{resident?.fullName?.[0] || "S"}</div>
               )}
            </div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{resident?.fullName || "Student"}</p>
              <p className={styles.userRole}>{resident?.residentId || "RES_ID"}</p>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.centerWrapper}>
          {children}
        </div>
      </main>
    </div>
  );
}

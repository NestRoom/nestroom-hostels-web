"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./notifications.module.css";
import { secureFetch } from "../../utils/auth";
import Loading from "../../components/Loading/Loading";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await secureFetch("http://localhost:5001/v1/residents/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        if (data.data.notifications.length > 0) {
          setSelectedNotif(data.data.notifications[0]);
          markAsRead(data.data.notifications[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await secureFetch(`http://localhost:5001/v1/residents/notifications/${id}/read`, {
        method: "PUT"
      });
      // Optionally update local state to mark as read immediately
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSelectNotif = (notif) => {
    setSelectedNotif(notif);
    markAsRead(notif._id);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <Loading text="Fetching notifications..." />;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Notice Board</h1>
          <p className={styles.subtitle}>Stay informed with official updates from NestRoom Management.</p>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <aside className={styles.listCard}>
          <div className={styles.listHeader}>
             <span>Recent Updates</span>
             {unreadCount > 0 && <span className={styles.count}>{unreadCount} New</span>}
          </div>
          <div className={styles.notifList}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No announcements at this time.</div>
            ) : (
              [...notifications].reverse().map((notif) => (
                <div 
                  key={notif._id} 
                  className={`${styles.notifItem} ${selectedNotif?._id === notif._id ? styles.active : ""}`}
                  onClick={() => handleSelectNotif(notif)}
                >
                  <div className={styles.itemHeader}>
                    <span className={`${styles.typeTag} ${styles[notif.type.toLowerCase()]}`}>
                      {notif.type}
                    </span>
                    <span className={styles.date}>
                      {new Date(notif.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <h3 className={styles.itemTitle}>{notif.title}</h3>
                  <p className={styles.itemPreview}>{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className={styles.contentCard}>
          {selectedNotif ? (
            <div key={selectedNotif._id} className={styles.notifDeatils}>
               <div className={styles.detailsHeader}>
                  <div className={styles.fullDate}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {new Date(selectedNotif.sentAt).toLocaleString("en-IN", { 
                      day: '2-digit', month: 'long', year: 'numeric', 
                      hour: '2-digit', minute: '2-digit', hour12: true 
                    })}
                  </div>
                  <h2 className={styles.detailsTitle}>{selectedNotif.title}</h2>
                  <div style={{ marginTop: '1.5rem' }}>
                    <span className={`${styles.typeTag} ${styles[selectedNotif.type.toLowerCase()]}`}>
                      Official {selectedNotif.type}
                    </span>
                  </div>
               </div>
               
               <div className={styles.messageBody}>
                 {selectedNotif.message.split("\n").map((line, i) => (
                   <p key={i}>{line}</p>
                 ))}
               </div>
               
               {selectedNotif.poll?.isPoll && (
                 <div className={styles.pollSection}>
                   <h4 className={styles.pollQuestion}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '1rem', color: '#3b3bff' }}><path d="M12 20v-6M9 20v-10M15 20v-2M18 20V4M6 20v-4"/></svg>
                     {selectedNotif.poll.pollQuestion}
                   </h4>
                   <p className={styles.pollHint}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                     Poll voting is currently optimized for the mobile application.
                   </p>
                 </div>
               )}
            </div>
          ) : (
            <div className={styles.noSelection}>
              <div style={{ background: '#f8fafc', padding: '3rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </div>
              <h3>Select an Announcement</h3>
              <p>Stay updated with the latest news, events, and official notices from your warden.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

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

  if (loading) return <Loading text="Fetching notifications..." />;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Notice Board</h1>
          <p className={styles.subtitle}>Updates and announcements from your hostel management.</p>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <aside className={styles.listCard}>
          <div className={styles.listHeader}>
             <span>Recent Messages</span>
             <span className={styles.count}>{notifications.length}</span>
          </div>
          <div className={styles.notifList}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications yet</div>
            ) : (
              notifications.map((notif) => (
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
                      {new Date(notif.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className={styles.itemTitle}>{notif.title}</h3>
                  <p className={styles.itemPreview}>{notif.message.substring(0, 50)}...</p>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className={styles.contentCard}>
          {selectedNotif ? (
            <div className={styles.notifDeatils}>
               <div className={styles.detailsHeader}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span className={`${styles.typeTag} ${styles[selectedNotif.type.toLowerCase()]}`}>
                      {selectedNotif.type}
                    </span>
                    <span className={styles.fullDate}>
                      {new Date(selectedNotif.sentAt).toLocaleString("en-GB", { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h2 className={styles.detailsTitle}>{selectedNotif.title}</h2>
               </div>
               <div className={styles.messageBody}>
                 {selectedNotif.message.split("\n").map((line, i) => (
                   <p key={i}>{line}</p>
                 ))}
               </div>
               
               {selectedNotif.poll?.isPoll && (
                 <div className={styles.pollSection}>
                   <h4 className={styles.pollQuestion}>{selectedNotif.poll.pollQuestion}</h4>
                   <p className={styles.pollHint}>Note: Poll responses are currently managed in the mobile app.</p>
                 </div>
               )}
            </div>
          ) : (
            <div className={styles.noSelection}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2, marginBottom: "1rem" }}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <h3>Select a message to read</h3>
              <p>Stay updated with the latest news from your warden.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

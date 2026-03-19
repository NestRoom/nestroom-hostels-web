"use client";

import styles from './sidebarFooter.module.css';

export default function SidebarFooter() {
  return (
    <div className={styles.footer}>
      {/* Profile Container */}
      <div className={styles.profileContainer}>
        
        {/* Avatar Image Component */}
        <div className={styles.avatar}>
           <img src="https://i.pravatar.cc/150?img=11" alt="Vikram Singh Avatar" />
        </div>

        {/* User Text Details */}
        <div className={styles.textContainer}>
          <span className={styles.userName}>Vikram Singh</span>
          <span className={styles.userRole}>Hostel Manager</span>
        </div>
      </div>
    </div>
  );
}

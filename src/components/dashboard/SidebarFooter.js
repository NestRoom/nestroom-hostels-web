"use client";

import { useAuth } from '@/context/AuthContext';
import { FiLogOut } from 'react-icons/fi';
import styles from './sidebarFooter.module.css';

export default function SidebarFooter() {
  const { logout } = useAuth(); // Destructuring Firebase logout from context

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

      {/* Logout Button */}
      <button className={styles.logoutBtn} onClick={logout}>
        <FiLogOut className={styles.logoutIcon} />
        <span>Log out</span>
      </button>
    </div>
  );
}

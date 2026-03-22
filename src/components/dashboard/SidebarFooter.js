"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { FiLogOut } from 'react-icons/fi';
import styles from './sidebarFooter.module.css';

export default function SidebarFooter() {
  const { logout } = useAuth(); // Destructuring Firebase logout from context

  return (
    <div className={styles.footer}>
      {/* Profile Container clickable link to Profile Page */}
      <Link href="/dashboard/profile" className={styles.profileLink}>
        <div className={styles.profileContainer}>
          
          {/* Avatar Image Component */}
          <div className={styles.avatar}>
             <Image src="https://i.pravatar.cc/150?img=11" alt="Vikram Singh Avatar" width={40} height={40} className={styles.image} />
          </div>

          {/* User Text Details */}
          <div className={styles.textContainer}>
            <span className={styles.userName}>Vikram Singh</span>
            <span className={styles.userRole}>Hostel Manager</span>
          </div>
        </div>
      </Link>

      {/* Logout Button */}
      <button className={styles.logoutBtn} onClick={logout}>
        <FiLogOut className={styles.logoutIcon} />
        <span>Log out</span>
      </button>
    </div>
  );
}

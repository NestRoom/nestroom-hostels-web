'use client';

import { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [userMetadata, setUserMetadata] = useState({
    fullName: 'Loading...',
    role: 'Hostel Owner',
    profilePhoto: 'https://i.pravatar.cc/150?img=11'
  });

  useEffect(() => {
    // Quick autonomous fetch for sidebar identity 
    const fetchIdentity = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5001/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const { data } = await res.json();
          setUserMetadata({
            fullName: data.user.fullName || 'Hostel Owner',
            role: data.user.userType === 'owner' ? 'Hostel Owner' : 'Hostel Manager',
            profilePhoto: data.user.profilePhoto || 'https://i.pravatar.cc/150?img=11'
          });
        }
      } catch (e) {
        console.error("Sidebar identity fetch failed", e);
      }
    };
    fetchIdentity();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Clear any other session tokens here
    
    router.replace('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>, path: '/dashboard' },
    { label: 'Rooms', icon: <path d="M2 4v16M22 4v16M2 8h20M2 12h20M2 16h20" />, path: '/rooms' },
    { label: 'Residents', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>, path: '/residents' },
    { label: 'Revenue', icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>, path: '/revenue' },
    { label: 'Attendance', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" /></>, path: '/attendance' },
    { label: 'Notification', icon: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>, path: '/notification' },
    { label: 'Food', icon: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>, path: '/food' },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.nest}>nest</span><span className={styles.room}>room</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/profile');
          return (
            <Link 
              key={item.label} 
              href={item.path} 
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottomSection}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <img src={userMetadata.profilePhoto} alt="Profile" />
          </div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{userMetadata.fullName}</p>
            <p className={styles.userRole}>{userMetadata.role}</p>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log out
        </button>
      </div>
    </div>
  );
}

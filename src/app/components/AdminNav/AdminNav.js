'use client';

import { useState, useEffect, useRef } from 'react';

// Module-level: survives React component remounts during client-side navigation.
// Stores the last capsule position so each new AdminNav instance starts there.
const _pos = { left: 0, width: 0, ready: false };
import styles from './AdminNav.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  TrendingUp, 
  CalendarCheck, 
  Bell, 
  Utensils, 
  AlertCircle,
  ChevronDown,
  LogOut,
  User
} from 'lucide-react';
import { secureFetch } from '../../utils/auth';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [userMetadata, setUserMetadata] = useState({
    fullName: 'Loading...',
    role: 'Hostel Owner',
    profilePhoto: 'https://ui-avatars.com/api/?name=Admin&background=E5E7EB&color=374151&size=150'
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // Initialise from the module-level cache so remounts start at the last position
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: _pos.left,
    width: _pos.width,
    opacity: _pos.ready ? 1 : 0, // invisible on very first load only
  });
  const navRefs = useRef({});

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { label: 'Rooms', icon: <Home size={18} />, path: '/rooms' },
    { label: 'Residents', icon: <Users size={18} />, path: '/residents' },
    { label: 'Revenue', icon: <TrendingUp size={18} />, path: '/revenue' },
    { label: 'Attendance', icon: <CalendarCheck size={18} />, path: '/attendance' },
    { label: 'Food', icon: <Utensils size={18} />, path: '/food' },
    { label: 'Complaints', icon: <AlertCircle size={18} />, path: '/complaints' },
    { label: 'Notification', icon: <Bell size={18} />, path: '/notification' },
  ];

  useEffect(() => {
    const fetchIdentity = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
        const res = await secureFetch('/v1/auth/me');
        if (res.ok) {
          const { data } = await res.json();
          setUserMetadata({
            fullName: data.user.fullName || 'Hostel Owner',
            role: data.user.userType === 'owner' ? 'Hostel Owner' : 'Hostel Manager',
            profilePhoto: data.user.profilePhoto || 'https://ui-avatars.com/api/?name=Admin&background=E5E7EB&color=374151&size=150'
          });
        }
      } catch (e) {
        console.error("AdminNav identity fetch failed", e);
      }
    };
    fetchIdentity();
  }, []);

  useEffect(() => {
    const updateIndicator = () => {
      const activeItem = navItems.find(
        item => pathname === item.path
      );
      if (activeItem && navRefs.current[activeItem.label]) {
        const el = navRefs.current[activeItem.label];
        _pos.left = el.offsetLeft;
        _pos.width = el.offsetWidth;
        _pos.ready = true;
        setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    const timeoutId = setTimeout(updateIndicator, 100);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  return (
    <nav className={styles.adminNav}>
      {/* Logo */}
      <div className={styles.logoSection} onClick={() => router.push('/dashboard')}>
        <div className={styles.logoText}>
          <span className={styles.nest}>nest</span>
          <span className={styles.room}>room</span>
        </div>
      </div>

      {/* Mobile Page Selector Dropdown */}
      <div className={styles.mobilePageSelector}>
        <select 
          className={styles.pageDropdown}
          value={pathname}
          onChange={(e) => router.push(e.target.value)}
        >
          {navItems.map(item => (
            <option key={item.path} value={item.path}>
              {item.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className={styles.dropdownIcon} />
      </div>

      {/* Center Navigation (Desktop/Tablet) */}
      <div className={styles.navContainer}>
        {/* Sliding capsule indicator */}
        <div
          className={styles.indicator}
          style={{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
          }}
        />

        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.label}
              href={item.path}
              ref={el => navRefs.current[item.label] = el}
              className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
            >
              {item.icon}
              <span className={styles.itemLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right Side */}
      <div className={styles.rightSection}>

        <div className={styles.profileSection} onClick={() => setShowProfileMenu(!showProfileMenu)}>
          <div className={styles.avatar}>
            <img src={userMetadata.profilePhoto} alt="Profile" />
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.userName}>{userMetadata.fullName.split(' ')[0]}</span>
            <span className={styles.userRole}>{userMetadata.role}</span>
          </div>
          <ChevronDown size={14} className={styles.chevron} />

          {showProfileMenu && (
            <div className={styles.profileDropdown}>
              <div 
                className={styles.dropdownItem} 
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push('/profile');
                }}
              >
                <User size={18} />
                <span>Profile</span>
              </div>
              <div className={styles.dropdownDivider} />
              <div 
                className={`${styles.dropdownItem} ${styles.logout}`} 
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

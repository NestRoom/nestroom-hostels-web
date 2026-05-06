'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './ResidentNav.module.css';
import { 
  LayoutDashboard, 
  User, 
  CreditCard, 
  MessageSquare, 
  Bell, 
  Utensils, 
  ShieldCheck,
  ChevronDown,
  LogOut,
  CalendarDays
} from 'lucide-react';
import { secureFetch, clearTokens } from '../../utils/auth';

const _pos = { left: 0, width: 0, ready: false };

export default function ResidentNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [resident, setResident] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: _pos.left,
    width: _pos.width,
    opacity: _pos.ready ? 1 : 0,
  });
  const navRefs = useRef({});

  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/student/dashboard' },
    { label: 'Payments', icon: <CreditCard size={18} />, path: '/student/payments' },
    { label: 'Food', icon: <Utensils size={18} />, path: '/student/food' },
    { label: 'Complaints', icon: <MessageSquare size={18} />, path: '/student/complaints' },
    { label: 'Notices', icon: <Bell size={18} />, path: '/student/notifications' },
    { label: 'Attendance', icon: <CalendarDays size={18} />, path: '/student/attendance' },
  ];

  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const [profileRes, notifRes] = await Promise.all([
          secureFetch("/v1/residents/profile"),
          secureFetch("/v1/residents/notifications")
        ]);

        const profileData = await profileRes.json();
        if (profileData.success) {
          setResident(profileData.data.resident);
        }

        const notifData = await notifRes.json();
        if (notifData.success) {
          const unread = notifData.data.notifications.filter(n => !n.isRead).length; 
          setUnreadCount(unread);
        }
      } catch (e) {
        console.error("ResidentNav identity fetch failed", e);
      }
    };
    fetchIdentity();
  }, [pathname]);

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
  }, [pathname]);

  const handleLogout = () => {
    clearTokens();
    router.replace('/login');
  };

  return (
    <nav className={styles.residentNav}>
      {/* Logo */}
      <div className={styles.logoSection} onClick={() => router.push('/student/dashboard')}>
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
              {item.label === "Notices" && unreadCount > 0 && (
                <div className={styles.badge} style={{ top: '8px', right: '4px', width: '6px', height: '6px' }} />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right Side */}
      <div className={styles.rightSection}>

        <div className={styles.profileSection} onClick={() => setShowProfileMenu(!showProfileMenu)}>
          <div className={styles.avatar}>
            {resident?.kyc?.profilePhoto ? (
              <img src={resident.kyc.profilePhoto} alt="Profile" />
            ) : (
              <div className={styles.avatarPlaceholder}>{resident?.fullName?.[0] || 'R'}</div>
            )}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.userName}>{resident?.fullName?.split(' ')[0] || 'Resident'}</span>
            <span className={styles.userRole}>{resident?.residentId || 'Student'}</span>
          </div>
          <ChevronDown size={14} className={styles.chevron} />

          {showProfileMenu && (
            <div className={styles.profileDropdown}>
              <div 
                className={styles.dropdownItem} 
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push('/student/profile');
                }}
              >
                <User size={18} />
                <span>My Profile</span>
              </div>
              <div 
                className={styles.dropdownItem} 
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push('/student/dashboard');
                }}
              >
                <LayoutDashboard size={18} />
                <span>Overview</span>
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

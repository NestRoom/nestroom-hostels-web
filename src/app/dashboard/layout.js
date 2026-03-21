"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import ThemeToggle from '@/components/ThemeToggle';
import styles from './layout.module.css';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    isAtTop: true,
    isAtBottom: false,
    showGradients: false
  });

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtTop = el.scrollTop === 0;
    // Using roughly a 1px threshold for fractional browser rendering variances
    const isAtBottom = el.scrollHeight - Math.ceil(el.scrollTop) <= el.clientHeight + 1;
    const showGradients = el.scrollHeight > el.clientHeight;
    
    setScrollState({ isAtTop, isAtBottom, showGradients });
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className={styles.loadingContainer}>Loading dashboard...</div>;
  }

  if (!user) {
    return null; // Don't render layout until authenticated or redirecting
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
      
      <Sidebar isOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={styles.mainContent}>
        <Topbar setSidebarOpen={setSidebarOpen} />
        
        <div className={styles.scrollContainer}>
          {/* Top Gradient */}
          <div 
            className={`${styles.topGradient} ${
              scrollState.showGradients && !scrollState.isAtTop ? styles.showGradient : ''
            }`} 
          />
          
          <main 
            className={styles.mainArea} 
            ref={scrollRef} 
            onScroll={checkScroll}
          >
            {children}
          </main>

          {/* Bottom Gradient */}
          <div 
            className={`${styles.bottomGradient} ${
              scrollState.showGradients && !scrollState.isAtBottom ? styles.showGradient : ''
            }`} 
          />
        </div>
      </div>
      
      {/* Floating UI Elements */}
      <ThemeToggle />
    </div>
  );
}

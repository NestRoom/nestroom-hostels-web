"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import ThemeToggle from '@/components/ThemeToggle';
import styles from './layout.module.css';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

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
      <Sidebar />
      
      <div className={styles.mainContent}>
        <Topbar />
        
        <main className={styles.mainArea}>
          {children}
        </main>
      </div>
      
      {/* Floating UI Elements */}
      <ThemeToggle />
    </div>
  );
}

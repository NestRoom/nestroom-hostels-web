"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './dashboard.module.css';
import StatCard from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ActiveComplaints from '@/components/dashboard/ActiveComplaints';
import RecentPayments from '@/components/dashboard/RecentPayments';
import { FiUser, FiBriefcase, FiAlertTriangle } from 'react-icons/fi';
import { MdOutlineDoorFront, MdLocationCity, MdOutlineSingleBed, MdCurrencyRupee } from 'react-icons/md';
import apiClient from '@/lib/apiClient';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiClient.get('/dashboard/stats');
        setStats(data.stats);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div className={styles.loading}>Loading Stats...</div>;

  return (
    <div className={styles.dashboardPage}>
      {/* Top Row: Quick Stats */}
      <div className={styles.statsRow}>
        
        {/* Card 1: Total Rooms */}
        <StatCard 
          title="Total Rooms" 
          value={stats?.rooms?.total || "0"} 
          icon={MdOutlineDoorFront} 
          iconBgColor="var(--icon-bg-blue)" 
          iconColor="var(--primary)"
          watermarkIcon={MdLocationCity}
        >
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: stats?.rooms?.total ? `${(stats.rooms.occupied / stats.rooms.total) * 100}%` : '0%' }}
              ></div>
            </div>
            <span className={styles.progressText}>Occupancy: {stats?.rooms?.occupied || 0} / {stats?.rooms?.total || 0}</span>
          </div>
        </StatCard>

        {/* Card 2: Active Residents */}
        <StatCard 
          title="Active Residents" 
          value={stats?.residents?.active || "0"} 
          icon={FiUser} 
          iconBgColor="var(--icon-bg-purple)" 
          iconColor="var(--icon-purple)" 
          watermarkIcon={MdOutlineSingleBed}
        >
          <div className={styles.avatarGroup}>
            {[12, 32, 53].map(id => (
              <div key={id} className={styles.overlapAvatarWrapper}>
                <Image 
                  src={`https://i.pravatar.cc/150?img=${id}`} 
                  alt="Resident Profile" 
                  width={32} 
                  height={32} 
                  className={styles.overlapAvatar} 
                />
              </div>
            ))}
            <div className={styles.moreAvatarBadge}>+{stats?.residents?.total || 0}</div>
          </div>
        </StatCard>

        {/* Card 3: Pending Payments */}
        <StatCard 
          title="Pending Dues" 
          value={`₹${stats?.payments?.pendingDues?.toLocaleString() || "0"}`} 
          icon={FiBriefcase} 
          iconBgColor="var(--icon-bg-orange)" 
          iconColor="var(--icon-orange)" 
          watermarkIcon={MdCurrencyRupee}
        >
          <div className={styles.alertText}>
            <FiAlertTriangle />
            <span>{stats?.payments?.overdueCount || 0} Overdue Bills</span>
          </div>
        </StatCard>

      </div>

      {/* Middle Row: Revenue Chart */}
      <div className={styles.chartRow}>
        <RevenueChart />
      </div>

      {/* Bottom Row: Management Overview */}
      <div className={styles.managementSection}>
        <h2 className={styles.sectionTitle}>Management Overview</h2>
        <div className={styles.managementRow}>
          <ActiveComplaints />
          <RecentPayments />
        </div>
      </div>
    </div>
  );
}

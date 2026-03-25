"use client";
import { usePayments } from '@/context/PaymentsContext';
import styles from './SummarySection.module.css';
import SummaryCard from './SummaryCard';
import { MdOutlineAccountBalanceWallet, MdOutlineEvent, MdOutlineAssignmentLate } from 'react-icons/md';

export default function SummarySection() {
  const { stats, loading } = usePayments();

  if (loading || !stats) return <div className={styles.loading}>Loading Stats...</div>;

  return (
    <div className={styles.summaryGrid}>
      <SummaryCard 
        title="Total Collected" 
        amount={`₹${stats.totalCollected.toLocaleString()}`} 
        icon={MdOutlineAccountBalanceWallet} 
        trend="Updated live" 
        isPositive={true} 
        styleType="greenBg"
      />
      
      <SummaryCard 
        title="Outstanding Dues" 
        amount={`₹${stats.totalDues.toLocaleString()}`} 
        icon={MdOutlineAssignmentLate} 
        trend={
          <>
            <span className={styles.alertIcon}>!</span> {stats.overdueResidents} Overdue
          </>
        } 
        isPositive={false} 
        styleType="redBg"
      />

      <SummaryCard 
        title="Upcoming Renewals" 
        amount={stats.upcomingRenewals.toString()} 
        icon={MdOutlineEvent} 
        trend="Next 7 days" 
        isPositive={null} 
        styleType="grayBg"
      />
    </div>
  );
}

"use client";
import { useResidents } from '@/context/ResidentsContext';
import SummaryCard from './SummaryCard';
import styles from './summarySection.module.css';
import { FiUsers, FiClock, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { MdLogout } from 'react-icons/md';

export default function SummarySection() {
  const { residents } = useResidents();
  
  const activeCount = residents.filter(r => r.status === 'Active').length;
  const newCount = residents.filter(r => r.status === 'New').length;
  const noticeCount = residents.filter(r => r.status === 'Notice').length;

  return (
    <div className={styles.grid}>
      <SummaryCard 
        title="Active Residents"
        value={activeCount.toString().padStart(2, '0')}
        subtitleText={`${activeCount > 0 ? 'Updating live' : 'No active residents'}`}
        subtitleIcon={FiTrendingUp}
        subtitleColorClass="successText"
        watermarkIcon={FiUsers}
      />
      
      <SummaryCard 
        title="New Joinees (Total)"
        value={newCount.toString().padStart(2, '0')}
        subtitleText="Awaiting verification"
        subtitleIcon={FiClock}
        subtitleColorClass="primaryText"
        badge="NEW"
      />
      
      <SummaryCard 
        title="In Notice Period"
        value={noticeCount.toString().padStart(2, '0')}
        subtitleText="Awaiting checkout"
        subtitleIcon={FiCalendar}
        subtitleColorClass="warningText"
        watermarkIcon={MdLogout}
      />
    </div>
  );
}

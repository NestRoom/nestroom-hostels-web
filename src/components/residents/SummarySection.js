import SummaryCard from './SummaryCard';
import styles from './summarySection.module.css';
import { FiUsers, FiClock, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { MdLogout } from 'react-icons/md';

export default function SummarySection() {
  return (
    <div className={styles.grid}>
      <SummaryCard 
        title="Active Residents"
        value="124"
        subtitleText="92% Occupancy"
        subtitleIcon={FiTrendingUp}
        subtitleColorClass="successText"
        watermarkIcon={FiUsers}
      />
      
      <SummaryCard 
        title="New Joinees (This Month)"
        value="12"
        subtitleText="Next joining tomorrow"
        subtitleIcon={FiClock}
        subtitleColorClass="primaryText"
        badge="NEW"
      />
      
      <SummaryCard 
        title="Notice Period"
        value="05"
        subtitleText="Leaves by Month End"
        subtitleIcon={FiCalendar}
        subtitleColorClass="warningText"
        watermarkIcon={MdLogout}
      />
    </div>
  );
}

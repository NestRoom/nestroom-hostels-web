import styles from './dashboard.module.css';
import Card from '@/components/dashboard/Card';
import StatCard from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ActiveComplaints from '@/components/dashboard/ActiveComplaints';
import { FiUser, FiBriefcase, FiAlertTriangle } from 'react-icons/fi';
import { MdOutlineDoorFront, MdLocationCity, MdOutlineSingleBed, MdCurrencyRupee } from 'react-icons/md';

export default function DashboardPage() {
  return (
    <div className={styles.dashboardPage}>
      {/* Top Row: Quick Stats */}
      <div className={styles.statsRow}>
        
        {/* Card 1: Total Rooms */}
        <StatCard 
          title="Total Rooms" 
          value="45" 
          icon={MdOutlineDoorFront} 
          iconBgColor="var(--icon-bg-blue)" 
          iconColor="var(--primary)"
          watermarkIcon={MdLocationCity}
        >
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '45%' }}></div>
            </div>
            <span className={styles.progressText}>Capacity: 135 Beds</span>
          </div>
        </StatCard>

        {/* Card 2: Occupied Rooms */}
        <StatCard 
          title="Occupied Rooms" 
          value="38 / 45" 
          icon={FiUser} 
          iconBgColor="#F3E8FF" /* Light specific purple */
          iconColor="#9333EA" /* Deep purple */
          watermarkIcon={MdOutlineSingleBed}
        >
          <div className={styles.avatarGroup}>
            <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className={styles.overlapAvatar} />
            <img src="https://i.pravatar.cc/150?img=32" alt="Avatar" className={styles.overlapAvatar} />
            <img src="https://i.pravatar.cc/150?img=53" alt="Avatar" className={styles.overlapAvatar} />
            <div className={styles.moreAvatarBadge}>+84</div>
          </div>
        </StatCard>

        {/* Card 3: Pending Payments */}
        <StatCard 
          title="Pending Payments" 
          value="₹2,45,000" 
          icon={FiBriefcase} 
          iconBgColor="#FFF7ED" /* Light specific orange */
          iconColor="#EA580C" /* Deep orange */
          watermarkIcon={MdCurrencyRupee}
        >
          <div className={styles.alertText}>
            <FiAlertTriangle />
            <span>12 Residents Overdue</span>
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
          <Card className={styles.placeholderBox}>Recent Payments Placeholder</Card>
        </div>
      </div>
    </div>
  );
}

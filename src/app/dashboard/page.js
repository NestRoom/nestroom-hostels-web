import styles from './dashboard.module.css';
import Card from '@/components/dashboard/Card';

export default function DashboardPage() {
  return (
    <div className={styles.dashboardPage}>
      {/* Top Row: Quick Stats */}
      <div className={styles.statsRow}>
        <Card className={styles.placeholderBox}>Stats Card 1</Card>
        <Card className={styles.placeholderBox}>Stats Card 2</Card>
        <Card className={styles.placeholderBox}>Stats Card 3</Card>
      </div>

      {/* Middle Row: Revenue Chart */}
      <div className={styles.chartRow}>
        <Card className={styles.placeholderBox}>Revenue Chart Placeholder</Card>
      </div>

      {/* Bottom Row: Management Overview */}
      <div className={styles.managementSection}>
        <h2 className={styles.sectionTitle}>Management Overview</h2>
        <div className={styles.managementRow}>
          <Card className={styles.placeholderBox}>Active Complaints Placeholder</Card>
          <Card className={styles.placeholderBox}>Recent Payments Placeholder</Card>
        </div>
      </div>
    </div>
  );
}

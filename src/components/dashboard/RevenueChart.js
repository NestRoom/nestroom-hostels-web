"use client";

import Card from './Card';
import { FiTrendingUp } from 'react-icons/fi';
import styles from './revenueChart.module.css';

export default function RevenueChart() {
  return (
    <Card className={styles.chartCard}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Revenue Overview</h2>
          <span className={styles.subtitle}>Earnings growth for the past 6 months</span>
        </div>
        <div className={styles.badge}>
          <FiTrendingUp className={styles.badgeIcon} />
          <span>+12.5% vs last year</span>
        </div>
      </div>
      
      <div className={styles.chartPlaceholder}>
        {/* The actual graphing visualization will be injected here during Steps 66+ */}
        [Chart Initialization Placeholder]
      </div>
    </Card>
  );
}

"use client";
import { FiInbox, FiClock, FiTrendingUp } from 'react-icons/fi';
import { useServices } from '@/context/ServicesContext';
import Card from '../ui/Card';
import styles from './ServicesSummaryCards.module.css';

export default function ServicesSummaryCards() {
  const { stats, loading } = useServices();

  if (loading || !stats) return <div className={styles.loading}>Loading Stats...</div>;

  const summaryItems = [
    {
      id: 'requests',
      title: 'Open Tickets',
      value: stats.openTickets,
      icon: FiInbox,
      trend: 'Awaiting resolution',
      trendType: 'neutral'
    },
    {
      id: 'resolution',
      title: 'Avg. Resolution',
      value: stats.averageResolutionTimeHours,
      unit: 'hrs',
      icon: FiClock,
      trend: 'Efficiency metric',
      trendType: 'increase'
    }
  ];

  return (
    <div className={styles.cardsContainer}>
      {summaryItems.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card key={stat.id} className={styles.card}>
            <div className={styles.watermarkContainer}>
              <Icon className={styles.watermarkIcon} />
            </div>
            
            <div className={styles.iconWrapper} data-type={stat.id}>
              <Icon className={styles.cardIcon} />
            </div>
            
            <div className={styles.content}>
              <h3 className={styles.title}>{stat.title}</h3>
              <div className={styles.valueContainer}>
                <span className={styles.value}>{stat.value}</span>
                {stat.unit && <span className={styles.unit}>{stat.unit}</span>}
              </div>
              
              <div className={`${styles.trend} ${styles[stat.trendType]}`}>
                <FiTrendingUp className={styles.trendIcon} />
                <span className={styles.trendText}>{stat.trend}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

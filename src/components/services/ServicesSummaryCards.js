import { FiInbox, FiClock, FiMonitor, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import Card from '../ui/Card';
import { SUMMARY_STATS } from '../../app/dashboard/services/constants';
import styles from './ServicesSummaryCards.module.css';

const iconMap = {
  requests: FiInbox,
  resolution: FiClock,
  subscriptions: FiMonitor
};

export default function ServicesSummaryCards() {
  return (
    <div className={styles.cardsContainer}>
      {SUMMARY_STATS.map((stat) => {
        const Icon = iconMap[stat.id];
        
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
                {stat.trendType === 'increase' && <FiTrendingUp className={styles.trendIcon} />}
                {stat.trendType === 'decrease' && <FiTrendingDown className={styles.trendIcon} />}
                {stat.trendType === 'neutral' && <FiMinus className={styles.trendIcon} />}
                <span className={styles.trendText}>{stat.trend}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

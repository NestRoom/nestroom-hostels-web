import styles from './SummaryCard.module.css';

export default function SummaryCard({ title, amount, icon: Icon, trend, isPositive, styleType }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.amount}>{amount}</span>
        </div>
        <div className={`${styles.iconContainer} ${styles[styleType]}`}>
          <Icon size={24} className={styles.icon} />
        </div>
      </div>
      
      <div className={styles.trendContainer}>
        <span className={`${styles.trendText} ${isPositive === true ? styles.positive : isPositive === false ? styles.negative : styles.neutral}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

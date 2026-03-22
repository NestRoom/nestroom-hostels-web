import styles from './ManagementOverview.module.css';
import { managementOverviewData } from '../../lib/mockData/payments';
import Button from '../ui/Button';
import { MdOutlineWarningAmber, MdOutlineInsertChartOutlined } from 'react-icons/md';

export default function ManagementOverview() {
  const { disputes, forecast } = managementOverviewData;

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Management Overview</h3>
      
      <div className={styles.cardsGrid}>
        {/* Disputes Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.titleWrapper}>
              <div className={`${styles.iconContainer} ${styles.redIcon}`}>
                <MdOutlineWarningAmber size={20} />
              </div>
              <h4 className={styles.cardTitle}>Payment Disputes</h4>
            </div>
            <span className={styles.disputeCount}>{disputes.count}</span>
          </div>

          <div className={styles.disputeList}>
            <div className={styles.disputeItem}>
              <div className={styles.disputeLabel}>
                <span className={`${styles.dot} ${styles.redDot}`} />
                Failed UPI Transactions
              </div>
              <span className={styles.disputeItemCount}>{disputes.failedUpi}</span>
            </div>
            <div className={styles.disputeItem}>
              <div className={styles.disputeLabel}>
                <span className={`${styles.dot} ${styles.orangeDot}`} />
                Amount Mismatch
              </div>
              <span className={styles.disputeItemCount}>{disputes.amountMismatch}</span>
            </div>
          </div>

          <Button variant="outline" className={styles.reviewBtn}>Review Disputes</Button>
        </div>

        {/* Forecast Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.titleWrapper}>
              <div className={`${styles.iconContainer} ${styles.blueIcon}`}>
                <MdOutlineInsertChartOutlined size={20} />
              </div>
              <h4 className={styles.cardTitle}>Collection Forecast</h4>
            </div>
            <span className={styles.forecastAmount}>{forecast.amount}</span>
          </div>

          <p className={styles.forecastDesc}>
            Estimated collection for next 15 days based on {forecast.pendingBills} pending bills and renewals.
          </p>

          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${forecast.progress}%` }} />
            </div>
          </div>

          <Button variant="primary" className={styles.detailBtn}>View Forecast Detail</Button>
        </div>
      </div>
    </div>
  );
}

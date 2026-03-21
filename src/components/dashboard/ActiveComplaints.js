import Card from './Card';
import styles from './activeComplaints.module.css';

// Step 77: Sub-component for individual complaint categories
const ComplaintCategory = ({ label, count, color, percentage }) => (
  <div className={styles.categoryItem}>
    <div className={styles.categoryHeader}>
      <span className={styles.categoryLabel}>{label}</span>
      <span className={styles.categoryCount}>{count.toString().padStart(2, '0')}</span>
    </div>
    <div className={styles.progressBar}>
      <div 
        className={styles.progressFill} 
        style={{ width: `${percentage}%`, backgroundColor: color }}
      ></div>
    </div>
  </div>
);

export default function ActiveComplaints() {
  return (
    <Card className={styles.complaintsCard}>
      {/* Step 76: Header with Total Count */}
      <div className={styles.header}>
        <h3 className={styles.title}>Active Complaints</h3>
        <span className={styles.countBadge}>08</span>
      </div>

      <div className={styles.categories}>
        {/* Step 78: High Priority Issues */}
        <ComplaintCategory 
          label="High Priority Issues" 
          count={5} 
          percentage={62} 
          color="var(--status-danger)" 
        />
        {/* Step 79: Medium Priority Issues */}
        <ComplaintCategory 
          label="Medium Priority Issues" 
          count={3} 
          percentage={38} 
          color="#EA580C" /* Orange warning generic color */
        />
      </div>

      {/* Step 80: Latest incident string */}
      <div className={styles.incidentNote}>
        <i>Latest incident: Air Conditioning leaking in Room 302...</i>
      </div>

      {/* Step 81 & 82: Resolve Issues Full Width Button */}
      <button className={styles.actionButton}>
        Resolve Issues
      </button>
    </Card>
  );
}

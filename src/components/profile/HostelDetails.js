import { FiHome } from 'react-icons/fi';
import Card from '../ui/Card';
import { HOSTEL_DETAILS } from '../../app/dashboard/profile/constants';
import styles from './HostelDetails.module.css';

export default function HostelDetails() {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <FiHome className={styles.headerIcon} />
        <h3 className={styles.title}>Hostel Details</h3>
      </div>
      
      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label className={styles.label}>HOSTEL NAME</label>
          <input 
            type="text" 
            className={styles.input} 
            value={HOSTEL_DETAILS.name} 
            readOnly 
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>HOSTEL ID</label>
          <input 
            type="text" 
            className={styles.input} 
            value={HOSTEL_DETAILS.id} 
            readOnly 
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>ADDRESS</label>
          <textarea 
            className={`${styles.input} ${styles.textarea}`} 
            value={HOSTEL_DETAILS.address} 
            readOnly 
            rows="3"
          />
        </div>
      </div>
    </Card>
  );
}

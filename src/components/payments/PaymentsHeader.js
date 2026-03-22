import styles from './PaymentsHeader.module.css';
import Button from '../ui/Button';
import { MdAdd } from 'react-icons/md';

export default function PaymentsHeader() {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Payments Tracking</h1>
        <p className={styles.subtitle}>Manage collections, dues, and transaction history.</p>
      </div>
      
      <div className={styles.actionSection}>
        <Button variant="primary" className={styles.recordButton}>
          <MdAdd size={20} />
          Record Payment
        </Button>
      </div>
    </div>
  );
}

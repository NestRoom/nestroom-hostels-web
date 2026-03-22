import { FiEdit2 } from 'react-icons/fi';
import Button from '../ui/Button';
import styles from './ProfileHeader.module.css';

export default function ProfileHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Admin Profile</h1>
        <p className={styles.subtitle}>Manage your account settings and hostel preferences.</p>
      </div>
      
      <div className={styles.actions}>
        <Button variant="primary" className={styles.editBtn}>
          <FiEdit2 className={styles.editIcon} /> Edit Profile
        </Button>
      </div>
    </div>
  );
}

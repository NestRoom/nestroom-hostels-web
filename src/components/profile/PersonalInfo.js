import { FiUser } from 'react-icons/fi';
import Card from '../ui/Card';
import { PERSONAL_INFO } from '../../app/dashboard/profile/constants';
import styles from './PersonalInfo.module.css';

export default function PersonalInfo() {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <FiUser className={styles.headerIcon} />
        <h3 className={styles.title}>Personal Information</h3>
      </div>
      
      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label className={styles.label}>FULL NAME</label>
          <input 
            type="text" 
            className={styles.input} 
            value={PERSONAL_INFO.fullName} 
            readOnly 
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>EMAIL ADDRESS</label>
          <input 
            type="email" 
            className={styles.input} 
            value={PERSONAL_INFO.email} 
            readOnly 
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>MOBILE NUMBER</label>
          <div className={styles.phoneInputGroup}>
            <span className={styles.phonePrefix}>{PERSONAL_INFO.mobilePrefix}</span>
            <input 
              type="text" 
              className={`${styles.input} ${styles.phoneInput}`} 
              value={PERSONAL_INFO.mobileNumber} 
              readOnly 
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

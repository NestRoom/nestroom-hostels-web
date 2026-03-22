import { FiShield, FiLock, FiSmartphone } from 'react-icons/fi';
import Card from '../ui/Card';
import { SECURITY_INFO } from '../../app/dashboard/profile/constants';
import styles from './AccountSecurity.module.css';

export default function AccountSecurity() {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <FiShield className={styles.headerIcon} />
        <h3 className={styles.title}>Account Security</h3>
      </div>
      
      <div className={styles.list}>
        <div className={styles.securityRow}>
          <div className={styles.rowLeft}>
            <div className={styles.iconWrapper}>
              <FiLock className={styles.rowIcon} />
            </div>
            <div className={styles.rowInfo}>
              <h4 className={styles.rowTitle}>Change Password</h4>
              <p className={styles.rowSubtitle}>{SECURITY_INFO.passwordUpdatedText}</p>
            </div>
          </div>
          <button className={styles.updateBtn}>Update</button>
        </div>
        
        <div className={styles.securityRow}>
          <div className={styles.rowLeft}>
            <div className={styles.iconWrapper}>
              <FiSmartphone className={styles.rowIcon} />
            </div>
            <div className={styles.rowInfo}>
              <h4 className={styles.rowTitle}>Two-Factor Auth</h4>
              <p className={`${styles.rowSubtitle} ${styles.successText}`}>{SECURITY_INFO.twoFactorStatusText}</p>
            </div>
          </div>
          <button className={styles.disableBtn}>Disable</button>
        </div>
      </div>
    </Card>
  );
}

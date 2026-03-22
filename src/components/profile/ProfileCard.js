import { FiCamera, FiBriefcase, FiMapPin } from 'react-icons/fi';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { ADMIN_INFO } from '../../app/dashboard/profile/constants';
import styles from './ProfileCard.module.css';

export default function ProfileCard() {
  return (
    <Card className={styles.card}>
      <div className={styles.coverPhoto}></div>
      <div className={styles.profileContent}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarInner}>
              <Avatar name={ADMIN_INFO.name} size="lg" />
            </div>
            <button className={styles.cameraBtn}>
              <FiCamera className={styles.cameraIcon} />
            </button>
          </div>
        </div>
        
        <div className={styles.infoSection}>
          <div className={styles.mainInfo}>
            <h2 className={styles.name}>{ADMIN_INFO.name}</h2>
            <div className={styles.metaData}>
              <span className={styles.metaItem}>
                <FiBriefcase className={styles.metaIcon} />
                {ADMIN_INFO.role}
              </span>
              <span className={styles.metaItem}>
                <FiMapPin className={styles.metaIcon} />
                {ADMIN_INFO.location}
              </span>
            </div>
          </div>
          <div className={styles.statusBadge}>
            <Badge type="success" text={ADMIN_INFO.status} />
          </div>
        </div>
      </div>
    </Card>
  );
}

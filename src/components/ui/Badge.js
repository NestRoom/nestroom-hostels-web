import styles from './badge.module.css';
import { ROOM_STATUS } from '@/lib/constants/rooms';

export default function Badge({ type, text, className = '' }) {
  const getVariantClass = () => {
    switch(type) {
      case ROOM_STATUS.OCCUPIED: return styles.occupied;
      case ROOM_STATUS.VACANT: return styles.vacant;
      case ROOM_STATUS.MAINTENANCE: return styles.maintenance;
      case ROOM_STATUS.PARTIALLY_VACANT: return styles.partiallyVacant;
      case 'type': return styles.roomType;
      default: return styles.default;
    }
  };

  return (
    <div className={`${styles.badge} ${getVariantClass()} ${className}`}>
      {text}
    </div>
  );
}

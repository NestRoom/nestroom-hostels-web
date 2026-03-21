import { FiMoreHorizontal, FiPlus } from 'react-icons/fi';
import { MdHotel, MdBuild } from 'react-icons/md';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import styles from './roomCard.module.css';
import { ROOM_STATUS } from '@/lib/constants/rooms';

export default function RoomCard({ room }) {
  const { number, status, sharing, residents, capacity, maintenanceInfo } = room;

  // Determine empty beds for partially vacant
  const emptyBedsCount = capacity - (residents?.length || 0);

  // Render varying footer link based on status
  const renderActionLink = () => {
    switch (status) {
      case ROOM_STATUS.OCCUPIED:
        return <button className={styles.actionLink}>View Details</button>;
      case ROOM_STATUS.PARTIALLY_VACANT:
        return <button className={styles.actionLink}>Assign Resident</button>;
      case ROOM_STATUS.VACANT:
        return <button className={styles.actionLink}>Book Now</button>;
      case ROOM_STATUS.MAINTENANCE:
        return <button className={`${styles.actionLink} ${styles.actionOrange}`}>Mark as Ready</button>;
      default:
        return null;
    }
  };

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Room {number}</h3>
          <Badge type="type" text={sharing} />
        </div>
        <Badge type={status} text={status} />
      </header>

      <div className={styles.body}>
        {status === ROOM_STATUS.VACANT ? (
           <div className={styles.vacantState}>
             <div className={styles.largeIconHolder}><MdHotel className={styles.fadedIcon}/></div>
             <p className={styles.vacantText}>Ready for new residents</p>
           </div>
        ) : status === ROOM_STATUS.MAINTENANCE ? (
           <div className={styles.maintenanceState}>
             <div className={styles.largeIconHolder}><MdBuild className={styles.fadedIconOrange}/></div>
             <p className={styles.maintenanceText}>{maintenanceInfo || 'Maintenance in progress'}</p>
           </div>
        ) : (
          <>
            {/* Occupied Rows */}
            {residents?.map((res, idx) => (
              <div key={res.id} className={styles.residentRow}>
                <Avatar name={res.name} size="md" />
                <div className={styles.residentInfo}>
                  <span className={styles.name}>{res.name}</span>
                  <span className={styles.details}>
                    {res.bed} <span className={styles.dot}>•</span> <span className={res.feeStatus === 'Overdue' ? styles.overdue : ''}>{res.feeStatus}</span>
                  </span>
                </div>
              </div>
            ))}
            
            {/* Partially Vacant Row */}
            {status === ROOM_STATUS.PARTIALLY_VACANT && emptyBedsCount > 0 && (
              <div className={styles.emptyRow}>
                <div className={styles.emptyAvatarHolder}>
                  <FiPlus className={styles.plusIcon} />
                </div>
                <span className={styles.emptyText}>{emptyBedsCount} {emptyBedsCount > 1 ? 'Beds' : 'Bed'} Available</span>
              </div>
            )}
          </>
        )}
      </div>

      <footer className={styles.footer}>
        {renderActionLink()}
        <button className={styles.menuBtn}>
          <FiMoreHorizontal />
        </button>
      </footer>
    </article>
  );
}

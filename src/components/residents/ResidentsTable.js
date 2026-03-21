import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { FiMoreHorizontal } from 'react-icons/fi';
import styles from './residentsTable.module.css';

const getStatusVariant = (status) => {
  switch(status) {
    case 'Active': return 'success';
    case 'Notice': return 'warning';
    case 'New': return 'info';
    default: return 'default';
  }
};

const getPaymentVariant = (payment) => {
  switch(payment) {
    case 'Paid': return 'blue_light';
    case 'Overdue': return 'danger';
    case 'Partial': return 'warning';
    default: return 'default';
  }
};

function ResidentTableRow({ resident }) {
  return (
    <tr>
      <td className={styles.residentCell}>
        <div className={styles.avatarSpacing}>
          <Avatar name={resident.name} imageUrl={resident.avatarUrl} size="md" />
        </div>
        <div className={styles.residentInfo}>
          <span className={styles.residentName}>{resident.name}</span>
          <span className={styles.residentPhone}>{resident.phone}</span>
        </div>
      </td>
      <td className={styles.roomCell}>{resident.roomNo}</td>
      <td className={styles.dateCell}>{resident.joinDate}</td>
      <td>
        <Badge type={getStatusVariant(resident.status)} text={resident.status} />
      </td>
      <td>
        <Badge type={getPaymentVariant(resident.payments)} text={resident.payments} />
      </td>
      <td>
        <button className={styles.actionBtn}>
          <FiMoreHorizontal />
        </button>
      </td>
    </tr>
  );
}

export default function ResidentsTable({ data, loading }) {
  if (loading) {
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>RESIDENT</th>
              <th>ROOM NO.</th>
              <th>JOIN DATE</th>
              <th>STATUS</th>
              <th>PAYMENTS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className={styles.residentCell}>
                  <div className={styles.avatarSpacing}>
                    <div className={styles.skeletonAvatar}></div>
                  </div>
                  <div className={styles.residentInfo} style={{ width: '120px' }}>
                    <div className={styles.skeletonText} style={{ width: '100%', marginBottom: '4px' }}></div>
                    <div className={styles.skeletonText} style={{ width: '60%' }}></div>
                  </div>
                </td>
                <td><div className={styles.skeletonText} style={{ width: '80px' }}></div></td>
                <td><div className={styles.skeletonText} style={{ width: '80px' }}></div></td>
                <td><div className={styles.skeletonText} style={{ width: '60px', borderRadius: '100px', height: '20px' }}></div></td>
                <td><div className={styles.skeletonText} style={{ width: '60px', borderRadius: '100px', height: '20px' }}></div></td>
                <td><div className={styles.skeletonAvatar} style={{ width: '24px', height: '24px' }}></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.emptyState}>No residents found matching your criteria.</div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>RESIDENT</th>
            <th>ROOM NO.</th>
            <th>JOIN DATE</th>
            <th>STATUS</th>
            <th>PAYMENTS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {data.map((resident) => (
            <ResidentTableRow key={resident.id} resident={resident} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

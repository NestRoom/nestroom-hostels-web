import styles from './TransactionHistory.module.css';
import { transactionHistory } from '../../lib/mockData/payments';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MdFilterList, MdFileDownload, MdOutlineQrCode2, MdOutlineMoney, MdOutlineAccountBalance, MdChevronLeft, MdChevronRight } from 'react-icons/md';

const getMethodIcon = (method) => {
  switch (method) {
    case 'UPI': return <div className={`${styles.methodIcon} ${styles.upi}`}><MdOutlineQrCode2 size={16} /> UPI</div>;
    case 'Cash': return <div className={`${styles.methodIcon} ${styles.cash}`}><MdOutlineMoney size={16} /> Cash</div>;
    case 'Transfer': return <div className={`${styles.methodIcon} ${styles.transfer}`}><MdOutlineAccountBalance size={16} /> Transfer</div>;
    default: return method;
  }
};

const getStatusBadge = (status) => {
  if (status === 'Successful') return <Badge type="success" text="Successful" />;
  if (status === 'Pending') return <Badge type="danger" text="Pending" />;
  return <Badge text={status} />;
};

export default function TransactionHistory() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Transaction History</h3>
        <div className={styles.actions}>
          <div className={styles.filterDropdown}>
            <MdFilterList size={18} className={styles.filterIcon} />
            <select className={styles.select}>
              <option>All Payments</option>
              <option>Successful</option>
              <option>Pending</option>
            </select>
          </div>
          <Button variant="outline" className={styles.exportBtn}>Export CSV</Button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>RESIDENT NAME</th>
              <th>AMOUNT</th>
              <th>METHOD</th>
              <th>DATE & TIME</th>
              <th>STATUS</th>
              <th className={styles.actionCol}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {transactionHistory.map((tr) => (
              <tr key={tr.id}>
                <td>
                  <div className={styles.residentInfo}>
                    <div className={styles.avatarPlaceholder} />
                    <div className={styles.nameContent}>
                      <span className={styles.name}>{tr.residentName}</span>
                      <span className={styles.room}>{tr.room}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={tr.status === 'Pending' ? styles.amountPending : styles.amountBold}>
                    {tr.amount}
                  </span>
                </td>
                <td>{getMethodIcon(tr.method)}</td>
                <td>
                  <div className={styles.dateTime}>
                    <span className={tr.status === 'Pending' ? styles.datePending : styles.dateText}>{tr.date}</span>
                    <span className={styles.timeText}>{tr.time}</span>
                  </div>
                </td>
                <td>{getStatusBadge(tr.status)}</td>
                <td className={styles.actionCol}>
                  {tr.status === 'Successful' ? (
                    <button className={styles.downloadBtn}>
                      <MdFileDownload size={20} />
                    </button>
                  ) : (
                    <Button variant="primary" className={styles.reminderBtn}>Send Reminder</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <span className={styles.showingText}>Showing 4 of 128 transactions</span>
        <div className={styles.pagination}>
          <button className={styles.pageBtn}><MdChevronLeft size={20} /></button>
          <button className={styles.pageBtn}><MdChevronRight size={20} /></button>
        </div>
      </div>
    </div>
  );
}

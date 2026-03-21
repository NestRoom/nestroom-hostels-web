import Link from 'next/link';
import Card from './Card';
import styles from './recentPayments.module.css';

// Step 90: Mock payment arrays mapped to individual components below
const MOCK_PAYMENTS = [
  { id: 1, name: "Rahul S.", room: "Room 101", amount: "+₹12,400", time: "Today, 10:24 AM", isPositive: true, avatar: "https://i.pravatar.cc/150?img=15" },
  { id: 2, name: "Aarav P.", room: "Room 205", amount: "+₹8,500", time: "Yesterday", isPositive: true, avatar: "https://i.pravatar.cc/150?img=68" },
  { id: 3, name: "Anil K.", room: "Room 304", amount: "+₹14,000", time: "18 Mar, 2026", isPositive: true, avatar: "https://i.pravatar.cc/150?img=53" },
  { id: 4, name: "Raja M.", room: "Room 112", amount: "-₹2,000", time: "17 Mar, 2026", isPositive: false, avatar: "https://i.pravatar.cc/150?img=11" },
];

// Step 85: Create Sub-component <PaymentRow /> for list items
const PaymentRow = ({ payment }) => (
  <div className={styles.paymentRow}>
    {/* Step 86 & 87: Implement Avatar layout and Details Section */}
    <div className={styles.userInfo}>
      <img src={payment.avatar} alt={payment.name} className={styles.avatar} />
      <div className={styles.detailsBlock}>
        <span className={styles.name}>{payment.name}</span>
        <span className={styles.room}>{payment.room}</span>
      </div>
    </div>
    
    {/* Step 88: Amount and Timestamp Block */}
    <div className={styles.amountBlock}>
      {/* Step 89: Apply dynamic color classes relying on boolean state isPositive */}
      <span className={`${styles.amount} ${payment.isPositive ? styles.positive : styles.negative}`}>
        {payment.amount}
      </span>
      <span className={styles.timestamp}>{payment.time}</span>
    </div>
  </div>
);

export default function RecentPayments() {
  return (
    <Card className={styles.paymentsCard}>
      {/* Step 84: Header Section containing Title and View History link */}
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Payments</h3>
        <Link href="#" className={styles.viewLink}>View History</Link>
      </div>

      {/* Step 91: Loop map the MOCK_PAYMENTS to <PaymentRow /> with gap borders via CSS module */}
      <div className={styles.paymentsList}>
        {MOCK_PAYMENTS.map((payment) => (
          <PaymentRow key={payment.id} payment={payment} />
        ))}
      </div>
    </Card>
  );
}

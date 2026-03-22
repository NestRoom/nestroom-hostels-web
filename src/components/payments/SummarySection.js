import styles from './SummarySection.module.css';
import SummaryCard from './SummaryCard';
import { summaryCardsData } from '../../lib/mockData/payments';
import { MdOutlineAccountBalanceWallet, MdOutlineEvent, MdOutlineAssignmentLate } from 'react-icons/md';

export default function SummarySection() {
  const { collected, dues, renewals } = summaryCardsData;

  return (
    <div className={styles.summaryGrid}>
      <SummaryCard 
        title="Total Collected (Month)" 
        amount={collected.amount} 
        icon={MdOutlineAccountBalanceWallet} 
        trend={collected.trend} 
        isPositive={collected.isPositive} 
        styleType="greenBg"
      />
      
      <SummaryCard 
        title="Outstanding Dues" 
        amount={dues.amount} 
        icon={MdOutlineAssignmentLate} 
        trend={
          <>
            <span className={styles.alertIcon}>!</span> {dues.trend}
          </>
        } 
        isPositive={dues.isPositive} 
        styleType="redBg"
      />

      <SummaryCard 
        title="Upcoming Renewals" 
        amount={renewals.count} 
        icon={MdOutlineEvent} 
        trend={renewals.trend} 
        isPositive={null} 
        styleType="grayBg"
      />
    </div>
  );
}

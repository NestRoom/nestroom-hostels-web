"use client";
import styles from './payments.module.css';
import PaymentsHeader from '../../../components/payments/PaymentsHeader';
import SummarySection from '../../../components/payments/SummarySection';
import RevenueOverview from '../../../components/payments/RevenueOverview';
import TransactionHistory from '../../../components/payments/TransactionHistory';
import ManagementOverview from '../../../components/payments/ManagementOverview';

export default function PaymentsPage() {
  return (
    <div className={styles.paymentsContainer}>
      <PaymentsHeader />
      
      <SummarySection />

      <RevenueOverview />

      <TransactionHistory />

      <ManagementOverview />
    </div>
  );
}

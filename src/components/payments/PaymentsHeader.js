"use client";
import { useState } from 'react';
import styles from './PaymentsHeader.module.css';
import Button from '../ui/Button';
import { MdAdd } from 'react-icons/md';
import { usePayments } from '@/context/PaymentsContext';
import RecordPaymentModal from './RecordPaymentModal';

export default function PaymentsHeader() {
  const { refreshPayments } = usePayments();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Payments Tracking</h1>
          <p className={styles.subtitle}>Manage collections, dues, and transaction history.</p>
        </div>
        
        <div className={styles.actionSection}>
          <Button variant="primary" className={styles.recordButton} onClick={() => setIsModalOpen(true)}>
            <MdAdd size={20} />
            Record Payment
          </Button>
        </div>
      </div>

      <RecordPaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={refreshPayments}
      />
    </>
  );
}

"use client";
import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import Button from '../ui/Button';
import SearchInput from '../ui/SearchInput';
import { useServices } from '@/context/ServicesContext';
import NewTicketModal from './NewTicketModal';
import styles from './ServicesHeader.module.css';

export default function ServicesHeader() {
  const { refreshServices } = useServices();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Services Management</h1>
          <p className={styles.subtitle}>Manage Wi-Fi, Laundry, Mess, and other facility requests.</p>
        </div>
        
        <div className={styles.actions}>
          <SearchInput 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service tickets..."
            className={styles.searchInput}
          />
          <Button variant="primary" className={styles.newServiceBtn} onClick={() => setIsModalOpen(true)}>
            <FiPlus className={styles.plusIcon} /> New Service
          </Button>
        </div>
      </div>

      <NewTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={refreshServices}
      />
    </>
  );
}

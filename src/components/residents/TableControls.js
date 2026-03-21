"use client";

import SearchInput from '@/components/ui/SearchInput';
import Button from '@/components/ui/Button';
import { FiFilter } from 'react-icons/fi';
import styles from './tableControls.module.css';

export default function TableControls({ activeTab, setActiveTab, searchQuery, setSearchQuery }) {
  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Residents
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Kyc
          </button>
        </div>
        
        <Button variant="ghost" className={styles.filterBtn}>
          <FiFilter className={styles.filterIcon} />
          Filter
        </Button>
      </div>

      <div className={styles.rightSection}>
        <SearchInput 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search name or room..."
          className={styles.tableSearch}
        />
      </div>
    </div>
  );
}

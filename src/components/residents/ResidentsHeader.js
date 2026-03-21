"use client";

import { useState } from 'react';
import SearchInput from '@/components/ui/SearchInput';
import Button from '@/components/ui/Button';
import { FiUserPlus } from 'react-icons/fi';
import styles from './residentsHeader.module.css';

export default function ResidentsHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Residents Directory</h1>
        <p className={styles.subtitle}>Manage and view all residents currently staying at Nestroom.</p>
      </div>

      <div className={styles.actionSection}>
        <SearchInput 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search residents, room..."
          className={styles.searchBar}
        />
        <Button variant="primary" className={styles.addBtn}>
          <FiUserPlus className={styles.btnIcon} />
          Add Resident
        </Button>
      </div>
    </div>
  );
}

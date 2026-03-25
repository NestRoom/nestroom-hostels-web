"use client";
import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import { useRooms } from '@/context/RoomsContext';
import AddRoomModal from './AddRoomModal';
import styles from './roomsHeader.module.css';

export default function RoomsHeader() {
  const { searchQuery, setSearchQuery } = useRooms();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Rooms Management</h1>
          <p className={styles.subtitle}>Manage room inventory, occupancy, and maintenance status.</p>
        </div>
        <div className={styles.actionGroup}>
          <SearchInput 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search room number..." 
          />
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <FiPlus /> Add Room
          </Button>
        </div>
      </header>

      <AddRoomModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

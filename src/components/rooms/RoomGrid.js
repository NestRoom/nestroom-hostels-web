"use client";
import { FiPlus } from 'react-icons/fi';
import { useRooms } from '@/context/RoomsContext';
import RoomCard from './RoomCard';
import styles from './roomGrid.module.css';

export default function RoomGrid() {
  const { filteredRooms } = useRooms();

  return (
    <div className={styles.grid}>
      {filteredRooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
      
      {/* Add New Room Card */}
      <div className={styles.addCard}>
        <div className={styles.addIconHolder}>
          <FiPlus className={styles.plusIcon} />
        </div>
        <h4 className={styles.addTitle}>Add New Room</h4>
        <p className={styles.addSubtitle}>Configure space and type</p>
      </div>
    </div>
  );
}

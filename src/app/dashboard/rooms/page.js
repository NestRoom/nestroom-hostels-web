"use client";

import RoomsHeader from '@/components/rooms/RoomsHeader';
import SummarySection from '@/components/rooms/SummarySection';
import RoomFilters from '@/components/rooms/RoomFilters';
import RoomGrid from '@/components/rooms/RoomGrid';
import styles from './page.module.css';

export default function RoomsPage() {
  return (
    <div className={styles.roomsContainer}>
      <RoomsHeader />
      <SummarySection />
      <RoomFilters />
      <RoomGrid />
    </div>
  );
}

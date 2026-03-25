"use client";
import { useRooms } from '@/context/RoomsContext';
import SummaryCard from './SummaryCard';
import styles from './summarySection.module.css';
import { 
  MdOutlineDoorFront, 
  MdOutlineSingleBed, 
  MdOutlineBuild,
  MdInfoOutline,
  MdCheckCircle,
  MdWarning
} from 'react-icons/md';
import { ROOM_STATUS } from '@/lib/constants/rooms';

export default function SummarySection() {
  const { rooms } = useRooms();

  const totalRooms = rooms.length;
  // Calculate distinct floors by taking the first digit of room numbers (assuming 1xx format)
  const uniqueFloors = new Set(rooms.map(r => r.number.substring(0, 1))).size;
  
  // Available beds (capacity - residents)
  const availableBeds = rooms.reduce((acc, room) => {
    if (room.status !== ROOM_STATUS.MAINTENANCE) {
      return acc + (room.capacity - (room.residents?.length || 0));
    }
    return acc;
  }, 0);

  // Maintenance rooms
  const maintenanceRooms = rooms.filter(r => r.status === ROOM_STATUS.MAINTENANCE);
  const maintenanceCount = maintenanceRooms.length;
  // Format rooms like "Rooms 104, 212, 308"
  const maintenanceText = maintenanceCount > 0 
    ? `Rooms ${maintenanceRooms.map(r => r.number).join(', ')}`
    : 'All clear';

  return (
    <section className={styles.section}>
      <SummaryCard 
        type="purple"
        icon={MdOutlineDoorFront}
        title="Total Rooms"
        value={totalRooms.toString().padStart(2, '0')}
        footerIcon={MdInfoOutline}
        footerText={`Across ${uniqueFloors} Floors`}
      />
      <SummaryCard 
        type="green"
        icon={MdOutlineSingleBed}
        title="Available Beds"
        value={availableBeds.toString().padStart(2, '0')}
        footerIcon={MdCheckCircle}
        footerText="Ready for Check-in"
      />
      <SummaryCard 
        type="orange"
        icon={MdOutlineBuild}
        title="Under Maintenance"
        value={maintenanceCount.toString().padStart(2, '0')}
        footerIcon={MdWarning}
        footerText={maintenanceText}
      />
    </section>
  );
}

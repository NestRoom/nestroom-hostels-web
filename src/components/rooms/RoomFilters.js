import { useRooms } from '@/context/RoomsContext';
import styles from './roomFilters.module.css';

export default function RoomFilters() {
  const { activeFilter, setActiveFilter } = useRooms();

  const filters = [
    { id: 'ALL', label: 'All Rooms' },
    { id: 'VACANT', label: 'Vacant' },
    { id: 'MAINTENANCE', label: 'Maintenance' },
  ];

  return (
    <div className={styles.filterContainer}>
      <h2 className={styles.title}>Room Inventory</h2>
      <div className={styles.pillGroup}>
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`${styles.pill} ${activeFilter === filter.id ? styles.active : ''}`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

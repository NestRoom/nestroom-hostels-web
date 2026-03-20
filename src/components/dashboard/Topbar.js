import { FiSearch, FiBell } from 'react-icons/fi';
import styles from './topbar.module.css';

export default function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>Overview</h1>
        <span className={styles.subtitle}>Namaste, here&apos;s what&apos;s happening at Nestroom Hostel today.</span>
      </div>
      
      <div className={styles.actionsContainer}>
        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search residents, rooms..." 
            className={styles.searchInput} 
          />
        </div>

        {/* Notification Bell */}
        <button className={styles.notificationBtn} aria-label="Notifications">
          <FiBell className={styles.bellIcon} />
          <span className={styles.badge}></span>
        </button>
      </div>
    </header>
  );
}

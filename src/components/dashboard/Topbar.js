import styles from './topbar.module.css';

export default function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>Overview</h1>
        <span className={styles.subtitle}>Namaste, here&apos;s what&apos;s happening at Nestroom Hostel today.</span>
      </div>
      
      {/* Search Bar and Notification Bell will be injected here during Steps 39-44 */}
      <div className={styles.actionsPlaceholder}>
        {/* Placeholder for future flex alignment constraint */}
      </div>
    </header>
  );
}

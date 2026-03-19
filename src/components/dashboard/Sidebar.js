import Link from 'next/link';
import styles from './sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logo}>
          nest<span className={styles.blueText}>room</span>
        </Link>
      </div>

      {/* Sidebar navigation and layout will go here */}
    </aside>
  );
}

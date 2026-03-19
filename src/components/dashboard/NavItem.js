import Link from 'next/link';
import styles from './navItem.module.css';

export default function NavItem({ href, icon: Icon, label }) {
  return (
    <Link href={href} className={styles.navItem}>
      {Icon && <Icon className={styles.icon} />}
      <span className={styles.label}>{label}</span>
    </Link>
  );
}

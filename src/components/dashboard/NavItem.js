"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './navItem.module.css';

export default function NavItem({ href, icon: Icon, label }) {
  const pathname = usePathname();
  // Exact match logic so /dashboard doesn't stay highlighted on /dashboard/rooms
  const isActive = pathname === href;

  return (
    <Link href={href} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
      {Icon && <Icon className={styles.icon} />}
      <span className={styles.label}>{label}</span>
    </Link>
  );
}

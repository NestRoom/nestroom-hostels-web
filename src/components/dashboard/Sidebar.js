import Link from 'next/link';
import styles from './sidebar.module.css';
import NavItem from './NavItem';
import SidebarFooter from './SidebarFooter';
import { 
  MdOutlineSpaceDashboard,
  MdOutlineSingleBed,
  MdOutlinePayments,
  MdOutlineCleaningServices,
  MdOutlineInventory2
} from "react-icons/md";
import { FiUsers } from "react-icons/fi";

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: MdOutlineSpaceDashboard },
  { label: 'Rooms', href: '/dashboard/rooms', icon: MdOutlineSingleBed },
  { label: 'Residents', href: '/dashboard/residents', icon: FiUsers },
  { label: 'Payments', href: '/dashboard/payments', icon: MdOutlinePayments },
  { label: 'Services', href: '/dashboard/services', icon: MdOutlineCleaningServices },
  { label: 'Inventory', href: '/dashboard/inventory', icon: MdOutlineInventory2 },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logo}>
          nest<span className={styles.blueText}>room</span>
        </Link>
      </div>

      <nav className={styles.navContainer}>
        {navItems.map((item) => (
          <NavItem 
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </nav>

      <div className={styles.footerWrapper}>
        <SidebarFooter />
      </div>
    </aside>
  );
}

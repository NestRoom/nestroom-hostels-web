import styles from './page.module.css';

export const metadata = {
  title: 'Residents Directory | Nestroom',
  description: 'Manage and view all residents currently staying at Nestroom.',
};

export default function ResidentsPage() {
  return (
    <div className={styles.container}>
      {/* Residents Header and Actions will be added here in subsequent phases */}
      <h1>Residents Directory</h1>
      <p>Manage and view all residents currently staying at Nestroom.</p>
      
      {/* Search Bar / Add Button Placeholder */}
      <div className={styles.headerSpacer}></div>

      {/* Summary Cards */}
      {/* Table Filters & Data List will go here... */}
    </div>
  );
}

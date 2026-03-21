import ResidentsHeader from '@/components/residents/ResidentsHeader';
import styles from './page.module.css';

export const metadata = {
  title: 'Residents Directory | Nestroom',
  description: 'Manage and view all residents currently staying at Nestroom.',
};

export default function ResidentsPage() {
  return (
    <div className={styles.container}>
      <ResidentsHeader />

      {/* Summary Cards */}
      
      {/* Table Filters & Data List will go here... */}
    </div>
  );
}

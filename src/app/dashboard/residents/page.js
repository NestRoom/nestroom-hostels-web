import ResidentsHeader from '@/components/residents/ResidentsHeader';
import SummarySection from '@/components/residents/SummarySection';
import ResidentsTableContainer from '@/components/residents/ResidentsTableContainer';
import styles from './page.module.css';

export const metadata = {
  title: 'Residents Directory | Nestroom',
  description: 'Manage and view all residents currently staying at Nestroom.',
};

export default function ResidentsPage() {
  return (
    <div className={styles.container}>
      <ResidentsHeader />
      <SummarySection />
      
      <ResidentsTableContainer />
    </div>
  );
}

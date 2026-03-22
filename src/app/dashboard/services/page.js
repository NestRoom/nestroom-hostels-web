import ServicesHeader from '@/components/services/ServicesHeader';
import ServicesSummaryCards from '@/components/services/ServicesSummaryCards';
import RevenueChart from '@/components/services/RevenueChart';
import ServiceTicketsTable from '@/components/services/ServiceTicketsTable';
import styles from './services.module.css';

export default function ServicesPage() {
  return (
    <main className={styles.container}>
      <ServicesHeader />
      <ServicesSummaryCards />
      <RevenueChart />
      <ServiceTicketsTable />
    </main>
  );
}

import { FiWifi, FiDroplet } from 'react-icons/fi';
import { MdOutlineLocalLaundryService, MdRestaurant } from 'react-icons/md';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { SERVICE_TICKETS } from '../../app/dashboard/services/constants';
import styles from './ServiceTicketsTable.module.css';

const serviceIconMap = {
  'Wi-Fi': { icon: FiWifi, colorClass: styles.iconWifi },
  'Laundry': { icon: MdOutlineLocalLaundryService, colorClass: styles.iconLaundry },
  'Mess': { icon: MdRestaurant, colorClass: styles.iconMess },
  'Plumbing': { icon: FiDroplet, colorClass: styles.iconPlumbing },
};

const statusBadgeMap = {
  'PENDING': 'warning',
  'IN-PROGRESS': 'info',
  'RESOLVED': 'success'
};

export default function ServiceTicketsTable() {
  return (
    <div className={styles.container}>
      <h2 className={styles.sectionTitle}>Service Tickets</h2>
      <Card className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>TICKET ID</th>
                <th>SERVICE</th>
                <th>DESCRIPTION</th>
                <th>RESIDENT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_TICKETS.map((ticket, index) => {
                const ServiceIcon = serviceIconMap[ticket.service]?.icon || FiWifi;
                const iconColorClass = serviceIconMap[ticket.service]?.colorClass || '';
                
                return (
                  <tr key={index}>
                    <td className={styles.ticketId}>{ticket.id}</td>
                    <td>
                      <div className={styles.serviceCell}>
                        <ServiceIcon className={`${styles.serviceIcon} ${iconColorClass}`} />
                        <span>{ticket.service}</span>
                      </div>
                    </td>
                    <td className={styles.description}>{ticket.description}</td>
                    <td>
                      <div className={styles.residentCell}>
                        <Avatar name={ticket.resident} size="sm" />
                        <span>{ticket.resident}</span>
                      </div>
                    </td>
                    <td>
                      <Badge 
                        type={statusBadgeMap[ticket.status] || 'default'} 
                        text={ticket.status} 
                      />
                    </td>
                    <td>
                      <button className={styles.actionBtn}>Update</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

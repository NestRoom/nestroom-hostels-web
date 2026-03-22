import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileCard from '@/components/profile/ProfileCard';
import PersonalInfo from '@/components/profile/PersonalInfo';
import HostelDetails from '@/components/profile/HostelDetails';
import AccountSecurity from '@/components/profile/AccountSecurity';
import ProfileActions from '@/components/profile/ProfileActions';
import styles from './profile.module.css';

export default function ProfilePage() {
  return (
    <main className={styles.container}>
      <ProfileHeader />
      <ProfileCard />
      
      <div className={styles.gridRow}>
        <PersonalInfo />
        <HostelDetails />
      </div>
      
      <AccountSecurity />
      <ProfileActions />
    </main>
  );
}

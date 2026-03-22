import Button from '../ui/Button';
import styles from './ProfileActions.module.css';

export default function ProfileActions() {
  return (
    <div className={styles.container}>
      <Button className={styles.cancelBtn}>Cancel</Button>
      <Button variant="primary" className={styles.saveBtn}>Save Changes</Button>
    </div>
  );
}

import Link from "next/link";
import styles from "./NavBar.module.css";

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <h1 className={styles.nest}>nest</h1>
        <h1 className={styles.room}>room</h1>
      </div>
      <div className={styles.navLinks}>
        <div className={styles.link}>about</div>
        <div className={styles.link}>contact</div>
        <div className={styles.link}>pricing</div>
      </div>
      <div className={styles.buttons}>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <div className={styles.loginButton}>continue</div>
        </Link>
        <Link href="/signup" style={{ textDecoration: 'none' }}>
          <button className={styles.signUpButton}>sign up</button>
        </Link>
      </div>
    </nav>
  );
}

import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.divider}></div>
      <div className={styles.footerInner}>
        <p className={styles.copyright}>© nestroom, 2026</p>
        <div className={styles.footerLinks}>
          <a href="#">T&C apply</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

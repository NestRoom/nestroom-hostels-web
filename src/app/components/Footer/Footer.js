import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.line}></div>
      <div className={styles.textContainer}>
        <p className={styles.text}>© nestroom, 2026</p>
        <p className={styles.textSmall}>T&C apply</p>
      </div>
    </footer>
  );
}

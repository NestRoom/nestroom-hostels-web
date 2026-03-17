"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        nest<span className={styles.blueText}>room</span>
      </Link>

      <div className={styles.navLinks}>
        <a href="#">about</a>
        <a href="#">features</a>
        <a href="#">pricing</a>
      </div>

      <div className={styles.navCtas}>
        <Link href="/login" className={styles.continueBtn}>continue</Link>
        <Link href="/signup" className={styles.signupBtn}>sign up</Link>
      </div>
    </nav>
  );
}

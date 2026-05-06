"use client";

import styles from "./page.module.css";
import NavBar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
import { Users, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <NavBar />
        <main className={styles.main}>
          <section className={styles.hero}>
            <h1 className={styles.title}>Reimagining <span className={styles.accent}>Hostel Life</span></h1>
            <p className={styles.subtitle}>
              NestRoom is on a mission to simplify student housing for both residents and administrators.
            </p>
          </section>

          <section className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.iconWrapper} style={{ background: '#f5f3ff', color: '#4f46e5' }}>
                <Users size={32} />
              </div>
              <h3>Community First</h3>
              <p>We build tools that foster connection and make communal living seamless and enjoyable.</p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconWrapper} style={{ background: '#ecfdf5', color: '#10b981' }}>
                <Shield size={32} />
              </div>
              <h3>Secure & Reliable</h3>
              <p>Your safety and data security are our top priorities, with enterprise-grade protection built-in.</p>
            </div>

            <div className={styles.card}>
              <div className={styles.iconWrapper} style={{ background: '#fffbeb', color: '#f59e0b' }}>
                <Zap size={32} />
              </div>
              <h3>Lightning Fast</h3>
              <p>Experience zero-latency operations from check-ins to payment processing.</p>
            </div>
          </section>

          <section className={styles.contentSection}>
            <h2>Our Story</h2>
            <p>
              Born out of the frustration of managing traditional student hostels, NestRoom was created to bridge the gap between antiquated paper-based systems and the modern digital era. We provide a unified platform that handles everything from bed allocations and revenue tracking to food schedules and maintenance requests.
            </p>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}

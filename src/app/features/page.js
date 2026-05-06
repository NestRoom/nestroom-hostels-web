"use client";

import styles from "../about/page.module.css";
import NavBar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
import { LayoutDashboard, Users, CreditCard, MessageSquare, Bell, Utensils } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      title: "Smart Dashboard",
      description: "Get a bird's eye view of your entire operation with real-time analytics and occupancy tracking.",
      icon: <LayoutDashboard size={32} />,
      color: "#4f46e5",
      bg: "#f5f3ff"
    },
    {
      title: "Resident Management",
      description: "Comprehensive profiles for all residents, including KYC, room history, and payment status.",
      icon: <Users size={32} />,
      color: "#10b981",
      bg: "#ecfdf5"
    },
    {
      title: "Automated Payments",
      description: "Seamlessly collect rent and other fees with automated invoicing and payment reminders.",
      icon: <CreditCard size={32} />,
      color: "#f59e0b",
      bg: "#fffbeb"
    },
    {
      title: "Complaints Desk",
      description: "A centralized system for residents to report issues and for staff to track resolutions.",
      icon: <MessageSquare size={32} />,
      color: "#ef4444",
      bg: "#fef2f2"
    },
    {
      title: "Instant Notifications",
      description: "Keep everyone informed with push notifications and in-app alerts for important updates.",
      icon: <Bell size={32} />,
      color: "#8b5cf6",
      bg: "#f5f3ff"
    },
    {
      title: "Food Scheduling",
      description: "Plan and manage meal schedules efficiently, allowing residents to view daily menus.",
      icon: <Utensils size={32} />,
      color: "#ec4899",
      bg: "#fdf2f8"
    }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <NavBar />
        <main className={styles.main}>
          <section className={styles.hero}>
            <h1 className={styles.title}>Powerful <span className={styles.accent}>Features</span></h1>
            <p className={styles.subtitle}>
              Everything you need to run a modern hostel, all in one place.
            </p>
          </section>

          <section className={styles.grid}>
            {features.map((f, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.iconWrapper} style={{ background: f.bg, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}

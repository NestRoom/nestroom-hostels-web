"use client";

import styles from "../about/page.module.css";
import NavBar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
import { Check } from "lucide-react";

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "₹999",
      period: "per month",
      description: "Perfect for small hostels just getting started with digitization.",
      features: ["Up to 50 beds", "Basic Analytics", "Payment Tracking", "Shared Community Support"],
      button: "Get Started",
      accent: "#404040"
    },
    {
      name: "Professional",
      price: "₹2,499",
      period: "per month",
      description: "Our most popular plan for established hostels looking to scale.",
      features: ["Up to 200 beds", "Advanced Reports", "Automated Invoicing", "Priority Support", "Food Management"],
      button: "Try Professional",
      accent: "var(--primary)",
      featured: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "per month",
      description: "Tailored solutions for large hostels and multi-location chains.",
      features: ["Unlimited beds", "Custom Integrations", "Multi-branch Dashboard", "24/7 Dedicated Support", "White-label options"],
      button: "Contact Sales",
      accent: "#111827"
    }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <NavBar />
        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.demoBadge}>Demo Phase</div>
            <h1 className={styles.title}>Simple <span className={styles.accent}>Pricing</span></h1>
            <p className={styles.subtitle}>
              Choose the perfect plan for your hostel. No hidden fees.
            </p>
          </section>

          <section className={styles.grid}>
            {tiers.map((tier, i) => (
              <div 
                key={i} 
                className={`${styles.card} ${tier.featured ? styles.featuredCard : ''}`}
                style={tier.featured ? { borderColor: 'var(--primary)', borderWidth: '2px' } : {}}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.5rem', color: tier.accent }}>{tier.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '1rem' }}>
                    <span style={{ fontSize: '3rem', fontWeight: '850', color: 'var(--foreground)' }}>{tier.price}</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: '500' }}>{tier.period}</span>
                  </div>
                </div>
                
                <p style={{ minHeight: '60px' }}>{tier.description}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0', flex: 1 }}>
                  {tier.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Check size={18} color={tier.accent} strokeWidth={3} />
                      <span style={{ fontWeight: '500', color: 'var(--foreground)' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button 
                  className="premium-btn-primary" 
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center',
                    background: tier.featured ? 'var(--primary)' : '#111827',
                    boxShadow: 'none'
                  }}
                >
                  {tier.button}
                </button>
              </div>
            ))}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}

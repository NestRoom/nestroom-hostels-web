"use client";

import { useState, useEffect } from "react";
import styles from "./payments.module.css";
import { secureFetch } from "../../utils/auth";
import Loading from "../../components/Loading/Loading";

export default function StudentPayments() {
  const [resident, setResident] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, upcomingRes, historyRes] = await Promise.all([
        secureFetch("http://localhost:5001/v1/residents/profile"),
        secureFetch("http://localhost:5001/v1/residents/payments/upcoming"),
        secureFetch("http://localhost:5001/v1/residents/payments/history")
      ]);

      const profileData = await profileRes.json();
      if (profileData.success) setResident(profileData.data.resident);

      const upcomingData = await upcomingRes.json();
      if (upcomingData.success) setUpcoming(upcomingData.data);

      const historyData = await historyRes.json();
      if (historyData.success) setHistory(historyData.data.payments);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    setMessage(null);

    try {
      // 1. Initialize Order
      const res = await secureFetch("http://localhost:5001/v1/residents/payments/initialize", {
        method: "POST"
      });
      const order = await res.json();
      if (!order.success) {
        throw new Error(order.message || "Failed to initialize payment.");
      }

      const { orderId, amount, currency, keyId } = order.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount * 100,
        currency: currency,
        name: "nestroom",
        description: "Monthly Hostel Fee Payment",
        image: "https://raw.githubusercontent.com/ItzSouraseez/nestroom-hostels-web/main/public/logo-icon.png", // Attempt to use a logo if exists or placeholder
        order_id: orderId,
        handler: async function (response) {
          // 3. Verify Payment
          try {
            const verifyRes = await secureFetch("http://localhost:5001/v1/residents/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
               setMessage({ type: 'success', text: "Payment successful! Your receipt has been emailed." });
               fetchData();
            } else {
               setMessage({ type: 'error', text: "Verification failed. Please contact support if amount was deducted." });
            }
          } catch (e) {
            setMessage({ type: 'error', text: "Verification error." });
          }
        },
        prefill: {
          name: resident?.fullName,
          email: resident?.email,
          contact: resident?.whatsappNumber
        },
        theme: { 
          color: "#3B3BFF",
          backdrop_color: "#111827" 
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setPaying(false);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Financials</h1>
        <p className={styles.subtitle}>Pay fees and track your transaction history.</p>
      </header>

      <div className={styles.grid}>
        {/* Active Bill Card */}
        <section className={styles.activeBill}>
          <div className={styles.billHeader}>
            <div className={styles.billHeaderLeft}>
              <span className={styles.periodTag}>Active Bill</span>
              <h3>Monthly Rent</h3>
            </div>
            <div className={styles.amount}>₹{upcoming?.feeAmount?.toLocaleString() || 0}</div>
          </div>

          <div className={styles.billMeta}>
            <div className={styles.metaItem}>
              <span className={styles.label}>Due Date</span>
              <span className={styles.value}>
                {upcoming?.nextDueDate ? new Date(upcoming.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.label}>Status</span>
              <span className={`${styles.statusLabel} ${upcoming?.daysRemaining < 0 ? styles.overdue : styles.pending}`}>
                {upcoming?.daysRemaining < 0 ? "Overdue" : "Awaiting Payment"}
              </span>
            </div>
          </div>

          {upcoming?.daysRemaining < 0 && (
            <div className={styles.overdueAlert}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Payment is overdue by {Math.abs(upcoming.daysRemaining)} days.
            </div>
          )}

          <button className={styles.payBtn} onClick={handlePayment} disabled={paying}>
            {paying ? (
              <>
                <svg className={styles.spin} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Processing...
              </>
            ) : (
              <>
                <img 
                  src="https://cdn.razorpay.com/static/assets/logo.svg" 
                  alt="Razorpay" 
                  className={styles.rzpLogo} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                <span>Pay Now with Razorpay</span>
              </>
            )}
          </button>
        </section>

        {/* History Table */}
        <section className={styles.historyCard}>
          <h3 className={styles.cardTitle}>Recent Activity</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                   <tr><td colSpan="4" className={styles.noData}>No payments recorded yet.</td></tr>
                ) : (
                  history.map(payment => (
                    <tr key={payment._id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 850 }}>{payment.paymentMethod || 'Online'}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      </td>
                      <td className={styles.payId}>{payment.paymentId?.substring(0, 12)}...</td>
                      <td className={styles.payAmount}>₹{payment.amount.toLocaleString()}</td>
                      <td>
                        <span className={`${styles.statusTag} ${styles[payment.paymentStatus.toLowerCase() + 'Tag']}`}>
                          {payment.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {message && (
        <div className={`${styles.toast} ${styles[message.type]}`}>
          {message.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          )}
          {message.text}
          <button onClick={() => setMessage(null)}>&times;</button>
        </div>
      )}
    </div>
  );
}

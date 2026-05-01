"use client";

import { useState, useEffect } from "react";
import styles from "./complaints.module.css";
import { secureFetch } from "../../utils/auth";
import Loading from "../../components/Loading/Loading";

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [raising, setRaising] = useState(false);
  const [message, setMessage] = useState(null);

  const [newComplaint, setNewComplaint] = useState({
    title: '',
    category: 'Maintenance',
    priority: 'Medium',
    description: '',
    location: ''
  });

  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await secureFetch("http://localhost:5001/v1/residents/complaints");
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data.complaints);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    setRaising(true);
    setMessage(null);

    const formData = new FormData();
    Object.keys(newComplaint).forEach(key => formData.append(key, newComplaint[key]));
    attachments.forEach(file => formData.append("attachments", file));

    try {
      const res = await secureFetch("http://localhost:5001/v1/residents/complaints", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: "Complaint raised successfully!" });
        setNewComplaint({ title: '', category: 'Maintenance', priority: 'Medium', description: '', location: '' });
        setAttachments([]);
        setShowRaiseForm(false);
        fetchComplaints();
      } else {
        setMessage({ type: 'error', text: data.message || "Failed to raise complaint." });
      }
    } catch (e) {
      setMessage({ type: 'error', text: "Error connecting to server." });
    } finally {
      setRaising(false);
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In-Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  if (loading) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Support Center</h1>
          <p className={styles.subtitle}>Report issues and track their resolution status in real-time.</p>
        </div>
        <button className={styles.raiseBtn} onClick={() => setShowRaiseForm(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Raise Complaint
        </button>
      </header>

      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total Issues</span>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.pendingText}`} style={{ color: '#d97706' }}>{stats.pending}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.progressText}`} style={{ color: '#2563eb' }}>{stats.inProgress}</span>
          <span className={styles.statLabel}>In-Progress</span>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.resolvedText}`} style={{ color: '#059669' }}>{stats.resolved}</span>
          <span className={styles.statLabel}>Resolved</span>
        </div>
      </section>

      {showRaiseForm && (
        <div className={styles.modalOverlay} onClick={() => setShowRaiseForm(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Report an Issue</h2>
            <form onSubmit={handleRaiseSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Issue Title</label>
                <input 
                  type="text" 
                  placeholder="What is the problem?" 
                  required 
                  value={newComplaint.title}
                  onChange={e => setNewComplaint({...newComplaint, title: e.target.value})}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Category</label>
                  <select 
                    value={newComplaint.category}
                    onChange={e => setNewComplaint({...newComplaint, category: e.target.value})}
                  >
                    <option>Maintenance</option>
                    <option>Cleanliness</option>
                    <option>Staff</option>
                    <option>Food</option>
                    <option>Safety</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Priority</label>
                  <select 
                    value={newComplaint.priority}
                    onChange={e => setNewComplaint({...newComplaint, priority: e.target.value})}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Description</label>
                <textarea 
                  rows="4" 
                  placeholder="Please provide details to help us resolve it faster..." 
                  required
                  value={newComplaint.description}
                  onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}
                ></textarea>
              </div>

              <div className={styles.inputGroup}>
                <label>Photos (Optional)</label>
                <input type="file" multiple onChange={e => setAttachments(Array.from(e.target.files))} />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowRaiseForm(false)}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={raising}>
                  {raising ? "Submitting..." : "Send Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.complaintList}>
        {complaints.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>Everything is perfect</h3>
            <p>You haven&apos;t reported any issues yet. We&apos;re glad you&apos;re having a smooth stay!</p>
          </div>
        ) : (
          <div className={styles.listGrid}>
            {[...complaints].reverse().map(complaint => (
              <div key={complaint._id} className={styles.complaintCard}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.statusLabel} ${styles[complaint.status.toLowerCase().replace(' ', '-')]}`}>
                    {complaint.status}
                  </span>
                  <span className={styles.date}>{new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <h3 className={styles.cardTitle}>{complaint.title}</h3>
                <p className={styles.cardDesc}>{complaint.description}</p>
                <div className={styles.cardFooter}>
                   <span className={styles.category}>{complaint.category}</span>
                   <span className={`${styles.priority} ${styles[complaint.priority.toLowerCase()]}`}>
                     {complaint.priority}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {message && (
        <div className={`${styles.toast} ${styles[message.type]}`}>
          {message.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
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

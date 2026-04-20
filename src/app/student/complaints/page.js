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

  if (loading) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Complaints & Support</h1>
          <p className={styles.subtitle}>Report issues and track their resolution status.</p>
        </div>
        <button className={styles.raiseBtn} onClick={() => setShowRaiseForm(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Raise New Complaint
        </button>
      </header>

      {showRaiseForm && (
        <div className={styles.modalOverlay} onClick={() => setShowRaiseForm(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Report an Issue</h2>
            <form onSubmit={handleRaiseSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bathroom Leakage" 
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
                <label>Location (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Room 104 - Side Bed" 
                  value={newComplaint.location}
                  onChange={e => setNewComplaint({...newComplaint, location: e.target.value})}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Description</label>
                <textarea 
                  rows="4" 
                  placeholder="Briefly describe the issue..." 
                  required
                  value={newComplaint.description}
                  onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}
                ></textarea>
              </div>

              <div className={styles.inputGroup}>
                <label>Attachments (Photos)</label>
                <input type="file" multiple onChange={e => setAttachments(Array.from(e.target.files))} />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowRaiseForm(false)}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={raising}>{raising ? "Submitting..." : "Submit Complaint"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.complaintList}>
        {complaints.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
            </div>
            <h3>No complaints found</h3>
            <p>You haven't reported any issues yet.</p>
          </div>
        ) : (
          <div className={styles.listGrid}>
            {complaints.map(complaint => (
              <div key={complaint._id} className={styles.complaintCard}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.statusLabel} ${styles[complaint.status.toLowerCase()]}`}>
                    {complaint.status}
                  </span>
                  <span className={styles.date}>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className={styles.cardTitle}>{complaint.title}</h3>
                <p className={styles.cardDesc}>{complaint.description.slice(0, 100)}...</p>
                <div className={styles.cardFooter}>
                   <span className={styles.category}>{complaint.category}</span>
                   <span className={`${styles.priority} ${styles[complaint.priority.toLowerCase()]}`}>
                     {complaint.priority} Priority
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {message && (
        <div className={`${styles.toast} ${styles[message.type]}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>&times;</button>
        </div>
      )}
    </div>
  );
}

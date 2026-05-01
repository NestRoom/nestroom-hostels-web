"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { secureFetch } from "../../utils/auth";
import LoadingComponent from "../../components/Loading/Loading";

export default function StudentAttendance() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [loading, setLoading] = useState(true);
  
  // Attendance state
  const [activeRequest, setActiveRequest] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [punching, setPunching] = useState(false);
  const [punchResult, setPunchResult] = useState(null);

  // Leaves state
  const [leaves, setLeaves] = useState([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [applyingLeave, setApplyingLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Home Visit",
    fromDate: "",
    toDate: "",
    reason: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes, leavesRes] = await Promise.all([
        secureFetch("http://localhost:5001/v1/residents/attendance/active"),
        secureFetch("http://localhost:5001/v1/residents/attendance/history"),
        secureFetch("http://localhost:5001/v1/residents/leaves")
      ]);

      const activeData = await activeRes.json();
      if (activeData.success || activeData.status === 'success') {
        setActiveRequest(activeData.data?.activeRequest || null);
      }

      const historyData = await historyRes.json();
      if (historyData.success || historyData.status === 'success') {
        setAttendanceSummary(historyData.data?.summary || null);
        setAttendanceRecords(historyData.data?.records || []);
      }

      const leavesData = await leavesRes.json();
      if (leavesData.success || leavesData.status === 'success') {
        setLeaves(leavesData.data?.leaves || []);
      }
    } catch (e) {
      console.error("Failed to fetch attendance data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAttendance = () => {
    setPunching(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setPunching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          const res = await secureFetch("http://localhost:5001/v1/residents/attendance/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Present", latitude, longitude, accuracy })
          });

          const data = await res.json();
          if (data.status === 'success' || data.success) {
            setPunchResult({ success: true, message: data.data?.message || data.message || "Attendance marked successfully" });
            setActiveRequest(null);
            // Refresh history
            fetchData();
          } else {
            setPunchResult({ success: false, message: data.message });
          }
        } catch (e) {
          setPunchResult({ success: false, message: "Server error occurred" });
        } finally {
          setPunching(false);
        }
      },
      (error) => {
        alert("Please enable location access to mark attendance.");
        setPunching(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setApplyingLeave(true);
    
    try {
      const res = await secureFetch("http://localhost:5001/v1/residents/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveForm)
      });
      
      const data = await res.json();
      if (data.success || data.status === 'success') {
        setIsLeaveModalOpen(false);
        setLeaveForm({ leaveType: "Home Visit", fromDate: "", toDate: "", reason: "" });
        // Refresh leaves
        fetchData();
      } else {
        alert(data.message || "Failed to apply for leave");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setApplyingLeave(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case "Present": return styles.statusPresent;
      case "Absent": return styles.statusAbsent;
      case "OnLeave": return styles.statusOnLeave;
      case "Pending": return styles.statusPending;
      case "Approved": return styles.statusApproved;
      case "Rejected": return styles.statusRejected;
      default: return "";
    }
  };

  if (loading) return (
    <div className={styles.emptyState}>
      <LoadingComponent />
      <p style={{ marginTop: '2rem', fontWeight: 850, color: '#94a3b8', fontSize: '1.1rem' }}>Synchronizing your records...</p>
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Check-in & Leaves</h1>
          <p className={styles.subtitle}>Maintain your digital presence and manage your time away.</p>
        </div>
        {activeTab === "leaves" && (
          <button className={styles.primaryButton} onClick={() => setIsLeaveModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            Apply for Leave
          </button>
        )}
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === "attendance" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance History
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "leaves" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("leaves")}
        >
          My Applications
        </button>
      </div>

      {punchResult && (
        <div className={`${styles.resultAlert} ${punchResult.success ? styles.resSuccess : styles.resError}`}>
          {punchResult.success ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          )}
          <p>{punchResult.message}</p>
          <button onClick={() => setPunchResult(null)}>&times;</button>
        </div>
      )}

      {activeTab === "attendance" && (
        <>
          {activeRequest && (
            <section className={styles.attendanceAlert}>
              <div className={styles.alertContent}>
                <div className={styles.alertIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className={styles.alertText}>
                  <h4>Presence Verification Required</h4>
                  <p>{activeRequest.remarks || "A regular presence check is active. Please confirm your location to mark attendance."}</p>
                </div>
                <button 
                  className={styles.markBtn} 
                  onClick={handleMarkAttendance}
                  disabled={punching}
                >
                  {punching ? "Verifying Location..." : "Confirm Presence"}
                </button>
              </div>
            </section>
          )}

          {attendanceSummary && (
            <section className={styles.summaryCards}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{attendanceSummary.total}</span>
                <span className={styles.statLabel}>Academic Days</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue} style={{ color: "#059669" }}>{attendanceSummary.present}</span>
                <span className={styles.statLabel}>Days Present</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue} style={{ color: "#e11d48" }}>{attendanceSummary.absent}</span>
                <span className={styles.statLabel}>Days Absent</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue} style={{ color: "#3b3bff" }}>{attendanceSummary.attendanceRate}</span>
                <span className={styles.statLabel}>Attendance Rate</span>
              </div>
            </section>
          )}

          <div className={styles.tableContainer}>
            {attendanceRecords.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ background: '#f8fafc', padding: '3rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h6"/></svg>
                </div>
                <h3>No Records Yet</h3>
                <p>Attendance history will appear here once the academic term begins.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Academic Date</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map(record => (
                    <tr key={record._id}>
                      <td style={{ fontWeight: 850, color: '#1e293b' }}>
                        {new Date(record.attendanceDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td style={{ color: '#64748b' }}>
                        {record.responseReceivedAt ? new Date(record.responseReceivedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute:'2-digit', hour12: true }) : "—"}
                      </td>
                      <td style={{ color: '#64748b', fontWeight: 700 }}>{record.responseType || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === "leaves" && (
        <div className={styles.tableContainer}>
          {leaves.length === 0 ? (
            <div className={styles.emptyState}>
               <div style={{ background: '#f8fafc', padding: '3rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
               </div>
               <h3>No Active Applications</h3>
               <p>Your leave history and pending applications will be displayed here.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Submission</th>
                </tr>
              </thead>
              <tbody>
                {[...leaves].reverse().map(leave => (
                  <tr key={leave._id}>
                    <td><span style={{ fontFamily: 'monospace', color: '#94a3b8', fontWeight: 700 }}>#{leave.leaveId}</span></td>
                    <td style={{ fontWeight: 850, color: '#1e293b' }}>{leave.leaveType}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{new Date(leave.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {new Date(leave.toDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 850, textTransform: 'uppercase', marginTop: '0.25rem' }}>{leave.duration} Academic Days</div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>{new Date(leave.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {isLeaveModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !applyingLeave && setIsLeaveModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2>Request Absence</h2>
              <button className={styles.closeBtn} onClick={() => setIsLeaveModalOpen(false)} disabled={applyingLeave}>&times;</button>
            </header>
            <form onSubmit={handleApplyLeave}>
              <div className={styles.formGroup}>
                <label>Absence Category</label>
                <select 
                  className={styles.formSelect}
                  value={leaveForm.leaveType}
                  onChange={e => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                  required
                >
                  <option value="Home Visit">Home Visit</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className={styles.dateRow}>
                <div className={styles.formGroup}>
                  <label>Departure Date</label>
                  <input 
                    type="date"
                    className={styles.formInput}
                    value={leaveForm.fromDate}
                    onChange={e => setLeaveForm({...leaveForm, fromDate: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Return Date</label>
                  <input 
                    type="date"
                    className={styles.formInput}
                    value={leaveForm.toDate}
                    min={leaveForm.fromDate}
                    onChange={e => setLeaveForm({...leaveForm, toDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Justification</label>
                <textarea 
                  className={styles.formTextarea}
                  rows="4"
                  placeholder="Provide a brief explanation for your absence request..."
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}
                  required
                ></textarea>
              </div>

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsLeaveModalOpen(false)} disabled={applyingLeave}>Discard</button>
                <button type="submit" className={styles.submitBtn} disabled={applyingLeave}>
                  {applyingLeave ? "Processing..." : "Submit Request"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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

  if (loading) return <div className={styles.emptyState}><LoadingComponent /><p style={{marginTop: '1rem'}}>Loading your records...</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Attendance & Leaves</h1>
          <p className={styles.subtitle}>Manage your attendance records and leave applications.</p>
        </div>
        {activeTab === "leaves" && (
          <button className={styles.primaryButton} onClick={() => setIsLeaveModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Apply for Leave
          </button>
        )}
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === "attendance" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance Records
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "leaves" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("leaves")}
        >
          Leave Applications
        </button>
      </div>

      {punchResult && (
        <div className={`${styles.resultAlert} ${punchResult.success ? styles.resSuccess : styles.resError}`}>
          <p>{punchResult.message}</p>
          <button onClick={() => setPunchResult(null)}>&times;</button>
        </div>
      )}

      {activeTab === "attendance" && (
        <>
          {activeRequest && (
            <div className={styles.attendanceAlert}>
              <div className={styles.alertContent}>
                <div className={styles.alertIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M8 17A5 5 0 0 1 12 7a5 5 0 0 1 4 10"/><path d="M12 2v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 6.3 1.4-1.4"/><path d="M22 12h-2"/><path d="M4 12H2"/><path d="m17.7 17.7 1.4 1.4"/><path d="m4.9 19.1 1.4-1.4"/></svg>
                </div>
                <div className={styles.alertText}>
                  <h4>Attendance Verification Active</h4>
                  <p>{activeRequest.remarks || "Regular daily check-in is currently active. Please confirm your presence."}</p>
                </div>
                <button 
                  className={styles.markBtn} 
                  onClick={handleMarkAttendance}
                  disabled={punching}
                >
                  {punching ? "Verifying..." : "Confirm Presence"}
                </button>
              </div>
            </div>
          )}

          {attendanceSummary && (
            <div className={styles.summaryCards}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Days</div>
                <div className={styles.statValue}>{attendanceSummary.total}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Present</div>
                <div className={styles.statValue} style={{ color: "#059669" }}>{attendanceSummary.present}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Absent</div>
                <div className={styles.statValue} style={{ color: "#DC2626" }}>{attendanceSummary.absent}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Attendance Rate</div>
                <div className={styles.statValue} style={{ color: "#3b3bff" }}>{attendanceSummary.attendanceRate}</div>
              </div>
            </div>
          )}

          <div className={styles.tableContainer}>
            {attendanceRecords.length === 0 ? (
              <div className={styles.emptyState}>No attendance records found.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Response Time</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map(record => (
                    <tr key={record._id}>
                      <td>{new Date(record.attendanceDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.responseReceivedAt ? new Date(record.responseReceivedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}</td>
                      <td>{record.responseType || "-"}</td>
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
               <div style={{fontSize: '3rem', marginBottom: '1rem'}}>✈️</div>
               <h3>No leaves applied</h3>
               <p>You haven&apos;t submitted any leave applications yet.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Leave ID</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(leave => (
                  <tr key={leave._id}>
                    <td><span style={{ fontFamily: 'monospace', color: '#6B7280' }}>{leave.leaveId}</span></td>
                    <td>{leave.leaveType}</td>
                    <td>
                      {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}<br/>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>({leave.duration} days)</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>{new Date(leave.createdAt).toLocaleDateString()}</td>
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
            <div className={styles.modalHeader}>
              <h2>Apply for Leave</h2>
              <button className={styles.closeBtn} onClick={() => setIsLeaveModalOpen(false)} disabled={applyingLeave}>&times;</button>
            </div>
            <form onSubmit={handleApplyLeave}>
              <div className={styles.formContent}>
                <div className={styles.formGroup}>
                  <label>Leave Type</label>
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
                    <label>From Date</label>
                    <input 
                      type="date"
                      className={styles.formInput}
                      value={leaveForm.fromDate}
                      onChange={e => setLeaveForm({...leaveForm, fromDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>To Date</label>
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
                  <label>Reason / Details</label>
                  <textarea 
                    className={styles.formTextarea}
                    placeholder="Briefly explain the reason for your leave..."
                    value={leaveForm.reason}
                    onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}
                    required
                  ></textarea>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsLeaveModalOpen(false)} disabled={applyingLeave}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={applyingLeave}>
                  {applyingLeave ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

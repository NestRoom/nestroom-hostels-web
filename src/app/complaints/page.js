"use client";
import { useState, useEffect } from "react";
import AdminNav from '../components/AdminNav/AdminNav';
import LoadingComponent from "../components/Loading/Loading";
import styles from "./complaints.module.css";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Check, 
  Users, 
  Search,
  Filter,
  Flag
} from 'lucide-react';

export default function ComplaintsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hostelId, setHostelId] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const meRes = await secureFetch('http://localhost:5001/v1/auth/me');
      const meData = await meRes.json();
      const hId = meData.data.user.hostels?.[0]?._id;
      if (!hId) {
        setIsLoading(false);
        return;
      }
      setHostelId(hId);

      const compRes = await secureFetch(`http://localhost:5001/v1/hostels/${hId}/complaints?limit=100`);
      const compData = await compRes.json();
      if (compData.success) {
        setComplaints(compData.data.complaints || []);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = async (complaintId) => {
    if (!confirm("Mark this complaint as resolved?")) return;
    try {
      const res = await secureFetch(`http://localhost:5001/v1/hostels/${hostelId}/complaints/${complaintId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Resolved", remarks: "Resolved by admin" })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error?.message || "Failed to resolve complaint");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (complaintId) => {
    if (!confirm("Are you sure you want to remove this complaint?")) return;
    try {
      const res = await secureFetch(`http://localhost:5001/v1/hostels/${hostelId}/complaints/${complaintId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'Open' || c.status === 'InProgress').length,
    high: complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter === "All") return true;
    if (filter === "Open") return c.status === "Open" || c.status === "InProgress";
    if (filter === "Resolved") return c.status === "Resolved" || c.status === "Closed";
    return true;
  });

  return (
    <div className={styles.container}>
      {isLoading && <LoadingComponent />}
      <AdminNav />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Complaints Desk</h1>
            <p className={styles.subtitle}>Manage, track, and resolve resident grievances with precision.</p>
          </div>
        </header>

        {/* KPI Section */}
        <div className={styles.kpiContainer}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper} style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <MessageSquare size={28} />
            </div>
            <div className={styles.kpiContent}>
              <div className={styles.kpiValue}>{stats.open}</div>
              <div className={styles.kpiTitle}>Active Issues</div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper} style={{ background: '#fef2f2', color: '#ef4444' }}>
              <AlertCircle size={28} />
            </div>
            <div className={styles.kpiContent}>
              <div className={styles.kpiValue} style={{ color: '#ef4444' }}>{stats.high}</div>
              <div className={styles.kpiTitle}>Critical Priority</div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper} style={{ background: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle2 size={28} />
            </div>
            <div className={styles.kpiContent}>
              <div className={styles.kpiValue}>{stats.resolved}</div>
              <div className={styles.kpiTitle}>Resolved Total</div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className={styles.filtersBar}>
          <div className={styles.filterGroup}>
            {['All', 'Open', 'Resolved'].map(f => (
              <button 
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'All' ? 'All Grievances' : f === 'Open' ? 'Active Issues' : 'Resolved'}
              </button>
            ))}
          </div>
        </div>

        {filteredComplaints.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <Flag size={64} strokeWidth={1.5} />
            <p>No grievances found in this category.</p>
          </div>
        ) : (
          <div className={styles.complaintsGrid}>
            {filteredComplaints.map((complaint) => (
              <div key={complaint._id} className={styles.complaintCard}>
                <div className={styles.cardHeader}>
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <h3 className={styles.complaintTitle}>{complaint.title}</h3>
                    <span className={styles.complaintCategory}>{complaint.category}</span>
                  </div>
                  <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles['badgePriority' + (complaint.priority || 'Medium')]}`}>
                      {complaint.priority || 'Medium'}
                    </span>
                    <span className={`${styles.badge} ${styles['badge' + (complaint.status || 'Open')]}`}>
                      {complaint.status || 'Open'}
                    </span>
                  </div>
                </div>

                <p className={styles.complaintDesc}>{complaint.description}</p>

                <div className={styles.residentInfo}>
                  <div className={styles.avatar}>
                    {complaint.residentId?.fullName?.charAt(0) || "R"}
                  </div>
                  <div className={styles.residentDetails}>
                    <span className={styles.residentName}>{complaint.residentId?.fullName || "Resident"}</span>
                    <span className={styles.residentRoom}>
                       {complaint.residentId?.roomId?.roomNumber ? `Room ${complaint.residentId.roomId.roomNumber}` : "RID: " + (complaint.residentId?.residentId || 'N/A')}
                       {complaint.location ? ` • ${complaint.location}` : ""}
                    </span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button 
                    className={styles.btnResolve} 
                    onClick={() => handleResolve(complaint._id)}
                    disabled={complaint.status === "Resolved" || complaint.status === "Closed"}
                  >
                    {complaint.status === "Resolved" || complaint.status === "Closed" ? (
                      <><Check size={20} /> Resolved</>
                    ) : (
                      <><CheckCircle2 size={20} /> Mark Resolved</>
                    )}
                  </button>
                  <button 
                    className={styles.btnDelete}
                    onClick={() => handleDelete(complaint._id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

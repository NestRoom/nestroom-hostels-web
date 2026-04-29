"use client";
import { useState, useEffect } from "react";
import AdminNav from '../components/AdminNav/AdminNav';
import LoadingComponent from "../components/Loading/Loading";
import styles from "./complaints.module.css";
import { secureFetch } from "../utils/auth";

export default function ComplaintsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hostelId, setHostelId] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Get Me to find hostelId
      const meRes = await secureFetch('http://localhost:5001/v1/auth/me');
      const meData = await meRes.json();
      const hId = meData.data.user.hostels?.[0]?._id;
      if (!hId) {
        setIsLoading(false);
        return;
      }
      setHostelId(hId);

      // 2. Fetch Complaints
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
        fetchData(); // Refresh
      } else {
        alert(data.error?.message || "Failed to resolve complaint");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    }
  };

  const handleDelete = async (complaintId) => {
    if (!confirm("Are you sure you want to remove this complaint? This cannot be undone.")) return;
    try {
      const res = await secureFetch(`http://localhost:5001/v1/hostels/${hostelId}/complaints/${complaintId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        fetchData(); // Refresh
      } else {
        alert(data.error?.message || "Failed to remove complaint");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    }
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
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Resident Complaints</h1>
            <p className={styles.subtitle}>Manage and resolve issues reported by residents.</p>
          </div>
          <div className={styles.filters}>
            <select 
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Complaints</option>
              <option value="Open">Open & In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {filteredComplaints.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p>No complaints found.</p>
          </div>
        ) : (
          <div className={styles.complaintsGrid}>
            {filteredComplaints.map((complaint) => (
              <div key={complaint._id} className={styles.complaintCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.complaintTitle}>{complaint.title}</h3>
                    <span className={styles.complaintCategory}>{complaint.category}</span>
                  </div>
                  <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles['badgePriority' + complaint.priority]}`}>
                      {complaint.priority}
                    </span>
                    <span className={`${styles.badge} ${styles['badge' + complaint.status]}`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>

                <p className={styles.complaintDesc}>{complaint.description}</p>

                <div className={styles.residentInfo}>
                  <div className={styles.avatar}>
                    {complaint.residentId?.fullName?.charAt(0) || "R"}
                  </div>
                  <div className={styles.residentDetails}>
                    <span className={styles.residentName}>{complaint.residentId?.fullName || "Unknown Resident"}</span>
                    <span className={styles.residentRoom}>
                       {complaint.residentId?.roomId?.roomNumber ? `Room ${complaint.residentId.roomId.roomNumber}` : "Room Unassigned"}
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {complaint.status === "Resolved" || complaint.status === "Closed" ? "Resolved" : "Mark as Resolved"}
                  </button>
                  <button 
                    className={styles.btnDelete}
                    onClick={() => handleDelete(complaint._id)}
                    title="Remove Complaint"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

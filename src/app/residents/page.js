"use client";

import { useState, useEffect } from "react";
import AdminNav from "../components/AdminNav/AdminNav";
import LoadingComponent from "../components/Loading/Loading";
import styles from "./page.module.css";

export default function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [totalResidents, setTotalResidents] = useState(0);
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const limit = 10;
  
  // KPI Stats
  const [kpis, setKpis] = useState({
    activeResidents: 0,
    occupancyRate: 0,
    newJoinees: 0,
    noticePeriod: 0
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [hostelId, setHostelId] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      // 1. Fetch user to get hostelId
      const meRes = await fetch('http://localhost:5001/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!meRes.ok) throw new Error('Auth failed');
      const { data: meData } = await meRes.json();
      
      const hId = meData.user.hostels?.[0]?._id;
      if (!hId) {
        console.error("No hostelId found in user session.");
        setIsLoading(false);
        return;
      }
      setHostelId(hId);

      // 2. Fetch Rooms/Buildings to check capacity
      const resRooms = await fetch(`http://localhost:5001/v1/hostels/${hId}/rooms`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataRooms = await resRooms.json();
      const buildingsData = dataRooms.data?.buildings || [];
      setBuildings(buildingsData);

      // 3. Fetch Residents
      const resResidents = await fetch(`http://localhost:5001/v1/hostels/${hId}/residents?page=${currentPage}&limit=${limit}&search=${searchQuery}&status=${statusFilter === 'All' ? '' : statusFilter}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataResidents = await resResidents.json();
      
      if (dataResidents.data) {
        setResidents(dataResidents.data.residents || []);
        setTotalResidents(dataResidents.data.pagination?.total || 0);

        // Compute occupancy rate manually
        let totalBeds = 0;
        let occupiedBeds = 0;
        buildingsData.forEach(b => {
          b.floors?.forEach(f => {
            f.rooms?.forEach(r => {
              totalBeds += r.bedCount;
              occupiedBeds += (r.bedCount - (r.availableBeds || 0));
            });
          });
        });
        const occRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

        setKpis({
          activeResidents: dataResidents.data.stats?.activeResidents || 0,
          occupancyRate: occRate,
          newJoinees: dataResidents.data.stats?.newJoinees || 0, 
          noticePeriod: dataResidents.data.stats?.noticePeriod || 0 
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, statusFilter]);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalRoomsCalculated = buildings.reduce((acc, b) => {
    return acc + (b.floors?.reduce((fAcc, f) => fAcc + (f.rooms?.length || 0), 0) || 0);
  }, 0);
  const hasRoomsConfigured = totalRoomsCalculated > 0;

  return (
    <div className={styles.container}>
      {isLoading && <LoadingComponent />}
      <AdminNav />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Residents Directory</h1>
            <p className={styles.subtitle}>Manage and view all residents currently staying at Nestroom.</p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.searchContainer}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Search residents, room..." 
                className={styles.searchInput} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              className={styles.primaryButton}
              onClick={openAddModal}
              disabled={!hasRoomsConfigured}
              title={!hasRoomsConfigured ? "Please setup rooms first" : ""}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Resident
            </button>
          </div>
        </div>

        {(!hasRoomsConfigured && !isLoading) && (
          <div style={{ padding: '1rem 2rem', backgroundColor: '#FEF2F2', color: '#B91C1C', borderRadius: '1rem', marginBottom: '2rem', fontWeight: 700, border: '2px solid #FEE2E2' }}>
            Setup buildings and rooms first to start adding residents.
          </div>
        )}

        <div className={styles.kpiContainer}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Active Residents</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(59, 59, 255, 0.1)', color: '#3b3bff' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
            </div>
            <div className={styles.kpiValue}>{kpis.activeResidents}</div>
            <div className={styles.kpiSubtitle} style={{ color: '#10B981' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              {kpis.occupancyRate}% Occupancy
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>New Joinees</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(59, 59, 255, 0.1)', color: '#3b3bff', fontSize: '0.65rem', fontWeight: 800 }}>NEW</div>
            </div>
            <div className={styles.kpiValue}>{kpis.newJoinees}</div>
            <div className={styles.kpiSubtitle} style={{ color: '#3b3bff' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              This month
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Notice Period</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#F97316' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </div>
            </div>
            <div className={styles.kpiValue}>{kpis.noticePeriod}</div>
            <div className={styles.kpiSubtitle} style={{ color: '#F97316' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Residents leaving
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={styles.tabs}>
              <div 
                className={`${styles.tab} ${statusFilter === 'All' ? styles.active : ''}`}
                onClick={() => setStatusFilter('All')}
              >
                All Residents
              </div>
              <div 
                className={`${styles.tab} ${statusFilter === 'Notice' ? styles.active : ''}`}
                onClick={() => setStatusFilter('Notice')}
              >
                Notice Period
              </div>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>RESIDENT</th>
                <th>ROOM / BED</th>
                <th>JOIN DATE</th>
                <th>FEES</th>
                <th>KYC STATUS</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((resident, idx) => (
                <tr key={resident._id || idx} onClick={() => setSelectedResident(resident)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className={styles.residentInfo}>
                      <div className={styles.avatar}>
                        {resident.fullName ? resident.fullName.charAt(0).toUpperCase() : "R"}
                      </div>
                      <div>
                        <div className={styles.residentName}>{resident.fullName}</div>
                        <div className={styles.residentPhone}>{resident.whatsappNumber || resident.email || "-"}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.residentName}>
                      Room {resident.roomId ? (resident.roomId.roomNumber || resident.roomId) : "N/A"} 
                    </div>
                  </td>
                  <td>
                    <div className={styles.residentPhone}>{formatDate(resident.checkInDate)}</div>
                  </td>
                  <td>
                    <div className={styles.residentName}>₹{resident.feeAmount}</div>
                    <div className={styles.residentPhone} style={{ fontSize: '0.75rem' }}>{resident.feeFrequency}</div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      resident.kyc?.kycStatus === 'Verified' ? styles.statusActive : 
                      resident.kyc?.kycStatus === 'Rejected' ? styles.statusNotice : 
                      styles.statusPending
                    }`} style={{ fontSize: '0.7rem' }}>
                      {resident.kyc?.kycStatus || "Not Set"}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${resident.residentStatus === 'Active' ? styles.statusActive : styles.statusNotice}`}>
                      {resident.residentStatus}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionBtn} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {residents.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "#6B7280" }}>
                    No residents found. Add a resident to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {residents.length > 0 && (
            <div className={styles.pagination}>
              <div className={styles.subtitle}>
                Showing {residents.length} of {totalResidents} residents
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={styles.pageBtn} 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </button>
                <button 
                  className={styles.pageBtn}
                  disabled={residents.length < limit}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {isAddModalOpen && (
          <AddResidentModal 
            isOpen={isAddModalOpen} 
            onClose={closeAddModal} 
            buildings={buildings}
            hostelId={hostelId}
            onSuccess={() => { closeAddModal(); fetchData(); }}
          />
        )}

        {selectedResident && (
          <ResidentDetailModal 
            resident={selectedResident} 
            hostelId={hostelId}
            onClose={() => setSelectedResident(null)}
            onUpdate={() => { setSelectedResident(null); fetchData(); }}
          />
        )}
      </div>
    </div>
  );
}

function ResidentDetailModal({ resident, hostelId, onClose, onUpdate }) {
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [fullScreenImg, setFullScreenImg] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handleKYC = async (action) => {
    if (action === 'reject' && !rejectionReason) {
      if (showRejectInput) {
        alert("Please provide a reason for rejection.");
        return;
      }
      setShowRejectInput(true);
      return;
    }
    
    setProcessing(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:5001/v1/hostels/${hostelId}/residents/${resident._id}/kyc`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          action, 
          rejectionReason: action === 'reject' ? rejectionReason : null 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.data.message);
        onUpdate();
      } else {
        alert(data.error?.message || "Action failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error. Please check if the backend is running.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      {/* Full Screen Image Portal */}
      {fullScreenImg && (
        <div 
          onClick={(e) => { e.stopPropagation(); setFullScreenImg(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <img src={fullScreenImg} alt="FS" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '1rem', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} />
          <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontWeight: 800, cursor: 'pointer' }}>&times;</button>
        </div>
      )}

      <div className={styles.modalContent} style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ margin: 0 }}>Resident Profile Overview</h2>
            <span className={`${styles.statusBadge} ${resident.kyc?.kycStatus === 'Verified' ? styles.statusActive : styles.statusNotice}`} style={{ background: resident.kyc?.kycStatus === 'Verified' ? '#ECFDF5' : '#FFFBEB', color: resident.kyc?.kycStatus === 'Verified' ? '#059669' : '#D97706', fontSize: '0.7rem' }}>
              KYC {resident.kyc?.kycStatus || 'Pending'}
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#111827' }}>&times;</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr' }}>
          {/* Left Panel: Profile & Bio */}
          <div style={{ padding: '2.5rem', borderRight: '1px solid #F1F5F9', background: '#F9FAFB' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div 
                className={styles.avatar} 
                onClick={() => resident.kyc?.profilePhoto && setFullScreenImg(resident.kyc.profilePhoto)}
                style={{ width: '120px', height: '120px', fontSize: '3rem', borderRadius: '2rem', margin: '0 auto 1.5rem', cursor: 'pointer', border: '3px solid white', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
              >
                 {resident.kyc?.profilePhoto ? <img src={resident.kyc.profilePhoto} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (resident.fullName?.charAt(0) || "R")}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{resident.fullName}</h3>
              <p style={{ margin: '0.25rem 0 1rem', color: '#6B7280', fontSize: '0.9rem' }}>{resident.email}</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <span className={`${styles.statusBadge} ${resident.residentStatus === 'Active' ? styles.statusActive : styles.statusNotice}`}>
                  {resident.residentStatus}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', color: '#9CA3AF', letterSpacing: '0.05em' }}>REGISTRATION DETAILS</label>
                <div style={{ marginTop: '0.5rem' }}>
                   <p style={{ margin: '0.25rem 0', fontWeight: 700, fontSize: '0.95rem' }}>ID: {resident.residentId}</p>
                   <p style={{ margin: '0.25rem 0', fontWeight: 600, fontSize: '0.9rem', color: '#3b3bff' }}>Pass: {resident.plainPassword || "********"}</p>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', color: '#9CA3AF', letterSpacing: '0.05em' }}>ROOM ALLOCATION</label>
                <p style={{ margin: '0.5rem 0', fontWeight: 700 }}>Room {resident.roomId?.roomNumber || "N/A"} - Bed {resident.bedId?.bedNumber || "N/A"}</p>
              </div>
              <div className={styles.formGroup}>
                <label style={{ fontSize: '0.7rem', color: '#9CA3AF', letterSpacing: '0.05em' }}>CONTACT</label>
                <p style={{ margin: '0.5rem 0', fontWeight: 700 }}>{resident.whatsappNumber || "N/A"}</p>
                <p style={{ margin: '0.15rem 0', fontSize: '0.8rem', color: '#64748b' }}>Joined: {formatDate(resident.checkInDate)}</p>
              </div>
            </div>
          </div>

          {/* Right Panel: KYC & Activity */}
          <div style={{ padding: '2.5rem' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                  <h4 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      KYC Documentation
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div 
                        onClick={() => resident.idCardPhoto && setFullScreenImg(resident.idCardPhoto)}
                        style={{ cursor: 'pointer', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '1.25rem', padding: '1rem', transition: 'all 0.2s' }}
                      >
                          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B7280', marginBottom: '0.75rem', textAlign: 'center' }}>KYC DOCUMENT</p>
                          <div style={{ height: '160px', borderRadius: '0.75rem', overflow: 'hidden', background: '#F8FAFB', border: '1px solid #eee' }}>
                             {resident.idCardPhoto ? <img src={resident.idCardPhoto} alt="Aadhaar" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.7rem' }}>No Image provided</div>}
                          </div>
                      </div>
                      <div 
                        onClick={() => resident.kyc?.collegeIdPhoto && setFullScreenImg(resident.kyc.collegeIdPhoto)}
                        style={{ cursor: 'pointer', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '1.25rem', padding: '1rem', transition: 'all 0.2s' }}
                      >
                          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B7280', marginBottom: '0.75rem', textAlign: 'center' }}>COLLEGE ID CARD</p>
                          <div style={{ height: '160px', borderRadius: '0.75rem', overflow: 'hidden', background: '#F8FAFB', border: '1px solid #eee' }}>
                             {resident.kyc?.collegeIdPhoto ? <img src={resident.kyc.collegeIdPhoto} alt="College" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.7rem' }}>No Image provided</div>}
                          </div>
                      </div>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '1rem', textAlign: 'center' }}>Tip: Click an image to view it in full screen.</p>
              </div>

              {resident.kyc?.kycStatus === 'Pending' && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '1.5rem', padding: '1.75rem', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.05)' }}>
                   <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: '#F59E0B', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>!</div>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#92400E' }}>Verification Awaited</h5>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#B45309' }}>Please review the documents above before making a decision.</p>
                      </div>
                   </div>
                   
                   {showRejectInput && (
                     <div style={{ marginBottom: '1.25rem' }}>
                        <textarea 
                          placeholder="Provide a reason for rejection (this will be shown to the student)..." 
                          style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: '2px solid #FED7AA', fontSize: '0.9rem', outline: 'none', background: 'white', minHeight: '100px' }}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                     </div>
                   )}

                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={() => handleKYC('approve')} 
                        disabled={processing}
                        className={styles.submitBtn} 
                        style={{ flex: 1, padding: '1rem', fontSize: '0.95rem' }}
                      >
                        {processing ? 'Processing...' : 'Approve KYC'}
                      </button>
                      <button 
                        onClick={() => handleKYC('reject')}
                        disabled={processing}
                        className={styles.secondaryBtn} 
                        style={{ flex: 1, border: '2px solid #F87171', color: '#F87171', borderRadius: '1rem' }}
                      >
                        {showRejectInput ? 'Confirm Rejection' : 'Reject KYC'}
                      </button>
                   </div>
                </div>
              )}

              {resident.kyc?.kycStatus === 'Verified' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#059669', background: '#F0FDF4', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #DCFCE7' }}>
                   <div style={{ background: '#10B981', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</div>
                   <div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>Documents Verified</p>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', opacity: 0.8 }}>Verification completed on {formatDate(resident.kyc.kycVerifiedAt)}</p>
                   </div>
                </div>
              )}

              {resident.kyc?.kycStatus === 'Rejected' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#DC2626', background: '#FEF2F2', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #FEE2E2' }}>
                   <div style={{ background: '#EF4444', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</div>
                   <div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>KYC Rejected</p>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', opacity: 0.9 }}>Reason: {resident.kyc.rejectionReason}</p>
                   </div>
                </div>
              )}
          </div>
        </div>
        <div className={styles.modalFooter} style={{ borderTop: '1px solid #F3F4F6' }}>
           <button className={styles.secondaryBtn} onClick={onClose} style={{ border: 'none', background: 'transparent' }}>Return to Directory</button>
        </div>
      </div>
    </div>
  );
}

function AddResidentModal({ isOpen, onClose, buildings, hostelId, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "", email: "", whatsappNumber: "", dateOfBirth: "",
    gender: "", idCardType: "Aadhaar", idCardNumber: "",
    collegeIdNumber: "",
    roomId: "", bedId: "", feeAmount: "", feeFrequency: "Monthly",
    checkInDate: "", foodEnabled: false, securityDeposit: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  let allRooms = [];
  buildings.forEach(b => {
    if (b.floors) {
      b.floors.forEach(f => {
        if (f.rooms) {
          f.rooms.forEach(r => {
            allRooms.push({ ...r, buildingName: b.buildingName || b.buildingId });
          });
        }
      });
    }
  });

  const selectedRoom = allRooms.find(r => String(r._id) === String(formData.roomId));
  const availableBeds = selectedRoom ? selectedRoom.beds?.filter(b => b.bedStatus === "Vacant") || [] : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("accessToken");

      // Format phone to E.164 (+91XXXXXXXXXX)
      let phone = formData.whatsappNumber.replace(/\s+/g, '');
      if (!phone.startsWith('+')) {
        phone = '+91' + phone.replace(/^0+/, '');
      }

      // Convert empty strings to null for optional fields so Joi validation passes
      const cleanValue = (v) => (v === "" || v === undefined ? null : v);

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        whatsappNumber: phone,
        dateOfBirth: cleanValue(formData.dateOfBirth),
        gender: cleanValue(formData.gender),
        idCardType: cleanValue(formData.idCardType),
        idCardNumber: cleanValue(formData.idCardNumber),
        enrollmentNumber: cleanValue(formData.collegeIdNumber),
        roomId: formData.roomId,
        bedId: formData.bedId,
        feeAmount: Number(formData.feeAmount) || 0,
        feeFrequency: formData.feeFrequency,
        checkInDate: cleanValue(formData.checkInDate),
        foodEnabled: formData.foodEnabled,
        securityDeposit: Number(formData.securityDeposit) || 0,
        securityDepositPaid: false,
      };

      const res = await fetch(`http://localhost:5001/v1/hostels/${hostelId}/residents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success === true) {
        alert(`Resident Added! Credentials sent to ${formData.email}.\nTemp Password: ${data.data?.temporaryPassword || '(check email)'}`);
        onSuccess();
      } else {
        // Show detailed validation errors if available
        const details = data.error?.details?.map(e => `${e.field}: ${e.message}`).join('\n') || '';
        setErrorMsg((data.error?.message || "Failed to add resident.") + (details ? '\n' + details : ''));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add New Resident</h2>
          <button className={styles.closeBtn} onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9CA3AF' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {errorMsg && <div style={{ padding: '1rem 2.5rem', color: '#991B1B', backgroundColor: '#FEF2F2', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'pre-wrap', borderBottom: '2px solid #FECACA' }}>{errorMsg}</div>}
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label>College ID Card Number</label>
              <input required type="text" name="collegeIdNumber" value={formData.collegeIdNumber} onChange={handleChange} className={styles.formInput} placeholder="Enter College enrollment / ID number" />
            </div>

            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={styles.formInput} placeholder="Enter full name" />
            </div>
            
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className={styles.formInput} placeholder="name@example.com" />
            </div>

            <div className={styles.formGroup}>
              <label>WhatsApp Number</label>
              <input required type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className={styles.formInput} placeholder="e.g. 9876543210 (auto adds +91)" />
            </div>

            <div className={styles.formGroup}>
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={styles.formInput}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>KYC Document Type</label>
              <select name="idCardType" value={formData.idCardType} onChange={handleChange} className={styles.formInput}>
                <option value="">Select Type</option>
                <option value="Aadhaar">Aadhaar (Recommended)</option>
                <option value="PAN">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>KYC Document Number</label>
              <input required type="text" name="idCardNumber" value={formData.idCardNumber} onChange={handleChange} className={styles.formInput} placeholder="Enter document number" />
            </div>

            <div className={styles.formGroup}>
              <label>Assign Room</label>
              <select required name="roomId" value={formData.roomId} onChange={handleChange} className={styles.formInput}>
                <option value="">Select Room</option>
                {allRooms.map(room => (
                  <option 
                    key={room._id} 
                    value={room._id} 
                    disabled={room.availableBeds === 0}
                    style={{ color: room.availableBeds === 0 ? '#9CA3AF' : 'inherit' }}
                  >
                    {room.buildingName} - Room {room.roomNumber} ({room.availableBeds || 0} left) {room.availableBeds === 0 ? "— FULL" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Assign Bed</label>
              <select required name="bedId" value={formData.bedId} onChange={handleChange} className={styles.formInput} disabled={!formData.roomId}>
                <option value="">Select Bed</option>
                {availableBeds.map(bed => (
                  <option key={bed._id} value={bed._id}>
                    Bed {bed.bedNumber} {bed.bedPosition && bed.bedPosition !== "Other" ? `(${bed.bedPosition})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Monthly Fees (INR)</label>
              <input required type="number" name="feeAmount" value={formData.feeAmount} onChange={handleChange} className={styles.formInput} placeholder="e.g. 8000" />
            </div>

            <div className={styles.formGroup}>
              <label>Payment Cycle</label>
              <select name="feeFrequency" value={formData.feeFrequency} onChange={handleChange} className={styles.formInput}>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Check-in Date</label>
              <input required type="date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} className={styles.formInput} />
            </div>

            <div className={styles.formGroup} style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontWeight: 600 }}>
                <input type="checkbox" name="foodEnabled" checked={formData.foodEnabled} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem' }} />
                Enable Food Mess
              </label>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.secondaryBtn} disabled={loading}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Allocating..." : "Allocate Bed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

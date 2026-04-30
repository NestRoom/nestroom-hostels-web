'use client';

import { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ChevronDown, 
  MoreHorizontal, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Building2,
  Phone,
  Mail,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  X,
  FileText,
  User,
  CheckCircle2,
  Clock
} from 'lucide-react';
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
  const [buildingFilter, setBuildingFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [kycFilter, setKycFilter] = useState("All");
  const limit = 10;
  
  const [kpis, setKpis] = useState({
    activeResidents: 0,
    occupancyRate: 0,
    newJoinees: 0,
    overduePayments: 0
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [hostelId, setHostelId] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const meRes = await fetch('http://localhost:5001/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { data: meData } = await meRes.json();
      const hId = meData.user.hostels?.[0]?._id;
      if (!hId) return;
      setHostelId(hId);

      const resRooms = await fetch(`http://localhost:5001/v1/hostels/${hId}/rooms`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataRooms = await resRooms.json();
      const bData = dataRooms.data?.buildings || [];
      setBuildings(bData);

      const resResidents = await fetch(`http://localhost:5001/v1/hostels/${hId}/residents?page=${currentPage}&limit=${limit}&search=${searchQuery}&status=${statusFilter === 'All' ? '' : statusFilter}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataResidents = await resResidents.json();
      
      if (dataResidents.data) {
        const resList = dataResidents.data.residents || [];
        setResidents(resList);
        setTotalResidents(dataResidents.data.pagination?.total || 0);

        // Stats calculation
        let totalBeds = 0;
        let occupiedBeds = 0;
        bData.forEach(b => {
          b.floors?.forEach(f => {
            f.rooms?.forEach(r => {
              totalBeds += r.bedCount;
              occupiedBeds += (r.bedCount - (r.availableBeds || 0));
            });
          });
        });
        
        const overdueCount = resList.filter(r => new Date(r.nextDueDate) < new Date()).length;

        setKpis({
          activeResidents: dataResidents.data.stats?.activeResidents || 0,
          occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
          newJoinees: dataResidents.data.stats?.newJoinees || 0, 
          overduePayments: overdueCount
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
  }, [currentPage, searchQuery, statusFilter]);

  const filteredResidents = useMemo(() => {
    return residents.filter(r => {
      const bMatch = buildingFilter === "All" || r.buildingId === buildingFilter;
      const kMatch = kycFilter === "All" || r.kyc?.kycStatus === kycFilter;
      const isOverdue = new Date(r.nextDueDate) < new Date();
      const pMatch = paymentFilter === "All" || (paymentFilter === "Paid" ? !isOverdue : isOverdue);
      return bMatch && kMatch && pMatch;
    });
  }, [residents, buildingFilter, kycFilter, paymentFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className={styles.container}>
      {isLoading && <LoadingComponent text="Updating Residents Matrix..." />}
      <AdminNav />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Residents Ledger</h1>
            <p className={styles.subtitle}>Manage resident lifecycles, KYC compliance, and fee reconciliation.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.primaryButton} onClick={() => setIsAddModalOpen(true)}>
              <UserPlus size={20} />
              <span>Onboard Resident</span>
            </button>
          </div>
        </div>

        <div className={styles.kpiContainer}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}>
              <Users size={24} color="white" />
            </div>
            <div className={styles.kpiContent}>
              <div className={styles.kpiValue}>{kpis.activeResidents}</div>
              <div className={styles.kpiLabel}>
                <span className={styles.kpiTitle}>Active Residents</span>
                <span className={styles.kpiSubtitle}>{kpis.occupancyRate}% Occupancy</span>
              </div>
            </div>
          </div>
          
          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <TrendingUp size={24} color="white" />
            </div>
            <div className={styles.kpiContent}>
              <div className={styles.kpiValue}>{kpis.newJoinees}</div>
              <div className={styles.kpiLabel}>
                <span className={styles.kpiTitle}>New Joinees</span>
                <span className={styles.kpiSubtitle}>Current Month</span>
              </div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <CreditCard size={24} color="white" />
            </div>
            <div className={styles.kpiContent}>
              <div className={styles.kpiValue}>{kpis.overduePayments}</div>
              <div className={styles.kpiLabel}>
                <span className={styles.kpiTitle}>Overdue Fees</span>
                <span className={styles.kpiSubtitle}>Action Required</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.filtersBar}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by name, room or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className={styles.filtersGroup}>
            <div className={styles.filterItem}>
              <Building2 size={16} />
              <select value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}>
                <option value="All">All Buildings</option>
                {buildings.map(b => <option key={b._id} value={b._id}>{b.buildingName}</option>)}
              </select>
            </div>

            <div className={styles.filterItem}>
              <CreditCard size={16} />
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className={styles.filterItem}>
              <ShieldCheck size={16} />
              <select value={kycFilter} onChange={(e) => setKycFilter(e.target.value)}>
                <option value="All">All KYC</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.residentsTable}>
            <thead>
              <tr>
                <th>Resident</th>
                <th>Room Info</th>
                <th>Joining Date</th>
                <th>Monthly Fee</th>
                <th>Fee Status</th>
                <th>KYC Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.map((resident) => {
                const isOverdue = new Date(resident.nextDueDate) < new Date();
                return (
                  <tr key={resident._id} onClick={() => setSelectedResident(resident)}>
                    <td>
                      <div className={styles.residentProfile}>
                        <div className={styles.residentAvatar}>
                          {resident.kyc?.profilePhoto ? (
                            <img src={resident.kyc.profilePhoto} alt="" />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div className={styles.residentDetails}>
                          <span className={styles.resName}>{resident.fullName}</span>
                          <span className={styles.resContact}>{resident.whatsappNumber || resident.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.roomBadge}>
                        <span className={styles.roomNum}>Room {resident.roomId?.roomNumber || 'N/A'}</span>
                        <span className={styles.bedNum}>Bed {resident.bedId?.bedNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className={styles.dateCell}>{formatDate(resident.checkInDate)}</td>
                    <td>
                      <div className={styles.feeInfo}>
                        <span className={styles.feeAmount}>₹{resident.feeAmount?.toLocaleString()}</span>
                        <span className={styles.feeCycle}>{resident.feeFrequency}</span>
                      </div>
                    </td>
                    <td>
                      <div className={`${styles.statusBadge} ${isOverdue ? styles.overdue : styles.paid}`}>
                        {isOverdue ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                        <span>{isOverdue ? 'Overdue' : 'Paid'}</span>
                      </div>
                    </td>
                    <td>
                      <div className={`${styles.kycBadge} ${styles[resident.kyc?.kycStatus?.toLowerCase() || 'pending']}`}>
                        <span>{resident.kyc?.kycStatus || 'Pending'}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.iconBtn}><MoreHorizontal size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredResidents.length === 0 && (
                <tr>
                  <td colSpan="7" className={styles.emptyState}>
                    <div className={styles.emptyIcon}><Users size={48} /></div>
                    <p>No residents found matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              Showing {filteredResidents.length} of {totalResidents} residents
            </span>
            <div className={styles.paginationBtns}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={20} /></button>
              <button disabled={residents.length < limit} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddResidentModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          buildings={buildings}
          hostelId={hostelId}
          onSuccess={() => { setIsAddModalOpen(false); fetchData(); }}
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
  );
}

function ResidentDetailModal({ resident, hostelId, onClose, onUpdate }) {
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleKYC = async (action) => {
    if (action === 'reject' && !rejectionReason && !showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    setProcessing(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:5001/v1/hostels/${hostelId}/residents/${resident._id}/kyc`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ action, rejectionReason })
      });
      const data = await res.json();
      if (data.success) onUpdate();
      else alert(data.error?.message || "Action failed.");
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.detailModal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGrp}>
            <div className={styles.modalIcon}><User size={24} /></div>
            <div>
              <h3>Resident Dossier</h3>
              <p>Comprehensive resident profile & compliance</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.detailGrid}>
            <div className={styles.detailPanel}>
              <div className={styles.profileSection}>
                <div className={styles.largeAvatar}>
                  {resident.kyc?.profilePhoto ? <img src={resident.kyc.profilePhoto} alt="" /> : <User size={48} />}
                </div>
                <div className={styles.profileMeta}>
                  <h4>{resident.fullName}</h4>
                  <p>{resident.email}</p>
                  <div className={styles.statusChips}>
                    <span className={styles.activeChip}>{resident.residentStatus}</span>
                    <span className={styles.idChip}>ID: {resident.residentId}</span>
                  </div>
                </div>
              </div>

              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <Phone size={16} />
                  <span>{resident.whatsappNumber || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                  <Calendar size={16} />
                  <span>Joined {new Date(resident.checkInDate).toLocaleDateString()}</span>
                </div>
                <div className={styles.infoItem}>
                  <Building2 size={16} />
                  <span>Room {resident.roomId?.roomNumber} • Bed {resident.bedId?.bedNumber}</span>
                </div>
              </div>
            </div>

            <div className={styles.kycPanel}>
              <div className={styles.sectionHeader}>
                <ShieldCheck size={18} />
                <span>KYC Documentation</span>
              </div>
              
              <div className={styles.documentGrid}>
                <div className={styles.docCard}>
                  <p>National ID Card</p>
                  <div className={styles.docPreview}>
                    {resident.idCardPhoto ? <img src={resident.idCardPhoto} alt="" /> : <div className={styles.docEmpty}>No image</div>}
                  </div>
                </div>
                <div className={styles.docCard}>
                  <p>College ID</p>
                  <div className={styles.docPreview}>
                    {resident.kyc?.collegeIdPhoto ? <img src={resident.kyc.collegeIdPhoto} alt="" /> : <div className={styles.docEmpty}>No image</div>}
                  </div>
                </div>
              </div>

              {resident.kyc?.kycStatus === 'Pending' && (
                <div className={styles.kycActions}>
                  {showRejectInput && (
                    <textarea 
                      placeholder="Reason for rejection..." 
                      className={styles.rejectArea}
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                    />
                  )}
                  <div className={styles.btnGrp}>
                    <button className={styles.approveBtn} onClick={() => handleKYC('approve')} disabled={processing}>Approve KYC</button>
                    <button className={styles.rejectBtn} onClick={() => handleKYC('reject')} disabled={processing}>
                      {showRejectInput ? 'Confirm Reject' : 'Reject KYC'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddResidentModal({ isOpen, onClose, buildings, hostelId, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "", email: "", whatsappNumber: "", roomId: "", bedId: "", 
    feeAmount: "", feeFrequency: "Monthly", checkInDate: "",
    gender: "Male", idCardType: "Aadhaar", idCardNumber: "",
    dateOfBirth: "", collegeIdNumber: "", securityDeposit: "", foodEnabled: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      // Format phone to E.164 if needed (simple check)
      let phone = formData.whatsappNumber;
      if (phone && !phone.startsWith('+')) phone = '+91' + phone;

      const payload = {
        ...formData,
        whatsappNumber: phone,
        feeAmount: Number(formData.feeAmount),
        securityDeposit: Number(formData.securityDeposit) || 0,
        enrollmentNumber: formData.collegeIdNumber // Backend expects enrollmentNumber
      };

      const res = await fetch(`http://localhost:5001/v1/hostels/${hostelId}/residents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) onSuccess();
      else alert(data.error?.message || "Failed to onboard resident");
    } catch (err) {
      console.error(err);
      alert("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const allRooms = useMemo(() => {
    const list = [];
    buildings.forEach(b => {
      b.floors?.forEach(f => {
        f.rooms?.forEach(r => list.push({ ...r, bName: b.buildingName }));
      });
    });
    return list;
  }, [buildings]);

  const availableBeds = useMemo(() => {
    const room = allRooms.find(r => r._id === formData.roomId);
    return room?.beds?.filter(b => b.bedStatus === "Vacant") || [];
  }, [allRooms, formData.roomId]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.onboardModal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGrp}>
            <div className={styles.modalIcon}><UserPlus size={24} /></div>
            <div>
              <h3>Onboard Resident</h3>
              <p>Initialize a new resident profile and room allocation</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            {/* --- Personal Information --- */}
            <div className={styles.sectionDivider}>Personal Information</div>
            
            <div className={styles.field}>
              <label>Full Name</label>
              <input required type="text" placeholder="John Doe" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className={styles.field}>
              <label>Email Address</label>
              <input required type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className={styles.field}>
              <label>WhatsApp Number</label>
              <input required type="text" placeholder="9876543210" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} />
            </div>
            <div className={styles.field}>
              <label>Date of Birth</label>
              <input type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
            </div>
            <div className={styles.field}>
              <label>Gender</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>College ID / Enrollment</label>
              <input type="text" placeholder="ENR-2024-..." value={formData.collegeIdNumber} onChange={e => setFormData({...formData, collegeIdNumber: e.target.value})} />
            </div>

            {/* --- Identity & Compliance --- */}
            <div className={styles.sectionDivider}>Identity & Compliance</div>
            
            <div className={styles.field}>
              <label>ID Document Type</label>
              <select value={formData.idCardType} onChange={e => setFormData({...formData, idCardType: e.target.value})}>
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="DL">Driving License</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>ID Document Number</label>
              <input required type="text" placeholder="Enter number" value={formData.idCardNumber} onChange={e => setFormData({...formData, idCardNumber: e.target.value})} />
            </div>

            {/* --- Room Allocation --- */}
            <div className={styles.sectionDivider}>Room Allocation</div>
            
            <div className={styles.field}>
              <label>Select Room</label>
              <select required value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})}>
                <option value="">Choose Room</option>
                {allRooms.map(r => <option key={r._id} value={r._id}>{r.bName} - Room {r.roomNumber}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Select Bed</label>
              <select required value={formData.bedId} onChange={e => setFormData({...formData, bedId: e.target.value})} disabled={!formData.roomId}>
                <option value="">Choose Bed</option>
                {availableBeds.map(b => <option key={b._id} value={b._id}>Bed {b.bedNumber}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Check-in Date</label>
              <input required type="date" value={formData.checkInDate} onChange={e => setFormData({...formData, checkInDate: e.target.value})} />
            </div>

            {/* --- Billing & Preferences --- */}
            <div className={styles.sectionDivider}>Billing & Preferences</div>
            
            <div className={styles.field}>
              <label>Monthly Fee (INR)</label>
              <input required type="number" placeholder="8500" value={formData.feeAmount} onChange={e => setFormData({...formData, feeAmount: e.target.value})} />
            </div>
            <div className={styles.field}>
              <label>Fee Cycle</label>
              <select value={formData.feeFrequency} onChange={e => setFormData({...formData, feeFrequency: e.target.value})}>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Security Deposit (INR)</label>
              <input type="number" placeholder="5000" value={formData.securityDeposit} onChange={e => setFormData({...formData, securityDeposit: e.target.value})} />
            </div>
            <div className={styles.field} style={{ gridColumn: 'span 2' }}>
              <div 
                className={styles.switchWrapper} 
                onClick={() => setFormData({...formData, foodEnabled: !formData.foodEnabled})}
              >
                <div className={`${styles.switch} ${formData.foodEnabled ? styles.active : ''}`}>
                  <div className={styles.switchHandle}></div>
                </div>
                <span className={styles.switchLabel}>Enable Food Mess Plan</span>
              </div>
            </div>
          </div>
          
          <div className={styles.formFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Processing...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

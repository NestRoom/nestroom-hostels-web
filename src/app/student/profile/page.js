"use client";

import { useState, useEffect } from "react";
import styles from "./profile.module.css";
import { secureFetch } from "../../utils/auth";
import Loading from "../../components/Loading/Loading";

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [files, setFiles] = useState({
    profilePhoto: null,
    aadhaarPhoto: null,
    collegeIdPhoto: null
  });
  const [previews, setPreviews] = useState({
    profilePhoto: null,
    aadhaarPhoto: null,
    collegeIdPhoto: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await secureFetch("http://localhost:5001/v1/residents/profile");
      const data = await res.json();
      if (data.success) {
        setResident(data.data.resident);
        if (data.data.resident.kyc) {
          setPreviews({
            profilePhoto: data.data.resident.kyc.profilePhoto,
            aadhaarPhoto: data.data.resident.kyc.aadhaarPhoto,
            collegeIdPhoto: data.data.resident.kyc.collegeIdPhoto
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    if (files.profilePhoto) formData.append("profilePhoto", files.profilePhoto);
    if (files.aadhaarPhoto) formData.append("aadhaarPhoto", files.aadhaarPhoto);
    if (files.collegeIdPhoto) formData.append("collegeIdPhoto", files.collegeIdPhoto);

    try {
      const res = await secureFetch("http://localhost:5001/v1/residents/kyc-upload", {
        method: "POST",
        body: formData, // secureFetch handles multipart/form-data when body is FormData
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "KYC documents uploaded successfully!" });
        fetchProfile();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to upload documents." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred during upload." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <Loading />
      <p style={{ marginTop: '2rem', fontWeight: 850, color: '#94a3b8', fontSize: '1.1rem' }}>Establishing secure connection...</p>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.profileWrapper}>
        <header className={styles.header}>
           <h1 className={styles.title}>Resident Identity</h1>
           <p className={styles.subtitle}>Manage your digital profile and verification documents.</p>
        </header>

        <section className={styles.heroCard}>
          <img 
            src={previews.profilePhoto || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + resident?.fullName} 
            className={styles.mainPhoto} 
            alt="Profile" 
          />
          <div className={styles.heroInfo}>
            <h2 className={styles.heroName}>{resident?.fullName}</h2>
            <div className={styles.heroId}>{resident?.residentId}</div>
            
            <div className={`${styles.statusBanner} ${
              resident?.kyc?.kycStatus === 'Verified' ? styles.verifiedBanner : 
              resident?.kyc?.kycStatus === 'Rejected' ? styles.rejectedBanner : 
              styles.pendingBanner
            }`}>
              {resident?.kyc?.kycStatus === 'Verified' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              )}
              {resident?.kyc?.kycStatus || 'Verification Required'}
            </div>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Basic Details</h3>
            <div className={styles.infoCard}>
              <div className={styles.infoItem}>
                 <span className={styles.label}>Official Email</span>
                 <span className={styles.value}>{resident?.email}</span>
              </div>
              <div className={styles.infoItem}>
                 <span className={styles.label}>Contact Number</span>
                 <span className={styles.value}>{resident?.whatsappNumber || "Not Linked"}</span>
              </div>
              <div className={styles.infoItem}>
                 <span className={styles.label}>Current Resident At</span>
                 <span className={styles.value}>{resident?.hostelId?.hostelName || "Awaiting Allocation"}</span>
              </div>
              <div className={styles.infoItem}>
                 <span className={styles.label}>Member Since</span>
                 <span className={styles.value}>{resident?.joinedAt ? new Date(resident.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : "—"}</span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>KYC Verification</h3>
            
            {resident?.kyc?.kycStatus === 'Rejected' && (
              <div className={styles.rejectionAlert}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div>
                  <h4>Verification Rejected</h4>
                  <p>{resident.kyc.rejectionReason || "Please re-upload clear and valid documents."}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.uploadGrid}>
                <div className={styles.uploadItem}>
                  <label>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Profile Photo
                  </label>
                  <div className={styles.docBox}>
                    {previews.profilePhoto ? (
                      <img src={previews.profilePhoto} alt="Profile" />
                    ) : (
                      <div className={styles.placeholder}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>UPLOAD IMAGE</span>
                      </div>
                    )}
                    <input type="file" onChange={(e) => handleFileChange(e, 'profilePhoto')} accept="image/*" />
                  </div>
                </div>

                <div className={styles.uploadItem}>
                  <label>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                    Aadhaar (Front)
                  </label>
                  <div className={styles.docBox}>
                    {previews.aadhaarPhoto ? (
                      <img src={previews.aadhaarPhoto} alt="Aadhaar" />
                    ) : (
                      <div className={styles.placeholder}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>UPLOAD DOC</span>
                      </div>
                    )}
                    <input type="file" onChange={(e) => handleFileChange(e, 'aadhaarPhoto')} accept="image/*" />
                  </div>
                </div>

                <div className={styles.uploadItem}>
                  <label>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    College Identity
                  </label>
                  <div className={styles.docBox}>
                    {previews.collegeIdPhoto ? (
                      <img src={previews.collegeIdPhoto} alt="College ID" />
                    ) : (
                      <div className={styles.placeholder}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>UPLOAD ID</span>
                      </div>
                    )}
                    <input type="file" onChange={(e) => handleFileChange(e, 'collegeIdPhoto')} accept="image/*" />
                  </div>
                </div>
              </div>

              {resident?.kyc?.kycStatus !== 'Verified' && (
                <button 
                  type="submit" 
                  className={styles.submitBtn} 
                  disabled={submitting || resident?.kyc?.kycStatus === 'Pending'}
                >
                  {submitting ? "Establishing Connection..." : 
                   resident?.kyc?.kycStatus === 'Pending' ? "Under Verification Review" : 
                   resident?.kyc?.kycStatus === 'Rejected' ? "Re-submit for Approval" : 
                   "Complete Verification"}
                </button>
              )}
            </form>
          </section>
        </div>
      </div>

      {message && (
        <div className={`${styles.toast} ${message.type === 'success' ? styles.successToast : styles.errorToast}`}>
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

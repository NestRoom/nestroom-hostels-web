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

  if (loading) return <Loading text="Loading profile..." />;

  return (
    <div className={styles.container}>
      <div className={styles.profileWrapper}>
        <header className={styles.header}>
           <h1 className={styles.title}>My Profile & KYC</h1>
           <p className={styles.subtitle}>Complete your verification to access all hostel features.</p>
        </header>

        <section className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Basic Information</span>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
               <span className={styles.label}>Full Name</span>
               <span className={styles.value}>{resident?.fullName}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Resident ID</span>
               <span className={styles.value}>{resident?.residentId}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Email Address</span>
               <span className={styles.value}>{resident?.email}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Phone</span>
               <span className={styles.value}>{resident?.whatsappNumber || "N/A"}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Hostel / Project</span>
               <span className={styles.value}>{resident?.hostelId?.hostelName || "N/A"}</span>
            </div>
            <div className={styles.infoItem}>
               <span className={styles.label}>Check-in Date</span>
               <span className={styles.value}>{resident?.joinedAt ? new Date(resident.joinedAt).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardTitle}>
            <span>Onboarding Documents</span>
            <span className={`${styles.statusIndicator} ${styles[resident?.kyc?.kycStatus?.toLowerCase() || 'pending']}`}>
              {resident?.kyc?.kycStatus || 'Not Submitted'}
            </span>
          </div>

          {resident?.kyc?.kycStatus === 'Rejected' && (
            <div className={styles.rejectionAlert}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <strong>Verification Rejected:</strong> {resident.kyc.rejectionReason || "Please re-upload clear documents."}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.uploadGrid}>
              <div className={styles.uploadItem}>
                <label>Profile Photo</label>
                <div className={styles.photoBox}>
                  {previews.profilePhoto ? (
                    <img src={previews.profilePhoto} alt="Profile" />
                  ) : (
                    <div className={styles.placeholder}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                  )}
                  <input type="file" onChange={(e) => handleFileChange(e, 'profilePhoto')} accept="image/*" />
                </div>
              </div>

              <div className={styles.uploadItem}>
                <label>Aadhaar (Front)</label>
                <div className={styles.docBox}>
                  {previews.aadhaarPhoto ? (
                    <img src={previews.aadhaarPhoto} alt="Aadhaar" />
                  ) : (
                    <div className={styles.placeholder}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                    </div>
                  )}
                  <input type="file" onChange={(e) => handleFileChange(e, 'aadhaarPhoto')} accept="image/*" />
                </div>
              </div>

              <div className={styles.uploadItem}>
                <label>College ID</label>
                <div className={styles.docBox}>
                  {previews.collegeIdPhoto ? (
                    <img src={previews.collegeIdPhoto} alt="College ID" />
                  ) : (
                    <div className={styles.placeholder}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
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
                {submitting ? "Processing Upload..." : 
                 resident?.kyc?.kycStatus === 'Pending' ? "Under Review" : 
                 resident?.kyc?.kycStatus === 'Rejected' ? "Re-submit for Verification" : 
                 "Submit for Verification"}
              </button>
            )}

            {resident?.kyc?.kycStatus === 'Verified' && (
              <div className={styles.verifiedSuccess}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Your profile is verified. Enjoy your stay!
              </div>
            )}
          </form>

          {message && (
            <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
              {message.text}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

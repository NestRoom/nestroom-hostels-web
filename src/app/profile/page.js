"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar/Sidebar';
import Loading from '../components/Loading/Loading';
import styles from './page.module.css';

const LocationPicker = dynamic(() => import('../components/Map/LocationPicker'), { 
  ssr: false, 
  loading: () => <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100%',background:'#F3F4F6',color:'#6B7280',fontSize:'0.9rem',fontWeight:500}}>Loading Map Engine...</div> 
});

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    profilePhoto: 'https://i.pravatar.cc/150?img=11', // default fallback
    completionPercentage: 0,
    hasTwoFactor: false,
    hostels: [] // array of hostels
  });

  // Protect route & Fetch user details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('http://localhost:5001/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
          if (res.status === 401) router.push('/login');
          throw new Error('Failed to fetch profile');
        }

        const { data } = await res.json();
        const { user } = data;
        
        let completionPercentage = 0;
        let fetchedHostels = user.hostels || [];

        // Formatting each hostel for the form
        const formattedHostels = await Promise.all(fetchedHostels.map(async (hostelObj) => {
          let pComp = 0;
          try {
            const compRes = await fetch(`http://localhost:5001/v1/hostels/${hostelObj._id}/profile-completion`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (compRes.ok) {
              const compData = await compRes.json();
              pComp = compData.data?.overallCompletion || 0;
            }
          } catch (e) {
            console.error("Failed completion", e);
          }

          let addressVal = hostelObj.city || '';
          if (hostelObj.location?.coordinates && hostelObj.location.coordinates.length === 2) {
            addressVal = `${hostelObj.location.coordinates[1]}, ${hostelObj.location.coordinates[0]}`;
          }

          return {
            _id: hostelObj._id,
            hostelName: hostelObj.hostelName || '',
            hostelId: hostelObj.hostelCode || '',
            address: addressVal,
            bankAccountName: hostelObj.bankDetails?.accountName || '',
            bankAccountNumber: hostelObj.bankDetails?.accountNumber || '',
            ifscCode: hostelObj.bankDetails?.ifscCode || '',
            completion: pComp,
            city: hostelObj.city || ''
          };
        }));

        if (formattedHostels.length > 0) {
          completionPercentage = formattedHostels[0].completion; // Using first hostel completion for top badge
        }

        setProfileData({
          fullName: user.fullName || '',
          email: user.email || '',
          mobile: user.whatsappNumber || '',
          profilePhoto: user.profilePhoto || 'https://i.pravatar.cc/150?img=11',
          completionPercentage,
          hasTwoFactor: !!user.twoFactorEnabled,
          hostels: formattedHostels
        });
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Handle generic user profile input changes
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handle hostel array string values
  const handleHostelChange = (index, e) => {
    const { name, value } = e.target;
    setProfileData(prev => {
      const newHostels = [...prev.hostels];
      newHostels[index] = { ...newHostels[index], [name]: value };
      return { ...prev, hostels: newHostels };
    });
  };

  const handleMapLocationChange = (newLocation, idx) => {
    setProfileData(prev => {
      const newHostels = [...prev.hostels];
      newHostels[idx] = { ...newHostels[idx], address: newLocation };
      return { ...prev, hostels: newHostels };
    });
  };

  const handleAddHostel = () => {
    setProfileData(prev => ({
      ...prev,
      hostels: [
        ...prev.hostels,
        {
          _id: `new_${Date.now()}`,
          hostelName: '',
          hostelId: 'Pending...',
          address: '',
          bankAccountName: '',
          bankAccountNumber: '',
          ifscCode: '',
          completion: 0,
          city: ''
        }
      ]
    }));
  };

  const handleRemoveHostel = (index) => {
    setProfileData(prev => {
      const newHostels = [...prev.hostels];
      newHostels.splice(index, 1);
      return { ...prev, hostels: newHostels };
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      // 1. Update User Details
      await fetch('http://localhost:5001/v1/auth/me', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: profileData.fullName,
          email: profileData.email,
          whatsappNumber: profileData.mobile,
          profilePhoto: profileData.profilePhoto.startsWith('data:') ? profileData.profilePhoto : undefined
        })
      });

      // 2. Update All Hostels
      for (const hostel of profileData.hostels) {
        if (hostel._id.toString().startsWith('new_')) {
          // Future mapping for POST request to create new hostel
          console.log("New hostel saving skipped pending backend API implementation");
          continue;
        }
        let locationObj = undefined;
        let cityObj = hostel.address;
        
        const coords = hostel.address.split(',');
        if (coords.length === 2 && !isNaN(parseFloat(coords[0])) && !isNaN(parseFloat(coords[1]))) {
          locationObj = {
            latitude: parseFloat(coords[0].trim()),
            longitude: parseFloat(coords[1].trim())
          };
        }

        await fetch(`http://localhost:5001/v1/hostels/${hostel._id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            hostelName: hostel.hostelName,
            ...(locationObj ? { location: locationObj } : { city: cityObj })
          })
        });

        if (hostel.bankAccountName || hostel.bankAccountNumber) {
          await fetch(`http://localhost:5001/v1/hostels/${hostel._id}/bank`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              accountName: hostel.bankAccountName,
              accountNumber: hostel.bankAccountNumber,
              ifscCode: hostel.ifscCode
            })
          });
        }
      }

      setIsEditing(false);
      alert('Profile updated successfully!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };


  const circleRadius = 26;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (profileData.completionPercentage / 100) * circumference;

  return (
    <div className={styles.layout}>
      {loading && <Loading text="Loading profile state..." />}
      <Sidebar />
      
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Profile Settings</h1>
            <p className={styles.pageSubtitle}>Manage your account details and hostel network.</p>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.completionWidget}>
              <div className={styles.progressCircle}>
                <svg width="60" height="60">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#3b3bff" strokeWidth="6" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    transform="rotate(-90 30 30)"
                    strokeLinecap="round" />
                </svg>
                <span className={styles.progressText} style={{ fontSize: '1rem' }}>{profileData.completionPercentage}%</span>
              </div>
              <span className={styles.completionLabel}>Avg Completion</span>
            </div>
            {!isEditing && (
              <button className={styles.editProfileBtn} onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        {/* 1. Basic Identity Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Personal Identity</h3>
            <p>Update your photo and personal details.</p>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrapper}>
                <img src={profileData.profilePhoto} alt="Profile Avatar" className={styles.avatarLarge} />
              </div>
              <div>
                {isEditing ? (
                  <>
                    <label className={styles.uploadLabel}>
                      Change Photo
                      <input type="file" accept="image/*" className={styles.hiddenInput} onChange={handlePhotoUpload} />
                    </label>
                    <span className={styles.photoHelp}>JPG, GIF or PNG. Max size of 2MB</span>
                  </>
                ) : (
                  <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "#111" }}>{profileData.fullName}</span>
                )}
              </div>
            </div>

            <div className={styles.twoColumn}>
              <div className={styles.inputGroup}>
                <label>FULL NAME</label>
                <input type="text" name="fullName" value={profileData.fullName} onChange={handleUserChange} readOnly={!isEditing} />
              </div>
              <div className={styles.inputGroup}>
                <label>EMAIL ADDRESS</label>
                <input type="email" name="email" value={profileData.email} disabled />
              </div>
              <div className={styles.inputGroup}>
                <label>MOBILE NUMBER</label>
                <div className={styles.phoneInput}>
                  <span className={styles.phonePrefix}>+91</span>
                  <input type="text" name="mobile" value={profileData.mobile?.replace(/^\+91/, '')} onChange={handleUserChange} readOnly={!isEditing} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Hostels Portfolio Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Hostels Portfolio</h3>
            <p>You currently own <strong>{profileData.hostels.length}</strong> hostel{profileData.hostels.length !== 1 ? 's' : ''}. Set details and pinpoint location.</p>
          </div>
          <div className={styles.sectionBody}>
            {profileData.hostels.map((hostel, idx) => {
              return (
                <div key={hostel._id} className={styles.hostelItem}>
                  <div className={styles.hostelHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <h4>{isEditing ? (hostel.hostelName || `New Hostel`) : hostel.hostelName}</h4>
                      <span className={styles.hostelBadge}>{hostel.hostelId}</span>
                    </div>
                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveHostel(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '0.25rem',
                          transition: 'background 0.2s'
                        }}
                        title="Remove Property"
                        onMouseOver={(e) => e.currentTarget.style.background = '#FEE2E2'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className={styles.twoColumn}>
                    <div className={styles.inputGroup}>
                      <label>HOSTEL NAME</label>
                      <input type="text" name="hostelName" value={hostel.hostelName} onChange={(e) => handleHostelChange(idx, e)} readOnly={!isEditing} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>LOCATION (LAT, LNG or City)</label>
                      <input type="text" name="address" value={hostel.address} onChange={(e) => handleHostelChange(idx, e)} readOnly={!isEditing} />
                      <span className={styles.helperText}>Input coordinates like &quot;12.9716, 77.5946&quot; or visually select</span>
                    </div>
                  </div>

                  <div className={styles.mapContainer} style={{ position: 'relative' }}>
                    <LocationPicker 
                       defaultAddress={hostel.address} 
                       onLocationChange={(newLocation) => handleMapLocationChange(newLocation, idx)}
                       isEditing={isEditing}
                    />
                    {isEditing && (
                      <div style={{ pointerEvents: 'none', position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '4px', zIndex: 1000, fontSize: '0.8rem', fontWeight: 600, color: '#374151', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        Drag marker to set exact location
                      </div>
                    )}
                  </div>

                  <h5 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#374151', fontSize: '0.9rem' }}>Bank Allocation</h5>
                  <div className={styles.twoColumn}>
                    <div className={styles.inputGroup}>
                      <label>ACCOUNT NAME</label>
                      <input type="text" name="bankAccountName" value={hostel.bankAccountName} onChange={(e) => handleHostelChange(idx, e)} readOnly={!isEditing} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>ACCOUNT NUMBER</label>
                      <input type="text" name="bankAccountNumber" value={hostel.bankAccountNumber} onChange={(e) => handleHostelChange(idx, e)} readOnly={!isEditing} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>IFSC CODE</label>
                      <input type="text" name="ifscCode" value={hostel.ifscCode} onChange={(e) => handleHostelChange(idx, e)} readOnly={!isEditing} />
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isEditing && (
              <button 
                onClick={handleAddHostel}
                style={{
                  padding: '1rem',
                  backgroundColor: '#F3F4F6',
                  border: '1px dashed #D1D5DB',
                  color: '#4B5563',
                  borderRadius: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '0.5rem',
                  outline: 'none'
                }}
              >
                + Add Another Property
              </button>
            )}
          </div>
        </div>

        {/* 3. Account Security Section */}
        <div className={styles.section} style={{ borderBottom: 'none' }}>
          <div className={styles.sectionHeader}>
            <h3>Account Security</h3>
            <p>Manage authentication factors and roles.</p>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.settingsList}>
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <h4>Change Password</h4>
                  <p>Send a reset link to update password</p>
                </div>
                <button className={styles.actionBtn}>Update</button>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <h4>Two-Factor Authentication</h4>
                  {profileData.hasTwoFactor ? (
                    <p className={styles.enabledText}>Enabled via Authenticator App</p>
                  ) : (
                    <p>Protect your account with 2FA</p>
                  )}
                </div>
                <button className={styles.actionBtn}>{profileData.hasTwoFactor ? 'Disable' : 'Enable'}</button>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <h4>Role Management</h4>
                  <p>Invite employees and grant access</p>
                </div>
                <button className={styles.actionBtn}>Manage</button>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className={styles.footerActions}>
            <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
          </div>
        )}
      </main>

      <button className={styles.floatingModeToggle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      </button>
    </div>
  );
}

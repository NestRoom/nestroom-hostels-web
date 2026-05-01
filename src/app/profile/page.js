"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AdminNav from '../components/AdminNav/AdminNav';
import Footer from '../components/Footer/Footer';
import Loading from '../components/Loading/Loading';
import styles from './page.module.css';
import { secureFetch } from '../utils/auth';

const LocationPicker = dynamic(() => import('../components/Map/LocationPicker'), { 
  ssr: false, 
  loading: () => <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100%',background:'#F3F4F6',color:'#6B7280',fontSize:'0.9rem',fontWeight:500}}>Loading Map Engine...</div> 
});

import { 
  UserCircle, 
  Building2, 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Camera, 
  Plus, 
  X,
  Key,
  Smartphone,
  Mail,
  Trash2,
  CheckCircle,
  Save,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordFlow, setPasswordFlow] = useState('change'); // 'change', 'change_verify', 'forgot', 'forgot_verify'
  const [pwdFormData, setPwdFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [pwdError, setPwdError] = useState('');
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    profilePhoto: 'https://ui-avatars.com/api/?name=Admin&background=E5E7EB&color=374151&size=150', // default fallback
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

        const res = await secureFetch('/v1/auth/me');
        
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
            const compRes = await secureFetch(`/v1/hostels/${hostelObj._id}/profile-completion`);
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
          profilePhoto: user.profilePhoto || 'https://ui-avatars.com/api/?name=Admin&background=E5E7EB&color=374151&size=150',
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
      await secureFetch('/v1/auth/me', {
        method: 'PUT',
        headers: { 
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

        await secureFetch(`/v1/hostels/${hostel._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            hostelName: hostel.hostelName,
            ...(locationObj ? { location: locationObj } : { city: cityObj })
          })
        });

        if (hostel.bankAccountName || hostel.bankAccountNumber) {
          await secureFetch(`/v1/hostels/${hostel._id}/bank`, {
            method: 'PUT',
            headers: { 
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

  // Password Modal Handlers
  const handlePwdFormChange = (e) => {
    setPwdFormData({ ...pwdFormData, [e.target.name]: e.target.value });
  };

  const openPasswordModal = (flow = 'change') => {
    setPasswordFlow(flow);
    setPwdFormData({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' });
    setPwdError('');
    setPasswordModalOpen(true);
  };

  const handlePasswordFlowSubmit = async () => {
    setPwdError('');
    const token = localStorage.getItem('accessToken');
    try {
      if (passwordFlow === 'change') {
        if (!pwdFormData.currentPassword || !pwdFormData.newPassword || !pwdFormData.confirmPassword) {
           return setPwdError('All fields are required.');
        }
        if (pwdFormData.newPassword !== pwdFormData.confirmPassword) {
           return setPwdError('New passwords do not match.');
        }
        // Send OTP
        const res = await fetch('/v1/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: profileData.email })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to send OTP');
        }
        setPasswordFlow('change_verify');
      } else if (passwordFlow === 'change_verify') {
        if (!pwdFormData.otp) return setPwdError('OTP is required.');
        const res = await secureFetch('/v1/auth/change-password', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ 
            currentPassword: pwdFormData.currentPassword, 
            newPassword: pwdFormData.newPassword,
            confirmPassword: pwdFormData.confirmPassword,
            otp: pwdFormData.otp
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to update password');
        }
        alert('Password updated successfully!');
        setPasswordModalOpen(false);
      } else if (passwordFlow === 'forgot') {
        // Send OTP
        const res = await fetch('/v1/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: profileData.email })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to send OTP');
        }
        setPasswordFlow('forgot_verify');
      } else if (passwordFlow === 'forgot_verify') {
        if (!pwdFormData.otp || !pwdFormData.newPassword || !pwdFormData.confirmPassword) {
           return setPwdError('All fields are required.');
        }
        if (pwdFormData.newPassword !== pwdFormData.confirmPassword) {
           return setPwdError('New passwords do not match.');
        }
        const res = await fetch('/v1/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: profileData.email,
            otp: pwdFormData.otp,
            newPassword: pwdFormData.newPassword,
            confirmPassword: pwdFormData.confirmPassword
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to reset password');
        }
        alert('Password reset successfully!');
        setPasswordModalOpen(false);
      }
    } catch (err) {
      setPwdError(err.message);
    }
  };

  return (
    <div className={styles.layout}>
      {loading && <Loading text="Loading profile state..." />}
      <AdminNav />
      
      <main className={`${styles.mainContent} ${isEditing ? styles.editing : ''}`}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerTitleGroup}>
              <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className={styles.pageTitle}>Account Settings</h1>
                <p className={styles.pageSubtitle}>Manage your personal profile and hostel network</p>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              {!isEditing ? (
                <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                  <UserCircle size={18} />
                  Edit Profile
                </button>
              ) : (
                <div className={styles.editingActions}>
                  <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
                  <button className={styles.saveBtn} onClick={handleSave}>
                    <Save size={18} />
                    Save Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className={styles.contentGrid}>
            {/* Left Sidebar - Summary */}
            <div className={styles.sidebar}>
              <div className={styles.profileCard}>
                <div className={styles.avatarSection}>
                  <div className={styles.avatarWrapper}>
                    <img src={profileData.profilePhoto} alt="Profile" className={styles.avatarLarge} />
                    {isEditing && (
                      <label className={styles.cameraOverlay}>
                        <Camera size={20} />
                        <input type="file" accept="image/*" className={styles.hiddenInput} onChange={handlePhotoUpload} />
                      </label>
                    )}
                  </div>
                  <h2 className={styles.profileName}>{profileData.fullName || 'Hostel Admin'}</h2>
                  <p className={styles.profileRole}>Primary Administrator</p>
                </div>

                <div className={styles.statsList}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Properties</span>
                    <span className={styles.statValue}>{profileData.hostels.length}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Security</span>
                    <span className={styles.statValue}>{profileData.hasTwoFactor ? 'High' : 'Basic'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Details */}
            <div className={styles.detailsArea}>
              {/* Personal Section */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <UserCircle className={styles.cardIcon} size={22} />
                  <h3>Personal Identity</h3>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label>FULL NAME</label>
                      <div className={styles.inputWrapper}>
                        <UserCircle className={styles.fieldIcon} size={18} />
                        <input type="text" name="fullName" value={profileData.fullName} onChange={handleUserChange} readOnly={!isEditing} />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>EMAIL ADDRESS</label>
                      <div className={styles.inputWrapper}>
                        <Mail className={styles.fieldIcon} size={18} />
                        <input type="email" value={profileData.email} disabled />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>WHATSAPP NUMBER</label>
                      <div className={styles.inputWrapper}>
                        <Smartphone className={styles.fieldIcon} size={18} />
                        <input type="text" name="mobile" value={profileData.mobile} onChange={handleUserChange} readOnly={!isEditing} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hostels Section */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <Building2 className={styles.cardIcon} size={22} />
                  <h3>Hostels Portfolio</h3>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.hostelList}>
                    {profileData.hostels.map((hostel, idx) => (
                      <div key={hostel._id} className={styles.hostelItem}>
                        <div className={styles.hostelItemHeader}>
                          <div className={styles.hostelInfo}>
                            <h4>{hostel.hostelName || 'New Property'}</h4>
                            <span className={styles.idBadge}>{hostel.hostelId}</span>
                          </div>
                          {isEditing && (
                            <button className={styles.removeBtn} onClick={() => handleRemoveHostel(idx)}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <div className={styles.formGrid}>
                          <div className={styles.inputGroup}>
                            <label>HOSTEL NAME</label>
                            <input type="text" name="hostelName" value={hostel.hostelName} onChange={(e) => handleHostelChange(idx, e)} readOnly={!isEditing} />
                          </div>
                          <div className={styles.inputGroup}>
                            <label>CITY / LOCATION</label>
                            <div className={styles.inputWrapper}>
                              <MapPin className={styles.fieldIcon} size={18} />
                              <input type="text" name="address" value={hostel.address} onChange={(e) => handleHostelChange(idx, e)} readOnly={!isEditing} />
                            </div>
                          </div>
                        </div>

                        <div className={styles.mapPreview}>
                          <LocationPicker 
                             defaultAddress={hostel.address} 
                             onLocationChange={(newLocation) => handleMapLocationChange(newLocation, idx)}
                             isEditing={isEditing}
                          />
                        </div>

                        <div className={styles.bankSection}>
                          <h5><CreditCard size={16} /> Banking Details</h5>
                          <div className={styles.formGrid}>
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
                      </div>
                    ))}

                    {isEditing && (
                      <button className={styles.addHostelBtn} onClick={handleAddHostel}>
                        <Plus size={18} />
                        Register New Property
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <ShieldCheck className={styles.cardIcon} size={22} />
                  <h3>Account Security</h3>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.securityItem}>
                    <div className={styles.securityInfo}>
                      <div className={styles.securityTitle}>
                        <Key size={18} />
                        <span>Authentication Password</span>
                      </div>
                      <p>Last updated 3 months ago. Regular updates improve security.</p>
                    </div>
                    <button className={styles.secondaryBtn} onClick={() => openPasswordModal('change')}>Update</button>
                  </div>

                  <div className={styles.securityItem}>
                    <div className={styles.securityInfo}>
                      <div className={styles.securityTitle}>
                        <ShieldCheck size={18} />
                        <span>Two-Factor Authentication</span>
                        {profileData.hasTwoFactor && <span className={styles.activeTag}>Active</span>}
                      </div>
                      <p>Secure your account with an extra layer of identity verification.</p>
                    </div>
                    <button className={styles.secondaryBtn} disabled>Configure</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        <Footer />
      </main>



      {/* Password Modal */}
      {passwordModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={() => setPasswordModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>
              {passwordFlow === 'change' ? 'Change Password' : passwordFlow === 'forgot' ? 'Forgot Password' : 'Verify OTP'}
            </h2>
            <p className={styles.modalSubtitle}>
              {passwordFlow === 'change' && 'Enter your current password and a new password.'}
              {passwordFlow === 'change_verify' && 'We have sent an OTP to your email. Enter it below to confirm.'}
              {passwordFlow === 'forgot' && 'Click below to receive a password reset OTP on your email.'}
              {passwordFlow === 'forgot_verify' && 'Enter the OTP sent to your email, and your new password.'}
            </p>

            {pwdError && <div style={{ color: '#EF4444', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 500 }}>{pwdError}</div>}

            <div className={styles.modalForm}>
              {passwordFlow === 'change' && (
                <>
                  <div className={styles.inputGroup}>
                    <label>CURRENT PASSWORD</label>
                    <input type="password" name="currentPassword" value={pwdFormData.currentPassword} onChange={handlePwdFormChange} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>NEW PASSWORD</label>
                    <input type="password" name="newPassword" value={pwdFormData.newPassword} onChange={handlePwdFormChange} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>CONFIRM NEW PASSWORD</label>
                    <input type="password" name="confirmPassword" value={pwdFormData.confirmPassword} onChange={handlePwdFormChange} />
                  </div>
                  <button className={styles.modalLink} onClick={() => setPasswordFlow('forgot')}>Forgot current password?</button>
                </>
              )}

              {passwordFlow === 'change_verify' && (
                <div className={styles.inputGroup}>
                  <label>OTP</label>
                  <input type="text" name="otp" value={pwdFormData.otp} onChange={handlePwdFormChange} placeholder="123456" />
                </div>
              )}

              {passwordFlow === 'forgot_verify' && (
                <>
                  <div className={styles.inputGroup}>
                    <label>OTP</label>
                    <input type="text" name="otp" value={pwdFormData.otp} onChange={handlePwdFormChange} placeholder="123456" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>NEW PASSWORD</label>
                    <input type="password" name="newPassword" value={pwdFormData.newPassword} onChange={handlePwdFormChange} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>CONFIRM NEW PASSWORD</label>
                    <input type="password" name="confirmPassword" value={pwdFormData.confirmPassword} onChange={handlePwdFormChange} />
                  </div>
                </>
              )}

              <button className={styles.modalActionBtn} onClick={handlePasswordFlowSubmit}>
                {passwordFlow === 'change' ? 'Continue' : passwordFlow === 'forgot' ? 'Send OTP' : 'Verify & Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

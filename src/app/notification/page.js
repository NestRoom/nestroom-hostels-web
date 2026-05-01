'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '../components/AdminNav/AdminNav';
import Loading from '../components/Loading/Loading';
import styles from './notification.module.css';
import { 
  Plus, Bell, PieChart, Users, Eye, X, Send, 
  CheckCircle2, AlertTriangle, CreditCard, ClipboardCheck, Info
} from 'lucide-react';
import { secureFetch } from '../utils/auth';

const NOTIFICATION_TYPES = [
  { value: 'Announcement', icon: <Info size={16} />, className: styles.typeAnnouncement },
  { value: 'Emergency', icon: <AlertTriangle size={16} />, className: styles.typeEmergency },
  { value: 'Payment', icon: <CreditCard size={16} />, className: styles.typePayment },
  { value: 'Attendance', icon: <ClipboardCheck size={16} />, className: styles.typeAttendance },
  { value: 'Survey', icon: <Users size={16} />, className: styles.typeSurvey },
];

export default function NotificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeHostelId, setActiveHostelId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  // New Notification Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'Announcement',
    recipientType: 'AllResidents',
    poll: {
      isPoll: false,
      pollQuestion: '',
      pollOptions: ['', ''],
      pollType: 'MultiChoice'
    }
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const meRes = await secureFetch('/v1/auth/me');
        if (!meRes.ok) throw new Error('Auth failed');
        const { data: meData } = await meRes.json();
        
        let targetHostel = meData.user.hostels?.[0]?._id;
        if (!targetHostel) {
          setLoading(false);
          return;
        }
        setActiveHostelId(targetHostel);

        // Fetch Notifications
        const res = await secureFetch(`/v1/hostels/${targetHostel}/notifications`);
        const { data } = await res.json();
        setNotifications(data.notifications || []);
        
        if (data.notifications?.length > 0) {
          setSelectedNotification(data.notifications[0]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [router]);

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSending(true);

    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        recipientType: formData.recipientType,
      };

      if (formData.poll.isPoll) {
        payload.poll = {
          ...formData.poll,
          pollOptions: formData.poll.pollOptions.filter(o => o.trim() !== '')
        };
        payload.type = 'Survey'; // Force survey type for polls
      }

      const res = await secureFetch(`/v1/hostels/${activeHostelId}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const { data: createdData } = await res.json();
        // Refresh notifications
        const listRes = await secureFetch(`/v1/hostels/${activeHostelId}/notifications`);
        const { data: listData } = await listRes.json();
        const newList = listData.notifications || [];
        setNotifications(newList);
        
        // Auto-select the newly created notification
        if (createdData.notification) {
           setSelectedNotification(createdData.notification);
        } else if (newList.length > 0) {
           setSelectedNotification(newList[0]);
        }

        setIsModalOpen(false);
        // Reset form
        setFormData({
          title: '',
          message: '',
          type: 'Announcement',
          recipientType: 'AllResidents',
          poll: { isPoll: false, pollQuestion: '', pollOptions: ['', ''], pollType: 'MultiChoice' }
        });
      } else {
        const errorData = await res.json();
        setError(errorData.error?.message || "Failed to transmit broadcast");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const addPollOption = () => {
    setFormData({
      ...formData,
      poll: {
        ...formData.poll,
        pollOptions: [...formData.poll.pollOptions, '']
      }
    });
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...formData.poll.pollOptions];
    newOptions[index] = value;
    setFormData({
      ...formData,
      poll: {
        ...formData.poll,
        pollOptions: newOptions
      }
    });
  };

  const getTypeStyle = (type) => {
    const found = NOTIFICATION_TYPES.find(t => t.value === type);
    return found ? found.className : styles.typeAnnouncement;
  };

  if (loading) return (
    <div className={styles.wrapper}>
      <AdminNav />
      <main className={styles.container} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loading />
        <p style={{ marginTop: '1.5rem', fontWeight: 800, color: '#6b7280' }}>Synchronizing Communications...</p>
      </main>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <AdminNav />
      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h1>Communications</h1>
            <p className={styles.subtitle}>Broadcast updates and monitor resident engagement analytics.</p>
          </div>
          <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>
            <Send size={20} />
            New Broadcast
          </button>
        </header>

        <div className={styles.mainGrid}>
          {/* History Sidebar */}
          <section className={styles.listSection}>
            <div className={styles.listHeader}>
              <h2>Broadcast History</h2>
              <span className={styles.cardDate}>{notifications.length} Sent</span>
            </div>
            
            <div className={styles.notificationList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <Bell size={48} className={styles.emptyIcon} />
                  <h3>No transmissions yet</h3>
                  <p>Initialize your first broadcast to begin engaging with residents.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`${styles.notificationCard} ${selectedNotification?._id === notif._id ? styles.activeCard : ''}`}
                    onClick={() => setSelectedNotification(notif)}
                  >
                    <div className={styles.cardHeader}>
                      <span className={`${styles.cardType} ${getTypeStyle(notif.type)}`}>
                        {notif.type}
                      </span>
                      <span className={styles.cardDate}>
                        {new Date(notif.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className={styles.cardTitle}>{notif.title}</div>
                    <div className={styles.cardSnippet}>{notif.message}</div>
                    <div className={styles.cardFooter}>
                       <div className={styles.statsMini}>
                          <div className={styles.statItem}>
                            <Eye size={14} /> {notif.totalViewCount || 0}
                          </div>
                          {notif.poll?.isPoll && (
                            <div className={styles.statItem}>
                              <PieChart size={14} /> {notif.poll.totalResponses || 0}
                            </div>
                          )}
                       </div>
                       <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {notif.deliveryStatus}
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Analytics & Details Section */}
          <section className={styles.detailsSection}>
            {selectedNotification ? (
              <>
                <div className={styles.detailsHeader}>
                   <div className={styles.cardHeader}>
                      <span className={`${styles.cardType} ${getTypeStyle(selectedNotification.type)}`}>
                        {selectedNotification.type}
                      </span>
                      <span className={styles.cardDate}>
                        Broadcast on {new Date(selectedNotification.sentAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                   </div>
                   <h2 className={styles.detailsTitle}>{selectedNotification.title}</h2>
                </div>

                <div className={styles.detailsContent}>
                  {selectedNotification.message}
                </div>

                <div className={styles.analyticsGrid}>
                  <div className={styles.analCard}>
                     <div className={styles.analLabel}>Reach</div>
                     <div className={styles.analValue}>{selectedNotification.totalViewCount || 0}</div>
                  </div>
                  <div className={styles.analCard}>
                     <div className={styles.analLabel}>View Rate</div>
                     <div className={styles.analValue}>{selectedNotification.viewRate || 0}%</div>
                  </div>
                  {selectedNotification.poll?.isPoll && (
                    <>
                      <div className={styles.analCard}>
                        <div className={styles.analLabel}>Responses</div>
                        <div className={styles.analValue}>{selectedNotification.poll.totalResponses || 0}</div>
                      </div>
                      <div className={styles.analCard}>
                        <div className={styles.analLabel}>Engagement</div>
                        <div className={styles.analValue}>{selectedNotification.poll.responseRate || 0}%</div>
                      </div>
                    </>
                  )}
                </div>

                {selectedNotification.poll?.isPoll && (
                  <div className={styles.pollContainer}>
                    <h3 className={styles.pollTitle}>
                      <PieChart size={20} style={{ marginRight: '8px' }} />
                      Poll Results: {selectedNotification.poll.pollQuestion}
                    </h3>
                    {selectedNotification.poll.pollOptions.map((option, idx) => {
                      const count = selectedNotification.poll.responseBreakdown?.[option] || 0;
                      const percentage = selectedNotification.poll.totalResponses > 0 
                        ? (count / selectedNotification.poll.totalResponses) * 100 
                        : 0;
                      return (
                        <div key={idx} className={styles.pollOption}>
                          <div className={styles.optionHeader}>
                             <span>{option}</span>
                             <span>{count} votes ({Math.round(percentage)}%)</span>
                          </div>
                          <div className={styles.optionBar}>
                             <div className={styles.optionFill} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className={styles.seenBySection}>
                   <h3 className={styles.sectionTitle}>
                      <Users size={22} color="#4f46e5" strokeWidth={2.5} /> 
                      Audience Feed ({selectedNotification.viewedBy?.length || 0})
                   </h3>
                   <div className={styles.seenByList}>
                      {selectedNotification.viewedBy?.length > 0 ? (
                        selectedNotification.viewedBy.map((view, i) => (
                          <div key={i} className={styles.seenItem}>
                             <div className={styles.seenAvatar} style={{ background: '#f5f3ff', color: '#4f46e5' }}>
                               {view.residentName?.[0]}
                             </div>
                             <div className={styles.seenInfo}>
                                <div className={styles.seenName}>{view.residentName}</div>
                                <div className={styles.seenTime}>
                                  {new Date(view.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(view.viewedAt).toLocaleDateString()}
                                </div>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.emptyState} style={{ padding: '2rem 0' }}>
                          <p className={styles.emptyText}>Monitoring audience activity...</p>
                        </div>
                      )}
                   </div>
                </div>
              </>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.8 }}>
                <div style={{ background: '#f5f3ff', padding: '2.5rem', borderRadius: '3rem', marginBottom: '2rem' }}>
                  <Bell size={64} color="#4f46e5" />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 850 }}>Engagement Analytics</h3>
                <p style={{ maxWidth: '350px', color: '#6b7280', fontWeight: 500, marginTop: '0.5rem' }}>
                  Select a broadcast from your history to view reach, poll results, and real-time audience activity.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* New Broadcast Modal */}
        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>New Communication</h2>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                  <X size={28} strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleCreateNotification}>
                <div className={styles.formGroup}>
                  <label>Subject</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="e.g., Monthly Maintenance Scheduled"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Message Payload</label>
                  <textarea 
                    className={styles.formTextarea} 
                    placeholder="Compose your broadcast message here..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className={styles.formGroup}>
                    <label>Transmission Category</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      {NOTIFICATION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.value}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Audience Targeting</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.recipientType}
                      onChange={(e) => setFormData({...formData, recipientType: e.target.value})}
                    >
                      <option value="AllResidents">Universal (All Residents)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup} style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <input 
                        type="checkbox" 
                        id="isPoll" 
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        checked={formData.poll.isPoll}
                        onChange={(e) => setFormData({
                          ...formData, 
                          poll: { ...formData.poll, isPoll: e.target.checked }
                        })}
                     />
                     <label htmlFor="isPoll" style={{ margin: 0, cursor: 'pointer', fontSize: '1rem', fontWeight: 800 }}>Enable Interactive Poll</label>
                  </div>
                </div>

                {formData.poll.isPoll && (
                  <div className={styles.pollOptionsGroup}>
                     <div className={styles.formGroup}>
                        <label>Poll Query</label>
                        <input 
                          type="text" 
                          className={styles.formInput} 
                          placeholder="What is your question?"
                          value={formData.poll.pollQuestion}
                          onChange={(e) => setFormData({
                            ...formData, 
                            poll: { ...formData.poll, pollQuestion: e.target.value }
                          })}
                        />
                     </div>
                     <label>Options</label>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {formData.poll.pollOptions.map((opt, idx) => (
                           <div key={idx} className={styles.pollOptionInput}>
                              <input 
                                type="text" 
                                className={styles.formInput} 
                                placeholder={`Option ${idx + 1}`}
                                value={opt}
                                onChange={(e) => updatePollOption(idx, e.target.value)}
                              />
                           </div>
                        ))}
                     </div>
                     <button type="button" className={styles.addOptionBtn} style={{ marginTop: '1rem' }} onClick={addPollOption}>
                        <Plus size={16} />
                        Add Response Option
                     </button>
                  </div>
                )}

                {error && <p className={styles.errorMessage}>{error}</p>}

                <button type="submit" className={styles.submitBtn} style={{ marginTop: '1rem' }} disabled={isSending}>
                  <Send size={20} />
                  {isSending ? 'Transmitting...' : 'Broadcast Transmission'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

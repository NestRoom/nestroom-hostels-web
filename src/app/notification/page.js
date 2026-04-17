'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar/Sidebar';
import Loading from '../components/Loading/Loading';
import styles from './notification.module.css';
import { 
  Plus, Bell, PieChart, Users, Eye, X, Send, 
  CheckCircle2, AlertTriangle, CreditCard, ClipboardCheck, Info
} from 'lucide-react';

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
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const meRes = await fetch('http://localhost:5001/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!meRes.ok) throw new Error('Auth failed');
        const { data: meData } = await meRes.json();
        
        let targetHostel = meData.user.hostels?.[0]?._id;
        if (!targetHostel) {
          setLoading(false);
          return;
        }
        setActiveHostelId(targetHostel);

        // Fetch Notifications
        const res = await fetch(`http://localhost:5001/v1/hostels/${targetHostel}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
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
    setIsSending(true);

    try {
      const token = localStorage.getItem('accessToken');
      
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

      const res = await fetch(`http://localhost:5001/v1/hostels/${activeHostelId}/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const { data } = await res.json();
        // Refresh notifications
        const listRes = await fetch(`http://localhost:5001/v1/hostels/${activeHostelId}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const { data: listData } = await listRes.json();
        setNotifications(listData.notifications || []);
        setIsModalOpen(false);
        // Reset form
        setFormData({
          title: '',
          message: '',
          type: 'Announcement',
          recipientType: 'AllResidents',
          poll: { isPoll: false, pollQuestion: '', pollOptions: ['', ''], pollType: 'MultiChoice' }
        });
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
      <Sidebar />
      <main className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading text="Loading Notifications..." />
      </main>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h1>Notifications</h1>
            <p className={styles.subtitle}>Send updates and engage with your residents.</p>
          </div>
          <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Create New
          </button>
        </header>

        <div className={styles.mainGrid}>
          {/* List Section */}
          <section className={styles.listSection}>
            <div className={styles.listHeader}>
              <h2>History</h2>
              <span className={styles.cardDate}>{notifications.length} Sent</span>
            </div>
            
            <div className={styles.notificationList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No notifications sent yet.</p>
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
                        {new Date(notif.sentAt).toLocaleDateString()}
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
                       <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                          {notif.deliveryStatus}
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Details Section */}
          <section className={styles.detailsSection}>
            {selectedNotification ? (
              <>
                <div className={styles.detailsHeader}>
                   <div className={styles.cardHeader}>
                      <span className={`${styles.cardType} ${getTypeStyle(selectedNotification.type)}`}>
                        {selectedNotification.type}
                      </span>
                      <span className={styles.cardDate}>
                        Sent at {new Date(selectedNotification.sentAt).toLocaleString()}
                      </span>
                   </div>
                   <h2 className={styles.detailsTitle}>{selectedNotification.title}</h2>
                </div>

                <div className={styles.detailsContent}>
                  {selectedNotification.message}
                </div>

                {selectedNotification.poll?.isPoll && (
                  <div className={styles.pollContainer}>
                    <h3 className={styles.pollTitle}>Poll Results: {selectedNotification.poll.pollQuestion}</h3>
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

                <div className={styles.analyticsGrid}>
                  <div className={styles.analCard}>
                     <div className={styles.analLabel}>Total Views</div>
                     <div className={styles.analValue}>{selectedNotification.totalViewCount}</div>
                  </div>
                  <div className={styles.analCard}>
                     <div className={styles.analLabel}>View Rate</div>
                     <div className={styles.analValue}>{selectedNotification.viewRate}%</div>
                  </div>
                  {selectedNotification.poll?.isPoll && (
                    <>
                      <div className={styles.analCard}>
                        <div className={styles.analLabel}>Total Responses</div>
                        <div className={styles.analValue}>{selectedNotification.poll.totalResponses}</div>
                      </div>
                      <div className={styles.analCard}>
                        <div className={styles.analLabel}>Response Rate</div>
                        <div className={styles.analValue}>{selectedNotification.poll.responseRate}%</div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Bell size={32} />
                </div>
                <h3>Select a notification</h3>
                <p>Pick a notification from the list to view detailed analytics.</p>
              </div>
            )}
          </section>
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Create New Notification</h2>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateNotification}>
                <div className={styles.formGroup}>
                  <label>Title</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="e.g., Monthly Maintenance Work"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Message Content</label>
                  <textarea 
                    className={styles.formTextarea} 
                    placeholder="Describe your update in detail..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className={styles.formGroup}>
                    <label>Category</label>
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
                    <label>Recipients</label>
                    <select 
                      className={styles.formSelect}
                      value={formData.recipientType}
                      onChange={(e) => setFormData({...formData, recipientType: e.target.value})}
                    >
                      <option value="AllResidents">All Residents</option>
                      {/* Add more types if needed by backend later */}
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <input 
                        type="checkbox" 
                        id="isPoll" 
                        checked={formData.poll.isPoll}
                        onChange={(e) => setFormData({
                          ...formData, 
                          poll: { ...formData.poll, isPoll: e.target.checked }
                        })}
                     />
                     <label htmlFor="isPoll" style={{ margin: 0 }}>Include a Poll</label>
                  </div>
                </div>

                {formData.poll.isPoll && (
                  <div className={styles.pollOptionsGroup}>
                     <div className={styles.formGroup}>
                        <label>Poll Question</label>
                        <input 
                          type="text" 
                          className={styles.formInput} 
                          placeholder="e.g., What should we have for Sunday Dinner?"
                          value={formData.poll.pollQuestion}
                          onChange={(e) => setFormData({
                            ...formData, 
                            poll: { ...formData.poll, pollQuestion: e.target.value }
                          })}
                        />
                     </div>
                     <label>Options</label>
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
                     <button type="button" className={styles.addOptionBtn} onClick={addPollOption}>
                        + Add Option
                     </button>
                  </div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={isSending}>
                  {isSending ? 'Sending...' : 'Broadcast Notification'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

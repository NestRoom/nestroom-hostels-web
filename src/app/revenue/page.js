'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar/Sidebar';
import Loading from '../components/Loading/Loading';
import styles from './revenue.module.css';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Download, Filter, AlertCircle, ChevronLeft, ChevronRight, 
  Wallet, TrendingUp, Clock, Calendar, Send
} from 'lucide-react';

export default function RevenuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeHostelId, setActiveHostelId] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, total: 0 });

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

        // Fetch Dashboard Data
        const dashRes = await fetch(`http://localhost:5001/v1/hostels/${targetHostel}/revenue`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const { data: dashData } = await dashRes.json();
        setDashboardData(dashData);

        // Fetch Payments
        const payRes = await fetch(`http://localhost:5001/v1/hostels/${targetHostel}/payments?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const { data: payData } = await payRes.json();
        setPayments(payData.payments);
        setPagination({ page: payData.pagination.page, total: payData.pagination.total });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [router]);

  const handleRecordPayment = () => {
    alert("Record Manual Payment Modal would open here. This will call POST /v1/hostels/:id/payments/manual");
  };

  const handleSendReminder = async (residentId) => {
    alert(`Sending payment reminder to resident ${residentId}...`);
    // This could trigger a notification API
  };

  if (loading) return (
    <div className={styles.wrapper}>
      <Sidebar />
      <main className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading text="Aggregating Revenue Data..." />
      </main>
    </div>
  );

  if (!dashboardData) return (
    <div className={styles.wrapper}>
      <Sidebar />
      <main className={styles.container}>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>No Hostel Found</h2>
          <p>Please add a hostel to view revenue data.</p>
        </div>
      </main>
    </div>
  );

  const submissionsData = [
    { name: 'Submitted', value: dashboardData.stats.submitted, color: '#3b42f2' },
    { name: 'Non-submission', value: dashboardData.stats.nonSubmitted, color: '#ef4444' },
  ];

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h1>Payments Tracking</h1>
            <p className={styles.subtitle}>Manage collections, dues, and transaction history.</p>
          </div>
          <button className={styles.recordBtn} onClick={handleRecordPayment}>
            <Wallet size={18} />
            Record Payment
          </button>
        </header>

        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <h3>Total Collected (Month)</h3>
              <div className={styles.statValue}>₹{dashboardData.monthlyRevenue.toLocaleString()}</div>
              <div className={`${styles.statTrend} ${styles.trendUp}`}>
                <TrendingUp size={14} /> Higher than last month
              </div>
            </div>
            <div className={styles.statIcon}>
              <Wallet size={24} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <h3>Outstanding Dues</h3>
              <div className={styles.statValue}>₹{dashboardData.outstandingAmount.toLocaleString()}</div>
              <div className={`${styles.statTrend} ${styles.trendDown}`}>
                <AlertCircle size={14} /> {dashboardData.pendingPayments} payments pending
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.duesIcon}`}>
              <Clock size={24} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <h3>Upcoming Renewals</h3>
              <div className={styles.statValue}>{dashboardData.stats.upcomingRenewals}</div>
              <div className={`${styles.statTrend}`} style={{ color: '#3b82f6' }}>
                Expiring in next 7 days
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.renewalsIcon}`}>
              <Calendar size={24} />
            </div>
          </div>
        </section>

        <section className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <h3>Revenue Overview</h3>
              <p className={styles.chartSubtitle}>Earnings growth trend</p>
            </div>
            <div className={styles.growthBadge}>Line Chart</div>
          </div>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.trends}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b42f2" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b42f2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Earnings']}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#3b42f2" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEarnings)" 
                  dot={{ r: 4, fill: '#3b42f2', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={styles.historySection}>
          <div className={styles.historyHeader}>
            <div className={styles.historyTitle}>
              <h3>Transaction History</h3>
            </div>
            <div className={styles.historyFilters}>
              <select 
                className={styles.filterBtn} 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Payments</option>
                <option value="Success">Successful</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
              <button className={styles.filterBtn}>
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Resident Name</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date & Status</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.filter(p => filterStatus === 'all' || p.paymentStatus === filterStatus).map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className={styles.residentCell}>
                      <div className={styles.avatar}></div>
                      <div>
                        <span className={styles.residentName}>User {item.paymentId}</span>
                        <span className={styles.roomNumber}>Ref: {item.paymentId}</span>
                      </div>
                    </div>
                  </td>
                  <td className={`${styles.amountCell} ${item.paymentStatus === 'Pending' ? styles.dueAmount : ''}`}>
                    ₹{item.amount.toLocaleString()}
                  </td>
                  <td>
                    <div className={styles.methodCell}>
                      {item.paymentMethod}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: item.paymentStatus === 'Pending' ? '#ef4444' : '#666' }}>
                      {item.paidDate ? new Date(item.paidDate).toLocaleString() : `Due: ${new Date(item.dueDate).toLocaleDateString()}`}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      item.paymentStatus === 'Success' ? styles.statusSuccessful : 
                      item.paymentStatus === 'Pending' ? styles.statusPending : styles.statusFailed
                    }`}>
                      {item.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className={styles.actionBtn}>
                         <Download size={16} title="Download Receipt" />
                      </button>
                      {item.paymentStatus === 'Pending' && (
                        <button 
                          className={`${styles.recordBtn}`} 
                          style={{ padding: '4px 12px', fontSize: '11px', height: 'auto' }}
                          onClick={() => handleSendReminder(item.residentId)}
                        >
                          Send Reminder
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#666' }}>
            <span>Showing {payments.length} transactions</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={styles.actionBtn}><ChevronLeft size={16} /></button>
              <button className={styles.actionBtn}><ChevronRight size={16} /></button>
            </div>
          </div>
        </section>

        <section className={styles.managementGrid}>
          {/* Dispute Card */}
          <div className={styles.mgmtCard}>
            <div className={styles.mgmtHeader}>
              <div className={styles.mgmtTitle}>
                <AlertCircle size={20} color="#ef4444" />
                Payment Disputes
              </div>
              <div className={styles.mgmtCount}>{dashboardData.pendingPayments.toString().padStart(2, '0')}</div>
            </div>
            <div className={styles.disputeList}>
              <div className={`${styles.disputeItem} ${styles.failedUpi}`}>
                <div className={styles.disputeLabel}>
                  <div className={`${styles.dot} ${styles.redDot}`}></div>
                  Failed Razorpay
                </div>
                <div style={{ fontWeight: 800 }}>01</div>
              </div>
              <div className={`${styles.disputeItem} ${styles.mismatch}`}>
                <div className={styles.disputeLabel}>
                  <div className={`${styles.dot} ${styles.orangeDot}`}></div>
                  Pending Manual Sync
                </div>
                <div style={{ fontWeight: 800 }}>01</div>
              </div>
            </div>
            <button className={styles.reviewBtn}>Review Reconciliation</button>
          </div>

          {/* Forecast Card */}
          <div className={styles.mgmtCard}>
            <div className={styles.mgmtHeader}>
              <div className={styles.mgmtTitle}>
                <TrendingUp size={20} color="#3b42f2" />
                Collection Forecast
              </div>
              <div className={styles.forecastValue}>₹{(dashboardData.outstandingAmount / 100000).toFixed(1)}L</div>
            </div>
            
            <div className={styles.forecastProgress}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', fontWeight: 600 }}>
                  <span>Current Progress</span>
                  <span>{Math.round((dashboardData.stats.submitted / dashboardData.stats.totalResidents) * 100)}%</span>
               </div>
               <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${(dashboardData.stats.submitted / dashboardData.stats.totalResidents) * 100}%` }}></div>
               </div>
            </div>

            <div className={styles.forecastDesc}>
              Estimated collection for the next 15 days based on {dashboardData.stats.nonSubmitted} pending bills and due renewals.
            </div>
            <button className={styles.viewForecastBtn}>View Forecast Detail</button>
          </div>
        </section>

        {/* Potential Income Summary Card */}
        <section className={styles.mgmtCard} style={{ marginTop: '32px', background: 'linear-gradient(135deg, #3b42f2 0%, #1e24b3 100%)', color: 'white' }}>
           <div className={styles.mgmtHeader}>
              <div className={styles.mgmtTitle} style={{ color: 'white' }}>
                <Wallet size={20} color="white" />
                Potential Monthly Income
              </div>
              <div className={styles.statValue} style={{ margin: 0, color: 'white' }}>₹{dashboardData.potentialMonthlyIncome.toLocaleString()}</div>
            </div>
            <p style={{ opacity: 0.8, fontSize: '14px' }}>
              Maximum earning capacity based on total mapped bed counts ({dashboardData.stats.totalResidents}) and their assigned rental fees.
            </p>
        </section>
      </main>
    </div>
  );
}

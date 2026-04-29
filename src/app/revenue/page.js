'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '../components/AdminNav/AdminNav';
import Loading from '../components/Loading/Loading';
import styles from './revenue.module.css';
import { secureFetch } from '../utils/auth';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Download, Filter, AlertCircle, ChevronLeft, ChevronRight, 
  Wallet, TrendingUp, Clock, Calendar, Send, Users, Search, CreditCard, Target, TrendingDown
} from 'lucide-react';

export default function RevenuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeHostelId, setActiveHostelId] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  const [timeframe, setTimeframe] = useState('monthly');

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const meRes = await secureFetch('http://localhost:5001/v1/auth/me');
        if (!meRes.ok) throw new Error('Auth failed');
        const meData = await meRes.json();
        
        const user = meData.data?.user;
        const targetHostelId = user?.hostels?.[0]?._id || user?.hostelId || meData.data?.hostels?.[0]?._id;
        
        if (!targetHostelId) {
          console.warn("No hostel ID found for user");
          setLoading(false);
          return;
        }
        
        setActiveHostelId(targetHostelId);
        
        // Fetch everything once ID is found, with individual error handling
        await Promise.all([
          (async () => {
            try {
              const res = await secureFetch(`http://localhost:5001/v1/hostels/${targetHostelId}/revenue?timeframe=${timeframe}`);
              const data = await res.json();
              if (data.success) setDashboardData(data.data);
            } catch (e) {
              console.error("Dashboard Fetch Error:", e);
            }
          })(),
          (async () => {
            try {
              const res = await secureFetch(`http://localhost:5001/v1/hostels/${targetHostelId}/payments?limit=50`);
              const data = await res.json();
              if (data.success) setPayments(data.data.payments || []);
            } catch (e) {
              console.error("Payments Fetch Error:", e);
            }
          })()
        ]);
      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [router, timeframe]); // timeframe change will re-trigger initData which is fine

  const fetchDashboardData = async () => {
    if (!activeHostelId) return;
    try {
      const res = await secureFetch(`http://localhost:5001/v1/hostels/${activeHostelId}/revenue?timeframe=${timeframe}`);
      const data = await res.json();
      if (data.success) setDashboardData(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPayments = async () => {
    if (!activeHostelId) return;
    try {
      setLoading(true);
      const res = await secureFetch(`http://localhost:5001/v1/hostels/${activeHostelId}/payments?limit=50`);
      const data = await res.json();
      if (data.success) setPayments(data.data.payments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = () => {
    console.log("Record payment clicked");
  };

  const handleExport = () => {
    const headers = ['Resident', 'Amount', 'Date', 'Method', 'Status'];
    const rows = filteredPayments.map(tx => [
      tx.residentId?.fullName || 'Resident',
      tx.amount,
      new Date(tx.paidAt || tx.createdAt).toLocaleDateString(),
      tx.paymentMethod,
      tx.paymentStatus
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `revenue_report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = payments.filter(tx => {
    const matchesSearch = (tx.residentId?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tx.paymentId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || tx.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReminder = async (residentId) => {
    alert(`Sending payment reminder to resident ${residentId}...`);
    // This could trigger a notification API
  };

  if (loading) return (
    <div className={styles.wrapper}>
      <AdminNav />
      <main className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading text="Aggregating Revenue Data..." />
      </main>
    </div>
  );

  if (!dashboardData) return (
    <div className={styles.wrapper}>
      <AdminNav />
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
      <AdminNav />
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

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <h3>Total Revenue</h3>
              <div className={styles.statValue}>₹{(dashboardData?.stats?.totalRevenue || 0).toLocaleString()}</div>
              <div className={`${styles.statTrend} ${styles.trendUp}`}>
                <TrendingUp size={16} />
                <span>+12.5% from last period</span>
              </div>
            </div>
            <div className={styles.statIcon}>
              <Wallet size={24} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <h3>Pending Dues</h3>
              <div className={`${styles.statValue} ${styles.dueAmount}`}>₹{(dashboardData?.stats?.pendingDues || 0).toLocaleString()}</div>
              <div className={`${styles.statTrend} ${styles.trendDown}`}>
                <TrendingDown size={16} />
                <span>8 residents overdue</span>
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.duesIcon}`}>
              <AlertCircle size={24} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <h3>Upcoming Renewals</h3>
              <div className={styles.statValue}>{dashboardData?.stats?.upcomingRenewals || 0}</div>
              <div className={styles.statTrend} style={{ color: '#3b82f6' }}>
                <Clock size={16} />
                <span>Next 7 days</span>
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.renewalsIcon}`}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <h3>Revenue Growth</h3>
              <p className={styles.chartSubtitle}>Financial performance across {timeframe} periods</p>
            </div>
            <div className={styles.timeframeToggle}>
              {['daily', 'weekly', 'monthly', 'yearly'].map((tf) => (
                <button
                  key={tf}
                  className={`${styles.timeframeBtn} ${timeframe === tf ? styles.active : ''}`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ width: '100%', height: 350, marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData?.trends || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b42f2" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b42f2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#3b42f2" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction History */}
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <div className={styles.historyTitle}>
              <h3>Recent Transactions</h3>
            </div>
            <div className={styles.historyFilters}>
              {isSearchOpen ? (
                <div className={styles.searchWrapper}>
                  <Search size={16} className={styles.searchIcon} />
                  <input 
                    type="text" 
                    className={styles.searchInput}
                    placeholder="Search name or payment ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    onBlur={() => !searchTerm && setIsSearchOpen(false)}
                  />
                </div>
              ) : (
                <button className={styles.filterBtn} onClick={() => setIsSearchOpen(true)}>
                  <Search size={16} /> Search
                </button>
              )}
              
              <div className={styles.filterWrapper}>
                <button className={styles.filterBtn}>
                  <Filter size={16} /> {statusFilter}
                </button>
                <select 
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <button className={styles.filterBtn} onClick={handleExport}>
                <Download size={16} /> Export
              </button>
            </div>
          </div>

          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Resident</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments && filteredPayments.length > 0 ? (
                filteredPayments.map((tx) => (
                  <tr key={tx._id}>
                    <td>
                      <div className={styles.residentCell}>
                        <div className={styles.avatar}>
                          {tx.residentId?.kyc?.profilePhoto ? (
                            <img src={tx.residentId.kyc.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Users size={20} color="#64748b" />
                          )}
                        </div>
                        <div>
                          <span className={styles.residentName}>{tx.residentId?.fullName || "Resident"}</span>
                          <span className={styles.roomNumber}>{tx.paymentId}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.amountCell}>
                        <span>₹{(tx.amount || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                        {new Date(tx.paidAt || tx.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className={styles.methodCell}>
                        {tx.paymentMethod === 'Razorpay' ? (
                          <img 
                            src="https://razorpay.com/favicon.ico" 
                            alt="Razorpay" 
                            style={{ width: '16px', height: '16px', objectFit: 'contain' }} 
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                          />
                        ) : null}
                        {tx.paymentMethod === 'Razorpay' ? (
                          <CreditCard size={14} style={{ display: 'none' }} />
                        ) : (
                          <CreditCard size={14} />
                        )}
                        {tx.paymentMethod}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                        <span className={`${styles.statusBadge} ${tx.paymentStatus === 'Success' ? styles.statusSuccessful : styles.statusPending}`}>
                          {tx.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button className={styles.actionBtn}>
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
            <span>Showing {payments?.length || 0} recent transactions</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={styles.actionBtn}><ChevronLeft size={16} /></button>
              <button className={styles.actionBtn}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

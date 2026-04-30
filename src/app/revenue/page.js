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
    <div className={styles.container}>
      <AdminNav />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Revenue Ledger</h1>
            <p className={styles.subtitle}>Track collections, analyze growth, and manage transaction history.</p>
          </div>
          <button className={styles.primaryButton} onClick={handleRecordPayment}>
            <Wallet size={20} />
            Record Payment
          </button>
        </header>

        {/* KPI Dashboard */}
        <div className={styles.kpiContainer}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper} style={{ background: '#f5f3ff', color: '#4f46e5' }}>
              <Wallet size={28} />
            </div>
            <div className={styles.kpiContent}>
              <div className={styles.kpiValue}>₹{(dashboardData?.stats?.totalRevenue || 0).toLocaleString()}</div>
              <div className={styles.kpiLabel}>
                <span className={styles.kpiTitle}>Total Revenue</span>
                <span className={styles.kpiSubtitle} style={{ color: '#10b981' }}>+12.5% vs last month</span>
              </div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper} style={{ background: '#fffbeb', color: '#d97706' }}>
              <AlertCircle size={28} />
            </div>
            <div className={styles.kpiContent}>
              <div className={styles.kpiValue} style={{ color: '#d97706' }}>₹{(dashboardData?.stats?.pendingDues || 0).toLocaleString()}</div>
              <div className={styles.kpiLabel}>
                <span className={styles.kpiTitle}>Pending Collections</span>
                <span className={styles.kpiSubtitle}>8 residents overdue</span>
              </div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper} style={{ background: '#ecfdf5', color: '#059669' }}>
              <TrendingUp size={28} />
            </div>
            <div className={styles.kpiContent}>
              <div className={styles.kpiValue}>{dashboardData?.stats?.upcomingRenewals || 0}</div>
              <div className={styles.kpiLabel}>
                <span className={styles.kpiTitle}>Upcoming Renewals</span>
                <span className={styles.kpiSubtitle}>Next 7 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Analysis Chart */}
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <h3>Revenue Analysis</h3>
              <p>Visualizing financial performance trends</p>
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
          
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData?.trends || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
                    padding: '16px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#4f46e5" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction History Filter Bar */}
        <div className={styles.filtersBar}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by resident or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filtersGroup}>
            <div className={styles.filterItem}>
              <Filter size={18} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Success">Successful</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <button className={styles.filterItem} onClick={handleExport}>
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.revenueTable}>
            <thead>
              <tr>
                <th>Resident</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((tx) => (
                  <tr key={tx._id}>
                    <td>
                      <div className={styles.residentProfile}>
                        <div className={styles.residentAvatar}>
                          {tx.residentId?.kyc?.profilePhoto ? (
                            <img src={tx.residentId.kyc.profilePhoto} alt="" />
                          ) : (
                            <Users size={20} />
                          )}
                        </div>
                        <div className={styles.residentDetails}>
                          <span className={styles.resName}>{tx.residentId?.fullName || "Resident"}</span>
                          <span className={styles.resId}>{tx.residentId?.residentId || 'RID-N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.resId}>{tx.paymentId || 'PAY-N/A'}</span>
                    </td>
                    <td>
                      <div className={styles.amountCell}>₹{(tx.amount || 0).toLocaleString()}</div>
                    </td>
                    <td>
                      <div className={styles.dateCell}>{new Date(tx.paidAt || tx.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td>
                      <div className={styles.methodBadge}>
                        <CreditCard size={14} />
                        {tx.paymentMethod}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${tx.paymentStatus === 'Success' ? styles.success : tx.paymentStatus === 'Pending' ? styles.pending : styles.failed}`}>
                        {tx.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <button className={styles.actionBtn}>
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <CreditCard size={48} opacity={0.3} />
                      <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>No transactions match your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              Showing {filteredPayments.length} transactions
            </span>
            <div className={styles.paginationBtns}>
              <button disabled={pagination.page === 1}><ChevronLeft size={24} /></button>
              <button disabled={true}><ChevronRight size={24} /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

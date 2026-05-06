"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "../components/AdminNav/AdminNav";
import LoadingComponent from "../components/Loading/Loading";
import styles from "./page.module.css";
import { 
  TrendingUp, Users, Home, Utensils, Calendar, 
  PlusCircle, CreditCard, Bell, ChevronRight,
  Maximize2, ArrowUpRight, DollarSign, Activity,
  MessageSquare, AlertCircle, ShieldCheck, Clock
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { secureFetch } from "../utils/auth";

const DEFAULT_LAYOUT = [
  { id: 'stats', x: 0, y: 0, w: 12, h: 2, type: 'stats' },
  { id: 'revenue', x: 0, y: 2, w: 8, h: 4, type: 'revenue' },
  { id: 'residents', x: 8, y: 2, w: 4, h: 4, type: 'residents' },
  { id: 'attendance', x: 0, y: 6, w: 4, h: 3, type: 'attendance' },
  { id: 'food', x: 4, y: 6, w: 4, h: 3, type: 'food' },
  { id: 'complaints', x: 8, y: 6, w: 4, h: 3, type: 'complaints' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [isLoading, setIsLoading] = useState(true);
  const [hostelData, setHostelData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [foodData, setFoodData] = useState(null);
  const [residents, setResidents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [attendance, setAttendance] = useState(null);
  
  const [activeWidget, setActiveWidget] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialLayout, setInitialLayout] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('nestroom_admin_layout_v2');
    if (saved) {
      try {
        setLayout(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const meRes = await secureFetch("/v1/auth/me");
      const { data: meData } = await meRes.json();
      const hId = meData.user.hostels?.[0]?._id;
      if (!hId) return;

      const [revRes, foodRes, resRes, compRes, attRes] = await Promise.all([
        secureFetch(`/v1/hostels/${hId}/revenue`),
        secureFetch(`/v1/hostels/${hId}/food-schedule`),
        secureFetch(`/v1/hostels/${hId}/residents?limit=5`),
        secureFetch(`/v1/hostels/${hId}/complaints?limit=5`),
        secureFetch(`/v1/hostels/${hId}/attendance`),
      ]);

      const [rev, food, resList, compList, attList] = await Promise.all([
        revRes.json(), foodRes.json(), resRes.json(), compRes.json(), attRes.json()
      ]);

      setHostelData(meData.user.hostels[0]);
      setRevenueData(rev.data);
      setFoodData(food.data?.schedule?.schedule || []);
      setResidents(resList.data?.residents || []);
      setComplaints(compList.data?.complaints || []);
      
      // Calculate attendance summary from history
      if (attList.success && attList.data.length > 0) {
        const latest = attList.data[0];
        setAttendance({
          rate: Math.round((latest.presentCount / (latest.presentCount + latest.absentCount)) * 100) || 0,
          present: latest.presentCount,
          absent: latest.absentCount
        });
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLayout = () => {
    localStorage.setItem('nestroom_admin_layout_v2', JSON.stringify(layout));
    alert("Dashboard arrangement synced with your profile!");
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.removeItem('nestroom_admin_layout_v2');
  };

  const onMouseDown = (e, widgetId, type) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setActiveWidget(widgetId);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialLayout(layout.find(w => w.id === widgetId));
    if (type === 'drag') setIsDragging(true);
    else setIsResizing(true);
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!activeWidget || (!isDragging && !isResizing)) return;
      const dx = e.clientX - initialMousePos.x;
      const dy = e.clientY - initialMousePos.y;
      const canvasWidth = canvasRef.current?.offsetWidth || 1200;
      const cellWidth = canvasWidth / 12;

      setLayout(prev => prev.map(w => {
        if (w.id !== activeWidget) return w;
        if (isDragging) {
          const gridDx = Math.round(dx / cellWidth);
          const gridDy = Math.round(dy / 100);
          return { 
            ...w, 
            x: Math.max(0, Math.min(12 - w.w, initialLayout.x + gridDx)), 
            y: Math.max(0, initialLayout.y + gridDy) 
          };
        } else if (isResizing) {
          const gridDw = Math.round(dx / cellWidth);
          const gridDh = Math.round(dy / 100);
          return { 
            ...w, 
            w: Math.max(2, Math.min(12 - w.x, initialLayout.w + gridDw)), 
            h: Math.max(2, initialLayout.h + gridDh) 
          };
        }
        return w;
      }));
    };
    const onMouseUp = () => { setIsDragging(false); setIsResizing(false); setActiveWidget(null); };
    if (activeWidget) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [activeWidget, isDragging, isResizing, initialMousePos, initialLayout]);

  const renderWidgetContent = (type) => {
    if (isLoading) return (
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <LoadingComponent />
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8' }}>Syncing...</span>
      </div>
    );

    switch (type) {
      case 'stats':
        const occupancy = revenueData?.stats?.totalResidents > 0 
          ? Math.round((revenueData.stats.submitted / revenueData.stats.totalResidents) * 100) 
          : 0;
        return (
          <div style={{ display: 'flex', gap: '3rem', height: '100%', alignItems: 'center', padding: '0 1rem' }}>
            <div style={{ flex: 1 }}>
              <div className={styles.kpiLabel}>Total Capacity</div>
              <div className={styles.kpiValue}>{revenueData?.stats?.totalResidents || 0}</div>
            </div>
            <div style={{ flex: 1.5 }}>
              <div className={styles.kpiLabel}>Occupancy Rate</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <div className={styles.kpiValue}>{occupancy}%</div>
                <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 850 }}>Optimal</div>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${occupancy}%` }}></div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className={styles.kpiLabel}>Net Revenue</div>
              <div className={styles.kpiValue} style={{ color: '#4f46e5' }}>₹{revenueData?.monthlyRevenue?.toLocaleString() || 0}</div>
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div style={{ height: '100%', width: '100%', paddingTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData?.trends || []}>
                <defs>
                  <linearGradient id="widgetColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '1rem' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Monthly Collections']}
                />
                <Area type="monotone" dataKey="earnings" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#widgetColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'residents':
        return (
          <div className={styles.transactionList}>
            {residents.slice(0, 4).map(res => (
              <div key={res._id} className={styles.transactionItem}>
                <div className={styles.transInfo}>
                  <h4>{res.fullName}</h4>
                  <p>Room {res.roomId?.roomNumber || 'N/A'}</p>
                </div>
                <span className={styles.statusBadge} style={{ 
                  background: res.status === 'Active' ? '#ECFDF5' : '#F3F4F6',
                  color: res.status === 'Active' ? '#059669' : '#6B7280'
                }}>
                  {res.status}
                </span>
              </div>
            ))}
            {residents.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No active residents</p>}
          </div>
        );

      case 'food':
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayName = days[new Date().getDay()];
        const todaySchedule = foodData?.find(d => d.dayOfWeek === todayName);
        const currentMeal = todaySchedule?.meals[0] || { mealType: 'Lunch', menu: ['Standard Menu'] };
        
        return (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.foodCard}>
                <div className={styles.mealHeader}>
                    <span>Current Serving: {currentMeal.mealType}</span>
                    <Clock size={16} />
                </div>
                <div className={styles.mealItems}>{currentMeal.menu.join(", ")}</div>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <div className={styles.kpiLabel} style={{ marginBottom: '0.5rem', fontSize: '0.7rem' }}>Special Diet Options</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className={styles.statusBadge} style={{ background: '#f5f3ff', color: '#4f46e5' }}>Veg Only</span>
                <span className={styles.statusBadge} style={{ background: '#f5f3ff', color: '#4f46e5' }}>Gluten Free</span>
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <div className={styles.kpiLabel}>Today&apos;s Verification</div>
                        <div style={{ fontSize: '2.25rem', fontWeight: 850 }}>{attendance?.rate || 0}%</div>
                    </div>
                    <div style={{ background: '#f5f3ff', padding: '0.75rem', borderRadius: '1rem' }}>
                      <ShieldCheck color="#4f46e5" size={24} strokeWidth={2.5} />
                    </div>
                </div>
                <div className={styles.progressBar} style={{ height: '14px' }}>
                    <div className={styles.progressFill} style={{ width: `${attendance?.rate || 0}%` }}></div>
                </div>
                <div style={{ marginTop: 'auto', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#059669' }}>{attendance?.present || 0} Present</span>
                    <span style={{ color: '#ef4444' }}>{attendance?.absent || 0} Absent</span>
                </div>
            </div>
        );

      case 'complaints':
        return (
          <div className={styles.transactionList}>
            {complaints.slice(0, 3).map(comp => (
              <div key={comp._id} className={styles.transactionItem}>
                <div className={styles.transInfo}>
                  <h4 style={{ color: comp.priority === 'High' ? '#ef4444' : '#111827' }}>{comp.title}</h4>
                  <p>{comp.category} • {comp.residentId?.fullName || 'Resident'}</p>
                </div>
                <AlertCircle size={18} color={comp.priority === 'High' ? '#ef4444' : '#cbd5e1'} />
              </div>
            ))}
            {complaints.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>All systems functional</p>}
            <button className={styles.resetBtn} style={{ marginTop: 'auto', width: '100%', padding: '0.5rem' }} onClick={() => router.push('/complaints')}>View Desk</button>
          </div>
        );

      default: return null;
    }
  };

  const getWidgetTitle = (type) => {
    switch(type) {
      case 'stats': return { label: 'Operational Overview', icon: <Activity size={20} color="#4f46e5" strokeWidth={2.5} /> };
      case 'revenue': return { label: 'Fiscal Trajectory', icon: <TrendingUp size={20} color="#10b981" strokeWidth={2.5} /> };
      case 'residents': return { label: 'Latest Admissions', icon: <Users size={20} color="#6366f1" strokeWidth={2.5} /> };
      case 'food': return { label: 'Culinary Schedule', icon: <Utensils size={20} color="#f59e0b" strokeWidth={2.5} /> };
      case 'attendance': return { label: 'Resident Verification', icon: <ShieldCheck size={20} color="#4f46e5" strokeWidth={2.5} /> };
      case 'complaints': return { label: 'Grievance Monitor', icon: <MessageSquare size={20} color="#ef4444" strokeWidth={2.5} /> };
      default: return { label: 'Data Node', icon: <Activity size={20} /> };
    }
  };

  return (
    <div className={styles.wrapper}>
      <AdminNav />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h1>NestRoom Command</h1>
            <p>Unified Operational Hub for {hostelData?.name || 'Your Hostel'}</p>
          </div>
          <div className={styles.controls}>
            <button className={styles.resetBtn} onClick={resetLayout}>Reset Workspace</button>
            <button className={styles.saveBtn} onClick={saveLayout}>
              <ShieldCheck size={20} />
              Save Layout
            </button>
          </div>
        </header>

        <div className={styles.canvas} ref={canvasRef}>
          {layout.map((w) => {
            const { label, icon } = getWidgetTitle(w.type);
            return (
              <div 
                key={w.id} 
                className={`${styles.widget} ${activeWidget === w.id ? (isDragging ? styles.dragging : styles.resizing) : ""}`}
                style={{
                  gridColumn: `${w.x + 1} / span ${w.w}`,
                  gridRow: `${w.y + 1} / span ${w.h}`,
                  zIndex: activeWidget === w.id ? 1000 : 1
                }}
              >
                <div className={styles.widgetHeader} onMouseDown={(e) => onMouseDown(e, w.id, 'drag')}>
                  <div className={styles.widgetTitle}>{icon}{label}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F3F4F6' }}></div>
                  </div>
                </div>
                <div className={styles.widgetContent}>{renderWidgetContent(w.type)}</div>
                <div className={styles.resizeHandle} onMouseDown={(e) => onMouseDown(e, w.id, 'resize')}>
                  <div style={{ width: '4px', height: '4px', background: '#94a3b8', borderRadius: '50%' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

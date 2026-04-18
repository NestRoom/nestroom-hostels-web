"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar/Sidebar";
import LoadingComponent from "../components/Loading/Loading";
import styles from "./page.module.css";
import { 
  TrendingUp, Users, Home, Utensils, Calendar, 
  PlusCircle, CreditCard, Bell, ChevronRight,
  Maximize2, ArrowUpRight, DollarSign, Activity
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { secureFetch } from "../utils/auth";


const GRID_SIZE = 12; // 12 columns
const ROW_HEIGHT = 100; // 100px rows

const DEFAULT_LAYOUT = [
  { id: 'stats', x: 0, y: 0, w: 12, h: 2, type: 'stats' },
  { id: 'revenue', x: 0, y: 2, w: 8, h: 4, type: 'revenue' },
  { id: 'residents', x: 8, y: 2, w: 4, h: 4, type: 'residents' },
  { id: 'attendance', x: 0, y: 6, w: 4, h: 3, type: 'attendance' },
  { id: 'food', x: 4, y: 6, w: 4, h: 3, type: 'food' },
  { id: 'actions', x: 8, y: 6, w: 4, h: 3, type: 'actions' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [isLoading, setIsLoading] = useState(true);
  const [hostelData, setHostelData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [foodData, setFoodData] = useState(null);
  const [residents, setResidents] = useState([]);
  
  // Drag and Resize State
  const [activeWidget, setActiveWidget] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialLayout, setInitialLayout] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Load saved layout if exists
    const saved = localStorage.getItem('nestroom_admin_layout');
    if (saved) {
      try {
        setLayout(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved layout", e);
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Get Me & Hostel
      const meRes = await secureFetch("http://localhost:5001/v1/auth/me");
      const { data: meData } = await meRes.json();
      const hId = meData.user.hostels?.[0]?._id;
      if (!hId) return;

      // 2. Parallel Fetch
      const [revRes, foodRes, resRes] = await Promise.all([
        secureFetch(`http://localhost:5001/v1/hostels/${hId}/revenue`),
        secureFetch(`http://localhost:5001/v1/hostels/${hId}/food-schedule`),
        secureFetch(`http://localhost:5001/v1/hostels/${hId}/residents`),
      ]);

      const rev = await revRes.json();
      const food = await foodRes.json();
      const resList = await resRes.json();


      setHostelData(meData.user.hostels[0]);
      setRevenueData(rev.data);
      setFoodData(food.data?.schedule);
      setResidents(resList.data?.residents || []);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLayout = () => {
    localStorage.setItem('nestroom_admin_layout', JSON.stringify(layout));
    alert("Dashboard layout saved successfully!");
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.removeItem('nestroom_admin_layout');
  };

  // Drag Handlers
  const onMouseDown = (e, widgetId, type) => {
    if (e.button !== 0) return; // Only left click
    
    e.preventDefault();
    setActiveWidget(widgetId);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialLayout(layout.find(w => w.id === widgetId));
    
    if (type === 'drag') {
      setIsDragging(true);
    } else {
      setIsResizing(true);
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!activeWidget || (!isDragging && !isResizing)) return;

      const dx = e.clientX - initialMousePos.x;
      const dy = e.clientY - initialMousePos.y;

      const canvasWidth = canvasRef.current?.offsetWidth || 1200;
      const cellWidth = canvasWidth / GRID_SIZE;

      setLayout(prev => prev.map(w => {
        if (w.id !== activeWidget) return w;

        if (isDragging) {
          const gridDx = Math.round(dx / cellWidth);
          const gridDy = Math.round(dy / ROW_HEIGHT);
          
          let newX = Math.max(0, Math.min(GRID_SIZE - w.w, initialLayout.x + gridDx));
          let newY = Math.max(0, initialLayout.y + gridDy);
          
          return { ...w, x: newX, y: newY };
        } else if (isResizing) {
          const gridDw = Math.round(dx / cellWidth);
          const gridDh = Math.round(dy / ROW_HEIGHT);
          
          let newW = Math.max(1, Math.min(GRID_SIZE - w.x, initialLayout.w + gridDw));
          let newH = Math.max(1, initialLayout.h + gridDh);
          
          return { ...w, w: newW, h: newH };
        }
        return w;
      }));
    };

    const onMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setActiveWidget(null);
    };

    if (activeWidget) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [activeWidget, isDragging, isResizing, initialMousePos, initialLayout]);

  const renderWidgetContent = (type) => {
    if (isLoading) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><LoadingComponent /></div>;

    switch (type) {
      case 'stats':
        return (
          <div style={{ display: 'flex', gap: '2rem', height: '100%', alignItems: 'center', padding: '0 1rem' }}>
            <div style={{ flex: 1 }}>
              <div className={styles.kpiLabel}>Total Residents</div>
              <div className={styles.kpiValue}>{revenueData?.stats?.totalResidents || 0}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className={styles.kpiLabel}>Occupancy</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <div className={styles.kpiValue}>{Math.round((revenueData?.stats?.submitted / revenueData?.stats?.totalResidents) * 100) || 0}%</div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>Active</div>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${(revenueData?.stats?.submitted / revenueData?.stats?.totalResidents) * 100}%` }}></div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className={styles.kpiLabel}>Monthly Revenue</div>
              <div className={styles.kpiValue}>₹{revenueData?.monthlyRevenue.toLocaleString() || 0}</div>
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div style={{ height: '100%', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData?.trends || []}>
                <defs>
                  <linearGradient id="widgetColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b42f2" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b42f2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis hide />
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
                  fill="url(#widgetColor)" 
                />
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
                  <h4>{res.name}</h4>
                  <p>Room: {res.roomNumber}</p>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{res.status}</div>
              </div>
            ))}
            <button className={styles.actionBtn} style={{ marginTop: 'auto', background: 'none', border: 'none', color: '#3b42f2', textDecoration: 'underline' }} onClick={() => router.push('/residents')}>Manage All Residents</button>
          </div>
        );

      case 'food':
        const todayMeal = "Lunch"; // simplified
        const todayMenu = ["Rice", "Dal", "Roti", "Mix Veg"]; // simplified
        return (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className={styles.foodCard}>
                <div className={styles.mealHeader}>
                    <span>{todayMeal}</span>
                    <Utensils size={14} />
                </div>
                <div className={styles.mealItems}>{todayMenu.join(", ")}</div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Check the full schedule to manage other meals for today.</p>
            <button className={styles.actionBtn} style={{ marginTop: 'auto' }} onClick={() => router.push('/food')}>
                <span>View Full Menu</span>
            </button>
          </div>
        );

      case 'attendance':
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <div className={styles.kpiLabel}>Today&apos;s Attendance</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>84%</div>
                    </div>
                    <Activity color="#3b42f2" />
                </div>
                <div className={styles.progressBar} style={{ height: '12px' }}>
                    <div className={styles.progressFill} style={{ width: '84%' }}></div>
                </div>
                <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>142 Present</span>
                    <span>26 Absent</span>
                </div>
            </div>
        );

      case 'actions':
        return (
          <div className={styles.actionGrid}>
            <div className={styles.actionBtn} onClick={() => router.push('/residents')}>
                <PlusCircle size={20} />
                <span>Add Resident</span>
            </div>
            <div className={styles.actionBtn} onClick={() => router.push('/revenue')}>
                <CreditCard size={20} />
                <span>Record Fee</span>
            </div>
            <div className={styles.actionBtn} onClick={() => router.push('/notification')}>
                <Bell size={20} />
                <span>Notify All</span>
            </div>
            <div className={styles.actionBtn} onClick={() => router.push('/profile')}>
                <Maximize2 size={20} />
                <span>Hostel Profile</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getWidgetTitle = (type) => {
    switch(type) {
      case 'stats': return { label: 'Performance Summary', icon: <Activity size={18} color="#3b42f2" /> };
      case 'revenue': return { label: 'Revenue Trends', icon: <TrendingUp size={18} color="#10b981" /> };
      case 'residents': return { label: 'Latest Residents', icon: <Users size={18} color="#6366f1" /> };
      case 'food': return { label: 'Today\'s Specials', icon: <Utensils size={18} color="#f59e0b" /> };
      case 'attendance': return { label: 'Attendance Recap', icon: <Calendar size={18} color="#ef4444" /> };
      case 'actions': return { label: 'Quick Operations', icon: <Home size={18} color="#8b5cf6" /> };
      default: return { label: 'Widget', icon: <Maximize2 size={18} /> };
    }
  };

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>Admin Dashboard</h1>
            <p>Hostel Management & Growth Overview</p>
          </div>
          <div className={styles.controls}>
            <button className={styles.resetBtn} onClick={resetLayout}>Reset Canvas</button>
            <button className={styles.saveBtn} onClick={saveLayout}>
              <ArrowUpRight size={18} />
              Save Dashboard
            </button>
          </div>
        </div>

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
                  zIndex: activeWidget === w.id ? 100 : 1
                }}
              >
                <div 
                  className={styles.widgetHeader} 
                  onMouseDown={(e) => onMouseDown(e, w.id, 'drag')}
                >
                  <div className={styles.widgetTitle}>
                    {icon}
                    {label}
                  </div>
                  <Maximize2 size={14} color="#cbd5e1" />
                </div>
                <div className={styles.widgetContent}>
                  {renderWidgetContent(w.type)}
                </div>
                <div 
                  className={styles.resizeHandle}
                  onMouseDown={(e) => onMouseDown(e, w.id, 'resize')}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

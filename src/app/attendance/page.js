"use client";
import { useState, useEffect } from "react";
import { secureFetch } from "../utils/auth";
import dynamic from "next/dynamic";
import AdminNav from "../components/AdminNav/AdminNav";
import LoadingComponent from "../components/Loading/Loading";

const GoogleMapGeofence = dynamic(() => import("../components/Map/GoogleMapGeofence"), { 
  ssr: false,
  loading: () => <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '1.5rem', color: '#6b7280' }}>Loading Map Engine...</div>
});

import { 
  AlertCircle, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Calendar,
  Users,
  Search,
  ChevronRight,
  ChevronLeft,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import styles from "./page.module.css";

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState("live"); // live, history, settings
  const [isLoading, setIsLoading] = useState(true);
  const [hostelId, setHostelId] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, pending: 0, onLeave: 0 });
  const [config, setConfig] = useState({
    enabled: false,
    startTime: "21:00",
    windowMinutes: 120,
    geofenceRadius: 500,
    location: { latitude: 0, longitude: 0 }
  });

  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyRecords, setHistoryRecords] = useState([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // 1. Get Me
      const meRes = await secureFetch('http://localhost:5001/v1/auth/me');
      const meData = await meRes.json();
      const hId = meData.data?.user?.hostels?.[0]?._id;
      if (!hId) return;
      setHostelId(hId);

      // 2. Get Hostel Config
      const hostelRes = await secureFetch(`http://localhost:5001/v1/hostels/${hId}`);
      const hostelData = await hostelRes.json();
      const h = hostelData.data;
      setConfig({
        enabled: h.attendanceConfig?.enabled || false,
        startTime: h.attendanceConfig?.startTime || "21:00",
        windowMinutes: h.attendanceConfig?.windowMinutes || 120,
        geofenceRadius: h.geofenceRadius || 500,
        location: { 
          latitude: h.location?.coordinates[1] || 0, 
          longitude: h.location?.coordinates[0] || 0 
        }
      });

      // 3. Get Today's Records
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const recordsRes = await secureFetch(`http://localhost:5001/v1/hostels/${hId}/attendance?limit=100&fromDate=${todayStart.toISOString()}&toDate=${todayEnd.toISOString()}`);
      const recordsData = await recordsRes.json();
      const records = recordsData.data?.records || [];
      setAttendanceRecords(records);

      // Compute stats
      const s = { present: 0, absent: 0, pending: 0, onLeave: 0 };
      records.forEach(r => {
        if (r.status === "Present") s.present++;
        else if (r.status === "Absent") s.absent++;
        else if (r.status === "OnLeave") s.onLeave++;
        else s.pending++;
      });
      setStats(s);

    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchHistory = async () => {
    if (!hostelId || !historyDate) return;
    try {
      const dateStart = new Date(historyDate);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(historyDate);
      dateEnd.setHours(23, 59, 59, 999);
      
      const res = await secureFetch(`http://localhost:5001/v1/hostels/${hostelId}/attendance?limit=100&fromDate=${dateStart.toISOString()}&toDate=${dateEnd.toISOString()}`);
      const data = await res.json();
      setHistoryRecords(data.data?.records || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, historyDate, hostelId]);

  const triggerSurpriseCheck = async () => {
    if (!hostelId) return;
    try {
      const res = await secureFetch(`http://localhost:5001/v1/hostels/${hostelId}/attendance/request?isSurprise=true`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success === true) {
        alert("Surprise check triggered!");
        fetchData();
      } else {
        alert(data.error?.message || "Failed to trigger check");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await secureFetch(`http://localhost:5001/v1/hostels/${hostelId}/attendance/config`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success === true) {
        alert("Configuration saved!");
        fetchData();
      } else {
        alert(data.error?.message || "Failed to save configuration");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
      {isLoading && <LoadingComponent />}
      <AdminNav />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Attendance Registry</h1>
            <p className={styles.subtitle}>Geofenced verification and real-time resident monitoring.</p>
          </div>
          <button className={styles.surpriseBtn} onClick={triggerSurpriseCheck}>
            <AlertCircle size={20} />
            Trigger Surprise Check
          </button>
        </header>

        <div className={styles.tabContainer}>
          <div 
            className={`${styles.tab} ${activeTab === 'live' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live Monitor
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Registry Logs
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Geofence Config
          </div>
        </div>

        {activeTab === 'live' && (
          <>
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Present</span>
                <span className={styles.statValue} style={{ color: '#059669' }}>{stats.present}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Absent</span>
                <span className={styles.statValue} style={{ color: '#dc2626' }}>{stats.absent}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Pending</span>
                <span className={styles.statValue} style={{ color: '#d97706' }}>{stats.pending}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>On Leave</span>
                <span className={styles.statValue} style={{ color: '#4b5563' }}>{stats.onLeave}</span>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Resident</th>
                    <th>Status</th>
                    <th>Geofence Verification</th>
                    <th>Time Received</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record) => (
                      <tr key={record._id}>
                        <td>
                          <div className={styles.residentInfo}>
                            <div className={styles.avatar}>
                              {record.residentId?.fullName?.charAt(0) || "R"}
                            </div>
                            <div>
                              <div className={styles.residentName}>{record.residentId?.fullName}</div>
                              <div className={styles.residentPhone}>Room {record.residentId?.roomId?.roomNumber || "-"}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles['status' + record.status]}`}>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          {record.geofenceCheck?.distanceFromHostel !== undefined ? (
                            <div className={record.geofenceCheck.withinGeofence ? styles.geoSuccess : styles.geoFail}>
                              {record.geofenceCheck.withinGeofence ? (
                                <><ShieldCheck size={16} /> Verified In-Bound</>
                              ) : (
                                <><MapPin size={16} /> {Math.round(record.geofenceCheck.distanceFromHostel)}m Out</>
                              )}
                            </div>
                          ) : (
                            <span className={styles.pendingGeo}>No GPS Data</span>
                          )}
                        </td>
                        <td>
                          <div className={styles.residentPhone}>
                             {record.responseReceivedAt ? new Date(record.responseReceivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                          </div>
                        </td>
                        <td>
                           <span className={styles.residentPhone}>{record.remarks || "—"}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
                        No records for the current verification window.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div className={styles.settingsGrid}>
            <div className={styles.configCard}>
              <h3 className={styles.configTitle}><Clock size={22} /> Automation Rules</h3>
              <form onSubmit={saveConfig}>
                <div className={styles.toggleGroup}>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={config.enabled} 
                      onChange={(e) => setConfig({...config, enabled: e.target.checked})}
                    />
                    <span className={styles.slider}></span>
                  </label>
                  <span>Enable Daily Roll-Call</span>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Registry Window Start</label>
                  <input 
                    type="time" 
                    className={styles.inputControl}
                    value={config.startTime} 
                    onChange={(e) => setConfig({...config, startTime: e.target.value})}
                  />
                  <p className={styles.inputHint}>Verification requests are broadcasted at this time.</p>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Compliance Window (Minutes)</label>
                  <input 
                    type="number" 
                    className={styles.inputControl}
                    value={config.windowMinutes} 
                    onChange={(e) => setConfig({...config, windowMinutes: parseInt(e.target.value)})}
                  />
                </div>

                <h3 className={styles.configTitle}><MapPin size={22} /> Geofence Parameters</h3>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Hostel Anchor Coordinates</label>
                  <div className={styles.coordinatesRow}>
                    <input 
                      placeholder="Lat" className={styles.inputControl} type="number" step="any"
                      value={config.location.latitude}
                      onChange={(e) => setConfig({...config, location: {...config.location, latitude: parseFloat(e.target.value)}})}
                    />
                    <input 
                      placeholder="Lng" className={styles.inputControl} type="number" step="any"
                      value={config.location.longitude}
                      onChange={(e) => setConfig({...config, location: {...config.location, longitude: parseFloat(e.target.value)}})}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Geofence Radius: {config.geofenceRadius}m</label>
                  <input 
                    type="range" min="50" max="2000" step="50"
                    className={styles.rangeInput}
                    value={config.geofenceRadius}
                    onChange={(e) => setConfig({...config, geofenceRadius: parseInt(e.target.value)})}
                  />
                </div>

                <button type="submit" className={styles.saveBtn}>Apply Configuration</button>
              </form>
            </div>

            <div className={styles.visualCard}>
               <GoogleMapGeofence 
                 latitude={config.location.latitude}
                 longitude={config.location.longitude}
                 radius={config.geofenceRadius}
                 onLocationChange={(lat, lng) => setConfig({...config, location: { latitude: lat, longitude: lng }})}
                 onRadiusChange={(r) => setConfig({...config, geofenceRadius: r})}
               />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
           <div className={styles.historyContainer}>
              <div className={styles.header} style={{ marginBottom: '2.5rem' }}>
                <h3 className={styles.configTitle} style={{ margin: 0 }}><Calendar size={22} /> Attendance Registry Log</h3>
                <input 
                  type="date" 
                  className={styles.inputControl} 
                  style={{ width: 'auto' }}
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                />
              </div>
              
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Resident</th>
                      <th>Status</th>
                      <th>Verification</th>
                      <th>Time</th>
                      <th>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRecords.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
                          No records found for the selected date.
                        </td>
                      </tr>
                    ) : (
                      historyRecords.map((record) => (
                        <tr key={record._id}>
                          <td>
                            <div className={styles.residentInfo}>
                              <div className={styles.avatar}>
                                {record.residentId?.fullName?.charAt(0) || "R"}
                              </div>
                              <div>
                                <div className={styles.residentName}>{record.residentId?.fullName}</div>
                                <div className={styles.residentPhone}>Room {record.residentId?.roomId?.roomNumber || "-"}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles['status' + record.status]}`}>
                              {record.status}
                            </span>
                          </td>
                          <td>
                            {record.geofenceCheck?.distanceFromHostel !== undefined ? (
                              <div className={record.geofenceCheck.withinGeofence ? styles.geoSuccess : styles.geoFail}>
                                {record.geofenceCheck.withinGeofence ? <ShieldCheck size={14} /> : <MapPin size={14} />}
                                {record.geofenceCheck.withinGeofence ? "In-Bound" : `${Math.round(record.geofenceCheck.distanceFromHostel)}m Out`}
                              </div>
                            ) : <span className={styles.pendingGeo}>—</span>}
                          </td>
                          <td>
                            <div className={styles.residentPhone}>
                               {record.responseReceivedAt ? new Date(record.responseReceivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                            </div>
                          </td>
                          <td>
                             <span className={styles.residentPhone}>{record.responseType || "Automatic"}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        )}
      </main>
    </div>
  );
}

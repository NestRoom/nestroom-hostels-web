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
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Attendance Management</h1>
            <p className={styles.subtitle}>Geofenced, real-time presence verification for residents.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.surpriseBtn} onClick={triggerSurpriseCheck}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Trigger Surprise Check
            </button>
          </div>
        </div>

        <div className={styles.tabContainer}>
          <div 
            className={`${styles.tab} ${activeTab === 'live' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live Feed
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Config & Geofence
          </div>
        </div>

        {activeTab === 'live' && (
          <div className={styles.liveGrid}>
            <div className={styles.statsRow}>
              <div className={styles.statCard} style={{ borderLeftColor: '#111827', background: '#ffffff' }}>
                <span className={styles.statLabel}>Total Residents</span>
                <span className={styles.statValue}>{attendanceRecords.length}</span>
              </div>
              <div className={styles.statCard} style={{ borderLeftColor: '#10B981', background: 'rgba(16, 185, 129, 0.03)' }}>
                <span className={styles.statLabel} style={{ color: '#10B981' }}>Present</span>
                <span className={styles.statValue}>{stats.present}</span>
              </div>
              <div className={styles.statCard} style={{ borderLeftColor: '#EF4444', background: 'rgba(239, 68, 68, 0.03)' }}>
                <span className={styles.statLabel} style={{ color: '#EF4444' }}>Absent</span>
                <span className={styles.statValue}>{stats.absent}</span>
              </div>
              <div className={styles.statCard} style={{ borderLeftColor: '#F59E0B', background: 'rgba(245, 158, 11, 0.03)' }}>
                <span className={styles.statLabel} style={{ color: '#F59E0B' }}>Pending</span>
                <span className={styles.statValue}>{stats.pending}</span>
              </div>
              <div className={styles.statCard} style={{ borderLeftColor: '#6B7280', background: 'rgba(107, 114, 128, 0.03)' }}>
                <span className={styles.statLabel}>On Leave</span>
                <span className={styles.statValue}>{stats.onLeave}</span>
              </div>
            </div>

            <div className={styles.feedTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>RESIDENT</th>
                    <th>STATUS</th>
                    <th>LOCATION VERIFICATION</th>
                    <th>TIME RESPONDED</th>
                    <th>REMARKS</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
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
                        {record.geofenceCheck && record.geofenceCheck.distanceFromHostel !== undefined && record.geofenceCheck.distanceFromHostel !== null ? (
                          <div className={record.geofenceCheck.withinGeofence ? styles.geoSuccess : styles.geoFail}>
                            {record.geofenceCheck.withinGeofence ? (
                              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Within Geofence</>
                            ) : (
                              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> {Math.round(record.geofenceCheck.distanceFromHostel)}m Outside</>
                            )}
                          </div>
                        ) : (
                          <span className={styles.pendingGeo}>Awaiting location data...</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.residentPhone}>
                           {record.responseReceivedAt ? new Date(record.responseReceivedAt).toLocaleTimeString() : "-"}
                        </div>
                      </td>
                      <td>
                         <span className={styles.remarks}>{record.remarks || "-"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.settingsGrid}>
            <div className={styles.configCard}>
              <h3 className={styles.configTitle}>Attendance Rules</h3>
              <form onSubmit={saveConfig}>
                <div className={styles.toggleGroup}>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      className={styles.switchInput}
                      checked={config.enabled} 
                      onChange={(e) => setConfig({...config, enabled: e.target.checked})}
                    />
                    <span className={styles.slider}></span>
                  </label>
                  <span>Enable Automated Daily Attendance</span>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Scheduled Start Time</label>
                  <input 
                    type="time" 
                    className={styles.inputControl}
                    value={config.startTime} 
                    onChange={(e) => setConfig({...config, startTime: e.target.value})}
                  />
                  <p className={styles.inputHint}>Notification will be sent to residents at this time.</p>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Verification Window (Minutes)</label>
                  <input 
                    type="number" 
                    className={styles.inputControl}
                    value={config.windowMinutes} 
                    onChange={(e) => setConfig({...config, windowMinutes: parseInt(e.target.value)})}
                  />
                  <p className={styles.inputHint}>If not responded within this window, marked as Absent.</p>
                </div>

                <h3 className={styles.configTitle}>Geofencing Setup</h3>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Hostel Center Coordinates</label>
                  <div className={styles.coordinatesRow}>
                    <input 
                      placeholder="Latitude" 
                      className={styles.inputControl}
                      type="number" step="any"
                      value={config.location.latitude}
                      onChange={(e) => setConfig({...config, location: {...config.location, latitude: parseFloat(e.target.value)}})}
                    />
                    <input 
                      placeholder="Longitude" 
                      className={styles.inputControl}
                      type="number" step="any"
                      value={config.location.longitude}
                      onChange={(e) => setConfig({...config, location: {...config.location, longitude: parseFloat(e.target.value)}})}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Geofence Radius (Metres): {config.geofenceRadius}m</label>
                  <input 
                    type="range" min="50" max="2000" step="50"
                    className={styles.rangeInput}
                    value={config.geofenceRadius}
                    onChange={(e) => setConfig({...config, geofenceRadius: parseInt(e.target.value)})}
                  />
                </div>

                <button type="submit" className={styles.saveBtn}>Save Settings</button>
              </form>
            </div>

            <div className={styles.visualCard} style={{ padding: 0, overflow: 'hidden' }}>
               <GoogleMapGeofence 
                 latitude={config.location.latitude}
                 longitude={config.location.longitude}
                 radius={config.geofenceRadius}
                 onLocationChange={(lat, lng) => setConfig({
                   ...config, 
                   location: { latitude: lat, longitude: lng }
                 })}
                 onRadiusChange={(r) => setConfig({
                   ...config,
                   geofenceRadius: r
                 })}
               />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
           <div className={styles.historyContainer}>
              <div className={styles.historyHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0 }}>Attendance Log</h3>
                <input 
                  type="date" 
                  className={styles.inputControl} 
                  style={{ width: 'auto' }}
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                />
              </div>
              
              <div className={styles.feedTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>RESIDENT</th>
                      <th>STATUS</th>
                      <th>LOCATION VERIFICATION</th>
                      <th>TIME RESPONDED</th>
                      <th>TYPE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRecords.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                          No attendance records found for this date.
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
                            {record.geofenceCheck && record.geofenceCheck.distanceFromHostel !== undefined && record.geofenceCheck.distanceFromHostel !== null ? (
                              <div className={record.geofenceCheck.withinGeofence ? styles.geoSuccess : styles.geoFail}>
                                {record.geofenceCheck.withinGeofence ? (
                                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Within Geofence</>
                                ) : (
                                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> {Math.round(record.geofenceCheck.distanceFromHostel)}m Outside</>
                                )}
                              </div>
                            ) : (
                              <span className={styles.pendingGeo}>-</span>
                            )}
                          </td>
                          <td>
                            <div className={styles.residentPhone}>
                               {record.responseReceivedAt ? new Date(record.responseReceivedAt).toLocaleTimeString() : "-"}
                            </div>
                          </td>
                          <td>
                             <span className={styles.remarks}>{record.responseType || "-"}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

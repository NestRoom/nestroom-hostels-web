'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar/Sidebar';
import Loading from '../components/Loading/Loading';
import styles from './page.module.css';

export default function RoomsPage() {
  const router = useRouter();
  const [activeHostelId, setActiveHostelId] = useState(null);
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wizardData, setWizardData] = useState({ buildingsCount: 1, floorsCount: 1 });
  const [buildings, setBuildings] = useState([]);
  const [originalRooms, setOriginalRooms] = useState([]);

  // For Room Editing
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomEditData, setRoomEditData] = useState({ type: 'Single', bedCount: 1, number: '' });

  const [draggedBuildingId, setDraggedBuildingId] = useState(null);
  const [selectedBuildingGrid, setSelectedBuildingGrid] = useState(null);

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
          alert("No hostel found in profile. Please add a hostel first.");
          setLoading(false);
          return;
        }
        setActiveHostelId(targetHostel);

        const roomsRes = await fetch(`http://localhost:5001/v1/hostels/${targetHostel}/rooms`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const { data: roomsData } = await roomsRes.json();

        if (roomsData?.buildings?.length > 0) {
          const existingRooms = [];
          const formattedBuildings = roomsData.buildings.map(b => {
             return {
               id: b._id || b.buildingId,
               _id: b._id || b.buildingId,
               name: b.buildingName,
               floors: b.floors.map(f => {
                  return {
                     level: f.floorNumber,
                     rooms: f.rooms.map(r => {
                       const rObj = {
                         id: r._id,
                         _id: r._id,
                         number: r.roomNumber,
                         type: r.roomType || 'Single',
                         bedCount: r.bedCount || 1,
                         availableBeds: r.availableBeds !== undefined ? r.availableBeds : (r.bedCount || 1),
                         roomStatus: r.roomStatus || 'Available',
                         pricing: r.pricing
                       };
                       existingRooms.push(rObj);
                       return rObj;
                     })
                  };
               })
             };
          });

          setOriginalRooms(existingRooms);
          setBuildings(formattedBuildings);
          setIsSetupMode(false);
        } else {
          setIsSetupMode(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [router]);

  const handleSetupComplete = (e) => {
    e.preventDefault();
    const newBuildings = [];
    for (let i = 1; i <= wizardData.buildingsCount; i++) {
      const floors = [];
      for (let j = 1; j <= wizardData.floorsCount; j++) {
        floors.push({
          level: j,
          rooms: [
            { id: `temp_b${i}f${j}r1`, number: `${j}01`, type: 'Single', bedCount: 1 },
            { id: `temp_b${i}f${j}r2`, number: `${j}02`, type: 'Double', bedCount: 2 }
          ]
        });
      }
      newBuildings.push({
        id: `temp_b${i}`,
        name: wizardData.buildingsCount > 1 ? `Building ${String.fromCharCode(64 + i)}` : `Main Building`,
        floors
      });
    }
    setBuildings(newBuildings);
    setIsSetupMode(false);
    setIsEditing(true);
  };

  const handleAddFloor = (bId) => {
    if (!isEditing) return;
    setBuildings(prev => prev.map(b => {
      if (b.id !== bId) return b;
      let maxLevel = b.floors.reduce((max, f) => f.level > max ? f.level : max, 0);
      return { ...b, floors: [...b.floors, { level: maxLevel + 1, rooms: [] }] };
    }));
  };

  const handleAddRoom = (bId, fLevel) => {
    if (!isEditing) return;
    setBuildings(prev => prev.map(b => {
      if (b.id !== bId) return b;
      return {
        ...b,
        floors: b.floors.map(f => {
          if (f.level !== fLevel) return f;
          const newRoomNum = `${fLevel}${String(f.rooms.length + 1).padStart(2, '0')}`;
          return {
            ...f,
            rooms: [...f.rooms, { id: `temp_r_${Date.now()}`, number: newRoomNum, type: 'Single', bedCount: 1 }]
          };
        })
      };
    }));
  };

  const handleRemoveRoom = (bId, fLevel, roomId) => {
    if (!isEditing) return;
    if (!window.confirm("Delete this room?")) return;
    setBuildings(prev => prev.map(b => {
      if (b.id !== bId) return b;
      return {
        ...b,
        floors: b.floors.map(f => {
          if (f.level !== fLevel) return f;
          return { ...f, rooms: f.rooms.filter(r => r.id !== roomId) };
        })
      };
    }));
  };

  const handleRemoveFloor = (bId, fLevel) => {
    if (!isEditing) return;
    if (!window.confirm("Delete entire floor?")) return;
    setBuildings(prev => prev.map(b => {
      if (b.id !== bId) return b;
      return { ...b, floors: b.floors.filter(f => f.level !== fLevel) };
    }));
  };

  const handleRemoveBuilding = (bId) => {
    if (!isEditing) return;
    if (!window.confirm("Delete entire building structure?")) return;
    setBuildings(prev => prev.filter(b => b.id !== bId));
  };

  const handleAddBuilding = () => {
    if (!isEditing) return;
    const newId = `temp_b_${Date.now()}`;
    setBuildings(prev => [
      ...prev,
      { id: newId, name: `Building ${String.fromCharCode(64 + prev.length + 1)}`, floors: [{ level: 1, rooms: [] }] }
    ]);
  };

  const openRoomEditor = (bId, fLevel, room) => {
     setSelectedRoom({ bId, fLevel, roomId: room.id });
     setRoomEditData({ type: room.type || 'Single', bedCount: room.bedCount || 1, number: room.number });
  };

  const saveRoomDetails = () => {
     if (!selectedRoom) return;
     setBuildings(prev => prev.map(b => {
        if (b.id !== selectedRoom.bId) return b;
        return {
           ...b,
           floors: b.floors.map(f => {
              if (f.level !== selectedRoom.fLevel) return f;
              return {
                 ...f,
                 rooms: f.rooms.map(r => {
                    if (r.id !== selectedRoom.roomId) return r;
                    return { ...r, type: roomEditData.type, bedCount: parseInt(roomEditData.bedCount), number: roomEditData.number };
                 })
              };
           })
        };
     }));
     setSelectedRoom(null);
  };

  const handleSaveToDatabase = async () => {
     if (!activeHostelId) return;
     const confirmSave = window.confirm("Push these changes to the live database?");
     if (!confirmSave) return;
     setSaving(true);
     try {
       const token = localStorage.getItem('accessToken');
       const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

       // 1. Process Buildings
       for (let i = 0; i < buildings.length; i++) {
         let bObj = buildings[i];
         if (!bObj._id || String(bObj.id).startsWith('temp_')) {
           const res = await fetch(`http://localhost:5001/v1/hostels/${activeHostelId}/buildings`, {
             method: 'POST', headers,
             body: JSON.stringify({ buildingName: bObj.name, buildingNumber: `B${i+1}`, floorCount: bObj.floors.length || 1, address: "Property" })
           });
           if (!res.ok) throw new Error("Failed building");
         }
       }
       
       const refetchB = await fetch(`http://localhost:5001/v1/hostels/${activeHostelId}/buildings`, { headers });
       const { data: latestB } = await refetchB.json();
       const latestBuildingsData = latestB.buildings;

       const currentUIRooms = [];
       buildings.forEach(b => {
         const matchedDbB = latestBuildingsData.find(dbb => dbb.buildingName === b.name);
         if (!matchedDbB) return;
         b.floors.forEach(f => {
           f.rooms.forEach(r => {
             currentUIRooms.push({ uiTempId: r.id, _id: r._id, dbBuildingId: matchedDbB._id, floorNumber: f.level, roomNumber: r.number, roomType: r.type, bedCount: r.bedCount, monthlyFee: 1000 });
           });
         });
       });

       const roomsToDelete = originalRooms.filter(orig => !currentUIRooms.find(cr => cr._id === orig._id));
       for (const rDelete of roomsToDelete) {
         try { await fetch(`http://localhost:5001/v1/hostels/${activeHostelId}/rooms/${rDelete._id}`, { method: 'DELETE', headers }); } catch (e) {}
       }

       for (const rObj of currentUIRooms) {
         if (!rObj._id || String(rObj.uiTempId).startsWith('temp_')) {
           await fetch(`http://localhost:5001/v1/hostels/${activeHostelId}/rooms`, {
             method: 'POST', headers, body: JSON.stringify({ buildingId: rObj.dbBuildingId, floorNumber: rObj.floorNumber, roomNumber: rObj.roomNumber, roomType: rObj.roomType, bedCount: rObj.bedCount, monthlyFee: 1000 })
           });
         } else {
           await fetch(`http://localhost:5001/v1/hostels/${activeHostelId}/rooms/${rObj._id}`, {
             method: 'PUT', headers, body: JSON.stringify({ bedCount: rObj.bedCount, roomType: rObj.roomType, roomNumber: rObj.roomNumber })
           });
         }
       }
       alert("Sync Successful!");
       window.location.reload();
     } catch (err) {
       console.error(err);
       alert("Error: " + err.message);
     } finally {
       setSaving(false);
     }
  };

  const handleDragStart = (e, bId) => { setDraggedBuildingId(bId); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragEnd = () => { setDraggedBuildingId(null); };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e, targetBId) => {
    e.preventDefault();
    if (!draggedBuildingId || draggedBuildingId === targetBId) return;
    setBuildings(prev => {
      const copy = [...prev];
      const draggedIdx = copy.findIndex(b => b.id === draggedBuildingId);
      const targetIdx = copy.findIndex(b => b.id === targetBId);
      const [draggedItem] = copy.splice(draggedIdx, 1);
      copy.splice(targetIdx, 0, draggedItem);
      return copy;
    });
  };

  // KPIs
  const totalRooms = buildings.reduce((acc, b) => acc + b.floors.reduce((fAcc, f) => fAcc + f.rooms.length, 0), 0);
  const totalBeds = buildings.reduce((acc, b) => acc + b.floors.reduce((fAcc, f) => fAcc + f.rooms.reduce((rAcc, r) => rAcc + (parseInt(r.bedCount) || 0), 0), 0), 0);
  const totalFloors = buildings.reduce((acc, b) => acc + b.floors.length, 0);

  return (
    <div className={styles.container}>
      {loading && <Loading text="Mapping Property Infrastructure..." />}
      {saving && <Loading text="Saving Matrix State..." />}
      <Sidebar />
      <div className={styles.mainContent}>
        
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Property Matrix</h1>
            <p className={styles.subtitle}>Structure your hostels visually using our building-first architecture. Map every floor and room to reflect physical reality.</p>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={`${styles.editModeButton} ${isEditing ? styles.editModeActive : ''}`}
              onClick={() => {
                if (isEditing) handleSaveToDatabase();
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? (
                <>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  Sync to Live DB
                </>
              ) : (
                <>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Configure Matrix
                </>
              )}
            </button>
          </div>
        </div>

        {!isSetupMode && !selectedBuildingGrid && (
          <div className={styles.kpiContainer}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(59, 59, 255, 0.1)', color: '#3b3bff' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M12 14h.01M16 14h.01"></path></svg>
              </div>
              <div className={styles.kpiValue}>{buildings.length < 10 ? `0${buildings.length}` : buildings.length}</div>
              <div className={styles.kpiTitle}>Total Buildings</div>
              <div className={styles.kpiSubtitle} style={{ color: '#6B7280' }}>Hostel Infrastructure</div>
            </div>
            
            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <div className={styles.kpiValue}>{totalRooms < 10 ? `0${totalRooms}` : totalRooms}</div>
              <div className={styles.kpiTitle}>Total Rooms</div>
              <div className={styles.kpiSubtitle} style={{ color: '#10B981' }}>Across all floors</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#F97316' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
              </div>
              <div className={styles.kpiValue}>{totalBeds < 10 ? `0${totalBeds}` : totalBeds}</div>
              <div className={styles.kpiTitle}>Total Bed Capacity</div>
              <div className={styles.kpiSubtitle} style={{ color: '#F97316' }}>Property Occupancy</div>
            </div>
          </div>
        )}

        {isSetupMode ? (
          <div className={styles.wizardCard}>
            <h2 className={styles.title} style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Initial Setup Wizard</h2>
            <form onSubmit={handleSetupComplete} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#6B7280' }}>NUMBER OF BUILDINGS</label>
                <input type="number" min="1" max="5" required className={styles.formInput} value={wizardData.buildingsCount} onChange={(e) => setWizardData({...wizardData, buildingsCount: parseInt(e.target.value) || 1})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#6B7280' }}>DEFAULT FLOORS PER BUILDING</label>
                <input type="number" min="1" max="10" required className={styles.formInput} value={wizardData.floorsCount} onChange={(e) => setWizardData({...wizardData, floorsCount: parseInt(e.target.value) || 1})} />
              </div>
              <button type="submit" className={styles.primaryButton}>Generate Property View</button>
            </form>
          </div>
        ) : (
          <div className={styles.buildingsCanvas}>
            {buildings.map((building) => (
              <div 
                key={building.id} className={styles.buildingColumn} draggable={true}
                onDragStart={(e) => handleDragStart(e, building.id)} onDragEnd={handleDragEnd}
                onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, building.id)}
              >
                <div className={styles.buildingGraphic} onClick={() => setSelectedBuildingGrid(building.id)}>
                  {isEditing && (
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveBuilding(building.id); }} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: '#FEE2E2', color: '#EF4444', borderRadius: '12px', padding: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem' }}>DROP</button>
                  )}
                  <svg className={styles.buildingIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="3"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01M16 6h.01M12 10h.01"></path></svg>
                  <div className={styles.buildingName}>{building.name}</div>
                  <div className={styles.buildingStats}>{building.floors.length} Levels • {building.floors.reduce((a,f)=>a+f.rooms.length,0)} Units</div>
                </div>
              </div>
            ))}
            
            {isEditing && (
              <div className={styles.buildingColumn} onClick={handleAddBuilding}>
                <div className={styles.buildingGraphic} style={{ border: '3px dashed #E5E7EB', background: 'transparent', boxShadow: 'none' }}>
                  <div style={{ color: '#9CA3AF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <svg width="40" height="40" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Add Building</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedBuildingGrid && (
        <div className={styles.blueprintOverlay} onClick={() => setSelectedBuildingGrid(null)}>
          <div className={styles.interiorMap} onClick={(e) => e.stopPropagation()}>
            {(() => {
              const b = buildings.find(x => x.id === selectedBuildingGrid);
              if (!b) return null;
              return (
                <>
                  <div className={styles.interiorHeader}>
                    <div>
                      <h3 style={{ margin: 0 }}>{b.name} Architecture</h3>
                      <p style={{ margin: '0.25rem 0 0', color: '#6B7280', fontWeight: 600 }}>Blueprint System</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      {isEditing && <button className={styles.primaryButton} style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }} onClick={() => handleAddFloor(b.id)}>Add Floor</button>}
                      <button onClick={() => setSelectedBuildingGrid(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  </div>
                  <div className={styles.scrollingFloors}>
                    {[...b.floors].sort((a,b)=>b.level-a.level).map(floor => (
                      <div key={floor.level} className={styles.floorContainer}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                          <span className={styles.floorTitle}>LEVEL {floor.level}</span>
                          {isEditing && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                              <button onClick={() => handleAddRoom(b.id, floor.level)} style={{ background: '#3b3bff', color: 'white', border: 'none', borderRadius: '12px', padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>+ ROOM</button>
                              <button onClick={() => handleRemoveFloor(b.id, floor.level)} style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '12px', padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>DROP LEVEL</button>
                            </div>
                          )}
                        </div>
                        <div className={styles.roomsGrid}>
                          {floor.rooms.map(room => (
                            <div key={room.id} className={styles.roomCard}>
                              <span className={styles.roomNumber}>{room.number}</span>
                              <span className={styles.roomType}>{room.type} • {room.bedCount} Beds</span>
                              {isEditing && (
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                  <button onClick={() => openRoomEditor(b.id, floor.level, room)} style={{ background: '#F3F4F6', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className={styles.roomActionBtn}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                  </button>
                                  <button onClick={() => handleRemoveRoom(b.id, floor.level, room.id)} style={{ background: '#FEE2E2', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className={styles.roomActionBtn}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {selectedRoom && (
        <div className={styles.blueprintOverlay}>
          <div className={styles.wizardCard} style={{ margin: 0, width: '500px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.interiorHeader} style={{ padding: '2rem 3rem', background: 'white' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Update Room {roomEditData.number}</h3>
              <button onClick={() => setSelectedRoom(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 800, fontSize: '0.8rem', color: '#9CA3AF' }}>ROOM NUMBER</label>
                <input className={styles.formInput} value={roomEditData.number} onChange={e => setRoomEditData({...roomEditData, number: e.target.value})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 800, fontSize: '0.8rem', color: '#9CA3AF' }}>CAPACITY (BEDS)</label>
                <input type="number" className={styles.formInput} value={roomEditData.bedCount} onChange={e => setRoomEditData({...roomEditData, bedCount: e.target.value})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 800, fontSize: '0.8rem', color: '#9CA3AF' }}>ROOM TYPE</label>
                <select className={styles.formInput} value={roomEditData.type} onChange={e => setRoomEditData({...roomEditData, type: e.target.value})}>
                  <option value="Single">Single Deluxe</option>
                  <option value="Double">Premium Double</option>
                  <option value="Triple">Standard Triple</option>
                  <option value="Dormitory">Dorm Shell</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setSelectedRoom(null)} style={{ flex: 1, padding: '1rem', background: '#F3F4F6', border: 'none', borderRadius: '1rem', fontWeight: 700, cursor: 'pointer' }}>Discard</button>
                <button onClick={saveRoomDetails} className={styles.primaryButton} style={{ flex: 2, padding: '1rem' }}>Apply Matrix</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

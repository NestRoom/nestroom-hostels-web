'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  LayoutGrid, 
  Save, 
  X, 
  ChevronRight, 
  DoorOpen, 
  Bed, 
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import AdminNav from '../components/AdminNav/AdminNav';
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

  return (
    <div className={styles.container}>
      {loading && <Loading text="Mapping Property Infrastructure..." />}
      {saving && <Loading text="Saving Matrix State..." />}
      <AdminNav />
      <div className={styles.mainContent}>
        
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Property Matrix</h1>
            <p className={styles.subtitle}>Visually architect your hostel infrastructure. Map buildings, levels, and units to mirror the physical world.</p>
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
                  <Save size={20} />
                  <span>Sync Infrastructure</span>
                </>
              ) : (
                <>
                  <Edit3 size={20} />
                  <span>Configure Matrix</span>
                </>
              )}
            </button>
          </div>
        </div>

        {!isSetupMode && !selectedBuildingGrid && (
          <div className={styles.kpiContainer}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}>
                <Building2 size={24} color="white" />
              </div>
              <div className={styles.kpiContent}>
                <div className={styles.kpiValue}>{buildings.length < 10 ? `0${buildings.length}` : buildings.length}</div>
                <div className={styles.kpiLabel}>
                  <span className={styles.kpiTitle}>Buildings</span>
                  <span className={styles.kpiSubtitle}>Property Blocks</span>
                </div>
              </div>
            </div>
            
            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <DoorOpen size={24} color="white" />
              </div>
              <div className={styles.kpiContent}>
                <div className={styles.kpiValue}>{totalRooms < 10 ? `0${totalRooms}` : totalRooms}</div>
                <div className={styles.kpiLabel}>
                  <span className={styles.kpiTitle}>Total Rooms</span>
                  <span className={styles.kpiSubtitle}>Across all levels</span>
                </div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <Bed size={24} color="white" />
              </div>
              <div className={styles.kpiContent}>
                <div className={styles.kpiValue}>{totalBeds < 10 ? `0${totalBeds}` : totalBeds}</div>
                <div className={styles.kpiLabel}>
                  <span className={styles.kpiTitle}>Total Capacity</span>
                  <span className={styles.kpiSubtitle}>Total Bed Units</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isSetupMode ? (
          <div className={styles.wizardCard}>
            <div className={styles.wizardHeader}>
              <div className={styles.wizardIcon}>
                <LayoutGrid size={32} color="#4f46e5" />
              </div>
              <h2 className={styles.wizardTitle}>Initial Setup Wizard</h2>
              <p className={styles.wizardSubtitle}>Let's initialize your property structure. You can add more details later.</p>
            </div>
            <form onSubmit={handleSetupComplete} className={styles.wizardForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>NUMBER OF BUILDINGS</label>
                <div className={styles.inputWrapper}>
                  <Building2 size={18} className={styles.inputIcon} />
                  <input type="number" min="1" max="5" required className={styles.formInput} value={wizardData.buildingsCount} onChange={(e) => setWizardData({...wizardData, buildingsCount: parseInt(e.target.value) || 1})} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>DEFAULT FLOORS PER BUILDING</label>
                <div className={styles.inputWrapper}>
                  <Layers size={18} className={styles.inputIcon} />
                  <input type="number" min="1" max="10" required className={styles.formInput} value={wizardData.floorsCount} onChange={(e) => setWizardData({...wizardData, floorsCount: parseInt(e.target.value) || 1})} />
                </div>
              </div>
              <button type="submit" className={styles.primaryButton}>
                Generate Property View
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.buildingsCanvas}>
            <div className={styles.canvasHeader}>
              <h3 className={styles.canvasTitle}>Property Layout</h3>
              <div className={styles.canvasHint}>
                <Info size={14} />
                <span>Click a building to view interior blueprint</span>
              </div>
            </div>
            <div className={styles.buildingsGrid}>
              {buildings.map((building) => (
                <div 
                  key={building.id} className={styles.buildingColumn} draggable={true}
                  onDragStart={(e) => handleDragStart(e, building.id)} onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, building.id)}
                >
                  <div className={styles.buildingGraphic} onClick={() => setSelectedBuildingGrid(building.id)}>
                    {isEditing && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveBuilding(building.id); }} 
                        className={styles.dropButton}
                        title="Remove Building"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className={styles.buildingIconContainer}>
                      <Building2 size={48} className={styles.buildingIcon} />
                    </div>
                    <div className={styles.buildingInfo}>
                      <div className={styles.buildingName}>{building.name}</div>
                      <div className={styles.buildingStats}>
                        <span>{building.floors.length} Levels</span>
                        <span className={styles.statsDivider}>•</span>
                        <span>{building.floors.reduce((a,f)=>a+f.rooms.length,0)} Units</span>
                      </div>
                    </div>
                    <div className={styles.viewBlueprint}>
                      <span>View Blueprint</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
              
              {isEditing && (
                <div className={styles.buildingColumn} onClick={handleAddBuilding}>
                  <div className={`${styles.buildingGraphic} ${styles.addBuildingCard}`}>
                    <div className={styles.addIconWrapper}>
                      <Plus size={32} />
                    </div>
                    <span className={styles.addBuildingText}>Add Building</span>
                  </div>
                </div>
              )}
            </div>
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
                    <div className={styles.interiorTitleSection}>
                      <div className={styles.interiorIconWrapper}>
                        <Building2 size={24} color="#4f46e5" />
                      </div>
                      <div>
                        <h3 className={styles.interiorTitle}>{b.name} Architecture</h3>
                        <p className={styles.interiorSubtitle}>Blueprint System • Level Management</p>
                      </div>
                    </div>
                    <div className={styles.interiorActions}>
                      {isEditing && (
                        <button className={styles.addFloorButton} onClick={() => handleAddFloor(b.id)}>
                          <Plus size={18} />
                          <span>Add Level</span>
                        </button>
                      )}
                      <button onClick={() => setSelectedBuildingGrid(null)} className={styles.closeModalButton}>
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.scrollingFloors}>
                    {[...b.floors].sort((a,b)=>b.level-a.level).map(floor => (
                      <div key={floor.level} className={styles.floorContainer}>
                        <div className={styles.floorHeader}>
                          <div className={styles.floorLabel}>
                            <div className={styles.floorDot} />
                            <span className={styles.floorTitle}>LEVEL {floor.level}</span>
                          </div>
                          {isEditing && (
                            <div className={styles.floorActions}>
                              <button onClick={() => handleAddRoom(b.id, floor.level)} className={styles.addRoomMini}>
                                <Plus size={14} />
                                <span>ROOM</span>
                              </button>
                              <button onClick={() => handleRemoveFloor(b.id, floor.level)} className={styles.dropLevelMini}>
                                <Trash2 size={14} />
                                <span>DROP</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className={styles.roomsGrid}>
                          {floor.rooms.map(room => (
                            <div key={room.id} className={styles.roomCard}>
                              <div className={styles.roomIconWrapper}>
                                <DoorOpen size={20} />
                              </div>
                              <div className={styles.roomMain}>
                                <span className={styles.roomNumber}>{room.number}</span>
                                <span className={styles.roomType}>{room.type} • {room.bedCount} Beds</span>
                              </div>
                              {isEditing && (
                                <div className={styles.roomEditActions}>
                                  <button onClick={() => openRoomEditor(b.id, floor.level, room)} className={styles.editRoomButton}>
                                    <Edit3 size={14} />
                                  </button>
                                  <button onClick={() => handleRemoveRoom(b.id, floor.level, room.id)} className={styles.deleteRoomButton}>
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          {floor.rooms.length === 0 && (
                            <div className={styles.emptyFloor}>
                              <span>No rooms added to this level yet.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {b.floors.length === 0 && (
                      <div className={styles.emptyBuilding}>
                        <LayoutGrid size={48} />
                        <p>No levels defined for this building.</p>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {selectedRoom && (
        <div className={styles.blueprintOverlay}>
          <div className={styles.editorModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.editorHeader}>
              <div className={styles.editorIconWrapper}>
                <Edit3 size={24} color="#4f46e5" />
              </div>
              <h3 className={styles.editorTitle}>Update Room {roomEditData.number}</h3>
            </div>
            <div className={styles.editorForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>ROOM NUMBER</label>
                <div className={styles.inputWrapper}>
                  <LayoutGrid size={18} className={styles.inputIcon} />
                  <input className={styles.formInput} value={roomEditData.number} onChange={e => setRoomEditData({...roomEditData, number: e.target.value})} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>CAPACITY (BEDS)</label>
                <div className={styles.inputWrapper}>
                  <Bed size={18} className={styles.inputIcon} />
                  <input type="number" className={styles.formInput} value={roomEditData.bedCount} onChange={e => setRoomEditData({...roomEditData, bedCount: e.target.value})} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>ROOM TYPE</label>
                <div className={styles.inputWrapper}>
                  <DoorOpen size={18} className={styles.inputIcon} />
                  <select className={styles.formInput} value={roomEditData.type} onChange={e => setRoomEditData({...roomEditData, type: e.target.value})}>
                    <option value="Single">Single Deluxe</option>
                    <option value="Double">Premium Double</option>
                    <option value="Triple">Standard Triple</option>
                    <option value="Dormitory">Dorm Shell</option>
                  </select>
                </div>
              </div>
              <div className={styles.editorActions}>
                <button onClick={() => setSelectedRoom(null)} className={styles.discardButton}>Discard</button>
                <button onClick={saveRoomDetails} className={styles.applyButton}>Apply Matrix</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

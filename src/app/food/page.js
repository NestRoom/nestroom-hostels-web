"use client";

import { useState, useEffect } from "react";
import AdminNav from "../components/AdminNav/AdminNav";
import LoadingComponent from "../components/Loading/Loading";
import styles from "./page.module.css";
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function FoodPage() {
  const [hostelId, setHostelId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [scheduleData, setScheduleData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  // Helper: Get Monday of the week
  function getMonday(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  // Helper: Get Week Number
  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  const weekDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const mealTypes = [
    { type: "Breakfast", icon: "🍳", defaultTime: "08:00 - 09:00", presets: ["Omelette", "Bread", "Butter", "Jam", "Poha", "Upma", "Milk", "Tea", "Coffee", "Paratha", "Curd"] },
    { type: "Lunch", icon: "🍛", defaultTime: "13:00 - 14:30", presets: ["Rice", "Dal", "Roti", "Mix Veg", "Paneer", "Salad", "Curd", "Papad", "Fish Curry", "Chicken Masala"] },
    { type: "Snacks", icon: "🥪", defaultTime: "17:30 - 18:30", presets: ["Sandwich", "Samosa", "Tea", "Coffee", "Biscuits", "Fruits", "Juice", "Vada Pav", "Maggi"] },
    { type: "Dinner", icon: "🍱", defaultTime: "20:00 - 21:30", presets: ["Rice", "Dal", "Roti", "Veg Curry", "Paneer Butter Masala", "Gulab Jamun", "Omelette", "Chicken Dum Biryani"] }
  ];

  const fetchHostelAndSchedule = async (weekStart) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // 1. Get Me & Hostel ID
      const meRes = await fetch("http://localhost:5001/v1/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const { data: meData } = await meRes.json();
      const hId = meData.user.hostels?.[0]?._id;
      if (!hId) return;
      setHostelId(hId);

      // 2. Fetch specific schedule by date
      const midWeek = new Date(weekStart);
      midWeek.setDate(midWeek.getDate() + 3);
      
      const res = await fetch(`http://localhost:5001/v1/hostels/${hId}/food-schedule?date=${midWeek.toISOString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setScheduleData(data.data.schedule);
      } else {
        setScheduleData(null);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setScheduleData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelAndSchedule(currentWeekStart);
  }, [currentWeekStart]);

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const formatDateLabel = (monday) => {
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const options = { month: 'short', day: 'numeric' };
    return `${monday.toLocaleDateString('en-US', options)} - ${sunday.toLocaleDateString('en-US', options)}, ${monday.getFullYear()}`;
  };

  const getDayDate = (monday, index) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + index);
    return d;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const openEditMeal = (day, mealType, existingMeal) => {
    setEditingMeal({
      dayOfWeek: day,
      mealType: mealType.type,
      menu: Array.isArray(existingMeal?.menu) ? existingMeal.menu : (existingMeal?.menu ? [existingMeal.menu] : []),
      time: existingMeal?.time || mealType.defaultTime,
      dietaryTags: existingMeal?.dietaryTags || ["Vegetarian"],
      ingredients: existingMeal?.ingredients || [],
      presets: mealType.presets || []
    });
    setIsEditModalOpen(true);
  };

  const saveMeal = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    
    let newSchedule = scheduleData ? { ...scheduleData } : {
        weekNumber: getWeekNumber(currentWeekStart),
        weekStartDate: currentWeekStart,
        weekEndDate: new Date(currentWeekStart.getTime() + 6 * 86400000 + 86399999), 
        schedule: weekDays.map(day => ({ dayOfWeek: day, meals: [] })),
        specialNotes: ""
    };

    const dayIndex = weekDays.indexOf(editingMeal.dayOfWeek);
    const daySchedule = newSchedule.schedule[dayIndex];
    const mealIndex = daySchedule.meals.findIndex(m => m.mealType === editingMeal.mealType);

    const mealObj = {
        mealType: editingMeal.mealType,
        time: editingMeal.time,
        menu: editingMeal.menu,
        dietaryTags: editingMeal.dietaryTags,
        ingredients: editingMeal.ingredients
    };

    if (mealIndex > -1) {
        daySchedule.meals[mealIndex] = mealObj;
    } else {
        daySchedule.meals.push(mealObj);
    }

    try {
        const res = await fetch(`http://localhost:5001/v1/hostels/${hostelId}/food-schedule`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newSchedule)
        });
        const data = await res.json();
        if (data.success) {
            setIsEditModalOpen(false);
            fetchHostelAndSchedule(currentWeekStart);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const findMeal = (dayName, mealTypeName) => {
    if (!scheduleData) return null;
    const day = scheduleData.schedule.find(d => d.dayOfWeek === dayName);
    if (!day) return null;
    return day.meals.find(m => m.mealType === mealTypeName);
  };

  const toggleTag = (tag) => {
    setEditingMeal(prev => ({
        ...prev,
        dietaryTags: prev.dietaryTags.includes(tag) 
            ? prev.dietaryTags.filter(t => t !== tag)
            : [...prev.dietaryTags, tag]
    }));
  };

  const toggleMenuItem = (item) => {
    setEditingMeal(prev => ({
        ...prev,
        menu: prev.menu.includes(item)
            ? prev.menu.filter(m => m !== item)
            : [...prev.menu, item]
    }));
  };

  const addCustomMenuItem = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
        e.preventDefault();
        const val = e.target.value.trim();
        if (!editingMeal.menu.includes(val)) {
            setEditingMeal(prev => ({
                ...prev,
                menu: [...prev.menu, val]
            }));
        }
        e.target.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <AdminNav />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Menu Planner</h1>
            <p className={styles.subtitle}>Curate and visualize weekly culinary experiences for residents.</p>
          </div>
          <div className={styles.weekNav}>
            <button className={styles.navBtn} onClick={handlePrevWeek}>
              <ChevronLeft size={24} />
            </button>
            <div className={styles.weekRange}>{formatDateLabel(currentWeekStart)}</div>
            <button className={styles.navBtn} onClick={handleNextWeek}>
              <ChevronRight size={24} />
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className={styles.loadingContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
            <LoadingComponent />
            <p style={{ fontWeight: 750, color: "#6B7280", marginTop: '1rem' }}>Synchronizing Schedule...</p>
          </div>
        ) : (
          <div className={styles.calendarGrid}>
            <div className={styles.timeColumn}>
              {mealTypes.map(m => (
                <div key={m.type} className={styles.timeSlotLabel}>
                  <div className={styles.timeLabel}>{m.icon} {m.type}</div>
                  <div className={styles.timeSublabel}>{m.defaultTime}</div>
                </div>
              ))}
            </div>

            {weekDays.map((day, idx) => {
              const date = getDayDate(currentWeekStart, idx);
              const active = isToday(date);
              return (
                <div key={day} className={styles.dayColumn}>
                  <div className={styles.dayHeader}>
                    <span className={styles.dayName}>{day.substring(0, 3)}</span>
                    <span className={`${styles.dayDate} ${active ? styles.todayDate : ""}`}>
                        {date.getDate()}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {mealTypes.map(mType => {
                      const meal = findMeal(day, mType.type);
                      return (
                        <div 
                          key={mType.type} 
                          className={`${styles.mealCard} ${!meal ? styles.empty : ""}`}
                          onClick={() => openEditMeal(day, mType, meal)}
                        >
                          {meal ? (
                            <>
                              <div className={styles.mealTime}>
                                <Clock size={14} />
                                {meal.time}
                              </div>
                              <div className={styles.menuList}>
                                {meal.menu?.map((item, i) => (
                                    <span key={i} className={styles.menuItem}>
                                      {item}{i < meal.menu.length - 1 ? ' • ' : ''}
                                    </span>
                                ))}
                                {(!meal.menu || meal.menu.length === 0) && <span className={styles.emptyText}>Menu not set</span>}
                              </div>
                              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.4rem' }}>
                                {meal.dietaryTags?.slice(0, 1).map(tag => (
                                  <span key={tag} className={`${styles.tag} ${tag === 'Vegetarian' ? styles.tagVeg : tag === 'Non-Vegetarian' ? styles.tagNonVeg : styles.tagVegan}`}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </>
                          ) : (
                            <span className={styles.emptyText}>—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && !scheduleData && (
            <div className={styles.emptyState}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🍽️</div>
                <h3>No Culinary Roadmap Defined</h3>
                <p>The menu for this week hasn't been drafted yet. Initialize a new schedule to keep your residents informed.</p>
                <button className={styles.submitBtn} onClick={() => openEditMeal(weekDays[0], mealTypes[0], null)}>
                  Create Weekly Schedule
                </button>
            </div>
        )}

        {isEditModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
            <div className={styles.modalContent} style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Plan {editingMeal.mealType} • {editingMeal.dayOfWeek}</h2>
                <button className={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={saveMeal}>
                <div className={styles.formContent}>
                  <div className={styles.formGroup}>
                    <label>Distribution Time</label>
                    <input 
                      className={styles.formInput} 
                      placeholder="e.g. 08:30 AM - 09:30 AM"
                      value={editingMeal.time}
                      onChange={e => setEditingMeal({...editingMeal, time: e.target.value})}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Selected Menu Items ({editingMeal.menu.length})</label>
                    <div className={styles.selectedItemsList}>
                        {editingMeal.menu.map(item => (
                            <span key={item} className={styles.selectedItemChip} onClick={() => toggleMenuItem(item)}>
                                {item} <span style={{ marginLeft: '4px', opacity: 0.7 }}>&times;</span>
                            </span>
                        ))}
                        <input 
                            className={styles.itemInput}
                            placeholder="Add item..."
                            onKeyDown={addCustomMenuItem}
                        />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Quick Selection Presets</label>
                    <div className={styles.presetGrid}>
                        {editingMeal.presets.map(item => (
                            <div 
                                key={item} 
                                className={`${styles.presetItem} ${editingMeal.menu.includes(item) ? styles.activePreset : ""}`}
                                onClick={() => toggleMenuItem(item)}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Dietary Classification</label>
                    <div className={styles.tagSelector}>
                      {["Vegetarian", "Non-Vegetarian", "Vegan"].map(tag => (
                        <div 
                          key={tag} 
                          className={`${styles.tagOption} ${editingMeal.dietaryTags.includes(tag) ? styles.selected : ""}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.secondaryBtn} onClick={() => setIsEditModalOpen(false)}>Discard</button>
                  <button type="submit" className={styles.submitBtn}>Save Schedule</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

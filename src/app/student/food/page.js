"use client";

import { useState, useEffect } from "react";
import LoadingComponent from "../../components/Loading/Loading";
import styles from "./page.module.css";
import { secureFetch } from "../../utils/auth";

export default function StudentFoodCalendar() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [scheduleData, setScheduleData] = useState(null);

  // Helper: Get Monday of the week
  function getMonday(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  const weekDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const mealTypes = [
    { type: "Breakfast", icon: "🍳", defaultTime: "08:00 - 09:00" },
    { type: "Lunch", icon: "🍛", defaultTime: "13:00 - 14:30" },
    { type: "Snacks", icon: "🥪", defaultTime: "17:30 - 18:30" },
    { type: "Dinner", icon: "🍱", defaultTime: "20:00 - 21:30" }
  ];

  const fetchSchedule = async (weekStart) => {
    setIsLoading(true);
    try {
      const midWeek = new Date(weekStart);
      midWeek.setDate(midWeek.getDate() + 3);
      
      const res = await secureFetch(`http://localhost:5001/v1/residents/food-schedule?date=${midWeek.toISOString()}`);
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
    fetchSchedule(currentWeekStart);
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

  const findMeal = (dayName, mealTypeName) => {
    if (!scheduleData) return null;
    const day = scheduleData.schedule.find(d => d.dayOfWeek === dayName);
    if (!day) return null;
    return day.meals.find(m => m.mealType === mealTypeName);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Food Schedule</h1>
          <p className={styles.subtitle}>Your weekly culinary journey at NestRoom.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.weekNav}>
            <button className={styles.navBtn} onClick={handlePrevWeek} title="Previous Week">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className={styles.weekRange}>{formatDateLabel(currentWeekStart)}</div>
            <button className={styles.navBtn} onClick={handleNextWeek} title="Next Week">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <LoadingComponent />
          <p style={{ fontWeight: 850, color: "#94A3B8", fontSize: '1.1rem' }}>Preparing the menu...</p>
        </div>
      ) : (
        <div className={styles.calendarGrid}>
          {/* Top Left Empty Cell */}
          <div className={styles.gridHeaderCell}></div>

          {/* Day Headers */}
          {weekDays.map((day, idx) => {
            const date = getDayDate(currentWeekStart, idx);
            const active = isToday(date);
            return (
              <div key={day} className={styles.gridHeaderCell}>
                <div className={styles.dayHeader}>
                  <span className={styles.dayName}>{day.substring(0, 3)}</span>
                  <span className={`${styles.dayDate} ${active ? styles.todayDate : ""}`}>
                      {date.getDate()}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Meal Rows */}
          {mealTypes.map(mType => (
            <>
              {/* Time Label for this Row */}
              <div key={mType.type} className={styles.timeSlotLabel}>
                <div className={styles.timeLabel}>
                  <span style={{ fontSize: '1.4rem' }}>{mType.icon}</span>
                  {mType.type}
                </div>
                <div className={styles.timeSublabel}>{mType.defaultTime}</div>
              </div>

              {/* Meal Cards for each Day in this Row */}
              {weekDays.map((day, dayIdx) => {
                const meal = findMeal(day, mType.type);
                return (
                  <div 
                    key={`${day}-${mType.type}`} 
                    className={`${styles.mealCard} ${!meal ? styles.empty : ""}`}
                  >
                    {meal ? (
                      <>
                        <div className={styles.mealTime}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {meal.time}
                        </div>
                        <div className={styles.menuList}>
                          {meal.menu?.map((item, i) => (
                              <span key={i} className={styles.menuItem}>{item}{i < meal.menu.length - 1 ? ' · ' : ''}</span>
                          ))}
                          {(!meal.menu || meal.menu.length === 0) && <span style={{ color: '#94A3B8', fontWeight: 600 }}>Menu TBD</span>}
                        </div>
                        <div className={styles.dietaryTags}>
                          {meal.dietaryTags?.map(tag => (
                            <span key={tag} className={`${styles.tag} ${tag === 'Vegetarian' ? styles.tagVeg : tag === 'Non-Vegetarian' ? styles.tagNonVeg : styles.tagVegan}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <span className={styles.emptyText}>No Meal Plan</span>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      )}

      {!isLoading && !scheduleData && (
          <div className={styles.emptyState}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🍲</div>
              <h3>Menu in Preparation</h3>
              <p>The culinary team is currently curating this week&apos;s menu. Please check back shortly for updates.</p>
          </div>
      )}
    </div>
  );
}

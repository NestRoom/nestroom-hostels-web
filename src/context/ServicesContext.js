/**
 * src/context/ServicesContext.js
 */
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from './AuthContext';

const ServicesContext = createContext();

export function ServicesProvider({ children }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [tData, sData] = await Promise.all([
        apiClient.get('/services/tickets'),
        apiClient.get('/services/stats')
      ]);
      setTickets(tData.tickets);
      setStats(sData.stats);
    } catch (err) {
      console.error('Failed to fetch services data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const value = {
    tickets,
    setTickets,
    stats,
    loading,
    refreshServices: loadData,
    activeFilter,
    setActiveFilter
  };

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export const useServices = () => useContext(ServicesContext);

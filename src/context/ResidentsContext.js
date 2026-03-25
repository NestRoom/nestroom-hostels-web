"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from './AuthContext';

const ResidentsContext = createContext();

export function ResidentsProvider({ children }) {
  const { user } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadResidents = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await apiClient.get('/residents');
      setResidents(data.residents || []);
    } catch (err) {
      console.error('Failed to fetch residents:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadResidents();
  }, [loadResidents]);

  const value = {
    residents,
    setResidents,
    loading,
    refreshResidents: loadResidents,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery
  };

  return <ResidentsContext.Provider value={value}>{children}</ResidentsContext.Provider>;
}

export const useResidents = () => useContext(ResidentsContext);

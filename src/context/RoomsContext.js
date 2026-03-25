"use client";
import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from './AuthContext';

const RoomsContext = createContext();

export function RoomsProvider({ children }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadRooms = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await apiClient.get('/rooms');
      setRooms(data.rooms || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch rooms on mount if user is logged in
  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const filteredRooms = useMemo(() => {
    let result = rooms;
    
    // Apply status filter
    if (activeFilter === 'VACANT') {
      result = result.filter(r => r.status === 'VACANT' || r.status === 'PARTIALLY VACANT');
    } else if (activeFilter === 'MAINTENANCE') {
      result = result.filter(r => r.status === 'MAINTENANCE');
    }

    // Apply search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(r => r.number.toLowerCase().includes(lowerQuery));
    }

    return result;
  }, [rooms, activeFilter, searchQuery]);

  const value = {
    rooms,
    setRooms,
    loading,
    refreshRooms: loadRooms, // Re-use loadRooms
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredRooms
  };

  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>;
}

export const useRooms = () => useContext(RoomsContext);

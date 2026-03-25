"use client";

import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { initialRoomsState, fetchRooms } from '@/lib/mockData/rooms';
import { useAuth } from './AuthContext';

const RoomsContext = createContext();

export function RoomsProvider({ children }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState(initialRoomsState);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch rooms on mount if user is logged in
  useEffect(() => {
    async function loadRooms() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await fetchRooms();
        setRooms(data);
      } catch (err) {
        console.error('Failed to fetch rooms:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, [user]);

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
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredRooms
  };

  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>;
}

export const useRooms = () => useContext(RoomsContext);

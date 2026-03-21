"use client";

import { createContext, useContext, useState, useMemo } from 'react';
import { initialRoomsState } from '@/lib/mockData/rooms';

const RoomsContext = createContext();

export function RoomsProvider({ children }) {
  const [rooms, setRooms] = useState(initialRoomsState);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredRooms
  };

  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>;
}

export const useRooms = () => useContext(RoomsContext);

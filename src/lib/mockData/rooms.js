/**
 * src/lib/mockData/rooms.js
 */
import apiClient from '../apiClient';

export const fetchRooms = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const endpoint = `/rooms${query ? `?${query}` : ''}`;
  const data = await apiClient.get(endpoint);
  return data.rooms;
};

export const fetchRoomStats = async () => {
  const data = await apiClient.get('/rooms/stats');
  return data.stats;
};

// Keep the initial state empty during refactor to avoid hydration mismatches
// or use a loading state in the context.
export const initialRoomsState = [];

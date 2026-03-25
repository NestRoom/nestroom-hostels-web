/**
 * src/lib/mockData/residents.js
 */
import apiClient from '../apiClient';

export const fetchResidentsList = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const endpoint = `/residents${query ? `?${query}` : ''}`;
  const data = await apiClient.get(endpoint);
  return data.residents;
};

export const fetchResidentStats = async () => {
  const data = await apiClient.get('/residents/stats');
  return data.stats;
};

export const mockResidents = []; // Empty for now

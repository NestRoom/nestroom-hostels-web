/**
 * src/lib/mockData/payments.js
 */
import apiClient from '../apiClient';

export const fetchPaymentStats = async () => {
  const data = await apiClient.get('/payments/stats');
  return data.stats;
};

export const fetchRevenueChart = async () => {
  const data = await apiClient.get('/payments/revenue-chart');
  return data.data; // Backend returns { data: [...] }
};

export const fetchTransactions = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const endpoint = `/payments${query ? `?${query}` : ''}`;
  const data = await apiClient.get(endpoint);
  return data.payments;
};

export const fetchDisputes = async () => {
  const data = await apiClient.get('/payments/disputes');
  return data.disputes;
};

// Placeholder objects to prevent breaking UI if they are imported directly
export const summaryCardsData = {
  collected: { amount: "₹0", trend: "+ 0%", isPositive: true },
  dues:      { amount: "₹0", trend: "0 overdue", isPositive: false },
  renewals:  { count: "0",   trend: "No renewals" }
};
export const revenueChartData = [];
export const transactionHistory = [];

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from './AuthContext';

const PaymentsContext = createContext();

export function PaymentsProvider({ children }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [statsRes, revenueRes, paymentsRes] = await Promise.all([
        apiClient.get('/payments/stats'),
        apiClient.get('/payments/revenue-chart'),
        apiClient.get('/payments')
      ]);
      setStats(statsRes.stats);
      setRevenueData(revenueRes.data || []);
      setTransactions(paymentsRes.payments || []);
    } catch (err) {
      console.error('Failed to fetch payment data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const value = {
    stats,
    revenueData,
    transactions,
    loading,
    refreshPayments: loadData
  };

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>;
}

export const usePayments = () => useContext(PaymentsContext);

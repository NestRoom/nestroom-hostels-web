"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import TableControls from './TableControls';
import ResidentsTable from './ResidentsTable';
import { fetchResidentsList } from '@/lib/mockData/residents';
import styles from './residentsTableContainer.module.css';

export default function ResidentsTableContainer() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API Call simulation
    fetchResidentsList()
      .then(data => {
        setResidents(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Basic Filter Engine mapping State to Data
  const filteredData = residents.filter(resident => {
    // 1. Tab filtering (just a mock behavior mapping pending to 'New')
    if (activeTab === 'pending' && resident.status !== 'New') return false;
    
    // 2. Search filtering (String Match against name or room)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = resident.name.toLowerCase().includes(query);
      const matchRoom = resident.roomNo.toLowerCase().includes(query);
      if (!matchName && !matchRoom) return false;
    }
    
    return true;
  });

  return (
    <Card className={styles.tableCard}>
      <TableControls 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      
      <ResidentsTable data={filteredData} loading={loading} />
      
      {/* Table Footer Pagination Placeholder (Phase 9 pending) */}
    </Card>
  );
}

"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import TableControls from './TableControls';
import ResidentsTable from './ResidentsTable';
import TableFooterPagination from './TableFooterPagination';
import { useResidents } from '@/context/ResidentsContext';
import styles from './residentsTableContainer.module.css';

export default function ResidentsTableContainer() {
  const { 
    residents, 
    loading, 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery 
  } = useResidents();

  const filteredData = residents.filter(resident => {
    // 1. Tab filtering
    if (activeTab === 'pending' && resident.status !== 'New') return false;
    if (activeTab === 'notice' && resident.status !== 'Notice') return false;
    
    // 2. Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = resident.name.toLowerCase().includes(query);
      const matchPhone = resident.phone?.toLowerCase().includes(query);
      if (!matchName && !matchPhone) return false;
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
      
      <TableFooterPagination totalItems={124} itemsPerPage={5} />
    </Card>
  );
}

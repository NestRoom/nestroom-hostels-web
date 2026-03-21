"use client";

import { useState } from 'react';
import Card from '@/components/ui/Card';
import TableControls from './TableControls';
import styles from './residentsTableContainer.module.css';

export default function ResidentsTableContainer() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Card className={styles.tableCard}>
      {/* Table Controls Panel spanning the top */}
      <TableControls 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      
      {/* Data Table Area (Phase 7 scaffolding logic) */}
      <div className={styles.tablePlaceholder}>
        Table Data Area (Phase 7 will build this)
      </div>
    </Card>
  );
}

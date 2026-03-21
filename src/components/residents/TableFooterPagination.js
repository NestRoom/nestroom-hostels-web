"use client";

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './tableFooterPagination.module.css';

export default function TableFooterPagination({ 
  totalItems = 124, 
  itemsPerPage = 5, 
  currentPageProp = 1 
}) {
  const [currentPage, setCurrentPage] = useState(currentPageProp);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startCursor = (currentPage - 1) * itemsPerPage + 1;
  const endCursor = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.infoText}>
        Showing {startCursor} to {endCursor} of {totalItems} residents
      </div>
      
      <div className={styles.controlsBlock}>
        <button 
          className={styles.chevronBtn} 
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          <FiChevronLeft />
        </button>
        
        {/* Mocking specific pages 1, 2, 3 as per task requirements */}
        <button 
          className={`${styles.pageBtn} ${currentPage === 1 ? styles.active : ''}`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
        <button 
          className={`${styles.pageBtn} ${currentPage === 2 ? styles.active : ''}`}
          onClick={() => handlePageChange(2)}
        >
          2
        </button>
        <button 
          className={`${styles.pageBtn} ${currentPage === 3 ? styles.active : ''}`}
          onClick={() => handlePageChange(3)}
        >
          3
        </button>
        
        <button 
          className={styles.chevronBtn} 
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}

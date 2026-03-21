"use client";

import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import styles from './themeToggle.module.css';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from local storage or system preference safely on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Step 94: Wire up React state toggle pushing to DOM dataset
  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button 
      className={styles.themeToggleBtn} 
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
    >
      {isDark ? <FiSun className={styles.icon} /> : <FiMoon className={styles.icon} />}
    </button>
  );
}

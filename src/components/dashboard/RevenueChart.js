"use client";

import Card from './Card';
import { FiTrendingUp } from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import styles from './revenueChart.module.css';

// Step 67: Prepare mock data array for the past 6 months
const mockData = [
  { name: 'Jan', revenue: 110000 },
  { name: 'Feb', revenue: 135000 },
  { name: 'Mar', revenue: 125000 },
  { name: 'Apr', revenue: 160000 },
  { name: 'May', revenue: 190000 },
  { name: 'Jun', revenue: 245000 },
];

export default function RevenueChart() {
  return (
    <Card className={styles.chartCard}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Revenue Overview</h2>
          <span className={styles.subtitle}>Earnings growth for the past 6 months</span>
        </div>
        <div className={styles.badge}>
          <FiTrendingUp className={styles.badgeIcon} />
          <span>+12.5% vs last year</span>
        </div>
      </div>
      
      {/* Steps 68-70: Render Line Chart, customize line, format axes */}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 13, dy: 10 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 13, dx: -10 }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-card)' }}
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--primary)" 
              strokeWidth={3}
              dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

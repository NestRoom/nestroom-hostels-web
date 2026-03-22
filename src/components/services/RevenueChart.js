"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { FiTrendingUp } from 'react-icons/fi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { REVENUE_DATA } from '../../app/dashboard/services/constants';
import styles from './RevenueChart.module.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
  return (
    <Card className={styles.chartCard}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Revenue Overview</h2>
          <p className={styles.subtitle}>Earnings growth from premium services</p>
        </div>
        <Badge 
          type="blue_light" 
          text={
            <span className={styles.badgeContent}>
              <FiTrendingUp className={styles.badgeIcon} /> +12.5% vs last month
            </span>
          } 
        />
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4338ca" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4338ca" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
              domain={[0, 80000]}
              ticks={[0, 20000, 40000, 60000, 80000]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#4338ca" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 6, fill: '#ffffff', stroke: '#4338ca', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

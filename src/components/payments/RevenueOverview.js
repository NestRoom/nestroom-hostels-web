import styles from './RevenueOverview.module.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { revenueChartData } from '../../lib/mockData/payments';
import { MdTrendingUp } from 'react-icons/md';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{`${label} Revenue`}</p>
        <p className={styles.tooltipValue}>{`₹${payload[0].value}L`}</p>
      </div>
    );
  }
  return null;
};

export default function RevenueOverview() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Revenue Overview</h2>
          <p className={styles.subtitle}>Earnings growth for the past 6 months</p>
        </div>
        <div className={styles.growthBadge}>
          <MdTrendingUp size={16} />
          <span>+12.5% growth</span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueChartData}
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border-light)" strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12, dy: 10 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickFormatter={(value) => `₹${value}L`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 6, strokeWidth: 3, stroke: 'white', fill: 'var(--primary)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

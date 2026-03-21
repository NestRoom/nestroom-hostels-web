import Card from './Card';
import styles from './statCard.module.css';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconBgColor = 'var(--icon-bg-blue)', 
  iconColor = 'var(--primary)',
  watermarkIcon: WatermarkIcon,
  children 
}) {
  return (
    <Card className={styles.statCard}>
      {/* Faint Background Watermark Graphic */}
      {WatermarkIcon && (
        <div className={styles.watermark}>
          <WatermarkIcon />
        </div>
      )}

      {/* Top Left Icon Container */}
      <div 
        className={styles.iconWrapper} 
        style={{ backgroundColor: iconBgColor, color: iconColor }}
      >
        {Icon && <Icon className={styles.icon} />}
      </div>

      {/* Main Metric Text block */}
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value}</span>
      </div>

      {/* Flexible area for unique metrics (e.g. progress bar, avatars) */}
      <div className={styles.metricArea}>
        {children}
      </div>
    </Card>
  );
}

import Card from '@/components/ui/Card';
import styles from './summaryCard.module.css';

export default function SummaryCard({ 
  title, 
  value, 
  subtitleText, 
  subtitleIcon: SubtitleIcon, 
  watermarkIcon: WatermarkIcon, 
  badge, 
  subtitleColorClass 
}) {
  return (
    <Card className={styles.card}>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value}</span>
        
        {subtitleText && (
          <div className={`${styles.subtitle} ${subtitleColorClass ? styles[subtitleColorClass] : ''}`}>
            {SubtitleIcon && <SubtitleIcon className={styles.subtitleIcon} />}
            <span>{subtitleText}</span>
          </div>
        )}
      </div>
      
      {WatermarkIcon && (
        <div className={styles.watermark}>
          <WatermarkIcon />
        </div>
      )}
      
      {badge && (
        <div className={styles.topRightBadge}>
          {badge}
        </div>
      )}
    </Card>
  );
}

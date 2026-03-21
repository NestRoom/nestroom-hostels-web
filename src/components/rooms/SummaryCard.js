import React from 'react';
import { MdOutlineDomain, MdHotel, MdBuild } from 'react-icons/md';
import styles from './summaryCard.module.css';

export default function SummaryCard({ icon: Icon, title, value, footerIcon: FooterIcon, footerText, type }) {
  const getIconClass = () => {
    switch (type) {
      case 'purple': return styles.iconPurple;
      case 'green': return styles.iconGreen;
      case 'orange': return styles.iconOrange;
      default: return '';
    }
  };

  const getFooterClass = () => {
    switch (type) {
      case 'green': return styles.footerTextGreen;
      case 'orange': return styles.footerTextOrange;
      default: return styles.footerTextGray;
    }
  };
  
  const renderWatermark = () => {
    switch (type) {
      case 'purple': return <MdOutlineDomain className={styles.watermarkIcon} color="#4f46e5" />;
      case 'green': return <MdHotel className={styles.watermarkIcon} color="#166534" />;
      case 'orange': return <MdBuild className={styles.watermarkIcon} color="#ea580c" />;
      default: return null;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.watermark}>{renderWatermark()}</div>
      
      <div className={`${styles.iconWrapper} ${getIconClass()}`}>
        <Icon className={styles.icon} />
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <h2 className={styles.value}>{value}</h2>
      </div>
      <div className={styles.footer}>
        <FooterIcon className={`${styles.footerIcon} ${getFooterClass()}`} />
        <span className={`${styles.footerText} ${getFooterClass()}`}>{footerText}</span>
      </div>
    </div>
  );
}

import Image from 'next/image';
import styles from './avatar.module.css';

export default function Avatar({ name, imageUrl, size = 'md' }) {
  const getInitials = (n) => {
    if (!n) return '?';
    const split = n.split(' ');
    if (split.length > 1) {
      return (split[0][0] + split[1][0]).toUpperCase();
    }
    return n.substring(0, 1).toUpperCase();
  };
  
  // Hash name for consistent distinct colors
  const stringToColour = (str) => {
    if (!str) return '#e5e7eb';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 40%, 80%)`;
  };

  const bgColor = imageUrl ? 'transparent' : stringToColour(name);

  return (
    <div 
      className={`${styles.avatar} ${styles[size]}`} 
      style={{ backgroundColor: bgColor }}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={name} className={styles.image} width={48} height={48} />
      ) : (
        <span className={styles.initials}>{getInitials(name)}</span>
      )}
    </div>
  );
}

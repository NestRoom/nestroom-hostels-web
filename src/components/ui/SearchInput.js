import styles from './searchInput.module.css';
import { FiSearch } from 'react-icons/fi';

export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`${styles.searchWrapper} ${className}`}>
      <FiSearch className={styles.icon} />
      <input 
        type="text" 
        className={styles.input} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
      />
    </div>
  );
}

/**
 * src/components/ui/Input.js
 */
import styles from './input.module.css';

export default function Input({ label, type = "text", error, ...props }) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input 
        type={type} 
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props} 
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

export function Select({ label, options, error, ...props }) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <select 
        className={`${styles.input} ${styles.select} ${error ? styles.inputError : ''}`}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

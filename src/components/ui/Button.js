import styles from './button.module.css';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`${styles.btn} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

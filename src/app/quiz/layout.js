import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import styles from './quiz-layout.module.css';

// Este layout envolverá todas as páginas dentro de /quiz/*
export default function QuizLayout({ children }) {
  return (
    <div className={styles.layoutContainer}>
      <header className={styles.header}>
        <Link href="/" className={styles.homeLink}>
          <FiArrowLeft /> Home
        </Link>
        <div className={styles.placeholder}></div> {/* Para centralizar o logo */}
      </header>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}

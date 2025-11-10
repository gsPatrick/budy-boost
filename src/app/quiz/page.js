import QuizIntro from '../../components/QuizIntro/QuizIntro';
import styles from './page.module.css';

// Esta será a página acessível em www.seusite.com/quiz
export default function QuizPage() {
  return (
    <main className={styles.main}>
      <QuizIntro />
      {/* Aqui, no futuro, você poderá adicionar os componentes das etapas do quiz */}
    </main>
  );
}


import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import styles from './QuizStep1.module.css';

const QuizStep1 = () => {
  return (
    <div className={styles.card}>
      {/* Barra de Progresso */}
      <div className={styles.progressBar}>
        <div className={`${styles.step} ${styles.active}`}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepName}>Perfil</div>
        </div>
        <div className={styles.line}></div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepName}>Diagnóstico</div>
        </div>
        <div className={styles.line}></div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepName}>Resultado</div>
        </div>
      </div>

      {/* Conteúdo do Formulário */}
      <h2 className={styles.title}>Vamos começar com as apresentações!</h2>
      <form className={styles.form}>
        <input 
          type="text" 
          placeholder="Nome do seu cão" 
          className={styles.input}
        />
        <Link href="/quiz/step-2" className={styles.nextButton}>
          Próximo <FiArrowRight />
        </Link>
      </form>
    </div>
  );
};

export default QuizStep1;
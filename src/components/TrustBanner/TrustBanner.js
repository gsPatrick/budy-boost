import { FaStar } from 'react-icons/fa';
import styles from './TrustBanner.module.css';

const TrustBanner = () => {
  return (
    <section className={styles.trustBanner}>
      <div className={styles.container}>
        <div className={styles.logo}>Buddy Boost</div>
        <h2 className={styles.title}>Aprovado por Milhões</h2>
        <p className={styles.description}>
          Junte-se à comunidade de milhões de donos de pets em toda a Europa que depositaram sua confiança na Buddy Boost e em seu ecossistema completo para todas as necessidades de seus animais. Buddy Boost não é apenas uma plataforma, é um movimento dedicado a garantir pets mais felizes e saudáveis.
        </p>
        <div className={styles.stars}>
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
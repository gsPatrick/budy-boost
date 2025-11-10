import Image from 'next/image';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { FiAward, FiHeart, FiShield, FiArrowRight } from 'react-icons/fi';
import styles from './ResultsHero.module.css';
import resultDogImage from '../../../public/result-dog.png';

const ResultsHero = ({ dogName }) => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.imageContainer}>
          <Image
            src={resultDogImage}
            alt="Bulldog francês com um produto Buddy Boost"
            priority
            className={styles.heroImage}
          />
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>
            Aqui está um Plano Adaptado para {dogName}
          </h1>
          <p className={styles.subtitle}>
            Nutrição personalizada para o seu filhote, adaptada para mantê-lo saudável e feliz.
          </p>
          <div className={styles.rating}>
            <FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalfAlt />
            <a href="#reviews" className={styles.reviewLink}>(1.263 avaliações)</a>
          </div>
          <div className={styles.features}>
            <div className={styles.featureItem}><FiAward /> Personalizado para as necessidades únicas do seu cão</div>
            <div className={styles.featureItem}><FiHeart /> Amado por mais de 100.000 cães e donos</div>
            <div className={styles.featureItem}><FiShield /> Ingredientes 100% naturais e seguros</div>
          </div>
          <button className={styles.ctaButton}>
            Descubra agora <FiArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResultsHero;
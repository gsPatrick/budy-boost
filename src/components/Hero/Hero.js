import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import styles from './Hero.module.css';

// Importe a imagem aqui
import heroImage from '../../../public/hero-image.png'; // <-- Altere para o nome da sua imagem

const Hero = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        {/* Lado Esquerdo: Textos e Botões */}
        <div className={styles.textContainer}>
          <h1 className={styles.mainHeading}>
            Suplementos Saborosos <br />
            <span className={styles.highlight}>Cães Saudáveis</span>
          </h1>
          <p className={styles.subHeading}>
            Escolha o suplemento certo
            <svg width="60" height="20" viewBox="0 0 78 19" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowSvg}>
              <path d="M1 12.1855C14.1667 19.1855 41.5 21.6855 77 1" stroke="#1A234B" strokeWidth="2" strokeLinecap="round"/>
              <path d="M70 1L77 1L73.5 6" stroke="#1A234B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </p>
          <div className={styles.buttonGroup}>
            <Link href="/loja" className={styles.button}>
              Comprar Agora <FiArrowRight />
            </Link>
            <Link href="/quiz" className={styles.button}>
              Responder Quiz <FiArrowRight />
            </Link>
          </div>
        </div>

        {/* Lado Direito: Imagem */}
        <div className={styles.imageContainer}>
          <Image
            src={heroImage}
            alt="Mulher oferecendo suplemento para um cão pastor alemão"
            priority // Ajuda a carregar a imagem principal mais rápido
            className={styles.heroImage}
          />
        </div>
      </div>
       {/* Elementos decorativos (corações) */}
       <div className={`${styles.heart} ${styles.heart1}`}>🤎</div>
       <div className={`${styles.heart} ${styles.heart2}`}>🤎</div>
       <div className={`${styles.heart} ${styles.heart3}`}>🤎</div>
    </section>
  );
};

export default Hero;
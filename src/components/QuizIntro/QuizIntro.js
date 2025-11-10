import Image from 'next/image';
import Link from 'next/link';
import { FiGift } from 'react-icons/fi';
import styles from './QuizIntro.module.css';

// Importe a imagem única
import quizGalleryImage from '../../../public/quiz-gallery.png';

const QuizIntro = () => {
  return (
    <section className={styles.quizSection}>
      <div className={styles.container}>
        {/* Lado Esquerdo: Texto e CTA (Permanece o mesmo) */}
        <div className={styles.textContainer}>
          <h1 className={styles.title}>Conte-nos sobre seu cão</h1>
          <p className={styles.subtitle}>
            Responda a algumas perguntas rápidas para encontrar o suporte certo para o seu cão (2 min).
          </p>
          <Link href="/quiz/step-1" className={styles.ctaButton}>
            Iniciar o Quiz
          </Link>
          <div className={styles.bonusBox}>
            <FiGift size={20} />
            <span>Bônus: Ganhe 15% de DESCONTO ao Finalizar o Quiz!</span>
          </div>
        </div>

        {/* Lado Direito: Imagem Única da Galeria */}
        <div className={styles.imageContainer}>
          <Image
            src={quizGalleryImage}
            alt="Galeria de fotos de cães felizes com produtos Buddy Boost"
            priority // Ajuda a carregar a imagem principal mais rápido
            className={styles.galleryImage}
          />
        </div>
      </div>
    </section>
  );
};

export default QuizIntro;
import Image from 'next/image';
import Link from 'next/link';
import styles from './InfoSection.module.css';

// Importe a imagem que você salvou na pasta /public
import infoImage from '../../../public/info-dog.png'; 

const InfoSection = () => {
  return (
    <section className={styles.infoSection}>
      <div className={styles.container}>
        {/* Lado Esquerdo: Imagem */}
        <div className={styles.imageContainer}>
          <Image
            src={infoImage}
            alt="Cachorro da raça Goldendoodle com uma linha de suplementos"
            width={600}
            height={400}
            className={styles.infoImage}
          />
        </div>

        {/* Lado Direito: Textos e Botão */}
        <div className={styles.textContainer}>
          <p className={styles.preTitle}>CÃO FELIZ E SAUDÁVEL</p>
          <h2 className={styles.title}>Suplementos Mágicos</h2>
          <p className={styles.description}>
            Seu cão está lidando com alergias, coceira, problemas nas articulações ou intestinais? Ou você apenas quer ter certeza de que seu melhor amigo está o mais saudável possível?
          </p>
          <p className={styles.description}>
            Então você deve conferir nossos suplementos desenvolvidos por veterinários. Seus ingredientes poderosos fornecem benefícios mágicos e alívio para os problemas do seu cão, agindo de forma proativa.
          </p>
          <Link href="/loja" className={styles.ctaButton}>
            Explorar suplementos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
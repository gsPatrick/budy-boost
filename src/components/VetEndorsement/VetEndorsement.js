import Image from 'next/image';
import styles from './VetEndorsement.module.css';
import vetImage from '../../../public/vet-image.png';

const VetEndorsement = () => {
  return (
    <section className={styles.endorsementSection}>
      <div className={styles.container}>
        <div className={styles.imageContainer}>
          <Image
            src={vetImage}
            alt="Dra. Emma Richard, DMV"
            width={350}
            height={450}
            className={styles.vetImage}
          />
        </div>
        <div className={styles.textContainer}>
          <h2 className={styles.title}>Amado por Cães, Apoiado por Veterinários</h2>
          <blockquote className={styles.quote}>
            "Estes suplementos são altamente concentrados em ingredientes ativos naturais com eficácia comprovada. Seu forte apelo faz com que os cuidados de saúde pareçam uma guloseima. Eu os recomendo com confiança, e os cães os amam!"
          </blockquote>
          <p className={styles.signature}>Dra. Emma Richard, DMV</p>
        </div>
      </div>
    </section>
  );
};

export default VetEndorsement;
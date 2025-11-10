import Image from 'next/image';
import styles from './ObservedBenefits.module.css';

const benefits = [
  {
    title: 'Articulações Mais Flexíveis',
    image: '/Icon_19.svg',
  },
  {
    title: 'Maior Conforto',
    image: '/Icon_20.svg',
  },
  {
    title: 'Cão Mais Brincalhão',
    image: '/Icon_21.svg',
  },
  {
    title: 'Passeios Mais Longos',
    image: '/Icon_22.svg',
  },
];

const ObservedBenefits = () => {
  return (
    <section className={styles.benefitsSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Nossos Clientes Observam</h2>
        <div className={styles.grid}>
          {benefits.map((benefit) => (
            <div key={benefit.title} className={styles.benefitItem}>
              <Image
                src={benefit.image}
                alt={benefit.title}
                width={150}
                height={120}
                className={styles.benefitImage}
              />
              <p className={styles.benefitTitle}>{benefit.title}</p>
            </div>
          ))}
        </div>
      </div>
      {/* SVG para a curva na parte inferior */}
      <div className={styles.wave}>
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className={styles.shapeFill}></path>
        </svg>
      </div>
    </section>
  );
};

export default ObservedBenefits;
import Image from 'next/image';
import styles from './InfoSectionPDP.module.css';
import reliefImage from '../../../public/delicious-relief.png'; // Importa a imagem

const InfoSectionPDP = () => {
  const benefits = [
    { title: 'Mobilidade Aprimorada e Dor Reduzida:', text: 'Alivia a dor nas articulações, promovendo um movimento mais suave e maior flexibilidade em seu cão.' },
    { title: 'Níveis de Energia Aumentados:', text: 'Reduz o desconforto, permitindo que seu cão se torne mais ativo, com energia e entusiasmo renovados para brincar.' },
    { title: 'Impacto Positivo na Qualidade de Vida Geral:', text: 'Ajuda seu cão a se sentir mais à vontade, aumentando o conforto e a alegria nas atividades diárias.' },
    { title: 'Nutrição para Articulações Rígidas:', text: 'Fornece nutrientes essenciais para lubrificar e apoiar as articulações rígidas, melhorando a saúde e a função geral das articulações.' }
  ];

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.container}>
        {/* Coluna Esquerda: Texto */}
        <div className={styles.textContainer}>
          <span className={styles.tag}>QUADRIL & ARTICULAÇÃO</span>
          <h2 className={styles.title}>Alívio Delicioso</h2>
          <p className={styles.description}>
            Com uma facilidade renovada em cada passo, seu cão redescobre a alegria do movimento, a vitalidade e uma vida livre de desconforto.
          </p>
          <ul className={styles.benefitList}>
            {benefits.map(benefit => (
              <li key={benefit.title}>
                <strong>{benefit.title}</strong> {benefit.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna Direita: Imagem */}
        <div className={styles.imageContainer}>
          <Image
            src={reliefImage}
            alt="Cachorro ao lado de um pote de suplemento Hip & Joint"
            className={styles.image}
            width={600}
            height={600}
          />
        </div>
      </div>
    </section>
  );
};

export default InfoSectionPDP;
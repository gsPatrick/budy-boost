import { FiBox, FiDollarSign, FiTruck } from 'react-icons/fi';
import styles from './Benefits.module.css';

const benefitsData = [
  {
    icon: <FiBox size={32} />,
    title: 'Compre 2 e Ganhe Frete Grátis',
    description: 'Aproveite o frete grátis ao comprar os itens essenciais para o seu pet com a Buddy Boost.',
  },
  {
    icon: <FiDollarSign size={32} />,
    title: 'Garantia de 60 Dias',
    description: 'Não ficou satisfeito? Contate-nos em até 60 dias e receba seu dinheiro de volta.',
  },
  {
    icon: <FiTruck size={32} />,
    title: 'Envio em até 24 horas',
    description: 'Nossa equipe de logística preparará seu pacote e o enviará com segurança rapidamente.',
  },
];

const Benefits = () => {
  return (
    <section className={styles.benefitsSection}>
      <div className={styles.container}>
        {benefitsData.map((benefit, index) => (
          <div key={index} className={styles.benefitItem}>
            <div className={styles.iconWrapper}>{benefit.icon}</div>
            <h3 className={styles.title}>{benefit.title}</h3>
            <p className={styles.description}>{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Benefits;
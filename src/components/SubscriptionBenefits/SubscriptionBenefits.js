import { FiDollarSign, FiSettings, FiShoppingBag, FiGift, FiCalendar, FiStar } from 'react-icons/fi';
import styles from './SubscriptionBenefits.module.css';

const benefitsData = [
  { icon: <FiDollarSign size={28} />, title: 'Economize Muito', text: 'Economize até 15% em cada pedido.' },
  { icon: <FiSettings size={28} />, title: 'Controle Total', text: 'Pause, cancele ou ajuste a qualquer momento, facilmente.' },
  { icon: <FiShoppingBag size={28} />, title: 'Nunca Fique Sem', text: 'Receba seus suplementos diretamente em casa.' },
  { icon: <FiGift size={28} />, title: 'Acesso Antecipado', text: 'Seja o primeiro a experimentar novos lançamentos.' },
  { icon: <FiCalendar size={28} />, title: '8+ anos', text: 'A Buddy Boost vem melhorando o bem-estar animal há muitos anos.' },
  { icon: <FiStar size={28} />, title: '1.500+', text: 'Avaliações de produtos 5 estrelas recebidas.' },
];

const SubscriptionBenefits = () => {
  return (
    <section className={styles.benefitsSection}>
      <h2 className={styles.title}>Benefícios</h2>
      <div className={styles.grid}>
        {benefitsData.map((benefit, index) => (
          <div key={index} className={styles.benefitItem}>
            <div className={styles.iconWrapper}>{benefit.icon}</div>
            <h3 className={styles.itemTitle}>{benefit.title}</h3>
            <p className={styles.itemText}>{benefit.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SubscriptionBenefits;
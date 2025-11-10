import SubscriptionHero from '../../components/SubscriptionHero/SubscriptionHero';
import SubscriptionBenefits from '../../components/SubscriptionBenefits/SubscriptionBenefits'; // 1. Importe
import styles from './page.module.css';

export default function SubscriptionPage() {
  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Assine e Economize</h1>
        <SubscriptionHero />
        <SubscriptionBenefits /> {/* 2. Adicione aqui */}
        {/* Outras seções da página de assinatura virão aqui */}
      </div>
    </main>
  );
}
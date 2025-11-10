import Image from 'next/image';
import styles from './SubscriptionHero.module.css';
import subscriptionImage from '../../../public/subscription-dog.png';

const SubscriptionHero = () => {
  return (
    <section className={styles.sectionWrapper}>
      {/* Coluna Esquerda: Imagem */}
      <div className={styles.imageContainer}>
        <Image
          src={subscriptionImage}
          alt="Cachorro feliz com produtos de assinatura da Buddy Boost"
          priority
          className={styles.heroImage}
        />
      </div>

      {/* Coluna Direita: Texto */}
      <div className={styles.textContainer}>
        <span className={styles.tag}>PETISCOS COM BENEFÍCIOS</span>
        <h2 className={styles.title}>Junte-se ao Clube</h2>
        <p className={styles.description}>
          A consistência é a chave para a saúde do seu cão. Nossos suplementos funcionam melhor com o uso regular, garantindo que seu pet permaneça feliz e saudável. Com nosso programa Assine e Economize, você nunca ficará sem seus suplementos favoritos, enquanto desfruta de controle flexível e economia exclusiva. Simplesmente escolha seus produtos, configure o envio automático e ajuste ou cancele a qualquer momento—é fácil assim!
        </p>
      </div>
    </section>
  );
};

export default SubscriptionHero;
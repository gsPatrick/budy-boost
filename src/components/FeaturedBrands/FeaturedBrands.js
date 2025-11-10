import styles from './FeaturedBrands.module.css';

const FeaturedBrands = () => {
  return (
    <section className={styles.brandsSection}>
      <div className={styles.container}>
        {/* Usaremos spans como placeholders de texto para os logos */}
        <span className={`${styles.logoPlaceholder} ${styles.logoHuffpost}`}>
          HUFFPOST
        </span>
        <span className={`${styles.logoPlaceholder} ${styles.logoYahoo}`}>
          yahoo!
        </span>
        <span className={`${styles.logoPlaceholder} ${styles.logoAbc}`}>
          ABC 7
        </span>
        <span className={`${styles.logoPlaceholder} ${styles.logoDogsToday}`}>
          Dogs Today
        </span>
      </div>
    </section>
  );
};

export default FeaturedBrands;
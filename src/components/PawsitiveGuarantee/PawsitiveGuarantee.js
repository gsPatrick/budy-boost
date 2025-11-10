import styles from './PawsitiveGuarantee.module.css';

const PawsitiveGuarantee = () => {
  return (
    <section className={styles.guaranteeSection}>
      <div className={styles.container}>
        <div className={styles.tag}>A Garantia Buddy Boost</div>
        <h2 className={styles.title}>
          Nenhuma mudança positiva em 60 dias? Receba um reembolso total, sem perguntas, sem complicações—porque temos certeza de que seu filhote vai adorar!
        </h2>
      </div>
    </section>
  );
};

export default PawsitiveGuarantee;
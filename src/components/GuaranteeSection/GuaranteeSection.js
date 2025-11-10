import Image from 'next/image';
import Link from 'next/link';
import styles from './GuaranteeSection.module.css';

// Importe a imagem que você salvou na pasta /public
import guaranteeImage from '../../../public/guarantee-image.png'; 

const GuaranteeSection = () => {
  return (
    <section className={styles.guaranteeSection}>
      <div className={styles.container}>
        {/* Lado Esquerdo: Imagem */}
        <div className={styles.imageContainer}>
          <Image
            src={guaranteeImage}
            alt="Mulher sentada em uma escada com seu cachorro"
            width={600}
            height={600}
            className={styles.guaranteeImage}
          />
        </div>

        {/* Lado Direito: Textos e Botão */}
        <div className={styles.textContainer}>
          <p className={styles.preTitle}>NÓS GARANTIMOS NOSSOS PRODUTOS</p>
          <h2 className={styles.title}>Garantia de Satisfação</h2>
          <p className={styles.description}>
            Queremos que você fique completamente satisfeito com sua compra, e é por isso que oferecemos uma garantia total de 60 dias para devolução do dinheiro em qualquer produto Buddy Boost.
          </p>
          <p className={styles.description}>
            Não está feliz com os resultados? Apenas siga nossas instruções de garantia e você receberá um reembolso total. Sem burocracia.
          </p>
          <Link href="/loja" className={styles.ctaButton}>
            Comprar agora
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GuaranteeSection;
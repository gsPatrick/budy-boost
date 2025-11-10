import Image from 'next/image';
import Link from 'next/link';
import styles from './RelatedProducts.module.css';

// Dados placeholder
const relatedProducts = [
  { id: 5, name: 'Suplemento Multivitamínico 8-em-1', image: '/placeholder-produto.png', originalPrice: '45,00', currentPrice: '38,00', onSale: true },
  { id: 2, name: 'Suplemento Probiótico Digestivo', image: '/placeholder-produto.png', originalPrice: '45,00', currentPrice: '38,00', onSale: true },
  { id: 6, name: 'Suplemento para Alergia e Coceira', image: '/placeholder-produto.png', originalPrice: '45,00', currentPrice: '38,00', onSale: true },
  { id: 3, name: 'Suplemento Calmante', image: '/placeholder-produto.png', originalPrice: '45,00', currentPrice: '38,00', onSale: true },
];

const RelatedProducts = () => {
  return (
    <section className={styles.relatedSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Você também pode gostar</h2>
        <div className={styles.productGrid}>
          {relatedProducts.map((product) => (
            <Link href={`/produtos/${product.id}`} key={product.id} className={styles.productCard}>
              <div className={styles.imageContainer}>
                {product.onSale && <div className={styles.saleTag}>Sale</div>}
                <Image src={product.image} alt={product.name} width={400} height={400} className={styles.productImage} />
              </div>
              <div className={styles.infoContainer}>
                <p className={styles.productName}>{product.name}</p>
                <div className={styles.priceContainer}>
                  <span className={styles.originalPrice}>R$ {product.originalPrice}</span>
                  <span className={styles.currentPrice}>A partir de R$ {product.currentPrice}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
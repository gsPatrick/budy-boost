'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductShowcase.module.css';
import ApiService from '../../services/api.service';

const ProductShowcase = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ApiService.get('/produtos', {
          params: { limit: 5 }
        });

        // --- LÓGICA DE MAPEAMENTO SIMPLIFICADA ---
        const formattedProducts = response.data.map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.nome,
          // O preço original e o preço atual agora são o mesmo campo.
          // A lógica de 'onSale' pode ser baseada em um campo futuro 'preco_promocional'.
          currentPrice: parseFloat(product.preco || 0).toFixed(2).replace('.', ','),
          imageUrl: product.imagens?.[0] || '/placeholder-produto.png',
          onSale: false, // Simplificado por enquanto
        }));

        setProducts(formattedProducts);
      } catch (err) {
        console.error('Erro ao buscar produtos mais vendidos:', err);
        setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className={styles.showcaseSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nossos Mais Populares</h2>
          <p className={styles.infoMessage}>Carregando produtos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.showcaseSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nossos Mais Populares</h2>
          <p className={styles.infoMessage}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.showcaseSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Nossos Mais Populares</h2>
        
        {products.length === 0 ? (
          <p className={styles.infoMessage}>
            Nenhum produto popular encontrado no momento. Volte em breve!
          </p>
        ) : (
          <div className={styles.productGrid}>
            {products.map((product) => (
              <Link href={`/produtos/${product.slug}`} key={product.id} className={styles.productCard}>
                <div className={styles.imageContainer}>
                  {product.onSale && (
                    <div className={styles.saleTag}>Promoção</div>
                  )}
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={400}
                    className={styles.productImage}
                  />
                </div>
                <div className={styles.infoContainer}>
                  <p className={styles.productName}>{product.name}</p>
                  <div className={styles.priceContainer}>
                    {/* O preço original só será exibido se houver promoção */}
                    {/* <span className={styles.originalPrice}>R$ {product.originalPrice}</span> */}
                    <span className={styles.currentPrice}>R$ {product.currentPrice}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductShowcase;
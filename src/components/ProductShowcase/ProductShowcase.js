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
        // Busca até 100 produtos para exibir "todos" na vitrine
        const response = await ApiService.get('/produtos', {
          params: { limit: 100 } 
        });

        // A API retorna um objeto { produtos: [], total: ... }, precisamos extrair o array 'produtos'
        const listaProdutos = response.data.produtos || [];

        const formattedProducts = listaProdutos.map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.nome,
          // Formatação de preço igual à da página da loja
          currentPrice: product.preco ? parseFloat(product.preco).toFixed(2).replace('.', ',') : '0,00',
          imageUrl: product.imagens?.[0] || '/placeholder-produto.png',
          // Você pode adicionar lógica de promoção aqui se tiver o campo no backend
          onSale: false, 
        }));

        setProducts(formattedProducts);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
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
          <h2 className={styles.sectionTitle}>Nossos Produtos</h2>
          <p className={styles.infoMessage}>Carregando produtos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.showcaseSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nossos Produtos</h2>
          <p className={styles.infoMessage}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.showcaseSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Nossos Produtos</h2>
        
        {products.length === 0 ? (
          <p className={styles.infoMessage}>
            Nenhum produto encontrado no momento.
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
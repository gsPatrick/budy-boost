'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './OurPicks.module.css';
import ApiService from '../../services/api.service';
import { useCart } from '../../context/CartContext'; // Importa o hook do carrinho
import { FiPlus } from 'react-icons/fi'; // Ícone para o botão

const OurPicks = ({ dogName }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart(); // Pega a função do contexto

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        setLoading(true);
        // MUDANÇA: Busca os 5 primeiros produtos da listagem geral
        const response = await ApiService.get('/produtos', {
          params: { limit: 5 }
        });

        setProducts(response.data.produtos); // A resposta agora está aninhada em 'produtos'
      } catch (err) {
        console.error("Erro ao buscar as escolhas de produtos:", err);
        setError("Não foi possível carregar as recomendações.");
      } finally {
        setLoading(false);
      }
    };

    fetchPicks();
  }, []);

  const handleAddToCart = (product) => {
    // Prepara um objeto simplificado do produto para adicionar ao carrinho
    const productForCart = {
      id: product.id,
      name: product.nome,
      price: parseFloat(product.preco || 0),
      image: product.imagens?.[0] || '/placeholder-produto.png',
    };
    addToCart(productForCart);
  };

  if (loading) {
    return (
        <section className={styles.picksSection}>
            <div className={styles.container}>
                <h2 className={styles.title}>Nossas Escolhas para {dogName}</h2>
                <p>Carregando recomendações...</p>
            </div>
        </section>
    );
  }

  if (error || products.length === 0) {
    return null; 
  }

  return (
    <section className={styles.picksSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Nossas Escolhas para {dogName}</h2>
        <div className={styles.productGrid}>
          {products.map((product) => (
            // MUDANÇA: Removido o <Link>, agora é uma <div>
            <div key={product.id} className={styles.productCard}>
              <div className={styles.imageContainer}>
                <Image
                  src={product.imagens?.[0] || '/placeholder-produto.png'}
                  alt={product.nome}
                  width={300}
                  height={300}
                  className={styles.productImage}
                />
              </div>
              <div className={styles.infoContainer}>
                <p className={styles.productName}>{product.nome}</p>
                <div className={styles.priceContainer}>
                  <span className={styles.currentPrice}>
                    R$ {parseFloat(product.preco || 0).toFixed(2).replace('.', ',')}
                  </span>
                  {/* MUDANÇA: Botão de adicionar ao carrinho */}
                  <button 
                    onClick={() => handleAddToCart(product)} 
                    className={styles.addButton}
                    aria-label={`Adicionar ${product.nome} ao carrinho`}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurPicks;
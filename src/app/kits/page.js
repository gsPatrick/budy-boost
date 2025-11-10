'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import ApiService from '../../services/api.service';

export default function KitsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await ApiService.get('/categorias');
        setCategories(response.data.filter(cat => cat.ativo));
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        setError("Não foi possível carregar as categorias. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p className={styles.infoMessage}>Carregando categorias...</p>;
    }
    if (error) {
      return <p className={styles.infoMessage}>{error}</p>;
    }
    if (categories.length === 0) {
      return <p className={styles.infoMessage}>Nenhuma categoria encontrada.</p>;
    }
    return (
      <div className={styles.categoryGrid}>
        {categories.map((category) => (
          <Link 
            href={`/loja?categoria=${category.slug}`} 
            key={category.id} 
            className={styles.categoryCard}
          >
            <div className={styles.imageContainer}>
              <Image
                src={category.imagemUrl || '/placeholder-produto.png'}
                alt={category.nome}
                fill
                className={styles.categoryImage}
              />
              <div className={styles.overlay}></div>
              <h3 className={styles.categoryName}>{category.nome}</h3>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Nossas Coleções</h1>
        <p className={styles.pageSubtitle}>Explore nossas categorias de produtos e encontre o que seu pet precisa.</p>
        
        {renderContent()}
      </div>
    </main>
  );
}
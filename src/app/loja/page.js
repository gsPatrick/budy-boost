'use client';

import { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import ApiService from '../../services/api.service';

export default function ShopPage() {
  // Estados para dados e UI
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para filtros e ordenação
  const [sortOrder, setSortOrder] = useState('lancamentos'); // Padrão: mais recentes
  
  // Estado para paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  // useEffect para buscar produtos sempre que a ordenação ou a página mudar
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ApiService.get('/produtos', {
          params: {
            page: pagination.currentPage,
            limit: 8, // Vamos exibir 8 produtos por página
            ordenarPor: sortOrder,
          },
        });
        
        const { produtos, total, totalPages, currentPage } = response.data;

        setProducts(produtos);
        setPagination({
          currentPage: currentPage,
          totalPages: totalPages,
          totalProducts: total,
        });

      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError("Não foi possível carregar os produtos. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortOrder, pagination.currentPage]); // Dependências: re-executa ao mudar a ordem ou a página

  // Função para mudar a página
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      window.scrollTo(0, 0); // Rola para o topo da página
    }
  };

  // Função para renderizar o conteúdo principal (produtos, loading, erro, etc.)
  const renderContent = () => {
    if (loading) {
      return <p className={styles.infoMessage}>Carregando produtos...</p>;
    }
    if (error) {
      return <p className={styles.infoMessage}>{error}</p>;
    }
    if (products.length === 0) {
      return <p className={styles.infoMessage}>Nenhum produto encontrado.</p>;
    }
    return (
      <div className={styles.productGrid}>
        {products.map((product) => {
          // LÓGICA ATUALIZADA: Pega o preço diretamente do produto
          const currentPrice = product.preco ? parseFloat(product.preco).toFixed(2).replace('.', ',') : '0,00';
          
          return (
            <Link href={`/produtos/${product.slug}`} key={product.id} className={styles.productCard}>
              <div className={styles.imageContainer}>
                {/* A lógica de 'onSale' pode ser mais complexa, por enquanto vamos simplificar */}
                {/* {product.onSale && <div className={styles.saleTag}>Sale</div>} */}
                <Image 
                  src={product.imagens?.[0] || '/placeholder-produto.png'} 
                  alt={product.nome} 
                  width={400} 
                  height={400} 
                  className={styles.productImage} 
                />
              </div>
              <div className={styles.infoContainer}>
                <p className={styles.productName}>{product.nome}</p>
                <div className={styles.priceContainer}>
                  {/* TEXTO ATUALIZADO: Removido "A partir de" */}
                  <span className={styles.currentPrice}>R$ {currentPrice}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Loja</h1>

        {/* Barra de Filtros */}
        <div className={styles.filterBar}>
          <div className={styles.filters}>
            <span>Filtrar:</span>
            <button className={styles.filterButton}>Disponibilidade <FiChevronDown /></button>
            <button className={styles.filterButton}>Preço <FiChevronDown /></button>
          </div>
          <div className={styles.sort}>
            <label htmlFor="sort-select">Ordenar por:</label>
            <select 
              id="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="lancamentos">Lançamentos</option>
              <option value="nome_asc">Nome (A-Z)</option>
              <option value="nome_desc">Nome (Z-A)</option>
            </select>
            <span className={styles.productCount}>{pagination.totalProducts} produtos</span>
          </div>
        </div>

        {/* Grade de Produtos */}
        {renderContent()}

        {/* Paginação */}
        {!loading && products.length > 0 && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>
              Anterior
            </button>
            <span>
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>
              Próxima
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
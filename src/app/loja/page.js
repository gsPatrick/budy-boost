'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import ApiService from '../../services/api.service';

export default function ShopPage() {
  // Estados de Dados
  const [allProducts, setAllProducts] = useState([]); // Todos os produtos vindos da API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de Filtro e Ordenação
  const [sortOrder, setSortOrder] = useState('lancamentos');
  const [activeDropdown, setActiveDropdown] = useState(null); // 'availability', 'price', ou null
  
  const [filters, setFilters] = useState({
    inStock: false,
    minPrice: '',
    maxPrice: ''
  });

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 1. Buscar TUDO da API ao carregar
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // limit=1000 para pegar "todos" e filtrar no front
        const response = await ApiService.get('/produtos', {
          params: { limit: 1000 } 
        });
        
        // Garante que pegamos o array correto
        const produtosRaw = response.data.produtos || response.data || [];
        setAllProducts(produtosRaw);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError("Não foi possível carregar os produtos.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 2. Lógica de Filtragem e Ordenação (useMemo para performance)
  const processedProducts = useMemo(() => {
    let result = [...allProducts];

    // A. Filtrar por Estoque
    if (filters.inStock) {
      result = result.filter(p => (p.estoque || 0) > 0);
    }

    // B. Filtrar por Preço
    if (filters.minPrice !== '') {
      result = result.filter(p => parseFloat(p.preco) >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice !== '') {
      result = result.filter(p => parseFloat(p.preco) <= parseFloat(filters.maxPrice));
    }

    // C. Ordenação
    switch (sortOrder) {
      case 'nome_asc':
        result.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'nome_desc':
        result.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case 'preco_asc':
        result.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
        break;
      case 'preco_desc':
        result.sort((a, b) => parseFloat(b.preco) - parseFloat(a.preco));
        break;
      case 'lancamentos':
      default:
        // Assume que IDs maiores são mais recentes ou usa createdAt se disponível
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return result;
  }, [allProducts, filters, sortOrder]);

  // 3. Paginação Front-end
  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const paginatedProducts = processedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Volta para página 1 ao filtrar
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Loja</h1>

        {/* --- BARRA DE FILTROS --- */ }
        <div className={styles.filterBar}>
          <div className={styles.filters}>
            <span>Filtrar:</span>
            
            {/* Dropdown Disponibilidade */}
            <div className={styles.filterGroup}>
                <button 
                    className={`${styles.filterButton} ${filters.inStock ? styles.active : ''}`}
                    onClick={() => toggleDropdown('availability')}
                >
                    Disponibilidade <FiChevronDown />
                </button>
                
                {activeDropdown === 'availability' && (
                    <div className={styles.dropdownMenu}>
                        <label className={styles.filterOption}>
                            <input 
                                type="checkbox" 
                                checked={filters.inStock}
                                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                            />
                            Apenas em estoque
                        </label>
                    </div>
                )}
            </div>

            {/* Dropdown Preço */}
            <div className={styles.filterGroup}>
                <button 
                    className={`${styles.filterButton} ${(filters.minPrice || filters.maxPrice) ? styles.active : ''}`}
                    onClick={() => toggleDropdown('price')}
                >
                    Preço <FiChevronDown />
                </button>
                
                {activeDropdown === 'price' && (
                    <div className={styles.dropdownMenu}>
                        <div className={styles.priceInputs}>
                            <input 
                                type="number" 
                                placeholder="Min" 
                                className={styles.priceInput}
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            />
                            <span className={styles.priceSeparator}>até</span>
                            <input 
                                type="number" 
                                placeholder="Max" 
                                className={styles.priceInput}
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            />
                        </div>
                        {(filters.minPrice || filters.maxPrice) && (
                           <button 
                              onClick={() => { setFilters(p => ({...p, minPrice: '', maxPrice: ''})); setActiveDropdown(null); }}
                              style={{fontSize: '0.8rem', color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}
                           >
                              Limpar filtro de preço
                           </button>
                        )}
                    </div>
                )}
            </div>
          </div>

          {/* Ordenação e Contagem */}
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
              <option value="preco_asc">Menor Preço</option>
              <option value="preco_desc">Maior Preço</option>
            </select>
            <span className={styles.productCount}>{processedProducts.length} produtos</span>
          </div>
        </div>

        {/* --- CONTEÚDO --- */}
        {loading ? (
            <p className={styles.infoMessage}>Carregando produtos...</p>
        ) : error ? (
            <p className={styles.infoMessage}>{error}</p>
        ) : paginatedProducts.length === 0 ? (
            <p className={styles.infoMessage}>Nenhum produto corresponde aos filtros selecionados.</p>
        ) : (
            <div className={styles.productGrid}>
                {paginatedProducts.map((product) => {
                    const currentPrice = product.preco ? parseFloat(product.preco).toFixed(2).replace('.', ',') : '0,00';
                    const imgUrl = (product.imagens && product.imagens.length > 0) ? product.imagens[0] : '/placeholder-produto.png';

                    return (
                        <Link href={`/produtos/${product.slug}`} key={product.id} className={styles.productCard}>
                            <div className={styles.imageContainer}>
                                {/* Exemplo de tag dinâmica (se tiver lógica) */}
                                {/* {product.estoque < 5 && <div className={styles.saleTag}>Últimas Unidades</div>} */}
                                <Image 
                                    src={imgUrl} 
                                    alt={product.nome} 
                                    width={400} 
                                    height={400} 
                                    className={styles.productImage} 
                                />
                            </div>
                            <div className={styles.infoContainer}>
                                <p className={styles.productName}>{product.nome}</p>
                                <div className={styles.priceContainer}>
                                    <span className={styles.currentPrice}>R$ {currentPrice}</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        )}

        {/* --- PAGINAÇÃO --- */}
        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
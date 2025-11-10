'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import styles from './ProductManager.module.css';
import ProductFormModal from '../ProductFormModal/ProductFormModal';
import ApiService from '../../services/api.service';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/produtos?limit=100');
      setProducts(response.data.produtos);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      alert("Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData, imageFiles) => {
    const isEditing = !!editingProduct;
    try {
      let savedProduct;

      // Prepara os dados, garantindo que campos numéricos sejam números
      const dataToSend = {
        ...productData,
        preco: parseFloat(productData.preco) || 0,
        estoque: parseInt(productData.estoque, 10) || 0,
      };

      if (isEditing) {
        const response = await ApiService.put(`/produtos/${editingProduct.id}`, dataToSend);
        savedProduct = response.data;
      } else {
        const response = await ApiService.post('/produtos', dataToSend);
        savedProduct = response.data;
      }

      if (imageFiles && imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('files', file);
        });
        
        await ApiService.postForm(`/uploads/produtos/${savedProduct.id}/imagens`, formData);
      }

      handleCloseModal();
      await fetchProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error.response?.data || error);
      alert(`Erro ao salvar produto: ${error.response?.data?.erro || 'Verifique o console.'}`);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
      try {
        await ApiService.delete(`/produtos/${productId}`);
        await fetchProducts();
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        alert("Não foi possível excluir o produto.");
      }
    }
  };

  if (loading) {
    return <p>Carregando produtos...</p>;
  }

  return (
    <>
      <div className={styles.managerContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gerenciamento de Produtos</h1>
          <button onClick={() => handleOpenModal()} className={styles.addButton}>
            <FiPlus />
            Adicionar Novo Produto
          </button>
        </div>
        
        <div className={styles.tableWrapper}>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>Produto</th>
                {/* --- CABEÇALHOS ATUALIZADOS --- */}
                <th>Preço</th>
                <th>Estoque</th>
                <th>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.productInfo}>
                        <Image 
                          src={product.imagens?.[0] || '/placeholder-produto.png'} 
                          alt={product.nome} 
                          width={50} 
                          height={50} 
                          className={styles.productImage} 
                        />
                        <strong>{product.nome}</strong>
                      </div>
                    </td>
                    {/* --- DADOS ATUALIZADOS (sem 'firstVariation') --- */}
                    <td>R$ {product.preco ? parseFloat(product.preco).toFixed(2).replace('.', ',') : '0,00'}</td>
                    <td>{product.estoque} unidades</td>
                    <td><span className={styles.categoryBadge}>{product.categoria?.nome || 'Sem Categoria'}</span></td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => handleOpenModal(product)} className={styles.actionButton}>
                        <FiEdit /> Editar
                      </button>
                      <button onClick={() => handleDelete(product.id, product.nome)} className={`${styles.actionButton} ${styles.deleteButton}`}>
                        <FiTrash2 /> Excluir
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </>
  );
};

export default ProductManager;
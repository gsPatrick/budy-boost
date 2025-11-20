'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import ApiService from '../../services/api.service';
import styles from './CategoryManager.module.css';
import CategoryFormModal from '../CategoryFormModal/CategoryFormModal';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/categorias');
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      alert("Não foi possível carregar as categorias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // AQUI ESTÁ A MUDANÇA PRINCIPAL
  const handleSaveCategory = async (formData) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingCategory) {
        // PUT para atualizar
        await ApiService.put(`/categorias/${editingCategory.id}`, formData, config);
      } else {
        // POST para criar
        await ApiService.post('/categorias', formData, config);
      }
      
      handleCloseModal();
      await fetchCategories(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao salvar categoria:", error.response?.data || error);
      alert(`Erro ao salvar categoria: ${error.response?.data?.erro || 'Verifique o console.'}`);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) {
      try {
        await ApiService.delete(`/categorias/${categoryId}`);
        await fetchCategories();
      } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        alert("Não foi possível excluir a categoria.");
      }
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <>
      <div className={styles.managerContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gerenciamento de Categorias / Kits</h1>
          <button onClick={() => handleOpenModal()} className={styles.addButton}>
            <FiPlus />
            Adicionar Nova Categoria
          </button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.categoryTable}>
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div style={{width: 50, height: 50, position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid #eee'}}>
                        <Image 
                            src={cat.imagemUrl || '/placeholder-produto.png'} 
                            alt={cat.nome}
                            fill
                            style={{objectFit: 'cover'}}
                        />
                    </div>
                  </td>
                  <td><strong>{cat.nome}</strong></td>
                  <td style={{maxWidth: '300px', color: '#666'}}>{cat.descricao}</td>
                  <td className={styles.actionsCell}>
                    <button onClick={() => handleOpenModal(cat)} className={styles.actionButton}>
                      <FiEdit /> Editar
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id, cat.nome)} className={`${styles.actionButton} ${styles.deleteButton}`}>
                      <FiTrash2 /> Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </>
  );
};

export default CategoryManager;
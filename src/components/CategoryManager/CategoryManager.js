// /components/CategoryManager/CategoryManager.js
'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import ApiService from '../../services/api.service';
import styles from './CategoryManager.module.css'; // Criaremos este CSS a seguir
import CategoryFormModal from '../CategoryFormModal/CategoryFormModal'; // E este modal também

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

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        await ApiService.put(`/categorias/${editingCategory.id}`, categoryData);
      } else {
        await ApiService.post('/categorias', categoryData);
      }
      handleCloseModal();
      await fetchCategories();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error.response?.data || error);
      alert(`Erro ao salvar categoria: ${error.response?.data?.erro || 'Verifique o console.'}`);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"? Isso pode afetar produtos associados.`)) {
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
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td><strong>{cat.nome}</strong></td>
                  <td>{cat.descricao}</td>
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
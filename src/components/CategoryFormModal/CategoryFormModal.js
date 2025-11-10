// /components/CategoryFormModal/CategoryFormModal.js
'use client';
import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import styles from '../ProductFormModal/ProductFormModal.module.css'; // Reutilizando estilos do modal de produto

const CategoryFormModal = ({ isOpen, onClose, onSave, category }) => {
  const [formData, setFormData] = useState({ nome: '', descricao: '' });

  useEffect(() => {
    if (category) {
      setFormData({ nome: category.nome, descricao: category.descricao || '' });
    } else {
      setFormData({ nome: '', descricao: '' });
    }
  }, [category]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{category ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <button onClick={onClose} className={styles.closeButton}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.tabContent}>
            <div className={styles.formGroup}>
              <label>Nome</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label>Descrição</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleChange}></textarea>
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
            <button type="submit" className={styles.saveButton}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
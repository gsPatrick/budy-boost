'use client';
import { useState, useEffect } from 'react';
import { FiX, FiUpload, FiTrash2 } from 'react-icons/fi';
import styles from './CategoryFormModal.module.css';

const CategoryFormModal = ({ isOpen, onClose, onSave, category }) => {
  const [formData, setFormData] = useState({ nome: '', descricao: '' });
  const [imageFile, setImageFile] = useState(null); // Arquivo novo
  const [previewUrl, setPreviewUrl] = useState(null); // Preview (URL ou Blob)

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({ nome: category.nome, descricao: category.descricao || '' });
        // Se já tem imagem salva no banco, mostra ela
        setPreviewUrl(category.imagemUrl || null);
      } else {
        setFormData({ nome: '', descricao: '' });
        setPreviewUrl(null);
      }
      setImageFile(null);
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Cria URL temporária para preview
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Para envio de arquivos, precisamos usar FormData
    const dataToSend = new FormData();
    dataToSend.append('nome', formData.nome);
    dataToSend.append('descricao', formData.descricao);
    
    if (imageFile) {
      // 'arquivo' deve corresponder ao nome do campo esperado no backend (upload.single('arquivo'))
      // No seu controller de categoria, verifique se é 'arquivo' ou 'imagem'.
      // Baseado no seu código anterior de produto, costuma ser 'arquivo' ou o controller usa req.file direto.
      // Vou usar 'arquivo' que é o padrão mais comum no multer configurado.
      dataToSend.append('arquivo', imageFile); 
    }

    onSave(dataToSend);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{category ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <button onClick={onClose} className={styles.closeButton}><FiX /></button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nome da Categoria</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
          </div>
          
          <div className={styles.formGroup}>
            <label>Descrição</label>
            <textarea name="descricao" value={formData.descricao} onChange={handleChange}></textarea>
          </div>

          {/* Área de Upload */}
          <div className={styles.formGroup}>
            <label>Imagem de Capa (Kit)</label>
            
            {!previewUrl ? (
              <div className={styles.uploadBox}>
                 <FiUpload size={24} />
                 <p>Clique para selecionar uma imagem</p>
                 <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>
            ) : (
              <div className={styles.previewContainer}>
                <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                <button type="button" onClick={removeImage} className={styles.removeImageBtn}>
                  <FiTrash2 />
                </button>
              </div>
            )}
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
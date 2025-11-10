'use client';
import { useState, useEffect } from 'react';
import { FiX, FiPlusCircle, FiTrash2, FiUpload } from 'react-icons/fi';
import styles from './ProductFormModal.module.css';
import ApiService from '../../services/api.service';

const DRAFT_KEY = 'productFormDraft'; // Chave para o localStorage

const initialFormData = {
  nome: '',
  subtitulo: '',
  finalidade: '',
  preco: 0.00,
  estoque: 0,
  niveisDeGarantia: [{ componente: '', quantidade: '' }],
  umidadeMaxima: '',
  composicaoBasica: '',
  modoDeUsar: '',
  informacoesAdicionais: {
    advertencias: '',
    conservacao: '',
    apresentacao: { pesoLiquido: '' }
  },
  informacoesFabricante: {
    fabricante: '', cnpj: '', endereco: '', seloSif: ''
  },
  categoriaId: '',
  ativo: true,
  peso: 0.300,
  largura: 10.00,
  altura: 10.00,
  comprimento: 10.00,
};

const ProductFormModal = ({ product, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('geral');
  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);

  // EFEITO PARA SALVAR O RASCUNHO AUTOMATICAMENTE
  useEffect(() => {
    // Só salva o rascunho se o modal estiver aberto e for um NOVO produto
    if (isOpen && !product) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData, isOpen, product]); // Roda sempre que o formulário muda

  // EFEITO PARA CARREGAR DADOS E VERIFICAR RASCUNHO
  useEffect(() => {
    const setupForm = async () => {
      if (isOpen) {
        // Busca categorias
        try {
          const response = await ApiService.get('/categorias');
          setCategories(response.data);
        } catch (error) {
          console.error("Não foi possível carregar as categorias", error);
        }

        // Limpa imagens anteriores
        setImageFiles([]);
        setImagePreviews([]);

        if (product) {
          // MODO EDIÇÃO: Carrega dados do produto e limpa qualquer rascunho antigo
          localStorage.removeItem(DRAFT_KEY);
          setFormData({
            ...initialFormData, 
            ...product,
            categoriaId: product.categoriaId ? String(product.categoriaId) : '',
            informacoesAdicionais: {
                ...initialFormData.informacoesAdicionais,
                ...(product.informacoesAdicionais || {}),
                apresentacao: {
                    ...initialFormData.informacoesAdicionais.apresentacao,
                    ...((product.informacoesAdicionais || {}).apresentacao || {})
                }
            },
            informacoesFabricante: {
                ...initialFormData.informacoesFabricante,
                ...(product.informacoesFabricante || {})
            },
            niveisDeGarantia: product.niveisDeGarantia && product.niveisDeGarantia.length > 0 ? product.niveisDeGarantia : initialFormData.niveisDeGarantia,
          });
        } else {
          // MODO CRIAÇÃO: Verifica se existe um rascunho
          const savedDraft = localStorage.getItem(DRAFT_KEY);
          if (savedDraft) {
            if (window.confirm("Encontramos um rascunho não salvo. Deseja restaurá-lo?")) {
              setFormData(JSON.parse(savedDraft));
            } else {
              // Se o usuário não quer restaurar, limpa o rascunho e começa do zero
              localStorage.removeItem(DRAFT_KEY);
              setFormData(initialFormData);
            }
          } else {
            setFormData(initialFormData);
          }
        }
        setActiveTab('geral');
      }
    };
    
    setupForm();
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    if (name.includes('.')) {
      const [outerKey, innerKey, thirdKey] = name.split('.');
      setFormData(prev => ({ 
        ...prev, 
        [outerKey]: { 
          ...prev[outerKey], 
          ...(thirdKey 
            ? { [innerKey]: { ...prev[outerKey][innerKey], [thirdKey]: val } } 
            : { [innerKey]: val }
          ) 
        } 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleListChange = (e, index, fieldName) => {
    const { value } = e.target;
    const newList = [...formData.niveisDeGarantia];
    newList[index][fieldName] = value;
    setFormData(prev => ({ ...prev, niveisDeGarantia: newList }));
  };

  const addListItem = () => {
    setFormData(prev => ({ ...prev, niveisDeGarantia: [...prev.niveisDeGarantia, { componente: '', quantidade: '' }] }));
  };

  const removeListItem = (index) => {
    const newList = formData.niveisDeGarantia.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, niveisDeGarantia: newList }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, imageFiles);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{product ? `Editando: ${product.nome}` : 'Adicionar Novo Produto'}</h2>
          <button onClick={onClose} className={styles.closeButton}><FiX /></button>
        </div>
        
        <div className={styles.tabContainer}>
          <button type="button" onClick={() => setActiveTab('geral')} className={activeTab === 'geral' ? styles.activeTab : ''}>Geral</button>
          <button type="button" onClick={() => setActiveTab('imagens')} className={activeTab === 'imagens' ? styles.activeTab : ''}>Imagens</button>
          <button type="button" onClick={() => setActiveTab('composicao')} className={activeTab === 'composicao' ? styles.activeTab : ''}>Composição</button>
          <button type="button" onClick={() => setActiveTab('embalagem')} className={activeTab === 'embalagem' ? styles.activeTab : ''}>Embalagem</button>
          <button type="button" onClick={() => setActiveTab('frete')} className={activeTab === 'frete' ? styles.activeTab : ''}>Frete</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {activeTab === 'geral' && (
            <div className={styles.tabContent}>
              <div className={styles.formGroup}><label>Nome do Produto</label><input type="text" name="nome" value={formData.nome} onChange={handleChange} required /></div>
              <div className={styles.formGroup}><label>Subtítulo</label><input type="text" name="subtitulo" value={formData.subtitulo} onChange={handleChange} /></div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>Preço (R$)</label><input type="number" name="preco" value={formData.preco} onChange={handleChange} step="0.01" required /></div>
                <div className={styles.formGroup}><label>Estoque</label><input type="number" name="estoque" value={formData.estoque} onChange={handleChange} step="1" /></div>
              </div>
              <div className={styles.formGroup}>
                <label>Categoria / Kit</label>
                <select name="categoriaId" value={formData.categoriaId || ''} onChange={handleChange} required>
                  <option value="" disabled>Selecione uma categoria</option>
                  {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.nome}</option>))}
                </select>
              </div>
              <div className={styles.formGroup}><label>Finalidade</label><textarea name="finalidade" value={formData.finalidade} onChange={handleChange}></textarea></div>
              <div className={styles.formGroup}><label><input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange} /> Ativo</label></div>
            </div>
          )}
          {activeTab === 'imagens' && (
            <div className={styles.tabContent}>
                <h4>Upload de Novas Imagens</h4>
                <div className={styles.uploadBox}>
                    <FiUpload size={30} /><p>Arraste e solte ou clique para selecionar</p>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                </div>
                {imagePreviews.length > 0 && (
                    <div className={styles.imagePreviewContainer}>
                        {imagePreviews.map((previewUrl, index) => (
                            <div key={index} className={styles.imagePreview}>
                                <img src={previewUrl} alt={`Preview ${index}`} />
                                <button type="button" onClick={() => removeImage(index)}><FiTrash2 /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}
          {activeTab === 'composicao' && (
            <div className={styles.tabContent}>
              <h4>Níveis de Garantia</h4>
              {formData.niveisDeGarantia.map((item, index) => (
                <div key={index} className={styles.listItem}>
                  <input type="text" placeholder="Componente" value={item.componente} onChange={(e) => handleListChange(e, index, 'componente')} />
                  <input type="text" placeholder="Quantidade" value={item.quantidade} onChange={(e) => handleListChange(e, index, 'quantidade')} />
                  <button type="button" onClick={() => removeListItem(index)}><FiTrash2 /></button>
                </div>
              ))}
              <button type="button" onClick={addListItem} className={styles.addButton}><FiPlusCircle /> Adicionar Componente</button>
              <div className={styles.formGroup}><label>Umidade Máxima (%)</label><input type="text" name="umidadeMaxima" value={formData.umidadeMaxima} onChange={handleChange} /></div>
              <div className={styles.formGroup}><label>Composição Básica</label><textarea name="composicaoBasica" value={formData.composicaoBasica} onChange={handleChange}></textarea></div>
            </div>
          )}
          {activeTab === 'embalagem' && (
            <div className={styles.tabContent}>
              <div className={styles.formGroup}><label>Modo de Usar</label><textarea name="modoDeUsar" value={formData.modoDeUsar} onChange={handleChange}></textarea></div>
              <div className={styles.formGroup}><label>Advertências</label><textarea name="informacoesAdicionais.advertencias" value={formData.informacoesAdicionais.advertencias} onChange={handleChange}></textarea></div>
              <div className={styles.formGroup}><label>Conservação</label><input type="text" name="informacoesAdicionais.conservacao" value={formData.informacoesAdicionais.conservacao} onChange={handleChange} /></div>
              <div className={styles.formGroup}><label>Peso Líquido</label><input type="text" name="informacoesAdicionais.apresentacao.pesoLiquido" value={formData.informacoesAdicionais.apresentacao.pesoLiquido} onChange={handleChange} /></div>
              <hr/>
              <h4>Informações do Fabricante</h4>
              <div className={styles.formGroup}><label>Fabricante</label><input type="text" name="informacoesFabricante.fabricante" value={formData.informacoesFabricante.fabricante} onChange={handleChange} /></div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>CNPJ</label><input type="text" name="informacoesFabricante.cnpj" value={formData.informacoesFabricante.cnpj} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label>Selo SIF</label><input type="text" name="informacoesFabricante.seloSif" value={formData.informacoesFabricante.seloSif} onChange={handleChange} /></div>
              </div>
              <div className={styles.formGroup}><label>Endereço Fabricante</label><input type="text" name="informacoesFabricante.endereco" value={formData.informacoesFabricante.endereco} onChange={handleChange} /></div>
            </div>
          )}
          {activeTab === 'frete' && (
            <div className={styles.tabContent}>
                <h4>Dimensões da Embalagem</h4>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}><label>Peso (kg)</label><input type="number" name="peso" value={formData.peso} onChange={handleChange} step="0.001" /></div>
                    <div className={styles.formGroup}><label>Largura (cm)</label><input type="number" name="largura" value={formData.largura} onChange={handleChange} step="0.01" /></div>
                    <div className={styles.formGroup}><label>Altura (cm)</label><input type="number" name="altura" value={formData.altura} onChange={handleChange} step="0.01" /></div>
                    <div className={styles.formGroup}><label>Comprimento (cm)</label><input type="number" name="comprimento" value={formData.comprimento} onChange={handleChange} step="0.01" /></div>
                </div>
            </div>
          )}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
            <button type="submit" className={styles.saveButton}>Salvar Produto</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
'use client';
import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import styles from './CmsManager.module.css';

// --- DADOS PLACEHOLDER (SUBSTITUIR PELA CHAMADA DA API `GET /api/conteudo-cms`) ---
const mockCmsData = {
  paginaInicial: {
    hero: { titulo: "Suplementos Saborosos <br /> <span class='highlight'>Cães Saudáveis</span>", subtitulo: "Escolha o suplemento certo", imagem: "/hero-image.png", corDeFundo: "#D9E3FF" },
    secaoInfo: { preTitulo: "CÃO FELIZ E SAUDÁVEL", titulo: "Suplementos Mágicos", texto: "Seu cão está lidando com alergias...", imagem: "/info-dog.png" },
  },
  paginaProduto: {
    secaoBeneficiosObservados: { titulo: "Nossos Clientes Observam", corDeFundo: "#FDEBCD" },
  },
  paginaAssinatura: {
    hero: { preTitulo: "PETISCOS COM BENEFÍCIOS", titulo: "Junte-se ao Clube", texto: "A consistência é a chave...", imagem: "/subscription-dog.png" },
  },
  configuracoesGerais: {
    corPrimaria: "#1A234B",
    corSecundaria: "#f8eacb",
    emailContato: "store@buddyboost.com",
  }
};

const CmsManager = () => {
  const [activeTab, setActiveTab] = useState('paginaInicial');
  const [contentData, setContentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Simula o carregamento dos dados da API
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => { // Substitua por fetch('/api/conteudo-cms')
      setContentData(mockCmsData);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Função genérica para atualizar o estado do formulário
  const handleChange = (e, path) => {
    const { name, value } = e.target;
    setContentData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)); // Deep copy
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length; i++) {
        if (i === keys.length - 1) {
          current[keys[i]] = value;
        } else {
          current = current[keys[i]];
        }
      }
      return newData;
    });
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    console.log("Salvando dados:", contentData);
    // Substitua por: await fetch('/api/conteudo-cms', { method: 'PUT', body: JSON.stringify(contentData) });
    setTimeout(() => {
      setIsSaving(false);
      alert("Conteúdo salvo com sucesso!");
    }, 1500);
  };

  if (isLoading) {
    return <div className={styles.loading}>Carregando conteúdo...</div>;
  }

  return (
    <div className={styles.managerContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Editar Conteúdo do Site</h1>
        <button onClick={handleSave} className={styles.saveButton} disabled={isSaving}>
          <FiSave />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Abas de Navegação */}
      <div className={styles.tabContainer}>
        <button onClick={() => setActiveTab('paginaInicial')} className={activeTab === 'paginaInicial' ? styles.activeTab : ''}>Página Inicial</button>
        <button onClick={() => setActiveTab('paginaProduto')} className={activeTab === 'paginaProduto' ? styles.activeTab : ''}>Página de Produto</button>
        <button onClick={() => setActiveTab('paginaAssinatura')} className={activeTab === 'paginaAssinatura' ? styles.activeTab : ''}>Página de Assinatura</button>
        <button onClick={() => setActiveTab('configuracoesGerais')} className={activeTab === 'configuracoesGerais' ? styles.activeTab : ''}>Configurações Gerais</button>
      </div>

      {/* Conteúdo das Abas */}
      <div className={styles.tabContent}>
        {activeTab === 'paginaInicial' && (
          <div className={styles.formSection}>
            <h3>Seção Hero</h3>
            <div className={styles.formGroup}><label>Título</label><textarea value={contentData.paginaInicial.hero.titulo} onChange={(e) => handleChange(e, 'paginaInicial.hero.titulo')} /></div>
            <div className={styles.formGroup}><label>Subtítulo</label><input type="text" value={contentData.paginaInicial.hero.subtitulo} onChange={(e) => handleChange(e, 'paginaInicial.hero.subtitulo')} /></div>
            <div className={styles.formGroup}><label>Cor de Fundo</label><input type="color" value={contentData.paginaInicial.hero.corDeFundo} onChange={(e) => handleChange(e, 'paginaInicial.hero.corDeFundo')} className={styles.colorInput} /></div>
            <div className={styles.formGroup}><label>Imagem Principal (URL)</label><input type="text" value={contentData.paginaInicial.hero.imagem} onChange={(e) => handleChange(e, 'paginaInicial.hero.imagem')} /></div>
            
            <div className={styles.separator}></div>
            <h3>Seção Informativa ("Suplementos Mágicos")</h3>
            <div className={styles.formGroup}><label>Pré-título</label><input type="text" value={contentData.paginaInicial.secaoInfo.preTitulo} onChange={(e) => handleChange(e, 'paginaInicial.secaoInfo.preTitulo')} /></div>
            {/* Adicione outros campos da página inicial aqui */}
          </div>
        )}

        {activeTab === 'paginaProduto' && (
           <div className={styles.formSection}>
            <h3>Seção "Nossos Clientes Observam"</h3>
            <div className={styles.formGroup}><label>Título</label><input type="text" value={contentData.paginaProduto.secaoBeneficiosObservados.titulo} onChange={(e) => handleChange(e, 'paginaProduto.secaoBeneficiosObservados.titulo')} /></div>
            <div className={styles.formGroup}><label>Cor de Fundo</label><input type="color" value={contentData.paginaProduto.secaoBeneficiosObservados.corDeFundo} onChange={(e) => handleChange(e, 'paginaProduto.secaoBeneficiosObservados.corDeFundo')} className={styles.colorInput}/></div>
           </div>
        )}

        {activeTab === 'paginaAssinatura' && (
           <div className={styles.formSection}>
            <h3>Seção Hero ("Junte-se ao Clube")</h3>
            <div className={styles.formGroup}><label>Pré-título</label><input type="text" value={contentData.paginaAssinatura.hero.preTitulo} onChange={(e) => handleChange(e, 'paginaAssinatura.hero.preTitulo')} /></div>
            <div className={styles.formGroup}><label>Título</label><input type="text" value={contentData.paginaAssinatura.hero.titulo} onChange={(e) => handleChange(e, 'paginaAssinatura.hero.titulo')} /></div>
            <div className={styles.formGroup}><label>Texto</label><textarea value={contentData.paginaAssinatura.hero.texto} onChange={(e) => handleChange(e, 'paginaAssinatura.hero.texto')} /></div>
           </div>
        )}
        
        {activeTab === 'configuracoesGerais' && (
           <div className={styles.formSection}>
            <h3>Identidade Visual e Contato</h3>
            <div className={styles.formGroup}><label>Cor Primária</label><input type="color" value={contentData.configuracoesGerais.corPrimaria} onChange={(e) => handleChange(e, 'configuracoesGerais.corPrimaria')} className={styles.colorInput} /></div>
            <div className={styles.formGroup}><label>Cor Secundária</label><input type="color" value={contentData.configuracoesGerais.corSecundaria} onChange={(e) => handleChange(e, 'configuracoesGerais.corSecundaria')} className={styles.colorInput} /></div>
            <div className={styles.formGroup}><label>Email de Contato</label><input type="email" value={contentData.configuracoesGerais.emailContato} onChange={(e) => handleChange(e, 'configuracoesGerais.emailContato')} /></div>
           </div>
        )}
      </div>
    </div>
  );
};

export default CmsManager;
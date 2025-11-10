'use client';
import { useState } from 'react';
import Image from 'next/image';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { FiCheckCircle, FiChevronDown, FiClipboard, FiPackage, FiInfo } from 'react-icons/fi';
// import { useCart } from '../../context/CartContext'; // Descomente quando o carrinho estiver pronto
import styles from './ProductDetails.module.css';

// --- SUB-COMPONENTE PARA O ACORDEÃO ---
const AccordionItem = ({ title, icon, children, startOpen = false }) => {
  const [isOpen, setIsOpen] = useState(startOpen);
  return (
    <div className={styles.accordionItemWrapper}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.accordionItem}>
        <div>
          {icon}
          <span>{title}</span>
        </div>
        <FiChevronDown className={`${styles.accordionChevron} ${isOpen ? styles.open : ''}`} />
      </button>
      {isOpen && <div className={styles.accordionContent}>{children}</div>}
    </div>
  );
};


// --- COMPONENTE PRINCIPAL ---
const ProductDetails = ({ product }) => {
  // const { addToCart } = useCart(); // Descomente quando o carrinho estiver pronto
  const [activeTab, setActiveTab] = useState('finalidade');
  
  // --- MUDANÇA APLICADA AQUI ---
  // Em vez de buscar na variação, pegamos os dados direto do produto.
  const currentPrice = parseFloat(product.preco || 0);
  const stock = parseInt(product.estoque || 0, 10);
  // --- FIM DA MUDANÇA ---

  const handleAddToCart = () => {
    console.log("Adicionar ao carrinho clicado!");
    // Lógica do carrinho virá aqui
  };

  return (
    <div className={styles.detailsContainer}>
      {/* --- SEÇÃO HEADER --- */}
      <section>
        <h1 className={styles.productName}>{product.nome}</h1>
        <p className={styles.productSubtitle}>{product.subtitulo}</p>
        <div className={styles.headerMeta}>
          <div className={styles.rating}>
            <FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalfAlt />
            <span>4.59 de 5 (185 avaliações)</span> {/* Manter estático por enquanto */}
          </div>
        </div>
        <div className={styles.priceSection}>
          <span className={styles.currentPrice}>R$ {currentPrice.toFixed(2).replace('.', ',')}</span>
          {/* A lógica de estoque agora usa a variável 'stock' correta */}
          {stock > 0 ? (
            <span className={styles.stockStatus}><FiCheckCircle /> Em estoque</span>
          ) : (
            <span className={`${styles.stockStatus} ${styles.outOfStock}`}>Fora de estoque</span>
          )}
        </div>
      </section>

      {/* --- SEÇÃO DE ABAS (TABS) --- */}
      <section>
        <div className={styles.tabs}>
          <button onClick={() => setActiveTab('finalidade')} className={activeTab === 'finalidade' ? styles.activeTab : ''}>Finalidade</button>
          <button onClick={() => setActiveTab('composicao')} className={activeTab === 'composicao' ? styles.activeTab : ''}>Composição</button>
          <button onClick={() => setActiveTab('instrucoes')} className={activeTab === 'instrucoes' ? styles.activeTab : ''}>Modo de Usar</button>
        </div>
        <div className={styles.tabContent}>
          {activeTab === 'finalidade' && <p>{product.finalidade || 'Nenhuma finalidade especificada.'}</p>}
          {activeTab === 'composicao' && <p>{product.composicaoBasica || 'Nenhuma composição especificada.'}</p>}
          {activeTab === 'instrucoes' && <p>{product.modoDeUsar || 'Nenhuma instrução especificada.'}</p>}
        </div>
      </section>

      {/* --- SEÇÃO DE AÇÕES E CONFIANÇA --- */}
      <button onClick={handleAddToCart} className={styles.addToCartButton}>Adicionar ao Carrinho</button>
      <div className={styles.trustBox}>
        <FiCheckCircle />
        <div>
          <h4>Experimente sem riscos por 60 dias.</h4>
          <p>Se você não estiver totalmente apaixonado pelo produto, pode devolvê-lo e nós o reembolsaremos integralmente.</p>
        </div>
      </div>

      {/* --- SEÇÃO DE ACORDEÕES --- */}
      <section className={styles.accordionContainer}>
        {product.niveisDeGarantia && product.niveisDeGarantia.length > 0 && (
          <AccordionItem title="Níveis de Garantia" icon={<FiClipboard />}>
            <div className={styles.infoTable}>
              {product.niveisDeGarantia.map((item, index) => (
                item.componente && <div key={index} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{item.componente}</span>
                  <span className={styles.infoValue}>{item.quantidade}</span>
                </div>
              ))}
            </div>
          </AccordionItem>
        )}
        
        {product.informacoesAdicionais && (
          <AccordionItem title="Informações Adicionais" icon={<FiInfo />}>
            <div className={styles.infoSection}>
              {product.informacoesAdicionais.advertencias && <>
                <h4>Advertências</h4>
                <p>{product.informacoesAdicionais.advertencias}</p>
              </>}
              {product.informacoesAdicionais.conservacao && <>
                <h4>Conservação</h4>
                <p>{product.informacoesAdicionais.conservacao}</p>
              </>}
              {product.informacoesAdicionais.apresentacao?.pesoLiquido && <>
                <h4>Apresentação</h4>
                <p>Peso Líquido: {product.informacoesAdicionais.apresentacao.pesoLiquido}</p>
              </>}
            </div>
          </AccordionItem>
        )}
        
        {product.informacoesFabricante && (
          <AccordionItem title="Informações do Fabricante" icon={<FiPackage />}>
            <div className={styles.infoSection}>
              {product.informacoesFabricante.fabricante && <p><strong>Fabricante:</strong> {product.informacoesFabricante.fabricante}</p>}
              {product.informacoesFabricante.cnpj && <p><strong>CNPJ:</strong> {product.informacoesFabricante.cnpj}</p>}
              {product.informacoesFabricante.endereco && <p><strong>Endereço:</strong> {product.informacoesFabricante.endereco}</p>}
              {product.informacoesFabricante.seloSif && <p><strong>Selo SIF:</strong> {product.informacoesFabricante.seloSif}</p>}
            </div>
          </AccordionItem>
        )}
      </section>
    </div>
  );
};

export default ProductDetails;
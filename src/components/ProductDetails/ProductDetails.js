'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { FiCheckCircle, FiChevronDown, FiClipboard, FiPackage, FiInfo, FiHeart, FiAward } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api.service';
import styles from './ProductDetails.module.css';

// --- SUB-COMPONENTE ACORDEÃO ---
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
  const { addToCart, openCartPanel } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // Estados para controlar as seleções do usuário
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState('onetime'); // 'onetime' ou 'subscribe'
  const [subscriptionFrequency, setSubscriptionFrequency] = useState(30); // Padrão 30 dias

  // Dados do produto e cálculo de preços
  const originalPrice = parseFloat(product.preco || 0);
  const stock = parseInt(product.estoque || 0, 10);

  // Lógica de desconto por quantidade (Volume Discount)
  const prices = {
    1: originalPrice * 0.85, // 15% off
    2: originalPrice * 0.76, // 24% off
    3: originalPrice * 0.70, // 30% off
    4: originalPrice * 0.65, // 35% off
  };

  // Definição de preços baseada no tipo de compra
  // Assinatura aproveita o desconto de volume. Compra única usa preço cheio (neste exemplo)
  const pricePerJar = prices[quantity];
  const oneTimePrice = originalPrice; 
  const subscriptionPrice = pricePerJar; 

  // Função Principal: Adicionar ao Carrinho
  const handleMainAction = () => {
    // Prepara o objeto do produto para o carrinho
    const productToAdd = {
      id: product.id,
      name: product.nome,
      image: product.imagens?.[0] || '/placeholder-produto.png',
      quantity: quantity,
      // Flags importantes para o CartPanel decidir o fluxo de checkout
      purchaseType: purchaseType, // 'onetime' ou 'subscribe'
      frequency: purchaseType === 'subscribe' ? subscriptionFrequency : null,
      // Define o preço baseado na escolha (Assinatura tem desconto)
      price: purchaseType === 'subscribe' ? subscriptionPrice : oneTimePrice,
    };

    // Adiciona ao contexto do carrinho
    addToCart(productToAdd);
    
    // Abre o painel lateral para feedback visual
    openCartPanel();
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
            <span>4.59 de 5 (185 avaliações)</span>
          </div>
        </div>
        <div className={styles.priceSection}>
          {/* Mostra preços diferentes dependendo da seleção atual */}
          <span className={styles.originalPrice}>
            R$ {purchaseType === 'subscribe' ? oneTimePrice.toFixed(2).replace('.', ',') : (originalPrice * 1.2).toFixed(2).replace('.', ',')}
          </span>
          <span className={styles.currentPrice}>
            R$ {purchaseType === 'subscribe' ? subscriptionPrice.toFixed(2).replace('.', ',') : oneTimePrice.toFixed(2).replace('.', ',')}
          </span>
          
          {stock > 0 ? (
            <span className={styles.stockStatus}><FiCheckCircle /> Em estoque</span>
          ) : (
            <span className={`${styles.stockStatus} ${styles.outOfStock}`}>Fora de estoque</span>
          )}
        </div>
      </section>

      {/* --- SEÇÃO 1: QUANTIDADE --- */}
      <div className={styles.purchaseOptionsContainer}>
        <h3 className={styles.sectionTitle}>1 - Selecione a quantidade</h3>
        <div className={styles.quantityGrid}>
          <div className={`${styles.quantityOption} ${quantity === 1 ? styles.selectedOption : ''}`} onClick={() => setQuantity(1)}>
            <Image src={product.imagens?.[0] || '/placeholder-produto.png'} alt="1 Pote" width={50} height={50} />
            <div>
              <span className={styles.quantityTitle}>1 Pote <span className={styles.discountTag}>-15%</span></span>
              <span className={styles.pricePerJar}>R$ {prices[1].toFixed(2).replace('.', ',')} / pote</span>
            </div>
          </div>
          <div className={`${styles.quantityOption} ${quantity === 2 ? styles.selectedOption : ''}`} onClick={() => setQuantity(2)}>
            <span className={styles.tag + ' ' + styles.popular}><FiAward /> Mais Popular</span>
            <Image src={product.imagens?.[0] || '/placeholder-produto.png'} alt="2 Potes" width={50} height={50} />
            <div>
              <span className={styles.quantityTitle}>2 Potes <span className={styles.discountTag}>-24%</span></span>
              <span className={styles.pricePerJar}>R$ {prices[2].toFixed(2).replace('.', ',')} / pote</span>
            </div>
          </div>
          <div className={`${styles.quantityOption} ${quantity === 3 ? styles.selectedOption : ''}`} onClick={() => setQuantity(3)}>
             <Image src={product.imagens?.[0] || '/placeholder-produto.png'} alt="3 Potes" width={50} height={50} />
            <div>
              <span className={styles.quantityTitle}>3 Potes <span className={styles.discountTag}>-30%</span></span>
              <span className={styles.pricePerJar}>R$ {prices[3].toFixed(2).replace('.', ',')} / pote</span>
            </div>
          </div>
          <div className={`${styles.quantityOption} ${quantity === 4 ? styles.selectedOption : ''}`} onClick={() => setQuantity(4)}>
            <span className={styles.tag + ' ' + styles.bestValue}><FiHeart /> Melhor Valor</span>
             <Image src={product.imagens?.[0] || '/placeholder-produto.png'} alt="4 Potes" width={50} height={50} />
            <div>
              <span className={styles.quantityTitle}>4 Potes <span className={styles.discountTag}>-35%</span></span>
              <span className={styles.pricePerJar}>R$ {prices[4].toFixed(2).replace('.', ',')} / pote</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- SEÇÃO 2: PLANO --- */}
      <div className={styles.purchaseOptionsContainer}>
          <h3 className={styles.sectionTitle}>2 - Selecione o plano</h3>
          
          {/* Opção Compra Única */}
          <div className={`${styles.planOption} ${purchaseType === 'onetime' ? styles.selectedOption : ''}`} onClick={() => setPurchaseType('onetime')}>
              <input type="radio" name="purchaseType" checked={purchaseType === 'onetime'} readOnly />
              <div className={styles.planText}>
                  <span className={styles.planTitle}>Compra Única</span>
              </div>
              <div className={styles.planPriceContainer}>
                  <span className={styles.planOriginalPrice}>R$ {(originalPrice * 1.2).toFixed(2).replace('.', ',')}</span>
                  <span className={styles.planFinalPrice}>R$ {oneTimePrice.toFixed(2).replace('.', ',')}</span>
              </div>
          </div>

          {/* Opção Assinatura */}
          <div className={`${styles.planOption} ${purchaseType === 'subscribe' ? styles.selectedOption : ''}`} onClick={() => setPurchaseType('subscribe')}>
              <span className={styles.saveTag}>Economize R$ {(oneTimePrice - subscriptionPrice).toFixed(2).replace('.',',')}</span>
              <input type="radio" name="purchaseType" checked={purchaseType === 'subscribe'} readOnly />
              <div className={styles.planText}>
                  <span className={styles.planTitle}>Assinatura</span>
                  {purchaseType === 'subscribe' && (
                    <div className={styles.planBenefits}>
                        <span><FiCheckCircle /> Economia extra de 15%</span>
                        <span><FiCheckCircle /> Pule, adie ou cancele a qualquer momento</span>
                    </div>
                  )}
              </div>
              <div className={styles.planPriceContainer}>
                  <span className={styles.planOriginalPrice}>R$ {oneTimePrice.toFixed(2).replace('.', ',')}</span>
                  <span className={styles.planFinalPrice}>R$ {subscriptionPrice.toFixed(2).replace('.', ',')}</span>
              </div>

              {/* Seletor de Frequência (Só aparece se Assinatura estiver selecionada) */}
              {purchaseType === 'subscribe' && (
                  <div className={styles.dogSizeSelectorWrapper}>
                      <p className={styles.dogSizeLabel}>Frequência de envio:</p>
                      <div className={styles.dogSizeSelector}>
                          <button 
                            className={subscriptionFrequency === 30 ? styles.activeDogSize : ''} 
                            onClick={(e) => { e.stopPropagation(); setSubscriptionFrequency(30); }}
                          >
                            <strong>A cada 30 dias</strong>
                          </button>
                          <button 
                            className={subscriptionFrequency === 60 ? styles.activeDogSize : ''} 
                            onClick={(e) => { e.stopPropagation(); setSubscriptionFrequency(60); }}
                          >
                            <strong>A cada 60 dias</strong>
                          </button>
                          <button 
                            className={subscriptionFrequency === 90 ? styles.activeDogSize : ''} 
                            onClick={(e) => { e.stopPropagation(); setSubscriptionFrequency(90); }}
                          >
                            <strong>A cada 90 dias</strong>
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* --- BOTÃO DE AÇÃO ÚNICO --- */}
      <button onClick={handleMainAction} className={styles.addToCartButton}>
        {purchaseType === 'onetime' ? 'Adicionar ao Carrinho' : 'Adicionar Assinatura ao Carrinho'}
      </button>

      {/* --- SEÇÃO DE CONFIANÇA --- */}
      <div className={styles.trustBox}>
        <FiCheckCircle />
        <div>
          <h4>Experimente sem riscos por 60 dias.</h4>
          <p>Se você não estiver totalmente apaixonado pelo produto, pode devolvê-lo e nós o reembolsaremos integralmente.</p>
        </div>
      </div>

      {/* --- SEÇÃO DE ACORDEÕES --- */}
      <section className={styles.accordionContainer}>
        <AccordionItem title="Finalidade" icon={<FiClipboard />} startOpen={true}>
            <p>{product.finalidade || 'Nenhuma finalidade especificada.'}</p>
        </AccordionItem>
        <AccordionItem title="Composição" icon={<FiInfo />}>
            <p>{product.composicaoBasica || 'Nenhuma composição especificada.'}</p>
        </AccordionItem>
        <AccordionItem title="Modo de Usar" icon={<FiPackage />}>
            <p>{product.modoDeUsar || 'Nenhuma instrução especificada.'}</p>
        </AccordionItem>
      </section>
    </div>
  );
};

export default ProductDetails;
'use client';
import { useState } from 'react';
import { FiHelpCircle, FiChevronDown } from 'react-icons/fi';
import styles from './FaqSection.module.css';

// Dados placeholder para o FAQ
const faqData = [
  {
    question: 'Com que idade meu cão deve começar a usar um suplemento para quadril e articulação?',
    answer: 'Recomendamos iniciar os suplementos para articulações como medida preventiva por volta de 1 ano de idade para raças predispostas a problemas articulares, ou a qualquer momento que você notar sinais de desconforto em seu cão.'
  },
  {
    question: 'Os mastigáveis para quadril e articulação são adequados apenas para cães idosos?',
    answer: 'Não, eles são benéficos para cães de todas as idades. Para cães mais jovens e ativos, eles ajudam a manter a saúde das articulações, e para cães mais velhos, eles ajudam a aliviar o desconforto existente e a melhorar a mobilidade.'
  },
  {
    question: 'Este suplemento pode aliviar o desconforto ocasional?',
    answer: 'Sim, os ingredientes ativos como Glucosamina e Mexilhão de Lábios Verdes são conhecidos por suas propriedades anti-inflamatórias, que podem ajudar a aliviar o desconforto ocasional após exercícios intensos ou pequenas lesões.'
  },
  {
    question: 'Com que frequência devo administrar este suplemento ao meu cão?',
    answer: 'Para obter os melhores resultados, o suplemento deve ser administrado diariamente. Consulte a tabela de "Instruções" na página do produto para saber a quantidade correta com base no peso do seu cão.'
  },
  {
    question: 'Como foram selecionados os ingredientes para este suplemento?',
    answer: 'Cada ingrediente foi selecionado por nossa equipe de veterinários com base em pesquisas científicas que comprovam sua eficácia e segurança na promoção da saúde das articulações em cães.'
  }
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>FAQ</h2>
        <div className={styles.faqList}>
          {faqData.map((item, index) => (
            <div key={index} className={styles.faqItem}>
              <button onClick={() => handleToggle(index)} className={styles.question}>
                <div className={styles.questionContent}>
                  <FiHelpCircle className={styles.icon} />
                  <span>{item.question}</span>
                </div>
                <FiChevronDown className={`${styles.chevron} ${openIndex === index ? styles.open : ''}`} />
              </button>
              {openIndex === index && (
                <div className={styles.answer}>
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
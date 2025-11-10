'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight, FiList, FiChevronDown } from 'react-icons/fi';
import styles from './IngredientsCarousel.module.css';

// Importa os estilos CSS necessários para o Swiper funcionar
import 'swiper/css';
import 'swiper/css/navigation';

// --- DADOS DOS INGREDIENTES ---
const ingredients = [
  { name: 'Glucosamina', image: '/icons/glucosamine.png', description: 'Apoia a saúde das articulações promovendo o reparo da cartilagem, reduzindo a inflamação e melhorando a mobilidade, para aliviar a dor e a rigidez em cães.' },
  { name: 'Condroitina', image: '/icons/chondroitin.png', description: 'Melhora a função articular protegendo a cartilagem da degradação, reduzindo a dor e melhorando a flexibilidade, contribuindo para a saúde e mobilidade geral das articulações.' },
  { name: 'Colágeno Tipo II', image: '/icons/collagen.png', description: 'Apoia a saúde articular e da cartilagem, promovendo elasticidade e força, reduzindo a rigidez e auxiliando na reparação de tecidos danificados.' },
  { name: 'Mexilhão de Lábios Verdes', image: '/icons/mussel.png', description: 'Rico em Ômega-3 e outros nutrientes, reduz a inflamação articular, alivia a dor e apoia a melhoria da flexibilidade e mobilidade das articulações.' },
  { name: 'MSM', image: '/icons/msm.png', description: 'Apoia a cartilagem, reduz a dor nas articulações e melhora a mobilidade.' }
];

// --- TEXTO PARA O ACORDEÃO "TODOS OS INGREDIENTES" ---
const allIngredientsText = {
  active: "Ingredientes ativos (por mastigável de 2.5g): Glucosamina HCl: 250mg; MSM: 150mg; Cúrcuma Orgânica: 150mg; Sulfato de Condroitina: 150mg; Óleo de Salmão do Alasca: 100mg; Ácido Ascórbico (Vitamina C): 50mg; Garra do Diabo em Pó: 25mg; Pimenta Preta: 10mg; Colágeno tipo II: 2.5mg; RRR-alfatocoferol (Vitamina E Natural): 15UI.",
  other: "Outros ingredientes: Lecitina de Girassol, Glicerina Vegetal, Óleo de Canola, Óleo de Girassol, Batata Doce, Vinagre Branco Tamponado, Ácido Cítrico, Tocoferóis Mistos.",
  analytical: "Constituintes analíticos: Proteína: 16%; Teor de gordura: 19%; Fibra bruta: 0%; Matéria inorgânica: 7%."
};

// --- COMPONENTE PRINCIPAL ---
const IngredientsCarousel = () => {
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState(null); // Estado para guardar a instância do Swiper

  // --- LÓGICA PARA IGUALAR A ALTURA DOS SLIDES ---
  useEffect(() => {
    // Só executa se a instância do Swiper já existir
    if (!swiperInstance) return;

    const equalizeHeights = () => {
      const slides = swiperInstance.slides;
      if (!slides || slides.length === 0) return;

      // Reseta a altura para 'auto' para recalcular corretamente no redimensionamento da janela
      slides.forEach(slide => {
        slide.style.height = 'auto';
      });

      // Encontra a maior altura entre os slides visíveis
      const maxHeight = Math.max(...slides.map(slide => slide.offsetHeight));
      
      // Aplica a maior altura a todos os slides
      slides.forEach(slide => {
        slide.style.height = `${maxHeight}px`;
      });
    };

    // Chama a função quando o componente monta e sempre que a tela é redimensionada
    equalizeHeights();
    swiperInstance.on('resize', equalizeHeights);
    window.addEventListener('resize', equalizeHeights);

    // Função de limpeza para remover os event listeners e evitar memory leaks
    return () => {
      swiperInstance.off('resize', equalizeHeights);
      window.removeEventListener('resize', equalizeHeights);
    };
  }, [swiperInstance]); // O array de dependências garante que este hook rode sempre que a instância do Swiper for atualizada

  return (
    <section className={styles.carouselSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Fórmula Poderosa</h2>
        <p className={styles.subtitle}>
          Uma mistura do melhor da natureza, cada ingrediente é cuidadosamente selecionado para curar, acalmar e nutrir seu cão. Tudo funciona harmoniosamente para aliviar o desconforto, aumentar a vitalidade e apoiar o bem-estar geral do seu cão.
        </p>
        
        <div className={styles.carouselWrapper}>
          <Swiper
            modules={[Navigation]}
            onSwiper={setSwiperInstance} // Captura a instância do Swiper e a salva no estado
            spaceBetween={30}
            slidesPerView={4}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            breakpoints={{ // Configurações de responsividade do carrossel
              320: { slidesPerView: 1, spaceBetween: 20 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 30 },
              1024: { slidesPerView: 4, spaceBetween: 30 },
            }}
          >
            {ingredients.map((item) => (
              <SwiperSlide key={item.name} className={styles.slide}>
                <div className={styles.iconWrapper}>
                  <Image src={item.image} alt={item.name} width={50} height={50} />
                </div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Botões de navegação customizados */}
          <div className="swiper-button-prev-custom"><FiChevronLeft /></div>
          <div className="swiper-button-next-custom"><FiChevronRight /></div>
        </div>

        {/* Acordeão de Ingredientes */}
        <div className={styles.accordion}>
          <button onClick={() => setAccordionOpen(!accordionOpen)} className={styles.accordionHeader}>
            <div><FiList /><span>Todos os ingredientes</span></div>
            <FiChevronDown className={`${styles.accordionIcon} ${accordionOpen ? styles.open : ''}`} />
          </button>
          {accordionOpen && (
            <div className={styles.accordionContent}>
              <p><strong>Ingredientes ativos:</strong> {allIngredientsText.active}</p>
              <p><strong>Outros ingredientes:</strong> {allIngredientsText.other}</p>
              <p><strong>Constituintes analíticos:</strong> {allIngredientsText.analytical}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default IngredientsCarousel;
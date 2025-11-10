import { notFound } from 'next/navigation';

// Componentes da Página
import ProductImageGallery from '../../../components/ProductImageGallery/ProductImageGallery';
import ProductDetails from '../../../components/ProductDetails/ProductDetails';
import FeaturedBrands from '../../../components/FeaturedBrands/FeaturedBrands';
import ObservedBenefits from '../../../components/ObservedBenefits/ObservedBenefits';
import InfoSectionPDP from '../../../components/InfoSectionPDP/InfoSectionPDP';
import IngredientsCarousel from '../../../components/IngredientsCarousel/IngredientsCarousel';
import PawsitiveGuarantee from '../../../components/PawsitiveGuarantee/PawsitiveGuarantee';
import CustomerReviews from '../../../components/CustomerReviews/CustomerReviews';
import FaqSection from '../../../components/FaqSection/FaqSection';
import RelatedProducts from '../../../components/RelatedProducts/RelatedProducts';

// Estilos
import styles from './page.module.css';

// --- FUNÇÃO DE BUSCA DE DADOS ---
// Esta função é executada no servidor para buscar os dados do produto da sua API.
async function getProductData(slug) {
  // Se o slug for undefined ou nulo, não faz sentido fazer a chamada.
  if (!slug) {
    console.error("[getProductData] Slug recebido é undefined. Abortando a chamada à API.");
    return null;
  }
  
  try {
    // Usamos a variável de ambiente específica do servidor.
    const apiUrl = `${process.env.API_URL_SERVER}/produtos/${slug}`;
    
    // Log para depuração no terminal do servidor Next.js
    console.log(`[Frontend] Buscando dados do produto em: ${apiUrl}`);

    const res = await fetch(apiUrl, { 
      // Desativa o cache para garantir que estamos sempre buscando dados novos durante o desenvolvimento.
      // Em produção, você pode mudar para: next: { revalidate: 60 }
      cache: 'no-store' 
    });

    console.log(`[Frontend] Status da resposta da API: ${res.status}`);

    if (!res.ok) {
      console.error(`[Frontend] Erro na API: Status ${res.status}`, await res.text());
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("[Frontend] Falha na chamada fetch para a API:", error);
    return null;
  }
}

// --- COMPONENTE DA PÁGINA (SERVER COMPONENT) ---
export default async function ProductPage({ params }) {
  
  // Aguardamos a resolução da promise 'params' antes de acessar 'slug'.
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Agora passamos o slug resolvido para a função de busca.
  const product = await getProductData(slug);

  // Se a função getProductData retornou null (produto não encontrado),
  // o Next.js renderizará a página 404 padrão.
  if (!product) {
    notFound();
  }

  return (
    <>
      {/* Seção principal do produto com imagem e detalhes */}
      <div className={styles.productContainer}>
        <div className={styles.leftColumn}>
          <ProductImageGallery images={product.imagens || []} />
        </div>
        <div className={styles.rightColumn}>
          <ProductDetails product={product} />
        </div>
      </div>

      {/* Seções adicionais da página, exatamente como você já tinha */}
      <FeaturedBrands />
      <ObservedBenefits />
      <InfoSectionPDP />
      <IngredientsCarousel />
      <PawsitiveGuarantee />
      
      {/* --- MUDANÇA APLICADA AQUI --- */}
      {/* Passamos o ID do produto para o componente de avaliações */}
      <CustomerReviews productId={product.id} />
      
      <FaqSection />
      <RelatedProducts />
    </>
  );
}
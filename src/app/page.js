import Hero from '../components/Hero/Hero';
import FeaturedBrands from '../components/FeaturedBrands/FeaturedBrands'; // 1. Importe o novo componente
import ProductShowcase from '../components/ProductShowcase/ProductShowcase'; // 1. Importe aqui
import InfoSection from '../components/InfoSection/InfoSection'; // 1. Importe o componente
import Benefits from '../components/Benefits/Benefits'; // 1. Importe o componente
import GuaranteeSection from '../components/GuaranteeSection/GuaranteeSection'; // 1. Importe
import BrandMission from '../components/BrandMission/BrandMission'; // 1. Importe
import Testimonials from '../components/Testimonials/Testimonials'; // 2. Import

import './globals.css'; // Mantenha os estilos globais

export const metadata = {
  title: 'Buddy Boost',
  description: 'Sua loja de e-commerce',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
         <Hero />
         <FeaturedBrands /> {/* 2. Adicione o componente aqui */}
         <ProductShowcase /> {/* 2. Adicione aqui */}
               <InfoSection /> {/* 2. Adicione a nova seção aqui */}
                     <Benefits /> {/* 2. Adicione a nova seção aqui */}
                     <GuaranteeSection /> {/* 2. Adicione aqui */}
                      <BrandMission /> {/* 3. Adicione aqui */}
      <Testimonials /> {/* 4. E aqui */}




        <main>{children}</main>
        {/* Você pode adicionar um Footer aqui depois */}
      </body>
    </html>
  );
}
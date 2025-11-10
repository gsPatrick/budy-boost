import { Assistant } from 'next/font/google';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Componentes do Layout
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import CartPanel from '../components/CartPanel/CartPanel';

// Contextos
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext'; // 1. Importe o AuthProvider

// ... (configuração de fontes permanece a mesma)
const assistant = Assistant({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-assistant',
});
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Buddy Boost | Suplementos para Cães",
  description: "A melhor nutrição para a saúde e bem-estar do seu cão.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className={`${assistant.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {/* 2. Envolva a aplicação com o AuthProvider */}
        <AuthProvider>
          <CartProvider>
            <Header />
            <CartPanel />
            <main>
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
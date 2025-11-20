import { Assistant, Geist, Geist_Mono } from 'next/font/google';
import "./globals.css";
import Script from 'next/script';
import ClientLayout from '../components/ClientLayout/ClientLayout'; // Importe o componente criado

// Configuração de Fontes
const assistant = Assistant({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-assistant',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadados (SEO) - Funciona apenas em Server Components
export const metadata = {
  title: "Buddy Boost | Suplementos para Cães",
  description: "A melhor nutrição para a saúde e bem-estar do seu cão.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className={`${assistant.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {/* Envolvemos tudo com o ClientLayout que lida com a lógica visual */}
        <ClientLayout>
          <main>{children}</main>
        </ClientLayout>

        {/* Scripts Globais */}
        <Script src="https://sdk.mercadopago.com/js/v2" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
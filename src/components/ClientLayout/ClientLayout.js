'use client'; // Isso marca este arquivo como Client Component

import { usePathname } from 'next/navigation';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import CartPanel from '../CartPanel/CartPanel';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // Verifica se a rota atual começa com /admin
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <AuthProvider>
      <CartProvider>
        {/* Só mostra Header e CartPanel se NÃO for admin */}
        {!isAdmin && <Header />}
        {!isAdmin && <CartPanel />}
        
        {/* O conteúdo principal (páginas) é renderizado aqui */}
        {children}
        
        {/* Só mostra Footer se NÃO for admin */}
        {!isAdmin && <Footer />}
      </CartProvider>
    </AuthProvider>
  );
}
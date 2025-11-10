'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiChevronDown, FiUser, FiShoppingBag, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const { openCartPanel, cartItemCount } = useCart();
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Barra de Anúncio Superior */}
      <div className={styles.announcementBar}>
        <p>Compre 2 e Ganhe Frete Grátis 📦</p>
      </div>

      {/* Header Principal */}
      <header className={styles.mainHeader}>
        <div className={styles.container}>
          
          {/* Lado Esquerdo: Links de Navegação (Desktop) e Botão de Menu (Mobile) */}
          <div className={styles.leftSection}>
            <nav className={styles.navigation}>
              <Link href="/loja" className={styles.navLink}>
                Loja <FiChevronDown />
              </Link>
              <Link href="/assinatura" className={styles.navLink}>Assinatura</Link>
              <Link href="/kits" className={styles.navLink}>Kits</Link>
              <Link href="/quiz" className={styles.navLink}>Quiz</Link>
            </nav>
            <button className={styles.mobileMenuButton} onClick={() => setIsMenuOpen(true)} aria-label="Abrir menu">
              <FiMenu size={26} />
            </button>
          </div>

          {/* Logo Central */}
          <div className={styles.logo}>
            <Link href="/">Buddy Boost</Link>
          </div>

          {/* Lado Direito: Ações do Usuário */}
          <div className={styles.rightSection}>
            <div className={styles.userActions}>
              {/* Lógica de Autenticação */}
              {!loading && (
                user ? (
                  <>
                    {/* Versão Desktop do link de usuário */}
                    <Link href={user.tipo === 'admin' ? '/admin/pedidos' : '/conta/perfil'} className={`${styles.iconLink} ${styles.desktopOnly}`}>
                      <FiUser size={22} /> Olá, {user.nome.split(' ')[0]}
                    </Link>
                    <button onClick={logout} className={`${styles.iconLink} ${styles.logoutButton} ${styles.desktopOnly}`}>
                      <FiLogOut size={22} />
                    </button>
                    
                    {/* Ícone de usuário para mobile */}
                     <Link href={user.tipo === 'admin' ? '/admin/pedidos' : '/conta/perfil'} className={`${styles.iconLink} ${styles.mobileOnly}`}>
                      <FiUser size={24} />
                    </Link>
                  </>
                ) : (
                  // Ícone de login para todos os dispositivos quando deslogado
                  <Link href="/conta" className={styles.iconLink}>
                    <FiUser size={24} />
                  </Link>
                )
              )}
            </div>
            
            {/* Botão do Carrinho */}
            <button onClick={openCartPanel} className={styles.cartButton}>
              <FiShoppingBag size={24} />
              {cartItemCount > 0 && (
                <span className={styles.cartCount}>{cartItemCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Painel do Menu Mobile (Drawer) */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuHeader}>
            <div className={styles.logoMobile}>
              <Link href="/">Buddy Boost</Link>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className={styles.closeButton} aria-label="Fechar menu">
              <FiX size={26} />
            </button>
          </div>
          <nav className={styles.mobileNav}>
            <Link href="/loja" onClick={() => setIsMenuOpen(false)} className={styles.mobileNavLink}>Loja</Link>
            <Link href="/assinatura" onClick={() => setIsMenuOpen(false)} className={styles.mobileNavLink}>Assinatura</Link>
            <Link href="/kits" onClick={() => setIsMenuOpen(false)} className={styles.mobileNavLink}>Kits</Link>
            <Link href="/quiz" onClick={() => setIsMenuOpen(false)} className={styles.mobileNavLink}>Quiz</Link>
            {user && (
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className={styles.mobileLogoutButton}>
                <FiLogOut /> Sair
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
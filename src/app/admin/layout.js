'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiHome, FiBox, FiShoppingBag, FiUsers, FiSettings, 
  FiLogOut, FiTrendingUp, FiFileText 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import styles from './adminLayout.module.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/conta');
  };

  const navItems = [
    { href: '/admin', icon: <FiHome />, label: 'Dashboard' },
    { href: '/admin/pedidos', icon: <FiShoppingBag />, label: 'Pedidos' },
    { href: '/admin/produtos', icon: <FiBox />, label: 'Produtos' },
    { href: '/admin/categorias', icon: <FiFileText />, label: 'Categorias' },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar Fixa */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>BuddyAdmin</h1>
          <span className={styles.badge}>PRO</span>
        </div>

        <div className={styles.userProfile}>
           <div className={styles.avatar}>{user?.nome?.charAt(0) || 'A'}</div>
           <div className={styles.userInfo}>
             <p className={styles.userName}>{user?.nome || 'Admin'}</p>
             <p className={styles.userRole}>Administrador</p>
           </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.footerNav}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FiLogOut /> Sair
          </button>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
           <h2>Painel de Controle</h2>
           <div className={styles.dateDisplay}>
             {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </div>
        </header>
        <div className={styles.scrollableContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
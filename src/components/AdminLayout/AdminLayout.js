'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiBox, FiFileText, FiLayout, FiLogOut } from 'react-icons/fi';
import styles from './AdminLayout.module.css';

const AdminLayout = ({ children }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/pedidos', icon: <FiBox />, label: 'Gerenciar Pedidos' },
    { href: '/admin/produtos', icon: <FiFileText />, label: 'Gerenciar Produtos' },
    { href: '/admin/cms', icon: <FiLayout />, label: 'Editar Conteúdo do Site' },
       { href: '/admin/categorias', icon: <FiLayout />, label: 'Categorias / Kits' }, 
    // { href: '/admin/cms', icon: <FiLayout />, label: 'Editar Conteúdo do Site' }, // Se você tinha esta, pode manter ou substituir
  ];

  return (
    <div className={styles.layoutContainer}>
      {/* Menu Lateral */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Link href="/admin/pedidos">Buddy Boost Admin</Link>
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.logout}>
          <button className={styles.navItem}><FiLogOut /><span>Sair</span></button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
import Link from 'next/link';
import { FiArrowRight, FiFacebook, FiInstagram } from 'react-icons/fi';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footerWrapper}>
      {/* Seção Newsletter */}
      <div className={styles.newsletterSection}>
        <h2 className={styles.newsletterTitle}>Junte-se ao Clube do Cão</h2>
        <p className={styles.newsletterSubtitle}>Seja o primeiro a saber sobre novas coleções e ofertas exclusivas.</p>
        <form className={styles.newsletterForm}>
          <input type="email" placeholder="Email" className={styles.newsletterInput} />
          <button type="submit" className={styles.newsletterButton}>
            <FiArrowRight size={22} />
          </button>
        </form>
      </div>

      {/* Seção Principal do Rodapé */}
      <div className={styles.mainFooter}>
        <div className={styles.footerGrid}>
          {/* Coluna 1: Logo e Info */}
          <div className={styles.footerColumn}>
            <h3 className={`${styles.logo} ${styles.columnTitle}`}>Buddy Boost</h3>
            <p>Uccle, Belgium</p>
            <p>Avenue de la Sapinière 51B</p>
            <Link href="mailto:store@buddyboost.com" className={styles.footerLink}>store@buddyboost.com</Link>
            <Link href="/revendedor" className={styles.footerLink}>Torne-se um revendedor</Link>
          </div>

          {/* Coluna 2: Loja */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Loja</h3>
            <ul>
              <li><Link href="/produtos/suplementos" className={styles.footerLink}>Suplementos para Cães</Link></li>
              <li><Link href="/produtos/cama" className={styles.footerLink}>Cama Calmante para Cães</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Links */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Links</h3>
            <ul>
              <li><Link href="/conta/assinatura" className={styles.footerLink}>Gerenciar assinatura</Link></li>
              <li><Link href="/politica-envio" className={styles.footerLink}>Política de envio</Link></li>
              <li><Link href="/politica-devolucao" className={styles.footerLink}>Política de devolução</Link></li>
              <li><Link href="/termos" className={styles.footerLink}>Termos e condições</Link></li>
              <li><Link href="/privacidade" className={styles.footerLink}>Política de privacidade</Link></li>
              <li><Link href="/contato" className={styles.footerLink}>Contato</Link></li>
              <li><Link href="/garantia" className={styles.footerLink}>Garantia de devolução</Link></li>
              <li><Link href="/blog" className={styles.footerLink}>Blog</Link></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <div className={styles.socialIcons}>
            <Link href="#" aria-label="Facebook"><FiFacebook size={20} /></Link>
            <Link href="#" aria-label="Instagram"><FiInstagram size={20} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
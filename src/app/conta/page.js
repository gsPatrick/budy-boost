import AuthForm from '../../components/AuthForm/AuthForm';
import styles from './page.module.css';

export default function AccountPage() {
  return (
    <main className={styles.main}>
      <AuthForm />
    </main>
  );
}
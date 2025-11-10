'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importe o useRouter
import { useAuth } from '../../context/AuthContext'; // Importe o hook de autenticação
import ApiService from '../../services/api.service'; // Importe para o registro
import styles from './AuthForm.module.css';

const AuthForm = () => {
  const [formType, setFormType] = useState('login');
  const [error, setError] = useState(null); // Estado para mensagens de erro
  const [loading, setLoading] = useState(false); // Estado para feedback de carregamento
  const router = useRouter();
  const { login } = useAuth(); // Pega a função de login do nosso contexto

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = e.target.elements['login-email'].value;
    const password = e.target.elements['login-password'].value;

    try {
      // Chama a função de login do contexto
      const usuario = await login(email, password);

      // Redireciona com base no tipo de usuário
      if (usuario.tipo === 'admin') {
        router.push('/admin/pedidos'); // Redireciona admin para o painel
      } else {
        router.push('/conta/perfil'); // Redireciona cliente para o perfil (exemplo)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.erro || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const nome = e.target.elements['register-name'].value;
    const email = e.target.elements['register-email'].value;
    const password = e.target.elements['register-password'].value;

    try {
      // A API de registro já retorna o token e loga o usuário
      const response = await ApiService.post('/auth/register', { nome, email, senha: password });
      
      // Após o registro, fazemos o login "manualmente" para atualizar nosso contexto
      await login(email, password);
      
      // Redireciona o novo cliente para a página de perfil
      router.push('/conta/perfil');

    } catch (err) {
      const errorMessage = err.response?.data?.erro || 'Erro ao criar conta. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      {formType === 'login' ? (
        <div className={styles.formContainer}>
          <h2 className={styles.title}>Bem-vindo de volta!</h2>
          <p className={styles.subtitle}>Acesse sua conta para gerenciar seus pedidos e assinaturas.</p>
          <form onSubmit={handleLoginSubmit} className={styles.form}>
            {/* ... campos de email e senha ... */}
            <div className={styles.inputGroup}>
              <label htmlFor="login-email">Email</label>
              <input type="email" id="login-email" required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="login-password">Senha</label>
              <input type="password" id="login-password" required />
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className={styles.toggleText}>
            Não tem uma conta?{' '}
            <button onClick={() => { setFormType('cadastro'); setError(null); }} className={styles.toggleButton}>
              Cadastre-se
            </button>
          </p>
        </div>
      ) : (
        <div className={styles.formContainer}>
          <h2 className={styles.title}>Crie sua Conta</h2>
          <p className={styles.subtitle}>Junte-se ao clube Buddy Boost para uma experiência de compra mais rápida.</p>
          <form onSubmit={handleRegisterSubmit} className={styles.form}>
            {/* ... campos de nome, email e senha ... */}
            <div className={styles.inputGroup}>
              <label htmlFor="register-name">Nome Completo</label>
              <input type="text" id="register-name" required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="register-email">Email</label>
              <input type="email" id="register-email" required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="register-password">Senha</label>
              <input type="password" id="register-password" required />
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>
          <p className={styles.toggleText}>
            Já tem uma conta?{' '}
            <button onClick={() => { setFormType('login'); setError(null); }} className={styles.toggleButton}>
              Faça login
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
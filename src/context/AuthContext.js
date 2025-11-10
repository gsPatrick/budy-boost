'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '../services/api.service';

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor (Provider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Começa como true para verificar o token inicial
  const router = useRouter();

  // Efeito para verificar se já existe um token no carregamento da aplicação
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Se houver token, busca os dados do usuário para validar
          const response = await ApiService.get('/usuarios/perfil');
          setUser(response.data); // Armazena os dados do usuário no estado
        } catch (error) {
          // Se o token for inválido, o interceptor do api.service já vai limpar e redirecionar
          console.error("Token inválido ou expirado. Removendo...");
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false); // Finaliza o carregamento inicial
    };

    validateToken();
  }, []);

  // Função de Login
  const login = async (email, senha) => {
    const response = await ApiService.post('/auth/login', { email, senha });
    const { token, usuario } = response.data;
    
    localStorage.setItem('token', token);
    setUser(usuario);

    // Retorna o usuário para que o componente possa decidir para onde redirecionar
    return usuario;
  };

  // Função de Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Redireciona para a página de login após o logout
    router.push('/conta');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
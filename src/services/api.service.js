import axios from 'axios';

// 1. CONFIGURAÇÃO DA URL BASE DA API
// Use uma variável de ambiente para a URL da API.
// No seu arquivo .env.local, adicione: NEXT_PUBLIC_API_URL=https://geral-shopifyapi.r954jc.easypanel.host/
const API_URL = 'https://geral-shopifyapi.r954jc.easypanel.host/api';

// 2. CRIAÇÃO DA INSTÂNCIA DO AXIOS
// Criamos uma instância pré-configurada do axios que será usada em todo o projeto.
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. INTERCEPTOR DE REQUISIÇÃO (Request Interceptor)
// Esta função é executada ANTES de cada requisição ser enviada.
// Sua principal função é injetar o token de autenticação no cabeçalho.
api.interceptors.request.use(
  (config) => {
    // Tenta pegar o token do localStorage (ou de onde você o armazenar após o login)
    const token = localStorage.getItem('token');

    // Se o token existir, adiciona ao cabeçalho 'Authorization'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Retorna a configuração modificada para a requisição prosseguir
  },
  (error) => {
    // Se houver um erro na configuração da requisição, rejeita a promise
    return Promise.reject(error);
  }
);

// 4. INTERCEPTOR DE RESPOSTA (Response Interceptor) - Opcional, mas recomendado
// Esta função pode tratar erros de resposta globalmente.
api.interceptors.response.use(
  (response) => {
    // Se a resposta for bem-sucedida (status 2xx), apenas a retorna
    return response;
  },
  (error) => {
    // Se a resposta for um erro 401 (Não Autorizado), significa que o token é inválido ou expirou.
    if (error.response && error.response.status === 401) {
      // Remove o token inválido do localStorage
      localStorage.removeItem('token');
      // Redireciona o usuário para a página de login
      // Usamos window.location para forçar um refresh da página e limpar qualquer estado.
      if (typeof window !== 'undefined') {
        window.location.href = '/conta'; // Redireciona para sua página de autenticação
      }
    }
    // Para todos os outros erros, apenas rejeita a promise para que o erro possa ser tratado
    // no local da chamada (no componente que usou o serviço).
    return Promise.reject(error);
  }
);


// 5. OBJETO DE SERVIÇO COM OS MÉTODOS DA API
// Agrupamos os métodos de requisição em um objeto para exportação.
const ApiService = {
  // Método GET
  get: (endpoint, config = {}) => api.get(endpoint, config),

  // Método POST
  post: (endpoint, data, config = {}) => api.post(endpoint, data, config),

  // Método PUT
  put: (endpoint, data, config = {}) => api.put(endpoint, data, config),

  // Método DELETE
  delete: (endpoint, config = {}) => api.delete(endpoint, config),

  // Método POST para upload de arquivos (multipart/form-data)
  // Essencial para as rotas de upload de imagens e arquivos.
  postForm: (endpoint, formData, config = {}) => {
    return api.post(endpoint, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default ApiService;
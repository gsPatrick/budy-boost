'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  FiUser, FiPackage, FiRefreshCw, FiLogOut, FiSettings, 
  FiCalendar, FiBox, FiCreditCard, FiChevronLeft, FiMapPin 
} from 'react-icons/fi';
import ApiService from '../../../services/api.service';
import { useAuth } from '../../../context/AuthContext';
import styles from './profile.module.css';

export default function UserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, loading: authLoading } = useAuth();
  
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState('dashboard');

  // Estados para visualização de detalhes
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  // Estados de Dados
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [userData, setUserData] = useState({ nome: '', email: '', senhaAtual: '', novaSenha: '' });
  
  // Estados de UI
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Efeito para verificar autenticação e definir aba inicial
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/conta');
    }
    
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
      // Limpa seleções ao mudar de aba via URL
      setSelectedOrder(null);
      setSelectedSubscription(null);
    }
  }, [user, authLoading, router, searchParams]);

  // Efeito para carregar dados quando a aba muda
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoadingData(true);
      setError(null);
      // Reseta visualizações de detalhe ao trocar de aba
      if (activeTab !== 'pedidos') setSelectedOrder(null);
      if (activeTab !== 'assinaturas') setSelectedSubscription(null);

      try {
        switch (activeTab) {
          case 'pedidos':
            const resOrders = await ApiService.get('/pedidos/meus-pedidos');
            setOrders(resOrders.data.pedidos || []); 
            break;
            
          case 'assinaturas':
            const resSubs = await ApiService.get('/assinaturas/minhas-assinaturas');
            const subsData = Array.isArray(resSubs.data) ? resSubs.data : (resSubs.data ? [resSubs.data] : []);
            setSubscriptions(subsData);
            break;
            
          case 'dados':
            setUserData(prev => ({ ...prev, nome: user.nome, email: user.email }));
            break;
            
          default:
            // Dashboard: Carrega resumo (ex: últimos 3 pedidos)
            const resDash = await ApiService.get('/pedidos/meus-pedidos?limit=3');
            setOrders(resDash.data.pedidos || []);
            break;
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [activeTab, user]);

  // --- FUNÇÕES DE AÇÃO ---

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setError(null);
    try {
      await ApiService.put('/usuarios/perfil', userData);
      setSuccessMsg("Perfil atualizado com sucesso!");
      setUserData(prev => ({ ...prev, senhaAtual: '', novaSenha: '' }));
    } catch (err) {
      setError(err.response?.data?.erro || "Erro ao atualizar perfil.");
    }
  };

  const handleCancelSubscription = async (subId) => {
    if(!confirm("Tem certeza que deseja cancelar sua assinatura? As cobranças futuras serão interrompidas.")) return;
    try {
        // Ajuste a rota conforme seu backend. Pode ser POST ou PUT dependendo da implementação.
        await ApiService.post('/assinaturas/cancelar', { assinaturaId: subId }); 
        alert("Assinatura cancelada.");
        
        // Atualiza a lista localmente para refletir o cancelamento
        setSubscriptions(prev => prev.map(sub => sub.id === subId ? {...sub, status: 'cancelada'} : sub));
        // Se estiver vendo detalhes, atualiza também
        if(selectedSubscription && selectedSubscription.id === subId) {
            setSelectedSubscription(prev => ({...prev, status: 'cancelada'}));
        }
    } catch (err) {
        alert("Erro ao cancelar assinatura. Tente novamente.");
    }
  };

  const handleViewOrderDetails = (pedido) => {
      setSelectedOrder(pedido);
      window.scrollTo(0,0);
  };

  const handleViewSubscriptionDetails = (sub) => {
      setSelectedSubscription(sub);
      window.scrollTo(0,0);
  };

  // --- RENDERIZAÇÃO: DASHBOARD ---

  const renderDashboard = () => (
    <>
      <h2 className={styles.sectionTitle}>Visão Geral</h2>
      <p>Olá, <strong>{user?.nome}</strong>! (não é você? <span onClick={logout} style={{cursor:'pointer', textDecoration:'underline'}}>Sair</span>)</p>
      <p style={{marginBottom: '2rem', color: '#666'}}>A partir do painel de controle de sua conta, você pode ver suas compras recentes e editar sua senha e detalhes da conta.</p>
      
      <h3>Últimos Pedidos</h3>
      {loadingData ? <div className={styles.loading}>Carregando...</div> : (
        orders.length > 0 ? (
           <div>
             {orders.map(pedido => renderOrderCard(pedido, false))} 
             <button onClick={() => setActiveTab('pedidos')} className={styles.saveButton} style={{marginTop: '1rem'}}>Ver todos os pedidos</button>
           </div>
        ) : (
           <div className={styles.emptyState}>
             <FiBox className={styles.emptyIcon} />
             <p>Você ainda não fez nenhum pedido.</p>
             <button onClick={() => router.push('/loja')} className={styles.saveButton}>Ir para a Loja</button>
           </div>
        )
      )}
    </>
  );

  // --- RENDERIZAÇÃO: PEDIDOS ---

  const renderOrdersSection = () => {
    if (selectedOrder) {
        return renderOrderDetails(selectedOrder);
    }

    return (
        <>
        <h2 className={styles.sectionTitle}>Meus Pedidos</h2>
        {loadingData ? <div className={styles.loading}>Carregando...</div> : (
            orders.length > 0 ? (
            orders.map(pedido => renderOrderCard(pedido, true))
            ) : (
            <div className={styles.emptyState}>
                <FiPackage className={styles.emptyIcon} />
                <p>Nenhum pedido encontrado.</p>
            </div>
            )
        )}
        </>
    );
  };

  const renderOrderCard = (pedido, showDetailsButton) => (
    <div key={pedido.id} className={styles.orderCard}>
        <div className={styles.orderHeader}>
            <div>
                <span className={styles.orderId}>Pedido #{pedido.id}</span>
                <div className={styles.orderDate}>{new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</div>
            </div>
            <span className={`${styles.statusBadge} ${styles[`status_${pedido.status}`]}`}>
                {pedido.status}
            </span>
        </div>
        <div className={styles.orderItems}>
            {pedido.itens.slice(0, 2).map((item, idx) => (
                <div key={idx} className={styles.itemRow}>
                    <Image 
                        src={item.produto?.imagemUrl || '/placeholder-produto.png'} 
                        width={50} height={50} 
                        alt={item.nome} 
                        className={styles.itemImage}
                    />
                    <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{item.nome}</span>
                        <span className={styles.itemMeta}>{item.quantidade}x</span>
                    </div>
                </div>
            ))}
            {pedido.itens.length > 2 && <span style={{color: '#666', fontSize: '0.8rem'}}>+ {pedido.itens.length - 2} itens...</span>}
        </div>
        <div className={styles.orderFooter}>
             <span className={styles.orderTotal}>Total: R$ {parseFloat(pedido.total).toFixed(2).replace('.',',')}</span>
             {showDetailsButton && (
                 <button onClick={() => handleViewOrderDetails(pedido)} className={styles.btnDetails}>
                     Ver Detalhes
                 </button>
             )}
        </div>
    </div>
  );

  const renderOrderDetails = (pedido) => (
      <div>
          <div className={styles.detailsHeader}>
              <button onClick={() => setSelectedOrder(null)} className={styles.backButton}>
                  <FiChevronLeft /> Voltar para Pedidos
              </button>
          </div>

          <div className={styles.orderHeader}>
            <div>
                <h2 style={{marginBottom: '0.5rem'}}>Detalhes do Pedido #{pedido.id}</h2>
                <div className={styles.orderDate}>Realizado em {new Date(pedido.createdAt).toLocaleDateString('pt-BR')} às {new Date(pedido.createdAt).toLocaleTimeString('pt-BR')}</div>
            </div>
            <span className={`${styles.statusBadge} ${styles[`status_${pedido.status}`]}`} style={{fontSize: '1rem', padding: '0.5rem 1rem'}}>
                {pedido.status}
            </span>
        </div>

        <div className={styles.detailsGrid}>
            <div className={styles.detailsBox}>
                <h4>Endereço de Entrega</h4>
                {pedido.enderecoEntrega ? (
                    <>
                        <p><strong>{pedido.enderecoEntrega.nome || user.nome}</strong></p>
                        <p>{pedido.enderecoEntrega.rua}, {pedido.enderecoEntrega.numero}</p>
                        {pedido.enderecoEntrega.complemento && <p>{pedido.enderecoEntrega.complemento}</p>}
                        <p>{pedido.enderecoEntrega.bairro}</p>
                        <p>{pedido.enderecoEntrega.cidade} - {pedido.enderecoEntrega.estado}</p>
                        <p>{pedido.enderecoEntrega.cep}</p>
                    </>
                ) : (
                    <p>Endereço não disponível ou produto digital.</p>
                )}
            </div>
            <div className={styles.detailsBox}>
                <h4>Resumo Financeiro</h4>
                <div className={styles.financialSummary}>
                    <div className={styles.financialRow}>
                        <span>Frete</span>
                        <span>R$ {parseFloat(pedido.valorFrete || 0).toFixed(2).replace('.',',')}</span>
                    </div>
                    <div className={styles.financialRow}>
                        <span>Desconto</span>
                        <span>- R$ {parseFloat(pedido.desconto || 0).toFixed(2).replace('.',',')}</span>
                    </div>
                    <div className={styles.financialTotal}>
                        <span>Total</span>
                        <span>R$ {parseFloat(pedido.total).toFixed(2).replace('.',',')}</span>
                    </div>
                </div>
            </div>
        </div>

        <h3>Itens do Pedido</h3>
        <div className={styles.orderCard}>
            <div className={styles.orderItems}>
                {pedido.itens.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                        <Image 
                            src={item.produto?.imagemUrl || '/placeholder-produto.png'} 
                            width={80} height={80} 
                            alt={item.nome} 
                            className={styles.itemImage}
                        />
                        <div className={styles.itemInfo}>
                            <span className={styles.itemName} style={{fontSize: '1.1rem'}}>{item.nome}</span>
                            <span className={styles.itemMeta} style={{fontSize: '0.9rem'}}>
                                {item.quantidade} unidade(s) x R$ {parseFloat(item.preco).toFixed(2).replace('.',',')}
                            </span>
                        </div>
                        <div style={{fontWeight: 'bold', color: '#1A234B'}}>
                            R$ {(item.quantidade * item.preco).toFixed(2).replace('.',',')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
  );

  // --- RENDERIZAÇÃO: ASSINATURAS ---

  const renderSubscriptionsSection = () => {
      if (selectedSubscription) {
          return renderSubscriptionDetails(selectedSubscription);
      }

      return (
        <>
        <h2 className={styles.sectionTitle}>Minhas Assinaturas</h2>
        {loadingData ? <div className={styles.loading}>Carregando...</div> : (
            subscriptions.length > 0 ? (
                subscriptions.map(sub => (
                    <div key={sub.id} className={styles.subscriptionCard}>
                        <div className={styles.subInfo}>
                            <h3>{sub.plano?.nome || 'Assinatura de Produto'}</h3>
                            <div className={styles.subDetail}>
                                <FiCalendar /> Próxima cobrança: {new Date(sub.dataProximoCobranca).toLocaleDateString('pt-BR')}
                            </div>
                            <div className={styles.subDetail}>
                                <FiCreditCard /> Status: <span className={`${styles.statusBadge} ${styles[`status_${sub.status}`]}`}>{sub.status}</span>
                            </div>
                        </div>
                        <button onClick={() => handleViewSubscriptionDetails(sub)} className={styles.btnDetails}>
                            Gerenciar Assinatura
                        </button>
                    </div>
                ))
            ) : (
            <div className={styles.emptyState}>
                <FiRefreshCw className={styles.emptyIcon} />
                <p>Você não possui assinaturas ativas.</p>
                <button onClick={() => router.push('/loja')} className={styles.saveButton}>Explorar Produtos</button>
            </div>
            )
        )}
        </>
      );
  };

  const renderSubscriptionDetails = (sub) => (
      <div>
          <div className={styles.detailsHeader}>
              <button onClick={() => setSelectedSubscription(null)} className={styles.backButton}>
                  <FiChevronLeft /> Voltar para Assinaturas
              </button>
          </div>

          <h2 style={{marginBottom: '1.5rem'}}>Detalhes da Assinatura</h2>
          
          <div className={styles.orderCard} style={{backgroundColor: '#f0f9ff', borderColor: '#bae6fd'}}>
              <div className={styles.subInfo}>
                    <h3 style={{fontSize: '1.3rem', color: '#1A234B'}}>{sub.plano?.nome || 'Assinatura Recorrente'}</h3>
                    <p style={{marginTop: '0.5rem', color: '#555'}}>ID: {sub.id}</p>
                    <div style={{marginTop: '1rem', display: 'flex', gap: '1rem'}}>
                        <span className={`${styles.statusBadge} ${styles[`status_${sub.status}`]}`} style={{fontSize: '1rem'}}>
                            {sub.status}
                        </span>
                    </div>
              </div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailsBox}>
                <h4>Informações de Cobrança</h4>
                <p><strong>Próxima Cobrança:</strong> {new Date(sub.dataProximoCobranca).toLocaleDateString('pt-BR')}</p>
                <p><strong>Frequência:</strong> A cada cobrança automática (Mensal/Trimestral)</p>
                <p><strong>Método:</strong> Cartão de Crédito (via Mercado Pago)</p>
            </div>
            <div className={styles.detailsBox}>
                <h4>Endereço de Entrega Vinculado</h4>
                {sub.enderecoEntrega ? (
                    <>
                        <p><strong>{sub.enderecoEntrega.nome || user.nome}</strong></p>
                        <p>{sub.enderecoEntrega.rua}, {sub.enderecoEntrega.numero}</p>
                        <p>{sub.enderecoEntrega.bairro}</p>
                        <p>{sub.enderecoEntrega.cidade} - {sub.enderecoEntrega.estado}</p>
                        <p>{sub.enderecoEntrega.cep}</p>
                    </>
                ) : (
                    <p>Endereço salvo na plataforma de pagamento.</p>
                )}
            </div>
        </div>

        {sub.status === 'ativa' && (
             <div style={{marginTop: '2rem', padding: '1.5rem', border: '1px solid #fee2e2', borderRadius: '10px', backgroundColor: '#fff5f5'}}>
                 <h4 style={{color: '#991b1b', marginBottom: '0.5rem'}}>Zona de Perigo</h4>
                 <p style={{marginBottom: '1rem', color: '#7f1d1d'}}>Se você cancelar, não receberá mais cobranças automáticas e seus envios serão interrompidos.</p>
                 <button onClick={() => handleCancelSubscription(sub.id)} className={styles.cancelButton}>
                     Cancelar Assinatura Definitivamente
                 </button>
             </div>
        )}
      </div>
  );

  // --- RENDERIZAÇÃO: DADOS DA CONTA ---

  const renderAccountDetails = () => (
    <>
      <h2 className={styles.sectionTitle}>Detalhes da Conta</h2>
      {successMsg && <div style={{color: 'green', marginBottom: '1rem', padding: '10px', backgroundColor: '#dcfce7', borderRadius: '5px'}}>{successMsg}</div>}
      {error && <div style={{color: 'red', marginBottom: '1rem', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '5px'}}>{error}</div>}
      
      <form onSubmit={handleUpdateProfile} style={{maxWidth: '600px'}}>
          <div className={styles.formGroup}>
              <label>Nome Completo</label>
              <input 
                  type="text" 
                  className={styles.input} 
                  value={userData.nome}
                  onChange={e => setUserData({...userData, nome: e.target.value})}
              />
          </div>
          <div className={styles.formGroup}>
              <label>Email</label>
              <input 
                  type="email" 
                  className={styles.input} 
                  value={userData.email}
                  onChange={e => setUserData({...userData, email: e.target.value})}
              />
          </div>
          
          <div style={{marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem'}}>
            <h3 style={{fontSize: '1.2rem', color: '#1A234B', marginBottom: '1.5rem'}}>Segurança</h3>
            <div className={styles.formGroup}>
                <label>Senha Atual (necessária para alterar)</label>
                <input 
                    type="password" 
                    className={styles.input} 
                    value={userData.senhaAtual}
                    placeholder="********"
                    onChange={e => setUserData({...userData, senhaAtual: e.target.value})}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Nova Senha</label>
                <input 
                    type="password" 
                    className={styles.input} 
                    value={userData.novaSenha}
                    placeholder="********"
                    onChange={e => setUserData({...userData, novaSenha: e.target.value})}
                />
            </div>
          </div>

          <button type="submit" className={styles.saveButton}>Salvar Alterações</button>
      </form>
    </>
  );

  if (authLoading) return <div className={styles.loading}>Carregando...</div>;
  if (!user) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Minha Conta</h1>
      
      <div className={styles.dashboardGrid}>
        {/* --- SIDEBAR --- */}
        <aside className={styles.sidebar}>
           <div className={styles.userInfo}>
               <div className={styles.userAvatar}>
                   {user.nome.charAt(0).toUpperCase()}
               </div>
               <div className={styles.userName}>{user.nome}</div>
               <div className={styles.userEmail}>{user.email}</div>
           </div>
           
           <nav className={styles.navMenu}>
               <button 
                   onClick={() => setActiveTab('dashboard')} 
                   className={`${styles.navButton} ${activeTab === 'dashboard' ? styles.activeNav : ''}`}
               >
                   <FiUser /> Visão Geral
               </button>
               <button 
                   onClick={() => setActiveTab('pedidos')} 
                   className={`${styles.navButton} ${activeTab === 'pedidos' ? styles.activeNav : ''}`}
               >
                   <FiPackage /> Meus Pedidos
               </button>
               <button 
                   onClick={() => setActiveTab('assinaturas')} 
                   className={`${styles.navButton} ${activeTab === 'assinaturas' ? styles.activeNav : ''}`}
               >
                   <FiRefreshCw /> Assinaturas
               </button>
               {/* Aba de Endereços removida conforme solicitado */}
               <button 
                   onClick={() => setActiveTab('dados')} 
                   className={`${styles.navButton} ${activeTab === 'dados' ? styles.activeNav : ''}`}
               >
                   <FiSettings /> Detalhes da Conta
               </button>

               <button onClick={logout} className={`${styles.navButton} ${styles.logoutButton}`}>
                   <FiLogOut /> Sair
               </button>
           </nav>
        </aside>

        {/* --- CONTEÚDO --- */}
        <main className={styles.contentArea}>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'pedidos' && renderOrdersSection()}
            {activeTab === 'assinaturas' && renderSubscriptionsSection()}
            {activeTab === 'dados' && renderAccountDetails()}
        </main>
      </div>
    </div>
  );
}
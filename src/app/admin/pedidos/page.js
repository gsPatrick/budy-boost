'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiEye, FiTrash2, FiSearch, FiRefreshCw, FiPackage, FiX } from 'react-icons/fi';
import ApiService from '../../../services/api.service';
import { useAuth } from '../../../context/AuthContext';
import styles from './adminOrders.module.css';

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  
  // Estados Principais
  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' ou 'assinaturas'
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null); // 'order' ou 'subscription'

  // Carrega os dados ao mudar a aba
  useEffect(() => {
    if (authLoading) return;
    
    if (user && user.tipo !== 'admin') {
        alert("Acesso negado.");
        window.location.href = '/';
        return;
    }

    fetchData();
  }, [activeTab, authLoading, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'pedidos') {
        response = await ApiService.get('/pedidos/admin');
        setDataList(response.data.pedidos || response.data || []);
      } else {
        response = await ApiService.get('/assinaturas/admin');
        setDataList(response.data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers de Ação
  const handleStatusChange = async (pedidoId, newStatus) => {
    try {
      await ApiService.put(`/pedidos/${pedidoId}/status`, { status: newStatus });
      setDataList(prev => prev.map(item => 
        item.id === pedidoId ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      alert("Erro ao atualizar status.");
    }
  };

  const handleCancelSubscription = async (subId) => {
    if (!confirm("Tem certeza que deseja cancelar esta assinatura?")) return;
    try {
      await ApiService.post('/assinaturas/cancelar', { assinaturaId: subId });
      fetchData(); 
    } catch (error) {
      alert("Erro ao cancelar assinatura.");
    }
  };

  const handleOpenModal = (item, type) => {
    setModalData(item);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    setModalType(null);
  };

  // Filtragem
  const filteredData = dataList.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const userName = item.usuario?.nome?.toLowerCase() || item.Usuario?.nome?.toLowerCase() || '';
    const userEmail = item.usuario?.email?.toLowerCase() || item.Usuario?.email?.toLowerCase() || '';
    const id = String(item.id);
    return userName.includes(searchLower) || userEmail.includes(searchLower) || id.includes(searchLower);
  });

  // --- COMPONENTES INTERNOS DE RENDERIZAÇÃO DO MODAL ---

  const OrderDetailsModal = ({ pedido }) => (
    <div className={styles.modalBody}>
        <div className={styles.detailSection}>
            <div className={styles.detailTitle}>Informações Gerais</div>
            <div className={styles.detailGrid}>
                <div className={styles.infoGroup}>
                    <label>ID do Pedido</label>
                    <p>#{pedido.id}</p>
                </div>
                <div className={styles.infoGroup}>
                    <label>Data</label>
                    <p>{new Date(pedido.createdAt).toLocaleDateString('pt-BR')} às {new Date(pedido.createdAt).toLocaleTimeString('pt-BR')}</p>
                </div>
                <div className={styles.infoGroup}>
                    <label>Status</label>
                    <span className={`${styles.statusBadge} ${styles[pedido.status]}`}>{pedido.status}</span>
                </div>
                <div className={styles.infoGroup}>
                    <label>Total</label>
                    <p style={{fontWeight: 'bold', color: '#1A234B'}}>R$ {parseFloat(pedido.total).toFixed(2).replace('.', ',')}</p>
                </div>
            </div>
        </div>

        <div className={styles.detailSection}>
            <div className={styles.detailTitle}>Cliente</div>
            <div className={styles.detailGrid}>
                <div className={styles.infoGroup}>
                    <label>Nome</label>
                    <p>{pedido.usuario?.nome || pedido.Usuario?.nome || 'N/A'}</p>
                </div>
                <div className={styles.infoGroup}>
                    <label>Email</label>
                    <p>{pedido.usuario?.email || pedido.Usuario?.email || 'N/A'}</p>
                </div>
            </div>
        </div>

        <div className={styles.detailSection}>
            <div className={styles.detailTitle}>Endereço de Entrega</div>
            {pedido.enderecoEntrega ? (
                <div className={styles.detailGrid}>
                     <div className={styles.infoGroup} style={{gridColumn: 'span 2'}}>
                        <p>{pedido.enderecoEntrega.rua}, {pedido.enderecoEntrega.numero} {pedido.enderecoEntrega.complemento}</p>
                        <p>{pedido.enderecoEntrega.bairro}</p>
                        <p>{pedido.enderecoEntrega.cidade} - {pedido.enderecoEntrega.estado}</p>
                        <p>CEP: {pedido.enderecoEntrega.cep}</p>
                     </div>
                </div>
            ) : (
                <p style={{color: '#666', fontStyle: 'italic'}}>Endereço não aplicável (Produto Digital ou não registrado)</p>
            )}
        </div>

        <div className={styles.detailSection}>
            <div className={styles.detailTitle}>Itens do Pedido</div>
            <div className={styles.productList}>
                {pedido.itens && pedido.itens.map((item, idx) => (
                    <div key={idx} className={styles.productItem}>
                         <Image 
                            src={item.produto?.imagemUrl || '/placeholder-produto.png'} 
                            alt={item.nome} 
                            width={50} height={50} 
                            className={styles.productImage}
                         />
                         <div className={styles.productDetails}>
                             <span className={styles.productName}>{item.nome}</span>
                             <span className={styles.productMeta}>Qtd: {item.quantidade} | Unit: R$ {parseFloat(item.preco).toFixed(2).replace('.', ',')}</span>
                         </div>
                         <div className={styles.productTotal}>
                             R$ {(item.quantidade * parseFloat(item.preco)).toFixed(2).replace('.', ',')}
                         </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Resumo Financeiro */}
        <div className={styles.detailSection} style={{textAlign: 'right'}}>
             <p>Subtotal: <strong>R$ {pedido.itens.reduce((acc, i) => acc + (i.preco * i.quantidade), 0).toFixed(2).replace('.', ',')}</strong></p>
             <p>Frete: <strong>R$ {parseFloat(pedido.valorFrete || 0).toFixed(2).replace('.', ',')}</strong></p>
             <p>Desconto: <strong>- R$ {parseFloat(pedido.desconto || 0).toFixed(2).replace('.', ',')}</strong></p>
             <p style={{fontSize: '1.2rem', marginTop: '0.5rem', color: '#1A234B'}}>Total Final: <strong>R$ {parseFloat(pedido.total).toFixed(2).replace('.', ',')}</strong></p>
        </div>
    </div>
  );

  const SubscriptionDetailsModal = ({ sub }) => (
    <div className={styles.modalBody}>
         <div className={styles.detailSection}>
            <div className={styles.detailTitle}>Status da Assinatura</div>
            <div className={styles.detailGrid}>
                <div className={styles.infoGroup}>
                    <label>ID Interno</label>
                    <p>{sub.id}</p>
                </div>
                <div className={styles.infoGroup}>
                    <label>ID Mercado Pago</label>
                    <p style={{fontSize: '0.8rem', fontFamily: 'monospace'}}>{sub.mercadoPagoSubscriptionId}</p>
                </div>
                <div className={styles.infoGroup}>
                    <label>Status</label>
                    <span className={`${styles.statusBadge} ${styles[sub.status]}`}>{sub.status}</span>
                </div>
                <div className={styles.infoGroup}>
                    <label>Próxima Cobrança</label>
                    <p>{new Date(sub.dataProximoCobranca).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
        </div>

        <div className={styles.detailSection}>
            <div className={styles.detailTitle}>Cliente</div>
            <div className={styles.detailGrid}>
                <div className={styles.infoGroup}>
                    <label>Nome</label>
                    <p>{sub.usuario?.nome || sub.Usuario?.nome || 'N/A'}</p>
                </div>
                <div className={styles.infoGroup}>
                    <label>Email</label>
                    <p>{sub.usuario?.email || sub.Usuario?.email || 'N/A'}</p>
                </div>
            </div>
        </div>

        <div className={styles.detailSection}>
            <div className={styles.detailTitle}>Produto / Plano</div>
            <div className={styles.infoGroup}>
                <p style={{fontSize: '1.1rem', fontWeight: 'bold'}}>{sub.plano?.nome || 'Assinatura de Produto'}</p>
                {/* Se tiver detalhes do produto na assinatura, exiba aqui */}
            </div>
        </div>

        <div className={styles.detailSection}>
            <div className={styles.detailTitle}>Endereço de Envio Recorrente</div>
            {sub.enderecoEntrega ? (
                <div className={styles.detailGrid}>
                     <div className={styles.infoGroup} style={{gridColumn: 'span 2'}}>
                        <p>{sub.enderecoEntrega.rua}, {sub.enderecoEntrega.numero} {sub.enderecoEntrega.complemento}</p>
                        <p>{sub.enderecoEntrega.bairro}</p>
                        <p>{sub.enderecoEntrega.cidade} - {sub.enderecoEntrega.estado}</p>
                        <p>CEP: {sub.enderecoEntrega.cep}</p>
                     </div>
                </div>
            ) : (
                <p style={{color: '#666'}}>Endereço gerenciado pelo Gateway ou não disponível.</p>
            )}
        </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestão de Vendas</h1>
        <div style={{position: 'relative'}}>
            <FiSearch style={{position: 'absolute', left: 10, top: 10, color: '#aaa'}} />
            <input 
                type="text" 
                placeholder="Buscar por nome, email ou ID..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid #ddd', width: '300px'}}
            />
        </div>
      </div>

      {/* --- ABAS --- */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'pedidos' ? styles.activeTab : ''}`}
          onClick={() => { setActiveTab('pedidos'); setDataList([]); setSearchTerm(''); }}
        >
          <FiPackage style={{marginRight: 8}} /> Pedidos Realizados
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'assinaturas' ? styles.activeTab : ''}`}
          onClick={() => { setActiveTab('assinaturas'); setDataList([]); setSearchTerm(''); }}
        >
          <FiRefreshCw style={{marginRight: 8}} /> Gerenciar Assinaturas
        </button>
      </div>

      {/* --- TABELA DE PEDIDOS --- */}
      {activeTab === 'pedidos' && (
        <div className={styles.tableCard}>
           {loading ? (
             <div className={styles.loading}>Carregando pedidos...</div>
           ) : (
             <div className={styles.tableWrapper}>
               <table className={styles.table}>
                 <thead>
                   <tr>
                     <th>ID</th>
                     <th>Cliente</th>
                     <th>Data</th>
                     <th>Total</th>
                     <th>Pagamento</th>
                     <th>Status / Ação</th>
                     <th>Ações</th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredData.map(pedido => (
                     <tr key={pedido.id}>
                       <td>#{pedido.id}</td>
                       <td>
                         <div className={styles.userInfo}>
                           <span className={styles.userName}>{pedido.usuario?.nome || pedido.Usuario?.nome || 'N/A'}</span>
                           <span className={styles.userEmail}>{pedido.usuario?.email || pedido.Usuario?.email}</span>
                         </div>
                       </td>
                       <td>{new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</td>
                       <td>R$ {parseFloat(pedido.total).toFixed(2).replace('.',',')}</td>
                       <td>
                         <span style={{fontSize: '0.8rem', color: '#666'}}>
                           {pedido.pagamentos?.[0]?.metodo || 'N/A'}
                         </span>
                       </td>
                       <td>
                         <select 
                           value={pedido.status} 
                           onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                           className={`${styles.selectStatus} ${styles[pedido.status]}`}
                         >
                           <option value="pendente">Pendente</option>
                           <option value="pago">Pago</option>
                           <option value="processando">Processando</option>
                           <option value="enviado">Enviado</option>
                           <option value="entregue">Entregue</option>
                           <option value="cancelado">Cancelado</option>
                         </select>
                       </td>
                       <td>
                         <div className={styles.actions}>
                           <button 
                                className={styles.btnAction} 
                                title="Ver Detalhes"
                                onClick={() => handleOpenModal(pedido, 'order')}
                            >
                             <FiEye />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                   {filteredData.length === 0 && (
                     <tr>
                       <td colSpan="7" className={styles.emptyState}>Nenhum pedido encontrado.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      )}

      {/* --- TABELA DE ASSINATURAS --- */}
      {activeTab === 'assinaturas' && (
        <div className={styles.tableCard}>
           {loading ? (
             <div className={styles.loading}>Carregando assinaturas...</div>
           ) : (
             <div className={styles.tableWrapper}>
               <table className={styles.table}>
                 <thead>
                   <tr>
                     <th>ID</th>
                     <th>Cliente</th>
                     <th>Plano / Produto</th>
                     <th>Próx. Cobrança</th>
                     <th>Status</th>
                     <th>Ações</th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredData.map(sub => (
                     <tr key={sub.id}>
                       <td title={String(sub.id)}>{String(sub.id).substring(0, 8)}...</td>
                       <td>
                         <div className={styles.userInfo}>
                           <span className={styles.userName}>{sub.usuario?.nome || sub.Usuario?.nome}</span>
                           <span className={styles.userEmail}>{sub.usuario?.email || sub.Usuario?.email}</span>
                         </div>
                       </td>
                       <td>
                         {sub.plano?.nome || 'Assinatura Produto'}
                       </td>
                       <td>
                         {new Date(sub.dataProximoCobranca).toLocaleDateString('pt-BR')}
                       </td>
                       <td>
                         <span className={`${styles.statusBadge} ${styles[sub.status]}`}>
                           {sub.status}
                         </span>
                       </td>
                       <td>
                         <div className={styles.actions}>
                           {sub.status === 'ativa' && (
                             <button 
                               className={styles.btnAction} 
                               onClick={() => handleCancelSubscription(sub.id)}
                               title="Cancelar Assinatura"
                               style={{color: '#dc2626', borderColor: '#dc2626'}}
                             >
                               <FiTrash2 />
                             </button>
                           )}
                           <button 
                                className={styles.btnAction} 
                                title="Ver Detalhes"
                                onClick={() => handleOpenModal(sub, 'subscription')}
                           >
                               <FiEye />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                   {filteredData.length === 0 && (
                     <tr>
                       <td colSpan="6" className={styles.emptyState}>Nenhuma assinatura encontrada.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && modalData && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
              <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                      <h2 className={styles.modalTitle}>
                          {modalType === 'order' ? `Detalhes do Pedido #${modalData.id}` : 'Detalhes da Assinatura'}
                      </h2>
                      <button className={styles.closeButton} onClick={handleCloseModal}>
                          <FiX />
                      </button>
                  </div>
                  
                  {modalType === 'order' && <OrderDetailsModal pedido={modalData} />}
                  {modalType === 'subscription' && <SubscriptionDetailsModal sub={modalData} />}

                  <div className={styles.modalFooter}>
                      <button className={styles.btnClose} onClick={handleCloseModal}>Fechar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
'use client';
import { useState } from 'react';
import { FiChevronDown, FiMoreVertical } from 'react-icons/fi';
import styles from './OrderManager.module.css';

// --- DADOS PLACEHOLDER (SUBSTITUIR PELA API) ---
const ordersData = [
  { id: '#BB1025', date: '22/10/2025', customer: 'João Silva', total: 106.00, status: 'Pendente' },
  { id: '#BB1024', date: '21/10/2025', customer: 'Maria Oliveira', total: 68.00, status: 'Enviado' },
  { id: '#BB1023', date: '20/10/2025', customer: 'Carlos Pereira', total: 38.00, status: 'Entregue' },
  { id: '#BB1022', date: '19/10/2025', customer: 'Ana Costa', total: 136.00, status: 'Cancelado' },
];

const OrderManager = () => {
  // Estado para controlar qual menu de ações está aberto
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleStatusChange = (orderId, newStatus) => {
    // AQUI VOCÊ FARIA UMA CHAMADA À API PARA ATUALIZAR O STATUS
    console.log(`Pedido ${orderId} atualizado para ${newStatus}`);
    setOpenMenuId(null); // Fecha o menu
  };

  return (
    <div className={styles.managerContainer}>
      <h1 className={styles.title}>Gerenciamento de Pedidos</h1>
      
      <div className={styles.tableWrapper}>
        <table className={styles.orderTable}>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ordersData.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td>{order.date}</td>
                <td>{order.customer}</td>
                <td>R$ {order.total.toFixed(2).replace('.', ',')}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                    {order.status}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <button onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)} className={styles.actionButton}>
                    <FiMoreVertical />
                  </button>
                  {openMenuId === order.id && (
                    <div className={styles.actionMenu}>
                      <button onClick={() => handleStatusChange(order.id, 'Enviado')}>Marcar como Enviado</button>
                      <button onClick={() => handleStatusChange(order.id, 'Entregue')}>Marcar como Entregue</button>
                      <button onClick={() => handleStatusChange(order.id, 'Cancelado')} className={styles.cancelOption}>Cancelar Pedido</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManager;
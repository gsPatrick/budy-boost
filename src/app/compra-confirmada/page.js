// src/app/compra-confirmada/page.js

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ApiService from '../../services/api.service';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import styles from './confirmation.module.css';

// Componente para exibir o status do pagamento
const StatusDisplay = ({ status }) => {
  if (status === 'pago' || status === 'approved') {
    return (
      <div className={`${styles.statusBox} ${styles.success}`}>
        <FiCheckCircle size={40} />
        <div>
          <h2>Pagamento Aprovado!</h2>
          <p>Seu pedido foi recebido e já estamos preparando tudo. Você receberá um e-mail de confirmação em breve.</p>
        </div>
      </div>
    );
  }

  if (status === 'pendente' || status === 'in_process') {
    return (
      <div className={`${styles.statusBox} ${styles.pending}`}>
        <FiClock size={40} />
        <div>
          <h2>Pagamento Pendente</h2>
          <p>Estamos aguardando a confirmação do seu pagamento. Assim que for aprovado, seu pedido será processado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.statusBox} ${styles.failure}`}>
      <FiXCircle size={40} />
      <div>
        <h2>Pagamento Recusado</h2>
        <p>Não foi possível processar seu pagamento. Por favor, verifique os dados ou tente com outro método de pagamento.</p>
      </div>
    </div>
  );
};

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get('pedido');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pedidoId) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          // A rota /pedidos/:id já existe no seu backend
          const response = await ApiService.get(`/pedidos/${pedidoId}`);
          setOrder(response.data);
        } catch (err) {
          setError("Não foi possível carregar os detalhes do seu pedido.");
          console.error("Erro ao buscar pedido:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    } else {
      setError("ID do pedido não encontrado.");
      setLoading(false);
    }
  }, [pedidoId]);

  if (loading) {
    return <div className={styles.container}><p>Carregando confirmação...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.errorText}>{error}</p></div>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {order && <StatusDisplay status={order.status} />}
        
        {order && (
          <div className={styles.orderDetails}>
            <h3>Detalhes do Pedido #{order.id}</h3>
            <div className={styles.summaryLine}>
              <span>Total</span>
              <span>R$ {Number(order.total).toFixed(2).replace('.', ',')}</span>
            </div>
            <div className={styles.summaryLine}>
              <span>Data</span>
              <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <Link href="/loja" className={styles.linkButton}>Continuar Comprando</Link>
          <Link href="/conta/pedidos" className={styles.primaryButton}>Ver Meus Pedidos</Link>
        </div>
      </div>
    </main>
  );
}
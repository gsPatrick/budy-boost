'use client';

import { useState, useEffect } from 'react';
import { 
  FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiBarChart2, FiInbox 
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import ApiService from '../../services/api.service';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    vendasHoje: 0,
    faturamentoHoje: 0,
    clientesTotal: 0,
    produtosTotal: 0,
    estoqueBaixo: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Métricas Gerais
        const metricsRes = await ApiService.get('/dashboard/metricas');
        setMetrics(metricsRes.data);

        // 2. Gráfico de Vendas (Últimos 30 dias)
        const salesRes = await ApiService.get('/dashboard/vendas-periodo?periodo=dia');
        let apiData = salesRes.data || [];

        // --- LÓGICA DE PREENCHIMENTO DE GRÁFICO VAZIO ---
        // Se a API não retornou nada (loja nova), geramos os últimos 7 dias com 0 vendas
        if (apiData.length === 0) {
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                apiData.push({
                    periodo: d.toISOString().split('T')[0],
                    total: 0
                });
            }
        }
        
        // Formatação para o Recharts
        const formattedSales = apiData.map(item => ({
            name: new Date(item.periodo).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            vendas: parseFloat(item.total)
        }));
        setSalesData(formattedSales);

        // 3. Produtos Mais Vendidos
        const productsRes = await ApiService.get('/dashboard/produtos-mais-vendidos?limit=5');
        setTopProducts(productsRes.data);

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Função para renderizar a tabela de produtos ou estado vazio bonito
  const renderTopProducts = () => {
      if (topProducts.length === 0) {
          return (
              <div className={styles.emptyChartState}>
                  <FiInbox size={48} />
                  <p>Ainda não há produtos vendidos.</p>
                  <small>Os dados aparecerão aqui assim que as vendas começarem.</small>
              </div>
          );
      }

      return (
        <table className={styles.miniTable}>
            <thead>
                <tr>
                    <th>Produto</th>
                    <th style={{textAlign: 'right'}}>Qtd.</th>
                    <th style={{textAlign: 'right'}}>Total</th>
                </tr>
            </thead>
            <tbody>
                {topProducts.map((prod, idx) => (
                    <tr key={idx}>
                        <td className={styles.prodName}>
                            <span className={`${styles.rank} ${idx === 0 ? styles.rank1 : idx === 1 ? styles.rank2 : idx === 2 ? styles.rank3 : ''}`}>
                                {idx + 1}
                            </span>
                            {prod.nome}
                        </td>
                        <td style={{textAlign: 'right'}}>{prod.quantidade}</td>
                        <td style={{textAlign: 'right', fontWeight: '600', color: '#1A234B'}}>
                            R$ {parseFloat(prod.faturamento).toFixed(2).replace('.', ',')}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      );
  };

  if (loading) {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Analisando dados...</p>
        </div>
    );
  }

  return (
    <div className={styles.dashboardWrapper}>
      
      {/* --- KPI CARDS --- */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
            <div className={`${styles.iconWrapper} ${styles.blue}`}>
                <FiDollarSign />
            </div>
            <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Faturamento Hoje</span>
                <h3 className={styles.kpiValue}>R$ {metrics.faturamentoHoje.toFixed(2).replace('.', ',')}</h3>
            </div>
        </div>

        <div className={styles.kpiCard}>
            <div className={`${styles.iconWrapper} ${styles.green}`}>
                <FiShoppingCart />
            </div>
            <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Vendas Hoje</span>
                <h3 className={styles.kpiValue}>{metrics.vendasHoje}</h3>
            </div>
        </div>

        <div className={styles.kpiCard}>
            <div className={`${styles.iconWrapper} ${styles.purple}`}>
                <FiUsers />
            </div>
            <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Base de Clientes</span>
                <h3 className={styles.kpiValue}>{metrics.clientesTotal}</h3>
            </div>
        </div>

        <div className={styles.kpiCard}>
            <div className={`${styles.iconWrapper} ${styles.orange}`}>
                <FiPackage />
            </div>
            <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Produtos Ativos</span>
                <h3 className={styles.kpiValue}>{metrics.produtosTotal}</h3>
            </div>
        </div>
      </div>

      {/* --- SEÇÃO DE GRÁFICOS --- */}
      <div className={styles.chartsSection}>
          
          {/* GRÁFICO DE ÁREA */}
          <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                  <h3 className={styles.chartTitle}>Visão de Faturamento</h3>
                  <span style={{fontSize: '0.85rem', color: '#666', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '20px'}}>
                    Últimos 30 dias
                  </span>
              </div>
              
              <div style={{ width: '100%', height: 320, flex: 1 }}>
                <ResponsiveContainer>
                    <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1A234B" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#1A234B" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#9ca3af', fontSize: 12}} 
                            dy={10}
                            minTickGap={30}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#9ca3af', fontSize: 12}} 
                            tickFormatter={(value) => `R$${value}`} 
                        />
                        <Tooltip 
                            contentStyle={{
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                padding: '12px'
                            }}
                            formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                            labelStyle={{color: '#6b7280', marginBottom: '5px'}}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="vendas" 
                            stroke="#1A234B" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorVendas)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* TABELA TOP PRODUTOS */}
          <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                  <h3 className={styles.chartTitle}>Campeões de Venda</h3>
                  <FiBarChart2 color="#9ca3af" />
              </div>
              <div className={styles.topProductsList}>
                  {renderTopProducts()}
              </div>
          </div>
      </div>
    </div>
  );
}
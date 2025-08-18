import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUsers, FaCut, FaDollarSign, FaClock, FaChartBar, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--background);
  padding: 20px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 10px;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const MetricCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  .metric-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    
    .icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .trend {
      font-size: 14px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
      
      &.positive {
        background: rgba(40, 167, 69, 0.1);
        color: var(--success);
      }
      
      &.negative {
        background: rgba(220, 53, 69, 0.1);
        color: var(--error);
      }
    }
  }
  
  .metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 8px;
  }
  
  .metric-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const QuickActionCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    
    .icon {
      color: var(--secondary);
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    
    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      
      &.btn-primary {
        background: var(--primary);
        color: var(--accent);
        
        &:hover {
          background: #000000;
          transform: translateY(-1px);
        }
      }
      
      &.btn-secondary {
        background: var(--secondary);
        color: var(--primary);
        
        &:hover {
          background: #c19b2e;
          transform: translateY(-1px);
        }
      }
    }
  }
`;

const RecentActivityCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    
    .icon {
      color: var(--secondary);
    }
  }
  
  .activity-list {
    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid var(--border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .activity-icon {
        width: 40px;
        height: 40px;
        background: var(--background);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary);
      }
      
      .activity-content {
        flex: 1;
        
        .activity-title {
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 4px;
        }
        
        .activity-time {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
      }
    }
  }
`;

const AdminDashboardPage = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    totalAttendances: 0,
    totalRevenue: 0,
    inactiveClients: 0,
    todayAttendances: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    fetchMetrics();
  }, [admin, navigate]);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/admin/reports/summary');
      setMetrics(response.data);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      toast.error('Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <div className="loading">
            <div className="spinner"></div>
            Carregando dashboard...
          </div>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <PageHeader>
          <h1>Dashboard Administrativo</h1>
          <p>Bem-vindo, {admin.name}! Aqui está o resumo da sua barbearia.</p>
        </PageHeader>
        
        <MetricsGrid>
          <MetricCard>
            <div className="metric-header">
              <div className="icon" style={{ background: 'rgba(26, 26, 26, 0.1)', color: 'var(--primary)' }}>
                <FaUsers />
              </div>
              <div className={`trend ${(metrics.growthPercentages?.clientsGrowth || 0) >= 0 ? 'positive' : 'negative'}`}>
                {metrics.growthPercentages?.clientsGrowth ? `${metrics.growthPercentages.clientsGrowth >= 0 ? '+' : ''}${metrics.growthPercentages.clientsGrowth.toFixed(1)}%` : '0%'}
              </div>
            </div>
            <div className="metric-value">{metrics.totalClients}</div>
            <div className="metric-label">Total de Clientes</div>
          </MetricCard>
          
          <MetricCard>
            <div className="metric-header">
              <div className="icon" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--secondary)' }}>
                <FaCut />
              </div>
              <div className={`trend ${(metrics.growthPercentages?.attendancesGrowth || 0) >= 0 ? 'positive' : 'negative'}`}>
                {metrics.growthPercentages?.attendancesGrowth ? `${metrics.growthPercentages.attendancesGrowth >= 0 ? '+' : ''}${metrics.growthPercentages.attendancesGrowth.toFixed(1)}%` : '0%'}
              </div>
            </div>
            <div className="metric-value">{metrics.totalAttendances}</div>
            <div className="metric-label">Total de Atendimentos</div>
          </MetricCard>
          
          <MetricCard>
            <div className="metric-header">
              <div className="icon" style={{ background: 'rgba(40, 167, 69, 0.1)', color: 'var(--success)' }}>
                <FaDollarSign />
              </div>
              <div className={`trend ${(metrics.growthPercentages?.revenueGrowth || 0) >= 0 ? 'positive' : 'negative'}`}>
                {metrics.growthPercentages?.revenueGrowth ? `${metrics.growthPercentages.revenueGrowth >= 0 ? '+' : ''}${metrics.growthPercentages.revenueGrowth.toFixed(1)}%` : '0%'}
              </div>
            </div>
            <div className="metric-value">R$ {(metrics.totalRevenue || 0).toFixed(2)}</div>
            <div className="metric-label">Receita Total</div>
          </MetricCard>
          
          <MetricCard>
            <div className="metric-header">
              <div className="icon" style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--error)' }}>
                <FaExclamationCircle />
              </div>
              <div className="trend neutral">
                {metrics.totalClients > 0 ? `${((metrics.inactiveClients / metrics.totalClients) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
            <div className="metric-value">{metrics.inactiveClients}</div>
            <div className="metric-label">Clientes Inativos</div>
          </MetricCard>
        </MetricsGrid>
        
        <QuickActionsGrid>
          <QuickActionCard>
            <h3>
              <FaUsers className="icon" />
              Gestão de Clientes
            </h3>
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/admin/clientes')}
              >
                Ver Clientes
              </button>
              <button className="btn btn-secondary">
                Adicionar Cliente
              </button>
            </div>
          </QuickActionCard>
          
          <QuickActionCard>
            <h3>
              <FaCut className="icon" />
              Gestão de Atendimentos
            </h3>
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/admin/atendimentos')}
              >
                Ver Atendimentos
              </button>
              <button className="btn btn-secondary">
                Novo Atendimento
              </button>
            </div>
          </QuickActionCard>

          <QuickActionCard>
            <h3>
              <FaCut className="icon" />
              Gestão de Serviços
            </h3>
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/admin/servicos')}
              >
                Ver Serviços
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/admin/servicos')}>
                Novo Serviço
              </button>
            </div>
          </QuickActionCard>
          
          <QuickActionCard>
            <h3>
              <FaChartBar className="icon" />
              Relatórios
            </h3>
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/admin/relatorios')}
              >
                Ver Relatórios
              </button>
              <button className="btn btn-secondary">
                Exportar Dados
              </button>
            </div>
          </QuickActionCard>
        </QuickActionsGrid>
        
        <RecentActivityCard>
          <h3>
            <FaClock className="icon" />
            Atividade Recente
          </h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <FaUsers />
              </div>
              <div className="activity-content">
                <div className="activity-title">Novo cliente cadastrado</div>
                <div className="activity-time">Há 2 horas</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">
                <FaCut />
              </div>
              <div className="activity-content">
                <div className="activity-title">Atendimento concluído</div>
                <div className="activity-time">Há 4 horas</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">
                <FaDollarSign />
              </div>
              <div className="activity-content">
                <div className="activity-title">Pagamento recebido</div>
                <div className="activity-time">Há 6 horas</div>
              </div>
            </div>
          </div>
        </RecentActivityCard>
      </Container>
    </PageContainer>
  );
};

export default AdminDashboardPage;
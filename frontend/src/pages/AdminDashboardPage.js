import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUsers, FaCut, FaDollarSign, FaClock, FaChartBar, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import Footer from '../components/Footer';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--background);
  padding: 20px;
  display: flex;
  flex-direction: column;
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
      background: rgba(32, 172, 159, 0.1); // Alterado para a nova cor
      color: #20AC9F; // Alterado para a nova cor
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
        background: #20AC9F; // Alterado para a nova cor
        color: var(--accent);
        
        &:hover {
          background: #1A8C7F; // Alterado para a nova cor
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
        
        .activity-description {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin: 2px 0;
        }
      }
    }
    
    .loading-activities {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: var(--text-secondary);
      
      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid var(--border);
        border-top: 2px solid var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 10px;
      }
    }
    
    .no-activities {
      text-align: center;
      padding: 20px;
      color: var(--text-secondary);
      
      p {
        margin: 0;
        font-style: italic;
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
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    fetchMetrics();
    fetchRecentActivities();
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

  const fetchRecentActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await api.get('/admin/reports/recent-activities?limit=5');
      setRecentActivities(response.data);
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      toast.error('Erro ao carregar atividades recentes');
    } finally {
      setLoadingActivities(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Há ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Há ${diffInDays} dias`;
    
    return activityTime.toLocaleDateString('pt-BR');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_attendance':
        return <FaUsers style={{ color: 'var(--primary)' }} />;
      case 'attendance_started':
        return <FaClock style={{ color: 'var(--secondary)' }} />;
      case 'attendance_completed':
        return <FaCheckCircle style={{ color: 'var(--success)' }} />;
      case 'attendance_finished':
        return <FaCut style={{ color: 'var(--secondary)' }} />;
      case 'attendance_updated':
        return <FaExclamationCircle style={{ color: 'var(--warning)' }} />;
      default:
        return <FaUsers />;
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
            {loadingActivities ? (
              <div className="loading-activities">
                <div className="spinner"></div>
                Carregando atividades...
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-description">{activity.description}</div>
                    <div className="activity-time">{formatTimeAgo(activity.timestamp)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activities">
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </RecentActivityCard>
      </Container>
      <Footer />
    </PageContainer>
  );
};

export default AdminDashboardPage;
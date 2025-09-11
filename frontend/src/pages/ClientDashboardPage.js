import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCut, FaWhatsapp, FaUser, FaHistory, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { Button, Card, Loading } from '../components';
import { formatDateTime, formatCurrency } from '../utils';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    color: var(--primary);
    margin-bottom: 10px;
    font-size: 2.5rem;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
`;

const WelcomeSection = styled(Card)`
  text-align: center;
  padding: 30px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  
  h2 {
    margin-bottom: 10px;
    font-size: 1.8rem;
  }
  
  p {
    opacity: 0.9;
    font-size: 1.1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 24px;
  
  .stat-icon {
    font-size: 2.5rem;
    color: var(--primary);
    margin-bottom: 16px;
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 8px;
  }
  
  .stat-label {
    color: var(--text-secondary);
    font-size: 1rem;
  }
`;

const QuickActions = styled(Card)`
  padding: 24px;
  margin-bottom: 30px;
  
  h3 {
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
`;

const RecentAttendances = styled(Card)`
  padding: 24px;
  margin-bottom: 30px;
  
  h3 {
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const AttendanceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .attendance-info {
    flex: 1;
    
    .service-name {
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }
    
    .attendance-date {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
  }
  
  .attendance-status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    
    &.waiting {
      background: var(--warning-light);
      color: var(--warning);
    }
    
    &.progress {
      background: var(--info-light);
      color: var(--info);
    }
    
    &.finished {
      background: var(--success-light);
      color: var(--success);
    }
    
    &.cancelled {
      background: var(--danger-light);
      color: var(--danger);
    }
  }
  
  .attendance-price {
    font-weight: 600;
    color: var(--primary);
    margin-left: 16px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    
    .attendance-price {
      margin-left: 0;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    margin-bottom: 20px;
  }
`;

const ClientDashboardPage = () => {
  const navigate = useNavigate();
  const { client, logoutClient } = useAuth();
  
  const [recentAttendances, setRecentAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttendances: 0,
    completedAttendances: 0,
    pendingAttendances: 0,
    totalSpent: 0
  });

  useEffect(() => {
    if (!client) {
      navigate('/cliente/login');
      return;
    }
    // Se não tem data de nascimento, redireciona para tela de adicionar
    if (!client.data_nascimento) {
      navigate('/cliente/add-birthdate');
      return;
    }
    fetchClientData();
  }, [client, navigate]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Buscar atendimentos do cliente
      const attendancesResponse = await api.get(`/clients/${client.id}/attendances`);
      const attendances = attendancesResponse.data;
      
      // Calcular estatísticas
      const totalAttendances = attendances.length;
      const completedAttendances = attendances.filter(a => a.status === 'finished').length;
      const pendingAttendances = attendances.filter(a => ['waiting', 'progress'].includes(a.status)).length;
      const totalSpent = attendances
        .filter(a => a.status === 'finished')
        .reduce((sum, a) => sum + (a.service?.price || 0), 0);
      
      setStats({
        totalAttendances,
        completedAttendances,
        pendingAttendances,
        totalSpent
      });
      
      // Últimos 5 atendimentos
      setRecentAttendances(attendances.slice(0, 5));
      
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAttendance = () => {
    navigate('/cliente/atendimento/iniciar');
  };

  const handleViewHistory = () => {
    // Implementar página de histórico
    toast.info('Funcionalidade em desenvolvimento');
  };

  const handleContact = () => {
    const phone = '11999999999'; // Telefone da barbearia
    const whatsappUrl = `https://wa.me/55${phone}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLogout = () => {
    logoutClient();
    navigate('/');
  };

  const getStatusText = (status) => {
    const statusMap = {
      waiting: 'Aguardando',
      progress: 'Em Andamento',
      finished: 'Concluído',
      cancelled: 'Cancelado'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Container>
        <Loading text="Carregando seu dashboard..." />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Dashboard do Cliente</h1>
        <p>Bem-vindo de volta, {client?.name}!</p>
      </Header>

      <WelcomeSection>
        <h2>👋 Olá, {client?.name}!</h2>
        <p>Estamos felizes em vê-lo novamente. Agende seu próximo corte ou acompanhe seus atendimentos.</p>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <div className="stat-icon">📊</div>
          <div className="stat-number">{stats.totalAttendances}</div>
          <div className="stat-label">Total de Visitas</div>
        </StatCard>
        
        <StatCard>
          <div className="stat-icon">✅</div>
          <div className="stat-number">{stats.completedAttendances}</div>
          <div className="stat-label">Cortes Realizados</div>
        </StatCard>
        
        <StatCard>
          <div className="stat-icon">⏳</div>
          <div className="stat-number">{stats.pendingAttendances}</div>
          <div className="stat-label">Agendamentos Pendentes</div>
        </StatCard>
        
      </StatsGrid>

      <QuickActions>
        <h3>
          <FaPlus />
          Ações Rápidas
        </h3>
        <div className="actions-grid">
          <Button variant="primary" onClick={handleNewAttendance} fullWidth>
            <FaCut />
            Agendar Corte
          </Button>
          
          <Button variant="secondary" onClick={handleViewHistory} fullWidth>
            <FaHistory />
            Ver Histórico
          </Button>
          
          <Button variant="outline" onClick={handleContact} fullWidth>
            <FaWhatsapp />
            Falar Conosco
          </Button>
          
          <Button variant="ghost" onClick={handleLogout} fullWidth>
            <FaUser />
            Sair
          </Button>
        </div>
      </QuickActions>

      <RecentAttendances>
        <h3>
          <FaHistory />
          Atendimentos Recentes
        </h3>
        
        {recentAttendances.length > 0 ? (
          recentAttendances.map(attendance => (
            <AttendanceItem key={attendance.id}>
              <div className="attendance-info">
                <div className="service-name">
                  {attendance.service?.name || 'Serviço não especificado'}
                </div>
                <div className="attendance-date">
                  {formatDateTime(attendance.appointment_date)}
                </div>
              </div>
              
              <div className={`attendance-status ${attendance.status}`}>
                {getStatusText(attendance.status)}
              </div>
              
              <div className="attendance-price">
                {attendance.service?.price ? formatCurrency(attendance.service.price) : 'N/A'}
              </div>
            </AttendanceItem>
          ))
        ) : (
          <EmptyState>
            <div className="empty-icon">✂️</div>
            <p>Você ainda não tem atendimentos registrados.</p>
            <Button variant="primary" onClick={handleNewAttendance}>
              <FaPlus />
              Agendar Primeiro Corte
            </Button>
          </EmptyState>
        )}
      </RecentAttendances>

      <Footer />
    </Container>
  );
};

export default ClientDashboardPage;

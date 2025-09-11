import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUsers, FaClock, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaSync, FaPlay, FaPause } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import Footer from '../components/Footer';
import { Button, Card, Loading } from '../components';
import { formatDateTime, formatCurrency } from '../utils';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--background);
  padding: 20px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
    
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: color 0.3s;
  margin-bottom: 20px;

  &:hover {
    color: var(--primary);
  }
`;

const QueueStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(Card)`
  padding: 24px;
  text-align: center;
  
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

const QueueControls = styled(Card)`
  padding: 24px;
  margin-bottom: 30px;
  
  h3 {
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .controls-row {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }
`;

const QueueList = styled(Card)`
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

const QueueItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: 2px solid var(--border);
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.current {
    border-color: var(--success);
    background: rgba(40, 167, 69, 0.05);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
  }
  
  &.waiting {
    border-color: var(--warning);
    background: rgba(255, 193, 7, 0.05);
  }
  
  .queue-info {
    flex: 1;
    
    .position {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 8px;
    }
    
    .client-name {
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }
    
    .services {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 4px;
    }
    
    .arrival-time {
      color: var(--text-secondary);
      font-size: 0.8rem;
    }
  }
  
  .queue-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    
    &.current {
      background: var(--success);
      color: white;
    }
    
    &.waiting {
      background: var(--warning);
      color: white;
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    
    .queue-actions {
      width: 100%;
      justify-content: space-between;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 10px;
    color: var(--text);
  }
  
  p {
    margin-bottom: 20px;
  }
`;

const QueueManagementPage = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();
  
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalWaiting: 0,
    currentAttending: 0,
    completedToday: 0
  });

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    fetchQueueData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchQueueData, 30000);
    return () => clearInterval(interval);
  }, [admin, navigate]);

  const fetchQueueData = async () => {
    try {
      setRefreshing(true);
      
      // Buscar atendimentos presenciais do dia
      const response = await api.get('/attendance/today');
      const todayAttendances = response.data;
      
      // Filtrar apenas atendimentos presenciais
      const presentialAttendances = todayAttendances.filter(
        attendance => attendance.attendance_type === 'presential'
      );
      
      // Ordenar por posição na fila
      const sortedQueue = presentialAttendances
        .filter(attendance => attendance.status === 'waiting')
        .sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0));
      
      setQueue(sortedQueue);
      
      // Calcular estatísticas
      const totalWaiting = sortedQueue.length;
      const currentAttending = presentialAttendances.filter(a => a.status === 'progress').length;
      const completedToday = presentialAttendances.filter(a => a.status === 'finished').length;
      
      setStats({
        totalWaiting,
        currentAttending,
        completedToday
      });
      
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
      toast.error('Erro ao carregar dados da fila');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStartAttendance = async (attendanceId) => {
    try {
      await api.put(`/attendance/${attendanceId}`, {
        status: 'progress'
      });
      
      toast.success('Atendimento iniciado!');
      fetchQueueData();
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      toast.error('Erro ao iniciar atendimento');
    }
  };

  const handleCompleteAttendance = async (attendanceId) => {
    try {
      await api.put(`/attendance/${attendanceId}`, {
        status: 'finished',
        payment_status: 'paid'
      });
      
      toast.success('Atendimento finalizado!');
      fetchQueueData();
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      toast.error('Erro ao finalizar atendimento');
    }
  };

  const handleCancelAttendance = async (attendanceId) => {
    if (window.confirm('Tem certeza que deseja cancelar este atendimento?')) {
      try {
        await api.put(`/attendance/${attendanceId}`, {
          status: 'cancelled'
        });
        
        toast.success('Atendimento cancelado!');
        fetchQueueData();
      } catch (error) {
        console.error('Erro ao cancelar atendimento:', error);
        toast.error('Erro ao cancelar atendimento');
      }
    }
  };

  const getServicesText = (services) => {
    if (!services || services.length === 0) return 'Nenhum serviço';
    if (services.length === 1) return services[0].name;
    return `${services.length} serviços`;
  };

  const getTotalPrice = (services) => {
    if (!services || services.length === 0) return 0;
    return services.reduce((total, service) => total + service.price, 0);
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <Loading text="Carregando fila de atendimentos..." />
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <BackButton onClick={() => navigate('/admin/dashboard')}>
          <FaArrowLeft />
          Voltar ao Dashboard
        </BackButton>

        <PageHeader>
          <h1>
            <FaUsers />
            Gestão de Fila - Atendimentos Presenciais
          </h1>
          <p>Gerencie a fila de clientes que chegaram na barbearia</p>
        </PageHeader>

        <QueueStats>
          <StatCard>
            <div className="stat-icon">⏳</div>
            <div className="stat-number">{stats.totalWaiting}</div>
            <div className="stat-label">Aguardando</div>
          </StatCard>
          
          <StatCard>
            <div className="stat-icon">✂️</div>
            <div className="stat-number">{stats.currentAttending}</div>
            <div className="stat-label">Em Atendimento</div>
          </StatCard>
          
          <StatCard>
            <div className="stat-icon">✅</div>
            <div className="stat-number">{stats.completedToday}</div>
            <div className="stat-label">Concluídos Hoje</div>
          </StatCard>
        </QueueStats>

        <QueueControls>
          <h3>
            <FaClock />
            Controles da Fila
          </h3>
          <div className="controls-row">
            <Button 
              variant="primary" 
              onClick={fetchQueueData}
              disabled={refreshing}
            >
              <FaSync className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Atualizando...' : 'Atualizar Fila'}
            </Button>
            
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              A fila é atualizada automaticamente a cada 30 segundos
            </div>
          </div>
        </QueueControls>

        <QueueList>
          <h3>
            <FaUsers />
            Fila de Atendimento
          </h3>
          
          {queue.length > 0 ? (
            queue.map((attendance, index) => (
              <QueueItem 
                key={attendance.id}
                className={index === 0 ? 'current' : 'waiting'}
              >
                <div className="queue-info">
                  <div className="position">
                    #{attendance.queue_position || index + 1}
                  </div>
                  <div className="client-name">
                    {attendance.client?.name || 'Cliente não encontrado'}
                  </div>
                  <div className="services">
                    {getServicesText(attendance.services)}
                    {attendance.services && attendance.services.length > 0 && (
                      <span> - {formatCurrency(getTotalPrice(attendance.services))}</span>
                    )}
                  </div>
                  <div className="arrival-time">
                    Chegou às {formatDateTime(attendance.appointment_date).split(' ')[1]}
                  </div>
                </div>
                
                <div className="queue-actions">
                  <div className="status-badge current">
                    {index === 0 ? 'Próximo' : 'Aguardando'}
                  </div>
                  
                  {index === 0 && (
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => handleStartAttendance(attendance.id)}
                    >
                      <FaPlay />
                      Iniciar
                    </Button>
                  )}
                  
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleCancelAttendance(attendance.id)}
                  >
                    <FaTimesCircle />
                    Cancelar
                  </Button>
                </div>
              </QueueItem>
            ))
          ) : (
            <EmptyState>
              <div className="empty-icon">👥</div>
              <h3>Fila Vazia</h3>
              <p>Não há clientes aguardando atendimento no momento.</p>
            </EmptyState>
          )}
        </QueueList>
      </Container>
      <Footer />
    </PageContainer>
  );
};

export default QueueManagementPage;
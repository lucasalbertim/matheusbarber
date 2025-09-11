import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaUsers, FaClock, FaCheckCircle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { Button, Card, Loading } from '../components';

const Container = styled.div`
  max-width: 600px;
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
  margin-bottom: 30px;
  
  h1 {
    color: var(--primary);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
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

const QueueCard = styled(Card)`
  padding: 40px 24px;
  text-align: center;
  margin-bottom: 30px;
  
  .queue-icon {
    font-size: 4rem;
    color: var(--primary);
    margin-bottom: 20px;
    animation: pulse 2s infinite;
  }
  
  .queue-position {
    font-size: 3rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 10px;
  }
  
  .queue-label {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 20px;
  }
  
  .estimated-time {
    background: rgba(32, 172, 159, 0.1);
    color: var(--primary);
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: 600;
    display: inline-block;
    margin-bottom: 20px;
  }
  
  .queue-info {
    background: var(--surface);
    padding: 20px;
    border-radius: 12px;
    margin-top: 20px;
    
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .info-label {
        color: var(--text-secondary);
      }
      
      .info-value {
        font-weight: 600;
        color: var(--text);
      }
    }
  }
`;

const StatusCard = styled(Card)`
  padding: 24px;
  text-align: center;
  
  &.success {
    background: rgba(40, 167, 69, 0.1);
    border: 2px solid var(--success);
  }
  
  &.warning {
    background: rgba(255, 193, 7, 0.1);
    border: 2px solid var(--warning);
  }
  
  .status-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    
    &.success {
      color: var(--success);
    }
    
    &.warning {
      color: var(--warning);
    }
  }
  
  .status-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .status-description {
    color: var(--text-secondary);
    margin-bottom: 20px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  
  .spinner {
    animation: spin 1s linear infinite;
  }
`;

const ClientQueuePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { client } = useAuth();
  
  const [attendance, setAttendance] = useState(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!client) {
      navigate('/cliente/login');
      return;
    }
    
    // Verificar se os dados foram passados via state
    if (location.state?.attendance && location.state?.queuePosition) {
      setAttendance(location.state.attendance);
      setQueuePosition(location.state.queuePosition);
      setLoading(false);
      
      // Calcular tempo estimado (assumindo 30 minutos por atendimento)
      setEstimatedTime(queuePosition * 30);
      
      // Simular redirecionamento após 7-10 segundos
      setTimeout(() => {
        setRedirecting(true);
        setTimeout(() => {
          navigate('/cliente/dashboard');
        }, 2000);
      }, 8000);
    } else {
      // Se não há dados, redirecionar para o dashboard
      navigate('/cliente/dashboard');
    }
  }, [client, navigate, location.state, queuePosition]);

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  if (loading) {
    return (
      <Container>
        <Loading text="Carregando informações da fila..." />
      </Container>
    );
  }

  if (redirecting) {
    return (
      <Container>
        <StatusCard className="success">
          <div className="status-icon success">
            <FaCheckCircle />
          </div>
          <div className="status-title">Atendimento Registrado!</div>
          <div className="status-description">
            Você foi adicionado à fila de atendimento. 
            Retornando ao dashboard...
          </div>
          <LoadingSpinner>
            <FaSpinner className="spinner" />
            Redirecionando...
          </LoadingSpinner>
        </StatusCard>
        <Footer />
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate('/cliente/dashboard')}>
        <FaArrowLeft />
        Voltar ao Dashboard
      </BackButton>

      <Header>
        <h1>
          <FaUsers />
          Fila de Atendimento
        </h1>
        <p>Você está na fila! Aguarde sua vez.</p>
      </Header>

      <QueueCard>
        <div className="queue-icon">
          <FaUsers />
        </div>
        
        <div className="queue-position">{queuePosition}</div>
        <div className="queue-label">
          {queuePosition === 1 ? 'Você é o próximo!' : `Pessoas na sua frente`}
        </div>
        
        <div className="estimated-time">
          <FaClock style={{ marginRight: '8px' }} />
          Tempo estimado: {formatTime(estimatedTime)}
        </div>
        
        <div className="queue-info">
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className="info-value">Aguardando</span>
          </div>
          <div className="info-item">
            <span className="info-label">Serviços:</span>
            <span className="info-value">
              {attendance?.services?.length || 0} selecionado(s)
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Pagamento:</span>
            <span className="info-value">
              {attendance?.payment_method === 'cash' ? 'Dinheiro' :
               attendance?.payment_method === 'card' ? 'Cartão' :
               attendance?.payment_method === 'pix' ? 'PIX' : 'Não informado'}
            </span>
          </div>
        </div>
      </QueueCard>

      <StatusCard className="warning">
        <div className="status-icon warning">
          <FaClock />
        </div>
        <div className="status-title">Aguarde sua vez</div>
        <div className="status-description">
          Fique atento ao chamado. Você será redirecionado automaticamente 
          para o dashboard em alguns segundos.
        </div>
      </StatusCard>

      <Footer />
    </Container>
  );
};

export default ClientQueuePage;
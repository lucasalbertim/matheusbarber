import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaClock, FaCheck, FaTimes, FaSpinner, FaEye } from 'react-icons/fa';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary) 0%, #2a2a2a 100%);
  padding: 20px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.1);
  color: var(--accent);
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Title = styled.h1`
  color: var(--accent);
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: var(--secondary);
  font-size: 1.2rem;
  margin: 10px 0 0 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: var(--surface);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const AttendanceSection = styled.div`
  background: var(--surface);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RefreshButton = styled.button`
  background: var(--secondary);
  color: var(--primary);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #b8942a;
    transform: translateY(-2px);
  }
`;

const AttendanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AttendanceCard = styled.div`
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  background: var(--surface);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--secondary);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;

const AttendanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const AttendanceNumber = styled.div`
  background: var(--secondary);
  color: var(--primary);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
`;

const AttendanceStatus = styled.div`
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'aguardando':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      case 'em_andamento':
        return `
          background: #d1ecf1;
          color: #0c5460;
        `;
      case 'finalizado':
        return `
          background: #d4edda;
          color: #155724;
        `;
      default:
        return `
          background: var(--border);
          color: var(--text-secondary);
        `;
    }
  }}
`;

const ClientInfo = styled.div`
  margin-bottom: 15px;
`;

const ClientName = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
`;

const ClientDetails = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const ServicesList = styled.div`
  margin-bottom: 15px;
`;

const ServiceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ServiceName = styled.span`
  color: var(--text-primary);
  font-weight: 500;
`;

const ServicePrice = styled.span`
  color: var(--secondary);
  font-weight: 600;
`;

const PaymentInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 0;
  border-top: 1px solid var(--border);
`;

const PaymentMethod = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const TotalAmount = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--secondary);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: var(--secondary);
          color: var(--primary);
          
          &:hover {
            background: #b8942a;
          }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          
          &:hover {
            background: #218838;
          }
        `;
      case 'warning':
        return `
          background: #ffc107;
          color: #212529;
          
          &:hover {
            background: #e0a800;
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          
          &:hover {
            background: #c82333;
          }
        `;
      default:
        return `
          background: var(--border);
          color: var(--text-secondary);
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: var(--border);
  margin-bottom: 20px;
`;

const EmptyText = styled.p`
  font-size: 1.1rem;
  margin: 0;
`;

const AttendanceManagementPage = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    aguardando: 0,
    em_andamento: 0,
    finalizado: 0
  });

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    fetchAttendances();
  }, [admin, navigate]);

  const fetchAttendances = async () => {
    setIsLoading(true);
    
    try {
      const response = await api.get('/attendances/today');
      setAttendances(response.data);
      
      // Calcular estatísticas
      const newStats = {
        total: response.data.length,
        aguardando: response.data.filter(a => a.status === 'aguardando').length,
        em_andamento: response.data.filter(a => a.status === 'em_andamento').length,
        finalizado: response.data.filter(a => a.status === 'finalizado').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error);
      toast.error('Erro ao carregar atendimentos');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAttendanceStatus = async (attendanceId, newStatus) => {
    try {
      const response = await api.patch(`/attendances/${attendanceId}`, {
        status: newStatus
      });
      
      if (response.status === 200) {
        toast.success(`Status atualizado para ${newStatus}`);
        fetchAttendances(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleBackClick = () => {
    // Logout automático ao voltar
    logout();
    navigate('/');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };



  if (!admin) {
    return null;
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <BackButton onClick={handleBackClick}>
            <FaArrowLeft />
            Voltar
          </BackButton>
          <Title>Gestão de Atendimentos</Title>
          <Subtitle>Controle em tempo real dos atendimentos do dia</Subtitle>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>Total de Atendimentos</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.aguardando}</StatNumber>
            <StatLabel>Aguardando</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.em_andamento}</StatNumber>
            <StatLabel>Em Andamento</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.finalizado}</StatNumber>
            <StatLabel>Finalizados</StatLabel>
          </StatCard>
        </StatsGrid>

        <AttendanceSection>
          <SectionHeader>
            <SectionTitle>
              <FaClock />
              Atendimentos do Dia
            </SectionTitle>
            <RefreshButton onClick={fetchAttendances} disabled={isLoading}>
              {isLoading ? <FaSpinner /> : 'Atualizar'}
            </RefreshButton>
          </SectionHeader>

          {isLoading ? (
            <EmptyState>
              <EmptyIcon>
                <FaSpinner />
              </EmptyIcon>
              <EmptyText>Carregando atendimentos...</EmptyText>
            </EmptyState>
          ) : attendances.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <FaClock />
              </EmptyIcon>
              <EmptyText>Nenhum atendimento agendado para hoje</EmptyText>
            </EmptyState>
          ) : (
            <AttendanceList>
              {attendances.map((attendance) => (
                <AttendanceCard key={attendance.id}>
                  <AttendanceHeader>
                    <AttendanceNumber>#{attendance.id}</AttendanceNumber>
                    <AttendanceStatus status={attendance.status}>
                      {attendance.status}
                    </AttendanceStatus>
                  </AttendanceHeader>

                  <ClientInfo>
                    <ClientName>{attendance.client.name}</ClientName>
                    <ClientDetails>
                      CPF: {attendance.client.cpf} • 
                      Telefone: {attendance.client.phone}
                    </ClientDetails>
                  </ClientInfo>

                  <ServicesList>
                    {attendance.services.map((service) => (
                      <ServiceItem key={service.id}>
                        <ServiceName>{service.name}</ServiceName>
                        <ServicePrice>{formatCurrency(service.price)}</ServicePrice>
                      </ServiceItem>
                    ))}
                  </ServicesList>

                  <PaymentInfo>
                    <PaymentMethod>
                      Pagamento: {attendance.payment_method}
                    </PaymentMethod>
                    <TotalAmount>
                      Total: {formatCurrency(attendance.total_amount)}
                    </TotalAmount>
                  </PaymentInfo>

                  <ActionButtons>
                    {attendance.status === 'aguardando' && (
                      <>
                        <ActionButton
                          variant="warning"
                          onClick={() => updateAttendanceStatus(attendance.id, 'em_andamento')}
                        >
                          <FaSpinner />
                          Iniciar
                        </ActionButton>
                        <ActionButton
                          variant="danger"
                          onClick={() => updateAttendanceStatus(attendance.id, 'cancelado')}
                        >
                          <FaTimes />
                          Cancelar
                        </ActionButton>
                      </>
                    )}
                    
                    {attendance.status === 'em_andamento' && (
                      <ActionButton
                        variant="success"
                        onClick={() => updateAttendanceStatus(attendance.id, 'finalizado')}
                      >
                        <FaCheck />
                        Finalizar
                      </ActionButton>
                    )}
                    
                    <ActionButton
                      variant="primary"
                      onClick={() => {/* TODO: Implementar visualização detalhada */}}
                    >
                      <FaEye />
                      Detalhes
                    </ActionButton>
                  </ActionButtons>
                </AttendanceCard>
              ))}
            </AttendanceList>
          )}
        </AttendanceSection>
      </Container>
    </PageContainer>
  );
};

export default AttendanceManagementPage;
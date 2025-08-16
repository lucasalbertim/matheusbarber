import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaClock, FaCheck, FaTimes, FaSpinner, FaEye, FaEdit, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: var(--primary);
  margin: 0;
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

  &:hover {
    color: var(--primary);
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;

  .number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 8px;
  }

  .label {
    color: var(--text);
    font-weight: 600;
  }

  &.waiting .number { color: var(--warning); }
  &.progress .number { color: var(--info); }
  &.finished .number { color: var(--success); }
  &.total .number { color: var(--primary); }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
`;

const FilterButton = styled.button`
  padding: 10px 20px;
  border: 2px solid var(--border);
  background: white;
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;

  &.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  &:hover {
    border-color: var(--primary);
  }
`;

const AttendancesContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const AttendanceHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr 120px 120px;
  gap: 20px;
  padding: 20px;
  background: var(--background);
  font-weight: 600;
  color: var(--text);
  border-bottom: 2px solid var(--border);
`;

const AttendanceRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr 120px 120px;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid var(--border);
  align-items: center;

  &:hover {
    background: var(--background);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AttendanceNumber = styled.div`
  font-weight: 700;
  color: var(--primary);
  font-size: 1.2rem;
`;

const ClientInfo = styled.div`
  .name {
    font-weight: 600;
    color: var(--text);
    margin-bottom: 4px;
  }

  .details {
    font-size: 14px;
    color: var(--text-light);
  }
`;

const ServicesList = styled.div`
  .service {
    background: var(--background);
    padding: 4px 8px;
    border-radius: 4px;
    margin-bottom: 4px;
    font-size: 14px;
    color: var(--text);
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;

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
`;

const PaymentBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;

  &.pending {
    background: var(--warning-light);
    color: var(--warning);
  }

  &.paid {
    background: var(--success-light);
    color: var(--success);
  }

  &.cancelled {
    background: var(--error-light);
    color: var(--error);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &.view {
    background: var(--info);
    color: white;

    &:hover {
      background: var(--info-dark);
    }
  }

  &.edit {
    background: var(--warning);
    color: white;

    &:hover {
      background: var(--warning-dark);
    }
  }

  &.whatsapp {
    background: #25D366;
    color: white;

    &:hover {
      background: #128C7E;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);

  h3 {
    margin-bottom: 10px;
    color: var(--text);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
`;

const AttendanceManagementPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [filteredAttendances, setFilteredAttendances] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    progress: 0,
    finished: 0
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/login');
      return;
    }
    fetchAttendances();
  }, [isAdmin, navigate]);

  useEffect(() => {
    filterAttendances();
  }, [activeFilter, attendances]);

  const fetchAttendances = async () => {
    try {
      const response = await api.get('/attendance/today');
      setAttendances(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error);
      toast.error('Erro ao carregar atendimentos');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const waiting = data.filter(a => a.status === 'waiting').length;
    const progress = data.filter(a => a.status === 'progress').length;
    const finished = data.filter(a => a.status === 'finished').length;

    setStats({ total, waiting, progress, finished });
  };

  const filterAttendances = () => {
    if (activeFilter === 'all') {
      setFilteredAttendances(attendances);
      return;
    }

    const filtered = attendances.filter(attendance => 
      attendance.status === activeFilter
    );
    setFilteredAttendances(filtered);
  };

  const updateAttendanceStatus = async (attendanceId, newStatus) => {
    try {
      await api.put(`/attendance/${attendanceId}`, {
        status: newStatus
      });
      
      toast.success('Status atualizado com sucesso');
      fetchAttendances();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBackClick = () => {
    navigate('/admin/dashboard');
  };

  const getStatusLabel = (status) => {
    const labels = {
      waiting: 'Aguardando',
      progress: 'Em Andamento',
      finished: 'Finalizado'
    };
    return labels[status] || status;
  };

  const getPaymentLabel = (payment) => {
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      cancelled: 'Cancelado'
    };
    return labels[payment] || payment;
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingState>
          <h3>Carregando atendimentos...</h3>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gestão de Atendimentos</Title>
        <BackButton onClick={handleBackClick}>
          <FaArrowLeft />
          Voltar ao Dashboard
        </BackButton>
      </Header>

      <StatsContainer>
        <StatCard className="total">
          <div className="number">{stats.total}</div>
          <div className="label">Total</div>
        </StatCard>
        <StatCard className="waiting">
          <div className="number">{stats.waiting}</div>
          <div className="label">Aguardando</div>
        </StatCard>
        <StatCard className="progress">
          <div className="number">{stats.progress}</div>
          <div className="label">Em Andamento</div>
        </StatCard>
        <StatCard className="finished">
          <div className="number">{stats.finished}</div>
          <div className="label">Finalizados</div>
        </StatCard>
      </StatsContainer>

      <FilterBar>
        <FilterButton
          className={activeFilter === 'all' ? 'active' : ''}
          onClick={() => setActiveFilter('all')}
        >
          Todos ({stats.total})
        </FilterButton>
        <FilterButton
          className={activeFilter === 'waiting' ? 'active' : ''}
          onClick={() => setActiveFilter('waiting')}
        >
          Aguardando ({stats.waiting})
        </FilterButton>
        <FilterButton
          className={activeFilter === 'progress' ? 'active' : ''}
          onClick={() => setActiveFilter('progress')}
        >
          Em Andamento ({stats.progress})
        </FilterButton>
        <FilterButton
          className={activeFilter === 'finished' ? 'active' : ''}
          onClick={() => setActiveFilter('finished')}
        >
          Finalizados ({stats.finished})
        </FilterButton>
      </FilterBar>

      <AttendancesContainer>
        <AttendanceHeader>
          <div>Número</div>
          <div>Cliente</div>
          <div>Serviços</div>
          <div>Status</div>
          <div>Pagamento</div>
          <div>Ações</div>
        </AttendanceHeader>

        {filteredAttendances.length === 0 ? (
          <EmptyState>
            <h3>Nenhum atendimento encontrado</h3>
            <p>Não há atendimentos para o filtro selecionado.</p>
          </EmptyState>
        ) : (
          filteredAttendances.map((attendance) => (
            <AttendanceRow key={attendance.id}>
              <AttendanceNumber>#{attendance.id}</AttendanceNumber>
              
              <ClientInfo>
                <div className="name">{attendance.client.name}</div>
                <div className="details">{attendance.client.phone}</div>
              </ClientInfo>
              
              <ServicesList>
                {attendance.services.map((service, index) => (
                  <div key={index} className="service">
                    {service.name} - R$ {service.price}
                  </div>
                ))}
              </ServicesList>
              
              <StatusBadge className={attendance.status}>
                {getStatusLabel(attendance.status)}
              </StatusBadge>
              
              <PaymentBadge className={attendance.payment_status}>
                {getPaymentLabel(attendance.payment_status)}
              </PaymentBadge>
              
              <ActionButtons>
                <ActionButton
                  className="view"
                  title="Visualizar"
                  onClick={() => navigate(`/admin/atendimentos/${attendance.id}`)}
                >
                  <FaEye />
                </ActionButton>
                
                <ActionButton
                  className="edit"
                  title="Editar"
                  onClick={() => navigate(`/admin/atendimentos/${attendance.id}/editar`)}
                >
                  <FaEdit />
                </ActionButton>
                
                <ActionButton
                  className="whatsapp"
                  title="WhatsApp"
                  onClick={() => handleWhatsApp(attendance.client.phone)}
                >
                  <FaWhatsapp />
                </ActionButton>
              </ActionButtons>
            </AttendanceRow>
          ))
        )}
      </AttendancesContainer>
    </Container>
  );
};

export default AttendanceManagementPage;
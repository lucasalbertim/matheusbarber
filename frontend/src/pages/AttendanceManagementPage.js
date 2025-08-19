import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaEye, FaEdit, FaWhatsapp, FaSort, FaSortUp, FaSortDown, FaMoneyBillWave, FaCreditCard, FaQrcode } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }
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

  @media (max-width: 768px) {
    padding: 15px;
    
    .number {
      font-size: 1.5rem;
      margin-bottom: 5px;
    }
    
    .label {
      font-size: 14px;
    }
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
  }
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
    background: #20AC9F; // Alterado para a nova cor
    color: white;
    border-color: #20AC9F; // Alterado para a nova cor
  }

  &:hover {
    border-color: var(--primary);
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 14px;
    flex: 1;
    min-width: 0;
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

  @media (max-width: 768px) {
    display: none;
  }
`;

const SortableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.3s;
  
  &:hover {
    opacity: 0.8;
  }
  
  .sort-icon {
    font-size: 12px;
    opacity: 0.7;
  }
  
  &.active .sort-icon {
    opacity: 1;
  }
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

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 15px;
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-bottom: 15px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const AttendanceNumber = styled.div`
  font-weight: 700;
  color: var(--primary);
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    text-align: center;
    padding: 8px;
    background: var(--primary);
    color: white;
    border-radius: 20px;
    width: fit-content;
  }
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

  @media (max-width: 768px) {
    .name {
      font-size: 1.1rem;
      margin-bottom: 8px;
    }
    
    .details {
      font-size: 0.9rem;
    }
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

  @media (max-width: 768px) {
    .service {
      padding: 8px 12px;
      margin-bottom: 6px;
      font-size: 13px;
      border-radius: 6px;
    }
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

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
    width: fit-content;
  }
`;

const PaymentBadge = styled.span`
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.pending {
    background: var(--warning-light);
    color: var(--warning);
  }

  &.paid {
    background: rgba(32, 172, 159, 0.1); // Alterado para a nova cor
    color: #20AC9F; // Alterado para a nova cor
  }

  &.cancelled {
    background: var(--error-light);
    color: var(--error);
  }

  svg {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
    width: fit-content;
    min-width: auto;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
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

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 14px;
    min-width: 44px;
    min-height: 44px;
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
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
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
    
    fetchAttendances();
    const id = setInterval(fetchAttendances, 5000);
    return () => clearInterval(id);
  }, [isAdmin, navigate]);

  useEffect(() => {
    const filterAttendances = () => {
      let filtered;
      if (activeFilter === 'all') {
        filtered = attendances;
      } else {
        filtered = attendances.filter(attendance => 
          attendance.status === activeFilter
        );
      }
      
      // Aplicar ordenação
      const sorted = sortAttendances(filtered, sortField, sortDirection);
      setFilteredAttendances(sorted);
    };
    
    filterAttendances();
  }, [activeFilter, attendances, sortField, sortDirection]);

  const calculateStats = (data) => {
    const total = data.length;
    const waiting = data.filter(a => a.status === 'waiting').length;
    const progress = data.filter(a => a.status === 'progress').length;
    const finished = data.filter(a => a.status === 'finished').length;

    setStats({ total, waiting, progress, finished });
  };

  const sortAttendances = (data, field, direction) => {
    return [...data].sort((a, b) => {
      let aValue, bValue;
      
      switch (field) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'client':
          aValue = a.client.name.toLowerCase();
          bValue = b.client.name.toLowerCase();
          break;
        case 'services':
          aValue = a.services.length;
          bValue = b.services.length;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'payment':
          aValue = a.payment_status;
          bValue = a.payment_status;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="sort-icon" />;
    }
    return sortDirection === 'asc' ? 
      <FaSortUp className="sort-icon" /> : 
      <FaSortDown className="sort-icon" />;
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

  const getPaymentMethodIcon = (paymentMethod) => {
    switch (paymentMethod?.toLowerCase()) {
      case 'dinheiro':
      case 'cash':
        return <FaMoneyBillWave style={{ color: '#28a745' }} />;
      case 'cartão':
      case 'card':
      case 'credit':
      case 'debit':
        return <FaCreditCard style={{ color: '#007bff' }} />;
      case 'pix':
        return <FaQrcode style={{ color: '#6f42c1' }} />;
      default:
        return null;
    }
  };

  const advanceStatus = async (attendance) => {
    const next = attendance.status === 'waiting' ? 'progress' : attendance.status === 'progress' ? 'finished' : 'finished';
    try {
      const { data } = await api.put(`/attendance/${attendance.id}`, { status: next });
      toast.success('Status atualizado');
      // Atualiza lista
      const updated = attendances.map(a => (a.id === attendance.id ? data : a));
      setAttendances(updated);
      calculateStats(updated);
    } catch (e) {
      toast.error('Erro ao atualizar status');
    }
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
          <SortableHeader 
            className={sortField === 'id' ? 'active' : ''}
            onClick={() => handleSort('id')}
          >
            Número {getSortIcon('id')}
          </SortableHeader>
          <SortableHeader 
            className={sortField === 'client' ? 'active' : ''}
            onClick={() => handleSort('client')}
          >
            Cliente {getSortIcon('client')}
          </SortableHeader>
          <SortableHeader 
            className={sortField === 'services' ? 'active' : ''}
            onClick={() => handleSort('services')}
          >
            Serviços {getSortIcon('services')}
          </SortableHeader>
          <SortableHeader 
            className={sortField === 'status' ? 'active' : ''}
            onClick={() => handleSort('status')}
          >
            Status {getSortIcon('status')}
          </SortableHeader>
          <SortableHeader 
            className={sortField === 'payment' ? 'active' : ''}
            onClick={() => handleSort('payment')}
          >
            Pagamento {getSortIcon('payment')}
          </SortableHeader>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getPaymentMethodIcon(attendance.payment_method)}
                  <span>{getPaymentLabel(attendance.payment_status)}</span>
                </div>
              </PaymentBadge>
              
              <ActionButtons>
                {attendance.status !== 'finished' && (
                  <ActionButton
                    className="edit"
                    title={attendance.status === 'waiting' ? 'Colocar em Atendimento' : 'Finalizar Atendimento'}
                    onClick={() => advanceStatus(attendance)}
                  >
                    {attendance.status === 'waiting' ? 'Iniciar' : 'Finalizar'}
                  </ActionButton>
                )}
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
      <Footer />
    </Container>
  );
};

export default AttendanceManagementPage;
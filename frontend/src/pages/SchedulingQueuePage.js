import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
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
  &:hover { color: var(--primary); }
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

const FilterInput = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  font-size: 16px;
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const ClientInfo = styled.div`
  font-weight: 600;
  color: var(--primary-dark);
`;

const ServiceList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  .service {
    background: var(--background);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 14px;
    color: var(--text);
  }
`;

const TimeBadge = styled.span`
  background: var(--info-light);
  color: var(--info);
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 15px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
`;

const SchedulingQueuePage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const startDate = `${selectedDate}T00:00:00`;
        const endDate = `${selectedDate}T23:59:59`;
        const response = await api.get(`/admin/attendance/scheduled?start_date=${startDate}&end_date=${endDate}`);
        setAppointments(response.data);
      } catch (error) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [selectedDate]);

  return (
    <Container>
      <Header>
        <Title>
          <FaCalendarAlt style={{ marginRight: 8 }} /> Fila de Agendamentos
        </Title>
        <BackButton onClick={() => navigate('/admin/dashboard')}>
          <FaArrowLeft /> Voltar ao Dashboard
        </BackButton>
      </Header>

      <FilterBar>
        <label style={{ fontWeight: 600 }}>Filtrar por dia:</label>
        <FilterInput
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </FilterBar>

      {loading ? (
        <EmptyState>Carregando agendamentos...</EmptyState>
      ) : appointments.length === 0 ? (
        <EmptyState>Nenhum agendamento encontrado para o dia selecionado.</EmptyState>
      ) : (
        appointments.map(appointment => (
          <Card key={appointment.id}>
            <ClientInfo>
              Cliente: {appointment.client?.name || 'N/A'}<br />
              Telefone: {appointment.client?.phone || 'N/A'}
            </ClientInfo>
            <div>
              <TimeBadge>
                Horário: {dayjs(appointment.appointment_date).format('HH:mm')}
              </TimeBadge>
            </div>
            <ServiceList>
              {appointment.services?.map((service, idx) => (
                <span key={idx} className="service">
                  {service.name} - R$ {service.price}
                </span>
              ))}
            </ServiceList>
          </Card>
        ))
      )}
      <Footer />
    </Container>
  );
};

export default SchedulingQueuePage;

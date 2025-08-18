import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaClock, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background) 0%, #f8f9fa 100%);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
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
  padding: 8px 12px;
  border-radius: 8px;

  &:hover {
    color: var(--primary);
    background: rgba(0, 0, 0, 0.05);
  }
`;

const Title = styled.h1`
  color: var(--primary);
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: var(--text-light);
  margin: 0;
  font-size: 1.1rem;
`;

const SummaryCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const ServicesList = styled.div`
  margin-bottom: 30px;
`;

const ServiceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--background);
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ServiceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ServiceIcon = styled.div`
  width: 40px;
  height: 40px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
`;

const ServiceDetails = styled.div`
  .service-name {
    font-weight: 600;
    color: var(--text);
    font-size: 1.1rem;
    margin-bottom: 4px;
  }

  .service-duration {
    color: var(--text-light);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

const ServicePrice = styled.div`
  font-weight: 700;
  color: var(--primary);
  font-size: 1.2rem;
`;

const TotalsSection = styled.div`
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 12px;
  padding: 25px;
  color: white;
  margin-bottom: 30px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 1.3rem;
    font-weight: 700;
  }
`;

const TotalLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
`;

const TotalValue = styled.div`
  font-weight: 700;
`;

const Actions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  justify-content: center;

  &.primary {
    background: var(--primary);
    color: white;

    &:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
  }

  &.secondary {
    background: var(--background);
    color: var(--text);
    border: 2px solid var(--border);

    &:hover {
      background: var(--border);
      transform: translateY(-2px);
    }
  }
`;

const ClientAttendanceSummaryPage = () => {
  const { client } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [totals, setTotals] = useState({ totalPrice: 0, totalMinutes: 0 });

  useEffect(() => {
    if (!client) { 
      navigate('/cliente/login'); 
      return; 
    }
    
    const selRaw = sessionStorage.getItem('attendance_selection');
    if (!selRaw) { 
      navigate('/cliente/atendimento/iniciar'); 
      return; 
    }
    
    const sel = JSON.parse(selRaw);
    const load = async () => {
      try {
        const { data } = await api.get('/services/');
        const chosen = data.filter(s => sel.service_ids.includes(s.id));
        setServices(chosen);
        setTotals({ totalPrice: sel.totalPrice, totalMinutes: sel.totalMinutes });
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        navigate('/cliente/atendimento/iniciar');
      }
    };
    load();
  }, [client, navigate]);

  const handleBack = () => {
    navigate('/cliente/atendimento/iniciar');
  };

  const handleNext = () => {
    navigate('/cliente/atendimento/pagamento');
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
          Voltar
        </BackButton>
        <div>
          <Title>Resumo do Atendimento</Title>
          <Subtitle>Confira os serviços escolhidos antes de prosseguir</Subtitle>
        </div>
      </Header>

      <SummaryCard>
        <ServicesList>
          <h3 style={{ marginBottom: '20px', color: 'var(--text)', fontSize: '1.3rem' }}>
            Serviços Selecionados
          </h3>
          {services.map((service, index) => (
            <ServiceItem key={service.id}>
              <ServiceInfo>
                <ServiceIcon>
                  {index + 1}
                </ServiceIcon>
                <ServiceDetails>
                  <div className="service-name">{service.name}</div>
                  <div className="service-duration">
                    <FaClock />
                    {formatDuration(service.duration_minutes)}
                  </div>
                </ServiceDetails>
              </ServiceInfo>
              <ServicePrice>
                R$ {service.price.toFixed(2)}
              </ServicePrice>
            </ServiceItem>
          ))}
        </ServicesList>

        <TotalsSection>
          <TotalRow>
            <TotalLabel>
              <FaClock />
              Tempo Total
            </TotalLabel>
            <TotalValue>{formatDuration(totals.totalMinutes)}</TotalValue>
          </TotalRow>
          <TotalRow>
            <TotalLabel>
              <FaMoneyBillWave />
              Valor Total
            </TotalLabel>
            <TotalValue>R$ {totals.totalPrice.toFixed(2)}</TotalValue>
          </TotalRow>
        </TotalsSection>
      </SummaryCard>

      <Actions>
        <Button className="secondary" onClick={handleBack}>
          <FaArrowLeft />
          Voltar
        </Button>
        <Button className="primary" onClick={handleNext}>
          <FaCreditCard />
          Ir para Pagamento
        </Button>
      </Actions>
    </Container>
  );
};

export default ClientAttendanceSummaryPage;


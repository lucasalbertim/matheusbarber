import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaClock, FaMoneyBillWave, FaCut, FaCheck } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Footer from '../components/Footer';

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

const ServicesCard = styled.div`
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
  padding: 20px;
  background: ${props => props.selected ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : 'var(--background)'};
  border-radius: 16px;
  margin-bottom: 16px;
  border: 2px solid ${props => props.selected ? 'var(--primary)' : 'rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.selected ? 'var(--primary)' : 'var(--primary)'};
  }

  &:last-child {
    margin-bottom: 0;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.selected ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const ServiceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
`;

const ServiceIcon = styled.div`
  width: 50px;
  height: 50px;
  background: ${props => props.selected ? 'rgba(255, 255, 255, 0.2)' : 'var(--primary)'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.selected ? 'white' : 'white'};
  font-size: 20px;
  transition: all 0.3s ease;
`;

const ServiceDetails = styled.div`
  flex: 1;
  
  .service-name {
    font-weight: 700;
    color: ${props => props.selected ? 'white' : 'var(--text)'};
    font-size: 1.2rem;
    margin-bottom: 8px;
    transition: color 0.3s ease;
  }

  .service-info {
    color: ${props => props.selected ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-light)'};
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: color 0.3s ease;
  }
`;

const ServicePrice = styled.div`
  font-weight: 700;
  color: ${props => props.selected ? 'white' : 'var(--primary)'};
  font-size: 1.3rem;
  transition: color 0.3s ease;
`;

const SelectionIndicator = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? 'white' : 'var(--border)'};
  background: ${props => props.selected ? 'white' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-left: 20px;

  svg {
    color: var(--primary);
    font-size: 12px;
    opacity: ${props => props.selected ? '1' : '0'};
    transition: opacity 0.3s ease;
  }
`;

const SummarySection = styled.div`
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 16px;
  padding: 25px;
  color: white;
  margin-bottom: 30px;
  text-align: center;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 1.3rem;
  font-weight: 600;
`;

const SummaryInfo = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 20px;
`;

const SummaryItem = styled.div`
  text-align: center;
  
  .label {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 5px;
  }
  
  .value {
    font-size: 1.4rem;
    font-weight: 700;
  }
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ClientStartAttendancePage = () => {
  const { client } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) { navigate('/cliente/login'); return; }
    
    const load = async () => {
      try {
        const { data } = await api.get('/services/');
        setServices(data);
      } catch (e) {
        toast.error('Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };
    
    load();
    
    // Controle de navegação do navegador - logout automático ao tentar voltar
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    
    const handlePopState = (event) => {
      event.preventDefault();
      // Redireciona para o dashboard em vez de fazer logout direto
      navigate('/cliente/dashboard');
    };
    
    // Adiciona listeners para controlar a navegação
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // Remove listeners quando o componente for desmontado
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [client, navigate]);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleNext = () => {
    if (selected.length === 0) { toast.warn('Selecione pelo menos um serviço'); return; }
    const chosen = services.filter(s => selected.includes(s.id));
    const totalPrice = chosen.reduce((acc, s) => acc + s.price, 0);
    const totalMinutes = chosen.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    sessionStorage.setItem('attendance_selection', JSON.stringify({ service_ids: selected, totalPrice, totalMinutes }));
    navigate('/cliente/atendimento/resumo');
  };

  const handleBack = () => {
    navigate('/cliente/dashboard');
  };

  const totalPrice = services.filter(s => selected.includes(s.id)).reduce((acc, s) => acc + s.price, 0);
  const totalMinutes = services.filter(s => selected.includes(s.id)).reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Carregando serviços...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
          Voltar
        </BackButton>
        <div>
          <Title>Escolha seus serviços</Title>
          <Subtitle>Selecione um ou mais serviços para seu atendimento</Subtitle>
        </div>
      </Header>

      <ServicesCard>
        <ServicesList>
          {services.map(service => {
            const isSelected = selected.includes(service.id);
            return (
              <ServiceItem 
                key={service.id} 
                selected={isSelected}
                onClick={() => toggle(service.id)}
              >
                <ServiceInfo>
                  <ServiceIcon selected={isSelected}>
                    <FaCut />
                  </ServiceIcon>
                  <ServiceDetails selected={isSelected}>
                    <div className="service-name">{service.name}</div>
                    <div className="service-info">
                      <FaClock />
                      {service.duration_minutes} min
                    </div>
                  </ServiceDetails>
                </ServiceInfo>
                
                <ServicePrice selected={isSelected}>
                  R$ {service.price.toFixed(2)}
                </ServicePrice>
                
                <SelectionIndicator selected={isSelected}>
                  <FaCheck />
                </SelectionIndicator>
              </ServiceItem>
            );
          })}
        </ServicesList>
      </ServicesCard>

      {selected.length > 0 && (
        <SummarySection>
          <SummaryTitle>Resumo da Seleção</SummaryTitle>
          <SummaryInfo>
            <SummaryItem>
              <div className="label">Serviços</div>
              <div className="value">{selected.length}</div>
            </SummaryItem>
            <SummaryItem>
              <div className="label">Tempo Total</div>
              <div className="value">{totalMinutes} min</div>
            </SummaryItem>
            <SummaryItem>
              <div className="label">Valor Total</div>
              <div className="value">R$ {totalPrice.toFixed(2)}</div>
            </SummaryItem>
          </SummaryInfo>
        </SummarySection>
      )}

      <Actions>
        <Button 
          className="secondary" 
          onClick={handleBack}
        >
          <FaArrowLeft />
          Voltar
        </Button>
        <Button 
          className="primary" 
          onClick={handleNext}
          disabled={selected.length === 0}
        >
          <FaMoneyBillWave />
          {selected.length === 0 ? 'Selecione serviços' : 'Avançar'}
        </Button>
      </Actions>
      
      <Footer />
    </Container>
  );
};

export default ClientStartAttendancePage;


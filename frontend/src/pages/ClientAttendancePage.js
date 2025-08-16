import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaCut, FaCreditCard, FaMoneyBillWave, FaQrcode, FaArrowLeft } from 'react-icons/fa';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary) 0%, #2a2a2a 100%);
  padding: 20px;
`;

const Container = styled.div`
  max-width: 800px;
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

const WelcomeCard = styled.div`
  background: var(--surface);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const WelcomeMessage = styled.h2`
  color: var(--text-primary);
  font-size: 1.8rem;
  margin: 0 0 10px 0;
`;

const ClientInfo = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
`;

const ServicesSection = styled.div`
  background: var(--surface);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.5rem;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ServiceCard = styled.div`
  border: 2px solid ${props => props.selected ? 'var(--secondary)' : 'var(--border)'};
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? 'rgba(212, 175, 55, 0.1)' : 'transparent'};
  
  &:hover {
    border-color: var(--secondary);
    transform: translateY(-2px);
  }
`;

const ServiceName = styled.h4`
  color: var(--text-primary);
  font-size: 1.2rem;
  margin: 0 0 10px 0;
`;

const ServicePrice = styled.p`
  color: var(--secondary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`;

const ServiceDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 10px 0 0 0;
`;

const PaymentSection = styled.div`
  background: var(--surface);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const PaymentMethod = styled.div`
  border: 2px solid ${props => props.selected ? 'var(--secondary)' : 'var(--border)'};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  background: ${props => props.selected ? 'rgba(212, 175, 55, 0.1)' : 'transparent'};
  
  &:hover {
    border-color: var(--secondary);
  }
`;

const PaymentIcon = styled.div`
  font-size: 2rem;
  color: var(--secondary);
  margin-bottom: 10px;
`;

const PaymentName = styled.p`
  color: var(--text-primary);
  font-weight: 600;
  margin: 0;
`;

const TotalSection = styled.div`
  background: var(--surface);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid var(--border);
  
  &:last-child {
    border-bottom: none;
    font-weight: 700;
    font-size: 1.2rem;
    color: var(--secondary);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 20px;
  background: var(--secondary);
  color: var(--primary);
  border: none;
  border-radius: 15px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #b8942a;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ClientAttendancePage = () => {
  const navigate = useNavigate();
  const { client, logout } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    { id: 'dinheiro', name: 'Dinheiro', icon: FaMoneyBillWave },
    { id: 'cartao', name: 'Cartão', icon: FaCreditCard },
    { id: 'pix', name: 'PIX', icon: FaQrcode }
  ];

  useEffect(() => {
    if (!client) {
      navigate('/cliente/login');
      return;
    }
    
    fetchServices();
  }, [client, navigate]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/');
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao carregar serviços');
    }
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service ? service.price : 0);
    }, 0);
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      toast.error('Selecione pelo menos um serviço');
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }

    setIsSubmitting(true);

    try {
      const attendanceData = {
        client_id: client.id,
        services: selectedServices,
        payment_method: selectedPaymentMethod,
        status: 'aguardando'
      };

      const response = await api.post('/attendances/', attendanceData);
      
      if (response.status === 201) {
        toast.success('Atendimento agendado com sucesso!');
        
        // Limpar seleções
        setSelectedServices([]);
        setSelectedPaymentMethod('');
        
        // Redirecionar para confirmação ou voltar para home
        navigate('/');
      }
    } catch (error) {
      console.error('Erro ao criar atendimento:', error);
      toast.error('Erro ao agendar atendimento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    // Logout automático ao voltar
    logout();
    navigate('/');
  };

  if (!client) {
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
          <Title>Atendimento</Title>
          <Subtitle>Escolha seus serviços</Subtitle>
        </Header>

        <WelcomeCard>
          <WelcomeMessage>Seja bem-vindo, {client.name}!</WelcomeMessage>
          <ClientInfo>CPF: {client.cpf} • Telefone: {client.phone}</ClientInfo>
        </WelcomeCard>

        <ServicesSection>
          <SectionTitle>
            <FaCut />
            Serviços Disponíveis
          </SectionTitle>
          
          {isLoading ? (
            <p>Carregando serviços...</p>
          ) : (
            <ServicesGrid>
              {services.map(service => (
                <ServiceCard
                  key={service.id}
                  selected={selectedServices.includes(service.id)}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <ServiceName>{service.name}</ServiceName>
                  <ServicePrice>R$ {service.price.toFixed(2)}</ServicePrice>
                  {service.description && (
                    <ServiceDescription>{service.description}</ServiceDescription>
                  )}
                </ServiceCard>
              ))}
            </ServicesGrid>
          )}
        </ServicesSection>

        <PaymentSection>
          <SectionTitle>Forma de Pagamento</SectionTitle>
          <PaymentMethods>
            {paymentMethods.map(method => {
              const Icon = method.icon;
              return (
                <PaymentMethod
                  key={method.id}
                  selected={selectedPaymentMethod === method.id}
                  onClick={() => handlePaymentMethodSelect(method.id)}
                >
                  <PaymentIcon>
                    <Icon />
                  </PaymentIcon>
                  <PaymentName>{method.name}</PaymentName>
                </PaymentMethod>
              );
            })}
          </PaymentMethods>
        </PaymentSection>

        <TotalSection>
          <SectionTitle>Resumo do Pedido</SectionTitle>
          
          {selectedServices.map(serviceId => {
            const service = services.find(s => s.id === serviceId);
            return service ? (
              <TotalRow key={service.id}>
                <span>{service.name}</span>
                <span>R$ {service.price.toFixed(2)}</span>
              </TotalRow>
            ) : null;
          })}
          
          <TotalRow>
            <span>Total</span>
            <span>R$ {calculateTotal().toFixed(2)}</span>
          </TotalRow>
        </TotalSection>

        <SubmitButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Agendando...' : 'Confirmar Atendimento'}
        </SubmitButton>
      </Container>
    </PageContainer>
  );
};

export default ClientAttendancePage;
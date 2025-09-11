import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaCut, FaCheck, FaCreditCard, FaUsers, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { Button, Card, Input, Loading } from '../components';
import { formatCurrency, formatDuration } from '../utils';

const Container = styled.div`
  max-width: 800px;
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

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  
  .step {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &.active {
      background: var(--primary);
      color: white;
    }
    
    &.completed {
      background: var(--success);
      color: white;
    }
    
    &.pending {
      background: var(--surface);
      color: var(--text-secondary);
      border: 2px solid var(--border);
    }
  }
  
  .step-connector {
    width: 40px;
    height: 2px;
    background: var(--border);
    margin: 0 10px;
    
    &.completed {
      background: var(--success);
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    
    .step-connector {
      width: 2px;
      height: 20px;
    }
  }
`;

const ServiceSelection = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
  
  h3 {
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }
`;

const ServiceCard = styled.div`
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.selected {
    border-color: var(--primary);
    background: rgba(32, 172, 159, 0.05);
    box-shadow: 0 4px 12px rgba(32, 172, 159, 0.2);
  }
  
  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  .service-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  .service-name {
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--text);
  }
  
  .service-price {
    font-weight: 700;
    color: var(--primary);
    font-size: 1.2rem;
  }
  
  .service-description {
    color: var(--text-secondary);
    margin-bottom: 12px;
    font-size: 0.9rem;
  }
  
  .service-duration {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`;

const PaymentSelection = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
  
  h3 {
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .payment-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
`;

const PaymentOption = styled.div`
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  &.selected {
    border-color: var(--primary);
    background: rgba(32, 172, 159, 0.05);
    box-shadow: 0 4px 12px rgba(32, 172, 159, 0.2);
  }
  
  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  .payment-icon {
    font-size: 2rem;
    color: var(--primary);
    margin-bottom: 12px;
  }
  
  .payment-name {
    font-weight: 600;
    color: var(--text);
    font-size: 1.1rem;
  }
`;

const Summary = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
  
  h3 {
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    
    &:last-child {
      border-bottom: none;
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--primary);
    }
  }
  
  .summary-label {
    color: var(--text-secondary);
  }
  
  .summary-value {
    font-weight: 600;
    color: var(--text);
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ClientPresentialAttendancePage = () => {
  const navigate = useNavigate();
  const { client } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { id: 1, name: 'Serviços', icon: FaCut },
    { id: 2, name: 'Pagamento', icon: FaCreditCard },
    { id: 3, name: 'Resumo', icon: FaCheck }
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Dinheiro', icon: '💵' },
    { id: 'card', name: 'Cartão', icon: '💳' },
    { id: 'pix', name: 'PIX', icon: '📱' }
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
      setLoading(true);
      const response = await api.get('/services/');
      setServices(response.data.filter(service => service.is_active));
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handlePaymentSelect = (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setCurrentStep(3);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const calculateTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + service.duration_minutes, 0);
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0 || !selectedPaymentMethod) {
      toast.error('Por favor, complete todas as etapas');
      return;
    }

    try {
      setSubmitting(true);
      
      const attendanceData = {
        client_id: client.id,
        service_ids: selectedServices.map(s => s.id),
        appointment_date: new Date().toISOString(),
        payment_method: selectedPaymentMethod.id,
        attendance_type: 'presential'
      };
      
      const response = await api.post('/attendance/', attendanceData);
      
      toast.success('Atendimento iniciado com sucesso!');
      navigate('/cliente/atendimento/fila', { 
        state: { 
          attendance: response.data.attendance,
          queuePosition: response.data.queue_position
        } 
      });
      
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      toast.error('Erro ao iniciar atendimento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading text="Carregando serviços..." />
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
          Iniciar Atendimento
        </h1>
        <p>Selecione os serviços e forma de pagamento para entrar na fila</p>
      </Header>

      <StepIndicator>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`step ${currentStep === step.id ? 'active' : currentStep > step.id ? 'completed' : 'pending'}`}>
              <step.icon />
              {step.name}
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${currentStep > step.id ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </StepIndicator>

      {currentStep === 1 && (
        <ServiceSelection>
          <h3>
            <FaCut />
            Escolha os Serviços
          </h3>
          <div className="services-grid">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                className={selectedServices.some(s => s.id === service.id) ? 'selected' : ''}
                onClick={() => handleServiceToggle(service)}
              >
                <div className="service-header">
                  <div className="service-name">{service.name}</div>
                  <div className="service-price">{formatCurrency(service.price)}</div>
                </div>
                <div className="service-description">{service.description}</div>
                <div className="service-duration">
                  <FaClock />
                  {formatDuration(service.duration_minutes)}
                </div>
              </ServiceCard>
            ))}
          </div>
        </ServiceSelection>
      )}

      {currentStep === 2 && (
        <PaymentSelection>
          <h3>
            <FaCreditCard />
            Escolha a Forma de Pagamento
          </h3>
          <div className="payment-options">
            {paymentMethods.map(payment => (
              <PaymentOption
                key={payment.id}
                className={selectedPaymentMethod?.id === payment.id ? 'selected' : ''}
                onClick={() => handlePaymentSelect(payment)}
              >
                <div className="payment-icon">{payment.icon}</div>
                <div className="payment-name">{payment.name}</div>
              </PaymentOption>
            ))}
          </div>
        </PaymentSelection>
      )}

      {currentStep === 3 && selectedServices.length > 0 && selectedPaymentMethod && (
        <Summary>
          <h3>
            <FaCheck />
            Resumo do Atendimento
          </h3>
          
          {selectedServices.map(service => (
            <div key={service.id} className="summary-item">
              <span className="summary-label">{service.name}</span>
              <span className="summary-value">{formatCurrency(service.price)}</span>
            </div>
          ))}
          
          <div className="summary-item">
            <span className="summary-label">Forma de Pagamento:</span>
            <span className="summary-value">{selectedPaymentMethod.name}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Duração Total:</span>
            <span className="summary-value">{formatDuration(calculateTotalDuration())}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Total:</span>
            <span className="summary-value">{formatCurrency(calculateTotal())}</span>
          </div>
        </Summary>
      )}

      <NavigationButtons>
        {currentStep > 1 && (
          <Button variant="ghost" onClick={handlePreviousStep}>
            Voltar
          </Button>
        )}
        
        {currentStep < 3 ? (
          <Button 
            variant="primary" 
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && selectedServices.length === 0) ||
              (currentStep === 2 && !selectedPaymentMethod)
            }
          >
            Próximo
          </Button>
        ) : (
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={submitting}
            fullWidth
          >
            {submitting ? 'Iniciando...' : 'Iniciar Atendimento'}
          </Button>
        )}
      </NavigationButtons>

      <Footer />
    </Container>
  );
};

export default ClientPresentialAttendancePage;
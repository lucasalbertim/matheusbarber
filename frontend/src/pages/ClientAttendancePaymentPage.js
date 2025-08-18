import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaMoneyBillWave, FaCreditCard, FaQrcode, FaCheckCircle, FaLock } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { getRecifeDateTime } from '../utils/dateUtils';

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

const PaymentCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const OrderSummary = styled.div`
  background: var(--background);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 15px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    font-weight: 700;
    font-size: 1.2rem;
    color: var(--primary);
  }
`;

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const PaymentMethod = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 25px 20px;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;

  &:hover {
    border-color: var(--primary);
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: var(--primary);
    background: var(--primary);
    color: white;

    .method-icon {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const MethodIcon = styled.div`
  width: 50px;
  height: 50px;
  background: var(--background);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--primary);
  transition: all 0.3s ease;
`;

const MethodInfo = styled.div`
  text-align: center;

  .method-name {
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 5px;
  }

  .method-description {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-light);
  font-size: 0.9rem;
  margin-bottom: 30px;
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

    &:disabled {
      background: var(--border);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
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

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ClientAttendancePaymentPage = () => {
  const { client, logoutClient } = useAuth();
  const navigate = useNavigate();
  const [selection, setSelection] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    
    setSelection(JSON.parse(selRaw));
  }, [client, navigate]);

  const handleBack = () => {
    navigate('/cliente/atendimento/resumo');
  };

  const confirmPayment = async () => {
    if (!selectedMethod) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }

    setIsProcessing(true);

    try {
            await api.post('/attendance/', {
        client_id: client.id,
        appointment_date: getRecifeDateTime(),
        payment_method: selectedMethod,
        notes: null,
        service_ids: selection.service_ids,
      });
      
      toast.success('Pagamento confirmado! Atendimento criado com sucesso.');
      
      // Aguardar um pouco para o usuário ver a mensagem
      setTimeout(() => {
        sessionStorage.removeItem('attendance_selection');
        logoutClient();
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao confirmar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Dinheiro',
      description: 'Pagamento em espécie',
      icon: FaMoneyBillWave
    },
    {
      id: 'card',
      name: 'Cartão',
      description: 'Débito ou crédito',
      icon: FaCreditCard
    },
    {
      id: 'pix',
      name: 'PIX',
      description: 'Transferência instantânea',
      icon: FaQrcode
    }
  ];

  if (!selection) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>Carregando...</h3>
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
          <Title>Pagamento</Title>
          <Subtitle>Escolha a forma de pagamento para concluir seu atendimento</Subtitle>
        </div>
      </Header>

      <PaymentCard>
        <OrderSummary>
          <h3 style={{ marginBottom: '20px', color: 'var(--text)', fontSize: '1.3rem' }}>
            Resumo do Pedido
          </h3>
          <SummaryRow>
            <span>Quantidade de serviços:</span>
            <span>{selection.service_ids.length}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Valor total:</span>
            <span>R$ {selection.totalPrice.toFixed(2)}</span>
          </SummaryRow>
        </OrderSummary>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text)', fontSize: '1.3rem' }}>
            Forma de Pagamento
          </h3>
        </div>

        <PaymentMethods>
          {paymentMethods.map((method) => (
            <PaymentMethod
              key={method.id}
              className={selectedMethod === method.id ? 'selected' : ''}
              onClick={() => setSelectedMethod(method.id)}
            >
              <MethodIcon className="method-icon">
                <method.icon />
              </MethodIcon>
              <MethodInfo>
                <div className="method-name">{method.name}</div>
                <div className="method-description">{method.description}</div>
              </MethodInfo>
            </PaymentMethod>
          ))}
        </PaymentMethods>

        <SecurityInfo>
          <FaLock />
          <span>Pagamento seguro e simulado</span>
        </SecurityInfo>
      </PaymentCard>

      <Actions>
        <Button className="secondary" onClick={handleBack}>
          <FaArrowLeft />
          Voltar
        </Button>
        <Button 
          className="primary" 
          onClick={confirmPayment}
          disabled={!selectedMethod || isProcessing}
        >
          {isProcessing ? (
            <>
              <LoadingSpinner />
              Processando...
            </>
          ) : (
            <>
              <FaCheckCircle />
              Confirmar Pagamento
            </>
          )}
        </Button>
      </Actions>
    </Container>
  );
};

export default ClientAttendancePaymentPage;


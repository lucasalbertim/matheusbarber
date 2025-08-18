import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  color: var(--primary);
  margin-bottom: 20px;
`;

const Methods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const Button = styled.button`
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  background: var(--primary);
  color: var(--accent);
`;

const ClientAttendancePaymentPage = () => {
  const { client, logoutClient } = useAuth();
  const navigate = useNavigate();
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    if (!client) { navigate('/cliente/login'); return; }
    const selRaw = sessionStorage.getItem('attendance_selection');
    if (!selRaw) { navigate('/cliente/atendimento/iniciar'); return; }
    setSelection(JSON.parse(selRaw));
  }, [client, navigate]);

  const confirmPayment = async (method) => {
    try {
      const now = new Date().toISOString();
      await api.post('/attendance/', {
        client_id: client.id,
        appointment_date: now,
        payment_method: method,
        notes: null,
        service_ids: selection.service_ids,
      });
      toast.success('Pagamento confirmado! Atendimento criado.');
    } catch (e) {
      toast.error('Erro ao confirmar pagamento');
    } finally {
      // Encerrar sessão do cliente conforme solicitado
      sessionStorage.removeItem('attendance_selection');
      logoutClient();
      navigate('/');
    }
  };

  if (!selection) return <Container>Carregando...</Container>;

  return (
    <Container>
      <Title>Pagamento</Title>
      <p>Escolha a forma de pagamento para concluir.</p>
      <Methods>
        <Button onClick={() => confirmPayment('cash')}>Dinheiro</Button>
        <Button onClick={() => confirmPayment('card')}>Cartão</Button>
        <Button onClick={() => confirmPayment('pix')}>PIX</Button>
      </Methods>
    </Container>
  );
};

export default ClientAttendancePaymentPage;


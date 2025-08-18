import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  color: var(--primary);
  margin-bottom: 20px;
`;

const List = styled.ul`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 16px;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  background: var(--primary);
  color: var(--accent);
`;

const ClientAttendanceSummaryPage = () => {
  const { client } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [totals, setTotals] = useState({ totalPrice: 0, totalMinutes: 0 });

  useEffect(() => {
    if (!client) { navigate('/cliente/login'); return; }
    const selRaw = sessionStorage.getItem('attendance_selection');
    if (!selRaw) { navigate('/cliente/atendimento/iniciar'); return; }
    const sel = JSON.parse(selRaw);
    const load = async () => {
      const { data } = await api.get('/services/');
      const chosen = data.filter(s => sel.service_ids.includes(s.id));
      setServices(chosen);
      setTotals({ totalPrice: sel.totalPrice, totalMinutes: sel.totalMinutes });
    };
    load();
  }, [client, navigate]);

  const handleNext = () => navigate('/cliente/atendimento/pagamento');

  return (
    <Container>
      <Title>Resumo do Atendimento</Title>
      <List>
        {services.map(s => (
          <li key={s.id}>{s.name} — R$ {s.price.toFixed(2)} — {s.duration_minutes} min</li>
        ))}
      </List>
      <p style={{ marginTop: 12 }}>Tempo total: {totals.totalMinutes} min</p>
      <p>Valor total: R$ {totals.totalPrice.toFixed(2)}</p>
      <Actions>
        <Button onClick={handleNext}>Ir para Pagamento</Button>
      </Actions>
    </Container>
  );
};

export default ClientAttendanceSummaryPage;


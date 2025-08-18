import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  color: var(--primary);
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 20px;
`;

const ServiceList = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 16px;
`;

const ServiceItem = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding: 12px 8px;

  &:last-child { border-bottom: none; }
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

  if (loading) return <Container>Carregando...</Container>;

  return (
    <Container>
      <Title>Escolha seus serviços</Title>
      <Subtitle>Selecione um ou mais serviços para seu atendimento.</Subtitle>
      <ServiceList>
        {services.map(s => (
          <ServiceItem key={s.id}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
              <div style={{ fontSize: 14, color: 'var(--text-light)' }}>R$ {s.price.toFixed(2)} • {s.duration_minutes} min</div>
            </div>
            <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
          </ServiceItem>
        ))}
      </ServiceList>
      <Actions>
        <Button onClick={handleNext}>Avançar</Button>
      </Actions>
    </Container>
  );
};

export default ClientStartAttendancePage;


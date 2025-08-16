import React from 'react';
import styled from 'styled-components';
import { FaCut, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--background);
  padding: 20px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--background);
  color: var(--text-primary);
  border: 2px solid var(--border);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 30px;
  
  &:hover {
    background: var(--primary);
    color: var(--accent);
    border-color: var(--primary);
  }
`;

const ContentCard = styled.div`
  background: var(--surface);
  border-radius: 20px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Icon = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--secondary) 0%, #e6c200 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: var(--primary);
  margin: 0 auto 30px;
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 30px;
`;

const AttendanceManagementPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Container>
        <BackButton onClick={() => navigate('/admin/dashboard')}>
          <FaArrowLeft />
          Voltar ao Dashboard
        </BackButton>
        
        <ContentCard>
          <Icon>
            <FaCut />
          </Icon>
          <Title>Gestão de Atendimentos</Title>
          <Description>
            Esta funcionalidade será implementada em breve. Aqui você poderá:
            <br />
            • Visualizar atendimentos do dia em tempo real
            <br />
            • Controlar status dos atendimentos
            <br />
            • Gerenciar agendamentos
            <br />
            • Acompanhar pagamentos
            <br />
            • Enviar notificações via WhatsApp
          </Description>
        </ContentCard>
      </Container>
    </PageContainer>
  );
};

export default AttendanceManagementPage;
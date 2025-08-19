import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaCalendar, FaCut, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

import api from '../services/api';

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

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #20AC9F 0%, #2d2d2d 100%);
  color: var(--accent);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  margin-bottom: 40px;

  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin: 0 auto 20px;
    box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 1.2rem;
    opacity: 0.9;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const DashboardCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    
    .icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #20AC9F 0%, #A3E4DB 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: var(--primary);
    }
    
    h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--primary);
      margin: 0;
    }
  }
  
  .card-content {
    p {
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .label {
        color: var(--text-secondary);
        font-weight: 500;
      }
      
      .value {
        color: var(--primary);
        font-weight: 600;
      }
      
      .attendance-item {
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .attendance-header {
          margin-bottom: 8px;
          
          .attendance-date {
            color: var(--primary);
            font-size: 0.9rem;
            
            strong {
              font-weight: 700;
            }
          }
        }
        
        .attendance-services {
          .service-item {
            padding: 2px 0;
            
            .service-name {
              color: var(--text-secondary);
              font-size: 0.85rem;
            }
          }
        }
      }
    }
  }
`;

const ClientDashboardPage = () => {
  const { client, logoutClient } = useAuth();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) {
      navigate('/cliente/login');
      return;
    }
    
    const fetchAttendances = async () => {
      try {
        const response = await api.get(`/clients/${client.id}/attendances`);
        setAttendances(response.data);
      } catch (error) {
        console.error('Erro ao buscar atendimentos:', error);
        setAttendances([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendances();
  }, [client, navigate]);



  const handleLogout = () => {
    logoutClient();
    navigate('/');
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <div className="loading">
            <div className="spinner"></div>
            Carregando...
          </div>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <BackButton onClick={handleLogout}>
          <FaArrowLeft />
          Sair da Conta
        </BackButton>
        
        <WelcomeSection>
          <img src="/logo.jpeg" alt="Matheus Barber Logo" />
          <h1>Bem-vindo, {client.name}!</h1>
          <p>Gerencie seu perfil e visualize seus atendimentos</p>
        </WelcomeSection>
        
        <DashboardGrid>
          <DashboardCard>
            <div className="card-header">
              <div className="icon">
                <FaUser />
              </div>
              <h3>Informações Pessoais</h3>
            </div>
            <div className="card-content">
              <div className="info-item">
                <span className="label">Nome:</span>
                <span className="value">{client.name}</span>
              </div>
              <div className="info-item">
                <span className="label">CPF:</span>
                <span className="value">{client.cpf}</span>
              </div>
              <div className="info-item">
                <span className="label">Telefone:</span>
                <span className="value">{client.phone}</span>
              </div>
              {client.email && (
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{client.email}</span>
                </div>
              )}
              <div className="info-item">
                <span className="label">Cliente desde:</span>
                <span className="value">
                  {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard>
            <div className="card-header">
              <div className="icon">
                <FaCut />
              </div>
              <h3>Histórico de Serviços</h3>
            </div>
            <div className="card-content">
              {attendances.length > 0 ? (
                attendances.map((attendance) => (
                  <div key={attendance.id} className="attendance-item">
                    <div className="attendance-header">
                      <span className="attendance-date">
                        <strong>{new Date(attendance.appointment_date).toLocaleDateString('pt-BR')}</strong>
                      </span>
                    </div>
                    <div className="attendance-services">
                      {attendance.services.map((service, index) => (
                        <div key={index} className="service-item">
                          <span className="service-name">• {service.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>Nenhum atendimento encontrado.</p>
              )}
            </div>
          </DashboardCard>
          
          <DashboardCard>
            <div className="card-header">
              <div className="icon">
                <FaCalendar />
              </div>
              <h3>Iniciar Atendimento</h3>
            </div>
            <div className="card-content">
              <p>Selecione serviços e avance até o pagamento para concluir seu atendimento.</p>
              <button className="btn" onClick={() => navigate('/cliente/atendimento/iniciar')}>
                Começar
              </button>
            </div>
          </DashboardCard>
        </DashboardGrid>
      </Container>
    </PageContainer>
  );
};

export default ClientDashboardPage;
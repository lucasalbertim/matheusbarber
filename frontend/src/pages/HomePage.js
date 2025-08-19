import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaUserTie, FaArrowRight, FaCut, FaStar, FaClock } from 'react-icons/fa';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background) 0%, #e9ecef 100%);
`;

const HeroSection = styled.section`
  padding: 80px 20px;
  text-align: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #20AC9F 100%);
  color: var(--accent);
  margin-bottom: 60px;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  
  h1 {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    background: linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 30px;
    opacity: 0.9;
    line-height: 1.6;
  }
`;

const LogoDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;

  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    box-shadow: 0 8px 32px rgba(212, 175, 55, 0.4);
    margin-right: 20px;
  }

  .logo-text {
    text-align: left;
    
    h2 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: var(--title);
    }
    
    span {
      font-size: 1rem;
      opacity: 0.8;
    }
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const OptionsSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 40px;
  margin-bottom: 80px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const OptionCard = styled(Link)`
  display: block;
  background: var(--surface);
  border-radius: 16px;
  padding: 40px;
  text-decoration: none;
  color: var(--text-primary);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border-color: #20AC9F;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    
    .icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, var(--secondary) 0%, #e6c200 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: var(--primary);
    }
    
    .title {
      h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 8px 0;
        color: var(--primary);
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }
  
  .card-content {
    p {
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 24px;
    }
    
    .action {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary);
      font-weight: 600;
      font-size: 1.1rem;
    }
  }
`;

const FeaturesSection = styled.section`
  text-align: center;
  margin-bottom: 80px;
  
  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 50px;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
`;

const FeatureCard = styled.div`
  background: var(--surface);
  padding: 30px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  .icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #20AC9F 0%, #A3E4DB 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: var(--primary);
    margin: 0 auto 20px;
  }
  
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 12px;
  }
  
  p {
    color: var(--text-secondary);
    line-height: 1.5;
  }
`;

const HomePage = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <HeroContent>
          <LogoDisplay>
            <img src="/logo.jpeg" alt="Matheus Barber Logo" />
            <div className="logo-text">
              <h2>Matheus Barber</h2>
              <span>Desde 2018</span>
            </div>
          </LogoDisplay>
          <h1>Sistema de Gerenciamento</h1>
          <p>
            Plataforma completa para gerenciar sua barbearia com eficiência e estilo.
            Controle de clientes, agendamentos e relatórios em tempo real.
          </p>
        </HeroContent>
      </HeroSection>

      <MainContent>
        <OptionsSection>
          <OptionCard to="/cliente/login">
            <div className="card-header">
              <div className="icon">
                <FaUser />
              </div>
              <div className="title">
                <h3>Sou Cliente</h3>
                <p>Acesse sua conta ou cadastre-se</p>
              </div>
            </div>
            <div className="card-content">
              <p>
                Faça login com seu CPF ou telefone para acessar seu perfil, 
                histórico de atendimentos e agendar novos serviços.
              </p>
              <div className="action">
                Acessar <FaArrowRight />
              </div>
            </div>
          </OptionCard>

          <OptionCard to="/admin/login">
            <div className="card-header">
              <div className="icon">
                <FaUserTie />
              </div>
              <div className="title">
                <h3>Sou Administrador</h3>
                <p>Painel de controle da barbearia</p>
              </div>
            </div>
            <div className="card-content">
              <p>
                Acesse o painel administrativo para gerenciar clientes, 
                atendimentos, serviços e visualizar relatórios detalhados.
              </p>
              <div className="action">
                Acessar <FaArrowRight />
              </div>
            </div>
          </OptionCard>
        </OptionsSection>

        <FeaturesSection>
          <h2>Recursos Principais</h2>
          <FeaturesGrid>
            <FeatureCard>
              <div className="icon">
                <FaCut />
              </div>
              <h3>Gestão de Serviços</h3>
              <p>Controle completo dos serviços oferecidos com preços e duração</p>
            </FeatureCard>
            
            <FeatureCard>
              <div className="icon">
                <FaUser />
              </div>
              <h3>Cadastro de Clientes</h3>
              <p>Sistema inteligente de cadastro e identificação de clientes</p>
            </FeatureCard>
            
            <FeatureCard>
              <div className="icon">
                <FaClock />
              </div>
              <h3>Agendamentos</h3>
              <p>Controle de horários e atendimentos em tempo real</p>
            </FeatureCard>
            
            <FeatureCard>
              <div className="icon">
                <FaStar />
              </div>
              <h3>Relatórios</h3>
              <p>Métricas e insights para melhorar o negócio</p>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>
      </MainContent>
    </HomeContainer>
  );
};

export default HomePage;
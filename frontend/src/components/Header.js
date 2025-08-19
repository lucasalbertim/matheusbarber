import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaHome } from 'react-icons/fa';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--surface);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 80px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  }

  .logo-text {
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
      margin: 0;
      line-height: 1.2;
    }

    span {
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--background);
    color: #20AC9F; // Alterado para a nova cor
  }
  
  &.active {
    background-color: #20AC9F; // Alterado para a nova cor
    color: var(--primary);
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: var(--background);
    border-radius: 8px;
    font-weight: 500;
    
    .user-icon {
      color: var(--secondary);
    }
  }
  
  .logout-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: #20AC9F; // Alterado para a nova cor
    color: var(--accent);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #1A8C7F; // Alterado para a nova cor
      transform: translateY(-1px);
    }
  }
`;

const Header = () => {
  const { client, admin, logoutClient, logoutAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (client) {
      logoutClient();
      navigate('/');
    } else if (admin) {
      logoutAdmin();
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <img src="/logo.jpeg" alt="Matheus Barber Logo" />
          <div className="logo-text">
            <h1>Matheus Barber</h1>
            <span>Desde 2018</span>
          </div>
        </Logo>

        <Navigation>
          <NavLink to="/" className={isActive('/') ? 'active' : ''}>
            <FaHome />
            Início
          </NavLink>
          
          {client && (
            <NavLink to="/cliente/dashboard" className={isActive('/cliente/dashboard') ? 'active' : ''}>
              <FaUser />
              Meu Perfil
            </NavLink>
          )}
          
          {admin && (
            <>
              <NavLink to="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/clientes" className={isActive('/admin/clientes') ? 'active' : ''}>
                Clientes
              </NavLink>
              <NavLink to="/admin/atendimentos" className={isActive('/admin/atendimentos') ? 'active' : ''}>
                Atendimentos
              </NavLink>
              <NavLink to="/admin/relatorios" className={isActive('/admin/relatorios') ? 'active' : ''}>
                Relatórios
              </NavLink>
            </>
          )}
        </Navigation>

        {(client || admin) && (
          <UserSection>
            <div className="user-info">
              <FaUser className="user-icon" />
              {client ? client.name : admin.name}
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              Sair
            </button>
          </UserSection>
        )}
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
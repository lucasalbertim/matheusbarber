import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';

// Componentes
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientRegisterPage from './pages/ClientRegisterPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ClientsManagementPage from './pages/ClientsManagementPage';
import AttendanceManagementPage from './pages/AttendanceManagementPage';
import ReportsPage from './pages/ReportsPage';

// Contextos
import { AuthProvider } from './contexts/AuthContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: var(--background);
`;

const MainContent = styled.main`
  padding-top: 80px;
  min-height: calc(100vh - 80px);
`;

function App() {
  return (
    <AuthProvider>
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/cliente/login" element={<ClientLoginPage />} />
            <Route path="/cliente/cadastro" element={<ClientRegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Rotas do cliente */}
            <Route path="/cliente/dashboard" element={<ClientDashboardPage />} />
            
            {/* Rotas do administrador */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/clientes" element={<ClientsManagementPage />} />
            <Route path="/admin/atendimentos" element={<AttendanceManagementPage />} />
            <Route path="/admin/relatorios" element={<ReportsPage />} />
            
            {/* Rota padrão */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </AuthProvider>
  );
}

export default App;
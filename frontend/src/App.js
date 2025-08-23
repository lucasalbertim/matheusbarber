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
import AddClientPage from './pages/AddClientPage';
import EditClientPage from './pages/EditClientPage';
import AttendanceManagementPage from './pages/AttendanceManagementPage';
import ReportsPage from './pages/ReportsPage';
import ClientStartAttendancePage from './pages/ClientStartAttendancePage';
import ClientAttendanceSummaryPage from './pages/ClientAttendanceSummaryPage';
import ClientAttendancePaymentPage from './pages/ClientAttendancePaymentPage';
import ServicesManagementPage from './pages/ServicesManagementPage';

// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: var(--background);
`;

const MainContent = styled.main`
  padding-top: 80px;
  min-height: calc(100vh - 80px);
`;

// Componente para proteger rotas de clientes logados
const ProtectedHomeRoute = () => {
  const { client } = useAuth();
  
  // Se o cliente estiver logado, redireciona para o dashboard
  if (client) {
    return <Navigate to="/cliente/dashboard" replace />;
  }
  
  // Se não estiver logado, permite acesso à página inicial
  return <HomePage />;
};

function App() {
  return (
    <AuthProvider>
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<ProtectedHomeRoute />} />
            <Route path="/cliente/login" element={<ClientLoginPage />} />
            <Route path="/cliente/cadastro" element={<ClientRegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Rotas do cliente */}
            <Route path="/cliente/dashboard" element={<ClientDashboardPage />} />
            <Route path="/cliente/atendimento/iniciar" element={<ClientStartAttendancePage />} />
            <Route path="/cliente/atendimento/resumo" element={<ClientAttendanceSummaryPage />} />
            <Route path="/cliente/atendimento/pagamento" element={<ClientAttendancePaymentPage />} />
            
            {/* Rotas do administrador */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    <Route path="/admin/clientes" element={<ClientsManagementPage />} />
        <Route path="/admin/clientes/novo" element={<AddClientPage />} />
        <Route path="/admin/clientes/:clientId/editar" element={<EditClientPage />} />
        <Route path="/admin/atendimentos" element={<AttendanceManagementPage />} />
        <Route path="/admin/relatorios" element={<ReportsPage />} />
            <Route path="/admin/servicos" element={<ServicesManagementPage />} />
            
            {/* Rota padrão */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </AuthProvider>
  );
}

export default App;
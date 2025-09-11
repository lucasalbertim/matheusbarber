import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import styled from "styled-components";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Estilos globais
import { GlobalStyles, theme } from './styles';

// Componentes
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientRegisterPage from './pages/ClientRegisterPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import ClientAddBirthdateRoute from './pages/ClientAddBirthdateRoute';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSetupPage from './pages/AdminSetupPage';
import ClientsManagementPage from './pages/ClientsManagementPage';
import AddClientPage from './pages/AddClientPage';
import EditClientPage from './pages/EditClientPage';
import AttendanceManagementPage from './pages/AttendanceManagementPage';
import ReportsPage from './pages/ReportsPage';
import ClientStartAttendancePage from './pages/ClientStartAttendancePage';
import ClientPresentialAttendancePage from './pages/ClientPresentialAttendancePage';
import ClientQueuePage from './pages/ClientQueuePage';
import ClientAttendanceSummaryPage from './pages/ClientAttendanceSummaryPage';
import ClientAttendancePaymentPage from './pages/ClientAttendancePaymentPage';
import ServicesManagementPage from './pages/ServicesManagementPage';
import ConfigPage from './pages/ConfigPage';
import QueueManagementPage from './pages/QueueManagementPage';

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
    <ThemeProvider theme={theme}>
      <GlobalStyles />
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
                <Route path="/cliente/add-birthdate" element={<ClientAddBirthdateRoute />} />
              <Route path="/cliente/atendimento/iniciar" element={<ClientStartAttendancePage />} />
              <Route path="/cliente/atendimento/presencial" element={<ClientPresentialAttendancePage />} />
              <Route path="/cliente/atendimento/fila" element={<ClientQueuePage />} />
              <Route path="/cliente/atendimento/resumo" element={<ClientAttendanceSummaryPage />} />
              <Route path="/cliente/atendimento/pagamento" element={<ClientAttendancePaymentPage />} />
              
              {/* Rotas do administrador */}
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/setup" element={<AdminSetupPage />} />
              <Route path="/admin/clientes" element={<ClientsManagementPage />} />
              <Route path="/admin/clientes/novo" element={<AddClientPage />} />
              <Route path="/admin/clientes/:clientId/editar" element={<EditClientPage />} />
              <Route path="/admin/atendimentos" element={<AttendanceManagementPage />} />
              <Route path="/admin/relatorios" element={<ReportsPage />} />
              <Route path="/admin/servicos" element={<ServicesManagementPage />} />
              <Route path="/admin/configuracoes" element={<ConfigPage />} />
              <Route path="/admin/fila" element={<QueueManagementPage />} />
              
              {/* Rota padrão */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainContent>
          
          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AppContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

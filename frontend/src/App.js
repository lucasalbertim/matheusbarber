import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ClientAttendancePage from './pages/ClientAttendancePage';

// Contextos
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      <Router>
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
              <Route path="/cliente/atendimento" element={<ClientAttendancePage />} />
              
              {/* Rotas do administrador */}
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/clientes" element={<ClientsManagementPage />} />
              <Route path="/admin/atendimentos" element={<AttendanceManagementPage />} />
              <Route path="/admin/relatorios" element={<ReportsPage />} />
              
              {/* Redirecionamento padrão */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainContent>
        </AppContainer>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

export default App;
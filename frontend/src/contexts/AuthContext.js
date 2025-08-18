import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há dados salvos no localStorage
    const savedClient = localStorage.getItem('metheus_client');
    const savedAdmin = localStorage.getItem('metheus_admin');
    
    if (savedClient) {
      try {
        setClient(JSON.parse(savedClient));
      } catch (error) {
        localStorage.removeItem('metheus_client');
      }
    }
    
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        localStorage.removeItem('metheus_admin');
      }
    }
    
    setLoading(false);
  }, []);

  const loginClient = (clientData) => {
    setClient(clientData);
    localStorage.setItem('metheus_client', JSON.stringify(clientData));
    toast.success(`Bem-vindo, ${clientData.name}!`);
  };

  const logoutClient = () => {
    setClient(null);
    localStorage.removeItem('metheus_client');
    toast.info('Logout realizado com sucesso');
  };

  const loginAdmin = (adminData, token) => {
    const adminWithToken = { ...adminData, token };
    setAdmin(adminWithToken);
    localStorage.setItem('metheus_admin', JSON.stringify(adminWithToken));
    toast.success(`Bem-vindo, ${adminData.name}!`);
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem('metheus_admin');
    toast.info('Logout realizado com sucesso');
  };

  const updateClient = (updatedClient) => {
    setClient(updatedClient);
    localStorage.setItem('metheus_client', JSON.stringify(updatedClient));
  };

  const updateAdmin = (updatedAdmin) => {
    setAdmin(updatedAdmin);
    localStorage.setItem('metheus_admin', JSON.stringify(updatedAdmin));
  };

  // Funções de verificação de autenticação
  const isAdmin = () => {
    return !!admin && !!admin.token;
  };

  const isClient = () => {
    return !!client;
  };

  const isAuthenticated = () => {
    return isAdmin() || isClient();
  };

  const getCurrentUser = () => {
    if (isAdmin()) return { type: 'admin', data: admin };
    if (isClient()) return { type: 'client', data: client };
    return null;
  };

  const value = {
    client,
    admin,
    loading,
    loginClient,
    logoutClient,
    loginAdmin,
    logoutAdmin,
    updateClient,
    updateAdmin,
    isClient,
    isAdmin,
    isAuthenticated,
    getCurrentUser,
    isClientAuthenticated: !!client,
    isAdminAuthenticated: !!admin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
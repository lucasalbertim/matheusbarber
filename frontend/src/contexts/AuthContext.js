import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há dados salvos no localStorage
    const savedClient = localStorage.getItem('metheus_client');
    const savedAdmin = localStorage.getItem('metheus_admin');
    
    if (savedClient) {
      try {
        setClient(JSON.parse(savedClient));
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
        localStorage.removeItem('metheus_client');
      }
    }
    
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        console.error('Erro ao carregar dados do admin:', error);
        localStorage.removeItem('metheus_admin');
      }
    }
    
    setIsLoading(false);
  }, []);

  const loginClient = async (cpf, phone) => {
    try {
      // Buscar dados do cliente no backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/clients/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpf, phone }),
      });

      if (response.ok) {
        const clientData = await response.json();
        setClient(clientData);
        localStorage.setItem('metheus_client', JSON.stringify(clientData));
        return clientData;
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login do cliente:', error);
      throw error;
    }
  };

  const loginAdmin = async (username, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/admins/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const adminData = await response.json();
        setAdmin(adminData);
        localStorage.setItem('metheus_admin', JSON.stringify(adminData));
        return adminData;
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login do admin:', error);
      throw error;
    }
  };

  const logout = () => {
    setClient(null);
    setAdmin(null);
    localStorage.removeItem('metheus_client');
    localStorage.removeItem('metheus_admin');
  };

  const logoutClient = () => {
    setClient(null);
    localStorage.removeItem('metheus_client');
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem('metheus_admin');
  };

  const isAuthenticated = () => {
    return !!(client || admin);
  };

  const isClient = () => {
    return !!client;
  };

  const isAdmin = () => {
    return !!admin;
  };

  const value = {
    client,
    admin,
    isLoading,
    loginClient,
    loginAdmin,
    logout,
    logoutClient,
    logoutAdmin,
    isAuthenticated,
    isClient,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
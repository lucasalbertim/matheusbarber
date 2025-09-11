import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ClientAddBirthdatePage from './ClientAddBirthdatePage';

const ClientAddBirthdateRoute = () => {
  const { client } = useAuth();

  if (!client) {
    return <Navigate to="/cliente/login" replace />;
  }

  // Só libera dashboard se a data for diferente do valor default
  if (client.data_nascimento && client.data_nascimento !== '1900-01-01') {
    return <Navigate to="/cliente/dashboard" replace />;
  }

  // Senão, pede para adicionar
  return <ClientAddBirthdatePage clientId={client.id} />;
};

export default ClientAddBirthdateRoute;

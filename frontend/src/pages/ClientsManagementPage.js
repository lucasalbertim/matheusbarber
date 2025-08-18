import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaPlus, FaWhatsapp, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { formatCPF, formatPhoneBR } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: var(--primary);
  margin: 0;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: color 0.3s;

  &:hover {
    color: var(--primary);
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: var(--primary-dark);
  }
`;

const ClientsTable = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 120px;
  gap: 20px;
  padding: 20px;
  background: var(--background);
  font-weight: 600;
  color: var(--text);
  border-bottom: 2px solid var(--border);
`;

const ClientRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 120px;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid var(--border);
  align-items: center;

  &:hover {
    background: var(--background);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ClientInfo = styled.div`
  .name {
    font-weight: 600;
    color: var(--text);
    margin-bottom: 4px;
  }

  .details {
    font-size: 14px;
    color: var(--text-light);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &.edit {
    background: var(--warning);
    color: white;

    &:hover {
      background: var(--warning-dark);
    }
  }

  &.delete {
    background: var(--error);
    color: white;

    &:hover {
      background: var(--error-dark);
    }
  }

  &.view {
    background: var(--info);
    color: white;

    &:hover {
      background: var(--info-dark);
    }
  }

  &.whatsapp {
    background: #25D366;
    color: white;

    &:hover {
      background: #128C7E;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);

  h3 {
    margin-bottom: 10px;
    color: var(--text);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
`;

const ClientsManagementPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/login');
      return;
    }
    fetchClients();
  }, [isAdmin, navigate]);

  useEffect(() => {
    const filterClients = () => {
      if (!searchTerm.trim()) {
        setFilteredClients(clients);
        return;
      }

      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cpf.includes(searchTerm) ||
        client.phone.includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClients(filtered);
    };
    
    filterClients();
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/admin/clients/');
      setClients(response.data);
      setFilteredClients(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };



  const handleEditClient = (clientId) => {
    navigate(`/admin/clientes/${clientId}/editar`);
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await api.delete(`/admin/clients/${clientId}`);
      toast.success('Cliente excluído com sucesso');
      fetchClients();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBackClick = () => {
    navigate('/admin/dashboard');
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingState>
          <h3>Carregando clientes...</h3>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gestão de Clientes</Title>
        <BackButton onClick={handleBackClick}>
          <FaArrowLeft />
          Voltar ao Dashboard
        </BackButton>
      </Header>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Buscar por nome, CPF, telefone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <AddButton>
          <FaPlus />
          Novo Cliente
        </AddButton>
      </SearchBar>

      <ClientsTable>
        <TableHeader>
          <div>Nome</div>
          <div>CPF</div>
          <div>Telefone</div>
          <div>Email</div>
          <div>Ações</div>
        </TableHeader>

        {filteredClients.length === 0 ? (
          <EmptyState>
            <h3>Nenhum cliente encontrado</h3>
            <p>Comece cadastrando o primeiro cliente ou ajuste os filtros de busca.</p>
          </EmptyState>
        ) : (
          filteredClients.map((client) => (
            <ClientRow key={client.id}>
              <ClientInfo>
                <div className="name">{client.name}</div>
                <div className="details">ID: {client.id}</div>
              </ClientInfo>
              
              <ClientInfo>
                <div className="name">{formatCPF(client.cpf)}</div>
                <div className="details">CPF</div>
              </ClientInfo>
              
              <ClientInfo>
                <div className="name">{formatPhoneBR(client.phone)}</div>
                <div className="details">Telefone</div>
              </ClientInfo>
              
              <ClientInfo>
                <div className="name">{client.email || 'Não informado'}</div>
                <div className="details">Email</div>
              </ClientInfo>
              
              <ActionButtons>
                <ActionButton
                  className="view"
                  title="Visualizar"
                  onClick={() => handleEditClient(client.id)}
                >
                  <FaEye />
                </ActionButton>
                
                <ActionButton
                  className="edit"
                  title="Editar"
                  onClick={() => handleEditClient(client.id)}
                >
                  <FaEdit />
                </ActionButton>
                
                <ActionButton
                  className="whatsapp"
                  title="WhatsApp"
                  onClick={() => handleWhatsApp(client.phone)}
                >
                  <FaWhatsapp />
                </ActionButton>
                
                <ActionButton
                  className="delete"
                  title="Excluir"
                  onClick={() => handleDeleteClient(client.id)}
                >
                  <FaTrash />
                </ActionButton>
              </ActionButtons>
            </ClientRow>
          ))
        )}
      </ClientsTable>
    </Container>
  );
};

export default ClientsManagementPage;
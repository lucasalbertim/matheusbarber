import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaPlus, FaWhatsapp, FaEye, FaUserTimes, FaUserCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { formatCPF, formatPhoneBR } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  align-items: center;
`;

const StatusFilter = styled.select`
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
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
  background: #20AC9F;
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

const AutoInactivateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--warning);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: var(--warning-dark);
  }

  &:disabled {
    background: var(--border);
    cursor: not-allowed;
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
  grid-template-columns: 1fr 1fr 1fr 1fr 80px 120px;
  gap: 20px;
  padding: 20px;
  background: var(--background);
  font-weight: 600;
  color: var(--text);
  border-bottom: 2px solid var(--border);
`;

const ClientRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 80px 120px;
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

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.active {
    background: var(--success-light);
    color: var(--success);
  }
  
  &.inactive {
    background: var(--error-light);
    color: var(--error);
  }
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

  &.reactivate {
    background: #20AC9F;
    color: white;

    &:hover {
      background: var(--success-dark);
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    try {
      const response = await api.get(`/admin/clients/?status=${statusFilter}`);
      setClients(response.data);
      setFilteredClients(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/login');
      return;
    }
    fetchClients();
  }, [isAdmin, navigate, fetchClients]);

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





  const handleViewClient = (clientId) => {
    // Por enquanto, vamos mostrar os detalhes em um modal ou alert
    const client = clients.find(c => c.id === clientId);
    if (client) {
      const details = `
Nome: ${client.name}
CPF: ${formatCPF(client.cpf)}
Telefone: ${formatPhoneBR(client.phone)}
Email: ${client.email || 'Não informado'}
ID: ${client.id}
      `;
      alert(details);
    }
  };

  const handleEditClient = (clientId) => {
    navigate(`/admin/clientes/${clientId}/editar`);
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('⚠️ ATENÇÃO: Você está excluindo definitivamente o cliente do banco de dados. Esta ação não pode ser desfeita. Deseja continuar?')) {
      return;
    }

    try {
      await api.delete(`/admin/clients/${clientId}`);
      toast.success('Cliente excluído definitivamente com sucesso');
      fetchClients();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleAddClient = () => {
    navigate('/admin/clientes/novo');
  };

  const handleAutoInactivate = async () => {
    if (!window.confirm('Deseja inativar automaticamente os clientes que não vieram há 45 dias?')) {
      return;
    }

    try {
      const response = await api.post('/admin/clients/auto-inactivate');
      toast.success(response.data.message);
      fetchClients();
    } catch (error) {
      console.error('Erro ao inativar clientes:', error);
      toast.error('Erro ao executar inativação automática');
    }
  };

  const handleReactivateClient = async (clientId) => {
    if (!window.confirm('Deseja reativar este cliente?')) {
      return;
    }

    try {
      await api.post(`/admin/clients/${clientId}/reactivate`);
      toast.success('Cliente reativado com sucesso');
      fetchClients();
    } catch (error) {
      console.error('Erro ao reativar cliente:', error);
      toast.error('Erro ao reativar cliente');
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
        <StatusFilter
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos os Clientes</option>
          <option value="active">Apenas Ativos</option>
          <option value="inactive">Apenas Inativos</option>
        </StatusFilter>
        <AutoInactivateButton onClick={handleAutoInactivate}>
          <FaUserTimes />
          Inativar Inativos (45 dias)
        </AutoInactivateButton>
        <AddButton onClick={handleAddClient}>
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
          <div>Status</div>
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
              
              <div>
                <StatusBadge className={client.is_active ? 'active' : 'inactive'}>
                  {client.is_active ? 'Ativo' : 'Inativo'}
                </StatusBadge>
              </div>
              
              <ActionButtons>
                <ActionButton
                  className="view"
                  title="Visualizar"
                  onClick={() => handleViewClient(client.id)}
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
                
                {!client.is_active && (
                  <ActionButton
                    className="reactivate"
                    title="Reativar"
                    onClick={() => handleReactivateClient(client.id)}
                  >
                    <FaUserCheck />
                  </ActionButton>
                )}
                
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
      <Footer />
    </Container>
  );
};

export default ClientsManagementPage;
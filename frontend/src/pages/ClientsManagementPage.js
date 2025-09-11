import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaPlus, FaWhatsapp, FaEye, FaUserTimes, FaUserCheck, FaFileExcel, FaFilePdf, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { Button, Card, Input, Loading, Modal, ConfirmationModal, FilterBar, Pagination, Table, Th, Td, Tr } from '../components';
import { formatPhone, formatDate } from '../utils';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
    margin-bottom: 20px;
  }
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

const ActionsRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
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
    background: var(--danger-light);
    color: var(--danger);
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  
  &.view {
    background: var(--info-light);
    color: var(--info);
    &:hover { background: var(--info); color: white; }
  }
  
  &.edit {
    background: var(--warning-light);
    color: var(--warning);
    &:hover { background: var(--warning); color: white; }
  }
  
  &.whatsapp {
    background: #25D366;
    color: white;
    &:hover { background: #128C7E; }
  }
  
  &.reactivate {
    background: var(--success-light);
    color: var(--success);
    &:hover { background: var(--success); color: white; }
  }
  
  &.delete {
    background: var(--danger-light);
    color: var(--danger);
    &:hover { background: var(--danger); color: white; }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 20px;
  
  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 8px;
  }
  
  .stat-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`;

const ClientsManagementPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [inactiveDays, setInactiveDays] = useState(45);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: statusFilter,
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'active', label: 'Ativos' },
        { value: 'inactive', label: 'Inativos' }
      ]
    }
  ];

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/clients/?status=${statusFilter}`);
      setClients(response.data);
      
      const total = response.data.length;
      const active = response.data.filter(c => c.is_active).length;
      const inactive = total - active;
      setStats({ total, active, inactive });
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
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
    (client.data_nascimento && formatDate(client.data_nascimento).includes(searchTerm)) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClients(filtered);
    };
    
    filterClients();
    setCurrentPage(1);
  }, [searchTerm, clients]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const handleFilterChange = (key, value) => {
    if (key === 'status') {
      setStatusFilter(value);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleViewClient = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      const details = `
Nome: ${client.name}
  Data de Nascimento: ${formatDate(client.data_nascimento)}
Telefone: ${formatPhone(client.phone)}
Email: ${client.email || 'Não informado'}
Status: ${client.is_active ? 'Ativo' : 'Inativo'}
Data de Cadastro: ${formatDate(client.created_at)}
      `;
      alert(details);
    }
  };

  const handleEditClient = (clientId) => {
    navigate(`/admin/clientes/${clientId}/editar`);
  };

  const handleDeleteClient = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const confirmDeleteClient = async () => {
    try {
      await api.delete(`/admin/clients/${clientToDelete.id}`);
      toast.success('Cliente excluído com sucesso');
      fetchClients();
      setShowDeleteModal(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleAddClient = () => {
    navigate('/admin/clientes/novo');
  };

  const handleAutoInactivate = async () => {
    try {
      const response = await api.post(`/admin/clients/auto-inactivate?days=${inactiveDays}`);
      toast.success(response.data.message);
      fetchClients();
    } catch (error) {
      console.error('Erro ao inativar clientes:', error);
      toast.error('Erro ao executar inativação automática');
    }
  };

  const handleReactivateClient = async (clientId) => {
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

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/admin/clients/export/excel', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Exportação realizada com sucesso');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get('/admin/clients/export/pdf', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Exportação realizada com sucesso');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  const handleSaveConfig = async () => {
    try {
      await api.post('/admin/clients/config', { inactive_days: inactiveDays });
      toast.success('Configuração salva com sucesso');
      setShowConfigModal(false);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading text="Carregando clientes..." />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <BackButton onClick={() => navigate('/admin/dashboard')}>
            <FaArrowLeft />
            Voltar ao Dashboard
          </BackButton>
          <Title>Gerenciamento de Clientes</Title>
        </div>
      </Header>

      <StatsGrid>
        <StatCard>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total de Clientes</div>
        </StatCard>
        <StatCard>
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Clientes Ativos</div>
        </StatCard>
        <StatCard>
          <div className="stat-number">{stats.inactive}</div>
          <div className="stat-label">Clientes Inativos</div>
        </StatCard>
      </StatsGrid>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
  searchPlaceholder="Buscar por nome, data de nascimento, telefone ou email..."
      />

      <ActionsRow>
        <Button variant="primary" onClick={handleAddClient}>
          <FaPlus />
          Novo Cliente
        </Button>
        
        <Button variant="warning" onClick={handleAutoInactivate}>
          <FaUserTimes />
          Inativação Automática
        </Button>
        
        <Button variant="success" onClick={handleExportExcel}>
          <FaFileExcel />
          Exportar Excel
        </Button>
        
        <Button variant="secondary" onClick={handleExportPDF}>
          <FaFilePdf />
          Exportar PDF
        </Button>
        
        <Button variant="ghost" onClick={() => setShowConfigModal(true)}>
          <FaCog />
          Configurações
        </Button>
      </ActionsRow>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Data de Nascimento</Th>
              <Th>Telefone</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {currentClients.map(client => (
              <Tr key={client.id}>
                <Td>
                  <div>
                    <strong>{client.name}</strong>
                    <br />
                    <small>ID: {client.id}</small>
                  </div>
                </Td>
                <Td>{formatDate(client.data_nascimento)}</Td>
                <Td>{formatPhone(client.phone)}</Td>
                <Td>{client.email || 'Não informado'}</Td>
                <Td>
                  <StatusBadge className={client.is_active ? 'active' : 'inactive'}>
                    {client.is_active ? 'Ativo' : 'Inativo'}
                  </StatusBadge>
                </Td>
                <Td>
                  <div style={{ display: 'flex', gap: '8px' }}>
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
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Configurar Inativação Automática"
      >
        <div style={{ padding: '20px' }}>
          <p>Configure quantos dias um cliente deve ficar sem atendimento para ser automaticamente inativado:</p>
          <Input
            type="number"
            min="1"
            max="365"
            value={inactiveDays}
            onChange={(e) => setInactiveDays(parseInt(e.target.value) || 45)}
            placeholder="Número de dias"
            style={{ marginTop: '16px' }}
          />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="ghost" onClick={() => setShowConfigModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveConfig}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteClient}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o cliente "${clientToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <Footer />
    </Container>
  );
};

export default ClientsManagementPage;

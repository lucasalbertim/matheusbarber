import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaPlus, FaWhatsapp, FaEye, FaUserTimes, FaUserCheck, FaFileExcel, FaFilePdf, FaCog, FaFileExport } from 'react-icons/fa';
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

const SearchBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const SearchRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
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

const ExportButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--success);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;

  &:hover {
    background: var(--success-dark);
  }
`;

const ExportDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 150px;
  margin-top: 5px;
`;

const ExportOption = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: var(--text);
  transition: background-color 0.2s;

  &:hover {
    background: var(--background);
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--border);
  }
`;

const ConfigButton = styled.button`
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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);

  h3 {
    margin: 0;
    color: var(--text);
  }

  button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--text-light);
    
    &:hover {
      color: var(--text);
    }
  }
`;

const ModalBody = styled.div`
  padding: 20px;

  p {
    margin: 0 0 15px 0;
    color: var(--text);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid var(--border);

  button {
    padding: 10px 20px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      background: var(--background);
    }
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

  @media (max-width: 768px) {
    display: none;
  }
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

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 15px;
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-bottom: 15px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ClientInfo = styled.div`
  .name {
    font-weight: 600;
    color: var(--text);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .details {
    font-size: 14px;
    color: var(--text-light);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 768px) {
    text-align: right;
    
    .name {
      font-size: 1rem;
      margin-bottom: 4px;
      white-space: normal;
    }
    
    .details {
      font-size: 0.8rem;
      white-space: normal;
    }
  }
`;

const ClientField = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: var(--text);

  @media (max-width: 768px) {
    white-space: normal;
    font-size: 1rem;
    padding: 8px 0;
  }
`;

const MobileField = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const MobileLabel = styled.span`
  display: none;
  
  @media (max-width: 768px) {
    display: inline;
    font-weight: 600;
    color: var(--text-light);
    font-size: 0.9rem;
    min-width: 80px;
  }
`;

const MobileValue = styled.span`
  display: none;
  
  @media (max-width: 768px) {
    display: inline;
    color: var(--text);
    font-size: 1rem;
    text-align: right;
    flex: 1;
  }
`;

const ClientStatus = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: flex-start;
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
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [inactiveDays, setInactiveDays] = useState(45);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

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
    if (!window.confirm(`Deseja inativar automaticamente os clientes que não vieram há ${inactiveDays} dias?`)) {
      return;
    }

    try {
      const response = await api.post(`/admin/clients/auto-inactivate?days=${inactiveDays}`);
      toast.success(response.data.message);
      fetchClients();
    } catch (error) {
      console.error('Erro ao inativar clientes:', error);
      toast.error('Erro ao executar inativação automática');
    }
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
      
      toast.success('Lista de clientes exportada com sucesso!');
      setShowExportDropdown(false);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar lista de clientes');
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
      
      toast.success('Lista de clientes exportada com sucesso!');
      setShowExportDropdown(false);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar lista de clientes');
    }
  };

  const handleConfigInactiveDays = () => {
    setShowConfigModal(true);
  };

  const handleSaveConfig = async () => {
    try {
      await api.post('/admin/clients/config', { inactive_days: inactiveDays });
      toast.success('Configuração salva com sucesso!');
      setShowConfigModal(false);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-container')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

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
        {/* Busca e Filtros - Sempre visíveis */}
        <SearchRow>
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
        </SearchRow>

        {/* Ações - Responsivas */}
        <ActionsRow>
          {/* Desktop: Botões visíveis */}
          <ConfigButton onClick={handleConfigInactiveDays}>
            <FaCog />
            Configurar
          </ConfigButton>
          <AutoInactivateButton onClick={handleAutoInactivate}>
            <FaUserTimes />
            Inativar ({inactiveDays} dias)
          </AutoInactivateButton>
          
          <div className="export-container" style={{ position: 'relative' }}>
            <ExportButton onClick={() => setShowExportDropdown(!showExportDropdown)}>
              <FaFileExport />
              Exportar
            </ExportButton>
            
            {showExportDropdown && (
              <ExportDropdown>
                <ExportOption onClick={handleExportExcel}>
                  <FaFileExcel />
                  Exportar Excel
                </ExportOption>
                <ExportOption onClick={handleExportPDF}>
                  <FaFilePdf />
                  Exportar PDF
                </ExportOption>
              </ExportDropdown>
            )}
          </div>
          
          <AddButton onClick={handleAddClient}>
            <FaPlus />
            Novo Cliente
          </AddButton>


        </ActionsRow>
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
              
              <ClientField>
                {formatCPF(client.cpf)}
              </ClientField>
              
              <ClientField>
                {formatPhoneBR(client.phone)}
              </ClientField>
              
              <ClientField>
                {client.email || 'Não informado'}
              </ClientField>
              
              <ClientStatus>
                <StatusBadge className={client.is_active ? 'active' : 'inactive'}>
                  {client.is_active ? 'Ativo' : 'Inativo'}
                </StatusBadge>
              </ClientStatus>
              
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

      {/* Modal de Configuração */}
      {showConfigModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>Configurar Inativação Automática</h3>
              <button onClick={() => setShowConfigModal(false)}>&times;</button>
            </ModalHeader>
            <ModalBody>
              <p>Configure quantos dias um cliente deve ficar sem atendimento para ser automaticamente inativado:</p>
              <input
                type="number"
                min="1"
                max="365"
                value={inactiveDays}
                onChange={(e) => setInactiveDays(parseInt(e.target.value) || 45)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  marginTop: '10px'
                }}
              />
            </ModalBody>
            <ModalFooter>
              <button onClick={() => setShowConfigModal(false)}>Cancelar</button>
              <button onClick={handleSaveConfig} style={{ background: 'var(--primary)', color: 'white' }}>
                Salvar
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      <Footer />
    </Container>
  );
};

export default ClientsManagementPage;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
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
  &:hover { color: var(--primary); }
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
  &:focus { outline: none; border-color: var(--primary); }
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
  &:hover { background: var(--primary-dark); }
`;

const Table = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 140px 140px 140px;
  gap: 20px;
  padding: 20px;
  background: var(--background);
  font-weight: 600;
  color: var(--text);
  border-bottom: 2px solid var(--border);
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 140px 140px 140px;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid var(--border);
  align-items: center;
  &:hover { background: var(--background); }
  &:last-child { border-bottom: none; }
`;

const Actions = styled.div`
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
  &.edit { background: var(--warning); color: white; }
  &.delete { background: var(--error); color: white; }
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
`;

const Modal = styled.div`
  background: white; padding: 20px; border-radius: 10px; width: 500px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

const FormGroup = styled.div`
  margin-bottom: 12px;
  label { display: block; margin-bottom: 6px; color: var(--text); font-weight: 600; }
  input, textarea { width: 100%; padding: 10px; border: 2px solid var(--border); border-radius: 8px; }
`;

const ModalActions = styled.div`
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px;
`;

const ServicesManagementPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration_minutes: 30 });

  useEffect(() => {
    if (!isAdmin()) { navigate('/admin/login'); return; }
    fetchServices();
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(services); return; }
    const s = search.toLowerCase();
    setFiltered(services.filter(x => x.name.toLowerCase().includes(s)));
  }, [search, services]);

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services/');
      setServices(data);
      setFiltered(data);
    } catch (e) {
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', price: '', duration_minutes: 30 }); setShowModal(true); };
  const openEdit = (svc) => { setEditing(svc); setForm({ name: svc.name, description: svc.description || '', price: svc.price, duration_minutes: svc.duration_minutes }); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const saveService = async () => {
    const payload = { ...form, price: Number(form.price), duration_minutes: Number(form.duration_minutes) };
    try {
      if (!payload.name || !payload.price) { toast.warn('Preencha nome e preço'); return; }
      if (editing) {
        await api.put(`/services/${editing.id}`, payload);
        toast.success('Serviço atualizado');
      } else {
        await api.post('/services/', payload);
        toast.success('Serviço criado');
      }
      closeModal();
      fetchServices();
    } catch (e) {
      const msg = e.response?.data?.detail || 'Erro ao salvar serviço';
      toast.error(msg);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Inativar este serviço?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Serviço inativado');
      fetchServices();
    } catch (e) {
      toast.error('Erro ao inativar serviço');
    }
  };

  const handleBack = () => navigate('/admin/dashboard');

  if (loading) return <Container>Carregando serviços...</Container>;

  return (
    <Container>
      <Header>
        <Title>Gestão de Serviços</Title>
        <BackButton onClick={handleBack}><FaArrowLeft /> Voltar</BackButton>
      </Header>

      <SearchBar>
        <SearchInput placeholder="Buscar serviço..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <AddButton onClick={openNew}><FaPlus /> Novo Serviço</AddButton>
      </SearchBar>

      <Table>
        <TableHeader>
          <div>Nome</div>
          <div>Descrição</div>
          <div>Duração (min)</div>
          <div>Preço (R$)</div>
          <div>Ações</div>
        </TableHeader>
        {filtered.map(s => (
          <Row key={s.id}>
            <div>{s.name}</div>
            <div>{s.description || '-'}</div>
            <div>{s.duration_minutes}</div>
            <div>{s.price.toFixed(2)}</div>
            <Actions>
              <ActionButton className="edit" title="Editar" onClick={() => openEdit(s)}><FaEdit /></ActionButton>
              <ActionButton className="delete" title="Inativar" onClick={() => deleteService(s.id)}><FaTrash /></ActionButton>
            </Actions>
          </Row>
        ))}
      </Table>

      {showModal && (
        <ModalOverlay>
          <Modal>
            <h3>{editing ? 'Editar Serviço' : 'Novo Serviço'}</h3>
            <FormGroup>
              <label>Nome</label>
              <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
            </FormGroup>
            <FormGroup>
              <label>Descrição</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} />
            </FormGroup>
            <FormGroup>
              <label>Duração (min)</label>
              <input type="number" value={form.duration_minutes} onChange={(e) => setForm(prev => ({ ...prev, duration_minutes: e.target.value }))} />
            </FormGroup>
            <FormGroup>
              <label>Preço (R$)</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))} />
            </FormGroup>
            <ModalActions>
              <button onClick={closeModal}>Cancelar</button>
              <button onClick={saveService}>Salvar</button>
            </ModalActions>
          </Modal>
        </ModalOverlay>
      )}
      <Footer />
    </Container>
  );
};

export default ServicesManagementPage;


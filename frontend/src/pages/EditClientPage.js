import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaSave, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { formatCPF, formatPhoneBR, isValidCPF, isValidEmail, isValidPhoneBR, onlyDigits, normalizeEmail } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const Container = styled.div`
  max-width: 600px;
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
  display: flex;
  align-items: center;
  gap: 10px;
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

const Form = styled.form`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  &.error {
    border-color: var(--error);
  }
`;

const ErrorMessage = styled.span`
  color: var(--error);
  font-size: 14px;
  margin-top: 5px;
  display: block;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

const SaveButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
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

  &:disabled {
    background: var(--border);
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--background);
  color: var(--text);
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: var(--border);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
`;

const EditClientPage = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      const response = await api.get(`/admin/clients/${clientId}`);
      const clientData = response.data;
      setFormData({
        name: clientData.name || '',
        cpf: formatCPF(clientData.cpf) || '',
        phone: formatPhoneBR(clientData.phone) || '',
        email: clientData.email || ''
      });
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      toast.error('Erro ao carregar dados do cliente');
      navigate('/admin/clientes');
    } finally {
      setIsLoading(false);
    }
  }, [clientId, navigate]);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/login');
      return;
    }
    fetchClient();
  }, [isAdmin, navigate, fetchClient]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar máscaras
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'phone') {
      formattedValue = formatPhoneBR(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar CPF
    const cpfDigits = onlyDigits(formData.cpf);
    if (!cpfDigits) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (cpfDigits.length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    } else if (!isValidCPF(cpfDigits)) {
      newErrors.cpf = 'CPF inválido';
    }

    // Validar telefone
    const phoneDigits = onlyDigits(formData.phone);
    if (!phoneDigits) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (phoneDigits.length < 10) {
      newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    } else if (!isValidPhoneBR(phoneDigits)) {
      newErrors.phone = 'Telefone inválido';
    }

    // Validar email (opcional)
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        cpf: onlyDigits(formData.cpf),
        phone: onlyDigits(formData.phone),
        email: normalizeEmail(formData.email)
      };

      await api.put(`/admin/clients/${clientId}`, payload);
      toast.success('Cliente atualizado com sucesso!');
      navigate('/admin/clientes');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Erro ao atualizar cliente');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate('/admin/clientes');
  };

  if (!isAdmin()) {
    return null;
  }

  if (isLoading) {
    return (
      <Container>
        <LoadingState>
          <h3>Carregando dados do cliente...</h3>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FaEdit />
          Editar Cliente
        </Title>
        <BackButton onClick={handleBackClick}>
          <FaArrowLeft />
          Voltar
        </BackButton>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? 'error' : ''}
            placeholder="Digite o nome completo"
          />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            className={errors.cpf ? 'error' : ''}
            placeholder="000.000.000-00"
            maxLength="14"
          />
          {errors.cpf && <ErrorMessage>{errors.cpf}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={errors.phone ? 'error' : ''}
            placeholder="(00) 00000-0000"
            maxLength="15"
          />
          {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            placeholder="email@exemplo.com"
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </FormGroup>

        <ButtonGroup>
          <SaveButton type="submit" disabled={isSubmitting}>
            <FaSave />
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </SaveButton>
          <CancelButton type="button" onClick={handleBackClick}>
            Cancelar
          </CancelButton>
        </ButtonGroup>
      </Form>
      <Footer />
    </Container>
  );
};

export default EditClientPage;
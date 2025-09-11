import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaSave, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { formatPhoneBR, isValidEmail, isValidPhoneBR, onlyDigits, normalizeEmail } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 15px;
    max-width: 100%;
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
  
  @media (max-width: 768px) {
    padding: 20px;
  }
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
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
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

const AddClientPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
  name: '',
  phone: '',
  email: '',
  data_nascimento: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar máscaras
    if (name === 'phone') {
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

    // Validar data de nascimento
    if (!formData.data_nascimento || formData.data_nascimento === '1900-01-01') {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.data_nascimento)) {
        newErrors.data_nascimento = 'Formato de data inválido (YYYY-MM-DD)';
      }
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

    const payload = {
      name: formData.name.trim(),
      phone: onlyDigits(formData.phone),
      email: normalizeEmail(formData.email),
      data_nascimento: formData.data_nascimento
    };
    try {
      await api.post('/admin/clients/', payload);
      toast.success('Cliente cadastrado com sucesso!');
      navigate('/admin/clientes');
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Erro ao cadastrar cliente');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate('/admin/clientes');
  };

  if (!isAdmin()) {
    navigate('/admin/login');
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>
          <FaUserPlus />
          Novo Cliente
        </Title>
        <BackButton onClick={handleBackClick}>
          <FaArrowLeft />
        </BackButton>
      </Header>
        data_nascimento: formData.data_nascimento,

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
          <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
          <Input
            type="date"
            id="data_nascimento"
            name="data_nascimento"
            value={formData.data_nascimento}
            onChange={handleInputChange}
            required
            className={errors.data_nascimento ? 'error' : ''}
          />
          {errors.data_nascimento && <ErrorMessage>{errors.data_nascimento}</ErrorMessage>}
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
          <Label htmlFor="email">Email (opcional)</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            placeholder="Digite o email do cliente"
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </FormGroup>

        <ButtonGroup>
          <SaveButton type="submit" disabled={isSubmitting}>
            <FaSave />
            {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
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

export default AddClientPage;
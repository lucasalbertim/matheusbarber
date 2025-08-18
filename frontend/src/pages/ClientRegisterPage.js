import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaIdCard, FaPhone, FaUser, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { formatCPF, formatPhoneBR, isValidCPF, isValidPhoneBR, isValidEmail, onlyDigits, normalizeEmail } from '../utils/formatters';

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
`;

const Form = styled.form`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: var(--primary);
  text-align: center;
  margin-bottom: 30px;
  font-size: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--text);
  font-weight: 600;
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
`;

const Button = styled.button`
  width: 100%;
  padding: 15px;
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
    background: var(--disabled);
    cursor: not-allowed;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  text-decoration: none;
  margin-bottom: 20px;
  font-weight: 600;
  transition: color 0.3s;

  &:hover {
    color: var(--primary);
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 20px;
  color: var(--text);

  a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  color: var(--error);
  font-size: 14px;
  margin-top: 5px;
`;

const ClientRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Máscaras via utilitários
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'phone') {
      formattedValue = formatPhoneBR(value);
    } else if (name === 'email') {
      formattedValue = normalizeEmail(value);
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

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    const cpfDigits = onlyDigits(formData.cpf);
    if (!cpfDigits) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!isValidCPF(cpfDigits)) {
      newErrors.cpf = 'CPF inválido';
    }

    const phoneDigits = onlyDigits(formData.phone);
    if (!phoneDigits) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!isValidPhoneBR(phoneDigits)) {
      newErrors.phone = 'Telefone inválido';
    }

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

    setIsLoading(true);

    try {
      await api.post('/clients/', {
        name: formData.name.trim(),
        cpf: onlyDigits(formData.cpf),
        phone: onlyDigits(formData.phone),
        email: formData.email ? normalizeEmail(formData.email) : null
      });

      toast.success('Cliente cadastrado com sucesso!');
      navigate('/cliente/login');
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast.error('Erro ao cadastrar cliente. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <BackButton to="/cliente/login">
        <FaArrowLeft />
        Voltar para Login
      </BackButton>

      <Form onSubmit={handleSubmit}>
        <Title>Cadastro de Cliente</Title>

        <FormGroup>
          <Label htmlFor="name">
            <FaUser /> Nome Completo
          </Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Digite seu nome completo"
            required
          />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="cpf">
            <FaIdCard /> CPF
          </Label>
          <Input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            placeholder="000.000.000-00"
            maxLength="14"
            required
          />
          {errors.cpf && <ErrorMessage>{errors.cpf}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="phone">
            <FaPhone /> Telefone
          </Label>
          <Input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="(00) 00000-0000"
            maxLength="15"
            required
          />
          {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">
            <FaEnvelope /> Email (opcional)
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="seu@email.com"
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </FormGroup>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
        </Button>

        <LoginLink>
          Já tem uma conta? <Link to="/cliente/login">Faça login aqui</Link>
        </LoginLink>
      </Form>
    </Container>
  );
};

export default ClientRegisterPage;
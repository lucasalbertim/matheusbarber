import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { formatCPF, formatPhoneBR, isValidCPF, isValidEmail, isValidPhoneBR, onlyDigits, normalizeEmail } from '../utils/formatters';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background) 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ContentCard = styled.div`
  background: var(--surface);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  position: relative;
`;

const BackButton = styled(Link)`
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--background);
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--primary);
    color: var(--accent);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;

  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin: 0 auto 20px;
    box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 8px;
  }

  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: var(--background);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 30px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: ${props => props.active ? 'var(--surface)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary)' : 'var(--text-secondary)'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    color: #20AC9F;
  }
`;

const Form = styled.form`
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .form-input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid var(--border);
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.2s ease;
    background: var(--surface);
    
    &:focus {
      outline: none;
      border-color: var(--secondary);
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
    }
    
    &.error {
      border-color: var(--error);
    }
  }
  
  .form-error {
    color: var(--error);
    font-size: 14px;
    margin-top: 4px;
  }
  
  .submit-btn {
    width: 100%;
    padding: 16px;
    background: #20AC9F;
    color: var(--accent);
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 20px;
    
    &:hover:not(:disabled) {
      background: #1A8C7F;
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(26, 26, 26, 0.3);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--accent);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ClientLoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  
  const { loginClient } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === 'cpf') {
      // No login, o campo aceita CPF ou Telefone; formata dinamicamente
      if (activeTab === 'login') {
        const digits = onlyDigits(value);
        if (digits.length <= 11) {
          formatted = formatCPF(value);
        } else {
          formatted = formatPhoneBR(value);
        }
      } else {
        formatted = formatCPF(value);
      }
    } else if (name === 'phone') {
      formatted = formatPhoneBR(value);
    } else if (name === 'email') {
      formatted = normalizeEmail(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formatted
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
    
    if (activeTab === 'register') {
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
    } else {
      const idDigits = onlyDigits(formData.cpf || formData.phone);
      if (!idDigits) {
        newErrors.cpf = 'Informe CPF ou telefone';
      } else {
        // Se 11 dígitos, validar CPF; se 10/11, aceitar como telefone
        if (idDigits.length === 11) {
          if (!isValidCPF(idDigits)) newErrors.cpf = 'CPF inválido';
        } else if (!(idDigits.length === 10 || idDigits.length === 11)) {
          newErrors.cpf = 'Informe um CPF (11 dígitos) ou telefone válido (10-11 dígitos)';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const idDigits = onlyDigits(formData.cpf || formData.phone);
      const response = await api.post('/clients/login', { identifier: idDigits });
      
      loginClient(response.data);
      navigate('/cliente/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao fazer login';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await api.post('/clients/', {
        name: formData.name.trim(),
        cpf: onlyDigits(formData.cpf),
        phone: onlyDigits(formData.phone),
        email: formData.email ? normalizeEmail(formData.email) : null,
      });
      
      loginClient(response.data);
      navigate('/cliente/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao cadastrar';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (activeTab === 'login') {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  return (
    <PageContainer>
      <ContentCard>
        <BackButton to="/">
          <FaArrowLeft />
          Voltar
        </BackButton>
        
        <Header>
          <img src="/logo.jpeg" alt="Matheus Barber Logo" />
          <h1>Matheus Barber</h1>
          <p>Área do Cliente</p>
        </Header>
        
        <TabContainer>
          <Tab
            active={activeTab === 'login'}
            onClick={() => setActiveTab('login')}
          >
            <FaUser />
            Login
          </Tab>
          <Tab
            active={activeTab === 'register'}
            onClick={() => setActiveTab('register')}
          >
            <FaUserPlus />
            Cadastro
          </Tab>
        </TabContainer>
        
        <Form onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                name="name"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Digite seu nome completo"
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">
              {activeTab === 'login' ? 'CPF ou Telefone' : 'CPF'}
            </label>
            <input
              type="text"
              name="cpf"
              className={`form-input ${errors.cpf ? 'error' : ''}`}
              value={formData.cpf}
              onChange={handleInputChange}
              placeholder={activeTab === 'login' ? 'CPF ou telefone' : 'Digite seu CPF'}
            />
            {errors.cpf && <div className="form-error">{errors.cpf}</div>}
          </div>
          
          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input
                type="tel"
                name="phone"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Digite seu telefone"
              />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>
          )}
          
          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label">Email (opcional)</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Digite seu email"
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
          )}
          
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                {activeTab === 'login' ? 'Entrando...' : 'Cadastrando...'}
              </>
            ) : (
              activeTab === 'login' ? 'Entrar' : 'Cadastrar'
            )}
          </button>
        </Form>
      </ContentCard>
    </PageContainer>
  );
};

export default ClientLoginPage;
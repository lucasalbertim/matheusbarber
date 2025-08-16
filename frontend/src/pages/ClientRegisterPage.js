import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUserPlus, FaArrowLeft, FaIdCard, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

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
  
  .logo {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--secondary) 0%, #e6c200 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
    color: var(--primary);
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
    background: var(--primary);
    color: var(--accent);
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 20px;
    
    &:hover:not(:disabled) {
      background: #000000;
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

const LoginLink = styled.div`
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  
  p {
    color: var(--text-secondary);
    margin-bottom: 12px;
  }
  
  a {
    color: var(--secondary);
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ClientRegisterPage = () => {
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
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (formData.cpf.length < 11) {
      newErrors.cpf = 'CPF deve ter pelo menos 11 dígitos';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }
    
    // Validação básica de email (se fornecido)
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await api.post('/clients/', formData);
      
      // Fazer login automático após cadastro
      loginClient(response.data);
      
      toast.success(`Bem-vindo, ${formData.name}! Cadastro realizado com sucesso.`);
      navigate('/cliente/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao realizar cadastro';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ContentCard>
        <BackButton to="/cliente/login">
          <FaArrowLeft />
          Voltar
        </BackButton>
        
        <Header>
          <div className="logo">M</div>
          <h1>Matheus Barber</h1>
          <p>Cadastro de Cliente</p>
        </Header>
        
        <Form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <FaUser style={{ marginRight: '8px' }} />
              Nome Completo
            </label>
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
          
          <div className="form-group">
            <label className="form-label">
              <FaIdCard style={{ marginRight: '8px' }} />
              CPF
            </label>
            <input
              type="text"
              name="cpf"
              className={`form-input ${errors.cpf ? 'error' : ''}`}
              value={formData.cpf}
              onChange={handleInputChange}
              placeholder="Digite seu CPF"
            />
            {errors.cpf && <div className="form-error">{errors.cpf}</div>}
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <FaPhone style={{ marginRight: '8px' }} />
              Telefone
            </label>
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
          
          <div className="form-group">
            <label className="form-label">
              <FaEnvelope style={{ marginRight: '8px' }} />
              Email (opcional)
            </label>
            <input
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Digite seu email"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Cadastrando...
              </>
            ) : (
              <>
                <FaUserPlus style={{ marginRight: '8px' }} />
                Cadastrar
              </>
            )}
          </button>
        </Form>
        
        <LoginLink>
          <p>Já tem uma conta?</p>
          <Link to="/cliente/login">Faça login aqui</Link>
        </LoginLink>
      </ContentCard>
    </PageContainer>
  );
};

export default ClientRegisterPage;
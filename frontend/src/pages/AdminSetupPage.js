import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUserCog, FaSave, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import Footer from '../components/Footer';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--background);
  padding: 20px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SetupCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--secondary);
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  .icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--secondary) 0%, #e6c200 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 32px;
    color: var(--primary);
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 10px;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
    line-height: 1.6;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
    
    .icon {
      width: 60px;
      height: 60px;
      font-size: 24px;
    }
    
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`;

const AlertBox = styled.div`
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffc107;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  
  .icon {
    color: #856404;
    font-size: 24px;
    flex-shrink: 0;
  }
  
  .content {
    h3 {
      color: #856404;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    
    p {
      color: #856404;
      margin: 0;
      line-height: 1.5;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1rem;
  }
  
  input {
    padding: 16px;
    border: 2px solid var(--border);
    border-radius: 12px;
    font-size: 1rem;
    background: var(--background);
    color: var(--text-primary);
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--secondary);
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
    }
    
    &::placeholder {
      color: var(--text-secondary);
    }
  }
  
  .error {
    color: #dc3545;
    font-size: 0.9rem;
    margin-top: 4px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &.primary {
    background: linear-gradient(135deg, var(--secondary) 0%, #e6c200 100%);
    color: var(--primary);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
    }
  }
  
  &.secondary {
    background: transparent;
    color: var(--text-secondary);
    border: 2px solid var(--border);
    
    &:hover:not(:disabled) {
      border-color: var(--text-primary);
      color: var(--text-primary);
    }
  }
`;

function AdminSetupPage() {
  const navigate = useNavigate();
  const { admin, loginAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Verificar se o admin está logado e se é primeiro login
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    if (!admin.is_first_login) {
      navigate('/admin/dashboard');
      return;
    }
  }, [admin, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username é obrigatório';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username deve ter pelo menos 3 caracteres';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.put('/admins/first-login', {
        username: formData.username.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      
      // Atualizar o contexto com os novos dados
      const updatedAdmin = {
        ...admin,
        ...response.data,
        is_first_login: false
      };
      
      loginAdmin(updatedAdmin, admin.token);
      
      toast.success('Configuração inicial concluída com sucesso!');
      navigate('/admin/dashboard');
      
    } catch (error) {
      console.error('Erro ao atualizar admin:', error);
      
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Erro ao salvar configurações. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!admin || !admin.is_first_login) {
    return null;
  }

  return (
    <PageContainer>
      <Container>
        <SetupCard>
          <Header>
            <div className="icon">
              <FaUserCog />
            </div>
            <h1>Configuração Inicial</h1>
            <p>
              Bem-vindo ao Matheus Barber! Para começar a usar o sistema, 
              precisamos que você configure suas informações de administrador.
            </p>
          </Header>
          
          <AlertBox>
            <div className="icon">
              <FaExclamationTriangle />
            </div>
            <div className="content">
              <h3>Primeiro Acesso</h3>
              <p>
                Esta é a primeira vez que você acessa o sistema. 
                Por segurança, você deve alterar as credenciais padrão.
              </p>
            </div>
          </AlertBox>
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Digite seu username"
                disabled={loading}
              />
              {errors.username && <div className="error">{errors.username}</div>}
            </FormGroup>
            
            <FormGroup>
              <label htmlFor="name">Nome Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Digite seu nome completo"
                disabled={loading}
              />
              {errors.name && <div className="error">{errors.name}</div>}
            </FormGroup>
            
            <FormGroup>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Digite seu email"
                disabled={loading}
              />
              {errors.email && <div className="error">{errors.email}</div>}
            </FormGroup>
            
            <FormGroup>
              <label htmlFor="password">Nova Senha *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Digite sua nova senha"
                disabled={loading}
              />
              {errors.password && <div className="error">{errors.password}</div>}
            </FormGroup>
            
            <FormGroup>
              <label htmlFor="confirmPassword">Confirmar Senha *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirme sua nova senha"
                disabled={loading}
              />
              {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
            </FormGroup>
            
            <ButtonGroup>
              <Button
                type="button"
                className="secondary"
                onClick={() => navigate('/admin/login')}
                disabled={loading}
              >
                <FaArrowLeft />
                Voltar
              </Button>
              <Button
                type="submit"
                className="primary"
                disabled={loading}
              >
                <FaSave />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </ButtonGroup>
          </Form>
        </SetupCard>
      </Container>
      <Footer />
    </PageContainer>
  );
}

export default AdminSetupPage;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
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
  max-width: 450px;
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
  
  .input-container {
    position: relative;
    
    .form-input {
      width: 100%;
      padding: 14px 16px;
      padding-right: 50px;
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
    
    .password-toggle {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--primary);
      }
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

const AdminLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  
  const { loginAdmin } = useAuth();
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
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username é obrigatório';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await api.post('/admins/login', formData);
      const { access_token, admin } = response.data;
      
      loginAdmin(admin, access_token);
      navigate('/admin/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao fazer login';
      toast.error(message);
    } finally {
      setLoading(false);
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
          <img src="/logo.png" alt="Matheus Barber Logo" />
          <h1>Matheus Barber</h1>
          <p>Área Administrativa</p>
        </Header>
        
        <Form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Digite seu username"
            />
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className="input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </Form>
      </ContentCard>
    </PageContainer>
  );
};

export default AdminLoginPage;
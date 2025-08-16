import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaUserTie, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background) 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Container = styled.div`
  background: var(--surface);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  position: relative;
`;

const BackButton = styled.button`
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
  border: none;
  cursor: pointer;
  
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

const FormCard = styled.div`
  form {
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
  }
`;

const FormGroup = styled.div`
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-primary);
    font-size: 1rem;
  }

  input {
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
`;

const PasswordInputContainer = styled.div`
  position: relative;

  input {
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
`;

const PasswordToggleButton = styled.button`
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
`;

const ErrorMessage = styled.div`
  color: var(--error);
  font-size: 14px;
  margin-top: 4px;
`;

const SubmitButton = styled.button`
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
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      newErrors.username = 'Usuário é obrigatório';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
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
      await loginAdmin(formData.username, formData.password);
      
      toast.success('Login realizado com sucesso!');
      
      // Redirecionar para dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.message === 'Credenciais inválidas') {
        toast.error('Usuário ou senha incorretos');
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <PageContainer>
      <Container>
        <Header>
          <BackButton onClick={handleBackClick}>
            <FaArrowLeft />
            Voltar
          </BackButton>
          <h1>Login do Administrador</h1>
        </Header>

        <FormCard>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <label>
                <FaUserTie className="icon" />
                Usuário
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Digite seu usuário"
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <label>
                <FaLock className="icon" />
                Senha
              </label>
              <PasswordInputContainer>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha"
                  className={errors.password ? 'error' : ''}
                />
                <PasswordToggleButton
                  type="button"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggleButton>
              </PasswordInputContainer>
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </FormGroup>

            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </SubmitButton>
          </form>
        </FormCard>
      </Container>
    </PageContainer>
  );
};

export default AdminLoginPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { cpfMask, phoneMask, validateCPF, validatePhone } from '../utils/masks';
import { FaIdCard, FaPhone, FaArrowLeft } from 'react-icons/fa';
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
  max-width: 500px;
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

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: var(--text-secondary);

  button {
    background: none;
    border: none;
    color: var(--primary);
    cursor: pointer;
    text-decoration: underline;
    font-weight: 500;
    transition: color 0.2s ease;

    &:hover {
      color: var(--accent);
    }
  }
`;

const FormGroup = styled.div`
  position: relative;
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon {
    font-size: 20px;
    color: var(--secondary);
  }

  input {
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
`;

const ClientLoginPage = () => {
  const navigate = useNavigate();
  const { loginClient } = useAuth();
  const [formData, setFormData] = useState({
    cpf: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar máscaras
    if (name === 'cpf') {
      formattedValue = cpfMask(value);
    } else if (name === 'phone') {
      formattedValue = phoneMask(value);
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

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
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
      // Limpar formatação para enviar ao backend
      const cleanData = {
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, '')
      };

      const response = await api.post('/clients/login', cleanData);
      
      if (response.status === 200) {
        toast.success('Login realizado com sucesso!');
        
        // Fazer login
        await loginClient(cleanData.cpf, cleanData.phone);
        
        // Redirecionar para tela de atendimento
        navigate('/cliente/atendimento');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Erro ao fazer login. Verifique seus dados.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <PageContainer>
      <Container>
        <Header>
          <BackButton onClick={handleBackClick}>
            <FaArrowLeft />
            Voltar
          </BackButton>
          <h1>Login do Cliente</h1>
        </Header>

        <FormCard>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <label>
                <FaIdCard className="icon" />
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                placeholder="000.000.000-00"
                maxLength="14"
                className={errors.cpf ? 'error' : ''}
              />
              {errors.cpf && <ErrorMessage>{errors.cpf}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <label>
                <FaPhone className="icon" />
                Telefone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                maxLength="15"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
            </FormGroup>

            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </SubmitButton>
          </form>

          <RegisterLink>
            Não tem uma conta?{' '}
            <button onClick={() => navigate('/cliente/cadastro')}>
              Cadastre-se
            </button>
          </RegisterLink>
        </FormCard>
      </Container>
    </PageContainer>
  );
};

export default ClientLoginPage;
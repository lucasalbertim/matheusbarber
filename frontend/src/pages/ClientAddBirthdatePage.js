import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCalendarAlt, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import Footer from '../components/Footer';

const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 30px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.h1`
  color: var(--primary);
  text-align: center;
  margin-bottom: 24px;
  font-size: 2rem;
`;

const Form = styled.form`
  background: white;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.08);
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
  width: 100%;
  margin-top: 16px;
  &:hover {
    background: var(--primary-dark);
  }
  &:disabled {
    background: var(--border);
    cursor: not-allowed;
  }
`;

const ClientAddBirthdatePage = ({ clientId }) => {
  const navigate = useNavigate();
  const [dataNascimento, setDataNascimento] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^\d-]/g, '').slice(0, 10);
    setDataNascimento(value);
    setError('');
  };

  const validate = () => {
    if (!dataNascimento) {
      setError('Data de nascimento é obrigatória');
      return false;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dataNascimento)) {
      setError('Formato de data inválido (YYYY-MM-DD)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
  await api.put(`/clients/${clientId}`, { data_nascimento: dataNascimento });
      toast.success('Data de nascimento adicionada com sucesso!');
      navigate('/cliente/dashboard');
    } catch (err) {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Title>
        <FaCalendarAlt />
        Adicione sua data de nascimento
      </Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="data_nascimento">Data de Nascimento</Label>
          <Input
            type="date"
            id="data_nascimento"
            name="data_nascimento"
            value={dataNascimento}
            onChange={handleChange}
            required
            className={error ? 'error' : ''}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </FormGroup>
        <SaveButton type="submit" disabled={isSubmitting}>
          <FaSave />
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </SaveButton>
      </Form>
      <Footer />
    </Container>
  );
};

export default ClientAddBirthdatePage;

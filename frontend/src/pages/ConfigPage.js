import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCog, FaUsers, FaCalendarAlt, FaClock, FaSave, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import Footer from '../components/Footer';
import { Button, Card, Input, Loading } from '../components';

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
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
    
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
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
  margin-bottom: 20px;

  &:hover {
    color: var(--primary);
  }
`;

const ConfigSection = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
  
  h3 {
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.3rem;
  }
  
  .section-description {
    color: var(--text-secondary);
    margin-bottom: 24px;
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const ModeToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: 2px solid var(--border);
  border-radius: 12px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  
  &.enabled {
    border-color: var(--success);
    background: rgba(40, 167, 69, 0.05);
  }
  
  &.disabled {
    border-color: var(--border);
    background: var(--surface);
  }
  
  .mode-info {
    flex: 1;
    
    .mode-title {
      font-weight: 600;
      font-size: 1.1rem;
      color: var(--text);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .mode-description {
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.4;
    }
  }
  
  .toggle-switch {
    position: relative;
    width: 60px;
    height: 30px;
    background: var(--border);
    border-radius: 15px;
    cursor: pointer;
    transition: background 0.3s ease;
    
    &.active {
      background: var(--success);
    }
    
    .toggle-slider {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    &.active .toggle-slider {
      transform: translateX(30px);
    }
  }
`;

const ConfigForm = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    label {
      font-weight: 600;
      color: var(--text);
      font-size: 0.9rem;
    }
    
    .form-help {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }
  }
`;

const DaysSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  
  .day-button {
    padding: 8px 12px;
    border: 2px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    font-weight: 500;
    
    &.selected {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    
    &:hover:not(.selected) {
      border-color: var(--primary);
      color: var(--primary);
    }
  }
`;

const SaveButton = styled(Button)`
  margin-top: 30px;
  width: 100%;
  max-width: 200px;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ConfigPage = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    presential_mode_enabled: false,
    appointment_mode_enabled: false,
    appointment_working_hours: '08:00-18:00',
    appointment_interval_minutes: 30,
    appointment_break_hours: '12:00-13:00',
    appointment_always_scheduled: false,
    appointment_scheduled_days: [1, 2, 3, 4, 5] // Segunda a sexta
  });

  const weekDays = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' }
  ];

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    fetchConfig();
  }, [admin, navigate]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/config/attendance-mode');
      setConfig(response.data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleModeToggle = (mode) => {
    setConfig(prev => ({
      ...prev,
      [mode]: !prev[mode]
    }));
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDayToggle = (dayValue) => {
    setConfig(prev => {
      const currentDays = prev.appointment_scheduled_days || [];
      const newDays = currentDays.includes(dayValue)
        ? currentDays.filter(d => d !== dayValue)
        : [...currentDays, dayValue];
      
      return {
        ...prev,
        appointment_scheduled_days: newDays
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/config/attendance-mode', config);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const parseTimeRange = (timeRange) => {
    const [start, end] = timeRange.split('-');
    return { start, end };
  };

  const formatTimeRange = (start, end) => {
    return `${start}-${end}`;
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <Loading text="Carregando configurações..." />
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <BackButton onClick={() => navigate('/admin/dashboard')}>
          <FaArrowLeft />
          Voltar ao Dashboard
        </BackButton>

        <PageHeader>
          <h1>
            <FaCog />
            Configurações do Sistema
          </h1>
          <p>Configure os modos de atendimento e horários de funcionamento</p>
        </PageHeader>

        <ConfigSection>
          <h3>
            <FaUsers />
            Modo de Atendimento Presencial
          </h3>
          <div className="section-description">
            No modo presencial, os clientes chegam na barbearia e iniciam o atendimento pelo app/site.
            Eles selecionam os serviços, escolhem a forma de pagamento e entram na fila de espera.
          </div>
          
          <ModeToggle className={config.presential_mode_enabled ? 'enabled' : 'disabled'}>
            <div className="mode-info">
              <div className="mode-title">
                <FaUsers />
                Atendimento Presencial
              </div>
              <div className="mode-description">
                Cliente chega → seleciona serviços → escolhe pagamento → entra na fila
              </div>
            </div>
            <div 
              className={`toggle-switch ${config.presential_mode_enabled ? 'active' : ''}`}
              onClick={() => handleModeToggle('presential_mode_enabled')}
            >
              <div className="toggle-slider" />
            </div>
          </ModeToggle>
        </ConfigSection>

        <ConfigSection>
          <h3>
            <FaCalendarAlt />
            Modo de Agendamento
          </h3>
          <div className="section-description">
            No modo de agendamento, os clientes podem agendar horários específicos com antecedência.
            Configure os horários de funcionamento, intervalos e dias disponíveis.
          </div>
          
          <ModeToggle className={config.appointment_mode_enabled ? 'enabled' : 'disabled'}>
            <div className="mode-info">
              <div className="mode-title">
                <FaCalendarAlt />
                Sistema de Agendamento
              </div>
              <div className="mode-description">
                Cliente agenda → escolhe data/horário → confirma agendamento
              </div>
            </div>
            <div 
              className={`toggle-switch ${config.appointment_mode_enabled ? 'active' : ''}`}
              onClick={() => handleModeToggle('appointment_mode_enabled')}
            >
              <div className="toggle-slider" />
            </div>
          </ModeToggle>

          {config.appointment_mode_enabled && (
            <ConfigForm>
              <div className="form-group">
                <label>Horário de Funcionamento</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Input
                    type="time"
                    value={parseTimeRange(config.appointment_working_hours).start}
                    onChange={(e) => {
                      const { end } = parseTimeRange(config.appointment_working_hours);
                      handleConfigChange('appointment_working_hours', formatTimeRange(e.target.value, end));
                    }}
                  />
                  <span>até</span>
                  <Input
                    type="time"
                    value={parseTimeRange(config.appointment_working_hours).end}
                    onChange={(e) => {
                      const { start } = parseTimeRange(config.appointment_working_hours);
                      handleConfigChange('appointment_working_hours', formatTimeRange(start, e.target.value));
                    }}
                  />
                </div>
                <div className="form-help">Horário em que os agendamentos estão disponíveis</div>
              </div>

              <div className="form-group">
                <label>Intervalo entre Agendamentos (minutos)</label>
                <Input
                  type="number"
                  min="15"
                  max="120"
                  step="15"
                  value={config.appointment_interval_minutes}
                  onChange={(e) => handleConfigChange('appointment_interval_minutes', parseInt(e.target.value))}
                />
                <div className="form-help">Tempo mínimo entre um agendamento e outro</div>
              </div>

              <div className="form-group">
                <label>Horário de Descanso</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Input
                    type="time"
                    value={parseTimeRange(config.appointment_break_hours).start}
                    onChange={(e) => {
                      const { end } = parseTimeRange(config.appointment_break_hours);
                      handleConfigChange('appointment_break_hours', formatTimeRange(e.target.value, end));
                    }}
                  />
                  <span>até</span>
                  <Input
                    type="time"
                    value={parseTimeRange(config.appointment_break_hours).end}
                    onChange={(e) => {
                      const { start } = parseTimeRange(config.appointment_break_hours);
                      handleConfigChange('appointment_break_hours', formatTimeRange(start, e.target.value));
                    }}
                  />
                </div>
                <div className="form-help">Período em que não há agendamentos disponíveis</div>
              </div>

              <div className="form-group">
                <label>Dias para Agendamento</label>
                <DaysSelector>
                  {weekDays.map(day => (
                    <button
                      key={day.value}
                      className={`day-button ${config.appointment_scheduled_days?.includes(day.value) ? 'selected' : ''}`}
                      onClick={() => handleDayToggle(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </DaysSelector>
                <div className="form-help">Selecione os dias da semana em que os agendamentos estarão disponíveis</div>
              </div>
            </ConfigForm>
          )}
        </ConfigSection>

        <ConfigSection>
          <h3>
            <FaInfoCircle />
            Informações Importantes
          </h3>
          <div className="section-description">
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
              <li>Ambos os modos podem estar ativados simultaneamente</li>
              <li>Se nenhum modo estiver ativado, os clientes não poderão iniciar atendimentos</li>
              <li>As configurações são aplicadas imediatamente após salvar</li>
              <li>Métricas e relatórios incluem dados de ambos os modos</li>
            </ul>
          </div>
        </ConfigSection>

        <SaveButton 
          variant="primary" 
          onClick={handleSave}
          disabled={saving}
        >
          <FaSave />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </SaveButton>
      </Container>
      <Footer />
    </PageContainer>
  );
};

export default ConfigPage;
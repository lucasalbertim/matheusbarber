import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaCut, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { Button, Card, Input, Loading, Modal } from '../components';
import { formatDate, formatTime, formatDuration, formatCurrency } from '../utils';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: var(--primary);
    margin-bottom: 10px;
  }
  
  p {
    color: var(--text-secondary);
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

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  
  .step {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &.active {
      background: var(--primary);
      color: white;
    }
    
    &.completed {
      background: var(--success);
      color: white;
    }
    
    &.pending {
      background: var(--surface);
      color: var(--text-secondary);
      border: 2px solid var(--border);
    }
  }
  
  .step-connector {
    width: 40px;
    height: 2px;
    background: var(--border);
    margin: 0 10px;
    
    &.completed {
      background: var(--success);
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    
    .step-connector {
      width: 2px;
      height: 20px;
    }
  }
`;

const ServiceSelection = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
  
  h3 {
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }
`;

const ServiceCard = styled.div`
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.selected {
    border-color: var(--primary);
    background: rgba(32, 172, 159, 0.05);
    box-shadow: 0 4px 12px rgba(32, 172, 159, 0.2);
  }
  
  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  .service-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  .service-name {
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--text);
  }
  
  .service-price {
    font-weight: 700;
    color: var(--primary);
    font-size: 1.2rem;
  }
  
  .service-description {
    color: var(--text-secondary);
    margin-bottom: 12px;
    font-size: 0.9rem;
  }
  
  .service-duration {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`;

const DateSelection = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
  
  h3 {
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    margin-bottom: 20px;
  }
  
  .calendar-header {
    text-align: center;
    font-weight: 600;
    color: var(--text-secondary);
    padding: 8px;
  }
  
  .calendar-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    
    &:hover:not(.disabled) {
      background: var(--primary-light);
      border-color: var(--primary);
    }
    
    &.selected {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    
    &.disabled {
      background: var(--surface);
      color: var(--text-secondary);
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    &.today {
      border-color: var(--primary);
      font-weight: 700;
    }
  }
`;

const TimeSelection = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
  
  h3 {
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .time-slots {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
  }
  
  .time-slot {
    padding: 12px;
    border: 2px solid var(--border);
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    
    &:hover:not(.disabled) {
      border-color: var(--primary);
      background: var(--primary-light);
    }
    
    &.selected {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    
    &.disabled {
      background: var(--surface);
      color: var(--text-secondary);
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
`;

const Summary = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
  
  h3 {
    color: var(--primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    
    &:last-child {
      border-bottom: none;
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--primary);
    }
  }
  
  .summary-label {
    color: var(--text-secondary);
  }
  
  .summary-value {
    font-weight: 600;
    color: var(--text);
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ClientStartAttendancePage = () => {
  const navigate = useNavigate();
  const { client } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appointmentConfig, setAppointmentConfig] = useState({
    working_hours: '08:00-18:00',
    interval_minutes: 30,
    break_hours: '12:00-13:00',
    scheduled_days: [1, 2, 3, 4, 5],
    always_scheduled: false
  });

  const steps = [
    { id: 1, name: 'Serviço', icon: FaCut },
    { id: 2, name: 'Data', icon: FaCalendarAlt },
    { id: 3, name: 'Horário', icon: FaClock },
    { id: 4, name: 'Resumo', icon: FaCheck }
  ];

  useEffect(() => {
    if (!client) {
      navigate('/cliente/login');
      return;
    }
    
    fetchServices();
    fetchAppointmentConfig();
  }, [client, navigate]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/');
      setServices(response.data.filter(service => service.is_active));
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentConfig = async () => {
    try {
      const response = await api.get('/config/attendance-mode');
      const config = response.data;

      if (config.appointment_mode_enabled) {
        // Conversão dos valores vindos do backend
        let interval = config.appointment_interval_minutes;
        if (typeof interval === 'string') interval = parseInt(interval);

        let scheduledDays = config.appointment_scheduled_days;
        if (typeof scheduledDays === 'string') {
          scheduledDays = scheduledDays.split(',').map(x => parseInt(x));
        }

        setAppointmentConfig({
          working_hours: config.appointment_working_hours || '08:00-18:00',
          interval_minutes: interval || 30,
          break_hours: config.appointment_break_hours || '12:00-13:00',
          scheduled_days: scheduledDays || [1, 2, 3, 4, 5],
          always_scheduled: config.appointment_always_scheduled || false
        });
      } else {
        toast.error('Sistema de agendamento não está disponível no momento');
        navigate('/cliente/dashboard');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações de agendamento');
      // Usar valores padrão em caso de erro
      setAppointmentConfig({
        working_hours: '08:00-18:00',
        interval_minutes: 30,
        break_hours: '12:00-13:00',
        scheduled_days: [1, 2, 3, 4, 5],
        always_scheduled: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Substitui a função para buscar horários ocupados e marcar slots como busy
  const generateAvailableSlots = async (date) => {
    const slots = [];
    const { working_hours, interval_minutes, break_hours } = appointmentConfig;
    
    // Parse working hours
    const [startTime, endTime] = working_hours.split('-');
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Parse break hours
    const [breakStart, breakEnd] = break_hours.split('-');
    const [breakStartHour, breakStartMinute] = breakStart.split(':').map(Number);
    const [breakEndHour, breakEndMinute] = breakEnd.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
    const breakEndMinutes = breakEndHour * 60 + breakEndMinute;

    // Buscar horários ocupados do backend
    let busySlots = [];
    try {
      const startDate = new Date(date);
      startDate.setHours(0,0,0,0);
      const endDate = new Date(date);
      endDate.setHours(23,59,59,999);
      const startIso = startDate.toISOString();
      const endIso = endDate.toISOString();
      const response = await api.get(`/admin/attendance/scheduled?start_date=${startIso}&end_date=${endIso}`);
      busySlots = response.data
        .filter(a => a.status === 'waiting' || a.status === 'progress')
        .map(a => {
          const d = new Date(a.appointment_date);
          return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        });
    } catch (err) {
      busySlots = [];
    }

    for (let minutes = startMinutes; minutes + interval_minutes <= endMinutes; minutes += interval_minutes) {
      if (minutes >= breakStartMinutes && minutes < breakEndMinutes) {
        continue;
      }
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({ time, busy: busySlots.includes(time) });
    }
    setAvailableSlots(slots);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  // Atualiza handleDateSelect para usar a função assíncrona
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    await generateAvailableSlots(date);
    setCurrentStep(3);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setCurrentStep(4);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Por favor, complete todas as etapas');
      return;
    }

    try {
      setSubmitting(true);

      const appointmentDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Envia o horário local no formato 'YYYY-MM-DDTHH:mm:00'
      const pad = (n) => n.toString().padStart(2, '0');
      const localDateStr = `${appointmentDate.getFullYear()}-${pad(appointmentDate.getMonth()+1)}-${pad(appointmentDate.getDate())}T${pad(appointmentDate.getHours())}:${pad(appointmentDate.getMinutes())}:00`;

      const attendanceData = {
        client_id: client.id,
        service_ids: [selectedService.id],
        appointment_date: localDateStr,
        attendance_type: 'appointment'
      };

      console.log('Enviando agendamento para:', localDateStr);
      const response = await api.post('/attendance/', attendanceData);

      toast.success('Agendamento realizado com sucesso!');
      navigate('/cliente/atendimento/resumo', {
        state: { attendance: response.data }
      });

    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      const errorMsg = error.response?.data?.detail || 'Erro ao realizar agendamento';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const { scheduled_days, always_scheduled } = appointmentConfig;
    
    // Dias da semana
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekdays.forEach(day => {
      days.push({ type: 'header', label: day });
    });
    
    // Dias vazios no início
    for (let i = 0; i < currentMonth.getDay(); i++) {
      days.push({ type: 'empty' });
    }
    
    // Dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;
      // Corrigir para garantir que o dia da semana está correto (0=domingo, 1=segunda, ...)
      const dayOfWeek = date.getDay();
      // scheduled_days deve ser array de inteiros compatível com getDay()
      const isScheduledDay = always_scheduled || scheduled_days.includes(dayOfWeek);

      days.push({
        type: 'day',
        day,
        date,
        isToday,
        isPast,
        isScheduledDay,
        dayOfWeek // para debug
      });
    }
    
    return days;
  };

  if (loading) {
    return (
      <Container>
        <Loading text="Carregando serviços..." />
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate('/cliente/dashboard')}>
        <FaArrowLeft />
        Voltar ao Dashboard
      </BackButton>

      <Header>
        <h1>Agendar Atendimento</h1>
        <p>Escolha o serviço, data e horário para seu agendamento</p>
      </Header>

      <StepIndicator>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`step ${currentStep === step.id ? 'active' : currentStep > step.id ? 'completed' : 'pending'}`}>
              <step.icon />
              {step.name}
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${currentStep > step.id ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </StepIndicator>

      {currentStep === 1 && (
        <ServiceSelection>
          <h3>
            <FaCut />
            Escolha o Serviço
          </h3>
          <div className="services-grid">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                onClick={() => handleServiceSelect(service)}
              >
                <div className="service-header">
                  <div className="service-name">{service.name}</div>
                  <div className="service-price">{formatCurrency(service.price)}</div>
                </div>
                <div className="service-description">{service.description}</div>
                <div className="service-duration">
                  <FaClock />
                  {formatDuration(service.duration_minutes)}
                </div>
              </ServiceCard>
            ))}
          </div>
        </ServiceSelection>
      )}

      {currentStep === 2 && selectedService && (
        <DateSelection>
          <h3>
            <FaCalendarAlt />
            Escolha a Data
          </h3>
          <div className="calendar-grid">
            {generateCalendarDays().map((day, index) => {
              if (day.type === 'header') {
                return (
                  <div key={index} className="calendar-header">
                    {day.label}
                  </div>
                );
              }
              
              if (day.type === 'empty') {
                return <div key={index} />;
              }
              
              return (
                <div
                  key={index}
                  className={`calendar-day ${day.isToday ? 'today' : ''} ${day.isPast ? 'disabled' : ''} ${!day.isScheduledDay ? 'disabled' : ''}`}
                  onClick={() => !day.isPast && day.isScheduledDay && handleDateSelect(day.date)}
                >
                  {day.day}
                </div>
              );
            })}
          </div>
        </DateSelection>
      )}

      {currentStep === 3 && selectedService && selectedDate && (
        <TimeSelection>
          <h3>
            <FaClock />
            Escolha o Horário
          </h3>
          <div className="time-slots">
            {availableSlots.map(slot => (
              <div
                key={slot.time}
                className={`time-slot ${selectedTime === slot.time ? 'selected' : ''} ${slot.busy ? 'disabled' : ''}`}
                onClick={() => !slot.busy && handleTimeSelect(slot.time)}
                style={slot.busy ? { pointerEvents: 'none', opacity: 0.5, background: '#eee', color: '#aaa' } : {}}
              >
                {slot.time}
              </div>
            ))}
          </div>
        </TimeSelection>
      )}

      {currentStep === 4 && selectedService && selectedDate && selectedTime && (
        <Summary>
          <h3>
            <FaCheck />
            Resumo do Agendamento
          </h3>
          
          <div className="summary-item">
            <span className="summary-label">Serviço:</span>
            <span className="summary-value">{selectedService.name}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Data:</span>
            <span className="summary-value">{formatDate(selectedDate)}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Horário:</span>
            <span className="summary-value">{selectedTime}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Duração:</span>
            <span className="summary-value">{formatDuration(selectedService.duration_minutes)}</span>
          </div>
          
          <div className="summary-item">
            <span className="summary-label">Valor:</span>
            <span className="summary-value">{formatCurrency(selectedService.price)}</span>
          </div>
        </Summary>
      )}

      <NavigationButtons>
        {currentStep > 1 && (
          <Button variant="ghost" onClick={handlePreviousStep}>
            Voltar
          </Button>
        )}
        
        {currentStep < 4 ? (
          <Button 
            variant="primary" 
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && !selectedService) ||
              (currentStep === 2 && !selectedDate) ||
              (currentStep === 3 && !selectedTime)
            }
          >
            Próximo
          </Button>
        ) : (
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={submitting}
            fullWidth
          >
            {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
          </Button>
        )}
      </NavigationButtons>

      <Footer />
    </Container>
  );
};

export default ClientStartAttendancePage;

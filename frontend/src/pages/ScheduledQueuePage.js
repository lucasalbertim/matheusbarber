import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaClock, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaSync, FaPlay } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import Footer from '../components/Footer';
import { Button, Card, Loading } from '../components';
import dayjs from 'dayjs';

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  .empty-icon { font-size: 4rem; margin-bottom: 20px; opacity: 0.5; }
  h3 { margin-bottom: 10px; color: var(--text); }
  p { margin-bottom: 20px; }
`;
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
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
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
    h1 { font-size: 2rem; }
        p { font-size: 1rem; }
      }
    `;
    const QueueStats = styled.div`
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    `;
    const StatCard = styled(Card)`
      padding: 24px;
      text-align: center;
      .stat-icon { font-size: 2.5rem; color: var(--primary); margin-bottom: 16px; }
      .stat-number { font-size: 2rem; font-weight: 700; color: var(--primary); margin-bottom: 8px; }
      .stat-label { color: var(--text-secondary); font-size: 1rem; }
    `;
    const QueueList = styled(Card)`
      padding: 24px;
      margin-bottom: 30px;
      h3 { color: var(--primary); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    `;
    const QueueItem = styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border: 2px solid var(--border);
      border-radius: 12px;
      margin-bottom: 16px;
      transition: all 0.2s ease;
      &:last-child { margin-bottom: 0; }
      &.current { border-color: var(--success); background: rgba(40, 167, 69, 0.05); box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2); }
      &.waiting { border-color: var(--warning); background: rgba(255, 193, 7, 0.05); }
      .queue-info { flex: 1; .position { font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 8px; } .client-name { font-weight: 600; color: var(--text); margin-bottom: 4px; } .services { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 4px; } .arrival-time { color: var(--text-secondary); font-size: 0.8rem; } }
      .queue-actions { display: flex; gap: 8px; align-items: center; }
      .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; &.current { background: var(--success); color: white; } &.waiting { background: var(--warning); color: white; } }
      @media (max-width: 768px) { flex-direction: column; align-items: flex-start; gap: 16px; .queue-actions { width: 100%; justify-content: space-between; } }
    `;

    const ScheduledQueuePage = () => {
      const navigate = useNavigate();
      const [queue, setQueue] = useState([]);
      const [attending, setAttending] = useState([]);
      const [loading, setLoading] = useState(true);
      const [refreshing, setRefreshing] = useState(false);
      const [stats, setStats] = useState({ totalWaiting: 0, currentAttending: 0, completedToday: 0 });
      const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

      useEffect(() => {
        fetchQueueData();
        const interval = setInterval(fetchQueueData, 30000);
        return () => clearInterval(interval);
      }, [selectedDate]);

      const [finished, setFinished] = useState([]);

      const fetchQueueData = async () => {
        try {
          setRefreshing(true);
          const startDate = `${selectedDate}T00:00:00`;
          const endDate = `${selectedDate}T23:59:59`;
          const response = await api.get(`/admin/attendance/scheduled?start_date=${startDate}&end_date=${endDate}`);
          const scheduledAttendances = response.data;
          // Separar atendimentos aguardando, em andamento e finalizados
          const waitingQueue = scheduledAttendances
            .filter(a => a.status === 'waiting')
            .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
          const attendingQueue = scheduledAttendances.filter(a => a.status === 'progress').sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
          const finishedQueue = scheduledAttendances.filter(a => a.status === 'finished').sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
          setQueue(waitingQueue);
          setAttending(attendingQueue);
          setFinished(finishedQueue);
          // Estatísticas
          setStats({
            totalWaiting: waitingQueue.length,
            currentAttending: attendingQueue.length,
            completedToday: finishedQueue.length
          });
        } catch (error) {
          toast.error('Erro ao carregar fila de agendamentos');
          setQueue([]);
          setAttending([]);
          setFinished([]);
          setStats({ totalWaiting: 0, currentAttending: 0, completedToday: 0 });
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };

      const handleStartAttendance = async (attendanceId) => {
        try {
          await api.put(`/attendance/${attendanceId}`, { status: 'progress' });
          toast.success('Atendimento iniciado!');
          fetchQueueData();
        } catch (error) {
          toast.error('Erro ao iniciar atendimento');
        }
      };

      const handleCompleteAttendance = async (attendanceId) => {
        try {
          await api.put(`/attendance/${attendanceId}`, { status: 'finished' });
          toast.success('Atendimento finalizado!');
          fetchQueueData();
        } catch (error) {
          toast.error('Erro ao finalizar atendimento');
        }
      };

      const handleCancelAttendance = async (attendanceId) => {
        if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
          try {
            await api.put(`/admin/attendance/${attendanceId}/cancel`, { cancellation_reason: 'Cancelado pelo administrador' });
            toast.success('Agendamento cancelado!');
            fetchQueueData();
          } catch (error) {
            toast.error('Erro ao cancelar agendamento');
          }
        }
      };

      const getServicesText = (services) => {
        if (!services || services.length === 0) return 'Nenhum serviço';
        if (services.length === 1) return services[0].name;
        return `${services.length} serviços`;
      };

      const getTotalPrice = (services) => {
        if (!services || services.length === 0) return 0;
        return services.reduce((total, service) => total + (service.price || 0), 0);
      };

      if (loading) {
        return (
          <PageContainer>
            <Container>
              <Loading text="Carregando fila de agendamentos..." />
            </Container>
          </PageContainer>
        );
      }

      return (
        <PageContainer>
          <Container>
            <BackButton onClick={() => navigate('/admin/dashboard')}>
              <FaArrowLeft /> Voltar ao Dashboard
            </BackButton>
            <PageHeader>
              <h1>
                <FaUsers /> Gestão de Fila - Agendamentos
              </h1>
              <p>Gerencie a fila de clientes agendados</p>
            </PageHeader>
            <QueueStats>
              <StatCard>
                <div className="stat-icon">⏳</div>
                <div className="stat-number">{stats.totalWaiting}</div>
                <div className="stat-label">Aguardando</div>
              </StatCard>
              <StatCard>
                <div className="stat-icon">✂️</div>
                <div className="stat-number">{stats.currentAttending}</div>
                <div className="stat-label">Em Atendimento</div>
              </StatCard>
              <StatCard>
                <div className="stat-icon">✅</div>
                <div className="stat-number">{stats.completedToday}</div>
                <div className="stat-label">Concluídos Hoje</div>
              </StatCard>
            </QueueStats>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, marginRight: 12 }}>Filtrar por data:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '30px' }}>
              <QueueList>
                <h3>
                  <FaUsers /> Aguardando Atendimento
                </h3>
                {queue.length > 0 ? (
                  queue.map((attendance, index) => (
                    <QueueItem key={attendance.id} className={index === 0 ? 'current' : 'waiting'}>
                      <div className="queue-info">
                        <div className="position">#{attendance.queue_position || index + 1}</div>
                        <div className="client-name">{attendance.client?.name || 'Cliente não encontrado'}</div>
                        <div className="services">
                          {getServicesText(attendance.services)}
                          {attendance.services && attendance.services.length > 0 && (
                            <span> - R$ {getTotalPrice(attendance.services).toFixed(2)}</span>
                          )}
                          <span style={{ marginLeft: 8 }}>
                            {attendance.payment_method === 'cash' && '💵'}
                            {attendance.payment_method === 'card' && '💳'}
                            {attendance.payment_method === 'pix' && '📱'}
                            {!attendance.payment_method && '❓'}
                          </span>
                        </div>
                        <div className="arrival-time">Agendado para {dayjs(attendance.appointment_date).format('HH:mm')}</div>
                      </div>
                      <div className="queue-actions">
                        <div className="status-badge current">{index === 0 ? 'Próximo' : 'Aguardando'}</div>
                        {index === 0 && (
                          <Button variant="success" size="sm" onClick={() => handleStartAttendance(attendance.id)}>
                            <FaPlay /> Iniciar
                          </Button>
                        )}
                        <Button variant="danger" size="sm" onClick={() => handleCancelAttendance(attendance.id)}>
                          <FaTimesCircle /> Cancelar
                        </Button>
                      </div>
                    </QueueItem>
                  ))
                ) : (
                  <EmptyState>
                    <div className="empty-icon">👥</div>
                    <h3>Fila Vazia</h3>
                    <p>Não há agendamentos aguardando atendimento no momento.</p>
                  </EmptyState>
                )}
              </QueueList>
              <QueueList>
                <h3>
                  <FaCheckCircle /> Em Atendimento
                </h3>
                {attending.length > 0 ? (
                  attending.map((attendance) => (
                    <QueueItem key={attendance.id} className="current">
                      <div className="queue-info">
                        <div className="position">#{attendance.queue_position}</div>
                        <div className="client-name">{attendance.client?.name || 'Cliente não encontrado'}</div>
                        <div className="services">
                          {getServicesText(attendance.services)}
                          {attendance.services && attendance.services.length > 0 && (
                            <span> - R$ {getTotalPrice(attendance.services).toFixed(2)}</span>
                          )}
                        </div>
                        <div className="arrival-time">Agendado para {dayjs(attendance.appointment_date).format('HH:mm')}</div>
                      </div>
                      <div className="queue-actions">
                        <div className="status-badge current">Em Atendimento</div>
                        <Button variant="success" size="sm" onClick={() => handleCompleteAttendance(attendance.id)}>
                          <FaCheckCircle /> Finalizar
                        </Button>
                      </div>
                    </QueueItem>
                  ))
                ) : (
                  <EmptyState>
                    <div className="empty-icon">✂️</div>
                    <h3>Ninguém em atendimento</h3>
                    <p>Não há agendamentos sendo atendidos no momento.</p>
                  </EmptyState>
                )}
              </QueueList>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <QueueList>
                <h3>
                  <FaCheckCircle /> Concluídos
                </h3>
                {finished.length > 0 ? (
                  finished.map((attendance) => (
                    <QueueItem key={attendance.id} className="current">
                      <div className="queue-info">
                        <div className="position">#{attendance.queue_position}</div>
                        <div className="client-name">{attendance.client?.name || 'Cliente não encontrado'}</div>
                        <div className="services">
                          {getServicesText(attendance.services)}
                          {attendance.services && attendance.services.length > 0 && (
                            <span> - R$ {getTotalPrice(attendance.services).toFixed(2)}</span>
                          )}
                        </div>
                        <div className="arrival-time">Agendado para {dayjs(attendance.appointment_date).format('HH:mm')}</div>
                      </div>
                      <div className="queue-actions">
                        <div className="status-badge current">Concluído</div>
                      </div>
                    </QueueItem>
                  ))
                ) : (
                  <EmptyState>
                    <div className="empty-icon">✅</div>
                    <h3>Nenhum atendimento concluído</h3>
                    <p>Não há agendamentos concluídos para o filtro selecionado.</p>
                  </EmptyState>
                )}
              </QueueList>
            </div>
          </Container>
          <Footer />
        </PageContainer>
      );
    };

    export default ScheduledQueuePage;

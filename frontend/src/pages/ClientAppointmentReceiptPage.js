import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaCalendarCheck, FaDownload, FaHome } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { formatCurrency, formatDateTime } from '../utils';

const Container = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  margin-bottom: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;

  h1 {
    color: var(--primary);
    margin-bottom: 8px;
  }

  p {
    color: var(--text-secondary);
  }
`;

const ReceiptCard = styled.div`
  background: white;
  border: 2px dashed var(--primary);
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 20px;
`;

const ReceiptHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;

  .icon {
    font-size: 42px;
    color: var(--primary);
    margin-bottom: 10px;
  }

  h2 {
    color: var(--primary);
    margin: 0 0 6px;
  }

  p {
    margin: 0;
    color: var(--text-secondary);
  }
`;

const InfoBlock = styled.div`
  margin-bottom: 18px;
`;

const InfoTitle = styled.h3`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);

  span:first-child {
    color: var(--text-secondary);
  }

  span:last-child {
    font-weight: 600;
    color: var(--text);
    text-align: right;
  }
`;

const ServiceLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  flex: 1;
  min-width: 200px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  background: ${({ variant }) => (variant === 'ghost' ? 'var(--surface)' : 'var(--primary)')};
  color: ${({ variant }) => (variant === 'ghost' ? 'var(--text)' : 'white')};
`;

const ClientAppointmentReceiptPage = () => {
  const { client } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const appointmentPayload = location.state?.appointment;
  const attendance = appointmentPayload?.attendance || null;
  const queuePosition = appointmentPayload?.queue_position ?? null;

  const services = attendance?.services || [];

  const totalPrice = useMemo(
    () => services.reduce((sum, service) => sum + (service.price || 0), 0),
    [services]
  );

  const totalMinutes = useMemo(
    () => services.reduce((sum, service) => sum + (service.duration_minutes || 0), 0),
    [services]
  );

  React.useEffect(() => {
    if (!client) {
      navigate('/cliente/login');
      return;
    }
    if (!attendance) {
      navigate('/cliente/dashboard');
    }
  }, [client, attendance, navigate]);

  if (!client || !attendance) return null;

  const handleDownloadReceipt = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = Math.max(1200, 760 + services.length * 46);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#20ac9f';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Matheus Barber', 60, 90);

    ctx.fillStyle = '#222222';
    ctx.font = 'bold 38px Arial';
    ctx.fillText('Comprovante de Agendamento', 60, 150);

    ctx.font = '28px Arial';
    ctx.fillStyle = '#444444';
    ctx.fillText(`Protocolo: #${attendance.id}`, 60, 220);
    ctx.fillText(`Cliente: ${attendance.client?.name || client.name || 'Cliente'}`, 60, 270);
    ctx.fillText(`Data/Hora: ${formatDateTime(attendance.appointment_date)}`, 60, 320);
    ctx.fillText(`Ordem de fila: ${queuePosition ?? '-'}`, 60, 370);

    ctx.fillStyle = '#20ac9f';
    ctx.fillRect(60, 410, 1080, 3);

    ctx.fillStyle = '#222222';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('Serviços', 60, 460);

    let y = 510;
    ctx.font = '26px Arial';
    services.forEach((service) => {
      ctx.fillStyle = '#333333';
      ctx.fillText(`- ${service.name}`, 60, y);
      ctx.fillStyle = '#111111';
      ctx.fillText(formatCurrency(service.price || 0), 900, y);
      y += 42;
    });

    y += 16;
    ctx.fillStyle = '#20ac9f';
    ctx.fillRect(60, y, 1080, 3);
    y += 55;

    ctx.fillStyle = '#222222';
    ctx.font = 'bold 30px Arial';
    ctx.fillText(`Duração total: ${totalMinutes} min`, 60, y);
    y += 46;
    ctx.fillText(`Valor total: ${formatCurrency(totalPrice)}`, 60, y);
    y += 70;

    ctx.fillStyle = '#666666';
    ctx.font = '24px Arial';
    ctx.fillText(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, 60, y);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `comprovante-agendamento-${attendance.id}.png`;
    link.click();
  };

  return (
    <Container>
      <BackButton onClick={() => navigate('/cliente/dashboard')}>
        <FaArrowLeft />
        Voltar ao Dashboard
      </BackButton>

      <Header>
        <h1>Agendamento confirmado</h1>
        <p>Seu comprovante está pronto para salvar.</p>
      </Header>

      <ReceiptCard>
        <ReceiptHeader>
          <div className="icon">
            <FaCalendarCheck />
          </div>
          <h2>Comprovante de Agendamento</h2>
          <p>Protocolo #{attendance.id}</p>
        </ReceiptHeader>

        <InfoBlock>
          <InfoTitle>Dados do agendamento</InfoTitle>
          <InfoRow>
            <span>Cliente</span>
            <span>{attendance.client?.name || client.name || '-'}</span>
          </InfoRow>
          <InfoRow>
            <span>Data e horário</span>
            <span>{formatDateTime(attendance.appointment_date)}</span>
          </InfoRow>
          <InfoRow>
            <span>Posição na fila</span>
            <span>{queuePosition ?? '-'}</span>
          </InfoRow>
          <InfoRow>
            <span>Status</span>
            <span>Aguardando</span>
          </InfoRow>
        </InfoBlock>

        <InfoBlock>
          <InfoTitle>Serviços</InfoTitle>
          {services.map((service) => (
            <ServiceLine key={service.id}>
              <span>{service.name}</span>
              <strong>{formatCurrency(service.price || 0)}</strong>
            </ServiceLine>
          ))}
          <TotalRow>
            <span>Total</span>
            <span>{formatCurrency(totalPrice)}</span>
          </TotalRow>
        </InfoBlock>
      </ReceiptCard>

      <Actions>
        <ActionButton onClick={handleDownloadReceipt}>
          <FaDownload />
          Salvar comprovante em imagem
        </ActionButton>
        <ActionButton variant="ghost" onClick={() => navigate('/cliente/dashboard')}>
          <FaHome />
          Ir para Dashboard
        </ActionButton>
      </Actions>

      <Footer />
    </Container>
  );
};

export default ClientAppointmentReceiptPage;

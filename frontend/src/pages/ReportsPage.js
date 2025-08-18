import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaDownload, FaChartBar, FaUsers, FaMoneyBillWave, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: var(--primary);
  margin: 0;
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

  &:hover {
    color: var(--primary);
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const FilterTitle = styled.h3`
  color: var(--text);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.label`
  margin-bottom: 8px;
  color: var(--text);
  font-weight: 600;
`;

const FilterInput = styled.input`
  padding: 10px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const FilterSelect = styled.select`
  padding: 10px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  background: white;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const FilterButton = styled.button`
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: var(--primary-dark);
  }
`;

const ExportButton = styled.button`
  padding: 12px 24px;
  background: var(--success);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--success-dark);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-left: 4px solid var(--primary);

  &.revenue { border-left-color: var(--success); }
  &.clients { border-left-color: var(--info); }
  &.attendances { border-left-color: var(--warning); }
  &.average { border-left-color: var(--secondary); }

  .icon {
    font-size: 2.5rem;
    color: var(--primary);
    margin-bottom: 15px;
  }

  .number {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 8px;
  }

  .label {
    color: var(--text-light);
    font-weight: 600;
    margin-bottom: 10px;
  }

  .change {
    font-size: 14px;
    font-weight: 600;

    &.positive { color: var(--success); }
    &.negative { color: var(--error); }
    &.neutral { color: var(--text-light); }
  }
`;

const ChartsSection = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const ChartTitle = styled.h3`
  color: var(--text);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ChartPlaceholder = styled.div`
  background: var(--background);
  border: 2px dashed var(--border);
  border-radius: 8px;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-light);

  .icon {
    font-size: 3rem;
    color: var(--border);
    margin-bottom: 15px;
  }

  h4 {
    margin-bottom: 10px;
    color: var(--text);
  }
`;

const TableSection = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 20px;
  padding: 20px;
  background: var(--background);
  font-weight: 600;
  color: var(--text);
  border-bottom: 2px solid var(--border);
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid var(--border);
  align-items: center;

  &:hover {
    background: var(--background);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);

  h3 {
    margin-bottom: 10px;
    color: var(--text);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
`;

const ReportsPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    period: 'month'
  });
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalClients: 0,
    totalAttendances: 0,
    averageTicket: 0
  });
  const [topClients, setTopClients] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  const fetchReports = useCallback(async () => {
    try {
      const params = {
        period: filters.period
      };
      
      if (filters.startDate && filters.endDate) {
        params.start_date = filters.startDate;
        params.end_date = filters.endDate;
      }

      const [metricsResponse, clientsResponse, revenueResponse] = await Promise.all([
        api.get('/admin/reports/summary-by-period', { params }),
        api.get('/admin/reports/top-clients'),
        api.get('/admin/reports/revenue-chart', { params })
      ]);

      setMetrics(metricsResponse.data);
      setTopClients(clientsResponse.data);
      setRevenueData(revenueResponse.data);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/login');
      return;
    }
    fetchReports();
  }, [isAdmin, navigate, fetchReports]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchReports();
  };

  const handleExportData = async () => {
    try {
      const response = await api.get('/admin/reports/export', {
        params: filters,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const handleBackClick = () => {
    navigate('/admin/dashboard');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingState>
          <h3>Carregando relatórios...</h3>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Relatórios e Métricas</Title>
        <BackButton onClick={handleBackClick}>
          <FaArrowLeft />
          Voltar ao Dashboard
        </BackButton>
      </Header>

      <FilterSection>
        <FilterTitle>
          <FaFilter />
          Filtros de Relatório
        </FilterTitle>
        
        <FilterRow>
          <FilterGroup>
            <FilterLabel>Data Inicial</FilterLabel>
            <FilterInput
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Data Final</FilterLabel>
            <FilterInput
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Período</FilterLabel>
            <FilterSelect
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
            >
              <option value="day">Diário</option>
              <option value="week">Semanal</option>
              <option value="month">Mensal</option>
              <option value="quarter">Trimestral</option>
              <option value="year">Anual</option>
            </FilterSelect>
          </FilterGroup>
        </FilterRow>
        
        <FilterActions>
          <FilterButton onClick={handleApplyFilters}>
            Aplicar Filtros
          </FilterButton>
          
          <ExportButton onClick={handleExportData}>
            <FaDownload />
            Exportar Relatório
          </ExportButton>
        </FilterActions>
      </FilterSection>

      <MetricsGrid>
        <MetricCard className="revenue">
          <div className="icon">
            <FaMoneyBillWave />
          </div>
          <div className="number">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="label">Receita Total</div>
          <div className={`change ${(metrics.growthPercentages?.revenueGrowth || 0) >= 0 ? 'positive' : 'negative'}`}>
            {metrics.growthPercentages?.revenueGrowth ? `${metrics.growthPercentages.revenueGrowth >= 0 ? '+' : ''}${metrics.growthPercentages.revenueGrowth.toFixed(1)}%` : '0%'} vs período anterior
          </div>
        </MetricCard>
        
        <MetricCard className="clients">
          <div className="icon">
            <FaUsers />
          </div>
          <div className="number">{metrics.totalClients}</div>
          <div className="label">Total de Clientes</div>
          <div className={`change ${(metrics.growthPercentages?.clientsGrowth || 0) >= 0 ? 'positive' : 'negative'}`}>
            {metrics.growthPercentages?.clientsGrowth ? `${metrics.growthPercentages.clientsGrowth >= 0 ? '+' : ''}${metrics.growthPercentages.clientsGrowth.toFixed(1)}%` : '0%'} vs período anterior
          </div>
        </MetricCard>
        
        <MetricCard className="attendances">
          <div className="icon">
            <FaCalendarAlt />
          </div>
          <div className="number">{metrics.totalAttendances}</div>
          <div className="label">Total de Atendimentos</div>
          <div className={`change ${(metrics.growthPercentages?.attendancesGrowth || 0) >= 0 ? 'positive' : 'negative'}`}>
            {metrics.growthPercentages?.attendancesGrowth ? `${metrics.growthPercentages.attendancesGrowth >= 0 ? '+' : ''}${metrics.growthPercentages.attendancesGrowth.toFixed(1)}%` : '0%'} vs período anterior
          </div>
        </MetricCard>
        
        <MetricCard className="average">
          <div className="icon">
            <FaChartBar />
          </div>
          <div className="number">{formatCurrency(metrics.averageTicket)}</div>
          <div className="label">Ticket Médio</div>
          <div className={`change ${(metrics.growthPercentages?.averageTicketGrowth || 0) >= 0 ? 'positive' : 'negative'}`}>
            {metrics.growthPercentages?.averageTicketGrowth ? `${metrics.growthPercentages.averageTicketGrowth >= 0 ? '+' : ''}${metrics.growthPercentages.averageTicketGrowth.toFixed(1)}%` : '0%'} vs período anterior
          </div>
        </MetricCard>
      </MetricsGrid>

      <ChartsSection>
        <ChartTitle>
          <FaChartBar />
          Receita por Período
        </ChartTitle>
        {revenueData.length > 0 ? (
          <SimpleChart data={revenueData} />
        ) : (
          <ChartPlaceholder>
            <div className="icon">
              <FaChartBar />
            </div>
            <h4>Nenhum dado disponível</h4>
            <p>Não há dados de receita para o período selecionado.</p>
          </ChartPlaceholder>
        )}
      </ChartsSection>

      <TableSection>
        <TableHeader>
          <div>Cliente</div>
          <div>Total de Visitas</div>
          <div>Receita Total</div>
          <div>Última Visita</div>
          <div>Status</div>
        </TableHeader>

        {topClients.length === 0 ? (
          <EmptyState>
            <h3>Nenhum cliente encontrado</h3>
            <p>Comece cadastrando clientes para gerar relatórios.</p>
          </EmptyState>
        ) : (
          topClients.map((client) => (
            <TableRow key={client.id}>
              <div>
                    <strong>{client.name}</strong>
                    <br />
                    <small>{client.phone}</small>
                  </div>
                  <div>{client.totalVisits}</div>
                  <div>{formatCurrency(client.totalRevenue)}</div>
                  <div>{formatDate(client.lastVisit)}</div>
                  <div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: client.status === 'active' ? '#d4edda' : '#f8d7da',
                      color: client.status === 'active' ? '#155724' : '#721c24'
                    }}>
                      {client.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
            </TableRow>
          ))
        )}
      </TableSection>
    </Container>
  );
};

// Componente de gráfico simples usando Canvas
const SimpleChart = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Encontrar valores máximo e mínimo
    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const minRevenue = Math.min(...data.map(d => d.revenue));
    const range = maxRevenue - minRevenue || 1;

    // Configurações
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const pointSpacing = chartWidth / (data.length - 1);

    // Desenhar grade
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Linhas horizontais
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Linhas verticais
    for (let i = 0; i < data.length; i++) {
      const x = padding + pointSpacing * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Desenhar linha do gráfico
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding + pointSpacing * index;
      const y = height - padding - ((point.revenue - minRevenue) / range) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Desenhar pontos
    ctx.fillStyle = '#28a745';
    data.forEach((point, index) => {
      const x = padding + pointSpacing * index;
      const y = height - padding - ((point.revenue - minRevenue) / range) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Desenhar labels do eixo Y
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const value = minRevenue + (range / 5) * i;
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(`R$ ${value.toFixed(0)}`, padding - 10, y + 4);
    }

    // Desenhar labels do eixo X
    ctx.textAlign = 'center';
    data.forEach((point, index) => {
      const x = padding + pointSpacing * index;
      const y = height - padding + 20;
      
      // Rotacionar texto para melhor legibilidade
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(point.label, 0, 0);
      ctx.restore();
    });

  }, [data]);

  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default ReportsPage;
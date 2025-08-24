#!/usr/bin/env python3
"""
Script para testar métricas de receita e verificar dados no banco
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, func, and_
from sqlalchemy.orm import sessionmaker
from models import Attendance, Service, Client
from datetime import datetime, date, timedelta
from services.attendance_service import AttendanceService

# Configuração do banco
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/matheusbarber"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_database_data():
    """Testar dados no banco"""
    db = SessionLocal()
    
    try:
        print("🔍 ANALISANDO DADOS NO BANCO")
        print("=" * 50)
        
        # 1. Verificar atendimentos
        total_attendances = db.query(func.count(Attendance.id)).scalar()
        print(f"📊 Total de atendimentos: {total_attendances}")
        
        # 2. Verificar atendimentos com appointment_date
        attendances_with_date = db.query(func.count(Attendance.id)).filter(
            Attendance.appointment_date.isnot(None)
        ).scalar()
        print(f"📅 Atendimentos com data: {attendances_with_date}")
        
        # 3. Verificar atendimentos pagos
        paid_attendances = db.query(func.count(Attendance.id)).filter(
            Attendance.payment_status == "paid"
        ).scalar()
        print(f"💰 Atendimentos pagos: {paid_attendances}")
        
        # 4. Verificar atendimentos não cancelados
        non_cancelled = db.query(func.count(Attendance.id)).filter(
            Attendance.status != "cancelled"
        ).scalar()
        print(f"✅ Atendimentos não cancelados: {non_cancelled}")
        
        # 5. Verificar atendimentos pagos e não cancelados
        valid_attendances = db.query(func.count(Attendance.id)).filter(
            and_(
                Attendance.payment_status == "paid",
                Attendance.status != "cancelled"
            )
        ).scalar()
        print(f"🎯 Atendimentos válidos (pagos + não cancelados): {valid_attendances}")
        
        # 6. Verificar serviços
        total_services = db.query(func.count(Service.id)).scalar()
        print(f"🔧 Total de serviços: {total_services}")
        
        # 7. Verificar relacionamento attendance_services
        attendance_services_count = db.query(func.count(Attendance.id)).join(Attendance.services).scalar()
        print(f"🔗 Atendimentos com serviços: {attendance_services_count}")
        
        # 8. Verificar receita total
        total_revenue = db.query(func.sum(Service.price)).select_from(Attendance).join(Attendance.services).filter(
            and_(
                Attendance.payment_status == "paid",
                Attendance.status != "cancelled"
            )
        ).scalar() or 0.0
        print(f"💵 Receita total: R$ {total_revenue:.2f}")
        
        # 9. Verificar datas dos atendimentos
        print("\n📅 ANÁLISE DE DATAS:")
        attendances = db.query(Attendance).limit(5).all()
        for att in attendances:
            print(f"  ID {att.id}: {att.appointment_date} (status: {att.status}, payment: {att.payment_status})")
        
        # 10. Verificar atendimentos de hoje
        today = date.today()
        today_attendances = db.query(func.count(Attendance.id)).filter(
            and_(
                func.date(Attendance.appointment_date) == today,
                Attendance.status != "cancelled"
            )
        ).scalar()
        print(f"\n📅 Atendimentos de hoje ({today}): {today_attendances}")
        
        # 11. Verificar atendimentos dos últimos 7 dias
        week_ago = today - timedelta(days=7)
        week_attendances = db.query(func.count(Attendance.id)).filter(
            and_(
                func.date(Attendance.appointment_date) >= week_ago,
                func.date(Attendance.appointment_date) <= today,
                Attendance.status != "cancelled"
            )
        ).scalar()
        print(f"📅 Atendimentos dos últimos 7 dias: {week_attendances}")
        
        # 12. Verificar receita dos últimos 7 dias
        week_revenue = db.query(func.sum(Service.price)).select_from(Attendance).join(Attendance.services).filter(
            and_(
                Attendance.payment_status == "paid",
                Attendance.status != "cancelled",
                func.date(Attendance.appointment_date) >= week_ago,
                func.date(Attendance.appointment_date) <= today
            )
        ).scalar() or 0.0
        print(f"💵 Receita dos últimos 7 dias: R$ {week_revenue:.2f}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        db.close()

def test_metrics_service():
    """Testar serviço de métricas"""
    db = SessionLocal()
    attendance_service = AttendanceService()
    
    try:
        print("\n🔧 TESTANDO SERVIÇO DE MÉTRICAS")
        print("=" * 50)
        
        # Testar resumo
        summary = attendance_service.get_reports_summary(db)
        print("📊 RESUMO DO DASHBOARD:")
        for key, value in summary.items():
            if key != "growthPercentages":
                print(f"  {key}: {value}")
        
        # Testar receita por período
        print("\n📈 TESTE DE RECEITA POR PERÍODO:")
        
        # Diário
        daily_revenue = attendance_service.get_revenue_by_period(db, 'day')
        print(f"  Diário: {len(daily_revenue)} pontos de dados")
        if daily_revenue:
            total_daily = sum(point['revenue'] for point in daily_revenue)
            print(f"  Total diário: R$ {total_daily:.2f}")
        
        # Semanal
        weekly_revenue = attendance_service.get_revenue_by_period(db, 'week')
        print(f"  Semanal: {len(weekly_revenue)} pontos de dados")
        if weekly_revenue:
            total_weekly = sum(point['revenue'] for point in weekly_revenue)
            print(f"  Total semanal: R$ {total_weekly:.2f}")
        
        # Mensal
        monthly_revenue = attendance_service.get_revenue_by_period(db, 'month')
        print(f"  Mensal: {len(monthly_revenue)} pontos de dados")
        if monthly_revenue:
            total_monthly = sum(point['revenue'] for point in monthly_revenue)
            print(f"  Total mensal: R$ {total_monthly:.2f}")
        
        # Trimestral
        quarterly_revenue = attendance_service.get_revenue_by_period(db, 'quarter')
        print(f"  Trimestral: {len(quarterly_revenue)} pontos de dados")
        if quarterly_revenue:
            total_quarterly = sum(point['revenue'] for point in quarterly_revenue)
            print(f"  Total trimestral: R$ {total_quarterly:.2f}")
        
        # Anual
        yearly_revenue = attendance_service.get_revenue_by_period(db, 'year')
        print(f"  Anual: {len(yearly_revenue)} pontos de dados")
        if yearly_revenue:
            total_yearly = sum(point['revenue'] for point in yearly_revenue)
            print(f"  Total anual: R$ {total_yearly:.2f}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 INICIANDO TESTE DE MÉTRICAS")
    print("=" * 60)
    
    test_database_data()
    test_metrics_service()
    
    print("\n✅ TESTE CONCLUÍDO")
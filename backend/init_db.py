#!/usr/bin/env python3
"""
Script para inicializar o banco de dados com dados de exemplo
Execute este script após a primeira execução do sistema
"""

from database import SessionLocal, engine
from models import Base, Admin, Service
from security import get_password_hash

def init_database():
    """Inicializar banco de dados com dados de exemplo"""
    
    # Criar tabelas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verificar se já existe um admin
        existing_admin = db.query(Admin).first()
        if existing_admin:
            print("✅ Administrador já existe no banco de dados")
            return
        
        # Criar administrador padrão
        admin = Admin(
            username="admin",
            name="Administrador",
            email="admin@metheusbarber.com",
            password_hash=get_password_hash("admin123"),
            is_active=True
            # is_first_login=True  # Temporariamente comentado
        )
        
        db.add(admin)
        db.commit()
        print("✅ Administrador criado com sucesso!")
        print("   Username: admin")
        print("   Senha: admin123")
        print("   ⚠️  IMPORTANTE: Altere a senha após o primeiro login!")
        
        # Criar serviços de exemplo
        services = [
            {
                "name": "Corte Masculino",
                "description": "Corte tradicional masculino com acabamento",
                "price": 35.00,
                "duration_minutes": 30
            },
            {
                "name": "Barba",
                "description": "Acabamento de barba com navalha",
                "price": 25.00,
                "duration_minutes": 20
            },
            {
                "name": "Corte + Barba",
                "description": "Corte masculino + acabamento de barba",
                "price": 50.00,
                "duration_minutes": 45
            },
            {
                "name": "Hidratação",
                "description": "Tratamento hidratante para cabelo",
                "price": 40.00,
                "duration_minutes": 25
            },
            {
                "name": "Pigmentação",
                "description": "Coloração de cabelo ou barba",
                "price": 60.00,
                "duration_minutes": 60
            }
        ]
        
        for service_data in services:
            service = Service(**service_data)
            db.add(service)
        
        db.commit()
        print("✅ Serviços de exemplo criados com sucesso!")
        
        print("\n🎉 Banco de dados inicializado com sucesso!")
        print("   Você pode agora fazer login com:")
        print("   Username: admin")
        print("   Senha: admin123")
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco de dados: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Inicializando banco de dados da Matheus Barber...")
    init_database()
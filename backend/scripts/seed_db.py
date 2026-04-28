import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.database import get_db
from app.models import Admin, Service
from app.security import get_password_hash
from app.services.config_service import ConfigService


def seed_admin(db):
    if db.query(Admin).count() == 0:
        admin = Admin(
            username="admin",
            name="Administrador",
            email="admin@matheusbarber.com",
            password_hash=get_password_hash("admin123"),
            is_active=True,
            is_first_login=True,
        )
        db.add(admin)
        db.commit()
        print("Administrador padrao criado (admin/admin123)")


def seed_services(db):
    if db.query(Service).count() == 0:
        default_services = [
            ("Corte Masculino", "Corte tradicional masculino com acabamento", 35.00, 30),
            ("Barba", "Acabamento de barba com navalha", 25.00, 20),
            ("Corte + Barba", "Corte masculino + acabamento de barba", 50.00, 45),
            ("Hidratação", "Tratamento hidratante para cabelo", 40.00, 25),
            ("Pigmentação", "Coloração de cabelo ou barba", 60.00, 60),
        ]
        for name, description, price, duration in default_services:
            db.add(
                Service(
                    name=name,
                    description=description,
                    price=price,
                    duration_minutes=duration,
                    is_active=True,
                )
            )
        db.commit()
        print("Servicos padrao criados")


def seed_configs(db):
    ConfigService.initialize_default_configs(db)
    print("Configuracoes padrao inicializadas")


def main():
    with get_db() as db:
        seed_admin(db)
        seed_services(db)
        seed_configs(db)


if __name__ == "__main__":
    main()

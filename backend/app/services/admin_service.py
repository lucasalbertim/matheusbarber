from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..errors import ApiError
from ..models import Admin
from ..schemas import AdminCreate, AdminLogin, AdminUpdate
from ..security import get_password_hash, verify_password, create_access_token


def _ensure_no_whitespace(value: str, field_label: str):
    if value is None:
        return
    if any(ch.isspace() for ch in value):
        raise ApiError(f"{field_label} não pode conter espaços", 400)


class AdminService:
    def create_admin(self, db: Session, admin: AdminCreate) -> Admin:
        _ensure_no_whitespace(admin.username, "Username")
        _ensure_no_whitespace(admin.password, "Senha")

        if db.query(Admin).filter(Admin.username == admin.username).first():
            raise ApiError("Username já cadastrado", 400)

        if db.query(Admin).filter(Admin.email == admin.email).first():
            raise ApiError("Email já cadastrado", 400)

        db_admin = Admin(
            username=admin.username,
            name=admin.name,
            email=admin.email,
            password_hash=get_password_hash(admin.password),
        )
        db.add(db_admin)
        db.commit()
        db.refresh(db_admin)
        return db_admin

    def login_admin(self, db: Session, login_data: AdminLogin):
        _ensure_no_whitespace(login_data.username, "Username")
        _ensure_no_whitespace(login_data.password, "Senha")

        admin = db.query(Admin).filter(
            Admin.username == login_data.username,
            Admin.is_active == True,
        ).first()

        if not admin or not verify_password(login_data.password, admin.password_hash):
            raise ApiError("Credenciais inválidas", 401)

        access_token = create_access_token(
            data={"sub": admin.username}, expires_delta=timedelta(minutes=30)
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "admin": admin,
            "is_first_login": admin.is_first_login,
        }

    def get_admin_by_username(self, db: Session, username: str) -> Optional[Admin]:
        return db.query(Admin).filter(Admin.username == username, Admin.is_active == True).first()

    def get_admin(self, db: Session, admin_id: int) -> Admin:
        admin = db.query(Admin).filter(Admin.id == admin_id).first()
        if not admin:
            raise ApiError("Administrador não encontrado", 404)
        return admin

    def update_admin(self, db: Session, admin_id: int, admin_update: AdminCreate) -> Admin:
        db_admin = self.get_admin(db, admin_id)

        _ensure_no_whitespace(admin_update.username, "Username")
        if admin_update.password:
            _ensure_no_whitespace(admin_update.password, "Senha")

        if admin_update.username != db_admin.username:
            if db.query(Admin).filter(
                and_(Admin.username == admin_update.username, Admin.id != admin_id)
            ).first():
                raise ApiError("Username já cadastrado", 400)

        if admin_update.email != db_admin.email:
            if db.query(Admin).filter(
                and_(Admin.email == admin_update.email, Admin.id != admin_id)
            ).first():
                raise ApiError("Email já cadastrado", 400)

        db_admin.username = admin_update.username
        db_admin.name = admin_update.name
        db_admin.email = admin_update.email
        if admin_update.password:
            db_admin.password_hash = get_password_hash(admin_update.password)

        db.commit()
        db.refresh(db_admin)
        return db_admin

    def delete_admin(self, db: Session, admin_id: int):
        db_admin = self.get_admin(db, admin_id)
        db_admin.is_active = False
        db.commit()

    def update_first_login_admin(self, db: Session, admin_id: int, admin_update: AdminUpdate) -> Admin:
        db_admin = self.get_admin(db, admin_id)
        if not db_admin.is_first_login:
            raise ApiError("Este não é o primeiro login", 400)

        _ensure_no_whitespace(admin_update.username, "Username")
        _ensure_no_whitespace(admin_update.password, "Senha")

        if admin_update.username != db_admin.username:
            if db.query(Admin).filter(
                and_(Admin.username == admin_update.username, Admin.id != admin_id)
            ).first():
                raise ApiError("Username já cadastrado", 400)

        if admin_update.email != db_admin.email:
            if db.query(Admin).filter(
                and_(Admin.email == admin_update.email, Admin.id != admin_id)
            ).first():
                raise ApiError("Email já cadastrado", 400)

        db_admin.username = admin_update.username
        db_admin.name = admin_update.name
        db_admin.email = admin_update.email
        db_admin.password_hash = get_password_hash(admin_update.password)
        db_admin.is_first_login = False

        db.commit()
        db.refresh(db_admin)
        return db_admin


admin_service = AdminService()

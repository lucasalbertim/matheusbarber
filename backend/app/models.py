from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Text, Table
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

attendance_services = Table(
    "attendance_services",
    Base.metadata,
    Column("attendance_id", Integer, ForeignKey("attendances.id"), primary_key=True),
    Column("service_id", Integer, ForeignKey("services.id"), primary_key=True),
)


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    data_nascimento = Column(DateTime, nullable=False, index=True)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    email = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    attendances = relationship("Attendance", back_populates="client")


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_first_login = Column(Boolean, default=True)


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    duration_minutes = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    appointment_date = Column(DateTime, nullable=False)
    status = Column(String(20), default="waiting")
    payment_method = Column(String(50), nullable=True)
    payment_status = Column(String(20), default="pending")
    notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    cancelled_by = Column(String(20), nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    attendance_type = Column(String(20), default="presential")
    queue_position = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="attendances")
    service = relationship("Service")
    services = relationship("Service", secondary=attendance_services)


class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

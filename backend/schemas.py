from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Schemas de Cliente
class ClientBase(BaseModel):
    name: str
    data_nascimento: datetime
    phone: str
    email: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class ClientLogin(BaseModel):
    identifier: str  # telefone

# Schemas de Administrador
class AdminBase(BaseModel):
    username: str
    name: str
    email: EmailStr

class AdminCreate(AdminBase):
    password: str

class AdminResponse(AdminBase):
    id: int
    created_at: datetime
    is_active: bool
    is_first_login: bool
    
    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminUpdate(BaseModel):
    username: str
    name: str
    email: EmailStr
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str
    admin: AdminResponse

# Schemas de Serviço
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int = 30

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schemas de Atendimento
class AttendanceBase(BaseModel):
    client_id: int
    appointment_date: datetime
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    service_ids: List[int]

class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None

class AttendanceCancel(BaseModel):
    cancellation_reason: str

class AttendanceResponse(AttendanceBase):
    id: int
    status: str
    payment_status: str
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    client: ClientResponse
    services: List[ServiceResponse]
    
    class Config:
        from_attributes = True

class AttendanceCreatedResponse(BaseModel):
    attendance: AttendanceResponse
    queue_position: int

# Schemas de Relatórios
class ReportsSummary(BaseModel):
    total_clients: int
    total_attendances: int
    total_revenue: float
    inactive_clients: int
    today_attendances: int
    pending_payments: int
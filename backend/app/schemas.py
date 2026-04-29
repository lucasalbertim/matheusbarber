from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime


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

    model_config = ConfigDict(from_attributes=True)


class ClientProfileUpdate(BaseModel):
    data_nascimento: Optional[datetime] = None
    email: Optional[str] = None


class ClientLogin(BaseModel):
    identifier: str


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

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


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
    attendance_type: str

    model_config = ConfigDict(from_attributes=True)


class AttendanceCreatedResponse(BaseModel):
    attendance: AttendanceResponse
    queue_position: int


class ReportsSummary(BaseModel):
    total_clients: int
    total_attendances: int
    total_revenue: float
    inactive_clients: int
    today_attendances: int
    pending_payments: int


class AttendanceModeConfig(BaseModel):
    presential_mode_enabled: bool
    appointment_mode_enabled: bool
    appointment_working_hours: str
    appointment_interval_minutes: int
    appointment_break_hours: str
    appointment_always_scheduled: bool
    appointment_scheduled_days: List[int]


class AttendanceModeConfigUpdate(BaseModel):
    presential_mode_enabled: Optional[bool] = None
    appointment_mode_enabled: Optional[bool] = None
    appointment_working_hours: Optional[str] = None
    appointment_interval_minutes: Optional[int] = None
    appointment_break_hours: Optional[str] = None
    appointment_always_scheduled: Optional[bool] = None
    appointment_scheduled_days: Optional[List[int]] = None

"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-04-28
"""
from alembic import op
import sqlalchemy as sa


revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "clients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("data_nascimento", sa.DateTime(), nullable=False),
        sa.Column("phone", sa.String(length=15), nullable=False, unique=True),
        sa.Column("email", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
    )
    op.create_index("ix_clients_data_nascimento", "clients", ["data_nascimento"])
    op.create_index("ix_clients_phone", "clients", ["phone"])
    op.create_index("ix_clients_id", "clients", ["id"])

    op.create_table(
        "admins",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(length=50), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("is_first_login", sa.Boolean(), nullable=True),
    )
    op.create_index("ix_admins_username", "admins", ["username"])
    op.create_index("ix_admins_id", "admins", ["id"])

    op.create_table(
        "services",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_services_id", "services", ["id"])

    op.create_table(
        "attendances",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("client_id", sa.Integer(), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=True),
        sa.Column("appointment_date", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("payment_method", sa.String(length=50), nullable=True),
        sa.Column("payment_status", sa.String(length=20), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("cancelled_by", sa.String(length=20), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(), nullable=True),
        sa.Column("attendance_type", sa.String(length=20), nullable=True),
        sa.Column("queue_position", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["client_id"], ["clients.id"]),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"]),
    )
    op.create_index("ix_attendances_id", "attendances", ["id"])

    op.create_table(
        "system_config",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(length=100), nullable=False, unique=True),
        sa.Column("value", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_system_config_key", "system_config", ["key"])
    op.create_index("ix_system_config_id", "system_config", ["id"])

    op.create_table(
        "attendance_services",
        sa.Column("attendance_id", sa.Integer(), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["attendance_id"], ["attendances.id"]),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"]),
        sa.PrimaryKeyConstraint("attendance_id", "service_id"),
    )


def downgrade() -> None:
    op.drop_table("attendance_services")
    op.drop_index("ix_system_config_id", table_name="system_config")
    op.drop_index("ix_system_config_key", table_name="system_config")
    op.drop_table("system_config")
    op.drop_index("ix_attendances_id", table_name="attendances")
    op.drop_table("attendances")
    op.drop_index("ix_services_id", table_name="services")
    op.drop_table("services")
    op.drop_index("ix_admins_id", table_name="admins")
    op.drop_index("ix_admins_username", table_name="admins")
    op.drop_table("admins")
    op.drop_index("ix_clients_id", table_name="clients")
    op.drop_index("ix_clients_phone", table_name="clients")
    op.drop_index("ix_clients_data_nascimento", table_name="clients")
    op.drop_table("clients")

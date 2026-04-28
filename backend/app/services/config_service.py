from typing import Dict, Any, Optional
import json
from datetime import datetime
from sqlalchemy.orm import Session

from ..models import SystemConfig


class ConfigService:
    @staticmethod
    def get_config(db: Session, key: str) -> Optional[str]:
        config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        return config.value if config else None

    @staticmethod
    def set_config(db: Session, key: str, value: str, description: str = None) -> SystemConfig:
        config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if config:
            config.value = value
            config.description = description
            config.updated_at = datetime.utcnow()
        else:
            config = SystemConfig(key=key, value=value, description=description)
            db.add(config)

        db.commit()
        db.refresh(config)
        return config

    @staticmethod
    def get_all_configs(db: Session) -> Dict[str, Any]:
        configs = db.query(SystemConfig).all()
        result: Dict[str, Any] = {}
        for config in configs:
            try:
                result[config.key] = json.loads(config.value)
            except (json.JSONDecodeError, TypeError):
                result[config.key] = config.value
        return result

    @staticmethod
    def get_attendance_mode_config(db: Session) -> Dict[str, Any]:
        configs = {
            "presential_mode_enabled": ConfigService.get_config(db, "presential_mode_enabled") == "true",
            "appointment_mode_enabled": ConfigService.get_config(db, "appointment_mode_enabled") == "true",
            "appointment_working_hours": ConfigService.get_config(db, "appointment_working_hours"),
            "appointment_interval_minutes": ConfigService.get_config(db, "appointment_interval_minutes"),
            "appointment_break_hours": ConfigService.get_config(db, "appointment_break_hours"),
            "appointment_always_scheduled": ConfigService.get_config(db, "appointment_always_scheduled") == "true",
            "appointment_scheduled_days": ConfigService.get_config(db, "appointment_scheduled_days"),
        }

        if configs["appointment_working_hours"] is None:
            configs["appointment_working_hours"] = "08:00-18:00"
        if configs["appointment_interval_minutes"] is None:
            configs["appointment_interval_minutes"] = "30"
        if configs["appointment_break_hours"] is None:
            configs["appointment_break_hours"] = "12:00-13:00"
        if configs["appointment_scheduled_days"] is None:
            configs["appointment_scheduled_days"] = "1,2,3,4,5"

        if isinstance(configs["appointment_scheduled_days"], str):
            configs["appointment_scheduled_days"] = [
                int(x) for x in configs["appointment_scheduled_days"].split(",")
            ]

        return configs

    @staticmethod
    def update_attendance_mode_config(db: Session, config_data: Dict[str, Any]) -> Dict[str, Any]:
        ConfigService.set_config(
            db,
            "presential_mode_enabled",
            str(config_data.get("presential_mode_enabled", False)).lower(),
            "Habilita o modo de atendimento presencial",
        )

        ConfigService.set_config(
            db,
            "appointment_mode_enabled",
            str(config_data.get("appointment_mode_enabled", False)).lower(),
            "Habilita o modo de agendamento",
        )

        ConfigService.set_config(
            db,
            "appointment_always_scheduled",
            str(config_data.get("appointment_always_scheduled", False)).lower(),
            "Se todos os dias devem ser agendados ou apenas os selecionados",
        )

        if "appointment_working_hours" in config_data:
            ConfigService.set_config(
                db,
                "appointment_working_hours",
                config_data["appointment_working_hours"],
                "Horário de funcionamento para agendamentos (formato: HH:MM-HH:MM)",
            )

        if "appointment_interval_minutes" in config_data:
            ConfigService.set_config(
                db,
                "appointment_interval_minutes",
                str(config_data["appointment_interval_minutes"]),
                "Intervalo entre agendamentos em minutos",
            )

        if "appointment_break_hours" in config_data:
            ConfigService.set_config(
                db,
                "appointment_break_hours",
                config_data["appointment_break_hours"],
                "Horário de descanso (formato: HH:MM-HH:MM)",
            )

        if "appointment_scheduled_days" in config_data:
            days_str = ",".join(map(str, config_data["appointment_scheduled_days"]))
            ConfigService.set_config(
                db,
                "appointment_scheduled_days",
                days_str,
                "Dias da semana para agendamento (0=domingo, 1=segunda, etc.)",
            )

        return ConfigService.get_attendance_mode_config(db)

    @staticmethod
    def initialize_default_configs(db: Session):
        default_configs = [
            ("presential_mode_enabled", "true", "Habilita o modo de atendimento presencial"),
            ("appointment_mode_enabled", "false", "Habilita o modo de agendamento"),
            ("appointment_working_hours", "08:00-18:00", "Horário de funcionamento para agendamentos"),
            ("appointment_interval_minutes", "30", "Intervalo entre agendamentos em minutos"),
            ("appointment_break_hours", "12:00-13:00", "Horário de descanso"),
            ("appointment_always_scheduled", "false", "Se todos os dias devem ser agendados"),
            ("appointment_scheduled_days", "1,2,3,4,5", "Dias da semana para agendamento"),
        ]

        for key, value, description in default_configs:
            existing = db.query(SystemConfig).filter(SystemConfig.key == key).first()
            if not existing:
                db.add(SystemConfig(key=key, value=value, description=description))

        db.commit()

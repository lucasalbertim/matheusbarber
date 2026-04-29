from datetime import datetime, timezone, timedelta

RECIFE_TZ = timezone(timedelta(hours=-3))


def get_recife_datetime():
    return datetime.now(RECIFE_TZ).replace(tzinfo=None)


def get_recife_date():
    return get_recife_datetime().date()


def utc_to_recife(utc_datetime):
    if utc_datetime.tzinfo is None:
        return utc_datetime.replace(tzinfo=RECIFE_TZ)
    return utc_datetime.astimezone(RECIFE_TZ)


def parse_recife_datetime(value):
    if isinstance(value, str):
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    elif isinstance(value, datetime):
        parsed = value
    else:
        raise ValueError("Formato de data inválido")

    if parsed.tzinfo is None:
        return parsed
    return parsed.astimezone(RECIFE_TZ).replace(tzinfo=None)

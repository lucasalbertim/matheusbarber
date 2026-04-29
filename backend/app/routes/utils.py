from flask import request


def parse_body(schema_cls):
    payload = request.get_json(silent=True) or {}
    return schema_cls(**payload)


def serialize(schema_cls, obj):
    return schema_cls.model_validate(obj).model_dump(mode="json")


def serialize_list(schema_cls, items):
    return [schema_cls.model_validate(item).model_dump(mode="json") for item in items]

from marshmallow import fields, Schema, validates_schema, ValidationError
from marshmallow.validate import Length, Range

from flask_app.db_services import inventory_exists


class ProductSchema(Schema):
    """Схема для сериализации/десериализации объекта Product"""

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=[Length(min=1)])
    description = fields.String(required=True)
    price = fields.Decimal(
        required=True, rounding=2, as_string=True, validate=[Range(min=0)]
    )
    inventories = fields.Nested("InventorySchema", dump_only=True, many=True)
    amount = fields.Integer(dump_only=True)


class LocationSchema(Schema):
    """Схема для сериализации/десериализации объекта Location"""

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=[Length(min=1)])


class InventorySchema(Schema):
    """Схема для сериализации/десериализации объекта Inventory"""

    id = fields.Integer(dump_only=True)
    product_id = fields.Integer(required=True)
    location_id = fields.Integer(required=True)
    quantity = fields.Integer(required=True)
    location = fields.Nested("LocationSchema", dump_only=True, many=False)

    @validates_schema
    def validate_unique_constraint(self, data, **kwargs):
        product_id = data.get("product_id")
        location_id = data.get("location_id")
        if inventory_exists(product_id=product_id, location_id=location_id):
            raise ValidationError(
                "Информация об остатках на этом складе уже существует"
            )

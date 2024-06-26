from flask import request
from flask_restful import Api, Resource
from marshmallow import Schema, ValidationError
from werkzeug.exceptions import NotFound

from flask_app.db_services import (
    create_instance,
    get_paginated_products,
    get_inventory_by_id,
    delete_instance,
    update_instance,
    get_locations,
)
from flask_app.models import db, Product, Inventory, Location
from flask_app.schemas import ProductSchema, InventorySchema, LocationSchema, PaginateSchema, ProductsFilterSchema

api = Api()


class CreateMixin:
    """Миксин, для post-запросов на создание объекта"""

    schema: Schema = None
    model: db.Model = None

    def post(self):
        schema = self.schema()
        try:
            valid_data = schema.load(request.json)
        except ValidationError as err:
            return err.messages, 400
        new_instance = create_instance(self.model, valid_data)
        return schema.dump(new_instance), 201


@api.resource("/api/products")
class ProductsResource(Resource, CreateMixin):
    model = Product
    schema = ProductSchema

    def get(self):
        try:
            validated_data = ProductsFilterSchema().load(request.args.to_dict())
        except ValidationError as ex:
            return ex.messages, 400
        paginate = get_paginated_products(**validated_data)
        result = {
            "products": self.schema().dump(paginate.items, many=True),
            "paginate": PaginateSchema().dump(paginate),
        }
        return result


@api.resource("/api/locations")
class LocationResource(Resource, CreateMixin):
    schema = LocationSchema
    model = Location

    def get(self):
        locations = get_locations()
        return self.schema().dump(locations, many=True)


@api.resource("/api/inventories")
class InventoriesResource(Resource, CreateMixin):
    model = Inventory
    schema = InventorySchema


@api.resource("/api/inventory/<int:inventory_id>")
class InventoryResource(Resource):

    def delete(self, inventory_id: int):
        inventory = get_inventory_by_id(inventory_id)
        if not inventory:
            raise NotFound
        delete_instance(inventory)
        return {}, 204

    def patch(self, inventory_id: int):
        schema = InventorySchema(exclude=["product_id", "location_id"])
        try:
            valid_data = schema.load(request.json)
        except ValidationError as err:
            return err.messages, 400
        inventory = get_inventory_by_id(inventory_id)
        if not inventory:
            raise NotFound
        update_instance(inventory, valid_data)
        return schema.dump(inventory)

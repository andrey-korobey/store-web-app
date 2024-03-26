from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.hybrid import hybrid_property

db = SQLAlchemy()


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(
        db.Float(precision=2, asdecimal=True, decimal_return_scale=2), nullable=False
    )

    @hybrid_property
    def amount(self):
        return sum(i.quantity for i in self.inventories)

    @amount.expression
    def amount(cls):
        return db.func.sum(Inventory.quantity)


class Location(db.Model):
    __tablename__ = "locations"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)


class Inventory(db.Model):
    __tablename__ = "inventory"
    __table_args__ = (db.UniqueConstraint("product_id", "location_id"),)

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(
        db.Integer, db.ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    location_id = db.Column(
        db.Integer, db.ForeignKey("locations.id", ondelete="CASCADE"), nullable=False
    )
    quantity = db.Column(db.Integer, nullable=False)

    product = db.Relationship(
        Product, backref="inventories", single_parent=True, lazy="joined"
    )
    location = db.Relationship(
        Location, backref="inventories", single_parent=True, lazy="joined"
    )

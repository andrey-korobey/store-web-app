from typing import List, Optional

from flask_app.models import Product, Location, Inventory, db


def create_instance(model: db.Model, valid_data: dict) -> db.Model:
    """Функция создает объект модели model и сохраняет его в базе данных"""
    instance = model(**valid_data)
    db.session.add(instance)
    db.session.commit()
    return instance


def delete_instance(instance: db.Model) -> None:
    """Функция удаляет объект из базы данных"""
    db.session.delete(instance)
    db.session.commit()


def update_instance(instance: db.Model, data: dict) -> None:
    """Функция обновляет объект в базе данных"""
    for attr, value in data.items():
        setattr(instance, attr, value)
    db.session.commit()


def get_products(
        search_text: Optional[str] = None,
        order_field: Optional[str] = None,
        order_direction: Optional[str] = None,
) -> List[Product]:
    """Функция возвращает список товаров из базы данных"""
    query = db.session.query(Product).join(Inventory).group_by(Product.id)

    if search_text:
        query = query.filter(Product.name.contains(search_text))

    if order_field and (order_field in Product.__table__.columns.keys() or order_field == "amount"):
        field = getattr(Product, order_field)
        if order_direction and order_direction.lower() == "desc":
            field = field.desc()
        query = query.order_by(field)

    return query.all()


def get_locations() -> List[Location]:
    """Функция возвращает все локации из базы данных"""
    return db.session.query(Location).all()


def inventory_exists(**data) -> bool:
    """Функция проверяет, существует ли объект в базе данных"""
    query = db.session.query(Inventory).filter_by(**data).exists()
    result = db.session.query(query).scalar()
    return result


def get_inventory_by_id(inventory_id: int) -> Optional[Inventory]:
    """Функция получает из бд объект Inventory по его Id"""
    return db.session.query(Inventory).get(inventory_id)

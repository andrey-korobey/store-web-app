import json
import os
import random
from pathlib import Path

from web_app.models import Product, Location, Inventory


def generate_data():
    sities = [
        "Москва",
        "Санкт-Петербург",
        "Екатеринбург",
        "Самара",
        "Казань",
        "Челябинск",
    ]
    products = [
        {
            "name": f"Товар №{i}",
            "description": f"Здесь будет описание к товару  №{i}",
            "price": random.randint(1000, 10000) / 10,
        }
        for i in range(1, 100)
    ]
    locations = [{"name": sity} for sity in sities]
    variables = random.sample(
        [
            (i, j)
            for i in range(1, len(products) + 1)
            for j in range(1, len(locations) + 1)
        ],
        k=300,
    )
    inventory = [
        {"product_id": i, "location_id": j, "quantity": random.randint(0, 100)}
        for i, j in variables
    ]
    data = {"products": products, "locations": locations, "inventory": inventory}
    return data


def dump_data(data: dict, filename):
    with open(filename, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False)


def load_data_from_json(db, filename: str) -> None:
    """
    Функция наполняет базу данными из json файла
    :param filename:
    :return:
    """
    if not os.path.isfile(filename):
        print(f"Файл {filename} не найден")
        return
    with open(filename, encoding="utf-8") as file:
        data = json.load(file)

    products = data.get("products")
    locations = data.get("locations")
    inventory = data.get("inventory")

    db.session.bulk_insert_mappings(Product, products)
    db.session.bulk_insert_mappings(Location, locations)
    db.session.bulk_insert_mappings(Inventory, inventory)
    db.session.commit()


if __name__ == '__main__':
    data = generate_data()
    path = os.path.join(Path(__file__).parent.absolute(), "dump.json")
    dump_data(data, path)
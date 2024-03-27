from flask import Flask

from flask_app.api import api
from flask_app.demo.dump import load_data_from_json
from flask_app.models import db


def get_app():
    _app = Flask(__name__)

    _app.config.from_prefixed_env()
    db.init_app(_app)
    api.init_app(_app)

    if _app.config.get("DEMO"):
        with _app.app_context():
            db.drop_all()
            db.create_all()
            load_data_from_json(db, "dump.json")
    else:
        with _app.app_context():
            db.create_all()

    return _app


if __name__ == '__main__':
    app = get_app()
    app.run()


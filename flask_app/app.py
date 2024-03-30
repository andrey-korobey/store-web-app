from typing import Optional

from flask import Flask, jsonify

from flask_app.api import api
from flask_app.demo.dump import load_data_from_json
from flask_app.models import db


def get_app(config: Optional[dict] = None) -> Flask:
    _app = Flask(__name__)
    if config:
        _app.config.from_mapping(config)
    else:
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

    @_app.errorhandler(404)
    def page_not_found(e):
        return jsonify(message=e.description), 404

    return _app


if __name__ == '__main__':
    config = {
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///database.db',
        'SQLALCHEMY_ECHO': True,
        'DEMO': True,
        'DEBUG': True,
    }
    app = get_app(config)
    app.run()

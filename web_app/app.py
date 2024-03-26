from flask import Flask, render_template

from web_app.api import api
from web_app.demo.dump import load_data_from_json
from web_app.models import db


def get_app():
    _app = Flask(__name__)

    _app.config.from_object("config")
    db.init_app(_app)
    api.init_app(_app)

    if _app.config.get("DEMO"):
        with _app.app_context():
            db.drop_all()
            db.create_all()
            load_data_from_json(db, "demo/dump.json")
    else:
        with _app.app_context():
            db.create_all()

    @_app.route("/")
    def index():
        return render_template("index.html")

    return _app


if __name__ == '__main__':
    app = get_app()
    app.run()


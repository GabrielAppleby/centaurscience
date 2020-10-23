import os

from flask import Flask
from flask_restful import Api
from flask_migrate import Migrate

from app.api.active_search_task_api import ActiveSearchTaskAPI
from app.api.molecule_api import MoleculeListAPI, MoleculeAPI
from app.dao.database import db
from app.carrots.flask_celery import flask_celery


def create_app() -> Flask:
    app: Flask = Flask(__name__, instance_relative_config=True)

    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DB_URI'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False
    )

    db.init_app(app)
    flask_celery.init_app(app)
    migrate = Migrate(app, db)

    api: Api = Api(app, prefix='/api')

    api.add_resource(MoleculeListAPI, '/molecules')
    api.add_resource(MoleculeAPI, '/molecules/<int:uid>')

    api.add_resource(ActiveSearchTaskAPI,
                     '/active_search_tasks',
                     '/active_search_tasks/<string:uid>')

    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET')
        response.headers.add('Access-Control-Allow-Methods', 'PUT')

        return response

    return app


application = create_app()
celery = flask_celery.get_celery()

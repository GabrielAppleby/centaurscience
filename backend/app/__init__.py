import os

from flask import Flask

from flask_restful import Api

from app.api.candidate_api import CandidateListAPI


def create_app() -> Flask:
    app: Flask = Flask(__name__, instance_relative_config=True)

    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY')
    )

    api: Api = Api(app, prefix='/api')

    api.add_resource(CandidateListAPI, '/candidates')

    return app


application = create_app()

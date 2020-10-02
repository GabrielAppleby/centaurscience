import os

from flask import Flask
from flask_restful import Api

from app.api.candidate_api import CandidateListAPI
from app.api.molecule_api import MoleculeListAPI, MoleculeAPI


def create_app() -> Flask:
    app: Flask = Flask(__name__, instance_relative_config=True)

    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY')
    )

    api: Api = Api(app, prefix='/api')

    api.add_resource(CandidateListAPI, '/candidates')
    api.add_resource(MoleculeListAPI, '/molecules')
    api.add_resource(MoleculeAPI, '/molecules/<int:uid>')

    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET')
        return response

    return app


application = create_app()

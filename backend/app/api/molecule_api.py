from typing import Dict, List

from flask import request
from flask_restful import fields, Resource, marshal_with, reqparse

from app.core.molecule import Molecule
from app.dao.molecule_dao import MoleculeDB
from app.dao.database import db

molecule_fields: Dict = {
    "uid": fields.Integer,
    "str_rep": fields.String,
    "label": fields.String,
    "x": fields.Float,
    "y": fields.Float
}

parser = reqparse.RequestParser()


class MoleculeListAPI(Resource):
    @marshal_with(molecule_fields)
    def get(self) -> List[Molecule]:
        return MoleculeDB.query.all()


class MoleculeAPI(Resource):
    @marshal_with(molecule_fields)
    def get(self, uid):
        return MoleculeDB.query.get_or_404(uid)

    def put(self, uid):
        mol = MoleculeDB.query.get_or_404(uid)
        if mol is None:
            return mol
        mol_dict = request.get_json()
        mol.label = mol_dict['label']
        db.session.commit()
        return 200

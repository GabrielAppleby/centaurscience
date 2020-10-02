from typing import Dict, List

from flask_restful import fields, Resource, marshal_with

from app.core.molecule import Molecule
from app.dao.molecule_dao import MoleculeDB

molecule_fields: Dict = {
    "uid": fields.Integer,
    "str_rep": fields.String,
    "label": fields.String,
    "x": fields.Float,
    "y": fields.Float
}


class MoleculeListAPI(Resource):
    @marshal_with(molecule_fields)
    def get(self) -> List[Molecule]:
        return MoleculeDB.query.all()


class MoleculeAPI(Resource):
    @marshal_with(molecule_fields)
    def get(self, uid):
        return MoleculeDB.query.get_or_404(uid)

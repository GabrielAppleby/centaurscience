from typing import Dict, List

from flask_restful import fields, Resource, marshal_with

from app.core.molecule import Molecule
from app.dao import molecule_dao

molecule_fields: Dict = {
    "uid": fields.Integer,
    "str_rep": fields.String,
    "label": fields.Integer,
    "x": fields.Float,
    "y": fields.Float
}


class MoleculeListAPI(Resource):
    @marshal_with(molecule_fields)
    def get(self) -> List[Molecule]:
        return molecule_dao.query_all()


class MoleculeAPI(Resource):
    @marshal_with(molecule_fields)
    def get(self, uid):
        return molecule_dao.query_get_or_404(uid)

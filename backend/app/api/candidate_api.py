from typing import Dict, List

from flask_restful import fields, Resource, marshal_with

from app.core.molecule import Molecule

candidate_fields: Dict = {
    "uid": fields.Integer,
    "str_rep": fields.String,
    "label": fields.Integer,
    "x": fields.Float,
    "y": fields.Float
}


class CandidateListAPI(Resource):
    @marshal_with(candidate_fields)
    def get(self) -> List[Molecule]:
        candidate = Molecule(10, "C", 0, 10, 12)
        return [candidate]

from typing import Dict, List

from flask_restful import fields, Resource, marshal_with

from app.core.candidate import Candidate

candidate_fields: Dict = {
    'unique_id': fields.Integer
}


class CandidateListAPI(Resource):
    @marshal_with(candidate_fields)
    def get(self) -> List[Candidate]:
        candidate = Candidate(10)
        return [candidate]

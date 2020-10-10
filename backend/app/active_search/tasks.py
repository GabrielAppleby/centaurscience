from app.dao.molecule_dao import MoleculeDB
from app.carrots.flask_celery import flask_celery

celery = flask_celery.get_celery()


@celery.task()
def search() -> None:
    known_ids = []
    known_labels = []
    unknown_ids = []
    for mol in MoleculeDB.query.all():
        if mol.label == 'true' or mol.label == 'false':
            known_ids.append(mol.uid)
            known_labels.append(mol.label)
        else:
            unknown_ids.append(mol.uid)

    candidate_ids = []
    # call active search and fill in candidate ids
    for candidate_id in candidate_ids:
        mol_to_update = MoleculeDB.query().get(candidate_id)
        # it is possible mol_to_update is None if the candidate is not in the db
        # but at this point I'd rather have an error here than log it silently
        mol_to_update.label = 'candidate'



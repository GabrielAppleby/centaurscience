import pathlib

import numpy as np

from app.active_search.models.knn_model import KNNModel
from app.active_search.policies.batch_ens import batch_ens
from app.active_search.utils import load_data
from app.carrots.flask_celery import flask_celery
from app.dao.database import db
from app.dao.molecule_dao import MoleculeDB

celery = flask_celery.get_celery()

ACTIVE_SEARCH_DISTANCE_MAT: pathlib.Path = pathlib.Path(__file__).parent.absolute().joinpath('data',
                                                                                             '500_nn_data.mat')


@celery.task
def search(batch_size=1) -> None:
    known_ids = []
    known_labels = []
    unknown_ids = []
    for mol in MoleculeDB.query.all():
        if mol.label == 'True':
            known_ids.append(mol.uid)
            known_labels.append(1)
        elif mol.label == 'False':
            known_ids.append(mol.uid)
            known_labels.append(0)
        else:
            unknown_ids.append(mol.uid)

    # set up active search
    _, weights, alpha, nn_ind, sims = load_data(ACTIVE_SEARCH_DISTANCE_MAT)
    model = KNNModel(alpha, weights)
    kwargs = {
        'budget': 20,  # fake budget to control myopia: larger -> less myopic
        'batch_size': batch_size, 'weights': weights,
        'nn_ind': nn_ind, 'sims': sims, 'alpha': alpha,
    }

    # call active search and fill in candidate ids
    candidate_ids = batch_ens(
        np.array(known_ids, dtype=int) - 1,     # these three need to be integers
        np.array(known_labels),  # and are 0-indexed
        np.array(unknown_ids, dtype=int) - 1,
        model, **kwargs
    )

    candidate_ids += 1
    candidate_ids = candidate_ids.tolist()

    for candidate_id in candidate_ids:
        mol_to_update = MoleculeDB.query.get(candidate_id)
        # it is possible mol_to_update is None if the candidate is not in the db
        # but at this point I'd rather have an error here than log it silently
        mol_to_update.label = 'candidate'

    db.session.commit()

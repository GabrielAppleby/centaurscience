import numpy as np
from scipy.io import loadmat


def load_data(filepath):
    data = loadmat(filepath)

    alpha = np.flip(data['alpha'][0])

    labels = data['labels'].flatten()
    labels[labels == 2] = 0

    nn_ind = data['nearest_neighbors'].T - 1
    sims = data['similarities'].T
    weights = data['weights']

    return labels, weights, alpha, nn_ind, sims

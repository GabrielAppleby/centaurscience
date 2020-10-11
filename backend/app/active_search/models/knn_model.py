import numpy as np
from sklearn.preprocessing import normalize


class KNNModel:
    def __init__(self, alpha, weights):
        self.alpha = alpha
        self.weights = weights  # in scipy.sparse csc format

    def predict(self, test_ind, train_ind, observed_labels):
        probs = np.empty((test_ind.size, 2))

        pos_ind = (observed_labels == 1)
        masks = [~pos_ind, pos_ind]

        for class_ in range(2):
            tmp_train_ind = train_ind[masks[class_]]

            probs[:, class_] = self.alpha[class_] + (
                self.weights[:, tmp_train_ind][test_ind]
                .sum(axis=1).flatten()
            )

        return normalize(probs, axis=1, norm='l1')[:, 1]

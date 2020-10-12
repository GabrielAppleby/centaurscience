import numpy as np


def knn_bound(train_ind, observed_labels, test_ind, weights,
        nn_ind, sims, alpha, num_positives, remain_budget, tight_level=3):
    pos_ind = (observed_labels == 1)
    successes = weights[:, train_ind[pos_ind]][test_ind].sum(axis=1)
    failures = weights[:, train_ind[~pos_ind]][test_ind].sum(axis=1)

    # The weights in each row are sorted in descending order.
    sorted_weights = sims[test_ind, :]

    if tight_level == 1:
        success_count_bound = np.max(sorted_weights[:, 0]) * num_positives  # number

    elif tight_level == 2:
        max_weights = sorted_weights[:, 0]
        success_count_bound = num_positives * max_weights  # column vector

    elif tight_level == 3:
        top_weights = sorted_weights[:, :num_positives]
        success_count_bound = np.sum(top_weights, axis=1).reshape((-1, 1))  # column vector

    elif tight_level == 4:
        in_train = np.isin(nn_ind[test_ind, :], train_ind)
        sorted_weights[in_train] = 0

        masks = (sorted_weights > 0)
        success_count_bound = np.array([
            sorted_weights[i, masks[i]][:num_positives].sum()
            for i in range(test_ind.size)
        ]).reshape((-1, 1))  # column vector

    else:
        raise ValueError('Invalid level of knn bound tightness')

    # Compute the actual target probability upper bounds.
    max_alpha = alpha[1] + successes + success_count_bound
    min_beta = alpha[0] + failures
    probs = max_alpha / (max_alpha + min_beta)
    probs = np.array(probs).flatten()

    if remain_budget <= 1:
        return np.array([np.max(probs)])

    cutoff_ind = probs.size - remain_budget
    bound = np.partition(probs, cutoff_ind)[cutoff_ind:]
    bound.sort()

    return bound[::-1]

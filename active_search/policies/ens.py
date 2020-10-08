import numpy as np

import sys; sys.path.append('../')
from probability_bounds.knn_probability_bounds import knn_bound


def merge_sort(p, q, top_ind, budget):
    """Special implementation of merge sort that takes two sorted arrays and
    return the sum of the largest elements among the two arrays.
    Parameters
    ----------
    p: NumPy array
        First array to merge sort. p[top_ind] is sorted in descending order.
    q: NumPy array
        Second array to merge sort. q is sorted in descending order.
    top_ind: NumPy array of the same length as p
        Index array that sorts p in descending order.
    budget: int
        The number of elements in the sum of largest elements.
    """
    n = q.size
    sum_to_return = 0
    i = 0
    j = 0
    while p[top_ind[j]] == 0:
        j += 1
    k = 0

    while i < budget and k < n:
        if p[top_ind[j]] > q[k]:
            sum_to_return += p[top_ind[j]]
            condition1 = True
            while condition1:
                j += 1
                condition1 = (p[top_ind[j]] == 0)

        else:
            sum_to_return += q[k]
            k += 1

        i += 1

    while i < budget:
        sum_to_return += p[top_ind[j]]
        condition2 = True
        while condition2:
            j += 1
            condition2 = (p[top_ind[j]] == 0)

        i += 1

    return sum_to_return


def ens(train_ind, observed_labels, unlabeled_ind, model, budget,
        weights, nn_ind, sims, alpha, limit=1000, do_pruning=True):
    remain_budget = budget - 1
    # unlabeled_weights = weights[unlabeled_ind].tocsc()
    num_unlabeled = unlabeled_ind.size
    num_points = train_ind.size + num_unlabeled

    probs = model.predict(unlabeled_ind, train_ind, observed_labels)
    top_ind = np.argsort(probs)[::-1]
    test_ind = unlabeled_ind[top_ind]

    reverse_ind = np.ones(num_points, dtype=int) * -1
    reverse_ind[unlabeled_ind] = np.arange(num_unlabeled)

    if do_pruning:
        prob_bound = knn_bound(
            train_ind, observed_labels, unlabeled_ind, weights,
            nn_ind, sims, alpha, 1, remain_budget
        )

        future_utility_if_neg = np.sum(probs[top_ind[:remain_budget]])

        future_utility_if_pos = np.sum(prob_bound[:remain_budget])

        future_utility = probs * future_utility_if_pos \
                         + (1 - probs) * future_utility_if_neg
        score_upper_bound = probs + future_utility

        sort_ind = np.argsort(score_upper_bound)[::-1]
        score_upper_bound = score_upper_bound[sort_ind]
        test_ind = unlabeled_ind[sort_ind]

        pruned = np.zeros(num_unlabeled, dtype=bool)

    current_max = -1
    for i in range(num_unlabeled):
        if i >= limit:
            return cand_ind

        if do_pruning and pruned[i]:
            continue

        this_test_ind = test_ind[i]
        fake_train_ind = np.append(train_ind, this_test_ind)
        fake_test_ind = unlabeled_ind[
            weights[:, this_test_ind][unlabeled_ind].nonzero()[0]]

        p = probs.copy()
        p[reverse_ind[this_test_ind]] = 0
        p[reverse_ind[fake_test_ind]] = 0

        if fake_test_ind.size == 0:
            top_bud_ind = top_ind[:remain_budget]
            if np.isin(this_test_ind, top_bud_ind):
                top_bud_ind = top_ind[:(remain_budget + 1)]

            baseline = np.sum(p[top_bud_ind])
            tmp_utility = probs[reverse_ind[this_test_ind]] + baseline
        else:
            fake_utilities = np.empty((2, 1))
            for fake_label in range(2):
                fake_observed_labels = np.append(observed_labels, fake_label)

                fake_probs = model.predict(
                    fake_test_ind, fake_train_ind, fake_observed_labels)
                fake_probs.sort()
                fake_probs = fake_probs[::-1]

                fake_utilities[fake_label] = merge_sort(
                    p, fake_probs, top_ind, remain_budget)

            success_prob = probs[reverse_ind[this_test_ind]]
            tmp_utility = success_prob \
                          + success_prob * fake_utilities[1] \
                          + (1 - success_prob) * fake_utilities[0]

        if tmp_utility > current_max:
            current_max = tmp_utility
            cand_ind = this_test_ind
            if do_pruning:
                pruned[score_upper_bound <= current_max] = True

    return cand_ind

import numpy as np
np.random.seed(0)

from numpy.matlib import repmat

from policies.ens import merge_sort
from probability_bounds.knn_probability_bounds import knn_bound

from time import time


def upper_bound_future_utility(train_and_selected_ind, y_train, samples,
        sample_weights, i, num_samples, unlabeled_ind, unlabeled_probs,
        remain_budget, top_ind, cur_future_utility, weights,
        nn_ind, sims, alpha, model):
    num_unlabled = unlabeled_ind.size
    if unlabeled_probs.shape[0] > num_unlabled:
        top_ind = np.empty((num_unlabled, num_samples), dtype=int)
        all_probs = unlabeled_probs
        unlabeled_probs = np.empty((num_unlabled, num_samples))
        for j in range(num_samples):
            unlabeled_probs[:, j] = all_probs[unlabeled_ind, j]
            top_ind[:, j] = np.argsort(unlabeled_probs[:, j])[::-1]

    total_future_utility = np.zeros(num_unlabled)
    for j in range(num_samples):
        observed_and_sampled = np.concatenate((y_train, samples[:i, j]))
        prob_upper_bound = knn_bound(
            train_and_selected_ind, observed_and_sampled, unlabeled_ind,
            weights, nn_ind, sims, alpha, 1, remain_budget
        )

        future_utility_if_neg = np.sum(
            unlabeled_probs[top_ind[:remain_budget, j], j])

        future_utility_if_pos = np.sum(prob_upper_bound[:remain_budget])

        future_utility = unlabeled_probs[:, j] * future_utility_if_pos + \
                         + (1 - unlabeled_probs[:, j]) * future_utility_if_neg
        delta_future_utility = future_utility - cur_future_utility[j]
        total_future_utility += sample_weights[j] * delta_future_utility

    return total_future_utility / np.sum(sample_weights[:num_samples])


def batch_ens_select_next(train_and_selected_ind, y_train, x_test, test_ind,
        probs, model, weights, nn_ind, sims, alpha, iter,
        samples, sample_weights, all_probs, num_samples, remain_budget,
        sort_upper=True, memorize=True):
    num_test = test_ind.size
    num_points = nn_ind.shape[0]
    unlabeled_ind = np.delete(
        x_test, np.argwhere(np.isin(x_test, train_and_selected_ind)))
    num_unlabled = unlabeled_ind.size

    reverse_ind = np.zeros(num_points, dtype=int)
    reverse_ind[unlabeled_ind] = np.arange(num_unlabled)

    pruned = np.zeros(num_test, dtype=bool)
    unlabeled_probs = np.empty((num_unlabled, num_samples))
    top_ind = np.empty((num_unlabled, num_samples), dtype=int)
    cur_future_utility = np.zeros(num_samples)
    estimated_expected_utility = np.zeros(num_test)
    for j in range(num_samples):
        unlabeled_probs[:, j] = all_probs[unlabeled_ind, j]
        top_ind[:, j] = np.argsort(unlabeled_probs[:, j])[::-1]
        cur_future_utility[j] = np.sum(
            unlabeled_probs[top_ind[:remain_budget, j], j])

    future_utility_bound = upper_bound_future_utility(
        train_and_selected_ind, y_train, samples, sample_weights, iter,
        num_samples, unlabeled_ind, unlabeled_probs, remain_budget, top_ind,
        cur_future_utility, weights, nn_ind, sims, alpha, model
    )
    upper_bound_of_score = probs + future_utility_bound[reverse_ind[test_ind]]

    if sort_upper:
        sort_ind = np.argsort(upper_bound_of_score)[::-1]
        upper_bound_of_score = upper_bound_of_score[sort_ind]
        test_ind = test_ind[sort_ind]
        probs = probs[sort_ind]

    temp_sample_weights = sample_weights / np.sum(sample_weights[:num_samples])
    current_max = -1
    point_added_to_batch = test_ind[0]
    num_computed = 0

    if memorize:
        memorized = {}
        new_weights = np.zeros(sample_weights.shape)
        for j in range(num_samples):
            sample_str = str(samples[:iter, j])
            if sample_str in memorized:
                ind = memorized[sample_str]
                new_weights[ind] = new_weights[ind] + temp_sample_weights[j]
            else:
                memorized[sample_str] = j
                new_weights[j] = temp_sample_weights[j]
        temp_sample_weights = new_weights / sum(new_weights)

    for i in range(num_test):
        if pruned[i]:
            continue

        this_test_ind = test_ind[i]
        num_computed += 1

        fake_train_ind = np.append(train_and_selected_ind, this_test_ind)

        fake_test_ind = unlabeled_ind[
            weights[:, this_test_ind][unlabeled_ind].nonzero()[0]
        ]
        average_future_utility = 0

        for j in range(num_samples):
            if temp_sample_weights[j] < np.finfo(float).eps:
                continue

            p = unlabeled_probs[:, j].copy()
            p[reverse_ind[this_test_ind]] = 0
            p[reverse_ind[fake_test_ind]] = 0

            if fake_test_ind.size == 0:
                top_bud_ind = top_ind[:remain_budget, j]
                if np.isin(reverse_ind[this_test_ind], top_bud_ind):
                    top_bud_ind = top_ind[:(remain_budget + 1), j]

                future_utility = np.sum(p[top_bud_ind])
            else:
                observed_and_sampled = np.concatenate((
                    y_train, samples[:iter, j]))
                fake_utilities = np.zeros(2)
                for fake_label in range(2):
                    fake_observed_labels = np.append(observed_and_sampled, fake_label)
                    fake_probs = model.predict(
                        fake_test_ind, fake_train_ind, fake_observed_labels)
                    fake_probs.sort()
                    fake_probs = fake_probs[::-1]

                    fake_utilities[fake_label] = merge_sort(
                        p, fake_probs, top_ind[:, j], remain_budget)

                this_test_prob = unlabeled_probs[reverse_ind[this_test_ind], j]
                future_utility = this_test_prob * fake_utilities[1] \
                                 + (1 - this_test_prob) * fake_utilities[0]

            delta_future_utility = future_utility - cur_future_utility[j]
            average_future_utility += temp_sample_weights[j] * delta_future_utility

        estimated_expected_utility[i] = probs[i] + average_future_utility
        
        if estimated_expected_utility[i] > current_max \
                and not np.isclose(estimated_expected_utility[i], current_max):
            current_max = estimated_expected_utility[i]
            point_added_to_batch = test_ind[i]
            pruned[upper_bound_of_score <= current_max] = True

    cand_ind = test_ind[~pruned]

    return (
        point_added_to_batch, cand_ind, estimated_expected_utility,
        upper_bound_of_score
    )

def batch_ens(x_train, y_train, x_test, model, budget, batch_size,
        weights, nn_ind, sims, alpha, max_n_samples=16,
        lookahead=None, save_score=False, resample=True, verbose=False):
    num_points = nn_ind.shape[0]
    probs = np.zeros(num_points)
    probs[x_train] = (y_train == 1)
    test_probs = model.predict(x_test, x_train, y_train)

    sort_ind = np.argsort(test_probs)[::-1]
    test_ind = x_test[sort_ind]
    test_probs = test_probs[sort_ind]
    probs[test_ind] = test_probs
    num_train = x_train.size

    if budget <= batch_size:
        return test_ind[:budget]

    remain_budget = budget - batch_size

    if lookahead is None:
        lookahead = float('inf')

    if lookahead < 0:
        raise ValueError('Look-ahead must be non-negative')
    elif lookahead == 0:
        return test_ind[:min(remain_budget, batch_size)]
    elif lookahead >= num_points - num_train - batch_size:
        next_batch_size = remain_budget
    elif lookahead < 1:
        next_batch_size = int(remain_budget * lookahead)
    else:
        next_batch_size = int(batch_size * lookahead)
        next_batch_size = min(remain_budget, next_batch_size)

    if next_batch_size == 0:
        return test_ind[:min(remain_budget, batch_size)]

    batch_ind = np.zeros(batch_size, dtype=int)
    samples = np.empty((batch_size, max_n_samples), dtype=int)
    sample_weights = np.ones(max_n_samples)
    all_probs = repmat(probs.reshape(-1, 1), 1, max_n_samples)

    if save_score:
        all_estimates = np.zeros((num_points, batch_size, 3))

    for i in range(batch_size):
        train_and_selected_ind = np.concatenate((x_train, batch_ind[:i]))
        # print(train_and_selected_ind)
        num_samples = min(2 ** i, max_n_samples)

        tt = time()
        chosen_ind, cand_ind, estimates, upper_bound_of_score = batch_ens_select_next(
            train_and_selected_ind, y_train, x_test, test_ind, test_probs,
            model, weights, nn_ind, sims, alpha, i,
            samples, sample_weights, all_probs, num_samples, next_batch_size
        )
        duration = time() - tt

        if save_score:
            all_estimates[test_ind, i, 0] = estimates
            all_estimates[test_ind, i, 1] = upper_bound_of_score
            all_estimates[test_ind, i, 2] = test_probs

        if verbose:
            print(
                f'remaining budget after this batch {remain_budget}, ',
                f'{i + 1} / {batch_size} selected from {test_ind.size} points ',
                f'({cand_ind.size} after pruning) in {duration:.2f} sec',
                sep=''
            )

        chosen_test_ind_ind = np.argwhere(test_ind == chosen_ind)
        test_ind = np.delete(test_ind, chosen_test_ind_ind)
        test_probs = np.delete(test_probs, chosen_test_ind_ind)

        # temp_x_test_mask = (temp_x_test == chosen_ind)
        # temp_x_test = np.delete(temp_x_test, np.argwhere(temp_x_test_mask))

        batch_ind[i] = chosen_ind

        updating_ind = x_test[weights[:, chosen_ind][x_test].nonzero()[0]]

        if num_samples * 2 <= max_n_samples:
            sample_weights0 = sample_weights.copy()
            for j in range(num_samples - 1, -1, -1):
                both_probs = np.vstack((
                    1 - all_probs[chosen_ind, j],
                    all_probs[chosen_ind, j]
                ))

                for fake_label in range(2):
                    sample_idx = 2 * j + fake_label
                    samples[:(i + 1), [sample_idx]] = np.vstack((
                        samples[:i, [j]], [fake_label]))

                    sample_weights[sample_idx] = sample_weights0[j] \
                                                 * both_probs[fake_label]

                    observed_and_sampled = np.concatenate((
                        y_train, samples[:i, j], [fake_label]))

                    updated_probs = model.predict(
                        updating_ind,
                        np.append(train_and_selected_ind, chosen_ind),
                        observed_and_sampled
                    )
                    all_probs[:, sample_idx] = all_probs[:, j]
                    all_probs[updating_ind, sample_idx] = updated_probs
                    # print(all_probs)
                    # print()
            num_samples *= 2
            sample_weights = sample_weights / np.sum(sample_weights[:num_samples])

        else:
            if resample and (2 ** i <= max_n_samples):
                resample_ind = np.random.choice(
                    np.arange(num_samples),
                    size=max_n_samples, p=sample_weights
                )
                sample_weights = np.ones(max_n_samples) / max_n_samples
                samples = samples[:, resample_ind]
                all_probs = all_probs[:, resample_ind]

            for j in range(num_samples):
                fake_label = np.random.choice(
                    np.arange(2),
                    p=[1 - all_probs[chosen_ind, j], all_probs[chosen_ind, j]]
                )

                observed_and_sampled = np.concatenate((
                    y_train, samples[:i, j], [fake_label]))

                updated_probs = model.predict(
                    updating_ind,
                    np.append(train_and_selected_ind, chosen_ind),
                    observed_and_sampled
                )
                all_probs[updating_ind, j] = updated_probs
                samples[i, j] = fake_label

    if save_score:
        np.save(f'batch_ens_scores_{int(time())}.npy', all_estimates)

    return batch_ind

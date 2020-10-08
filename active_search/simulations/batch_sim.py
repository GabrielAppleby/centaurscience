import numpy as np
np.random.seed(0)


def single_experiment(num_points, labels, num_inits, total_budget, model,
        policies, policy_names, policy_kwargs, init_data=None, verbose=False,
        message_prefix=''):

    if init_data is None:
        init_data = np.random.choice(
            np.argwhere(labels == 1).flatten(),
            size=num_inits, replace=False
        ).flatten()
    else:
        init_data = np.array(init_data)

    if verbose:
        print(f'{message_prefix}Initial data: {init_data}, {labels[init_data]}')

    utilities = np.zeros((len(policies), total_budget), dtype=int)
    queries = np.zeros((len(policies), total_budget), dtype=int)
    all_ind = np.arange(num_points, dtype=int)

    for p_id in range(len(policies)):
        np.random.seed(0)
        policy = policies[p_id]

        tmp_utilities = np.array([], dtype=int)
        tmp_queries = np.array([], dtype=int)

        if verbose:
            i = 0
            print(f'{message_prefix}{policy_names[p_id]}')

        train_ind = init_data.copy()
        observed_labels = labels[train_ind]
        test_ind = np.delete(all_ind, train_ind)
        budget = total_budget

        while budget > 0:
            model.train(train_ind, observed_labels)

            chosen_batch_ind = policy(
                train_ind, observed_labels, test_ind, model,
                **policy_kwargs[p_id]
            )
            chosen_labels = labels[chosen_batch_ind]

            tmp_utilities = np.append(tmp_utilities, chosen_labels)
            tmp_queries = np.append(tmp_queries, chosen_batch_ind)

            train_ind = np.append(train_ind, chosen_batch_ind)
            observed_labels = np.append(observed_labels, chosen_labels)
            test_ind = np.delete(
                all_ind, np.argwhere(np.isin(all_ind, train_ind)))

            budget -= chosen_batch_ind.size

            if verbose:
                print(f'{message_prefix}Iteration {i}:')
                print(f'\tQuery: {chosen_batch_ind}')
                print(f'\tLabel: {chosen_labels}')
                print(f'\tLearned q: {model.q:.4f}')

                i += 1

        utilities[p_id, :] = tmp_utilities
        queries[p_id, :] = tmp_queries

        if verbose:
            print()

    return utilities, queries

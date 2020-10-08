import numpy as np
np.random.seed(0)

from tqdm import tqdm


def single_experiment(num_points, labels, num_inits, total_budget, model,
        policies, policy_kwargs, init_data=None, verbose=False,
        message_prefix='', show_progress=False):
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

    for p_id in range(len(policies)):
        np.random.seed(0)
        policy = policies[p_id]

        if verbose:
            print(f'{message_prefix}{policy.__name__}')

        train_ind = init_data.copy()
        observed_labels = labels[train_ind]
        test_ind = np.delete(np.arange(num_points), train_ind)
        budget = total_budget

        for i in (
            tqdm(range(total_budget)) if show_progress else range(total_budget)
        ):
            this_chosen_ind = policy(
                train_ind, observed_labels, test_ind, model,
                **policy_kwargs[p_id]
            )
            this_chosen_label = labels[this_chosen_ind]
            utilities[p_id, i] = this_chosen_label
            queries[p_id, i] = this_chosen_ind

            train_ind = np.append(train_ind, this_chosen_ind)
            observed_labels = np.append(observed_labels, this_chosen_label)
            test_ind = np.delete(
                test_ind, np.argwhere(test_ind == this_chosen_ind))
            budget -= 1

            if verbose:
                print(
                    f'{message_prefix}Iteration {i}:',
                    f'query {this_chosen_ind}, label {this_chosen_label}',
                    sep=' '
                )

        if verbose:
            print()

    return utilities, queries


def repeat_experiments(num_points, labels, num_inits, total_budget,
        num_experiments, model, policies, policy_kwargs, init_data=None,
        verbose1=False, verbose2=False, save=False):
    all_utilities = np.zeros((len(policies), total_budget, num_experiments))
    all_queries = np.zeros((len(policies), total_budget, num_experiments))

    for exp in range(num_experiments):
        if verbose2:
            message_prefix = f'Experiment {exp}: '
        else:
            message_prefix = ''

        if verbose1:
            print(f'Running experiment {exp}...')

        if init_data is None:
            tmp_init_data = None
        else:
            tmp_init_data = init_data[exp]

        utilities, queries = single_experiment(
            num_points, labels, num_inits, total_budget,
            model, policies, policy_kwargs, init_data=tmp_init_data,
            verbose=verbose2, message_prefix=message_prefix,
            show_progress=verbose1
        )

        all_utilities[:, :, exp] = utilities
        all_queries[:, :, exp] = queries

        if verbose1 or verbose2:
            print(utilities.sum(axis=1))
            print(queries)
            print()

    return all_utilities, all_queries

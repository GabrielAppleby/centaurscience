import {useMutation, useQuery, useQueryCache} from "react-query";
import React, {useState} from "react";
import {Task} from "../types/Task";


const createSearch = () => {
    const url = process.env.REACT_APP_ACTIVE_SEARCH_API
    if (url !== undefined) {
        return fetch(url, {method: 'POST'});
    }
}

const fetchTaskStatus = (name:string, task: Task) => {
    const url = process.env.REACT_APP_ACTIVE_SEARCH_API;
    if (url !== undefined && task !== null && task !== undefined) {
        return fetch(url + '/' + task.uid)
            .then(res => res.json());
    }
}


export function useActiveSearch() {

    const queryCache = useQueryCache();

    const [currentTask, setCurrentTask] = useState<Task>();

    // Honestly
    // @ts-ignore
    const [mutate] = useMutation(createSearch);

    const runActiveSearch = React.useCallback((event) => {
        mutate()
            .then(data => {
                if (data !== undefined)
                {
                    return data.json()
                }
                return undefined;
            })
            .then(data =>
            {
                if (data !== undefined)
                {
                    const task = data as Task;
                    setCurrentTask(task)
                }
            });
    }, [mutate]);

    const {isError, data} = useQuery(
        [process.env.REACT_APP_ACTIVE_SEARCH_TASK_QUERY_KEY, currentTask], fetchTaskStatus,
        {
            refetchInterval: 5000,
            enabled: currentTask !== undefined,
            onSuccess: (task) => {
                if (task !== undefined && task.status !== 'PENDING'){
                    setCurrentTask(undefined);
                    queryCache.invalidateQueries(true);
                }
            }
        });

    if (isError)
    {
        setCurrentTask(undefined);
        queryCache.invalidateQueries(true);
    }

    const isPending = (data !== undefined && data.status === 'PENDING');

    return {runActiveSearch, isPending};
}

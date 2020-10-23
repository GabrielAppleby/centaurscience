import {useMutation} from "react-query";
import React from "react";


const createSearch = () => {
    const url = process.env.REACT_APP_ACTIVE_SEARCH_API
    if (url !== undefined) {
        return fetch(url, {method: 'POST'});
    }
}


export function useActiveSearch() {

    // Honestly
    // @ts-ignore
    const [mutate] = useMutation(createSearch)

    const runActiveSearch = React.useCallback((event) => {
        mutate();
    }, [mutate])


    return {
        runActiveSearch
    };
}

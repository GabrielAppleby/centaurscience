import {Button} from "@material-ui/core";
import React from "react";
import {useQueryCache} from "react-query";
import {useActiveSearch} from "../hooks/useActiveSearch";

export const Controls = () => {
    const queryCache = useQueryCache();
    const {runActiveSearch} = useActiveSearch();

    return (
        <>
            <Button onClick={runActiveSearch}>
                Search
            </Button>
            <Button onClick={() => {
                queryCache.invalidateQueries(true);
            }}>
                Refresh
            </Button>
        </>
    )
}

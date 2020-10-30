import {Button, Typography} from "@material-ui/core";
import React from "react";
import {useActiveSearch} from "../hooks/useActiveSearch";

export const Controls = () => {
    const {runActiveSearch, isPending} = useActiveSearch();

    if (isPending)
    {
        return <Typography>Searching</Typography>
    }
    else
    {
        return <Button onClick={runActiveSearch}>Search</Button>
    }
}

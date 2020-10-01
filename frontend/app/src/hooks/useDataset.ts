import {useCallback, useState} from "react";
import {ProjectedMolecule} from "../types/Molecules";
import {FAKE_DATA} from "../data";


export function useDataset() {

    const [data] = useState<ProjectedMolecule[] | undefined>(FAKE_DATA);

    const handleDatasetChange = useCallback(() => {

    }, [])

    return {
        data, handleDatasetChange
    };
}
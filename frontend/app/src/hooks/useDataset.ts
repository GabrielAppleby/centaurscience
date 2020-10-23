import {ProjectedMolecule} from "../types/Molecules";
import {useQuery} from "react-query";


export function useDataset() {

    const {isError, data} = useQuery(process.env.REACT_APP_MOLECULES_QUERY_KEY, () => {
        const url = process.env.REACT_APP_MOLECULES_API;
        if (url !== undefined) {
            return fetch(url)
                .then(res => res.json())
                .then(res => res as ProjectedMolecule[])
        }
    });

    return {
        data, isError
    };
}

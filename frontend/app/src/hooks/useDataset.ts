import {useEffect, useState} from "react";
import {ProjectedMolecule} from "../types/Molecules";


export function useDataset() {

    const [data, setData] = useState<ProjectedMolecule[] | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        async function fetchData() {
            const url = process.env.REACT_APP_MOLECULES_API;
            console.log(url);
            if (url)
            {
                try {
                    const data = await fetch(url)
                        .then(res => res.json())
                        .then(res => {
                            return res as ProjectedMolecule[]
                        });
                    if (data) {
                        setData(data)
                    }
                }
                catch (error) {
                    setError("Could not reach molecule API.");
                }
            }
            else
            {
                setError("There is no molecule API url set.")
            }
        }

        fetchData();
    }, [])

    return {
        data, error
    };
}
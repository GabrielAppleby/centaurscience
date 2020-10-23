import {Molecule} from "../types/Molecules";
import {useMutation} from "react-query";


const updateMolecule = (molecule: Molecule) => {

    const url = process.env.REACT_APP_MOLECULES_API + '/' + molecule.uid;

    if (url !== undefined) {
        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json; charset=UTF-8' // Indicates the content
            },
            body: JSON.stringify(molecule)
        });
    }
}

export function useUpdateMolecule() {

    // Honestly
    // @ts-ignore
    const [mutate] = useMutation(updateMolecule)

    return {
        mutate
    };
}

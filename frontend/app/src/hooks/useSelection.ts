import {useCallback, useState} from "react";


export function useSelection<T>() {

    const [selectedItem, setSelectedItem] = useState<T | undefined>(undefined);
    const handleSelectedItemChange = useCallback((mol) => setSelectedItem(mol), [])
    return {
        selectedItem, handleSelectedItemChange
    };
}
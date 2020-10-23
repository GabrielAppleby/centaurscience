import React from "react";
import {smileToImageUrl} from "../utils/Smiles";
import {Molecule} from "../types/Molecules";
import {ImageCard} from "./ImageCard";


interface MoleculeImageCardProps {
    readonly header: string;
    readonly molecule: Molecule;
}

export const MoleculeImageCard: React.FC<MoleculeImageCardProps> = ({header, molecule}) => {
    const url = smileToImageUrl(molecule.str_rep);

    return (
        <ImageCard header={header} url={url}/>
    )
}
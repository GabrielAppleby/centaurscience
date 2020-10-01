export interface Molecule {
    uid: number;
    strRep: string;
    label: number;
}

export interface ProjectedMolecule extends Molecule {
    x: number;
    y: number;
}
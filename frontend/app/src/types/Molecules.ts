export interface Molecule {
    uid: number;
    str_rep: string;
    label: string;
}

export interface ProjectedMolecule extends Molecule {
    x: number;
    y: number;
}
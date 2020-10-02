export interface Molecule {
    uid: number;
    str_rep: string;
    label: number;
}

export interface ProjectedMolecule extends Molecule {
    x: number;
    y: number;
}
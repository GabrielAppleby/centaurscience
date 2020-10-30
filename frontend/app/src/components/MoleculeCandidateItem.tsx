import {makeStyles} from "@material-ui/core/styles";
import {Molecule, ProjectedMolecule} from "../types/Molecules";
import {IconButton, ListItem, ListItemText, Typography} from "@material-ui/core";
import {Check, Close} from "@material-ui/icons";
import {useUpdateMolecule} from "../hooks/useUpdateMolecule";
import React from "react";


const useStyles = makeStyles({
    overflowScroll: {
        overflow: "scroll"
    }
});

export interface MoleculeCandidateProps {
    readonly handleSelectedMoleculeChange: (mol: Molecule) => void;
    readonly selectedMolecule?: Molecule;
}

interface MoleculeCandidateItemProps extends MoleculeCandidateProps {
    readonly molecule: ProjectedMolecule;
}

export const MoleculeCandidateItem: React.FC<MoleculeCandidateItemProps> = ({molecule, selectedMolecule, handleSelectedMoleculeChange}) => {
    const mutate = useUpdateMolecule();

    const selectMolecule = () => handleSelectedMoleculeChange(molecule);
    const updateMolecule = (label: string) => {
        molecule.label = label;
        mutate(molecule);
    }

    const selectedPred = selectedMolecule !== undefined && molecule.uid === selectedMolecule.uid;

    const classes = useStyles();

    return (
        <ListItem onClick={selectMolecule} selected={selectedPred}>
            <ListItemText primary={`ID: ${molecule.uid}`}
                          secondary={
                              <Typography className={classes.overflowScroll}>{molecule.str_rep}</Typography>
                          }/>
            <IconButton onClick={() => updateMolecule('False')}>
                <Close/>
            </IconButton>
            <IconButton onClick={() => updateMolecule('True')}>
                <Check/>
            </IconButton>
        </ListItem>
    )
}

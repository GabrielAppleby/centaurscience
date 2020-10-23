import {makeStyles} from "@material-ui/core/styles";
import {Molecule, ProjectedMolecule} from "../types/Molecules";
import {IconButton, ListItem, ListItemText, Typography} from "@material-ui/core";
import {ShoppingBasket, ShoppingCart} from "@material-ui/icons";
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
    const {mutate} = useUpdateMolecule();

    const selectMolecule = () => handleSelectedMoleculeChange(molecule);
    const updateMolecule = (label: string) => {
        molecule.label = label;
        mutate(molecule);
    }

    const selectedPred = selectedMolecule !== undefined && molecule.uid === selectedMolecule.uid;

    const classes = useStyles();

    return (
        <ListItem key={`item_${molecule.uid}`}
                  onClick={selectMolecule} selected={selectedPred}>
            <ListItemText key={`itemText_${molecule.uid}`}
                          primary={molecule.uid}
                          secondary={
                              <Typography className={classes.overflowScroll}>{molecule.str_rep}</Typography>
                          }/>
            <IconButton onClick={() => updateMolecule('False')}>
                <ShoppingBasket/>
            </IconButton>
            <IconButton onClick={() => updateMolecule('True')}>
                <ShoppingCart/>
            </IconButton>
        </ListItem>
    )
}

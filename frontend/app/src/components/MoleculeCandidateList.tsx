import React from "react";
import {Molecule} from "../types/Molecules";
import {List, ListItem, ListItemText, Typography} from "@material-ui/core";


interface MoleculeCandidateListProps {
    readonly moleculeCandidates: Molecule[];
    readonly handleSelectedMoleculeChange: (mol: Molecule) => void;
}

export const MoleculeCandidateList: React.FC<MoleculeCandidateListProps> = ({moleculeCandidates, handleSelectedMoleculeChange}) => {
    return (
        <List>
            {moleculeCandidates.map(mol => {
                return (
                    <ListItem key={`item_${mol.uid}`}>
                            <ListItemText key={`itemText_${mol.uid}`}
                                          primary={mol.uid}
                                          secondary={
                                              <Typography style={{overflow:"scroll"}}>{mol.str_rep}</Typography>
                                          }/>
                    </ListItem>
                )})}
        </List>
        )
}
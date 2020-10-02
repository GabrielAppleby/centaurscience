import React from "react";
import {Molecule} from "../types/Molecules";
import {IconButton, List, ListItem, ListItemSecondaryAction, ListItemText} from "@material-ui/core";
import { Delete } from '@material-ui/icons';


interface MoleculeCandidateListProps {
    readonly moleculeCandidates: Molecule[];
}

export const MoleculeCandidateList: React.FC<MoleculeCandidateListProps> = ({moleculeCandidates}) => {
    return (
        <List>
            {moleculeCandidates.map(mol => {
                return (<ListItem key={`item_${mol.uid}`}>
                    <ListItemText key={`itemText_${mol.uid}`} secondary={mol.str_rep.slice(0,8)}/>
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete">
                            <Delete/>
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>)
            })}
        </List>
        )
}
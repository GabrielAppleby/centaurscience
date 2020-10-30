import React from "react";
import {ProjectedMolecule} from "../types/Molecules";
import {List} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {MoleculeCandidateItem, MoleculeCandidateProps} from "./MoleculeCandidateItem";


interface MoleculeCandidateListProps extends MoleculeCandidateProps {
    readonly moleculeCandidates: ProjectedMolecule[];
}


const useStyles = makeStyles({
    list: {
        height: "100%",
        overflow: "scroll"
    },
});


export const MoleculeCandidateList: React.FC<MoleculeCandidateListProps> = ({moleculeCandidates, selectedMolecule, handleSelectedMoleculeChange}) => {
    const classes = useStyles();

    return (
        <List className={classes.list}>
            {moleculeCandidates.map(mol => {
                return (
                    <MoleculeCandidateItem key={`list_item_${mol.uid}`}
                                           molecule={mol}
                                           selectedMolecule={selectedMolecule}
                                           handleSelectedMoleculeChange={handleSelectedMoleculeChange}/>
                )
            })}
        </List>
    )
}

import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {useDataset} from "../hooks/useDataset";
import {useSelection} from "../hooks/useSelection";
import {DefaultAppBar} from "../components/DefaultAppBar";
import {Grid, Snackbar} from "@material-ui/core";
import {DimensionProvider} from "../contexts/Dimensions";
import {ProjectionChart} from "../components/ProjectionChart";
import {MoleculeImageCard} from "../components/MoleculeImageCard";
import {MoleculeCandidateList} from "../components/MoleculeCandidateList";
import {ProjectedMolecule} from "../types/Molecules";
import {Controls} from "../components/Controls";

const useStyles = makeStyles({
    app: {
        height: '96vh',
        display: 'flex',
        flexDirection: 'column'
    },
    snackBar: {},
    mainGrid: {
        flexGrow: 1
    },
    chartGridContainer: {
        height: '100%'
    },
    moleculeImageContainer: {
        justifyContent: "center",
        alignItems: "center"
    },
    paper: {
        height: '100%',
    }
});


export const DefaultPanel = () => {
    const {data, isError} = useDataset();
    const {selectedItem, handleSelectedItemChange} = useSelection<ProjectedMolecule>();

    const classes = useStyles();

    return (
        <div className={classes.app}>
            <DefaultAppBar organizationName={"Centaur Science"} appName={"Active Search"}/>
            <Grid container item className={classes.mainGrid}>
                <Grid item sm={12} md={6} className={classes.chartGridContainer}>
                    <DimensionProvider>
                        {data && <ProjectionChart data={data}
                                                  selectedMolecule={selectedItem}
                                                  handleSelectedMoleculeChange={handleSelectedItemChange}/>}
                    </DimensionProvider>
                </Grid>
                <Grid container item sm={12} md={3} direction={"column"} className={classes.moleculeImageContainer}>
                    <Grid item>
                        {selectedItem && <MoleculeImageCard header={"Selected Molecule"} molecule={selectedItem}/>}
                    </Grid>
                    <Grid item>
                        <Controls/>
                    </Grid>
                </Grid>
                <Grid item sm={12} md={3} className={classes.chartGridContainer}>
                    {data && <MoleculeCandidateList moleculeCandidates={data.filter((d) => d.label === 'candidate')}
                                                    handleSelectedMoleculeChange={handleSelectedItemChange}
                                                    selectedMolecule={selectedItem}/>}
                </Grid>
            </Grid>
            <Snackbar className={classes.snackBar}
                      anchorOrigin={{vertical: "top", horizontal: "center"}}
                      open={isError}
                      message={"Failed to fetch molecules from the API."}/>
        </div>
    )
}

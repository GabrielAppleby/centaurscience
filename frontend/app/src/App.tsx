import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {DefaultAppBar} from "./components/DefaultAppBar";
import {Grid} from "@material-ui/core";
import {Molecule} from "./types/Molecules";
import {useDataset} from "./hooks/useDataset";
import {ProjectionChart} from "./components/ProjectionChart";
import {useSelection} from "./hooks/useSelection";
import {MoleculeImageCardProps} from "./components/MoleculeImageCard";
import {MoleculeCandidateList} from "./components/MoleculeCandidateList";

const useStyles = makeStyles({
    app: {},
    verticallyCentered: {
        justifyContent: "center",
        alignItems: "center"
    }
});

function App() {
    const {data} = useDataset();
    const {selectedItem, handleSelectedItemChange} = useSelection<Molecule>();

    const classes = useStyles();


    return (
        <div className={classes.app}>
            <DefaultAppBar organizationName={"Centaur Science"} appName={"Active Search"}/>
            <Grid container>
                <Grid item xs={12} sm={6}>
                    {data && <ProjectionChart data={data} handleSelectedMoleculeChange={handleSelectedItemChange}/>}
                </Grid>
                <Grid item container className={classes.verticallyCentered} xs={12} sm={3}>
                    <Grid item>
                        {selectedItem && <MoleculeImageCardProps header={"Selected Molecule"} molecule={selectedItem}/>}
                    </Grid>
                </Grid>
                <Grid item container className={classes.verticallyCentered} xs={12} sm={3}>
                    {selectedItem && <MoleculeCandidateList moleculeCandidates={[selectedItem]}/>}
                </Grid>
            </Grid>
        </div>
    );
}

export default App;

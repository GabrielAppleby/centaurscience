import {makeStyles} from "@material-ui/core/styles";
import React from "react";
import {Typography} from "@material-ui/core";

const useStyles = makeStyles({
    imageCardDiv: {
        margin: "auto",
        textAlign: "center"
    }
});


export interface ImageCardProps {
    readonly header: string;
    readonly url: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({header, url}) => {
    const classes = useStyles();

    return (
        <div className={classes.imageCardDiv}>
            <Typography>
                {header}
            </Typography>
            <img src={url} alt={"I'm sorry."}/>
        </div>
    )
}

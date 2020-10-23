import React, {useEffect, useRef, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";

export interface Dimensions {
    readonly width: number;
    readonly height: number;
}

const useStyles = makeStyles({
    wrapperDiv: {height: "100%"}
});

export const DimensionsContext = React.createContext<Dimensions>({width: 500, height: 500});

export const DimensionProvider: React.FC = (props) => {
    const domNode = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({width: 500, height: 500});
    const [timeoutID, newTimeoutID] = useState<NodeJS.Timeout>();
    const classes = useStyles();

    useEffect(() => {
        if (domNode.current !== null) {
            const domRect = domNode.current.getBoundingClientRect();
            setDimensions({width: domRect.width, height: domRect.height});
        }
    }, []);

    useEffect(() => {
        const getNodeDimensions = () => {
            if (timeoutID !== undefined) {
                clearTimeout(timeoutID);
            }
            const test = setTimeout(() => {
                if (domNode.current !== null) {
                    const domRect = domNode.current.getBoundingClientRect();
                    setDimensions({width: domRect.width, height: domRect.height});
                }
            }, 500)
            newTimeoutID(test);
        };

        window.addEventListener('resize', getNodeDimensions);
        return () => {
            window.removeEventListener('resize', getNodeDimensions)
        };
    });

    return (
        <div ref={domNode} className={classes.wrapperDiv}>
            <DimensionsContext.Provider value={dimensions}>
                {props.children}
            </DimensionsContext.Provider>
        </div>
    )
}

import React from 'react';
import {QueryCache, ReactQueryCacheProvider} from "react-query";
import {DefaultPanel} from "./panels/DefaultPanel";

const queryCache = new QueryCache()

function App() {


    return (
        <ReactQueryCacheProvider queryCache={queryCache}>
            <DefaultPanel/>
        </ReactQueryCacheProvider>
    );
}

export default App;

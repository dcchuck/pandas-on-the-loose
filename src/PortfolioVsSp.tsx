import React, { useCallback, useEffect, useState } from "react";
import { db } from "./db";
import PyodideWorker from "./Pyodide.worker";
import { portfolioVsSp500 as portfolioVsSp500Python } from "./python-scripts/portfolio-vs-sp500";
const worker = new PyodideWorker();

export enum MatrixDefinition {
    Correlation = 'Correlation',
    Covariance = 'Covariance'
}

const sendRunMessage = async () => {
    const allRecords = await db.stockObservation.toArray();

    worker.postMessage({
        id: Math.floor(Math.random() * 100000), // TODO do i need this?
        allRecords,
        python: portfolioVsSp500Python,
    })
};

export const PortfoioVsSp: React.FC = () => {
    const [result, setResult] = useState('')

    // TODO this any
    const onWorkerMessage = useCallback((event: any) => {
        const { results } = event.data;
        console.log('got data!')
        console.log(event.data)
        setResult(results)
    },[])

    useEffect(() => {
        worker.onmessage = onWorkerMessage;

        return worker.removeEventListener('message', onWorkerMessage);
    },[onWorkerMessage])

    useEffect(() => {
        sendRunMessage();
    },[])


    return(
        <div>{result}</div>
    )
}
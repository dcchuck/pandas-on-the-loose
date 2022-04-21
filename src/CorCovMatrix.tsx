import React, { useCallback, useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { db } from "./db";
import PyodideWorker from "./Pyodide.worker";
import { correlationMatrix as correlationMatrixPython } from "./python-scripts/correlation-matrix";
import styled from 'styled-components';
const worker = new PyodideWorker();

export enum MatrixDefinition {
    Correlation = 'Correlation',
    Covariance = 'Covariance'
}

const sendRunMessage = async (matrixDefinition: MatrixDefinition) => {
    const allRecords = await db.stockObservation.toArray();

    worker.postMessage({
        id: Math.floor(Math.random() * 100000), // TODO do i need this?
        allRecords,
        matrixDefinition,
        python: correlationMatrixPython,
    })
};


const WIDTH = 500;
const HEIGHT = 300;

interface ICorrelationMatrixRow {
    AAPL: number;
    AMZN: number;
    FB: number;
    GOOG: number;
    MSFT: number;
}

const MatrixWrapper = styled.div`
`

const MatrixHeadline = styled.h1`
    margin: 0;
`

export const CorCovMatrix: React.FC<{ matrixDefinition: MatrixDefinition }> = ({ matrixDefinition }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<ICorrelationMatrixRow[]>([]);
    const [columnDefs, setColumnDefs] = useState<{ field: string }[]>([]);
    // TODO update text or do something with initialized; causes ref weirdness & column issues in first attempts
    const [initialized, setInitialized] = useState(false);

    // TODO this any
    const onWorkerMessage = useCallback((event: any) => {
        const { id, ...data } = event.data;
        console.log(event.data)
        const [symbolArray, rowsArray]: [string[], number[][]] = JSON.parse(data.results);

        const newRowData = rowsArray.map((valueArr: number[]) => {
            const result: Record<string, unknown> = {};
            for (let i = 0; i < valueArr.length; i++) {
                result[symbolArray[i]] = valueArr[i];
            }

            return result;
        })

        setRowData(newRowData as unknown as ICorrelationMatrixRow[]);
        setColumnDefs(symbolArray.map(field => ({ field })));
        setInitialized(true)
    },[setRowData, gridRef])

    useEffect(() => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current?.api.sizeColumnsToFit();
        }
    }, [gridRef, columnDefs])

    useEffect(() => {
        worker.onmessage = onWorkerMessage;

        return worker.removeEventListener('message', onWorkerMessage);
    },[onWorkerMessage])

    useEffect(() => {
        sendRunMessage(matrixDefinition);
    },[])


    return(
        <MatrixWrapper>
            <MatrixHeadline>{matrixDefinition} Matrix</MatrixHeadline>
            <div className="ag-theme-alpine-dark" style={{width: WIDTH, height: HEIGHT}}>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                />
            </div>
        </MatrixWrapper>
    )
}
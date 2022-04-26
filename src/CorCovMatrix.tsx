import React, { useCallback, useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import PyodideWorker from "./Pyodide.worker";
import { correlationMatrix as correlationMatrixPython } from "./python-scripts/correlation-matrix";
import { PortfolioSelect } from "./PortfolioSelect";
const worker = new PyodideWorker();

export enum MatrixDefinition {
    Correlation = 'Correlation',
    Covariance = 'Covariance'
}

const sendRunMessage = async (matrixDefinition: MatrixDefinition, portfolio: string[]) => {
    worker.postMessage({
        matrixDefinition,
        python: correlationMatrixPython,
        portfolio,
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

const Loader = () => <span>Hello World</span>

export const CorCovMatrix: React.FC<{ matrixDefinition: MatrixDefinition }> = ({ matrixDefinition }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<ICorrelationMatrixRow[]>([]);
    const [columnDefs, setColumnDefs] = useState<{ field: string }[]>([]);
    const [portfolio, setPortfolio] = React.useState<string[]>([]);

    // TODO this any
    const onWorkerMessage = useCallback((event: any) => {
        const { results } = event.data;
        const [symbolArray, rowsArray]: [string[], number[][]] = JSON.parse(results);

        const newRowData = rowsArray.map((valueArr: number[]) => {
            const result: Record<string, unknown> = {};
            for (let i = 0; i < valueArr.length; i++) {
                result[symbolArray[i]] = valueArr[i];
            }

            return result;
        })

        setRowData(newRowData as unknown as ICorrelationMatrixRow[]);
        setColumnDefs(symbolArray.map(field => ({ field })));
    }, [setRowData])

    useEffect(() => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current?.api.sizeColumnsToFit();
        }
    }, [gridRef, columnDefs])

    useEffect(() => {
        worker.onmessage = onWorkerMessage;

        return worker.removeEventListener('message', onWorkerMessage);
    }, [onWorkerMessage])

    // useEffect(() => {
    //     sendRunMessage(matrixDefinition);
    // }, [matrixDefinition])

    const submitPortfolio = useCallback(() => {
        sendRunMessage(matrixDefinition, portfolio)
    }, [matrixDefinition, portfolio]);


    return (
        <div>
            <h1>{matrixDefinition} Matrix</h1>
            <PortfolioSelect portfolio={portfolio} setPortfolio={setPortfolio} />
            <button onClick={submitPortfolio}>Submit</button>
            <div className="ag-theme-alpine-dark" style={{ width: WIDTH, height: HEIGHT }}>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    noRowsOverlayComponent={Loader}
                />
            </div>
        </div>
    )
}
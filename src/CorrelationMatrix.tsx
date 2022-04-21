import React, { useCallback, useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { db } from "./db";
import PyodideWorker from "./Pyodide.worker";
import { correlationMatrix as correlationMatrixPython } from "./python-scripts/correlation-matrix";
import { Nav } from "./Nav";
const worker = new PyodideWorker();

const sendRunMessage = async () => {
    const allRecords = await db.stockObservation.toArray();

    worker.postMessage({
        id: Math.floor(Math.random() * 100000), // TODO do i need this?
        allRecords,
        context: { allRecords },
        python: correlationMatrixPython,
    })
};


const WIDTH = 800;
const HEIGHT = 300;
// symbol_list = ["AAPL", "AMZN", "FB", "GOOG", "MSFT"] #,"CAT", "NKE", "DAL","XOM"
const defaultColumnDefs = [{ field: 'AAPL', width: 160 }, { field: "AMZN", width: 160 }, { field: "FB", width: 160 }, { field: "GOOG", width: 160 }, { field: "MSFT", width: 160 } ]

interface ICorrelationMatrixRow {
    AAPL: number;
    AMZN: number;
    FB: number;
    GOOG: number;
    MSFT: number;
}

export const CorrelationMatrix = () => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<ICorrelationMatrixRow[]>([]);
    const [columnDefs] = useState(defaultColumnDefs);

    // TODO this any
    const onWorkerMessage = useCallback((event: any) => {
        const { id, ...data } = event.data;
        const [symbolArray, rowsArray]: [string[], number[][]] = JSON.parse(data.results);

        const newRowData = rowsArray.map((valueArr: number[]) => {
            const result: Record<string, unknown> = {};
            for (let i = 0; i < valueArr.length; i++) {
                result[symbolArray[i]] = valueArr[i];
            }

            return result;
        })

        console.log('Setting Row Data', newRowData)
        setRowData(newRowData as unknown as ICorrelationMatrixRow[]);
        gridRef.current?.api.sizeColumnsToFit();
    },[setRowData])

    useEffect(() => {
        worker.onmessage = onWorkerMessage;

        return worker.removeEventListener('message', onWorkerMessage);
    },[onWorkerMessage])


    return(
        <div>
            <h1>Correlation Matrix</h1>
            <button onClick={sendRunMessage}>RUN</button>
            <div className="ag-theme-alpine" style={{width: WIDTH, height: HEIGHT}}>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                />
            </div>
            <Nav />
        </div>
    )
}
import React, { useCallback, useEffect, useState } from "react";
import PyodideWorker from "./Pyodide.worker";
import { correlationMatrix as correlationMatrixPython } from "./python-scripts/correlation-matrix";
import { PortfolioSelect } from "./PortfolioSelect";
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography } from "@mui/material";

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

interface MatrixTableProps {
    rows: number[][];
    columns: string[];
}

const MatrixTable: React.FC<MatrixTableProps> = ({ rows, columns }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {
                columns.map(columnString => <TableCell>{columnString}</TableCell>)
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((rowNumbersArray, index) => (
            <TableRow
              key={`rowTableRow-${index}`}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {
                  rowNumbersArray.map(numberValue => <TableCell>{numberValue}</TableCell>)
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export const CorCovMatrix: React.FC<{ matrixDefinition: MatrixDefinition }> = ({ matrixDefinition }) => {
    const [rowData, setRowData] = useState<number[][]>([]);
    const [columnDefs, setColumnDefs] = useState<string[]>([]);
    const [portfolio, setPortfolio] = React.useState<string[]>([]);

    // TODO this any
    const onWorkerMessage = useCallback((event: any) => {
        const { results } = event.data;
        const [symbolArray, rowsArray]: [string[], number[][]] = JSON.parse(results);

        setRowData(rowsArray);
        setColumnDefs(symbolArray)
    }, [setRowData])

    useEffect(() => {
        worker.onmessage = onWorkerMessage;

        return worker.removeEventListener('message', onWorkerMessage);
    }, [onWorkerMessage])

    const submitPortfolio = useCallback(() => {
        sendRunMessage(matrixDefinition, portfolio)
    }, [matrixDefinition, portfolio]);


    return (
        <Paper>
            <Typography variant="h5">{matrixDefinition} Matrix</Typography>
            <PortfolioSelect portfolio={portfolio} setPortfolio={setPortfolio} />
            <Button onClick={submitPortfolio}>Submit</Button>
            <MatrixTable rows={rowData} columns={columnDefs} />
        </Paper>
    )
}
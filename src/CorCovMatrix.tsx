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
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Typography } from "@mui/material";
import { LoadingPanda } from './LoadingPanda';

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

// TODO move me
export const LoadingPlaceholder = () => {
  return (
    <Paper sx={{ height: 250, width: "100%", display: 'flex', justifyContent: 'space-evenly', flexDirection: 'column', alignItems: 'center' }}>
      <Box component="div" sx={{ backgroundColor: 'white', display: 'flex', width: 100 }}>
        <LoadingPanda />
      </Box>
      <Typography variant="h6" sx={{ display: 'flex' }}>Loading...</Typography>
    </Paper>
  )
}

const MatrixTable: React.FC<MatrixTableProps> = ({ rows, columns }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ width: '100%' }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {
              columns.map((columnString, index) => <TableCell key={`columns.mapTableCell-${index}`}>{columnString}</TableCell>)
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
                rowNumbersArray.map((numberValue, index) => <TableCell key={`rowNumbersArray.mapTableCell${index}`}>{numberValue}</TableCell>)
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
  const [loading, setLoading] = useState(false);

  // TODO this any
  const onWorkerMessage = useCallback((event: any) => {
    const { results } = event.data;
    const [symbolArray, rowsArray]: [string[], number[][]] = JSON.parse(results);

    setRowData(rowsArray);
    setColumnDefs(symbolArray)
    setLoading(false)
  }, [setRowData])

  useEffect(() => {
    worker.onmessage = onWorkerMessage;

    return worker.removeEventListener('message', onWorkerMessage);
  }, [onWorkerMessage])

  const submitPortfolio = useCallback(() => {
    sendRunMessage(matrixDefinition, portfolio)
  }, [matrixDefinition, portfolio]);

  useEffect(() => {
    if (loading) {
      submitPortfolio()
    }
  }, [loading, submitPortfolio])

  const onButtonClick = () => setLoading(true)

  return (
    <Paper sx={{ height: '100%' }}>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
      >
        <Grid item xs={5}>
          <Typography variant="h5" sx={{ marginLeft: 3 }}>{matrixDefinition} Matrix</Typography>
        </Grid>
        <Grid item xs={5}>
          <PortfolioSelect disabled={loading} portfolio={portfolio} setPortfolio={setPortfolio} />
        </Grid>
        <Grid item xs={2}>
          <Button onClick={onButtonClick} size="large" disabled={loading}>Submit</Button>
        </Grid>
        <Grid item xs={12}>
          {
            loading ?
              <LoadingPlaceholder />
              :
              <MatrixTable rows={rowData} columns={columnDefs} />
          }
        </Grid>
      </Grid>
    </Paper>
  )
}

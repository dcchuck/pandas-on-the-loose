import React, { useCallback, useEffect, useState } from "react";
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { db } from "./db";
import PyodideWorker from "./Pyodide.worker";
import { portfolioVsSp500 as portfolioVsSp500Python } from "./python-scripts/portfolio-vs-sp500";
import { PortfolioSelect } from "./PortfolioSelect";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { LoadingPlaceholder } from "./LoadingPlaceholder";
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';

const worker = new PyodideWorker();

export enum MatrixDefinition {
    Correlation = 'Correlation',
    Covariance = 'Covariance'
}

const sendRunMessage = async (portfolio: string[]) => {
    const allRecords = await db.stockObservation.toArray();

    worker.postMessage({
        id: Math.floor(Math.random() * 100000), // TODO do i need this?
        allRecords,
        python: portfolioVsSp500Python,
        portfolio
    })
};

const NULL_RESULT = 'NULL_RESULT';

const PortfolioComparisonDisplay: React.FC<{ result: string }> = ({ result }) => {
    if (result === NULL_RESULT) {
        return <></>
    }
    // TODO type this and move it up
    const parsedResults: any = JSON.parse(result);

    return (
    <TableContainer component={Paper}>
      <Table sx={{}} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Instruments</TableCell>
            <TableCell>Mean Return</TableCell>
            <TableCell>Volatility</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>Portfolio</TableCell>
              <TableCell>{parsedResults.portfolio.meanReturn}</TableCell>
              <TableCell>{parsedResults.portfolio.volatility}</TableCell>
            </TableRow>
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>S&P 500</TableCell>
              <TableCell>{parsedResults.sp.meanReturn}</TableCell>
              <TableCell>{parsedResults.sp.volatility}</TableCell>
            </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
    )
}

export const PortfoioVsSp: React.FC = () => {
    const [result, setResult] = useState(NULL_RESULT)
    const [portfolio, setPortfolio] = React.useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // TODO this any
    const onWorkerMessage = useCallback((event: any) => {
        const { results } = event.data;
        console.log('got data!')
        console.log(event.data)
        setResult(results)
        setLoading(false)
    }, [])

    useEffect(() => {
        worker.onmessage = onWorkerMessage;

        return worker.removeEventListener('message', onWorkerMessage);
    }, [onWorkerMessage])

    useEffect(() => {
        if (loading) {
            sendRunMessage(portfolio);
        }
    }, [loading, portfolio])

    const onButtonClick = () => setLoading(true)

    return (
        <Paper sx={{ height: '100%' }}>
            <Grid
                container
                alignItems="center"
                justifyContent="center"
            >
                <Grid item xs={5}>
                    <Typography variant="h5" sx={{ marginLeft: 3 }}>Portfolio vs S&P 500</Typography>
                </Grid>
                <Grid item xs={5}>
                    <PortfolioSelect portfolio={portfolio} setPortfolio={setPortfolio} disabled={loading}/>
                </Grid>
                <Grid item xs={2}>
                    <Button onClick={onButtonClick} size="large" disabled={loading}>Submit</Button>
                </Grid>
                <Grid item xs={12}>
                    {
                        loading ?
                            <LoadingPlaceholder />
                            :
                            <PortfolioComparisonDisplay result={result}/>
                    }
                </Grid>
            </Grid>
        </Paper>
    )
}
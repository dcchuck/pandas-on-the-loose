import React from 'react';
import './App.css';
import { db } from './db';
import { Nav } from './Nav';
import * as allRecords from './data-seed'
import { PortfolioSelect } from './PortfolioSelect';

type RecordCountArray = [string,number][]

function App() {
  const [symbols] = React.useState<string[]>(Object.keys(allRecords))
  const [recordCount, setRecordCount] = React.useState<RecordCountArray>([])

  const init = React.useCallback(async () => {
    const newRecordCounts: RecordCountArray = []
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i]
      const recordCount = await db.stockObservation.where({ symbol }).count()
      newRecordCounts.push([symbol, recordCount])
    }
    setRecordCount(newRecordCounts)

  },[setRecordCount, symbols])

  React.useEffect(() => {
    init();
  },[setRecordCount, init])

  return (
    <div>
      <h1>Records</h1>
      <div>{JSON.stringify(recordCount)}</div>
      <Nav />
      <PortfolioSelect />
    </div>
  );
}

export default App;

import React from 'react';
import './App.css';
import { db } from './db';
import Seeder from './Seeder';
import { CorrelationMatrix } from './CorrelationMatrix';

type RecordCountArray = [string,number][]

function App() {
  const [symbols] = React.useState<string[]>(['aapl', 'amzn', 'fb', 'goog', 'msft', 'sp500'])
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
      <h1>{JSON.stringify(recordCount)}</h1>
      <Seeder />
      <CorrelationMatrix />
    </div>
  );
}

export default App;

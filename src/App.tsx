import React from 'react';
import './App.css';
import Sample from './Sample.worker';
import { db } from './db';
import Seeder from './Seeder';
import { CorrelationMatrix } from './CorrelationMatrix';
const pyodideWorker = new Sample();

const callbacks = {};

pyodideWorker.onmessage = (event) => {
  const { id, ...data } = event.data;
  // @ts-ignore
  const onSuccess = callbacks[id];
  // @ts-ignore
  delete callbacks[id];
  onSuccess(data);
};

const asyncRun = (() => {
  let id = 0; // identify a Promise
  // @ts-ignore
  return (script, context) => {
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
      // @ts-ignore
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        python: script,
        id,
      });
    });
  };
})();

const script = `
    import statistics
    from js import A_rank
    statistics.stdev(A_rank)
`;

const context = {
  A_rank: [0.8, 0.4, 1.2, 3.7, 2.6, 5.8],
};

async function main() {
  try {
    // @ts-ignore
    const { results, error } = await asyncRun(script, context);
    if (results) {
      console.log("pyodideWorker return results: ", results);
    } else if (error) {
      console.log("pyodideWorker error: ", error);
    }
  } catch (e) {
    console.log(
      //@ts-ignore
      `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
    );
  }
}

type RecordCountArray = [string,number][]

function App() {
  React.useEffect(() => { main() }, [])
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

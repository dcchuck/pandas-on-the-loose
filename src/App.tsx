import React from 'react';
import logo from './logo.svg';
import './App.css';
import Sample from './Sample.worker';
import { db } from './db';
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

function App() {
  React.useEffect(() => { main() }, [])
  const [message, setMessage] = React.useState('')

  // validating unique constraint
  const addDate = async () => {
    try {
      const id = await db.stockObservation.add({
        symbol: 'CPD',
        adjustedClose: '99',
        date: new Date(2020, 10, 1)
      })

      setMessage(`Created: ${id}`)
    } catch (e) {
      setMessage(`Problem!: $${e}`);
    }

  }

  return (
    <div>
      <button onClick={addDate}>ADD</button>
      <h1>{message}</h1>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import PyodideWorker from './Pyodide.worker';

const worker = new PyodideWorker();

const python = `
a = 5
b = 6

a + b
`

const sendMessage = () => {
    worker.postMessage({
        python
    })
}

export const BasicExample = () => {
    const [result, setResult] = useState('')

    const onWorkerMessage = (event: any) => {
        const { results } = event.data;

        setResult(results)
    }

    useEffect(() => {
        worker.onmessage = onWorkerMessage

        return worker.removeEventListener('message', onWorkerMessage);
    }, [])

    return (
        <div>
            <button onClick={sendMessage}>Run</button>
            {result}
        </div>
    );
}
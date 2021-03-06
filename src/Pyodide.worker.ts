import { db } from './db';
declare const self: DedicatedWorkerGlobalScope;
export default {} as typeof Worker & { new (): Worker };

// TODO - import from a locally running CDN
importScripts("https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js");

async function loadPyodideAndPackages() {
  // @ts-ignore
  self.pyodide = await loadPyodide();
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  // make sure loading is done
  await pyodideReadyPromise;
  // Don't bother yet with this line, suppose our API is built in such a way:
  const { python, ...context } = event.data;

  const allRecords = await db.stockObservation.toArray();
  // @ts-ignore
  self['allRecords'] = allRecords;
  // The worker copies the context in its own "memory" (an object mapping name to values)
  for (const key of Object.keys(context)) {
    // @ts-ignore
    self[key] = context[key];
  }

  try {
    // @ts-ignore
    await self.pyodide.loadPackagesFromImports(python);
    // @ts-ignore
    let results = await self.pyodide.runPythonAsync(python);
    // self.postMessage({ results, id });
    self.postMessage({ results });
  } catch (error) {
    // @ts-ignore
    self.postMessage({ error: error.message, id });
  }
};
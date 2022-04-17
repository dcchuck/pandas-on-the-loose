declare const self: DedicatedWorkerGlobalScope;
export default {} as typeof Worker & { new (): Worker };

// Your code ...
console.log('[MyWorker] Running.');

self.addEventListener('message', (event: MessageEvent): void => {
  console.log('[MyWorker] Incoming message from main thread:', event.data);
});
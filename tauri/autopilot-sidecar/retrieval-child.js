// The retrieval worker in a forked Node child: gives worker.js the process.parentPort it has
// in Electron's utility process ({ data } events), then runs it unchanged.
//   node retrieval-child.js <worker.js> <userData>
const [workerFile, userData] = process.argv.slice(2);
process.argv = [process.argv[0], workerFile, userData];
process.parentPort = {
  on: (name, listener) => process.on(name, (data) => listener({ data })),
  postMessage: (message) => process.send(message),
};
require(workerFile);

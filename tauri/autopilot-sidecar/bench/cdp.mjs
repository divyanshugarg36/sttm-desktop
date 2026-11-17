// cdp.mjs <port> <page-substring> <expression>  → evaluates in that page, prints JSON result
const [port, match, expr] = process.argv.slice(2);
const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = pages.find((p) => p.url.includes(match) && p.type === 'page');
if (!page) { console.log(JSON.stringify({ nopage: pages.map((p) => p.type + ' ' + p.url) })); process.exit(1); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) { console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails?.exception?.description ?? d.result ?? d.error)); ws.close(); } };
ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: expr, awaitPromise: true, returnByValue: true } }));

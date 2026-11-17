// summarize.js → per variant, the median over runs of: idle, loaded, running (median of the
// phase's samples after it settles), peak (max sample), CPU % of one core while running.
const fs = require('fs');
const dir = process.argv[2];
const med = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null;
};
const runs = {};
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.tsv'))) {
  const [, variant, run] = f.match(/^(.*)-(\d+)\.tsv$/);
  const rows = fs.readFileSync(`${dir}/${f}`, 'utf8').trim().split('\n').map((l) => {
    const [t, phase, shell, sidecar, procs, ticks] = l.split('\t');
    return { t: +t, phase, shell: +shell, sidecar: +sidecar, total: +shell + +sidecar, procs: +procs, ticks: +ticks };
  }).filter((r) => r.shell > 0 || r.sidecar > 0);
  const phase = (p, skip) => {
    const rs = rows.filter((r) => r.phase === p);
    return rs.length ? rs.filter((r) => r.t >= rs[0].t + skip) : [];
  };
  const idle = phase('idle', 85); // the last ~15 s of 100
  const loaded = phase('loaded', 45);
  const running = phase('running', 10);
  const r = running.length ? running : [];
  const cpu = r.length > 1 ? ((r[r.length - 1].ticks - r[0].ticks) / (r[r.length - 1].t - r[0].t)) : null;
  const pick = (rs, k) => med(rs.map((x) => x[k]));
  const out = {
    idle: pick(idle, 'total'), idleShell: pick(idle, 'shell'), idleSidecar: pick(idle, 'sidecar'),
    loaded: pick(loaded, 'total'), loadedSidecar: pick(loaded, 'sidecar'),
    running: pick(running, 'total'), runningShell: pick(running, 'shell'), runningSidecar: pick(running, 'sidecar'),
    peak: rows.length ? Math.max(...rows.filter((x) => x.phase !== 'restart').map((x) => x.total)) : null,
    procs: pick(running.length ? running : idle, 'procs'),
    cpu,
  };
  (runs[variant] = runs[variant] || []).push(out);
}
const summary = {};
for (const [v, list] of Object.entries(runs)) {
  summary[v] = { runs: list.length };
  for (const k of Object.keys(list[0])) summary[v][k] = med(list.map((x) => x[k]).filter((x) => x != null));
}
console.log(JSON.stringify({ summary, runs }, null, 1));

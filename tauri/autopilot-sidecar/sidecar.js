// Voice Autopilot as a Node sidecar: what a Tauri build would have to run next to the webview,
// since the WebView has no Node and onnxruntime-node / Realm are native Node addons.
//
// It runs the app's own compiled engine (www/js/addons/voice-follow/engine) unchanged:
//   start    → the retrieval index in a child process (as Electron's utility process does)
//   SIGUSR1  → load the speech model (engine.ready: ONNX session + pace self-test) and YAMNet
//   SIGUSR2  → play the test WAV in real time: recognizer on every chunk, retrieval searches on
//              what it hears, the Japji paath follower after 15 s, speech/music every 2 s
// Prints one line per milestone (INDEX_READY, MODEL_READY, RUNNING, STATS) for the harness.
// Not a port of VoiceFollow.jsx's orchestration (switching, slides, logging): it drives the
// same models and index the same way, which is where the memory goes.
//
//   node sidecar.js <userData with the Realm DB> <test.wav>
// The model is read from $TMPDIR/sttm/voice-follow (model-manager's non-Electron path).
const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');

const ENGINE = path.join(__dirname, '..', '..', 'www', 'js', 'addons', 'voice-follow', 'engine');
const engine = require(ENGINE);
const { RetrievalClient } = require(path.join(ENGINE, 'retrieval', 'client'));
const { createUtilityWorker } = require(path.join(ENGINE, 'retrieval', 'utility-worker'));
const NITNEM = require(path.join(ENGINE, 'assets', 'nitnem-lines'));

const [userData, wavFile] = process.argv.slice(2);
const SR = 16000;
const CHUNK = 4096; // 256 ms, about what the app's AudioWorklet batches
const t0 = Date.now();
const say = (what, extra = {}) =>
  console.log(JSON.stringify({ at: Date.now() - t0, what, ...extra }));

// Electron's utility process gets messages as { data } on process.parentPort; a forked Node
// child gets them on process.on('message'). The child shim maps one onto the other; on this
// side, a ChildProcess sends with send() where a UtilityProcess has postMessage().
const forkChild = (file, args) => {
  const child = fork(path.join(__dirname, 'retrieval-child.js'), [file, ...args], {
    stdio: 'inherit',
  });
  child.postMessage = (message) => child.send(message);
  return child;
};
const retrieval = new RetrievalClient(userData, {
  workerFactory: (file, opts) => createUtilityWorker(file, opts, { fork: forkChild }),
  startupTimeoutMs: 120000,
});
retrieval.ready.then(
  (r) => say('INDEX_READY', { rows: r && r.rows }),
  (e) => say('INDEX_FAILED', { error: e.message }),
);

let modelP = null;
const loadModel = () => {
  if (modelP) return modelP;
  const t = Date.now();
  modelP = engine.ready().then(() => {
    say('MODEL_READY', { loadMs: Date.now() - t, tier: engine.pace.current().name });
  });
  modelP.catch((e) => say('MODEL_FAILED', { error: e.message }));
  return modelP;
};

// 16-bit mono PCM WAV → Float32Array (the test file is written that way by ffmpeg).
const readWav = (file) => {
  const buf = fs.readFileSync(file);
  const data = buf.indexOf('data', 12);
  const n = buf.readUInt32LE(data + 4) / 2;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) out[i] = buf.readInt16LE(data + 8 + i * 2) / 32768;
  return out;
};

const run = async () => {
  await loadModel();
  const pcm = readWav(wavFile);
  const rec = await engine.createRecognizer({ inputSr: SR });
  let follower = null;
  const japji = NITNEM['2'].map((text, i) => ({ verseId: i, text, words: text.split(/\s+/) }));
  let pos = 0;
  let searches = 0;
  let heard = 0;
  let smBuf = [];
  let smLen = 0;
  let lastLine = null;
  const start = Date.now();
  say('RUNNING');
  const stats = setInterval(() => say('STATS', { perf: engine.perfStats(), searches, heard, lastLine }), 10000);
  while (pos < pcm.length) {
    // Real time: wait until this chunk would have arrived from a microphone.
    const due = start + (pos / SR) * 1000;
    if (Date.now() < due) await new Promise((r) => setTimeout(r, due - Date.now()));
    const chunk = pcm.subarray(pos, pos + CHUNK);
    pos += CHUNK;
    const r = await rec.push(chunk);
    if (r) {
      heard += 1;
      retrieval.search(r.text, 20).then(() => { searches += 1; }, () => {});
    }
    if (!follower && pos / SR > 15) follower = await engine.createPaathFollower(japji, { inputSr: SR, baniId: 2 });
    if (follower) {
      const out = await follower.push(chunk);
      if (out && typeof out.lineIndex === 'number') lastLine = out.lineIndex;
      // As the app does: YAMNet loads on the first audio while following, then classifies
      // every 2 s of audio.
      if (!engine.speechMusic.loaded()) engine.speechMusic.ensure();
      else smBuf.push(chunk);
      smLen = smBuf.length * CHUNK;
      if (smLen >= SR * 2) {
        const b = new Float32Array(smLen);
        let o = 0;
        smBuf.forEach((c) => { b.set(c, o); o += c.length; });
        smBuf = [];
        smLen = 0;
        engine.speechMusic.classify(b, SR).catch(() => {});
      }
    }
  }
  clearInterval(stats);
  say('DONE');
};

process.on('SIGUSR1', () => loadModel());
process.on('SIGUSR2', () => run().catch((e) => say('RUN_FAILED', { error: e.stack })));
say('STARTED');

//! Voice Autopilot's heavy parts in Rust, headless: the speech model and YAMNet through `ort`, and
//! the shabad search index (index.rs). What would run inside the Tauri process instead of a Node
//! sidecar; the recognizer/follower logic around the model passes is not ported (it stays JS).
//!
//!   autopilot-rs run <banidb.sqlite> <model dir> <test.wav>
//!       builds the index (INDEX_READY), SIGUSR1 loads the model (MODEL_READY), SIGUSR2 plays the
//!       WAV in real time with the app's fast-tier schedule: a 10 s recognizer pass every 0.5 s
//!       (decoded and searched), from 15 s a 4 s follower pass every 0.25 s, YAMNet every 2 s.
//!   autopilot-rs decode <model dir> <test.wav> <start s> <seconds>   one pass, for parity with JS
//!   autopilot-rs search <banidb.sqlite> <queries.txt>                top 10 per line, for parity
//! ONNX Runtime comes from ORT_DYLIB_PATH (onnxruntime-node's libonnxruntime.so.1).
mod index;

use std::error::Error;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

use ort::environment::Environment;
use ort::session::Session;
use ort::value::Tensor;

type R<T> = Result<T, Box<dyn Error>>;
const SR: usize = 16000;
const BLANK: usize = 256;

fn vocab() -> Vec<&'static str> {
    include_str!("../assets/vocab.txt").lines().collect()
}

fn read_wav(path: &str) -> R<Vec<f32>> {
    let b = std::fs::read(path)?;
    let at = b.windows(4).skip(12).position(|w| w == b"data").ok_or("no data chunk")? + 12;
    let n = u32::from_le_bytes(b[at + 4..at + 8].try_into()?) as usize / 2;
    Ok((0..n).map(|i| i16::from_le_bytes([b[at + 8 + 2 * i], b[at + 9 + 2 * i]]) as f32 / 32768.0).collect())
}

fn load_index(db: &str) -> R<index::TextIndex> {
    let conn = rusqlite::Connection::open_with_flags(db, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY)?;
    let mut st = conn.prepare(
        "SELECT v.ID, (SELECT MIN(s.ShabadID) FROM Shabad s WHERE s.VerseID = v.ID) AS sid, v.GurmukhiUni
         FROM Verse v WHERE sid IS NOT NULL AND v.GurmukhiUni IS NOT NULL AND v.GurmukhiUni <> '' ORDER BY v.ID",
    )?;
    let rows: Vec<(u32, u32, String)> =
        st.query_map([], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))?.collect::<Result<_, _>>()?;
    Ok(index::TextIndex::new(rows.into_iter()))
}

/// The CTC model, as infer.js sets it up: 4 intra-op threads, 1 inter-op, no spinning.
fn ctc_session(env: &Environment, dir: &str) -> R<Session> {
    Ok(Session::builder(env)?
        .with_intra_threads(4)?
        .with_inter_threads(1)?
        .with_config_entry("session.intra_op.allow_spinning", "0")?
        .commit_from_file(format!("{dir}/model.int8.onnx"))?)
}

/// One model pass: log-probs (frames x C).
fn emissions(s: &mut Session, buf: &[f32]) -> R<(Vec<f32>, usize, usize)> {
    let n = buf.len();
    let audio = Tensor::from_array(([1usize, n], buf.to_vec()))?;
    let len = Tensor::from_array(([1usize], vec![n as i64]))?;
    let out = s.run(ort::inputs!["audio" => audio, "audio_len" => len])?;
    let (shape, lp) = out["log_probs"].try_extract_tensor::<f32>()?;
    let (_, ol) = out["out_len"].try_extract_tensor::<i64>()?;
    let c = shape[2] as usize;
    let frames = ol[0] as usize;
    Ok((lp[..frames * c].to_vec(), frames, c))
}

fn greedy_decode(lp: &[f32], frames: usize, c: usize, vocab: &[&str]) -> String {
    let mut out = String::new();
    let mut prev = usize::MAX;
    for t in 0..frames {
        let row = &lp[t * c..(t + 1) * c];
        let best = (0..c).fold(0, |b, i| if row[i] > row[b] { i } else { b });
        if best != prev && best != BLANK {
            out.push_str(vocab[best]);
        }
        prev = best;
    }
    out.replace('▁', " ").trim().to_string()
}

fn say(t0: Instant, what: &str, extra: &str) {
    println!("{{\"at\":{},\"what\":\"{}\"{}}}", t0.elapsed().as_millis(), what, extra);
}

fn median(v: &mut [u128]) -> u128 {
    v.sort_unstable();
    if v.is_empty() { 0 } else { v[v.len() / 2] }
}

/// ONNX Runtime from ORT_DYLIB_PATH.
fn environment() -> R<Environment> {
    let path = std::env::var("ORT_DYLIB_PATH").map_err(|_| "set ORT_DYLIB_PATH")?;
    Ok(ort::init_from(path)?.build()?)
}

fn run(env: &Environment, db: &str, dir: &str, wav: &str) -> R<()> {
    let t0 = Instant::now();
    let load_model = Arc::new(AtomicBool::new(false));
    let start = Arc::new(AtomicBool::new(false));
    signal_hook::flag::register(signal_hook::consts::SIGUSR1, load_model.clone())?;
    signal_hook::flag::register(signal_hook::consts::SIGUSR2, start.clone())?;
    say(t0, "STARTED", "");
    let index = load_index(db)?;
    say(t0, "INDEX_READY", &format!(",\"rows\":{}", index.len()));
    while !load_model.load(Ordering::Relaxed) && !start.load(Ordering::Relaxed) {
        std::thread::sleep(Duration::from_millis(100));
    }
    let t = Instant::now();
    let mut ctc = ctc_session(env, dir)?;
    // pace.selfTest's few warm-up passes.
    for _ in 0..4 {
        emissions(&mut ctc, &vec![0.0; 4 * SR])?;
    }
    say(t0, "MODEL_READY", &format!(",\"loadMs\":{}", t.elapsed().as_millis()));
    while !start.load(Ordering::Relaxed) {
        std::thread::sleep(Duration::from_millis(100));
    }
    let pcm = read_wav(wav)?;
    let vocab = vocab();
    let mut yamnet: Option<Session> = None;
    let (mut last_rec, mut last_fol, mut last_sm) = (0usize, 0usize, 0usize);
    let (mut ms, mut searches, mut heard) = (Vec::new(), 0, 0);
    let mut last_text = String::new();
    let mut last_stats = Instant::now();
    let begin = Instant::now();
    say(t0, "RUNNING", "");
    let chunk = 4096;
    let mut pos = 0;
    while pos < pcm.len() {
        let due = Duration::from_secs_f64(pos as f64 / SR as f64);
        if let Some(wait) = due.checked_sub(begin.elapsed()) {
            std::thread::sleep(wait);
        }
        pos = (pos + chunk).min(pcm.len());
        // Recognizer: the last 10 s, every 0.5 s; what it hears goes to the index.
        if pos - last_rec >= SR / 2 && pos >= SR {
            last_rec = pos;
            let p = Instant::now();
            let (lp, frames, c) = emissions(&mut ctc, &pcm[pos.saturating_sub(10 * SR)..pos])?;
            ms.push(p.elapsed().as_millis());
            let text = greedy_decode(&lp, frames, c, &vocab);
            if text.chars().filter(|ch| !ch.is_whitespace()).count() >= 2 {
                heard += 1;
                let hits = index.search(&text, 20);
                searches += 1;
                if let Some(h) = hits.first() {
                    last_text = format!("{} -> shabad {} ({:.2})", text, h.shabad_id, h.score);
                }
            }
        }
        if pos > 15 * SR {
            // Follower: the last 4 s, every 0.25 s.
            if pos - last_fol >= SR / 4 {
                last_fol = pos;
                let p = Instant::now();
                emissions(&mut ctc, &pcm[pos - 4 * SR..pos])?;
                ms.push(p.elapsed().as_millis());
            }
            // YAMNet: loaded on the first audio while following, then every 2 s.
            if yamnet.is_none() {
                yamnet = Some(
                    Session::builder(env)?.with_intra_threads(1)?.with_inter_threads(1)?.commit_from_file(format!("{dir}/yamnet.onnx"))?,
                );
                last_sm = pos;
            } else if pos - last_sm >= 2 * SR {
                last_sm = pos;
                let y = yamnet.as_mut().unwrap();
                let name = y.inputs()[0].name().to_string();
                let input = Tensor::from_array(([2 * SR], pcm[pos - 2 * SR..pos].to_vec()))?;
                y.run(ort::inputs![name => input])?;
            }
        }
        if last_stats.elapsed() >= Duration::from_secs(10) {
            let windows = ms.len();
            let med = median(&mut ms);
            say(t0, "STATS", &format!(",\"windows\":{},\"medianMs\":{},\"searches\":{},\"heard\":{},\"last\":{:?}", windows, med, searches, heard, last_text));
            ms.clear();
            last_stats = Instant::now();
        }
    }
    say(t0, "DONE", "");
    Ok(())
}

fn main() -> R<()> {
    let a: Vec<String> = std::env::args().collect();
    match a.get(1).map(String::as_str) {
        Some("run") => run(&environment()?, &a[2], &a[3], &a[4]),
        Some("decode") => {
            let pcm = read_wav(&a[3])?;
            let (s, n) = ((a[4].parse::<f64>()? * SR as f64) as usize, (a[5].parse::<f64>()? * SR as f64) as usize);
            let env = environment()?;
            let mut ctc = ctc_session(&env, &a[2])?;
            let (lp, frames, c) = emissions(&mut ctc, &pcm[s..s + n])?;
            let sum: f64 = lp.iter().map(|v| *v as f64).sum();
            println!("{}\t{}\t{}\t{:.4}\t{}", frames, c, lp.len(), sum, greedy_decode(&lp, frames, c, &vocab()));
            Ok(())
        }
        Some("search") => {
            let index = load_index(&a[2])?;
            for q in std::fs::read_to_string(&a[3])?.lines() {
                let hits: Vec<String> = index.search(q, 10).iter().map(|h| format!("{}:{:.6}", h.shabad_id, h.score)).collect();
                println!("{}", hits.join(" "));
            }
            Ok(())
        }
        _ => Err("usage: autopilot-rs run|decode|search ...".into()),
    }
}

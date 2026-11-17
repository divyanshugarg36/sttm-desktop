//! The shabad search index of www/main/addons/voice-follow/engine/retrieval/text-index.js, in Rust.
//! Same scoring, same two indexes (as written, and heard-lenient by units), but stored as sorted
//! flat arrays instead of a Map of JS arrays and objects. The pangti text is only read while the
//! index is built; results are ids and scores, as in JS.
use std::collections::HashMap;

/// Spaces, dandas, numbers and punctuation: skipped while comparing (compared.js IGNORED).
fn ignored(c: char) -> bool {
    c.is_whitespace()
        || matches!(c, '।' | '॥' | '|' | '0'..='9' | '੦'..='੯' | '.' | ',' | ';' | ':' | '!' | '?' | '-')
}

/// The compared characters of a text (compared.js Compared).
fn compared(text: &str) -> Vec<u32> {
    text.chars().filter(|c| !ignored(*c)).map(|c| c as u32).collect()
}

/// Bit of a mark: U+0A3C-0A4D, U+0A51, U+0A70, U+0A71, U+0A75 (text-index.js MARK_BIT).
fn mark_bit(cp: u32) -> u32 {
    match cp {
        0x0a3c..=0x0a4d => 1 << (cp - 0x0a3c),
        0x0a51 => 1 << 18,
        0x0a70 => 1 << 19,
        0x0a71 => 1 << 20,
        0x0a75 => 1 << 21,
        _ => 0,
    }
}
const NUKTA_BIT: u32 = 1;
/// ਲ਼ ਸ਼ ਖ਼ ਗ਼ ਜ਼ ਫ਼: compared as their letter with a nukta (NFD of the one code point).
fn nukta_letter(cp: u32) -> Option<u32> {
    match cp {
        0x0a33 => Some(0x0a32),
        0x0a36 => Some(0x0a38),
        0x0a59 => Some(0x0a16),
        0x0a5a => Some(0x0a17),
        0x0a5b => Some(0x0a1c),
        0x0a5e => Some(0x0a2b),
        _ => None,
    }
}

/// Letters and the marks written on each (text-index.js units).
fn units(text: &str) -> (Vec<u32>, Vec<u32>) {
    let (mut l, mut m) = (Vec::new(), Vec::new());
    for cp in compared(text) {
        let bit = mark_bit(cp);
        if bit != 0 {
            if let Some(last) = m.last_mut() {
                *last |= bit;
            }
        } else if let Some(letter) = nukta_letter(cp) {
            l.push(letter);
            m.push(NUKTA_BIT);
        } else {
            l.push(cp);
            m.push(0);
        }
    }
    (l, m)
}

/// Three code points as one key (each fits in 21 bits).
fn key(a: u32, b: u32, c: u32) -> u64 {
    ((a as u64) << 42) | ((b as u64) << 21) | c as u64
}

fn grams(v: &[u32]) -> Vec<u64> {
    let mut g: Vec<u64> = v.windows(3).map(|w| key(w[0], w[1], w[2])).collect();
    g.sort_unstable();
    g.dedup();
    g
}

/// Sorted keys with the start of each key's postings (CSR).
struct Postings<T> {
    keys: Vec<u64>,
    start: Vec<u32>,
    items: Vec<T>,
}

impl<T: Copy> Postings<T> {
    fn from_pairs(mut pairs: Vec<(u64, T)>) -> Self
    where
        T: Ord,
    {
        pairs.sort_unstable();
        let (mut keys, mut start, mut items) = (Vec::new(), Vec::new(), Vec::with_capacity(pairs.len()));
        for (k, item) in pairs {
            if keys.last() != Some(&k) {
                keys.push(k);
                start.push(items.len() as u32);
            }
            items.push(item);
        }
        start.push(items.len() as u32);
        keys.shrink_to_fit();
        start.shrink_to_fit();
        Postings { keys, start, items }
    }
    fn get(&self, k: u64) -> &[T] {
        match self.keys.binary_search(&k) {
            Ok(i) => &self.items[self.start[i] as usize..self.start[i + 1] as usize],
            Err(_) => &[],
        }
    }
}

pub struct TextIndex {
    verse: Vec<u32>,
    shabad: Vec<u32>,
    exact: Postings<u32>,
    /// (row, marks of the three units), sorted by row within a key.
    lenient: Postings<(u32, u32, u32, u32)>,
    /// Distinct rows per lenient key, parallel to lenient.keys.
    lenient_rows: Vec<u32>,
}

#[derive(Debug, Clone)]
pub struct Hit {
    pub shabad_id: u32,
    pub verse_id: u32,
    pub score: f64,
}

impl TextIndex {
    /// rows: (verseId, shabadId, Unicode text), ordered by verse id like read-corpus.js.
    pub fn new(rows: impl Iterator<Item = (u32, u32, String)>) -> Self {
        let (mut verse, mut shabad) = (Vec::new(), Vec::new());
        let mut exact = Vec::new();
        let mut lenient = Vec::new();
        for (i, (v, s, text)) in rows.enumerate() {
            let i = i as u32;
            verse.push(v);
            shabad.push(s);
            for g in grams(&compared(&text)) {
                exact.push((g, i));
            }
            let (l, m) = units(&text);
            let mut seen = Vec::new();
            for k in 0..l.len().saturating_sub(2) {
                let sig = (key(l[k], l[k + 1], l[k + 2]), m[k], m[k + 1], m[k + 2]);
                if seen.contains(&sig) {
                    continue;
                }
                seen.push(sig);
                lenient.push((sig.0, (i, m[k], m[k + 1], m[k + 2])));
            }
        }
        verse.shrink_to_fit();
        shabad.shrink_to_fit();
        let exact = Postings::from_pairs(exact);
        let lenient = Postings::from_pairs(lenient);
        let lenient_rows = (0..lenient.keys.len())
            .map(|i| {
                let items = &lenient.items[lenient.start[i] as usize..lenient.start[i + 1] as usize];
                let mut n = 0;
                let mut prev = u32::MAX;
                for it in items {
                    if it.0 != prev {
                        n += 1;
                        prev = it.0;
                    }
                }
                n
            })
            .collect();
        TextIndex { verse, shabad, exact, lenient, lenient_rows }
    }

    pub fn len(&self) -> usize {
        self.verse.len()
    }

    fn idf(&self, n: usize) -> f64 {
        (1.0 + self.verse.len() as f64 / (1.0 + n as f64)).ln()
    }

    fn merge(&self, scores: HashMap<u32, f64>, weight: f64, merged: &mut HashMap<u32, Hit>) {
        for (row, score) in scores {
            let compared = score / weight;
            let s = self.shabad[row as usize];
            let better = merged.get(&s).map_or(true, |h| compared > h.score);
            if better {
                merged.insert(s, Hit { shabad_id: s, verse_id: self.verse[row as usize], score: compared });
            }
        }
    }

    fn search_exact(&self, text: &str, merged: &mut HashMap<u32, Hit>) {
        let query = grams(&compared(text));
        if query.len() < 2 {
            return;
        }
        let mut scores = HashMap::new();
        let mut weight = 0.0;
        for g in query {
            let ids = self.exact.get(g);
            let idf = self.idf(ids.len());
            weight += idf;
            for id in ids {
                *scores.entry(*id).or_insert(0.0) += idf;
            }
        }
        self.merge(scores, weight, merged);
    }

    fn search_lenient(&self, text: &str, merged: &mut HashMap<u32, Hit>) {
        let (l, m) = units(text);
        // Each run of three heard letters counts once. The marks the model heard don't change
        // the score: JS weighs a disagreement by HEARD_MARK_DOUBT, which ships as 1.
        let _ = m;
        let mut query: Vec<u64> = Vec::new();
        for k in 0..l.len().saturating_sub(2) {
            let kk = key(l[k], l[k + 1], l[k + 2]);
            if !query.contains(&kk) {
                query.push(kk);
            }
        }
        if query.len() < 2 {
            return;
        }
        let mut scores = HashMap::new();
        let mut weight = 0.0;
        for kk in query {
            let rows = match self.lenient.keys.binary_search(&kk) {
                Ok(i) => self.lenient_rows[i] as usize,
                Err(_) => 0,
            };
            let idf = self.idf(rows);
            weight += idf;
            let mut hit_row = u32::MAX;
            for &(row, ..) in self.lenient.get(kk) {
                if row != hit_row {
                    hit_row = row;
                    *scores.entry(row).or_insert(0.0) += idf;
                }
            }
        }
        self.merge(scores, weight, merged);
    }

    pub fn search(&self, text: &str, cap: usize) -> Vec<Hit> {
        let mut merged = HashMap::new();
        self.search_exact(text, &mut merged);
        self.search_lenient(text, &mut merged);
        let mut out: Vec<Hit> = merged.into_values().collect();
        out.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap().then(a.shabad_id.cmp(&b.shabad_id)));
        out.truncate(cap);
        out
    }
}

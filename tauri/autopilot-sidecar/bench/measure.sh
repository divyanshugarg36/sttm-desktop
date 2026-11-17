#!/bin/bash
# measure.sh <e-master|e-exp|t-current|t-prod> <run>
# Samples PSS every 2 s into results/<variant>-<run>.tsv: seconds, phase, shell MB, sidecar MB,
# processes, CPU ticks. Phases: idle (index only, no model), loaded, running (60 s of Japji).
S=/tmp/claude-1000/-home-divyanshu-Development-sttm-web-group/49885ae1-8391-4969-9648-f38ffdd7db70/scratchpad/autopilot
T=/tmp/claude-1000/-home-divyanshu-Development-sttm-web-group/49885ae1-8391-4969-9648-f38ffdd7db70/scratchpad/tauri
W=/home/divyanshu/Development/sttm-web-group/.wt-old-autopilot-tauri
M=/home/divyanshu/Development/sttm-web-group/.wt-desktop-master
V=$1; R=$2; OUT=$S/results/$V-$R.tsv; LOG=$S/results/$V-$R.log
mkdir -p $S/results $S/eval; : > $OUT; : > $LOG
WAV=$S/audio/japji-5min.wav
export DISPLAY=:97
$S/bin/xstart.sh
echo none > $S/phase; SHELL_PID=; SC_PID=; T0=$(date +%s)

sampler() {
  while :; do
    sh=$($S/bin/mem.sh $(cat $S/shell.pid 2>/dev/null) 2>/dev/null); sc="0 0 0"
    [ -s $S/sc.pid ] && sc=$($S/bin/mem.sh $(cat $S/sc.pid) 2>/dev/null)
    read a b c <<<"$sh"; read d e f <<<"$sc"
    printf '%s\t%s\t%s\t%s\t%s\t%s\n' $(( $(date +%s) - T0 )) "$(cat $S/phase)" "$a" "$d" $((b + e)) $((c + f)) >> $OUT
    sleep 2
  done
}

electron() { # electron <app dir> <user data> [VF_TEST_WAV]
  (cd $1; env -u WAYLAND_DISPLAY NODE_ENV=development LIBGL_ALWAYS_SOFTWARE=1 VF_TEST_WAV=$3 \
    ./node_modules/electron/dist/electron . --no-sandbox --remote-debugging-port=9335 --user-data-dir=$2 >>$LOG 2>&1 & echo $! > $S/shell.pid)
}
cdp() { node $S/bin/cdp.mjs 9335 index.html "$1" 2>&1; }
tree() { echo $1; for c in $(pgrep -P $1); do tree $c; done; }
killtree() { # TERM the whole tree, wait for it to go, KILL what is left
  local pids=$(tree $1); kill $pids 2>/dev/null
  for i in $(seq 20); do sleep 0.5; kill -0 $pids 2>/dev/null || return 0; done
  echo "killtree: KILL after 10 s ($1)" >> $LOG; kill -9 $pids 2>/dev/null; sleep 1
}
detail() { echo "== $1"; for root in $(cat $S/shell.pid) $(cat $S/sc.pid); do for p in $(tree $root); do
  printf '%7s kB  %s\n' "$(awk '/^Pss:/ {print $2}' /proc/$p/smaps_rollup 2>/dev/null)" "$(tr '\0' ' ' < /proc/$p/cmdline | grep -oE -- '--type=[a-z-]+|--utility-sub-type=[a-zA-Z.]+|sidecar.js|retrieval-child.js|WebKit[A-Za-z]+|tauri-[a-z]+$|^[^ ]*electron ' | tr '\n' ' ')"
done; done; } >> $LOG
stop_all() {
  kill $(cat $S/sampler.pid) 2>/dev/null
  [ -s $S/sc.pid ] && killtree $(cat $S/sc.pid)
  [ -s $S/shell.pid ] && killtree $(cat $S/shell.pid)
  rm -f $S/sc.pid $S/shell.pid
}

: > $S/sc.pid; : > $S/shell.pid
sampler & echo $! > $S/sampler.pid

case $V in
e-master)
  $S/bin/profile.sh $S/ud-$V 0
  electron $M $S/ud-$V; echo idle > $S/phase; sleep 100; detail idle ;;
e-exp)
  # Launch 1: the model not on disk (Autopilot never used): only the retrieval index warms.
  $S/bin/profile.sh $S/ud-$V 0
  electron $W $S/ud-$V; echo idle > $S/phase; sleep 100
  detail idle; echo restart > $S/phase; killtree $(cat $S/shell.pid); sleep 2
  # Launch 2: model on disk, so it warms by itself; then Start with the test WAV as the mic.
  $S/bin/profile.sh $S/ud-$V 1; ln $S/yamnet.onnx $S/ud-$V/voice-follow/yamnet.onnx
  electron $W $S/ud-$V $WAV; echo warming > $S/phase; t=$(date +%s)
  for i in $(seq 75); do sleep 2; cdp "require('$W/www/js/addons/voice-follow/engine').isLoaded()" | grep -q '^true$' && break; done
  echo "model loaded after $(( $(date +%s) - t )) s from launch" >> $LOG
  echo loaded > $S/phase; sleep 60; detail loaded
  cdp "(() => { const b = document.querySelector('.vf-intro-start'); if (b) b.click(); return !!b })()" >> $LOG; sleep 2
  cdp "(() => { document.querySelector('.vf-ap-mic').click(); return 1 })()" >> $LOG
  echo running > $S/phase; sleep 62; detail running
  cdp "require('$W/www/js/addons/voice-follow/engine').perfStats()" >> $LOG
  cdp "(() => ({ following: !!document.querySelector('.vf2-stop'), line: (document.querySelector('[class*=vf-ap]') || {}).innerText }))()" >> $LOG
  grep -h "vf model warm\|retrieval index ready" $S/ud-$V/voice-follow/shadow/errors.log >> $LOG ;;
t-current|t-prod)
  rm -rf $S/t-ud-$V; $S/bin/profile.sh $S/ud-$V 0
  (env -u WAYLAND_DISPLAY GDK_BACKEND=x11 WEBKIT_DISABLE_DMABUF_RENDERER=1 LIBGL_ALWAYS_SOFTWARE=1 NODE_ENV=development \
    STTM_BANIDB_SQLITE=$S/base/banidb.sqlite STTM_TAURI_USER_DATA=$S/t-ud-$V STTM_TAURI_EVAL_DIR=$S/eval \
    $T/bench/tauri-${V#t-} >>$LOG 2>&1 & echo $! > $S/shell.pid)
  (cd $W; TMPDIR=$S/sc-tmp node tauri/autopilot-sidecar/sidecar.js $S/ud-$V $WAV > $S/results/$V-$R.sidecar.log 2>&1 & echo $! > $S/sc.pid)
  echo idle > $S/phase; sleep 100; detail idle
  kill -USR1 $(cat $S/sc.pid); echo warming > $S/phase
  for i in $(seq 60); do sleep 1; grep -q MODEL_READY $S/results/$V-$R.sidecar.log && break; done
  echo loaded > $S/phase; sleep 60; detail loaded
  # The shell shows a Shabad while Autopilot runs, as the Electron app does.
  F=$(sed 's/^})()$/})().then(v => console.log("FLOW DONE", v), e => console.log("FLOW FAIL", String(e)))/' $T/flow.js)
  N=$(date +%s%N); printf '%s' "$F" > $S/eval/$N.main.tmp && mv $S/eval/$N.main.tmp $S/eval/$N.main.js
  kill -USR2 $(cat $S/sc.pid); echo running > $S/phase; sleep 62; detail running
  grep -oE "FLOW (DONE|FAIL).{0,40}" $LOG | tail -1 >> $LOG ;;
esac
stop_all
kill $(cat $S/wm.pid) $(cat $S/xvfb.pid) 2>/dev/null; sleep 1
rm -rf $S/ud-$V $S/t-ud-$V
echo "done $V $R"

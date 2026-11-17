#!/bin/bash
# mem.sh <pid>... → "PSS_MB NPROCS CPU_TICKS" summed over the processes and all descendants
tree() { echo $1; for c in $(pgrep -P $1); do tree $c; done; }
total=0; n=0; ticks=0
for root in "$@"; do for p in $(tree $root); do
  pss=$(awk '/^Pss:/ {print $2}' /proc/$p/smaps_rollup 2>/dev/null); [ -z "$pss" ] && continue
  t=$(awk '{print $14+$15}' /proc/$p/stat 2>/dev/null)
  total=$((total + pss)); n=$((n + 1)); ticks=$((ticks + ${t:-0}))
done; done
echo "$((total / 1024)) $n $ticks"

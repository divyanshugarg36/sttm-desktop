#!/bin/bash
S=/tmp/claude-1000/-home-divyanshu-Development-sttm-web-group/49885ae1-8391-4969-9648-f38ffdd7db70/scratchpad
export DISPLAY=:97
Xvfb :97 -screen 0 1280x720x24 -nolisten tcp -noreset >$S/autopilot/xvfb.log 2>&1 & echo $! > $S/autopilot/xvfb.pid
for i in $(seq 30); do xrandr >/dev/null 2>&1 && break; sleep 0.3; done
DISPLAY=:97 $S/tauri/wm/root/usr/bin/jwm -f $S/tauri/wm/jwmrc >$S/autopilot/wm.log 2>&1 & echo $! > $S/autopilot/wm.pid

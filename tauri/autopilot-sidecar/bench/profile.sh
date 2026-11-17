#!/bin/bash
# profile.sh <dir> <with-model:0|1>  → fresh user-data dir: Realm DB, changelog seen, optional model
S=/tmp/claude-1000/-home-divyanshu-Development-sttm-web-group/49885ae1-8391-4969-9648-f38ffdd7db70/scratchpad/autopilot
W=/home/divyanshu/Development/sttm-web-group/.wt-old-autopilot-tauri
D=$1; rm -rf "$D"; mkdir -p "$D"
cp $S/base/sttmdesktop-evergreen-v2.realm $S/base/realm-schema-evergreen.json "$D/"
: > "$D/ai-translations-d4c481e4aa9b2285bb0852d9c4a8609b.db"
V=$(node -p "require('$W/package.json').version")
cat > "$D/user-preferences.json" <<J
{"changelog-seen":"$V","changelog-seen-count":99,"curDBHash":"MD5 (sttmdesktop-evergreen-v2.realm) = 213b800c822b1557c268fcdfecc2d4c3\n","aiTranslationsFile":"ai-translations-d4c481e4aa9b2285bb0852d9c4a8609b.db","aiTranslationsHash":"MD5 (ai-translations.db) = d4c481e4aa9b2285bb0852d9c4a8609b\n","userPrefs":{}}
J
if [ "$2" = 1 ]; then mkdir -p "$D/voice-follow"; ln $S/model.int8.onnx "$D/voice-follow/model.int8.onnx"; fi

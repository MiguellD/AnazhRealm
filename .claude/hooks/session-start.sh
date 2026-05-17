#!/bin/bash
# SessionStart-Hook fuer Claude Code on the web.
#
# Web-Sessions klonen das Repo frisch in einen ephemeren Container -- ohne
# diesen Hook fehlt node_modules, und lint / format:check / audit:strict /
# playtest sind erst nach manuellem `npm install` lauffaehig.
#
# Der Hook installiert die npm-devDependencies (eslint, prettier, puppeteer
# inkl. Chromium). Die Vendor-Libs (Three.js, Ammo.js) liegen in vendor/ und
# sind im Repo eingecheckt -- dafuer ist kein Install noetig.
set -euo pipefail

# Nur in der Remote-/Web-Umgebung laufen. Lokal hat der Entwickler
# node_modules bereits, ein erneuter Install waere unnoetig.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
    exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

echo "[session-start] npm install ..."
npm install
echo "[session-start] Dependencies bereit -- lint / format:check / audit:strict / playtest sind lauffaehig."

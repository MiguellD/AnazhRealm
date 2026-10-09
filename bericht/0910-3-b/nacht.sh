#!/bin/bash
# 0910-3 B: das echte Dunkel. Ein Boot: ./nacht.sh <name> <worktree> <seite-port>
# Mittag (Bühne, feste Phase) himmel · nord · wald · wald-tief; dann 02:00 OHNE Bühne (Uhr gehalten, 120 Spiel-Takte, dann Uhren fest,
# Phase 0) n-nord · n-himmel · n-wald · n-wald-tief · n-ufer. Instrument: welle-m-host-vram-2.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/hv2
INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-host-vram-2
N=$1; WT=$2; SEITE=$3; export WERKBANK_PORT=7904
W="node $INS/scripts/werkbank.cjs"
D=$H/daten; mkdir -p $D $H/nacht/$N
O=$(cd $H/nacht/$N && pwd -W)
say() { echo "$(date +%T) $N $*" | tee -a $H/nacht.log; }
stopp() {
  $W stop > /dev/null 2>&1; sleep 3
  powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -ge 7900 -and \$_.LocalPort -le 7909 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil-790' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  sleep 2
}
stopp
(cd $WT && PORT=$SEITE node save-server.js > $D/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:$SEITE/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INS && node scripts/werkbank.cjs start --echt --port $WERKBANK_PORT --seite http://localhost:$SEITE > $D/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
say "bereit $(cd $WT && git log --oneline -1 | cut -c1-8)"
$W eval "window.__gf = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gf.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > /dev/null
# MITTAG: die Bühne, feste Phase und Uhren (wie boot.sh)
$W eval "r._loopSkyboxZeit = function () { if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) this.state.skyboxUniforms.time.value = 1000; }; r._loopSkyboxZeit(); window.__jitterStart = 0; const A0 = window.__ausgabeAufnahme; window.__ausgabeAufnahme = function (...a) { if (r.state.traaNode) r.state.traaNode._jitterIndex = window.__jitterStart; return A0.apply(this, a); }; for (const c of r.state.creatures || []) c.visible = false; const P = Object.getPrototypeOf(r); r._loopRender = function () { return P._loopRender.call(this, 1000); }; const nf = r.state.renderer._nodes.nodeFrame; nf.update = function () { this.frameId++; this.deltaTime = 0; this.time = 1000; }; return 1" > /dev/null
b() { $W bild $2 --w 1920 --h 1080 --datei "$O/$1.png" | tr -d '\n' | sed 's/  */ /g' | grep -o '"hell": [0-9.]*' | sed "s/^/$1 /"; }
{
  b himmel    "-900 +1.7 -850 -900 +40 -880"
  b nord      "-900 +1.7 -850 -900 +0 -880"
  b wald      "-915 +1.7 -838 -930 +3 -860"
  b wald-tief "-945 +1.7 -895 -955 +2 -905"
} > $D/$N-mittag.txt 2>&1
say "mittag $(tr '\n' ' ' < $D/$N-mittag.txt)"
# 02:00 OHNE Bühne
$W eval "$(sed 's#__ZEIT__#2 / 24#' $H/nacht-stellen.js)" > $D/$N-nacht-stellen.json 2>&1
say "nacht gestellt $(tr -d '\n ' < $D/$N-nacht-stellen.json | cut -c1-160)"
nb() {
  local js; js=$(sed "s#__BLICK__#$2#" $H/nacht-bild.js)
  $W eval "$js" > $D/$N-$1.json 2>&1
  node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')).ergebnis; fs.writeFileSync(process.argv[2], Buffer.from(j.png.split(',')[1], 'base64')); console.log(j.name+' hell '+j.hell+' belichtung '+j.belichtung)" $(cd $D && pwd -W)/$N-$1.json "$O/$1.png"
  rm -f $D/$N-$1.json
}
{
  nb n-nord      '{"name":"n-nord","px":-900,"py":1.7,"pz":-850,"lx":-900,"ly":0,"lz":-880}'
  nb n-himmel    '{"name":"n-himmel","px":-900,"py":1.7,"pz":-850,"lx":-900,"ly":40,"lz":-880}'
  nb n-wald      '{"name":"n-wald","px":-915,"py":1.7,"pz":-838,"lx":-930,"ly":3,"lz":-860}'
  nb n-wald-tief '{"name":"n-wald-tief","px":-945,"py":1.7,"pz":-895,"lx":-955,"ly":2,"lz":-905}'
  nb n-ufer      '{"name":"n-ufer","px":-865,"py":1.7,"pz":-752,"lx":-862,"ly":0.5,"lz":-722}'
} > $D/$N-nacht.txt 2>&1
say "nacht $(tr '\n' ' ' < $D/$N-nacht.txt)"
$W eval "return window.__gf || ['kein Hoerer']" > $D/$N-nacht-gpufehler.txt
say "gpu-fehler: $(tr -d '\n ' < $D/$N-nacht-gpufehler.txt | cut -c1-120)"
stopp
say "gestoppt"

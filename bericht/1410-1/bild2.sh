#!/bin/bash
# 1310-18 / 1410-1: das Bild-Paar je Stand — ./bild2.sh <name> <worktree> (INS= das Instrument; ab 08b57ed8 abab-i546b, Genesis-Anker 0/0)
# EINE Welt je Sitzung (Werkbank, echte GPU, Instrument abab-i543), gepinnt wie 0910-1 B (p3/hv2/boot.sh): TRAA-Phase je
# Aufnahme, Himmels-, Knoten- und Loop-Uhr 1000, Tiere aus; die Tore atmen vor jeder Aufnahme an der Uhr 1000 (Membran-Tick
# mit erzwungenem Scan, 200-mal: die Flügel-Glättung (×0,12 je Tick) steht danach auf ihrem Ziel — sonst hängt ihr Winkel an
# der Zahl der Ticks der Sitzung). Je Messort (wiese · genesis · dorf) vier Blicke, an Genesis dazu zwei Tore nah; gpu-bank am Genesis-
# Blick und am Tor nah. GPU-Fehler gesammelt.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k18
INS=${INS:-/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-i543}
N=$1; WT=$2; SEITE=4312; export WERKBANK_PORT=4490
W="node $INS/scripts/werkbank.cjs"
D=$H/bild/daten; mkdir -p $D $H/bild/$N
O=$(cd $H/bild/$N && pwd -W)
say() { echo "$(date +%T) $N $*" | tee -a $H/bild/bild.log; }
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  sleep 2
}
ergebnis() { node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); console.log(JSON.stringify(j.ergebnis!==undefined?j.ergebnis:j))" "$1"; }
stopp
mkdir -p $H/bild/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/bild/stand/$N/ 2>/dev/null
(cd $WT && PORT=$SEITE node save-server.js > $D/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:$SEITE/ 2>/dev/null | grep -q 200 && break; sleep 1; done
FP=$(node $H/../k14/fingerabdruck.cjs $WT 2>/dev/null) || { say "SEITEN-WACHE ROT"; stopp; exit 3; }
(cd $INS && node scripts/werkbank.cjs start --echt --port $WERKBANK_PORT --seite http://localhost:$SEITE > $D/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
say "bereit $(cd $WT && git log --oneline -1 | cut -c1-8) fp=$FP"
$W eval "window.__gf = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gf.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
# die Pins (0910-1 B) + der Tor-Atem an der Uhr 1000 vor jeder Aufnahme
$W eval "r._loopSkyboxZeit = function () { if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) this.state.skyboxUniforms.time.value = 1000; }; r._loopSkyboxZeit(); window.__jitterStart = 0; const A0 = window.__ausgabeAufnahme; window.__ausgabeAufnahme = function (...a) { if (r.state.traaNode) r.state.traaNode._jitterIndex = window.__jitterStart; if (window.__torAtem) { r._membranScanAt = -1e9; for (let i = 0; i < 200; i++) r._tickPortalMembranes(1000); } return A0.apply(this, a); }; return 1" > /dev/null
$W eval "const P = Object.getPrototypeOf(r); r._loopRender = function () { return P._loopRender.call(this, 1000); }; const nf = r.state.renderer._nodes.nodeFrame; nf.update = function () { this.frameId++; this.deltaTime = 0; this.time = 1000; }; return 1" > /dev/null
b() { $W bild $2 --w 1920 --h 1080 --datei "$O/$1.png" | tr -d '\n' | sed 's/  */ /g' | cut -c1-110; echo; }
ort() { # $1 ort-id, $2 kurz, $3 Auge über Grund (+1.7), $4 Ziel über Grund (+0)
  local AU=${3:-+1.7} ZI=${4:-+0}
  $W umstellen --ort $1 > $D/$N-umstellen-$1.json 2>&1
  # 60 Takte nach dem Einschwingen: die Fern-Karten belegen ihr Fenster erst danach voll (182 → 254 an der Wiese, A wie B)
  $W eval "return (async () => { for (let t = 0; t < (${TICKS:-60}); t++) { window.__buehne(); if (window.__ortSchritt) window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((res) => setTimeout(res, 50)); } return 1; })()" > /dev/null
  $W eval "for (const c of r.state.creatures || []) c.visible = false; window.__buehne(); r.state.yaw = 0; r.state.pitch = 0; window.__torAtem = true; const p = r.state.playerMesh.position; return { x: +p.x.toFixed(2), z: +p.z.toFixed(2) };" > $D/$N-pos-$1.json
  local P=$(ergebnis $D/$N-pos-$1.json)
  local X=$(node -e "console.log(JSON.parse(process.argv[1]).x)" "$P") Z=$(node -e "console.log(JSON.parse(process.argv[1]).z)" "$P")
  b $2-nord "$X $AU $Z $X $ZI $(node -e "console.log($Z-30)")"
  b $2-ost  "$X $AU $Z $(node -e "console.log($X+30)") $ZI $Z"
  b $2-sued "$X $AU $Z $X $ZI $(node -e "console.log($Z+30)")"
  b $2-west "$X $AU $Z $(node -e "console.log($X-30)") $ZI $Z"
}
ort wiese w > $D/$N-bilder.txt 2>&1
ort genesis g +4 +2 >> $D/$N-bilder.txt 2>&1
# der Schlüssel in der lebenden Welt: je Signatur die Stoffe und ihre Programm-Schlüssel (Foundry, Membran, Nebel)
$W eval "const sch = {}; r.state.scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; for (const m of ms) { const u = m.userData || {}; const s = u.foundrySignatur ? 'f:' + u.foundrySignatur + '|' + (u.lichtPool === true ? 'pool' : u.lichtPool || '-') : u.portalMembran ? 'membran' : u.portalNebel ? 'nebel' : null; if (!s) continue; const g = (sch[s] = sch[s] || { stoffe: new Set(), schluessel: new Set() }); g.stoffe.add(m.uuid); g.schluessel.add(m.customProgramCacheKey()); } }); const out = {}; for (const [k, g] of Object.entries(sch)) out[k] = g.stoffe.size + '/' + g.schluessel.size; return out;" > $D/$N-schluessel.json 2>&1
say "schluessel $(ergebnis $D/$N-schluessel.json | cut -c1-400)"
# DIE TORE NAH (Genesis-Ring): die zwei nächsten Tore verschiedener Gestalt, das Auge 4 m vor dem Tor auf der Linie zur Ring-Mitte
$W eval "const P = r.state.playerMesh.position; const L = [...(r._portalMembranes || new Map()).values()].filter((x) => x.mesh && x.entry).map((x) => ({ g: x.tor.gestalt, x: x.entry.position.x, z: x.entry.position.z, d: Math.hypot(x.entry.position.x - P.x, x.entry.position.z - P.z) })).sort((a, b) => a.d - b.d); const aus = []; for (const t of L) if (!aus.some((u) => u.g === t.g) && aus.length < 2) aus.push(t); return { px: P.x, pz: P.z, tore: aus, n: L.length };" > $D/$N-tore.json
TORE=$(ergebnis $D/$N-tore.json); say "tore $TORE"
for i in 0 1; do
  POSE=$(node -e "const j=JSON.parse(process.argv[1]); const t=j.tore[$i]; if(!t){console.log('');process.exit(0)} const dx=j.px-t.x, dz=j.pz-t.z, l=Math.hypot(dx,dz)||1; console.log([(t.x+dx/l*4).toFixed(2),'+1.7',(t.z+dz/l*4).toFixed(2),t.x.toFixed(2),'+2.2',t.z.toFixed(2)].join(' '))" "$TORE")
  [ -n "$POSE" ] && b g-tor$i "$POSE" >> $D/$N-bilder.txt 2>&1
done
# gpu-bank: am Tor nah (die Kamera steht nach dem letzten Bild dort), dann am Genesis-Blick des Messorts
$W gpu-bank 120 --runden 3 > $D/$N-bank-tor.txt 2>&1
$W eval "for (const x of r._portalMembranes.values()) if (x.mesh) x.mesh.visible = false; return 1" > /dev/null
$W gpu-bank 120 --runden 3 > $D/$N-bank-tor-ohne-membran.txt 2>&1
$W eval "for (const x of r._portalMembranes.values()) if (x.nebel) x.nebel.visible = false; return 1" > /dev/null
$W gpu-bank 120 --runden 3 > $D/$N-bank-tor-ohne-tor.txt 2>&1
$W eval "for (const x of r._portalMembranes.values()) { if (x.mesh) x.mesh.visible = true; if (x.nebel) x.nebel.visible = x._act > 0.001; } return 1" > /dev/null
$W umstellen --ort genesis > /dev/null 2>&1
$W eval "for (const c of r.state.creatures || []) c.visible = false; window.__buehne(); return 1" > /dev/null
$W gpu-bank 120 --runden 3 > $D/$N-bank-genesis.txt 2>&1
say "bank tor $(grep -aE 'ms|gpu' $D/$N-bank-tor.txt | tail -1 | cut -c1-120) · genesis $(grep -aE 'ms|gpu' $D/$N-bank-genesis.txt | tail -1 | cut -c1-120)"
ort dorf d >> $D/$N-bilder.txt 2>&1
say "bilder $(ls $H/bild/$N | wc -l) · $(grep -c 'datei' $D/$N-bilder.txt) Aufnahmen"
$W eval "return window.__gf || ['kein Hoerer']" > $D/$N-gpufehler.txt
say "gpu-fehler: $(tr -d '\n ' < $D/$N-gpufehler.txt | cut -c1-160)"
FP2=$(node $H/../k14/fingerabdruck.cjs $WT 2>/dev/null) || FP2=ROT
[ "$FP2" = "$FP" ] || say "SEITEN-WACHE NACHHER ROT"
stopp
say "gestoppt"

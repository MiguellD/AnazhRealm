#!/bin/bash
# p3/messplatz/serie.sh — DAS WARME ABAB des Messplatz-Diensts (koordination zug/messplatz.md). Aufruf wie bisher (messplatz.sh
# fahre_abab, Stationen): MP_A, MP_B (Bäume), MP_OUT (Roh-Ordner), MP_LOCK (Schloss), ZELLEN, LAEUFE (Fenster, Vorgabe A1 B1 A2 B2),
# MP_INS (Instrument: A = Vorgabe, die Werkbank von main, B, oder seite = die Werkbank des eigenen Baums), MP_BASE (Vorgabe die OMEN).
# 30.10.: bis heute bootete jede Seite für jede Messung neu — ein Boot 3,8–7,5 min, davon ~1 min Messung; z83-abab2 brauchte für die
# Stadt 25,8 min bis zum VERLÄNGERN und noch einmal so viel für 4+4. Jetzt bootet je Zelle jede Seite EINMAL, danach wechseln die
# Mess-Fenster in den warmen Welten; die Größen und Dateien je Fenster sind die des Boots von gestern (<zelle>-A1-steht.txt …),
# urteil.cjs urteilt wie bisher (2+2, Grenzband auf 4+4, KLAR NACH 2+2) und nennt die Fenster je Boot (<zelle>-warm.txt).
#  - EINE SEITE ZUR ZEIT: die nicht gemessene Welt SCHLÄFT (werkzeug/schlaf.cjs: eingefroren — kein Zeitgeber, kein rAF, kein Worker,
#    kein Netz — und ihr Fenster minimiert, es verdeckt das gemessene nie); ihr save-server ist aus, die Pforte :4312 gehört der
#    gemessenen Seite (beide laufen unter http://localhost:4312 wie bisher: Auto-Speichern und Flugschreiber gleich auf beiden).
#    BEWEIS je Fenster in <zelle>-warm.txt: `ruhe_cpu_s` = CPU-Sekunden ALLER Chrome-Prozesse der ruhenden Seite in diesem Fenster
#    (daneben ihr Renderer und ihr GPU-Prozess allein, `mess_cpu_s` die gemessene Seite zum Vergleich),
#    `schlief` = die längste Stille des 1-Hz-Zeitgebers der Seite über ihre Ruhe (wach schwiege er nie länger als ~1 s; schlafend
#    so lange, wie sie ruhte — `ruhte` ist die Wanduhr vom Einfrieren bis zum Wecken).
#  - GLEICHES ALTER: eine schlafende Welt altert nicht (das Spiel deckelt den Takt nach einer Pause, Lehre 13); jede Welt läuft nur in
#    ihren eigenen Fenstern — Fenster k von A und Fenster k von B treffen Welten gleichen Alters; jeder `lauf` stellt Uhr, Wetter und
#    Saison neu (die Bühne), jedes Fenster stellt den Ort neu (`umstellen`) und räumt, was ein Fenster hinterließ (GRUND).
#  - FOLGE Thue-Morse A1 B1 B2 A2 | B3 A3 A4 B4 statt ABAB: die Fenster laufen ohne Boot-Pause hintereinander, die GPU bleibt heiß und
#    driftet über die Zelle (Takt, Wärme, die Welt wird über Minuten teurer — GPU-Mess-Lehren); ABAB gäbe B in jedem Paar die spätere
#    Hälfte, Thue-Morse hebt jede lineare (4 Fenster) und quadratische (8 Fenster) Drift aus dem Mittel A − B.
#  - VERLÄNGERUNG IM WARMEN: nach dem ersten 2+2 fragt die Serie urteil.cjs; verlängert die Zelle, folgen B3 A3 A4 B4 in DENSELBEN
#    Welten (messplatz.sh findet danach 4+4 und verlängert nicht mehr; ruft es mit LAEUFE="A3 B3 A4 B4", stehen die Fenster schon).
#  - SCHLOSS JE FENSTER: zwischen zwei Fenstern ist das Schloss frei, ein CI-Job geht vor (VORFAHRT), die Welten schlafen derweil;
#    belegt fremde Last den Rechner (beide Welten schlafen, über 25 % aller Kerne), wartet das Fenster (FREMDLAST, höchstens 10 min).
#  - HÄNGER: jeder Werkbank-Befehl trägt eine Frist; ein Hänger beendet die Zelle beim Namen (die fehlenden Fenster fährt der nächste
#    Aufruf in frischen Welten, <zelle>-warm.txt zählt dann zwei Boots je Seite).
# Bootet das Instrument eine Seite nicht binnen 3 min, fällt diese Seite auf die Werkbank ihres eigenen Baums zurück (`INSTRUMENT`).
BASE=${MP_BASE:-/c/Users/micha/Desktop/AnazhRealm-OMEN}
A=${MP_A:?}; B=${MP_B:?}; WZ=$BASE/p3/messplatz/werkzeug; H=${H:-$BASE/p3/messplatz}
case ${MP_INS:-A} in B) INS=$B;; *) INS=$A;; esac
OUT=${MP_OUT:?}; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $OUT/stand $OUT/gehen $OUT/fahrt $OUT/blick
STOPP=$(cygpath -w $WZ/stopp.ps1)
declare -A WT=([A]=$A [B]=$B) PORT=([A]=4490 [B]=4492) WINS=() WHASH=() PROF=() FP=() RUHT_SEIT=()
SITZUNG=$(date +%s)
say() { echo "$(date +%T) $*" | tee -a $LOG; }
schlaf_js() { (cd ${WINS[$1]:-$INS} && node "$(cygpath -w $WZ/schlaf.cjs)" "${@:2}"); } # $1 Seite (der Baum mit node_modules), Rest: Verb
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; schlaf_js A stopp 4490 4492 >> $OUT/stopp.log 2>&1; sleep 3; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
smi_an() { nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,temperature.gpu,power.draw,pstate,clocks_throttle_reasons.active,memory.used --format=csv,noheader -l 1 > $1 2>/dev/null & SMI=$!; }
kurz() { node -e 'for (const f of process.argv.slice(1)) { try { const t = require("fs").readFileSync(f, "utf8"); const j = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)); const e = j.ergebnis || j; process.stdout.write(`${f.replace(/^.*-/, "").replace(".txt", "")}: fps ${e.fps} F95 ${e.frameMs && e.frameMs.p95} C95 ${e.cpuTaktMs && e.cpuTaktMs.p95} k0 ${e.gpuJePassMs && e.gpuJePassMs.k0 ? e.gpuJePassMs.k0.p50 : "-"} | `); } catch (x) { process.stdout.write("LEER | "); } }' "$@"; }
jwert() { node -e 'try { const t = require("fs").readFileSync(process.argv[1], "utf8"); const j = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)); const v = process.argv[2].split(".").reduce((o, k) => (o == null ? o : o[k]), j); console.log(v == null ? "" : typeof v === "object" ? JSON.stringify(v) : v); } catch (e) { console.log(""); }' "$(cygpath -w $1)" "$2"; }
frist() { # $1 Sekunden, $2 Ausgabe, Rest der Befehl — ein Hänger (Exit 124) beim Namen; sonst Exit 0 wie bisher (die Werkbank urteilt in der Datei)
  local s=$1 f=$2; shift 2; timeout $s "$@" > $f 2>&1; [ $? = 124 ] || return 0
  say "${NAME:-$Z} HÄNGER: $(echo "${@:3}" | cut -c1-60) über $s s"; return 124; }
. $BASE/p3/gpu-schloss.sh
for f in geher.js geher-ende.js kreatur-uhr-an.js kreatur-uhr-lesen.js tiere-zensus.js stopp.ps1 fahrt.js fahrt-pruef.js blick.js jpg.cjs schlaf.cjs; do [ -s $WZ/$f ] || { echo "FEHLT $WZ/$f"; exit 4; }; done
worker() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
# VORFAHRT je Fenster: das Schloss ist zwischen zwei Fenstern frei; ein laufender oder wartender CI-Job geht vor, danach setzt die
# Zelle mit dem nächsten Fenster fort. 25.10.: die Wartezeit als Zeile `<id> VORFAHRT <fenster> gewartet <min>` nach zug/fortschritt.txt.
vorfahrt() { local w=0 t0=$(date +%s); while worker || ci_wartet; do [ $w = 0 ] && say "VORFAHRT: CI-Job läuft oder wartet - warte"; w=1; sleep 30; done
  [ $w = 1 ] && type fortschritt > /dev/null 2>&1 && fortschritt "${MP_ID:-serie} VORFAHRT $NAME gewartet $(awk -v s=$(( $(date +%s) - t0 )) 'BEGIN { printf "%.1f", s / 60 }')"; return 0; }
# DIE FREMDLAST-VORFAHRT je Fenster: beide Welten schlafen — was den Rechner jetzt belegt, ist fremd (ein Lauf neben der Messung, die
# Aufräumarbeit eines CI-Jobs, ein Virenscan). Über 25 % aller Kerne (3 s gemessen) wartet das Fenster in 15-s-Schritten — zusammen
# höchstens 10 min je Aufruf der Serie (FREMD_BUDGET: eine Grundlast über 25 % kostet einmal 10 min, nie 10 min je Fenster), dann misst
# es und nennt die Last (`fremd_pct` in <zelle>-warm.txt). 30.10. Radeon: zwei fremde Chrome mit je ~13 Kernen hoben die System-Last
# eines Fensters von 17 auf 49 %, steht CPU-Takt p95 5,5 → 15,5 ms. Dazu der freie Speicher (`frei_mb`): zwei Welten liegen im RAM
# (OMEN 16 GB) — wird er knapp, steht es neben der Zahl.
FREMD_BUDGET=600
fremdlast() { node -e 'const os = require("os"); const s = () => os.cpus().reduce((a, c) => ({ l: a.l + c.times.idle, g: a.g + Object.values(c.times).reduce((x, y) => x + y, 0) }), { l: 0, g: 0 }); const a = s(); setTimeout(() => { const b = s(); console.log(Math.round(100 * (1 - (b.l - a.l) / (b.g - a.g))) + " " + Math.round(os.freemem() / 1048576)); }, 3000);'; }
fremd_warten() { local w=0 t0=$(date +%s); read -r FREMD FREI <<< "$(fremdlast)"
  while [ "${FREMD:-0}" -gt 25 ] && [ $(( $(date +%s) - t0 )) -lt $FREMD_BUDGET ]; do [ $w = 0 ] && say "FREMDLAST $FREMD % vor $NAME - warte"; w=1; sleep 15; read -r FREMD FREI <<< "$(fremdlast)"; done
  FREMD_BUDGET=$(( FREMD_BUDGET - ( $(date +%s) - t0 ) )); [ $FREMD_BUDGET -lt 0 ] && FREMD_BUDGET=0
  [ $w = 1 ] && say "FREMDLAST $FREMD % nach $(( $(date +%s) - t0 )) s - $NAME misst (Rest-Budget $FREMD_BUDGET s)"; return 0; }
# STORNO je Fenster (25.10.: takt2-abab lief storniert weiter): Exit 5, der Dienst bucht nichts
storno_probe() { [ -n "${MP_ID:-}" ] && type storniert > /dev/null 2>&1 && git -C "$MK" fetch -q origin koordination 2>/dev/null && storniert "$MP_ID"; }

# DIE PFORTE :4312 — der save-server EINES Baums; die Seiten-Wache (Fingerabdruck der ausgelieferten Skripte) bei jedem Öffnen und
# nach jedem Fenster; beim Boot (`frisch`) wandert der Spielstand des Baums beiseite (eine frische Welt, wie bisher je Boot)
pforte_an() {
  local s=$1 wt=${WT[$1]} f t
  [ "$2" = frisch ] && { mkdir -p $OUT/stand/$Z-$s; mv $wt/anazhRealmState.json $wt/anazhRealmState.json.bak $wt/anazhRealmPerf.json $OUT/stand/$Z-$s/ 2>/dev/null; }
  for t in $(seq 1 60); do curl -s -o /dev/null --max-time 2 http://localhost:4312/ 2>/dev/null || break; [ $t = 60 ] && { say "PFORTE :4312 belegt (fremd) - die Zelle endet"; return 3; }; sleep 1; done
  (cd $wt && PORT=4312 node "$(cygpath -w $wt)\\save-server.js" >> $OUT/stand/$Z-$s-save.log 2>&1 &)
  for t in $(seq 1 150); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 0.2; done
  f=$(node $K14/fingerabdruck.cjs $wt 2>>$LOG) || { say "$Z-$s SEITEN-WACHE ROT ($wt)"; return 3; }
  [ -z "${FP[$s]}" ] && FP[$s]=$f
  [ "$f" = "${FP[$s]}" ] || { say "$Z-$s SEITEN-WACHE ROT (Fingerabdruck $f statt ${FP[$s]})"; return 3; }
}
pforte_aus() { schlaf_js $1 pforte-aus "$(cygpath -w ${WT[$1]})" >> $OUT/stopp.log 2>&1 || { say "$Z-$1 PFORTE: $(tail -n 1 $OUT/stopp.log)"; return 3; }; }
seite() { S=$1; export WERKBANK_PORT=${PORT[$1]}; W="node ${WINS[$1]:-$INS}/scripts/werkbank.cjs"; } # die gemessene Seite: Port und Instrument
werkbank_an() { # $1 Datei-Präfix, $2 Ort, $3 Seite -> WINS[$3] = das Instrument, das bereit wurde
  local s=$3 wt=${WT[$3]} ins=$INS; [ "${MP_INS:-A}" = seite ] && ins=$wt
  for versuch in 1 2; do
    rm -f $1-werkbank.log; (cd $ins && node scripts/werkbank.cjs start --echt --port ${PORT[$s]} --seite http://localhost:4312 --ort $2 > $1-werkbank.log 2>&1 &)
    for t in $(seq 1 36); do grep -qE "bereit|FEHLER" $1-werkbank.log 2>/dev/null && break; sleep 5; done
    grep -q "bereit" $1-werkbank.log 2>/dev/null && { WINS[$s]=$ins; WHASH[$s]=$(git -C $ins log -1 --format=%h); return 0; }
    [ "$ins" = "$wt" ] && break
    say "$(basename $1) INSTRUMENT $(git -C $ins log -1 --format=%h) bootet die Seite nicht in 3 min - Rückfall auf die Werkbank des eigenen Baums"
    WERKBANK_PORT=${PORT[$s]} timeout 60 node $ins/scripts/werkbank.cjs stop > /dev/null 2>&1; schlaf_js $s stopp ${PORT[$s]} >> $OUT/stopp.log 2>&1
    pforte_aus $s; pforte_an $s frisch || return 3; ins=$wt
  done
  say "$(basename $1) WERKBANK NICHT BEREIT"; return 1
}
# DAS EINMALIGE der Welt (Boot): der GPU-Fehler-Horcher, die Wurzel des Takts (fahrt.js hängt sich an `_gameLoopTick`, GRUND hängt ab)
# und der Puls (1 Hz, mit seiner längsten Stille) — die Probe der Ruhe: eine schlafende Seite schweigt, solange sie ruht
AN="window.__gf = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gf.push(String((e.error && e.error.message) || e).slice(0, 200))); window.__taktWurzel = r._gameLoopTick; window.__puls = { n: 0, zuletzt: Date.now(), luecke: 0 }; window.__pulsUhr = setInterval(() => { const p = window.__puls, t = Date.now(); p.luecke = Math.max(p.luecke, t - p.zuletzt); p.zuletzt = t; p.n++; }, 1000); return 1"
# DIE GRUNDSTELLUNG je Fenster: was ein Fenster der Zelle in der Welt ließ, fällt (der Fahrer am Takt, der Ritt und sein Wagen, die
# Tasten, versteckte Tiere, das GPU-Fehler-Buch); dazu Sicht und Fenster der Seite — gemessen wird nur eine SICHTBARE Seite
GRUND="const st = r.state, g = []; if (window.__taktWurzel && r._gameLoopTick !== window.__taktWurzel) { r._gameLoopTick = window.__taktWurzel; g.push('takt'); } const id = st.player && st.player.mountedArch; if (id != null) { const e = (st.architectures || []).find((a) => a.id === id); r.dismountArchitecture(); if (e) r.removeArchitecture(e, { still: true }); g.push('ritt'); } if (st.keys) for (const k of ['w', 'a', 's', 'd']) st.keys[k] = false; if (st.creaturesHidden && r.toggleCreatures) { r.toggleCreatures(true); g.push('tiere'); } window.__gf = []; const p = window.__puls; return { grund: g, sicht: document.visibilityState, innen: innerWidth + 'x' + innerHeight, schlief: p ? +(Math.max(p.luecke, Date.now() - p.zuletzt) / 1000).toFixed(1) : null }"
# SCHLAFEN und WECKEN (werkzeug/schlaf.cjs, EIN Prozess je Wechsel): im Fenster trägt der Wechsel die Last-Probe — beim Wecken der
# Schnappschuss des Anfangs ($2), beim Einschlafen VOR dem Einfrieren der des Endes ($2) mit der Differenz zum Anfang ($3) nach $OUT/schlaf-letzt.json
um() { sed -n 's/.*"um":\([0-9]*\).*/\1/p' $1; } # der Augenblick des Einfrierens/Weckens (ms) aus der Antwort von schlaf.cjs
schlafen() { # $1 Seite [$2 $3]: die Stille des Pulses von vorn, einfrieren, minimieren — wer nicht schläft, misst nicht weiter
  local mit=(); [ -n "$2" ] && mit=(--last "$(cygpath -w $2)" "${PROF[A]}" "${PROF[B]}" "$(cygpath -w $3)")
  schlaf_js $1 schlaf "${PROF[$1]}" "${mit[@]}" > $OUT/schlaf-letzt.json 2>> $OUT/schlaf.log || { say "$Z-$1 SCHLAF ROT: $(tail -n 1 $OUT/schlaf.log)"; return 3; }
  cat $OUT/schlaf-letzt.json >> $OUT/schlaf.log; RUHT_SEIT[$1]=$(um $OUT/schlaf-letzt.json)
}
wecken() { # $1 Seite [$2]: Fenster normal, Seite aktiv, nach vorn — dann der Schnappschuss des Anfangs; RUHTE = Wecken − Einfrieren (s)
  local mit=(); [ -n "$2" ] && mit=(--last "$(cygpath -w $2)" "${PROF[A]}" "${PROF[B]}")
  schlaf_js $1 wach "${PROF[$1]}" "${mit[@]}" > $OUT/wach-letzt.json 2>> $OUT/schlaf.log || { say "$Z-$1 WECKEN ROT: $(tail -n 1 $OUT/schlaf.log)"; return 3; }
  cat $OUT/wach-letzt.json >> $OUT/schlaf.log
  RUHTE=$(awk -v a="${RUHT_SEIT[$1]}" -v b="$(um $OUT/wach-letzt.json)" 'BEGIN { if (a > 0 && b > a) printf "%.1f", (b - a) / 1000; else print "-" }')
}
# mehrere Felder einer Werkbank-Antwort in EINEM node-Start (ein Prozess-Start kostet am Messplatz Sekunden), "-" für ein fehlendes
felder() { node -e 'const k = process.argv.slice(2); try { const t = require("fs").readFileSync(process.argv[1], "utf8"); const j = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)); console.log(k.map((x) => { const v = x.split(".").reduce((o, y) => (o == null ? o : o[y]), j); return v == null || v === "" ? "-" : typeof v === "object" ? JSON.stringify(v) : String(v); }).join(" ")); } catch (e) { console.log(k.map(() => "-").join(" ")); }' "$(cygpath -w $1)" "${@:2}"; }
WARM=""; ende_warm() { # beide Welten beenden, die Pforte frei, die Spielstände in den Roh-Ordner
  local s; for s in A B; do [ -n "${WINS[$s]}" ] && { wecken $s > /dev/null 2>&1; WERKBANK_PORT=${PORT[$s]} timeout 60 node ${WINS[$s]}/scripts/werkbank.cjs stop > /dev/null 2>&1; }; done
  for s in A B; do pforte_aus $s > /dev/null 2>&1; done; stopp
  for s in A B; do mkdir -p $OUT/stand/$Z-$s-nach; mv ${WT[$s]}/anazhRealmState.json ${WT[$s]}/anazhRealmState.json.bak ${WT[$s]}/anazhRealmPerf.json $OUT/stand/$Z-$s-nach/ 2>/dev/null; done
  WINS=(); WHASH=(); PROF=(); FP=(); WARM=""; return 0; }
abbruch() { kill $SMI 2>/dev/null; say "$Z ABBRUCH (Exit $1)"; ende_warm; schloss_loesen ${MP_LOCK:?}; exit $1; }
trap '[ -n "$WARM" ] && { kill $SMI 2>/dev/null; ende_warm; schloss_loesen ${MP_LOCK:?}; }' EXIT

boot() { # $1 Seite: die Welt EINMAL je Zelle — Pforte, Werkbank am Ort, das Einmalige, der Ort; danach schläft sie
  local s=$1 P=$D/$Z-boot$1 t0=$(date +%s); NAME=$Z-boot$1; WARM=1
  vorfahrt; schloss_nehmen ${MP_LOCK:?}
  pforte_an $s frisch || abbruch 3
  say "$NAME start FP=${FP[$s]} gpu[$(gpu)]"
  smi_an $P-smi.csv
  werkbank_an $P $ORT $s || abbruch 1
  seite $s
  frist 120 $P-an.txt $W eval "$AN" || abbruch 6
  case $Z in d-ego|d-takt|stadt) ;; *) frist 60 /dev/null $W eval "window.__anazhAutoSettlement = false; return 1";; esac
  frist 60 /dev/null $W fenster 1920 1080
  frist 900 $P-umstellen.txt $W umstellen --ort $ORT --sicht $SICHT || abbruch 6
  frist 60 $P-status.txt $W status; PROF[$s]=$(jwert $P-status.txt boot.profil)
  [ -n "${PROF[$s]}" ] || { say "$NAME kein Profil in werkbank status"; abbruch 3; }
  kill $SMI 2>/dev/null
  schlafen $s || abbruch 3
  pforte_aus $s || abbruch 3
  schloss_loesen ${MP_LOCK:?}
  local ums; ums=$(jwert $P-umstellen.txt ms)
  echo "boot $s sitzung=$SITZUNG start=$t0 ende=$(date +%s) umstellen_ms=$ums instrument=${WHASH[$s]}" >> $WD/$Z-warm.txt
  say "$NAME ende $(( $(date +%s) - t0 )) s gpu[$(gpu)] umstellen $ums ms"
}

messen() { # die Messung EINES Fensters, je Zelle wie bisher je Boot (Exit 124 = Hänger)
  case $Z in
  w-ego|sturm|stadt)
    frist 120 $P-zensus-0.txt $W eval "$(cat $WZ/tiere-zensus.js)" || return 124
    frist 900 $P-steht.txt $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei || return 124
    if [ $Z = w-ego ]; then frist 300 $P-bank.txt $W gpu-bank 12 --runden 5 || return 124; fi
    case $Z in
      sturm) frist 600 $P-geht-1.txt $W lauf 30 --ein 2 --regler voll --tiere 50 --wetter stormy --wandern bahn || return 124;;
      *) frist 600 $P-geht-1.txt $W lauf 30 --ein 2 --regler voll --tiere frei --wandern bahn || return 124;;
    esac
    frist 120 $P-zensus-1.txt $W eval "$(cat $WZ/tiere-zensus.js)" || return 124
    ERG="$(kurz $P-steht.txt $P-geht-1.txt)" ;;
  w-tier)
    frist 120 $P-zensus-0.txt $W eval "$(cat $WZ/tiere-zensus.js)" || return 124
    frist 900 $P-steht.txt $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei || return 124
    frist 300 $P-bank-mit.txt $W gpu-bank 12 --runden 5 || return 124
    frist 120 $P-aus.txt $W eval "r.toggleCreatures(false); return r.state.creaturesHidden" || return 124
    frist 300 $P-lauf-ohne.txt $W lauf 3 --ein 1 --regler voll --tiere frei || return 124
    frist 300 $P-bank-ohne.txt $W gpu-bank 12 --runden 5 || return 124
    frist 120 $P-an.txt $W eval "r.toggleCreatures(true); return r.state.creaturesHidden" || return 124
    frist 300 $P-lauf-mit2.txt $W lauf 3 --ein 1 --regler voll --tiere frei || return 124
    frist 300 $P-bank-mit2.txt $W gpu-bank 12 --runden 5 || return 124
    ERG="$(kurz $P-steht.txt) bank[$(for b in mit ohne mit2; do grep -o '"gpuJeFrameMs": [0-9.]*' $P-bank-$b.txt | cut -d' ' -f2 | tr '\n' ' '; done)] ohne[$(node $WZ/szene.cjs $P-lauf-ohne.txt | cut -c1-40)] mit2[$(node $WZ/szene.cjs $P-lauf-mit2.txt | cut -c1-40)]" ;;
  takt)
    frist 900 $P-steht.txt $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei || return 124
    frist 600 $P-takt.txt $W takt 30 --ein 2 --wandern bahn --tiere frei --json "$(cygpath -w $P-takt.json)" || return 124
    ERG="$(kurz $P-steht.txt) takt[$(head -12 $P-takt.txt | tr '\n' ' ' | cut -c1-400)]" ;;
  d-takt) # z13 (24.10.): die Zerlegung des CPU-Takts im Dorf stehend, je Methode (p3/n2410/z13/takt-delta.cjs); ohne Kreatur-Uhr (ihre Hülle läge im Profil)
    frist 120 $P-uhr.txt $W eval "$(cat $WZ/uhr8.js)" || return 124
    frist 900 $P-steht.txt $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei || return 124
    frist 900 $P-takt.txt $W takt 60 --ein 2 --wandern aus --regler voll --tiere frei --json "$(cygpath -w $P-takt.json)" || return 124
    ERG="$(kurz $P-steht.txt) takt[$(head -1 $P-takt.txt | cut -c1-200)]" ;;
  hieb)
    frist 900 $P-steht.txt $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei || return 124
    frist 900 $P-latenz.txt $W latenz --proben 30 --sicht ego --verb hieb --json "$(cygpath -w $P-latenz.json)" || return 124
    ERG="$(kurz $P-steht.txt) latenz[$(tr -d n < $P-latenz.txt | cut -c1-260)]" ;;
  g-third)
    frist 120 $P-zensus-0.txt $W eval "$(cat $WZ/tiere-zensus.js)" || return 124
    frist 900 $P-steht.txt $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei || return 124
    frist 300 $P-bank.txt $W gpu-bank 12 --runden 5 || return 124
    ERG="$(kurz $P-steht.txt)" ;;
  d-ego)
    frist 120 $P-uhr.txt $W eval "$(cat $WZ/uhr8.js)" || return 124
    frist 120 $P-zensus-0.txt $W eval "$(cat $WZ/tiere-zensus.js)" || return 124
    frist 120 $P-kiuhr-an.txt $W eval "$(cat $WZ/kreatur-uhr-an.js)" || return 124
    frist 900 $P-steht.txt $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei || return 124
    frist 120 $P-kiuhr-steht.txt $W eval "$(cat $WZ/kreatur-uhr-lesen.js)" || return 124
    frist 300 $P-bank.txt $W gpu-bank 12 --runden 5 || return 124
    frist 120 $P-uhr-ende.txt $W eval "return { uhr: +r.state.timeOfDay.toFixed(4) }" || return 124
    ERG="$(kurz $P-steht.txt) $(node $WZ/szene.cjs $P-steht.txt) uhr[$(tr -d '\n ' < $P-uhr.txt | cut -c1-80)] ende[$(tr -d '\n ' < $P-uhr-ende.txt | cut -c1-50)]" ;;
  fahrt)
    frist 900 $P-ein.txt $W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei || return 124
    frist 300 $P-auf.txt $W eval "$(cat $WZ/fahrt.js)" || return 124
    frist 600 $P-lauf.txt $W lauf 20 --ein 2 --regler voll --tiere frei || return 124
    frist 120 $P-pruef.txt $W eval "$(cat $WZ/fahrt-pruef.js)" || return 124
    ERG="$(kurz $P-lauf.txt) auf[$(tr -d '\n ' < $P-auf.txt | cut -c1-110)] pruef[$(tr -d '\n ' < $P-pruef.txt | cut -c1-260)]" ;;
  blick)
    frist 900 $D/lauf-0.txt $W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei || return 124
    frist 300 $D/antwort.txt $W eval "$(cat $WZ/blick.js)" || return 124
    node $WZ/jpg.cjs "$(cd $D && pwd -W)/antwort.txt" "$(cd $D && pwd -W)" > $D/blick.txt 2>&1
    ERG="$(tr '\n' ' ' < $D/blick.txt | cut -c1-700)" ;;
  esac
}

fenster() { # $1 Fenster (A1 …): seine Seite wacht, die andere schläft — Pforte, Grundstellung, Ort, Messung, dann schläft sie wieder
  local N=$1 s=${1:0:1} o t0 f2 ruhe schlief sicht innen grund rc rr rg mc sl nb ga vorher wf; o=$([ $s = A ] && echo B || echo A); NAME=$Z-$N
  case $Z in fahrt) D=$OUT/fahrt;; blick) D=$OUT/blick/$N;; d-ego|g-third) D=$OUT/gehen;; w-tier) D=$OUT/tier;; hieb) D=$OUT/hieb;; takt|d-takt) D=$OUT/takt;; *) D=$OUT/gehen;; esac
  P=$D/$NAME; [ $Z = blick ] && P=$D/blick; mkdir -p $D
  storno_probe && { say "$NAME STORNO - die Serie bricht ab"; ende_warm; exit 5; }
  vorfahrt; schloss_nehmen ${MP_LOCK:?}; fremd_warten
  pforte_an $s || abbruch 3
  wecken $s $P-cpu0.json || abbruch 3
  seite $s; t0=$(date +%s)
  frist 120 $P-grund.txt $W eval "$GRUND" || abbruch 6
  read -r schlief sicht innen grund <<< "$(felder $P-grund.txt ergebnis.schlief ergebnis.sicht ergebnis.innen ergebnis.grund)"
  ruhe="ruhte $RUHTE s schlief $schlief s"
  [ "$sicht" = visible ] || { say "$NAME die Seite ist nach dem Wecken nicht sichtbar ($sicht)"; abbruch 3; }
  # DIE NACHWACHE DER RUHE (schlaf.cjs nachfrieren): schweigt der Zeitgeber der ruhenden Seite seit ihrem Einfrieren? Danach gilt der
  # Schlaf wieder, bevor gemessen wird; eine Seite, die zwischendurch wachte, steht beim Namen (`vorher=gebrochen`)
  schlaf_js $o nachfrieren "${PROF[$o]}" "${RUHT_SEIT[$o]:-0}" > $OUT/nach-letzt.json 2>> $OUT/schlaf.log || { say "$NAME NACHFRIEREN ROT: $(tail -n 1 $OUT/schlaf.log)"; abbruch 3; }
  cat $OUT/nach-letzt.json >> $OUT/schlaf.log
  vorher=$(sed -n 's/.*"still":\([0-9]*\),"ruhe":\([0-9]*\),"gebrochen":\(true\|false\).*/\3 \1 \2/p' $OUT/nach-letzt.json | awk '{ if ($1 == "true") printf "gebrochen(%.0f/%.0fs)", $2 / 1000, $3 / 1000; else if ($1 == "false") print "still"; }')
  vorher=${vorher:--}
  [ "${vorher:0:9}" = gebrochen ] && say "$NAME RUHE GEBROCHEN: $o schwieg nur ${vorher#gebrochen} - erneut eingefroren"
  say "$NAME start FP=${FP[$s]} gpu[$(gpu)] $ruhe grund$grund ruhe-$o $vorher"
  # DIE WACHE IM FENSTER (schlaf.cjs wache, neben der Messung): wird die ruhende Seite sichtbar oder schlägt ihr Zeitgeber, friert sie
  # binnen 2 s wieder ein; jeder Fall steht in <fenster>-wache.txt (`wache=<n>` in <zelle>-warm.txt)
  rm -f $P-wache.txt $P-wache.txt.halt; (cd ${WINS[$o]:-$INS} && node "$(cygpath -w $WZ/schlaf.cjs)" wache "${PROF[$o]}" "$(cygpath -w $P-wache.txt)" > /dev/null 2>> $OUT/schlaf.log &)
  echo "${WHASH[$s]}" > $P-instrument.txt
  smi_an $P-smi.csv
  case $Z in d-ego|d-takt|stadt) ;; *) frist 60 /dev/null $W eval "window.__anazhAutoSettlement = false; return 1";; esac
  frist 900 $P-umstellen.txt $W umstellen --ort $ORT --sicht $SICHT || { touch $P-wache.txt.halt; abbruch 6; }
  ERG=""; messen || { touch $P-wache.txt.halt; abbruch 6; }
  frist 60 $P-gpufehler.txt $W eval "return { gf: window.__gf || [] }"
  kill $SMI 2>/dev/null
  touch $P-wache.txt.halt; wf=$(grep -c . $P-wache.txt 2>/dev/null); wf=${wf:-0}
  [ "$wf" -gt 0 ] && say "$NAME DIE WACHE fror $o im Fenster ${wf}× wieder ein ($(sed -n 's/.*"nachS":\([0-9.]*\).*/\1 s/p' $P-wache.txt | tr '\n' ' '))"
  f2=$(node $K14/fingerabdruck.cjs ${WT[$s]} 2>>$LOG) || f2=ROT
  [ "$f2" = "${FP[$s]}" ] || say "$NAME SEITEN-WACHE NACHHER ROT"
  schlafen $s $P-cpu1.json $P-cpu0.json || abbruch 3
  pforte_aus $s || abbruch 3
  schloss_loesen ${MP_LOCK:?}
  read -r rc rr rg mc sl nb ga <<< "$(felder $OUT/schlaf-letzt.json last.$o.gesamt last.$o.renderer last.$o.gpu last.$s.gesamt last.systemLastPct last.nebenPct last.gaeste)"
  echo "fenster $N sitzung=$SITZUNG start=$t0 ende=$(date +%s) $ruhe ruhe=$o ruhe_cpu_s=$rc ruhe_renderer_s=$rr ruhe_gpu_s=$rg mess_cpu_s=$mc system_last_pct=$sl neben_pct=$nb fremd_pct=$FREMD frei_mb=$FREI vorher=$vorher wache=$wf gaeste=$ga sicht=$sicht innen=$innen" >> $WD/$Z-warm.txt
  [ "$ga" = keine ] || [ "$ga" = - ] || say "$NAME GAST AN DER PFORTE :4312: $ga - ein fremder Klient lud von der gemessenen Seite"
  say "$NAME ende gpu[$(gpu)] ruhe $o cpu $rc s (renderer $rr, gpu $rg) gegen $s $mc s, System $sl % (neben den Welten $nb %) · $ERG"
}

folge() { # die Fenster der Liste in Thue-Morse-Ordnung: Paar k beginnt mit A, wenn popcount(2k−2) gerade ist (A1 B1 B2 A2 B3 A3 A4 B4)
  local k b x; for k in $(for n in $1; do echo ${n:1}; done | sort -un); do
    x=$(( 2 * k - 2 )); b=0; while [ $x -gt 0 ]; do b=$(( b ^ (x & 1) )); x=$(( x >> 1 )); done
    [ $b = 0 ] && echo "A$k B$k" || echo "B$k A$k"; done | tr '\n' ' '; }
fertig() { case $Z in fahrt) echo $OUT/fahrt/$Z-$1-pruef.txt;; blick) echo $OUT/blick/$1/blick.txt;; d-ego|g-third) echo $OUT/gehen/$Z-$1-bank.txt;; w-tier) echo $OUT/tier/$Z-$1-bank-mit2.txt;;
  hieb) echo $OUT/hieb/$Z-$1-latenz.json;; takt|d-takt) echo $OUT/takt/$Z-$1-takt.txt;; *) echo $OUT/gehen/$Z-$1-geht-1.txt;; esac; }

say "SERIE START (warm) A=$(git -C $A log -1 --format=%h)[$(git -C $A status --porcelain | wc -l)] B=$(git -C $B log -1 --format=%h)[$(git -C $B status --porcelain | wc -l)] Instrument=$(git -C $INS log -1 --format=%h) ZELLEN=${ZELLEN:-fahrt d-ego w-ego g-third stadt}"
for Z in ${ZELLEN:-fahrt d-ego w-ego g-third stadt}; do
  case $Z in g-third) ORT=genesis; SICHT=third;; w-ego|w-tier|hieb|takt) ORT=wiese; SICHT=ego;; d-ego|d-takt) ORT=dorf; SICHT=ego;; sturm) ORT=wiese; SICHT=ego;; stadt) ORT=stadt; SICHT=ego;; fahrt|blick) ORT=wiese; SICHT=third;; esac
  case $Z in fahrt) D=$OUT/fahrt;; blick) D=$OUT/blick;; w-tier) D=$OUT/tier;; hieb) D=$OUT/hieb;; takt|d-takt) D=$OUT/takt;; *) D=$OUT/gehen;; esac; mkdir -p $D; WD=$D
  LISTE=$(folge "${LAEUFE:-A1 B1 A2 B2}"); offen=""
  for N in $LISTE; do [ -s $(fertig $N) ] && say "$Z-$N steht schon" || offen="$offen $N"; done
  [ -z "$offen" ] && continue
  t0=$(date +%s); stopp; SMI=""
  boot A; boot B
  for N in $offen; do fenster $N; done
  # VERLÄNGERUNG IM WARMEN: nach dem ersten 2+2 urteilt urteil.cjs; verlängert die Zelle, folgen B3 A3 A4 B4 in denselben Welten
  if [ -z "${LAEUFE:-}" ] && [ -f $H/urteil.cjs ]; then
    node $H/urteil.cjs $OUT $Z --json $OUT/urteil-warm-$Z.json > /dev/null 2>&1
    if [ "$(node -e 'try { console.log(require(process.argv[1]).ergebnisse[0].verlaengern ? 1 : 0) } catch (e) { console.log(0) }' "$(cygpath -m $OUT/urteil-warm-$Z.json)")" = 1 ]; then
      say "$Z verlängert im Warmen auf 4+4"
      for N in $(folge "A3 B3 A4 B4"); do [ -s $(fertig $N) ] || fenster $N; done
    fi
  fi
  ende_warm
  say "$Z warm $(( $(date +%s) - t0 )) s"
done
say "SERIE ENDE A-status[$(git -C $A status --porcelain | wc -l)] B-status[$(git -C $B status --porcelain | wc -l)]"

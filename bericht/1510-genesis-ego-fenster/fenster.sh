#!/bin/bash
# GENESIS EGO, DAS BOOT-FENSTER (15.10.): mit der festen Folge (Dorf-Zug ab dem ersten Skript gesperrt) läuft 49824a19 an Genesis
# Ego 78 fps — die alte Folge, die den Haken erst NACH dem Boot schloss, maß dieselbe Band-Szene (334k, gleiche Klassen) bei
# 72–74 fps, seit e8a370ad. Die Frage: was stoßen die Spiel-Takte unter offenem Haken (`__anazhAutoSettlement`: Dorf-Zug UND
# `_tickGenesisOrt`) an, das danach je Frame kostet? Je Kopf EINE Welt (Instrument abab-p015 + messfolge-ruhe lokal, `start --ort
# genesis`): einschwingen · lauf 30 (Basis) · nur der Genesis-Ort-Takt + lauf 30 · lauf 30 · Haken offen + lauf 30 (alle Takte wie im
# Spiel) · Haken zu + lauf 30 (danach) ·
# lauf 30 (danach 2), je Phase der Zustand (Dorf-Schlange, Zellen, Vorschauen, Foundry). Köpfe C 0bbee8fc · E e8a370ad · A
# 49824a19, Folge C E A A E C. Wartet auf das Ende der k69d8-Serie, unter dem GPU-Schloss.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1510ge; LOG=$H/fortschritt.log; INS=$BASE/abab-p015; D=$H/fenster
until grep -q "SERIE FERTIG" $BASE/p3/k1510k69d8/fortschritt.log 2>/dev/null; do sleep 30; done
. $BASE/p3/gpu-schloss.sh; schloss_nehmen "omen-genesis-ego fenster"; trap 'schloss_loesen "omen-genesis-ego fenster"' EXIT
say() { echo "$(date +%T) $*" | tee -a $LOG; }
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; mkdir -p $D
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 2; }
baum() { case $1 in C*) echo $BASE/abab-p0bb;; E*) echo $BASE/abab-pe8a;; A*) echo $BASE/abab-p498;; esac; }
ZUSTAND='const q = r._autoSettlementQueue; const wm = r.state.worldMeta || {}; const f = r._foundry; const pv = r.state.architectures ? r.state.architectures.filter((e) => e && /preview|vorschau/i.test(e.id || e.type || "")).map((e) => e.id || e.type) : []; return { haken: window.__anazhAutoSettlement, dorfWaechst: q ? (q.plan && q.plan.slots ? q.idx + "/" + q.plan.slots.length : 1) : null, dorfExport: r._autoSettlementPendingKey || null, zellen: Object.keys(wm.settlementCells || {}), vorschauen: pv.slice(0, 12), nVorschauen: pv.length, foundryWarte: f && f.warte ? f.warte.length : null, foundryImFlug: f && f.pending ? f.pending.size : null, architekturen: (r.state.architectures || []).length };'
say "FENSTER START Instrument=$(git -C $INS log -1 --format=%h)+messfolge-ruhe"
for N in C1 E1 A1 A2 E2 C2; do
  [ -f $D/$N-danach2.txt ] && continue
  WT=$(baum $N); stopp
  mkdir -p $D/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$N/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $D/$N-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort genesis > $D/$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
  say "$N start ($(git -C $WT log -1 --format=%h))"
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort genesis --sicht ego > $D/$N-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $D/$N-ein.txt 2>&1
  $W eval "$ZUSTAND" > $D/$N-z0.txt 2>&1
  $W lauf 30 --ein 2 --regler voll --tiere frei > $D/$N-basis.txt 2>&1
  # getrennt: NUR der Genesis-Ort-Takt (Portal-Ring, Vorschau-Prefetch, Await-Book), 1×/s mit kurz offenem Haken — der
  # Dorf-Zug sieht den Haken nie offen
  $W eval "window.__gOrtIv = setInterval(() => { window.__anazhAutoSettlement = true; try { r._tickGenesisOrt(performance.now()); } finally { window.__anazhAutoSettlement = false; } }, 1000); return true" > /dev/null 2>&1
  $W lauf 30 --ein 2 --regler voll --tiere frei > $D/$N-gort.txt 2>&1
  $W eval "clearInterval(window.__gOrtIv); return true" > /dev/null 2>&1
  $W eval "$ZUSTAND" > $D/$N-zg.txt 2>&1
  $W lauf 30 --ein 2 --regler voll --tiere frei > $D/$N-nachgort.txt 2>&1
  $W eval "delete window.__anazhAutoSettlement; return true" > /dev/null 2>&1
  $W lauf 30 --ein 2 --regler voll --tiere frei > $D/$N-offen.txt 2>&1
  $W eval "window.__anazhAutoSettlement = false; return true" > /dev/null 2>&1
  $W eval "$ZUSTAND" > $D/$N-z1.txt 2>&1
  $W lauf 30 --ein 2 --regler voll --tiere frei > $D/$N-danach.txt 2>&1
  $W lauf 30 --ein 2 --regler voll --tiere frei > $D/$N-danach2.txt 2>&1
  $W eval "$ZUSTAND" > $D/$N-z2.txt 2>&1
  stopp; say "$N ende"; sleep 30
done
say "FENSTER FERTIG"

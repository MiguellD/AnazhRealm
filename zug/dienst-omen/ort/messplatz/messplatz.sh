#!/bin/bash
# p3/messplatz.sh — der GTX-Messplatz als Dienst (Gesetz: koordination zug/messplatz.md, 23.10.). Ohne LLM in der Schleife:
#   1. fetch origin koordination; zug/warteschlange.txt und zug/erledigt.txt von origin/koordination lesen
#   2. die erste offene Zeile nach prio (offen = id nicht in erledigt, nicht storniert; gleiche prio = Reihenfolge der Datei)
#   3. fahren: abab (serie.sh je Zelle 2+2, urteil.cjs verlängert nur Zellen zwischen 1σ und 2σ oder mit Kern-Anschlag auf 4+4),
#      station (Skript unter zug/ am Baum); die Art punkte ist seit 15.11. STILLGELEGT (ROT beim Namen, siehe stillgelegt)
#   4. <id> <urteil> <kurz> nach zug/erledigt.txt, bei abab die Urteil-Zeile nach zug/abab.txt, Bericht bericht/<id>.md + bericht/<id>/
#   5. commit, pull --rebase, push; nichts offen → 60 s schlafen
# Bäume: git worktree add am SHA unter p3/mp-baum/<sha8> (node_modules als Junction auf den Spiel-Klon), sauber geprüft.
# Die Sitzung liest MELDEN-Zeilen in dienst.log (LANGSAMER, UNENTSCHIEDEN, Absturz, Seiten-Wache, Schloss > 2 h). Start: messplatz-start.sh
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/messplatz; KLON=$BASE/AnazhRealm-mess; MK=$H/koord
LOG=$H/dienst.log; mkdir -p $H/lauf $BASE/p3/mp-baum
. $BASE/p3/gpu-schloss.sh
say() { echo "$(date '+%F %T') $*" >> $LOG; }
melde() { say "MELDEN $*"; }
# RÜCKZUG (Koordinator 28.10.): scheitert Rebase oder gruppen, wartet der Dienst 60 s, verdoppelnd bis 15 min, und meldet nach dem
# 3. Fehlschlag derselben Ursache EINMAL „MELDEN <id>: <Ursache>“ nach zug/fortschritt.txt (vorher 3-s-Takt: takt18c drehte 2 h, 2173 Zeilen)
RZ=$H/rueckzug.txt # Zeile 1 „<id>|<Ursache>“, Zeile 2 die Fehlschläge in Folge
rueckzug() { # $1 id, $2 Ursache
  local k="$1|$2" n=0 w
  [ "$(sed -n 1p $RZ 2>/dev/null)" = "$k" ] && n=$(sed -n 2p $RZ)
  n=$((n + 1)); printf '%s\n%s\n' "$k" $n > $RZ
  if [ $n -gt 5 ]; then w=900; else w=$((60 << (n - 1))); [ $w -gt 900 ] && w=900; fi
  [ $n = 3 ] && { melde "$1: $2"; fortschritt "MELDEN $1: $2"; }
  say "$1 Rückzug $n: $2 — Pause $w s"
  while [ $w -gt 0 ]; do sleep 60; w=$((w - 60)); git -C $MK fetch -q origin koordination 2>>$LOG; storniert "$1" && break; done
}
rueckzug_aus() { rm -f $RZ; }

baum() { # $1 sha40 -> Pfad eines sauberen Baums am SHA
  local s=$1 d=$BASE/p3/mp-baum/${1:0:8}
  if [ ! -e "$d/.git" ]; then
    git -C $KLON fetch -q origin 2>>$LOG
    git -C $KLON worktree add -q --detach "$d" "$s" 2>>$LOG || return 1
  fi
  [ -e "$d/node_modules" ] || powershell -NoProfile -Command "New-Item -ItemType Junction -Path '$(cygpath -w "$d/node_modules")' -Target '$(cygpath -w "$KLON/node_modules")' | Out-Null" 2>>$LOG || return 1
  [ "$(git -C "$d" rev-parse HEAD)" = "$s" ] || git -C "$d" checkout -q --detach --force "$s" 2>>$LOG || return 1
  [ -z "$(git -C "$d" status --porcelain)" ] || { say "Baum $d nicht sauber"; return 1; }
  echo "$d"
}

koord_frisch() { # der Dienst-Baum der Koordination auf origin/koordination (er schreibt nur zug/abab.txt, zug/erledigt.txt, bericht/<id>*)
  [ -e "$MK/.git" ] || git -C $KLON worktree add -q --detach "$MK" origin/koordination 2>>$LOG
  git -C $MK fetch -q origin koordination 2>>$LOG && git -C $MK checkout -q --detach --force origin/koordination 2>>$LOG && git -C $MK clean -fdq 2>>$LOG
}
koord_push() { # $1 Nachricht; drei Versuche (ein Koordinator-Push dazwischen: neu aufsetzen)
  # 31.10.: Betreff einzeilig, höchstens 200 Zeichen — takt-z110a trug die git-status-Liste (2170 Zeilen) im Betreff,
  # commit brach mit „Argument list too long“ ab, erledigt kam nie an, der Auftrag startete 50 min lang alle 15 s neu
  local i m; m=$(printf '%s' "$1" | head -1 | cut -c1-200)
  [ -f $MK/zug/fortschritt.txt ] && git -C $MK add zug/fortschritt.txt 2>>$LOG
  git -C $MK add -A zug/abab.txt zug/erledigt.txt bericht 2>>$LOG
  git -C $MK -c core.autocrlf=false commit -q -m "$m

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" 2>>$LOG || return 1
  for i in 1 2 3; do
    git -C $MK push -q origin HEAD:koordination 2>>$LOG && return 0
    git -C $MK fetch -q origin koordination 2>>$LOG; git -C $MK rebase -q origin/koordination 2>>$LOG || { git -C $MK rebase --abort 2>/dev/null; return 1; }
  done
  return 1
}
fortschritt() { # $* die Zeile ohne Zeit -> zug/fortschritt.txt auf koordination, sofort gepusht (Koordinator 25.10.: Fortschritt in
  # Minuten statt am Auftragsende, ein Hänger fällt nach einer Station auf); scheitert der Push, bleibt die Zeile in p3/messplatz/fortschritt.txt
  local z="$(date '+%F %T') $*"
  echo "$z" >> $H/fortschritt.txt
  { koord_frisch && echo "$z" >> $MK/zug/fortschritt.txt && koord_push "Messplatz fortschritt: $*"; } || say "fortschritt-Push scheiterte: $*"
}
minuten() { awk -v a="$1" -v b="$(date +%s)" 'BEGIN { printf "%.1f", (b - a) / 60 }'; } # $1 Start (s)
zelle_urteil() { # $1 out, $2 zelle -> "<urteil> <A>+<B>" dieser einen Zelle
  node $H/urteil.cjs $1 "$2" --json $1/urteil-zelle.json --md $1/urteil-zelle.md > /dev/null 2>&1
  node -e 'try { const e = require(process.argv[1]).ergebnisse[0]; console.log(e.urteil + " " + e.n.A + "+" + e.n.B) } catch (x) { console.log("? ?") }' "$(cygpath -m $1/urteil-zelle.json)"
}
erledigt() { # $1 id, $2 urteil, $3 kurz (eine Zeile, höchstens 300 Zeichen)
  printf '%s %s %s\n' "$1" "$2" "$(printf '%s' "$3" | tr '\r\n' '  ' | cut -c1-300)" >> $MK/zug/erledigt.txt
}
# NEUSTART-ZÄHLER (Koordinator 31.10.): derselbe Auftrag ohne neues Ereignis (gleiche Spur in lauf/) zum 3. Mal gewählt -> laut ABBRUCH
NZ=$H/neustarts.txt # „<id> <spur> <n>“
spur() { cat $H/lauf/$1.stationen $H/lauf/$1/fortschritt.log 2>/dev/null | md5sum | cut -c1-12; }
neustart_zaehlen() { # $1 id -> exit 0, wenn abgebrochen werden muss
  local s n=1 a; s=$(spur "$1"); a=$(cat $NZ 2>/dev/null)
  [ "${a% *}" = "$1 $s" ] && n=$((${a##* } + 1))
  echo "$1 $s $n" > $NZ; [ $n -ge 3 ]
}

waehle() { # die erste offene Zeile nach prio -> "id prio art rest"
  local q e
  q=$(git -C $MK show origin/koordination:zug/warteschlange.txt 2>/dev/null) || return 1
  e=$(git -C $MK show origin/koordination:zug/erledigt.txt 2>/dev/null | awk '{print $1}')
  printf '%s\n' "$q" | awk -v erl="$(printf '%s ' $e)" '
    BEGIN { n = split(erl, E, " "); for (i = 1; i <= n; i++) fertig[E[i]] = 1 }
    /^[[:space:]]*#/ || NF < 3 { next }
    $2 == "0" && $3 == "storno" { storno[$1] = 1; next }
    { z[++k] = $0; id[k] = $1; pr[k] = $2 + 0 }
    END { best = 0; for (i = 1; i <= k; i++) if (!fertig[id[i]] && !storno[id[i]] && pr[i] > 0 && (!best || pr[i] < pr[best])) best = i; if (best) print z[best] }'
}
storniert() { # $1 id — steht eine Storno-Zeile in der Warteschlange (origin/koordination, der Rufer holt frisch)?
  git -C $MK show origin/koordination:zug/warteschlange.txt 2>/dev/null | awk -v i="$1" '$1 == i && $2 == "0" && $3 == "storno" { f = 1 } END { exit !f }'
}
wert() { echo "$2" | tr ' ' '\n' | sed -n "s/^$1=//p" | head -1; }

fahre_abab() { # $1 id, $2 rest
  local id=$1 A B a b out zl u z
  A=$(wert A "$2"); B=$(wert B "$2"); zl=$(wert zellen "$2"); zl=${zl:-w-ego,g-third,d-ego}
  a=$(baum $A) || { melde "$id Baum A $A fehlt"; return 2; }; b=$(baum $B) || { melde "$id Baum B $B fehlt"; return 2; }
  out=$H/lauf/$id; mkdir -p $out
  export MP_A=$a MP_B=$b MP_OUT=$out MP_LOCK=omen-mp MP_LABEL="A ${A:0:8} · B ${B:0:8}"
  # die Serie schreibt ihre VORFAHRT-Zeilen selbst und fragt je Boot nach dem Storno (25.10.)
  export MP_ID=$id H MK KLON; export -f fortschritt koord_frisch koord_push minuten storniert
  say "$id ABAB A=${A:0:8} B=${B:0:8} zellen=$zl"
  local k n=0 t; k=$(echo ${zl//,/ } | wc -w); : > $out/serie.out
  fortschritt "$id START $k Zellen"
  for z in ${zl//,/ }; do
    n=$((n + 1)); t=$(date +%s)
    ZELLEN=$z bash $H/serie.sh >> $out/serie.out 2>&1 || { grep -q "SEITEN-WACHE" $out/fortschritt.log && { melde "$id Seiten-Wache ROT"; break; }; }
    git -C $MK fetch -q origin koordination 2>>$LOG; storniert "$id" && { say "$id storniert - Abbruch in $z"; fortschritt "$id STORNO in $z"; return 0; }
    set -- $(zelle_urteil $out $z); fortschritt "$id $z $1 $(minuten $t) · $n/$k ($2)"
  done
  u=$(node $H/urteil.cjs $out "$zl" --json $out/urteil.json --md $out/urteil.md)
  for z in $(node -e 'const j=require(process.argv[1]);console.log(j.ergebnisse.filter(e=>e.verlaengern).map(e=>e.zelle).join(" "))' "$(cygpath -m $out/urteil.json)"); do
    say "$id verlängert $z auf 4+4"; t=$(date +%s)
    ZELLEN=$z LAEUFE="A3 B3 A4 B4" bash $H/serie.sh >> $out/serie.out 2>&1
    git -C $MK fetch -q origin koordination 2>>$LOG; storniert "$id" && { say "$id storniert - Abbruch in $z(4+4)"; fortschritt "$id STORNO in $z(4+4)"; return 0; }
    set -- $(zelle_urteil $out $z); fortschritt "$id $z(4+4) $1 $(minuten $t) · verlängert ($2)"
  done
  u=$(node $H/urteil.cjs $out "$zl" --json $out/urteil.json --md $out/urteil.md)
  URTEIL=$(node -e 'const g=require(process.argv[1]).gesamt;console.log(g==="VERLÄNGERN"?"UNENTSCHIEDEN":g)' "$(cygpath -m $out/urteil.json)")
  KURZ="abab ${B:0:8} gegen ${A:0:8}: $(node -e 'const j=require(process.argv[1]);console.log(j.ergebnisse.map(e=>e.zelle+" "+e.n.A+"+"+e.n.B+" "+e.urteil).join(" · "))' "$(cygpath -m $out/urteil.json)")"
  koord_frisch
  printf '%s %s %s\n' "$B" "$URTEIL" "$id" >> $MK/zug/abab.txt
  erledigt "$id" "$URTEIL" "$KURZ"
  mkdir -p $MK/bericht/$id; cp $out/fortschritt.log $out/urteil.json $MK/bericht/$id/ 2>/dev/null
  for d in gehen fahrt takt hieb; do [ -d $out/$d ] && { mkdir -p $MK/bericht/$id/$d; cp $out/$d/*.txt $out/$d/*.md $out/$d/*.json $MK/bericht/$id/$d/ 2>/dev/null; }; done
  { echo "# $id — ABAB ${B:0:8} gegen ${A:0:8}: $URTEIL"; echo; echo "GTX 1060, \`--echt\` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = $A, B = $B, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung)."; echo; cat $out/urteil.md; echo; echo "Roh: \`bericht/$id/\`."; } > $MK/bericht/$id.md
  koord_push "Messplatz $id: ${B:0:8} $URTEIL gegen ${A:0:8} ($zl)" || melde "$id push nach koordination scheiterte"
  case $URTEIL in LANGSAMER|UNENTSCHIEDEN) melde "$id $URTEIL — $KURZ";; esac
  say "$id fertig $URTEIL"
}

# STILLGELEGT (Koordinator Konto 14, 15.11.2026): die Auftragsart `punkte` fuhr punkte.cjs im Baum koord-punkte und buchte von dort nach
# punkte-maschine. Der Baum stand seit dem 12.11. unsauber (jede Zeile dieser Art endete im stillen Rückzug „Rebase scheiterte“, zuletzt
# karte2-gtx-1 sechsmal) und ist seit dem 15.11. fort. EIN Weg misst Punkte: landung-dienst + Punkte-Sitzung (n0611-pm). Eine Zeile
# dieser Art endet darum EINMAL und laut: ROT beim Namen in zug/erledigt.txt, MELDEN in dienst.log — nie wieder ein Rückzug ohne Ende.
stillgelegt() { # $1 id
  say "$1 ROT: die Auftragsart punkte ist stillgelegt"
  koord_frisch
  erledigt "$1" "ROT" "die Auftragsart punkte der Warteschlange ist STILLGELEGT (Koordinator 15.11.) - nichts gemessen; Punkte misst EIN Weg: landung-dienst + Punkte-Sitzung (zug/sitzung.txt)"
  if koord_push "Messplatz $1: ROT - die Auftragsart punkte ist stillgelegt"; then rueckzug_aus; melde "$1 ROT - die Auftragsart punkte ist stillgelegt"; return 0; fi
  rueckzug "$1" "ROT-Push nach koordination scheitert (Auftragsart punkte stillgelegt)"; return 3
}

fahre_station() { # $1 id, $2 rest
  local id=$1 S lauf b out r
  S=$(wert sha "$2"); lauf=$(wert lauf "$2")
  b=$(baum $S) || { melde "$id Baum $S fehlt"; return 2; }
  out=$H/lauf/$id; mkdir -p $out
  koord_frisch
  [ -f "$MK/zug/$lauf" ] || { melde "$id zug/$lauf fehlt"; return 2; }
  cp "$MK/zug/$lauf" $out/lauf.sh
  say "$id STATION $lauf an ${S:0:8}"; local t=$(date +%s)
  fortschritt "$id START 1 Stationen"
  (cd $b && BAUM=$b OUT=$out bash $out/lauf.sh > $out/station.out 2>&1); r=$?
  fortschritt "$id $lauf Exit$r $(minuten $t) · 1/1"
  koord_frisch
  erledigt "$id" "Exit$r" "station $lauf an ${S:0:8}"
  mkdir -p $MK/bericht/$id; cp -r $out/. $MK/bericht/$id/ 2>/dev/null; rm -rf $MK/bericht/$id/stand # die Spielstände der Boots (omen-z13-takt: 7,4 MB) bleiben auf der OMEN
  koord_push "Messplatz $id: Station $lauf an ${S:0:8} Exit $r" || melde "$id push nach koordination scheiterte"
  say "$id fertig Exit $r"
}

# DER SELBSTTEST (--selbsttest; ohne Netz, in einem Temp-Ordner, koord_frisch und koord_push sind Attrappen): (a) eine Zeile der Art
# punkte endet ROT beim Namen — erledigt.txt trägt „<id> ROT … STILLGELEGT“, das Log MELDEN, Exit 0, kein Rückzug; (b) scheitert der
# Push, steht der Rückzug mit Ursache und Exit 3 (die Zeile bleibt offen und laut); (c) die Mutante „stiller Rückzug“ (die Art bis
# 15.11.: nur ein Rückzug, keine erledigt-Zeile) muss an (a) ROT werden.
selbsttest() {
  local X rot=0 r
  X=$(mktemp -d); H=$X; MK=$X/koord; LOG=$X/dienst.log; RZ=$X/rueckzug.txt; mkdir -p $MK/zug
  koord_frisch() { :; }; fortschritt() { echo "$*" >> $X/fortschritt.txt; }; sleep() { :; }; storniert() { return 0; }
  koord_push() { echo "$1" >> $X/push.txt; }
  laut() { # $1 id, $2 Exit -> 0, wenn die Zeile einmal und laut endete
    [ "$2" = 0 ] && grep -q "^$1 ROT die Auftragsart punkte der Warteschlange ist STILLGELEGT" $MK/zug/erledigt.txt 2>/dev/null &&
      grep -q "MELDEN $1 ROT" $LOG && [ ! -f $RZ ] && grep -q "Messplatz $1: ROT" $X/push.txt 2>/dev/null
  }
  stillgelegt probe-a; r=$?
  if laut probe-a $r; then echo "OK a  punkte endet ROT beim Namen: $(cut -c1-70 $MK/zug/erledigt.txt)"; else echo "ROT a  Exit $r · erledigt: $(cat $MK/zug/erledigt.txt 2>/dev/null | cut -c1-80)"; rot=1; fi
  koord_push() { return 1; }
  stillgelegt probe-b; r=$?
  if [ $r = 3 ] && grep -q "^probe-b|ROT-Push nach koordination scheitert" $RZ 2>/dev/null && grep -q "probe-b Rückzug 1" $LOG; then echo "OK b  Push scheitert: Rückzug mit Ursache, Exit 3"; else echo "ROT b  Exit $r · $(head -1 $RZ 2>/dev/null)"; rot=1; fi
  rm -f $RZ
  stillgelegt() { rueckzug "$1" "punkte-maschine: Rebase scheiterte"; return 3; } # die Mutante: der stille Rückzug bis 15.11.
  stillgelegt probe-c; r=$?
  if laut probe-c $r; then echo "ROT c  Mutante „stiller Rückzug“ bleibt GRÜN"; rot=1; else echo "OK c  Mutante „stiller Rückzug“ ROT: keine erledigt-Zeile, Exit $r"; fi
  rm -rf "$X"
  if [ $rot = 0 ]; then echo "messplatz.sh SELBSTTEST GRÜN (a ROT beim Namen, b Push scheitert, c Mutante)"; else echo "messplatz.sh SELBSTTEST ROT"; fi
  return $rot
}
[ "$1" = "--selbsttest" ] && { selbsttest; exit $?; }
# Probe ohne Fahrt: --waehle zeigt die nächste offene Zeile
[ "$1" = "--waehle" ] && { koord_frisch; waehle; exit 0; }
[ "$1" = "--baum" ] && { baum "$2"; exit $?; }
say "DIENST START pid $$"
while :; do
  # dienst.log rotiert zwischen zwei Aufträgen ab 2 MB, eine Generation dienst.log.1 (28.10.: 2,2 MB, fast nur Wiederholungen)
  [ "$(stat -c %s $LOG 2>/dev/null || echo 0)" -gt 2097152 ] && { mv -f $LOG $LOG.1; say "dienst.log rotiert (alt: dienst.log.1)"; }
  koord_frisch || { say "fetch scheiterte"; sleep 60; continue; }
  # ein Schloss älter als 2 h meldet die Sitzung (der Runner-Hook löst nach 30 min Stille selbst)
  if [ -f "$GPU_SCHLOSS/besitzer.txt" ] && [ $(( $(date +%s) - $(stat -c %Y "$GPU_SCHLOSS/besitzer.txt") )) -gt 7200 ]; then
    melde "Schloss '$(cat "$GPU_SCHLOSS/besitzer.txt")' älter als 2 h"
  fi
  Z=$(waehle)
  if [ -z "$Z" ]; then sleep 60; continue; fi
  set -- $Z; ID=$1; ART=$3; REST="${Z#* * * }"
  # nach einem Rückzug (rc 3) zählt die Wiederwahl nicht — der Rückzug wartet und meldet selbst
  if [ "${rc:-0}" != 3 ] && neustart_zaehlen "$ID"; then
    say "$ID ABBRUCH: 3. Start ohne Fortschritt"; koord_frisch
    erledigt "$ID" "ABBRUCH" "3 Starts ohne Fortschritt (Spur lauf/$ID unverändert), siehe p3/messplatz/dienst.log"
    if koord_push "Messplatz $ID: ABBRUCH nach 3 Starts ohne Fortschritt"; then melde "$ID ABBRUCH — 3 Starts ohne Fortschritt"; fortschritt "MELDEN $ID ABBRUCH — 3 Starts ohne Fortschritt"; rm -f $NZ
    else rueckzug "$ID" "ABBRUCH-Push nach koordination scheitert"; fi
    rc=0; continue
  fi
  echo "$ID" > $H/laeuft.txt
  case $ART in
    abab) fahre_abab "$ID" "$REST" ;;
    punkte) stillgelegt "$ID" ;;
    station) fahre_station "$ID" "$REST" ;;
    *) koord_frisch; erledigt "$ID" "UNBEKANNT" "art $ART"; koord_push "Messplatz $ID: art $ART unbekannt"; melde "$ID art $ART unbekannt" ;;
  esac
  rc=$?
  if [ $rc = 2 ]; then koord_frisch; erledigt "$ID" "ABSTURZ" "Baum oder Lauf fehlt"; koord_push "Messplatz $ID: ABSTURZ (Baum oder Lauf fehlt)"; fi
  rm -f $H/laeuft.txt
done

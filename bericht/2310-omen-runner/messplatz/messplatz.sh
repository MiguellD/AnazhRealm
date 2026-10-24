#!/bin/bash
# p3/messplatz.sh — der GTX-Messplatz als Dienst (Gesetz: koordination zug/messplatz.md, 23.10.). Ohne LLM in der Schleife:
#   1. fetch origin koordination punkte-maschine; zug/warteschlange.txt und zug/erledigt.txt von origin/koordination lesen
#   2. die erste offene Zeile nach prio (offen = id nicht in erledigt, nicht storniert; gleiche prio = Reihenfolge der Datei)
#   3. fahren: abab (serie.sh je Zelle 2+2, urteil.cjs verlängert nur Zellen zwischen 1σ und 2σ oder mit Kern-Anschlag auf 4+4),
#      punkte (punkte.cjs run am SHA aus koord-punkte, Mess-Datei nach punkte-maschine), station (Skript unter zug/ am Baum)
#   4. <id> <urteil> <kurz> nach zug/erledigt.txt, bei abab die Urteil-Zeile nach zug/abab.txt, Bericht bericht/<id>.md + bericht/<id>/
#   5. commit, pull --rebase, push; nichts offen → 60 s schlafen
# Bäume: git worktree add am SHA unter p3/mp-baum/<sha8> (node_modules als Junction auf den Spiel-Klon), sauber geprüft.
# Die Sitzung liest MELDEN-Zeilen in dienst.log (LANGSAMER, UNENTSCHIEDEN, Absturz, Seiten-Wache, Schloss > 2 h). Start: messplatz-start.sh
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/messplatz; KLON=$BASE/AnazhRealm-mess; MK=$H/koord; PK=$BASE/koord-punkte
LOG=$H/dienst.log; mkdir -p $H/lauf $BASE/p3/mp-baum
. $BASE/p3/gpu-schloss.sh
say() { echo "$(date '+%F %T') $*" >> $LOG; }
melde() { say "MELDEN $*"; }

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
  local i
  git -C $MK add -A zug/abab.txt zug/erledigt.txt bericht 2>>$LOG
  git -C $MK -c core.autocrlf=false commit -q -m "$1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" 2>>$LOG || return 1
  for i in 1 2 3; do
    git -C $MK push -q origin HEAD:koordination 2>>$LOG && return 0
    git -C $MK fetch -q origin koordination 2>>$LOG; git -C $MK rebase -q origin/koordination 2>>$LOG || { git -C $MK rebase --abort 2>/dev/null; return 1; }
  done
  return 1
}
erledigt() { # $1 id, $2 urteil, $3 kurz
  printf '%s %s %s\n' "$1" "$2" "$3" >> $MK/zug/erledigt.txt
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
waehle_prio1() { # die erste offene prio-1-Zeile (die Vorfahrt in einem Punkte-Auftrag, Koordinator 23.10.)
  git -C $MK fetch -q origin koordination 2>>$LOG
  waehle | awk '$2 == "1"'
}
wert() { echo "$2" | tr ' ' '\n' | sed -n "s/^$1=//p" | head -1; }

fahre_abab() { # $1 id, $2 rest
  local id=$1 A B a b out zl u z
  A=$(wert A "$2"); B=$(wert B "$2"); zl=$(wert zellen "$2"); zl=${zl:-w-ego,g-third,d-ego}
  a=$(baum $A) || { melde "$id Baum A $A fehlt"; return 2; }; b=$(baum $B) || { melde "$id Baum B $B fehlt"; return 2; }
  out=$H/lauf/$id; mkdir -p $out
  export MP_A=$a MP_B=$b MP_OUT=$out MP_LOCK=omen-mp MP_LABEL="A ${A:0:8} · B ${B:0:8}"
  say "$id ABAB A=${A:0:8} B=${B:0:8} zellen=$zl"
  ZELLEN="${zl//,/ }" bash $H/serie.sh > $out/serie.out 2>&1 || { grep -q "SEITEN-WACHE" $out/fortschritt.log && melde "$id Seiten-Wache ROT"; }
  u=$(node $H/urteil.cjs $out "$zl" --json $out/urteil.json --md $out/urteil.md)
  for z in $(node -e 'const j=require(process.argv[1]);console.log(j.ergebnisse.filter(e=>e.verlaengern).map(e=>e.zelle).join(" "))' "$(cygpath -m $out/urteil.json)"); do
    say "$id verlängert $z auf 4+4"
    ZELLEN=$z LAEUFE="A3 B3 A4 B4" bash $H/serie.sh >> $out/serie.out 2>&1
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

fahre_punkte() { # $1 id, $2 rest — Station für Station (`--nur <id>`); vor jeder Station die Vorfahrt einer offenen prio-1-Zeile
  local id=$1 S nur s8 g r=0 ids st fertig=$H/lauf/$1.stationen v
  S=$(wert sha "$2"); nur=$(wert nur "$2"); s8=${S:0:8}
  say "$id PUNKTE sha=$s8 ${nur:+nur=$nur}"
  git -C $PK fetch -q origin punkte-maschine 2>>$LOG; git -C $PK rebase -q origin/punkte-maschine 2>>$LOG || git -C $PK rebase --abort 2>/dev/null
  if [ -n "$nur" ]; then ids=${nur//,/ }; else ids=$(cd $PK && node meisterkarte-quelle/punkte/punkte.cjs liste 2>/dev/null | grep -E "^  [a-z]+[.]K[0-9]+#[0-9]+ · [a-z+]*gtx" | awk '{print $1}'); fi
  touch $fertig
  for st in $ids; do
    grep -qx "$st" $fertig && continue
    v=$(waehle_prio1)
    if [ -n "$v" ]; then
      say "$id pausiert vor $st: Vorfahrt $(echo "$v" | awk '{print $1}')"
      set -- $v; case $3 in abab) fahre_abab "$1" "${v#* * * }" ;; station) fahre_station "$1" "${v#* * * }" ;; esac
      say "$id setzt fort"
    fi
    (cd $PK && PUNKTE_GPU_LAUF=$(cygpath -m $BASE/p3/gpu-lauf.sh) node meisterkarte-quelle/punkte/punkte.cjs run --sha $S --geraet gtx --nur "$st" >> $H/lauf/$id.out 2>&1) || r=$?
    echo "$st" >> $fertig
  done
  g=$(node -e 'try{const j=require(process.argv[1]);const v=Object.values(j.je||{});console.log(v.filter(x=>x.gruen).length+" grün / "+v.filter(x=>!x.gruen).length+" rot")}catch(e){console.log("keine Mess-Datei")}' "$(cygpath -m $PK/meisterkarte-quelle/punkte/messung/$s8-gtx.json)")
  git -C $PK add meisterkarte-quelle/punkte/messung/$s8-gtx.json 2>>$LOG
  find $PK/meisterkarte-quelle/punkte/messung/roh/$s8-gtx -name "*.out" -size -5M 2>/dev/null | while read -r f; do git -C $PK add "$f" 2>>$LOG; done
  git -C $PK -c core.autocrlf=false commit -q -m "Punkte-Messung $s8 gtx: $g ($id)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" 2>>$LOG
  for i in 1 2 3; do git -C $PK push -q origin HEAD:punkte-maschine 2>>$LOG && break; git -C $PK fetch -q origin punkte-maschine; git -C $PK rebase -q origin/punkte-maschine 2>>$LOG || git -C $PK rebase --abort; done
  koord_frisch
  erledigt "$id" "gemessen" "punkte $s8 gtx: $g"
  mkdir -p $MK/bericht/$id; cp $H/lauf/$id.out $MK/bericht/$id/ 2>/dev/null
  koord_push "Messplatz $id: Punkte $s8 gtx $g" || melde "$id push nach koordination scheiterte"
  say "$id fertig $g"
}

fahre_station() { # $1 id, $2 rest
  local id=$1 S lauf b out r
  S=$(wert sha "$2"); lauf=$(wert lauf "$2")
  b=$(baum $S) || { melde "$id Baum $S fehlt"; return 2; }
  out=$H/lauf/$id; mkdir -p $out
  koord_frisch
  [ -f "$MK/zug/$lauf" ] || { melde "$id zug/$lauf fehlt"; return 2; }
  cp "$MK/zug/$lauf" $out/lauf.sh
  say "$id STATION $lauf an ${S:0:8}"
  (cd $b && BAUM=$b OUT=$out bash $out/lauf.sh > $out/station.out 2>&1); r=$?
  koord_frisch
  erledigt "$id" "Exit$r" "station $lauf an ${S:0:8}"
  mkdir -p $MK/bericht/$id; cp -r $out/. $MK/bericht/$id/ 2>/dev/null
  koord_push "Messplatz $id: Station $lauf an ${S:0:8} Exit $r" || melde "$id push nach koordination scheiterte"
  say "$id fertig Exit $r"
}

# Probe ohne Fahrt: --waehle zeigt die nächste offene Zeile
[ "$1" = "--waehle" ] && { koord_frisch; waehle; exit 0; }
[ "$1" = "--baum" ] && { baum "$2"; exit $?; }
say "DIENST START pid $$"
while :; do
  koord_frisch || { say "fetch scheiterte"; sleep 60; continue; }
  # ein Schloss älter als 2 h meldet die Sitzung (der Runner-Hook löst nach 30 min Stille selbst)
  if [ -f "$GPU_SCHLOSS/besitzer.txt" ] && [ $(( $(date +%s) - $(stat -c %Y "$GPU_SCHLOSS/besitzer.txt") )) -gt 7200 ]; then
    melde "Schloss '$(cat "$GPU_SCHLOSS/besitzer.txt")' älter als 2 h"
  fi
  Z=$(waehle)
  if [ -z "$Z" ]; then sleep 60; continue; fi
  set -- $Z; ID=$1; ART=$3; REST="${Z#* * * }"
  echo "$ID" > $H/laeuft.txt
  case $ART in
    abab) fahre_abab "$ID" "$REST" ;;
    punkte) fahre_punkte "$ID" "$REST" ;;
    station) fahre_station "$ID" "$REST" ;;
    *) koord_frisch; erledigt "$ID" "UNBEKANNT" "art $ART"; koord_push "Messplatz $ID: art $ART unbekannt"; melde "$ID art $ART unbekannt" ;;
  esac
  rc=$?
  if [ $rc = 2 ]; then koord_frisch; erledigt "$ID" "ABSTURZ" "Baum oder Lauf fehlt"; koord_push "Messplatz $ID: ABSTURZ (Baum oder Lauf fehlt)"; fi
  rm -f $H/laeuft.txt
done

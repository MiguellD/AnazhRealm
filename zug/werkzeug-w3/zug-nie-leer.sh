#!/bin/bash
# zug-nie-leer.sh <vorgänger-id> <erste nr> <letzte nr> [--blick] — OHNE LLM („Zug nie leer“ 03.11., „Integration ist der Engpass → bündeln“
# 09.11.): nach jedem Zug-Urteil sammelt das Werkzeug die BEREITEN Abgaben auf w26-*/w27-* und fährt den nächsten Zug über die EINE Schlange
# (zug-schlange6.sh). Bereit heißt, alles zugleich: der Kopf-Betreff beginnt mit „Abgabe“ · der Kopf stand noch in keinem Zug
# (zug-gefahren.txt: ein gefahrener Kopf fährt erst mit neuem Kopf wieder, kein Heil-Karussell) und steht nicht in main · Code-Check am Kopf
# GRÜN · trägt der Betreff [gpu-probe: …], dann die GPU-Probe am Kopf GRÜN („nie sichtbare Änderung ohne Bild landen“) · das Bündel ist
# konfliktfrei und seine WAND-SUMME GRÜN (wand-summe.sh, Lehre z357). Nie -pm-Zweige (sie landen nach ihrem Leser: pm-nach-main.sh).
# Höchstens 4 Zweige je Zug. --blick druckt, was jetzt fahren würde, und fährt nichts. Log: zug-nie-leer.log, Wartende: zug-nie-leer.wartet
R=/c/Users/micha/AnazhRealm-profiband; W=/tmp/claude/w4; L=$W/zug-nie-leer.log; G=$W/zug-gefahren.txt; touch $G
vor="$1"; von="$2"; bis="$3"; blick="$4"
[ -n "$bis" ] || { echo "Aufruf: zug-nie-leer.sh <vorgänger-id> <erste nr> <letzte nr> [--blick]"; exit 2; }
bereit() {
  : > $W/zug-nie-leer.wartet
  git -C $R fetch -q origin "+refs/heads/main:refs/remotes/origin/main" 2>/dev/null
  # NUR w27-*: die alten w26-Abgaben (lack-glas, laub-kante, programm-katalog …) fuhren und fielen schon — sie führe das Werkzeug als Karussell
  git -C $R ls-remote origin 'refs/heads/w27-*' 2>/dev/null > $W/zug-nie-leer.refs
  while read sha ref; do
    b=${ref#refs/heads/}; case "$b" in *-pm) continue ;; esac
    grep -q "^$b $sha$" $G && continue
    git -C $R fetch -q origin "+$ref:refs/remotes/origin/$b" 2>/dev/null
    t=$(git -C $R log -1 --format=%s $sha 2>/dev/null); case "$t" in Abgabe*) ;; *) continue ;; esac
    git -C $R merge-base --is-ancestor $sha origin/main 2>/dev/null && continue
    c=$(bash $W/ci.sh $b < /dev/null 2>&1)
    echo "$c" | grep "Code-Check:" | head -1 | grep -q "completed success" || { echo "$b ${sha:0:8}: Code-Check nicht GRÜN ($(echo "$c" | grep "Code-Check:" | head -1 | cut -c1-80))" >> $W/zug-nie-leer.wartet; continue; }
    # das Bild ist Pflicht, sobald der Zweig das SPIEL berührt — auch ohne Tag im Betreff („nie sichtbare Änderung ohne Bild landen“)
    sp=$(git -C $R diff --name-only origin/main...$sha 2>/dev/null | grep -cE "^(stamm/|worlds/|index[.]html$|[^/]+[.]js$)")
    case "$t" in *"[gpu-probe:"*) sp=1 ;; esac
    [ "$sp" -gt 0 ] && { echo "$c" | grep "GPU-Probe" | head -1 | grep -q "completed success" || { echo "$b ${sha:0:8}: GPU-Probe nicht GRÜN ($(echo "$c" | grep "GPU-Probe" | head -1 | cut -c1-110))" >> $W/zug-nie-leer.wartet; continue; }; }
    echo "$b"
  done < $W/zug-nie-leer.refs
}
buendel() {   # zwei Durchgänge: ein Linsen-Zweig, der allein an der Wand fällt, fährt im zweiten mit den Spiel-Zweigen
  local Z="" b u
  for pass in 1 2; do
    for b in $1; do
      case " $Z " in *" $b "*) continue ;; esac
      [ $(echo $Z | wc -w) -ge 4 ] && break
      u=$(bash $W/wand-summe.sh $Z $b 2>&1 | tail -1)
      case "$u" in "BÜNDEL GRÜN"*) Z="$Z $b" ;; *) [ $pass = 2 ] && echo "$b: bleibt draußen — ${u:0:200}" >> $W/zug-nie-leer.wartet ;; esac
    done
  done
  echo $Z
}
for n in $(seq $von $bis); do
  id="z$n"
  if [ -z "$blick" ]; then
    for i in $(seq 1 1440); do
      grep -qE "\[${vor}w\] (GELANDET|FAHRT ROT)" /tmp/claude/fahre-${vor}w.log 2>/dev/null && break
      grep -qE "^$vor EXIT=9" /tmp/claude/w3/kette-$vor.out 2>/dev/null && break
      sleep 30
    done
    echo "$(date +%H:%M) $vor ende: $(grep -E "\[${vor}w\] (GELANDET|FAHRT ROT)" /tmp/claude/fahre-${vor}w.log 2>/dev/null | tail -1 | cut -c1-200)" >> $L
  fi
  Z=""
  for i in $(seq 1 96); do
    B=$(bereit | tr "\n" " "); [ -n "$B" ] && Z=$(buendel "$B")
    [ -n "$blick" ] && { echo "$id würde fahren: ${Z:-nichts} · bereit: ${B:-nichts}"; echo "wartend:"; cat $W/zug-nie-leer.wartet; exit 0; }
    [ -n "$Z" ] && break; sleep 300
  done
  [ -n "$Z" ] || { echo "$(date +%H:%M) $id: 8 h keine bereite Abgabe — Ende" >> $L; exit 0; }
  for b in $Z; do echo "$b $(git -C $R rev-parse origin/$b)" >> $G; done
  echo "$(date +%H:%M) $id fährt: $Z · bereit waren: $B · wartend: $(tr "\n" "|" < $W/zug-nie-leer.wartet | cut -c1-600)" >> $L
  # die Schlange wartet auf ein URTEIL im w-Log ihres Vorgängers: endete der ohne Zug (EXIT=9), ist der Anker der jüngste Zug mit Urteil
  anker="$vor"
  grep -qE "\[${vor}w\] (GELANDET|FAHRT ROT)" /tmp/claude/fahre-${vor}w.log 2>/dev/null || for f in $(ls /tmp/claude/fahre-z*w.log 2>/dev/null | sort -r); do grep -qE "\] (GELANDET|FAHRT ROT)" $f && { anker=$(basename $f w.log); anker=${anker#fahre-}; break; }; done
  (cd /tmp/claude/w3 && bash /tmp/claude/w3/zug-schlange6.sh ${anker}w "$id:$Z" > /tmp/claude/w3/schlange-$id.out 2>&1)
  vor="$id"
done
echo "$(date +%H:%M) Ende nach z$bis" >> $L

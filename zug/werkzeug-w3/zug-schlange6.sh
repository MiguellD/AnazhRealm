#!/bin/bash
# zug-schlange.sh <vorgänger-id> "<id>:<zweig> <zweig>" ... — fährt Züge NACHEINANDER; jeder wartet auf das EIGENE Urteil seines
# Vorgängers ([zNNN] GELANDET|FAHRT ROT in /tmp/claude/fahre-zNNN.log oder "zNNN EXIT=" in kette-zNNN.out). Lehre 03.11.: ein Muster auf
# „FAHRT ROT“ allein traf die Vorgänger-Zeile im eigenen Log und brach den laufenden Zug ab.
# VOLLPROBE (05.11., Schöpfer „integriere es endlich“): nur ein KONFLIKT mit main hält einen Zweig draußen. Die Vollprobe-ROT des Tages waren
# fast alle main-Wände (Waage, Wackler) oder Netz — sie sperrten vorbau-frei, wackler, profil-leck, ferne still aus (z214 fuhr 1/4, z215 leer).
# VORPRÜFUNG (03.11. 14:50): vor dem Zug liest die Schlange koordination zug/vorpruefung.txt (die OMEN prüft jeden Zweig voll vor);
# ein Zweig, dessen jüngste Zeile für seinen heutigen Kopf ROT sagt, fährt nicht mit (benannt im Log).
cd /tmp/claude/w3
KL=/c/Users/micha/AnazhRealm-profiband
vor="$1"; shift
for auftrag in "$@"; do
  id="${auftrag%%:*}"; zweige="${auftrag#*:}"
  for i in $(seq 1 600); do
    grep -qE "\[$vor\] (GELANDET|FAHRT ROT)" /tmp/claude/fahre-$vor.log 2>/dev/null && break
    grep -qE "^$vor EXIT=" kette-$vor.out 2>/dev/null && break
    sleep 30
  done
  echo "$(date +%H:%M) $vor ende: $(grep -E "\[$vor\] (GELANDET|FAHRT ROT)" /tmp/claude/fahre-$vor.log 2>/dev/null | tail -1 | cut -c1-160)"
  git -C $KL fetch -q origin "+refs/heads/koordination:refs/remotes/origin/koordination" 2>/dev/null
  VP=$(MSYS_NO_PATHCONV=1 git -C $KL show origin/koordination:zug/vorpruefung.txt 2>/dev/null)
  frei=""
  for z in $zweige; do
    sha=$(git -C $KL ls-remote origin "refs/heads/$z" | cut -c1-8)
    vz=$(awk -v z="$z" -v s="$sha" '$1==z && $2==s {u=$3; r=$0} END{print u"|"r}' vollprobe.txt 2>/dev/null)   # die Zweig-Vollprobe (04.11.)
    case "${vz%%|*}" in BAU-ROT) echo "${vz#*|}" | grep -q "Konflikt" || { echo "$(date +%H:%M) $id: $z@$sha Vollprobe-Hinweis (kein Konflikt, der Zug richtet): $(echo "${vz#*|}" | cut -c1-160)"; frei="$frei $z"; continue; }; echo "$(date +%H:%M) $id: $z@$sha VOLLPROBE ${vz%%|*} — fährt nicht mit: $(echo "${vz#*|}" | cut -c1-200)"; continue;; esac
    urteil=$(echo "$VP" | awk -v z="$z" -v s="$sha" '$1==z && $2==s {u=$3} END{print u}')
    if [ "$urteil" = "ROT" ]; then echo "$(date +%H:%M) $id: $z@$sha VORPRÜFUNG ROT — fährt nicht mit"; else frei="$frei $z"; fi
  done
  if [ -z "$frei" ]; then echo "$(date +%H:%M) $id: kein Zweig frei — kein Zug"; echo "$id EXIT=9" > kette-$id.out; vor="$id"; continue; fi
  bash zug-sammler7.sh "$id" 25 $frei > kette-$id.out 2>&1; echo "$id EXIT=$?" >> kette-$id.out   # 03.11.: ein Vorzug-ROT schrieb kein Urteil, die Schlange hing
  echo "$(date +%H:%M) $id gefahren: $(tail -1 kette-$id.out | cut -c1-160)"
  vor="$id"
done

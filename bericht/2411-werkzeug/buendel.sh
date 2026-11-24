#!/bin/bash
# bash buendel.sh <name> <kopf40> <kopf40> [...] [--schub] — EINE Batterie für mehrere grün-reife Abgaben statt einer je Zweig.
# Mischt die Köpfe der Reihe nach per git merge-tree auf main (kein Arbeitsbaum); der letzte Merge trägt den Betreff
# „Vorprüfung <name> 1 (auf main …): Bündel … $TAGS“ (TAGS aus der Umgebung, Vorgabe „[ci voll]“; mit GPU-Probe den Ruf mitgeben).
# Ohne --schub: Trockenlauf (Baum oder der erste Konflikt beim Namen). Mit --schub: vorwärts auf den Zweig <name>.
# Danach wie jede Abgabe: stempel-msg.sh <name> <kopf> <satz> <msg> und stempel.sh; nach der Landung EIN nach-landung.sh mit ALLEN Ansprüchen.
# STAND 24.11.: nur im Trockenlauf gefahren, noch nie im Zug — der erste echte Lauf ist die Probe des Werkzeugs.
set -u; cd /c/Users/micha/AnazhRealm-profiband || exit 2; export MSYS_NO_PATHCONV=1
N=$1; shift; SCHUB=0; K=(); for a in "$@"; do if [ "$a" = "--schub" ]; then SCHUB=1; else K+=("$a"); fi; done
TAGS=${TAGS:-[ci voll]}
M=$(git ls-remote origin refs/heads/main | cut -c1-40); git fetch -q origin "$M" "${K[@]}" || exit 2
C=$M; i=0
for k in "${K[@]}"; do
    i=$((i + 1))
    T=$(git merge-tree --write-tree "$C" "$k" 2>/dev/null) || { echo "KONFLIKT: ${k:0:8} mischt sich nicht in den Stand — dieser Kopf bleibt einzeln:"; git merge-tree --write-tree --name-only "$C" "$k" 2>/dev/null | sed -n '2,6p'; exit 1; }
    if [ $i -lt ${#K[@]} ]; then B="Buendel $N: ${k:0:8} eingemischt"; else B="Vorprüfung $N 1 (auf main ${M:0:8}): Bündel aus ${#K[@]} Abgaben (${K[*]:0:1}…), eine Batterie für alle $TAGS"; fi
    C=$(printf '%s\n\nKöpfe: %s\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n' "$B" "${K[*]}" | git commit-tree "$T" -p "$C" -p "$k")
done
echo "BÜNDEL $N: ${#K[@]} Köpfe auf main ${M:0:8} → Kopf $C"
[ $SCHUB = 1 ] && git push origin "$C:refs/heads/$N" 2>&1 | tail -n 1 || echo "Trockenlauf — nichts geschoben"

#!/bin/bash
# UNTER sh.exe (13.11.): jeder Prozess-Start unter dem installierten bash.exe kostet auf diesem Rechner 1–2,6 s, unter dem
# byte-gleichen sh.exe daneben 30–90 ms (fork-zeit: exec true, Subshell — das Sammeln des Zug-Diensts stand daran 11–18 min je Zug).
# Als sh gerufen schaltet die Zeile nur POSIX ab (volles bash); sonst startet sich das Skript EINMAL unter sh.exe neu.
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# heim.sh <zweig> <sha> — EIN ROTER ZWEIG-CHECK GEHT SOFORT HEIM, ohne LLM. Der Zug-Dienst hält eine Abgabe mit rotem Code-Check
# zu Recht draußen — aber bis 11.11. erfuhr es der Macher nie: w28-blatt-atlas-kalt lag fünf Stunden an einem Format-Umbruch,
# w28-putz-wand zweieinhalb an EINER Zeile der Quelltext-Wand, während der Koordinator-Laptop aus war. Jetzt schreibt der Dienst
# den roten Text (rot-text.cjs --sha) je Kopf EINMAL oben in cloud-post/<zweig>.md des Zweigs `koordination` — dort liest jeder
# Macher seine Post (Cloud, OMEN, GTX 1050). Ohne Arbeitsbaum: ein eigener Index, EIN Commit auf origin/koordination.
# HEIM_PROBE=1 druckt nur, was es schriebe. Läuft der Check noch oder ist er grün, tut es nichts; ein Fehler (Netz, Wettlauf beim
# Push) lässt die Marke weg — die nächste Runde des Diensts versucht es wieder.
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
# heim.sh <zweig> <sha> "<text der wand>" — EINE WAND DES ZUGS, DIE EINEN GRÜNEN ZWEIG DRAUSSEN HÄLT, GEHT EBENSO HEIM (14.11.:
# w28-stadt-grammatik a9f6f6bc trug grünen Check und grüne Probe und fuhr 18:48 nicht — die Bündel-Wand fiel am mit main
# verschmolzenen Stand an der Datei-Decke; der Text stand nur in der lokalen Warteliste, der Macher wartete anderthalb Stunden).
b=$1 sha=$2 grund=$3
M="$W/heim-$b-${sha:0:8}"
[ -n "$grund" ] && M="$W/heim-wand-$b-${sha:0:8}"
[ -n "$b" ] && [ -n "$sha" ] || { echo "Aufruf: heim.sh <zweig> <sha> [<text der wand>]"; exit 2; }
[ -e "$M" ] && exit 0
if [ -n "$grund" ]; then
    t="ROT wand: $grund"
    titel="DIE WAND DES ZUGS HÄLT DEN KOPF ${sha:0:8} DRAUSSEN (Zug-Dienst, ohne LLM)"
    satz="Check und Probe des Zweigs können grün sein — MIT main verschmolzen fällt eine Wand, und der Zug nimmt den Zweig nicht. Ihr Text:"
    rat="main einmischen, die Wand am verschmolzenen Stand lokal fahren (\`node scripts/diag-betriebsgesetz.cjs --grund tag\`), heilen, neu abgeben (EIN Kopf, Betreff \`Abgabe $b: …\`)."
    betreff="die Wand des Zugs hält den Kopf ${sha:0:8} draussen"
else
    TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git -C $R credential fill 2>/dev/null | sed -n 's/^password=//p')
    t=$(TOKEN=$TOKEN node "$D/rot-text.cjs" --sha "$sha" 2>&1) || exit 1
    echo "$t" | grep -q "^ROT " || exit 0
    titel="CODE-CHECK ROT am Kopf ${sha:0:8} (Zug-Dienst, ohne LLM)"
    satz="Der Zweig fährt in keinem Zug, solange sein eigener Check rot ist. Der rote Text:"
    rat="Heilen, den Schritt lokal fahren (\`npm run check\`), neu abgeben (EIN Kopf, Betreff \`Abgabe $b: …\`)."
    betreff="Code-Check ROT am Kopf ${sha:0:8}"
fi
git -C $R fetch -q origin "+refs/heads/koordination:refs/remotes/origin/koordination" || exit 1
alt=$(git -C $R show "origin/koordination:cloud-post/$b.md" 2>/dev/null)
kopf=$(echo "$alt" | head -1)
case "$kopf" in "# "*) rest=$(echo "$alt" | tail -n +2) ;; *) kopf="# Post an $b" rest="$alt" ;; esac
{
    echo "$kopf"
    echo
    echo "## $(date '+%d.%m. %H:%M') — $titel"
    echo
    echo "$satz"
    echo
    echo '```'
    echo "$t" | head -24 | cut -c1-400
    echo '```'
    echo
    echo "$rat"
    echo "$rest"
} >"$W/heim.tmp"
[ -n "$HEIM_PROBE" ] && { head -16 "$W/heim.tmp"; exit 0; }
X=$(cygpath -w "$W/heim.index" 2>/dev/null || echo "$W/heim.index")
rm -f "$W/heim.index"
blob=$(git -C $R hash-object -w "$W/heim.tmp") &&
    GIT_INDEX_FILE="$X" git -C $R read-tree origin/koordination &&
    GIT_INDEX_FILE="$X" git -C $R update-index --add --cacheinfo "100644,$blob,cloud-post/$b.md" &&
    baum=$(GIT_INDEX_FILE="$X" git -C $R write-tree) &&
    c=$(git -C $R -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit-tree "$baum" -p origin/koordination -m "cloud-post $b: $betreff (Zug-Dienst) [skip ci]") &&
    git -C $R push -q origin "$c:refs/heads/koordination" &&
    : >"$M" &&
    echo "$(date +%H:%M) $b ${sha:0:8}: $betreff — heim (cloud-post/$b.md)" >>"$W/zug-nie-leer.log"

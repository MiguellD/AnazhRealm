#!/bin/bash
# bash nach-landung.sh <zug-nr> <anspruchs-kommentar> <anspruchs-zeile> — nach EINER Landung: main lesen, den Anspruch buchen (koordination, Plumbing),
# dann druckt es den Sprung-Befehl (der Sprung selbst bleibt ein eigener Handgriff, damit EIN Sprung mehrere Landungen tragen kann).
cd /c/Users/micha/AnazhRealm-profiband || exit 2
export MSYS_NO_PATHCONV=1
S="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad"
Z="$1"; KOMM="$2"; ZEILE="$3"
M=$(git ls-remote origin refs/heads/main | cut -f1)
git fetch -q origin main
BETREFF=$(git log -1 --format='%s' "$M" | cut -c1-110)
ZEIT=$(TZ=Europe/Zurich git log -1 --format='%cd' --date=format-local:'%d.%m. %H:%M' "$M")
echo "main $M · $ZEIT · $BETREFF"
K=$(git ls-remote origin refs/heads/koordination | cut -f1)
git fetch -q origin "$K"
git show "$K:zug/anspruch.txt" > "$S/anspruch.txt"
if grep -q "^${ZEILE%% *} " "$S/anspruch.txt"; then echo "Anspruch steht schon: ${ZEILE%% *}"; else
    printf '# %s (main %s, %s): %s\n%s\n' "$Z" "${M:0:8}" "$ZEIT" "$KOMM" "$ZEILE" >> "$S/anspruch.txt"
    printf 'Anspruch %s: %s\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n' "$Z" "${ZEILE%% *}" > "$S/betreff-anspruch-$Z.txt"
    node "$S/ko-datei.cjs" "$S/anspruch.txt" zug/anspruch.txt "$S/betreff-anspruch-$Z.txt" 2>&1 | tail -1
fi
echo "SPRUNG: node \"$S/runde-jetzt.cjs\" sprung C:/Users/micha/AnazhRealm-profiband <kopf-der-runde> $M \"<grund>\""

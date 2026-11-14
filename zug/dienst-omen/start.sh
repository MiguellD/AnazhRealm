#!/bin/bash
# start.sh — DER EINE EINSTIEG in die Schleifen der OMEN (GTX 1060; Blockade B3 des Blatts „großes Bild“, Auftrag Konto 11, 10.11.).
# JEDES KONTO, JEDER NEUSTART:   bash /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/dienst-omen/start.sh
#   (beim allerersten Mal aus dem Zweig: bash <koordination>/zug/dienst-omen/start.sh)
#
# WARUM: landung.sh und platte-wache.sh lebten unversioniert in p3/n0611/stufe und waren Kinder der App — der Konto-Wechsel am
# 10.11. 21:52 beendete beide mitten in Station 8 von 32, das GPU-Schloss hing verwaist an pid 11320, zwei Landungen blieben
# ungemessen. Derselbe Schnitt wie zug/dienst/start.sh des Laptops; gemein.sh (PID-Schloss, Puls) wird von dort gesourct, nicht kopiert.
# DAS GESETZ: die Quelle ist `zug/dienst-omen/` im Zweig koordination (dazu zug/dienst/gemein.sh) — und nur sie.
#   1 INSTALLIEREN: der Stand von origin/koordination wird an den laufenden Ort geschrieben — die Schleifen nach p3/dienst-omen/,
#     ihre Werkzeuge `ort/<pfad>` nach p3/<pfad> (p3/n0611/kandidat.sh, punkte-offen.cjs, stufe/melde.cjs …: dort rufen sie auch
#     alle anderen Treiber). Das Manifest merkt je Datei Blob, Ort und Quelle. Getauscht wird nur per mv (nie in einer laufenden .sh).
#   2 HAND-ÄNDERUNG = ROT beim Namen: weicht eine installierte Datei von ihrem Manifest ab, installiert start.sh NICHT und nennt
#     sie — erst nach zug/dienst-omen committen und pushen, dann starten.
#   3 STARTEN, abgekoppelt: jede Schleife startet über WMI (Elter WmiPrvSE, nicht die App) — sie überlebt App-Neustart und
#     Konto-Wechsel. Eine lebende Schleife wird nie doppelt gestartet (PID-Schloss in gemein.sh). Ohne Fenster (ShowWindow 0):
#     bis 11.11. öffnete jeder Start ein Terminal-Fenster auf dem Schirm des Schöpfers, das Schließen des Fensters tötete den Lauf.
# Aufruf: start.sh            installieren + alle Schleifen starten, die nicht leben (landung · platte · puls)
#         start.sh --eich     wie oben, aber die Landung beginnt mit der Eichung (weiter.sh: eich.sh, dann die Schleife)
#         start.sh --blick    Stand je Schleife (lebt? Puls, Alter des Pulses) — schreibt nichts
#         start.sh --stopp [landung|platte|puls]   Schleife(n) samt Baum beenden; ein Schloss, dessen Halter dabei starb, wird gelöst
#         start.sh --neu      wie ohne Argument, aber lebende Schleifen zuerst beenden (neuer Code für alle)
O=/c/Users/micha/Desktop/AnazhRealm-OMEN
G=$O/AnazhRealm-mess # der Klon, der origin kennt
DO=$O/p3/dienst-omen
S=$DO/zustand
MAN=$S/manifest.txt
SCHLEIFEN="landung platte puls"
# der Abdruck DIESES Skripts beim Start: installiert es unten eine neue Fassung von sich selbst, läuft die alte im Speicher weiter
# (11.11. 20:22: der erste Aufruf trug noch SCHLEIFEN="landung platte", installierte puls-dienst.sh und startete puls NICHT)
SELBST=$(git hash-object --no-filters "$0" 2>/dev/null)
# DIE EINE LEBT-REGEL (14.11.): schleife_lebt aus zug/dienst/gemein.sh — installiert neben diesem Skript, im Zweig in ../dienst.
# Bis 14.11. stand hier ein eigenes `tasklist | grep bash`: die puls-Schleife läuft als sh.exe, start.sh meldete „ROT: puls lebt
# nach 15 s nicht“ und --blick „puls STEHT“, während sie lief.
D=$(cd "$(dirname "$0")" && pwd)
if [ -f "$D/gemein.sh" ]; then . "$D/gemein.sh"; else . "$D/../dienst/gemein.sh"; fi
S=$DO/zustand # gemein.sh setzt die Orte des Laptops — hier gelten die der OMEN
lebt() { schleife_lebt "$S/$1.pid"; }
# GEHALTEN (14.11.): zustand/landung.halt hält die Landung, bis der Koordinator die Flagge von Hand wegnimmt (rm, dann start.sh).
# Weder start.sh noch die Schleife nehmen sie weg — bis 14.11. löschte landung-dienst.sh sie beim Halten, das nächste start.sh
# (15:31, für die puls-Schleife) startete die Landung wieder, und der Macher stand erneut hinter ihr am Schloss.
gehalten() { [ "$1" = landung ] && [ -f "$S/landung.halt" ]; }
seit_halt() { date -r "$S/landung.halt" '+%F %H:%M'; }
blick() {
    local n p a jetzt t
    jetzt=$(date +%s)
    echo "DIENST-OMEN $(head -1 "$MAN" 2>/dev/null | cut -c1-70)"
    for n in $SCHLEIFEN; do
        p=$(cat "$S/$n.puls" 2>/dev/null)
        t=$(date -d "${p:0:19}" +%s 2>/dev/null)
        a=$([ -n "$t" ] && echo "$(((jetzt - t) / 60)) min" || echo "—")
        if gehalten $n; then
            echo "  $n GEHALTEN seit $(seit_halt) (zustand/landung.halt)$(lebt $n && echo " — die Schleife (PID $(cat "$S/$n.pid")) endet an der Stations-Grenze") · Puls vor $a: ${p:20:200}"
        elif lebt $n; then echo "  $n LEBT (PID $(cat "$S/$n.pid")) · Puls vor $a: ${p:20:200}"; else echo "  $n STEHT · letzter Puls vor $a: ${p:20:200}"; fi
    done
    echo "  C: $(df -k /c | awk 'NR==2 { printf "%.1f", $4 / 1048576 }') GB frei · GPU-Schloss: $(head -1 /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss/besitzer.txt 2>/dev/null || echo frei)"
}
# der MSYS-Baum ab PID $1, Kinder zuerst (der Windows-Elter eines MSYS-Kinds ist nicht immer sein Elter)
baum() {
    local k
    for k in $(ps -ef | awk -v p="$1" '$3==p{print $2}'); do baum "$k"; done
    echo "$1"
}
stopp() {
    local n p m q w
    for n in ${1:-$SCHLEIFEN}; do
        p=$(cat "$S/$n.pid" 2>/dev/null)
        m=$(cat "$S/$n.mpid" 2>/dev/null)
        if lebt $n; then
            [ -n "$m" ] && for q in $(baum "$m"); do
                w=$(cat /proc/$q/winpid 2>/dev/null)
                [ -n "$w" ] && taskkill //T //F //PID "$w" >/dev/null 2>&1
                kill -9 "$q" 2>/dev/null
            done
            taskkill //T //F //PID "$p" >/dev/null 2>&1
            echo "$n beendet (PID $p)"
        fi
        rm -f "$S/$n.pid" "$S/$n.mpid"
    done
    # die Traps von gpu-lauf.sh laufen bei taskkill nicht: ein Schloss, dessen Halter eben starb, löst die EINE Schloss-Quelle
    (. $O/p3/gpu-schloss.sh && schloss_verwaist)
}
# 3 STARTEN, abgekoppelt von der App (unten gerufen; hier, damit der Selbsttest dieselbe Funktion fährt)
starte_eine() { # <schleife> <skript> — über WMI, ohne Fenster
    powershell -NoProfile -Command "\$r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = '\"C:\\Program Files\\Git\\bin\\bash.exe\" -lc \"exec bash $DO/$2 >> $S/$1.out 2>&1\"'; CurrentDirectory = 'C:\\Users\\micha\\Desktop\\AnazhRealm-OMEN'; ProcessStartupInformation = (New-CimInstance -ClassName Win32_ProcessStartup -ClientOnly -Property @{ ShowWindow = [uint16]0 }) }; if (\$r.ReturnValue -ne 0) { exit 1 }"
}
starte_alle() { # [--eich]
    local n skript i
    for n in $SCHLEIFEN; do
        if gehalten $n; then
            echo "$n GEHALTEN seit $(seit_halt) — nicht gestartet (die Flagge bleibt; weiter: rm $S/landung.halt, dann start.sh)"
            continue
        fi
        if lebt $n; then
            echo "$n lebt schon (PID $(cat "$S/$n.pid"))"
            continue
        fi
        skript=$n-dienst.sh
        [ "$n" = landung ] && [ "$1" = "--eich" ] && skript=weiter.sh
        starte_eine $n $skript || { echo "ROT: $n startet nicht (WMI)"; continue; }
        for i in $(seq 1 "${LEBT_FRIST_S:-15}"); do
            lebt $n && break
            sleep 1
        done
        if lebt $n; then echo "$n GESTARTET (PID $(cat "$S/$n.pid"), $skript)"; else echo "ROT: $n lebt nach ${LEBT_FRIST_S:-15} s nicht — $(tail -2 "$S/$n.out" 2>/dev/null | tr '\n' ' ')"; fi
    done
}

# DER SELBSTTEST (ohne OMEN, in einem Temp-Ordner): (a) die EINE lebt-Regel (gemein.sh selbsttest_lebt); (c) eine gesetzte
# landung.halt — starte_alle startet die Landung nicht und lässt die Flagge liegen, die anderen Schleifen starten, --blick zeigt
# „GEHALTEN seit …“ (nie STEHT, nie LEBT); dazu die Mutante „alte Regel“ (start kennt keine Flagge) — sie muss ROT werden.
selbsttest() {
    local rot=0 X o b
    selbsttest_lebt || rot=1
    X=$(mktemp -d)
    S=$X MAN=$X/manifest.txt LEBT_FRIST_S=1
    starte_eine() { echo "$1" >>"$X/gestartet"; }
    sleep() { :; }
    touch -d "2026-11-14 03:12" "$X/landung.halt"
    o=$(starte_alle)
    b=$(blick)
    if ! grep -qx landung "$X/gestartet" 2>/dev/null && [ -f "$X/landung.halt" ] && grep -qx platte "$X/gestartet" && grep -qx puls "$X/gestartet" &&
        echo "$o" | grep -q "landung GEHALTEN seit 2026-11-14 03:12 — nicht gestartet" && echo "$b" | grep -q "landung GEHALTEN seit 2026-11-14 03:12" &&
        ! echo "$b" | grep -qE "landung (STEHT|LEBT)"; then
        echo "OK c  Flagge gesetzt: start startet platte + puls, die Landung nicht; die Flagge liegt; --blick: $(echo "$b" | grep landung | cut -c3-60)"
    else
        echo "ROT c  Flagge gesetzt: gestartet $(tr '\n' ' ' <"$X/gestartet" 2>/dev/null) · Flagge $([ -f "$X/landung.halt" ] && echo liegt || echo FORT) · Blick: $(echo "$b" | grep landung | cut -c3-80)"
        rot=1
    fi
    rm -f "$X/gestartet"
    gehalten() { return 1; } # die Mutante: die alte Regel (start kennt keine Flagge)
    starte_alle >/dev/null
    if grep -qx landung "$X/gestartet" 2>/dev/null; then echo "OK c  Mutante „start ohne Flagge“ ROT: die Landung startet trotz landung.halt"; else echo "ROT c  Mutante „start ohne Flagge“ bleibt GRÜN"; rot=1; fi
    unset -f sleep
    rm -rf "$X"
    if [ $rot = 0 ]; then echo "dienst-omen start.sh SELBSTTEST GRÜN (a schleife_lebt, c Halt-Flagge)"; else echo "dienst-omen start.sh SELBSTTEST ROT"; fi
    return $rot
}
case "$1" in
    --selbsttest) selbsttest; exit $? ;;
    --blick) blick; exit 0 ;;
    --stopp) stopp "$2"; exit 0 ;;
esac
mkdir -p "$S"

# 1+2 INSTALLIEREN (Hand-Änderung = ROT)
git -C $G fetch -q origin "+refs/heads/koordination:refs/omen/dienst-koord" || { echo "ROT: fetch koordination scheitert"; exit 1; }
K=$(git -C $G rev-parse refs/omen/dienst-koord)
hand=""
if [ -s "$MAN" ]; then
    while read -r blob ort quelle; do
        [ -f "$O/$ort" ] || continue
        ist=$(git -C $G hash-object --no-filters "$O/$ort")
        [ "$ist" = "$blob" ] && continue
        [ "$ist" = "$(git -C $G rev-parse -q --verify "$K:$quelle" 2>/dev/null)" ] && continue # schon der neue Stand
        hand="$hand $ort"
    done < <(tail -n +2 "$MAN")
fi
if [ -n "$hand" ]; then
    echo "ROT — HAND-ÄNDERUNG am laufenden Ort (nicht in koordination zug/dienst-omen):"
    for h in $hand; do echo "  $h"; done
    echo "erst nach zug/dienst-omen committen + pushen, dann start.sh. Nichts installiert, nichts gestartet."
    exit 1
fi
[ "$1" = "--neu" ] && stopp
tmp=$S/manifest.neu
echo "$K $(date '+%Y-%m-%d %H:%M') installiert aus origin/koordination zug/dienst-omen (+ zug/dienst: gemein, richter, puls)" >"$tmp"
{
    git -C $G ls-tree -r "$K" zug/dienst-omen/
    git -C $G ls-tree "$K" zug/dienst/gemein.sh zug/dienst/richter.sh zug/dienst/richter-werk.cjs zug/dienst/puls-dienst.sh zug/dienst/schloss-puls.cjs
} | while read -r mode typ blob pfad; do
    case "$pfad" in
        zug/dienst/*) ort=p3/dienst-omen/${pfad#zug/dienst/} ;; # gemein.sh, richter.sh, richter-werk.cjs, puls-dienst.sh, schloss-puls.cjs: EINE Quelle beim Laptop
        zug/dienst-omen/ort/*) ort=p3/${pfad#zug/dienst-omen/ort/} ;;
        *) ort=p3/dienst-omen/${pfad#zug/dienst-omen/} ;;
    esac
    mkdir -p "$(dirname "$O/$ort")"
    if [ "$(git -C $G hash-object --no-filters "$O/$ort" 2>/dev/null)" != "$blob" ]; then
        git -C $G cat-file blob "$blob" >"$O/$ort.neu" && mv "$O/$ort.neu" "$O/$ort"
        echo "  installiert $ort"
    fi
    case "$ort" in *.sh | *.cjs) chmod +x "$O/$ort" ;; esac
    echo "$blob $ort $pfad" >>"$tmp"
done
mv "$tmp" "$MAN"
n=$(($(wc -l <"$MAN") - 1))
[ "$n" -ge 5 ] || { echo "ROT: das Manifest trägt nur $n Dateien — zug/dienst-omen fehlt in ${K:0:8}? Nichts gestartet."; exit 1; }
echo "INSTALLIERT ${K:0:8} ($n Dateien)"
# start.sh hat sich selbst ersetzt → EINMAL als neue Fassung weiterlaufen (sie kennt die neuen Schleifen); START_NEU hält die Schleife auf
if [ -n "$SELBST" ] && [ "$(git hash-object --no-filters "$0" 2>/dev/null)" != "$SELBST" ] && [ -z "$START_NEU" ]; then
    echo "start.sh ist neu — läuft als neue Fassung weiter"
    START_NEU=1 exec bash "$0" "$@"
fi

# 3 STARTEN, abgekoppelt von der App (starte_alle oben)
starte_alle "$1"
blick

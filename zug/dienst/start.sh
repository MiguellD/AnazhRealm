#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# start.sh — DER EINE EINSTIEG in die Integrations-Maschine des Laptops (Konto 11, 10.11.; Blockade B3 des Blatts „großes Bild“).
# JEDES KONTO, JEDER NEUSTART:   bash <koordination>/zug/dienst/start.sh        (danach `start.sh --blick` oder das Fenster)
#
# WARUM: bis zum 10.11. lebte die Maschine als ~120 Skripte in /tmp/claude/w3 · w4 und im gitignorierten artifacts/profiband/werkzeug —
# fahre.sh, buche.sh, die Uhr des Blicks und gpu-lauf.sh standen in KEINEM Zweig, zug.cjs und der Blick wichen von ihren Kopien ab,
# und der Konto-Wechsel um 21:52 beendete alle Schleifen mitten im Bau von z374 (sie waren Kinder der App).
# DAS GESETZ: die Quelle ist `zug/dienst/` im Zweig koordination — und nur sie.
#   1 INSTALLIEREN: der Stand von origin/koordination wird nach artifacts/profiband/dienst (Schleifen) und
#     artifacts/profiband/werkzeug (zug.cjs, fahre.sh, buche.sh, Blick …) geschrieben; das Manifest merkt je Datei den Blob.
#   2 HAND-ÄNDERUNG = ROT beim Namen: weicht eine installierte Datei von ihrem Manifest ab, installiert start.sh NICHT und nennt
#     sie — erst nach zug/dienst committen und pushen, dann starten. (Eine Änderung am laufenden Ort ginge sonst still verloren
#     oder lebte unversioniert weiter: beides ist der Bruch.)
#   3 STARTEN, abgekoppelt: jede Schleife startet über WMI (Elter WmiPrvSE, nicht die App) — sie überlebt App-Neustart und
#     Konto-Wechsel. Eine lebende Schleife wird nie doppelt gestartet (PID-Schloss in gemein.sh).
# Aufruf: start.sh            installieren + alle Schleifen starten, die nicht leben (zug · radeon · buche · puls)
#         start.sh --blick    Stand je Schleife (lebt? Puls, Alter des Pulses) — schreibt nichts
#         start.sh --fenster  dazu den Messplatz-Blick im eigenen Fenster öffnen (über den Explorer, auch er hängt nicht an der App)
#         start.sh --stopp [zug|radeon|buche|puls]   Schleife(n) samt Kindern beenden (ein Zug in Fahrt wird beim nächsten Start aufgenommen)
#         start.sh --neu      wie ohne Argument, aber lebende Schleifen zuerst beenden (neuer Code für alle)
#         start.sh --lokal    nichts holen, nichts installieren: nur die Schleifen des installierten Stands starten (autostart.sh ohne Netz)
R=/c/Users/micha/AnazhRealm-profiband
ZIEL_D=$R/artifacts/profiband/dienst
ZIEL_W=$R/artifacts/profiband/werkzeug
S=/tmp/claude/dienst
MAN=$S/manifest.txt
SCHLEIFEN="zug radeon buche puls"
mkdir -p "$S" "$ZIEL_D" "$ZIEL_W"
. "$(cd "$(dirname "$0")" && pwd)/gemein.sh" # halter_lebt: EINE Regel, wer eine PID-Datei hält (pid + Start)
lebt() { halter_lebt "$S/$1.pid" sh.exe; }
blick() {
    local n p a jetzt t
    jetzt=$(date +%s)
    echo "DIENST $(head -1 "$MAN" 2>/dev/null | cut -c1-60)"
    for n in $SCHLEIFEN; do
        p=$(cat "$S/$n.puls" 2>/dev/null)
        t=$(date -d "${p:0:19}" +%s 2>/dev/null)
        a=$([ -n "$t" ] && echo "$(((jetzt - t) / 60)) min" || echo "—")
        if lebt $n; then echo "  $n LEBT (PID $(cat "$S/$n.pid")) · Puls vor $a: ${p:20:160}"; else echo "  $n STEHT · letzter Puls vor $a: ${p:20:160}"; fi
    done
    [ -s "$S/zug.fahrt" ] && echo "  in Fahrt: $(cat "$S/zug.fahrt" | cut -c1-200)"
}
# der MSYS-Baum ab PID $1, Kinder zuerst (10.11. 22:34: taskkill /T auf die Schleife ließ ihr Kind buche.sh leben — der
# Windows-Elter eines MSYS-Kinds ist nicht immer sein Elter)
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
}
case "$1" in
    --blick) blick; exit 0 ;;
    --stopp) stopp "$2"; exit 0 ;;
esac

# 1+2 INSTALLIEREN (Hand-Änderung = ROT)
if [ "$1" = "--lokal" ]; then
    echo "LOKAL: nichts geholt, nichts installiert — es startet der Stand $(head -1 "$MAN" 2>/dev/null | cut -c1-8)"
else
    git -C $R fetch -q origin "+refs/heads/koordination:refs/remotes/origin/koordination" || { echo "ROT: fetch koordination scheitert"; exit 1; }
    K=$(git -C $R rev-parse origin/koordination)
    hand=""
    if [ -s "$MAN" ]; then
        while read -r blob ort; do
            [ -f "$R/$ort" ] || continue
            ist=$(git -C $R hash-object --no-filters "$R/$ort") # die BYTES, wie installiert: ohne --no-filters wandelt git die Zeilenenden und eine CRLF-Datei (desktop/*.cmd) hiesse Hand-Aenderung (11.11. 17:45: der Dienst startete nicht)
            [ "$ist" = "$blob" ] && continue
            q=${ort#artifacts/profiband/dienst/}
            [ "$q" = "$ort" ] && q=werkzeug/${ort#artifacts/profiband/werkzeug/}
            [ "$ist" = "$(git -C $R rev-parse -q --verify "$K:zug/dienst/$q" 2>/dev/null)" ] && continue # schon der neue Stand
            hand="$hand $ort"
        done < <(tail -n +2 "$MAN")
    fi
    if [ -n "$hand" ]; then
        echo "ROT — HAND-ÄNDERUNG am laufenden Ort (nicht in koordination zug/dienst):"
        for h in $hand; do echo "  $h"; done
        echo "erst nach zug/dienst committen + pushen, dann start.sh. Nichts installiert, nichts gestartet."
        exit 1
    fi
    [ "$1" = "--neu" ] && stopp
    neu="$K $(date '+%Y-%m-%d %H:%M') installiert aus origin/koordination zug/dienst"
    tmp=$S/manifest.neu
    echo "$neu" >"$tmp"
    git -C $R ls-tree -r "$K" zug/dienst/ | while read -r mode typ blob pfad; do
        q=${pfad#zug/dienst/}
        case "$q" in werkzeug/*) ort=artifacts/profiband/werkzeug/${q#werkzeug/} ;; *) ort=artifacts/profiband/dienst/$q ;; esac
        mkdir -p "$(dirname "$R/$ort")"
        ist=$(git -C $R hash-object --no-filters "$R/$ort" 2>/dev/null)
        # der Code einer LEBENDEN Schleife wird nie unter ihr getauscht (bash liest sein Skript im Laufen): er bleibt bis --neu
        case "$q" in *-dienst.sh)
            if [ -n "$ist" ] && [ "$ist" != "$blob" ] && lebt "${q%-dienst.sh}"; then
                echo "  bleibt alt: $ort (Schleife ${q%-dienst.sh} lebt — neuer Code mit start.sh --neu)"
                echo "$ist $ort" >>"$tmp"
                continue
            fi ;;
        esac
        if [ "$ist" != "$blob" ]; then
            git -C $R cat-file blob "$blob" >"$R/$ort.neu" && mv "$R/$ort.neu" "$R/$ort"
            echo "  installiert $ort"
        fi
        case "$q" in *.sh | *.cjs) chmod +x "$R/$ort" ;; esac
        echo "$blob $ort" >>"$tmp"
    done
    # ABGELÖST: was das alte Manifest trug und der Zweig nicht mehr, verschwindet vom laufenden Ort — nur unverändert (sein Blob) und nur,
    # wenn main die Datei nicht verfolgt (kein Zwilling bleibt liegen, kein Baum wird schmutzig)
    if [ -s "$MAN" ]; then
        while read -r blob ort; do
            grep -q " $ort$" "$tmp" && continue
            [ -f "$R/$ort" ] || continue
            git -C $R ls-files --error-unmatch "$ort" >/dev/null 2>&1 && { git -C $R checkout -q -- "$ort" 2>/dev/null; continue; }
            [ "$(git -C $R hash-object --no-filters "$R/$ort")" = "$blob" ] && rm -f "$R/$ort" && echo "  abgelöst $ort"
        done < <(tail -n +2 "$MAN")
    fi
    mv "$tmp" "$MAN"
    echo "INSTALLIERT ${K:0:8} ($(($(wc -l <"$MAN") - 1)) Dateien)"

fi

# 3 STARTEN, abgekoppelt von der App
for n in $SCHLEIFEN; do
    if lebt $n; then
        echo "$n lebt schon (PID $(cat "$S/$n.pid"))"
        continue
    fi
    powershell -NoProfile -Command "\$r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = '\"C:\\Program Files\\Git\\bin\\bash.exe\" -lc \"exec sh /c/Users/micha/AnazhRealm-profiband/artifacts/profiband/dienst/$n-dienst.sh >> /tmp/claude/dienst/$n.out 2>&1\"'; CurrentDirectory = 'C:\\Users\\micha\\AnazhRealm-profiband' }; if (\$r.ReturnValue -ne 0) { exit 1 }" || { echo "ROT: $n startet nicht (WMI)"; continue; }
    for i in 1 2 3 4 5 6 7 8 9 10; do
        lebt $n && break
        sleep 1
    done
    if lebt $n; then echo "$n GESTARTET (PID $(cat "$S/$n.pid"))"; else echo "ROT: $n lebt nach 10 s nicht — $(tail -2 "$S/$n.out" 2>/dev/null | tr '\n' ' ')"; fi
done
if [ "$1" = "--fenster" ]; then
    explorer.exe "$(cygpath -w "$ZIEL_D/Messplatz-Blick.cmd")"
    echo "Fenster: Messplatz-Blick geöffnet"
fi
blick

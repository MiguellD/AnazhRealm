#!/bin/bash
# gpu-lauf-selbsttest.sh [<gpu-lauf.sh>] — der Selbsttest der Verdrängung (12.11., WEICH an der Grenze). Eigenes Schloss, eigenes
# Hook-Log, eigenes Dienst-Log in einem Temp-Ordner; der Befehl ist `sleep`, die Karte bleibt unberührt, der Waisen-Räumer trifft
# nur Zeilen mit dem Wort des Tests (GPU_LAUF_VERDR_NUR). Läuft nur, wenn kein Runner.Worker lebt (gpu-lauf.sh fragt den echten).
#   a  WEICH 30 s, der Lauf dauert 8 s, ein CI-Job wartet ab Sekunde 2  → Exit 0, „ENDETE AN DER GRENZE“, keine Verdrängung
#   b  WEICH 6 s, der Lauf dauert 60 s, ein CI-Job wartet ab Sekunde 2  → VERDRÄNGT nach ≥ 6 s Warten, Neustart nach dem Job, Exit 0
#   c  ohne WEICH (Vorgabe 0), ein CI-Job wartet ab Sekunde 2           → VERDRÄNGT binnen 6 s (wie vor dem 12.11.)
#   d  WEICH 30 s, der Lauf stirbt nach 6 s an einem Signal (SEGV), ein CI-Job wartet ab Sekunde 2 → Exit 139, „STARB BEIM WEICHEN“, nie „ganz“
#   e  (15.11.) WEICH 30 s, das Kind ist node und schreibt alle 0,5 s eine Zeile in die Leitung, die es mit dem Wickler teilt
#      (`gpu-lauf … 2>&1 | cat`), ein CI-Job wartet ab Sekunde 2 → Exit 0, „ENDETE AN DER GRENZE“ — der Wickler schreibt kein Wort
#      in die Leitung, solange das Kind lebt (die Fassung bis 14.11. schrieb „gpu-lauf: WEICHT“ hinein: node endete mit 0xC0000005,
#      Exit 139, „STARB BEIM WEICHEN“ — 12 verlorene Läufe). Ohne node auf dem Pfad: e UNGEMESSEN, zählt nicht als ROT.
#   f  (15.11.) ein fremder, lebender Halter hat das Schloss 24 s, GPU_LAUF_WORT_S=3 → der Wartende sagt mindestens zweimal
#      „gpu-lauf: wartet seit …“, jede Zeile VOR „gpu-lauf: Schloss …“, Exit 0 (punkte.cjs gibt nach 600 s Schweigen auf: am 3e4f99cd
#      hielt ein CI-Job die Karte 17 min 48 s, 18 von 23 Stationen blieben ungemessen). Die Fassung bis 15.11. schweigt: f ROT.
# Gegenprobe: die Fassung vor dem Schnitt reißt a (sie verdrängt sofort) — `gpu-lauf-selbsttest.sh <alte gpu-lauf.sh>` ist ROT;
# die Fassung vom 12.–14.11. reißt e.
GL=${1:-$(cd "$(dirname "$0")" && pwd)/gpu-lauf.sh}
T=$(mktemp -d); rot=0
tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker && { echo "UNGEMESSEN: ein Runner.Worker lebt — der Selbsttest wartete am echten CI-Job"; exit 2; }
fall() { # $1 Name · $2 WEICH ("" = Vorgabe) · $3 erste Dauer s · $4 Sekunden bis der Job „genommen“ meldet (0 = nie) · $5 stirbt · $6 rohr (Kind = node, Ausgabe durch eine Leitung)
    local n=$1 d=$T/$1; mkdir -p "$d"; : >"$d/dienst.log"
    echo "2026-01-01 00:00:00 start ci-runner 1/1 echt: Schloss genommen (alt)" >"$d/hook.log"
    printf '#!/bin/bash\nif [ -f "%s/zweit" ]; then sleep 1; else touch "%s/zweit"; sleep %s; fi\n%s\n' "$d" "$d" "$3" "${5:+kill -SEGV \$\$}" >"$d/befehl.sh"
    ( sleep 2; echo "2026-01-01 00:00:02 start ci-runner 2/1 echt: wartet auf Schloss von 'omen-selbsttest'" >>"$d/hook.log"
      [ "$4" -gt 0 ] && { sleep "$4"; echo "2026-01-01 00:00:09 start ci-runner 2/1 echt: Schloss genommen (neu)" >>"$d/hook.log"; } ) &
    local t0=$(date +%s)
    if [ -n "$6" ]; then
        printf '#!/bin/bash\nexec node -e "let i=0;const t=setInterval(()=>{console.log(String(++i));if(i>=%s)clearInterval(t)},500)"\n' "$(($3 * 2))" >"$d/befehl.sh"
        ( set -o pipefail
          GPU_LAUF_SCHLOSS=$d/schloss GPU_LAUF_HOOKLOG=$d/hook.log GPU_LAUF_DLOG=$d/dienst.log GPU_LAUF_VERDR_NUR=selbsttest-$$-nie \
              GPU_LAUF_WARTE_S=120 GPU_LAUF_MAX_S=120 GPU_LAUF_VERDRAENGT_MAX=1 GPU_LAUF_WEICH_S=$2 bash "$GL" selbsttest bash "$d/befehl.sh" 2>&1 | cat >"$d/aus.txt" )
    else
        GPU_LAUF_SCHLOSS=$d/schloss GPU_LAUF_HOOKLOG=$d/hook.log GPU_LAUF_DLOG=$d/dienst.log GPU_LAUF_VERDR_NUR=selbsttest-$$-nie \
            GPU_LAUF_WARTE_S=120 GPU_LAUF_MAX_S=120 GPU_LAUF_VERDRAENGT_MAX=1 GPU_LAUF_WEICH_S=$2 bash "$GL" selbsttest bash "$d/befehl.sh" >"$d/aus.txt" 2>&1
    fi
    E=$?; S=$(($(date +%s) - t0)); wait
    V=$(grep -c "VERDRÄNGT" "$d/dienst.log"); W=$(grep -c "WEICHT" "$d/dienst.log"); GR=$(grep -c "ENDETE AN DER GRENZE" "$d/dienst.log"); ST=$(grep -c "STARB BEIM WEICHEN: Exit 139" "$d/dienst.log")
    NACH=$(sed -n 's/.*VERDRÄNGT 1\/1 nach \([0-9]*\) s.*/\1/p' "$d/dienst.log" | head -1)
    [ -d "$d/schloss" ] && { echo "ROT $n  das Schloss blieb stehen"; rot=1; }
}
fall a 30 8 0
if [ "$E" = 0 ] && [ "$V" = 0 ] && [ "$W" = 1 ] && [ "$GR" = 1 ] && [ "$S" -lt 20 ]; then echo "GRÜN a  der Lauf maß zu Ende ($S s), der Job wartete, keine Verdrängung"
else echo "ROT a  Exit $E · VERDRÄNGT $V (Soll 0) · WEICHT $W (Soll 1) · an der Grenze $GR (Soll 1) · $S s"; rot=1; fi
fall b 6 60 14
if [ "$E" = 0 ] && [ "$V" = 1 ] && [ "$W" = 1 ] && [ -n "$NACH" ] && [ "$NACH" -ge 7 ] && [ "$NACH" -le 14 ]; then echo "GRÜN b  nach $NACH s Lauf verdrängt (6 s gewartet), Neustart nach dem Job, Exit 0 ($S s)"
else echo "ROT b  Exit $E · VERDRÄNGT $V (Soll 1) · WEICHT $W (Soll 1) · nach ${NACH:-?} s (Soll 7–14) · $S s"; rot=1; fi
fall c "" 60 8
if [ "$E" = 0 ] && [ "$V" = 1 ] && [ "$W" = 0 ] && [ -n "$NACH" ] && [ "$NACH" -le 6 ]; then echo "GRÜN c  ohne WEICH sofort verdrängt (nach $NACH s), Exit 0 ($S s)"
else echo "ROT c  Exit $E · VERDRÄNGT $V (Soll 1) · WEICHT $W (Soll 0) · nach ${NACH:-?} s (Soll ≤ 6) · $S s"; rot=1; fi
fall d 30 6 0 stirbt
if [ "$E" = 139 ] && [ "$V" = 0 ] && [ "$W" = 1 ] && [ "$GR" = 0 ] && [ "$ST" = 1 ]; then echo "GRÜN d  der Lauf starb beim Weichen (Exit 139): die Zeile nennt den Absturz, nie „ganz“ ($S s)"
else echo "ROT d  Exit $E (Soll 139) · VERDRÄNGT $V (Soll 0) · WEICHT $W (Soll 1) · an der Grenze $GR (Soll 0) · STARB $ST (Soll 1) · $S s"; rot=1; fi
if command -v node >/dev/null 2>&1; then
    fall e 30 8 0 "" rohr
    if [ "$E" = 0 ] && [ "$V" = 0 ] && [ "$W" = 1 ] && [ "$GR" = 1 ] && [ "$ST" = 0 ] && [ "$(grep -c "gpu-lauf: WICH" "$T/e/aus.txt" 2>/dev/null)" = 1 ]; then echo "GRÜN e  das node-Kind an der geteilten Leitung maß zu Ende ($S s): kein Wort des Wicklers in die Leitung, solange es lebt"
    else echo "ROT e  Exit $E (Soll 0) · VERDRÄNGT $V (Soll 0) · WEICHT $W (Soll 1) · an der Grenze $GR (Soll 1) · STARB $ST (Soll 0) · $S s · WICH-Zeile nach dem Ende: $(grep -c "gpu-lauf: WICH" "$T/e/aus.txt" 2>/dev/null) (Soll 1)"; rot=1; fi
else echo "UNGEMESSEN e  kein node auf dem Pfad"; fi
d=$T/f; mkdir -p "$d/schloss"; : >"$d/dienst.log"; echo "2026-01-01 00:00:00 start ci-runner 1/1 echt: Schloss genommen (alt)" >"$d/hook.log"
printf 'fremd\npid=%s\n' "$(cat /proc/$$/winpid 2>/dev/null)" >"$d/schloss/besitzer.txt"
( sleep 24; rm -rf "$d/schloss" ) &
t0=$(date +%s)
GPU_LAUF_SCHLOSS=$d/schloss GPU_LAUF_HOOKLOG=$d/hook.log GPU_LAUF_DLOG=$d/dienst.log GPU_LAUF_VERDR_NUR=selbsttest-$$-nie \
    GPU_LAUF_WARTE_S=120 GPU_LAUF_MAX_S=120 GPU_LAUF_WORT_S=3 bash "$GL" selbsttest true >"$d/aus.txt" 2>&1
E=$?; S=$(($(date +%s) - t0)); wait
WO=$(grep -c "^gpu-lauf: wartet seit " "$d/aus.txt"); GEN=$(grep -n "^gpu-lauf: Schloss " "$d/aus.txt" | head -1 | cut -d: -f1); LETZT=$(grep -n "^gpu-lauf: wartet seit " "$d/aus.txt" | tail -1 | cut -d: -f1)
if [ "$E" = 0 ] && [ "$WO" -ge 2 ] && [ -n "$GEN" ] && [ "${LETZT:-999}" -lt "$GEN" ] && [ "$S" -ge 22 ] && [ ! -d "$d/schloss" ]; then echo "GRÜN f  der Wartende sprach $WO-mal in $S s am fremden Schloss, dann nahm er es, Exit 0"
else echo "ROT f  Exit $E (Soll 0) · „wartet seit“ $WO (Soll ≥ 2) · „Schloss“ in Zeile ${GEN:-?}, letztes Warte-Wort in Zeile ${LETZT:-?} · $S s (Soll ≥ 22)"; rot=1; fi
# DER BAUM (26.11., GTX 1050; derselbe Test wie meisterkarte-quelle/punkte/werkzeug/gpu-lauf.sh --selbsttest): der Befehl hat die Form
# des Bruchs — `bash` mit einem node im Hintergrund (die Werkbank) und einem im Vordergrund; beide schreiben ihre pid. DER SCHNITT AM
# ZUSTAND, NIE AN DER UHR: h und i schneiden, sobald beide pid-Dateien UND besitzer.txt stehen (Frist 60 s, sonst UNGEMESSEN beim
# Namen); die Zeile nennt, wen besitzer.txt beim Schnitt nannte (Wächter oder gpu-lauf).
#   g  der Deckel (GPU_LAUF_MAX_S=6)                                → Exit 124, Enkel tot, das Schloss gelöst
#   h  TERM an gpu-lauf (der Wächter eines Rufers)                  → Exit 143, Enkel tot, das Schloss gelöst
#   i  `taskkill /F /T` auf gpu-lauf (punkte.cjs `baumTot`)         → Enkel tot binnen 15 s; eine Sekunde nach dem Schnitt nennt das
#      Schloss einen LEBENDEN Halter (sonst löst es der Start-Hook als verwaist) oder ist gelöst, danach ist es gelöst
#   j  `taskkill /F /T` auf gpu-lauf IM START-FENSTER: sobald besitzer.txt steht (Takt 0,05 s), vor dem Kind → dasselbe Soll wie i
# Die Fassung bis 26.11. reißt h (die EXIT-Falle löste das Schloss neben dem lebenden Kind), i und j (der Halter tot).
if command -v node >/dev/null 2>&1; then
    echo 'require("fs").writeFileSync(process.argv[2], String(process.pid)); setInterval(() => {}, 1000);' >"$T/enkel.js"
    lebt() { tasklist -FI "PID eq $1" -NH 2>/dev/null | grep -qw "$1"; }
    enkel() { cat "$T/$1/bg.pid" "$T/$1/fg.pid" 2>/dev/null | tr -c '0-9' ' '; }
    baum() { # $1 Name · $2 wie (deckel|term|taskkill|start) · $3 Exit-Soll ("" = gleich)
        local d=$T/$1 g E S w p k tot=nein halter="" nannte="" schloss ok=1 t0 bereit=0
        mkdir -p "$d"; : >"$d/dienst.log"
        echo "2026-01-01 00:00:00 start ci-runner 1/1 echt: Schloss genommen (alt)" >"$d/hook.log"
        printf '#!/bin/bash\nnode "%s" "%s" >/dev/null 2>&1 &\nnode "%s" "%s"\n' "$T/enkel.js" "$d/bg.pid" "$T/enkel.js" "$d/fg.pid" >"$d/befehl.sh"
        t0=$(date +%s)
        GPU_LAUF_SCHLOSS=$d/schloss GPU_LAUF_HOOKLOG=$d/hook.log GPU_LAUF_DLOG=$d/dienst.log GPU_LAUF_VERDR_NUR=selbsttest-$$-nie \
            GPU_LAUF_WARTE_S=30 GPU_LAUF_MAX_S=$([ "$2" = deckel ] && echo 6 || echo 120) bash "$GL" selbsttest bash "$d/befehl.sh" >"$d/aus.txt" 2>&1 &
        g=$!
        if [ "$2" != deckel ]; then
            for k in $(seq 1 1200); do
                if [ "$2" = start ]; then [ -s "$d/schloss/besitzer.txt" ] && { bereit=1; break; }
                else [ -s "$d/bg.pid" ] && [ -s "$d/fg.pid" ] && [ -s "$d/schloss/besitzer.txt" ] && { bereit=1; break; }; fi
                kill -0 "$g" 2>/dev/null || break
                sleep 0.05
            done
            w=$(cat /proc/$g/winpid 2>/dev/null)
            p=$(grep -m1 "^pid=" "$d/schloss/besitzer.txt" 2>/dev/null | tr -dc 0-9)
            nannte=gpu-lauf
            [ -n "$p" ] && [ "$p" != "$w" ] && nannte=Wächter
            if [ $bereit = 0 ]; then
                kill -TERM "$g" 2>/dev/null; wait "$g" 2>/dev/null
                for p in $(enkel "$1"); do lebt "$p" && taskkill -F -PID "$p" >/dev/null 2>&1; done
                echo "UNGEMESSEN $1  $2: nach $(($(date +%s) - t0)) s standen pid-Dateien (bg $([ -s "$d/bg.pid" ] && echo ja || echo nein), fg $([ -s "$d/fg.pid" ] && echo ja || echo nein)) und Schloss ($([ -s "$d/schloss/besitzer.txt" ] && echo ja || echo nein)) nicht"
                return
            fi
            if [ "$2" = term ]; then
                kill -TERM "$g" 2>/dev/null
            else
                taskkill -F -T -PID "$w" >/dev/null 2>&1
                sleep 1
                p=$(grep -m1 "^pid=" "$d/schloss/besitzer.txt" 2>/dev/null | tr -dc 0-9)
                halter=tot
                [ -z "$p" ] && [ ! -d "$d/schloss" ] && halter=gelöst
                [ -n "$p" ] && lebt "$p" && halter=lebt
            fi
        fi
        wait "$g" 2>/dev/null; E=$?
        for k in $(seq 1 15); do
            tot=ja
            for p in $(enkel "$1"); do lebt "$p" && tot=nein; done
            [ "$tot" = ja ] && [ ! -d "$d/schloss" ] && break
            sleep 1
        done
        S=$(($(date +%s) - t0))
        schloss=gelöst; [ -d "$d/schloss" ] && schloss=steht
        for p in $(enkel "$1"); do lebt "$p" && taskkill -F -PID "$p" >/dev/null 2>&1; done
        [ "$2" = start ] || { [ -s "$d/bg.pid" ] && [ -s "$d/fg.pid" ]; } || ok=0
        [ "$tot" = ja ] && [ "$schloss" = gelöst ] || ok=0
        [ -n "$3" ] && [ "$E" != "$3" ] && ok=0
        [ "$halter" = tot ] && ok=0
        if [ $ok = 1 ]; then echo "GRÜN $1  $2: Exit $E, Enkel tot, das Schloss gelöst${nannte:+ (beim Schnitt nannte es $nannte)}${halter:+ (eine Sekunde danach: Halter $halter)} ($S s)"
        else echo "ROT $1  $2: Exit $E${3:+ (Soll $3)} · Enkel tot: $tot · Schloss $schloss${nannte:+ · beim Schnitt nannte es $nannte}${halter:+ · Halter eine Sekunde nach dem Schnitt: $halter (Soll lebt oder gelöst)} · $S s"; rot=1; fi
    }
    baum g deckel 124
    baum h term 143
    baum i taskkill ""
    baum j start ""
else echo "UNGEMESSEN g h i j  kein node auf dem Pfad"; fi
rm -rf "$T"
exit $rot

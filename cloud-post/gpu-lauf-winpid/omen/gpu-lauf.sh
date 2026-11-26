#!/bin/bash
# gpu-lauf.sh der OMEN für die Punkte-Maschine (koordination meisterkarte-quelle/punkte/punkte.cjs, PUNKTE_GPU_LAUF=<dieser Pfad>):
#   gpu-lauf.sh <name> <exe> [args…]
# Nimmt DASSELBE Schloss wie der Runner-Hook (p3/gpu-schloss.sh, der Ort aus zug/dienst/schloss-ort.cjs — nie aus $TEMP; mkdir, besitzer.txt Zeile 1 der Name, Zeile 2
# pid=<Windows-PID> dieses Laufs) mit Vorfahrt für einen wartenden oder laufenden CI-Job (Runner.Worker); keine Nachtruhe mehr (27.10., Schöpfer: „wir sind Maschinen, keine Pause“ —
# den nächtlichen echt-Job schützt die Vorfahrt wie jeden echt-Job am Tag).
# Ein Halter, dessen pid nicht lebt, ist verwaist (schloss_verwaist). Exit 75, wenn das Schloss nach GPU_LAUF_WARTE_S (Vorgabe 2700) nicht
# frei wird. Der Befehl läuft mit dem Deckel GPU_LAUF_MAX_S: am Deckel fällt der GANZE Prozessbaum (taskkill -F -T; 23.10.: Git-Bash-
# `timeout` tötete nur das direkte Kind, Chrome zeichnete weiter), Exit 124. Ein Herzschlag frischt besitzer.txt alle 5 min auf.
# VERDRÄNGUNG (24.10., der echt-Job läuft wieder auf der OMEN): wartet ein CI-Job auf das Schloss, während der Befehl läuft, fällt der Lauf
# samt seinen Waisen (p3/gpu-verdraengt.ps1), das Schloss geht an den Job, danach startet der Befehl von vorn — der Hook ROTet nach 25 min,
# eine Station läuft bis 45 min (profiband.K4#1), und ein Abbruch mit Exit wäre in punkte.cjs eine ROT-Zeile. Höchstens
# GPU_LAUF_VERDRAENGT_MAX (3) Mal; alles zusammen bleibt in WARTE + MAX (der Deckel von punkte.cjs liegt dahinter).
# WEICH (12.11., Koordinator; dasselbe Gesetz wie zug/dienst/radeon-dienst.sh `ci_wartet`): GPU_LAUF_WEICH_S=<s> (Vorgabe 0 = wie
# bisher sofort) — ein CI-Job, der noch im Start-Hook AM SCHLOSS wartet, hat die Karte nicht: der Lauf misst zu Ende und gibt sie an
# seiner Grenze frei; erst nach WEICH s ohne Ende fällt er wie oben. Der Hook wartet 25 min (job-start.ps1 $frist), die Mess-Liste
# setzt 600 s (kandidat.sh): an 3552f058 fiel gelaende.K2#2 viermal, nach 1796 · 224 · 1464 · 542 s (p3/messplatz/dienst.log), und
# jede Station der Liste davor lief ~180 s — mit 600 s misst jede gewöhnliche Station zu Ende, ein Job wartet höchstens 10 min.
# KEIN WORT IN DIE LEITUNG DES LAUFS, SOLANGE DAS KIND LEBT (15.11.): 12 Läufe starben seit dem 12.11. mit Exit 139 („STARB BEIM
# WEICHEN“), jeder 0,1–0,4 s nach der Zeile „gpu-lauf: WEICHT“ auf stderr. Am Tisch nachgestellt ohne CI-Job, Karte und Welt
# (Selbsttest e): hat ein node-Kind schon in die Leitung geschrieben, die es mit diesem Skript teilt (`… 2>&1 | uhr > log`), und
# schreibt DIESES Skript dann eine Zeile hinein, endet node mit 0xC0000005 (bash nennt es Signal 11); ohne die Zeile lebt es zu Ende.
# Darum: was der Wickler dem Lauf zu sagen hat, steht im Dienst-Log, und auf stderr erst, wenn das Kind beendet ist.
# QUELLE: koordination zug/dienst-omen/ort/gpu-lauf.sh, installiert von p3/dienst-omen/start.sh (Hand-Änderung = ROT).
# DER WÄCHTER (26.11., GTX 1050; dasselbe Gesetz wie meisterkarte-quelle/punkte/werkzeug/gpu-lauf.sh `--waechter`):
# `gpu-lauf.sh --waechter <gpu-lauf-pid> <wache-datei> <name>` — läuft AUSSERHALB des Windows-Baums von gpu-lauf. In Git-Bash trägt
# ein ausgeführtes Bash-Kind (fork + exec) eine neue winpid, sein Vater in Windows ist der fork-Stumpf, der danach endet: `taskkill
# /F /T` auf gpu-lauf (punkte.cjs `baumTot`) traf nie das Kind und den Enkel (die Werkbank, ihr Chrome) erst recht nicht; gpu-lauf
# starb ohne Falle, das Schloss nannte einen toten Halter, der Start-Hook löste es als verwaist und der CI-Job lief NEBEN dem Enkel
# (GTX 26.11. 21:14 und 21:47). Bis hier las gpu-lauf dazu die winpid des Kinds sofort nach `&` (`WK`, vor seinem exec: leer) und
# fällte mit `kill -9 $KIND` nur die Hülle. DER HALTER VON DER ERSTEN ZEILE AN (Radeon 22:20 am Kandidaten der Punkte-Maschine: ein
# Schnitt zwischen dem Nehmen und der Übernahme ließ das Schloss mit totem Halter stehen): je Halte-Spanne startet der Wächter VOR
# dem Nehmen (`wache_an`), meldet seine winpid (`<wache>.win`), und besitzer.txt nennt IHN, bis das Kind endet; das Kind erfährt er
# aus `<wache>.kind`. Er fällt den Baum, sobald gpu-lauf es will (`<wache>.stop`: Deckel, Verdrängung, TERM/INT) oder ohne Falle
# starb — jede msys-Nachfahrin des Kinds (ppid, `ps -e`), unter jeder ihr Windows-Baum (`taskkill /T`), dann einzeln, was noch lebt.
# Starb gpu-lauf, löst ER das Schloss, erst wenn kein Glied mehr lebt (sonst nennt besitzer.txt den Überlebenden); lebt gpu-lauf,
# nennt besitzer.txt wieder gpu-lauf, und `<wache>.bleibt` trägt den Überlebenden.
if [ "$1" = --waechter ]; then
    GL_PID=$2 W=$3 NAME=$4 STOP="$3.stop" KIND=""
    GL_WIN=$(cat /proc/$GL_PID/winpid 2>/dev/null)
    cat /proc/$$/winpid >"$W.win.neu" 2>/dev/null && mv -f "$W.win.neu" "$W.win"
    # erst die Meldung, dann die Schloss-Bibliothek (ihr Ort kommt aus node schloss-ort.cjs, ~0,5 s): gpu-lauf wartet nur auf die winpid
    . "${GPU_LAUF_SCHLOSS_SH:-/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh}"
    GPU_SCHLOSS=${GPU_LAUF_SCHLOSS:-$GPU_SCHLOSS}; GPU_HOOK_LOG=${GPU_LAUF_HOOKLOG:-$GPU_HOOK_LOG}
    msys_liste() { ps -e 2>/dev/null | awk 'NR > 1 { o = ($1 ~ /^[0-9]+$/) ? 0 : 1; print $(1 + o), $(2 + o), $(4 + o) }'; }
    msys_baum() {
        msys_liste | awk -v w="$1" '{ wp[$1] = $3; k[$2] = k[$2] " " $1 }
            END { if (!(w in wp)) exit; q[1] = w; s[w] = 1; n = 1
                  for (i = 1; i <= n; i++) { m = split(k[q[i]], a, " "); for (j = 1; j <= m; j++) if (!(a[j] in s)) { s[a[j]] = 1; q[++n] = a[j] } }
                  for (i = 1; i <= n; i++) print q[i], wp[q[i]] }'
    }
    win_liste() {
        { wmic process get CreationDate,ParentProcessId,ProcessId 2>/dev/null ||
            powershell -NoProfile -Command 'Get-CimInstance Win32_Process | ForEach-Object { "{0} {1} {2}" -f $_.CreationDate.ToString("yyyyMMddHHmmss.ffffff"), $_.ParentProcessId, $_.ProcessId }'; } |
            tr -d '\r' | awk '$2 ~ /^[0-9]+$/ && $3 ~ /^[0-9]+$/ { print $1, $2, $3 }'
    }
    win_baum() {
        win_liste | W="$1" awk '{ er[$3] = $1; k[$2] = k[$2] " " $3 }
            END { m0 = split(ENVIRON["W"], r, " "); n = 0
                  for (i = 1; i <= m0; i++) if ((r[i] in er) && !(r[i] in s)) { s[r[i]] = 1; q[++n] = r[i] }
                  for (i = 1; i <= n; i++) { m = split(k[q[i]], a, " "); for (j = 1; j <= m; j++) { c = a[j]; if (!(c in s) && er[c] >= er[q[i]]) { s[c] = 1; q[++n] = c } } }
                  for (i = 1; i <= n; i++) print q[i], er[q[i]] }'
    }
    win_lebt() {
        [ -n "$1" ] || return 0
        win_liste | G="$1" awk 'BEGIN { m = split(ENVIRON["G"], z, "\n"); for (i = 1; i <= m; i++) { split(z[i], f, " "); if (f[1] != "") soll[f[1]] = f[2] } }
            ($3 in soll) && soll[$3] == $1 { print $3 }'
    }
    BLEIBT=""
    baum_ab() {
        local glieder wins wbaum w p i rest=""
        [ -n "$KIND" ] || return 0
        glieder=$(msys_baum "$KIND")
        wins=$(echo "$glieder" | awk '$2 ~ /^[0-9]+$/ { printf "%s ", $2 }')
        wbaum=$(win_baum "$wins")
        for w in $wins; do taskkill -F -T -PID "$w" >/dev/null 2>&1; done
        for p in $(echo "$glieder" | awk '{ print $1 }'); do kill -9 "$p" 2>/dev/null; done
        [ -n "$wbaum" ] || return 0
        for i in 1 2 3 4 5 6; do
            rest=$(win_lebt "$wbaum")
            [ -z "$rest" ] && return 0
            for w in $rest; do taskkill -F -T -PID "$w" >/dev/null 2>&1; done
            sleep 1
        done
        BLEIBT=$(echo "$rest" | head -n 1)
    }
    B="$GPU_SCHLOSS/besitzer.txt"
    while :; do
        [ -z "$KIND" ] && [ -s "$W.kind" ] && KIND=$(cat "$W.kind")
        [ -n "$KIND" ] && ! kill -0 "$KIND" 2>/dev/null && break
        if [ -e "$STOP" ] || ! kill -0 "$GL_PID" 2>/dev/null; then baum_ab; break; fi
        sleep 1
    done
    rm -f "$W.kind" "$W.win"
    if kill -0 "$GL_PID" 2>/dev/null; then
        [ "$(schloss_erster)" = "$NAME" ] && printf '%s\npid=%s\n' "$NAME" "$GL_WIN" >"$B"
        echo "$BLEIBT" >"$W.bleibt"
    elif [ -n "$BLEIBT" ]; then
        [ "$(schloss_erster)" = "$NAME" ] && printf '%s (Enkel)\npid=%s\n' "$NAME" "$BLEIBT" >"$B"
    else
        schloss_loesen "$NAME"
    fi
    rm -f "$STOP"
    exit 0
fi
. "${GPU_LAUF_SCHLOSS_SH:-/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh}"
# nur für den Selbsttest: ein eigenes Schloss und ein eigenes Hook-Log (und eine andere Schloss-Quelle, GPU_LAUF_SCHLOSS_SH)
GPU_SCHLOSS=${GPU_LAUF_SCHLOSS:-$GPU_SCHLOSS}; GPU_HOOK_LOG=${GPU_LAUF_HOOKLOG:-$GPU_HOOK_LOG}
# DER WÄCHTER JE HALTE-SPANNE (oben, `--waechter`): vor jedem Nehmen startet er (fork + exec, in Windows NICHT unter gpu-lauf, keine
# Ausgabe), meldet seine winpid selbst (vor seinem exec trüge /proc die des fork-Stumpfs), und `nimm` schreibt SIE in besitzer.txt
W="$GPU_SCHLOSS.wache.$$"; WACHE=; WACHE_WIN=; BLEIBT=
wache_an() {
  rm -f "$W".*
  bash "${BASH_SOURCE[0]}" --waechter $$ "$W" "$NAME" >/dev/null 2>&1 </dev/null & WACHE=$!
  local i; for i in $(seq 1 600); do [ -s "$W.win" ] && break; kill -0 "$WACHE" 2>/dev/null || break; sleep 0.1; done
  WACHE_WIN=$(cat "$W.win" 2>/dev/null)
  [ -n "$WACHE_WIN" ] || { echo "gpu-lauf: ROT - der Wächter meldete binnen 60 s keine winpid ($W.win); ohne ihn nimmt gpu-lauf kein Schloss" >&2; kill "$WACHE" 2>/dev/null; WACHE=; exit 70; }
}
NAME="omen-${1:?name}"; shift
WARTE=${GPU_LAUF_WARTE_S:-2700}; MAX=${GPU_LAUF_MAX_S:-3600}; T0=$(date +%s); TOT=$(( T0 + WARTE + MAX ))
VMAX=${GPU_LAUF_VERDRAENGT_MAX:-3}; VERDR=0; WEICH=${GPU_LAUF_WEICH_S:-0}; DLOG=${GPU_LAUF_DLOG:-/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/messplatz/dienst.log}
[ -f "$DLOG" ] && GPU_VERWAIST_LOG=$DLOG   # die VERWAIST-Zeile (10.11.) steht auch im Dienst-Log, neben VERDRÄNGT
worker() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
# der freie Commit des Systems in GB (physischer Speicher + Auslagerung, was noch zugesagt werden kann) — nur gelesen, wenn ein CI-Job eintrifft
commit_frei() { local k; k=$(powershell -NoProfile -Command "(Get-CimInstance Win32_OperatingSystem).FreeVirtualMemory" 2>/dev/null | tr -dc 0-9); [ -n "$k" ] && echo "$(( k / 1048576 )),$(( k % 1048576 * 10 / 1048576 )) GB" || echo "?"; }
versuch() { ! worker && ! ci_wartet && [ "$(ci_ruhe_rest)" -le 0 ] && mkdir "$GPU_SCHLOSS" 2>/dev/null; }
nimm() { # $1 spätester Zeitpunkt (s) — wartet auf das Schloss und das Ende der CI-Ruhe (VOR dem Schloss, 25.10.), nimmt es, Herzschlag;
  # ein verwaistes Schloss bricht der Wartende selbst und übernimmt es sofort (gs_uebernimm, 10.11.)
  # DAS WORT DES WARTENDEN (15.11.): alle GPU_LAUF_WORT_S (240) s eine Zeile auf stderr, solange das Schloss nicht frei ist. punkte.cjs
  # gibt das Schloss nach 600 s Schweigen auf (SCHLOSS_STILL_S) — am 3e4f99cd hielt ein CI-Job die Karte 17 min 48 s, dieser Warter
  # schwieg, 18 von 23 Stationen der Sitzung blieben ungemessen. Die Zeile beginnt nie mit „gpu-lauf: Schloss “ (das läse der Warter
  # als genommen); sie fällt nur hier, wo kein Kind lebt (vor dem Start und nach der Verdrängung) — das Gesetz der Leitung oben bleibt.
  local w0=$(date +%s) wort=${GPU_LAUF_WORT_S:-240} j
  until versuch; do
    gs_uebernimm versuch "$NAME" && break
    j=$(date +%s)
    [ $j -ge "$1" ] && { echo "SCHLOSS BLOCKIERT von '$(schloss_erster)' nach $(( j - T0 )) s Warten" >&2; exit 75; }
    [ $(( j - w0 )) -ge "$wort" ] && { w0=$j; echo "gpu-lauf: wartet seit $(( j - T0 )) s ('$(schloss_erster)' hält das Schloss, ein CI-Job läuft oder wartet, oder CI-Ruhe)" >&2; }
    sleep $(( wort < 15 ? wort : 15 ))
  done
  printf '%s\npid=%s\n' "$NAME" "$WACHE_WIN" > "$GPU_SCHLOSS/besitzer.txt"
  # DIE MELDUNG (30.10.) — dasselbe Protokoll wie die kanonische artifacts/profiband/werkzeug/gpu-lauf.sh: punkte.cjs wartet auf genau
  # „gpu-lauf: Schloss …“ (und liest „SCHLOSS BLOCKIERT …“ beim Exit 75). Ohne die Zeile starb der stille Warter der Mess-Sitzung nach
  # 600 s („schwieg“), obwohl das Schloss stand — takt25b/p/h am 6b3da705 je 0 gemessen; die alte Fehlzeile „gpu-lauf: Schloss nach …
  # nicht frei“ hätte der Warter sogar als genommen gelesen.
  echo "gpu-lauf: Schloss $NAME nach $(( $(date +%s) - T0 )) s" >&2
  # der Herzschlag ohne Ausgabe-Kanal (11.11.: sein `sleep 300` hielt die Leitung einer Kette `gpu-lauf … | uhr > log` nach dem Lauf bis zu 5 min offen)
  ( while sleep 300; do [ "$(schloss_erster)" = "$NAME" ] && touch "$GPU_SCHLOSS/besitzer.txt"; done ) >/dev/null 2>&1 & HERZ=$!
}
trap 'kill $HERZ 2>/dev/null; schloss_loesen "$NAME"' EXIT
# DER BAUM DES KINDS FÄLLT ÜBER DEN WÄCHTER: `abbau` bittet ihn und wartet, bis er den Baum gefällt hat; BLEIBT nennt ein Glied, das
# nach 6 s noch lebt — dann hält es das Schloss (`halte_ueberlebenden`), bis es endet (die Hooks lösen einen toten Halter). TERM/INT
# (der Wächter eines Rufers) fällen den Baum; bis hier löste die EXIT-Falle das Schloss neben dem lebenden Kind.
abbau() {
  BLEIBT=
  [ -n "$WACHE" ] || return 0
  touch "$W.stop"; wait "$WACHE" 2>/dev/null; WACHE=
  BLEIBT=$(cat "$W.bleibt" 2>/dev/null); rm -f "$W.bleibt"
  [ -n "$KIND" ] && wait "$KIND" 2>/dev/null
  return 0
}
halte_ueberlebenden() {
  [ -n "$BLEIBT" ] || return 0
  kill $HERZ 2>/dev/null; printf '%s (Enkel)\npid=%s\n' "$NAME" "$BLEIBT" > "$GPU_SCHLOSS/besitzer.txt"; trap - EXIT
  echo "gpu-lauf: ein Glied des Baums überlebt (pid $BLEIBT) - das Schloss bleibt bei ihm, bis es endet" >&2
}
trap 'abbau; halte_ueberlebenden; exit 143' TERM
trap 'abbau; halte_ueberlebenden; exit 130' INT
KIND=
wache_an
nimm $(( T0 + WARTE ))
while :; do
  TS=$(( $(date +%s) - 1 )); W0=
  "$@" & KIND=$!
  echo "$KIND" > "$W.kind"
  ENDE=$(( $(date +%s) + MAX )); [ $ENDE -gt $TOT ] && ENDE=$TOT
  V=
  while kill -0 $KIND 2>/dev/null; do
    if [ $(date +%s) -ge $ENDE ]; then
      abbau
      echo "gpu-lauf: Deckel $(( ENDE - TS )) s - der Prozessbaum des Kinds fiel" >&2
      halte_ueberlebenden
      exit 124
    fi
    if [ $VERDR -lt $VMAX ] && ci_wartet; then
      if [ -z "$W0" ]; then
        W0=$(date +%s)
        if [ "$WEICH" -gt 0 ]; then
          [ -f "$DLOG" ] && echo "$(date '+%F %T') gpu-lauf $NAME WEICHT: ein CI-Job wartet nach $(( W0 - TS )) s Lauf - misst zu Ende, hoechstens $WEICH s · Commit frei $(commit_frei)" >> "$DLOG"
        fi
      fi
      [ $(( $(date +%s) - W0 )) -ge "$WEICH" ] && { V=1; break; }
    else W0=; fi
    sleep 2
  done
  if [ -z "$V" ]; then
    wait $KIND; E=$?
    wait "$WACHE" 2>/dev/null; WACHE=
    [ -n "$W0" ] && [ "$WEICH" -gt 0 ] && echo "gpu-lauf: WICH - ein CI-Job wartete im Start-Hook $(( $(date +%s) - W0 )) s; der Lauf endete an seiner Grenze (Exit $E), die Karte geht frei" >&2
    # EIN LAUF, DEN EIN SIGNAL FAELLTE, IST NIE GANZ (12.11., Koordinator): Exit > 128 heisst gestorben (139 = Segmentation fault) —
    # am 12.11. starb ein Lauf zweimal binnen 2 s nach dem Eintreffen eines CI-Jobs im Start-Hook (17:33:50 sg-vk-ankunft, 17:58:53
    # sg-vk-netz-main), und diese Zeile nannte ihn „ganz (Exit 139)“. Jetzt nennt sie den Absturz beim Namen, samt dem freien Commit
    # (die erste Spur: 3,3 von 18,9 GB frei waehrend des CI-Jobs; das Ereignisprotokoll schwieg an beiden Stellen).
    if [ -n "$W0" ] && [ -f "$DLOG" ]; then
      if [ "$E" -gt 128 ]; then echo "$(date '+%F %T') gpu-lauf $NAME STARB BEIM WEICHEN: Exit $E (Signal $(( E - 128 ))) $(( $(date +%s) - W0 )) s nach dem Eintreffen des CI-Jobs, nach $(( $(date +%s) - TS )) s Lauf - der Lauf ist NICHT ganz · Commit frei $(commit_frei)" >> "$DLOG"
      else echo "$(date '+%F %T') gpu-lauf $NAME ENDETE AN DER GRENZE: der CI-Job wartete $(( $(date +%s) - W0 )) s, der Lauf ist ganz (Exit $E)" >> "$DLOG"; fi
    fi
    exit $E
  fi
  VERDR=$(( VERDR + 1 ))
  [ -f "$DLOG" ] && echo "$(date '+%F %T') gpu-lauf $NAME VERDRÄNGT $VERDR/$VMAX nach $(( $(date +%s) - TS )) s von einem CI-Job - Neustart nach dem Job" >> "$DLOG"
  abbau
  echo "gpu-lauf: VERDRAENGT $VERDR/$VMAX nach $(( $(date +%s) - TS )) s - ein CI-Job wartet; der Lauf fiel samt Waisen, Neustart nach dem Job" >&2
  powershell -NoProfile -ExecutionPolicy Bypass -File "$(cygpath -w /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-verdraengt.ps1)" $TS "${GPU_LAUF_VERDR_NUR:-}" >&2
  kill $HERZ 2>/dev/null; schloss_loesen "$NAME"
  sleep 20   # der Hook greift in seinem 15-s-Takt zu; danach hält worker() bis zum Job-Ende fern
  wache_an
  nimm $(( TOT - 60 ))
done

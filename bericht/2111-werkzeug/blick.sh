#!/bin/bash
# bash blick.sh <name> <sha40> — der Blick in die Welt der Hand-Sitzung an der Radeon WÄHREND Probe und Preis-Lauf von
# karte2.same.kopplung.aufwaerts#1: startet den Hand-Lauf (hand-buch-n.sh) im Hintergrund, liest den Port der Welt aus seiner
# Ausgabe und fragt alle 4 s über `werkbank eval` (nur lesend) Lade-Takt, Ankunfts-Ferne, Offenes, Leine, Uhr, Heap, Pose und die
# größten Sammlungen der Welt. Zeilen nach aufw/<name>.blick.txt. Frage: warum zeichnet der Preis-Lauf kein Bild, was hält 2,7 GB?
export MSYS_NO_PATHCONV=1; export NODE_PATH="C:/Users/micha/AnazhRealm-profiband/node_modules"
S="C:/Users/micha/AppData/Local/Temp/claude/3c7f7ef9549389d2/9198e0cd-302f-42e2-be9b-9e3a035ce699/scratchpad"
N=$1; H=$2; B="$S/aufw/$N.blick.txt"; O="$S/vr/$N.out"; A=C:/Users/micha/AnazhRealm-auge-4a188
: > "$B"; rm -f "$O"
bash "$S/hand-buch-n.sh" "$N" "$H" "karte2.same.kopplung.aufwaerts#1" & HP=$!
P=""; for i in $(seq 1 900); do P=$(grep -a -o "Welt :[0-9]*" "$O" 2>/dev/null | head -1 | cut -d: -f2); [ -n "$P" ] && break; kill -0 $HP 2>/dev/null || break; sleep 1; done
echo "PORT ${P:-keiner} nach ${i} s · $(date +%H:%M:%S)" >> "$B"
[ -n "$P" ] || { wait $HP; exit 3; }
CODE='const st = r.state, L = r._gpuLeine || {}, m = performance.memory || {};
const f = (n) => { try { return typeof r[n] === "function" ? r[n]() : r[n]; } catch (e) { return "wirft " + String(e.message).slice(0, 60); } };
const p = st.playerMesh && st.playerMesh.position, c = st.camera && st.camera.position;
const gross = [];
for (const q of [[r, "r."], [st, "st."], [window, "w."]]) for (const k of Object.keys(q[0])) { let v; try { v = q[0][k]; } catch (e) { continue; } const n = v instanceof Map || v instanceof Set ? v.size : Array.isArray(v) ? v.length : v && v.byteLength ? v.byteLength : 0; if (n >= 2000) gross.push([q[1] + k, n]); }
gross.sort((a, b) => b[1] - a[1]);
return "BLICK " + JSON.stringify({ t: +(performance.now() / 1000).toFixed(1), lade: f("_ladeTakt"), ferne: f("_ankunftsFerne"), offen: f("_weltOffen"), akte: String(f("_weltOffenAkte")).slice(0, 500), bildDa: !!st._weltbildDa, fehlt: st._weltbildDa ? "" : String(f("_weltbildFehlt")).slice(0, 120), ruht: f("_loopRuht"), straff: f("_gpuLeineStraff"), leine: Object.fromEntries(Object.entries(L).filter(([, v]) => typeof v !== "object" && typeof v !== "function")), bildZeit: r._bildZeit, spielZeit: Math.round(st.spielZeit), wetter: st.weather, halt: st.weatherEffectTime, heapMB: Math.round((m.usedJSHeapSize || 0) / 1048576), p: p && [p.x, p.y, p.z].map(Math.round), c: c && [c.x, c.y, c.z].map(Math.round), raffer: typeof window.__raffer, chunks: st.voxelChunks && st.voxelChunks.size, gross: gross.slice(0, 14) });'
cd "$A" || exit 4
while kill -0 $HP 2>/dev/null; do
    z=$(timeout 12 node scripts/werkbank.cjs eval "$CODE" --port "$P" 2>&1 | grep -a -o "BLICK .*" | head -1 | cut -c1-2400)
    echo "$(date +%H:%M:%S) ${z:-keine Antwort} · AUS: $(grep -a -c "" "$O" 2>/dev/null) Zeilen, zuletzt: $(tail -n 1 "$O" 2>/dev/null | cut -c1-110)" >> "$B"
    sleep 4
done
wait $HP; echo "ENDE Exit $? · $(date +%H:%M:%S)" >> "$B"

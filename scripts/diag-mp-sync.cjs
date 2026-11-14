// diag-mp-sync.cjs — DIE MEHRSPIELER-WAND (`npm run gate:mp-sync`). Die CI-Wand der Zwei-Seiten-Familie
// (smoke-webrtc · smoke-copresence: zwei echte Seiten, ein echter signaling-server; der Bit-Beweis des Leibs aus smoke-lockstep
// fiel in (e)).
//
// Zwei Klassen beim Namen:
//   (a) URSPRUNG  der Mitspieler erscheint nie im Weltursprung: `_p2pEnsurePeerEntry` legte Leib und Schild bei
//                 peer-join/welcome sichtbar bei 0/0/0 an, bis die erste Position kam. Gezählt wird je Spiel-Takt
//                 (`p2pTick`, der Takt, der den Leib zeichnet) jedes sichtbare Peer-Objekt bei x = z = 0 — getrennt,
//                 ob seine Seite je einen Ort des Peers empfing (pos oder Lockstep-Schritt). Soll: 0.
//   (b) TÜR       die Absicht trägt die Tür selbst: `initP2PSync` setzte `p2p.enabled` nie, der close-Zweig und
//                 `_p2pScheduleReconnect` planen den Rejoin nur bei `enabled` — ein nackter Aufruf, dessen erster Aufbau
//                 scheitert (signaling-server aus), heilte nie. Probe: Server beim Aufbau 3 s aus, dann an; Rejoin
//                 ≤ 31 s (Backoff-Deckel 30 s + Jitter). Täter, wenn ROT: der Rejoin liest eine Absicht, die die Tür
//                 nie setzte.
//   (c) GRABEN    das Chat-Graben reist: A tippt „voxel carve" und „voxel fill" im Gespräch, B trägt GENAU dieselben Edits —
//                 geurteilt im Abdruck von (e) (Täter, wenn einer fehlt: `_chatTryVoxelDebugCommand` schnitzt direkt statt über
//                 dslRun; wenn B mehr trägt: der Empfang wendet eine Akt-Nachricht mehrfach an).
//   (d) LANGE TAKTE B trägt Takte, in denen je Takt mindestens 2 × `aufholJeSchritt` Schritte von A ankommen: B sieht A
//                 an dessen Ort, und JEDER Takt hält das Gesetz (`taktBruch`): er verbraucht bis zur Kappe der Wanduhr
//                 ceil(aufholJeSchritt × dt/FIXED_DT) oder bis zur Jitter-Reserve, nie weniger, nie mehr (Täter
//                 `_lockstepTickPeers`: die Kappe zählt Frames statt Wanduhr). Der Selbsttest im Hauptlauf setzt die alte
//                 Kappe ein → (d) ROT am Gesetz; der aufgenommene Schub vor dem Fenster (`SCHUB_VOR_DEM_FENSTER`) hält es.
//   (e) GLEICH FÜR ALLE (feld.K2) Saat + Schreib-Akte = Welt: A gräbt (c) und baut per Chat („bau mir ein haus" →
//                 spawn_studio); B trägt denselben `abdruck`, nach einem Reload von B derselbe. Das Netz-Log zählt jede Sendung
//                 am Draht: jede Art außer `NETZ_ERLAUBT` ist eine Zustands-Nachricht. Der Leib: B's Ghost rechnet jeden Schritt
//                 von A bit-gleich (je seq). Selbsttests: B wendet jede Akt-Nachricht doppelt an und verschiebt den Samen des
//                 Baus → Edits und Bauten ROT; A sendet eine Wetter-Nachricht → das Netz-Log ROT.
//   (f) DIE WELT-UHR (feld.K2#2): alle Teil-Simulationen aus Saat + Akten. A springt 20 min Spielzeit in einen Zug, in dem
//                 am Ort ein Sturm aufzieht (erst in den Zug davor); B folgt der Uhr von A (`pos.w`, `_weltUhrNimm`) — der Zug der
//                 Welt-Uhr steht hart im Abdruck von (e), über Peers und den Reload mitten im Sturm. Je Seite gleich: das Wetter
//                 (Wort, Übergang — der Wunsch der Welt reist als Akt), das Leben je lebender Zelle (Betrag und Stempel: der Fraß
//                 des Bestands im Takt der Welt-Uhr, die Pflege von A im Gespräch als Akt), der Pegel des Jahrs (Hub je Höhe aus
//                 Regen und Schmelze) und der Brand (je Zelle Ankunft, Zünd- und End-Zeit). Verglichen wird im selben Moment des
//                 Felds (das zuletzt gerechnete Ereignis seiner Folge, `feldLetzt`). Selbsttest: B mit eigener Uhr → der Zug ROT.
//                 Dazu die Boden-Klasse des Bestands (`_bodenKlasseAt`): mit und ohne Erdbau der Orte dieselbe (sie liest nur die
//                 Saat, `_terrainSaatY`); Selbsttest: die alte Lesart samt Erdbau kippt. DIE EINE FOLGE DES FELDS (w28-mp-boden):
//                 kein Akt wirkt, während ein Takt einer nahen Region vor seinem Stempel aussteht (`aktSpion` an `_feldAktWirkt`
//                 seit der Geburt der Seite; am Eingang `_feldAkt` tritt er in die Reihe, Selbsttest: der alte Eingang lässt ihn
//                 wirken); die gemerkte Boden-Klasse je Zelle ist die frische, auf beiden Seiten dieselbe (`klasseUrteil`,
//                 Selbsttest: eine falsch gemerkte Klasse); eine Region über einer Hydro-Kachel, die noch nicht da ist, rechnet
//                 nicht und merkt nichts (`_bestandBereit`, Selbsttest: das alte Merkbuch). Fällt (f), nennt der BEFUND den Grund
//                 beim Namen (`lebenBefund`: Moment, Klasse, Bestand, Akte, Folge, Zellen; `pegelBefund`: die Sekunde der Tafel).
//   (g) STILLE (mp-leitung): ein stiller Partner ist nicht weg. A schweigt 15 s (die Pumpe ruht, der Loop steht wie in einem
//                 verborgenen Tab), B tickt weiter; zurück ist A, wenn B's Ghost den ersten Anker von A nach der Stille rechnet
//                 (geurteilt an diesem Ereignis, oder sofort, wenn die Leitung nicht mehr offen steht), und (e) Leib rechnet den
//                 Lauf danach bit-gleich. Täter beim Namen: ein Abschied von A ohne `peer-leave` des Brokers (der alte
//                 Leerlauf-Abschied in `p2pTick`: 10 s ohne Nachricht → `_p2pRemovePeer` riss die Leitung, die Rückkehr kam
//                 ohne sie). Selbsttest am Ende: B trägt den alten Abschied → (g) ROT beim Namen. Unter Last (3 Läufe parallel,
//                 je samt Chrome auf 2 Kernen, `taskset -c 0,1`): vorher 1 von 3 GRÜN (2× „A kennt B … keine Leitung"),
//                 nachher 6 von 6.
//   (h) DAS GESETZ DES SPIELERS (ultiversum.K4): A schreibt im Gespräch ein Gesetz („wann immer es zufällig passt, dann
//                 erzähle …"), neu — sein Hash (`_regelHash`) steht in keiner Vorlage (`GESETZ_VORLAGEN` über den EINEN Satz-Parser
//                 `_regelAusSatz`, die Gesetze, die A's Welt schon trägt); B trägt es als Gesetz von A (`_gesetzGeber`), würfelt in
//                 jeder Scheibe der Welt-Uhr denselben Wurf wie A, obwohl B's Nexus drei Regeln mehr zählte (Täter, wenn nicht:
//                 `_worldRuleSeed` trägt die Platz-Nummer), und die Wirkung (die Erzählung im Wissen, B's Tagebuch nennt A) steht
//                 auf beiden Seiten. Selbsttests: A sagt die Vorlage → neu ROT; B's dsl-Kanal taub → reist ROT.
//   (i) DIE TAT DER KI REIST: A's Begleiter baut (dslRun als "llm:grok"), B trägt das Werk mit derselben Kennung; ein Gesetz der
//                 KI (Kopf "rule") bleibt lokal. Geurteilt an der Marke (A baut danach als Spieler: trägt B sie, trug der Kanal
//                 alles davor). Vorher 0/1 (das Tor las nur "human"), nachher 1/1. Selbsttest: das alte Tor in `_tatReist` → 0/1.
// Dazu der Spielpfad: Seite A über den KNOPF (`#p2p-toggle`, zweiter Klick im Aufbau startet kein zweites Init, der
// Knopf liest die EINE Absicht), Seite B über den BOOT (die gemerkte Absicht aus `p2pPersist`). A läuft nach dem
// Ladeschirm über die Tastatur (`_stepCharacter`; A bootete zuerst, sein Ladeschirm fällt zuerst), B sieht A an dessen
// Ort (±0,3 m waagrecht). Die Latenz (A bewegt sich → B sieht es) fiel mit mp-leitung: sie maß den Läufer, nie das Spiel (die
// alte Wand „≤ 150 ms, lokal" lag unter drei parallelen Läufen in 3 von 6 Läufen ohne Stillstand darüber, 212–488 ms), ihr
// Gesetz urteilen (d) je Takt und der Ort.
// Konsum-Leser: `_p2pUpdatePeer` (zeichnet den Peer je Takt) und der close-Zweig von `initP2PSync` (plant den Rejoin).
// (h) liest `_tickWorldRules` (das Gesetz feuert je Scheibe der Welt-Uhr, auf jeder Seite) und `_journalRuleAwoke` (B's Tagebuch).
// DER TAKT JEDER SEITE: beide Seiten fahren den Null-Renderer (kein GPU-Prozess, die Probe misst kein Pixel), ihren Loop
// treibt ab der Geburt die Pumpe (`seitenPumpe`, ein Zeitgeber, nie rAF) — verborgen wie sichtbar. Vorher liefen zwei
// GL-Seiten auf swiftshader: die verborgene stand unter Last bis 51,7 s im synchronen Rücklesen, der Leerlauf-Abschied
// (`p2pTick`, 10 s, gefallen mit (g)) riss die Leitung ab, und die Probe las einen Mitspieler, den es nicht mehr gab. Geurteilt wird erst,
// wenn die Seite den Mitspieler MIT Gestalt über eine offene Leitung kennt (`kenntMitGestalt`).
//
// Selbsttest (`--selftest`): die alte Tür wieder eingesetzt (initP2PSync lässt `enabled`, wie es war) → (b) ROT. Die
// Selbsttests von (c), (d), (e) und (g) laufen im Hauptlauf. (b) wartet auf sein Ereignis (A verbunden, oder die Absicht
// fehlt), nie in einer Wanduhr-Schleife.
// Ports: MP_SYNC_PORT (save-server), MP_SYNC_SIGNAL_PORT (signaling), sonst freie des Systems.
//
//   node scripts/diag-mp-sync.cjs [--selftest]
"use strict";
const { starteBrowser, nullRenderer, halteBis, startProc, eigenePorte, sleep, waitFor, hauptLauf, SELBSTTEST } = require("./lib/welt-boot.cjs");

// die eigenen Ports: MP_SYNC_PORT und MP_SYNC_SIGNAL_PORT, sonst freie des Systems (welt-boot `eigenePorte`) — nie 4312/4313, die Server des Schöpfers
let PORT, SIGNAL_PORT, PAGE_URL, SIGNALING_URL;
const ROOM = "mp-sync-raum";
const REJOIN_DECKEL_S = 31;
const ABSTAND_M = 0.3;
// Der Lauf von A: W hält, bis A LAUF_M vom Start steht (das Urteil verlangt > 1 m), höchstens LAUF_FRIST_MS — nie eine feste Uhr.
const LAUF_M = 1.5;
const LAUF_FRIST_MS = 30000;
// (d) der lange Takt bei B, in Schritten: B tickt erst, wenn ZUFLUSS_FAKTOR × aufholJeSchritt Schritte von A angekommen
// sind — das Szenario steht in Schritten je Takt, nie in Millisekunden des Läufers.
const ZUFLUSS_FAKTOR = 2;
// (g) die Stille von A in s: länger als der alte Leerlauf-Abschied (10 s), kürzer als zwei Pulse des Brokers
const STILLE_S = 15;
// Nachlauf nach dem Eintreffen der Edits bei B: eine zweite Anwendung derselben Nachricht kann nach der ersten landen.
const GRABEN_NACHLAUF_MS = 800;
// (e) die erlaubten Arten am Draht — Schreib-Akt, der Leib des Spielers, die Sicht der eigenen Wesen, die Leitung
// die erlaubten Arten am Draht: der Schreib-Akt (dsl), der Leib (pos, input, soul, vibe), die Sicht (creature-pos,
// companion-say) und die Leitung (join, rtc-offer, rtc-answer, rtc-ice, stats)
const NETZ_ERLAUBT = new Set("dsl pos input soul vibe creature-pos companion-say join rtc-offer rtc-answer rtc-ice stats".split(" "));
// Das Netz-Log der Seite (vor ihrem ersten Skript, über jeden Reload): jede Sendung am Draht nach ihrer Art
function netzLog() {
    const log = (window.__netz = {});
    const zaehle = (d) => {
        let t = "?";
        try {
            t = String(JSON.parse(d).type);
        } catch {
            /* kein JSON: die Art bleibt „?" */
        }
        log[t] = (log[t] | 0) + 1;
    };
    for (const K of [window.WebSocket, window.RTCDataChannel]) {
        const send = K && K.prototype.send;
        if (send)
            K.prototype.send = function (d) {
                zaehle(d);
                return send.call(this, d);
            };
    }
}
// DIE PUMPE (Seite, vor ihrem ersten Skript, über jeden Reload): unter dem Null-Renderer ruft niemand den Loop
// (`setAnimationLoop` ist dort leer) — ein Zeitgeber je 16 ms tut es, sobald die Welt ihn trägt; ein verborgener Tab tickt
// mit (Puppeteer startet Chrome ohne Hintergrund-Drosselung der Zeitgeber, ChromeLauncher `--disable-background-timer-throttling`)
function seitenPumpe() {
    setInterval(() => {
        if (!r || !r._gameLoopTick || window.__pumpeSteht) return; // die Pumpe steht (g) — kein Name der Seiten-Werkzeuge
        try {
            r._gameLoopTick(performance.now());
        } catch {
            /* der Loop trägt seine eigene Fehlerwand */
        }
    }, 16);
}
// DIE MARKE (Seite): die Seite kennt den Mitspieler MIT Gestalt (sein Leib `mesh` steht in `peers`) über eine offene Leitung
// (`rtcPeers`: über sie reisen Eingaben und Anker), `rechnet` dazu: ihr Ghost hat seinen Anker (`lockstep.seeded`). Der
// Eintrag allein (`peers.has`) entsteht schon mit dem welcome, vor jeder Leitung. Was fehlt, steht beim Namen in `__marke`.
function kenntMitGestalt(id, rechnet) {
    const p2p = st.p2p;
    const e = p2p.peers.get(id);
    const rtc = p2p.rtcPeers.get(id);
    window.__marke = !e
        ? "kein Eintrag"
        : !e.mesh
          ? "kein Leib"
          : !rtc
            ? "keine Leitung"
            : !rtc.open
              ? `Leitung ${rtc.pc.connectionState} ohne offenen Kanal`
              : rechnet && !e.lockstep?.seeded
                ? "Ghost ohne Anker"
                : "";
    return !__marke;
}
// Der Abdruck der Welt aus den Schreib-Akten (Seite): die Edits, die Bauten der Akte (`bauten`, je eine Kennung), der Boden an
// jedem Edit und (f) der Zug der Welt-Uhr — als JSON-Text, byte-gleich oder nicht; dazu (f) das Wetter (Wort, Übergang) mit seinem
// Schreiber (`wer`, der Täter beim Namen — auch der Wunsch der Welt, den der Zug zog, ohne das Wort zu ändern),
// das Leben je lebender Zelle, wie der Stand es trägt (`_lebenImStand`: eine Zelle unter epsilon ist tot, ihr Eintrag nur Gedächtnis
// der Räumung), der Pegel (die Tafel `_pegelGilt`) und der Brand je Zelle
function abdruck(bauten, nahe) {
    const st = r.state;
    const edits = (st.worldMeta.voxelEdits || []).map((e) => [e.mode, e.r, e.x, e.y, e.z]);
    const B = (st.architectures || [])
        .filter((e) => bauten.includes(String(e.id)))
        .map((e) => [
            String(e.id),
            e.type,
            e.position.x,
            e.position.y,
            e.position.z,
            e.rotationY,
            e.scale,
            e.seed,
            e.studioOv || null,
        ]);
    const boden = edits.map(([, , x, y, z]) => [r._terrainDensityAt(x, y, z), r._voxelSurfaceY(x, z)]);
    const wt = st.weatherTransition;
    const wetter = JSON.stringify([st.weather, wt && [wt.from, wt.to, wt.startedAt, wt.duration]]);
    const stand = r._lebenImStand(nahe);
    const leben = stand.feld.map(String).sort();
    // (f) DER BEFUND hinter „leben VERSCHIEDEN“ (`lebenBefund`): was das Leben rechnet, je Seite — die gemerkte Boden-Klasse je
    // Zelle des Bestands neben der frischen (`_bestandKlassen` ↔ `_bodenKlasseAt`), der Bestand je naher Region (Takt, Zähler,
    // Tiere), die gewirkten Akte, die Folge am Eingang (`aktSpion`) und die Hydro-Kacheln der Seite
    const [BR, S] = [r.constructor.BESTAND_REGION, r._bestandSeite()];
    const gemerkt = (r._bestandKlassen && r._bestandKlassen.map) || new Map();
    const klassen = [];
    for (const key of nahe || r._bestandNah()) {
        const [ix, iz] = key.split(",").map(Number);
        for (let i = 0; i < BR.zellen; i++)
            for (let j = 0; j < BR.zellen; j++) {
                const k = key + ":" + i + "," + j;
                const frisch = r._bodenKlasseAt((ix + (i + 0.5) / BR.zellen) * S, (iz + (j + 0.5) / BR.zellen) * S);
                klassen.push([k, gemerkt.has(k) ? gemerkt.get(k) : null, frisch]);
            }
    }
    const bestand = Object.entries(stand.bestand)
        .sort()
        .map(([k, R]) => [k, R.t, R.seq, R.tiere.map((t) => t.id + "@" + t.alterS).sort().join(" ")]);
    const befund = {
        uhr: st.spielZeit,
        horizont: r._feldHorizont(),
        klassen,
        bestand,
        gewirkt: stand.gewirkt.slice().sort(),
        offen: stand.akte.length,
        folge: window.__aktFolge || null,
        hydro: [...(st.hydroTiles || new Map()).keys()].sort().join(" "),
        pegelSek: r._pegelSek,
    };
    return { takt: st.faunaLifecycle.feldLetzt, edits, bauten: B.sort(), boden, zug: r._wetterZug, wetter, wer: st.weather + " von " + st.wetterSchreiber, leben, pegel: r._pegelGilt(), brand: [...(st.brandFeld || [])], befund };
}
// (f) DER SPION DER FOLGE (Seite, vor ihrem ersten Skript, über jeden Reload — auch unter dem Ladeschirm, ehe die Probe sich
// einhängt): jeder Akt, der wirkt (`_feldAktWirkt`), gegen die Folge des Felds gelesen — `ueberholt`: ein Takt einer nahen Region
// steht vor seinem Stempel noch aus (der Akt schreibt VOR einem Takt, der auf der anderen Seite davor lag); `spaet`: sein Stempel
// liegt hinter dem zuletzt gerechneten Ereignis (`feldLetzt`). Beide brechen „EINE Folge nach Welt-Zeit“ beim Namen `_feldAkt`.
function aktSpion() {
    // `reihe`: die Akte in der Reihe, in der sie auf DIESER Seite wirkten (je Stempel und Inhalt, die jüngsten 4000)
    const AF = (window.__aktFolge = { n: 0, ueberholt: 0, spaet: 0, bsp: [], reihe: [] });
    const t = setInterval(() => {
        let w;
        try {
            w = r && r._feldAktWirkt;
        } catch {
            return; // die Welt steht noch nicht
        }
        if (!w) return;
        clearInterval(t);
        r._feldAktWirkt = function (akt) {
            const s = this.state;
            const T = this.constructor._bestandGesetz().B.taktS;
            const F = (s.faunaBestand && s.faunaBestand.regionen) || {};
            let vor = Infinity;
            for (const key of this._bestandNah()) vor = Math.min(vor, F[key] ? F[key].t + T : -Infinity);
            const [u, sp] = [vor < akt.w, akt.w < s.faunaLifecycle.feldLetzt];
            AF.n++;
            AF.reihe.push(akt.w + "|" + akt.k);
            if (AF.reihe.length > 4000) AF.reihe.splice(0, 1000);
            if (u) AF.ueberholt++;
            if (sp) AF.spaet++;
            if ((u || sp) && AF.bsp.length < 3)
                AF.bsp.push(
                    `${u ? "überholt" : "spät"} ${akt.art} w ${akt.w.toFixed(2)} (Takt davor ${vor}, feldLetzt ${s.faunaLifecycle.feldLetzt}, ` +
                        `Uhr ${s.spielZeit.toFixed(2)}, Horizont ${this._feldHorizont().toFixed(2)}, bereit ${this._kreaturenBereit()})`
                );
            return w.call(this, akt);
        };
    }, 4);
}
// (f) der Befund in einem Satz (Node): WARUM das Leben zweier Abdrücke verschieden ist — der Moment, die gemerkte Klasse, der
// Bestand, die Akte, die Folge am Eingang, dann die Zellen selbst (nur A, nur B, Betrag, Stempel; der früheste verschiedene Stempel)
// (f) DIE GEMERKTE KLASSE GEGEN DIE FRISCHE (Node, aus `befund.klassen` zweier Abdrücke): `n` gemerkte Zellen bei A, `a`/`b`
// gemerkt ≠ frisch je Seite, `ab` gemerkt A ≠ gemerkt B, `frisch` die frische Lesart A ≠ B, das erste Beispiel beim Namen
function klasseUrteil(A, B) {
    const kB = new Map(B.befund.klassen.map(([k, g, f]) => [k, [g, f]]));
    const kl = { n: 0, ab: 0, a: 0, b: 0, frisch: 0, von: A.befund.klassen.length, bsp: "" };
    for (const [k, g, f] of A.befund.klassen) {
        const [gb, fb] = kB.get(k) || [null, null];
        if (g !== null) kl.n++;
        if (g !== null && gb !== null && g !== gb) kl.ab++, (kl.bsp = kl.bsp || `${k} A ${g} · B ${gb} · frisch ${f}`);
        if (g !== null && g !== f) kl.a++, (kl.bsp = kl.bsp || `${k} A gemerkt ${g} · frisch ${f}`);
        if (gb !== null && gb !== fb) kl.b++, (kl.bsp = kl.bsp || `${k} B gemerkt ${gb} · frisch ${fb}`);
        if (f !== fb) kl.frisch++, (kl.bsp = kl.bsp || `${k} frisch A ${f} · B ${fb}`);
    }
    kl.rot = kl.ab + kl.a + kl.b + kl.frisch;
    kl.satz =
        `${kl.n} von ${kl.von} Zellen gemerkt (A) · gemerkt≠frisch A ${kl.a}, B ${kl.b} · gemerkt A≠B ${kl.ab} · frisch A≠B ${kl.frisch}` +
        (kl.rot ? ` (${kl.bsp}) — Täter _bestandFeld: merkt die Klasse vor ihrem fertigen Eingang (Hydro-Kachel, Erdbau)` : "");
    return kl;
}
// (f) der Befund hinter „pegel VERSCHIEDEN“ (Node): die Sekunde der Welt-Uhr, an der jede Seite ihre Tafel zog (`_pegelSek` — die
// Tafel ist eine Funktion der vollen Sekunde: verschiedene Sekunden sind ein anderer Moment, dieselbe Sekunde ein Täter), und wie
// weit die Zahlen der Tafeln auseinander liegen
function pegelBefund(A, B) {
    const zahlen = (X) => (JSON.stringify(X.pegel) || "").match(/-?\d+(\.\d+)?(e-?\d+)?/g) || [];
    const [za, zb] = [zahlen(A), zahlen(B)];
    let [n, max] = [0, 0];
    for (let i = 0; i < Math.max(za.length, zb.length); i++)
        if (za[i] !== zb[i]) n++, (max = Math.max(max, Math.abs(Number(za[i]) - Number(zb[i])) || 0));
    const [sa, sb] = [A.befund.pegelSek, B.befund.pegelSek];
    return (
        `Sekunde der Tafel A ${sa} · B ${sb} (Uhr A ${A.befund.uhr.toFixed(2)}, B ${B.befund.uhr.toFixed(2)}) · ${n} von ${za.length} Zahlen verschieden, größter Abstand ${max}` +
        (sa === sb
            ? " — Täter: dieselbe Sekunde, zwei Tafeln (`_pegelTafel`: Stempel, Zustand des Stands, Faltung)"
            : " — nicht derselbe Moment (die Probe las zwei Sekunden)")
    );
}
function lebenBefund(A, B) {
    const [a, b] = [A.befund, B.befund];
    const teile = [];
    if (A.takt !== B.takt) teile.push(`MOMENT verschieden (feldLetzt A ${A.takt} · B ${B.takt})`);
    const kl = klasseUrteil(A, B);
    if (kl.rot) teile.push(`KLASSE ${kl.satz}`);
    const bB = new Map(b.bestand.map((x) => [x[0], x]));
    const be = a.bestand.filter((x) => JSON.stringify(x) !== JSON.stringify(bB.get(x[0])));
    if (be.length || a.bestand.length !== b.bestand.length)
        teile.push(
            `BESTAND verschieden in ${be.length} von ${a.bestand.length} Regionen` +
                be.slice(0, 2).map((x) => { const y = bB.get(x[0]) || []; return ` (${x[0]}: t ${x[1]}/${y[1]}, seq ${x[2]}/${y[2]}, Tiere ${x[3].split(" ").length}/${String(y[3] || "").split(" ").length})`; }).join("")
        );
    const [gA, gB] = [new Set(a.gewirkt), new Set(b.gewirkt)];
    const [nurA, nurB] = [a.gewirkt.filter((k) => !gB.has(k)), b.gewirkt.filter((k) => !gA.has(k))];
    if (nurA.length || nurB.length)
        teile.push(`AKTE gewirkt nur A ${nurA.length}, nur B ${nurB.length} (offen A ${a.offen}, B ${b.offen}; ${[...nurA, ...nurB].slice(0, 2).join(" ; ").slice(0, 160)})`);
    for (const [n, f] of [["A", a.folge], ["B", b.folge]])
        if (f && (f.ueberholt || f.spaet))
            teile.push(`FOLGE ${n}: ${f.ueberholt} Akt(e) überholten einen Takt, ${f.spaet} kamen spät, von ${f.n} — Täter _feldAkt (${f.bsp.join(" ; ")})`);
    // DIE REIHE DER AKTE: die Akte, die beide Seiten wirkten, in der Reihe jeder Seite — die erste Stelle, an der sie abweicht
    // (`_depositLife` zerfällt, addiert und kappt: zwei Akte desselben Stempels in anderer Reihe tragen einen anderen Betrag)
    const [ra, rb] = [(a.folge && a.folge.reihe) || [], (b.folge && b.folge.reihe) || []];
    const [inA, inB] = [new Set(ra), new Set(rb)];
    const [ga, gb] = [ra.filter((x) => inB.has(x)), rb.filter((x) => inA.has(x))];
    let i = 0;
    while (i < ga.length && ga[i] === gb[i]) i++;
    if (i < Math.min(ga.length, gb.length))
        teile.push(
            `REIHE der Akte verschieden ab dem ${i + 1}. von ${ga.length} gemeinsamen: A ${ga[i].slice(0, 80)} · B ${gb[i].slice(0, 80)}` +
                (ga[i].split("|")[0] === gb[i].split("|")[0] ? " (derselbe Stempel)" : "") +
                " — Täter _feldAkt: am Eingang wirkt der Akt in der Reihe seines Entstehens, in der Folge in der Reihe (Stempel, Inhalt)"
        );
    const zelle = (L) => new Map(L.map((s) => { const [x, z, m, t] = s.split(","); return [x + "," + z, [Number(m), Number(t)]]; }));
    const [zA, zB] = [zelle(A.leben), zelle(B.leben)];
    const z = { nurA: 0, nurB: 0, betrag: 0, stempel: 0, frueh: Infinity, max: 0, bsp: "" };
    for (const [k, [m, t]] of zA) {
        const y = zB.get(k);
        if (!y) z.nurA++, (z.frueh = Math.min(z.frueh, t));
        else if (y[1] !== t) z.stempel++, (z.frueh = Math.min(z.frueh, t, y[1]));
        else if (y[0] !== m) {
            z.betrag++, (z.frueh = Math.min(z.frueh, t));
            if (Math.abs(y[0] - m) > z.max) [z.max, z.bsp] = [Math.abs(y[0] - m), `${k}: A ${m} · B ${y[0]} am Stempel ${t}`];
        }
    }
    for (const [k, [, t]] of zB) if (!zA.has(k)) z.nurB++, (z.frueh = Math.min(z.frueh, t));
    teile.push(
        `ZELLEN nur A ${z.nurA}, nur B ${z.nurB}, Stempel ${z.stempel}, nur Betrag ${z.betrag}${z.betrag ? ` (größter Abstand ${z.max.toExponential(2)}, ${z.bsp})` : ""} — frühester verschiedener Stempel ${z.frueh} ` +
            `(Uhr A ${a.uhr.toFixed(1)}, B ${b.uhr.toFixed(1)}; Hydro-Kacheln A [${a.hydro}] B [${b.hydro}])`
    );
    return teile.join(" · ");
}
// (h) die Sicht einer Seite auf das Gesetz H (ohne H: das jüngste des Spielers): der Wurf der Scheiben k0 … k0+39 der Welt-Uhr,
// ob es feuerte und seine Erzählung im Wissen steht, ob das Tagebuch das Gesetz eines Mitspielers erinnert (`_gesetzGeber`);
// `vor`: die Hashes der Vorlagen (`GESETZ_VORLAGEN` über den EINEN Satz-Parser) und jedes Gesetzes, das die Welt schon trägt
function gesetzSicht(H, k0) {
    const R = r.state.worldRules;
    const g = R.find((x) => r._regelHash(x) === H) || (!H && R.filter((x) => x.source === "human").pop());
    const vorlagen = r.constructor.GESETZ_VORLAGEN.map((s) => r._regelAusSatz(s).program);
    return {
        vor: vorlagen
            .map(([, cond, effect]) => ({ cond, effect }))
            .concat(R)
            .map((x) => r._regelHash(x)),
        H: g && r._regelHash(g),
        k: Math.floor(r.state.spielZeit / 3),
        wurf:
            g &&
            [...Array(40).keys()].map((i) => r.dslEvalCond(g.cond, r.dslCtx({ seed: r._worldRuleSeed(g, k0 + i) }))) +
                "",
        wirkt: !!g && g.fires > 0 && r.state.knowledgeBase.some((e) => e.content === g.effect[1]),
        erinnert: r.state.worldJournal.entries.some((e) => e.text.startsWith("Das Gesetz von")),
    };
}
// Byte-gleich je Teil des Abdrucks (JSON-Text)
const gleichIn = (A, B) => (k) => JSON.stringify(A[k]) === JSON.stringify(B[k]);
// (f) DER SPRUNG: A springt in den Zug vor dem nächsten Sturm am Ort, `ab` Züge voraus (die Front einen Zug davor ohne Sturm)
// → [die Uhr nach dem Sprung, die Uhr im Sturm] in s
function sturmSprung(ab) {
    const [Z, p] = [r.constructor.WETTER_ZUG_SEK, r.state.playerMesh.position];
    const sturm = (k) => r._wetterAmOrt(p.x, p.z, k * Z) === "stormy";
    let k = Math.floor(r.state.spielZeit / Z) + ab;
    while (!sturm(k) || sturm(k - 1)) k++;
    return [(r.state.spielZeit = k * Z - Z + 1), k * Z + 1];
}

// (d) DAS GESETZ JE TAKT, wie `_lockstepTickPeers` es trägt: ein Takt von dt ms (seit dem vorigen Verbrauchs-Takt) verbraucht
// höchstens ceil(aufholJeSchritt × max(1, dt / FIXED_DT)) Schritte und hört davor nur an der Jitter-Reserve auf. Gebrochen ist
// es, wenn ein Takt mehr verbraucht als seine Kappe, oder weniger, während der Puffer über der Reserve steht. Ein Takt ohne
// Anschluss (ent-seedet, Lücke vor dem Anker) wartet auf den Anker, nicht auf die Kappe — er wird nicht gewertet.
const kappeDesGesetzes = (dt, g) => Math.ceil(g.aufhol * (dt === null ? 1 : Math.max(1, dt / g.fixMs)));
function taktBruch(t, g) {
    if (!t.anschluss) return null;
    const k = kappeDesGesetzes(t.dt, g);
    const wo = `dt ${t.dt === null ? "n/a" : Math.round(t.dt) + " ms"}, Kappe ${k}`;
    if (t.n > k) return `${t.n} Schritte über der Kappe (${wo})`;
    if (t.n < k && t.nach > g.reserve)
        return `${t.n} Schritte bei Puffer ${t.nach} über der Reserve ${g.reserve} (${wo})`;
    return null;
}
const dTaeter = (m) =>
    m.some((x) => x.includes("über der Kappe"))
        ? " — Täter _lockstepTickPeers: der Aufhol-Burst ist ungedeckelt"
        : m.some((x) => x.startsWith("GESETZ"))
          ? " — Täter _lockstepTickPeers: die Aufhol-Kappe zählt Frames statt Wanduhr"
          : m.some((x) => x.startsWith("Abstand"))
            ? " — das Gesetz hält, der Ort weicht: Täter der Schritt des Ghosts (_lockstepStepGhost) oder sein Anker"
            : "";
// DER SCHUB VOR DEM FENSTER (K60, B gedrosselt × 8): ein Puffer, der VOR dem
// Fenster auflief, steht nach dem ersten Takt (dt 25 ms, Kappe 15) bei 235 Schritten — das Gesetz trug ihn, das Urteil mit
// festem Verzug (≤ Reserve + aufholJeSchritt) nannte `_lockstepTickPeers` als Täter. Je Takt [dt ms, Schritte, Puffer danach].
const SCHUB_VOR_DEM_FENSTER = [
    [25, 15, 235],
    [633, 273, 2],
    [1113, 52, 2],
    [430, 44, 2],
    [402, 25, 2],
    [371, 21, 2],
    [216, 20, 2],
    [422, 24, 2],
    [435, 28, 2],
    [381, 20, 2],
    [290, 20, 2],
].map(([dt, n, nach]) => ({ dt, n, nach, anschluss: true }));
const SCHUB_GESETZ = { reserve: 2, aufhol: 10, fixMs: 1000 / 60 }; // das Gesetz, unter dem er aufgenommen wurde

// Im Seiten-Kontext (der Loop läuft über die Pumpe, der Null-Renderer zeichnet nichts): die Probe hängt am Spiel-Takt
// `p2pTick` und am Empfang `_p2pMsgPos`.
function installiere(alteTuer) {
    r.state.p2p.lockstepDebug = true; // die Spuren des Leibs (A je seq, der Ghost bei B) für (e)
    const mp = (window.__mp = {
        peerTakte: 0,
        ursprung: 0,
        ursprungOhneOrt: 0,
        // je Mitspieler: stand er beim ZEICHNEN im Ursprung (die Wahrheit des Zeichen-Moments, `_p2pUpdatePeer`)
        wahrBeimZeichnen: new Map(),
        ortZuletzt: new Map(),
        ursprungBeispiel: null,
        ortGesehen: new Set(),
        inits: 0,
    });
    const neueTuer = r.initP2PSync;
    r.initP2PSync = function (...a) {
        mp.inits++;
        const vor = this.state.p2p.enabled;
        const res = neueTuer.apply(this, a);
        if (alteTuer) this.state.p2p.enabled = vor; // die alte Tür: die Absicht bleibt, wie sie war
        return res;
    };
    const msgPos = r._p2pMsgPos;
    r._p2pMsgPos = function (msg, p2p) {
        // der zuletzt empfangene Ort: steht der Mitspieler WIRKLICH im Ursprung (die Welt setzt jeden Erst-Spawn auf 0/0, und
        // das Gelände des Kerns trägt dort ebenen Grund — er bleibt stehen), ist der Ursprung sein Ort, kein Täter
        if (msg && typeof msg.peerId === "string")
            mp.ortGesehen.add(msg.peerId) && mp.ortZuletzt.set(msg.peerId, { x: msg.x, z: msg.z });
        return msgPos.call(this, msg, p2p);
    };
    // DIE WAHRHEIT DES ZEICHEN-MOMENTS: `_p2pUpdatePeer` zeichnet den Ort, den der Ghost am Ende des VORIGEN Takts setzte
    // (`_lockstepTickPeers` läuft in `p2pTick` NACH dem Zeichnen) bzw. den Snap von vor P2P_SNAP_INTERP_DELAY_MS (120 ms).
    // Geurteilt wird darum gegen die Quellen in DIESEM Moment — der Ghost, der Snap-Puffer, der zuletzt empfangene Ort —,
    // nie gegen den Ghost nach dem Takt.
    const zeichne = r._p2pUpdatePeer;
    r._p2pUpdatePeer = function (entry, t, dt) {
        const res = zeichne.call(this, entry, t, dt);
        const ls = entry.lockstep;
        const oz = mp.ortZuletzt.get(entry.peerId);
        mp.wahrBeimZeichnen.set(
            entry.peerId,
            !!(
                (ls?.seeded && ls.x === 0 && ls.z === 0) ||
                entry.snapBuf?.some((q) => q.x === 0 && q.z === 0) ||
                (oz?.x === 0 && oz.z === 0)
            )
        );
        return res;
    };
    const tick = r.p2pTick;
    r.p2pTick = function (t) {
        const res = tick.call(this, t);
        const p2p = this.state.p2p;
        for (const [pid, e] of p2p.peers) {
            mp.peerTakte++;
            const ls = e.lockstep;
            const ortBekannt = mp.ortGesehen.has(pid) || !!(ls?.seeded && ls.doneSeq >= 0);
            for (const o of [e.mesh, e.nameLabel]) {
                if (!o || !o.parent || !o.visible) continue;
                const wirklich = mp.wahrBeimZeichnen.get(pid) === true;
                const imUrsprung = o.position.x === 0 && o.position.z === 0;
                if (imUrsprung && !wirklich) {
                    mp.ursprung++;
                    if (!ortBekannt) mp.ursprungOhneOrt++;
                    if (!mp.ursprungBeispiel)
                        mp.ursprungBeispiel = { pid, art: o === e.mesh ? e.meshKind : "schild", y: o.position.y };
                }
            }
        }
        return res;
    };
    // DER TAKT DES GHOSTS: jeder Verbrauch (`_lockstepTickPeers`, aus `p2pTick`) zählt; (d) legt seine langen Takte um
    // diesen Zähler, nie an ihm vorbei
    const lsEcht = Object.getPrototypeOf(r)._lockstepTickPeers;
    mp.lsTakte = 0;
    mp.lsZaehler = function (nowMs) {
        mp.lsTakte++;
        return lsEcht.call(this, nowMs);
    };
    r._lockstepTickPeers = mp.lsZaehler;
    return true;
}

// Eine Seite bootet (vor ihrem ersten Skript das Netz-Log), bis ihr Loop und ihr Leib stehen; dann die Probe
async function seite(browser, name, alteTuer) {
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 400 });
    await nullRenderer(page);
    await page.evaluateOnNewDocument(netzLog);
    await page.evaluateOnNewDocument(seitenPumpe);
    await page.evaluateOnNewDocument(aktSpion);
    await page.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    const da = () =>
        !!r &&
        typeof r._gameLoopTick === "function" &&
        !!st.playerMesh;
    await waitFor(page, da, `Seite ${name} bereit`);
    await page.evaluate(installiere, alteTuer);
    return page;
}

function bericht(p) {
    return p.evaluate(() => {
        const { peerTakte, ursprung, ursprungOhneOrt, ursprungBeispiel, inits } = __mp;
        const p2p = st.p2p;
        const t = document.getElementById("p2p-toggle");
        return {
            peerTakte,
            ursprung,
            ursprungOhneOrt,
            ursprungBeispiel,
            inits,
            enabled: p2p.enabled === true,
            connected: p2p.connected === true,
            timer: !!p2p.reconnectTimer,
            knopf: t ? t.getAttribute("aria-pressed") : null,
            peerId: p2p.peerId,
        };
    });
}

let saveServer, signaling;
hauptLauf(async () => {
    const fehler = [];
    [PORT, SIGNAL_PORT] = await eigenePorte("MP_SYNC_PORT", "MP_SYNC_SIGNAL_PORT");
    PAGE_URL = `http://127.0.0.1:${PORT}/index.html`;
    SIGNALING_URL = `ws://127.0.0.1:${SIGNAL_PORT}`;
    const check = (name, ok, detail = "") => {
        console.log(`  ${ok ? "OK  " : "ROT "} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) fehler.push(name);
    };
    const t0 = Date.now();
    if (!SELBSTTEST) {
        // das Urteil von (d) am aufgenommenen Schub: das Gesetz hält jeden Takt, ein fester Verzug hätte ihn ROT genannt
        const brueche = SCHUB_VOR_DEM_FENSTER.map((t) => taktBruch(t, SCHUB_GESETZ)).filter(Boolean);
        const verzugMax = Math.max(...SCHUB_VOR_DEM_FENSTER.map((t) => t.nach));
        const festGrenze = SCHUB_GESETZ.reserve + SCHUB_GESETZ.aufhol;
        check(
            "(d) Urteil am Schub vor dem Fenster: jeder Takt hält das Gesetz (ein fester Verzug sähe einen Täter)",
            brueche.length === 0 && verzugMax > festGrenze,
            `${SCHUB_VOR_DEM_FENSTER.length} Takte, Gesetz gebrochen in ${brueche.length}${brueche.length ? " (" + brueche[0] + ")" : ""}` +
                ` · fester Verzug max ${verzugMax} ${verzugMax > festGrenze ? ">" : "≤"} ${festGrenze}`
        );
    }
    saveServer = await startProc("save-server.js", /läuft/, {
        PORT: String(PORT),
        ANAZH_SIGNALING_PORT: String(SIGNAL_PORT),
    });
    // das Null-Rezept (kein GPU-Prozess); die Hintergrund-Drosselung schaltet Puppeteer selbst ab (seine Default-Schalter)
    const browser = await starteBrowser({
        art: "null",
        frist: 180000,
        zusatz: ["--autoplay-policy=no-user-gesture-required"],
    });
    {
        // ── Seite A: frisch, der signaling-server ist AUS ──
        const pageA = await seite(browser, "A", SELBSTTEST);
        // Adresse + Raum über die UI-Felder (ihr change-Hörer schreibt + merkt sie; verbunden wird hier noch nichts).
        await pageA.evaluate(
            (url, raum) => {
                for (const [id, v] of [
                    ["p2p-url", url],
                    ["p2p-room", raum],
                ]) {
                    const e = document.getElementById(id);
                    e.value = v;
                    e.dispatchEvent(new Event("change"));
                }
            },
            SIGNALING_URL,
            ROOM
        );

        // ── (b) TÜR: der nackte Aufruf, Server beim Aufbau aus ──
        const vorTuer = await pageA.evaluate(() => st.p2p.enabled === true);
        await pageA.evaluate(() => r.initP2PSync(null));
        await sleep(3000);
        signaling = await startProc("signaling-server.js", /lauscht/, {
            PORT: String(PORT),
            ANAZH_SIGNALING_PORT: String(SIGNAL_PORT),
        });
        // bis zu seinem EREIGNIS, nie nach der Uhr: A verbunden — oder die Absicht fehlt (dann plant der close-Zweig nie, nichts
        // kann mehr heilen; vorher eine Wanduhr-Schleife je 250 ms bis REJOIN_DECKEL_S, die zwölf Proben ohne Plan abwartete)
        const rejoinMs = await waitFor(
            pageA,
            () => st.p2p.connected || !st.p2p.enabled,
            "A: Rejoin oder keine Absicht"
        );
        const nachTuer = await bericht(pageA);
        const rejoinS = nachTuer.connected && rejoinMs <= REJOIN_DECKEL_S * 1000 ? rejoinMs / 1000 : null;
        check(
            `(b) Tür: der nackte Aufruf heilt nach ${3} s Server-Ausfall (Rejoin ≤ ${REJOIN_DECKEL_S} s)`,
            rejoinS !== null,
            rejoinS !== null
                ? `Rejoin ${rejoinS.toFixed(1)} s nach Server-Start, Absicht ${vorTuer}→${nachTuer.enabled}`
                : `kein Rejoin geplant (enabled=${nachTuer.enabled}) — Täter: _p2pScheduleReconnect / der close-Zweig lesen p2p.enabled, das initP2PSync nie setzt`
        );
        if (SELBSTTEST) {
            await browser.close();
            const rot = rejoinS === null;
            console.log(
                rot
                    ? "SELBSTTEST OK: die alte Tür (initP2PSync ohne Absicht) macht (b) ROT"
                    : "SELBSTTEST ROT: die alte Tür blieb grün — die Probe sieht die Tür nicht"
            );
            process.exit(rot ? 0 : 1);
        }

        // ── Der KNOPF: aus, an, ein zweiter Klick im Aufbau ──
        const klick = () => document.getElementById("p2p-toggle").click();
        const k0 = await bericht(pageA);
        check(
            "Knopf liest die Absicht der Tür („an“ nach dem nackten Aufruf)",
            k0.enabled && k0.knopf === "true",
            `enabled=${k0.enabled} aria-pressed=${k0.knopf}`
        );
        if (k0.enabled) {
            await pageA.evaluate(klick);
            const kAus = await bericht(pageA);
            check(
                "Knopf aus: Absicht fällt, Verbindung zu, kein Rejoin geplant",
                !kAus.enabled && !kAus.connected && !kAus.timer && kAus.knopf === "false",
                `enabled=${kAus.enabled} connected=${kAus.connected} timer=${kAus.timer} aria=${kAus.knopf}`
            );
        }
        const kVor = await bericht(pageA);
        await pageA.evaluate(klick);
        const kAn = await bericht(pageA);
        await pageA.evaluate(klick); // der zweite Klick, solange der Aufbau läuft
        const kZwei = await bericht(pageA);
        check(
            "Knopf an startet EIN Init, der zweite Klick im Aufbau keines (er liest „an“ und schaltet aus)",
            kAn.inits === kVor.inits + 1 &&
                kAn.enabled &&
                kAn.knopf === "true" &&
                kZwei.inits === kAn.inits &&
                !kZwei.enabled,
            `Inits ${kVor.inits}→${kAn.inits}→${kZwei.inits}, verbunden beim 2. Klick=${kZwei.connected}`
        );
        await pageA.evaluate(klick);
        await waitFor(pageA, () => st.p2p.connected === true, "A verbunden über den Knopf");
        const kVerb = await bericht(pageA);
        check("Knopf an: A verbunden, Knopf „an“", kVerb.connected && kVerb.knopf === "true", `Inits ${kVerb.inits}`);

        // ── Seite B: der BOOT (die gemerkte Absicht aus p2pPersist) ──
        const pageB = await seite(browser, "B", false);
        await waitFor(pageB, () => st.p2p.connected === true, "B verbunden über den Boot");
        const idA = kVerb.peerId;
        const idB = (await bericht(pageB)).peerId;
        // DIE MARKE mit Täter: scheitert sie, nennt die Zeile, was der Seite fehlt (`__marke`), nie nur „Waiting failed"
        const kennt = (seite, id, rechnet, wer) =>
            waitFor(seite, kenntMitGestalt, wer, id, rechnet).catch(async (f) => {
                throw new Error(`${wer}: ${await seite.evaluate(() => __marke)} (${f.message})`);
            });
        await kennt(pageA, idB, false, "A kennt B mit Gestalt über die Leitung");
        await kennt(pageB, idA, true, "B rechnet A mit Gestalt über die Leitung");
        check(
            "B verbunden über den Boot, beide kennen einander mit Gestalt über die Leitung",
            true,
            `A=${idA} B=${idB}`
        );
        // am echten Broker: A's Vibe-Pass reist mit dem peerId-Stempel des Servers, B verifiziert die Signatur über ihn
        const vibeMs = await waitFor(
            pageB,
            (id) => !!st.p2p.peers.get(id)?.vibeVerified,
            "B verifiziert A's Vibe-Pass",
            idA
        ).catch(() => -1);
        check(
            "W13 P3: der Broker relayt den Vibe-Pass mit peerId-Stempel, B verifiziert A",
            vibeMs >= 0,
            `${vibeMs} ms`
        );

        // A steht: der Ladeschirm ist gefallen (erst dann gehören die Tasten dem Spieler), die Höhe ruhig.
        await waitFor(pageA, () => !r._ladeschirmSteht(), "A: Ladeschirm weg");
        await waitFor(
            pageA,
            () => {
                const y = st.playerMesh.position.y;
                const prev = window.__mpY;
                window.__mpY = y;
                return prev !== undefined && Math.abs(y - prev) < 0.02;
            },
            "A gesettelt"
        );
        await sleep(800);

        // ── A läuft über die Tastatur, B sieht zu ── (ein Lauf: A geht LAUF_M, steht wieder, B zeigt ihn an dessen Ort)
        const laufUndSicht = async () => {
            await kennt(pageB, idA, true, "B rechnet A mit Gestalt über die Leitung");
            await pageA.bringToFront();
            const vorLauf = await pageA.evaluate(() => {
                if (document.activeElement?.blur) document.activeElement.blur();
                window.__mpP = undefined;
                const p = st.playerMesh.position;
                return { x: p.x, z: p.z };
            });
            // W bis zu seinem EREIGNIS (A steht LAUF_M vom Start), nie nach der Uhr: unter Last lief A in 1,6 s 0,77 m
            const halt = await halteBis(pageA, {
                taste: "w",
                ziel: (soll, s) => {
                    const p = st.playerMesh.position;
                    return Math.hypot(p.x - s.x, p.z - s.z) >= soll;
                },
                args: [LAUF_M, vorLauf],
                frist: LAUF_FRIST_MS,
            });
            await waitFor(
                pageA,
                () => {
                    const p = st.playerMesh.position;
                    const prev = window.__mpP;
                    window.__mpP = { x: p.x, z: p.z };
                    return prev !== undefined && Math.hypot(p.x - prev.x, p.z - prev.z) < 0.005;
                },
                "A steht wieder"
            );
            await sleep(1200);
            // B urteilt nach seinem EREIGNIS: zwei eigene Takte, seit A steht — nie nach der Uhr des Läufers (ein Hintergrund-
            // Takt unter Last kam lokal 1,9 s nach dem Stand noch nicht: Abstand 1,905 m bei Rückstau 111, K60-N3/mp-3.txt)
            const takteB = await pageB.evaluate(() => __mp.lsTakte);
            await waitFor(pageB, (n) => __mp.lsTakte >= n + 2, "B: zwei Ghost-Takte nach dem Stand von A", takteB);
            const wahrA = await pageA.evaluate(() => {
                const p = st.playerMesh.position;
                return { x: p.x, z: p.z };
            });
            const sichtB = await pageB.evaluate((id) => {
                const e = st.p2p.peers.get(id);
                const p = e.mesh.position;
                const ls = e.lockstep;
                return {
                    x: p.x,
                    z: p.z,
                    art: e.meshKind,
                    sichtbar: e.mesh.visible,
                    rueckstau: ls ? ls.buf.length : null,
                };
            }, idA);
            const lauf = Math.hypot(wahrA.x - vorLauf.x, wahrA.z - vorLauf.z);
            const abstand = Math.hypot(sichtB.x - wahrA.x, sichtB.z - wahrA.z);
            return { lauf, abstand, wahrA, sichtB, haltMs: halt.ms, haltErreicht: halt.erreicht };
        };
        const sichtSatz = (l) =>
            `Abstand ${l.abstand.toFixed(3)} m, Leib ${l.sichtB.art}, sichtbar=${l.sichtB.sichtbar}, ` +
            `Rückstau ${l.sichtB.rueckstau} Schritte`;
        // ── (g) STILLE (mp-leitung): A schweigt STILLE_S (die Pumpe ruht, der Loop steht wie in einem verborgenen Tab), B tickt
        // weiter. Geurteilt am EINEN Ereignis, nie nach der Uhr: B's Ghost rechnet den ersten Anker von A nach der Stille — oder
        // die Leitung steht nicht mehr offen, dann ist das Urteil sofort da; den Lauf danach rechnet B bit-gleich ((e) Leib ab
        // dem Anker). A's Socket lebt (er antwortet dem Puls des Brokers): jeder Abschied von A ist einer ohne `peer-leave`, der
        // Täter beim Namen. `alt`: B trägt den alten Leerlauf-Abschied (p2pTick: 10 s ohne Schritt von A → `_p2pRemovePeer`)
        // — der Selbsttest am Ende. → [Anker, "" oder was fehlt]
        const stille = async (alt) => {
            await pageB.evaluate(
                (id, alt) => {
                    const [weg, tick] = [r._p2pRemovePeer, r.p2pTick];
                    __mp.abschied = 0;
                    r._p2pRemovePeer = function (pid) {
                        __mp.abschied += pid === id;
                        return weg.call(this, pid);
                    };
                    if (alt)
                        r.p2pTick = function (t) {
                            for (const [pid, e] of this.state.p2p.peers)
                                if (e.lockstep && t - e.lockstep.lastStepAt > 10000) this._p2pRemovePeer(pid);
                            return tick.call(this, t);
                        };
                },
                idA,
                alt
            );
            await pageA.evaluate(() => (window.__pumpeSteht = true));
            await sleep(STILLE_S * 1000);
            const anker = await pageA.evaluate(() => {
                window.__pumpeSteht = false;
                return (Math.floor(st.p2p._lockstepSeq / 60) + 1) * 60;
            });
            await waitFor(
                pageB,
                (id, q) => {
                    const p2p = st.p2p;
                    const ls = p2p.peers.get(id)?.lockstep || {};
                    return !p2p.rtcPeers.get(id)?.open || (ls.seeded && ls.doneSeq >= q);
                },
                "B: der erste Anker von A nach der Stille",
                idA,
                anker
            );
            await pageB.evaluate(kenntMitGestalt, idA, true); // setzt `__marke`: leer, wenn B A wieder rechnet
            const [marke, ab] = await pageB.evaluate(() => [__marke, __mp.abschied]);
            return [
                anker,
                (marke && ", B: " + marke) + (ab ? " — Täter p2pTick: der Leerlauf-Abschied riss die Leitung" : ""),
            ];
        };
        const [anker, zurueck] = await stille(false);
        const l0 = await laufUndSicht();
        check("A lief über die Tastatur (> 1 m)", l0.lauf > 1, `${l0.lauf.toFixed(2)} m nach ${l0.haltMs} ms W`);
        // (e) der Leib aus seinen Eingaben: B's Ghost rechnet jeden Schritt von A bit-gleich nach (je seq, die Spuren des Laufs)
        const spurA = new Map(
            (await pageA.evaluate(() => st.p2p._lockstepTrace || [])).map((q) => [q.q, q])
        );
        const spurB = await pageB.evaluate((id) => st.p2p.peers.get(id)?.lockstep?.trace || [], idA);
        const geteilt = spurB.filter((g) => g.q >= anker && spurA.has(g.q));
        const dMax = Math.max(
            0,
            ...geteilt.map((g) => ["x", "y", "z"].reduce((m, k) => Math.max(m, Math.abs(g[k] - spurA.get(g.q)[k])), 0))
        );
        check(
            "(e) Leib: B's Ghost rechnet A's Schritte aus seinen Eingaben bit-gleich (je seq)",
            geteilt.length > 60 && dMax === 0,
            `${geteilt.length} geteilte Schritte, maxΔ ${dMax}`
        );
        check(
            `(g) Stille: A schwieg ${STILLE_S} s, B rechnet A ab dem ersten Anker danach bit-gleich`,
            zurueck === "" && geteilt.length >= 60 && dMax === 0,
            `Anker ${anker}${zurueck}, ${geteilt.length} geteilte Schritte, maxΔ ${dMax}`
        );
        check(
            `B sieht A an dessen Ort (±${ABSTAND_M} m waagrecht)`,
            l0.sichtB.sichtbar && l0.abstand <= ABSTAND_M,
            sichtSatz(l0)
        );

        // ── (d) LANGE TAKTE: B trägt lange Takte (der Lade-Takt eines Mitspielers unter seinem Ladeschirm, ein
        // langsames Gerät) — der Ghost hält mit dem Sender Schritt, sein Verbrauch liest die Wanduhr, nie den Frame
        // (`_lockstepTickPeers`). Der Selbsttest gleich danach setzt die alte Kappe wieder ein (jeder Takt gilt als ein
        // Frame von 1/60 s): (d) muss ROT werden. DAS URTEIL LIEST JE TAKT DAS GESETZ (`taktBruch`), nie nur den Ort am
        // Ende und nie einen festen Verzug: der Ort allein war blind, der feste Verzug las einen Schub vor dem Fenster
        // als Täter.
        const lsGesetz = await pageB.evaluate(() => {
            const K = r.constructor;
            return { reserve: K.LOCKSTEP.jitterReserve, aufhol: K.LOCKSTEP.aufholJeSchritt, fixMs: K.FIXED_DT * 1000 };
        });
        // DER LANGE TAKT IN SCHRITTEN: der Ghost bei B verbraucht erst, wenn seit seinem letzten Takt ZUFLUSS_SOLL
        // Schritte von A angekommen sind — ein Takt trägt so immer das Doppelte der alten Kappe, gleich wie schnell A
        // sendet und wie belastet der Läufer ist
        const ZUFLUSS_SOLL = ZUFLUSS_FAKTOR * lsGesetz.aufhol;
        const langeTakte = (an, alteKappe) =>
            pageB.evaluate(
                (an, soll, alteKappe, pid) => {
                    const mp = __mp;
                    const fenster = mp.langFenster || null; // das Fenster, das hier endet
                    mp.langFenster = null;
                    r._lockstepTickPeers = mp.lsZaehler;
                    if (mp.schrittEcht) r._lockstepStepGhost = mp.schrittEcht;
                    if (!an) return fenster;
                    const f = (mp.langFenster = { takte: [], zufluss: [], hoch: null, schritte: 0 });
                    const echt = Object.getPrototypeOf(r)._lockstepTickPeers;
                    // der Verbrauch je Takt zählt die Schritte des Ghosts selbst (ein Anker, der den Puffer kürzt, ist keiner)
                    const schritt = (mp.schrittEcht = r._lockstepStepGhost);
                    r._lockstepStepGhost = function (...a) {
                        f.schritte++;
                        return schritt.apply(this, a);
                    };
                    // nur der Verbrauch des Ghosts wartet (der lange Takt), `p2pTick` selbst läuft weiter: Peer-Pflege,
                    // Zeichnen und das eigene Senden bleiben am Leben, die Verbindung hält
                    r._lockstepTickPeers = function (nowMs) {
                        const p2p = this.state.p2p;
                        const e = p2p.peers.get(pid);
                        const ls = e && e.lockstep;
                        // der Empfangs-Stand (nächster erwarteter Schritt): Verbrauch und Anker lassen ihn stehen
                        const hoch = ls ? ls.bufStart + ls.buf.length : null;
                        if (f.hoch !== null && hoch !== null && hoch - f.hoch < soll) return undefined; // der lange Takt
                        // die Wanduhr dieses Takts, wie das Gesetz sie liest — vor der alten Kappe, die sie fälscht
                        const dt = Number.isFinite(p2p._lockstepTickMs) ? nowMs - p2p._lockstepTickMs : null;
                        // die alte Kappe: jeder Takt gilt als EIN Frame von 1/60 s (je Takt höchstens aufholJeSchritt Schritte)
                        if (alteKappe) p2p._lockstepTickMs = nowMs - 1000 / 60;
                        mp.lsTakte++;
                        const s0 = f.schritte;
                        const res = echt.call(this, nowMs);
                        if (ls) {
                            if (f.hoch !== null) f.zufluss.push(hoch - f.hoch);
                            f.hoch = hoch;
                            f.takte.push({
                                dt,
                                n: f.schritte - s0,
                                nach: ls.buf.length,
                                anschluss: !!ls.seeded && ls.bufStart === ls.doneSeq + 1,
                            });
                        }
                        return res;
                    };
                    return null;
                },
                an,
                ZUFLUSS_SOLL,
                !!alteKappe,
                idA
            );
        // DIE EINE PRÜF-FUNKTION von (d) — der Lauf und sein Selbsttest gehen durch denselben Code
        const zuflussMedian = (f) => {
            const z = [...f.zufluss].sort(aufsteigend);
            return z.length ? rang(z) : 0;
        };
        const gesetzTakte = (f) => (f ? f.takte.filter((t) => t.anschluss) : []);
        const dMaengel = (l, f) => {
            const m = [];
            const g = gesetzTakte(f);
            if (!(l.lauf > 1))
                m.push(
                    `LEER: A lief ${l.lauf.toFixed(2)} m (≤ 1 m) nach ${l.haltMs} ms W` +
                        (l.haltErreicht ? "" : ` (${LAUF_M} m nicht in ${LAUF_FRIST_MS} ms)`)
                );
            if (g.length < 3) m.push(`LEER: ${g.length} lange Takte mit dem Ghost von A im Anschluss (< 3)`);
            if (!l.sichtB.sichtbar) m.push("A bei B unsichtbar");
            if (l.abstand > ABSTAND_M) m.push(`Abstand ${l.abstand.toFixed(3)} m > ${ABSTAND_M} m`);
            const brueche = g.map((t) => taktBruch(t, lsGesetz)).filter(Boolean);
            if (brueche.length)
                m.push(`GESETZ gebrochen in ${brueche.length} von ${g.length} Takten (erster: ${brueche[0]})`);
            return m;
        };
        const fensterSatz = (f) => {
            if (!f) return "kein Fenster";
            const g = gesetzTakte(f);
            const max = (k) => g.reduce((a, t) => Math.max(a, t[k] || 0), 0);
            const gehalten = g.filter((t) => !taktBruch(t, lsGesetz)).length;
            return (
                `${g.length} Takte (dt bis ${Math.round(max("dt"))} ms), Zufluss je Takt Median ${zuflussMedian(f)} Schritte, ` +
                `Verbrauch je Takt bis ${max("n")}, Puffer nach dem Takt bis ${max("nach")}, Gesetz gehalten ${gehalten}/${g.length}`
            );
        };
        // das Fenster endet nach seinem Ereignis (drei lange Takte mit dem Ghost von A), nie nach der Uhr des Läufers
        const fensterZu = async () => {
            await waitFor(
                pageB,
                () => !!__mp.langFenster && __mp.langFenster.takte.filter((t) => t.anschluss).length >= 3,
                "B: drei lange Takte"
            ).catch(() => {});
            return langeTakte(false);
        };
        await langeTakte(true, false);
        const l1 = await laufUndSicht();
        const f1 = await fensterZu();
        const m1 = dMaengel(l1, f1);
        check(
            `(d) lange Takte bei B (je ${ZUFLUSS_SOLL} Schritte von A): B sieht A an dessen Ort (±${ABSTAND_M} m waagrecht), jeder Takt hält das Gesetz`,
            m1.length === 0,
            `Lauf ${l1.lauf.toFixed(2)} m · ${sichtSatz(l1)} · ${fensterSatz(f1)}` +
                (m1.length ? ` — ${m1.join(" · ")}${dTaeter(m1)}` : "")
        );
        await sleep(1500); // B holt bei kurzen Takten auf
        await langeTakte(true, true);
        const l2 = await laufUndSicht();
        const f2 = await fensterZu();
        const m2 = dMaengel(l2, f2);
        // das Szenario stresst die alte Kappe (Zufluss je Takt über ihr), und (d) fällt am Gesetz
        const gestresst = zuflussMedian(f2) > lsGesetz.aufhol;
        const amGesetz = m2.some((x) => x.startsWith("GESETZ"));
        check(
            "(d) Selbsttest: die alte Kappe je Frame macht (d) ROT am Gesetz",
            gestresst && amGesetz && !m2.some((x) => x.startsWith("LEER")),
            `Lauf ${l2.lauf.toFixed(2)} m · ${sichtSatz(l2)} · ${fensterSatz(f2)} — (d) ${
                m2.length ? "ROT: " + m2.join(" · ") + dTaeter(m2) : "GRÜN, die Linse ist blind"
            }${gestresst ? "" : ` — das Szenario stresst die alte Kappe nicht (Zufluss ≤ ${lsGesetz.aufhol} je Takt)`}`
        );
        await sleep(1500);

        // ── (f) DIE WELT-UHR: A springt 20 min Spielzeit in einen Sturm, erst in den Zug davor (er nimmt jeden
        // alten Wunsch der Welt); B folgt je Sprung seinem Ereignis, der Uhr von A — nie der Wanduhr ──
        const folgt = (z) =>
            waitFor(pageB, (z) => st.spielZeit >= z, "B trägt die Uhr von A", z).catch(() => {
                throw new Error(
                    "(f) ROT: B trägt die Welt-Uhr von A nicht — Täter: die Uhr je Seite (pos.w, _weltUhrNimm)"
                );
            });
        const [vorSturm, sturm] = await pageA.evaluate(sturmSprung, 10);
        await folgt(vorSturm);
        await pageA.evaluate((z) => (st.spielZeit = z), sturm);
        await folgt(sturm);
        // (f) DIE TEIL-SIMULATIONEN beider Seiten im selben Moment: Wetter, Leben je lebender Zelle, Pegel, Brand — gleich, sonst ROT
        const fTeile = ["wetter", "leben", "pegel", "brand"];
        const teilSim = (wann, A, B) => {
            const gl = gleichIn(A, B);
            check(
                `(f) ${wann}: Teil-Simulationen gleich`,
                fTeile.every(gl),
                `${satz(gl, fTeile)} — Leben ${B.leben.filter((z) => A.leben.includes(z)).length}/${A.leben.length} Zellen, ` +
                    `Brand ${A.brand.length} Zellen${gl("wetter") ? "" : ` (A ${A.wer} · B ${B.wer})`}` +
                    ` · Folge der Akte ${[A, B].map((X, i) => { const f = X.befund.folge || {}; return `${"AB"[i]} ${f.n} gewirkt/${f.ueberholt} überholt/${f.spaet} spät`; }).join(", ")}` +
                    (gl("leben") ? "" : ` — BEFUND: ${lebenBefund(A, B)}`) +
                    (gl("pegel") ? "" : ` — PEGEL: ${pegelBefund(A, B)}`)
            );
            // (f) DIE GEMERKTE BODEN-KLASSE IST DIE FRISCHE (w28-mp-boden): der Bestand merkt die Klasse je Zelle EINMAL
            // (`_bestandFeld`) — gemerkt vor einem fertigen Eingang (die Hydro-Kachel des Orts, der Erdbau), trägt die Seite sie für
            // immer anders als der Mitspieler und als ihr eigener Reload. Gelesen an jeder Zelle der nahen Regionen auf A und B.
            const kl = klasseUrteil(A, B);
            check(`(f) ${wann}: die gemerkte Boden-Klasse des Bestands ist die frische, auf beiden Seiten dieselbe`, kl.n > 0 && !kl.rot, kl.satz);
            // (f) DIE EINE FOLGE DES FELDS (w28-mp-boden): kein Akt wirkte, während ein Takt einer nahen Region vor seinem Stempel
            // ausstand (`aktSpion` an `_feldAktWirkt`, seit der Geburt der Seite — auch unter dem Ladeschirm). Der Täter hinter
            // „leben VERSCHIEDEN“ unter Last: die Annahme der ersten Leiber trat vor die Takte der nachgeholten Stunde.
            const F = [A, B].map((X) => X.befund.folge || { n: 0, ueberholt: -1, bsp: ["kein Spion"] });
            check(
                `(f) ${wann}: kein Akt wirkte vor einem Takt, der vor seinem Stempel ausstand (die EINE Folge des Felds)`,
                F.every((f) => f.ueberholt === 0) && F[0].n > 0,
                F.map((f, i) => `${"AB"[i]} ${f.ueberholt} von ${f.n}`).join(" · ") +
                    (F.some((f) => f.ueberholt) ? ` — Täter _feldAkt: wirkt sofort, gleich wo die Folge steht (${F.flatMap((f) => f.bsp).slice(0, 2).join(" ; ")})` : "")
            );
        };

        // DERSELBE MOMENT DES FELDS: jede Seite rechnet die Folge des Felds (Takte und Akte) bis zu ihrem Horizont (`_feldHorizont`, die
        // früheste Uhr des Raums) — verglichen wird, wenn beide dasselbe Ereignis zuletzt rechneten (`feldLetzt`; die Seite dahinter bis
        // zu ihrem Ereignis, nie nach der Uhr)
        const moment = async (bauten) => {
            for (let i = 0; ; i++) {
                const nahe = await pageA.evaluate(() => r._bestandNah()); // die nahen Regionen von A auf beiden Seiten
                const AB = await Promise.all([pageA, pageB].map((p) => p.evaluate(abdruck, bauten, nahe)));
                const [a, b] = AB.map((x) => x.takt);
                // … und dieselbe SEKUNDE DES PEGELS: die Tafel ist eine Funktion der vollen Sekunde der Welt-Uhr (`_pegelTafel`), B trägt
                // die Uhr von A um die Laufzeit einer `pos`-Nachricht später — las die Probe zwei Sekunden, liest sie neu (im Sturm
                // steigt der Lauf je Sekunde: „pegel VERSCHIEDEN“ ohne Täter, 13.11. ein Lauf allein, Leben 283/283)
                const sek = AB[0].befund.pegelSek === AB[1].befund.pegelSek;
                if ((a === b && sek) || i > 7) return AB;
                if (a === b) {
                    await sleep(130);
                    continue;
                }
                await waitFor(a < b ? pageA : pageB, (z) => st.faunaLifecycle.feldLetzt >= z, "die Seite rechnet das Feld des Raums", Math.max(a, b)).catch(() => {});
            }
        };

        // ── (c)+(e) GLEICH FÜR ALLE (feld.K2): A gräbt, schüttet und baut im Gespräch (die Chat-Taste, der Spielpfad) ──
        // B trägt denselben Abdruck der Schreib-Akte (`abdruck`). Täter, wenn B einen Edit weniger trägt: `_chatTryVoxelDebugCommand`
        // schnitzt direkt statt über dslRun (kein Broadcast); wenn mehr: der Empfang wendet eine Akt-Nachricht mehrfach an
        // (`_p2pMsgDsl`); wenn der Bau fehlt oder anders heißt: seine Kennung ist keine Funktion des Akts.
        const sage = async (satz) => {
            await pageA.bringToFront();
            await pageA.keyboard.press("Enter");
            await sleep(150);
            // Öffnete die Taste das Feld nicht (der Zeiger-Fang nach dem ersten Senden), klickt der Spieler hinein.
            const offen = await pageA.evaluate(
                () => document.activeElement && document.activeElement.id === "chat-input"
            );
            if (!offen) await pageA.click("#chat-input");
            // Der Voxel-Befehl lässt seinen Satz im Feld stehen (Wiederholung mit Enter): der Spieler markiert ihn und tippt neu.
            await pageA.keyboard.down("Control");
            await pageA.keyboard.press("KeyA");
            await pageA.keyboard.up("Control");
            await pageA.keyboard.type(satz);
            await pageA.keyboard.press("Enter");
            await sleep(300);
        };
        const bautenVon = (p) => p.evaluate(() => (st.architectures || []).map((e) => String(e.id)));
        // die drei Akte, bis B den Abdruck von A trägt (höchstens 8 s), dann der Nachlauf (eine zweite Anwendung landet danach)
        const werke = () => (st.architectures || []).filter((e) => e.werk).length;
        const akte = async () => {
            const [vorA, nA, wB] = [
                await bautenVon(pageA),
                (await pageA.evaluate(abdruck, [])).edits.length,
                await pageB.evaluate(werke),
            ];
            for (const satz of ["voxel carve", "voxel fill", "bau mir ein haus", "pflege das land"]) await sage(satz);
            const a = (await bautenVon(pageA)).filter((id) => !vorA.includes(id));
            // B trägt so viele Edits wie A und je Bau von A ein neues Werk (das Ereignis, nie die Uhr)
            const n = (await pageA.evaluate(abdruck, [])).edits.length;
            await waitFor(
                pageB,
                (n, w) => {
                    const st = anazhRealm.state;
                    return (
                        (st.worldMeta.voxelEdits || []).length >= n &&
                        st.architectures.filter((e) => e.werk).length >= w
                    );
                },
                "B trägt die Akte von A",
                n,
                wB + a.length
            ).catch(() => {});
            await sleep(GRABEN_NACHLAUF_MS);
            const [A, B] = await moment(a);
            return {
                a,
                edits: A.edits.length - nA,
                A,
                B,
                gleich: gleichIn(A, B),
            };
        };
        const g = await akte();
        const teile = ["edits", "bauten", "boden", "zug"];
        const satz = (gl, t = teile) => t.map((k) => `${k} ${gl(k) ? "gleich" : "VERSCHIEDEN"}`).join(" · ");
        check(
            "A gräbt, schüttet und baut per Chat (zwei Edits und ein Bau bei A)",
            g.edits === 2 && g.a.length === 1,
            `${g.edits} Edits, Bauten ${g.a.join(",") || "—"}`
        );
        check(
            "(e) Peers: der Abdruck der Schreib-Akte (Edits, Bauten mit Kennung, Boden) byte-gleich auf A und B",
            g.a.length > 0 && teile.every(g.gleich),
            satz(g.gleich) +
                (g.B.edits.length < g.A.edits.length
                    ? " — Täter _chatTryVoxelDebugCommand: schnitzt direkt statt über dslRun"
                    : "") +
                (g.B.edits.length > g.A.edits.length
                    ? " — Täter: B wendet eine Akt-Nachricht mehrfach an (_p2pMsgDsl)"
                    : "") +
                (g.gleich("bauten")
                    ? ""
                    : ` — Bau bei A ${JSON.stringify(g.A.bauten)}, bei B ${JSON.stringify(g.B.bauten)}: die Kennung ist keine Funktion des Akts`) +
                (g.gleich("zug") ? "" : " — Täter: die Welt-Uhr reist nicht (pos.w)")
        );
        teilSim("Peers", g.A, g.B);
        // der Selbsttest der Klassen-Linse: A trägt EINE falsch gemerkte Klasse (im selben Zug gesetzt, gelesen und zurückgelegt —
        // kein Takt rechnet mit ihr) → ROT beim Namen `_bestandFeld`
        const naheA = await pageA.evaluate(() => r._bestandNah());
        const falsch = await pageA.evaluate(
            (nahe, quelle) => {
                const m = r._bestandKlassen.map;
                const k = nahe[0] + ":0,0";
                const alt = m.get(k);
                m.set(k, "falsch-gemerkt");
                try {
                    return (0, eval)("(" + quelle + ")")([], nahe);
                } finally {
                    if (alt === undefined) m.delete(k);
                    else m.set(k, alt);
                }
            },
            naheA,
            abdruck.toString()
        );
        const kf = klasseUrteil(falsch, g.B);
        check(
            "(f) Selbsttest: eine falsch gemerkte Klasse bei A macht die Klassen-Linse ROT beim Namen",
            kf.a === 1 && /Täter _bestandFeld/.test(kf.satz),
            kf.rot ? kf.satz : "GRÜN, die Linse ist blind"
        );

        // (f) DIE BODEN-KLASSE DES BESTANDS LIEST NUR DIE SAAT (der Täter hinter „leben VERSCHIEDEN“ am Kopf w28-stadt-grammatik
        // 22872718, 3/3 ROT): sie las den Hang SAMT Erdbau der Orte (gelaende-core `hoehe` nennt ihn 0, wo ein Erdbau liegt),
        // der Bestand merkt sie einmal je Zelle — die Seite, die vor dem Erdbau fragte, trug eine andere Klasse als die danach
        // und als jeder Reload. Gelesen an den Zell-Mitten des Bestands (die Punkte von `_bestandFeld`; die nahen Regionen und jede am Erdbau) und im 4-m-Raster
        // der Erdbau-Zellen, jede Lesart MIT dem Erdbau und OHNE ihn (derselbe Moment, die Liste kehrt im finally zurück): der
        // Leser `_bodenKlasseAt` kippt an 0 Punkten; der Selbsttest liest wie bis dahin (`_terrainMacroSurfaceY`) und kippt.
        const klasse = await pageA.evaluate(() => {
            const wm = st.worldMeta;
            const BR = r.constructor.BESTAND_REGION;
            const LG = r.constructor._lebensraumGesetz();
            const S = r._bestandSeite();
            const E = r._erdbauLage();
            const Z = globalThis.__gelaendeCore.ERDBAU.zelleM;
            const P = [];
            // die Regionen des Bestands: die nahen UND jede, die eine Erdbau-Zelle berührt (sie wird nah, sobald ein Spieler dort steht)
            const regionen = new Set(r._bestandNah());
            for (const key of E ? E.zellen.keys() : []) {
                const [x, z] = [(Math.floor(key / 65536) - 32768) * Z, ((key % 65536) - 32768) * Z];
                for (const [a, b] of [[x, z], [x + Z, z], [x, z + Z], [x + Z, z + Z]])
                    regionen.add(Math.floor(a / S) + "," + Math.floor(b / S));
            }
            for (const key of regionen) {
                const [ix, iz] = key.split(",").map(Number);
                for (let i = 0; i < BR.zellen; i++)
                    for (let j = 0; j < BR.zellen; j++)
                        P.push([(ix + (i + 0.5) / BR.zellen) * S, (iz + (j + 0.5) / BR.zellen) * S]);
            }
            const bestand = P.length;
            for (const key of E ? E.zellen.keys() : [])
                for (let i = 2; i < Z; i += 4)
                    for (let j = 2; j < Z; j += 4)
                        P.push([(Math.floor(key / 65536) - 32768) * Z + i, ((key % 65536) - 32768) * Z + j]);
            const alt = (x, z) => {
                const h = r._hydroDistAt(x, z);
                const aus = {};
                r._terrainMacroSurfaceY(x, z, true, aus);
                return LG.bodenKlasse(h.dist - Math.max(1, h.halfW), aus.hang || 0, r._forestStandDensity(x, z), LG.L);
            };
            const lies = () => [P.map(([x, z]) => r._bodenKlasseAt(x, z)), P.map(([x, z]) => alt(x, z))];
            const mit = lies();
            const roh = wm.erdbau;
            let ohne;
            try {
                wm.erdbau = undefined;
                ohne = lies();
            } finally {
                wm.erdbau = roh;
            }
            const kippt = (a, b) => a.reduce((n, v, i) => n + (v !== b[i] ? 1 : 0), 0);
            return {
                n: P.length,
                bestand,
                regionen: regionen.size,
                orte: roh ? Object.keys(roh).length : 0,
                neu: kippt(mit[0], ohne[0]),
                alt: kippt(mit[1], ohne[1]),
                altBestand: kippt(mit[1].slice(0, bestand), ohne[1].slice(0, bestand)),
            };
        });
        const klasseSatz = `${klasse.n} Punkte (${klasse.bestand} Zell-Mitten des Bestands in ${klasse.regionen} Regionen), ${klasse.orte} Ort(e) mit Erdbau`;
        check(
            "(f) die Boden-Klasse des Bestands liest nur die Saat: mit und ohne Erdbau der Orte dieselbe",
            klasse.orte > 0 && klasse.neu === 0,
            `kippt an ${klasse.neu} von ${klasseSatz}` +
                (klasse.neu ? " — Täter _bodenKlasseAt: liest den Hang samt Erdbau statt `_terrainSaatY`" : "")
        );
        check(
            "(f) Selbsttest: die alte Lesart (der Hang samt Erdbau, `_terrainMacroSurfaceY`) kippt die Klasse beim Namen",
            klasse.alt > 0,
            `kippt an ${klasse.alt} von ${klasse.n} Punkten, davon ${klasse.altBestand} Zell-Mitten des Bestands` +
                (klasse.alt ? "" : " — GRÜN, die Linse ist blind")
        );

        // ── (i) DIE TAT DER KI REIST: der Begleiter baut (`maybeAnswerWithLlm` → dslRun source "llm:grok"), B trägt das Werk mit
        // derselben Kennung; ein Gesetz der KI (Kopf "rule") bleibt lokal. Geurteilt am Ereignis: danach baut A als Spieler (die
        // Marke) — trägt B die Marke, trägt der Kanal alles davor. Täter, wenn ROT: das Tor `_tatReist` liest nur "human".
        const kiTat = async (altesTor) => {
            const wB = await pageB.evaluate(werke);
            const a = await pageA.evaluate((alt) => {
                if (alt) r._tatReist = (p, c) => c.source === "human";
                const ids = () => st.architectures.map((e) => String(e.id));
                const bau = (q, n) => {
                    const v = ids();
                    const name = r._studioBlueprintForWord("haus");
                    const p = ["spawn_studio", "haus", ["at_player_forward", 18 + n * 6], 1, r._bauSame("studio:" + name)];
                    r.dslRun(p, { source: q });
                    return ids().filter((id) => !v.includes(id));
                };
                const ki = bau("llm:grok", 0);
                const regel = r._regelAusSatz("wann immer es zufällig passt, dann erzähle Die KI denkt laut").program;
                const H = r._regelHash({ cond: regel[1], effect: regel[2] });
                r.dslRun(regel, { source: "llm:grok" });
                const marke = bau("human", 1);
                if (alt) delete r._tatReist;
                return { ki, marke, H, regelA: st.worldRules.some((x) => r._regelHash(x) === H) };
            }, altesTor);
            await waitFor(pageB, (w) => st.architectures.filter((e) => e.werk).length >= w, "B trägt die Marke von A", wB + 1);
            // das alte Tor hinterlässt bei A ein Werk, das B nie sah: A reißt es ab (der Abdruck des Reloads bleibt gleich)
            if (altesTor) await pageA.evaluate((ki) => ki.forEach((id) => r.dslRun(["remove_architecture", id], { source: "human" })), a.ki);
            const b = await pageB.evaluate(
                (ki, H) => ({
                    ki: ki.filter((id) => st.architectures.some((e) => String(e.id) === id)).length,
                    regel: st.worldRules.some((x) => r._regelHash(x) === H),
                }),
                a.ki,
                a.H
            );
            return { a, b };
        };
        const ki = await kiTat(false);
        check(
            "(i) die Tat der KI reist: A's Begleiter baut (llm:grok), B trägt das Werk mit derselben Kennung, das Gesetz der KI bleibt lokal",
            ki.a.ki.length === 1 && ki.b.ki === 1 && ki.a.regelA && !ki.b.regel,
            `Werke der KI bei B ${ki.b.ki}/${ki.a.ki.length} · Gesetz der KI bei A ${ki.a.regelA}, bei B ${ki.b.regel}` +
                (ki.b.ki < ki.a.ki.length ? " — Täter _tatReist: das Tor liest nur \"human\"" : "") +
                (ki.b.regel ? " — Täter _tatReist: das Gesetz der KI reist" : "")
        );
        const alt = await kiTat(true);
        check(
            "(i) Selbsttest: das alte Tor (nur \"human\") hält die Tat der KI zurück → B trägt sie nicht",
            alt.a.ki.length === 1 && alt.b.ki === 0,
            `Werke der KI bei B ${alt.b.ki}/${alt.a.ki.length}`
        );

        // ── (h) DAS GESETZ DES SPIELERS: A schreibt es im Gespräch, B trägt es, beide würfeln gleich, die Wirkung steht bei beiden ──
        await pageB.evaluate(() => (st.dsl.nextRuleId += 3)); // B's Nexus erprobte drei Regeln mehr
        // die Seite trägt das Gesetz H (n = 0) oder es feuerte (n = 1) — oder die Welt-Uhr steht hinter der Scheibe `bis`
        const traegt = (H, n, bis) =>
            st.worldRules.some((x) => r._regelHash(x) === H && x.fires >= n) ||
            st.spielZeit > bis * 3;
        const gesetz = async (satz, reist) => {
            const { vor } = await pageA.evaluate(gesetzSicht, "", 0);
            await sage(satz);
            const { H, k } = await pageA.evaluate(gesetzSicht, "", 0);
            await (reist ? waitFor(pageB, traegt, "B trägt das Gesetz von A", H, 0) : sleep(GRABEN_NACHLAUF_MS));
            const [A, B] = [await pageA.evaluate(gesetzSicht, H, k), await pageB.evaluate(gesetzSicht, H, k)];
            const bis = k + 2 + A.wurf.split(",").indexOf("true");
            return { H, bis, neu: !vor.includes(H), reist: B.H === H, wurf: B.wurf === A.wurf };
        };
        const h = await gesetz("wann immer es zufällig passt, dann erzähle Der Fluss singt im Takt der Sterne", true);
        // die Wirkung bis zu ihrem Ereignis: das Gesetz feuert, spätestens in der Scheibe nach dem ersten wahren Wurf — die Frist
        // ist die Welt-Uhr, nie die Wanduhr (mit der alten Saat aus Platz-Nummer und Feuern würfelte jede Seite stets denselben
        // Wurf: fiel er daneben, feuerte das Gesetz nie, und die Probe wartete ohne Ende)
        for (const p of [pageA, pageB]) await waitFor(p, traegt, "das Gesetz feuert", h.H, 1, h.bis);
        const [A, B] = [await pageA.evaluate(gesetzSicht, h.H, 0), await pageB.evaluate(gesetzSicht, h.H, 0)];
        check(
            "(h) A schreibt ein neues Gesetz im Gespräch, B trägt es, beide würfeln gleich, es wirkt bei beiden",
            h.neu && h.reist && h.wurf && A.wirkt && B.wirkt && B.erinnert,
            `Hash ${h.H} neu ${h.neu} · bei B ${h.reist} · Wurf in 40 Scheiben gleich ${h.wurf}${h.wurf ? "" : " — Täter _worldRuleSeed"}` +
                ` · wirkt bei A ${A.wirkt}, bei B ${B.wirkt} · B erinnert das Gesetz von A ${B.erinnert}`
        );
        // die Selbsttests: A sagt die Vorlage → nicht neu; B's dsl-Kanal taub → B ohne das Gesetz
        const v = await gesetz(await pageA.evaluate(() => r.constructor.GESETZ_VORLAGEN[0]), true);
        await pageB.evaluate(() => ((window.__dsl = r._p2pMsgDsl), (r._p2pMsgDsl = () => {})));
        const t = await gesetz("wann immer es zufällig passt, dann erzähle Der Kanal ist taub", false);
        await pageB.evaluate(() => (r._p2pMsgDsl = window.__dsl));
        check(
            "(h) Selbsttest: die Vorlage ist nicht neu, B mit taubem dsl-Kanal trägt das Gesetz nicht",
            !v.neu && v.reist && t.neu && !t.reist,
            `Vorlage neu ${v.neu} · taub bei B ${t.reist}`
        );

        // ── (a) URSPRUNG ── (vor dem Reload von B: seine Zähler leben in der Seite)
        const endA = await bericht(pageA);
        const endB = await bericht(pageB);
        for (const [n, s] of [
            ["A", endA],
            ["B", endB],
        ]) check(
                `(a) Seite ${n}: kein Mitspieler-Takt im Ursprung`,
                s.ursprung === 0,
                `${s.ursprung} Takte am Ursprung (davon ${s.ursprungOhneOrt} ohne je empfangenen Ort) von ${s.peerTakte} Peer-Takten` +
                    (s.ursprung
                        ? ` — Täter _p2pEnsurePeerEntry: Leib/Schild sichtbar bei 0/0/0 (${JSON.stringify(s.ursprungBeispiel)})`
                        : "")
            );

        // (e) der Reload von B: sein Speicher (saveState, derselbe Schreiber wie die Sicherung), dann die Seite neu, bis ihre Welt
        // steht und den Bau trägt
        const netzB = await pageB.evaluate(() => Object.assign({}, window.__netz));
        await pageB.evaluate(() => r.saveState());
        await pageB.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        const steht = (ids) => {
            const da = r && st.playerMesh && !r._ladeSperre && st.p2p.connected;
            return !!da && ids.every((id) => (st.architectures || []).some((e) => String(e.id) === id));
        };
        let nachReload = false; // reißt der Rahmen (die Seite lädt sich beim Betreten der Welt selbst neu), fragt sie erneut
        for (let i = 0; i < 3 && !nachReload; i++)
            nachReload = await waitFor(pageB, steht, "B nach dem Reload mit dem Bau", g.a).then(
                () => true,
                () => false
            );
        // B spielt wieder (die Pumpe trägt jede Seite ab ihrer Geburt, die Probe hängt sich neu ein), bis sein erster Zug den
        // laufenden Sturm zieht
        if (nachReload) await pageB.evaluate(installiere, false);
        await waitFor(pageB, () => r._wetterZug !== undefined, "B zieht den Zug");
        // DERSELBE MOMENT auf beiden Seiten: die Welt-Uhr lief weiter, seit A seinen Abdruck der Akte nahm — unter Last stand B
        // im Reload bis 79 s, und der Zug wechselt je WETTER_ZUG_SEK (120 s); Edits, Bauten und Boden stehen seit den Akten still
        const [jetztA, R] = nachReload ? await moment(g.a) : [];
        const rg = R && gleichIn(R, jetztA);
        check(
            "(e) Reload: B trägt nach dem Neuladen denselben Abdruck",
            !!R && teile.every(rg),
            R ? satz(rg) : "B stand nach dem Reload nicht mit dem Bau"
        );
        if (R) teilSim("Reload mitten im Sturm", jetztA, R);
        // der Selbsttest: B wendet jede Akt-Nachricht doppelt an und nimmt den Samen des Baus um eins verschoben — die Edits UND die
        // Bauten des Abdrucks fallen ROT (die Probe sieht beide); (f) B nimmt keine Uhr mehr, A springt in den Zug vor einem Sturm
        // drei Züge voraus — nie in den von B, der Zug ROT. Bis ci-wackler-zensus einen voraus: lag der Sturm im nächsten Zug, landete
        // A im Zug von B, und der Selbsttest war blind, je nachdem, wie weit die Uhr unter Last lief (CI 40467672118; der Kern
        // wetterAt über 2000 Züge: blind in 10,6–12,2 %, mit 3 in keinem). B wird taub, BEVOR A springt (mp-leitung: sprang A
        // zuerst, erreichte unter Last ein pos.w von A die Seite B vor ihrem Eingriff — „zug gleich" in 1 von 3 Läufen auf 2 Kernen)
        await pageB.evaluate(() => {
            r._weltUhrNimm = () => {};
            const echt = r._p2pMsgDsl;
            const schiebe = (n) =>
                Array.isArray(n)
                    ? n[0] === "spawn_studio"
                        ? [...n.slice(0, 4), (n[4] + 1) >>> 0, ...n.slice(5)]
                        : n.map(schiebe)
                    : n;
            r._p2pMsgDsl = function (msg, p2p) {
                const m = Object.assign({}, msg, { program: schiebe(msg.program) });
                echt.call(this, m, p2p);
                return echt.call(this, m, p2p);
            };
        });
        await pageA.evaluate(sturmSprung, 3);
        const s = await akte();
        check(
            "(e)(f) Selbsttest: B wendet jede Akt-Nachricht doppelt an, verschiebt den Samen des Baus, trägt eigene Uhr → Edits, Bauten, Zug ROT",
            s.a.length > 0 && !["edits", "bauten", "zug"].some(s.gleich),
            satz(s.gleich)
        );
        // DAS NETZ-LOG beider Seiten (B vor und nach dem Reload): jede Art ist erlaubt, sonst eine Zustands-Nachricht
        const netz = async () => {
            const n = { A: await pageA.evaluate(() => window.__netz), B: Object.assign({}, netzB) };
            for (const [t, k] of Object.entries(await pageB.evaluate(() => window.__netz))) n.B[t] = (n.B[t] | 0) + k;
            return n;
        };
        const fremd = (n) =>
            Object.entries(n).flatMap(([seite, log]) =>
                Object.keys(log)
                    .filter((t) => !NETZ_ERLAUBT.has(t))
                    .map((t) => `${seite} ${t}×${log[t]}`)
            );
        const n0 = await netz();
        check(
            "(e) Netz-Log: keine Zustands-Nachricht, nur Schreib-Akte, Leib, Sicht und Leitung",
            fremd(n0).length === 0 && n0.A.dsl > 0,
            JSON.stringify(n0) + (fremd(n0).length ? " — Zustand: " + fremd(n0).join(", ") : "")
        );
        await pageA.evaluate(() => r.p2pSend({ type: "wetter" }));
        const n1 = fremd(await netz());
        check(
            "(e) Selbsttest: eine Wetter-Nachricht von A macht das Netz-Log ROT",
            n1.some((x) => x.startsWith("A wetter")),
            n1.join(", ") || "GRÜN, die Linse ist blind"
        );
        const [, sa] = await stille(true);
        check(
            "(g) Selbsttest: der alte Leerlauf-Abschied macht (g) ROT beim Namen",
            /Täter p2pTick/.test(sa),
            sa.slice(2)
        );

        // ── (f) DER EINGANG DER AKTE WARTET AUF DIE FOLGE (w28-mp-boden, am Ende: nichts wird danach verglichen) ──
        // Eine nahe Region von A trägt drei Takte vor dem Stempel des Akts noch nicht (ihr `t` für den Augenblick zurückgestellt, im
        // selben Zug zurückgelegt): der Akt tritt in die Reihe und wirkt nicht. Selbsttest: der alte Eingang (sofort, gleich wo die
        // Folge steht) lässt ihn wirken — der Spion nennt ihn „überholt“.
        const eingang = (alt) =>
            pageA.evaluate((alt) => {
                const T = r.constructor._bestandGesetz().B.taktS;
                const R = r._bestandRegion(r._bestandNah()[0], false);
                const [AF, t0, reihe] = [window.__aktFolge, R.t, st.feldAkte];
                const [u0, g0] = [AF.ueberholt, AF.n];
                const w = r._feldHorizont();
                const akt = { art: "leben", w, x: pm.position.x + 4000, z: pm.position.z + 4000, a: 1e-6 };
                st.feldAkte = [];
                R.t = Math.floor(w / T) * T - 3 * T;
                try {
                    if (alt) r._feldFolgeSteht = () => true;
                    r._feldAkt(akt, false);
                    return { inReihe: st.feldAkte.includes(akt), gewirkt: AF.n - g0, ueberholt: AF.ueberholt - u0 };
                } finally {
                    delete r._feldFolgeSteht;
                    [R.t, st.feldAkte] = [t0, reihe];
                }
            }, alt);
        const ein = await eingang(false);
        check(
            "(f) am Eingang tritt ein Akt in die Reihe, solange ein Takt einer nahen Region vor seinem Stempel aussteht",
            ein.inReihe && ein.gewirkt === 0 && ein.ueberholt === 0,
            `in der Reihe ${ein.inReihe} · gewirkt ${ein.gewirkt} · überholt ${ein.ueberholt}` + (ein.gewirkt ? " — Täter _feldAkt: wirkt vor dem Takt" : "")
        );
        const einAlt = await eingang(true);
        check(
            "(f) Selbsttest: der alte Eingang (sofort, gleich wo die Folge steht) lässt den Akt vor drei Takten wirken — beim Namen",
            !einAlt.inReihe && einAlt.gewirkt === 1 && einAlt.ueberholt === 1,
            `in der Reihe ${einAlt.inReihe} · gewirkt ${einAlt.gewirkt} · überholt ${einAlt.ueberholt}` + (einAlt.ueberholt ? " — Täter _feldAkt" : " — GRÜN, die Linse ist blind")
        );

        // ── (f) DIE KLASSE WARTET AUF IHRE HYDRO-KACHEL (w28-mp-boden, am Ende: die Probe bestellt bei A eine ferne Kachel) ──
        // Die Regionen des Bestands über der Kachel "1,0" (jenseits der Heimat): mit der Kachel liest jede Zelle ihre Klasse am
        // Rand ihres Flusses; ohne sie antwortet der Kern aus der Heimat „kein Fluss“ — die frühe Antwort kippt an K Zellen. Die
        // Kachel wird der Seite genommen (wie vor ihrer Ankunft) und zurückgelegt: `_bestandBereit` hält die Region, `_bestandFeld`
        // merkt nichts, danach trägt jede Zelle die frische Klasse. Selbsttest: das alte Merkbuch (merkt sofort) trägt K falsche.
        await pageA.evaluate(() => r._ensureHydroTilesAround(r.constructor.HYDROSPHERE.regionSize, 0, 1));
        const kachelDa = await waitFor(pageA, () => !!st.hydroTiles && st.hydroTiles.has("1,0"), "A trägt die Hydro-Kachel 1,0").then(
            () => true,
            () => false
        );
        const spaet = (alt) =>
            pageA.evaluate((alt) => {
                const [BR, S, G, T] = [r.constructor.BESTAND_REGION, r._bestandSeite(), r.constructor.HYDROSPHERE.regionSize, st.hydroTiles];
                const keys = [];
                for (let ix = Math.ceil(G / 2 / S); (ix + 1) * S <= 1.5 * G; ix++)
                    for (let iz = Math.ceil(-G / 2 / S); (iz + 1) * S <= G / 2; iz++) keys.push(ix + "," + iz);
                const lies = () => keys.flatMap((key) => r._bestandFeld(key).zellen.map((z) => z.klasse));
                const gemerkt = () => [...r._bestandKlassen.map.keys()].filter((k) => keys.includes(k.split(":")[0]));
                const leeren = () => gemerkt().forEach((k) => r._bestandKlassen.map.delete(k));
                leeren();
                const frisch = lies(); // die Kachel steht
                leeren();
                const kachel = T.get("1,0");
                let frueh, davor, bereit;
                T.delete("1,0"); // die Kachel ist noch nicht da
                try {
                    if (alt) r._bestandBereit = () => true; // das alte Merkbuch: jede Region rechnet und merkt sofort
                    bereit = keys.filter((key) => r._bestandBereit(key)).length;
                    frueh = lies();
                    davor = gemerkt().length;
                } finally {
                    T.set("1,0", kachel);
                    delete r._bestandBereit;
                }
                const danach = lies(); // die Kachel kam an
                leeren();
                const anders = (a) => frisch.reduce((n, v, i) => n + (v !== a[i] ? 1 : 0), 0);
                return { zellen: frisch.length, regionen: keys.length, bereit, kippt: anders(frueh), davor, falsch: anders(danach), BR: BR.zellen };
            }, alt);
        const sp = kachelDa ? await spaet(false) : null;
        check(
            "(f) eine Region über einer Hydro-Kachel, die noch nicht da ist, rechnet nicht und merkt keine Klasse; nach der Ankunft trägt sie die frische",
            !!sp && sp.kippt > 0 && sp.bereit === 0 && sp.davor === 0 && sp.falsch === 0,
            sp
                ? `${sp.regionen} Regionen über der Kachel 1,0 (${sp.zellen} Zellen): die frühe Antwort kippt an ${sp.kippt} · bereit ohne Kachel ${sp.bereit} · ` +
                      `davor gemerkt ${sp.davor} · danach falsch ${sp.falsch}` +
                      (sp.kippt ? "" : " — die Linse ist blind (kein Fluss an einer Zell-Mitte der Kachel)") +
                      (sp.bereit || sp.davor || sp.falsch ? " — Täter _bestandFeld/_bestandBereit: die Region rechnet vor ihrer Hydro-Wahrheit" : "")
                : "die Kachel 1,0 kam nicht"
        );
        const spAlt = kachelDa ? await spaet(true) : null;
        check(
            "(f) Selbsttest: das alte Merkbuch (merkt sofort, ohne die Kachel) trägt nach ihrer Ankunft falsche Klassen beim Namen",
            !!spAlt && spAlt.falsch > 0 && spAlt.falsch === spAlt.kippt,
            spAlt ? `falsch gemerkt ${spAlt.falsch} von ${spAlt.zellen} Zellen (die frühe Antwort kippt an ${spAlt.kippt})` + (spAlt.falsch ? " — Täter _bestandFeld" : " — GRÜN, die Linse ist blind") : "die Kachel 1,0 kam nicht"
        );
    }
    await browser.close();
    console.log(`gate:mp-sync ${fehler.length ? "ROT" : "GRÜN"} — ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    process.exit(fehler.length ? 1 : 0);
});
// die Dienste der Probe fallen mit ihr, auch beim Absturz (hauptLauf endet mit process.exit)
process.on("exit", () => [saveServer, signaling].forEach((p) => p && p.kill()));

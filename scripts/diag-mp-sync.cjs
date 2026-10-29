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
//                 am Ort ein Sturm aufzieht (erst in den Zug davor, der jeden alten Wunsch nimmt); B folgt der Uhr von A
//                 (`pos.w`, `_weltUhrNimm`) — der Zug der Welt-Uhr steht hart im Abdruck von (e), über Peers und den Reload
//                 mitten im Sturm. Was Stufe 2 noch verlangt, steht als OFFEN mit Zahl: Wetter (Wort, Übergang) und Leben (A
//                 pflegt im Gespräch) je Zelle gleich; Brand und Pegel sind hier ungemessen (das Entfachen reist nicht, kein
//                 Wasser am Graben). Selbsttest: B mit eigener Uhr → der Zug ROT.
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
const {
    starteBrowser,
    nullRenderer,
    halteBis,
    startProc,
    eigenePorte,
    sleep,
    waitFor,
    hauptLauf,
} = require("./lib/welt-boot.cjs");

// die eigenen Ports: MP_SYNC_PORT und MP_SYNC_SIGNAL_PORT, sonst freie des Systems (welt-boot `eigenePorte`) — nie 4312/4313, die Server des Schöpfers
let PORT, SIGNAL_PORT, PAGE_URL, SIGNALING_URL;
const ROOM = "mp-sync-raum";
const SELBSTTEST = process.argv.includes("--selftest");
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
const NETZ_ERLAUBT = {
    dsl: "Schreib-Akt",
    ...Object.fromEntries(["pos", "input", "soul", "vibe"].map((t) => [t, "Leib"])),
    ...Object.fromEntries(["creature-pos", "companion-say"].map((t) => [t, "Sicht"])),
    ...Object.fromEntries(["join", "rtc-offer", "rtc-answer", "rtc-ice", "stats"].map((t) => [t, "Leitung"])),
};
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
        const r = window.anazhRealm;
        if (!r || !r._gameLoopTick || window.__ruht) return; // `__ruht`: der Loop steht (g)
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
    const p2p = anazhRealm.state.p2p;
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
// jedem Edit und (f) der Zug der Welt-Uhr — verglichen als JSON-Text, byte-gleich oder nicht; dazu (f) das Wetter (Wort, Übergang)
// und das Leben je Zelle, die Stufe 2 noch verlangt
function abdruck(bauten) {
    const r = anazhRealm;
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
    const leben = [...(st.lifeField || [])].map(([k, e]) => JSON.stringify([k, e.a, e.t]));
    return { edits, bauten: B.sort(), boden, zug: r._wetterZug, wetter, leben };
}
// (h) die Sicht einer Seite auf das Gesetz H (ohne H: das jüngste des Spielers): der Wurf der Scheiben k0 … k0+39 der Welt-Uhr,
// ob es feuerte und seine Erzählung im Wissen steht, ob das Tagebuch das Gesetz eines Mitspielers erinnert (`_gesetzGeber`);
// `vor`: die Hashes der Vorlagen (`GESETZ_VORLAGEN` über den EINEN Satz-Parser) und jedes Gesetzes, das die Welt schon trägt
function gesetzSicht(H, k0) {
    const r = anazhRealm;
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
    const r = anazhRealm;
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
    const r = anazhRealm;
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
                (oz && oz.x === 0 && oz.z === 0)
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
    await page.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    const da = () =>
        !!window.anazhRealm &&
        typeof window.anazhRealm._gameLoopTick === "function" &&
        !!window.anazhRealm.state.playerMesh;
    await waitFor(page, da, `Seite ${name} bereit`);
    await page.evaluate(installiere, alteTuer);
    return page;
}

function bericht(p) {
    return p.evaluate(() => {
        const { peerTakte, ursprung, ursprungOhneOrt, ursprungBeispiel, inits } = __mp;
        const p2p = anazhRealm.state.p2p;
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
    // `offen`: ein Teil der Staffel, der noch nicht gleich ist — gemessen und mit Zahl berichtet, ohne die Wand zu brechen
    const check = (name, ok, detail = "", offen = false) => {
        console.log(`  ${ok ? "OK  " : offen ? "OFFEN" : "ROT "} ${name}${detail ? " — " + detail : ""}`);
        if (!ok && !offen) fehler.push(name);
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
        const vorTuer = await pageA.evaluate(() => anazhRealm.state.p2p.enabled === true);
        await pageA.evaluate(() => anazhRealm.initP2PSync(null));
        await sleep(3000);
        signaling = await startProc("signaling-server.js", /lauscht/, {
            PORT: String(PORT),
            ANAZH_SIGNALING_PORT: String(SIGNAL_PORT),
        });
        // bis zu seinem EREIGNIS, nie nach der Uhr: A verbunden — oder die Absicht fehlt (dann plant der close-Zweig nie, nichts
        // kann mehr heilen; vorher eine Wanduhr-Schleife je 250 ms bis REJOIN_DECKEL_S, die zwölf Proben ohne Plan abwartete)
        const rejoinMs = await waitFor(
            pageA,
            () => anazhRealm.state.p2p.connected || !anazhRealm.state.p2p.enabled,
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
        await waitFor(pageA, () => anazhRealm.state.p2p.connected === true, "A verbunden über den Knopf");
        const kVerb = await bericht(pageA);
        check("Knopf an: A verbunden, Knopf „an“", kVerb.connected && kVerb.knopf === "true", `Inits ${kVerb.inits}`);

        // ── Seite B: der BOOT (die gemerkte Absicht aus p2pPersist) ──
        const pageB = await seite(browser, "B", false);
        await waitFor(pageB, () => anazhRealm.state.p2p.connected === true, "B verbunden über den Boot");
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
            (id) => !!anazhRealm.state.p2p.peers.get(id)?.vibeVerified,
            "B verifiziert A's Vibe-Pass",
            idA
        ).catch(() => -1);
        check(
            "W13 P3: der Broker relayt den Vibe-Pass mit peerId-Stempel, B verifiziert A",
            vibeMs >= 0,
            `${vibeMs} ms`
        );

        // A steht: der Ladeschirm ist gefallen (erst dann gehören die Tasten dem Spieler), die Höhe ruhig.
        await waitFor(pageA, () => !anazhRealm._ladeschirmSteht(), "A: Ladeschirm weg");
        await waitFor(
            pageA,
            () => {
                const y = anazhRealm.state.playerMesh.position.y;
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
                const p = anazhRealm.state.playerMesh.position;
                return { x: p.x, z: p.z };
            });
            // W bis zu seinem EREIGNIS (A steht LAUF_M vom Start), nie nach der Uhr: unter Last lief A in 1,6 s 0,77 m
            const halt = await halteBis(pageA, {
                taste: "w",
                ziel: (soll, s) => {
                    const p = anazhRealm.state.playerMesh.position;
                    return Math.hypot(p.x - s.x, p.z - s.z) >= soll;
                },
                args: [LAUF_M, vorLauf],
                frist: LAUF_FRIST_MS,
            });
            await waitFor(
                pageA,
                () => {
                    const p = anazhRealm.state.playerMesh.position;
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
                const p = anazhRealm.state.playerMesh.position;
                return { x: p.x, z: p.z };
            });
            const sichtB = await pageB.evaluate((id) => {
                const e = anazhRealm.state.p2p.peers.get(id);
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
                    const r = anazhRealm;
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
            await pageA.evaluate(() => (window.__ruht = true));
            await sleep(STILLE_S * 1000);
            const anker = await pageA.evaluate(() => {
                window.__ruht = false;
                return (Math.floor(anazhRealm.state.p2p._lockstepSeq / 60) + 1) * 60;
            });
            await waitFor(
                pageB,
                (id, q) => {
                    const p2p = anazhRealm.state.p2p;
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
            (await pageA.evaluate(() => anazhRealm.state.p2p._lockstepTrace || [])).map((q) => [q.q, q])
        );
        const spurB = await pageB.evaluate((id) => anazhRealm.state.p2p.peers.get(id)?.lockstep?.trace || [], idA);
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
            const K = anazhRealm.constructor;
            return { reserve: K.LOCKSTEP.jitterReserve, aufhol: K.LOCKSTEP.aufholJeSchritt, fixMs: K.FIXED_DT * 1000 };
        });
        // DER LANGE TAKT IN SCHRITTEN: der Ghost bei B verbraucht erst, wenn seit seinem letzten Takt ZUFLUSS_SOLL
        // Schritte von A angekommen sind — ein Takt trägt so immer das Doppelte der alten Kappe, gleich wie schnell A
        // sendet und wie belastet der Läufer ist
        const ZUFLUSS_SOLL = ZUFLUSS_FAKTOR * lsGesetz.aufhol;
        const langeTakte = (an, alteKappe) =>
            pageB.evaluate(
                (an, soll, alteKappe, pid) => {
                    const r = anazhRealm;
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
            const z = [...f.zufluss].sort((a, b) => a - b);
            return z.length ? z[z.length >> 1] : 0;
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
            waitFor(pageB, (z) => anazhRealm.state.spielZeit >= z, "B trägt die Uhr von A", z).catch(() => {
                throw new Error(
                    "(f) ROT: B trägt die Welt-Uhr von A nicht — Täter: die Uhr je Seite (pos.w, _weltUhrNimm)"
                );
            });
        const [vorSturm, sturm] = await pageA.evaluate(sturmSprung, 10);
        await folgt(vorSturm);
        await pageA.evaluate((z) => (anazhRealm.state.spielZeit = z), sturm);
        await folgt(sturm);
        // (f) was Stufe 2 noch verlangt, gemessen und OFFEN, bis es gleich ist: Wetter (Wort, Übergang) und Leben je Zelle
        const weich = (wann, A, B) =>
            check(
                `(f) ${wann}: Teil-Simulationen gleich`,
                false,
                `Wetter ${A.wetter === B.wetter ? "gleich" : "VERSCHIEDEN"} · Leben ${B.leben.filter((z) => A.leben.includes(z)).length}/` +
                    `${A.leben.length} gleich · Brand, Pegel ungemessen — ungebaut: Wunsch der Welt, Tat-Uhr, Fraß, Entfachen reisen nicht`,
                true
            );

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
        const bautenVon = (p) => p.evaluate(() => (anazhRealm.state.architectures || []).map((e) => String(e.id)));
        // die drei Akte, bis B den Abdruck von A trägt (höchstens 8 s), dann der Nachlauf (eine zweite Anwendung landet danach)
        const werke = () => (anazhRealm.state.architectures || []).filter((e) => e.werk).length;
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
            const [A, B] = [await pageA.evaluate(abdruck, a), await pageB.evaluate(abdruck, a)];
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
        const satz = (gl) => teile.map((k) => `${k} ${gl(k) ? "gleich" : "VERSCHIEDEN"}`).join(" · ");
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
        weich("Peers", g.A, g.B);

        // ── (h) DAS GESETZ DES SPIELERS: A schreibt es im Gespräch, B trägt es, beide würfeln gleich, die Wirkung steht bei beiden ──
        await pageB.evaluate(() => (anazhRealm.state.dsl.nextRuleId += 3)); // B's Nexus erprobte drei Regeln mehr
        // die Seite trägt das Gesetz H (n = 0) oder es feuerte (n = 1) — oder die Welt-Uhr steht hinter der Scheibe `bis`
        const traegt = (H, n, bis) =>
            anazhRealm.state.worldRules.some((x) => anazhRealm._regelHash(x) === H && x.fires >= n) ||
            anazhRealm.state.spielZeit > bis * 3;
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
        const v = await gesetz(await pageA.evaluate(() => anazhRealm.constructor.GESETZ_VORLAGEN[0]), true);
        await pageB.evaluate(() => ((window.__dsl = anazhRealm._p2pMsgDsl), (anazhRealm._p2pMsgDsl = () => {})));
        const t = await gesetz("wann immer es zufällig passt, dann erzähle Der Kanal ist taub", false);
        await pageB.evaluate(() => (anazhRealm._p2pMsgDsl = window.__dsl));
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
        ]) {
            check(
                `(a) Seite ${n}: kein Mitspieler-Takt im Ursprung`,
                s.ursprung === 0,
                `${s.ursprung} Takte am Ursprung (davon ${s.ursprungOhneOrt} ohne je empfangenen Ort) von ${s.peerTakte} Peer-Takten` +
                    (s.ursprung
                        ? ` — Täter _p2pEnsurePeerEntry: Leib/Schild sichtbar bei 0/0/0 (${JSON.stringify(s.ursprungBeispiel)})`
                        : "")
            );
        }

        // (e) der Reload von B: sein Speicher (saveState, derselbe Schreiber wie die Sicherung), dann die Seite neu, bis ihre Welt
        // steht und den Bau trägt
        const netzB = await pageB.evaluate(() => Object.assign({}, window.__netz));
        await pageB.evaluate(() => anazhRealm.saveState());
        await pageB.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        const steht = (ids) => {
            const r = window.anazhRealm;
            const da = r && r.state.playerMesh && !r._ladeSperre && r.state.p2p.connected;
            return !!da && ids.every((id) => (r.state.architectures || []).some((e) => String(e.id) === id));
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
        await waitFor(pageB, () => window.anazhRealm._wetterZug !== undefined, "B zieht den Zug");
        // DERSELBE MOMENT auf beiden Seiten: die Welt-Uhr lief weiter, seit A seinen Abdruck der Akte nahm — unter Last stand B
        // im Reload bis 79 s, und der Zug wechselt je WETTER_ZUG_SEK (120 s); Edits, Bauten und Boden stehen seit den Akten still
        const R = nachReload ? await pageB.evaluate(abdruck, g.a) : null;
        const jetztA = R && (await pageA.evaluate(abdruck, g.a));
        const rg = R && gleichIn(R, jetztA);
        check(
            "(e) Reload: B trägt nach dem Neuladen denselben Abdruck",
            !!R && teile.every(rg),
            R ? satz(rg) : "B stand nach dem Reload nicht mit dem Bau"
        );
        if (R) weich("Reload mitten im Sturm", g.A, R);
        // der Selbsttest: B wendet jede Akt-Nachricht doppelt an und nimmt den Samen des Baus um eins verschoben — die Edits UND die
        // Bauten des Abdrucks fallen ROT (die Probe sieht beide); (f) B nimmt keine Uhr mehr, A springt in den Zug vor einem Sturm
        // drei Züge voraus — nie in den von B, der Zug ROT. Bis ci-wackler-zensus einen voraus: lag der Sturm im nächsten Zug, landete
        // A im Zug von B, und der Selbsttest war blind, je nachdem, wie weit die Uhr unter Last lief (CI 40467672118; der Kern
        // wetterAt über 2000 Züge: blind in 10,6–12,2 %, mit 3 in keinem). B wird taub, BEVOR A springt (mp-leitung: sprang A
        // zuerst, erreichte unter Last ein pos.w von A die Seite B vor ihrem Eingriff — „zug gleich" in 1 von 3 Läufen auf 2 Kernen)
        await pageB.evaluate(() => {
            const r = anazhRealm;
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
                    .filter((t) => !NETZ_ERLAUBT[t])
                    .map((t) => `${seite} ${t}×${log[t]}`)
            );
        const n0 = await netz();
        check(
            "(e) Netz-Log: keine Zustands-Nachricht, nur Schreib-Akte, Leib, Sicht und Leitung",
            fremd(n0).length === 0 && n0.A.dsl > 0,
            JSON.stringify(n0) + (fremd(n0).length ? " — Zustand: " + fremd(n0).join(", ") : "")
        );
        await pageA.evaluate(() => anazhRealm.p2pSend({ type: "wetter", weather: "stormy" }));
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
    }
    await browser.close();
    console.log(`gate:mp-sync ${fehler.length ? "ROT" : "GRÜN"} — ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    process.exit(fehler.length ? 1 : 0);
});
// die Dienste der Probe fallen mit ihr, auch beim Absturz (hauptLauf endet mit process.exit)
process.on("exit", () => [saveServer, signaling].forEach((p) => p && p.kill()));

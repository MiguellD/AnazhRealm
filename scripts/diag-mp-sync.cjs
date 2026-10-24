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
//   (e) GLEICH FÜR ALLE (feld.K2) Saat + Schreib-Akte = Welt: A gräbt (c) und baut per Chat („bau mir ein haus", der Satz der
//                 Ziellinie → spawn_studio); B trägt denselben Abdruck — jeder Edit (Art, Radius, Ort), jeder Bau eines Akts
//                 (Kennung, Art, Ort, Drehung, Größe, Same, Prägung) und der Boden an jedem Edit (`_terrainDensityAt`,
//                 `_voxelSurfaceY`: die Welt, die daraus wird) —, und nach einem Reload von B (sein Speicher) derselbe. DAS
//                 NETZ-LOG zählt jede Sendung beider Seiten am Draht (WebSocket und DataChannel `send`): erlaubt sind die Schreib-
//                 Akte (dsl), der Leib des Spielers, die Sicht der eigenen Wesen und die Leitung (`NETZ_ERLAUBT`); jede andere Art
//                 ist eine Zustands-Nachricht. Dazu der Leib aus seinen Eingaben: B's Ghost rechnet jeden Schritt von A bit-gleich
//                 (je seq). Selbsttests: B wendet jede Akt-Nachricht doppelt an und nimmt den Samen des Baus um eins verschoben →
//                 Edits und Bauten des Abdrucks ROT; A sendet eine Wetter-Nachricht → das Netz-Log ROT.
// Dazu der Spielpfad: Seite A über den KNOPF (`#p2p-toggle`, zweiter Klick im Aufbau startet kein zweites Init, der
// Knopf liest die EINE Absicht), Seite B über den BOOT (die gemerkte Absicht aus `p2pPersist`). A läuft nach dem
// Ladeschirm über die Tastatur (`_stepCharacter`; A bootete zuerst, sein Ladeschirm fällt zuerst), B sieht A an dessen
// Ort (±0,3 m waagrecht); die Latenz (A bewegt sich → B sieht es) wird berichtet.
// Konsum-Leser: `_p2pUpdatePeer` (zeichnet den Peer je Takt) und der close-Zweig von `initP2PSync` (plant den Rejoin).
//
// Selbsttest (`--selftest`): die alte Tür wieder eingesetzt (initP2PSync lässt `enabled`, wie es war) → (b) ROT. Die
// Selbsttests von (c), (d) und (e) laufen im Hauptlauf.
// Ports: MP_SYNC_PORT (save-server), MP_SYNC_SIGNAL_PORT (signaling), sonst freie des Systems. `--roh <datei>`
// schreibt die Zahlen als JSON.
//
//   node scripts/diag-mp-sync.cjs [--selftest] [--roh <datei>]
"use strict";
const { starteBrowser, halteBis, startProc, eigenePorte, sleep, waitFor } = require("./lib/welt-boot.cjs");
const fs = require("fs");

// die eigenen Ports: MP_SYNC_PORT und MP_SYNC_SIGNAL_PORT, sonst freie des Systems (welt-boot `eigenePorte`) — nie 4312/4313, die Server des Schöpfers
let PORT, SIGNAL_PORT, PAGE_URL, SIGNALING_URL;
const ROOM = "mp-sync-raum";
const SELBSTTEST = process.argv.includes("--selftest");
const ROH = (() => {
    const i = process.argv.indexOf("--roh");
    return i > 0 ? process.argv[i + 1] : null;
})();
const REJOIN_DECKEL_S = 31;
const ABSTAND_M = 0.3;
const LATENZ_MS = 150;
// Der Lauf von A: W hält, bis A LAUF_M vom Start steht (das Urteil verlangt > 1 m), höchstens LAUF_FRIST_MS — nie eine feste Uhr.
const LAUF_M = 1.5;
const LAUF_FRIST_MS = 30000;
// (d) der lange Takt bei B, in Schritten: B tickt erst, wenn ZUFLUSS_FAKTOR × aufholJeSchritt Schritte von A angekommen
// sind — das Szenario steht in Schritten je Takt, nie in Millisekunden des Läufers.
const ZUFLUSS_FAKTOR = 2;
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
// Der Abdruck der Welt aus den Schreib-Akten (Seite): die Edits, die Bauten der Akte (`bauten`, je eine Kennung) und der Boden an
// jedem Edit — verglichen als JSON-Text, byte-gleich oder nicht
function abdruck(bauten) {
    const r = window.anazhRealm;
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
    return { edits, bauten: B.sort(), boden };
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

// Im Seiten-Kontext: Render ruht (zwei Seiten auf swiftshader verhungern sonst den Event-Loop),
// der Loop läuft voll über die Pumpe; die Probe hängt am Spiel-Takt `p2pTick` und am Empfang `_p2pMsgPos`.
function installiere(alteTuer) {
    const r = window.anazhRealm;
    if (r.state.renderer) {
        r.state.renderer.render = function () {};
        if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
    }
    r.state.postProcessingFailed = true;
    r.state.p2p.lockstepDebug = true; // die Spuren des Leibs (A je seq, der Ghost bei B) für (e)
    const mp = (window.__mp = {
        takte: 0,
        peerTakte: 0,
        ursprung: 0,
        ursprungOhneOrt: 0,
        ursprungNachlauf: 0,
        // je Mitspieler: stand er beim ZEICHNEN im Ursprung (die Wahrheit des Zeichen-Moments, `_p2pUpdatePeer`)
        wahrBeimZeichnen: new Map(),
        ortZuletzt: new Map(),
        ursprungBeispiel: null,
        ortGesehen: new Set(),
        inits: 0,
        verbundenAm: null,
        eigenStart: null,
        eigenBewegtAm: null,
        blick: null,
        blickBewegtAm: null,
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
        if (msg && typeof msg.peerId === "string") mp.ortGesehen.add(msg.peerId);
        // der zuletzt empfangene Ort: steht der Mitspieler WIRKLICH im Ursprung (die Welt setzt jeden Erst-Spawn auf 0/0, und
        // das Gelände des Kerns trägt dort ebenen Grund — er bleibt stehen), ist der Ursprung sein Ort, kein Täter
        if (msg && typeof msg.peerId === "string") mp.ortZuletzt.set(msg.peerId, { x: msg.x, z: msg.z });
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
                (ls && ls.seeded && ls.x === 0 && ls.z === 0) ||
                (entry.snapBuf && entry.snapBuf.some((q) => q.x === 0 && q.z === 0)) ||
                (oz && oz.x === 0 && oz.z === 0)
            )
        );
        return res;
    };
    const tick = r.p2pTick;
    r.p2pTick = function (t) {
        const res = tick.call(this, t);
        const p2p = this.state.p2p;
        mp.takte++;
        if (p2p.connected && mp.verbundenAm === null) mp.verbundenAm = Date.now();
        if (!p2p.connected) mp.verbundenAm = null;
        for (const [pid, e] of p2p.peers) {
            mp.peerTakte++;
            const ls = e.lockstep;
            const ortBekannt = mp.ortGesehen.has(pid) || !!(ls && ls.seeded && ls.doneSeq >= 0);
            for (const o of [e.mesh, e.nameLabel]) {
                if (!o || !o.parent || !o.visible) continue;
                const oz = mp.ortZuletzt.get(pid);
                const wirklich = mp.wahrBeimZeichnen.get(pid) === true;
                const imUrsprung = o.position.x === 0 && o.position.z === 0;
                // der Nachlauf: die alte Regel (Ghost NACH dem Takt, neuester Ort) hätte diesen Takt ROT gezählt
                const alteRegel = (oz && oz.x === 0 && oz.z === 0) || (ls && ls.seeded && ls.x === 0 && ls.z === 0);
                if (imUrsprung && wirklich && !alteRegel) mp.ursprungNachlauf++;
                if (imUrsprung && !wirklich) {
                    mp.ursprung++;
                    if (!ortBekannt) mp.ursprungOhneOrt++;
                    if (!mp.ursprungBeispiel)
                        mp.ursprungBeispiel = { pid, art: o === e.mesh ? e.meshKind : "schild", y: o.position.y };
                }
            }
            if (mp.blick && mp.blick.pid === pid && mp.blickBewegtAm === null && e.mesh) {
                const p = e.mesh.position;
                if (Math.hypot(p.x - mp.blick.x, p.z - mp.blick.z) > 0.05) mp.blickBewegtAm = Date.now();
            }
        }
        const pm = this.state.playerMesh;
        if (mp.eigenStart && mp.eigenBewegtAm === null && pm) {
            if (Math.hypot(pm.position.x - mp.eigenStart.x, pm.position.z - mp.eigenStart.z) > 0.05)
                mp.eigenBewegtAm = Date.now();
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
    window.__mpPumpe = setInterval(() => {
        try {
            r._gameLoopTick(performance.now());
        } catch {
            /* der Loop trägt seine eigene Fehlerwand */
        }
    }, 16);
    return true;
}

function bericht(p) {
    return p.evaluate(() => {
        const mp = window.__mp;
        const p2p = window.anazhRealm.state.p2p;
        const t = document.getElementById("p2p-toggle");
        return {
            takte: mp.takte,
            peerTakte: mp.peerTakte,
            ursprung: mp.ursprung,
            ursprungOhneOrt: mp.ursprungOhneOrt,
            ursprungNachlauf: mp.ursprungNachlauf,
            ursprungBeispiel: mp.ursprungBeispiel,
            inits: mp.inits,
            enabled: p2p.enabled === true,
            connected: p2p.connected === true,
            timer: !!p2p.reconnectTimer,
            knopf: t ? t.getAttribute("aria-pressed") : null,
            peerId: p2p.peerId,
            peers: Array.from(p2p.peers.keys()),
            meshActive: p2p.meshActive === true,
        };
    });
}

(async () => {
    const fehler = [];
    [PORT, SIGNAL_PORT] = await eigenePorte("MP_SYNC_PORT", "MP_SYNC_SIGNAL_PORT");
    PAGE_URL = `http://127.0.0.1:${PORT}/index.html`;
    SIGNALING_URL = `ws://127.0.0.1:${SIGNAL_PORT}`;
    const roh = { selbsttest: SELBSTTEST, port: PORT, signalPort: SIGNAL_PORT };
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
    const saveServer = await startProc("save-server.js", /läuft/, {
        PORT: String(PORT),
        ANAZH_SIGNALING_PORT: String(SIGNAL_PORT),
    });
    let signaling = null;
    const browser = await starteBrowser({
        art: "webgl",
        frist: 180000,
        zusatz: [
            "--ignore-gpu-blocklist",
            "--autoplay-policy=no-user-gesture-required",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
        ],
    });
    try {
        // ── Seite A: frisch, der signaling-server ist AUS ──
        const pageA = await browser.newPage();
        await pageA.setViewport({ width: 640, height: 400 });
        await pageA.evaluateOnNewDocument(netzLog);
        await pageA.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
        await waitFor(
            pageA,
            () =>
                !!window.anazhRealm &&
                typeof window.anazhRealm._gameLoopTick === "function" &&
                !!window.anazhRealm.state.playerMesh,
            "Seite A bereit"
        );
        await pageA.evaluate(installiere, SELBSTTEST);
        // Adresse + Raum über die UI-Felder (ihr change-Hörer schreibt + merkt sie; verbunden wird hier noch nichts).
        await pageA.evaluate(
            (url, raum) => {
                const u = document.getElementById("p2p-url");
                const r = document.getElementById("p2p-room");
                u.value = url;
                u.dispatchEvent(new Event("change"));
                r.value = raum;
                r.dispatchEvent(new Event("change"));
            },
            SIGNALING_URL,
            ROOM
        );

        // ── (b) TÜR: der nackte Aufruf, Server beim Aufbau aus ──
        console.log("(b) Tür-Probe: nackter Aufruf, signaling-server 3 s aus ...");
        const vorTuer = await pageA.evaluate(() => window.anazhRealm.state.p2p.enabled === true);
        await pageA.evaluate(() => window.anazhRealm.initP2PSync(null));
        await sleep(3000);
        signaling = await startProc("signaling-server.js", /lauscht/, {
            PORT: String(PORT),
            ANAZH_SIGNALING_PORT: String(SIGNAL_PORT),
        });
        const tAn = Date.now();
        let rejoinS = null;
        let ohnePlan = 0;
        while (Date.now() - tAn < REJOIN_DECKEL_S * 1000) {
            const s = await bericht(pageA);
            if (s.connected) {
                rejoinS = (Date.now() - tAn) / 1000;
                break;
            }
            // Kein Socket im Aufbau, kein Rejoin geplant: nichts kann mehr heilen.
            const offen = await pageA.evaluate(() => {
                const ws = window.anazhRealm.state.p2p.ws;
                return !!ws && ws.readyState <= 1;
            });
            ohnePlan = !s.timer && !offen ? ohnePlan + 1 : 0;
            if (ohnePlan >= 12) break;
            await sleep(250);
        }
        const nachTuer = await bericht(pageA);
        roh.tuer = { enabledVor: vorTuer, enabledNach: nachTuer.enabled, rejoinS };
        check(
            `(b) Tür: der nackte Aufruf heilt nach ${3} s Server-Ausfall (Rejoin ≤ ${REJOIN_DECKEL_S} s)`,
            rejoinS !== null,
            rejoinS !== null
                ? `Rejoin ${rejoinS.toFixed(1)} s nach Server-Start, Absicht ${vorTuer}→${nachTuer.enabled}`
                : `kein Rejoin geplant (enabled=${nachTuer.enabled}) — Täter: _p2pScheduleReconnect / der close-Zweig lesen p2p.enabled, das initP2PSync nie setzt`
        );
        if (SELBSTTEST) {
            await browser.close();
            saveServer.kill();
            if (signaling) signaling.kill();
            const rot = rejoinS === null;
            console.log(
                rot
                    ? "SELBSTTEST OK: die alte Tür (initP2PSync ohne Absicht) macht (b) ROT"
                    : "SELBSTTEST ROT: die alte Tür blieb grün — die Probe sieht die Tür nicht"
            );
            if (ROH) fs.writeFileSync(ROH, JSON.stringify(roh, null, 2));
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
        await waitFor(pageA, () => window.anazhRealm.state.p2p.connected === true, "A verbunden über den Knopf");
        const kVerb = await bericht(pageA);
        check("Knopf an: A verbunden, Knopf „an“", kVerb.connected && kVerb.knopf === "true", `Inits ${kVerb.inits}`);

        // ── Seite B: der BOOT (die gemerkte Absicht aus p2pPersist) ──
        console.log("Seite B bootet mit der gemerkten Absicht ...");
        const pageB = await browser.newPage();
        await pageB.setViewport({ width: 640, height: 400 });
        await pageB.evaluateOnNewDocument(netzLog);
        await pageB.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
        await waitFor(
            pageB,
            () =>
                !!window.anazhRealm &&
                typeof window.anazhRealm._gameLoopTick === "function" &&
                !!window.anazhRealm.state.playerMesh,
            "Seite B bereit"
        );
        await pageB.evaluate(installiere, false);
        await waitFor(pageB, () => window.anazhRealm.state.p2p.connected === true, "B verbunden über den Boot");
        const idA = kVerb.peerId;
        const idB = (await bericht(pageB)).peerId;
        await waitFor(pageA, (id) => window.anazhRealm.state.p2p.peers.has(id), "A kennt B", idB);
        await waitFor(pageB, (id) => window.anazhRealm.state.p2p.peers.has(id), "B kennt A", idA);
        check("B verbunden über den Boot, beide kennen einander", true, `A=${idA} B=${idB}`);
        // am echten Broker: A's Vibe-Pass reist mit dem peerId-Stempel des Servers, B verifiziert die Signatur über ihn
        const vibeMs = await waitFor(pageB, (id) => !!(window.anazhRealm.state.p2p.peers.get(id) || {}).vibeVerified, "B verifiziert A's Vibe-Pass", idA).catch(() => -1);
        check("W13 P3: der Broker relayt den Vibe-Pass mit peerId-Stempel, B verifiziert A", vibeMs >= 0, `${vibeMs} ms`);

        // A steht: der Ladeschirm ist gefallen (erst dann gehören die Tasten dem Spieler), die Höhe ruhig.
        const ladeMs = await waitFor(pageA, () => !window.anazhRealm._ladeschirmSteht(), "A: Ladeschirm weg");
        await waitFor(
            pageA,
            () => {
                const y = window.anazhRealm.state.playerMesh.position.y;
                const prev = window.__mpY;
                window.__mpY = y;
                return prev !== undefined && Math.abs(y - prev) < 0.02;
            },
            "A gesettelt"
        );
        await sleep(800);

        // ── A läuft über die Tastatur, B sieht zu ── (ein Lauf: A geht LAUF_M, steht wieder, B zeigt ihn an dessen Ort)
        const laufUndSicht = async () => {
            const vorLauf = await pageA.evaluate(() => {
                const p = window.anazhRealm.state.playerMesh.position;
                return { x: p.x, y: p.y, z: p.z };
            });
            await pageB.evaluate((id) => {
                const e = window.anazhRealm.state.p2p.peers.get(id);
                window.__mp.blick = { pid: id, x: e.mesh.position.x, z: e.mesh.position.z };
                window.__mp.blickBewegtAm = null;
            }, idA);
            await pageA.bringToFront();
            await pageA.evaluate(() => {
                if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
                const p = window.anazhRealm.state.playerMesh.position;
                window.__mp.eigenStart = { x: p.x, z: p.z };
                window.__mp.eigenBewegtAm = null;
                window.__mpP = undefined;
            });
            // W bis zu seinem EREIGNIS (A steht LAUF_M vom Start), nie nach der Uhr: unter Last lief A in 1,6 s 0,77 m
            const halt = await halteBis(pageA, {
                taste: "w",
                ziel: (soll) => {
                    const p = window.anazhRealm.state.playerMesh.position;
                    const s = window.__mp.eigenStart;
                    return Math.hypot(p.x - s.x, p.z - s.z) >= soll;
                },
                args: [LAUF_M],
                frist: LAUF_FRIST_MS,
            });
            await waitFor(
                pageA,
                () => {
                    const p = window.anazhRealm.state.playerMesh.position;
                    const prev = window.__mpP;
                    window.__mpP = { x: p.x, z: p.z };
                    return prev !== undefined && Math.hypot(p.x - prev.x, p.z - prev.z) < 0.005;
                },
                "A steht wieder"
            );
            await sleep(1200);
            // B urteilt nach seinem EREIGNIS: zwei eigene Takte, seit A steht — nie nach der Uhr des Läufers (ein Hintergrund-
            // Takt unter Last kam lokal 1,9 s nach dem Stand noch nicht: Abstand 1,905 m bei Rückstau 111, K60-N3/mp-3.txt)
            const takteB = await pageB.evaluate(() => window.__mp.lsTakte);
            await waitFor(
                pageB,
                (n) => window.__mp.lsTakte >= n + 2,
                "B: zwei Ghost-Takte nach dem Stand von A",
                takteB
            );
            const wahrA = await pageA.evaluate(() => {
                const p = window.anazhRealm.state.playerMesh.position;
                return { x: p.x, y: p.y, z: p.z, bewegtAm: window.__mp.eigenBewegtAm };
            });
            const sichtB = await pageB.evaluate((id) => {
                const e = window.anazhRealm.state.p2p.peers.get(id);
                const p = e.mesh.position;
                const ls = e.lockstep;
                return {
                    x: p.x,
                    y: p.y,
                    z: p.z,
                    art: e.meshKind,
                    sichtbar: e.mesh.visible,
                    gesehenAm: window.__mp.blickBewegtAm,
                    rueckstau: ls ? ls.buf.length : null,
                };
            }, idA);
            const lauf = Math.hypot(wahrA.x - vorLauf.x, wahrA.z - vorLauf.z);
            const abstand = Math.hypot(sichtB.x - wahrA.x, sichtB.z - wahrA.z);
            const latenz = wahrA.bewegtAm && sichtB.gesehenAm ? sichtB.gesehenAm - wahrA.bewegtAm : null;
            return { lauf, abstand, latenz, wahrA, sichtB, haltMs: halt.ms, haltErreicht: halt.erreicht };
        };
        const sichtSatz = (l) =>
            `Abstand ${l.abstand.toFixed(3)} m, Leib ${l.sichtB.art}, sichtbar=${l.sichtB.sichtbar}, ` +
            `Rückstau ${l.sichtB.rueckstau} Schritte, Latenz ${l.latenz === null ? "n/a" : l.latenz + " ms"}`;
        const l0 = await laufUndSicht();
        roh.lauf = Object.assign({ ladeschirmMs: ladeMs }, l0);
        check("A lief über die Tastatur (> 1 m)", l0.lauf > 1, `${l0.lauf.toFixed(2)} m nach ${l0.haltMs} ms W`);
        // (e) der Leib aus seinen Eingaben: B's Ghost rechnet jeden Schritt von A bit-gleich nach (je seq, die Spuren des Laufs)
        const spurA = new Map(
            (await pageA.evaluate(() => window.anazhRealm.state.p2p._lockstepTrace || [])).map((q) => [q.q, q])
        );
        const spurB = await pageB.evaluate(
            (id) => ((window.anazhRealm.state.p2p.peers.get(id) || {}).lockstep || {}).trace || [],
            idA
        );
        const geteilt = spurB.filter((g) => spurA.has(g.q));
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
            `B sieht A an dessen Ort (±${ABSTAND_M} m waagrecht)`,
            l0.sichtB.sichtbar && l0.abstand <= ABSTAND_M,
            sichtSatz(l0)
        );
        console.log(
            `  INFO Latenz A bewegt → B sieht: ${l0.latenz === null ? "n/a" : l0.latenz + " ms"} (Soll lokal ≤ ${LATENZ_MS} ms, in der CI berichtet)`
        );
        if (!process.env.CI && l0.latenz !== null)
            check(`Latenz ≤ ${LATENZ_MS} ms (lokal)`, l0.latenz <= LATENZ_MS, `${l0.latenz} ms`);

        // ── (d) LANGE TAKTE: B trägt lange Takte (der Lade-Takt eines Mitspielers unter seinem Ladeschirm, ein
        // langsames Gerät) — der Ghost hält mit dem Sender Schritt, sein Verbrauch liest die Wanduhr, nie den Frame
        // (`_lockstepTickPeers`). Der Selbsttest gleich danach setzt die alte Kappe wieder ein (jeder Takt gilt als ein
        // Frame von 1/60 s): (d) muss ROT werden. DAS URTEIL LIEST JE TAKT DAS GESETZ (`taktBruch`), nie nur den Ort am
        // Ende und nie einen festen Verzug: der Ort allein war blind, der feste Verzug las einen Schub vor dem Fenster
        // als Täter.
        const lsGesetz = await pageB.evaluate(() => {
            const K = window.anazhRealm.constructor;
            return { reserve: K.LOCKSTEP.jitterReserve, aufhol: K.LOCKSTEP.aufholJeSchritt, fixMs: K.FIXED_DT * 1000 };
        });
        // DER LANGE TAKT IN SCHRITTEN: der Ghost bei B verbraucht erst, wenn seit seinem letzten Takt ZUFLUSS_SOLL
        // Schritte von A angekommen sind — ein Takt trägt so immer das Doppelte der alten Kappe, gleich wie schnell A
        // sendet und wie belastet der Läufer ist
        const ZUFLUSS_SOLL = ZUFLUSS_FAKTOR * lsGesetz.aufhol;
        const langeTakte = (an, alteKappe) =>
            pageB.evaluate(
                (an, soll, alteKappe, pid) => {
                    const r = window.anazhRealm;
                    const mp = window.__mp;
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
        console.log(
            `  INFO (d) der Ghost bei B verbraucht erst je ${ZUFLUSS_SOLL} angekommene Schritte von A (${ZUFLUSS_FAKTOR} × aufholJeSchritt ${lsGesetz.aufhol}); ` +
                `je Takt das Gesetz: Kappe ceil(${lsGesetz.aufhol} × dt / ${lsGesetz.fixMs.toFixed(2)} ms) oder Reserve ${lsGesetz.reserve}`
        );
        // das Fenster endet nach seinem Ereignis (drei lange Takte mit dem Ghost von A), nie nach der Uhr des Läufers
        const fensterZu = async () => {
            await waitFor(
                pageB,
                () => !!window.__mp.langFenster && window.__mp.langFenster.takte.filter((t) => t.anschluss).length >= 3,
                "B: drei lange Takte"
            ).catch(() => {});
            return langeTakte(false);
        };
        await langeTakte(true, false);
        const l1 = await laufUndSicht();
        const f1 = await fensterZu();
        const m1 = dMaengel(l1, f1);
        roh.langeTakte = Object.assign({ zuflussSoll: ZUFLUSS_SOLL, gesetz: lsGesetz, fenster: f1 }, l1);
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
        roh.langeTakteAlteKappe = Object.assign({ fenster: f2 }, l2);
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
        const bautenVon = (p) =>
            p.evaluate(() => (window.anazhRealm.state.architectures || []).map((e) => String(e.id)));
        // die drei Akte, bis B den Abdruck von A trägt (höchstens 8 s), dann der Nachlauf (eine zweite Anwendung landet danach)
        const akte = async () => {
            const [vorA, nA] = [await bautenVon(pageA), (await pageA.evaluate(abdruck, [])).edits.length];
            for (const satz of ["voxel carve", "voxel fill", "bau mir ein haus"]) await sage(satz);
            const a = (await bautenVon(pageA)).filter((id) => !vorA.includes(id));
            const zug = async () =>
                [await pageA.evaluate(abdruck, a), await pageB.evaluate(abdruck, a)].map((x) => JSON.stringify(x));
            for (const t = Date.now(); Date.now() - t < 8000 && new Set(await zug()).size > 1;) await sleep(200);
            await sleep(GRABEN_NACHLAUF_MS);
            const [A, B] = [await pageA.evaluate(abdruck, a), await pageB.evaluate(abdruck, a)];
            return {
                a,
                edits: A.edits.length - nA,
                A,
                B,
                gleich: (k) => JSON.stringify(A[k]) === JSON.stringify(B[k]),
            };
        };
        const g = await akte();
        roh.gleich = { A: g.A, B: g.B };
        const teile = ["edits", "bauten", "boden"];
        check(
            "A gräbt, schüttet und baut per Chat (zwei Edits und ein Bau bei A)",
            g.edits === 2 && g.a.length === 1,
            `${g.edits} Edits, Bauten ${g.a.join(",") || "—"}`
        );
        check(
            "(e) Peers: der Abdruck der Schreib-Akte (Edits, Bauten mit Kennung, Boden) byte-gleich auf A und B",
            g.a.length > 0 && teile.every(g.gleich),
            teile.map((k) => `${k} ${g.gleich(k) ? "gleich" : "VERSCHIEDEN"}`).join(" · ") +
                (g.B.edits.length < g.A.edits.length
                    ? " — Täter _chatTryVoxelDebugCommand: schnitzt direkt statt über dslRun"
                    : "") +
                (g.B.edits.length > g.A.edits.length
                    ? " — Täter: B wendet eine Akt-Nachricht mehrfach an (_p2pMsgDsl)"
                    : "") +
                (g.gleich("bauten")
                    ? ""
                    : ` — Bau bei A ${JSON.stringify(g.A.bauten)}, bei B ${JSON.stringify(g.B.bauten)}: die Kennung ist keine Funktion des Akts`)
        );

        // ── (a) URSPRUNG ── (vor dem Reload von B: seine Zähler leben in der Seite)
        const endA = await bericht(pageA);
        const endB = await bericht(pageB);
        roh.ursprung = { A: endA, B: endB };
        for (const [n, s] of [
            ["A", endA],
            ["B", endB],
        ]) {
            check(
                `(a) Seite ${n}: kein Mitspieler-Takt im Ursprung`,
                s.ursprung === 0,
                `${s.ursprung} Takte am Ursprung (davon ${s.ursprungOhneOrt} ohne je empfangenen Ort) von ${s.peerTakte} Peer-Takten` +
                    ` · Nachlauf ${s.ursprungNachlauf} Takte (beim Zeichnen stand er im Ursprung, der Ghost danach schon weiter; keine Täter)` +
                    (s.ursprung
                        ? ` — Täter _p2pEnsurePeerEntry: Leib/Schild sichtbar bei 0/0/0 (${JSON.stringify(s.ursprungBeispiel)})`
                        : "")
            );
        }

        // (e) der Reload von B: sein Speicher (saveState, derselbe Schreiber wie die Sicherung), dann die Seite neu — sie lädt, bis
        // ihre Welt steht und den Bau trägt (eine Seite, die beim Laden die Welt betritt, lädt sich selbst neu: jede Frage verträgt es)
        const netzB = await pageB.evaluate(() => Object.assign({}, window.__netz));
        await pageB.evaluate(() => window.anazhRealm.saveState());
        await pageB.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        let nachReload = null;
        for (const t = Date.now(); Date.now() - t < 180000 && !nachReload; await sleep(500))
            nachReload = await pageB
                .evaluate((ids) => {
                    const r = window.anazhRealm;
                    const steht = r && r.state.playerMesh && !r._ladeSperre && r.state.p2p.connected;
                    return steht && ids.every((id) => (r.state.architectures || []).some((e) => String(e.id) === id))
                        ? true
                        : null;
                }, g.a)
                .catch(() => null);
        const R = nachReload ? await pageB.evaluate(abdruck, g.a) : null;
        roh.gleich.reload = R;
        check(
            "(e) Reload: B trägt nach dem Neuladen denselben Abdruck",
            !!R && JSON.stringify(R) === JSON.stringify(g.A),
            R
                ? teile
                      .map((k) => `${k} ${JSON.stringify(R[k]) === JSON.stringify(g.A[k]) ? "gleich" : "VERSCHIEDEN"}`)
                      .join(" · ")
                : "B stand nach dem Reload nicht mit dem Bau"
        );
        // der Selbsttest: B wendet jede Akt-Nachricht doppelt an und nimmt den Samen des Baus um eins verschoben — die Edits UND die
        // Bauten des Abdrucks fallen ROT (die Probe sieht beide)
        await pageB.evaluate(() => {
            const r = window.anazhRealm;
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
        const s = await akte();
        check(
            "(e) Selbsttest: B wendet jede Akt-Nachricht doppelt an und verschiebt den Samen des Baus → Edits und Bauten ROT",
            s.a.length > 0 && !s.gleich("edits") && !s.gleich("bauten"),
            `edits ${s.gleich("edits") ? "GRÜN, die Linse ist blind" : "ROT"} · bauten ${s.gleich("bauten") ? "GRÜN, die Linse ist blind" : "ROT"}`
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
        roh.gleich.netz = n0;
        check(
            "(e) Netz-Log: keine Zustands-Nachricht, nur Schreib-Akte, Leib, Sicht und Leitung",
            fremd(n0).length === 0 && n0.A.dsl > 0,
            Object.entries(n0)
                .map(
                    ([w, l]) =>
                        w +
                        " " +
                        Object.entries(l)
                            .map(([t, k]) => t + " " + k)
                            .join(" · ")
                )
                .join(" | ") + (fremd(n0).length ? " — Zustand: " + fremd(n0).join(", ") : "")
        );
        await pageA.evaluate(() => window.anazhRealm.p2pSend({ type: "wetter", weather: "stormy" }));
        const n1 = fremd(await netz());
        check(
            "(e) Selbsttest: eine Wetter-Nachricht von A macht das Netz-Log ROT",
            n1.some((x) => x.startsWith("A wetter")),
            n1.join(", ") || "GRÜN, die Linse ist blind"
        );
        roh.dauerS = (Date.now() - t0) / 1000;
    } catch (err) {
        check("Lauf", false, err && err.message ? err.message : String(err));
    } finally {
        await browser.close().catch(() => {});
        saveServer.kill();
        if (signaling) signaling.kill();
    }
    if (ROH) fs.writeFileSync(ROH, JSON.stringify(roh, null, 2));
    console.log(`gate:mp-sync ${fehler.length ? "ROT" : "GRÜN"} — ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    process.exit(fehler.length ? 1 : 0);
})();

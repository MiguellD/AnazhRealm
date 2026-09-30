#!/usr/bin/env node
// diag-reconnect.cjs — DIE RECONNECT-LINSE (npm run gate:reconnect)
//
// RECONNECT (Orakel Tier-1 #10): heute beendete jeder Netz-Blip die
// Ko-Präsenz still. Drei Fäden, eine Linse — pure Fixtures ohne echten
// Server, jede läuft durch die ECHTEN Stamm-Methoden (neue Function auf der
// extrahierten Quelle, injizierte Fake-Umgebung: WebSocket · RTCPeer-
// Connection · setTimeout · performance — die Logik selbst ist die echte):
//
//   A  WS-REJOIN: ein simulierter close plant Rejoin-Versuche mit wachsendem
//      Delay (1·2·4·…≤30 s Basis + deterministischer FNV-1a-Jitter über
//      Versuchszähler+peerId — kein Math.random, Lehre 7); ein BEWUSSTES
//      close (shutdownP2PSync) plant NIE; der open-Handler heilt den Zähler;
//      Stale-Events ersetzter Sockets prallen ab.
//   B  RTC-HEILUNG: der failed-ÜBERGANG ruft restartIce() GENAU 1× (Spy)
//      + Re-Offer mit iceRestart nur beim deterministischen Initiator
//      (Perfect-Negotiation, kein Glare); Wiederholungen atmen über den
//      Backoff; "connected" heilt den Zähler; der Peer-Abbau fällt den Timer.
//   C  SNAPSHOT-PUFFER (Valve-Source-Muster): zwei Snaps (t=0,x=0 ·
//      t=100,x=3) ⇒ Interpolation bei renderT=50 ≈ 1,5; klemmt statt zu
//      extrapolieren; yaw über den kürzesten Bogen; bounded; NUR der
//      Nicht-Lockstep-Pfad (der Ghost bleibt byte-heilig).
//
// Jede Fixture trägt ihren SELBST-TEST: der Fix wird per Quell-Patch
// künstlich deaktiviert — die Fixture MUSS dann rot sehen. Exit explizit.
//
//   node scripts/diag-reconnect.cjs
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const stammSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

// ── Methoden-Extraktion: 4-Space-Klassen-Indent, schließende Zeile `    }` ──
function extractMethod(name) {
    const re = new RegExp(`^    (?:async )?${name}\\(`, "m");
    const m = re.exec(stammSrc);
    if (!m) return null;
    const end = stammSrc.indexOf("\n    }\n", m.index);
    if (end < 0) return null;
    return stammSrc.slice(m.index, end + "\n    }".length);
}

// Echte Konstanten aus dem Stamm lesen (die Linse prüft PRODUKTIONS-Werte).
function numConst(name) {
    const m = new RegExp(`AnazhRealm\\.${name} = (\\d+);`).exec(stammSrc);
    return m ? Number(m[1]) : NaN;
}
const AR = {
    P2P_DEFAULT_WS_URL: "ws://fixture-default:0",
    P2P_RECONNECT_BASE_MS: numConst("P2P_RECONNECT_BASE_MS"),
    P2P_RECONNECT_MAX_MS: numConst("P2P_RECONNECT_MAX_MS"),
    P2P_RECONNECT_JITTER_MS: numConst("P2P_RECONNECT_JITTER_MS"),
    P2P_SNAP_INTERP_DELAY_MS: numConst("P2P_SNAP_INTERP_DELAY_MS"),
    P2P_SNAP_BUF_MAX: numConst("P2P_SNAP_BUF_MAX"),
};

// Die extrahierte Quelle als Funktion — Umwelt (WebSocket/RTC/Timer/perf)
// wird als Parameter INJIZIERT (deterministische Fixtures, keine Globals).
function mk(name, env, srcOverride) {
    const body = srcOverride || extractMethod(name);
    if (!body) throw new Error(`Methode ${name} nicht im Stamm gefunden`);
    return new Function(
        "AnazhRealm",
        "performance",
        "setTimeout",
        "clearTimeout",
        "WebSocket",
        "RTCPeerConnection",
        `return ({ ${body} }).${name};`
    )(env.AnazhRealm, env.performance, env.setTimeout, env.clearTimeout, env.WebSocket, env.RTCPeerConnection);
}

// ── Fake-Umgebung ──
function makeTimers() {
    let nextId = 1;
    const pending = [];
    return {
        pending,
        setT(fn, delay) {
            const id = nextId++;
            pending.push({ id, fn, delay: Number(delay) || 0 });
            return id;
        },
        clearT(id) {
            const i = pending.findIndex((t) => t.id === id);
            if (i >= 0) pending.splice(i, 1);
        },
        fireNext() {
            const t = pending.shift();
            if (t) t.fn();
            return t;
        },
    };
}

class FakeWS {
    constructor(url) {
        this.url = url;
        this.readyState = 0;
        this.sent = [];
        this._ls = {};
        this.closedByClient = false;
        FakeWS.instances.push(this);
    }
    addEventListener(type, fn) {
        (this._ls[type] = this._ls[type] || []).push(fn);
    }
    send(x) {
        this.sent.push(x);
    }
    close() {
        this.closedByClient = true;
    }
    fire(type, ev) {
        if (type === "open") this.readyState = 1;
        if (type === "close") this.readyState = 3;
        for (const fn of this._ls[type] || []) fn(ev || {});
    }
}
FakeWS.instances = [];

class FakePC {
    constructor(cfg) {
        this.cfg = cfg;
        this.connectionState = "new";
        this.restartIceCalls = 0;
        this.offerOpts = [];
        this.localDescription = null;
        this.onicecandidate = null;
        this.ondatachannel = null;
        this.onconnectionstatechange = null;
    }
    restartIce() {
        this.restartIceCalls++;
    }
    createOffer(opts) {
        this.offerOpts.push(opts || {});
        return Promise.resolve({ type: "offer", sdp: "heil" });
    }
    setLocalDescription(d) {
        this.localDescription = d;
        return Promise.resolve();
    }
    close() {}
}

const tick = () => new Promise((r) => setImmediate(r));

// ── Realm-Fixture A: WS-Rejoin ──
function makeRealmA(env, initSrcOverride) {
    const R = {
        state: {
            p2p: {
                enabled: true,
                url: "ws://fixture:4313",
                peerId: null,
                room: null,
                roomOverride: "",
                ws: null,
                peers: new Map(),
                broadcastIntervalMs: 33,
                lastBroadcastAt: 0,
                lastError: null,
                connected: false,
                intentionalClose: false,
                reconnectAttempt: 0,
                reconnectTimer: null,
                lanAddresses: [],
                rtcPeers: new Map(),
                meshActive: false,
                worldXfers: new Map(),
                pendingPullFrom: null,
                _lastXferProgress: null,
                _pullServedAt: new Map(),
                bundleXfers: new Map(),
                pendingBundlePull: null,
                _bundleServedAt: new Map(),
                voiceShared: false,
                _voiceServedAt: new Map(),
                _voiceRequests: new Map(),
                remoteCreatures: new Map(),
                lobby: { published: false, label: "", rooms: [] },
            },
            worldMeta: { worldId: "welt-fixture-1" },
        },
        _pinnedLoaded: true,
        clearedMeshes: 0,
        logs: [],
        log(m, lvl) {
            this.logs.push({ lvl: lvl || "INFO", m });
        },
        p2pUpdateStatus() {},
        p2pHandleMessage() {},
        p2pGenerateId() {
            return "p-fix-aaaa";
        },
        _p2pClearAllPeerMeshes() {
            this.clearedMeshes++;
        },
        _p2pCloseRtcPeer(pid) {
            this.state.p2p.rtcPeers.delete(pid);
        },
        _disposeRemoteCreature() {},
        _loadPinnedManifest() {},
        _regionRoomId(w, r) {
            return `${w}:${r}`;
        },
    };
    R.initP2PSync = mk("initP2PSync", env, initSrcOverride);
    R.shutdownP2PSync = mk("shutdownP2PSync", env);
    R._p2pScheduleReconnect = mk("_p2pScheduleReconnect", env);
    R._p2pReconnectDelayMs = mk("_p2pReconnectDelayMs", env);
    R._p2pReconnectJitterMs = mk("_p2pReconnectJitterMs", env);
    R._p2pSignal = mk("_p2pSignal", env);
    return R;
}

(async () => {
    console.log("=== RECONNECT-LINSE — WS-Rejoin · RTC-Heilung · Snapshot-Puffer ===");
    console.log(
        `  Konstanten (Produktion): Basis ${AR.P2P_RECONNECT_BASE_MS} ms · Deckel ${AR.P2P_RECONNECT_MAX_MS} ms · Jitter < ${AR.P2P_RECONNECT_JITTER_MS} ms · Interp-Delay ${AR.P2P_SNAP_INTERP_DELAY_MS} ms · Puffer ≤ ${AR.P2P_SNAP_BUF_MAX}`
    );
    check(
        "Konstanten im Band (Backoff 1 s/30 s · Interp-Delay 100–150 ms)",
        AR.P2P_RECONNECT_BASE_MS === 1000 &&
            AR.P2P_RECONNECT_MAX_MS === 30000 &&
            AR.P2P_RECONNECT_JITTER_MS > 0 &&
            AR.P2P_SNAP_INTERP_DELAY_MS >= 100 &&
            AR.P2P_SNAP_INTERP_DELAY_MS <= 150 &&
            AR.P2P_SNAP_BUF_MAX >= 4
    );

    // ══ FIXTURE A — WS-REJOIN MIT WACHSENDEM DELAY ══
    console.log("\n── A: WS-Rejoin (Exponential-Backoff + seeded Jitter) ──");
    {
        const timers = makeTimers();
        const env = {
            AnazhRealm: AR,
            performance: { now: () => 0 },
            setTimeout: timers.setT,
            clearTimeout: timers.clearT,
            WebSocket: FakeWS,
            RTCPeerConnection: undefined,
        };
        FakeWS.instances = [];
        const R = makeRealmA(env);
        const res = R.initP2PSync("raum-fix");
        const ws1 = FakeWS.instances[FakeWS.instances.length - 1];
        check("Aufbau: initP2PSync ok, EIN Socket", res && res.ok === true && FakeWS.instances.length === 1);
        ws1.fire("open");
        check(
            "open: verbunden + join gesendet + Backoff-Zähler 0",
            R.state.p2p.connected === true &&
                ws1.sent.length === 1 &&
                ws1.sent[0].includes('"join"') &&
                R.state.p2p.reconnectAttempt === 0
        );

        // Der RISS: unbewusstes close ⇒ Meshes fallen + GENAU EIN Rejoin-Timer.
        ws1.fire("close");
        check(
            "Riss: Meshes geräumt, connected=false, GENAU EIN Rejoin-Timer",
            R.clearedMeshes === 1 && R.state.p2p.connected === false && timers.pending.length === 1
        );

        // Die Delay-Leiter abfahren: Basis 1·2·4·8·16·30·30 s, Jitter deterministisch.
        const pid = R.state.p2p.peerId;
        const expectedBases = [1000, 2000, 4000, 8000, 16000, 30000, 30000];
        const seenBases = [];
        let jitterOk = true;
        for (let n = 0; n < expectedBases.length; n++) {
            if (timers.pending.length !== 1) break;
            const d = timers.pending[0].delay;
            const jit = R._p2pReconnectJitterMs(n, pid);
            seenBases.push(d - jit);
            if (!(jit >= 0 && jit < AR.P2P_RECONNECT_JITTER_MS)) jitterOk = false;
            timers.fireNext(); // Rejoin-Versuch: baut neuen Socket
            const wsN = FakeWS.instances[FakeWS.instances.length - 1];
            wsN.fire("close"); // scheitert wieder ⇒ nächste Stufe
        }
        check(
            `Delay-Leiter wächst 1·2·4·…≤30 s (Basis nach Jitter-Abzug): [${seenBases.map((b) => b / 1000).join("·")}]`,
            seenBases.length === expectedBases.length && seenBases.every((b, i) => b === expectedBases[i]),
            `Deckel ${AR.P2P_RECONNECT_MAX_MS / 1000} s`
        );
        check("Jitter im Band [0, " + AR.P2P_RECONNECT_JITTER_MS + ") ms", jitterOk);
        check(
            "Jitter DETERMINISTISCH (gleicher Versuch+peerId ⇒ gleicher Wert) und streuend (≥ 2 Werte über 10 Versuche)",
            R._p2pReconnectJitterMs(3, pid) === R._p2pReconnectJitterMs(3, pid) &&
                new Set(Array.from({ length: 10 }, (_, n) => R._p2pReconnectJitterMs(n, pid))).size >= 2
        );

        // Stale-Wache: das close eines längst ERSETZTEN Sockets plant nichts.
        const timersBefore = timers.pending.length;
        const meshesBefore = R.clearedMeshes;
        ws1.fire("close");
        check(
            "Stale-Wache: close des ersetzten Sockets räumt/plant NICHTS",
            timers.pending.length === timersBefore && R.clearedMeshes === meshesBefore
        );

        // HEILUNG: der nächste open setzt den Backoff-Zähler zurück auf die 1-s-Stufe.
        while (timers.pending.length) timers.fireNext();
        const wsHeal = FakeWS.instances[FakeWS.instances.length - 1];
        wsHeal.fire("open");
        const healedAttempt = R.state.p2p.reconnectAttempt;
        wsHeal.fire("close");
        const healedDelay = timers.pending.length === 1 ? timers.pending[0].delay - R._p2pReconnectJitterMs(0, pid) : NaN;
        check(
            "open heilt den Zähler: nächster Riss startet wieder bei 1 s",
            healedAttempt === 0 && healedDelay === AR.P2P_RECONNECT_BASE_MS
        );

        // BEWUSSTES close: shutdown fällt den geplanten Timer + der Socket-close plant nie wieder.
        R.shutdownP2PSync();
        check(
            "bewusstes close: geplanter Rejoin gefällt, intentionalClose gestempelt",
            timers.pending.length === 0 && R.state.p2p.reconnectTimer === null && R.state.p2p.intentionalClose === true
        );
        wsHeal.fire("close"); // der Browser liefert das close des geschlossenen Sockets nach
        check("bewusstes close: KEIN Rejoin (auch nach nachlaufendem close-Event)", timers.pending.length === 0);

        // Frischer Fall: verbunden ⇒ bewusst schließen ⇒ close-Event ⇒ kein Rejoin.
        FakeWS.instances = [];
        const R2 = makeRealmA(env);
        R2.initP2PSync("raum-fix");
        const ws2 = FakeWS.instances[0];
        ws2.fire("open");
        R2.shutdownP2PSync();
        ws2.fire("close");
        check("bewusstes close (verbunden): KEIN Rejoin", timers.pending.length === 0 && ws2.closedByClient === true);

        // Deaktiviert: ein Riss bei enabled=false plant nie.
        FakeWS.instances = [];
        const R3 = makeRealmA(env);
        R3.initP2PSync("raum-fix");
        const ws3 = FakeWS.instances[0];
        ws3.fire("open");
        R3.state.p2p.enabled = false;
        ws3.fire("close");
        check("enabled=false: KEIN Rejoin", timers.pending.length === 0);

        // SELBST-TEST A: Rejoin-Aufruf im close-Handler künstlich gekappt ⇒
        // die Fixture MUSS den toten Zustand sehen (0 Timer nach Riss).
        const initSrc = extractMethod("initP2PSync");
        const marker = "this._p2pScheduleReconnect();";
        if (!initSrc || !initSrc.includes(marker)) {
            check("SELBST-TEST A: Rejoin-Marker im close-Handler vorhanden", false);
        } else {
            FakeWS.instances = [];
            const Rdead = makeRealmA(env, initSrc.split(marker).join("void 0;"));
            Rdead.initP2PSync("raum-fix");
            const wsD = FakeWS.instances[0];
            wsD.fire("open");
            wsD.fire("close");
            check("SELBST-TEST A: gekappter Rejoin ⇒ 0 Timer (die Fixture sähe den alten Bug)", timers.pending.length === 0);
        }
    }

    // ══ FIXTURE B — RTC-HEILUNG (restartIce + Re-Offer, Flanke + Backoff) ══
    console.log("\n── B: RTC-Heilung (restartIce genau 1× je failed-Übergang) ──");
    {
        const timers = makeTimers();
        const env = {
            AnazhRealm: AR,
            performance: { now: () => 0 },
            setTimeout: timers.setT,
            clearTimeout: timers.clearT,
            WebSocket: FakeWS,
            RTCPeerConnection: FakePC,
        };
        const makeRealmB = (myId, createSrcOverride) => {
            const R = {
                state: { p2p: { peerId: myId, iceServers: [], rtcPeers: new Map(), peers: new Map(), meshActive: false } },
                signals: [],
                logs: [],
                log(m, lvl) {
                    this.logs.push({ lvl: lvl || "INFO", m });
                },
                p2pUpdateStatus() {},
                _p2pWireChannel() {},
                _p2pUpdateMeshActive() {},
                _p2pSignal(obj) {
                    this.signals.push(obj);
                    return true;
                },
            };
            R._p2pCreatePeerConnection = mk("_p2pCreatePeerConnection", env, createSrcOverride);
            R._p2pHealRtcPeer = mk("_p2pHealRtcPeer", env);
            R._p2pReconnectDelayMs = mk("_p2pReconnectDelayMs", env);
            R._p2pReconnectJitterMs = mk("_p2pReconnectJitterMs", env);
            R._p2pCloseRtcPeer = mk("_p2pCloseRtcPeer", env);
            R._p2pUpdateMeshActive = () => {};
            return R;
        };

        // Initiator ("a-ich" < "b-peer"): failed ⇒ restartIce 1× + iceRestart-Offer.
        const R = makeRealmB("a-ich");
        const rtc = R._p2pCreatePeerConnection("b-peer");
        const pc = rtc.pc;
        pc.connectionState = "failed";
        pc.onconnectionstatechange();
        await tick();
        await tick();
        const offers = R.signals.filter((s) => s.type === "rtc-offer" && s.to === "b-peer");
        check("failed-Übergang: restartIce GENAU 1× (Spy)", pc.restartIceCalls === 1, `calls=${pc.restartIceCalls}`);
        check(
            "Initiator re-offeriert mit iceRestart (Perfect-Negotiation)",
            offers.length === 1 && pc.offerOpts.length === 1 && pc.offerOpts[0].iceRestart === true && rtc.open === false
        );

        // Doppel-Event auf demselben Pegel (kein Übergang) ⇒ kein Sturm.
        pc.onconnectionstatechange();
        await tick();
        check(
            "Pegel statt Flanke: wiederholtes failed-Event heilt NICHT erneut",
            pc.restartIceCalls === 1 && pc.offerOpts.length === 1 && timers.pending.length === 0
        );

        // Zweiter ECHTER failed-Übergang ⇒ Backoff-Timer (kein Sofort-Restart).
        pc.connectionState = "connecting";
        pc.onconnectionstatechange();
        pc.connectionState = "failed";
        pc.onconnectionstatechange();
        const backoffDelay = timers.pending.length === 1 ? timers.pending[0].delay : NaN;
        check(
            "zweiter failed-Übergang: Heil-Versuch über Backoff-Timer, noch KEIN restartIce",
            pc.restartIceCalls === 1 && timers.pending.length === 1 && backoffDelay === R._p2pReconnectDelayMs(0, "b-peer")
        );
        timers.fireNext();
        await tick();
        await tick();
        check(
            "Backoff-Timer feuert: restartIce 2× + zweiter iceRestart-Offer",
            pc.restartIceCalls === 2 && pc.offerOpts.length === 2 && pc.offerOpts[1].iceRestart === true
        );

        // connected heilt den Backoff: der nächste failed heilt wieder SOFORT.
        pc.connectionState = "connected";
        pc.onconnectionstatechange();
        pc.connectionState = "failed";
        pc.onconnectionstatechange();
        check("connected heilt den Zähler: nächster failed-Übergang heilt sofort", pc.restartIceCalls === 3);

        // Nicht-Initiator ("z-ich" > "b-peer"): restartIce ja, Re-Offer NEIN (kein Glare).
        const Rz = makeRealmB("z-ich");
        const rtcz = Rz._p2pCreatePeerConnection("b-peer");
        rtcz.pc.connectionState = "failed";
        rtcz.pc.onconnectionstatechange();
        await tick();
        await tick();
        check(
            "Nicht-Initiator: restartIce 1×, aber KEIN Offer (Glare-Wand)",
            rtcz.pc.restartIceCalls === 1 && Rz.signals.filter((s) => s.type === "rtc-offer").length === 0
        );

        // closed ist endgültig: keine Heilung.
        const Rc = makeRealmB("a-ich");
        const rtcc = Rc._p2pCreatePeerConnection("b-peer");
        rtcc.pc.connectionState = "closed";
        rtcc.pc.onconnectionstatechange();
        await tick();
        check("closed heilt NIE", rtcc.pc.restartIceCalls === 0 && timers.pending.length === 0);

        // Peer-Abbau fällt einen geplanten Heil-Timer.
        const Rk = makeRealmB("a-ich");
        const rtck = Rk._p2pCreatePeerConnection("b-peer");
        rtck.pc.connectionState = "failed";
        rtck.pc.onconnectionstatechange(); // 1. Versuch sofort
        rtck.pc.connectionState = "connecting";
        rtck.pc.onconnectionstatechange();
        rtck.pc.connectionState = "failed";
        rtck.pc.onconnectionstatechange(); // 2. Versuch: Timer
        const hadTimer = timers.pending.length === 1;
        Rk._p2pCloseRtcPeer("b-peer");
        check(
            "Peer-Abbau fällt den Heil-Timer (kein Zombie-Restart)",
            hadTimer && timers.pending.length === 0 && !Rk.state.p2p.rtcPeers.has("b-peer")
        );
        await tick();

        // SELBST-TEST B: Heil-Aufruf im Zustands-Handler gekappt ⇒ 0 restartIce.
        const createSrc = extractMethod("_p2pCreatePeerConnection");
        const markerB = "this._p2pHealRtcPeer(peerId);";
        if (!createSrc || !createSrc.includes(markerB)) {
            check("SELBST-TEST B: Heil-Marker im onconnectionstatechange vorhanden", false);
        } else {
            const Rdead = makeRealmB("a-ich", createSrc.split(markerB).join("void peerId;"));
            const rtcd = Rdead._p2pCreatePeerConnection("b-peer");
            rtcd.pc.connectionState = "failed";
            rtcd.pc.onconnectionstatechange();
            await tick();
            check("SELBST-TEST B: gekappte Heilung ⇒ 0 restartIce (die Fixture sähe den alten Bug)", rtcd.pc.restartIceCalls === 0);
        }
    }

    // ══ FIXTURE C — SNAPSHOT-PUFFER (Interpolation im Nicht-Lockstep-Pfad) ══
    console.log("\n── C: Snapshot-Puffer (Valve-Source-Interpolation) ──");
    {
        let nowVal = 0;
        const timers = makeTimers();
        const env = {
            AnazhRealm: AR,
            performance: { now: () => nowVal },
            setTimeout: timers.setT,
            clearTimeout: timers.clearT,
            WebSocket: FakeWS,
            RTCPeerConnection: FakePC,
        };
        const interp = mk("_p2pSnapInterpolate", env);
        const self = {
            _p2pSnapInterpolate: interp,
            _p2pLockstepDrives: mk("_p2pLockstepDrives", env),
        };
        self._p2pSampleSnapBuf = mk("_p2pSampleSnapBuf", env).bind(self);
        self._p2pMsgPos = mk("_p2pMsgPos", env);

        // Der reine Kern: (t=0,x=0) · (t=100,x=3) ⇒ bei 50 ≈ 1,5.
        const buf = [
            { t: 0, x: 0, y: 0, z: 4, yaw: 0 },
            { t: 100, x: 3, y: 1, z: -2, yaw: 0.5 },
        ];
        const mid = interp.call(self, buf, 50);
        check(
            "Kern: t=50 zwischen (0,x=0) und (100,x=3) ⇒ x=1,5 (y/z/yaw lerpen mit)",
            mid && Math.abs(mid.x - 1.5) < 1e-9 && Math.abs(mid.y - 0.5) < 1e-9 && Math.abs(mid.z - 1) < 1e-9 && Math.abs(mid.yaw - 0.25) < 1e-9,
            `x=${mid && mid.x}`
        );
        const before = interp.call(self, buf, -10);
        const after = interp.call(self, buf, 150);
        check(
            "Kern KLEMMT statt zu extrapolieren (vor dem ältesten / hinter dem jüngsten)",
            before && before.x === 0 && after && after.x === 3
        );
        const wrap = interp.call(
            self,
            [
                { t: 0, x: 0, y: 0, z: 0, yaw: 3.0 },
                { t: 100, x: 0, y: 0, z: 0, yaw: -3.0 },
            ],
            50
        );
        check(
            "Kern: yaw reist über den KÜRZESTEN Bogen (3,0→−3,0 quert ±π, nie 0)",
            wrap && Math.abs(wrap.yaw) > 3.0,
            `yaw=${wrap && wrap.yaw.toFixed(4)}`
        );

        // Integration über die ECHTE Pipe: _p2pMsgPos füllt, der Sampler liest
        // renderT = now − INTERP_DELAY.
        const p2p = { peerId: "ich" };
        const entry = { peerId: "peerX", x: 0, y: 0, z: 0, yaw: 0, lockstep: null, snapBuf: null, lastMovedAt: 0, lastSeen: 0 };
        self._p2pEnsurePeerEntry = () => entry;
        nowVal = 0;
        self._p2pMsgPos({ peerId: "peerX", x: 0, y: 0, z: 0, yaw: 0 }, p2p);
        nowVal = 100;
        self._p2pMsgPos({ peerId: "peerX", x: 3, y: 1, z: -2, yaw: 0.5 }, p2p);
        nowVal = 100 + AR.P2P_SNAP_INTERP_DELAY_MS - 50; // renderT = 50
        const sampled = self._p2pSampleSnapBuf(entry, nowVal);
        check(
            "Pipe: zwei rohe 30-Hz-Snaps ⇒ der Render-Sampler stellt den Peer auf x≈1,5",
            sampled === true && Math.abs(entry.x - 1.5) < 1e-9 && Math.abs(entry.y - 0.5) < 1e-9,
            `x=${entry.x}`
        );

        // Erst-Kontakt (< 2 Snaps): roh, kein Sampling.
        const entry1 = { peerId: "peerY", x: 0, y: 0, z: 0, yaw: 0, lockstep: null, snapBuf: null, lastMovedAt: 0, lastSeen: 0 };
        self._p2pEnsurePeerEntry = () => entry1;
        nowVal = 0;
        self._p2pMsgPos({ peerId: "peerY", x: 7, y: 0, z: 0, yaw: 0 }, p2p);
        check(
            "Erst-Kontakt: EIN Snap ⇒ rohes Direkt-Schreiben, Sampler tritt zurück",
            entry1.x === 7 && self._p2pSampleSnapBuf(entry1, 200) === false && entry1.x === 7
        );

        // LOCKSTEP BLEIBT BYTE-HEILIG: fährt der Ghost, geht der Snap zur
        // Autorität (authX), der Puffer leert sich, der Sampler tritt zurück.
        const entryL = {
            peerId: "peerZ",
            x: 7,
            y: 7,
            z: 7,
            yaw: 0,
            lockstep: { seeded: true, lastStepAt: 0, authX: NaN, authY: NaN, authZ: NaN },
            snapBuf: [
                { t: 0, x: 0, y: 0, z: 0, yaw: 0 },
                { t: 50, x: 1, y: 0, z: 0, yaw: 0 },
            ],
            lastMovedAt: 0,
            lastSeen: 0,
        };
        self._p2pEnsurePeerEntry = () => entryL;
        nowVal = 100; // Ghost frisch (< 1200 ms)
        self._p2pMsgPos({ peerId: "peerZ", x: 9, y: 8, z: 7, yaw: 1 }, p2p);
        const lockstepUntouched =
            entryL.x === 7 && entryL.lockstep.authX === 9 && entryL.snapBuf.length === 0;
        const samplerSteppedBack = self._p2pSampleSnapBuf(entryL, nowVal) === false && entryL.x === 7;
        check("Lockstep-Pfad byte-heilig: Snap wird Autorität (authX), Puffer fällt, Sampler tritt zurück", lockstepUntouched && samplerSteppedBack);

        // Bounded: der Puffer wächst nie über P2P_SNAP_BUF_MAX.
        const entryB = { peerId: "peerB", x: 0, y: 0, z: 0, yaw: 0, lockstep: null, snapBuf: null, lastMovedAt: 0, lastSeen: 0 };
        self._p2pEnsurePeerEntry = () => entryB;
        for (let i = 0; i < 40; i++) {
            nowVal = i * 33;
            self._p2pMsgPos({ peerId: "peerB", x: i, y: 0, z: 0, yaw: 0 }, p2p);
        }
        check(
            `Puffer bounded (≤ ${AR.P2P_SNAP_BUF_MAX} Snaps bei 40 Empfängen)`,
            entryB.snapBuf.length <= AR.P2P_SNAP_BUF_MAX && entryB.snapBuf.length >= 2
        );

        // SELBST-TEST C: Interpolations-Faktor gekappt (f ⇒ 0) ⇒ t=50 fiele
        // auf x=0 zurück — die 1,5-Probe MUSS das sehen.
        const interpSrc = extractMethod("_p2pSnapInterpolate");
        const markerC = "(renderT - a.t) / span";
        if (!interpSrc || !interpSrc.includes(markerC)) {
            check("SELBST-TEST C: Faktor-Marker im Interpolations-Kern vorhanden", false);
        } else {
            const dead = mk("_p2pSnapInterpolate", env, interpSrc.split(markerC).join("0 * span"));
            const d = dead.call(self, buf, 50);
            check("SELBST-TEST C: gekappter Faktor ⇒ x=0 statt 1,5 (die Fixture sähe den alten Bug)", d && d.x === 0);
        }
    }

    // ══ KONSUM-PROBEN (Lehre 5/6: verifiziere KONSUM, nicht Existenz) ══
    console.log("\n── Konsum-Proben (der Stamm LIEST die neuen Teile) ──");
    {
        const updatePeer = extractMethod("_p2pUpdatePeer");
        check("_p2pUpdatePeer sampelt den Snap-Puffer vor dem Zeichnen", !!updatePeer && updatePeer.includes("_p2pSampleSnapBuf("));
        const msgPos = extractMethod("_p2pMsgPos");
        const sampler = extractMethod("_p2pSampleSnapBuf");
        check(
            "EINE Frische-Frage (_p2pLockstepDrives) — ZWEI Leser: _p2pMsgPos + Sampler",
            !!msgPos && msgPos.includes("_p2pLockstepDrives(") && !!sampler && sampler.includes("_p2pLockstepDrives(")
        );
        const shutdown = extractMethod("shutdownP2PSync");
        check(
            "shutdownP2PSync stempelt intentionalClose + fällt den Rejoin-Timer",
            !!shutdown && shutdown.includes("intentionalClose = true") && shutdown.includes("reconnectTimer")
        );
        const closeRtc = extractMethod("_p2pCloseRtcPeer");
        check("_p2pCloseRtcPeer fällt den Heil-Timer", !!closeRtc && closeRtc.includes("healTimer"));
        check(
            "kein Math.random im Reconnect-Pfad (seeded Jitter, Lehre 7)",
            !["_p2pReconnectJitterMs", "_p2pReconnectDelayMs", "_p2pScheduleReconnect", "_p2pHealRtcPeer"].some((n) => {
                const s = extractMethod(n);
                return !s || s.includes("Math.random");
            })
        );
    }

    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — ein Netz-Blip beendet die Ko-Präsenz nicht mehr still: der WS-Riss rejoint mit 1·2·4·…≤30 s + seeded Jitter (bewusstes close bleibt endgültig), der failed-Übergang heilt via restartIce+Re-Offer genau einmal je Flanke (Backoff dahinter), und der Nicht-Lockstep-pos-Pfad rendert butterweich aus dem 120-ms-Snapshot-Puffer."
    );
    process.exit(0);
})().catch((e) => {
    console.error("LINSE-FEHLER:", e && e.stack ? e.stack : e);
    process.exit(1);
});

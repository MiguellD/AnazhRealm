//# allFunctionsCalledOnLoad
class AnazhRealm_netz_p2p {
    // ===== ATLAS · Netz/p2p — Einladung · WebRTC-Mesh · Lockstep · Stimme · Welt-Bündel =====
    // DIE EINE ZAHL AUS FREMDER HAND (Draht, DSL-Programm): eine endliche Zahl oder NaN, nie still die 0. Über den Draht
    // reist NaN als null (JSON), und `Number(null) === 0` (Lehre 17) — ein ortloser Mitspieler stand so im Ursprung, eine
    // ortlose Sicht-Kreatur bei 0/0/0. null, leer, Wahrheitswert, Liste, Objekt sind keine Zahl; ein Zahl-Text gilt.
    _fremdeZahl(v) {
        const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
        return Number.isFinite(n) ? n : NaN;
    }

    // ### Ring 11 V1 — Multi-User Position-Sync ###
    // Sehr bewusst klein gehalten: eine Verbindung pro Browser, ein Raum
    // (per Default = aktive worldId), 30 Hz Position-Broadcast,
    // Remote-Spieler als simple Cone-Meshes. KEIN DSL-Sync — fremde
    // Programme würden die Sandbox-Grenze in V1 verletzen. Heilige
    // Lektion: KEINE neuen Manager-Klassen, KEIN Sync-Layer-Modul. Acht
    // Methoden auf der einen AnazhRealm, drei Hooks im Game-Loop (Pos-
    // Broadcast + Peer-Mesh-Update + Idle-Disconnect-Pflege).
    p2pLoadPersisted() {
        try {
            const enabled = localStorage.getItem("anazh.p2p.enabled");
            const url = localStorage.getItem("anazh.p2p.url");
            const room = localStorage.getItem("anazh.p2p.room");
            if (typeof enabled === "string") this.state.p2p.enabled = enabled === "true";
            if (typeof url === "string" && url.trim().length > 0) this.state.p2p.url = url.trim();
            // Expliziter Raum-Override (ad-hoc-Räume, Multi-Maschinen-Setups mit verschiedenen worldIds).
            // Leer = aktive worldId.
            if (typeof room === "string") this.state.p2p.roomOverride = room.trim();
            // W7 Phase 3 — Opt-in „Stimme teilen". Beim Laden gesetzt; ob es
            // wirklich greift, prüft setVoiceShared (braucht ein aktives LLM).
            const voice = localStorage.getItem("anazh.p2p.voiceShared");
            if (voice === "1") this.state.p2p.voiceShared = true;
        } catch {
            /* localStorage kann fehlen */
        }
    }

    p2pPersist() {
        try {
            localStorage.setItem("anazh.p2p.enabled", this.state.p2p.enabled ? "true" : "false");
            localStorage.setItem("anazh.p2p.url", this.state.p2p.url || "");
            localStorage.setItem("anazh.p2p.room", this.state.p2p.roomOverride || "");
        } catch {
            /* defensive */
        }
    }

    p2pGenerateId() {
        // Kurzer, lesbarer Peer-Identifier. Kein crypto-grade UUID nötig —
        // der Server prüft Eindeutigkeit per Set-Mitgliedschaft, und in V1
        // läuft die Vertrauens-Grenze ohnehin durch den Browser-Origin.
        const rnd = Math.random().toString(36).slice(2, 10);
        const t = Date.now().toString(36).slice(-4);
        return `p-${t}-${rnd}`;
    }

    // DER BEITRITT zu einer Welt-Adresse ({broker, roomId}, gesiebt von `_admitForeignWorldAddress`): kurzlebige WS, join +
    // world-request, auf world-snapshot warten; die Welt unter der host-worldId mit role="guest" + hostInfo durch die Tür
    // `_weltBetreten` ablegen (Sichern, Probe, Sperre, Wechsel am Ort); `zeugnisA` hält die alte Welt vorher fest (das Adress-Portal).
    // Rufer: der Welt-Code (`empfangeWerk`, Teilen in EINER Geste) und das Adress-Portal. → Promise<{ok, worldId|reason}>
    async _weltBeitritt(addr, { slugHint = null, timeoutMs = 10000, zeugnisA = null } = {}) {
        if (typeof WebSocket === "undefined") {
            return { ok: false, reason: "no_websocket" };
        }
        const myPeerId = this.p2pGenerateId();
        return new Promise((resolve) => {
            let ws;
            try {
                ws = new WebSocket(addr.broker);
            } catch (err) {
                this.log(`Join-WS-Aufbau gescheitert: ${err.message}`, "ERROR");
                resolve({ ok: false, reason: "ws_throw" });
                return;
            }
            let done = false;
            const finish = (result) => {
                if (done) return;
                done = true;
                try {
                    ws.close();
                } catch {
                    /* defensive */
                }
                resolve(result);
            };
            const timeout = setTimeout(() => {
                this.log("Join-Timeout — kein world-snapshot vom Host innerhalb " + timeoutMs + " ms", "WARN");
                finish({ ok: false, reason: "timeout" });
            }, timeoutMs);
            ws.addEventListener("open", () => {
                try {
                    ws.send(JSON.stringify({ type: "join", room: addr.roomId, peerId: myPeerId }));
                } catch {
                    /* defensive */
                }
                // Welcome abwarten ist optional — wir können request direkt
                // schicken. Server forwarded an alle anderen im Raum (Host).
                setTimeout(() => {
                    if (done) return;
                    try {
                        ws.send(JSON.stringify({ type: "world-request", erbgut: AnazhRealm.ERBGUT_PROTOKOLL }));
                    } catch {
                        /* defensive */
                    }
                }, 300);
            });
            ws.addEventListener("message", (event) => {
                let msg;
                try {
                    msg = JSON.parse(event.data);
                } catch {
                    return;
                }
                if (!msg || typeof msg !== "object") return;
                if (msg.type !== "world-snapshot") return;
                if (!msg.state || typeof msg.state !== "object") return;
                clearTimeout(timeout);
                const hostInfo = {
                    url: addr.broker,
                    roomId: addr.roomId,
                    peerId: typeof msg.peerId === "string" ? msg.peerId : null,
                };
                const worldId = this._importGuestWorld(msg.state, hostInfo, slugHint, { wechseln: true, zeugnisA });
                finish(worldId ? { ok: true, worldId } : { ok: false, reason: "import_failed" });
            });
            ws.addEventListener("error", () => {
                clearTimeout(timeout);
                this.log("Join-WS-Fehler — läuft der signaling-server am Host?", "ERROR");
                finish({ ok: false, reason: "ws_error" });
            });
        });
    }

    // Ring 11.5: Welt-Snapshot vom Host → neue lokale Welt mit role="guest". worldId wird vom Host übernommen, damit beide
    // Spieler standardmäßig im selben P2P-Raum landen (Raum = worldId, V2.1); ohne Host-Id die EINE Id-Regel
    // (`_neueWeltId`). Was der Gast Eigenes trägt — der eindeutige slug, role, hostInfo, schemaVersion und die
    // Auto-Verbindung zum Host —, sind Parameter der EINEN Tür `_weltBetreten` (Sichern, Ablage mit Probe, Sperre). Bis
    // 10.10. schrieb diese Methode Platz, Index und Zeiger selbst (eigene Id-Regel `guest-<Zeit>`, keine Probe) — eine
    // zweite Tür neben der ersten. `opts.wechseln` (Einladung, Adress-Portal: true), `opts.zeugnisA` (das Zeugnis der
    // alten Welt). → worldId | null
    _importGuestWorld(snapshot, hostInfo, slugHint, { wechseln = false, zeugnisA = null } = {}) {
        if (!snapshot || typeof snapshot !== "object") return null;
        const erbgutNein = AnazhRealm._erbgutEinlass(snapshot);
        if (erbgutNein) {
            this.log(`Gast-Welt abgelehnt: ${erbgutNein}`, "ERROR");
            return null;
        }
        const meta = snapshot.worldMeta && typeof snapshot.worldMeta === "object" ? snapshot.worldMeta : {};
        const worldId = (meta.worldId && String(meta.worldId)) || AnazhRealm._neueWeltId();
        const baseSlug = (slugHint && String(slugHint).trim()) || meta.slug || "geladen";
        // Slug-Kollisions-Resolution (analog Ring 9 importWorldBeside)
        let slug =
            String(baseSlug)
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .slice(0, 40) || "geladen";
        const existing = this.worldsIndexLoad();
        let suffix = 2;
        const slugs = new Set(existing.map((e) => e.slug));
        const originalSlug = slug;
        while (slugs.has(slug)) {
            slug = `${originalSlug}-${suffix++}`;
        }
        const h = hostInfo || {};
        const r = this._weltBetreten(
            snapshot,
            {
                worldId,
                slug,
                role: "guest",
                hostInfo: { url: h.url || null, roomId: h.roomId || worldId, peerId: h.peerId || null },
                schemaVersion: meta.schemaVersion || "11.5-multiuser-v1",
            },
            { wechseln, zeugnisA, p2pAuto: h.url || AnazhRealm.P2P_DEFAULT_WS_URL }
        );
        if (!r.ok) {
            this.log(`Guest-Welt konnte nicht abgelegt werden: ${r.reason}`, "ERROR");
            return null;
        }
        this.log(`Guest-Welt importiert: ${slug} (${worldId.slice(0, 8)}…)`, "INFO");
        return worldId;
    }

    initP2PSync(roomId, opts = {}) {
        const p2p = this.state.p2p;
        // DIE TÜR TRÄGT DIE ABSICHT (K04): wer sie ruft, will verbunden sein — vor jedem Erfolg, damit der close-Zweig
        // und `_p2pScheduleReconnect` auch einen gescheiterten Erst-Aufbau heilen. Aus geht es nur über den Knopf
        // (`enabled = false` + shutdown); der Transport-Zustand bleibt `connected`.
        p2p.enabled = true;
        if (p2p.ws) this.shutdownP2PSync();
        // Φ5 (V18.189) — beim ersten P2P-Init die getragenen Welten laden
        // (idempotent — _loadPinnedManifest setzt nur die Map einmal pro
        // Session; ein Reload + Re-Boot bekommt sie wieder).
        if (!this._pinnedLoaded) {
            this._pinnedLoaded = true;
            try {
                this._loadPinnedManifest();
            } catch {
                /* defensive */
            }
        }
        const url = (opts.url || p2p.url || AnazhRealm.P2P_DEFAULT_WS_URL).trim();
        // Raum-Auflösung: explizites Argument > localStorage-Override > aktive worldId ("" = nicht gesetzt).
        // Bei aktivem Regions-Archipel ist der Default `worldId:currentRegionKey` (eine Bubble je Region);
        // Argument/Override überstimmen das immer (Übergangs-Handler + Direkt-Join eines Welt-Tors).
        const explicitOverride = (p2p.roomOverride || "").trim();
        const wm = this.state.worldMeta;
        const regionalDefault =
            wm && wm.regionsActive === true && wm.worldId
                ? this._regionRoomId(wm.worldId, wm.currentRegionKey || this._currentRegionKey() || "r0_0")
                : null;
        const room =
            (roomId && String(roomId).trim()) || explicitOverride || regionalDefault || (wm && wm.worldId) || null;
        if (!room) {
            p2p.lastError = "Keine Raum-ID — Welt nicht initialisiert?";
            this.log("P2P-Init ohne Welt-ID abgewiesen", "WARN");
            return { ok: false, reason: "no_room" };
        }
        if (typeof WebSocket === "undefined") {
            p2p.lastError = "WebSocket nicht verfügbar in dieser Umgebung";
            return { ok: false, reason: "no_websocket" };
        }
        p2p.peerId = p2p.peerId || this.p2pGenerateId();
        // Raum und Broker sind die der lebenden Verbindung: der Rejoin und die geteilte Welt-Adresse lesen sie
        p2p.room = room;
        p2p.url = url;
        p2p.lastError = null;
        // RECONNECT #1 — dieser Aufbau ist GEWOLLT: die Abbruch-Markierung des
        // letzten shutdown fällt (der close-Handler darf wieder heilen).
        p2p.intentionalClose = false;
        try {
            const ws = new WebSocket(url);
            p2p.ws = ws;
            // Stale-Wache in JEDEM Handler: ein Re-Init ersetzt p2p.ws — die
            // asynchron nachlaufenden Events des ALTEN Sockets dürfen den
            // frischen Zustand nicht anfassen (und nie einen Rejoin planen).
            ws.addEventListener("open", () => {
                if (p2p.ws !== ws) return;
                p2p.connected = true;
                // RECONNECT #1 — die Verbindung steht: der Backoff-Zähler heilt.
                p2p.reconnectAttempt = 0;
                this._p2pSignal({ type: "join", room: p2p.room, peerId: p2p.peerId });
                this.log(`P2P verbunden mit ${url} (raum=${p2p.room.slice(0, 8)}, peer=${p2p.peerId})`, "INFO");
                this.p2pUpdateStatus();
            });
            ws.addEventListener("message", (event) => {
                if (p2p.ws !== ws) return;
                this.p2pHandleMessage(event.data);
                this.p2pUpdateStatus();
            });
            ws.addEventListener("close", () => {
                if (p2p.ws !== ws) return;
                p2p.connected = false;
                this._p2pClearAllPeerMeshes();
                this.p2pUpdateStatus();
                // Ungewollter Riss (Netz-Blip, Server-Neustart) plant den Rejoin mit Exponential-Backoff;
                // das bewusste close (shutdownP2PSync stempelt intentionalClose) bleibt endgültig.
                if (p2p.enabled && !p2p.intentionalClose) {
                    this._p2pScheduleReconnect();
                } else {
                    this.log("P2P-Verbindung beendet", "INFO");
                }
            });
            ws.addEventListener("error", () => {
                if (p2p.ws !== ws) return;
                p2p.lastError = "WebSocket-Fehler (signaling-server läuft?)";
                p2p.connected = false;
                this.log("P2P-Fehler — signaling-server erreichbar?", "WARN");
                this.p2pUpdateStatus();
            });
            return { ok: true };
        } catch (err) {
            p2p.lastError = err && err.message ? err.message : "WebSocket-Aufbau gescheitert";
            this.log(`P2P-Init Fehler: ${p2p.lastError}`, "ERROR");
            return { ok: false, reason: "ws_throw" };
        }
    }

    shutdownP2PSync() {
        const p2p = this.state.p2p;
        // Bewusstes Ende: intentionalClose markieren (der close-Handler plant dann keinen Rejoin) und einen
        // geplanten Rejoin fällen — jeder explizite (Re-)Aufbau läuft hier durch, sonst pendelt ein Timer.
        p2p.intentionalClose = true;
        if (p2p.reconnectTimer) {
            clearTimeout(p2p.reconnectTimer);
            p2p.reconnectTimer = null;
        }
        if (p2p.ws) {
            const warVerbunden = p2p.connected === true;
            try {
                p2p.ws.close();
            } catch {
                /* defensive */
            }
            if (warVerbunden) this.log("P2P-Verbindung beendet", "INFO");
        }
        p2p.ws = null;
        p2p.connected = false;
        p2p.room = null;
        this._p2pClearAllPeerMeshes();
        // W7 Phase 1 — alle WebRTC-Verbindungen schliessen (auch etwaige
        // ohne zugehörigen Peer-Mesh-Eintrag).
        for (const pid of Array.from(p2p.rtcPeers.keys())) this._p2pCloseRtcPeer(pid);
        p2p.meshActive = false;
        // W7 Phase 2 — laufende Welt-Transfers verwerfen.
        p2p.worldXfers.clear();
        p2p.pendingPullFrom = null;
        p2p._lastXferProgress = null;
        p2p._pullServedAt.clear();
        // W16 — laufende Welt-Bündel-Transfers verwerfen.
        p2p.bundleXfers.clear();
        p2p.pendingBundlePull = null;
        p2p._bundleServedAt.clear();
        // W7 Phase 3 — offene Stimm-Anfragen verwerfen + Timeouts räumen.
        for (const pending of p2p._voiceRequests.values()) {
            if (pending && pending.timeout) clearTimeout(pending.timeout);
        }
        p2p._voiceRequests.clear();
        p2p._voiceServedAt.clear();
        // Kreatur-Sicht-Sync — alle Sicht-Kopien der Mitspieler entsorgen.
        for (const [key, rc] of p2p.remoteCreatures) this._disposeRemoteCreature(key, rc);
        // W7 Phase 4 — die geholte Lobby-Liste verfällt mit der Verbindung.
        p2p.lobby.rooms = [];
    }

    // ── WS-REJOIN MIT EXPONENTIAL-BACKOFF ──
    // Ein ungewollter Riss plant den Rejoin (der Server nimmt denselben peerId wieder an): 1 s·2^n,
    // Deckel 30 s, plus SEEDED Jitter — FNV-1a über Versuchszähler+peerId statt Math.random (Lehre 7);
    // verschiedene peerIds streuen trotzdem auseinander. Abbruch NUR über das bewusste close.
    _p2pReconnectJitterMs(attempt, peerId) {
        const s = String(attempt) + ":" + String(peerId || "");
        let h = 0x811c9dc5;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 0x01000193) >>> 0;
        }
        return h % AnazhRealm.P2P_RECONNECT_JITTER_MS;
    }

    // Die EINE Delay-Formel — ZWEI Leser: der WS-Rejoin (_p2pScheduleReconnect)
    // und die RTC-Heilung (_p2pHealRtcPeer) atmen im selben Takt.
    _p2pReconnectDelayMs(attempt, peerId) {
        const base = Math.min(AnazhRealm.P2P_RECONNECT_MAX_MS, AnazhRealm.P2P_RECONNECT_BASE_MS * Math.pow(2, attempt));
        return base + this._p2pReconnectJitterMs(attempt, peerId);
    }

    _p2pScheduleReconnect() {
        const p2p = this.state.p2p;
        if (!p2p.enabled || p2p.intentionalClose) return false;
        if (p2p.reconnectTimer) return false; // schon geplant
        if (!p2p.room) return false; // nie beigetreten — nichts zu heilen
        const attempt = p2p.reconnectAttempt++;
        const delay = this._p2pReconnectDelayMs(attempt, p2p.peerId);
        this.log(`P2P-Riss — Rejoin-Versuch ${attempt + 1} in ${(delay / 1000).toFixed(1)} s`, "WARN");
        p2p.reconnectTimer = setTimeout(() => {
            p2p.reconnectTimer = null;
            if (!p2p.enabled || p2p.intentionalClose) return;
            const res = this.initP2PSync(p2p.room, { url: p2p.url });
            // Scheitert schon der AUFBAU (kein close-Event kommt dann je),
            // plant der nächste Versuch HIER — sonst trägt der close-Handler
            // des frischen Sockets die Kette weiter.
            if (!res || res.ok !== true) this._p2pScheduleReconnect();
        }, delay);
        return true;
    }

    // Roher WS-Versand für das Signaling (join, rtc-offer/answer/ice, world-request/snapshot) — läuft
    // IMMER über den signaling-server, auch bei stehendem Mesh. Spiel-Nachrichten gehen über p2pSend.
    _p2pSignal(obj) {
        const ws = this.state.p2p.ws;
        if (!ws || ws.readyState !== 1) return false;
        try {
            ws.send(JSON.stringify(obj));
            return true;
        } catch {
            return false;
        }
    }

    p2pSend(obj) {
        // Protokoll-Version: jede Mesh-Nachricht trägt `pv`; Empfänger TOLERIEREN unbekannte Felder und
        // Versionen (JSON-Toleranz aller Handler) — alte und neue Clients teilen denselben Raum.
        if (obj && typeof obj === "object" && obj.pv === undefined) obj.pv = AnazhRealm.PROTO_VERSION;
        // Spiel-Broadcast (pos/dsl/soul/aura/vibe): steht das WebRTC-Mesh komplett (alle Peer-Kanäle
        // offen), gehen Nachrichten über die DataChannels, sonst über den WS-Relay. Die Komplett-Wand
        // verhindert Doppel-Zustellung: entweder ALLE Peers gemesht (Kanäle) oder nicht alle (WS).
        const p2p = this.state.p2p;
        if (this._p2pMeshReady()) {
            const payload = JSON.stringify(obj);
            let sent = 0;
            for (const rtc of p2p.rtcPeers.values()) {
                if (rtc.open && rtc.channel) {
                    try {
                        rtc.channel.send(payload);
                        sent++;
                    } catch {
                        /* defensive — ein toter Kanal bricht den Broadcast nicht */
                    }
                }
            }
            return sent > 0;
        }
        return this._p2pSignal(obj);
    }

    // W7 Phase 1: das Mesh ist „komplett", wenn JEDER bekannte Peer einen
    // offenen DataChannel hat. Nur dann fliesst Spiel-Traffic peer-to-peer.
    _p2pMeshReady() {
        const p2p = this.state.p2p;
        if (!p2p.peers || p2p.peers.size === 0) return false;
        for (const pid of p2p.peers.keys()) {
            const rtc = p2p.rtcPeers.get(pid);
            if (!rtc || !rtc.open) return false;
        }
        return true;
    }

    _p2pUpdateMeshActive() {
        this.state.p2p.meshActive = this._p2pMeshReady();
    }

    // Eine RTCPeerConnection zu einem Peer eröffnen (idempotent). Deterministischer Initiator: die
    // lexikographisch kleinere peerId baut den Offer (verhindert Glare); die andere antwortet.
    _p2pConnectToPeer(peerId) {
        const p2p = this.state.p2p;
        if (!peerId || peerId === p2p.peerId) return;
        if (p2p.rtcPeers.has(peerId)) return;
        if (typeof RTCPeerConnection === "undefined") return;
        const rtc = this._p2pCreatePeerConnection(peerId);
        if (!rtc) return;
        const iAmInitiator = String(p2p.peerId) < String(peerId);
        if (!iAmInitiator) return; // der andere offeriert — wir warten auf rtc-offer
        rtc.isInitiator = true;
        const channel = rtc.pc.createDataChannel("anazh", { ordered: true });
        this._p2pWireChannel(peerId, channel);
        rtc.pc
            .createOffer()
            .then((offer) => rtc.pc.setLocalDescription(offer))
            .then(() => {
                this._p2pSignal({ type: "rtc-offer", to: peerId, sdp: rtc.pc.localDescription });
            })
            .catch((err) => this.log(`RTC-Offer an ${peerId} fehlgeschlagen: ${err.message}`, "WARN"));
    }

    _p2pCreatePeerConnection(peerId) {
        const p2p = this.state.p2p;
        if (typeof RTCPeerConnection === "undefined") return null;
        let pc;
        try {
            pc = new RTCPeerConnection({ iceServers: p2p.iceServers });
        } catch (err) {
            this.log(`RTCPeerConnection-Aufbau fehlgeschlagen: ${err.message}`, "WARN");
            return null;
        }
        const rtc = {
            pc,
            channel: null,
            open: false,
            isInitiator: false,
            pendingIce: [],
            // RECONNECT #2 — RTC-Heilung: Flanken-Gedächtnis (genau ein
            // Heil-Versuch je failed-ÜBERGANG) + Backoff-Zähler + geplanter
            // Heil-Timer (s. _p2pHealRtcPeer).
            lastConnState: "new",
            healAttempt: 0,
            healTimer: null,
        };
        p2p.rtcPeers.set(peerId, rtc);
        pc.onicecandidate = (ev) => {
            this._p2pSignal({
                type: "rtc-ice",
                to: peerId,
                candidate: ev.candidate ? ev.candidate.toJSON() : null,
            });
        };
        pc.ondatachannel = (ev) => this._p2pWireChannel(peerId, ev.channel);
        pc.onconnectionstatechange = () => {
            const cs = pc.connectionState;
            // RECONNECT #2 — steht die Verbindung (wieder), heilt der Backoff.
            if (cs === "connected") rtc.healAttempt = 0;
            if (cs === "failed" || cs === "closed") {
                rtc.open = false;
                this._p2pUpdateMeshActive();
                this.p2pUpdateStatus();
                // GENAU EIN Heil-Versuch je failed-Übergang (Flanke, nie Pegel — kein restartIce-Sturm);
                // Wiederholungen über den Backoff in _p2pHealRtcPeer. "closed" ist endgültig.
                if (cs === "failed" && rtc.lastConnState !== "failed") this._p2pHealRtcPeer(peerId);
            }
            rtc.lastConnState = cs;
        };
        return rtc;
    }

    // RTC-Heilung nach Perfect Negotiation (MDN): restartIce() + Re-Offer holt neue ICE-Kandidaten nach
    // Netzwechsel/NAT-Rebind. NUR der Initiator (kleinere peerId, dieselbe Glare-Wand wie
    // _p2pConnectToPeer) offeriert mit iceRestart; der andere ruft restartIce() und wartet auf den Offer.
    // Erster Versuch je failed-Übergang sofort, Wiederholungen über _p2pReconnectDelayMs.
    _p2pHealRtcPeer(peerId) {
        const p2p = this.state.p2p;
        const rtc = p2p.rtcPeers.get(peerId);
        if (!rtc || rtc.healTimer) return false;
        const attempt = rtc.healAttempt || 0;
        rtc.healAttempt = attempt + 1;
        const run = () => {
            rtc.healTimer = null;
            if (p2p.rtcPeers.get(peerId) !== rtc) return; // Peer ging/ersetzt
            if (rtc.pc.connectionState !== "failed") return; // schon geheilt
            try {
                if (typeof rtc.pc.restartIce === "function") rtc.pc.restartIce();
            } catch {
                /* defensive — ältere Engines ohne restartIce */
            }
            if (String(p2p.peerId) < String(peerId)) {
                rtc.pc
                    .createOffer({ iceRestart: true })
                    .then((offer) => rtc.pc.setLocalDescription(offer))
                    .then(() => {
                        this._p2pSignal({ type: "rtc-offer", to: peerId, sdp: rtc.pc.localDescription });
                    })
                    .catch((err) => this.log(`RTC-Heil-Offer an ${peerId} fehlgeschlagen: ${err.message}`, "WARN"));
            }
        };
        if (attempt === 0) run();
        else rtc.healTimer = setTimeout(run, this._p2pReconnectDelayMs(attempt - 1, peerId));
        return true;
    }

    _p2pWireChannel(peerId, channel) {
        const rtc = this.state.p2p.rtcPeers.get(peerId);
        if (!rtc) return;
        rtc.channel = channel;
        channel.onopen = () => {
            rtc.open = true;
            this._p2pUpdateMeshActive();
            this.log(`WebRTC-Mesh: Kanal zu ${peerId.slice(0, 12)}… offen`, "INFO");
            this.p2pUpdateStatus();
            // Eigene Seele + Vibe-Identität direkt peer-to-peer nachreichen.
            this._p2pBroadcastSoul();
            this._p2pBroadcastVibe();
            // F4 (V18.134) — die eigenen Bewertungs-Zeugnisse nachreichen
            // (EIN Batch, kanal-direkt an den frischen Peer).
            const socialBatch = this._socialAnnounceBatch();
            if (socialBatch && channel.readyState === "open") {
                try {
                    channel.send(JSON.stringify(socialBatch));
                } catch (_e) {
                    /* Kanal frisch zu — der naechste onopen reicht nach */
                }
            }
            // F4 Stufe 4 (V18.143) — die eigenen Kommentar-Zeugnisse nachreichen.
            const commentBatch = this._socialCommentsBatch();
            if (commentBatch && channel.readyState === "open") {
                try {
                    channel.send(JSON.stringify(commentBatch));
                } catch (_e) {
                    /* dito */
                }
            }
        };
        channel.onmessage = (ev) => this._p2pHandleChannelMessage(peerId, ev.data);
        channel.onclose = () => {
            rtc.open = false;
            this._p2pUpdateMeshActive();
            this.p2pUpdateStatus();
        };
    }

    // Nachricht über einen Peer-DataChannel: hier kommen NUR Spiel-Nachrichten an (Signaling via WS).
    // Die peerId stempelt die Kanal-Identität — ein Peer kann keine fremde peerId vortäuschen.
    _p2pHandleChannelMessage(peerId, raw) {
        let msg;
        try {
            msg = JSON.parse(raw);
        } catch {
            return;
        }
        if (!msg || typeof msg !== "object") return;
        // F4 (V18.134) — soziale Bewertungs-Zeugnisse: kanal-exklusiv +
        // R1-rate-gegated; die Signatur-Pruefung lebt im Receive (async).
        if (msg.type === "social-rating") {
            if (this._p2pPeerRateAdmit("social", peerId, AnazhRealm.SOCIAL.ratePerSec)) {
                this._socialRatingReceive(peerId, msg.r);
            }
            return;
        }
        if (msg.type === "social-ratings") {
            if (Array.isArray(msg.list) && this._p2pPeerRateAdmit("social", peerId, AnazhRealm.SOCIAL.ratePerSec)) {
                for (const r of msg.list.slice(0, AnazhRealm.SOCIAL.maxBatch)) this._socialRatingReceive(peerId, r);
            }
            return;
        }
        // F4 Stufe 4 (V18.143) — Kommentar-Zeugnisse: dieselbe Wand (kanal-
        // exklusiv + R1-Rate; Form/verify/Rueckruf leben im Receive).
        if (msg.type === "social-comment") {
            if (this._p2pPeerRateAdmit("social", peerId, AnazhRealm.SOCIAL.ratePerSec)) {
                this._socialCommentReceive(peerId, msg.c);
            }
            return;
        }
        if (msg.type === "social-comments") {
            if (Array.isArray(msg.list) && this._p2pPeerRateAdmit("social", peerId, AnazhRealm.SOCIAL.ratePerSec)) {
                for (const c of msg.list.slice(0, AnazhRealm.SOCIAL.maxCommentBatch))
                    this._socialCommentReceive(peerId, c);
            }
            return;
        }
        // W7 Phase 2 — Welt-Transfer läuft kanal-exklusiv (kann nicht über
        // den WS injiziert werden, weil hier behandelt statt re-dispatcht).
        if (msg.type === "world-pull") {
            this._p2pHandleWorldPull(peerId, msg);
            return;
        }
        if (msg.type === "world-chunk") {
            this._p2pHandleWorldChunk(peerId, msg);
            return;
        }
        // W16 Phase 1 — Mesh-Welt-Verteilung. Auch kanal-exklusiv: ein
        // world-bundle-pull/-chunk/-fail KANN nicht über den WS injiziert
        // werden, weil hier behandelt statt re-dispatcht.
        if (msg.type === "world-bundle-pull") {
            this._p2pHandleWorldBundlePull(peerId, msg);
            return;
        }
        if (msg.type === "world-bundle-chunk") {
            this._p2pHandleWorldBundleChunk(peerId, msg);
            return;
        }
        if (msg.type === "world-bundle-fail") {
            this._p2pHandleWorldBundleFail(peerId, msg);
            return;
        }
        // W7 Phase 3 — LLM-Pool. Auch kanal-exklusiv (kein WS-Pfad).
        if (msg.type === "llm-request") {
            this._p2pHandleLlmRequest(peerId, msg);
            return;
        }
        if (msg.type === "llm-response") {
            this._p2pHandleLlmResponse(peerId, msg);
            return;
        }
        // Host-geroutetes Sub-Welt-Transport, kanal-exklusiv: subworld-srv (Gast→Host) + subworld-cli
        // (Host→Gast) werden hier behandelt, nie re-dispatcht — also nicht über den WS injizierbar.
        // Die kanal-gestempelte peerId ist beim subworld-srv die unfälschbare Verbindungs-id.
        if (msg.type === "subworld-srv") {
            this._portalSrvFromGuest(peerId, msg);
            return;
        }
        if (msg.type === "subworld-cli") {
            this._portalCliReceive(peerId, msg);
            return;
        }
        // W17 Phase B-JS-Compute Phase 2 — der Compute-Host annonciert die
        // Roster (für die Host-Migration, wenn er das Mesh verlässt).
        if (msg.type === "subworld-roster") {
            this._portalRosterReceive(peerId, msg);
            return;
        }
        // F2 (G3, V18.126) — der Compute-Host annonciert den kooperativen
        // Server-ZUSTAND (die Mitgift der Host-Migration). Kanal-exklusiv wie
        // die Roster: nicht WS-injizierbar, peerId kanal-gestempelt.
        if (msg.type === "subworld-state") {
            this._portalStateReceive(peerId, msg);
            return;
        }
        const ALLOWED = [
            "pos",
            "input", // V18.382 — Lockstep-Input-Strom (kanal-gestempelte peerId, unfälschbar)
            "dsl",
            "soul",
            "vibe",
            "creature-pos",
            "companion-say",
            "subworld-net",
            "subworld-pose",
            "portal-invite",
        ];
        if (!ALLOWED.includes(msg.type)) return;
        msg.peerId = peerId;
        this.p2pHandleMessage(JSON.stringify(msg));
    }

    // W7 Phase 2 — eine Nachricht an den Kanal genau eines Peers senden.
    _p2pSendChannelTo(peerId, obj) {
        const rtc = this.state.p2p.rtcPeers.get(peerId);
        if (!rtc || !rtc.open || !rtc.channel) return false;
        try {
            rtc.channel.send(JSON.stringify(obj));
            return true;
        } catch {
            return false;
        }
    }

    _p2pChunkXferId() {
        return "x-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    }

    // Multi-User-Bau-Sync — eine geteilte Architektur-Identität. String (statt
    // der numerischen Worldgen-id), damit zwei Peers dieselbe spieler-gebaute
    // Struktur eindeutig meinen können (Spawn + Abbau-Sync).
    _newArchId() {
        return "a-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    }

    // W7 Phase 2 — den Resync vom Host anfordern: ein Guest holt die Welt
    // des Hosts frisch über das Mesh. Nur sinnvoll, wenn das Mesh steht und
    // ein host-Peer verbunden ist.
    _p2pRequestWorldResync() {
        const p2p = this.state.p2p;
        if (!this._p2pMeshReady()) return { ok: false, reason: "no_mesh" };
        let hostPeerId = null;
        for (const [pid, entry] of p2p.peers) {
            if (entry.worldRole === "host") {
                hostPeerId = pid;
                break;
            }
        }
        if (!hostPeerId) return { ok: false, reason: "no_host" };
        const rtc = p2p.rtcPeers.get(hostPeerId);
        if (!rtc || !rtc.open) return { ok: false, reason: "no_channel" };
        p2p.pendingWorldSnapshot = true;
        p2p.pendingPullFrom = hostPeerId;
        const sent = this._p2pSendChannelTo(hostPeerId, { type: "world-pull", erbgut: AnazhRealm.ERBGUT_PROTOKOLL });
        if (!sent) {
            p2p.pendingWorldSnapshot = false;
            p2p.pendingPullFrom = null;
            return { ok: false, reason: "send_failed" };
        }
        this.log(`Welt-Resync vom Host ${hostPeerId.slice(0, 12)}… angefordert`, "INFO");
        this.p2pUpdateStatus();
        return { ok: true, hostPeerId };
    }

    // W7 Phase 2 — auf einen world-pull antworten: den eigenen Snapshot in
    // P2P_WORLD_CHUNK_SIZE-Stücke zerlegen und über den DataChannel senden.
    // Backpressure über channel.bufferedAmount fängt grosse Welten ab.
    async _p2pHandleWorldPull(peerId, msg) {
        const p2p = this.state.p2p;
        const rtc = p2p.rtcPeers.get(peerId);
        if (!rtc || !rtc.open || !rtc.channel) return;
        // Nur eine echte (geteilte) Welt herausgeben.
        const role = p2p.role;
        if (role !== "host" && role !== "guest") return;
        // Nur zu einem Leser ihres Erbguts (`_erbgutTeilbar`).
        const erbgutNein = AnazhRealm._erbgutTeilbar(this.state.worldMeta, msg);
        if (erbgutNein) {
            this.log(`Welt-Pull von ${peerId.slice(0, 12)}… verweigert: ${erbgutNein}`, "WARN");
            return;
        }
        // Rate-Limit: ein voller Snapshot ist teuer — ein Peer darf höchstens alle P2P_PULL_COOLDOWN_MS
        // einen Pull auslösen (sonst world-pull-Spam als DoS). Sentinel "noch nie bedient" = -Infinity,
        // NICHT 0 — sonst fiele ein Pull in den ersten COOLDOWN-ms der Seite fälschlich weg.
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        const last = p2p._pullServedAt.has(peerId) ? p2p._pullServedAt.get(peerId) : -Infinity;
        if (now - last < AnazhRealm.P2P_PULL_COOLDOWN_MS) {
            this.log(`Welt-Pull von ${peerId.slice(0, 12)}… zu schnell — abgewiesen`, "WARN");
            return;
        }
        p2p._pullServedAt.set(peerId, now);
        let snap;
        try {
            snap = JSON.stringify(this.buildStateSnapshot());
        } catch (err) {
            this.log(`Welt-Snapshot für Resync konnte nicht gebaut werden: ${err.message}`, "WARN");
            return;
        }
        const size = AnazhRealm.P2P_WORLD_CHUNK_SIZE;
        const total = Math.max(1, Math.ceil(snap.length / size));
        const xferId = this._p2pChunkXferId();
        for (let seq = 0; seq < total; seq++) {
            // Backpressure: warten, bis der Sende-Puffer abgeflossen ist.
            let guard = 0;
            while (rtc.channel.bufferedAmount > AnazhRealm.P2P_BACKPRESSURE_BYTES && guard++ < 600) {
                await new Promise((r) => setTimeout(r, 16));
            }
            if (rtc.channel.readyState !== "open") return;
            try {
                rtc.channel.send(
                    JSON.stringify({
                        type: "world-chunk",
                        xferId,
                        seq,
                        total,
                        data: snap.slice(seq * size, (seq + 1) * size),
                    })
                );
            } catch (err) {
                this.log(`Welt-Transfer abgebrochen: ${err.message}`, "WARN");
                return;
            }
        }
        this.log(`Welt in ${total} Stücken über das Mesh an ${peerId.slice(0, 12)}… gesendet`, "INFO");
    }

    // W7 Phase 2 — ein Snapshot-Stück empfangen + zusammensetzen. Nur Stücke
    // vom Peer, von dem wir aktiv gepullt haben, werden angenommen.
    _p2pHandleWorldChunk(peerId, msg) {
        const p2p = this.state.p2p;
        if (!p2p.pendingWorldSnapshot || peerId !== p2p.pendingPullFrom) return;
        const xferId = msg.xferId;
        const seq = msg.seq;
        const total = msg.total;
        if (typeof xferId !== "string" || !Number.isInteger(seq) || !Number.isInteger(total)) return;
        if (total < 1 || total > 8192 || seq < 0 || seq >= total) return;
        if (typeof msg.data !== "string") return;
        let xfer = p2p.worldXfers.get(xferId);
        if (!xfer) {
            xfer = { from: peerId, total, parts: new Array(total).fill(null), received: 0 };
            p2p.worldXfers.set(xferId, xfer);
        }
        if (xfer.total !== total || xfer.from !== peerId) return;
        if (xfer.parts[seq] !== null) return; // Duplikat
        xfer.parts[seq] = msg.data;
        xfer.received++;
        p2p._lastXferProgress = { xferId, received: xfer.received, total };
        this.p2pUpdateStatus();
        if (xfer.received < total) return;
        // Komplett — zusammensetzen + übernehmen.
        p2p.worldXfers.delete(xferId);
        p2p.pendingPullFrom = null;
        const joined = xfer.parts.join("");
        p2p._lastReceivedSnapshotLen = joined.length;
        let parsed;
        try {
            parsed = JSON.parse(joined);
        } catch (err) {
            this.log(`Welt-Transfer korrupt (${joined.length} Zeichen): ${err.message}`, "ERROR");
            p2p.pendingWorldSnapshot = false;
            p2p._lastXferProgress = null;
            this.p2pUpdateStatus();
            return;
        }
        this.log(`Welt-Transfer komplett (${total} Stücke) — übernehme`, "INFO");
        p2p._lastXferProgress = null;
        this._p2pApplyWorldSnapshot(peerId, parsed);
    }

    // ── Mesh-Welt-Verteilung: eine vendorte Welt reist p2p ──
    // Wer eine vendorte Welt (worlds/<id>/) nicht hat, holt ihr Bündel peer-to-peer (Transport spiegelt
    // world-pull/world-chunk). Der Empfang reicht an die EINE Schreib-Seite vendorWorldBundle —
    // drei Eingänge (lokales Bündel, GitHub, Mesh-Peer), eine Wand.

    // Das Bündel einer vendorten Welt vom save-server zurücklesen (die
    // Lese-Seite /api/vendor-bundle). Der EINZIGE Netz-Schritt des Senders;
    // im Playtest gestubbt (wie _vendorPostBundle / llmCall).
    async _p2pFetchVendorBundle(worldId) {
        try {
            const res = await fetch("http://localhost:4312/api/vendor-bundle?worldId=" + encodeURIComponent(worldId));
            let data = null;
            try {
                data = await res.json();
            } catch {
                data = null;
            }
            if (!res.ok || !data || !Array.isArray(data.files)) {
                return { ok: false, reason: (data && data.error) || `HTTP ${res.status}` };
            }
            return { ok: true, files: data.files };
        } catch {
            return { ok: false, reason: "save_server_unreachable" };
        }
    }

    // Eine Welt von einem Mitspieler holen: world-bundle-pull an genau EINEN Peer; die Antwort
    // (world-bundle-chunk) reassembliert _p2pHandleWorldBundleChunk. Liefert {ok} | {ok:false, reason}.
    requestWorldBundleFromPeer(worldId, peerId, expectedHash) {
        const id = String(worldId || "")
            .trim()
            .toLowerCase();
        if (!/^[a-z0-9_-]{1,40}$/.test(id)) return { ok: false, reason: "invalid_world_id" };
        // Habe ich die Welt schon, ist kein Pull nötig.
        if (this.state.customWorlds && this.state.customWorlds[id]) {
            return { ok: false, reason: "already_have" };
        }
        const p2p = this.state.p2p;
        if (!peerId || !p2p.peers.has(peerId)) return { ok: false, reason: "no_such_peer" };
        const rtc = p2p.rtcPeers.get(peerId);
        if (!rtc || !rtc.open) return { ok: false, reason: "no_channel" };
        // expectedHash (Content-Hash der Katalog-Zeile) reist mit — _p2pHandleWorldBundleChunk prüft ihn.
        // startedAt trägt den weichen Timeout (_p2pCheckBundlePullTimeout), sonst hinge der Pull ewig,
        // wenn der Sender mitten im Chunk-Strom verschwindet.
        const hash =
            typeof expectedHash === "string" && /^[0-9a-f]{1,64}$/i.test(expectedHash)
                ? expectedHash.toLowerCase()
                : "";
        p2p.pendingBundlePull = { peerId, worldId: id, expectedHash: hash, startedAt: Date.now() };
        const sent = this._p2pSendChannelTo(peerId, { type: "world-bundle-pull", worldId: id });
        if (!sent) {
            p2p.pendingBundlePull = null;
            return { ok: false, reason: "send_failed" };
        }
        this.log(`Welt „${id}" von ${peerId.slice(0, 12)}… über das Mesh angefragt`, "INFO");
        return { ok: true, worldId: id, peerId };
    }

    // Auf world-bundle-pull antworten: Bündel einer vendorten Welt vom save-server lesen, in Stücken
    // über den DataChannel senden. Nur EIGENE vendorte Welten (Manifest-Importe haben keine Dateien).
    // Rate-Limit gegen pull-Spam.
    async _p2pHandleWorldBundlePull(peerId, msg) {
        const p2p = this.state.p2p;
        const rtc = p2p.rtcPeers.get(peerId);
        if (!rtc || !rtc.open || !rtc.channel) return;
        const worldId = String((msg && msg.worldId) || "")
            .trim()
            .toLowerCase();
        if (!/^[a-z0-9_-]{1,40}$/.test(worldId)) return;
        // Rate-Limit. Sentinel: „noch nie bedient" = -Infinity, NICHT 0 —
        // sonst würde ein Pull in den ersten COOLDOWN-ms fälschlich
        // abgewiesen (V8.65-Lehre, zweimal erlebt).
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        const last = p2p._bundleServedAt.has(peerId) ? p2p._bundleServedAt.get(peerId) : -Infinity;
        if (now - last < AnazhRealm.P2P_BUNDLE_PULL_COOLDOWN_MS) {
            this.log(`Welt-Bündel-Pull von ${peerId.slice(0, 12)}… zu schnell — abgewiesen`, "WARN");
            return;
        }
        p2p._bundleServedAt.set(peerId, now);
        const fail = (reason) => this._p2pSendChannelTo(peerId, { type: "world-bundle-fail", worldId, reason });
        const entry = this.state.customWorlds && this.state.customWorlds[worldId];
        // Nur eine vendorte Welt hat lokale Dateien, die wir teilen können.
        if (!entry || entry.vendored !== true) {
            fail("not_found");
            return;
        }
        const bundle = await this._p2pFetchVendorBundle(worldId);
        if (!bundle.ok || !bundle.files || !bundle.files.length) {
            fail("unavailable");
            return;
        }
        // Das Meta reist mit (Spiegel des _vendorRegisterWorld-Eintrags) —
        // der Empfänger registriert die Welt mit Name/Beschreibung/DSL.
        let payload;
        try {
            payload = JSON.stringify({
                worldId,
                label: entry.label || worldId,
                desc: entry.desc || "",
                dsl: Array.isArray(entry.dsl) ? entry.dsl : [],
                multiplayer: entry.multiplayer === true,
                coPresence: entry.coPresence === true,
                serverMode: entry.serverMode === "js-compute" ? "js-compute" : "relay",
                files: bundle.files,
            });
        } catch {
            fail("unavailable");
            return;
        }
        const size = AnazhRealm.P2P_WORLD_CHUNK_SIZE;
        const total = Math.max(1, Math.ceil(payload.length / size));
        const xferId = this._p2pChunkXferId();
        for (let seq = 0; seq < total; seq++) {
            // Backpressure: warten, bis der Sende-Puffer abgeflossen ist.
            let guard = 0;
            while (rtc.channel.bufferedAmount > AnazhRealm.P2P_BACKPRESSURE_BYTES && guard++ < 600) {
                await new Promise((r) => setTimeout(r, 16));
            }
            if (rtc.channel.readyState !== "open") return;
            try {
                rtc.channel.send(
                    JSON.stringify({
                        type: "world-bundle-chunk",
                        xferId,
                        seq,
                        total,
                        data: payload.slice(seq * size, (seq + 1) * size),
                    })
                );
            } catch (err) {
                this.log(`Welt-Bündel-Transfer abgebrochen: ${err.message}`, "WARN");
                return;
            }
        }
        this.log(`Welt „${worldId}" in ${total} Stücken über das Mesh an ${peerId.slice(0, 12)}… gesendet`, "INFO");
    }

    // W16 — ein Welt-Bündel-Stück empfangen + zusammensetzen. Nur Stücke vom
    // Peer, von dem wir aktiv gepullt haben (pendingBundlePull) — ein fremder
    // Peer kann keine Stücke in einen laufenden Transfer schmuggeln.
    _p2pHandleWorldBundleChunk(peerId, msg) {
        const p2p = this.state.p2p;
        const pend = p2p.pendingBundlePull;
        if (!pend || peerId !== pend.peerId) return;
        const xferId = msg.xferId;
        const seq = msg.seq;
        const total = msg.total;
        if (typeof xferId !== "string" || !Number.isInteger(seq) || !Number.isInteger(total)) return;
        if (total < 1 || total > 8192 || seq < 0 || seq >= total) return;
        if (typeof msg.data !== "string") return;
        let xfer = p2p.bundleXfers.get(xferId);
        if (!xfer) {
            xfer = { from: peerId, total, parts: new Array(total).fill(null), received: 0 };
            p2p.bundleXfers.set(xferId, xfer);
        }
        if (xfer.total !== total || xfer.from !== peerId) return;
        if (xfer.parts[seq] !== null) return; // Duplikat
        xfer.parts[seq] = msg.data;
        xfer.received++;
        if (xfer.received < total) return;
        // Komplett — zusammensetzen, prüfen, an die Schreib-Seite reichen.
        p2p.bundleXfers.delete(xferId);
        p2p.pendingBundlePull = null;
        let parsed;
        try {
            parsed = JSON.parse(xfer.parts.join(""));
        } catch (err) {
            this.log(`Welt-Bündel-Transfer korrupt: ${err.message}`, "ERROR");
            this._renderMeshWorldResult({ ok: false, reason: "unavailable" });
            return;
        }
        // Die Welt, die ankommt, MUSS die sein, die wir angefragt haben — ein
        // Peer kann keine fremde Welt unter falschem Namen schmuggeln.
        if (!parsed || typeof parsed !== "object" || parsed.worldId !== pend.worldId) {
            this.log("Welt-Bündel-Transfer: falsche worldId — verworfen", "WARN");
            this._renderMeshWorldResult({ ok: false, reason: "unavailable" });
            return;
        }
        this.log(`Welt „${pend.worldId}" über das Mesh empfangen — docke an …`, "INFO");
        // Die EINE Schreib-Seite vendorWorldBundle prüft, schreibt (save-server), registriert sandgesichert;
        // eine peer-empfangene Welt ist ungeprüft → trust "sandboxed" (über vendored:true unfälschbar).
        Promise.resolve(
            this.vendorWorldBundle({
                worldId: parsed.worldId,
                label: parsed.label,
                desc: parsed.desc,
                dsl: parsed.dsl,
                multiplayer: parsed.multiplayer === true,
                coPresence: parsed.coPresence === true,
                serverMode: parsed.serverMode === "js-compute" ? "js-compute" : "relay",
                files: parsed.files,
            })
        )
            .then((res) => {
                // Hash-Verifikation: der save-server (Hash-Autorität) liefert den echten Hash der empfangenen Welt.
                // Weicht er vom Katalog-Hash ab (korrupt/manipuliert), die frisch angedockte Welt wieder entfernen.
                if (
                    res &&
                    res.ok &&
                    pend.expectedHash &&
                    typeof res.bundleHash === "string" &&
                    res.bundleHash &&
                    res.bundleHash.toLowerCase() !== pend.expectedHash
                ) {
                    this.log(`Mesh-Welt „${res.id}": Content-Hash weicht vom Katalog ab — verworfen.`, "ERROR");
                    if (this.state.customWorlds) delete this.state.customWorlds[res.id];
                    this._saveCustomWorlds();
                    if (typeof document !== "undefined" && this.renderLibraryUI) this.renderLibraryUI();
                    this._renderMeshWorldCatalog();
                    this._renderMeshWorldResult({ ok: false, reason: "hash_mismatch" });
                    return;
                }
                if (res && res.ok) {
                    this.log(`Mesh-Welt „${res.id}" angedockt — durch ein Tor betretbar.`, "INFO");
                    if (typeof document !== "undefined" && this.renderLibraryUI) this.renderLibraryUI();
                } else {
                    this.log(`Mesh-Welt andocken fehlgeschlagen: ${res && res.reason}`, "WARN");
                }
                this._renderMeshWorldResult(res);
            })
            .catch((err) => this.log(`Mesh-Welt andocken: ${err && err.message}`, "ERROR"));
    }

    // W16 — der Peer hat die Welt nicht (oder kann sie nicht liefern). Den
    // laufenden Pull beenden + den Grund anzeigen.
    _p2pHandleWorldBundleFail(peerId, msg) {
        const p2p = this.state.p2p;
        const pend = p2p.pendingBundlePull;
        if (!pend || peerId !== pend.peerId) return;
        const worldId = String((msg && msg.worldId) || "").toLowerCase();
        if (worldId && worldId !== pend.worldId) return;
        p2p.pendingBundlePull = null;
        const reason = (msg && msg.reason) || "unavailable";
        this.log(`Mesh-Welt „${pend.worldId}": Mitspieler kann sie nicht liefern (${reason}).`, "WARN");
        this._renderMeshWorldResult({ ok: false, reason });
    }

    // Weicher Pull-Timeout: pendingBundlePull räumt nur Vollständigkeit oder world-bundle-fail — ein
    // mitten im Chunk-Strom verschwundener Sender ließe den Pull ewig hängen. Läuft aus p2pTick;
    // nowMs injizierbar (Test deterministisch).
    _p2pCheckBundlePullTimeout(nowMs) {
        const p2p = this.state.p2p;
        const pend = p2p.pendingBundlePull;
        if (!pend) return;
        const now = typeof nowMs === "number" ? nowMs : Date.now();
        if (now - (pend.startedAt || 0) < AnazhRealm.P2P_BUNDLE_PULL_TIMEOUT_MS) return;
        // Zeitüberschreitung — den hängenden Pull + die Teil-Puffer dieses
        // Peers räumen, den Spieler informieren.
        p2p.pendingBundlePull = null;
        for (const [xid, xfer] of p2p.bundleXfers) {
            if (xfer && xfer.from === pend.peerId) p2p.bundleXfers.delete(xid);
        }
        this.log(`Welt-Bündel-Pull „${pend.worldId}" — Zeitüberschreitung, der Mitspieler antwortete nicht.`, "WARN");
        this._renderMeshWorldResult({ ok: false, reason: "timeout" });
    }

    // Browsbarer Welt-Katalog (Bibliothek-Drawer): jeder Peer annonciert seine vendorten Welten über
    // den soul-Kanal, gerendert als "Mitspieler X hat: …" mit Holen-Knopf. Schon vorhandene Welten
    // (id ODER Content-Hash) zeigen "✓ vorhanden".
    _renderMeshWorldCatalog() {
        if (typeof document === "undefined") return;
        const host = document.getElementById("mesh-world-catalog");
        if (!host) return;
        const peers = Array.from(this.state.p2p.peers.entries());
        const cw = this.state.customWorlds || {};
        // Signatur: Peers + ihre Kataloge + meine Bibliothek (für die Dedup-
        // Marken) — nur bei echter Änderung neu rendern.
        const peerSig = peers
            .map(
                ([pid, p]) =>
                    pid +
                    ":" +
                    (p.avatarName || "") +
                    ":" +
                    (p.catalog || [])
                        .map(
                            (w) =>
                                w.id +
                                w.hash +
                                (w.multiplayer ? "M" : "") +
                                (w.coPresence ? "K" : "") +
                                (w.serverMode === "js-compute" ? "J" : "")
                        )
                        .join(",")
            )
            .join("|");
        const mineSig = Object.keys(cw)
            .map((k) => k + (cw[k] && cw[k].bundleHash ? cw[k].bundleHash : ""))
            .sort()
            .join(",");
        const sig = peerSig + "##" + mineSig;
        if (host.dataset.sig === sig) return;
        host.dataset.sig = sig;
        host.textContent = "";
        const withWorlds = peers.filter(([, p]) => Array.isArray(p.catalog) && p.catalog.length);
        if (!withWorlds.length) {
            const empty = document.createElement("div");
            empty.className = "drawer-hint";
            empty.textContent =
                "Kein Mitspieler hat eine Welt zu teilen — vendorte Welten erscheinen, sobald ein Mitspieler im Mesh-Raum eine hat.";
            host.appendChild(empty);
            return;
        }
        for (const [pid, peer] of withWorlds) {
            const group = document.createElement("div");
            group.className = "mesh-catalog-peer";
            const head = document.createElement("div");
            head.className = "mesh-catalog-peer-name";
            head.textContent = (peer.avatarName || "Mitspieler") + " · " + pid.slice(0, 8);
            group.appendChild(head);
            for (const w of peer.catalog) {
                const row = document.createElement("div");
                row.className = "mesh-catalog-row";
                const name = document.createElement("span");
                name.className = "mesh-catalog-world";
                name.textContent = w.label || w.id;
                name.title = "id: " + w.id + (w.hash ? " · Hash " + w.hash.slice(0, 12) + "…" : "");
                row.appendChild(name);
                // W17 — eine Multiplayer-Welt im Katalog kenntlich machen;
                // W17 P-Vendor — eine js-compute-Welt zusätzlich markieren.
                if (w.multiplayer === true) {
                    const mp = document.createElement("span");
                    mp.className = "library-mp-mark";
                    const jsCompute = w.serverMode === "js-compute";
                    mp.textContent = jsCompute ? "Multiplayer · JS-Compute" : "Multiplayer";
                    mp.title = jsCompute
                        ? "Eine Gruppe taucht gemeinsam ein; ein Peer wird Compute-Host für die autoritative Server-JS."
                        : "Eine Gruppe kann gemeinsam durch das Tor dieser Welt eintreten.";
                    row.appendChild(mp);
                }
                // W18-B — eine Ko-Präsenz-Welt im Katalog kenntlich machen:
                // AnazhRealm injiziert die Augen (ihr seht euch drinnen).
                if (w.coPresence === true) {
                    const cp = document.createElement("span");
                    cp.className = "library-mp-mark";
                    cp.textContent = "Ko-Präsenz";
                    cp.title =
                        "Ihr seht euch in dieser Welt — AnazhRealm trägt die Posen übers Mesh, die Welt rendert die Gefährten.";
                    row.appendChild(cp);
                }
                if (this._haveWorldByHashOrId(w.id, w.hash)) {
                    const have = document.createElement("span");
                    have.className = "mesh-catalog-have";
                    have.textContent = "✓ vorhanden";
                    row.appendChild(have);
                } else {
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.textContent = "Holen";
                    btn.dataset.meshWorld = w.id;
                    btn.dataset.meshPeer = pid;
                    // W16-Politur — der Katalog-Hash reist zum Pull mit, damit
                    // der Empfänger das empfangene Bündel gegen ihn prüfen kann.
                    btn.dataset.meshHash = typeof w.hash === "string" ? w.hash : "";
                    row.appendChild(btn);
                }
                group.appendChild(row);
            }
            host.appendChild(group);
        }
    }

    // W16 — das Ergebnis eines Mesh-Welt-Holens anzeigen.
    _renderMeshWorldResult(res) {
        if (typeof document === "undefined") return;
        const status = document.getElementById("mesh-world-status");
        if (!status) return;
        if (res && res.ok) {
            status.textContent = `✓ „${res.label || res.id}" über das Mesh geholt — siehe „Welten" unten.`;
            status.className = "vendor-status";
        } else {
            status.textContent = this._meshWorldReasonText(res ? res.reason : "Fehler");
            status.className = "vendor-status vendor-status-error";
        }
    }

    _meshWorldReasonText(reason) {
        const map = {
            invalid_world_id: "Ungültige Welt-id (a-z 0-9 - _, 1-40 Zeichen).",
            already_have: "Diese Welt hast du schon in deiner Bibliothek.",
            no_such_peer: "Dieser Mitspieler ist nicht mehr verbunden.",
            no_channel: "Zu diesem Mitspieler steht keine Mesh-Verbindung.",
            send_failed: "Die Anfrage konnte nicht gesendet werden.",
            not_found: "Dieser Mitspieler hat diese Welt nicht.",
            unavailable: "Der Mitspieler konnte die Welt nicht liefern.",
            timeout: "Zeitüberschreitung — der Mitspieler antwortete nicht. Versuch es erneut.",
            hash_mismatch: "Das empfangene Bündel stimmt nicht mit dem Katalog überein — verworfen.",
        };
        return map[reason] || `Konnte die Welt nicht über das Mesh holen (${reason || "Fehler"}).`;
    }

    // W16 Phase 2 — der Holen-Knopf einer Katalog-Zeile. worldId + peerId
    // kommen aus den data-Attributen des Knopfes; das Ergebnis kommt asynchron
    // über _renderMeshWorldResult. Liefert das Sofort-Ergebnis (für Tests).
    _runMeshWorldGet(worldId, peerId, expectedHash) {
        const res = this.requestWorldBundleFromPeer(worldId, peerId, expectedHash);
        if (typeof document !== "undefined") {
            const status = document.getElementById("mesh-world-status");
            if (status) {
                if (res.ok) {
                    status.textContent = `Frage „${res.worldId}" beim Mitspieler an …`;
                    status.className = "vendor-status";
                } else {
                    this._renderMeshWorldResult(res);
                }
            }
        }
        return res;
    }

    // W16 Phase 2 — den Welt-Katalog verkabeln. Ein delegierter Klick-Listener
    // am bleibenden Container fängt jeden Holen-Knopf (auch nach jedem Re-
    // Render — V8.37-Lehre: keine pro-Knopf-Listener, die ein Re-Render frisst).
    meshWorldInitDOM() {
        if (typeof document === "undefined") return;
        this._renderMeshWorldCatalog();
        const host = document.getElementById("mesh-world-catalog");
        if (host && host.dataset.wired !== "1") {
            host.dataset.wired = "1";
            host.addEventListener("click", (ev) => {
                const btn = ev.target && ev.target.closest("button[data-mesh-world]");
                if (!btn) return;
                this._runMeshWorldGet(btn.dataset.meshWorld, btn.dataset.meshPeer, btn.dataset.meshHash);
            });
        }
    }

    // ── W7 Phase 3 — LLM-Pool: eine LLM-Stimme über das Mesh teilen ──

    // Habe ich ein nutzbares eigenes LLM (Provider aktiv + ggf. Key)?
    _p2pVoiceCapable() {
        const llm = this.state.llm;
        if (!llm || !llm.enabled) return false;
        const defs = this.llmProviderDefs();
        const def = defs[llm.provider];
        if (!def) return false;
        const cfg = llm.providerConfig[llm.provider];
        return !def.requiresKey || !!(cfg && cfg.apiKey);
    }

    // Opt-in: meine Stimme teilen (nur sinnvoll, wenn ich ein LLM habe).
    setVoiceShared(on) {
        const want = !!on && this._p2pVoiceCapable();
        this.state.p2p.voiceShared = want;
        try {
            localStorage.setItem("anazh.p2p.voiceShared", want ? "1" : "0");
        } catch {
            /* defensive */
        }
        // Den Mitspielern den neuen Stand mitteilen (soul trägt voiceShared).
        if (this.state.p2p.enabled) this._p2pBroadcastSoul();
        this.p2pUpdateStatus();
        return want;
    }

    // Einen verbundenen Peer finden, der seine Stimme teilt + einen offenen
    // Kanal hat.
    _p2pFindVoicePeer() {
        const p2p = this.state.p2p;
        for (const [pid, entry] of p2p.peers) {
            if (!entry || !entry.voiceShared) continue;
            const rtc = p2p.rtcPeers.get(pid);
            if (rtc && rtc.open) return pid;
        }
        return null;
    }

    // Steht eine geteilte Stimme bereit, die ich nutzen könnte? (Mesh steht,
    // ein Peer teilt, ich selbst habe KEIN eigenes aktives LLM.)
    _p2pVoiceAvailable() {
        if (this._p2pVoiceCapable()) return false;
        if (!this._p2pMeshReady()) return false;
        return this._p2pFindVoicePeer() !== null;
    }

    // Eine Chat-Anfrage über die geteilte Stimme eines Peers schicken.
    _p2pRequestSharedVoice(prompt, appendChatOutput) {
        const p2p = this.state.p2p;
        const peerId = this._p2pFindVoicePeer();
        if (!peerId) {
            if (appendChatOutput) appendChatOutput("(Keine geteilte Stimme verfügbar.)");
            return { ok: false, reason: "no_voice" };
        }
        const reqId = "v-" + p2p.peerId + "-" + p2p._voiceReqSeq++;
        const sent = this._p2pSendChannelTo(peerId, {
            type: "llm-request",
            reqId,
            prompt: String(prompt || "").slice(0, AnazhRealm.P2P_VOICE_PROMPT_MAX),
        });
        if (!sent) {
            if (appendChatOutput) appendChatOutput("(Geteilte Stimme nicht erreichbar.)");
            return { ok: false, reason: "send_failed" };
        }
        const timeout = setTimeout(() => {
            const pending = p2p._voiceRequests.get(reqId);
            if (!pending) return;
            p2p._voiceRequests.delete(reqId);
            if (pending.cb) pending.cb("(Geteilte Stimme schweigt — Zeitüberschreitung.)");
        }, AnazhRealm.P2P_VOICE_TIMEOUT_MS);
        p2p._voiceRequests.set(reqId, { cb: appendChatOutput, timeout, peerId });
        if (appendChatOutput) appendChatOutput("Geteilte Stimme denkt nach…");
        return { ok: true, reqId, peerId };
    }

    // Ich bin der Teiler: eine eingehende llm-request beantworten.
    async _p2pHandleLlmRequest(peerId, msg) {
        const p2p = this.state.p2p;
        const reqId = msg && msg.reqId;
        if (typeof reqId !== "string") return;
        const respond = (payload) => this._p2pSendChannelTo(peerId, { type: "llm-response", reqId, ...payload });
        // Opt-in-Wand: nur antworten, wenn ich wirklich teile + ein LLM habe.
        if (!p2p.voiceShared || !this._p2pVoiceCapable()) {
            respond({ error: "not_sharing" });
            return;
        }
        // Rate-Limit pro anfragendem Peer — ein fremder Prompt kostet meine Token; an der Tür (`llmCall`) ist er ein Ruf im
        // Hintergrund: die Ruhe-Lücke gilt, der eigene Spieler hat Vorrang. Sentinel "noch nie
        // bedient" = -Infinity, NICHT 0 — sonst wäre jede Anfrage in den ersten COOLDOWN-ms rate-limited.
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        const last = p2p._voiceServedAt.has(peerId) ? p2p._voiceServedAt.get(peerId) : -Infinity;
        if (now - last < AnazhRealm.P2P_VOICE_COOLDOWN_MS) {
            respond({ error: "rate_limited" });
            return;
        }
        p2p._voiceServedAt.set(peerId, now);
        const prompt = String((msg && msg.prompt) || "").slice(0, AnazhRealm.P2P_VOICE_PROMPT_MAX);
        if (!prompt) {
            respond({ error: "empty_prompt" });
            return;
        }
        this.log(`Geteilte Stimme: Anfrage von ${peerId.slice(0, 12)}… wird beantwortet`, "INFO");
        let reply;
        try {
            reply = await this.llmCall(prompt, null, { hintergrund: true });
        } catch (err) {
            reply = { error: (err && err.message) || "LLM-Fehler" };
        }
        if (reply && reply.error) {
            respond({ error: reply.error });
            return;
        }
        respond({ say: reply && reply.say ? String(reply.say) : "", program: (reply && reply.program) || null });
    }

    // Ich bin der Anfrager: die Antwort der geteilten Stimme empfangen.
    _p2pHandleLlmResponse(peerId, msg) {
        const p2p = this.state.p2p;
        const reqId = msg && msg.reqId;
        const pending = typeof reqId === "string" ? p2p._voiceRequests.get(reqId) : null;
        if (!pending) return; // unbekannt / Timeout schon abgelaufen
        // Nur vom Peer annehmen, an den ich die Anfrage geschickt habe.
        if (pending.peerId !== peerId) return;
        p2p._voiceRequests.delete(reqId);
        if (pending.timeout) clearTimeout(pending.timeout);
        const cb = pending.cb;
        if (msg.error) {
            const human =
                {
                    not_sharing: "Der Peer teilt seine Stimme nicht mehr.",
                    rate_limited: "Geteilte Stimme gerade beschäftigt — kurze Pause.",
                    empty_prompt: "Leere Anfrage.",
                }[msg.error] || msg.error;
            if (cb) cb(`(Geteilte Stimme: ${human})`);
            return;
        }
        if (cb && msg.say) cb(`Geteilte Stimme: ${msg.say}`);
        // Das DSL-Programm läuft durch DIESELBE Sandbox wie das eigene LLM
        // (source ≠ human → kein Re-Broadcast; es ist meine lokale Welt-
        // Reaktion). dslRun ist die Vertrauens-Wand, wie beim eigenen LLM.
        if (Array.isArray(msg.program) && msg.program.length > 0 && typeof this.dslRun === "function") {
            try {
                const result = this.dslRun(msg.program, { source: "remote-voice" });
                if (cb && result) {
                    const weicht = this._ergebnisSatz(result.log);
                    if (weicht) cb(`(Geteilte Stimme: ${weicht.satz})`);
                    else if (result.ok) cb(`(Welt verändert: ${JSON.stringify(msg.program).slice(0, 140)})`);
                }
            } catch {
                /* Sandbox-Fehler schweigend — der say-Text steht schon */
            }
        }
    }

    // ── W7 Phase 4 — Public-Lobby: Räume browsbar machen ──

    // Den eigenen Raum öffentlich in die Lobby stellen (Opt-in).
    publishToLobby(label) {
        const p2p = this.state.p2p;
        if (!p2p.enabled || !p2p.connected) return { ok: false, reason: "not_connected" };
        const clean = String(label || "")
            .trim()
            .slice(0, 48);
        p2p.lobby.published = true;
        p2p.lobby.label = clean;
        this._p2pSignal({ type: "lobby-publish", label: clean });
        this.p2pUpdateStatus();
        return { ok: true };
    }

    unpublishFromLobby() {
        const p2p = this.state.p2p;
        p2p.lobby.published = false;
        if (p2p.enabled && p2p.connected) this._p2pSignal({ type: "lobby-unpublish" });
        this.p2pUpdateStatus();
        return { ok: true };
    }

    // Die Liste der veröffentlichten Räume anfordern (Antwort: lobby-rooms).
    requestLobbyList() {
        const p2p = this.state.p2p;
        if (!p2p.enabled || !p2p.connected) return { ok: false, reason: "not_connected" };
        this._p2pSignal({ type: "lobby-list" });
        return { ok: true };
    }

    // Einem Lobby-Raum beitreten: roomOverride setzen + neu verbinden.
    joinLobbyRoom(roomId) {
        const p2p = this.state.p2p;
        if (typeof roomId !== "string" || !roomId) return { ok: false, reason: "bad_room" };
        if (roomId === (p2p.roomOverride || (this.state.worldMeta && this.state.worldMeta.worldId))) {
            return { ok: false, reason: "already_here" };
        }
        p2p.roomOverride = roomId;
        this.p2pPersist();
        if (p2p.enabled) this.initP2PSync(null);
        this.p2pUpdateStatus();
        this.log(`Lobby: Raum ${roomId.slice(0, 12)}… beigetreten`, "INFO");
        return { ok: true };
    }

    // ── Kreatur-Sicht-Sync ──
    // Jeder Peer streamt SEINE Kreaturen; die anderen rendern sie als reine Sicht-Schicht (kein Sim,
    // keine Tasks, keine Physik). Sie liegen NICHT in state.creatures — updateCreatures ignoriert sie.

    _p2pBroadcastCreatures() {
        // jeder Leib im Bild: zuerst die Wesen, dann die Gefallenen (state.leichname — sie liegen, bis sie versunken sind)
        const W = this.state.creatures;
        const LG = this.state.leichname;
        const list = [];
        for (let i = 0; i < W.length + LG.length && list.length < 40; i++) {
            const tot = i >= W.length;
            const c = tot ? LG[i - W.length] : W[i];
            if (!c || !c.position) continue;
            const e = {
                id: (c.userData && c.userData.netId) || "i" + i,
                x: +c.position.x.toFixed(2),
                y: +c.position.y.toFixed(2),
                z: +c.position.z.toFixed(2),
                yaw: +((c.rotation && c.rotation.y) || 0).toFixed(2),
                soul: (c.userData && c.userData.soul) || "wesen",
            };
            // DER LEICHNAM REIST MIT SEINER LAGE (Welle LF kampf Nachbesserung 3): die Quaternion des Kipp-Takts
            // (_tickLeichname) — die Kopie liegt, wie der Leib beim Sender liegt, und sinkt liegend. Vorher reiste nur die
            // Gier: die Kopie beim Mitspieler stand die 90 s des Leichnams aufrecht (oben·y 1,00 gegen 0,12 beim Sender).
            if (tot) {
                const q = c.quaternion;
                e.q = [+q.x.toFixed(3), +q.y.toFixed(3), +q.z.toFixed(3), +q.w.toFixed(3)];
            }
            list.push(e);
        }
        this.p2pSend({ type: "creature-pos", list });
    }

    _p2pHandleCreaturePos(peerId, msg) {
        const remote = this.state.p2p.remoteCreatures;
        const list = Array.isArray(msg.list) ? msg.list : [];
        const seen = new Set();
        for (const e of list) {
            if (!e || typeof e.id !== "string") continue;
            const key = peerId + ":" + e.id;
            seen.add(key);
            // Ein Ort aus dem Draht ohne Zahl ist kein Ort (NaN reist als null, bis hierher `+e.x || 0`): keine
            // Sicht-Kopie im Ursprung, eine bestehende hält ihr letztes Ziel.
            const ex = this._fremdeZahl(e.x);
            const ey = this._fremdeZahl(e.y);
            const ez = this._fremdeZahl(e.z);
            if (!Number.isFinite(ex) || !Number.isFinite(ey) || !Number.isFinite(ez)) continue;
            let rc = remote.get(key);
            if (!rc) {
                const mesh = this._buildCreatureGroup(typeof e.soul === "string" ? e.soul : "wesen");
                if (!mesh) continue;
                // S7 — die Sicht-Kopie trägt die Körpergröße des Originals (aus seiner netId
                // = e.id deterministisch abgeleitet → derselbe Wuchs wie beim Sender, ohne ein
                // eigenes Sync-Feld; der gewachsene Wald-Disziplin Γ5 treu).
                const _peerBs = this._creatureBodySize(e.id);
                mesh.scale.setScalar(_peerBs);
                mesh.position.set(ex, ey, ez);
                // die Kopie trägt kein Feld (kein Ziegel): ihr Nah-Kreis ist das Feld des Stufen-Gesetzes (`_kreaturNah`)
                mesh.userData._kopie = true;
                if (this.state.scene) this.state.scene.add(mesh);
                rc = { mesh, peerId };
                remote.set(key, rc);
            }
            rc.tx = ex;
            rc.ty = ey;
            rc.tz = ez;
            const eyaw = this._fremdeZahl(e.yaw);
            rc.tyaw = Number.isFinite(eyaw) ? eyaw : rc.tyaw || 0;
            // die Lage eines Gefallenen (fremdes Datum: nur vier endliche Zahlen gelten)
            rc.tq = Array.isArray(e.q) && e.q.length === 4 && e.q.every((v) => Number.isFinite(v)) ? e.q : null;
        }
        // Reconcile: jede creature-pos-Nachricht ist die VOLLE Liste dieses
        // Peers — Sicht-Kopien, die nicht mehr darin stehen, sind tot.
        for (const [key, rc] of remote) {
            if (rc.peerId === peerId && !seen.has(key)) this._disposeRemoteCreature(key, rc);
        }
    }

    _p2pTickRemoteCreatures(t, dt) {
        const remote = this.state.p2p.remoteCreatures;
        if (!remote.size) return;
        const k = Math.min(1, (dt || 0.016) * 12); // sanftes Nachziehen
        const TAU = Math.PI * 2;
        const auge = this._lodAuge(); // das Auge der Stufen, EINMAL je Takt
        for (const rc of remote.values()) {
            const m = rc.mesh;
            if (!m) continue;
            const x0 = m.position.x,
                z0 = m.position.z;
            m.position.x += ((rc.tx || 0) - m.position.x) * k;
            m.position.z += ((rc.tz || 0) - m.position.z) * k;
            // DIE SICHT DER KOPIE (die EINE Wahl jedes Leibs im Bild, _leibSicht): die Stufe nach dem Abstand vom Auge der Stufen
            // am EINEN Schalter der Gelenk-Gestalt (`_gelenkStufe`), lebend wie gefallen — vorher trug jede Kopie in jeder Ferne
            // die volle Gestalt (Tod-Zensus: der Leichnam des Mitspielers lag auf 40 m als Gestalt, nie als Grobstufe).
            const fern = this._leibSicht(m, this.isInFrustum(m), auge);
            // DER LEICHNAM liegt still: die Kopie dreht auf die Lage des Senders nach (rc.tq) — kein Atem, kein Gang
            if (rc.tq) {
                if (m.userData._satz) this._tierSatzAus(m);
                m.position.y += ((rc.ty || 0) - m.position.y) * k;
                const q = this._p2pLageQ || (this._p2pLageQ = new THREE.Quaternion());
                m.quaternion.slerp(q.set(rc.tq[0], rc.tq[1], rc.tq[2], rc.tq[3]).normalize(), k);
                continue;
            }
            m.position.y += ((rc.ty || 0) - m.position.y) * k + Math.sin(t * 2 + m.position.x) * 0.002;
            // DIE SICHT-KOPIE GEHT (Q3): die Gier des Senders (der Steuer-Schritt schreibt sie, der Strom trägt sie) zieht
            // auf dem kurzen Bogen nach, und der Gang läuft durch denselben Chokepoint wie beim Sender (der Baum-Gang
            // misst sein Tempo selbst an der Lage). Vorher: Gier 0 vom Sender, kein Gang — die Kopie glitt.
            if (m.rotation) {
                let dg = (rc.tyaw || 0) - m.rotation.y;
                dg -= TAU * Math.round(dg / TAU);
                m.rotation.y += dg * k;
            }
            const sp = dt > 0 ? Math.hypot(m.position.x - x0, m.position.z - z0) / dt : 0;
            // Kosten am Schirm: jenseits der Stufen-Grenze (`ab` × Größe aus der Kern-Zeile, die Stufe aus _leibSicht oben)
            // trägt die Grobstufe das Bild und der Gang ruht.
            // im Satz (`_tickTierSatz`, dieselbe Menge wie die eigenen Tiere) geht der Satz: sein Weg rückt die Phase
            if (m.userData._satz) this._tierSatzGang(m, dt);
            else if (!fern && m.userData && m.userData._tierBaum) {
                const ud = m.userData;
                ud.walkPhase = (ud.walkPhase || 0) + (sp > 0.1 ? (dt || 0) * 5.0 : 0);
                this._animateCompoundMotion(m, null, t, ud.walkPhase, sp > 0.1, null);
            }
        }
    }

    _disposeRemoteCreature(key, rc) {
        if (rc && rc.mesh) {
            if (this.state.scene) this.state.scene.remove(rc.mesh);
            if (typeof this._disposeSoulGroup === "function") this._disposeSoulGroup(rc.mesh);
        }
        this.state.p2p.remoteCreatures.delete(key);
    }

    // W7 Phase 1: gepufferte ICE-Kandidaten anwenden, sobald die
    // Remote-Description gesetzt ist (addIceCandidate davor wirft).
    _p2pDrainIce(rtc, peerId) {
        if (!rtc || !rtc.pendingIce.length) return;
        const pending = rtc.pendingIce.splice(0);
        for (const cand of pending) {
            rtc.pc
                .addIceCandidate(cand)
                .catch((err) => this.log(`RTC ICE-Kandidat von ${peerId} verworfen: ${err.message}`, "WARN"));
        }
    }

    _p2pCloseRtcPeer(peerId) {
        const rtc = this.state.p2p.rtcPeers.get(peerId);
        if (!rtc) return;
        // RECONNECT #2 — ein geplanter Heil-Versuch stirbt mit dem Peer.
        if (rtc.healTimer) {
            clearTimeout(rtc.healTimer);
            rtc.healTimer = null;
        }
        try {
            if (rtc.channel) rtc.channel.close();
        } catch {
            /* defensive */
        }
        try {
            rtc.pc.close();
        } catch {
            /* defensive */
        }
        this.state.p2p.rtcPeers.delete(peerId);
        this._p2pUpdateMeshActive();
    }

    // Mesh-Router = Dispatch-Table: AnazhRealm.P2P_MESSAGE_HANDLERS mappt den Typ auf einen
    // `_p2pMsg<Type>`-Methodennamen (Präfix, weil `_p2pHandle*` schon Worker benennt). Kanal-exklusive
    // Typen (world-pull, llm-request, subworld-srv, …) leben in _p2pHandleChannelMessage.
    p2pHandleMessage(raw) {
        let msg;
        try {
            msg = JSON.parse(raw);
        } catch {
            return;
        }
        if (!msg || typeof msg !== "object") return;
        const handlerName = AnazhRealm.P2P_MESSAGE_HANDLERS[msg.type];
        // typeof-Wache: ein Müll-Typ (etwa "__proto__") liefert über das Objekt-Literal die
        // Prototype-Kette statt undefined — der String-Check no-oppt ihn.
        if (typeof handlerName === "string") {
            this[handlerName](msg, this.state.p2p);
        }
    }

    _p2pMsgWelcome(msg, p2p) {
        if (Array.isArray(msg.peers)) {
            for (const pid of msg.peers) {
                if (typeof pid === "string" && pid !== p2p.peerId) {
                    this._p2pEnsurePeerEntry(pid);
                    // W7 Phase 1 — WebRTC-Verbindung zu jedem schon
                    // anwesenden Peer aufbauen.
                    this._p2pConnectToPeer(pid);
                }
            }
        }
        // Der Server schickt seine LAN-Adressen, damit Host-Clients die Einladungs-URL ohne IP-Frage
        // bauen; bei mehreren Interfaces die erste (typisch das primäre).
        if (Array.isArray(msg.lanAddresses)) {
            p2p.lanAddresses = msg.lanAddresses.filter((a) => typeof a === "string");
        }
        // Falls wir gerade als Host aktiv sind: den Host-Banner neu rendern (der Raum steht).
        if (p2p.role === "host" && typeof this.updateWorldInfo === "function") {
            this.updateWorldInfo();
        }
        // Ring 11 V3 — den bereits anwesenden Peers meine Seele zeigen.
        this._p2pBroadcastSoul();
        // W13 Phase 3 — und meine Vibe-Pass-Identität (beweisbar).
        this._p2pBroadcastVibe();
        // M8 (V18.161) — das MAKRO-FENSTER: die Knoten-Gesamtzahl anfragen
        // (über den BESTEHENDEN WS-Kanal — kein neuer HTTP-Pfad, keine CSP-Tür).
        if (typeof this.p2pSend === "function") this.p2pSend({ type: "stats" });
    }

    // M8 (V18.161) — die Broker-Antwort: Räume + Spieler an DIESEM Knoten.
    // Gecacht + im Multi-User-Bereich sichtbar (Vision-Mechanik sichtbar,
    // V9.95-c — der Schöpfer sieht das Makrosystem, nicht nur den Raum).
    _p2pMsgStats(msg, p2p) {
        const rooms = this._fremdeZahl(msg.rooms);
        const peers = this._fremdeZahl(msg.peers);
        if (!Number.isFinite(rooms) || !Number.isFinite(peers)) return;
        p2p.brokerStats = { rooms, peers, at: Date.now() };
        if (typeof document !== "undefined") {
            const el = document.getElementById("p2p-broker-stats");
            if (el) el.textContent = `Knoten: ${peers} online in ${rooms} ${rooms === 1 ? "Raum" : "Räumen"}`;
        }
    }

    _p2pMsgPeerJoin(msg, p2p) {
        if (typeof msg.peerId === "string" && msg.peerId !== p2p.peerId) {
            this._p2pEnsurePeerEntry(msg.peerId);
            // W7 Phase 1 — WebRTC-Verbindung zum Neuankömmling aufbauen.
            this._p2pConnectToPeer(msg.peerId);
            // Ring 11 V3 — dem Neuankömmling meine Seele zeigen.
            this._p2pBroadcastSoul();
            // W13 Phase 3 — und meine Vibe-Pass-Identität.
            this._p2pBroadcastVibe();
        }
    }

    _p2pMsgPeerLeave(msg) {
        if (typeof msg.peerId === "string") this._p2pRemovePeer(msg.peerId);
    }

    _p2pMsgLobbyRooms(msg, p2p) {
        // W7 Phase 4 — die Lobby-Liste vom Server.
        p2p.lobby.rooms = Array.isArray(msg.rooms) ? msg.rooms : [];
        if (typeof this._renderLobbyUI === "function") this._renderLobbyUI();
    }

    // Anwesenheits-Antwort vom Broker: aktualisiert den presence-Cache, die Welt-Karte liest ihn beim
    // nächsten Render. Kein Auto-Broadcast — requestWorldPresence hat explizit gefragt (Privatheit).
    _p2pMsgWorldPresence(msg, p2p) {
        const worldId = typeof msg.worldId === "string" ? msg.worldId : "";
        if (!worldId) return;
        const regions = Array.isArray(msg.regions)
            ? msg.regions
                  .filter((r) => r && typeof r.region === "string" && typeof r.peers === "number")
                  .map((r) => ({ region: r.region, peers: Math.max(0, Math.floor(r.peers)) }))
            : [];
        p2p.presence.set(worldId, { fetchedAt: Date.now(), regions });
        if (typeof this._uiDirty === "function") this._uiDirty("bibliothek");
    }

    // Φ4 — die ANFRAGE: regionale Köpfe einer bestimmten Welt vom Broker
    // holen. Opt-in pro Welt — keine automatischen Polls. Liefert true wenn
    // die Anfrage rausging, false wenn p2p nicht verbunden.
    requestWorldPresence(worldId) {
        const w = String(worldId || "").trim();
        if (!w) return false;
        const p2p = this.state.p2p;
        if (!p2p || !p2p.enabled || !p2p.connected) return false;
        this._p2pSignal({ type: "world-presence", worldId: w });
        return true;
    }

    // Φ4 — die LESE-API für UI/Tests: was wissen wir über die Anwesenheit
    // in dieser Welt? Liefert {regions: [{region, peers}], totalPeers,
    // fetchedAt} oder null wenn noch nie gepollt.
    worldPresence(worldId) {
        const p2p = this.state.p2p;
        if (!p2p || !p2p.presence) return null;
        const entry = p2p.presence.get(String(worldId || ""));
        if (!entry) return null;
        const total = entry.regions.reduce((s, r) => s + r.peers, 0);
        return { regions: entry.regions.slice(), totalPeers: total, fetchedAt: entry.fetchedAt };
    }

    // Das EINE per-Peer-Raten-Tor: deckelt Nachrichten je Sekunde JE PEER JE Kanal (`bucket`), damit
    // ein flutender Peer den Main-Thread nicht würgt. Überschuss fällt still (transport-seitig, kein
    // State-Unterschied → Determinismus unberührt). true = admittiert.
    _p2pPeerRateAdmit(bucket, peerId, maxPerSec) {
        if (typeof peerId !== "string") return false;
        if (!this._p2pRate) this._p2pRate = {};
        let m = this._p2pRate[bucket];
        if (!m) {
            m = new Map();
            this._p2pRate[bucket] = m;
        }
        const now = performance.now();
        let win = m.get(peerId);
        if (!win || now - win.start > 1000) {
            win = { start: now, n: 0 };
            m.set(peerId, win);
        }
        return ++win.n <= maxPerSec;
    }

    _p2pMsgCreaturePos(msg, p2p) {
        // Kreatur-Positionen eines Mitspielers. Raten-Cap je Peer (_p2pPeerRateAdmit, max 10/s):
        // Überschuss fällt still — die nächste Nachricht trägt ohnehin die VOLLE Liste.
        if (typeof msg.peerId === "string" && msg.peerId !== p2p.peerId) {
            if (!this._p2pPeerRateAdmit("creature-pos", msg.peerId, 10)) return;
            this._p2pHandleCreaturePos(msg.peerId, msg);
        }
    }

    _p2pMsgCompanionSay(msg, p2p) {
        // W11 Phase 4 — Voice-Sync: der Begleiter-Output eines Mitspielers.
        if (typeof msg.peerId === "string" && msg.peerId !== p2p.peerId) {
            this._p2pHandleCompanionSay(msg.peerId, msg);
        }
    }

    _p2pMsgSubworldNet(msg, p2p) {
        // Sub-Welt-Verkehr eines Mitspielers: _portalNetDeliver stellt nur ins eigene iframe zu, wenn ich im
        // SELBEN Multiplayer-Portal bin (worldId-Pfad-Match) — sonst sähe ein Mitspieler fremden Verkehr.
        // Raten-Cap je Peer: der Sender deckelt sich bei 120/s, ein böswilliger Peer ignoriert das.
        if (typeof msg.peerId === "string" && msg.peerId !== p2p.peerId) {
            if (!this._p2pPeerRateAdmit("subworld-net", msg.peerId, AnazhRealm.SUBWORLD_NET_PEER_RATE_MAX)) return;
            this._portalNetDeliver(msg);
        }
    }

    _p2pMsgSubworldPose(msg, p2p) {
        // Pose eines Gefährten in DERSELBEN Ko-Präsenz-Sub-Welt; der Raten-Cap je Peer schützt das iframe.
        // _portalPoseDeliver prüft den worldId-Match + säubert die Pose.
        if (typeof msg.peerId === "string" && msg.peerId !== p2p.peerId) {
            if (!this._p2pPeerRateAdmit("subworld-pose", msg.peerId, AnazhRealm.SUBWORLD_POSE_PEER_RATE_MAX)) return;
            this._portalPoseDeliver(msg.peerId, msg);
        }
    }

    _p2pMsgPortalInvite(msg, p2p) {
        // W17 Phase C — ein Mitspieler öffnete ein Multiplayer-Portal und
        // lädt die Gruppe ein. _p2pHandlePortalInvite zeigt den Prompt.
        if (typeof msg.peerId === "string" && msg.peerId !== p2p.peerId) {
            this._p2pHandlePortalInvite(msg.peerId, msg);
        }
    }

    _p2pMsgPos(msg, p2p) {
        const pid = msg.peerId;
        if (typeof pid !== "string" || pid === p2p.peerId) return;
        this._weltUhrNimm(this._fremdeZahl(msg.w));
        const entry = this._p2pEnsurePeerEntry(pid);
        // Ein Ort aus dem Draht ohne Zahl ist kein Ort (NaN reist als null): der ortlos geborene Mitspieler bleibt ohne
        // Ort und unsichtbar, statt in den Ursprung zu springen.
        const x = this._fremdeZahl(msg.x);
        const y = this._fremdeZahl(msg.y);
        const z = this._fremdeZahl(msg.z);
        const yaw = this._fremdeZahl(msg.yaw);
        if (![x, y, z, yaw].every(Number.isFinite)) return;
        const nowMs = performance.now();
        // Lockstep: treibt der Ghost diesen Peer (frisch gesteppt), wird pos zur AUTORITÄT des
        // Drift-Wächters, statt die glatte Ghost-Bewegung mit 30-Hz-Snaps zu überschreiben. Die EINE
        // Frische-Frage lebt in _p2pLockstepDrives (liest auch der Snap-Sampler).
        if (this._p2pLockstepDrives(entry, nowMs)) {
            const ls = entry.lockstep;
            ls.authX = x;
            ls.authY = y;
            ls.authZ = z;
            // Der Ghost fährt — alte Snaps sind Geschichte (kein Misch-Render
            // beim späteren Rückfall; der Puffer füllt sich dann frisch).
            if (entry.snapBuf && entry.snapBuf.length) entry.snapBuf.length = 0;
            return;
        }
        // Ring 11 V3 — Bewegungs-Erkennung für die Peer-Animation: ein
        // spürbarer Positions-Sprung markiert "in Bewegung" für 0.25 s
        // (_p2pUpdatePeer leitet daraus den Geh-/Schwimm-Zyklus ab).
        if (Math.hypot(x - entry.x, z - entry.z) > 0.015) {
            entry.lastMovedAt = nowMs / 1000;
        }
        // Snapshot-Puffer (Valve-Source-Muster): der rohe 30-Hz-Snap landet mit Empfangszeit im bounded
        // Puffer; _p2pSampleSnapBuf blickt fest P2P_SNAP_INTERP_DELAY_MS zurück und interpoliert.
        // NUR der Nicht-Lockstep-Pfad — der Lockstep-Ghost oben bleibt unberührt.
        if (!entry.snapBuf) entry.snapBuf = [];
        entry.snapBuf.push({ t: nowMs, x, y, z, yaw });
        const over = entry.snapBuf.length - AnazhRealm.P2P_SNAP_BUF_MAX;
        if (over > 0) entry.snapBuf.splice(0, over);
        // Das Direkt-Schreiben bleibt der Fallback: unter 2 Snaps (Erst-
        // Kontakt) rendert _p2pUpdatePeer weiter die rohe letzte Position.
        entry.x = x;
        entry.y = y;
        entry.z = z;
        entry.yaw = yaw;
    }

    _p2pMsgDsl(msg, p2p) {
        // Eingehendes DSL-Programm eines Peers: STRENGE Sandbox — derselbe dslRun-Pfad mit identischen
        // Budget-Limits + Op-Whitelist. source="remote:<peerId>" verhindert den Re-Broadcast (Endlos-Echo).
        const pid = msg.peerId;
        if (typeof pid !== "string" || pid === p2p.peerId) return;
        if (!Array.isArray(msg.program) || msg.program.length === 0) return;
        try {
            this.dslRun(msg.program, { source: `remote:${pid}` });
        } catch (err) {
            this.log(`P2P-DSL Ausführungsfehler von ${pid}: ${err.message}`, "WARN");
        }
    }

    _p2pMsgSoul(msg, p2p) {
        // Soul-Sync: aus der Peer-Seele den Avatar bauen (die EINE Leib-Wahl `_leibDerSeele` in _p2pApplyPeerSoul).
        // KEIN DSL-Pfad — eine Peer-Seele ist Darstellung, keine Welt-Mutation.
        const pid = msg.peerId;
        if (typeof pid !== "string" || pid === p2p.peerId) return;
        const entry = this._p2pEnsurePeerEntry(pid);
        const soulName = typeof msg.soulName === "string" ? msg.soulName : "";
        if (!soulName) return;
        const changed = entry.soulName !== soulName;
        entry.soulName = soulName;
        entry.bodyParts = Array.isArray(msg.bodyParts) ? msg.bodyParts : null;
        if (typeof msg.name === "string" && msg.name.trim()) {
            const nm = msg.name.trim().slice(0, 48);
            if (entry.avatarName !== nm) {
                entry.avatarName = nm;
                this._p2pRefreshPeerNameLabel(entry);
            }
        }
        // W7 Phase 2 — Welt-Rolle des Peers merken (Resync-Ziel-Findung).
        if (typeof msg.worldRole === "string") entry.worldRole = msg.worldRole;
        // W7 Phase 3 — teilt der Peer seine Stimme?
        if (typeof msg.voiceShared === "boolean") entry.voiceShared = msg.voiceShared;
        // W18-D — wohnt der Peer in einer Fremd-Welt? Das Name-Schild zeigt
        // es („wohnt in …" — die Gefährten finden ihn dort).
        const dwellIn = typeof msg.dwell === "string" ? msg.dwell.trim().slice(0, 60) : "";
        if (dwellIn !== (entry.dwellingIn || "")) {
            entry.dwellingIn = dwellIn;
            this._p2pRefreshPeerNameLabel(entry);
        }
        // W16 Phase 2 — der Welt-Katalog des Peers (seine vendorten Welten).
        if (Array.isArray(msg.catalog)) {
            entry.catalog = this._p2pSanitizeCatalog(msg.catalog);
            this._renderMeshWorldCatalog();
        }
        // Die Avatar-Prägung des Senders: durch DENSELBEN Prüfer wie der Übergabe-Kanal (_studioWerkPruefen), als PER-PEER-
        // Wahrheit (entry.uebergabe, NICHT der eigene Prägungs-Speicher — jeder Spieler trägt seinen Avatar).
        // Ändert sie sich, wird der Peer-Avatar neu gegossen (auch bei gleichem soulName).
        let uebergabeChanged = false;
        const uK = msg.uebergabe && msg.uebergabe.koerper;
        const pU = uK ? this._studioWerkPruefen("koerper", AnazhRealm.KOERPER_HOST_RECIPE, uK) : null;
        const cleanU = pU && Object.keys(pU).length ? pU : null;
        const prevU = entry.uebergabe ? JSON.stringify(entry.uebergabe) : "";
        const nextU = cleanU ? JSON.stringify(cleanU) : "";
        if (prevU !== nextU) {
            entry.uebergabe = cleanU;
            uebergabeChanged = true;
        }
        if (changed || uebergabeChanged) this._p2pApplyPeerSoul(entry);
    }

    _p2pMsgVibe(msg, p2p) {
        // Vibe-Pass-Identität: vibePassId = behaupteter öffentlicher Schlüssel, proof = Signatur über die
        // peerId des Senders; verifiziert sie, IST der Peer dieser Schlüssel. Async — der Schlüssel-Wächter
        // im .then verwirft veraltete Läufe (Peer hat neu gesendet).
        const pid = msg.peerId;
        if (typeof pid !== "string" || pid === p2p.peerId) return;
        const entry = this._p2pEnsurePeerEntry(pid);
        const vibePassId = typeof msg.vibePassId === "string" ? msg.vibePassId : "";
        const proof = typeof msg.proof === "string" ? msg.proof : "";
        entry.vibePassId = vibePassId || null;
        entry.vibeVerified = false;
        const m = /^ed25519:([0-9a-f]{64})$/i.exec(vibePassId);
        if (m && proof) {
            this._vibeVerify(pid, proof, m[1]).then((ok) => {
                const cur = p2p.peers.get(pid);
                if (!cur || cur.vibePassId !== vibePassId) return;
                cur.vibeVerified = ok === true;
                this._p2pRefreshPeerNameLabel(cur);
            });
        }
        this._p2pRefreshPeerNameLabel(entry);
    }

    _p2pMsgRtcOffer(msg, p2p) {
        // W7 Phase 1 — eingehender WebRTC-Offer. Wir sind hier der
        // Nicht-Initiator: pc ggf. anlegen, Remote-Description setzen,
        // mit einem Answer zurück. Danach gepufferte ICE anwenden.
        const pid = msg.peerId;
        if (typeof pid !== "string" || pid === p2p.peerId || !msg.sdp) return;
        let rtc = p2p.rtcPeers.get(pid);
        if (!rtc) rtc = this._p2pCreatePeerConnection(pid);
        if (!rtc) return;
        rtc.pc
            .setRemoteDescription(msg.sdp)
            .then(() => {
                this._p2pDrainIce(rtc, pid);
                return rtc.pc.createAnswer();
            })
            .then((answer) => rtc.pc.setLocalDescription(answer))
            .then(() => {
                this._p2pSignal({ type: "rtc-answer", to: pid, sdp: rtc.pc.localDescription });
            })
            .catch((err) => this.log(`RTC-Answer an ${pid} fehlgeschlagen: ${err.message}`, "WARN"));
    }

    _p2pMsgRtcAnswer(msg, p2p) {
        // W7 Phase 1 — der Peer hat unseren Offer beantwortet.
        const pid = msg.peerId;
        if (typeof pid !== "string" || !msg.sdp) return;
        const rtc = p2p.rtcPeers.get(pid);
        if (!rtc) return;
        rtc.pc
            .setRemoteDescription(msg.sdp)
            .then(() => this._p2pDrainIce(rtc, pid))
            .catch((err) => this.log(`RTC setRemoteDescription(answer) von ${pid}: ${err.message}`, "WARN"));
    }

    _p2pMsgRtcIce(msg, p2p) {
        // W7 Phase 1 — ICE-Kandidat eines Peers. candidate=null ist
        // end-of-candidates (ignorieren). Vor gesetzter Remote-
        // Description puffern (addIceCandidate würde sonst werfen).
        const pid = msg.peerId;
        if (typeof pid !== "string") return;
        const rtc = p2p.rtcPeers.get(pid);
        if (!rtc || !msg.candidate) return;
        if (rtc.pc.remoteDescription && rtc.pc.remoteDescription.type) {
            rtc.pc
                .addIceCandidate(msg.candidate)
                .catch((err) => this.log(`RTC ICE-Kandidat von ${pid} verworfen: ${err.message}`, "WARN"));
        } else {
            rtc.pendingIce.push(msg.candidate);
        }
    }

    _p2pMsgWorldRequest(msg, p2p) {
        // Ein frischer Joiner bittet um den Welt-Snapshot. Nur Hosts antworten (Guests haben eine Kopie,
        // sonst kämen mehrere Snapshots); Solo-Welten teilen keinen Raum.
        const requesterId = msg.peerId;
        if (typeof requesterId !== "string" || requesterId === p2p.peerId) return;
        if (p2p.role !== "host") {
            // Mittragen: ein NICHT-Host mit gepinnter Welt antwortet auch (Host weg, Mitträger trägt). Ohne
            // Verzögerung — der Snapshot ist hash-signiert, der Joiner nimmt die erste valide Antwort.
            this._p2pMaybeServeAsCarrier(requesterId, msg);
            return;
        }
        // Hausrecht-Sieb VOR dem Snapshot: ein gebannter Peer bekommt KEINE Welt. Geprüft über die peerId
        // und den vibePass im p2p.peers-Entry (entry.vibePassId = "ed25519:<hex>", entry.vibeVerified).
        const peerEntry = p2p.peers && p2p.peers.get ? p2p.peers.get(requesterId) : null;
        const vibeKey =
            peerEntry && peerEntry.vibePassId && peerEntry.vibeVerified
                ? this._normalizePubKey(peerEntry.vibePassId)
                : null;
        if (this._isPeerBanned(requesterId, vibeKey)) {
            this.log(`Welt-Snapshot verweigert — Peer ${requesterId.slice(0, 8)}… gebannt`, "WARN");
            return;
        }
        const erbgutNein = AnazhRealm._erbgutTeilbar(this.state.worldMeta, msg);
        if (erbgutNein) {
            this.log(`Welt-Snapshot verweigert — Peer ${requesterId.slice(0, 8)}…: ${erbgutNein}`, "WARN");
            return;
        }
        try {
            const snapshot = this.buildStateSnapshot();
            this._p2pSignal({ type: "world-snapshot", to: requesterId, state: snapshot });
            this.log(`Welt-Snapshot an Joiner ${requesterId.slice(0, 8)}… gesendet`, "INFO");
        } catch (err) {
            this.log(`Welt-Snapshot konnte nicht erstellt werden: ${err.message}`, "WARN");
        }
    }

    _p2pMsgWorldSnapshot(msg, p2p) {
        // Ring 11.5: eingehender Welt-Snapshot vom Host. Wird nur
        // akzeptiert, wenn wir gerade joinen (pendingWorldSnapshot=true)
        // — sonst könnte ein bösartiger Peer den Spielstand stehlen.
        if (!p2p.pendingWorldSnapshot) {
            this.log("world-snapshot empfangen ohne pending-Flag — ignoriert", "WARN");
            return;
        }
        const senderId = msg.peerId;
        if (typeof senderId !== "string" || senderId === p2p.peerId) return;
        if (!msg.state || typeof msg.state !== "object") return;
        this._p2pApplyWorldSnapshot(senderId, msg.state);
    }

    // Empfangenen Welt-Snapshot übernehmen: die Welt des Hosts mit worldMeta.role = "guest" + hostInfo betritt die Seite
    // durch DIE TÜR `_weltBetreten` (Identität, Ablage mit Probe, Sperre, Wechsel am Ort) — der WS-`world-snapshot` eines laufenden
    // Resyncs und der Mesh-Resync world-pull („Welt neu holen"). DER SPEICHER TRÄGT DIE WELT DES HOSTS, NIE DIE MISCHUNG DER
    // SEITE: bis 10.10. lud die Seite sie in sich und schrieb sie per saveState — die Tiere der alten Welt und (mit dem
    // Spread des Restores) ihr Erbgut, ihr Anker, ihre Edits (gate:weltgrenze Weg „weltpull": 50 Felder der alten Welt im
    // Speicher der Host-Welt); ein Snapshot ohne worldId landete roh auf dem Platz der alten Welt.
    _p2pApplyWorldSnapshot(senderId, state) {
        const p2p = this.state.p2p;
        const erbgutNein = AnazhRealm._erbgutEinlass(state);
        if (erbgutNein) {
            this.log(`Welt-Snapshot abgelehnt: ${erbgutNein}`, "ERROR");
            p2p.pendingWorldSnapshot = false;
            return { ok: false, reason: erbgutNein };
        }
        p2p.pendingWorldSnapshot = false;
        const r = this._weltBetreten(
            state,
            { role: "guest", hostInfo: { url: p2p.url, roomId: p2p.room, peerId: senderId } },
            { wechseln: !p2p._testNoReload }
        );
        if (!r.ok) {
            this.log(`Welt-Snapshot konnte nicht übernommen werden: ${r.reason}`, "ERROR");
            return r;
        }
        p2p.role = "guest";
        this.log(`Welt-Snapshot empfangen + abgelegt, jetzt Guest in ${(p2p.room || "").slice(0, 8)}…`, "INFO");
        this.p2pUpdateStatus();
        return r;
    }

    _p2pEnsurePeerEntry(peerId) {
        const p2p = this.state.p2p;
        let entry = p2p.peers.get(peerId);
        if (entry) return entry;
        entry = {
            peerId,
            // DER ORT IST UNBEKANNT, nie 0 (K04): bis die erste Position kommt (pos oder Lockstep-Schritt) steht der Peer
            // nirgends — `_p2pUpdatePeer` zeigt ihn erst mit endlichem Ort (vorher stand er sichtbar im Weltursprung).
            x: NaN,
            y: NaN,
            z: NaN,
            yaw: 0,
            mesh: null,
            // meshKind: "placeholder" (Cone+Sphere) | "soul" (Built-in) | "soul-custom" (bodyParts-Seele).
            // soulName/bodyParts kommen mit der `soul`-Nachricht; avatarName trägt das Name-Schild.
            meshKind: "placeholder",
            soulName: null,
            bodyParts: null,
            avatarName: null,
            walkPhase: 0,
            lastMovedAt: 0,
            // RECONNECT #3 — Snapshot-Puffer des Nicht-Lockstep-pos-Pfads:
            // {t,x,y,z,yaw} in Empfangszeit, bounded (s. _p2pMsgPos). Der
            // Render sampelt daraus ~120 ms in der Vergangenheit.
            snapBuf: null,
            nameLabel: null,
            // vibePassId = behaupteter ed25519-Schlüssel; vibeVerified erst true, wenn der Beweis (Signatur
            // über die peerId) gegen ihn verifiziert.
            vibePassId: null,
            vibeVerified: false,
            // W7 Phase 2 — Welt-Rolle des Peers (host/guest/solo), kommt mit
            // der `soul`-Nachricht. Der Resync-Pfad pullt vom host-Peer.
            worldRole: null,
            // W7 Phase 3 — teilt dieser Peer seine LLM-Stimme? (soul-Feld)
            voiceShared: false,
            // W16 Phase 2 — der Welt-Katalog des Peers: seine vendorten Welten
            // als [{id, label, hash}], annonciert über den soul-Kanal. Der
            // Bibliothek-Drawer macht ihn browsbar.
            catalog: [],
            // P2P-GESTALT (V18.478) — die validierte Avatar-Übergabe DIESES Peers
            // ({s, gestalt} oder null), per-Peer (nicht die eigene state-Wahrheit).
            uebergabe: null,
        };
        p2p.peers.set(peerId, entry);
        entry.mesh = this._p2pBuildPlaceholderMesh(peerId);
        if (entry.mesh) {
            entry.mesh.name = "p2p-spieler";
            entry.mesh.visible = false; // unsichtbar geboren — _p2pUpdatePeer zeigt ihn an seinem Ort
        }
        if (entry.mesh && this.state.scene) this.state.scene.add(entry.mesh);
        return entry;
    }

    // Ring 11 V3 — Platzhalter-Avatar (Kegel + Kugel), solange die Seele des
    // Peers noch nicht bekannt ist. Farbe deterministisch aus dem peerId-Hash.
    _p2pBuildPlaceholderMesh(peerId) {
        if (typeof THREE === "undefined") return null;
        let hash = 0;
        for (let i = 0; i < peerId.length; i++) hash = (hash * 31 + peerId.charCodeAt(i)) >>> 0;
        const color = new THREE.Color().setHSL((hash % 360) / 360, 0.7, 0.55);
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.4, 8), new THREE.MeshBasicMaterial({ color }));
        body.position.y = 0.7;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), new THREE.MeshBasicMaterial({ color }));
        head.position.y = 1.55;
        group.add(body, head);
        return group;
    }

    // Platzhalter durch die echte Peer-Seele ersetzen — über die EINE Leib-Wahl (`_leibDerSeele`): Built-ins mit build()
    // (userData.parts → voll animierbar), der Tier-Leib (`bp_koerper_<tier>` + bodyParts im soul-Kanal) als Studio-Baum der
    // Welt-Kreatur, jede andere Seele aus ihren bodyParts (Built-ins ohne Hand-Skelett aus den lokal bekannten).
    _p2pApplyPeerSoul(entry) {
        if (!this.state.scene || typeof THREE === "undefined") return;
        const bekannt = entry.soulName && this.playerSoulDefs[entry.soulName];
        const def =
            bekannt ||
            (Array.isArray(entry.bodyParts) && entry.bodyParts.length > 0 ? { bodyParts: entry.bodyParts } : null);
        if (!def) return; // unbekannte Seele ohne bodyParts → Platzhalter bleibt
        // Der Peer-Guss FÜHRT die Prägung des SENDERS (entry.uebergabe): transient gesetzt, damit der EINE Leser
        // _koerperStudioDials sie wählt; try/finally räumt sie IMMER (kein Leck). Nie null übergeben: der Merge fiele sonst
        // auf den EIGENEN Prägungs-Speicher des Betrachters — das leere Objekt ist der Sentinel "Peer ohne Wahl" →
        // Anker-Default, auf allen Clients gleich. Nur der human-Guss liest das Feld.
        const savedActive = this._activePeerUebergabe;
        this._activePeerUebergabe = entry.uebergabe && typeof entry.uebergabe === "object" ? entry.uebergabe : {};
        let group;
        try {
            group = this._leibDerSeele(entry.soulName, def, `peer:${entry.peerId}`);
        } finally {
            this._activePeerUebergabe = savedActive;
        }
        if (!group) return; // kalter Tier-Kern (LAUT gemeldet) → der Platzhalter bleibt
        const kind = typeof def.build === "function" ? "soul" : "soul-custom";
        // die bodyParts wandern in den Entry (Rollen-Ableitung des EINEN Compound-Pfads, der Tier-Baum geht dort seinen Gang)
        if (kind === "soul-custom") entry.bodyParts = def.bodyParts;
        // Die EINE Schwimm-Lehnen-Regel braucht die lokale x-Achse im gedrehten
        // Frame — die Spieler-Gruppen-Konvention (YXZ) gilt auch dem Peer-Mesh.
        group.rotation.order = "YXZ";
        // ABSCHIEDS-WELLE (Konvergenz C) — der Rollen-Memo folgt der NEUEN Seele
        // (ein Seelen-Wechsel phoenix→dragon trüge sonst stale Phönix-Rollen —
        // der Memo wird am EINEN Apply-Chokepoint geleert, nicht an N Lesern).
        entry._motionRoles = undefined;
        if (entry.mesh) {
            this.state.scene.remove(entry.mesh);
            this._disposeSoulGroup(entry.mesh);
        }
        group.name = "p2p-spieler";
        group.visible = false; // unsichtbar geboren — _p2pUpdatePeer zeigt ihn an seinem Ort
        this.state.scene.add(group);
        entry.mesh = group;
        entry.meshKind = kind;
    }

    // Name-Schild über dem Peer: CanvasTexture, depthTest aus (immer lesbar). Bei verifizierter
    // Vibe-Pass-Identität eine zweite Zeile "✓ <Fingerprint>" in Grün — der Name ist fälschbar, der
    // Fingerprint nicht. fingerprint leer → ein-zeilig.
    _p2pBuildNameLabel(name, fingerprint) {
        if (typeof document === "undefined" || typeof THREE === "undefined") return null;
        const hasFp = typeof fingerprint === "string" && fingerprint.length > 0;
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = hasFp ? 96 : 64;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        ctx.fillStyle = "rgba(18,16,26,0.74)";
        ctx.fillRect(6, 14, 244, hasFp ? 68 : 36);
        ctx.font = "bold 30px Cinzel, Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#f0e6d2";
        ctx.fillText(String(name).slice(0, 24), 128, 33);
        if (hasFp) {
            ctx.font = "20px 'JetBrains Mono', monospace";
            ctx.fillStyle = "#7fd49a";
            ctx.fillText("✓ " + fingerprint, 128, 67);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.name = "p2p-namensschild";
        // V12.0-vendor.3 — Canvas-Inhalt ist sRGB-encoded (fillStyle="#xxx").
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        sprite.name = "p2p-namensschild";
        sprite.scale.set(2.6, hasFp ? 0.98 : 0.65, 1);
        sprite.renderOrder = 5;
        return sprite;
    }

    // Name-Schild neu bauen, wenn der Avatar-Name eines Peers ankommt/wechselt.
    _p2pRefreshPeerNameLabel(entry) {
        if (entry.nameLabel) {
            if (this.state.scene) this.state.scene.remove(entry.nameLabel);
            if (entry.nameLabel.material) {
                // V10.0-j.e — Defer (CanvasTexture + Material, WebGPU Submit-Race).
                if (entry.nameLabel.material.map) this._queueDispose(entry.nameLabel.material.map);
                this._queueDispose(entry.nameLabel.material);
            }
            entry.nameLabel = null;
        }
        if (!entry.avatarName && !entry.vibePassId) return;
        // W13 Phase 3 — bei verifizierter Identität die Kurzform des
        // Fingerprints (erste 8 Hex in Vierergruppen) unter den Namen setzen.
        let fingerprint = "";
        if (entry.vibeVerified && entry.vibePassId) {
            const m = /^ed25519:([0-9a-f]{8})/i.exec(entry.vibePassId);
            if (m) {
                fingerprint = m[1].replace(/(.{4})/g, "$1 ").trim();
            }
        }
        // W18-D — „wohnt in …" reist im Name-Schild mit (Auffindbarkeit).
        const baseName = entry.avatarName || "Reisender";
        const shown = entry.dwellingIn ? `${baseName} · wohnt in ${entry.dwellingIn}` : baseName;
        const label = this._p2pBuildNameLabel(shown, fingerprint);
        if (label && this.state.scene) {
            label.visible = false; // unsichtbar geboren — _p2pUpdatePeer zeigt es über dem Kopf
            this.state.scene.add(label);
            entry.nameLabel = label;
        }
    }

    // Die EINE Frische-Frage: treibt der Lockstep-Ghost diesen Peer gerade (geseedet + frisch
    // gesteppt)? Leser: _p2pMsgPos (Autoritäts-Umleitung) und _p2pSampleSnapBuf (Sampler tritt zurück).
    _p2pLockstepDrives(entry, nowMs) {
        const ls = entry.lockstep;
        return !!(ls && ls.seeded && nowMs - ls.lastStepAt < 1200);
    }

    // Purer Interpolations-Kern: die zwei Snaps um renderT linear mischen; außerhalb des Puffers
    // KLEMMEN (kein Überschwingen). yaw über den kürzesten Bogen (atan2) — kein 359°→1°-Spin.
    _p2pSnapInterpolate(buf, renderT) {
        if (!Array.isArray(buf) || buf.length === 0) return null;
        const first = buf[0];
        if (renderT <= first.t) return { x: first.x, y: first.y, z: first.z, yaw: first.yaw };
        const last = buf[buf.length - 1];
        if (renderT >= last.t) return { x: last.x, y: last.y, z: last.z, yaw: last.yaw };
        for (let i = buf.length - 1; i >= 1; i--) {
            const a = buf[i - 1];
            const b = buf[i];
            if (renderT >= a.t && renderT <= b.t) {
                const span = b.t - a.t;
                const f = span > 0 ? (renderT - a.t) / span : 1;
                const dyaw = Math.atan2(Math.sin(b.yaw - a.yaw), Math.cos(b.yaw - a.yaw));
                return {
                    x: a.x + (b.x - a.x) * f,
                    y: a.y + (b.y - a.y) * f,
                    z: a.z + (b.z - a.z) * f,
                    yaw: a.yaw + dyaw * f,
                };
            }
        }
        return { x: last.x, y: last.y, z: last.z, yaw: last.yaw };
    }

    // Render-Sampler: Position P2P_SNAP_INTERP_DELAY_MS in der Vergangenheit aus dem Snap-Puffer
    // interpolieren (glättet 30-Hz-Snaps, überbrückt einen verlorenen). Tritt zurück, wenn der
    // Lockstep-Ghost treibt oder weniger als zwei Snaps liegen.
    _p2pSampleSnapBuf(entry, nowMs) {
        const buf = entry.snapBuf;
        if (!buf || buf.length < 2) return false;
        if (this._p2pLockstepDrives(entry, nowMs)) return false;
        const renderT = nowMs - AnazhRealm.P2P_SNAP_INTERP_DELAY_MS;
        // Puffer-Diät: alles VOR dem älteren Stütz-Snap ist verbraucht.
        while (buf.length > 2 && buf[1].t <= renderT) buf.shift();
        const s = this._p2pSnapInterpolate(buf, renderT);
        if (!s) return false;
        entry.x = s.x;
        entry.y = s.y;
        entry.z = s.z;
        entry.yaw = s.yaw;
        return true;
    }

    _p2pUpdatePeer(entry, t, dt) {
        const mesh = entry.mesh;
        if (!mesh) return;
        const nowSec = (typeof performance !== "undefined" ? performance.now() : t * 1000) / 1000;
        // RECONNECT #3 — erst die interpolierte Vergangenheit samplen (nur
        // Nicht-Lockstep-Snaps, s. _p2pSampleSnapBuf), dann zeichnen.
        this._p2pSampleSnapBuf(entry, nowSec * 1000);
        // DIE EINE SICHT DES MITSPIELERS (K04): sichtbar ist er erst mit einem Ort — Leib und Schild, gleich welcher
        // Gestalt (Platzhalter, Seele, Schild werden unsichtbar geboren). Ohne Ort gibt es nichts zu zeichnen.
        const ortBekannt = Number.isFinite(entry.x) && Number.isFinite(entry.y) && Number.isFinite(entry.z);
        mesh.visible = ortBekannt;
        if (entry.nameLabel) entry.nameLabel.visible = ortBekannt;
        if (!ortBekannt) return;
        const isMoving = nowSec - (entry.lastMovedAt || 0) < 0.25;
        // Der Mitspieler schwimmt nach derselben Wahrheit wie der eigene Körper: die Säule über seinen Füßen (das EINE
        // Urteil `_nassAt`) trägt ihn an der Brustkorb-Linie (bis V18.531 schwamm er nur unter dem Meeresspiegel).
        const fussP = entry.y - AnazhRealm.PLAYER_FOOT_OFFSET;
        const underwater = this._nassAt(entry.x, entry.z, -AnazhRealm._schwimmBrustM() * 0.9, fussP);
        // Der Cone+Sphere-Platzhalter sitzt mit -1-Offset; das Seelen-Mesh am
        // playerMesh-Origin (entry.y direkt — wie der lokale Soul-Group).
        const yOff = entry.meshKind === "placeholder" ? -1 : 0;
        let posY = entry.y + yOff;
        // Der FERNE Leib trägt seine gelenkige Grobstufe (der EINE Stufen-Schalter `_gelenkStufe` am Auge der Stufen);
        // dahinter ruht auch der Rig-Tick. Jede Gelenk-Gestalt (Mensch, Tier-Leib der Seele) trägt `_gelenk`.
        let fernAktiv = false;
        const gl = mesh.userData && mesh.userData._gelenk;
        if (gl) {
            const pp = this._lodAuge();
            fernAktiv = pp ? this._gelenkStufe(mesh, pp, entry) : gl.istFern;
        }
        if (entry.meshKind === "soul-custom") {
            // Peer-Custom-Seelen erben die emergente Bewegung: Rollen aus den per soul gereisten bodyParts,
            // Phase aus dem Positions-Stream (keine Extra-Bandbreite).
            if (Array.isArray(entry.bodyParts)) {
                if (entry._motionRoles === undefined) entry._motionRoles = this.computeMotionRoles(entry.bodyParts);
                if (entry._motionRoles) {
                    // ZENSUS-REST V18.488 — der Peer geht dieselbe Takt-Basis wie
                    // der lokale Compound (schritt.taktCompound, war 5.0 vs 5.5)
                    // und hängt an derselben Emotions-Brücke (_compoundTaktHz).
                    entry.walkPhase =
                        (entry.walkPhase || 0) + (isMoving ? dt * this._compoundTaktHz(entry.emotions) : 0);
                    // ABSCHIEDS-WELLE (Konvergenz C) — die EINE Schwimm-Lehne auch für
                    // Peer-Compound-Seelen (Built-ins Phönix/Drache + Customs; die
                    // Gruppe ist YXZ, s. _p2pApplyPeerSoul).
                    const L = AnazhRealm.SOUL_SWIM_LEAN;
                    mesh.rotation.x = underwater ? (isMoving ? L.moving : L.idle) : 0;
                    this._animateCompoundMotion(mesh, entry._motionRoles, nowSec, entry.walkPhase, isMoving);
                } else {
                    posY += Math.sin(t * 1.8) * 0.04;
                }
            } else {
                posY += Math.sin(t * 1.8) * 0.04;
            }
        }
        mesh.position.set(entry.x, posY, entry.z);
        mesh.rotation.y = entry.yaw;
        // Built-in-Seelen voll animieren (Geh-/Schwimm-Zyklus), abgeleitet aus
        // dem Positions-Stream — keine Extra-Bandbreite.
        if (entry.meshKind === "soul") {
            const def = this.playerSoulDefs[entry.soulName];
            if (!fernAktiv && def && typeof def.animate === "function" && mesh.userData && mesh.userData.parts) {
                if (underwater) {
                    // SCHWIMM-HEIMAT — derselbe Studio-Takt wie der lokale Avatar
                    // (EIN Gesetz, beide Leser; fail-soft byte-gleich 5.0/2.3).
                    const SG = AnazhRealm._schwimmGesetz();
                    entry.walkPhase += dt * (isMoving ? SG.taktZug : SG.taktTreten);
                    def.animate(mesh, t, entry.walkPhase, isMoving, underwater);
                } else if (mesh.userData.rig) {
                    // Der Peer-Biped geht dieselbe Weg-Phase + Posen-Blende (EIN Gang-Tick-Chokepoint); Tempo aus dem
                    // Positions-Strom (EWMA + NaN-Wand). OHNE Boden-IK — der Fuß-Anker gehört dem lokalen Avatar.
                    let spd = 0;
                    if (Number.isFinite(entry._gaitPX) && dt > 1e-4) {
                        spd = Math.hypot(entry.x - entry._gaitPX, entry.z - entry._gaitPZ) / dt;
                        if (!Number.isFinite(spd) || spd > 20) spd = 0;
                    }
                    entry._gaitSpeed = (entry._gaitSpeed || 0) * 0.7 + spd * 0.3;
                    const gaitP = this._gaitTick(mesh, entry, entry._gaitSpeed, dt, null);
                    def.animate(mesh, t, entry.walkPhase, isMoving, underwater, undefined, gaitP);
                } else {
                    // ZENSUS-REST V18.488 — dieselbe EINE Takt-Basis (Chokepoint).
                    if (isMoving) entry.walkPhase += dt * this._compoundTaktHz(entry.emotions);
                    def.animate(mesh, t, entry.walkPhase, isMoving, underwater);
                }
            }
            entry._gaitPX = entry.x;
            entry._gaitPZ = entry.z;
        }
        // Name-Schild folgt über dem Kopf.
        if (entry.nameLabel) {
            entry.nameLabel.position.set(entry.x, entry.y + 2.3, entry.z);
        }
    }

    // Der eigene Welt-Katalog: jede vendorte Welt als {id, label, hash}. Nur `vendored`-Welten haben
    // ein teilbares Datei-Bündel — exakt die, die requestWorldBundleFromPeer herausgeben kann.
    _p2pBuildCatalog() {
        const cw = this.state.customWorlds || {};
        const out = [];
        for (const id of Object.keys(cw)) {
            const w = cw[id];
            if (!w || w.vendored !== true) continue;
            out.push({
                id,
                label: typeof w.label === "string" ? w.label.slice(0, 48) : id,
                hash: typeof w.bundleHash === "string" ? w.bundleHash : "",
                // W17 — die Multiplayer-Marke reist im Katalog mit: ein Peer
                // sieht, welche browsbaren Welten Gruppen-Portal-fähig sind.
                multiplayer: w.multiplayer === true,
                // W18-B — die Ko-Präsenz-Marke reist im Katalog mit.
                coPresence: w.coPresence === true,
                // W17 P-Vendor — der Server-Modus reist im Katalog mit.
                serverMode: w.serverMode === "js-compute" ? "js-compute" : "relay",
            });
            if (out.length >= 32) break;
        }
        return out;
    }

    // Empfangenen Peer-Katalog säubern: id-förmige id Pflicht (geht in requestWorldBundleFromPeer),
    // Hash optional (ältere vendorte Welten haben keinen). Der signaling-server deckelt schon,
    // der Client prüft maßgeblich.
    _p2pSanitizeCatalog(arr) {
        if (!Array.isArray(arr)) return [];
        const out = [];
        for (const c of arr) {
            if (!c || typeof c !== "object") continue;
            const id = String(c.id || "")
                .trim()
                .toLowerCase();
            if (!/^[a-z0-9_-]{1,40}$/.test(id)) continue;
            const hash = typeof c.hash === "string" && /^[0-9a-f]{0,64}$/i.test(c.hash) ? c.hash.toLowerCase() : "";
            out.push({
                id,
                label: typeof c.label === "string" ? c.label.slice(0, 48) : id,
                hash,
                multiplayer: c.multiplayer === true,
                coPresence: c.coPresence === true,
                serverMode: c.serverMode === "js-compute" ? "js-compute" : "relay",
            });
            if (out.length >= 32) break;
        }
        return out;
    }

    // W16 Phase 2 — habe ich diese Welt schon? Per id ODER per Content-Hash
    // (eine Welt mit denselben Dateien unter einer anderen id IST dieselbe
    // Welt — der Hash ist ihre peer-unabhängige Identität).
    _haveWorldByHashOrId(id, hash) {
        const cw = this.state.customWorlds || {};
        if (id && cw[id]) return true;
        if (typeof hash === "string" && hash) {
            for (const k of Object.keys(cw)) {
                if (cw[k] && cw[k].bundleHash === hash) return true;
            }
        }
        return false;
    }

    _p2pBroadcastSoul() {
        if (!this.state.p2p || !this.state.p2p.enabled) return;
        const soulName = (this.state.player && this.state.player.soul) || "human";
        const msg = { type: "soul", soulName };
        const custom = this.state.customSouls && this.state.customSouls[soulName];
        if (custom && Array.isArray(custom.bodyParts)) msg.bodyParts = custom.bodyParts;
        const avatarName = this.state.player && this.state.player.name;
        if (typeof avatarName === "string" && avatarName.trim()) msg.name = avatarName.trim().slice(0, 48);
        // W7 Phase 2 — die Welt-Rolle mitteilen, damit ein Guest weiss,
        // welcher verbundene Peer der Host ist (Ziel des Welt-Resync).
        msg.worldRole = (this.state.worldMeta && this.state.worldMeta.role) || "solo";
        // W7 Phase 3 — mitteilen, ob ich meine LLM-Stimme teile.
        msg.voiceShared = !!(this.state.p2p && this.state.p2p.voiceShared);
        // W16 Phase 2 — den eigenen Welt-Katalog annoncieren (wie worldRole).
        msg.catalog = this._p2pBuildCatalog();
        // W18-D — „wohnt in …": die Gefährten finden mich in meiner Wahl-
        // Heimat (Auffindbarkeit, world-portal-w18-plan §7). Das Label ist
        // öffentlich-harmlos (eine Welt-Bezeichnung, kein Pfad/Zustand).
        const dwell = this._loadPortalDwelling();
        if (dwell) msg.dwell = dwell.label;
        // Die Avatar-Gestalt des Senders reist additiv im soul-Kanal: koerper = die Prägung des Mensch-Rezepts (Dials und
        // Wahlen, ohne den Samen), nur wenn nicht-leer; alte Clients ignorieren das Feld (must-ignore). NUR koerper — die
        // Kreatur-Gestalt gehört an den Kreatur-Sync-Pfad (ein soul-Feld ohne Konsument wäre ein toter Parallelpfad).
        const su = this._studioPraegung(AnazhRealm.KOERPER_HOST_RECIPE);
        if (su) msg.uebergabe = { koerper: su };
        this.p2pSend(msg);
    }

    // Voice-Sync: spricht der eigene Begleiter (jeder Pfad durch grokRender), den Text an alle senden —
    // eigener Kanal wie soul, KEIN DSL (Darstellung, keine Welt-Mutation). Immer broadcastet; ob ein
    // Mitspieler ihn HÖRT, entscheidet sein eigener Stimme-Toggle.
    _p2pBroadcastCompanionSay(text) {
        const p2p = this.state.p2p;
        if (!p2p || !p2p.enabled || !p2p.connected) return;
        const clean = typeof text === "string" ? text.trim().slice(0, 280) : "";
        if (!clean) return;
        const voice = (this.state.grok && this.state.grok.companionVoice) || "";
        this.p2pSend({ type: "companion-say", text: clean, voice });
    }

    // Begleiter-Output eines Mitspielers via SpeechSynthesis — gegated auf den EIGENEN Stimme-Toggle
    // (ein Toggle für eigenen + fremden Begleiter). Silent-Drop, wenn schon eine Stimme läuft
    // (kein Speech-Stau bei vielen Mitspielern).
    _p2pHandleCompanionSay(peerId, msg) {
        const grok = this.state.grok;
        if (!grok || !grok.speechEnabled) return;
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        const text = typeof msg.text === "string" ? msg.text.trim().slice(0, 280) : "";
        if (!text) return;
        // Silent-Drop bei laufender/anstehender Stimme — kein Backlog.
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) return;
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "de-DE";
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            const voiceVol =
                typeof this.state.symphony.voiceVolume === "number" ? this.state.symphony.voiceVolume : 1.0;
            utterance.volume = Math.max(0, Math.min(1, voiceVol));
            const want = typeof msg.voice === "string" ? msg.voice : "";
            if (want) {
                const match = window.speechSynthesis.getVoices().find((v) => v.name === want);
                if (match) utterance.voice = match;
            }
            window.speechSynthesis.speak(utterance);
        } catch {
            // Speech-API kann auf manchen Plattformen werfen; stumm fallback.
        }
        // Sicht-Spur im Log — wessen Begleiter sprach (Avatar-Name aus dem
        // soul-Sync; fehlt er noch, ein peerId-Fragment).
        const entry = this.state.p2p.peers.get(peerId);
        const who = (entry && entry.avatarName) || String(peerId).slice(0, 8);
        this.log(`${who} · Begleiter: ${text}`, "INFO");
    }

    // Eigene Vibe-Pass-Identität an alle senden (Join + peer-join, wie soul): vibePassId = öffentlicher
    // Schlüssel, proof = Signatur über die eigene peerId — nur der Halter des privaten Schlüssels kann
    // sie erzeugen. Async (ed25519).
    async _p2pBroadcastVibe() {
        const p2p = this.state.p2p;
        if (!p2p || !p2p.enabled || !p2p.peerId) return;
        const vibePassId = this.vibePassId();
        if (!vibePassId) return;
        const proof = await this._vibeSign(p2p.peerId);
        if (!proof) return;
        this.p2pSend({ type: "vibe", vibePassId, proof });
    }

    _p2pRemovePeer(peerId) {
        const p2p = this.state.p2p;
        // W7 Phase 1 — die WebRTC-Verbindung mit abbauen (auch wenn kein
        // Peer-Mesh-Eintrag mehr existiert).
        this._p2pCloseRtcPeer(peerId);
        // Kreatur-Sicht-Sync — die Sicht-Kopien dieses Peers entsorgen.
        for (const [key, rc] of p2p.remoteCreatures) {
            if (rc.peerId === peerId) this._disposeRemoteCreature(key, rc);
        }
        // Verlässt ein Peer das Mesh: als Compute-Host seine Server-Verbindung schließen (srv-close erreicht
        // den Server-Kontext); als Gast, dessen Compute-Host er war, übernimmt die Host-Migration
        // (ein deterministischer Nachfolger baut einen frischen Server-Kontext).
        const po = this._portalOverlay;
        if (po && po.serverMode === "js-compute") {
            if (po.computeRole === "host" && po.serverConns && po.serverConns.has(peerId)) {
                po.serverConns.delete(peerId);
                this._portalSrvSend({ __anazhNet: true, kind: "srv-close", conn: peerId });
                this._portalBroadcastRoster();
            } else if (po.computeRole === "guest" && peerId === po.hostPeerId) {
                this._portalMigrateHost(peerId);
            }
        }
        const entry = p2p.peers.get(peerId);
        if (!entry) return;
        if (entry.mesh) {
            if (this.state.scene) this.state.scene.remove(entry.mesh);
            this._disposeSoulGroup(entry.mesh);
        }
        if (entry.nameLabel) {
            if (this.state.scene) this.state.scene.remove(entry.nameLabel);
            if (entry.nameLabel.material) {
                // V10.0-j.e — Defer (CanvasTexture + Material, WebGPU Submit-Race).
                if (entry.nameLabel.material.map) this._queueDispose(entry.nameLabel.material.map);
                this._queueDispose(entry.nameLabel.material);
            }
        }
        p2p.peers.delete(peerId);
        // W17 Phase C — eine offene Einladung dieses Peers verfällt mit ihm.
        if (p2p.pendingInvite && p2p.pendingInvite.peerId === peerId) {
            p2p.pendingInvite = null;
            this._renderPortalInviteBanner();
        }
    }

    _p2pClearAllPeerMeshes() {
        const p2p = this.state.p2p;
        for (const peerId of Array.from(p2p.peers.keys())) {
            this._p2pRemovePeer(peerId);
        }
    }

    p2pTick(currentTimeMs) {
        const p2p = this.state.p2p;
        if (!p2p.enabled || !p2p.connected || !p2p.ws) return;
        // Position-Broadcast bei 30 Hz. lastBroadcastAt ist in ms,
        // currentTimeMs sollte performance.now() sein. Der Takt des Anschlusses trägt die Welt-Uhr (`w`, feld.K2#2): jede
        // Seite nimmt sie, wenn sie später ist (`_weltUhrNimm`) — die Uhr reist, kein Zustand einer Teil-Simulation.
        const playerMesh = this.state.playerMesh;
        if (playerMesh && currentTimeMs - p2p.lastBroadcastAt > p2p.broadcastIntervalMs) {
            p2p.lastBroadcastAt = currentTimeMs;
            this.p2pSend({
                type: "pos",
                x: playerMesh.position.x,
                y: playerMesh.position.y,
                z: playerMesh.position.z,
                yaw: this.state.yaw || 0,
                w: this.state.spielZeit,
            });
        }
        // Ring 11 V3 — Aura-Sync, ~1 Hz (die Aura pulsiert langsam, kein
        // Frame-Sync nötig).
        if (currentTimeMs - (p2p._lastAuraBroadcast || 0) > 1000) {
            p2p._lastAuraBroadcast = currentTimeMs;
        }
        // Kreatur-Sicht-Sync — die eigenen Kreatur-Positionen ~5,5 Hz
        // streamen (Kreaturen bewegen sich gemächlich, kein Frame-Sync nötig).
        if (currentTimeMs - (p2p._lastCreatureBroadcast || 0) > 180) {
            p2p._lastCreatureBroadcast = currentTimeMs;
            this._p2pBroadcastCreatures();
        }
        // Peer-Avatare nachziehen: Position, Animation, Aura, Name-Schild. EIN STILLER PARTNER IST NICHT WEG (mp-leitung): sein
        // Loop steht (verborgener Tab, langsamer Rechner), seine Leitung lebt — er bleibt, wo er zuletzt stand. Gegangen ist er
        // erst am Ereignis des Brokers (`peer-leave`: sein Socket schloss oder schwieg dem Ping), nie nach der Wanduhr dieses
        // Takts: der Leerlauf-Abschied (10 s ohne Nachricht) riss die Leitung, und die Rückkehr kam ohne sie.
        const t = currentTimeMs / 1000;
        const dt = p2p._lastTickMs ? Math.max(0, Math.min(0.1, (currentTimeMs - p2p._lastTickMs) / 1000)) : 0;
        p2p._lastTickMs = currentTimeMs;
        for (const entry of p2p.peers.values()) this._p2pUpdatePeer(entry, t, dt);
        // Kreatur-Sicht-Sync — die Kreatur-Meshes der Mitspieler nachziehen.
        this._p2pTickRemoteCreatures(t, dt);
        // W16-Politur — einen hängenden Welt-Bündel-Pull weich abbrechen.
        this._p2pCheckBundlePullTimeout();
        // V18.382 — LOCKSTEP: den Input-Batch flushen + die Fremd-Charaktere aus ihren
        // Input-Strömen simulieren (VOR _p2pUpdatePeer im NÄCHSTEN Tick gerendert).
        this._lockstepFlushOut(currentTimeMs);
        this._lockstepTickPeers(currentTimeMs);
    }

    // ===== LOCKSTEP-MP: NUR INPUTS ÜBERS NETZ =====
    // Statt Positions-Snaps reist der INPUT jedes Fixed-Steps (seq · yaw · Sprint/Sprung-Bits · vor · quer der Verb-Tafel, analog, gebatcht)
    // über den reliable+ordered DataChannel; der Empfänger treibt den Fremd-Charakter durch DENSELBEN
    // Schritt-Pfad (`_stepCharacter` + `_loopPlayerMovement(FIXED_DT)`) — der GHOST-SWAP tauscht die
    // Charakter-Felder je Schritt und stellt sie exakt wieder her (keine zweite Sim). 1-Hz-ANKER
    // re-seedet bei Divergenz; Drift > LOCKSTEP.driftMax ent-seedet → pos-Snaps. Aus: p2p.lockstep=false.
    _lockstepNewGhost() {
        return {
            seeded: false,
            x: 0,
            y: 0,
            z: 0,
            vel: this._makeFieldVec(),
            fieldVy: 0,
            wasGrounded: false,
            groundedCache: false,
            groundedCachedAt: 0,
            isInAir: false,
            isJumping: false,
            lastGroundedTime: 0,
            groundNormalY: 1,
            onSteepSlope: false,
            underwater: false,
            eyesUnder: false,
            lastMoveT: 0,
            spaceWasDown: false,
            jumpPressedAt: -Infinity,
            simT: 0,
            yaw: 0,
            tafel: {
                vor: 0,
                quer: 0,
                sprint: false,
                sprung: false,
                rutsch: false,
                gas: 0,
                bremse: 0,
                lenken: 0,
                handbremse: false,
            },
            fwd: new THREE.Vector3(),
            rgt: new THREE.Vector3(),
            mdir: new THREE.Vector3(),
            speed: NaN,
            sprintSpeed: NaN,
            jumpPower: NaN,
            leibKg: NaN,
            buf: [],
            bufStart: 0,
            doneSeq: -1,
            anchor: null,
            authX: NaN,
            authY: NaN,
            authZ: NaN,
            lastStepAt: 0,
            trace: null,
        };
    }

    // SENDER: je Fixed-Step den Input einreihen (im EINEN Sim-Schritt gerufen). Anker (alle 60 Schritte)
    // = KOMPLETTER Sim-Zustand NACH Schritt seq INKLUSIVE simTime — der Ghost übernimmt die Zeitachse,
    // sonst divergieren die zeit-verankerten Branches (Coyote/Grounded-Cache/Jump-Cooldown).
    // Nicht-finite Timestamps entfallen (JSON machte sie zu null; der Empfänger defaultet auf -Infinity).
    // Ohne offene Kanäle reset (Peers seeden beim Wieder-Erscheinen über den seq-0-Anker neu).
    _lockstepCaptureFrame(simTime) {
        const st = this.state;
        const p2p = st.p2p;
        if (!p2p || !p2p.enabled || !p2p.connected || p2p.lockstep === false) return;
        if (!p2p.rtcPeers || p2p.rtcPeers.size === 0) {
            p2p._lockstepSeq = -1;
            p2p._lockstepOut = null;
            return;
        }
        const T = st.verbTafel; // die Leib-Felder der Tafel, die der Schritt las — analog (ein Stick reist als Zahl, JSON exakt)
        const b = (T.sprint ? 1 : 0) | (T.sprung ? 2 : 0);
        const seq = (p2p._lockstepSeq = (Number.isFinite(p2p._lockstepSeq) ? p2p._lockstepSeq : -1) + 1);
        const out = p2p._lockstepOut || (p2p._lockstepOut = { s0: seq, f: [] });
        out.f.push([st.yaw || 0, b, T.vor, T.quer]);
        const m = st.playerMesh;
        if (seq % 60 === 0 && m && st.playerVel) {
            const a = {
                s: seq,
                t: simTime,
                x: m.position.x,
                y: m.position.y,
                z: m.position.z,
                vx: st.playerVel.x(),
                vy: st.playerVel.y(),
                vz: st.playerVel.z(),
                fy: st._fieldVy || 0,
                wg: st._fieldWasGrounded ? 1 : 0,
                gc: st._groundedCache ? 1 : 0,
                ia: st.isInAir ? 1 : 0,
                ij: st.isJumping ? 1 : 0,
                ny: st.groundNormalY,
                ss: st.onSteepSlope ? 1 : 0,
                uw: st.playerUnderwater ? 1 : 0,
                eu: st.playerEyesUnderwater ? 1 : 0,
                sw: st._spaceWasDown ? 1 : 0,
                sp: st.speed,
                ssp: st.sprintSpeed,
                jp: st.jumpPower,
                kg: this._leibMasse(m), // die Masse des Leibs: der Abdruck des Geists rechnet mit ihr (`_sprungAbdruck`)
            };
            if (Number.isFinite(st._groundedCachedAt)) a.gt = st._groundedCachedAt;
            if (Number.isFinite(st.lastGroundedTime)) a.lg = st.lastGroundedTime;
            if (Number.isFinite(st._lastMoveT)) a.lm = st._lastMoveT;
            if (Number.isFinite(st._jumpPressedAt)) a.jpa = st._jumpPressedAt;
            out.a = a;
        }
        if (p2p.lockstepDebug && m) {
            const tr = p2p._lockstepTrace || (p2p._lockstepTrace = []);
            tr.push({ q: seq, x: m.position.x, y: m.position.y, z: m.position.z });
            if (tr.length > 2400) tr.shift();
        }
    }

    _lockstepFlushOut(nowMs) {
        const p2p = this.state.p2p;
        const out = p2p ? p2p._lockstepOut : null;
        if (!out || out.f.length === 0) return;
        if (out.f.length < 4 && nowMs - (p2p._lockstepLastFlush || 0) <= 120) return;
        p2p._lockstepLastFlush = nowMs;
        p2p._lockstepOut = null;
        if (this._p2pMeshReady && this._p2pMeshReady()) {
            const msg = { type: "input", s0: out.s0, f: out.f };
            if (out.a) msg.a = out.a;
            this.p2pSend(msg);
        }
        // Mesh nicht bereit → Batch verworfen: der Empfänger sieht die seq-Lücke, leert den
        // Puffer und wartet auf den nächsten Anker (≤ 1 s) — selbst-heilend, kein Stau.
    }

    // Der EMPFÄNGER: Input-Batches puffern (reliable+ordered ⇒ anschlussfähig; eine Lücke
    // [Flush-Drop/Neustart] setzt den Puffer neu auf — der Anker re-seedet).
    _p2pMsgInput(msg) {
        const p2p = this.state.p2p;
        if (!p2p || !msg || !msg.peerId || msg.peerId === p2p.peerId) return;
        if (p2p.lockstep === false) return;
        if (!Array.isArray(msg.f) || msg.f.length === 0 || msg.f.length > 240 || !Number.isFinite(msg.s0)) return;
        const entry = this._p2pEnsurePeerEntry(msg.peerId);
        const ls = entry.lockstep || (entry.lockstep = this._lockstepNewGhost());
        if (p2p.lockstepDebug && !ls.trace) ls.trace = [];
        const expected = ls.bufStart + ls.buf.length;
        if (ls.buf.length === 0 || msg.s0 !== expected) {
            // Lücke oder Neustart → Puffer neu ab s0 (verbrauchte doneSeq bleibt; der
            // Consume wartet auf Anschluss bzw. den Anker).
            ls.buf = [];
            ls.bufStart = msg.s0;
        }
        for (let i = 0; i < msg.f.length; i++) {
            const f = msg.f[i];
            if (!Array.isArray(f) || ![f[0], f[1], f[2], f[3]].every(Number.isFinite)) continue;
            ls.buf.push(f);
        }
        if (ls.buf.length > 900) {
            // Flut-/Rückstau-Wand: älteste verwerfen (der Anker holt den Ghost wieder ein).
            const drop = ls.buf.length - 900;
            ls.buf.splice(0, drop);
            ls.bufStart += drop;
        }
        // Der Anker seedet den Ghost-Ort: alle drei Achsen endlich (eine null-Achse — das JSON-Bild von NaN — stand als 0).
        const a = msg.a;
        const ankerOrt = !!a && Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(a.z);
        if (ankerOrt && Number.isFinite(a.s)) ls.anchor = a;
    }

    // GHOST-SWAP: die KOMPLETTE Charakter-Sim-Oberfläche Spieler↔Ghost tauschen, den EINEN
    // Schritt-Pfad fahren, exakt zurücktauschen. View-Seeds (_landImpactPending) werden restauriert
    // (der Ghost dippt nie die lokale Kamera); mountedArch ist für den Ghost null.
    _lockstepStepGhost(ls, yaw, bits, vor, quer) {
        const st = this.state;
        const mesh = st.playerMesh;
        if (!mesh || !st.playerVel) return;
        const FIXED_DT = AnazhRealm.FIXED_DT;
        const s = ls._scratch || (ls._scratch = {});
        s.px = mesh.position.x;
        s.py = mesh.position.y;
        s.pz = mesh.position.z;
        s.vel = st.playerVel;
        s.fieldVy = st._fieldVy;
        s.wasG = st._fieldWasGrounded;
        s.gCache = st._groundedCache;
        s.gAt = st._groundedCachedAt;
        s.inAir = st.isInAir;
        s.jump = st.isJumping;
        s.lastG = st.lastGroundedTime;
        s.gNy = st.groundNormalY;
        s.steep = st.onSteepSlope;
        s.uw = st.playerUnderwater;
        s.euw = st.playerEyesUnderwater;
        s.lastMoveT = st._lastMoveT;
        s.spaceWas = st._spaceWasDown;
        s.jpAt = st._jumpPressedAt;
        s.tafel = st.verbTafel;
        s.yaw = st.yaw;
        s.fwd = st.forward;
        s.rgt = st.right;
        s.mdir = st.moveDirection;
        s.mounted = st.player ? st.player.mountedArch : null;
        s.landPend = st._landImpactPending;
        s.speed = st.speed;
        s.sprint = st.sprintSpeed;
        s.jp = st.jumpPower;
        s.kg = st._geistKg;
        // --- Ghost laden ---
        mesh.position.set(ls.x, ls.y, ls.z);
        st.playerVel = ls.vel;
        st._fieldVy = ls.fieldVy;
        st._fieldWasGrounded = ls.wasGrounded;
        st._groundedCache = ls.groundedCache;
        st._groundedCachedAt = ls.groundedCachedAt;
        st.isInAir = ls.isInAir;
        st.isJumping = ls.isJumping;
        st.lastGroundedTime = ls.lastGroundedTime;
        st.groundNormalY = ls.groundNormalY;
        st.onSteepSlope = ls.onSteepSlope;
        st.playerUnderwater = ls.underwater;
        st.playerEyesUnderwater = ls.eyesUnder;
        st._lastMoveT = ls.lastMoveT;
        st._spaceWasDown = ls.spaceWasDown;
        st._jumpPressedAt = ls.jumpPressedAt;
        Object.assign(ls.tafel, { vor, quer, sprint: !!(bits & 1), sprung: !!(bits & 2) });
        st.verbTafel = ls.tafel;
        st.yaw = yaw;
        st.forward = ls.fwd;
        st.right = ls.rgt;
        st.moveDirection = ls.mdir;
        if (st.player) st.player.mountedArch = null;
        if (Number.isFinite(ls.speed)) st.speed = ls.speed;
        if (Number.isFinite(ls.sprintSpeed)) st.sprintSpeed = ls.sprintSpeed;
        if (Number.isFinite(ls.jumpPower)) st.jumpPower = ls.jumpPower;
        st._geistKg = ls.leibKg;
        // --- der EINE Sim-Schritt (exakt die _stepFixedSim-Ordnung, ohne Captures) ---
        this._loopPlayerMovement(ls.simT, FIXED_DT);
        this._stepCharacter(FIXED_DT, ls.simT);
        this._rittSchritt(FIXED_DT); // der Ghost reitet nie (mountedArch null) — die Ordnung bleibt exakt
        ls.simT += FIXED_DT;
        // --- Ghost sichern ---
        ls.x = mesh.position.x;
        ls.y = mesh.position.y;
        ls.z = mesh.position.z;
        ls.vel = st.playerVel;
        ls.fieldVy = st._fieldVy;
        ls.wasGrounded = st._fieldWasGrounded;
        ls.groundedCache = st._groundedCache;
        ls.groundedCachedAt = st._groundedCachedAt;
        ls.isInAir = st.isInAir;
        ls.isJumping = st.isJumping;
        ls.lastGroundedTime = st.lastGroundedTime;
        ls.groundNormalY = st.groundNormalY;
        ls.onSteepSlope = st.onSteepSlope;
        ls.underwater = st.playerUnderwater;
        ls.eyesUnder = st.playerEyesUnderwater;
        ls.lastMoveT = st._lastMoveT;
        ls.spaceWasDown = st._spaceWasDown;
        ls.jumpPressedAt = st._jumpPressedAt;
        ls.yaw = yaw;
        // --- Spieler exakt wiederherstellen ---
        mesh.position.set(s.px, s.py, s.pz);
        st.playerVel = s.vel;
        st._fieldVy = s.fieldVy;
        st._fieldWasGrounded = s.wasG;
        st._groundedCache = s.gCache;
        st._groundedCachedAt = s.gAt;
        st.isInAir = s.inAir;
        st.isJumping = s.jump;
        st.lastGroundedTime = s.lastG;
        st.groundNormalY = s.gNy;
        st.onSteepSlope = s.steep;
        st.playerUnderwater = s.uw;
        st.playerEyesUnderwater = s.euw;
        st._lastMoveT = s.lastMoveT;
        st._spaceWasDown = s.spaceWas;
        st._jumpPressedAt = s.jpAt;
        st.verbTafel = s.tafel;
        st.yaw = s.yaw;
        st.forward = s.fwd;
        st.right = s.rgt;
        st.moveDirection = s.mdir;
        if (st.player) st.player.mountedArch = s.mounted;
        st._landImpactPending = s.landPend;
        st.speed = s.speed;
        st.sprintSpeed = s.sprint;
        st.jumpPower = s.jp;
        st._geistKg = s.kg;
    }

    // GHOST-TICK: Anker anwenden (seed/re-seed), anschlussfähige Frames verbrauchen (2-Frame-Reserve
    // gegen Jitter, Aufhol-Kappe nach der WANDUHR), Drift-Wächter gegen pos. Schreibt in dieselben Entry-Felder,
    // die _p2pUpdatePeer rendert (kein zweiter Render-Pfad).
    // DIE KAPPE LIEST DIE WANDUHR (K60, Lehre 13 — Bewegung nie am Render-Signal): bis K60 verbrauchte jeder Takt höchstens
    // 10 Schritte, gleich wie lang er war. Ein Takt über 167 ms (der Lade-Takt eines Mitspielers unter seinem Ladeschirm,
    // ein langsames Gerät) verbrauchte weniger, als der Sender in derselben Zeit schickt — der Ghost fiel ohne Grenze
    // zurück (CI 38639169868: B sah A nach dessen Lauf 1,924 m daneben, ohne eine einzige Regung). Jetzt trägt ein Takt
    // von dt Sekunden bis zu `aufholJeSchritt` × dt/FIXED_DT Schritte: bei 60 Hz zehn wie bisher, bei 2 Hz dreihundert.
    _lockstepTickPeers(nowMs) {
        const p2p = this.state.p2p;
        if (!p2p) return;
        const vorMs = p2p._lockstepTickMs;
        p2p._lockstepTickMs = nowMs;
        if (p2p.lockstep === false || !p2p.peers || p2p.peers.size === 0) return;
        const fixMs = AnazhRealm.FIXED_DT * 1000;
        const kappe = Math.ceil(
            AnazhRealm.LOCKSTEP.aufholJeSchritt * (Number.isFinite(vorMs) ? Math.max(1, (nowMs - vorMs) / fixMs) : 1)
        );
        for (const [, entry] of p2p.peers) {
            const ls = entry.lockstep;
            if (!ls) continue;
            // Anker seedet einen frischen/ent-seedeten Ghost bzw. überbrückt eine seq-Lücke, auf des SENDERS
            // Zeitachse (ls.simT = a.t + dt: der Zustand ist post-Schritt seq). Fehlende Timestamps → -Infinity.
            // Die pos-Autorität wird zurückgesetzt — eine stale authX darf den frischen Seed nicht ent-seeden.
            const a = ls.anchor;
            if (a && (!ls.seeded || ls.bufStart > ls.doneSeq + 1)) {
                if (a.s >= ls.bufStart - 1 && a.s < ls.bufStart + ls.buf.length) {
                    const fin = (v, d) => (Number.isFinite(v) ? v : d);
                    ls.x = a.x;
                    ls.y = a.y;
                    ls.z = a.z;
                    ls.vel.setValue(a.vx || 0, a.vy || 0, a.vz || 0);
                    ls.fieldVy = a.fy || 0;
                    ls.wasGrounded = !!a.wg;
                    ls.groundedCache = !!a.gc;
                    ls.groundedCachedAt = fin(a.gt, -Infinity);
                    ls.isInAir = !!a.ia;
                    ls.isJumping = !!a.ij;
                    ls.lastGroundedTime = fin(a.lg, -Infinity);
                    ls.groundNormalY = fin(a.ny, 1);
                    ls.onSteepSlope = !!a.ss;
                    ls.underwater = !!a.uw;
                    ls.eyesUnder = !!a.eu;
                    ls.lastMoveT = fin(a.lm, -Infinity);
                    ls.spaceWasDown = !!a.sw;
                    ls.jumpPressedAt = fin(a.jpa, -Infinity);
                    ls.simT = fin(a.t, ls.simT) + AnazhRealm.FIXED_DT;
                    ls.speed = fin(a.sp, ls.speed);
                    ls.sprintSpeed = fin(a.ssp, ls.sprintSpeed);
                    ls.jumpPower = fin(a.jp, ls.jumpPower);
                    ls.leibKg = fin(a.kg, ls.leibKg);
                    ls.authX = ls.authY = ls.authZ = NaN;
                    if (ls.trace) ls.trace.length = 0; // Debug-Trace = nur der aktuell geseedete Lauf
                    const drop = a.s - ls.bufStart + 1;
                    if (drop > 0) {
                        ls.buf.splice(0, drop);
                        ls.bufStart += drop;
                    }
                    ls.doneSeq = a.s;
                    ls.seeded = true;
                    ls.anchor = null;
                }
            }
            // Drift-Wächter: der Ghost gegen die pos-Autorität (Welt-Differenzen beim Peer:
            // Teleport/Rescue/ungeladene Struktur) → ent-seeden, der nächste Anker heilt.
            if (ls.seeded && Number.isFinite(ls.authX)) {
                const dx = ls.x - ls.authX,
                    dy = ls.y - ls.authY,
                    dz = ls.z - ls.authZ;
                if (dx * dx + dy * dy + dz * dz > AnazhRealm.LOCKSTEP.driftMax * AnazhRealm.LOCKSTEP.driftMax) {
                    ls.seeded = false;
                    entry.x = ls.authX;
                    entry.y = ls.authY;
                    entry.z = ls.authZ;
                    // Autorität mit-verwerfen: sie ist ab jetzt stale und darf den
                    // NÄCHSTEN Anker-Seed nicht sofort wieder töten (der Deadlock-Zyklus).
                    ls.authX = ls.authY = ls.authZ = NaN;
                    continue;
                }
            }
            if (!ls.seeded) continue;
            // Verbrauch: anschlussfähig (bufStart == doneSeq+1 per Konstruktion nach dem Anker),
            // mit 2-Frame-Reserve (Netz-Jitter) und der Wanduhr-Kappe (Aufhol-Burst gedeckelt, `kappe` oben).
            let n = 0;
            const px = ls.x,
                pz = ls.z;
            while (ls.buf.length > AnazhRealm.LOCKSTEP.jitterReserve && n < kappe) {
                if (ls.bufStart !== ls.doneSeq + 1) break; // nicht anschlussfähig → Anker abwarten
                const f = ls.buf.shift();
                ls.bufStart++;
                this._lockstepStepGhost(ls, f[0], f[1], f[2], f[3]);
                ls.doneSeq++;
                n++;
                if (ls.trace) {
                    ls.trace.push({ q: ls.doneSeq, x: ls.x, y: ls.y, z: ls.z });
                    if (ls.trace.length > 2400) ls.trace.shift();
                }
            }
            if (n > 0) {
                ls.lastStepAt = nowMs;
                entry.x = ls.x;
                entry.y = ls.y;
                entry.z = ls.z;
                entry.yaw = ls.yaw;
                const movedSq = (ls.x - px) * (ls.x - px) + (ls.z - pz) * (ls.z - pz);
                if (movedSq > 0.00022) entry.lastMovedAt = nowMs / 1000;
            }
        }
    }

    initP2PUI() {
        const toggle = document.getElementById("p2p-toggle");
        const urlInput = document.getElementById("p2p-url");
        const roomInput = document.getElementById("p2p-room");
        const roomCopyBtn = document.getElementById("p2p-room-copy");
        const statusEl = document.getElementById("p2p-status");
        if (!toggle || !urlInput || !statusEl) return;
        // UI auf gespeicherten Stand setzen
        urlInput.value = this.state.p2p.url || AnazhRealm.P2P_DEFAULT_WS_URL;
        if (roomInput) roomInput.value = this.state.p2p.roomOverride || "";
        this.p2pUpdateStatus();
        urlInput.addEventListener("change", () => {
            this.state.p2p.url = urlInput.value.trim() || AnazhRealm.P2P_DEFAULT_WS_URL;
            this.p2pPersist();
            this.p2pUpdateStatus();
        });
        if (roomInput) {
            roomInput.addEventListener("change", () => {
                this.state.p2p.roomOverride = roomInput.value.trim();
                this.p2pPersist();
                // Wenn aktuell verbunden: neu verbinden mit neuem Raum
                if (this.state.p2p.enabled) {
                    this.initP2PSync(null);
                }
                this.p2pUpdateStatus();
            });
        }
        if (roomCopyBtn) {
            roomCopyBtn.addEventListener("click", () => {
                // Kopiere die AKTUELL VERWENDETE Raum-ID (Override > worldId)
                const room =
                    (this.state.p2p.roomOverride || "").trim() ||
                    (this.state.worldMeta && this.state.worldMeta.worldId) ||
                    "";
                if (!room) return;
                if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(room).catch(() => {
                        // Fallback: zeige Raum im Status-Text
                        if (statusEl) statusEl.textContent = `Raum-ID: ${room}`;
                    });
                } else if (statusEl) {
                    statusEl.textContent = `Raum-ID: ${room}`;
                }
            });
        }
        // Der Knopf liest die EINE Absicht: an → aus (der einzige Ausgang), aus → die Tür (sie setzt die Absicht selbst).
        // Seine Beschriftung zeichnet p2pUpdateStatus aus derselben Absicht.
        toggle.addEventListener("click", () => {
            if (this.state.p2p.enabled) {
                this.state.p2p.enabled = false;
                this.shutdownP2PSync();
            } else {
                this.initP2PSync(null);
            }
            this.p2pPersist();
            this.p2pUpdateStatus();
        });
        // W7 Phase 2 — Resync-Knopf: ein Guest holt die Welt des Hosts frisch
        // über das Mesh (heilt eine ggf. divergierte Welt).
        const resyncBtn = document.getElementById("p2p-resync");
        if (resyncBtn) {
            resyncBtn.addEventListener("click", () => {
                // Der Resync ersetzt die aktuelle Welt durch die des Hosts —
                // lokale Änderungen seit dem Join gehen verloren. Rückfrage
                // wie bei importVibePass (eine ersetzende Geste).
                if (
                    typeof window !== "undefined" &&
                    typeof window.confirm === "function" &&
                    !window.confirm("Welt vom Host neu holen? Deine aktuelle Welt wird durch die des Hosts ersetzt.")
                ) {
                    return;
                }
                const res = this._p2pRequestWorldResync();
                if (!res.ok) {
                    const reason =
                        {
                            no_mesh: "Mesh steht noch nicht.",
                            no_host: "Kein Host im Raum gefunden.",
                            no_channel: "Kein offener Kanal zum Host.",
                            send_failed: "Anfrage konnte nicht gesendet werden.",
                        }[res.reason] || res.reason;
                    if (statusEl) statusEl.textContent = `Resync nicht möglich: ${reason}`;
                }
            });
        }
        // W7 Phase 3 — „Stimme teilen"-Knopf: Opt-in zum LLM-Pool.
        const voiceBtn = document.getElementById("p2p-voice-share");
        if (voiceBtn) {
            voiceBtn.addEventListener("click", () => {
                const now = !this.state.p2p.voiceShared;
                const applied = this.setVoiceShared(now);
                if (now && !applied && statusEl) {
                    statusEl.textContent = "Stimme teilen braucht ein aktives eigenes LLM.";
                }
            });
        }
        // W7 Phase 4 — Public-Lobby-Steuerung.
        const lobbyPub = document.getElementById("p2p-lobby-publish-toggle");
        const lobbyLabel = document.getElementById("p2p-lobby-label");
        const lobbyRefresh = document.getElementById("p2p-lobby-refresh");
        const lobbyList = document.getElementById("p2p-lobby-list");
        if (lobbyPub) {
            lobbyPub.addEventListener("change", () => {
                if (lobbyPub.checked) {
                    const res = this.publishToLobby(lobbyLabel ? lobbyLabel.value : "");
                    if (!res.ok) {
                        lobbyPub.checked = false;
                        if (statusEl) statusEl.textContent = "Lobby: erst Multi-User verbinden.";
                    }
                } else {
                    this.unpublishFromLobby();
                }
            });
        }
        if (lobbyRefresh) {
            lobbyRefresh.addEventListener("click", () => {
                const res = this.requestLobbyList();
                if (!res.ok && statusEl) statusEl.textContent = "Lobby: erst Multi-User verbinden.";
            });
        }
        if (lobbyList) {
            lobbyList.addEventListener("click", (ev) => {
                const btn = ev.target && ev.target.closest("button[data-lobby-room]");
                if (btn) this.joinLobbyRoom(btn.dataset.lobbyRoom);
            });
        }
        this._renderLobbyUI();
    }

    // W7 Phase 4 — die Lobby-Liste rendern (Labels von Mitspielern sind
    // fremde Daten → textContent, kein innerHTML).
    _renderLobbyUI() {
        const listEl = document.getElementById("p2p-lobby-list");
        if (!listEl) return;
        const rooms = (this.state.p2p.lobby && this.state.p2p.lobby.rooms) || [];
        listEl.textContent = "";
        if (!rooms.length) {
            const empty = document.createElement("div");
            empty.className = "drawer-hint";
            empty.textContent = "Keine öffentlichen Räume — „Lobby durchsuchen“ klicken.";
            listEl.appendChild(empty);
            return;
        }
        for (const r of rooms) {
            if (!r || typeof r.room !== "string") continue;
            const row = document.createElement("div");
            row.className = "p2p-lobby-row";
            const name = document.createElement("span");
            name.className = "p2p-lobby-name";
            name.textContent = `${r.label || r.room.slice(0, 16)} · ${r.peers || 0} Spieler`;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = "Beitreten";
            btn.dataset.lobbyRoom = r.room;
            row.appendChild(name);
            row.appendChild(btn);
            listEl.appendChild(row);
        }
    }

    p2pUpdateStatus() {
        // Der Knopf zeigt die EINE Absicht (`enabled`), wer immer sie gesetzt hat — Knopf, Boot, Raum-Wechsel, Rejoin.
        const toggle = document.getElementById("p2p-toggle");
        if (toggle) {
            const an = this.state.p2p.enabled === true;
            toggle.setAttribute("aria-pressed", an ? "true" : "false");
            toggle.textContent = an ? "Deaktivieren" : "Aktivieren";
        }
        const statusEl = document.getElementById("p2p-status");
        if (statusEl) {
            const p = this.state.p2p;
            if (!p.enabled) {
                statusEl.textContent = "Inaktiv.";
            } else if (p.lastError) {
                statusEl.textContent = `Fehler: ${p.lastError}`;
            } else if (!p.connected) {
                statusEl.textContent = "Verbinde…";
            } else if (p._lastXferProgress) {
                // W7 Phase 2 — ein Welt-Transfer läuft.
                const x = p._lastXferProgress;
                statusEl.textContent = `Welt-Transfer: ${x.received}/${x.total} Stücke …`;
            } else {
                const room = p.room ? `${p.room.slice(0, 8)}…` : "—";
                const peerCount = p.peers.size;
                // W7 Phase 1 — Transport sichtbar machen: Mesh (peer-to-peer)
                // sobald alle Kanäle stehen, sonst Relay über den Server.
                const transport = peerCount > 0 ? (p.meshActive ? " · Mesh p2p" : " · Server-Relay") : "";
                // W7 Phase 3 — Hinweis: nutzt der Chat eine geteilte Stimme?
                let voice = "";
                if (p.voiceShared && this._p2pVoiceCapable()) voice = " · Stimme geteilt";
                else if (typeof this._p2pVoiceAvailable === "function" && this._p2pVoiceAvailable())
                    voice = " · geteilte Stimme nutzbar";
                statusEl.textContent = `Verbunden (Raum ${room}, ${peerCount} Mitspieler${transport}${voice}).`;
            }
        }
        // W16 Phase 2 — den Welt-Katalog der „Welt vom Mitspieler holen"-
        // Sektion mitziehen, sobald sich die Mitspieler-Liste ändert (der
        // Signatur-Wächter macht das billig, wenn sich nichts geändert hat).
        this._renderMeshWorldCatalog();
        // W7 Phase 2 — Resync-Knopf: nur für einen Guest mit stehendem Mesh
        // sichtbar (er holt die Welt des Hosts frisch).
        const resyncBtn = document.getElementById("p2p-resync");
        if (resyncBtn) {
            const p = this.state.p2p;
            const show = p.enabled && p.connected && p.meshActive && p.role === "guest";
            resyncBtn.hidden = !show;
        }
        // W7 Phase 3 — „Stimme teilen"-Knopf: nur sichtbar, wenn ich ein
        // eigenes aktives LLM habe (sonst gibt es nichts zu teilen).
        const voiceBtn = document.getElementById("p2p-voice-share");
        if (voiceBtn) {
            const capable = this._p2pVoiceCapable();
            voiceBtn.hidden = !capable;
            const on = !!this.state.p2p.voiceShared;
            voiceBtn.setAttribute("aria-pressed", on ? "true" : "false");
            voiceBtn.textContent = on ? "Stimme geteilt ✓" : "Stimme teilen";
        }
        // Ring 11.5: Banner mit Connection-Stand aktualisieren (Host:
        // peerCount, Guest: connected-Indikator).
        if (typeof this._renderHostBanner === "function") this._renderHostBanner();
        if (typeof this._renderGuestBanner === "function") this._renderGuestBanner();
    }

    // DIE EINGANGS-WAND DES ERBGUTS: eine fremde Welt tritt nur ein, wenn dieser Build ihr Erbgut trägt — dieselbe
    // Normalform wie beim Erwachen (`erbgutNormal` im Gelände-Gesetzbuch). Leser: jede Tür, durch die ein Snapshot zur
    // Welt wird (Welt-Tor daneben/ersetzen `importWorldBeside` · `_weltTorImportReplace`, die Einladung
    // `_importGuestWorld`, der Snapshot eines Mitspielers `_p2pApplyWorldSnapshot`). Bis 10.10. nahmen die Türen jedes
    // Erbgut an (`ok:true`): der Zeiger stand auf der Welt, und jeder Reload scheiterte am Ladeschirm. Liefert den Grund
    // der Absage oder null.
    static _erbgutEinlass(snapshot) {
        const meta = snapshot && typeof snapshot === "object" ? snapshot.worldMeta : null;
        try {
            globalThis.__gelaendeCore.erbgutNormal(meta && typeof meta === "object" ? meta.erbgut : undefined);
            return null;
        } catch (e) {
            return String((e && e.message) || e);
        }
    }

    // DIE WELT REIST NUR ZU EINEM LESER IHRES ERBGUTS (Plan R11): ein Build vor dem Erbgut kennt `worldMeta.erbgut` nicht
    // (must-ignore) und zeichnete still Wildnis unter die Welt und ihre Häuser. Eine Welt, deren Erbgut nicht die Wildnis
    // allein ist, reist darum nur zu einem Empfänger, der sein Lesen im Protokoll erklärt (`erbgut` ≥
    // `AnazhRealm.ERBGUT_PROTOKOLL` in world-request und world-pull); sonst verweigert der Sender benannt. Leser: der Host
    // (`_p2pMsgWorldRequest`), der Mitträger (`_p2pMaybeServeAsCarrier`), der Mesh-Resync (`_p2pHandleWorldPull`).
    // Liefert den Grund der Absage oder null.
    static _erbgutTeilbar(meta, msg) {
        let terme;
        try {
            terme = globalThis.__gelaendeCore.erbgutNormal(meta && typeof meta === "object" ? meta.erbgut : undefined);
        } catch (e) {
            return String((e && e.message) || e);
        }
        // Die Wildnis allein OHNE Regler reist zu jedem; trägt der Wildnis-Term Regler des Gelände-Studios (eine Plan-Welt),
        // zeichnete ein Build vor ihnen die Standard-Landform darunter — sie reist nur zur Stufe 2.
        if (terme.length === 1 && terme[0].art === "wildnis" && Object.keys(terme[0]).length === 1) return null;
        const kann = msg && typeof msg.erbgut === "number" && Number.isFinite(msg.erbgut) ? msg.erbgut : 0;
        if (kann >= AnazhRealm.ERBGUT_PROTOKOLL) return null;
        return `der Empfänger liest kein Erbgut (Protokoll ${kann} < ${AnazhRealm.ERBGUT_PROTOKOLL}) — die Welt [${terme
            .map((t) => t.art)
            .join(", ")}] reist nicht`;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_netz_p2p]);

// ===== ATLAS · Netz/p2p — Außen-Konstanten =====
// Lockstep-MP (nur Inputs übers Netz): `jitterReserve` = Frame-Reserve gegen Netz-Jitter (2 Frames
// ≈ 33 ms Anzeige-Latenz des Fremd-Charakters), `aufholJeSchritt` = Aufhol-Burst-Kappe je Fix-Schritt WANDUHR (ein Takt
// von dt Sekunden verbraucht höchstens aufholJeSchritt × dt/FIXED_DT, mindestens aufholJeSchritt — `_lockstepTickPeers`),
// `driftMax` (m) = Ghost-vs-pos-Schwelle fürs Ent-Seeden (der 1-Hz-Anker heilt danach).
AnazhRealm.LOCKSTEP = Object.freeze({ jitterReserve: 2, aufholJeSchritt: 10, driftMax: 2.5 });

// Welt-Snapshot übers Mesh: ein Guest holt die Host-Welt in Stücken über den RTCDataChannel (WS hatte
// ein 1-MiB-Limit). 16 KiB ist die interop-sichere DataChannel-Nachrichtengröße; Backpressure über
// channel.bufferedAmount.
AnazhRealm.P2P_WORLD_CHUNK_SIZE = 16384;
// Backpressure-Schwelle: steigt `channel.bufferedAmount` darüber, pausiert der Sender —
// „16 Stücke dürfen im Puffer warten" (= 262144).
AnazhRealm.P2P_BACKPRESSURE_BYTES = 16 * AnazhRealm.P2P_WORLD_CHUNK_SIZE;
AnazhRealm.P2P_DEFAULT_WS_URL = "ws://127.0.0.1:4313";
// Rejoin-Backoff: BASE·2^n, Deckel MAX, plus deterministischer Jitter in [0, JITTER) ms (FNV-1a über
// Versuchszähler+peerId — seeded statt Math.random). EINE Formel (_p2pReconnectDelayMs) für
// WS-Rejoin UND RTC-Heilung.
AnazhRealm.P2P_RECONNECT_BASE_MS = 1000;
AnazhRealm.P2P_RECONNECT_MAX_MS = 30000;
AnazhRealm.P2P_RECONNECT_JITTER_MS = 1000;
// Snapshot-Puffer des Nicht-Lockstep-pos-Pfads: der Render blickt fest INTERP_DELAY ms zurück
// (Valve-Source-Muster, 100–150 ms) und interpoliert zwischen den zwei passenden Snaps; BUF_MAX
// deckelt den Puffer (~0.7 s bei 30 Hz).
AnazhRealm.P2P_SNAP_INTERP_DELAY_MS = 120;
AnazhRealm.P2P_SNAP_BUF_MAX = 20;
// W7 Phase 2 — Mindestabstand zwischen zwei world-pull-Antworten an
// denselben Peer. Schützt vor pull-Spam (jeder Pull serialisiert + sendet
// die ganze Welt — ohne Limit ein DoS-Vektor).
AnazhRealm.P2P_PULL_COOLDOWN_MS = 5000;
// DIE ERBGUT-STUFE DES PROTOKOLLS: wer eine Welt erbittet (world-request, world-pull), erklärt, dass er
// `worldMeta.erbgut` liest und eine unbekannte Term-Art ablehnt (`_erbgutEinlass`). Ein Sender reicht eine Welt, deren
// Erbgut nicht die Wildnis allein ist, nur einem Empfänger mit dieser Stufe (`_erbgutTeilbar`) — ein Build davor
// zeichnete sie still als Wildnis. Stufe 2 (K16b): der Empfänger liest auch die Regler im Wildnis-Term (eine Welt aus
// einem Plan des Gelände-Studios).
AnazhRealm.ERBGUT_PROTOKOLL = 2;

// Mesh-Welt-Verteilung: ein vendortes Welt-Bündel reist in P2P_WORLD_CHUNK_SIZE-Stücken über den
// DataChannel. Mindestabstand zwischen zwei bundle-pull-Antworten an denselben Peer — Read + Versand
// sind teuer, ohne Limit ein DoS-Vektor.
AnazhRealm.P2P_BUNDLE_PULL_COOLDOWN_MS = 5000;
// Weicher Pull-Timeout: hängt ein Bündel-Pull länger, gibt _p2pCheckBundlePullTimeout ihn frei
// (der Sender verschwand vermutlich mitten im Chunk-Strom).
AnazhRealm.P2P_BUNDLE_PULL_TIMEOUT_MS = 30000;

// LLM-Pool: ein Peer mit aktivem LLM teilt seine „Stimme", schlüssellose Peers routen Chat darüber.
// Fremder Prompt über meinen Key → Opt-in + Rate-Limit: Cooldown je anfragendem Peer, Timeout für
// den Anfrager, Prompt-Längen-Deckel.
AnazhRealm.P2P_VOICE_COOLDOWN_MS = 6000;
AnazhRealm.P2P_VOICE_TIMEOUT_MS = 30000;
AnazhRealm.P2P_VOICE_PROMPT_MAX = 2000;
// F2 (gigant-plan §5 — G3): die Mesh-Protokoll-Version. Empfänger tolerieren
// fremde Versionen (Felder, die sie nicht kennen, ignorieren sie) — Koexistenz
// alter + neuer Clients im selben Raum. Bump nur bei INKOMPATIBLEN Änderungen.
AnazhRealm.PROTO_VERSION = 1;
// Φ1 — die kanonischen Felder einer Welt-Adresse (deterministische Serialisierung
// für Sig/Hash). Reihenfolge ist FROZEN; weitere Felder wandern in die unsignierte
// Hülle (must-preserve), nicht in den signierten Kern.
AnazhRealm.WORLD_ADDRESS_SIGNED_FIELDS = Object.freeze(["worldId", "roomId", "broker", "label"]);
// Regions-Archipel: REGION_CHUNKS=8 (≈ 346 m Kante; ein Snapshot passt in ~200 ms @ 1 MB/s).
// Welten mit Sichtkante > Region bräuchten ≥ 13; die Hysterese (10 m) verhindert Flackern am
// Grenz-Übertritt.
AnazhRealm.REGION_CHUNKS = 8;
// subworld-net-Eingang vom Mesh-Peer (_cpRate-Muster): max je Sekunde je Peer. Der Sender deckelt
// sich selbst (SUBWORLD_NET_RATE_MAX), ein böswilliger Peer ignoriert das — der Empfänger-Deckel ist
// die echte Wand.
AnazhRealm.SUBWORLD_NET_PEER_RATE_MAX = 120;
AnazhRealm.SUBWORLD_POSE_PEER_RATE_MAX = 15;
// Mesh-Router-Dispatch-Table: p2pHandleMessage mappt den WS-Nachrichtentyp auf eine
// `_p2pMsg<Type>`-Methode — ein neuer Typ ist ein Eintrag + eine Methode. Kanal-exklusive Typen
// (world-pull, llm-request, subworld-srv, …) laufen bewusst über _p2pHandleChannelMessage.
AnazhRealm.P2P_MESSAGE_HANDLERS = Object.freeze({
    welcome: "_p2pMsgWelcome",
    stats: "_p2pMsgStats", // M8 — das Makro-Fenster
    "peer-join": "_p2pMsgPeerJoin",
    "peer-leave": "_p2pMsgPeerLeave",
    "lobby-rooms": "_p2pMsgLobbyRooms",
    "world-presence": "_p2pMsgWorldPresence", // Φ4 — regionale Köpfe einer Welt
    "creature-pos": "_p2pMsgCreaturePos",
    "companion-say": "_p2pMsgCompanionSay",
    "subworld-net": "_p2pMsgSubworldNet",
    "subworld-pose": "_p2pMsgSubworldPose",
    "portal-invite": "_p2pMsgPortalInvite",
    pos: "_p2pMsgPos",
    input: "_p2pMsgInput", // V18.382 — Lockstep-MP Stufe 2: der Input-Strom (seq · yaw · Bitmask)
    dsl: "_p2pMsgDsl",
    soul: "_p2pMsgSoul",
    vibe: "_p2pMsgVibe",
    "rtc-offer": "_p2pMsgRtcOffer",
    "rtc-answer": "_p2pMsgRtcAnswer",
    "rtc-ice": "_p2pMsgRtcIce",
    "world-request": "_p2pMsgWorldRequest",
    "world-snapshot": "_p2pMsgWorldSnapshot",
});

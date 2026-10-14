class AnazhRealm_Z14 {
    // ===== ATLAS §14 · PORTALE/SUB-WELTEN — Welt-Tor · Sandbox-Shim · Ko-Präsenz · Vendor =====
    // Säubert portalMeta. world muss ein same-origin relativer worlds/-Pfad
    // sein — kein "://", kein "..", kein führender Slash. Damit kann ein
    // Bauplan kein fremdes Origin ins iframe ziehen (die CSP bleibt
    // frame-src 'self'). Ungültiges world fällt auf die Skelett-Welt zurück.
    _sanitizePortalMeta(portalMeta, fallbackLabel) {
        const src = portalMeta && typeof portalMeta === "object" ? portalMeta : {};
        let world = String(src.world || "").trim();
        if (!/^worlds\/[\w./-]+$/.test(world) || world.includes("..")) {
            world = AnazhRealm.PORTAL_SKELETON_WORLD;
        }
        const label =
            typeof src.label === "string" && src.label.trim()
                ? src.label.trim().slice(0, 60)
                : String(fallbackLabel || "Portal").slice(0, 60);
        // Manifest: welche DSL-Wörter die Welt versteht — extern vom Registry/Bauplan autoriert
        // (Stufe „übersetzt"). Fehlt es → Stufe „ausgestellt" (Welt stumm gegenüber der DSL). Meldet die
        // Welt es im ready-Handshake selbst (Stufe „nativ", _portalReceiveManifest), gewinnt das.
        const dsl = this._sanitizeDslSubset(src.dsl);
        const meta = { world, label, dsl };
        // KI-Übersetzer Phase 2 — eine übersetzte Welt teilt sich den
        // generischen Renderer worlds/translated/; translatedWorldId sagt
        // ihm beim enter-Handshake, welche Szene er aufbauen soll.
        if (typeof src.translatedWorldId === "string" && /^[a-z0-9_-]{1,40}$/.test(src.translatedWorldId)) {
            meta.translatedWorldId = src.translatedWorldId;
        }
        // V8.70 — die Vertrauensstufe. „sandboxed" → das Portal-iframe bekommt
        // allow-scripts ALLEIN (null-origin); alles andere ist „trusted".
        meta.trust = src.trust === "sandboxed" ? "sandboxed" : "trusted";
        // Server-Modus: "relay" (Default) = das Mesh broadcastet, das Mesh IST der Server;
        // "js-compute" = autoritative Server-JS, ein Peer der Gruppe wird Compute-Host und führt sie aus.
        meta.serverMode = src.serverMode === "js-compute" ? "js-compute" : "relay";
        // Multiplayer-Welt: das Portal lädt sie mit dem Transport-Shim (`?anazh-shim=1`), ihr
        // WebSocket-Verkehr quert die Sandbox-Grenze als postMessage. js-compute impliziert Multiplayer.
        meta.multiplayer = src.multiplayer === true || meta.serverMode === "js-compute";
        // Welt deklariert das Ko-Präsenz-Protokoll (peer-join/peer-state/peer-leave über die Brücke): das
        // Mesh trägt Posen, die Welt rendert die Avatare in IHRER Engine. Vom Registry-/Bauplan-Autor
        // gesetzt oder im ready-Handshake selbst gemeldet (po.coPresence, dieselbe Hebung wie das Manifest).
        meta.coPresence = src.coPresence === true;
        return meta;
    }

    // Die EINE Quelle der Ko-Präsenz-Stufe einer Portal-Welt:
    // 2 = Welt deklariert das Ko-Präsenz-Protokoll (man sieht sich IN der fremden Engine);
    // 1 = eigener Multiplayer-Begriff (Transport-Shim + Mesh tragen ihre Server-Logik);
    // 0 = Einzelwelt (jeder in eigener Instanz, die Gruppe sieht sich nur im Vorraum).
    // Leser: Portal-Hinweis + Einladungs-Banner — der Spieler erfährt die Stufe VOR dem Tor.
    _portalCoPresenceTier(meta) {
        if (meta && meta.coPresence === true) {
            return { tier: 2, label: "Ko-Präsenz — ihr seht euch in dieser Welt" };
        }
        if (meta && meta.multiplayer === true) {
            return { tier: 1, label: "Multiplayer — die Welt verbindet euch übers Mesh" };
        }
        return { tier: 0, label: "Einzelwelt — jeder reist in seiner eigenen Instanz" };
    }

    // W18-A — der EINE Schreiber des Portal-Hinweises (V9.82: vorher setzten
    // _buildPortalOverlay UND _portalReceiveManifest den Text parallel).
    // Esc-Zeile + DSL-Fähigkeit + die ehrliche Ko-Präsenz-Stufe.
    _portalRefreshHint(po) {
        const target = po || this._portalOverlay;
        if (!target || !target.hintEl) return;
        const parts = [
            target.dsl ? "Esc — Heimkehr · Konsole — Befehle an diese Welt" : "Esc — zurück zur Heimat-Welt",
        ];
        parts.push(this._portalCoPresenceTier(target).label);
        // W18-C — die Input-Brücke ist aktiv: deine Tasten wirken drinnen.
        if (target.inputActions && target.inputActions.length) {
            parts.push("deine Tasten wirken (WASD · Pfeile)");
        }
        // W18-D — du WOHNST hier: Esc ist nur der kurze Heimweg.
        const dwell = this._loadPortalDwelling();
        if (dwell && this._resolvePortalWorldId(target) === dwell.worldId) {
            parts[0] = `Esc — kurz heim (du wohnst hier · „ziehe heim" beendet das Wohnen)`;
        }
        target.hintEl.textContent = parts.join(" · ");
    }

    // Die EINE Quelle des Sandbox-Attributs eines Sub-Welt-iframes. `trusted` (eigener Code):
    // allow-scripts + allow-same-origin (darf manifest.json fetchen). `sandboxed` (fremde Engine):
    // allow-scripts ALLEIN → null-origin, kein Zugriff auf localStorage/DOM/Cookies.
    // Invariante: eine sandboxed Welt trägt NIE allow-same-origin.
    _portalSandboxAttr(meta) {
        const sandboxed = meta && meta.trust === "sandboxed";
        // trusted Welten dürfen den Zeiger fangen: jedes sandbox-Attribut blockt Pointer-Lock ohne
        // den Token allow-pointer-lock. Die sandboxed null-origin-Wand bleibt allow-scripts ALLEIN.
        return sandboxed ? "allow-scripts" : "allow-scripts allow-same-origin allow-pointer-lock";
    }

    // Lokalitäts-Beweis (mutiert nichts): sandboxed nie allow-same-origin, `vendored` unforgeable
    // sandboxed (ein Manifest-Eintrag kann es nicht aufweichen), kein Welt-Pfad zum innersten Ring (R0).
    // Die echte null-origin-Isolation beweist scripts/smoke-sandbox.cjs im Browser.
    _localityAudit() {
        const out = { ok: true, facts: {} };
        // (1) sandboxed → allow-scripts ALLEIN (kein same-origin).
        const sbAttr = this._portalSandboxAttr({ trust: "sandboxed" });
        out.facts.sandboxedAttr = sbAttr;
        out.facts.sandboxedNoSameOrigin = sbAttr === "allow-scripts";
        // (2) trusted → allow-scripts allow-same-origin (unser eigener Code).
        const trAttr = this._portalSandboxAttr({ trust: "trusted" });
        out.facts.trustedAttr = trAttr;
        out.facts.trustedHasSameOrigin = trAttr.indexOf("allow-same-origin") >= 0;
        // (3) `vendored` erzwingt sandboxed unforgeable — selbst mit
        // trust:"trusted" im rohen Manifest (die Defense-in-Depth-Wand).
        let vendoredForced = false;
        if (typeof this._sanitizeImportedManifest === "function") {
            const m = this._sanitizeImportedManifest({
                id: "g8r3_probe",
                label: "Probe",
                world: "worlds/g8r3_probe/index.html",
                vendored: true,
                trust: "trusted",
            });
            vendoredForced = !!m && m.trust === "sandboxed";
        }
        out.facts.vendoredForcedSandboxed = vendoredForced;
        // (4) kein Welt-Pfad zum innersten Ring (R0 trägt den Beweis).
        const ringAudit = typeof this._sovereignStateAudit === "function" ? this._sovereignStateAudit() : { ok: false };
        out.facts.innerRingAbsent = ringAudit.ok === true;
        out.ok =
            out.facts.sandboxedNoSameOrigin &&
            out.facts.trustedHasSameOrigin &&
            out.facts.vendoredForcedSandboxed &&
            out.facts.innerRingAbsent;
        return out;
    }

    // Portal-Overlay: Vollbild-iframe lädt die Sub-Welt (portalMeta.world) sandboxed; Eltern-Seite des
    // postMessage-Handshakes (Avatar-Schnappschuss bei load und {type:"ready"}). Refs liegen auf
    // this._portalOverlay, damit _disposePortalOverlay sie tief räumt.
    _buildPortalOverlay(portalMeta, computeOpts) {
        if (this._portalOverlay) this._disposePortalOverlay();
        if (typeof document === "undefined") return null;
        // Defense-in-Depth: das world-Ziel wird hier nochmals gesäubert —
        // selbst ein manipuliertes portalMeta kann kein fremdes Origin laden.
        const meta = this._sanitizePortalMeta(portalMeta, "Portal-Welt");
        // Compute-Rolle einer js-compute-Welt: wer das Portal direkt betritt, wird Host (sein Tab führt die
        // Server-JS aus); Gäste routen ihren Verkehr an ihn und bekommen computeRole/hostPeerId über
        // joinPortalInvite.
        const opts = computeOpts && typeof computeOpts === "object" ? computeOpts : {};
        const isJsCompute = meta.serverMode === "js-compute";
        const computeRole = isJsCompute ? (opts.computeRole === "guest" ? "guest" : "host") : null;
        const hostPeerId =
            (typeof opts.hostPeerId === "string" && opts.hostPeerId) ||
            (computeRole === "host" ? this._portalSelfConnId() : null);
        const overlay = document.createElement("div");
        overlay.id = "portal-overlay";
        const iframe = document.createElement("iframe");
        iframe.className = "portal-frame";
        iframe.title = meta.label || "Portal-Welt";
        // Sandbox aus der Vertrauensstufe der Welt — EINE Quelle _portalSandboxAttr
        // (sandboxed: allow-scripts ALLEIN, nie allow-same-origin).
        iframe.setAttribute("sandbox", this._portalSandboxAttr(meta));
        const hint = document.createElement("div");
        hint.className = "portal-hint";
        // W18-A — der Hinweis kommt aus dem EINEN Schreiber (_portalRefreshHint,
        // nach dem _portalOverlay-Set unten): Esc-Zeile + DSL-Fähigkeit + die
        // ehrliche Ko-Präsenz-Stufe der Welt.
        overlay.appendChild(iframe);
        overlay.appendChild(hint);
        // W14 Phase 2 — „signiert von <Autor>"-Zeile. Verborgen, bis
        // _portalShowSignature eine Welt-Signatur findet.
        const sigEl = document.createElement("div");
        sigEl.className = "portal-sig";
        sigEl.hidden = true;
        overlay.appendChild(sigEl);
        // Eltern-Seite des Handshakes: auf {type:"ready"} der Sub-Welt lauschen.
        const onMessage = (event) => {
            if (!this._portalOverlay) return;
            const po = this._portalOverlay;
            // Nachrichten aus dem Server-Kontext-iframe (beim Compute-Host) tragen den `__anazhNet`-Envelope
            // (srv-send/srv-close-req); _portalSrvReceive routet zurück (Host lokal / Gast übers Mesh).
            if (po.serverIframe && event.source === po.serverIframe.contentWindow) {
                const sm = event.data;
                if (sm && sm.__anazhNet === true) this._portalSrvReceive(sm);
                return;
            }
            if (event.source !== iframe.contentWindow) return;
            // Der EINE Kanal-Bucket deckelt die Gesamtrate aller Sub→Heim-Nachrichten (auch ready/exit/manifest);
            // Überschuss fällt still (verworfen, nicht gepuffert) — eine flutende Sub-Welt drosselt sich selbst.
            if (!this._portalChannelAdmit(po, performance.now())) return;
            const msg = event.data;
            if (!msg || typeof msg !== "object") return;
            if (msg.type === "ready") {
                // W12 Phase 3 — meldet die Welt ihr eigenes Manifest mit,
                // übernimmt die Heimat es (Stufe „nativ").
                this._portalReceiveManifest(msg);
                // W18-B — eine Welt kann das Ko-Präsenz-Protokoll auch SELBST
                // melden (wie das native Manifest): ready {coPresence:true}
                // hebt die Stufe — der Hinweis sagt die neue Wahrheit.
                if (msg.coPresence === true && !po.coPresence) {
                    po.coPresence = true;
                    this._portalRefreshHint(po);
                }
                // ready {inputActions:[...]} deklariert die Input-Brücke: AnazhRealms Tasten erreichen die Welt
                // als semantische Aktionen.
                if (Array.isArray(msg.inputActions)) this._portalEnableInputBridge(msg.inputActions);
                // DER HANDSHAKE IST ENDLICH: nur die ERSTE ready je Overlay bekommt ein enter (der load-Hörer schickt
                // seins ohnehin, auch nach einem Reload der Welt). Sieben Studios beantworten jedes enter mit einer neuen
                // ready — die Antwort auf jede ready war ein Ping-Pong von 106–202 Runden je Betreten, bis der
                // Kanal-Deckel eine Meldung verwarf (gate:portal-konformanz K2).
                if (!po.enterAufReady) {
                    po.enterAufReady = true;
                    this._portalSendEnter();
                }
            }
            // Die Sub-Welt meldet Esc (Fokus liegt im iframe) → Heimkehr.
            else if (msg.type === "exit") this.exitPortal();
            // W12 Phase 3 — die Sub-Welt spricht zurück: ein Welt-Ereignis
            // wandert ins Heimat-Journal (geloggt, nie ausgeführt).
            else if (msg.type === "event") this._portalReceiveEvent(msg);
            // W18-B — die Sub-Welt meldet die Pose des LOKALEN Spielers
            // (Daten, nie Code); sie reist als subworld-pose übers Mesh zu
            // den Gefährten in DERSELBEN Welt.
            else if (msg.type === "local-pose") this._portalReceiveLocalPose(msg);
            // W18-D — die Sub-Welt exponiert ihren Zustand (Persistenz-Slot:
            // beim nächsten Betreten reist er als restoreState zurück).
            else if (msg.type === "state") this._portalReceiveState(msg);
            // R6 (V18.152) — die Sub-Welt REICHT eine Fähigkeit (Capability-
            // Inversion: DSL-Daten in die Quarantäne-Queue, NIE ausgeführt —
            // gewährt wird nur souverän).
            else if (msg.type === "capability") this._portalReceiveCapability(msg);
            // Studio-Übergabe: das Studio reicht die LIVE-Bearbeitung (Dials + Gestalt-Wahlen) an die Welt —
            // additiver Zusatz-Kanal wie settlement/event. Nur TRUSTED Welten; fail-closed am EINEN Empfänger
            // _studioUebergabeEmpfang (kind-Positivliste · Kern-Buch-Clamps · Taille-Cap · must-ignore).
            else if (msg.type === "uebergabe" && po.trust !== "sandboxed") this._studioUebergabeEmpfang(msg);
            // W17 Phase A — der Transport-Shim einer Multiplayer-Welt postet
            // ihren Netz-Verkehr (`__anazhNet`-Envelope, kein `type`-Feld).
            else if (msg.__anazhNet === true) this._portalNetReceive(msg);
        };
        window.addEventListener("message", onMessage);
        iframe.addEventListener("load", () => {
            this._portalSendEnter();
            // Die Tastatur gehört der Sub-Welt: ohne expliziten Fokus landen keydown-Events weiter auf der
            // Heimat-Welt, bis der Reisende ins iframe klickt. focus() wirft nicht; Esc-Heimkehr meldet die Welt.
            iframe.focus();
        });
        this._portalOverlay = {
            overlayEl: overlay,
            iframe,
            onMessage,
            hintEl: hint,
            sigEl,
            world: meta.world,
            label: meta.label,
            dsl: meta.dsl,
            // V8.70 — die Vertrauensstufe (sandboxed → null-origin): sagt
            // _portalSendEnter/_portalForwardDsl, mit welchem targetOrigin
            // gepostet werden muss („*" für die null-origin-Welt).
            trust: meta.trust,
            // KI-Übersetzer Phase 2 — gesetzt für eine übersetzte Welt: sagt
            // _portalSendEnter, welche deklarative Szene es mitschicken muss.
            translatedWorldId: meta.translatedWorldId || null,
            // Der Handshake beantwortet nur die erste ready mit einem enter (onMessage oben).
            enterAufReady: false,
            // W12 Phase 3 — Drei-Stufen-Klarheit: kein Manifest → ausgestellt;
            // portalMeta-Manifest → übersetzt; meldet die Welt ihr eigenes
            // (ready-Handshake) → nativ. _portalReceiveManifest hebt auf nativ.
            manifestStage: meta.dsl ? "übersetzt" : "ausgestellt",
            // W17 Phase A — eine Multiplayer-Welt: ihr `WebSocket`-Verkehr
            // fliesst über den Transport-Shim durch _portalNetReceive.
            multiplayer: meta.multiplayer === true,
            // Offene WebSocket-Kanäle des Sub-Welt-iframes (der Shim meldet ws-open/ws-close); ein
            // mesh-empfangener subworld-net wird in jeden zugestellt. netWindowStart/Count = Rate-Limit-Fenster.
            netChannels: new Set(),
            netWindowStart: 0,
            netWindowCount: 0,
            // W12 P3-Härtung — das Rate-Limit-Fenster des Portal-Rückkanals
            // (_portalReceiveEvent): eine flutende fremde Welt deckeln.
            eventWindowStart: 0,
            eventWindowCount: 0,
            // Server-Modus + Compute-Rolle: "relay" → das Mesh broadcastet; "js-compute" → ein Peer ist Host
            // (computeRole "host", serverIframe gesetzt), die anderen Gäste (hostPeerId zeigt auf ihn).
            // serverConns = offene Server-Verbindungen (je Peer eine); serverQueue puffert srv-*-Envelopes bis
            // das Server-iframe geladen ist (serverReady).
            serverMode: meta.serverMode,
            computeRole,
            hostPeerId,
            serverIframe: null,
            serverReady: false,
            serverQueue: [],
            serverConns: new Set(),
            // W17 Phase B-JS-Compute Phase 2 — die zuletzt vom Compute-Host
            // empfangene Roster (alle Sub-Welt-Mitglieder). Verlässt der Host
            // das Mesh, wählt jeder Gast daraus deterministisch den Nachfolger.
            roster: [],
            // Host-Migration MIT Zustand: der Host pollt den Server-Snapshot (stateTimer → srv-state-req) und
            // annonciert ihn als subworld-state (stateSeq monoton); ein Gast cacht den letzten (lastSrvState).
            stateTimer: null,
            stateSeq: 0,
            lastSrvState: null,
            // Ko-Präsenz-Injektion: das Mesh trägt die Posen, die Welt rendert die Avatare. peers = in DIESER
            // Sub-Welt gesehene Gefährten (peerId → {lastAt}); poseWindow* deckelt local-pose (~10 Hz + Reserve);
            // poseTimer = Abwesenheits-Sweep (peer-leave bei Stille). localPose = letzte angenommene EIGENE Pose,
            // die Lese-Fläche für Smoke/Diagnose (die null-origin-Welt ist von außen unlesbar).
            coPresence: meta.coPresence === true,
            peers: new Map(),
            poseWindowStart: 0,
            poseWindowCount: 0,
            poseTimer: null,
            localPose: null,
            // Input-Brücke: deklariert die Welt im ready-Handshake `inputActions`, hält inputActions die saubere
            // Auswahl und onInputKey den Parent-Tasten-Listener (lebt + stirbt mit dem Overlay).
            inputActions: null,
            onInputKey: null,
        };
        this._portalRefreshHint(this._portalOverlay);
        document.body.appendChild(overlay);
        // W14 Phase 2 — ist die Ziel-Welt mit einem Vibe-Pass versiegelt,
        // zeigt das Overlay „signiert von <Autor>". Heimat-seitige Signatur
        // (state.signedWorlds) — kein Warten auf den ready-Handshake nötig.
        this._portalShowSignature(meta.world);
        // Die Konsole übers Overlay heben — DSL-Eingabe im Portal möglich.
        document.body.classList.add("in-portal");
        // Multiplayer-Welt: Transport-Shim-Marker; der save-server injiziert den Shim in ihre index.html.
        // Der Query ändert die Basis-URL nicht — relative Welt-Ressourcen (lib/engine.js) lösen weiter auf.
        iframe.src = meta.multiplayer ? meta.world + "?anazh-shim=1" : meta.world;
        // W17 Phase B-JS-Compute — der Compute-Host baut seinen Server-Kontext
        // (ein zweites, verborgenes iframe). Erst NACH dem _portalOverlay-Set,
        // damit der Server-iframe-load-Listener den fertigen Overlay sieht.
        if (isJsCompute && computeRole === "host") this._portalSpawnServerContext();
        // Ein Gast meldet dem Compute-Host seine Verbindung beim Betreten an (Host registriert srv-open).
        // Geht die Meldung verloren (Kanal noch zu), registriert der erste subworld-srv-send sie nach.
        if (isJsCompute && computeRole === "guest" && hostPeerId) {
            this._p2pSendChannelTo(hostPeerId, {
                type: "subworld-srv",
                kind: "open",
                worldId: meta.world,
            });
        }
        return this._portalOverlay;
    }

    // W14 Phase 2 — die Signatur-Zeile im Portal-Overlay füllen. Resolved die
    // Welt-id aus dem Pfad, verifiziert die heimat-seitige Welt-Signatur und
    // zeigt „✓ signiert von <Autor>" — oder bleibt verborgen (unsigniert).
    _portalShowSignature(worldPath) {
        const po = this._portalOverlay;
        if (!po || !po.sigEl) return;
        // KI-Übersetzer Phase 2 — übersetzte Welten teilen sich den world-Pfad
        // (worlds/translated/); die translatedWorldId löst die richtige auf.
        const reg = po.translatedWorldId
            ? this._worldEntry(po.translatedWorldId)
            : this._libraryWorlds().find((w) => w.world === worldPath);
        if (!reg) return;
        this.verifyWorldSignature(reg.id).then((st) => {
            // Hat der Spieler das Portal vorher verlassen, ist po veraltet.
            if (this._portalOverlay !== po || !po.sigEl) return;
            const custom = this.state.customWorlds && this.state.customWorlds[reg.id];
            const sig =
                custom && custom.signature ? custom : this.state.signedWorlds && this.state.signedWorlds[reg.id];
            if (st === "valid" && sig) {
                const myKey = this.state.vibePass && this.state.vibePass.publicKeyHex;
                const who = sig.authorPubKey === myKey ? "dir" : this._vibeFingerprint(sig.authorPubKey);
                po.sigEl.textContent = `✓ signiert von ${who}`;
                po.sigEl.className = "portal-sig sig-valid";
                po.sigEl.hidden = false;
            } else if (st === "modified" || st === "forged") {
                po.sigEl.textContent = "⚠ Signatur dieser Welt ungültig";
                po.sigEl.className = "portal-sig sig-bad";
                po.sigEl.hidden = false;
            }
            // unsigned → die Zeile bleibt verborgen.
        });
    }

    // Avatar-Schnappschuss für die fremde Welt: Name + souveräne Identität + das Schaffen des Spielers
    // (aktive Seele, eigene Materialien/Werkzeuge — nur !builtIn), je Liste auf 16 gedeckelt.
    // Der PRIVATE Vibe-Pass-Schlüssel reist NIE mit — nur vibePassId + Fingerprint (öffentlich).
    _portalEnterPayload() {
        const player = this.state.player || {};
        const vp = this.state.vibePass || {};
        const payload = { name: (player.name && String(player.name)) || "Schöpfer" };
        if (vp.ready && vp.publicKeyHex) {
            payload.vibePassId = "ed25519:" + vp.publicKeyHex;
            payload.fingerprint = vp.fingerprint || this._vibeFingerprint(vp.publicKeyHex);
        }
        // Aktive Seele — die Form, die der Spieler trägt.
        const soulName = player.soul || "human";
        const custom = this.state.customSouls && this.state.customSouls[soulName];
        const builtin = this.playerSoulDefs && this.playerSoulDefs[soulName];
        const soul = {
            name: String(soulName),
            label: String((custom && custom.label) || (builtin && builtin.label) || soulName),
            custom: !!custom,
        };
        if (custom && Array.isArray(custom.bodyParts)) {
            soul.bodyParts = JSON.parse(JSON.stringify(custom.bodyParts.slice(0, 24)));
        }
        payload.soul = soul;
        // Eigene Materialien (Schaffen des Spielers, nicht die Built-ins).
        const materials = [];
        for (const name of Object.keys(this.state.materials || {})) {
            const m = this.state.materials[name];
            if (!m || m.builtIn) continue;
            materials.push({
                name: String(name),
                color: Number(m.color) || 0,
                tags: m.tags && typeof m.tags === "object" ? { ...m.tags } : {},
            });
            if (materials.length >= 16) break;
        }
        payload.materials = materials;
        // Eigene Werkzeuge.
        const tools = [];
        for (const name of Object.keys(this.state.tools || {})) {
            const t = this.state.tools[name];
            if (!t || t.builtIn) continue;
            tools.push({
                name: String(name),
                label: (t.label && String(t.label)) || String(name),
                opName: t.opName ? String(t.opName) : "",
                opClass: t.opClass ? String(t.opClass) : "",
            });
            if (tools.length >= 16) break;
        }
        payload.tools = tools;
        return payload;
    }

    // Sendet den Avatar-Schnappschuss an die Sub-Welt. Same-origin → das
    // Ziel-Origin ist bekannt (window.location.origin), kein "*" nötig.
    _portalSendEnter() {
        const po = this._portalOverlay;
        if (!po || !po.iframe || !po.iframe.contentWindow) return;
        const msg = { type: "enter", avatar: this._portalEnterPayload() };
        // Eine übersetzte Welt trägt ihre deklarative Szene (sanitiert in customWorlds); der Renderer in
        // worlds/translated/ baut sie auf. Die Szene ist DATEN — gerendert, nie ausgeführt.
        if (po.translatedWorldId) {
            const w = this.state.customWorlds && this.state.customWorlds[po.translatedWorldId];
            if (w && w.scene) msg.scene = w.scene;
        }
        // Persistenz-Slot: hat die Welt beim letzten Besuch ihren Zustand exponiert ({type:"state"}), bekommt
        // sie ihn als restoreState zurück (Daten, nie Code — die Welt entscheidet, was sie damit tut).
        const dwellWorldId = this._resolvePortalWorldId(po);
        if (dwellWorldId) {
            const saved = this._loadPortalStates()[dwellWorldId];
            if (saved && typeof saved.data === "string") msg.restoreState = saved.data;
        }
        // V8.70 — eine null-origin (sandboxed) Welt hat eine opake Herkunft;
        // ein gezieltes targetOrigin würde die Nachricht verwerfen → "*".
        po.iframe.contentWindow.postMessage(msg, po.trust === "sandboxed" ? "*" : window.location.origin);
    }

    // Räumt das Portal-Overlay: Message-Listener ab, Overlay-DOM raus,
    // Ref auf null. Idempotent.
    _disposePortalOverlay() {
        const po = this._portalOverlay;
        if (!po) return;
        // W17 Phase B-JS-Compute — ein Gast meldet dem Compute-Host das Ende
        // seiner Verbindung; der Host schliesst sie im Server-Kontext. Das
        // Server-iframe des Hosts wird mit dem Overlay-DOM mit-entfernt.
        if (po.serverMode === "js-compute" && po.computeRole === "guest" && po.hostPeerId) {
            this._p2pSendChannelTo(po.hostPeerId, {
                type: "subworld-srv",
                kind: "close",
                worldId: po.world,
            });
        }
        // F2 (G3, V18.126) — der kooperative Zustands-Poll endet mit dem Overlay.
        if (po.stateTimer) {
            clearInterval(po.stateTimer);
            po.stateTimer = null;
        }
        // W18-B — der Ko-Präsenz-Abwesenheits-Sweep endet mit dem Overlay.
        if (po.poseTimer) {
            clearInterval(po.poseTimer);
            po.poseTimer = null;
        }
        // W18-C — der Input-Brücken-Listener endet mit dem Overlay.
        if (po.onInputKey && typeof window !== "undefined") {
            window.removeEventListener("keydown", po.onInputKey);
            window.removeEventListener("keyup", po.onInputKey);
            po.onInputKey = null;
        }
        if (po.onMessage) window.removeEventListener("message", po.onMessage);
        if (po.overlayEl && po.overlayEl.parentNode) {
            po.overlayEl.parentNode.removeChild(po.overlayEl);
        }
        if (typeof document !== "undefined" && document.body) {
            document.body.classList.remove("in-portal");
        }
        this._portalOverlay = null;
    }

    // Portal betreten: der Game-Loop sieht _portalOverlay und friert die Heimat-Welt ein (Early-Return);
    // Pointer-Lock lösen, Overlay bauen. Ziel aus portalMeta des Bauplans; fehlt es (emergenter
    // Magie-Ring), greift im Overlay-Builder die Skelett-Welt.
    enterPortal(entry) {
        if (this._portalOverlay) return { ok: false, reason: "already_in_portal" };
        if (!entry || !entry.affordances || !entry.affordances.isPortal) {
            return { ok: false, reason: "not_a_portal" };
        }
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        const bpPortalMeta = bp && bp.portalMeta ? bp.portalMeta : null;
        // Signierte Welt-Adresse → WEB-Portal: Bestätigungs-Karte, dann joinWorldFromCode. Ungültige Adresse
        // fällt am Sieb auf den Sub-Welt-Pfad; bei "invalid" nie Auto-Join (Antikörper: lügendes Portal).
        // ENTRY-portalMeta gewinnt vor Blueprint-portalMeta — sonst trügen N Hallen-Slots dieselbe Welt.
        const entryPortalMeta = entry.portalMeta || null;
        const portalMeta = entryPortalMeta || bpPortalMeta;
        if (portalMeta && portalMeta.worldAddress) {
            return this._enterPortalToAddress(entry, portalMeta.worldAddress);
        }
        if (typeof document !== "undefined" && document.exitPointerLock) {
            try {
                document.exitPointerLock();
            } catch {
                /* Pointer-Lock war nicht aktiv — egal */
            }
        }
        // Wer ein js-compute-Portal direkt betritt, wird Compute-Host; ein Gast bekommt seine Rolle über
        // joinPortalInvite. Für ein Relay-Portal ist computeRole folgenlos.
        this._buildPortalOverlay(portalMeta, { computeRole: "host" });
        // V18.491.75 — Heimkehr braucht denselben Tor-Eintrag (Linger/Disarm).
        if (this._portalOverlay && entry && entry.id != null) this._portalOverlay.entryId = entry.id;
        const worldLabel = (portalMeta && portalMeta.label) || entry.type;
        this.log(`Portal betreten: „${worldLabel}"`, "INFO");
        // Erste Reise durch ein Tor → Journal via journalAppendOnce (Schlüssel = Welt-Pfad), damit
        // wiederholtes Betreten nicht flutet. Ereignisse drinnen kommen über _portalReceiveEvent.
        const worldKey = (portalMeta && portalMeta.world) || AnazhRealm.PORTAL_SKELETON_WORLD;
        this.journalAppendOnce(
            `portalVisit:${worldKey}`,
            "portal",
            `Du tratst zum ersten Mal durch das Tor „${worldLabel}".`
        );
        // Gruppen-Portal: Mitspieler bekommen eine „mitkommen?"-Einladung — nur bei Multiplayer-Portal (nur
        // dort verbindet B-Relay die Gruppe) und library-bekannter Welt (sonst liefert
        // _resolvePortalWorldId null).
        this._p2pBroadcastPortalInvite();
        return { ok: true };
    }

    // Durchs Portal in eine ADRESSIERTE Welt:
    // (1) _admitForeignWorldAddress siebt — kaputte Form fällt auf den Sub-Welt-Pfad zurück;
    // (2) Signatur async prüfen (valid · invalid · unsigned bestimmt den Ton der Karte);
    // (3) _portalAddressConfirm (Browser: confirm; headless: skipConfirm) — "invalid" nie Auto-Join;
    // (4) joinWorldFromCode mit dem Adress-Bundle als Einladungs-Code.
    async _enterPortalToAddress(entry, rawAddress) {
        const addr = this._admitForeignWorldAddress(rawAddress);
        if (!addr) {
            this.log("Portal-Adresse strukturell ungültig — fällt auf Sub-Welt-Pfad zurück", "WARN");
            // Fallback: heutiger enterPortal-Pfad (ohne worldAddress-Pfad zu
            // re-entrieren). Der Aufrufer hat dieses Portal schon als gültig
            // erkannt, wir nehmen einfach den Sub-Welt-Pfad ohne Adresse.
            const bp = this.state.blueprints && this.state.blueprints[entry.type];
            const portalMeta = bp && bp.portalMeta ? { ...bp.portalMeta, worldAddress: null } : null;
            this._buildPortalOverlay(portalMeta, { computeRole: "host" });
            this.log(`Portal betreten: „${entry.type}"`, "INFO");
            return { ok: true, fallback: true };
        }
        // Status der Signatur — beeinflusst die Karte, NICHT das Sieb (eine
        // unsignierte Adresse darf gejoint werden, sie ist nur "anonym").
        let status = "unsigned";
        if (addr.sig && addr.authorPubKey) {
            status = await this.verifyWorldAddress(addr);
        }
        // Karte zeigen — im Headless ein synchroner skipConfirm-Pfad.
        const confirmed = this._portalAddressConfirm(addr, status, entry);
        if (!confirmed) {
            this.log(`Portal „${addr.label}" — Reise abgebrochen.`, "INFO");
            return { ok: false, reason: "declined", status };
        }
        // Bei "invalid" KEIN Auto-Join (Antikörper-Wand) — nur über eine
        // bewusste Override-Geste (die wir hier NICHT exponieren; der Spieler
        // müsste das Portal anders nutzen). "unsigned" UND "valid" gehen.
        if (status === "invalid") {
            this.log(`Portal „${addr.label}" trägt eine UNGÜLTIGE Signatur — Reise verweigert.`, "WARN");
            return { ok: false, reason: "invalid_signature", status };
        }
        // Der bestehende Join-Flow (W11.5): broker + roomId → world-snapshot.
        const code = `anazh://${addr.broker.replace(/^wss?:\/\//i, "")}/${addr.roomId}`;
        this.log(`Reise zur Welt „${addr.label}" (${status}) — Adresse ${code}`, "INFO");
        // Der Beitritt geht durch DIE TÜR (`_importGuestWorld` → `_weltBetreten`): die alte Welt hält ihr Zeugnis fest und
        // sichert sich, die fremde wird unsere lokale Welt (role:"guest", kein Portal-Overlay), Sperre und Reload. Bis 10.10.
        // lud das Adress-Portal nie neu: der nächste saveState setzte den Aktiv-Zeiger auf die alte Welt zurück, und der
        // Beitritt verschwand still (Gegenprüfung Runde 3).
        return this.joinWorldFromCode(code, {
            slugHint: addr.label,
            zeugnisA: {
                key: `portalAddress:${addr.worldId}`,
                type: "portal",
                text: `Du tratst zum ersten Mal durch das Tor zur Welt „${addr.label}".`,
            },
        });
    }

    // Φ1 — die Bestätigungs-Karte. Im Browser ein confirm()-Dialog (R2-konform:
    // außerhalb jedes iframes, Klartext, frisch). Im Headless / opts.skipConfirm
    // → still bestätigt (Tests). status ∈ {"valid", "invalid", "unsigned"}.
    _portalAddressConfirm(addr, status, _entry) {
        if (typeof window === "undefined" || typeof window.confirm !== "function") {
            return true;
        }
        const author = addr.authorPubKey ? `${addr.authorPubKey.slice(0, 8)}…${addr.authorPubKey.slice(-4)}` : "anonym";
        const statusLabel =
            status === "valid"
                ? "Signatur GÜLTIG (verifiziert)"
                : status === "invalid"
                  ? "Signatur UNGÜLTIG — Warnung, das Portal könnte lügen"
                  : "unsigniert (anonyme Adresse)";
        const lines = [
            `Portal-Reise zur Welt „${addr.label}":`,
            "",
            `BROKER:  ${addr.broker}`,
            `RAUM:    ${addr.roomId}`,
            `AUTOR:   ${author}`,
            `STATUS:  ${statusLabel}`,
            "",
            status === "invalid"
                ? "Diese Adresse trägt eine kaputte Signatur — Reise wird verweigert."
                : "Hindurchgehen?",
        ];
        if (status === "invalid") {
            window.alert(lines.join("\n"));
            return false;
        }
        return window.confirm(lines.join("\n")) === true;
    }

    // W12 Phase 1 — ein Portal verlassen. Räumt das Overlay; der Game-Loop
    // sieht _portalOverlay = null und nimmt die Heimat-Welt wieder auf.
    exitPortal() {
        if (!this._portalOverlay) return { ok: false, reason: "not_in_portal" };
        const po = this._portalOverlay;
        const entryId = po && po.entryId != null ? po.entryId : null;
        const world = po && po.world ? po.world : null;
        const now = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
        this._disposePortalOverlay();
        // Tasten-Zustand verwerfen: ein keyup kann im iframe gelandet sein,
        // sonst liefe der Avatar nach der Heimkehr von selbst weiter.
        this.state.keys = {};
        // V18.491.75 — Heimkehr-Linger (Portal-Kontinuum): Membran/Nebel/Licht
        // am Ausgangstor bleiben ~2.2 s warm (Lab-openM-Analog), statt hartem
        // Insel-Schnitt iframe→kalt. Währenddessen unarmed (kein Sofort-Reenter).
        this._portalHeimkehr = { start: now, until: now + 2.2, entryId, world };
        if (this._portalMembranes && entryId != null) {
            const rec = this._portalMembranes.get(entryId);
            if (rec) {
                rec.armed = false;
                rec.lastLz = null;
            }
        }
        // Steuer-Kontinuum: Pointer-Lock zurück auf Host-Canvas (enter löste ihn).
        // requestPointerLock liefert ein PROMISE — seine Ablehnung (schon gelockt,
        // keine Geste) fängt try/catch nicht; ungefangen wäre sie ein Seiten-Fehler.
        try {
            const canvas = this.state && this.state.renderer && this.state.renderer.domElement;
            const gelockt = typeof document !== "undefined" && document.pointerLockElement === canvas;
            if (canvas && !gelockt && typeof canvas.requestPointerLock === "function") {
                const p = canvas.requestPointerLock();
                if (p && typeof p.catch === "function") p.catch(() => {});
            }
        } catch (_e) {
            /* Gesture/Policy — Heimkehr bleibt auch ohne Lock gültig */
        }
        this.log("Portal verlassen — zurück in der Heimat-Welt", "INFO");
        // W12 Phase 3 — die Heimkehr ist der Speicher-Punkt: die im Portal
        // gesammelten Erinnerungen (Erst-Besuch + Welt-Ereignisse) werden
        // mit dem regulären State-Snapshot dauerhaft.
        this.saveState();
        return { ok: true };
    }

    // DSL-Brücke: im Portal läuft ein Chat-DSL-Programm in der Sub-Welt statt auf der eingefrorenen
    // Heimat. portalMeta.dsl ist das Wörterbuch: kein Manifest → stumm; Op nicht im Subset → unbekannt;
    // Op im Subset → an den Welt-Adapter.
    _portalRouteDsl(program, describe, append) {
        const po = this._portalOverlay;
        const say = typeof append === "function" ? append : (m) => this.log(m, "INFO");
        if (!po) return { forwarded: false, reason: "not_in_portal" };
        const label = po.label || "diese Welt";
        if (!Array.isArray(po.dsl) || !po.dsl.length) {
            say(`„${label}" ist ausgestellt — sie versteht die DSL noch nicht.`);
            return { forwarded: false, reason: "exhibited" };
        }
        const ops = this._portalProgramOps(program);
        const unknown = ops.find((op) => !po.dsl.includes(op));
        if (!ops.length || unknown) {
            say(`„${label}" versteht „${unknown || "diesen Befehl"}" nicht.`);
            return { forwarded: false, reason: "unknown_op", op: unknown || null };
        }
        if (!this._portalForwardDsl(program)) {
            say(`„${label}" konnte den Befehl nicht empfangen.`);
            return { forwarded: false, reason: "no_frame" };
        }
        say(`→ ${describe || "an die Welt gesendet"}`);
        return { forwarded: true, reason: "sent" };
    }

    // Alle wirksamen Op-Namen eines DSL-Programms einsammeln; chain ist ein
    // struktureller Rahmen, nicht selbst ein Wort.
    _portalProgramOps(program) {
        const ops = [];
        const walk = (node) => {
            if (!Array.isArray(node) || typeof node[0] !== "string") return;
            if (node[0] === "chain") {
                for (let i = 1; i < node.length; i++) walk(node[i]);
            } else {
                ops.push(node[0]);
            }
        };
        walk(program);
        return ops;
    }

    // Ein DSL-Programm per postMessage an die Sub-Welt reichen (same-origin).
    _portalForwardDsl(program) {
        const po = this._portalOverlay;
        if (!po || !po.iframe || !po.iframe.contentWindow) return false;
        // V8.70 — "*" für eine null-origin (sandboxed) Welt (siehe _portalSendEnter).
        po.iframe.contentWindow.postMessage(
            { type: "dsl", program },
            po.trust === "sandboxed" ? "*" : window.location.origin
        );
        return true;
    }

    // Welt-eigenes Wort parsen: ist das erste Token ein Manifest-Op, das der DSL-Kern nicht kennt, wird
    // der Rest Argument (Zahl als Zahl, sonst String) — die DSL wächst am Rand, der Kern bleibt schlank.
    _portalParseWorldCommand(command) {
        const po = this._portalOverlay;
        if (!po || !Array.isArray(po.dsl)) return null;
        const tokens = String(command || "")
            .trim()
            .split(/\s+/);
        const op = (tokens[0] || "").toLowerCase();
        if (!op || !po.dsl.includes(op)) return null;
        const args = tokens.slice(1).map((t) => {
            const n = Number(t);
            return t !== "" && Number.isFinite(n) ? n : t;
        });
        return [op, ...args];
    }

    // Der EINE Kanal-Bucket pro Overlay: deckelt die Gesamtrate aller Sub→Heim-Nachrichten vor dem
    // Typ-Dispatch (Backstop über den per-Typ-Deckeln, fasst auch ready/exit/manifest). false = über
    // dem Deckel → VERWORFEN, nie gepuffert (Puffern verschiebt die Flut nur). Fenster-Zähler lazy.
    _portalChannelAdmit(po, now) {
        if (!po) return false;
        if (typeof po.chWindowStart !== "number") {
            po.chWindowStart = 0;
            po.chWindowCount = 0;
        }
        const t = typeof now === "number" ? now : performance.now();
        if (t - po.chWindowStart >= AnazhRealm.PORTAL_CHANNEL_RATE_WINDOW_MS) {
            po.chWindowStart = t;
            po.chWindowCount = 0;
        }
        if (po.chWindowCount >= AnazhRealm.PORTAL_CHANNEL_RATE_MAX) return false;
        po.chWindowCount++;
        return true;
    }

    // so nur gedeckelten Text ins Journal legen — kein Code, keine Mutation
    // des Heimat-States. Der Text wird auf 160 Zeichen gekappt, damit eine
    // fremde Welt keine Journal-Zeile sprengt.
    _portalReceiveEvent(msg) {
        if (!this._portalOverlay) return false;
        const text = String((msg && msg.text) || "").trim();
        if (!text) return false;
        const po = this._portalOverlay;
        // Rate-Limit je Sekunde (Spiegel von _portalNetReceive): eine ungeprüfte vendorte Welt könnte sonst
        // pro Frame ein Ereignis posten und das 200-Eintrag-Journal verdrängen. Zähler lazy.
        if (typeof po.eventWindowStart !== "number") {
            po.eventWindowStart = 0;
            po.eventWindowCount = 0;
        }
        const now = performance.now();
        if (now - po.eventWindowStart >= AnazhRealm.PORTAL_EVENT_RATE_WINDOW_MS) {
            po.eventWindowStart = now;
            po.eventWindowCount = 0;
        }
        if (po.eventWindowCount >= AnazhRealm.PORTAL_EVENT_RATE_MAX) return false;
        po.eventWindowCount++;
        this.journalAppend("portal", text.slice(0, 160), { world: po.label || po.world || "Portal-Welt" });
        return true;
    }

    // Native Manifest-Stufe: meldet die Sub-Welt im ready-Handshake ihr DSL-Manifest (dsl + label),
    // gewinnt es („nativ") vor portalMeta („übersetzt"). Das dsl läuft durch denselben Sanitizer —
    // eine Sub-Welt kann kein garbage-Op einschmuggeln.
    _portalReceiveManifest(msg) {
        const po = this._portalOverlay;
        if (!po || !msg) return false;
        const dsl = this._sanitizeDslSubset(msg.dsl);
        if (!dsl) return false;
        po.dsl = dsl;
        po.manifestStage = "nativ";
        if (typeof msg.label === "string" && msg.label.trim()) {
            po.label = msg.label.trim().slice(0, 60);
        }
        // W18-A — der Hinweis kommt aus dem EINEN Schreiber (V9.82).
        this._portalRefreshHint(po);
        return true;
    }

    // Transport-Shim-Rückkanal: eine Multiplayer-Welt schickt ihren WebSocket-Verkehr als
    // `__anazhNet`-Envelope. ws-open/ws-close verfolgen die Kanäle; ws-send wandert übers Mesh (das Mesh
    // IST der Server). Größen-Deckel + Rate-Limit gegen Flut; Sub-Raum-Schlüssel = Welt-Pfad.
    // `data` wird nie ausgeführt — Daten, kein Code.
    _portalNetReceive(msg) {
        const po = this._portalOverlay;
        if (!po || !po.multiplayer || !msg || msg.__anazhNet !== true) return false;
        const channel = msg.channel;
        if (!Number.isInteger(channel)) return false;
        // B1 — die offenen WebSocket-Kanäle des eigenen iframes verfolgen.
        // Ein zugestellter Sub-Welt-Verkehr (B-Relay subworld-net ODER
        // B-JS-Compute subworld-cli) wird in jeden gereicht.
        if (msg.kind === "ws-open") {
            po.netChannels.add(channel);
            // W17 B-JS-Compute — der Host ist sein eigener Client: die erste
            // eigene Verbindung im Server-Kontext registrieren.
            if (po.serverMode === "js-compute" && po.computeRole === "host") {
                this._portalSrvEnsureConn(this._portalSelfConnId());
            }
            return true;
        }
        if (msg.kind === "ws-close") {
            po.netChannels.delete(channel);
            return true;
        }
        if (msg.kind !== "ws-send") return false;
        // B3 — Größen-Deckel: nur String-Daten (eine Relay-.io-Welt sendet
        // JSON-Text; Binär ist eine bewusst spätere Schicht), gedeckelt.
        const data = msg.data;
        if (typeof data !== "string" || data.length > AnazhRealm.SUBWORLD_NET_MAX_BYTES) return false;
        // B3 — Rate-Limit: ein Fenster-Zähler deckelt die Nachrichten je
        // Sekunde. Eine flutende Sub-Welt überlastet so nicht das Mesh.
        const now = performance.now();
        if (now - po.netWindowStart >= AnazhRealm.SUBWORLD_NET_RATE_WINDOW_MS) {
            po.netWindowStart = now;
            po.netWindowCount = 0;
        }
        if (po.netWindowCount >= AnazhRealm.SUBWORLD_NET_RATE_MAX) return false;
        po.netWindowCount++;
        // js-compute routet host-zentriert: der Client-Verkehr geht an den EINEN Compute-Host, die Antwort
        // kommt gezielt zurück. Eine Relay-Welt broadcastet übers Mesh.
        if (po.serverMode === "js-compute") {
            if (po.computeRole === "host") {
                // Der Host ist sein eigener Client — direkt in den lokalen
                // Server-Kontext (conn = die eigene peerId).
                const myId = this._portalSelfConnId();
                this._portalSrvEnsureConn(myId);
                this._portalSrvSend({ __anazhNet: true, kind: "srv-recv", conn: myId, data });
            } else {
                // Gast: Verkehr NUR an den Compute-Host (andere Gäste sehen ihn nicht). subworld-srv ist
                // kanal-exklusiv — der Host stempelt die peerId (= Verbindungs-id, unfälschbar).
                this._p2pSendChannelTo(po.hostPeerId, {
                    type: "subworld-srv",
                    kind: "send",
                    worldId: po.world,
                    data,
                });
            }
            return true;
        }
        // Relay: ws-send wird subworld-net-Broadcast (das Mesh IST der Server). p2pSend erreicht nur die
        // anderen Peers — der Sender bekommt seinen Verkehr nicht zurück, wie bei einem Relay-Server.
        this.p2pSend({ type: "subworld-net", worldId: po.world, data });
        return true;
    }

    // subworld-net eines Peers ins eigene Sub-Welt-iframe zustellen — nur im SELBEN Multiplayer-Portal
    // (worldId-Pfad-Match), sonst sähe ein Mitspieler außerhalb fremden Verkehr. Zugestellt wird in
    // JEDEN offenen Kanal (Sender-Kanal ist iframe-lokal, bedeutungslos); `data` nie ausgeführt.
    _portalNetDeliver(msg) {
        const po = this._portalOverlay;
        if (!po || !po.multiplayer || !msg) return false;
        // B2 — nur Verkehr für GENAU diese Sub-Welt zustellen.
        if (msg.worldId !== po.world) return false;
        // B3 — Größen-Deckel auch auf dem Empfangs-Pfad.
        const data = msg.data;
        if (typeof data !== "string" || data.length > AnazhRealm.SUBWORLD_NET_MAX_BYTES) return false;
        return this._portalDeliverToClient(data);
    }

    // `data` als `ws-recv` in jeden offenen Kanal des eigenen Client-iframes posten; nie ausgeführt.
    // Geteilte Zustell-Naht: _portalNetDeliver, _portalCliReceive, _portalSrvReceive (lokal) enden hier.
    _portalDeliverToClient(data) {
        const po = this._portalOverlay;
        if (!po || !po.iframe || !po.iframe.contentWindow || po.netChannels.size === 0) return false;
        // V8.70 — "*" für die null-origin (sandboxed) Multiplayer-Welt.
        const target = po.trust === "sandboxed" ? "*" : window.location.origin;
        for (const channel of po.netChannels) {
            po.iframe.contentWindow.postMessage({ __anazhNet: true, kind: "ws-recv", channel, data }, target);
        }
        return true;
    }

    // Pose des LOKALEN Spielers aus der Sub-Welt — nur Ko-Präsenz-Welten; DATEN (vier endliche Zahlen).
    // Eigene Rate-Wand (~10 Hz + Reserve) unter dem Gesamt-Bucket, damit eine flutende Welt den Kanal
    // nicht als Mesh-Verstärker nutzt. Broadcast als subworld-pose, Sub-Raum-Schlüssel = Welt-Pfad.
    _portalReceiveLocalPose(msg) {
        const po = this._portalOverlay;
        if (!po || !po.coPresence) return false;
        const pose = this._sanitizePose(msg && msg.pose);
        if (!pose) return false;
        const now = performance.now();
        if (now - po.poseWindowStart >= AnazhRealm.SUBWORLD_POSE_RATE_WINDOW_MS) {
            po.poseWindowStart = now;
            po.poseWindowCount = 0;
        }
        if (po.poseWindowCount >= AnazhRealm.SUBWORLD_POSE_RATE_MAX) return false;
        po.poseWindowCount++;
        po.localPose = pose;
        const p2p = this.state.p2p;
        if (p2p && p2p.enabled && p2p.connected) {
            this.p2pSend({ type: "subworld-pose", worldId: po.world, pose });
        }
        return true;
    }

    // W18-B — eine Pose säubern: vier endliche, geklemmte Zahlen oder null.
    // Eine fremde Welt (oder ein fremder Peer) kann keine NaN/Infinity-Posen
    // oder Objekt-Schmuggel in die Zustell-Kette legen.
    _sanitizePose(p) {
        if (!p || typeof p !== "object") return null;
        const x = this._fremdeZahl(p.x);
        const y = this._fremdeZahl(p.y);
        const z = this._fremdeZahl(p.z);
        const yaw = this._fremdeZahl(p.yaw);
        if (![x, y, z, yaw].every(Number.isFinite)) return null;
        const c = (v) => Math.max(-1e6, Math.min(1e6, v));
        return { x: c(x), y: c(y), z: c(z), yaw: Math.max(-Math.PI * 2, Math.min(Math.PI * 2, yaw)) };
    }

    // Pose eines Mesh-Gefährten zustellen — nur im SELBEN Ko-Präsenz-Portal (worldId-Pfad-Match).
    // Erste Pose → peer-join (Name + Seele aus dem Mesh-Roster, keine zweite Identitäts-Quelle), dann
    // peer-state; der Sweep (poseTimer) räumt verstummte Peers als peer-leave (auch bei Mesh-Abriss).
    _portalPoseDeliver(peerId, msg) {
        const po = this._portalOverlay;
        if (!po || !po.coPresence || !msg) return false;
        if (msg.worldId !== po.world) return false;
        const pose = this._sanitizePose(msg.pose);
        if (!pose) return false;
        if (!po.iframe || !po.iframe.contentWindow) return false;
        const target = po.trust === "sandboxed" ? "*" : window.location.origin;
        let entry = po.peers.get(peerId);
        if (!entry) {
            const known = this.state.p2p && this.state.p2p.peers ? this.state.p2p.peers.get(peerId) : null;
            entry = { lastAt: performance.now() };
            po.peers.set(peerId, entry);
            po.iframe.contentWindow.postMessage(
                {
                    type: "peer-join",
                    peerId,
                    name: (known && known.avatarName) || String(peerId).slice(0, 8),
                    soul: (known && known.soulName) || "human",
                },
                target
            );
            this._portalEnsurePoseSweep();
        }
        entry.lastAt = performance.now();
        po.iframe.contentWindow.postMessage({ type: "peer-state", peerId, pose }, target);
        return true;
    }

    // Input-Brücke aktivieren: die Welt wählte aus dem EINGEFRORENEN Aktions-Vokabular; Tasten gehen
    // fortan als {type:"input", action, down}. Listener am PARENT-Fenster — liegt der Fokus im iframe,
    // wirken die welt-eigenen Tasten (dieselbe Absicht, kein Konflikt).
    _portalEnableInputBridge(actions) {
        const po = this._portalOverlay;
        if (!po || !Array.isArray(actions)) return false;
        const clean = [];
        for (const a of actions) {
            if (typeof a === "string" && AnazhRealm.PORTAL_INPUT_ACTIONS.includes(a) && !clean.includes(a)) {
                clean.push(a);
            }
        }
        if (!clean.length) return false;
        po.inputActions = clean;
        if (!po.onInputKey && typeof window !== "undefined") {
            po.onInputKey = (e) => this._portalForwardInput(e);
            window.addEventListener("keydown", po.onInputKey);
            window.addEventListener("keyup", po.onInputKey);
        }
        this._portalRefreshHint(po);
        return true;
    }

    // Heimat-Taste als semantische Aktion reichen — nur deklarierte Aktionen. Tipp-Felder (Konsole/
    // Omnibox) bleiben unberührt; Auto-Repeat fällt (down/up sind die Wahrheit).
    _portalForwardInput(e) {
        const po = this._portalOverlay;
        if (!po || !po.inputActions || !po.iframe || !po.iframe.contentWindow) return false;
        if (e.repeat) return false;
        const t = e.target;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return false;
        const action = AnazhRealm.PORTAL_INPUT_KEYMAP[e.code];
        if (!action || !po.inputActions.includes(action)) return false;
        const target = po.trust === "sandboxed" ? "*" : window.location.origin;
        po.iframe.contentWindow.postMessage({ type: "input", action, down: e.type === "keydown" }, target);
        return true;
    }

    // ===== DARIN LEBEN =====
    // Die Fremd-Welt wird zeitweise die BASIS: Wohnen ist ein globaler Zeiger (anazh.portalDwelling,
    // wie der Vibe-Pass NIE im Welt-Snapshot); der Boot kehrt durchs Tor zurück (Heimat eingefroren
    // darunter); Gefährten sehen „wohnt in …" übers soul-Kanal; der Welt-Zustand lebt im Persistenz-Slot.

    // Der Wohn-Zeiger: global + gesäubert (id-förmig) oder null.
    _loadPortalDwelling() {
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.portalDwelling") : null;
            if (!raw) return null;
            const p = JSON.parse(raw);
            if (!p || typeof p !== "object") return null;
            const worldId = String(p.worldId || "")
                .trim()
                .toLowerCase();
            if (!/^[a-z0-9_-]{1,40}$/.test(worldId)) return null;
            return {
                worldId,
                label: typeof p.label === "string" ? p.label.slice(0, 60) : worldId,
                at: Number(p.at) || 0,
            };
        } catch {
            return null;
        }
    }

    _savePortalDwelling(d) {
        try {
            if (typeof localStorage === "undefined") return;
            if (d) localStorage.setItem("anazh.portalDwelling", JSON.stringify(d));
            else localStorage.removeItem("anazh.portalDwelling");
        } catch {
            /* Quota/Privacy — das Wohnen bleibt dann eine Episode */
        }
    }

    // „Wohne hier" — das aktuelle Portal wird Zuhause. Nur eine library-
    // bekannte Welt (der Boot muss sie via obtainPortalForWorld wiederfinden);
    // die Gefährten erfahren es sofort (soul-Kanal trägt das Wohnen).
    dwellInPortal() {
        const po = this._portalOverlay;
        if (!po) return { ok: false, reason: "not_in_portal" };
        const worldId = this._resolvePortalWorldId(po);
        if (!worldId) return { ok: false, reason: "world_unknown" };
        const label = po.label || worldId;
        this._savePortalDwelling({ worldId, label, at: Date.now() });
        this._portalRefreshHint(po);
        this._p2pBroadcastSoul();
        this.journalAppendOnce(`portalDwell:${worldId}`, "portal", `Du wohnst jetzt in „${label}".`);
        this.log(
            `Du wohnst jetzt in „${label}" — der nächste Aufbruch bringt dich HIERHER zurück („ziehe heim" beendet das Wohnen).`,
            "INFO"
        );
        return { ok: true, worldId };
    }

    // „Ziehe heim" — das Wohnen endet, die Heimat-Welt ist wieder die Basis.
    endDwelling() {
        const d = this._loadPortalDwelling();
        this._savePortalDwelling(null);
        if (this._portalOverlay) this._portalRefreshHint(this._portalOverlay);
        this._p2pBroadcastSoul();
        if (d) this.log(`Du bist heimgezogen — „${d.label}" bleibt ein Ort, kein Zuhause mehr.`, "INFO");
        return { ok: true, was: d ? d.worldId : null };
    }

    // Boot kehrt durchs Tor zurück: wohnt der Spieler in einer Welt, öffnet der Start das Portal dorthin
    // (Heimat eingefroren darunter, Esc = Heimweg, das Wohnen bleibt). Eine verschwundene Welt beendet
    // das Wohnen.
    _portalDwellingBootReturn() {
        if (typeof document === "undefined" || this._portalOverlay) return false;
        const d = this._loadPortalDwelling();
        if (!d) return false;
        const obtained = this.obtainPortalForWorld(d.worldId);
        if (!obtained.ok) {
            this.log(
                `Dein Zuhause „${d.label}" ist nicht mehr auffindbar (${obtained.reason}) — du wachst daheim auf.`,
                "WARN"
            );
            this._savePortalDwelling(null);
            return false;
        }
        const bp = this.state.blueprints[obtained.blueprint];
        this._buildPortalOverlay(bp.portalMeta, { computeRole: "host" });
        this._p2pBroadcastPortalInvite();
        this.log(
            `Du wachst auf, wo du wohnst: „${d.label}" (Esc — kurz heim · „ziehe heim" beendet das Wohnen).`,
            "INFO"
        );
        return true;
    }

    // Persistenz-Slot: die Welt exponiert {type:"state", data} (String, gedeckelt), die Heimat hält ihn
    // global (anazh.portalState) und reicht ihn beim Betreten als `restoreState` zurück. Nur
    // library-bekannte Welten (stabile id); Daten, nie Code.
    _loadPortalStates() {
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.portalState") : null;
            const p = raw ? JSON.parse(raw) : null;
            return p && typeof p === "object" && !Array.isArray(p) ? p : {};
        } catch {
            return {};
        }
    }

    _portalReceiveState(msg) {
        const po = this._portalOverlay;
        if (!po || !msg) return false;
        const data = msg.data;
        if (typeof data !== "string" || data.length > AnazhRealm.PORTAL_STATE_MAX_BYTES) return false;
        const worldId = this._resolvePortalWorldId(po);
        if (!worldId) return false;
        const states = this._loadPortalStates();
        states[worldId] = { data, at: Date.now() };
        // Welt-Anzahl-Deckel: die älteste fällt (bounded, kein Quota-Fresser).
        const ids = Object.keys(states);
        if (ids.length > AnazhRealm.PORTAL_STATE_MAX_WORLDS) {
            ids.sort((a, b) => (states[a].at || 0) - (states[b].at || 0));
            for (let i = 0; i < ids.length - AnazhRealm.PORTAL_STATE_MAX_WORLDS; i++) delete states[ids[i]];
        }
        try {
            localStorage.setItem("anazh.portalState", JSON.stringify(states));
        } catch {
            return false;
        }
        return true;
    }

    // ===== CAPABILITY-INVERSION =====
    // Eine Welt REICHT eine Fähigkeit (DSL-Daten aus dem bestehenden Vokabular, nie Code); der Mensch
    // GEWÄHRT sie (grant_capability). Quarantäne (läuft nie von allein) → Gewähr (Host-Geste, frisch) →
    // Lauf (dslRun-Sandbox, Budget, Rückruf wirkt auch nach der Gewähr). Wände: _isRuleEffectAllowed
    // (nur reaktive Ops, kein Worldgen/Identität) + Broadcast-Wand (nichts Spieler-Privates).

    _portalReceiveCapability(msg) {
        const po = this._portalOverlay;
        if (!po || !msg) return false;
        const name = typeof msg.name === "string" ? msg.name.trim().toLowerCase().slice(0, 32) : "";
        if (!/^[a-z0-9_-]{1,32}$/.test(name)) return false;
        const dsl = msg.dsl;
        if (!this._isRuleEffectAllowed(dsl)) return false;
        if (this._dslContainsAnyOp(dsl, AnazhRealm.NON_BROADCASTABLE_OPS)) return false;
        // R2 — die SOUVERÄNE Disjunktheit explizit AM TOR (ein wallet_transfer
        // wäre auch im Lauf unbekannt/geblockt — aber die Wand steht sichtbar
        // VOR der Queue, nicht erst in der Sandbox).
        if (this._dslContainsAnyOp(dsl, new Set(AnazhRealm.SOVEREIGN_ACTIONS))) return false;
        const desc = typeof msg.desc === "string" ? msg.desc.trim().slice(0, 120) : "";
        if (!this.state.capabilityProposals) this.state.capabilityProposals = new Map();
        const q = this.state.capabilityProposals;
        if (!q.has(name) && q.size >= AnazhRealm.CAPABILITY_PROPOSAL_MAX) return false;
        // R4 — die HERKUNFT reist mit: die Welt + (wenn signiert) ihr Autor.
        const worldId = this._resolvePortalWorldId(po);
        const reg = worldId ? this._worldEntry(worldId) : null;
        q.set(name, {
            name,
            desc,
            dsl: JSON.parse(JSON.stringify(dsl)),
            fromLabel: (po.label || po.world || "?").slice(0, 60),
            fromWorldId: worldId || "",
            authorPubKey:
                reg && typeof reg.authorPubKey === "string" && /^[0-9a-f]{64}$/i.test(reg.authorPubKey)
                    ? reg.authorPubKey.toLowerCase()
                    : "",
            at: Date.now(),
        });
        this.log(
            `Die Welt „${(po.label || "?").slice(0, 40)}" reicht eine Fähigkeit: „${name}"${desc ? ` — ${desc}` : ""}. „gewähre ${name}" nimmt sie an (souveräne Geste).`,
            "INFO"
        );
        return true;
    }

    // ═══ STUDIO-ÜBERGABE — DER W12-EMPFÄNGER ═══
    // {type:"uebergabe"} (Dials + Gestalt-Wahlen) — DIESER Chokepoint validiert fail-closed: plain-object
    // · kind-Positivliste (koerper|kreatur) · Clamps auf PARAMS des GELADENEN Kern-Buchs · String-Wahlen
    // gegen dessen Tabellen · Taille-Cap (TAILLE_UNKNOWN_FIELD_MAX) · must-ignore; kaltes Buch → null.
    // Auch Snapshot-Restore; Leser _koerperStudioDials/_tetrapodaStudioDials. gate:studio-uebergabe
    _studioUebergabeValidate(kind, msg) {
        if (!msg || typeof msg !== "object" || Array.isArray(msg)) return null;
        // Taille-Cap (das studioOv-Muster): ein Riesen-Payload ist ein
        // Quota-DoS, keine Übergabe — er fällt GANZ (still, kein Wurf).
        try {
            if (JSON.stringify(msg).length > AnazhRealm.TAILLE_UNKNOWN_FIELD_MAX) return null;
        } catch (_e) {
            return null;
        }
        const W = typeof window !== "undefined" ? window : globalThis;
        const FORM = /^[a-z0-9_-]{1,32}$/; // die Form-Wand jeder String-Wahl
        if (kind === "koerper") {
            const core = W.__koerperCore;
            const rows =
                core && core.PARAMS_BY_KIND && Array.isArray(core.PARAMS_BY_KIND.koerper)
                    ? core.PARAMS_BY_KIND.koerper
                    : null;
            if (!rows || !core.START_PARAMS) return null; // kaltes Kern-Buch → fail-closed
            const s = {};
            let nS = 0;
            const sIn = msg.s;
            if (sIn && typeof sIn === "object" && !Array.isArray(sIn)) {
                // Dial-Positivliste = die B4-PARAMS-Zeilen des Buchs; je Zeile
                // Finite-Wache + Clamp auf [min, max]. Fremde/NaN-Schlüssel: must-ignore.
                for (const row of rows) {
                    if (!row || typeof row.id !== "string") continue;
                    const v = Number(sIn[row.id]);
                    if (!Number.isFinite(v)) continue;
                    s[row.id] = Math.min(row.max, Math.max(row.min, v));
                    nS++;
                }
            }
            // Gestalt-Positivliste AUS DEM BUCH: die nicht-numerischen
            // START_PARAMS-Schlüssel SIND die Gestalt-Wahlen (skinTone/hairStyle/
            // hairColor/top/topColor/bottom/bottomColor/shoes/shoeColor).
            const gestalt = {};
            let nG = 0;
            const gIn = msg.gestalt;
            if (gIn && typeof gIn === "object" && !Array.isArray(gIn)) {
                for (const k in core.START_PARAMS) {
                    if (!Object.prototype.hasOwnProperty.call(core.START_PARAMS, k)) continue;
                    if (typeof core.START_PARAMS[k] === "number") continue;
                    const v = gIn[k];
                    if (typeof v !== "string" || !FORM.test(v)) continue;
                    if (k === "skinTone") {
                        if (!core.SKIN_TONES || !Object.prototype.hasOwnProperty.call(core.SKIN_TONES, v)) continue;
                    } else if (k === "hairColor") {
                        if (!core.HAIR_COLORS || !Object.prototype.hasOwnProperty.call(core.HAIR_COLORS, v)) continue;
                    } else if (/Color$/.test(k)) {
                        if (!core.CLOTH_COLORS || !Object.prototype.hasOwnProperty.call(core.CLOTH_COLORS, v)) continue;
                    } else if (k === "hairStyle") {
                        // Stil-Liste FUNKTIONAL aus dem Buch: ein erfundener Name fiele in haarStreu still auf den
                        // Kern-Fallback "mittel" — deshalb gar nicht erst hinein (must-ignore).
                        if (typeof core.haarStreu !== "function") continue;
                        try {
                            if (
                                v !== "mittel" &&
                                JSON.stringify(core.haarStreu({ hairStyle: v, hairLen: 1, hairVol: 1 })) ===
                                    JSON.stringify(core.haarStreu({ hairStyle: "mittel", hairLen: 1, hairVol: 1 }))
                            )
                                continue;
                        } catch (_e2) {
                            continue;
                        }
                    }
                    gestalt[k] = v;
                    nG++;
                }
            }
            if (!nS && !nG) return null; // leere Übergabe trägt nichts
            return { s, gestalt };
        }
        if (kind === "kreatur") {
            const core = W.__tetrapodaCore;
            const rows =
                core && core.PARAMS_BY_KIND && Array.isArray(core.PARAMS_BY_KIND.kreatur)
                    ? core.PARAMS_BY_KIND.kreatur
                    : null;
            const gatt = typeof msg.gattung === "string" ? msg.gattung : "";
            // Gattungs-Positivliste = die GATTUNGEN-Tabelle des Buchs (kein Literal).
            if (!rows || !core.GATTUNGEN || !Object.prototype.hasOwnProperty.call(core.GATTUNGEN, gatt)) return null;
            const s = {};
            let nS = 0;
            const sIn = msg.s;
            if (sIn && typeof sIn === "object" && !Array.isArray(sIn)) {
                for (const row of rows) {
                    if (!row || typeof row.id !== "string") continue;
                    const v = Number(sIn[row.id]);
                    if (!Number.isFinite(v)) continue;
                    s[row.id] = Math.min(row.max, Math.max(row.min, v));
                    nS++;
                }
            }
            if (!nS) return null;
            return { gattung: gatt, s };
        }
        return null; // unbekannter kind: must-ignore (fail-closed)
    }
    _studioUebergabeEmpfang(msg) {
        if (!msg || typeof msg !== "object" || Array.isArray(msg)) return false;
        const kind = msg.kind === "koerper" || msg.kind === "kreatur" ? msg.kind : null; // Positivliste
        if (!kind) return false;
        const clean = this._studioUebergabeValidate(kind, msg);
        if (!clean) return false;
        const ue =
            this.state.studioUebergabe && typeof this.state.studioUebergabe === "object"
                ? this.state.studioUebergabe
                : (this.state.studioUebergabe = { koerper: null, kreatur: {} });
        if (kind === "koerper") {
            ue.koerper = { s: clean.s, gestalt: clean.gestalt };
            // Live-Neu-Guss über den EINEN Seelen-Chokepoint (Position/Physik/Held reisen mit). Der
            // Mensch-Ofen-Memo-Key trägt Dials+Gestalt + Guss-Farben → die Übergabe prägt einen EIGENEN Key,
            // der Default-Eintrag bleibt unvergiftet.
            try {
                this.applyPlayerSoul((this.state.player && this.state.player.soul) || "human");
            } catch (_e) {
                this._stoffBruch("der Avatar (Studio-Übergabe)", _e);
            }
            this.log("Studio-Übergabe angenommen: der Avatar trägt die Schöpfer-Gestalt (Da-Vinci-Studio).", "INFO");
            // KÖRPER GANZ (T6) — die Übergabe ist SICHTBAR am mensch-Eintrag des
            // Ich-Selects (✦ Studio-Gestalt): die Sicht folgt dem State sofort.
            if (typeof this._refreshSoulSelect === "function") this._refreshSoulSelect();
        } else {
            if (!ue.kreatur || typeof ue.kreatur !== "object") ue.kreatur = {};
            ue.kreatur[clean.gattung] = { s: clean.s };
            // Guss-Semantik: geprägt wird beim GUSS — künftige Spawns der Gattung
            // lesen die Dials über die EINE Quelle (_tetrapodaStudioDials →
            // _ofenKreaturDials/_tetrapodaSoulParts); bestehende Kreaturen bleiben.
            this.log(`Studio-Übergabe angenommen: künftige „${clean.gattung}"-Spawns tragen die Studio-Dials.`, "INFO");
        }
        return true;
    }

    // Die GEWÄHR — nur durch die R2-Host-Geste (außerhalb jedes iframes,
    // Klartext, frisch). Ein revoziertes Herkunfts-Glied fällt am Tor.
    grantCapability(name, opts) {
        const key = String(name || "")
            .trim()
            .toLowerCase();
        const q = this.state.capabilityProposals;
        const prop = q && q.get(key);
        if (!prop) return { ok: false, reason: "no_proposal" };
        if (prop.authorPubKey && this.state.revokedKeys && this.state.revokedKeys.has(prop.authorPubKey)) {
            q.delete(key);
            this.log(`Fähigkeit „${key}" verweigert — die Herkunft ist revoziert.`, "WARN");
            return { ok: false, reason: "revoked" };
        }
        const granted = this._sovereignGesture(
            "grant_capability",
            {
                what: `Fähigkeit „${key}" gewähren (von „${prop.fromLabel}")`,
                value: typeof this.describeProgram === "function" ? this.describeProgram(prop.dsl) : key,
                whom: "deiner Welt",
            },
            opts
        );
        if (!granted) return { ok: false, reason: "declined" };
        if (!this.state.grantedCapabilities) this.state.grantedCapabilities = {};
        this.state.grantedCapabilities[key] = { ...prop, grantedAt: Date.now() };
        q.delete(key);
        if (typeof this.journalAppend === "function") {
            this.journalAppend(
                "growth",
                `Eine fremde Fähigkeit wurde Teil deiner Welt: „${key}" (von „${prop.fromLabel}").`,
                {
                    capability: key,
                }
            );
        }
        this.log(`Fähigkeit „${key}" gewährt — „wirke ${key}" führt sie aus.`, "INFO");
        return { ok: true };
    }

    // Der LAUF — durch DIESELBE dslRun-Sandbox wie jede Geste (Budget/
    // Whitelist); der R4-Rückruf wirkt auch NACH der Gewähr, und die
    // HEUTIGE Wand prüft auch Restauriertes (das Empfänger-Gesetz).
    runCapability(name) {
        const key = String(name || "")
            .trim()
            .toLowerCase();
        const cap = this.state.grantedCapabilities && this.state.grantedCapabilities[key];
        if (!cap) return { ok: false, reason: "unknown" };
        if (cap.authorPubKey && this.state.revokedKeys && this.state.revokedKeys.has(cap.authorPubKey)) {
            this.log(`Fähigkeit „${key}" ruht — ihre Herkunft wurde revoziert.`, "WARN");
            return { ok: false, reason: "revoked" };
        }
        if (!this._isRuleEffectAllowed(cap.dsl)) return { ok: false, reason: "forbidden" };
        const res = this.dslRun(cap.dsl, { source: `capability:${key}` });
        return { ok: true, res };
    }

    // W18-B — der Abwesenheits-Sweep, lazy beim ersten Gefährten gestartet
    // (das stateTimer-Muster: lebt + stirbt mit dem Overlay).
    _portalEnsurePoseSweep() {
        const po = this._portalOverlay;
        if (!po || po.poseTimer) return;
        po.poseTimer = setInterval(() => this._portalSweepPosePeers(), 2000);
    }

    // W18-B — verstummte Gefährten (keine Pose binnen SUBWORLD_POSE_TIMEOUT_MS)
    // als peer-leave aus der Sub-Welt räumen. Deckt Portal-Austritt UND
    // Mesh-Abriss mit EINER Regel (die Pose ist das Lebenszeichen).
    _portalSweepPosePeers() {
        const po = this._portalOverlay;
        if (!po || !po.peers || po.peers.size === 0) return;
        const now = performance.now();
        const target = po.trust === "sandboxed" ? "*" : window.location.origin;
        for (const [peerId, entry] of po.peers) {
            if (now - entry.lastAt > AnazhRealm.SUBWORLD_POSE_TIMEOUT_MS) {
                po.peers.delete(peerId);
                if (po.iframe && po.iframe.contentWindow) {
                    po.iframe.contentWindow.postMessage({ type: "peer-leave", peerId }, target);
                }
            }
        }
    }

    // W17 Phase B-JS-Compute — die eigene Verbindungs-id im Server-Kontext.
    // Es ist die eigene peerId; ein Solo-Host (ohne Mesh) ist trotzdem sein
    // eigener Client → "self" als Sentinel, damit js-compute auch solo läuft.
    _portalSelfConnId() {
        const p2p = this.state.p2p;
        return (p2p && p2p.peerId) || "self";
    }

    // Server-Kontext: zweites, verborgenes iframe lädt dieselbe Welt mit `?anazh-server=1` (save-server
    // injiziert den Server-Shim); die Server-JS läuft null-origin, kann AnazhRealms State nicht berühren.
    // Gebaut beim js-compute-Betreten (Host) UND bei Host-Migration; idempotent. Kein enter-Handshake
    // — der `load`-Listener setzt serverReady.
    _portalSpawnServerContext() {
        const po = this._portalOverlay;
        if (!po || typeof document === "undefined") return null;
        if (po.serverIframe) return po.serverIframe;
        const serverIframe = document.createElement("iframe");
        serverIframe.className = "portal-server-frame";
        serverIframe.title = "Server-Kontext";
        serverIframe.setAttribute("aria-hidden", "true");
        serverIframe.setAttribute("sandbox", "allow-scripts");
        serverIframe.style.display = "none";
        serverIframe.addEventListener("load", () => {
            const p = this._portalOverlay;
            if (!p || p.serverIframe !== serverIframe) return;
            p.serverReady = true;
            this._portalSrvFlush();
        });
        po.overlayEl.appendChild(serverIframe);
        po.serverIframe = serverIframe;
        serverIframe.src = po.world + "?anazh-server=1";
        // Kooperativer Zustands-Poll alle 5 s. Eine Welt ohne snapshot()-Handler antwortet nie — die
        // Migration bootet dann frisch (Degradation, kein Zwang). Geräumt in _disposePortalOverlay.
        if (!po.stateTimer) {
            po.stateTimer = setInterval(() => {
                this._portalSrvSend({ __anazhNet: true, kind: "srv-state-req" });
            }, 5000);
        }
        return serverIframe;
    }

    // Compute-Host annonciert die Roster (alle Verbindungen inkl. sich selbst) an jeden Gast — daraus
    // wählt beim Host-Abgang jeder Gast deterministisch denselben Nachfolger. Gerufen bei jeder
    // serverConns-Änderung; subworld-roster ist kanal-exklusiv.
    _portalBroadcastRoster() {
        const po = this._portalOverlay;
        if (!po || po.serverMode !== "js-compute" || po.computeRole !== "host") return;
        const members = Array.from(po.serverConns);
        const selfId = this._portalSelfConnId();
        for (const conn of po.serverConns) {
            if (conn === selfId) continue;
            this._p2pSendChannelTo(conn, { type: "subworld-roster", worldId: po.world, members });
        }
    }

    // Gast cacht die Roster seines Compute-Hosts (Kandidaten-Liste der Migration) — nur vom EIGENEN Host
    // (kanal-gestempelte peerId), nur für die eigene Sub-Welt.
    _portalRosterReceive(peerId, msg) {
        const po = this._portalOverlay;
        if (!po || po.serverMode !== "js-compute" || po.computeRole !== "guest") return false;
        if (peerId !== po.hostPeerId) return false;
        if (!msg || msg.worldId !== po.world || !Array.isArray(msg.members)) return false;
        po.roster = msg.members.filter((p) => typeof p === "string");
        return true;
    }

    // Gast cacht den kooperativen Server-Zustand (Mitgift der Migration): nur vom EIGENEN Host, nur
    // eigene Sub-Welt, größen-gedeckelt, seq-monoton (ein verspäteter älterer Snapshot überschreibt nie
    // einen neueren). Übernimmt der Gast, reist er als srv-state-restore in den frischen Server-Kontext.
    _portalStateReceive(peerId, msg) {
        const po = this._portalOverlay;
        if (!po || po.serverMode !== "js-compute" || po.computeRole !== "guest") return false;
        if (peerId !== po.hostPeerId) return false;
        if (!msg || msg.worldId !== po.world || typeof msg.data !== "string") return false;
        if (msg.data.length > AnazhRealm.SUBWORLD_NET_MAX_BYTES) return false;
        const seq = Number(msg.seq) || 0;
        if (po.lastSrvState && seq <= po.lastSrvState.seq) return false;
        po.lastSrvState = { data: msg.data, seq };
        return true;
    }

    // Compute-Host hat das Mesh verlassen: jeder Gast wählt aus der letzten Roster deterministisch
    // denselben Nachfolger (kleinste peerId ohne den Abgegangenen). Bin ICH es → Host mit FRISCHEM
    // Server-Kontext; sonst auf den Nachfolger zeigen und die Verbindung neu anmelden.
    _portalMigrateHost(departedHostId) {
        const po = this._portalOverlay;
        if (!po || po.serverMode !== "js-compute" || po.computeRole !== "guest") return;
        const myId = this._portalSelfConnId();
        // Kandidaten: die Roster ohne den Abgegangenen; ich bin immer dabei.
        const cands = new Set((po.roster || []).filter((p) => p && p !== departedHostId));
        cands.add(myId);
        const successor = Array.from(cands).sort()[0];
        if (successor === myId) {
            this._portalPromoteToHost();
        } else {
            po.hostPeerId = successor;
            this.log(`Compute-Host wechselte — neuer Host: ${String(successor).slice(0, 8)}…`, "INFO");
            // Dem Nachfolger die eigene Verbindung neu anmelden.
            this._p2pSendChannelTo(successor, { type: "subworld-srv", kind: "open", worldId: po.world });
        }
    }

    // Gast übernimmt die Host-Rolle: computeRole flippen, frischen Server-Kontext bauen, eigene
    // Verbindung registrieren; die übrigen melden sich per subworld-srv-open neu (_portalSrvFromGuest).
    // lastSrvState reist als srv-state-restore VOR jedem srv-open (serverQueue ist FIFO, der Shim puffert
    // bis `new WebSocketServer()`). Ohne restore()-Handler bootet die Welt frisch.
    _portalPromoteToHost() {
        const po = this._portalOverlay;
        if (!po) return;
        po.computeRole = "host";
        po.hostPeerId = this._portalSelfConnId();
        po.serverConns = new Set();
        po.serverReady = false;
        po.serverQueue = [];
        this.log(`Du übernimmst den Compute-Host für „${po.label}".`, "INFO");
        this._portalSpawnServerContext();
        if (po.lastSrvState) {
            let data;
            try {
                data = JSON.parse(po.lastSrvState.data);
            } catch (_e) {
                data = undefined;
            }
            if (data !== undefined) {
                this._portalSrvSend({ __anazhNet: true, kind: "srv-state-restore", data });
                this.log(`Der Server-Zustand reiste mit (Mitgift seq ${po.lastSrvState.seq}).`, "INFO");
            }
        }
        // Der Host ist sein eigener Client — die eigene Verbindung registrieren.
        this._portalSrvEnsureConn(this._portalSelfConnId());
    }

    // srv-*-Nachricht in den Server-Kontext posten — gepuffert bis das Server-iframe geladen ist (der
    // Shim puffert seinerseits bis `new WebSocketServer()`, kein verlorener Envelope). Nur der Host hat
    // ein serverIframe.
    _portalSrvSend(env) {
        const po = this._portalOverlay;
        if (!po || !po.serverIframe) return false;
        if (!po.serverReady) {
            po.serverQueue.push(env);
            return true;
        }
        const cw = po.serverIframe.contentWindow;
        if (!cw) return false;
        // Der Server-Kontext ist null-origin (sandboxed) → "*".
        cw.postMessage(env, "*");
        return true;
    }

    // W17 Phase B-JS-Compute — die gepufferten srv-*-Envelopes nachreichen,
    // sobald das Server-iframe geladen ist (load-Listener in _buildPortalOverlay).
    _portalSrvFlush() {
        const po = this._portalOverlay;
        if (!po || !po.serverIframe || !po.serverReady) return;
        const cw = po.serverIframe.contentWindow;
        if (!cw) return;
        const q = po.serverQueue;
        po.serverQueue = [];
        for (const env of q) cw.postMessage(env, "*");
    }

    // W17 Phase B-JS-Compute — eine Verbindung im Server-Kontext registrieren
    // (idempotent — ein wiederholtes Registrieren bleibt folgenlos). Der erste
    // Verkehr eines Peers erzeugt so genau ein srv-open.
    _portalSrvEnsureConn(connId) {
        const po = this._portalOverlay;
        if (!po || !po.serverConns || !connId) return;
        if (po.serverConns.has(connId)) return;
        po.serverConns.add(connId);
        this._portalSrvSend({ __anazhNet: true, kind: "srv-open", conn: connId });
        // Phase 2 — die Roster änderte sich: den Gästen die neue Liste annoncieren.
        this._portalBroadcastRoster();
    }

    // Der Server-Kontext hat für eine Verbindung gerechnet. srv-send: Ergebnis an genau diese Verbindung
    // (Host selbst → lokal ins Client-iframe; sonst per subworld-cli an den Gast). `data` = Daten, kein
    // Code. srv-close-req: der Server schließt eine Verbindung von sich aus.
    _portalSrvReceive(msg) {
        const po = this._portalOverlay;
        if (!po || po.serverMode !== "js-compute" || po.computeRole !== "host") return false;
        if (!msg || msg.__anazhNet !== true) return false;
        if (msg.kind === "srv-close-req") {
            if (typeof msg.conn === "string" && po.serverConns) po.serverConns.delete(msg.conn);
            return true;
        }
        // Zustands-Snapshot des Server-Kontexts (Antwort auf srv-state-req) als subworld-state an ALLE Gäste:
        // der Nachfolger ist erst beim Abgang bekannt und ein designierter könnte selbst gehen.
        // Daten (JSON-String), größen-gedeckelt, Takt 1/5 s.
        if (msg.kind === "srv-state") {
            let txt;
            try {
                txt = JSON.stringify(msg.data);
            } catch (_e) {
                return false;
            }
            if (typeof txt !== "string" || txt.length > AnazhRealm.SUBWORLD_NET_MAX_BYTES) return false;
            po.stateSeq = (po.stateSeq || 0) + 1;
            const selfId = this._portalSelfConnId();
            for (const conn of po.serverConns) {
                if (conn === selfId) continue;
                this._p2pSendChannelTo(conn, {
                    type: "subworld-state",
                    worldId: po.world,
                    data: txt,
                    seq: po.stateSeq,
                });
            }
            return true;
        }
        if (msg.kind !== "srv-send") return false;
        const data = msg.data;
        if (typeof data !== "string" || data.length > AnazhRealm.SUBWORLD_NET_MAX_BYTES) return false;
        const conn = msg.conn;
        if (conn === this._portalSelfConnId()) {
            // Der Host ist sein eigener Client — lokal ins eigene iframe.
            this._portalDeliverToClient(data);
        } else if (typeof conn === "string") {
            // Ein Gast — gezielt an seinen Kanal (kein Broadcast).
            this._p2pSendChannelTo(conn, { type: "subworld-cli", worldId: po.world, data });
        }
        return true;
    }

    // Gast-Verkehr an mich (Compute-Host): die kanal-gestempelte peerId IST die Verbindungs-id im
    // Server-Kontext (unfälschbar). open/send/close → srv-open/srv-recv/srv-close; nur bei worldId-Match.
    _portalSrvFromGuest(peerId, msg) {
        const po = this._portalOverlay;
        if (!po || po.serverMode !== "js-compute" || po.computeRole !== "host") return false;
        if (!msg || msg.worldId !== po.world) return false;
        if (msg.kind === "open") {
            this._portalSrvEnsureConn(peerId);
            return true;
        }
        if (msg.kind === "close") {
            if (po.serverConns && po.serverConns.has(peerId)) {
                po.serverConns.delete(peerId);
                this._portalSrvSend({ __anazhNet: true, kind: "srv-close", conn: peerId });
                // Phase 2 — die Roster schrumpfte: den Gästen neu annoncieren.
                this._portalBroadcastRoster();
            }
            return true;
        }
        if (msg.kind !== "send") return false;
        const data = msg.data;
        if (typeof data !== "string" || data.length > AnazhRealm.SUBWORLD_NET_MAX_BYTES) return false;
        // Defensiv: ein send ohne vorheriges open registriert die Verbindung.
        this._portalSrvEnsureConn(peerId);
        this._portalSrvSend({ __anazhNet: true, kind: "srv-recv", conn: peerId, data });
        return true;
    }

    // Server-Antwort vom Compute-Host an mich (Gast): nur vom EIGENEN Host, nur eigene Sub-Welt;
    // `data` geht als `ws-recv` ins Client-iframe, nie ausgeführt.
    _portalCliReceive(peerId, msg) {
        const po = this._portalOverlay;
        if (!po || po.serverMode !== "js-compute" || po.computeRole !== "guest") return false;
        if (peerId !== po.hostPeerId) return false;
        if (!msg || msg.worldId !== po.world) return false;
        const data = msg.data;
        if (typeof data !== "string" || data.length > AnazhRealm.SUBWORLD_NET_MAX_BYTES) return false;
        return this._portalDeliverToClient(data);
    }

    // worldId einer Portal-Welt (Registry-/customWorlds-Schlüssel, NICHT der Pfad) — der Empfänger einer
    // portal-invite braucht sie für obtainPortalForWorld. Übersetzte Welten teilen worlds/translated/ →
    // translatedWorldId; sonst Pfad-Match gegen die Bibliothek. null = nicht library-bekannt.
    _resolvePortalWorldId(po) {
        if (!po) return null;
        if (po.translatedWorldId) {
            return this._worldEntry(po.translatedWorldId) ? po.translatedWorldId : null;
        }
        const w = this._libraryWorlds().find((x) => x.world === po.world);
        return w ? w.id : null;
    }

    // Mesh-Gruppe ins Portal einladen: `portal-invite`-Broadcast ({worldId, label}), event-driven, kein
    // DSL. Nur gemeinsamkeits-fähige Portale (Multiplayer oder Ko-Präsenz) und library-bekannte Welten
    // (der Empfänger muss sie via obtainPortalForWorld holen können).
    _p2pBroadcastPortalInvite() {
        const p2p = this.state.p2p;
        if (!p2p || !p2p.enabled || !p2p.connected) return false;
        const po = this._portalOverlay;
        if (!po || (!po.multiplayer && !po.coPresence)) return false;
        const worldId = this._resolvePortalWorldId(po);
        if (!worldId) return false;
        this.p2pSend({ type: "portal-invite", worldId, label: po.label || worldId });
        return true;
    }

    // Einladung empfangen: Prompt zeigen — nicht, wenn ich selbst im Portal bin (Game-Loop eingefroren).
    // worldId op-förmig gesäubert; eine fehlende Welt wird erst beim Annehmen abgewiesen.
    _p2pHandlePortalInvite(peerId, msg) {
        if (this._portalOverlay) return;
        const worldId = typeof msg.worldId === "string" ? msg.worldId.trim().toLowerCase() : "";
        if (!/^[a-z0-9_-]{1,40}$/.test(worldId)) return;
        const label = typeof msg.label === "string" ? msg.label.trim().slice(0, 60) : worldId;
        this.state.p2p.pendingInvite = { peerId, worldId, label, at: Date.now() };
        const entry = this.state.p2p.peers.get(peerId);
        const who = (entry && entry.avatarName) || String(peerId).slice(0, 8);
        this.log(`${who} öffnete ein Tor nach „${label}" — mitkommen?`, "INFO");
        this._renderPortalInviteBanner();
    }

    // Einladung annehmen: obtainPortalForWorld holt/findet den Portal-Bauplan, dann direkt betreten. Der
    // Overlay erzwingt `multiplayer:true` — die Einladung IST der Beweis, so verbindet die
    // Sub-Raum-Eingrenzung die Gruppe auch ohne Registry-Marke. Fehlt die Welt, ehrlicher Hinweis.
    joinPortalInvite() {
        const inv = this.state.p2p && this.state.p2p.pendingInvite;
        if (!inv) return { ok: false, reason: "no_invite" };
        if (this._portalOverlay) return { ok: false, reason: "already_in_portal" };
        const obtained = this.obtainPortalForWorld(inv.worldId);
        if (!obtained.ok) {
            const hint =
                obtained.reason === "world_unknown"
                    ? `Du hast „${inv.label}" nicht — hol die Welt erst aus dem Welt-Katalog.`
                    : `Konnte das Tor nach „${inv.label}" nicht öffnen (${obtained.reason}).`;
            this.log(hint, "WARN");
            return { ok: false, reason: obtained.reason };
        }
        const bp = this.state.blueprints[obtained.blueprint];
        // Ko-Präsenz-Welt behält ihre Natur (ihr Pose-Mesh braucht keinen Shim); nur eine
        // Shim-Multiplayer-Welt bekommt das erzwungene multiplayer:true.
        const forced = bp.portalMeta && bp.portalMeta.coPresence === true ? {} : { multiplayer: true };
        const meta = Object.assign({}, bp.portalMeta, forced);
        this.state.p2p.pendingInvite = null;
        this._renderPortalInviteBanner();
        // Direkt über _buildPortalOverlay — enterPortal bräuchte eine platzierte Affordance, die Einladung
        // kennt nur die worldId. Der Beitretende ist Gast, sein Compute-Host der Einladende (inv.peerId):
        // Öffner = Host, Beitretender = Gast. Für ein Relay-Portal ist die Rolle folgenlos.
        this._buildPortalOverlay(meta, { computeRole: "guest", hostPeerId: inv.peerId });
        this.log(`Du folgst der Einladung in „${inv.label}".`, "INFO");
        this.journalAppendOnce(
            `portalVisit:${(bp.portalMeta && bp.portalMeta.world) || inv.worldId}`,
            "portal",
            `Du tratst zum ersten Mal durch das Tor „${inv.label}".`
        );
        return { ok: true };
    }

    // W17 Phase C — die Einladung verwerfen.
    dismissPortalInvite() {
        if (!this.state.p2p || !this.state.p2p.pendingInvite) return;
        this.state.p2p.pendingInvite = null;
        this._renderPortalInviteBanner();
    }

    // W17 Phase C — den Einladungs-Banner rendern. Ein fixes Overlay-Element
    // (#portal-invite-banner) mit „X öffnete ein Tor nach <Welt>" + einem
    // Mitkommen-/Schließen-Knopf. Verborgen, wenn keine Einladung offen ist.
    _renderPortalInviteBanner() {
        if (typeof document === "undefined") return;
        const banner = document.getElementById("portal-invite-banner");
        if (!banner) return;
        const inv = this.state.p2p && this.state.p2p.pendingInvite;
        if (!inv) {
            banner.hidden = true;
            banner.innerHTML = "";
            return;
        }
        const entry = this.state.p2p.peers.get(inv.peerId);
        const who = (entry && entry.avatarName) || String(inv.peerId).slice(0, 8);
        banner.hidden = false;
        banner.innerHTML = "";
        const text = document.createElement("div");
        text.className = "portal-invite-text";
        text.textContent = `${who} öffnete ein Tor nach „${inv.label}"`;
        // W18-A — die ehrliche Ko-Präsenz-Stufe VOR dem Mitkommen: der
        // Empfänger löst die Welt lokal auf (seine Bibliothek) und erfährt,
        // ob er die Gefährten drinnen SEHEN wird oder jeder allein reist.
        const known = this._worldEntry(inv.worldId);
        const tierEl = document.createElement("div");
        tierEl.className = "portal-invite-tier";
        tierEl.textContent = this._portalCoPresenceTier(
            known || { multiplayer: true } // die Einladung selbst beweist mindestens Stufe 1
        ).label;
        const row = document.createElement("div");
        row.className = "portal-invite-row";
        const joinBtn = document.createElement("button");
        joinBtn.type = "button";
        joinBtn.className = "portal-invite-join";
        joinBtn.textContent = "Mitkommen";
        joinBtn.addEventListener("click", () => this.joinPortalInvite());
        const dismissBtn = document.createElement("button");
        dismissBtn.type = "button";
        dismissBtn.className = "portal-invite-dismiss";
        dismissBtn.textContent = "Schließen";
        dismissBtn.addEventListener("click", () => this.dismissPortalInvite());
        row.appendChild(joinBtn);
        row.appendChild(dismissBtn);
        banner.appendChild(text);
        banner.appendChild(tierEl);
        banner.appendChild(row);
    }

    // W12 Phase 1 — E-Tasten-Pfad: ist ein Portal in Reichweite, betritt es.
    // Liefert true wenn betreten — die E-Taste fällt dann nicht auf Mount.
    _tryEnterPortalAtPlayer() {
        if (this._portalOverlay) return false;
        const entry = this._findNearestAffordanceEntry("isPortal", AnazhRealm.PORTAL_REACH_M);
        if (!entry) return false;
        const res = this.enterPortal(entry);
        return !!(res && res.ok);
    }

    // W12 Phase 1 — pro Frame (via tickAffordances): zeigt den Prompt
    // „E — Portal betreten", wenn ein Portal in Reichweite ist. Läuft nur
    // in der Heimat-Welt — im Portal selbst ist der Loop eingefroren.
    _tickPortalAffordance() {
        if (typeof document === "undefined") return;
        const prompt = document.getElementById("portal-prompt");
        if (!prompt) return;
        const entry = this._findNearestAffordanceEntry("isPortal", AnazhRealm.PORTAL_REACH_M);
        if (entry) {
            const bp = this.state.blueprints && this.state.blueprints[entry.type];
            const label = (bp && bp.portalMeta && bp.portalMeta.label) || entry.type;
            prompt.textContent = `E — Portal betreten: ${label}`;
            prompt.hidden = false;
        } else if (!prompt.hidden) {
            prompt.hidden = true;
        }
    }

    // ═══ DIE WELT-MEMBRAN: die Portal-PASSAGE in der Hauptwelt ═══
    // Liest DASSELBE Gesetz wie das Lab (porta-core MEMBRAN_GESETZ + membranUniforms + membranPalette) als
    // TSL-Material — Technik ist Leser-Sache, die ZAHLEN sind EINE Quelle (diag-membran-gesetz). Bogen-
    // Beschnitt faltet in die Alpha statt discard. Aktivierung = Spieler-Nähe (aktivDepth/finalK);
    // Durchqueren der Membran-Ebene = BETRETEN (derselbe enterPortal-Chokepoint wie die E-Taste).

    // Die geteilte Membran-Geometrie je Gestalt (Plane spanW×height, Gesetz-seg).
    // DIE HÜLLE UM DIE WELLE (0910-4, Spike der Prüf-Welt 10.10.): die Membran trug `frustumCulled = false` („Wellen-
    // Verformung sprengt die statische Hülle") und zeichnete am Genesis-Ring 8 Befehle und 129 600 Dreiecke auch mit dem
    // Ring im Rücken. Die Welle (`positionNode = (x, y, d0)`) verschiebt jede Ecke NUR in z, und |d0| ≤ der Amplitude des
    // Gesetzes (`_membranAmplitude`): die Hülle trägt sie, das Culling bleibt an. Die Notfall-Fläche liegt in z = 0, also darin.
    _membranGeometryFor(tor) {
        if (!this._membranGeoMemo) this._membranGeoMemo = new Map();
        let geo = this._membranGeoMemo.get(tor.gestalt);
        if (!geo) {
            const mu = tor.mu;
            const seg = tor.gesetz.seg;
            geo = new THREE.PlaneGeometry(mu.spanW, mu.height, seg, seg);
            geo.translate(0, mu.midY, 0);
            const a = AnazhRealm._membranAmplitude(tor);
            geo.computeBoundingBox();
            geo.boundingBox.min.z = -a;
            geo.boundingBox.max.z = a;
            geo.boundingSphere = geo.boundingBox.getBoundingSphere(new THREE.Sphere());
            this._membranGeoMemo.set(tor.gestalt, geo);
        }
        return geo;
    }

    // Die größte Auslenkung der Membran-Welle (Gesetz porta-core MEMBRAN_GESETZ): h ist auf ±1 geklemmt, die Tiefe
    // `uWaveDepth` atmet im Membran-Tick bis zFace · (aktivDepth[0] + aktivDepth[1]) (act ≤ 1; der Start-Wert waveDepth
    // liegt darunter oder ist das Minimum), der Shader multipliziert (waveDepthK[0] + waveDepthK[1] · wave).
    static _membranAmplitude(tor) {
        const MG = tor.gesetz;
        const MU = tor.mu;
        const tiefe = Math.max(MU.waveDepth, MU.zFace * (MG.aktivDepth[0] + MG.aktivDepth[1]));
        return tiefe * (MG.waveDepthK[0] + MG.waveDepthK[1] * MU.wave);
    }

    // TSL-Port des Shell-Shaders (Formel-Referenz: worlds/portale/porta.js buildMembrane); Konstanten aus
    // MEMBRAN_GESETZ/membranUniforms. Liefert { mat, u } mit fünf Atem-Werten je Tor: time · camL (Kamera in TOR-LOKALEN
    // Koordinaten — der Marsch läuft im Lab-Rahmen, die Welt-Transform trägt das Mesh) · act · pulse · waveDepth (`u.x.value`,
    // der Membran-Tick schreibt sie). DIE GESTALT IST EIN STOFF-WERT (1310-18): die Maße, Fenster und Farben des Tors stehen in
    // `userData.tor` seines Stoffs und reisen als Uniform je Objekt (`_stoffWert`); der Graph entsteht EINMAL je Gesetz
    // (`_membranGraph`) — jedes Tor zeichnet mit DEMSELBEN Programm. Bis dahin faltete der Bau sie als Konstanten ein: je Tor
    // ein Programm, 59–504 ms Knoten-Bau auf dem Haupt-Faden (1310-17: 5 Membranen, 1,01 s).
    _membranMaterialFor(tor) {
        const T = THREE;
        const MG = tor.gesetz;
        const MU = tor.mu;
        const MM = MG.march;
        const u = {
            time: { value: 0 },
            camL: { value: new T.Vector3(0, MU.centerY, 8) },
            act: { value: 0 },
            pulse: { value: 1 },
            waveDepth: { value: MU.waveDepth },
        };
        // Realm-Fenster (statisch je Gestalt, Shell-Normierung) — die Gewichte reisen, der Marsch zweigt an ihnen
        const wRaw = MM.winC.map((c) => Math.max(0, 1 - Math.abs(MU.realm - c) / MM.win));
        const ws = wRaw[0] + wRaw[1] + wRaw[2] + wRaw[3] + 1e-4;
        const P = MU.pal;
        const mat = new T.MeshBasicNodeMaterial({ side: T.DoubleSide });
        mat.userData.tor = {
            u,
            a: new T.Vector4(MU.centerY, MU.rimAx, MU.rimAy, MU.swirl),
            b: new T.Vector4(MU.wave, MU.left, MU.spanW, MU.baseY),
            c: new T.Vector4(MU.height, MU.step, MU.fractal, MU.twist),
            d: new T.Vector4(
                MM.frqK[0] + MU.fractal * MM.frqK[1],
                MM.spK[0] + MU.energy * MM.spK[1],
                MU.open,
                MU.reflect
            ),
            w: new T.Vector4(wRaw[0] / ws, wRaw[1] / ws, wRaw[2] / ws, wRaw[3] / ws),
            zeile: this._torProfilZeile(MG.profilW, MU.profil),
            pa: new T.Vector3(P.PA[0], P.PA[1], P.PA[2]),
            pb: new T.Vector3(P.PB[0], P.PB[1], P.PB[2]),
            pc: new T.Vector3(P.PC[0], P.PC[1], P.PC[2]),
            pd: new T.Vector3(P.PD[0], P.PD[1], P.PD[2]),
        };
        const G = this._membranGraph(MG);
        mat.positionNode = G.positionNode;
        mat.colorNode = G.colorNode;
        mat.opacityNode = G.opacityNode;
        mat.alphaTest = 0.5;
        mat.transparent = false;
        mat.userData.portalMembran = true; // Linsen-Marker
        return { mat, u };
    }

    // DER BOGEN-ATLAS DER TORE (1310-18): jede Bogen-Oberkante (die 64er-Gesetz-Tabelle `mu.profil` der Gestalt, dieselbe wie die
    // Shell) ist EINE Zeile EINER Textur — jede Membran liest ihre Zeile (Stoff-Wert `zeile`) mit demselben Knoten, statt eine
    // eigene Textur in ihr Programm zu binden. Gleiche Tabelle, gleiche Zeile. Gelesen wird exakt auf der Texel-Mitte der Zeile:
    // die lineare Filterung mischt nur waagrecht, wie zuvor die Textur je Tor. Ist der Atlas voll, wächst er auf das Doppelte
    // (die geteilten Knoten lesen die neue Textur, die Höhe ist eine geteilte Uniform).
    _torProfilZeile(W, profil) {
        const TSL = THREE.TSL;
        const A =
            this._torProfile ||
            (this._torProfile = {
                zeilen: new Map(),
                n: 0,
                hoch: 0,
                breit: W,
                tex: null,
                knoten: [],
                uHoch: TSL.uniform(1),
            });
        if (W !== A.breit)
            throw this._stoffBruch("der Bogen-Atlas der Tore", new Error(`Tabellen-Breite ${W} ≠ ${A.breit}`));
        const bytes = profil.map((x) => Math.round(x * 255));
        const k = bytes.join(",");
        const da = A.zeilen.get(k);
        if (da !== undefined) return da;
        if (A.n >= A.hoch) {
            const hoch = Math.max(16, A.hoch * 2);
            const data = new Uint8Array(W * hoch * 4);
            if (A.tex) data.set(A.tex.image.data);
            const tex = new THREE.DataTexture(data, W, hoch, THREE.RGBAFormat);
            tex.name = "portal-membran";
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.needsUpdate = true;
            const alt = A.tex;
            A.tex = tex;
            A.hoch = hoch;
            A.uHoch.value = hoch;
            for (const kn of A.knoten) kn.value = tex;
            if (alt) alt.dispose();
        }
        const d = A.tex.image.data;
        for (let i = 0; i < W; i++) {
            const o = (A.n * W + i) * 4;
            d[o] = d[o + 1] = d[o + 2] = bytes[i];
            d[o + 3] = 255;
        }
        A.tex.needsUpdate = true;
        A.zeilen.set(k, A.n);
        return A.n++;
    }

    // DER EINE MEMBRAN-GRAPH JE GESETZ (1310-18): die Formeln der Shell über den Stoff-Werten des zeichnenden Tors
    // (`userData.tor`, `_membranMaterialFor`). Die vier Innenwelt-Modi zweigen an ihrem Fenster-Gewicht (Uniform-Zweig: alle
    // Fragmente eines Tors nehmen denselben Weg, ein Tor rechnet nur seine Modi); was die Zweige und der Rest des Schritts
    // teilen, steht vor den Zweigen als Variable (`toVar` legt die Zuweisung an ihrer Stelle im Stapel ab — im Zweig
    // zugewiesen, läse der Rest sie ungesetzt).
    _membranGraph(MG) {
        if (!this._membranGraphen) this._membranGraphen = new WeakMap();
        const da = this._membranGraphen.get(MG);
        if (da) return da;
        const TSL = THREE.TSL;
        const MM = MG.march;
        const ML = MG.look;
        const W = (p, typ) => this._stoffWert(TSL, "userData.tor." + p, typ);
        const time = W("u.time.value");
        const camL = W("u.camL.value", "vec3");
        const act = W("u.act.value");
        const pulse = W("u.pulse.value");
        const waveDepth = W("u.waveDepth.value");
        const ga = W("a", "vec4"); // centerY · rimAx · rimAy · swirl
        const gb = W("b", "vec4"); // wave · left · spanW · baseY
        const gc = W("c", "vec4"); // height · step · fractal · twist
        const gd = W("d", "vec4"); // frq · spF · open · reflect
        const win = W("w", "vec4");
        const zeile = W("zeile");
        const vPA = W("pa", "vec3");
        const vPB = W("pb", "vec3");
        const vPC = W("pc", "vec3");
        const vPD = W("pd", "vec3");
        const F = (x) => TSL.float(x);
        const pal = (t) => vPA.add(vPB.mul(TSL.cos(vPC.mul(t).add(vPD).mul(F(6.28318)))));
        // hash/vn/fbm — die Shell-Formeln als Fn (das W9-Himmel-Muster).
        const hash2 = TSL.Fn(([q]) => {
            const p = TSL.fract(q.mul(TSL.vec2(123.34, 345.45)));
            const p2 = p.add(TSL.dot(p, p.add(F(34.345))));
            return TSL.fract(p2.x.mul(p2.y));
        });
        const vn2 = TSL.Fn(([q]) => {
            const i = TSL.floor(q);
            const f0 = TSL.fract(q);
            const f = f0.mul(f0).mul(F(3.0).sub(f0.mul(2.0)));
            return TSL.mix(
                TSL.mix(hash2(i), hash2(i.add(TSL.vec2(1.0, 0.0))), f.x),
                TSL.mix(hash2(i.add(TSL.vec2(0.0, 1.0))), hash2(i.add(TSL.vec2(1.0, 1.0))), f.x),
                f.y
            );
        });
        const fbmN = (q, okt) => {
            let s = F(0.0);
            let p = q;
            let a = 0.5;
            for (let o = 0; o < okt; o++) {
                s = s.add(vn2(p).mul(a));
                p = p.mul(2.05).add(1.3);
                a *= 0.5;
            }
            return s;
        };
        // ── Hfull(q): die stehende Welle (Vertex-Verformung, Shell-verbatim) ──
        const centerXY = TSL.vec2(0.0, ga.x);
        const Hfull = (q) => {
            const c = q.sub(centerXY);
            const r = TSL.length(c);
            const a = TSL.atan(c.y, c.x);
            const t = time;
            const Rb = F(1.0).div(
                TSL.sqrt(
                    TSL.pow(TSL.cos(a).div(ga.y), F(2.0))
                        .add(TSL.pow(TSL.sin(a).div(ga.z), F(2.0)))
                        .add(F(1e-4))
                )
            );
            const rr = TSL.clamp(r.div(Rb), F(0.0), F(1.4));
            const twist = a.mul(F(MG.twistK)).add(ga.w.div(r.add(F(MG.swirlR0))));
            const om = t.mul(F(MG.om));
            const outw = TSL.sin(rr.mul(F(MG.kk)).sub(om).add(twist));
            const refl = TSL.sin(F(2.0).sub(rr).mul(F(MG.kk)).sub(om).add(twist));
            const wave = outw.add(refl.mul(F(MG.refl))).mul(TSL.exp(rr.negate().mul(F(MG.damp))));
            const pierce = TSL.sin(t.mul(F(MG.pierce[0])))
                .mul(TSL.exp(rr.mul(rr).negate().mul(F(MG.pierce[1]))))
                .mul(F(MG.pierce[2]));
            const micro = fbmN(
                c.mul(F(MG.micro[0])).sub(TSL.vec2(t.mul(F(MG.micro[1])), t.mul(F(MG.micro[1])))),
                3
            ).mul(F(MG.micro[2]));
            const h = TSL.clamp(wave.mul(F(MG.hGain[0])).add(pierce).add(micro).mul(F(MG.hGain[1])), F(-1.0), F(1.0));
            return h.mul(waveDepth).mul(F(MG.waveDepthK[0]).add(gb.x.mul(F(MG.waveDepthK[1]))));
        };
        const xy = TSL.positionGeometry.xy;
        const d0 = Hfull(xy);
        const positionNode = TSL.vec3(xy.x, xy.y, d0);
        // ── Fragment: Beschnitt (Alpha-Fold) aus der Zeile des Bogen-Atlas + Raymarch (12 Schritte entfaltet) ──
        const uu = TSL.clamp(xy.x.sub(gb.y).div(gb.z), F(0.0), F(1.0));
        const A = this._torProfile;
        const profil = TSL.texture(A.tex, TSL.vec2(uu, zeile.add(0.5).div(A.uHoch)));
        A.knoten.push(profil);
        const topY = gb.w.add(profil.r.mul(gc.x));
        const keep = TSL.step(xy.y, topY.add(F(0.002)));
        // Normale aus der Wellen-Ableitung (Fragment-Rekonstruktion — exakt die
        // Shell-Differenzen, nur pro Fragment statt pro Vertex interpoliert).
        const e = MG.eps;
        const dxx = Hfull(xy.add(TSL.vec2(e, 0.0)));
        const dyy = Hfull(xy.add(TSL.vec2(0.0, e)));
        const nrm = TSL.normalize(TSL.cross(TSL.vec3(e, 0.0, dxx.sub(d0)), TSL.vec3(0.0, e, dyy.sub(d0))));
        const vLocal = TSL.vec3(xy.x, xy.y, d0);
        const Vd = TSL.normalize(camL.sub(vLocal));
        const rd = Vd.negate();
        const frq = gd.x;
        const center3 = TSL.vec3(0.0, ga.x, 0.0);
        const marsch = TSL.Fn(() => {
            const inter = TSL.vec3(0.0, 0.0, 0.0).toVar();
            for (let i = 0; i < MM.steps; i++) {
                const q = vLocal.add(rd.mul(gc.y.mul(i).add(F(MM.t0))));
                const rel = q.sub(center3);
                const r = TSL.max(TSL.length(rel.xy), F(0.003)).toVar();
                const ang = TSL.atan(rel.y, rel.x).toVar();
                const dep = r
                    .mul(F(MM.depK[1]))
                    .add(gc.y.mul(i * MM.depK[0]))
                    .toVar();
                const sp = time.mul(gd.y).toVar();
                const lp = TSL.log(r).mul(F(MM.lpK)).sub(sp).toVar();
                const swirl = ang.add(ga.w.div(r)).toVar();
                const v = F(0.0).toVar();
                const tc = F(0.0).toVar();
                TSL.If(win.x.greaterThan(0.001), () => {
                    const K = MM.wurm;
                    const s0 = TSL.sin(
                        lp
                            .mul(frq.mul(K[0]))
                            .add(swirl.mul(F(K[1])))
                            .add(dep.mul(gc.w.mul(K[2])))
                    )
                        .mul(0.5)
                        .add(0.5);
                    v.addAssign(s0.mul(s0).mul(win.x));
                    tc.addAssign(TSL.fract(lp.mul(F(K[3])).add(swirl.mul(F(K[4] / 6.28318)))).mul(win.x));
                });
                TSL.If(win.y.greaterThan(0.001), () => {
                    const K = MM.facet;
                    const KK = F(K[0]).add(gc.z.mul(K[1]));
                    const fa = TSL.abs(TSL.mod(swirl, F(6.28318).div(KK)).sub(F(3.14159).div(KK)));
                    const cc = TSL.cos(fa.mul(KK)).mul(0.5).add(0.5);
                    const s1 = TSL.sin(lp.mul(frq.mul(K[2])))
                        .mul(0.5)
                        .add(0.5);
                    v.addAssign(cc.mul(cc).mul(cc).mul(s1).mul(win.y));
                    tc.addAssign(TSL.fract(fa.mul(F(K[3])).add(lp.mul(F(K[4])))).mul(win.y));
                });
                TSL.If(win.z.greaterThan(0.001), () => {
                    const K = MM.plasma;
                    const warp = fbmN(TSL.vec2(lp.mul(frq.mul(K[0])), dep.mul(F(K[1])).add(sp.mul(F(K[2])))), 4);
                    const pf0 = fbmN(
                        TSL.vec2(ang.mul(F(K[3])).add(warp.mul(F(K[4]))), dep.mul(frq.mul(K[5])).sub(sp.mul(F(K[6])))),
                        4
                    );
                    const pf = F(1.0).sub(TSL.abs(pf0.mul(2.0).sub(1.0)));
                    const plasma = TSL.pow(TSL.clamp(pf, F(0.0), F(1.0)), F(K[7]));
                    v.addAssign(plasma.mul(win.z.mul(K[8])));
                    tc.addAssign(
                        TSL.fract(
                            pf
                                .mul(F(K[9]))
                                .add(lp.mul(F(K[10])))
                                .add(dep.mul(F(K[11])))
                        ).mul(win.z)
                    );
                });
                TSL.If(win.w.greaterThan(0.001), () => {
                    const K = MM.nebel;
                    const n1 = fbmN(
                        TSL.vec2(
                            ang.mul(frq.mul(K[0])).add(TSL.sin(lp).mul(F(K[1]))),
                            dep.mul(F(K[2])).add(sp.mul(F(K[3])))
                        ),
                        4
                    );
                    const n2 = fbmN(
                        TSL.vec2(ang.mul(frq.mul(K[4])).sub(n1.mul(F(K[5]))), dep.mul(F(K[6])).add(sp.mul(F(K[7])))),
                        4
                    );
                    const neb = TSL.pow(TSL.clamp(n1.mul(n2).mul(F(K[8])), F(0.0), F(1.0)), F(K[9]));
                    v.addAssign(neb.mul(win.w.mul(K[10])));
                    tc.addAssign(TSL.fract(n1.mul(F(K[11])).add(dep.mul(F(K[12])))).mul(win.w));
                });
                const vc = TSL.max(F(0.0), v.sub(F(MM.vCut[0]))).mul(F(MM.vCut[1]));
                const g = vc.div(
                    F(1.0)
                        .add(r.mul(r).mul(F(MM.gDen[0])))
                        .add(dep.mul(F(MM.gDen[1])))
                );
                inter.addAssign(
                    pal(tc)
                        .mul(g)
                        .mul(F(Math.pow(MM.att, i)))
                );
            }
            return inter;
        });
        const inter = marsch();
        const N = nrm;
        const Rf = TSL.reflect(Vd.negate(), N);
        const st = TSL.step(
            F(ML.star[0]),
            hash2(TSL.floor(Rf.xy.mul(F(ML.star[1])).add(TSL.vec2(Rf.z.mul(F(ML.star[2])), Rf.z.mul(F(ML.star[2]))))))
        );
        const sky = pal(Rf.y.mul(F(ML.skyK[0])).add(F(ML.skyK[1])))
            .mul(F(ML.skyK[2]))
            .add(TSL.vec3(st, st, st).mul(F(ML.star[3])));
        const fres = TSL.pow(F(1.0).sub(TSL.max(TSL.dot(N, Vd), F(0.0))), F(ML.fresPow));
        const spec = TSL.pow(
            TSL.max(TSL.dot(Rf, TSL.normalize(TSL.vec3(ML.specDir[0], ML.specDir[1], ML.specDir[2]))), F(0.0)),
            F(ML.specPow)
        );
        const dc = TSL.length(vLocal.sub(center3).xy);
        const core = TSL.exp(dc.mul(dc).negate().mul(F(ML.core[0])))
            .mul(F(ML.core[1]).add(gd.z.mul(ML.core[2])))
            .mul(
                TSL.sin(time.mul(F(ML.core[5])))
                    .mul(F(ML.core[4]))
                    .add(F(ML.core[3]))
            );
        let col = inter
            .mul(F(ML.mixK[0]))
            .add(sky.mul(fres).mul(gd.w.mul(ML.mixK[1])))
            .add(TSL.vec3(ML.specCol[0], ML.specCol[1], ML.specCol[2]).mul(spec).mul(gd.w.mul(ML.specK)))
            .add(pal(F(ML.corePal)).mul(core).mul(F(ML.mixK[3])));
        col = col.mul(
            act
                .mul(F(ML.finalK[2]))
                .add(F(ML.finalK[1]))
                .mul(F(ML.finalK[0]))
                .mul(pulse.mul(F(ML.finalK[4])).add(F(ML.finalK[3])))
        );
        // ACES (Shell-verbatim) — die Welt-Ausgabe-Transform bleibt Leser-Sache.
        const aces = (x) =>
            TSL.clamp(x.mul(x.mul(2.51).add(0.03)).div(x.mul(x.mul(2.43).add(0.59)).add(0.14)), F(0.0), F(1.0));
        const G = { positionNode, colorNode: TSL.vec4(aces(col), 1.0), opacityNode: keep };
        this._membranGraphen.set(MG, G);
        return G;
    }

    // ═══ PORTA-NEBEL: mu.fog erreicht die Welt ═══
    // TSL-Port des Lab-Nebels (Formel-Referenz: worlds/portale/porta.js buildFog): Volumen-Raymarch in
    // einer BackSide-Box um den Tor-Fuß; Dichte = Ellipsen-Profil (dieselben rimAx/rimAy/om/kk wie die
    // Membran) × floorCut × Wellenfeld × fbm3 × nebelAct × Puls, Palette aus MU.pal. 16 Schritte, kein
    // Depth-Pre-Pass (depthTest verdeckt). Teilt u der Membran (+ u.nebelAct). NEBEL_VIS.host=tsl-box. Die Gestalt (Box-Maße,
    // Bogen, Palette) ist ein Stoff-Wert (`userData.tor`), der Graph EINER je Gesetz (`_nebelGraph`, 1310-18).
    _nebelMaterialFor(tor, u) {
        const T = THREE;
        const MU = tor.mu;
        u.nebelAct = { value: 0 };
        // Box-Maße (Lab-Formeln buildFog, statisch je Gestalt).
        const m = this._nebelMasseFor(tor);
        const P = MU.pal;
        const mat = new T.MeshBasicNodeMaterial({
            side: T.BackSide,
            transparent: true,
            depthWrite: false,
        });
        mat.userData.tor = {
            u,
            a: new T.Vector4(m.hx, m.hz, m.mnY, m.mxY),
            b: new T.Vector4(m.coneAdd, MU.centerY, MU.rimAx, MU.rimAy),
            c: new T.Vector4(Math.max(MU.zFace, 0.2), MU.swirl, MU.baseY, 0),
            pa: new T.Vector3(P.PA[0], P.PA[1], P.PA[2]),
            pb: new T.Vector3(P.PB[0], P.PB[1], P.PB[2]),
            pc: new T.Vector3(P.PC[0], P.PC[1], P.PC[2]),
            pd: new T.Vector3(P.PD[0], P.PD[1], P.PD[2]),
        };
        const G = this._nebelGraph(tor.gesetz);
        mat.colorNode = G.colorNode;
        mat.opacityNode = G.opacityNode;
        mat.userData.portalNebel = true; // Linsen-Marker
        return { mat };
    }

    // DER EINE NEBEL-GRAPH JE GESETZ (1310-18): die Formeln des Lab-Nebels über den Stoff-Werten des zeichnenden Tors.
    _nebelGraph(MG) {
        if (!this._nebelGraphen) this._nebelGraphen = new WeakMap();
        const da = this._nebelGraphen.get(MG);
        if (da) return da;
        const TSL = THREE.TSL;
        const F = (x) => TSL.float(x);
        const W = (p, typ) => this._stoffWert(TSL, "userData.tor." + p, typ);
        const time = W("u.time.value");
        const pulse = W("u.pulse.value");
        const nebelAct = W("u.nebelAct.value");
        const na = W("a", "vec4"); // hx · hz · mnY · mxY
        const nb = W("b", "vec4"); // coneAdd · centerY · rimAx · rimAy
        const nc = W("c", "vec4"); // max(zFace, 0.2) · swirl · baseY
        const vPA = W("pa", "vec3");
        const vPB = W("pb", "vec3");
        const vPC = W("pc", "vec3");
        const vPD = W("pd", "vec3");
        const pal = (t) => vPA.add(vPB.mul(TSL.cos(vPC.mul(t).add(vPD).mul(F(6.28318)))));
        const h3 = TSL.Fn(([q]) => {
            const p = TSL.fract(q.mul(F(0.3183099)).add(F(0.1))).mul(F(17.0));
            return TSL.fract(p.x.mul(p.y).mul(p.z).mul(p.x.add(p.y).add(p.z)));
        });
        const vn3 = TSL.Fn(([q]) => {
            const i = TSL.floor(q);
            const f0 = TSL.fract(q);
            const f = f0.mul(f0).mul(F(3.0).sub(f0.mul(2.0)));
            const mixZ = (z) =>
                TSL.mix(
                    TSL.mix(h3(i.add(TSL.vec3(0, 0, z))), h3(i.add(TSL.vec3(1, 0, z))), f.x),
                    TSL.mix(h3(i.add(TSL.vec3(0, 1, z))), h3(i.add(TSL.vec3(1, 1, z))), f.x),
                    f.y
                );
            return TSL.mix(mixZ(0), mixZ(1), f.z);
        });
        const fbm3 = (p) =>
            vn3(p)
                .mul(F(0.5))
                .add(vn3(p.mul(F(2.02)).add(F(1.3))).mul(F(0.25)))
                .mul(F(1.2));
        const ro = W("u.camL.value", "vec3");
        const vLocal = TSL.positionGeometry; // die Box-Geometrie ist tor-lokal gebaut
        const rd = TSL.normalize(vLocal.sub(ro));
        const bmin = TSL.vec3(na.x.negate(), na.z, na.y.negate());
        const bmax = TSL.vec3(na.x, na.w, na.y);
        const t0 = bmin.sub(ro).div(rd);
        const t1 = bmax.sub(ro).div(rd);
        const tmn = TSL.min(t0, t1);
        const tmx = TSL.max(t0, t1);
        const tn = TSL.max(TSL.max(tmn.x, tmn.y), TSL.max(tmn.z, F(0.0)));
        const tf = TSL.min(TSL.min(tmx.x, tmx.y), tmx.z);
        const SCHRITTE = 16;
        const dt = TSL.max(tf.sub(tn), F(0.0)).div(F(SCHRITTE));
        const om = time.mul(F(MG.om));
        const kk = F(MG.kk);
        const jit = h3(vLocal.mul(F(37.7)).add(TSL.fract(time)));
        const cy = nb.y;
        let trans = F(1.0);
        let acc = TSL.vec3(0.0, 0.0, 0.0);
        for (let i = 0; i < SCHRITTE; i++) {
            const tt = tn.add(F(i).add(jit).mul(dt));
            const p = ro.add(rd.mul(tt));
            const c = p.xy.sub(TSL.vec2(0.0, cy));
            const r = TSL.length(c).add(F(1e-3));
            const a = TSL.atan(c.y, c.x);
            const Rb = F(1.0).div(
                TSL.sqrt(
                    TSL.pow(TSL.cos(a).div(nb.z), F(2.0))
                        .add(TSL.pow(TSL.sin(a).div(nb.w), F(2.0)))
                        .add(F(1e-4))
                )
            );
            const rr = r.div(Rb);
            const az = TSL.clamp(TSL.abs(p.z).div(nc.x), F(0.0), F(1.0));
            const coneR = az.mul(nb.x).add(F(1.0));
            const twist = a.mul(F(2.0)).add(nc.y.div(r.add(F(0.25))));
            const waveR = TSL.sin(rr.mul(kk).sub(om).add(twist))
                .add(TSL.sin(F(2.0).sub(rr).mul(kk).sub(om).add(twist)).mul(F(0.72)))
                .mul(TSL.exp(rr.negate().mul(F(0.7))));
            const waveZ = TSL.sin(
                az
                    .mul(F(6.5))
                    .sub(om.mul(F(0.85)))
                    .add(twist.mul(F(0.4)))
            );
            const w01 = TSL.clamp(
                waveR
                    .mul(F(0.62))
                    .add(waveZ.mul(F(0.38)))
                    .mul(F(0.5))
                    .add(F(0.5)),
                F(0.0),
                F(1.0)
            );
            const fillIn = TSL.smoothstep(coneR.mul(F(0.44)), coneR.mul(F(0.86)), rr);
            const wallOut = TSL.smoothstep(coneR.add(F(0.06)), coneR.sub(F(0.2)), rr);
            const n = fbm3(p.mul(F(1.15)).add(TSL.vec3(F(0.0), F(0.0), time.mul(F(0.12)))));
            const floorCut = TSL.smoothstep(nc.z.sub(F(0.12)), nc.z.add(F(0.1)), p.y);
            const dens = fillIn
                .mul(wallOut)
                .mul(floorCut)
                .mul(TSL.smoothstep(F(0.15), F(0.85), w01).mul(F(0.88)).add(F(0.12)))
                .mul(n.mul(F(0.5)).add(F(0.5)))
                .mul(nebelAct)
                .mul(pulse.mul(F(0.34)).add(F(0.82)));
            const portalCol = TSL.max(
                pal(
                    rr
                        .mul(F(0.16))
                        .add(w01.mul(F(0.16)))
                        .add(F(0.3))
                ),
                TSL.vec3(0.0, 0.0, 0.0)
            );
            const glow = w01.mul(F(0.95)).add(F(0.42));
            const lum = TSL.mix(TSL.vec3(0.56, 0.7, 0.93), portalCol.mul(F(1.85)), F(0.78))
                .mul(glow)
                .mul(pulse.mul(F(0.55)).add(F(0.6)));
            const a2 = F(1.0).sub(TSL.exp(dens.mul(dt).mul(F(6.5)).negate()));
            acc = acc.add(lum.mul(a2).mul(trans));
            trans = trans.mul(F(1.0).sub(a2));
        }
        const G = { colorNode: TSL.vec4(acc, 1.0), opacityNode: F(1.0).sub(trans) };
        this._nebelGraphen.set(MG, G);
        return G;
    }

    // Die Nebel-Box-Maße (Lab buildFog, statisch je Gestalt): cy/rimAy/coneAdd/
    // hx/hz/mnY/mxY — EIN Rechner für Material + Geometrie.
    _nebelMasseFor(tor) {
        const MU = tor.mu;
        const coneAdd = ((MU.orders - 1) * MU.jambW) / MU.rimAx;
        const hx = MU.rimAx * (1 + coneAdd) * 1.08;
        const hz = MU.zFace * 1.04;
        const mxY = MU.centerY + MU.rimAy * (1 + coneAdd) * 1.08;
        const mnY = MU.baseY - 0.12;
        return { coneAdd, hx, hz, mnY, mxY };
    }

    // Die geteilte Nebel-Geometrie je Gestalt (tor-lokal: Box übersetzt auf
    // die Volumen-Mitte — positionGeometry IST damit der Lab-Rahmen).
    _nebelGeometryFor(tor) {
        if (!this._nebelGeoMemo) this._nebelGeoMemo = new Map();
        let geo = this._nebelGeoMemo.get(tor.gestalt);
        if (!geo) {
            const m = this._nebelMasseFor(tor);
            geo = new THREE.BoxGeometry(m.hx * 2, m.mxY - m.mnY, m.hz * 2);
            geo.translate(0, (m.mnY + m.mxY) / 2, 0);
            this._nebelGeoMemo.set(tor.gestalt, geo);
        }
        return geo;
    }

    // Membran-Tick: je sichtbarem Portal-Eintrag mit Tor-Gestalt EINE Membran (Registry je entry.id),
    // Uniforms atmen, HINDURCHGEHEN prüfen (Ebenen-Kreuzung in der Apertur → enterPortal, derselbe
    // Chokepoint wie die E-Taste). Scan 1 Hz (bounded), Uniform-Atem pro Frame.
    _tickPortalMembranes(currentTime) {
        const st = this.state;
        if (!st || !st.scene || typeof THREE === "undefined") return;
        if (!this._portalMembranes) this._portalMembranes = new Map();
        const reg = this._portalMembranes;
        const pm = st.playerMesh;
        if (!pm || !pm.position) return;
        const px = pm.position.x;
        const py = pm.position.y;
        const pz = pm.position.z;
        const SICHT = 180;
        // ── 1-Hz-Scan: Kandidaten einsammeln + Verwaiste räumen ──
        if (!this._membranScanAt || currentTime - this._membranScanAt > 1) {
            this._membranScanAt = currentTime;
            const seen = new Set();
            const arches = st.architectures;
            if (Array.isArray(arches)) {
                for (const entry of arches) {
                    if (!entry || !entry.position) continue;
                    if (!(entry.affordances && entry.affordances.isPortal)) continue;
                    const tor = this._torGesetzFor(entry);
                    if (!tor) continue; // Part-Gestalt-Portale tragen ihre eigene sichtbare Passage
                    // Der Eintrag bleibt registriert, solange er LEBT — lazy beim ersten Sicht-Kontakt gebaut, danach nie
                    // wieder. Nie dispose beim Verlassen: sonst TSL-Bau + Pipeline-Compile pro Grenzübertritt + Geo-Leck.
                    seen.add(entry.id);
                    if (!reg.has(entry.id)) {
                        const dx = entry.position.x - px;
                        const dz = entry.position.z - pz;
                        if (dx * dx + dz * dz > SICHT * SICHT) continue;
                        this._membranBauFor(entry, tor);
                    }
                }
            }
            for (const [id, rec] of reg) {
                if (!seen.has(id)) {
                    // Nur ein WIRKLICH gefallener Eintrag räumt — mit seinem Stoff (er trägt den topTex-dispose-
                    // Listener und gehört dem Tor). Die Geometrie gehört dem Memo je Gestalt (`_membranGeometryFor`,
                    // `_nebelGeometryFor`) und allen Toren dieser Gestalt — sie bleibt (Frost-Nachbesserung 4: die
                    // Entsorgungs-Wand nannte sie, ein Tor außer Sicht entsorgte die Geometrie seiner Geschwister).
                    if (rec.mesh) {
                        st.scene.remove(rec.mesh);
                        if (rec.mesh.material) rec.mesh.material.dispose();
                    }
                    // PORTA-NEBEL — der Kasten fällt mit seinem Tor (derselbe Schnitt).
                    if (rec.nebel) {
                        st.scene.remove(rec.nebel);
                        if (rec.nebel.material) rec.nebel.material.dispose();
                    }
                    reg.delete(id);
                }
            }
        }
        if (reg.size === 0) {
            this._tickPortalLicht(null); // kein Tor, kein Licht des Tors (mit dem letzten fällt sein Platz im Licht-Pool)
            return;
        }
        // ── pro Frame: Atem + Hindurchgehen ──
        const reach = AnazhRealm.PORTAL_REACH_M;
        for (const rec of reg.values()) {
            const entry = rec.entry;
            const mu = rec.tor.mu;
            const MG = rec.tor.gesetz;
            const scale = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
            const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
            const c = Math.cos(ry);
            const s = Math.sin(ry);
            const dx = px - entry.position.x;
            const dz = pz - entry.position.z;
            const d = Math.hypot(dx, dz);
            // Fern-Schlaf: jenseits der Sicht ruht die Membran (unsichtbar, kein
            // Uniform-Takt) — das Material bleibt kompiliert stehen (Erstarren-Lehre).
            // DER SCHLAF VERLÄSST DEN GRAPHEN (0910-4): ein unsichtbares Mesh im Graphen hält seine Puffer auf der GPU (der
            // Kehraus `_gpuKehraus` lässt, was ein Objekt des Graphen trägt) — gemessen an der Wiese 1 000 m vom Ring: 1,98 MB
            // `szene:portal-membran` für sieben schlafende Passagen. Schläft sie, verlässt sie mit ihrem Nebel den Graphen,
            // und der EINE Kehraus nimmt die Puffer, die keine wache Schwester derselben Gestalt mehr trägt; erwacht sie,
            // kehrt sie zurück und lädt hoch — Stoff und Pipeline stehen weiter.
            if (d > SICHT) {
                if (rec.mesh && rec.mesh.visible) rec.mesh.visible = false;
                if (rec.nebel && rec.nebel.visible) rec.nebel.visible = false;
                if (rec.mesh && rec.mesh.parent) rec.mesh.parent.remove(rec.mesh);
                if (rec.nebel && rec.nebel.parent) rec.nebel.parent.remove(rec.nebel);
                rec.lastLz = null;
                continue;
            }
            if (rec.mesh && !rec.mesh.parent) st.scene.add(rec.mesh);
            if (rec.nebel && !rec.nebel.parent) st.scene.add(rec.nebel);
            if (rec.mesh && !rec.mesh.visible) rec.mesh.visible = true;
            let act = Math.max(0, Math.min(1, 1 - (d - reach) / 12));
            // V18.491.75 — Heimkehr-Linger: Ausgangstor bleibt kurz warm (Kontinuum).
            const hk = this._portalHeimkehr;
            if (hk) {
                if (currentTime >= hk.until) {
                    this._portalHeimkehr = null;
                } else if (!hk.entryId || (entry && entry.id === hk.entryId)) {
                    const span = Math.max(0.001, hk.until - hk.start);
                    const fade = Math.max(0, Math.min(1, (hk.until - currentTime) / span));
                    act = Math.max(act, 0.55 + 0.45 * fade);
                    rec.armed = false;
                }
            }
            rec._act = act;
            rec.u.time.value = currentTime;
            rec.u.act.value = act;
            rec.u.pulse.value = 0.5 + 0.5 * Math.sin(currentTime * MG.puls);
            rec.u.waveDepth.value = mu.zFace * (MG.aktivDepth[0] + MG.aktivDepth[1] * act);
            // Der Nebel-Dial atmet: nebelAct = fog · (actBase + actOpen·act) (Lab-Formel, act = Welt-Analog zu
            // openM); Zahlen aus NEBEL_GESETZ, live pcN.nebelAct zuerst. Der Kasten lebt nur nähe-aktiviert
            // (Raymarch-Kosten bleiben am Tor). Absichtlich duales Feel: NEBEL_VIS glsl-box/tsl-box.
            if (rec.nebel) {
                const pcN = typeof globalThis !== "undefined" ? globalThis.__portaCore : null;
                if (rec.u.nebelAct) {
                    const N = (pcN && pcN.NEBEL_GESETZ) || {};
                    rec.u.nebelAct.value =
                        pcN && typeof pcN.nebelAct === "function"
                            ? pcN.nebelAct(mu.fog, act)
                            : (Number.isFinite(mu.fog) ? mu.fog : N.fogDefault || 0.85) *
                              ((N.actBase || 0.7) + (N.actOpen || 0.35) * act);
                }
                rec.nebel.visible = act > 0.001;
            }
            // Kamera in Tor-lokalen Koordinaten (der Marsch läuft im Lab-Rahmen).
            const cam = st.camera;
            if (cam && cam.position) {
                const cxw = cam.position.x - entry.position.x;
                const czw = cam.position.z - entry.position.z;
                rec.u.camL.value.set(
                    (cxw * c - czw * s) / scale,
                    (cam.position.y - (entry.position.y - 0.5)) / scale,
                    (cxw * s + czw * c) / scale
                );
            }
            // ── HINDURCHGEHEN: Spieler kreuzt die Membran-Ebene in der Apertur ──
            const lx = (dx * c - dz * s) / scale;
            const lz = (dx * s + dz * c) / scale;
            const ly = (py - (entry.position.y - 0.5)) / scale;
            const inApertur =
                Math.abs(lx) < mu.rimAx * 0.92 &&
                ly > mu.baseY - 0.2 &&
                ly < mu.apexY + 0.4 &&
                Math.abs(lz) < mu.zFace + 1.2;
            // Re-Arm beim VERLASSEN der Apertur-Zone: ein Durchgang verbraucht die
            // Waffnung (kein Doppelfeuer in einem Pass), wer die Zone verlässt und
            // erneut kreuzt (egal welche Richtung), betritt wieder.
            if (rec.armed === false && !inApertur) rec.armed = true;
            // Tür-Flügel öffnen sich dem Reisenden: g.tuer-Meshes drehen um die Hinge-Achse, Ziel = Nähe ×
            // _tuerOffenRad() (EINE Quelle TUER_GESETZ.offen, wie das Lab-DOOR_OPEN), weich geglättet.
            // Nur Registry-Portale (≤ Handvoll); ferne Tore stehen zu.
            this._tickTorFluegel(rec, entry, act);
            if (
                rec.armed !== false &&
                inApertur &&
                typeof rec.lastLz === "number" &&
                Math.sign(rec.lastLz) !== 0 &&
                Math.sign(lz) !== 0 &&
                Math.sign(lz) !== Math.sign(rec.lastLz) &&
                !this._portalOverlay
            ) {
                rec.armed = false;
                this.enterPortal(entry);
            }
            rec.lastLz = inApertur ? lz : null;
        }
        // Das Lab-portalLight als EIN geteiltes Welt-Licht (nie ein Licht je Tor — der Genesis-Ring trüge
        // zehn): steht am NÄCHSTEN aktiven Tor, atmet (0.3 + act·3.4)·(0.8 + 0.28·puls); kein Tor nah → aus.
        let naeh = null;
        for (const rec of reg.values()) {
            if (!rec.mesh || !rec.mesh.visible || !(rec._act > 0.02)) continue;
            if (!naeh || rec._act > naeh._act) naeh = rec;
        }
        this._tickPortalLicht(naeh);
    }

    // DAS LICHT DES TORS (K11): das Lab-portalLight ist ein Bürger des Licht-Pools — das wache Tor (das nächste aktive) trägt
    // sein Emitter-Datum aus porta GLUT_GESETZ (Farbe, Reichweite, Abfall, Höhe am Spring-Punkt; der Kern des Abfalls ist
    // der halbe Bogen der Membran, K11b) und die Stärke des Labors
    // `glutIntensity(act, puls)`; der Licht-Takt liest es (`_leuchtQuellen`). Kein Szenen-Licht (bis K11 ein PointLight, das
    // beim ersten Tor in die Szene trat und dort auf 0 blieb). Ohne waches Tor kein Licht.
    _tickPortalLicht(rec) {
        if (!rec) {
            this._portalLeuchte = null;
            return;
        }
        const PC = globalThis.__portaCore;
        const G = PC.GLUT_GESETZ;
        const e = rec.entry;
        const mu = rec.tor.mu;
        const sc = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
        const q =
            this._portalLeuchte ||
            (this._portalLeuchte = {
                quelle: "tor",
                L: { farbe: G.color, staerke: 0, reichweiteM: G.dist, abfall: G.decay, kernM: 0 },
                masse: 1,
                phase: 0,
            });
        q.L.kernM = 0.5 * mu.spanW * sc; // der Kern des Abfalls (fachwerk `lichtAbfall`): die Membran leuchtet als Fläche, ihr halber Bogen
        q.x = e.position.x;
        q.y = e.position.y - 0.5 + mu.springY * G.ySpring * sc;
        q.z = e.position.z;
        q.L.staerke = PC.glutIntensity(rec._act, rec.u && rec.u.pulse ? rec.u.pulse.value : 1);
    }

    // Eine Membran für einen Eintrag bauen (fail-LAUT: schlägt der TSL-Bau fehl, bricht er beim Namen —
    // `_stoffBruch`; die schlichte Ersatz-Fläche ist gefallen, K22).
    _membranBauFor(entry, tor) {
        const st = this.state;
        let mesh = null;
        let u = null;
        try {
            const built = this._membranMaterialFor(tor);
            u = built.u;
            mesh = new THREE.Mesh(this._membranGeometryFor(tor), built.mat);
        } catch (err) {
            throw this._stoffBruch(`die Welt-Membran (${tor.gestalt})`, err);
        }
        mesh.position.set(entry.position.x, entry.position.y - 0.5, entry.position.z);
        if (Number.isFinite(entry.rotationY) && entry.rotationY !== 0) mesh.rotation.y = entry.rotationY;
        if (Number.isFinite(entry.scale) && entry.scale !== 1) mesh.scale.setScalar(entry.scale);
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        // das Culling bleibt an: die Hülle der geteilten Geometrie trägt die Welle (`_membranGeometryFor`)
        mesh.userData.inventar = "portal-membran"; // Identitäts-Stempel (gate:asset-inventory-Familie)
        st.scene.add(mesh);
        // Bodennebel-Kasten am Tor-Fuß, wo das Gesetz des Tors Nebel trägt (mu.fog > 0): sein Bau bricht laut beim Namen
        // wie die Membran (K22). Reiner Render, nie Blocker (Hit-Tests sehen ihn nicht).
        let nebel = null;
        if (tor.mu && Number.isFinite(tor.mu.fog) && tor.mu.fog > 0) {
            try {
                const neb = this._nebelMaterialFor(tor, u);
                nebel = new THREE.Mesh(this._nebelGeometryFor(tor), neb.mat);
                nebel.position.copy(mesh.position);
                nebel.rotation.y = mesh.rotation.y;
                nebel.scale.copy(mesh.scale);
                nebel.castShadow = false;
                nebel.receiveShadow = false;
                // der Kasten verformt nichts: seine Hülle ist exakt, das Culling bleibt an
                nebel.visible = false; // der Tick weckt ihn nähe-aktiviert (act > 0.001)
                nebel.userData.inventar = "portal-nebel"; // Identitäts-Stempel
                st.scene.add(nebel);
            } catch (err) {
                throw this._stoffBruch(`der Portal-Nebel (${tor.gestalt})`, err);
            }
        }
        this._portalMembranes.set(entry.id, { entry, tor, mesh, nebel, u, armed: true, lastLz: null });
    }

    // Flügel drehen im Template-Raum VOR der Welt-Scale auf den gebackenen Geschlossen-Vertices:
    // M = EntryWorld · WorldScale · T(h)·R_y(±a)·T(−h); Vorzeichen = seite·sign(zf) (leafL −a · leafR +a,
    // hinten gespiegelt). Flügel-Marken je Eintrag EINMAL aus entry.instSlots, neu bei Slot-Wechsel; der Slot wird je
    // Tick frisch aus der Marke gelesen (das Verdichten der Gruppe zieht ihn um, `_archGroupFree`).
    _tickTorFluegel(rec, entry, act) {
        const slots = entry.instSlots;
        if (!Array.isArray(slots) || !slots.length) return;
        if (rec._fluegelSrc !== slots) {
            rec._fluegelSrc = slots;
            rec._fluegel = [];
            const groups = this.state.archInstanceGroups;
            if (groups) {
                for (const s of slots) {
                    const g = groups.get(s.key);
                    const t = s.tuer || (g && g.tuer);
                    if (g && t) rec._fluegel.push({ g, ref: s, tuer: t });
                }
            }
            // DORF-ERLEBNIS — Haus-Recs starten in der GEBACKENEN Offen-Pose
            // (rec._fluegelStart = Gesetz-Winkel): die Tür schliesst beim ersten
            // Fern-Tick WEICH statt zu springen. Tore (gebacken zu): Start 0.
            rec._fluegelWinkel = rec._fluegelStart || 0;
        }
        if (!rec._fluegel || !rec._fluegel.length) return;
        // ZENSUS 17.07. — der Öffnungswinkel ist das EINE porta-Gesetz
        // (TUER_GESETZ.offen; der TOR_FLUEGEL_OFFEN-Zwilling fiel 19.07.,
        // der Leser ist fail-closed).
        const ziel = act * AnazhRealm._tuerOffenRad();
        const alt = rec._fluegelWinkel || 0;
        const neu = alt + (ziel - alt) * 0.12;
        if (Math.abs(neu - alt) < 0.0005 && Math.abs(neu - ziel) < 0.001) return; // eingeschwungen
        rec._fluegelWinkel = neu;
        const T = THREE;
        const ew = this._archEntryWorldMatrix(entry, this._torTmpEw || (this._torTmpEw = new T.Matrix4()));
        const mA = this._torTmpA || (this._torTmpA = new T.Matrix4());
        const mB = this._torTmpB || (this._torTmpB = new T.Matrix4());
        for (const f of rec._fluegel) {
            const t = f.tuer;
            // Trägt der Flügel eine gebackene Offen-Pose (t.offen, fachwerk-Haustüren), dreht er RELATIV dazu:
            // fern um −offen zu, nah auf die Offen-Pose. porta-Tore (gebacken zu, kein offen) drehen absolut.
            const sign = (t.seite || 1) * (t.zf >= 0 ? 1 : -1);
            const gz = AnazhRealm._tuerOffenRad() || 1;
            const winkel = Number.isFinite(t.offen) && t.offen !== 0 ? (neu / gz - 1) * t.offen : sign * neu;
            // T(h)·R_y(winkel)·T(−h) — kompakt über drei Matrizen:
            mA.makeRotationY(winkel);
            mB.makeTranslation(t.hx || 0, 0, t.zf || 0);
            mB.multiply(mA); // T(h)·R
            mA.makeTranslation(-(t.hx || 0), 0, -(t.zf || 0));
            mB.multiply(mA); // T(h)·R·T(−h)
            // EntryWorld enthält bereits die Welt-Skala/Rotation des Eintrags;
            // die Flügel-Leaves tragen localMatrix = WorldScale — die steckt in
            // den Instanz-Matrizen des Erst-Baus. Wir komponieren neu:
            mA.multiplyMatrices(ew, this._foundryWorldScaleMatrix(rec.tor.gestalt));
            mA.multiply(mB);
            // DIE FLÜGEL-INSTANZ (1310-4): zeichnet der Flügel die Gestalt eines anderen, setzt seine Basis sie an ihren Platz
            if (t.basis) mA.multiply(t.basis);
            if (!(f.ref.slot >= 0)) continue; // die Marke ist frei (Rebuild): der nächste Slot-Wechsel sammelt neu
            f.g.mesh.setMatrixAt(f.ref.slot, mA);
            f.g.mesh.instanceMatrix.needsUpdate = true;
            f.g.mesh.boundingSphere = null;
        }
    }

    // ═══ KAMIN-RAUCH ═══
    // Quellen aus Settlement-Einträgen mit rauchQuelle; Lab-Partikel (matte Box) wenn THREE+scene da,
    // sonst Quellen-Liste + einmaliger Log/Flugschreiber-Stempel. Invariante: Rauch ⟺ chimney.
    // Haus-Türen: _tickHausTueren dreht nahe Häuser (< 40 m) durch DENSELBEN _tickTorFluegel.
    _updateDorfRauch(_dt) {
        // RAUCH_VIS.host = "box-lambert" — Feel .125; Box+Lambert via RAUCH_GESETZ (sprites = Redesign).
        const st = this.state;
        if (!st) return;
        let dr = st.dorfRauch;
        if (!dr || typeof dr !== "object") {
            dr = st.dorfRauch = { quellen: [], teilchen: [] };
        }
        if (!Array.isArray(dr.quellen)) dr.quellen = [];
        if (!Array.isArray(dr.teilchen)) dr.teilchen = [];
        // Quellen neu aus Architectures mit rauchQuelle (world tip = origin + φ-rotate).
        const quellen = [];
        // die Kamine aus dem Verzeichnis (`_blockerMit("rauch")`, in der Ordnung des Bestands) — vorher je Frame jeder Eintrag
        const archs = Array.isArray(st.architectures) ? this._blockerMit("rauch") : null;
        if (archs) {
            for (let i = 0; i < archs.length; i++) {
                const e = archs[i];
                if (!e || !e.position) continue;
                const tip =
                    (e.userData && e.userData.rauchQuelle) ||
                    (e.chimney && Number.isFinite(e.chimney.x) ? e.chimney : null);
                if (!tip || !Number.isFinite(tip.x) || !Number.isFinite(tip.y) || !Number.isFinite(tip.z)) continue;
                const phi = Number.isFinite(e.rotationY) ? e.rotationY : 0;
                const c = Math.cos(phi);
                const s = Math.sin(phi);
                const ox = e.position.x || 0;
                const oz = e.position.z || 0;
                // Mesh-Fuß = position.y − 0.5 (spawnArchitecture-Kalibrierung); Lab y=0.
                const oy = (Number.isFinite(e.position.y) ? e.position.y : 0) - 0.5;
                quellen.push({
                    id: e.id,
                    x: ox + tip.x * c + tip.z * s,
                    y: oy + tip.y,
                    z: oz - tip.x * s + tip.z * c,
                });
            }
        }
        dr.quellen = quellen;
        if (quellen.length && !this._dorfRauchLogged) {
            this._dorfRauchLogged = true;
            try {
                this.log(`KAMIN-RAUCH: ${quellen.length} Quelle(n) live (chimney→rauchQuelle)`, "INFO");
            } catch (_e) {
                /* log optional */
            }
            try {
                const fr = st.flightRecorder;
                if (fr && typeof fr === "object") {
                    fr.rauchQuellen = quellen.length;
                    fr.rauchStamp = Date.now();
                }
            } catch (_e2) {
                /* flight recorder optional */
            }
        }
        const scene = st.scene;
        if (typeof THREE === "undefined" || !scene) {
            // Residual renderer: Quellen stehen; kein Mesh-Pfad (headless / no THREE).
            dr.teilchen.length = 0;
            return;
        }
        // Das Rauch-Gesetz wohnt im fachwerk-Gesetzbuch (EINE Quelle für Lab
        // und Welt) — fail-closed wie jeder Kern-Leser, kein Literal-Zwilling.
        const G =
            AnazhRealm.Gesetz("fachwerk:RAUCH_GESETZ", null) || AnazhRealm._kernPflichtBruch("fachwerk:RAUCH_GESETZ");
        // Lab-Feel: pro Frame, nicht dt-skaliert (Parity worlds/fachwerk frame). Ein Teilchen ist Daten (Lage, Größe,
        // Deckkraft); ohne Quelle entsteht keins, die lebenden steigen und vergehen weiter.
        if (quellen.length && dr.teilchen.length < G.maxTeilchen && Math.random() < G.spawnChance) {
            const qq = quellen[(Math.random() * quellen.length) | 0];
            dr.teilchen.push({
                x: qq.x,
                y: qq.y,
                z: qq.z,
                s: 1,
                vy: G.vyBase + Math.random() * G.vyRange,
                dx: (Math.random() - 0.5) * G.dxSpread,
                a: G.a0,
            });
        }
        for (let k = dr.teilchen.length - 1; k >= 0; k--) {
            const T2 = dr.teilchen[k];
            T2.y += T2.vy;
            T2.x += T2.dx;
            T2.a -= G.fade;
            T2.s *= G.scaleMul;
            if (T2.a <= G.aKill) dr.teilchen.splice(k, 1);
        }
        this._dorfRauchZeichnen(G, dr.teilchen);
    }

    // DER RAUCH IST EIN SATZ (Welle 6): jedes Teilchen war ein eigenes Mesh mit eigenem Stoff (die Deckkraft je Kiste) —
    // ein GPU-Befehl je Teilchen (Mess-Wiese: dorf-rauch 5 Befehle, das Gesetz trägt bis maxTeilchen 26), dazu je Teilchen
    // Geometrie und Stoff neu und wieder entsorgt. Jetzt: EINE InstancedMesh (die matte Kiste des Labors, RAUCH_VIS
    // "box-lambert", in der Welt rau-Standard — r184-Lambert liest scene.environment nie diffus), die Deckkraft je
    // Instanz als Attribut. Gleichfarbige Teilchen mischen ohne Tiefen-Schreiben unabhängig von der Reihenfolge (über
    // a₁, a₂ symmetrisch): das Bild der von fern nach nah sortierten Einzel-Kisten, ohne Sortierung.
    _dorfRauchZeichnen(G, teilchen) {
        const st = this.state;
        let R = st.dorfRauchSatz;
        if (!R && !teilchen.length) return; // kein Rauch, kein Mesh
        if (!R || R.cap < G.maxTeilchen || R.size !== G.size) {
            if (R) {
                if (R.mesh.parent) R.mesh.parent.remove(R.mesh);
                this._instanzAbschied(R.mesh); // die Instanz-Puffer verlassen die GPU (W6, r184s Register)
                R.geo.dispose();
                R.mat.dispose();
            }
            const cap = G.maxTeilchen;
            const geo = new THREE.BoxGeometry(G.size, G.size, G.size);
            const alpha = new THREE.InstancedBufferAttribute(new Float32Array(cap), 1);
            geo.setAttribute("aRauchDeck", alpha);
            const mat = new THREE.MeshStandardNodeMaterial({
                color: G.color,
                transparent: true,
                depthWrite: false,
                roughness: 1,
                metalness: 0,
            });
            mat.opacityNode = THREE.TSL.attribute("aRauchDeck", "float");
            this._leuchtStoff(mat, null); // der Rauch streut das Licht des Feuers (K11, der Licht-Pool)
            const mesh = AnazhRealm._instanzMesh(geo, mat, cap);
            mesh.name = "dorf-rauch";
            mesh.userData.inventar = "dorf-rauch"; // Identitäts-Stempel (gate:asset-inventory: Welt-Substanz)
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            AnazhRealm._instanzZahl(mesh, 0);
            st.scene.add(mesh);
            R = st.dorfRauchSatz = { mesh, geo, mat, alpha, cap, size: G.size, m: new THREE.Matrix4() };
        }
        const n = Math.min(teilchen.length, R.cap);
        const e = R.m.elements;
        for (let k = 0; k < n; k++) {
            const t = teilchen[k];
            R.m.makeScale(t.s, t.s, t.s);
            e[12] = t.x;
            e[13] = t.y;
            e[14] = t.z;
            R.mesh.setMatrixAt(k, R.m);
            R.alpha.array[k] = t.a;
        }
        AnazhRealm._instanzZahl(R.mesh, n);
        if (n > 0) {
            R.mesh.instanceMatrix.needsUpdate = true;
            R.alpha.needsUpdate = true;
            R.mesh.boundingSphere = null; // die Teilchen steigen: die Hülle folgt (three cullt die Wolke als Ganzes)
        }
    }

    _tickHausTueren(currentTime) {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm || !Array.isArray(st.architectures)) return;
        // `currentTime` sind SEKUNDEN (der Loop: `t / 1000`) — der Scan jede Sekunde. Bis 0710-11 stand hier `> 1000`: die
        // Liste baute sich nur alle 1 000 s neu, ein Haus, das danach in die Nähe kam oder beim Scan noch kein Mesh trug, öffnete
        // seine Tür bis zu ~17 min nicht (gate:brennglas-takt (H)).
        if (!this._hausTuerScanT || currentTime - this._hausTuerScanT > 1) {
            this._hausTuerScanT = currentTime; // Instanz-Felder (die _editSaveTimer-Klasse: nicht serialisiert)
            const nah = [];
            const p = pm.position;
            // die Plätze um den Spieler (`_blockerUmPlatz`, in der Ordnung des Bestands) — vorher jeder Eintrag je Scan
            const kand = this._hausTuerKand || (this._hausTuerKand = []);
            kand.length = 0;
            this._blockerUmPlatz(p.x, p.z, 40 + 1e-6, kand);
            for (const e of kand) {
                if (!e || !e.tuer || !e.position || !e.instSlots) continue;
                const dx = e.position.x - p.x;
                const dz = e.position.z - p.z;
                if (dx * dx + dz * dz < 1600) nah.push(e); // 40 m
            }
            this._hausTuerNah = nah;
        }
        const nah = this._hausTuerNah;
        if (!nah || !nah.length) return;
        const gz = AnazhRealm._tuerOffenRad();
        for (const e of nah) {
            if (!e.instSlots) continue; // zwischenzeitlich geculled
            const d = Math.hypot(e.position.x - pm.position.x, e.position.z - pm.position.z);
            // Reichweite = halbe Kern-Diagonale + Schwelle: die Tür beginnt sich
            // ~5 m vor der Wand zu öffnen und steht offen, wenn man sie erreicht.
            const reach = Math.max(e.tuer.W || 6, e.tuer.D || 6) * 0.5 + 1.2;
            const act = Math.max(0, Math.min(1, 1 - (d - reach) / 5));
            const rec =
                e._tuerRec ||
                (e._tuerRec = {
                    tor: { gestalt: this._foundryPresetForEntry(e) || "haus" },
                    _fluegelStart: gz, // Start = gebackene Offen-Pose (weiches Erst-Schliessen)
                });
            this._tickTorFluegel(rec, e, act);
        }
    }

    // Konsumable aktivieren = Boost mit Source `consume:<name>` (Dedupe: Doppelklick verlängert statt zu
    // duplizieren). Zuerst Bauplan mit role consumable (Compound-Tags), dann state.consumables-Tabelle.
    activateConsumable(name) {
        // Bauplan mit role:"consumable": tagBonus aus Compound-Tags × consumableMeta.scale (Default 0.2) —
        // Tags reichen bis 3, Boost-Deltas sollen 0..0.5 bleiben (spürbar, nicht dominant).
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (bp && bp.role === "consumable") {
            // Welle 11 ext. — consumableMeta ist optional: eine emergente
            // Nahrung (lebendig+weich) oder ein alchemy-Domain-Bauplan trägt
            // keine Meta, ist aber dennoch essbar — Defaults greifen.
            const meta = bp.consumableMeta || {};
            const tags = this.computeCompoundTags(bp);
            const scale = meta.scale || 0.2;
            // V8.39 — Qualität skaliert die Trank-Stärke: ein grob gebrautes
            // Konsumable wirkt halb, ein fein gefertigtes voll.
            const qMul = 0.5 + 0.5 * this.computeBlueprintQuality(bp) * this._blueprintRoleFit(bp, "consumable");
            const tagBonus = {};
            for (const tag of Object.keys(tags)) {
                const v = tags[tag] * scale * qMul;
                if (Math.abs(v) > 0.001) tagBonus[tag] = Math.max(-1, Math.min(1, v));
            }
            if (Object.keys(tagBonus).length === 0) {
                return { ok: false, reason: "blueprint_has_no_tags" };
            }
            const ok = this.addPlayerBoost({
                source: `consume:${name}`,
                tagDelta: tagBonus,
                durationSeconds: meta.durationSeconds || 30,
                label: meta.label || bp.label || name,
            });
            return { ok };
        }
        // Pfad 2: alte Tabelle (state.consumables) — DSL-direktes Konsumabel
        const c = this.state.consumables && this.state.consumables[name];
        if (!c) return { ok: false, reason: "not_found" };
        const ok = this.addPlayerBoost({
            source: `consume:${c.name}`,
            tagDelta: c.tagBonus,
            durationSeconds: c.durationSeconds,
            label: c.label,
        });
        return { ok };
    }

    // DSL-Pfad für eigene Seelen: validateBlueprintParts (Shape-Whitelist, Cap 32 parts, Material muss
    // existieren, Position/Size/Rotation geclampt). Cap 16 Custom-Seelen/Welt; Built-in-Namen geschützt.
    createOrUpdateSoulFromDsl(name, bodyParts) {
        if (typeof name !== "string" || name.length === 0 || name.length > 40) {
            return { ok: false, reason: "invalid_name" };
        }
        const safe = name.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
        if (!safe) return { ok: false, reason: "invalid_name_after_sanitize" };
        if (this.playerSoulDefs[safe]) return { ok: false, reason: "builtin_protected" };
        if (!this.state.customSouls) this.state.customSouls = {};
        const existing = this.state.customSouls[safe];
        const count = Object.keys(this.state.customSouls).length;
        if (!existing && count >= 16) return { ok: false, reason: "too_many_souls" };
        this.state.customSouls[safe] = {
            name: safe,
            label: safe.replace(/_/g, " "),
            bodyParts: bodyParts,
            createdAt: performance.now() / 1000,
        };
        return { ok: true, name: safe };
    }
}

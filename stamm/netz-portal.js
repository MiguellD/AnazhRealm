//# allFunctionsCalledOnLoad
class AnazhRealm_netz_portal {
    // ===== ATLAS · Netz/portal — Portal-Eintritt · Ko-Präsenz · Dwelling · Portal-Server =====
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
    // Die echte null-origin-Isolation beweist die Sonde smoke-sandbox (git-Archiv) im Browser.
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
            // DER EINE ÜBERGABE-KANAL: die Hülle eines Studios reicht sein Werk (Art · Rezept · Same · Prägung) an die Welt. Nur
            // TRUSTED Welten; fail-closed am EINEN Empfänger _studioUebergabeEmpfang (Kern-Klemme · Taille-Cap · must-ignore).
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
        // WAS DER SPIELER TRÄGT, REIST MIT (tore.K3): Leib (Seele · Teile einer eigenen Seele · Prägung des Mensch-Rezepts),
        // Inventar (Slots · Hotbar), Gehaltenes (Haupt-, Neben-Hand, Rüstung) und das Werk, auf dem er sitzt (Reittier oder
        // Fahrzeug, `mountedArch`: Art · Gestalt aus Bauplan, Saat, Maß, Tönung und Prägung · die Glut, sein einziger
        // Lebenswert · die Bindung) und seine Werke (der EINE Prägungs-Speicher je Rezept, in den jedes Studio sein Werk
        // reicht, `_praegungSetzen` — Rezept · Regler · Same `__gestalt`, der Bau-Hash des Werks: Studio → Welt → Studio
        // reist es mit) — die Bytes des Zustands, nie eine Auswahl; die Hülle drüben hält sie
        // (`AnazhHuelle.reisender`), gate:portal-konformanz K8 vergleicht vor · drüben · nach der Heimkehr.
        const ov = (this.state.workshop && this.state.workshop.studioOv) || {};
        const ritt = (this.state.architectures || []).find((e) => e.id === player.mountedArch);
        const rittBp = ritt && this.state.blueprints[ritt.type];
        payload.gepaeck = {
            leib: {
                seele: soul.name,
                teile: (custom && custom.bodyParts) || null,
                praegung: ov[AnazhRealm.KOERPER_HOST_RECIPE] || null,
            },
            inventar: { slots: player.inventory || [], hotbar: this.state.hotbar || [] },
            wield: player.equipped || { held: null, offhand: null, armor: null },
            reittier: ritt
                ? {
                      art: ritt.type,
                      // Teile und Verbindungen des Bauplans, Saat, Maß, Tönung (H, S, V), Prägung
                      gestalt: [
                          rittBp && rittBp.parts,
                          rittBp && rittBp.connections,
                          ritt.seed,
                          ritt.scale,
                          ritt.tintH,
                          ritt.tintS,
                          ritt.tintV,
                          ritt.studioOv,
                      ],
                      leben: ritt.heatBuildup || 0,
                      bindung: ritt.id,
                  }
                : null,
            werk: ov,
        };
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
        // Signierte Welt-Adresse → WEB-Portal: Bestätigungs-Karte, dann `_weltBeitritt`. Ungültige Adresse
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
            AnazhRealm._datum`Du tratst zum ersten Mal durch das Tor „${worldLabel}".`
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
    // (4) `_weltBeitritt` mit der gesiebten Adresse.
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
        // Der Beitritt (W11.5): broker + roomId → world-snapshot.
        this.log(`Reise zur Welt „${addr.label}" (${status}) — ${addr.broker} → ${addr.roomId}`, "INFO");
        // Der Beitritt geht durch DIE TÜR (`_importGuestWorld` → `_weltBetreten`): die alte Welt hält ihr Zeugnis fest und
        // sichert sich, die fremde wird unsere lokale Welt (role:"guest", kein Portal-Overlay), Sperre und Wechsel. Bis 10.10.
        // lud das Adress-Portal nie neu: der nächste saveState setzte den Aktiv-Zeiger auf die alte Welt zurück, und der
        // Beitritt verschwand still (Gegenprüfung Runde 3).
        return this._weltBeitritt(addr, {
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
        // sonst liefe der Avatar nach der Heimkehr von selbst weiter (die Tasten-Wand).
        this._alleTastenLos();
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
        this.journalAppend("portal", AnazhRealm._datum(text.slice(0, 160)), {
            world: po.label || po.world || "Portal-Welt",
        });
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
        this.journalAppendOnce(`portalDwell:${worldId}`, "portal", AnazhRealm._datum`Du wohnst jetzt in „${label}".`);
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

    // ═══ DER EINE ÜBERGABE-KANAL (pipeline.K1) ═══
    // {type:"uebergabe", kind, preset, seed, ov} — das Werk eines Studios, gesendet von der Hülle (`werk`). DIESER Prüfer klemmt
    // es fail-closed am GELADENEN Kern (index.html lädt jeden): die Art trägt Regler-Zeilen (PARAMS_BY_KIND) · das Rezept ist
    // eines dieser Art · jede Zahl auf ihre Zeile geklemmt · eine Wahl nur, wo das Rezept sie trägt (fx.gestalt) und die Tafel
    // des Kerns sie kennt · ein Charakter nur als Zeile seiner Tafel · der Same ganzzahlig (`__gestalt`, Leser `_foundryGestaltFor`) · Taille-Cap · must-ignore. Ohne Art
    // (Restore) gilt die Art des Rezepts. Rückgabe die Prägung oder null; auch Restore und Mitspieler laufen hier durch.
    _studioWerkPruefen(kind, preset, ov, seed) {
        try {
            if (JSON.stringify({ kind, preset, ov, seed }).length > AnazhRealm.TAILLE_UNKNOWN_FIELD_MAX) return null;
        } catch (_e) {
            return null;
        }
        if (typeof preset !== "string" || (kind != null && typeof kind !== "string")) return null;
        const W = typeof window !== "undefined" ? window : globalThis;
        let kern = null;
        let rec = null;
        let zeilen = null;
        for (const ns of Object.values(AnazhRealm.GESETZ_KERNE)) {
            const k = W[ns];
            const buch = k && (k.PHYTO_PRESETS || k.PRESETS);
            const r = buch && Object.prototype.hasOwnProperty.call(buch, preset) ? buch[preset] : null;
            // die Pflanzen-Tafeln trägt foundry-core top-level (var), nicht im Terrain-Namensraum — gelesen ohne Kern-Edit
            // (der Platten-Stempel hasht die Kern-Quelle)
            const tafeln = k && (k.PHYTO_PRESETS ? W.PARAMS_BY_KIND : k.PARAMS_BY_KIND);
            if (r && (kind == null || r.kind === kind) && tafeln && Array.isArray(tafeln[r.kind])) {
                kern = k;
                rec = r;
                zeilen = tafeln[r.kind];
                break;
            }
        }
        if (!kern) return null; // Art ohne Regler-Zeilen, fremdes Rezept oder kalter Kern
        const roh = ov && typeof ov === "object" && !Array.isArray(ov) ? ov : {};
        const out = this._reglerKlemme(zeilen, roh).werte; // die EINE Klemme des Vertrags; was keine Zeile trägt, fällt hier (must-ignore)
        // Die Wahlen des Rezepts (der Körper: Haut, Haar, Kleid) gegen die Tafeln des Kerns; ein erfundener Haar-Stil fiele in
        // haarStreu still auf "mittel" — er kommt gar nicht erst hinein.
        const tafel = (t, v) => !!(t && Object.prototype.hasOwnProperty.call(t, v));
        const gilt = (k, v) => {
            if (!/^[a-z0-9_-]{1,32}$/.test(v)) return false;
            if (k === "skinTone") return tafel(kern.SKIN_TONES, v);
            if (k === "hairColor") return tafel(kern.HAIR_COLORS, v);
            if (/Color$/.test(k)) return tafel(kern.CLOTH_COLORS, v);
            if (k !== "hairStyle") return true;
            if (typeof kern.haarStreu !== "function") return false;
            try {
                const streu = (st) => JSON.stringify(kern.haarStreu({ hairStyle: st, hairLen: 1, hairVol: 1 }));
                return v === "mittel" || streu(v) !== streu("mittel");
            } catch (_e) {
                return false;
            }
        };
        const wahlen = rec.fx && rec.fx.gestalt && typeof rec.fx.gestalt === "object" ? rec.fx.gestalt : {};
        for (const k of Object.keys(wahlen)) if (typeof roh[k] === "string" && gilt(k, roh[k])) out[k] = roh[k];
        // Der Charakter der Art (KIND_CHARAKTER: die Tradition der Klinge, die Kultur des Wagens) reist, wenn das Werk eine Zeile
        // seiner Tafel trägt — dieselbe Prägung, die das präge-Verb der Welt schreibt.
        const achse = AnazhRealm.KIND_CHARAKTER[rec.kind];
        const tab = achse && W[achse.ns] ? W[achse.ns][achse.tabelle] : null;
        for (const name of tab ? Object.keys(tab) : []) {
            const zeile = achse.ov(name, tab);
            const ks = Object.keys(zeile);
            if (ks.length && ks.every((k) => JSON.stringify(roh[k]) === JSON.stringify(zeile[k]))) {
                Object.assign(out, zeile);
                break;
            }
        }
        if (Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff) out.__gestalt = seed;
        return out;
    }
    // Der Empfang schreibt das geprüfte Werk in den EINEN Prägungs-Speicher ws.studioOv[Rezept]. Die lebenden Leser folgen
    // sofort: der Avatar gießt neu (er liest die Prägung des Mensch-Rezepts, `_koerperStudioDials`), der Klang der Welt spielt das
    // Genre (`_klangStudioPreset`); jede andere Art trägt das nächste gesetzte Werk (`_studioStampFor`) bzw. der nächste Spawn
    // ihrer Gattung (`_tetrapodaStudioDials`). gate:studio-uebergabe
    _studioUebergabeEmpfang(msg) {
        if (!msg || typeof msg !== "object" || Array.isArray(msg) || typeof msg.kind !== "string") return false;
        const praegung = this._studioWerkPruefen(msg.kind, msg.preset, msg.ov, msg.seed);
        if (!praegung) return false;
        this._praegungSetzen(msg.kind, msg.preset, praegung);
        this.log(`Studio-Übergabe: das Werk „${msg.preset}" (${msg.kind}) steht in der Prägung der Welt.`, "INFO");
        return true;
    }

    // DER EINE SCHREIBER DER PRÄGUNG eines Rezepts (ws.studioOv[Rezept]) samt seinen lebenden Lesern: der Avatar gießt neu (die
    // Prägung des Mensch-Rezepts), der Klang der Welt spielt das Genre. Rufer: die Übergabe eines Studios (`_studioUebergabeEmpfang`,
    // must-ignore geprüft) und das Werk einer Prägungs-Art aus einem Programm (`_dslSpawnStudioItems`, fail-closed geklemmt, KI K2).
    _praegungSetzen(kind, preset, praegung) {
        this._ensureWorkshopState().studioOv[preset] = praegung;
        if (preset === AnazhRealm.KOERPER_HOST_RECIPE) {
            try {
                this.applyPlayerSoul((this.state.player && this.state.player.soul) || "human");
            } catch (_e) {
                this._stoffBruch("der Avatar (Prägung)", _e);
            }
            // die Sicht folgt dem State sofort: der mensch-Eintrag des Ich-Selects trägt „✦ Studio-Gestalt"
            if (typeof this._refreshSoulSelect === "function") this._refreshSoulSelect();
        } else if (kind === "klang") this.state.klangPreset = preset;
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
                AnazhRealm._datum`Eine fremde Fähigkeit wurde Teil deiner Welt: „${key}" (von „${prop.fromLabel}").`,
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
            AnazhRealm._datum`Du tratst zum ersten Mal durch das Tor „${inv.label}".`
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
}
_stammZonen(AnazhRealm, [AnazhRealm_netz_portal]);

// ===== ATLAS · Netz/portal — Außen-Konstanten =====
// Welt-Portal: die same-origin Skelett-Welt-Seite im sandboxed iframe. portalMeta.world zeigt
// hierauf; _sanitizePortalMeta erlaubt nur worlds/-Pfade — kein fremdes Origin, CSP frame-src 'self'.
AnazhRealm.PORTAL_SKELETON_WORLD = "worlds/skeleton/index.html";
// W12 — E-Reichweite, um ein Portal zu betreten. Etwas großzügiger als
// MOUNT_RANGE_M: ein Tor-Ring ist groß, der Spieler steht davor.
AnazhRealm.PORTAL_REACH_M = 4.5;
// W17 Phase B-Relay — der subworld-net-Kanal trägt den `WebSocket`-Verkehr
// einer Multiplayer-Sub-Welt übers Mesh. Ein Größen-Deckel je Nachricht +
// ein Rate-Limit je Sekunde schützen den Kanal vor einer flutenden Sub-Welt.
AnazhRealm.SUBWORLD_NET_MAX_BYTES = 16384; // 16 KiB je ws-send (Relay-.io-Nachrichten sind winzig)
AnazhRealm.SUBWORLD_NET_RATE_WINDOW_MS = 1000;
AnazhRealm.SUBWORLD_NET_RATE_MAX = 120; // ~2 Nachrichten je 60-fps-Frame mit Reserve
// Portal-Rückkanal (_portalReceiveEvent: Sub-Welt → Heimat-Journal) deckelt Ereignisse je Sekunde —
// sonst verdrängt eine vendorte Welt das 200-Eintrag-Journal in Sekunden. 8/s trägt legitime Bursts.
AnazhRealm.PORTAL_EVENT_RATE_WINDOW_MS = 1000;
AnazhRealm.PORTAL_EVENT_RATE_MAX = 8;
// Der EINE Token-Bucket je Welt am Kanal-EINGANG: deckelt die GESAMT-Rate aller Sub→Heim-Nachrichten
// (auch ready/exit/manifest — gespamtes `ready` löste je Frame _portalReceiveManifest +
// _portalSendEnter aus). 200/s liegt über der legitimen Summe (ws-send 120 + event 8 + Handshakes).
// Transport-seitig → eine verworfene Nachricht ändert keinen State (Determinismus unberührt).
AnazhRealm.PORTAL_CHANNEL_RATE_WINDOW_MS = 1000;
AnazhRealm.PORTAL_CHANNEL_RATE_MAX = 200;
// Ko-Präsenz-Injektion: AnazhRealm ist die Multiplayer-Schicht für Welten ohne eigene — das Mesh
// trägt Posen (~10 Hz), die Welt rendert Avatare. Sende-Wand (local-pose aus dem iframe) +
// Empfänger-Wand (subworld-pose je Peer, _cpRate) + Abwesenheits-Timeout (Stille = peer-leave).
AnazhRealm.SUBWORLD_POSE_RATE_WINDOW_MS = 1000;
AnazhRealm.SUBWORLD_POSE_RATE_MAX = 15;
AnazhRealm.SUBWORLD_POSE_TIMEOUT_MS = 6000;
// Input-Brücke: eine Welt, die im ready-Handshake `inputActions` deklariert, bekommt die Tasten als
// SEMANTISCHE Aktionen ({type:"input", action, down} — Daten, nie Key-Codes/Events). Vokabular
// eingefroren + winzig; die Welt wählt daraus, erfindet nie eigene. Die Karte spiegelt die
// Heimat-Controls (WASD/Pfeile · Leertaste · E).
AnazhRealm.PORTAL_INPUT_ACTIONS = Object.freeze(["forward", "back", "left", "right", "jump", "use"]);
AnazhRealm.PORTAL_INPUT_KEYMAP = Object.freeze({
    KeyW: "forward",
    ArrowUp: "forward",
    KeyS: "back",
    ArrowDown: "back",
    KeyA: "left",
    ArrowLeft: "left",
    KeyD: "right",
    ArrowRight: "right",
    Space: "jump",
    KeyE: "use",
});
// Persistenz-Slot einer Fremd-Welt: Zustand als {type:"state", data} (String); die Heimat hält ihn im
// GLOBALEN localStorage (anazh.portalState — nie im Welt-Snapshot, er gehört der Fremd-Welt) und
// reicht ihn beim nächsten Betreten als `restoreState` zurück. Größen- + Welt-Anzahl-Deckel
// (älteste fällt).
AnazhRealm.PORTAL_STATE_MAX_BYTES = 8192;
AnazhRealm.PORTAL_STATE_MAX_WORLDS = 16;
// R6 (V18.152) — die Quarantäne-Queue der gereichten Fähigkeiten (bounded;
// dedupe per Name — ein erneuter Vorschlag refresht, flutet nie).
AnazhRealm.CAPABILITY_PROPOSAL_MAX = 16;

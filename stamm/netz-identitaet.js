class AnazhRealm_netz_identitaet {
    // ===== ATLAS · Netz/identitaet — Vibe-Pass · Signaturen · Bibliothek · Regionen · Pins und Hallen · Bann =====
    // ### Vibe-Pass: die souveräne Avatar-Identität ###
    // Ed25519-Schlüsselpaar, lokal beim ersten Erwachen erzeugt: der öffentliche Schlüssel IST der Avatar,
    // der private signiert Werke. crypto.subtle trägt Ed25519 nativ (kein Vendoring); nur im Secure
    // Context (https/localhost) — sonst degradieren die Methoden anmutig.

    _vibeBytesToHex(bytes) {
        let s = "";
        for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
        return s;
    }

    _vibeHexToBytes(hex) {
        const clean = String(hex).replace(/[^0-9a-fA-F]/g, "");
        const out = new Uint8Array(clean.length >> 1);
        for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
        return out;
    }

    _vibeB64uToBytes(b64u) {
        let s = String(b64u).replace(/-/g, "+").replace(/_/g, "/");
        while (s.length % 4) s += "=";
        const bin = atob(s);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return out;
    }

    _vibeBytesToB64u(bytes) {
        let bin = "";
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    // Die sichtbare Kurzform des Schlüssels — die ersten 16 Hex-Zeichen in
    // Vierergruppen. Genug zum Wiedererkennen, kurz genug fürs Drawer.
    _vibeFingerprint(pubHex) {
        if (typeof pubHex !== "string" || pubHex.length < 16) return "—";
        return pubHex
            .slice(0, 16)
            .replace(/(.{4})/g, "$1 ")
            .trim();
    }

    // Trennungs-Beweis des innersten Rings (AnazhRealm.SOVEREIGN_STATE: Identität + Signatur-Autorität):
    // NIE in einem Welt-Snapshot, Portal-Payload oder über P2P. Reine Sonde (mutiert nichts), liefert eine
    // flache Befund-Struktur.
    _sovereignStateAudit() {
        const S = AnazhRealm.SOVEREIGN_STATE;
        const out = { snapshotClean: true, payloadClean: true, leaks: [] };
        const safeJson = (obj) => {
            try {
                return JSON.stringify(obj);
            } catch (_e) {
                return "";
            }
        };
        // (1) Der Welt-Snapshot trägt KEINEN souveränen state-Slot (fixer
        // Key-Satz in buildStateSnapshot) UND tief KEIN privates Schlüssel-Feld.
        let snap = null;
        try {
            snap = this.buildStateSnapshot();
        } catch (_e) {
            snap = null;
        }
        if (snap && typeof snap === "object") {
            for (const k of S.excludedStateKeys) {
                if (Object.prototype.hasOwnProperty.call(snap, k)) {
                    out.snapshotClean = false;
                    out.leaks.push("snapshot:" + k);
                }
            }
            const json = safeJson(snap);
            for (const f of S.privateFields) {
                if (json.indexOf('"' + f + '"') >= 0) {
                    out.snapshotClean = false;
                    out.leaks.push("snapshot-deep:" + f);
                }
            }
            for (const sk of S.privateStorageKeys) {
                if (json.indexOf(sk) >= 0) {
                    out.snapshotClean = false;
                    out.leaks.push("snapshot:" + sk);
                }
            }
        }
        // (2) Der Portal-Payload (Sub→Welt-Identität) trägt nur die
        // ÖFFENTLICHE Identität (vibePassId/fingerprint), nie ein privates Feld.
        let payload = null;
        try {
            payload = this._portalEnterPayload();
        } catch (_e) {
            payload = null;
        }
        if (payload && typeof payload === "object") {
            const pj = safeJson(payload);
            for (const f of S.privateFields) {
                if (pj.indexOf('"' + f + '"') >= 0) {
                    out.payloadClean = false;
                    out.leaks.push("payload:" + f);
                }
            }
            for (const sk of S.privateStorageKeys) {
                if (pj.indexOf(sk) >= 0) {
                    out.payloadClean = false;
                    out.leaks.push("payload:" + sk);
                }
            }
        }
        out.ok = out.snapshotClean && out.payloadClean && out.leaks.length === 0;
        return out;
    }

    // G8 R2 (Robustheits-Bogen, M3) — ist `op` eine souveräne Aktion (berührt
    // den innersten Ring)? Der EINE Leser von SOVEREIGN_ACTIONS.
    _isSovereignAction(op) {
        return AnazhRealm.SOVEREIGN_ACTIONS.includes(op);
    }

    // Die EINE Host-gerenderte souveräne Geste: Akte am innersten Ring (Signieren, Identität wechseln)
    // laufen NUR hier — außerhalb jedes iframes, Klartext WAS · WERT · an WEN, JEDES MAL frisch (kein
    // „merken"). Der postMessage-Pfad erreicht sie nie; sie schützt vor der gefälschten Geste, nicht vor
    // getäuschter Absicht. `opts.skipConfirm` nur für den Playtest.
    _sovereignGesture(action, detail, opts) {
        opts = opts || {};
        // Eine unbekannte/nicht-souveräne Aktion wird VERWEIGERT (die Wand
        // lässt nur die eingefrorene Liste durch — kein Schmuggel).
        if (!this._isSovereignAction(action)) {
            if (typeof this.log === "function")
                this.log(`Souveräne Geste verweigert — unbekannte Aktion: ${action}`, "WARN");
            return false;
        }
        // Headless / Test / kein Host-Confirm verfügbar → der skipConfirm-Pfad
        // (derselbe Vertrag wie importVibePass: die Wand ist die Host-Geste,
        // nicht ein Zwang gegen den Eigentümer-Code).
        if (opts.skipConfirm || typeof window === "undefined" || typeof window.confirm !== "function") {
            return true;
        }
        const d = detail && typeof detail === "object" ? detail : {};
        const lines = [
            "Souveräne Handlung — sie berührt deine Identität/Autorität:",
            "",
            `WAS:  ${d.what || action}`,
            `WERT: ${d.value || "—"}`,
            `WEM:  ${d.whom || "dir selbst"}`,
            "",
            "Diese Handlung kann KEINE Welt und KEIN Assistent für dich auslösen.",
            "Nur du, jetzt. Fortfahren?",
        ];
        return window.confirm(lines.join("\n")) === true;
    }

    // Antikörper-Archiv: die vier Angriffsklassen, je mit ihrer strukturellen Wand (dem lebenden Guard) +
    // ihrem Headless-Playtest-Korpus — ein Regress an einer alten Wand ist sofort rot.
    // Neuer Erreger → neuer Eintrag + neues Band.
    _robustnessCorpus() {
        return [
            {
                id: "R1-flut",
                mechanism: "M2-Dämpfung",
                guard: "_portalChannelAdmit",
                band: "checkBandG8R1DampedChannel",
                what: "eine flutende Welt drosselt sich selbst (Token-Bucket, Verwerfen statt Puffern)",
                live: typeof this._portalChannelAdmit === "function" && typeof this._p2pPeerRateAdmit === "function",
            },
            {
                id: "R2-souveraen",
                mechanism: "M3-Katalysator",
                guard: "_sovereignGesture",
                band: "checkBandG8R2SovereignWall",
                what: "ein souveräner Akt verlangt die Host-Geste (disjunkt von jedem Auto-Pool)",
                live: typeof this._sovereignGesture === "function" && Array.isArray(AnazhRealm.SOVEREIGN_ACTIONS),
            },
            {
                id: "R3-escape",
                mechanism: "M1-Lokalität",
                guard: "_portalSandboxAttr",
                band: "checkBandG8R3Locality",
                what: "eine sandboxed Welt läuft null-origin (kein Pfad zum innersten Ring)",
                live: typeof this._portalSandboxAttr === "function" && typeof this._localityAudit === "function",
            },
            {
                id: "R4-infektion",
                mechanism: "M4-Immunsystem",
                guard: "_artifactProvenanceTainted",
                band: "checkBandG8R4Immunity",
                what: "die Herkunft reist als Kette (sichtbar) + der Rückruf stößt sie aus (reversibel)",
                live: typeof this._artifactProvenanceTainted === "function" && typeof this.revokeKey === "function",
            },
        ];
    }

    // Der kanonische Identifier — dasselbe Format wie das Welt-Portal-Manifest
    // ("authorPubKey": "ed25519:...", Norm: docs/taille-spec.md).
    vibePassId() {
        const vp = this.state.vibePass;
        return vp && vp.ready && vp.publicKeyHex ? "ed25519:" + vp.publicKeyHex : null;
    }

    // Übernimmt ein privates JWK: importiert beide CryptoKeys, leitet Hex-Pubkey + Fingerprint ab.
    // Die await-Importe laufen VOR jeder vp.*-Zuweisung — schlägt einer fehl, bleibt der State unberührt.
    async _adoptVibePassJwk(privateKeyJwk, createdAt, fresh) {
        const privateKey = await crypto.subtle.importKey("jwk", privateKeyJwk, { name: "Ed25519" }, true, ["sign"]);
        const publicKey = await crypto.subtle.importKey(
            "jwk",
            { kty: "OKP", crv: "Ed25519", x: privateKeyJwk.x },
            { name: "Ed25519" },
            true,
            ["verify"]
        );
        const vp = this.state.vibePass;
        vp.privateKey = privateKey;
        vp.publicKey = publicKey;
        vp.publicKeyHex = this._vibeBytesToHex(this._vibeB64uToBytes(privateKeyJwk.x));
        vp.fingerprint = this._vibeFingerprint(vp.publicKeyHex);
        vp.createdAt = createdAt || Date.now();
        vp.freshlyCreated = !!fresh;
        vp._privateKeyJwk = privateKeyJwk;
        vp.ready = true;
    }

    // Baut das Sicherungs-Objekt — auch der Inhalt der localStorage-Persistenz.
    _vibePassExportObject() {
        const vp = this.state.vibePass;
        if (!vp || !vp.ready || !vp._privateKeyJwk) return null;
        return {
            schemaVersion: "vibepass-1",
            createdAt: vp.createdAt || Date.now(),
            publicKeyHex: vp.publicKeyHex,
            privateKeyJwk: vp._privateKeyJwk,
        };
    }

    _persistVibePass() {
        const obj = this._vibePassExportObject();
        if (!obj || typeof localStorage === "undefined") return;
        try {
            localStorage.setItem("anazh.vibePass", JSON.stringify(obj));
        } catch (e) {
            this.log(`Vibe-Pass speichern fehlgeschlagen: ${e && e.message}`, "ERROR");
        }
    }

    // Lädt den Vibe-Pass aus dem globalen localStorage oder erzeugt beim
    // allerersten Erwachen ein frisches Schlüsselpaar. Wirft nie — fehlt der
    // Secure Context, ruht die Identität (ready bleibt false).
    async _ensureVibePass() {
        const vp = this.state.vibePass;
        if (!vp) return;
        if (typeof crypto === "undefined" || !crypto.subtle) {
            this.log("Vibe-Pass ruht — kein Secure Context (crypto.subtle fehlt).", "WARN");
            this._renderVibePassUI();
            return;
        }
        let stored = null;
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.vibePass") : null;
            if (raw) stored = JSON.parse(raw);
        } catch {
            stored = null;
        }
        try {
            const jwk = stored && stored.privateKeyJwk;
            if (jwk && jwk.kty === "OKP" && jwk.crv === "Ed25519" && typeof jwk.d === "string") {
                await this._adoptVibePassJwk(jwk, stored.createdAt, false);
            } else {
                const pair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
                const freshJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
                await this._adoptVibePassJwk(freshJwk, Date.now(), true);
                this._persistVibePass();
                this.log(`Vibe-Pass erzeugt: ${this.vibePassId()}`, "INFO");
                this.journalAppendOnce(
                    "vibepass:genesis",
                    "ritual",
                    AnazhRealm._datum`Der Avatar empfing seinen Vibe-Pass — eine souveräne Identität, ein Schlüssel, der nur ihm gehört (${vp.fingerprint}).`,
                    { fingerprint: vp.fingerprint }
                );
            }
        } catch (e) {
            this.log(`Vibe-Pass-Initialisierung fehlgeschlagen: ${e && e.message}`, "ERROR");
        }
        this._renderVibePassUI();
    }

    // Signiert einen Text mit dem privaten Schlüssel → Signatur als Hex.
    // Phase 2 (Bauplan-Signaturen) baut hierauf. Liefert null, wenn der
    // Vibe-Pass nicht bereit ist.
    async _vibeSign(message) {
        const vp = this.state.vibePass;
        if (!vp || !vp.ready || !vp.privateKey || typeof crypto === "undefined" || !crypto.subtle) {
            return null;
        }
        try {
            const data = new TextEncoder().encode(String(message));
            const sig = await crypto.subtle.sign({ name: "Ed25519" }, vp.privateKey, data);
            return this._vibeBytesToHex(new Uint8Array(sig));
        } catch (e) {
            this.log(`Vibe-Pass-Signatur fehlgeschlagen: ${e && e.message}`, "ERROR");
            return null;
        }
    }

    // Prüft eine Signatur gegen einen ÖFFENTLICHEN Schlüssel (Hex). Verifiziert
    // damit jedes Autors Werk, nicht nur das eigene — Phase 3 baut hierauf.
    // Defensiv: ungültige Eingabe → false, nie ein Wurf.
    async _vibeVerify(message, signatureHex, publicKeyHex) {
        if (typeof crypto === "undefined" || !crypto.subtle) return false;
        if (typeof signatureHex !== "string" || typeof publicKeyHex !== "string") return false;
        if (!/^[0-9a-f]+$/i.test(signatureHex) || !/^[0-9a-f]{64}$/i.test(publicKeyHex)) return false;
        try {
            const publicKey = await crypto.subtle.importKey(
                "jwk",
                {
                    kty: "OKP",
                    crv: "Ed25519",
                    x: this._vibeBytesToB64u(this._vibeHexToBytes(publicKeyHex)),
                },
                { name: "Ed25519" },
                true,
                ["verify"]
            );
            const data = new TextEncoder().encode(String(message));
            return await crypto.subtle.verify({ name: "Ed25519" }, publicKey, this._vibeHexToBytes(signatureHex), data);
        } catch {
            return false;
        }
    }

    // Sichert den Vibe-Pass als Datei — die einzige Versicherung gegen den
    // Verlust der Identität (localStorage kann gelöscht werden). Liefert das
    // Sicherungs-Objekt auch zurück (für Tests + Diagnose).
    exportVibePass() {
        const obj = this._vibePassExportObject();
        if (!obj) {
            this.log("Vibe-Pass noch nicht bereit — kein Export.", "WARN");
            return null;
        }
        const tag = (this.state.vibePass.publicKeyHex || "pass").slice(0, 12);
        this.triggerStateDownload(obj, `anazh-vibe-pass-${tag}.json`);
        this.journalAppend("ritual", "Ich sicherte meinen Vibe-Pass — den Schlüssel meiner Identität.");
        return obj;
    }

    // Stellt einen gesicherten Vibe-Pass wieder her. Ersetzt die aktuelle
    // Identität — daher die Rückfrage (außer der Aufrufer setzt skipConfirm,
    // wie der Playtest; folgt dem {reload:false}-Muster der Welt-Methoden).
    async importVibePass(parsed, opts) {
        opts = opts || {};
        if (!parsed || typeof parsed !== "object") {
            return { ok: false, reason: "invalid" };
        }
        const jwk = parsed.privateKeyJwk;
        if (
            !jwk ||
            typeof jwk !== "object" ||
            jwk.kty !== "OKP" ||
            jwk.crv !== "Ed25519" ||
            typeof jwk.d !== "string" ||
            typeof jwk.x !== "string"
        ) {
            this.log("Vibe-Pass-Import: kein gültiger ed25519-Schlüssel.", "ERROR");
            return { ok: false, reason: "invalid_key" };
        }
        if (typeof crypto === "undefined" || !crypto.subtle) {
            return { ok: false, reason: "no_crypto" };
        }
        // G8 R2 (M3) — change_identity ist eine SOUVERÄNE Aktion: sie läuft durch
        // die EINE Host-Geste (außerhalb jedes iframes, Klartext, jedes Mal frisch).
        if (
            !this._sovereignGesture(
                "change_identity",
                {
                    what: "Identität (Vibe-Pass) wiederherstellen",
                    value: "deine aktuelle Identität wird ERSETZT",
                    whom: "dir selbst — sichere die alte zuerst",
                },
                opts
            )
        ) {
            return { ok: false, reason: "cancelled" };
        }
        try {
            await this._adoptVibePassJwk(jwk, parsed.createdAt, false);
            this._persistVibePass();
            this.journalAppend(
                "ritual",
                AnazhRealm._datum`Ein Vibe-Pass wurde wiederhergestellt — meine Identität ist nun ${this.state.vibePass.fingerprint}.`
            );
            this._renderVibePassUI();
            this.log(`Vibe-Pass wiederhergestellt: ${this.vibePassId()}`, "INFO");
            return { ok: true, id: this.vibePassId() };
        } catch (e) {
            this.log(`Vibe-Pass-Import fehlgeschlagen: ${e && e.message}`, "ERROR");
            return { ok: false, reason: "import_failed" };
        }
    }

    _handleVibePassFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            let parsed = null;
            try {
                parsed = JSON.parse(reader.result);
            } catch (e) {
                this.log(`Vibe-Pass-Import fehlgeschlagen (${file.name}): ${e && e.message}`, "ERROR");
                return;
            }
            this.importVibePass(parsed);
        };
        reader.onerror = () => this.log(`FileReader-Fehler bei ${file.name}`, "ERROR");
        reader.readAsText(file);
    }

    vibePassInitDOM() {
        if (typeof document === "undefined") return;
        const exportBtn = document.getElementById("vibe-pass-export");
        if (exportBtn && exportBtn.dataset.vibeWired !== "1") {
            exportBtn.dataset.vibeWired = "1";
            exportBtn.addEventListener("click", () => this.exportVibePass());
        }
        const importBtn = document.getElementById("vibe-pass-import");
        if (importBtn && importBtn.dataset.vibeWired !== "1") {
            importBtn.dataset.vibeWired = "1";
            importBtn.addEventListener("click", () => {
                const input = document.getElementById("vibe-pass-file-input");
                if (input) {
                    input.value = "";
                    input.click();
                }
            });
        }
        const fileInput = document.getElementById("vibe-pass-file-input");
        if (fileInput && fileInput.dataset.vibeWired !== "1") {
            fileInput.dataset.vibeWired = "1";
            fileInput.addEventListener("change", (e) => {
                const f = e.target && e.target.files && e.target.files[0];
                if (f) this._handleVibePassFile(f);
            });
        }
        this._renderVibePassUI();
    }

    _renderVibePassUI() {
        if (typeof document === "undefined") return;
        const body = document.getElementById("vibe-pass-body");
        if (!body) return;
        body.innerHTML = "";
        const vp = this.state.vibePass;
        if (!vp || !vp.ready) {
            const wait = document.createElement("div");
            wait.className = "drawer-hint";
            wait.textContent =
                typeof crypto !== "undefined" && crypto.subtle
                    ? "Der Vibe-Pass wird erzeugt …"
                    : "Vibe-Pass ruht — öffne die Welt über https oder localhost.";
            body.appendChild(wait);
            return;
        }
        const fp = document.createElement("div");
        fp.className = "vibe-pass-fingerprint";
        fp.textContent = vp.fingerprint;
        fp.title = "ed25519:" + vp.publicKeyHex;
        body.appendChild(fp);

        const idEl = document.createElement("div");
        idEl.className = "vibe-pass-id";
        idEl.textContent = "ed25519:" + vp.publicKeyHex;
        body.appendChild(idEl);

        if (vp.createdAt) {
            const born = document.createElement("div");
            born.className = "vibe-pass-born";
            born.textContent = "Erweckt am " + new Date(vp.createdAt).toLocaleDateString();
            body.appendChild(born);
        }
    }

    // ### Bauplan-Signaturen ###
    // Die Signatur deckt die SUBSTANZ (Rolle + Parts: Form × Material × Geometrie × opChain +
    // Verbindungen), NICHT den Namen: Umbenennen (Recipe-Import, Fusion) bricht sie nicht, eine
    // Part-Änderung schon. Nur eigene Baupläne sind signierbar (Built-ins gehören dem Projekt).

    // Deterministische Serialisierung der signier-relevanten Substanz. Zahlen
    // auf 4 Nachkommastellen gerundet (gegen Float-Drift), feste Schlüssel-
    // Reihenfolge. Dieselbe Eingabe → derselbe String → dieselbe Prüfung.
    _canonicalBlueprint(bp) {
        if (!bp || typeof bp !== "object") return "";
        const num = (v) => Math.round((Number(v) || 0) * 1e4) / 1e4;
        const vec = (o) => ({ x: num(o && o.x), y: num(o && o.y), z: num(o && o.z) });
        const parts = (Array.isArray(bp.parts) ? bp.parts : []).map((p) => ({
            shape: String((p && p.shape) || ""),
            material: String((p && p.material) || ""),
            refName: p && p.refName ? String(p.refName) : "",
            color: p && p.color != null ? String(p.color) : "",
            position: vec(p && p.position),
            size: vec(p && p.size),
            rotation: vec(p && p.rotation),
            opChain: (Array.isArray(p && p.opChain) ? p.opChain : []).map((op) => ({
                tool: String((op && op.tool) || ""),
                op: String((op && op.op) || ""),
                cap: num(op && op.cap),
            })),
        }));
        const connections = (Array.isArray(bp.connections) ? bp.connections : []).map((c) => ({
            type: String((c && c.type) || ""),
            partA: Number(c && c.partA) || 0,
            partB: Number(c && c.partB) || 0,
        }));
        // Die Signatur deckt die gereiste Behauptung: nach Import lebt die Autor-Rolle als roleClaimed,
        // daher roleClaimed ?? role (golden v1 bleibt valid); signBlueprint löscht roleClaimed vorm Siegeln.
        const role = bp.roleClaimed != null ? bp.roleClaimed : bp.role;
        return JSON.stringify({ v: 1, role: String(role || ""), parts, connections });
    }

    // FNV-1a 32-bit, NICHT kryptografisch — nur Änderungs-Erkennung: trennt „modified" (Substanz
    // geändert) von „forged" (Substanz gleich, Signatur passt nicht). Echtheit prüft allein ed25519.
    _fastHash(str) {
        let h = 0x811c9dc5;
        const s = String(str);
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        return (h >>> 0).toString(16).padStart(8, "0");
    }

    // Stream-Gesetz: seed-deterministische RNG je Zweck — Stream-Name → FNV-1a (wie `_fastHash`) → der Strom dieses
    // Samens (`_samenStrom`, das EINE LCG der Welt, Numerical Recipes). Je Zweck ein eigener Suffix (z. B. seed +
    // "-island-2"), damit ein Draw mehr NIE einen anderen Stream re-rollt. NIE `Math.random` in Welt-Substanz (nur
    // UI/Audio/Deko).
    _streamRng(streamName) {
        const s = String(streamName);
        let h = 0x811c9dc5;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        return this._samenStrom(h >>> 0);
    }

    // Versiegelt einen eigenen Bauplan mit dem Vibe-Pass (setzt signature + authorPubKey + signedHash +
    // signedAt). Souveräne Aktion: läuft durch die EINE Host-Geste (opts.skipConfirm im Test).
    async signBlueprint(name, opts) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "unknown" };
        if (bp.builtIn) return { ok: false, reason: "builtin" };
        const vp = this.state.vibePass;
        if (!vp || !vp.ready) return { ok: false, reason: "no_vibepass" };
        if (
            !this._sovereignGesture(
                "sign_manifest",
                {
                    what: `Bauplan „${bp.label || name}" signieren`,
                    value: "deine Signatur bürgt dafür",
                    whom: "jeden, der ihn empfängt",
                },
                opts
            )
        ) {
            return { ok: false, reason: "cancelled" };
        }
        // Ω3(a) — wer signiert, bürgt für die EIGENE Form: eine mitgereiste
        // fremde Rollen-Behauptung fällt, der Kanon liest dann bp.role.
        delete bp.roleClaimed;
        const canonical = this._canonicalBlueprint(bp);
        const sig = await this._vibeSign(canonical);
        if (!sig) return { ok: false, reason: "sign_failed" };
        bp.signature = sig;
        bp.authorPubKey = vp.publicKeyHex;
        bp.signedHash = this._fastHash(canonical);
        bp.signedAt = Date.now();
        // G8 R4 (M4a) — die Herkunftskette: ich hänge mich an (Ursprung wenn
        // leer, sonst Überträger eines empfangenen + weiterveränderten Werks).
        this._appendProvenance(bp, vp.publicKeyHex);
        this.saveState();
        this.journalAppend("ritual", AnazhRealm._datum`Ich versiegelte „${bp.label || name}" mit meinem Vibe-Pass.`, {
            blueprint: name,
        });
        return { ok: true, authorPubKey: bp.authorPubKey };
    }

    // Signatur-Status eines Bauplans (async; wirft nie bei Müll-Eingabe):
    //   "unsigned" — keine Signatur · "modified" — Substanz seit dem Signieren geändert
    //   "valid"    — Signatur deckt die aktuelle Substanz und ist echt
    //   "forged"   — Substanz unverändert, verifiziert aber NICHT gegen den angegebenen Autor
    async verifyBlueprintSignature(bp) {
        if (!bp || typeof bp !== "object" || !bp.signature || !bp.authorPubKey) {
            return "unsigned";
        }
        const canonical = this._canonicalBlueprint(bp);
        if (bp.signedHash && this._fastHash(canonical) !== bp.signedHash) {
            return "modified";
        }
        const ok = await this._vibeVerify(canonical, bp.signature, bp.authorPubKey);
        return ok ? "valid" : "forged";
    }

    // ### Teilen in EINER Geste: Signatur → Code → spawn_blueprint ###
    // DAS PROGRAMM EINES REISENDEN WERKS (EIN Weg, Gebot 4): was zum Mitspieler geht (`confirmBuild` → P2P) und was ein Code
    // trägt (`teileWerk`) ist DASSELBE DSL-Programm — spawn_blueprint (Slot 3 Same, 6 Stempel oder null, 7 Drehung), ein
    // EIGENER Bauplan als define_blueprint davor (sonst kennt der Empfänger ihn nicht). Was das Buch jedem Empfänger selbst
    // registriert (`_foundryAutoSpecies`, fahrzeug_gt), reist nie als Teile — bis hier schickte der Bau eines Studio-Wagens die
    // Donor-Teile mit (Code > 4 KB), und define_blueprint überschrieb beim Mitspieler den Bauplan seines Buchs.
    _werkProgramm(name, posNode, seed, archId, stamp, dreh) {
        const spawn = ["spawn_blueprint", name, posNode, seed, archId, stamp || null, dreh];
        const bp = this.state.blueprints[name];
        return this._werkEigen(bp) ? ["chain", ["define_blueprint", name, bp.parts], spawn] : spawn;
    }

    _werkEigen(bp) {
        return !!bp && !bp.builtIn && !bp._foundryAutoSpecies && Array.isArray(bp.parts);
    }

    // Die signierte Fracht einer Hülle in fester Reihe: das Programm (Werk, Regel) oder das Gesetz (Welt) und die Herkunft
    // (`provenance`, der Fork eines Eintrags der Bibliothek) — ein Werk ohne Herkunft signiert byte-gleich wie seit v1.
    _werkKanon(h) {
        return JSON.stringify({ v: 1, programm: h.programm, gesetz: h.gesetz, provenance: h.provenance });
    }

    // Versiegelt eine Fracht mit dem Vibe-Pass → EIN Code (`_werkHuelle`). Die Signatur deckt `_werkKanon`.
    async _werkCode(fracht, max) {
        const sig = await this._vibeSign(this._werkKanon(fracht));
        if (!sig) return { ok: false, grund: "sign_failed" };
        return this._werkHuelle({ ...fracht, sig }, max);
    }

    // DAS EINE CODE-FORMAT jedes Teilens: `WERK_CODE.praefix` + base64url der Hülle { v, programm | gesetz | welt, autor, sig } —
    // ein Werk trägt sein Programm, eine Welt ihre signierte Adresse (`teileWelt`), ein Eintrag der Bibliothek sein Gesetz
    // (`huelle` sind seine Bytes; die Decke `max` des Codes). { ok, code, huelle } | { ok:false, grund }.
    _werkHuelle(fracht, max = AnazhRealm.WERK_CODE.max) {
        const huelle = JSON.stringify({ v: 1, ...fracht, autor: this.state.vibePass.publicKeyHex });
        const code = AnazhRealm.WERK_CODE.praefix + this._vibeBytesToB64u(new TextEncoder().encode(huelle));
        return code.length <= max ? { ok: true, code, huelle } : { ok: false, grund: "gross" };
    }

    // DIE GESTE DES SENDERS einer Welt: die aktive Welt wird Gastgeber (Rolle host, der Raum offen — der Host beantwortet den
    // world-request), ihre Adresse signiert der Vibe-Pass (`signWorldAddress`, die EINE Signatur einer Welt-Adresse, mit
    // ihrer souveränen Geste) und reist in derselben Hülle wie ein Werk. Ein Gast teilt die Adresse seines Hosts.
    async teileWelt(opts) {
        const wm = this.state.worldMeta || {};
        const p2p = this.state.p2p;
        if (wm.role !== "guest" && wm.role !== "host") {
            wm.role = p2p.role = "host";
            this.saveState();
        }
        if (!p2p.ws) this.initP2PSync(null);
        const res = await this.signWorldAddress(opts);
        if (!res.ok) return { ok: false, grund: res.reason };
        const { worldId, roomId, broker, label, sig } = res.address;
        return this._werkHuelle({ welt: { worldId, roomId, broker, label }, sig });
    }

    // DIE GESTE DES SENDERS: das Werk der Werkstatt — Bauplan, Same der Vorschau (`_werkSame`), Stempel (`_studioStampFor`) —
    // als reisendes Programm ohne Ort und Id (der Empfänger stellt es an SEINE Pose), versiegelt durch die EINE souveräne Geste.
    async teileWerk(name, opts) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, grund: "unbekannt" };
        const vp = this.state.vibePass;
        if (!vp || !vp.ready) return { ok: false, grund: "no_vibepass" };
        const was = {
            what: `Werk „${this._werkLabel(name)}" teilen`,
            value: "deine Signatur bürgt dafür",
            whom: "jeden mit dem Code",
        };
        if (!this._sovereignGesture("sign_manifest", was, opts)) return { ok: false, grund: "cancelled" };
        return this._werkCode({ programm: this._werkReise(name) });
    }

    // Das reisende Programm eines Bauplans ohne Ort und Id — der Code (`teileWerk`) und die Bibliothek tragen dasselbe.
    _werkReise(name) {
        const bp = this.state.blueprints[name];
        return this._werkProgramm(name, null, this._werkSame(bp, name, null), null, this._studioStampFor(name), 0);
    }

    // DIE GESTE DES EMPFÄNGERS: ein Code (Chat) → dasselbe Werk an der eigenen Pose. Jede Wand fällt LAUT und beim Namen
    // (`WERK_CODE.grund`, fail-closed — nichts wird geschrieben, bevor alle tragen): das Programm ist genau spawn_blueprint, ein
    // eigener Bauplan als define_blueprint davor (op:<verb> für jedes andere), der Name folgt dem Muster der Baupläne (keine
    // Schrift aus fremder Hand), die Teile dem Bau-Vertrag (`validateBlueprintParts`), der Stempel dem Vertrag des Kerns
    // (`_ovVertrag`), die Signatur dem Autor (ed25519). Fremde Felder der Hülle trägt Vertrag v1.2 als must-ignore: benannt, nie
    // gelesen. Ein Name, den die Welt schon eigen trägt, kommt umbenannt (nie überschrieben). { ok, id, name, autor, fremd }.
    async empfangeWerk(code, opts = {}) {
        const W = AnazhRealm.WERK_CODE;
        const ab = (grund) => {
            this._spielerSagt(`Geteiltes Werk abgewiesen: ${W.grund[grund.split(":")[0]]} (${grund}).`);
            return { ok: false, grund };
        };
        if (typeof code !== "string" || !code.startsWith(W.praefix)) return ab("kein_code");
        if (code.length > W.max) return ab("gross");
        let h = null;
        try {
            const bytes = this._vibeB64uToBytes(code.slice(W.praefix.length));
            h = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
        } catch (_e) {
            return ab("kaputt");
        }
        if (!h || typeof h !== "object" || Array.isArray(h)) return ab("kaputt");
        if (h.v !== 1) return ab("version");
        if (h.welt) return this._empfangeWelt(h, ab, opts);
        const p = h.programm;
        const kette = Array.isArray(p) && p[0] === "chain";
        const [def, spawn] = kette ? [p[1], p[2]] : [null, p];
        const verb = (n, soll) =>
            Array.isArray(n) && n[0] === soll
                ? null
                : "op:" +
                  String(Array.isArray(n) ? n[0] : "form")
                      .replace(/[^\w-]/g, "?")
                      .slice(0, 32);
        const bruch =
            kette && p.length !== 3
                ? "op:chain"
                : (def && verb(def, "define_blueprint")) || verb(spawn, "spawn_blueprint");
        if (bruch) return ab(bruch);
        if (spawn.length > 7 || spawn[2] != null || spawn[4] != null || (def && def.length !== 3)) return ab("form");
        const name = spawn[1];
        if (typeof name !== "string" || !/^[a-z0-9_-]{1,40}$/i.test(name) || (def && def[1] !== name))
            return ab("name");
        if (!Number.isInteger(spawn[3]) || spawn[3] < 0 || spawn[3] > 0xffffffff) return ab("same");
        if (spawn[6] != null && !Number.isFinite(spawn[6])) return ab("drehung");
        const eigen = this.state.blueprints[name];
        if (def) {
            if (eigen && !this._werkEigen(eigen)) return ab("builtin:" + name);
            const teile = this.validateBlueprintParts(def[2]);
            if (!teile.ok)
                return ab(
                    "teile:" +
                        String(teile.reason)
                            .replace(/[^\w:-]/g, "?")
                            .slice(0, 48)
                );
        } else if (!eigen) return ab("unbekannt:" + name);
        const vertrag = this._ovVertrag(name, spawn[5]);
        if (vertrag) return ab(vertrag);
        if (typeof h.autor !== "string" || typeof h.sig !== "string") return ab("unsigniert");
        if (!(await this._vibeVerify(this._werkKanon(h), h.sig, h.autor))) return ab("signatur");
        let ziel = name;
        for (let n = 1; def && this.state.blueprints[ziel]; n++) ziel = `${name.slice(0, 30)}-geteilt${n > 1 ? n : ""}`;
        const s = spawn.slice();
        [s[1], s[2]] = [ziel, opts.pos || ["at_player_forward", W.abstand]];
        const lauf = this.dslRun(def ? ["chain", ["define_blueprint", ziel, def[2]], s] : s, { source: "teilen" });
        const steht = lauf.log.find((e) => e.event === "spawned_blueprint" && e.id != null);
        if (!steht) return ab("steht_nicht:" + ziel);
        const fremd = Object.keys(h)
            .filter((k) => !["v", "programm", "provenance", "autor", "sig"].includes(k))
            .map((k) => k.replace(/[^\w-]/g, "?").slice(0, 24));
        if (fremd.length)
            this.log(`Geteiltes Werk: fremde Felder der Hülle ignoriert (must-ignore): ${fremd.join(", ")}`, "INFO");
        this.journalAppend(
            "witness",
            AnazhRealm._datum`Ich empfing ein geteiltes Werk von ${this._vibeFingerprint(h.autor)}.`,
            {
                name: ziel,
            }
        );
        this._spielerSagt(`Geteiltes Werk steht: ${this._werkLabel(ziel)} (von ${this._vibeFingerprint(h.autor)}).`);
        return { ok: true, id: steht.id, name: ziel, autor: h.autor, fremd };
    }

    // DER EMPFANG EINER WELT (dieselbe Geste, dieselbe Hülle): die Adresse durch den EINEN Eingang fremder Welt-Adressen
    // (`_admitForeignWorldAddress`), die Signatur des Autors über sie (`verifyWorldAddress`, nur "valid" reist), dann der
    // Beitritt (`_weltBeitritt` → die Tür `_weltBetreten`). Nichts wird geschrieben, bevor alle Wände tragen.
    async _empfangeWelt(h, ab, opts) {
        const addr = this._admitForeignWorldAddress({ ...h.welt, authorPubKey: h.autor, sig: h.sig });
        if (!addr) return ab("adresse");
        if (!addr.sig) return ab("unsigniert");
        if ((await this.verifyWorldAddress(addr)) !== "valid") return ab("signatur");
        this._spielerSagt(
            `Geteilte Welt „${addr.label}" (von ${this._vibeFingerprint(addr.authorPubKey)}) — trete bei …`
        );
        const res = await this._weltBeitritt(addr, { slugHint: opts.slugHint || addr.label });
        return res.ok ? { ok: true, welt: res.worldId, autor: addr.authorPubKey } : ab("beitritt:" + res.reason);
    }

    // ### DIE BIBLIOTHEK (ultiversum.K3): signierte Gesetze, klein, über einen Code auffindbar, forkbar ###
    // EIN Verzeichnis über der EINEN Hülle des Teilens (`_werkCode` → `_werkHuelle`, dieselbe Signatur): ein Eintrag ist GESETZ,
    // nie Mesh — ein Bauplan sein reisendes Programm (`_werkReise`: Teile, Same, Stempel), eine Regel ihr rule-Programm, eine Welt
    // Saat · Gelände · Wetter · Regeln · Akten (die Edits), gelesen aus der EINEN Stand-Tafel (`_standTafel`). Das Urteil ist die
    // Größe (`BIBLIOTHEK.max` Bytes je Eintrag). Der Code ist der Inhalts-Hash (SHA-256 der Bytes): wer ihn hat, findet den
    // Eintrag und prüft ihn selbst — Hash, Signatur, Rückruf (`_artifactProvenanceTainted`). Der Fork trägt die Herkunfts-Kette
    // (`provenance`, je Glied Autor und Code des Vorgängers) unter der Signatur des Forkenden; jeder Eintrag ist offenes JSON.
    _bibliothek() {
        if (!this.state.bibliothek) {
            let roh = null;
            try {
                roh = JSON.parse(localStorage.getItem(AnazhRealm.BIBLIOTHEK.speicher) || "{}");
            } catch {
                roh = null;
            }
            this.state.bibliothek = roh && typeof roh === "object" && !Array.isArray(roh) ? roh : {};
        }
        return this.state.bibliothek;
    }

    // Die Fracht eines Eintrags je Art (null: die Quelle fehlt) — die Regel als ihr Programm (`rule`), in der Welt wie allein.
    _bibliothekFracht(art, quelle) {
        const regel = (r) => ["rule", r.cond, r.effect, { everySec: r.everySec, ttlSec: r.ttlSec }];
        if (art === "bauplan") return this.state.blueprints[quelle] ? { programm: this._werkReise(quelle) } : null;
        if (art === "regel") {
            const r = (this.state.worldRules || []).find((x) => x.id === quelle);
            return r ? { programm: regel(r) } : null;
        }
        if (art !== "welt") return null;
        const feld = (k) => this._standTafel().find((z) => z[0] === k)[1](false, {});
        const wm = feld("worldMeta");
        const gelaende = [feld("terrainSteepness"), feld("terrainBaseHeight")];
        const regeln = feld("worldRules").map(regel);
        return {
            gesetz: {
                saat: wm.seed,
                gen: wm.genVersion,
                gelaende,
                wetter: feld("weather"),
                regeln,
                akten: wm.voxelEdits || [],
            },
        };
    }

    // DER EINE EINGANG eines Eintrags (eigen und fremd, beim Ablegen und beim Finden): Bytes ≤ Decke, Hülle v1, die Art aus der
    // Fracht, Signatur des Autors über `_werkKanon`, kein zurückgerufener Schlüssel in der Kette. { ok, code, art, bytes, eintrag }.
    async _bibliothekPruefe(text) {
        const bytes = new TextEncoder().encode(String(text));
        if (bytes.length > AnazhRealm.BIBLIOTHEK.max) return { ok: false, grund: "gross", bytes: bytes.length };
        let h = null;
        try {
            h = JSON.parse(text);
        } catch {
            return { ok: false, grund: "kaputt" };
        }
        if (!h || typeof h !== "object" || Array.isArray(h) || h.v !== 1) return { ok: false, grund: "version" };
        const p = h.programm;
        const kopf = Array.isArray(p) ? (p[0] === "chain" && Array.isArray(p[2]) ? p[2][0] : p[0]) : null;
        const art =
            h.gesetz && typeof h.gesetz === "object" && !p
                ? "welt"
                : { rule: "regel", spawn_blueprint: "bauplan" }[kopf] || null;
        if (!art) return { ok: false, grund: "art" };
        if (!(await this._vibeVerify(this._werkKanon(h), h.sig, h.autor))) return { ok: false, grund: "signatur" };
        if (this._artifactProvenanceTainted({ authorPubKey: h.autor, provenance: h.provenance }))
            return { ok: false, grund: "rueckruf" };
        const code = this._vibeBytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)));
        return { ok: true, code, art, bytes: bytes.length, eintrag: h };
    }

    // Nimmt einen Eintrag (seine Bytes) durch den EINEN Eingang ins Verzeichnis, unter seinem Code; gespeichert spieler-global
    // (localStorage `BIBLIOTHEK.speicher`, nie im Welt-Stand). Scheitert das Speichern, fällt der Eintrag laut.
    async bibliothekAufnehmen(text) {
        const res = await this._bibliothekPruefe(text);
        if (!res.ok) return res;
        const verz = this._bibliothek();
        verz[res.code] = text;
        try {
            localStorage.setItem(AnazhRealm.BIBLIOTHEK.speicher, JSON.stringify(verz));
        } catch (e) {
            delete verz[res.code];
            return { ok: false, grund: "speicher:" + (e && e.name) };
        }
        return { ok: true, code: res.code, art: res.art, bytes: res.bytes };
    }

    // Das Wiederfinden über den Code: der Eintrag nur, wenn seine Bytes den Code tragen und der Eingang ihn hält.
    async bibliothekFinde(code) {
        const text = this._bibliothek()[code];
        if (typeof text !== "string") return { ok: false, grund: "unbekannt" };
        const res = await this._bibliothekPruefe(text);
        return res.ok && res.code !== code ? { ok: false, grund: "code" } : res;
    }

    // DIE GESTE DES ABLEGENS: ein Gesetz der Welt (art welt · regel mit der Regel-Id · bauplan mit dem Namen) wird signiert
    // Eintrag — durch die EINE souveräne Geste. { ok, code, art, bytes } | { ok:false, grund }.
    async bibliothekLege(art, quelle, opts) {
        const fracht = this._bibliothekFracht(art, quelle);
        return fracht
            ? this._bibliothekSiegeln(fracht, `${art} „${quelle ?? "diese Welt"}"`, opts)
            : { ok: false, grund: "unbekannt" };
    }

    // DER FORK: ein gefundener Eintrag wird mein Eintrag — `aendere(fracht)` verändert sein Gesetz, die Kette wächst um den
    // Vorgänger (Autor und Code), die Signatur ist meine. { ok, code, … } | { ok:false, grund }.
    async bibliothekForke(code, aendere, opts) {
        const alt = await this.bibliothekFinde(code);
        if (!alt.ok) return alt;
        const { programm, gesetz, provenance } = JSON.parse(this._bibliothek()[code]);
        const kette = [...this._sanitizeProvenance(provenance), { by: alt.eintrag.autor, at: Date.now(), code }];
        const fracht = { programm, gesetz, provenance: kette };
        if (aendere) aendere(fracht);
        return this._bibliothekSiegeln(fracht, `Fork von ${code.slice(0, 12)}`, opts);
    }

    async _bibliothekSiegeln(fracht, was, opts) {
        const vp = this.state.vibePass;
        if (!vp || !vp.ready) return { ok: false, grund: "no_vibepass" };
        const geste = {
            what: `${was} in die Bibliothek legen`,
            value: "deine Signatur bürgt dafür",
            whom: "jeden mit dem Code",
        };
        if (!this._sovereignGesture("sign_manifest", geste, opts)) return { ok: false, grund: "cancelled" };
        const h = await this._werkCode(fracht, Infinity);
        return h.ok ? this.bibliothekAufnehmen(h.huelle) : h;
    }

    // ### Welt-Manifest-Signatur ###
    // Spiegelt die Bauplan-Signatur: der Spieler versiegelt eine Welt mit SEINEM Vibe-Pass (kein
    // Projekt-Schlüssel, keine zentrale Autorität). Spieler-global in state.signedWorlds + localStorage
    // "anazh.signedWorlds"; die statischen worlds/<id>/manifest.json bleiben unberührt.

    // Der signierbare Kern eines Welt-Manifests: Identität + Name + DSL-
    // Vokabular, deterministisch serialisiert (analog _canonicalBlueprint).
    // world (der Pfad) + desc (Browse-Text) gehören NICHT zur Substanz.
    _canonicalManifest(m) {
        if (!m || typeof m !== "object") return "";
        const dsl = (Array.isArray(m.dsl) ? m.dsl : []).map((d) => String(d));
        return JSON.stringify({ v: 1, id: String(m.id || ""), label: String(m.label || ""), dsl });
    }

    // Signierbarer Kern einer Welt-Adresse: nur die vier FROZEN-Felder (worldId · roomId · broker ·
    // label), deterministisch mit v:1-Marke serialisiert; authorPubKey + sig + signedAt sind die Hülle.
    // Neue Felder gehören in die Hülle, nie in den Kern — sonst brechen ältere Signaturen.
    _canonicalWorldAddress(a) {
        if (!a || typeof a !== "object") return "";
        return JSON.stringify({
            v: 1,
            worldId: String(a.worldId || ""),
            roomId: String(a.roomId || ""),
            broker: String(a.broker || ""),
            label: String(a.label || ""),
        });
    }

    // Signierbare Substanz der AKTIVEN Welt: worldMeta + p2p-URL als broker (Fallback: Default).
    // NULL ohne worldId.
    _buildWorldAddressSubstance(opts) {
        const wm = this.state.worldMeta || {};
        if (!wm.worldId) return null;
        const p2p = this.state.p2p || {};
        // erreichbar für ein anderes Gerät: die LAN-Adresse, die der signaling-server meldet, sonst die eingestellte URL;
        // der Raum, in dem die Welt steht
        const lan = (p2p.lanAddresses || [])[0];
        const broker = (opts && opts.broker) || (lan ? `ws://${lan}` : p2p.url || AnazhRealm.P2P_DEFAULT_WS_URL);
        const roomId =
            (opts && opts.roomId) || (p2p.ws && p2p.room) || (p2p.roomOverride || "").trim() || String(wm.worldId);
        const label = (opts && opts.label) || wm.slug || String(wm.worldId).slice(0, 16);
        return {
            worldId: String(wm.worldId),
            roomId: String(roomId),
            broker: String(broker),
            label: String(label),
        };
    }

    // Welt-Adresse mit dem Vibe-Pass signieren — souveräne Geste über _sovereignGesture (sign_manifest,
    // kein neuer SOVEREIGN-Eintrag); opts.skipConfirm für Tests.
    // Liefert { ok, address } oder { ok:false, reason }.
    async signWorldAddress(opts) {
        const vp = this.state.vibePass;
        if (!vp || !vp.ready) return { ok: false, reason: "no_vibepass" };
        const subst = this._buildWorldAddressSubstance(opts || {});
        if (!subst) return { ok: false, reason: "no_world" };
        if (
            !this._sovereignGesture(
                "sign_manifest",
                {
                    what: `Welt-Adresse „${subst.label}" signieren`,
                    value: `${subst.broker} → ${subst.roomId}`,
                    whom: "jeden, der durchs Portal kommt",
                },
                opts
            )
        ) {
            return { ok: false, reason: "cancelled" };
        }
        const canonical = this._canonicalWorldAddress(subst);
        const sig = await this._vibeSign(canonical);
        if (!sig) return { ok: false, reason: "sign_failed" };
        const address = {
            worldId: subst.worldId,
            roomId: subst.roomId,
            broker: subst.broker,
            label: subst.label,
            authorPubKey: vp.publicKeyHex,
            sig,
            signedAt: Date.now(),
        };
        // Die EIGENE Welt erinnert sich an ihre öffentliche Adresse — der
        // Portal-Setter (setPortalAddress) ist der Konsument; eine Welt darf
        // mehrere Portale tragen, die ihre Adresse weiterreichen.
        this.state.worldMeta.worldAddress = address;
        this.saveState();
        return { ok: true, address };
    }

    // Signatur-Status einer Welt-Adresse (async, ed25519; wirft nie bei Müll-Eingabe):
    //   "unsigned" — kein sig/authorPubKey · "invalid" — verifiziert NEGATIV
    //   "valid"    — Signatur deckt die Substanz und ist echt
    async verifyWorldAddress(addr) {
        if (!addr || typeof addr !== "object") return "unsigned";
        if (!addr.sig || !addr.authorPubKey) return "unsigned";
        const canonical = this._canonicalWorldAddress(addr);
        const ok = await this._vibeVerify(canonical, addr.sig, addr.authorPubKey);
        return ok ? "valid" : "invalid";
    }

    // Der EINE Eingang für eine FREMDE Welt-Adresse (Bauplan-Portal, geteilte URL), Spiegel von
    // _admitForeignArtifact: Struktur + Signatur-Status (async gestempelt). KEIN Auto-Join —
    // enterPortal zeigt die Bestätigungs-Karte. Liefert den Eintrag oder null.
    _admitForeignWorldAddress(rawAddr) {
        if (!rawAddr || typeof rawAddr !== "object") return null;
        // Strukturelle Form (alle vier Felder Strings, nicht-leer).
        const worldId = typeof rawAddr.worldId === "string" ? rawAddr.worldId.trim() : "";
        const roomId = typeof rawAddr.roomId === "string" ? rawAddr.roomId.trim() : "";
        const broker = typeof rawAddr.broker === "string" ? rawAddr.broker.trim() : "";
        const label = typeof rawAddr.label === "string" ? rawAddr.label.trim() : "";
        if (!worldId || !roomId || !broker) return null;
        // broker MUSS ein wss:// oder ws:// sein — gegen Pfade ausserhalb der
        // Taille (das M3-Sieb: an der Form vor dem Inhalt).
        if (!/^wss?:\/\//i.test(broker)) return null;
        // worldId-Form: 4..80 Zeichen, kein /
        if (worldId.length < 4 || worldId.length > 80 || /[/\\\s]/.test(worldId)) return null;
        if (roomId.length < 4 || roomId.length > 80 || /[/\\\s]/.test(roomId)) return null;
        const out = {
            worldId,
            roomId,
            broker,
            label: label.slice(0, 64),
        };
        // Signatur-Hülle nur wenn strukturell plausibel (must-ignore: ein
        // Hex-Wirrwarr bleibt einfach unsigniert, kein Wurf).
        if (
            typeof rawAddr.authorPubKey === "string" &&
            /^[0-9a-f]{64}$/i.test(rawAddr.authorPubKey) &&
            typeof rawAddr.sig === "string" &&
            /^[0-9a-f]{2,256}$/i.test(rawAddr.sig)
        ) {
            out.authorPubKey = rawAddr.authorPubKey.toLowerCase();
            out.sig = rawAddr.sig;
            out.signedAt = typeof rawAddr.signedAt === "number" ? rawAddr.signedAt : 0;
            // R4-Sieb: revozierte Herkunft fällt am Eingang.
            if (this.state.revokedKeys && this.state.revokedKeys.has(out.authorPubKey)) {
                return null;
            }
        }
        return out;
    }

    // ===== Regions-Archipel: die Welt-Mathematik der Bubbles =====
    // Default OFF (worldMeta.regionsActive=false → eine Welt = ein Raum); aktiv ist jede Region eine
    // Bubble (`roomId = worldId:regionKey`).

    // Die EINE Mathe: (x,z) → "r<RX>_<RZ>" mit RX = floor(x / REGION_SPAN_M), symmetrisch um den Ursprung
    // (negative Indizes). Die Form ist kollisionsfrei mit der worldId-Form (uuid-Fragmente).
    _regionKeyForPos(x, z) {
        const span = AnazhRealm.REGION_SPAN_M;
        const rx = Math.floor(Number(x) / span);
        const rz = Math.floor(Number(z) / span);
        return `r${rx}_${rz}`;
    }

    // Φ3 — Umkehrung: aus "rRX_RZ" die {minX, maxX, minZ, maxZ}-Box. Streng
    // gültig (Form-Check); ein Müll-Key → null (must-ignore am Leser).
    _regionBoundsFromKey(key) {
        const m = /^r(-?\d+)_(-?\d+)$/.exec(String(key || ""));
        if (!m) return null;
        const rx = Number(m[1]);
        const rz = Number(m[2]);
        if (!Number.isFinite(rx) || !Number.isFinite(rz)) return null;
        const span = AnazhRealm.REGION_SPAN_M;
        return {
            rx,
            rz,
            minX: rx * span,
            maxX: (rx + 1) * span,
            minZ: rz * span,
            maxZ: (rz + 1) * span,
            centerX: (rx + 0.5) * span,
            centerZ: (rz + 0.5) * span,
        };
    }

    // Raum-Name am Mesh-Broker: `worldId:regionKey`. Ohne aktive Regionen (regionsActive=false) → NULL als
    // Region-Suffix; der join-Pfad nutzt dann nur worldId.
    _regionRoomId(worldId, regionKey) {
        const w = String(worldId || "").trim();
        if (!w) return null;
        const k = String(regionKey || "").trim();
        if (!k || !/^r-?\d+_-?\d+$/.test(k)) return w; // Fallback: kein Regions-Suffix
        return `${w}:${k}`;
    }

    // Φ3 — die LIVE Region des Spielers. Liest playerMesh.position; gibt
    // NULL, wenn kein Spieler-Mesh existiert (Boot-Phase).
    _currentRegionKey() {
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return null;
        return this._regionKeyForPos(pm.x, pm.z);
    }

    // Φ3 — die ECHTE Test-Geste: ist die Region aktiv? Eine Welt mit
    // regionsActive=true UND einer plausiblen aktuellen Region. Solo-Welten
    // / nicht-bevölkerte Regionen behalten heutige Mesh-Semantik.
    isRegionsActive() {
        return !!(this.state.worldMeta && this.state.worldMeta.regionsActive === true);
    }

    // Souveräne Geste: Regions-Archipel an/aus für die aktive Welt (kein DSL-Op). Aktivieren setzt den
    // Initial-Region-Key an die Spieler-Position, Deaktivieren räumt das Tracking. Der Mesh wird NICHT
    // automatisch umgesteckt — erst ein Reload oder _regionMaybeJoin.
    setRegionsActive(active) {
        if (!this.state.worldMeta) return { ok: false, reason: "no_world" };
        const wantOn = active === true;
        this.state.worldMeta.regionsActive = wantOn;
        if (wantOn) {
            this.state.worldMeta.currentRegionKey = this._currentRegionKey() || "r0_0";
        } else {
            delete this.state.worldMeta.currentRegionKey;
        }
        this.saveState();
        return { ok: true, regionsActive: wantOn, currentRegionKey: this.state.worldMeta.currentRegionKey || null };
    }

    // Mesh-Switch beim Region-Übergang (vom _gameLoopTick, wenn die Hysterese greift): alten Mesh-Raum
    // verlassen, `worldId:newKey` joinen. Inventar/Stats/Reittier bleiben LOKAL — nur die Anwesenheits-
    // Bubble wechselt, kein Snapshot/Restore; Peers der alten Bubble gehen verloren.
    // No-op ohne aktive P2P-Verbindung oder ohne worldId.
    _p2pRegionHandoff(oldKey, newKey) {
        const p2p = this.state.p2p;
        const wm = this.state.worldMeta;
        if (!p2p || !wm || !wm.worldId) return { ok: false, reason: "not_ready" };
        const newRoomId = this._regionRoomId(wm.worldId, newKey);
        if (!newRoomId) return { ok: false, reason: "no_room_id" };
        // Wenn P2P nicht enabled — wir aktualisieren nur den Override (für
        // den nächsten enable-Akt), kein WS-Tanz.
        const wasConnected = p2p.enabled && (p2p.connected || p2p.ws);
        p2p.roomOverride = newRoomId;
        try {
            localStorage.setItem("anazh.p2p.room", newRoomId);
        } catch {
            /* defensive — localStorage darf vollgelaufen sein */
        }
        // Logge IMMER (der Region-Wechsel ist eine Welt-Wahrheit, auch ohne Mesh).
        this.log(
            `Φ3 Region-Übergang: ${oldKey || "?"} → ${newKey} (Bubble ${newRoomId})${wasConnected ? "" : " · ohne Mesh"}`,
            "INFO"
        );
        if (wasConnected && typeof this.initP2PSync === "function") {
            // Sauberer Re-Join: shutdown ruft initP2PSync intern; der signaling-server entfernt uns aus dem alten
            // Raum (peer-leave), der Join im neuen liefert welcome mit dessen Peers.
            try {
                this.initP2PSync(newRoomId, { url: p2p.url });
            } catch (err) {
                this.log(`Φ3 Region-Handoff WS-Fehler: ${err.message}`, "WARN");
                return { ok: false, reason: "ws_throw" };
            }
        }
        return { ok: true, oldKey: oldKey || null, newKey, room: newRoomId, withMesh: !!wasConnected };
    }

    // Hysterese-bewachte Region-Übergangs-Erkennung; 1 Hz reicht (~10 m/s << 345.6 m Region).
    // Ein Wechsel zählt erst ≥ HYSTERESIS_M tief in der NEUEN Region (gegen Flackern an der Grenze).
    // Liefert {crossed, oldKey, newKey} oder null.
    _regionTickDetectCrossing() {
        if (!this.isRegionsActive()) return null;
        const wm = this.state.worldMeta;
        const currentKey = this._currentRegionKey();
        if (!currentKey) return null;
        const lastKey = wm.currentRegionKey || currentKey;
        if (currentKey === lastKey) return null;
        // Hysterese: der Spieler muss in der NEUEN Region eine Strecke ≥
        // HYSTERESIS_M zur Grenze haben — sonst zählen wir den Übergang nicht.
        const bounds = this._regionBoundsFromKey(currentKey);
        if (!bounds) return null;
        const pm = this.state.playerMesh.position;
        const distToBorder = Math.min(
            Math.abs(pm.x - bounds.minX),
            Math.abs(pm.x - bounds.maxX),
            Math.abs(pm.z - bounds.minZ),
            Math.abs(pm.z - bounds.maxZ)
        );
        if (distToBorder < AnazhRealm.REGION_HYSTERESIS_M) return null;
        // ECHTER Übergang — wir kommitten den neuen Key + geben ihn aus.
        wm.currentRegionKey = currentKey;
        this.saveState();
        return { crossed: true, oldKey: lastKey, newKey: currentKey };
    }

    // ===== Das Mittragen: das Torrent-Modell für Welten =====
    // Ein Peer kann eine besuchte signierte Welt opt-in tragen (letzter Snapshot + Hash) und beantwortet
    // den world-request, wenn der Host fehlt. Der Empfänger lädt durch den EINEN Taille-Eingang
    // (_admitForeignArtifact für Baupläne, _importGuestWorld für den Snapshot) — er vertraut nur der
    // Signaturkette, nie dem Mitträger.

    // Den letzten Snapshot der AKTIVEN Welt lokal pinnen (kein DSL-Op): Hash + Speichern, ein bestehender
    // Pin wird aktualisiert; persistiert über _savePinnedManifest ("anazh.pinnedManifest", global).
    // Größen-Wand: ein Snapshot-JSON über 256 KiB fällt (bounded Speicher; typisch 20-50 KiB).
    pinCurrentWorld(opts) {
        const wm = this.state.worldMeta;
        if (!wm || !wm.worldId) return { ok: false, reason: "no_world" };
        const worldId = wm.worldId;
        const snapshot = this.buildStateSnapshot();
        const json = JSON.stringify(snapshot);
        if (json.length > 256 * 1024) {
            return { ok: false, reason: "snapshot_too_large", bytes: json.length };
        }
        const hash = this._fastHash(json);
        const entry = {
            worldId,
            snapshot,
            hash,
            label: wm.slug || worldId.slice(0, 16),
            authorPubKey: (this.state.vibePass && this.state.vibePass.publicKeyHex) || null,
            signedAt: wm.worldAddress && wm.worldAddress.signedAt ? wm.worldAddress.signedAt : Date.now(),
            pinnedAt: Date.now(),
        };
        this.state.p2p.pinnedWorlds.set(worldId, entry);
        this._savePinnedManifest();
        if (!opts || !opts.silent) {
            this.log(`Φ5 Welt „${entry.label}" mitgetragen (Snapshot ${(json.length / 1024).toFixed(1)} KiB)`, "INFO");
        }
        return { ok: true, worldId, hash, bytes: json.length };
    }

    // Φ5 — eine getragene Welt loslassen. Idempotent. Persistiert.
    unpinWorld(worldId) {
        const w = String(worldId || "").trim();
        if (!w) return { ok: false, reason: "no_world" };
        const had = this.state.p2p.pinnedWorlds.has(w);
        this.state.p2p.pinnedWorlds.delete(w);
        this._savePinnedManifest();
        return { ok: true, worldId: w, removed: had };
    }

    // Φ5 — die LESE-API: welche Welten trage ich? Für UI + Tests + Antikörper.
    listPinnedWorlds() {
        const out = [];
        if (!this.state.p2p || !this.state.p2p.pinnedWorlds) return out;
        for (const [worldId, e] of this.state.p2p.pinnedWorlds) {
            out.push({
                worldId,
                hash: e.hash,
                label: e.label,
                authorPubKey: e.authorPubKey || null,
                pinnedAt: e.pinnedAt,
                bytes: JSON.stringify(e.snapshot).length,
            });
        }
        return out;
    }

    // Das EINE Manifest in localStorage trägt NUR Schlüssel + Meta; die Snapshots leben in eigenen Keys
    // "anazh.pinnedSnapshot.<worldId>". Jeder Pin schreibt BEIDE; Laden baut die Map.
    _savePinnedManifest() {
        try {
            const list = [];
            for (const [worldId, e] of this.state.p2p.pinnedWorlds) {
                list.push({
                    worldId,
                    hash: e.hash,
                    label: e.label,
                    authorPubKey: e.authorPubKey || null,
                    signedAt: e.signedAt,
                    pinnedAt: e.pinnedAt,
                });
                localStorage.setItem(`anazh.pinnedSnapshot.${worldId}`, JSON.stringify(e.snapshot));
            }
            localStorage.setItem("anazh.pinnedManifest", JSON.stringify(list));
        } catch (err) {
            this.log(`Φ5 Pin-Speichern fehlgeschlagen: ${err.message}`, "WARN");
        }
    }

    // Φ5 — beim Boot die getragenen Welten zurückladen.
    _loadPinnedManifest() {
        if (!this.state.p2p) return;
        try {
            const raw = localStorage.getItem("anazh.pinnedManifest");
            if (!raw) return;
            const list = JSON.parse(raw);
            if (!Array.isArray(list)) return;
            for (const m of list) {
                if (!m || typeof m.worldId !== "string") continue;
                const snapRaw = localStorage.getItem(`anazh.pinnedSnapshot.${m.worldId}`);
                if (!snapRaw) continue;
                let snapshot;
                try {
                    snapshot = JSON.parse(snapRaw);
                } catch {
                    continue;
                }
                this.state.p2p.pinnedWorlds.set(m.worldId, {
                    worldId: m.worldId,
                    snapshot,
                    hash: m.hash || "",
                    label: m.label || m.worldId.slice(0, 16),
                    authorPubKey: m.authorPubKey || null,
                    signedAt: m.signedAt || 0,
                    pinnedAt: m.pinnedAt || Date.now(),
                });
            }
            const n = this.state.p2p.pinnedWorlds.size;
            if (n > 0) this.log(`Φ5: ${n} mitgetragene Welt(en) geladen`, "INFO");
        } catch (err) {
            this.log(`Φ5 Pin-Laden fehlgeschlagen: ${err.message}`, "WARN");
        }
    }

    // Träger-Antwort: _p2pMsgWorldRequest ruft dies, NACHDEM die Host-Wand (nur p2p.role==="host") fiel —
    // ein Mitträger mit dieser Welt im Pin antwortet mit seinem Snapshot. true = geantwortet.
    _p2pMaybeServeAsCarrier(requesterId, msg) {
        if (!this.state.p2p || !this.state.p2p.pinnedWorlds) return false;
        // Welche Welt fragt der Joiner? Der Broker-Raum ist worldId oder
        // worldId:regionKey → wir extrahieren den worldId-Teil.
        const room = String(this.state.p2p.room || "").split(":")[0];
        const wanted = (msg && typeof msg.worldId === "string" && msg.worldId) || room;
        if (!wanted) return false;
        const pin = this.state.p2p.pinnedWorlds.get(wanted);
        if (!pin) return false;
        const erbgutNein = AnazhRealm._erbgutTeilbar(pin.snapshot && pin.snapshot.worldMeta, msg);
        if (erbgutNein) {
            this.log(`Φ5 Mitträger verweigert „${pin.label}" an ${requesterId.slice(0, 8)}…: ${erbgutNein}`, "WARN");
            return false;
        }
        try {
            this._p2pSignal({
                type: "world-snapshot",
                to: requesterId,
                state: pin.snapshot,
                carrier: true,
                hash: pin.hash,
            });
            this.log(
                `Φ5 als Mitträger geantwortet: Welt „${pin.label}" an ${requesterId.slice(0, 8)}… (Hash ${pin.hash.slice(0, 8)}…)`,
                "INFO"
            );
            return true;
        } catch (err) {
            this.log(`Φ5 Carrier-Send fehlgeschlagen: ${err.message}`, "WARN");
            return false;
        }
    }

    // ===== Portal-Hallen: kuratierte Welt-Verzeichnisse als signierte Artefakte =====
    // Ein Hallen-Manifest trägt N Welt-Adressen + Label + Signatur + Provenance; beim Spawnen wird jeder
    // Eintrag ein eigenes Portal im Kreis um eine Mitte. Kein zentraler Feed: Discovery ist die Halle.

    // Signierbarer Kern einer Halle: Identität + Label + Adressen (je Eintrag kanonisch wie die Welt-
    // Adresse). Jede Änderung erfordert Neu-Signieren — die Halle bürgt für ihren Stand zur Zeit X.
    _canonicalPortalHall(h) {
        if (!h || typeof h !== "object") return "";
        const entries = (Array.isArray(h.entries) ? h.entries : [])
            .filter((e) => e && e.address)
            .map((e) => ({
                address: this._canonicalWorldAddress(e.address),
                label: String(e.label || ""),
            }));
        return JSON.stringify({
            v: 1,
            name: String(h.name || ""),
            label: String(h.label || ""),
            entries,
        });
    }

    // Halle anlegen oder ersetzen (kein DSL-Op). entries = [{ address, label? }]; jede Adresse läuft durch
    // _admitForeignWorldAddress — ein kaputter Eintrag fällt, der Rest bleibt. Liefert Halle oder Fehler.
    createPortalHall(name, label, entries) {
        const cleanName = String(name || "")
            .trim()
            .slice(0, 64);
        if (!cleanName) return { ok: false, reason: "no_name" };
        const cleanLabel = String(label || cleanName)
            .trim()
            .slice(0, 80);
        const sanitized = [];
        if (Array.isArray(entries)) {
            for (const e of entries) {
                if (!e || !e.address) continue;
                const admittedAddr = this._admitForeignWorldAddress(e.address);
                if (!admittedAddr) continue; // Sieb am Eingang
                sanitized.push({
                    address: admittedAddr,
                    label: String(e.label || admittedAddr.label || "").slice(0, 80),
                });
            }
        }
        if (!sanitized.length) return { ok: false, reason: "no_valid_entries" };
        // Caps: max 64 Adressen je Halle (eine pragmatische Wand — eine Halle
        // mit 100en Welten ist UI-feindlich + spam-anfällig; größere Sammlungen
        // sind eigene Werke, geteilt über mehrere Hallen).
        if (sanitized.length > 64) sanitized.length = 64;
        const hall = {
            name: cleanName,
            label: cleanLabel,
            entries: sanitized,
            authorPubKey: null,
            sig: null,
            signedAt: 0,
            signedHash: null,
            provenance: [],
        };
        this.state.portalHalls.set(cleanName, hall);
        this.saveState();
        return { ok: true, name: cleanName, entries: sanitized.length };
    }

    // Bestehende Halle signieren — souveräne Geste (sign_manifest) über den Kern (name+label+entries).
    // Jede spätere Änderung macht die Signatur ungültig (signedHash-Mismatch → "modified"). Async.
    async signPortalHall(name, opts) {
        const hall = this.state.portalHalls.get(String(name || ""));
        if (!hall) return { ok: false, reason: "unknown_hall" };
        const vp = this.state.vibePass;
        if (!vp || !vp.ready) return { ok: false, reason: "no_vibepass" };
        if (
            !this._sovereignGesture(
                "sign_manifest",
                {
                    what: `Portal-Halle „${hall.label}" signieren (${hall.entries.length} Adressen)`,
                    value: "deine Signatur bürgt für diese Kuration",
                    whom: "jeden, der die Halle empfängt",
                },
                opts
            )
        ) {
            return { ok: false, reason: "cancelled" };
        }
        const canonical = this._canonicalPortalHall(hall);
        const sig = await this._vibeSign(canonical);
        if (!sig) return { ok: false, reason: "sign_failed" };
        hall.sig = sig;
        hall.authorPubKey = vp.publicKeyHex;
        hall.signedHash = this._fastHash(canonical);
        hall.signedAt = Date.now();
        // R4 — Herkunftskette: ich hänge mich an.
        if (typeof this._appendProvenance === "function") {
            this._appendProvenance(hall, vp.publicKeyHex);
        }
        this.saveState();
        return { ok: true, name, authorPubKey: hall.authorPubKey };
    }

    // Φ7 — Signatur-Status einer Halle prüfen (analog verifyWorldAddress).
    // "unsigned" / "modified" / "valid" / "forged" — async.
    async verifyPortalHall(hall) {
        if (!hall || typeof hall !== "object") return "unsigned";
        if (!hall.sig || !hall.authorPubKey) return "unsigned";
        const canonical = this._canonicalPortalHall(hall);
        if (hall.signedHash && this._fastHash(canonical) !== hall.signedHash) {
            return "modified";
        }
        const ok = await this._vibeVerify(canonical, hall.sig, hall.authorPubKey);
        return ok ? "valid" : "forged";
    }

    // Der EINE Eingang für fremde Hallen (Bibliothek, p2p, Snapshot): Struktur + R4-Wand, jede Adresse
    // durch _admitForeignWorldAddress; Unbekanntes reist (must-preserve). Liefert Halle oder null.
    _admitForeignPortalHall(rawHall) {
        if (!rawHall || typeof rawHall !== "object") return null;
        const name = typeof rawHall.name === "string" ? rawHall.name.trim().slice(0, 64) : "";
        if (!name) return null;
        // R4-Sieb: revozierte Herkunft fällt am Eingang.
        if (typeof this._artifactProvenanceTainted === "function" && this._artifactProvenanceTainted(rawHall)) {
            return null;
        }
        const rawEntries = Array.isArray(rawHall.entries) ? rawHall.entries : [];
        const entries = [];
        for (const e of rawEntries) {
            if (!e || !e.address) continue;
            const addr = this._admitForeignWorldAddress(e.address);
            if (!addr) continue;
            entries.push({ address: addr, label: String(e.label || addr.label || "").slice(0, 80) });
            if (entries.length >= 64) break;
        }
        if (!entries.length) return null;
        const out = {
            name,
            label: typeof rawHall.label === "string" ? rawHall.label.slice(0, 80) : name,
            entries,
            authorPubKey: null,
            sig: null,
            signedAt: 0,
            signedHash: null,
            provenance: [],
        };
        // Signatur-Hülle (must-ignore: kaputte Hex bleibt einfach unsigniert).
        if (
            typeof rawHall.authorPubKey === "string" &&
            /^[0-9a-f]{64}$/i.test(rawHall.authorPubKey) &&
            typeof rawHall.sig === "string" &&
            /^[0-9a-f]{2,256}$/i.test(rawHall.sig)
        ) {
            out.authorPubKey = rawHall.authorPubKey.toLowerCase();
            out.sig = rawHall.sig;
            out.signedAt = typeof rawHall.signedAt === "number" ? rawHall.signedAt : 0;
            if (typeof rawHall.signedHash === "string") out.signedHash = rawHall.signedHash;
        }
        // Provenance reist must-preserve (R4 sanitize); ein leerer Eingang
        // wird zur leeren Kette.
        if (typeof this._sanitizeProvenance === "function") {
            out.provenance = this._sanitizeProvenance(rawHall.provenance);
        }
        return out;
    }

    // Halle MATERIALISIEREN: N Portale als eigene Architektur-Entries im Kreis um position (Radius ∝ √N);
    // jedes trägt seine Adresse in portalMeta.worldAddress → Hindurchgehen zeigt die Bestätigungs-Karte
    // (_enterPortalToAddress). opts.portalBlueprint, Default portal_torus. Liefert die Entry-IDs.
    materializePortalHall(name, position, opts = {}) {
        const hall = this.state.portalHalls.get(String(name || ""));
        if (!hall) return { ok: false, reason: "unknown_hall" };
        if (!position || typeof position.x !== "number") {
            return { ok: false, reason: "no_position" };
        }
        const portalType = String(opts.portalBlueprint || "portal_torus");
        if (!this.state.blueprints || !this.state.blueprints[portalType]) {
            return { ok: false, reason: "no_portal_blueprint", needed: portalType };
        }
        const n = hall.entries.length;
        if (!n) return { ok: false, reason: "empty_hall" };
        // Kreis-Anordnung: Radius wächst mit √N (sodass das Auge die Halle
        // immer scannen kann — n=4 → ~3m, n=16 → ~6m, n=64 → ~12m).
        const radius = Math.max(2.5, 1.5 * Math.sqrt(n));
        const spawned = [];
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * Math.PI * 2;
            const ex = position.x + Math.cos(angle) * radius;
            const ez = position.z + Math.sin(angle) * radius;
            const ey = typeof position.y === "number" ? position.y : 0;
            const entry = this.spawnArchitecture(portalType, { x: ex, y: ey, z: ez }, { precise: true });
            if (!entry) continue;
            // Die Adresse sitzt am ENTRY (eigener portalMeta-Slot, vom enterPortal-Pfad gelesen), nicht am
            // Bauplan — sonst trügen alle Slot-Portale dieselbe Adresse.
            entry.portalMeta = {
                worldAddress: hall.entries[i].address,
                label: hall.entries[i].label,
                hallName: hall.name,
            };
            spawned.push(entry.id);
        }
        this.log(
            `Φ7 Halle „${hall.label}" materialisiert: ${spawned.length} Tore im Kreis (Radius ${radius.toFixed(1)}m)`,
            "INFO"
        );
        return { ok: true, name: hall.name, spawned, radius };
    }

    // Φ7 — die LISTE-API: welche Hallen kennen wir? Für UI + Tests.
    listPortalHalls() {
        const out = [];
        for (const [name, h] of this.state.portalHalls) {
            out.push({
                name,
                label: h.label,
                entries: h.entries.length,
                authorPubKey: h.authorPubKey || null,
                signed: !!h.sig,
                signedAt: h.signedAt || 0,
            });
        }
        return out;
    }

    // ===== Compute-Spende: das verteilte Immunsystem (Geschenk, keine Rechen-Währung) =====
    // (a) Chunk-Resultate: signiert + Bit-Hash + Stichproben-Verify gegen die LOKAL nachgerechnete
    // Wahrheit (verifizieren kostet einen Build, keine Suche — Schummler fallen auf, R4 revoziert).
    // (b) Playtest-Läufe: signiert + Commit + Resultat.
    // Beide laufen durch den EINEN _admitForeign...-Vertrag; persistiert im Snapshot (~10 KiB/100).

    // Φ6 — der kanonische Hash einer Compute-JOB-SPEC. Form: kind +
    // worldSeed + die kind-spezifischen Inputs (z.B. chunk: {cx, cz, lod}).
    // Deterministisch über die FROZEN-Reihenfolge der Felder.
    _computeJobInputHash(spec) {
        if (!spec || typeof spec !== "object") return null;
        const kind = String(spec.kind || "");
        if (!kind) return null;
        const worldSeed = String(spec.worldSeed || "");
        const canonical = JSON.stringify({
            v: 1,
            kind,
            worldSeed,
            ...(kind === "chunk-density"
                ? { cx: Number(spec.cx) || 0, cz: Number(spec.cz) || 0, lod: Number(spec.lod) || 0 }
                : { input: spec.input || null }),
        });
        return this._fastHash(canonical);
    }

    // Bit-stabiler Output-Hash eines Chunk-Mesh: FNV-1a über die Positionen, auf 4 Dezimalen gerundet
    // (~0.1 mm — feiner als die Surface-Nets-Granularität, robust gegen Float-Drift).
    _computeChunkOutputHash(meshData) {
        if (!meshData || !meshData.mesh) return null;
        const geom = meshData.mesh.geometry;
        if (!geom) return null;
        const pos = geom.getAttribute && geom.getAttribute("position");
        if (!pos || !pos.array) return null;
        const arr = pos.array;
        // Nur jedes 4. Triplet hashen (~6k von ~24k Vertices/Chunk) — schnell und noch sensitiv; auch eine
        // verschobene Vertex-Reihenfolge ändert den Hash.
        let h = 0x811c9dc5;
        const step = 12; // alle 4 Vertices (3 floats × 4)
        for (let i = 0; i < arr.length; i += step) {
            // Auf 4 Dezimalen runden + als String hashen (deterministisch).
            const s = arr[i].toFixed(4) + "," + (arr[i + 1] || 0).toFixed(4) + "," + (arr[i + 2] || 0).toFixed(4);
            for (let j = 0; j < s.length; j++) {
                h ^= s.charCodeAt(j);
                h = Math.imul(h, 0x01000193);
            }
        }
        return (h >>> 0).toString(16).padStart(8, "0");
    }

    // Compute-Contribution signieren — souveräne Geste (sign_manifest). Kern {v:1, inputHash, outputHash}:
    // der Anbieter bürgt „für diese Spec dieses Resultat". opts.skipConfirm für Tests.
    async signComputeContribution(inputHash, outputHash, opts) {
        if (!inputHash || !outputHash) return { ok: false, reason: "no_hash" };
        const vp = this.state.vibePass;
        if (!vp || !vp.ready) return { ok: false, reason: "no_vibepass" };
        if (
            !this._sovereignGesture(
                "sign_manifest",
                {
                    what: `Compute-Resultat (${String(inputHash).slice(0, 8)}…) bürgen`,
                    value: `Ergebnis-Hash ${String(outputHash).slice(0, 8)}…`,
                    whom: "jeden, der den Spec re-rechnet",
                },
                opts
            )
        ) {
            return { ok: false, reason: "cancelled" };
        }
        const canonical = JSON.stringify({ v: 1, inputHash, outputHash });
        const sig = await this._vibeSign(canonical);
        if (!sig) return { ok: false, reason: "sign_failed" };
        return { ok: true, sig, authorPubKey: vp.publicKeyHex, signedAt: Date.now() };
    }

    // Fremde Compute-Contribution prüfen — drei Wände: (1) Struktur (Hex-Form von Hash + sig),
    // (2) R4: Anbieter nicht revoziert, (3) Signatur deckt {inputHash, outputHash}.
    // Admittiert als "unverified"; eine spätere Stichprobe wandelt zu "verified" oder "forged".
    _admitForeignComputeContribution(raw) {
        if (!raw || typeof raw !== "object") return null;
        const inputHash = typeof raw.inputHash === "string" ? raw.inputHash.trim() : "";
        const outputHash = typeof raw.outputHash === "string" ? raw.outputHash.trim() : "";
        const providedBy = typeof raw.providedBy === "string" ? raw.providedBy.toLowerCase() : "";
        const sig = typeof raw.sig === "string" ? raw.sig.trim() : "";
        if (!inputHash || !outputHash) return null;
        if (!/^[0-9a-f]{4,64}$/i.test(inputHash) || !/^[0-9a-f]{4,64}$/i.test(outputHash)) return null;
        if (providedBy && !/^[0-9a-f]{64}$/.test(providedBy)) return null;
        if (sig && !/^[0-9a-f]{2,256}$/.test(sig)) return null;
        // R4-Sieb: revozierte Herkunft fällt am Eingang.
        if (providedBy && this.state.revokedKeys && this.state.revokedKeys.has(providedBy)) {
            return null;
        }
        return {
            inputHash,
            outputHash,
            providedBy: providedBy || null,
            sig: sig || null,
            providedAt: typeof raw.providedAt === "number" ? raw.providedAt : Date.now(),
            status: "unverified",
        };
    }

    // Gespendete Contribution annehmen + im Pool speichern (Signatur async verifiziert). Gleicher
    // inputHash mit anderem outputHash als eine "verified" → die NEUE ist "forged", der Anbieter wird
    // revoziert (R4). Cap 256 Einträge, FIFO.
    async pinComputeContribution(raw) {
        const admitted = this._admitForeignComputeContribution(raw);
        if (!admitted) return { ok: false, reason: "invalid" };
        // Sig-Check (async, nicht-blockierend für die Annahme — der Status
        // wandert über die Stichproben-Verify weiter; eine forged Signatur
        // wird DIREKT als „forged" markiert).
        if (admitted.sig && admitted.providedBy) {
            try {
                const canonical = JSON.stringify({
                    v: 1,
                    inputHash: admitted.inputHash,
                    outputHash: admitted.outputHash,
                });
                const ok = await this._vibeVerify(canonical, admitted.sig, admitted.providedBy);
                if (!ok) {
                    admitted.status = "forged";
                    // R4: der Schummler-Schlüssel fällt für ALLES, was er bürgt.
                    if (typeof this.revokeKey === "function") this.revokeKey(admitted.providedBy);
                }
            } catch {
                /* defensive: ein Wurf am Verify lässt status auf "unverified" */
            }
        }
        // Konfliktprüfung gegen bestehende „verified"-Form derselben Spec.
        const existing = this.state.computeContributions.get(admitted.inputHash);
        if (
            existing &&
            existing.status === "verified" &&
            existing.outputHash !== admitted.outputHash &&
            admitted.status !== "forged"
        ) {
            admitted.status = "forged";
            if (admitted.providedBy && typeof this.revokeKey === "function") {
                this.revokeKey(admitted.providedBy);
            }
        }
        // Cap (256, FIFO): die ÄLTESTE „unverified"/„fresh" fällt zuerst.
        if (this.state.computeContributions.size >= 256 && !this.state.computeContributions.has(admitted.inputHash)) {
            // ältesten Eintrag finden (Map ist Insertion-ordered).
            const firstKey = this.state.computeContributions.keys().next().value;
            if (firstKey) this.state.computeContributions.delete(firstKey);
        }
        this.state.computeContributions.set(admitted.inputHash, admitted);
        return { ok: true, status: admitted.status, inputHash: admitted.inputHash };
    }

    // Stichproben-Wand: den Chunk frisch LOKAL rechnen (bewusst sync — eine Stichprobe, nicht je Frame),
    // hashen, vergleichen: "unverified" → "verified" | "forged". Liefert {ok, status, equal}.
    verifyComputeContribution(spec, contribution) {
        if (!contribution) return { ok: false, reason: "no_contribution" };
        if (String(spec.kind || "") !== "chunk-density") {
            return { ok: false, reason: "unsupported_kind" };
        }
        // Spec-Hash gegen Eintrag prüfen (man kann nicht den falschen Spec
        // gegen eine fremde Contribution verifizieren).
        const specHash = this._computeJobInputHash(spec);
        if (specHash !== contribution.inputHash) return { ok: false, reason: "spec_mismatch" };
        // Frisch rechnen + Hash bilden.
        let localHash = null;
        try {
            const result = this._buildVoxelChunkData(spec.cx, spec.cz, spec.lod || 0);
            localHash = this._computeChunkOutputHash(result);
            // Aufräumen (Mesh-Heap nicht aufblasen).
            if (result && result.mesh && result.mesh.geometry) {
                try {
                    result.mesh.geometry.dispose();
                    if (result.mesh.material && result.mesh.material.dispose) result.mesh.material.dispose();
                } catch {
                    /* defensive */
                }
            }
        } catch (err) {
            this._stoffBruch("die Chunk-Rechnung der Prüfung", err);
            return { ok: false, reason: "local_compute_failed", error: err.message };
        }
        if (!localHash) return { ok: false, reason: "local_hash_failed" };
        const equal = localHash === contribution.outputHash;
        contribution.status = equal ? "verified" : "forged";
        if (!equal && contribution.providedBy && typeof this.revokeKey === "function") {
            // R4-Eskalation: ein nachweislich falsches Resultat → Anbieter revoziert.
            this.revokeKey(contribution.providedBy);
        }
        return { ok: true, status: contribution.status, equal, localHash };
    }

    // Φ6 — LESE-API: was ist im Pool? Für UI + Tests.
    listComputeContributions(opts) {
        const out = [];
        for (const [inputHash, c] of this.state.computeContributions) {
            if (opts && opts.status && c.status !== opts.status) continue;
            out.push({
                inputHash,
                outputHash: c.outputHash,
                providedBy: c.providedBy,
                providedAt: c.providedAt,
                status: c.status,
            });
        }
        return out;
    }

    // Φ6 (b) — eine PLAYTEST-Lauf SIGNIEREN. Der Anbieter bürgt: „ich lief
    // playtest auf commit X mit Resultat Y". SOUVERÄN (sign_manifest).
    async signPlaytestRun(run, opts) {
        if (!run || typeof run !== "object") return { ok: false, reason: "no_run" };
        const commit = String(run.commit || "")
            .trim()
            .slice(0, 64);
        const version = String(run.version || "")
            .trim()
            .slice(0, 32);
        const result = String(run.result || "")
            .trim()
            .slice(0, 16);
        const total = Number.isFinite(run.total) ? Math.max(0, Math.floor(run.total)) : 0;
        if (!commit || !version || !result) return { ok: false, reason: "incomplete" };
        const vp = this.state.vibePass;
        if (!vp || !vp.ready) return { ok: false, reason: "no_vibepass" };
        if (
            !this._sovereignGesture(
                "sign_manifest",
                {
                    what: `Playtest-Lauf bürgen (commit ${commit.slice(0, 8)}…)`,
                    value: `Resultat „${result}", ${total} Invarianten`,
                    whom: "die Gesundheit des Ultiversums",
                },
                opts
            )
        ) {
            return { ok: false, reason: "cancelled" };
        }
        const canonical = JSON.stringify({ v: 1, commit, version, result, total });
        const sig = await this._vibeSign(canonical);
        if (!sig) return { ok: false, reason: "sign_failed" };
        return {
            ok: true,
            run: {
                commit,
                version,
                result,
                total,
                providedBy: vp.publicKeyHex,
                signedAt: Date.now(),
                sig,
            },
        };
    }

    // Fremden Playtest-Lauf admittieren: Hex + R4 + Sig-Check + Cap (64, FIFO). Das Aggregat je Commit
    // ist Ledger-Fakt, kein Belohnungs-Algorithmus.
    async recordPlaytestRun(raw) {
        if (!raw || typeof raw !== "object") return { ok: false, reason: "invalid" };
        const commit = typeof raw.commit === "string" ? raw.commit.trim().slice(0, 64) : "";
        const version = typeof raw.version === "string" ? raw.version.trim().slice(0, 32) : "";
        const result = typeof raw.result === "string" ? raw.result.trim().slice(0, 16) : "";
        const total = Number.isFinite(raw.total) ? Math.max(0, Math.floor(raw.total)) : 0;
        const providedBy = typeof raw.providedBy === "string" ? raw.providedBy.toLowerCase() : "";
        const sig = typeof raw.sig === "string" ? raw.sig.trim() : "";
        const signedAt = Number.isFinite(raw.signedAt) ? raw.signedAt : 0;
        if (!commit || !version || !result) return { ok: false, reason: "incomplete" };
        if (providedBy && !/^[0-9a-f]{64}$/.test(providedBy)) return { ok: false, reason: "bad_key" };
        if (sig && !/^[0-9a-f]{2,256}$/.test(sig)) return { ok: false, reason: "bad_sig" };
        if (providedBy && this.state.revokedKeys && this.state.revokedKeys.has(providedBy)) {
            return { ok: false, reason: "revoked" };
        }
        // Sig-Verify (asynchron — eine falsche Sig fällt sofort).
        if (sig && providedBy) {
            const canonical = JSON.stringify({ v: 1, commit, version, result, total });
            try {
                const ok = await this._vibeVerify(canonical, sig, providedBy);
                if (!ok) return { ok: false, reason: "forged_sig" };
            } catch {
                return { ok: false, reason: "verify_failed" };
            }
        }
        // Dedup: derselbe Anbieter darf denselben Commit nur EINMAL bürgen.
        for (let i = 0; i < this.state.playtestContributions.length; i++) {
            const e = this.state.playtestContributions[i];
            if (e.commit === commit && e.providedBy === providedBy) {
                // Update (neuere Signatur ersetzt ältere).
                this.state.playtestContributions[i] = { commit, version, result, total, providedBy, signedAt, sig };
                return { ok: true, updated: true, commit, providedBy };
            }
        }
        // Cap (64, FIFO): die ÄLTESTE fällt zuerst.
        if (this.state.playtestContributions.length >= 64) {
            this.state.playtestContributions.shift();
        }
        this.state.playtestContributions.push({ commit, version, result, total, providedBy, signedAt, sig });
        return { ok: true, commit, providedBy };
    }

    // Aggregat: wie viele unabhängige Peers haben diesen Commit grün signiert (verteilte CI als Geschenk).
    listPlaytestContributions(commit) {
        const c = String(commit || "").trim();
        const out = this.state.playtestContributions.slice();
        return c ? out.filter((e) => e.commit === c) : out;
    }

    // Welt-Adresse in ein Portal einlegen (portalMeta.worldAddress am Bauplan). Bewusst KEIN DSL-Op — kein
    // Skript kann den Spieler umleiten. Leeres Argument löscht (altes Welt-Tor, kein Auto-Join);
    // Validierung über _admitForeignWorldAddress.
    setPortalAddress(blueprintName, address) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return { ok: false, reason: "unknown_blueprint" };
        if (!bp.portalMeta) bp.portalMeta = {};
        if (!address) {
            delete bp.portalMeta.worldAddress;
            this.saveState();
            return { ok: true, cleared: true };
        }
        const admitted = this._admitForeignWorldAddress(address);
        if (!admitted) return { ok: false, reason: "invalid_address" };
        bp.portalMeta.worldAddress = admitted;
        this.saveState();
        return { ok: true, address: admitted };
    }

    // Legt die signierte Adresse der AKTIVEN Welt (state.worldMeta.worldAddress, von signWorldAddress) in
    // das Portal: der Host signiert seine Welt einmal und trägt sie in beliebig viele Portale.
    setPortalToActiveWorld(blueprintName) {
        const addr = this.state.worldMeta && this.state.worldMeta.worldAddress;
        if (!addr) return { ok: false, reason: "no_signed_address" };
        return this.setPortalAddress(blueprintName, addr);
    }

    // Φ2 — Sichtbarkeits-Stufe der aktiven Welt setzen. Strukturell R2 (kein
    // DSL-Op). Migration-tolerant: ein Legacy-"private" wird beim Lesen still
    // zu "privat" — der Setter schreibt die kanonische Form.
    setWorldVisibility(stufe) {
        const canonical = this._normalizeWorldVisibility(stufe);
        if (!canonical) return { ok: false, reason: "unknown_stage" };
        if (!this.state.worldMeta) return { ok: false, reason: "no_world" };
        this.state.worldMeta.visibility = canonical;
        // Lobby-Bridge: nur "gelistet" → publiziert. Andere Stufen un-publishen
        // einen evtl. noch publizierten Raum, damit die Wand nicht-leck ist. Kein typeof-Schutz: er verbarg den
        // falschen Namen `unpublishLobby` — eine private Welt blieb in der Lobby (D3c-pt1, 17.10.).
        if (canonical === "gelistet") {
            const label = this.state.worldMeta.slug || String(this.state.worldMeta.worldId).slice(0, 16);
            this.publishToLobby(label);
        } else {
            this.unpublishFromLobby();
        }
        this.saveState();
        return { ok: true, visibility: canonical };
    }

    // Φ2 — Gast-Rechte der aktiven Welt setzen. Strukturell R2 (kein DSL-Op).
    setWorldGuestRights(stufe) {
        const canonical = this._normalizeGuestRights(stufe);
        if (!canonical) return { ok: false, reason: "unknown_stage" };
        if (!this.state.worldMeta) return { ok: false, reason: "no_world" };
        this.state.worldMeta.guestRights = canonical;
        this.saveState();
        return { ok: true, guestRights: canonical };
    }

    // Φ2 — der Migrations-Helfer: liest jeden bisherigen Wert zur kanonischen
    // 4-Stufen-Form. "private" (englisch, Legacy-Default) → "privat".
    _normalizeWorldVisibility(stufe) {
        const s = String(stufe || "")
            .trim()
            .toLowerCase();
        if (s === "private") return "privat";
        return AnazhRealm.WORLD_VISIBILITY_STAGES.includes(s) ? s : null;
    }

    _normalizeGuestRights(stufe) {
        const s = String(stufe || "")
            .trim()
            .toLowerCase();
        return AnazhRealm.WORLD_GUEST_RIGHTS_STAGES.includes(s) ? s : null;
    }

    // Hausrecht: Peer (Session) bannen (kein DSL-Op). peerId-Bann läuft mit der Sitzung, vibePassKey-Bann
    // ist dauerhaft (der Schlüssel ist die Identität) — beide zusammen = volle Reichweite. Idempotent.
    banPeer(peerId) {
        const pid = String(peerId || "").trim();
        if (!pid) return { ok: false, reason: "no_peer" };
        if (!this.state.worldMeta) return { ok: false, reason: "no_world" };
        if (!this.state.worldMeta.banList) this.state.worldMeta.banList = { peerIds: [], vibePassKeys: [] };
        const list = this.state.worldMeta.banList.peerIds;
        if (!list.includes(pid)) list.push(pid);
        // Sofort kicken (wenn online): wir senden ihm einen leave-Hint und
        // schließen unsererseits den RTC-Kanal. Der signaling-server bleibt
        // ehrlich (er KENNT keine banList — die Wand lebt am Client-Sieb).
        this.kickPeer(pid);
        this.saveState();
        return { ok: true, peerId: pid };
    }

    unbanPeer(peerId) {
        const pid = String(peerId || "").trim();
        if (!pid) return { ok: false, reason: "no_peer" };
        const bl = this.state.worldMeta && this.state.worldMeta.banList;
        if (!bl || !Array.isArray(bl.peerIds)) return { ok: true, peerId: pid, present: false };
        const before = bl.peerIds.length;
        bl.peerIds = bl.peerIds.filter((p) => p !== pid);
        this.saveState();
        return { ok: true, peerId: pid, present: bl.peerIds.length < before };
    }

    // vibePass-Schlüssel (Hex, 64 Zeichen, erzwungen wie _normalizePubKey) dauerhaft bannen. Ist er
    // gerade angemeldet, fliegen alle peerIds, deren vibe-Bindung verifiziert auf ihn zeigt (p2p.peers).
    banVibePassKey(keyHex) {
        const normalized = this._normalizePubKey(keyHex);
        if (!normalized) return { ok: false, reason: "invalid_key" };
        if (!this.state.worldMeta) return { ok: false, reason: "no_world" };
        if (!this.state.worldMeta.banList) this.state.worldMeta.banList = { peerIds: [], vibePassKeys: [] };
        const list = this.state.worldMeta.banList.vibePassKeys;
        if (!list.includes(normalized)) list.push(normalized);
        // Sofort kicken: alle verifizierten peerIds mit dieser vibePass-Bindung.
        const peers = this.state.p2p && this.state.p2p.peers;
        if (peers && typeof peers.forEach === "function") {
            peers.forEach((entry, pid) => {
                if (!entry || !entry.vibePassId || !entry.vibeVerified) return;
                const k = this._normalizePubKey(entry.vibePassId);
                if (k === normalized) this.kickPeer(pid);
            });
        }
        this.saveState();
        return { ok: true, key: normalized };
    }

    unbanVibePassKey(keyHex) {
        const normalized = this._normalizePubKey(keyHex);
        if (!normalized) return { ok: false, reason: "invalid_key" };
        const bl = this.state.worldMeta && this.state.worldMeta.banList;
        if (!bl || !Array.isArray(bl.vibePassKeys)) return { ok: true, key: normalized, present: false };
        const before = bl.vibePassKeys.length;
        bl.vibePassKeys = bl.vibePassKeys.filter((k) => k !== normalized);
        this.saveState();
        return { ok: true, key: normalized, present: bl.vibePassKeys.length < before };
    }

    // Peer aus der laufenden Sitzung werfen (kein Bann — Re-Connect möglich): schließt den RTC-Kanal
    // (state.p2p.rtcPeers) und nimmt ihn aus dem Peer-Register. Ban + Kick laufen beide durch
    // _isPeerBanned. Kein DSL-Op.
    kickPeer(peerId) {
        const pid = String(peerId || "").trim();
        if (!pid) return { ok: false, reason: "no_peer" };
        const p2p = this.state.p2p;
        if (!p2p) return { ok: false, reason: "no_p2p" };
        // RTC-Kanal schließen, falls offen (W7 P1 — rtcPeers trägt {channel, pc}).
        const rtc = p2p.rtcPeers && p2p.rtcPeers.get ? p2p.rtcPeers.get(pid) : null;
        if (rtc) {
            try {
                if (rtc.channel) rtc.channel.close();
            } catch {
                /* defensive */
            }
            try {
                if (rtc.pc) rtc.pc.close();
            } catch {
                /* defensive */
            }
            p2p.rtcPeers.delete(pid);
        }
        // Lokale Mesh-Lebenszeit-Spuren entfernen (analog peer-leave-Empfang).
        if (typeof this._p2pRemovePeer === "function") {
            try {
                this._p2pRemovePeer(pid);
            } catch {
                /* defensive */
            }
        }
        return { ok: true, peerId: pid };
    }

    // Φ2 — das EINE Sieb: ist dieser Peer (peerId + ggf. vibePassKey) in
    // unserem worldMeta.banList? Der Konsument: jeder Join-Pfad, bevor er
    // einen Snapshot/State an einen Peer schickt; auch das P2P-Welcome.
    _isPeerBanned(peerId, vibePassKey) {
        const bl = this.state.worldMeta && this.state.worldMeta.banList;
        if (!bl) return false;
        if (peerId && Array.isArray(bl.peerIds) && bl.peerIds.includes(String(peerId))) return true;
        if (vibePassKey) {
            const k = this._normalizePubKey(vibePassKey);
            if (k && Array.isArray(bl.vibePassKeys) && bl.vibePassKeys.includes(k)) return true;
        }
        return false;
    }

    // Lädt die signierten Welten aus dem GLOBALEN localStorage-Schlüssel.
    // Defensiv: jeder Eintrag muss strukturell plausibel sein (Hex-Form),
    // sonst wird er verworfen — die echte Verifikation macht verifyWorldSignature.
    _loadSignedWorlds() {
        const out = {};
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.signedWorlds") : null;
            if (!raw) return out;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object") return out;
            for (const id of Object.keys(parsed)) {
                const e = parsed[id];
                if (
                    e &&
                    typeof e.signature === "string" &&
                    /^[0-9a-f]{2,256}$/i.test(e.signature) &&
                    typeof e.authorPubKey === "string" &&
                    /^[0-9a-f]{64}$/i.test(e.authorPubKey)
                ) {
                    const entry = {
                        authorPubKey: e.authorPubKey,
                        signature: e.signature,
                        signedHash: typeof e.signedHash === "string" ? e.signedHash : "",
                        signedAt: typeof e.signedAt === "number" ? e.signedAt : 0,
                        // G8 R4 (M4a) — die Herkunftskette überlebt den Rundlauf.
                        provenance: this._sanitizeProvenance(e.provenance),
                    };
                    // G8 R4 (M4b) — der RÜCKRUF beim Laden: ein Artefakt mit
                    // einem revozierten Schlüssel in seiner Kette fällt weg.
                    if (this._artifactProvenanceTainted(entry)) continue;
                    out[id] = entry;
                }
            }
        } catch {
            /* korrupter Eintrag → leere Map, kein Wurf */
        }
        return out;
    }

    _saveSignedWorlds() {
        try {
            if (typeof localStorage !== "undefined") {
                localStorage.setItem("anazh.signedWorlds", JSON.stringify(this.state.signedWorlds || {}));
            }
        } catch (e) {
            this.log(`signedWorlds-Speichern fehlgeschlagen: ${e && e.message}`, "WARN");
        }
    }

    // ===== Immunsystem: Herkunftskette + Rückruf =====
    // Eine Signatur beweist „berührt", nicht „verbürgt" — darum reist die ganze KETTE (Ursprung · über
    // dich), sonst tarnt sich eine Infektion als dein Gütesiegel. Revoziert ein Schlüssel, fällt beim
    // Laden jedes Artefakt mit ihm in der Kette (reversibel, kein zentraler Prüfer).

    // Normalisiert einen Pubkey (akzeptiert "ed25519:<hex>" oder rohen Hex) →
    // 64-stelliger Kleinbuchstaben-Hex oder null. Die EINE Form für die Kette.
    _normalizePubKey(k) {
        let s = String(k || "").trim();
        if (s.indexOf("ed25519:") === 0) s = s.slice(8);
        s = s.toLowerCase();
        return /^[0-9a-f]{64}$/.test(s) ? s : null;
    }

    // revokedKeys ist eine Map (wie state.socialRatings) — nie als plain Object lesen, .has() braucht die
    // Map. Persistiert als flaches JSON-Object; alte und neue Speicherstände laden wortgleich.
    _loadRevokedKeys() {
        const out = new Map();
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.revokedKeys") : null;
            if (!raw) return out;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object") return out;
            for (const k of Object.keys(parsed)) {
                const norm = this._normalizePubKey(k);
                if (norm) out.set(norm, { at: typeof parsed[k] === "number" ? parsed[k] : Date.now() });
            }
        } catch {
            /* korrupter Eintrag → leere Map, kein Wurf */
        }
        return out;
    }

    _saveRevokedKeys() {
        try {
            if (typeof localStorage !== "undefined") {
                const flat = {};
                const rk = this.state.revokedKeys;
                if (rk && typeof rk.forEach === "function") {
                    rk.forEach((v, k) => {
                        flat[k] = (v && v.at) || Date.now();
                    });
                }
                localStorage.setItem("anazh.revokedKeys", JSON.stringify(flat));
            }
        } catch (e) {
            this.log(`revokedKeys-Speichern fehlgeschlagen: ${e && e.message}`, "WARN");
        }
    }

    _isKeyRevoked(pubkeyHex) {
        const norm = this._normalizePubKey(pubkeyHex);
        return !!(norm && this.state.revokedKeys && this.state.revokedKeys.has(norm));
    }

    // Schlüssel revozieren: jedes Artefakt mit ihm in der Herkunftskette fällt JETZT (lokaler Durchlauf)
    // und bleibt beim Laden gesiebt. Bewusst KEINE souveräne Aktion (berührt nicht DEINEN Schlüssel).
    // Gibt die Zahl der ausgestoßenen Artefakte.
    revokeKey(pubkey, opts) {
        opts = opts || {};
        const norm = this._normalizePubKey(pubkey);
        if (!norm) return { ok: false, reason: "invalid_key" };
        if (!this.state.revokedKeys) this.state.revokedKeys = new Map();
        this.state.revokedKeys.set(norm, { at: Date.now() });
        this._saveRevokedKeys();
        const purged = this._purgeRevokedArtifacts();
        if (!opts.silent && typeof this.journalAppend === "function") {
            this.journalAppend(
                "ritual",
                AnazhRealm._datum`Ich rief einen Schlüssel zurück (${this._vibeFingerprint(norm)}) — ${purged} Artefakt(e) ausgestoßen.`
            );
        }
        return { ok: true, key: norm, purged };
    }

    unrevokeKey(pubkey) {
        const norm = this._normalizePubKey(pubkey);
        if (!norm || !this.state.revokedKeys || !this.state.revokedKeys.has(norm)) return { ok: false };
        this.state.revokedKeys.delete(norm);
        this._saveRevokedKeys();
        return { ok: true, key: norm };
    }

    // M4a — die Herkunftskette eines Artefakts (Welt-Manifest / Bauplan): ein
    // geordnetes Array {by, at}. [0] ist der URSPRUNG (Schöpfer/Erst-Signierer),
    // die folgenden sind Überträger (wer es weiterreichte). Defensiv-gesäubert.
    _sanitizeProvenance(raw) {
        if (!Array.isArray(raw)) return [];
        const out = [];
        for (const link of raw) {
            if (!link || typeof link !== "object") continue;
            const by = this._normalizePubKey(link.by);
            if (!by) continue;
            out.push({ by, at: typeof link.at === "number" ? link.at : 0 });
            // der Fork der Bibliothek nennt je Glied den Code des Vorgängers
            if (typeof link.code === "string" && /^[0-9a-f]{64}$/.test(link.code)) out[out.length - 1].code = link.code;
            if (out.length >= 16) break; // gedeckelt — kein unbegrenztes Wachsen
        }
        return out;
    }

    // M4a — den eigenen Pubkey an die Kette anhängen (Ursprung wenn leer, sonst
    // Überträger). Dedup: wenn ich schon der LETZTE Eintrag bin, kein Doppel.
    _appendProvenance(artifact, pubkeyHex) {
        if (!artifact || typeof artifact !== "object") return;
        const by = this._normalizePubKey(pubkeyHex);
        if (!by) return;
        let chain = this._sanitizeProvenance(artifact.provenance);
        const last = chain.length ? chain[chain.length - 1] : null;
        if (!last || last.by !== by) {
            if (chain.length < 16) chain.push({ by, at: Date.now() });
        }
        artifact.provenance = chain;
    }

    // M4b — ist ein Artefakt durch einen revozierten Schlüssel in seiner Kette
    // (oder seinem Signierer) vergiftet? Dann fällt es weg.
    _artifactProvenanceTainted(artifact) {
        if (!artifact || typeof artifact !== "object") return false;
        if (artifact.authorPubKey && this._isKeyRevoked(artifact.authorPubKey)) return true;
        const chain = Array.isArray(artifact.provenance) ? artifact.provenance : [];
        for (const link of chain) {
            if (link && this._isKeyRevoked(link.by)) return true;
        }
        return false;
    }

    // M4b — den lokalen Bestand gegen die Rückruf-Liste sieben (signedWorlds +
    // customWorlds + eigene Baupläne). Gibt die Zahl der ausgestoßenen Artefakte.
    _purgeRevokedArtifacts() {
        let purged = 0;
        const sw = this.state.signedWorlds || {};
        for (const id of Object.keys(sw)) {
            if (this._artifactProvenanceTainted(sw[id])) {
                delete sw[id];
                purged++;
            }
        }
        const cw = this.state.customWorlds || {};
        for (const id of Object.keys(cw)) {
            if (this._artifactProvenanceTainted(cw[id])) {
                delete cw[id];
                purged++;
            }
        }
        const bp = this.state.blueprints || {};
        for (const name of Object.keys(bp)) {
            const b = bp[name];
            if (b && !b.builtIn && b.signature && this._artifactProvenanceTainted(b)) {
                // Der Bauplan bleibt (er ist Spieler-Werk), aber seine vergiftete
                // Signatur/Herkunft fällt — er wird wieder „unsigniert".
                delete b.signature;
                delete b.authorPubKey;
                delete b.signedHash;
                delete b.provenance;
                purged++;
            }
        }
        if (purged > 0) {
            this._saveSignedWorlds();
            this._saveCustomWorlds();
            if (typeof this.saveState === "function") this.saveState();
        }
        return purged;
    }

    // M4a — eine lesbare Zusammenfassung der Herkunft (für die Spec-Card / das
    // Portal): Ursprung vs. „über dich" vs. „von dir". Macht den Unterschied
    // zwischen Echtheit und Gutartigkeit SICHTBAR.
    _provenanceSummary(artifact) {
        const chain = this._sanitizeProvenance(artifact && artifact.provenance);
        const myKey = this.state.vibePass && this.state.vibePass.publicKeyHex;
        if (!chain.length)
            return { chain: [], origin: "", label: "", tainted: this._artifactProvenanceTainted(artifact) };
        const originKey = chain[0].by;
        const lastKey = chain[chain.length - 1].by;
        const originIsMe = myKey && originKey === myKey;
        const lastIsMe = myKey && lastKey === myKey;
        const fp = (k) => (myKey && k === myKey ? "dir" : this._vibeFingerprint(k));
        let label;
        if (chain.length === 1) {
            label = originIsMe ? "von dir" : `von ${fp(originKey)}`;
        } else {
            label = `Ursprung ${fp(originKey)} · ${lastIsMe ? "über dich" : "über " + fp(lastKey)}`;
        }
        return {
            chain,
            origin: fp(originKey),
            originKey,
            label,
            passers: chain.length - 1,
            tainted: this._artifactProvenanceTainted(artifact),
        };
    }

    // Versiegelt eine registrierte Welt mit dem Vibe-Pass. Async (ed25519).
    // G8 R2 (M3) — sign_manifest, eine SOUVERÄNE Aktion (über die Host-Geste).
    async signWorld(worldId, opts) {
        const key = String(worldId || "")
            .trim()
            .toLowerCase();
        const entry = AnazhRealm.WORLD_REGISTRY[key];
        if (!entry) return { ok: false, reason: "world_unknown" };
        const vp = this.state.vibePass;
        if (!vp || !vp.ready) return { ok: false, reason: "no_vibepass" };
        if (
            !this._sovereignGesture(
                "sign_manifest",
                {
                    what: `Welt „${entry.label || key}" signieren`,
                    value: "deine Signatur bürgt dafür",
                    whom: "jeden, der sie empfängt",
                },
                opts
            )
        ) {
            return { ok: false, reason: "cancelled" };
        }
        const canonical = this._canonicalManifest(entry);
        const sig = await this._vibeSign(canonical);
        if (!sig) return { ok: false, reason: "sign_failed" };
        if (!this.state.signedWorlds) this.state.signedWorlds = {};
        // G8 R4 (M4a) — eine schon vorhandene Herkunftskette (eine empfangene,
        // weitergereichte Welt) bewahren; ich hänge mich an.
        const priorChain = this.state.signedWorlds[key] && this.state.signedWorlds[key].provenance;
        this.state.signedWorlds[key] = {
            authorPubKey: vp.publicKeyHex,
            signature: sig,
            signedHash: this._fastHash(canonical),
            signedAt: Date.now(),
            provenance: this._sanitizeProvenance(priorChain),
        };
        this._appendProvenance(this.state.signedWorlds[key], vp.publicKeyHex);
        this._saveSignedWorlds();
        this.journalAppend("ritual", AnazhRealm._datum`Ich veröffentlichte die ${entry.label} mit meinem Vibe-Pass.`, {
            world: key,
        });
        return { ok: true, authorPubKey: vp.publicKeyHex };
    }

    // Prüft den Signatur-Status einer Welt — vier Stufen, exakt wie
    // verifyBlueprintSignature: unsigned / valid / modified / forged.
    // Async (ed25519-Verifikation). Defensiv: kein Wurf bei Müll-Eingabe.
    async verifyWorldSignature(worldId) {
        const key = String(worldId || "")
            .trim()
            .toLowerCase();
        const entry = this._worldEntry(key);
        if (!entry) return "unsigned";
        // Eine importierte Welt (customWorlds) trägt ihre Signatur SELBST —
        // manifest-getragen, vom Autor; eine Built-in-Welt wird heimat-seitig
        // signiert (signedWorlds, W14 P2). Beide laufen durch dieselbe Prüfung.
        const custom = this.state.customWorlds && this.state.customWorlds[key];
        const sig = custom && custom.signature ? custom : this.state.signedWorlds && this.state.signedWorlds[key];
        if (!sig || !sig.signature || !sig.authorPubKey) return "unsigned";
        const canonical = this._canonicalManifest(entry);
        if (sig.signedHash && this._fastHash(canonical) !== sig.signedHash) return "modified";
        const ok = await this._vibeVerify(canonical, sig.signature, sig.authorPubKey);
        return ok ? "valid" : "forged";
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_netz_identitaet]);

// ===== ATLAS · Netz/identitaet — Außen-Konstanten =====
// G8 R0 (Robustheits-Bogen) — der INNERSTE
// RING benannt: die „Feinstrukturkonstante" des Ultiversums. Diese state-Slots
// (Identität + Signatur-/Autorisierungs-Autorität) sind ABWESEND aus der Welt
// der Welten — NIE in einem Welt-Snapshot, NIE in einem Portal-Payload, NIE
// über P2P. Der private ed25519-Schlüssel selbst lebt nur im globalen
// localStorage ("anazh.vibePass") + dem Datei-Backup; sein Fußabdruck sind
// 6 Methoden (_ensureVibePass/_adoptVibePassJwk/_vibeSign/_vibePassExportObject/
// _persistVibePass/importVibePass). _sovereignStateAudit() beweist die Trennung
// headless. Die Liste ist EINGEFROREN + winzig — sie wächst nicht (die
// eBPF-Lehre: ein wachsender Kern ist die Angriffsfläche). revokedKeys (R4) ist
// ebenso global + nie im Snapshot — der Rückruf-Schlüssel des Immunsystems.
AnazhRealm.SOVEREIGN_STATE = Object.freeze({
    // runtime-state-Slots, die NIE in buildStateSnapshot dürfen (GEMESSEN
    // schon ausgeschlossen — der fixe Key-Satz trägt keinen davon):
    excludedStateKeys: Object.freeze(["vibePass", "p2p", "signedWorlds", "customWorlds", "revokedKeys"]),
    // die globalen localStorage-Schlüssel des innersten Rings (privat, nie geteilt):
    privateStorageKeys: Object.freeze(["anazh.vibePass"]),
    // Schlüssel-Material-Feldnamen, die in KEINEM geteilten Kanal lecken dürfen:
    privateFields: Object.freeze(["privateKey", "_privateKeyJwk", "privateKeyJwk"]),
});
// SOVEREIGN_ACTIONS — die eingefrorene Irreversibilitäts-Wand: Akte, die den innersten Ring
// berühren, verlangen eine FRISCHE Mensch-Geste (Host-gerendert, außerhalb jedes iframes) und sind
// NIE automatisch auslösbar (Welt, LLM, Regel, Fluss). DISJUNKT von dslEffects ∪
// NON_BROADCASTABLE_OPS ∪ dslComposeAtomic ∪ Regel-Effekten (headless bewiesen).
// `reveal_private_key` existiert bewusst NICHT. Die Liste bleibt winzig (ein wachsender Prüfer ist
// Angriffsfläche); wallet_transfer/grant_capability sind vorab eingefroren, damit kein künftiger Op
// sie in den DSL-/Broadcast-/Regel-Pool schmuggelt.
AnazhRealm.SOVEREIGN_ACTIONS = Object.freeze([
    "wallet_transfer",
    "sign_manifest",
    "change_identity",
    "grant_capability",
]);
// Sichtbarkeits-Stufen der Welten (eingefroren, jeder Wert exakt eines der Wörter).
// _normalizeWorldVisibility heilt die Legacy-Form "private" → "privat" beim Lesen; geschrieben wird
// nur die kanonische Form.
AnazhRealm.WORLD_VISIBILITY_STAGES = Object.freeze(["privat", "einladung", "verlinkt", "gelistet"]);
AnazhRealm.WORLD_GUEST_RIGHTS_STAGES = Object.freeze(["frieden", "pfad", "mitschöpfer"]);
// Voxel-Chunk-Span ist FROZEN (43.2 m, _voxelChunkConfig); Region = 8×43.2 = 345.6 m.
AnazhRealm.REGION_SPAN_M = 345.6;
AnazhRealm.REGION_HYSTERESIS_M = 10;
// DIE BIBLIOTHEK: die Decke je Eintrag (Bytes der Hülle — ein Gesetz wiegt Kilobytes, ein Mesh nie) und ihr Speicher-Schlüssel.
AnazhRealm.BIBLIOTHEK = Object.freeze({ max: 8192, speicher: "anazh.bibliothek" });
// DER WERK-CODE (Teilen in EINER Geste, Werk und Welt): Präfix, Decke (ein Werk reist in ≤ 4 KB), Abstand vor der Pose des
// Empfängers und je Wand der Satz des Spielers (`empfangeWerk` nennt jede Absage beim Namen — der Schlüssel ist der Kopf des Grunds).
AnazhRealm.WERK_CODE = Object.freeze({
    praefix: "anazh-werk:",
    max: 4096,
    abstand: 12,
    grund: Object.freeze({
        kein_code: "das ist kein Werk-Code",
        gross: "der Code ist größer als 4 KB",
        kaputt: "der Code ist beschädigt",
        version: "der Code spricht eine fremde Version",
        op: "der Code trägt ein Verb, das ein geteiltes Werk nie trägt",
        form: "das Programm hat nicht die Form eines Werks",
        name: "der Name ist kein Bauplan-Name",
        same: "der Same ist keine ganze Zahl",
        drehung: "die Drehung ist keine Zahl",
        unbekannt: "diese Welt kennt den Bauplan nicht",
        builtin: "ein fremder Bauplan überschreibt keinen der Welt",
        teile: "ein Teil steht nicht im Bau-Vertrag",
        regler: "der Stempel trägt einen Regler, den das Studio nicht ausweist",
        band: "ein Regler liegt außerhalb seines Bands",
        buch: "das Studio-Buch ist noch nicht geladen",
        unsigniert: "der Code ist nicht signiert",
        signatur: "die Signatur passt nicht zum Werk",
        steht_nicht: "das Werk fand an deiner Pose keinen Grund",
        adresse: "die Welt-Adresse ist ungültig",
        beitritt: "die Welt des Gastgebers kam nicht an",
    }),
});

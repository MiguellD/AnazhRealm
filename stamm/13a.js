class AnazhRealm_Z13a {
    // ===== ATLAS §13 · IDENTITÄT/WELTEN/SOZIAL — Vibe-Pass · Bibliothek/Feed · Zeugnisse · Welt-Manifest =====
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
    // (docs/world-portal.md §3.3: "authorPubKey": "ed25519:...").
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
                    `Der Avatar empfing seinen Vibe-Pass — eine souveräne Identität, ` +
                        `ein Schlüssel, der nur ihm gehört (${vp.fingerprint}).`,
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
                `Ein Vibe-Pass wurde wiederhergestellt — meine Identität ist nun ${this.state.vibePass.fingerprint}.`
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
        this.journalAppend("ritual", `Ich versiegelte „${bp.label || name}" mit meinem Vibe-Pass.`, {
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
        const broker = (opts && opts.broker) || p2p.url || AnazhRealm.P2P_DEFAULT_WS_URL || "";
        const roomId = (opts && opts.roomId) || (p2p.roomOverride || "").trim() || String(wm.worldId);
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
        // worldId-Form (analog buildInvitationCode): 4..80 Zeichen, kein /
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
        // einen evtl. noch publizierten Raum, damit die Wand nicht-leck ist.
        if (canonical === "gelistet" && typeof this.publishToLobby === "function") {
            const label = this.state.worldMeta.slug || String(this.state.worldMeta.worldId).slice(0, 16);
            this.publishToLobby(label);
        } else if (canonical !== "gelistet" && typeof this.unpublishLobby === "function") {
            this.unpublishLobby();
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
                `Ich rief einen Schlüssel zurück (${this._vibeFingerprint(norm)}) — ${purged} Artefakt(e) ausgestoßen.`
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
        this.journalAppend("ritual", `Ich veröffentlichte die ${entry.label} mit meinem Vibe-Pass.`, {
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

    // ### Fremde Welten empfangen ###
    // Ein Spieler exportiert das signierte Manifest einer Welt, ein anderer importiert es; die Signatur
    // reist mit (world-portal.md §3.3). Das ist die Metadaten-/Provenienz-Schicht der Bibliothek.

    // Built-in-Registry + importierte Welten als EINE Lookup-Quelle.
    _worldEntry(id) {
        const key = String(id || "")
            .trim()
            .toLowerCase();
        return AnazhRealm.WORLD_REGISTRY[key] || (this.state.customWorlds && this.state.customWorlds[key]) || null;
    }

    // Die ganze Bibliothek als Array — Built-ins zuerst, dann Importierte.
    _libraryWorlds() {
        const out = Object.values(AnazhRealm.WORLD_REGISTRY);
        const custom = this.state.customWorlds || {};
        for (const id of Object.keys(custom)) out.push(custom[id]);
        return out;
    }

    // EIN Welt-Lese-Vektor für viele Leser (Spec-Card · Such-Filter · Sortierung · Fokus), Muster wie
    // `_creatureProfile`/`_selfProfile`: Identität · Trust · Multiplayer/Server · DSL · Stufe · Herkunft ·
    // Signatur-Präsenz + Such-Index. Read-only; alle Achsen sind reale customWorlds/WORLD_REGISTRY-Felder.
    _worldProfile(world) {
        const w = world || {};
        const id = String(w.id || "");
        const isImported = !!(this.state.customWorlds && this.state.customWorlds[id]);
        const dsl = Array.isArray(w.dsl) ? w.dsl : [];
        const prof = {
            world: w,
            id,
            label: w.label || id || "?",
            desc: typeof w.desc === "string" ? w.desc : "",
            worldPath: w.world || "",
            dsl,
            hasDsl: dsl.length > 0,
            trust: w.trust === "sandboxed" ? "sandboxed" : "trusted",
            multiplayer: w.multiplayer === true,
            // W18-B — die Welt deklariert das Ko-Präsenz-Protokoll (AnazhRealm
            // injiziert die Augen: ihr seht euch in ihr, obwohl sie selbst
            // keine Mitspieler kennt).
            coPresence: w.coPresence === true,
            serverMode: w.serverMode === "js-compute" ? "js-compute" : "relay",
            imported: isImported,
            translated: isImported && w.translated === true,
            vendored: isImported && w.vendored === true,
            scene: w.scene || null,
            reachable: w.reachable !== false,
            importedAt: Number.isFinite(w.importedAt) ? w.importedAt : 0,
            authorPubKey: typeof w.authorPubKey === "string" ? w.authorPubKey : "",
            signature: typeof w.signature === "string" ? w.signature : "",
        };
        // G8 R4 (M4a) — die Herkunftskette als Lese-Feld: macht „über dich" vs.
        // „von dir" sichtbar (Echtheit ≠ Gutartigkeit). Eine Signatur beweist nur
        // Berührung; die Kette zeigt, WOHER das Werk wirklich stammt.
        prof.provenance = this._provenanceSummary(w);
        prof.tainted = prof.provenance.tainted;
        // Stufe — wie heute (hasDsl → „übersetzt", sonst „ausgestellt"); die Marke „nativ"
        // emergiert erst beim Betreten (W12 P3).
        prof.stage = prof.hasDsl ? "übersetzt" : "ausgestellt";
        prof.stageTitle = prof.hasDsl
            ? "Diese Welt versteht ein DSL-Vokabular (Stufe übersetzt). Beim Betreten kann sie es nativ bestätigen."
            : "Diese Welt ist spielbar, aber stumm gegenüber der DSL.";
        // Herkunfts-Marke — die Klassen-Hooks bleiben (.library-vendored-/translated-/imported-mark, Tests).
        if (prof.vendored) {
            prof.origin = "angedockt";
            prof.originClass = "library-vendored-mark";
            prof.originTitle =
                "Diese Welt dockte über den Auto-Vendor an — ihr Bündel liegt in worlds/, sie läuft sandgesichert (W15 Phase 1).";
        } else if (prof.translated) {
            prof.origin = "KI-übersetzt";
            prof.originClass = "library-translated-mark";
            prof.originTitle =
                "Diese Welt übersetzte der KI-Übersetzer aus einer Beschreibung in ein Portal-Manifest (Phase 1).";
        } else if (prof.imported) {
            prof.origin = "empfangen";
            prof.originClass = "library-imported-mark";
            prof.originTitle = "Diese Welt kam als signiertes Manifest in deine Bibliothek (W14 Phase 3).";
        } else {
            prof.origin = "";
            prof.originClass = "";
            prof.originTitle = "";
        }
        // Such-Index — Name · Vokabular · Trust/Signatur/Netz-Schlagworte (treibt das Bib-D-Filter).
        prof.searchText = [
            prof.label,
            prof.desc,
            dsl.join(" "),
            prof.trust === "sandboxed" ? "sandbox sandboxed" : "vertraut trusted",
            prof.multiplayer ? "multiplayer" : "einzelwelt",
            prof.coPresence ? "ko-präsenz copresence gemeinsam" : "",
            prof.serverMode === "js-compute" ? "js-compute" : "",
            prof.signature ? "signiert signed" : "unsigniert",
            prof.origin,
        ]
            .join(" ")
            .toLowerCase();
        return prof;
    }

    // Lädt die importierten Welten aus dem GLOBALEN localStorage-Schlüssel.
    // Defensiv: jeder Eintrag läuft durch _sanitizeImportedManifest — ein
    // korruptes Manifest wird verworfen, nie ein Wurf.
    _loadCustomWorlds() {
        const out = {};
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.customWorlds") : null;
            if (!raw) return out;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object") return out;
            for (const id of Object.keys(parsed)) {
                const clean = this._sanitizeImportedManifest(parsed[id]);
                // G8 R4 (M4b) — der RÜCKRUF beim Laden: eine Welt mit einem
                // revozierten Schlüssel irgendwo in ihrer Herkunftskette (oder
                // als Signierer) fällt weg — die Infektion ist ausgestoßen.
                if (clean && !this._artifactProvenanceTainted(clean)) out[clean.id] = clean;
            }
        } catch {
            /* korrupte Map → leer, kein Wurf */
        }
        return out;
    }

    _saveCustomWorlds() {
        try {
            if (typeof localStorage !== "undefined") {
                localStorage.setItem("anazh.customWorlds", JSON.stringify(this.state.customWorlds || {}));
            }
        } catch (e) {
            this.log(`customWorlds-Speichern fehlgeschlagen: ${e && e.message}`, "WARN");
        }
    }

    // Säubert ein importiertes Manifest auf eine sichere customWorlds-Form: id op-förmig und NIE eine
    // Built-in-Welt überschreibend; world durch _sanitizePortalMeta (same-origin worlds/-Pfad), dsl durch
    // _sanitizeDslSubset, Signatur hex-geprüft. null bei Unbrauchbarem; `reachable` bleibt erhalten.
    _sanitizeImportedManifest(m) {
        if (!m || typeof m !== "object") return null;
        const id = String(m.id || "")
            .trim()
            .toLowerCase();
        if (!/^[a-z0-9_-]{1,40}$/.test(id)) return null;
        if (AnazhRealm.WORLD_REGISTRY[id]) return null; // kein Built-in-Override
        const meta = this._sanitizePortalMeta(
            { world: m.world, label: m.label, dsl: m.dsl, trust: m.trust },
            typeof m.label === "string" ? m.label : id
        );
        const out = {
            id,
            label: meta.label,
            world: meta.world,
            dsl: meta.dsl ? meta.dsl.slice() : [],
            desc: typeof m.desc === "string" ? m.desc.slice(0, 240) : "",
            reachable: m.reachable === true,
            importedAt: typeof m.importedAt === "number" ? m.importedAt : Date.now(),
            // trust muss den localStorage-Rundlauf überleben, sonst verliert eine vendorte Welt ihre Sandbox.
            // _sanitizePortalMeta whitelistet (Default "trusted", nur "sandboxed" kommt durch).
            trust: meta.trust,
        };
        if (
            typeof m.authorPubKey === "string" &&
            /^[0-9a-f]{64}$/i.test(m.authorPubKey) &&
            typeof m.signature === "string" &&
            /^[0-9a-f]{2,256}$/i.test(m.signature)
        ) {
            out.authorPubKey = m.authorPubKey;
            out.signature = m.signature;
            out.signedHash = typeof m.signedHash === "string" ? m.signedHash : "";
            out.signedAt = typeof m.signedAt === "number" ? m.signedAt : 0;
        }
        // G8 R4 (M4a) — die mitgereiste Herkunftskette bewahren (gesäubert): der
        // Empfänger sieht „Ursprung X · über dich" statt nur deiner Signatur, und
        // der Rückruf (M4b) kann an JEDEM Glied der Kette greifen.
        const chain = this._sanitizeProvenance(m.provenance);
        if (chain.length) out.provenance = chain;
        // KI-Übersetzer Phase 1 — eine übersetzte Welt trägt eine Marke, die
        // den localStorage-Rundlauf überleben muss (sonst verlöre sie nach
        // dem Reload ihren „übersetzt"-Status).
        if (m.translated === true) {
            out.translated = true;
            out.translatedAt = typeof m.translatedAt === "number" ? m.translatedAt : Date.now();
        }
        // KI-Übersetzer Phase 2 — eine aufgebaute Welt trägt ihre deklarative
        // Szene; sie läuft beim Laden erneut durch _sanitizeWorldScene (die
        // Wand gilt auch für den localStorage-Rundlauf).
        if (m.scene && typeof m.scene === "object") {
            out.scene = this._sanitizeWorldScene(m.scene);
        }
        // Vendorte Welt (Bündel in worlds/<id>/) ist IMMER sandgesichert (null-origin): `vendored` erzwingt
        // trust:"sandboxed" — auch ein manipulierter Manifest-Eintrag kann das nicht aufweichen.
        if (m.vendored === true) {
            out.vendored = true;
            out.vendoredAt = typeof m.vendoredAt === "number" ? m.vendoredAt : Date.now();
            out.trust = "sandboxed";
            // W16 Phase 2 — der Content-Hash gibt der Welt eine peer-
            // unabhängige Identität (Welt-Katalog-Dedup). Er muss den
            // localStorage-Rundlauf überleben (V8.59-Lehre).
            if (typeof m.bundleHash === "string" && /^[0-9a-f]{1,64}$/i.test(m.bundleHash)) {
                out.bundleHash = m.bundleHash.toLowerCase();
            }
        }
        // multiplayer + serverMode (relay = Default, Mesh broadcastet · js-compute = ein Peer hostet die
        // autoritative Server-JS) müssen den localStorage-Rundlauf überleben und über aimBlueprintAtWorld ins
        // portalMeta fließen — sonst lädt ein geholtes Portal ohne Transport-Shim bzw. nicht als js-compute.
        out.serverMode = m.serverMode === "js-compute" ? "js-compute" : "relay";
        // Eine js-compute-Welt ist per Natur mehrspielerfähig — die Marke
        // koppelt mit (wie _sanitizePortalMeta es im portalMeta erzwingt).
        if (m.multiplayer === true || out.serverMode === "js-compute") out.multiplayer = true;
        // W18-B — die Ko-Präsenz-Deklaration überlebt den Rundlauf (V8.59):
        // ein geholtes Portal dieser Welt injiziert die Pose-Schicht.
        if (m.coPresence === true) out.coPresence = true;
        // must-preserve (taille-spec §2): Unbekanntes überlebt die Sanitize-Wand als OPAKES Datum;
        // _carryUnknown trägt nur, was nicht in MANIFEST_KNOWN_KEYS steht — die Sicherheits-Felder bleiben
        // sanitisiert.
        this._carryUnknown(m, out, AnazhRealm.MANIFEST_KNOWN_KEYS);
        return out;
    }

    // W14 Phase 3 — eine Welt teilen: ihr signiertes Manifest als Datei
    // exportieren (das §3.3-Manifest, jetzt mit authorPubKey + signature). Die
    // Welt muss signiert sein — ohne Signatur gäbe es keine Provenienz.
    exportWorldManifest(worldId) {
        const key = String(worldId || "")
            .trim()
            .toLowerCase();
        const entry = this._worldEntry(key);
        if (!entry) return { ok: false, reason: "world_unknown" };
        const custom = this.state.customWorlds && this.state.customWorlds[key];
        const sig = custom && custom.signature ? custom : this.state.signedWorlds && this.state.signedWorlds[key];
        if (!sig || !sig.signature || !sig.authorPubKey) return { ok: false, reason: "not_signed" };
        const manifest = {
            schemaVersion: "1.0",
            id: entry.id,
            label: entry.label,
            desc: entry.desc || "",
            world: entry.world,
            dsl: Array.isArray(entry.dsl) ? entry.dsl.slice() : [],
            // W17 — die Multiplayer-Marke reist mit dem geteilten Manifest
            // (Metadaten, nicht signierte Substanz — wie world-Pfad/desc).
            multiplayer: entry.multiplayer === true,
            // W18-B — die Ko-Präsenz-Marke reist mit (Metadaten wie multiplayer).
            coPresence: entry.coPresence === true,
            // W17 P-Vendor — der Server-Modus reist mit dem geteilten Manifest.
            serverMode: entry.serverMode === "js-compute" ? "js-compute" : "relay",
            authorPubKey: sig.authorPubKey,
            signature: sig.signature,
            signedHash: sig.signedHash || "",
            signedAt: sig.signedAt || 0,
            // Die ganze Herkunftskette reist (Ursprung + Überträger): beim Teilen hänge ich mich als Überträger
            // an, wenn ich nicht der Ursprung bin („über dich" vs. „von dir"). Metadaten, nicht Substanz.
            provenance: this._sanitizeProvenance(sig.provenance),
        };
        const myKey = this.state.vibePass && this.state.vibePass.publicKeyHex;
        if (myKey) this._appendProvenance(manifest, myKey);
        this.triggerStateDownload(manifest, `anazh-welt-${entry.id}.json`);
        this.journalAppend("share", `Ich teilte die ${entry.label} — ihr signiertes Manifest ging hinaus.`, {
            world: entry.id,
        });
        return { ok: true, id: entry.id, manifest };
    }

    // Fremdes Welt-Manifest empfangen: säubern, mitgereiste Signatur verifizieren, per fetch prüfen, ob
    // die Welt-Dateien erreichbar sind (sonst browsbar, nicht betretbar), in customWorlds legen.
    async importWorldManifest(parsed) {
        const clean = this._sanitizeImportedManifest(parsed);
        if (!clean) {
            // id-Kollision mit einer Built-in-Welt sauberer melden.
            const rawId = parsed && typeof parsed === "object" ? String(parsed.id || "").toLowerCase() : "";
            if (rawId && AnazhRealm.WORLD_REGISTRY[rawId]) return { ok: false, reason: "id_is_builtin" };
            return { ok: false, reason: "invalid_manifest" };
        }
        // Erreichbarkeit prüfen: lädt der world-Pfad? (same-origin worlds/-Pfad).
        let reachable = false;
        try {
            const res = await fetch(clean.world, { method: "GET" });
            reachable = !!(res && res.ok);
        } catch {
            reachable = false;
        }
        clean.reachable = reachable;
        // Signatur-Status (manifest-getragen).
        let signatureStatus = "unsigned";
        if (clean.signature && clean.authorPubKey) {
            const canonical = this._canonicalManifest(clean);
            if (clean.signedHash && this._fastHash(canonical) !== clean.signedHash) {
                signatureStatus = "modified";
            } else {
                signatureStatus = (await this._vibeVerify(canonical, clean.signature, clean.authorPubKey))
                    ? "valid"
                    : "forged";
            }
        }
        if (!this.state.customWorlds) this.state.customWorlds = {};
        this.state.customWorlds[clean.id] = clean;
        this._saveCustomWorlds();
        this.journalAppend("growth", `Eine fremde Welt fand den Weg in deine Bibliothek: „${clean.label}".`, {
            world: clean.id,
            signature: signatureStatus,
        });
        return { ok: true, id: clean.id, signatureStatus, reachable };
    }

    // ### KI-Übersetzer: fremde Welt → Portal-Manifest ###
    // Der LLM-Output ist DATEN, nie Code: per JSON.parse gelesen (nie eval/Function) und durch
    // _sanitizeImportedManifest gesäubert — dieselbe Wand wie der Manifest-Import.

    // Der System-Prompt des Übersetzers — er weist das LLM an, eine frei
    // beschriebene Welt ins schlanke Portal-Manifest zu übersetzen.
    _buildTranslatorPrompt() {
        return [
            "Du bist der KI-Übersetzer von AnazhRealm — einem Tor zu fremden Vibecode-Welten.",
            "Übersetze eine frei beschriebene fremde Welt (ein Three.js-Projekt, eine Engine,",
            "ein Repo, ein Browser-Spiel) in ein Portal-Manifest, damit AnazhRealm sie in seine",
            "Bibliothek aufnehmen kann.",
            "",
            "Antworte mit GENAU EINEM JSON-Objekt — kein weiterer Text, kein say-Feld, kein",
            "program-Array, keine Erklärung. Genau diese vier Felder:",
            '{ "id": "<slug>", "label": "<Titel>", "desc": "<Text>", "dsl": ["wort", "..."] }',
            "",
            "  id    — nur a-z 0-9 - _, 1-40 Zeichen, aus dem Welt-Namen abgeleitet.",
            "  label — kurzer menschenlesbarer Name.",
            "  desc  — 1-2 Sätze, was die Welt ist (höchstens ~200 Zeichen).",
            "  dsl   — DSL-Vokabular: die Befehle, die die Welt sinnvoll verstehen würde,",
            "          abgeleitet aus ihren Mechaniken (Wetter -> set_weather, Voxel ->",
            "          place_block, Fluid -> inject_fluid, Terrain -> set_terrain_seed).",
            "          Jedes Wort ausschliesslich Kleinbuchstaben und Unterstriche.",
            "",
            "Gib KEINEN world-Pfad an — die Engine-Dateien werden separat vendort.",
            "Vermeide die ids fluid, terrain und skeleton (schon vergeben).",
            "Ist die Beschreibung knapp, rate trotzdem ein stimmiges Manifest.",
        ].join("\n");
    }

    // Manifest aus der rohen LLM-Antwort: <think>-Reasoning + Markdown-Fences entfernen, das erste {…} per
    // JSON.parse lesen (nie eval/Function). Objekt oder null, kein Wurf; spiegelt llmParseResponse.
    _parseManifestResponse(raw) {
        if (typeof raw !== "string" || !raw.trim()) return null;
        let text = raw.trim();
        text = text.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, "").trim();
        const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (fence) text = fence[1].trim();
        const objMatch = text.match(/\{[\s\S]*\}/);
        if (!objMatch) return null;
        try {
            const obj = JSON.parse(objMatch[0]);
            return obj && typeof obj === "object" && !Array.isArray(obj) ? obj : null;
        } catch {
            return null;
        }
    }

    // Frei beschriebene Welt → Portal-Manifest über llmCall (derselbe Transport wie Welt-Grok + Persona),
    // gesäubert per _sanitizeImportedManifest. Liefert nur eine VORSCHAU ({ok, manifest});
    // erst acceptTranslatedManifest trägt sie in die Bibliothek.
    async translateWorldManifest(description) {
        const desc = String(description || "").trim();
        if (desc.length < 12) return { ok: false, reason: "description_too_short" };
        if (desc.length > 4000) return { ok: false, reason: "description_too_long" };
        const parsed = await this.llmCall(desc, this._buildTranslatorPrompt());
        // Ein reiner llmCall-Fehler (kein API-Key, LLM aus, HTTP-Fehler) hat
        // kein raw — direkt durchreichen. Kam eine Antwort, trägt sie raw.
        if (parsed && parsed.error && !parsed.raw) return { ok: false, reason: parsed.error };
        const obj = this._parseManifestResponse((parsed && parsed.raw) || "");
        if (!obj) return { ok: false, reason: "no_manifest_in_response" };
        const clean = this._sanitizeImportedManifest(obj);
        if (!clean) {
            const rawId = typeof obj.id === "string" ? obj.id.trim().toLowerCase() : "";
            if (rawId && AnazhRealm.WORLD_REGISTRY[rawId]) return { ok: false, reason: "id_is_builtin" };
            return { ok: false, reason: "invalid_manifest" };
        }
        return { ok: true, manifest: clean };
    }

    // Übersetztes (ggf. nachjustiertes) Manifest aufnehmen, markiert `translated` + `reachable:false` —
    // ohne Körper ist die Welt browsbar, nicht betretbar (kein totes Portal versprechen).
    acceptTranslatedManifest(manifest) {
        const src = manifest && typeof manifest === "object" ? manifest : {};
        const clean = this._sanitizeImportedManifest(
            Object.assign({}, src, { translated: true, translatedAt: Date.now(), reachable: false })
        );
        if (!clean) {
            const rawId = typeof src.id === "string" ? src.id.trim().toLowerCase() : "";
            if (rawId && AnazhRealm.WORLD_REGISTRY[rawId]) return { ok: false, reason: "id_is_builtin" };
            return { ok: false, reason: "invalid_manifest" };
        }
        if (!this.state.customWorlds) this.state.customWorlds = {};
        this.state.customWorlds[clean.id] = clean;
        this._saveCustomWorlds();
        this.journalAppend("growth", `Der KI-Übersetzer trug eine Welt in deine Bibliothek: „${clean.label}".`, {
            world: clean.id,
        });
        return { ok: true, id: clean.id, label: clean.label };
    }

    // ### KI-Übersetzer: die Welt bekommt einen Körper ###
    // Der LLM übersetzt die Welt in eine deklarative SZENE (Daten, kein Code); der generische Renderer in
    // worlds/translated/ baut jede solche Szene. NIE läuft LLM-Code — nur eine gedeckelte Szene wird
    // gerendert.

    // Säubert eine LLM-Szene auf eine IMMER renderbare Form: Farben strikt #rrggbb, Zahlen geclampt,
    // Listen gedeckelt, Aufzählungen gegen Whitelist, fehlende Felder → Default. Die Sicherheits-Wand: der
    // LLM kann per Konstruktion nur eine harmlose Szene liefern.
    _sanitizeWorldScene(raw) {
        const src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
        const hex = (v, fallback) => {
            const m = /^#?([0-9a-fA-F]{6})$/.exec(String(v == null ? "" : v).trim());
            return m ? "#" + m[1].toLowerCase() : fallback;
        };
        const num = (v, lo, hi, fb) => {
            const n = Number(v);
            return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fb;
        };
        const SHAPES = ["box", "sphere", "cone", "cylinder", "torus", "octahedron"];
        const GROUND = ["flat", "hills", "water", "void"];
        const AMBIENT = ["none", "snow", "embers", "motes", "rain"];
        const sky = src.sky && typeof src.sky === "object" ? src.sky : {};
        const ground = src.ground && typeof src.ground === "object" ? src.ground : {};
        const light = src.light && typeof src.light === "object" ? src.light : {};
        const ambient = src.ambient && typeof src.ambient === "object" ? src.ambient : {};
        const objects = [];
        if (Array.isArray(src.objects)) {
            for (const o of src.objects) {
                if (!o || typeof o !== "object") continue;
                objects.push({
                    shape: SHAPES.includes(o.shape) ? o.shape : "box",
                    color: hex(o.color, "#8a6a3a"),
                    count: Math.round(num(o.count, 1, 140, 12)),
                    area: num(o.area, 3, 130, 40),
                    size: num(o.size, 0.2, 14, 2),
                    height: num(o.height, -25, 45, 0),
                    spin: o.spin === true,
                    float: o.float === true,
                });
                if (objects.length >= 14) break;
            }
        }
        const dslEffects = {};
        if (src.dslEffects && typeof src.dslEffects === "object") {
            let n = 0;
            for (const op of Object.keys(src.dslEffects)) {
                if (!/^[a-z_]{1,40}$/.test(op)) continue;
                const e = src.dslEffects[op];
                if (!e || typeof e !== "object") continue;
                const eff = {
                    fogShift: num(e.fogShift, -1, 1, 0),
                    lightShift: num(e.lightShift, -1, 1, 0),
                    burst: Math.round(num(e.burst, 0, 50, 0)),
                };
                const skyHex = hex(e.sky, null);
                if (skyHex) eff.sky = skyHex;
                dslEffects[op] = eff;
                if (++n >= 32) break;
            }
        }
        return {
            sky: { top: hex(sky.top, "#2a3a6a"), bottom: hex(sky.bottom, "#c8b88a") },
            fog: hex(src.fog, "#9aa6c0"),
            ground: {
                color: hex(ground.color, "#3a6a3a"),
                style: GROUND.includes(ground.style) ? ground.style : "flat",
            },
            light: { color: hex(light.color, "#ffe9c8"), intensity: num(light.intensity, 0, 2, 1) },
            objects,
            ambient: {
                kind: AMBIENT.includes(ambient.kind) ? ambient.kind : "motes",
                color: hex(ambient.color, "#ffffff"),
            },
            dslEffects,
        };
    }

    // Der System-Prompt des Szenen-Übersetzers — er weist das LLM an, eine
    // Welt in eine deklarative Szene zu übersetzen (Daten, kein Code).
    _buildSceneTranslatorPrompt() {
        return [
            "Du baust für AnazhRealm die SZENE einer fremden Welt — eine deklarative",
            "Beschreibung, die der generische 3D-Renderer der Bibliothek aufbaut. Das",
            "Manifest (Identität + Vokabular) steht schon; jetzt gib der Welt einen Körper.",
            "",
            "Antworte mit GENAU EINEM JSON-Objekt — kein weiterer Text, keine Erklärung:",
            "{",
            '  "sky":    { "top": "#rrggbb", "bottom": "#rrggbb" },',
            '  "fog":    "#rrggbb",',
            '  "ground": { "color": "#rrggbb", "style": "flat" | "hills" | "water" | "void" },',
            '  "light":  { "color": "#rrggbb", "intensity": 0.0-2.0 },',
            '  "objects": [',
            '    { "shape": "box"|"sphere"|"cone"|"cylinder"|"torus"|"octahedron",',
            '      "color": "#rrggbb", "count": 1-140, "area": 3-130, "size": 0.2-14,',
            '      "height": -25..45, "spin": true|false, "float": true|false }',
            "  ],",
            '  "ambient": { "kind": "none"|"snow"|"embers"|"motes"|"rain", "color": "#rrggbb" },',
            '  "dslEffects": { "<wort>": { "sky": "#rrggbb", "fogShift": -1..1, "lightShift": -1..1, "burst": 0-50 } }',
            "}",
            "",
            "Waehle Farben + Formen, die die beschriebene Welt einfangen — eine Lava-Welt",
            "glueht rot, eine Eis-Welt schimmert blau-weiss, ein Wald ist gruen + dicht.",
            "objects sind verstreute Form-Gruppen (count Stueck, im Radius area um die",
            "Mitte). dslEffects gibt jedem Wort aus dem Vokabular eine sichtbare Wirkung",
            "(sky faerbt den Himmel, fogShift verdichtet/lichtet den Nebel, lightShift",
            "hellt auf/ab, burst wirft Partikel aus). Alle Farben strikt #rrggbb.",
        ].join("\n");
    }

    // KI-Übersetzer Phase 2 — eine übersetzte Welt in eine deklarative Szene
    // übersetzen. Ruft das LLM über llmCall (derselbe Transport), liest die
    // Szene per _parseManifestResponse, säubert sie per _sanitizeWorldScene.
    async translateWorldScene(world) {
        const w = world && typeof world === "object" ? world : {};
        const desc = [
            `Welt: ${w.label || w.id || "unbenannt"}`,
            w.desc ? `Beschreibung: ${w.desc}` : "",
            Array.isArray(w.dsl) && w.dsl.length ? `Vokabular: ${w.dsl.join(", ")}` : "",
        ]
            .filter(Boolean)
            .join("\n");
        if (desc.length < 6) return { ok: false, reason: "world_too_thin" };
        const parsed = await this.llmCall(desc, this._buildSceneTranslatorPrompt());
        if (parsed && parsed.error && !parsed.raw) return { ok: false, reason: parsed.error };
        const obj = this._parseManifestResponse((parsed && parsed.raw) || "");
        if (!obj) return { ok: false, reason: "no_scene_in_response" };
        return { ok: true, scene: this._sanitizeWorldScene(obj) };
    }

    // Einer übersetzten Welt einen Körper geben: Szene generieren, an die customWorlds-Welt heften,
    // betretbar machen (world → der generische Renderer, reachable:true).
    async buildTranslatedWorld(worldId) {
        const key = String(worldId || "")
            .trim()
            .toLowerCase();
        const w = this.state.customWorlds && this.state.customWorlds[key];
        if (!w) return { ok: false, reason: "world_unknown" };
        if (!w.translated) return { ok: false, reason: "not_translated" };
        const res = await this.translateWorldScene(w);
        if (!res.ok) return res;
        w.scene = res.scene;
        w.world = AnazhRealm.PORTAL_TRANSLATED_WORLD;
        w.reachable = true;
        this._saveCustomWorlds();
        this.journalAppend("growth", `Der KI-Übersetzer gab „${w.label}" einen Körper — die Welt ist nun betretbar.`, {
            world: w.id,
        });
        return { ok: true, id: w.id, label: w.label };
    }

    // ### Auto-Vendor-Pfad ###
    // Ein fremdes Welt-Bündel dockt ohne Handarbeit an: der save-server schreibt die Dateien nach
    // worlds/<id>/, die Welt wird ein customWorlds-Eintrag mit trust:"sandboxed" (null-origin).
    // Beim Vendoren läuft NIE fremder Code — nur Dateien werden geschrieben bzw. sandgesichert geladen.

    // Bündel-Dateipfad gesäubert — oder null, wenn er aus worlds/<id>/ ausbrechen könnte ("..", führender
    // Slash, Backslash, Doppelpunkt). Freundliche Vorab-Prüfung; die Wand ist vendorSafeRelPath in
    // save-server.js.
    _vendorSafeRelPath(p) {
        if (typeof p !== "string" || !p || p.length > 200) return null;
        if (p.includes("\0") || p.includes("\\") || p.includes(":")) return null;
        const out = [];
        for (const seg of p.replace(/^\/+/, "").split("/")) {
            if (seg === "" || seg === ".") continue;
            if (seg === "..") return null;
            out.push(seg);
        }
        return out.length ? out.join("/") : null;
    }

    // UTF-8-Byte-Länge eines Strings (TextEncoder ist ein Browser-Global,
    // in der ESLint-Config seit V8.54 freigegeben).
    _vendorByteLength(str) {
        return new TextEncoder().encode(String(str == null ? "" : str)).length;
    }

    // Welt-Bündel clientseitig vorprüfen (rein, kein Netz): {ok, worldId, files} | {ok:false, reason}.
    // Der Server prüft maßgeblich nochmal; dies nennt den Grund schon vor dem POST.
    _vendorSanitizeBundle(worldId, files) {
        const id = String(worldId || "")
            .trim()
            .toLowerCase();
        if (!/^[a-z0-9_-]{1,40}$/.test(id)) return { ok: false, reason: "invalid_world_id" };
        // Built-in-Welt-Verzeichnisse dürfen nicht überschrieben werden —
        // die WORLD_REGISTRY-Welten plus der translated-Renderer.
        const reserved = Object.keys(AnazhRealm.WORLD_REGISTRY).concat(["translated"]);
        if (reserved.indexOf(id) >= 0) return { ok: false, reason: "reserved_world_id" };
        if (!Array.isArray(files) || files.length === 0) return { ok: false, reason: "no_files" };
        const lim = AnazhRealm.VENDOR_LIMITS;
        if (files.length > lim.maxFiles) return { ok: false, reason: "too_many_files" };
        const clean = [];
        let total = 0;
        let hasIndex = false;
        for (const f of files) {
            if (!f || typeof f !== "object" || typeof f.content !== "string") {
                return { ok: false, reason: "bad_file_entry" };
            }
            const rel = this._vendorSafeRelPath(f.path);
            if (!rel) return { ok: false, reason: "bad_file_path" };
            const ext = (rel.split(".").pop() || "").toLowerCase();
            if (lim.allowedExt.indexOf(ext) < 0) return { ok: false, reason: "bad_file_ext" };
            const bytes = this._vendorByteLength(f.content);
            if (bytes > lim.maxFileBytes) return { ok: false, reason: "file_too_large" };
            total += bytes;
            if (total > lim.maxTotalBytes) return { ok: false, reason: "bundle_too_large" };
            if (rel === "index.html") hasIndex = true;
            clean.push({ path: rel, content: f.content });
        }
        // Ein Portal lädt worlds/<id>/index.html — ohne index.html im Wurzel
        // gäbe es kein Tor (W14-P3-Disziplin: nichts versprechen, was nicht da ist).
        if (!hasIndex) return { ok: false, reason: "no_index_html" };
        return { ok: true, worldId: id, files: clean };
    }

    // W15 — der POST an den save-server-Vendor-Endpunkt. Der EINZIGE
    // Netz-Schritt; ein Netzfehler heißt, dass der save-server nicht läuft
    // (Vendoring braucht die lokale Dev-Umgebung).
    async _vendorPostJson(payload) {
        try {
            const res = await fetch("http://localhost:4312/api/vendor-world", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            let data = null;
            try {
                data = await res.json();
            } catch {
                data = null;
            }
            if (!res.ok) return { ok: false, reason: (data && data.error) || `HTTP ${res.status}` };
            return {
                ok: true,
                fileCount: data && data.fileCount,
                totalBytes: data && data.totalBytes,
                branch: data && data.branch,
                // W16 Phase 2 — der save-server liefert den Content-Hash der
                // geschriebenen Welt (er ist die Hash-Autorität).
                bundleHash: data && data.bundleHash,
            };
        } catch {
            return { ok: false, reason: "save_server_unreachable" };
        }
    }

    // Phase 1 — ein hochgeladenes Bündel POSTen. Im Playtest gestubbt (wie llmCall).
    async _vendorPostBundle(worldId, files) {
        return this._vendorPostJson({ worldId, files });
    }

    // Phase 2 — eine Repo-URL POSTen; der save-server holt die Dateien selbst.
    async _vendorPostRepo(worldId, repoUrl) {
        return this._vendorPostJson({ worldId, repoUrl });
    }

    // Vendorte Welt als customWorlds-Eintrag registrieren — BEIDE Pfade (lokales Bündel + GitHub-Fetch)
    // enden hier. trust:"sandboxed" + vendored:true; _sanitizeImportedManifest erzwingt die Sandbox.
    _vendorRegisterWorld(worldId, meta) {
        const m = meta && typeof meta === "object" ? meta : {};
        const entry = this._sanitizeImportedManifest({
            id: worldId,
            label: typeof m.label === "string" && m.label.trim() ? m.label : worldId,
            desc: typeof m.desc === "string" ? m.desc : "",
            world: `worlds/${worldId}/index.html`,
            dsl: Array.isArray(m.dsl) ? m.dsl : [],
            trust: "sandboxed",
            reachable: true,
            vendored: true,
            vendoredAt: Date.now(),
            // W16 Phase 2 — der save-server lieferte den Content-Hash beim
            // Schreiben (BEIDE Vendor-Pfade reichen posted.bundleHash herein).
            bundleHash: typeof m.bundleHash === "string" ? m.bundleHash : "",
            // W17 — eine Multiplayer-Welt deklariert sich mehrspielerfähig:
            // ihr geholtes Portal lädt mit dem Transport-Shim + broadcastet
            // beim Betreten eine Gruppen-Portal-Einladung (W17 Phase C).
            multiplayer: m.multiplayer === true,
            // W18-B — die Ko-Präsenz-Marke: ihr geholtes Portal injiziert
            // die Pose-Schicht (das Mesh wird ihre Multiplayer-Schicht).
            coPresence: m.coPresence === true,
            // W17 P-Vendor — der Server-Modus: js-compute → das geholte Portal
            // wird ein Compute-Host-Portal (V8.79), nicht blosser Relay.
            serverMode: m.serverMode === "js-compute" ? "js-compute" : "relay",
        });
        if (!entry) return { ok: false, reason: "invalid_manifest" };
        if (!this.state.customWorlds) this.state.customWorlds = {};
        this.state.customWorlds[entry.id] = entry;
        this._saveCustomWorlds();
        this.journalAppend("growth", `Eine fremde Welt dockte an deine Bibliothek an: „${entry.label}".`, {
            world: entry.id,
        });
        // Die Bibliothek wuchs: Welt-Katalog neu annoncieren (self-guarded — _p2pBroadcastSoul ruht ohne Mesh)
        // und den eigenen Katalog-Drawer auffrischen, damit Mitspieler die neue Welt als „✓ vorhanden" sehen.
        this._p2pBroadcastSoul();
        this._renderMeshWorldCatalog();
        return { ok: true, id: entry.id, label: entry.label };
    }

    // Lokales Welt-Bündel andocken: prüfen → save-server schreibt nach worlds/<id>/ → customWorlds-Eintrag
    // (trust:"sandboxed"), browsbar UND betretbar. Liefert {ok, id, label} | {ok:false, reason}.
    // Die POST-Antwort {ok:true} beweist das Schreiben — kein fetch-Probe nötig (anders als beim Import).
    async vendorWorldBundle(opts) {
        const o = opts && typeof opts === "object" ? opts : {};
        const san = this._vendorSanitizeBundle(o.worldId, o.files);
        if (!san.ok) return san;
        const posted = await this._vendorPostBundle(san.worldId, san.files);
        if (!posted.ok) return posted;
        const reg = this._vendorRegisterWorld(san.worldId, {
            label: o.label,
            desc: o.desc,
            dsl: o.dsl,
            bundleHash: posted.bundleHash,
            multiplayer: o.multiplayer === true,
            coPresence: o.coPresence === true,
            serverMode: o.serverMode === "js-compute" ? "js-compute" : "relay",
        });
        if (!reg.ok) return reg;
        // W16-Politur — den save-server-Content-Hash mit durchreichen, damit
        // der Mesh-Empfänger das Bündel gegen den Katalog-Hash prüfen kann.
        return {
            ok: true,
            id: reg.id,
            label: reg.label,
            fileCount: posted.fileCount || san.files.length,
            bundleHash: typeof posted.bundleHash === "string" ? posted.bundleHash : "",
        };
    }

    // GitHub-Fetch: der save-server holt die Dateien einer github.com-Repo-URL selbst (Trees-API + Raw-
    // Fetch) nach worlds/<id>/; Schreib-Seite + Registrierung wie beim Bündel-Pfad. Async (Netz).
    async vendorWorldFromRepo(opts) {
        const o = opts && typeof opts === "object" ? opts : {};
        const id = String(o.worldId || "")
            .trim()
            .toLowerCase();
        if (!/^[a-z0-9_-]{1,40}$/.test(id)) return { ok: false, reason: "invalid_world_id" };
        const reserved = Object.keys(AnazhRealm.WORLD_REGISTRY).concat(["translated"]);
        if (reserved.indexOf(id) >= 0) return { ok: false, reason: "reserved_world_id" };
        const repoUrl = String(o.repoUrl || "").trim();
        // Freundliche Vorab-Prüfung — der save-server parst die URL maßgeblich.
        if (!/^https?:\/\/(www\.)?github\.com\/[^/\s]+\/[^/\s]+/i.test(repoUrl)) {
            return { ok: false, reason: "not_a_github_url" };
        }
        const posted = await this._vendorPostRepo(id, repoUrl);
        if (!posted.ok) return posted;
        const reg = this._vendorRegisterWorld(id, {
            label: o.label,
            desc: o.desc,
            dsl: o.dsl,
            bundleHash: posted.bundleHash,
            multiplayer: o.multiplayer === true,
            coPresence: o.coPresence === true,
            serverMode: o.serverMode === "js-compute" ? "js-compute" : "relay",
        });
        if (!reg.ok) return reg;
        return { ok: true, id: reg.id, label: reg.label, fileCount: posted.fileCount, branch: posted.branch };
    }
}

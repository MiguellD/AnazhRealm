// W12 Phase 1 — Skelett-Welt: das "leere Tor-Gerüst", das ein Portal im
// sandboxed iframe lädt. Hier nur der postMessage-Handshake mit der
// Heimat-Welt — die Naht, an die W12 Phase 2 die DSL-Brücke hängt.
(() => {
    "use strict";
    const nameEl = document.getElementById("avatar-name");
    const statusEl = document.getElementById("portal-status");

    // W12 Phase 3 — der Rückkanal: ein Welt-Ereignis an die Heimat-Welt
    // melden. Die Heimat schreibt es als Erinnerung ins Journal — sie führt
    // es NICHT aus (ein Ereignis ist kein Befehl).
    function sendEvent(text) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: "event", text: String(text) }, "*");
        }
    }

    // W12 Phase 2 — die DSL-Brücke. Die Skelett-Welt versteht ein einziges
    // Wort: skybox_color tönt die Leere. Beweis: dieselbe Brücke trägt die
    // Strom-Welt UND dieses Gerüst — das Protokoll ist generisch, der
    // Adapter pro Welt eigen.
    function applyDsl(program) {
        if (!Array.isArray(program) || typeof program[0] !== "string") return;
        if (program[0] === "chain") {
            for (let i = 1; i < program.length; i++) applyDsl(program[i]);
            return;
        }
        if (program[0] === "skybox_color") {
            const m = /^#?([0-9a-fA-F]{6})$/.exec(String(program[1] == null ? "" : program[1]).trim());
            if (m) {
                document.body.style.background = "#" + m[1];
                sendEvent("Die Leere der Skelett-Welt nahm eine neue Farbe an.");
            }
        }
    }

    // W14 Phase 2 / W13 V2 — der Vibe-Pass trägt das Schaffen des Reisenden
    // in diese fremde Welt: seine Seele, seine Materialien, seine Werkzeuge.
    // Die Skelett-Welt begrüßt ihn mit dem, was er geschaffen hat. Alles als
    // TEXT (textContent) — der Payload wird ANGEZEIGT, nie ausgeführt;
    // Material-Farben werden auf ein striktes #rrggbb-Hex gesäubert.
    function byId(id) {
        return document.getElementById(id);
    }
    function hexFromColor(n) {
        return "#" + ((Number(n) || 0) & 0xffffff).toString(16).padStart(6, "0");
    }
    function renderBrought(avatar) {
        const vibeLine = byId("vibe-line");
        if (vibeLine && typeof avatar.fingerprint === "string" && avatar.fingerprint) {
            vibeLine.textContent = "Vibe-Pass · " + avatar.fingerprint;
            vibeLine.hidden = false;
        }
        const brought = byId("brought");
        if (!brought) return;
        let any = false;
        const soulEl = byId("brought-soul");
        if (soulEl && avatar.soul && typeof avatar.soul === "object") {
            soulEl.textContent = "Du trägst die Seele ";
            const b = document.createElement("b");
            b.textContent = String(avatar.soul.label || avatar.soul.name || "—");
            soulEl.appendChild(b);
            any = true;
        }
        const mats = Array.isArray(avatar.materials) ? avatar.materials : [];
        const tools = Array.isArray(avatar.tools) ? avatar.tools : [];
        const matWrap = byId("brought-mats");
        if (matWrap) {
            matWrap.textContent = "";
            for (const m of mats.slice(0, 16)) {
                const chip = document.createElement("span");
                chip.className = "brought-chip";
                chip.textContent = String((m && m.name) || "?");
                chip.style.borderColor = hexFromColor(m && m.color);
                matWrap.appendChild(chip);
                any = true;
            }
        }
        const toolWrap = byId("brought-tools");
        if (toolWrap) {
            toolWrap.textContent = "";
            for (const t of tools.slice(0, 16)) {
                const chip = document.createElement("span");
                chip.className = "brought-chip";
                chip.textContent = "⚒ " + String((t && (t.label || t.name)) || "?");
                toolWrap.appendChild(chip);
                any = true;
            }
        }
        // Den Tor-Ring mit einer mitgebrachten Material-Farbe tönen — die
        // fremde Welt nimmt eine Farbe des Schaffens an.
        if (mats.length) {
            const glyph = byId("glyph");
            if (glyph) glyph.style.borderColor = hexFromColor(mats[0] && mats[0].color);
        }
        brought.hidden = !any;
    }

    // Nur Nachrichten vom Eltern-Fenster (der Heimat-Welt) annehmen.
    window.addEventListener("message", (event) => {
        if (event.source !== window.parent) return;
        const msg = event.data;
        if (!msg || typeof msg !== "object") return;
        if (msg.type === "enter") {
            const avatar = msg.avatar && typeof msg.avatar === "object" ? msg.avatar : {};
            const name = typeof avatar.name === "string" && avatar.name ? avatar.name : "Reisender";
            if (nameEl) nameEl.textContent = name;
            if (statusEl) statusEl.textContent = "verbunden";
            renderBrought(avatar);
        } else if (msg.type === "dsl") {
            applyDsl(msg.program);
        }
    });

    // Esc in der Skelett-Welt → der Heimat-Welt die Heimkehr melden. Bei
    // Fokus im iframe erreicht Esc nur dieses Document; die Heimat-Welt
    // hört auf {type:"exit"} und ruft exitPortal.
    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && window.parent && window.parent !== window) {
            window.parent.postMessage({ type: "exit", world: "skeleton" }, "*");
        }
    });

    // W12 Phase 3 — die native Manifest-Stufe: die Welt liest ihr eigenes
    // manifest.json und meldet ihr DSL-Vokabular + Label im ready-Handshake.
    // Die Heimat lernt die Welt-Sprache so von der WELT selbst (Stufe
    // „nativ"). Schlägt der Fetch fehl, meldet die Welt ready ohne dsl — die
    // Heimat fällt aufs portalMeta-Manifest zurück.
    function announceReady(extra) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(Object.assign({ type: "ready", world: "skeleton" }, extra || {}), "*");
        }
    }
    fetch("./manifest.json")
        .then((res) => (res.ok ? res.json() : null))
        .then((m) => {
            const dsl = m && Array.isArray(m.dsl) ? m.dsl : null;
            const label = m && typeof m.label === "string" ? m.label : null;
            announceReady(dsl ? { dsl, label } : {});
        })
        .catch(() => announceReady({}));
})();

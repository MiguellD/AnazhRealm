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

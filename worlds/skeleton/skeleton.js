// W12 Phase 1 — Skelett-Welt: das "leere Tor-Gerüst", das ein Portal im
// sandboxed iframe lädt. Hier nur der postMessage-Handshake mit der
// Heimat-Welt — die Naht, an die W12 Phase 2 die DSL-Brücke hängt.
(() => {
    "use strict";
    const nameEl = document.getElementById("avatar-name");
    const statusEl = document.getElementById("portal-status");

    // Die Brücke zur Heimat ist die der Hülle (../huelle/huelle.js, K41): ready einmal, nur der Eltern-Rahmen spricht,
    // chain rekursiv, das Einzelwort ganz. Hier lebt nur, was diese Welt TUT.
    let B = null;
    // W12 Phase 2 — das Wort der Skelett-Welt: skybox_color tönt die Leere. Der Rückkanal (B.ereignis) meldet es der
    // Heimat; sie schreibt es als Erinnerung ins Journal (ein Ereignis ist kein Befehl).
    function wort(w, args) {
        if (w === "skybox_color") {
            const m = /^#?([0-9a-fA-F]{6})$/.exec(String(args[0] == null ? "" : args[0]).trim());
            if (m) {
                document.body.style.background = "#" + m[1];
                B.ereignis("Die Leere der Skelett-Welt nahm eine neue Farbe an.");
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

    // Die native Manifest-Stufe (manifest: true): die Hülle liest ./manifest.json und meldet Wörter + Label im ready —
    // die Heimat lernt die Welt-Sprache von der WELT selbst. Esc bringt heim.
    B = AnazhHuelle.bruecke({
        welt: "skeleton",
        manifest: true,
        wort,
        enter: (avatar) => {
            const name = typeof avatar.name === "string" && avatar.name ? avatar.name : "Reisender";
            if (nameEl) nameEl.textContent = name;
            if (statusEl) statusEl.textContent = "verbunden";
            renderBrought(avatar);
        },
    });
})();

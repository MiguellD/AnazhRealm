// W12 Phase 2 — Strom-Welt: das erste lebendige Portal-Ziel. Eine fremde
// Engine (three-fluid-fx 0.1.0, ein 2D-Stable-Fluids-Solver) auf modernem
// Three.js 0.183.2 — beides in lib/ gebündelt. Die Heimat-Welt läuft auf
// Three.js r134; diese Welt bringt ihre eigene, neuere Engine mit. Das ist
// das W12-Vision-Wort: ein Tor führt in eine Welt mit anderer Engine.
//
// Phase 2 Commit 1 baut die lebendige Sub-Welt (cursor-getriebener Fluid).
// Die DSL-Brücke (Chat-Befehle wirken hier drin) folgt in Commit 2 — sie
// dockt am bestehenden postMessage-Handshake an.
import * as THREE from "./lib/three.module.min.js";
import {
    FluidSimulation,
    attachPointerSplats,
    FullscreenPass,
    FULLSCREEN_VERTEX,
} from "./lib/three-fluid-fx.es.js";

const hudLine = document.getElementById("hud-line");
function showFallback(text) {
    if (hudLine) hudLine.textContent = text;
}

let renderer = null;
let fluid = null;
let display = null;

// Die Fluid-Engine braucht WebGL2 + HalfFloat-FBOs. Schlägt das fehl (z. B.
// ein Software-Renderer ohne HalfFloat), degradiert die Welt anmutig statt
// die Seite zu brechen — der Handshake unten läuft trotzdem.
try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    document.body.insertBefore(renderer.domElement, document.body.firstChild);

    fluid = new FluidSimulation(renderer, {
        profile: "balanced",
        curlStrength: 1.7,
        splatForce: 7,
        densityDissipation: 0.975,
        reflectWalls: false,
    });
    fluid.enableDye = true;
    attachPointerSplats(renderer.domElement, fluid, { coloredStrokes: true });

    // Fullscreen-Anzeige des Farb-Stroms (dyeTexture, RGB-Tinte).
    display = new FullscreenPass(
        new THREE.ShaderMaterial({
            vertexShader: FULLSCREEN_VERTEX,
            fragmentShader: [
                "precision highp float;",
                "varying vec2 vUv;",
                "uniform sampler2D tFluid;",
                "void main() {",
                "  vec3 ink = texture2D(tFluid, vUv).rgb;",
                "  float glow = clamp(length(ink), 0.0, 1.5);",
                "  gl_FragColor = vec4(ink + ink * glow * 0.5, 1.0);",
                "}",
            ].join("\n"),
            uniforms: { tFluid: { value: null } },
        })
    );
} catch (err) {
    showFallback("Strom-Welt: die Fluid-Engine konnte nicht starten (WebGL2 nötig). " + (err && err.message));
}

function resize() {
    if (!renderer || !fluid) return;
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    renderer.setSize(w, h, false);
    fluid.resize(w, h);
}
window.addEventListener("resize", resize);
resize();

let last = performance.now();
function frame(now) {
    if (renderer && fluid && display) {
        const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
        last = now;
        try {
            fluid.step(dt);
            display.material.uniforms.tFluid.value = fluid.dyeTexture;
            display.render(renderer, null);
        } catch (err) {
            showFallback("Strom-Welt: Render-Fehler — " + (err && err.message));
            renderer = null;
        }
    }
    requestAnimationFrame(frame);
}
if (renderer && fluid && display) requestAnimationFrame(frame);

// --- postMessage-Handshake mit der Heimat-Welt (Naht für die DSL-Brücke) ---
window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const msg = event.data;
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "enter") {
        const avatar = msg.avatar && typeof msg.avatar === "object" ? msg.avatar : {};
        const name = typeof avatar.name === "string" && avatar.name ? avatar.name : "Reisender";
        const el = document.getElementById("avatar-name");
        if (el) el.textContent = name;
    }
});

// Esc bei Fokus im iframe → der Heimat-Welt die Heimkehr melden.
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "exit", world: "fluid" }, "*");
    }
});

// Der Heimat-Welt melden: die Strom-Welt lebt und lauscht.
if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "ready", world: "fluid" }, "*");
}

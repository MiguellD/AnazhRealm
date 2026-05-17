// W12 Phase 2 — Strom-Welt: das erste lebendige Portal-Ziel. Eine fremde
// Engine (three-fluid-fx 0.1.0, ein 2D-Stable-Fluids-Solver) auf modernem
// Three.js 0.183.2 — beides in lib/ gebündelt. Die Heimat-Welt läuft auf
// Three.js r134; diese Welt bringt ihre eigene, neuere Engine mit. Das ist
// das W12-Vision-Wort: ein Tor führt in eine Welt mit anderer Engine.
//
// Anzeige nach dem offiziellen three-fluid-fx-Beispiel: die densityTexture
// trägt das Dichtefeld im .b-Kanal. Ein Auto-Strom hält die Welt in
// Bewegung; die DSL-Brücke (applyDsl) regelt die Lebhaftigkeit und wirft
// Splat-Ausbrüche ein, damit Befehle SICHTBAR treffen.
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
// energy 0..1 — die Lebhaftigkeit des Stroms; die DSL-Brücke steuert sie.
let energy = 0.5;

// Die Fluid-Engine braucht WebGL2 + HalfFloat-FBOs. Schlägt das fehl (z. B.
// ein Software-Renderer ohne HalfFloat), degradiert die Welt anmutig statt
// die Seite zu brechen — der Handshake unten läuft trotzdem.
try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    document.body.insertBefore(renderer.domElement, document.body.firstChild);

    fluid = new FluidSimulation(renderer, {
        profile: "balanced",
        splatForce: 8,
        curlStrength: 1.8,
        densityDissipation: 0.98,
        reflectWalls: false,
    });
    attachPointerSplats(renderer.domElement, fluid);

    // Anzeige: das Dichtefeld (densityTexture, Skalar im .b-Kanal) gefärbt —
    // ruhig blau, wild magenta (die Strömungs-Geschwindigkeit verschiebt den
    // Ton). Über einem Backdrop, den der DSL-Op skybox_color tönen kann.
    display = new FullscreenPass(
        new THREE.ShaderMaterial({
            vertexShader: FULLSCREEN_VERTEX,
            fragmentShader: [
                "precision highp float;",
                "varying vec2 vUv;",
                "uniform sampler2D tFluid;",
                "uniform sampler2D tVel;",
                "uniform vec3 uBackdrop;",
                "void main() {",
                "  float density = texture2D(tFluid, vUv).b;",
                "  vec2 vel = texture2D(tVel, vUv).xy;",
                "  float speed = clamp(length(vel), 0.0, 1.0);",
                "  vec3 calm = vec3(0.22, 0.66, 1.0);",
                "  vec3 wild = vec3(1.0, 0.40, 0.82);",
                "  vec3 ink = mix(calm, wild, speed) * density;",
                "  vec3 col = uBackdrop + ink * 1.3 + ink * density * 0.6;",
                "  gl_FragColor = vec4(col, 1.0);",
                "}",
            ].join("\n"),
            uniforms: {
                tFluid: { value: fluid.densityTexture },
                tVel: { value: fluid.velocityTexture },
                uBackdrop: { value: new THREE.Color(0.03, 0.045, 0.09) },
            },
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

// Ein sichtbarer Splat-Ausbruch — DSL-Wörter sollen den Strom SICHTBAR
// treffen, nicht nur einen Parameter setzen. addSplat injiziert Dichte
// (Tinte) + einen Geschwindigkeits-Stoß.
function burst(count, force) {
    if (!fluid) return;
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        fluid.addSplat(Math.random(), Math.random(), Math.cos(a) * force, Math.sin(a) * force);
    }
}

// Auto-Strom: eine wandernde Quelle splattet fortlaufend Tinte — die Welt
// lebt auch ohne Cursor. energy regelt Tempo + Wucht.
let phase = 0;
function autoSplat(dt) {
    if (!fluid) return;
    phase += dt * (0.6 + energy * 2.6);
    const x = 0.5 + Math.cos(phase) * 0.34;
    const y = 0.5 + Math.sin(phase * 1.27) * 0.34;
    const f = 0.2 + energy * 1.1;
    fluid.addSplat(x, y, Math.cos(phase * 2.3) * f, Math.sin(phase * 1.9) * f);
}

let last = performance.now();
let splatTimer = 0;
function frame(now) {
    if (renderer && fluid && display) {
        const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
        last = now;
        fluid.curlStrength = 0.5 + energy * 3.4;
        // Auto-Splats: häufiger bei hoher energy.
        splatTimer += dt;
        const interval = 0.32 - energy * 0.26;
        let guard = 0;
        while (splatTimer >= interval && guard++ < 8) {
            splatTimer -= interval;
            autoSplat(dt);
        }
        try {
            fluid.step(dt);
            display.material.uniforms.tFluid.value = fluid.densityTexture;
            display.material.uniforms.tVel.value = fluid.velocityTexture;
            display.render(renderer, null);
        } catch (err) {
            showFallback("Strom-Welt: Render-Fehler — " + (err && err.message));
            renderer = null;
        }
    }
    requestAnimationFrame(frame);
}
if (renderer && fluid && display) requestAnimationFrame(frame);

// --- W12 Phase 2 — DSL-Brücke: die Heimat-Welt reicht Befehle herein. ---
// three-fluid-fx kennt AnazhRealm nicht; die Übersetzung von DSL-Wörtern in
// Strom-Verhalten ist Bibliotheks-Code (der Adapter), nicht Engine-Code.
function setEnergy(e) {
    energy = Math.max(0, Math.min(1, e));
}

// W12 Phase 3 — der Rückkanal: ein Welt-Ereignis an die Heimat-Welt melden.
// Die Heimat schreibt es als Erinnerung ins Journal (sie führt es nicht aus).
function sendEvent(text) {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "event", text: String(text) }, "*");
    }
}

function applyBackdrop(arg) {
    if (!display) return;
    const m = /^#?([0-9a-fA-F]{6})$/.exec(String(arg == null ? "" : arg).trim());
    if (!m) return;
    const n = parseInt(m[1], 16);
    display.material.uniforms.uBackdrop.value.setRGB(
        (((n >> 16) & 255) / 255) * 0.45,
        (((n >> 8) & 255) / 255) * 0.45,
        ((n & 255) / 255) * 0.45
    );
}

// Kern-Ops (weather, skybox_color) + welt-eigene Wörter (sturm, ruhe,
// set_turbulence) — das per-Welt-Vokabular, das der Manifest deklariert.
// Jedes Wort regelt energy UND wirft einen sichtbaren Ausbruch ein.
function applyDsl(program) {
    if (!Array.isArray(program) || typeof program[0] !== "string") return;
    const op = program[0];
    if (op === "chain") {
        for (let i = 1; i < program.length; i++) applyDsl(program[i]);
        return;
    }
    if (op === "skybox_color") {
        applyBackdrop(program[1]);
        sendEvent("Der Hintergrund der Strom-Welt nahm einen neuen Ton an.");
    } else if (op === "weather") {
        const rainy = String(program[1]) === "rainy";
        setEnergy(rainy ? 0.16 : 0.66);
        burst(rainy ? 8 : 18, rainy ? 0.5 : 1.3);
        sendEvent(rainy ? "Über der Strom-Welt zog Regen auf." : "Die Strom-Welt klarte auf.");
    } else if (op === "sturm") {
        setEnergy(1);
        burst(44, 2.6);
        sendEvent("Ein Sturm fuhr durch die Strom-Welt.");
    } else if (op === "ruhe") {
        setEnergy(0.05);
        sendEvent("Die Strömung der Strom-Welt kam zur Ruhe.");
    } else if (op === "set_turbulence") {
        const t = Number(program[1]);
        if (Number.isFinite(t)) {
            setEnergy(t);
            burst(10 + Math.round(t * 34), 0.6 + t * 2.2);
            sendEvent("Die Turbulenz der Strom-Welt wurde neu gestimmt.");
        }
    } else if (op === "flut") {
        // W12 Phase 3 — ein welt-eigenes Wort, das NUR im manifest.json der
        // Strom-Welt steht, nicht im Registry-Literal. Der Beweis der nativen
        // Stufe: die Heimat lernt „flut" von der Welt selbst.
        setEnergy(0.92);
        burst(60, 3.2);
        sendEvent("Eine Flut brach über die Strom-Welt herein.");
    }
}

// --- postMessage-Handshake mit der Heimat-Welt ---
window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const msg = event.data;
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "enter") {
        const avatar = msg.avatar && typeof msg.avatar === "object" ? msg.avatar : {};
        const name = typeof avatar.name === "string" && avatar.name ? avatar.name : "Reisender";
        const el = document.getElementById("avatar-name");
        // W13 V2 — der Vibe-Pass trägt die Identität des Reisenden mit.
        if (el) el.textContent = avatar.fingerprint ? name + " · " + avatar.fingerprint : name;
    } else if (msg.type === "dsl") {
        // Die Heimat-Welt hat ein DSL-Programm hereingereicht.
        applyDsl(msg.program);
    }
});

// Esc bei Fokus im iframe → der Heimat-Welt die Heimkehr melden.
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "exit", world: "fluid" }, "*");
    }
});

// W12 Phase 3 — die native Manifest-Stufe: die Strom-Welt liest ihr eigenes
// manifest.json und meldet dsl + label im ready-Handshake. Die Heimat lernt
// das Vokabular (inkl. „flut", das NICHT im Registry-Literal steht) von der
// Welt selbst. Fetch-Fehler → ready ohne dsl, die Heimat fällt zurück.
function announceReady(extra) {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage(Object.assign({ type: "ready", world: "fluid" }, extra || {}), "*");
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

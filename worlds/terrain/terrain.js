// W12 Phase 2 — Terrain-Welt: die ZWEITE fremde Welt. three.terrain.js
// (ein klassisches Global-Skript, gegen Three.js r130 getestet) auf seinem
// gebündelten Three.js — beides in lib/. Der lebende Beweis des Protokolls:
// dieselbe DSL-Brücke trägt eine strukturell ANDERE Welt — eine begehbare
// 3D-Landschaft statt eines 2D-Fluids. Null Änderung an der Heimat-Welt;
// nur ein Manifest (im welt_terrain-Bauplan) + dieser Adapter.
(() => {
    "use strict";
    const hudLine = document.getElementById("hud-line");
    function showFallback(text) {
        if (hudLine) hudLine.textContent = text;
    }
    if (typeof THREE === "undefined" || typeof THREE.Terrain !== "function") {
        showFallback("Terrain-Welt: THREE.Terrain konnte nicht laden.");
        return;
    }

    let renderer;
    let scene;
    let camera;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        document.body.insertBefore(renderer.domElement, document.body.firstChild);
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x121a2b);
        scene.fog = new THREE.Fog(0x121a2b, 1100, 3400);
        camera = new THREE.PerspectiveCamera(54, 1, 1, 9000);
        const sun = new THREE.DirectionalLight(0xffe9c8, 1.15);
        sun.position.set(-600, 900, 420);
        scene.add(sun);
        scene.add(new THREE.AmbientLight(0x6678aa, 0.7));
    } catch (err) {
        showFallback("Terrain-Welt: WebGL nötig. " + (err && err.message));
        return;
    }

    function resize() {
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    // Verfügbare Heightmap-Verfahren von three.terrain.js.
    const HEIGHTMAPS = [
        THREE.Terrain.DiamondSquare,
        THREE.Terrain.Perlin,
        THREE.Terrain.Fault,
        THREE.Terrain.Hill,
    ].filter((fn) => typeof fn === "function");

    let terrainObj = null;

    function disposeTerrain() {
        if (!terrainObj) return;
        scene.remove(terrainObj);
        terrainObj.traverse((o) => {
            if (o.geometry && o.geometry.dispose) o.geometry.dispose();
            if (o.material && o.material.dispose) o.material.dispose();
        });
        terrainObj = null;
    }

    // Die Landschaft nach Höhe färben: Tal-Grün → Hang-Erde → Gipfel-Schnee.
    // three.terrain.js verschiebt die lokale Z-Achse der PlaneGeometry (das
    // Mesh ist um -90° gekippt → Z wird zur Welt-Höhe).
    function colorByHeight(obj, maxHeight) {
        let mesh = null;
        obj.traverse((o) => {
            if (!mesh && o.geometry && o.geometry.attributes && o.geometry.attributes.position) mesh = o;
        });
        if (!mesh) return;
        const geo = mesh.geometry;
        const pos = geo.attributes.position;
        const colors = new Float32Array(pos.count * 3);
        const low = new THREE.Color(0x2f5d3a);
        const mid = new THREE.Color(0x6e6a52);
        const high = new THREE.Color(0xeef2f6);
        const tmp = new THREE.Color();
        for (let i = 0; i < pos.count; i++) {
            const h = Math.max(0, Math.min(1, (pos.getZ(i) / maxHeight) * 0.5 + 0.5));
            if (h < 0.5) tmp.copy(low).lerp(mid, h * 2);
            else tmp.copy(mid).lerp(high, (h - 0.5) * 2);
            colors[i * 3] = tmp.r;
            colors[i * 3 + 1] = tmp.g;
            colors[i * 3 + 2] = tmp.b;
        }
        geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geo.computeVertexNormals();
    }

    let currentMaxHeight = 240;
    function buildTerrain(spec) {
        disposeTerrain();
        currentMaxHeight = spec.maxHeight;
        terrainObj = THREE.Terrain({
            easing: THREE.Terrain.Linear,
            frequency: spec.frequency,
            heightmap: spec.heightmap,
            material: new THREE.MeshLambertMaterial({ vertexColors: true }),
            maxHeight: spec.maxHeight,
            minHeight: -spec.maxHeight * 0.45,
            steps: 1,
            xSegments: 95,
            xSize: 2048,
            ySegments: 95,
            ySize: 2048,
        });
        colorByHeight(terrainObj, spec.maxHeight);
        scene.add(terrainObj);
    }

    function randomSpec(maxHeight) {
        return {
            heightmap: HEIGHTMAPS[Math.floor(Math.random() * HEIGHTMAPS.length)] || THREE.Terrain.DiamondSquare,
            frequency: 1.6 + Math.random() * 2.6,
            maxHeight: maxHeight,
        };
    }

    try {
        buildTerrain(randomSpec(240));
    } catch (err) {
        showFallback("Terrain-Welt: Terrain-Aufbau fehlgeschlagen — " + (err && err.message));
        return;
    }

    // Render-Loop: die Kamera umkreist die Landschaft — ein 3D-Diorama, das
    // die Tiefe sofort zeigt (anders als der flache 2D-Fluid).
    let orbit = 0;
    let lastT = performance.now();
    function frame(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000));
        lastT = now;
        orbit += dt * 0.13;
        const r = 1750;
        camera.position.set(Math.cos(orbit) * r, 780, Math.sin(orbit) * r);
        camera.lookAt(0, 70, 0);
        renderer.render(scene, camera);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // --- W12 Phase 2 — DSL-Brücke: der Welt-Adapter. three.terrain.js kennt
    // AnazhRealm nicht; diese Übersetzung von DSL-Wörtern in Landschafts-
    // Formen ist Bibliotheks-Code, nicht Engine-Code. ---
    function applyDsl(program) {
        if (!Array.isArray(program) || typeof program[0] !== "string") return;
        const op = program[0];
        if (op === "chain") {
            for (let i = 1; i < program.length; i++) applyDsl(program[i]);
            return;
        }
        try {
            if (op === "skybox_color") {
                const m = /^#?([0-9a-fA-F]{6})$/.exec(String(program[1] == null ? "" : program[1]).trim());
                if (m) {
                    const c = new THREE.Color("#" + m[1]);
                    scene.background = c;
                    if (scene.fog) scene.fog.color.copy(c);
                }
            } else if (op === "gebirge") {
                buildTerrain({ heightmap: THREE.Terrain.DiamondSquare, frequency: 3.4, maxHeight: 540 });
            } else if (op === "ebene") {
                buildTerrain({ heightmap: THREE.Terrain.Perlin, frequency: 1.2, maxHeight: 70 });
            } else if (op === "neu") {
                buildTerrain(randomSpec(150 + Math.random() * 320));
            }
        } catch (err) {
            showFallback("Terrain-Welt: Befehl fehlgeschlagen — " + (err && err.message));
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
            if (el) el.textContent = name;
        } else if (msg.type === "dsl") {
            applyDsl(msg.program);
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && window.parent && window.parent !== window) {
            window.parent.postMessage({ type: "exit", world: "terrain" }, "*");
        }
    });

    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "ready", world: "terrain" }, "*");
    }
})();

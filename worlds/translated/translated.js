// KI-Übersetzer Phase 2 — der generische Translated-World-Renderer.
//
// Eine übersetzte Welt hat keine eigene Engine. Sie kommt als deklarative
// SZENE — Daten, kein Code — durch den enter-Handshake der Heimat-Welt.
// Dieser hand-geschriebene, vertrauenswürdige Renderer baut JEDE solche
// Szene auf. Die Sicherheit liegt darin, dass hier NIE LLM-Code läuft: nur
// eine gedeckelte, deklarative Beschreibung wird gerendert. Eine Welt,
// ausgedrückt in einer Sprache, die AnazhRealm selbst rendert — die
// Bibliothek von Alexandria, die nicht brennt.
(() => {
    "use strict";
    const hudLine = document.getElementById("hud-line");
    function showFallback(text) {
        if (hudLine) hudLine.textContent = text;
    }
    // W12 Phase 3 — der Rückkanal: ein Welt-Ereignis an die Heimat melden.
    function sendEvent(text) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: "event", text: String(text) }, "*");
        }
    }
    if (typeof THREE === "undefined") {
        showFallback("Übersetzte Welt: Three.js konnte nicht laden.");
        return;
    }

    // --- Defensive Helfer (Defense in Depth: die Heimat sanitiert die Szene
    //     bereits, der Renderer prüft jeden Wert nochmals). ---
    function hex(v, fallback) {
        const m = /^#?([0-9a-fA-F]{6})$/.exec(String(v == null ? "" : v).trim());
        return m ? "#" + m[1].toLowerCase() : fallback;
    }
    function num(v, lo, hi, fb) {
        const n = Number(v);
        return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fb;
    }
    const SHAPES = ["box", "sphere", "cone", "cylinder", "torus", "octahedron"];
    const GROUND = ["flat", "hills", "water", "void"];
    const AMBIENT = ["none", "snow", "embers", "motes", "rain"];

    // Liest die rohe Szene in eine sichere interne Form (alle Felder gefüllt).
    function readScene(raw) {
        const s = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
        const sky = s.sky && typeof s.sky === "object" ? s.sky : {};
        const ground = s.ground && typeof s.ground === "object" ? s.ground : {};
        const light = s.light && typeof s.light === "object" ? s.light : {};
        const ambient = s.ambient && typeof s.ambient === "object" ? s.ambient : {};
        const objects = [];
        if (Array.isArray(s.objects)) {
            for (const o of s.objects) {
                if (!o || typeof o !== "object") continue;
                objects.push({
                    shape: SHAPES.indexOf(o.shape) >= 0 ? o.shape : "box",
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
        if (s.dslEffects && typeof s.dslEffects === "object") {
            for (const op of Object.keys(s.dslEffects)) {
                const e = s.dslEffects[op];
                if (!e || typeof e !== "object") continue;
                dslEffects[op] = {
                    sky: hex(e.sky, null),
                    fogShift: num(e.fogShift, -1, 1, 0),
                    lightShift: num(e.lightShift, -1, 1, 0),
                    burst: Math.round(num(e.burst, 0, 50, 0)),
                };
            }
        }
        return {
            sky: { top: hex(sky.top, "#2a3a6a"), bottom: hex(sky.bottom, "#c8b88a") },
            fog: hex(s.fog, "#9aa6c0"),
            ground: {
                color: hex(ground.color, "#3a6a3a"),
                style: GROUND.indexOf(ground.style) >= 0 ? ground.style : "flat",
            },
            light: { color: hex(light.color, "#ffe9c8"), intensity: num(light.intensity, 0, 2, 1) },
            objects: objects,
            ambient: {
                kind: AMBIENT.indexOf(ambient.kind) >= 0 ? ambient.kind : "motes",
                color: hex(ambient.color, "#ffffff"),
            },
            dslEffects: dslEffects,
        };
    }

    // --- Renderer / Szene / Kamera ---
    let renderer, scene, camera, sun, ambientLight;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        document.body.insertBefore(renderer.domElement, document.body.firstChild);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(56, 1, 0.5, 4000);
        sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(-260, 420, 200);
        scene.add(sun);
        ambientLight = new THREE.HemisphereLight(0xbfd0ff, 0x404048, 0.7);
        scene.add(ambientLight);
    } catch (err) {
        showFallback("Übersetzte Welt: WebGL nötig. " + (err && err.message));
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

    // --- die Szene aufbauen ---
    let built = null; // {skyMesh, ground, groups:[], particles, spec}
    let baseLightIntensity = 1;
    let baseFogFar = 1600;

    function disposeBuilt() {
        if (!built) return;
        const kill = (obj) => {
            if (!obj) return;
            scene.remove(obj);
            obj.traverse &&
                obj.traverse((o) => {
                    if (o.geometry && o.geometry.dispose) o.geometry.dispose();
                    if (o.material && o.material.dispose) o.material.dispose();
                });
            if (obj.geometry && obj.geometry.dispose) obj.geometry.dispose();
            if (obj.material && obj.material.dispose) obj.material.dispose();
        };
        kill(built.skyMesh);
        kill(built.ground);
        for (const g of built.groups) kill(g.mesh);
        kill(built.particles);
        built = null;
    }

    // Gradient-Himmel: eine grosse Kugel, pro Vertex von unten nach oben
    // eingefärbt. fog:false — der Himmel bleibt klar, nur Boden + Objekte
    // werden vom Nebel getönt.
    function buildSky(spec) {
        const geo = new THREE.SphereGeometry(1800, 32, 18);
        const pos = geo.attributes.position;
        const colors = new Float32Array(pos.count * 3);
        const top = new THREE.Color(spec.sky.top);
        const bottom = new THREE.Color(spec.sky.bottom);
        const tmp = new THREE.Color();
        for (let i = 0; i < pos.count; i++) {
            const t = Math.max(0, Math.min(1, pos.getY(i) / 1800 / 2 + 0.5));
            tmp.copy(bottom).lerp(top, t);
            colors[i * 3] = tmp.r;
            colors[i * 3 + 1] = tmp.g;
            colors[i * 3 + 2] = tmp.b;
        }
        geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        scene.background = bottom.clone();
        return mesh;
    }

    function buildGround(spec) {
        if (spec.ground.style === "void") return null;
        const geo = new THREE.PlaneGeometry(2600, 2600, 48, 48);
        if (spec.ground.style === "hills") {
            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i),
                    y = pos.getY(i);
                const h = Math.sin(x * 0.012) * Math.cos(y * 0.012) * 34 + Math.sin(x * 0.05 + y * 0.04) * 9;
                pos.setZ(i, h);
            }
            geo.computeVertexNormals();
        }
        const col = new THREE.Color(spec.ground.color);
        const mat = new THREE.MeshLambertMaterial({ color: col });
        if (spec.ground.style === "water") {
            mat.transparent = true;
            mat.opacity = 0.82;
        }
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = -2;
        scene.add(mesh);
        return mesh;
    }

    function shapeGeometry(shape, size) {
        const r = size;
        if (shape === "sphere") return new THREE.SphereGeometry(r * 0.6, 18, 14);
        if (shape === "cone") return new THREE.ConeGeometry(r * 0.6, r * 1.5, 16);
        if (shape === "cylinder") return new THREE.CylinderGeometry(r * 0.5, r * 0.5, r * 1.4, 16);
        if (shape === "torus") return new THREE.TorusGeometry(r * 0.6, r * 0.24, 12, 22);
        if (shape === "octahedron") return new THREE.OctahedronGeometry(r * 0.75);
        return new THREE.BoxGeometry(r, r, r);
    }

    // Eine Objekt-Gruppe: count Instanzen einer Form, verstreut in einem
    // Ring vom Radius area. Ein InstancedMesh — ein Draw-Call pro Gruppe.
    function buildObjectGroup(o, index) {
        const geo = shapeGeometry(o.shape, o.size);
        const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(o.color) });
        const mesh = new THREE.InstancedMesh(geo, mat, o.count);
        const m = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const euler = new THREE.Euler();
        const vScale = new THREE.Vector3();
        const vPos = new THREE.Vector3();
        for (let i = 0; i < o.count; i++) {
            const ang = (i / o.count) * Math.PI * 2 + index * 1.3;
            const rad = (0.18 + 0.82 * ((i * 2654435761) % 997) / 997) * o.area;
            vPos.set(Math.cos(ang) * rad, o.height + (((i * 40503) % 13) - 6), Math.sin(ang) * rad);
            euler.set(((i * 7) % 10) * 0.3, ((i * 13) % 10) * 0.6, ((i * 5) % 10) * 0.2);
            q.setFromEuler(euler);
            const s = 0.7 + (((i * 91) % 7) / 7) * 0.6;
            vScale.set(s, s, s);
            m.compose(vPos, q, vScale);
            mesh.setMatrixAt(i, m);
        }
        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);
        return { mesh: mesh, spin: o.spin, float: o.float, phase: index * 1.7, baseY: 0 };
    }

    // Ambient-Partikel — eine Points-Wolke, im Loop animiert.
    const AMBIENT_COUNT = { none: 0, snow: 520, embers: 300, motes: 360, rain: 640 };
    function buildParticles(spec) {
        const kind = spec.ambient.kind;
        const count = AMBIENT_COUNT[kind] || 0;
        if (!count) return null;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 600;
            positions[i * 3 + 1] = Math.random() * 320 - 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 600;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: new THREE.Color(spec.ambient.color),
            size: kind === "rain" ? 1.4 : kind === "motes" ? 2.6 : 2.0,
            transparent: true,
            opacity: kind === "motes" ? 0.7 : 0.9,
            depthWrite: false,
        });
        const points = new THREE.Points(geo, mat);
        scene.add(points);
        return points;
    }

    function buildScene(rawScene) {
        const spec = readScene(rawScene);
        disposeBuilt();
        scene.fog = new THREE.Fog(new THREE.Color(spec.fog), 60, baseFogFar);
        sun.color = new THREE.Color(spec.light.color);
        baseLightIntensity = spec.light.intensity;
        sun.intensity = baseLightIntensity;
        const groups = [];
        for (let i = 0; i < spec.objects.length; i++) {
            groups.push(buildObjectGroup(spec.objects[i], i));
        }
        built = {
            skyMesh: buildSky(spec),
            ground: buildGround(spec),
            groups: groups,
            particles: buildParticles(spec),
            spec: spec,
        };
        showFallback("Übersetzte Welt — von AnazhRealm aus einer Beschreibung gerendert.");
        return spec;
    }

    // --- KI-Übersetzer Phase 2 — die DSL-Brücke. Eine übersetzte Welt
    //     deklariert pro Vokabel-Wort einen Effekt (sky / fogShift /
    //     lightShift / burst); ein unbekanntes Wort lässt das Licht kurz
    //     pulsen. Alles deklarativ — kein ausgeführter Code. ---
    let pulse = 0;
    function applyEffect(op) {
        const eff = built && built.spec.dslEffects[op];
        if (eff) {
            if (eff.sky && built.skyMesh) {
                rebuildSkyTint(eff.sky);
            }
            if (eff.fogShift && scene.fog) {
                scene.fog.far = Math.max(220, Math.min(3200, scene.fog.far * (1 - eff.fogShift * 0.55)));
            }
            if (eff.lightShift) {
                sun.intensity = Math.max(0, Math.min(2.4, sun.intensity + eff.lightShift * 0.6));
            }
            if (eff.burst && built.particles) {
                spawnBurst(eff.burst);
            }
            sendEvent(`Die übersetzte Welt antwortete auf „${op}".`);
        } else {
            pulse = 1;
            sendEvent(`Die übersetzte Welt spürte „${op}" — ein Wort, das sie noch nicht kennt.`);
        }
    }

    function rebuildSkyTint(topHex) {
        if (!built || !built.skyMesh) return;
        const geo = built.skyMesh.geometry;
        const pos = geo.attributes.position;
        const col = geo.attributes.color;
        const top = new THREE.Color(topHex);
        const bottom = new THREE.Color(built.spec.sky.bottom);
        const tmp = new THREE.Color();
        for (let i = 0; i < pos.count; i++) {
            const t = Math.max(0, Math.min(1, pos.getY(i) / 1800 / 2 + 0.5));
            tmp.copy(bottom).lerp(top, t);
            col.setXYZ(i, tmp.r, tmp.g, tmp.b);
        }
        col.needsUpdate = true;
        built.spec.sky.top = topHex;
    }

    function spawnBurst(n) {
        const p = built.particles;
        const pos = p.geometry.attributes.position;
        const max = Math.min(n, pos.count);
        for (let i = 0; i < max; i++) {
            pos.setXYZ(i, (Math.random() - 0.5) * 120, 120 + Math.random() * 80, (Math.random() - 0.5) * 120);
        }
        pos.needsUpdate = true;
    }

    function applyDsl(program) {
        if (!Array.isArray(program) || typeof program[0] !== "string") return;
        if (program[0] === "chain") {
            for (let i = 1; i < program.length; i++) applyDsl(program[i]);
            return;
        }
        try {
            applyEffect(program[0]);
        } catch (err) {
            showFallback("Übersetzte Welt: Befehl fehlgeschlagen — " + (err && err.message));
        }
    }

    // --- Render-Loop: die Kamera umkreist die Szene wie ein Diorama. ---
    let orbit = 0;
    let lastT = performance.now();
    function frame(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000));
        lastT = now;
        orbit += dt * 0.16;
        const r = 230;
        camera.position.set(Math.cos(orbit) * r, 110, Math.sin(orbit) * r);
        camera.lookAt(0, 18, 0);
        // Objekt-Gruppen: drehen + schweben.
        if (built) {
            for (const g of built.groups) {
                if (g.spin) g.mesh.rotation.y += dt * 0.4;
                if (g.float) g.mesh.position.y = g.baseY + Math.sin(now * 0.001 + g.phase) * 3;
            }
            animateParticles(dt, now);
        }
        // Sanfter Licht-Puls bei einem unbekannten DSL-Wort.
        if (pulse > 0) {
            pulse = Math.max(0, pulse - dt * 1.6);
            sun.intensity = baseLightIntensity + pulse * 0.7;
        }
        renderer.render(scene, camera);
        requestAnimationFrame(frame);
    }

    function animateParticles(dt, now) {
        const p = built.particles;
        if (!p) return;
        const kind = built.spec.ambient.kind;
        const pos = p.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i),
                y = pos.getY(i),
                z = pos.getZ(i);
            if (kind === "embers") {
                y += dt * 26;
                x += Math.sin(now * 0.0012 + i) * dt * 6;
                if (y > 300) y = -20;
            } else if (kind === "rain") {
                y -= dt * 240;
                if (y < -30) y = 320;
            } else if (kind === "motes") {
                x += Math.sin(now * 0.0006 + i) * dt * 5;
                y += Math.cos(now * 0.0005 + i * 1.3) * dt * 4;
                z += Math.sin(now * 0.0007 + i * 0.7) * dt * 5;
            } else {
                // snow
                y -= dt * 38;
                x += Math.sin(now * 0.0009 + i) * dt * 7;
                if (y < -30) y = 320;
            }
            if (x > 320) x = -320;
            else if (x < -320) x = 320;
            if (z > 320) z = -320;
            else if (z < -320) z = 320;
            pos.setXYZ(i, x, y, z);
        }
        pos.needsUpdate = true;
    }

    requestAnimationFrame(frame);

    // --- postMessage-Handshake mit der Heimat-Welt ---
    let sceneBuilt = false;
    window.addEventListener("message", (event) => {
        if (event.source !== window.parent) return;
        const msg = event.data;
        if (!msg || typeof msg !== "object") return;
        if (msg.type === "enter") {
            const avatar = msg.avatar && typeof msg.avatar === "object" ? msg.avatar : {};
            const name = typeof avatar.name === "string" && avatar.name ? avatar.name : "Reisender";
            const el = document.getElementById("avatar-name");
            if (el) el.textContent = avatar.fingerprint ? name + " · " + avatar.fingerprint : name;
            // Die Szene EINMAL aufbauen (enter kommt zweimal: ready + load).
            if (!sceneBuilt && msg.scene) {
                sceneBuilt = true;
                try {
                    buildScene(msg.scene);
                } catch (err) {
                    showFallback("Übersetzte Welt: Szenen-Aufbau fehlgeschlagen — " + (err && err.message));
                }
            }
        } else if (msg.type === "dsl") {
            applyDsl(msg.program);
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && window.parent && window.parent !== window) {
            window.parent.postMessage({ type: "exit", world: "translated" }, "*");
        }
    });

    // Der ready-Handshake: die übersetzte Welt meldet KEIN eigenes Manifest
    // (ihr DSL-Vokabular kommt aus dem portalMeta der Heimat — Stufe
    // „übersetzt"); sie signalisiert nur ihre Bereitschaft.
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "ready", world: "translated" }, "*");
    }
})();

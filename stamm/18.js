class AnazhRealm_Z18 {
    // ===== ATLAS §18 · LEBENS-FELD — deposit/decay-Overlay — die Schreib-Seite des Feldes =====
    // Leben deponieren: ein 3×3-Kernel um (x,z), jede Zelle decay-then-add,
    // geklemmt auf LIFE_FIELD.max (Sättigung → der Nexus zieht weiter). Die EINE
    // Schreib-API — wer Leben in die Welt trägt (Geburt heute; später Spieler-
    // Pflege, Kreatur-Trickle) ruft sie. Harmonisch: sie HEBT nur, der Decay
    // senkt → nie Überschreiben (V17.23/V17.21-Prinzip, jetzt im Feld selbst).
    _depositLife(x, z, amount = AnazhRealm.LIFE_FIELD.pulseCenter) {
        if (!(amount > 0)) return;
        if (!this.state.lifeField) this.state.lifeField = new Map();
        const lf = this.state.lifeField;
        const cfg = AnazhRealm.LIFE_FIELD;
        const now = performance.now() / 1000;
        const cx = Math.floor(x / cfg.cell);
        const cz = Math.floor(z / cfg.cell);
        const neighborAmount = amount * (cfg.pulseNeighbor / cfg.pulseCenter);
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const add = dx === 0 && dz === 0 ? amount : neighborAmount;
                const key = cx + dx + "," + (cz + dz);
                const e = lf.get(key);
                let cur = 0;
                if (e) {
                    const dt = Math.max(0, now - e.t);
                    cur = e.a * Math.exp(-cfg.decayPerSec * dt);
                }
                lf.set(key, { a: Math.min(cfg.max, cur + add), t: now });
            }
        }
    }

    // Billiger Prune (rate-limited via updatePlayerEmotions): Zellen unter
    // epsilon raus → die Map bleibt bounded (nur aktiv getendete Regionen leben).
    _pruneLifeField() {
        const lf = this.state.lifeField;
        if (!lf || lf.size === 0) return;
        const cfg = AnazhRealm.LIFE_FIELD;
        const now = performance.now() / 1000;
        if (now - (this.state.lifeFieldLastPrune ?? -Infinity) < cfg.pruneEverySec) return;
        this.state.lifeFieldLastPrune = now;
        for (const [key, e] of lf) {
            const dt = Math.max(0, now - e.t);
            if (e.a * Math.exp(-cfg.decayPerSec * dt) < cfg.epsilon) lf.delete(key);
        }
    }

    // Kreatur-Trickle: eine tendende Kreatur (userData.tendsLife) träufelt Leben in ihre Zelle,
    // rate-limitiert (trickleEverySec); wandernd ergibt das einen decayenden Lebens-Pfad. NUR tendsLife —
    // ambiente Fauna träufelt nie (sonst positiver Feedback-Runaway). Pro Frame aus updateCreatures.
    _tickCreatureLifeTrickle(creature, now) {
        if (!creature || !creature.userData || !creature.userData.tendsLife || !creature.position) return;
        const last = creature.userData.lastLifeTrickle ?? -Infinity;
        if (now - last < AnazhRealm.LIFE_FIELD.trickleEverySec) return;
        creature.userData.lastLifeTrickle = now;
        this._depositLife(creature.position.x, creature.position.z, AnazhRealm.LIFE_FIELD.trickle);
    }

    // === die SCHREIB-Seite der emotion-Achse (das räumliche Gedächtnis) ===
    // Eine emotionale Tat (`_feelAction`) prägt ihre Emotion an der Spieler-Zelle ein; `auraAt` blendet
    // den Abdruck über die globale Stimmung, der Welt-Tint liest das. Lazy-Decay, kein Frame-Sweep.
    _depositEmotion(x, z, emotionMap) {
        if (!emotionMap) return;
        if (!this.state.emotionField) this.state.emotionField = new Map();
        const ef = this.state.emotionField;
        const cfg = AnazhRealm.EMOTION_FIELD;
        const now = performance.now() / 1000;
        const key = this._lifeCellKey(x, z); // dieselbe 16-m-Zelle wie das Leben
        let cell = ef.get(key);
        if (cell) {
            const f = Math.exp(-cfg.decayPerSec * Math.max(0, now - cell.t)); // erst zerfallen
            for (const k of Object.keys(cell.axes)) cell.axes[k] *= f;
            cell.t = now;
        } else {
            cell = { axes: {}, t: now };
            ef.set(key, cell);
        }
        for (const axis of Object.keys(emotionMap)) {
            cell.axes[axis] = Math.min(cfg.max, (cell.axes[axis] || 0) + emotionMap[axis] * cfg.imprintScale);
        }
    }

    // Der aktuelle (zerfallene) Emotions-Abdruck an (x,z) — null, wenn keine Zelle
    // (dann blendet auraAt nichts → emotion == globale Stimmung, backward-compat).
    _emotionOverlayAt(x, z) {
        const ef = this.state.emotionField;
        if (!ef || ef.size === 0) return null;
        const cell = ef.get(this._lifeCellKey(x, z));
        if (!cell) return null;
        const dt = Math.max(0, performance.now() / 1000 - cell.t);
        const f = dt === 0 ? 1 : Math.exp(-AnazhRealm.EMOTION_FIELD.decayPerSec * dt);
        let out = null;
        for (const axis of Object.keys(cell.axes)) {
            const v = cell.axes[axis] * f;
            if (v > 1e-4) {
                if (!out) out = {};
                out[axis] = v;
            }
        }
        return out;
    }

    _pruneEmotionField() {
        const ef = this.state.emotionField;
        if (!ef || ef.size === 0) return;
        const cfg = AnazhRealm.EMOTION_FIELD;
        const now = performance.now() / 1000;
        if (now - (this.state.emotionFieldLastPrune ?? -Infinity) < cfg.pruneEverySec) return;
        this.state.emotionFieldLastPrune = now;
        for (const [key, cell] of ef) {
            const f = Math.exp(-cfg.decayPerSec * Math.max(0, now - cell.t));
            let alive = false;
            for (const k of Object.keys(cell.axes)) {
                if (cell.axes[k] * f >= cfg.epsilon) {
                    alive = true;
                    break;
                }
            }
            if (!alive) ef.delete(key);
        }
    }

    // Welt-Affinität (worldFieldAt: lebendig/dichte/glut/magie) pro Terrain-Vertex als vec4-Attribut;
    // der Terrain-Shader leitet daraus die Grundfarbe ab. Aufruf beim Chunk-Bau NACH
    // setAttribute("position") — Vertices liegen in Welt-Koords (mesh.position = 0,0,0).
    _attachFieldAttribute(geometry) {
        const pos = geometry && geometry.getAttribute ? geometry.getAttribute("position") : null;
        if (!pos) return;
        const count = pos.count;
        const field = new Float32Array(count * 4);
        for (let i = 0; i < count; i++) {
            const f = this.worldFieldAt(pos.getX(i), pos.getZ(i));
            field[i * 4] = f.lebendig;
            field[i * 4 + 1] = f.dichte;
            field[i * 4 + 2] = f.glut;
            field[i * 4 + 3] = f.magieleitung;
        }
        geometry.setAttribute("aField", new THREE.BufferAttribute(field, 4));
    }

    // Per-Vertex-Farbe für eine fliegende Insel: Surface-Nets-Geometrie hat nur position+normal (kein
    // aField/uv) — der Terrain-ShaderMaterial-Pfad rendert damit kaputt, darum PBR + vertexColors.
    // Farbe folgt der Normale: oben Wiese, seitlich Erd-Hang, unten Fels — die EINE Boden-Palette (`BODEN_FARBE`,
    // Studio PORTAL_GROUND nach dem Farb-Gesetz), wie der Boden darunter; bis 06.10. trug die Insel eigene Literale.
    _attachIslandColors(geom) {
        const pos = geom && geom.getAttribute ? geom.getAttribute("position") : null;
        const norm = geom && geom.getAttribute ? geom.getAttribute("normal") : null;
        if (!pos || !norm) return;
        const n = pos.count;
        const colors = new Float32Array(n * 3);
        const P = AnazhRealm.BODEN_FARBE;
        const grass = P.mead;
        const earth = P.dirt;
        const rock = P.rock;
        for (let i = 0; i < n; i++) {
            const ny = norm.getY(i);
            let c;
            if (ny > 0.55) {
                c = grass;
            } else if (ny < -0.1) {
                c = rock;
            } else {
                const t = Math.max(0, Math.min(1, (0.55 - ny) / 0.65));
                c = [
                    grass[0] + (earth[0] - grass[0]) * t,
                    grass[1] + (earth[1] - grass[1]) * t,
                    grass[2] + (earth[2] - grass[2]) * t,
                ];
            }
            colors[i * 3] = c[0];
            colors[i * 3 + 1] = c[1];
            colors[i * 3 + 2] = c[2];
        }
        geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    }
}

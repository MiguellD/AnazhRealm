// 0710-4 Klasse 3: Leib an Leib mit Impuls-Austausch — Tier–Tier, Tier–Spieler, Spieler–Wagen (beide Richtungen).
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
// (1) die Körper-Sprache des Gesetzes: Masse, Geschwindigkeit und Stoß je Teilnehmer + das Paar
ers(
    `    // DER STOSS AUF DEN SPIELER: dv (m/s) längs (nx, nz) in seine Geschwindigkeit`,
    `    // DIE TEILNEHMER DES IMPULS-GESETZES (0710-4): ein Tier (sein Leib), der Spieler (\`state.playerMesh\`) oder ein Wagen
    // (ein Eintrag mit Fahr-Satz) — je Masse (\`_leibMasse\` / \`_fahrMasse\`), Geschwindigkeit (Steuer + getragener Stoß /
    // \`playerVel\` / Fahr-Zustand) und der Kanal, der einen Stoß trägt (\`_kreaturStoss\` / \`_spielerStoss\` /
    // \`_fahrWagenStoss\`). \`out\` wird überschrieben; null = kein Teilnehmer.
    _stossKoerper(q, out) {
        const o = out || {};
        const st = this.state;
        if (q && q === st.playerMesh) {
            o.art = "spieler";
            o.m = this._leibMasse(q);
            o.vx = st.playerVel ? st.playerVel.x() : 0;
            o.vz = st.playerVel ? st.playerVel.z() : 0;
        } else if (q && q.userData && q.userData.kind === "creature") {
            const v = this._kreaturGeschw(q);
            o.art = "tier";
            o.m = this._leibMasse(q);
            o.vx = v.x;
            o.vz = v.z;
        } else {
            const G = q ? this._fahrStossSatz(q) : null;
            if (!G) return null;
            const v = this._fahrWagenGeschw(q);
            o.art = "wagen";
            o.G = G;
            o.m = this._fahrMasse(G);
            o.vx = v ? v.x : 0;
            o.vz = v ? v.z : 0;
        }
        o.q = q;
        return o.m > 0 ? o : null;
    }
    _stossAuf(K, nx, nz, dv) {
        if (!(dv > 0)) return;
        if (K.art === "spieler") this._spielerStoss(nx, nz, dv);
        else if (K.art === "tier") this._kreaturStoss(K.q, nx, nz, dv);
        else this._fahrWagenStoss(K.q, K.G, nx * dv, nz * dv);
    }
    // DAS PAAR: n (Einheit) zeigt von A nach B. Nähern sie sich längs n (v_rel = (vA − vB) · n > 0), tauschen sie Impuls
    // nach dem EINEN Gesetz: A bekommt −n · J/mA, B +n · J/mB (Leib an Leib e 0,1, Wagen an Wagen e 0,3). Rückgabe J.
    _stossPaar(qa, qb, nx, nz) {
        const A = this._stossKoerper(qa, this._stossPaarA || (this._stossPaarA = {}));
        const B = A ? this._stossKoerper(qb, this._stossPaarB || (this._stossPaarB = {})) : null;
        if (!A || !B) return 0;
        const vRel = (A.vx - B.vx) * nx + (A.vz - B.vz) * nz;
        if (!(vRel > 0)) return 0;
        const ST = AnazhRealm.STOSS.stossZahl;
        const e = A.art === "wagen" && B.art === "wagen" ? ST.wagen : ST.leib;
        const J = AnazhRealm._stossImpuls(A.m, B.m, vRel, e);
        this._stossAuf(A, -nx, -nz, J / A.m);
        this._stossAuf(B, nx, nz, J / B.m);
        return J;
    }

    // LEIB AN LEIB (das EINE Impuls-Gesetz, 0710-4): je Paar naher Leiber — Tier an Tier, Tier am Spieler zu Fuß — ihre
    // Achsen (das Tier: die Strecke −halb … +halb längs seiner Gier mit seinem Radius, \`_kreaturLeib\`; der Spieler: seine
    // Kapsel r PLAYER_WALL_RADIUS) als Strecke gegen Strecke. Durchdringen sie sich, trennt der Kontakt sie nach ihren Massen
    // (der leichte weicht; die Lage des Spielers setzt allein sein Sim-Schritt — gegen ihn weicht das Tier ganz), und nähern
    // sie sich längs der Normalen, tauschen sie Impuls (\`_stossPaar\`): der Fuchs prallt am Bären ab, der Bär wankt kaum.
    // Vorher trennte nur der Herden-Abstand als Steuer-Wunsch (\`_applyCreatureSeparation\`) — Leiber gingen durcheinander,
    // ohne Impuls. Paare in Index-Folge, ohne Frame-Delta, ohne Zufall (Lockstep).
    _leibKontakte() {
        const st = this.state;
        const cr = st.creatures || [];
        const T = this._leibKontaktTeile || (this._leibKontaktTeile = []);
        let n = 0;
        const teil = (k) => T[k] || (T[k] = { leib: {} });
        for (let i = 0; i < cr.length; i++) {
            const c = cr[i];
            if (!c || !c.position || !c.userData || c.userData.dying) continue;
            const t = teil(n++);
            const lb = this._kreaturLeib(c, 0, t.leib);
            t.q = c;
            t.x = c.position.x;
            t.z = c.position.z;
            t.hx = lb.fx * lb.halb;
            t.hz = lb.fz * lb.halb;
            t.r = lb.radius;
            t.y0 = c.position.y;
            t.y1 = c.position.y + lb.hoehe;
            t.reich = lb.halb + lb.radius;
        }
        const pm = st.playerMesh;
        const zuFuss = pm && pm.position && !(st.player && st.player.mountedArch != null);
        if (zuFuss) {
            const t = teil(n++);
            const fd = AnazhRealm.PLAYER_FOOT_OFFSET;
            t.q = pm;
            t.x = pm.position.x;
            t.z = pm.position.z;
            t.hx = 0;
            t.hz = 0;
            t.r = AnazhRealm.PLAYER_WALL_RADIUS;
            t.y0 = pm.position.y - fd;
            t.y1 = pm.position.y + fd + AnazhRealm.PLAYER_STEP_UP;
            t.reich = t.r;
        }
        if (n < 2) return;
        const nah = this._leibKontaktNah || (this._leibKontaktNah = {});
        for (let i = 0; i < n; i++) {
            const a = T[i];
            for (let j = i + 1; j < n; j++) {
                const b = T[j];
                const grob = a.reich + b.reich;
                if (Math.abs(a.x - b.x) > grob || Math.abs(a.z - b.z) > grob) continue;
                if (a.y1 <= b.y0 || b.y1 <= a.y0) continue;
                AnazhRealm._streckenNah2D(
                    a.x - a.hx,
                    a.z - a.hz,
                    a.x + a.hx,
                    a.z + a.hz,
                    b.x - b.hx,
                    b.z - b.hz,
                    b.x + b.hx,
                    b.z + b.hz,
                    nah
                );
                const tief = a.r + b.r - nah.d;
                if (!(tief > 0)) continue;
                let nx;
                let nz;
                if (nah.d > 1e-6) {
                    nx = (nah.qx - nah.px) / nah.d;
                    nz = (nah.qz - nah.pz) / nah.d;
                } else {
                    // genaue Deckung: der Goldwinkel des Paares (deterministisch)
                    nx = Math.cos((i + j) * 2.39996);
                    nz = Math.sin((i + j) * 2.39996);
                }
                // die Lage: der leichte weicht nach dem Verhältnis der Massen (der Spieler weicht nie — sein Sim-Schritt)
                const KA = this._stossKoerper(a.q, this._leibKontaktKA || (this._leibKontaktKA = {}));
                const KB = this._stossKoerper(b.q, this._leibKontaktKB || (this._leibKontaktKB = {}));
                if (!KA || !KB) continue;
                const fest = (K) => K.art === "spieler";
                const wa = fest(KA) ? 0 : fest(KB) ? 1 : KB.m / (KA.m + KB.m);
                const wb = fest(KB) ? 0 : fest(KA) ? 1 : KA.m / (KA.m + KB.m);
                if (wa > 0) {
                    a.q.position.x -= nx * tief * wa;
                    a.q.position.z -= nz * tief * wa;
                    a.x = a.q.position.x;
                    a.z = a.q.position.z;
                }
                if (wb > 0) {
                    b.q.position.x += nx * tief * wb;
                    b.q.position.z += nz * tief * wb;
                    b.x = b.q.position.x;
                    b.z = b.q.position.z;
                }
                this._stossPaar(a.q, b.q, nx, nz);
            }
        }
    }

    // DER STOSS AUF DEN SPIELER: dv (m/s) längs (nx, nz) in seine Geschwindigkeit`
);
// (2) die nächsten Punkte zweier Strecken in der Ebene (statisch, neben dem Volumen)
ers(
    `// J längs der Normalen (A → B) bei schließender Geschwindigkeit vRel > 0; mB = Infinity für einen starren Gegner.
AnazhRealm._stossImpuls = function (mA, mB, vRel, e) {`,
    `// Die nächsten Punkte zweier Strecken AB und CD in der Ebene (x, z): P auf AB, Q auf CD und ihr Abstand d (\`out\`).
AnazhRealm._streckenNah2D = function (ax, az, bx, bz, cx, cz, dx, dz, out) {
    const ux = bx - ax;
    const uz = bz - az;
    const vx = dx - cx;
    const vz = dz - cz;
    const wx = ax - cx;
    const wz = az - cz;
    const a = ux * ux + uz * uz;
    const b = ux * vx + uz * vz;
    const c = vx * vx + vz * vz;
    const d = ux * wx + uz * wz;
    const e = vx * wx + vz * wz;
    const nenner = a * c - b * b;
    let s = 0;
    let t = 0;
    if (a <= 1e-12 && c <= 1e-12) {
        s = 0;
        t = 0;
    } else if (a <= 1e-12) {
        t = Math.max(0, Math.min(1, e / c));
    } else if (c <= 1e-12) {
        s = Math.max(0, Math.min(1, -d / a));
    } else {
        s = nenner > 1e-12 ? Math.max(0, Math.min(1, (b * e - c * d) / nenner)) : 0;
        t = (b * s + e) / c;
        if (t < 0) {
            t = 0;
            s = Math.max(0, Math.min(1, -d / a));
        } else if (t > 1) {
            t = 1;
            s = Math.max(0, Math.min(1, (b - d) / a));
        }
    }
    out.px = ax + ux * s;
    out.pz = az + uz * s;
    out.qx = cx + vx * t;
    out.qz = cz + vz * t;
    out.d = Math.hypot(out.qx - out.px, out.qz - out.pz);
    return out;
};
// J längs der Normalen (A → B) bei schließender Geschwindigkeit vRel > 0; mB = Infinity für einen starren Gegner.
AnazhRealm._stossImpuls = function (mA, mB, vRel, e) {`
);
// (3) der Takt: nach allen Tieren eines updateCreatures
ers(
    `            // DETERMINISMUS-BOGEN P3 — kein Ammo-Body-Shadow mehr: die Kreatur-Position IST
            // die Wahrheit (feld-geerdet über \`_creatureGroundY\`), nichts zu synchronisieren.
        }
    }`,
    `            // DETERMINISMUS-BOGEN P3 — kein Ammo-Body-Shadow mehr: die Kreatur-Position IST
            // die Wahrheit (feld-geerdet über \`_creatureGroundY\`), nichts zu synchronisieren.
        }
        // LEIB AN LEIB (0710-4): nachdem jedes Tier seinen Schritt ging, lösen die Paare ihre Berührung (Lage + Impuls).
        this._leibKontakte();
    }`
);
// (4) der Spieler läuft gegen einen Wagen: der Bauwerks-Löser nennt die Wagen, die ihn schoben
ers(
    `    _stepCharacterStructures(pos, feetY, headY, radius, huelle) {`,
    `    _stepCharacterStructures(pos, feetY, headY, radius, huelle, quellen) {`
);
ers(
    `            const boxes = e.blockerAABBs;
            if (huelle) huelle.quelle = e; // der Gegner jedes Schubs (das EINE Impuls-Gesetz)
            for (let b = 0; b < boxes.length; b++) {
                if (huelle) {
                    if (!(boxes[b].dick < huelle.stufe)) this._resolveHuelleVsAABB(boxes[b], pos, huelle);
                } else supportTop = this._resolveCapsuleVsAABB(boxes[b], pos, feetY, headY, radius, supportTop);
            }`,
    `            const boxes = e.blockerAABBs;
            if (huelle) huelle.quelle = e; // der Gegner jedes Schubs (das EINE Impuls-Gesetz)
            const vorX = pos.x;
            const vorZ = pos.z;
            for (let b = 0; b < boxes.length; b++) {
                if (huelle) {
                    if (!(boxes[b].dick < huelle.stufe)) this._resolveHuelleVsAABB(boxes[b], pos, huelle);
                } else supportTop = this._resolveCapsuleVsAABB(boxes[b], pos, feetY, headY, radius, supportTop);
            }
            // der Schub dieses Bauwerks (der Spieler-Pfad sammelt ihn: ein Wagen bekommt seinen Impuls, 0710-4)
            if (quellen && (pos.x !== vorX || pos.z !== vorZ)) quellen.push(e, pos.x - vorX, pos.z - vorZ);`
);
ers(
    `        const structPos = { x: nx, z: nz };
        const structTop = fahrHuelle
            ? -Infinity
            : this._stepCharacterStructures(structPos, feetY, headY, AnazhRealm.PLAYER_WALL_RADIUS);`,
    `        const structPos = { x: nx, z: nz };
        const schubWagen = this._spielerSchubQuellen || (this._spielerSchubQuellen = []);
        schubWagen.length = 0;
        const structTop = fahrHuelle
            ? -Infinity
            : this._stepCharacterStructures(structPos, feetY, headY, AnazhRealm.PLAYER_WALL_RADIUS, null, schubWagen);
        // DER SPIELER AN EINEM WAGEN (0710-4): schob ein Wagen den Spieler aus seiner Hülle, stoßen sie längs der
        // Schub-Richtung (vom Wagen zum Spieler) — der Wagen bekommt seinen Impuls (er rutscht im Nachlauf), der Spieler
        // seinen (er prallt ab). Vorher hielt die Box den Spieler ohne Folge für den Wagen.
        // Die Geschwindigkeit dieses Schritts ist die lokale (vx, vz): das Paar liest und schreibt sie über playerVel.
        for (let w = 0; w < schubWagen.length; w += 3) {
            const sd = Math.hypot(schubWagen[w + 1], schubWagen[w + 2]);
            if (!(sd > 1e-9) || !this._fahrStossSatz(schubWagen[w])) continue;
            vBody.setValue(vx, vBody.y(), vz);
            this._stossPaar(schubWagen[w], mesh, schubWagen[w + 1] / sd, schubWagen[w + 2] / sd);
            vx = vBody.x();
            vz = vBody.z();
        }`
);
// (5) ein rutschender Wagen gegen den Spieler zu Fuß: der Spieler ist ein Leib im Hüllen-Kontakt
ers(
    `        const wesen = this.state.creatures;
        if (wesen && wesen.length) {
            const leib = this._fahrLeib || (this._fahrLeib = {});
            const stufeTier = AnazhRealm.PLAYER_STEP_UP;
            for (const cr of wesen) {
                if (!cr || !cr.position) continue;
                if (Math.abs(cr.position.x - pos.x) > 12 || Math.abs(cr.position.z - pos.z) > 12) continue;
                this._kreaturLeib(cr, 0, leib);`,
    `        // Der Spieler zu Fuß ist ein Leib wie ein Tier (0710-4): eine Achse, seine Kapsel r PLAYER_WALL_RADIUS, vom Fuß bis
        // über den Kopf — ein rutschender Wagen schiebt ihn nicht durch, er stößt ihn (der eigene, gerittene Wagen nie).
        const wesen = this.state.creatures;
        const pmK = this.state.playerMesh;
        const spielerLeib =
            pmK &&
            pmK.position &&
            !(this.state.player && this.state.player.mountedArch != null) &&
            Math.abs(pmK.position.x - pos.x) <= 12 &&
            Math.abs(pmK.position.z - pos.z) <= 12;
        if ((wesen && wesen.length) || spielerLeib) {
            const leib = this._fahrLeib || (this._fahrLeib = {});
            const stufeTier = AnazhRealm.PLAYER_STEP_UP;
            const koerper = this._fahrLeibKoerper || (this._fahrLeibKoerper = []);
            koerper.length = 0;
            if (wesen) for (const cr of wesen) koerper.push(cr);
            if (spielerLeib) koerper.push(pmK);
            for (const cr of koerper) {
                if (!cr || !cr.position) continue;
                if (Math.abs(cr.position.x - pos.x) > 12 || Math.abs(cr.position.z - pos.z) > 12) continue;
                if (cr === pmK) {
                    const fd = AnazhRealm.PLAYER_FOOT_OFFSET;
                    leib.radius = AnazhRealm.PLAYER_WALL_RADIUS;
                    leib.halb = 0;
                    leib.hoehe = 2 * fd + stufeTier;
                    leib.fx = 0;
                    leib.fz = 1;
                    leib.fuss = cr.position.y - fd;
                } else {
                    this._kreaturLeib(cr, 0, leib);
                    leib.fuss = cr.position.y;
                }`
);
ers(
    `                if (k.oben <= cr.position.y + stufeTier || k.unten >= cr.position.y + leib.hoehe) continue;
                const rc = leib.radius;
                for (let o = -1; o <= 1; o++) {`,
    `                if (k.oben <= leib.fuss + stufeTier || k.unten >= leib.fuss + leib.hoehe) continue;
                const rc = leib.radius;
                for (let o = leib.halb > 0 ? -1 : 0; o <= (leib.halb > 0 ? 1 : 0); o++) {`
);
// (6) der Stoß je Gegner liest die Teilnehmer-Sprache (Tier · Spieler · Wagen · starr)
ers(
    `            const leib = !!(q && q.userData && q.userData.kind === "creature");
            const wagenG = !leib && q && q !== entry ? this._fahrStossSatz(q) : null;
            // die RELATIVE Geschwindigkeit längs der Normalen: gleitet der Gegner schon schneller fort, als der Wagen
            // nachkommt, stößt nichts (Befund gate:fahr-leben L5: der Bär rutschte nach dem ersten Stoß fort, die Hülle
            // berührte ihn weiter, und jeder Schritt stieß ihn erneut mit der vollen Fahrt — 7,92 → 1,71 m/s)
            const vG = leib ? this._kreaturGeschw(q) : wagenG ? this._fahrWagenGeschw(q) : null;
            const hinein = -((vx - (vG ? vG.x : 0)) * nx + (vz - (vG ? vG.z : 0)) * nz);
            if (!(hinein > 0)) continue;
            const mG = leib ? this._leibMasse(q) : wagenG ? this._fahrMasse(wagenG) : Infinity;
            const e = leib ? ST.stossZahl.leib : wagenG ? ST.stossZahl.wagen : ST.stossZahl.starr;
            // ohne Masse des eigenen Wagens (ein Werk ohne Fahr-Satz) nimmt die Berührung nur die Komponente
            const J = mW > 0 ? AnazhRealm._stossImpuls(mW, mG, hinein, e) : 0;
            const dv = mW > 0 ? J / mW : hinein;
            vx += nx * dv;
            vz += nz * dv;
            if (leib) this._kreaturStoss(q, -nx, -nz, J / mG);
            else if (wagenG) this._fahrWagenStoss(q, wagenG, (-nx * J) / mG, (-nz * J) / mG);`,
    `            // der Gegner in der Sprache des Gesetzes (\`_stossKoerper\`: Tier · Spieler zu Fuß · Wagen); keiner davon = starr
            const G = q && q !== entry ? this._stossKoerper(q, this._fahrStossGegnerK || (this._fahrStossGegnerK = {})) : null;
            const leib = !!(G && G.art !== "wagen");
            // die RELATIVE Geschwindigkeit längs der Normalen: gleitet der Gegner schon schneller fort, als der Wagen
            // nachkommt, stößt nichts (Befund gate:fahr-leben L5: der Bär rutschte nach dem ersten Stoß fort, die Hülle
            // berührte ihn weiter, und jeder Schritt stieß ihn erneut mit der vollen Fahrt — 7,92 → 1,71 m/s)
            const hinein = -((vx - (G ? G.vx : 0)) * nx + (vz - (G ? G.vz : 0)) * nz);
            if (!(hinein > 0)) continue;
            const mG = G ? G.m : Infinity;
            const e = leib ? ST.stossZahl.leib : G ? ST.stossZahl.wagen : ST.stossZahl.starr;
            // ohne Masse des eigenen Wagens (ein Werk ohne Fahr-Satz) nimmt die Berührung nur die Komponente
            const J = mW > 0 ? AnazhRealm._stossImpuls(mW, mG, hinein, e) : 0;
            const dv = mW > 0 ? J / mW : hinein;
            vx += nx * dv;
            vz += nz * dv;
            if (G) this._stossAuf(G, -nx, -nz, J / mG);`
);
ers(
    `                stossTags = leib
                    ? this.computeCreatureCompoundTags(q)
                    : q && q.type && this.state.blueprints && this.state.blueprints[q.type]`,
    `                stossTags =
                    leib && G.art === "tier"
                    ? this.computeCreatureCompoundTags(q)
                    : q && q.type && this.state.blueprints && this.state.blueprints[q.type]`
);
fs.writeFileSync(p, s);
console.log("ok");

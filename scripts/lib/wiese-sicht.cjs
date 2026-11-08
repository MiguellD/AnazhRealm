// wiese-sicht.cjs — DER SICHT-SATZ DER NAH-WIESE FÜR LINSEN.
//
// Die Nah-Wiese legt ihre Senken (`nahWiese:L<stufe>:<v>:<teil>`, jede ein oberster Knoten der Szene) je Frame im
// Haupt-Pass neu: `_passSicht` → `_nahWieseSicht(kamera, lage)`. Der Null-Renderer zeichnet nie — headless läuft der Sicht-Satz nicht, jede Senke steht mit
// anzahl 0, und eine Prüfung „dicht nach 7 Umzügen" wäre leer bewiesen. Die Linse stellt die
// Voraussetzung HER, statt auf den Weltzustand zu hoffen: eine Linsen-Kamera am Ring-Mittelpunkt (die Spiel-Kamera,
// um die `_tickNahWiese` die Kacheln legt), 1,7 m über dem Boden, 90° Blick auf den nächsten Büschel jenseits 2 m —
// dann EIN Aufruf des echten Sicht-Satzes. `himmel` blickt senkrecht nach oben (der Selbsttest: kein Büschel im Blick,
// jede Senke leer — die Linse muss das rot nennen). Ein Ring ohne Büschel (kein Wiesen-Grün) legt den Satz ebenso —
// danach muss jede Senke leer stehen (eine veraltete Instanz wäre ein Fehler, keine Wiese).
//
// `__wieseSicht(r, himmel)` legt den Satz, zählt und nennt je Senke ihr Soll (`__wieseErwartet`: die Büschel ihrer
// Stufe im Blick der Linsen-Kamera); `__wieseZaehle(r, auge)` zählt nur (der Selbsttest verfälscht
// eine gelegte Instanz und zählt neu): Senken, Büschel im Ring, Anzahl je Senke und die Ring-Wahrheit — jede gelegte
// Instanz der Nähe steht im Ring um das Auge (Radius + 2 m; die Ferne legt ihre Kacheln jenseits), sonst trüge die Senke
// eine fremde (veraltete) Matrix.
//
// `__wieseZurWiese(r, takt)` rückt das Auge an die Wiese, wo die Nähe am Ort nichts legt (der Start auf dem Platz).
//
// EINE Quelle für gate:freie-slots und gate:asset-inventory: `page.evaluateOnNewDocument(installWieseSicht)`.
function installWieseSicht() {
    window.__wieseZaehle = (r, auge) => {
        const nw = r.state.nahWiese;
        const o = {
            senken: nw ? nw.senken.size : 0,
            kacheln: nw ? nw.kacheln.size : 0,
            bueschel: 0,
            je: {},
            ausserhalb: 0,
        };
        if (!nw) return o;
        for (const k of nw.kacheln.values()) o.bueschel += k.bueschel.length;
        const R = r.constructor.NAH_WIESE.radius + 2;
        for (const a of nw.senken.values()) {
            o.je[a.name] = a.anzahl;
            const m = a.mesh && !/:Lf:/.test(a.name) ? a.mesh.instanceMatrix.array : null;
            for (let i = 0; m && auge && i < a.anzahl; i++)
                if (Math.hypot(m[i * 16 + 12] - auge.x, m[i * 16 + 14] - auge.z) > R) o.ausserhalb++;
        }
        return o;
    };
    // der nächste Büschel des Rings jenseits 2 m von p — das Ziel der Linsen-Kamera und des Schritts zur Wiese
    const naechst = (nw, p) => {
        let z = [null, Infinity];
        for (const k of nw.kacheln.values())
            for (const b of k.bueschel) {
                const d = Math.hypot(b.x - p.x, b.z - p.z);
                if (d > 2 && d < z[1]) z = [b, d];
            }
        return z;
    };
    // DER SCHRITT ZUR WIESE (`await __wieseZurWiese(r)`): seit w14-wiese-saum liegt die Übergabe bei `radius` 10 m — am
    // Start (der Platz) steht der nächste Büschel 10,8 m vom Auge, die Nähe legt dort nichts, die Ferne trägt (ihre Senken
    // `:Lf:` haben kein Soll und keine Ring-Wahrheit). Eine Linse, die die Nähe misst, stellt ihre Voraussetzung HER: liegt
    // der nächste Büschel jenseits der feinen Stufe (`stufe1`), tritt der Spieler auf ihn (den Rand der Wiese), und die
    // Streu-Pumpe legt den Ring neu (je Takt eine Kachel). Ein Ring ohne Büschel bleibt (dort ist leer richtig, das W-Urteil
    // prüft es). Rückgabe: der Schritt in m.
    window.__wieseZurWiese = async (r) => {
        const { nahWiese: nw, camera: c, playerMesh: pm } = r.state;
        const [b, d] = naechst(nw, c.position);
        if (!b || d <= r.constructor.NAH_WIESE.stufe1) return 0;
        pm.position.set(b.x, b.y + 1.8, b.z);
        await __streuTakte(160, 6);
        return Math.round(d);
    };
    window.__wieseSicht = (r, himmel) => {
        const st = r.state;
        const nw = st.nahWiese;
        if (!nw || !st.camera) return window.__wieseZaehle(r, null);
        const auge = st.camera.position;
        const [ziel, dBest] = naechst(nw, auge);
        // Ein Ring ohne Büschel (Waldboden, Fels, Wasser — kein Wiesen-Grün) legt den Satz trotzdem: Blick schräg
        // abwärts am Auge, jede Senke muss danach leer stehen.
        const kam = new window.THREE.PerspectiveCamera(90, 16 / 9, 0.1, 200);
        const y0 = ziel ? ziel.y : auge.y - 1.7;
        kam.position.set(auge.x, y0 + 1.7, auge.z);
        if (himmel) kam.lookAt(auge.x, y0 + 100, auge.z + 1e-3);
        else if (ziel) kam.lookAt(ziel.x, ziel.y, ziel.z);
        else kam.lookAt(auge.x + 1, y0, auge.z);
        kam.updateMatrixWorld(true);
        // Die Lage der Linsen-Kamera wie im Haken (`_passSicht`: EINE Rechnung je Pass — Frustum, Auge — nach dem EINEN
        // Gesetz der Pass-Wahl, der Satz bekommt sie gereicht).
        const T = window.THREE;
        const S = {
            frustum: new T.Frustum().setFromProjectionMatrix(
                new T.Matrix4().multiplyMatrices(kam.projectionMatrix, kam.matrixWorldInverse),
                kam.coordinateSystem
            ),
        };
        r._nahWieseSicht(kam, r._passWahlLage(S, kam, -1).auge); // die Nah-Wiese liest die Lage des Auges (w24-fahrt-takt)
        const o = window.__wieseZaehle(r, { x: kam.position.x, z: kam.position.z });
        o.auge = { x: kam.position.x, z: kam.position.z };
        o.ziel = ziel ? Math.round(dBest * 10) / 10 : null;
        o.erwartet = window.__wieseErwartet(r, kam, S.frustum);
        return o;
    };
    // DAS SOLL JE SENKE: wie viele Büschel der Sicht-Satz MINDESTENS legt — der Fuß des
    // Büschels im Frustum der Linsen-Kamera (die Sicht-Kugel des Büschels umschließt ihren Fuß: jeder solche Büschel
    // trifft) diesseits der Übergabe (`radius`; jenseits legt die Ferne, ihr Soll 0), die Stufe nur, wo sie ohne Hysterese
    // feststeht (≤ stufe1 sicher L1, > stufe1 + stufe1Rand sicher L2). Ein dünner Ring (der Waldboden unter der
    // Kronen-Karte) trägt Senken, deren Stufe im Blick keinen Büschel hat — leer ist dort richtig; leer bei Soll > 0 nie.
    window.__wieseErwartet = (r, kam, fr) => {
        const nw = r.state.nahWiese;
        const NW = r.constructor.NAH_WIESE;
        const soll = {};
        if (!nw) return soll;
        for (const a of nw.senken.values()) soll[a.name] = 0;
        const je = {};
        const p = new window.THREE.Vector3();
        const ax = kam.position.x,
            az = kam.position.z;
        for (const k of nw.kacheln.values())
            for (const b of k.bueschel) {
                const d = Math.hypot(b.x - ax, b.z - az);
                if (d >= NW.radius) continue;
                const stufe = d <= NW.stufe1 ? 1 : d > NW.stufe1 + NW.stufe1Rand ? 2 : 0;
                if (!stufe || !fr.containsPoint(p.set(b.x, b.y, b.z))) continue;
                const key = `${b.vorlage}:L${stufe}`;
                je[key] = (je[key] || 0) + 1;
            }
        for (const [key, n] of Object.entries(je)) {
            const vl = nw.vorlagen.get(key);
            if (vl) for (const a of vl.senken) soll[a.name] = n;
        }
        return soll;
    };
}
module.exports = { installWieseSicht };

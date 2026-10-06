// wiese-sicht.cjs — DER SICHT-SATZ DER NAH-WIESE FÜR LINSEN (Welle 6, 06.10.).
//
// Die Nah-Wiese legt ihre Senken (`nahWiese:<v>:L<stufe>:<teil>`) je Frame im Haupt-Pass neu: `_passSicht` →
// `_nahWieseSicht(kamera, lage)`. Der Null-Renderer zeichnet nie — headless läuft der Sicht-Satz nicht, jede Senke steht mit
// anzahl 0, und eine Prüfung „dicht nach 7 Umzügen" wäre leer bewiesen (Gegenprüfung W6, ROT 2). Die Linse stellt die
// Voraussetzung HER, statt auf den Weltzustand zu hoffen: eine Linsen-Kamera am Ring-Mittelpunkt (die Spiel-Kamera,
// um die `_tickNahWiese` die Kacheln legt), 1,7 m über dem Boden, 90° Blick auf den nächsten Büschel jenseits 2 m —
// dann EIN Aufruf des echten Sicht-Satzes. `himmel` blickt senkrecht nach oben (der Selbsttest: kein Büschel im Blick,
// jede Senke leer — die Linse muss das rot nennen). Ein Ring ohne Büschel (kein Wiesen-Grün) legt den Satz ebenso —
// danach muss jede Senke leer stehen (eine veraltete Instanz wäre ein Fehler, keine Wiese).
//
// `__wieseSicht(r, himmel)` legt den Satz, zählt und nennt je Senke ihr Soll (`__wieseErwartet`: die Büschel ihrer
// Stufe im Blick der Linsen-Kamera); `__wieseZaehle(r, auge)` zählt nur (der Selbsttest verfälscht
// eine gelegte Instanz und zählt neu): Senken, Büschel im Ring, Anzahl je Senke und die Ring-Wahrheit — jede gelegte
// Instanz steht im Ring um das Auge (Radius + 2 m), sonst trüge die Senke eine fremde (veraltete) Matrix.
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
            const m = a.mesh ? a.mesh.instanceMatrix.array : null;
            for (let i = 0; m && auge && i < a.anzahl; i++)
                if (Math.hypot(m[i * 16 + 12] - auge.x, m[i * 16 + 14] - auge.z) > R) o.ausserhalb++;
        }
        return o;
    };
    window.__wieseSicht = (r, himmel) => {
        const st = r.state;
        const nw = st.nahWiese;
        if (!nw || !st.camera || typeof r._nahWieseSicht !== "function") return window.__wieseZaehle(r, null);
        const auge = st.camera.position;
        let ziel = null;
        let dBest = Infinity;
        for (const k of nw.kacheln.values())
            for (const b of k.bueschel) {
                const d = Math.hypot(b.x - auge.x, b.z - auge.z);
                if (d > 2 && d < dBest) {
                    dBest = d;
                    ziel = b;
                }
            }
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
        r._nahWieseSicht(kam, r._passWahlLage(S, kam, -1));
        const o = window.__wieseZaehle(r, { x: kam.position.x, z: kam.position.z });
        o.auge = { x: kam.position.x, z: kam.position.z };
        o.ziel = ziel ? Math.round(dBest * 10) / 10 : null;
        o.erwartet = window.__wieseErwartet(r, kam, S.frustum);
        return o;
    };
    // DAS SOLL JE SENKE (Integration W5 × W6, 06.10.): wie viele Büschel der Sicht-Satz MINDESTENS legt — der Fuß des
    // Büschels im Frustum der Linsen-Kamera (die Sicht-Kugel des Büschels umschließt ihren Fuß: jeder solche Büschel
    // trifft), das Rand-Band dünnt wie im Satz (Würfel-Ordnung gegen den Anteil), die Stufe nur, wo sie ohne Hysterese
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
                if (b.ordnung >= Math.max(0, Math.min(1, (NW.radius - d) / NW.rand + 0.5))) continue;
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

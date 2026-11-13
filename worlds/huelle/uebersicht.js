/* worlds/huelle/uebersicht.js — DIE EINE ÜBERSICHT DER STUDIOS (w28-studio-seiten).
 *
 * EINE Seite, EINE Liste, EINE Bühne: jede Kachel zeigt das Werk ihres Studios LEBEND — gebaut vom Foundry-Faden der Welt,
 * gezeichnet im Stoff der Welt unter ihrem Licht (AnazhHuelle.buehne `werk`), nie ein gebackenes Bild. Die Liste kommt aus dem,
 * was ist (AnazhHuelle.studios: der Export der Tor-Ziele nennt die Seiten, das Kern-Manifest die Kerne, das Buch der Welt
 * Studio, Arten und Rezepte); das Werk einer Kachel ist das reisende Werk ihrer Arten (das zuletzt gereichte der Sitzung, im
 * Tor die Prägung der Welt), sonst das erste Rezept ihrer ersten Art im Buch. Je Kachel die Zahlen: Dreiecke gegen das Budget
 * der Stufe (das Buch), der Neubau (ms, hier gemessen) und die Bild-Differenz Studio ↔ Welt der Station studios.K4
 * (spec/studios/k4.json: Gerät, Stand und Tag der Messung stehen dabei).
 *
 * EIN Renderer, EINE Leinwand hinter den Kacheln: je Kachel ein Ausschnitt (Viewport + Schere) mit eigener Kamera; gezeichnet
 * wird nur, wenn sich etwas ändert (ein Werk steht, die Uhr der Bühne, Nackt, Größe, Rollen) — die Übersicht kostet im Stand nichts.
 */
(async function () {
    "use strict";
    const H = AnazhHuelle;
    const T = await H.weltThree();
    const liste = document.getElementById("kacheln");
    const meldung = document.getElementById("meldung");
    const el = (tag, klasse, text) => Object.assign(document.createElement(tag), { className: klasse || "", textContent: text == null ? "" : text });
    const zahl = (n) => Math.round(n).toLocaleString("de-DE");
    const szene = new T.Scene();
    const B = H.buehne({ szene, uhr: new URLSearchParams(location.search).get("uhr") || "frueh" });
    const R = B.renderer;
    R.domElement.className = "u-leinwand";
    R.autoClear = false;
    const kacheln = [];
    let [schmutz, malt] = [true, false];
    const wecke = () => (schmutz = true);
    H.kopf({ studio: null, buehne: B, beiWechsel: wecke });
    // im Tor der Welt: das enter bringt die Prägungen (das reisende Werk je Rezept) — die Kacheln bauen danach neu
    H.bruecke({ welt: "studios", label: "Studios — die Übersicht", enter: () => kacheln.forEach((k) => k.bauen()) });
    try {
        await B.steht;
        const [studios, buch, mass] = await Promise.all([H.studios(B), B.buch(), fetch(new URL("../../spec/studios/k4.json", document.baseURI)).then((a) => (a.ok ? a.json() : null))]);
        const teller = new T.Group();
        szene.add(teller);
        // der Teller der Übersicht dreht jedes Werk ins Streiflicht wie das Studio (die Schauseite 40° aus der Sonne)
        const s = B.welt.richtung;
        teller.rotation.y = Math.atan2(s.x, s.z) + (40 * Math.PI) / 180;
        for (const st of studios) {
            const a = el("a", "u-kachel" + (st.kern ? "" : " u-neben"));
            a.href = st.url;
            const bild = el("div", "u-bild");
            const art = Object.keys(st.arten)[0] || null;
            const [name, werkZeile, zahlen] = [el("div", "u-name", st.name || st.id), el("div", "u-werk", ""), el("div", "u-zahlen", "")];
            for (const x of st.kern ? [bild, name, werkZeile, zahlen] : [name, werkZeile]) a.appendChild(x);
            liste.appendChild(a);
            if (!st.kern) {
                werkZeile.textContent = st.ohne ? "ohne Bild: " + st.ohne : "Nebenwelt (kein Gesetzbuch der Foundry)";
                continue;
            }
            const k = { st, a, bild, g: null, stand: null, kam: new T.PerspectiveCamera(35, 1.6, 0.05, 600), nr: 0, ms: null };
            const k4 = mass && mass.k4 ? mass.k4[st.id] : undefined;
            const k4Text = k4 == null ? (mass && mass.ungemessen && mass.ungemessen[st.id] ? "K4 ungemessen (" + mass.ungemessen[st.id] + ")" : "") : "K4 " + (k4 * 100).toFixed(1).replace(".", ",") + " % (Soll ≤ " + (mass.soll * 100).toFixed(1).replace(".", ",") + " %)";
            if (k4Text) a.title = "studios.K4 Bild-Differenz Studio ↔ Welt: " + (mass.geraet || "") + " · Stand " + (mass.stand || "") + " · " + (mass.datum || "");
            k.bauen = async () => {
                const nr = ++k.nr;
                const w = H.reiseFuer(st.arten, st.rezepte) || { kind: art, preset: (st.rezepte[art] || [])[0], seed: buch.art[art] && buch.art[art].werk ? 0 : 1, ov: null };
                werkZeile.textContent = (st.arten[w.kind] || w.kind) + " · " + w.preset + " …";
                const t0 = performance.now();
                try {
                    const g = await B.werk({ preset: w.preset, seed: w.seed, lod: 0, ov: w.ov });
                    if (nr !== k.nr) return B.werkFort(g);
                    B.werkFort(k.g);
                    g.visible = false;
                    teller.add(g);
                    [k.g, k.ms] = [g, performance.now() - t0];
                    const zeile = ((buch.budget[g.userData.werk.art] || {})[0] || {}).tris || 0;
                    const ueber = zeile > 0 && g.userData.werk.tris > zeile;
                    werkZeile.textContent = (st.arten[w.kind] || w.kind) + " · " + w.preset + (H.reiseFuer(st.arten, st.rezepte) ? " · das reisende Werk" : "");
                    zahlen.textContent = "△ " + zahl(g.userData.werk.tris) + (zeile ? " / " + zahl(zeile) : "") + " · Neubau " + zahl(k.ms) + " ms" + (k4Text ? " · " + k4Text : "");
                    zahlen.classList.toggle("fail", ueber);
                } catch (e) {
                    // eine Art ohne Gestalt (der Klang: eine Prägung ohne Körper) oder ein gebrochener Bau steht beim Namen
                    werkZeile.textContent = (st.arten[w.kind] || w.kind) + " · " + w.preset + " — kein Bild";
                    zahlen.textContent = String((e && e.message) || e).replace(/^DIE BÜHNE: /, "");
                    a.classList.add("u-ohne-bild");
                }
                wecke();
            };
            kacheln.push(k);
        }
        meldung.textContent = "";
        // die Werke nacheinander (EIN Faden): die Übersicht füllt sich Kachel für Kachel
        for (const k of kacheln) await k.bauen();
    } catch (e) {
        meldung.textContent = "Die Übersicht steht nicht: " + ((e && e.message) || e);
        throw e;
    }
    // ── DAS BILD: je Kachel ihr Ausschnitt der EINEN Leinwand ──
    const groesse = () => {
        R.setSize(innerWidth, innerHeight);
        wecke();
    };
    addEventListener("resize", groesse);
    addEventListener("scroll", wecke, { passive: true });
    async function male() {
        if (malt || !schmutz || !B.welt) return;
        [malt, schmutz] = [true, false];
        try {
            R.setScissorTest(false);
            R.setViewport(0, 0, innerWidth, innerHeight);
            R.setClearColor(0x0a0d12, 1);
            R.clear();
            for (const k of kacheln) {
                const r = k.bild.getBoundingClientRect();
                if (!k.g || r.bottom <= 0 || r.top >= innerHeight || r.width < 8) continue;
                for (const x of kacheln) if (x.g) x.g.visible = x === k;
                k.stand = B.stelle(k.g);
                const { mitte, rad } = k.stand;
                const az = teller.rotation.y + (25 * Math.PI) / 180;
                k.kam.aspect = r.width / r.height;
                [k.kam.near, k.kam.far] = [Math.max(0.02, rad / 40), 80 * rad + 400];
                k.kam.updateProjectionMatrix();
                k.kam.position.set(Math.sin(az) * Math.cos(0.2), Math.sin(0.2), Math.cos(az) * Math.cos(0.2)).multiplyScalar((rad * 1.12) / Math.sin((k.kam.fov * Math.PI) / 360) / Math.min(1, k.kam.aspect)).add(mitte);
                k.kam.lookAt(mitte);
                k.kam.updateMatrixWorld(true);
                await B.werkSteht(k.kam);
                R.setViewport(r.left, r.top, r.width, r.height);
                R.setScissor(r.left, r.top, r.width, r.height);
                R.setScissorTest(true);
                if (!B.bild(k.kam)) schmutz = true; // das Licht liegt noch nicht oder ein Vorbau steht an: das nächste Bild
            }
        } finally {
            malt = false;
        }
    }
    const takt = () => (requestAnimationFrame(takt), male());
    groesse();
    takt();
    // die Linsen lesen den Stand der Übersicht (Kacheln mit Werk, das letzte Bild)
    window.__uebersicht = { kacheln, buehne: B, male: () => (wecke(), male()) };
})();

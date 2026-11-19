// KARTE 2 · ERLEBEN — die Leitern erleben.* (vision/meisterkarte-2.json): je Leiter EINE Station — EIN Messprogramm über alle Sprossen, ihre
// Sprossen als Zwillinge derselben Probe (staffel = die Sprosse) — über DAS LEITER-GERÜST in k2-same.js (das Gesetz der Leiter,
// die Arten gemessen · umfang · leser · auge, die Wand des Wortlauts, der Selbsttest je Sprosse). Der Preis jeder Sprosse kommt
// aus dem Strom der Sitzung (richter-akte.cjs), an der dichtesten Pose, an der die Probe endet.
"use strict";
const { leiter } = require("./k2-same.js").geruest;
const LEITERN = [];

// ═══════════════════════════════════════ Perspektive spieler ═══════════════════════════════════════
{
    // ─────────── erleben.spieler.praesenz — Präsenz: der Leib antwortet ───────────
    // Zählt an der dichtesten Pose (stadt-voll third) den Umfang jeder Sprosse in der Welt: die Saat der Sitzung, die Bewohner-Leiber
    // im Kegel der Kamera (`_bewohnerSiedlungen` je Siedlung ihre Liste, x/z/kopfY des Satzes), die fahrbaren Leiber
    // (`state.architectures` mit affordances.moveable), die Bewohner im Umkreis von 5 km (Liste oder das Gesetz `leuteVon` je Platz) und
    // die Arten, die der Spieler sein kann (`playerSoulDefs` + `customSouls`). Unter dem Umfang urteilt `L.umfang` mit der Zahl; trägt die
    // Welt ihn, nennt `L.leser` den Haken, der die Schwelle der Karte je Bild zählen müsste. S1 trägt g5.js.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.praesenz",
            sek: 45,
            pfad: ["scripts/werkbank.cjs", "spec/profiband/haushalt.json", "stamm/siedlung-bewohner.js", "stamm/siedlung-verkehr.js", "stamm/bau-teile.js", "stamm/siedlung-satz.js", "stamm/koerper-seele.js", "stamm/koerper-fahrt.js", "stamm/koerper-bewegung.js", "stamm/gelaende-boden.js"],
            welt: [{ wort: "leib_proben", ab: 1, was: "Proben des Leibs in der Welt der Sitzung (Lagen, Leiber, Bewohner im Bild)" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [{ wort: "anteil_schwellen", richtung: "≥", wert: 0.95, wortlaut: "Anteil, der alle drei Schwellen hält ≥ 0,95", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "Saaten der Sitzung", wortlaut: "N = 100 Zufallslagen aus 10 Saaten", feld: "richter" },
                },
                3: {
                    soll: [
                        { wort: "bilder_leib_in_leib", richtung: "≤", wert: 0, wortlaut: "0 Bilder Leib in Leib", feld: "richter" },
                        { wort: "latenz_p95_ms", richtung: "≤", wert: 50, wortlaut: "Taste → erstes Bild mit Leib-Antwort p95 ≤ 50 ms", feld: "richter", aus: 1 },
                    ],
                    umfang: { verlangt: 1000, einheit: "Bewohner-Leiber im Bild der Stadt-Pose", wortlaut: "im Gedränge: 10³ Bewohner im Bild", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "latenz_p95_ms", richtung: "≤", wert: 50, wortlaut: "Latenz p95 ≤ 50 ms", feld: "richter" },
                        { wort: "kamera_bilder_im_bau", richtung: "≤", wert: 0, wortlaut: "0 Kamera-Bilder im Bau", feld: "richter" },
                    ],
                    umfang: { verlangt: 50, einheit: "fahrbare Leiber der Welt (Wagen, Boot, Flieger)", wortlaut: "N = 50 Zufallsleiber", feld: "richter" },
                },
                5: {
                    soll: [{ wort: "anteil_schwellen", richtung: "≥", wert: 0.95, wortlaut: "Lagen-Stichprobe wie S2 im dichtesten Viertel: Anteil ≥ 0,95", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Bewohner im Umkreis von 5 km", wortlaut: "Megastadt, 10⁶ Bewohner im Umkreis von 5 km", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "latenz_p95_ms", richtung: "≤", wert: 35, wortlaut: "Latenz ≤ 35 ms", feld: "richter" },
                        { wort: "anteil_frei", richtung: "≥", wert: 0.95, wortlaut: "Kamera frei — Anteil ≥ 0,95", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "(Saat, Art)-Paare der Sitzung", wortlaut: "N = 1 000 (Saat, Art, Lage)", feld: "richter" },
                },
            },
            lauf: async function praesenzLauf(H, P, L) {
                const saat = await L.ev("return r.state.worldMeta && r.state.worldMeta.seed;");
                await L.je(2, async () =>
                    L.umfang(2, 1, "die Sitzung hält eine Saat (" + saat + "); die Lagen-Stichprobe verlangt " + P.sprossen[2].umfang.verlangt + " Saaten — kein Wechsel der Saat im Lauf")
                );
                // die dichteste Pose der Leiter: der Markt der Stadt im Gedränge (dort fährt auch der Preis, R3)
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await L.ev(`
                    r._loopCamera(performance.now());
                    const cam = r.state.camera;
                    cam.updateMatrixWorld(true);
                    const F = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
                    const v = new T.Vector3();
                    const p = r.state.playerMesh.position;
                    const FC = globalThis.__fachwerkCore;
                    let imBild = 0, geboren = 0, alle = 0, sied = 0, umkreis5 = 0, wagen = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (Array.isArray(S.liste)) {
                            n = S.liste.length;
                            for (const b of S.liste) {
                                if (!b || !b.leib) continue;
                                geboren++;
                                if (b.drinnen === true || !Number.isFinite(b.x) || !Number.isFinite(b.z)) continue;
                                v.set(b.x, Number.isFinite(b.kopfY) ? b.kopfY : r.getTerrainHeightAt(b.x, b.z) + 1.6, b.z);
                                if (v.distanceTo(cam.position) <= cam.far && F.containsPoint(v)) imBild++;
                            }
                        } else {
                            if (!FC || typeof FC.leuteVon !== "function") throw new Error("fachwerk-core leuteVon fehlt (stamm/siedlung-bewohner.js:839)");
                            for (const sl of (S.plan && S.plan.slots) || []) { const k = FC.leuteVon(sl.ov); if (k > 0) n += k; }
                        }
                        alle += n;
                        if (Math.hypot(S.ox - p.x, S.oz - p.z) <= 5000) umkreis5 += n;
                        if (S.verkehr && Array.isArray(S.verkehr.wagen)) wagen += S.verkehr.wagen.length;
                    }
                    const fahrbar = (r.state.architectures || []).filter((e) => e && e.affordances && e.affordances.moveable);
                    const arten = [...new Set(fahrbar.map((e) => e.type))];
                    const seelen = Object.keys(r.playerSoulDefs || {}).length + Object.keys(r.state.customSouls || {}).length;
                    return { imBild, geboren, alle, sied, umkreis5, wagen, fahrbar: fahrbar.length, fahrArten: arten.slice(0, 12), seelen, far: cam.far };
                `);
                L.zeile("Stadt-Pose: " + JSON.stringify(z));
                await L.je(3, async () => {
                    const v = P.sprossen[3].umfang.verlangt;
                    if (z.imBild < v)
                        return L.umfang(3, z.imBild, "im Kegel der Kamera an stadt-voll third stehen " + z.imBild + " Bewohner-Leiber (" + z.geboren + " geboren, " + z.alle + " Bewohner in " + z.sied + " Siedlungen) — kein Gedränge von " + v);
                    L.leser(3, "Bilder Leib in Leib: kein Leser je Bild, der den Leib des Spielers gegen die Bewohner-Leiber hält — `_bewohnerSpielerAbstand` (stamm/siedlung-bewohner.js:2142) weicht, zählt aber kein Bild; der Gang 2 min passt nicht in die Leiter (sek ≤ 60)", z.imBild);
                });
                await L.je(4, async () => {
                    const v = P.sprossen[4].umfang.verlangt;
                    if (z.fahrbar < v)
                        return L.umfang(4, z.fahrbar, "die Welt der Sitzung trägt " + z.fahrbar + " fahrbare Leiber (affordances.moveable, stamm/bau-teile.js:209; Arten: " + (z.fahrArten.join(", ") || "keine") + "; Wagen des Verkehrs " + z.wagen + ")");
                    L.leser(4, "0 Kamera-Bilder im Bau: kein Leser je Bild, ob die Kamera eines gerittenen Leibs im Bau steht (stamm/koerper-bewegung.js:1759 `_loopCamera`); die Latenz-Linse wählt keinen Leib der Welt (scripts/werkbank.cjs:1894)", z.fahrbar);
                });
                await L.je(5, async () => {
                    const v = P.sprossen[5].umfang.verlangt;
                    if (z.umkreis5 < v) return L.umfang(5, z.umkreis5, "im Umkreis von 5 km um die Stadt-Pose wohnen " + z.umkreis5 + " Bewohner (" + z.sied + " Siedlungen der Sitzung) — keine Megastadt");
                    L.leser(5, "Lagen-Stichprobe im dichtesten Viertel: kein Leser, der Zufallslagen zieht und die drei Schwellen je Lage urteilt (scripts/werkbank.cjs:1892 `/latenz` misst nur am Ort der Pose)", z.umkreis5);
                });
                await L.je(6, async () => {
                    const n = 1 * z.seelen;
                    const v = P.sprossen[6].umfang.verlangt;
                    if (n < v) return L.umfang(6, n, "eine Saat (" + saat + ") × " + z.seelen + " Arten, die der Spieler sein kann (playerSoulDefs + customSouls, stamm/koerper-seele.js:437) = " + n + " (Saat, Art)-Paare");
                    L.leser(6, "Kontakt ohne Durchdringen und Kamera frei je (Saat, Art, Lage): kein Leser (stamm/koerper-fahrt.js:2744 `applyPlayerSoul` wechselt den Leib, nie ein Urteil seiner Lage)", n);
                });
            },
        })
    );

    // ─────────── erleben.spieler.rolle — Die Rolle: jeder Bewohner ist übernehmbar ───────────
    // Zählt an stadt-voll die Bewohner der größten Siedlung der Sitzung (Liste oder das Gesetz `leuteVon` je Platz), alle Bewohner und die
    // Tiere (`state.creatures`) gegen Dorf 10² · Stadt 10⁴ · Metropole 10⁶ · Megastadt 10⁷ · Planet 10⁹. Wo die Welt den Umfang trägt,
    // fehlt der Haken der Übernahme (Bewohner → Leib des Spielers): `L.leser`; darunter `L.umfang`. S4 (Blindurteil gegen Quellen) schösse
    // das Bild erst an einer Metropole. S7 verlangt 10 Saaten (wie S6). S1 trägt g4.js.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.rolle",
            sek: 40,
            pfad: ["scripts/werkbank.cjs", "spec/profiband/haushalt.json", "stamm/siedlung-bewohner.js", "stamm/koerper-fahrt.js", "stamm/koerper-seele.js"],
            welt: [{ wort: "rollen_proben", ab: 1, was: "übernommene Bewohner, deren Verben die Welt änderten" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [
                        { wort: "verben_des_berufs", richtung: "≥", wert: 3, wortlaut: "spielbar mit ≥ 3 Verben seines Berufs", feld: "richter" },
                        { wort: "anteil_spielbar", richtung: "≥", wert: 0.9, wortlaut: "Anteil ≥ 0,9", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "ein Dorf, 10² Bewohner: jeden übernehmen", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "anteil_kopplung", richtung: "≥", wert: 0.8, wortlaut: "Δ in B binnen 1 Spieltag messbar, Anteil ≥ 0,8", feld: "richter" }],
                    umfang: { verlangt: 1e4, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "eine Stadt, 10⁴", feld: "umfang" },
                },
                4: {
                    auge: {
                        pose: "stadt-voll third, Mittag, Sommer, Sonne — der Markt im Gedränge, Bewohner bei ihren Verben",
                        vorbild: "Quellen der Epoche: Berufs- und Werkstattbilder (Schmied 1200, Mechaniker 1950) im Blindpaar",
                    },
                    soll: [{ wort: "anteil_epochentreu", richtung: "≥", wert: 0.8, wortlaut: "Anteil epochentreuer Verben im Blindurteil gegen Quellen ≥ 0,8", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "eine Metropole, 10⁶ — über Epochen und Kulturen", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "gesichter_bildpaar", richtung: "≥", wert: 10, wortlaut: "an 10 Zufallsgesichtern im Ego sichtbar (Bildpaar)", feld: "richter" }],
                    umfang: { verlangt: 1e7, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "Megastadt bis jenseits Tokio, 10⁷–4·10⁸, Herrscher eingeschlossen", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "verben_der_art", richtung: "≥", wert: 3, wortlaut: "spielbar mit ≥ 3 arteigenen Verben mit Weltwirkung", feld: "richter" },
                        { wort: "anteil_spielbar", richtung: "≥", wert: 0.95, wortlaut: "Anteil ≥ 0,95", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e9, einheit: "Lebewesen der Sitzung (Bewohner + Tiere)", wortlaut: "Planet, 10⁹–10¹⁰ Lebewesen, auch Wolf, Wal, Biene im Stock", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "anteil_spielbar", richtung: "≥", wert: 0.95, wortlaut: "Anteil ≥ 0,95", feld: "richter", aus: 6 }],
                    umfang: { verlangt: 10, einheit: "Saaten der Sitzung", wortlaut: "N = 1 000 Zufallslebewesen aus 10 Saaten", feld: "richter", aus: 6 },
                },
            },
            lauf: async function rolleLauf(H, P, L) {
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await L.ev(`
                    const FC = globalThis.__fachwerkCore;
                    let max = 0, maxName = null, summe = 0, sied = 0;
                    const berufe = new Set();
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (Array.isArray(S.liste)) {
                            n = S.liste.length;
                            for (const b of S.liste) if (b && b.beruf) berufe.add(b.beruf);
                        } else {
                            if (!FC || typeof FC.leuteVon !== "function") throw new Error("fachwerk-core leuteVon fehlt (stamm/siedlung-bewohner.js:839)");
                            for (const sl of (S.plan && S.plan.slots) || []) { const k = FC.leuteVon(sl.ov); if (k > 0) n += k; }
                        }
                        summe += n;
                        if (n > max) { max = n; maxName = (S.plan && S.plan.name) || S.key; }
                    }
                    return { saat: r.state.worldMeta && r.state.worldMeta.seed, max, maxName, summe, sied, berufe: [...berufe].slice(0, 16), tiere: (r.state.creatures || []).length };
                `);
                L.zeile("Bewohner der Sitzung: " + JSON.stringify(z));
                const haken =
                    "Übernahme: kein Haken, der einen Bewohner zum Leib des Spielers macht — der Bewohner trägt seinen Beruf (stamm/siedlung-bewohner.js:875), der Spieler wechselt nur die Seele (stamm/koerper-fahrt.js:2744 `applyPlayerSoul`)";
                const stufe = async (nr, n, was) => {
                    const v = P.sprossen[nr].umfang.verlangt;
                    if (n < v) return L.umfang(nr, n, was);
                    if (P.sprossen[nr].auge) return L.auge(nr, { erzeugt: n, b: { wahl: 0 } });
                    L.leser(nr, haken, n);
                };
                const groesste = "die größte Siedlung der Sitzung („" + z.maxName + "“) trägt " + z.max + " Bewohner (" + z.sied + " Siedlungen, " + z.summe + " Bewohner, Berufe: " + (z.berufe.join(", ") || "keine") + ")";
                await L.je(2, () => stufe(2, z.max, groesste));
                await L.je(3, () => stufe(3, z.max, groesste + " — keine Stadt von 10⁴"));
                await L.je(4, () => stufe(4, z.max, groesste + " — keine Metropole"));
                await L.je(5, () => stufe(5, z.max, groesste + " — keine Megastadt"));
                await L.je(6, () => stufe(6, z.summe + z.tiere, "die Sitzung trägt " + z.summe + " Bewohner und " + z.tiere + " Tiere = " + (z.summe + z.tiere) + " Lebewesen — kein Planet von 10⁹"));
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält eine Saat (" + z.saat + ") und einen Planeten — kein Wechsel von Saat, Planet und Epoche im Lauf"));
            },
        })
    );

    // ─────────── erleben.spieler.hand — Hand und Werk: Wirkung aus dem Stoff ───────────
    // An der Wiese (ego) zählt das Programm die Werkzeuge der Hand (die leere Hand + jeder Bauplan, den `_blueprintUseKind` „hold“
    // nennt), die Stoffe des Bodens am Spawn (`_terrainMaterialAt` auf 7 × 7 Punkten in drei Tiefen), das längste Werkstück (opChain) und
    // die Tasten brechen/setzen. S1 fehlt der Leser der Wirkung (die Latenz-Linse misst Kamera, Leib, Hand); S2 schlägt mit dem Verb des
    // Spiels (`tryMouseBreak`, Blick zum Boden) und schießt das Ergebnisbild fürs Blindurteil; S3–S6 urteilen den gezählten Umfang.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.hand",
            sek: 60,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "scripts/lib/haenger-linse.cjs", "scripts/lib/ausgabe-aufnahme.cjs", "spec/profiband/haushalt.json", "stamm/kampf.js", "stamm/vegetation-wiese.js", "stamm/bau-buch.js", "stamm/koerper-bewegung.js", "stamm/koerper-seele.js", "stamm/werkstatt-bauen.js", "stamm/gelaende-boden.js"],
            welt: [{ wort: "wirkungen", ab: 1, was: "Wirkungen der Hand an einem Stoff der Welt" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "wirkung_p95_ms", richtung: "≤", wert: 50, wortlaut: "Eingabe → erstes Bild mit Wirkung p95 ≤ 50 ms", feld: "richter" },
                        { wort: "treffer_zellen", richtung: "≤", wert: 1, wortlaut: "Trefferpunkt = Zielpunkt ± 1 Zelle", feld: "richter" },
                    ],
                },
                2: {
                    auge: {
                        pose: "wiese ego, Blick 60° zum Boden auf das Ziel des Hiebs, nach einem Hieb der Hand (`tryMouseBreak`), Mittag, Sommer, Sonne, wahl 0",
                        vorbild: "Real-Foto desselben Stoffs nach derselben Tat (Grube im Wiesenboden, gesplittertes Holz, zerpflücktes Laub)",
                    },
                    soll: [{ wort: "anteil_plausibel", richtung: "≥", wert: 0.8, wortlaut: "Anteil plausibel ≥ 0,8", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Paare (Werkzeug × Stoff) des Spawns", wortlaut: "N = 20 Zufallspaare (Werkzeug × Stoff)", feld: "richter" },
                },
                3: {
                    soll: [{ wort: "anteil_monoton", richtung: "≥", wert: 0.95, wortlaut: "Anteil monotoner Antwort ≥ 0,95", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Paare (Werkzeug × Stoff) mit einem Parameter des Spielers", wortlaut: "N = 100 Zufallspaare, je ein Parameter variiert", feld: "richter" },
                },
                4: {
                    auge: { pose: "das Werkstück des Spielers auf der Werkbank, ego, Mittag", vorbild: "Museumsfoto des Werkstücks der Epoche (Töpferware, Gewebe, Schmiedestück)" },
                    umfang: { verlangt: 5, einheit: "Schritte des längsten Werkstücks der Welt (opChain)", wortlaut: "Form-Abweichung im Band, ≥ 5 Schritte", feld: "richter" },
                },
                5: {
                    soll: [{ wort: "anteil_benutzbar", richtung: "≥", wert: 0.8, wortlaut: "Anteil benutzbar mit plausibler Wirkung ≥ 0,8", feld: "richter" }],
                    umfang: { verlangt: 200, einheit: "(Saat, Epoche, Werkzeug, Stoff) der Sitzung", wortlaut: "N = 200 (Saat, Epoche, Werkzeug, Stoff)", feld: "richter" },
                },
                6: {
                    soll: [{ wort: "anteil_plausibel", richtung: "≥", wert: 0.8, wortlaut: "Anteil plausibler Wirkung ≥ 0,8", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "(Saat, Art, Glied, Stoff, Tätigkeit) der Sitzung", wortlaut: "N = 1 000 (Saat, Art, Glied, Stoff, Tätigkeit)", feld: "richter" },
                },
            },
            lauf: async function handLauf(H, P, L) {
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const z = await L.ev(`
                    const st = r.state;
                    const t0 = performance.now();
                    const bps = Object.values(st.blueprints || {});
                    let halt = 0, geprueft = 0, ketteMax = 0;
                    for (const bp of bps) {
                        for (const part of (bp && bp.parts) || []) if (part && Array.isArray(part.opChain)) ketteMax = Math.max(ketteMax, part.opChain.length);
                        if (performance.now() - t0 > 4000) continue;
                        geprueft++;
                        if (r._blueprintUseKind(bp) === "hold") halt++;
                    }
                    const p = st.playerMesh.position;
                    const stoffe = new Set();
                    for (let i = -3; i <= 3; i++)
                        for (let k = -3; k <= 3; k++) {
                            const x = p.x + i * 10, zz = p.z + k * 10;
                            const y = r.getTerrainHeightAt(x, zz);
                            for (const tief of [0.2, 1.5, 4]) { const m = r._terrainMaterialAt(x, zz, y - tief); if (m) stoffe.add(m); }
                        }
                    const kb = st.keybindings || {};
                    const seelen = Object.keys(r.playerSoulDefs || {}).length + Object.keys(st.customSouls || {}).length;
                    return { saat: st.worldMeta && st.worldMeta.seed, werkzeuge: 1 + halt, halt, geprueft, bauplaene: bps.length, stoffe: [...stoffe], ketteMax, brechen: kb.break != null, setzen: kb.place != null, seelen };
                `);
                L.zeile("Hand an der Wiese: " + JSON.stringify(z));
                const S = z.stoffe.length;
                const paare = z.werkzeuge * S;
                const paarText = z.werkzeuge + " Werkzeuge der Hand (die leere Hand + " + z.halt + " Baupläne „hold“, stamm/kampf.js:1843; geprüft " + z.geprueft + " von " + z.bauplaene + ") × " + S + " Stoffe des Bodens (" + z.stoffe.join(", ") + ") = " + paare + " Paare";
                // S1 · setzen und brechen: die Tasten trägt die Welt, den Leser der Wirkung nicht
                await L.je(1, async () => {
                    if (!(z.brechen && z.setzen)) throw new Error("die Tasten-Tafel trägt brechen " + z.brechen + " · setzen " + z.setzen + " (stamm/werkstatt-bauen.js:3634)");
                    L.leser(1, "Eingabe → erstes Bild mit Wirkung: die Latenz-Linse kennt kein Verb setzen (scripts/werkbank.cjs:1894) und misst an Kamera, Leib und Hand, nie die Wirkung am Stoff (scripts/lib/haenger-linse.cjs:1181); Trefferpunkt ↔ Zielpunkt: kein Leser, der die Zelle des Edits gegen das Ziel des Fadenkreuzes hält (stamm/kampf.js:2349)");
                });
                await L.je(3, async () => {
                    if (paare < P.sprossen[3].umfang.verlangt) return L.umfang(3, paare, paarText + " — und Kraft und Winkel sind kein Parameter des Spielers");
                    L.leser(3, "Kraft und Winkel des Hiebs: kein Parameter des Spielers — `tryMouseBreak` liest nur das gehaltene Gerät (stamm/kampf.js:2226); kein Leser der Antwort je Parameter", paare);
                });
                await L.je(4, async () => {
                    if (z.ketteMax < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.ketteMax, "das längste Werkstück der Welt trägt " + z.ketteMax + " Schritte (opChain der Teile, stamm/bau-buch.js:2371) in " + z.bauplaene + " Bauplänen");
                    L.leser(4, "kein Weg legt ein Werkstück mit seinen Schritten vor die Kamera der Probe (stamm/bau-buch.js:2371 opChain)", z.ketteMax);
                });
                await L.je(5, async () => {
                    const n = 1 * 1 * paare;
                    if (n < P.sprossen[5].umfang.verlangt) return L.umfang(5, n, "eine Saat (" + z.saat + ") × eine Epoche × " + paarText);
                    L.leser(5, "Epoche: die Sitzung trägt eine Epoche; kein Leser der Wirkung je (Werkzeug, Stoff) (stamm/kampf.js:2226)", n);
                });
                await L.je(6, async () => {
                    const taten = (z.brechen ? 1 : 0) + (z.setzen ? 1 : 0);
                    const n = 1 * z.seelen * 1 * S * taten;
                    if (n < P.sprossen[6].umfang.verlangt)
                        return L.umfang(6, n, "eine Saat × " + z.seelen + " Arten (stamm/koerper-seele.js:437) × ein Glied (der Platz held, stamm/kampf.js:1747) × " + S + " Stoffe × " + taten + " Tätigkeiten (brechen, setzen) = " + n);
                    L.leser(6, "fremde Glieder: die Hand hat EINEN Platz (held, stamm/kampf.js:1747); kein Leser der Wirkung je Glied", n);
                });
                // S2 · das Ergebnisbild: ein Hieb der Hand mit dem Verb des Spiels, der Blick zum Ziel, das Bild fürs Blindurteil
                await L.je(2, async () => {
                    if (paare < P.sprossen[2].umfang.verlangt) return L.umfang(2, paare, paarText);
                    const d = await L.ev(`
                        const st = r.state;
                        const pitch0 = st.pitch;
                        st.pitch = -1.05;
                        r._loopCamera(performance.now());
                        const hit = r._raycastWorldHit(30);
                        const stoff = hit && hit.hit ? r._terrainMaterialAt(hit.x, hit.z, hit.y) : null;
                        // ein Hieb ins Leere ist keine Wirkung: nur graben · pflücken · abbauen · zünden wirken am Stoff (stamm/kampf.js:2226)
                        const WIRK = ["graben", "pfluecken", "abbau", "zuenden"];
                        let schlaege = 0, gewirkt = false, verb = null;
                        for (let i = 0; i < 12; i++) {
                            schlaege++;
                            const ok = r.tryMouseBreak();
                            verb = st.player && st.player._mausVerb;
                            if (!ok || WIRK.indexOf(verb) < 0) break;
                            const dg = st.player._dig;
                            if (verb !== "graben" || !dg || !(dg.progress > 0)) { gewirkt = true; break; }
                        }
                        r._loopCamera(performance.now());
                        return { pitch0, schlaege, gewirkt, verb, stoff, ziel: hit && hit.hit ? [hit.x, hit.y, hit.z] : null };
                    `);
                    L.zeile("Hieb der Hand: " + JSON.stringify(d));
                    try {
                        if (!d.gewirkt) throw new Error("der Hieb der Hand wirkte nicht (" + d.schlaege + " Schläge, Verb " + d.verb + ", Stoff " + d.stoff + ")");
                        await L.auge(2, { b: { wahl: 0, uhr: 0.5 }, erzeugt: paare });
                    } finally {
                        await L.ev("r.state.pitch = " + (Number.isFinite(d.pitch0) ? d.pitch0 : 0) + "; return true;");
                    }
                });
            },
        })
    );

    // ─────────── erleben.spieler.wegfindung — Wegfindung ohne Pfeil ───────────
    // An der Wiese zählt das Programm die Landmarken der Welt (felsturm/felsbogen aus dem Landmarken-Wurf, stamm/vegetation-baum.js:1519)
    // in 1 km und 1–3 km, die größte Siedlung, den Planeten (Anker `_planetAnker`, sein Körper aus planet-core `planetPlan(samen,
    // PLANET_ERDE)` wie der Faden, voxel-worker.js:1159) und misst S5: die Mittags-Sonne je Saison-Wort (`_sonnenRichtung`, die Quelle von
    // Licht und Himmel) und die Pol-Höhe der Sternfeld-Achse (`state.starField.rotation`) gegen die Breite des Ankers.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.wegfindung",
            sek: 45,
            pfad: ["scripts/werkbank.cjs", "spec/profiband/haushalt.json", "stamm/vegetation-baum.js", "stamm/siedlung-satz.js", "stamm/siedlung-bewohner.js", "stamm/siedlung-wege.js", "stamm/bild-himmel.js", "welt-licht.js", "stamm/dirigent-takt.js", "stamm/gelaende-chunks.js", "voxel-worker.js", "planet-core.js", "stamm/feld-leben.js", "stamm/netz-portal.js"],
            welt: [{ wort: "gestirn_proben", ab: 5, was: "Gestirn-Lagen aus der Welt: die Mittags-Sonne je Saison-Wort und die Achse des Sternfelds" }],
            sprossen: {
                1: {
                    soll: [{ wort: "anteil_landmarke", richtung: "≥", wert: 0.9, wortlaut: "Kontrast ≥ 0,1, ≥ 0,9", feld: "richter" }],
                    umfang: { verlangt: 50, einheit: "Saaten der Sitzung", wortlaut: "N = 50 Saaten", feld: "richter" },
                },
                2: {
                    soll: [
                        { wort: "erfolg", richtung: "≥", wert: 0.9, wortlaut: "Erfolg ≥ 0,9", feld: "richter" },
                        { wort: "umweg", richtung: "≤", wert: 1.5, wortlaut: "Umweg ≤ 1,5", feld: "richter" },
                    ],
                    umfang: { verlangt: 1, einheit: "Landmarken in 1 km um die Wiese", wortlaut: "Ziel in 1 km per Landmarke", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "wege_deckung", richtung: "≥", wert: 0.95, wortlaut: "Wege-Deckung Karte ↔ Draufsicht ≥ 0,95", feld: "richter" },
                        { wort: "erfolg", richtung: "≥", wert: 0.9, wortlaut: "Ziel in 10 km mit Karte: Erfolg ≥ 0,9", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "km Weite des Planeten der Welt", wortlaut: "Karte aus dem Gesetz, 10 km", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "erfolg", richtung: "≥", wert: 0.8, wortlaut: "Auskunft befolgt → Ziel erreicht ≥ 0,8", feld: "richter" },
                        { wort: "landmarken_im_satz", richtung: "≥", wert: 1, wortlaut: "der Satz nennt ≥ 1 sichtbare Landmarke", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "Auskunft der Bewohner, 100 km, in einer Stadt von 10⁶", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "gestirn_fehler_grad", richtung: "≤", wert: 1, wortlaut: "Gestirn-Höhe im Bild ↔ Breite: Fehler ≤ 1°", feld: "richter" },
                        { wort: "seereise_erfolg", richtung: "≥", wert: 0.8, wortlaut: "Seereise 1 000 km nur mit Himmel: Erfolg ≥ 0,8", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "km Weite des Planeten der Welt", wortlaut: "Sonne und Sterne, 10³ km", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "erfolg", richtung: "≥", wert: 0.8, wortlaut: "Erfolg ≥ 0,8 mit den Mitteln der gewählten Epoche", feld: "richter" }],
                    umfang: { verlangt: 4e4, einheit: "km Umfang des Planeten der Welt", wortlaut: "Planet, 4·10⁴ km, mit den Mitteln der Epoche", feld: "umfang" },
                },
                7: {
                    soll: [
                        { wort: "erfolg", richtung: "≥", wert: 0.8, wortlaut: "N = 100 Saaten × 10 Ziele: Erfolg ≥ 0,8", feld: "richter" },
                        { wort: "umweg", richtung: "≤", wert: 1.5, wortlaut: "Umweg ≤ 1,5", feld: "richter" },
                        { wort: "hud_pfeile", richtung: "≤", wert: 0, wortlaut: "0 HUD-Pfeile", feld: "richter" },
                        { wort: "dv_ueber_pct", richtung: "≤", wert: 10, wortlaut: "≤ 10 % Δv über dem physikalischen", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Saaten der Sitzung", wortlaut: "N = 100 Saaten × 10 Ziele", feld: "richter" },
                },
            },
            lauf: async function wegfindungLauf(H, P, L) {
                const path = require("path");
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const z = await L.ev(`
                    const st = r.state;
                    const p = st.playerMesh.position;
                    const lm = (st.architectures || []).filter((e) => e && typeof e.type === "string" && e.position && (e.type.indexOf("felsturm") === 0 || e.type.indexOf("felsbogen") === 0));
                    const dist = (e) => Math.hypot(e.position.x - p.x, e.position.z - p.z);
                    const lm1 = lm.filter((e) => dist(e) <= 1000).length;
                    const lm13 = lm.filter((e) => dist(e) >= 1000 && dist(e) <= 3000).length;
                    const FC = globalThis.__fachwerkCore;
                    let max = 0, sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (Array.isArray(S.liste)) n = S.liste.length;
                        else {
                            if (!FC || typeof FC.leuteVon !== "function") throw new Error("fachwerk-core leuteVon fehlt (stamm/siedlung-bewohner.js:839)");
                            for (const sl of (S.plan && S.plan.slots) || []) { const k = FC.leuteVon(sl.ov); if (k > 0) n += k; }
                        }
                        if (n > max) max = n;
                    }
                    const sf = st.starField;
                    if (!sf) throw new Error("kein Sternfeld (state.starField, stamm/dirigent-takt.js:2422)");
                    const q = (y) => new T.Quaternion().setFromEuler(new T.Euler(sf.rotation.x, y, sf.rotation.z, sf.rotation.order));
                    const dq = q(1).multiply(q(0).invert());
                    const ax = new T.Vector3(dq.x, dq.y, dq.z).normalize();
                    if (sf.parent) ax.applyQuaternion(sf.parent.getWorldQuaternion(new T.Quaternion()));
                    const polHoehe = (Math.asin(Math.min(1, Math.abs(ax.y))) * 180) / Math.PI;
                    const alt = { tod: st.timeOfDay, phase: st.seasonPhase, season: st.season, auto: st.autoSeason, anker: r._saisonAnker, sonne: st._sonne ? Object.assign({}, st._sonne) : st._sonne };
                    const mittag = [];
                    try {
                        for (const w of ["fruehling", "sommer", "herbst", "winter"]) {
                            if (!r.setSeason(w)) throw new Error("das Saison-Wort " + w + " gilt nicht");
                            st.timeOfDay = 0.5;
                            const s = r._sonnenRichtung();
                            mittag.push({ w, phase: st.seasonPhase, hoehe: (Math.asin(Math.max(-1, Math.min(1, s.y))) * 180) / Math.PI });
                        }
                    } finally {
                        st.timeOfDay = alt.tod; st.seasonPhase = alt.phase; st.season = alt.season; st.autoSeason = alt.auto; r._saisonAnker = alt.anker; st._sonne = alt.sonne;
                    }
                    const anker = await r._planetAnker();
                    return { saat: st.worldMeta && st.worldMeta.seed, samen: r._planetSamen(), breite: anker.breite, laenge: anker.laenge, lm1, lm13, lmAlle: lm.length, max, sied, polHoehe, mittag };
                `);
                L.zeile("Wegfindung an der Wiese: " + JSON.stringify(z));
                // der Körper des Planeten der Welt: dieselbe reine Funktion wie im Planet-Faden (voxel-worker.js:1159 planetPlan(samen, PLANET_ERDE))
                const PC = require(path.resolve("planet-core.js"));
                const K = PC.planetPlan(z.samen, PC.PLANET_ERDE).koerper;
                const umfangKm = 2 * Math.PI * K.radiusKm;
                const zahl = (x, n) => String(+Number(x).toFixed(n == null ? 1 : n)).replace(".", ",");
                await L.je(1, async () => L.umfang(1, 1, "die Sitzung hält eine Saat (" + z.saat + "); an ihrer Wiese stehen " + z.lm13 + " Landmarken in 1–3 km (" + z.lmAlle + " geladen)"));
                await L.je(2, async () => {
                    if (z.lm1 < P.sprossen[2].umfang.verlangt) return L.umfang(2, z.lm1, "in 1 km um die Wiese steht keine Landmarke (felsturm/felsbogen, stamm/vegetation-baum.js:1519; " + z.lm13 + " in 1–3 km, " + z.lmAlle + " geladen)");
                    L.leser(2, "Erfolg und Umweg eines menschlichen Testspielers: kein Leser des Ziel-Gangs (Start, Ziel, gegangener Weg) — der Ort wäre eine Route neben `/latenz` (scripts/werkbank.cjs:1892), der Testspieler ein Panel (R11)", z.lm1);
                });
                await L.je(3, async () => {
                    if (umfangKm < P.sprossen[3].umfang.verlangt) return L.umfang(3, umfangKm, "der Planet der Welt misst " + zahl(umfangKm) + " km Umfang");
                    L.leser(3, "Karte aus dem Gesetz: kein Haken, der die Welt als Karte vor den Spieler legt (Höhenlinien, Wege, Ortsnamen) — `_wegeKarteEnsure` (stamm/siedlung-wege.js:16) ist eine Boden-Textur, keine Karte des Spielers", umfangKm);
                });
                await L.je(4, async () => {
                    if (z.max < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.max, "die größte Siedlung der Sitzung trägt " + z.max + " Bewohner (" + z.sied + " Siedlungen) — keine Stadt von 10⁶");
                    L.leser(4, "Auskunft: kein Satz eines Bewohners aus dem Wegenetz (stamm/siedlung-wege.js:16)", z.max);
                });
                // S5 · Gestirn-Höhe ↔ Breite: die Mittags-Sonne je Saison-Wort gegen 90° − |φ − δ|, die Pol-Höhe der Sterne gegen |φ|
                await L.je(5, async () => {
                    const phiG = (z.breite * 180) / Math.PI;
                    const s = phiG < 0 ? -1 : 1;
                    const zeilen = z.mittag.map((m) => {
                        const delta = (s * Math.asin(Math.sin(K.neigungRad) * Math.sin(2 * Math.PI * m.phase)) * 180) / Math.PI;
                        const soll = 90 - Math.abs(phiG - delta);
                        return { w: m.w, ist: m.hoehe, soll, f: Math.abs(m.hoehe - soll) };
                    });
                    const fSonne = Math.max(...zeilen.map((x) => x.f));
                    const fPol = Math.abs(z.polHoehe - Math.abs(phiG));
                    const f = Math.max(fSonne, fPol);
                    const schlecht = zeilen.reduce((a, x) => (x.f > a.f ? x : a), zeilen[0]);
                    L.zeile("Gestirne bei Breite " + zahl(phiG, 2) + "°: " + JSON.stringify(zeilen) + " · Pol " + zahl(z.polHoehe, 2) + "°");
                    if (f <= 1) return L.leser(5, "Seereise 1 000 km nur mit Himmel: kein Leser des Erfolgs — die Reise ist ein Sprung der Konsole (stamm/feld-leben.js:1278), keine Fahrt über See unter dem Himmel", umfangKm);
                    L.gemessen(5, { gestirn_fehler_grad: +f.toFixed(3) }, {
                        erzeugt: umfangKm,
                        welt: { gestirn_proben: z.mittag.length + 1 },
                        taeter:
                            "die Sonnenbahn kennt weder Breite noch Saison (welt-licht.js:711 `sonnenRichtung`): Mittag " + schlecht.w + " " + zahl(schlecht.ist) + "° statt " + zahl(schlecht.soll) + "°; Pol der Sterne " + zahl(z.polHoehe) + "° statt " + zahl(Math.abs(phiG)) +
                            "° (stamm/dirigent-takt.js:2422 feste Achse); Seereise: kein Leser (stamm/feld-leben.js:1278 die Reise springt)",
                    });
                });
                await L.je(6, async () => {
                    if (umfangKm < P.sprossen[6].umfang.verlangt) return L.umfang(6, umfangKm, "der Planet der Welt misst " + zahl(umfangKm) + " km Umfang");
                    L.leser(6, "Mittel der Epoche: die Reise ist ein Sprung der Konsole in eine neue Welt (stamm/feld-leben.js:1278 → `_reiseBetreten` stamm/netz-portal.js:660), keine Fahrt mit Karte, Schiff oder Fahrzeug der Epoche", umfangKm);
                });
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält eine Saat (" + z.saat + ") und einen Planeten — kein Nachbarplanet, keine Bahn zwischen Planeten"));
            },
        })
    );

    // ─────────── erleben.spieler.zeit — Die Zeit des Spielers: Dehnen, Raffen, Springen ───────────
    // S1 misst die Sonnenbahn der Welt (`_sonnenRichtung`, die Quelle von Licht und Himmel) über den Tag je Saison-Wort gegen die Ephemeride
    // der Breite des Ankers (ε und Drehsinn aus dem Körper des Planeten, die Nordrichtung frei gedreht und gespiegelt) und das Bildpaar des
    // Saison-Worts (sommer · winter · sommer, wahl 0); S2–S6 zählen die Zeit-Verben (DSL-Ops, Sätze der Konsole), die Tag-Länge und das
    // Jahr der Welt; S7–S9 die Zeitachse des Planeten, gefragt im Planet-Faden (`_planetAuftrag` planet-ort an −4 500 · −4 000 · +1 000 · +5 000 Ma).
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.zeit",
            sek: 60,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "scripts/lib/ausgabe-aufnahme.cjs", "scripts/lib/abnahme-urteil.cjs", "spec/profiband/haushalt.json", "stamm/bild-himmel.js", "welt-licht.js", "stamm/daten.js", "stamm/feld-dsl.js", "stamm/feld-leben.js", "stamm/gelaende-chunks.js", "voxel-worker.js", "planet-core.js", "stamm/netz-portal.js"],
            welt: [{ wort: "zeit_proben", ab: 1, was: "Zustände der Welt-Uhr, im Lauf gelesen" }],
            sprossen: {
                1: {
                    soll: [{ wort: "sonnenbahn_fehler_grad", richtung: "≤", wert: 1, wortlaut: "Sonnenbahn gegen Ephemeride der Breite ≤ 1°", feld: "richter" }],
                    umfang: { verlangt: 60, einheit: "min Tag-Länge (Regler des Spielers, ab 1 min)", wortlaut: "Tag-Länge 1–60 min, Jahreszeit per Spieler-Wort", feld: "umfang" },
                    welt: [
                        { wort: "sonnen_proben", ab: 100, was: "Sonnen-Richtungen der Welt über Uhr und Saison-Wort" },
                        { wort: "saison_bild_delta", ab: 1, was: "Graustufen, um die das Saison-Wort Sommer → Winter das Bild über dem Rauschen eines Wiederholungs-Schusses ändert" },
                    ],
                },
                2: {
                    soll: [
                        { wort: "fallzeit_abweichung_pct", richtung: "≤", wert: 5, wortlaut: "Fallzeit ±5 % zum Fallgesetz", feld: "richter" },
                        { wort: "sprung_px", richtung: "≤", wert: 2, wortlaut: "≤ 2 px Sprung je Bild", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "× Zeitlupe als Verb des Spielers", wortlaut: "Zeitlupe 10× (Fliegen-Takt)", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "feld_abweichung_pct", richtung: "≤", wert: 5, wortlaut: "Feld-Abweichung ≤ 5 %", feld: "richter" },
                        { wort: "bewohner_ort_pct", richtung: "≥", wert: 80, wortlaut: "der Ort von ≥ 80 % der Bewohner", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "× Raffer des Tags als Verb des Spielers", wortlaut: "Raffer 10³: ein Tag in 90 s, als Spieler-Verb", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "laub_bestand_abweichung_pct", richtung: "≤", wert: 10, wortlaut: "Laub-Deckung und Bestand nach Raffer-Jahr ±10 % zum Normal-Lauf", feld: "richter" }],
                    umfang: { verlangt: 1e5, einheit: "× Raffer des Jahrs der Welt", wortlaut: "Raffer ~10⁵: ein Jahr in ≤ 5 min", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "eiche_kronenform", richtung: "≥", wert: 0.7, wortlaut: "Eiche 0 → 100 Jahre Kronenform ≥ 0,7", feld: "richter" },
                        { wort: "sukzession", richtung: "≥", wert: 0.8, wortlaut: "in der Folge realer Chronosequenzen (Pionier → Busch → Hochwald) ≥ 0,8", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Jahre, die die Welt in einer Spielstunde ohne Sprung trägt", wortlaut: "10² Jahre: Generationen, Baum-Zeit, Sukzession", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "stadt_betretbar_s", richtung: "≤", wert: 5, wortlaut: "Stadt an Zufallsdatum betretbar ≤ 5 s", feld: "richter" }],
                    umfang: { verlangt: 1e4, einheit: "Jahre, die die Welt in einer Spielstunde ohne Sprung trägt", wortlaut: "10⁴ Jahre: Kulturen kommen und gehen", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "ego_bild_s", richtung: "≤", wert: 5, wortlaut: "Raffer an Zufallsdatum anhalten: Ego-Bild ≤ 5 s", feld: "richter" }],
                    umfang: { verlangt: 1e8, einheit: "Jahre der Zeitachse des Planeten", wortlaut: "10⁸ Jahre: Platten driften, Gebirge wachsen, Arten entstehen", feld: "umfang" },
                },
                8: {
                    soll: [{ wort: "halte_im_band", richtung: "≥", wert: 6, wortlaut: "an 6 Halten der Zukunft Kontinentlage, Ozean und Sonnenscheibe im Band der Rechnung", feld: "richter" }],
                    umfang: { verlangt: 5, einheit: "Ga Zukunft der Zeitachse des Planeten", wortlaut: "10 min Raffer −4,5 Ga → +5 Ga an 20 Orten", feld: "richter" },
                },
                9: {
                    soll: [
                        { wort: "ankunft_s", richtung: "≤", wert: 5, wortlaut: "Ankunft ≤ 5 s", feld: "richter" },
                        { wort: "sprung_bild_diff_pct", richtung: "≤", wert: 1, wortlaut: "zweimal gesprungen = dieselbe Welt (Bild-Diff ≤ 1 %)", feld: "richter" },
                    ],
                    umfang: { verlangt: 13.8, einheit: "Ga Zeitachse des Planeten", wortlaut: "Millisekunde ↔ 13,8 Ga (≈ 21 Dekaden) stufenlos", feld: "umfang" },
                },
            },
            lauf: async function zeitLauf(H, P, L) {
                const fs = require("fs");
                const path = require("path");
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const z = await L.ev(`
                    const st = r.state;
                    const alt = { tod: st.timeOfDay, phase: st.seasonPhase, season: st.season, auto: st.autoSeason, anker: r._saisonAnker, sonne: st._sonne ? Object.assign({}, st._sonne) : st._sonne };
                    const proben = [];
                    try {
                        for (const w of ["fruehling", "sommer", "herbst", "winter"]) {
                            if (!r.setSeason(w)) throw new Error("das Saison-Wort " + w + " gilt nicht");
                            const phase = st.seasonPhase;
                            for (let i = 0; i < 50; i++) {
                                st.timeOfDay = i / 50;
                                const d = r._sonnenRichtung();
                                proben.push([w, phase, i / 50, d.x, d.y, d.z]);
                            }
                        }
                    } finally {
                        st.timeOfDay = alt.tod; st.seasonPhase = alt.phase; st.season = alt.season; st.autoSeason = alt.auto; r._saisonAnker = alt.anker; st._sonne = alt.sonne;
                    }
                    const ops = Object.keys(r.dslEffects || {});
                    const saetze = (r.chatSystemPatterns || []).map((c) => String((c && c.example) || ""));
                    const worte = ops.concat(saetze);
                    const zeitlupe = worte.filter((k) => /zeitlupe|slow|langsam/i.test(k));
                    const raffer = worte.filter((k) => /raffer|time_?scale|zeit_?faktor|zeitfaktor/i.test(k));
                    const anker = await r._planetAnker();
                    const samen = r._planetSamen();
                    await r._fadenQuelle();
                    const achse = [];
                    for (const zeitMa of [-4500, -4000, 1000, 5000]) {
                        try {
                            const o = await r._planetAuftrag({ type: "planet-ort", samen, breite: (anker.breite * 180) / Math.PI, laenge: (anker.laenge * 180) / Math.PI, zeitMa });
                            achse.push({ zeitMa, ok: true, land: !!o.land });
                        } catch (e) {
                            achse.push({ zeitMa, ok: false, grund: String((e && e.message) || e).slice(0, 140) });
                        }
                    }
                    return {
                        proben, breite: anker.breite, samen,
                        tagMin: r.constructor.DAY_LENGTH_MIN_MINUTES, tagMax: r.constructor.DAY_LENGTH_MAX_MINUTES,
                        jahrSek: st.seasonYearSeconds > 0 ? st.seasonYearSeconds : 2400, jahrSekGesetzt: st.seasonYearSeconds,
                        ops: ops.length, saetze: saetze.length, zeitlupe, raffer, achse,
                    };
                `);
                L.zeile("Zeit der Welt: " + JSON.stringify(Object.assign({}, z, { proben: z.proben.length })));
                const zahl = (x, n) => String(+Number(x).toFixed(n == null ? 1 : n)).replace(".", ",");
                // S1 · die Sonnenbahn gegen die Ephemeride der Breite (Meeus: sin h = sin φ sin δ + cos φ cos δ cos H)
                const PC = require(path.resolve("planet-core.js"));
                const K = PC.planetPlan(z.samen, PC.PLANET_ERDE).koerper;
                const RAD = Math.PI / 180;
                const phi = z.breite, eps = K.neigungRad, dreh = K.drehsinn || 1, hem = phi < 0 ? -1 : 1;
                const ephem = (p, t) => {
                    const dl = hem * Math.asin(Math.sin(eps) * Math.sin(2 * Math.PI * p));
                    const Hw = 2 * Math.PI * (t - 0.5) * dreh;
                    return [-Math.cos(dl) * Math.sin(Hw), Math.cos(phi) * Math.sin(dl) - Math.sin(phi) * Math.cos(dl) * Math.cos(Hw), Math.sin(phi) * Math.sin(dl) + Math.cos(phi) * Math.cos(dl) * Math.cos(Hw)];
                };
                const paare = z.proben.map(([w, p, t, x, y, zz]) => ({ w, t, g: [x, y, zz], e: ephem(p, t) })).filter((q) => q.g[1] > 0 || q.e[2] > 0);
                const winkel = (a, b) => Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.hypot(...a) * Math.hypot(...b))))) / RAD;
                let best = { f: Infinity, psi: 0, m: 1, w: null, t: null };
                const pruefe = (psi, m) => {
                    const c = Math.cos(psi), sn = Math.sin(psi);
                    let f = 0, wo = null;
                    for (const q of paare) {
                        const [E, N, U] = q.e;
                        const a = winkel([E * c - m * N * sn, U, E * sn + m * N * c], q.g);
                        if (a > f) (f = a), (wo = q);
                        if (f >= best.f) return;
                    }
                    best = { f, psi, m, w: wo && wo.w, t: wo && wo.t };
                };
                for (const m of [1, -1]) for (let g = 0; g < 360; g += 1) pruefe(g * RAD, m);
                const grob = best.psi;
                for (let g = -1; g <= 1; g += 0.05) pruefe(grob + g * RAD, best.m);
                L.zeile("Sonnenbahn bei Breite " + zahl(phi / RAD, 2) + "°: Fehler " + zahl(best.f, 2) + "° (" + paare.length + " Proben, Nord " + zahl(best.psi / RAD) + "°, Spiegel " + best.m + ", am größten " + best.w + " t " + best.t + ")");
                // S2 · Zeitlupe: ein Verb des Spielers, das die Zeit dehnt
                await L.je(2, async () => {
                    if (!z.zeitlupe.length) return L.umfang(2, 1, "kein Verb des Spielers dehnt die Zeit: " + z.ops + " DSL-Ops (stamm/feld-dsl.js:926) und " + z.saetze + " Sätze der Konsole (stamm/feld-leben.js:1004) tragen keine Zeitlupe — die Welt läuft im Takt 1×");
                    L.leser(2, "Fallzeit und Sprung je Bild in der Zeitlupe (" + z.zeitlupe.join(", ") + "): kein Leser (scripts/werkbank.cjs:1892)");
                });
                // S3 · der Raffer des Tags: die Tag-Länge des Spielers (1 min je Tag = 1 440×)
                await L.je(3, async () => {
                    const raffer = 86400 / (z.tagMin * 60);
                    if (raffer < P.sprossen[3].umfang.verlangt && !z.raffer.length) return L.umfang(3, raffer, "die kürzeste Tag-Länge des Spielers ist " + z.tagMin + " min (stamm/daten.js:146): Raffer " + zahl(raffer, 0) + "×");
                    L.leser(3, "Zustand nach Raffer ↔ nach Echtzeit-Lauf: kein Leser, der Feld, Wetter und Bewohner-Orte eines gerafften Tags gegen den Echtzeit-Tag hält — der Raffer des Spielers ist die Tag-Länge (`setDayLength`, stamm/bild-himmel.js:2774, " + z.tagMin + " min je Tag)", raffer);
                });
                // S4 · der Raffer des Jahrs: ein Jahr der Welt dauert seasonYearSeconds Spielzeit (stamm/bild-himmel.js:970)
                const jahrRaffer = (365.25 * 86400) / z.jahrSek;
                const jahreJeStunde = 3600 / z.jahrSek;
                await L.je(4, async () => {
                    if (jahrRaffer < P.sprossen[4].umfang.verlangt) return L.umfang(4, jahrRaffer, "ein Jahr der Welt dauert " + z.jahrSek + " s Spielzeit (seasonYearSeconds " + z.jahrSekGesetzt + ", stamm/bild-himmel.js:970): Raffer " + zahl(jahrRaffer, 0) + "×; kein Verb des Spielers rafft das Jahr auf ≤ 5 min");
                    L.leser(4, "Laub-Deckung und Bestand nach Raffer-Jahr gegen den Normal-Lauf: kein Leser (stamm/bild-himmel.js:898 `_tickSeason`)", jahrRaffer);
                });
                const ohneSprung = "eine Spielstunde trägt " + zahl(jahreJeStunde, 2) + " Jahre (ein Jahr = " + z.jahrSek + " s); der Sprung der Konsole nimmt nur ganze Ma (stamm/feld-leben.js:1278)";
                await L.je(5, async () => {
                    if (jahreJeStunde < P.sprossen[5].umfang.verlangt) return L.umfang(5, jahreJeStunde, ohneSprung);
                    L.leser(5, "Häuser-, Bewohner- und Kronen-Kurve über 10² Jahre: kein Leser (stamm/bild-himmel.js:898)", jahreJeStunde);
                });
                await L.je(6, async () => {
                    if (jahreJeStunde < P.sprossen[6].umfang.verlangt) return L.umfang(6, jahreJeStunde, ohneSprung);
                    L.leser(6, "Bildpaar vor/nach über 10⁴ Jahre: kein Leser (stamm/bild-himmel.js:898)", jahreJeStunde);
                });
                // S7–S9 · die Zeitachse des Planeten, gefragt im Planet-Faden
                const ok = z.achse.filter((a) => a.ok).map((a) => a.zeitMa);
                const achseText = "die Zeitachse des Planeten (planet-core im Planet-Faden) antwortet an " + z.achse.map((a) => a.zeitMa + " Ma " + (a.ok ? "ja" : "nein")).join(" · ");
                const minMa = ok.length ? Math.min(...ok) : 0, maxMa = ok.length ? Math.max(...ok) : 0;
                await L.je(7, async () => {
                    const jahre = (maxMa - minMa) * 1e6;
                    if (jahre < P.sprossen[7].umfang.verlangt) return L.umfang(7, jahre, achseText);
                    L.leser(7, "Raffer an Zufallsdatum anhalten: die Zeitachse des Planeten hat keinen Raffer — die Zeit ist ein Sprung der Konsole in ganzen Ma in eine neue Welt (stamm/feld-leben.js:1278 → stamm/netz-portal.js:660); kein Leser der Zeit bis zum Ego-Bild", jahre);
                });
                await L.je(8, async () => {
                    const ga = maxMa / 1000;
                    if (ga < P.sprossen[8].umfang.verlangt) return L.umfang(8, ga, achseText + " — kein Raffer, die Zukunft endet vor +5 Ga, der Anfang nach −4,5 Ga");
                    L.leser(8, "der ungeschnittene Raffer: kein Raffer über die Zeitachse (stamm/feld-leben.js:1278)", ga);
                });
                await L.je(9, async () => {
                    const ga = (maxMa - minMa) / 1000;
                    if (ga < P.sprossen[9].umfang.verlangt) return L.umfang(9, ga, achseText + " — " + zahl(ga, 2) + " Ga, nicht bis zum ersten Licht; der Sprung nimmt nur ganze Ma");
                    L.leser(9, "Sprung an jedes Datum: kein Leser der Ankunft je Datum (stamm/netz-portal.js:660)", ga);
                });
                // S1 · das Bildpaar des Saison-Worts an derselben Pose (sommer · winter · sommer): zuletzt, es kostet drei Schüsse
                await L.je(1, async () => {
                    const kam = await L.ev("r._loopCamera(performance.now()); const c = r.state.camera; return [...c.position.toArray(), ...c.getWorldDirection(new T.Vector3()).multiplyScalar(20).add(c.position).toArray()];");
                    const AU = require(path.resolve("scripts/lib/abnahme-urteil.cjs"));
                    const schuss = async (saison, name) => {
                        const b = await L.wb("/bild", { px: kam[0], py: kam[1], pz: kam[2], lx: kam[3], ly: kam[4], lz: kam[5], w: 640, h: 360, wahl: 0, uhr: 0.5, saison, datei: path.join(L.D, P.leiter + "-S1-" + name + ".png") }, 120);
                        return { datei: b.datei, bild: AU.pngLesen(fs.readFileSync(b.datei)) };
                    };
                    const abstand = (a, b) => {
                        if (a.W !== b.W || a.H !== b.H) throw new Error("die Bilder des Paars haben ungleiche Maße");
                        let s = 0;
                        for (let i = 0; i < a.u8.length; i += 4) s += (Math.abs(a.u8[i] - b.u8[i]) + Math.abs(a.u8[i + 1] - b.u8[i + 1]) + Math.abs(a.u8[i + 2] - b.u8[i + 2])) / 3;
                        return s / (a.W * a.H);
                    };
                    const so1 = await schuss("sommer", "sommer");
                    const wi = await schuss("winter", "winter");
                    const so2 = await schuss("sommer", "sommer-wieder");
                    const rauschen = abstand(so1.bild, so2.bild);
                    const saison = abstand(so1.bild, wi.bild);
                    const delta = saison - rauschen;
                    const taeter = [];
                    if (!(best.f <= 1)) taeter.push("die Sonnenbahn kennt weder Breite noch Saison (welt-licht.js:711 `sonnenRichtung`, gelesen über stamm/bild-himmel.js:1383): " + zahl(best.f, 2) + "° gegen die Ephemeride bei " + zahl(phi / RAD, 2) + "° Breite, am größten " + best.w + " t " + best.t);
                    if (!(delta >= 1)) taeter.push("das Saison-Wort winter ändert das Bild um " + zahl(saison, 2) + " Graustufen bei " + zahl(rauschen, 2) + " Rauschen (stamm/bild-himmel.js:963 `setSeason`)");
                    L.gemessen(1, { sonnenbahn_fehler_grad: +best.f.toFixed(3) }, {
                        erzeugt: z.tagMin <= 1 ? z.tagMax : 0,
                        welt: { sonnen_proben: paare.length, saison_bild_delta: +delta.toFixed(3) },
                        taeter: taeter.join(" · ") || null,
                        beleg: { bilder: [so1.datei, wi.datei, so2.datei], saison: +saison.toFixed(3), rauschen: +rauschen.toFixed(3) },
                    });
                });
            },
        })
    );

    // ─────────── erleben.spieler.gemeinsam — Viele Menschen, EINE Welt ───────────
    // Zählt die Spieler der Sitzung: der eigene Leib + die Peers der EINEN Netz-Tafel (`state.p2p.peers`, stamm/dirigent-kern.js:541). Jede
    // Sprosse verlangt eine Menge echter Spieler (2 · 10 · 10² · … · 10⁶); unter ihr `L.umfang` mit der gezählten Zahl, über ihr fehlt der
    // Leser der Latenz Taste an A → Bild bei B (`L.leser`).
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.gemeinsam",
            sek: 20,
            pfad: ["scripts/werkbank.cjs", "stamm/dirigent-kern.js", "stamm/netz-p2p.js"],
            welt: [{ wort: "peer_bilder", ab: 1, was: "Bilder, in denen ein Peer-Leib der Sitzung stand" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "pose_latenz_p95_ms", richtung: "≤", wert: 150, wortlaut: "Taste an A → Leib im Bild von B p95 ≤ 150 ms", feld: "richter" },
                        { wort: "pixel_abweichung_pct", richtung: "≤", wert: 1, wortlaut: "Welt-Bild an gleicher Kamera ≤ 1 % Pixel-Abweichung", feld: "richter" },
                    ],
                    umfang: { verlangt: 2, einheit: "Spieler der Sitzung (echte Geräte)", wortlaut: "2 Spieler, zwei physische Geräte", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "werk_bei_b_s", richtung: "≤", wert: 1, wortlaut: "Werk von A bei B ≤ 1 s", feld: "richter" },
                        { wort: "verlorene_edits", richtung: "≤", wert: 0, wortlaut: "0 verlorene Edits", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "Spieler der Sitzung", wortlaut: "10 Spieler, ein Dorf", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "pose_latenz_p95_ms", richtung: "≤", wert: 150, wortlaut: "Pose-Latenz p95 ≤ 150 ms", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Spieler der Sitzung", wortlaut: "10² Spieler, eine Stadt", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "weltzeit_quote", richtung: "≥", wert: 0.99, wortlaut: "Welt-Zeit / Wand-Zeit ≥ 0,99", feld: "richter" },
                        { wort: "pose_latenz_p95_ms", richtung: "≤", wert: 200, wortlaut: "Pose-Latenz p95 ≤ 200 ms", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Spieler der Sitzung", wortlaut: "10³ (EVE-Größe, ohne Zeitdehnung)", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "pose_latenz_p95_ms", richtung: "≤", wert: 200, wortlaut: "Pose-Latenz p95 ≤ 200 ms an den echten Fenstern", feld: "richter" },
                        { wort: "zweiafc_pct", richtung: "≤", wert: 75, wortlaut: "2AFC ≤ 75 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e4, einheit: "Spieler der Sitzung", wortlaut: "10⁴ in einer Stadt", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "erreicht_pct", richtung: "≥", wert: 100, wortlaut: "A erreicht B über Reise und sieht ihn, 100 %", feld: "richter" }],
                    umfang: { verlangt: 1e5, einheit: "Spieler der Sitzung", wortlaut: "10⁵ auf einem Kontinent", feld: "umfang" },
                },
                7: {
                    soll: [
                        { wort: "ereignis_abweichung_s", richtung: "≤", wert: 1, wortlaut: "Ereignis-Zeitpunkt je echtem Fenster ±1 s", feld: "richter" },
                        { wort: "pixel_abweichung_pct", richtung: "≤", wert: 1, wortlaut: "(≤ 1 % Abweichung)", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Spieler der Sitzung", wortlaut: "10⁶ auf einem Planeten, verschiedene Zeiten und Rollen", feld: "umfang" },
                },
            },
            lauf: async function gemeinsamLauf(H, P, L) {
                const z = await L.ev("const p2p = r.state.p2p || {}; return { peers: p2p.peers instanceof Map ? p2p.peers.size : 0, an: !!p2p.enabled, verbunden: !!p2p.connected, raum: p2p.room || null };");
                L.zeile("Netz der Sitzung: " + JSON.stringify(z));
                const n = 1 + z.peers;
                for (const nr of [1, 2, 3, 4, 5, 6, 7])
                    await L.je(nr, async () => {
                        const v = P.sprossen[nr].umfang.verlangt;
                        if (n < v) return L.umfang(nr, n, "die Sitzung trägt " + n + " Spieler: den eigenen Leib und " + z.peers + " Peers (state.p2p.peers, stamm/dirigent-kern.js:541; p2p an " + z.an + ", verbunden " + z.verbunden + ")");
                        L.leser(nr, "Latenz und Welt-Bild über das Netz: kein Leser, der die Taste an A gegen das Bild bei B hält (stamm/netz-p2p.js:566 `_p2pHandleChannelMessage`)", n);
                    });
            },
        })
    );

    // ─────────── erleben.spieler.nichtleib — Sein, was kein Leib ist ───────────
    // Zählt an stadt-voll die Perspektiven, die der Spieler einnehmen kann (`playerSoulDefs` + `customSouls`: Seelen ohne Leib), die
    // Maschinen-Rollen der Welt (Baupläne, deren Rolle `_displayRole` machine oder vehicle nennt), die Bewohner der größten Siedlung und
    // die Jahre je Minute, die die Welt dem Spieler rafft (seasonYearSeconds). Der Fluss und die Stadt als Ganzes trägt die Welt, die
    // Perspektive nicht: `L.leser`; S5 schösse das Bildpaar erst bei einem Raffer von 10⁶ Jahren je Minute.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.nichtleib",
            sek: 45,
            pfad: ["scripts/werkbank.cjs", "spec/profiband/haushalt.json", "stamm/koerper-seele.js", "stamm/bau-buch.js", "stamm/siedlung-bewohner.js", "stamm/bild-himmel.js", "gelaende-core.js", "stamm/feld-leben.js"],
            welt: [{ wort: "ding_proben", ab: 1, was: "Perspektiven ohne Leib, die der Spieler im Lauf einnahm" }],
            sprossen: {
                1: { soll: [{ wort: "gefaelle_abweichung_pct", richtung: "≤", wert: 5, wortlaut: "der Weg ist die Gefälle-Linie der Welt (Abweichung ≤ 5 %)", feld: "richter" }] },
                2: {
                    soll: [{ wort: "verben_je_ding", richtung: "≥", wert: 3, wortlaut: "je Ding 3 Verben mit Weltwirkung im Bildpaar", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "Dinge ohne Leib, die der Spieler sein kann", wortlaut: "10 Dinge: Wolke, Wind, Feuer, Lava, Gletscher", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "wachstum_jahre", richtung: "≤", wert: 50, wortlaut: "das Wachstum folgt binnen 50 Spieljahren", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Bewohner der größten Siedlung der Sitzung", wortlaut: "100 Zufallsbewohner leben ihren Tag weiter", feld: "richter" },
                },
                4: {
                    soll: [
                        { wort: "verben_je_rolle", richtung: "≥", wert: 3, wortlaut: "je ≥ 3 arteigene Verben", feld: "richter" },
                        { wort: "panel_bauart_pct", richtung: "≥", wert: 70, wortlaut: "das Blind-Panel erkennt die Bauart ≥ 70 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "Maschinen-Rollen der Welt (Baupläne der Rolle machine/vehicle)", wortlaut: "10 Maschinen-Rollen: je ≥ 3 arteigene Verben", feld: "richter" },
                },
                5: {
                    auge: {
                        pose: "Orbit-Bild des Planeten über der Lage des Ankers nach gesetzter Hebung, im Raffer",
                        vorbild: "Gegenlauf derselben Saat ohne Hebung; Erd-Muster Gebirge → Regenschatten → Wüste (Anden/Atacama)",
                    },
                    umfang: { verlangt: 1e6, einheit: "Jahre je Minute im Raffer des Planeten", wortlaut: "im Raffer von 10⁶ Jahren je Minute", feld: "tiefe" },
                },
                6: {
                    soll: [{ wort: "anteil_spielbar", richtung: "≥", wert: 0.9, wortlaut: "spielbar mit ≥ 3 Verben mit Weltwirkung ≥ 0,9", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "Saaten der Sitzung", wortlaut: "N = 100 Zufalls-Dinge aus 10 Saaten", feld: "richter" },
                },
                7: {
                    soll: [{ wort: "anteil_spielbar", richtung: "≥", wert: 0.9, wortlaut: "spielbar mit ≥ 3 Verben mit Weltwirkung ≥ 0,9", feld: "richter", aus: 6 }],
                    umfang: { verlangt: 10, einheit: "Saaten der Sitzung", wortlaut: "N = 100 Zufalls-Dinge aus 10 Saaten", feld: "richter", aus: 6 },
                },
            },
            lauf: async function nichtleibLauf(H, P, L) {
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await L.ev(`
                    const st = r.state;
                    const seelen = Object.entries(r.playerSoulDefs || {}).concat(Object.entries(st.customSouls || {}));
                    const ohneLeib = seelen.filter(([k, d]) => !(d && (typeof d.build === "function" || (Array.isArray(d.bodyParts) && d.bodyParts.length)))).map(([k]) => k);
                    const t0 = performance.now();
                    const bps = Object.entries(st.blueprints || {});
                    const maschinen = [];
                    let geprueft = 0;
                    for (const [name, bp] of bps) {
                        if (performance.now() - t0 > 4000) break;
                        geprueft++;
                        const rolle = r._displayRole(bp);
                        if (rolle === "machine" || rolle === "vehicle") maschinen.push(name);
                    }
                    const FC = globalThis.__fachwerkCore;
                    let max = 0, sied = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                        sied++;
                        let n = 0;
                        if (Array.isArray(S.liste)) n = S.liste.length;
                        else {
                            if (!FC || typeof FC.leuteVon !== "function") throw new Error("fachwerk-core leuteVon fehlt (stamm/siedlung-bewohner.js:839)");
                            for (const sl of (S.plan && S.plan.slots) || []) { const k = FC.leuteVon(sl.ov); if (k > 0) n += k; }
                        }
                        if (n > max) max = n;
                    }
                    return { saat: st.worldMeta && st.worldMeta.seed, seelen: seelen.map(([k]) => k), ohneLeib, maschinen: maschinen.length, maschinenNamen: maschinen.slice(0, 12), geprueft, bauplaene: bps.length, max, sied, jahrSek: st.seasonYearSeconds > 0 ? st.seasonYearSeconds : 2400 };
                `);
                L.zeile("Perspektiven der Sitzung: " + JSON.stringify(z));
                const seelenText = z.seelen.length + " Seelen (" + z.seelen.join(", ") + "), " + z.ohneLeib.length + " ohne Leib";
                await L.je(1, async () =>
                    L.leser(1, "Perspektive Ding: kein Haken, der den Spieler zum Fluss macht — die Seele wechselt nur zwischen Leibern (stamm/koerper-seele.js:437 `_getSoulDef`, " + seelenText + "); den Lauf nach dem Gefälle trägt das Gesetz der Flüsse (gelaende-core.js:1953 `flussLaeufe`)")
                );
                await L.je(2, async () => {
                    if (z.ohneLeib.length < P.sprossen[2].umfang.verlangt) return L.umfang(2, z.ohneLeib.length, "der Spieler kann " + z.ohneLeib.length + " Dinge ohne Leib sein: " + seelenText + " (stamm/koerper-seele.js:437)");
                    L.leser(2, "je Ding 3 Verben mit Weltwirkung: kein Leser (stamm/koerper-seele.js:437)", z.ohneLeib.length);
                });
                await L.je(3, async () => {
                    if (z.max < P.sprossen[3].umfang.verlangt) return L.umfang(3, z.max, "die größte Siedlung der Sitzung trägt " + z.max + " Bewohner (" + z.sied + " Siedlungen)");
                    L.leser(3, "Perspektive Stadt: kein Haken, der den Spieler zur Stadt macht und eine Vorliebe (Hafen, Höhe) ins Wachstum gibt — die Siedlung kennt keinen Willen des Spielers (stamm/siedlung-bewohner.js:275 `_bewohnerMelden`)", z.max);
                });
                await L.je(4, async () => {
                    if (z.maschinen < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.maschinen, "die Welt trägt " + z.maschinen + " Baupläne der Rolle machine/vehicle (stamm/bau-buch.js:637 `_displayRole`; " + (z.maschinenNamen.join(", ") || "keine") + "; geprüft " + z.geprueft + " von " + z.bauplaene + ")");
                    L.leser(4, "Maschine sein: kein Haken, der den Spieler in die Maschine setzt — `mountArchitecture` trägt den Leib, nie Sinne und Verben der Maschine (stamm/koerper-fahrt.js:1158)", z.maschinen);
                });
                await L.je(5, async () => {
                    const jahreJeMinute = 60 / z.jahrSek;
                    if (jahreJeMinute < P.sprossen[5].umfang.verlangt) return L.umfang(5, jahreJeMinute, "die Welt rafft " + jahreJeMinute + " Jahre je Minute (ein Jahr = " + z.jahrSek + " s, stamm/bild-himmel.js:970); die Zeitachse des Planeten ist nur ein Sprung der Konsole (stamm/feld-leben.js:1278)");
                    await L.auge(5, { erzeugt: jahreJeMinute, b: { wahl: 0 } });
                });
                await L.je(6, async () => L.umfang(6, 1, "die Sitzung hält eine Saat (" + z.saat + ") — die Zufalls-Dinge verlangen " + P.sprossen[6].umfang.verlangt + " Saaten"));
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält eine Saat (" + z.saat + ") und eine Welt, eine Epoche"));
            },
        })
    );

    // ─────────── erleben.spieler.forscher — Instrument und Ursache — der Blick des Forschers ───────────
    // Zählt die Instrumente der Welt an den Affordanzen ihrer Baupläne (`computeBlueprintAffordances`: das Fernrohr ist magnifying, ein
    // Mikroskop, Thermometer, Kompass, Lot oder ein Zeit-Instrument kennt das Profil nicht), liest den Mond (`state.moonMesh`: Karte oder
    // Farbknoten am Stoff) und das Feld der Welt (`worldFieldAt`). Wo das Ding fehlt, das die Messung bräuchte (Krater, Feldkarte), nennt
    // `L.leser` den Haken; die Zahl der Instrumente und Lesungen urteilt `L.umfang`.
    LEITERN.push(
        leiter({
            leiter: "erleben.spieler.forscher",
            sek: 30,
            pfad: ["scripts/werkbank.cjs", "stamm/bau-teile.js", "stamm/koerper-fahrt.js", "stamm/dirigent-ankunft.js", "stamm/feld-leben.js"],
            welt: [{ wort: "messungen", ab: 1, was: "Messungen eines Instruments gegen den zweiten Weg in der Welt" }],
            sprossen: {
                1: { soll: [{ wort: "krater_lagefehler_pct", richtung: "≤", wert: 1, wortlaut: "Lagefehler ≤ 1 %", feld: "richter" }] },
                2: {
                    soll: [{ wort: "abweichung_pct", richtung: "≤", wert: 5, wortlaut: "(Eis schmilzt bei 0, Lot gegen Tauchgang) ±5 %", feld: "richter" }],
                    umfang: { verlangt: 5, einheit: "Instrumente der Welt", wortlaut: "5 Instrumente: dazu Mikroskop, Thermometer, Kompass, Lot", feld: "umfang" },
                },
                3: { soll: [{ wort: "treffer_pct", richtung: "≥", wert: 90, wortlaut: "die Karte sagt den Ort voraus, an dem der Spieler das Ding dann antrifft (Herde, Strömung) ≥ 90 %", feld: "richter" }] },
                4: {
                    soll: [{ wort: "ereignis_pct", richtung: "≥", wert: 90, wortlaut: "der Sprung in die gelesene Zeit zeigt das Ereignis ≥ 90 %", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "Lesungen eines Zeit-Instruments der Welt", wortlaut: "10 Lesungen (Eiszeit im Kern, Brand im Ring)", feld: "richter" },
                },
                5: { soll: [{ wort: "folge_pct", richtung: "≥", wert: 80, wortlaut: "die von der Feldkarte vorhergesagte Folge tritt ein ≥ 80 %", feld: "richter" }] },
                6: { soll: [{ wort: "zuwachs_prozentpunkte", richtung: "≥", wert: 30, wortlaut: "+30 Prozentpunkte", feld: "richter" }] },
                7: {
                    soll: [
                        { wort: "abweichung_pct", richtung: "≤", wert: 5, wortlaut: "Wert ±5 % gegen den zweiten Weg", feld: "richter" },
                        { wort: "vorhersage_pct", richtung: "≥", wert: 70, wortlaut: "Vorhersage ≥ 70 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "(Saat, Instrument)-Paare der Sitzung", wortlaut: "100 Zufalls-Messungen über Saaten", feld: "richter" },
                },
            },
            lauf: async function forscherLauf(H, P, L) {
                const z = await L.ev(`
                    const st = r.state;
                    const t0 = performance.now();
                    const bps = Object.entries(st.blueprints || {});
                    const art = {};
                    let geprueft = 0;
                    for (const [name, bp] of bps) {
                        if (performance.now() - t0 > 4000) break;
                        geprueft++;
                        const a = r.computeBlueprintAffordances(bp) || {};
                        for (const k of Object.keys(a)) if (a[k]) (art[k] = art[k] || []).push(name);
                    }
                    const m = st.moonMesh;
                    const mat = m && m.material;
                    const gp = m && m.geometry && m.geometry.parameters;
                    return {
                        saat: st.worldMeta && st.worldMeta.seed, bauplaene: bps.length, geprueft,
                        arten: Object.fromEntries(Object.entries(art).map(([k, v]) => [k, v.length])),
                        fernrohre: (art.magnifying || []).slice(0, 6),
                        mond: !!m, mondKarte: !!(mat && (mat.map || mat.colorNode)), mondTeile: gp ? [gp.widthSegments, gp.heightSegments] : null,
                        feld: typeof r.worldFieldAt === "function",
                    };
                `);
                L.zeile("Instrumente der Welt: " + JSON.stringify(z));
                // die Instrumente, die das Affordanz-Profil kennt (stamm/bau-teile.js:202): nur das Fernrohr (magnifying)
                const instrumente = ["magnifying"].filter((k) => z.arten[k] > 0);
                const artenText = Object.entries(z.arten).map(([k, n]) => k + " " + n).join(", ") || "keine";
                await L.je(1, async () =>
                    L.leser(1,
                        "Krater des Mondes: die Mondscheibe ist eine Kugel " + JSON.stringify(z.mondTeile) + (z.mondKarte ? " mit Karte" : " ohne Karte und Farbknoten") +
                        " (stamm/dirigent-ankunft.js:340) — kein Krater, dessen Lage Fernrohr und Anflug teilen; kein Anflug an den Mond; das Fernrohr vergrößert nur das Bild (stamm/koerper-fahrt.js:2246 `setZoomActive`, " + (z.arten.magnifying || 0) + " Fernrohr-Baupläne)")
                );
                await L.je(2, async () => {
                    if (instrumente.length < P.sprossen[2].umfang.verlangt) return L.umfang(2, instrumente.length, "die Affordanzen der Baupläne (stamm/bau-teile.js:202; " + artenText + "; geprüft " + z.geprueft + " von " + z.bauplaene + ") kennen als Instrument nur das Fernrohr — kein Mikroskop, Thermometer, Kompass, Lot");
                    L.leser(2, "je Instrument 20 Messungen gegen den zweiten Weg: kein Leser (stamm/bau-teile.js:202)", instrumente.length);
                });
                const feldkarte = "Feldkarte: kein Haken, der ein Feld der Welt (" + (z.feld ? "`worldFieldAt`, stamm/feld-leben.js:1793" : "kein `worldFieldAt`") + ") als Karte vor den Spieler legt";
                await L.je(3, async () => L.leser(3, feldkarte + " — Wärme, Strömung, Wind, Bestand, Dichte der Menschen"));
                await L.je(4, async () => {
                    const zeitInstrumente = ["bohrkern", "jahresringe", "schichtprofil", "sternspektrum"].filter((k) => z.arten[k] > 0);
                    if (zeitInstrumente.length < 1) return L.umfang(4, 0, "kein Zeit-Instrument in den Affordanzen der Baupläne (stamm/bau-teile.js:202; " + artenText + ") — 0 Lesungen der Vergangenheit");
                    L.leser(4, "Lesung → Sprung in die gelesene Zeit: kein Leser (stamm/feld-leben.js:1278)");
                });
                await L.je(5, async () => L.leser(5, feldkarte + " — die vorhergesagte Folge eines Versuchs hat keine Karte, die sie nennt"));
                await L.je(6, async () => L.leser(6, "Lernen blinder Neulinge: kein Protokoll im Spiel (vor/nach 60 min, Kontrollgruppe Lehrfilm) — ein Panel nach R11 (vision/REGELN.md:17), kein Haken der Welt"));
                await L.je(7, async () => {
                    const n = 1 * instrumente.length;
                    if (n < P.sprossen[7].umfang.verlangt) return L.umfang(7, n, "eine Saat (" + z.saat + ") × " + instrumente.length + " Instrumente = " + n + " (Saat, Instrument)-Paare");
                    L.leser(7, "Messung gegen den zweiten Weg über Saaten: kein Leser (stamm/bau-teile.js:202)", n);
                });
            },
        })
    );
}

module.exports = LEITERN.flat();

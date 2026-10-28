#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-hoehlen-sicht.cjs — DIE HÖHLEN-SICHT: die Höhlen-Schicht des Bodens (Fels gegen Luft unter der obersten festen Ecke
// ihrer Spalte) zeichnet nur, was ein Strahl durch Luft erreicht. Die Wahl je Pass (`_chunkSatzPass` → `_hoehlenSicht`) läuft vom Auge durch Mündung und Portale (Schirm-Rechteck +
// Tiefe), die Kaskade vom sichtbaren Empfänger zum Licht. Die Wand prüft sie gegen eine UNABHÄNGIGE Wahrheit — Strahlen
// gegen jedes Dreieck des Boden-Satzes (scripts/lib/hoehlen-strahl.cjs) — an der Mess-Wiese, Null-Renderer:
//   (a) SPIEGEL — Main (`_voxelHoehlenGraph` im Sync-Bau) und Worker (`hoehlenGraph`) liefern für dieselben Chunks
//       byte-gleich Positionen, Index, je Dreieck die Zelle seiner Luft und den Graph (Knoten · Mündungen · Seiten · Kanten ·
//       Rand);
//   (b) BILD — je Blick (Wiese · Hang · Mündung · Höhle · Hinaus) trifft jeder Strahl des Auges zuerst eine Zelle, die im
//       Abschnitt des Passes steht: eine Höhlen-Zelle, die aus der Mündung sichtbar ist, darf nie fehlen (sonst ein Loch).
//       Jeder Blick läuft, bis jede Mündung im Bild ihre Horizont-Sperre trägt (die Probe wirkt ganz, nicht nur 8 je Bild);
//   (b') HINAUS — das Auge in Höhlen-Luft, 16 m unter der Wiese (−1041/−738, der Ring um den Spieler dort), der Blick durch
//       die Mündung hinaus: die Strahlen beginnen in der Höhle, laufen an den Sperren vorbei und erreichen Mündungen
//       dahinter (`_hoehlenHinaus`); der Blick ist scharf nur, solange die Sperre ohne den Weg hinaus dort rot fällt. Mund,
//       Gang und Auge liegen auf dem Gitter der Stufe 0; eine versiegelte Zelle zeichnet nie,
//       ein Strahl läuft durch sie weiter (der Geomorph der Stufe hebt sie durch gezeichnete Flächen, `versiegelt` zählt es);
//   (c) SCHATTEN — je Blick: jeder Empfänger des Bilds, dessen Weg zur Sonne im Licht-Frustum Boden trifft, trifft einen,
//       den die Kaskade zeichnet (sonst fiele Licht durch Fels: ein Licht-Leck);
//   (d) NICHT LEER — Mündung und Höhle zeigen Höhlen-Flächen, und die Linse ist scharf: ohne die Höhlen-Zellen im Abschnitt
//       nennt sie die fehlenden (sonst prüfte (b) nichts);
//   (e) SCHNITT — die Wiese zeichnet weniger Höhlen-Dreiecke, als ihr Frustum trägt (sonst wäre die Sicht tot);
//   (f) DER STOFF AM GRAPH — der Boden-Stoff legt die Himmels-Sicht als Verdeckung, Normale und Pool-Gewicht (der gebaute
//       Knoten-Graph, der Ruf der EINEN BRDF; dass der Chokepoint die Höhle wählt, misst (b)/(d)/(e) am Bild); (g) kein Page-Error (der EINE Sammler, welt-boot);
//   (h) GEDÄCHTNIS — die gemerkte Horizont-Sperre gilt nur dem Boden, den sie gemessen hat: im Stand an der Mündung hält
//       sie (sonst prüfte die Wand nichts), nach einem neuen Boden (`_chunkSatzMarke`: Graben, LOD-Naht) misst der nächste
//       Pass jede Mündung im Bild neu;
//   (i) HIMMELS-LICHT — der Boden-Stoff liest die Himmels-Sicht je Vertex (`aoNode` trägt
//       `aHimmel`, gelaende-core `himmelsSicht` aus dem Höhlen-Graph): kein Höhlen-Vertex trägt mehr Himmel, als sein gerader Abstand zur
//       nächsten Himmels-Fläche lässt, und die Mündung bleibt hell.
//   (j) LICHT DES AUGES — in der Höhle die wahre Normale und das Licht des Auges nach seinem Gesetz, im Freien aus; BLENDUNG:
//       es fällt nicht mit dem Abstand (die Wand in 0,3 m höchstens 1,5× die Karte in 2 m — mit 1/d lag sie weiß). Es ist
//       EIN Term des Boden-Stoffs (`_buildPbrNodeMaterial`, gewichtet mit 1 − `aHimmel`), seine Stärke die geteilte Uniform
//       `_augenLeuchte`, ein Platz des Licht-Pools mit Himmels-Ersatz: der Boden reicht dem Pool seine Himmels-Sicht,
//       `_lichtPoolTerm` ist das EINE Punktlicht-Gesetz des Stamms (der Abfall des Labors); die Wand zählt dazu die Wesen in
//       Höhlen-Luft (ohne Himmels-Sicht tragen sie es nicht);
//   (l) SZENEN-LICHT: unter freiem Himmel trägt jedes Licht der Szene Licht — ein Licht auf Stärke 0 steht trotzdem im
//       Licht-Hash JEDES beleuchteten Stoffs und kostet in jedem Fragment;
//   (k) DER FELS HAT STOFF — jeder Höhlen-Vertex ohne Himmel und jeder Kliff-Vertex trägt den Fels-Stoff (gelaende-core
//       `felsFarbe` über `_felsStoff`: Bänke, Kanten, Mulden, Flechte, Moos), Streuung σ/Mittel ≥ 0,08, Albedo ≤ 0,30.
//   (m) DIE BANKUNG IST UNREGELMÄSSIG — am Gesetz (gelaende-core `felsBankung`, ohne Browser): der
//       Variationskoeffizient der Bank-Mächtigkeit ≥ 0,4, die Eigen-Welligkeit der Fugen ≥ 0,1 Bänke, der Durchlauf der Klüfte
//       durch die Fuge ≥ 0,4; der Detail-Term des Boden-Shaders liest dieselben Größen (paketDicke · fugeWelle · kehle ·
//       kluftVersatz · fugeLambda).
//   (n) DER STOFF ENTSTEHT IM WORKER — wo der Worker das Netz baut, baut er Himmels-Sicht, Fels-Stoff und Schutt
//       (gelaende-core `himmelsSicht` · `felsStoff` in `buildChunkMesh`) und reicht sie per Transfer: im Ring der Mess-Wiese
//       ruft der Haupt-Thread in keinem Worker-Bau (`_buildVoxelChunkDataFromWorkerMesh`) das Fels-Gesetz, und (a) prüft
//       Himmel, Schutt und Farbe des Workers byte-gleich gegen den Sync-Bau. Gegenprobe: der Sync-Bau ruft es (sonst
//       zählte die Wand blind).
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter — Spiegel-Drift, Loch, Licht-Leck,
// leerer Blick, blinde Linse, toter Schnitt, stumpfer Hinaus-Blick, fehlender Chokepoint — MUSS rot fallen und
// ihn beim Namen nennen.
//   node scripts/diag-hoehlen-sicht.cjs [--selftest]   (npm run gate:hoehlen-sicht; Port HOEHLEN_SICHT_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const PFLICHT = ["wiese", "hang", "muendung", "hoehle", "hinaus"];
// Natürliche Mündungen je km² im Mittelgebirge (Karte K16): die Welt trägt die Höhlen sichtbar.
const MUENDUNGEN_JE_KM2 = 1;
const IN_HOEHLE = ["muendung", "hoehle", "hinaus"];
// (k) Der Fels-Stoff: höchstens 1 % der Fels-Vertices ohne das Gesetz (Summen-Reihenfolge der Krümmung an den
// Satz-Nähten), Streuung σ/Mittel der Leuchtdichte ≥ 0,08 (die gleichförmige Masse liegt bei 0), Albedo ≤ 0,30 (nordstern §1).
const FELS_FREMD_ANTEIL = 0.01;
const FELS_STREUUNG_MIN = 0.08;
const FELS_ALBEDO_MAX = 0.3;
// (m) Die Bankung (K17 Nachbesserung 1): Natur-Bankung streut stark (Variationskoeffizient ≳ 0, 4).
const BANK_CV_MIN = 0.4;
const FUGE_WELLE_MIN = 0.1;
const KLUFT_DURCHLAUF_MIN = 0.4;

// Das Urteil über einen Befund: Liste der Verstöße (leer = grün). Rein, im Selbsttest wie im Lauf.
function urteil(b) {
    const v = [];
    if (!b.spiegel || b.spiegel.length === 0) v.push("SPIEGEL: kein Chunk zwischen Main und Worker verglichen");
    for (const sp of b.spiegel || []) {
        if (sp.fehler) {
            v.push(`SPIEGEL: Chunk ${sp.chunk} (LOD ${sp.lod}): ${sp.fehler}`);
            continue;
        }
        for (const [feld, gleich] of Object.entries(sp.felder || {}))
            if (!gleich) v.push(`SPIEGEL: Chunk ${sp.chunk} (LOD ${sp.lod}): ${feld} weicht ab (Main ≠ Worker)`);
    }
    // (l) MÜNDUNGEN IM GESETZ: die Welt trägt natürliche Mündungen — gefunden, nie gegraben, mindestens eine je km²
    const mu = b.muendungen;
    if (!mu || !(mu.km2 > 0)) v.push("LEER: (l) Mündungen: keine Suche über das Gesetz (die Wand prüfte nichts)");
    else if (!(mu.jeKm2 >= MUENDUNGEN_JE_KM2))
        v.push(
            `KEINE MÜNDUNG: ${mu.anzahl} natürliche Mündungen in ${mu.km2} km² um die Mitte der Welt (${mu.jeKm2} je km², ` +
                `mindestens ${MUENDUNGEN_JE_KM2}) — die Höhlen-Decke bricht an keiner Fels-Flanke durch (gelaende-core ` +
                "`hoehlenMund`, Spalten-Kontext `ceilOffset`)"
        );
    const blicke = new Map((b.blicke || []).map((x) => [x.name, x]));
    for (const name of PFLICHT) if (!blicke.has(name)) v.push(`LEER: Blick ${name} fehlt (kein Standort gefunden)`);
    for (const x of b.blicke || []) {
        if (x.fehlend && x.fehlend.length > 0) {
            const f = x.fehlend[0];
            v.push(
                `LOCH: Blick ${x.name}: ${x.fehlend.length} Zellen fehlen im Abschnitt, zuerst ${f.bereich}` +
                    (f.hoehle ? `#${f.knoten} (Höhle)` : " (Himmel)") +
                    ` am Punkt ${JSON.stringify(f.punkt)}`
            );
        }
        if (x.schatten?.lecks && x.schatten.lecks.length > 0) {
            const l = x.schatten.lecks[0];
            v.push(
                `LICHT-LECK: Blick ${x.name}: ${x.schatten.lecks.length} Empfänger, zuerst ${JSON.stringify(l.empfaenger)} — ` +
                    `die erste Fläche zum Licht (${l.zelle}) fehlt in der Kaskade`
            );
        }
        if (x.schatten && !(x.schatten.empfaenger > 0))
            v.push(`LEER: Blick ${x.name}: kein Empfänger im Licht-Frustum (der Schatten prüfte nichts)`);
        if (IN_HOEHLE.includes(x.name) && !(x.hoehle > 0))
            v.push(`LEER: Blick ${x.name} zeigt keine Höhlen-Fläche (${x.strahlen} Strahlen) — (b) prüfte nichts`);
        if (IN_HOEHLE.includes(x.name) && !(x.blind > 0))
            v.push(`LINSE BLIND: Blick ${x.name}: ohne die Höhlen-Zellen im Abschnitt fehlt der Linse nichts`);
        if (x.name === "hinaus" && x.augeInHoehle !== true)
            v.push("LEER: Blick hinaus: das Auge steht nicht in Höhlen-Luft (Fels über ihm, Luft an ihm)");
        if (x.name === "hinaus" && !(x.altFehlend > 0))
            v.push(
                "LINSE STUMPF: Blick hinaus: die alte Probe (die Sperre ohne den Weg hinaus) ließe hier keine Zelle weg — " +
                    "der Blick prüft die Klasse nicht"
            );
        if (x.name === "wiese" && x.hoehleImFrustum > 0 && !(x.hoehleImAbschnitt < x.hoehleImFrustum))
            v.push(
                `KEIN SCHNITT: die Wiese zeichnet ${x.hoehleImAbschnitt} von ${x.hoehleImFrustum} Höhlen-Dreiecken ihres ` +
                    "Frustums — die Höhlen-Sicht wirkt nicht"
            );
    }
    const gd = b.gedaechtnis;
    if (!gd || !(gd.imBild > 0)) v.push("LEER: (h) Gedächtnis: keine Mündung im Bild (die Wand prüfte nichts)");
    else {
        if (!(gd.vor < gd.imBild))
            v.push(
                `LINSE STUMPF: (h) Gedächtnis: im Stand misst jeder Pass ${gd.vor} von ${gd.imBild} Mündungen neu — ` +
                    "die Sperre wird nie gemerkt, die Wand prüfte nichts"
            );
        if (gd.nach < gd.imBild)
            v.push(
                `GEDÄCHTNIS: ${gd.imBild - gd.nach} von ${gd.imBild} Mündungen im Bild behalten ihre Sperre über einen neuen ` +
                    "Boden (`_chunkSatzMarke` im Stand) — ein gegrabener oder gesenkter Hang sperrte die Mündung dahinter weiter"
            );
    }
    const c = b.code || {};
    // (j) DAS LICHT DES AUGES (K02a, Auge 11): in der Höhle trägt die Fläche ihre wahre Normale und das Auge sein Licht
    if (!c.normaleHoehle)
        v.push(
            "CODE: `_buildPbrNodeMaterial` flacht die Normale auch in der Höhle (die 2.5D-Lichtung ohne `aHimmel`) — jede Decke " +
                "und Wand liegt als Wiese im Licht von oben, kein Licht von unten erreicht sie"
        );
    if (!c.augenTerm)
        v.push(
            "CODE: der Boden-Stoff (`_buildPbrNodeMaterial`) reicht dem Licht-Pool seine Himmels-Sicht nicht (`_leuchtStoff` mit " +
                "`aHimmel`, der Himmels-Ersatz `lichtErsatz` im Term) — die Höhle ist schwarz oder das Licht des Auges trägt überall"
        );
    if (c.augenTerm && !c.augenVorZweig)
        v.push(
            "CODE: der Licht-Pool (`_lichtPoolTerm`) liest `normalView`/`positionView` nicht in der Bedingung seines " +
                "Zweigs (`select`), sondern erst im Zweig — r184 baut das " +
                "Emissiv VOR der Lichtung, die Variable stünde nur im Zweig: unter dem Himmel lichtet der Boden mit der Normale 0 " +
                "(schwarz)"
        );
    if (c.augenTerm && c.augenTslFremd)
        v.push(
            `CODE: der Licht-Pool liest \`${c.augenTslFremd}\` — \`three/tsl\` der Seite kennt den Namen nicht ` +
                "(undefined, der Graph bricht, der Boden ist schwarz)"
        );
    const al = b.augenLicht;
    if (!al || !al.hoehle || !al.frei || !al.augeInHoehle)
        v.push("LEER: (j) Licht des Auges: kein Auge in der Höhlen-Luft gemessen (die Wand prüfte nichts)");
    else {
        const ho = al.hoehle,
            fr = al.frei;
        if (ho.I === null)
            v.push(
                `LICHT DES AUGES: das Licht des Auges ist kein Platz des Licht-Pools (\`_leuchtQuellen\` liest \`_augenLeuchte\` nicht) — die Ich-Sicht ` +
                    `in der Höhle ${JSON.stringify(ho.auge)} ist schwarz (kein Himmel, keine Sonne, kein Licht)`
            );
        else {
            if (!(ho.h < 1) || !(ho.I > 0))
                v.push(
                    `LICHT DES AUGES: das Auge in der Höhle ${JSON.stringify(ho.auge)} sieht den Himmel ${ho.h} und trägt ` +
                        `Licht ${ho.I} — die Ich-Sicht ist schwarz`
                );
            else if (!(Math.abs(ho.I - ho.soll) <= 1e-3 * Math.max(1, ho.soll)))
                v.push(
                    `LICHT DES AUGES: in der Höhle Stärke ${ho.I}, das Gesetz verlangt ${ho.soll} (Himmel am Auge ${ho.h})`
                );
            if (!(fr.h === 1) || fr.I !== 0)
                v.push(
                    `LICHT DES AUGES: unter freiem Himmel ${JSON.stringify(fr.auge)} brennt es (Himmel ${fr.h}, Stärke ` +
                        `${fr.I}) — die Welt zahlte das Licht auch, wo der Himmel leuchtet`
                );
        }
    }
    // (j) BLENDUNG: das Licht fällt nah nicht steil — die Wand in Armlänge zeigt ihre Maserung wie die Karte in 2 m (das EINE
    // Punktlicht-Gesetz, fachwerk `lichtAbfall`: 1/d^abfall mit dem Kern der Quelle; r184s 1/d ohne Kern legte die Wand weiß)
    if (al?.hoehle && Number.isFinite(al.hoehle.blendung)) {
        const q = al.hoehle.blendung;
        if (q > 1.5)
            v.push(
                `BLENDUNG: das Licht des Auges fällt mit 1/d^${al.hoehle.abfall} bei Kern ${al.hoehle.kern} m — die Wand in 0,3 m ist ` +
                    `${q.toFixed(1)}× heller als die Karte in 2 m (weiß, ohne Maserung; höchstens 1,5×)`
            );
    }
    if (!c.poolGesetz)
        v.push(
            "PUNKTLICHT-GESETZ: der Licht-Pool (`_lichtPoolTerm`) rechnet nicht den Abfall des Gesetzes (fachwerk `lichtAbfall`: " +
                "(d² + k²)^(−abfall/2) mit dem Saum), oder ein zweiter Term ruft die BRDF eines Punktlichts (`_punktLichtBrdf`) — " +
                "zwei Punktlicht-Gesetze im Stamm"
        );
    // (l) SZENEN-LICHT: unter freiem Himmel trägt jedes DIREKTE Licht der Szene Licht (r184 sammelt jedes sichtbare Licht in
    // den Licht-Hash jedes beleuchteten Stoffs — ein direktes Licht auf 0 rechnet trotzdem seine BRDF in jedem Fragment;
    // Umgebung und Halbkugel addieren nur eine Bestrahlung und stehen im Bericht)
    const sl = b.szenenLicht;
    if (!sl || !Array.isArray(sl.frei) || sl.frei.length === 0)
        v.push("LEER: (l) Szenen-Licht: kein Licht der Szene unter freiem Himmel gezählt (die Wand prüfte nichts)");
    else {
        const tot = sl.frei.filter((l) => l.direkt && (!(l.I > 0) || l.schwarz));
        if (tot.length > 0) {
            const t = tot[0];
            const nd = sl.frei.filter((l) => l.direkt).length;
            v.push(
                `SZENEN-LICHT: ${tot.length} von ${nd} direkten Lichtern der Szene tragen unter freiem Himmel nichts, zuerst ` +
                    `\`${t.name || "(ohne Namen)"}\` (${t.typ}, Stärke ${t.I}${t.schwarz ? ", schwarz" : ""}) — jeder beleuchtete ` +
                    `Stoff trägt ${sl.frei.length} Licht-Knoten im Hash, ${tot.length} davon rechnen eine BRDF ohne Licht`
            );
        }
    }
    // (k) DER FELS HAT STOFF: jeder Höhlen-Vertex ohne Himmel und jeder Kliff-Vertex trägt den Fels-Stoff des
    // Gesetzes (gelaende-core `felsFarbe`) — nie die Farbe der Säule, nie EINE graue Masse, im Natur-Band
    const wf = b.wieseUnterFels;
    if (!wf || !(wf.ohneHimmel > 0))
        v.push("LEER: (k) Wiese unter Fels: kein Höhlen-Vertex ohne Himmel im Boden-Satz (die Wand prüfte nichts)");
    else {
        if (wf.fremd > wf.ohneHimmel * FELS_FREMD_ANTEIL)
            v.push(
                `WIESE UNTER FELS: ${wf.fremd} von ${wf.ohneHimmel} Höhlen-Vertices ohne Himmel tragen nicht den Fels-Stoff ` +
                    `(${wf.gruen} davon grün), zuerst ${JSON.stringify(wf.erst)} — die Farbe der Säule oder ein Zwilling liegt ` +
                    "auf dem Höhlen-Fels (`_felsStoff` liest gelaende-core `felsFarbe`)"
            );
        if (!(wf.streuung >= FELS_STREUUNG_MIN))
            v.push(
                `MASSE: der Höhlen-Fels ist gleichförmig — Streuung der Leuchtdichte σ/Mittel ${wf.streuung} über ` +
                    `${wf.ohneHimmel} Vertices (mindestens ${FELS_STREUUNG_MIN}: Bänke, Kanten, Mulden des Fels-Stoffs)`
            );
        if (!(wf.albedo <= FELS_ALBEDO_MAX))
            v.push(`ALBEDO: der Höhlen-Fels liegt bei Y ${wf.albedo} (linear), über dem Natur-Band ${FELS_ALBEDO_MAX}`);
    }
    const kl = b.kliff;
    if (!kl || !(kl.steil > 0))
        v.push(
            "LEER: (k) Kliff: kein steiler Vertex unter dem Himmel im Boden-Satz (die Wand prüfte keinen Kliff-Stoff)"
        );
    else if (kl.fremd > kl.steil * FELS_FREMD_ANTEIL)
        v.push(
            `KLIFF OHNE STOFF: ${kl.fremd} von ${kl.steil} steilen Vertices unter dem Himmel tragen nicht den Fels-Stoff ` +
                `(${kl.gruen} davon grün), zuerst ${JSON.stringify(kl.erst)} — der Vertex trägt die Säule, der Fels lebt nur ` +
                "als Farbton im Shader (`_felsStoff`)"
        );
    // (m) DIE BANKUNG: unregelmäßig am Gesetz, und der Detail-Term liest es
    const bk = b.bankung;
    if (!bk || !(bk.baenke > 0))
        v.push("LEER: (m) Bankung: das Gesetz trägt keine Bänke (gelaende-core `felsBankung` fehlt)");
    else {
        if (!(bk.cv >= BANK_CV_MIN))
            v.push(
                `MAUERWERK: die Bänke sind gleich hoch — Variationskoeffizient der Mächtigkeit ${bk.cv} über ${bk.baenke} ` +
                    `Bänke (mindestens ${BANK_CV_MIN}: dünnbankige und massige Pakete, gelaende-core paketDicke · bankStreu)`
            );
        if (!(bk.welligkeit >= FUGE_WELLE_MIN))
            v.push(
                `GERADE FUGEN: die Fugen wellen nicht für sich — Eigen-Welligkeit ${bk.welligkeit} Bänke (mindestens ` +
                    `${FUGE_WELLE_MIN}, gelaende-core fugeWelle)`
            );
        if (!(bk.durchlauf >= KLUFT_DURCHLAUF_MIN))
            v.push(
                `KLÜFTE SETZEN NEU AN: nur ${bk.durchlauf} der Klüfte laufen durch die Fuge weiter (mindestens ` +
                    `${KLUFT_DURCHLAUF_MIN}: ihre Lage je Paket, gelaende-core kluftVersatz)`
            );
    }
    // (n) DER STOFF ENTSTEHT IM WORKER: kein Ruf des Fels-Gesetzes im Haupt-Thread je Worker-Bau
    const sw = b.stoffWorker;
    if (!sw || !(sw.bauten > 0))
        v.push("LEER: (n) Stoff im Worker: kein Worker-Bau im Ring der Mess-Wiese (die Wand prüfte nichts)");
    else {
        if (sw.rufe > 0)
            v.push(
                `FELS-STOFF IM HAUPT-THREAD: ${sw.rufe} Rufe des Fels-Gesetzes (${sw.namen.join(" · ")}) in ${sw.bauten} ` +
                    `Worker-Bauten (\`_buildVoxelChunkDataFromWorkerMesh\` → \`_felsStoff\`, Σ ${sw.ms} ms) — der Stoff ` +
                    "entsteht im Worker (voxel-worker `buildChunkMesh`, gelaende-core `felsStoff`)"
            );
        if (!(sw.syncRufe > 0))
            v.push(
                "LINSE BLIND: (n) Stoff im Worker: auch der Sync-Bau ruft das Fels-Gesetz nicht (die Zählung sieht nichts)"
            );
    }
    if (c.feinEigenHash === true)
        v.push(
            "CODE: der Detail-Term (`_terrainGeologyAlbedo`) rechnet nicht das Gesetz (eigene Ziehung fract(sin)) — im " +
                "Shader fährt ein Zwilling"
        );
    if (c.graphFehler) v.push(`CODE: der Boden-Stoff baut keinen Graph (${c.graphFehler}) — die Proben (f) messen nichts`);
    if (c.feinEigenHash !== undefined && !(c.feinRechenwerk && c.feinRechenwerk.maxDiff <= 1e-6))
        v.push(
            "RECHENWERK: das TSL-Rechenwerk (`_felsRechenwerkTSL`) rechnet nicht das Gesetz — " +
                (c.feinRechenwerk
                    ? `max. Abstand ${c.feinRechenwerk.maxDiff} an ${c.feinRechenwerk.n} Punkten`
                    : "fehlt")
        );
    // (i) HIMMELS-LICHT: keine Höhlen-Wand trägt mehr Himmel, als ihr gerader Abstand zur nächsten Himmels-Fläche lässt,
    // und die Mündung bleibt hell (die Sicht fällt nicht schon an der Kante auf null)
    const hl = b.himmel;
    if (!c.himmelLiest)
        v.push(
            "CODE: `_getVoxelChunkMaterial` liest die Himmels-Sicht nicht (`aoNode` trägt `aHimmel`) — das Himmels-Licht liegt " +
                "auf jeder Höhlen-Wand"
        );
    if (!hl || !(hl.hoehle > 0))
        v.push("LEER: (i) Himmels-Licht: kein Höhlen-Vertex im Boden-Satz (die Wand prüfte nichts)");
    else {
        if (hl.ohneAttribut)
            v.push(
                `HIMMELS-LICHT: der Boden-Satz trägt keine Himmels-Sicht — ${hl.hoehle} Höhlen-Vertices sehen den vollen ` +
                    `Himmel, ${hl.tief} davon tiefer als ${hl.tiefM} m hinter der nächsten Himmels-Fläche`
            );
        else if (hl.ueber.length > 0) {
            const u = hl.ueber[0];
            v.push(
                `HIMMELS-LICHT: ${hl.ueber.length} von ${hl.hoehle} Höhlen-Vertices tragen mehr Himmel, als ihr Abstand lässt, ` +
                    `zuerst ${JSON.stringify(u.p)}: Himmels-Sicht ${u.v} bei ${u.d} m (höchstens ${u.max})`
            );
        }
        if (!hl.ohneAttribut && !(hl.muendMittel >= hl.muendMin))
            v.push(
                `SCHWARZE MÜNDUNG: ${hl.muend} Höhlen-Vertices in den Mündungs-Boxen tragen im Mittel ` +
                    `${hl.muendMittel} Himmels-Sicht (mindestens ${hl.muendMin}) — der Himmel fällt schon an der Kante weg`
            );
    }
    return v;
}

function selbsttest() {
    const { taeterFaelle, selbsttestEnde } = require("./lib/welt-boot.cjs");
    const gruen = {
        spiegel: [
            {
                chunk: "0,0",
                lod: 0,
                felder: {
                    position: true,
                    index: true,
                    tri: true,
                    knoten: true,
                    muend: true,
                    seiten: true,
                    kanten: true,
                    rand: true,
                    himmel: true,
                    schutt: true,
                    farbe: true,
                },
            },
        ],
        stoffWorker: { bauten: 81, rufe: 0, namen: [], ms: 9, msMax: 0.4, syncRufe: 5200 },
        blicke: [
            {
                name: "wiese",
                strahlen: 10,
                hoehle: 0,
                fehlend: [],
                hoehleImFrustum: 100,
                hoehleImAbschnitt: 10,
                schatten: { empfaenger: 5, lecks: [] },
            },
            { name: "hang", strahlen: 10, hoehle: 0, fehlend: [], schatten: { empfaenger: 5, lecks: [] } },
            {
                name: "muendung",
                strahlen: 10,
                hoehle: 4,
                blind: 2,
                fehlend: [],
                schatten: { empfaenger: 5, lecks: [] },
            },
            { name: "hoehle", strahlen: 10, hoehle: 9, blind: 3, fehlend: [], schatten: { empfaenger: 5, lecks: [] } },
            {
                name: "hinaus",
                strahlen: 10,
                hoehle: 7,
                blind: 3,
                augeInHoehle: true,
                altFehlend: 3,
                fehlend: [],
                schatten: { empfaenger: 5, lecks: [] },
            },
        ],
        gedaechtnis: { vor: 0, nach: 6, imBild: 6 },
        code: {
            himmelLiest: true,
            normaleHoehle: true,
            augenTerm: true,
            augenVorZweig: true,
            augenTslFremd: null,
            poolGesetz: true,
            feinEigenHash: false,
            feinRechenwerk: { maxDiff: 0, n: 400 },
        },
        bankung: { baenke: 2000, mittel: 0.65, cv: 0.71, welligkeit: 0.112, durchlauf: 0.526 },
        wieseUnterFels: { ohneHimmel: 700, fremd: 0, gruen: 0, erst: null, streuung: 0.19, albedo: 0.14 },
        kliff: { steil: 300, fremd: 0, gruen: 0, erst: null },
        augenLicht: {
            augeInHoehle: true,
            hoehle: { auge: [-1041, 9, -738], h: 0.2, I: 30, soll: 30, abfall: 1, kern: 8, R: 20, blendung: 1.03 },
            frei: { auge: [-1041, 30, -738], h: 1, I: 0, soll: 0 },
            wesenInHoehle: 0,
        },
        szenenLicht: {
            frei: [
                { name: "", typ: "AmbientLight", I: 0, schwarz: false, direkt: false },
                { name: "", typ: "DirectionalLight", I: 1, schwarz: false, direkt: true },
                { name: "", typ: "HemisphereLight", I: 0, schwarz: false, direkt: false },
            ],
        },
        himmel: {
            hoehle: 900,
            tief: 300,
            tiefM: 14,
            ueber: [],
            muend: 40,
            muendMittel: 0.5,
            muendMin: 0.15,
            ohneAttribut: false,
        },
        muendungen: { anzahl: 20, km2: 4, jeKm2: 5 },
    };
    const fehler = [];
    const g = urteil(gruen);
    if (g.length) fehler.push("der grüne Befund fällt rot: " + g.join(" · "));
    const klon = () => JSON.parse(JSON.stringify(gruen));
    const faelle = [
        ["Spiegel-Drift", (b) => (b.spiegel[0].felder.tri = false), /SPIEGEL: Chunk 0,0 .*tri weicht ab/],
        ["kein Spiegel", (b) => (b.spiegel = []), /SPIEGEL: kein Chunk/],
        // (n) der Stand c8e46330: der Fels-Stoff rechnet je Worker-Bau im Haupt-Thread, der Worker reicht keinen Himmel
        [
            "Himmel nur im Haupt-Thread",
            (b) => (b.spiegel[0].felder.himmel = false),
            /SPIEGEL: Chunk 0,0 .*himmel weicht ab/,
        ],
        [
            "Fels-Stoff im Haupt-Thread",
            (b) => Object.assign(b.stoffWorker, { rufe: 4100, namen: ["felsFarbe", "felsKruemmung"], ms: 59.4 }),
            /FELS-STOFF IM HAUPT-THREAD: 4100 Rufe des Fels-Gesetzes \(felsFarbe · felsKruemmung\) in 81 Worker-Bauten/,
        ],
        ["Zählung blind", (b) => (b.stoffWorker.syncRufe = 0), /LINSE BLIND: \(n\) Stoff im Worker/],
        ["kein Worker-Bau", (b) => (b.stoffWorker.bauten = 0), /LEER: \(n\) Stoff im Worker/],
        [
            "Höhle ohne Mündung",
            (b) => (b.muendungen = { anzahl: 0, km2: 4, jeKm2: 0 }),
            /KEINE MÜNDUNG: 0 natürliche Mündungen in 4 km²/,
        ],
        ["Mündungs-Suche fehlt", (b) => (b.muendungen = null), /LEER: \(l\) Mündungen/],
        [
            "Loch an der Mündung",
            (b) => (b.blicke[2].fehlend = [{ bereich: "-21,-20", knoten: 7, hoehle: true, punkt: [1, 2, 3] }]),
            /LOCH: Blick muendung: 1 Zellen fehlen .*-21,-20#7 \(Höhle\)/,
        ],
        [
            "Licht-Leck",
            (b) => (b.blicke[3].schatten.lecks = [{ empfaenger: [1, 2, 3], zelle: "-22,-20#4", hoehle: true }]),
            /LICHT-LECK: Blick hoehle: 1 Empfänger, .*-22,-20#4/,
        ],
        ["leere Mündung", (b) => (b.blicke[2].hoehle = 0), /LEER: Blick muendung zeigt keine Höhlen-Fläche/],
        ["fehlender Blick", (b) => b.blicke.splice(1, 1), /LEER: Blick hang fehlt/],
        ["blinde Linse", (b) => (b.blicke[3].blind = 0), /LINSE BLIND: Blick hoehle/],
        ["toter Schnitt", (b) => (b.blicke[0].hoehleImAbschnitt = 100), /KEIN SCHNITT: die Wiese zeichnet 100 von 100/],
        [
            "die alte Probe (Loch beim Blick hinaus)",
            (b) =>
                (b.blicke[4].fehlend = [
                    { bereich: "-24,-18", knoten: 64, hoehle: true, punkt: [-1021, 15.8, -734.5] },
                ]),
            /LOCH: Blick hinaus: 1 Zellen fehlen .*-24,-18#64 \(Höhle\)/,
        ],
        ["stumpfer Hinaus-Blick", (b) => (b.blicke[4].altFehlend = 0), /LINSE STUMPF: Blick hinaus/],
        [
            "Auge nicht in der Höhle",
            (b) => (b.blicke[4].augeInHoehle = false),
            /LEER: Blick hinaus: das Auge steht nicht/,
        ],
        ["Schatten prüft nichts", (b) => (b.blicke[1].schatten.empfaenger = 0), /LEER: Blick hang: kein Empfänger/],
        [
            "die Sperre überlebt den Boden",
            (b) => (b.gedaechtnis.nach = 0),
            /GEDÄCHTNIS: 6 von 6 Mündungen im Bild behalten ihre Sperre/,
        ],
        ["stumpfes Gedächtnis", (b) => (b.gedaechtnis.vor = 6), /LINSE STUMPF: \(h\) Gedächtnis/],
        ["Gedächtnis ohne Mündung", (b) => (b.gedaechtnis = null), /LEER: \(h\) Gedächtnis/],
        // (i) der Befund von Auge 11: der Himmel liegt auf jeder Höhlen-Wand (der Stand vor K02a)
        [
            "Himmel in der Höhle",
            (b) => Object.assign(b.himmel, { ohneAttribut: true }),
            /HIMMELS-LICHT: der Boden-Satz trägt keine Himmels-Sicht — 900 Höhlen-Vertices/,
        ],
        [
            "zu viel Himmel",
            (b) => b.himmel.ueber.push({ p: [762, 11, -140], v: 1, d: 22.4, max: 0.02 }),
            /HIMMELS-LICHT: 1 von 900 Höhlen-Vertices .*[762,11,-140]/,
        ],
        [
            "schwarze Mündung",
            (b) => (b.himmel.muendMittel = 0),
            /SCHWARZE MÜNDUNG: 40 Höhlen-Vertices in den Mündungs-Boxen/,
        ],
        ["Stoff ohne Himmels-Sicht", (b) => (b.code.himmelLiest = false), /CODE: `_getVoxelChunkMaterial` liest/],
        ["Himmel ohne Höhle", (b) => (b.himmel.hoehle = 0), /LEER: \(i\) Himmels-Licht/],
        // (j) der Befund von Auge 11 nach (i): die Höhle schwarz, die Decke als Wiese gelichtet
        ["flache Höhle", (b) => (b.code.normaleHoehle = false), /CODE: `_buildPbrNodeMaterial` flacht die Normale/],
        [
            "kein Licht des Auges",
            (b) => (b.augenLicht.hoehle.I = null),
            /LICHT DES AUGES: das Licht des Auges ist kein Platz des Licht-Pools .* in der Höhle \[-1041,9,-738\]/,
        ],
        [
            "Licht aus in der Höhle",
            (b) => (b.augenLicht.hoehle.I = 0),
            /LICHT DES AUGES: das Auge in der Höhle .* Licht 0/,
        ],
        [
            "Licht ohne Gesetz",
            (b) => (b.augenLicht.hoehle.I = 3),
            /LICHT DES AUGES: in der Höhle Stärke 3, das Gesetz verlangt 30/,
        ],
        ["Licht im Freien", (b) => (b.augenLicht.frei.I = 5), /LICHT DES AUGES: unter freiem Himmel .* brennt es/],
        [
            "Stoff ohne Himmels-Sicht im Pool",
            (b) => (b.code.augenTerm = false),
            /CODE: der Boden-Stoff .* reicht dem Licht-Pool/,
        ],
        // (j) K11: das Licht des Auges und jede Leuchtquelle fallen nach EINEM Gesetz
        ["zwei Punktlicht-Gesetze", (b) => (b.code.poolGesetz = false), /PUNKTLICHT-GESETZ: der Licht-Pool/],
        // die zwei Fallen der Werkbank (echte GPU): die Mündung schwarz
        [
            "Normale im Zweig",
            (b) => (b.code.augenVorZweig = false),
            /CODE: der Licht-Pool .* liest `normalView`\/`positionView` nicht in der Bedingung seines Zweigs/,
        ],
        [
            "fremder TSL-Name",
            (b) => (b.code.augenTslFremd = "diffuseContribution"),
            /CODE: der Licht-Pool liest `diffuseContribution` — `three\/tsl` der Seite kennt/,
        ],
        // (l) der Befund von OMEN 1110-3: das Punkt-Licht des Auges stand ab Boot auf 0 in der Szene
        [
            "Szenen-Licht auf 0",
            (b) =>
                b.szenenLicht.frei.push({
                    name: "augenLicht",
                    typ: "PointLight/AugenLicht",
                    I: 0,
                    schwarz: false,
                    direkt: true,
                }),
            /SZENEN-LICHT: 1 von 2 direkten .*`augenLicht` \(PointLight\/AugenLicht, Stärke 0\) — jeder beleuchtete Stoff trägt 4/,
        ],
        [
            "schwarzes Szenen-Licht",
            (b) => (b.szenenLicht.frei[1].schwarz = true),
            /SZENEN-LICHT: 1 von 1 direkten .*DirectionalLight, Stärke 1, schwarz/,
        ],
        ["Szenen-Licht ungezählt", (b) => (b.szenenLicht = null), /LEER: \(l\) Szenen-Licht/],
        ["Licht ohne Höhle", (b) => (b.augenLicht.augeInHoehle = false), /LEER: \(j\) Licht des Auges/],
        // (j) die Falle der Werkbank: steil am Auge die Wand in 0,2 m weiß ohne Maserung
        [
            "geblendet",
            (b) => Object.assign(b.augenLicht.hoehle, { abfall: 2, kern: 0.3, blendung: 23.6 }),
            /BLENDUNG: das Licht des Auges fällt mit 1\/d\^2 bei Kern 0\.3 m — .* 23\.6×/,
        ],
        // (k) der Befund von Auge 11: der Höhlen-Boden 25 m unter der Wiese trug ihr Grün
        [
            "Wiese unter Fels",
            (b) =>
                Object.assign(b.wieseUnterFels, {
                    fremd: 650,
                    gruen: 420,
                    erst: { p: [762, 9.4, -136], c: [0.05, 0.12, 0.03], fels: [0.14, 0.13, 0.12] },
                }),
            /WIESE UNTER FELS: 650 von 700 Höhlen-Vertices ohne Himmel .*420 davon grün/,
        ],
        ["Fels ohne Höhle", (b) => (b.wieseUnterFels.ohneHimmel = 0), /LEER: \(k\) Wiese unter Fels/],
        // (k) K17: der Höhlen-Fels von Auge 11 (762/−138) war EINE graue Masse — jeder Vertex der Stein der Palette
        [
            "Masse",
            (b) => (b.wieseUnterFels.streuung = 0),
            /MASSE: der Höhlen-Fels ist gleichförmig — Streuung .* 0 über 700/,
        ],
        ["Fels zu hell", (b) => (b.wieseUnterFels.albedo = 0.5), /ALBEDO: der Höhlen-Fels liegt bei Y 0\.5/],
        [
            "Kliff ohne Stoff",
            (b) => Object.assign(b.kliff, { fremd: 280, gruen: 90, erst: { p: [700, 30, -120] } }),
            /KLIFF OHNE STOFF: 280 von 300 steilen Vertices/,
        ],
        ["Kein Kliff", (b) => (b.kliff.steil = 0), /LEER: \(k\) Kliff/],
        // (m) K17 Nachbesserung 1: das Höhlen-Bild las sich als Ziegelmauer
        ["Ziegelmauer", (b) => (b.bankung.cv = 0.204), /MAUERWERK: die Bänke sind gleich hoch — .* 0\.204 über 2000/],
        ["Gerade Fugen", (b) => (b.bankung.welligkeit = 0), /GERADE FUGEN: .* Eigen-Welligkeit 0 Bänke/],
        ["Klüfte je Bank", (b) => (b.bankung.durchlauf = 0.13), /KLÜFTE SETZEN NEU AN: nur 0\.13/],
        ["Ohne Bankung", (b) => delete b.bankung, /LEER: \(m\) Bankung/],
        ["Graph bricht", (b) => (b.code.graphFehler = "x"), /CODE: der Boden-Stoff baut keinen Graph \(x\)/],
        ["Eigene Ziehung", (b) => (b.code.feinEigenHash = true), /CODE: der Detail-Term .*\(eigene Ziehung/],
        [
            "Rechenwerk falsch",
            (b) => (b.code.feinRechenwerk = { maxDiff: 0.31, n: 400 }),
            /RECHENWERK: .* 0\.31 an 400/,
        ],
    ];
    taeterFaelle(faelle, urteil, { fehler, klon });
    selbsttestEnde(fehler);
}

if (process.argv.includes("--selftest")) {
    console.log("=== HÖHLEN-SICHT — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const { statikServer, warteAufWelt, nullSeite, wandEnde } = require("./lib/welt-boot.cjs");
const path = require("path");
const { installHoehlenStrahl } = require("./lib/hoehlen-strahl.cjs");

const PORT = Number(process.env.HOEHLEN_SICHT_PORT) || 4504;
// Die Mess-Wiese (die Blicke wiese und hang), die Mitte der Welt und das Quadrat der Mündungs-Suche um sie (halbe Seite, m).
// Mündung, Höhlen-Raum und der Blick hinaus stehen nicht als Zahl hier: die Suche liest sie aus dem Gesetz der Welt.
const { messort, WELT_MITTE } = require("./lib/welt-orte.cjs");
const ORTE = { mess: messort("wiese"), welt: WELT_MITTE, mundHalb: 1000 };
const server = statikServer();

(async () => {
    console.log("=== HÖHLEN-SICHT (Welle 7) — Null-Renderer, Mess-Wiese, Strahl-Wahrheit gegen den Boden-Satz ===");
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 600000 });
    page.setDefaultTimeout(580000);
    await page.evaluateOnNewDocument(installHoehlenStrahl);
    let befund = null;
    try {
        await server.zeige(page, 120000, "index.html", "networkidle0");
        await warteAufWelt(page, 120000);
        befund = await page.evaluate(async (ORTE) => {
            const MESS = ORTE.mess;
            let HINAUS = null;
            const r = window.anazhRealm,
                st = r.state,
                T = window.THREE;
            const takt = () => {
                try {
                    r._gameLoopTick(performance.now());
                } catch {}
            };
            // einschwingen: die Welt steht (das EINE Einschwingen, welt-boot `__weltStehtNach`)
            const schwinge = () => window.__weltStehtNach(takt);
            // ── (n) DER STOFF ENTSTEHT IM WORKER: der Kern ist eingefroren — die Wand reicht dem Haupt-Thread eine zählende
            // Kopie (jeder Leser fragt `globalThis.__gelaendeCore` je Ruf) und zählt die Rufe des Fels-Gesetzes je Worker-Bau
            const GK0 = globalThis.__gelaendeCore;
            const FELS_NAMEN = ["felsStoff", "felsFarbe", "felsKruemmung", "felsNetz", "himmelsSicht"];
            const felsZaehl = { an: false, rufe: 0, namen: new Set() };
            const GKz = Object.assign({}, GK0);
            for (const k of FELS_NAMEN)
                if (typeof GK0[k] === "function")
                    GKz[k] = function () {
                        if (felsZaehl.an) {
                            felsZaehl.rufe++;
                            felsZaehl.namen.add(k);
                        }
                        return GK0[k].apply(this, arguments);
                    };
            globalThis.__gelaendeCore = GKz;
            const stoffWorker = { bauten: 0, rufe: 0, namen: [], ms: 0, msMax: 0, syncRufe: 0 };
            r._buildVoxelChunkDataFromWorkerMesh = function () {
                const r0 = felsZaehl.rufe,
                    t0 = performance.now();
                felsZaehl.an = true;
                try {
                    return Object.getPrototypeOf(r)._buildVoxelChunkDataFromWorkerMesh.apply(this, arguments);
                } finally {
                    felsZaehl.an = false;
                    const dt = performance.now() - t0;
                    stoffWorker.bauten++;
                    stoffWorker.ms += dt;
                    if (dt > stoffWorker.msMax) stoffWorker.msMax = dt;
                    stoffWorker.rufe += felsZaehl.rufe - r0;
                }
            };
            // ── an die Mess-Wiese
            st.playerMesh.position.set(MESS.x, r._voxelSurfaceY(MESS.x, MESS.z) + 1.8, MESS.z);
            await schwinge();
            delete r._buildVoxelChunkDataFromWorkerMesh;
            stoffWorker.namen = [...felsZaehl.namen];
            stoffWorker.ms = +stoffWorker.ms.toFixed(1);
            stoffWorker.msMax = +stoffWorker.msMax.toFixed(2);
            r._tickChunkSatz();
            const s = st.chunkSaetze.get("boden");
            const aus = { spiegel: [], blicke: [], code: {}, ringChunks: st.voxelChunks.size, bereiche: s.bloecke.size, stoffWorker };

            // ── (a) SPIEGEL: Main-Sync gegen Worker für Chunks verschiedener Stufe
            const lpc = st.lastPlayerVoxelChunk;
            const kandidaten = [];
            for (const [key, e] of st.voxelChunks) {
                if (!e || e.empty || !e.mesh) continue;
                const [cx, cz] = key.split(",").map(Number);
                kandidaten.push({
                    key,
                    cx,
                    cz,
                    lod: e.lod || 0,
                    d: Math.max(Math.abs(cx - lpc.cx), Math.abs(cz - lpc.cz)),
                });
            }
            kandidaten.sort((a, b) => a.d - b.d || (a.key < b.key ? -1 : 1));
            const wahl = [];
            for (const lod of [0, 1, 2]) {
                const k = kandidaten.filter((c) => c.lod === lod).slice(0, lod === 0 ? 2 : 1);
                wahl.push(...k);
            }
            const gleich = (a, b) => {
                if (!a || !b || a.length !== b.length) return false;
                const x = new Uint8Array(a.buffer, a.byteOffset, a.byteLength),
                    y = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
                for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
                return true;
            };
            for (const c of wahl) {
                try {
                    const w = await r._voxelWorkerComputeChunkMesh(c.cx, c.cz, c.lod);
                    const r0 = felsZaehl.rufe;
                    felsZaehl.an = true;
                    let m;
                    try {
                        m = r._buildVoxelChunkData(c.cx, c.cz, c.lod);
                    } finally {
                        felsZaehl.an = false;
                        stoffWorker.syncRufe += felsZaehl.rufe - r0;
                    }
                    const g = m?.mesh ? m.mesh.geometry : null;
                    if (!g || w.empty) {
                        aus.spiegel.push({ chunk: c.key, lod: c.lod, fehler: "leer auf einer Seite" });
                        continue;
                    }
                    const H = g.hoehle,
                        W = w.hoehle || {};
                    aus.spiegel.push({
                        chunk: c.key,
                        lod: c.lod,
                        n: H ? H.n : null,
                        felder: {
                            position: gleich(new Float32Array(w.positions), g.attributes.position.array),
                            index: gleich(new Uint32Array(w.indices), new Uint32Array(g.index.array)),
                            tri: gleich(W.tri, H && H.tri),
                            knoten: gleich(W.knoten, H && H.knoten),
                            muend: gleich(W.muend, H && H.muend),
                            seiten: gleich(W.seiten, H && H.seiten),
                            kanten: gleich(W.kanten, H && H.kanten),
                            rand: gleich(W.rand, H && H.rand),
                            // (n) der Stoff des Workers: die rohe Antwort gegen den fertigen Sync-Bau
                            himmel: gleich(w.himmel, g.attributes.aHimmel && g.attributes.aHimmel.array),
                            schutt: gleich(w.schutt, g.attributes.aSchutt && g.attributes.aSchutt.array),
                            farbe: gleich(w.colors, g.attributes.color.array),
                        },
                    });
                    g.dispose();
                } catch (e) {
                    aus.spiegel.push({ chunk: c.key, lod: c.lod, fehler: String(e?.message || e) });
                }
            }
            globalThis.__gelaendeCore = GK0;

            // ── Standorte aus dem Gesetz: DIE MÜNDUNGS-SUCHE — im Quadrat um die Mitte der Welt jede Spalte mit einer Flanke
            // ab 30° (der Hang der Welt-Höhe, unabhängig vom Mündungs-Term des Kerns), dann das Kriterium an ihr und ihren
            // Nachbarn: Höhlen-Luft unter Fels, daneben Luft unter freiem Himmel, der Gang dahinter mindestens 12 m tief.
            // Gegraben wird nichts — die Linse findet, was die Welt trägt; Mündungen näher als 25 m sind eine.
            const fest = (x, y, z) => r._fieldDensityAt(x, y, z) > 0;
            // DAS GITTER DER STUFE 0: Mund, Gang und Auge liegen auf den Punkten, aus denen das Netz entsteht (Surface-Nets auf
            // 1,8 m) — dort ist das Feld das Gitter des Chunks. Ein Spalt flacher als ein Schritt fällt zwischen zwei feste
            // Punkte und fehlt im Bild (K55-5: der Spalt 104,7–106,0 m bei 699/−39 trug den Blick hinaus, das Auge stand im Fels
            // des Netzes, und jeder Strahl lief ohne Fläche durch ihn hindurch — 12 Zellen „fehlten“ hinter dem Fels).
            const G0 = r._voxelChunkConfig(0);
            const gy0 = (st.terrainBaseHeight || 0) - G0.floorDrop;
            const gitter = (v) => Math.round(v / G0.step) * G0.step;
            const himmel = (x, y, z) => {
                for (let h = y + G0.step; h < y + 60; h += G0.step) if (fest(x, h, z)) return false;
                return true;
            };
            const mundAn = (X0, Z0) => {
                const X = gitter(X0),
                    Z = gitter(Z0);
                const S = r._voxelSurfaceY(X, Z);
                if (S == null) return null;
                for (let j = Math.floor((S - 4 - gy0) / G0.step); gy0 + j * G0.step > S - 40; j--) {
                    const y = gy0 + j * G0.step;
                    if (fest(X, y, Z)) continue;
                    for (const [dx, dz] of [
                        [1, 0],
                        [-1, 0],
                        [0, 1],
                        [0, -1],
                    ]) {
                        const ax = X + dx * 2 * G0.step,
                            az = Z + dz * 2 * G0.step;
                        if (fest(ax, y, az) || !himmel(ax, y, az)) continue;
                        let L = 0;
                        while (L < 30 && !fest(X - dx * L, y, Z - dz * L)) L += G0.step;
                        if (L >= 12) return { x: X, y, z: Z, dx, dz, tief: L };
                        break;
                    }
                }
                return null;
            };
            const hoch = (x, z) => r._terrainMacroSurfaceY(x, z);
            const wl = typeof st.waterLevel === "number" ? st.waterLevel : 0;
            const mundListe = [];
            const HALB = ORTE.mundHalb;
            const [WX, WZ] = ORTE.welt;
            for (let z = WZ - HALB; z < WZ + HALB; z += 3.6)
                for (let x = WX - HALB; x < WX + HALB; x += 3.6) {
                    const h0 = hoch(x, z);
                    if (h0 < wl + 1) continue;
                    const hang = Math.hypot(hoch(x + 1.8, z) - h0, hoch(x, z + 1.8) - h0) / 1.8;
                    const hangGrad = +((Math.atan(hang) * 180) / Math.PI).toFixed(1);
                    if (hangGrad < 30) continue;
                    for (const [ox, oz] of [
                        [0, 0],
                        [3.6, 0],
                        [-3.6, 0],
                        [0, 3.6],
                        [0, -3.6],
                    ]) {
                        const m = mundAn(x + ox, z + oz);
                        if (!m) continue;
                        if (!mundListe.some((q) => Math.hypot(q.x - m.x, q.z - m.z) < 25))
                            mundListe.push(Object.assign(m, { hangGrad }));
                        break;
                    }
                }
            const km2 = ((2 * HALB) / 1000) ** 2;
            aus.muendungen = {
                anzahl: mundListe.length,
                km2,
                jeKm2: +(mundListe.length / km2).toFixed(2),
                hangGrad: mundListe.map((m) => m.hangGrad).sort((a, b) => a - b),
            };
            mundListe.sort((a, b) => Math.hypot(a.x - WX, a.z - WZ) - Math.hypot(b.x - WX, b.z - WZ));
            // die Mündung der Blicke: die nächste zur Mitte der Welt, vor deren Mund (im Blick hinaus, 30–200 m) eine zweite liegt,
            // die ihr den Mund zuwendet — dort führt der Weg hinaus an der Sperre vorbei in die andere Höhle (fehlt das Paar:
            // eine zweite vor dem Mund, sonst die nächste)
            const gegenueber = (m, zugewandt) =>
                mundListe.find((q) => {
                    const vor = (q.x - m.x) * m.dx + (q.z - m.z) * m.dz;
                    const quer = Math.abs((q.x - m.x) * m.dz - (q.z - m.z) * m.dx);
                    const zu = q.dx * m.dx + q.dz * m.dz < 0;
                    return q !== m && vor > 30 && vor < 200 && quer < vor * 0.6 && (zu || !zugewandt);
                }) || null;
            const muendung =
                mundListe.find((m) => gegenueber(m, true)) ||
                mundListe.find((m) => gegenueber(m, false)) ||
                mundListe[0] ||
                null;
            const partner = muendung ? gegenueber(muendung, true) || gegenueber(muendung, false) : null;
            aus.muendungen.partner = partner;
            const span = r._voxelChunkConfig(0).span;
            let raum = null;
            const boden = (x, z) => r._voxelSurfaceY(x, z);
            const blicke = [];
            const p0 = { x: MESS.x, z: MESS.z };
            blicke.push({
                name: "wiese",
                auge: [p0.x, boden(p0.x, p0.z) + 1.7, p0.z],
                ziel: [p0.x, boden(p0.x, p0.z) + 1.7, p0.z - 100],
            });
            blicke.push({
                name: "hang",
                auge: [p0.x, boden(p0.x, p0.z) + 40, p0.z],
                ziel: [p0.x - 60, boden(p0.x - 60, p0.z - 140), p0.z - 140],
            });
            // der Blick hinaus: das Auge tief im Gang hinter dem Mund (Höhlen-Luft, Fels darüber), der Blick durch den Mund auf
            // die Mündung gegenüber (sonst 100 m hinaus, 6 m hinab) — je Mündung (die der Blicke zuerst) ein Kandidat
            // die Paare (Mund m, Mund q gegenüber): q liegt vor m (30–200 m), wendet ihm den Mund zu, und der Blick aus m
            // fällt gerade in q hinein (quer und Höhe klein gegen den Abstand) — der Strahl aus der Höhle läuft unter dem Fels,
            // tritt durch m hinaus und trifft die Höhlen-Zellen hinter q; die besten vier, dann jede Mündung allein
            const paare = [];
            for (const m of mundListe)
                for (const q of mundListe) {
                    const vor = (q.x - m.x) * m.dx + (q.z - m.z) * m.dz;
                    if (q === m || !(vor > 30 && vor < 200) || !(q.dx * m.dx + q.dz * m.dz < 0)) continue;
                    const quer = Math.abs((q.x - m.x) * m.dz - (q.z - m.z) * m.dx);
                    paare.push({ m, q, wert: (quer + Math.abs(q.y - m.y)) / vor });
                }
            paare.sort((a, b) => a.wert - b.wert);
            const hinausVon = (m, q) => {
                // das Auge auf einem Punkt des Gangs (Gitter, Luft bis `tief`)
                const e = G0.step * Math.floor(Math.min(m.tief - 2, 24) / G0.step);
                return {
                    mund: m,
                    spieler: [m.x - m.dx * e, m.y - 1.5, m.z - m.dz * e],
                    auge: [m.x - m.dx * e, m.y, m.z - m.dz * e],
                    ziel: q
                        ? [q.x - q.dx * Math.min(q.tief - 2, 8), q.y, q.z - q.dz * Math.min(q.tief - 2, 8)]
                        : [m.x + m.dx * 100, m.y - 6, m.z + m.dz * 100],
                };
            };
            const hinausKandidaten = [
                ...paare.slice(0, 4).map((p) => hinausVon(p.m, p.q)),
                ...(muendung ? [hinausVon(muendung, partner)] : []),
            ].slice(0, 5);

            // ── (b)–(e) je Blick: das Hauptbild aus dem Auge (die Spiel-Kamera an den Blick gestellt), dann die Kaskade
            // (Stellvertreter-Licht, schräg, über dem Ziel) — beide über den EINEN Chokepoint
            const cam = st.camera;
            const merk = { p: cam.position.clone(), q: cam.quaternion.clone() };
            const S = r._kaskadenSchmier();
            const L = new T.Vector3(0.35, -0.85, 0.4).normalize(); // die Licht-Richtung (vom Licht fort)
            // die Höhlen-Dreiecke im Abschnitt gegen die, die das EINE Gesetz der Pass-Wahl (`_passTrifftBox`, in der Lage
            // des Hauptbilds) ohne die Höhlen-Sicht zöge
            const zaehl = (liste, lage) => {
                let ab = 0,
                    imFr = 0;
                const drin = new Set(liste);
                for (const b of s.bloecke.values())
                    for (const z of b.zellen)
                        if (z.knoten !== undefined && !z.huelle.isEmpty() && r._passTrifftBox(lage, z.huelle, 0)) {
                            imFr += z.idx.length / 3;
                            if (drin.has(z)) ab += z.idx.length / 3;
                        }
                return { ab, imFr };
            };
            // das Hauptbild eines Blicks, bis jede Mündung im Bild ihre Horizont-Sperre trägt (je Bild höchstens
            // `HOEHLEN_HORIZONT_PROBEN` frische Proben; eine ohne gilt als offen — dann prüfte die Wand die Sperre nicht)
            const hauptbild = (bl) => {
                cam.position.set(bl.auge[0], bl.auge[1], bl.auge[2]);
                cam.lookAt(bl.ziel[0], bl.ziel[1], bl.ziel[2]);
                cam.updateMatrixWorld(true);
                for (let f = 0; f < 400; f++) {
                    r._tickChunkSatz();
                    r._passSicht(cam, false);
                    const offen = s.hoehle?.offen ? s.hoehle.offen.length : 0;
                    if (offen <= r.constructor.HOEHLEN_HORIZONT_PROBEN) break;
                    r._passSicht(cam, true);
                }
                return (s.abschnitte.get("haupt") || { liste: [] }).liste.slice();
            };
            const miss = (bl) => {
                const liste = hauptbild(bl);
                const z = zaehl(liste, S.lage);
                const h = window.__hoehlenStrahl(r, cam, liste, { nx: 160, ny: 90 });
                const ohne = liste.filter((z) => z.knoten === undefined);
                const blind = window
                    .__hoehlenStrahl(r, cam, ohne, { nx: 160, ny: 90 })
                    .fehlend.filter((f) => f.hoehle).length;
                // die Kaskade: orthogonal, das Ziel in der Mitte, weit zum Licht hin
                const licht = new T.OrthographicCamera(-90, 90, 90, -90, 0, 1600);
                licht.coordinateSystem = cam.coordinateSystem;
                licht.updateProjectionMatrix();
                licht.position.set(bl.ziel[0] - L.x * 800, bl.ziel[1] - L.y * 800, bl.ziel[2] - L.z * 800);
                licht.lookAt(bl.ziel[0], bl.ziel[1], bl.ziel[2]);
                licht.updateMatrixWorld(true);
                // dieselbe Lage wie in `_passSicht`: Matrix, Frustum und die Lage des EINEN Gesetzes der Pass-Wahl (der
                // Stellvertreter ist keine Kaskaden-Kamera — er trägt keine Scheibe, das Gesetz urteilt nach seinem Frustum)
                S.m.multiplyMatrices(licht.projectionMatrix, licht.matrixWorldInverse);
                S.frustum.setFromProjectionMatrix(S.m, licht.coordinateSystem);
                r._passWahlLage(S, licht, 0);
                r._chunkSatzPass(licht, false, 0, S);
                const listeK = (s.abschnitte.get("k0") || { liste: [] }).liste.slice();
                r._chunkSatzPass(licht, true, -1, S);
                r._passSicht(cam, true);
                const sch = window.__hoehlenSchatten(r, cam, licht, listeK, { nx: 128, ny: 72 });
                return {
                    name: bl.name,
                    auge: bl.auge.map((v) => +v.toFixed(1)),
                    strahlen: h.strahlen,
                    hoehle: h.hoehle,
                    fehlend: h.fehlend,
                    versiegelt: h.versiegelt,
                    blind,
                    hoehleImAbschnitt: z.ab,
                    hoehleImFrustum: z.imFr,
                    abschnittTri: liste.reduce((a, x) => a + x.idx.length / 3, 0),
                    kaskadeTri: listeK.reduce((a, x) => a + x.idx.length / 3, 0),
                    schatten: { empfaenger: sch.empfaenger, beschattet: sch.beschattet, lecks: sch.lecks },
                };
            };
            for (const bl of blicke) aus.blicke.push(miss(bl));

            // ── an die Mündung: der Spieler vor dem Mund (der Ring steht um ihn), der Höhlen-Raum aus dem Gesetz in seinem
            // Umkreis (± 2 Chunks) in einem Chunk der Stufe 0 — nur dort trägt der Boden-Satz die Höhlen-Zellen des Graphs (K51: die
            // Nah-Zone ist 3 × 3, der Raum in einem Chunk der Stufe 1 sah 14 400 Strahlen ohne eine Höhlen-Fläche) —, dann die
            // Blicke in den Mund und in den Raum
            if (muendung) {
                const m = muendung;
                const vx = m.x + m.dx * 9,
                    vz = m.z + m.dz * 9;
                st.playerMesh.position.set(vx, r._voxelSurfaceY(vx, vz) + 1.8, vz);
                await schwinge();
                r._tickChunkSatz();
                const mpc = st.lastPlayerVoxelChunk;
                const stufe0 = (cx, cz) => {
                    const c = st.voxelChunks.get(cx + "," + cz);
                    return !!c && (c.lod || 0) === 0;
                };
                for (let dcx = -2; dcx <= 2 && !raum; dcx++)
                    for (let dcz = -2; dcz <= 2 && !raum; dcz++)
                        for (
                            let x = (mpc.cx + dcx) * span + 1.8;
                            x < (mpc.cx + dcx + 1) * span && !raum && stufe0(mpc.cx + dcx, mpc.cz + dcz);
                            x += 3.6
                        )
                            for (
                                let z = (mpc.cz + dcz) * span + 1.8;
                                z < (mpc.cz + dcz + 1) * span && !raum;
                                z += 3.6
                            ) {
                                const S = r._voxelSurfaceY(x, z);
                                if (S == null) continue;
                                for (let y = S - 4; y > S - 60 && !raum; y -= 2) {
                                    if (fest(x, y, z)) continue;
                                    let frei = 99;
                                    for (const [a, b, c] of [
                                        [1, 0, 0],
                                        [-1, 0, 0],
                                        [0, 1, 0],
                                        [0, -1, 0],
                                        [0, 0, 1],
                                        [0, 0, -1],
                                    ]) {
                                        let d = 0;
                                        while (d < 12 && !fest(x + a * d, y + b * d, z + c * d)) d += 0.5;
                                        frei = Math.min(frei, d);
                                    }
                                    if (frei >= 3 && S - y > 12) raum = { x, y, z };
                                }
                            }
                const blMund = {
                    name: "muendung",
                    auge: [m.x + m.dx * 9, m.y + 1, m.z + m.dz * 9],
                    ziel: [m.x - m.dx * 10, m.y - 1, m.z - m.dz * 10],
                };
                blicke.push(blMund);
                aus.blicke.push(miss(blMund));
                if (raum) {
                    const blRaum = {
                        name: "hoehle",
                        auge: [raum.x, raum.y, raum.z],
                        ziel: [raum.x + 20, raum.y - 3, raum.z + 7],
                    };
                    blicke.push(blRaum);
                    aus.blicke.push(miss(blRaum));
                }
            }
            aus.orte = { muendung, raum };

            // ── (h) GEDÄCHTNIS: die gemerkte Horizont-Sperre gilt nur dem Boden, den sie gemessen hat. Im Stand an der Mündung
            // (jede Mündung im Bild trägt ihre Sperre) schreibt ein Geomorph-Schreiber einen Boden-Bereich neu
            // (`_chunkSatzMarke`, wie beim Graben oder einer LOD-Naht): der nächste Pass misst jede Mündung im Bild neu.
            const blM = blicke.find((x) => x.name === "muendung");
            if (blM) {
                const H = () => s.hoehle;
                const imPass = () => {
                    r._tickChunkSatz();
                    r._passSicht(cam, false);
                    const o = {
                        offen: H().offen.length,
                        imBild: [...H().muendungen].reduce(
                            (a, kn) => a + kn.tore.filter((t) => t.st === H().stempel).length,
                            0
                        ),
                    };
                    r._passSicht(cam, true);
                    return o;
                };
                hauptbild(blM);
                r._passSicht(cam, true);
                const vor = imPass();
                const bm = [...s.bloecke.values()].find((b) => b.hoehle);
                r._chunkSatzMarke("boden", bm.key, ["aMorphTarget", "aMorphWeight"]);
                const nach = imPass();
                aus.gedaechtnis = { vor: vor.offen, nach: nach.offen, imBild: vor.imBild, bereich: bm.key };
            }

            // ── (b') HINAUS: der Spieler im Gang hinter dem Mund (der Ring steht um ihn, LOD 0), das Auge in der Höhlen-Luft,
            // der Blick durch die Mündung hinaus — neu, dann die alte Probe (die Sperre ohne den Weg hinaus, am Exemplar)
            // je Kandidat, bis die alte Probe hier Zellen verlöre (der Blick prüft die Klasse) — höchstens vier
            let xh = null;
            for (const kand of hinausKandidaten) {
                HINAUS = kand;
                st.playerMesh.position.set(HINAUS.spieler[0], HINAUS.spieler[1], HINAUS.spieler[2]);
                await schwinge();
                r._tickChunkSatz();
                const hin = { name: "hinaus", auge: HINAUS.auge, ziel: HINAUS.ziel };
                const ha = HINAUS.auge;
                const ueber = (() => {
                    for (let y = ha[1] + 1.2; y < ha[1] + 60; y += 1.2) if (fest(ha[0], y, ha[2])) return true;
                    return false;
                })();
                xh = miss(hin);
                xh.augeInHoehle = !fest(ha[0], ha[1], ha[2]) && ueber;
                r._hoehlenHinaus = () => {};
                // dieselbe Lage: die Kette hielte die eben gerechnete Wahl (`_passLageGen`) — die alte Probe rechnet neu
                if (r._passLagen) r._passLagen.clear();
                const alt = window.__hoehlenStrahl(r, cam, hauptbild(hin), { nx: 160, ny: 90 });
                delete r._hoehlenHinaus;
                xh.altFehlend = alt.fehlend.length;
                xh.altZuerst = alt.fehlend[0] || null;
                if (xh.altFehlend > 0) break;
            }
            if (xh) aus.blicke.push(xh);
            cam.position.copy(merk.p);
            cam.quaternion.copy(merk.q);
            cam.updateMatrixWorld(true);
            // ── (i) HIMMELS-LICHT: je Höhlen-Vertex des Boden-Satzes (nur in Dreiecken der Höhlen-Luft) die Himmels-Sicht
            // `aHimmel` gegen die unabhängige Wahrheit — den GERADEN Abstand d zum nächsten Vertex einer Himmels-Fläche: der
            // Netz-Weg ist nie kürzer, eine Kante höchstens 2,5 Schritte lang, also trägt keiner mehr als exp(−0,4·d/m) + 0,02 (der
            // gerade Abstand darf durch Fels führen: die Grenze ist nur oben scharf); die Höhlen-Vertices in den Mündungs-Boxen des
            // Graphs (`tore`, Höhlen-Luft neben Himmels-Luft — die Wahrheit des Dichtefelds) tragen im Mittel mindestens 0,15.
            {
                const A = r.constructor;
                const bs = [...r.state.chunkSaetze.values()].find((q) => q.spec && q.spec.name === "bodenSatz");
                const geo = bs && bs.geom;
                const PA = geo && geo.attributes.position;
                // die Himmels-Sicht reist im Satz in der vierten Komponente des Normal-Ziels (snorm8, K51-2 `_chunkSatzArt` boden)
                const NZ = geo && geo.attributes.aNormalZiel;
                const HA = NZ && NZ.itemSize === 4 ? { getX: (i) => NZ.getW(i) } : null;
                const himmelV = new Set(),
                    hoehleV = new Set();
                for (const b of bs ? bs.bloecke.values() : [])
                    for (const zl of b.zellen || []) {
                        const ziel = zl.knoten ? hoehleV : himmelV;
                        for (let i = 0; i < zl.idx.length; i++) ziel.add(zl.idx[i]);
                    }
                for (const i of himmelV) hoehleV.delete(i);
                const mundV = new Set();
                const pm = new window.THREE.Vector3();
                for (const b of bs ? bs.bloecke.values() : [])
                    for (const zl of b.zellen || []) {
                        const kn = zl.knoten;
                        if (!kn || !kn.tore || kn.tore.length === 0) continue;
                        for (let i = 0; i < zl.idx.length; i++) {
                            const j = zl.idx[i];
                            pm.set(PA.getX(j), PA.getY(j), PA.getZ(j));
                            if (hoehleV.has(j) && kn.tore.some((t) => t.box?.containsPoint(pm))) mundV.add(j);
                        }
                    }
                const L = window.__gelaendeCore.HIMMELS_SICHT.m;
                const TIEF = 14,
                    R = 2,
                    GR = 15;
                const gitter = new Map();
                for (const i of himmelV) {
                    const k =
                        Math.floor(PA.getX(i) / R) +
                        "," +
                        Math.floor(PA.getY(i) / R) +
                        "," +
                        Math.floor(PA.getZ(i) / R);
                    let l = gitter.get(k);
                    if (!l) gitter.set(k, (l = []));
                    l.push(i);
                }
                const abstand = (x, y, z) => {
                    let best = Infinity;
                    const n = Math.ceil(GR / R);
                    const gx = Math.floor(x / R),
                        gy = Math.floor(y / R),
                        gz = Math.floor(z / R);
                    for (let a = -n; a <= n; a++)
                        for (let bb = -n; bb <= n; bb++)
                            for (let c = -n; c <= n; c++) {
                                const l = gitter.get(gx + a + "," + (gy + bb) + "," + (gz + c));
                                if (l)
                                    for (const j of l) {
                                        const d = Math.hypot(PA.getX(j) - x, PA.getY(j) - y, PA.getZ(j) - z);
                                        if (d < best) best = d;
                                    }
                            }
                    return best;
                };
                const hl = {
                    hoehle: hoehleV.size,
                    tief: 0,
                    tiefM: TIEF,
                    ueber: [],
                    muend: mundV.size,
                    muendMittel: null,
                    muendMin: 0.15,
                    ohneAttribut: !HA,
                };
                let ms = 0,
                    k = 0;
                for (const i of hoehleV) {
                    // jeder dritte Vertex (die Kosten der Linse)
                    const x = PA.getX(i),
                        y = PA.getY(i),
                        z = PA.getZ(i);
                    if (k++ % 3 !== 0) continue;
                    const d = abstand(x, y, z);
                    if (d > TIEF) hl.tief++;
                    if (!HA) continue;
                    const v = HA.getX(i);
                    const max = Math.exp((-0.4 * d) / L) + 0.02;
                    if (v > max && hl.ueber.length < 50)
                        hl.ueber.push({
                            p: [x, y, z].map((q) => +q.toFixed(1)),
                            v: +v.toFixed(3),
                            d: +d.toFixed(2),
                            max: +max.toFixed(3),
                        });
                }
                if (HA) for (const i of mundV) ms += HA.getX(i);
                hl.muendMittel = mundV.size ? +(ms / mundV.size).toFixed(3) : null;
                aus.himmel = hl;
                // (k) DER FELS HAT STOFF: jeder Höhlen-Vertex ohne Himmel (aHimmel ≤ 0,001) und jeder Kliff-Vertex
                // (aHimmel ≥ 0,999, Steile ≥ rockHi: das Gewicht des Fels-Stoffs ist dort 1) trägt die Farbe, die das Gesetz
                // für IHN rechnet — gelaende-core `felsFarbe` mit seiner Krümmung (`felsKruemmung` über das Netz des Satzes),
                // seiner Himmels-Sicht und Feuchte (`_feuchteAt`), je Kanal auf 0,002 —, nie die Farbe der Säule; dazu die
                // Streuung der Leuchtdichte über den Höhlen-Fels (die Masse liegt bei 0) und seine Albedo.
                const CA = geo && geo.attributes.color;
                const NA = geo && geo.attributes.normal;
                const GK = window.__gelaendeCore;
                const G = A.TERRAIN_GEOLOGY;
                const FS = A.FELS_STOFF;
                const wf = { ohneHimmel: 0, fremd: 0, gruen: 0, erst: null, streuung: null, albedo: null };
                const kl = { steil: 0, fremd: 0, gruen: 0, erst: null };
                if (HA && CA && NA && GK && typeof GK.felsFarbe === "function") {
                    const nV = PA.count;
                    const P3 = new Float32Array(nV * 3),
                        N3 = new Float32Array(nV * 3);
                    for (let i = 0; i < nV; i++) {
                        P3[3 * i] = PA.getX(i);
                        P3[3 * i + 1] = PA.getY(i);
                        P3[3 * i + 2] = PA.getZ(i);
                        N3[3 * i] = NA.getX(i);
                        N3[3 * i + 1] = NA.getY(i);
                        N3[3 * i + 2] = NA.getZ(i);
                    }
                    // Die Krümmung je Block aus SEINEM Netz (der Satz-Index trägt freie Bereiche früherer Blöcke). Die
                    // LOD-Naht (`stitch:`-Blöcke) kopiert die fertige Farbe ihres Chunks auf eigene Quads und Vorhänge
                    // (Normale des Vorhangs 0,2 nach oben) — sie trägt den Stoff ihrer Quelle, gezählt werden die Chunks.
                    const KR = new Float32Array(nV);
                    const naht = new Uint8Array(nV).fill(1);
                    // die Feuchte des Moos-Terms: EINE je Chunk (`_felsStoff` am Schwerpunkt seines Felsens unter dem Himmel,
                    // `userData.felsFeuchte`)
                    const FE = new Float32Array(nV).fill(NaN);
                    if (bs)
                        for (const [key, bl] of bs.bloecke) {
                            if (String(key).startsWith("stitch:") || !bl.geom || !bl.geom.index) continue;
                            const g = bl.geom;
                            const k = GK.felsKruemmung(
                                g.attributes.position.array,
                                g.attributes.normal.array,
                                g.index.array,
                                bl.vAnzahl
                            );
                            KR.set(k, bl.vStart);
                            naht.fill(0, bl.vStart, bl.vStart + bl.vAnzahl);
                            const ud = g.userData ? g.userData.felsFeuchte : undefined;
                            FE.fill(Number.isFinite(ud) ? ud : NaN, bl.vStart, bl.vStart + bl.vAnzahl);
                        }
                    const B = FS ? FS.basis : GK.felsBasis(A.BODEN_FARBE.rock);
                    const fuss = FS.netz.fuss; // die Kante des Nah-Netzes, die das Spiel liest (`FELS_STOFF.netz`, kein Zwilling daneben)
                    const soll = [0, 0, 0];
                    const pruefe = (i, him, z) => {
                        const x = P3[3 * i],
                            y = P3[3 * i + 1],
                            zz = P3[3 * i + 2];
                        const fe = him > 0 ? FE[i] : 0;
                        GK.felsFarbe(B, x, y, zz, N3[3 * i], N3[3 * i + 1], N3[3 * i + 2], KR[i], him, fe, fuss, soll);
                        const c = [CA.getX(i), CA.getY(i), CA.getZ(i)];
                        if (Math.max(...c.map((q, j) => Math.abs(q - soll[j]))) <= 0.002) return c;
                        z.fremd++;
                        if (c[1] - (c[0] + c[2]) / 2 > 0) z.gruen++;
                        if (!z.erst)
                            z.erst = {
                                p: [x, y, zz].map((q) => +q.toFixed(1)),
                                c: c.map((q) => +q.toFixed(3)),
                                soll: soll.map((q) => +q.toFixed(3)),
                            };
                        return c;
                    };
                    const Ys = [];
                    for (const i of hoehleV) {
                        if (HA.getX(i) > 0.001 || naht[i]) continue;
                        wf.ohneHimmel++;
                        const c = pruefe(i, 0, wf);
                        Ys.push(0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]);
                    }
                    if (Ys.length) {
                        const m = Ys.reduce((a, q) => a + q, 0) / Ys.length;
                        const s = Math.sqrt(Ys.reduce((a, q) => a + (q - m) * (q - m), 0) / Ys.length);
                        wf.albedo = +m.toFixed(3);
                        wf.streuung = m > 0 ? +(s / m).toFixed(3) : 0;
                    }
                    for (let i = 0; i < nV; i++) {
                        if (naht[i] || HA.getX(i) < 0.999 || 1 - N3[3 * i + 1] < G.rockHi) continue;
                        kl.steil++;
                        pruefe(i, HA.getX(i), kl);
                    }
                }
                aus.wieseUnterFels = wf;
                aus.kliff = kl;
            }
            // ── (j) DAS LICHT DES AUGES: das Auge in der Höhlen-Luft (der Hinaus-Blick, 16 m unter der Wiese) und unter freiem
            // Himmel (2 m über der Säulen-Oberkante desselben Orts) — je Ort der Takt der Lichter (`_applyDayNightToScene`),
            // dann der Himmel am Auge und die Stärke seines Platzes im Licht-Pool (`_augenLeuchte`, in der Zahl des Labors × LEGACY_LICHT) gegen
            // sein Gesetz (AUGEN_LICHT, die Belichtung des Takts); (l) unter freiem Himmel jedes Licht der Szene, wie r184 es
            // sammelt (sichtbar, in den Ebenen der Kamera)
            {
                const A = r.constructor.AUGEN_LICHT;
                const B = r.constructor.BELICHTUNG;
                const lichtAm = (p) => {
                    cam.position.set(p[0], p[1], p[2]);
                    cam.updateMatrixWorld(true);
                    r._applyDayNightToScene();
                    const au = r._augenLeuchte;
                    // ein Platz des Licht-Pools: brennt das Auge, nennt `_leuchtQuellen` es am Auge beim Namen
                    const imPool =
                        !(au?.L && au.L.staerke > 0) ||
                        r._leuchtQuellen(p[0], p[1], p[2], 1).some((q) => q.id === au);
                    const h = st.himmelAmAuge;
                    const k = st.renderer && st.renderer.toneMappingExposure > 0 ? st.renderer.toneMappingExposure : 1;
                    const soll =
                        A && Number.isFinite(h)
                            ? ((1 - h) * ((B.zielKarte * Math.PI) / 0.18)) /
                              (k * window.__fachwerkCore.lichtAbfall(A, A.karteM))
                            : null;
                    // die Blendung: die Wand in 0,3 m gegen die Karte in 2 m, nach dem EINEN Gesetz (fachwerk `lichtAbfall`)
                    const LA = window.__fachwerkCore.lichtAbfall;
                    const blendung = A ? LA(A, 0.3) / LA(A, 2) : null;
                    const lichter = [];
                    st.scene.traverseVisible((o) => {
                        if (!o.isLight || !o.layers.test(cam.layers)) return;
                        const c = o.color;
                        // die Klasse beim Namen: der Typ, und eine Unterklasse (eigener Licht-Knoten) dazu
                        const stamm = T[o.type];
                        const unter =
                            stamm && Object.getPrototypeOf(o) !== stamm.prototype ? "/" + o.constructor.name : "";
                        lichter.push({
                            name: o.name || "",
                            typ: o.type + unter,
                            I: +(+o.intensity).toFixed(4),
                            schwarz: !!c && c.r + c.g + c.b <= 0,
                            direkt: !(o.isAmbientLight || o.isHemisphereLight || o.isLightProbe),
                        });
                    });
                    return {
                        auge: p.map((v) => +v.toFixed(1)),
                        h: Number.isFinite(h) ? +h.toFixed(3) : null,
                        I: !imPool ? null : au ? +(au.L.staerke * r.constructor.LEGACY_LICHT).toFixed(3) : 0,
                        soll: soll === null ? null : +(soll > 1e-4 ? soll : 0).toFixed(3),
                        abfall: A ? A.abfall : null,
                        kern: A ? A.kernM : null,
                        R: A ? A.reichweiteM : null,
                        blendung: blendung === null ? null : +blendung.toFixed(3),
                        lichter,
                    };
                };
                if (HINAUS) {
                    const ha = HINAUS.auge;
                    const frei = [ha[0], r.getTerrainHeightAt(ha[0], ha[2]) + 2, ha[2]];
                    const hoe = lichtAm(ha);
                    const fr = lichtAm(frei);
                    aus.szenenLicht = { frei: fr.lichter, hoehle: hoe.lichter };
                    delete hoe.lichter;
                    delete fr.lichter;
                    // die Wesen in Höhlen-Luft (in einer Luft-Box eines Höhlen-Knotens): der Term liegt im Boden-Stoff, sie tragen
                    // das Licht des Auges nicht
                    const sb = st.chunkSaetze.get("boden");
                    let wesen = 0;
                    for (const w of st.creatures || []) {
                        const wp = w && w.position;
                        if (!wp) continue;
                        let drin = false;
                        for (const bl of sb.bloecke.values()) {
                            if (!bl.hoehle) continue;
                            for (const kn of bl.hoehle.knoten) if (kn.luft?.containsPoint(wp)) drin = true;
                            if (drin) break;
                        }
                        if (drin) wesen++;
                    }
                    aus.augenLicht = {
                        hoehle: hoe,
                        frei: fr,
                        augeInHoehle: xh.augeInHoehle === true,
                        wesenInHoehle: wesen,
                        wesen: (st.creatures || []).length,
                    };
                }
                cam.position.copy(merk.p);
                cam.quaternion.copy(merk.q);
                cam.updateMatrixWorld(true);
                r._applyDayNightToScene();
            }
            // ── (f) DER BODEN-STOFF AM GRAPH (D3c: der gebaute Knoten-Graph und der Ruf, nie der Quelltext): die Himmels-Sicht
            // reist in der vierten Komponente des Normal-Ziels (K51-2, `_bodenStufenKnoten`), der Chunk-Stoff legt sie als
            // Verdeckung; die 2.5D-Lichtung und der Licht-Pool lesen sie nur mit `himmelsSicht` (in der Höhle die wahre Normale)
            const haelt = (w, n) => {
                const seen = new Set();
                const geh = (x) => {
                    if (!x || typeof x !== "object" || seen.has(x)) return false;
                    seen.add(x);
                    if (x === n) return true;
                    for (const c of typeof x.getChildren === "function" ? x.getChildren() : []) if (geh(c)) return true;
                    return false;
                };
                return geh(w);
            };
            try {
                const P = Object.getPrototypeOf(r);
                const kh = r._bodenStufenKnoten().himmel;
                const stoffArg = [];
                r._leuchtStoff = function (m, mp, h) {
                    stoffArg.push(h);
                    return P._leuchtStoff.apply(this, arguments);
                };
                let m1, m0;
                try {
                    m1 = r._buildPbrNodeMaterial({ vertexColors: true, geomorph: true, himmelsSicht: true });
                    stoffArg.push("|");
                    m0 = r._buildPbrNodeMaterial({ vertexColors: true, geomorph: true });
                } finally {
                    delete r._leuchtStoff;
                }
                const trenn = stoffArg.indexOf("|");
                aus.code.himmelLiest =
                    !!kh &&
                    kh.isSplitNode === true &&
                    kh.components === "w" &&
                    kh.node.getAttributeName() === "aNormalZiel" &&
                    kh.node.nodeType === "vec4" &&
                    haelt(r._getVoxelChunkMaterial().aoNode, kh) &&
                    haelt(m1.aoNode, kh) &&
                    !haelt(m0.aoNode, kh);
                aus.code.normaleHoehle = haelt(m1.normalNode, kh) && !haelt(m0.normalNode, kh);
                // der Boden reicht dem Pool seine Himmels-Sicht, jeder Himmels-Ersatz hängt im gebauten Term; im selben Ruf: der
                // Pool ruft die EINE BRDF, und die Bedingung jedes Zweigs (`select`) liest normalView/positionView (r184 baut
                // das Emissiv VOR der Lichtung)
                const atmo = r._ensureAtmoUniforms();
                const bed = [];
                let brdf = 0;
                const Te = Object.create(THREE.TSL, {
                    select: { value: (c, a, b) => (bed.push(c), THREE.TSL.select(c, a, b)) },
                });
                r._punktLichtBrdf = function () {
                    brdf++;
                    return P._punktLichtBrdf.apply(this, arguments);
                };
                let term;
                try {
                    term = r._lichtPoolTerm(Te, atmo, kh);
                } finally {
                    delete r._punktLichtBrdf;
                }
                aus.code.augenTerm =
                    stoffArg.slice(0, trenn).includes(kh) &&
                    !stoffArg.slice(trenn).includes(kh) &&
                    atmo.lichtErsatz.length > 0 &&
                    atmo.lichtErsatz.every((u) => haelt(term, u));
                aus.code.augenVorZweig =
                    bed.length > 0 && bed.every((c) => haelt(c, THREE.TSL.normalView) && haelt(c, THREE.TSL.positionView));
                // das EINE Punktlicht-Gesetz: der Pool ruft die BRDF (je Platz), kein zweiter Rufer, kein nacktes 1/d
                const brdfRufer = Object.getOwnPropertyNames(P).filter(
                    (n) => n !== "constructor" && typeof P[n] === "function" && !window.__fehlt(P[n], /this\._punktLichtBrdf\(/)
                );
                aus.code.poolGesetz =
                    brdf >= atmo.lichtLage.length &&
                    brdf > 0 &&
                    window.__fehlt(r._lichtPoolTerm, /reciprocal\(\)/) &&
                    brdfRufer.every((n) => n === "_lichtPoolTerm");
                aus.code.augenTslFremd =
                    ["diffuseContribution", "specularColorBlended"].find(
                        (n) => !window.__fehlt([r._lichtPoolTerm, r._punktLichtBrdf], new RegExp("\\b" + n + "\\b"))
                    ) || null;
                m1.dispose();
                m0.dispose();
            } catch (e) {
                aus.code.graphFehler = String(e?.message || e).split("\n")[0];
            }
            // (m) Der Shader rechnet DAS Gesetz (Nachbesserung 2): der Detail-Term ruft gelaende-core `felsFein` und `schuttKorn`
            // mit dem TSL-Rechenwerk und trägt keine eigene Ziehung — und das Rechenwerk rechnet, was das Gesetz rechnet: über
            // einem Zahlen-TSL (dieselben Knoten-Methoden, u32 als Math.imul/>>>) gegen das Zahlen-Rechenwerk des Kerns an
            // 400 Punkten. Bis dahin prüfte die Linse nur Namen (ein Shader mit eigenen gleich hohen Bänken blieb grün).
            aus.code.feinEigenHash = !window.__fehlt(r._terrainGeologyAlbedo, /43758|fract\([^;]*\bsin\(/);
            aus.code.feinRechenwerk = (() => {
                const GKc = globalThis.__gelaendeCore;
                if (
                    !GKc ||
                    typeof GKc.felsFein !== "function" ||
                    typeof r.constructor._felsRechenwerkTSL !== "function"
                )
                    return null;
                const V = (x) => (typeof x === "number" ? x : x.v);
                // die Knoten-Methoden lesen den Wert beim Aufruf (`this.v`): eine Variable (`toVar`, K17-3 `fest`/`falte`)
                // ändert ihn mit `assign`, ein Lese-Glied eines vec4 (`.x` … `.w`) liest den Wert seiner Variable jetzt
                const P = {
                    add(b) {
                        return mk(this.t === "u" ? (this.v + V(b)) >>> 0 : this.v + V(b), this.t);
                    },
                    sub(b) {
                        return mk(this.v - V(b), this.t);
                    },
                    mul(b) {
                        return mk(this.t === "u" ? Math.imul(this.v, V(b)) >>> 0 : this.v * V(b), this.t);
                    },
                    div(b) {
                        return mk(this.v / V(b), this.t);
                    },
                    clamp(a, c) {
                        return mk(Math.min(c, Math.max(a, this.v)), this.t);
                    },
                    bitXor(b) {
                        return mk((this.v ^ V(b)) >>> 0, "u");
                    },
                    shiftRight(b) {
                        return mk(this.v >>> V(b), "u");
                    },
                    greaterThan(b) {
                        return mk(this.v > V(b) ? 1 : 0, "b");
                    },
                    toVar() {
                        const h = mk(this.v, this.t);
                        h.assign = (b) => {
                            h.v = V(b);
                        };
                        return h;
                    },
                };
                const mk = (v, t) => Object.assign(Object.create(P), { v, t });
                // vec4 als Variable: x … w lesen den Zustand, `assign` setzt ihn (die Falte des Rechenwerks)
                const vec4 = (...c) => ({
                    c,
                    toVar() {
                        const H = { c: c.map(V) };
                        const glied = (q) =>
                            Object.defineProperty(Object.assign(Object.create(P), { t: "f" }), "v", {
                                get: () => H.c[q],
                            });
                        return {
                            x: glied(0),
                            y: glied(1),
                            z: glied(2),
                            w: glied(3),
                            assign: (n) => {
                                H.c = n.c.map(V);
                            },
                        };
                    },
                });
                const glatt = (a, b, x) => {
                    let t = (V(x) - V(a)) / (V(b) - V(a));
                    t = t < 0 ? 0 : t > 1 ? 1 : t;
                    return mk(t * t * (3 - 2 * t), "f");
                };
                const Tm = {
                    float: (x) => mk(V(x), "f"),
                    uint: (x) => mk(V(x) >>> 0, "u"),
                    int: (x) => mk(Math.trunc(V(x)), "i"),
                    min: (a, b) => mk(Math.min(V(a), V(b)), "f"),
                    max: (a, b) => mk(Math.max(V(a), V(b)), "f"),
                    floor: (a) => mk(Math.floor(V(a)), "f"),
                    sin: (a) => mk(Math.sin(V(a)), "f"),
                    exp: (a) => mk(Math.exp(V(a)), "f"),
                    abs: (a) => mk(Math.abs(V(a)), "f"),
                    sqrt: (a) => mk(Math.sqrt(V(a)), "f"),
                    step: (e, x) => mk(V(x) >= V(e) ? 1 : 0, "f"),
                    smoothstep: glatt,
                    select: (c, a, b) => (V(c) ? a : b),
                    uniformFlow: (x) => x,
                    vec3: (a, b, c) => ({ x: a, y: b, z: c }),
                    vec4,
                    // ein Fn mit Layout ruft seinen Rumpf mit der Liste der Argumente; die Schleife zählt i = 0 … n − 1
                    Fn: (f) => {
                        const g = (...a) => f(a);
                        g.setLayout = () => g;
                        return g;
                    },
                    Loop: (n, rumpf) => {
                        for (let i = 0; i < n; i++) rumpf({ i: mk(i, "i") });
                    },
                };
                // `raum` des Rausch-Atlas, Schritt für Schritt aus den Atlas-Bytes (`_rauschAtlasDaten`, Texel = Byte / 127 − 1)
                // wie `_rauschAtlas().raum` — die Welle der Bänke liest im Shader EINE Probe im Atlas (K17-2 NB1)
                const RG = r.constructor.RAUSCH_GESETZ,
                    AD = r.constructor._rauschAtlasDaten();
                const raumMock = (p) => {
                    const P = RG.P,
                        m = P - 1,
                        [SA, SB] = RG.schraeg;
                    const x = V(p.x),
                        y = V(p.y),
                        z = V(p.z);
                    const cx = Math.floor(x),
                        cy = Math.floor(y),
                        cz = Math.floor(z);
                    const f = [x - cx, y - cy, z - cz];
                    const i0 = (cx + cz * SA) & m,
                        j0 = (cy + cz * SB) & m;
                    const ecken = (i, j, c) => [0, 1, 2, 3].map((e) => AD[(j * 3 * P + 3 * i + c) * 4 + e] / 127 - 1);
                    const fx4 = [f[0], f[0] - 1, f[0], f[0] - 1],
                        fy4 = [f[1], f[1], f[1] - 1, f[1] - 1];
                    const schicht = (i, j, fz) => {
                        const a = ecken(i, j, 0),
                            b = ecken(i, j, 1),
                            c = ecken(i, j, 2);
                        return [0, 1, 2, 3].map((e) => a[e] * fx4[e] + b[e] * fy4[e] + c[e] * fz);
                    };
                    const bl = (t) => t * t * t * (t * (t * 6 - 15) + 10);
                    const mix = (a, b, t) => a + (b - a) * t;
                    const u = f.map(bl);
                    const s0 = schicht(i0, j0, f[2]),
                        s1 = schicht((i0 + SA) & m, (j0 + SB) & m, f[2] - 1);
                    const d = [0, 1, 2, 3].map((e) => mix(s0[e], s1[e], u[2]));
                    return mk(mix(mix(d[0], d[1], u[0]), mix(d[2], d[3], u[0]), u[1]) * RG.skala, "f");
                };
                const O = r.constructor._felsRechenwerkTSL(Tm, raumMock);
                const B = r.constructor.FELS_STOFF.basis;
                let maxDiff = 0,
                    n = 0;
                for (let i = 0; i < 400; i++) {
                    const x = Math.sin(i * 1.37) * 900,
                        y = Math.cos(i * 0.71) * 80,
                        z = Math.sin(i * 0.53) * 900;
                    const a = GKc.felsFein(O, B, x, y, z),
                        b = GKc.felsFein(GKc.felsZahl, B, x, y, z);
                    const ka = GKc.schuttKorn(O, x, z),
                        kb = GKc.schuttKorn(GKc.felsZahl, x, z);
                    maxDiff = Math.max(
                        maxDiff,
                        Math.abs(V(a.bank) - b.bank),
                        Math.abs(V(a.kante) - b.kante),
                        Math.abs(V(ka) - kb)
                    );
                    n++;
                }
                return { maxDiff, n };
            })();
            return aus;
        }, ORTE);
    } catch (e) {
        befund = { fehler: e?.message || String(e) };
    }
    await browser.close();
    server.close();
    if (!befund || befund.fehler) {
        console.log("❌ LAUF-FEHLER: " + (befund ? befund.fehler : "kein Befund"));
        process.exit(1);
    }
    console.log(`  Ring ${befund.ringChunks} Chunks, ${befund.bereiche} Boden-Bereiche`);
    for (const sp of befund.spiegel)
        console.log(
            `  Spiegel ${sp.chunk} (LOD ${sp.lod}, ${sp.n} Zellen): ` +
                (sp.fehler ||
                    Object.entries(sp.felder)
                        .map(([k, x]) => `${k} ${x ? "=" : "≠"}`)
                        .join(" · "))
        );
    const swb = befund.stoffWorker;
    if (swb)
        console.log(
            `  (n) Stoff im Worker: ${swb.bauten} Worker-Bauten, ${swb.rufe} Rufe des Fels-Gesetzes im Haupt-Thread` +
                (swb.namen.length ? ` (${swb.namen.join(" · ")})` : "") +
                `, Σ ${swb.ms} ms, max ${swb.msMax} ms je Bau · Gegenprobe Sync-Bau ${swb.syncRufe} Rufe`
        );
    console.log(`  Orte: Mündung ${JSON.stringify(befund.orte.muendung)} · Höhle ${JSON.stringify(befund.orte.raum)}`);
    if (befund.muendungen)
        console.log(
            `  (l) Mündungen im Gesetz: ${befund.muendungen.anzahl} in ${befund.muendungen.km2} km² (${befund.muendungen.jeKm2} je km²), ` +
                `Hang ${JSON.stringify(befund.muendungen.hangGrad)} °, gegenüber ${JSON.stringify(befund.muendungen.partner)}`
        );
    for (const x of befund.blicke)
        console.log(
            `  Blick ${x.name} ${JSON.stringify(x.auge)}: ${x.strahlen} Strahlen, ${x.hoehle} auf Höhle, fehlend ${x.fehlend.length}, ` +
                `durch versiegelte Flächen ${x.versiegelt}, ` +
                `blind-Probe ${x.blind} · Abschnitt ${x.abschnittTri} Dreiecke (Höhle ${x.hoehleImAbschnitt} von ${x.hoehleImFrustum} im ` +
                `Frustum) · Kaskade ${x.kaskadeTri} · Schatten ${x.schatten.empfaenger} Empfänger, ${x.schatten.beschattet} beschattet, ` +
                `${x.schatten.lecks.length} Lecks` +
                (x.name === "hinaus"
                    ? ` · Auge in Höhlen-Luft ${x.augeInHoehle} · die alte Probe ließe ${x.altFehlend} Zellen weg` +
                      (x.altZuerst ? `, zuerst ${x.altZuerst.bereich}#${x.altZuerst.knoten}` : "")
                    : "")
        );
    const gd = befund.gedaechtnis;
    if (gd)
        console.log(
            `  (h) Gedächtnis an der Mündung: ${gd.imBild} Mündungen im Bild · im Stand neu gemessen ${gd.vor} · nach ` +
                `\`_chunkSatzMarke("boden", ${gd.bereich})\` neu gemessen ${gd.nach}`
        );
    const hl = befund.himmel;
    if (hl)
        console.log(
            `  (i) Himmels-Licht: ${hl.hoehle} Höhlen-Vertices (jeder dritte geprüft), ${hl.tief} tiefer als ${hl.tiefM} m · ` +
                (hl.ohneAttribut
                    ? "der Boden-Satz trägt keine Himmels-Sicht"
                    : `über dem Abstand ${hl.ueber.length} · in den Mündungen ${hl.muend}, im Mittel ${hl.muendMittel}`)
        );
    const al = befund.augenLicht;
    if (al)
        console.log(
            `  (j) Licht des Auges: in der Höhle ${JSON.stringify(al.hoehle)} · unter freiem Himmel ${JSON.stringify(al.frei)}` +
                ` · Wesen in Höhlen-Luft ${al.wesenInHoehle} von ${al.wesen} (sie tragen es nicht)`
        );
    const sl = befund.szenenLicht;
    if (sl)
        console.log(
            `  (l) Szenen-Licht: unter freiem Himmel ${sl.frei.length} Lichter (Licht-Knoten je beleuchtetem Stoff): ` +
                sl.frei
                    .map((l) => `${l.typ}${l.name ? " `" + l.name + "`" : ""} ${l.I}${l.direkt ? "" : " (indirekt)"}`)
                    .join(" · ")
        );
    const wu = befund.wieseUnterFels;
    if (wu)
        console.log(
            `  (k) Fels-Stoff Höhle: ${wu.ohneHimmel} Vertices ohne Himmel, ${wu.fremd} ohne das Gesetz (${wu.gruen} grün), ` +
                `Albedo Y ${wu.albedo}, Streuung σ/Mittel ${wu.streuung}` +
                (wu.erst ? `, zuerst ${JSON.stringify(wu.erst)}` : "")
        );
    const kf = befund.kliff;
    if (kf)
        console.log(
            `  (k) Fels-Stoff Kliff: ${kf.steil} steile Vertices unter dem Himmel, ${kf.fremd} ohne das Gesetz (${kf.gruen} grün)` +
                (kf.erst ? `, zuerst ${JSON.stringify(kf.erst)}` : "")
        );
    // (m) DIE BANKUNG am Gesetz (rein, ohne Browser)
    try {
        globalThis.self = globalThis;
        require(path.join(__dirname, "..", "gelaende-core.js"));
        const GKn = globalThis.__gelaendeCore;
        befund.bankung = GKn && typeof GKn.felsBankung === "function" ? GKn.felsBankung() : null;
    } catch (e) {
        befund.bankung = null;
        console.log("  (m) Bankung: gelaende-core nicht ladbar — " + (e?.message || e));
    }
    const bkn = befund.bankung;
    if (bkn)
        console.log(
            `  (m) Bankung am Gesetz: ${bkn.baenke} Bänke, Mittel ${bkn.mittel} m, Variationskoeffizient ${bkn.cv}, ` +
                `Eigen-Welligkeit der Fugen ${bkn.welligkeit} Bänke, Durchlauf der Klüfte ${bkn.durchlauf}`
        );
    const fr = befund.code && befund.code.feinRechenwerk;
    console.log(
        `  (m) Shader: eigene Ziehung ${befund.code && befund.code.feinEigenHash}, ` +
            `TSL-Rechenwerk gegen Zahlen-Rechenwerk ${fr ? `max. Abstand ${fr.maxDiff} an ${fr.n} Punkten` : "fehlt"}`
    );
    const v = urteil(befund);
    wandEnde(
        v,
        "HÖHLEN-SICHT — jede sichtbare Höhlen-Fläche steht im Abschnitt, kein Licht-Leck, Main = Worker."
    );
})();

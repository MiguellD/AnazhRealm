// diag-werk-im-wasser.cjs — DIE WASSER-WAHRHEIT DER WERKE (Familie wasser-wahrheit): „Werk steht im Wasser" und
// „Wagen im Wasser ohne Widerstand", je Täter beim Namen. Jede Probe ruft den Chokepoint selbst im echten Boot (headless,
// Foundry an, Null-Renderer der Welt), im echten Spiel-Takt (`_gameLoopTick`):
//
//   H — DER HAIN AM FLUSS: der Schau-Ablauf — eine Eiche per Bau 16 m östlich (wie F im Bau-Modus), dann der Satz „pflanz
//       mir einen eichenhain am wasser", dann 1200 Spiel-Takte (20 s). Je Stamm das gezeichnete Wasser (`_wasserBildAt`) im
//       Ring von 1,5 m über seinem Fuß, wo es sichtbar über dem Boden steht.  Soll 0 · 0 Chunks
//   S — DAS HAUS AUS DEM SATZ: „bau mir ein haus am wasser" an Uferorten um den Schau-Ort, die Furt und den See (je Zentrum
//       bis zu drei trockene Standorte 18–40 m vom Zentrum). Die Häuser misst Z.  Soll ≥ 5 Häuser
//   Z — DER ZENSUS DER WERKE: jedes Werk, das während der Probe gesetzt wird (Wald und Unterholz beim Strömen, der Hain, die
//       Bau-Eiche, die Häuser der Sätze, „dorf" am Fluss: `spawnSettlement` seed 7, 18 Häuser, Brunnen, Stände; kein
//       Fahrzeug). Der Setz-Punkt `spawnArchitecture` ist Beobachtungs-Punkt: ein Stamm misst das Wasser über seinem Fuß VOR
//       seinem Stempel; ein anderes Werk hält dort das Wasser über dem Boden im Umkreis von 18 m fest (1-m-Gitter, Bild UND
//       Gesetz — ein Stempel verdrängt danach das gezeichnete), und gemessen wird, wenn es STEHT: jede Box seiner Hülle, die
//       den Boden trägt (die Solids des Gesetzbuchs samt Fundament-Podest — das Haus, mit dem der Körper kollidiert; nie die
//       Grundriss-Rechnung des Wirts), auf einem Raster ≤ 1 m; ein Werk an der Wand (Rezept-Ort „wand", die Wandlaterne)
//       trägt keinen Boden: es hängt an der Hülle eines stehenden Hauses (≤ 0,6 m), sonst hängt es an keiner Wand.  Soll 0
//   L — DIE WACHE DES GEFALLENEN (kommentarfrei, Node): `_waterLevelAt` nur als Bezug der Ufer-Bänder (jeder Aufruf mit `aus`),
//       der Wald liest den Bezug nie als Wasser, kein Bau weckt den Automaten am Setz-Punkt, der Stempel läuft nie den ganzen
//       Bestand, keine Wurzel sagt still ab, `natur_weicht` ist fort (die gefallenen Namen trägt gate:altlasten).
//   K — DER KONSUM AM RUF: am Ort des Spielers ruft jeder Leser sein Gesetz — `_feuchteAt` den Bezug, der Wald
//       `_atlasWaterLevelAt`, der Zell-Stempel `_blockerNahe`, Tempel und Bauplan `_werkOrtSuchen`, Baum · Insel · UFO
//       `_setzErgebnis`, der losgelassene Wagen `_fahrTiefe`.
//   F — DER WAGEN IM WASSER: der GT fährt im echten Sim-Schritt mit Vollgas aus 26 m Anlauf in 0,5–0,75 m Wasser (eine
//       Furt um den Schau-Ort, gesucht). Soll: 1 s nach dem Eintauchen
//       ≤ 50 % des Eintritts-Tempos; die Verfolger-Kamera nie unter dem Spiegel.
//   C — DER SATZ NENNT DAS ERGEBNIS: am See −906/−634 je Richtung eine Uferkante, der Blick auf den
//       See, „pflanz mir sechs birken" (bis zwei Teil-Ergebnisse). Soll: der Chat sagt die tatsächliche Zahl
//       („2 von 6 Birke gewachsen — 4 nicht: …"), bei 0 „nichts", die gewünschte nur, wenn alles steht.
//   E — DAS ERGEBNIS JEDES SETZ-OPS: je Op ein erzwungener Fehl-Grund, gesprochen wie der Spieler —
//       „spawne kreaturen 10" an der Obergrenze (3 frei, 0 frei), Tempel und Fraktal bei kaltem Buch, Damm und Wasserfall
//       ohne Bauplan, der Tempel mitten im See, „baue dorf hier" im See (es folgt). Soll: die tatsächliche Zahl mit dem
//       Grund aus der EINEN Tafel (`SETZ_GRUND`), nie der Wunsch, nie eine Absage ohne Grund; das Dorf sagt „wird gebaut" und
//       meldet dann die Häuser, die stehen. Statisch (L): jeder Setz-Op legt `_setzErgebnis` ins Log, keine Wurzel sagt still ab.
//   R — DAS DORF DES NEXUS AM SEERAND: Same 1500797043 bei −1138/−1060, der Spieler am Rand des
//       Plans (der Anker bleibt der verlangte Ort), ein haus_provenzalisch bei −1129/−1099 am See; die Häuser bekommen ihre
//       Hülle, die Chunks am Rand entstehen neu, 600 Takte. Soll: 0 Invalidierungen, das Wasser bleibt (± 1 %).
//   D — DER DAMM ÜBERSTEHT DEN RELOAD (eigener Browser-Kontext, frische Welt): der Damm des Studios
//       quer über den Fluss bei der Furt, 1200 Takte, gespeichert, neu geladen, 1200 Takte, abgerissen. Soll: der Stausee bildet sich neu (± 10 % des Staus), der Abbau weckt ihn (≥ 1 Invalidierung).
//       D misst das Stau-Feld des Gesetzes (`state.waterStau`, gelaende.K2): ≥ 20 Spalten gehoben (sonst trägt der Ort keinen
//       Stau); die nassen Punkte lesen den Spiegel des Kerns, der es trägt. Der Damm steht in der Klamm S6 der
//       Prüfbühne (spec/pruefbuehne, Term `rinne`: 14 % Gefälle, 20 m Sohle), geboren wie im Spiel, und er fasst das Ufer: je
//       Seite bis 4 m über dem Spiegel + 1 m.
//   K — DER KERN (Node, vehicle-core fahrKraefte): ohne Tiefe byte-gleich (das Labor kennt kein Wasser, Labor = Welt an
//       Land); in 0,61 m aus 12 m/s nach 1 s ≤ 6 m/s; Vollgas im Wasser endet im Gleichgewicht des Gesetzes
//       √((aEngine − rollDecel) / (kStirn·Tiefe + dragK)) ± 5 %; steht das Wasser an der Ansaugung (Gürtellinie), fährt er
//       aus dem Stand keine 5 cm (seine Masse: gate:fahr-leben --koerper).
//
//   node scripts/diag-werk-im-wasser.cjs [--selftest]          Port: WERK_WASSER_PORT (Standard 4643)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const { statikServer, starteBrowser, nullRenderer, taeterFaelle, selbsttestEnde, argOpt, ausDatei, SELBSTTEST, path, stammLib } = require("./lib/welt-boot.cjs");
const { messort } = require("./lib/welt-orte.cjs");

const SCHWELLE = {
    tiefeStamm: 0.05, // m sichtbares Wasser über dem Fuß eines Stamms
    tiefeFundament: 0.1, // m sichtbares Wasser über dem Boden an einem Raster-Punkt des Fundaments
    caChunks: 0, // Chunks, die der Wasser-Automat nach den Bauten am Ufer rechnet
    hainMin: 6, // Stämme, die der Satz setzen muss (sonst prüft die Probe nichts)
    zensusMin: 40, // Werke im Zensus (Wald + Hain + Dorf), sonst LEER
    haeuserMin: 6, // Häuser des Dorfs im Zensus
    satzOrteMin: 6, // Uferorte, an denen der Haus-Satz gesprochen wird
    satzHaeuserMin: 5, // Häuser, die der Haus-Satz an ihnen setzen muss (sonst misst Z keins)
    satzAbstandMax: 12, // m vom Haus zum nächsten Wasser: „am Wasser" bleibt am Wasser
    eintrittMin: 6, // m/s: so schnell muss der Wagen ins Wasser fahren (sonst LEER)
    restAnteil: 0.5, // Tempo 1 s nach dem Eintauchen gegen das Eintritts-Tempo
    kameraUnter: 0, // Frames mit der Kamera unter dem Spiegel
    ansaugRest: 0.5, // m/s: so schnell fährt der Wagen höchstens 3 s, nachdem das Wasser die Ansaugung erreichte (K02)
    vortriebEps: 0.05, // m/s: um so viel darf das Tempo nach der Ansaugung steigen (Rauschen des Schritts)
    schwimmAnteil: 0.5, // Anteil der Frames nach dem Aussteigen in tiefem Wasser, in denen der Spieler schwimmt
    aussteigTiefMin: 1.35, // m Wasser am Wagen, in dem der Spieler aussteigt (Karte K02: 1,5 m)
    aussteigBoden: 0.3, // m: so weit stehen die Füße nach dem Aussteigen an Land vom Boden (sonst steht er auf dem Wagen)
    stauMin: 100, // nasse Punkte (1-m-Gitter ±40 m), die der Damm aufstauen muss (Kopf K37: 180 im Tal 26/−120)
    hubMin: 20, // Spalten, die das Stau-Feld des Damms über Boden und Gesetz hebt (sonst trägt der Ort keinen Stau)
    stauTreue: 0.1, // Anteil des Staus, um den der Stausee nach dem Reload vom Stausee davor abweichen darf
    neubauTreue: 0.01, // Anteil der nassen Punkte, um den ein frischer Neubau der Chunks am Damm den Stausee ändern darf
    randTreue: 0.01, // Anteil, um den das Wasser (nasse Punkte, gezeichnete Spalten) am Seerand sich mit dem Dorf ändern darf
};

// ── DAS URTEIL (rein; Lauf und Selbsttest). Rückgabe: die Täter beim Namen. ──
function urteil(b) {
    const v = [];
    const S = SCHWELLE;
    const m = (x) => (Number.isFinite(x) ? x.toFixed(2) : String(x));
    // K — der Konsum am Ruf: jeder Leser ruft sein Gesetz
    const KO = b.konsum;
    if (!KO || KO.fehler || !Object.keys(KO).length) v.push(`K LEER: der Konsum am Ruf wurde nicht gemessen (${KO?.fehler || "keine Probe"})`);
    else for (const [k, ok] of Object.entries(KO)) if (!ok) v.push(`KONSUM: ${k} — der Leser ruft sein Gesetz nicht`);
    // H
    const H = b.hain;
    if (!H || H.fehler) v.push(`H: ${H ? H.fehler : "die Hain-Probe lief nicht"}`);
    else {
        if (!(H.satz >= S.hainMin))
            v.push(
                `H LEER: der Satz setzte ${H.satz} von ${S.hainMin} Eichen${H.chat ? ` — „${H.chat}"` : ""}${H.bauten && H.bauten.length ? ` — Bauten am Ufer: ${H.bauten.join(", ")}` : ""}${b.uferWahl ? ` — Ufer-Wahl ${JSON.stringify(b.uferWahl)}` : ""}`
            );
        for (const s of H.staemme || [])
            if (s.tiefe > S.tiefeStamm)
                v.push(
                    `H: ${s.typ} #${s.id} (${m(s.x)}/${m(s.z)}) steht ${m(s.tiefe)} m im Wasser nach ${H.takte} Takten`
                );
        if (!(H.caChunks <= S.caChunks))
            v.push(`H: die Bauten am Ufer weckten den Wasser-Automaten (${H.caChunks} Chunks rechnen)`);
    }
    // S
    const SA = b.satz;
    if (!SA || SA.fehler) v.push(`S: ${SA ? SA.fehler : "die Satz-Probe lief nicht"}`);
    else {
        if (!(SA.orte >= S.satzOrteMin))
            v.push(`S LEER: nur ${SA.orte} Uferorte für den Haus-Satz gefunden (Soll ≥ ${S.satzOrteMin})`);
        if (!(SA.haeuser >= S.satzHaeuserMin))
            v.push(
                `S LEER: der Haus-Satz setzte ${SA.haeuser} Häuser an ${SA.orte} Uferorten (Soll ≥ ${S.satzHaeuserMin})`
            );
        for (const h of SA.fern || [])
            v.push(
                `S: ${h.typ} #${h.id} (${m(h.x)}/${m(h.z)}) steht ${m(h.abstand)} m vom Wasser — „am Wasser" (Soll ≤ ${S.satzAbstandMax} m)`
            );
    }
    // Z
    const Z = b.zensus;
    if (!Z || Z.fehler) v.push(`Z: ${Z ? Z.fehler : "der Zensus lief nicht"}`);
    else {
        if (!(Z.werke >= S.zensusMin)) v.push(`Z LEER: nur ${Z.werke} Werke gesetzt (Soll ≥ ${S.zensusMin})`);
        if (!(Z.haeuser >= S.haeuserMin)) v.push(`Z LEER: nur ${Z.haeuser} Häuser im Zensus (Soll ≥ ${S.haeuserMin})`);
        for (const w of Z.ohneHuelle || [])
            v.push(`Z LEER: ${w.typ} #${w.id} (${w.quelle}) stand ohne Hülle — sein Fundament blieb ungemessen`);
        for (const w of Z.ohneWand || [])
            v.push(
                `Z: ${w.typ} #${w.id} (${m(w.x)}/${m(w.z)}) hängt an keiner Wand — kein stehendes Haus trägt es (${w.quelle})`
            );
        for (const w of Z.imWasser || [])
            v.push(
                `Z: ${w.typ} #${w.id} (${m(w.x)}/${m(w.z)}) ${w.wo} ${m(w.tiefe)} m im Wasser${w.punkte ? ` (${w.punkte})` : ""} (${w.quelle})`
            );
    }
    // L
    for (const x of b.leser || []) v.push(`L: ${x}`);
    // F
    const F = b.wagen;
    if (!F || F.fehler) v.push(`F: ${F ? F.fehler : "die Wagen-Probe lief nicht"}`);
    else {
        if (!(F.vEin >= S.eintrittMin))
            v.push(`F LEER: der Wagen kam mit ${m(F.vEin)} m/s ins Wasser (Soll ≥ ${S.eintrittMin})`);
        else if (!(F.v1 <= S.restAnteil * F.vEin))
            v.push(
                `F: Wagen im Wasser ohne Widerstand — ${m(F.vEin * 3.6)} km/h beim Eintauchen, 1 s später ${m(F.v1 * 3.6)} km/h in ${m(F.tiefe)} m Wasser`
            );
        if (!(F.kameraUnter <= S.kameraUnter))
            v.push(
                `F: die Verfolger-Kamera steht in ${F.kameraUnter} Frames unter dem Spiegel (bis ${m(F.kameraTiefe)} m)`
            );
    }
    // A
    const AN = b.ansaug;
    if (!AN || AN.fehler) v.push(`A: ${AN ? AN.fehler : "die Ansaug-Probe lief nicht"}`);
    else if (!AN.erreicht)
        v.push(`A LEER: das Wasser erreichte die Ansaugung (${m(AN.ansaug)} m) nie (bis ${m(AN.maxTiefe)} m)`);
    else {
        if (!(AN.v3 <= S.ansaugRest))
            v.push(
                `A: 3 s nach der Ansaugung (${m(AN.ansaug)} m) fährt der Wagen noch ${m(AN.v3)} m/s (Soll ≤ ${S.ansaugRest}; an der Ansaugung ${m(AN.vA)})`
            );
        if (!(AN.vMaxNach <= AN.vA + S.vortriebEps))
            v.push(`A: Vortrieb nach der Ansaugung — das Tempo steigt von ${m(AN.vA)} auf ${m(AN.vMaxNach)} m/s`);
        if (!(AN.maxTiefe <= AN.dach))
            v.push(`A: der Wagen taucht ${m(AN.maxTiefe)} m tief — über sein Dach (${m(AN.dach)} m)`);
        if (!(AN.kameraUnter <= S.kameraUnter))
            v.push(`A: die Verfolger-Kamera steht in ${AN.kameraUnter} Frames unter dem Spiegel`);
        const AD = AN.damm;
        if (!AD) v.push("A LEER: der geparkte Wagen wurde nicht neu gestempelt");
        else if (AD.nass || AD.invalidierungen > 0)
            v.push(
                `A: der geparkte Wagen in ${m(AD.tiefe)} m Wasser ist ein Damm — sein Zell-Stempel verdrängt Wasser und weckt den Automaten (${AD.invalidierungen} Invalidierungen, ${AD.caChunks} Chunks wach${AD.wer ? ", Rufer " + AD.wer : ""})`
            );
        const AL = AN.land;
        if (!AL || !(Math.abs(AL.fussUeberBoden) <= S.aussteigBoden))
            v.push(
                `A: Aussteigen an Land — der Spieler steht ${AL ? m(AL.fussUeberBoden) : "?"} m über dem Boden (${AL ? m(AL.abstand) : "?"} m von der Wagen-Mitte: auf dem Wagen)`
            );
        const AS = AN.aussteigen;
        if (!AS || AS.fehler) v.push(`A LEER: ${AS ? AS.fehler : "das Aussteigen lief nicht"}`);
        else if (!(AS.tiefeWagen >= S.aussteigTiefMin))
            v.push(
                `A LEER: der Wagen stand beim Aussteigen in ${m(AS.tiefeWagen)} m Wasser (Soll ≥ ${S.aussteigTiefMin})`
            );
        else if (!(AS.schwimmFrames >= S.schwimmAnteil * AS.frames))
            v.push(
                `A: Aussteigen in ${m(AS.tiefeWagen)} m Wasser — der Spieler schwimmt ${AS.schwimmFrames} von ${AS.frames} Frames (${m(AS.ueberSpiegel)} m über dem Spiegel, ${m(AS.abstand)} m von der Wagen-Mitte, am Ausstieg ${m(AS.tiefeAusstieg)} m Wasser)`
            );
    }
    // C
    const C = b.ergebnis;
    if (!C || C.fehler) v.push(`C: ${C ? C.fehler : "die Ergebnis-Probe lief nicht"}`);
    else {
        const vs = C.versuche || [];
        if (!vs.some((x) => x.gesetzt > 0 && x.gesetzt < x.gewollt))
            v.push(`C LEER: kein Teil-Ergebnis am See (gesetzt ${vs.map((x) => x.gesetzt).join(", ") || "—"} von 6)`);
        for (const x of vs) {
            const ort = `am Ufer ${x.ufer.join("/")}`;
            if (x.gesetzt < x.gewollt && new RegExp(`(?<!\\d)${x.gewollt}×`).test(x.chat))
                v.push(
                    `C: der Satz sagt die gewünschte Zahl — „${x.chat}" bei ${x.gesetzt} von ${x.gewollt} gesetzten Birken ${ort}`
                );
            else if (x.gesetzt > 0 && x.gesetzt < x.gewollt && !x.chat.includes(`${x.gesetzt} von ${x.gewollt}`))
                v.push(
                    `C: der Satz nennt die tatsächliche Zahl nicht — „${x.chat}" bei ${x.gesetzt} von ${x.gewollt} ${ort}`
                );
            else if (x.gesetzt === 0 && !/nichts/.test(x.chat))
                v.push(`C: der Satz sagt nicht, dass nichts steht — „${x.chat}" bei 0 von ${x.gewollt} ${ort}`);
        }
    }
    // E
    const E = b.setzen;
    if (!E || E.fehler) v.push(`E: ${E ? E.fehler : "die Setz-Probe lief nicht"}`);
    else {
        for (const x of E.faelle || []) {
            const wo = `${x.name} („${x.satz}")`;
            if (!(x.gesetzt < x.gewollt)) {
                v.push(`E LEER: ${wo} setzte ${x.gesetzt} von ${x.gewollt} — der Fehl-Grund griff nicht`);
                continue;
            }
            if (x.chat.includes(x.wunsch))
                v.push(
                    `E: ${wo} — der Satz sagt den Wunsch „${x.wunsch}" bei ${x.gesetzt} von ${x.gewollt}: „${x.chat}"`
                );
            else if (x.gesetzt > 0 ? !x.chat.includes(`${x.gesetzt} von ${x.gewollt}`) : !/nichts/.test(x.chat))
                v.push(
                    `E: ${wo} — der Satz nennt die tatsächliche Zahl nicht (${x.gesetzt} von ${x.gewollt}): „${x.chat}"`
                );
            else if (!x.chat.includes(x.grund))
                v.push(`E: ${wo} — der Satz nennt den Grund nicht („${x.grund}"): „${x.chat}"`);
            if (/ohne benannten Grund/.test(x.chat)) v.push(`E: ${wo} — eine Absage ohne Grund: „${x.chat}"`);
        }
        const DF = E.dorf;
        if (!DF) v.push("E: das Dorf im See lief nicht");
        else {
            if (/vor dir gebaut/.test(DF.sofort) || !/wird gebaut/.test(DF.sofort))
                v.push(
                    `E: das Dorf im See — der Satz sagt sofort „${DF.sofort}" bei ${DF.sofortGesetzt} stehenden Häusern (Soll: „wird gebaut")`
                );
            const zahl = /: (\d+) (?:Haus|Häuser)\./.exec(DF.echo || "");
            if (!DF.echo) v.push("E LEER: das Dorf im See meldete sein Ergebnis nicht");
            else if (zahl ? Number(zahl[1]) !== DF.haeuser : DF.haeuser > 0)
                v.push(`E: das Dorf im See meldet „${DF.echo}" bei ${DF.haeuser} stehenden Häusern`);
        }
    }
    // R
    const RD = b.rand;
    if (!RD || RD.fehler) v.push(`R: ${RD ? RD.fehler : "die Seerand-Probe lief nicht"}`);
    else {
        if (!(RD.haeuser >= 1) || !RD.randHaus)
            v.push(
                `R LEER: das Dorf des Nexus setzte ${RD.haeuser} Häuser, keins am Seerand (${RD.randHaus}; geräumte Reste früherer Proben: ${(RD.reste || []).join(", ") || "keine"}; Nexus-Deckel ${RD.deckel ? `${RD.deckel.max}, autonome Bauten ${RD.deckel.autosVor} → ${RD.deckel.autosNach}` : "ungemessen"})`
            );
        // ohne Wasser in der Reichweite seines Erdbaus prüft R nichts: kein Stempel des Dorfs kann dort Wasser verdrängen
        else if (!(RD.nassImErdbau > 0))
            v.push(
                `R LEER: der Erdbau des Dorfs (${RD.erdbau} Orte) reicht an keine nasse Spalte — das Rand-Haus ${RD.randHaus} steht ${RD.randM} m vom Seeufer, die Ort-Wahl rückte das Dorf ${RD.ortWahlM} m`
            );
        // ein Wecken ist ein Befund, wenn keine Wasser-Zelle eines geladenen Chunks sich änderte (`zellenWechsel`)
        if (RD.invalidierungen > 0 && !(RD.zellenWechsel > 0))
            v.push(
                `R: das Dorf am Seerand weckt den Wasser-Automaten, ohne Wasser der Zellen zu verdrängen — ${RD.invalidierungen} Invalidierungen, ${RD.ca} Chunks wach nach ${RD.takte} Takten (${RD.randHaus})`
            );
        if (
            Math.abs(RD.nass1 - RD.nass0) > S.randTreue * RD.nass0 ||
            Math.abs(RD.bild1 - RD.bild0) > S.randTreue * RD.bild0
        )
            v.push(
                `R: das Wasser am Seerand ändert sich mit dem Dorf — nasse Punkte ${RD.nass0} → ${RD.nass1}, gezeichnete Spalten ${RD.bild0} → ${RD.bild1}`
            );
    }
    // D — ein Zählen, ehe der Stau stand (`offen1` am Bau, `offen2` nach dem Reload: Stau im Faden + Chunks, wie die Welt sie
    // offen nennt; ungemessen ist nicht 0), urteilt nie über den Stausee: es nennt, worauf es hätte warten müssen
    const D = b.damm;
    if (!D || D.fehler) v.push(`D: ${D ? D.fehler : "die Damm-Probe lief nicht"}`);
    else if (D.offen1 !== 0 || D.offen2 !== 0)
        v.push(`D: der Stausee des Damms #${D.id} wurde gezählt, ehe der Stau stand (offen ${D.offen1} · ${D.offen2})`);
    else if (!(D.hub >= S.hubMin))
        v.push(
            `D LEER: das Stau-Feld des Damms #${D.id} (${m(D.x)}/${m(D.z)}) hebt ${D.hub} Spalten (Soll ≥ ${S.hubMin}) — der Ort trägt keinen Stau`
        );
    else {
        // das Feld hebt (oben): staut das gezeichnete Wasser weniger, folgt das Bild dem Gesetz nicht (die Platte unter dem
        // Stausee, ci-werk-wasser: 98 statt 458 Punkte) — kein leerer Ort
        const stau = D.w1 - D.w0;
        if (!(stau >= S.stauMin))
            v.push(
                `D: der Damm #${D.id} hebt ${D.hub} Spalten, das gezeichnete Wasser staut ${stau} nasse Punkte (ohne Damm ${D.w0}, mit ${D.w1})`
            );
        else if (!(D.hub2 >= S.hubMin)) v.push(`D: nach dem Reload trägt der Stau kein Feld des Damms #${D.id} (${D.hub2} Spalten)`);
        else if (!(Math.abs(D.w3 - D.w2) <= S.neubauTreue * D.w2))
            v.push(`D: ein Chunk am Damm #${D.id} trug den Stau erst nach seinem Neubau (${D.w2} → ${D.w3})`);
        else if (!(Math.abs(D.w2 - D.w1) <= S.stauTreue * stau))
            v.push(
                `D: der Stausee des Damms #${D.id} (${m(D.x)}/${m(D.z)}) bildet sich nach dem Reload nicht neu — ${D.w2} statt ${D.w1} nasse Punkte nach ${D.takte} Takten (ohne Damm ${D.w0})`
            );
    }
    if (D && !D.fehler && !(D.abriss >= 1))
        v.push(
            `D: der Abbau des Damms #${D.id} nach dem Reload weckt den Wasser-Automaten nicht (${D.abriss} Invalidierungen)`
        );
    // K
    for (const x of b.kern || []) v.push(`K: ${x}`);
    return v;
}

// ── L: DIE LESER — jede Absenz über den EINEN Helfer (stammLib.fehlt, der Täter mit Datei und Zeile). ──
// Die Leser-Linse trägt nur noch die Wache des Gefallenen (Absenzen, D3c): jede Präsenz misst die Welt am Ruf (`konsum` in
// probe) oder am Verhalten (H · Z · S · R · D · F · E). `w` wandelt den Stamm (der Vor-Stand des Selbsttests).
function leserUrteil(w) {
    const v = [];
    const nicht = (glied, re, satz) => stammLib.fehlt(glied, re, w) || v.push(`${satz} (${stammLib.fehlt.wo})`);
    // `_waterLevelAt` nur als Bezug der Ufer-Bänder: jeder Aufruf trägt sein `aus` (drei Argumente)
    nicht(null, /\b_waterLevelAt\((?![^(),]*,[^(),]*,[^(),]*\))[^()]*\)/, "`_waterLevelAt` liest den Bezug der Ufer-Bänder als Wasser-Probe");
    nicht("_forestCellDarts", /waterYAt:(?:(?!slopeAt:)[\s\S])*_waterLevelAt\(/, "der Wald (`_forestCellDarts` waterYAt) liest den Bezug `_waterLevelAt` als Wasser");
    // DER DAMM: der Automat wacht am Zell-Stempel, nie am Setz-Punkt; der Stempel läuft nur die Werke am Ort durch
    nicht("spawnArchitecture", /_invalidateWaterCapsAround\(/, "ein Bau weckt den Wasser-Automaten am Setz-Punkt (`spawnArchitecture`) statt am Zell-Stempel");
    nicht(
        "_stampArchitectureSolidCellsInto",
        /for \(const \w+ of this\.state\.architectures\)/,
        "der Zell-Stempel läuft den ganzen Bestand durch statt der Werke am Ort (`_blockerNahe`)"
    );
    // jedes `return null` außer dem EINEN in `nein` (der Absage mit Grund)
    for (const wer of ["spawnArchitecture", "spawnCreatureAt"])
        nicht(wer, /(?<!const nein = \(grund\) => \{[^}]*)return null;/, `die Wurzel \`${wer}\` sagt still ab (\`return null\` ohne Grund über \`opts.absage\`)`);
    nicht(null, /natur_weicht/, "das alte Protokoll `natur_weicht` lebt neben dem Ergebnis");
    return v;
}

// ── K: DER KERN (Node). ──
function kernUrteil(VC) {
    const v = [];
    if (!VC || typeof VC.fahrKraefte !== "function" || typeof VC.exportDrive !== "function")
        return ["vehicle-core ohne fahrKraefte/exportDrive"];
    const preset = VC.PRESETS && VC.PRESETS.gt;
    const d = VC.exportDrive(Object.assign({}, preset ? preset.s : {}, preset ? preset.fx : {}));
    const G = VC.fahrGesetz({
        zweispur: d.zweispur,
        lenkung: d.lenkung,
        vmax: d.vmax,
        kAcc: d.kAcc,
        spur: d.spur,
        cgH: d.cgH,
        radR: d.radR,
        spring: d.spring,
        huelle: d.huelle,
    });
    if (!G) return ["fahrGesetz verwirft den GT"];
    if (!G.wasser) return ["der Fahr-Satz des GT trägt kein Wasser-Maß (G.wasser)"];
    const lauf = (tiefe, v0, s, thr) => {
        const z = VC.fahrZustand(0, 0, 0);
        z.vlong = v0;
        z.speed = Math.abs(v0);
        const e = { throttle: thr, brake: 0, steer: 0, hand: false };
        if (tiefe !== undefined) e.tiefe = tiefe;
        const out = [];
        for (let i = 0; i < Math.round(s * 60); i++) {
            VC.fahrKraefte(z, e, G, 1 / 60);
            out.push(z.vlong, z.vlat, z.x, z.z, z.yaw, z.yawRate, z.aLong);
        }
        return { z, out };
    };
    // K1 ohne Tiefe byte-gleich (Labor = Welt an Land)
    const a = lauf(undefined, 12, 2, 1).out;
    const b0 = lauf(0, 12, 2, 1).out;
    let gleich = a.length === b0.length;
    for (let i = 0; gleich && i < a.length; i++) if (!Object.is(a[i], b0[i])) gleich = false;
    if (!gleich) v.push("K1 fahrKraefte mit Tiefe 0 weicht vom Lauf ohne Tiefe ab (Labor ≠ Welt an Land)");
    // K2 in 0,61 m aus 12 m/s
    const t = 0.61;
    const k2 = lauf(t, 12, 1, 1).z;
    if (!(k2.vlong <= 6)) v.push(`K2 in ${t} m Wasser aus 12 m/s nach 1 s noch ${k2.vlong.toFixed(2)} m/s (Soll ≤ 6)`);
    // K3 Gleichgewicht
    const k3 = lauf(t, 0, 12, 1).z;
    const soll = Math.sqrt((G.aEngine - VC.FAHR.rollDecel) / (G.wasser.kStirn * t + G.dragK));
    if (!(Math.abs(k3.vlong - soll) <= 0.05 * soll))
        v.push(
            `K3 Vollgas in ${t} m: ${k3.vlong.toFixed(2)} m/s, das Gleichgewicht des Gesetzes ${soll.toFixed(2)} m/s`
        );
    // K4 Ansaugung
    const k4 = lauf(G.wasser.ansaug + 0.05, 0, 3, 1).z;
    if (!(Math.hypot(k4.x, k4.z) <= 0.05))
        v.push(
            `K4 über der Ansaugung (${(G.wasser.ansaug + 0.05).toFixed(2)} m) fuhr er ${Math.hypot(k4.x, k4.z).toFixed(2)} m`
        );
    // K6 der Wasserschlag hält (Karte K02): über der Ansaugung am Hang (11°, der Bug tiefer) aus 4 m/s unter Vollgas — der
    // stehende Motor sperrt die Antriebsräder, die Ruhe hält ihn
    const z6 = VC.fahrZustand(0, 0, 0);
    z6.vlong = 4;
    z6.speed = 4;
    z6.steig = -0.2;
    const e6 = { throttle: 1, brake: 0, steer: 0, hand: false, tiefe: G.wasser.ansaug + 0.01 };
    for (let i = 0; i < 180; i++) VC.fahrKraefte(z6, e6, G, 1 / 60);
    if (!(Math.abs(z6.vlong) <= 0.5))
        v.push(
            `K6 über der Ansaugung am 11°-Hang rollt er unter Vollgas 3 s später mit ${z6.vlong.toFixed(2)} m/s weiter (Soll ≤ 0,5: der Wasserschlag sperrt die Räder)`
        );
    return v;
}

// ── DIE PROBE IN DER SEITE (r = die Welt). ──
async function probe(A) {
    const out = {};
    const soll = (n) => !A.nur || A.nur.includes(n); // `--nur`: Werkbank-Fragen (das Gate fährt alle)
    await window.__weltDa((w) => w.state.hydrosphere && w.state.hydrosphere.ready);
    const faden = st.voxelWorker;
    const f = r._ensureAssetFoundry();
    await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt);
    if (st.renderer) {
        st.renderer.render = function () {};
        if (typeof st.renderer.renderAsync === "function") st.renderer.renderAsync = () => Promise.resolve();
    }
    st.postProcessingFailed = true;
    const MUSTER = [16.7, 8.3, 25, 16.7, 33.3, 11.1, 20, 16.7];
    let tMs = performance.now();
    let nFrame = 0;
    const frame = () => {
        tMs += MUSTER[nFrame++ % MUSTER.length];
        r._gameLoopTick(tMs);
    };
    // der Takt des Warten auf einen Bau: 30 Bilder (`__gebautNach`)
    const takte30 = () => {
        for (let i = 0; i < 30; i++)
            try {
                frame();
            } catch {}
    };
    // DIE TAKTE DER PROBE (der EINE Helfer): `n` Bilder, vor jedem `je()`, jedes 20. gibt die Seite den Fäden frei
    const bilder = async (n, je) => {
        for (let i = 0; i < n; i++) {
            if (je) je();
            try {
                frame();
            } catch {}
            if (i % 20 === 0) await sleep(0);
        }
    };
    const neueWerke = (vor, art = /./) => st.architectures.filter((e) => e && !vor.has(e) && art.test(e.type)); // seit `vor`
    const stelle = (x, z) => st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z); // der Spieler steht am Ort
    const fehlerZeile = (e) => String(e?.stack || e).split("\n")[0]; // der Wurf einer Probe, seine erste Zeile
    const chatSeit = (t0, ab = 0) => // was der Chat seit dem Zeichen `t0` sagte, ab `ab`, gestaucht
        ((el) => (el ? el.innerText.slice(t0).replace(/\s+/g, " ").trim().slice(ab, ab + 300) : ""))(document.getElementById("chat-output"));
    // DER WAGEN AM ANLAUF: der Spieler ruht an (sx, sz), der GT steht dort längs der Fahrt (`fahrt`, Gier), alle Tasten los
    const gtAn = (sx, sz, fahrt) => {
        const h = r.getTerrainHeightAt(sx, sz);
        st.playerMesh.position.set(sx, h + 1.2, sz);
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
        const gt = r.spawnArchitecture(
            "fahrzeug_gt",
            { x: sx, y: h + 0.5, z: sz },
            { silent: true, precise: true, rotationY: fahrt - Math.PI / 2 }
        );
        if (!gt) throw new Error("kein GT");
        for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
        return gt;
    };
    // DAS AUFSITZEN (EIN Ruf je Probe): der Spieler steigt in den Wagen, `n` Bilder stellen den Ritt auf
    const aufsitzen = (gt, n = 12) => {
        const m = r.mountArchitecture(gt);
        if (!m || !m.ok) throw new Error("Aufsitzen scheiterte");
        for (let i = 0; i < n; i++) frame();
    };
    // Das Wasser über dem Boden an (x, z), wo es über ihm steht (sonst −Infinity): das gezeichnete (`_wasserBildAt`) und —
    // `gesetz` — das des Gesetzes, aus dem das Bild wird (`_atlasWaterLevelAt` über dem Boden: ein Fern-Chunk zeichnet einen
    // See erst später).
    const wasserUeber = (x, z, gesetz) => {
        const g = r._voxelSurfaceY(x, z);
        if (!Number.isFinite(g)) return -Infinity;
        let w = r._wasserBildAt(x, z);
        if (!Number.isFinite(w)) w = -Infinity;
        if (gesetz) w = Math.max(w, r._atlasWaterLevelAt(x, z, g));
        return w > g ? w : -Infinity;
    };
    const sichtbar = (x, z, gesetz) => {
        const w = wasserUeber(x, z, gesetz);
        return Number.isFinite(w) ? w - r._voxelSurfaceY(x, z) : -Infinity;
    };
    // Wie tief steht ein Fuß im Wasser: das Wasser am Punkt und im Ring (`ring` m), wo es über dem Boden steht, über dem Fuß.
    const stammTiefe = (x, z, fuss, ring, gesetz) => {
        let t = -Infinity;
        for (let k = 0; k <= 8; k++) {
            const px = k === 8 ? x : x + Math.cos(k * 0.785398) * ring;
            const pz = k === 8 ? z : z + Math.sin(k * 0.785398) * ring;
            const w = wasserUeber(px, pz, gesetz);
            if (Number.isFinite(w) && w - fuss > t) t = w - fuss;
        }
        return t;
    };
    // ── Z: der Setz-Punkt als Beobachtungs-Punkt ──
    // Ein Stamm misst VOR seinem Stempel; jedes andere Werk (kein Fahrzeug) hält am Setz-Punkt das Wasser über dem Boden im
    // Umkreis von `gitterR` m fest (1-m-Gitter, Bild UND Gesetz) und wird gemessen, wenn es steht (`werkeMessen`: seine Hülle).
    const zensus = {
        werke: 0,
        haeuser: 0,
        baeume: 0,
        imWasser: [],
        ohneHuelle: [],
        ohneWand: [],
        anDerWand: 0,
        quelle: "strom",
    };
    const werke = [];
    const R = A.gitterR;
    const gitter = (x0, z0) => {
        const n = 2 * R + 1;
        const t = new Float32Array(n * n);
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) t[i * n + j] = sichtbar(x0 - R + i, z0 - R + j, true);
        return { x0, z0, n, t };
    };
    const imGitter = (G, x, z) => {
        const i = Math.round(x - G.x0 + R);
        const j = Math.round(z - G.z0 + R);
        if (i < 0 || j < 0 || i >= G.n || j >= G.n) return sichtbar(x, z, true); // jenseits des Gitters: das Wasser von jetzt
        return G.t[i * G.n + j];
    };
    const spawnAlt = r.spawnArchitecture;
    const probeWerke = new Set();
    r.spawnArchitecture = function (type, position) {
        const natur = r._istNatur({ type });
        const werk = !natur && !/^fahrzeug_/.test(String(type));
        let fussT = null;
        let G = null;
        if (position && natur) {
            const g = r._voxelSurfaceY(position.x, position.z);
            if (Number.isFinite(g)) fussT = stammTiefe(position.x, position.z, g, 0.5, true);
        } else if (position && werk) G = gitter(position.x, position.z);
        const e = spawnAlt.apply(this, arguments);
        // was eine Probe selbst setzt (ein Satz, die Bau-Eiche, ein Wagen) — nie, was die Welt beim Strömen und in den
        // Spiel-Takten wachsen lässt; R räumt nur das
        if (e && (/^fahrzeug_/.test(String(type)) || !/^(strom|Spiel-Takt|Nexus-Dorf)$/.test(zensus.quelle)))
            probeWerke.add(e);
        if (e && (fussT !== null || G)) {
            zensus.werke++;
            if (natur) zensus.baeume++;
            else if (/^haus_/.test(type)) zensus.haeuser++;
            if (G) werke.push({ e, G, quelle: zensus.quelle });
            else if (fussT > A.tiefeStamm && zensus.imWasser.length < 40)
                zensus.imWasser.push({
                    typ: type,
                    id: e.id,
                    x: e.position.x,
                    z: e.position.z,
                    wo: "Fuß",
                    tiefe: fussT,
                    // der Täter beim Namen: der erste Rufer hinter der Natur-Wand (Wald-Schlange, Promotion, Satz …)
                    quelle: `${zensus.quelle} · ${
                        String(new Error().stack)
                            .split("\n")
                            .map((l) => (/at (?:\S+\.)?(\w+)/.exec(l.trim()) || [])[1])
                            .filter((f) => f && !/^(spawnArchitecture|_naturSetzen|Error)$/.test(f))[0] || "?"
                    }`,
                });
        }
        return e;
    };
    // Jedes festgehaltene Werk, wenn es steht: ein Haus wartet auf die Hülle seines Gesetzbuchs (`_hausHuelle`, die Solids
    // der Stufe 0), jedes andere misst seine Blocker. Gemessen wird jede Box, die den Boden trägt (Unterkante ≤ 0,6 m über
    // der Haus-Basis: das Podest, die Wände des Erdgeschosses, Treppe und Tritt — nie ein Balkon), auf einem Raster ≤ 1 m.
    // DAS WERK AN DER WAND (K66-2 N1): was hängt — das Rezept seiner Studio-Gestalt nennt den Ort „wand" (fachwerk PRESETS
    // fx.place.siteTag, die Wandlaterne) —, trägt keinen Boden: sein Fundament ist die Wand eines stehenden Hauses. Gemessen wird,
    // dass die Hülle eines Hauses (seine Boxen am Boden, wie das Fundament) höchstens `wandM` von der Achse des Werks liegt; das
    // Haus misst sein Fundament selbst. Ohne Haus hängt es an keiner Wand (ein Haus, das ins Wasser fiel, eine fremde Nummer).
    // Bis N1 suchte der Zensus an ihm die Box am Boden: „wandlaterne_dorf stand ohne Hülle".
    const FCw = globalThis.__fachwerkCore;
    const anDerWand = (e) => {
        const bp = st.blueprints && st.blueprints[e.type];
        const p =
            bp && typeof bp.studioGestalt === "string" && FCw?.PRESETS ? FCw.PRESETS[bp.studioGestalt] : null;
        return !!(p?.fx?.place && p.fx.place.siteTag === "wand");
    };
    const traegerHaus = (e) => {
        for (const h of st.architectures) {
            if (!/^haus_/.test(h.type) || !h._hausHuelle) continue;
            for (const b of h.blockerAABBs || []) {
                if (!b || !Number.isFinite(b.botY) || b.botY > h.position.y - 0.5 + 0.6) continue;
                const o = b.obb || {
                    cx: (b.minX + b.maxX) / 2,
                    cz: (b.minZ + b.maxZ) / 2,
                    c: 1,
                    s: 0,
                    hx: (b.maxX - b.minX) / 2,
                    hz: (b.maxZ - b.minZ) / 2,
                };
                const dx = e.position.x - o.cx;
                const dz = e.position.z - o.cz;
                const lx = Math.abs(dx * o.c - dz * o.s) - o.hx;
                const lz = Math.abs(dx * o.s + dz * o.c) - o.hz;
                if (Math.hypot(Math.max(0, lx), Math.max(0, lz)) <= A.wandM) return h;
            }
        }
        return null;
    };
    const werkeMessen = async () => {
        const fertig = (w) =>
            w.done ||
            !st.architectures.includes(w.e) ||
            (anDerWand(w.e)
                ? !!traegerHaus(w.e)
                : /^haus_/.test(w.e.type)
                  ? !!w.e._hausHuelle
                  : !!(w.e.blockerAABBs && w.e.blockerAABBs.length));
        // das EINE Warten auf den Bau (welt-boot `__gebautNach`): steht ein Werk nicht, nennt es der Zensus
        for (const w of werke)
            await window.__gebautNach(w.e, { fertig: () => fertig(w), takt: takte30 }).catch(() => null);
        for (const w of werke) {
            const e = w.e;
            if (w.done || !st.architectures.includes(e)) continue;
            w.done = true;
            if (anDerWand(e)) {
                zensus.anDerWand++;
                if (!traegerHaus(e))
                    zensus.ohneWand.push({ typ: e.type, id: e.id, x: e.position.x, z: e.position.z, quelle: w.quelle });
                continue;
            }
            const boxen = (e.blockerAABBs || []).filter(
                (b) => b && Number.isFinite(b.botY) && b.botY <= e.position.y - 0.5 + 0.6
            );
            if (!boxen.length || (/^haus_/.test(e.type) && !e._hausHuelle)) {
                zensus.ohneHuelle.push({ typ: e.type, id: e.id, quelle: w.quelle });
                continue;
            }
            let max = -Infinity;
            let nass = 0;
            let n = 0;
            for (const b of boxen) {
                const o = b.obb || {
                    cx: (b.minX + b.maxX) / 2,
                    cz: (b.minZ + b.maxZ) / 2,
                    c: 1,
                    s: 0,
                    hx: (b.maxX - b.minX) / 2,
                    hz: (b.maxZ - b.minZ) / 2,
                };
                const ni = Math.max(1, Math.ceil(2 * o.hx));
                const nj = Math.max(1, Math.ceil(2 * o.hz));
                for (let i = 0; i <= ni; i++)
                    for (let j = 0; j <= nj; j++) {
                        const lx = o.hx * ((2 * i) / ni - 1);
                        const lz = o.hz * ((2 * j) / nj - 1);
                        // lokal = (Δx·c − Δz·s, Δx·s + Δz·c) → Welt = (lx·c + lz·s, −lx·s + lz·c)
                        const t = imGitter(w.G, o.cx + lx * o.c + lz * o.s, o.cz - lx * o.s + lz * o.c);
                        n++;
                        if (t > A.tiefeFundament) nass++;
                        if (t > max) max = t;
                    }
            }
            if (max > A.tiefeFundament && zensus.imWasser.length < 40)
                zensus.imWasser.push({
                    typ: e.type,
                    id: e.id,
                    x: e.position.x,
                    z: e.position.z,
                    wo: "Fundament",
                    tiefe: max,
                    punkte: `${nass} von ${n} Punkten der Hülle`,
                    quelle: w.quelle,
                });
        }
        zensus.gemessen = werke.filter((w) => w.done).length;
    };
    // ── S: der Haus-Satz an Uferorten um ein Zentrum (die Häuser misst Z) ──
    const satz = { orte: 0, haeuser: 0, saetze: [], fern: [] };
    const wasserAbstand = (x, z) => {
        for (let rr = 0.5; rr <= 30; rr += 0.5)
            for (let k = 0; k < 48; k++) {
                const a = (k / 48) * Math.PI * 2;
                if (sichtbar(x + Math.cos(a) * rr, z + Math.sin(a) * rr, true) > A.tiefeFundament) return rr;
            }
        return Infinity;
    };
    const satzProbe = async (cx, cz) => {
        const LAND = (x, z) => r._landAt(x, z, 0.4) && !r._nassAt(x, z, 0.4);
        const orte = [];
        for (let k = 0; k < 24 && orte.length < A.satzJe; k++) {
            const a = (k / 24) * Math.PI * 2;
            for (let rr = 18; rr <= 40; rr += 4) {
                const px = cx + Math.cos(a) * rr;
                const pz = cz + Math.sin(a) * rr;
                if (LAND(px, pz) && LAND(px + 3, pz) && LAND(px - 3, pz) && LAND(px, pz + 3) && LAND(px, pz - 3)) {
                    orte.push([px, pz]);
                    k += 5;
                    break;
                }
            }
        }
        const o = document.getElementById("chat-output");
        for (const [PX, PZ] of orte) {
            await bilder(200, () => stelle(PX, PZ));
            stelle(PX, PZ);
            st.yaw = Math.PI / 2;
            const v0 = new Set(st.architectures);
            zensus.quelle = "Haus-Satz";
            const t0 = performance.now();
            r.processChatCommand("bau mir ein haus am wasser");
            const ms = performance.now() - t0; // der Satz samt Ort-Suche und Spawn, synchron
            const neu = neueWerke(v0, /^haus_/);
            await bilder(60);
            zensus.quelle = "strom";
            satz.orte++;
            satz.haeuser += neu.length;
            const zeile = o?.lastElementChild ? o.lastElementChild.textContent : null;
            const haeuser = neu.map((e) => {
                const ab = wasserAbstand(e.position.x, e.position.z);
                if (ab > A.satzAbstandMax)
                    satz.fern.push({ typ: e.type, id: e.id, x: e.position.x, z: e.position.z, abstand: ab });
                return { typ: e.type, id: e.id, x: +e.position.x.toFixed(1), z: +e.position.z.toFixed(1), abstand: ab };
            });
            satz.saetze.push({ spieler: [+PX.toFixed(1), +PZ.toFixed(1)], ms: +ms.toFixed(1), chat: zeile, haeuser });
        }
    };
    // Strömen an einen Ort (Sync-Bau, Worker ausgehängt — wie die Wasser-Linse)
    const stroemen = async (X, Z, nachlauf) => {
        // die Kacheln des Orts aus dem Faden (der Haupt-Faden rechnet sie nie): für die Bestellung hängt er ein
        const aus = st.voxelWorker;
        st.voxelWorker = faden;
        await window.__weltDa(() => !r._ensureHydroTilesAround(X, Z, 2048));
        st.voxelWorker = aus;
        stelle(X, Z);
        let last = -1;
        let still = 0;
        for (const weiter = window.__deckel("der Ring am Ort", 9000); weiter(); ) {
            stelle(X, Z);
            try {
                frame();
            } catch {}
            const n = st.voxelChunks ? st.voxelChunks.size : 0;
            still = n === last ? still + 1 : 0;
            last = n;
            if (n >= 9 && still > 30 && !r._weltOffen().chunks) break;
            await sleep(0);
        }
        await bilder(nachlauf);
    };
    try {
        const worker = st.voxelWorker;
        st.voxelWorker = null;
        // DIE WAHL DES UFERS: das erste Ufer der Kandidaten (`weltOrte`), an dem nach dem Strömen kein Bau mit
        // Grundriss binnen 25 m steht — im Grundriss eines Baus wächst nichts (die Natur-Wand); an der Mess-Wiese −278/−1038
        // trug das erste Ufer drei Glutbrunnen, der Hain setzte 3 von 6 Eichen. Alle besetzt: das letzte, die Probe nennt sie.
        const bautenAm = (x, z) =>
            st.architectures.filter(
                (a) =>
                    a?.position &&
                    !r._istNatur(a) &&
                    r._grundrissVon(a) &&
                    Math.hypot(a.position.x - x, a.position.z - z) <= 25
            ).length;
        const uferListe =
            A.uferKandidaten && A.uferKandidaten.length ? A.uferKandidaten : [{ ufer: A.ort, eiche: A.eiche }];
        let X = A.ort[0];
        let Z = A.ort[1];
        out.uferWahl = [];
        for (const c of uferListe) {
            X = c.ufer[0];
            Z = c.ufer[1];
            A.eiche = c.eiche;
            await stroemen(X, Z, 240);
            const n = bautenAm(X, Z);
            out.uferWahl.push({ ufer: [+X.toFixed(1), +Z.toFixed(1)], bauten: n });
            if (!n) break;
        }
        // ── H: der Schau-Ablauf ──
        if (soll("hain"))
            try {
                // die Linse nennt, wer am Ufer steht (`out.hain.bauten`): was am Ufer steht, weiß erst die gestreamte Welt (die
                // Glutbrunnen des Affinitäts-Felds wachsen mit dem Chunk) — an der Mess-Wiese −278/−1038 standen drei am ersten Ufer
                const hx = X,
                    hz = Z;
                st.yaw = Math.PI / 2;
                const caVor = st.waterCAActive ? st.waterCAActive.size : 0;
                zensus.quelle = "Bau-Eiche";
                const ex = A.eiche[0];
                const ez = A.eiche[1];
                const fE = r.spawnArchitecture("baum_eiche", { x: ex, y: r._voxelSurfaceY(ex, ez) + 0.5, z: ez }, {});
                zensus.quelle = "Hain-Satz";
                const v0 = st.architectures.length;
                r.processChatCommand("pflanz mir einen eichenhain am wasser");
                const neu = st.architectures.slice(v0).filter((a) => a && a.type === "baum_eiche");
                const caNach = st.waterCAActive ? st.waterCAActive.size : 0;
                zensus.quelle = "Spiel-Takt";
                await bilder(A.takte);
                out.hain = {
                    takte: A.takte,
                    caVor,
                    caNachBau: caNach,
                    caChunks: Math.max(caNach, st.waterCAActive ? st.waterCAActive.size : 0) - caVor,
                    staemme: (fE ? [fE] : []).concat(neu).map((a) => ({
                        typ: a.type,
                        id: a.id,
                        x: a.position.x,
                        z: a.position.z,
                        tiefe: stammTiefe(a.position.x, a.position.z, a.position.y - 0.5, 1.5, false),
                    })),
                };
                out.hain.satz = neu.length; // die Eichen des Satzes (die Bau-Eiche steht mit in der Flut-Probe)
                // der Satz des Ergebnisses (`_ergebnisSatz`): die Linse nennt den Grund jeder gefallenen Eiche beim Namen
                const co = document.getElementById("chat-output");
                out.hain.chat = co?.lastElementChild ? co.lastElementChild.textContent : null;
                // und die Bauten mit Grundriss am Ufer (≤ 25 m): wer die Würfe trug
                out.hain.bauten = st.architectures
                    .filter(
                        (a) =>
                            a?.position &&
                            !r._istNatur(a) &&
                            r._grundrissVon(a) &&
                            Math.hypot(a.position.x - hx, a.position.z - hz) <= 25
                    )
                    .map((a) => `${a.type} #${a.id} (${a.position.x.toFixed(1)}/${a.position.z.toFixed(1)})`);
            } catch (e) {
                out.hain = { fehler: fehlerZeile(e) };
            }
        let ansaugGT = null;
        // ── A: die Ansaugung (Karte K02, FZ-01): der GT fährt mit Vollgas vom Ufer ins tiefe Wasser ──
        if (soll("ansaug"))
            try {
                const hh = (a, b) => r.getTerrainHeightAt(a, b);
                // die Rampe (A.rampe: Ort am Wasserrand und Fahrt-Richtung, dieselbe in jedem Lauf): 26 m trockener Anlauf
                // (Stufen ≤ 0,35 m), dann Wasser ohne Insel, das flach (je m höchstens A.rampeStufe tiefer — eine Furt, ein
                // Strand, kein Steilufer) bis A.ansaugTief steigt
                if (!A.rampe)
                    throw new Error("keine Rampe in tiefes Wasser am Ufer von See und Fluss (Orte aus der Welt)");
                const [qx, qz] = A.rampe;
                // die Rampe liegt, wo die Welt sie trägt (am See): dorthin strömen, das Bild zeichnet ihr Wasser
                await stroemen(qx, qz, 120);
                // DIE RAMPE IM GEZEICHNETEN WASSER: die Suche der Orte las das Gesetz ohne Chunk; das Bild setzt seine Kante
                // auf dem 1,8-m-Gitter (an der Chunk-Kante endet die Rand-Flut). Um den Ort des Gesetzes (Ringe bis 60 m)
                // dieselbe Prüfung am Bild: Kante 0–0,3 m, 26 m trocken und eben davor, flach bis A.ansaugTief dahinter.
                const rampeImBild = (bx, bz, vx, vz) => {
                    const b0 = sichtbar(bx, bz);
                    if (!(b0 > 0 && b0 <= 0.3)) return false;
                    let hv = null;
                    for (let s = 2; s <= 28; s++) {
                        const h = hh(bx - vx * s, bz - vz * s);
                        if (
                            !Number.isFinite(h) ||
                            sichtbar(bx - vx * s, bz - vz * s) > -Infinity ||
                            (hv !== null && Math.abs(h - hv) > 0.35)
                        )
                            return false;
                        hv = h;
                    }
                    let bv = b0;
                    for (let s = 1; s <= 40; s++) {
                        const t = sichtbar(bx + vx * s, bz + vz * s);
                        if (!(t > 0) || t - bv > A.rampeStufe) return false;
                        if (t >= A.ansaugTief) return true;
                        bv = t;
                    }
                    return false;
                };
                let bildRampe = null;
                for (let d = 0; d <= 60 && !bildRampe; d += 2)
                    for (let k = 0; k < 64 && !bildRampe; k++) {
                        const bx = Math.round(qx + Math.cos((k * Math.PI) / 32) * d);
                        const bz = Math.round(qz + Math.sin((k * Math.PI) / 32) * d);
                        const b0 = sichtbar(bx, bz);
                        if (!(b0 > 0 && b0 <= 0.3)) continue;
                        for (let j = 0; j < 16 && !bildRampe; j++) {
                            const vx = Math.cos((j * Math.PI) / 8);
                            const vz = Math.sin((j * Math.PI) / 8);
                            if (rampeImBild(bx, bz, vx, vz)) bildRampe = [bx, bz, vx, vz];
                        }
                    }
                if (!bildRampe)
                    throw new Error(`keine Rampe im gezeichneten Wasser in 60 m um den Ort des Gesetzes ${qx}/${qz}`);
                const [px, pz, ux, uz] = bildRampe;
                const t0 = sichtbar(px, pz);
                if (!(t0 > 0 && t0 <= 0.3)) throw new Error(`die Rampe beginnt nicht am Wasserrand (${t0} m Wasser)`);
                let vor = null;
                for (let s = 2; s <= 28; s++) {
                    const h = hh(px - ux * s, pz - uz * s);
                    if (
                        !Number.isFinite(h) ||
                        sichtbar(px - ux * s, pz - uz * s) > -Infinity ||
                        (vor !== null && Math.abs(h - vor) > 0.35)
                    )
                        throw new Error(`der Anlauf der Rampe ist ${s} m vor dem Wasser nicht trocken und eben`);
                    vor = h;
                }
                let tief = null;
                let tVor = t0;
                for (let s = 1; s <= 40 && tief === null; s++) {
                    const t = sichtbar(px + ux * s, pz + uz * s);
                    if (!(t > 0) || t - tVor > A.rampeStufe)
                        throw new Error(`die Rampe fällt ${s} m im Wasser nicht flach ab (${tVor} → ${t} m)`);
                    if (t >= A.ansaugTief) tief = s;
                    tVor = t;
                }
                if (tief === null) throw new Error(`die Rampe erreicht in 40 m nicht ${A.ansaugTief} m Wasser`);
                const rampe = { x: px, z: pz, ux, uz, tief, steigung: +((A.ansaugTief - t0) / tief).toFixed(3) };
                const sx = rampe.x - rampe.ux * 26;
                const sz = rampe.z - rampe.uz * 26;
                const bahnFrei = () => {
                    for (const e of st.architectures.slice()) {
                        if (!e || !e.blockerAABBs || !e.position || /^fahrzeug_/.test(e.type || "")) continue;
                        const dx = e.position.x - sx;
                        const dz = e.position.z - sz;
                        const l = dx * rampe.ux + dz * rampe.uz;
                        if (l > -6 && l < 72 && Math.abs(dx * rampe.uz - dz * rampe.ux) < 4) r.removeArchitecture(e);
                    }
                    for (const c of st.creatures || []) {
                        const dx = c.position.x - sx;
                        const dz = c.position.z - sz;
                        const l = dx * rampe.ux + dz * rampe.uz;
                        if (l > -6 && l < 72 && Math.abs(dx * rampe.uz - dz * rampe.ux) < 5 && c.position.y > -400)
                            c.position.y -= 500;
                    }
                };
                bahnFrei();
                const fahrt = Math.atan2(rampe.ux, rampe.uz);
                const gt = gtAn(sx, sz, fahrt);
                // Aussteigen an Land (der Anlauf ist trocken): wo steht der Spieler, gemessen am Boden unter ihm?
                aufsitzen(gt);
                r.dismountArchitecture();
                for (let i = 0; i < 60; i++) frame();
                const pL = st.playerMesh.position;
                const land = {
                    fussUeberBoden: +(pL.y - 0.5 - hh(pL.x, pL.z)).toFixed(2),
                    abstand: +Math.hypot(pL.x - gt.position.x, pL.z - gt.position.z).toFixed(2),
                };
                st.playerMesh.position.set(gt.position.x, hh(gt.position.x, gt.position.z) + 1.2, gt.position.z);
                aufsitzen(gt);
                const W = gt._fahrSatz && gt._fahrSatz.wasser;
                if (!W) throw new Error("der Fahr-Satz des GT trägt kein Wasser-Maß");
                const caVor = st.waterCAActive ? st.waterCAActive.size : 0;
                st.keys.w = true;
                const spur = [];
                let kamUnter = 0;
                let tA = null;
                let maxTiefe = 0;
                for (let i = 0; i < 1500; i++) {
                    frame();
                    const fz = gt._fahr;
                    if (!fz) continue;
                    const t = r._fahrTiefe(fz);
                    const v = Math.hypot(fz.vlong, fz.vlat);
                    spur.push({ t: tMs, v, tiefe: t });
                    maxTiefe = Math.max(maxTiefe, t);
                    if (tA === null && t >= W.ansaug) tA = { zeit: tMs, v, tiefe: t };
                    const cam = st.camera && st.camera.position;
                    if (cam) {
                        const b = r._wasserBildAt(cam.x, cam.z);
                        if (Number.isFinite(b) && cam.y < b) kamUnter++;
                    }
                    if (tA && tMs - tA.zeit > 4000) break;
                    if (i % 30 === 0) await sleep(0);
                }
                st.keys.w = false;
                const nachA = tA ? spur.filter((p) => p.t > tA.zeit) : [];
                const drei = tA ? nachA.find((p) => p.t >= tA.zeit + 3000) : null;
                const ansaug = {
                    rampe,
                    ansaug: W.ansaug,
                    dach: W.dach,
                    vA: tA ? tA.v : NaN,
                    v3: drei ? drei.v : NaN,
                    vMaxNach: nachA.reduce((m, p) => Math.max(m, p.v), 0),
                    maxTiefe,
                    kameraUnter: kamUnter,
                    erreicht: !!tA,
                    land,
                    // der Wasser-Automat vor und nach der Fahrt (Chunks, die er rechnet)
                    caVor,
                    caNach: st.waterCAActive ? st.waterCAActive.size : 0,
                    verlauf: spur
                        .filter((p) => !tA || p.t >= tA.zeit - 1500)
                        .filter((_, i) => i % 15 === 0)
                        .map((p) => [
                            +((p.t - (tA ? tA.zeit : spur[0].t)) / 1000).toFixed(2),
                            +p.v.toFixed(2),
                            +p.tiefe.toFixed(2),
                        ]),
                };
                if (st.player.mountedArch !== null && st.player.mountedArch !== undefined) r.dismountArchitecture();
                // der geparkte Wagen im Wasser ist kein Damm: die Chunks um ihn entstehen neu (wie beim Wieder-Strömen), der
                // Zell-Stempel läuft — verdrängt er Wasser, weckt er den Automaten?
                const invA = { n: 0 };
                const invAltA = r._invalidateWaterCapsAround;
                r._invalidateWaterCapsAround = function () {
                    invA.n++;
                    invA.wer = new Error().stack.split("\n")[2].trim().split(" ")[1]; // der Rufer beim Namen
                    return invAltA.apply(this, arguments);
                };
                try {
                    const span = r._voxelChunkConfig(0).span;
                    const wcx = Math.floor(gt.position.x / span);
                    const wcz = Math.floor(gt.position.z / span);
                    if (!st.dirtyVoxelChunks) st.dirtyVoxelChunks = new Set();
                    for (let dz = -1; dz <= 1; dz++)
                        for (let dx = -1; dx <= 1; dx++) {
                            const key = wcx + dx + "," + (wcz + dz);
                            if (st.voxelChunks.has(key)) st.dirtyVoxelChunks.add(key);
                        }
                    for (let i = 0; i < 240; i++) {
                        frame();
                        if (i % 30 === 0) await sleep(0);
                    }
                } finally {
                    r._invalidateWaterCapsAround = invAltA;
                }
                ansaug.damm = {
                    wer: invA.wer || null,
                    invalidierungen: invA.n,
                    nass: !!gt._stempelNass,
                    caChunks: st.waterCAActive ? st.waterCAActive.size : 0,
                    tiefe: r._fahrTiefe(gt._fahr),
                };
                ansaugGT = gt;
                out.ansaug = ansaug;
            } catch (e) {
                out.ansaug = { fehler: String(e?.message || e) };
            }
        // ── Z: das Dorf am Fluss ──
        if (soll("zensus"))
            try {
                zensus.quelle = "Dorf";
                await r.spawnSettlement({ seed: 7, nH: 18, position: { x: X, y: r._voxelSurfaceY(X, Z), z: Z } });
                zensus.quelle = "strom";
            } catch (e) {
                zensus.fehler = "Dorf: " + String(e?.message || e);
            }
        // ── S: der Haus-Satz am Schau-Ort und an der Furt (dieselbe gestreamte Welt), gemessen, solange sie steht ──
        if (soll("satz"))
            try {
                for (const [cx, cz] of A.satzNah) await satzProbe(cx, cz);
            } catch (e) {
                satz.fehler = fehlerZeile(e);
            }
        if (soll("zensus") || soll("satz")) await werkeMessen();
        // ── F: der Wagen in der Furt ──
        if (soll("wagen"))
            try {
                // zurück an den Fluss (die Rampe lag am See)
                await stroemen(X, Z, 240);
                const hh = (a, b) => r.getTerrainHeightAt(a, b);
                let furt = A.furt
                    ? { x: A.furt[0], z: A.furt[1], ux: A.furt[2], uz: A.furt[3], tiefe: NaN, hub: NaN }
                    : null;
                for (let gz = -A.suchR; gz <= A.suchR && !furt; gz += 3)
                    for (let gx = -A.suchR; gx <= A.suchR; gx += 3) {
                        const px = X + gx;
                        const pz = Z + gz;
                        const t = sichtbar(px, pz);
                        if (!(t >= 0.5 && t <= 0.75)) continue;
                        for (let k = 0; k < 16; k++) {
                            const ux = Math.cos((k * Math.PI) / 8);
                            const uz = Math.sin((k * Math.PI) / 8);
                            let ok = true;
                            let lo = Infinity;
                            let hi = -Infinity;
                            let vor = null;
                            for (let s = 3; s <= 28 && ok; s++) {
                                const qx = px - ux * s;
                                const qz = pz - uz * s;
                                const h = hh(qx, qz);
                                if (!Number.isFinite(h) || sichtbar(qx, qz) > -Infinity) ok = false;
                                else {
                                    lo = Math.min(lo, h);
                                    hi = Math.max(hi, h);
                                    if (vor !== null && Math.abs(h - vor) > 0.35) ok = false;
                                    vor = h;
                                }
                            }
                            if (!ok || hi - lo > 3) continue;
                            let tief = true;
                            for (let s = 0; s <= 6 && tief; s += 1.5)
                                if (!(sichtbar(px + ux * s, pz + uz * s) >= 0.35)) tief = false;
                            if (!tief) continue;
                            furt = { x: px, z: pz, ux, uz, tiefe: t, hub: hi - lo };
                            break;
                        }
                    }
                if (!furt)
                    throw new Error(`keine Furt (0,5–0,75 m, 26 m trockener Anlauf) im Umkreis von ${A.suchR} m`);
                const sx = furt.x - furt.ux * 26;
                const sz = furt.z - furt.uz * 26;
                // die Bahn frei (gemessen wird das Wasser, nie der Wald)
                const raeumen = () => {
                    for (const e of st.architectures.slice()) {
                        if (!e || !e.blockerAABBs || !e.position || /^fahrzeug_/.test(e.type || "")) continue;
                        const dx = e.position.x - sx;
                        const dz = e.position.z - sz;
                        const l = dx * furt.ux + dz * furt.uz;
                        if (l > -6 && l < 40 && Math.abs(dx * furt.uz - dz * furt.ux) < 4) r.removeArchitecture(e);
                    }
                };
                raeumen();
                for (const c of st.creatures || []) {
                    const dx = c.position.x - sx;
                    const dz = c.position.z - sz;
                    const l = dx * furt.ux + dz * furt.uz;
                    if (l > -6 && l < 40 && Math.abs(dx * furt.uz - dz * furt.ux) < 5) c.position.y -= 500;
                }
                const fahrt = Math.atan2(furt.ux, furt.uz); // Fahrt-Richtung (sin, cos)
                const gt = gtAn(sx, sz, fahrt);
                aufsitzen(gt);
                st.keys.w = true;
                const spur = [];
                let kamUnter = 0;
                let kamTiefe = 0;
                let tEin = null;
                for (let i = 0; i < 900; i++) {
                    frame();
                    raeumen();
                    const fz = gt._fahr;
                    if (!fz) continue;
                    const t = sichtbar(fz.x, fz.z);
                    const zeit = tMs;
                    spur.push({ t: zeit, v: Math.hypot(fz.vlong, fz.vlat), tiefe: t });
                    if (tEin === null && t >= 0.3) tEin = { zeit, v: Math.hypot(fz.vlong, fz.vlat), tiefe: t };
                    const cam = st.camera && st.camera.position;
                    if (cam) {
                        const b = r._wasserBildAt(cam.x, cam.z);
                        if (Number.isFinite(b) && cam.y < b) {
                            kamUnter++;
                            kamTiefe = Math.max(kamTiefe, b - cam.y);
                        }
                    }
                    if (tEin && zeit - tEin.zeit > 2500) break;
                    if (i % 30 === 0) await sleep(0);
                }
                st.keys.w = false;
                r.dismountArchitecture();
                if (!tEin)
                    throw new Error(
                        `der Wagen erreichte das Wasser nicht (Furt ${furt.x.toFixed(1)}/${furt.z.toFixed(1)})`
                    );
                const nach = spur.find((p) => p.t >= tEin.zeit + 1000);
                out.wagen = {
                    furt,
                    vEin: tEin.v,
                    tiefe: tEin.tiefe,
                    v1: nach ? nach.v : NaN,
                    v2: spur.length ? spur[spur.length - 1].v : NaN,
                    kameraUnter: kamUnter,
                    kameraTiefe: kamTiefe,
                    // [s nach dem Eintauchen, m/s, m Wasser unter der Wagen-Mitte] je ~0,25 s
                    verlauf: spur
                        .filter((p) => p.t >= tEin.zeit - 500)
                        .filter((_, i) => i % 15 === 0)
                        .map((p) => [
                            +((p.t - tEin.zeit) / 1000).toFixed(2),
                            +p.v.toFixed(2),
                            +(p.tiefe > 0 ? p.tiefe : 0).toFixed(2),
                        ]),
                };
            } catch (e) {
                out.wagen = { fehler: String(e?.message || e) };
            }
        // ── S: der Haus-Satz am See (−906/−634, eine eigene gestreamte Welt) ──
        if (soll("satz"))
            try {
                for (const [cx, cz] of A.satzFern) {
                    await stroemen(cx, cz, 120);
                    await satzProbe(cx, cz);
                }
                await werkeMessen();
            } catch (e) {
                satz.fehler = fehlerZeile(e);
            }
        // ── C: der Satz nennt das Ergebnis (am See, eine Uferkante je Richtung, der Blick auf den See) ──
        if (soll("satz"))
            try {
                const [cx, cz] = A.satzFern[0];
                const el = document.getElementById("chat-output");
                const C = { versuche: [] };
                const LAND = (x, z) => r._landAt(x, z, 0.4) && !r._nassAt(x, z, 0.4);
                for (let k = 0; k < 16 && C.versuche.filter((v) => v.gesetzt > 0 && v.gesetzt < 6).length < 2; k++) {
                    const a = (k / 16) * Math.PI * 2;
                    let ufer = null;
                    for (let rr = 4; rr <= 80 && !ufer; rr += 1) {
                        const px = cx + Math.cos(a) * rr;
                        const pz = cz + Math.sin(a) * rr;
                        if (LAND(px, pz)) ufer = [px + Math.cos(a) * 2, pz + Math.sin(a) * 2];
                    }
                    if (!ufer) continue;
                    const [PX, PZ] = ufer;
                    // der Blick auf den See: die Gier, deren Vorwärts-Richtung (`_blickVorn`) zum See zeigt
                    let yaw = 0;
                    let bestD = -2;
                    for (let q = 0; q < 64; q++) {
                        const y = (q / 64) * Math.PI * 2;
                        const v = r._blickVorn(y, 0);
                        const d = -(v.x * Math.cos(a) + v.z * Math.sin(a));
                        if (d > bestD) ((bestD = d), (yaw = y));
                    }
                    for (let i = 0; i < 60; i++) {
                        stelle(PX, PZ);
                        frame();
                        if (i % 20 === 0) await sleep(0);
                    }
                    stelle(PX, PZ);
                    st.yaw = yaw;
                    const v0 = new Set(st.architectures);
                    const t0 = el ? el.innerText.length : 0;
                    zensus.quelle = "Birken-Satz";
                    r.processChatCommand("pflanz mir sechs birken");
                    zensus.quelle = "strom";
                    const neu = neueWerke(v0, /birke/);
                    const chat = chatSeit(t0);
                    C.versuche.push({ ufer: [+PX.toFixed(1), +PZ.toFixed(1)], gewollt: 6, gesetzt: neu.length, chat });
                    for (const e of neu) r.removeArchitecture(e);
                }
                out.ergebnis = C;
            } catch (e) {
                out.ergebnis = { fehler: fehlerZeile(e) };
            }
        // ── A (Teil 2): Aussteigen in tiefem Wasser — der GT der Rampe steht im See (−906/−634), wo der Wagen und jeder
        //    Ausstieg (Ringe 1,5 und 3 m) mindestens A.aussteigTief Wasser tragen (die Tiefe, die der Körper liest: das
        //    Wasser über dem Boden des Felds); der Spieler steigt aus — schwimmt er? ──
        if (soll("ansaug") && out.ansaug && !out.ansaug.fehler)
            try {
                const [cx, cz] = A.satzFern[0];
                if (!soll("satz")) await stroemen(cx, cz, 120);
                const gt = ansaugGT;
                if (!gt || !gt._fahr) throw new Error("der GT der Rampe fehlt");
                let ax = null;
                let maxT = -Infinity;
                // der Wagen in A.aussteigTief + 0,15 … + 0,5 m Wasser, jeder Ausstieg (Ring 1,6 m) in mindestens A.aussteigTief
                for (let d = 2; d <= A.suchR && !ax; d += 2)
                    for (let k = 0; k < 48 && !ax; k++) {
                        const px = cx + Math.cos((k * Math.PI) / 24) * d;
                        const pz = cz + Math.sin((k * Math.PI) / 24) * d;
                        const t = sichtbar(px, pz);
                        if (t > maxT) maxT = t;
                        if (!(t >= A.aussteigTief + 0.15 && t <= A.aussteigTief + 0.5)) continue;
                        let ok = true;
                        for (let j = 0; j < 16 && ok; j++) {
                            const a = (j * Math.PI) / 8;
                            if (!(sichtbar(px + Math.cos(a) * 1.6, pz + Math.sin(a) * 1.6) >= A.aussteigTief))
                                ok = false;
                        }
                        if (ok) ax = { x: px, z: pz, tiefe: t };
                    }
                if (!ax)
                    throw new Error(
                        `kein Ort mit ${A.aussteigTief} m Wasser um den Wagen im See (am tiefsten ${maxT.toFixed(2)} m)`
                    );
                st.playerMesh.position.set(gt.position.x, gt.position.y + 1.2, gt.position.z);
                aufsitzen(gt, 3); // der Ritt stellt den Fahr-Zustand auf
                // der Reiter führt horizontal (`_rittSchritt`: die Architektur folgt ihm), der Fahr-Zustand mit
                const fz = gt._fahr;
                if (!fz) throw new Error("der GT trägt nach dem Aufsitzen keinen Fahr-Zustand");
                fz.x = ax.x;
                fz.z = ax.z;
                fz.vlong = 0;
                fz.vlat = 0;
                st.playerMesh.position.x = ax.x;
                st.playerMesh.position.z = ax.z;
                gt.position.x = ax.x;
                gt.position.z = ax.z;
                for (let i = 0; i < 90; i++) frame(); // er sinkt auf den Grund
                const tW = r._fahrTiefe(gt._fahr);
                r.dismountArchitecture();
                const p0 = st.playerMesh.position;
                const tAus = sichtbar(p0.x, p0.z); // das Wasser am Ausstieg
                const abAus = Math.hypot(p0.x - gt.position.x, p0.z - gt.position.z);
                let schwimm = 0;
                for (let i = 0; i < 180; i++) {
                    frame();
                    if (st.playerUnderwater) schwimm++;
                    if (i % 30 === 0) await sleep(0);
                }
                const p = st.playerMesh.position;
                const g = r._voxelSurfaceY(p.x, p.z);
                out.ansaug.aussteigen = {
                    x: ax.x,
                    z: ax.z,
                    tiefe: ax.tiefe,
                    tiefeWagen: tW,
                    tiefeAusstieg: tAus,
                    abstand: +abAus.toFixed(2),
                    schwimmFrames: schwimm,
                    frames: 180,
                    ueberSpiegel: +(p.y - r._koerperWasser(p.x, p.z, g)).toFixed(2),
                };
            } catch (e) {
                out.ansaug.aussteigen = { fehler: String(e?.message || e) };
            }
        // ── E: DAS ERGEBNIS JEDES SETZ-OPS — je Op ein erzwungener Fehl-Grund (die Obergrenze der
        //    Kreaturen, das kalte Buch, ein unbekannter Bauplan, der See), gesprochen wie der Spieler; der Chat sagt die
        //    tatsächliche Zahl mit dem Grund, nie den Wunsch. Das Dorf folgt: „wird gebaut", dann sein Ergebnis. ──
        if (soll("satz"))
            try {
                const [cx, cz] = A.satzFern[0];
                const el = document.getElementById("chat-output");
                const E = { faelle: [] };
                const sprich = (satz) => {
                    const t0 = el ? el.innerText.length : 0;
                    r.processChatCommand(satz);
                    return chatSeit(t0);
                };
                const fall = (name, satz, gewollt, wunsch, grund, setzen) => {
                    const vorA = new Set(st.architectures);
                    const vorK = st.creatures.length;
                    const chat = sprich(satz);
                    const neuA = neueWerke(vorA);
                    const gesetzt = setzen === "kreatur" ? st.creatures.length - vorK : neuA.length;
                    E.faelle.push({ name, satz, gewollt, gesetzt, wunsch, grund, chat });
                    for (const e of neuA) r.removeArchitecture(e);
                };
                // die Gründe aus der EINEN Tafel des Stamms (fehlt sie, nennt der Satz keinen — das Urteil sagt es)
                const T = r.constructor.SETZ_GRUND || {};
                const G = new Proxy(T, { get: (t, k) => t[k] || `(kein Grund „${String(k)}" in SETZ_GRUND)` });
                stelle(cx + 40, cz + 40);
                // E1 die Obergrenze der Kreaturen: noch 3 Plätze, dann keiner
                const maxAlt = st.maxCreatures;
                try {
                    st.maxCreatures = st.creatures.length + 3;
                    fall(
                        "Kreaturen an der Obergrenze (3 frei)",
                        "spawne kreaturen 10",
                        10,
                        "10 Kreaturen gespawnt",
                        G.obergrenze,
                        "kreatur"
                    );
                    st.maxCreatures = st.creatures.length;
                    fall(
                        "Kreaturen an der Obergrenze (0 frei)",
                        "spawne kreaturen 10",
                        10,
                        "10 Kreaturen gespawnt",
                        G.obergrenze,
                        "kreatur"
                    );
                } finally {
                    st.maxCreatures = maxAlt;
                }
                // E2 das kalte Buch: der Tempel und das Fraktal ohne ihren Bauplan
                const bpT = st.blueprints.haus_griechisch;
                try {
                    delete st.blueprints.haus_griechisch;
                    fall("Tempel bei kaltem Buch", "baue tempel hier", 1, "tempel vor dir gebaut", G.buch);
                    fall("Fraktal bei kaltem Buch", "baue fraktal tempel", 43, "Fraktal-tempel gebaut", G.buch);
                } finally {
                    st.blueprints.haus_griechisch = bpT;
                }
                // E3 ein unbekannter Bauplan: der Damm und der Wasserfall ohne ihren Bauplan
                for (const [wort, key] of [
                    ["damm", "damm"],
                    ["wasserfall", "waterfall"],
                ]) {
                    const bp = st.blueprints[key];
                    try {
                        delete st.blueprints[key];
                        fall(`${wort} ohne Bauplan`, `baue ${wort} hier`, 1, `${wort} vor dir gebaut`, G.unbekannt);
                    } finally {
                        st.blueprints[key] = bp;
                    }
                }
                // E4 der See: der Tempel mitten im See (die Wand der Werke), das Dorf im See (es folgt)
                stelle(cx, cz);
                takte30();
                stelle(cx, cz);
                // der Blick auf DIESEN See (`_blickVorn`: vorn = (sin, cos) der Gier), nie auf ein anderes Ufer
                st.yaw = Math.atan2(A.rand.see[0] - cx, A.rand.see[1] - cz);
                fall("Tempel im See", "baue tempel hier", 1, "tempel vor dir gebaut", G.wasser);
                {
                    const vorA = new Set(st.architectures);
                    const t0 = el ? el.innerText.length : 0;
                    r.processChatCommand("baue dorf hier");
                    const sofort = chatSeit(t0);
                    const sofortGesetzt = neueWerke(vorA, /^haus_/).length;
                    // das Dorf meldet sich, wenn es steht (der Plan kommt aus dem Studio-Worker)
                    let echo = "";
                    for (const weiter = window.__deckel("die Meldung des Dorfs", A.dorfMs / 50); weiter(); ) {
                        for (let i = 0; i < 10; i++)
                            try {
                                frame();
                            } catch {}
                        await sleep(50);
                        echo = chatSeit(t0, sofort.length);
                        if (/Häuser|Haus\.|kein Haus|kein Dorf|Kein Dorf/.test(echo)) break;
                    }
                    const haeuser = neueWerke(vorA, /^haus_/);
                    E.dorf = { sofort, sofortGesetzt, echo, haeuser: haeuser.length };
                    for (const e of neueWerke(vorA)) r.removeArchitecture(e);
                }
                out.setzen = E;
            } catch (e) {
                out.setzen = { fehler: fehlerZeile(e) };
            }
        // ── R: das Dorf des Nexus am Seerand — ein Bau, dessen Stempel kein Wasser der Zellen verdrängt, weckt den Automaten
        //    nicht, das Wasser bleibt, wie es war. Der Wunsch-Anker stellt das Rand-Haus ans Ufer, der Spieler steht am Rand
        //    des Plans, die Ort-Wahl stellt das Dorf, wohin das Gesetz es trägt, die Häuser bekommen ihre Hülle, die
        //    Chunks am Rand entstehen neu (wie beim Wieder-Strömen), dann laufen die Takte. ──
        if (soll("rand"))
            try {
                if (!A.rand.ufer || !A.rand.see) throw new Error("kein See mit Ufer in der Welt (Orte aus der Welt)");
                const SG = r.constructor._siedlungGesetz();
                const nH = SG.nHMin + ((A.rand.seed >>> 24) % SG.nHSpan);
                const plan = await r._foundryRequestSettlement({ seed: A.rand.seed, nH });
                let mx = 0;
                let mz = 0;
                const slots = plan?.slots || [];
                // der Anker so, dass das Haus des Plans, das am weitesten zum See weist, am Seeufer steht (das Rand-Haus)
                const [ex0, ez0] = A.rand.ufer;
                const ul = Math.hypot(A.rand.see[0] - ex0, A.rand.see[1] - ez0) || 1;
                const ux0 = (A.rand.see[0] - ex0) / ul;
                const uz0 = (A.rand.see[1] - ez0) / ul;
                let sRand = null;
                for (const sl of slots)
                    if (!sRand || sl.x * ux0 + sl.z * uz0 > sRand.x * ux0 + sRand.z * uz0) sRand = sl;
                // das Rand-Haus steht mit seinem GANZEN Grundriss auf dem Trockenen (die Wasser-Wand jedes Hauses,
                // `_fundamentLand`): seine Mitte liegt um seine Reichweite + 1 m landein vom Ufer-Punkt — sein Rand am See
                const oR = sRand && sRand.obb;
                const reichR = oR && Number.isFinite(oR.ex) && Number.isFinite(oR.ez) ? Math.hypot(oR.ex, oR.ez) : 6;
                const hx = ex0 - ux0 * (reichR + 1);
                const hz = ez0 - uz0 * (reichR + 1);
                const X = hx - (sRand ? sRand.x : 0);
                const Z = hz - (sRand ? sRand.z : 0);
                for (const sl of slots) ((mx += sl.x / slots.length), (mz += sl.z / slots.length));
                let planR = 0;
                for (const sl of slots) {
                    const o = sl.obb;
                    const reich = o && Number.isFinite(o.ex) && Number.isFinite(o.ez) ? Math.hypot(o.ex, o.ez) : 6;
                    planR = Math.max(planR, Math.hypot(sl.x - mx, sl.z - mz) + reich);
                }
                // die Reste früherer Proben im Plan-Kreis fallen vor dem Dorf (der Haus-Satz am Seeufer ließ seine Häuser
                // stehen — eins 8,6 m neben dem Rand-Haus, das Blocker-Netz nahm ihm den Platz: 13 Häuser, keins am Rand);
                // R misst die Welt, wie der Spieler sie vorfindet, und nennt jeden geräumten Rest beim Namen
                const reste = [];
                for (const e of st.architectures.slice())
                    if (
                        e &&
                        probeWerke.has(e) &&
                        e.position &&
                        Math.hypot(e.position.x - (X + mx), e.position.z - (Z + mz)) < planR + 12
                    ) {
                        reste.push(`${e.type} #${e.id}`);
                        r.removeArchitecture(e);
                    }
                const a = (A.rand.winkel * Math.PI) / 180;
                const dSp = planR + r.constructor.STRUCTURE_PLAYER_CLEAR_MARGIN + 1.5;
                const PX = X + mx + Math.cos(a) * dSp;
                const PZ = Z + mz + Math.sin(a) * dSp;
                await stroemen(PX, PZ, 120);
                const RR = A.rand.R;
                // gezählt wird nur über den Chunks, die VOR dem Dorf geladen standen: der Ring wächst während der Takte
                // weiter (die Mess-Fläche reicht 60 m um das Rand-Haus, über den Ring hinaus) — ein neu geladener Chunk
                // zeichnet sein Wasser erstmals, das ist kein Werk des Dorfs (ein Lauf: 1684 → 3370 Spalten, 0 Invalidierungen)
                const spanR = r._voxelChunkConfig(0).span;
                let geladen = null;
                const zaehlen = () => {
                    let nass = 0;
                    let bild = 0;
                    for (let i = -RR; i <= RR; i++)
                        for (let j = -RR; j <= RR; j++) {
                            if (
                                geladen &&
                                !geladen.has(Math.floor((hx + i) / spanR) + "," + Math.floor((hz + j) / spanR))
                            )
                                continue;
                            if (r._nassAt(hx + i, hz + j)) nass++;
                            const b = r._wasserBildAt(hx + i, hz + j);
                            if (b !== null && b !== undefined && Number.isFinite(b)) bild++;
                        }
                    return { nass, bild };
                };
                // das Bild VOR dem Dorf unter DERSELBEN Bedingung wie danach: die Chunks am Rand entstehen neu, dieselben
                // Takte laufen (ein Lauf zählte ohne das 1684 statt 3370 gezeichnete Spalten bei 0 Invalidierungen — der Neubau
                // und der wachsende Ring, nicht das Dorf), dann Takte, bis die Zählung dreimal in Folge steht
                const neuBauen = async () => {
                    const hcx0 = Math.floor(hx / spanR);
                    const hcz0 = Math.floor(hz / spanR);
                    if (!st.dirtyVoxelChunks) st.dirtyVoxelChunks = new Set();
                    for (let dz = -2; dz <= 2; dz++)
                        for (let dx = -2; dx <= 2; dx++) {
                            const key = hcx0 + dx + "," + (hcz0 + dz);
                            if (st.voxelChunks.has(key)) st.dirtyVoxelChunks.add(key);
                        }
                    for (let d = 0; d < 12 && st.dirtyVoxelChunks.size > 0; d++) r._drainDirtyVoxelChunks();
                    await bilder(A.rand.takte);
                };
                await neuBauen();
                let vor = zaehlen();
                for (let n = 0, ruhig = 0; n < 40 && ruhig < 3; n++) {
                    takte30();
                    await sleep(0);
                    const z = zaehlen();
                    ruhig = z.nass === vor.nass && z.bild === vor.bild ? ruhig + 1 : 0;
                    vor = z;
                }
                geladen = new Set();
                for (const [k, e] of st.voxelChunks) if (e?.waterCells) geladen.add(k);
                vor = zaehlen();
                // DIE ZELLEN SELBST: je geladenem Chunk die Zahl seiner Wasser-Zellen — ändert das Dorf sie (der Erdbau
                // am Ufer rückt einen Grund unter Wasser in eine andere Zelle), ist das Wecken des Automaten verdient
                const ZW = r.constructor.CELL_STATE.WATER;
                const wasserZellen = () => {
                    const m = new Map();
                    for (const k of geladen) {
                        const e = st.voxelChunks.get(k);
                        if (!e || !e.waterCells) continue;
                        let n = 0;
                        for (let q = 0; q < e.waterCells.length; q++) if (e.waterCells[q] === ZW) n++;
                        m.set(k, n);
                    }
                    return m;
                };
                const zellenVor = wasserZellen();
                const inv = { n: 0 };
                const invAlt = r._invalidateWaterCapsAround;
                r._invalidateWaterCapsAround = function () {
                    inv.n++;
                    return invAlt.apply(this, arguments);
                };
                let res = null;
                const v0 = new Set(st.architectures);
                // der Nexus-Deckel ruht, solange R misst: über dem Deckel fällt der fernste autonome Bau (`_capNexusStructures`),
                // und das Haus am Seerand ist der fernste, weil der Spieler landein am Rand des Plans steht — R prüft das
                // Wasser, nicht den Deckel
                const Klasse = r.constructor;
                const deckel = Klasse.MAX_NEXUS_STRUCTURES;
                const autos = () => st.architectures.filter((e) => e?.autonomous).length;
                const autosVor = autos();
                const erdbauVor = new Set(Object.keys(st.worldMeta?.erdbau || {}));
                Klasse.MAX_NEXUS_STRUCTURES = Infinity;
                try {
                    zensus.quelle = "Nexus-Dorf";
                    res = await r.spawnSettlement({
                        position: { x: X, y: r._voxelSurfaceY(X, Z), z: Z },
                        seed: A.rand.seed,
                        nHAusGesetz: true,
                        autonomous: true,
                        verlangt: "nexus",
                        blick: null,
                    });
                    zensus.quelle = "strom";
                    // die Häuser bekommen ihre Hülle (das Gesetzbuch), wie im Zensus
                    const haeuser = neueWerke(v0, /^haus_/);
                    for (const e of haeuser)
                        await window.__gebautNach(e, {
                            fertig: () => !!e._hausHuelle || !st.architectures.includes(e),
                            takt: takte30,
                        }).catch(() => null);
                    // die Chunks am Rand entstehen neu (wie beim Wieder-Strömen): 5 × 5 um das Haus am Rand, dann die Takte
                    await neuBauen();
                } finally {
                    r._invalidateWaterCapsAround = invAlt;
                    Klasse.MAX_NEXUS_STRUCTURES = deckel;
                }
                const autosNach = autos();
                const nach = zaehlen();
                const zellenNach = wasserZellen();
                let zellenWechsel = 0;
                for (const [k, n] of zellenVor) if (zellenNach.has(k) && zellenNach.get(k) !== n) zellenWechsel++;
                // DAS RAND-HAUS IST, WO DAS GESETZ ES STELLT: die Ort-Wahl (`_ortWahl`) hält jedes Haus samt Saum aus dem
                // Becken des Sees (die Gestalt des Gewässers verschöbe seinen Boden, `ortTraegt` im Ort-Faden) und rückt das Dorf vom Wunsch
                // am Ufer Ring um Ring landein (am Seerand 1807,8/−6152 vier Ringe, 64 m) — das Haus am Wunsch fand R nie mehr
                // (R LEER: 19 Häuser, keins am Seerand). Das Rand-Haus ist das Haus des Dorfs, das dem Ufer am nächsten steht;
                // R prüft, was den Automaten weckt: den Erdbau des Dorfs, und der muss an Wasser reichen — je Zelle seiner
                // Reichweite (gelaende-core `zellen`, das Raster von `_erdbauAmWasser`) die nassen Spalten (`_nassAt`)
                let randHaus = null;
                let randM = Infinity;
                for (const e of st.architectures)
                    if (e && !v0.has(e) && /^haus_/.test(e.type) && e.position) {
                        const d = Math.hypot(e.position.x - ex0, e.position.z - ez0);
                        if (d < randM) ((randM = d), (randHaus = e));
                    }
                const GK = window.__gelaendeCore;
                const ZM = GK.ERDBAU.zelleM;
                let nassImErdbau = 0;
                const erdbauNeu = Object.keys(st.worldMeta?.erdbau || {}).filter(
                    (k) => !erdbauVor.has(k)
                );
                for (const key of erdbauNeu) {
                    const E = GK.erdbauNormal(st.worldMeta.erdbau[key]);
                    if (!E) continue;
                    for (const c of E.zellen.keys()) {
                        const a = Math.floor(c / 65536) - 32768;
                        const b = (c % 65536) - 32768;
                        for (let i = 1; i < ZM; i += 2)
                            for (let j = 1; j < ZM; j += 2) if (r._nassAt(a * ZM + i, b * ZM + j)) nassImErdbau++;
                    }
                }
                out.rand = {
                    reste,
                    // so weit rückte die Ort-Wahl das Dorf vom Wunsch (`_ortWahlMass.abstandM`), so weit steht das Rand-Haus
                    // vom Ufer-Punkt, so viele nasse Spalten trägt die Reichweite des neuen Erdbaus
                    ortWahlM: r._ortWahlMass ? r._ortWahlMass.abstandM : null,
                    randM: Number.isFinite(randM) ? +randM.toFixed(1) : null,
                    erdbau: erdbauNeu.length,
                    nassImErdbau,
                    haeuser: res ? res.placed : 0,
                    spieler: [+PX.toFixed(1), +PZ.toFixed(1)],
                    randHaus: randHaus
                        ? `${randHaus.type} #${randHaus.id} (${randHaus.position.x.toFixed(1)}/${randHaus.position.z.toFixed(1)})`
                        : null,
                    huelle: !!randHaus?._hausHuelle,
                    // der Nexus-Deckel: so viele autonome Bauten vor und nach dem Dorf — über dem Deckel fiele das Fernste
                    deckel: { max: deckel, autosVor, autosNach, ueber: Math.max(0, autosNach - deckel) },
                    invalidierungen: inv.n,
                    zellenWechsel,
                    ca: st.waterCAActive ? st.waterCAActive.size : 0,
                    nass0: vor.nass,
                    nass1: nach.nass,
                    bild0: vor.bild,
                    bild1: nach.bild,
                    takte: A.rand.takte,
                };
            } catch (e) {
                out.rand = { fehler: fehlerZeile(e) };
            }
        // ── K: DER KONSUM AM RUF: am Ort des Spielers ruft jeder Leser sein
        //    Gesetz WIRKLICH (der Spion zählt und reicht durch); der Zensus endet vorher, die gesetzten Werke fallen wieder ──
        if (!A.nur)
            try {
                r.spawnArchitecture = spawnAlt;
                const ruft = (o, m, lief, args) => {
                    const eigen = Object.prototype.hasOwnProperty.call(r, lief);
                    const alt = r[lief];
                    let n = 0;
                    r[lief] = function () {
                        n++;
                        return alt.apply(this, arguments);
                    };
                    try {
                        o[m](...args);
                    } catch {
                        /* ein Wurf NACH dem Ruf entwertet den Konsum nicht */
                    } finally {
                        if (eigen) r[lief] = alt;
                        else delete r[lief];
                    }
                    return n > 0;
                };
                const X = st.playerMesh.position.x,
                    Z = st.playerMesh.position.z,
                    Y = r._voxelSurfaceY(X, Z);
                const vorA = new Set(st.architectures);
                const at = ["at", X, Y, Z];
                const ctx = () => r.dslCtx({ source: "human", seed: 7 });
                const C = r.constructor.FOREST.cell;
                let wald = false;
                for (let i = -1; i <= 1; i++)
                    for (let j = -1; j <= 1; j++) {
                        const cx = Math.floor(X / C) + i,
                            cz = Math.floor(Z / C) + j;
                        if (r._forestDartMemo) r._forestDartMemo.delete(cx + "," + cz);
                        wald = ruft(r, "_forestCellDarts", "_atlasWaterLevelAt", [cx, cz, r._forestSeedInt()]) || wald;
                    }
                const cfg = r._voxelChunkConfig(0);
                const zellen = new Uint8Array(cfg.dim * cfg.dim * cfg.dimY);
                const ox = Math.floor(X / cfg.span) * cfg.span,
                    oz = Math.floor(Z / cfg.span) * cfg.span;
                const oy = (st.terrainBaseHeight || 0) - cfg.floorDrop;
                const K = {
                    "_feuchteAt → _waterLevelAt": ruft(r, "_feuchteAt", "_waterLevelAt", [X, Z, Y]),
                    "_forestCellDarts → _atlasWaterLevelAt": wald,
                    "_stampArchitectureSolidCellsInto → _blockerNahe": ruft(
                        r,
                        "_stampArchitectureSolidCellsInto",
                        "_blockerNahe",
                        [zellen, ox, oy, oz, 0]
                    ),
                    "spawn_temple → _werkOrtSuchen": ruft(r.dslEffects, "spawn_temple", "_werkOrtSuchen", [[at, 7], ctx()]),
                    "spawn_blueprint → _werkOrtSuchen": ruft(r.dslEffects, "spawn_blueprint", "_werkOrtSuchen", [
                        ["haus_alemannisch", at, 7],
                        ctx(),
                    ]),
                    "spawn_tree → _setzErgebnis": ruft(r.dslEffects, "spawn_tree", "_setzErgebnis", [
                        [at, 1, "eiche", 7],
                        ctx(),
                    ]),
                    "spawn_island → _setzErgebnis": ruft(r.dslEffects, "spawn_island", "_setzErgebnis", [
                        [at, 6, 7, 1],
                        ctx(),
                    ]),
                    "spawn_ufo → _setzErgebnis": ruft(r.dslEffects, "spawn_ufo", "_setzErgebnis", [[at], ctx()]),
                };
                for (const e of neueWerke(vorA)) r.removeArchitecture(e);
                // der losgelassene Wagen (der GT der Ansaugung) rechnet im Nachlauf mit der Tiefe am Wagen
                const gt = ansaugGT;
                if (gt?._fahr) {
                    try {
                        r.dismountArchitecture();
                    } catch {
                        /* steht niemand im Wagen, ist nichts zu lösen */
                    }
                    (r._fahrLos || (r._fahrLos = new Set())).add(gt);
                    gt._fahr.vlong = 4;
                }
                K["_fahrNachlauf → _fahrTiefe"] = !!gt?._fahr && ruft(r, "_fahrNachlauf", "_fahrTiefe", [1 / 60]);
                out.konsum = K;
            } catch (e) {
                out.konsum = { fehler: fehlerZeile(e) };
            }
        if (soll("zensus") || soll("satz")) out.zensus = zensus;
        if (soll("satz")) out.satz = satz;
        st.voxelWorker = worker;
    } finally {
        r.spawnArchitecture = spawnAlt;
    }
    return out;
}

// ── D: DER DAMM ÜBERSTEHT DEN RELOAD (eigener Browser-Kontext: eine frische Welt). `A.phase` "bau": ein Damm quer über den
// Fluss (der Kern des Gesetzes, die Strömung achsen-parallel, die Breite aus der Nässe), `A.takte` Spiel-Takte, gespeichert;
// "reload": dieselbe Welt neu geladen, dieselben Takte, dann der Abbau. Gezählt: die nassen Punkte (`_nassAt`, 1-m-Gitter
// ±A.R m um den Damm) ohne Damm, mit Damm, nach dem Reload; die Invalidierungen des Automaten beim Abbau. ──
async function dammProbe(A) {
    await window.__weltDa((w) => w.state.hydrosphere && w.state.hydrosphere.ready);
    if (st.renderer) {
        st.renderer.render = function () {};
        if (typeof st.renderer.renderAsync === "function") st.renderer.renderAsync = () => Promise.resolve();
    }
    st.postProcessingFailed = true;
    const MUSTER = [16.7, 8.3, 25, 16.7, 33.3, 11.1, 20, 16.7];
    let tMs = performance.now();
    let nFrame = 0;
    const frame = () => {
        tMs += MUSTER[nFrame++ % MUSTER.length];
        try {
            r._gameLoopTick(tMs);
        } catch {}
    };
    const takte = async (n) => {
        for (let i = 0; i < n; i++) {
            frame();
            if (i % 20 === 0) await sleep(0);
        }
    };
    const stroemen = async (X, Z) => {
        let last = -1;
        let still = 0;
        for (const weiter = window.__deckel("der Ring am Strom", 9000); weiter(); ) {
            st.playerMesh.position.set(X, r._voxelSurfaceY(X, Z) + 1.8, Z);
            frame();
            const n = st.voxelChunks ? st.voxelChunks.size : 0;
            still = n === last ? still + 1 : 0;
            last = n;
            if (n >= 9 && still > 30 && !r._weltOffen().chunks) break;
            await sleep(0);
        }
        await takte(120);
    };
    // DER STAU STEHT (Lehre 26, ci-werk-wasser): gezählt wird erst, wenn die Welt ihn nicht mehr baut — kein Auftrag im Faden
    // (`_weltOffen` stau), kein Chunk schmutzig oder im Bau, kein Wasser-Blatt in der Schlange; eine hängende Welt nennt der
    // Deckel beim Namen. Bis hierhin zählte D nach 1200 Takten, ein Stau nach ihnen blieb ungezählt (CI 40441173506).
    const offen = () => ((o) => o.stau + o.chunks + (st.pendingWaterIso ? st.pendingWaterIso.size : 0))(r._weltOffen());
    const stehen = (name) => window.__gebautNach(name, { fertig: () => !offen(), takt: frame }).then(offen);
    const nass = (X, Z) => {
        let n = 0;
        for (let i = -A.R; i <= A.R; i++) for (let j = -A.R; j <= A.R; j++) if (r._nassAt(X + i, Z + j)) n++;
        return n;
    };
    // `hub`: die Spalten der Stau-Felder des Gesetzes (`_stauFelder`), deren Fenster den Damm trägt, die der Pegel hebt
    const hub = (X, Z) =>
        (r._gelaende().stau || []).filter((f) => Math.abs(X / f.step - f.gx0 - f.w / 2) < f.w / 2 && Math.abs(Z / f.step - f.gz0 - f.h / 2) < f.h / 2)
            .reduce((n, f) => n + f.fillY.filter((y) => y === y).length, 0);
    if (A.phase === "bau") {
        const [X, Z] = A.ort;
        await stroemen(X, Z);
        let ort = null;
        for (let gz = -60; gz <= 60; gz += 2)
            for (let gx = -60; gx <= 60; gx += 2) {
                const x = X + gx;
                const z = Z + gz;
                const rv = r._hydroRiverAt(x, z);
                if (!rv || !(rv.centerness > 0.7) || !r._nassAt(x, z)) continue;
                const fm = Math.hypot(rv.flowX, rv.flowZ);
                if (!(fm > 1e-6) || Math.max(Math.abs(rv.flowX), Math.abs(rv.flowZ)) / fm < 0.94) continue;
                const quer = Math.abs(rv.flowX) > Math.abs(rv.flowZ) ? [0, 1] : [1, 0];
                let breite = 0;
                for (const sg of [1, -1]) {
                    let k = 0;
                    while (k < 30 && r._nassAt(x + quer[0] * sg * (k + 0.5), z + quer[1] * sg * (k + 0.5))) k += 0.5;
                    breite += k;
                }
                if (breite > 2 && breite < 14 && (!ort || Math.hypot(gx, gz) < Math.hypot(ort.x - X, ort.z - Z)))
                    ort = { x, z, quer, breite };
            }
        if (!ort) return { fehler: `kein Fluss-Querschnitt (2–14 m) im Umkreis von 60 m um ${X}/${Z}` };
        const w0 = nass(ort.x, ort.z);
        const grund = r._voxelSurfaceY(ort.x, ort.z);
        // DER DAMM FASST DAS UFER (werk-ufer): je Seite quer zur Strömung bis dorthin, wo der Boden `A.fassen` m über dem
        // Spiegel liegt, + 1 m — so lang ist der Damm. Bis werk-ufer war er Breite + 6 m lang: seine Enden lagen 2 m hinter
        // der Krone der Bank, 2,5 m über dem Spiegel, das Wasser umfloss ihn.
        const spiegel = r._atlasWaterLevelAt(ort.x, ort.z, grund);
        let halb = 0;
        for (const sg of [1, -1]) {
            let d = ort.breite / 2;
            const ufer = (dd) => r._voxelSurfaceY(ort.x + ort.quer[0] * sg * dd, ort.z + ort.quer[1] * sg * dd);
            while (d < 40 && !(ufer(d) >= spiegel + A.fassen)) d += 0.5;
            if (d >= 40)
                return {
                    fehler: `das Ufer fasst keinen Damm: binnen 40 m liegt der Boden nie ${A.fassen} m über dem Spiegel (${ort.x}/${ort.z})`,
                };
            halb = Math.max(halb, d + 1);
        }
        // der Damm des Studios (8 × 3 × 1,2 m) quer zur Strömung, 0,3 m im Grund
        const e = r.spawnArchitecture(
            "damm",
            { x: ort.x, y: grund + 0.2, z: ort.z },
            { precise: true, scale: Math.max(1, (2 * halb) / 8), rotationY: ort.quer[0] === 1 ? 0 : Math.PI / 2 }
        );
        if (!e) return { fehler: "der Damm wurde nicht gebaut" };
        await takte(A.takte);
        const offen1 = await stehen("der Stausee des Damms");
        const w1 = nass(ort.x, ort.z);
        st.playerMesh.position.set(ort.x, r._voxelSurfaceY(ort.x, ort.z) + 1.8, ort.z);
        r.saveState();
        return {
            x: ort.x,
            z: ort.z,
            breite: ort.breite,
            laenge: +(2 * halb).toFixed(1),
            id: e.id,
            w0,
            w1,
            takte: A.takte,
            hub: hub(ort.x, ort.z),
            offen1,
        };
    }
    // "reload": dieselbe Welt, der Damm aus dem Save
    const e = st.architectures.find((a) => a && a.type === "damm");
    if (!e) return { fehler: "der Damm überstand den Reload nicht (kein Eintrag)" };
    await stroemen(A.x, A.z);
    await takte(A.takte);
    const offen2 = await stehen("der Stausee nach dem Reload");
    const [w2, hub2] = [nass(A.x, A.z), hub(A.x, A.z)];
    // DIE GEGENPROBE DES NEUBAUS: jeder Chunk am Damm frisch, wie der Empfang des Staus ihn fallen lässt (Cache fort, Neubau,
    // der Automat wacht) — trägt einer den Stau erst jetzt, trat er vor ihm gebaut ohne ihn ein (4× Drossel: 1047 → 1142)
    st.voxelMeshCache = null;
    r._remeshVoxelChunksAround(A.x, A.z, A.R, 0);
    r._invalidateWaterCapsAround(A.x, A.z, A.R);
    const w3 = (await stehen("der Neubau am Damm"), nass(A.x, A.z));
    const inv = { n: 0 };
    const invAlt = r._invalidateWaterCapsAround;
    r._invalidateWaterCapsAround = function () {
        inv.n++;
        return invAlt.apply(this, arguments);
    };
    try {
        r.removeArchitecture(e);
    } finally {
        r._invalidateWaterCapsAround = invAlt;
    }
    return { w2, w3, abriss: inv.n, hub2, offen2 };
}

function selbsttest() {
    const gruen = {
        hain: {
            takte: 1200,
            satz: 6,
            caChunks: 0,
            staemme: Array.from({ length: 7 }, (_, i) => ({ typ: "baum_eiche", id: i, x: 0, z: 0, tiefe: -0.4 })),
        },
        zensus: { werke: 80, haeuser: 12, baeume: 68, imWasser: [], ohneHuelle: [], ohneWand: [], anDerWand: 4 },
        satz: { orte: 9, haeuser: 9, fern: [] },
        leser: [],
        konsum: { "_feuchteAt → _waterLevelAt": true, "spawn_ufo → _setzErgebnis": true },
        wagen: { vEin: 11, v1: 3, tiefe: 0.61, kameraUnter: 0, kameraTiefe: 0 },
        ansaug: {
            ansaug: 0.72,
            dach: 1.2,
            vA: 2.96,
            v3: 0,
            vMaxNach: 2.74,
            maxTiefe: 0.74,
            kameraUnter: 0,
            erreicht: true,
            land: { fussUeberBoden: 0, abstand: 1.54 },
            damm: { invalidierungen: 0, nass: false, caChunks: 0, tiefe: 0.74 },
            aussteigen: {
                tiefe: 1.71,
                tiefeWagen: 1.84,
                tiefeAusstieg: 1.87,
                abstand: 1.54,
                schwimmFrames: 180,
                frames: 180,
                ueberSpiegel: -0.94,
            },
        },
        // BÜHNE: Befund des Selbsttests, kein gesetzter Ort
        damm: {
            id: 425,
            x: 26,
            z: -120,
            w0: 2070,
            w1: 2250,
            w2: 2247,
            abriss: 1,
            takte: 1200,
            hub: 51,
            hub2: 51,
            w3: 2247,
            offen1: 0,
            offen2: 0,
        },
        setzen: {
            faelle: [
                {
                    name: "Kreaturen an der Obergrenze (3 frei)",
                    satz: "spawne kreaturen 10",
                    gewollt: 10,
                    gesetzt: 3,
                    wunsch: "10 Kreaturen gespawnt",
                    grund: "die Welt trägt nicht mehr Kreaturen",
                    chat: "> spawne kreaturen 103 von 10 Kreaturen erschienen — 7 nicht: die Welt trägt nicht mehr Kreaturen (20).",
                },
                {
                    name: "Tempel bei kaltem Buch",
                    satz: "baue tempel hier",
                    gewollt: 1,
                    gesetzt: 0,
                    wunsch: "tempel vor dir gebaut",
                    grund: "das Studio-Buch ist noch nicht geladen",
                    chat: "> baue tempel hierHier steht nichts: das Studio-Buch ist noch nicht geladen.",
                },
            ],
            dorf: {
                sofort: "> baue dorf hierDas Dorf wird gebaut — es meldet sich, wenn es steht.",
                sofortGesetzt: 0,
                echo: '„Villaalto" steht vor dir: 4 Häuser.',
                haeuser: 4,
            },
        },
        rand: {
            haeuser: 9,
            randHaus: "haus_provenzalisch #600 (-1129.0/-1099.0)",
            ortWahlM: 64,
            randM: 52.4,
            erdbau: 1,
            nassImErdbau: 120,
            deckel: { max: 48, autosVor: 27, autosNach: 57, ueber: 9 },
            invalidierungen: 0,
            ca: 0,
            nass0: 2858,
            nass1: 2858,
            bild0: 741,
            bild1: 741,
            takte: 900,
        },
        ergebnis: {
            versuche: [
                {
                    ufer: [-890, -650],
                    gewollt: 6,
                    gesetzt: 4,
                    chat: "4 von 6 Birke gewachsen — 2 nicht: im Wasser steht nichts, am Ufer schon.",
                },
                { ufer: [-920, -610], gewollt: 6, gesetzt: 6, chat: "6× Birke aus dem Studio vor dir gewachsen" },
            ],
        },
        kern: [],
    };
    const faelle = [
        ["H Stamm im Wasser", (b) => (b.hain.staemme[3].tiefe = 2.4), /H: baum_eiche #3 .* steht 2\.40 m im Wasser/],
        ["H Automat geweckt", (b) => (b.hain.caChunks = 15), /H: die Bauten am Ufer weckten den Wasser-Automaten \(15/],
        ["H leer", (b) => (b.hain.satz = 2), /H LEER/],
        ["K ein Leser ruft sein Gesetz nicht", (b) => (b.konsum["spawn_ufo → _setzErgebnis"] = false), /KONSUM: spawn_ufo/],
        ["K nicht gemessen", (b) => delete b.konsum, /K LEER/],
        [
            "Z Fundament im Wasser",
            (b) =>
                b.zensus.imWasser.push({
                    typ: "haus_x",
                    id: 9,
                    x: 1,
                    z: 2,
                    wo: "Fundament",
                    tiefe: 0.8,
                    quelle: "Dorf",
                }),
            /Z: haus_x #9 .* Fundament 0\.80 m im Wasser \(Dorf\)/,
        ],
        ["Z leer", (b) => (b.zensus.werke = 3), /Z LEER/],
        [
            "Z Haus aus dem Satz im Wasser",
            (b) =>
                // BÜHNE: Befund des Selbsttests, kein gesetzter Ort
                b.zensus.imWasser.push({
                    typ: "haus_alemannisch",
                    id: 4,
                    x: -926,
                    z: -1072.2,
                    wo: "Fundament",
                    tiefe: 3.68,
                    punkte: "67 von 81 Punkten der Hülle",
                    quelle: "Haus-Satz",
                }),
            /Z: haus_alemannisch #4 .* Fundament 3\.68 m im Wasser \(67 von 81 Punkten der Hülle\) \(Haus-Satz\)/,
        ],
        [
            "Z ohne Hülle",
            (b) => b.zensus.ohneHuelle.push({ typ: "haus_x", id: 7, quelle: "Haus-Satz" }),
            /Z LEER: haus_x #7 \(Haus-Satz\) stand ohne Hülle/,
        ],
        [
            "Z ohne Wand",
            (b) => b.zensus.ohneWand.push({ typ: "wandlaterne_dorf", id: 9, x: 12.5, z: -3, quelle: "Dorf" }),
            /Z: wandlaterne_dorf #9 \(12\.50\/-3\.00\) hängt an keiner Wand — kein stehendes Haus trägt es \(Dorf\)/,
        ],
        ["S keine Orte", (b) => (b.satz.orte = 2), /S LEER: nur 2 Uferorte/],
        ["S keine Häuser", (b) => (b.satz.haeuser = 0), /S LEER: der Haus-Satz setzte 0 Häuser/],
        [
            "S fern vom Wasser",
            (b) => b.satz.fern.push({ typ: "haus_x", id: 3, x: 0, z: 0, abstand: 31 }),
            /S: haus_x #3 .* steht 31\.00 m vom Wasser/,
        ],
        [
            "L Zwilling",
            (b) => b.leser.push("das alte Protokoll `natur_weicht` lebt neben dem Ergebnis"),
            /L: das alte Protokoll/,
        ],
        ["F ohne Widerstand", (b) => (b.wagen.v1 = 11.9), /F: Wagen im Wasser ohne Widerstand — 39\.60 km\/h/],
        [
            "F Kamera",
            (b) => ((b.wagen.kameraUnter = 4), (b.wagen.kameraTiefe = 0.3)),
            /F: die Verfolger-Kamera steht in 4/,
        ],
        ["F leer", (b) => (b.wagen.vEin = 1), /F LEER/],
        // A (Karte K02): die Zahlen des Kopfs c5e8fa44 am 5°-Ufer der Furt und im See
        [
            "A rollt weiter",
            (b) => (b.ansaug.v3 = 0.86),
            /A: 3 s nach der Ansaugung \(0\.72 m\) fährt der Wagen noch 0\.86/,
        ],
        ["A Vortrieb", (b) => (b.ansaug.vMaxNach = 3.5), /A: Vortrieb nach der Ansaugung/],
        ["A über dem Dach", (b) => (b.ansaug.maxTiefe = 2.3), /A: der Wagen taucht 2\.30 m tief/],
        ["A Kamera", (b) => (b.ansaug.kameraUnter = 3), /A: die Verfolger-Kamera steht in 3/],
        ["A nie an der Ansaugung", (b) => (b.ansaug.erreicht = false), /A LEER: das Wasser erreichte/],
        [
            "A an Land auf dem Wagen",
            (b) => (b.ansaug.land = { fussUeberBoden: 1.55, abstand: 1.1 }),
            /A: Aussteigen an Land — der Spieler steht 1\.55 m/,
        ],
        [
            "A im Wasser auf dem Wagen",
            (b) => ((b.ansaug.aussteigen.schwimmFrames = 1), (b.ansaug.aussteigen.ueberSpiegel = 0.57)),
            /A: Aussteigen in 1\.84 m Wasser — der Spieler schwimmt 1 von 180/,
        ],
        ["A seicht", (b) => (b.ansaug.aussteigen.tiefeWagen = 0.6), /A LEER: der Wagen stand beim Aussteigen in 0\.60/],
        ["A ohne Aussteigen", (b) => (b.ansaug.aussteigen = { fehler: "x" }), /A LEER: x/],
        [
            "A der geparkte Wagen ist ein Damm (der Kopf c5e8fa44)",
            (b) => (b.ansaug.damm = { invalidierungen: 1, nass: true, caChunks: 15, tiefe: 0.14, wer: "AnazhRealm._stampArchitectureSolidCellsInto" }),
            /A: der geparkte Wagen in 0\.14 m Wasser ist ein Damm .*1 Invalidierungen, 15 Chunks wach, Rufer AnazhRealm\._stamp/,
        ],
        ["A ohne Neu-Stempel", (b) => delete b.ansaug.damm, /A LEER: der geparkte Wagen wurde nicht neu gestempelt/],
        ["K Kern", (b) => b.kern.push("K2 …"), /K: K2/],
        [
            "D Stausee nach dem Reload weg (der Befund am Kopf e162430b)",
            (b) => (b.damm.w2 = b.damm.w3 = 2070),
            /D: der Stausee des Damms #425 .* bildet sich nach dem Reload nicht neu — 2070 statt 2250/,
        ],
        // die Antwort des Fadens kommt verspätet (CI 40441173506): gezählt vor dem Stau ist ROT beim Namen dessen, was offen war
        ["D Stau-Antwort verspätet", (b) => Object.assign(b.damm, { w2: 1, offen2: 1 }), /#425 wurde gezählt, ehe der Stau stand \(offen 0 · 1\)/],
        ["D Stand ungemessen", (b) => delete b.damm.offen1, /ehe der Stau stand \(offen undefined · 0\)/],
        ["D Stau nach dem Reload nie bestellt", (b) => (b.damm.hub2 = 0), /D: nach dem Reload trägt der Stau kein Feld des Damms #425 \(0 Spalten\)/],
        // der Chunk, der vor dem Stau gebaut ohne ihn eintrat (4× Drossel am Kopf 455e5be8: 1047 → 1142 nach dem Neubau)
        ["D Chunk vor dem Stau", (b) => (b.damm.w3 = 2290), /Damm #425 trug den Stau erst nach seinem Neubau \(2247 → 2290\)/],
        [
            "D Abbau weckt nicht",
            (b) => (b.damm.abriss = 0),
            /D: der Abbau des Damms #425 nach dem Reload weckt den Wasser-Automaten nicht \(0/,
        ],
        ["D Bild ohne Stau", (b) => (b.damm.w1 = 2100), /D: der Damm #425 hebt 51 Spalten, das gezeichnete Wasser staut 30 nasse Punkte/],
        [
            "D Ort ohne Stau (die Furt −937/−1064 am Kopf a0d6a81b: die 1 715 Punkte der Basis waren die Deck-Zeile)",
            // BÜHNE: Befund des Selbsttests (die Furt der alten Welt), kein gesetzter Ort
            (b) => Object.assign(b.damm, { x: -937, z: -1064, hub: 0 }),
            /D LEER: das Stau-Feld des Damms #425 \(-937\.00\/-1064\.00\) hebt 0 Spalten .*der Ort trägt keinen Stau/,
        ],
        [
            "R Fehl-Wecker am Seerand (der Befund am Kopf f5b331ae)",
            (b) => ((b.rand.invalidierungen = 3), (b.rand.ca = 6), (b.rand.nass1 = 2637), (b.rand.bild1 = 685)),
            /R: das Dorf am Seerand weckt den Wasser-Automaten, ohne Wasser der Zellen zu verdrängen — 3 Invalidierungen, 6 Chunks/,
        ],
        [
            "R Wasser weicht",
            (b) => (b.rand.nass1 = 2637),
            /R: das Wasser am Seerand ändert sich mit dem Dorf — nasse Punkte 2858 → 2637/,
        ],
        // K16: der Gesamtlauf warf das Haus am Seerand über den Nexus-Deckel — R LEER nennt den Deckel mit seinen Zahlen
        ["R leer", (b) => (b.rand.randHaus = null), /R LEER: .*Nexus-Deckel 48, autonome Bauten 27 → 57/],
        // K10-6: die Ort-Wahl rückt das Dorf aus dem Becken — reicht sein Erdbau an kein Wasser, prüft R nichts
        [
            "R ohne Wasser am Erdbau",
            (b) => (b.rand.nassImErdbau = 0),
            /R LEER: der Erdbau des Dorfs \(1 Orte\) reicht an keine nasse Spalte — .* 52\.4 m vom Seeufer, die Ort-Wahl rückte das Dorf 64 m/,
        ],
        [
            "E Wunsch-Zahl der Kreaturen (Befund am Kopf f5b331ae)",
            (b) => (b.setzen.faelle[0].chat = "> spawne kreaturen 1010 Kreaturen gespawnt (am Spieler)"),
            /E: Kreaturen an der Obergrenze \(3 frei\) .* der Satz sagt den Wunsch „10 Kreaturen gespawnt" bei 3 von 10/,
        ],
        [
            "E Tempel ohne Grund",
            (b) => (b.setzen.faelle[1].chat = "> baue tempel hierHier steht nichts."),
            /E: Tempel bei kaltem Buch .* der Satz nennt den Grund nicht/,
        ],
        [
            "E Absage ohne Grund",
            (b) =>
                (b.setzen.faelle[1].chat =
                    "> baue tempel hierHier steht nichts: das Studio-Buch ist noch nicht geladen; ohne benannten Grund (das Log der Welt nennt ihn)."),
            /E: Tempel bei kaltem Buch .* eine Absage ohne Grund/,
        ],
        ["E Fehl-Grund griff nicht", (b) => (b.setzen.faelle[1].gesetzt = 1), /E LEER: Tempel bei kaltem Buch/],
        [
            "E Dorf sofort gebaut",
            (b) => (b.setzen.dorf.sofort = "> baue dorf hierdorf vor dir gebaut"),
            /E: das Dorf im See — der Satz sagt sofort „> baue dorf hierdorf vor dir gebaut" bei 0/,
        ],
        ["E Dorf meldet falsch", (b) => (b.setzen.dorf.haeuser = 2), /E: das Dorf im See meldet .* bei 2 stehenden/],
        ["E Dorf stumm", (b) => (b.setzen.dorf.echo = ""), /E LEER: das Dorf im See meldete/],
        [
            "C Wunsch-Zahl (der Satz am Kopf e162430b, wie der Chat ihn zeigt)",
            (b) =>
                (b.ergebnis.versuche[0].chat =
                    "> pflanz mir sechs birken6× Birke aus dem Studio vor dir gewachsen2 davon wuchsen nicht: im Wasser steht nichts, am Ufer schon."),
            /C: der Satz sagt die gewünschte Zahl — „.*6× Birke .*" bei 4 von 6 gesetzten Birken am Ufer -890\/-650/,
        ],
        [
            "C ohne Zahl",
            (b) => (b.ergebnis.versuche[0].chat = "Birken gewachsen."),
            /C: der Satz nennt die tatsächliche Zahl nicht/,
        ],
        ["C leer", (b) => (b.ergebnis.versuche[0].gesetzt = 6), /C LEER/],
        ["D lief nicht", (b) => delete b.damm, /D: die Damm-Probe lief nicht/],
    ];
    const fehler = taeterFaelle([["grüner Befund", () => {}], ...faelle], urteil, { klon: () => JSON.parse(JSON.stringify(gruen)) });
    // die Leser-Linse gegen eingeschmuggelte Täter im echten Stamm (der Vor-Stand über den EINEN Helfer)
    const gifte = [
        [
            "Bezug als Probe",
            (s) => s.replace("this._waterLevelAt(x, z, uf);", "this._waterLevelAt(x, z);"),
            /liest den Bezug/,
        ],
        [
            "Stempel läuft den Bestand",
            (s) =>
                s.replace(
                    "this._blockerNahe(ox + halb, oz + halb, halb, 0, nahe);",
                    "for (const e of this.state.architectures) nahe.push(e);"
                ),
            /läuft den ganzen Bestand durch/,
        ],
        [
            "Wurzel sagt still ab (die Obergrenze)",
            (s) =>
                s.replace(
                    'if (this.state.creatures.length >= this.state.maxCreatures) return nein("obergrenze");',
                    "if (this.state.creatures.length >= this.state.maxCreatures) return null;"
                ),
            /die Wurzel `spawnCreatureAt` sagt still ab/,
        ],
        [
            "Damm wacht nur beim Bau",
            (s) =>
                s.replace(
                    "this._playWaterReactionPing(fussabdruecke);\n",
                    "this._playWaterReactionPing(fussabdruecke);\n            this._invalidateWaterCapsAround(0, 0, 1);\n"
                ),
            /am Setz-Punkt .* statt am Zell-Stempel/,
        ],
    ];
    const giftFall = (art) => ([name, z, muss]) => ({ name: `${art}: ${name}`, z, muss });
    taeterFaelle([{ name: "der echte Stamm" }, ...gifte.map(giftFall("Leser"))], leserUrteil, { fehler });
    // die Kern-Linse gegen eingeschmuggelte Täter im echten Kern (vm, ohne Browser)
    const vm = require("vm");
    const kernSrc = ausDatei(path.join(__dirname, "..", "vehicle-core.js"));
    const kernLaden = (s) => {
        const ctx = { console, Math, Object, Array, Number, JSON, Map, Set, isFinite, isNaN, Infinity, NaN };
        for (const T of [Float32Array, Float64Array, Uint8Array, Uint16Array, Uint32Array, Int32Array]) ctx[T.name] = T;
        ctx.globalThis = ctx;
        ctx.window = ctx;
        vm.createContext(ctx);
        vm.runInContext(s, ctx);
        return ctx.__vehicleCore;
    };
    taeterFaelle([{ name: "der echte Kern", z: (s) => s }, ...[
        [
            "Wasser-Term ohne Widerstand",
            (s) => s.replace("z.vlong = vL0 / (1 + Wg.kStirn * t * Math.abs(vL0) * dt);", "z.vlong = vL0;"),
            /K2 in 0\.61 m Wasser/,
        ],
        [
            "der Wasserschlag sperrt die Räder nicht (der Kopf c5e8fa44)",
            (s) =>
                s.replace(
                    "else if (!motor && dt > 0) Fr -= Math.min(G.handDecel, Math.abs(vL) / dt) * m * sgn;",
                    "else if (!motor && dt > 0) Fr -= 0;"
                ),
            /K6 über der Ansaugung am 11°-Hang rollt er unter Vollgas 3 s später mit 1\.33 m\/s weiter/,
        ],
        [
            "das Gas wirkt am stehenden Motor (der Kopf c5e8fa44: keine Ruhe unter Vollgas)",
            (s) =>
                s.replace(
                    "const thr = motor && e && e.throttle > 0 ? Math.min(1, e.throttle) : 0;",
                    "const thr = e && e.throttle > 0 ? Math.min(1, e.throttle) : 0;"
                ),
            /K4 über der Ansaugung/,
        ],
    ].map(giftFall("Kern"))], (gift) => kernUrteil(kernLaden(gift(kernSrc))), { fehler });
    selbsttestEnde(fehler, "Befund, Leser und Kern nennen jeden eingeschmuggelten Täter beim Namen.");
    process.exit(0);
}

// `--nur hain,zensus,satz,wagen` und `--furt x,z,ux,uz` (der Vergleich an DERSELBEN Furt) — Werkbank-Fragen, das Gate fährt alle.
// DIE ORTE AUS DER WELT: der Fluss (gerader Querschnitt 2–14 m), sein Ufer, der See (die benannte Senke des
// Gelände-Gesetzes, deren Kachel einen See trägt — wie `__wasserOrt`), sein Ufer und die Rampe in tiefes Wasser — gesucht am
// Gesetz der Welt (Hydrosphäre, Wasser des Atlas über dem Boden) nächst der Mess-Wiese, nie als Literal der alten Welt (die
// Orte von V18.540 lagen nach der neuen Landform im Trockenen: Hain, Furt, Rampe, Damm, Uferhäuser, See und Seerand).
async function weltOrte(A) {
    await window.__weltDa(() => !(!r || !r.state.hydrosphere || !r.state.hydrosphere.ready));
    const G = window.__gelaendeCore;
    const [MX, MZ] = A.mess;
    const tiefe = (x, z) => {
        const g = r._voxelSurfaceY(x, z);
        if (!Number.isFinite(g)) return -Infinity;
        const w = r._atlasWaterLevelAt(x, z, g);
        return w > g ? w - g : -Infinity;
    };
    // nass ist, was die Proben nass nennen (`_nassAt`: Körper-Wasser über dem Boden, ohne Fels darüber; vor dem Strömen
    // das Wasser des Atlas) — das Atlas-Wasser allein fand Flüsse, an denen kein Körper-Wasser steht
    const nass = (x, z) => tiefe(x, z) > 0 && r._nassAt(x, z);
    const out = { fluss: null, ufer: null, eiche: null, see: null, seeUfer: null, rampe: null };
    // 1) der Fluss: der nächste gerade Querschnitt 2–14 m (das Kriterium der Damm-Probe), auf Ringen um die Mess-Wiese — und
    // bis zu drei weitere, je mehr als 150 m von den anderen und höchstens 480 m hinter dem ersten (`uferKandidaten`): ob ein
    // Ufer frei von Bauten ist, weiß erst die gestreamte Welt (die Glutbrunnen des Affinitäts-Felds wachsen mit dem Chunk) —
    // die Hain-Probe wählt dort das erste freie
    out.uferKandidaten = [];
    let R1 = null;
    for (let R = 0; R <= A.R && out.uferKandidaten.length < 4 && !(R1 !== null && R > R1 + 480); R += 6) {
        if (R % 192 === 0) await window.__weltDa(() => !r._ensureHydroTilesAround(MX, MZ, R));
        const n = R ? Math.ceil((2 * Math.PI * R) / 6) : 1;
        for (let k = 0; k < n && out.uferKandidaten.length < 4; k++) {
            const x = Math.round(MX + R * Math.cos((k / n) * 2 * Math.PI));
            const z = Math.round(MZ + R * Math.sin((k / n) * 2 * Math.PI));
            if (out.uferKandidaten.some((c) => Math.hypot(c.fluss.x - x, c.fluss.z - z) <= 150)) continue;
            const rv = r._hydroRiverAt(x, z);
            if (!rv || !(rv.centerness > 0.7) || !nass(x, z)) continue;
            const fm = Math.hypot(rv.flowX, rv.flowZ);
            if (!(fm > 1e-6) || Math.max(Math.abs(rv.flowX), Math.abs(rv.flowZ)) / fm < 0.94) continue;
            const quer = Math.abs(rv.flowX) > Math.abs(rv.flowZ) ? [0, 1] : [1, 0];
            const rand = [];
            for (const sg of [1, -1]) {
                let k2 = 0;
                while (k2 < 30 && nass(x + quer[0] * sg * (k2 + 0.5), z + quer[1] * sg * (k2 + 0.5))) k2 += 0.5;
                rand.push(k2);
            }
            const breite = rand[0] + rand[1];
            if (!(breite > 2 && breite < 14)) continue;
            // das Ufer: 4 m hinter der Wasserkante auf der Seite zur Mess-Wiese; die Bau-Eiche 12 m weiter landein
            const sg = (MX - x) * quer[0] + (MZ - z) * quer[1] >= 0 ? 1 : -1;
            const k0 = sg === 1 ? rand[0] : rand[1];
            const ufer = [x + quer[0] * sg * (k0 + 4), z + quer[1] * sg * (k0 + 4)];
            const eiche = [x + quer[0] * sg * (k0 + 16), z + quer[1] * sg * (k0 + 16)];
            // (ob das Ufer frei von Bauten ist, weiß erst die gestreamte Welt: die Hain-Probe prüft es dort, `bauNah`)
            out.uferKandidaten.push({ fluss: { x, z, quer, breite }, ufer, eiche });
            if (R1 === null) {
                R1 = R;
                out.fluss = { x, z, quer, breite };
                out.ufer = ufer;
                out.eiche = eiche;
            }
        }
    }
    // 2) der See: die nächste benannte Senke, deren Kachel einen gerenderten See trägt (Spiegel > Meer + 2 m, ≥ 16 Zellen)
    const L = r._gelaende();
    const wl = r.state.waterLevel;
    const step = 64;
    const n = 375;
    const kand = G.benannteSeen(L, -12000, -12000, step, n)
        .map((k) => ({ x: -12000 + (k % n) * step, z: -12000 + ((k / n) | 0) * step }))
        .sort((a, b) => Math.hypot(a.x - MX, a.z - MZ) - Math.hypot(b.x - MX, b.z - MZ));
    for (const k of kand) {
        await window.__weltDa(() => !r._ensureHydroTilesAround(k.x, k.z, 0));
        const h = r._hydroFor(k.x, k.z);
        const lake = h && h.lakes.find((l) => l.level > wl + 2 && l.cells && l.cells.length >= 16);
        if (!lake) continue;
        // die tiefste Zelle des Sees ist seine Mitte
        let best = null;
        for (const q of lake.cells) {
            const x = h.originX + ((q % h.dim) + 0.5) * h.cell;
            const z = h.originZ + (((q / h.dim) | 0) + 0.5) * h.cell;
            const t = tiefe(x, z);
            if (!best || t > best.t) best = { x, z, t };
        }
        if (!best || !(best.t > 1.5)) continue;
        out.see = { x: best.x, z: best.z, tiefe: +best.t.toFixed(2), level: lake.level };
        // das Ufer: in der Richtung zur Mess-Wiese (sonst der ersten von 16) die Wasserkante, 4 m landein
        const a0 = Math.atan2(MZ - best.z, MX - best.x);
        for (let j = 0; j < 16 && !out.seeUfer; j++) {
            const a = a0 + (j * Math.PI) / 8;
            for (let d = 2; d <= 400; d += 1) {
                const x = best.x + Math.cos(a) * d;
                const z = best.z + Math.sin(a) * d;
                if (nass(x, z)) continue;
                out.seeUfer = [+(x + Math.cos(a) * 4).toFixed(1), +(z + Math.sin(a) * 4).toFixed(1)];
                out.seeRand = { winkel: +(((a * 180) / Math.PI + 360) % 360).toFixed(0) };
                break;
            }
        }
        break;
    }
    // 3) die Rampe: am Ufer von See und Fluss (Ringe bis 90 m um beide) eine Wasserkante (0–0,3 m), davor 26 m trocken und eben
    //    (Stufen ≤ 0,35 m), dahinter Wasser, das je m höchstens A.rampeStufe tiefer wird, bis A.ansaugTief — die Prüfung von A
    const pruefe = (px, pz, ux, uz) => {
        const t0 = tiefe(px, pz);
        if (!(t0 > 0 && t0 <= 0.3)) return false;
        let vor = null;
        for (let s = 2; s <= 28; s++) {
            const h = r.getTerrainHeightAt(px - ux * s, pz - uz * s);
            if (!Number.isFinite(h) || nass(px - ux * s, pz - uz * s) || (vor !== null && Math.abs(h - vor) > 0.35))
                return false;
            vor = h;
        }
        let tVor = t0;
        for (let s = 1; s <= 40; s++) {
            const t = tiefe(px + ux * s, pz + uz * s);
            if (!(t > 0) || t - tVor > A.rampeStufe) return false;
            if (t >= A.ansaugTief) return true;
            tVor = t;
        }
        return false;
    };
    const mitten = [out.see && [out.see.x, out.see.z], out.fluss && [out.fluss.x, out.fluss.z]].filter(Boolean);
    for (const [cx, cz] of mitten) {
        for (let d = 0; d <= 160 && !out.rampe; d += 2)
            for (let k = 0; k < 64 && !out.rampe; k++) {
                const px = Math.round(cx + Math.cos((k * Math.PI) / 32) * d);
                const pz = Math.round(cz + Math.sin((k * Math.PI) / 32) * d);
                const t = tiefe(px, pz);
                if (!(t > 0 && t <= 0.3)) continue;
                for (let j = 0; j < 16 && !out.rampe; j++) {
                    const ux = Math.cos((j * Math.PI) / 8);
                    const uz = Math.sin((j * Math.PI) / 8);
                    if (pruefe(px, pz, ux, uz)) out.rampe = [px, pz, ux, uz];
                }
            }
        if (out.rampe) break;
    }
    return out;
}

const argListe = (name, w = argOpt(name)) => (w ? w.split(",") : null);

async function lauf() {
    const PORT = Number(process.env.WERK_WASSER_PORT || 4643);
    const root = path.resolve(__dirname, "..");
    const befund = {};
    befund.leser = leserUrteil();
    require(path.join(root, "vehicle-core.js"));
    befund.kern = kernUrteil(globalThis.__vehicleCore);
    const server = statikServer();
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "null", frist: 900000 });
    let exit = 2;
    try {
        const page = await browser.newPage();
        await nullRenderer(page);
        await server.zeige(page, 120000);
        // die Orte aus der Welt: Fluss, Ufer, See, Seeufer, Rampe nächst der Mess-Wiese
        const ORTE = await page.evaluate(weltOrte, {
            mess: ((m) => [m.x, m.z])(messort("wiese")),
            R: 1500,
            rampeStufe: 0.25,
            ansaugTief: 1.3,
        });
        befund.orte = ORTE;
        console.log("  Orte aus der Welt: " + JSON.stringify(ORTE));
        if (!ORTE.fluss || !ORTE.see)
            throw new Error("ORTE LEER: kein Fluss (2–14 m) oder kein See nächst der Mess-Wiese");
        const out = await page.evaluate(probe, {
            ort: ORTE.ufer,
            uferKandidaten: ORTE.uferKandidaten,
            eiche: ORTE.eiche,
            takte: 1200,
            hainMin: SCHWELLE.hainMin,
            tiefeStamm: SCHWELLE.tiefeStamm,
            tiefeFundament: SCHWELLE.tiefeFundament,
            suchR: 90,
            // A: die Rampe am Ufer der Furt (Wasserrand, Fahrt-Richtung): 5° bis 1,3 m, dahinter der Fluss bis 1,4 m
            rampe: ORTE.rampe,
            ansaugTief: 1.3, // A: so tief wird das Wasser an der Rampe (über dem Dach des GT, 1,2 m)
            rampeStufe: 0.25, // A: m, um die das Wasser der Rampe je m höchstens tiefer wird (≤ 14°)
            aussteigTief: SCHWELLE.aussteigTiefMin, // A: so tief steht der Wagen mindestens beim Aussteigen (tiefste Stelle der Rampe)
            gitterR: 18,
            wandM: 0.6, // Z: so weit liegt die Hülle des tragenden Hauses höchstens von der Achse eines Werks an der Wand (armM 0,4 m)
            satzJe: 3,
            satzAbstandMax: SCHWELLE.satzAbstandMax,
            satzNah: [ORTE.ufer, [ORTE.fluss.x, ORTE.fluss.z]],
            satzFern: [ORTE.seeUfer],
            dorfMs: 30000, // E: so lange darf das Dorf im See brauchen, bis es sich meldet
            // R: das Dorf des Nexus am Seerand — Same, Ort, das Haus am Rand, Fenster, Takte
            rand: {
                seed: 1500797043,
                ufer: ORTE.seeUfer,
                see: [ORTE.see.x, ORTE.see.z],
                winkel: ORTE.seeRand ? ORTE.seeRand.winkel : 200,
                R: 60,
                takte: 600,
            },
            nur: argListe("--nur"),
            furt: argListe("--furt") ? argListe("--furt").map(Number) : null,
        });
        Object.assign(befund, out);
        // D: der Damm in einer frischen Welt (eigener Kontext — eigener Speicher), gespeichert und neu geladen
        const nur = argListe("--nur");
        if (!nur || nur.includes("damm")) {
            const kontext = await browser.createBrowserContext();
            try {
                const p2 = await kontext.newPage();
                await nullRenderer(p2);
                // DER SPIELPFAD: die Platte des Bodens an wie im Spiel (headless ist sie aus) — bis ci-werk-wasser las der Faden
                // unter dem Stausee die Chunks von vor dem Damm, und D sah es nie
                await p2.evaluateOnNewDocument(() => (window.__anazhChunkIdb = true));
                await server.zeige(p2, 120000);
                // die Bühne, geboren wie im Spiel (Welt-Tor + aktiv + Reload): ihre Klamm S6 trägt den Stau (s. Kopf D)
                const buehne = ausDatei(path.join(root, "spec", "pruefbuehne", "welt.json"), true);
                const S6 = JSON.parse(
                    ausDatei(path.join(root, "spec", "pruefbuehne", "stationen.json"))
                ).stationen.find((s) => s.id === "s6-klamm");
                if (!S6) throw new Error("D: keine Station s6-klamm in spec/pruefbuehne/stationen.json");
                const weltId = await p2.evaluate(async (json) => {
                    await window.__weltDa();
                    const res = r.importWorldBeside(json);
                    if (!res.ok) return null;
                    r.activeWorldSet(res.worldId);
                    return res.worldId;
                }, buehne);
                if (!weltId) throw new Error("D: die Prüfbühne ließ sich nicht importieren");
                await p2.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
                const D = { takte: 1200, R: 40, fassen: 4 };
                // der Ort: die Klamm der Prüfbühne (S6), deren Bach der Damm fasst (`--damm x,z` fragt einen anderen Ort der Bühne)
                const dammOrt = argListe("--damm") ? argListe("--damm").map(Number) : [S6.x, S6.z];
                const bau = await p2.evaluate(dammProbe, Object.assign({ phase: "bau", ort: dammOrt }, D));
                if (bau.fehler) befund.damm = bau;
                else {
                    await p2.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
                    const nach = await p2.evaluate(
                        dammProbe,
                        Object.assign({ phase: "reload", x: bau.x, z: bau.z }, D)
                    );
                    befund.damm = nach.fehler ? nach : Object.assign({}, bau, nach);
                }
            } finally {
                await kontext.close().catch(() => {});
            }
        }
        const v = urteil(befund);
        console.log(JSON.stringify(befund, null, 1));
        if (v.length) {
            console.log(`\nWERK-IM-WASSER ROT (${v.length}):`);
            for (const x of v) console.log("  ❌ " + x);
        } else console.log("\nWERK-IM-WASSER GRÜN");
        exit = v.length ? 1 : 0;
    } catch (e) {
        console.log("WERK-IM-WASSER ABBRUCH:", e?.message || e);
        exit = 2;
    } finally {
        await browser.close().catch(() => {});
        server.close();
    }
    process.exit(exit);
}

if (SELBSTTEST) selbsttest();
else lauf();

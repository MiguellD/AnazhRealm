// diag-ankunft.cjs — DIE ANKUNFTS-LINSE (v1-Schritte 1–2: ankommen · laufen und sehen). Die Defekte, die die
// SICHTBARE Leben-Schau am 07.10. auf dem Welle-L-Stand fand (artifacts/profiband/leben-schau/befund-v1-pfad.md), je beim
// NAMEN. Jede Probe ruft den Chokepoint selbst im echten Boot (headless, foundry-ON, Null-Renderer) und misst seine Wirkung;
// das Bild der Ankunft beweist die echte GPU (Bild-Paare vorher/nachher), diese Linse die Mechanik.
//
//   L2a DAS ERSTE WELTBILD — `#ladeschirm` steht im HTML ab dem ersten Bild der Seite (kein `hidden`, über allem) und
//       weicht nur über `_ankunftsBild`: solange dem Weltbild ein Term fehlt (Boden, Horizont, Leib, Buch, Bäume und Bauten
//       der Mesh-Zone, Pflanzung, Streu, ferne Karten, Dorf), bleibt er und nennt die Lücke; ruht sie, weicht er laut (WARN).
//       Jeder Fall wird hergestellt, einer, der fehlt, ist ROT bei seinem Grund (`ohneFall`). DIE ANKUNFT AUS DER FERNE (B2):
//       bis zum Bild wünscht jedes Ding seine billigste ganze Stufe (Baum Karte, Bau Grobstufe), danach verfeinert es.
//   LH  WAS DAS BILD NICHT LIEST (w4-ankunft-2) — vor dem ersten Weltbild wächst kein Skelett einer Baum-Hülle (die Kollision,
//       `_baumGestaltTeile`): sie wartet beim Namen (`_huellenNach`, `_weltOffen().huellen`) und kommt nach dem Bild
//       (`_tickHuellenNach`); unter dem Ladeschirm baut der Ring ein Stück außer Bild nur im Leerlauf (`_ringLeerlauf`).
//   L1  DAS FADENKREUZ — `#fadenkreuz` steht in der Bildmitte (dort trifft `_blickZiel`), weicht einer offenen Schublade.
//   L2b DIE HILFE — „hilfe" / „help" / „?" nennt jedes Beispiel der EINEN Tafeln (`chatDslPatterns`, `chatSystemPatterns`,
//       ihre `hilfe`-Sätze) und jede Taste (`KEYBINDING_LABELS`); der Satz für Unbekanntes trägt keine zweite Liste.
//   L3  DAS GESPRÄCH — Enter öffnet das Feld, Enter im Feld sendet und gibt die Welt zurück (W läuft wieder), Esc ohne
//       Senden; Enter auf einem fokussierten Knopf gehört dem Knopf.
//   L7  DER START-GURT — die Hotbar eines neuen Spielers liest den Katalog (`_katalogSichtbar`): je Studio-Art EIN Werk.
//   LK  DIE KAMERA UND DIE PFLANZEN — die Stamm-Blocker eines Studio-Baums tragen seine Welt-Skala; die 3rd-Kamera (zu Fuß
//       und im Ritt) rückt nur vor Boden und Bau ein, nie vor einer Pflanze, und fährt gleitend hinaus; jeder Pflanzen-Stoff
//       trägt die DURCHSICHT (maskNode, nie im Schatten-Pass): sie nimmt nur, was zwischen Auge und Spieler liegt (die EINE
//       Formel `_durchsichtGewicht`), und jede Probe durch die Bildmitte (Bau-Pick, Welt-Treffer, Blick-Ziel, Bau-Phantom,
//       Kreatur-Pick) trifft nie, was zwischen Kamera und Spieler liegt.
//   D8  ZWEI KANÄLE — der Spieler-Chat trägt Worte, das Log die Telemetrie: die Siedlungs-Zeile ohne Same und Slots, das
//       KI-Programm als Tat (`describeProgram`), nie als JSON, eine Programm-Absage ohne Ereignis-Namen.
//   D6  DIE KI NENNT DIE URSACHE — „Aktivieren" fragt einen lokalen Dienst (der Status sagt, dass er nicht läuft, nie
//       „Aktiv"), ohne Schlüssel sagt der Chat es, der Proxy ist der Ursprung der Seite (404 dort = „der Proxy fehlt").
//   D9  DAS DORF VOR DIR — „dorf 7 18" an der Plattform: jedes Haus vor dem Spieler und im Bildwinkel; ein gesperrter Slot
//       fällt an seinem Ort laut; „baue dorf hier" baut bei einem Mitspieler dasselbe Dorf an derselben Stelle.
// Die Befunde jeder Probe trägt git (Lehre 15).
//
//   node scripts/diag-ankunft.cjs [--selftest]          Port: ANKUNFT_PORT (Standard 4601)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const { statikServer, hauptLauf, nullSeite, pruefer, wandEnde, selbsttestEnde, ROOT } = require("./lib/welt-boot.cjs");
const stammLib = require("./lib/stamm.cjs");

const PORT = Number(process.env.ANKUNFT_PORT || 4601);

const { errs, check } = pruefer();

// ── DIE VERDIKTE (pure Funktionen; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
function ladeschirmVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.imHtml) out.push("kein Ladeschirm im HTML (das erste Bild ist die schwarze Leinwand)");
    else {
        if (m.htmlVersteckt) out.push("der Ladeschirm steht im HTML versteckt");
        if (!(m.zIndex >= 1000000)) out.push(`der Ladeschirm liegt unter der UI (z-index ${m.zIndex})`);
    }
    const f = m.faelle || {};
    if (f.fehler) return out.concat([f.fehler]);
    // Ein Fall, den die Probe nicht herstellen konnte, ist ROT beim Grund, den sie nennt (`ohneFall`), nie still
    const ohne = (k) => `${(m.ohneFall || {})[k] || "die Probe stellte den Fall nicht her und nennt keinen Grund"} (Vorbedingung)`;
    // eine Lücke hält den Ladeschirm und die Stand-Zeile nennt sie
    for (const [k, name, wort] of [
        ["ohneBoden", "ohne Boden unter dem Spieler", /Boden/],
        ["baumUngebaut", "mit einem Baum im Blick ohne Gestalt", /Bäume und Bauten/],
        ["streuNie", "ohne eine gestreamte Streu-Region (der Streamer lief noch nie)", /Wald-Stück/],
        ["karteOffen", "mit der offenen Karte eines Baums im Blick", /ferne Bäume/],
        ["weltFehlt", "ohne die Welt (kein Spieler)", /Welt entsteht/],
        ["buchZu", "ohne das Buch der Studios", /Buch der Studios/],
        ["leibFehlt", "ohne den Leib des Spielers", /Leib/],
        ["pflanzung", "mit einem gepflanzten Baum im Blick, der noch nicht steht", /gepflanzt/],
        ["saat", "mit einem Chunk im Laub-Radius, dessen Wald noch nicht gesät ist", /bepflanzt/],
        ["horizont", "ohne den Horizont (der Fern-Ring steht nicht ganz)", /Horizont/],
        ["licht", "ohne das Licht des Orts", /Licht des Orts/],
        ["dorfExport", "mit dem Export eines Dorfs der Ankunft unterwegs", /Dorf/],
        ["dorfSchlange", "mit den Häusern eines Dorfs der Mesh-Zone in der Schlange", /Dorf/],
        ["dorfFaellig", "mit einem fälligen, noch nicht bestellten Start-Dorf am Genesis-Ort", /Dorf/],
    ]) {
        const z = f[k];
        if (!z) out.push(`${name}: ${ohne(k)}`);
        else if (z.weg) out.push(`${name} weicht der Ladeschirm (das halbe Weltbild)`);
        else if (!wort.test(z.stand || "")) out.push(`${name} nennt die Stand-Zeile die Lücke nicht („${z.stand}")`);
    }
    // DAS WELTBILD IST DER BLICK (B3d): ein Loch hinter dem Spieler hält das erste Bild nie, der Rang der Foundry-Schlange
    // stellt vor dem Bild den Blick vor die Nähe und danach die Nähe rundum, und gleich nach der Kontrolle zeigt der Rundblick
    // kein Loch
    for (const [k, name] of [["bodenHinten", "mit einem Stück Boden hinter dem Spieler"], ["baumHinten", "mit einem Baum hinter dem Spieler ohne Gestalt"], ["karteHinten", "mit der offenen Karte eines Baums hinter dem Spieler"], ["pflanzungHinten", "mit einem gepflanzten Baum hinter dem Spieler"]])
        if (!f[k]) out.push(`${name}: ${ohne(k)}`);
        else if (!f[k].weg) out.push(`${name} hält der Ladeschirm („${f[k].stand}") — das erste Bild wartet auf das, was der Spieler nicht sieht (\`_weltbildLuecken\`)`);
    const rg = m.rang;
    if (!rg || !rg.vorBild || !rg.nachBild) out.push("der Rang der Foundry-Schlange: keine Probe (Vorbedingung)");
    else if (rg.vorBild !== "blick") out.push(`vor dem ersten Bild sendet die Pumpe „${rg.vorBild}" an eine Bahn mit einem Auftrag im Flug statt nur des Auftrags im Blick — außer Blick wartet auf eine leere Bahn (_foundryPumpe, _blickRang)`);
    else if (rg.bahnen) {
        const B = rg.bahnen;
        const koepfe = [B.leib, B["export-settlement"]];
        const hinter = ["tor0", "tor1", "tor2", "tor3"].filter((t) => B[t] && koepfe.includes(B[t]));
        if (koepfe.includes("w0") || koepfe[0] === koepfe[1]) out.push(`der Kopf der Ankunft geht nicht in eine Bahn ohne Arbeit (Leib → ${B.leib}, Dorf-Export → ${B["export-settlement"]}; das Werk w0 malt den Blatt-Atlas) — der Bild-Rang der Bahn fehlt (_foundryPumpe, _foundryRang)`);
        if (hinter.length) out.push(`${hinter.join(", ")} stellen sich hinter einen Kopf der Ankunft (${hinter.map((t) => B[t]).join(", ")}) — sie warten auf den Export (3,4–5,4 s) bzw. den Leib`);
    }
    if (rg && rg.nachBild && rg.vorBild === "blick" && rg.nachBild !== "hinten,blick,vorrat") out.push(`nach dem ersten Bild sendet die Pumpe „${rg.nachBild}" statt nah zuerst rundum mit dem Vorrat („hinten,blick,vorrat") — der Blick-Schlüssel überlebt das Bild (_rangImErstenBlick)`);
    const rb = m.rundblick;
    if (!rb || !(rb.N > 0)) out.push("der Rundblick nach der Kontrolle: keine Probe (`RUNDBLICK_BILDER` fehlt im Stamm)");
    else if (!rb.spaet) out.push("der Rundblick ohne späten Baum (Vorbedingung)");
    else if (rb.griff !== 40) out.push(`die Pflanz-Schlange setzt die ferne Eiche vor den späten Baum (Griff ${rb.griff} m, \`_tickPendingVegSpawns\`)`);
    else if (rb.loecher > 0) out.push(`der Rundblick nach der Kontrolle zählt ${rb.loecher} Löcher in ${rb.N} Takten — zuerst ${rb.erstes}`);
    // DIE TERM-DECKUNG: jeder Term von `WELTBILD_TERME` hat einen Fall, der den Ladeschirm hält; ein Fall nennt nur
    // Terme der Liste
    const terme = m.terme;
    if (!Array.isArray(terme) || !terme.length)
        out.push("die Terme des ersten Weltbilds fehlen (`WELTBILD_TERME`) — die Linse sieht nicht, was das Bild hält");
    else {
        const gedeckt = new Set();
        for (const [k, z] of Object.entries(f)) {
            for (const t of (z && z.terme) || []) {
                if (!terme.includes(t)) out.push(`der Fall ${k} nennt den Term „${t}“, den WELTBILD_TERME nicht trägt`);
                else if (!z.weg) gedeckt.add(t);
            }
        }
        for (const t of terme)
            if (!gedeckt.has(t)) out.push(`der Term „${t}“ des ersten Weltbilds hat keinen Fall, der den Ladeschirm hält (L2a)`);
    }
    if (!f.allesSteht || !f.allesSteht.weg) out.push(`steht alles, bleibt der Ladeschirm („${(f.allesSteht && f.allesSteht.stand) || ""}"${m.fehltNachBoot && m.fehltNachBoot.length ? `, nach dem Boot fehlt ${m.fehltNachBoot.join(" · ")}` : ""})`);
    if (!f.lueckeRuht) out.push(`eine ruhende Lücke: ${ohne("lueckeRuht")}`);
    else if (!f.lueckeRuht.weg) out.push("eine ruhende Lücke hält den Spieler vor der Welt fest");
    else if (!f.lueckeRuht.warn) out.push("eine ruhende Lücke weicht ohne Wort im Log");
    if (!f.lueckeArbeitet) out.push(`eine arbeitende Lücke: ${ohne("lueckeArbeitet")}`);
    else if (f.lueckeArbeitet.weg)
        out.push("eine arbeitende Lücke weicht wie eine ruhende (das halbe Weltbild unter Last, Prüfung K60-1 m1-6B)");
    if (!f.lueckeFlackert) out.push(`eine flackernde Lücke: ${ohne("lueckeFlackert")}`);
    else if (!f.lueckeFlackert.weg) out.push("eine flackernde Lücke hält den Ladeschirm ohne Grenze (kein Deckel)");
    else if (!f.lueckeFlackert.warn) out.push("eine flackernde Lücke weicht ohne Wort im Log");
    const g = m.weichtGanz;
    if (!g) out.push("das Weichen des Ladeschirms: kein Fall (Vorbedingung)");
    else if (!g.hidden || g.display !== "none" || g.animationen)
        out.push(
            `der Ladeschirm weicht nicht aus dem Layout (hidden ${g.hidden}, display ${g.display}, ${g.animationen} laufende ` +
                "Animationen) — er liegt unsichtbar über der Leinwand"
        );
    const th = m.tastenHinter;
    if (!th) out.push("Tasten hinter dem Ladeschirm: keine Probe (Vorbedingung)");
    else {
        if (th.w) out.push("hinter dem Ladeschirm läuft W den Spieler");
        if (th.enter === "chat-input") out.push("hinter dem Ladeschirm öffnet Enter das Gespräch");
        if (th.omnibox == null) out.push("Strg+K hinter dem Ladeschirm: keine Omnibox (Vorbedingung)");
        else if (th.omnibox) out.push("hinter dem Ladeschirm öffnet Strg+K die Omnibox");
    }
    if (!m.nachBootWeg) out.push("nach dem Boot (Null-Renderer) steht der Ladeschirm über der UI");
    if (m.schleifeFragt === false) out.push("die Render-Schleife fragt das Weltbild nicht (`_loopRender` → `_ankunftsBild`)");
    const A = m.ankunft; // DIE ANKUNFT AUS DER FERNE (B2): das erste Weltbild verlangt je Ding die billigste ganze Stufe
    if (!A || !A.n) out.push("die Ankunft aus der Ferne: keine Probe oder kein Ding der Mesh-Zone (Vorbedingung)");
    else {
        if (A.fein.length) out.push(`das erste Weltbild wartet auf eine feinere Stufe als die billigste ganze: ${A.fein.slice(0, 4).join(", ")}`);
        if (A.nahKarte !== 2) out.push(`ein naher Baum wünscht vor dem ersten Weltbild L${A.nahKarte} statt seiner Karte`);
        if (A.nahDanach === 2) out.push("nach dem ersten Weltbild verfeinert die Gestalt nie (der nahe Baum bleibt Karte)");
        if (A.zwilling.length) out.push(`der Kalt-Schätzer wählt anders als der Stufen-Takt: ${A.zwilling.slice(0, 3).join(", ")}`);
        if (A.soll == null) out.push("die Ferne: keine Probe");
        else if (A.wahl !== A.soll) out.push(`die Ferne hält die Stufe: das Tor in ${A.dB} m wählt L${A.wahl} statt L${A.soll}`);
    }
    // DER VORRAT HAT KEINEN LESER IM ERSTEN BILD: während er läuft, wartet das Bild auf nichts, was er bestellt, und
    // er bestellt keine Karte (die Karte bestellt ihr Leser, nah zuerst)
    const v = m.vorrat;
    // ohne Phase im Stamm nennt die Linse das zuerst (am Vor-Stand sagte der Merker nur „an" — die Probe sieht ihn nicht anlaufen)
    if (v && !v.PH)
        out.push("der Vorrat nennt keine Phase (`VORRAT_PHASE` fehlt im Stamm) — die Kalt-Zeile liest „läuft\", wo er wartet");
    if (!v) out.push("der Vorrat: keine Probe (Vorbedingung)");
    else if (v.fehler) out.push(`der Vorrat: ${v.fehler} (Vorbedingung)`);
    else {
        const liste = (v.ohneLeser || []).join(", ") || "keine";
        if (v.fehltNeu && v.fehltNeu.length)
            out.push(
                `während der Vorrat läuft, wartet das erste Weltbild („${v.fehltNeu.join(" · ")}") auf Aufträge ohne Leser des ` +
                    `ersten Frames: ${liste}`
            );
        if (v.karten > 0)
            out.push(
                `der Vorrat bestellt ${v.karten} Karten nach der Buchgröße (${(v.kartenBsp || []).join(", ")}), das erste Weltbild ` +
                    "wartet auf jede (die Karten-Schlange) — die Karte bestellt ihr Leser"
            );
        if (v.vorBild && v.vorBild.length)
            out.push(
                `vor dem ersten Weltbild bestellt der Vorrat ${v.vorBild.length} Aufträge ohne Leser des ersten Frames ` +
                    `(${v.vorBild.slice(0, 4).join(", ")}${v.vorBild.length > 4 ? ", …" : ""}) — die Leser warten in seiner Schlange`
            );
        // DER MERKER NENNT DIE PHASE: wartend „wartet auf das erste Bild", je Bestellung „bestellt" (die Kalt-Zeile)
        const PH = v.PH;
        if (PH) {
            if (v.phaseStart !== PH.wartet || v.phaseVorBild !== PH.wartet)
                out.push(
                    `solange der Vorrat auf das erste Bild wartet, sagt sein Merker \`f._vorrat\` ${JSON.stringify(v.phaseVorBild)} ` +
                        `(beim Start ${JSON.stringify(v.phaseStart)}) statt „${PH.wartet}" — die Kalt-Zeile liest ihn`
                );
            const falsch = (v.phaseBestellung || []).filter((z) => !z.endsWith(JSON.stringify(PH.bestellt)));
            if (falsch.length)
                out.push(`der Vorrat bestellt, ohne dass sein Merker „${PH.bestellt}" sagt: ${falsch.slice(0, 3).join(", ")}`);
        }
        if (v.ende !== true) out.push("der Vorrat endet nicht (`f._vorrat` bleibt an)");
        else if (!(v.nachBild > 0) && !(v.vorBild && v.vorBild.length))
            out.push("der Vorrat bestellt nie — die Wagen und die Siedlung bleiben kalt");
        if (!v.streu) out.push("die Streu-Region unter dem Vorrat: keine Probe (Vorbedingung)");
        else if (v.streu.aufgeschoben)
            out.push(
                `während der Vorrat läuft, wartet eine neue Streu-Region auf ihn (leer aufgeschoben, ${v.streu.zellen} Zellen) statt ` +
                    `auf ihr Asset — das erste Weltbild wartet mit ihr auf: ${liste}`
            );
    }
    // DIE ZUSAGE DES WALD-PLANS (B-Wald): sie kommt mit den Zellen ihres Kastens, nie erst mit der leeren Schlange
    const W = m.wald || {};
    if (!(W.ferne > 0) || W.steht !== false || !W.zusage) out.push(`die Zusage des Wald-Plans: kein Fall (ferner Kasten ${W.ferne} Zellen, der Plan am Ort steht ${W.steht}, Zusage ${W.zusage}) (Vorbedingung)`);
    else if (!(W.rest > 0)) out.push(`die Zusage des Wald-Plans kam ${W.kam ? "erst mit der leeren Schlange" : "nicht in 60 s"} — sie wartete auf ${W.ferne} Zellen außerhalb ihres Kastens (\`_waldPlanZusage\`)`);
    // B-Blick (13, 14)
    const [Bl, Tk] = [m.blick || { n: [] }, m.takt || {}];
    out.push(...[!(Bl.n[0] && Bl.n[1]) && "das Bild der Ankunft: kein Fall (Vorbedingung)", Bl.n[0] && !Bl.vor1 && "das halbe Weltbild: die Streu-Region steht vor ihren Zellen im Blick", Bl.vor1 && (!Bl.geweckt || Bl.vor2) && "das Weltbild wartete auf 1 Zusage außer Blick (_streuWeckerSpannen)", Bl.geweckt && !Bl.vor2 && !Bl.nach2 && "der Rundblick vergisst die Zusage außer Blick", !(Tk.lief >= 0) ? "der Lade-Takt: kein Fall (Vorbedingung)" : Tk.lief < 4 && `die Streu setzte im Lade-Takt ${4 - Tk.lief} von 4 Takten aus`].filter(Boolean));
    // DIE KÖPFE DER ANKUNFT UND DER BILD-RANG (B5): kein Leser im Blick bestellt ortlos, der Leib in der Ego-Sicht nur seine
    // Grobstufe (die feine nach dem Bild, dann der Tausch), das Buch den Export des fälligen Start-Dorfs
    const K = m.koepfe;
    if (!K) out.push("die Köpfe der Ankunft: keine Probe (Vorbedingung)");
    else if (K.fehler) out.push(`die Köpfe der Ankunft: ${K.fehler} (Vorbedingung)`);
    else {
        for (const wer of ["die Nah-Wiese", "der Gesetz-Fit"]) if (!K.orte.some((o) => o.wer === wer)) out.push(`${wer} bestellt vor dem Bild nichts (die Probe des Bild-Rangs ist vakuös)`);
        for (const o of new Set(K.orte.filter((o) => !o.blick).map((o) => `${o.wer} ${o.art}`))) out.push(`vor dem ersten Bild bestellt ${o} ohne den Ort ihres Lesers (Rang ∞, \`_foundryAuftragD2\`) — die Lücke im Blick wartet auf eine leere Bahn`);
        const L = K.leib;
        const b = L.bestellt.join(", ");
        if (L.fehler) out.push(`der Leib: ${L.fehler} (Vorbedingung)`);
        else {
            if (!b.includes("vor L1 Kopf")) out.push(`vor dem ersten Bild geht die Grobstufe des Leibs ohne Kopf-Rang in die Schlange (${b}) — sie wartet im Werk hinter dem Blatt-Atlas (_foundryRang)`);
            if (b.includes("vor L0")) out.push(`vor dem ersten Bild bestellt der Leib in der Ego-Sicht seine feine Stufe (${b}) — das Bild zeigt nur den Wurf der Grobstufe`);
            if (!L.ohneFein) out.push("der Leib wartet vor dem Bild auf seine feine Stufe (mensch L0, `_leibBereit`), die Grobstufe steht");
            else if (L.baut[0] !== "vor 1") out.push(`vor dem Bild baut der Leib ohne die Grobstufe als Nah-Gestalt (nahStufe: ${L.baut.join(", ")})`);
            if (!b.includes("nach L0")) out.push(`nach dem ersten Bild bestellt der Leib seine feine Stufe nie (${b})`);
            else if (!L.baut.includes("nach 0")) out.push("die feine Stufe kam nach dem Bild, der Leib tauscht sie nie ein (`_leibFeinTausch`)");
        }
        if (K.dorf.ohne) out.push(`das Start-Dorf beim Buch: ${K.dorf.ohne} (Vorbedingung)`);
        else if (K.dorf.export && !K.dorf.kopfRang) out.push("der Export des Start-Dorfs geht ohne Kopf-Rang in die Schlange — hinter ihm wartet jeder Auftrag seiner Bahn (_foundryRang)");
        else if (!K.dorf.export) out.push(`mit dem Buch geht der Export des fälligen Start-Dorfs nicht hinaus${K.dorf.kopf ? "" : " (kein Wecker `_startDorfAmBuch` am Buch)"} — er wartet auf den Siedlungs-Takt im Leerlauf des Streamings`);
    }
    return out;
}
function kreuzVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.da) return ["kein Fadenkreuz"];
    if (!m.sichtbar) out.push("das Fadenkreuz ist unsichtbar");
    if (!(Math.abs(m.dx) <= 1 && Math.abs(m.dy) <= 1)) out.push(`das Fadenkreuz steht ${m.dx}/${m.dy} px neben der Mitte`);
    if (m.mitSchublade) out.push("das Fadenkreuz steht über der offenen Werkstatt");
    if (!m.nachSchublade) out.push("nach der Werkstatt fehlt das Fadenkreuz");
    return out;
}
function hilfeVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    for (const wort of ["hilfe", "help", "?"]) {
        const z = (m.antworten || {})[wort] || {};
        if (z.unbekannt) out.push(`„${wort}" ist unbekannt („${z.erste}")`);
        else if (z.fehlt && z.fehlt.length) out.push(`„${wort}" nennt ${z.fehlt.length} Beispiel(e) der Tafeln nicht (${z.fehlt.slice(0, 3).join(" · ")})`);
        if (z.tastenFehlen && z.tastenFehlen.length) out.push(`„${wort}" nennt ${z.tastenFehlen.length} Taste(n) nicht (${z.tastenFehlen.slice(0, 3).join(" · ")})`);
        if (!z.v1) out.push(`„${wort}" nennt keinen v1-Satz`);
    }
    if (m.unbekanntListe) out.push("der Satz für Unbekanntes trägt eine Liste von Hand");
    return out;
}
function gespraechVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (m.enterFokus !== "chat-input") out.push(`Enter öffnet das Gespräch nicht (Fokus ${m.enterFokus})`);
    if (m.wImFeld) out.push("W läuft beim Tippen im Feld");
    if (!m.gesendet) out.push("Enter im Feld sendet nicht");
    if (m.nachSenden === "chat-input") out.push("nach dem Senden bleibt der Fokus im Feld (W tippt „w\")");
    if (!m.wNachSenden) out.push("nach dem Senden läuft W nicht");
    if (m.nachEsc === "chat-input") out.push("Esc gibt die Welt nicht zurück");
    if (m.enterAufKnopf == null) out.push("kein Knopf für die Probe (Vorbedingung)");
    else if (m.enterAufKnopf !== "knopf") out.push(`Enter auf einem fokussierten Knopf öffnet das Gespräch und nimmt ihm den Fokus (${m.enterAufKnopf})`);
    return out;
}
function gurtVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.buch) return ["Buch kalt (Vorbedingung)"];
    const belegt = (m.hotbar || []).filter(Boolean);
    if (!belegt.length) out.push("der Start-Gurt ist leer");
    for (const e of m.eintraege || []) {
        if (!e.sichtbar) out.push(`${e.name} ist im Katalog versteckt${e.altDoppel ? ` (Alt-Doppel → ${e.altDoppel})` : ""}`);
        else if (!e.art) out.push(`${e.name} ist kein Studio-Werk`);
        else if (!e.platzierbar) out.push(`${e.name} lässt sich nicht setzen`);
    }
    const arten = (m.eintraege || []).map((e) => e.art).filter(Boolean);
    const doppelt = arten.filter((a, i) => arten.indexOf(a) !== i);
    if (doppelt.length) out.push(`Studio-Art doppelt im Gurt: ${doppelt.join(", ")}`);
    const fehlt = (m.katalogArten || []).filter((a) => !arten.includes(a));
    if (fehlt.length) out.push(`Studio-Art ohne Werk im Gurt: ${fehlt.join(", ")}`);
    return out;
}
function kameraVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.baum) return ["kein Studio-Baum als Eintrag (Vorbedingung)"];
    if (!(m.stammSkala >= 0.95 * m.weltSkala)) out.push(`Stamm-Hülle im Vorlagen-Maß (× ${m.stammSkala} statt × ${m.weltSkala})`);
    for (const k of ["fuss", "ritt"]) {
        const z = (m.wege || {})[k];
        if (!z || !(z.proben > 0)) {
            out.push(`${k}: keine Probe (Vorbedingung${z && z.grund ? ": " + z.grund : ""})`);
            continue;
        }
        if (z.pflanzeHaelt > 0)
            out.push(`${k}: eine Pflanze hält die Kamera in ${z.pflanzeHaelt} von ${z.proben} Proben (Arm ${z.armIst} statt ${z.armSoll} m im Median, Täter ${(z.taeter || []).join(", ")})`);
        if (z.spruengePflanze > 0) out.push(`${k}: ${z.spruengePflanze} Sprünge > ${z.sprungM} m je Bild, die keine Bau- oder Boden-Kante erzwingt (${z.spruenge} gegen ${z.spruengeSoll})`);
        if (z.hinausSprung > 0) out.push(`${k}: die Kamera springt ${z.hinausSprung}× hinaus (> ${z.sprungM} m je Bild)`);
    }
    if (!(m.stoffe > 0)) out.push("kein Pflanzen-Stoff in der Szene (Vorbedingung)");
    if (m.stoffeOhne > 0) out.push(`${m.stoffeOhne} von ${m.stoffe} Pflanzen-Stoffen ohne Durchsicht (${(m.stoffeOhneArten || []).join(", ")})`);
    if (m.schattenGeschnitten > 0) out.push(`${m.schattenGeschnitten} Pflanzen-Stoff(e) schneiden die Durchsicht auch in den Schatten`);
    if (m.zielFolgt === false) out.push(`das Ziel der Durchsicht folgt der Brust nicht (${m.zielAbstand} m daneben)`);
    if (!(m.kreuzAbstand >= 0.35)) out.push(`das Fadenkreuz steht in 3rd auf der Figur (${m.kreuzAbstand} m vom Strahl der Bildmitte)`);
    const fk = m.fadenkreuz || {};
    if (!(fk.stellungen > 0)) out.push("Fadenkreuz-Strahl: keine Stellung (Vorbedingung)");
    if (!fk.kreatur) out.push("Fadenkreuz-Strahl: keine Kreatur vor dem Spieler (Vorbedingung)");
    for (const [fn, ok] of Object.entries(m.konsum || { "die Konsum-Probe": false }))
        if (ok !== true) out.push(`Konsum: \`${fn}\` ${ok === null ? "ohne Vorbedingung (keine Streu nah)" : "ruft sein Gesetz nicht"}`);
    for (const [fn, n] of Object.entries(fk.hinten || {}))
        if (n > 0) out.push(`Fadenkreuz-Strahl: \`${fn}\` trifft in ${n} von ${fk.stellungen} Stellungen HINTER dem Spieler (was zwischen Kamera und Spieler liegt)`);
    // Das Ziel der Kamera liegt auf ihrem Blick: dann steht die Ebene
    // des Strahls senkrecht zum Blick und er beginnt bei jedem Arm am Blickpunkt.
    if (fk.stellungen > 0 && !(fk.zielAchse <= 0.01))
        out.push(`Fadenkreuz-Strahl: das Ziel der Kamera liegt ${fk.zielAchse} m neben ihrem Blick (bei kurzem Arm beginnt der Strahl hinter dem Blickpunkt)`);
    const ds = m.durchsicht || {};
    if (!ds.formel) out.push("Durchsicht: keine EINE Formel (`_durchsichtGewicht` + `DURCHSICHT_ZAHLEN`), die Linse und Stoff teilen");
    else {
        for (const [k, name] of [
            ["first", "1st am Stamm"],
            ["third", "3rd, der Stamm VOR dem Spieler"],
        ]) {
            const z = ds[k];
            if (!z || !(z.anlaeufe > 0)) out.push(`Durchsicht ${name}: kein Anlauf (Vorbedingung)`);
            else if (z.faellt > 0)
                out.push(`Durchsicht ${name}: die Rinde fällt in ${z.faellt} von ${z.anlaeufe} Anläufen (Auge ${Math.min(...z.abstand)}–${Math.max(...z.abstand)} m vom Stamm, Gewicht ab ${z.wMin})`);
        }
        const zw = ds.zwischen;
        if (!zw || !(zw.stellungen > 0)) out.push("Durchsicht 3rd, der Stamm zwischen Kamera und Spieler: keine Stellung (Vorbedingung)");
        else if (zw.wirkt < zw.stellungen) out.push(`Durchsicht 3rd: der Stamm zwischen Kamera und Spieler steht in ${zw.stellungen - zw.wirkt} von ${zw.stellungen} Stellungen (Gewicht bis ${zw.wMax})`);
    }
    return out;
}
const ID_RE = /\b(?:baum|haus|fahrzeug|tor|klinge|welt|ruestung|trank|koerper|reittier)_[a-z0-9_]+/;
const TELE_RE = /\b[a-zA-Z]+=\S|FOUNDRY|\bSeed\b|Slots? übersprungen|export-settlement|BLOCKIERT|\["[a-z_]+",|op_exception|budget_exceeded|unknown_op/;
function kanalVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    for (const z of m.zeilen || []) {
        if (/^> /.test(z)) continue;
        if (ID_RE.test(z)) out.push(`interne id im Chat („${z.slice(0, 80)}")`);
        else if (TELE_RE.test(z)) out.push(`Telemetrie im Chat („${z.slice(0, 80)}")`);
    }
    if (!m.siedlungImLog) out.push("die Siedlungs-Zahlen fehlen im Log (Vorbedingung: das Log trägt sie)");
    return out;
}
function kiVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (/^Aktiv/.test(m.status || "")) out.push(`der Status sagt „${m.status}" ohne Dienst`);
    else if (!/läuft nicht/.test(m.status || "")) out.push(`der Status nennt die Ursache nicht („${(m.status || "").slice(0, 70)}")`);
    if (!m.ohneSchluessel) out.push("ohne Schlüssel schweigt der Chat");
    else if (!/Schlüssel/.test(m.ohneSchluessel)) out.push(`ohne Schlüssel nennt der Chat ihn nicht („${m.ohneSchluessel.slice(0, 70)}")`);
    if (!(m.proxyUrl || "").startsWith(m.ursprung)) out.push(`der Proxy fragt einen fremden Server (${m.proxyUrl})`);
    if (!/Proxy fehlt/.test(m.proxyFehler || "")) out.push(`der fehlende Proxy heißt „${(m.proxyFehler || "").slice(0, 70)}"`);
    return out;
}
function dorfVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!m.buch) return ["Buch kalt (Vorbedingung)"];
    if (!(m.haeuser > 0)) return ["kein Haus gegründet"];
    if (m.hinten > 0) out.push(`${m.hinten} Häuser hinter dem Spieler (cos ${m.cosHinten.join(" / ")})`);
    if (m.ausserBild > 0) out.push(`${m.ausserBild} Häuser außerhalb des Bildwinkels`);
    if (m.gesperrtSteht) out.push(`ein gesperrter Slot steht (${m.gesperrtAbstand} m von der Mitte des Baus${m.gesperrtImBau ? ", im Bau" : ""})`);
    else if (!m.gesperrtLaut) out.push(`ein gesperrter Slot fällt still (${m.gesperrtGrund})`);
    if (m.mpAbweichung == null) out.push(`der Mitspieler: kein Vergleich (Häuser ${(m.mpHaeuser || []).join(" / ")})`);
    else if (m.mpAbweichung > 1) out.push(`beim Mitspieler steht das Dorf ${m.mpAbweichung} m daneben (Häuser ${(m.mpHaeuser || []).join(" / ")})`);
    return out;
}
// LH (w4-ankunft-2): was das erste Bild nicht liest, hält seinen Haupt-Faden nicht — die Hülle eines Baums (Kollision) wächst nach
// dem Bild, bis dahin offen in der Welt; der Ring außer Bild baut unter dem Ladeschirm nur im Leerlauf und kommt sicher.
// m.h = [Skelette vor dem Bild, offen vor dem Bild, Hüllen-Boxen danach, offen danach] · m.r = [hinten ohne Leerlauf, vorn,
// Leerlauf-Ruf, hinten mit Leerlauf]
function huelleVerdict(m) {
    if (!m || !m.h || !m.r) return ["start"];
    const [[wuchs, offen, boxen, rest], [ohne, vorn, ruf, mit]] = [m.h, m.r];
    return [
        wuchs && "die Hülle wuchs vor dem Bild (`_baumGestaltTeile`)",
        !offen && "die wartende Hülle steht nicht offen (`_weltOffen`)",
        (!boxen || rest) && "nach dem Bild fehlt die Hülle (`_tickHuellenNach`)",
        ohne && "der Ring baut außer Bild ohne Leerlauf (`_tickVoxelChunkStreaming`)",
        !vorn && "der Ring baut das Bild nicht",
        !(ruf && mit) && "der Ring außer Bild kommt nie (`_ringLeerlauf`)",
    ].filter(Boolean);
}

// ── DIE STATISCHE WAND (Node, der EINE Absenz-Helfer; `quelle` wandelt den Stamm im Selbsttest). Liefert [name, ok]. ──
function wand(quelle) {
    const fehlt = (g, re) => stammLib.fehlt(g, re, quelle);
    // die Proben durch die Bildmitte ohne Verhaltens-Band rechnen keine eigene Richtung ab der Kamera
    const kreuzEigen = ["_pickScatterAtCrosshair", "_hasMagnifyingInSight", "_kampfKlingenAchse"].filter(
        (n) => !fehlt(n, /getWorldDirection\(/)
    );
    return [
        ["W1 der Satz für Unbekanntes trägt keine Befehlsliste von Hand", fehlt("_chatHandleConversationalFallback", /'Setze Wetter rainy'/)],
        ["W6 kein rohes Programm im Spieler-Chat (kein `JSON.stringify(reply.program)`)", fehlt(null, /JSON\.stringify\(reply\.program\)/)],
        ["W8 das Buch fragt die Köpfe der Ankunft (`_buchKoepfe` in `_foundryIngestBook`, B5)", !fehlt("_foundryIngestBook", /this\._buchKoepfe\(\)/)],
        [`W7 Streu-Pick, Lupe und Klingen-Achse rechnen keine eigene Richtung ab der Kamera (\`getWorldDirection\`)${kreuzEigen.length ? " — mit: " + kreuzEigen.join(", ") : ""}`, kreuzEigen.length === 0],
    ];
}

// LS: die Dateien der späten Module hält der Server, bis die Takte vor ihrem Laden liefen (`frei`; der Zeuge ist welt-boots)
const SPAET_DATEIEN = stammLib.spaeteVon(stammLib.karteVon(ROOT));
let frei;
const freigabe = new Promise((f) => (frei = f));
const server = statikServer({ wandle: (p, roh) => (SPAET_DATEIEN.has(p.slice(1)) ? freigabe.then(() => roh) : roh) });

// ── DIE PROBEN IN DER SEITE (r = die Welt). ──
async function probe(arg) {
    const out = {};
    await window.__weltDa();
    const tick = async (n, ms) => {
        for (let i = 0; i < n; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch {}
            await sleep(ms || 30);
        }
    };
    // eine Taste an `ziel` (keydown · keyup · keypress) und der Fokus beim Namen
    const taste = (ziel, typ, key, code = key, mehr) => ziel.dispatchEvent(new KeyboardEvent(typ, { key, code, bubbles: true, ...mehr }));
    const fokus = (a = document.activeElement) => (a ? a.id || a.tagName : null);
    // der Spion am Ruf: lieferer[name] zählt (und delegiert), solange wer.methode(...args) läuft — true = gerufen
    const ruft = (wer, methode, lieferer, name, args) => {
        const eigen = Object.prototype.hasOwnProperty.call(lieferer, name);
        const echt = lieferer[name];
        let n = 0;
        lieferer[name] = function (...x) {
            n++;
            return echt.apply(this, x);
        };
        try {
            wer[methode](...args);
        } catch {
            /* ein Wurf nach dem Ruf entwertet den Konsum nicht */
        } finally {
            if (eigen) lieferer[name] = echt;
            else delete lieferer[name];
        }
        return n > 0;
    };
    const zeilen = () => Array.from(document.querySelectorAll("#chat-output > div")).map((d) => d.textContent);
    const buch = await r._foundryAwaitBook(45000);
    await tick(30, 30);
    // ── L2a: das erste Weltbild ──
    try {
        const m = { gestartet: false, faelle: {}, ohneFall: {}, ...window.__ladeHtml };
        out.lade = m;
        m.terme = AnazhRealm.WELTBILD_TERME ? Array.from(AnazhRealm.WELTBILD_TERME) : null;
        const ls = document.getElementById("ladeschirm");
        m.nachBootWeg = !ls || ls.hidden || ls.classList.contains("weg");
        // die Render-Schleife fragt das Weltbild, solange es nicht steht (Spion am Ruf)
        const daVor = st._weltbildDa;
        st._weltbildDa = 0;
        m.schleifeFragt = ruft(r, "_loopRender", r, "_ankunftsBild", [performance.now()]);
        st._weltbildDa = daVor;
        if (ls) {
            // Die Welt wächst, bis sie steht (`_weltbildFehlt` leer, höchstens 90 s) — vor dem Rundblick im Blick, vor den Fällen
            // RUNDUM: die Mesh-Zone des Null-Renderers atmet je Takt mit dem Regler, und die Fälle hinter dem Spieler drehen die
            // Kamera — ein Baum im Werden dort hielte jeden Fall (CI f25740f8: bodenHinten und baumHinten „1 Bäume und Bauten wachsen")
            const steht = async (rundum) => { for (const weiter = window.__deckel("das Weltbild", 1500); r._weltbildFehlt(rundum).length && weiter(); ) await tick(5, 60); return r._weltbildFehlt(rundum); }; // prettier-ignore
            m.fehltNachBoot = await steht();
            // DER RUNDBLICK (B3d): nach der Kontrolle (der EINE Schreiber, der Nachlauf beginnt) dreht die Kamera in RUNDBLICK_BILDER
            // Takten ganz herum; je Takt zählt das Tor die Löcher in seinem Blick, in der kleinsten Mesh-Zone seit der Kontrolle.
            // DER SPÄT GESÄTE BAUM (CI Gruppe 1 seit 4a5f5e2c, 6 von 13 Läufen: „1 Bäume werden gepflanzt" bei 195°, rundum erst ab
            // Takt 71–80): hinter den fernen Bäumen der Pflanz-Schlange wartet einer 40 m hinter dem Spieler — die Schlange setzt nah
            // zuerst (Lehre 25, `_tickPendingVegSpawns`); als FIFO zählte der Rundblick ihn 57-mal. Die Linse sät ihn selbst, eine
            // Eiche (`baum_eiche`, der Träger des Katalogs): bis 31.10. kopierte sie den ersten Eintrag der Schlange, und war die im
            // Boot schon leer (main b4bcf19: 1 von 3 Läufen headless), fehlte die Vorbedingung — mit ihr jede Probe des Rangs. Den
            // Rang prüft EIN Griff, in jedem Boot gleich: eine ferne Eiche im Blick vor ihm, nah zuerst rundum nimmt den späten (FIFO
            // und ein Blick-Rang nach dem Bild nähmen die ferne)
            const rb = (m.rundblick = { N: AnazhRealm.RUNDBLICK_BILDER, loecher: 0, erstes: null, rundumAb: null });
            const [pp, Q] = [st.playerMesh.position, st.pendingVegSpawns || []];
            const eiche = (s, x = pp.x - s * Math.sin(st.yaw), z = pp.z - s * Math.cos(st.yaw)) => ({ name: "baum_eiche", position: { x, y: r._voxelSurfaceY(x, z) + 0.5, z }, opts: { seed: s, silent: true } }); // prettier-ignore
            st.pendingVegSpawns = [eiche(-300), eiche(40)];
            r._naturSetzen = (n, p, o) => (rb.griff = o.seed);
            try {
                r._tickPendingVegSpawns(1);
            } finally {
                delete r._naturSetzen;
                rb.spaet = (st.pendingVegSpawns = Q).push(eiche(40));
            }
            r._weltbildSteht();
            for (let i = 1, yaw0 = st.yaw, Rmin = st.architectureCullingRadius; i <= rb.N && r._imErstenBlick; i++) {
                st.yaw = yaw0 + (2 * Math.PI * i) / rb.N;
                await tick(1, 10);
                const [Rj, L] = [st.architectureCullingRadius, ((st.architectureCullingRadius = Rmin = Math.min(Rmin, st.architectureCullingRadius)), r._weltbildLuecken())];
                const n = L.reduce((s, l) => s + (l.n || 1), (st.architectureCullingRadius = Rj) && 0);
                if (n && !rb.erstes) rb.erstes = `Takt ${i} (${Math.round((360 * i) / rb.N)}°): ${L.map((l) => l.satz).join(" · ")}`;
                [rb.loecher, rb.rundumAb] = [rb.loecher + n, rb.rundumAb != null || st._nachlauf != null ? rb.rundumAb : st._rundumDa ? i : -i];
            }
            await steht(true);
            // der Blick und sein Gegenteil (B3d): die Gier blickt auf einen Punkt bzw. kehrt ihm den Rücken, die Kamera folgt
            const [yawM, p0, merkDa0] = [st.yaw, st.playerMesh.position, st._weltbildDa];
            const vorn = (s) => ({ x: p0.x + s * Math.sin(yawM), y: p0.y, z: p0.z + s * Math.cos(yawM) });
            const blicke = (x, z, weg) => {
                const a = r._lodAuge();
                st.yaw = weg === undefined ? yawM : r._blickGierZu(x - a.x, z - a.z) + (weg ? Math.PI : 0);
                r._loopCamera(performance.now() / 1000);
            };
            // der Rang der Foundry-Schlange (`_foundryPumpe` über `_blickRang`): eine Bahn mit einem Auftrag im Flug, vor dem Bild geht nur
            // der Auftrag im Blick hinein (außer Blick nur in eine leere Bahn), danach nah zuerst rundum — der Vorrat ohne Ort (Rang ∞) eingeschlossen
            const pumpe = (da, g = [], f = { ready: true, worker: { postMessage: (x) => g.push(x.presetId) }, pending: new Map([["linse", null]]), reqSeq: 1 }) =>
                ((st._weltbildDa = da), [["hinten", -20], ["blick", 100], ["vorrat", null]].forEach(([n, s]) => r._foundryAuftrag(f, "linse", { type: "build-asset", presetId: n }, s == null ? null : vorn(s), 45000, "-")), g.join(","));
            m.rang = { vorBild: pumpe(0), nachBild: pumpe(merkDa0 || 1) };
            // DER BILD-RANG DER BAHN (B5): drei Fäden, das Buch ist da, das Werk malt den Atlas — Leib und Start-Dorf (Köpfe) gehen je in einen
            // Helfer ohne Arbeit, vier Tore im Blick nie hinter einen Kopf
            m.rang.bahnen = (() => {
                const [g, ziel] = [{}, (n) => ({ postMessage: (x) => (g[x.presetId || x.type] = n) })];
                const f = { ready: true, worker: ziel("w0"), helfer: [1, 2].map((k) => ({ k, w: ziel("w" + k), bereit: true })), pending: new Map(), reqSeq: 1, recipes: {}, blattAtlas: false }; // prettier-ignore
                const kopf = (wo) => (r._foundryRang ? r._foundryRang(wo, true) : wo);
                st._weltbildDa = 0;
                [["leib", kopf(p0)], ["export-settlement", kopf(0)], ...[0, 1, 2, 3].map((i) => ["tor" + i, vorn(10 + i)])].forEach(([n, rg]) => r._foundryAuftrag(f, "r", { type: /^tor|^leib/.test(n) ? "build-asset" : n, presetId: /^tor|^leib/.test(n) ? n : undefined }, rg, 45000, "-")); // prettier-ignore
                return g;
            })();
            st._weltbildDa = merkDa0;
            const stand = () => (document.getElementById("ladeschirm-stand") || {}).textContent || "";
            // ein Fall: den Ladeschirm wieder stellen, die Lücke schaffen, `_ankunftsBild` fragen, die Lücke schließen
            const fall = (name, schaffe, heile, vorbereiten) => {
                ls.hidden = false;
                ls.classList.remove("weg");
                st._weltbildDa = 0;
                st._weltbildLuecke = null;
                st._weltbildErsteFrage = null;
                // der Puffer rollt (maxLogEntries): gesucht wird in seinem Ende, vorher und nachher
                const warnt = () => st.logBuffer.slice(-30).filter((z) => /erste Weltbild steht ohne/.test(z)).length;
                const w0 = warnt();
                schaffe();
                if (vorbereiten) vorbereiten();
                const terme = r._weltbildLuecken().map((l) => l.term);
                r._ankunftsBild();
                const weg = ls.classList.contains("weg");
                m.faelle[name] = { weg, stand: stand(), warn: Math.max(0, warnt() - w0), terme };
                heile();
            };
            // ein Fall aus Tauschen: je [Objekt, Werte] die Werte setzen, danach jeden alten Wert zurück (ein fehlender fällt wieder)
            const fallMit = (name, ...paare) => {
                let zurueck = [];
                const tausch = ([o, w]) => {
                    const alt = Object.keys(w).map((k) => [k, Object.prototype.hasOwnProperty.call(o, k), o[k]]);
                    Object.assign(o, w);
                    return () => alt.forEach(([k, da, v]) => (da ? (o[k] = v) : delete o[k]));
                };
                fall(name, () => (zurueck = paare.map(tausch)), () => zurueck.reverse().forEach((z) => z()));
            };
            const nichts = () => {};
            // (1) ohne Boden: der Spieler in einem Chunk ohne Mesh
            const merkChunk = st.lastPlayerVoxelChunk;
            fall("ohneBoden", () => (st.lastPlayerVoxelChunk = { cx: 9000, cz: 9000 }), () => (st.lastPlayerVoxelChunk = merkChunk));
            // (1b) B-Blick: ein Stück Boden hinter dem Spieler hält das Bild nie
            const [spB, pk] = [r._voxelChunkConfig().span, merkChunk && `${merkChunk.cx},${merkChunk.cz + 2}`], eB = pk && st.voxelChunks.get(pk);
            if (eB) fall("bodenHinten", () => (blicke((merkChunk.cx + 0.5) * spB, (merkChunk.cz + 2.5) * spB, true), st.voxelChunks.delete(pk)), () => (st.voxelChunks.set(pk, eB), blicke()));
            // (2) ein Baum der Mesh-Zone ohne Gestalt (sein Mesh, seine Instanz beiseite), ab 30 m: im Blick hält er das Bild,
            // hinter dem Spieler nie (B3d)
            const pm = st.playerMesh.position;
            const dP = (a) => Math.hypot(a.position.x - pm.x, a.position.z - pm.z);
            const baum = st.architectures
                .filter((a) => a && /^baum_/.test(a.type || "") && r._archIsRendered(a) && dP(a) >= 30)
                .sort((a, b) => dP(a) - dP(b))[0];
            let merkBaum = null;
            const baumWeg = (hinten) => () => {
                blicke(baum.position.x, baum.position.z, hinten);
                merkBaum = { mesh: baum.mesh, instanced: baum.instanced };
                baum.mesh = null;
                baum.instanced = null;
            };
            const baumHer = () => {
                baum.mesh = merkBaum.mesh;
                baum.instanced = merkBaum.instanced;
                blicke();
            };
            if (baum) {
                m.baumD = +dP(baum).toFixed(1);
                fall("baumUngebaut", baumWeg(false), baumHer);
                fall("baumHinten", baumWeg(true), baumHer);
            } else {
                const n = st.architectures.filter((a) => a && /^baum_/.test(a.type || "")).length;
                m.ohneFall.baumUngebaut = m.ohneFall.baumHinten = m.ohneFall.lueckeRuht = m.ohneFall.lueckeFlackert = `kein gezeichneter Baum ab 30 m (${n} Baum-Einträge)`;
            }
            // (3b) der Streamer lief noch nie (keine Regionen-Karte) — der Fall des Befunds, in jedem Boot hergestellt
            const merkKarte = st.scatterRegions;
            fall("streuNie", () => delete st.scatterRegions, () => (st.scatterRegions = merkKarte));
            // (4) die Karte eines fernen Baums ist offen: ihr Leser steht 60 m vor bzw. hinter dem Spieler (sein Rang, B3d)
            const [zellen, K] = [r._impostorAtlas().zellen, "linse:karte"];
            for (const [k, s] of [["karteOffen", 60], ["karteHinten", -60]])
                fall(k, () => zellen.set(K, { key: K, _bedarfD2: r._foundryAuftragD2(vorn(s)) }) && (r._impostorBakeQueue = (r._impostorBakeQueue || []).concat([K])), () => zellen.delete(K) && (r._impostorBakeQueue = r._impostorBakeQueue.filter((q) => q !== K)));
            // (4b) die Welt fehlt (noch kein Spieler)
            const merkPm = st.playerMesh;
            fall("weltFehlt", () => (st.playerMesh = null), () => (st.playerMesh = merkPm));
            // (4b') der Leib des Spielers steht aus (K60-2: sein Guss kommt aus dem Faden, `_leibBereit`)
            const merkLeib = st._deferredAvatarSoul;
            fall("leibFehlt", () => (st._deferredAvatarSoul = "linse:leib"), () => (st._deferredAvatarSoul = merkLeib));
            // (4c) das Buch der Studios ist zu
            const fo = r._foundry;
            const merkBuch = fo ? fo.ready : undefined;
            if (fo) fall("buchZu", () => (fo.ready = false), () => (fo.ready = merkBuch));
            else m.ohneFall.buchZu = "die Foundry fehlt nach dem Boot";
            // (4d) ein gepflanzter Baum der Mesh-Zone steht noch in der Pflanz-Schlange (`pendingVegSpawns`, K60)
            for (const [k, s] of [["pflanzung", 0], ["pflanzungHinten", -60]]) {
                const pflanze = { name: "linse:pflanzung", position: vorn(s), opts: {} };
                fall(k, () => (st.pendingVegSpawns = (st.pendingVegSpawns || []).concat([pflanze])), () => (st.pendingVegSpawns = st.pendingVegSpawns.filter((t) => t !== pflanze)));
            }
            // (4d') der Chunk des Spielers liegt im Laub-Radius und wartet auf seine Saat (`pendingFoliageChunks`, K60-3: der
            // Radius wuchs, sein Wald war noch nicht in der Schlange)
            const sp = r._voxelChunkConfig().span;
            const saatKey = `${Math.floor(pm.x / sp)},${Math.floor(pm.z / sp)}`;
            const hatteSaat = !!(st.pendingFoliageChunks && st.pendingFoliageChunks.has(saatKey));
            if (st.voxelChunks && st.voxelChunks.has(saatKey) && !hatteSaat)
                fall(
                    "saat",
                    () => (st.pendingFoliageChunks = st.pendingFoliageChunks || new Set()).add(saatKey),
                    () => st.pendingFoliageChunks.delete(saatKey)
                );
            else
                m.ohneFall.saat = hatteSaat
                    ? `der Chunk des Spielers (${saatKey}) wartet nach dem Boot noch auf seine Saat`
                    : `der Chunk des Spielers (${saatKey}) steht nach dem Boot nicht`;
            // (4e) der Horizont steht nicht ganz: der Ring gehört zur Welt (der Linsen-Hook, headless ruht er sonst) und
            // ist noch nicht voll gezeichnet (`fr.ready`)
            fallMit("horizont", [window, { __anazhFernRing: true }], [st, { fernRing: { ready: false, cursor: 0, totalVerts: 1 } }]);
            // (4e') die Belichtung schrieb noch nicht aus dem Licht (S7)
            fallMit("licht", [st, { _belichtungSteht: false }]);
            // (4f) DAS DORF: fällig, im Export oder mit Häusern in der Schlange hält es das Bild (headless trägt der Hook)
            const dorfAn = [window, { __anazhAutoSettlement: true }];
            fallMit("dorfExport", dorfAn, [r, { _autoSettlementPendingKey: "start" }]);
            const dorfPlan = { name: "linse:dorf", slots: [{ kultur: "linse:dorf", x: 0, z: 0, y: pm.y }] };
            fallMit("dorfSchlange", dorfAn, [r, { _autoSettlementQueue: r._dorfZug(dorfPlan, { x: pm.x, z: pm.z }, "start") }]);
            // fällig: die Welt trägt noch kein Start-Dorf, der Spieler steht am Genesis-Ort, das Buch trägt den Dorf-Kanal
            const wmD = st.worldMeta || (st.worldMeta = {});
            const ohneStart = Object.assign({}, wmD.settlementCells || {});
            delete ohneStart.start;
            const gMD = r._genesisMitte();
            const nearD = (AnazhRealm.AUTO_SETTLEMENT || {}).nearM;
            const amOrt = gMD && Math.hypot(pm.x - gMD.x, pm.z - gMD.z) <= nearD;
            const kanal = r._autoSettlementChannelLive();
            if (amOrt && kanal) fallMit("dorfFaellig", dorfAn, [wmD, { settlementCells: ohneStart }], [r, { _autoSettlementStartHopeless: false }]);
            else
                m.ohneFall.dorfFaellig = !kanal
                    ? "das Buch trägt keinen Dorf-Kanal (`_autoSettlementChannelLive`)"
                    : `der Spieler steht ${gMD ? Math.round(Math.hypot(pm.x - gMD.x, pm.z - gMD.z)) : "?"} m vom Genesis-Ort (nearM ${nearD})`;
            // (5) alles steht
            fall("allesSteht", nichts, nichts);
            // (5b) DIE ANKUNFT AUS DER FERNE (B2): vor dem Bild die billigste ganze Stufe, danach Distanz und Grenzen wie der Takt
            const A = (m.ankunft = { n: 0, fein: [], zwilling: [] });
            const [merkDa, R, auge] = [st._weltbildDa, st.architectureCullingRadius || 150, r._lodAuge()];
            for (const da of [0, merkDa]) {
                st._weltbildDa = da;
                for (const e of st.architectures || []) {
                    const pre = e && e.position && r._foundryPresetForEntry(e);
                    const d = pre ? Math.hypot(e.position.x - auge.x, e.position.z - auge.z) : Infinity;
                    if (d > R) continue;
                    const w = r._foundryLodForEntry(e);
                    const G = !e._lodSpecies && r._archStufenGrenzen(e);
                    if (!da && ++A.n && r._foundryServierStufe(pre, w) !== r._foundryServierStufe(pre, 2)) A.fein.push(`${pre} ${Math.round(d)} m L${w}`);
                    else if (da && G && w !== AnazhRealm._stufeNachGrenzen(d, undefined, G, e.scale > 0 ? e.scale : 1)) A.zwilling.push(`${pre} ${Math.round(d)} m L${w}`);
                }
                A[da ? "nahDanach" : "nahKarte"] = r._chooseLODForDistance(2, undefined, 20); // ein Baum von 20 m in 2 m
            }
            st._weltbildDa = merkDa;
            // (5c) DIE FERNE IST KEIN ZUSTAND (w4-genesis-tore): ein Tor auf der Grobstufe der Ankunft (L2, `_lodAmAbstand` false), das Auge
            // im Band ihrer Hysterese (Grenze × (1 − h/2) — dort hält ein Zustand die L2); die EINE Wahl des Takts (`_archStufeUrteil`,
            // Wechsel, Band und Verdeckung schweigen) wünscht die Wahl am Abstand, sonst hält die Ferne (bis hier jedes Ring-Tor in 11 m auf
            // L2). Das Tor baut die Probe selbst: am Auge der Linse stand mal keiner im Band, mal kein Bau in der Mesh-Zone.
            const still = [r._switchArchitectureLOD, r._updateFoundryLodBand, r._lodSlotOcclusionRefresh];
            const tor = { type: "tor_drachentor", position: { x: 0, y: 0, z: 0 }, scale: 1, instanced: true, instFoundry: true, _lodLevel: 2 };
            const G = r._archStufenGrenzen(tor);
            const g2 = G && G.grenzen.find((g) => g.stufe === 2);
            if (g2) {
                const dB = g2.ab * (1 - (g2.h > 0 ? g2.h : G.h) / 2);
                Object.assign(r, { _switchArchitectureLOD: (e, l) => ((A.wahl = l), false), _updateFoundryLodBand() {}, _lodSlotOcclusionRefresh() {} });
                Object.assign(A, { soll: AnazhRealm._stufeNachGrenzen(dB, undefined, G, 1), wahl: 2, dB: Math.round(dB * 10) / 10 });
                try {
                    r._archStufeUrteil(tor, { x: dB, z: 0 }, false, r._archStufeZaehler());
                } finally {
                    [r._switchArchitectureLOD, r._updateFoundryLodBand, r._lodSlotOcclusionRefresh] = still;
                }
            }
            // (6) eine Lücke ruht (dieselbe Lücke länger als WELTBILD_STILL_MS): der Ladeschirm weicht LAUT
            const ruht = () => {
                st._weltbildLuecke = r._weltbildFehlt().join(" · ");
                st._weltbildLueckeSeit = performance.now() - (AnazhRealm.WELTBILD_STILL_MS || 0) - 1;
            };
            if (baum) fall("lueckeRuht", baumWeg(false), baumHer, ruht);
            // (6b) eine Lücke ARBEITET: ihr Satz blieb länger als WELTBILD_STILL_MS gleich, aber für sie
            // ist etwas unterwegs (das Buch im bootenden Studio-Faden) — der Ladeschirm bleibt, nie das halbe Bild unter Last
            if (fo && fo.worker)
                fall("lueckeArbeitet", () => (fo.ready = false), () => (fo.ready = merkBuch), ruht);
            else m.ohneFall.lueckeArbeitet = "kein Studio-Faden nach dem Boot";
            // (7) eine Lücke flackert
            // seit über einer Minute: der Ladeschirm weicht LAUT
            if (baum)
                fall("lueckeFlackert", baumWeg(false), baumHer, () => {
                    st._weltbildLuecke = "eine andere Zahl";
                    st._weltbildErsteFrage = performance.now() - (AnazhRealm.WELTBILD_DECKEL_MS || 60000) - 1;
                });
            // (8) Tasten hinter dem Ladeschirm: solange er steht, gehört keine Taste der Welt
            {
                ls.hidden = false;
                ls.classList.remove("weg");
                if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
                st.keys.w = false;
                taste(document.body, "keydown", "w", "KeyW");
                const wLief = st.keys.w === true;
                taste(document.body, "keyup", "w", "KeyW");
                taste(document.body, "keydown", "Enter");
                const ae = document.activeElement;
                if (ae && ae.id === "chat-input") ae.blur();
                // jeder Eingang: Strg+K öffnete die Omnibox hinter
                // dem Ladeschirm, sie führte Befehle aus
                const omni = document.getElementById("omnibox-overlay");
                const omniVor = omni ? omni.hidden : null;
                if (omni) omni.hidden = true;
                taste(document.body, "keydown", "k", "KeyK", { ctrlKey: true });
                const omniAuf = omni ? !omni.hidden : null;
                if (omni) omni.hidden = omniVor;
                m.tastenHinter = { w: wLief, enter: fokus(ae), omnibox: omniAuf };
            }
            // (9) DER LADESCHIRM WEICHT GANZ: nach `_ladeschirmWeg` (Klasse `weg`, nach 750 ms `hidden`) fällt er aus dem Layout —
            // `display: none`, keine laufende Animation
            {
                ls.hidden = false;
                ls.classList.remove("weg");
                r._ladeschirmWeg();
                await sleep(1000);
                const cs = getComputedStyle(ls);
                const laufen = ls.getAnimations
                    ? ls.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length
                    : null;
                m.weichtGanz = { hidden: ls.hidden, display: cs.display, animationen: laufen };
            }
            // (10) DER VORRAT HAT KEINEN LESER IM ERSTEN BILD: er läuft noch einmal, jede Bestellung beim Namen und mit der
            // Phase seines Merkers; währenddessen fragt die Probe das Tor und baut eine neue Streu-Region (Scheibe 0, nur die Weiche)
            {
                const v = { ohneLeser: [], karten: 0, kartenBsp: [], phaseBestellung: [] };
                m.vorrat = v;
                const f = r._foundry;
                if (!f || !f.ready) v.fehler = "keine lebende Foundry";
                else {
                    const P = Object.getPrototypeOf(r);
                    const alt = {};
                    const wickle = (name, fn) => {
                        alt[name] = r[name];
                        r[name] = function (...a) {
                            fn(a);
                            return P[name].apply(this, a);
                        };
                    };
                    v.PH = AnazhRealm.VORRAT_PHASE || null;
                    const phase = (wer) => v.phaseBestellung.push(`${wer}: ${JSON.stringify(f._vorrat)}`);
                    wickle("_foundryVorrat", (a) => {
                        v.ohneLeser.push(`Wagen ${a[0]}|${a[1]}|lod${a[2]}`);
                        phase(`Wagen ${a[0]}|${a[1]}`);
                    });
                    wickle("_foundryRequestSettlement", () => {
                        v.ohneLeser.push("Siedlungs-Probe");
                        phase("Siedlungs-Probe");
                    });
                    wickle("_foundryEnsureImpostorRecord", (a) => {
                        v.karten++;
                        if (v.kartenBsp.length < 4) v.kartenBsp.push(`${a[0]}|${a[1]}`);
                    });
                    const vor = r._weltbildFehlt();
                    f._vorrat = false;
                    let lauf = null;
                    // der Vorrat startet in der Ankunft: das erste Weltbild steht noch nicht
                    const merkDa = st._weltbildDa;
                    st._weltbildDa = 0;
                    try {
                        lauf = r._foundryPrefetchLibrary();
                        v.laeuft = !!f._vorrat;
                        v.phaseStart = f._vorrat;
                        v.fehltNeu = r._weltbildFehlt().filter((z) => !vor.includes(z));
                        // die Streu-Weiche: eine neue Region fern jeder bestehenden, Scheibe mit abgelaufener Frist
                        const SC = AnazhRealm.SCATTER;
                        const p = st.playerMesh.position;
                        const rx = Math.floor(p.x / SC.regionM) + 40;
                        const rz = Math.floor(p.z / SC.regionM) + 40;
                        const key = `${rx},${rz}`;
                        const map = st.scatterRegions || r._ensureScatterRegionMap();
                        const merkH = st.renderer._isHeadlessNull;
                        if (!map.has(key)) {
                            st.renderer._isHeadlessNull = false;
                            try {
                                const reg = r._scatterRegion(rx, rz, p, 0);
                                v.streu = {
                                    aufgeschoben: !!(reg && reg._deferredFoundry && !reg._cont),
                                    zellen: reg && reg.cells ? reg.cells.length : -1,
                                };
                            } finally {
                                st.renderer._isHeadlessNull = merkH;
                                if (map.has(key)) r._disposeScatterRegion(key);
                                map.delete(key);
                            }
                        }
                        // was er bestellt, solange das erste Weltbild fehlt (die Boden-Arten liegen schon im Speicher, Wagen
                        // und Siedlung folgen ihnen im nächsten Mikro-Takt) — dann steht das Bild, er wärmt zu Ende
                        await sleep(600);
                        const nVor = v.ohneLeser.length;
                        v.phaseVorBild = f._vorrat;
                        v.vorBild = v.ohneLeser.concat(v.karten ? [`${v.karten} Karten`] : []);
                        // das Bild steht über den EINEN Schreiber (sein Ereignis weckt den Vorrat), dann die Zeit der Ankunft zurück
                        r._weltbildSteht();
                        if (merkDa) st._weltbildDa = merkDa;
                        if (lauf) await Promise.race([lauf, sleep(60000)]);
                        v.nachBild = v.ohneLeser.length - nVor;
                    } finally {
                        if (!st._weltbildDa) {
                            r._weltbildSteht();
                            if (merkDa) st._weltbildDa = merkDa;
                        }
                        for (const k of Object.keys(alt)) {
                            if (alt[k] === P[k]) delete r[k];
                            else r[k] = alt[k];
                        }
                    }
                    v.ende = f._vorrat === false;
                    if (!v.laeuft) v.fehler = "der Vorrat lief nicht an (`f._vorrat` blieb aus)";
                }
            }
            // (11) DIE KÖPFE DER ANKUNFT UND DER BILD-RANG (B5): vor dem Bild trägt jeder Auftrag eines Lesers im Blick dessen Ort (die
            // Nah-Wiese am Auge, der Gesetz-Fit am Platz — ortlos stand er auf ∞ und wartete auf eine leere Bahn, GTX kalt 8,5 s), der
            // Leib bestellt in der Ego-Sicht nur die Grobstufe (die feine nach dem Bild, dann der Tausch), das Buch den Export des
            // fälligen Start-Dorfs. Die Züge der Leser und der Export werden gezählt, nie gesendet; der Leib baut echt im Faden.
            {
                const k = (m.koepfe = { orte: [], leib: { bestellt: [], baut: [] }, dorf: {} });
                const merk = { da: st._weltbildDa, soul: st._deferredAvatarSoul, mode: st.cameraMode, held: st.player.equipped && st.player.equipped.held };
                const zurueck = () => ["_foundryZug", "_foundryCacheGet", "_standRuht", "_weltKapselHolen", "_weltBakeErlaubt", "_foundryRequest", "_foundryRequestSettlement", "applyPlayerSoul"].forEach((n) => delete r[n]);
                const P = Object.getPrototypeOf(r);
                const bis = async (fn, ms, takt) => { for (const weiter = window.__deckel(String(fn), ms / 50); !fn() && weiter(); ) await (takt ? tick(1, 50) : sleep(50)); return !!fn(); }; // prettier-ignore
                try {
                    Object.assign(st, { _weltbildDa: 0, _weltbildErsteFrage: null, _weltbildLuecke: null }); // eine neue Ankunft (die Fälle davor ließen den Deckel stehen)
                    let wer = "die Nah-Wiese";
                    Object.assign(r, { _foundryCacheGet: () => undefined, _standRuht: () => false, _weltBakeErlaubt: () => true, _weltKapselHolen: (_k, fn) => (fn(), null), _foundryZug: (_k, pre, _v, lod, _o, wo) => (k.orte.push({ wer, art: `${pre} L${lod}`, blick: r._rangImErstenBlick(r._foundryAuftragD2(wo)) }), Promise.resolve(false)) }); // prettier-ignore
                    r._tickNahWiese();
                    wer = "der Gesetz-Fit";
                    const q = vorn(20);
                    r._streuGesetzSpawn("blume", 7, q.x, q.y, q.z, 0, 1);
                    zurueck();
                    // der Leib: seine Vorlagen fallen aus dem Memo, der deferierte Bau wartet wie beim Boot (Ego, leere Hand)
                    const [kc, memo, bmD] = [window.__koerperCore, AnazhRealm._tierOfenMemo, r._koerperStudioDials()];
                    const fM = r._menschGussFarben(bmD);
                    const key = (l) => r._ofenMenschKey(Object.assign({}, kc.START_PARAMS, bmD || {}), fM.skin, fM.hair, l);
                    [0, 1].forEach((l) => memo.delete(key(l)));
                    Object.assign(st, { _deferredAvatarSoul: st.player.soul || "human", cameraMode: "first" });
                    if (merk.held) st.player.equipped.held = null;
                    r._spielerVorlagen = null;
                    r._foundryRequest = function (pre, s, lod, ...a) { if (pre === "mensch") k.leib.bestellt.push(`${st._weltbildDa ? "nach" : "vor"} L${lod}${a[1] && a[1].kopf ? " Kopf" : ""}`); return P._foundryRequest.call(this, pre, s, lod, ...a); }; // prettier-ignore
                    r.applyPlayerSoul = function (...a) { const x = P.applyPlayerSoul.apply(this, a); k.leib.baut.push(`${st._weltbildDa ? "nach" : "vor"} ${(st.playerMesh.userData._gelenk || {}).nahStufe}`); return x; }; // prettier-ignore
                    r._ofenSpielerVorlagen();
                    await bis(() => r._leibBereit(), 90000);
                    k.leib.ohneFein = r._leibBereit() && !memo.has(key(0));
                    await bis(() => k.leib.baut.length, 10000, true); // der deferierte Bau im Takt
                    r._weltbildSteht(); // das Bild steht: der EINE Schreiber weckt die feine Stufe
                    await bis(() => memo.has(key(0)) && k.leib.baut.some((b) => b.startsWith("nach")), 90000, true);
                    // das Dorf: fällig am Genesis-Ort, sein Wecker hing am echten Buch (`_startDorfAmBuch`) — ein frisches Buch weckt ihn
                    if (amOrt && kanal) {
                        const mD = [window.__anazhAutoSettlement, wmD.settlementCells, r._autoSettlementStartHopeless, r._autoSettlementPendingKey, r._autoSettlementQueue];
                        Object.assign(window, { __anazhAutoSettlement: true }) && Object.assign(wmD, { settlementCells: ohneStart });
                        Object.assign(r, { _autoSettlementStartHopeless: false, _autoSettlementPendingKey: null, _autoSettlementQueue: null, _foundryRequestSettlement: (dp, kopf) => ((k.dorf.export = !!dp), (k.dorf.kopfRang = kopf === true), Promise.resolve(null)) }); // prettier-ignore
                        const [f, hoer] = [r._foundry, r._foundryHoerer && r._foundry && r._foundryHoerer.get(r._foundry.buchDa)]; if ((k.dorf.kopf = !!(hoer && hoer.has("start-dorf")))) { const da = f.buchDa; f.buchDa = Promise.resolve(); r._startDorfAmBuch(); f.buchDa = da; } // prettier-ignore
                        await sleep(0);
                        [window.__anazhAutoSettlement, wmD.settlementCells, r._autoSettlementStartHopeless, r._autoSettlementPendingKey, r._autoSettlementQueue] = mD; // prettier-ignore
                    } else k.dorf.ohne = m.ohneFall.dorfFaellig;
                } catch (e) {
                    k.fehler = String((e && e.message) || e);
                } finally {
                    zurueck();
                    Object.assign(st, { _weltbildDa: merk.da || performance.now(), cameraMode: merk.mode });
                    if (st._deferredAvatarSoul && !merk.soul) st._deferredAvatarSoul = merk.soul;
                    if (merk.held) (st.player.equipped.held = merk.held) && r._refreshHeldMesh();
                }
            }
            // (12) DIE ZUSAGE DES WALD-PLANS (B-Wald): der Plan 30 m vor dem Spieler fällt (`_forestDartsFallen`), ein Kasten 400 m
            // hinter ihm steht mit in der Schlange, der Takt schickt beide an den Faden — gezählt, was aussteht, wenn die Zusage kommt
            {
                const [w, C, o, f, Q] = [(m.wald = { kam: false, rest: -1 }), AnazhRealm.FOREST.cell, vorn(30), vorn(-400), r._waldPlanSchlange || (r._waldPlanSchlange = new Map())]; // prettier-ignore
                r._forestDartsFallen(o.x, o.z, o.x, o.z);
                r._forestDartsFallen(f.x - 6 * C, f.z - 6 * C, f.x + 6 * C, f.z + 6 * C);
                const [gx, gz, vor] = [Math.floor(f.x / C), Math.floor(f.z / C), Q.size];
                r._waldPlanKasten(gx - 6, gz - 6, gx + 6, gz + 6);
                [w.ferne, w.steht] = [Q.size - vor, r._waldPlanSteht(o.x, o.z)];
                const z = r._waldPlanZusage(o.x, o.z);
                if ((w.zusage = !!z)) z.then(() => Object.assign(w, { kam: true, rest: Q.size }));
                // bis die Zusage kam, dann bis der ferne Kasten wieder steht
                for (const weiter = window.__deckel("die Zusage des fernen Kastens", 2000); ((z && !w.kam) || Q.size) && weiter(); ) await tick(1, 30);
            }
            // (13) B-Blick: jede Baum-Zelle der Region wartet, im Blick auf zV, dahinter auf zH; (14) der Lade-Takt. Ein wartender
            // Wurf hält seinen Platz (`_scatterPass`, w4-b-streu): die Plätze bis zum Cap liegen in den ersten Zeilen der Region — die
            // Probe nimmt die Region südlich des Spielers (ihre ersten Zeilen liegen fern, über einen weiten Winkel; die eigene beginnt
            // an seinem Platz), und liegen die Plätze auf einer Seite des Blicks, legt sie seinen Rand auf den mittleren ihrer Winkel
            // (`w`, die Gier vom Auge) und baut neu (die Gier steht danach wieder)
            {
                const [b, P, t, ok, w] = [(m.blick = { n: [0, 0] }), Object.getPrototypeOf(r), (m.takt = { lief: 0 }), [], []];
                const [zV, zH] = [0, 1].map((i) => new Promise((f) => (ok[i] = f)));
                const [RM, da, gier] = [AnazhRealm.SCATTER.regionM, st._weltbildDa, st.yaw], [rx, rz] = [Math.floor(pm.x / RM), Math.floor(pm.z / RM) - 1], key = `${rx},${rz}`;
                const neu = () => (r._disposeScatterRegion(key), r._scatterRegion(rx, rz, pm));
                // DIE REGION STEHT VOR DER PROBE: jeder echte Wurf (Asset, Karte, Höhe) ist geliefert — sonst hielt ein echtes Asset im
                // Blick den zweiten Bau, und die Linse nannte die Zusage außer Blick (main 90878cc6 headless 2 von 3: „wartet auf ihr Asset")
                for (const weiter = (neu(), window.__deckel("die Streu-Region vor der Probe", 300)); r._streuRegionWartet(key) && weiter(); ) await tick(1, 30); // prettier-ignore
                const stumm = "_ladeTakt _tickVoxelChunkStreaming _tickScatterStreaming _tickPendingGrass _tickScatterRegrow _tickNahWiese _tickNahStreu".split(" ");
                r._scatterSichtHoehe = function (layer, ...a) {
                    const [v, E] = [r._imErstenBlick(a[4].x, a[4].z, 12), r._ersterBlick()];
                    if (layer.kind === "rock" || (v && b.geweckt != null)) return P._scatterSichtHoehe.call(this, layer, ...a);
                    return b.geweckt == null && (b.n[+!v]++, w.push(Math.atan2(a[4].x - E.ex, a[4].z - E.ez))), r._wartetAuf(v ? zV : zH), null;
                };
                try {
                    let g = ((st._weltbildDa = 0), neu());
                    if (!(b.n[0] && b.n[1])) {
                        [st.yaw, b.n] = [w.sort((p, q) => p - q)[w.length >> 1] + r._ersterBlick().halb, [0, 0]];
                        g = neu();
                    }
                    [b.vor1] = [r._streuRegionWartet(key), ok[0](), await sleep(0)];
                    b.geweckt = !!g._geweckt; // vor der zweiten Scheibe
                    b.vor2 = (neu(), r._streuRegionWartet(key));
                    [b.nach2] = [((st._weltbildDa = 1), r._streuRegionWartet(key)), (st._weltbildDa = 0), (st.scatterRegions.get(key)._bildWartet = null)];
                    for (let i = (stumm.forEach((k, j) => (r[k] = () => !j)), 0); i < 4; i++) t.lief += r._dispatchFrameJobs(r._buildDeferrableJobs(pm), { remainingMs: () => 0 }).includes("scatterDeco");
                } finally {
                    [stumm.forEach((k) => delete r[k]), delete r._scatterSichtHoehe, (st._weltbildDa = da), (st.yaw = gier), ok[1](), neu()];
                }
            }
            await sleep(800);
            if (!st._weltbildDa) r._weltbildSteht();
            ls.classList.add("weg");
        } else m.faelle = { fehler: ls ? "kein _ankunftsBild" : "kein Ladeschirm" };
        m.gestartet = true;
    } catch (e) {
        out.lade = Object.assign(out.lade || {}, { err: (e && e.stack) || String(e) });
    }
    // ── LH (w4-ankunft-2): die Hülle eines Studio-Baums, ihr Skelett aus dem Gedächtnis genommen, wächst vor dem Bild nicht und
    // danach im Takt der Hüllen; der Lade-Takt gespielt, je ein Stück im Bild und dahinter fehlt: ohne Leerlauf baut er nur das im
    // Bild, mit Leerlauf auch das dahinter ──
    try {
        const [m, da, merk, sp, pc, ruf] = [(out.huelle = {}), st._weltbildDa, r._baumGestaltMerk, r._voxelChunkConfig().span, st.lastPlayerVoxelChunk, new Set()];
        const baum = st.architectures.find((e) => e && e._huelleG != null && e.blockerAABBs && e.blockerAABBs.length);
        [r._baumGestaltMerk, st._weltbildDa] = [new Map(), 0];
        r._populateBlockerAABBs(baum);
        m.h = [r._baumGestaltMerk.size, r._weltOffen().huellen];
        st._weltbildDa = da;
        for (let n = 0; n < 400 && r._weltOffen().huellen; n++) r._tickHuellenNach();
        m.h.push(baum.blockerAABBs.length, r._weltOffen().huellen);
        r._baumGestaltMerk = merk;
        const stuecke = [[], []];
        st._weltbildDa = 0;
        for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) if (dx || dz) stuecke[+r._rangImBild({ x: (pc.cx + dx + 0.5) * sp, z: (pc.cz + dz + 0.5) * sp }, sp * Math.SQRT1_2)].push(`${pc.cx + dx},${pc.cz + dz}`);
        const [hinten, vorn] = stuecke.map((l) => [l[0], st.voxelChunks.get(l[0])]);
        [r._ladeTakt, r._ensureVoxelChunkAt] = [() => true, (cx, cz) => ruf.add(`${cx},${cz}`)]; // die Glieder des Prototyps, gespielt
        try {
            [hinten, vorn].forEach(([k]) => st.voxelChunks.delete(k));
            const gang = (leer) => (ruf.clear(), (r._ringLeerlauf = leer), (r._bodenRegung = (r._bodenRegung | 0) + 1), r._tickVoxelChunkStreaming(st.playerMesh.position), [ruf.has(hinten[0]), ruf.has(vorn[0])]); // prettier-ignore
            const [ohne, mit] = [gang(false), gang(true)];
            m.r = [ohne[0], ohne[1] && mit[1], r._ringLeerlaufBestellt, mit[0]];
        } finally {
            [hinten, vorn].forEach(([k, e]) => e && st.voxelChunks.set(k, e));
            delete r._ladeTakt;
            delete r._ensureVoxelChunkAt;
            st._weltbildDa = da;
        }
        m.gestartet = true;
    } catch (e) {
        out.huelle = { err: (e && e.stack) || String(e) };
    }
    // ── L1: das Fadenkreuz ──
    try {
        const m = { gestartet: false };
        out.kreuz = m;
        const k = document.getElementById("fadenkreuz");
        m.da = !!k;
        const sicht = () => {
            if (!k) return false;
            const cs = getComputedStyle(k);
            return cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0.05;
        };
        if (k) {
            const b = k.getBoundingClientRect();
            m.dx = +(b.x + b.width / 2 - innerWidth / 2).toFixed(1);
            m.dy = +(b.y + b.height / 2 - innerHeight / 2).toFixed(1);
            m.sichtbar = sicht();
            r.toggleDrawer("werkstatt");
            await sleep(100);
            m.mitSchublade = sicht();
            r.closeAllDrawers();
            await sleep(100);
            m.nachSchublade = sicht();
        }
        m.gestartet = true;
    } catch (e) {
        out.kreuz = Object.assign(out.kreuz || {}, { err: (e && e.stack) || String(e) });
    }
    // ── L2b: die Hilfe ──
    try {
        const m = { gestartet: false, antworten: {} };
        out.hilfe = m;
        const beispiele = r.chatDslPatterns.map((p) => p.example).concat(r.chatSystemPatterns.map((p) => p.example));
        const v1 = [];
        for (const p of r.chatDslPatterns.concat(r.chatSystemPatterns)) if (Array.isArray(p.hilfe)) v1.push(...p.hilfe);
        const tasten = Object.values(AnazhRealm.KEYBINDING_LABELS || {});
        for (const wort of ["hilfe", "help", "?"]) {
            const n0 = zeilen().length;
            r.processChatCommand(wort);
            const neu = zeilen().slice(n0 + 1);
            const text = neu.join("\n");
            m.antworten[wort] = {
                erste: (neu[0] || "").slice(0, 80),
                unbekannt: /Unbekannter Befehl/.test(text),
                fehlt: beispiele.filter((b) => !text.includes(b)),
                tastenFehlen: tasten.filter((t) => !text.includes(t)),
                v1: /pflanz mir|bau mir/.test(text),
            };
        }
        const n1 = zeilen().length;
        r.processChatCommand("blubbern sie laut");
        const unb = zeilen().slice(n1 + 1).join(" ");
        m.unbekanntListe = /Setze Wetter rainy|DSL-Befehle:/.test(unb);
        m.v1Saetze = v1.length;
        m.gestartet = true;
    } catch (e) {
        out.hilfe = Object.assign(out.hilfe || {}, { err: (e && e.stack) || String(e) });
    }
    // ── L3: das Gespräch ──
    try {
        const m = { gestartet: false };
        out.gespraech = m;
        const ci = document.getElementById("chat-input");
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        taste(document.body, "keydown", "Enter");
        m.enterFokus = fokus();
        if (m.enterFokus !== "chat-input") ci.focus();
        taste(ci, "keydown", "w", "KeyW");
        m.wImFeld = st.keys.w === true;
        const n0 = zeilen().length;
        ci.value = "setze uhrzeit mittag";
        taste(ci, "keydown", "Enter");
        taste(ci, "keypress", "Enter");
        m.gesendet = zeilen().slice(n0).some((z) => z === "> setze uhrzeit mittag");
        m.nachSenden = fokus();
        const ziel = document.activeElement || document.body;
        taste(ziel, "keydown", "w", "KeyW");
        m.wNachSenden = st.keys.w === true;
        taste(ziel, "keyup", "w", "KeyW");
        ci.value = "";
        ci.focus();
        taste(ci, "keydown", "Escape");
        m.nachEsc = fokus();
        if (document.activeElement === ci) ci.blur();
        // Enter auf einem fokussierten Knopf gehört dem Knopf
        const knopf = document.getElementById("camera-mode-toggle") || document.querySelector("button");
        if (knopf) {
            knopf.focus();
            taste(knopf, "keydown", "Enter");
            const a = document.activeElement;
            m.enterAufKnopf = a === knopf ? "knopf" : fokus(a);
            if (a && a.blur) a.blur();
        }
        m.gestartet = true;
    } catch (e) {
        out.gespraech = Object.assign(out.gespraech || {}, { err: (e && e.stack) || String(e) });
    }
    // ── L7: der Start-Gurt ──
    try {
        const m = { gestartet: false };
        out.gurt = m;
        m.buch = !!(buch && buch.ok);
        m.hotbar = st.hotbar.slice();
        const f = r._foundry;
        const artVon = (name) => {
            const pr = r._foundryPresetFor(name);
            const rec = pr && f && f.recipes ? f.recipes[pr] : null;
            return rec && typeof rec.kind === "string" ? rec.kind : null;
        };
        const AD = AnazhRealm.ALT_DOPPEL || {};
        m.eintraege = m.hotbar.filter(Boolean).map((name) => {
            const bp = st.blueprints[name];
            return {
                name,
                sichtbar: !!bp && r._katalogSichtbar(name, bp),
                altDoppel: AD[name] || null,
                art: bp ? artVon(name) : null,
                platzierbar: !!bp && r._isPlaceableBlueprint(bp),
            };
        });
        const arten = new Set();
        for (const name of Object.keys(st.blueprints))
            if (r._katalogSichtbar(name) && r._isPlaceableBlueprint(st.blueprints[name])) {
                const a = artVon(name);
                if (a) arten.add(a);
            }
        m.katalogArten = Array.from(arten);
        m.gestartet = true;
    } catch (e) {
        out.gurt = Object.assign(out.gurt || {}, { err: (e && e.stack) || String(e) });
    }
    // ── LK: die Kamera und die Pflanzen ──
    try {
        const m = { gestartet: false, wege: {} };
        out.kamera = m;
        const pl = st.architectures.find((a) => a && a.type === "start_plattform");
        const P = pl ? pl.position : st.playerMesh.position;
        const natur = (a) => r._istNatur(a);
        const naheBaeume = () =>
            st.architectures
                .filter((a) => a && /^baum_/.test(a.type) && a.blockerAABBs && a.blockerAABBs.length)
                .sort((a, b) => Math.hypot(a.position.x - P.x, a.position.z - P.z) - Math.hypot(b.position.x - P.x, b.position.z - P.z));
        let baeume = naheBaeume();
        for (const weiter = window.__deckel("ein naher Baum", 1500); !baeume.length && weiter(); ) {
            await tick(5, 40);
            baeume = naheBaeume();
        }
        const baum = baeume[0] || null;
        if (baum) {
            m.baum = baum.type;
            m.weltSkala = +r._foundryWorldScaleMatrix(r._foundryPresetForEntry(baum)).elements[0].toFixed(3);
            // die Skala des Stamm-Blockers gegen die Vorlage: die Breiten-Summe der Blocker-Boxen gegen dieselben festen Teile
            // im Vorlagen-Maß (`_blockerComputePartAABB` ohne Welt-Skala). Dieselben Teile wie der Blocker: der gefühlte
            // Baum ist das Skelett seiner Gestalt (`_baumGestaltTeile`), der Bauplan nur, wo das Studio keinen Baum zeichnet —
            // gegen den Bauplan gemessen, las die Ankunft am Kiefer-Individuum der Kern-Landform × 3,589 statt × 3,977.
            const bp = st.blueprints[baum.type];
            const vorlage = (r._baumGestaltTeile(baum) || bp.parts || [])
                .filter((p) => r._isPartSolid(p))
                .map((p) => r._blockerComputePartAABB(baum, p))
                .filter(Boolean);
            const breite = (bs) => bs.reduce((s2, b) => s2 + (b.maxX - b.minX), 0);
            m.stammSkala = +(breite(baum.blockerAABBs.slice(0, vorlage.length)) / Math.max(1e-6, breite(vorlage))).toFixed(3);
            // DIE WEGE: deterministische Linien durch den Wald der Ankunft (je an einem Baum vorbei, Richtung aus einer festen
            // Folge), 30 m lang.
            let same = 20251007;
            const zufall = () => ((same = (Math.imul(same, 1103515245) + 12345) >>> 0) / 4294967296);
            const linien = [];
            for (let i = 0; i < 16 && baeume.length; i++) {
                const b = baeume[Math.floor(zufall() * Math.min(baeume.length, 40))];
                const gier = zufall() * Math.PI * 2;
                linien.push({ x0: b.position.x - Math.sin(gier) * 15 + 2.5, z0: b.position.z - Math.cos(gier) * 15, gier });
            }
            const hh = (x, z) => r.getTerrainHeightAt(x, z);
            // Die Pflanzen beiseite (die Blocker der Natur-Einträge): das Soll, das nur Boden und Bau erzwingen. Der Täter beim
            // Namen: der Stamm (Blocker).
            // Pflanze ist, wessen Boxen alle `pflanze` tragen (der Wurf geht `durchPflanzen`); der Fels ist Natur, aber keine
            // Pflanze — er hält die Kamera wie der Bau (K06: die Kugel der Kamera hielt im Ritt 2 von 496 Proben an Natur ohne
            // Pflanzen-Box, die der Mittelstrahl um weniger als ihren Radius verfehlte; die Linse nannte sie „Stamm")
            const pflanzen = st.architectures.filter(
                (a) => a && natur(a) && a.blockerAABBs && a.blockerAABBs.length && a.blockerAABBs.every((b) => b && b.pflanze === true)
            );
            const ohneStaemme = (an) => {
                for (const a of pflanzen) {
                    if (an) {
                        a.__lkBlocker = a.blockerAABBs;
                        a.blockerAABBs = null;
                    } else if (a.__lkBlocker) {
                        a.blockerAABBs = a.__lkBlocker;
                        delete a.__lkBlocker;
                    }
                }
            };
            let T = 1000;
            const arm = () => {
                const c = st.camera.position;
                const p = st.playerMesh.position;
                return Math.hypot(c.x - p.x, c.y - (p.y + 1.0), c.z - p.z);
            };
            // eine Kamera-Stellung bis zur Ruhe (ein gleitender Arm hat Zeit, hinauszufahren)
            const ruhig = () => {
                for (let i = 0; i < 10; i++) r._loopCamera((T += 0.1));
                return arm();
            };
            const med = (a) => (a.length ? +a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)].toFixed(2) : null);
            // EIN WEG zu Fuß (3rd, Neigung 0) oder im Ritt (die Verfolger-Kamera des GT): `stelle(x, z, gier)` setzt Spieler/Wagen.
            const weg = (name, stelle, schritt, sprungM, bildM) => {
                const z = { proben: 0, pflanzeHaelt: 0, taeter: [], sprungM };
                const ist = [];
                const soll = [];
                const taeter = new Set();
                for (const L of linien) {
                    for (let s = 0; s <= 30; s += schritt) {
                        const x = L.x0 + Math.sin(L.gier) * s;
                        const zz = L.z0 + Math.cos(L.gier) * s;
                        if (!Number.isFinite(hh(x, zz))) continue;
                        stelle(x, zz, L.gier);
                        ohneStaemme(true);
                        const aSoll = ruhig();
                        ohneStaemme(false);
                        const aIst = ruhig();
                        z.proben++;
                        ist.push(aIst);
                        soll.push(aSoll);
                        if (aIst < aSoll - 0.3) {
                            z.pflanzeHaelt++;
                            taeter.add("Stamm (Natur-Blocker am Kamera-Strahl)");
                        }
                    }
                }
                z.armIst = med(ist);
                z.armSoll = med(soll);
                z.unter3 = ist.filter((a) => a < 3).length;
                z.taeter = Array.from(taeter);
                // DIE SPRÜNGE: dieselben Linien im Takt eines Bilds (1/60 s), einmal ohne die Pflanzen (Soll), einmal mit (Ist):
                // ein Sprung > sprungM je Bild, den Boden und Bau nicht erzwingen, ist ein Pflanzen-Sprung; ein Sprung HINAUS
                // ist nie erlaubt (der Arm gleitet).
                const fahre = (mitPflanzen) => {
                    let n = 0;
                    let hinaus = 0;
                    if (!mitPflanzen) {
                        ohneStaemme(true);
                    }
                    for (const L of linien.slice(0, 8)) {
                        let vor = null;
                        for (let s = 0; s <= 30; s += bildM) {
                            const x = L.x0 + Math.sin(L.gier) * s;
                            const zz = L.z0 + Math.cos(L.gier) * s;
                            if (!Number.isFinite(hh(x, zz))) continue;
                            stelle(x, zz, L.gier);
                            r._loopCamera((T += 1 / 60));
                            const a = arm();
                            if (vor != null && Math.abs(a - vor) > sprungM) {
                                n++;
                                if (a > vor) hinaus++;
                            }
                            vor = a;
                        }
                        ruhig();
                    }
                    if (!mitPflanzen) {
                        ohneStaemme(false);
                    }
                    return { n, hinaus };
                };
                const jSoll = fahre(false);
                const jIst = fahre(true);
                z.spruenge = jIst.n;
                z.spruengeSoll = jSoll.n;
                z.spruengePflanze = Math.max(0, jIst.n - jSoll.n);
                z.hinausSprung = Math.max(0, jIst.hinaus - jSoll.hinaus);
                m.wege[name] = z;
            };
            r.setCameraMode("third");
            st.pitch = 0;
            weg(
                "fuss",
                (x, zz, gier) => {
                    st.playerMesh.position.set(x, hh(x, zz) + 1.0, zz);
                    st.yaw = gier;
                },
                1.0,
                1.0,
                0.1
            );
            // DER RITT: ein GT, aufgesessen; der Wagen fährt die Linien (die Verfolger-Kamera hinter ihm, Kern-Gesetz kamera)
            const gt = r.spawnArchitecture("fahrzeug_gt", { x: P.x + 30, y: hh(P.x + 30, P.z) + 0.5, z: P.z }, { silent: true, precise: true });
            if (gt) {
                await window.__gebautNach(gt);
                const mr = r.mountArchitecture(gt);
                if (mr && mr.ok) {
                    weg(
                        "ritt",
                        (x, zz, gier) => {
                            const y = hh(x, zz) + 0.5;
                            gt.position.x = x;
                            gt.position.y = y;
                            gt.position.z = zz;
                            gt._rideYaw = gier;
                            st.yaw = gier;
                            st.playerMesh.position.set(x, y + 0.5, zz);
                        },
                        1.0,
                        2.0,
                        0.25
                    );
                    r.dismountArchitecture();
                } else m.wege.ritt = { proben: 0, grund: "Aufsitzen scheiterte" };
                r.removeArchitecture(gt);
            } else m.wege.ritt = { proben: 0, grund: "kein GT" };
            // DIE DURCHSICHT: jeder Pflanzen-Stoff in der Szene (Foundry-Art Laub · Blatt-Karte · Rinde · Stiel) trägt sie im
            // maskNode, der Schatten-Pass liest seinen eigenen maskShadowNode (die Durchsicht schneidet nie den Schatten).
            const PFLANZE = new Set(["foliage", "foliageTex", "bark", "stem"]);
            const stoffe = new Set();
            st.scene.traverse((o) => {
                const mats = o && o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
                for (const mt of mats) if (mt && mt.userData && PFLANZE.has(mt.userData.foundryKind)) stoffe.add(mt);
            });
            m.stoffe = stoffe.size;
            const kn = Object.values(r._kamDurchKnoten || {});
            const ohne = Array.from(stoffe).filter((mt) => !(mt.maskNode && kn.includes(mt.maskNode)));
            m.stoffeOhne = ohne.length;
            m.stoffeOhneArten = Array.from(new Set(ohne.map((mt) => mt.userData.foundryKind)));
            m.schattenGeschnitten = Array.from(stoffe).filter((mt) => mt.maskNode && mt.maskNode.isNode && !(mt.maskShadowNode && mt.maskShadowNode.isNode)).length;
            // das Ziel der Durchsicht ist der Blickpunkt (3rd: die Brust, zu Fuß um die Schulter versetzt) — gelesen, wo die
            // Uniform es trägt: höchstens KAMERA_SCHULTER_M neben der Brust, und AUF dem Blick der Kamera (
            // Gelb 1 der dritten Gegenprüfung: mit der Brust als Ziel stand die Ebene des Fadenkreuz-Strahls schräg, bei kurzem
            // Arm begann er 0,52–0,78 m hinter dem Blickpunkt)
            const lu = st.lodUniforms;
            if (lu && lu.uKamZiel) {
                st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
                r._loopCamera((T += 0.1));
                const v = lu.uKamZiel.value;
                const p = st.playerMesh.position;
                m.zielAbstand = +Math.hypot(v.x - p.x, v.y - (p.y + 1.0), v.z - p.z).toFixed(2);
                m.zielFolgt = m.zielAbstand <= (AnazhRealm.KAMERA_SCHULTER_M || 0) + 0.05;
            }
            // DAS FADENKREUZ IN 3RD: der Abstand der Brust vom Strahl
            // durch die Bildmitte
            {
                st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
                st.pitch = 0;
                ruhig();
                const c = st.camera.position;
                const f = st.camera.getWorldDirection(new THREE.Vector3());
                const b = new THREE.Vector3(st.playerMesh.position.x - c.x, st.playerMesh.position.y + 1.0 - c.y, st.playerMesh.position.z - c.z);
                m.kreuzAbstand = +b.cross(f).length().toFixed(2);
            }
            // DER STRAHL DES FADENKREUZES: der Spieler 2,5 m vor einem Baum, der Blick von ihm weg
            // — der Baum steht zwischen Kamera und Spieler und ist durchsichtig. Kein Treffer-Strahl durch die Bildmitte trifft
            // HINTER dem Spieler: Bau-Pick, Welt-Treffer (Pfeil · Graben · Aufschütten), Blick-Ziel, Bau-Phantom, Kreatur-Pick
            // (eine Kreatur zwischen Kamera und Spieler: JEDE Seele, Größe 1, je allein unter den Wesen, ihre Leibes-Mitte auf dem Strahl).
            {
                const fk = (m.fadenkreuz = { stellungen: 0, hinten: {} });
                const zaehl = (k) => (fk.hinten[k] = (fk.hinten[k] || 0) + 1);
                const [welt, mx, seelen] = [st.creatures, st.maxCreatures, AnazhRealm.CREATURE_SOUL_NAMES];
                st.maxCreatures = Infinity;
                const kreaturen = seelen.map((s) => r.spawnCreatureAt(P.x + 60, hh(P.x + 60, P.z) + 1, P.z, "happy", s, { precise: true, bodySize: 1 }));
                st.maxCreatures = mx;
                fk.kreatur = seelen.length > 0 && kreaturen.every((k) => k && r._leibMitte(k));
                const kreaturAuf = (kreatur, s) => {
                    const [c, d] = [st.camera.position, st.camera.getWorldDirection(new THREE.Vector3())];
                    kreatur.updateMatrixWorld(true);
                    kreatur.position.add(new THREE.Vector3(c.x + d.x * s, c.y + d.y * s, c.z + d.z * s).sub(r._leibMitte(kreatur)));
                    kreatur.updateMatrixWorld(true);
                };
                for (const b of baeume.slice(0, 12))
                    for (let k = 0; k < 8; k++) {
                        const g = (k / 8) * Math.PI * 2;
                        const x = b.position.x + Math.sin(g) * 2.5;
                        const zz = b.position.z + Math.cos(g) * 2.5;
                        if (!Number.isFinite(hh(x, zz))) continue;
                        st.playerMesh.position.set(x, hh(x, zz) + 1.0, zz);
                        st.yaw = g;
                        st.pitch = 0;
                        const arm2 = ruhig();
                        fk.stellungen++;
                        // das Ziel der Kamera auf ihrem Blick: sein Abstand von der Achse durch die Bildmitte (jeder Arm)
                        {
                            const kz = st._kamZiel;
                            const c = st.camera.position;
                            if (kz && Math.abs(kz.ex - c.x) + Math.abs(kz.ey - c.y) + Math.abs(kz.ez - c.z) < 1e-6) {
                                const f = st.camera.getWorldDirection(new THREE.Vector3());
                                const a = new THREE.Vector3(kz.x - c.x, kz.y - c.y, kz.z - c.z).cross(f).length();
                                fk.zielAchse = Math.max(fk.zielAchse || 0, +a.toFixed(3));
                            }
                        }
                        const p = st.playerMesh.position;
                        const fx = Math.sin(g);
                        const fz = Math.cos(g);
                        const hinter = (q) => !!q && (q.x - p.x) * fx + (q.z - p.z) * fz < -0.2;
                        const pick = r._pickArchitectureAtCrosshair();
                        if (pick && hinter(pick.point)) zaehl("_pickArchitectureAtCrosshair");
                        const wh = r._raycastWorldHit(30);
                        if (wh && wh.hit && hinter(wh)) zaehl("_raycastWorldHit");
                        if (hinter(r._blickZiel(AnazhRealm.BLICK_ZIEL_M))) zaehl("_blickZiel");
                        const ph = r._resolvePhantomTarget();
                        if (ph && ph.hit && hinter(ph)) zaehl("_resolvePhantomTarget");
                        for (const kreatur of fk.kreatur ? kreaturen : []) {
                            st.creatures = [kreatur];
                            kreaturAuf(kreatur, 0.5 * arm2);
                            const kp = r._pickCreatureAtCrosshair();
                            if (kp && kp.creature === kreatur) zaehl("_pickCreatureAtCrosshair");
                        }
                    }
                st.creatures = welt;
                for (const k of kreaturen) if (k) r.removeCreature(k);
            }
            // DIE DURCHSICHT NUR ZWISCHEN AUGE UND ZIEL: die EINE Formel des Stoffs
            // (`_durchsichtGewicht`, hier über den Zahlen `DURCHSICHT_ZAHLEN`) an der Rinde, je Punkt der Stamm-Hülle bis 3 m vom
            // Ziel — (a) 1st, der Spieler läuft an den Stamm (die Ankunfts-Sicht): keine Rinde fällt; (b) 3rd, derselbe Anlauf (der
            // Stamm VOR dem Spieler, jenseits der Ebene des Ziels): keine Rinde fällt; (c) 3rd, der Spieler 2,5 m vor dem Baum mit dem Rücken zu ihm (der Stamm
            // zwischen Kamera und Brust): die Rinde am Sicht-Strahl fällt ganz — die Durchsicht wirkt.
            {
                const K = AnazhRealm;
                const ds = (m.durchsicht = { formel: typeof K._durchsichtGewicht === "function" && !!K.DURCHSICHT_ZAHLEN });
                // DER KONSUM AM RUF (Spion am Ruf, kein Quelltext): die Proben durch die Bildmitte ohne eigenes Band nehmen den
                // EINEN Strahl, der Stoff-Knoten der Durchsicht rechnet die EINE Formel (sein Zwischenspeicher leer: er baut neu)
                const nahStreu = st.nahStreu && st.nahStreu.senken && st.nahStreu.senken.size > 0;
                const rahmen = r._kampfSchwungRahmen({});
                const knoten = r._kamDurchKnoten;
                r._kamDurchKnoten = {};
                m.konsum = {
                    _hasMagnifyingInSight: ruft(r, "_hasMagnifyingInSight", r, "_fadenkreuzStrahl", []),
                    _pickScatterAtCrosshair: nahStreu ? ruft(r, "_pickScatterAtCrosshair", r, "_fadenkreuzStrahl", []) : null,
                    _kampfKlingenAchse: ruft(r, "_kampfKlingenAchse", r, "_fadenkreuzStrahl", [{ rahmen, reach: rahmen.reach, ziel: null }, {}]),
                    _kameraDurchsichtNode: ruft(r, "_kameraDurchsichtNode", K, "_durchsichtGewicht", [THREE.TSL, "rinde"]),
                };
                r._kamDurchKnoten = knoten;
                // das Ziel und sein Auge, wie `_kamZielSetzen` sie schreibt (dieselben Werte wie uKamZiel · uKamAuge)
                const ziel = () => {
                    const k = st._kamZiel;
                    return k ? { x: k.x, y: k.y, z: k.z, w: k.r, nr: k.nr, auge: { x: k.ex, y: k.ey, z: k.ez } } : null;
                };
                const gewicht = (q) => {
                    const z = ziel();
                    // die Rinde mit ihrem Nah-Radius (uKamNah.y, wie `_kamZielSetzen` ihn schreibt)
                    return K._durchsichtGewicht(K.DURCHSICHT_ZAHLEN, q, z.auge, { x: z.x, y: z.y, z: z.z }, z.w, z.nr);
                };
                // die Punkte der Stamm-Hülle (die Seiten jeder Blocker-Box, 0,1 m Raster) bis 3 m vom Ziel (1st das Auge, 3rd
                // die Brust)
                const rinde = (baum) => {
                    const c = ziel();
                    const pts = [];
                    for (const bb of baum.blockerAABBs || []) {
                        const n = (a, b2) => Math.max(1, Math.ceil((b2 - a) / 0.1));
                        const nx = n(bb.minX, bb.maxX);
                        const nz = n(bb.minZ, bb.maxZ);
                        const y0 = Math.max(bb.botY, c.y - 3);
                        const y1 = Math.min(bb.topY, c.y + 3);
                        for (let y = y0; y <= y1; y += 0.1)
                            for (let i = 0; i <= nx; i++)
                                for (let j = 0; j <= nz; j++) {
                                    if (i > 0 && i < nx && j > 0 && j < nz) continue; // nur die Seiten
                                    const q = { x: bb.minX + ((bb.maxX - bb.minX) * i) / nx, y, z: bb.minZ + ((bb.maxZ - bb.minZ) * j) / nz };
                                    if (Math.hypot(q.x - c.x, q.y - c.y, q.z - c.z) <= 3) pts.push(q);
                                }
                    }
                    return pts;
                };
                const augeZuStamm = (baum) => {
                    const c = st.camera.position;
                    let d = Infinity;
                    for (const bb of baum.blockerAABBs || []) {
                        const qx = Math.max(bb.minX, Math.min(c.x, bb.maxX));
                        const qy = Math.max(bb.botY, Math.min(c.y, bb.topY));
                        const qz = Math.max(bb.minZ, Math.min(c.z, bb.maxZ));
                        d = Math.min(d, Math.hypot(qx - c.x, qy - c.y, qz - c.z));
                    }
                    return d;
                };
                // ein Anlauf: 3 m vor dem Stamm, der Blick zum Stamm, W bis der Körper hält
                const anlauf = async (baum, modus) => {
                    const box = baum.blockerAABBs[0];
                    const cx = (box.minX + box.maxX) / 2;
                    const cz = (box.minZ + box.maxZ) / 2;
                    let ux = P.x - cx;
                    let uz = P.z - cz;
                    const L = Math.hypot(ux, uz) || 1;
                    ux /= L;
                    uz /= L;
                    r.setCameraMode(modus);
                    const x = cx + ux * 3;
                    const zz = cz + uz * 3;
                    st.playerMesh.position.set(x, hh(x, zz) + 1.0, zz);
                    if (st.playerVel && st.playerVel.setValue) st.playerVel.setValue(0, 0, 0);
                    const gier = Math.atan2(-ux, -uz);
                    st.yaw = gier;
                    st.pitch = 0;
                    st.keys.w = true;
                    for (let i = 0; i < 120; i++) {
                        st.yaw = gier;
                        try {
                            r._gameLoopTick(performance.now());
                        } catch {}
                        await sleep(16);
                    }
                    st.keys.w = false;
                    st.pitch = 0;
                    ruhig();
                };
                // im 1st jeder Punkt; in 3rd nur, was jenseits der Ebene des Ziels liegt (vor dem Spieler — was zwischen Kamera
                // und Spieler liegt, ein Wurzel-Ast hinter seinem Rücken, darf fallen)
                const jenseits = (q) => {
                    const z = ziel();
                    const ex = z.x - z.auge.x;
                    const ey = z.y - z.auge.y;
                    const ez = z.z - z.auge.z;
                    const L = Math.hypot(ex, ey, ez);
                    if (L < 1e-6) return true;
                    return ((q.x - z.auge.x) * ex + (q.y - z.auge.y) * ey + (q.z - z.auge.z) * ez) / L >= L;
                };
                const urteil = (baum) => {
                    const pts = rinde(baum).filter(jenseits);
                    let wMin = 1;
                    let fallen = 0;
                    for (const q of pts) {
                        const w = gewicht(q);
                        if (w < wMin) wMin = w;
                        if (w < 0.999) fallen++;
                    }
                    return { punkte: pts.length, fallen, wMin };
                };
                if (ds.formel && ziel()) {
                    for (const [modus, n] of [
                        ["first", 8],
                        ["third", 4],
                    ]) {
                        const z = (ds[modus] = { anlaeufe: 0, faellt: 0, abstand: [], wMin: 1, punkte: 0 });
                        // die Probe stellt ihren Fall her: Bäume, bis n Anläufe Rinde jenseits des Ziels tragen (höchstens 12) —
                        // bis zur Prüfung K60-3-1 nahm sie die ersten n, und je nach Halt des Körpers trug in 3rd keiner (1 von 2
                        // Läufen am Kopf: „kein Anlauf (Vorbedingung)")
                        for (const baum of baeume.slice(0, 12)) {
                            if (z.anlaeufe >= n) break;
                            await anlauf(baum, modus);
                            const u = urteil(baum);
                            if (!u.punkte) continue;
                            z.anlaeufe++;
                            z.punkte += u.punkte;
                            z.abstand.push(+augeZuStamm(baum).toFixed(2));
                            if (u.fallen) z.faellt++;
                            z.wMin = Math.min(z.wMin, +u.wMin.toFixed(3));
                        }
                    }
                    // (c) der Stamm zwischen Kamera und Brust: wo der Sicht-Strahl Auge → Ziel durch die Stamm-Hülle geht
                    const zw = (ds.zwischen = { stellungen: 0, wirkt: 0, wMax: 0 });
                    r.setCameraMode("third");
                    ruhig(); // das Ziel steht um die Schulter `seite` neben der Achse: die Stellung legt den Sicht-Strahl durch die Stamm-Mitte (T2: 0 von 96 freien Stämmen trafen die Achse)
                    const z1 = ziel(), p1 = st.playerMesh.position, seite = (z1.x - p1.x) * Math.cos(st.yaw) - (z1.z - p1.z) * Math.sin(st.yaw); // prettier-ignore
                    for (const b of baeume.slice(0, 12))
                        for (let k = 0; k < 8; k++) {
                            const g = (k / 8) * Math.PI * 2;
                            const x = b.position.x + Math.sin(g) * 2.5 - seite * Math.cos(g);
                            const zz = b.position.z + Math.cos(g) * 2.5 + seite * Math.sin(g);
                            if (!Number.isFinite(hh(x, zz))) continue;
                            st.playerMesh.position.set(x, hh(x, zz) + 1.0, zz);
                            st.yaw = g;
                            st.pitch = 0;
                            ruhig();
                            const c = st.camera.position;
                            const z = ziel();
                            const innen = [];
                            for (let i = 1; i < 100; i++) {
                                const t = i / 100;
                                const q = { x: c.x + (z.x - c.x) * t, y: c.y + (z.y - c.y) * t, z: c.z + (z.z - c.z) * t };
                                if (b.blockerAABBs.some((bb) => q.x >= bb.minX && q.x <= bb.maxX && q.y >= bb.botY && q.y <= bb.topY && q.z >= bb.minZ && q.z <= bb.maxZ)) innen.push(q);
                            }
                            if (!innen.length) continue;
                            zw.stellungen++;
                            const wMax = Math.max(...innen.map(gewicht));
                            zw.wMax = Math.max(zw.wMax, +wMax.toFixed(3));
                            if (wMax < 0.001) zw.wirkt++;
                        }
                }
            }
            r.setCameraMode("first");
            st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
        }
        m.gestartet = true;
    } catch (e) {
        out.kamera = Object.assign(out.kamera || {}, { err: (e && e.stack) || String(e) });
    }
    // ── D6: die KI nennt die Ursache ──
    try {
        const m = { gestartet: false };
        out.ki = m;
        const llm = st.llm;
        const alt = JSON.parse(JSON.stringify({ enabled: llm.enabled, provider: llm.provider, oll: llm.providerConfig.ollama }));
        // (a) „Aktivieren" mit einem lokalen Endpunkt ohne Dienst
        llm.provider = "ollama";
        llm.enabled = false;
        llm.lastError = null;
        llm.providerConfig.ollama.endpoint = "http://127.0.0.1:" + arg.kiPort;
        llm.providerConfig.ollama.useProxy = false;
        const tg = document.getElementById("llm-toggle");
        if (tg) tg.click();
        await sleep(1500);
        await r._llmErreichbarkeit();
        m.status = (document.getElementById("llm-status") || {}).textContent || "";
        // (b) ein Cloud-Begleiter ohne Schlüssel, der Schalter steht an
        const defs = r.llmProviderDefs();
        const ohne = Object.keys(defs).find((k) => defs[k].requiresKey);
        llm.provider = ohne;
        llm.enabled = true;
        if (llm.providerConfig[ohne]) llm.providerConfig[ohne].apiKey = "";
        const n0 = zeilen().length;
        r.processChatCommand("lass mir ein paar birken und ein fachwerkhaus wachsen");
        await sleep(600);
        m.ohneSchluessel = zeilen().slice(n0 + 1).find((z) => /schweigt|Fehler/.test(z)) || null;
        // (c) der Proxy: der Ursprung der Seite (der Linsen-Server kennt /api/proxy/llm nicht → 404)
        m.ursprung = location.origin;
        m.proxyUrl = r._llmProxyUrl();
        llm.provider = "ollama";
        llm.enabled = true;
        llm.providerConfig.ollama.endpoint = "https://ollama.com";
        llm.providerConfig.ollama.useProxy = true;
        const ant = await r.llmCall("hallo welt");
        m.proxyFehler = ant && ant.error ? String(ant.error) : "";
        llm.enabled = alt.enabled;
        llm.provider = alt.provider;
        llm.providerConfig.ollama = alt.oll;
        llm.lastError = null;
        m.gestartet = true;
    } catch (e) {
        out.ki = Object.assign(out.ki || {}, { err: (e && e.stack) || String(e) });
    }
    // ── D9 + D8: das Dorf vor dir, zwei Kanäle ──
    try {
        const m = { gestartet: false };
        out.dorf = m;
        const k = { gestartet: false };
        out.kanal = k;
        m.buch = !!(buch && buch.ok);
        const pl = st.architectures.find((a) => a && a.type === "start_plattform");
        const P = pl.position;
        // die Gier der leeren Richtung (wenig Bäume, flach) — dieselbe Wahl wie die sichtbare Schau
        const baeume = st.architectures.filter((a) => /^baum_/.test(a.type || ""));
        let best = null;
        for (let i = 0; i < 16; i++) {
            const yaw = (i / 16) * Math.PI * 2;
            const sx = Math.sin(yaw);
            const sz = Math.cos(yaw);
            const h0 = r.getTerrainHeightAt(P.x + sx * 8, P.z + sz * 8);
            let maxDh = 0;
            for (let d = 8; d <= 40; d += 4) maxDh = Math.max(maxDh, Math.abs(r.getTerrainHeightAt(P.x + sx * d, P.z + sz * d) - h0));
            let nb = 0;
            for (const b of baeume) {
                const dx = b.position.x - P.x;
                const dz = b.position.z - P.z;
                const t = dx * sx + dz * sz;
                if (t > 2 && t < 40 && Math.abs(dx * sz - dz * sx) < 6) nb++;
            }
            const w = nb * 3 + maxDh;
            if (!best || w < best.w) best = { yaw, w };
        }
        st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
        st.yaw = best.yaw;
        const cam = st.camera;
        const tanH = Math.tan(((cam.fov || 75) * Math.PI) / 360) * (cam.aspect || 16 / 9);
        const vor = new Set(st.architectures);
        const z0 = zeilen().length;
        r.processChatCommand("dorf 7 18");
        for (const weiter = window.__deckel("die Antwort auf das Dorf", 300); weiter() && !zeilen().slice(z0).some((z) => /steht vor dir|Häuser platziert|kein Haus|Werkstatt der Welt|FOUNDRY/.test(z)); ) await sleep(200);
        const neu = st.architectures.filter((a) => !vor.has(a) && /^haus_/.test(a.type || ""));
        const fx = Math.sin(best.yaw);
        const fz = Math.cos(best.yaw);
        const cos = neu.map((a) => {
            const dx = a.position.x - P.x;
            const dz = a.position.z - P.z;
            const L = Math.hypot(dx, dz) || 1;
            return { c: (dx * fx + dz * fz) / L, quer: Math.abs(dx * fz - dz * fx), vorn: dx * fx + dz * fz };
        });
        m.haeuser = neu.length;
        m.hinten = cos.filter((c) => c.c < 0).length;
        m.cosHinten = cos.filter((c) => c.c < 0).map((c) => c.c.toFixed(2));
        // im Bildwinkel: der Abstand quer zur Achse ≤ tan(halber Winkel) × vorn (mit einem Haus Reichweite als Rand)
        m.ausserBild = cos.filter((c) => c.quer > tanH * c.vorn + 12).length;
        // der Puffer rollt (maxLogEntries): gesucht wird im ganzen, die letzte Gründung
        const logNeu = st.logBuffer.filter((z) => /Siedlung „/.test(z)).slice(-1).join("\n");
        k.siedlungImLog = /Siedlung „[^"]*" \([^)]*Seed 7\)/.test(logNeu);
        k.zeilen = zeilen().slice(z0);
        m.dorfZeile = (k.zeilen.find((z) => /vor dir|platziert/.test(z)) || "").slice(0, 120);
        // die Mitte des Plans aus dem Log (platziert / übersprungen)
        const mz = /(\d+) Häuser platziert, (\d+) Slots übersprungen/.exec(logNeu);
        if (mz) {
            m.platziert = +mz[1];
            m.uebersprungen = +mz[2];
        }
        for (const a of st.architectures.filter((a) => !vor.has(a)).reverse()) r.removeArchitecture(a);
        // DER MITSPIELER: „baue dorf hier", gesprochen an der Plattform, läuft beim Sprecher (Quelle human) und bei
        // einem Mitspieler 200 m weiter mit anderer Gier (Quelle remote) — dasselbe Dorf an derselben Stelle.
        {
            const satz = r.parseChatToDsl("baue dorf hier");
            const haeuserVon = async (quelle, wo, gier) => {
                st.playerMesh.position.set(wo.x, wo.y, wo.z);
                st.yaw = gier;
                const vorM = new Set(st.architectures);
                r.dslRun(satz.program, { source: quelle });
                let n = -1;
                let ruhig = 0;
                for (const weiter = window.__deckel("die Häuser des Dorfs", 240); ruhig < 6 && weiter(); ) {
                    await sleep(250);
                    const k = st.architectures.filter((a) => !vorM.has(a) && /^haus_/.test(a.type || "")).length;
                    ruhig = k > 0 && k === n ? ruhig + 1 : 0;
                    n = k;
                }
                const neuM = st.architectures.filter((a) => !vorM.has(a) && /^haus_/.test(a.type || ""));
                const orte = neuM.map((a) => ({ x: a.position.x, z: a.position.z }));
                for (const a of st.architectures.filter((a) => !vorM.has(a)).reverse()) r.removeArchitecture(a);
                return orte;
            };
            st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
            st.yaw = best.yaw;
            const sprecher = await haeuserVon("human", { x: P.x, y: P.y + 2.2, z: P.z }, best.yaw);
            const mx = P.x + 200;
            const mz = P.z + 140;
            const mitspieler = await haeuserVon("remote:linse", { x: mx, y: r.getTerrainHeightAt(mx, mz) + 1.2, z: mz }, best.yaw + 2.1);
            m.mpHaeuser = [sprecher.length, mitspieler.length];
            let maxD = 0;
            for (const a of sprecher) {
                let dmin = Infinity;
                for (const b of mitspieler) dmin = Math.min(dmin, Math.hypot(a.x - b.x, a.z - b.z));
                maxD = Math.max(maxD, dmin);
            }
            m.mpAbweichung = sprecher.length && mitspieler.length ? +maxD.toFixed(2) : null;
            m.hierNaechstes = sprecher.length ? +Math.min(...sprecher.map((a) => Math.hypot(a.x - P.x, a.z - P.z))).toFixed(1) : null;
            m.hierWeitestes = sprecher.length ? +Math.max(...sprecher.map((a) => Math.hypot(a.x - P.x, a.z - P.z))).toFixed(1) : null;
            st.playerMesh.position.set(P.x, P.y + 2.2, P.z);
            st.yaw = best.yaw;
        }
        // DER GESPERRTE SLOT: ein Slot am Rand des Genesis-Platzes (sein Grundriss reicht 2 m in die Lichtung; die Rückseite
        // des Hauses, lokal +z, zeigt von ihr weg) trägt seinen Boden y wie jeder Slot des Plans v2 — die Bau-Wand
        // (`_bauFrei`) wirft ihn an seinem Ort, kein Haus steht (K10: der Plan ist das Dorf, die Ersatz-Orte fielen). Die
        // Lichtung ist seit K52 der Platz der Scheibe UND des Rings der Tore (`_grundrissVon` der Plattform).
        const f = r._foundry;
        const kultur = Object.keys(f.recipes).find((id) => f.recipes[id] && f.recipes[id].kind === "haus" && st.blueprints["haus_" + id]);
        const R = r._grundrissVon(pl).lichtung;
        const HALB = 3;
        const rand = R + HALB - 2;
        const slot = { kultur, x: fx * rand, z: fz * rand, y: r.getTerrainHeightAt(P.x + fx * rand, P.z + fz * rand), phi: best.yaw, seed: 7, obb: { cx: fx * rand, cz: fz * rand, ex: HALB, ez: HALB } };
        const vor2 = new Set(st.architectures);
        const logVor = st.logBuffer.length;
        const ok = r._spawnSettlementSlot(slot, { x: P.x, z: P.z }, f, {});
        const haus = st.architectures.find((a) => !vor2.has(a) && /^haus_/.test(a.type || ""));
        m.gesperrtSteht = !!ok || !!haus;
        // laut: der Slot fällt an der Wand, nicht am fehlenden Boden (der fail-closed-Ruf „trägt keinen Boden y")
        m.gesperrtLaut = !ok && !st.logBuffer.slice(logVor).some((z) => /trägt keinen Boden y/.test(z));
        m.gesperrtGrund = m.gesperrtLaut ? "" : "der Slot fiel am fehlenden Boden, nicht an der Bau-Wand";
        if (haus) {
            m.gesperrtAbstand = +Math.hypot(haus.position.x - P.x, haus.position.z - P.z).toFixed(2);
            m.gesperrtImBau = m.gesperrtAbstand < R + HALB - 0.05; // der Grundriss des Hauses reicht in die Scheibe
            r.removeArchitecture(haus);
        }
        // D8: ein KI-Programm und eine Absage im Chat
        const z1 = zeilen().length;
        const llm = st.llm;
        const altE = llm.enabled;
        const altCall = r.llmCall;
        const altProv = llm.provider;
        llm.enabled = true;
        llm.provider = "ollama";
        r.llmCall = async () => ({ say: "Gern.", program: ["spawn_studio", "birke", ["at", P.x + 60, P.y, P.z + 60], 1] });
        try {
            await r.maybeAnswerWithLlm("pflanz eine birke weit weg", (t) => r._chatEcho(t));
        } finally {
            r.llmCall = altCall;
            llm.enabled = altE;
            llm.provider = altProv;
        }
        r._chatEcho(r._dslAbsageSatz([{ event: "op_exception", fehler: "x" }]));
        k.zeilen = k.zeilen.concat(zeilen().slice(z1));
        for (const a of st.architectures.filter((a) => !vor.has(a) && /^baum_birke/.test(a.type)).reverse()) r.removeArchitecture(a);
        k.gestartet = true;
        m.gestartet = true;
    } catch (e) {
        out.dorf = Object.assign(out.dorf || {}, { err: (e && e.stack) || String(e) });
    }
    return out;
}

hauptLauf(async () => {
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST — die Ankunfts-Linse nennt ihre Täter ===");
        const l2aTerme = ["welt", "boden", "horizont", "licht", "leib", "buch", "bauten", "pflanzung", "streu", "karten", "dorf"];
        // die gesunden Köpfe der Ankunft (ihre Mutanten tauschen je einen Teil)
        const koepfe = { orte: [{ wer: "die Nah-Wiese", art: "gras L1", blick: true }, { wer: "der Gesetz-Fit", art: "blume L0", blick: true }], leib: { bestellt: ["vor L1 Kopf", "nach L0"], ohneFein: true, baut: ["vor 1", "nach 0"] }, dorf: { kopf: true, export: true, kopfRang: true } };
        // der kleine Satz der Stand-Zeile (je Mutante ein Fall getauscht)
        const l2Klein = { ohneBoden: { weg: false, stand: "Boden" }, baumUngebaut: { weg: false, stand: "1 Bäume und Bauten wachsen" }, karteOffen: { weg: false, stand: "1 ferne Bäume" }, allesSteht: { weg: true }, lueckeRuht: { weg: true, warn: 1 } };
        // der ruhende Vorrat: keine Streu aufgeschoben, jede Phase „wartet auf das erste Bild"
        const vorratRuhe = { streu: { aufgeschoben: false, zellen: 0 }, PH: { wartet: "wartet auf das erste Bild", bestellt: "bestellt" }, phaseStart: "wartet auf das erste Bild", phaseVorBild: "wartet auf das erste Bild" };
        // die gesunde Ankunft aus der Ferne und der ruhende Vorrat (je Mutante ein Teil getauscht); ein Satz mit einem getauschten Teil
        const ank = (x) => ({ n: 40, fein: [], zwilling: [], nahKarte: 2, nahDanach: 0, soll: 1, wahl: 1, dB: 11.4, ...x });
        const vr = (x) => ({ ohneLeser: [], karten: 0, fehltNeu: [], ...vorratRuhe, ...x });
        const mitFall = (a, x) => ({ ...a, ...x });
        // ein Fall, der das Bild hält (Stand und Term), und einer, vor dem der Ladeschirm weicht
        const halt = (stand, t) => ({ weg: false, stand, warn: 0, terme: [t] });
        const weicht = { weg: true, stand: "", warn: 0, terme: [] };
        const hilfeGut = { unbekannt: false, fehlt: [], tastenFehlen: [], v1: true }; // die Antwort auf „hilfe“, die alles nennt
        const l2aFaelle = {
            ohneBoden: halt("der Boden wächst (Ring 0 von 3)", "boden"),
            baumUngebaut: halt("1 Bäume und Bauten wachsen", "bauten"),
            streuNie: halt("6 Wald-Stücke warten auf ihre Gestalt", "streu"),
            karteOffen: halt("1 ferne Bäume werden gemalt", "karten"),
            ...Object.fromEntries(["bodenHinten", "baumHinten", "karteHinten", "pflanzungHinten"].map((k) => [k, weicht])),
            weltFehlt: halt("die Welt entsteht", "welt"),
            buchZu: halt("das Buch der Studios öffnet sich", "buch"),
            leibFehlt: halt("der Spieler erhält seinen Leib", "leib"),
            pflanzung: halt("1 Bäume werden gepflanzt", "pflanzung"),
            saat: halt("1 Wald-Böden werden bepflanzt", "pflanzung"),
            horizont: halt("der Horizont wächst (0 %)", "horizont"),
            licht: halt("das Licht des Orts wird gemessen", "licht"),
            dorfExport: halt("das Dorf wird geplant", "dorf"),
            dorfSchlange: halt("1 Häuser des Dorfs wachsen", "dorf"),
            dorfFaellig: halt("das Dorf wird gegründet", "dorf"),
            allesSteht: { weg: true, stand: "", warn: 0 },
            lueckeRuht: { weg: true, stand: "", warn: 1 },
            lueckeFlackert: { weg: true, stand: "", warn: 1 },
            lueckeArbeitet: halt("das Buch der Studios öffnet sich", "buch"),
        };
        const faelle = [
            [
                "L2a",
                ladeschirmVerdict,
                {
                    gestartet: true,
                    imHtml: true,
                    htmlVersteckt: false,
                    zIndex: 2147483000,
                    nachBootWeg: true,
                    tastenHinter: { w: false, enter: "BODY", omnibox: false },
                    weichtGanz: { hidden: true, display: "none", animationen: 0 },
                    faelle: l2aFaelle,
                    terme: l2aTerme,
                    rang: { vorBild: "blick", nachBild: "hinten,blick,vorrat", bahnen: { leib: "w1", "export-settlement": "w2", tor0: "w0", tor1: "w0", tor2: "w0", tor3: "w0" } },
                    rundblick: { N: 240, loecher: 0, erstes: null, spaet: true, griff: 40 },
                    ankunft: ank(),
                    koepfe,
                    wald: { ferne: 169, steht: false, zusage: true, kam: true, rest: 128 },
                    blick: { n: [4, 6], vor1: 1, geweckt: true, nach2: 1 }, takt: { lief: 4 },
                    vorrat: vr({ ohneLeser: ["Wagen gt|1|lod0", "Siedlungs-Probe"], kartenBsp: [], vorBild: [], nachBild: 2, ende: true, phaseBestellung: ['Wagen gt|1: "bestellt"', 'Siedlungs-Probe: "bestellt"'] }),
                },
                [
                    ["ein Loch hinter dem Spieler hält das erste Bild", { faelle: mitFall(l2aFaelle, { baumHinten: { weg: false, stand: "1 Bäume und Bauten wachsen" } }) }, "mit einem Baum hinter dem Spieler ohne Gestalt hält der Ladeschirm"],
                    ["ein Loch im Blick weicht (B3d)", { faelle: mitFall(l2aFaelle, { karteOffen: weicht }) }, "mit der offenen Karte eines Baums im Blick weicht der Ladeschirm"],
                    ["ein Loch im Rundblick nach N Takten (B3d)", { rundblick: { N: 240, loecher: 3, erstes: "Takt 120 (180°): 3 Bäume und Bauten wachsen", spaet: true, griff: 40 } }, "der Rundblick nach der Kontrolle zählt 3 Löcher in 240 Takten"],
                    ["der Rang ohne Blick", { rang: { vorBild: "hinten,blick,vorrat", nachBild: "hinten,blick,vorrat" } }, "vor dem ersten Bild sendet die Pumpe „hinten,blick,vorrat\""],
                    ["der Blick-Schlüssel überlebt das Bild", { rang: { vorBild: "blick", nachBild: "hinten,blick" } }, "nach dem ersten Bild sendet die Pumpe „hinten,blick\""],
                    ["ohne Rundblick", { rundblick: { N: undefined, loecher: 0 } }, "der Rundblick nach der Kontrolle: keine Probe"],
                    ["ohne späten Baum", { rundblick: { N: 240 } }, "der Rundblick ohne späten Baum"],
                    ["die Pflanz-Schlange als FIFO", { rundblick: { N: 240, spaet: 2, griff: -300 } }, "die Pflanz-Schlange setzt die ferne"],
                    ["der Vorrat stellt sich in der Ankunft vor die Leser (K30)", { vorrat: vr({ ohneLeser: ["Wagen gt|1|lod0", "Siedlungs-Probe"], vorBild: ["Wagen gt|1|lod0", "Siedlungs-Probe"], nachBild: 0, ende: true }) }, "vor dem ersten Weltbild bestellt der Vorrat 2 Aufträge ohne Leser des ersten Frames (Wagen gt|1|lod0, Siedlungs-Probe)"],
                    ["der Vorrat stirbt (er wartet ewig)", { vorrat: vr({ vorBild: [], nachBild: 0, ende: true }) }, "der Vorrat bestellt nie"],
                    ["der Vorrat endet nicht", { vorrat: vr({ vorBild: [], nachBild: 0, ende: false }) }, "der Vorrat endet nicht"],
                    ["das Tor wartet auf den Vorrat", { vorrat: vr({ ohneLeser: ["Wagen gt|1|lod0", "Wagen gt|7|lod0", "Siedlungs-Probe"], fehltNeu: ["die Werkstatt backt vor"] }) }, "während der Vorrat läuft, wartet das erste Weltbild („die Werkstatt backt vor\") auf Aufträge ohne Leser des ersten Frames: Wagen gt|1|lod0"],
                    ["die Streu wartet auf den Vorrat statt auf ihr Asset", { vorrat: vr({ ohneLeser: ["Siedlungs-Probe"], streu: { aufgeschoben: true, zellen: 0 } }) }, "während der Vorrat läuft, wartet eine neue Streu-Region auf ihn"],
                    ["der Vorrat bestellt Karten nach der Buchgröße (K30)", { vorrat: vr({ karten: 14, kartenBsp: ["eiche|1"] }) }, "der Vorrat bestellt 14 Karten"],
                    ["der Merker sagt „an“, während der Vorrat auf das Bild wartet", { vorrat: { ohneLeser: ["Siedlungs-Probe"], karten: 0, fehltNeu: [], vorBild: [], nachBild: 1, ende: true, streu: { aufgeschoben: false, zellen: 0 }, PH: { wartet: "wartet auf das erste Bild", bestellt: "bestellt" }, phaseStart: true, phaseVorBild: true, phaseBestellung: ["Siedlungs-Probe: true"] } }, "solange der Vorrat auf das erste Bild wartet, sagt sein Merker `f._vorrat` true"],
                    ["der Vorrat bestellt in der Warte-Phase (K30-N1)", { vorrat: vr({ ohneLeser: ["Siedlungs-Probe"], vorBild: [], nachBild: 1, ende: true, phaseBestellung: ['Siedlungs-Probe: "wartet auf das erste Bild"'] }) }, "der Vorrat bestellt, ohne dass sein Merker „bestellt\" sagt: Siedlungs-Probe"],
                    ["der Vorrat ohne Phase (K30-N1)", { vorrat: { ohneLeser: ["Siedlungs-Probe"], karten: 0, fehltNeu: [], vorBild: [], nachBild: 1, ende: true, streu: { aufgeschoben: false, zellen: 0 } } }, "der Vorrat nennt keine Phase"],
                    ["der Vorrat ohne Probe", { vorrat: undefined }, "der Vorrat: keine Probe"],
                    ["die Zusage wartet auf die ganze Schlange", { wald: { ferne: 169, steht: false, zusage: true, kam: true, rest: 0 } }, "die Zusage des Wald-Plans kam erst mit der leeren Schlange"],
                    ["der Wald-Fall ohne fernen Kasten", { wald: { ferne: 0, steht: false, zusage: true, kam: true, rest: 0 } }, "die Zusage des Wald-Plans: kein Fall"],
                    ...[[{ geweckt: false, vor2: 1 }, "das Weltbild wartete auf 1 Zusage außer Blick"], [{ vor1: null }, "das halbe Weltbild"], [{ nach2: null }, "der Rundblick vergisst"], [{ n: [] }, "das Bild der Ankunft: kein Fall"]].map(([b, soll]) => [soll, { blick: { n: [4, 6], vor1: 1, geweckt: true, nach2: 1, ...b } }, soll]), ["Lade-Takt", { takt: { lief: 1 } }, "die Streu setzte im Lade-Takt 3 von 4"], ["ohne Lade-Takt", { takt: undefined }, "der Lade-Takt: kein Fall"],
                    ["ein Term ohne Fall (K60: die Pflanz-Schlange kam ohne Fall)", { terme: l2aTerme.concat(["zauber"]) }, "der Term „zauber“ des ersten Weltbilds hat keinen Fall"],
                    ["ein Fall nennt einen Term außerhalb der Liste", { faelle: mitFall(l2aFaelle, { pflanzung: { weg: false, stand: "1 Bäume werden gepflanzt", warn: 0, terme: ["saat"] } }) }, "der Fall pflanzung nennt den Term „saat“"],
                    ["ohne die Terme", { terme: undefined }, "die Terme des ersten Weltbilds fehlen"],
                    ["das Tor wartet auf seine L0", { ankunft: ank({ fein: ["geisttor 9 m L0"], nahKarte: 0 }) }, "das erste Weltbild wartet auf eine feinere Stufe als die billigste ganze: geisttor 9 m L0"],
                    ["der nahe Baum vor dem Bild ohne Karte", { ankunft: ank({ nahKarte: 0 }) }, "ein naher Baum wünscht vor dem ersten Weltbild L0"],
                    ["die Gestalt verfeinert nie", { ankunft: ank({ nahDanach: 2 }) }, "nach dem ersten Weltbild verfeinert die Gestalt nie"],
                    ["der Kalt-Schätzer als Zwilling", { ankunft: ank({ zwilling: ["geisttor 11 m L0"] }) }, "der Kalt-Schätzer wählt anders als der Stufen-Takt: geisttor 11 m L0"],
                    ["die Ferne hält das Ring-Tor", { ankunft: ank({ wahl: 2 }) }, "die Ferne hält die Stufe: das Tor in 11.4 m wählt L2 statt L1"],
                    ["die Ferne ohne Probe", { ankunft: ank({ soll: undefined }) }, "die Ferne: keine Probe"],
                    ["ohne Ankunfts-Probe", { ankunft: undefined }, "die Ankunft aus der Ferne: keine Probe"],
                    ["die Köpfe ohne Bild-Rang der Bahn", { rang: { vorBild: "blick", nachBild: "hinten,blick,vorrat", bahnen: { leib: "w0", "export-settlement": "w1", tor0: "w2", tor1: "w0", tor2: "w1", tor3: "w2" } } }, "der Kopf der Ankunft geht nicht in eine Bahn ohne Arbeit"],
                    ["ein Tor hinter dem Dorf-Export", { rang: { vorBild: "blick", nachBild: "hinten,blick,vorrat", bahnen: { leib: "w1", "export-settlement": "w2", tor0: "w2", tor1: "w0", tor2: "w0", tor3: "w0" } } }, "tor0 stellen sich hinter einen Kopf der Ankunft"],
                    ["der Leib ohne Kopf-Rang", { koepfe: mitFall(koepfe, { leib: { bestellt: ["vor L1", "nach L0"], ohneFein: true, baut: ["vor 1", "nach 0"] } }) }, "vor dem ersten Bild geht die Grobstufe des Leibs ohne Kopf-Rang"],
                    ["der Bild-Rang ortlos", { koepfe: mitFall(koepfe, { orte: [{ wer: "die Nah-Wiese", art: "gras L1", blick: false }, { wer: "der Gesetz-Fit", art: "blume L0", blick: false }] }) }, "vor dem ersten Bild bestellt die Nah-Wiese gras L1 ohne den Ort"],
                    ["die Probe des Bild-Rangs ohne Gesetz-Fit", { koepfe: mitFall(koepfe, { orte: [{ wer: "die Nah-Wiese", art: "gras L1", blick: true }] }) }, "der Gesetz-Fit bestellt vor dem Bild nichts"],
                    ["der Leib wartet auf die feine Stufe", { koepfe: mitFall(koepfe, { leib: { bestellt: ["vor L0", "vor L1"], ohneFein: false, baut: ["vor 0"] } }) }, "vor dem ersten Bild bestellt der Leib in der Ego-Sicht seine feine Stufe"],
                    ["die feine Stufe tauscht nie ein", { koepfe: mitFall(koepfe, { leib: { bestellt: ["vor L1 Kopf", "nach L0"], ohneFein: true, baut: ["vor 1"] } }) }, "die feine Stufe kam nach dem Bild, der Leib tauscht sie nie ein"],
                    ["der Dorf-Export wartet auf den Takt", { koepfe: mitFall(koepfe, { dorf: { kopf: false, export: false } }) }, "mit dem Buch geht der Export des fälligen Start-Dorfs nicht hinaus"],
                    ["das erste Weltbild ohne Dorf", { faelle: mitFall(l2aFaelle, { dorfSchlange: weicht }) }, "mit den Häusern eines Dorfs der Mesh-Zone in der Schlange weicht der Ladeschirm"],
                    ["das fällige Start-Dorf ohne Fall", { faelle: mitFall(l2aFaelle, { dorfFaellig: undefined }), ohneFall: { dorfFaellig: "der Spieler steht 400 m vom Genesis-Ort (nearM 260)" } }, "mit einem fälligen, noch nicht bestellten Start-Dorf am Genesis-Ort: der Spieler steht 400 m vom Genesis-Ort"],
                    ["eine arbeitende Lücke weicht", { faelle: mitFall(l2aFaelle, { lueckeArbeitet: { weg: true, stand: "", warn: 1, terme: ["buch"] } }) }, "eine arbeitende Lücke weicht wie eine ruhende"],
                    ["ein Fall ohne Grund", { faelle: mitFall(l2aFaelle, { karteOffen: undefined }) }, "mit der offenen Karte eines Baums im Blick: die Probe stellte den Fall nicht her und nennt keinen Grund"],
                    ["kein Ladeschirm", { imHtml: false }, "kein Ladeschirm im HTML"],
                    ["unter der UI", { zIndex: 5 }, "der Ladeschirm liegt unter der UI"],
                    ["stumme Stand-Zeile", { faelle: mitFall(l2Klein, { ohneBoden: { weg: false, stand: "" } }) }, "ohne Boden unter dem Spieler nennt die Stand-Zeile"],
                    ["bleibt, wenn alles steht", { faelle: mitFall(l2Klein, { allesSteht: { weg: false, stand: "?" } }) }, "steht alles, bleibt der Ladeschirm"],
                    ["ruhende Lücke hält fest", { faelle: mitFall(l2Klein, { lueckeRuht: { weg: false, warn: 0 } }) }, "eine ruhende Lücke hält den Spieler"],
                    ["ruhende Lücke still", { faelle: mitFall(l2Klein, { lueckeRuht: { weg: true, warn: 0 } }) }, "eine ruhende Lücke weicht ohne Wort"],
                    ["blockt die Linsen", { nachBootWeg: false }, "nach dem Boot"],
                    ["Schleife fragt das Weltbild nicht", { schleifeFragt: false }, "die Render-Schleife fragt das Weltbild nicht"],
                    ["flackernde Lücke ohne Deckel", { faelle: mitFall(l2Klein, { lueckeFlackert: { weg: false, warn: 0 } }) }, "eine flackernde Lücke hält den Ladeschirm ohne Grenze"],
                    ["W hinter dem Ladeschirm", { tastenHinter: { w: true, enter: "BODY", omnibox: false } }, "hinter dem Ladeschirm läuft W"],
                    ["Enter hinter dem Ladeschirm", { tastenHinter: { w: false, enter: "chat-input", omnibox: false } }, "hinter dem Ladeschirm öffnet Enter"],
                    ["Strg+K hinter dem Ladeschirm", { tastenHinter: { w: false, enter: "BODY", omnibox: true } }, "hinter dem Ladeschirm öffnet Strg+K die Omnibox"],
                    ["weicht nicht aus dem Layout (0710-11)", { weichtGanz: { hidden: true, display: "flex", animationen: 1 } }, "der Ladeschirm weicht nicht aus dem Layout"],
                ],
            ],
            ["L1", kreuzVerdict, { gestartet: true, da: true, sichtbar: true, dx: 0, dy: 0, mitSchublade: false, nachSchublade: true }, [["kein Fadenkreuz", { da: false }, "kein Fadenkreuz"], ["daneben", { dx: 7 }, "das Fadenkreuz steht 7/0 px"], ["über der Werkstatt", { mitSchublade: true }, "das Fadenkreuz steht über der offenen Werkstatt"]]],
            [
                "L2b",
                hilfeVerdict,
                {
                    gestartet: true,
                    unbekanntListe: false,
                    antworten: { hilfe: hilfeGut, help: hilfeGut, "?": hilfeGut },
                },
                [["hilfe unbekannt", { antworten: { hilfe: { unbekannt: true, erste: "Unbekannter Befehl. Meintest du: 'warte'?", fehlt: [], tastenFehlen: [], v1: false }, help: hilfeGut, "?": hilfeGut } }, "„hilfe\" ist unbekannt"], ["Liste von Hand", { unbekanntListe: true }, "der Satz für Unbekanntes trägt eine Liste von Hand"], ["Tafel halb", { antworten: { hilfe: { ...hilfeGut, fehlt: ["folge mir"] }, help: hilfeGut, "?": hilfeGut } }, "„hilfe\" nennt 1 Beispiel"]],
            ],
            ["L3", gespraechVerdict, { gestartet: true, enterFokus: "chat-input", wImFeld: false, gesendet: true, nachSenden: "BODY", wNachSenden: true, nachEsc: "BODY", enterAufKnopf: "knopf" }, [["Enter öffnet nichts", { enterFokus: "BODY" }, "Enter öffnet das Gespräch nicht"], ["Fokus bleibt im Feld", { nachSenden: "chat-input", wNachSenden: false }, "nach dem Senden bleibt der Fokus im Feld"], ["Esc hält das Feld", { nachEsc: "chat-input" }, "Esc gibt die Welt nicht zurück"], ["Enter stiehlt dem Knopf den Fokus", { enterAufKnopf: "chat-input" }, "Enter auf einem fokussierten Knopf öffnet das Gespräch"]]],
            [
                "L7",
                gurtVerdict,
                {
                    gestartet: true,
                    buch: true,
                    hotbar: ["baum_eiche", "fahrzeug_gt", "tor_drachentor", "haus_alemannisch"],
                    eintraege: [
                        { name: "baum_eiche", sichtbar: true, art: "tree", platzierbar: true },
                        { name: "fahrzeug_gt", sichtbar: true, art: "vehicle", platzierbar: true },
                        { name: "tor_drachentor", sichtbar: true, art: "gate", platzierbar: true },
                        { name: "haus_alemannisch", sichtbar: true, art: "haus", platzierbar: true },
                    ],
                    katalogArten: ["tree", "vehicle", "gate", "haus"],
                },
                [
                    [
                        "Alt-Gurt (Befund)",
                        {
                            hotbar: ["stein_block", "waterfall", "damm"],
                            eintraege: [
                                { name: "stein_block", sichtbar: false, altDoppel: "basalt", art: null, platzierbar: true },
                                { name: "waterfall", sichtbar: true, art: null, platzierbar: true },
                                { name: "damm", sichtbar: true, art: null, platzierbar: true },
                            ],
                        },
                        "stein_block ist im Katalog versteckt (Alt-Doppel → basalt)",
                    ],
                    ["leer", { hotbar: [], eintraege: [] }, "der Start-Gurt ist leer"],
                ],
            ],
            [
                "LK",
                kameraVerdict,
                {
                    gestartet: true,
                    baum: "baum_tanne",
                    weltSkala: 3.6,
                    stammSkala: 3.6,
                    wege: {
                        fuss: { proben: 300, pflanzeHaelt: 0, armIst: 4.1, armSoll: 4.1, taeter: [], spruenge: 0, spruengeSoll: 0, spruengePflanze: 0, hinausSprung: 0, sprungM: 1 },
                        ritt: { proben: 300, pflanzeHaelt: 0, armIst: 9.6, armSoll: 9.6, taeter: [], spruenge: 1, spruengeSoll: 1, spruengePflanze: 0, hinausSprung: 0, sprungM: 2 },
                    },
                    stoffe: 6,
                    stoffeOhne: 0,
                    stoffeOhneArten: [],
                    schattenGeschnitten: 0,
                    zielFolgt: true,
                    kreuzAbstand: 0.6,
                    zielAbstand: 0.6,
                    fadenkreuz: { stellungen: 96, hinten: {}, kreatur: true, zielAchse: 0 },
                    konsum: { _hasMagnifyingInSight: true, _pickScatterAtCrosshair: true, _kampfKlingenAchse: true, _kameraDurchsichtNode: true },
                    durchsicht: {
                        formel: true,
                        first: { anlaeufe: 8, faellt: 0, abstand: [0.3, 0.8], wMin: 1, punkte: 900 },
                        third: { anlaeufe: 4, faellt: 0, abstand: [3.8, 5.6], wMin: 1, punkte: 400 },
                        zwischen: { stellungen: 40, wirkt: 40, wMax: 0 },
                    },
                },
                [
                    ["Vorlagen-Maß", { stammSkala: 1 }, "Stamm-Hülle im Vorlagen-Maß"],
                    ["Wagendach", { wege: { fuss: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 0 }, ritt: { proben: 2400, pflanzeHaelt: 641, armIst: 2.0, armSoll: 9.6, taeter: ["Stamm (Natur-Blocker am Kamera-Strahl)"], spruenge: 137, spruengeSoll: 0, spruengePflanze: 137, hinausSprung: 60, sprungM: 2 } } }, "ritt: eine Pflanze hält die Kamera in 641 von 2400"],
                    ["2-m-Minimum zu Fuß", { wege: { fuss: { proben: 400, pflanzeHaelt: 172, armIst: 2.0, armSoll: 4.1, taeter: ["Stamm (Natur-Blocker am Kamera-Strahl)"], spruenge: 5, spruengeSoll: 0, spruengePflanze: 5, hinausSprung: 2, sprungM: 1 }, ritt: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 0 } } }, "fuss: eine Pflanze hält die Kamera"],
                    ["Sprung hinaus", { wege: { fuss: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 3, sprungM: 1 }, ritt: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 0 } } }, "fuss: die Kamera springt 3× hinaus"],
                    ["Nadelwand ohne Durchsicht", { stoffeOhne: 6, stoffeOhneArten: ["foliageTex", "bark"] }, "6 von 6 Pflanzen-Stoffen ohne Durchsicht"],
                    ["Durchsicht im Schatten", { schattenGeschnitten: 2 }, "2 Pflanzen-Stoff(e) schneiden die Durchsicht auch in den Schatten"],
                    ["Ziel ohne Brust", { zielFolgt: false, zielAbstand: 3.2 }, "das Ziel der Durchsicht folgt der Brust nicht"],
                    ["Fadenkreuz auf dem Kopf", { kreuzAbstand: 0.02 }, "das Fadenkreuz steht in 3rd auf der Figur"],
                    ["das Ziel ist die Brust, nicht der Blickpunkt", { fadenkreuz: { stellungen: 96, hinten: {}, kreatur: true, zielAchse: 0.597 } }, "Fadenkreuz-Strahl: das Ziel der Kamera liegt 0.597 m neben ihrem Blick"],
                    ["Fadenkreuz trifft hinten", { fadenkreuz: { stellungen: 96, hinten: { _pickArchitectureAtCrosshair: 76, _raycastWorldHit: 67 }, kreatur: true, zielAchse: 0 } }, "Fadenkreuz-Strahl: `_pickArchitectureAtCrosshair` trifft in 76 von 96 Stellungen HINTER dem Spieler"],
                    ["Kreatur fehlt", { fadenkreuz: { stellungen: 96, hinten: {}, kreatur: false, zielAchse: 0 } }, "Fadenkreuz-Strahl: keine Kreatur"],
                    ["Lupe ohne den EINEN Strahl", { konsum: { _hasMagnifyingInSight: false } }, "Konsum: `_hasMagnifyingInSight`"],
                    ["Loch im Stamm im 1st", { durchsicht: { formel: true, first: { anlaeufe: 8, faellt: 8, abstand: [0.12, 0.82], wMin: 0 }, third: { anlaeufe: 4, faellt: 0, abstand: [4], wMin: 1 }, zwischen: { stellungen: 40, wirkt: 40, wMax: 0 } } }, "Durchsicht 1st am Stamm: die Rinde fällt in 8 von 8 Anläufen"],
                    ["Loch im Stamm vor dem Spieler", { durchsicht: { formel: true, first: { anlaeufe: 8, faellt: 0, abstand: [0.3], wMin: 1 }, third: { anlaeufe: 4, faellt: 4, abstand: [3.8], wMin: 0 }, zwischen: { stellungen: 40, wirkt: 40, wMax: 0 } } }, "Durchsicht 3rd, der Stamm VOR dem Spieler: die Rinde fällt"],
                    ["Durchsicht wirkt nicht", { durchsicht: { formel: true, first: { anlaeufe: 8, faellt: 0, abstand: [0.3], wMin: 1 }, third: { anlaeufe: 4, faellt: 0, abstand: [3.8], wMin: 1 }, zwischen: { stellungen: 40, wirkt: 0, wMax: 1 } } }, "Durchsicht 3rd: der Stamm zwischen Kamera und Spieler steht in 40 von 40"],
                    ["keine EINE Formel", { durchsicht: { formel: false } }, "Durchsicht: keine EINE Formel"],
                ],
            ],
            ["LH", huelleVerdict, { h: [0, 1, 3, 0], r: [false, true, true, true] }, [["die Hülle wächst vor dem Bild", { h: [1, 0, 3, 0] }, "die Hülle wuchs vor dem Bild"], ["der Ring baut außer Bild ohne Leerlauf", { r: [true, true, false, true] }, "der Ring baut außer Bild ohne Leerlauf"]]], // prettier-ignore
            ["D8", kanalVerdict, { gestartet: true, siedlungImLog: true, zeilen: ["> dorf 7 18", "„Villaalto\" steht vor dir: 20 Häuser.", "(Welt verändert: Grok lässt 1× „Birke\" aus dem Studio wachsen bei (96, 59, 60).)"] }, [["Siedlungs-Zahlen im Chat", { zeilen: ["Siedlung „Villaalto\" (markt, Seed 7): 13 Häuser platziert, 12 Slots übersprungen."] }, "Telemetrie im Chat"], ["rohes Programm", { zeilen: ['(Welt verändert: ["spawn_studio","birke",["at",1,2,3],1])'] }, "Telemetrie im Chat"], ["interne id", { zeilen: ["3× baum_birke aus dem Studio vor dir gewachsen"] }, "interne id im Chat"], ["Ereignis-Name", { zeilen: ["Befehl lief, aber mit Auffälligkeit: op_exception"] }, "Telemetrie im Chat"]]],
            [
                "D6",
                kiVerdict,
                { gestartet: true, status: "Fehler (Ollama): Keine Antwort von 127.0.0.1:4604 — der lokale Dienst läuft nicht", ohneSchluessel: "(Grok schweigt: für Claude fehlt der Schlüssel …)", ursprung: "http://127.0.0.1:4601", proxyUrl: "http://127.0.0.1:4601/api/proxy/llm", proxyFehler: "der Proxy fehlt: … antwortet 404" },
                [
                    ["Aktiv ohne Dienst", { status: "Aktiv: Ollama (lokal oder gehostet) (llama3.2)." }, "der Status sagt"],
                    ["Schweigen ohne Schlüssel", { ohneSchluessel: null }, "ohne Schlüssel schweigt der Chat"],
                    ["Proxy fest auf 4312", { proxyUrl: "http://localhost:4312/api/proxy/llm", proxyFehler: "Proxy nicht erreichbar (läuft 'npm run dev' / save-server auf Port 4312?)." }, "der Proxy fragt einen fremden Server"],
                ],
            ],
            [
                "D9",
                dorfVerdict,
                { gestartet: true, buch: true, haeuser: 20, hinten: 0, cosHinten: [], ausserBild: 0, gesperrtSteht: false, gesperrtLaut: true, mpAbweichung: 0, mpHaeuser: [20, 20] },
                [
                    ["umringt", { haeuser: 13, hinten: 7, cosHinten: ["-0.61", "-0.86", "-0.70"] }, "7 Häuser hinter dem Spieler"],
                    ["gesperrter Slot steht", { gesperrtSteht: true, gesperrtAbstand: 21.3, gesperrtImBau: true }, "ein gesperrter Slot steht"],
                    ["gesperrter Slot fällt still", { gesperrtLaut: false, gesperrtGrund: "der Slot fiel am fehlenden Boden" }, "ein gesperrter Slot fällt still"],
                    ["am Bildrand vorbei", { ausserBild: 3 }, "3 Häuser außerhalb des Bildwinkels"],
                    ["Mitspieler 60 m daneben", { mpAbweichung: 61.4, mpHaeuser: [20, 20] }, "beim Mitspieler steht das Dorf 61.4 m daneben"],
                ],
            ],
        ];
        for (const [kurz, urteil, gesund, brueche] of faelle) {
            check(`Selbst-Test ${kurz}: gesund == 0 Täter`, urteil(gesund).length === 0, urteil(gesund).join(" · "));
            for (const [name, bruch, soll] of brueche) {
                const v = urteil(Object.assign({}, gesund, bruch));
                check(`Selbst-Test ${kurz}: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
            }
        }
        const gruen = wand();
        check("Selbst-Test W: der Arbeitsbaum ist grün", gruen.every((w) => w[1]), gruen.filter((w) => !w[1]).map((w) => w[0]).join(" | "));
        const kopfMit = (n, rein) => [null, new RegExp(`(\\n {4}${n}\\([^)]*\\) \\{)`), `$1 ${rein};`];
        const vorStand = (t) => stammLib.ersetze(t, [
            kopfMit("_chatHandleConversationalFallback", `"'Setze Wetter rainy'"`),
            ["maybeAnswerWithLlm", "(Welt verändert: ${compName} ${this.describeProgram(reply.program)}.)", "(Welt verändert: ${JSON.stringify(reply.program)})"],
            kopfMit("_hasMagnifyingInSight", "this.camera.getWorldDirection(this._v)"),
            ["_foundryIngestBook", "this._buchKoepfe();", ""],
        ]);
        const rot = wand(vorStand);
        check(
            "Selbst-Test W: der Vor-Stand (Liste von Hand, rohes Programm, eine eigene Kamera-Richtung, ein Buch ohne Köpfe) → W1, W6, W7, W8 feuern",
            rot.filter((w) => !w[1]).length === 4,
            rot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" ")
        );
        selbsttestEnde(errs, "die Ankunfts-Linse nennt ihre Täter beim Namen.");
        process.exit(0);
    }

    console.log("=== W — DIE STATISCHE WAND (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of wand()) check(name, ok, detail);

    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 600000 });
    await page.setViewport({ width: 1280, height: 720 });
    // Der statische Ladeschirm (vor dem Spiel): sichtbar, über allem — gelesen im Ereignis DOMContentLoaded, nie danach (ein
    // schneller Boot ließ ihn weichen, ehe das Protokoll fragte); L2a trägt den Befund
    await page.evaluateOnNewDocument(() =>
        document.addEventListener("DOMContentLoaded", () => {
            const l = document.getElementById("ladeschirm");
            window.__ladeHtml = l ? { imHtml: true, htmlVersteckt: !!l.hidden, zIndex: +getComputedStyle(l).zIndex || 0 } : { imHtml: false };
        })
    );
    await server.zeige(page, 30000);
    // LS: Boot und 40 Takte über 8 s Spielzeit vor dem Laden der späten Module, die Probe-Frage, dann gibt der Server sie frei
    await page.waitForFunction(() => r?._gameLoopTick, { timeout: 120000 });
    const sieht = await page.evaluate(() => {
        for (let i = 0; i < 40; i++) r._gameLoopTick(performance.now() + i * 200);
        void r.__zeuge;
        return window.__vorSpaet.has("__zeuge");
    });
    frei();
    // Der KI-Endpunkt der D6-Probe: ein Port, auf dem nichts lauscht.
    const out = await page.evaluate(probe, { kiPort: PORT + 3 });
    await browser.close();
    server.close();

    const zeige = (kurz, name, m, urteil, zeile) => {
        const mm = m || {};
        if (mm.err) check(`${kurz} Probe ohne Ausnahme`, false, mm.err.split("\n")[0]);
        const v = urteil(mm);
        check(`${kurz} ${name}`, v.length === 0, `${mm.gestartet ? zeile(mm) : "nicht gestartet"}${v.length ? " — Täter: " + v.join(", ") : ""}`);
    };
    console.log("=== L2a · L1 · L2b · L3 · L7 — ANKOMMEN ===");
    zeige(
        "L2a",
        "das erste Bild ist der Ladeschirm, er weicht dem Weltbild im BLICK (Boden, Horizont, Leib; Bäume, Bauten, Streu und Karten im Blick), der Rundblick danach ohne Loch",
        out.lade,
        ladeschirmVerdict,
        (m) =>
            `im HTML ${m.imHtml} · z ${m.zIndex} · ` +
            Object.entries(m.faelle || {})
                .map(([k, z]) => `${k}: ${z.weg ? "weicht" : "bleibt"}${z.stand ? ` („${z.stand}")` : ""}${z.warn ? " + WARN" : ""}`)
                .join(" · ") +
            (m.baumD != null ? ` · Baum ${m.baumD} m` : "") +
            (m.rundblick ? ` · Rundblick ${m.rundblick.loecher} Löcher in ${m.rundblick.N} Takten, rundum ganz ab Takt ${m.rundblick.rundumAb}, Schlange ${m.rundblick.spaet}` : "") +
            (m.rang ? ` · Pumpe vor dem Bild „${m.rang.vorBild}", danach „${m.rang.nachBild}"` : "") +
            (m.wald ? ` · Wald-Zusage ${m.wald.kam ? `kam, ${m.wald.rest} von ${m.wald.ferne} fernen Zellen offen` : "kam nicht"}` : "") +
            (m.blick ? ` · Bild ${m.blick.geweckt}/${m.blick.vor2} · Takt ${m.takt.lief}` : "") +
            ((K) => (K && K.leib ? ` · Köpfe (B5): Bild-Rang ${K.orte.filter((o) => o.blick).length}/${K.orte.length} im Blick, Leib bestellt ${K.leib.bestellt.join(" · ")}, baut ${(K.leib.baut || []).join(" · ")}, Dorf-Export mit dem Buch ${!!K.dorf.export}` : ""))(m.koepfe) +
            (m.tastenHinter ? ` · hinter dem Ladeschirm: W ${m.tastenHinter.w ? "läuft" : "ruht"}, Enter → ${m.tastenHinter.enter}, Strg+K → Omnibox ${m.tastenHinter.omnibox ? "offen" : "zu"}` : "")
    );
    zeige("LH", "was das Bild nicht liest, hält es nicht: die Hülle nach dem Bild, der Ring außer Bild im Leerlauf", out.huelle, huelleVerdict, (m) => `Hülle [Skelette vor dem Bild, offen, Boxen danach, offen] ${m.h} · Ring [hinten ohne Leerlauf, vorn, Ruf, hinten mit] ${m.r}`); // prettier-ignore
    zeige("L1", "das Fadenkreuz steht in der Bildmitte und weicht der Schublade", out.kreuz, kreuzVerdict, (m) => `da ${m.da} · Mitte ${m.dx}/${m.dy} px · mit Werkstatt ${m.mitSchublade} · danach ${m.nachSchublade}`);
    zeige("L2b", "„hilfe\" nennt die EINEN Tafeln und die Tasten", out.hilfe, hilfeVerdict, (m) => Object.entries(m.antworten || {}).map(([w, z]) => `„${w}": ${z.unbekannt ? "unbekannt" : `${(z.fehlt || []).length} fehlen`}`).join(" · "));
    zeige("L3", "Enter öffnet das Gespräch, Enter sendet und gibt die Welt zurück, Enter auf einem Knopf gehört dem Knopf", out.gespraech, gespraechVerdict, (m) => `Enter → ${m.enterFokus} · gesendet ${m.gesendet} · danach ${m.nachSenden} · W ${m.wNachSenden} · Esc → ${m.nachEsc} · Enter auf dem Knopf → ${m.enterAufKnopf}`);
    zeige("L7", "der Start-Gurt liest den Katalog (je Studio-Art ein Werk)", out.gurt, gurtVerdict, (m) => `${(m.hotbar || []).filter(Boolean).join(" · ")} (Arten im Katalog: ${(m.katalogArten || []).join(", ")})`);
    check("LS der Zeuge sieht vor dem Laden der späten Module", sieht, [...SPAET_DATEIEN].join(", "));
    console.log("=== LK — DIE KAMERA UND DER BAUM ===");
    zeige(
        "LK",
        "die 3rd-Kamera rückt nur vor Boden und Bau ein, gleitet hinaus, jeder Pflanzen-Stoff trägt die Durchsicht",
        out.kamera,
        kameraVerdict,
        (m) =>
            `${m.baum} · Stamm × ${m.stammSkala} (Welt × ${m.weltSkala}) · ` +
            ["fuss", "ritt"]
                .map((k) => {
                    const z = (m.wege || {})[k] || {};
                    return `${k}: ${z.proben} Proben, Pflanze hält ${z.pflanzeHaelt}, Arm ${z.armIst}/${z.armSoll} m (Ist/Soll), < 3 m ${z.unter3}, Sprünge ${z.spruenge} (Soll ${z.spruengeSoll}, hinaus ${z.hinausSprung})`;
                })
                .join(" · ") +
            ` · Pflanzen-Stoffe ${m.stoffe}, ohne Durchsicht ${m.stoffeOhne}, Ziel ${m.zielAbstand} m neben der Brust, Fadenkreuz ${m.kreuzAbstand} m neben der Brust` +
            ((fk) => ` · Fadenkreuz-Strahl: ${fk.stellungen} Stellungen, hinter dem Spieler ${JSON.stringify(fk.hinten || {})}, Ziel neben dem Blick ${fk.zielAchse} m`)(m.fadenkreuz || {}) +
            ((ds) =>
                ds.formel
                    ? ` · Durchsicht: 1st ${(ds.first || {}).faellt}/${(ds.first || {}).anlaeufe} Anläufe mit fallender Rinde (Auge ${((ds.first || {}).abstand || []).join("/")} m), 3rd vor dem Spieler ${(ds.third || {}).faellt}/${(ds.third || {}).anlaeufe}, zwischen Kamera und Spieler fällt ${(ds.zwischen || {}).wirkt}/${(ds.zwischen || {}).stellungen}`
                    : " · Durchsicht: keine EINE Formel")(m.durchsicht || {})
    );
    console.log("=== D8 · D6 · D9 — DIE STIMME UND DAS DORF ===");
    zeige("D8", "der Spieler-Chat trägt Worte, das Log die Zahlen", out.kanal, kanalVerdict, (m) => `${(m.zeilen || []).filter((z) => !/^> /.test(z)).length} Zeilen · Log ${m.siedlungImLog}`);
    zeige("D6", "die KI nennt die Ursache (Dienst · Schlüssel · Proxy)", out.ki, kiVerdict, (m) => `Status „${(m.status || "").slice(0, 60)}" · ohne Schlüssel „${(m.ohneSchluessel || "—").slice(0, 60)}" · Proxy ${m.proxyUrl}`);
    zeige("D9", "das Dorf steht vor dir, ein gesperrter Slot fällt an seinem Ort", out.dorf, dorfVerdict, (m) => `${m.haeuser} Häuser (Log: ${m.platziert} platziert, ${m.uebersprungen} übersprungen) · hinten ${m.hinten} · außer Bild ${m.ausserBild} · gesperrter Slot steht ${m.gesperrtSteht}, laut ${m.gesperrtLaut} · „${m.dorfZeile}" · baue dorf hier: ${m.hierNaechstes}–${m.hierWeitestes} m, beim Mitspieler ${m.mpAbweichung} m daneben (Häuser ${(m.mpHaeuser || []).join(" / ")})`);
    wandEnde(errs, "die Ankunft trägt ihre benannten Schnitte.");
});

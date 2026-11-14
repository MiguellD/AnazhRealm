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
//       DIE KRONE VOR DER KACHEL (w28-krone-vor-kachel): eine Kachel der Nah-Wiese, ihrer Ferne oder der Nah-Streu wächst erst,
//       wenn über ihr keine Krone mehr kommt (`_kroneKommt`) — je Bauer gebaut ÷ stehend = 1, keine fällt mit einer Krone.
//   L1  DAS FADENKREUZ — `#fadenkreuz` steht in der Bildmitte (dort trifft `_blickZiel`), weicht einer offenen Schublade.
//   L2b DIE HILFE — „hilfe" / „help" / „?" nennt jedes Beispiel der EINEN Tafeln (`chatDslPatterns`, `chatSystemPatterns`,
//       ihre `hilfe`-Sätze) und jede Taste (`KEYBINDING_LABELS`); der Satz für Unbekanntes trägt keine zweite Liste.
//   L3  DAS GESPRÄCH — Enter öffnet das Feld, Enter im Feld sendet und gibt die Welt zurück (W läuft wieder), Esc ohne
//       Senden; Enter auf einem fokussierten Knopf gehört dem Knopf.
//   L7  DER START-GURT — die Hotbar eines neuen Spielers liest den Katalog (`_katalogSichtbar`): je Studio-Art EIN Werk (die
//       Art: `_gurtArt`, der kind des Rezepts, am Ort sein Ort — der Spielplatz zählt einmal).
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
const { fehlerText, statikServer, hauptLauf, pruefer, wandEnde, selbsttestEnde, SELBSTTEST, stammLib, jsonKlon, fehlerStapel, nullWelt, bruchFaelle, probeUrteil, ausDatei, ROOT } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.ANKUNFT_PORT || 4601);

const { errs, check } = pruefer();

// ── DIE VERDIKTE (pure Funktionen; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
const startFehlt = (m) => !m || m.gestartet !== true; // jedes Verdikt: ohne Start kein Urteil
// DER VORRAT EINES STANDS (w28-tiere-nach-bild): so lange dürfen Vorlagen und Glieder der Wesen eines geladenen Stands nach dem
// Bild brauchen, bevor sie wiederkehren (die Probe misst im warmen Null-Boot; GTX 1050 im echten Boot 3,9–5,1 s für 7–10 Wesen)
const WIEDERKEHR_SOLL_MS = 15000;
function ladeschirmVerdict(m) {
    if (startFehlt(m)) return ["start"];
    const out = [];
    if (!m.imHtml) out.push("kein Ladeschirm im HTML (das erste Bild ist die schwarze Leinwand)");
    else {
        if (m.htmlVersteckt) out.push("der Ladeschirm steht im HTML versteckt");
        if (!(m.zIndex >= 1000000)) out.push(`der Ladeschirm liegt unter der UI (z-index ${m.zIndex})`);
    }
    // DIE QUITTUNG DER GEBURT (w28-faden-quelle): der Faden, der sein `ack` verschluckt, bricht beim Namen; der lebende quittiert
    const qs = m.quittung || {};
    const [stumm, lebt] = [qs.probestumm, qs.probelebt];
    if (qs.err) out.push(`die Quittung der Geburt: die Probe warf — ${qs.err}`);
    else if (!stumm || !lebt) out.push("die Quittung der Geburt: keine Probe");
    else if (stumm.err || lebt.err) out.push(`die Quittung der Geburt: die Probe warf — ${stumm.err || lebt.err}`);
    else {
        if (!stumm.antwort || !lebt.antwort) out.push("die Quittung der Geburt: ein Probe-Faden rechnete seinen Auftrag nicht (die Probe ist blind)");
        if (stumm.quittiert != null) out.push("ein Faden, der sein ack verschluckt, gilt als quittiert (`_nebenFaden` liest die Geburt nicht an ihrer Nummer)");
        else if (!(stumm.bruch > 0)) out.push("ein Faden antwortet, ohne seine Geburt zu quittieren, und bricht nicht beim Namen (`_nebenFaden`)");
        if (lebt.quittiert == null) out.push("ein lebender Faden quittiert seine Geburt nie (`_nebenFaden`: der Geburts-Stand trägt keine Nummer)");
        if (lebt.bruch > 0) out.push("ein lebender Faden bricht als ungewiss");
    }
    // DIE ZWEITE ANFRAGE (w28-faden-quelle): je Datei höchstens die Anfrage der Seite und die EINE der Quelle aller Fäden
    const anf = m.anfragen || {};
    if (!anf["/voxel-worker.js"]) out.push("die Wand der zweiten Anfrage zählt keine Anfrage der Fäden-Quelle (`voxel-worker.js`) — sie ist blind");
    for (const [p, n] of Object.entries(anf)) {
        const darf = (m.seite || []).includes(p) ? 2 : 1;
        if (n > darf) out.push(`${p}: ${n} Anfragen in einem Boot (die Seite ${darf - 1}, die EINE Quelle 1) — ein Faden holt selbst, was ein anderer auch lädt (\`_quelleFaden\`)`); // prettier-ignore
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
        ["zeichnungWartet", "mit einem Bürger des Bilds, dessen Programm noch entsteht (gesetzt, nicht gezeichnet)", /Programm/],
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
    if (rg?.nachBild && rg.vorBild === "blick" && rg.nachBild !== "hinten,blick,vorrat") out.push(`nach dem ersten Bild sendet die Pumpe „${rg.nachBild}" statt nah zuerst rundum mit dem Vorrat („hinten,blick,vorrat") — der Blick-Schlüssel überlebt das Bild (_rangImErstenBlick)`);
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
        for (const [k, z] of Object.entries(f)) for (const t of (z && z.terme) || []) if (!terme.includes(t)) out.push(`der Fall ${k} nennt den Term „${t}“, den WELTBILD_TERME nicht trägt`);
                else if (!z.weg) gedeckt.add(t);
        for (const t of terme)
            if (!gedeckt.has(t)) out.push(`der Term „${t}“ des ersten Weltbilds hat keinen Fall, der den Ladeschirm hält (L2a)`);
    }
    if (!f.allesSteht || !f.allesSteht.weg) out.push(`steht alles, bleibt der Ladeschirm („${(f.allesSteht && f.allesSteht.stand) || ""}"${m.fehltNachBoot?.length ? `, nach dem Boot fehlt ${m.fehltNachBoot.join(" · ")}` : ""})`);
    if (!f.lueckeRuht) out.push(`eine ruhende Lücke: ${ohne("lueckeRuht")}`);
    else if (!f.lueckeRuht.weg) out.push("eine ruhende Lücke hält den Spieler vor der Welt fest");
    else if (!f.lueckeRuht.warn) out.push("eine ruhende Lücke weicht ohne Wort im Log");
    if (!f.lueckeArbeitet) out.push(`eine arbeitende Lücke: ${ohne("lueckeArbeitet")}`);
    else if (f.lueckeArbeitet.weg)
        out.push("eine arbeitende Lücke weicht wie eine ruhende (das halbe Weltbild unter Last, Prüfung K60-1 m1-6B)");
    if (!f.lueckeFlackert) out.push(`eine flackernde Lücke: ${ohne("lueckeFlackert")}`);
    else if (!f.lueckeFlackert.weg) out.push("eine flackernde Lücke hält den Ladeschirm ohne Grenze (kein Deckel)");
    else if (!f.lueckeFlackert.warn) out.push("eine flackernde Lücke weicht ohne Wort im Log");
    // DAS BILD IST GEZEICHNET (w28-bild-ganz): steht die Pipeline eines Wartenden, hält er nichts mehr; kommt sie nie (der
    // Deckel), weicht der Ladeschirm — und der EINE Melder nennt ihn beim Etikett, nie still
    if (!f.zeichnungSteht) out.push(`ein Bürger, dessen Pipeline steht: ${ohne("zeichnungSteht")}`);
    else if (!f.zeichnungSteht.weg) out.push("ein Bürger, dessen Pipeline steht, hält das Bild weiter (`_bildWartet` fällt ihn nicht — das Bild stünde erst mit dem nächsten Lade-Bild)");
    if (!f.zeichnungOhneAussicht) out.push(`ein Bürger ohne Aussicht: ${ohne("zeichnungOhneAussicht")}`);
    else if (!f.zeichnungOhneAussicht.weg) out.push("ein Bürger, dessen Programm nie kommt, hält den Spieler für immer vor der Welt (kein Deckel am Term „zeichnung“)");
    else if (!f.zeichnungOhneAussicht.bruch) out.push("ein Bürger ohne Aussicht weicht ohne Bruch beim Namen (`_bruchMelden`: „WELTBILD NICHT GANZ … <Etikett> nicht gezeichnet“)");
    // DER STUMME FADEN UND DIE OFFENE PFLANZUNG (w28-krone-vor-kachel): gibt die Ruhe ein Bild frei, dem der Wald fehlt, bricht es
    // beim Namen — der Faden, der seit seiner Geburt nie antwortete (`_faedenStumm`), und die Pflanzung; ein Faden, der antwortete, nie
    if (!f.fadenStumm) out.push(`ein Faden ohne ack: ${ohne("fadenStumm")}`);
    else if (!f.fadenStumm.weg) out.push("ein Faden, der nie antwortete, hält den Spieler für immer vor der Welt");
    else if (!(f.fadenStumm.bruch || [])[0]) out.push("ein Faden, der nie antwortete, weicht ohne Bruch beim Namen (`_faedenStumm`: „WELTBILD NICHT GANZ … der Wald-Faden antwortete nie“)");
    else if (!f.fadenStumm.bruch[1]) out.push("eine offene Pflanzung neben einem stummen Faden weicht ohne Bruch beim Namen („WELTBILD NICHT GANZ … mit offener Pflanzung“)");
    if (!f.pflanzungOhneFaden) out.push(`eine offene Pflanzung ohne stummen Faden: ${ohne("pflanzungOhneFaden")}`);
    else if ((f.pflanzungOhneFaden.bruch || [])[0]) out.push("ein Faden, der antwortete, bricht als stumm (`_faedenStumm` zählt seine Nachrichten nicht)");
    else if (!(f.pflanzungOhneFaden.bruch || [])[1]) out.push("eine offene Pflanzung weicht ohne Bruch beim Namen („WELTBILD NICHT GANZ … mit offener Pflanzung“)");
    // DAS PROGRAMM VOR DEN DATEN (w28-leben-vorbau): wessen Programm unter dem Ladeschirm bekannt ist und wessen Daten erst nach dem
    // Bild kommen, baut es als Gast der Ankunft davor — die Kamm-Krone beim Namen; ihre Rechnung bleibt nach dem Bild
    const kv = m.kammVorbau;
    if (!kv) out.push("das Programm der Kamm-Krone vor den Daten: keine Probe (Vorbedingung)");
    else {
        if (!kv.gast) out.push("die Kamm-Krone baut ihr Programm erst nach dem Bild — ihr Takt hängt vor dem ersten Weltbild keinen Gast der Ankunft in die Welt-Szene (`_kammKroneVorbau`): ihr erstes Netz wartet im Gang auf Knoten-Bau und Pipeline");
        else if (kv.art !== "ankunft" || !kv.stoff || kv.form !== "aDeckt,color,normal,position") out.push(`der Gast der Kamm-Krone trägt nicht ihr Programm (Art „${kv.art}“, ihr Stoff ${kv.stoff}, Form ${kv.form}) — sein Bau träfe den Schlüssel des Netzes nicht`);
        if (kv.bestellt) out.push(`die Kamm-Krone bestellt ${kv.bestellt}-mal beim Kamm-Faden vor dem ersten Weltbild — die Rechnung gehört nach dem Bild, nur das Programm davor`);
        if (kv.wahl !== "merken,bauen") out.push(`der Gast der Ankunft baut nicht gleich nach dem Bild („${kv.wahl}“ statt „merken,bauen“: unter dem Ladeschirm · im ersten Bild danach, \`_vorbauWahl\`) — vor dem Bild kostet sein Bau die Ankunft (GTX 1050 kalt, ab dem Buch: +0,5…+1,5 s), und baut er nie, wartet die Krone im Gang auf ihr Programm`);
        if (kv.raum !== "gast,buerger-laut") out.push(`die Gast-Prägung allein nimmt vom Zeichnen aus („${kv.raum}“ statt „gast,buerger-laut“: der Gast der Kamm-Krone · ein Bürger mit Prägung und Maßstab 1, \`_gastOhneRaum\`) — ein echter Bürger, der die Prägung trägt, fehlte im Bild, und keine Zählung nennte ihn`);
    }
    // DIE WELT STEHT, WENN SIE GEZEICHNET IST (w28-welt-steht): nach dem Bild hält ein Bürger der Welt-Szene, dessen Pipeline noch
    // entsteht, und ein Einmal-Render im Bau das Wort „die Welt steht“ (`_weltOffen().zeichnung`, der Grund nennt ihn beim Etikett);
    // steht seine Pipeline, steht die Welt wieder. Bis hier gab `_weltSteht` den Schuss frei, und das Tor stand ohne Membran im Bild
    // (GTX 1050, bild:genesis@0.5 „portal-membran 0,0 %“)
    const sg = m.stehtGezeichnet;
    if (!sg) out.push("die Welt steht ohne ihre Zeichnung: keine Probe (Vorbedingung — `_weltOffen` oder die Erst-Zeichnung fehlt)");
    else {
        for (const [k, wer] of [["bild", "ein Bürger der Welt-Szene"], ["einmal", "ein Einmal-Render"]]) {
            const p = sg[k] || {};
            if (p.steht || !(p.zeichnung > 0))
                out.push(`die Welt steht, während ${wer} auf seine Pipeline wartet (\`_weltOffen().zeichnung\` ${p.zeichnung | 0}, \`_weltSteht\` ${!!p.steht}) — das Bild der stehenden Welt zeigt ihn nicht (das Tor ohne Membran, GTX 1050)`);
            else if (!/LinseStoff_7/.test(p.grund || "")) out.push(`${wer} hält die Welt ohne Namen (Grund „${p.grund || ""}“ statt des Etiketts LinseStoff_7)`);
        }
        if (!sg.tor || sg.tor.steht || !sg.tor.akte)
            out.push(`die Welt steht, während ein waches Tor auf das Ziel seines Fensters wartet (\`_weltOffen().tore\`${sg.tor ? `, steht ${!!sg.tor.steht}, die Akte nennt es ${sg.tor.akte ? "ja" : "nicht"}` : ": keine Probe"}) — der erste Schuss zeigt das Tor ohne Membran (GTX 1050, HDD)`);
        else if (!sg.torOhne || !sg.torOhne.steht) out.push("ein Tor, dessen Ziel benannt ohne Bild ist, hält die Welt für immer (`_weltOffen().tore`)");
        if (sg.zu && !sg.zu.steht) out.push(`steht die Pipeline, steht die Welt nicht wieder (\`_weltOffen().zeichnung\` ${sg.zu.zeichnung | 0}) — ein Wartender, dessen Programm kam, hält sie für immer`);
    }
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
    // DER LOOP VOR DEM INIT DES RENDERERS (w28-loop-vor-init): r184 legt die Bild-Schleife erst in `init()` an, sein
    // `getAnimationLoop()` wirft davor. Kam eine Antwort der Foundry in dieses Fenster (GTX 1050: 7 von 126 Zweit-Boots, die
    // Vorlage des Leibs 44–64 ms vor `rendererReady`), riss der Wurf ihre Kette — der Bau goss beide Stufen des Leibs im
    // Haupt-Faden (EINE Aufgabe 3,3–3,9 s). Vor dem init kommt kein Takt: der Loop ruht, der Wächter hält nichts.
    const lv = m.loopVorInit;
    if (!lv) out.push("der Loop vor dem init des Renderers: keine Probe (`_loopRuht` am Renderer des Vendors, dessen init nie lief)");
    else if (lv.vendor !== "wirft" && lv.vendor !== "antwortet") out.push(`der Loop vor dem init des Renderers: ${lv.vendor} (Vorbedingung)`);
    else if (lv.wurf) out.push(`der Loop-Stand wirft vor dem init des Renderers („${lv.wurf}“): jede Antwort der Foundry in diesem Fenster reißt ihre Kette — die Vorlagen des Spielers fallen, der Leib gießt im Haupt-Faden (\`_loopRuht\`)`);
    else if (lv.ruht !== true) out.push(`vor dem init des Renderers kommt kein Takt, und der Loop ruht nicht (\`_loopRuht\` → ${lv.ruht}): der Wächter der Foundry hielte jede Antwort für einen Takt, der noch nicht läuft`);
    else if (lv.waechter !== true) out.push("der Wächter der Foundry hält eine Antwort vor dem init des Renderers (`_foundryIngestTakt`): die Vorlage des Leibs wartet auf den ersten Takt statt im Memo zu liegen");
    // DIE WIEDERKEHR DER TIERE (w28-tiere-nach-bild): bis dahin holte ein Stand mit Wesen sie vor dem ersten Weltbild zurück, jede
    // Gattung ohne Vorlage goss auf dem Haupt-Faden (GTX 1050, 7–9 Tiere aus 3–4 Arten: 6–8 Güsse, 4,1–5,4 s am Stück; Bild −
    // Renderer 12,4–14,4 s gegen 8,0–8,4 s). w = { vor, gussVor } Wesen und Güsse vor dem Bild · stand [Wesen im Stand des
    // Fensters, Etiketten treu] · wartet (Bild da, Vorrat des Stands nicht) · ungezeichnet (Wesen der Welt, solange den Gästen der
    // vordersten Gattung Programme fehlen) · gaeste [Gäste des Vorbaus, davon mit Raum] · zuerst [Wesen nach dem ersten Zug, es ist
    // das nächste am Spieler] · standHalb [Wesen im Stand zwischen den Zügen, Etiketten treu] · nach, gussNach, treu, weg, gaesteWeg
    // (nach dem letzten Zug) · ms (Dauer des Vorrats eines Stands) · offen [`_weltOffen().wesen` beim Boot, zwischen den Zügen, am
    // Ende] (w28-wesen-offen: die Welt steht nicht, solange Wesen ausstehen) · mutant (Wesen vor dem Bild bei der alten Sofort-Wiederkehr) ·
    // mutantVorbau (Wesen der Welt, wenn die Wiederkehr die Programme nicht fragt).
    // DIE PROGRAMME DER LEIBER (Nachschnitt): der erste Wurf ließ die Wesen wiederkehren, sobald ihre Vorlagen standen — in der Welt
    // und lebendig, gezeichnet aber erst 1,4–5,7 s später (GTX 1050; ein Fuchs kam ungesehen von 8,3 auf 2,9 m an den Spieler).
    const w = m.wiederkehr;
    if (!w) out.push("die Wiederkehr der Tiere: keine Probe (ein Stand mit zwei Wesen, `_bootDeferCreatures` am echten Renderer gespielt)");
    else if (w.err) out.push(`die Wiederkehr der Tiere: ${w.err}`);
    else {
        if (w.vor) out.push(`ein Stand mit Wesen holt ${w.vor} vor dem ersten Weltbild zurück (\`_bootDeferCreatures\`: jede Gattung ohne Vorlage gießt dort auf dem Haupt-Faden)`);
        if (w.gussVor || w.gussNach) out.push(`die Wiederkehr der Tiere gießt ${w.gussVor + w.gussNach} Vorlagen auf dem Haupt-Faden (\`_ofenStandBestellen\` trägt nicht jede Vorlage des Stands)`);
        if (!w.stand || w.stand[0] !== 2) out.push(`ein Stand, der vor der Wiederkehr geschrieben wird, trägt ${w.stand ? w.stand[0] : "?"} von 2 Wesen — das nächste Laden verliert sie (das Speicher-Glied „creatures“ liest \`_wesenAusstehend\` nicht)`);
        else if (!w.stand[1]) out.push("ein Stand, der vor der Wiederkehr geschrieben wird, verliert die Etiketten der Gefühle (`_etikettenImStand`)");
        if (!w.offen || w.offen[0] !== 2 || w.offen[1] !== 1) out.push(`solange Wesen des Stands ausstehen, nennt die Welt sie nicht offen (\`_weltOffen().wesen\` ${w.offen ? w.offen[0] + " beim Boot, " + w.offen[1] + " zwischen den Zügen" : "?"}, Soll 2 und 1): \`_weltSteht\` gäbe ein Bild ohne die Tiere frei`);
        else if (w.offen[2] !== 0) out.push(`nach der Wiederkehr nennt die Welt noch ${w.offen[2]} Wesen offen — sie stünde nie (\`_weltOffen().wesen\`)`);
        if (w.wartet) out.push(`die Wiederkehr wartet nicht auf den Vorrat ihres Stands: ${w.wartet} Wesen mit dem Bild allein (\`_ofenStandVorbau\`)`);
        if (w.ungezeichnet) out.push(`${w.ungezeichnet} Wesen kehren wieder, bevor die Programme ihrer Leiber stehen — in der Welt und nicht gezeichnet (\`_ofenStandVorbau\` fragt \`_vorbauFehlt\` nicht)`);
        if (!w.gaeste || !w.gaeste[0]) out.push("der Vorrat eines Stands stellt keinen Gast des Vorbaus (`_ofenStandVorbau`): kein Programm eines Leibs entsteht vor der Wiederkehr");
        else if (w.gaeste[1]) out.push(`${w.gaeste[1]} Gäste des Vorbaus der Wiederkehr nehmen Raum (\`_vorbauGast\`: Maßstab 0)`);
        if (!w.zuerst || w.zuerst[0] !== 1 || !w.zuerst[1]) out.push(`die Gattung des nächsten Wesens kehrt nicht zuerst und allein wieder: ${w.zuerst ? w.zuerst[0] : "?"} Wesen nach dem ersten Zug (\`_ofenStandBestellen\`: die Folge der Nähe)`);
        else if (!w.standHalb || w.standHalb[0] !== 2 || !w.standHalb[1]) out.push(`ein Stand zwischen zwei Zügen der Wiederkehr trägt ${w.standHalb ? w.standHalb[0] : "?"} von 2 Wesen${w.standHalb && !w.standHalb[1] ? ", die Etiketten in falscher Folge" : ""} (\`_wesenImStand\`, \`_etikettenImStand\`)`);
        if (w.nach !== 2) out.push(`nach Bild und Vorrat stehen ${w.nach} von 2 Wesen des Stands (\`_tickBootPhase3\`, \`_ofenStandBestellen\`)`);
        else if (!w.treu) out.push("die Wesen des Stands kehren ohne ihre Etiketten wieder (`wiederkehr` der Boot-Phase 3)");
        else if (!w.weg) out.push("nach der Wiederkehr steht der Stash oder die Boot-Phase 3 noch (der nächste Stand schriebe die alten Wesen)");
        else if (!w.gaesteWeg) out.push("nach der Wiederkehr steht ein Gast des Vorbaus noch in der Szene (`_ofenStandVorbau(true)`)");
        if (!(w.ms <= WIEDERKEHR_SOLL_MS)) out.push(`die Wesen des Stands stehen erst ${w.ms} ms nach dem Bild (der Vorrat eines Stands, Soll ≤ ${WIEDERKEHR_SOLL_MS} ms)`);
        if (!(w.mutant > 0)) out.push("die Wiederkehr der Tiere: die alte Sofort-Wiederkehr fällt der Probe nicht auf (sie ist blind)");
        if (!(w.mutantVorbau > 0)) out.push("die Wiederkehr der Tiere: eine Wiederkehr ohne die Programme ihrer Leiber fällt der Probe nicht auf (sie ist blind)");
    }
    // DIE GEBURTEN DER FRISCHEN WELT (w28-wesen-offen): dieselbe Klasse wie die Wiederkehr — der Boot bestellt die ersten Tiere, die
    // Boot-Phase 3 wirft sie nach dem Bild, und bis dahin nannte die Welt nichts offen. g = { offen [`_weltOffen().wesen` nach der
    // Bestellung von 3 Köpfen, nach einem Atem über dem Frame-Budget ohne Gattung am Ort, am Ende] · wartet (ohne den Vorrat der
    // Gattungen) · weg (die Phase fällt mit dem letzten Kopf) · ohne [0 Köpfe bestellt, kein Platz] }. Bis w28-wesen-offen hielt
    // `_frameOverBudget` jeden Wurf an (GTX 1050, frische Welt kalt: 0 von 10 Köpfen in 30 s nach dem Bild).
    const gb = m.geburt;
    if (!gb) out.push("die Geburten der frischen Welt: keine Probe (drei bestellte Köpfe, `_bootDeferCreatures` am echten Renderer gespielt)");
    else if (gb.err) out.push(`die Geburten der frischen Welt: ${gb.err}`);
    else {
        if (!gb.offen || gb.offen[0] !== 3 || gb.wartet !== 3) out.push(`solange Geburten ausstehen, nennt die Welt sie nicht offen (\`_weltOffen().wesen\` ${gb.offen ? gb.offen[0] : "?"} nach der Bestellung, ${gb.wartet} ohne den Vorrat, Soll 3 und 3): \`_weltSteht\` gäbe ein Bild ohne die ersten Tiere frei`);
        else if (gb.offen[1] !== 2) out.push(`ein Atem der Boot-Phase 3 zählt seinen Kopf nicht ab (${gb.offen[1]} offen, Soll 2 — über dem Frame-Budget, ohne Gattung am Ort): die Bestellung bliebe ohne Ende offen`);
        else if (gb.offen[2] !== 0 || !gb.weg) out.push(`nach dem letzten Atem nennt die Welt noch ${gb.offen[2]} Geburten offen${gb.weg ? "" : ", die Boot-Phase 3 steht noch"} — sie stünde nie`);
        if (!gb.ohne || gb.ohne[0] || gb.ohne[1]) out.push(`eine Welt ohne bestellte Tiere nennt Geburten offen (${gb.ohne ? gb.ohne[0] + " bei 0 Köpfen, " + gb.ohne[1] + " ohne Platz" : "?"}) — sie stünde nie`);
    }
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
        if (v.fehltNeu?.length)
            out.push(
                `während der Vorrat läuft, wartet das erste Weltbild („${v.fehltNeu.join(" · ")}") auf Aufträge ohne Leser des ` +
                    `ersten Frames: ${liste}`
            );
        if (v.karten > 0)
            out.push(
                `der Vorrat bestellt ${v.karten} Karten nach der Buchgröße (${(v.kartenBsp || []).join(", ")}), das erste Weltbild ` +
                    "wartet auf jede (die Karten-Schlange) — die Karte bestellt ihr Leser"
            );
        if (v.vorBild?.length)
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
        else if (!(v.nachBild > 0) && !(v.vorBild?.length))
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
            else if (!L.egoRoh) out.push("in Ego oder auf Third gießt oder tauscht der Haupt-Faden die feine Stufe (`_ofenRoh`)");
            else if (!L.baut.includes("nach 0")) out.push("im Leerlauf tauscht der Leib nie (`_leibFeinTausch`)");
        }
        if (K.dorf.ohne) out.push(`das Start-Dorf beim Buch: ${K.dorf.ohne} (Vorbedingung)`);
        else if (K.dorf.export && !K.dorf.kopfRang) out.push("der Export des Start-Dorfs geht ohne Kopf-Rang in die Schlange — hinter ihm wartet jeder Auftrag seiner Bahn (_foundryRang)");
        else if (!K.dorf.export) out.push(`mit dem Buch geht der Export des fälligen Start-Dorfs nicht hinaus${K.dorf.kopf ? "" : " (kein Wecker `_startDorfAmBuch` am Buch)"} — er wartet auf den Siedlungs-Takt im Leerlauf des Streamings`);
    }
    return out;
}
function kreuzVerdict(m) {
    if (startFehlt(m)) return ["start"];
    const out = [];
    if (!m.da) return ["kein Fadenkreuz"];
    if (!m.sichtbar) out.push("das Fadenkreuz ist unsichtbar");
    if (!(Math.abs(m.dx) <= 1 && Math.abs(m.dy) <= 1)) out.push(`das Fadenkreuz steht ${m.dx}/${m.dy} px neben der Mitte`);
    if (m.mitSchublade) out.push("das Fadenkreuz steht über der offenen Werkstatt");
    if (!m.nachSchublade) out.push("nach der Werkstatt fehlt das Fadenkreuz");
    return out;
}
function hilfeVerdict(m) {
    if (startFehlt(m)) return ["start"];
    const out = [];
    for (const wort of ["hilfe", "help", "?"]) {
        const z = (m.antworten || {})[wort] || {};
        if (z.unbekannt) out.push(`„${wort}" ist unbekannt („${z.erste}")`);
        else if (z.fehlt?.length) out.push(`„${wort}" nennt ${z.fehlt.length} Beispiel(e) der Tafeln nicht (${z.fehlt.slice(0, 3).join(" · ")})`);
        if (z.tastenFehlen?.length) out.push(`„${wort}" nennt ${z.tastenFehlen.length} Taste(n) nicht (${z.tastenFehlen.slice(0, 3).join(" · ")})`);
        if (!z.v1) out.push(`„${wort}" nennt keinen v1-Satz`);
    }
    if (m.unbekanntListe) out.push("der Satz für Unbekanntes trägt eine Liste von Hand");
    return out;
}
function gespraechVerdict(m) {
    if (startFehlt(m)) return ["start"];
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
    if (startFehlt(m)) return ["start"];
    const out = [];
    if (!m.buch) return ["Buch kalt (Vorbedingung)"];
    const belegt = (m.hotbar || []).filter(Boolean);
    if (!belegt.length) out.push("der Start-Gurt ist leer");
    for (const e of m.eintraege || []) if (!e.sichtbar) out.push(`${e.name} ist im Katalog versteckt${e.altDoppel ? ` (Alt-Doppel → ${e.altDoppel})` : ""}`);
        else if (!e.art) out.push(`${e.name} ist kein Studio-Werk`);
        else if (!e.platzierbar) out.push(`${e.name} lässt sich nicht setzen`);
    const arten = (m.eintraege || []).map((e) => e.art).filter(Boolean);
    const doppelt = arten.filter((a, i) => arten.indexOf(a) !== i);
    if (doppelt.length) out.push(`Studio-Art doppelt im Gurt: ${doppelt.join(", ")}`);
    const fehlt = (m.katalogArten || []).filter((a) => !arten.includes(a));
    if (fehlt.length) out.push(`Studio-Art ohne Werk im Gurt: ${fehlt.join(", ")}`);
    return out;
}
function kameraVerdict(m) {
    if (startFehlt(m)) return ["start"];
    const out = [];
    if (!m.baum) return ["kein Studio-Baum als Eintrag (Vorbedingung)"];
    if (!(m.stammSkala >= 0.95 * m.weltSkala)) out.push(`Stamm-Hülle im Vorlagen-Maß (× ${m.stammSkala} statt × ${m.weltSkala})`);
    for (const k of ["fuss", "ritt"]) {
        const z = (m.wege || {})[k];
        if (!z || !(z.proben > 0)) {
            out.push(`${k}: keine Probe (Vorbedingung${z?.grund ? ": " + z.grund : ""})`);
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
    if (startFehlt(m)) return ["start"];
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
    if (startFehlt(m)) return ["start"];
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
    if (startFehlt(m)) return ["start"];
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
// m.h = [Skelette vor dem Bild, Hüllen-Boxen nach dem Bild ohne Leib, mit dem Leib fern, mit dem Leib nah, offen danach] ·
// m.r = [hinten ohne Leerlauf, vorn,
// Leerlauf-Ruf, hinten mit Leerlauf] · m.k = je Bauer der Kacheln um das Auge [vor dem Bild außer Blick, im Blick, danach außer Blick]
// DIE KRONE VOR DER KACHEL (w28-krone-vor-kachel, Teil von LH): c.je / c.mutant = je Bauer [gebaut, stehend, unter der Krone
// gebaut, solange sie kam, unter ihr am Ende] · c.chunk = [Kacheln im Chunk gebaut, solange seine Pflanzung offen war, danach] ·
// c.ausser = Kacheln, die AUSSERHALB des Takts unter der kommenden Krone bauen (> 0: dort wartet keine).
// Ohne Kacheln um das Auge (`m.k` fehlt) urteilt die Zeile darüber.
function kroneVerdict(c) {
    if (c === false) return [];
    if (!c || c.err || !c.je || !c.mutant || !c.chunk) return [`die Krone vor der Kachel: keine Probe${c && c.err ? " — " + c.err : ""}`];
    const je = Object.entries(c.je);
    return [
        ...je.map(([n, [gebaut, stehend, vor, nach]]) =>
            vor
                ? `${n} baut ${vor} Kacheln unter einer Krone, die noch kommt (\`_kroneKommt\`)`
                : gebaut !== stehend
                  ? `${n} baut ${gebaut} Kacheln für ${stehend} stehende (eine fiel mit der Krone und baute neu)`
                  : nach !== (c.mutant[n] || [])[3] && `${n}: unter der gelandeten Krone stehen ${nach} Kacheln, ohne die Frage ${(c.mutant[n] || [])[3]} (die Kachel wartet weiter)`
        ),
        !je.some(([, [, stehend, , nach]]) => stehend && nach) && "die Krone vor der Kachel: unter der Krone wuchs nichts (die Probe ist blind)",
        !Object.values(c.mutant).some(([gebaut, stehend]) => gebaut > stehend) && "die Krone vor der Kachel: ohne die Frage baut nichts doppelt (die Probe sieht den Täter nicht)",
        c.chunk[0] ? `im Chunk mit offener Pflanzung wachsen ${c.chunk[0]} Kacheln (\`_pflanzungOffen\`)` : !c.chunk[1] && "im gepflanzten Chunk wächst keine Kachel",
        !(c.ausser > 0) && "außerhalb des Takts wartet die Kachel auf eine Krone, die dort nie landet (`_imTakt`: der ruhende Loop, der Playtest)",
    ].filter(Boolean);
}
function huelleVerdict(m) {
    if (!m || !m.h || !m.r) return ["start"];
    const [[wuchs, ohneLeib, fern, boxen, rest], [ohne, vorn, ruf, mit]] = [m.h, m.r];
    return [
        !m.k && "die Kacheln um das Auge: keine Probe",
        ...Object.entries(m.k || {}).map(([n, [warten, los]]) => (warten ? `${n} baut ${warten} Kacheln, die warten (\`_nahKachelWartet\`)` : !los && `${n} baut nichts`)), // prettier-ignore
        ...kroneVerdict(m.k ? m.krone || null : false),
        wuchs && "die Hülle wuchs vor dem Bild (`_baumGestaltTeile`)",
        ohneLeib && "die Hülle wuchs ohne Leib (`_huellenBedarf`)",
        fern && "die Hülle wuchs fern vom Leib (`HUELLE_BEDARF_M`)",
        (!boxen || rest) && "die Hülle fehlt am Leib (`_tickHuellenNach`)",
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
        ["W6 kein rohes Programm im Spieler-Chat (kein `JSON.stringify(reply|msg.program)`: die eigene KI und die Stimme eines Mitspielers)", fehlt(null, /JSON\.stringify\((reply|msg)\.program\)/)],
        ["W8 das Buch fragt die Köpfe der Ankunft (`_buchKoepfe` in `_foundryIngestBook`, B5)", !fehlt("_foundryIngestBook", /this\._buchKoepfe\(\)/)],
        [`W7 Streu-Pick, Lupe und Klingen-Achse rechnen keine eigene Richtung ab der Kamera (\`getWorldDirection\`)${kreuzEigen.length ? " — mit: " + kreuzEigen.join(", ") : ""}`, kreuzEigen.length === 0],
    ];
}

// DIE WAND DER ZWEITEN ANFRAGE (w28-faden-quelle, L2a): der Server zählt je Boot jede Anfrage eines Skripts (.js, .json; die
// Seite `/index.html` beginnt die Zählung neu). Je Datei trägt er höchstens die Anfrage der Seite (`seiteLaedt`) und die EINE der
// Quelle aller Fäden (`_quelleFaden`) — jede weitere stellte ein Faden selbst, für ein Skript, das ein anderer auch lädt.
const anfragen = new Map();
const server = statikServer({
    wandle: (p, roh) => {
        if (p === "/index.html") anfragen.clear();
        else if (/[.](js|json)$/.test(p)) anfragen.set(p, (anfragen.get(p) || 0) + 1);
        return roh;
    },
});
// DIE DATEIEN DER SEITE: jedes `<script src>` von index.html und jedes Modul ihrer Import-Karte samt seinen relativen Importen
// (die EINE Lesung der Importe, `_modulImporte` der geladenen Klasse) — als Pfade des Servers.
function seiteLaedt() {
    const html = ausDatei("index.html");
    const pfad = (u) => new URL(u, "http://seite/").pathname;
    const seite = new Set([...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((x) => pfad(x[1])));
    const karte = /<script type="importmap">([\s\S]*?)<\/script>/.exec(html);
    const offen = karte ? Object.values(JSON.parse(karte[1]).imports || {}).map((u) => new URL(u, "http://seite/").href) : [];
    const { AnazhRealm: A } = stammLib.ladeKlasse(ROOT);
    while (offen.length) {
        const u = offen.pop();
        if (seite.has(pfad(u))) continue;
        seite.add(pfad(u));
        A._modulImporte(ausDatei(pfad(u).slice(1)), u, (z) => (offen.push(z), z));
    }
    return [...seite].sort();
}

// ── DIE PROBEN IN DER SEITE (r = die Welt). ──
async function probe(arg) {
    const out = {};
    await window.__weltDa();
    // eine Taste an `ziel` (keydown · keyup · keypress) und der Fokus beim Namen
    const taste = (ziel, typ, key, code = key, mehr) => ziel.dispatchEvent(new KeyboardEvent(typ, { key, code, bubbles: true, ...mehr }));
    const fokus = (a = document.activeElement) => (a ? a.id || a.tagName : null);
    // die Zeilen des Chats — mit `k` ihre Schlüssel (die Welt spricht aus der Tafel, `_chatEcho` trägt ihn am Knoten): die Linse
    // liest den Schlüssel, nie den Wortlaut
    const zeilen = (k) => Array.from(document.querySelectorAll("#chat-output > div")).map((d) => (k ? d.querySelector("[data-t]")?.dataset.t : d.textContent));
    const ueber = (P) => st.playerMesh.position.set(P.x, P.y + 2.2, P.z); // der Spieler 2,2 m über dem Punkt P
    const buch = await r._foundryAwaitBook(45000);
    await __takte(30, 30);
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
        m.schleifeFragt = __rufe(r, "_loopRender", r, "_ankunftsBild", [performance.now()]) > 0;
        st._weltbildDa = daVor;
        // DIE QUITTUNG DER GEBURT (w28-faden-quelle): zwei Neben-Fäden über die echte Geburt (`_nebenFaden`) aus der EINEN Quelle
        // der Fäden — der eine verschluckt jedes `ack` (die Mutante: ein Vorspann vor dem Blob der Quelle), der andere lebt; beide
        // rechnen einen Auftrag. Der stumme bricht beim Namen („… antwortet …, ohne seine Geburt zu quittieren“), der lebende
        // quittiert und bricht nie. Je Faden [quittiert nach ms | null, antwortete, Brüche beim Namen].
        try {
            const Q = r._quelleStand();
            const [echt, q] = [Q.url, (m.quittung = {})];
            const brueche = (N) => st.logBuffer.filter((z) => String(z).includes(`${N}: der `) && String(z).includes("ohne seine Geburt zu quittieren")).length; // prettier-ignore
            for (const [name, verschluckt] of [["probestumm", true], ["probelebt", false]]) {
                const e = (q[name] = { verschluckt, quittiert: null, antwort: false, bruch: 0 });
                try {
                    const vor = brueche(name.toUpperCase());
                    if (verschluckt) Q.url = URL.createObjectURL(new Blob([`self.postMessage = ((p) => (m, t) => (m && m.type === "ack" ? undefined : p(m, t)))(self.postMessage.bind(self));\nimportScripts(${JSON.stringify(echt)});`], { type: "text/javascript" })); // prettier-ignore
                    const f = r._nebenFaden(name);
                    Q.url = echt;
                    const auftrag = r._nebenAuftrag(name, { type: "density-grid", ox: 0, oy: 0, oz: 0, dimX: 1, dimY: 1, dimZ: 1, step: 1 }).then(() => true); // prettier-ignore
                    e.antwort = await Promise.race([auftrag, new Promise((ok) => setTimeout(() => ok(false), 20000))]);
                    [e.quittiert, e.bruch] = [f.quittiert == null ? null : Math.round(f.quittiert - f.geboren), brueche(name.toUpperCase()) - vor]; // prettier-ignore
                    [f.worker.terminate(), r._nebenFaeden.delete(name)];
                } catch (err) {
                    e.err = fehlerStapel(err);
                } finally {
                    Q.url = echt;
                }
            }
        } catch (err) {
            m.quittung = { err: fehlerStapel(err) }; // die Quittungs-Probe nimmt L2a nie mit (ihr Fehler ist ihr Befund)
        }
        // der Loop vor dem init des Renderers (w28-loop-vor-init): ein ECHTER Renderer des Vendors, dessen `init()` nie lief —
        // die Lage jedes Boots zwischen Geburt und `rendererReady`. Der Loop-Stand und der Wächter der Foundry antworten in ihr.
        {
            const lv = (m.loopVorInit = { vendor: "", ruht: null, wurf: "", waechter: null });
            const [r0, b0, q0] = [st.renderer, st.rendererReady, r._foundryIngestQueue];
            try {
                const roh = new THREE.WebGPURenderer({ canvas: document.createElement("canvas") });
                try {
                    roh.getAnimationLoop();
                    lv.vendor = "antwortet";
                } catch (_e) {
                    lv.vendor = "wirft";
                }
                st.renderer = roh;
                st.rendererReady = false;
                r._foundryIngestQueue = [];
                try {
                    lv.ruht = r._loopRuht();
                    let durch = false;
                    r._foundryIngestTakt({ probe: true }, null).then(() => (durch = true));
                    await Promise.resolve();
                    await Promise.resolve();
                    lv.waechter = durch;
                } catch (e) {
                    lv.wurf = String(e && e.message);
                }
            } catch (e) {
                lv.vendor = "kein Renderer des Vendors — " + String(e && e.message);
            } finally {
                st.renderer = r0;
                st.rendererReady = b0;
                r._foundryIngestQueue = q0;
            }
        }
        if (ls) {
            // Die Welt wächst, bis sie steht (`_weltbildFehlt` leer, höchstens 90 s) — vor dem Rundblick im Blick, vor den Fällen
            // RUNDUM: die Mesh-Zone des Null-Renderers atmet je Takt mit dem Regler, und die Fälle hinter dem Spieler drehen die
            // Kamera — ein Baum im Werden dort hielte jeden Fall (CI f25740f8: bodenHinten und baumHinten „1 Bäume und Bauten wachsen")
            const steht = async (rundum) => { for (const weiter = window.__deckel("das Weltbild", 1500); r._weltbildFehlt(rundum).length && weiter(); ) await __takte(5, 60); return r._weltbildFehlt(rundum); }; // prettier-ignore
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
                await __takte(1, 10);
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
                fall(name, () => (zurueck = paare.map(([o, w]) => leihe(o, w))), () => zurueck.reverse().forEach((z) => z()));
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
                fall(k, () => zellen.set(K, { key: K, _imBlick: r._rangImBlick(vorn(s)) }) && (r._impostorBakeQueue = (r._impostorBakeQueue || []).concat([K])), () => zellen.delete(K) && (r._impostorBakeQueue = r._impostorBakeQueue.filter((q) => q !== K)));
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
            // (4e'') DAS BILD IST GEZEICHNET (w28-bild-ganz): ein Bürger der Welt-Szene wollte im letzten Bild zeichnen, seine Pipeline
            // entsteht noch (die Warteschlange der Erst-Zeichnung trägt sie offen, `_erstWartet`) — er hält das Bild beim Etikett;
            // steht sie, hält er nichts mehr; kommt sie nie (der Deckel), weicht der Ladeschirm mit einem Bruch beim Namen
            if (!(r._erstZeichnungStand().bildWartet instanceof Map) || typeof r._bildWartet !== "function")
                m.ohneFall.zeichnungWartet = m.ohneFall.zeichnungSteht = m.ohneFall.zeichnungOhneAussicht = "die Erst-Zeichnung führt keine Liste der Wartenden des Bilds (`bildWartet`, `_bildWartet`) — das Weltbild zählt Gesetztes, nie Gezeichnetes";
            else {
                const [EZ, pipeL] = [r._erstZeichnungStand(), { linse: "pipeline" }];
                const an = (offen) => () => (offen && EZ.offen.set(pipeL, new Set()), EZ.namen.set(pipeL, "renderPipeline_LinseStoff_7"), EZ.bildWartet.set(pipeL, { ro: null, fest: false }));
                const aus = () => (EZ.offen.delete(pipeL), EZ.bildWartet.delete(pipeL));
                const bruch = () => st.logBuffer.slice(-30).filter((z) => /WELTBILD NICHT GANZ.*LinseStoff_7 nicht gezeichnet/.test(z)).length;
                fall("zeichnungWartet", an(true), aus);
                fall("zeichnungSteht", an(false), aus);
                const b0 = bruch();
                fall("zeichnungOhneAussicht", an(true), aus, () => (st._weltbildErsteFrage = performance.now() - (AnazhRealm.WELTBILD_DECKEL_MS || 60000) - 1));
                m.faelle.zeichnungOhneAussicht.bruch = Math.max(0, bruch() - b0);
            }
            // (4e'''') DIE WELT STEHT, WENN SIE GEZEICHNET IST (w28-welt-steht): ein Bürger des Bilds und ein Einmal-Render, deren Pipeline
            // noch entsteht, öffnen ein Feld des Offenen (gegen den Stand davor) und die Akte nennt das Etikett; steht die Pipeline, nicht mehr
            if (typeof r._weltOffen === "function") {
                const [EZ, pipeL, schl] = [r._erstZeichnungStand(), { linse: "pipeline-steht" }, { linse: "einmal" }];
                const neu = (o0) => {
                    const o = r._weltOffen();
                    return { zeichnung: o.zeichnung | 0, steht: !Object.keys(o).some((k) => o[k] && !o0[k]), grund: r._weltOffenAkte() };
                };
                const o0 = { ...r._weltOffen() };
                const sg = (m.stehtGezeichnet = {});
                EZ.namen.set(pipeL, "renderPipeline_LinseStoff_7");
                try {
                    EZ.offen.set(pipeL, new Set());
                    EZ.bildWartet.set(pipeL, { ro: null, fest: false });
                    sg.bild = neu(o0);
                    EZ.bildWartet.delete(pipeL);
                    if (!EZ.einmalWarte) EZ.einmalWarte = new Map();
                    if (typeof EZ.einmalWarte.set === "function") EZ.einmalWarte.set(schl, new Set([pipeL]));
                    sg.einmal = neu(o0);
                    EZ.offen.delete(pipeL);
                    sg.zu = neu(o0);
                } finally {
                    EZ.offen.delete(pipeL);
                    EZ.bildWartet.delete(pipeL);
                    if (EZ.einmalWarte) EZ.einmalWarte.delete(schl);
                }
                // DAS FENSTER WARTET AUF SEIN ZIEL: ein waches Tor ohne Membran, dessen Ziel-Welt im Abruf steht, hält die Welt; ist das
                // Ziel benannt ohne Bild, nicht
                const [regVor, zw, Z] = [r._portalMembranes, r._torZielWelt, r._torZiele()];
                const welt = "linse:ziel";
                try {
                    r._portalMembranes = new Map();
                    const o0t = { ...r._weltOffen() }; // der Stand ohne Tor
                    r._portalMembranes.set("linse:tor", { entry: { id: "linse:tor" }, mesh: null, wach: true });
                    r._torZielWelt = () => ({ world: welt });
                    sg.tor = neu(o0t);
                    sg.tor.akte = /Tore ohne Fenster 1/.test(sg.tor.grund);
                    Z.welten.set(welt, { world: welt, ohne: "linse" });
                    sg.torOhne = neu(o0t);
                } finally {
                    r._portalMembranes = regVor;
                    if (zw === Object.getPrototypeOf(r)._torZielWelt) delete r._torZielWelt;
                    else r._torZielWelt = zw;
                    Z.welten.delete(welt);
                }
            }
            // (4e''') DAS PROGRAMM VOR DEN DATEN (w28-leben-vorbau): vor dem ersten Weltbild hängt der Takt der Kamm-Krone ihren Gast der
            // Ankunft in die Welt-Szene (ihr Stoff, die Form ihres Netzes) und bestellt NICHTS beim Kamm-Faden; unter dem Ladeschirm
            // merkt `_vorbauWahl` ihn nur (dort kostete sein Bau die Ankunft), im ersten Bild danach baut er. Der Null-Renderer trägt
            // keine Erst-Zeichnung: die Probe leiht ihre Marke für den einen Ruf.
            {
                const R = st.renderer;
                const merk = [st.kammKrone, R.__anazhErstZeichnung, st._weltbildDa, r._fernAuftrag];
                const kv = (m.kammVorbau = { gast: false, art: null, stoff: false, form: "", bestellt: 0, wahl: "", raum: "" });
                try {
                    [st.kammKrone, R.__anazhErstZeichnung, st._weltbildDa] = [null, true, 0];
                    r._fernAuftrag = () => (kv.bestellt++, new Promise(() => {}));
                    r._kammKroneTakt({ ready: true, anchorX: 0, anchorZ: 0 });
                    const g = st.kammKrone && st.kammKrone.gast;
                    if (g) Object.assign(kv, { gast: g.parent === st.scene, art: g.__vorbauGast, stoff: g.material === st.kammKrone.stoff, form: Object.keys(g.geometry.attributes).sort().join(",") });
                    // EIN GAST NIMMT KEINEN RAUM (`_gastOhneRaum`): der Gast der Kamm-Krone steht mit Maßstab 0 — ein Bürger, dem die
                    // Prägung anhaftet (Maßstab 1), ist KEIN Gast, und der EINE Melder nennt ihn
                    if (g && typeof r._gastOhneRaum === "function") {
                        st.scene.updateMatrixWorld(true);
                        const buerger = new THREE.Mesh();
                        [buerger.name, buerger.__vorbauGast] = ["linse:buerger", true];
                        buerger.updateMatrixWorld(true);
                        const laut = () => st.logBuffer.slice(-30).filter((z) => /GAST MIT RAUM: linse:buerger/.test(z)).length;
                        const l0 = laut();
                        kv.raum = [r._gastOhneRaum(g) ? "gast" : "buerger", r._gastOhneRaum(buerger) ? "gast" : laut() > l0 ? "buerger-laut" : "buerger-still"].join(",");
                    }
                    const E2 = () => ({ vorgemerkt: new WeakMap(), vorgebaut: new WeakMap(), vorbauBild: -1 });
                    kv.wahl = [[true, 0], [false, 1]].map(([lade, bild]) => String(AnazhRealm._vorbauWahl(E2(), {}, "p", lade, bild, 1, true))).join(","); // unter dem Ladeschirm · im ersten Bild danach
                } finally {
                    if (st.kammKrone) r._kammKroneDispose();
                    [st.kammKrone, R.__anazhErstZeichnung, st._weltbildDa, r._fernAuftrag] = merk;
                    if (merk[3] === Object.getPrototypeOf(r)._fernAuftrag) delete r._fernAuftrag;
                }
            }
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
            // (6a) DER STUMME FADEN UND DIE OFFENE PFLANZUNG (w28-krone-vor-kachel): ein Chunk im Blick wartet auf den Plan seines
            // Walds (`_waldPflanzWarten`), der Wald-Faden trägt einen offenen Auftrag und schickte seit seiner Geburt keine Nachricht
            // (kein `ack`) — gibt die Ruhe das Bild frei, bricht es zweimal beim Namen (der Faden, die Pflanzung); mit einem Faden,
            // der antwortete, bricht nur die Pflanzung („kein Faden ist stumm")
            {
                const [sp6, pc6] = [r._voxelChunkConfig().span, st.lastPlayerVoxelChunk];
                const vorn = pc6 && [[0, 1], [1, 0], [0, -1], [-1, 0]].map(([dx, dz]) => [pc6.cx + dx, pc6.cz + dz]).find(([cx, cz]) => r._imErstenBlick((cx + 0.5) * sp6, (cz + 0.5) * sp6, sp6 * Math.SQRT1_2)); // prettier-ignore
                const NF = r._nebenFaeden || (r._nebenFaeden = new Map());
                const [W6, alt6] = [r._waldPflanzWarten || (r._waldPflanzWarten = new Set()), NF.get("wald")];
                const zaehle = (re) => st.logBuffer.slice(-40).filter((z) => re.test(z)).length;
                const [reF, reP] = [/WELTBILD NICHT GANZ.*der Wald-Faden antwortete nie \(kein ack/, /WELTBILD NICHT GANZ.*mit offener Pflanzung/];
                if (!vorn) m.ohneFall.fadenStumm = m.ohneFall.pflanzungOhneFaden = "kein Chunk neben dem Spieler liegt im Blick";
                else
                    // der Schein-Faden trägt seinen Geburts-Stand (Nummer 1) und einen Auftrag (2) — stumm: die Geburt nie quittiert
                    // (`quittiert` null, w28-faden-quelle); lebend: quittiert, der Auftrag offen
                    for (const [name, quittiert] of [["fadenStumm", null], ["pflanzungOhneFaden", -19000]]) {
                        const [f0, p0] = [zaehle(reF), zaehle(reP)];
                        const ck = vorn.join(",");
                        const war = W6.has(ck);
                        fall(name, () => (W6.add(ck), NF.set("wald", { worker: null, pending: new Map(quittiert == null ? [[1, {}], [2, {}]] : [[2, {}]]), next: 3, geboren: performance.now() - 20000, quittiert: quittiert == null ? null : performance.now() + quittiert })), () => (war || W6.delete(ck), alt6 ? NF.set("wald", alt6) : NF.delete("wald")), ruht); // prettier-ignore
                        m.faelle[name].bruch = [Math.max(0, zaehle(reF) - f0), Math.max(0, zaehle(reP) - p0)];
                    }
            }
            // (6b) eine Lücke ARBEITET: ihr Satz blieb länger als WELTBILD_STILL_MS gleich, aber für sie
            // ist etwas unterwegs (das Buch im bootenden Studio-Faden) — der Ladeschirm bleibt, nie das halbe Bild unter Last
            if (fo?.worker)
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
                if (document.activeElement?.blur) document.activeElement.blur();
                halt.vor = false;
                taste(document.body, "keydown", "w", "KeyW");
                const wLief = halt.vor === true;
                taste(document.body, "keyup", "w", "KeyW");
                taste(document.body, "keydown", "Enter");
                const ae = document.activeElement;
                if (ae?.id === "chat-input") ae.blur();
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
                                    aufgeschoben: !!(reg?._deferredFoundry && !reg._cont),
                                    zellen: reg?.cells ? reg.cells.length : -1,
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
                        for (const k of Object.keys(alt)) if (alt[k] === P[k]) delete r[k];
                            else r[k] = alt[k];
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
                const zurueck = () => ["_foundryZug", "_foundryCacheGet", "_standRuht", "_weltKapselHolen", "_weltBakeErlaubt", "_foundryRequest", "_foundryRequestSettlement", "applyPlayerSoul", "_weltSteht"].forEach((n) => delete r[n]);
                const P = Object.getPrototypeOf(r);
                const bis = async (fn, ms, takt) => { for (const weiter = window.__deckel(String(fn), ms / 50); !fn() && weiter(); ) await (takt ? __takte(1, 50) : sleep(50)); return !!fn(); }; // prettier-ignore
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
                    [0, 1].forEach((l) => (memo.delete(key(l)), AnazhRealm._ofenRohMemo?.delete(key(l))));
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
                    // DIE FEINE WARTET ROH (w14-ankunft-weg): in der Ego-Sicht liegt sie roh (`_ofenRoh`), ungegossen und ungetauscht —
                    // und DER SICHT-WECHSEL BAUT NICHTS (w20-leib-takt): Third schaltet den Leib, der da ist (derselbe Leib, die feine
                    // roh). DER LEERLAUF TAUSCHT: ruht die Eingabe und steht die Welt (die Probe hält ihre Stand-Wachen wach, hier steht
                    // sie), gießt und tauscht der erste Schritt des Vorbaus die feine (`_vorbauBedienung` → `_leibFeinTausch`)
                    await bis(() => AnazhRealm._ofenRohMemo?.has(key(0)), 90000, true);
                    const leib = st.playerMesh;
                    r.setCameraMode("third");
                    k.leib.egoRoh = st.playerMesh === leib && !memo.has(key(0)) && !k.leib.baut.some((b) => b.startsWith("nach"));
                    r._weltSteht = () => true;
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
                    k.fehler = fehlerText(e);
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
                for (const weiter = window.__deckel("die Zusage des fernen Kastens", 2000); ((z && !w.kam) || Q.size) && weiter(); ) await __takte(1, 30);
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
                for (const weiter = (neu(), __deckel("die Streu-Region vor der Probe", 300)); r._streuRegionWartet(key) && weiter(); ) await __takte(1, 30); // prettier-ignore
                const stumm = "_ladeTakt _bauFristOhneEnde _tickVoxelChunkStreaming _tickScatterStreaming _tickPendingGrass _tickScatterRegrow _tickNahWiese _tickNahStreu".split(" ");
                r._scatterSichtHoehe = function (layer, ...a) {
                    const [v, E] = [r._imErstenBlick(a[4].x, a[4].z, 12), r._ersterBlick()];
                    if (layer.kind === "rock" || (v && b.geweckt != null)) return P._scatterSichtHoehe.call(this, layer, ...a);
                    return b.geweckt == null && (b.n[+!v]++, w.push(Math.atan2(a[4].x - E.ex, a[4].z - E.ez))), r._wartetAuf(v ? zV : zH), null;
                };
                try {
                    let g = ((st._weltbildDa = 0), neu());
                    if (!(b.n[0] && b.n[1])) {
                        [st.yaw, b.n] = [rang(w.sort(aufsteigend)) + r._ersterBlick().halb, [0, 0]];
                        g = neu();
                    }
                    [b.vor1] = [r._streuRegionWartet(key), ok[0](), await sleep(0)];
                    b.geweckt = !!g._geweckt; // vor der zweiten Scheibe
                    b.vor2 = (neu(), r._streuRegionWartet(key));
                    [b.nach2] = [((st._weltbildDa = 1), r._streuRegionWartet(key)), (st._weltbildDa = 0), (st.scatterRegions.get(key)._bildWartet = null)];
                    for (let i = (stumm.forEach((k, j) => (r[k] = () => !j)), 0); i < 4; i++) t.lief += (r._fristStellen(performance.now() - 1e3, false), r._dispatchFrameJobs(r._buildDeferrableJobs(pm))).includes("scatterDeco"); // die Frist des Spiels lief ab: unter dem Ladeschirm hält kein Tor
                } finally {
                    [stumm.forEach((k) => delete r[k]), delete r._scatterSichtHoehe, (st._weltbildDa = da), (st.yaw = gier), ok[1](), neu()];
                }
            }
            await sleep(800);
            if (!st._weltbildDa) r._weltbildSteht();
            ls.classList.add("weg");
        } else m.faelle = { fehler: ls ? "kein _ankunftsBild" : "kein Ladeschirm" };
        // DIE WIEDERKEHR DER TIERE (w28-tiere-nach-bild): ein geladener Stand trägt zwei Wesen zweier Gattungen, das erste näher am
        // Spieler. Am echten Renderer (die Null-Naht für die Dauer EINES synchronen Rufs aus) holt `_bootDeferCreatures` keines vor
        // dem Bild zurück und gießt nichts; der Stand, der in diesem Fenster geschrieben wird, trägt beide samt Etikett
        // (`buildStateSnapshot`); mit dem Bild, ohne den Vorrat des Stands, wartet der Takt weiter. Dann der ECHTE Vorrat, kalt
        // (`_ofenStandBestellen`: Vorlagen aus dem Werk, Glieder — `ms`), die Erst-Zeichnung gespielt (`_vorbauFehlt`): solange
        // den Gästen der vordersten Gattung Programme fehlen, kehrt kein Wesen wieder; stehen sie, kehrt die Gattung des NÄCHSTEN
        // Wesens zuerst wieder, der Stand zwischen den Zügen trägt beide, dann die zweite — kein Gast bleibt. Die Mutanten: die alte
        // Sofort-Wiederkehr, und die Wiederkehr, die nicht auf die Programme ihrer Leiber wartet.
        {
            const w = (m.wiederkehr = { offen: null, offenOhne: null, vor: null, gussVor: 0, stand: null, wartet: null, ungezeichnet: null, gaeste: null, zuerst: null, standHalb: null, nach: null, gussNach: 0, treu: null, weg: null, gaesteWeg: null, ms: null, mutant: null, mutantVorbau: null, err: "" });
            const [ren, K, etik] = [st.renderer, AnazhRealm, ["sad", "happy"]];
            const merk = { tiere: r.buildStateSnapshot().creatures || [], etik: (st.creatureEmotions || []).slice(), pend: st._pendingCreatureSnapshots, p3: st._bootPhase3, da: st._weltbildDa, vorrat: r._ofenVorratSteht, naht: ren._isHeadlessNull, erst: ren.__anazhErstZeichnung };
            const echt = (tu) => {
                ren._isHeadlessNull = false;
                try {
                    return tu();
                } finally {
                    ren._isHeadlessNull = merk.naht;
                }
            };
            const probe = (c) => /^probe-wiederkehr-/.test(String(c && (c.userData ? c.userData.name : c.name)));
            const takt = () => echt(() => r._tickBootPhase3(performance.now()));
            const gaeste = () => st.scene.children.filter((o) => /^wiederkehr:/.test(o.name || ""));
            let [guss, fehlt] = [0, 3];
            try {
                const [map, L, P0] = [K.TETRAPODA_SOUL_MAP, K._lebensraumGesetz().L, st.playerMesh.position];
                const seelen = Object.keys(map).filter((s) => map[s] in L.gattung && K.CREATURE_SOULS[s]).slice(0, 2);
                if (seelen.length < 2 || !r._foundryEnabled()) throw new Error(`Vorbedingung — ${seelen.length} Gattungen des Lebensraums, Foundry ${r._foundryEnabled()}`);
                const bild = merk.da || performance.now();
                const stelle = (da) => {
                    st._pendingCreatureSnapshots = seelen.map((soul, i) => ({ soul, name: "probe-wiederkehr-" + i, position: { x: P0.x + 6 + 5 * i, y: r.getTerrainHeightAt(P0.x + 6 + 5 * i, P0.z + 6), z: P0.z + 6 }, bornAt: 1000 + i, bodySize: 1, memory: [] }));
                    [st.creatureEmotions, st._weltbildDa] = [etik.slice(), da];
                };
                // ein Guss auf dem Haupt-Faden zählt hier (und bricht nicht ins Buch der Brüche: die Probe spielt den echten Renderer);
                // die Erst-Zeichnung gespielt: jedem Gast fehlen `fehlt` Teile
                r._fadenUmgangen = (was) => void (/kreatur/.test(String(was)) && guss++);
                r._vorbauFehlt = () => fehlt;
                if (!merk.erst) ren.__anazhErstZeichnung = "probe";
                // (a) vor dem Bild ruft der Boot; der Vorrat des Stands ruht bis (d), wo die Probe ihn selbst ruft
                stelle(0);
                [r._ofenVorratSteht, r._ofenStandAuftrag, r._ofenStandBestellen] = [false, null, () => Promise.resolve()];
                echt(() => r._bootDeferCreatures(10));
                [w.vor, w.gussVor] = [st.creatures.length, guss];
                // die Auskunft der Welt (w28-wesen-offen): die Ausstehenden sind offen — beim Boot, zwischen den Zügen, am Ende nicht mehr
                const offen = () => r._weltOffen();
                w.offen = [offen().wesen, null, null];
                w.offenOhne = Object.entries(offen()).filter(([k, v]) => k !== "wesen" && v).map(([k]) => k);
                // (b) der Stand in diesem Fenster
                const S = r.buildStateSnapshot();
                w.stand = [(S.creatures || []).filter(probe).length, JSON.stringify(S.creatureEmotions) === JSON.stringify(etik)];
                // (c) das Bild steht, der Vorrat des Stands nicht
                st._weltbildDa = bild;
                takt();
                w.wartet = st.creatures.length;
                // (d) der echte Vorrat des Stands — KALT: die Vorlagen beider Gattungen und ihre Glieder fallen vorher aus dem
                // Gedächtnis (kein Leib trägt sie mehr), der Vorrat bestellt sie neu im Werk; `ms` misst diese Arbeit, nie ein volles Memo
                for (const s of seelen) {
                    const d = r._ofenKreaturDials(map[s], null);
                    for (const lod of [0, 1]) K._tierOfenMemo && K._tierOfenMemo.delete(r._ofenKreaturKey(map[s], d.dials, lod));
                    if (r._trefferGliedNamen) r._trefferGliedNamen.delete(map[s]);
                }
                delete r._ofenStandBestellen;
                const t0 = performance.now();
                await Promise.race([r._ofenStandBestellen(), sleep(60000)]);
                w.ms = Math.round(performance.now() - t0);
                // den Gästen der vordersten Gattung fehlen Programme: kein Wesen kehrt wieder
                takt();
                const g0 = gaeste();
                [w.ungezeichnet, w.gaeste] = [st.creatures.length, [g0.length, g0.filter((o) => o.scale.x !== 0).length]];
                // sie stehen: die Gattung des nächsten Wesens kehrt wieder, die andere steht noch aus — der Stand trägt beide
                fehlt = 0;
                takt();
                const da1 = st.creatures.filter(probe);
                w.zuerst = [da1.length, da1.length === 1 && da1[0].userData.name === "probe-wiederkehr-0"];
                w.offen[1] = offen().wesen;
                const S2 = r.buildStateSnapshot();
                w.standHalb = [(S2.creatures || []).filter(probe).length, JSON.stringify(S2.creatureEmotions) === JSON.stringify(etik)];
                takt();
                [w.nach, w.gussNach] = [st.creatures.filter(probe).length, guss - w.gussVor];
                w.treu = w.nach === 2 && JSON.stringify(st.creatureEmotions.slice(0, 2)) === JSON.stringify(etik);
                [w.weg, w.gaesteWeg] = [!st._pendingCreatureSnapshots && !st._bootPhase3, gaeste().length === 0];
                w.offen[2] = offen().wesen;
                // (g) DIE GEBURTEN DER FRISCHEN WELT (w28-wesen-offen): ohne Stand bestellt der Boot drei Köpfe (`creaturesLeft`) — sie
                // sind offen, solange die Boot-Phase 3 sie nicht geworfen hat: nach der Bestellung 3, ohne den Vorrat der Gattungen
                // weiter 3; dann zählt jeder Atem einen Kopf ab, AUCH über dem Frame-Budget und wenn der Lebensraum am Ort keine
                // Gattung gibt (gespielt: die Bestellung ist endlich) — 2, am Ende 0, die Phase fällt. Die Falle: eine Welt, die
                // keine Tiere bestellt (0 Köpfe; kein Platz, `maxCreatures` 0), nennt nichts offen.
                {
                    const g = (m.geburt = { offen: null, wartet: null, weg: null, ohne: null, err: "" });
                    const [mx, fob] = [st.maxCreatures, st._frameOverBudget];
                    try {
                        [st.maxCreatures, st._bootPhase3] = [Math.max(mx || 0, 3), null];
                        r._pickFaunaSoulAtPlayer = () => null;
                        echt(() => r._bootDeferCreatures(3));
                        g.offen = [offen().wesen, null, null];
                        takt(); // das Bild steht, der Vorrat der Gattungen nicht (`_ofenVorratSteht` seit (a) falsch)
                        g.wartet = offen().wesen;
                        [r._ofenVorratSteht, st._frameOverBudget] = [true, true];
                        takt();
                        g.offen[1] = offen().wesen;
                        for (let i = 0; i < 6 && st._bootPhase3; i++) [(st._bootPhase3.lastAt = 0), takt()];
                        [g.offen[2], g.weg] = [offen().wesen, !st._bootPhase3];
                        st._bootPhase3 = null;
                        echt(() => r._bootDeferCreatures(0));
                        g.ohne = [offen().wesen, null];
                        [st._bootPhase3, st.maxCreatures] = [null, 0];
                        echt(() => r._bootDeferCreatures(3));
                        g.ohne[1] = offen().wesen;
                    } catch (e) {
                        g.err = String(e && e.message);
                    } finally {
                        delete r._pickFaunaSoulAtPlayer;
                        [st.maxCreatures, st._frameOverBudget, st._bootPhase3, r._ofenVorratSteht] = [mx, fob, null, false];
                    }
                }
                // (e) DIE MUTANTE: `_bootDeferCreatures` wie vor dem Schnitt — ein Stand mit Wesen holt sie sofort
                stelle(0);
                r._bootDeferCreatures = function (count) {
                    this._syncBauen(null, () => this.spawnCreatures(count));
                };
                echt(() => r._bootDeferCreatures(10));
                w.mutant = st.creatures.length;
                // (f) DIE ZWEITE MUTANTE: die Wiederkehr fragt die Programme ihrer Leiber nicht (`_ofenStandVorbau` nennt die Gattung,
                // sobald ihre Vorlagen stehen) — den Gästen fehlen Programme, und die Wesen stehen doch in der Welt
                [delete r._bootDeferCreatures, (fehlt = 3)];
                stelle(bild);
                echt(() => r._bootDeferCreatures(10));
                await Promise.race([r._ofenStandBestellen(), sleep(60000)]);
                r._ofenStandVorbau = function (gehen) {
                    const A = this._ofenStandAuftrag;
                    return gehen === true ? void A.reihe.shift() || null : (A && A.reihe[0]) || null;
                };
                takt();
                w.mutantVorbau = st.creatures.filter(probe).length;
            } catch (e) {
                w.err = String(e && e.message);
            } finally {
                [delete r._bootDeferCreatures, delete r._ofenStandBestellen, delete r._ofenStandVorbau, delete r._fadenUmgangen, delete r._vorbauFehlt];
                [ren._isHeadlessNull, st._weltbildDa, r._ofenVorratSteht] = [merk.naht, merk.da, merk.vorrat];
                if (!merk.erst) delete ren.__anazhErstZeichnung;
                // die Gäste der Probe gehen, die Wesen der Welt kehren aus ihren Snapshots zurück (sofort, über die Naht)
                for (const g of gaeste()) [st.scene.remove(g), r._disposeSoulGroup(g)];
                r._ofenStandAuftrag = null;
                r.clearCreatures();
                [st._pendingCreatureSnapshots, st.creatureEmotions] = [merk.tiere.length ? merk.tiere : null, merk.etik];
                if (merk.tiere.length) r._syncBauen("naht", () => r.spawnCreatures());
                [st._pendingCreatureSnapshots, st._bootPhase3] = [merk.pend, merk.p3];
            }
        }
        m.gestartet = true;
    } catch (e) {
        out.lade = Object.assign(out.lade || {}, { err: fehlerStapel(e) });
    }
    // ── LH (w4-ankunft-2): die Hülle eines Studio-Baums, ihr Skelett aus dem Gedächtnis genommen, wächst vor dem Bild nicht und
    // danach im Takt der Hüllen; der Lade-Takt gespielt, je ein Stück im Bild und dahinter fehlt: ohne Leerlauf baut er nur das im
    // Bild, mit Leerlauf auch das dahinter ──
    try {
        const [m, da, merk, sp, pc, ruf] = [(out.huelle = {}), st._weltbildDa, r._baumGestaltMerk, r._voxelChunkConfig().span, st.lastPlayerVoxelChunk, new Set()];
        const baum = st.architectures.find((e) => e && e._huelleG != null && e.blockerAABBs && e.blockerAABBs.length);
        // DER BEDARF IST DER LEIB (w14-ankunft-weg): nach dem Bild wartet die Hülle, bis ein Leib sie berühren kann
        // (`_huellenBedarf`: der Spieler geht, und der Baum steht in HUELLE_BEDARF_M um ihn; eine Kreatur lebt) — die Kreaturen
        // ruhen, der Spieler steht, dann geht er weit vom Baum, dann neben ihn
        const [kreaturen, pos] = [st.creatures, st.playerMesh.position.clone()];
        [r._baumGestaltMerk, st._weltbildDa, st.creatures, baum.blockerAABBs] = [new Map(), 0, [], null];
        const boxen = (dx) => {
            if (dx) st.playerMesh.position.set(baum.position.x + dx, pos.y, baum.position.z);
            for (let i = 0; i < 400 && (r._tickHuellenNach(), r._weltOffen().huellen); i++);
            return (baum.blockerAABBs || []).length;
        };
        try {
            r._populateBlockerAABBs(baum);
            m.h = [r._baumGestaltMerk.size];
            st._weltbildDa = da;
            m.h.push(boxen(0), boxen(99), boxen(1), r._weltOffen().huellen); // 99 m: fern über HUELLE_BEDARF_M
        } finally {
            st.creatures = kreaturen;
            if (!baum.blockerAABBs) r._populateBlockerAABBs(baum);
            st.playerMesh.position.copy(pos);
        }
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
        // DIE KACHELN UM DAS AUGE (w23-ankunft-faden): die Nah-Wiese, ihre Ferne und die Nah-Streu fallen (die Nah-Streu mit ihren
        // Senken) und wachsen einen Takt lang, einmal unter „jede Kachel wartet“ (`_nahKachelWartet`, die EINE Frage vor dem Bild),
        // einmal unter „keine wartet“ — je Bauer [gebaut mit Warten, gebaut ohne]
        const [nw, ns] = [st.nahWiese, st.nahStreu];
        if ((m.k = nw?.reich > 0 && ns && {}))
            try {
                for (const w of [true, false]) {
                    [nw.kacheln.clear(), nw.fern.kacheln.clear(), ns.kacheln.forEach((k) => r._nahStreuKachelEntsorgen(k)), ns.kacheln.clear()]; // prettier-ignore
                    [(r._nahKachelWartet = () => w), (r._standRuht = () => false), r._tickNahWiese(), r._tickNahStreu()];
                    for (const [n, k] of Object.entries({ _tickNahWiese: nw.kacheln, _nahWieseFernTakt: nw.fern.kacheln, _tickNahStreu: ns.kacheln })) (m.k[n] ||= []).push(k.size); // prettier-ignore
                }
            } finally {
                [delete r._nahKachelWartet, delete r._standRuht];
            }
        // DIE KRONE VOR DER KACHEL (w28-krone-vor-kachel): ein Baum tritt in die Pflanz-Schlange (der echte Schreiber
        // `_enqueueVegetationSpawn`), am Rand der Nähe, wo seine Krone alle drei Kachel-Arten erreicht; die drei Bauer gehen, bis
        // nichts mehr wächst, dann landet die Krone (der Wurf verlässt die Schlange, `_kronenStreuNeu` wie `spawnArchitecture`) und
        // sie gehen wieder. Je Bauer [gebaut, stehend, unter der Krone gebaut solange sie kam, unter ihr am Ende]: gebaut ÷ stehend
        // = 1 — keine Kachel fiel mit der Krone und baute neu. DIE MUTANTE in derselben Welt: ohne die Frage (`_kroneKommt` gespielt
        // als „keine kommt“) baut dieselbe Folge doppelt — sieht die Probe das nicht, ist sie blind. DER CHUNK: solange seine
        // Pflanzung offen ist (`_waldPflanzWarten`), wächst in ihm keine Kachel [gebaut solange offen, danach].
        if (m.k)
            try {
                const A = r.constructor;
                const art = Object.keys(A.FOREST.crown)[0];
                const radius = r._kronenRadiusFuer(art, 1);
                const a = A._kronenReich(radius);
                const auge = st.camera.position;
                const M = { _tickNahWiese: [nw.kacheln, A.NAH_WIESE.kachel], _nahWieseFernTakt: [nw.fern.kacheln, A.NAH_WIESE.fern.kachel], _tickNahStreu: [ns.kacheln, A.NAH_STREU.kachel] }; // prettier-ignore
                let ort = null;
                for (let w = 0; w < 16 && !ort; w++) {
                    const [x, z] = [auge.x + (A.NAH_WIESE.radius + 2) * Math.cos((w * Math.PI) / 8), auge.z + (A.NAH_WIESE.radius + 2) * Math.sin((w * Math.PI) / 8)]; // prettier-ignore
                    if (r._wildnisTraegt(x, z) && !r._bodenKommtNie(x - a, z - a, x + a, z + a)) ort = { x, y: auge.y, z };
                }
                if (!ort) throw new Error("kein Ort am Rand der Nähe trägt Wildnis");
                const imKasten = (x0, z0, x1, z1) => (n) => [...M[n][0].keys()].filter((key) => { const [tx, tz] = key.split(",").map(Number); const K = M[n][1]; return !((tx + 1) * K < x0 || tx * K > x1 || (tz + 1) * K < z0 || tz * K > z1); }).length; // prettier-ignore
                const unterKrone = imKasten(ort.x - a, ort.z - a, ort.x + a, ort.z + a);
                const leeren = () => [nw.kacheln.clear(), nw.fern.kacheln.clear(), ns.kacheln.forEach((k) => r._nahStreuKachelEntsorgen(k)), ns.kacheln.clear(), (nw.fern.pruef = null)]; // prettier-ignore
                // die Bauer gehen, bis acht Takte lang keine Kachel mehr wuchs (höchstens 1 200 Takte)
                const gehen = (zahl) => {
                    for (let i = 0, still = 0; i < 1200 && still < 8; i++) {
                        const vor = zahl.n;
                        [r._tickNahWiese(), r._tickNahStreu()];
                        still = zahl.n === vor ? still + 1 : 0;
                    }
                };
                // `imTakt`: die Bauer gehen wie im Takt des laufenden Loops (`_imTakt` gespielt) — nur dort wartet die Kachel
                const lauf = (mutant, imTakt = true) => {
                    const [je, zahl, alt, taktVor] = [{}, { n: 0 }, st.pendingVegSpawns, r._imTakt];
                    const q = (st.pendingVegSpawns = []);
                    leeren();
                    for (const n of Object.keys(M)) [(je[n] = [0, 0, 0, 0]), (M[n][0].set = function (key, v) { return je[n][0]++, zahl.n++, Map.prototype.set.call(this, key, v); })]; // prettier-ignore
                    try {
                        if (mutant) r._kroneKommt = () => false;
                        [(r._standRuht = () => false), (r._imTakt = imTakt)];
                        r._enqueueVegetationSpawn(art, { x: ort.x, y: ort.y, z: ort.z }, { scale: 1 });
                        if (q.length !== 1) throw new Error("der Wurf trat nicht in die Pflanz-Schlange");
                        gehen(zahl);
                        for (const n of Object.keys(M)) je[n][2] = unterKrone(n);
                        // die Krone landet: der Wurf verlässt die Schlange (ihr Stempel regt sich), die Krone trägt sich ein
                        [q.pop(), (r._pflanzRegung = (r._pflanzRegung | 0) + 1), r._kronenStreuNeu("probe:krone", ort.x, ort.z, radius)];
                        gehen(zahl);
                        for (const n of Object.keys(M)) [je[n][1], je[n][3]] = [M[n][0].size, unterKrone(n)];
                    } finally {
                        for (const n of Object.keys(M)) delete M[n][0].set;
                        [delete r._kroneKommt, delete r._standRuht, (r._imTakt = taktVor), r._kronenStreuWeg("probe:krone"), (st.pendingVegSpawns = alt), (r._pflanzRegung = (r._pflanzRegung | 0) + 1)];
                    }
                    return je;
                };
                // AUSSERHALB DES TAKTS (der ruhende Loop, der Playtest ruft den Bauer von Hand) arbeitet niemand die Pflanzung ab: die
                // Kachel unter der kommenden Krone baut sofort — `ausser` zählt sie über die drei Bauer
                m.krone = { art, je: lauf(false), mutant: lauf(true), ausser: Object.values(lauf(false, false)).reduce((s, v) => s + v[2], 0) };
                // der Chunk unter dem Ort: seine Pflanzung offen, dann gepflanzt
                const sp2 = r._voxelChunkConfig().span;
                const [cx, cz] = [Math.floor(ort.x / sp2), Math.floor(ort.z / sp2)];
                const imChunk = imKasten(cx * sp2, cz * sp2, (cx + 1) * sp2, (cz + 1) * sp2);
                const [W, zahl, alt] = [r._waldPflanzWarten || (r._waldPflanzWarten = new Set()), { n: 0 }, st.pendingVegSpawns];
                const [war, taktVor] = [W.has(`${cx},${cz}`), r._imTakt];
                try {
                    [(st.pendingVegSpawns = []), leeren(), W.add(`${cx},${cz}`), (r._standRuht = () => false), (r._imTakt = true)];
                    for (const n of Object.keys(M)) M[n][0].set = function (key, v) { return zahl.n++, Map.prototype.set.call(this, key, v); }; // prettier-ignore
                    gehen(zahl);
                    const offen = Object.keys(M).reduce((s, n) => s + imChunk(n), 0);
                    [W.delete(`${cx},${cz}`), gehen(zahl)];
                    m.krone.chunk = [offen, Object.keys(M).reduce((s, n) => s + imChunk(n), 0)];
                } finally {
                    for (const n of Object.keys(M)) delete M[n][0].set;
                    [delete r._standRuht, (r._imTakt = taktVor), war ? W.add(`${cx},${cz}`) : W.delete(`${cx},${cz}`), (st.pendingVegSpawns = alt)];
                }
            } catch (e) {
                m.krone = { err: fehlerStapel(e) };
            }
        m.gestartet = true;
    } catch (e) {
        out.huelle = { err: fehlerStapel(e) };
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
        out.kreuz = Object.assign(out.kreuz || {}, { err: fehlerStapel(e) });
    }
    // ── L2b: die Hilfe ──
    try {
        const m = { gestartet: false, antworten: {} };
        out.hilfe = m;
        const beispiele = r.chatDslPatterns.map((p) => p.example).concat(r.chatSystemPatterns.map((p) => p.example));
        const v1 = [];
        for (const p of r.chatDslPatterns.concat(r.chatSystemPatterns)) if (Array.isArray(p.hilfe)) v1.push(...p.hilfe);
        const tasten = Object.values(AnazhRealm.KEYBINDING_LABELS || {}).map((k) => r._t(k));
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
        out.hilfe = Object.assign(out.hilfe || {}, { err: fehlerStapel(e) });
    }
    // ── L3: das Gespräch ──
    try {
        const m = { gestartet: false };
        out.gespraech = m;
        const ci = document.getElementById("chat-input");
        if (document.activeElement?.blur) document.activeElement.blur();
        taste(document.body, "keydown", "Enter");
        m.enterFokus = fokus();
        if (m.enterFokus !== "chat-input") ci.focus();
        taste(ci, "keydown", "w", "KeyW");
        m.wImFeld = halt.vor === true;
        const n0 = zeilen().length;
        ci.value = "setze uhrzeit mittag";
        taste(ci, "keydown", "Enter");
        taste(ci, "keypress", "Enter");
        m.gesendet = zeilen().slice(n0).some((z) => z === "> setze uhrzeit mittag");
        m.nachSenden = fokus();
        const ziel = document.activeElement || document.body;
        taste(ziel, "keydown", "w", "KeyW");
        m.wNachSenden = halt.vor === true;
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
            if (a?.blur) a.blur();
        }
        m.gestartet = true;
    } catch (e) {
        out.gespraech = Object.assign(out.gespraech || {}, { err: fehlerStapel(e) });
    }
    // ── L7: der Start-Gurt ──
    try {
        const m = { gestartet: false };
        out.gurt = m;
        m.buch = !!(buch?.ok);
        m.hotbar = st.hotbar.slice();
        // die Art liest die EINE Zuordnung des Gurts (`_gurtArt`: der kind des Studio-Rezepts, am Ort sein Ort) — bis
        // w4-koerper-park las die Linse ihren eigenen kind-Zwilling und nannte jedes Gerät des Spielplatzes eine fehlende Art
        const AD = AnazhRealm.ALT_DOPPEL || {};
        m.eintraege = m.hotbar.filter(Boolean).map((name) => {
            const bp = st.blueprints[name];
            return {
                name,
                sichtbar: !!bp && r._katalogSichtbar(name, bp),
                altDoppel: AD[name] || null,
                art: bp ? r._gurtArt(name) : null,
                platzierbar: !!bp && r._isPlaceableBlueprint(bp),
            };
        });
        const arten = new Set();
        for (const name of Object.keys(st.blueprints))
            if (r._katalogSichtbar(name) && r._isPlaceableBlueprint(st.blueprints[name])) {
                const a = r._gurtArt(name);
                if (a) arten.add(a);
            }
        m.katalogArten = Array.from(arten);
        m.gestartet = true;
    } catch (e) {
        out.gurt = Object.assign(out.gurt || {}, { err: fehlerStapel(e) });
    }
    // ── LK: die Kamera und die Pflanzen ──
    try {
        const m = { gestartet: false, wege: {} };
        out.kamera = m;
        const M = r._genesisMitte();
        const P = M ? { x: M.x, y: r.getTerrainHeightAt(M.x, M.z), z: M.z } : st.playerMesh.position;
        const natur = (a) => r._istNatur(a);
        const naheBaeume = () =>
            st.architectures
                .filter((a) => a && /^baum_/.test(a.type) && a.blockerAABBs && a.blockerAABBs.length)
                .sort((a, b) => Math.hypot(a.position.x - P.x, a.position.z - P.z) - Math.hypot(b.position.x - P.x, b.position.z - P.z));
        let baeume = naheBaeume();
        for (const weiter = window.__deckel("ein naher Baum", 1500); !baeume.length && weiter(); ) {
            await __takte(5, 40);
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
            const aufHang = (x, z) => st.playerMesh.position.set(x, hh(x, z) + 1.0, z); // der Spieler 1 m über dem Hang bei (x, z)
            // Die Pflanzen beiseite (die Blocker der Natur-Einträge): das Soll, das nur Boden und Bau erzwingen. Der Täter beim
            // Namen: der Stamm (Blocker).
            // Pflanze ist, wessen Boxen alle `pflanze` tragen (der Wurf geht `durchPflanzen`); der Fels ist Natur, aber keine
            // Pflanze — er hält die Kamera wie der Bau (K06: die Kugel der Kamera hielt im Ritt 2 von 496 Proben an Natur ohne
            // Pflanzen-Box, die der Mittelstrahl um weniger als ihren Radius verfehlte; die Linse nannte sie „Stamm")
            const pflanzen = st.architectures.filter(
                (a) => a && natur(a) && a.blockerAABBs && a.blockerAABBs.length && a.blockerAABBs.every((b) => b && b.pflanze === true)
            );
            const ohneStaemme = (an) => {
                for (const a of pflanzen) if (an) {
                        a.__lkBlocker = a.blockerAABBs;
                        a.blockerAABBs = null;
                    } else if (a.__lkBlocker) {
                        a.blockerAABBs = a.__lkBlocker;
                        delete a.__lkBlocker;
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
            const med = (a) => (a.length ? +rang(a.slice().sort(aufsteigend)).toFixed(2) : null);
            // EIN WEG zu Fuß (3rd, Neigung 0) oder im Ritt (die Verfolger-Kamera des GT): `stelle(x, z, gier)` setzt Spieler/Wagen.
            const weg = (name, stelle, schritt, sprungM, bildM) => {
                const z = { proben: 0, pflanzeHaelt: 0, taeter: [], sprungM };
                const ist = [];
                const soll = [];
                const taeter = new Set();
                for (const L of linien) for (let s = 0; s <= 30; s += schritt) {
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
                    if (!mitPflanzen) ohneStaemme(true);
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
                    if (!mitPflanzen) ohneStaemme(false);
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
                    aufHang(x, zz);
                    st.yaw = gier;
                },
                1.0,
                1.0,
                0.1
            );
            // DER RITT: ein GT, aufgesessen; der Wagen fährt die Linien (die Verfolger-Kamera hinter ihm, Kern-Gesetz kamera)
            const gt = r.spawnArchitecture("fahrzeug_gt", { x: P.x + 30, y: hh(P.x + 30, P.z) + 0.5, z: P.z }, { silent: true, precise: true });
            if (gt) {
                await __gebautNach(gt);
                const mr = r.mountArchitecture(gt);
                if (mr?.ok) {
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
                const mats = o?.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
                for (const mt of mats) if (mt?.userData && PFLANZE.has(mt.userData.foundryKind)) stoffe.add(mt);
            });
            m.stoffe = stoffe.size;
            const kn = Object.values(r._kamDurchKnoten || {});
            const ohne = Array.from(stoffe).filter((mt) => !(mt.maskNode && kn.includes(mt.maskNode)));
            m.stoffeOhne = ohne.length;
            m.stoffeOhneArten = Array.from(new Set(ohne.map((mt) => mt.userData.foundryKind)));
            m.schattenGeschnitten = Array.from(stoffe).filter((mt) => mt.maskNode && mt.maskNode.isNode && !(mt.maskShadowNode?.isNode)).length;
            // das Ziel der Durchsicht ist der Blickpunkt (3rd: die Brust, zu Fuß um die Schulter versetzt) — gelesen, wo die
            // Uniform es trägt: höchstens KAMERA_SCHULTER_M neben der Brust, und AUF dem Blick der Kamera (
            // Gelb 1 der dritten Gegenprüfung: mit der Brust als Ziel stand die Ebene des Fadenkreuz-Strahls schräg, bei kurzem
            // Arm begann er 0,52–0,78 m hinter dem Blickpunkt)
            const lu = st.lodUniforms;
            if (lu?.uKamZiel) {
                ueber(P);
                r._loopCamera((T += 0.1));
                const v = lu.uKamZiel.value;
                const p = st.playerMesh.position;
                m.zielAbstand = +Math.hypot(v.x - p.x, v.y - (p.y + 1.0), v.z - p.z).toFixed(2);
                m.zielFolgt = m.zielAbstand <= (AnazhRealm.KAMERA_SCHULTER_M || 0) + 0.05;
            }
            // DAS FADENKREUZ IN 3RD: der Abstand der Brust vom Strahl
            // durch die Bildmitte
            {
                ueber(P);
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
                        aufHang(x, zz);
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
                        if (wh?.hit && hinter(wh)) zaehl("_raycastWorldHit");
                        if (hinter(r._blickZiel(AnazhRealm.BLICK_ZIEL_M))) zaehl("_blickZiel");
                        const ph = r._resolvePhantomTarget();
                        if (ph?.hit && hinter(ph)) zaehl("_resolvePhantomTarget");
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
                // die Vorbedingung des Streu-Strahls: die Nah-Streu am Baum (der Ring um das Auge, bis eine Senke steht) — an der
                // Mitte des Genesis-Orts trägt sein Freiraum keine, der Baum steht im Gürtel
                const nahStreu = () => st.nahStreu?.senken.size > 0;
                for (const weiter = window.__deckel("die Nah-Streu am Baum", 300); !nahStreu() && weiter(); ) await __takte(1, 40);
                const rahmen = r._kampfSchwungRahmen({});
                const knoten = r._kamDurchKnoten;
                r._kamDurchKnoten = {};
                m.konsum = {
                    _hasMagnifyingInSight: __rufe(r, "_hasMagnifyingInSight", r, "_fadenkreuzStrahl", []) > 0,
                    _pickScatterAtCrosshair: nahStreu() ? __rufe(r, "_pickScatterAtCrosshair", r, "_fadenkreuzStrahl", []) > 0 : null,
                    _kampfKlingenAchse: __rufe(r, "_kampfKlingenAchse", r, "_fadenkreuzStrahl", [{ rahmen, reach: rahmen.reach, ziel: null }, {}]) > 0,
                    _kameraDurchsichtNode: __rufe(r, "_kameraDurchsichtNode", K, "_durchsichtGewicht", [THREE.TSL, "rinde"]) > 0,
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
                    aufHang(x, zz);
                    if (st.playerVel?.setValue) st.playerVel.setValue(0, 0, 0);
                    const gier = Math.atan2(-ux, -uz);
                    st.yaw = gier;
                    st.pitch = 0;
                    halt.vor = true;
                    for (let i = 0; i < 120; i++) {
                        st.yaw = gier;
                        __handTakt();
                        await sleep(16);
                    }
                    halt.vor = false;
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
                            aufHang(x, zz);
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
            ueber(P);
        }
        m.gestartet = true;
    } catch (e) {
        out.kamera = Object.assign(out.kamera || {}, { err: fehlerStapel(e) });
    }
    // ── D6: die KI nennt die Ursache ──
    try {
        const m = { gestartet: false };
        out.ki = m;
        const llm = st.llm;
        const alt = jsonKlon({ enabled: llm.enabled, provider: llm.provider, oll: llm.providerConfig.ollama });
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
        m.ohneSchluessel = zeilen()[zeilen(1).indexOf("nexus.schweigt", n0 + 1)] || null;
        // (c) der Proxy: der Ursprung der Seite (der Linsen-Server kennt /api/proxy/llm nicht → 404)
        m.ursprung = location.origin;
        m.proxyUrl = r._llmProxyUrl();
        llm.provider = "ollama";
        llm.enabled = true;
        llm.providerConfig.ollama.endpoint = "https://ollama.com";
        llm.providerConfig.ollama.useProxy = true;
        const ant = await r.llmCall("hallo welt");
        m.proxyFehler = ant?.error ? r.constructor._tIn("de", ...[].concat(ant.error)) : ""; // eine Zeile der Tafel (spielgang.K5#2)
        llm.enabled = alt.enabled;
        llm.provider = alt.provider;
        llm.providerConfig.ollama = alt.oll;
        llm.lastError = null;
        m.gestartet = true;
    } catch (e) {
        out.ki = Object.assign(out.ki || {}, { err: fehlerStapel(e) });
    }
    // ── D9 + D8: das Dorf vor dir, zwei Kanäle ──
    try {
        const m = { gestartet: false };
        out.dorf = m;
        const k = { gestartet: false };
        out.kanal = k;
        m.buch = !!(buch?.ok);
        const M = r._genesisMitte();
        if (!M) throw new Error("kein Genesis-Ort (der Plan der Welt)");
        const P = { x: M.x, y: r.getTerrainHeightAt(M.x, M.z), z: M.z };
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
        ueber(P);
        st.yaw = best.yaw;
        const cam = st.camera;
        const tanH = Math.tan(((cam.fov || 75) * Math.PI) / 360) * (cam.aspect || 16 / 9);
        const vor = new Set(st.architectures);
        const z0 = zeilen().length;
        r.processChatCommand("dorf 7 18");
        for (const weiter = __deckel("die Antwort auf das Dorf", 300); weiter() && !zeilen(1).slice(z0).some((k) => /^chat\.befehl\.dorf\./.test(k)); ) await sleep(200);
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
        m.dorfZeile = (k.zeilen[zeilen(1).slice(z0).findIndex((s) => /^chat\.befehl\.dorf\.steht/.test(s))] || "").slice(0, 120);
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
                for (const weiter = __deckel("die Häuser des Dorfs", 240); ruhig < 6 && weiter(); ) {
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
            ueber(P);
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
            ueber(P);
            st.yaw = best.yaw;
        }
        // DER GESPERRTE SLOT: ein Slot am Rand des Genesis-Orts (sein Grundriss reicht 2 m in den Freiraum der Tore; die
        // Rückseite des Hauses, lokal +z, zeigt von ihm weg) trägt seinen Boden y wie jeder Slot des Plans v2 — die Bau-Wand
        // (`_bauFrei` → `_genesisFlaeche`) wirft ihn an seinem Ort, kein Haus steht (K10: der Plan ist das Dorf, die Ersatz-Orte
        // fielen). Der Freiraum ist seit dem Genesis-Ort das Rund um Kern und Ring (fachwerk `GENESIS_ORT.freiraum`); bis dahin
        // die Lichtung der Stein-Scheibe (`_grundrissVon` der Plattform, die mit dem Plan fiel).
        const f = r._foundry;
        const kultur = Object.keys(f.recipes).find((id) => f.recipes[id] && f.recipes[id].kind === "haus" && st.blueprints["haus_" + id]);
        const R = window.__fachwerkCore.GENESIS_ORT.freiraum.r;
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
        out.dorf = Object.assign(out.dorf || {}, { err: fehlerStapel(e) });
    }
    return out;
}

hauptLauf(async () => {
    if (SELBSTTEST) {
        console.log("=== SELBST-TEST — die Ankunfts-Linse nennt ihre Täter ===");
        const l2aTerme = ["welt", "boden", "horizont", "licht", "leib", "zeichnung", "buch", "bauten", "pflanzung", "streu", "karten", "dorf"];
        // die gesunden Köpfe der Ankunft (ihre Mutanten tauschen je einen Teil)
        const koepfe = { orte: [{ wer: "die Nah-Wiese", art: "gras L1", blick: true }, { wer: "der Gesetz-Fit", art: "blume L0", blick: true }], leib: { bestellt: ["vor L1 Kopf", "nach L0"], ohneFein: true, egoRoh: true, baut: ["vor 1", "nach 0"] }, dorf: { kopf: true, export: true, kopfRang: true } };
        // der kleine Satz der Stand-Zeile (je Mutante ein Fall getauscht)
        const l2Klein = { ohneBoden: { weg: false, stand: "Boden" }, baumUngebaut: { weg: false, stand: "Bäume und Bauten" }, karteOffen: { weg: false, stand: "ferne Bäume" }, allesSteht: { weg: true }, lueckeRuht: { weg: true, warn: 1 } };
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
        // der gesunde Vorbau der Kamm-Krone (w28-leben-vorbau; je Mutante ein Teil getauscht)
        const quittGut = { probestumm: { verschluckt: true, quittiert: null, antwort: true, bruch: 1 }, probelebt: { verschluckt: false, quittiert: 480, antwort: true, bruch: 0 } };
        const stehtGut = {
            bild: { zeichnung: 1, steht: false, grund: "Zeichnung offen 1: Bild 1 (LinseStoff_7)" },
            einmal: { zeichnung: 1, steht: false, grund: "Zeichnung offen 1: Einmal 1 (LinseStoff_7)" },
            zu: { zeichnung: 0, steht: true },
            tor: { zeichnung: 0, steht: false, akte: true, grund: "Tore ohne Fenster 1" },
            torOhne: { zeichnung: 0, steht: true },
        };
        const kammGut = { gast: true, art: "ankunft", stoff: true, form: "aDeckt,color,normal,position", bestellt: 0, wahl: "merken,bauen", raum: "gast,buerger-laut" };
        const l2aFaelle = {
            ohneBoden: halt("Boden", "boden"),
            baumUngebaut: halt("Bäume und Bauten", "bauten"),
            streuNie: halt("Wald-Stück", "streu"),
            karteOffen: halt("ferne Bäume", "karten"),
            ...Object.fromEntries(["bodenHinten", "baumHinten", "karteHinten", "pflanzungHinten"].map((k) => [k, weicht])),
            weltFehlt: halt("Welt entsteht", "welt"),
            buchZu: halt("Buch der Studios", "buch"),
            leibFehlt: halt("Leib", "leib"),
            pflanzung: halt("gepflanzt", "pflanzung"),
            saat: halt("bepflanzt", "pflanzung"),
            horizont: halt("Horizont", "horizont"),
            licht: halt("Licht des Orts", "licht"),
            zeichnungWartet: halt("1 Programm des Bilds entsteht", "zeichnung"),
            zeichnungSteht: weicht,
            zeichnungOhneAussicht: { weg: true, stand: "", warn: 1, bruch: 1 },
            fadenStumm: { weg: true, stand: "", warn: 1, bruch: [1, 1] },
            pflanzungOhneFaden: { weg: true, stand: "", warn: 1, bruch: [0, 1] },
            dorfExport: halt("Dorf", "dorf"),
            dorfSchlange: halt("Dorf", "dorf"),
            dorfFaellig: halt("Dorf", "dorf"),
            allesSteht: { weg: true, stand: "", warn: 0 },
            lueckeRuht: { weg: true, stand: "", warn: 1 },
            lueckeFlackert: { weg: true, stand: "", warn: 1 },
            lueckeArbeitet: halt("Buch", "buch"),
        };
        const wiederGesund = { offen: [2, 1, 0], offenOhne: [], vor: 0, gussVor: 0, stand: [2, true], wartet: 0, ungezeichnet: 0, gaeste: [1, 0], zuerst: [1, true], standHalb: [2, true], nach: 2, gussNach: 0, treu: true, weg: true, gaesteWeg: true, ms: 900, mutant: 2, mutantVorbau: 1, err: "" };
        const geburtGesund = { offen: [3, 2, 0], wartet: 3, weg: true, ohne: [0, 0], err: "" };
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
                    loopVorInit: { vendor: "wirft", ruht: true, wurf: "", waechter: true },
                    wiederkehr: wiederGesund,
                    geburt: geburtGesund,
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
                    vorrat: vr({ nachBild: 2, ende: true }),
                    kammVorbau: kammGut,
                    stehtGezeichnet: stehtGut,
                    quittung: quittGut,
                    anfragen: { "/voxel-worker.js": 1, "/phyto-core.js": 2, "/foundry-bruecke.js": 1 },
                    seite: ["/phyto-core.js"],
                },
                [
                    // DIE QUITTUNG DER GEBURT und DIE ZWEITE ANFRAGE (w28-faden-quelle)
                    ["die Mutante (ein Faden verschluckt sein ack) bricht nicht beim Namen", { quittung: { ...quittGut, probestumm: { ...quittGut.probestumm, bruch: 0 } } }, "ein Faden antwortet, ohne seine Geburt zu quittieren"],
                    ["ein Faden, der sein ack verschluckt, gilt als quittiert", { quittung: { ...quittGut, probestumm: { ...quittGut.probestumm, quittiert: 4 } } }, "ein Faden, der sein ack verschluckt, gilt"],
                    ["der lebende Faden quittiert nie", { quittung: { ...quittGut, probelebt: { ...quittGut.probelebt, quittiert: null } } }, "ein lebender Faden quittiert seine Geburt nie"],
                    ["der lebende Faden bricht als ungewiss", { quittung: { ...quittGut, probelebt: { ...quittGut.probelebt, bruch: 1 } } }, "ein lebender Faden bricht als ungewiss"],
                    ["ein Probe-Faden rechnet nicht", { quittung: { ...quittGut, probestumm: { ...quittGut.probestumm, antwort: false } } }, "die Quittung der Geburt: ein Probe-Faden rechnete"],
                    ["ohne Quittungs-Probe", { quittung: undefined }, "die Quittung der Geburt: keine Probe"],
                    ["die Fäden holen voxel-worker.js je selbst (der Stand vor w28-faden-quelle)", { anfragen: { "/voxel-worker.js": 7, "/phyto-core.js": 2 } }, "/voxel-worker.js: 7 Anfragen"],
                    ["ein Faden holt einen Kern der Seite selbst", { anfragen: { "/voxel-worker.js": 1, "/phyto-core.js": 3 } }, "/phyto-core.js: 3 Anfragen"],
                    ["zwei Studio-Fäden holen die Brücke", { anfragen: { "/voxel-worker.js": 1, "/foundry-bruecke.js": 2 } }, "/foundry-bruecke.js: 2 Anfragen"],
                    ["die Wand zählt nichts", { anfragen: {} }, "die Wand der zweiten Anfrage zählt keine"],
                    ["ein Loch hinter dem Spieler hält das erste Bild", { faelle: mitFall(l2aFaelle, { baumHinten: { weg: false } }) }, "mit einem Baum hinter"],
                    ["ein Loch im Blick weicht (B3d)", { faelle: mitFall(l2aFaelle, { karteOffen: weicht }) }, "mit der offenen Karte eines Baums im"],
                    ["ein Loch im Rundblick nach N Takten (B3d)", { rundblick: { N: 240, loecher: 3, erstes: "Takt 120", spaet: true, griff: 40 } }, "der Rundblick nach der Kontrolle zählt"],
                    ["der Rang ohne Blick", { rang: { vorBild: "hinten,blick,vorrat", nachBild: "hinten,blick,vorrat" } }, "vor dem ersten Bild sendet"],
                    ["der Blick-Schlüssel überlebt das Bild", { rang: { vorBild: "blick", nachBild: "hinten,blick" } }, "nach dem ersten Bild sendet"],
                    ["ohne Rundblick", { rundblick: { N: undefined, loecher: 0 } }, "der Rundblick nach der Kontrolle:"],
                    ["ohne späten Baum", { rundblick: { N: 240 } }, "der Rundblick ohne späten"],
                    ["die Pflanz-Schlange als FIFO", { rundblick: { N: 240, spaet: 2, griff: -300 } }, "die Pflanz-Schlange setzt die"],
                    ["der Vorrat stellt sich in der Ankunft vor die Leser (K30)", { vorrat: vr({ vorBild: ["a"], nachBild: 0, ende: true }) }, "vor dem ersten Weltbild"],
                    ["der Vorrat stirbt (er wartet ewig)", { vorrat: vr({ vorBild: [], nachBild: 0, ende: true }) }, "der Vorrat bestellt nie"],
                    ["der Vorrat endet nicht", { vorrat: vr({ vorBild: [], nachBild: 0, ende: false }) }, "der Vorrat endet nicht"],
                    ["das Tor wartet auf den Vorrat", { vorrat: vr({ fehltNeu: ["a"] }) }, "während der Vorrat läuft, wartet das"],
                    ["die Streu wartet auf den Vorrat statt auf ihr Asset", { vorrat: vr({ streu: { aufgeschoben: true, zellen: 0 } }) }, "während der Vorrat läuft,"],
                    ["der Vorrat bestellt Karten nach der Buchgröße (K30)", { vorrat: vr({ karten: 14 }) }, "der Vorrat bestellt 14"],
                    ["der Merker sagt „an“, während der Vorrat auf das Bild wartet", { vorrat: vr({ nachBild: 1, ende: true, phaseStart: true, phaseVorBild: true, phaseBestellung: ["a: true"] }) }, "solange der Vorrat auf"],
                    ["der Vorrat bestellt in der Warte-Phase (K30-N1)", { vorrat: vr({ nachBild: 1, ende: true, phaseBestellung: ["a"] }) }, "der Vorrat bestellt, ohne dass"],
                    ["der Vorrat ohne Phase (K30-N1)", { vorrat: vr({ nachBild: 1, ende: true, PH: undefined }) }, "der Vorrat nennt keine"],
                    ["der Vorrat ohne Probe", { vorrat: undefined }, "der Vorrat: keine Probe"],
                    ["die Zusage wartet auf die ganze Schlange", { wald: { ferne: 169, steht: false, zusage: true, kam: true, rest: 0 } }, "die Zusage des Wald-Plans"],
                    ["der Wald-Fall ohne fernen Kasten", { wald: { ferne: 0, steht: false, zusage: true, kam: true, rest: 0 } }, "die Zusage des Wald-Plans:"],
                    ...[[{ geweckt: false, vor2: 1 }, "das Weltbild wartete auf"], [{ vor1: null }, "das halbe Weltbild"], [{ nach2: null }, "der Rundblick vergisst"], [{ n: [] }, "das Bild der Ankunft:"]].map(([b, soll]) => [soll, { blick: { n: [4, 6], vor1: 1, geweckt: true, nach2: 1, ...b } }, soll]), ["Lade-Takt", { takt: { lief: 1 } }, "die Streu setzte im"], ["ohne Lade-Takt", { takt: undefined }, "der Lade-Takt: kein Fall"],
                    ["ein Term ohne Fall (K60: die Pflanz-Schlange kam ohne Fall)", { terme: l2aTerme.concat(["zauber"]) }, "der Term „zauber“ des"],
                    ["ein Fall nennt einen Term außerhalb der Liste", { faelle: mitFall(l2aFaelle, { pflanzung: { weg: false, terme: ["saat"] } }) }, "der Fall pflanzung nennt"],
                    ["ohne die Terme", { terme: undefined }, "die Terme des ersten"],
                    ["das Tor wartet auf seine L0", { ankunft: ank({ fein: ["geisttor 9 m L0"], nahKarte: 0 }) }, "das erste Weltbild wartet"],
                    ["der nahe Baum vor dem Bild ohne Karte", { ankunft: ank({ nahKarte: 0 }) }, "ein naher Baum wünscht"],
                    ["die Gestalt verfeinert nie", { ankunft: ank({ nahDanach: 2 }) }, "nach dem ersten Weltbild"],
                    ["der Kalt-Schätzer als Zwilling", { ankunft: ank({ zwilling: ["geisttor 11 m L0"] }) }, "der Kalt-Schätzer wählt anders"],
                    ["die Ferne hält das Ring-Tor", { ankunft: ank({ wahl: 2 }) }, "die Ferne hält die"],
                    ["die Ferne ohne Probe", { ankunft: ank({ soll: undefined }) }, "die Ferne: keine Probe"],
                    ["ohne Ankunfts-Probe", { ankunft: undefined }, "die Ankunft aus der"],
                    ["die Köpfe ohne Bild-Rang der Bahn", { rang: { vorBild: "blick", nachBild: "hinten,blick,vorrat", bahnen: { leib: "w0", "export-settlement": "w1", tor0: "w2", tor1: "w0", tor2: "w1", tor3: "w2" } } }, "der Kopf der Ankunft"],
                    ["ein Tor hinter dem Dorf-Export", { rang: { vorBild: "blick", nachBild: "hinten,blick,vorrat", bahnen: { leib: "w1", "export-settlement": "w2", tor0: "w2", tor1: "w0", tor2: "w0", tor3: "w0" } } }, "tor0 stellen sich hinter"],
                    ["der Leib ohne Kopf-Rang", { koepfe: mitFall(koepfe, { leib: { ...koepfe.leib, bestellt: ["vor L1", "nach L0"] } }) }, "vor dem ersten Bild geht"],
                    ["der Bild-Rang ortlos", { koepfe: mitFall(koepfe, { orte: [{ wer: "die Nah-Wiese", art: "gras L1", blick: false }, { wer: "der Gesetz-Fit", art: "blume L0", blick: false }] }) }, "vor dem ersten Bild bestellt"],
                    ["die Probe des Bild-Rangs ohne Gesetz-Fit", { koepfe: mitFall(koepfe, { orte: [{ wer: "die Nah-Wiese", art: "gras L1", blick: true }] }) }, "der Gesetz-Fit bestellt vor"],
                    ["der Leib wartet auf die feine Stufe", { koepfe: mitFall(koepfe, { leib: { bestellt: ["vor L0", "vor L1"], ohneFein: false, baut: ["vor 0"] } }) }, "vor dem ersten Bild bestellt"],
                    ["Ego tauscht", { koepfe: mitFall(koepfe, { leib: { ...koepfe.leib, egoRoh: false } }) }, "in Ego oder auf Third gießt"],
                    ["der Leerlauf tauscht nie", { koepfe: mitFall(koepfe, { leib: { ...koepfe.leib, baut: ["vor 1"] } }) }, "im Leerlauf tauscht"],
                    ["der Dorf-Export wartet auf den Takt", { koepfe: mitFall(koepfe, { dorf: { kopf: false, export: false } }) }, "mit dem Buch geht"],
                    ["das erste Weltbild ohne Dorf", { faelle: mitFall(l2aFaelle, { dorfSchlange: weicht }) }, "mit den Häusern eines"],
                    ["das fällige Start-Dorf ohne Fall", { faelle: mitFall(l2aFaelle, { dorfFaellig: undefined }), ohneFall: { dorfFaellig: "400 m" } }, "mit einem fälligen, noch"],
                    ["eine arbeitende Lücke weicht", { faelle: mitFall(l2aFaelle, { lueckeArbeitet: { weg: true } }) }, "eine arbeitende Lücke weicht"],
                    ["gesetzt, nicht gezeichnet: der Ladeschirm weicht vor dem wartenden Bürger (w28-bild-ganz)", { faelle: mitFall(l2aFaelle, { zeichnungWartet: weicht }) }, "mit einem Bürger des Bilds"],
                    ["der Term „zeichnung“ ohne Fall", { faelle: mitFall(l2aFaelle, { zeichnungWartet: undefined }), ohneFall: { zeichnungWartet: "keine Erst-Zeichnung" } }, "mit einem Bürger des Bilds"],
                    ["eine stehende Pipeline hält weiter", { faelle: mitFall(l2aFaelle, { zeichnungSteht: { weg: false } }) }, "ein Bürger, dessen Pipeline steht, hält"],
                    ["ein Bürger ohne Aussicht hält für immer", { faelle: mitFall(l2aFaelle, { zeichnungOhneAussicht: { weg: false } }) }, "ein Bürger, dessen Programm nie"],
                    ["ein Bürger ohne Aussicht weicht still", { faelle: mitFall(l2aFaelle, { zeichnungOhneAussicht: { weg: true, bruch: 0 } }) }, "ein Bürger ohne Aussicht weicht ohne"],
                    ["ein stummer Faden weicht still", { faelle: mitFall(l2aFaelle, { fadenStumm: { weg: true, bruch: [0, 1] } }) }, "ein Faden, der nie antwortete, weicht ohne"],
                    ["die Pflanzung neben dem stummen Faden weicht still", { faelle: mitFall(l2aFaelle, { fadenStumm: { weg: true, bruch: [1, 0] } }) }, "eine offene Pflanzung neben einem stummen"],
                    ["ein lebender Faden bricht als stumm", { faelle: mitFall(l2aFaelle, { pflanzungOhneFaden: { weg: true, bruch: [1, 1] } }) }, "ein Faden, der antwortete, bricht"],
                    ["die offene Pflanzung weicht still", { faelle: mitFall(l2aFaelle, { pflanzungOhneFaden: { weg: true, bruch: [0, 0] } }) }, "eine offene Pflanzung weicht ohne"],
                    ["die Welt steht über einem Bürger ohne Pipeline (das alte `_weltOffen` ohne `zeichnung`, w28-welt-steht)", { stehtGezeichnet: { ...stehtGut, bild: { zeichnung: 0, steht: true, grund: "Fege-Takt deckWache 6400/6528" } } }, "die Welt steht, während ein Bürger der Welt-Szene"],
                    ["die Welt steht über einem Einmal-Render im Bau", { stehtGezeichnet: { ...stehtGut, einmal: { zeichnung: 0, steht: true } } }, "die Welt steht, während ein Einmal-Render"],
                    ["der Wartende hält die Welt ohne Namen", { stehtGezeichnet: { ...stehtGut, bild: { zeichnung: 1, steht: false, grund: "Zeichnung offen 1" } } }, "ein Bürger der Welt-Szene hält die Welt ohne Namen"],
                    ["die gekommene Pipeline hält die Welt weiter", { stehtGezeichnet: { ...stehtGut, zu: { zeichnung: 1, steht: false } } }, "steht die Pipeline, steht die Welt nicht wieder"],
                    ["die Welt steht über dem Tor, dessen Fenster sein Ziel liest (das alte `_weltOffen` ohne `tore`)", { stehtGezeichnet: { ...stehtGut, tor: { steht: true, akte: false } } }, "die Welt steht, während ein waches Tor"],
                    ["ein Tor ohne Ziel-Bild hält für immer", { stehtGezeichnet: { ...stehtGut, torOhne: { steht: false } } }, "ein Tor, dessen Ziel benannt ohne Bild"],
                    ["ohne die Probe der stehenden Welt", { stehtGezeichnet: undefined }, "die Welt steht ohne ihre Zeichnung: keine Probe"],
                    ["ein Bürger, der nach dem Bild erst sein Programm baut, ist ROT beim Namen (die Kamm-Krone ohne Gast, w28-leben-vorbau)", { kammVorbau: { ...kammGut, gast: false } }, "die Kamm-Krone baut ihr Programm erst nach"],
                    ["der Gast der Ankunft baut unter dem Ladeschirm (die Ankunft zahlt seinen Bau)", { kammVorbau: { ...kammGut, wahl: "bauen,bauen" } }, "der Gast der Ankunft baut nicht gleich"],
                    ["der Gast der Ankunft baut nie (er merkt auch nach dem Bild nur)", { kammVorbau: { ...kammGut, wahl: "merken,null" } }, "der Gast der Ankunft baut nicht gleich"],
                    ["ein echter Bürger trägt die Gast-Prägung und rutscht als Gast durch", { kammVorbau: { ...kammGut, raum: "gast,gast" } }, "die Gast-Prägung allein nimmt vom"],
                    ["ein Bürger mit Gast-Prägung zeichnet, aber still", { kammVorbau: { ...kammGut, raum: "gast,buerger-still" } }, "die Gast-Prägung allein nimmt vom"],
                    ["der Gast der Kamm-Krone nimmt Raum", { kammVorbau: { ...kammGut, raum: "buerger,buerger-laut" } }, "die Gast-Prägung allein nimmt vom"],
                    ["der Gast trägt einen fremden Stoff", { kammVorbau: { ...kammGut, stoff: false } }, "der Gast der Kamm-Krone trägt nicht"],
                    ["die Rechnung der Krone vor dem Bild", { kammVorbau: { ...kammGut, bestellt: 1 } }, "die Kamm-Krone bestellt 1-mal"],
                    ["der Vorbau der Kamm-Krone ohne Probe", { kammVorbau: undefined }, "das Programm der Kamm-Krone vor"],
                    ["ein Fall ohne Grund", { faelle: mitFall(l2aFaelle, { karteOffen: undefined }) }, "mit der offenen Karte eines Baums im"],
                    ["kein Ladeschirm", { imHtml: false }, "kein Ladeschirm im HTML"],
                    ["unter der UI", { zIndex: 5 }, "der Ladeschirm liegt unter"],
                    ["stumme Stand-Zeile", { faelle: mitFall(l2Klein, { ohneBoden: { weg: false, stand: "" } }) }, "ohne Boden unter dem"],
                    ["bleibt, wenn alles steht", { faelle: mitFall(l2Klein, { allesSteht: { weg: false, stand: "?" } }) }, "steht alles, bleibt der"],
                    ["ruhende Lücke hält fest", { faelle: mitFall(l2Klein, { lueckeRuht: { weg: false, warn: 0 } }) }, "eine ruhende Lücke hält"],
                    ["ruhende Lücke still", { faelle: mitFall(l2Klein, { lueckeRuht: { weg: true, warn: 0 } }) }, "eine ruhende Lücke weicht"],
                    ["blockt die Linsen", { nachBootWeg: false }, "nach dem Boot"],
                    ["Schleife fragt das Weltbild nicht", { schleifeFragt: false }, "die Render-Schleife fragt das"],
                    ["der Loop-Stand wirft vor dem init des Renderers (der Leib gießt im Haupt-Faden, w28-loop-vor-init)", { loopVorInit: { vendor: "wirft", ruht: null, wurf: "Cannot read properties of null (reading 'getAnimationLoop')", waechter: null } }, "der Loop-Stand wirft vor dem init"],
                    ["der Loop läuft vor dem init des Renderers", { loopVorInit: { vendor: "wirft", ruht: false, wurf: "", waechter: false } }, "vor dem init des Renderers kommt kein Takt"],
                    ["der Wächter hält vor dem init des Renderers", { loopVorInit: { vendor: "wirft", ruht: true, wurf: "", waechter: false } }, "der Wächter der Foundry hält eine Antwort vor dem init"],
                    ["der Loop vor dem init ohne Renderer des Vendors", { loopVorInit: { vendor: "kein Renderer des Vendors — x", ruht: null, wurf: "", waechter: null } }, "der Loop vor dem init des Renderers: kein Renderer"],
                    ["der Loop vor dem init ohne Probe", { loopVorInit: undefined }, "der Loop vor dem init des Renderers: keine Probe"],
                    ["die Wesen des Stands kehren vor dem Bild wieder (w28-tiere-nach-bild)", { wiederkehr: { ...wiederGesund, vor: 2 } }, "ein Stand mit Wesen holt 2 vor dem ersten Weltbild zurück"],
                    ["die Wiederkehr gießt auf dem Haupt-Faden", { wiederkehr: { ...wiederGesund, gussNach: 4 } }, "die Wiederkehr der Tiere gießt 4 Vorlagen"],
                    ["der Stand im Fenster verliert die Wesen", { wiederkehr: { ...wiederGesund, stand: [0, true] } }, "ein Stand, der vor der Wiederkehr geschrieben wird, trägt 0 von 2 Wesen"],
                    ["der Stand im Fenster verliert die Etiketten", { wiederkehr: { ...wiederGesund, stand: [2, false] } }, "ein Stand, der vor der Wiederkehr geschrieben wird, verliert die Etiketten"],
                    ["die Wiederkehr wartet nicht auf ihren Vorrat", { wiederkehr: { ...wiederGesund, wartet: 2 } }, "die Wiederkehr wartet nicht auf den Vorrat ihres Stands"],
                    ["die Wesen des Stands kehren nie wieder", { wiederkehr: { ...wiederGesund, nach: 0, treu: false } }, "nach Bild und Vorrat stehen 0 von 2 Wesen"],
                    ["die Wesen kehren ohne Etikett wieder", { wiederkehr: { ...wiederGesund, treu: false } }, "die Wesen des Stands kehren ohne ihre Etiketten wieder"],
                    ["der Stash bleibt nach der Wiederkehr", { wiederkehr: { ...wiederGesund, weg: false } }, "nach der Wiederkehr steht der Stash"],
                    ["der Vorrat des Stands braucht zu lange", { wiederkehr: { ...wiederGesund, ms: 40000 } }, "die Wesen des Stands stehen erst 40000 ms"],
                    ["die Probe der Wiederkehr ist blind", { wiederkehr: { ...wiederGesund, mutant: 0 } }, "die Wiederkehr der Tiere: die alte Sofort-Wiederkehr fällt"],
                    ["die Wesen kehren wieder, bevor ihre Programme stehen (da, aber nicht gezeichnet)", { wiederkehr: { ...wiederGesund, ungezeichnet: 2 } }, "2 Wesen kehren wieder, bevor die Programme ihrer Leiber stehen"],
                    ["der Vorrat des Stands stellt keinen Gast", { wiederkehr: { ...wiederGesund, gaeste: [0, 0] } }, "der Vorrat eines Stands stellt keinen Gast des Vorbaus"],
                    ["ein Gast der Wiederkehr nimmt Raum", { wiederkehr: { ...wiederGesund, gaeste: [1, 1] } }, "1 Gäste des Vorbaus der Wiederkehr nehmen Raum"],
                    ["alle Gattungen kehren in einem Zug wieder", { wiederkehr: { ...wiederGesund, zuerst: [2, false] } }, "die Gattung des nächsten Wesens kehrt nicht zuerst und allein wieder: 2 Wesen"],
                    ["die fernere Gattung kehrt zuerst wieder", { wiederkehr: { ...wiederGesund, zuerst: [1, false] } }, "die Gattung des nächsten Wesens kehrt nicht zuerst und allein wieder: 1 Wesen"],
                    ["der Stand zwischen den Zügen verliert die Ausstehenden", { wiederkehr: { ...wiederGesund, standHalb: [1, true] } }, "ein Stand zwischen zwei Zügen der Wiederkehr trägt 1 von 2 Wesen"],
                    ["der Stand zwischen den Zügen verdreht die Etiketten", { wiederkehr: { ...wiederGesund, standHalb: [2, false] } }, "ein Stand zwischen zwei Zügen der Wiederkehr trägt 2 von 2 Wesen, die Etiketten in falscher Folge"],
                    ["ein Gast bleibt nach der Wiederkehr", { wiederkehr: { ...wiederGesund, gaesteWeg: false } }, "nach der Wiederkehr steht ein Gast des Vorbaus noch"],
                    ["die Probe sieht die Wiederkehr ohne Programme nicht", { wiederkehr: { ...wiederGesund, mutantVorbau: 0 } }, "die Wiederkehr der Tiere: eine Wiederkehr ohne die Programme"],
                    ["die Welt steht, während Wesen ausstehen (w28-wesen-offen)", { wiederkehr: { ...wiederGesund, offen: [0, 0, 0] } }, "solange Wesen des Stands ausstehen, nennt die Welt sie nicht offen"],
                    ["zwischen den Zügen nennt die Welt nichts offen", { wiederkehr: { ...wiederGesund, offen: [2, 0, 0] } }, "solange Wesen des Stands ausstehen, nennt die Welt sie nicht offen"],
                    ["nach der Wiederkehr bleibt ein Wesen offen", { wiederkehr: { ...wiederGesund, offen: [2, 1, 1] } }, "nach der Wiederkehr nennt die Welt noch 1 Wesen offen"],
                    ["die Welt steht, während Geburten ausstehen (w28-wesen-offen)", { geburt: { ...geburtGesund, offen: [0, 0, 0], wartet: 0 } }, "solange Geburten ausstehen, nennt die Welt sie nicht offen"],
                    ["ohne den Vorrat der Gattungen nennt die Welt die Geburten nicht offen", { geburt: { ...geburtGesund, wartet: 0 } }, "solange Geburten ausstehen, nennt die Welt sie nicht offen"],
                    ["die Geburt wartet auf Frame-Luft (die Bestellung ohne Ende offen)", { geburt: { ...geburtGesund, offen: [3, 3, 0] } }, "ein Atem der Boot-Phase 3 zählt seinen Kopf nicht ab (3 offen"],
                    ["nach dem letzten Atem bleibt eine Geburt offen", { geburt: { ...geburtGesund, offen: [3, 2, 1], weg: false } }, "nach dem letzten Atem nennt die Welt noch 1 Geburten offen"],
                    ["eine Welt ohne Platz für Tiere bleibt offen", { geburt: { ...geburtGesund, ohne: [0, 3] } }, "eine Welt ohne bestellte Tiere nennt Geburten offen"],
                    ["die Geburten ohne Probe", { geburt: undefined }, "die Geburten der frischen Welt: keine Probe"],
                    ["die Wiederkehr ohne Probe", { wiederkehr: undefined }, "die Wiederkehr der Tiere: keine Probe"],
                    ["flackernde Lücke ohne Deckel", { faelle: mitFall(l2Klein, { lueckeFlackert: { weg: false, warn: 0 } }) }, "eine flackernde Lücke hält"],
                    ["W hinter dem Ladeschirm", { tastenHinter: { w: true, enter: "BODY", omnibox: false } }, "hinter dem Ladeschirm läuft"],
                    ["Enter hinter dem Ladeschirm", { tastenHinter: { w: false, enter: "chat-input", omnibox: false } }, "hinter dem Ladeschirm öffnet Enter"],
                    ["Strg+K hinter dem Ladeschirm", { tastenHinter: { w: false, enter: "BODY", omnibox: true } }, "hinter dem Ladeschirm öffnet Strg+K"],
                    ["weicht nicht aus dem Layout (0710-11)", { weichtGanz: { hidden: true, display: "flex", animationen: 1 } }, "der Ladeschirm weicht nicht"],
                ],
            ],
            ["L1", kreuzVerdict, { gestartet: true, da: true, sichtbar: true, dx: 0, dy: 0, mitSchublade: false, nachSchublade: true }, [["kein Fadenkreuz", { da: false }, "kein Fadenkreuz"], ["daneben", { dx: 7 }, "das Fadenkreuz steht 7/0"], ["über der Werkstatt", { mitSchublade: true }, "das Fadenkreuz steht über"]]],
            [
                "L2b",
                hilfeVerdict,
                {
                    gestartet: true,
                    unbekanntListe: false,
                    antworten: { hilfe: hilfeGut, help: hilfeGut, "?": hilfeGut },
                },
                [["hilfe unbekannt", { antworten: { hilfe: { unbekannt: true, erste: "?", fehlt: [], tastenFehlen: [], v1: false }, help: hilfeGut, "?": hilfeGut } }, "„hilfe\" ist unbekannt"], ["Liste von Hand", { unbekanntListe: true }, "der Satz für Unbekanntes"], ["Tafel halb", { antworten: { hilfe: { ...hilfeGut, fehlt: ["folge mir"] }, help: hilfeGut, "?": hilfeGut } }, "„hilfe\" nennt 1 Beispiel"]],
            ],
            ["L3", gespraechVerdict, { gestartet: true, enterFokus: "chat-input", wImFeld: false, gesendet: true, nachSenden: "BODY", wNachSenden: true, nachEsc: "BODY", enterAufKnopf: "knopf" }, [["Enter öffnet nichts", { enterFokus: "BODY" }, "Enter öffnet das Gespräch"], ["Fokus bleibt im Feld", { nachSenden: "chat-input", wNachSenden: false }, "nach dem Senden bleibt"], ["Esc hält das Feld", { nachEsc: "chat-input" }, "Esc gibt die Welt"], ["Enter stiehlt dem Knopf den Fokus", { enterAufKnopf: "chat-input" }, "Enter auf einem fokussierten"]]],
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
                    ["Wagendach", { wege: { fuss: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 0 }, ritt: { proben: 2400, pflanzeHaelt: 641, armIst: 2.0, armSoll: 9.6, taeter: ["Stamm (Natur-Blocker am Kamera-Strahl)"], spruenge: 137, spruengeSoll: 0, spruengePflanze: 137, hinausSprung: 60, sprungM: 2 } } }, "ritt: eine Pflanze hält"],
                    ["2-m-Minimum zu Fuß", { wege: { fuss: { proben: 400, pflanzeHaelt: 172, armIst: 2.0, armSoll: 4.1, taeter: ["Stamm (Natur-Blocker am Kamera-Strahl)"], spruenge: 5, spruengeSoll: 0, spruengePflanze: 5, hinausSprung: 2, sprungM: 1 }, ritt: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 0 } } }, "fuss: eine Pflanze hält"],
                    ["Sprung hinaus", { wege: { fuss: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 3, sprungM: 1 }, ritt: { proben: 300, pflanzeHaelt: 0, spruengePflanze: 0, hinausSprung: 0 } } }, "fuss: die Kamera springt"],
                    ["Nadelwand ohne Durchsicht", { stoffeOhne: 6, stoffeOhneArten: ["foliageTex", "bark"] }, "6 von 6 Pflanzen-Stoffen"],
                    ["Durchsicht im Schatten", { schattenGeschnitten: 2 }, "2 Pflanzen-Stoff(e) schneiden die"],
                    ["Ziel ohne Brust", { zielFolgt: false, zielAbstand: 3.2 }, "das Ziel der Durchsicht"],
                    ["Fadenkreuz auf dem Kopf", { kreuzAbstand: 0.02 }, "das Fadenkreuz steht in"],
                    ["das Ziel ist die Brust, nicht der Blickpunkt", { fadenkreuz: { stellungen: 96, hinten: {}, kreatur: true, zielAchse: 0.597 } }, "Fadenkreuz-Strahl: das Ziel der"],
                    ["Fadenkreuz trifft hinten", { fadenkreuz: { stellungen: 96, hinten: { _pickArchitectureAtCrosshair: 76, _raycastWorldHit: 67 }, kreatur: true, zielAchse: 0 } }, "Fadenkreuz-Strahl: `_pickArchitectureAtCrosshair` trifft in"],
                    ["Kreatur fehlt", { fadenkreuz: { stellungen: 96, hinten: {}, kreatur: false, zielAchse: 0 } }, "Fadenkreuz-Strahl: keine Kreatur"],
                    ["Lupe ohne den EINEN Strahl", { konsum: { _hasMagnifyingInSight: false } }, "Konsum: `_hasMagnifyingInSight`"],
                    ["Loch im Stamm im 1st", { durchsicht: { formel: true, first: { anlaeufe: 8, faellt: 8, abstand: [0.12, 0.82], wMin: 0 }, third: { anlaeufe: 4, faellt: 0, abstand: [4], wMin: 1 }, zwischen: { stellungen: 40, wirkt: 40, wMax: 0 } } }, "Durchsicht 1st am Stamm:"],
                    ["Loch im Stamm vor dem Spieler", { durchsicht: { formel: true, first: { anlaeufe: 8, faellt: 0, abstand: [0.3], wMin: 1 }, third: { anlaeufe: 4, faellt: 4, abstand: [3.8], wMin: 0 }, zwischen: { stellungen: 40, wirkt: 40, wMax: 0 } } }, "Durchsicht 3rd, der Stamm VOR"],
                    ["Durchsicht wirkt nicht", { durchsicht: { formel: true, first: { anlaeufe: 8, faellt: 0, abstand: [0.3], wMin: 1 }, third: { anlaeufe: 4, faellt: 0, abstand: [3.8], wMin: 1 }, zwischen: { stellungen: 40, wirkt: 0, wMax: 1 } } }, "Durchsicht 3rd: der Stamm"],
                    ["keine EINE Formel", { durchsicht: { formel: false } }, "Durchsicht: keine EINE Formel"],
                ],
            ],
            ["LH", huelleVerdict, { h: [0, 0, 0, 3, 0], r: [false, true, true, true], k: { x: [0, 9] }, krone: { je: { x: [9, 9, 0, 3] }, mutant: { x: [12, 9, 3, 3] }, chunk: [0, 5], ausser: 6 } }, [["vor dem Bild", { h: [1, 0, 0, 3, 0] }, "die Hülle wuchs vor"], ["ohne Leib", { h: [0, 3, 3, 3, 0] }, "die Hülle wuchs ohne"], ["fern", { h: [0, 0, 3, 3, 0] }, "die Hülle wuchs fern"], ["Ring", { r: [true, true, false, true] }, "der Ring baut außer"], ["wartet nie", { k: { x: [3, 9] } }, "x baut 3"], ["blind", { k: { x: [0, 0] } }, "x baut nichts"], ["ohne", { k: null }, "die Kacheln um"], ["Krone doppelt", { krone: { je: { x: [12, 9, 0, 3] }, mutant: { x: [12, 9, 3, 3] }, chunk: [0, 5], ausser: 6 } }, "x baut 12 Kacheln für 9"], ["unter der Krone", { krone: { je: { x: [9, 9, 3, 3] }, mutant: { x: [12, 9, 3, 3] }, chunk: [0, 5], ausser: 6 } }, "x baut 3 Kacheln unter einer Krone"], ["wartet weiter", { krone: { je: { x: [9, 9, 0, 2] }, mutant: { x: [12, 9, 3, 3] }, chunk: [0, 5], ausser: 6 } }, "x: unter der gelandeten Krone stehen 2"], ["Krone blind", { krone: { je: { x: [9, 9, 0, 0] }, mutant: { x: [12, 9, 0, 0] }, chunk: [0, 5], ausser: 6 } }, "die Krone vor der Kachel: unter der Krone wuchs nichts"], ["Täter unsichtbar", { krone: { je: { x: [9, 9, 0, 3] }, mutant: { x: [9, 9, 0, 3] }, chunk: [0, 5], ausser: 6 } }, "die Krone vor der Kachel: ohne die Frage baut nichts doppelt"], ["Chunk offen", { krone: { je: { x: [9, 9, 0, 3] }, mutant: { x: [12, 9, 3, 3] }, chunk: [4, 5], ausser: 6 } }, "im Chunk mit offener Pflanzung wachsen 4"], ["Chunk nie", { krone: { je: { x: [9, 9, 0, 3] }, mutant: { x: [12, 9, 3, 3] }, chunk: [0, 0], ausser: 6 } }, "im gepflanzten Chunk wächst keine"], ["wartet außerhalb des Takts", { krone: { je: { x: [9, 9, 0, 3] }, mutant: { x: [12, 9, 3, 3] }, chunk: [0, 5], ausser: 0 } }, "außerhalb des Takts wartet die Kachel"], ["ohne Krone-Probe", { krone: null }, "die Krone vor der Kachel: keine Probe"]]], // prettier-ignore
            ["D8", kanalVerdict, { gestartet: true, siedlungImLog: true, zeilen: ["> dorf 7", "(Welt verändert: 1× Birke)"] }, [["Siedlungs-Zahlen im Chat", { zeilen: ["Seed 7"] }, "Telemetrie im Chat"], ["rohes Programm", { zeilen: ['["spawn_studio",'] }, "Telemetrie im Chat"], ["interne id", { zeilen: ["baum_birke"] }, "interne id im Chat"], ["Ereignis-Name", { zeilen: ["op_exception"] }, "Telemetrie im Chat"]]],
            [
                "D6",
                kiVerdict,
                { gestartet: true, status: "läuft nicht", ohneSchluessel: "Schlüssel", ursprung: "http://a", proxyUrl: "http://a/llm", proxyFehler: "Proxy fehlt" },
                [
                    ["Aktiv ohne Dienst", { status: "Aktiv" }, "der Status sagt"],
                    ["Schweigen ohne Schlüssel", { ohneSchluessel: null }, "ohne Schlüssel schweigt der"],
                    ["Proxy fest auf 4312", { proxyUrl: "http://b/llm", proxyFehler: "nicht erreichbar" }, "der Proxy fragt einen"],
                ],
            ],
            [
                "D9",
                dorfVerdict,
                { gestartet: true, buch: true, haeuser: 20, hinten: 0, cosHinten: [], ausserBild: 0, gesperrtSteht: false, gesperrtLaut: true, mpAbweichung: 0, mpHaeuser: [20, 20] },
                [
                    ["umringt", { haeuser: 13, hinten: 7, cosHinten: ["-0.61", "-0.86", "-0.70"] }, "7 Häuser hinter dem"],
                    ["gesperrter Slot steht", { gesperrtSteht: true, gesperrtAbstand: 21.3, gesperrtImBau: true }, "ein gesperrter Slot steht"],
                    ["gesperrter Slot fällt still", { gesperrtLaut: false, gesperrtGrund: "der Slot fiel am fehlenden Boden" }, "ein gesperrter Slot fällt"],
                    ["am Bildrand vorbei", { ausserBild: 3 }, "3 Häuser außerhalb des"],
                    ["Mitspieler 60 m daneben", { mpAbweichung: 61.4, mpHaeuser: [20, 20] }, "beim Mitspieler steht das"],
                ],
            ],
        ];
        bruchFaelle(check, faelle);
        const gruen = wand();
        check("Selbst-Test W: der Arbeitsbaum ist grün", gruen.every((w) => w[1]), gruen.filter((w) => !w[1]).map((w) => w[0]).join(" | "));
        const kopfMit = (n, rein) => [null, new RegExp(`(\\n {4}${n}\\([^)]*\\) \\{)`), `$1 ${rein};`];
        const vorStand = (t) => stammLib.ersetze(t, [
            kopfMit("_chatHandleConversationalFallback", `"'Setze Wetter rainy'"`),
            ["maybeAnswerWithLlm", "tat: this.describeProgram(reply.program)", "tat: JSON.stringify(reply.program)"],
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

    // Der statische Ladeschirm (vor dem Spiel): sichtbar, über allem — gelesen im Ereignis DOMContentLoaded, nie danach (ein
    // schneller Boot ließ ihn weichen, ehe das Protokoll fragte); L2a trägt den Befund
    const lade = () =>
        document.addEventListener("DOMContentLoaded", () => {
            const l = document.getElementById("ladeschirm");
            window.__ladeHtml = l ? { imHtml: true, htmlVersteckt: !!l.hidden, zIndex: +getComputedStyle(l).zIndex || 0 } : { imHtml: false };
        });
    const { browser, page } = await nullWelt(server, { port: PORT, frist: 600000, fenster: { width: 1280, height: 720 }, vor: lade }, 30000); // prettier-ignore
    // Der KI-Endpunkt der D6-Probe: ein Port, auf dem nichts lauscht.
    const out = await page.evaluate(probe, { kiPort: PORT + 3 });
    if (out.lade) Object.assign(out.lade, { anfragen: Object.fromEntries(anfragen), seite: seiteLaedt() });
    await browser.close();
    server.close();

    const zeige = (...a) => probeUrteil(check, ...a);
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
            ((q) => (q && q.probestumm && q.probelebt ? ` · Quittung der Geburt: die Mutante (ack verschluckt) ${q.probestumm.bruch > 0 ? "GEFANGEN beim Namen" : "FREI"}, der lebende Faden quittiert nach ${q.probelebt.quittiert} ms` : ""))(m.quittung) + // prettier-ignore
            ((a) => (a ? ` · Anfragen je Boot (die Seite + die EINE Quelle): ${Object.entries(a).filter(([p]) => /voxel-worker|phyto-core|gelaende-core|fachwerk-core|foundry-|cores\.manifest|three\.(module|core)|klang-core/.test(p)).map(([p, n]) => p.slice(1) + " " + n).join(", ")}` : ""))(m.anfragen) + // prettier-ignore
            ((w) => (w && !w.err ? ` · Wiederkehr der Tiere: vor dem Bild ${w.vor} Wesen, ${w.gussVor} Güsse · im Stand des Fensters ${w.stand && w.stand[0]} von 2 · Vorrat des Stands kalt ${w.ms} ms · die Welt nennt offen ${w.offen ? w.offen.join(" → ") : "?"} Wesen (ohne das Feld offen: ${w.offenOhne && w.offenOhne.length ? w.offenOhne.join(", ") : "nichts — die Welt stünde"}) · solange Programme fehlen ${w.ungezeichnet} Wesen in der Welt (${w.gaeste && w.gaeste[0]} Gast) · erster Zug ${w.zuerst && w.zuerst[0]} Wesen${w.zuerst && w.zuerst[1] ? " (das nächste)" : ""}, Stand dazwischen ${w.standHalb && w.standHalb[0]} von 2 · am Ende ${w.nach} Wesen, ${w.gussNach} Güsse · Mutanten: Sofort-Wiederkehr ${w.mutant > 0 ? "GEFANGEN (" + w.mutant + " Wesen vor dem Bild)" : "FREI"}, ohne Vorbau ${w.mutantVorbau > 0 ? "GEFANGEN (" + w.mutantVorbau + " Wesen ungezeichnet)" : "FREI"}` : ""))(m.wiederkehr) + // prettier-ignore
            ((g) => (g && !g.err ? ` · Geburten der frischen Welt: offen ${g.offen ? g.offen.join(" → ") : "?"} Köpfe (ohne Vorrat ${g.wartet}), ohne Bestellung ${g.ohne ? g.ohne.join(" · ") : "?"}` : ""))(m.geburt) +
            (m.baumD != null ? ` · Baum ${m.baumD} m` : "") +
            (m.rundblick ? ` · Rundblick ${m.rundblick.loecher} Löcher in ${m.rundblick.N} Takten, rundum ganz ab Takt ${m.rundblick.rundumAb}, Schlange ${m.rundblick.spaet}` : "") +
            (m.rang ? ` · Pumpe vor dem Bild „${m.rang.vorBild}", danach „${m.rang.nachBild}"` : "") +
            (m.wald ? ` · Wald-Zusage ${m.wald.kam ? `kam, ${m.wald.rest} von ${m.wald.ferne} fernen Zellen offen` : "kam nicht"}` : "") +
            (m.blick ? ` · Bild ${m.blick.geweckt}/${m.blick.vor2} · Takt ${m.takt.lief}` : "") +
            ((K) => (K?.leib ? ` · Köpfe (B5): Bild-Rang ${K.orte.filter((o) => o.blick).length}/${K.orte.length} im Blick, Leib bestellt ${K.leib.bestellt.join(" · ")}, baut ${(K.leib.baut || []).join(" · ")}, Dorf-Export mit dem Buch ${!!K.dorf.export}` : ""))(m.koepfe) +
            (m.tastenHinter ? ` · hinter dem Ladeschirm: W ${m.tastenHinter.w ? "läuft" : "ruht"}, Enter → ${m.tastenHinter.enter}, Strg+K → Omnibox ${m.tastenHinter.omnibox ? "offen" : "zu"}` : "")
    );
    zeige("LH", "was das Bild nicht liest, hält es nicht: die Hülle am Leib, der Ring außer Bild im Leerlauf", out.huelle, huelleVerdict, (m) => `Hülle ${m.h} · Ring [hinten ohne Leerlauf, vorn, Ruf, hinten mit] ${m.r} · Kacheln ${JSON.stringify(m.k)} · Krone vor der Kachel [gebaut, stehend, unter der kommenden, unter der gelandeten] ${JSON.stringify(m.krone && m.krone.je)} · Mutante ${JSON.stringify(m.krone && m.krone.mutant)} · Chunk [offen, gepflanzt] ${JSON.stringify(m.krone && m.krone.chunk)} · außerhalb des Takts unter der kommenden Krone gebaut ${m.krone && m.krone.ausser}`); // prettier-ignore
    zeige("L1", "das Fadenkreuz steht in der Bildmitte und weicht der Schublade", out.kreuz, kreuzVerdict, (m) => `da ${m.da} · Mitte ${m.dx}/${m.dy} px · mit Werkstatt ${m.mitSchublade} · danach ${m.nachSchublade}`);
    zeige("L2b", "„hilfe\" nennt die EINEN Tafeln und die Tasten", out.hilfe, hilfeVerdict, (m) => Object.entries(m.antworten || {}).map(([w, z]) => `„${w}": ${z.unbekannt ? "unbekannt" : `${(z.fehlt || []).length} fehlen`}`).join(" · "));
    zeige("L3", "Enter öffnet das Gespräch, Enter sendet und gibt die Welt zurück, Enter auf einem Knopf gehört dem Knopf", out.gespraech, gespraechVerdict, (m) => `Enter → ${m.enterFokus} · gesendet ${m.gesendet} · danach ${m.nachSenden} · W ${m.wNachSenden} · Esc → ${m.nachEsc} · Enter auf dem Knopf → ${m.enterAufKnopf}`);
    zeige("L7", "der Start-Gurt liest den Katalog (je Studio-Art ein Werk)", out.gurt, gurtVerdict, (m) => `${(m.hotbar || []).filter(Boolean).join(" · ")} (Arten im Katalog: ${(m.katalogArten || []).join(", ")})`);
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

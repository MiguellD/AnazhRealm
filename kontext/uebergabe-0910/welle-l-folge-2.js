export const meta = {
  name: "welle-l-folge-2",
  description: "Welle L Folge Teil 2 auf main V18.536: rudel (Nachbesserung Runde 1 + Merge main, Zwillinge vereinen), dann kampf auf dem rudel-Kopf - je Gegenpruefung",
  phases: [ { title: "Leben", detail: "rudel, dann kampf" } ],
}

const R = 'C:\\Users\\micha\\AnazhRealm-profiband'
const WT = R + '\\.claude\\worktrees\\vigorous-nash-lf-'
const LS = R + '\\artifacts\\profiband\\leben-schau\\'
const LB = R + '\\artifacts\\profiband\\leben\\'
let BASIS = '76c9624d4957710e39fb0c8e671e885447f2cc4e'
const VOR = 'Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.\n'

const REGELN = `${VOR}WELLE L FOLGE — die Defekte, die die SICHTBARE Leben-Schau am 07.10. auf dem Welle-L-Stand fand (der Schöpfer will sie fühlbar im Spiel, nicht im Testrahmen). Sie trägt die v1.0-Ziellinie (docs/roadmap.md §0.v1: ankommen · laufen+sehen · Werkstatt bauen · mit der KI erschaffen · teilen) — kein neuer Scope, keine neue Doktrin.
DEIN ORT: lege SELBST an: \`git -C ${R} worktree add -b welle-lf-__KEY__ ${WT}__KEY__ __BASIS__\` (Basis __BASIS__; existiert er schon: sichte git status/log und baue weiter), dort \`npm ci\`. AUSSCHLIESSLICH dort arbeiten; alle anderen Worktrees nur lesen.
PORTS: __PORTS__ (save-server \`PORT=<erster>\`, werkbank \`--port <zweiter>\` und \`--seite http://localhost:<erster>\`, jeder werkbank-Befehl mit \`--port\`; Gates über ihre Port-Env-Variable aus dem Rest). Verboten: 3000/4312/4489/4490/4542 und jeder fremde Bereich (7600–7909, 7950–7969, der Bereich der anderen Familie). Nur eigene Prozesse beenden.
GPU-SCHLOSS: jeder echte Renderer (werkbank --echt, sichtbares Chrome) nur mit dem Schloss: atomar \`mkdir C:\\Users\\micha\\AppData\\Local\\Temp\\claude\\gpu-schloss\` (darin eine Datei mit deinem Namen); scheitert es → headless weiterarbeiten und später erneut, nie im Leerlauf warten; nach dem Lauf sofort entfernen. Eigene Zwischendateien NUR unter C:\\Users\\micha\\AppData\\Local\\Temp\\claude\\lf-__KEY__\\.
SICHTBAR BEWEISEN: jeder Schnitt, den der Spieler fühlt, bekommt ein Bild-Paar vorher/nachher am echten Renderer (Ausgabe-Pfad scripts/lib/ausgabe-aufnahme.cjs, gleiche Kamera, gleiche Schritte wie die Leben-Schau) — schau jedes Bild SELBST an. Headless beweist nur Mechanik.
JE KLASSE: Linse zuerst (vorher ROT mit Täter beim Namen), Schnitt an der EINEN Engstelle (kein Zwilling, kein Flag, kein fail-soft — eine stille Absage IST der Bruch), Wand in die CI (headless, wo sie trägt) mit Selbsttest, Zahl im Commit.
PRÜF-PROPORTION: je Commit node --check, \`npx eslint anazhRealm.js\` 0 Fehler, prettier --check, die Gates der berührten Methoden, playtest:fast; am Ende EINMAL \`npm run check\` und der volle playtest (Wegwerf-Kopie mit deinem Port); Push \`git push origin welle-lf-__KEY__\`, die CI ist der Richter der ganzen Batterie (C:/Users/micha/AnazhRealm-profiband/artifacts/profiband/ci-warte.sh <voller SHA>). Kein Gate doppelt ohne benannten Grund.
BEKANNT, NICHT HIER SCHNEIDEN: das Weltbild-Einfrieren nach dem Werkstatt-Schritt (ein eigener Agent heilt es; triffst du es, lade neu und nenne es) · das Impuls-Gesetz (Fahrzeug-Stoß + Kampf-Rückstoß K-D9, baut der OMEN auf welle-m-fahren) · Wasser am Körper/Schwimmer (kommt mit dem wasser-Merge).
HANDWERK: Kerne nie prettier --write, Studio-Code nur unter Byte-Beweis (Re-Mint = begründeter Vertrags-Akt im Commit). Worker-Spiegel bit-identisch. Welt-Substanz aus Γ5-Seed-Streams, nie Math.random. NIE git stash. Regex/Escape nur mit dem Edit-Werkzeug. Commits deutsch, emoji-frei, keine Siegel-Wörter (fertig/RUND/vollendet/vollzogen/Schluss/SCOPE ZU, auch als Wortteil), Message = Befund + Schnitt + Zahl + offen, letzte Zeile \`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\`. Lege KEINE Aufgaben-Chips (spawn_task) an — was offen bleibt, gehört in deine Rückgabe. Beende vor der Rückgabe alle eigenen Prozesse und gib das Schloss zurück.`

const FAM = [
  { key: 'v1-ankunft', gruppe: 1, ports: '7910–7919', befund: 'befund-v1-pfad.md', auftrag: `ANKOMMEN + LAUFEN/SEHEN (v1-Schritte 1–2). Lies ${LS}befund-v1-pfad.md GANZ (und ${LB}befund-v1-pfad.md vom 06.10., ${LB}karte-v1-pfad.md). Deine Posten:
1. Ankunft in der Tannenkrone (V-D1): der Spawn prüft keine Bäume — die Ankunfts-Plattform/der Spawn-Ort ist frei von Krone/Stamm im Blick (EINE Frei-Prüfung, die Natur-Wand '_naturSetzen'/'_bauFrei' kennt die Lichtung schon — lies D3 in integ-l 79f25cbd). Bild b01 vorher.
2. Das erste Bild ist schwarz (L2) — der erste gezeigte Frame ist ein fertiges Weltbild (Ladeschirm bis dahin, nie Schwarz).
3. Fadenkreuz fehlt (L1); „hilfe" ist unbekannt (L2) — ein Hilfe-Text aus den EINEN Verb-/DSL-Quellen, nie eine zweite Liste; Chat ohne Taste (L3: Enter öffnet den Chat, W tippt nie ins Feld, solange es nicht fokussiert ist); Klebetaste bei Fokusverlust (D4: blur/visibilitychange lässt alle Tasten los).
4. Die Standard-Hotbar zeigt Alt-Baupläne (L7) — sie liest den heutigen Katalog (EINE Quelle).
5. Kamera im Laub (L-Kamera): die 3rd-Kamera weicht Kronen/Ästen (Kollisions-Strahl gegen die EINE Hülle), nie eine Nadelwand vor dem Spieler.
6. Entwickler-Telemetrie und interne ids im Spieler-Chat (V-D8) — Spieler-Text und Log sind getrennte Kanäle.
7. Der KI-Fehler nennt die falsche Ursache (V-D6: CORS statt fehlendem Schlüssel/Proxy) — die Meldung nennt die echte.
8. „Dorf vor dir" umringt den Spieler (13 Häuser, 12 von 25 Slots übersprungen, die drei nächsten HINTER ihm): das Dorf liegt im Blickkegel vorn, die Slot-Quelle sucht je Slot einen Ersatz-Ort statt zu überspringen (offen benannt in integ2/integration-l.md: Dorf-Größe am Hang).
Soll: ein neuer Spieler kommt an, sieht sofort die Welt mit Fadenkreuz, kann „hilfe" sagen, Enter öffnet den Chat, das Dorf steht vor ihm.` },
  { key: 'werkstatt', gruppe: 1, ports: '7920–7929', befund: 'befund-v1-pfad.md', auftrag: `IN DER WERKSTATT BAUEN + MIT DER KI ERSCHAFFEN (v1-Schritte 3–4). Lies ${LS}befund-v1-pfad.md GANZ (Werkstatt-Teil), dazu ${LB}befund-v1-pfad.md und ${LB}karte-v1-pfad.md. Deine Posten:
1. Die Werkstatt-Vorschau ist leer (V-D3, Bild b05: nur Gitter und Achsen, obwohl 29 Meshes mit 21 108 Dreiecken in der Szene sind): die LOD-/Dither-Maske misst vom WELT-Auge statt vom Auge der Vorschau-Kamera (Lehre 26: jede LOD-Maske misst vom Auge 'uLodAuge' — die Vorschau braucht IHR Auge je Render, ohne Zwilling).
2. Das Rezeptbuch urteilt nach dem alten Spielmodus (V-D5).
3. 0 von 3 Wegen führen zum stehenden Werk (L-Werkstatt) — FERTIGEN → Bau-Modus mit Phantom → Setzen muss in jedem Weg zum stehenden Werk führen; Rückmeldung bei jedem Schritt (L-Rückmeldung: kein Phantom, stumme Absagen).
4. „frieden" verweigert den Bau und sagt es nur dem Log („nicht genug Material", anazhRealm.js:76375, gegen den Kommentar :76369 „frieden + schöpfer baue…") — entscheide nach dem Gesetz des Modus, und jede Absage spricht der SPIELER-Kanal.
5. Die Start-Plattform ist ein Brennglas (affordances.focusing, 4 m, Schwelle 1 bei 0,05/s → 20 s Sonne): die Werkstatt-Eiche 2,4 m vor dem Spieler verbrannte still (Architekturen 125 → 124) — die Ankunfts-Plattform trägt kein Brennglas bzw. das Brennglas entzündet nie ein frisch gesetztes Werk des Spielers ohne sichtbare Ursache; jede Zerstörung nennt sich dem Spieler.
6. Wortschatz: „fachwerkhaus" ist unbekannt (L-Wortschatz) — der Wort-Katalog liest den EINEN Rezept-Katalog (Studio-Arten), nie eine Hand-Liste.
7. „am Wasser" ohne Wasser fällt STILL auf den Spieler zurück (D5, fail-soft) — sagt es dem Spieler oder sucht das nächste Wasser.
8. Math.random im Satz-Seed (D10) — der Seed kommt aus dem Γ5-Stream.
Soll: Satz → Rezept → Werk steht sichtbar vor dem Spieler, jede Absage ist hörbar, die Vorschau zeigt das Werk.` },
  { key: 'rudel', gruppe: 2, ports: '7940–7949', befund: 'befund-rudel-gelaende.md', auftrag: `RUDEL, HERDE, KREATUR-HIRN, GANG (Q3/Q4/Q11). Lies ${LS}befund-rudel-gelaende.md GANZ (Tabelle alt→jetzt und „Neue Defekte"), dazu ${LB}befund-rudel-gelaende.md und ${LB}karte-rudel-gelaende.md. Deine Posten:
1. Die Herde klebt im Modus frieden am Spieler: Radius 7,6 → 0,7 m, Paar-Abstand 0,66–0,96 m, die Leiber durchdringen sich (Bild ls-04) — persönlicher Raum je Leib (aus der Körper-Kugel, Gattung/Größe), Neugier hält Abstand, nie Durchdringung.
2. Temperament tot (D16, auch Kampf K-D12): Hirsch und Fuchs bleiben „wehrhaft", alle Hirsche Wariness −1,0 — Temperament aus der GATTUNGS-/Größen-Achse (Lehre 8: tag-neutral), Fluchttier flieht, Jäger jagt; der Kampf liest dasselbe Temperament.
3. Der Witterungs-Jäger steht still: Wolf 1200 Frames „jagd", 0,3 m bewegt, 0 Jagd-Bisse in 3600 Frames (anazhRealm.js:21494, '_creatureScentHuntDir') — der Kreislauf Jäger-Beute schließt sich; der Wolf holt einen Sprinter nie ein (Jagd-Tempo aus dem Gang-Gesetz: Sprint der Gattung).
4. Rudel gegen Spieler: größte Winkel-Lücke 239°, keine Flanke — ein Rudel umstellt.
5. Bein-Lot am Querhang 20–31° (Soll ≤ 10°, Bild ls-10): die Beine stehen lotrecht, der Leib rollt; Stand-Schlupf 0,56–1,27 (Soll ≤ 0,2).
6. Fern-Gang gleitet: 5 wandernde Hirsche bei 65 m 3000/3000 Frames eingefroren, 2919 gleitend (103,5 m) — fern läuft der Gang mit (billig: Glieder-Kapseln, Phase aus dem Weg).
7. Tiere durch Häuser: 7,6 % der Frames in einer Hüllen-Box, p50 73 cm tief (D7, Q5: EINE Hülle je Körper) — Tier gegen Bau-Hülle wie der Spieler.
8. DER NEXUS WÜRFELT KÖRPER-GESETZE (schwer): anazhRealm.js:3290–3293 ('player_jump_power' 8–20, 'player_speed' 4–12, 'creatures_speed_mul', 'creatures_size_mul'), Ausführung :2751–2763, Takt :23233 — Spieler lief 11,1 m/s, Sprint 45 m/s, Sprungkraft bis 18,6 statt 2,6; 16/16 Tiere ×1,11 bodySize ohne Achse; 'spawn_creature at_player' lebt. Körper-Gesetze sind Gesetz: kein Würfel schreibt Gang/Sprung/Größe; ein Nexus-Effekt darf nur innerhalb der Gesetz-Bänder modulieren (sichtbar, benannt), eine Größe nur über die bodySize-Achse; Geburt nie im Blick (D13 gilt auch für den Nexus-Weg).
Soll: die Herde lebt ihre Art, der Wolf jagt und erreicht, nichts durchdringt, kein Würfel bricht ein Körper-Gesetz.` },
  { key: 'kampf', gruppe: 3, ports: '7930–7939', befund: 'befund-kampf.md', auftrag: `KAMPF (Q8/Q10/Q11 Leser). Lies ${LS}befund-kampf.md GANZ, dazu ${LB}befund-kampf.md und ${LB}karte-kampf.md. NICHT hier: der Rückstoß K-D9 (das Impuls-Gesetz baut der OMEN), das Temperament (Familie rudel — lies es, schneide es nicht doppelt). Deine Posten:
1. Die Treffer-Energie hängt an der ERSTEN Kontaktstelle der Klinge: Großschwert in der Ich-Sicht auf einen Hirsch in 1,6 m → Kontakt bei s 0,25 (Hebel 0,81 m), 15–18 J, 1,8–2,6 von 124 HP (~60 Hiebe), schwächer als der Dolch; derselbe Hieb macht je nach Kontakt 2 oder 25 HP — die Energie folgt dem Gesetz des Schwungs über den Treffer-Weg (EIN Treffer-Urteil im schmiede-Kern), nie dem Zufall der ersten Kontaktstelle; Streuung benannt und begrenzt.
2. Die Hieb-Pose ist nicht das Treffer-Volumen (K-D10, Bild ks02: Klinge über dem Kopf im Treffer-Frame) und die Ich-Sicht zeigt Waffe/Schwung nicht (K-L4, Bild ks01) — Pose, Treffer-Volumen und Ich-Sicht lesen DENSELBEN Schwung.
3. Hieb ins Leere am Hang: das Verb-Tor wählt „hieb" bis 6 m ab Schulter, die Klingen-Kugel reicht 2,46 m (anazhRealm.js:77886 gegen 76941, zwei Reichweiten-Zahlen; K-D3 Treffer-Säule hangab) — EINE Reichweite aus der Waffe.
4. Pfeil (K-D8): ungeschatteter brauner Zylinder ohne Spitze/Federn (Bild ks08) — die Gestalt aus dem schmiede-Kern; Energie zählt.
5. Biss ohne Geste (K-D13, Geste nur 3 von 12) und ab 2,4 m XZ — der Biss trifft, wo die Geste schnappt.
6. Kreatur-Kampf-Stats gattungs- und größenblind (K-D18) — aus Gattung × bodySize.
7. Tod kippt in Hang-Richtung ohne Leibes-Achse (anazhRealm.js:19052; Bild ks09: Hirsch steht auf dem Hinterteil) und der Körper verschwindet (K-D19) — er fällt auf die Flanke und bleibt liegen.
8. Ausdauer je Hieb flach (K-L2) — aus der Waffen-Masse.
Soll: ein Hieb fühlt sich nach Waffe an, die Klinge trifft, wo man sie sieht, ein Tier stirbt wie ein Tier.` },
]

const ERG = {
  type: 'object',
  properties: {
    branch: { type: 'string' },
    kopf: { type: 'string' },
    commits: { type: 'array', items: { type: 'object', properties: { sha: { type: 'string' }, titel: { type: 'string' } }, required: ['sha', 'titel'] } },
    posten: { type: 'array', items: { type: 'object', properties: { posten: { type: 'string' }, stand: { type: 'string', enum: ['geschnitten', 'teilweise', 'offen'] }, zahl: { type: 'string' }, bild: { type: 'string' } }, required: ['posten', 'stand', 'zahl'] } },
    gates: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, exit: { type: 'string' } }, required: ['name', 'exit'] } },
    ci: { type: 'string' },
    konflikte: { type: 'string' },
    offen: { type: 'array', items: { type: 'string' } },
  },
  required: ['branch', 'kopf', 'commits', 'posten', 'gates', 'ci', 'konflikte', 'offen'],
}

const regeln = (f) => REGELN.split('__KEY__').join(f.key).split('__PORTS__').join(f.ports).split('__BASIS__').join(f.basis || BASIS)
const pruefe = (f, r, runde) => agent(`${VOR}Du bist der GEGENPRÜFER (Runde ${runde}) der Welle-L-Folge, Familie „${f.key}" (Worktree ${WT}${f.key}, Branch welle-lf-${f.key}, Basis ${f.basis || BASIS}). Ergebnis: ${JSON.stringify(r).slice(0, 9000)}
Auftrag der Familie: ${f.auftrag}
Prüfe NUR LESEND (git log/diff seit der Basis, Bilder per Read; Selbsttests headless mit Ports aus ${f.ports}; kein Commit). Proportional (Gebot 9) — prüfe die geänderten Stellen, nicht die ganze Welt:
(a) BILD/SPIEL-KORREKTHEIT: kann ein Schnitt eine echte Änderung verschlucken oder ein neues Fehlbild erzeugen (Invalidierung, Modus-Wechsel, Reload, Fenster, Mehrspieler)? Datei:Zeile. (b) EINE Engstelle, kein Zwilling, kein Flag, keine stille Absage? (c) Linsen vorher ROT mit Täter, nachher grün, in der CI? (d) Zahlen nachrechenbar, Bild-Paare echt (selbst ansehen)? (e) Posten ehrlich (teilweise/offen benannt, nichts still gestrichen)? (f) Siegel-Wörter, Regex, YAML, CI-Lauf. (g) Konflikte mit integ-l-Folgearbeit, welle-m-fahren (OMEN) und den anderen Familien.
Lege KEINE Chips an. Urteil am Ende: „merge-reif: ja" oder „merge-reif: nein — <rote Punkte mit Datei:Zeile>".`, { label: `pruef${runde}:${f.key}`, phase: f.gruppe === 1 ? 'v1-Pfad' : 'Leben', agentType: 'champion' })

const PR1 = 'C:\\Users\\micha\\AnazhRealm-profiband\\artifacts\\profiband\\integ2\\LF-pruef1-rudel.md'
const MAIN = '76c9624d4957710e39fb0c8e671e885447f2cc4e'
const MERGE_MAIN = `MERGE ZUERST: dein Zweig steht auf integ-l 79f25cbd; main ist jetzt V18.536 ${MAIN} (Welle K + L ganz, host-vram, wasser, Frost, impuls mit STOSS-Gesetz + _leibKontakte + _leibMasse + MASSSTAB.dichteKgM3, werkstatt, v1-ankunft, nexus mit _blockerNetz). Hole ihn mit git fetch origin und merge ihn per git merge --no-ff ${MAIN} in deinen Zweig, Konflikte nach Semantik; danach EINE Quelle je Domäne, keine Zwillinge.`

const familie = async (f, ersterAuftrag) => {
  const ph = 'Leben'
  let r = await agent(regeln(f) + '\n\n' + ersterAuftrag + '\nRÜCKGABE: die Form (posten = jeder nummerierte Posten mit Stand, Zahl, Bildpfad; kopf = voller SHA).', { label: (f.fortsetzung ? 'LF-fix1:' : 'LF:') + f.key, phase: ph, schema: ERG, agentType: 'champion' })
  if (!r) return { key: f.key, ergebnis: null }
  let p = await pruefe(f, r, f.fortsetzung ? 2 : 1)
  for (let runde = f.fortsetzung ? 3 : 2; runde <= 4 && p && !/merge-reif:\s*ja/i.test(p); runde++) {
    const n = await agent(regeln(f) + `\n\nNACHBESSERUNG der Familie „${f.key}" (dein Worktree und Branch bestehen — sichte git status/log zuerst). Auftrag bleibt: ${f.auftrag}\nDie Gegenprüfung fand ROT:\n${String(p).slice(-7000)}\nSchneide jeden roten Punkt GANZ an der Wurzel (Linse zuerst, Engstelle, Zahl im Commit), fahre die berührten Gates, push, lies die CI.\nRÜCKGABE: die Form.`, { label: `LF-fix${runde - 1}:${f.key}`, phase: ph, schema: ERG, agentType: 'champion' })
    if (n) r = n
    p = await pruefe(f, r, runde)
  }
  log(`Familie ${f.key}: ${p && /merge-reif:\s*ja/i.test(p) ? 'merge-reif' : 'NICHT merge-reif'} (Kopf ${r.kopf})`)
  return { key: f.key, ergebnis: r, pruefung: p }
}

phase('Leben')
const rudelF = { ...FAM.find((x) => x.key === 'rudel'), fortsetzung: true, basis: '79f25cbd (plus Merge von main ' + MAIN + ' in dieser Runde)' }
const rRudel = await familie(rudelF, `NACHBESSERUNG RUNDE 1 der Familie „rudel" (Fortsetzung — dein Worktree und Branch bestehen, Kopf 1c6da65d; sichte git status/log zuerst; ein voriger Lauf wurde angehalten, prüfe jeden Teil-Stand). ${MERGE_MAIN}
Die Gegenprüfung Runde 1 (ganzer Text: ${PR1} — lies ihn GANZ) fand ROT: (1) Leib-Löser-Zwilling: dein _kreaturLeibKontakte (anazhRealm.js:20755/:22571) gegen main _leibKontakte (main :20672/:92650) — der Merge übernimmt beide Aufrufe ohne Konflikt; EIN Leib-Löser bleibt (der von main trägt das STOSS-Gesetz; deine Abstands-/Raum-Regeln gehen in IHN), und der Beweis für Posten 1 muss am verbliebenen Löser neu fallen. (2) Masse-Zwilling: dein _kreaturMasse (:20440) + tetrapoda-core.js:150/180/1435 (Dial × Größe) gegen main _leibMasse (:20548) und MASSSTAB.dichteKgM3 (tetrapoda-core.js:1468) — EINE Masse (die von main), das Jäger/Beute-Urteil darauf.
Gelb mitnehmen: die Zahlen im Bericht nachrechnen (Rudel-Lücke 154° statt 129°, Kitz 5 statt 29, Hirsch 8 statt 7); Nachher-Bilder vom AKTUELLEN Kopf am selben Ort wie vorher; der Kommentar über _creatureTemperament (:19133–19135); v.herde.fensterRaum vor der v.herde-Prüfung (:94744 — Kern-Pflicht statt TypeError); hubForm ändert gangFuss (tetrapoda-core.js:1309/1337 — nicht „rein additiv": benennen bzw. Byte-Beweis); die Kosten des Kreatur-Takts (+37–60 % bei 39 Tieren) schneiden oder für den OMEN benennen.
DEIN AUFTRAG bleibt: ${rudelF.auftrag}`)
const out = [rRudel]
const reif = rRudel.ergebnis && rRudel.pruefung && /merge-reif:\s*ja/i.test(rRudel.pruefung)
if (reif) {
  const m = String(rRudel.ergebnis.kopf || '').match(/[0-9a-f]{40}/)
  const kampfF = { ...FAM.find((x) => x.key === 'kampf'), basis: m ? m[0] : MAIN }
  out.push(await familie(kampfF, `DEIN AUFTRAG — ${kampfF.auftrag}
NEU SEIT DEM AUFTRAG: deine Basis ${kampfF.basis} trägt main V18.536 UND die Familie rudel — das STOSS-Gesetz (Treffer-Rückstoß über opts.stoss, Masse aus _leibMasse/MASSSTAB; den Rückstoß K-D9 hat der OMEN geschnitten — NICHT nochmal) und das Temperament der Gattung (rudel) sind da: lies sie, schneide sie nicht doppelt.`))
} else log('kampf startet NICHT: rudel ist nicht merge-reif')
return out

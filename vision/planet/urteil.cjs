'use strict';
// Das Urteil des Gesetzes (gesetz.md §6) über jede Größe des Zensus (zensus.json, geschrieben von zaehle.cjs).
// Jede Zeile bekommt GENAU EIN Urteil:
//   FOLGT  (Stufe)  der Wert folgt aus einer Stufe des Gesetzes; in der Heimat als Q_Heimat + Δ(u − anker), am Anker byte-gleich
//   FÄLLT  (Grund)  der Setzer verschwindet; seine Leser lesen die kanonische Quelle, die der Grund nennt
//   SAME            ein Datum, das der Same wählt (die Physik-Daten §2 oder die Gestalt, die planetPlan zieht)
//   GESETZ          eine Konstante des Gesetzes selbst, mit Quelle (Literatur oder ein bindender Entscheid)
//   BLEIBT          bleibt von Hand gesetzt — der ehrliche Rest, mit Grund; das Gesetz leitet ihn nicht ab
//   BAND            unter dem Band: die Heimat formt alles unter 32 km und unter der Saison (gesetz.md §5); gespeist vom Planeten
//   TECHNIK         Gitter, Proben, Schranke, Darstellung, Zeitraffer — kein Maß der Welt
// Die Klassen-Tafel KLASSE gibt je Klasse (groesse) die Stufe und das Urteil der Heimat-Seite; ID nennt jede Ausnahme mit Grund.
// Eine Klasse ohne Eintrag bricht beim Namen. Aufruf: node urteil.cjs → urteil.out.txt, urteil.json, urteil-tafel.md
const fs = require('fs'), path = require('path');
const Z = JSON.parse(fs.readFileSync(path.join(__dirname, 'zensus.json'), 'utf8')).zeilen.filter(r => !r.doppelVon);

const STUFE = {
  S0: 'S0 Körper', S1: 'S1 Platten', S2: 'S2 Relief', S3: 'S3 Meer', S4: 'S4 Klima', S5: 'S5 Wasser', S6: 'S6 Gestein, Boden',
  S7: 'S7 Biom', TJ: 'Tag und Jahr', NAHT: '§5 Naht', BAND: 'unter dem Band', '—': 'keine Stufe',
};
// Wie weit jede Stufe bewiesen ist (spike.md): gespiked · Lehrbuch-Formel ohne Spike · nicht gespiked
const BEWEIS = { S0: 'Spike d', S1: 'Spike b, e', S2: 'Spike a, b, c', S3: 'Spike c', S4: 'Spike a, b, c, d', S5: 'Spike c6 (Prototyp)', S6: 'NICHT gespiked', S7: 'Spike a, c', TJ: 'Formel (Deklination, Stundenwinkel), nicht gespiked', NAHT: 'Spike f', BAND: '—', '—': '—' };

// Klasse → { s: Stufe, h: Urteil der Heimat-Seite, g: Grund }. Die Kern-Seite urteilt nach Regel (unten), nicht nach dieser Tafel.
const F = (s, g) => ({ s, h: 'FOLGT', g }), B = (s, g) => ({ s, h: 'BAND', g: g || 'Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz' });
const T = (g) => ({ s: '—', h: 'TECHNIK', g }), K = (s) => ({ s, h: null, g: '' });
const KLASSE = {
  abfluss_spende: F('S4', 'Turc-Pike-Abfluss am Ort; am Anker die Heimat-Spende, sonst × spendeVerh'),
  achsneigung: F('S0', 'neigungRad des Körpers'),
  aue: B('S5'), automat: B('S5', 'Zell-Automat des Wassers unter dem Band'), bahn: B('BAND', 'Bühnen-Term des Prüfplatzes'),
  basis_hoehe: F('NAHT', 'die Heimat-Höhe ist die gestauchte Planet-Höhe am Anker'),
  baum_art: B('S7', 'Arten-Nische unter dem Band; der Arten-Vorrat folgt S7'), baum_dichte: B('S7', 'Bestands-Muster unter dem Band; die Deckung folgt S7'),
  benetzung: B('S4'), biom: B('S7', 'Rausch-Stimmen unter dem Band (λ 160–520 m); das Biom darüber folgt S7'),
  bluete_praesenz: F('S4', 'Phänologie: liest T(Saison) statt der Phase des 2 400-s-Jahrs'),
  boden_art: F('S6', 'Boden aus Gestein × Klima × Hang'), boden_feuchte: B('S5'), boden_tiefe: F('S6', 'Strata aus der Gesteins-Art'),
  breite_ort: F('NAHT', 'die Breite der Heimat ist die Breite des Ankers'), cache: T('Speicher'), damm: B('S5'),
  drift_tempo: K('S1'), ebene: F('S2', 'Großform-Höhe aus S2'), edit: T('Spiel-Mechanik'), eis: B('S3', 'Eis-Physik am Ort'),
  erdbau: T('Spiel-Mechanik'), erosion: B('S2', 'Strom-Kraft-Gesetz des Tal-Netzes unter dem Band'),
  fern_wasser: T('Fern-Darstellung'), feuchte_boden: B('S5'), firn: B('S4'),
  fluss_breite: B('S5', 'Form unter dem Band, gespeist aus Q (S5)'), fluss_gefaelle: B('S5'), fluss_netz: B('S5', 'Netz-Form unter dem Band; den Weg ≥ 113 km und Q trägt S5'),
  fluss_spiegel: B('S5'), fluss_tiefe: B('S5', 'Form unter dem Band, gespeist aus Q (S5)'), front_wellen: B('S4', 'Wetter unter der Saison'),
  front_zug: B('S4', 'Wetter unter der Saison'), frost: B('S4', 'Eis- und Frost-Physik am Ort'),
  gebirge: F('S2', 'Gebirgshöhe aus S2 (Kollision, Bogen, Gedächtnis)'), gen_version: T('Schleuse'),
  gestein_art: F('S6', 'Gesteins-Art aus S6 (Basalt an Rücken und Hotspots, Granit im Orogen-Kern …)'),
  gewaesser_art: B('S5'), gezeiten: { s: '—', h: 'BLEIBT', g: 'kein Mond im Gesetz (§2) — die Gezeiten bleiben null' },
  grundwasser: B('S5', 'Grundwasser-Speicher des Pegels unter dem Band'), halm_jahr: F('S4', 'Phänologie: liest T(Saison) statt der Phase des 2 400-s-Jahrs'),
  hang: B('S2'), hebung: K('S2'), hoehen_band: T('Gitter'), hoehen_stauchung: K('NAHT'), hoehle: B('S2', 'Höhlen unter dem Band'),
  hydro_band: T('Gitter'), hydrosphaere: K('S5'), insel: B('BAND', 'Bühnen-Term des Prüfplatzes'),
  jahr_laenge: F('S0', 'jahrTage des Körpers; in Uhr-Sekunden = Tag der Uhr × jahrTage'), kachel: T('Gitter'),
  koordinate: F('NAHT', 'der Ursprung der Heimat ist der Anker'), kraut_deckung: B('S7', 'Unterwuchs unter dem Band; die Deckung folgt S7'),
  kruste: K('S1'), kueste: F('S2', 'Küsten-Profil aus S2 (Kruste, Schelf, Hang)'), laenge_ort: F('NAHT', 'die Länge der Heimat ist die Länge des Ankers'),
  landform: F('S2', 'Landform aus S2 (land, kont)'), landung: F('NAHT', 'die Landung einer Reise ist eine Adresse'),
  laub_praesenz: F('S4', 'Phänologie: liest T(Saison) statt der Phase des 2 400-s-Jahrs'), luftfeuchte: K('S4'), maeander: B('S5'),
  magma: K('S2'), meer_tiefe: F('S2', 'Meeresboden aus S2 (GDH1, Schelf, Hang)'),
  meeresspiegel: F('S3', 'der Spiegel aus S3; am Anker −3 m unter der Basis, byte-gleich'), mikro_relief: B('S2'),
  mond_licht: T('Darstellung'), mond_phase: { s: '—', h: 'BLEIBT', g: 'kein Mond im Gesetz (§2) — „Mond = −Sonne“ bleibt gesetzt' },
  muendung: B('S5'), mulde: B('S2'), naesse: B('S4', 'Nässe am Ding unter der Saison'), naesse_dosis: B('S4', 'Nässe am Ding unter der Saison'),
  nebel: B('S4', 'Wetter unter der Saison'), niederschlag_jahr: F('S4', 'Niederschlag aus S4 (Gürtel, Feuchte-Integral, Lee)'),
  niederschlag_staerke: B('S4', 'Wetter unter der Saison'), pegel: B('S5', 'Pegel-Lauf unter dem Band, gespeist aus Q (S5)'),
  planet_radius: K('S0'), platte: K('S1'), platten_zahl: K('S1'), prozess_tag: T('Zeitschritt'), quelle: B('S5'),
  rampe: B('BAND', 'Bühnen-Term des Prüfplatzes'), rausch_periode: B('BAND', 'Rausch-Periode des Heimat-Musters unter dem Band'),
  regen_abfluss: B('S5'), regen_quote: B('S4', 'Regen-Stufen des Wetters unter der Saison'),
  relief_amplitude: F('S2', 'Relief-Maß aus S2 (orogenStaerke, gS ∝ 1/g)'), relief_hoehe: B('S2'),
  relief_wellenlaenge: B('S2', 'Wellenlängen des Heimat-Reliefs (λ 38 m … 9 km) unter dem Band'),
  saison_phase: F('S4', 'Saison-Phase aus S4 (Phasen-Verzug lag über Meer-Nähe)'), saison_tempo: T('Zeitraffer'), saison_toenung: T('Darstellung'),
  samen: { s: 'S0', h: 'SAME', g: 'der Same selbst' }, schelf: F('S2', 'Schelf aus S2 (Krusten-Profil, shelfKm)'),
  schicht: B('S2', 'Schicht-Treppe unter dem Band'), schmelz_faktor: B('S4'), schmelze: B('S4'), schnee_dichte: B('S4'),
  schnee_grenze: F('S4', 'Schneegrenze aus T und −6,5 K/km (S4 schneeKm)'), schnee_pegel: K('S4'), schneefall: B('S4', 'Schneefall unter der Saison'),
  schwere: K('S0'), sediment: B('S2'), see_becken: B('S5'), see_spiegel: K('S5'), see_tiefe: B('S5'),
  sonnen_deklination: F('TJ', 'δ = ε·sin(2π·d/Jahr)'), sonnenstand: F('TJ', 'Sonnenstand aus Breite, δ und Stundenwinkel'),
  stau: K('S5'), sternleistung: K('S0'), stroemung: B('S5'), sturm_quote: B('S4', 'Sturm-Stufen des Wetters unter der Saison'),
  tafelland: F('S2', 'Tafel aus S2 (wildnis.tafel)'),
  tag_achse: { s: 'TJ', h: 'FÄLLT', g: 'Zwilling der EINEN Tag-Achse (welt-licht.js:728, d68): eigene Schwelle auf derselben Sonnenhöhe' },
  tageslaenge: T('Zeitraffer: Uhr-Minuten je Tag; der Tag des Körpers ist tagStunden (S0)'), tal_form: B('S5'), talform: B('S5'),
  temperatur_feld: K('S4'), temperatur_hoehengradient: F('NAHT', '−6,5 K/km ÷ s_v 0,0587 (benannter Unterschied 1)'),
  temperatur_jahresamplitude: K('S4'), temperatur_jahresmittel: F('S4', 'Jahresmittel aus S4; am Anker 7 °C'),
  temperatur_regenkuehlung: B('S4', 'Wetter unter der Saison'), temperatur_sommer_meer: F('S4', 'am Anker 18 °C byte-gleich, sonst + Δ klima.sommerC'),
  temperatur_tag: F('S4', 'Tagesgang aus S4 (tagAmpC)'), temperatur_tagesamplitude: F('S4', 'Tagesgang aus S4 (tagAmpC)'),
  temperatur_tagesgipfel: { s: 'TJ', h: 'BLEIBT', g: 'die wärmste Stunde (0,625); der Kern kopiert sie nur (:2333), das Gesetz hat keine Formel' },
  temperatur_winter_meer: F('S4', 'am Anker −4 °C byte-gleich, sonst + Δ klima.winterC'),
  temperatur_wolkendaempfung: B('S4', 'Wetter unter der Saison'), trog: F('S2', 'Trog aus S2 (wildnis.trog)'), ufer: B('S5'),
  uhr_start: T('Spiel-Start'), uhr_tempo: T('Zeitraffer'), verdunstung: B('S4', 'Verdunstung am Ding unter der Saison'), voxel: T('Gitter'),
  vulkan: K('S2'), wald_deckung: F('S7', 'Wald aus S7 (pflanzenDeckung) und die Waldgrenze aus T'), wald_rand: B('S7'),
  wasser_anteil: K('S0'), wasser_koerper: K('S5'), wasser_optik: B('S5', 'Wasser-Optik am Ort'), wasser_zellen: K('S5'),
  wasserfall: B('S5'), welle: B('S5', 'Seegang unter dem Band'), welt_tag: K('TJ'), weltgroesse: B('BAND', 'Klemme der Bühnen-Terme'),
  wetter_intensitaet: B('S4', 'Wetter unter der Saison'), wetter_takt: T('Zeitschritt'), wetter_wort: B('S4', 'Wetter unter der Saison'),
  wiese: B('S7'), wind_richtung: B('S4', 'Mäander des Winds unter der Saison; die mittlere Richtung folgt S4 (windX/windZ)'),
  wind_staerke: B('S4', 'Böe und Wetter unter der Saison'), wind_wiegen: T('Darstellung'), wolken: B('S4', 'Wetter unter der Saison'),
  zeit_ma: K('S1'), zeit_pegel: T('Zeitschritt'),
};

// Ausnahmen je Zeile (Heimat und Kern), jede mit Grund
const ID = {
  // Heimat — FOLGT gegen die Klasse
  a40: ['FOLGT', 'S2', 'Steilheit ks aus S2 (wildnis.ks = 3 + 12·konv)'], a59: ['FOLGT', 'S6', 'Schicht-Dicke aus der Gesteins-Art'],
  a60: ['FOLGT', 'S6', 'Hart-Anteil aus der Gesteins-Art'], a23: ['FOLGT', 'S2', 'Land-Anteil aus S2 (wildnis.land)'],
  b79: ['FOLGT', 'S4', 'Verdunstung im Hydro-Gesetz fehlt (0): sie folgt PET aus S4'], c27: ['FOLGT', 'S4', 'der Δ-Weg der Regen-Quote aus S4'],
  c28: ['FOLGT', 'S4', 'der Δ-Weg der Sturm-Quote aus S4'], c82: ['FOLGT', 'S7', 'Trocken-Bogen aus dem Jahresmittel (S7)'],
  c83: ['FOLGT', 'S4', 'Waldgrenze aus T (Sommer)'], d16: ['FOLGT', 'S7', 'Nadelholz-Grenze aus dem Klima (S7)'],
  d26: ['FOLGT', 'S4', '„Klima“ clim liest heute Rauschen; es folgt T und P aus S4'], d28: ['FOLGT', 'S4', 'Trockenheit aus P/PET (S4), nicht aus der Höhe'],
  b66: ['FOLGT', 'S5', 'der Grundwasser-Tisch folgt dem Wasser (S5), nicht dem Meer unter jedem Berg — S5 misst heute kein Grundwasser'],
  c7: ['FOLGT', 'S4', 'Sommer-Phase aus S4 (Phasen-Verzug lag)'],
  d54: ['FOLGT', 'TJ', 'Etikett der Tageszeit aus der Sonnenhöhe statt der Uhr'], d55: ['FOLGT', 'TJ', 'Tagesplan aus Auf- und Untergang statt fester Stunden'],
  d56: ['FOLGT', 'TJ', 'Sternfeld-Drehung aus Tag und Breite (Polhöhe)'], d68: ['FOLGT', 'TJ', 'DIE EINE Tag-Achse liest die Sonne aus Tag und Jahr'],
  // Heimat — BAND, GESETZ, BLEIBT gegen die Klasse
  a17: ['BAND', 'BAND', 'Zahl der Bühnen-Terme'], a20: ['BAND', 'S2', 'Bucht-Term der Bühne'], a52: ['BAND', 'S2', 'Talgrund-Mittel'],
  a65: ['BAND', 'S2', 'Detail-Anteil unter dem Band'], a94: ['BAND', 'S2', 'Fels-Freilegung nach Hang'], a103: ['BAND', 'S2', 'Rock-Exposure nach Hang'],
  a104: ['BAND', 'S2', 'Findling und Aufschluss der Streu'], b14: ['BAND', 'S3', 'Eis-Eichung am Ort'], c65: ['BAND', 'S4', 'Rauschen der Schneegrenze (λ 45–330 m)'],
  c71: ['BAND', 'S4', 'Schnee deckt ab (Schwelle am Ort)'], d22: ['BAND', 'S7', 'Wald ↔ Lichtung (λ ≈ 167 m)'], d93: ['BAND', 'S7', 'Holz der kahlen Krone'],
  b67: ['BAND', 'S5', 'Aquifer-Tiefe am Ort'], b68: ['BAND', 'S5', 'Grundwasser-Speicher des Pegels'],
  d69: ['GESETZ', 'TJ', 'bürgerliche Dämmerung bei −6° (Literatur-Norm)'], d70: ['BLEIBT', 'TJ', 'Nacht-Auge der Tag-Achse (−32°)'],
  d71: ['BLEIBT', 'TJ', 'Leuchtdichte des Tageshimmels über der Sonnenhöhe'],
  d79: ['TECHNIK', '—', 'Spiel-Start in der Sommer-Mitte'], b18: ['TECHNIK', '—', 'Fern-Ring: Darstellung des Wassers in der Ferne'],
  d62: ['FOLGT', 'TJ', 'Auf- und Untergang aus Breite und δ (cos H₀ = −tan φ·tan δ)'], c15: ['FOLGT', 'S0', 'Spieltag = Tag der Uhr (Zeitraffer)'],
  a1: ['FOLGT', 'NAHT', 'die Heimat-Höhe f(x, z) bleibt die Form unter dem Band, gestellt auf die Planet-Höhe am Anker (§5)'],
  // Heimat — FÄLLT (Zwilling oder Vorgabe)
  a36: ['FÄLLT', 'S2', 'Höhen-Deckel ≤ 267 m: Klemme; die Höhe folgt S2 × s_v'],
  a88: ['FÄLLT', 'S2', 'terrainSteepness: Zwilling der Relief-Skala a25; das Maß des Gebirges folgt S2 (gS ∝ 1/g)'],
  b4: ['FÄLLT', 'S3', 'Meer-Vorgabe +4: Zwilling; der Spiegel folgt S3'], b5: ['FÄLLT', 'S3', 'Meer-Vorgabe 0: Zwilling; der Spiegel folgt S3'],
  b11: ['FÄLLT', 'S3', 'atlasSpiegel-Vorgabe jenseits der Kachel: das Meer −3 ohne Ort; der Spiegel an der Adresse folgt S3 und S5'],
  b12: ['FÄLLT', 'S3', 'wasserSpiegel-Vorgabe: Zwilling von b11 (−3 gegen −∞); der Spiegel an der Adresse folgt S3 und S5'],
  d4: ['FÄLLT', 'S0', 'Samen der Welt (Vorgabe): Zwilling der Saat a4'],
  // Kern — gegen die Regel
  e14: ['SAME', 'S1', 'regime „platten“: Vorgabe ohne Zug, ein Datum'], e109: ['SAME', 'S2', 'gleichverteilt gezogen'],
  e115: ['SAME', 'S2', 'gezogen'], e116: ['SAME', 'S2', 'gezogen; jeder 8. fällt aus'], e121: ['SAME', 'S2', 'Kegel-Höhe gezogen'],
  e122: ['SAME', 'S2', 'Kegel-Höhe gezogen'], e126: ['SAME', 'S2', 'gleichverteilt gezogen'],
  e70: ['GESETZ', 'NAHT', 'das Band 32 km (K8)'], e71: ['GESETZ', 'NAHT', 'fuss 16 der Brücke (K8, 2·fuss ≤ 32)'],
  e166: ['GESETZ', 'S4', 'Clausius-Clapeyron (≈ 7 %/K, Held & Soden 2006); der Kern fährt 5 %/K'],
  e157: ['FOLGT', 'S0', 'Tropopause ∝ T/g aus dem Körper (10 km × 9,81/g × T/288)'],
  e135: ['FÄLLT', 'S3', 'BEZUG_MA: toter Name, nie gelesen (sigmaRef rechnet mit dem Literal, :1596)'],
  e217: ['FÄLLT', 'NAHT', 'wildnis.kontinentLambda: Δ ≡ 0 per Bau; die Wellenlänge der Heimat ist Band'],
  e222: ['FÄLLT', 'NAHT', 'wildnis.schichtDicke: Δ ≡ 0 per Bau; sie folgt S6'], e223: ['FÄLLT', 'NAHT', 'wildnis.hartAnteil: Δ ≡ 0 per Bau; er folgt S6'],
  e231: ['TECHNIK', 'NAHT', 'leit 9×9: das Gitter der Brücke'],
};

const istKern = (r) => String(r.ort).split(':')[0] === 'planet-core.js';
const GEZOGEN = /·\s?Z\b|·Z|Z\)|⌊[^⌋]*Z|gleichverteilt/;
function urteile(r) {
  const k = KLASSE[r.groesse];
  if (!k) throw new Error('Klasse ohne Urteil: ' + r.groesse + ' (' + r.id + ' ' + r.name + ')');
  let u, s = k.s, g;
  if (r.technik === true) { u = 'TECHNIK'; g = 'vom Leser als Technik gezählt'; }
  else if (ID[r.id]) { [u, s, g] = ID[r.id]; }
  else if (r.urteil === 'folgt') { u = 'FOLGT'; g = r.woraus ? String(r.woraus).slice(0, 120) : 'folgt heute schon'; }
  else if (istKern(r)) {
    if (/^PLANET_ERDE\./.test(r.name)) { u = 'SAME'; g = 'Physik-Datum §2 (Erd-Schlüssel; sonst zieht es der Same)'; }
    else if (r.urteil === 'gesetzt_anker') { u = 'GESETZ'; g = r.woraus ? String(r.woraus).slice(0, 120) : 'Literatur-Anker'; }
    else if (GEZOGEN.test(String(r.wert))) { u = 'SAME'; g = 'vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3)'; }
    else { u = 'BLEIBT'; g = 'von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3)'; }
  } else { u = k.h; g = k.g; }
  if (u === 'BAND' && r.urteil === 'gesetzt_anker') { u = 'GESETZ'; g = 'Physik am Ort mit Quelle: ' + String(r.woraus || '').slice(0, 100); }
  if (!u) throw new Error('kein Urteil für ' + r.id + ' (' + r.groesse + ')');
  return { id: r.id, groesse: r.groesse, name: r.name, ort: r.ort, seite: istKern(r) ? 'Kern' : 'Heimat', vorher: r.urteil + (r.technik ? '+T' : ''), urteil: u, stufe: s, grund: g };
}
const U = Z.map(urteile);
for (const id of Object.keys(ID)) if (!U.some(x => x.id === id)) throw new Error('ID-Ausnahme ohne Zeile: ' + id);

const ORDNUNG = ['FOLGT', 'FÄLLT', 'SAME', 'GESETZ', 'BLEIBT', 'BAND', 'TECHNIK'];
const z = (L, u) => L.filter(x => x.urteil === u).length;
const out = [];
out.push('Urteil über ' + U.length + ' Größen des Zensus (zensus.json, ohne Doppelte)');
for (const [n, L] of [['alle', U], ['Kern', U.filter(x => x.seite === 'Kern')], ['Heimat', U.filter(x => x.seite === 'Heimat')], ['heute gesetzt (ohne Technik)', U.filter(x => !/^folgt|\+T$/.test(x.vorher))]])
  out.push(n.padEnd(30) + String(L.length).padStart(4) + ' · ' + ORDNUNG.map(u => u + ' ' + z(L, u)).join(' · '));
const fs1 = U.filter(x => x.urteil === 'FOLGT');
out.push('FOLGT je Stufe: ' + Object.keys(STUFE).filter(s => fs1.some(x => x.stufe === s)).map(s => s + ' ' + fs1.filter(x => x.stufe === s).length).join(' · '));
const ges = U.filter(x => !/^folgt|\+T$/.test(x.vorher));
out.push('heute gesetzt → FOLGT je Stufe: ' + Object.keys(STUFE).filter(s => ges.some(x => x.urteil === 'FOLGT' && x.stufe === s)).map(s => s + ' ' + ges.filter(x => x.urteil === 'FOLGT' && x.stufe === s).length).join(' · '));
out.push('FOLGT auf einer Stufe ohne Spike (S6, TJ): ' + fs1.filter(x => x.stufe === 'S6' || x.stufe === 'TJ').map(x => x.id).join(' '));
for (const u of ['FÄLLT', 'SAME', 'GESETZ', 'BLEIBT']) out.push(u + ': ' + U.filter(x => x.urteil === u).map(x => x.id).join(' '));
console.log(out.join('\n'));
fs.writeFileSync(path.join(__dirname, 'urteil.json'), JSON.stringify({ quelle: 'vision/planet/urteil.cjs über zensus.json', zaehlung: Object.fromEntries(ORDNUNG.map(u => [u, z(U, u)])), urteile: U }, null, 1));
const esc = (s) => String(s === undefined ? '' : s).replace(/\|/g, '/').replace(/\n/g, ' ');
let md = '# Das Urteil je Größe (erzeugt von `urteil.cjs`, nicht abgetippt)\n\nJe Zeile: id · Größe · Ort · vorher (Zensus) · Urteil · Stufe · Grund. Geordnet nach Urteil, dann Stufe.\n';
for (const u of ORDNUNG) {
  const L = U.filter(x => x.urteil === u).sort((a, b) => (a.stufe + a.id).localeCompare(b.stufe + b.id, 'de', { numeric: true }));
  md += '\n## ' + u + ' (' + L.length + ')\n\n| id | Größe | Ort | vorher | Stufe | Grund |\n|---|---|---|---|---|---|\n';
  for (const x of L) md += '| ' + x.id + ' | ' + esc(x.name).slice(0, 60) + ' | `' + esc(x.ort).slice(0, 40) + '` | ' + x.vorher + ' | ' + STUFE[x.stufe] + ' | ' + esc(x.grund).slice(0, 140) + ' |\n';
}
fs.writeFileSync(path.join(__dirname, 'urteil-tafel.md'), md);

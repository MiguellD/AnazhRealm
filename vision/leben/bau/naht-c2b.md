# LESE-NAHT C2a → C2b (der Gau-Wirt, Zweig leben-erbe)

Stand der Naht: Stufe 1 949521b64d · Stufe 2 056c2850f5 · Stufe 3 siehe `git log` (Akte im Leben des Stands).
Alle Glieder liegen in `stamm/kreatur-erbe.js` (Modul Kreatur/erbe), der Faden-Teil in `voxel-worker.js` (`gauAuftrag`),
der Kern in `leben-core.js` (`bestand(wirt)` → Gau-Glieder). Kein Leser des Stamms ruft sie heute — C2b hängt sie ein.

## 1 · Was der Stamm ruft (Haupt-Faden)

| Funktion | Signatur | Einheit / Bedeutung | Rufer in C2b |
|---|---|---|---|
| `AnazhRealm.GAU` | `{ n: 48, beute: "deer", jaeger: "wolf" }` | Regionen je Gau-Seite; die zwei Gattungen unter dem Gesetz | jeder Leser unten |
| `_gauOrt(ix, iz)` | → `{ gx, gz, x0, z0, revier }` | Region (Raster von `_bestandSeite()` = 200,29 m) → Gau und Revier-Index (Zeile für Zeile, x zuerst); Gau (0,0) = Regionen −24 … 23 | `_bestandVerkoerpern`, Beute-Zähler von Fuchs/Bär, `auraAt` |
| `_gauBis(gx, gz, takt, opt)` | → Promise `{ gx, gz, takt, beute, jaeger, rudel, feld: { land, zellen, kSumme }, zeit, reviere?, stand? }` | `takt` = ganzer Takt des Gesetzes (10 s Spiel-Zeit je Takt, `BESTAND_GESETZ.taktS`); rechnet mit den Akten, die der Wirt hält | der Takt des Bestands (statt `_bestandTakt` für Hirsch/Wolf) |
| `opt.lesen` | `[revier, …]` → `reviere: [{ i, koepfe: { beute, jaeger, rudel }, tiere: [Zeile], frass: [16 Zahlen] }]` | siehe Zeilen unten | `_bestandVerkoerpern` (Reviere am Schirm), `auraAt` (Fraß) |
| `opt.packen` | `true` → `stand: Uint8Array` (per Transfer) | der Stand des Gaus als Bytes (692 776 B am Takt 100, 730 136 B am Takt 160 in der Heimat) | Prüf-Marke je Gau für gate:mp-sync (Hash), später der Stand-Punkt |
| `opt.stand` | `Uint8Array` (wird transferiert — Kopie reichen) | der Faden rechnet ab diesem Stand weiter | Laden mit Stand-Punkt (noch nicht in der Stand-Datei) |
| `_gauAkt(gx, gz, akt)` | → `true` / `false` (derselbe Akt stand schon) | `akt` = `{ takt, art: "aus", id }` oder `{ takt, art: "ein", g: "beute"\|"jaeger", revier, id, a, e, alterS, m?, w? }`; `takt` ganzzahlig, `alterS` in s, `a`/`e` die Vektoren des Erbes | `_bestandAus` (kreatur-leben.js:2582) → „aus“; `_bestandAdoptieren` (:2524) → „ein“; beide über den Feld-Akt mit Takt-Stempel |
| `_gauAuftrag(gx, gz, takt, akte, opt)` | wie `_gauBis`, die Akte gereicht | der rohe Auftrag; `opt.saat`, `opt.kg` nur für die Linse (Saat und Masse von Lauf 4) | nur Linse |
| `_gauGeht(gx, gz)` | — | der Faden lässt Feld und Lauf des Gaus fallen | wenn der Gau den Schirm verlässt |
| `_gauSaat(gx, gz)` | → int32 | FNV-1a von `Samen:gau:gx,gz` | (intern) |
| `_gauWirt()` | → Zahlen des Wirts | Masse des Gusses (`_gattungKg`: 93,39 / 63,56 kg), Takt, Revier, Feld-Zahlen | (intern) |
| `_gauImStand()` / `_gauAusStand(v)` | `[["gx,gz", [Akt, …]], …]` | die Akte im Leben des Stands (`leben.gaue`) | `_lebenImStand` / `_lebenAusStand` (verdrahtet) |

## 2 · Die Zeilen der Lese-Antwort (leben-core)

| Leser im Kern | Antwort | Einheit |
|---|---|---|
| `koepfe(z, i)` | `{ beute, jaeger, rudel }` | Köpfe im Revier i; `jaeger` = Köpfe der Rudel, deren Ort (letzter Riss) das Revier ist; `rudel` = Kennung des Rudels, dem das Revier gehört, −1 = frei |
| `tiereIn(z, i)` | `[{ id, g, v, m, w, alterS, kg, M, r, a, e }]` | `g` „beute“/„jaeger“ · `v` Verband („b“+Revier bzw. „r“+Rudel) · `m` Mutter-Kennung oder null · `w` weiblich · `alterS` s · `kg` Leib am Takt · `M` Masse erwachsen (kg) · `r` reif · `a`, `e` Erbe und Umwelt |
| `frassAm(g, i, c)` | Zahl | Fraß der Zelle c (0 … 15, Index a·4 + b; Zell-Mitte x = (ix + (a + 0,5)/4)·S, z = (iz + (b + 0,5)/4)·S) in Feld-Einheiten wie das Leben-Overlay: ≤ 0 abgeäst, Klemme −1 … 0,7; Äsung = klemme(Substrat + Fraß, 0, 1) |

Kennungen sind Gau-lokal (`Revier:Takt·10:Nummer`, Jäger `r<Rudel>:…`) — für die Welt setzt C2b den Gau davor.

## 3 · Wände, die C2b halten muss

1. Die Altlast (Fuchs, Bär, Gehege) schreibt nie in den Gau; ihre Beute-Zahl LIEST `reviere[i].koepfe.beute`.
2. Der Wirt bestellt nur Takte ≤ Horizont (`_feldHorizont()` / taktS). Ein Akt VOR dem Stand des Gaus im Faden oder eine
   geänderte Vergangenheit der Reihe lässt den Faden ab Takt 0 neu rechnen (`zeit.abNull` in der Antwort) — richtig, aber
   teuer: 0,72 s nach 10 Jahren, 10,99 s nach 100, 154,6 s nach 1 000 (1 Jahr = 26,25 Takte = 262,5 s Spiel-Zeit).
3. Die Antwort kommt als Versprechen: `_bestandVerkoerpern` liest die LETZTE Antwort, nie synchron den Faden.
4. Spieler-Taten am Leben-Feld sind nicht Eingabe des Gaus (E3): eine Tat bewegt heute K einer Zelle um höchstens
   6,27 Köpfe (K = 6,268 × Äsung je Zelle von 0,25 ha), typisch 0,75 (Fällen) bis 1,9 (Brand, ein Leben-Puls 1,57).
5. Das Feld des Gaus liest nur die Saat (kein Erdbau, kein Pegel, kein Stau) — `_bodenKlasseAt` des Stamms liest
   denselben Weg; wer im Stamm eine Klasse aus dem gespielten Zustand liest, weicht ab.

## 4 · Kosten (Laptop, headless)

Feld eines Gaus 1,6–2,0 s im Faden (25 Hydro-Kacheln 1,45 s) · 107–138 ms je Jahres-Schritt (4,1–5,3 ms je Takt) ·
Haupt-Faden je Ruf ≤ 0,67 ms · Stand packen: Bytes per Transfer.

## 5 · Zusatz C2a3 (19.11.): K je Revier und die Tode seit der letzten Antwort — nur NEUE Felder

Kein bestehendes Feld ändert Form oder Namen; der gepackte Stand trägt nichts davon (Abdruck am Takt 160 unverändert).

| Feld der Antwort (`_gauBis` mit `opt.lesen`) | Form | Bedeutung | Quelle |
|---|---|---|---|
| `reviere[].K` | `{ beute: Zahl, jaeger: null }` | Tragfähigkeit des Reviers in Köpfen der Beute an der Äsung des Takts (kopfJeHa × Σ kZelle, die Formel von `feldTakt` ohne Zerfall — reine Funktion des Stands, nach dem Laden dieselbe Zahl); der Jäger trägt im Gesetz kein K (er hängt an V und D), darum `null` | leben-core `tragAm(g, i)` · voxel-worker `gauAuftrag` |
| `tode` | `[{ id, g, revier, takt, ursache, jaeger }]` | die Tode des Gesetzes in den GELESENEN Revieren seit der letzten Antwort mit `lesen` | leben-core `todeSeit(g)` (leert die Liste) · `todeMerken` in `gauSchritt` |

- `id` Kennung des Kopfs (Gau-lokal, wie in `tiere[].id`) · `g` „beute“/„jaeger“ · `revier` Index des Reviers (beim Jäger der Ort des Rudels) ·
  `takt` der Takt des Gaus NACH dem Tod.
- `ursache`: „jagd“ (Riss) · „hunger“ · „alter“ · „welpe“ · „deckung“ — die Namen des Kerns (`z.ereignis.tod[].ursache`).
- `jaeger`: beim Riss der Verband des Rudels („r“ + Kennung, derselbe Text wie `tiere[].v` der Wölfe), sonst `null`. Der Riss ist im
  Gesetz die Tat des Rudels (Satz 3: eine Masse je Rudel und Takt) — einen einzelnen Wolf als Täter gibt es nicht.
- Grenzen: die Liste ist Lese-Hilfe, kein Stand — sie reist nicht im gepackten Gau, ist nach Laden oder Neu-Rechnen ab Takt 0 leer und
  hält höchstens die Tode des letzten Jahres (26 Takte); Tode in Revieren, die der Auftrag nicht liest, verfallen mit der Antwort.
  Ein Akt „aus“ der Seite steht nicht darin (die Seite kennt ihn selbst).
- `z.ereignis.tod[]` des Kerns trägt neu `von` (Kennung des Rudels beim Riss, sonst −1).

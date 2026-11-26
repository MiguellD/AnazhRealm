# rueckfall-drei — Stand-Blatt (Basis origin/main 4c9e6aab)

Status: ZWISCHENSTAND · Karte 2 gebucht 119 von 1 718 · beanspruchte Sprossen: `karte2.leben.pflanzen.kraft#2`,
`karte2.leben.tiere.masse#1`, `karte2.planet.kopplung.gegenwart#1`

## 1 · karte2.leben.pflanzen.kraft#2 — die Böen-Drift zieht mit dem Wind

**Täter-Zahl (node, Null-Welt und Wirt ohne Welt, gleiche Bedingungen).** Das Spiel im Fenster e1a54023..f63a69ef kippte NICHT: die
Perspektive `pflanzen` in der Null-Welt am selben Stand misst 12,279 % (e1a54023) ↔ 12,261 % (f63a69ef). Es kippte die STATION — der Rumpf,
den die Geräte fuhren (`messung/roh/*/karte2.leben.pflanzen.biome_1.json.rumpf.json`), trägt ab f63a69ef-gtx in der Leiter lebenslauf
`await H.ruf("/umstellen", { ort: "wiese", sicht: "ego" })` vor kraft:

- Commit im Zweig `punkte-maschine`: `5ce9e0d1be76c8e42af581adc2f5f450064f99b5` „Station leben.pflanzen.lebenslauf#1: das Dach-Histogramm gegen
  die Ertragstafel, Reineke über die Patch-Phasen [skip ci]“ (meisterkarte-quelle/punkte/stationen/k2-leben.js:696).
- Die Wurzel im Spiel, die er sichtbar machte: `stamm/stoff-material.js:383` (main) `const staerke = wf.wind * this._windWob(tt) * form * g.f;`
  — die Böen-Drift an der Uhr allein.

**Mechanismus.** Der Weg der Böe trägt seine Geschichte (`_boeAnker`); seit dem Umstellen misst kraft an der Mess-Wiese nach den Takten der
Bühne an einer anderen Phase des Ankers als vorher (Gerät: ruhe 0,0668 / sturm 0,7112 / Lag 7,25 s / Soll 5,859 s — die Null-Welt trifft
das bei Phase 0,583 λ: 0,0672 / 0,7121 / 7,25 / 5,851). Die Drift (`_windWob`, Perioden 5–33 s, ±18 %) atmete überall zugleich, kam 100 m
windab ohne Laufzeit an und zog die Kreuzkorrelation je nach Phase der Böe — über zwölf Phasen 12,6–23,9 %, an der Phase des Geräts 23,9 %.

**Schnitt an der Wurzel (der Ruf `/umstellen` der Station bleibt).** `_windAt` liest die Drift auf der Uhr des Musters am Ort,
τ = (s(t) − Lage) ÷ `boeTempo(1)` (im Sturm am festen Ort dieselben Perioden, sie zieht eingefroren mit dem Wind, Taylor 1938) und trägt
sie als `wob` aus; ihre Leser lesen dieselbe Probe: der Brand (`_brandTempo`: ms ÷ (boe · wob)), das Bild (`_loopRender`: `_weatherWob`
= die Drift am Auge), `diag-stand-takt` (der gesetzte Wind trägt seine Drift, die Hülle von `_windWob` fällt).

**Zahl vorher → nachher** (Wiese, zwölf Phasen des Ankers, Null-Welt = Wirt ohne Welt bis auf die dritte Stelle):
laufzeitAbw 12,6–23,9 % → 15,3–17,0 %, an der Phase des Geräts 23,9 → 16,6 %; Lag 6,75–7,25 s → 7,00 s bei jeder Phase.

**Linse.** `scripts/diag-wetter-wache.cjs` (Ö) misst am Wirt an der Mess-Wiese (`welt-orte` `messort("wiese")`) über `BOE_PHASEN` = 12 Phasen
des Ankers und urteilt die schlechteste (`boePhasen` → `boeRot`, Leser `gate:wetter-wache` und `check:statik`, 29 s). Am Täter-Stand
(Spiel f63a69ef, dieselbe Messung): 12,632–23,912 % → ROT. Selbsttest: gepflanzt „die Drift an der Uhr allein“ 12,632–23,912 % → ROT,
gepflanzt ω/k 85,7 % → ROT, das Gesetz 15,31–17,016 % ✅. Bis hier maß die Wache EINE Phase bei (40, −30): dort ist die alte Drift
5,6–17,8 % und blieb grün.

**Offen (mit Zahl).** Das Muster der Böe dreht mit der Richtung um den Ursprung der Welt (`_boePhase` − k·(x·d(t))): an der Wiese
(1 082 m vom Ursprung, −23° im Fenster 100–160 s) +1,33 m/s scheinbares Tempo, Laufzeit 100 ÷ c 6,61 → 6,96 s (+5,3 % in kraft#2
`laufzeitS`); ein Pivot am Spieler bräche „Peers sehen denselben Wind“ (zwei Spieler 200 m auseinander: k · 80 m ≈ 3 rad in einer
Minute) — nicht geschnitten. Der Wert 6,117 % an e1a54023 maß nicht an der Wiese (dichte dort 188,4 Stämme/ha, wieseBisM 198 — an der
Wiese 130,3/ha, null).

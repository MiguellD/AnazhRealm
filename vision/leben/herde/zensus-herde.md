# Die Herde im Bild — Zensus (Baum leben-leser a946501198, nur gelesen, nichts gefahren)

Stichproben am Code bestätigen die vier Befunde: kreatur-leben.js:3891 `nahLeiber: 4`, dirigent-kern.js:280 `maxCreatures: 20`, tetrapoda-core.js:3676 Kopf `+0,04·sin(t·1,7)`, werkbank.cjs:975 `__halten(["tiere"])`. Einen Widerspruch zum Code habe ich nicht gefunden. Der einzige Widerspruch steht zwischen den Befunden und ist unten in Punkt 3 genannt.

## 1. Unterste Ebene
- **Einheit:** Froude, Fr = v²/(g·L). L ist die Hüfthöhe in m (`beinL`, koerper-leib.js:2513, × Körpergröße, tetrapoda-core.js:3218). v̂ = v/√(gL) (tetrapoda-core.js:1411).
- **Anker Gang:** EIN Gesetz `gangSchritt` (:1403–1436): λ = L·(1,4 + v̂), ω = 2π·v/λ, Tastgrad 0,65/0,5/0,3, Gangart-Schwellen Fr 0,5 und 2,5 (:1369–1389).
- **Anker Pose:** EINE Quelle `tierPose`, gerufen vom Labor (tetrapoda.js:38) und von der Welt (koerper-leib.js:2391).
- **Anker Herde:** `verbandZug` (tetrapoda-core.js:1864–1903). Ausrichtung 0,5, Leittier ×3, Zusammenhalt bis 2,5 Paar-Räume, Raum = 1,3 Körper-Kugeln (:260–281).
- **Anker Ort:** der Gau. Je Revier die 50-m-Zelle mit dem größten Wert Lebensraum × Substrat; alle Glieder teilen sie (kreatur-erbe.js:503–534).
- **Leser Bewegung:** voller Leib nur für die 4 Bedeutendsten im Nah-Kreis (kreatur-leben.js:2983, :3891). Jedes andere Tier geht im Satz: 32 gebackene Phasen je Band, Profil „joy“, ohne Stimmung (:3190).
- **Leser Herde:** `_kreaturVerbandZug` (kreatur-verhalten.js:144–176). Zeichnung höchstens 20 Leiber (kreatur-leben.js:2666–2668).

## 2. Die Lücken, nach Wirkung im Bild
1. **Wenige Tiere, die meisten tot gestellt.**
   - Spieler sieht: höchstens 4 Tiere mit Kopf, Ohr und Äsen. Der Rest der Herde geht oder steht in der Neutral-Pose mit erhobenem Kopf.
   - Natur: 3–20 Hirsche je Rudel, beim Äsen 40–60 % der Zeit mit dem Kopf unten.
   - Wurzel: kreatur-leben.js:3891 (`nahLeiber` 4), :3190 (`emotions null`), :3196 (Stand = Neutral-Pose).
   - Mess-Name: `herde.koepfeImBild`, `herde.kopfUntenAnteil`.
2. **Die Herde fehlt oder wird mitten im Verband abgeschnitten.**
   - Spieler sieht: 31 Köpfe in 4 Herden, gezeichnet werden 20. Die fernste Gruppe fehlt ganz, eine weitere zum Teil.
   - Aufbau 3 Leiber je 10 s, also etwa 70 s bis 20 Leiber stehen.
   - Wurzel: dirigent-kern.js:280; kreatur-leben.js:2666–2668, :3883.
   - Mess-Name: `herde.teilschnitt`, `herde.aufbauS`.
3. **Kopf und Körper sind nicht an den Tritt gebunden.**
   - Spieler sieht: der Kopf schwingt mit 0,27 Hz und 0,04 rad auf der Wanduhr. Hals und Ohren sind starr. Der Galopp hat keine Rückenbiegung und keinen Hub.
   - Natur: 2 Nick-Schwingungen je Zyklus, an den Aufsatz des Vorderfußes gebunden, einige cm senkrecht.
   - Wurzel: tetrapoda-core.js:3676 (Kopf), :3313–3315 (Ohr), :1520 („die Tiere lesen es nicht“); Grep `T.neck`/`T.hals` = 0 Treffer.
   - Mess-Name: `gang.kopfSpektrum2f`.
4. **Posen springen beim Wechsel.**
   - Stehen → Gehen in EINEM Takt: tailAmp 0,10 → 0,38 rad, tailRate 0,5 → 5,5 rad/s mit Phasensprung (t absolut), headX −0,01 → 0,04. Äsen setzt headX 0,95 in einem Takt. Flucht wechselt das Profil ohne Blend.
   - Natur: stetige Übergänge.
   - Wurzel: kreatur-verhalten.js:3630; tetrapoda-core.js:3176–3185, :3680–3683; koerper-leib.js:2384–2388, :3418.
   - Mess-Name: `pose.sprungMax`.
5. **Alle Arten gehen mit dem Gemüt des Wolfs.**
   - Spieler sieht: der Hirsch wedelt im Gehen mit 5,5 rad/s und 0,38 rad (Profil joy).
   - Wurzel: MOTION_HOST_RECIPE „wolf“ (koerper-leib.js:3399, :3406–3409); tetrapoda-core.js:71.
   - Mess-Name: `gang.profilJeArt`.
6. **Kinematik weicht von der Physik ab.**
   - Wende ω = 1,1·√(g/L): beim Hirsch im Sprint Radius 2,5 m und 3,3 g quer (Natur ≤ 1 g, also r ≥ 8 m).
   - Der Wolf zieht im Schritt mit 0,85–1,7 m/s (Natur: Trab mit 2,2 m/s).
   - Schrittlänge −22 % gegen die Natur bei v̂ 3,0 (Winkel-Deckel).
   - Wurzel: tetrapoda-core.js:1617, :1639, :1612; :1413, :1433.
   - Mess-Name: `gang.querG`, `gang.zugGangart`.
7. **Kein gemeinsames Leben im Verband.**
   - Jedes Glied wählt sein Ziel selbst (netId × Slot). Die Leine ist je Tier 8–28 m × Größe, und der Anker wandert je Tier. „Sichern“ ist eine Hash-Geste, kein Zustand. Das Kalb folgt der Mutter nicht: es gibt keinen Leser von `t.m`.
   - Natur: Sichern 2–5 s alle 10–30 s, Nachbarn nicht im Gleichtakt; Kalb als Folger 1–5 m an der Kuh.
   - Wurzel: kreatur-verhalten.js:1429–1435, :554; kreatur-leben.js:3375–3401; tetrapoda-core.js:3134–3157.
   - Mess-Name: `herde.sichernCV`, `herde.kuhKalbM`.

## 3. Zwillinge und feste Zahlen ohne Herkunft
- **Zwilling Satz ↔ Leib:** der Satz backt auf ebenem Grund, ohne Hang-IK, ohne Stimmung und ohne Tätigkeit (kreatur-leben.js:3089–3091, :3186–3190). Seine Schwanzphase ist nicht an den Zyklus gebunden; daraus folgt eine Naht je Umlauf (abgeleitet, nicht gemessen).
- **Zwilling im Wirt:** das Labor fährt mit Boden 0, Kippung 0, ohne „tag“/grasen und ohne Verband (tetrapoda.js:18, :27). Die Welt fährt `_kreaturFussBoden` und das Zustands-Profil.
- **Ohne Herkunft (Etikett nur „byte-treu Lab Z.130–135“):** die MOTION-Tafel (tetrapoda-core.js:70–80) mit freq, bodyX/Z, headX, ear, tailAmp, tailRate, tension, bob, sway, kpMul.
- **Ohne Herkunft, weitere Werte:**
  - grasen headX 0,95; Aktionsdauern 6/16/4 s (:111–114)
  - Kopfwelle 0,04 bei 1,7; Scan 1,3; Schwanz-Versatz 0,5 (:3276, :3676–3683)
  - Stand-Unruhe 0,004/0,003 (:3631–3636); Aufsetz-Ruck −0,012 mit 14/s (:3301–3305)
  - maxWinkel 0,42, hub 0,12, falte 0,6 (:1337–1354)
  - Folgen 4,0 m/s, Trinken und Sammeln 3,0 m/s ohne Körper-Anker (:265–274)
  - walkPhase dt·5,0 (kreatur-verhalten.js:3631)
  - `nahLeiber` 4, `maxCreatures` 20, `leiberJeTakt` 3
  - Wurf 3–7 / 3–6 (tetrapoda-core.js:282)
- **Veralteter Kommentar:** tetrapoda-core.js:1316 nennt λ = 1,2 + 2·v̂. Der Code rechnet 1,4 + v̂.
- **Widerspruch Kommentar ↔ Code:** „der Deckel schneidet nie die Gruppe“ (kreatur-leben.js:1885–1886) gilt nur für den Wurf. `_bestandVerkoerpern` schneidet je Tier.

## 4. Ein Gesetz (Kandidat)
**Satz:** Jedes Glied jedes Teils eines Tiers bewegt sich als Funktion der Phase seines Vorderfußes, und die Herde teilt EINE Tätigkeit und EIN Ziel. Je Tier zufällig sind nur die Phasen-Lage und die Zeitpunkte des Sicherns.

**Größen:** L (Hüfthöhe, m) · M (Masse, kg) · g · v (m/s) · Tätigkeit z der Gruppe (ruhen/äsen/ziehen/fliehen) · Rang und Alter im Verband.

**Was daraus folgt:**
- Gangart, λ und f aus Fr.
- Kopf-Nicken bei 2·f.
- Rumpf-Hub und Rumpf-Biegung aus der Gangart statt aus dem Gemüt.
- Wende-Grenze a ≤ 1 g.
- Kopfhöhe aus z.
- Kalb-Abstand aus dem Alter.
- Die Pose jedes Satz-Tiers aus (Phase, z), nicht aus „joy“.

## 5. Spike vor dem Bau (Soll steht vor der Rechnung)
1. **Köpfe im Bild:** Herde 7 Hirsche, feste Kamera 40 m, z = äsen.
   - Soll: 7 von 7 Tieren ≥ 200 px und Anteil Kopf unten ≥ 0,4.
   - Messung: `zerlege-linse` px-Zählung plus Kopfhöhe über der Schulter je Tier.
2. **Kopf-Spektrum:** Hirsch im Schritt bei v̂ 0,34.
   - Soll: Gipfel der Kopfhöhe bei 2·f_Schritt ± 10 % und Amplitude 2–5 cm.
   - Messung: FFT der Weltlage des Kopf-Knotens über 10 Zyklen.
3. **Pose-Sprung:** Stehen → Gehen → Äsen → Flucht.
   - Soll: max |Δ| je Takt aller Profil-Winkel ≤ 0,05 rad.
   - Messung: Differenz headX, tailAmp, ear und Schwanzphase je Takt.
4. **Wende:** Hirsch im Sprint bei 9 m/s.
   - Soll: Querbeschleunigung ≤ 9,8 m/s², also r ≥ 8 m.
   - Messung: Krümmung der Wurzel-Spur gegen v.
5. **Wolf im Zug:**
   - Soll: Gangart Trab, v = 1,9–2,8 m/s, Diagonal-Versatz ≤ 0,05 Zyklen.
   - Messung: Fußfolge plus Tempo der Wurzel, `gate:tier-gang`-Schema.

## 6. Die isolierte Bühne
**Was es gibt:**
- Labor worlds/tetrapoda: EIN Tier, ohne Weltgrund, ohne Äsen, ohne Gruppe.
- `gate:kreatur-takt` Bühne `herde`: 5 Hirsche aus dem echten `_kreaturWurf` (kreatur-proben.cjs:926–996). Sichtbar mit `--werkbank <port>`, aber ohne Bild-Ausgang. Kamera am Spieler 140 m vor der Herde (:224–230).

**Was fehlt:**
- Eine Station mit Tieren in stationen.json.
- Eine feste Kamera relativ zur Herde.
- Ein erzwungener Ablauf der Zustände Stehen → Äsen → Ziehen → Flucht.
- Ein Schuss in Bewegung: `werkbank bild` hält die Tiere fest (werkbank.cjs:975).
- Ein Kontaktbogen.
- Ein Urteil am Bild.
- 8–12 Tiere in EINEM Verband: der Kern deckelt bei 7 (tetrapoda-core.js:282).

**Der kleinste Bau (aus dem Welt-Motor, kein Zwilling):**
- Die Bühne `herde` von gate:kreatur-takt bekommt eine Kamera `kamera.H`, fest bei 40 m quer zur Anker-Achse in 1,6 m Höhe (Muster `kamera.A` in s2-hang30).
- Dazu ein Zustands-Fahrplan z = stehen / äsen / ziehen / flucht, je 8 s, gesetzt am Leittier und damit über `verbandZug` am Verband.
- Dazu ein Ausgang: 4 × 3 Bilder bei echter GPU, `__halten` nur für Wetter und Uhr, nicht für Tiere.
- Ein Befehl: `werkbank lauf --buehne herde --kontakt` mit Wurf 7.
- Für 12 Tiere braucht es den Wurf-Deckel aus dem Kern, keine Sonderzahl in der Probe.
- Die Bühne zeigt `nahLeiber` 4 ehrlich als Lücke 1.

## 7. Ungelesen / unsicher
- Die Bewegung des Fern-Satzes jenseits 64 m und die Horizont-Zahlen (`_satzHorizont`, `_leibSatzStufe`, studio-glieder.js:530–543).
- `_kreaturVerbandGlieder` (zählen ungezeichnete Glieder?) und `_kreaturLeibImBlick`.
- `tierPose` jenseits Zeile 3222 außer den zitierten Stellen; Augen und Lider.
- Welches Profil im ruhigen Ziehen fährt, und das Tempo des Zustands „ziehen“.
- Heutige Mess-Zahlen: Stand-Schlupf (nur Kommentare 0,033–0,062) und Nachbar-Abstand p10/p50.
- Wie viele Tiere im Spiel tatsächlich im Bild stehen: nie gemessen; der Gau-Commit 3440aa6900 sagt selbst „Bild und Kosten im Spiel … ungefahren“.
- Die Bühnen schwarm/abstand/tiersatz (kreatur-proben.cjs:1120, :1619, :2561) und `gate:kreatur-takt` am Hang.
- Die Natur-Zahlen mit dem Etikett „ungeprüft“ in der NATUR-Tafel sind Bänder aus dem Gedächtnis, nicht nachgeschlagen.
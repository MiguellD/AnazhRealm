**GANG der Tiere: Befund im Baum leben-leser (a946501198)**

(1) Die Kette vom Tempo zum Rumpf
- Tempo: Der Leib nimmt seine Geschwindigkeit aus der eigenen Lageänderung (`lageTempo`, tetrapoda-core.js:3036, Grenze vMax 15 m/s bei :1345). Gemessen wird in tierPose (:3209–3214), geglättet mit 8/s in `gangWahl` (:3044–3046). Das Steuer-Gesetz (:1611–1619) liefert v = tempo·√(g·L): Schlendern 0,45, Flucht 1,6, Sprint 3,0 in Froude-Einheiten.
- L ist die Hüfthöhe der Gestalt in m, `beinL` (koerper-leib.js:2513), mal Körpergröße (tetrapoda-core.js:3218). v̂ = v/√(g·L) (:1411).
- Gangart: `gangArt` (:1382–1389) mit Fr = v̂² und den Schwellen froudeTrab 0,5 und froudeGalopp 2,5 (:1369–1370), Hysterese ±20 % (:1379).
- Schrittlänge λ = L·(1,4 + 1,0·v̂) in m je Zyklus (:1414, :1329–1330). Deckel: λmax = 2L·tan(maxWinkel 0,42 rad)/tast (:1413, :1433), im Galopp bis winkelLauf 0,48 rad (:1427).
- Frequenz ω = 2π·v/λ in rad/s, Fußweg S = tast·λ in m (:1436).
- Tastgrad: 0,65 im Schritt, 0,5 im Trab, 0,3 im Galopp (:1335–1336, :1353), gleitend über smoothstep (:1419–1430).
- Phasen je Bein: `cpgStep`, Kuramoto-Kopplung 0,3 auf die Versätze der Folge (:2995–3004, :1371–1373, :1375).
- Fußziel je Phase: `gangFussFlach` (:1497–1514). Im Stand läuft der Fuß linear von +S/2 nach −S/2. Im Schwung folgt er einer Hermite-Kurve, gehoben um sin^0,5 × hub 0,12 × h (:1338, :1342, :3565).
- Fuß in der Welt: weltfester Anker, Halt beim Landen ab 0,85 des Wegs, „Tritt“ in 0,25 s (:3398–3508).
- Rumpf (:3509–3546):
  - Er senkt sich lotrecht, bis jede Pfote reicht (höchstens h/3, Glättung 6/s).
  - Rollen = sin(Takt)·sway·Schritt-Anteil, Nicken = bodyX + sin(Takt)·bob (:3262–3292). bob ist eine Drehung, keine Höhe.
  - Ein Ruck beim Aufsetzen: −0,012·tension rad, klingt mit 14/s ab (:3299–3311).
  - Die Hang-Neigung sitzt am Wurzelknoten, gedeckelt auf ±0,6 rad (koerper-leib.js:533–538).
  - Becken-Hub kennen die Tiere nicht: `gangBecken` sagt „die Tiere lesen es nicht“ (:1520). Ein Rückenglied gibt es in tierPose nicht. Der Galopp hat weder Rumpfbiegung noch Schwebe-Hub.

(2) Gangarten
- Es gibt schritt (lateral), trab, galopp (Dreh-Galopp) und paddeln (:1371–1374). „stand“ gilt unter 0,05 m/s (:1344, :1408–1409).
- Entschieden wird an einer einzigen Stelle: `gangArt` in `gangSchritt` (:1435). Leib und Satz rufen dieselbe `gangWahl` (:3044; Satz in kreatur-leben.js:3280).
- Im Wasser setzt der Zustand „schwimmen“ die Paddelfolge (:3221).

(3) Was den Fuß am Boden hält
- Planare IK mit zwei Knochen plus Abspreizen (:3570–3628). Der Boden unter jeder Pfote kommt von `_kreaturFussBoden` → `_fussBoden` (koerper-leib.js:2415–2420).
- Die Sohle legt sich auf die Normale aus `W.kipp` = `_gaitSohlenKipp` (:3499–3507, :3664–3670).
- Am Ende der Beinreichweite hebt der Fuß früher ab (:3597–3611).
- Ein gehaltener Fuß wird nicht geglättet, ein freier mit legA = 1 − exp(−max(18, 55·kpMul)·6·dt) (:3333, :3643–3655).
- Schlupf-Soll: ≤ 0,05 (Weg des stehenden Fußes / Weg des Leibs), diag-tier-gang.cjs:30.
- Schlupf-Zahlen, wie sie in Code-Kommentaren stehen (den heutigen Lauf habe ich nicht gelesen):

| Fall | Schlupf | Quelle |
|---|---|---|
| Satz Wolf im Schritt, 32 Phasen | 0,033 (mit 16 Phasen 0,054) | kreatur-leben.js:3886–3887 |
| Stand-Schlupf am Querhang | 0,03 → 0,06 bei fester Kopplung | tetrapoda-core.js:1365–1366 |
| Bär im Galopp, Halten bis zur Streckung | 0,062 | :3595 |

- Der Satz backt seinen Gang auf ebenem Grund (`_tierSatzBacken`, kreatur-leben.js:3186–3190). Er kennt keine IK am Hang. Schräg steht nur die Instanz-Matrix (:3050).

(4) Kopf, Hals, Ohr, Schwanz (nur im Leib)
- **Kopf:** headX des Profils + 0,04·sin(t·1,7), dazu headY und ein Scan-Pendel sin(t·1,3)·kopfSweep (:3674–3679). Die 0,04-Welle hängt nicht am Schritt: kein Nicken im Takt der Beine.
- **Hals:** tierPose schreibt kein Halsglied (Grep auf T.neck und T.hals: 0 Treffer). Starr.
- **Ohren:** rotation.z = ±P.ear, ein fester Wert je Profil (:3313–3315). Kein Zucken, kein Drehen nach einer Quelle. Starr.
- **Schwanz:** je Segment sin(t·tailRate − i·0,5)·tailAmp, nur um Y (:3680–3683). t ist die absolute Kreatur-Uhr.
- **Augen und Lider:** ungelesen.
- **Profil:** Alle Arten lesen die Bewegungsprofile des Rezepts „wolf“ (MOTION_HOST_RECIPE, koerper-leib.js:3399, :2837–2843). Wer sich bewegt, bekommt immer „joy“ (:3406–3409): der Hirsch geht mit tailRate 5,5 rad/s und tailAmp 0,38 rad (tetrapoda-core.js:71).

(5) Übergänge
- Einen Zustandsautomaten mit Blend für den Oberkörper gibt es nicht. P wird je Takt gewählt (koerper-leib.js:2384–2388) und direkt gesetzt (tetrapoda-core.js:3264, :3292, :3313, :3676, :3680).
- **Stehen ↔ Gehen:** Das Profil schaltet bei steuer.v > 0.1 m/s (kreatur-verhalten.js:3630) von idle auf joy. Im selben Takt springen:
  - headX von −0,01 auf 0,04
  - ear von 0,15 auf 0,05
  - tailAmp von 0,10 auf 0,38
  - tailRate von 0,5 auf 5,5, und weil t absolut ist, springt damit auch die Schwanzphase (abgeleitet aus :3683, nicht gemessen)
- Weich laufen dagegen: Beine (Gang-Gesetz und cpg), Rollen und Federn über g.schritt mit 4/s (:3239).
- **Äsen:** Die Aktion grasen setzt headX 0,95 in einem Takt (:111, :3179–3185) und fällt bei ihrem Ende ebenso (:3176–3178).
- **Ruhen:** bodyX 0,05, headX 0,2 (:114). Das Tier legt sich nicht; die Beine bleiben in der Stand-IK.
- **Flucht:** Zustand flucht → Profil flee ohne Blend (koerper-leib.js:3418). Der Gangwechsel ist weich, mit Hysterese, und der Takt des Leibs zieht binnen eines Schritts nach (:3250–3260).
- Ein Gewichts-Blend existiert nur im Satz (`leibGangBlend`, Rampe 0,25–0,55 m/s, k = 10; koerper-core.js:6895–6904) und als LOD-Fade.

(6) LOD der Bewegung
- **Leib nur für die 4 bedeutendsten Tiere** im Nah-Kreis (`KREATUR_SATZ.nahLeiber` 4, kreatur-leben.js:3891; Wahl :2978–2995). Nur sie haben Pfoten-IK, Kopf- und Ohrprofil, Äsen und Aktionen.
- **Alle anderen gehen im Satz** (:2984–2991):
  - 32 gebackene Posen je Band, gebacken bei Fr 0,25 · 1,5 · 4 (:3890–3895).
  - Die gebackene Pose lebt in Profil „joy“ ohne Stimmung (:3190).
  - Wer steht, zeigt die neutrale Stand-Pose; der Stand-Index ist bei Tieren 0 (stoff-gang.js:282–286, Aufruf kreatur-leben.js:3051). Kein Äsen, kein Kopfsenken, kein Profilwechsel.
  - Die Schwanzphase ist nicht an den Zyklus gebunden: bei jedem Umlauf entsteht eine Naht, außer 5,5·T ist ein Vielfaches von 2π (abgeleitet aus :3207–3220 und tetrapoda-core.js:3683).
- **Nah-Grenze:** 64 m (`ANALOG_NAH_M`, kreatur-leben.js:3869; `_feldTraegt`, vegetation-streu.js:1903). Jenseits davon liegt die Fernform „gesetz“ (Glieder-Kapseln, tetrapoda-core.js:53). Deren Bewegung: ungelesen.
- **Raten-Leiter des Leibs** (`_creatureAnimDiv`, kreatur-verhalten.js:2587–2597), mit ab = 35 m × Größe (tetrapoda-core.js:46):
  - unter 0,5·ab jeden Takt, ab 0,5·ab jeden 2., ab 0,75·ab jeden 4.
  - jenseits ab nur Läufer, die im Blick sind, jeden 8.; wer dort steht, friert in der neutralen Stand-Pose ein (:3648–3652)
  - nie gröber als ein Viertel des Gangtakts (:2594–2595)
  - Fade linear 1 → 0 zwischen 0,85·ab und ab (:2623–2629)

(7) Feste Zahlen ohne Herkunft
- **MOTION-Tafel, alle Felder** (freq, bodyX/Z, headX, ear, tailAmp, tailRate, tension, bob, sway, kpMul): tetrapoda-core.js:70–80, Herkunft nur „byte-treu Lab Z.130–135“.
- **Aktionsprofile:** grasen headX 0,95 (die Begründung ist das Augenmaß „Maul 23° über dem Boden“), ruhen, fressen, Dauer 6/16/4 s (:111–114).
- **Kopf und Scan:** Kopfwelle 0,04·sin(t·1,7) (:3676); Scan sin(t·1,3) (:3276); Schüttelrate ersatzweise 10 (:3271).
- **Schwanz:** Phasenversatz 0,5 je Segment, Rate mindestens 0,4, Amplitude ersatzweise 0,1 (:3680–3683).
- **Stand-Unruhe:** 0,004·sin(2,5t + 1,7i) + 0,003·sin(1,3t + 2,3i); Gewichte 0,5/0,3/0,2; Gewichtsverlagerung 0,025/0,3/0,2 (:3631–3636).
- **Aufsetzer:** Ruck −0,012, Abklingen 14/s, Schwellen 0,05/0,15 (:3301–3305).
- **Blends und Glättungen:** Schritt-Anteil 4/s ab S > 0,002 m (:3239); legA 18 / 55 / ×6 (:3333); Bisshaltung 18/s (:3283); Senke h/3, 0,98·Glied, 6/s (:3526–3532); `gangWahl` 8/s, dt höchstens 0,1 (:3046).
- **Fußhalt:** LANDUNG 0,85 (:3340); Tritt 0,25 s und Auslöser 0,15·h (:3431, :3444).
- **GANG_GESETZ:** maxWinkel 0,42, hub 0,12, falte 0,6, winkelLauf 0,48 (:1337–1354). Ohne Quelle sind maxWinkel, hub und falte; hubForm 0,5 ist nur am Gate gemessen.
- **Stamm:** walkPhase dt·5,0 (kreatur-verhalten.js:3631); „läuft“ ab 0,2 / bis 0,1 m/s, Glättung 6/s (:2611–2616); Leiter-Bänder 0,5/0,75, Fade-Saum 0,85 (:2590, :2625); einschwingen 150 (kreatur-leben.js:3895); GANG_DECKEL_RAD 0,6 (koerper-leib.js:536).

**Isoliert geprüft — was die Proben messen**
- **gate:tier-gang** (diag-tier-gang.cjs):
  - Was es misst: Schlupf, Gangart und Tastgrad.
  - Unter welchen Bedingungen: ein einzelnes Tier, geradeaus, konstantes Tempo, ebener Grund (LAUF :89–153), v̂ 0,3 / 0,74 / 1,2 / 3,5. Dazu Kreuzprobe Stimmung × Tempo (:570–575), Läufe bei 30 fps und Satz-Läufe (:693–698).
  - In der Probe steht der Hirsch als Seele „wesen“ (:565).
  - Es misst nicht: Kopf, Hals, Ohr, Schwanz, Posensprünge bei Profil- oder Aktionswechsel, Anfahren und Bremsen, Kurven, Hang (der liegt in gate:kreatur-takt, ungelesen) und die Pose stehender Satz-Tiere.
- **Probe „herde“** (kreatur-proben.cjs:2880–2905): misst Verband, Ausrichtung, Enge und Alarm, nie die Güte der Bewegung.
- **Probe `satzGang`** (:286–319): misst nur den Schlupf der Füße im Satz.

**Kopfzahl:** 31 Köpfe in 4 Herden aus dem Gau, headless gemessen mit Kappe 60 (Commit 3440aa6900). Davon tragen höchstens 4 die volle Bewegung (kreatur-leben.js:3891). Wie viele davon im Spiel im Bild stehen: ungelesen.
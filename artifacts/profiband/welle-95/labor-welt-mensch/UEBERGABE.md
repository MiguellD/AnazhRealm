K45-2 labor-welt-mensch — Uebergabe (14.10.)

Zweig labor-welt-mensch von integ-probe 51cc19af. Worktree C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\labor-welt-mensch,
Ports 8910-8919, Scratch C:\Users\micha\AppData\Local\Temp\claude\labor-welt-mensch\. Basis-Worktree (detached 51cc19af, node_modules
als Junction): .claude\worktrees\lwm-basis — nur fuer Vorher-Bilder (git worktree remove --force, Junction zuerst loesen).

Commits: 0fa9d4fa Kleid-Gewichte im Ofen (__stoffErbtHaut — gilt nur noch dem Poncho) · 43a5c5cc Labor baut ueber
BAKERS_BY_KIND.koerper · d57180f6 Der Stoff aus der Haut (__stoffAusHaut, kleidZonen dicke, Shorts + Gelenk-Kugeln sind Leib) ·
8d16649d Linse H4 ohne Ausnahme · ce42aa54 Der Kragen sitzt (Fuell-Teile nach naechstem Namen, neckBase nicht im Stoff) ·
e8bbc1c5 Beweis-Bilder · 2a8fb81b Die Grobstufe traegt den Umriss (L1-Stoff +0,015: gate:kreatur-kosten DECKUNG mensch
IoU min 0,940 -> 0,947, Basis 0,949) [ci voll].

Zahlen (Rohdateien hier):
- Labor L0 332 645 -> 39 996 Dreiecke (Radeon, alt-/neu-zaehlung.json; Welt-Zeile 40 000), L1 13 997 (Zeile 14 000)
- Bytes Labor = Ofen: L0 e7b86a20 im Browser (neu-zaehlung.json) == node (naht-nachher.json); L1 nach 2a8fb81b 3a500c6d (node)
- Haut aus dem Stoff, 7 ROM-Posen, L0 (ofen-naht.cjs, naht-vorher/nachher.json): 1 749 -> 26 (L1 792 -> 2, Pullover 1 699 -> 29)
- Albedo Haut Labor/Welt (Radeon, albedo-labor-koerperstudio.json): 4,42 -> 0,99 (Labor-Y 0,2411 -> 0,0542, Welt 0,0546)
- leibV 5,10 -> 5,76 (das Becken war kein Leib; Masse des Menschen +13 %)
- Linse gate:studio-huelle H4: Basis ROT 3x am koerperstudio (linse-vorher-basis.txt), jetzt GRUEN (linse-nachher.txt), Selbsttest +2
- Gates lokal gruen: ofen-contract (Vertrags-Akt), check:statik, playtest:fast 22/22, tier-gang Studio, kamera-laub ninja (NP-03 0/48),
  portal-konformanz, studio-uebergabe, altlasten
Bilder: tafel-mensch-labor-alt-neu-welt.png (Armlaenge alt/neu/Welt vorher/nachher), alt-/neu-armlaenge.png, alt-/neu-labor.png,
  neu-fern.png (L1), welt-vorher-/welt-nachher-armlaenge.png

CI: 38561062762 (Kopf 2a8fb81b) 12/13, rot nur voll 2/11 Pruefbuehne S0 (Glut-Probe K11b blind, 26,3 Grad) — das stand schon am
Basis-Kopf 51cc19af so (integ-probe CI 38551540510, lokal pb-basis.txt 25,7 Grad), nicht vom Menschen (Spieler-Leib ausgeblendet:
26,1 statt 26,6, pb-neu2 — Versuch 0bef1ec4 zurueckgenommen in 9934467a); integ-probe heilt es in c8196cd1, gemergt in 87992733.
CI 38565624653 (Kopf 87992733, voll): 13/13 — voll 1/11 (Gelaende-Linse, Kosten-Ebene am Takt) und voll 2/11 (S0-Frist 170 s)
rissen am Laeufer-Takt und liefen in der Wiederholung gruen. Danach nur Artefakt-Commits [skip ci]: der Code des Kopfes = 87992733.

Offen:
- Albedo-Tafel Nachzug Zeile haut: die Labor-Seite misst 0,0542 (Radeon), die Welt-Seite maß in werkbank albedo --tafel stumm
  (Spieler-Exemplar, albedo-welt.json) — Nachzug (--nachziehen) mit einer Welt-Messung, die das Exemplar sieht
- Saum am Aermel leicht gezackt (Regions-Grenze), Bauch-Falte der Haut zeichnet sich im Hemd ab; Haar „mittel" als Straehnen-Fleck
  (Welt = Labor, nicht Teil der Karte)
- Voller Playtest je Merge (Integrator), Versions-Buster ?v= beim Versions-Schritt

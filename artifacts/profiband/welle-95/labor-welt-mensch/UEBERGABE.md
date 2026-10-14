K45-2 labor-welt-mensch — Uebergabe (14.10., laufend)

Zweig labor-welt-mensch von integ-probe 51cc19af. Worktree C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\labor-welt-mensch,
Ports 8910-8919, Scratch C:\Users\micha\AppData\Local\Temp\claude\labor-welt-mensch\. Basis-Worktree (detached 51cc19af, node_modules
als Junction): .claude\worktrees\lwm-basis — nur fuer Vorher-Bilder, danach entfernen (git worktree remove --force).

Commits (alle gepusht):
- 0fa9d4fa Kleid-Gewichte im Ofen (__stoffErbtHaut, kleidZonen erbt) — gilt seit d57180f6 nur noch fuer den Poncho (Drape)
- 43a5c5cc WIP Labor = Welt: koerperstudio baut ueber BAKERS_BY_KIND.koerper (L0/L1, ein Knochen-Baum), eigener Leib faellt
- d57180f6 Der Stoff aus der Haut: foundry-core __stoffAusHaut (Lab _garmentFromSkin), kleidZonen dicke (0,032/0,024/0,012
  Unterhose), Shorts + Gelenk-Kugeln sind Leib; Vertrags-Akt ofen (16 Mensch-Schluessel neu, 3 fallen, 448 gleich, Ratsche 461)
- 8d16649d Linse gate:studio-huelle H4 ohne Ausnahme (vorher ROT 3x am Basis-Kopf, linse-vorher-basis.txt)

Zahlen:
- Labor L0 332 645 -> 39 994 Dreiecke (swiftshader-Zaehlung, Kosten-Leiste), L1 13 997; Bytes Labor = Ofen (sha L0/L1 im Browser
  == node ofen-naht.cjs; d82690ee / ca8e9db9)
- Haut aus dem Stoff in 7 ROM-Posen (ofen-naht.cjs, naht-vorher/nachher.json): L0 1 749 -> 26, L1 792 -> 2
- leibV 5,10 -> 5,76 (das Becken war kein Leib — beeinflusst die Masse des Menschen)

Offen (Stand dieser Datei):
- Radeon-Bilder: labor-mensch.cjs alt (--alt Scratch/alt) + neu, welt-mensch.sh nachher; Tafel alt/neu/Welt
- Albedo-Tafel Zeile haut: Labor-Seite liest jetzt den Ofen-Stoff (stoff kind haut), Ist neu messen (--labor --echt --nur koerperstudio)
- Gates: tier-gang (Studio), kamera-laub ninja (NP-03), portal-konformanz liefen im Hintergrund; voller Playtest; Push [ci voll], CI 13/13
- Bekannt: Saum am Aermel leicht gezackt (Regions-Grenze), Haar mittel als Strähnen-Fleck (Welt = Labor, nicht Teil der Karte)

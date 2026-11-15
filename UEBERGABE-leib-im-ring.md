# Übergabe w28-leib-im-ring (Etappe 1, 16.11.) — der Spike steht als Code, GEMESSEN IST NICHTS

Stand: `_bewohnerGeburt` stellt nur noch den STAND (Hülle `b.leib` = leere Gruppe + Zahlen `bauZu`, `beinMass`, `beinL`, `tempo`).
Den Leib zieht `_bewohnerLeibAn(S, b)` in die Hülle (Kinder + `userData` des Mensch-Baus, `_leibTeile` merkt die Namen),
`_bewohnerLeibAb(b)` nimmt ihn (über `_disposeSoulGroup`). Leib-Träger: der Erste je Gestalt (misst `G.mass`, backt: `_bewohnerBackt`,
frei, sobald Satz + Lagen + Glieder der Gattung stehen), die Nah-Wahl (≤ `geburtenJeTakt`, sonst trägt der Satz weiter), der Fahrer im
gezeichneten Wagen (`_verkehrSitz`). Rückgabe im Takt: jenseits `nahM + nahHystM + ringHystM` (12 m) oder über `ringLeiber` (6).

Leser umgestellt: Gang ohne Leib `_gaitTakt(L, …)` (koerper-leib, `_gaitTick` ruft ihn; `_bewohnerGangSchritt` liest `b.beinMass.L`) ·
Feld: `_kreaturGliederBacken` nimmt für Bewohner den Anker aus der Lage der Gestalt (`_bewohnerFeldAnker`), `_kzLeib` schreibt ihre
Glieder nur über `_bewohnerFeldLage` (auch der schwindende Satz) · `_gattungGlieder` bestellt nie an einem Stand ohne Leib ·
`_bewohnerRuhig`: wer einen Leib trägt, ruht nicht · Takt der Gehenden: `_bewohnerGelenkAb` (Zeile der Gestalt) · Arme: `b.armeOffen`.
`o.leute` (dirigent-takt:702) unverändert: die Hülle zählt als geboren, das Tempo der Geburten ist dasselbe (2 je Takt).

Geprüft: `node --check`, `diag-atlas --check` GRÜN (7 neue Glieder in der Modul-Karte), prettier, eslint 0, `playtest:fast` 21/0.
NICHT gelaufen: `npm run check`, voller Playtest, jede Welt mit Bild. Kein GPU-Lauf verbraucht (0 von 6).

Als Nächstes (S1-Messung, EIN Hintergrund-Lauf unter dem Schloss): `artifacts/profiband/werkzeug/gpu-lauf.sh <name> <befehl>` im
Haupt-Klon hält das Schloss um genau einen Befehl. Der Befehl muss in EINER Welt: eigener save-server aus DIESEM Baum (die Werkbank
`--echt` liest `--seite http://localhost:<port>`, Vorgabe :4312 gehört dem Haupt-Klon), `werkbank start --echt --port <p>`,
`umstellen` an den Dorfplatz (Pose: Stand −65,9/−173, Platz −53,5/−173, Uhr 0,3333, Third), `eval` und `stop`. Zu zählen je Siedlung:
Bewohner mit `leib.userData.rig` (Soll ≤ 6 + Backende), SkinnedMesh/Skelette/Objekte unter den Hüllen, `satzOrt`-Instanzen und
`_kzGlieder`-Felder (vorher ↔ nachher gleich), `r._weltOffen().leute` → 0, `b.beinMass.L` gegen `_gaitBeinMass` am Leib (≤ 1e-9), Heap.
Vorher-Zahlen (main 3e4f99cd): 454,2 MB · 952 Skelette · 4 879 Objekte · 77 Leiber. `--echt` öffnet ein Fenster (1940×1200): prüfen, dass
es dem Schöpfer nicht die Maus nimmt; `bringToFront` steht in werkbank.cjs:1919/3032/3046 (welche Befehle, ist ungelesen).

Offen für S2: `scripts/` (21 Proben lesen `.leib`, wer `userData.rig`/`_tierBaum`/`traverse` am Bewohner liest, bricht) ·
`gate:kreatur-takt bewohner` (Wiederkehr ±2 m: `beinMass` ist jetzt Gesetz statt Messung am Rig, Abweichung ungemessen) ·
doppelte `_bewohnerFeldLage`-Rufe nach `_kzLeib` (siedlung-bewohner :1625-Gegend, :2071-Gegend) fallen · `_bewohnerKopf`/`:1637 u._gelenk.hyst`
nur für Nahe (gelesen, ungeprüft im Lauf) · Bild-Spitze je Leib-Geburt im Gang (ms ungemessen; entscheidet, ob 2 je Takt hält) ·
Ringmaße `ringHystM` 3 / `ringLeiber` 6 sind gesetzt, nicht gemessen · die Übergabe-Datei fällt mit der Abgabe.

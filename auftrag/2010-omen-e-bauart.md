# Auftrag 20.10. (Koordinator) — OMEN als MACHER nach b-blick: E-Bauart, die Diät hört statt fragt

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Reihenfolge: b-blick fertig (Prüfbühne S0, Kopf [ci voll], Bericht),
dann dieser Auftrag. main = integ-Basis `5768586a` (V18.546.26).

PFLICHT E (docs/PFLICHT-OFFEN.md): CPU-Takt p95 ≤ 5,8 ms an Genesis Third, GTX, Regler voll — dein Bündel-ABAB heute: 6,0 → 6,3, keine
Seite hält. Der größte Posten (deine Profile 19.10./20.10.): `_diaetRefresh` inklusiv 2,0 ms je Frame (30 % des Takts), darin
`_diaetGeteiltSchreiben` 1,1–1,2 ms und `_diaetObjektGang` 0,3 ms; daneben `_renderBundles` 1,36 · `renderShadow` 0,61 · `_passSicht` 0,54 ·
`scene.onBeforeRender` 0,50 ms. Die E-Diät (783fcdc1/aa709f30, Radeon) war Pull-Buchhaltung: ~85 Prüfungen und ~68 Gänge je Frame,
die Prüfung je Objekt kostet so viel wie ihr Ergebnis (Prototypen mit Wert-Stempeln waren LANGSAMER). Ihr eigener Befund: „ein großer
Schnitt braucht eine andere Bauart — Änderungs-Meldung statt Prüfung je Objekt“.

WURZEL (Bauart, EIN Chokepoint): r184 fragt je Render-Objekt und Pass `needsRefresh`; unsere Hülle `_diaetRefresh` (stamm/bild-kosten.js)
prüft dann Lage, Verweise, Stoff, Gruppen. Die Änderungen sind an ihrer QUELLE bekannt: wer eine Matrix, eine Uniform, einen Stoff-Stand
oder eine geteilte Gruppe schreibt, weiß es. Baue die Meldung dorthin, wo geschrieben wird (EIN Register der Regung je Frame/Abschnitt),
und lass die Diät nur die Gemeldeten gehen; Ruhendes kostet null. Prüfe zuerst mit einem Spike (EIN Profil), welcher Anteil der 2,0 ms
Prüfung ist und welcher echtes Schreiben (geteilte Uniforms der Kamera je Pass sind echte Änderungen — die zählen nicht als Gewinn).
Ist das geteilte Schreiben (1,1 ms) der Hebel, gilt dieselbe Frage dort: EINE Gruppe je Abschnitt geschrieben, nie je Objekt.
Kein Zwilling, kein Flag, der Stoff-Bildfehler (13, `_diaetStoffVerpasst`) bleibt geheilt (gate:vendor-anker Stoff-Linse grün).

- Zweig `e-bauart` ab integ-probe (≥ 5768586a). Datei-Besitz: stamm/bild-kosten.js Diät-Methoden (`_diaetRefresh`, `_diaetGang`,
  `_diaetGeteiltSchreiben`, `_diaetObjektGang`) + die Schreiber, die melden. NICHT: `_configureRenderer` SCHATTEN-STOFF-Block und
  stoff-material `_materialObserverDiaet` (Radeon-Karte b-programme), Lade-Takt/dirigent-takt (dein b-blick).
- Linse in der Diät-Familie (scripts/lib/diaet-linse.cjs / `werkbank diaet`): Prüfungen je Frame im Stand ROT an der Basis (~85) beim
  Namen, am Kopf ≈ Zahl der echt Gemeldeten; Selbsttest: eine Regung ohne Meldung (gemuteter Melder) ist ROT (das Bild trüge den alten
  Wert); gate:kamera-treue (BILD, STAND, VERSCHACHTELT) grün.
- Beweis: GTX-ABAB 4+4 Genesis Third stehend + gehend, Wiese Ego gehend: CPU-Takt p95 und `_diaetRefresh` inklusiv vorher/nachher;
  Ziel CPU-Takt p95 ≤ 5,8 in 4/4 Boots. check + playtest:fast lokal, Zweig-Kopf `[ci voll]`, volle Zweig-CI grün, EIN Blick (Genesis Third).
Bericht `bericht/2010-e-bauart.md` (Schnitt · Zahl · offen), Nachricht „neue Datei + Zweig-Kopf + CPU-Takt p95 vorher→nachher“.

# Auftrag 0710-5 an den OMEN — Nachtrag zu fahren-2: der gestoßene Leib lebt im Sim-Schritt

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Schneide das auf `welle-m-impuls` (deinem laufenden Zweig,
er trägt fahren-2) — dieselbe STOSS-Klasse wie 0710-4; `welle-m-fahren` wird nicht einzeln gemergt, sondern `welle-m-impuls`.

Die unabhängige Gegenprüfung von `welle-m-fahren` 7f97d339 urteilt **merge-reif: nein**. Grün sind: Fahren (keine neue
Kletter-/Tunnel-Lücke an Mauer 0,3 m frontal/schräg/rückwärts, Box 1,5 m, echte Häuser; Hangfuß in 7 Varianten ≤ 0,098 m unter
dem Gesetz, Basis bis 1,23 m; Spalt: fällt und landet), STOSS als EIN Gesetz (Impulsrest 0, Energieverhältnis 0,545 = (1+e²)/2,
kein Wagen nach dem Stoß schneller), eingeklemmter Bär 0 Eindringen, Linsen vorher ROT mit Täter.

**ROT 1 — der gestoßene Leib geht durch Wände und hängt an der Bildrate** (`anazhRealm.js:21756–21768`): `updateCreatures`
bewegt den Leib je FRAME um `_stossV·delta` ohne Weg-Prüfung und ohne Deckel; `_kreaturHuellenKontakt` (`:20374ff`) löst erst
danach — liegt die Mitte schon hinter der Wandmitte, schiebt er ihn zur Rückseite hinaus. Der Wagen hat seit fahren-2 einen
Deckel je Schritt, der Leib nicht. Gemessen: Bär 3 m vor einer 0,35-m-Wand (Kern-Hülle eines Hauses), Wagen 13,7 m/s:
60 fps 0/10 durch, **30 fps 7/10**, gemischte Frames (8–33 ms) 4/10 — 30 fps ist genau die Profi-Band-Grenze. Echte GPU mit
30-fps-Frames: Bär landet 6,1 m hinter der Wand (Bild `kontext/pruefung-fahren/stoss-baer-tunnel.png`).
Zweites Symptom DERSELBEN Ursache (Lockstep): `_kreaturGeschw` (`:20349`) liest das je Frame gerechnete `_stossV` im festen
Sim-Schritt (`:90004`) → nach 200 Sim-Schritten steht der Wagen bei 60 fps gegen gemischte Frames 2,03 m auseinander
(Basis 0,03 m). Wagen–Wagen und Wagen–starr bleiben bitgleich.
**Wurzel-Schnitt:** der Stoß-Zustand eines Leibs (`_stossV` und sein Abklingen) lebt im FESTEN Sim-Schritt (Lehre 13: was einen
Körper bewegt, läuft im Sim-Schritt; Q1), nie im Frame-Takt; die Verschiebung je Schritt ist gedeckelt bzw. als Weg gegen die
EINE Hülle geprüft (swept: kein Sprung über eine Wand, die dünner ist als der Schritt-Weg) — dieselbe Regel wie der Deckel des
Wagens, an EINER Stelle. **Linse:** L5 läuft heute auf freier Gasse — neue Linse „gestoßener Leib vor dünner Wand" bei 30 fps,
gemischten Frames und 60 fps (0 Durchgänge in allen), dazu die Lockstep-Probe (Wagen-Position nach 200 Sim-Schritten
identisch für 60 fps und gemischte Frames) — beide vorher ROT.

**ROT 2 — leerer Playtest-Check:** `scripts/playtest.cjs:4351` übergibt noch `knockback: 8`, `damageCreature` liest nur noch
`opts.stoss` — der Check „V17.54 Kampf D: Knockback-Pfad läuft" (`:4395`) ist grün, ohne den Pfad zu berühren. Auf `opts.stoss`
umstellen, so dass er den echten Pfad prüft (vorher mit totem Feld = ROT im Selbsttest, falls einer existiert; sonst benennen).
Dazu der veraltete Kommentar `anazhRealm.js:19056–19057` (`opts.fromPos/knockback`).

**GELB (mitnehmen, wenn klein):** der stehende Wagen behält nach dem Klemm-Stoß ~0,5 s eine Scheinfahrt (11 → 1 m/s, Räder und
Tacho laufen weiter); der gestoßene Bär gleitet aufrecht über die Wiese statt zu taumeln (Bilder stoss-baer-nachher*.png) — eine
Stoß-Pose/Stolper-Phase aus dem Gang-Gesetz; die Kampf-Verstärkung `wucht` 6 ohne Gegenstoß für den Angreifer — benennen.
**Konflikt-Hinweis:** die LF-Familie kampf (hier) muss `opts.stoss` verwenden — ich gebe es ihr mit.
**Bericht:** `bericht/0710-5-stoss-im-sim-schritt.md` (oder zusammen mit 0710-4), Kopf `welle-m-impuls`.

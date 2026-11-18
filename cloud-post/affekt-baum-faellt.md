# affekt.K1#2 — „der Baum fällt nicht (0 Hiebe)“: Täter, Schnitt, Messung

ZWISCHENSTAND, Zweig `affekt-baum-faellt` von main b7ed8419.

**Geschnitten:** Die Ziel-Wahl der Linse `wertGang` liest jetzt das Gesetz der Sukzession (`_baumAlter` = 1, der gewachsene
Baum), und ihr Richter nennt ein stehendes Ziel mit Art, Alter und Fadenkreuz. Der Diff steht unten, denn das Register liegt im
Zweig `punkte-maschine` und nicht in diesem Zweig. Im Spiel ist nichts geschnitten: die Kette von der Eingabe bis zum Fall ist ganz.
**Gemessen:** Headless am Kopf b7ed8419 trägt der Third-Gang vorher wörtlich die Zeile der GTX (0 Hiebe) und nachher 8 Hiebe bis
zum Fall an der Birke −295/−1034,1 — dieselbe Ziel-Folge wie die GTX vor der Welt-Uhr (d39e0d6e); die Mutante nennt den Täter
(`baum_birke Alter 0.06`). **Offen:** Headless steht `pflegen` in allen drei Läufen mit δ 0 (die GTX am selben Stamm +0,25),
daher urteilt die ganze Station headless nicht GRÜN; der Blick am Gerät mit dem Diff steht aus.

## Der Täter

- **Die Linse** (Zweig `punkte-maschine` 1012ddf8, `meisterkarte-quelle/punkte/stationen/g2.js`): Zeile 687 wählt „den nächsten
  Baum“ ohne sein Alter, Zeile 691 zielt fest auf Grund + 1 m, Zeile 757 meldet den Fehler ohne Namen des Ziels.
- **Der Auslöser im Spiel, kein Fehler:** 799b3c99 „WIP w28-lava-nachlauf (b): EINE Prozess-Uhr“ (17.11. 21:02, in main über den
  Merge 9a9e64e5). Seitdem zählt `_weltTag` (`stamm/feld-leben.js:2604`, `_weltStunde` Zeile 2619) die Spielzeit
  (`tagNull + spielZeit / PEGEL_TAG_S`) und nicht mehr den Tag der Sicht. So altert die Fäll-Tat des Ego-Gangs mit der Spielzeit,
  die die Station selbst vorschiebt.
- **Der Ablauf:**
  - Der Ego-Gang fällt die Birke −280,2/−1030,4 mit 8 Hieben.
  - Die Gänge schieben rund 3 700 s Spielzeit vor (Pausen, Ruhe 1 800 s, Halt 1 800 s), also 24,6 Welt-Stunden.
  - Der Stubben treibt nach `_baumAlter` (`stamm/vegetation-wiese.js:2198`) an derselben Stelle seinen Jungwuchs: Alter 0,06,
    0,97 m hoch.
  - Der Third-Gang wählt ihn als nächsten Baum und zielt 1 m über Grund, also über seine Spitze hinweg.
  - Das Fadenkreuz trifft keinen Eintrag, und es bleibt bei 0 Hieben.
- **Seit wann:**
  - GTX d39e0d6e (17.11. 18:28) GRÜN, der Third-Gang fällt dort die Birke −295/−1034,1.
  - GTX 1f300260 und 18058dba ROT, der Third-Gang zielt auf −280,2/−1030,4.
  - Dazwischen liegt 799b3c99.
- **Gegenprobe im Spiel:** Gezielt auf den Leib des Jungwuchses (0,5 m über Grund) trifft der Pick ihn (`baum_birke`). Nach
  8 Hieben fällt er, Tat faellen δ −0,1199. Die Kette steht für den gewachsenen Baum und für den Jungwuchs.

## Die Kette (Stamm b7ed8419), je Glied ganz

1. **Eingabe:** der Fall „break“ in `_verbTaste` (`stamm/koerper-bewegung.js:2489`) ruft `tryMouseBreak`.
2. **Werkzeug:** `_implementProfile` (`stamm/kampf.js:1770`).
3. **Treffer-Suche:** `tryMouseBreak` (`stamm/kampf.js:2226`) ruft `_pickArchitectureAtCrosshair`
   (`stamm/werkstatt-bauen.js:684`, Strahl `_fadenkreuzStrahl`, 30 m, Filter `_durchsichtSteht`).
4. **Hieb zählt:** `harvestProgress` in `stamm/kampf.js:2019`.
5. **Fall:** `harvestArchitecture` (`stamm/werkstatt-bauen.js:731`) schreibt die Tat `faellen` (Zeile 777–781), weiter mit
   `_tatSchreiben` (`stamm/feld-leben.js:2626`).
6. **Nachwuchs:** `_baumAlter` am Stubben (`stamm/vegetation-wiese.js:2198`), gelesen von `stamm/vegetation-baum.js:1275`.

Gemessen reißt keines dieser Glieder. Der Riss liegt vor Glied 3, in der Wahl des Ziels.

## Die Stations-Zeile, vorher ↔ nachher wörtlich (headless, je frische Werkbank)

Vorher: die Register-Fassung 1012ddf8 wörtlich. Die Third-Zeile ist gleich der GTX 1f300260 und 18058dba
(`meisterkarte-quelle/punkte/messung/roh/1f300260-gtx/affekt.K1_2.out` im Zweig `punkte-maschine`).

```
WERT-GANG {"uhr":0.5,"sicht":"first","sonne":0.96,"baum":[-280.2,-1030.4],"faellen":{"hiebe":8,"op":"faellen","delta":-0.12,"ertrag":-0.12,"stimme":"vogel","db":-4.67,"s":0.25,"nachbar":0},"toeten":{"op":"toeten","delta":-0.03,"ertrag":-0.03,"stimme":"vogel","db":-1.16,"s":0.317,"nachbar":0},"pflegen":{"op":"deposit_life","delta":0,"ertrag":0,"stimme":"vogel","db":0,"s":0.483,"nachbar":0},"ruhe":{"op":"deposit_life","delta":0,"ertrag":0,"stimme":"vogel","db":0,"s":0.6,"nachbar":0}}
WERT-GANG {"uhr":0.92,"sicht":"third","sonne":-0.83,"baum":[-280.2,-1030.4],"fehler":"der Baum fällt nicht (0 Hiebe)"}
```

Mutante, der Selbsttest des Richters: die Linse mit dem Richter, aber ohne den Alters-Filter. Sie ist ROT und nennt den Täter.

```
WERT-GANG {"uhr":0.92,"sicht":"third","sonne":-0.83,"baum":[-280.2,-1030.4],"fehler":"der Baum fällt nicht (0 Hiebe; baum_birke Alter 0.06, Fadenkreuz kein Eintrag)"}
```

Nachher: die Linse mit dem Diff unten.

```
WERT-GANG {"uhr":0.5,"sicht":"first","sonne":0.96,"baum":[-280.2,-1030.4],"faellen":{"hiebe":8,"op":"faellen","delta":-0.12,"ertrag":-0.12,"stimme":"vogel","db":-4.67,"s":0.25,"nachbar":0},"toeten":{"op":"toeten","delta":-0.03,"ertrag":-0.03,"stimme":"vogel","db":-1.15,"s":0.35,"nachbar":0},"pflegen":{"op":"deposit_life","delta":0,"ertrag":0,"stimme":"vogel","db":0,"s":0.7,"nachbar":0},"ruhe":{"op":"deposit_life","delta":0,"ertrag":0,"stimme":"vogel","db":0,"s":0.567,"nachbar":0}}
WERT-GANG {"uhr":0.92,"sicht":"third","sonne":-0.83,"baum":[-295,-1034.1],"faellen":{"hiebe":8,"op":"faellen","delta":-0.12,"ertrag":-0.12,"stimme":"grille","db":-4.68,"s":0.233,"nachbar":0},"toeten":{"op":"toeten","delta":-0.03,"ertrag":-0.03,"stimme":"grille","db":-1.18,"s":0.167,"nachbar":0},"pflegen":{"op":"deposit_life","delta":0,"ertrag":0,"stimme":"grille","db":0,"s":0.517,"nachbar":0},"ruhe":{"op":"deposit_life","delta":0,"ertrag":0,"stimme":"grille","db":0,"s":0.5,"nachbar":0}}
```

**Hiebe bis zum Fall:**

| Gang | vorher | nachher |
|---|---|---|
| Ego (12 Uhr) | 8 | 8 |
| Third (22 Uhr) | 0 | 8 |

Die zehn Taten laufen vorher an −280,2/−1030,4 (dem Jungwuchs) und nachher an −292,2/−1060,8, wie bei der GTX d39e0d6e. In beiden
Läufen stehen 10 neue Taten.

**Was headless nicht GRÜN urteilt:** `pflegen` und `ruhe` stehen in allen drei Läufen mit δ 0, auch die zehn Taten, unabhängig
vom Schnitt. Am Gerät ist es anders:
- Die GTX am Stamm 18058dba und 1f300260 misst im Ego-Gang `pflegen` mit δ 0,25 und `ruhe` mit δ 0,2463.
- Kein Commit in 18058dba..b7ed8419 berührt `stamm/feld-sprache.js`, `stamm/feld-dsl.js` oder `stamm/feld-leben.js`.
- Der Leser ist `_tatWerten` (`stamm/feld-sprache.js:1231`): Ertrag = `_playerSituationWohl` am Ort nach der Tat minus vor
  der Tat. Er liest headless 0. Gegen den Schnitt ist das nicht gemessen.

**Der headless-Weg:**
- `scripts/werkbank.cjs` wird mit `start --ort wiese` gestartet.
- Ihr `/umstellen` taktet die Welt, sein Tor reißt headless: „DIE WELT STEHT NICHT nach 3724 Takten“, der GPU-Prozess von
  swiftshader stürzt ab.
- Deshalb setzt der Lauf `_fernbildDa` als Ersatz der Ankunft. Ohne ihn bleibt `_ankunftsFerne` bei 128, die Bäume der Wiese
  stehen ohne Mesh, und beide Gänge zeigen 0 Hiebe — ein Artefakt von headless, nicht die Ursache am Gerät.
- Dann läuft `wertGang` wörtlich in der Folge von `wertLauf`: Ego 12 Uhr, Third 22 Uhr, die zehn Taten.

## Der Schnitt: Diff für das Register (Zweig `punkte-maschine`)

```diff
Register im Zweig `punkte-maschine` 1012ddf8 (git apply liest ab der Kopfzeile)
diff --git a/meisterkarte-quelle/punkte/stationen/g2.js b/meisterkarte-quelle/punkte/stationen/g2.js
--- a/meisterkarte-quelle/punkte/stationen/g2.js
+++ b/meisterkarte-quelle/punkte/stationen/g2.js
@@ -684,7 +684,9 @@ function wertGang(r, T, o) {
     r.setTimeOfDay(o.uhr, "regler");
     r.setCameraMode(o.sicht);
     const um = st.symphony.umwelt;
-    const baum = (a) => /baum/.test(a._lodSpecies || a.type) && r._istNatur(a);
+    // der Baum ist der gewachsene Wurf des Walds (`_baumAlter` = 1, das Gesetz der Sukzession), nie der Jungwuchs am Stubben einer
+    // Fällung: seit der Welt-Uhr (799b3c99) treibt der Stubben des Ego-Gangs nach den 3 700 s Spielzeit der Gänge seinen Jungwuchs
+    const baum = (a) => /baum/.test(a._lodSpecies || a.type) && r._istNatur(a) && r._baumAlter(a.position.x, a.position.z) === 1;
     const ab = (a) => Math.hypot(a.position.x - o.x, a.position.z - o.z);
     const B = st.architectures.filter(baum).sort((a, b) => ab(a) - ab(b))[0];
     if (!B) return { fehler: "kein Baum nahe der Wiese" };
@@ -754,7 +756,12 @@ function wertGang(r, T, o) {
         if ((r._pickArchitectureAtCrosshair() || {}).entry === B) (r.tryMouseBreak(), hiebe++);
         else takt(1);
     }
-    if (st.architectures.includes(B)) return { ...aus, fehler: "der Baum fällt nicht (" + hiebe + " Hiebe)" };
+    // steht der Baum, nennt der Richter das Ziel beim Namen: seine Art, sein Alter am Ort (`_baumAlter`), was das Fadenkreuz trifft
+    if (st.architectures.includes(B)) {
+        const zeigt = r._pickArchitectureAtCrosshair();
+        const wen = B.type + " Alter " + r._baumAlter(B.position.x, B.position.z).toFixed(2) + ", Fadenkreuz " + (zeigt ? zeigt.entry.type : "kein Eintrag");
+        return { ...aus, fehler: "der Baum fällt nicht (" + hiebe + " Hiebe; " + wen + ")" };
+    }
     aus.faellen = { hiebe, ...tat(), ...antwort() };
     pause();
     st.maxCreatures = Math.max(st.maxCreatures || 0, st.creatures.length + 2);
```

Der Filter ist kein Zwilling: `_baumAlter` ist die EINE Quelle des Alters, aus der auch die Streu (`stamm/vegetation-streu.js:630`)
und der Wald (`stamm/vegetation-baum.js:1275`) lesen. Das Urteil der Station bleibt unverändert und wird nicht weicher: alle
Gänge, fällen und töten mit δ < 0, pflegen > 0, Tag und Nacht, beide Sichten.

**Die Klasse:**
- Das zweite Glied steht in main: `scripts/diag-stand-takt.cjs:614` mit der Wahl in Zeile 691–693 (`gate:stand-takt`, Modus
  `--tat`) hat denselben Filter und zielt ebenfalls fest auf 1 m.
- Dort ruht der Fehler. Seine Welt bootet frisch, mit `_tatIndex().n` = 0 gibt `_baumAlter` für jeden Baum 1 zurück
  (`stamm/vegetation-wiese.js:2200`), und die Wahl läuft einmal vor der ersten Fällung.
- Der Filter änderte dort kein Byte des Laufs. Deshalb ist dort kein Schnitt gesetzt.

## Die Tore (am Kopf, nacheinander)

| Tor | Urteil |
|---|---|
| `npm run check:statik` | EXIT 0, Befunde: keine |
| `npm run gate:betriebsgesetz` | EXIT 0, GRÜN am Baum ohne die Post-Datei. Die Wachstums-Wand braucht den Zweig `integ-probe`, er ist blobless geholt. |
| `npm run gate:betriebsgesetz` mit der Post-Datei im Index | ROT mit genau einer Verletzung: „ZITAT-WAND: cloud-post/affekt-baum-faellt.md fehlt in der EINEN Karte docs/README.md“ |
| `npm run gate:asset-contract` | EXIT 0, GRÜN (Goldens 128, byte-gleich 128) |
| `node --check` der geschnittenen Register-Fassung | EXIT 0 |
| Die Station selbst, headless | oben |

Zur ROT-Zeile mit der Post-Datei: Das ist die Abgabe-Datei selbst. Die Karte sagt, Berichte leben im Zweig `koordination`, nie in
main. Die Wand ist nicht weicher gemacht.

Weitere Tore der berührten Dateien gibt es nicht: in main ist keine Code-Datei berührt.

**Nicht gefahren:**
- `npm run check` als Ganzes: verboten.
- Der Lauf am Gerät (GTX, Radeon): er gehört dem Koordinator.
- Die Ursache von δ 0 bei `pflegen` headless: siehe oben, nicht Teil dieser Sprosse.

## Was der Koordinator am Gerät ansehen soll

- **Ort:** Mess-Wiese (Messort `wiese`), die Birke −280,2/−1030,4.
- **Vorher, im Register wie es liegt:**
  - 12 Uhr, Ego: stehen 2,2 m östlich (−278,0/−1030,4), das Fadenkreuz auf den Stamm 1 m über Grund, die linke Maustaste halten
    bis zum Fall (8 Hiebe).
  - Danach rund einen Welt-Tag Spielzeit (3 600 s); die Station tut das selbst.
  - 22 Uhr, Third, derselbe Stand: am Stubben steht der Jungwuchs der Birke, knapp 1 m hoch.
  - **Der Blick:** mit dem Fadenkreuz auf 1 m geht der Strahl über ihn hinweg; auf 0,5 m fällt er mit 8 Hieben.
- **Nachher, mit dem Diff:** der Third-Gang steht 2,2 m östlich der Birke −295/−1034,1 (−292,8/−1034,1) und fällt sie mit 8 Hieben.
  Die Zeile trägt `"baum":[-295,-1034.1]` und `"hiebe":8`.
- **Dazu:** `pflegen` im Ego-Gang am Gerät mit δ 0,25 bestätigt, dass δ 0 nur headless auftritt.

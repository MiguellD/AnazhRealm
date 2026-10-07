# Ergebnis welle6-vram

```json
{
  "branch": "welle6-vram (Worktree C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram, Basis basis-w6 7a63b9ed, Remote-Kopf dc03ffaf)",
  "commits": [
    {
      "sha": "5b67f787",
      "titel": "Die Puffer-Linse nennt jeden Geometrie-Puffer beim Halter: buf:? zerfaellt in szene, bild, ruhend, verwaist - Speicher ohne Bild ist ein Leck"
    },
    {
      "sha": "0e284142",
      "titel": "Die GPU haelt, was das Bild zeichnet: der GPU-Abschied, der Kehraus und die Leinwand ohne Tiefe - nach drei Wander-Schleifen 230,5 -> 168,0 MB VRAM"
    },
    {
      "sha": "c66e5b0f",
      "titel": "Die Kehraus-Marke liest den Lebenszeit-Zaehler ausserhalb des Takt-Taps: gate:render-tap war in der CI rot"
    },
    {
      "sha": "8e397c6a",
      "titel": "Die Render-Objekte gefallener Senken werden frei: r184s Geometrie-Hoerer und die Bindegruppen-Liste jeder Textur hielten sie fuer immer"
    },
    {
      "sha": "5c4e03f7",
      "titel": "Neun Gates nehmen ihren Port aus der Umgebung: die lokale CI faehrt jeden Schritt im eigenen Port-Bereich"
    },
    {
      "sha": "dc03ffaf",
      "titel": "Die VRAM-Ratsche zieht nach: gesamt 232,6 -> 148,7 MB gebunden, buf:? 94,4 -> 0, die Leinwand-Tiefe 7,9 -> 0, die Tiere sind auch im Speicher frei"
    }
  ],
  "diffStat": "22 files changed, 761 insertions(+), 113 deletions(-) — anazhRealm.js +217/-? (GPU-Abschied, Kehraus, Kehraus-Marke, Instanz-Abschied, Render-Objekt-Register, Leinwand ohne Tiefe), scripts/werkbank.cjs 153, scripts/lib/draw-zaehler.cjs 127, scripts/lib/band-urteil.cjs 101, scripts/diag-profiband.cjs 89, scripts/diag-freie-slots.cjs 72, scripts/diag-vendor-anker.cjs 32, spec/profiband/ratsche.json 27, scripts/diag-pipeline-constitution.cjs 9, CLAUDE.md 8 (Lehre 27), scripts/diag-altlasten.cjs 6, je 3 Zeilen Port-Env in diag-godray/render-tap/page-error/persistence/carve-adaptive/grass-thin/regler-sim/v1-resolve/weather-vector/look-physics/look-golden",
  "gates": [
    {
      "name": "node --check anazhRealm.js",
      "exit": "0"
    },
    {
      "name": "npx eslint anazhRealm.js",
      "exit": "0",
      "notiz": "0 Fehler, 4 vorbestehende Warnungen"
    },
    {
      "name": "npx prettier --check anazhRealm.js",
      "exit": "0"
    },
    {
      "name": "gate:altlasten (+ --selftest)",
      "exit": "0 / 0",
      "notiz": "neue Tokens g.mesh.dispose(), P.mesh.dispose()"
    },
    {
      "name": "gate:apparat (+ --selftest)",
      "exit": "0 / 0"
    },
    {
      "name": "gate:source-probes",
      "exit": "0"
    },
    {
      "name": "gate:start-rezept (+ --selftest)",
      "exit": "0 / 0"
    },
    {
      "name": "gate:freie-slots --selftest (FREIE_SLOTS_PORT=7640)",
      "exit": "0",
      "notiz": "neue Linse A: 63 Senken fielen mit _instanzAbschied, keine ohne; Selbsttest Senke-ohne-Abschied + Abschied-im-Graphen feuert"
    },
    {
      "name": "gate:profiband --selftest + Lauf",
      "exit": "0 / 0",
      "notiz": "19/19, neu S17 Leck-Linse, S18 gefallener Erzeuger + --nur vram, S19 buf:tier frei"
    },
    {
      "name": "playtest:fast (FAST_PORT=7641)",
      "exit": "0",
      "notiz": "20/20 am Endstand"
    },
    {
      "name": "gate:vendor-anker (+ --selftest)",
      "exit": "0 / 0",
      "notiz": "+25 Anker (Residenz, Render-Objekt-Register, Geometrie-Hoerer, Textur-bindGroups, Leinwand-Tiefe)"
    },
    {
      "name": "gate:pipeline-constitution",
      "exit": "0",
      "notiz": "render.calls-Gesetz nennt _gpuKehrausMarke als die EINE Lesung"
    },
    {
      "name": "gate:render-tap (RENDER_TAP_PORT=7646)",
      "exit": "0",
      "notiz": "13/13; war in CI 0e284142 rot, geheilt in c66e5b0f"
    },
    {
      "name": "gate:betriebsgesetz",
      "exit": "0"
    },
    {
      "name": "chunk-satz --selftest · kamera-treue --selftest · atlas --check · studio-vertrag · phyto-tree · phyto-core-parity · arch-fachwerk-fit",
      "exit": "0"
    },
    {
      "name": "godray · kamera-treue · render-diaet · foundry-crossfade (+selftest) · schatten-werfer · s4-impostor-workshop · weg-boden · analog-nah (+selftest)",
      "exit": "0",
      "notiz": "Ports 7642-7647, am Stand vor dem Textur-Bindegruppen-Schnitt (8e397c6a)"
    },
    {
      "name": "lokale CI: alle 74 Schritte der check.yml (eigener Port-Bereich 7640-7647, absolute Pfade)",
      "exit": "0",
      "notiz": "am Stand vor 8e397c6a; am Endstand die betroffenen Schritte 02,03,04,05,07,49,52,53,64,69,70,72 EXIT 0"
    },
    {
      "name": "GitHub-CI dc03ffaf (Run 37390519462)",
      "exit": "success",
      "notiz": "Job check success, Job playtest success"
    },
    {
      "name": "npm run playtest (voll)",
      "exit": "nicht gefahren",
      "notiz": "braucht Port 4312 (die Kette)"
    },
    {
      "name": "diag-taille (Teil von npm run check)",
      "exit": "nicht gefahren",
      "notiz": "startet den save-server auf 4312"
    }
  ],
  "gemessen": "Ich habe zwei Klassen geschnitten. Erstens den Speicher, der von der Geschichte abhängt statt vom Bild: Geometrie, die nur noch der Foundry-Cache (ruhend) oder nur noch r184s Register (verwaist) hielt, Instanz-Senken, die ohne Abschied fielen, und Render-Objekte samt Uniform-Puffern, die r184s Geometrie-Hörer und die Bindegruppen-Liste der Texturen festhielten. Zweitens die Leinwand-Tiefe, die nie gelesen wurde. Die neue Puffer-Linse gibt jedem bisher namenlosen buf:? einen Halter; die Ratsche hält buf:ruhend und buf:verwaist auf 0, sonst ist die LINSE rot (Typ leck).\nGemessen auf der echten GPU (Radeon 890M, Mess-Wiese −900/−850, werkbank band, gleiche Sequenz, erzwungener GC, Zensus am Kehraus-Punkt):\n— Nach drei Wander-Schleifen à 1,2 km: VRAM 230,5 → 169,6 MB. buf:ruhend 38,0 → 0 (griechische Häuser 23,1), buf:verwaist 14,8 → 0 (alter Boden-Satz 11,7; 1687 Instanz-Matrizen 2,4), tex:depthBuffer 7,9 → 0, buf:bindingBuffer 2,6 MB/7481 → 1,9 MB/4254 Puffer. buf:szene 59,4 → 49,9 + buf:tier 10,1 (die Tiere schwanken).\n— In Ruhe: VRAM 159,2 → 149,5–155,3 MB über acht Läufe. Texturen 115,4 → 107,5 MB, Geometrie ohne Bild 1,1 → 0, gebunden ≤ 148,7 MB.\n— Befehle und Dreiecke ohne Tiere sind gleich geblieben: Ruhe 236 / 2106k → 236 / 2106k, Wandern 247 / 2236k → 244 / 2234k (zaehlen: Hauptbild 161/1115k, k0 61/709k, k1 14/283k vorher; die Abweichungen nachher sind Tiere).\n— Heap-Halter-Suche (swiftshader, zehn Gruppen gezielt fallen gelassen): lebend nach GC 10/10 → 0/10 Senken, 34/34 → 0 Uniform-Bindungen.\n— Ratsche aus vier eingeschwungenen Läufen, Erst- und Zweit-Boot, nur VRAM: gesamt 232,6 → 148,7 gebunden, buf:? 94,4 → 0, buf:szene 40,6.\n— Bilder (vier Blicke × Mittag/Abend, Tiere ausgeblendet): untere Bildhälfte Δ 0,8–2,9 (Höhe Δ 5–7, Laub-Wind), Luminanz ±1. Ich habe die Bilder selbst gelesen: gleich bis auf Wolken. Der Schirm-Shot der Leinwand ohne Tiefe weicht um Δ 3,3 ab, ebenfalls gleich.\nKeine WebGPU-Validierung. Zwei Läufe verloren das Gerät, als meine lokale CI parallel Gates auf derselben iGPU fuhr; zwei Läufe allein liefen sauber. Ein früher Stand ließ das Knoten-Attribut der Instanz-Farbe fallen; daraus kam „Vertex buffer slot 2 not set\". Der Fehler ist vor dem Commit gefunden und geheilt.",
  "integrationPruefen": "RUHIG messen, keine Gates parallel auf der iGPU: Meine lokale CI ließ in zwei Wander-Läufen das Gerät verlieren („A valid external Instance reference no longer exists\"). Vorher und nachher je mit gpu-bank und lauf --ruhe 300 --tiere frei messen:\n(1) die GPU- und Frame-Zeit;\n(2) die Takt-Kosten des Kehraus mit werkbank takt: je 2 s ein Gang durch den Szenen-Graphen und r184s memoryMap, dazu das Lesen der Render-Objekt-Attribute;\n(3) die Upload-Spitzen, wenn der Spieler in schon besuchte Regionen zurückkehrt: ruhende Foundry-Gestalten werden neu hochgeladen;\n(4) die CPU-Kosten für neue Instanz-Senken: ihr Knoten-Zustand fällt jetzt aus dem nodeBuilderCache, der Pipeline-Cache bleibt wie bisher.\nNach dem Merge der anderen Familien prüfen:\n- werkbank band und puffer in Ruhe und nach drei Wander-Schleifen: buf:ruhend und buf:verwaist müssen 0 bleiben (LINSE leck), keine Konsolen-Validierung.\n- gate:freie-slots (Linse A): Jede neue Instanz-Senke einer anderen Familie fällt über _instanzAbschied, nie über mesh.dispose(); gate:altlasten sperrt g.mesh.dispose() und P.mesh.dispose().\nKonflikt-Zonen:\n- befehle: _loopRender (Kehraus-Marke und Kehraus-Ruf), _ensurePostProcessing (renderer.depth=false), werkbank.cjs, draw-zaehler.cjs (pufferZensus, __zensusCalls, __kehrausJetzt), band-urteil.cjs, diag-profiband.cjs, spec/profiband/ratsche.json (VRAM-Schlüssel und gemessen.vram — JSON je Schlüssel mergen, die Klassen-Zeilen habe ich nicht angefasst).\n- busch-wiese: _nahWieseKachelEntsorgen, _streuNahMesh.\n- baum-l1: _archInstanceGroupGrow und _disposeArchInstanceGroup. Der Kehraus gibt die GPU-Kopien der Foundry-Cache-Gestalten frei; wechselnde L1-Gruppen laden neu hoch.\n- boden-schatten: _chunkSatzGeometrie bleibt unverändert, aber der alte Satz fällt jetzt über den Kehraus. Der neutralisierte r184-Geometrie-Hörer löscht beim Wachsen nicht mehr die Attribute des neuen Satzes; _kaskadenZiele ist unberührt.\n- Welle-5-Stufen:\n  · architektur: Fundament wächst und fällt über _instanzAbschied — jede neue Fassung von _archFundament* bzw. Glut als Studio-Gruppe muss das übernehmen.\n  · boden-wasser: neue Stoffe mit Knoten-Attributen gelten über das Render-Objekt-Register als gezeichnet; keine Code-Zone.\n  · gegenstaende, klang: keine Zone.\n  · koerper: der Spieler kostet 8 MB und 204k Dreiecke L0; geskinnte Meshes laufen durch das Register, Tier-Abgänge nicht über _instanzAbschied.\n- CLAUDE.md Lehre 27 und gate:vendor-anker (+25 Anker): Bei einem Vendor-Bump sind alle neu zu beweisen.",
  "offen": [
    "Das Profi-Band wird in Ruhe weiter verfehlt: 149,5–155,3 MB gegen 118 MB. Die Post-Kette bei 1080p kostet 71 MB und ist Vendor-fest: TRAA-Geschichte (rgba16float 15,8 MB) mit Tiefe 7,9, Auflösung 15,8, Szene 15,8, Szene-Tiefe 7,9, Tiefenkopie für Wasser und Feld-Pass 7,9. rg11b10ufloat habe ich verworfen: Bei 5 % Blend-Gewicht bleibt die Geschichte unter ~16 % Differenz stehen, das ist Bildverlust. Die Kaskaden kosten 24 MB; ihr r8-Farb-Anhang muss bleiben, weil die r184-Pipeline das Format aus textures[0] liest.",
    "Die Szenen-Geometrie in Ruhe liegt bei 40,6 MB: Boden-Satz 15,4 MB (Kapazität 229k Vertices × 52 B plus 4 MB Uint32-Index), Spieler 8,0 MB bei 204k Dreiecken L0 (Familie koerper, Lehre 19), Wasser-Satz 3,3 MB.",
    "Nach dem Wandern sind noch 4254 Uniform-Puffer übrig (1,9 MB). Wem sie außer den Instanz-Senken gehören, ist nicht benannt: Satz, Tiere, Einzelstücke oder lebende Render-Objekte der größeren Welt.",
    "Der Boden-Satz wächst ×1,5 und schrumpft nie: nach dem Wandern +5,7 MB, buf:szene 49,9 gegen die Ruhe-Ratsche 40,6 MB.",
    "Je Familie hält ein geteilter Knoten-Zustand bzw. die Ofen-Schlange EINE tote Senke. Das ist begrenzt, aber nicht null.",
    "Zeit habe ich nicht gemessen (Auftrag): Die GPU-Zeit und die Takt-Kosten des Kehraus misst die Integration ruhig.",
    "npm run playtest (voll) und diag-taille sind nicht gefahren (Port 4312, die Kette).",
    "tex:karte-albedo/karte-normal/laub-cluster-atlas sind in Ruhe kleiner gemessen (2,7 / 1,3 / 0,7 MB). Ihre Ratschen habe ich von Hand stehen lassen (14,7 / 14,7 / 1,3), weil kein Schnitt dieser Welle sie bewegt hat.",
    "Pflicht-OFFEN Rest: E (das Profi-Band auf jedem Standardgerät) — Status ZWISCHENSTAND."
  ],
  "bilder": [
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-vorher-ruhe-mittag-nah-nord.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-nachher3-ruhe-mittag-nah-nord.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-vorher-ruhe-mittag-mittel-nordost.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-nachher3-ruhe-mittag-mittel-nordost.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-vorher-ruhe-mittag-fern-suedwest.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-nachher3-ruhe-mittag-fern-suedwest.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-vorher-ruhe-mittag-hoehe.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-nachher3-ruhe-mittag-hoehe.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-vorher-ruhe-abend-nah-nord.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-nachher3-ruhe-abend-nah-nord.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-vorher-ruhe-abend-mittel-nordost.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-nachher3-ruhe-abend-mittel-nordost.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-vorher-ruhe-abend-fern-suedwest.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-nachher3-ruhe-abend-fern-suedwest.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-vorher-ruhe-abend-hoehe.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-nachher3-ruhe-abend-hoehe.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-vorher-ruhe-schirm.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w6-vram\\artifacts\\w6-vram\\bild-nachher-ruhe-schirm.png"
  ]
}
```

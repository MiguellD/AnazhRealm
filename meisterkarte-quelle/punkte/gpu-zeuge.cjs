// DER ZEUGE DER KARTE (die Wand GPU in punkte.cjs): unter einer GPU-Station lädt der Läufer diese Datei in JEDEN node-Prozess
// der Station (NODE_OPTIONS --require) — auch in die Werkbank, deren Ausgabe in ihr eigenes Log geht. Jede Zeile, die den Adapter
// einer Linse nennt (`[linse-gpu] …`, scripts/lib/software-gpu.cjs adapterZeile) oder die Weiche von welt-boot („zeichnet nie“),
// landet zusätzlich in PUNKTE_GPU_ZEUGE. Er misst nichts und ändert keine Ausgabe.
"use strict";
const datei = process.env.PUNKTE_GPU_ZEUGE;
if (datei) {
    const fs = require("fs");
    const ZEILE = /^\[linse-gpu\] |^\[welt-boot\] FEHLER klasse:.*zeichnet nie/;
    for (const s of [process.stdout, process.stderr]) {
        const schreibe = s.write;
        s.write = function (c, ...rest) {
            try {
                for (const z of String(c).split(/\r?\n/)) if (ZEILE.test(z)) fs.appendFileSync(datei, z + "\n");
            } catch (_e) {
                // der Zeuge hält nie die Ausgabe an
            }
            return schreibe.call(this, c, ...rest);
        };
    }
}

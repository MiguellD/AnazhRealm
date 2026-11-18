// lade.cjs — lädt die KOPIE des Lebens-Kerns (kern/leben-core.js = koordination, Welle 1, sha256 ea947fa0…) und den Prototyp des
// Bau-Gesetzes (vision/bau/spike/gesetz-proto.cjs, unverändert). Prüft die Kopie byte-genau: weicht sie ab, bricht der Lauf (fail-closed).
// Kein Spiel-Code berührt.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const KERN = path.join(__dirname, "kern", "leben-core.js");
const KERN_SHA = "ea947fa00a449890af72b34e7fd2dcff938b13a001fe71e62ea52fbf7bb1bdf7";
const BAU = path.join(__dirname, "..", "..", "bau", "spike", "gesetz-proto.cjs");
function laden() {
    const sha = crypto.createHash("sha256").update(fs.readFileSync(KERN)).digest("hex");
    if (sha !== KERN_SHA) throw new Error("lade: leben-core.js ist nicht die Kopie von koordination (" + sha + ")");
    if (!fs.existsSync(BAU)) throw new Error("lade: " + BAU + " fehlt (git sparse-checkout add vision/bau/spike/gesetz-proto.cjs)");
    const leben = require(KERN);
    leben.selbsttest(); // wirft, wenn eine Zahl des Kerns ihr Soll verfehlt
    return { leben, bau: require(BAU), kernSha: sha };
}
module.exports = { laden };

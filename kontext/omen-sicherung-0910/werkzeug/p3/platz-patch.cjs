// 0710-7 Nachtrag: der Tier-Leib fragt dieselbe Nachbarschaft — der Platz jedes Eintrags (Position ± Reichweite) als zweiter
// Schlüssel, die Beweger direkt; die Nähe-Liste ist dieselbe Menge in derselben Ordnung.
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 120));
    s = s.replace(a, b);
}
// (1) die Beschreibung und der Stand des Netzes
ers(
    `    // Schleife über das Array. Leser: der Struktur-Strahl (\`_fieldRaycast\`) und der Struktur-Löser von Kapsel und Wagen-Hülle
    // (\`_stepCharacterStructures\` über \`_blockerNahe\`). Das alte Bucket-Grid (\`state.blockerIndex\`, V9.65) trug die
    // Hydrosphäre und fiel mit ihr (V9.75).
    _blockerNetz() {
        const liste = this.state.architectures;
        const alt = this._blockerNetzStand;
        if (alt && alt.liste === liste) return alt;
        const N = (this._blockerNetzStand = {
            liste,
            zellen: new Map(),
            seq: alt ? alt.seq : 0,`,
    `    // Schleife über das Array. Leser: der Struktur-Strahl (\`_fieldRaycast\`) und der Struktur-Löser von Kapsel und Wagen-Hülle
    // (\`_stepCharacterStructures\` über \`_blockerNahe\`). DER ZWEITE SCHLÜSSEL, der PLATZ: jeder Eintrag des Bestands (auch
    // ohne Boxen) steht in den Zellen von Position ± Reichweite (\`plaetze\`); wandert seine Position nach dem Eintritt (das
    // gerittene Werk, \`_blockerBewegt\`), fragt man ihn direkt (\`beweger\`). Leser: der Tier-Leib (\`_kreaturHuellenKontakt\`
    // über \`_blockerUmPlatz\`). Das alte Bucket-Grid (\`state.blockerIndex\`, V9.65) trug die Hydrosphäre und fiel mit ihr (V9.75).
    _blockerNetz() {
        const liste = this.state.architectures;
        const alt = this._blockerNetzStand;
        if (alt && alt.liste === liste) return alt;
        const N = (this._blockerNetzStand = {
            liste,
            zellen: new Map(),
            plaetze: new Map(),
            beweger: new Set(),
            seq: alt ? alt.seq : 0,`
);
// (2) der Austritt verlässt auch die Beweger
ers(
    `    _blockerAustritt(entry) {
        this._blockerNetzLoesen(entry);
        entry._blockerGen = 0;
    }`,
    `    _blockerAustritt(entry) {
        this._blockerNetzLoesen(entry);
        if (this._blockerNetzStand) this._blockerNetzStand.beweger.delete(entry);
        entry._blockerGen = 0;
    }

    // Ein Eintrag, dessen Position nach dem Eintritt wandert (das gerittene Werk folgt seinem Reiter in x/z, \`_rittSchritt\`):
    // sein Platz steht nicht mehr, wo er gestempelt wurde — die Frage nach Plätzen prüft ihn direkt, bis er den Bestand verlässt.
    _blockerBewegt(entry) {
        const N = this._blockerNetz();
        if (entry._blockerGen === N.gen) N.beweger.add(entry);
    }`
);
// (3) das Setzen: der Platz zuerst (jeder Eintrag), dann die Hülle der Boxen — beide über EINEN Zellen-Helfer
ers(
    `    _blockerNetzSetzen(entry) {
        const N = this._blockerNetz();
        this._blockerNetzLoesen(entry);
        const boxes = entry.blockerAABBs;
        if (entry._blockerGen !== N.gen || !boxes || !boxes.length) return;`,
    `    _blockerNetzSetzen(entry) {
        const N = this._blockerNetz();
        this._blockerNetzLoesen(entry);
        if (entry._blockerGen !== N.gen) return;
        entry._blockerZellenGen = N.gen;
        const pos = entry.position;
        if (pos) {
            const rr = entry._blockerReach || 0;
            entry._blockerPlatz = this._blockerZellenEin(N.plaetze, entry, pos.x - rr, pos.x + rr, pos.z - rr, pos.z + rr);
        }
        const boxes = entry.blockerAABBs;
        if (!boxes || !boxes.length) return;`
);
ers(
    `        const Z = AnazhRealm.BLOCKER_ZELLE;
        const keys = [];
        if (Number.isFinite(x0) && Number.isFinite(x1) && Number.isFinite(z0) && Number.isFinite(z1)) {
            const ix0 = Math.floor(x0 / Z),
                ix1 = Math.floor(x1 / Z),
                iz0 = Math.floor(z0 / Z),
                iz1 = Math.floor(z1 / Z);
            if ((ix1 - ix0 + 1) * (iz1 - iz0 + 1) <= AnazhRealm.BLOCKER_ZELLEN_MAX)
                for (let ix = ix0; ix <= ix1; ix++) for (let iz = iz0; iz <= iz1; iz++) keys.push(ix * 2097152 + iz);
        }
        if (!keys.length) keys.push(AnazhRealm.BLOCKER_RIESE);
        entry._blockerHuelle =
            Number.isFinite(x0) && Number.isFinite(x1) && Number.isFinite(z0) && Number.isFinite(z1)
                ? [x0, x1, z0, z1]
                : null;
        for (let i = 0; i < keys.length; i++) {
            let zelle = N.zellen.get(keys[i]);
            if (!zelle) N.zellen.set(keys[i], (zelle = []));
            zelle.push(entry);
        }
        entry._blockerZellen = keys;
        entry._blockerZellenGen = N.gen;
    }`,
    `        entry._blockerHuelle =
            Number.isFinite(x0) && Number.isFinite(x1) && Number.isFinite(z0) && Number.isFinite(z1)
                ? [x0, x1, z0, z1]
                : null;
        entry._blockerZellen = this._blockerZellenEin(N.zellen, entry, x0, x1, z0, z1);
    }

    // Trägt einen Eintrag in die Zellen von \`karte\` über das Rechteck x0..x1 · z0..z1 ein — zu groß (mehr als
    // BLOCKER_ZELLEN_MAX Zellen) oder nicht endlich: die Riesen-Zelle — und gibt die Schlüssel.
    _blockerZellenEin(karte, entry, x0, x1, z0, z1) {
        const Z = AnazhRealm.BLOCKER_ZELLE;
        const keys = [];
        if (Number.isFinite(x0) && Number.isFinite(x1) && Number.isFinite(z0) && Number.isFinite(z1)) {
            const ix0 = Math.floor(x0 / Z),
                ix1 = Math.floor(x1 / Z),
                iz0 = Math.floor(z0 / Z),
                iz1 = Math.floor(z1 / Z);
            if ((ix1 - ix0 + 1) * (iz1 - iz0 + 1) <= AnazhRealm.BLOCKER_ZELLEN_MAX)
                for (let ix = ix0; ix <= ix1; ix++) for (let iz = iz0; iz <= iz1; iz++) keys.push(ix * 2097152 + iz);
        }
        if (!keys.length) keys.push(AnazhRealm.BLOCKER_RIESE);
        for (let i = 0; i < keys.length; i++) {
            let zelle = karte.get(keys[i]);
            if (!zelle) karte.set(keys[i], (zelle = []));
            zelle.push(entry);
        }
        return keys;
    }

    _blockerZellenAus(karte, entry, keys) {
        for (let i = 0; i < keys.length; i++) {
            const zelle = karte.get(keys[i]);
            if (!zelle) continue;
            const j = zelle.indexOf(entry);
            if (j < 0) continue;
            zelle[j] = zelle[zelle.length - 1];
            zelle.pop();
            if (!zelle.length) karte.delete(keys[i]);
        }
    }

    // DIE FRAGE NACH PLÄTZEN (Leser: der Tier-Leib): die Einträge des Bestands, deren Platz (Position ± Reichweite) das Quadrat
    // x/z ± \`weite\` berührt — aus den Platz-Zellen und der Riesen-Zelle —, dazu jeder Beweger, in der Ordnung des Bestands nach
    // \`out\`. Ein Obermenge: die Probe je Eintrag stellt der Leser. Eine nicht endliche Frage erreicht jeden Eintrag.
    _blockerUmPlatz(x, z, weite, out) {
        const N = this._blockerNetz();
        const frage = ++N.frage;
        const n0 = out.length;
        if (!(Number.isFinite(weite) && Number.isFinite(x) && Number.isFinite(z))) {
            for (const e of N.liste) if (e) out.push(e);
            return out;
        }
        const Z = AnazhRealm.BLOCKER_ZELLE;
        const ix0 = Math.floor((x - weite) / Z),
            iz0 = Math.floor((z - weite) / Z);
        const nx = Math.floor((x + weite) / Z) - ix0 + 1;
        const nZellen = nx * (Math.floor((z + weite) / Z) - iz0 + 1);
        for (let c = -1; c < nZellen; c++) {
            const zelle = N.plaetze.get(
                c < 0 ? AnazhRealm.BLOCKER_RIESE : (ix0 + (c % nx)) * 2097152 + iz0 + Math.floor(c / nx)
            );
            if (!zelle) continue;
            for (let i = 0; i < zelle.length; i++) {
                const e = zelle[i];
                if (e._blockerFrage === frage) continue;
                e._blockerFrage = frage;
                out.push(e);
            }
        }
        for (const e of N.beweger)
            if (e._blockerFrage !== frage) {
                e._blockerFrage = frage;
                out.push(e);
            }
        if (out.length - n0 > 1) out.sort(AnazhRealm._nachBestand);
        return out;
    }`
);
// (4) das Lösen: Hülle und Platz
ers(
    `    _blockerNetzLoesen(entry) {
        const keys = entry._blockerZellen;
        if (!keys) return;
        entry._blockerZellen = null;
        const N = this._blockerNetzStand;
        if (!N || entry._blockerZellenGen !== N.gen) return;
        for (let i = 0; i < keys.length; i++) {
            const zelle = N.zellen.get(keys[i]);
            if (!zelle) continue;
            const j = zelle.indexOf(entry);
            if (j < 0) continue;
            zelle[j] = zelle[zelle.length - 1];
            zelle.pop();
            if (!zelle.length) N.zellen.delete(keys[i]);
        }
    }`,
    `    _blockerNetzLoesen(entry) {
        const N = this._blockerNetzStand;
        const gilt = !!N && entry._blockerZellenGen === N.gen;
        if (entry._blockerZellen) {
            if (gilt) this._blockerZellenAus(N.zellen, entry, entry._blockerZellen);
            entry._blockerZellen = null;
        }
        if (entry._blockerPlatz) {
            if (gilt) this._blockerZellenAus(N.plaetze, entry, entry._blockerPlatz);
            entry._blockerPlatz = null;
        }
    }`
);
// (5) der Tier-Leib fragt die Plätze
ers(
    `            const liste = nah ? nah.liste : [];
            liste.length = 0;
            for (let a = 0; a < arches.length; a++) {
                const e = arches[a];
                if (!e || !e.position) continue;`,
    `            const liste = nah ? nah.liste : [];
            liste.length = 0;
            // DIE NACHBARSCHAFT (0710-7): die Plätze um das Tier (\`_blockerUmPlatz\`, Obermenge in der Ordnung des Bestands),
            // dieselbe Probe je Eintrag — die Liste ist dieselbe wie die Schleife über den Bestand (gate:blocker-netz N).
            // Vorher durchlief jeder Neubau den ganzen Bestand (Mess-Wiese: 1 156 Einträge, 133 je Frame).
            const kand = this._blockerPlatzKand || (this._blockerPlatzKand = []);
            kand.length = 0;
            this._blockerUmPlatz(p.x, p.z, 8 + 1e-6, kand);
            for (let a = 0; a < kand.length; a++) {
                const e = kand[a];
                if (!e || !e.position) continue;`
);
// (6) die Beweger: das gerittene Werk folgt seinem Reiter (zwei Schreiber)
const BEW = `        entry.position.x = pm.x;
        entry.position.z = pm.z;
`;
if (s.split(BEW).length !== 3) throw new Error("BEWEGER: " + (s.split(BEW).length - 1));
s = s.split(BEW).join(BEW + `        this._blockerBewegt(entry);
`);
fs.writeFileSync(p, s);
console.log("ok");

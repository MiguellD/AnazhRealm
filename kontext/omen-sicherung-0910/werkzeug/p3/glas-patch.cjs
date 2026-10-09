// 0710-10: DER BRENNGLAS-TAKT UND SEINE KLASSE fragen die Nachbarschaft — das Verzeichnis je Name (Affordanzen, Kamine) und die
// Plätze um die Wirker; die Takte urteilen wie die Schleife über den Bestand, in seiner Ordnung.
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER " + (s.split(a).length - 1) + ": " + a.slice(0, 140));
    s = s.replace(a, b);
}

// (1) der Stand des Netzes: das Verzeichnis und die warmen Einträge (sie reisen über jeden Neubau)
ers(
    `            plaetze: new Map(),
            beweger: new Set(),
            seq: alt ? alt.seq : 0,`,
    `            plaetze: new Map(),
            beweger: new Set(),
            verzeichnis: new Map(),
            verzeichnisListe: new Map(),
            warm: alt ? alt.warm : new Set(),
            seq: alt ? alt.seq : 0,`
);
ers(
    `    // über \`_blockerUmPlatz\`). Das alte Bucket-Grid (\`state.blockerIndex\`, V9.65) trug die Hydrosphäre und fiel mit ihr (V9.75).
    _blockerNetz() {`,
    `    // über \`_blockerUmPlatz\`). DAS VERZEICHNIS (0710-10): je Name die Einträge, die ihn tragen — jeder Schlüssel ihrer
    // Affordanzen (\`entry.affordances\`, beim Spawn eingefroren, nachgezogen von \`setBlueprintAsPortal\`) und „rauch" (ein Kamin:
    // \`userData.rauchQuelle\` oder \`chimney\`), gestempelt mit den Zellen; \`_blockerMit(name)\` gibt sie in der Ordnung des
    // Bestands. Leser: die Affordanz-Takte und der Dorf-Rauch. Die WARMEN Einträge (\`warm\`, Hitze > 0) führt der Brennglas-Takt
    // selbst — erwärmt wird nur dort. Das alte Bucket-Grid (\`state.blockerIndex\`, V9.65) trug die Hydrosphäre und fiel mit ihr.
    _blockerNetz() {`
);
// (2) der Stempel: der Platz, das Verzeichnis, dann die Hülle der Boxen
ers(
    `                pos.z - rr,
                pos.z + rr
            );
        }
        const boxes = entry.blockerAABBs;
        if (!boxes || !boxes.length) return;`,
    `                pos.z - rr,
                pos.z + rr
            );
        }
        const namen = this._blockerNamen(entry);
        if (namen.length) {
            for (const n of namen) {
                let menge = N.verzeichnis.get(n);
                if (!menge) N.verzeichnis.set(n, (menge = new Set()));
                menge.add(entry);
                N.verzeichnisListe.delete(n);
            }
            entry._blockerNamenListe = namen;
        }
        const boxes = entry.blockerAABBs;
        if (!boxes || !boxes.length) return;`
);
ers(
    `        if (entry._blockerPlatz) {
            if (gilt) this._blockerZellenAus(N.plaetze, entry, entry._blockerPlatz);
            entry._blockerPlatz = null;
        }
    }`,
    `        if (entry._blockerPlatz) {
            if (gilt) this._blockerZellenAus(N.plaetze, entry, entry._blockerPlatz);
            entry._blockerPlatz = null;
        }
        if (entry._blockerNamenListe) {
            if (gilt)
                for (const n of entry._blockerNamenListe) {
                    const menge = N.verzeichnis.get(n);
                    if (menge && menge.delete(entry)) N.verzeichnisListe.delete(n);
                }
            entry._blockerNamenListe = null;
        }
    }

    // Die Namen eines Eintrags im Verzeichnis: jeder wahre Schlüssel seiner Affordanzen und „rauch", wenn er einen Kamin trägt.
    _blockerNamen(entry) {
        const out = [];
        const a = entry.affordances;
        if (a && typeof a === "object") for (const k in a) if (a[k]) out.push(k);
        if ((entry.userData && entry.userData.rauchQuelle) || entry.chimney) out.push("rauch");
        return out;
    }

    // Die Einträge des Bestands, die \`name\` tragen, in seiner Ordnung — dieselbe Liste wie
    // \`state.architectures.filter((e) => e.affordances && e.affordances[name])\` (für „rauch": jeder Kamin). Die Liste lebt, bis
    // sich der Name regt; der Leser ändert sie nie.
    _blockerMit(name) {
        const N = this._blockerNetz();
        let liste = N.verzeichnisListe.get(name);
        if (!liste) {
            const menge = N.verzeichnis.get(name);
            liste = menge ? Array.from(menge) : [];
            if (liste.length > 1) liste.sort(AnazhRealm._nachBestand);
            N.verzeichnisListe.set(name, liste);
        }
        return liste;
    }`
);
// (3) der Brennglas-Takt
ers(
    `        if (!this._buehneSteht()) return;
        const archs = this.state.architectures || [];
        const focusing = archs.filter((e) => e.affordances && e.affordances.focusing);`,
    `        if (!this._buehneSteht()) return;
        const focusing = this._blockerMit("focusing");`
);
ers(
    `        const riddenId = this.state.player ? this.state.player.mountedArch : null;
        for (const target of archs) {
            const warm = target.heatBuildup > 0;`,
    `        const riddenId = this.state.player ? this.state.player.mountedArch : null;
        // DIE BETROFFENEN (0710-10, Lehre 25): erwärmen kann sich nur, wer in Reichweite eines Brennglases steht — die Plätze um
        // jedes (\`_blockerUmPlatz\`) —, kühlen nur, wer warm ist (\`warm\`, die Menge dieses Takts); jeder andere Eintrag ginge
        // ohne Wirkung durch. In der Ordnung des Bestands (die Sätze und das Feuer in derselben Folge) — dieselben Urteile wie
        // die Schleife über ihn (gate:brennglas-takt, der alte Takt als Orakel). Vorher: jeder Eintrag je Takt (Wiese 1 578).
        const N = this._blockerNetz();
        const ziele = this._brennZiele || (this._brennZiele = []);
        ziele.length = 0;
        if (punkte.length)
            for (const fa of focusing)
                if (fa.position)
                    this._blockerUmPlatz(fa.position.x, fa.position.z, AnazhRealm.FOCUSING_HEAT_RANGE_M + 1e-6, ziele);
        for (const e of N.warm) {
            if (e._blockerGen !== N.gen) N.warm.delete(e);
            else ziele.push(e);
        }
        if (ziele.length > 1) {
            ziele.sort(AnazhRealm._nachBestand);
            let w = 1;
            for (let i = 1; i < ziele.length; i++) if (ziele[i] !== ziele[w - 1]) ziele[w++] = ziele[i];
            ziele.length = w;
        }
        for (const target of ziele) {
            const warm = target.heatBuildup > 0;`
);
ers(
    `            if (!quelle) {
                if (warm) target.heatBuildup = Math.max(0, target.heatBuildup - ratePerSec * dt);
                continue;
            }
            const vorher = target.heatBuildup || 0;
            target.heatBuildup = vorher + ratePerSec * dt;`,
    `            if (!quelle) {
                if (warm) {
                    target.heatBuildup = Math.max(0, target.heatBuildup - ratePerSec * dt);
                    if (!(target.heatBuildup > 0)) N.warm.delete(target);
                }
                continue;
            }
            const vorher = target.heatBuildup || 0;
            target.heatBuildup = vorher + ratePerSec * dt;
            if (target.heatBuildup > 0) N.warm.add(target);`
);
// (4) die Affordanz-Familie liest das Verzeichnis
ers(
    `        const radiating = (this.state.architectures || []).filter((e) => e.affordances && e.affordances.radiating);`,
    `        const radiating = this._blockerMit("radiating");`
);
ers(
    `        const broadcasting = (this.state.architectures || []).filter(
            (e) => e.affordances && e.affordances.broadcasting && e.position
        );`,
    `        const broadcasting = this._blockerMit("broadcasting").filter((e) => e.position);`
);
ers(
    `        const balancing = (this.state.architectures || []).filter((e) => e.affordances && e.affordances.balancing);`,
    `        const balancing = this._blockerMit("balancing");`
);
ers(
    `        const lifting = (this.state.architectures || []).filter((e) => e.affordances && e.affordances.lifting);`,
    `        const lifting = this._blockerMit("lifting");`
);
ers(
    `        for (const entry of this.state.architectures || []) {
            if (!entry.affordances || !entry.affordances[affordanceKey]) continue;
            const dx = entry.position.x - pm.x;`,
    `        for (const entry of this._blockerMit(affordanceKey)) {
            const dx = entry.position.x - pm.x;`
);
// (5) der Dorf-Rauch liest die Kamine
ers(
    `        const quellen = [];
        const archs = st.architectures;
        if (Array.isArray(archs)) {
            for (let i = 0; i < archs.length; i++) {
                const e = archs[i];
                if (!e || !e.position) continue;`,
    `        const quellen = [];
        // die Kamine aus dem Verzeichnis (\`_blockerMit("rauch")\`, in der Ordnung des Bestands) — vorher je Frame jeder Eintrag
        const archs = Array.isArray(st.architectures) ? this._blockerMit("rauch") : null;
        if (archs) {
            for (let i = 0; i < archs.length; i++) {
                const e = archs[i];
                if (!e || !e.position) continue;`
);
// (6) die Resonanz der Boosts fragt die Plätze um den Spieler
ers(
    `            const radiusSq = AnazhRealm.BOOST_RESONANCE_RADIUS * AnazhRealm.BOOST_RESONANCE_RADIUS;
            for (const entry of this.state.architectures) {
                if (!entry || !entry.position) continue;`,
    `            const radiusSq = AnazhRealm.BOOST_RESONANCE_RADIUS * AnazhRealm.BOOST_RESONANCE_RADIUS;
            // die Plätze um den Spieler (\`_blockerUmPlatz\`, in der Ordnung des Bestands) — vorher jeder Eintrag je Sekunde
            const nahe = this._boostNahe || (this._boostNahe = []);
            nahe.length = 0;
            this._blockerUmPlatz(playerPos.x, playerPos.z, AnazhRealm.BOOST_RESONANCE_RADIUS + 1e-6, nahe);
            for (const entry of nahe) {
                if (!entry || !entry.position) continue;`
);
// (7) setBlueprintAsPortal zieht die Affordanzen nach — und stempelt das Verzeichnis
ers(
    `                if (entry && entry.type === name) {
                    entry.affordances = this.computeBlueprintAffordances(bp);
                }`,
    `                if (entry && entry.type === name) {
                    entry.affordances = this.computeBlueprintAffordances(bp);
                    this._blockerNetzSetzen(entry); // das Verzeichnis der Affordanzen
                }`
);
fs.writeFileSync(p, s);
console.log("ok");

// 0710-4 Klasse 2: der Biss durch das EINE Impuls-Gesetz (Kern-Export BISS + Wirt _bissStoss/_spielerStoss).
"use strict";
const fs = require("fs");
const wt = process.argv[2];
function datei(name, f) {
    const p = wt + "/" + name;
    let s = fs.readFileSync(p, "utf8");
    const ers = (a, b) => {
        if (s.split(a).length !== 2) throw new Error(name + " TREFFER: " + a.slice(0, 90));
        s = s.replace(a, b);
    };
    f(ers);
    fs.writeFileSync(p, s);
}
datei("tetrapoda-core.js", (ers) => {
    ers(
        `    var MASSSTAB = Object.freeze({ meterJeEinheit: 1 / 3, dichteKgM3: 1000 });`,
        `    var MASSSTAB = Object.freeze({ meterJeEinheit: 1 / 3, dichteKgM3: 1000 });
    // ── 0710-4 (rein additiv) — DER BISS ALS STOSS: der Jäger trifft mit seiner Vorhand (Kopf, Hals, Brust) — dieser
    //    Anteil seiner Masse — im Tempo des Ansprungs (VERHALTEN.aktionen.pounce.tempo × tempoEinheit(L)). Sein Impuls
    //    geht durch das EINE Impuls-Gesetz des Wirts wie Klinge, Pfeil und Wagen (vorher: Schaden ohne Rückstoß). ──
    var BISS = Object.freeze({ masseAnteil: 0.3 });`
    );
    ers(
        `        MASSSTAB: MASSSTAB,
        ART_GESTALT: ART_GESTALT,`,
        `        MASSSTAB: MASSSTAB,
        BISS: BISS,
        ART_GESTALT: ART_GESTALT,`
    );
});
datei("anazhRealm.js", (ers) => {
    // das Gesetz neben dem Leib-Gesetz
    ers(
        `// Das Volumen einer GESCHLOSSENEN Fläche (m³ im Rahmen ihrer Geometrie) über den Divergenz-Satz,`,
        `// DER BISS ALS STOSS (0710-4): der Anteil der Jäger-Masse hinter dem Biss (tetrapoda BISS.masseAnteil) und das Tempo
// des Ansprungs (VERHALTEN.aktionen.pounce.tempo, in der Tempo-Einheit des Steuer-Gesetzes). Fail-closed.
AnazhRealm._bissGesetz = function () {
    if (AnazhRealm._bissGesetzMemo) return AnazhRealm._bissGesetzMemo;
    const T = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const anteil = T && T.BISS ? T.BISS.masseAnteil : NaN;
    const VG = AnazhRealm._verhaltenGesetz();
    const pounce = VG && VG.aktionen && VG.aktionen.pounce;
    if (!(anteil > 0 && anteil <= 1)) return AnazhRealm._kernPflichtBruch("tetrapoda:BISS.masseAnteil");
    if (!pounce || !(pounce.tempo > 0)) return AnazhRealm._kernPflichtBruch("tetrapoda:VERHALTEN.aktionen.pounce.tempo");
    AnazhRealm._bissGesetzMemo = Object.freeze({ masseAnteil: anteil, tempo: pounce.tempo });
    return AnazhRealm._bissGesetzMemo;
};
// Das Volumen einer GESCHLOSSENEN Fläche (m³ im Rahmen ihrer Geometrie) über den Divergenz-Satz,`
    );
    // _bissStoss + _spielerStoss neben _kreaturStoss
    ers(
        `    // DER STOSS AUF EINEN LEIB: dv (m/s) längs (nx, nz) — er trägt den Leib, bis die Reibung ihn aufzehrt.
    _kreaturStoss(creature, nx, nz, dv) {`,
        `    // DER BISS (das EINE Impuls-Gesetz, 0710-4): die Vorhand des Jägers (BISS.masseAnteil seiner Leib-Masse) trifft im
    // Tempo des Ansprungs (pounce.tempo × tempoEinheit seiner Hüft-Höhe) das Ziel längs der Linie Jäger → Ziel — ein Tier
    // (\`_kreaturStoss\`) oder den Spieler (\`ziel\` = null: \`_spielerStoss\`). Der Bär beißt schwerer als der Fuchs, der
    // Fuchs fliegt weiter als der Bär. Vorher: Schaden ohne Rückstoß (alle drei Biss-Wege: Jagd auf Beute, Jagd auf den
    // Spieler, Gegenwehr). Rückgabe {J, dv} oder null.
    _bissStoss(beisser, ziel) {
        if (!beisser || !beisser.position) return null;
        const BG = AnazhRealm._bissGesetz();
        const spieler = !ziel;
        const zk = spieler ? this.state.playerMesh : ziel;
        if (!zk || !zk.position) return null;
        const dx = zk.position.x - beisser.position.x;
        const dz = zk.position.z - beisser.position.z;
        const d = Math.hypot(dx, dz);
        if (!(d > 1e-6)) return null;
        const mB = this._leibMasse(beisser) * BG.masseAnteil;
        const mZ = this._leibMasse(zk);
        const v = BG.tempo * AnazhRealm._steuerGesetz().tempoEinheit(this._kreaturHueftL(beisser));
        const J = AnazhRealm._stossImpuls(mB, mZ, v, AnazhRealm.STOSS.stossZahl.leib);
        if (!(J > 0)) return null;
        if (spieler) this._spielerStoss(dx / d, dz / d, J / mZ);
        else this._kreaturStoss(ziel, dx / d, dz / d, J / mZ);
        return { J, dv: J / mZ };
    }

    // DER STOSS AUF DEN SPIELER: dv (m/s) längs (nx, nz) in seine Geschwindigkeit — die Beschleunigungs- und Brems-Kurven
    // des Gehens (\`_loopPlayerMovement\`) zehren ihn auf wie jede Fahrt. Im Sattel trägt ihn das Gefährt (kein Stoß).
    _spielerStoss(nx, nz, dv) {
        const st = this.state;
        if (!(dv > 0) || !st.playerVel || (st.player && st.player.mountedArch != null)) return;
        const v = st.playerVel;
        v.setValue(v.x() + nx * dv, v.y(), v.z() + nz * dv);
    }

    // DER STOSS AUF EINEN LEIB: dv (m/s) längs (nx, nz) — er trägt den Leib, bis die Reibung ihn aufzehrt.
    _kreaturStoss(creature, nx, nz, dv) {`
    );
    // Weg 1: Jagd auf Beute
    ers(
        `        if (typeof this.damageCreature === "function") {
            this.damageCreature(nearest, dmg, { source: "jagd" });
        }
        this._feelCreatureAction(creature, "attack", 1);`,
        `        if (typeof this.damageCreature === "function") {
            const res = this.damageCreature(nearest, dmg, { source: "jagd" });
            if (res && res.ok && !res.killed) this._bissStoss(creature, nearest);
        }
        this._feelCreatureAction(creature, "attack", 1);`
    );
    // Weg 2: Jagd auf den Spieler
    ers(
        `        const dmg = Math.max(2, (stats.damage || 4) * HUNT.damageMul);
        this.damagePlayer(dmg, "jagd");
        this._feelCreatureAction(creature, "attack", 1);`,
        `        const dmg = Math.max(2, (stats.damage || 4) * HUNT.damageMul);
        if (this.damagePlayer(dmg, "jagd")) this._bissStoss(creature, null);
        this._feelCreatureAction(creature, "attack", 1);`
    );
    // Weg 3: die Gegenwehr
    ers(
        `                const counter = Math.max(2, (stats.damage || 4) * tProf.counterMul);
                this.damagePlayer(counter, "gegenwehr");`,
        `                const counter = Math.max(2, (stats.damage || 4) * tProf.counterMul);
                if (this.damagePlayer(counter, "gegenwehr")) this._bissStoss(creature, null);`
    );
});
console.log("ok");

// 0710-7 (2): die Mess-Bühne hält auch die Welt-Akte — EINE Engstelle (dslEval), EINE Liste (DSL_WELTAKTE), EIN Halt
// (_messHalt, dieselbe eingefrorene Uhr wie der Wetter-Halt). Das Spiel kennt den Halt nie.
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
// (1) die Engstelle
ers(
    `        const fn = this.dslEffects[op];
        if (!fn) {
            ctx.log.push({ event: "unknown_op", op: String(op), program_id: ctx.programId });
            return;
        }
        ctx.budget.depthLeft--;`,
    `        const fn = this.dslEffects[op];
        if (!fn) {
            ctx.log.push({ event: "unknown_op", op: String(op), program_id: ctx.programId });
            return;
        }
        // DIE MESS-BÜHNE HÄLT DIE WELT (0710-7, Halt heißt Halt): unter dem Halt einer Messung (\`_messHalt\`) verweigert jeder
        // Welt-Akt (AnazhRealm.DSL_WELTAKTE) seinen Zug — gleich wer ihn schickt (Nexus, Welt-Regel, Emotion, Mensch,
        // Mitspieler) — und steht beim Namen seiner Quelle im Log (\`_weltaktGehalten\`). Bis 07.10. hielt die Bühne nur das
        // Wetter: ein Nexus-Dorf drehte im OMEN-Boot 4B (0710-6) mitten im Lauf den Blick. Das Spiel kennt den Halt nie.
        if (AnazhRealm.DSL_WELTAKTE.includes(op) && this._messHalt()) {
            this._weltaktGehalten(String(op), ctx);
            return;
        }
        ctx.budget.depthLeft--;`
);
// (2) der Halt und die Buchung, neben dem Default-Spawn
ers(
    `    // Default-Spawn: Y=50, damit der Spieler sauber aufs Terrain fällt (tiefer clippt er je nach Seed`,
    `    // DER HALT EINER MESSUNG: die Uhr des Wetter-Zugs unter 0 (die Bühne der Linsen, scripts/lib/ausgabe-aufnahme.cjs
    // \`__wetterHalten\`; im Spiel zählt sie von 0 aufwärts). Leser: der EINE Wetter-Schreiber (\`_setWeather\`) und die EINE
    // Engstelle der Welt-Akte (\`dslEval\`).
    _messHalt() {
        return this.state.weatherEffectTime < 0;
    }

    // Ein gehaltener Welt-Akt (\`dslEval\` unter dem Halt): benannt im Programm-Log und im Spiel-Log — die Mess-Wache bucht
    // ihn über ihren Spion (\`__weltaktSpion\`) als „verweigert" beim Namen seiner Quelle.
    _weltaktGehalten(op, ctx) {
        ctx.log.push({ event: "weltakt_gehalten", op, source: ctx.source, program_id: ctx.programId });
        this.log(\`Welt-Akt gehalten: \${ctx.source || "?"} wollte \${op}\`, "DEBUG");
    }

    // Default-Spawn: Y=50, damit der Spieler sauber aufs Terrain fällt (tiefer clippt er je nach Seed`
);
// (3) der Wetter-Schreiber liest denselben Halt
ers(
    `    _setWeather(name, quelle) {
        if (!(name in AnazhRealm.WEATHER_INTENSITY)) return false;
        if (this.state.weatherEffectTime < 0) {`,
    `    _setWeather(name, quelle) {
        if (!(name in AnazhRealm.WEATHER_INTENSITY)) return false;
        if (this._messHalt()) {`
);
// (4) die EINE Liste der Welt-Akte
ers(
    `// Sichtbarkeits-Stufen der Welten (eingefroren, jeder Wert exakt eines der Wörter).`,
    `// DIE WELT-AKTE DER DSL (0710-7): jeder Op, der die Welt, ihre Wesen oder den Spieler verändert — Bauten und Spawns, der
// Boden und seine Sichtbarkeit, Zeit und Himmel, die Würfel auf Größe/Tempo/Farbe/Stimmung der Tiere, die Werte und die
// Ausrüstung des Spielers, das Feld. Unter dem Halt einer Messung (\`_messHalt\`) verweigert \`dslEval\` jeden von ihnen; das Wetter hält sein eigener
// Schreiber (\`_setWeather\`). Nicht hier: Definitionen (define_* · set_*_role · register_tool …), Erzählung (say ·
// record_narrative) und Kontrollfluss — sie verändern keine gemessene Welt. gate:weltakt-wache hält den Pool des Nexus
// (\`dslComposeAtomic\`) in dieser Liste.
AnazhRealm.DSL_WELTAKTE = Object.freeze([
    "spawn_creature",
    "spawn_tree",
    "spawn_studio",
    "spawn_island",
    "spawn_ufo",
    "spawn_village",
    "spawn_temple",
    "spawn_waterfall",
    "spawn_blueprint",
    "spawn_fractal",
    "remove_architecture",
    "apply_op",
    "apply_connection",
    "set_portal",
    "set_visible",
    "voxel_carve",
    "voxel_fill",
    "terrain_steepness",
    "terrain_base_height",
    "gravity",
    "set_time_of_day",
    "time_of_day",
    "set_season",
    "skybox_color",
    "creatures_color",
    "creatures_emotion",
    "creatures_speed_mul",
    "creatures_size_mul",
    "creature_task",
    "creature_task_nearest",
    "creature_task_all",
    "damage_creature",
    "creature_equip_tool",
    "creature_equip_armor",
    "creature_unequip",
    "creature_apply_boost",
    "player_jump_power",
    "player_speed",
    "player_size_mul",
    "player_soul",
    "damage",
    "apply_boost",
    "equip_tool",
    "equip_armor",
    "equip_weapon",
    "unequip",
    "add_to_inventory",
    "set_mode",
    "deposit_life",
    "deposit_emotion",
]);
// Sichtbarkeits-Stufen der Welten (eingefroren, jeder Wert exakt eines der Wörter).`
);
fs.writeFileSync(p, s);
console.log("ok");

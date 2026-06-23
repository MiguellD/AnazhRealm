// ===== DETERMINISMUS-BOGEN P4 (Stufe 1) — DIE ERNTE-LINSE =====
// Beweist, dass die feld-native Spieler-Simulation DETERMINISTISCH ist: derselbe Start +
// dieselbe Input-Folge ⇒ bit-identisches Ergebnis. Das ist der Lohn des Ammo-Schnitts (die
// Physik ist eine reine Funktion, kein Float-Drift/Random/Zeit) UND die self-suffiziente
// Verifikation — die bit-Gleichheit zweier Läufe IST der Beweis, kein Browser nötig.
//
// Vier Prüfungen:
//   (A) BIT-GLEICH: zwei replayRun derselben Aufnahme liefern EXAKT denselben End-Zustand.
//   (B) NICHT-TRIVIAL: der Spieler bewegt sich dabei spürbar (kein No-op).
//   (C) INPUT-SENSITIV: eine ANDERE Input-Folge liefert ein ANDERES Ergebnis (der Replay
//       reagiert wirklich auf den Input, prüft nicht bloß einen Fixpunkt).
//   (D) WIEDERHOLBAR: ein dritter Lauf == der erste (kein Carry-over/Zustands-Leck).

const puppeteer = require("puppeteer");
const path = require("path");
const { spawn } = require("child_process");
const ROOT = path.resolve(__dirname, "..");
const PORT = 4343;

function buildFrames(seq) {
    // seq: Array von [count, {keys}] → flache Frame-Liste mit festem dt = 1/60.
    const frames = [];
    const DT = 1 / 60;
    for (const [count, keys] of seq) {
        for (let i = 0; i < count; i++) {
            frames.push({
                dt: DT,
                yaw: 0,
                w: !!keys.w,
                a: !!keys.a,
                s: !!keys.s,
                d: !!keys.d,
                shift: !!keys.shift,
                space: !!keys.space,
            });
        }
    }
    return frames;
}

(async () => {
    const server = spawn("node", ["save-server.js"], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) } });
    await new Promise((r) => setTimeout(r, 1500));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessSkinResCap = 64;
        window.__anazhHeadlessNullRenderer = true;
    });
    page.on("pageerror", (e) => console.log("PAGEERR:", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(
        () =>
            new Promise((res) => {
                const t0 = Date.now();
                const iv = setInterval(() => {
                    if (
                        (window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function") ||
                        Date.now() - t0 > 55000
                    ) {
                        clearInterval(iv);
                        res();
                    }
                }, 100);
            })
    );
    // Welt einstreamen lassen (der Boden muss gebaut sein, damit das Feld trägt).
    await page.evaluate(() => {
        const r = window.anazhRealm;
        if (r._gameLoopTick) for (let i = 0; i < 120; i++) r._gameLoopTick();
    });

    // Eine scripted Input-Folge bauen: vorwärts laufen, springen, dann vorwärts+strafen.
    const seqA = [
        [40, { w: true }], // 40 Frames vorwärts
        [1, { w: true, space: true }], // Sprung
        [40, { w: true }], // weiter im Sprung/Fall
        [30, { w: true, d: true }], // vorwärts + rechts strafen
        [20, {}], // ausrollen (Trägheit)
    ];
    // Eine ANDERE Folge (für die Input-Sensitivität): nur rückwärts.
    const seqB = [[80, { s: true }]];

    const res = await page.evaluate(
        (framesA, framesB) => {
            const r = window.anazhRealm;
            const s = r.state;
            const pm = s.playerMesh;
            // Einen finiten, gesetzten Start wählen (über Terrain).
            const sy = r.getTerrainHeightAt(0, 0);
            const startY = (Number.isFinite(sy) ? sy : 5) + 2;
            const mkStart = () => {
                pm.position.set(0, startY, 0);
                s.playerVel.setValue(0, 0, 0);
                s._fieldVy = 0;
                s.yaw = 0;
                return r._replaySnapshotState();
            };
            const start = mkStart();
            const recA = { start, frames: framesA };
            const recB = { start, frames: framesB };

            const endA1 = r.replayRun(recA);
            const endA2 = r.replayRun(recA);
            const endA3 = r.replayRun(recA);
            const endB = r.replayRun(recB);

            const bitEqual = (p, q) =>
                p &&
                q &&
                p.x === q.x &&
                p.y === q.y &&
                p.z === q.z &&
                p.vx === q.vx &&
                p.vy === q.vy &&
                p.vz === q.vz &&
                p.fieldVy === q.fieldVy;
            const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);

            return {
                start,
                endA1,
                endB,
                bitEqual_A1_A2: bitEqual(endA1, endA2),
                bitEqual_A1_A3: bitEqual(endA1, endA3),
                movedA: dist(start, endA1),
                differsAB: !bitEqual(endA1, endB) && dist(endA1, endB) > 0.5,
            };
        },
        buildFrames(seqA),
        buildFrames(seqB)
    );

    const f = (p) => (p ? `(${p.x.toFixed(3)}, ${p.y.toFixed(3)}, ${p.z.toFixed(3)})` : "null");
    console.log("\n===== DETERMINISMUS-REPLAY-LINSE (P4 Stufe 1 — die Ernte) =====\n");
    console.log(`  Start ${f(res.start)} → End-A ${f(res.endA1)} · End-B ${f(res.endB)}`);

    let ok = true;
    const check = (cond, msg) => {
        console.log(`  ${cond ? "✅" : "❌"} ${msg}`);
        if (!cond) ok = false;
    };
    check(res.bitEqual_A1_A2 && res.bitEqual_A1_A3, `(A) BIT-GLEICH: drei Replays derselben Aufnahme liefern EXAKT denselben End-Zustand (Determinismus bewiesen)`);
    check(res.movedA > 2.0, `(B) NICHT-TRIVIAL: der Spieler bewegt sich dabei spürbar (${res.movedA.toFixed(2)} m, kein No-op)`);
    check(res.differsAB, `(C) INPUT-SENSITIV: eine andere Input-Folge liefert ein anderes Ergebnis (der Replay reagiert wirklich)`);
    check(res.bitEqual_A1_A3, `(D) WIEDERHOLBAR: der dritte Lauf == der erste (kein Zustands-Leck zwischen Replays)`);

    console.log(
        `\n  ${ok ? "✅ ALLE PRÜFUNGEN GRÜN — die feld-native Simulation ist DETERMINISTISCH (P4-Ernte, Replay/Lockstep-Fundament)" : "❌ NICHT deterministisch — eine versteckte Nicht-Determinismus-Quelle (Random/Zeit/Float-Drift) lauert im Schritt-Pfad"}\n`
    );

    await browser.close();
    server.kill();
    process.exit(ok ? 0 : 1);
})().catch((e) => {
    console.error("LINSE-FEHLER:", e.message);
    process.exit(1);
});

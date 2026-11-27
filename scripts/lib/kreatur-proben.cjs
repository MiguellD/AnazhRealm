// kreatur-proben.cjs — DIE KREATUR-PROBEN: jede Probe ruft den ECHTEN Kreatur-Takt (`updateCreatures`) und misst, was
// das Fenster zeigt — headless (gate:kreatur-takt, Null-Renderer) und im Fenster der echten GPU
// (`node scripts/diag-kreatur-takt.cjs --werkbank <port>`, der Spiel-Loop ruht, Lehre 17). Die Selbsttests spielen den
// alten Defekt als Täter ein (`taeter`) und erwarten Rot; das Soll trägt `urteil`.
"use strict";
// DIE LEBENS-PROBEN wohnen in scripts/diag-kreatur-leben.cjs (Datei-Decke 4 000), ihr Stück steht an der Marke LEBEN_BUEHNEN
const LEBEN = require("../diag-kreatur-leben.cjs");
// DIE PROBEN DES MENSCHEN (bewohner, begegnung) wohnen in scripts/lib/kreatur-mensch.cjs, ihr Stück steht an der Marke MENSCH_BUEHNEN
const MENSCH = require("./kreatur-mensch.cjs");

// ═══ DIE SEITEN-FUNKTION (läuft im Browser: r = die Welt, T = THREE) ═══
async function kreaturProben(r, T, opts) {
    const s = r.state;
    const A = r.constructor;
    const nur = opts?.proben || null;
    const taeter = opts?.taeter || null; // Selbsttest: der alte Defekt als Täter
    const aus = {};
    const echt = !s.renderer?._isHeadlessNull;
    // Der Spiel-Loop ruht (Lehre 17; die Werkbank-Regel: die Welt ruht zwischen den Befehlen, nur `umstellen` tickt).
    if (echt && s.renderer.setAnimationLoop) s.renderer.setAnimationLoop(null);
    const TAU = Math.PI * 2;
    const wrap = (a) => a - TAU * Math.round(a / TAU);
    const grad = (a) => (a * 180) / Math.PI;
    const quantil = (arr, q) => {
        if (!arr.length) return null;
        const b = arr.slice().sort(aufsteigend);
        return b[Math.min(b.length - 1, Math.floor(q * (b.length - 1) + 0.5))];
    };
    const rund = (v, n) => +v.toFixed(n); // die Zahl der Zeile, auf n Stellen
    const pm = s.playerMesh.position;
    const P0 = pm.clone();

    // Die Bühne je Probe: eigene Tier-Liste (die Welt-Tiere ruhen), der Spieler zurück, Modus und Gefühl zurück; `aufraeumen`
    // ist das Aufräumen der laufenden Bühne (die Proben laufen nacheinander), `decke` legt dorthin
    let aufraeumen = null;
    // DAS START-DORF BLEIBT: die Bühne kehrt Tiere, Spieler und Uhr zurück, nie ein gewachsenes Dorf — wer auf derselben Seite
    // nach einer Dorf-Probe (`startDorf`) läuft, misst in ihrem Dorf (folgen hinter begegnung: der Parcours vom Platz des
    // Spielers durch die Häuser, main wie Zweig). Die Dorf-Proben laufen darum zuletzt (`DORF_PROBEN`), und eine Probe ohne
    // eigenes Dorf dahinter ist ROT beim Namen (`__dorfVon`: die Probe, die es auf dieser Seite wachsen ließ)
    const dorf = { probe: null, hier: false };
    // DIE TEILE EINER PROBE (Kreatur-Takt 22.11.: ein Täter fährt nur bis zu seinem Urteil, nie die ganze Probe von Takt 0): ein
    // Teil-Lauf `teil(name, fn)` liefert ein Stück des Ergebnisses. Der Grund-Lauf des Selbsttests legt jedes ab (`teileAblegen`
    // → `__teile`); ein Täter fährt nur die Teile, die sein Urteil lesen (`traegt`, die Tafel TAETER), die übrigen liest er aus dem
    // Grund-Lauf derselben Seite (`grundTeile`) — dort ist die Welt gesund, sein Name fällt nur in seinem Teil. Ein Teil ist JSON.
    const teile = {};
    const teil = async (name, fn) => {
        const G = opts?.grundTeile;
        if (taeter && opts.traegt && G && !opts.traegt.includes(name) && G[name] !== undefined) return G[name];
        const v = await fn();
        if (opts?.teileAblegen) (teile[dorf.probe] || (teile[dorf.probe] = {}))[name] = JSON.parse(JSON.stringify(v));
        return v;
    };
    // DER HALTEPUNKT (Kreatur-Takt 22.11.): an der Grenze eines Felds, einer Jagd, einer Saat reicht die Probe ihr Zwischen-Ergebnis
    // an Node (`__taeterStelle` — das Urteil wohnt dort). Der Grund-Lauf legt am Punkt n sein Zwischen-Urteil ab; ein Täter endet am
    // ersten Punkt, an dem sein Wort in SEINEM Zwischen-Urteil steht und in dem des Grunds am selben Punkt nicht — sein Ergebnis ist
    // dieses Zwischen-Ergebnis (`__halt` n). Ohne den Ruf (die Werkbank, der Lauf ohne Selbsttest) fährt jede Probe ganz.
    // Der Punkt heißt nach seinem Fenster (`schluessel`, z. B. „rudel#7“: dieselbe Jagd am selben Ort), sonst zählt er.
    const stellen = {};
    const stelle = async (z, schluessel) => {
        if (typeof window.__taeterStelle !== "function" || Array.isArray(taeter)) return;
        const name = dorf.probe;
        const n = schluessel ?? (stellen[name] = (stellen[name] || 0) + 1);
        const json = JSON.parse(JSON.stringify(z));
        if (await window.__taeterStelle(name, taeter, n, json)) throw { __halt: n, z: json };
    };
    const buehne = async (name, fn) => {
        if (nur && !nur.includes(name)) return;
        Object.assign(dorf, { probe: name, hier: false });
        const altModus = r.getGameMode();
        const altGefuehl = Object.assign({}, s.player.emotions || {});
        const altSpieler = Object.assign({}, s.player);
        const altVel = s.playerVel ? [s.playerVel.x(), s.playerVel.y(), s.playerVel.z()] : null;
        const restore = (aufraeumen = []);
        if (s.playerVel) s.playerVel.setValue(0, 0, 0);
        // DIE BÜHNE ÜBER DIE EINE LEIHE (`leihe`, w18-mensch-deckel; bis dahin je Größe ein eigenes Merken und Zurück): eigene Tiere (die
        // Welt-Tiere ruhen); das Tempo des Spielers und die Spiel-Zeit samt dem Takt des Lebenszyklus kehren nach jeder Probe zurück.
        // DIE UHR DER BÜHNE: jede Probe beginnt am selben Takt der Kreatur-Uhr und des KI-Takts, mit frischen Fauna-Strömen
        // und dem Blick nach Norden — gleich, wie lange die Welt einschwang und welche Probe vorher lief.
        // DIE SIM-UHR DER BÜHNE (mahl-uhr): auch die Uhr des Schritts (`_simZeit`) steht je Probe auf der Kreatur-Uhr — die Nase liest
        // an ihr den Wind der Fahne (`_scentAt` → `_rauchWindAt`), die Probe an ihr den Wind, nach dem sie Rudel und Gäste stellt. Bis
        // hier trug sie, was das Einschwingen an der Wanduhr hinterließ (`_gameLoopTick(performance.now())`): mahl an 120 Sim-Uhren
        // 5…600 s 4 ROT — „kein Geruch: der baer/fuchs folgt dem Kadaver nicht (frisst 0 s)“ bei 180 · 310 · 515 s, „das Rudel frisst
        // nicht“ bei 290 s —, die CI an vier fremden Köpfen in Versuch 1 rot.
        // Fiedler 2004 („Fix Your Timestep“): die Simulation läuft auf ihrer eigenen Uhr, nie auf der Wanduhr — dieselbe Eingabe,
        // dasselbe Ergebnis
        // DER TAG DES SPIELERS (w18-mensch-deckel): jede Probe lebt den Tag des Gesetzes (`DAY_LENGTH_DEFAULT_MINUTES`) — die Bühne der
        // Werkbank hält ihn an (ausgabe-aufnahme `buehne`: die Tag-Länge des Halts 1e12, „eine Linse, die die Sonne laufen lässt,
        // setzt ihre eigene“), und nach jedem `umstellen` rechnete der Tag der Probe bewohner 2,5e11 Takte je Zehntel-Stunde
        // (`takte` aus der Tag-Länge der Welt), die Spielstunde der Bewohner (`_bewohnerStundeSek`) 2,5e12 s: der Faden blieb nach
        // dem Deckel belegt, die Sitzung der GTX starb an der Grundstellung danach (fe57747a, 5fb21e29: „/eval ohne Antwort“)
        // DER LEIB DES SPIELERS: sein Lauf (`playerVel`), seine Lage des Vor-Takts (`_spielerLageAlt`) und der Herden-Takt
        // beginnen je Probe in Ruhe.
        // DIE NAMEN DER BÜHNE: ihre Tiere zählen ihre netId ab derselben Marke, jenseits jedes Tiers der Welt — gleich, wie viele
        // die Welt vor der Bühne gebar. Die Identität trägt die Phase ihres Tages (der erste Ruhe-Pegel aus dem Hash der netId,
        // `_kreaturTaetigkeit`): bis hierher erbte sie den Zähler des Boots, die Ankunft des Plans gebar 10 Tiere statt 8, und
        // das Rotwild des Tages-Budgets zog 0,079 statt 0,081 (an den Marken 1000 · 3000 · 5000: 0,111 · 0,102 · 0,093)
        // DIE REIHE DER BÜHNE (w28-mp-boden): jede Probe trägt ihre eigene Reihe der Feld-Akte (`feldAkte`), wie ihr eigenes Feld und ihren
        // eigenen Bestand. Ein Akt wirkt am Eingang nur, wenn die Folge bis zu seinem Stempel steht (`_feldFolgeSteht`) — eine Bühne, die
        // keinen Takt des Bestands rechnet, lässt ihn in der Reihe, und die Probe danach stellte ihren Akt dahinter an: hinter sattel
        // (der Tod des Reittiers, 1 Akt `leben`) fing der Herd der Furcht-Probe, und keine der drei Herden floh (brand.flieht 0 von 3,
        // mit eigener Reihe 1 von 1 je Herd) — gleich, welche Probe vorher lief.
        const zurueck = [
            leihe(s, {
                creatures: [],
                creatureEmotions: [],
                maxCreatures: 64,
                creatureAnimationTime: 100,
                _simZeit: 100,
                _herdContagionAcc: 0,
                _creatureNetSeq: 1e6, // prettier-ignore
                dayLengthMinutes: A.DAY_LENGTH_DEFAULT_MINUTES,
                lifeField: undefined,
                emotionField: undefined,
                faunaBestand: undefined, // prettier-ignore
                feldAkte: [],
                speed: s.speed,
                sprintSpeed: s.sprintSpeed,
                jumpPower: s.jumpPower,
                spielZeit: s.spielZeit,
                faunaLifecycle: s.faunaLifecycle, // prettier-ignore
            }),
            // DER GAU GEHÖRT DER UHR (Leben C2b): seine Bilder, Akte und offenen Annahmen beginnen je Probe leer — die Uhr kehrt nach
            // jeder Probe zurück, ein Bild der Probe davor trug ihren Takt und stempelte jeden Akt danach in die Zukunft (der
            // Begleiter des Stands fand sein Tier nie, kein Kitz der Jagd stand im Bild)
            leihe(r, { _creatureAiFrame: 0, _faunaStroeme: null, _spielerLageAlt: null, _gauBildStand: null, _gauHaltStand: null, _gauOffen: null }), // prettier-ignore
        ];
        pm.copy(P0);
        kamera(0, -1);
        try {
            aus[name] = await fn(restore);
            if (teile[name] && aus[name] && typeof aus[name] === "object") aus[name].__teile = teile[name];
            if (window.__dorfVon && !dorf.hier)
                aus[name] = { fehler: `${name} lief im Start-Dorf, das ${window.__dorfVon} wachsen ließ — die Dorf-Proben laufen zuletzt` }; // prettier-ignore
        } catch (e) {
            aus[name] = e && e.__halt ? Object.assign(e.z, { __halt: e.__halt }) : { fehler: String(e?.stack || e).slice(0, 600) };
        } finally {
            for (const f of restore.reverse()) {
                try {
                    f();
                } catch {
                    /* Aufräumen bleibt best effort, die Zahl steht schon */
                }
            }
            leer();
            // DIE WELT KEHRT MIT DEM SPIELER HEIM: ließ die Probe die Welt fern takten (der Baum des Schwarms 526 m fort,
            // `__gebautNach`), streamt sie dort (Chunks, Streu, Wald) — die nächste Probe stünde mit ihren Tieren am Ort des
            // Spielers in einer Welt um den fremden Ort (jagdkreis nach dem Leittier: 1 von 42 Jagden ohne Ende, allein 0).
            // Steht der Strom in einem anderen Chunk als der Spieler, steht die Welt um ihn neu auf, ehe ihre Tiere zurückkehren.
            pm.copy(P0);
            const [{ span }, pc] = [r._voxelChunkConfig(), s.lastPlayerVoxelChunk];
            if (pc && (pc.cx !== Math.floor(P0.x / span) || pc.cz !== Math.floor(P0.z / span))) await __weltStehtNach();
            for (const f of zurueck) f();
            r.setGameMode(altModus);
            if (s.player.emotions) Object.assign(s.player.emotions, altGefuehl);
            pm.copy(P0);
            for (const k of Object.keys(s.player)) if (!(k in altSpieler)) delete s.player[k];
            Object.assign(s.player, altSpieler);
            if (altVel && s.playerVel) s.playerVel.setValue(altVel[0], altVel[1], altVel[2]);
        }
    };
    // Ein Ort auf Land (nicht im Wasser), relativ zum Spieler.
    const land = (dx, dz) => {
        for (let k = 0; k < 40; k++) {
            const x = P0.x + dx + (k % 8) * 3,
                z = P0.z + dz + Math.floor(k / 8) * 3;
            if (r._landAt(x, z)) return neben(x, z);
        }
        return { x: P0.x + dx, y: P0.y, z: P0.z + dz };
    };
    // DIE HÜLLE IM WEG: eine Hülle des Bestands, die den Leib-Raum über dem Grund h (Stufen-Höhe bis 2 m) näher als R an
    // (x, z) schneidet — dieselbe Nachbarschaft und Box-Probe wie der Leib (`_blockerUmPlatz` + `_boxAbstand2`).
    const huelleKand = [];
    const huelleNah = (x, z, h, R) => {
        huelleKand.length = 0;
        r._blockerUmPlatz(x, z, R + 8, huelleKand);
        for (const e of huelleKand)
            for (const b of e.blockerAABBs || []) {
                if (b.topY <= h + A.PLAYER_STEP_UP || b.botY >= h + 2) continue;
                if (r._boxAbstand2(b, x, z) < R * R) return true;
            }
        return false;
    };
    // DAS LAND DER WILDNIS im Umkreis R: Land und kein Grundriss (`_imGrundriss`: Haus, Bau, Weg eines Dorfs und die Flächen des
    // Genesis-Orts — Kern, Ring, Mall, Allee, Wiese, Ufer, die Bühnen), an der Mitte und auf zwei Kreisen je acht Orte — dort wirft
    // das Feld (`_kreaturGrundFrei`: kein Wurf eines Verbands auf einer Fläche des Plans). Bis Pflicht F trug die Ankunft eine
    // Scheibe von 6,5 m, die Wildnis begann am Spieler; seit dem Plan liegt 0/70 auf der Mall (herde: 1 Glied von 5) und der
    // Jagd-Kreis über Wiese, Allee und Ufer (rudel 28/60 Risse auf dem Rasen).
    const imUmkreisLand = (x, z, R) => {
        if (r._imGrundriss(x, z)) return false;
        for (const f of [0.5, 1])
            for (let q = 0; q < 8; q++) {
                const a = (q / 8) * TAU;
                const [px, pz] = [x + Math.cos(a) * R * f, z + Math.sin(a) * R * f];
                if (!r._landAt(px, pz) || r._imGrundriss(px, pz)) return false;
            }
        return true;
    };
    // DIE SPIRALE der Ortssuche um den Spieler + (dx, dz): Ring k im Abstand k × schritt trägt 6k Orte; der erste, dem
    // `nimm(x, z)` einen Ort gibt
    const spirale = (dx, dz, ringe, schritt, nimm) => {
        for (let ring = 0; ring < ringe; ring++) {
            const n = Math.max(1, ring * 6);
            for (let q = 0; q < n; q++) {
                const a = (q / n) * TAU;
                const o = nimm(P0.x + dx + Math.cos(a) * ring * schritt, P0.z + dz + Math.sin(a) * ring * schritt);
                if (o) return o;
            }
        }
        return null;
    };
    // Ein Ort auf dem Land der Wildnis ohne Hülle und ohne Wasser im Umkreis R (an einer Wand gleitet ein Leib längs der
    // Box-Kante, im Wasser schwimmt er ans Ufer — das misst die Hindernis- bzw. Wasser-Probe, nicht die Richtung der Jagd)
    const frei = (dx, dz, R) =>
        spirale(dx, dz, 40, 8, (x, z) => {
            const o = r._landAt(x, z) && imUmkreisLand(x, z, R) && neben(x, z);
            return o && !huelleNah(x, z, o.y - 0.5, R) ? o : null;
        });
    // DAS FELD OHNE HÖHLE: unter dem Weg des Spielers und der Folger (x −10…+35, z −8…+35) liegt 15 m tief keine Höhle —
    // die Wand hält ein Tier in jeder Höhle, in die es läuft; die Gang-Probe misst den freien Lauf
    const ohneHoehle = (x0, z0, x1, z1) => {
        for (let x = x0; x <= x1; x += 3)
            for (let z = z0; z <= z1; z += 3) {
                const top = r._voxelSurfaceY(x, z);
                if (!Number.isFinite(top)) return false;
                for (const t of [1, 3, 6, 10, 15]) if (!r._fieldSolid(x, top - t, z)) return false;
            }
        return true;
    };
    const feldOhneHoehle = (dx, dz) =>
        spirale(dx, dz, 30, 10, (x, z) => {
            // die EINE Nässe am Körper (kein stiller Wächter: fehlt sie, bricht der Lauf)
            return r._nassAt(x, z) || !ohneHoehle(x - 10, z - 8, x + 35, z + 35) ? null : neben(x, z);
        });
    // DER ORT NEBEN DEM SPIELER auf dem Land: die Höhe des Spielers ist am Hang nicht die des Tiers
    const neben = (x, z) => {
        const h = r.getTerrainHeightAt(x, z);
        return { x, y: (Number.isFinite(h) ? h : pm.y) + 0.5, z };
    };
    const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z); // der Abstand in der Ebene
    const tier = (p, seele, bodySize) => {
        const c = r.spawnCreatureAt(p.x, p.y, p.z, "happy", seele, { precise: true, bodySize: bodySize || 1 });
        if (!c) throw new Error("Spawn " + seele);
        return c;
    };
    const ruhig = (c) => {
        c.userData.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
    };
    // ALLE LEIBER WEG: die Lebenden, mit `tote` auch die Gefallenen
    const leer = (tote) => [...s.creatures, ...(tote ? s.leichname : [])].forEach((c) => r.removeCreature(c));
    // der Spieler ruhig (oder im Gefühl e), je Takt: ein zorniger verschreckt jedes Tier, die Ansteckung im Kreatur-Takt trägt
    // die Furcht der Beute zu ihm
    const ruhigSpieler = (e) => {
        if (s.player.emotions)
            Object.assign(s.player.emotions, { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 }, e);
    };
    // DIE KAMERA DER BÜHNE ist ihr Rig: der Blick aus dem Kopf des Spielers SETZT das Auge der Stufen (`_lodAugeGesetzt`, K36 —
    // wie das Rig je Bild), es reist mit dem Spieler bis zur nächsten Kamera. Ohne Setzung band erst die nächste Lesung den
    // Spieler, nach seinem Sprung: am Querhang stand das Auge 81 m von ihm am alten Ort, und jede Probe danach erbte es
    // (tiersatz: 43 von 50 Tieren jenseits der Feld-Grenze als Leib, der Satz leer). Ihr Inverses trägt die Kamera selbst
    // (three `Camera.updateMatrixWorld`).
    const kamera = (blickX, blickZ, blickY = 0) => {
        const cam = s.camera;
        cam.position.set(pm.x, pm.y + 1.6, pm.z);
        cam.lookAt(pm.x + blickX, pm.y + 1.6 + blickY, pm.z + blickZ);
        cam.updateMatrixWorld(true);
        r._lodAugeGesetzt();
        r._loopFrustumCulling();
    };
    const imBlick = (x, y, z) => {
        return r._frustumVon(s.camera).containsPoint(new T.Vector3(x, y, z));
    };
    // DER PLATZ EINES SATZ-TIERS: die Instanz der Tier-Senke `teil` (fell · wurf …), deren Lage c trägt
    const satzPlatz = (c, teil) => {
        for (const m of s.scene.children) {
            if (!m.isInstancedMesh || m.userData.inventar !== "tier" || m.userData.teil !== teil) continue;
            const e = m.instanceMatrix.array;
            for (let i = 0; i < m.count; i++)
                if (Math.hypot(e[i * 16 + 12] - c.position.x, e[i * 16 + 14] - c.position.z) < 1e-3) return { m, i };
        }
        return null;
    };
    // DIE PFOTEN EINES TIERS: der Aufsetz-Punkt jeder Pfote im Pfoten-Raum, in der Stand-Pose (die Linse von gate:tier-gang)
    // — null ohne Nah-Gestalt oder ohne eines der Glieder `noch`
    const pfotenRaum = (cr, noch) => {
        const Tt = cr.userData._tierBaum && cr.userData._tierBaum.teile;
        const ps = Tt ? [Tt.flP, Tt.frP, Tt.hlP, Tt.hrP] : [null];
        if (ps.some((p) => !p) || noch.some((k) => !Tt[k])) return null;
        r._tierBaumNeutralStance(cr);
        cr.updateMatrixWorld(true);
        const lokal = ps.map((p) => {
            const w = new T.Vector3().setFromMatrixPosition(p.matrixWorld);
            w.y = cr.position.y;
            return p.worldToLocal(w);
        });
        return { ps, lokal, glieder: noch.map((k) => Tt[k]) };
    };
    // Täter-Einspielung (Selbsttest): eine Methode der Instanz überdecken, im Aufräumen der Bühne zurück (oder früher über `ab`).
    const decke = (name, fn, ab = aufraeumen) => ab.push(leihe(r, { [name]: fn(r[name]) }));
    // DER BESTAND EINER ART liest jede Probe am EINEN Leser des Spiels (`_bestandArt`): Hirsch und Wolf leben im Gau-Faden (Leben
    // C2b), ihr Bestand ist das Bild seiner letzten Antwort. `gauLies(keys)` bestellt das Bild der Reviere der Regionen `keys` am
    // Takt des Horizonts mit dem Ruf des Spiels (`_gauBis` → `_gauAntwort`, wie `_gauTakt` je Bild — dazu die Reviere, die das
    // Bild schon trägt); eine Bestellung des Spiels im Flug landet vorher. Kein Bestand ist 0, ehe ihn jemand gelesen hat.
    const gauLies = async (keys) => {
        const [T, je] = [A._bestandGesetz().B.taktS, new Map()];
        for (const key of keys) {
            const [ix, iz] = key.split(",").map(Number);
            const o = r._gauOrt(ix, iz);
            (je.get(o.gx + "," + o.gz) || je.set(o.gx + "," + o.gz, { o, lesen: new Set() }).get(o.gx + "," + o.gz)).lesen.add(o.revier); // prettier-ignore
        }
        for (const [k, { o, lesen }] of je) {
            const b = r._gauBild(o.gx, o.gz);
            for (let i = 0; b.flug; i++) {
                if (i > 2400) throw new Error(`der Gau ${k} antwortet nicht binnen 60 s`);
                await sleep(25);
            }
            const L = [...new Set([...lesen, ...b.reviere.keys()])].sort((p, q) => p - q);
            const takt = Math.max(0, Math.floor(r._feldHorizont() / T));
            const aktN = (r._gauHalt().get(k) || []).length;
            [b.flug, b.bestellt] = [true, Math.max(b.bestellt, takt)];
            r._gauAntwort(b, await r._gauBis(o.gx, o.gz, takt, { lesen: L }), L.join(), aktN);
        }
    };
    // DER ALTE JAGD-WEG als Täter (jagdkreis, rudel): im Schritt-Tempo geradewegs auf das Ziel, kein Platz im Rudel, keine Hetze
    const schrittJagd = () =>
        decke(
            "_kreaturJagdZug",
            () =>
                function (c, tx, tz, key, direction, speed) {
                    c.userData._jagdZiel = key;
                    this._kreaturZustandStempel(c, "jagd");
                    const dx = tx - c.position.x,
                        dz = tz - c.position.z;
                    const J = A._verhaltenGesetz().jagd;
                    // der alte Pirsch-Stopp (1,6 m um die Mitten — jagd.pirschStoppM fiel mit dem Biss im Ansprung)
                    this._kreaturZiel(direction, dx, dz, Math.hypot(dx, dz) - 1.6, speed * J.speedBoost);
                }
        );
    // DIE UHR DER BÜHNE rückt um `d` Sekunden (der EINE Weg der Welt-Uhr, `_weltUhrNimm`) — der eine Uhr-Schritt der Proben
    const uhrVor = (d) => r._weltUhrNimm(s.spielZeit + d);
    // DER TAKT WIE IM SPIEL (die Folge von `_gameLoopTick`): erst der feste Sim-Schritt der Leiber (`_kreaturStossSchritt`,
    // `_leibKontakte`), dann der Frame-Takt der Tiere (`updateCreatures`).
    const takt = (dt) => {
        r._kreaturStossSchritt(dt);
        r._leibKontakte();
        r.updateCreatures(dt);
    };
    // DER GANG IM SATZ (Schlupf wie gate:tier-gang): je Senke mit Gang-Puffer die Füße der Vorlage (`fuesse(geo)`, je Fuß
    // seine Ecken) an Band, Phase und Gewicht ihrer Instanz (`aGang`) × Instanz-Matrix, wie die GPU sie zeichnet; `leib(x, z)`
    // nennt den Leib der Instanz. Gezählt wird der eingeschwungene Gang geradeaus in einem Band; Stand = unterste 5 % des Beins.
    const satzGang = (fuesse, leib) => {
        const memo = new WeakMap();
        const spuren = new Map();
        const m4 = new T.Matrix4();
        const vL = new T.Vector3();
        let n = 0;
        const lokal = (m, inst, v) => {
            const G = m.userData.gang;
            const a = m.geometry.attributes;
            const x = a.aGang.getX(inst);
            // (das Gewicht trägt den Stand der Instanz mit: y = 2 · Stand + Gewicht, `_gangSatzInstanz`)
            const hs = Math.floor(a.aGang.getY(inst) / 2);
            const w = a.aGang.getY(inst) - 2 * hs;
            const r0 = Math.floor(x) * G.n;
            const f = (x - Math.floor(x)) * G.n;
            const k0 = Math.floor(f);
            const zs = G.baender * G.n + hs;
            // (der Stand in der Zeit, stand-lebt: die Zeile k0 seiner Uhr und die nächste seines Zyklus um den Bruch von w, wie der Knoten)
            const HZ = G.standZeilen || 1;
            const zs1 = zs - (hs % HZ) + (((hs % HZ) + 1) % HZ);
            const ts = HZ > 1 ? a.aGang.getW(inst) - Math.floor(a.aGang.getW(inst)) : 0;
            const z0 = r0 + k0;
            const z1 = r0 + ((k0 + 1) % G.n);
            // der Knochen j, Zeile r, Spalte c der Matrix in der Pose-Zeile z (drei Texel je Knochen)
            const el = (z, j, r, c) => G.puffer[((z * G.J + j) * 3 + r) * 4 + c];
            const roh = [a.aRoh.getX(v), a.aRoh.getY(v), a.aRoh.getZ(v), 1];
            const o = [0, 0, 0];
            for (let c = 0; c < 4; c++) {
                const g = a.aGewicht.getComponent(v, c);
                if (g === 0) continue;
                const j = a.aKnochen.getComponent(v, c);
                for (let r = 0; r < 3; r++)
                    for (let s = 0; s < 4; s++) {
                        const lauf = el(z0, j, r, s) + (f - k0) * (el(z1, j, r, s) - el(z0, j, r, s));
                        const st = el(zs, j, r, s) + ts * (el(zs1, j, r, s) - el(zs, j, r, s));
                        o[r] += g * roh[s] * (st + w * (lauf - st));
                    }
            }
            return vL.set(o[0], o[1], o[2]);
        };
        const messen = (senken) => {
            n++;
            for (const m of senken) {
                if (!m.userData.gang || !(m.count > 0)) continue;
                if (!memo.has(m.geometry)) memo.set(m.geometry, fuesse(m.geometry));
                const F = memo.get(m.geometry);
                const IM = m.instanceMatrix.array;
                const aG = m.geometry.attributes.aGang;
                for (let inst = 0; F && inst < m.count; inst++) {
                    const L = leib(IM[inst * 16 + 12], IM[inst * 16 + 14]);
                    const key = L && m.uuid + "|" + L.key;
                    if (L && !spuren.has(key)) spuren.set(key, { reihe: [], bein: L.bein });
                    if (!L || spuren.get(key).reihe.length >= 1800) continue;
                    m4.fromArray(IM, inst * 16);
                    const fuss = F.map((vs) =>
                        vs.map((v) => {
                            const y = lokal(m, inst, v).y;
                            const w = vL.applyMatrix4(m4);
                            return { y, x: w.x, z: w.z };
                        })
                    );
                    const b = Math.floor(aG.getX(inst));
                    spuren.get(key).reihe.push({ fuss, x: L.x, z: L.z, ry: L.ry, w: aG.getY(inst), b, n });
                }
            }
        };
        const schlupf = () => {
            let wegFuss = 0;
            let wegLeib = 0;
            for (const sp of spuren.values()) {
                const R = sp.reihe;
                for (let j = 0; j < R[0].fuss.length; j++) {
                    let ymin = Infinity;
                    for (const e of R) for (const p of e.fuss[j]) ymin = Math.min(ymin, p.y);
                    for (let i = 1; i < R.length; i++) {
                        const [a0, a1] = [R[i - 1], R[i]];
                        if (a1.n !== a0.n + 1 || Math.abs(a1.ry - a0.ry) > 1e-3) continue;
                        if (Math.min(a0.w, a1.w) < 0.99 || a0.b !== a1.b) continue;
                        let k = 0;
                        for (let q = 1; q < a1.fuss[j].length; q++) if (a1.fuss[j][q].y < a1.fuss[j][k].y - 1e-4) k = q;
                        const [p, q] = [a0.fuss[j][k], a1.fuss[j][k]];
                        if (Math.max(p.y, q.y) > ymin + 0.05 * sp.bein) continue;
                        wegFuss += ab(q, p);
                        wegLeib += ab(a1, a0);
                    }
                }
            }
            const schlupf = wegLeib > 0 ? Math.round((wegFuss / wegLeib) * 1000) / 1000 : null;
            return { schlupf, wegLeib: Math.round(wegLeib * 10) / 10 };
        };
        // eine Lücke (ein neues Gang-Fenster): kein Paar über sie hinweg
        return { messen, schlupf, luecke: () => n++ };
    };
    // Der Wand-Kontakt je Takt — instrumentiert, nicht gestubbt: die Linse merkt nur, wessen Lage der Hüllen-Kontakt
    // schob; freier Lauf und Anprall zählen getrennt.
    const kontaktZaehler = () => {
        const geschoben = new Set();
        decke(
            "_kreaturHuellenKontakt",
            (alt) =>
                function (c, ...rest) {
                    const x = c.position.x,
                        z = c.position.z;
                    const o = alt.call(this, c, ...rest);
                    if (c.position.x !== x || c.position.z !== z) geschoben.add(c.position);
                    return o;
                }
        );
        // DER EINE LEIB-LÖSER im Sim-Schritt (`_leibKontakte`): ein Leib, den er aus einem anderen oder aus dem Spieler
        // schiebt, prallt — derselbe Anprall wie an der Wand.
        decke(
            "_leibKontakte",
            (alt) =>
                function (...a) {
                    const vor = this.state.creatures.map((c) => [c.position, c.position.x, c.position.z]);
                    const o = alt.apply(this, a);
                    for (const [p, x, z] of vor) if (p.x !== x || p.z !== z) geschoben.add(p);
                    return o;
                }
        );
        return geschoben;
    };

    // ── geister: clearCreatures räumt jedes Tier ──
    await buehne("geister", async () => {
        if (taeter === "geister")
            r.clearCreatures = function () {
                this.state.creatures.forEach((c) => this.removeCreature(c));
                this.state.creatures = [];
                this.state.creatureEmotions = [];
            };
        try {
            for (let i = 0; i < 6; i++) tier(land(90 + i * 4, 40), i % 2 ? "fuchs" : "wesen");
            const meine = s.creatures.slice();
            r.clearCreatures();
            // ein Geist: aus der Liste gefallen, aber noch in der Szene (eingefroren, sichtbar, zahlt jeden Pass)
            const geister = meine.filter((c) => c.parent && !s.creatures.includes(c));
            for (const g of geister) r.removeCreature(g);
            return { vorher: meine.length, geister: geister.length };
        } finally {
            if (taeter === "geister") delete r.clearCreatures;
        }
    });

    // ── sattel: der Tod im Sattel steigt ab ──
    await buehne("sattel", async (restore) => {
        const KS = A.KIND_SUBSTANCE || {};
        if (!KS.fahrzeug_wagen) return { fehler: "KIND_SUBSTANCE.fahrzeug_wagen fehlt" };
        s.blueprints._t_linse_wagen = {
            name: "_t_linse_wagen",
            parts: jsonKlon(KS.fahrzeug_wagen.parts),
            connections: jsonKlon(KS.fahrzeug_wagen.connections || []),
        };
        const p = land(30, 30);
        const e = r.spawnArchitecture("_t_linse_wagen", p, { silent: true });
        restore.push(() => {
            if (s.player.mountedArch != null) r.dismountArchitecture();
            if (e) r.removeArchitecture(e);
            delete s.blueprints._t_linse_wagen;
            s.player.deathWoundIntensity = 0;
        });
        if (!e) return { fehler: "Wagen-Spawn" };
        r.mountArchitecture(e);
        const auf = s.player.mountedArch === e.id;
        if (taeter === "sattel")
            decke(
                "_playerDeathRespawn",
                (alt) =>
                    function (q) {
                        const m = this.state.player.mountedArch;
                        alt.call(this, q);
                        this.state.player.mountedArch = m;
                    }
            );
        s.player.respawnGraceUntil = -Infinity;
        r._playerDeathRespawn("linse");
        return { aufgestiegen: auf, nachTod: s.player.mountedArch == null ? null : s.player.mountedArch };
    });

    // ── huepfer: jeder Sprung aus einer Aktion über das EINE Sprung-Gesetz (creatureJump), auf die Höhe des Freude-Gesetzes
    // (VERHALTEN.freude), und die Flugzeit hängt nie am Takt ──
    await buehne("huepfer", async () => {
        r.setGameMode("frieden");
        // Die Kreatur-Uhr fest (die Aktions-Wahl hasht Index × Zeit): jeder Lauf wählt dieselben Aktionen — sonst hing die
        // Zahl der Sprünge (3–5) an der Boot-Dauer der Welt.
        const F = A._verhaltenGesetz().freude;
        const hoehe = (c) => (s.creatureEmotions[s.creatures.indexOf(c)] === "happy" ? F.hopHochM : F.hopBasisM);
        const tiere = [];
        for (let i = 0; i < 6; i++) {
            const c = tier(land(18 + i * 3, 22), "wesen");
            r.assignCreatureTask(c, "wait", {}, { silent: true });
            tiere.push(c);
        }
        // Der Konsum des Sprung-Gesetzes: wie oft creatureJump einen Sprung STARTET (instrumentiert, durchgereicht).
        let rufe = 0;
        decke(
            "creatureJump",
            (alt) =>
                function (c, ...rest) {
                    const ud = c && c.userData;
                    const flog = !!ud && (ud._hopV > 0 || ud._hopH > 0);
                    const o = alt.call(this, c, ...rest);
                    if (ud && !flog && ud._hopV > 0) rufe++;
                    return o;
                }
        );
        if (taeter === "huepfer")
            decke(
                "updateCreatures",
                (alt) =>
                    function (dt) {
                        alt.call(this, dt);
                        for (let i = 0; i < this.state.creatures.length; i++) {
                            const c = this.state.creatures[i];
                            const h =
                                ((c.userData.netId.length * 7919 +
                                    Math.floor(this.state.creatureAnimationTime * 60) * 104729 +
                                    i) %
                                    997) /
                                997;
                            if (h < 0.02 && !(c.userData._hopH > 0)) this.creatureJump(c);
                        }
                    }
            );
        // Der alte Integrator: die Höhe stieg nur mit dem Impuls, im Fall fror `_hopH` am Scheitel ein (an der Mess-Wiese
        // stand ein Bär 7,6 m über dem Boden; bis heim-z27 das Playtest-Band „DER HÜPFER LANDET“, diese Probe trägt es).
        if (taeter === "huepfer-scheitel")
            decke(
                "updateCreatures",
                (alt) =>
                    function (dt) {
                        const vor = this.state.creatures.map((c) => c.userData._hopH || 0);
                        alt.call(this, dt);
                        this.state.creatures.forEach((c, i) => {
                            if (vor[i] > 0 && !(c.userData._hopV > 0)) c.userData._hopH = vor[i];
                        });
                    }
            );
        // Der Zwilling: die Aktion zündet den Hüpfer mit ihrem eigenen Abflug in m/s,
        // am Sprung-Gesetz vorbei.
        if (taeter === "huepfer-zwilling")
            decke(
                "_tickKreaturVerhalten",
                (alt) =>
                    function (c, ...rest) {
                        const ud = c.userData;
                        const vor = ud && ud._verhaltenAktion;
                        const o = alt.call(this, c, ...rest);
                        const VA = ud && ud._verhaltenAktion;
                        if (VA && VA !== vor && VA.def && VA.def.hop && ud._hopV > 0) ud._hopV = 3.2;
                        return o;
                    }
            );
        const dt = 1 / 60;
        let frames = 0,
            luft = 0,
            starts = 0,
            ausAktion = 0;
        const warLuft = tiere.map(() => false);
        const flugNun = tiere.map(() => null); // je Tier der laufende Sprung: {soll, top}
        const fehler = [];
        for (let k = 0; k < 2400; k++) {
            for (let i = 0; i < tiere.length; i++) if (i < 3) tiere[i].userData.emotions.joy = 0.9;
            takt(dt);
            for (let i = 0; i < tiere.length; i++) {
                const ud = tiere[i].userData;
                const h = ud._hopH || 0;
                const istLuft = h > 0.005;
                frames++;
                if (istLuft) luft++;
                if (istLuft && !warLuft[i]) {
                    starts++;
                    const VA = ud._verhaltenAktion;
                    if (VA?.def && VA.def.hop) ausAktion++;
                    flugNun[i] = { soll: hoehe(tiere[i]), top: 0 };
                }
                if (flugNun[i]) flugNun[i].top = Math.max(flugNun[i].top, h);
                if (!istLuft && warLuft[i] && flugNun[i]) {
                    fehler.push(Math.abs(flugNun[i].top / flugNun[i].soll - 1));
                    flugNun[i] = null;
                }
                warLuft[i] = istLuft;
            }
        }
        // Der Takt-Beweis: derselbe Sprung bei 30 und 144 Hz (Scheitel und Flugzeit in Sim-Sekunden), und der Scheitel ist
        // das Freude-Gesetz — froh hopHochM, sonst hopBasisM.
        const flug = (hz, etikett) => {
            const c = tiere[0];
            r.assignCreatureTask(c, "wait", {}, { silent: true });
            c.userData._hopH = 0;
            c.userData._hopV = 0;
            c.userData._verhaltenAktion = null;
            if (c.userData.emotions) c.userData.emotions.joy = 0; // ein ruhiges Wesen trägt keine (null, nach langem Flug)
            takt(1 / hz);
            s.creatureEmotions[s.creatures.indexOf(c)] = etikett;
            const soll = hoehe(c);
            r.creatureJump(c);
            let t = 0,
                top = 0,
                n = 0;
            for (; n < 4000; n++) {
                takt(1 / hz);
                t += 1 / hz;
                top = Math.max(top, c.userData._hopH || 0);
                if (!((c.userData._hopH || 0) > 0)) break;
            }
            return { t, top, soll };
        };
        const rufeImLauf = rufe; // die Flug-Proben unten rufen creatureJump selbst
        const f30 = flug(30, "happy"),
            f144 = flug(144, "happy"),
            fSad = flug(60, "sad");
        return {
            luftAnteil: rund(luft / frames, 4),
            starts,
            ausAktion,
            rufe: rufeImLauf,
            gesetzFehler: fehler.length ? rund(Math.max(...fehler), 3) : null,
            hopHochM: F.hopHochM,
            hopBasisM: F.hopBasisM,
            flug30: { top: rund(f30.top, 3) },
            flugVerhaeltnis: f30.t > 0 ? rund(f144.t / f30.t, 3) : null,
            frohFehler: rund(Math.abs(f30.top / f30.soll - 1), 3),
            basisTop: rund(fSad.top, 3),
            basisFehler: rund(Math.abs(fSad.top / fSad.soll - 1), 3),
        };
    });

    // ── wachsen: 3600 Wachstums-Takte am Loop-Pfad ──
    await buehne("wachsen", async () => {
        const c = tier(land(95, -40), "wesen");
        r.assignCreatureTask(c, "wait", {}, { silent: true });
        const s0 = c.scale.x;
        if (taeter === "wachsen")
            decke(
                "_loopWeatherAndGrowth",
                (alt) =>
                    function (dt, t) {
                        alt.call(this, dt, t);
                        for (const k of this.state.creatures)
                            if (Math.floor(t) % 20 === 0) k.scale.multiplyScalar(1.01);
                    }
            );
        // 3600 Spiel-Sekunden am Loop-Pfad (je Aufruf eine Sekunde weiter)
        const t0 = 1e6;
        for (let k = 0; k < 3600; k++) r._loopWeatherAndGrowth(1 / 60, t0 + k);
        return { skala: rund(c.scale.x / s0, 4) };
    });

    // ── gier: die Tiere folgen dem Spieler im Quadrat ──
    await buehne("gier", async () => {
        r.setGameMode("frieden");
        const arten = ["wesen", "wolf", "fuchs"];
        const start = feldOhneHoehle(0, 0);
        if (!start) return { fehler: "kein Feld ohne Höhle (45 × 43 m, 15 m tief) für den Gang" };
        pm.set(start.x, start.y, start.z);
        const tiere = arten.map((a, i) => {
            const c = tier(neben(pm.x - 4 - i * 2, pm.z - 3), a);
            ruhig(c);
            r.assignCreatureTask(c, "follow_player", {}, { silent: true });
            return c;
        });
        if (taeter === "gier")
            decke(
                "updateCreatures",
                (alt) =>
                    function (dt) {
                        alt.call(this, dt);
                        for (const c of this.state.creatures) c.rotation.y = 0;
                    }
            );
        // Folgen als Gas oder Bremse: jenseits des Halts das volle Tempo, davor 0 (am Ankunfts-Gesetz vorbei).
        if (taeter === "gier-folgen")
            decke(
                "_kreaturZiel",
                () =>
                    function (out, dx, dz, rest, vMax) {
                        const d = Math.hypot(dx, dz);
                        if (!(d > 1e-6) || !(rest > 0) || !(vMax > 0)) return out.set(0, 0, 0);
                        return out.set((dx / d) * vMax, 0, (dz / d) * vMax);
                    }
            );
        // Pfoten: der Aufsetz-Punkt jeder Pfote im Pfoten-Raum (die Linse von gate:tier-gang, frei gegiert).
        const pfoten = tiere.map((cr) => {
            const P = pfotenRaum(cr, ["legHL"]);
            return P && { ps: P.ps, lokal: P.lokal, spur: P.ps.map(() => []), leib: [], ph: [] };
        });
        const dt = 1 / 60;
        const v = 1.4; // m/s — der Spieler geht
        const ecken = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
        ];
        const zeilen = tiere.map(() => ({
            abw: [],
            rueck: 0,
            lauf: 0,
            beschl: [],
            phase: 0, // +1 Gas, −1 Bremse (im freien Lauf, |a| > 1,5 m/s²)
            wechsel: 0, // Gas ↔ Bremse
            freiT: 0,
        }));
        const vorher = tiere.map((c) => ({ x: c.position.x, z: c.position.z, v: 0, anprall: false }));
        const geschoben = kontaktZaehler();
        let k = 0;
        for (const [ex, ez] of ecken) {
            for (let j = 0; j < Math.round(30 / v / dt); j++, k++) {
                pm.x += ex * v * dt;
                pm.z += ez * v * dt;
                takt(dt);
                tiere.forEach((c, i) => {
                    const dx = c.position.x - vorher[i].x,
                        dz = c.position.z - vorher[i].z;
                    const sp = Math.hypot(dx, dz) / dt;
                    const z = zeilen[i];
                    const anprall = geschoben.has(c.position);
                    if (k > 60) {
                        // der Tempo-Sprung im FREIEN Lauf (der Anprall-Takt und der danach zählen nicht)
                        if (!anprall && !vorher[i].anprall) {
                            const a = (sp - vorher[i].v) / dt;
                            z.beschl.push(Math.abs(a));
                            z.freiT += dt;
                            // GAS ODER BREMSE: wie oft der Folger zwischen Anfahren und Bremsen umschlägt — das
                            // Ankunfts-Gesetz lässt ihn im Tempo des Spielers einlaufen, ein 4-oder-0-Wunsch pumpt.
                            const ph = a > 1.5 ? 1 : a < -1.5 ? -1 : 0;
                            if (ph && z.phase && ph !== z.phase) z.wechsel++;
                            if (ph) z.phase = ph;
                        }
                    }
                    // Lauf ↔ Blick im FREIEN Lauf (schiebt die Wand den Leib zurück, ist das kein Rückwärtsgang)
                    if (sp > 0.3 && k > 60 && !anprall) {
                        const a = Math.abs(grad(wrap(Math.atan2(dx, dz) - c.rotation.y)));
                        z.abw.push(a);
                        z.lauf++;
                        if (a > 90) z.rueck++;
                    }
                    vorher[i] = { x: c.position.x, z: c.position.z, v: sp, anprall };
                    const pf = pfoten[i];
                    if (pf) {
                        c.updateMatrixWorld(true);
                        const g = c.userData._tierBaum && c.userData._tierBaum._gang;
                        pf.leib.push({ x: c.position.x, z: c.position.z, y: c.position.y, sp, gier: c.rotation.y });
                        pf.ph.push(g?.ph ? g.ph.slice() : null);
                        pf.ps.forEach((p, j2) => pf.spur[j2].push(p.localToWorld(pf.lokal[j2].clone())));
                    }
                });
                geschoben.clear();
            }
        }
        // DER STAND-SCHLUPF: im STAND einer Pfote (Gang-Phase in [π, 2π)) wandert ihr Aufsetz-Punkt nicht mit dem Leib —
        // Weg des Stand-Fußes / Weg des Leibs, QUER (der Krebsgang, geurteilt) und LÄNGS zur Laufrichtung (als Zahl).
        const TAU2 = Math.PI * 2;
        const imStand = (ph, j) => {
            if (!ph) return false;
            const u = ((ph[j] % TAU2) + TAU2) % TAU2;
            return u >= Math.PI;
        };
        const schlupf = pfoten.map((pf) => {
            if (!pf) return null;
            let wegL = 0,
                wegQ = 0,
                wegH = 0;
            for (let j = 0; j < 4; j++) {
                for (let n = 61; n < pf.spur[j].length; n++) {
                    const a = pf.spur[j][n - 1],
                        b = pf.spur[j][n];
                    if (pf.leib[n].sp < 0.3) continue;
                    if (!imStand(pf.ph[n - 1], j) || !imStand(pf.ph[n], j)) continue;
                    const dx = b.x - a.x,
                        dz = b.z - a.z;
                    const g = pf.leib[n].gier;
                    wegQ += Math.abs(dx * Math.cos(g) - dz * Math.sin(g));
                    wegH += Math.abs(dx * Math.sin(g) + dz * Math.cos(g));
                    wegL += ab(pf.leib[n], pf.leib[n - 1]);
                }
            }
            return wegL > 0 ? { q: rund(wegQ / wegL, 3), l: rund(wegH / wegL, 3) } : null;
        });
        const o = {};
        arten.forEach((a, i) => {
            const z = zeilen[i];
            o[a] = {
                laufFrames: z.lauf,
                abwP90: z.abw.length ? rund(quantil(z.abw, 0.9), 1) : null,
                rueckwaerts: z.lauf ? rund(z.rueck / z.lauf, 3) : 0,
                beschlMax: rund(Math.max(...z.beschl), 1),
                gasBremseJeMin: z.freiT > 0 ? rund((z.wechsel / z.freiT) * 60, 1) : null,
                schlupfQuer: schlupf[i] ? schlupf[i].q : null,
                schlupfLaengs: schlupf[i] ? schlupf[i].l : null,
            };
        });
        return o;
    });

    // ── jagd: an drei Orten ein Rudel und sechs Kitze im Nah-Kreis des Spielers, je 180 s am ECHTEN Takt samt dem
    // Lebenszyklus in der Spiel-Zeit (`tickFaunaLifecycle`, wie im Spiel; der Prüfer von Zug 29 sah dort 14 Risse ohne Jäger):
    // der Lauf der Wölfe folgt der Peilung, nie den Achsen; jeder Tod durch Jagd im Nah-Kreis (ANALOG_NAH_M, das Feld) hat
    // einen Jäger, dessen Maul den Leib erreicht (`_kreaturBissSpalt` ≤ `_kreaturBissReich`: nah als Körper, oekologie.K2);
    // sein Tier verlässt den Bestand MIT seinem Tod (gelesen am Tod selbst: `_kreaturFaellt` → `_bestandAus`, im selben Ruf);
    // dann geht der Spieler fort, und jedes Opfer, das ein Riss im Nah-Kreis nannte (`_kreaturRiss`), fehlt ihm weiter — je Riss
    // EINES (der Übergang ändert nie den Bestand) ──
    await buehne("jagd", async () => {
        r.setGameMode("pfad");
        s.player.hp = 1e9;
        const nah = (c) => ab(c.position, pm) < A.ANALOG_NAH_M;
        // der Riss des Gesetzes als Täter: er tötet das Opfer im Nah-Kreis wie fern (die Zahl, kein Jäger am Leib) — je Takt des
        // Lebenszyklus das erste Kitz des Bestands im Nah-Kreis
        if (taeter === "riss")
            decke("tickFaunaLifecycle", (alt) => (...a) => {
                const o = alt.apply(r, a);
                const c = s.creatures.find((q) => q.userData._bestand && q.userData.soul === "wesen" && nah(q));
                if (c) r._creatureCombatDeath(c, "jagd");
                return o;
            });
        if (taeter === "jagd-schritt") schrittJagd();
        // der Übergang verliert den Riss: der Tod im Nah-Kreis erreicht den Bestand nicht (sein Akt „aus“ fällt aus)
        if (taeter === "riss-verloren")
            decke("_bestandAus", (alt) => (c) => (nah(c) ? void (c.userData._bestand = null) : alt.call(r, c)));
        const R = { nah: 0, mitJaeger: 0, risse: 0, amTod: 0, gefallen: 0, lebend: 0, da: 0 };
        // ein Riss: ein Tod durch Jagd im Nah-Kreis an einem Tier des Bestands (sein Kopf — im Gau für Hirsch und Wolf, Leben C2b)
        const genannt = new Map();
        // der Bestand am EINEN Leser (`_bestandArt`); ein Kopf, dessen Akt „ein“ noch reist, steht als offene Annahme (`_gauOffen`)
        const imBestand = ([key, g, id]) => {
            const B = r._bestandArt(key, g);
            return !!B && B.tiere.some((t) => t.id === id);
        };
        // DER RISS WIRD AM TOD GELESEN (w28-pop-treue): die Lesung nach dem Übergang allein trennt ein stehen gelassenes Tier nicht
        // vom Gesetz — es nimmt in den 20 s danach selbst Kitze aus dem Bild (35 % der lebenden fehlen dort, main wie Zweig), und
        // der Täter `riss-verloren` blieb unsichtbar, wann immer es gerade seine traf (6 von 10 seiner Risse fehlten dort ohnehin,
        // zwei von fünf Läufen blind)
        const steht = new Set();
        // jeder Tod durch Jagd im Nah-Kreis hat ein Maul am Leib — und der Jäger lebt (VERWAIST, sein Jäger fiel mitten im Riss,
        // zählt als ohne Jäger)
        decke("_creatureCombatDeath", (tod) => (c, quelle) => {
            let neu = null;
            if (quelle === "jagd" && nah(c)) {
                R.nah++;
                R.mitJaeger +=
                    s.creatures.includes(c.userData._rissVon || c) &&
                    s.creatures.some(
                        (j) =>
                            r._creatureTemperament(j) === "wild" &&
                            r._kreaturIstBeute(j, c) &&
                            r._kreaturBissSpalt(j, c) <= r._kreaturBissReich(j)
                    );
                const t = c.userData._bestand;
                if (t && !genannt.has(t.id)) (R.risse++, genannt.set(t.id, (neu = [r._bestandKey(t.x, t.z), t.g, t.id])));
            }
            const o = tod.call(r, c, quelle);
            if (neu && (imBestand(neu) || !!(r._gauOffen && r._gauOffen.has(neu[2])))) (R.amTod++, steht.add(neu[2]));
            return o;
        });
        // der Jäger fällt mitten in seinem Riss (28.10.: sein Tier verhungerte im Gesetz, und er fiel sofort, statt erst nach dem
        // Biss — `_faelltNach`; 9 von 10 Opfern ohne Maul). Den Bruch stellt der Täter SICHER her: jeder Jäger, dessen Maul das
        // Opfer erreicht, fällt, ehe es stirbt (vorher wartete er auf einen Hungertod mitten im Riss, den nur manche Saat brachte,
        // z282: blind)
        if (taeter === "jaeger-faellt")
            decke("_creatureCombatDeath", (tod) => (c, quelle) => {
                if (quelle === "jagd" && nah(c))
                    for (const j of s.creatures.filter((q) => q !== c && r._kreaturIstBeute(q, c) && r._kreaturBissSpalt(q, c) <= r._kreaturBissReich(q))) // prettier-ignore
                        r._creatureNaturalDeath(j, "hunger", false);
                return tod.call(r, c, quelle);
            });
        // die Richtung der Jagd auf eine Himmelsachse gerastet (am Jagd-Weg _kreaturJagdZug)
        if (taeter === "jagd")
            decke(
                "_kreaturJagdZug",
                (alt) =>
                    function (c, tx, tz, key, d, ...rest) {
                        const o = alt.call(this, c, tx, tz, key, d, ...rest);
                        const m = Math.hypot(d.x, d.z);
                        if (m > 0) {
                            if (Math.abs(d.x) > Math.abs(d.z)) d.set(Math.sign(d.x) * m, 0, 0);
                            else d.set(0, 0, Math.sign(d.z) * m);
                        }
                        return o;
                    }
            );
        // DIE JAGD IN DER WINDSTILLE (witterung-windab): diese Bühne liest den Riss, nicht den Wind — in der Stille ist die
        // Fahne das Radial-Gesetz exakt (Probe witterung, ruhe 0: die Kante 50 m von jeder Seite). Im Wind der Welt hetzt das
        // Rudel das Kitz windauf in seiner Fahne weiter (Hetze 5,5–6,5 k → 17–21 k Takte), die Risse fallen 70–145 m windauf,
        // jenseits des Nah-Kreises; die Jagd im Wind lesen witterung, jagdkreis, mahl und rudel
        decke("_windAt", (alt) => function (x, z, t, o) {
            return Object.assign(alt.call(this, x, z, t, o), { staerke: 0, ms: 0 });
        });
        const dt = 1 / 60;
        const geschoben = kontaktZaehler();
        // K13: das Raster liegt schon auf dem ZIEL (die äußerste Hülle: der Fehler sitzt vor dem Jagd-Weg) — er bekommt eine Peilung, die vom Wolf aus genau längs einer
        // Himmelsachse liegt (gleicher Abstand); ein Lauf darauf ist ein Raster, auch wenn er „auf sein Ziel" geht
        if (taeter === "jagd-ziel")
            decke(
                "_kreaturJagdZug",
                (alt) =>
                    function (c, tx, tz, ...rest) {
                        const dx = tx - c.position.x,
                            dz = tz - c.position.z;
                        const m = Math.hypot(dx, dz);
                        if (Math.abs(dx) > Math.abs(dz)) {
                            tx = c.position.x + Math.sign(dx) * m;
                            tz = c.position.z;
                        } else {
                            tx = c.position.x;
                            tz = c.position.z + Math.sign(dz) * m;
                        }
                        return alt.call(this, c, tx, tz, ...rest);
                    }
            );
        // je Zustand der Jagd (Pirsch, Hetze) die Takte im Lauf und die auf den Achsen
        const F = { jagd: [0, 0], hetzen: [0, 0] };
        const ergebnis = () => ({
            jagdFrames: F.jagd[0] + F.hetzen[0],
            hetzFrames: F.hetzen[0],
            achsAnteil: rund(Math.max(...Object.values(F).map(([n, a]) => (n ? a / n : 0))), 3),
            riss: { ...R },
        });
        for (const [ox, oz] of [
            [-60, 50],
            [70, -40],
            [-40, -80],
        ]) {
            const w0 = frei(ox, oz, 30);
            if (!w0) return { fehler: "kein freies Feld (30 m ohne Hülle) für die Jagd" };
            pm.set(w0.x + 50, pm.y, w0.z + 35); // der Spieler im Nah-Kreis, jenseits der Witterung (jagd.scentRangeM)
            s.faunaLifecycle = { lastTick: s.spielZeit };
            const woelfe = [0, 1, 2, 3].map((i) => tier({ x: w0.x - 20, y: w0.y, z: w0.z + 4 * i - 6 }, "wolf"));
            r._kreaturVerbinden(woelfe);
            const beute = [0, 1, 2, 3, 4, 5].map((i) =>
                tier({ x: w0.x + 3 * (i % 3), y: w0.y, z: w0.z + 6 * (i > 2) - 3 }, "wesen", 0.6)
            );
            s.creatures.forEach(ruhig);
            // DIE PEILUNG DES ZIELS LIEST DEN ZUSTAND: die Körper, die die Probe selbst kennt — die Kitze und den Spieler — je
            // Takt an ihrem Ort, vom Ort des Wolfs vor dem Schritt.
            const peilKoerper = [...beute, s.playerMesh];
            const wv = woelfe.map((w) => w.position.clone());
            for (let k = 0; k < 10800; k++) {
                r._weltUhrNimm(s.spielZeit + dt);
                ruhigSpieler();
                takt(dt);
                r.tickFaunaLifecycle();
                woelfe.forEach((wolf, i) => {
                    const dx = wolf.position.x - wv[i].x,
                        dz = wolf.position.z - wv[i].z;
                    const f = F[wolf.userData._motionZustand];
                    if (f && !geschoben.has(wolf.position) && Math.hypot(dx, dz) / dt > 0.3) {
                        f[0]++;
                        const h = Math.atan2(dx, dz);
                        let m = Infinity;
                        for (let q = 0; q < 4; q++) m = Math.min(m, Math.abs(wrap(h - (q * Math.PI) / 2)));
                        // Die Achsen-Signatur ist die QUANTISIERUNG (ein Lauf exakt auf einer Himmelsachse, 0,25°); ein gerader
                        // Lauf auf ein Ziel, das auf einer Achse liegt, ist kein Raster — gezählt wird nur der Achsen-Takt, dessen
                        // Lauf mehr als 1° neben der Peilung jedes Ziels liegt.
                        const aufZiel = peilKoerper.some(
                            (c) =>
                                Math.abs(wrap(h - Math.atan2(c.position.x - wv[i].x, c.position.z - wv[i].z))) <
                                (1 * Math.PI) / 180
                        );
                        if (grad(m) < 0.25 && !aufZiel) f[1]++;
                    }
                    wv[i].copy(wolf.position);
                });
                geschoben.clear();
            }
            // die Kitze, die leben (ihr Tier im Bestand), vor dem Übergang
            const kitze = beute.filter((c) => s.creatures.includes(c) && c.userData._bestand).map((c) => c.userData._bestand); // prettier-ignore
            // der Übergang: der Spieler geht fort, jenseits des Nah-Kreises, dann der nächste Takt des Lebenszyklus
            pm.x += 300;
            takt(dt);
            uhrVor(10);
            r.tickFaunaLifecycle();
            // jedes Opfer fehlt im Bestand seiner Art, jedes lebende Kitz steht in ihm — gelesen am EINEN Leser (`_bestandArt`)
            const wo = (t) => [r._bestandKey(t.x, t.z), t.g, t.id];
            const L = [...[...genannt].map(([id, [key, g]]) => [key, g, id]), ...kitze.map(wo)];
            uhrVor(10);
            await gauLies([...new Set(L.map((q) => q[0]))]);
            for (const [id, [key, g]] of genannt) R.gefallen += !steht.has(id) && !imBestand([key, g, id]);
            for (const t of kitze.filter((q) => !genannt.has(q.id))) (R.lebend++, (R.da += imBestand(wo(t))));
            genannt.clear();
            steht.clear();
            leer(1);
            await stelle(ergebnis()); // je Feld ein Haltepunkt
        }
        return ergebnis();
    });

    // ── herde: der Verband des ECHTEN Wurfs (`_kreaturWurf`, fünf scheue Hirsche) hält beim Wandern und auf der Flucht
    // (Anteil der Glieder binnen fensterRaum × Paar-Raum vom Mittel), und die Bewegung hängt nie am Blick. Auf der Flucht (der
    // Spieler geht von 30 m, außerhalb der Witterung, mit 1,4 m/s durch die Herde, Tiere K1 b–c): die Ausrichtung Φ = |Σv̂|/N
    // der laufenden Glieder (v aus dem Weg je Takt, ab 1 m/s), der Beginn jedes Flüchters (sein erster Takt in Flucht und Lauf;
    // ob er selbst wittert oder der Alarm ihn aus zweiter Hand trifft) und sein Fluchtweg (die weiteste Strecke vom Beginn
    // eines Flucht-Abschnitts). Neben einem fremden Verband derselben Art, 30 m daneben (Tiere K1 d): 600 s Spielzeit im
    // Kreatur-Takt, der Spieler geht ab 100 s südlich des einen und ab 300 s nördlich des anderen vorbei und treibt den
    // Flüchtenden in den fremden; je Spielsekunde sind die Glieder, die das Gesetz liest (`_kreaturVerbandGlieder`), dieselben
    // Leiber des Wurfs, kein fremder dazu ──
    await buehne("herde", async (restore) => {
        r.setGameMode("frieden");
        // die Bewegung am Blick; fünf Tiere auf einem Punkt (jedes Glied nach dem Takt am Ort des ersten)
        if (/^herde(-punkt)?$/.test(taeter))
            decke(
                "updateCreatures",
                (alt) =>
                    function (dt) {
                        alt.call(this, dt);
                        for (const c of this.state.creatures)
                            if (taeter === "herde") this.isInFrustum(c) && (c.position.x += 0.01);
                            else c.position.copy(this.state.creatures[0].position);
                    }
            );
        // die alte Herden-Form: die Glieder sind jedes Tier DERSELBEN Gattung — zwei fremde Herden einer Art verschmelzen
        if (taeter === "herde-artfremd")
            decke(
                "_kreaturVerbandGlieder",
                () =>
                    function (c) {
                        return this.state.creatures.filter((o) => this._kreaturGattung(o) === this._kreaturGattung(c));
                    }
            );
        // die alten Defekte: der Verband ohne seinen Zug (Ausrichtung und Kohäsion), ohne den Alarm aus zweiter Hand, die
        // Flucht endet am Radius
        if (taeter === "herde-zerfall") decke("_kreaturVerbandZug", () => () => {});
        // das Revier je Glied statt je Wurf (w28-wander-revier): das Glied wandert nicht im Revier seines Leittiers — sein
        // Wandern liest sich selbst als Leittier (Anker, Leine und Ziel aus der eigenen Identität, `_kreaturLeittier` im Wandern),
        // und sein Anker liegt drei Leinen weit in seiner eigenen Richtung (der Anker des Wurfs, versetzt, und jeder, den es selbst
        // legt): die Herde hat kein gemeinsames Revier mehr und zerfällt beim Wandern. Seit das Ziel dem Verband gehört
        // (Posen-Gesetz H1) übernimmt das Glied Anker und Ziel des Leittiers, und der Wurf legt den Anker schon gelegt — die
        // verschobene Lage im Leger des Reviers allein traf keinen (0,98 im Fenster).
        // DIE RICHTUNG AUS DEM PLATZ IM WURF (landmarken-geologie-3): der goldene Winkel über die Reihe der Geburt im Verband
        // (wie die Geburt selbst ihre Glieder legt), nie die Los-Nummer als Winkel — die Lose eines Wurfs steigen um die
        // FNV-Primzahl 16 777 619 ≡ −0,018 rad (mod 2π): die fünf Richtungen lagen in 4°, die Anker 3,4 m (Kopf) / 4,3 m (main
        // 64fcf12e) auseinander, und der Täter traf nur, wo das Gelände des Wurf-Orts die Glieder zufällig über die Leine trug
        if (taeter === "herde-revier") {
            const weg = (c, a, leash) => {
                const vb = c.userData.verband;
                const reihe = vb == null ? [c] : s.creatures.filter((o) => o.userData.verband === vb);
                const w = Math.max(0, reihe.indexOf(c)) * 2.39996;
                return { x: a.x + Math.cos(w) * 3 * leash, z: a.z + Math.sin(w) * 3 * leash };
            };
            decke(
                "_creatureCharacterWander",
                (alt) =>
                    function (...arg) {
                        const ud = arg[0].userData;
                        if (ud.wanderAnchor && ud.wanderAnchor.revier && !ud._revierJeGlied) {
                            const leash = this._gehegeLeine(arg[0], this._creatureMoveCharacter(arg[0]).leashM);
                            [ud.wanderAnchor, ud._revierJeGlied] = [{ ...weg(arg[0], ud.wanderAnchor, leash), revier: true }, true];
                        }
                        const eigen = Object.prototype.hasOwnProperty.call(this, "_kreaturLeittier");
                        this._kreaturLeittier = (c) => c;
                        try {
                            return alt.apply(this, arg);
                        } finally {
                            if (!eigen) delete this._kreaturLeittier;
                        }
                    }
            );
            decke(
                "_kreaturRevier",
                (alt) =>
                    function (c, a, leash) {
                        return alt.call(this, c, weg(c, a, leash), leash);
                    }
            );
        }
        if (taeter === "herde-alarm")
            decke(
                "_kreaturVerbandAlarm",
                () => (c, NAT, von, w) => ((c.userData._alarmEigen = w >= NAT.fleeThreshold), w)
            );
        if (taeter === "herde-fluchtweg") {
            const FG = A._furchtGesetz();
            A._furchtGesetzMemo = Object.freeze({ ...FG, fluchtRadius: (B) => B.r });
            restore.push(() => (A._furchtGesetzMemo = FG));
        }
        const VH = A._verhaltenGesetz().herde;
        // Täter (Selbsttest): die Herde am alten Ort ohne die Wildnis-Prüfung — 0/70 liegt auf der Mall des Genesis-Orts, der
        // Wurf trägt dort nur seinen Erstgeborenen
        const heim = taeter === "herde-park" ? neben(P0.x, P0.z + 70) : frei(0, 70, 40);
        if (!heim) throw new Error("kein freies Land für die Herde (frei(0, 70, 40))");
        const seq0 = s._creatureNetSeq || 0;
        const lauf = (art) => {
            const flucht = art === "flucht";
            leer();
            Object.assign(s, { _creatureNetSeq: seq0, creatureAnimationTime: 100 });
            Object.assign(r, { _creatureAiFrame: 0, _faunaStroeme: null });
            pm.set(heim.x + 140, heim.y, heim.z);
            kamera(1, 0);
            const glieder = r._kreaturWurf({ x: heim.x, z: heim.z }, "wesen", "happy", r._faunaRng("verband"), 7);
            const fremd =
                art === "fremd"
                    ? r._kreaturWurf({ x: heim.x, z: heim.z + 30 }, "wesen", "happy", r._faunaRng("fremd"), 7)
                    : [];
            const anteil = () => {
                const m = glieder.reduce((m, c) => m.add(c.position), new T.Vector3()).divideScalar(glieder.length);
                return (
                    glieder.filter((c) => ab(c.position, m) / (2 * r._kreaturRaum(c)) <= VH.fensterRaum).length /
                    glieder.length
                );
            };
            const t = { n: glieder.length, fremdN: fremd.length, wurf: anteil(), summe: 0, bilder: 0, fluchtTakte: 0 };
            Object.assign(t, { fs: 0, fb: 0, fMin: 1, phi: [0, 0], lauf: [], weg: glieder.map(() => 0), id: [0, 0] });
            Object.assign(t, { enge: 0, engst: [Infinity], leine: [0, 0, 0] });
            const [alt, beginn] = [glieder.map((c) => c.position.clone()), []];
            // DAS WANDERN DAUERT 120 s (z353): ohne den Zug des Verbands (Täter herde-zerfall) trieb die Herde am Ort des
            // dichteren Walds (heim2-w20-wald-kosten) in 50 s nur auf 0,916 (Soll ≥ 0,9) auseinander, an main 0,791 — die Zahl der
            // Wanderung hing am Ort, nicht am Gesetz; der Verband hält, solange er wandert, also urteilt die Probe über 10–120 s
            t.takte = art === "blick" ? 1200 : fremd.length ? 36000 : art === "wander" ? 7200 : 3600;
            // DER SPIELER STEHT JENSEITS DER NAH-REGEL (w27-wagen-spalt-3): `isInFrustum` nennt jedes Tier binnen 50 m sichtbar,
            // wohin die Kamera auch blickt — bei 45 m sah der Blick-Vergleich den Täter `herde` nur an Gliedern, die zufällig über
            // 50 m hinaus wanderten (main 1,47 m, mit der gezeichneten Haut 0,83 m, im CI 0: blind); bei 60 m 9,32 m
            // DER GANG AN DER HERDE VORBEI (samen-tier-leser 21.11.): 12 m neben der Mitte der Herde, wo sie beim Beginn des Gangs
            // steht — bei 100 s die eigene südlich, bei 300 s die fremde nördlich. Bis hier ging er 12 m neben ihrem Wurf-Ort: mit
            // den Wander-Kursen aus der Los-Nummer stand die Mitte der eigenen 5 m nördlich davon, der Spieler kam ihr nur auf 17,5 m
            // (die fremde 16,5 m), keine floh, und die Probe war vakuös (neben dem fremden 0,0 s)
            let gang = null;
            for (let k = 0; k < t.takte; k++) {
                const g0 = fremd.length && [6000, 18000].find((k0) => k >= k0 && k < k0 + 3600);
                if (g0 && k === g0) {
                    const G = g0 > 6000 ? fremd : glieder;
                    const m = G.reduce((m, c) => m.add(c.position), new T.Vector3()).divideScalar(G.length);
                    gang = { x: m.x - heim.x, z: m.z - heim.z + (g0 > 6000 ? 12 : -12) };
                }
                const x = flucht ? -30 + (1.4 * k) / 60 : g0 ? gang.x - 30 + (1.4 * (k - g0)) / 60 : 60;
                const q = neben(heim.x + x, heim.z + (g0 ? gang.z : 0));
                pm.set(q.x, q.y, q.z);
                if (k % 600 === 0) kamera(flucht || art === "blick" ? 1 : -1, 0);
                takt(1 / 60);
                if (k === 1199) t.lage = glieder.map((c) => ({ x: c.position.x, z: c.position.z }));
                if (fremd.length && k % 60 === 0)
                    [glieder, fremd].forEach((g, h) => {
                        const L = r._kreaturVerbandGlieder(g[0]) || [];
                        if (L.length !== g.length || L.some((c) => !g.includes(c)))
                            t.bruch = t.bruch || [k / 60, h, L.length];
                        if (g.some((c) => c.userData._motionZustand === "flucht")) t.id[h]++;
                    });
                const fliehen = glieder.filter((c) => c.userData._motionZustand === "flucht").length;
                const a = anteil();
                t.fluchtTakte += fliehen;
                if (k >= 600) ((t.summe += a), t.bilder++);
                if (fliehen) ((t.fs += a), t.fb++, (t.fMin = Math.min(t.fMin, a)));
                let [sx, sz, nl, e] = [0, 0, 0, [Infinity]];
                glieder.forEach((c, i) => {
                    const [p, fl] = [c.position, c.userData._motionZustand === "flucht"];
                    // DIE ENGE: das engste Paar in seinem Paar-Raum (dem Raum der Separation, `_kreaturRaum` beider)
                    for (const b of glieder.slice(0, i)) {
                        const q = ab(p, b.position) / (r._kreaturRaum(c) + r._kreaturRaum(b));
                        if (q < e[0]) e = [rund(q, 2), b.userData.name, c.userData.name, (k / 60) | 0];
                    }
                    // DIE LEINE DES REVIERS: im Wandern steht das Glied in der Leine seines Ankers — dieselbe Leine, die das Wandern
                    // zieht (`_creatureCharacterWander`: `_gehegeLeine` über `_creatureMoveCharacter`), in Leinen gezählt
                    if (art === "wander" && k >= 600) {
                        const A = c.userData.wanderAnchor;
                        const L = A ? ab(p, A) / r._gehegeLeine(c, r._creatureMoveCharacter(c).leashM) : Infinity;
                        ((t.leine[0] += L > 1 ? 1 : 0), t.leine[1]++, (t.leine[2] = Math.max(t.leine[2], L)));
                    }
                    const d = ab(p, alt[i]);
                    if (d > 1 / 60) ((sx += (p.x - alt[i].x) / d), (sz += (p.z - alt[i].z) / d), nl++);
                    alt[i].copy(p);
                    if (fl && d > 1 / 60) t.lauf[i] = t.lauf[i] || [k, c.userData._alarmEigen];
                    beginn[i] = fl ? beginn[i] || p.clone() : null;
                    if (beginn[i]) t.weg[i] = Math.max(t.weg[i], ab(p, beginn[i]));
                });
                if (fliehen && nl >= 3) ((t.phi[0] += Math.hypot(sx, sz) / nl), t.phi[1]++);
                if (k >= 600) t.enge += e[0];
                if (!(e[0] >= t.engst[0])) t.engst = e;
            }
            // wie weit die Anker der Glieder auseinander liegen (das Revier des Wurfs ist EINES)
            const an = glieder.map((c) => c.userData.wanderAnchor).filter(Boolean);
            t.anker = rund(Math.max(0, ...an.flatMap((A, i) => an.slice(0, i).map((o) => ab(A, o)))), 1);
            return t;
        };
        // je Lauf ein Teil (die Tafel TAETER nennt, welche ein Täter trägt — der fremde Verband, 36 000 der 48 000 Takte, nur die ID)
        const W = await teil("wander", () => lauf("wander"));
        const F = await teil("flucht", () => lauf("flucht"));
        const X = await teil("fremd", () => lauf("fremd"));
        const B = await teil("blick", () => lauf("blick"));
        const zahl = (t) => ({
            n: t.n,
            wurfAnteil: rund(t.wurf, 3),
            mittel: rund(t.summe / t.bilder, 3),
            fluchtAnteil: rund(t.fluchtTakte / (Math.min(t.takte, 3600) * t.n), 3),
            fluchtMittel: t.fb ? rund(t.fs / t.fb, 3) : null,
            fluchtMin: t.fb ? rund(t.fMin, 3) : null,
            enge: rund(t.enge / t.bilder, 2),
            engst: t.engst,
            leine: t.leine[1] ? { jenseits: rund(t.leine[0] / t.leine[1], 3), max: rund(t.leine[2], 2) } : null,
            anker: t.anker,
        });
        // DER GRUND EINES KOMMENDEN ORTS (tiere.K1#2, Herde am Hang: das Dorf erwachte nach dem Wurf, sein Erdbau trug den Hang
        // unter zwei der fünf Leiber ab): der erste Nachbar des Start-Dorfs im Wegenetz (`_wegenetzNachbarn`, ein Ort des Gesetzes
        // `_zellOrt`, fern des Spielers, nicht erwacht) — auf dem Kreis von 25 m um ihn (im Kern jedes Reichs, fachwerk
        // `siedlungsReich` 30 m + 22 m·√nH) trägt keiner von acht Orten eine Geburt (`_kreaturGrundFrei`). Täter: die Geburt ohne das Reich (die alte Form); er macht alle
        // acht frei, das ist der Beweis, dass der Kreis ohne den Ort trüge. Die Nachbarschaft steht nach dem Gesetz, ehe die Probe
        // fragt (`_wegenetzNachbarn`: offen, solange eine Stelle auf ihr Wasser wartet — bis w19-fahrt-ziel-2 die halbe, gemerkt)
        if (taeter === "herde-dorf") decke("_imReichEinesOrts", () => () => false);
        await __weltDa(() => r._wegenetzNachbarn("start"));
        const o = r._zellOrt(r._wegenetzNachbarn("start")[0]);
        const dorf = [
            o.key,
            [...Array(8).keys()].filter((q) => r._kreaturGrundFrei(o.x + 25 * Math.cos(q), o.z + 25 * Math.sin(q)))
                .length,
        ];
        const L = F.lauf.filter(Boolean);
        const k = L.map((x) => x[0]);
        return {
            dorf,
            fremdN: X.fremdN,
            blickDiffM: rund(Math.max(...W.lage.map((p, i) => ab(p, B.lage[i]))), 4),
            verband: { fensterRaum: VH.fensterRaum, wander: zahl(W), flucht: zahl(F) },
            ausrichtung: { mittel: rund(F.phi[0] / F.phi[1], 3), takte: F.phi[1] },
            alarm: {
                laufen: L.length,
                zweiteHand: L.filter((x) => !x[1]).length,
                letzterS: L.length < F.n ? null : rund((Math.max(...k) - Math.min(...k)) / 60, 2),
            },
            fluchtWegM: rund(Math.min(...F.weg), 1),
            id: { bruch: X.bruch || null, fluchtS: X.id },
        };
    });

    // ── herde-bild: DIE ISOLIERTE BÜHNE DER HERDE, das Messgerät (Wort des Schöpfers 19.11.: „Bewegungen schienen schwach, wenig
    // Tiere in der Kamera … nichts isoliert geprüft?“). Kein Zwilling: derselbe Wurf wie `herde` (`_kreaturWurf`, die volle Kopfzahl
    // des Kerns — Hirsch 7, Wolf 6 —, gezogen, bis der Wurf sie trägt), derselbe Kreatur-Takt (`takt`: `tierPose`, `verbandZug`, der
    // Satz), kein Tier gehalten (`__offen` tiere gegen den Halter der Werkbank), im Modus des Spiels (`pfad`: nur dort flieht das
    // Wild den Menschen, `_kreaturMenschFlucht`). DIE KAMERA H: fest 40 m quer zur Anker-Achse (x durch den Wurf-Ort), 1,6 m über dem
    // Grund, der Blick auf den Schwerpunkt des Verbands (das Muster `kamera.A` der Rampe s2-hang30); dort steht der Spieler, wie im
    // Spiel das Auge am Spieler — die 50-m-Wand der Aktionen (Grasen) und die Fluchtdistanz messen von ihm; sie ist das Auge der
    // Stufen (Leib · Satz · Rate). Zur Flucht geht er von ihr auf den Wurf-Ort zu, die Kamera bleibt.
    // DER FAHRPLAN nach 3 s Vorlauf je 8 s: stehen → äsen → ziehen → flucht, über die Wege des Spiels — die Tätigkeit des Leittiers
    // samt ihren Pegeln (`_taetigkeit`, `_ruhe`, `magen`; der Verband liest die des Leittiers, `_kreaturTaetigkeit`; „stehen“ ist
    // die Tätigkeit stehen, wo das Ethogramm sie trägt — das Ende des Stehens `_stehenBis` —, sonst ruhen) und die Annäherung des
    // Spielers (1,4 m/s, die Flucht des Gesetzes). Ein Wolf äst nicht (Ethogramm nahrung 0): sein Magen bleibt voll, sonst jagt
    // das hungrige Rudel die Kamera (je Glied, nicht nur das Leittier). Eine laufende Aktion beendet der Fahrplan NIE (das ist Sache des Gesetzes): er nennt sie je
    // Wechsel (`aktionOffen`). DIE EINSTELLUNGEN DER BÜHNE (benannt, je Lauf in `einstellung`): der Ort mit den wenigsten
    // Büscheln der Nah-Wiese (`_nahWieseKachelBueschel`, das Gras des Spiels) im Kreis 10 m um den Ort und im Gang 15 × 4 m zur
    // Kamera, unter den ersten 12 Orten der Suche; DIE KAMERA N, nah: 8 m vor dem Leittier auf der Linie H → Leittier, 1 m über
    // dem Grund, je Schuss von H ein zweiter von N (das Auge urteilt den Gang, nie die Maske — S1 misst H). Gemessen
    // die Proben S1–S5 des Entscheids H3, je Zahl ihre Einheit; `opts.bilder` schießt an der echten GPU je Zustand drei Bilder im
    // Ausgabe-Pfad (Schirm-Größe, die Tiere bewegt) und fügt den Kontaktbogen. Nicht in PROBEN: die Bühne misst den Stand, ihr
    // Urteil ist das Soll der Bau-Welle (`werkbank lauf --buehne herde`, Selbsttest `diag-kreatur-takt --proben herde-bild`).
    if (nur?.includes("herde-bild"))
        await buehne("herde-bild", async (restore) => {
            r.setGameMode("pfad");
            const tStart = performance.now();
            let schussMs = 0;
            const wolfArt = opts?.art === "wolf";
            const seele = wolfArt ? "wolf" : "wesen";
            const gattung = A.TETRAPODA_SOUL_MAP[seele];
            const soll = A._verhaltenGesetz().herde.wurf[gattung][1];
            const KAM_M = taeter === "herde-bild-fern" ? 140 : 40; // Täter: die alte Kamera, 140 m fern
            const ZUST = ["stehen", "aesen", "ziehen", "flucht"];
            const ZEIGT = A._lebensraumGesetz().E.zeigt;
            const TAET = { stehen: ZEIGT.stehen ? "stehen" : "ruhen", aesen: "nahrung", ziehen: "ziehen", flucht: "ziehen" };
            const [NAH_M, NAH_HOEHE, ORTE, GANG_M] = [8, 1, 12, 15];
            const [PHASE, VOR, SCHUSS] = [8 * 60, 3 * 60, [2, 5, 7.5].map((t) => Math.round(t * 60))];
            const dt = 1 / 60;
            const g = -s.gravity;
            const bilder = !!opts?.bilder;
            if (bilder && !(echt && window.__ausgabeAufnahme))
                throw new Error("herde-bild: Bilder nur an der echten GPU der Werkbank (`__ausgabeAufnahme`)");
            // DIE TIERE LAUFEN: der Halter der Werkbank (`__halten` tiere, `werkbank bild`) bleibt für die Bühne offen
            const offen = (window.__offen ||= new Set());
            if (!offen.has("tiere")) (offen.add("tiere"), restore.push(() => window.__offen?.delete("tiere")));
            // Täter: die Tiere gehalten — der Leib des Halters (ausgabe-aufnahme `halten` tiere: x/z nach dem Takt zurück)
            if (taeter === "herde-bild-gehalten")
                decke(
                    "updateCreatures",
                    (alt) =>
                        function (d) {
                            const v = this.state.creatures.map((c) => [c.position, c.position.x, c.position.z]);
                            alt.call(this, d);
                            for (const [p, x, z] of v) ((p.x = x), (p.z = z));
                        }
                );
            // Täter: der stehende Fuß gleitet zwischen den Auswertungen mit dem Leib (der Halt der Raten-Leiter aus) — N1 nennt ihn
            if (taeter === "herde-bild-gleiten") {
                const KG = window.__tetrapodaCore;
                const alt = KG.tierFussHalten;
                KG.tierFussHalten = () => 0;
                restore.push(() => (KG.tierFussHalten = alt));
            }
            // Täter: der Rumpf an der Decke der Senke (h/3, wie der Schwung-Fuß ihn zog) — N5 nennt ihn
            if (taeter === "herde-bild-senke")
                decke(
                    "_animateTierBaum",
                    (alt) =>
                        function (c) {
                            const o = alt.apply(this, arguments);
                            const tb = c && c.userData && c.userData._tierBaum;
                            if (tb && tb._gang && tb._gang.S > 0 && tb.bein) tb._gang.senke = (tb.bein[0].h * (c.scale.x || 1)) / 3;
                            return o;
                        }
                );
            // DER ORT: Lebensraum der Gattung, Wildnis ohne Hülle im Umkreis 40 m, Land am Ort der Kamera; zuerst ohne Wald auf der
            // Sichtlinie (die Kronen deckten die Herde), sonst mit
            const LG = A._lebensraumGesetz();
            const lebt = (x, z) => LG.lebensraum(gattung, r._bodenKlasseAt(x, z), LG.L) > 0;
            const kand = { true: [], false: [] };
            const platz = (sichtFrei) =>
                spirale(0, 70, 40, 8, (x, z) => {
                    const o = platzOrt(sichtFrei, x, z);
                    if (!o) return null;
                    const K = kand[sichtFrei];
                    return K.push(o) >= ORTE ? K : null;
                }) || (kand[sichtFrei].length ? kand[sichtFrei] : null);
            // DIE HALME AM ORT: die Büschel der Nah-Wiese (das Gras des Spiels) im Kreis 10 m und im Gang zur Kamera (−z, ±2 m,
            // 0–15 m); null, solange eine Kachel ihre Boden-Karte nicht trägt
            const halme = (hx, hz) => {
                const k = A.NAH_WIESE.kachel;
                let n = 0;
                for (let tx = Math.floor((hx - 10) / k); tx <= Math.floor((hx + 10) / k); tx++)
                    for (let tz = Math.floor((hz - GANG_M) / k); tz <= Math.floor((hz + 10) / k); tz++) {
                        const L = r._nahWieseKachelBueschel(tx, tz);
                        if (!L) return null;
                        for (const b of L) if (Math.hypot(b.x - hx, b.z - hz) <= 10 || (Math.abs(b.x - hx) <= 2 && b.z <= hz && b.z >= hz - GANG_M)) n++; // prettier-ignore
                    }
                return n;
            };
            const grast = A._lebensraumGesetz().E.gattung[gattung].nahrung > 0;
            const platzOrt = (sichtFrei, x, z) => {
                if (!lebt(x, z) || !r._landAt(x, z) || !r._landAt(x, z - KAM_M) || !imUmkreisLand(x, z, 40)) return null;
                if (sichtFrei && [0, 0.5, 1].some((f) => r._bodenKlasseAt(x, z - KAM_M * f) === "wald")) return null;
                // und ohne Kuppe: der Grund unter der Sichtlinie (Auge 1,6 m → Rumpf 0,9 m) liegt ≥ 0,9 m unter ihr (das Gras
                // deckte die Herde hinter einer Kuppe ganz, Kontaktbogen v5)
                const [hA, hT] = [r.getTerrainHeightAt(x, z - KAM_M) + 1.6, r.getTerrainHeightAt(x, z) + 0.9];
                if (sichtFrei && [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].some((f) => r.getTerrainHeightAt(x, z - KAM_M * (1 - f)) + 0.9 > hA + (hT - hA) * f)) return null; // prettier-ignore
                // der Grund trägt den Wurf (`_kreaturGrundFrei`, die Frage jedes Geworfenen) am Ort und im Ring 8 m
                if ([-1, 0, 1, 2, 3, 4, 5, 6, 7].some((k) => !r._kreaturGrundFrei(x + (k < 0 ? 0 : 8 * Math.cos(k * 0.785)), z + (k < 0 ? 0 : 8 * Math.sin(k * 0.785))))) return null; // prettier-ignore
                // und eben, wo die Gattung äst (das Maß Kopf unten; der Wolf äst nicht): der Grund im Ring 8 m spannt ≤ 1 m (Ort −45/215, Boden-Spanne 4,9 m: der äsende Kopf hangauf stand
                // 0,26 m Grund über der Leib-Mitte, Kopf unten 0,33 statt 0,75 — die Messbühne misst das Posen-Gesetz auf der Ebene)
                const hR = [-1, 0, 1, 2, 3, 4, 5, 6, 7].map((k) => r.getTerrainHeightAt(x + (k < 0 ? 0 : 8 * Math.cos(k * 0.785)), z + (k < 0 ? 0 : 8 * Math.sin(k * 0.785)))); // prettier-ignore
                if (grast && Math.max(...hR) - Math.min(...hR) > 1) return null;
                const o = neben(x, z);
                return huelleNah(x, z, o.y - 0.5, 40) ? null : o;
            };
            const heimFrei = platz(true);
            // trägt die freie Sicht keine 12 Orte (eben, im Revier: der Wolf fand an der GPU 3), füllen Orte mit Wald auf der
            // Sichtlinie auf — die freien zuerst in der Wahl gleicher Halme
            const orte =
                heimFrei && heimFrei.length >= ORTE
                    ? heimFrei
                    : [...(heimFrei || []), ...(platz(false) || []).filter((o) => !(heimFrei || []).some((q) => q.x === o.x && q.z === o.z))].slice(0, 2 * ORTE); // prettier-ignore
            if (!orte.length) throw new Error(`herde-bild: kein Lebensraum ${gattung} ohne Hülle im Umkreis 40 m`);
            for (const o of orte) o.halme = taeter === "herde-bild-fern" ? null : halme(o.x, o.z);
            // DIE WAHL NACH DER ZÄHLUNG ALLER: trägt ein Kandidat seine Kacheln noch nicht (null — die Welt stand nur um den
            // Spieler, 1 bzw. 3 von 12 gezählt), geht der Spieler hin, bis die Welt dort steht, und zählt neu; erst dann wählt der Ort
            if (taeter !== "herde-bild-fern")
                for (const o of orte) {
                    if (o.halme !== null) continue;
                    (pm.set(o.x, o.y, o.z), kamera(0, -1));
                    await __weltStehtNach();
                    for (const q of orte) if (q.halme === null) q.halme = halme(q.x, q.z);
                }
            const gezaehlt = orte.filter((o) => o.halme !== null);
            const reihe = gezaehlt.length ? gezaehlt.slice().sort((a, b) => a.halme - b.halme) : orte;
            // DER WURF: die volle Kopfzahl des Kerns — je Versuch eine eigene Saat, der Spieler 140 m fern (der Wurf wirft außer Blick)
            const seq0 = s._creatureNetSeq || 0;
            const werfen = (o) => {
                let [gl, v] = [[], 0];
                for (; v < 40 && gl.length < soll; v++) {
                    leer();
                    Object.assign(s, { _creatureNetSeq: seq0, creatureAnimationTime: 100 });
                    Object.assign(r, { _creatureAiFrame: 0, _faunaStroeme: null });
                    pm.set(o.x + 140, o.y, o.z);
                    kamera(1, 0);
                    // zwei stille Takte: der Rand des Blicks (`_blickRand`) wird an der ruhenden Kamera gerechnet — nach dem Sprung
                    // der Kamera ist er −1 (keine Geburt in diesem Takt, `_kreaturLeibImBlick`)
                    (takt(dt), kamera(1, 0), takt(dt), kamera(1, 0), leer());
                    gl = r._kreaturWurf({ x: o.x, z: o.z }, seele, "happy", r._faunaRng("herde-bild:" + v), soll); // prettier-ignore
                }
                return [gl, v];
            };
            // DAS REVIER TRÄGT DEN ORT (T3): das Gesetz legt den Anker des Wurfs in den Lebensraum (`_kreaturRevier`: die Mitte
            // und das Sechseck bei 0,7 Leinen) — trägt er ihn nicht ganz, wandert der Anker, und „stehen“ zieht heim (`_gezeigt`
            // ziehen, d > Leine). Täter v12/v13: der Ort 61/226 (Lichtung im Wald) — der Anker wanderte, die Herde lief im Stehen
            // 1,17 m/s. Je Ort in der Folge der Halme legt das Gesetz den Anker; liegt er anders, wirft die Bühne an SEINEM Anker
            // (geprüft wie jeder Ort, `platzOrt`) — gewählt ist der erste Ort, dessen Revier den Anker hält und jedes Glied trägt.
            const LGg = A._lebensraumGesetz();
            const revierAbsage = [];
            // DER GRUND DER ABSAGE je Bedingung des Wurfs, im Ring 2–12 m um den Ort (die Fragen von `_kreaturWurf`)
            const absage = (o) => {
                const nein = { blick: 0, grund: 0, wildnis: 0, grundriss: 0, siedlung: 0, reich: 0, land: 0, lebt: 0 };
                for (let k = 0; k < 48; k++) {
                    const [x, z] = [o.x + Math.cos(k * 2.4) * (2 + k / 4.8), o.z + Math.sin(k * 2.4) * (2 + k / 4.8)];
                    if (r._kreaturLeibImBlick(x, z, gattung, A._lebenKern().spanne()[1])) nein.blick++;
                    if (!r._kreaturGrundFrei(x, z)) nein.grund++;
                    if (!r._wildnisTraegt(x, z)) nein.wildnis++;
                    if (r._imGrundriss(x, z)) nein.grundriss++;
                    if ((s.wegeKarte?.siedlungen || []).some((b) => x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1)) nein.siedlung++; // prettier-ignore
                    if (r._imReichEinesOrts(x, z)) nein.reich++;
                    if (!r._landAt(x, z)) nein.land++;
                    if (!lebt(x, z)) nein.lebt++;
                }
                return nein;
            };
            const pruefe = (o) => {
                const [gl, v] = werfen(o);
                if (gl.length < soll) return { gl, v, ok: false, grund: `Wurf ${gl.length} von ${soll}, 40 Saaten, Absage von 48: ${JSON.stringify(absage(o))}` }; // prettier-ignore
                const lt = r._kreaturLeittier(gl[0]);
                const leine = r._gehegeLeine(lt, r._creatureMoveCharacter(lt).leashM);
                const rv = r._kreaturRevier(lt, { x: o.x, z: o.z }, leine);
                const verschobenM = Math.hypot(rv.x - o.x, rv.z - o.z);
                const draussen = gl.filter((c) => !(LGg.lebensraum(gattung, r._bodenKlasseAt(c.position.x, c.position.z), LGg.L) > 0)).length; // prettier-ignore
                o.revier = { verschobenM: rund(verschobenM, 2), frei: !!rv.frei, draussen, leineM: rund(leine, 1) };
                return { gl, v, rv, ok: !rv.frei && verschobenM < 0.01 && !draussen };
            };
            let [heim, glieder, versuch] = [null, [], 0];
            for (const o0 of reihe) {
                let o = o0;
                let p = pruefe(o);
                // der Anker des Gesetzes wandert höchstens drei Schritte (je Schritt bis 1½ Leinen), bis er ruht
                for (let schritt = 0; schritt < 3 && !p.ok && p.rv && !p.rv.frei; schritt++) {
                    revierAbsage.push({ x: rund(o.x, 1), z: rund(o.z, 1), ...o.revier, zumAnker: true });
                    const a = platzOrt(!!heimFrei, p.rv.x, p.rv.z) || platzOrt(false, p.rv.x, p.rv.z);
                    if (!a) break;
                    ((o = a), (o.halme = halme(a.x, a.z)), (p = pruefe(o)));
                }
                if (p.ok) {
                    [heim, glieder, versuch] = [o, p.gl, p.v];
                    break;
                }
                revierAbsage.push({ x: rund(o.x, 1), z: rund(o.z, 1), ...(o.revier || {}), grund: p.grund || "Revier" });
            }
            if (!heim) throw new Error(`herde-bild: kein Ort, dessen Revier den Anker hält (${gattung}): ${JSON.stringify(revierAbsage)}`); // prettier-ignore
            const leit = r._kreaturLeittier(glieder[0]);
            // DIE KAMERA H
            const H = neben(heim.x, heim.z - KAM_M);
            const cam = s.camera;
            const v3 = new T.Vector3();
            const mitte = () => glieder.reduce((m, c) => m.add(c.position), new T.Vector3()).divideScalar(glieder.length);
            const kameraH = () => {
                const m = mitte();
                cam.position.set(H.x, H.y - 0.5 + 1.6, H.z);
                cam.lookAt(m.x, m.y + 0.6, m.z);
                cam.updateMatrixWorld(true);
                r._lodAugeGesetzt();
                r._loopFrustumCulling();
            };
            // DIE LÜCKE DES VERBANDS: die Tätigkeit des Leittiers beendet keine laufende Aktion (ruhen spielt 16 s, grasen 6 s zu
            // Ende) — der neue Zustand stünde Sekunden unter dem alten. Der Fahrplan beendet sie je Tier an ihrem eigenen Ende (`bis`)
            // und zählt jeden solchen Schnitt (`aktionGeschnitten`)
            const aktionOffen = {};
            const aesenKann = A._lebensraumGesetz().E.gattung[gattung].nahrung > 0;
            const setze = (z) => {
                const u = leit.userData;
                u._taetigkeit = TAET[z];
                // stehen: das Ende des Stehens nach 8 s (die Tätigkeit des Gesetzes), sonst der Ruhe-Pegel über schwelle.aktiv 1,5
                u._ruhe = z === "stehen" && !ZEIGT.stehen ? 2 : 0;
                u._stehenBis = z === "stehen" ? s.creatureAnimationTime + PHASE / 60 : 0;
                u.magen = z === "aesen" && aesenKann ? 0 : r._kreaturMagenVoll(leit);
                // wer nicht äst (der Wolf), bleibt satt — jedes Glied: ein hungriges jagt den Spieler an der Kamera (`_kreaturJagdBereit`)
                if (!aesenKann) for (const c of glieder) c.userData.magen = r._kreaturMagenVoll(c);
                aktionOffen[z] = [];
                for (const c of glieder) {
                    const VA = c.userData._verhaltenAktion;
                    if (VA && s.creatureAnimationTime < VA.bis) aktionOffen[z].push(`${VA.name} ${rund(VA.bis - s.creatureAnimationTime, 1)} s`); // prettier-ignore
                }
            };
            // das Maß „Kopf unten“ an sich: die Kopf-Mitte über dem Grund je Leib-Takt im Zustand äsen, mit und ohne die Aktion grasen
            const kopfHoehe = { grasen: [], sonst: [] };
            // DIE STUFE des Tiers am Auge: Satz (gebacken), fern (jenseits ANALOG_NAH_M), Leib
            const stufe = (c) =>
                c.userData._satz
                    ? "satz"
                    : Math.hypot(c.position.x - cam.position.x, c.position.z - cam.position.z) > A.ANALOG_NAH_M
                      ? "fern"
                      : "leib";
            // DER KOPF eines Leibs: die Mitte der Knoten seines Kopf-Baums (der Leib ist ein Knochen-Baum), die Schulter das
            // Gelenk des Vorderbeins, der Boden der Träger des Leibs; „unten“ = die Kopf-Mitte unter der halben Schulterhöhe
            const kopf = (c) => {
                const tb = c.userData._tierBaum;
                const Tt = tb && tb.teile;
                if (!Tt || !Tt.headGroup || !Tt.legFL) return null;
                Tt.headGroup.updateWorldMatrix(true, true);
                Tt.legFL.updateWorldMatrix(true, false);
                const k = new T.Vector3();
                let n = 0;
                Tt.headGroup.traverse((o) => (k.add(v3.setFromMatrixPosition(o.matrixWorld)), n++));
                k.divideScalar(n);
                v3.setFromMatrixPosition(Tt.legFL.matrixWorld);
                const sch = v3.y;
                // der Grund je Punkt (unter dem Kopf, unter der Schulter): am Hang lag der Grund der Leib-Mitte bis 0,35 m unter
                // dem vor dem Maul (Ort −45/215, Boden-Spanne 4,9 m) — der äsende Kopf am Gras zählte „oben“
                const [bK, bS] = [r.getTerrainHeightAt(k.x, k.z), r.getTerrainHeightAt(v3.x, v3.z)];
                const b0 = r.getTerrainHeightAt(c.position.x, c.position.z);
                return { kopfM: k.y - bK, kopfMitteM: k.y - b0, schulterM: sch - bS, ueberSchulterM: k.y - sch, hangM: bK - b0, unten: k.y - bK < 0.5 * (sch - bS) }; // prettier-ignore
            };
            // DER LEIB AM BODEN (R1): der Widerrist — die höchste gehäutete Ecke im Band 0,15 hinter der Schulter (im Raum des
            // Tiers, +z vorn) — und je Huf die SOHLE: die tiefste Ecke der Haut (nie das Fell, `aSchale`), deren Bindung am
            // Fuß-Knochen der Kette hängt (Gewicht > 0,5 — wie `tierBeinMass` im Kern), gegen die Gelände-Höhe UNTER dieser Ecke.
            // Vorher maß die Probe den Ursprung der Fuß-Gruppe (das Fessel-Gelenk, 0,25–0,32 m über dem Grund) als „Pfote“.
            const leibMass = (c) => {
                const Tt = c.userData._tierBaum?.teile;
                if (!Tt || !Tt.legFL || !Tt.legHL) return null;
                c.updateMatrixWorld(true);
                const sz = c.worldToLocal(new T.Vector3().setFromMatrixPosition(Tt.legFL.matrixWorld)).z;
                const fuss = [Tt.flP, Tt.frP, Tt.hlP, Tt.hrP];
                const sohle = fuss.map(() => null);
                const q = new T.Vector3();
                let wr = -Infinity;
                c.traverse((m) => {
                    if (!m.isSkinnedMesh || !m.visible) return;
                    const A = m.geometry.attributes;
                    const bi = fuss.map((b) => (b ? m.skeleton.bones.indexOf(b) : -1));
                    for (let i = 0; i < A.position.count; i++) {
                        q.fromBufferAttribute(A.position, i);
                        (m.applyBoneTransform || m.boneTransform).call(m, i, q);
                        q.applyMatrix4(m.matrixWorld);
                        const l = c.worldToLocal(q.clone());
                        if (l.z < sz && l.z > sz - 0.15) wr = Math.max(wr, q.y);
                        if (A.aSchale) continue;
                        for (let k = 0; k < 4; k++) {
                            const j = bi[k];
                            if (j < 0) continue;
                            let w = 0;
                            for (let n = 0; n < 4; n++) if (A.skinIndex.getComponent(i, n) === j) w += A.skinWeight.getComponent(i, n);
                            if (w > 0.5 && (!sohle[k] || q.y < sohle[k].y)) sohle[k] = { x: q.x, y: q.y, z: q.z };
                        }
                    }
                });
                const g0 = r.getTerrainHeightAt(c.position.x, c.position.z);
                // der Grund unter dem Huf, wie das Auge ihn sieht: die gezeichnete Boden-Karte (`_bodenSichtAt`), ohne Karte (ungebaut,
                // headless — dort liest die Karte leer, weit außerhalb des Stand-Bands) das Gelände-Gesetz
                const grund = (x, z) => {
                    const g = r.getTerrainHeightAt(x, z);
                    const k = typeof r._bodenSichtAt === "function" ? r._bodenSichtAt(x, z) : null;
                    return Number.isFinite(k) && Math.abs(k - g) <= r.constructor.STAND_SICHT_BAND ? k : g;
                };
                const hufe = sohle.map((p) => (p ? rund(p.y - grund(p.x, p.z), 3) : null));
                return { widerristM: Number.isFinite(wr) ? rund(wr - g0, 3) : null, sohleUeberGrundM: hufe };
            };
            // DAS RECHTECK eines Tiers im Bild (W × H px): die Knoten seines Baums, projiziert — die Höhe in px und die Fläche im Maß
            // 1280 × 720 (die Einheit des Solls, zerlege-linse `kreisGang`)
            const rechteck = (c, W, Hh) => {
                const Tt = c.userData._tierBaum?.teile;
                const R = [Infinity, Infinity, -Infinity, -Infinity];
                c.updateWorldMatrix(true, false);
                for (const o of Object.values(Tt || {})) {
                    if (!o || !o.isObject3D) continue;
                    o.updateWorldMatrix(true, false);
                    v3.setFromMatrixPosition(o.matrixWorld).project(cam);
                    if (v3.z > 1) continue;
                    const [x, y] = [((v3.x + 1) / 2) * W, ((1 - v3.y) / 2) * Hh];
                    [R[0], R[1], R[2], R[3]] = [Math.min(R[0], x), Math.min(R[1], y), Math.max(R[2], x), Math.max(R[3], y)];
                }
                if (!(R[2] > R[0])) return null;
                const imBild = R[2] > 0 && R[0] < W && R[3] > 0 && R[1] < Hh;
                return { R, imBild, hoehePx: rund(R[3] - R[1], 0), flaecheMass: imBild ? rund(((R[2] - R[0]) * (R[3] - R[1]) * 921600) / (W * Hh), 0) : 0 }; // prettier-ignore
            };
            // S3: die Profil-Winkel je Leib und Takt — Kopf (headGroup x), Ohr (earL z), Schwanz (erstes Glied y: Amplitude und Phase
            // zugleich), Rumpf (x); der größte Sprung je Takt, dazu der größte fern jedes Wechsels (stetig: > 30 Takte danach)
            const KAN = {
                kopf: (tb) => tb.teile.headGroup?.rotation.x,
                hals: (tb) => tb.teile.neckRoot?.rotation.x,
                ohr: (tb) => tb.teile.earL?.rotation.z,
                schwanz: (tb) => tb.tailSegs?.[0]?.rotation.y,
                rumpf: (tb) => tb.teile.wolf?.rotation.x,
            };
            const sprung = Object.fromEntries(Object.keys(KAN).map((k) => [k, { max: 0, stetig: 0 }]));
            const zustandVon = (c) => {
                const u = c.userData;
                const VA = u._verhaltenAktion;
                return [u._motionZustand || "-", VA && s.creatureAnimationTime < VA.bis ? VA.name : "-", u._taetigkeit || "-", u._steuer?.v > 0.1 ? "läuft" : "steht"].join("/"); // prettier-ignore
            };
            const winkelAlt = new Map();
            const spur = glieder.map(() => []);
            const phasen = ZUST.map((z) => ({ zustand: z, taetigkeit: TAET[z], takte: 0, getroffen: 0, gezeigt: 0, flucht: 0, leib: 0, satz: 0, fern: 0, wegM: 0, zustaende: {}, sprungM: 0, sprungBei: null, laeufer: { n: 0, erstK: null, leit: 0, task: {}, zumLeitM: [] } })); // prettier-ignore
            const hufe = [];
            const hufeTritt = []; // die Pfote im Tritt (K8 huf: ein stehendes Tier setzt sie um) trägt nicht — sie hebt
            const grasenLeib = { takte: 0, ohneHals: 0, eingefroren: 0, unten: 0, hals: [], fade: [], abstand: [], kopf: [], schulter: [], hang: [] };
            const aesen = { proben: 0, unten: 0, leibProben: 0, leibUnten: 0, leib: 0, satz: 0, satzUnten: 0, fern: 0 };
            const zug = { takte: 0, art: {}, diag: [], v: [] };
            const schuesse = [];
            const TAU2 = Math.PI * 2;
            // DIE NATUR-ZAHLEN DES GANGS (N1–N4, je Zahl ihre Quelle im Gesetz) an jedem gehenden Leib, an dem, was gezeichnet ist:
            // N1 der Schlupf des stehenden Fußes — das Pfoten-Gelenk (gezeichneter Knoten) vom Aufsetzen bis zum Abheben, waagrecht
            // (Soll ≤ 0,03 m, die Zeile der Hufe); N2 die Schrittlänge λ aus zwei Aufsetz-Punkten desselben Fußes (`_gang.fuss`,
            // der Punkt, an dem das Gesetz ihn hält) gegen die Hüft-Höhe L und die Froude-Zahl Fr = v²/(g·L) — Alexander & Jayes
            // 1983: λ/L = 2,3 · Fr^0,3 (GANG_GESETZ.schrittBasis/schrittFroude), dazu λ je Schulterhöhe; N2b die Froude-Zahl je
            // Gangart im Band des Gesetzes (gangBand: Trab ab froudeTrab, Galopp ab froudeGalopp, hinab je mit der Hysterese);
            // N3 die Kopf-Ruhe im Trab: die Kopf-Mitte gegen den Rumpf, halbe Spanne p5–p95 je Leib, Soll ≤ HALTUNG_GESETZ.nick ×
            // L (das Nicken des Schritts, Loscher 2016 — der Trab trägt den Kopf ruhiger); dazu der Bein-Winkel aus dem Lot
            // (Hüfte → Pfote, längs) und die Senke des Rumpfs je Hüft-Höhe — die gedrückte, gespreizte Gestalt beim Namen
            const natur = { ort: {}, slip: [], schritt: [], fr: {}, kopf: new Map(), winkel: {}, senke: {}, nn: [], phi: [], zu: new Map() };
            const vN = new T.Vector3();
            const naturTakt = (c, tb) => {
                const G = tb._gang;
                const Tt = tb.teile;
                const F = G.fuss;
                const art = G.art;
                // im Halt (art „stand“) endet jeder offene Stand ungezählt: die Stand-Pose des Halts ist kein Schritt des Gangs
                // (ein Fuß, der vor dem Halt aufsetzte und nach ihm abhob, trug sonst den Weg der Ruhe-Pose als Schlupf)
                if (!F || !art || art === "stand") return void natur.zu.delete(c);
                // ausgewertet in DIESEM Takt (die Raten-Leiter wertet ferne Leiber jedes 2.–8. Bild aus): das Gesetz gilt nur dort,
                // dazwischen zeigt das Bild die Pose der letzten Auswertung am weiter gezogenen Leib (der Schlupf des Bilds)
                const aus = G.lastT === s.creatureAnimationTime;
                const L = (tb.beinL || 0.5) * (c.scale.x || 1);
                const fr = ((G.v || 0) * (G.v || 0)) / (9.81 * L);
                (natur.fr[art] ||= []).push(fr);
                if (aus) (natur.senke[art] ||= []).push((G.senke || 0) / L);
                const Z = natur.zu.get(c) || natur.zu.set(c, { an: [false, false, false, false], td: [null, null, null, null], st: [null, null, null, null], sg: [null, null, null, null] }).get(c); // prettier-ignore
                const pf = [Tt.flP, Tt.frP, Tt.hlP, Tt.hrP];
                const hf = [Tt.legFL, Tt.legFR, Tt.legHL, Tt.legHR];
                const vor = [Math.sin(c.rotation.y), Math.cos(c.rotation.y)];
                for (let j = 0; j < 4; j++) {
                    if (!pf[j] || !hf[j]) continue;
                    const an = !!F[j] && F[j].an && !(F[j].tritt >= 0);
                    // die SOHLE (das Ende des Pfoten-Glieds c, wie der Kern sie trägt: `pfoteHier`), nie das Gelenk darüber — es
                    // dreht im Stand um sie
                    pf[j].updateWorldMatrix(true, false);
                    v3.set(0, tb.bein[j].c[0] / (tb.f || 1), tb.bein[j].c[1] / (tb.f || 1)).applyMatrix4(pf[j].matrixWorld);
                    hf[j].updateWorldMatrix(true, false);
                    vN.setFromMatrixPosition(hf[j].matrixWorld);
                    const w = Math.atan2((v3.x - vN.x) * vor[0] + (v3.z - vN.z) * vor[1], vN.y - v3.y);
                    if (aus) (natur.winkel[art] ||= []).push(Math.abs(w));
                    // der gehaltene Fuß gegen seine Ruhe-Lage im Gesetz (die Hüfte in der Ruhe des Rumpfs + zr), je Hüft-Höhe: beim
                    // Aufsetzen und beim Abheben (Soll ±S/2 des Gesetzes)
                    if (aus && an && tb._huefteLeib && F[j]) {
                        c.updateMatrixWorld(true);
                        vN.copy(tb._huefteLeib[j]).applyMatrix4(c.matrixWorld);
                        const o = ((F[j].x - vN.x) * vor[0] + (F[j].z - vN.z) * vor[1] - tb.bein[j].zr * (c.scale.x || 1)) / L;
                        if (!Z.an[j]) (natur.ort[art] ||= { td: [], lo: [], S: [] }).td.push(o);
                        Z.lo = Z.lo || [0, 0, 0, 0];
                        Z.lo[j] = o;
                    }
                    if (!an && Z.an[j] && Z.lo) ((natur.ort[art] ||= { td: [], lo: [], S: [] }).lo.push(Z.lo[j]), natur.ort[art].S.push((G.S || 0) / L));
                    if (an && !Z.an[j]) {
                        if (Z.td[j]) natur.schritt.push({ art, fr, lamL: Math.hypot(F[j].x - Z.td[j][0], F[j].z - Z.td[j][1]) / L, L, schulterM: tb.bein && tb.bein[0] ? tb.bein[0].h * (c.scale.x || 1) : null }); // prettier-ignore
                        Z.td[j] = [F[j].x, F[j].z];
                        Z.st[j] = { x: v3.x, z: v3.z, max: 0 };
                        Z.sg[j] = aus ? { x: v3.x, z: v3.z, max: 0 } : null;
                    } else if (an && Z.st[j]) {
                        Z.st[j].max = Math.max(Z.st[j].max, Math.hypot(v3.x - Z.st[j].x, v3.z - Z.st[j].z));
                        if (aus) Z.sg[j] ? (Z.sg[j].max = Math.max(Z.sg[j].max, Math.hypot(v3.x - Z.sg[j].x, v3.z - Z.sg[j].z))) : (Z.sg[j] = { x: v3.x, z: v3.z, max: 0 }); // prettier-ignore
                    } else if (!an && Z.an[j] && Z.st[j]) (natur.slip.push({ m: Z.st[j].max, g: Z.sg[j] ? Z.sg[j].max : null, art }), (Z.st[j] = Z.sg[j] = null)); // prettier-ignore
                    Z.an[j] = an;
                }
                if (art === "trab" && Tt.headGroup && Tt.wolf) {
                    const kf = kopf(c);
                    // die Kopf-Mitte in der Welt je Takt (k = der Takt der Bühne: ein Sprung der Folge beginnt ein neues Stück)
                    const K = natur.kopf.get(c) || natur.kopf.set(c, { L, stuecke: [] }).get(c);
                    if (kf) {
                        const y = kf.kopfMitteM + r.getTerrainHeightAt(c.position.x, c.position.z);
                        const st0 = K.stuecke[K.stuecke.length - 1];
                        if (!st0 || st0.k !== natur.k - 1) K.stuecke.push({ h: [y], k: natur.k });
                        else (st0.h.push(y), (st0.k = natur.k));
                    }
                }
            };
            // DER SCHUSS (an der echten GPU): G mit den Tieren, O ohne (`toggleCreatures`, das Wort des Spiels: Leib, Feld und
            // Satz) — ein Pixel ist Tier, wo G von O um mehr als 18 (Σ|ΔRGB|) abweicht, und gehört dem Tier, in dessen Rechteck
            // (+30 %) es liegt, bei mehreren dem mit der nächsten Mitte; die Fläche im Maß 1280 × 720
            const bild = async (W, Hh, tiere) => {
                const z0 = performance.now();
                const G = new Uint8Array((await window.__ausgabeAufnahme(W, Hh, 1, { satz: "messung" })).u8);
                r.toggleCreatures(false);
                let O;
                try {
                    O = (await window.__ausgabeAufnahme(W, Hh, 1, { satz: "messung" })).u8;
                } finally {
                    r.toggleCreatures(true);
                }
                const box = tiere.map((t) => {
                    if (!t.rechteck) return null;
                    const [x0, y0, x1, y1] = t.rechteck.R;
                    const [mx, my, hx, hy] = [(x0 + x1) / 2, (y0 + y1) / 2, 0.65 * (x1 - x0) + 2, 0.65 * (y1 - y0) + 2];
                    return { mx, my, hx, hy, px: 0, dunkel: 0 };
                });
                for (let p = 0, i = 0; p < W * Hh; p++, i += 4) {
                    if (Math.abs(G[i] - O[i]) + Math.abs(G[i + 1] - O[i + 1]) + Math.abs(G[i + 2] - O[i + 2]) <= 18) continue;
                    const [x, y] = [p % W, (p / W) | 0];
                    let [q, e] = [null, Infinity];
                    for (const b of box) {
                        if (!b || Math.abs(x - b.mx) > b.hx || Math.abs(y - b.my) > b.hy) continue;
                        const d = ((x - b.mx) / b.hx) ** 2 + ((y - b.my) / b.hy) ** 2;
                        if (d < e) [q, e] = [b, d];
                    }
                    if (q) (q.px++, (q.dunkel += 0.2126 * G[i] + 0.7152 * G[i + 1] + 0.0722 * G[i + 2] < 8));
                }
                tiere.forEach((t, i) => ((t.maskeMass = box[i] ? rund((box[i].px * 921600) / (W * Hh), 0) : 0), (t.dunkelPx = box[i] ? box[i].dunkel : 0))); // prettier-ignore
                schussMs += performance.now() - z0;
                return G;
            };
            // das Bild als Leinwand (für JPG und Bogen)
            const leinwand = (u8, W, Hh) => {
                const cv = document.createElement("canvas");
                [cv.width, cv.height] = [W, Hh];
                const id = new ImageData(W, Hh);
                id.data.set(u8);
                for (let i = 3; i < id.data.length; i += 4) id.data[i] = 255;
                cv.getContext("2d").putImageData(id, 0, 0);
                return cv;
            };
            if (bilder && window.__buehne) window.__buehne({}); // Mittag, Sonne, Sommer — die Bühne der Beweisbilder, die Tiere frei
            const db = bilder ? s.renderer.getDrawingBufferSize(new T.Vector2()) : { x: 1280, y: 720 };
            const [W, Hh] = [Math.round(db.x), Math.round(db.y)];
            // DER FAHRPLAN
            for (let k = -VOR; k < ZUST.length * PHASE; k++) {
                const pi = k < 0 ? -1 : Math.floor(k / PHASE);
                const z = ZUST[pi];
                const kp = k - pi * PHASE;
                if (k >= 0 && kp === 0) setze(z);
                const q = z === "flucht" ? neben(H.x, H.z + (1.4 * kp) / 60) : H;
                pm.set(q.x, q.y, q.z);
                // der Sprung vom Ort des Wurfs zur Kamera ist kein Gang: der Lauf des Spielers beginnt dort in Ruhe
                if (k === -VOR) r._spielerLageAlt = null;
                kameraH();
                takt(dt);
                r._ruheImBild();
                glieder.forEach((c, i) => spur[i].push([c.position.x, c.position.z]));
                if (k < 0) continue;
                const P = phasen[pi];
                P.takte++;
                for (const [i, c] of glieder.entries()) {
                    const u = c.userData;
                    const st = stufe(c);
                    P[st]++;
                    P.getroffen += u._taetigkeit === TAET[z];
                    P.gezeigt += u._gezeigt === TAET[z];
                    P.flucht += u._motionZustand === "flucht";
                    const sp = spur[i];
                    const dW = Math.hypot(sp[sp.length - 1][0] - sp[sp.length - 2][0], sp[sp.length - 1][1] - sp[sp.length - 2][1]); // prettier-ignore
                    P.wegM += dW;
                    if (dW > P.sprungM) [P.sprungM, P.sprungBei] = [dW, `t ${rund(kp / 60, 2)} s, Tier ${i}, ${stufe(c)}`];
                    if (z === "stehen" && u._steuer?.v > 0.1) {
                        const L = P.laeufer;
                        L.n++;
                        L.erstK ??= kp;
                        L[stufe(c)] = (L[stufe(c)] || 0) + 1;
                        L.leit += c === leit;
                        L.task[u.task?.name || "-"] = (L.task[u.task?.name || "-"] || 0) + 1;
                        L.zumLeitM.push(Math.hypot(c.position.x - leit.position.x, c.position.z - leit.position.z));
                    }
                    const zs = zustandVon(c);
                    P.zustaende[zs] = (P.zustaende[zs] || 0) + 1;
                    const tb = u._tierBaum;
                    if (st !== "leib" || !tb) {
                        winkelAlt.delete(c);
                        // im Satz: der gebackene Stand seiner Tätigkeit (`_tierSatzStand`), solange er steht (Gewicht des Gangs < 0,5)
                        const su = st === "satz" && u._satz && u._satz.kopfUnten && (u._satzW || 0) < 0.5 ? !!u._satz.kopfUnten[u._satzStand || 0] : false; // prettier-ignore
                        if (z === "aesen") (aesen.proben++, aesen[st]++, (aesen.unten += su), (aesen.satzUnten += su));
                        continue;
                    }
                    const w = Object.fromEntries(Object.entries(KAN).map(([n, f]) => [n, f(tb)]));
                    const a = winkelAlt.get(c);
                    const wechsel = !a ? k : a.z !== zs ? k : a.wechsel;
                    if (a)
                        for (const n in KAN) {
                            if (!Number.isFinite(w[n]) || !Number.isFinite(a.w[n])) continue;
                            const d = Math.abs(w[n] - a.w[n]);
                            const S = sprung[n];
                            if (d > S.max)
                                Object.assign(S, { max: d, t: rund(k / 60, 2), phase: z, tier: i, von: rund(a.w[n], 3), nach: rund(w[n], 3), zustand: a.z === zs ? zs : `${a.z} → ${zs}`, taktNachWechsel: k - wechsel, still: k - (a.g[n] ?? k), frei: [a.frei, !!u._animEingefroren], vor: a.vor, augeM: rund(Math.hypot(c.position.x - cam.position.x, c.position.z - cam.position.z), 1) }); // prettier-ignore
                            if (k - wechsel > 30 && d > S.stetig)
                                Object.assign(S, { stetig: d, stetigBei: `t ${rund(k / 60, 2)} s, Tier ${i}, ${zs}, ${rund(a.w[n], 3)} → ${rund(w[n], 3)}` }); // prettier-ignore
                        }
                    // je Kanal der letzte Takt, in dem er sich bewegte (`still`: Takte ohne Änderung vor dem Sprung — die Raten-Leiter)
                    const g = Object.fromEntries(Object.keys(KAN).map((n) => [n, a && w[n] === a.w[n] ? (a.g[n] ?? k) : k]));
                    winkelAlt.set(c, { w, z: zs, wechsel, g, frei: !!u._animEingefroren, vor: [...(a?.vor || []).slice(-3), [rund(w.hals, 3), rund(w.kopf, 3), !!u._animEingefroren, !!u._tierBaum?._gang]] });
                    // DIE HUFE AM BODEN: je stehendem Leib in stehen und äsen alle 0,5 s die Sohle jedes Hufs über dem Grund unter ihr
                    if ((z === "stehen" || z === "aesen") && zs.endsWith("/steht") && kp % 30 === 0)
                        { const LM = leibMass(c); const F = tb._gang?.fuss; (LM?.sohleUeberGrundM || []).forEach((h, j) => { const tritt = !!F && !(F[j]?.an && !(F[j].tritt >= 0)); if (h !== null) (tritt ? hufeTritt.push(h) : hufe.push({ h, z, i, j, t: rund(k / 60, 2), frei: !!u._animEingefroren, a: zs })); }); } // prettier-ignore
                    if (z === "aesen") {
                        const kf = kopf(c);
                        aesen.proben++;
                        if (kf) (aesen.leibProben++, (aesen.leibUnten += kf.unten), (aesen.unten += kf.unten));
                        if (kf) kopfHoehe[/\/grasen\//.test(zs) ? "grasen" : "sonst"].push(kf.kopfM);
                        // der Leib im Grasen: trägt er den Hals, wie tief steht er, ruht er hinter der Anim-Leiter, wie weit klingt er aus
                        if (kf && /\/grasen\//.test(zs)) {
                            const U = c.userData;
                            grasenLeib.takte++;
                            if (!tb.teile.neckRoot) grasenLeib.ohneHals++;
                            else grasenLeib.hals.push(tb.teile.neckRoot.rotation.x);
                            if (U._animEingefroren) grasenLeib.eingefroren++;
                            (grasenLeib.unten += kf.unten), grasenLeib.kopf.push(kf.kopfM), grasenLeib.schulter.push(kf.schulterM);
                            (grasenLeib.fade.push(U._animFade ?? 1), grasenLeib.hang.push(kf.hangM));
                            grasenLeib.abstand.push(Math.hypot(c.position.x - cam.position.x, c.position.z - cam.position.z));
                        }
                    }
                    if (z === "ziehen" && tb._gang) {
                        const G2 = tb._gang;
                        zug.takte++;
                        zug.art[G2.art] = (zug.art[G2.art] || 0) + 1;
                        if (G2.art === "trab" && G2.ph) zug.diag.push(Math.abs(wrap(G2.ph[0] - G2.ph[3])) / TAU2);
                    }
                    if (tb._gang) ((natur.k = k), naturTakt(c, tb));
                }
                // N4 DIE HERDE AUF DER FLUCHT (ab 1 s): je Glied der nächste Nachbar in seinen Paar-Räumen (`_kreaturRaum`, der Raum
                // des Verbands-Zugs) und die Ausrichtung Φ = |Σ v̂| / N aus dem Weg je Takt
                if (z === "flucht" && kp >= 60) {
                    let [sx, sz, nv] = [0, 0, 0];
                    for (const [i, c] of glieder.entries()) {
                        let nn = Infinity;
                        for (const d of glieder) if (d !== c) nn = Math.min(nn, Math.hypot(d.position.x - c.position.x, d.position.z - c.position.z)); // prettier-ignore
                        if (Number.isFinite(nn)) natur.nn.push(nn / Math.max(1e-3, r._kreaturRaum(c)));
                        const sp = spur[i];
                        const [vx, vz] = [sp[sp.length - 1][0] - sp[sp.length - 2][0], sp[sp.length - 1][1] - sp[sp.length - 2][1]]; // prettier-ignore
                        const vv = Math.hypot(vx, vz);
                        if (vv > 1e-4) ((sx += vx / vv), (sz += vz / vv), nv++);
                    }
                    if (nv >= 2) natur.phi.push(Math.hypot(sx, sz) / nv);
                }
                // S1 je Bild: drei Zeitpunkte je Zustand — Stufe, Rechteck, Kopf; an der GPU Bild und Maske
                if (SCHUSS.includes(kp)) {
                    const leck0 = [s.creatureAnimationTime, glieder.map((c) => [c.position.x, c.position.z])];
                    const tiere = glieder.map((c) => ({ stufe: stufe(c), rechteck: rechteck(c, W, Hh), kopf: stufe(c) === "leib" ? kopf(c) : null })); // prettier-ignore
                    const sch = { zustand: z, t: rund(kp / 60, 1), tiere };
                    if (bilder) {
                        sch.G = await bild(W, Hh, tiere);
                        // DIE KAMERA N (nah): NAH_M vor dem Leittier auf der Linie H → Leittier, NAH_HOEHE über dem Grund, der Blick
                        // auf das Leittier. Das Stufen-Gesetz wählt am Auge N neu, wie der nächste Takt des Spiels an dieser Kamera:
                        // der Ziegel (Leib oder Feld, `_kzLeib`), der Tier-Satz (`nahLeiber`), der Blick des Bilds (`_ruheImBild`) —
                        // bis hier galt am Auge N die Wahl von H (die Flucht jenseits ANALOG_NAH_M von H stand als Kapseln vor N).
                        // S1 (≥ 200 px, Kopf unten) zählt N: die Stufe je Tier, wie sie zeichnet; danach wählt H wieder.
                        const stufenAm = () => {
                            const au = r._lodAuge();
                            r._tickKreaturZiegel(au, r._feldGrenzen(false));
                            r._tickTierSatz(au);
                            r._ruheImBild();
                            // die Sicht der Leiber (`_leibSicht`, im Spiel derselbe Takt in `updateCreatures`): ein Leib, der
                            // eben aus dem Feld kam, zeichnet erst mit ihr — sonst stand am Bild N die schwindende Kapsel allein
                            for (const c of r.state.creatures) if (c && c.userData) r._leibSicht(c, r.isInFrustum(c), au);
                        };
                        const lp = leit.position;
                        const [ex, ez] = [H.x - lp.x, H.z - lp.z];
                        const el = Math.hypot(ex, ez) || 1;
                        // DIE SICHTLINIE (Flucht v14: bei 7,5 s stand N im Fels, bei 2 s füllte ein Stamm das Bild): N dreht in 30°-Schritten
                        // um das Leittier, bis vom Auge zur Leib-Mitte kein Gelände (je 0,5 m unter der Linie) und kein Bau, Fels oder
                        // Stamm (`_fieldRaycast`, Radius 0,15 m) und kein anderer Leib der Herde in den ersten 3 m vor dem Auge liegt
                        // (Flucht v15 bei 5 s: ein Läufer füllte das Bild, 1 m vor dem Auge; ein Glied der Herde weiter vorn gehört
                        // ins Bild — v17 verwarf diesen Blick, äsen 7,5 s fiel von 6 auf 3 Tiere ≥ 200 px); `nahDreh` nennt die
                        // Drehung (null: keine freie Linie)
                        const ziel = [lp.x, lp.y + 0.6, lp.z];
                        const frei = (P) => {
                            const ey = P.y - 0.5 + NAH_HOEHE;
                            // das Auge in keinem Körper: von 2 m darüber hinab zum Auge trifft der Strahl nichts (der Fels um die Kamera)
                            if (r._fieldRaycast(P.x, ey + 2, P.z, P.x, ey, P.z).hit) return false;
                            for (let f = 0.06; f < 0.95; f += 0.5 / NAH_M) {
                                const [x, y, z] = [P.x + (ziel[0] - P.x) * f, ey + (ziel[1] - ey) * f, P.z + (ziel[2] - P.z) * f];
                                if (r.getTerrainHeightAt(x, z) > y - 0.05) return false;
                            }
                            const [dx, dy, dz] = [ziel[0] - P.x, ziel[1] - ey, ziel[2] - P.z];
                            const dd = dx * dx + dy * dy + dz * dz;
                            for (const c of glieder) {
                                if (c === leit) continue;
                                const [qx, qy, qz] = [c.position.x - P.x, c.position.y + 0.6 - ey, c.position.z - P.z];
                                const f = Math.max(0, Math.min(1, (qx * dx + qy * dy + qz * dz) / dd));
                                if (f * Math.sqrt(dd) < 3 && Math.hypot(qx - dx * f, qy - dy * f, qz - dz * f) < 0.9) return false;
                            }
                            return !r._fieldRaycast(P.x, ey, P.z, ziel[0], ziel[1], ziel[2], { radius: 0.15 }).hit;
                        };
                        const w0 = Math.atan2(ez / el, ex / el);
                        // DER BLICK, DER DIE HERDE ZEIGT (S1): unter den freien Blicken (in der Reihe der Drehung) gilt der erste, der
                        // jedes Tier ≥ 200 px zeigt, sonst der mit den meisten — ein verdecktes Glied verwirft den Blick, nie das Soll
                        const blicke = [];
                        for (const dg of [0, 30, -30, 60, -60, 90, -90, 120, -120, 150, -150, 180]) {
                            const w = w0 + (dg * Math.PI) / 180;
                            const P = neben(lp.x + Math.cos(w) * NAH_M, lp.z + Math.sin(w) * NAH_M);
                            if (frei(P)) blicke.push([dg, P]);
                        }
                        if (!blicke.length) blicke.push([null, neben(lp.x + (ex / el) * NAH_M, lp.z + (ez / el) * NAH_M)]);
                        const stufeN = (c) => (c.userData._satz ? "satz" : r._kzBesitztFeld(c) ? "fern" : "leib");
                        let best = null;
                        for (const [dg, N] of blicke.slice(0, 4)) {
                            cam.position.set(N.x, N.y - 0.5 + NAH_HOEHE, N.z);
                            cam.lookAt(lp.x, lp.y + 0.6, lp.z);
                            cam.updateMatrixWorld(true);
                            (r._lodAugeGesetzt(), r._loopFrustumCulling(), stufenAm());
                            const v = { nahDreh: dg, nahR: rechteck(leit, W, Hh) };
                            v.nah = glieder.map((c) => ({ stufe: stufeN(c), rechteck: rechteck(c, W, Hh), kopf: stufeN(c) === "leib" ? kopf(c) : null })); // prettier-ignore
                            v.leitLeib = stufeN(leit) === "leib" ? leibMass(leit) : null;
                            // das Bild nach dem Wechsel: der schwindende Satz (Kapseln, `WELT_SCHWUND_MS` an der Wanduhr) ist aus, ehe N schießt
                            await sleep(A.WELT_SCHWUND_MS + 50);
                            v.N = await bild(W, Hh, v.nah);
                            v.zahl = v.nah.filter((t) => t.maskeMass >= 200).length;
                            if (!best || v.zahl > best.zahl) best = v;
                            if (v.zahl === glieder.length) break;
                        }
                        Object.assign(sch, { nahDreh: best.nahDreh, nahR: best.nahR, nah: best.nah, leitLeib: best.leitLeib, N: best.N, nahBlicke: blicke.length }); // prettier-ignore
                        kameraH();
                        stufenAm();
                    }
                    sch.leck = { zeitS: rund(s.creatureAnimationTime - leck0[0], 4), wegM: rund(glieder.reduce((a, c, i) => a + Math.hypot(c.position.x - leck0[1][i][0], c.position.z - leck0[1][i][1]), 0), 3) }; // prettier-ignore
                    schuesse.push(sch);
                }
            }
            // DIE SPUR je Tier: Tempo (m/s) über 0,5 s und die Querbeschleunigung aus der Krümmung der Wurzel-Spur (drei Punkte je
            // 0,1 s, Umkreis) × v²
            const ab0 = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
            const kruemmung = (a, b, c) => {
                const [x1, y1, x2, y2] = [b[0] - a[0], b[1] - a[1], c[0] - a[0], c[1] - a[1]];
                const flaeche2 = Math.abs(x1 * y2 - x2 * y1);
                const n = ab0(a, b) * ab0(b, c) * ab0(a, c);
                return n > 1e-9 ? (2 * flaeche2) / n : 0;
            };
            const s4Welt = { max: 0, vBeiMax: null, maxSprint: 0, sprintProben: 0, bei: null };
            spur.forEach((sp, ti) => {
                for (let k = VOR + 3 * PHASE + 6; k + 6 < sp.length; k += 3) {
                    const [a, b, c] = [sp[k - 6], sp[k], sp[k + 6]];
                    const v = ab0(a, c) / 0.2;
                    if (v < 2) continue;
                    const aq = v * v * kruemmung(a, b, c);
                    if (aq > s4Welt.max) Object.assign(s4Welt, { max: aq, vBeiMax: v, bei: { tier: ti, leit: glieder[ti] === leit, tS: rund((k - VOR - 3 * PHASE) / 60, 2), rM: rund((v * v) / aq, 2) } }); // prettier-ignore
                    if (v >= 8) ((s4Welt.sprintProben++), (s4Welt.maxSprint = Math.max(s4Welt.maxSprint, aq)));
                }
            });
            spur.forEach((sp) => {
                for (let k = VOR + 2 * PHASE + 30; k < VOR + 3 * PHASE; k += 30) zug.v.push(ab0(sp[k - 30], sp[k]) / 0.5);
            });
            const median = (a) => (a.length ? a.slice().sort((x, y) => x - y)[Math.floor((a.length - 1) / 2)] : null);
            // S4 im Gesetz: der Steuer-Schritt des Kerns (derselbe, den der Takt je Tier ruft) mit der Hüft-Höhe des Leittiers, aus
            // dem Sprint geradeaus ein Wunsch 90° quer im Sprint, 3 s — die Wurzel-Spur, ihre Krümmung × v²
            const tbL = leit.userData._tierBaum;
            const L = tbL.beinL * (leit.scale.x || 1);
            const vS = r._kreaturSprint(leit, L);
            const s4Gesetz = (() => {
                const SG = A._steuerGesetz();
                const zz = { gier: 0, v: vS };
                const P = [[0, 0]];
                for (let i = 0; i < 180; i++) {
                    SG.steuerSchritt(zz, vS, 0, dt, L);
                    const [x, y] = P[P.length - 1];
                    P.push([x + Math.sin(zz.gier) * zz.v * dt, y + Math.cos(zz.gier) * zz.v * dt]);
                }
                let [max, vBei] = [0, null];
                for (let k = 3; k + 3 < P.length; k++) {
                    const v = ab0(P[k - 3], P[k + 3]) / (6 * dt);
                    const aq = v * v * kruemmung(P[k - 3], P[k], P[k + 3]);
                    if (aq > max) [max, vBei] = [aq, v];
                }
                return { max, vBei };
            })();
            // S2: das Kopf-Spektrum — das Leittier im Schritt (v̂ 0,34 längs +x, der Leib zieht je Takt um v·dt wie gate:tier-gang,
            // die Pose durch den EINEN Chokepoint `_animateCompoundMotion` mit seinem Gemüt), 3 s Einschwingen, dann 10 Zyklen; die
            // Höhe der Kopf-Mitte über dem Grund, DFT (Hann) 0,1–6 Hz: der Gipfel gegen 2 · f_Schritt, die Amplitude dort
            const s2 = (() => {
                const u = leit.userData;
                const roles = r._motionRolesForSoul(u.soul);
                const v = 0.34 * Math.sqrt(g * L);
                Object.assign(u, { _verhaltenAktion: null, _motionZustand: null, _animFade: 1 });
                // die feste Strecke: ab 15 m vor dem Wurf-Ort längs +x — vorher und nachher derselbe Boden (der Sprung dorthin ist
                // kein Lauf, `lageTempo`)
                leit.position.set(heim.x - 15, heim.y, heim.z);
                leit.rotation.set(0, Math.PI / 2, 0);
                let [t, ph] = [s.creatureAnimationTime, u.walkPhase || 0];
                const [ys, om, boden] = [[], [], []];
                for (let i = 0; i < 60 * 60; i++) {
                    leit.position.x += v * dt;
                    const y = r.getTerrainHeightAt(leit.position.x, leit.position.z);
                    if (i >= 180) boden.push(y);
                    leit.position.y = u._traegerY = y;
                    t += dt;
                    s.creatureAnimationTime = t;
                    ph += dt * 5;
                    r._animateCompoundMotion(leit, roles, t, ph, true, u.emotions);
                    if (i < 180) continue;
                    const kf = kopf(leit);
                    if (!kf) return { ungemessen: "der Leib trägt keinen Kopf-Baum" };
                    ys.push(kf.kopfMitteM); // S2: das Wippen über dem Grund der Leib-Mitte (der Grund unter dem Kopf wandert mit)
                    om.push(tbL._gang.omega);
                    const f = median(om) / TAU2;
                    if (f > 0 && ys.length >= (10 / f) * 60) break;
                }
                const f = median(om) / TAU2;
                const n = ys.length;
                // ohne die Gerade des Wegs: am Hang (Boden-Spanne 2,46 m an der GPU) folgt die Senke des Rumpfs der Reichweite des
                // Beins talwärts (tetrapoda SCHRITT 2) — ein Trend über 10 s ist kein Wippen und lag als Gipfel bei 0,1 Hz
                const mw = ys.reduce((a, b) => a + b, 0) / n;
                const mi = (n - 1) / 2;
                let [sxy, sxx] = [0, 0];
                for (let i = 0; i < n; i++) ((sxy += (i - mi) * (ys[i] - mw)), (sxx += (i - mi) * (i - mi)));
                const y0 = ys.map((y, i) => y - mw - (sxx > 0 ? sxy / sxx : 0) * (i - mi));
                const dft = (fq, hann) => {
                    let [re, im] = [0, 0];
                    for (let i = 0; i < n; i++) {
                        const w = hann ? 0.5 - 0.5 * Math.cos((TAU2 * i) / (n - 1)) : 1;
                        re += y0[i] * w * Math.cos((TAU2 * fq * i) / 60);
                        im -= y0[i] * w * Math.sin((TAU2 * fq * i) / 60);
                    }
                    return (2 * Math.hypot(re, im)) / n;
                };
                let [gipfel, best] = [0, -1];
                for (let fq = 0.1; fq <= 6; fq += 0.005) {
                    const a = dft(fq, true);
                    if (a > best) [best, gipfel] = [a, fq];
                }
                return {
                    profil: r._motionProfileName(true, u.emotions, "kreatur", null),
                    vMS: rund(v, 2),
                    fSchrittHz: rund(f, 3),
                    zyklen: rund((n / 60) * f, 1),
                    gipfelHz: rund(gipfel, 3),
                    gipfelGegen2f: rund(gipfel / (2 * f), 3),
                    amplitudeCm: rund(100 * dft(gipfel, false), 2),
                    amplitude2fCm: rund(100 * dft(2 * f, false), 2),
                    amplitudeWanduhrCm: rund(100 * dft(1.7 / TAU2, false), 2),
                    streckeM: rund((n / 60) * v, 1),
                    bodenSpanneM: rund(Math.max(...boden) - Math.min(...boden), 2),
                };
            })();
            // DER KONTAKTBOGEN: je Zustand eine Zeile, je Zeitpunkt ein Feld (640 px breit), das Rechteck jedes Tiers (grün Leib,
            // gelb Satz, rot fern) und die Zeile der Zahlen
            const [jpg, jpgNah] = [[], []];
            let bogen = null;
            if (bilder) {
                const cw = 640;
                const ch = Math.round((cw * Hh) / W);
                const B = document.createElement("canvas");
                [B.width, B.height] = [3 * cw, 8 * ch];
                const bx = B.getContext("2d");
                schuesse.forEach((sc, i) => {
                    // die Zeile N unter der Zeile H ihres Zustands: der Ausschnitt 1:1 um das Leittier
                    const cn = leinwand(sc.N, W, Hh);
                    jpgNah.push({ zustand: sc.zustand, t: sc.t, jpg: cn.toDataURL("image/jpeg", 0.9) });
                    const Rn = sc.nahR && sc.nahR.imBild ? sc.nahR.R : [W / 2, Hh / 2, W / 2, Hh / 2];
                    const [nx, ny] = [Math.min(W - cw, Math.max(0, (Rn[0] + Rn[2]) / 2 - cw / 2)), Math.min(Hh - ch, Math.max(0, (Rn[1] + Rn[3]) / 2 - ch / 2))]; // prettier-ignore
                    const [onx, ony] = [(i % 3) * cw, (2 * Math.floor(i / 3) + 1) * ch];
                    bx.drawImage(cn, nx, ny, cw, ch, onx, ony, cw, ch);
                    bx.fillStyle = "rgba(0,0,0,0.6)";
                    bx.fillRect(onx, ony, cw, 22);
                    bx.fillStyle = "#fff";
                    bx.font = "14px monospace";
                    const nL = (s) => sc.nah.filter((t) => t.stufe === s).length;
                    bx.fillText(`${sc.zustand} ${sc.t}s · nah ${NAH_M} m · ${sc.nah.filter((t) => t.maskeMass >= 200).length}/${glieder.length} ≥200px · Leib ${nL("leib")} Feld ${nL("fern")} · Kopf unten ${sc.nah.filter((t) => t.kopf?.unten).length}`, onx + 6, ony + 16); // prettier-ignore
                    delete sc.N;
                    const cv = leinwand(sc.G, W, Hh);
                    jpg.push({ zustand: sc.zustand, t: sc.t, jpg: cv.toDataURL("image/jpeg", 0.9) });
                    // DER AUSSCHNITT um die Herde (die Hülle der Rechtecke im Bild, 1:1 wo sie in das Feld passt, sonst verkleinert
                    // bis zum ganzen Bild): bei 40 m trägt ein Tier ~20 px, im ganzen Bild auf 640 px verkleinert wäre es ein Punkt.
                    // Das volle Bild liegt daneben als eigenes JPG.
                    const im = sc.tiere.filter((t) => t.rechteck?.imBild).map((t) => t.rechteck.R);
                    const hx = im.length ? [Math.min(...im.map((q) => q[0])), Math.max(...im.map((q) => q[2]))] : [0, W];
                    const hy = im.length ? [Math.min(...im.map((q) => q[1])), Math.max(...im.map((q) => q[3]))] : [0, Hh];
                    const sw = Math.min(W, Math.max(cw, 1.3 * (hx[1] - hx[0]), ((1.3 * (hy[1] - hy[0])) * W) / Hh));
                    const sh = (sw * Hh) / W;
                    const sx = Math.min(W - sw, Math.max(0, (hx[0] + hx[1]) / 2 - sw / 2));
                    const sy = Math.min(Hh - sh, Math.max(0, (hy[0] + hy[1]) / 2 - sh / 2));
                    const [ox, oy, f] = [(i % 3) * cw, 2 * Math.floor(i / 3) * ch, cw / sw];
                    bx.drawImage(cv, sx, sy, sw, sh, ox, oy, cw, ch);
                    bx.lineWidth = 1;
                    for (const t of sc.tiere) {
                        if (!t.rechteck?.imBild) continue;
                        const [x0, y0, x1, y1] = t.rechteck.R;
                        bx.strokeStyle = { leib: "#3f3", satz: "#fd2", fern: "#f33" }[t.stufe];
                        bx.strokeRect(ox + (x0 - sx) * f - 2, oy + (y0 - sy) * f - 2, (x1 - x0) * f + 4, (y1 - y0) * f + 4); // prettier-ignore
                    }
                    const ab = sc.tiere.filter((t) => t.maskeMass >= 200).length;
                    const un = sc.tiere.filter((t) => t.kopf?.unten).length;
                    bx.fillStyle = "rgba(0,0,0,0.6)";
                    bx.fillRect(ox, oy, cw, 22);
                    bx.fillStyle = "#fff";
                    bx.font = "14px monospace";
                    bx.fillText(`${sc.zustand} ${sc.t}s · ${ab}/${glieder.length} ≥200px · Leib ${sc.tiere.filter((t) => t.stufe === "leib").length} · Kopf unten ${un} · ×${rund(f, 2)}`, ox + 6, oy + 16); // prettier-ignore
                    delete sc.G;
                });
                bogen = B.toDataURL("image/jpeg", 0.9);
            }
            const proS = schuesse.map((sc) => ({
                zustand: sc.zustand,
                t: sc.t,
                ab200: sc.tiere.filter((t) => (bilder ? t.maskeMass : t.rechteck?.flaecheMass) >= 200).length,
                // an der Kamera N (nur mit Bild): die Stufe, wie sie zeichnet, die Maske und der Kopf je Leib
                nah: sc.nah && {
                    ab200: sc.nah.filter((t) => t.maskeMass >= 200).length,
                    leib: sc.nah.filter((t) => t.stufe === "leib").length,
                    fern: sc.nah.filter((t) => t.stufe === "fern").length,
                    satz: sc.nah.filter((t) => t.stufe === "satz").length,
                    kopfUnten: sc.nah.filter((t) => t.kopf?.unten).length,
                    maskeMass: sc.nah.map((t) => t.maskeMass),
                    leit: sc.leitLeib,
                    dreh: sc.nahDreh,
                    dunkelPx: sc.nah.map((t) => t.dunkelPx),
                },
                dunkelPxH: sc.tiere.map((t) => t.dunkelPx ?? null),
                leck: sc.leck,
                tiere: sc.tiere.map((t) => ({
                    stufe: t.stufe,
                    hoehePx: t.rechteck?.hoehePx ?? null,
                    rechteckMass: t.rechteck?.flaecheMass ?? 0,
                    maskeMass: bilder ? t.maskeMass : null,
                    kopfUeberSchulterM: t.kopf ? rund(t.kopf.ueberSchulterM, 3) : null,
                    schulterM: t.kopf ? rund(t.kopf.schulterM, 3) : null,
                    kopfUnten: t.kopf ? t.kopf.unten : null,
                })),
            }));
            const aesS = proS.filter((p) => p.zustand === "aesen");
            const msOhneBild = performance.now() - tStart - schussMs;
            return {
                art: gattung,
                n: glieder.length,
                soll,
                wurfSaat: versuch - 1,
                ort: { x: rund(heim.x, 1), z: rund(heim.z, 1), sichtOhneWald: (heimFrei || []).includes(heim), kameraM: KAM_M, revier: heim.revier || null, revierAbsage }, // prettier-ignore
                einstellung: {
                    ort: `der Ort mit den wenigsten Büscheln der Nah-Wiese (Kreis 10 m + Gang ${GANG_M} × 4 m zur Kamera) unter ${orte.length} Orten der Suche`, // prettier-ignore
                    halme: heim.halme ?? null,
                    halmeJeOrt: orte.map((o) => o.halme ?? null),
                    gezaehlt: gezaehlt.length,
                    kameraN: { abstandM: NAH_M, hoeheM: NAH_HOEHE, ziel: "das Leittier", nurAuge: true },
                    stehen: TAET.stehen,
                    wolfSatt: !aesenKann,
                },
                schirm: { W, H: Hh, quelle: bilder ? "Ausgabe-Pfad der GPU" : "Maß 1280 × 720 ohne Bild" },
                weg: "Tätigkeit + Pegel des Leittiers (der Verband liest sie), Flucht: der Spieler geht mit 1,4 m/s auf den Wurf-Ort zu",
                aktionOffen,
                phasen: phasen.map((P) => {
                    const n = P.takte * glieder.length;
                    return { zustand: P.zustand, taetigkeit: P.taetigkeit, getroffen: rund(P.getroffen / n, 3), gezeigt: rund(P.gezeigt / n, 3), flucht: rund(P.flucht / n, 3), leib: rund(P.leib / P.takte, 2), satz: rund(P.satz / P.takte, 2), fern: rund(P.fern / P.takte, 2), wegM: rund(P.wegM, 1), vMittelMS: rund(P.wegM / Math.max(1, n * dt), 2), zustaende: Object.fromEntries(Object.entries(P.zustaende).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, m]) => [k, rund(m / n, 3)])), sprungM: rund(P.sprungM, 3), sprungBei: P.sprungBei, laeufer: { ...P.laeufer, erstS: P.laeufer.erstK === null ? null : rund(P.laeufer.erstK / 60, 2), zumLeitM: P.laeufer.zumLeitM.length ? rund(median(P.laeufer.zumLeitM), 1) : null } }; // prettier-ignore
                }),
                bewegungM: rund(phasen.reduce((a, P) => a + P.wegM, 0), 1),
                s1: {
                    quelle: bilder ? "Maske (G gegen O, Σ|ΔRGB| > 18)" : "Rechteck der Knoten (ohne Bild)",
                    kopfUnten: "Kopf-Mitte unter der halben Schulterhöhe über dem Grund",
                    aesen: {
                        // S1 zählt an N (mit Bild), ohne Bild das Rechteck an H
                        ab200: aesS.length ? Math.min(...aesS.map((p) => (p.nah ? p.nah.ab200 : p.ab200))) : 0,
                        ab200JeBild: aesS.map((p) => (p.nah ? p.nah.ab200 : p.ab200)),
                        ab200H: aesS.map((p) => p.ab200),
                        kopfUntenLeibN: (() => {
                            const [l, u] = aesS.reduce((a, p) => (p.nah ? [a[0] + p.nah.leib, a[1] + p.nah.kopfUnten] : a), [0, 0]); // prettier-ignore
                            return l ? { anteil: rund(u / l, 3), leiber: l, unten: u } : null;
                        })(),
                        kopfUntenAnteil: aesen.proben ? rund(aesen.unten / aesen.proben, 3) : 0,
                        kopfUntenAnteilLeib: aesen.leibProben ? rund(aesen.leibUnten / aesen.leibProben, 3) : null,
                        tierTakte: aesen.proben,
                        leibTakte: aesen.leibProben,
                        satzTakte: aesen.satz,
                        satzUnten: aesen.satzUnten,
                        grasenLeib: { takte: grasenLeib.takte, ohneHals: grasenLeib.ohneHals, eingefroren: grasenLeib.eingefroren, halsMedian: grasenLeib.hals.length ? rund(median(grasenLeib.hals), 3) : null, halsQ: grasenLeib.hals.length ? [0.1, 0.25, 0.75, 0.9].map((q) => rund(quantil(grasenLeib.hals, q), 2)) : null, verhaeltnisQ: grasenLeib.kopf.length ? [0.1, 0.5, 0.9].map((q) => rund(quantil(grasenLeib.kopf.map((k, i) => k / grasenLeib.schulter[i]), q), 2)) : null, fadeMedian: grasenLeib.fade.length ? rund(median(grasenLeib.fade), 3) : null, abstandMedianM: grasenLeib.abstand.length ? rund(median(grasenLeib.abstand), 1) : null, unten: grasenLeib.unten, kopfMedianM: grasenLeib.kopf.length ? rund(median(grasenLeib.kopf), 3) : null, schulterMedianM: grasenLeib.schulter.length ? rund(median(grasenLeib.schulter), 3) : null, hangQ: grasenLeib.hang.length ? [0.1, 0.5, 0.9].map((q) => rund(quantil(grasenLeib.hang, q), 3)) : null }, // prettier-ignore
                        fernTakte: aesen.fern,
                        kopfMitteM: Object.fromEntries(Object.entries(kopfHoehe).map(([k, a]) => [k, a.length ? { takte: a.length, min: rund(Math.min(...a), 3), median: rund(median(a), 3) } : null])), // prettier-ignore
                    },
                    bilder: proS,
                    leibN: Object.fromEntries(ZUST.map((zz) => [zz, proS.filter((p) => p.zustand === zz && p.nah).map((p) => p.nah.leib)])), // prettier-ignore
                },
                hufe: hufe.length ? (() => { const a = hufe.map((x) => x.h); const m = hufe.reduce((p, x) => (Math.abs(x.h) > Math.abs(p.h) ? x : p)); return { roh: hufe.filter((x) => Math.abs(x.h) > 0.03), proben: a.length, imTritt: hufeTritt.length, maxAbsM: rund(Math.abs(m.h), 3), bei: m, median: rund(median(a), 3), p10: rund(quantil(a, 0.1), 3), p90: rund(quantil(a, 0.9), 3) }; })() : null, // prettier-ignore
                s2,
                s3: Object.fromEntries(Object.entries(sprung).map(([n, S]) => [n, { ...S, max: rund(S.max, 4), stetig: rund(S.stetig, 4) }])), // prettier-ignore
                s4: {
                    gesetz: { vMS: rund(vS, 2), querMS2: rund(s4Gesetz.max, 2), vBeiMax: s4Gesetz.vBei && rund(s4Gesetz.vBei, 2), rM: s4Gesetz.max > 0 ? rund(s4Gesetz.vBei ** 2 / s4Gesetz.max, 2) : null }, // prettier-ignore
                    welt: { querMS2: rund(s4Welt.max, 2), vBeiMax: s4Welt.vBeiMax && rund(s4Welt.vBeiMax, 2), querSprintMS2: rund(s4Welt.maxSprint, 2), sprintProben: s4Welt.sprintProben, bei: s4Welt.bei }, // prettier-ignore
                },
                s5: {
                    gang: Object.fromEntries(Object.entries(zug.art).map(([a, n]) => [a, rund(n / Math.max(1, zug.takte), 3)])),
                    vMedianMS: zug.v.length ? rund(median(zug.v), 2) : null,
                    vP90MS: zug.v.length ? rund(quantil(zug.v, 0.9), 2) : null,
                    diagMedianZyklen: zug.diag.length ? rund(median(zug.diag), 3) : null,
                    leibTakte: zug.takte,
                },
                natur: (() => {
                    const q = (a, p) => (a.length ? rund(quantil(a, p), 3) : null);
                    const KG = window.__tetrapodaCore;
                    // das Band je Gangart aus dem EINEN Gesetz (tetrapoda gangBand: hinauf an der Natur, hinab unter ihr)
                    const band = Object.fromEntries(["schritt", "trab", "galopp"].map((a) => [a, KG.gangBand(a)]));
                    const jeArt = {};
                    for (const art of Object.keys(natur.fr)) {
                        const fr = natur.fr[art];
                        const S = natur.schritt.filter((s) => s.art === art && s.lamL > 0.2);
                        const aj = S.map((s) => s.lamL / (2.3 * Math.pow(Math.max(1e-3, s.fr), 0.3)));
                        jeArt[art] = {
                            takte: fr.length,
                            froudeQ: [q(fr, 0.1), q(fr, 0.5), q(fr, 0.9)],
                            imBand: band[art] ? rund(fr.filter((f) => f >= band[art][0] && f <= band[art][1]).length / fr.length, 3) : null, // prettier-ignore
                            band: band[art] ? band[art].map((b) => (Number.isFinite(b) ? rund(b, 2) : null)) : null,
                            schritte: S.length,
                            lamLMedian: q(S.map((s) => s.lamL), 0.5),
                            lamSchulterMedian: q(S.filter((s) => s.schulterM).map((s) => (s.lamL * s.L) / s.schulterM), 0.5),
                            ajQ: [q(aj, 0.1), q(aj, 0.5), q(aj, 0.9)],
                            winkelGradQ: natur.winkel[art] ? [q(natur.winkel[art], 0.5), q(natur.winkel[art], 0.99)].map((w) => rund((w * 180) / Math.PI, 1)) : null, // prettier-ignore
                            fussOrtL: natur.ort[art] ? { aufsetzenQ: [q(natur.ort[art].td, 0.1), q(natur.ort[art].td, 0.5), q(natur.ort[art].td, 0.9)], abhebenQ: [q(natur.ort[art].lo, 0.1), q(natur.ort[art].lo, 0.5), q(natur.ort[art].lo, 0.9)], halbS: q(natur.ort[art].S, 0.5) / 2 } : null, // prettier-ignore
                            senkeLQ: natur.senke[art] ? [q(natur.senke[art], 0.5), q(natur.senke[art], 0.95)] : null,
                            slipQ: (() => { const a = natur.slip.filter((s) => s.art === art).map((s) => s.m); return a.length ? [q(a, 0.5), q(a, 0.95), rund(Math.max(...a), 3)] : null; })(), // prettier-ignore
                            slipGesetzQ: (() => { const a = natur.slip.filter((s) => s.art === art && s.g !== null).map((s) => s.g); return a.length ? [q(a, 0.5), q(a, 0.95), rund(Math.max(...a), 3)] : null; })(), // prettier-ignore
                        };
                    }
                    // die Kopf-Ruhe: je Stück ≥ 1 s die Höhe gegen ihr gleitendes Mittel über 0,5 s (der Hang und die Wende fallen heraus,
                    // das Wippen im Takt des Trabs bleibt), die halbe Spanne p5–p95 je Leib
                    const kopfA = [...natur.kopf.values()].map((K) => {
                        const res = [];
                        for (const st of K.stuecke) {
                            if (st.h.length < 60) continue;
                            for (let i = 15; i + 15 < st.h.length; i++) {
                                let m = 0;
                                for (let j = i - 15; j <= i + 15; j++) m += st.h[j];
                                res.push(st.h[i] - m / 31);
                            }
                        }
                        return res.length ? { amp: (quantil(res, 0.95) - quantil(res, 0.05)) / 2, soll: KG.HALTUNG_GESETZ.nick * K.L } : null;
                    }).filter(Boolean);
                    const slipAlle = natur.slip.map((s) => s.m);
                    return {
                        jeArt,
                        slipM: slipAlle.length ? { n: slipAlle.length, p95: q(slipAlle, 0.95), max: rund(Math.max(...slipAlle), 3) } : null,
                        kopfTrab: kopfA.length ? { leiber: kopfA.length, ampMaxCm: rund(100 * Math.max(...kopfA.map((k) => k.amp)), 2), sollCm: rund(100 * Math.min(...kopfA.map((k) => k.soll)), 2), ueber: kopfA.filter((k) => k.amp > k.soll).length } : null, // prettier-ignore
                        flucht: natur.nn.length ? { nnRaumQ: [q(natur.nn, 0.05), q(natur.nn, 0.5), q(natur.nn, 0.95)], fensterRaum: A._verhaltenGesetz().herde.fensterRaum, phiMittel: natur.phi.length ? rund(natur.phi.reduce((a, b) => a + b, 0) / natur.phi.length, 3) : null } : null, // prettier-ignore
                    };
                })(),
                ms: Math.round(msOhneBild),
                schussMs: Math.round(schussMs),
                jpg,
                jpgNah,
                bogen,
            };
        });

    // ── schwarm (luftwasser.K2): der Vogel-Schwarm fliegt aus dem Verband der Herde (`_schwarmVerband`, tetrapoda verbandZug),
    // sein Leittier trägt Ereignisse (`_schwarmLeittier`, tetrapoda schwarmLeittier). Mittag und Sonne als Wort des Reglers; die
    // Schwarm-Karte frisch, die Zelle unter dem Auge trägt den festen Schwarm von 100 Gliedern (der tiefste, der weiteste Kreis),
    // jede andere keinen; je Takt des Spiels (`_vogelTakt`, 60 Hz) blickt das Auge auf das Leittier. I (Staffel 1, 60 s): das Auge
    // steht 40 m quer zum Kurs des Zentrums (nah, jenseits der Flucht-Distanz). Gemessen an den Lagen, die der Takt zeichnet, ab
    // 10 s: die Ausrichtung Φ = |Σv̂|/N (v aus dem Weg je Takt, wie die Herde), die Kohäsion = der Anteil der Glieder im größten
    // Verbund, Glied zu Glied binnen fensterRaum × Paar-Raum (raumM) — die Zahl der Herde (binnen fensterRaum Paar-Räumen vom
    // Mittel) trägt fünf Leiber, hundert Glieder füllen einen Ball weiter als das Fenster; je Takt die Züge des Verbands je Glied
    // durch DIE Funktion der Herde (`verbandZug`). II (Staffel 2): ein Baum an der Mitte des Kreises (im Bild gebaut, das EINE
    // Warten auf den Bau) — jede Krone der Welt daneben zählt; der Spieler geht dem Leittier mit 5 m/s entgegen, bis es
    // auffliegt, dann steht er. Gemessen: der Abstand des Pulks (Mittel der Glieder) zum Spieler beim Auffliegen und in der Ruhe,
    // der Anteil der Glieder, die sich dabei ≥ 20 m entfernen, sein größter Verbund im Flug; dann die Landung — die Höhe des
    // Leittiers gegen den Scheitel aus der Quelle, die den Baum baut (der Eintrag: sein Fuß + `_lodTreeVisHeight`, die
    // Streu-Zelle: ihr Fuß + `_scatterSichtHoehe`), jedes Glied auf der Krone (binnen Radius, unter dem Scheitel). Die Täter:
    // der Verband aus (der Zug gibt den Wunsch zurück), der Zwilling (eine Kopie des Zugs, nicht die Funktion der Herde), das
    // Leittier als Funktion der Uhr ohne Ereignis, die Landung auf einer zweiten Höhe (der Boden + die Kronen-Höhe des Singflugs) ──
    await buehne("schwarm", async (restore) => {
        const [K, VG, tag0, wetter0] = [A._steuerGesetz(), A._vogelGesetz(), s.timeOfDay, s.weather];
        const [zug, S, H] = [K.verbandZug, VG.V.schwarm, (x, z) => r._terrainMacroSurfaceY(x, z)];
        let zuege = 0;
        K.verbandZug = function (x, z, vx, vz, tempo, raum, gl, H, out) {
            zuege += taeter !== "schwarm-zwilling";
            return taeter === "schwarm-verband" ? Object.assign(out, { x: vx, z: vz }) : zug.apply(this, arguments);
        };
        restore.push(() => ((K.verbandZug = zug), (r._schwarmKarte = null), r._uhrSetzen(tag0, "regler"), r._setWeather(wetter0, "regler"))); // prettier-ignore
        if (taeter === "leittier-uhr")
            decke(
                "_schwarmLeittier",
                () =>
                    function (c, zt) {
                        const [x, z] = [c.x + zt.dx, c.z + zt.dz];
                        return (c.leit = { modus: "zieht", x, y: H(x, z) + zt.h, z, gier: zt.gier });
                    }
            );
        // (der Täter nie zufällig wahr: trifft die zweite Höhe den Scheitel binnen des Kronen-Radius — ein Baum von kroneM Höhe,
        // Teil 3 an w28-reise-ort: s:tree:74,0, 0,171 m —, landet er einen Radius über ihm, nie auf ihm)
        if (taeter === "leittier-hoehe")
            decke("_kronenOben", (alt) => (c) => {
                const [o, z] = [alt.call(r, c), H(c[0], c[1]) + VG.V.flug.kroneM];
                return Math.abs(z - o) < c[2] ? o + c[2] : z;
            });
        r._uhrSetzen(0.5, "regler");
        r._setWeather("sunny", "regler");
        const fenster = A._verhaltenGesetz().herde.fensterRaum * S.raumM;
        const [sonne, regen] = [r._sonnenRichtung().y, r._weatherFieldFor(s.weather).rain];
        r._schwarmKarte = null;
        r._vogelSchwarmTakt(sonne, regen);
        const sk = r._schwarmKarte;
        const c = sk.zellen.get(Math.floor(pm.x / S.zelleM) * 1048576 + Math.floor(pm.z / S.zelleM));
        [c.wurf[1], c.wurf[3], c.wurf[4]] = [1, 0, (100 - S.glieder[0]) / (S.glieder[1] - S.glieder[0])];
        const [zt, t, leit] = [{}, { takte: 0, phi: 0, k: [], zuege: 0 }, () => c.leit || {}];
        const glieder = () => sk.voegel.map((v) => [v.x, v.y, v.z]);
        // der größte Verbund: wer Glied zu Glied binnen `fenster` vom ersten Glied eines Verbunds erreichbar ist
        const verbund = (L, gross = 0) => {
            for (const frei = new Set(L.keys()); frei.size;) {
                const kette = [frei.values().next().value];
                for (const a of kette)
                    for (const b of (frei.delete(a), frei))
                        if (Math.hypot(...L[b].map((v, e) => v - L[a][e])) <= fenster) (frei.delete(b), kette.push(b));
                gross = Math.max(gross, kette.length);
            }
            return gross / zt.n;
        };
        // DER TAKT: die Uhr, das Revier, der Spieler (`spieler(x, z)` am Zentrum der Uhr), das Auge auf das Leittier; liefert
        // die Züge des Verbands je Glied
        const takt = (spieler) => {
            r._weltUhrNimm(s.spielZeit + (1 / 60));
            for (const q of sk.zellen.values()) [q.revier, q.frisch] = [q === c, s.spielZeit];
            VG.schwarmZentrum(c.wurf, s.spielZeit, sonne, regen, VG.V, zt);
            const [x, z] = [c.x + zt.dx, c.z + zt.dz];
            const L = leit().x === undefined ? { x, y: H(x, z) + zt.h, z } : leit();
            spieler(x, z);
            pm.y = H(pm.x, pm.z);
            kamera(L.x - pm.x, L.z - pm.z, L.y - pm.y - 1.6);
            const z0 = zuege;
            r._vogelTakt();
            return (zuege - z0) / zt.n;
        };
        for (let k = 0, alt; k < 3600; k++) {
            const n = takt((x, z) => pm.set(x + Math.cos(zt.gier) * 40, 0, z - Math.sin(zt.gier) * 40));
            const L = glieder();
            if (k >= 600 && L.length === zt.n && alt.length === zt.n) {
                const d = L.map((p, i) => [p[0] - alt[i][0], p[2] - alt[i][2]].map((v, e, a) => v / Math.hypot(...a)));
                t.phi += Math.hypot(...[0, 1].map((e) => d.reduce((m, v) => m + v[e], 0))) / zt.n;
                [t.zuege, t.takte] = [t.zuege + n, t.takte + 1];
                if (k % 6 === 0) t.k.push(verbund(L));
            }
            alt = L;
        }
        const zahl = (v, n = t.takte) => rund(v / n, 3);
        const aus = { glieder: zt.n, takte: t.takte, fensterM: fenster, phi: zahl(t.phi), kohaesion: zahl(t.k.reduce(addiere), t.k.length), kohaesionMin: Math.min(...t.k), zuegeJeGlied: zahl(t.zuege), fluchtM: S.leittier.fluchtM }; // prettier-ignore
        // II: der Baum an der Mitte des Kreises, im Bild gebaut (der Spieler bei ihm); dann geht der Spieler von dort, wo das
        // Zentrum in 8 s fliegt, dem Leittier mit 5 m/s entgegen, bis es auffliegt, und steht
        pm.set(c.x, H(c.x, c.z) + 0.5, c.z);
        const baum = r.spawnArchitecture("baum_eiche", { x: c.x, y: pm.y, z: c.z }, { silent: true });
        restore.push(() => r.removeArchitecture(baum, { still: true }));
        await __gebautNach(baum, { fertig: () => r._archIsRendered(baum) && r._lodTreeVisHeight(baum) > 0 });
        VG.schwarmZentrum(c.wurf, s.spielZeit + 8, sonne, regen, VG.V, zt);
        pm.set(c.x + zt.dx, 0, c.z + zt.dz);
        const [F, Ld, kf] = [(aus.flucht = {}), (aus.landung = {}), []];
        const ab = (p) => Math.hypot(p[0] - pm.x, p[1] - pm.y, p[2] - pm.z);
        const mitte = (G) => [0, 1, 2].map((e) => G.reduce((m, p) => m + p[e], 0) / G.length);
        for (let k = 0, M0; k < 6000 && Ld.nachS === undefined; k++) {
            const [L, d] = [leit(), Math.hypot(leit().x - pm.x, leit().z - pm.z)];
            takt(() => M0 || !(d > 1) || pm.set(pm.x + ((L.x - pm.x) / d) * (5 / 60), 0, pm.z + ((L.z - pm.z) / d) * (5 / 60))); // prettier-ignore
            const [m, G] = [leit().modus, glieder()];
            if (m === "flieht") [M0, F.ausloesS] = M0 ? [M0, F.ausloesS] : [G, k / 60];
            if (m === "flieht" && k % 6 === 0) kf.push(verbund(G));
            if (m !== "flieht" && M0 && F.ruheM === undefined)
                Object.assign(F, {
                    abstandM: rund(ab(mitte(M0)), 1),
                    ruheM: rund(ab(mitte(G)), 1),
                    wegAnteil: rund(M0.filter((p, i) => G[i] && ab(G[i]) - ab(p) >= 20).length / zt.n, 3),
                    kohaesion: rund(Math.min(...kf), 3),
                });
            if (m === "sitzt") Ld.nachS = k / 60;
        }
        Ld.modus = leit().modus;
        if (Ld.nachS === undefined) return aus;
        takt(() => {});
        // der Scheitel aus der Quelle, die den Baum baut: der Eintrag „a:<id>" (sein Fuß + Sichthöhe) oder die Streu-Zelle
        // „s:<Schicht>:<x>,<z>" (ihr Fuß + `_scatterSichtHoehe`)
        const [Kr, G] = [leit().krone, glieder()];
        const [art, schicht, zelle] = Kr.schluessel.split(":");
        const q = art === "a" ? s.architectures.find((e) => "a:" + e.id === Kr.schluessel) : [...s.scatterRegions.values()].flatMap((g) => g.cells).find((q) => q.layer === schicht && q.cellX + "," + q.cellZ === zelle); // prettier-ignore
        const oben = q.position ? q.position.y + r._lodTreeVisHeight(q) : q.fuss.y + r._scatterSichtHoehe(A.SCATTER.layers.find((l) => l.name === schicht), q.species, q.cellX, q.cellZ, q.variantIndex, q); // prettier-ignore
        Object.assign(Ld, {
            krone: Kr.schluessel,
            scheitelM: rund(oben, 3),
            dyM: rund(Math.abs(leit().y - oben), 3),
            radiusM: Kr.r,
            aufKrone: rund(G.filter((p) => Math.hypot(p[0] - Kr.x, p[2] - Kr.z) <= Kr.r && p[1] <= oben + 0.05 && p[1] >= oben - Kr.r).length / zt.n, 3), // prettier-ignore
        });
        return aus;
    });

    // ── reload: ein verwundetes Tier kehrt verwundet und mit seiner Gier zurück ──
    await buehne("reload", async () => {
        const c = tier(land(30, 12), "wesen");
        const hpMax = c.userData.hpMax;
        c.userData.hp = 0.55 * hpMax;
        c.rotation.y = 1.0;
        if (c.userData._steuer) c.userData._steuer.gier = 1.0;
        if (taeter === "reload")
            decke(
                "_serializeCreature",
                (alt) =>
                    function (cr) {
                        const o = alt.call(this, cr);
                        if (o) {
                            delete o.hp;
                            delete o.hpAnteil; // die Wunde reist als Anteil des Lebens
                            delete o.gier;
                        }
                        return o;
                    }
            );
        const snap = r._serializeCreature(c);
        const hpVor = c.userData.hp;
        r.removeCreature(c);
        const c2 = r._restoreCreatureFromSnapshot(snap);
        if (!c2) return { fehler: "Restore" };
        const wunde = { hpVor: rund(hpVor, 2), hpNach: rund(c2.userData.hp, 2), gierFehlerGrad: rund(Math.abs(grad(wrap(c2.rotation.y - 1.0))), 1) }; // prettier-ignore
        // … UND SEIN TIER (w28-bestand-kennung): ein Begleiter (sein Auftrag hält ihn gezeichnet), dessen Tier zwei Kacheln hinter dem
        // Spieler ankert, kehrt über das Leben des Stands (`_lebenImStand` → `_lebenAusStand`) mit seinem Tier wieder; die Annahme
        // danach — in der neuen Seite zählt keine Sitzung mehr (`seite`) — tritt mit eigener Kennung in den Bestand
        r.removeCreature(c2);
        aufraeumen.push(leihe(s, { feldAkte: [] }), leihe(r, { _feldAktGewirkt: null, _lebenStand: null, _lebenWecker: null, _annahmeOffen: null })); // prettier-ignore
        // die Bühne stellt den Spieler zwei Kacheln weiter und rechnet keinen Takt des Bestands: die Annahme ist am Eingang an der
        // Reihe (`_feldFolgeSteht`, w28-mp-boden — im Spiel tritt sie hinter die Takte, die die neuen nahen Regionen noch nachholen)
        aufraeumen.push(leihe(r, { _feldFolgeSteht: () => true }));
        const seite = { n: 0 };
        // der Täter des Stands: die Akte seines Gaus reisen nicht (der Begleiter ist ein Kopf des Gaus, Leben C2b)
        if (taeter === "reload-fern") decke("_gauImStand", () => () => []);
        // der Täter der Kennung: die Annahme zählt die Sitzung statt der Akte ihres Gaus (die neue Seite beginnt wieder bei 1)
        if (taeter === "reload-kennung")
            decke("_gauAnnahme", (alt) => (c, ...rest) => {
                alt.call(r, c, ...rest);
                const t = c.userData._bestand;
                const akt = r._gauHalt().get(t.gx + "," + t.gz).find((x) => x.art === "ein" && x.id === t.lokal);
                r._gauOffen.delete(t.id);
                akt.id = t.lokal = t.lokal.replace(/\d+$/, String(++seite.n));
                r._gauOffen.set((t.id = t.gau + t.lokal), t);
            });
        const heim = land(30, 12);
        const b = tier(heim, "wesen");
        r.assignCreatureTask(b, "follow_player", {}, { silent: true });
        r._bestandAdoptieren();
        const kennung = b.userData._bestand.id;
        pm.x += 2 * r._bestandSeite();
        const [leben, snapB] = [jsonKlon(r._lebenImStand()), jsonKlon(r._serializeCreature(b))];
        r.removeCreature(b);
        r._lebenAusStand(leben);
        seite.n = 0;
        const b2 = r._restoreCreatureFromSnapshot(snapB);
        const neu = tier(heim, "wesen");
        r._bestandAdoptieren();
        // der Gau antwortet am Takt der Annahme (die Uhr rückt bis zu ihm, kein Takt des Bestands; danach rechnet das Gesetz — ein
        // Tod im Takt danach ist sein Urteil, keiner der Annahme): der Begleiter findet sein Tier im Bild, die Annahme steht im
        // Bestand der Art — gelesen am EINEN Leser (`_bestandArt`)
        const key = r._bestandKey(heim.x, heim.z);
        const [neuId, T] = [neu.userData._bestand.id, A._bestandGesetz().B.taktS];
        while (Math.floor(r._feldHorizont() / T) < neu.userData._bestand.einTakt) uhrVor(T);
        await gauLies([key]);
        const B = r._bestandArt(key, A.TETRAPODA_SOUL_MAP.wesen);
        return {
            ...wunde,
            tierNah: r._bestandNah().includes(key),
            mitTier: !!b2 && !!b2.userData._bestand && b2.userData._bestand.id === kennung,
            kennung: [kennung, neuId],
            // die Annahme tritt als EIGENER Kopf ein: ihre Kennung ist nicht die eines Tiers im Stand (dessen Akt „ein“ wirkte schon —
            // der Kern ließe ihren fallen, und ihr Leib nähme dem Begleiter sein Tier)
            annahmeTritt: neuId !== kennung && !!B && B.tiere.some((t) => t.id === neuId),
        };
    });

    // ── zufall (Lehre 7): kein Math.random im Kreatur-Leben — der LEBENDE Code (r[name]) über window.__codeOf je Methode
    // mit Tier im Namen, dazu die benannten Wurf-Stellen; eine benannte Methode, die fehlt, ist rot ──
    await buehne("zufall", async () => {
        const BENANNT = [
            "_spawnOneInitialCreature",
            "_creatureNaturalBirth",
            "_kreaturGeburtsOrt",
            "tickFaunaLifecycle",
            "_pickCreatureSoulName",
            "_pickCreatureName",
            "_affinityPickFromCandidates",
            "_pickFaunaSoulAtPlayer",
            "damageCreature",
            "updateCreatures",
            "updateCreatureEmotions",
            "_creatureSpeakProactive",
            "creatureDrawerInitDOM",
            "creatureJump",
            "_tickKreaturVerhalten",
            "_faunaRng",
        ];
        if (taeter === "zufall")
            decke(
                "_pickCreatureName",
                (alt) =>
                    function (...a) {
                        return Math.random() < 2 ? alt.apply(this, a) : null;
                    }
            );
        const namen = new Set(BENANNT);
        for (const n of Object.getOwnPropertyNames(A.prototype)) // der Deskriptor, nie A.prototype[n] (ein Getter legte seinen Speicher auf den Prototyp)
            if (/creature|kreatur|fauna|^_?tier|Tier/i.test(n) && typeof Object.getOwnPropertyDescriptor(A.prototype, n).value === "function") namen.add(n); // prettier-ignore
        const fehlt = [];
        const treffer = [];
        for (const n of namen) {
            const f = r[n];
            if (typeof f !== "function") fehlt.push(n);
            else if (!__fehlt(f, /Math\.random\s*\(/)) treffer.push(n);
        }
        // DIE LOSE DES LEIBS HÄNGEN NIE AN DER LAUFENDEN NUMMER (Welle SAMEN): bis hier würfelten Größe und Name eines Geworfenen
        // aus `_creatureNetSeq`, und A gegen A am Ort dorf (gate:takt, werkbank abdruck) trug nach 593 Takten Einschwingen andere
        // Boot-Tiere als nach 1300. Derselbe Wurf am selben Ort aus demselben Strom, einmal nach 0, einmal nach 100 000 Leibern:
        // Los-Nummer, Größe und Name jedes Geworfenen gleich. Der Täter: die Los-Nummer aus der laufenden Nummer (der alte Stand).
        if (taeter === "zufall-nummer")
            decke(
                "_leibLos",
                () =>
                    function () {
                        return (this.state._creatureNetSeq || 0) + 1;
                    }
            );
        const heim = frei(-40, 60, 40) || land(-40, 60);
        const wurf = (seq) => {
            leer();
            Object.assign(s, { _creatureNetSeq: seq });
            Object.assign(r, { _faunaStroeme: null });
            pm.set(heim.x + 140, heim.y, heim.z);
            kamera(1, 0);
            const g = r._kreaturWurf({ x: heim.x, z: heim.z }, "wesen", "happy", r._faunaRng("los-probe"), 7);
            return g.map((c) => [c.userData.los, c.userData.bodySize, c.userData.name].join("|"));
        };
        const [vorher, nachher] = [wurf(0), wurf(1e5)];
        leer();
        const nummerAnders =
            vorher.filter((x, i) => x !== nachher[i]).length + Math.abs(vorher.length - nachher.length);
        return { methoden: namen.size, benannt: BENANNT.length, fehlt, treffer, leiber: vorher.length, nummerAnders };
    });

    // ── peer: die Sicht-Kopie beim Mitspieler dreht und geht ──
    await buehne("peer", async (restore) => {
        const remote = s.p2p && s.p2p.remoteCreatures;
        if (!remote) return { fehler: "kein p2p-Zustand" };
        // Der Täter: die Kopie geht nicht — am lebenden Chokepoint: der echte Takt zieht Lage und Gier nach, nur der Gang
        // der Kopie ruht.
        // Der Täter der Größe (der alte Stand): die Kopie liest ihre Größe nicht aus dem Strom (`b`) — bis leben-erbe würfelte
        // der Empfänger sie aus der Kennung; hier trägt sie die Größe 1 des Art-Mittels
        if (taeter === "peer-groesse")
            decke(
                "_p2pHandleCreaturePos",
                (alt) =>
                    function (peerId, msg) {
                        const list = msg.list.map((e) => Object.assign({}, e, { b: 1 }));
                        return alt.call(this, peerId, Object.assign({}, msg, { list }));
                    }
            );
        if (taeter === "peer")
            decke(
                "_p2pTickRemoteCreatures",
                (alt) =>
                    function (t, dt) {
                        const zurueck = leihe(this, { _animateCompoundMotion() {} });
                        try {
                            return alt.call(this, t, dt);
                        } finally {
                            zurueck();
                        }
                    }
            );
        // diesseits der Stufen-Grenze der Welt-Tiere (`ab` 35 m der Kern-Zeile kreatur): dort geht auch ein Welt-Tier
        const o = land(14, -16);
        const dt = 1 / 30;
        let x = o.x;
        restore.push(() => {
            for (const [key, rc] of remote) if (rc.peerId === "linse-peer") r._disposeRemoteCreature(key, rc);
        });
        for (let k = 0; k < 150; k++) {
            x += 1.5 * dt;
            r._p2pHandleCreaturePos("linse-peer", {
                list: [{ id: "c9001", x, y: o.y, z: o.z, yaw: Math.PI / 2, b: 1.37, soul: "wesen" }],
            });
            r._p2pTickRemoteCreatures(100 + k * dt, dt);
        }
        const rc = remote.get("linse-peer:c9001");
        if (!rc) return { fehler: "keine Sicht-Kopie" };
        const tb = rc.mesh.userData && rc.mesh.userData._tierBaum;
        return {
            gierFehlerGrad: rund(Math.abs(grad(wrap(rc.mesh.rotation.y - Math.PI / 2))), 1),
            gangV: tb?._gang ? rund(tb._gang.v || 0, 2) : 0,
            // die Größe des Originals reist im Strom (`b`, leben-erbe), nie aus der Kennung
            groesse: rund(rc.mesh.scale.x, 3),
        };
    });

    // ── nexus: kein Würfel schreibt ein Körper-Gesetz — der Würfel (fester Strom), die Ops (im Gesetz-Band des Körpers),
    // die Größe (nur die bodySize-Achse), der Tempo-Hauch der Tiere (im Band wandern) und die Nexus-Geburt (nie im Blick) ──
    await buehne("nexus", async (restore) => {
        const KOERPER = ["player_speed", "player_jump_power", "creatures_speed_mul", "creatures_size_mul"];
        const eff = r.dslEffects;
        const ops0 = {};
        for (const k of KOERPER) ops0[k] = eff[k];
        restore.push(() => {
            for (const k of KOERPER) {
                if (ops0[k]) eff[k] = ops0[k];
                else delete eff[k];
            }
        });
        // Die alten Ops als Täter (der Stand vor dem Schnitt, wörtlich): ein absoluter Wert, eine Skala ohne Achse, ein
        // Tempo ohne Leser, die Geburt im Ring um den Ziel-Punkt.
        if (taeter === "nexus-gesetz") {
            const W = A.DSL_WERTE; // das Band hält dslEval — der Täter nimmt es mit
            A.DSL_WERTE = { ...W, player_jump_power: null, player_speed: null };
            restore.push(() => (A.DSL_WERTE = W));
            eff.player_jump_power = ([v]) => {
                s.jumpPower = r.dslClamp(v, 5, 40);
            };
            eff.player_speed = ([v]) => r._applyPlayerSpeed(r.dslClamp(v, 1, 30));
        }
        if (taeter === "nexus-groesse")
            eff.creatures_size_mul = ([f]) => {
                for (const cr of s.creatures) if (cr.scale) cr.scale.multiplyScalar(r.dslClamp(f, 0.5, 3));
            };
        if (taeter === "nexus-wuerfel")
            decke(
                "dslComposeAtomic",
                (alt) =>
                    function (g) {
                        return g() < 0.1 ? ["player_jump_power", 18.56] : alt.call(this, g);
                    }
            );
        if (taeter === "nexus-geburt")
            decke(
                "_kreaturGeburtsOrt",
                () =>
                    function () {
                        return { x: pm.x + 3, z: pm.z + 1 };
                    }
            );
        // (a) DER WÜRFEL: ein fester Strom (der Vorlagen-RNG mulberry32, phyto-core) über den Kompositions-Pool des Nexus.
        const rng = window.__phytoCore.mulberry32(0x9e3779b9);
        const flach = (n, out) => {
            if (Array.isArray(n)) {
                if (typeof n[0] === "string") out.push(n[0]);
                for (const x of n) flach(x, out);
            }
            return out;
        };
        let wuerfe = 0,
            koerperWuerfe = 0;
        for (let k = 0; k < 4000; k++) {
            wuerfe++;
            if (flach(r.dslComposeAtomic(rng), []).some((o) => KOERPER.includes(o))) koerperWuerfe++;
        }
        // (b) DAS GESETZ-BAND des Körpers (koerper fx.bewegung: base + leicht + mag, die Tags in [0, 1]) × die Größe des
        // Leibs — dieselbe Pipeline, die die Stats rechnet (computePlayerStats): g = Stat / Rohwert der Tags.
        const cps = r.computePlayerStats();
        const band = (stat) => {
            const K = A._bewegungsKoeff(stat);
            const roh = A.STAT_FROM_TAGS[stat](cps.tags);
            const g = roh > 0 ? cps.stats[stat] / roh : 1;
            return { min: K.base * g, max: (K.base + K.leicht + K.mag) * g };
        };
        const bS = band("speed"),
            bJ = band("jumpPower");
        r.dslRun(["player_speed", 10.01], { source: "nexus" });
        r.dslRun(["player_jump_power", 18.56], { source: "nexus" });
        const speedNach = s.speed,
            sprintNach = s.sprintSpeed,
            sprungNach = s.jumpPower;
        // (c) DIE GRÖSSE nur über die bodySize-Achse, in der Spanne des Lebens-Gesetzes (`__lebenCore.spanne()`; bis leben-erbe
        // die vier Größen-Bänder 0,6–2,7) — auch das Tier, das mit 2,5 gerufen wird, und nach dem Hauch × 3.
        const [bsMin, bsMax] = A._lebenKern().spanne();
        const o = land(40, -30);
        const tiere = [1, 0.7, 2.5, 1.2].map((bs, i) => tier({ x: o.x + i * 4, y: o.y, z: o.z }, "wesen", bs));
        r.dslRun(["creatures_size_mul", 1.11], { source: "nexus" });
        r.dslRun(["creatures_size_mul", 3], { source: "nexus" });
        let ohneAchse = 0,
            ausserBand = 0;
        for (const c of tiere) {
            const bs = c.userData.bodySize;
            if (Math.abs(c.scale.x - bs) > 1e-6) ohneAchse++;
            if (!(bs >= bsMin - 1e-9 && bs <= bsMax + 1e-9)) ausserBand++;
        }
        // (d) DER TEMPO-HAUCH der Tiere: gelesen (der Charakter ändert sich) und im Band des Wander-Gesetzes.
        const W = A._verhaltenGesetz().wandern;
        const c0 = tiere[0];
        const vor = r._creatureMoveCharacter(c0).speedMul;
        r.dslRun(["creatures_speed_mul", 0.7], { source: "emotion:peace" });
        const nach = r._creatureMoveCharacter(c0).speedMul;
        r.dslRun(["creatures_speed_mul", 5], { source: "nexus" });
        r.dslRun(["creatures_speed_mul", 5], { source: "nexus" });
        const hoch = r._creatureMoveCharacter(c0).speedMul;
        // (e) DIE NEXUS-GEBURT: fern und nie im Blick (dasselbe Gesetz wie die natürliche Geburt).
        for (const c of tiere) r.removeCreature(c);
        kamera(1, 0);
        const vorN = s.creatures.length;
        r.dslRun(["spawn_creature", ["at_player"], 4, "happy"], { source: "nexus" });
        const geboren = s.creatures.slice(vorN);
        let imBlickN = 0,
            minD = Infinity;
        for (const c of geboren) {
            if (imBlick(c.position.x, c.position.y + 0.5, c.position.z)) imBlickN++;
            minD = Math.min(minD, ab(c.position, pm));
        }
        return {
            wuerfe,
            koerperWuerfe,
            speedBand: [rund(bS.min, 3), rund(bS.max, 3)],
            speedNach: rund(speedNach, 3),
            sprintNach: rund(sprintNach, 3),
            sprintSoll: rund(speedNach * A._sprintMulGesetz(), 3),
            sprungBand: [rund(bJ.min, 3), rund(bJ.max, 3)],
            sprungNach: rund(sprungNach, 3),
            groesseN: tiere.length,
            ohneAchse,
            ausserBand,
            tempoVor: rund(vor, 3),
            tempoNach: rund(nach, 3),
            tempoHoch: rund(hoch, 3),
            tempoBand: [W.speedMulMin, W.speedMulMax],
            geburten: geboren.length,
            geburtImBlick: imBlickN,
            geburtMinM: geboren.length ? rund(minD, 1) : null,
            fernMin: A.CREATURE_SPAWN_FAR_MIN,
        };
    });

    // ── temperament (Lehre 8): das Temperament aus Gattung und Größe — je Seele und Größe, die Wariness vor einem ruhigen
    // Spieler, was der Leib daraus macht (Fluchttier fort, Wehrhafter heran), und der Kampf liest dasselbe Temperament ──
    await buehne("temperament", async () => {
        if (taeter === "temperament")
            decke(
                "_creatureTemperament",
                () =>
                    function (c) {
                        return (c && c.userData && c.userData.soul) === "wolf" ? "wild" : "wehrhaft";
                    }
            );
        if (taeter === "temperament-masse")
            // der Zwilling der Vereinigung: das Gemüt aus der Dial-Masse size × Größe
            decke(
                "_creatureTemperament",
                () =>
                    function (c) {
                        const ud = c.userData;
                        const d = this._ofenKreaturDials(this._kreaturGattung(c), ud.gussDials || null).dials;
                        const masse = d.size * (ud.bodySize || 1);
                        if (d.diet >= 0.75) return masse >= 2 ? "wild" : "scheu";
                        if (d.diet <= 0.25) return masse >= 5 ? "wehrhaft" : "scheu";
                        return masse >= 3 ? "wehrhaft" : "sanft";
                    }
            );
        r.setGameMode("frieden");
        ruhigSpieler({ peace: 0.9 });
        const art = {};
        const o = land(30, 30);
        const probe = (seele, bs) => {
            const c = tier({ x: o.x, y: o.y, z: o.z }, seele, bs);
            const t = r._creatureTemperament(c);
            r.removeCreature(c);
            return t;
        };
        // der größte Hirsch ist der des Gesetzes (+4σ, `__lebenCore.spanne()`, ~207 kg) — bis leben-erbe der Gigant 2,5 (kolossKg
        // 600 kg ab Größe 1,86: eine Größe, die das Gesetz des Lebens nicht mehr trägt)
        const gross = A._lebenKern().spanne()[1];
        for (const [seele, bs, name] of [
            ["wesen", 1],
            ["wolf", 1],
            ["baer", 1],
            ["fuchs", 1],
            ["wesen", gross, "gross"],
            ["wolf", 0.6],
            ["baer", 0.7],
        ])
            art[seele + "@" + (name || bs)] = probe(seele, bs);
        // DIE EINE MASSE: Temperament und Beute lesen die Masse, die auch der Stoß liest (`_leibMasse`) — Beweis am Ruf.
        const leibRufe = (fn) => {
            const alt = r._leibMasse;
            let n = 0;
            r._leibMasse = function (...a) {
                n++;
                return alt.apply(this, a);
            };
            try {
                fn();
            } finally {
                delete r._leibMasse;
            }
            return n;
        };
        const wolfB = tier(land(36, 30), "wolf", 1);
        const hirschB = tier(land(36, 34), "wesen", 1);
        r._creatureTemperament(hirschB); // sein Gemüt steht: das Beute-Urteil zählt nur die eigenen Masse-Rufe
        const frisch = tier(land(30, 34), "wolf", 1);
        delete frisch.userData._temperament;
        const masseQuelle =
            leibRufe(() => r._creatureTemperament(frisch)) > 0 &&
            leibRufe(() => r._kreaturIstBeute(wolfB, hirschB)) >= 2;
        const beute = {
            hirsch: r._kreaturIstBeute(wolfB, hirschB),
            kitz: r._kreaturIstBeute(wolfB, tier(land(36, 38), "wesen", 0.6)),
            baer: r._kreaturIstBeute(wolfB, tier(land(40, 30), "baer", 1)),
        };
        leer();
        // (Hirsch und Bär vor dem ruhigen Spieler misst die Furcht-Probe in der Welt: der Hirsch flieht, der Bär naht)
        // Der Kampf liest dasselbe Temperament: die Furcht-Dauer eines getroffenen Wesens.
        const VG = A._verhaltenGesetz();
        const furcht = (seele) => {
            const c = tier(land(20, -20), seele, 1);
            c.userData.hp = 9999;
            const t0 = s.creatureAnimationTime; // die Kampf-Furcht auf der Kreatur-Uhr
            r.damageCreature(c, 1, { source: "linse" });
            const dauer = c.userData.fearUntil - t0;
            const soll = VG.furcht.fearSec * VG.temperament.profile[r._creatureTemperament(c)].fleeMul;
            r.removeCreature(c);
            return { dauer: rund(dauer, 2), soll: rund(soll, 2) };
        };
        return {
            art,
            masseQuelle,
            beute,
            kampfHirsch: furcht("wesen"),
            kampfBaer: furcht("baer"),
        };
    });

    // ── abstand: der persönliche Raum je Leib (`_kreaturLeib`) — je Takt die Lücke zwischen zwei Leibern und zwischen Leib
    // und Spieler-Kapsel, am Ende der Abstand der Mitten gegen die Körper-Kugeln ──
    await buehne("abstand", async (restore) => {
        r.setGameMode("frieden");
        ruhigSpieler({ peace: 0.9 });
        if (taeter === "abstand") {
            // der alte Defekt: der Zug der Herde je Glied ab 1 m als Summe (der Körper zählt nicht), keine Kontakt-Lösung
            const K = A._steuerGesetz();
            const alt = K.verbandZug;
            K.verbandZug = function (x, z, vx, vz, tempo, raum, glieder) {
                const o = { x: vx, z: vz, n: 0 };
                for (const nb of glieder) {
                    const d = ab(nb, { x, z });
                    if (o.n >= 6 || !(d > 1 && d < 5)) continue;
                    o.x += ((nb.x - x) / d) * 0.5 * tempo;
                    o.z += ((nb.z - z) / d) * 0.5 * tempo;
                    o.n++;
                }
                return o;
            };
            restore.push(() => (K.verbandZug = alt));
            decke("_leibPaar", () => () => false);
        }
        if (taeter === "abstand-spieler") {
            // die Separation und der Weg des Gangs ohne den Spieler: ein Nachbar drückt das vordere Tier in ihn
            const ohne = (alt) =>
                function (...a) {
                    const p = this.state.playerMesh;
                    this.state.playerMesh = null;
                    try {
                        return alt.apply(this, a);
                    } finally {
                        this.state.playerMesh = p;
                    }
                };
            decke("_applyCreatureSeparation", ohne);
            decke("_leibGegenLeiber", ohne);
        }
        // im Freien (keine Hülle im Umkreis): die Wand eines Baus hat das letzte Wort und schöbe einen Leib in den nächsten
        const start = frei(40, -40, 20) || land(40, -40);
        pm.set(start.x, start.y, start.z);
        const tiere = [];
        // sechs Bären und zwei Wölfe im Ring; die Verbände (S6): zwei Bärinnen und ihr Junges (0,6) GEGENÜBER, der Spieler
        // zwischen ihnen — der Verband zieht sie über ihn hinweg zusammen, sein Raum muss halten; die Wölfe ein Rudel
        for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2 + 0.2;
            const d = k < 6 ? 7 : 9;
            const c = tier(
                { x: pm.x + Math.cos(a) * d, y: pm.y, z: pm.z + Math.sin(a) * d },
                k < 6 ? "baer" : "wolf",
                k === 4 || k === 5 ? 0.6 : 1
            );
            ruhig(c);
            tiere.push(c);
        }
        for (const v of [
            [0, 4],
            [1, 5],
            [6, 7],
        ])
            r._kreaturVerbinden(v.map((i) => tiere[i]));
        const leibVon = A.prototype._kreaturLeib;
        const seg = (c) => {
            const lb = leibVon.call(r, c, undefined, {});
            return {
                ax: c.position.x - lb.fx * lb.halb,
                az: c.position.z - lb.fz * lb.halb,
                bx: c.position.x + lb.fx * lb.halb,
                bz: c.position.z + lb.fz * lb.halb,
                r: lb.radius,
                halb: lb.halb,
                kugel: lb.halb + lb.radius,
            };
        };
        // Abstand zweier Strecken in XZ (die Kapsel-Achsen)
        const pS = (px, pz, s0) => {
            const vx = s0.bx - s0.ax,
                vz = s0.bz - s0.az;
            const l2 = vx * vx + vz * vz;
            const t = l2 > 0 ? Math.max(0, Math.min(1, ((px - s0.ax) * vx + (pz - s0.az) * vz) / l2)) : 0;
            return Math.hypot(px - (s0.ax + vx * t), pz - (s0.az + vz * t));
        };
        const sS = (a, b) => {
            // Kreuzung?
            const cr = (ox, oz, ux, uz, wx, wz) => ux * (wz - oz) - uz * (wx - ox);
            const d1 = cr(a.ax, a.az, a.bx - a.ax, a.bz - a.az, b.ax, b.az),
                d2 = cr(a.ax, a.az, a.bx - a.ax, a.bz - a.az, b.bx, b.bz),
                d3 = cr(b.ax, b.az, b.bx - b.ax, b.bz - b.az, a.ax, a.az),
                d4 = cr(b.ax, b.az, b.bx - b.ax, b.bz - b.az, a.bx, a.bz);
            if (d1 * d2 < 0 && d3 * d4 < 0) return 0;
            return Math.min(pS(a.ax, a.az, b), pS(a.bx, a.bz, b), pS(b.ax, b.az, a), pS(b.bx, b.bz, a));
        };
        const RP = A.PLAYER_WALL_RADIUS;
        // DER LÖSER LEBT IM SIM-SCHRITT (`_leibKontakte`): eine Lücke zweier Leiber unter null darf nur so tief sein, wie
        // beide in DIESEM Frame liefen und wendeten; am Spieler zählt jede Lücke unter −2 cm.
        const vorher = tiere.map(() => ({ x: 0, z: 0, g: 0 }));
        const schritt = tiere.map(() => 0);
        let minLeib = Infinity,
            minSpieler = Infinity,
            erbeMax = 0,
            durchFrames = 0,
            spielerFrames = 0;
        const nnRaum = []; // je Tier und Takt (die zweite Hälfte): der nächste Nachbar in Körper-Kugeln
        const spRaum = []; // je Takt (die zweite Hälfte): der nächste Leib am Spieler in Körper-Kugeln (seine: die Wand-Kapsel)
        const N = 900;
        for (let k = 0; k < N; k++) {
            tiere.forEach((c, i) => {
                vorher[i].x = c.position.x;
                vorher[i].z = c.position.z;
                vorher[i].g = c.rotation.y;
            });
            takt(1 / 60);
            if (k < 30) continue;
            const S = tiere.map(seg);
            tiere.forEach((c, i) => {
                schritt[i] = ab(c.position, vorher[i]) + Math.abs(wrap(c.rotation.y - vorher[i].g)) * S[i].halb;
            });
            if (k >= N / 2) spRaum.push(Math.min(...S.map((s, i) => ab(tiere[i].position, pm) / (s.kugel + RP))));
            if (k >= N / 2)
                for (let i = 0; i < tiere.length; i++) {
                    let m = Infinity;
                    for (let j = 0; j < tiere.length; j++)
                        if (j !== i)
                            m = Math.min(m, ab(tiere[i].position, tiere[j].position) / (S[i].kugel + S[j].kugel));
                    nnRaum.push(m);
                }
            let durch = false,
                imSp = false;
            for (let i = 0; i < S.length; i++) {
                const gs = pS(pm.x, pm.z, S[i]) - S[i].r - RP;
                if (gs < minSpieler) minSpieler = gs;
                if (gs < -0.02) imSp = true;
                for (let j = i + 1; j < S.length; j++) {
                    const g = sS(S[i], S[j]) - S[i].r - S[j].r;
                    if (g < minLeib) minLeib = g;
                    const erbe = -g - schritt[i] - schritt[j];
                    if (g < -0.02 && erbe > 0.002) durch = true;
                    if (g < 0) erbeMax = Math.max(erbeMax, erbe);
                }
            }
            if (durch) durchFrames++;
            if (imSp) spielerFrames++;
        }
        // am Ende die zwei nächsten Mitten der Schar (der Satz „kein persönlicher Raum“ nennt sie)
        const paar = tiere.flatMap((a, i) => tiere.slice(i + 1).map((b) => a.position.distanceTo(b.position)));
        return {
            tiere: tiere.length,
            minLeibLueckeM: rund(minLeib, 3),
            durchFrames,
            minSpielerLueckeM: rund(minSpieler, 3),
            spielerFrames,
            // die Tiefe zweier Leiber über ihrem Frame-Schritt (geerbt)
            erbeMaxM: rund(erbeMax, 3),
            paarMinM: rund(Math.min(...paar), 2),
            nachbarRaumP10: rund(quantil(nnRaum, 0.1), 3),
            nachbarRaumP50: rund(quantil(nnRaum, 0.5), 3),
            spielerRaumP10: rund(quantil(spRaum, 0.1), 3),
        };
    });

    // ── jagdkreis: der Kreislauf Jäger–Beute schließt sich am ECHTEN Takt: der Riss je Jagd (die Sprinter-Bühne fiel: ihr Täter,
    // der Jagd-Weg im Schritt, steht in jagd und rudel, den Biss am Spieler trägt rudel) · mahl (Tiere K2 Staffel 2): DIESELBEN
    // Jagden der Szene rudel bis zum ersten Riss am gesunden Hirsch, dann trägt er die Kette — der Kadaver, das Rudel frisst,
    // Fuchs und Bär kommen; die Quote misst nur jagdkreis (bis w4-stationen-schnell-a trug jagdkreis die Kette: wer das Mahl
    // wollte, fuhr 100 Jagden) ──
    const jagdkreis = async (restore, mahl) => {
        r.setGameMode("pfad");
        ruhigSpieler();
        // Der alte Weg als Täter: der Gradient des Geruchs-Felds (vier Proben, die vor dem Schnitt die Richtung gaben).
        if (taeter === "jagd-gradient")
            decke(
                "_creatureScentHuntDir",
                (alt) =>
                    function (c, w) {
                        const d0 = alt.call(this, c, w);
                        if (!d0) return null;
                        const beute = c.userData._beute;
                        const q = [{ x: beute.position.x, z: beute.position.z, strength: 1 }];
                        const cx = c.position.x,
                            cz = c.position.z;
                        const gx = (this._scentAt(cx + 4, cz, q) - this._scentAt(cx - 4, cz, q)) / 2;
                        const gz = (this._scentAt(cx, cz + 4, q) - this._scentAt(cx, cz - 4, q)) / 2;
                        const g = Math.hypot(gx, gz);
                        if (!(g > 0.02)) return null;
                        d0.set(gx / g, 0, gz / g);
                        // der Gradient führt — das Ziel ist der Punkt, auf den er zeigt
                        c.userData._beute = {
                            position: { x: cx + (gx / g) * 10, z: cz + (gz / g) * 10 },
                            rotation: { y: 0 },
                            userData: { netId: "gradient", _motionZustand: null },
                        };
                        return d0;
                    }
            );
        // der Fall ohne Kadaver (der Leib liegt und sinkt, kein Fleisch) und die Nase ohne Aas-Witterung als Täter
        if (taeter === "jagd-aas")
            decke(
                "_kreaturFaellt",
                (alt) =>
                    function (c) {
                        const out = alt.call(this, c);
                        delete c.userData.kadaver;
                        return out;
                    }
            );
        if (taeter === "jagd-duft") decke("_kreaturAasZug", () => () => false);
        const dt = 1 / 60;
        // (A) DIE QUOTE JE JAGD (Tiere K2, MacNulty): ein Wolf und vier gegen den Hirsch, vier gegen ein Kitz, in 20 · 60 · 20
        // Saaten; die Jagd endet mit dem Riss oder der Erschöpfung (JAGD_GESETZ). Der erste Riss der vier trägt die Kette: Kadaver,
        // das Rudel frisst, Fuchs und Bär kommen. Jede Jagd auf frischem Feld.
        if (taeter === "jagd-flucht")
            decke(
                "_creatureWariness",
                () =>
                    function (c) {
                        const ud = c.userData || {};
                        const von = ud._bedrohtVon || (ud._bedrohtVon = { x: 0, z: 0, r: 0 });
                        return this._creatureWarinessSpieler(c, A._verhaltenGesetz().furcht, von);
                    }
            );
        if (taeter === "jagd-ohne-ende") decke("_kreaturJagdEndet", () => () => false);
        if (taeter === "jagd-ohne-wunde") decke("_kreaturSprint", () => (c, L) => A._steuerGesetz().sprintTempo(L));
        // der magere Riss: der Kadaver trägt ein Zwölftel seines Fleischs (aas.fleischAnteil 0,05)
        if (taeter === "jagd-mager") {
            const V0 = A._verhaltenGesetzMemo;
            A._verhaltenGesetzMemo = Object.assign({}, V0, { aas: Object.assign({}, V0.aas, { fleischAnteil: 0.05 }) });
            restore.push(() => (A._verhaltenGesetzMemo = V0));
        }
        const R = {
            quote: {},
            rissS: null,
            fleisch0: null,
            fleischEnde: null,
            fressS: 0,
            rudelKg: 0,
            rudelVoll: 0,
            gaeste: [],
        };
        // DAS BAND DER NATUR je Szene (MacNulty et al. 2012: ein Wolf reißt den gesunden Hirsch selten, vier ein Fünftel bis zwei
        // Fünftel der Jagden, das Kitz meist) — die EINE Quelle, das Urteil liest `Q.band`.
        // DIE STICHPROBE TRÄGT IHR URTEIL (laub-kante): das Band gilt der Quote der Jagd, eine Szene misst sie an `n` Jagden mit
        // der Streuung σ = √(p·(1 − p)/n) — 60 Jagden an der Kante 0,4: 0,063. Liegt die Quote außerhalb des Bands und binnen 2 σ
        // seiner Kante, entscheiden die `n` nicht: die Szene jagt 4 · n (dieselben Orte, das Rudel aus anderer Stellung) und urteilt
        // dort, σ halb so breit — EINE Verlängerung auf die feste Zahl, nie ein Halt am ersten grünen Zwischenstand; das Band
        // bleibt, wie es ist. Befund (der Wald der Selbst-Ausdünnung, 921 → 1 849 Bäume binnen 300 m des Jagd-Kreises, 20 von
        // 100 Bühnen an anderem Ort): rudel 22/60 → 27/60 = 0,45 ROT, an 240 Jagden derselben Welten 69 ↔ 75 = 0,29 ↔ 0,31 — die
        // Quote stand, die Stichprobe fiel neu. Ein Täter jagt seine feste Zahl (der Selbsttest misst den Namen des Täters, nie
        // die Schärfe der Quote).
        const offen = (Q, lo, hi) => {
            const v = Q.jagden ? +(Q.risse / Q.jagden).toFixed(2) : null;
            const kante = v === null ? null : v > hi ? hi : v < lo ? lo : null;
            return kante !== null && Math.abs(v - kante) <= 2 * Math.sqrt((kante * (1 - kante)) / Q.jagden);
        };
        // jede Szene steht von Anfang an im Ergebnis (das Zwischen-Urteil je Jagd liest alle drei); ein Täter fährt dieselben 60
        // Jagden des Rudels an denselben Orten wie der Grund — er hält, sobald sein Wort fällt (`stelle` je Jagd)
        const SZENEN = [
            ["einWolf", 1, 1, 20, 0, 0.1],
            ["rudel", 4, 1, 60, 0.2, 0.4],
            ["kitz", 4, 0.6, 20, 0.6, 1],
        ];
        for (const [sz, , , , lo, hi] of SZENEN) R.quote[sz] = { jagden: 0, risse: 0, erschoepft: 0, band: [lo, hi] };
        for (const [szene, nW, gr, n, lo, hi] of SZENEN) {
            const Q = R.quote[szene];
            for (let o = 0, ziel = n; o < ziel && !(mahl && (szene !== "rudel" || R.rissS !== null)); o++) {
                s.creatureAnimationTime = 100;
                r._creatureAiFrame = 0;
                s.emotionField = undefined;
                const w = (2 * Math.PI * o) / n;
                const ort = frei(-60 + Math.cos(w) * 80, 40 + Math.sin(w) * 80, 25) || land(-60, 40);
                // DIE JAGD BEGINNT IN DER WITTERUNG (witterung-windab: gegen den Wind wittert kein Wolf): das Rudel steht windab der
                // Beute, je Jagd um ±17° geschwenkt (bis hier rings um sie, o · 0,7 rad); der Spieler 151 m quer zum Wind
                const wd = r._windAt(ort.x, ort.z, s._simZeit);
                const wa = Math.atan2(wd.z, wd.x) + 0.3 * Math.sin(o * 0.7);
                pm.set(ort.x - wd.z * 151, pm.y, ort.z + wd.x * 151);
                const beute = tier(ort, "wesen", gr);
                ruhig(beute);
                if (taeter === "jagd-hp") beute.userData.hp *= 0.1; // der alte Schleichweg: die verwundete Beute
                Q.hp0 = Math.round(beute.userData.hp);
                const woelfe = [];
                for (let i = 0; i < nW; i++) {
                    const a = wa + (i - (nW - 1) / 2) * 0.5;
                    woelfe.push(tier({ x: ort.x + Math.cos(a) * 25, y: ort.y, z: ort.z + Math.sin(a) * 25 }, "wolf"));
                }
                woelfe.forEach(ruhig);
                r._kreaturVerbinden(woelfe);
                const hetzer = new Set();
                const magenVor = new Map();
                let riss = false;
                // DAS FENSTER IST DAS GESETZ (witterung-windab): die Jagd endet nach ihrer ersten Hetze, wenn der Sprint des
                // Jägers die Strecke der Aufgabe liefe (`_kreaturJagdEndet`, tetrapoda jagdDauerS), die Pirsch davor zählt nicht —
                // die Probe sieht bis zur ersten Hetze + die längste Dauer des Rudels + 5 s, mindestens 90 s. Bis hier
                // endete sie fest nach 90 s: Rudel #35 kreiste 50 s auf dem Ring (größte Lücke 140–154° > 135°, rudelPlatz),
                // hetzte ab 65 s und hieß „ohne Ende", 25 s nach Beginn seiner Hetze (3 von 4 Läufen)
                const JG = A._jagdGesetz();
                const dauerS = Math.max(...woelfe.map((c) => JG.dauerS(A._steuerGesetz().sprintTempo(r._kreaturHueftL(c)), JG.J)));
                const fensterT = Math.ceil((dauerS + 5) / dt);
                for (let k = 0, ende = 5400, hetzeK = null; k < ende; k++) {
                    ruhigSpieler();
                    takt(dt);
                    for (const c of woelfe) if (c.userData._motionZustand === "hetzen") hetzer.add(c);
                    if (hetzeK === null && hetzer.size) [hetzeK, ende] = [k, Math.max(ende, k + fensterT)];
                    if (!riss && s.leichname.includes(beute)) {
                        riss = true;
                        if (szene === "rudel" && R.rissS === null) R.rissS = rund(k * dt, 1);
                        if (!mahl) break;
                        R.fleisch0 = beute.userData.kadaver ? rund(beute.userData.kadaver.fleisch, 1) : null;
                        // die Gäste 30 m windab des Kadavers, 6 m zu beiden Seiten (bis hier 30 m westlich, 18 m zu beiden
                        // Seiten): 11° neben der Achse seiner Fahne, im Kegel bis 10 m/s an der Nase (18 m: 31°, außerhalb
                        // schon ab 1,1 m/s — die Gäste kamen nie)
                        const kw = r._windAt(beute.position.x, beute.position.z, s._simZeit);
                        for (const [seele, q] of [
                            ["fuchs", 6],
                            ["baer", -6],
                        ]) {
                            const [gx, gz] = [kw.x * 30 - kw.z * q, kw.z * 30 + kw.x * q];
                            const g = tier(land(beute.position.x + gx - P0.x, beute.position.z + gz - P0.z), seele);
                            ruhig(g);
                            R.gaeste.push({ seele, c: g, kommtS: null, frissS: 0 });
                        }
                        ende = k + 7200;
                    }
                    if (
                        !riss &&
                        hetzer.size &&
                        [...hetzer].every((c) => r._kreaturErschoepft(c) || !c.userData._motionZustand)
                    ) {
                        Q.erschoepft++;
                        break;
                    }
                    if (!riss || !mahl) continue;
                    if (woelfe.some((c) => c.userData._motionZustand === "fressen")) R.fressS = rund(R.fressS + dt, 2);
                    // was das Rudel frisst (kg in seine Mägen, je Bild der Zuwachs) gegen das, was seine Mägen fassen
                    for (const c of woelfe) {
                        const m = c.userData.magen || 0;
                        if (magenVor.has(c)) R.rudelKg += Math.max(0, m - magenVor.get(c));
                        else R.rudelVoll += r._kreaturMagenVoll(c);
                        magenVor.set(c, m);
                    }
                    for (const G of R.gaeste)
                        if (G.c.userData._motionZustand === "fressen") {
                            G.frissS = rund(G.frissS + dt, 2);
                            if (G.kommtS === null) G.kommtS = rund(k * dt - R.rissS, 1);
                        }
                }
                if (hetzer.size) Q.jagden++;
                if (riss) Q.risse++;
                if (mahl && riss && beute.userData.kadaver) R.fleischEnde = rund(beute.userData.kadaver.fleisch, 1);
                [R.rudelKg, R.rudelVoll] = [rund(R.rudelKg, 1), rund(R.rudelVoll, 1)];
                for (const G of R.gaeste) delete G.c;
                leer(1);
                if (o === n - 1 && ziel === n && !taeter && !mahl && offen(Q, lo, hi)) ziel = 4 * n;
                if (!mahl) await stelle({ riss: R }, `${szene}#${o}`);
            }
        }
        return { riss: R };
    };
    for (const mahl of [false, true]) await buehne(mahl ? "mahl" : "jagdkreis", (restore) => jagdkreis(restore, mahl));

    // ── witterung (Karte 2 erleben.sinne.geruch#1, witterung-windab): DIE WITTERUNG IST EINE FAHNE WINDAB — das Geruch-Feld
    // (`_scentAt`) am EINEN Wind (`_windAt`, auf der Bühne geliehen: Richtung und Tempo fest, die Böe 1). (A) das Gesetz an der
    // Funktion: in der Windstille das Radial-Gesetz exp(−r/rangeM), gegen den Wind 0, quer fallend mit dem Winkel, die Reichweite
    // windab (bis zur Kante der Windstille, exp(−scentRangeM/rangeM)) wächst mit dem Wind und sättigt unter R·(1 + 1/i) — die
    // Mischung verdünnt. (B) die Suche am ECHTEN Takt wie die Station (Wolf 40 m vom Reh, gefunden in 8 m, Deckel 90 s, der
    // Spieler 70 m quer zum Wind): der Wind aus vier Richtungen, je Lauf Suchzeit, der Takt der Witterung und die Bahn (Weg, der
    // Anteil quer zum Wind, die größte Abweichung von der Linie Wolf → Reh) ──
    await buehne("witterung", async () => {
        r.setGameMode("pfad");
        ruhigSpieler();
        const S = A.SCENT;
        const R = A._verhaltenGesetz().jagd.scentRangeM;
        // DER ALTE WEG als Täter (bis witterung-windab): radial × Richtungs-Faktor mit Rest-Sockel 0,4 gegen den Wind, ohne Tempo
        // des Winds — und die alte Nase: jede Witterung > 0 in scentRangeM
        if (taeter === "witterung-sockel") {
            decke(
                "_scentAt",
                () =>
                    function (x, z, q) {
                        let sum = 0;
                        for (const src of q) {
                            const [dx, dz] = [x - src.x, z - src.z];
                            const d = Math.hypot(dx, dz);
                            if (d > 4 * S.rangeM) continue;
                            const w = this._windAt(src.x, src.z, this.state._simZeit);
                            const dot = d > 1e-3 ? (dx * w.x + dz * w.z) / d : 0;
                            sum += (src.strength ?? 1) * Math.exp(-d / S.rangeM) * Math.max(0.2, 0.4 + 0.6 * Math.max(0, dot)); // prettier-ignore
                        }
                        return sum;
                    }
            );
            decke("_scentNase", () => (Rn) => ({ R: Rn, schwelle: Number.MIN_VALUE, reichM: Rn }));
        }
        // der Wind der Welt am Ort der Bühne in Nasen-Höhe (die Zeile; die Station misst ihn, die Probe leiht ihren)
        const M = frei(0, 70, 30);
        if (!M) throw new Error("kein freies Feld (30 m ohne Hülle und Wasser) um den Spieler");
        const weltMs = rund(r._rauchWindAt(M.x, M.z, s._simZeit, 1, null, {}).ms, 2);
        const W = { x: 1, z: 0, ms: 0 };
        const sturm = globalThis.__phytoCore.WIND_FELD.sturmMS;
        decke(
            "_windAt",
            () => (x, z, t, o) => Object.assign(o || {}, { x: W.x, z: W.z, staerke: W.ms / sturm, boe: 1, form: 1, ms: W.ms })
        );
        const gesetz = await teil("gesetz", () => {
            const q = [{ x: M.x, z: M.z, strength: 1 }];
            // die Witterung im Winkel `deg` zur Richtung windab (der Wind zieht nach +x), `rM` von der Quelle
            const am = (deg, rM) => {
                const a = (deg * Math.PI) / 180;
                return r._scentAt(M.x + Math.cos(a) * rM, M.z + Math.sin(a) * rM, q);
            };
            const G = { ruhe: 0, gegen: [], quer: [], reich: [], kanteM: R, deckeM: rund(R * (1 + 1 / S.turbulenz), 1) };
            W.ms = 0;
            for (const deg of [0, 90, 180, 270])
                for (const rM of [10, 40, 80]) G.ruhe = Math.max(G.ruhe, Math.abs(am(deg, rM) - Math.exp(-rM / S.rangeM)));
            for (const ms of [2, 4, 8]) {
                W.ms = ms;
                for (const rM of [10, 40]) G.gegen.push(am(180, rM));
            }
            W.ms = 4;
            for (const deg of [0, 5, 10, 20, 45, 90]) G.quer.push(rund(am(deg, 20), 4));
            const kante = Math.exp(-R / S.rangeM);
            for (const ms of [0, 2, 4, 8, 16]) {
                W.ms = ms;
                let rM = 0;
                while (rM < 400 && am(0, rM + 1) >= kante) rM++;
                G.reich.push(rM);
            }
            return G;
        });
        await stelle({ gesetz }, "gesetz");
        // (C) DAS RUDEL JAGT ALS EINES: zwei Wölfe EINES Verbands, einer 20 m windab des Rehs (in der Fahne), einer 20 m quer
        // (außerhalb des Kegels, er wittert nichts) — der Quere jagt mit, sobald der Windab-Wolf wittert (`_kreaturHaelt`).
        // Täter: der Verband teilt nichts (jedes Glied jagt nur, was es selbst wittert)
        const rudel = await teil("rudel", () => {
            if (taeter === "witterung-allein") decke("_kreaturVerbandGlieder", () => () => null);
            leer(1);
            Object.assign(r, { _creatureAiFrame: 0, _faunaStroeme: null });
            Object.assign(W, { x: 1, z: 0, ms: 4 });
            const sp = neben(M.x, M.z - 70);
            pm.set(sp.x, sp.y, sp.z);
            const reh = tier(neben(M.x, M.z), "wesen", 0.6);
            const [a, b] = [tier(neben(M.x + 20, M.z), "wolf"), tier(neben(M.x, M.z + 20), "wolf")];
            [reh, a, b].forEach(ruhig);
            r._kreaturVerbinden([a, b]);
            const q = [{ x: M.x, z: M.z, strength: 1 }];
            const kante = Math.exp(-R / S.rangeM);
            const o = { windabS: null, querS: null, querWittert: rund(r._scentAt(b.position.x, b.position.z, q) / kante, 3) };
            for (let k = 0; k < 600 && o.querS === null; k++) {
                ruhigSpieler();
                takt(1 / 60);
                if (o.windabS === null && a.userData._beute === reh) o.windabS = rund((k + 1) / 60, 2);
                if (o.querS === null && b.userData._beute === reh) o.querS = rund((k + 1) / 60, 2);
            }
            leer(1);
            return o;
        });
        await stelle({ gesetz, rudel }, "rudel");
        // DIE BEUTE WITTERT (jagd-quote): dieselbe Fahne, dieselbe Nase — ein pirschender Wolf 30 m luvwärts des Rehs (das Reh in
        // seiner Fahne) fällt ihm auf, derselbe Wolf windab (das Reh luvwärts) nicht. MIT DER LAUFZEIT (jagd-quote 2): auffallen kann
        // er erst, wenn seine Front da ist — eben gesetzt (die leere Spur) merkt ihn das Reh nicht, nachdem er τ = 1,5 · r/v an
        // seinem Ort stand (seine Spur, `_duftSpurSchreiben` zur Sim-Zeit t − τ und t; v = u + σ windab, u in Nasen-Höhe) merkt es
        // ihn. Gefragt am Gesetz (`_creatureWarinessEigen`, der Wolf in der Jäger-Liste des Takts, das Auge sieht ihn pirschend erst
        // ab pirschSichtM), ohne Takt. Täter: die Beute ohne Nase — ihre Fahne (`_furchtQuelle`) trägt nichts, wie bis jagd-quote;
        // die Fahne ohne Laufzeit — die Spur fällt aus der Quelle, wie bis jagd-quote 2 (Bühne jagd: 18 von 18 Kitzen rochen den
        // eben gesetzten Wolf auf 20–26 m, 0 Risse im Nah-Kreis).
        const beute = await teil("beute", () => {
            if (taeter === "beute-ohne-nase")
                decke("_scentAt", (alt) => function (x, z, q) {
                    return q === this._furchtQuelle ? 0 : alt.call(this, x, z, q);
                });
            if (taeter === "fahne-ohne-laufzeit")
                decke("_scentAt", (alt) => function (x, z, q) {
                    return alt.call(this, x, z, q.map(({ spur, ...o }) => o)); // eslint-disable-line no-unused-vars
                });
            const NAT = A._verhaltenGesetz().furcht;
            const o = { abstandM: 30, fluchtM: null, laufzeitS: null };
            for (const [art, dx] of [
                ["luv", -30],
                ["lee", 30],
            ]) {
                leer(1);
                Object.assign(W, { x: 1, z: 0, ms: 4 });
                const sp = neben(M.x, M.z - 70);
                pm.set(sp.x, sp.y, sp.z);
                const reh = tier(neben(M.x, M.z), "wesen", 0.6);
                const wolf = tier(neben(M.x + dx, M.z), "wolf");
                [reh, wolf].forEach(ruhig);
                wolf.userData._motionZustand = "jagd";
                r._kreaturJaeger = [wolf];
                o.fluchtM = rund(r._kreaturFluchtDistanzM(reh), 1);
                const merkt = () => r._creatureWarinessEigen(reh) >= NAT.combatFearWariness;
                if (art === "luv") o.frisch = merkt();
                const u = r._rauchWindAt(wolf.position.x, wolf.position.z, s._simZeit, A.SCENT.hoeheM, null, {}).ms;
                const v = u + Math.hypot(A.SCENT.meanderMS, A.SCENT.turbulenz * u);
                const t0 = s._simZeit;
                const tau = (1.5 * Math.abs(dx)) / v;
                o.laufzeitS = rund(Math.abs(dx) / v, 1);
                s._simZeit = t0 - tau;
                r._duftSpurSchreiben(wolf);
                s._simZeit = t0;
                r._duftSpurSchreiben(wolf);
                o[art] = merkt();
            }
            r._kreaturJaeger = [];
            leer(1);
            return o;
        });
        await stelle({ gesetz, rudel, beute }, "beute");
        const suche = await teil("suche", () => {
            const dt = 1 / 60;
            // die Linie Wolf → Reh nach Norden; der Wind zieht (wx, wz): windab — vom Reh zum Wolf (der Wolf in der Fahne),
            // gegen — vom Wolf zum Reh, quer von links und rechts
            const e = { x: 0, z: -1 };
            const reh0 = neben(M.x + e.x * 20, M.z + e.z * 20);
            const wolf0 = neben(M.x - e.x * 20, M.z - e.z * 20);
            const L = {};
            for (const [art, wx, wz] of [
                ["windab", -e.x, -e.z],
                ["quer+", -e.z, e.x],
                ["gegen", e.x, e.z],
                ["quer-", e.z, -e.x],
            ]) {
                leer(1);
                Object.assign(s, { _creatureNetSeq: 1e6, creatureAnimationTime: 100 });
                Object.assign(r, { _creatureAiFrame: 0, _faunaStroeme: null });
                Object.assign(W, { x: wx, z: wz, ms: 4 });
                const sp = neben(M.x - wz * 70, M.z + wx * 70);
                pm.set(sp.x, sp.y, sp.z);
                if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                const wolf = tier(wolf0, "wolf");
                const reh = tier(reh0, "wesen", 0.6);
                ruhig(wolf);
                ruhig(reh);
                const alt = wolf.position.clone();
                const B = { fundS: null, witterS: null, wegM: 0, quer: 0, seitM: 0, minD: ab(wolf.position, reh.position), spieler: 0 }; // prettier-ignore
                let k = 0;
                for (; k < 5400; k++) {
                    ruhigSpieler();
                    takt(dt);
                    const [dx, dz] = [wolf.position.x - alt.x, wolf.position.z - alt.z];
                    B.wegM += Math.hypot(dx, dz);
                    B.quer += Math.abs(-dx * wz + dz * wx);
                    alt.copy(wolf.position);
                    const [lx, lz] = [wolf.position.x - wolf0.x, wolf.position.z - wolf0.z];
                    B.seitM = Math.max(B.seitM, Math.abs(-lx * e.z + lz * e.x));
                    if (B.witterS === null && wolf.userData._beute === reh) B.witterS = rund((k + 1) * dt, 2);
                    if (wolf.userData._beute === s.playerMesh) B.spieler++;
                    const d = s.creatures.includes(reh) ? ab(wolf.position, reh.position) : 0;
                    B.minD = Math.min(B.minD, d);
                    if (d <= 8) {
                        B.fundS = rund((k + 1) * dt, 2);
                        k++;
                        break;
                    }
                }
                L[art] = Object.assign(B, {
                    bisS: rund(k * dt, 2),
                    wegM: rund(B.wegM, 1),
                    quer: B.wegM > 0 ? rund(B.quer / B.wegM, 2) : 0,
                    seitM: rund(B.seitM, 1),
                    minD: rund(B.minD, 1),
                });
            }
            leer(1);
            return { laeufe: L, ms10: 4, msNase: rund(r._rauchWindAt(M.x, M.z, s._simZeit, 1, null, {}).ms, 2), weltMs };
        });
        return { gesetz, rudel, beute, suche };
    });

    // ── rudel: DER SPIELER IST BEUTE im Wolfsrevier (oekologie.K4) — ein Rudel aus dem Wurf (`_kreaturWurf`, die Leine am
    // Wurf-Ort), der stehende Spieler 45 m vom Wurf-Ort (in der Witterung scentRangeM; die Neugier liest das Auge der Art);
    // höchstens 10 Spielminuten am echten Takt, davor je 2 s Frieden und leerer Anker. Die Ereignisse in Sekunden der Kreatur-Uhr: die
    // erste Pirsch auf den Spieler (ein Wolf im Zustand „jagd" mit dem Ziel „spieler"), das erste Umstellen (≥ 3 Jäger, alle
    // näher als 2 × jagd.hetzM, die größte Winkel-Lücke ≤ anderthalb Plätze, 540°/n) und die Lücke beim ersten Biss ──
    await buehne("rudel", async (restore) => {
        if (taeter === "rudel") schrittJagd();
        // der alte Defekt: die Witterung liest nur Tiere, der Spieler ist keine Beute
        if (taeter === "rudel-beute")
            decke("_kreaturIstBeute", (alt) => (j, o) => o !== s.playerMesh && alt.call(r, j, o));
        const heim = frei(60, -60, 45) || land(60, -60);
        pm.set(heim.x + 140, heim.y, heim.z); // der Wurf wirft fern vom Spieler, außer Blick
        kamera(1, 0);
        const woelfe = r._kreaturWurf({ x: heim.x, z: heim.z }, "wolf", "happy", r._faunaRng("rudel"), 7);
        woelfe.forEach(ruhig);
        // der Spieler 45 m windauf des Wurf-Orts: das Rudel steht in seiner Fahne (witterung-windab; bis hier 45 m östlich)
        const wd = r._windAt(heim.x, heim.z, s._simZeit);
        pm.copy(neben(heim.x - wd.x * 45, heim.z - wd.z * 45));
        s.player.hp = 1e9;
        // DAS RUDEL AM SPIELER: die Wölfe, die ihn jetzt pirschen oder hetzen (wer unter der halben Masse des Spielers wiegt,
        // jagt ihn nie — jagd.beuteMasse); die größte Winkel-Lücke des Rudels um ihn in Grad
        const jaeger = () =>
            woelfe.filter(
                (c) => c.userData._jagdZiel === "spieler" && /^(jagd|hetzen)$/.test(c.userData._motionZustand)
            );
        const luecke = (R) => {
            const w = R.map((c) => Math.atan2(c.position.x - pm.x, c.position.z - pm.z)).sort(aufsteigend);
            return grad(Math.max(...w.map((a, i) => (i + 1 < w.length ? w[i + 1] : w[0] + TAU) - a)));
        };
        // die Lücke beim ersten Biss, der den Spieler trifft (das Maul am Leib)
        let ersterBiss = null;
        decke(
            "damagePlayer",
            (alt) =>
                function (amount, quelle) {
                    if (quelle === "jagd" && ersterBiss === null) ersterBiss = luecke(jaeger());
                    return alt.call(this, amount, quelle);
                }
        );
        // DER FRIEDEN und DER LEERE ANKER (der Boot vor dem Guss des Spielers, `_deferredAvatarSoul`): je 2 s keine Pirsch, kein
        // Bruch; der Täter rudel-leib ist die Witterung, die nicht fragt, ob er seinen Leib trägt (die Marke fehlt, die Gestalt auch)
        const leib = [];
        s.playerMesh.traverse((k) => k.userData._leibV > 0 && leib.push([k, k.userData._leibV]));
        const anker = (leer) => {
            for (const [k, v] of leib) k.userData._leibV = leer ? 0 : v;
            s._deferredAvatarSoul = leer && taeter !== "rudel-leib" ? "human" : null;
        };
        restore.push(() => anker(false));
        const ev = { woelfe: woelfe.length, ohnePirsch: [0, 0], pirschS: null, umstelltS: null };
        for (const [i, leer] of [0, 1].entries()) {
            r.setGameMode(leer ? "pfad" : "frieden");
            anker(leer);
            for (let k = 0; k < 120; k++) (takt(1 / 60), (ev.ohnePirsch[i] += jaeger().length > 0));
        }
        anker(false);
        const [t0, H] = [s.creatureAnimationTime, A._verhaltenGesetz().jagd.hetzM];
        for (let k = 0; k < 36000 && ersterBiss === null; k++) {
            ruhigSpieler();
            takt(1 / 60);
            const [R, t] = [jaeger(), rund(s.creatureAnimationTime - t0, 1)];
            if (ev.pirschS === null && R.length) ev.pirschS = t;
            const nah = R.length >= 3 && R.every((c) => ab(c.position, pm) < 2 * H);
            if (ev.umstelltS === null && nah && luecke(R) <= 540 / R.length) ev.umstelltS = t;
        }
        return { ...ev, lueckeBeimBiss: ersterBiss === null ? null : rund(ersterBiss, 0) };
    });

    // ── querhang: die Beine stehen lotrecht, der Leib rollt — Wolf und Hirsch QUER zur Fall-Linie eines Hangs von 20–30°
    // (je Bein Winkel gegen das Lot, Sohle über dem Boden), dann längs der Höhenlinie: der Stand-Schlupf ──
    await buehne("querhang", async () => {
        r.setGameMode("frieden");
        if (taeter === "querhang")
            decke(
                "_animateTierBaum",
                (alt) =>
                    function (group, ...a) {
                        const o = alt.call(this, group, ...a);
                        const Tt =
                            group && group.userData && group.userData._tierBaum && group.userData._tierBaum.teile;
                        if (Tt) for (const k of [Tt.legFL, Tt.legFR, Tt.legHL, Tt.legHR]) if (k) k.rotation.z = 0;
                        return o;
                    }
            );
        if (taeter === "querhang-gleiten") {
            // der Täter: der Fuß im Stand hat keinen Halt am Aufsetz-Punkt — die Pfoten-Haltung wird je Takt vergessen,
            // jeder Takt greift die Pfote dort, wohin der Leib sie mitnahm (der Fuß wandert mit dem Leib)
            decke(
                "_animateTierBaum",
                (alt) =>
                    function (group, ...a) {
                        const gg =
                            group && group.userData && group.userData._tierBaum && group.userData._tierBaum._gang;
                        if (gg?.fuss)
                            gg.fuss.forEach((L, j) => {
                                if (((gg.ph[j] % TAU) + TAU) % TAU >= Math.PI) L.an = false;
                            });
                        return alt.call(this, group, ...a);
                    }
            );
        }
        const h = (x, z) => r.getTerrainHeightAt(x, z);
        // der Hang an (x, z): seine Neigung im Band [lo, hi] über 6 m eben (die Fall-Linie trägt die Neigung, quer kaum
        // Krümmung), kein Bau und kein Wasser in der Gasse des Laufs — sonst der Grund, der ihn verwirft
        const hangAn = (x, z, lo, hi) => {
            if (!r._landAt(x, z)) return { grund: "kein Land" };
            const gx = (h(x + 1.5, z) - h(x - 1.5, z)) / 3,
                gz = (h(x, z + 1.5) - h(x, z - 1.5)) / 3;
            const g = Math.hypot(gx, gz);
            const grad0 = (Math.atan(g) * 180) / Math.PI;
            if (!(grad0 >= lo && grad0 <= hi)) return { grund: `Neigung ${grad0.toFixed(1)}° außerhalb ${lo}–${hi}°` };
            const ux = gx / g,
                uz = gz / g; // bergauf
            for (const t of [-3, -1.5, 1.5, 3])
                for (const o of [-3, 3]) {
                    const px = x + ux * t - uz * o,
                        pz = z + uz * t + ux * o;
                    if (Math.abs(h(px, pz) - (h(x, z) + g * t)) > 0.5) return { grund: "nicht eben über 6 m" };
                }
            // die Gasse des Laufs: längs der Höhenlinie −4 … +10 m (Stand ±1,6 m, der Spieler geht 7 m und zurück, die
            // Folger hinter ihm), quer von 2 m talab bis 6 m bergauf (der Spieler geht 4 m über dem Hang-Punkt)
            for (let l = -4; l <= 10; l += 1.5)
                for (let o = -2; o <= 6; o += 2) {
                    const px = x - uz * l + ux * o,
                        pz = z + ux * l + uz * o;
                    if (!r._landAt(px, pz) || huelleNah(px, pz, h(px, pz), 1.5))
                        return { grund: `die Gasse ist nicht frei (${px.toFixed(1)}|${pz.toFixed(1)})` };
                }
            return { hang: { x, z, ux, uz, grad: grad0 } };
        };
        // DER ORT: der erste Hang von 20–30° nahe dem Spieler; auf der Prüfbühne die feste Rampe ihrer Station
        // (`opts.hangOrt`) — ihre Neigung ≤ 1° an der Spec, sonst ein Fehler
        const ort = opts?.hangOrt || null;
        let hang = null;
        if (ort) {
            const a = hangAn(ort.x, ort.z, ort.winkel - 1, ort.winkel + 1);
            if (!a.hang) return { fehler: `die Rampe ${ort.id} (${ort.winkel}°) trägt den Querhang nicht: ${a.grund}` };
            hang = a.hang;
        }
        for (let ring = 1; ring < 70 && !hang; ring++) {
            const n = ring * 8;
            for (let q = 0; q < n && !hang; q++) {
                const a = (q / n) * Math.PI * 2;
                hang = hangAn(P0.x + Math.cos(a) * ring * 5, P0.z + Math.sin(a) * ring * 5, 20, 30).hang || null;
            }
        }
        if (!hang) return { fehler: "kein Hang von 20–30° ohne Bau nahe dem Spieler" };
        // quer: die Gier längs der Höhenlinie (senkrecht zur Fall-Linie)
        const gierQuer = Math.atan2(-hang.uz, hang.ux);
        const stelle = (seele, o) => {
            const x = hang.x - hang.uz * o,
                z = hang.z + hang.ux * o;
            const c = tier({ x, y: h(x, z) + 0.3, z }, seele, 1);
            ruhig(c);
            c.rotation.y = gierQuer;
            if (c.userData._steuer) c.userData._steuer.gier = gierQuer;
            else c.userData._steuer = { gier: gierQuer, v: 0 };
            r.assignCreatureTask(c, "wait", {}, { silent: true });
            return c;
        };
        pm.set(hang.x + hang.ux * 5, h(hang.x + hang.ux * 5, hang.z + hang.uz * 5) + 0.5, hang.z + hang.uz * 5);
        const tiere = [stelle("wolf", -1.6), stelle("wesen", 1.6)];
        // die Pfoten: der Aufsetz-Punkt jeder Pfote im Pfoten-Raum (in der Stand-Pose)
        const kalib = tiere.map((cr) => {
            const [altPos, altRot] = [cr.position.clone(), cr.rotation.clone()];
            cr.rotation.set(0, 0, 0);
            const P = pfotenRaum(cr, ["legFL", "legFR", "legHL", "legHR"]);
            cr.position.copy(altPos);
            cr.rotation.copy(altRot);
            cr.updateMatrixWorld(true);
            return P && { ps: P.ps, hf: P.glieder, lokal: P.lokal };
        });
        if (kalib.some((k) => !k)) return { fehler: "keine Nah-Gestalt (Pfoten)" };
        const sohlen = (i) => {
            const cr = tiere[i],
                K = kalib[i];
            cr.updateMatrixWorld(true);
            return K.ps.map((p, j) => ({
                w: p.localToWorld(K.lokal[j].clone()),
                hip: new T.Vector3().setFromMatrixPosition(K.hf[j].matrixWorld),
            }));
        };
        const boden = (x, z, ref) => r._standSicht(x, z, ref, false);
        for (let k = 0; k < 120; k++) takt(1 / 60);
        const stand = tiere.map((cr, i) => {
            const S = sohlen(i);
            const lot = S.map((p) => {
                const bx = p.w.x - p.hip.x,
                    by = p.w.y - p.hip.y,
                    bz = p.w.z - p.hip.z;
                return grad(Math.acos(Math.max(-1, Math.min(1, -by / Math.max(1e-6, Math.hypot(bx, by, bz))))));
            });
            return {
                rollGrad: rund(grad(cr.rotation.z || 0), 1),
                lotMaxGrad: rund(Math.max(...lot), 1),
            };
        });
        // der Lauf längs der Höhenlinie: der Spieler geht 1,4 m/s quer, Wolf und Hirsch folgen
        for (const c of tiere) r.assignCreatureTask(c, "follow_player", {}, { silent: true });
        const qx = Math.cos(gierQuer) * 0 + Math.sin(gierQuer),
            qz = Math.cos(gierQuer);
        const dt = 1 / 60;
        const spur = tiere.map(() => [[], [], [], []]);
        const leib = tiere.map(() => []);
        let w = 0;
        for (let k = 0; k < 600; k++) {
            w += 1.4 * dt * (k < 300 ? 1 : -1);
            const x = hang.x + qx * w + hang.ux * 4,
                z = hang.z + qz * w + hang.uz * 4;
            pm.set(x, h(x, z) + 0.5, z);
            takt(dt);
            tiere.forEach((cr, i) => {
                const S = sohlen(i);
                leib[i].push({ x: cr.position.x, z: cr.position.z, hop: (cr.userData._hopH || 0) > 0 });
                S.forEach((p, j) =>
                    spur[i][j].push({ x: p.w.x, z: p.w.z, y: p.w.y - boden(p.w.x, p.w.z, cr.position.y) })
                );
            });
        }
        const schlupf = tiere.map((cr, i) => {
            let fuss = 0,
                weg = 0;
            for (let j = 0; j < 4; j++)
                for (let n = 31; n < spur[i][j].length; n++) {
                    const a = spur[i][j][n - 1],
                        b = spur[i][j][n];
                    const la = leib[i][n - 1],
                        lb = leib[i][n];
                    if (la.hop || lb.hop) continue;
                    const lw = ab(lb, la);
                    if (lw < 0.004) continue;
                    if (a.y < 0.03 && b.y < 0.03) {
                        fuss += ab(b, a);
                        weg += lw;
                    }
                }
            return weg > 0.05 ? rund(fuss / weg, 3) : null;
        });
        return {
            ort: ort ? ort.id : "welt",
            hangGrad: rund(hang.grad, 1),
            stand: { wolf: stand[0], hirsch: stand[1] },
            schlupf: { wolf: schlupf[0], hirsch: schlupf[1] },
        };
    });

    // ── ferngang: ferne Tiere gehen, sie gleiten nie — 4 Hirsche in der Grobstufen-Zone (45–60 m), 4 in der Kapsel-Zone
    // (70–90 m) folgen dem Spieler im Blick; je laufendem Takt GLEITET ein Tier, wenn sein SICHTBARER Leib (Satz,
    // Grobstufe oder feine Stufe) die Hüft-Winkel der vier Beine über 24 Takte in 0,02 rad hält ──
    await buehne("ferngang", async () => {
        r.setGameMode("frieden");
        if (taeter === "ferngang")
            decke(
                "_kreaturLaeuft",
                () =>
                    function () {
                        return false; // der Täter: die Ruhe jenseits der Grenze gilt auch dem, der läuft
                    }
            );
        if (taeter === "ferngang-bindung")
            decke(
                "_gelenkGestalt",
                (orig) =>
                    function (...arg) {
                        // der Täter: die Grobstufe trägt ihre EIGENEN Knochen — sie
                        // bindet nie an die animierten Knochen der feinen
                        const g = orig.apply(this, arg);
                        if (g?.fern) {
                            const eigene = {};
                            g.fern.traverse((n) => {
                                if ((n.isGroup || n.isBone) && n.name) eigene[n.name] = n;
                            });
                            r.constructor._ofenKlonRebind(g.fern, eigene);
                        }
                        return g;
                    }
            );
        // die Richtung mit Land in 45–90 m
        let richtung = null;
        for (let q = 0; q < 16 && !richtung; q++) {
            const a = (q / 16) * Math.PI * 2;
            let ok = true;
            for (const d of [45, 55, 65, 75, 85, 95]) {
                const x = P0.x + Math.cos(a) * d,
                    z = P0.z + Math.sin(a) * d;
                if (!r._landAt(x, z)) ok = false;
            }
            if (ok) richtung = a;
        }
        if (richtung === null) return { fehler: "kein Land in 45–95 m um den Spieler" };
        const ux = Math.cos(richtung),
            uz = Math.sin(richtung);
        kamera(ux, uz);
        const zonen = { grobstufe: [45, 50, 55, 60], kapsel: [70, 77, 84, 90] };
        const tiere = [];
        for (const [zone, ds] of Object.entries(zonen))
            ds.forEach((d, k) => {
                const o = (k % 2 ? 1 : -1) * 3;
                const x = P0.x + ux * d - uz * o,
                    z = P0.z + uz * d + ux * o;
                const c = tier({ x, y: r.getTerrainHeightAt(x, z) + 0.3, z }, "wesen", 1);
                ruhig(c);
                r.assignCreatureTask(c, "follow_player", {}, { silent: true });
                tiere.push({ c, zone, spur: [], lage: null });
            });
        const BEINE = ["legFL", "legFR", "legHL", "legHR"];
        // der sichtbare Leib: der Satz seiner Gestalt (Phase × Gewicht seiner Instanz im Wurf, der jedes Satz-Tier trägt —
        // `_tickTierSatz`), die Grobstufe (die Gelenke ihrer Haut) oder die feine Stufe
        const imSatz = (c) => {
            const p = satzPlatz(c, "wurf");
            const a = p && p.m.geometry.attributes.aGang;
            return p ? BEINE.map(() => (a.getX(p.i) % 1) * a.getY(p.i) * TAU) : null;
        };
        const sichtbar = (c) => {
            if (c.userData._satz) return { fern: true, beine: imSatz(c) };
            const tb = c.userData._tierBaum;
            const gl = c.userData._gelenk;
            if (!tb || !gl) return { fern: false, beine: null };
            if (gl.fern.visible && !gl.nah.visible) {
                let haut = null;
                gl.fern.traverse((o) => {
                    if (!haut && o.isSkinnedMesh && o.skeleton && o.userData && o.userData.__skinJoints) haut = o;
                });
                if (!haut) return { fern: true, beine: null };
                const B = {};
                for (const b of haut.skeleton.bones) B[b.name] = b;
                return { fern: true, beine: BEINE.map((n) => (B[n] ? B[n].rotation.x : 0)) };
            }
            const Tt = tb.teile;
            return { fern: false, beine: Tt ? BEINE.map((n) => (Tt[n] ? Tt[n].rotation.x : 0)) : null };
        };
        const z = {
            grobstufe: { lauf: 0, gleit: 0, fernBild: 0 },
            kapsel: { lauf: 0, gleit: 0, fernBild: 0 },
        };
        const dt = 1 / 60;
        for (let k = 0; k < 420; k++) {
            pm.copy(P0);
            takt(dt);
            r._ruheImBild(); // der Blick des Bilds schreibt den Satz (`_tierSatzImBild`)
            for (const t of tiere) {
                const c = t.c;
                const p = { x: c.position.x, z: c.position.z };
                const sb = sichtbar(c);
                const b = sb.beine;
                if (t.warFern !== sb.fern) t.spur.length = 0; // der Wechsel feine Stufe ↔ Grobstufe beginnt eine neue Spur
                t.warFern = sb.fern;
                t.spur.push(b);
                if (t.spur.length > 24) t.spur.shift();
                const v = t.lage ? ab(p, t.lage) / dt : 0;
                t.lage = p;
                if (k < 60 || v < 0.3) continue;
                const Z = z[t.zone];
                Z.lauf++;
                if (sb.fern) Z.fernBild++;
                if (!b) {
                    Z.gleit++; // ein Standbild ohne Gelenke
                    continue;
                }
                if (t.spur.length < 24) continue;
                let spanne = 0;
                for (let j = 0; j < 4; j++) {
                    let mn = Infinity,
                        mx = -Infinity;
                    for (const w of t.spur) {
                        if (!w) continue;
                        mn = Math.min(mn, w[j]);
                        mx = Math.max(mx, w[j]);
                    }
                    spanne = Math.max(spanne, mx - mn);
                }
                if (spanne < 0.02) Z.gleit++;
            }
        }
        const aus2 = {};
        for (const [zone, Z] of Object.entries(z))
            aus2[zone] = {
                laufTakte: Z.lauf,
                gleitTakte: Z.gleit,
                gleitAnteil: Z.lauf ? rund(Z.gleit / Z.lauf, 3) : null,
                fernBild: Z.fernBild,
            };
        aus2.abstandM = tiere.map((t) => rund(ab(t.c.position, P0), 1));
        return aus2;
    });

    // DIE GESTALT AUS DER RUHE: die Treffer-Kapseln einer Gattung (_kreaturTrefferGlieder) sind EINE Passung — zwei Wölfe,
    // der zweite größer und gedreht, beide mitten im Schritt: jede Kapsel bit-gleich, die laufende Pose danach unverändert.
    // DER VORRAT (dorf-takt-z13, Lehre 14): der Ofen-Vorrat legt die Glieder jeder Gattung des Lebensraums, und eine kalte
    // Gattung zerlegt ihre Gestalt nie im Takt — Kreatur-Takt und Ziegel des fernen Leibs lesen sie kalt (der Leib trägt seinen
    // Satz, der Ruf zählt), erst der Leerlauf baut sie; der Treffer bricht kalt laut (gate:kampf-gefuehl T11).
    await buehne("gestalt", async (restore) => {
        const altK = r._gliedKapseln,
            altN = r._trefferGliedNamen;
        restore.push(() => {
            r._gliedKapseln = altK;
            r._trefferGliedNamen = altN;
        });
        if (taeter === "gestalt-vorrat") decke("_gliederBestellen", () => () => Promise.resolve(null));
        r._trefferGliedNamen = new Map();
        await r._ofenPrefetchKreaturen();
        const vorrat = Object.keys(r.constructor._lebensraumGesetz().L.gattung).filter(
            (g) => !r._trefferGliedNamen.has(g)
        );
        // der Täter: der Leser zerlegt selbst (der Bau der Glieder im Takt, bis dorf-takt-z13)
        if (taeter === "gestalt-takt") decke("_gattungGlieder", () => (cr) => r._gattungGliederBacken(cr));
        let zerlegt = 0;
        decke("_kreaturGliederGruppen", (f) => (cr) => (zerlegt++, f.call(r, cr)));
        if (taeter === "gestalt")
            decke(
                "_gestaltRuhe",
                () =>
                    function () {
                        // der Täter: die Passung im laufenden Rahmen des Tiers (Lage, Pose, Größe des ersten)
                        return (n) => (n.updateWorldMatrix(true, false), n.matrixWorld);
                    }
            );
        const passung = async (dx, dz, groesse, pose) => {
            r._gliedKapseln = new Map();
            r._trefferGliedNamen = new Map();
            const o = frei(dx, dz, 6) || land(dx, dz);
            const c = tier({ x: o.x, y: o.y, z: o.z }, "wolf", groesse);
            c.rotation.y = pose * 1.3;
            const T = c.userData._tierBaum.teile;
            let k = 0;
            for (const nm of Object.keys(T).sort()) {
                T[nm].rotation.x += Math.sin(pose * 7 + k) * 0.4;
                T[nm].rotation.z += Math.cos(pose * 5 + k++) * 0.3;
            }
            c.updateMatrixWorld(true);
            const lage = () =>
                Object.keys(T)
                    .sort()
                    .map((nm) => T[nm].quaternion.toArray().join() + T[nm].matrixWorld.elements.join())
                    .join("|");
            const [z0, k0] = [zerlegt, r._gliederKalt | 0];
            takt(1 / 60);
            r._kzLeib(c, { x: c.position.x + 500, z: c.position.z });
            const takt0 = {
                zerlegt: zerlegt - z0,
                satz: c.visible && !c.userData._kzVersuch,
                ruf: (r._gliederKalt | 0) - k0,
            };
            const vorher = lage();
            await r._gliederBestellen(c);
            const gl = r._kreaturTrefferGlieder(c);
            const nachher = lage();
            const kaps = new Map();
            for (const [key, kp] of r._gliedKapseln)
                if (kp) kaps.set(key, [kp.a.x, kp.a.y, kp.a.z, kp.b.x, kp.b.y, kp.b.z, kp.r]);
            r.removeCreature(c);
            return { kaps, n: gl ? gl.length : 0, gehalten: vorher === nachher, takt0 };
        };
        const A = await passung(30, 30, 1, 0);
        const B = await passung(-40, 60, 1.3, 1);
        let maxAbw = 0,
            glied = null;
        const fehlt = [];
        for (const [key, a] of A.kaps) {
            const b = B.kaps.get(key);
            if (!b) {
                fehlt.push(key);
                continue;
            }
            for (let i = 0; i < a.length; i++) {
                const d = Math.abs(a[i] - b[i]);
                if (d > maxAbw) {
                    maxAbw = d;
                    glied = key;
                }
            }
        }
        for (const key of B.kaps.keys()) if (!A.kaps.has(key)) fehlt.push(key);
        return {
            glieder: A.n,
            kapseln: A.kaps.size,
            fehlt,
            maxAbw,
            glied,
            gehalten: A.gehalten && B.gehalten,
            vorrat,
            takt: A.takt0,
        };
    });

    // DIE TOD-LAGE IM LEERLAUF (dorf-takt-z13, Lehre 14): der Tod eines Wolfs liest keine Karte, der Leib steht im Vorlauf
    // (`TOD_LAGE.vorlaufSec`), der Leerlauf rechnet die Tafel (`_todLageTick`), ein Fenster ohne Zeit genau einen Winkel; ohne
    // Leerlauf rechnet die Frist sie am Ende des Vorlaufs (`_todLageFrist`, halten.K5 — die Lage bei 60 und 15 Hz misst Q13).
    await buehne("todlage", async () => {
        if (taeter === "todlage-takt")
            decke("_kreaturFaellt", (f) => (c) => (f.call(r, c), r._todLageTick({ timeRemaining: () => Infinity })));
        let n = 0;
        decke(
            "_standSicht",
            (f) =>
                (...a) => (n++, f.apply(r, a))
        );
        const c = tier(frei(20, -20, 6) || land(20, -20), "wolf");
        for (let k = 0; k < 20; k++) takt(1 / 30);
        n = 0;
        r.damageCreature(c, 1e9, {});
        const d = c.userData.dying;
        const z = { imTod: n, fenster: 0, soll: A.TOD_KIPP_STUETZ + 1 };
        for (let k = 0; k < 5; k++) takt(1 / 30);
        z.steht = d.fall === 0 && d.hebe === undefined;
        for (; d.hebe === undefined && z.fenster < 99; z.fenster++) r._todLageTick({ timeRemaining: () => 0 });
        z.tafel = d.hebe ? d.hebe.length : 0;
        r.removeCreature(c);
        return z;
    });

    // ═══ DAS START-DORF der Bewohner-Proben (bewohner · begegnung): der Takt des Spiels, das Warten unter Deckel, die Uhr auf
    // ihrer Stunde, die stehende Welt — und das Dorf am Genesis-Ort, das der Wirt baut (`__anazhAutoSettlement`) ═══
    const wer = (b) => `${b.rolle}/${b.beruf} #${b.heim}`; // der Bewohner beim Namen
    const angekommen = (S) => () => !!S.liste && S.liste.every((b) => b.leib && !b.ankunft); // jeder trägt seinen Leib, kam an
    // der Takt des Spiels — bis die Siedlung steht (`offen` nicht mehr)
    const tick = () => {
        try {
            r._gameLoopTick(performance.now());
        } catch {
            /* der Takt meldet selbst */
        }
    };
    // DAS WERK DER LEUTE OHNE ZEIT (`_bewohnerWerkTakt(Infinity)` und `_tickBewohner(0)`, wie die Ankunft in `uhrAuf`): mit Bild rechnet
    // ein Takt die Liste unter der EINEN Frist der Bau-Arbeit, zwei Geburten, acht Ankünfte — das Budget eines Bilds (Lehre 14). Wer auf die Leute wartet,
    // ruft ihn, bis ihr Werk (`_weltOffen().leute`) fünf Takte nicht fällt: dann wartet es auf den Faden (die Vorlagen der
    // Gestalten). Bis w4-stationen-schnell-a trug jedes Warten EINEN Takt der Bewohner je Bild und 16 ms Schlaf: an der Karte
    // ging die Liste des Start-Dorfs über Hunderte Bilder, nach jeder Abwesenheit neu (die Wiederkehr: 16 Prüf-Stunden)
    // DER TAKT DER LEUTE wie im Spiel: erst ihr Werk (der Job `bewohner` des Planers, hier ohne Ende — die Liste und, nach einem
    // Wechsel der Wache, die Prüfung ihrer Stände, `_bewohnerWacheTakt`), dann die Leute. Bis w25-stadt-takt-3 prüfte die Wache
    // im Takt der Leute selbst; ein Takt ohne das Werk ließe ihre Stände ungeprüft
    // OFFEN (Welle SAMEN, benannt in ihrer Abgabe): der Takt der Leute geht ohne den Verkehr (`_verkehrSchritt`, `_tickVerkehr`) —
    // mit ihm zeigt bewohner 72 978 Takte „in einer Wand“ (die Fahrer am Steuer im Leib ihres Wagens), die Soll-Orte der Fahrer
    // #952 und #617311 zu 48–53 % und 4 Berührungen (#731592 um 8,34 Uhr, #619833 um 8,47 Uhr): die Linse der Leute kennt den
    // fahrenden Wagen noch nicht. Die begegnung trägt ihn schon (`menschBuehnen`: ihr Zeuge quert eine Fahrbahn)
    const leute = (dt) => (r._bewohnerWerkTakt(Infinity), r._tickBewohner(dt));
    const leuteTakt = () => {
        for (let n = Infinity, still = 0, m; still < 5 && (m = (leute(0), r._weltOffen().leute)); n = m)
            still = m < n ? 0 : still + 1;
    };
    // Takt um Takt des Spiels, bis die Siedlung steht: je Takt das Bild, dann das Werk der Leute; der Schlaf gibt dem Faden das
    // Wort (das Warten zählt der Deckel in Takten ohne Offenes, nie in Sekunden)
    const bisDa = async (name, offen, max) => {
        for (const weiter = __deckel(name, max); weiter() && offen(); await sleep()) (tick(), leuteTakt());
    };
    // DIE UHR AUF DER STUNDE h, nie an der Uhr des Boots: ihr Sprung stellt jeden dorthin, wo sein Tag ihn um h sieht
    // (`_bewohnerAnkunft`, je Takt `ankunftJeTakt`) — gewiss über die Gegen-Stunde h + 12 (stünde die Uhr näher als `sprungH` an
    // h, spränge sie nie), im Takt der Bewohner OHNE ZEIT (`_tickBewohner(0)`): die Uhr steht auf h, keiner geht, ehe der
    // Letzte ankam (`da`), und die Prüfpunkte des Tags treffen in jedem Lauf dieselben Wenden; mit Bild backt danach der Takt
    // des Spiels die Felder der Leiber, und die Uhr springt noch einmal. Bis heil-wackler trug der Takt an der Wanduhr die
    // Ankunft (10 von 10 Starts in anderer Lage, #809070 und #724672 berührten sich um 12,50 Uhr; CI 40967599389, 40970312506),
    // und kam die Uhr des Boots unter Last bis auf sprungH an 12,5, sprang sie nicht: der Tag begann mit 11,5–13,8 s Takt der
    // Bewohner, #724672 steckte um 12,62 Uhr (1 von 6 Läufen)
    const uhrAuf = async (h, wo, da, max) => {
        for (const backen of [true, false]) {
            for (const t of [h + 12, h]) (r._uhrSetzen((t % 24) / 24, "regler"), leute(0));
            for (const weiter = __deckel(wo, max, false); weiter() && !da();) leute(0);
            if (backen) await bisDa(wo, () => r._weltOffen().leiber > 0, max);
        }
    };
    // DER TAG BEGINNT IN DER STEHENDEN WELT (welt-boot `__weltStehtNach`, der Takt des Spiels): er rechnet synchron, ohne
    // Loop — seine Welt ist, was bis zu seinem Anfang um den Ort wuchs; wüchsen Wald oder Streu noch (die Streu im Faden
    // landet Takte später), mäße jeder Lauf einen anderen Tag. Der Deckel zählt Takte ohne Offenes und wirft beim Ort.
    const stehtUm = (wo) =>
        __weltStehtNach(tick, 600).catch((f) => {
            throw new Error(`${wo}: ${f.message}`);
        });
    // DER SPIELER AM RAND DES PLATZES, frei von Grundrissen (Lehre 17: Achsen-Enden, Seiten, Diagonalen) — im Start-Dorf und
    // in der Stadt; die Mitte des Platzes und die Richtung des Stands zu ihr. DAS AUGE HINTER DEM SPIELER STEHT IM FREIEN
    // (w28-stadt-grammatik): das Third-Auge der Zählung (`blickZaehlen`: THIRD_M hinter dem Stand, vom Platz weg) liegt nie in
    // einem Grundriss — bis hier prüfte die Wahl nur den Stand, und am Markt der Stadt-Grammatik stand das Auge des ersten
    // freien Stands im Pfarrhaus: jeder Strahl brach an dessen Wand, „Dorfplatz 10 Uhr im Blick: 21 Ego / 0 Third“ (z397).
    // Die Kamera des Spiels steht nie in einem Haus (ihr Arm weicht der Wand); ein Stand, dessen Auge es täte, zählt nichts.
    const THIRD_M = 4.5;
    const amPlatz = (ox, oz, pz) => {
        const pc = { x: ox + pz.cx, z: oz + pz.cz };
        const lang = pz.ex >= pz.ez ? 0 : Math.PI / 2;
        for (const k of [0, 4, 2, -2, 1, 3, -1, -3])
            for (const plus of [2, 5, 9]) {
                const da = (k * Math.PI) / 4;
                const a = (pz.phi || 0) + lang + da;
                const ex = Math.abs(Math.cos(da)) * pz.ex + Math.abs(Math.sin(da)) * pz.ez + plus;
                const [x, z] = [pc.x - Math.cos(a) * ex, pc.z + Math.sin(a) * ex];
                const g = r._imGrundriss(x, z, 0.5);
                if (g === "haus" || g === "bau" || !r._landAt(x, z)) continue;
                const l = ab(pc, { x, z }) || 1;
                const [ax, az] = [(pc.x - x) / l, (pc.z - z) / l];
                const ga = r._imGrundriss(x - ax * THIRD_M, z - az * THIRD_M, 0);
                if (ga === "haus" || ga === "bau") continue;
                const h = r.getTerrainHeightAt(x, z);
                pm.set(x, (Number.isFinite(h) ? h : pm.y) + A.PLAYER_FOOT_OFFSET, z);
                return { pc, ax, az };
            }
        return null;
    };
    // DIE STADT AM MESSORT `ort` (spec/profiband/haushalt.json, `gruendung`): das Wort des Spielers „dorf <Same> <nH>" an ihrem
    // Anker (stadt 30 Häuser, sonst 300), der Spieler am Rand ihres Platzes (die volle Stadt: an ihrem Ursprung am Markt), bis
    // jeder Bewohner seinen Leib trägt, in der stehenden Welt. Leser: die Proben bewohner (`stadtTag`) und zielplan.
    const stadtAm = async (ort, wo) => {
        // die Stadt eines anderen Messorts steht in dieser Welt (`STADT_ORT`: der Lauf wechselt die Welt mit dem Messort) — ROT
        // beim Namen, nie eine zweite Stadt in ihrem Grundriss
        if (window.__stadtVon && window.__stadtVon !== ort)
            return { fehler: `${wo}: die Stadt von ${window.__stadtVon} steht in dieser Welt — ${ort} lief ohne frische Welt` };
        window.__stadtVon = ort;
        const voll = ort !== "stadt";
        const orte = (await (await fetch("spec/profiband/haushalt.json")).json()).messorte.filter((m) => m.gruendung);
        const o = orte.find((m) => m.id === ort);
        const same = (m) => Number(m.gruendung.wort.split(" ")[1]);
        const [seed, [x, z], nH] = [same(o), o.gruendung.anker, voll ? 300 : 30];
        // die Stadt DIESES Orts: Same gleich und ihr Ursprung näher an seinem Anker als an dem jedes anderen Orts mit demselben
        // Samen (stadt und stadt-voll tragen beide Same 7, 174 m auseinander — ein Kreis von 200 m nahm die Stadt des anderen)
        // (ort-zeichen gründet dieselbe Stadt wie stadt-voll: derselbe Anker ist dieselbe Stadt, nie eine fremde)
        const fremd = orte
            .filter((m) => same(m) === seed && Math.hypot(m.gruendung.anker[0] - x, m.gruendung.anker[1] - z) > 1)
            .map((m) => m.gruendung.anker);
        const S0 = () =>
            [...(r._bewohnerSiedlungen || new Map()).values()]
                .filter((q) => q.plan.seed === seed && Math.hypot(q.ox - x, q.oz - z) < 200)
                .filter((q) => fremd.every(([fx, fz]) => Math.hypot(q.ox - x, q.oz - z) < Math.hypot(q.ox - fx, q.oz - fz)))
                .sort((a, b) => Math.hypot(a.ox - x, a.oz - z) - Math.hypot(b.ox - x, b.oz - z))[0];
        if (!S0()) await r.spawnSettlement({ seed, nH, position: { x, y: 0, z } });
        const S = S0();
        if (!S || !amPlatz(S.ox, S.oz, S.plan.platz))
            return { fehler: `keine Stadt mit freiem Rand am Platz („dorf ${seed} ${nH}" bei ${x}/${z})` };
        if (voll) pm.set(S.ox, r.getTerrainHeightAt(S.ox, S.oz) + A.PLAYER_FOOT_OFFSET, S.oz);
        const da = angekommen(S);
        await bisDa(`${wo}: ${ort}`, () => !da(), 4 * nH);
        await stehtUm(`${wo}: ${ort}`);
        return { S, da, nH, voll };
    };
    // die Siedlung des Start-Dorfs (`_bewohnerMelden`: sein Plan v2 und sein Ursprung) — ohne sie bricht die Probe beim Namen
    const startDorf = async (restore) => {
        const [W, wm] = [window, s.worldMeta];
        dorf.hier = true;
        W.__dorfVon = W.__dorfVon || dorf.probe;
        const altHook = W.__anazhAutoSettlement;
        restore.push(() => (W.__anazhAutoSettlement = altHook));
        W.__anazhAutoSettlement = true;
        if (!wm.settlementCells?.start) r._startDorfBestellen(pm);
        for (
            const weiter = W.__deckel("bewohner: das Start-Dorf", 200, () => !!r._autoSettlementPendingKey);
            weiter() && (r._autoSettlementPendingKey || !wm.settlementCells?.start);
        )
            await sleep(50);
        for (let n = 0; r._autoSettlementQueue && n < 2000; n++) {
            r._tickAutoSettlement(pm);
            await sleep(0);
        }
        const S = (r._bewohnerSiedlungen || new Map()).get("start");
        if (!S) throw new Error("das Start-Dorf entstand nicht (kein Dorf-Zug am Genesis-Ort)");
        return S;
    };
    /* MENSCH_BUEHNEN */

    // ── tiersatz (profiband.K1 „Sturm mit 50 Tieren“): 10 und 50 Tiere im Nah-Kreis — die Befehle der Tiere hängen nie an
    // der Kopfzahl; wer nicht als Leib lebt, geht im Satz seiner Gattung (dass er dort nicht gleitet und die Gangart des Leibs
    // geht, misst gate:tier-gang je Gattung und Tempo am Knoten des Satzes).
    await buehne("tiersatz", async (restore) => {
        const SM = A.TETRAPODA_SOUL_MAP;
        const seelen = ["wolf", "fox", "bear", "deer"].map((g) => Object.keys(SM).find((k) => SM[k] === g));
        const sichtbar = (o) => {
            for (let x = o; x; x = x.parent) if (!x.visible) return false;
            return true;
        };
        const saetze = () => s.scene.children.filter((o) => o?.isInstancedMesh && o.userData.inventar === "tier");
        const befehle = () => {
            let haupt = 0,
                wurf = 0,
                leiber = 0,
                satz = 0,
                satzW = 0;
            // je Gestalt (Seele) die Befehle ihres Leibs: welche Gattung als Leib nah steht, wählt die Lage der Herde, nie die
            // Kopfzahl (seit H1 zieht jedes Glied zum Ziel seines Leittiers — die nächsten vier sind 3 Wölfe + 1 Fuchs statt 2 + 2)
            const jeSeele = {};
            for (const c of s.creatures) {
                let n = 0;
                // die Strähnen und Schalen des Fells schaltet das Fell-Gesetz am Schirm (`_fellBildschirmGesetz`) je Tier, nie die
                // Kopfzahl: sie zählen nicht (an der Ankunft des Plans trug ein Wolf 26 m fern keine Strähne: 10 Tiere 31 Leib-Befehle,
                // 50 Tiere 32 — dieselbe Gestalt)
                c.traverse((o) => {
                    if (!o.isMesh || !sichtbar(o) || /^straehne|^fellSchale$/.test(o.userData.__klasse)) return;
                    if (o.layers.mask & 1) (haupt++, n++);
                    if (o.castShadow) wurf++;
                });
                if (n > 0) (leiber++, (jeSeele[c.userData.soul] = Math.max(jeSeele[c.userData.soul] || 0, n)));
            }
            for (const o of saetze())
                if (o.count > 0 && o.visible) {
                    if (o.layers.mask & 1) (haupt++, satz++);
                    if (o.castShadow) (wurf++, satzW++);
                }
            return { haupt, wurf, leiber, satz, satzW, jeSeele };
        };
        // Täter (Selbsttest): die Menge als Leib (keine Satz-Wahl)
        if (taeter === "tiersatz-kopf") decke("_tierSatzWahl", () => () => null);
        // · das Auge trägt jedes Satz-Tier (kein Blick) · der Takt schreibt jeden Platz, ob sich etwas rührte oder nicht
        if (taeter === "tiersatz-blick") decke("_kreaturAusserBlick", () => () => false);
        if (taeter === "tiersatz-schreiben") decke("_tierSatzStempel", () => () => true);
        // · die Sicht-Kopien der Mitspieler stehen nicht in der Menge des Satzes (jede Kopie ein Leib)
        if (taeter === "tiersatz-kopie")
            decke(
                "_tickTierSatz",
                (alt) =>
                    function (...a) {
                        const k = s.p2p.remoteCreatures;
                        s.p2p.remoteCreatures = new Map();
                        try {
                            return alt.apply(this, a);
                        } finally {
                            s.p2p.remoteCreatures = k;
                        }
                    }
            );
        const ring = (n, rMin, rMax, saat, seite = 0) => {
            let k = 0;
            for (let i = 0; i < 400 && k < n; i++) {
                const w = ((saat + i) * 2.39996) % TAU,
                    d = rMin + (rMax - rMin) * (((saat + i) * 0.618034) % 1);
                // vorn: ±32° im Blick nach +x · hinten: außer ihm
                if ((seite > 0 && Math.cos(w) < 0.85) || (seite < 0 && Math.cos(w) > 0)) continue;
                const o = land(Math.cos(w) * d, Math.sin(w) * d);
                if (ab(o, P0) < rMin - 1) continue;
                tier(o, seelen[s.creatures.length % 4], 1);
                k++;
            }
        };
        // der Takt samt dem Blick des Bilds (`_ruheImBild`, im Render-Pfad): dort schreibt das Auge des Satzes
        const bildTakt = (dt) => {
            takt(dt);
            r._ruheImBild();
        };
        const laufen = (n) => {
            for (let i = 0; i < n; i++) bildTakt(1 / 60);
        };
        // die 40 dazu hinter den ersten 10 (30–55 m): die Leiber der 50 sind die Tiere der 10 — mischten sie sich unter sie,
        // trügen andere Gattungen den Leib (Fuchs 6, Wolf 7 Befehle ohne Fell), und ihre Gestalt zählte als Kopfzahl
        // DER BLICK STEHT (w28-bau-rezept-tuer): die Nah-Wahl fragt das Bild (`_bedeutung`: außer Bild folgt jedes Tier jedem im
        // Bild) — der Blick nach +x von Anfang an, die 10 tief in ihm (±32°, das halbe Bildfeld 45,7°: wer wandert, bleibt darin),
        // die 40 hinter ihm: so bleiben die Leiber der 50 die der 10. Bis hier stand der Blick, wo die Bühne davor ihn ließ, und
        // ein fernes der 40 im Bild trüge den Leib vor einem der 10 außer Bild
        kamera(1, 0);
        ring(10, 15, 30, 1, 1);
        laufen(240);
        const zehn = new Set(s.creatures);
        ring(40, 30, 55, 101, -1);
        laufen(240);
        const B50 = befehle();
        // DIE ZEHN ALLEIN IM SELBEN MOMENT (samen-tier-leser 21.11.): die 40 gehen, zwei Takte wählen die Leiber neu, dann zählen
        // die 10 — und die 40 kommen wieder (dieselben Plätze, 240 Takte), für die Proben dahinter. Bis hier zählten die 10 VOR den
        // 40, vier Sekunden früher: mit den Losen des Samen-Baums flohen zwei Füchse der 10 vor den Wölfen unter ihnen (5,8 m/s,
        // 20 → 44 m, dieselben vier Leiber), und am Fell-Gesetz des Schirms (44 m: eine Fell-Senke statt zwei) zählte die Zeit
        // als Kopfzahl: 10 Tiere 33 Befehle, 50 Tiere 31
        for (const c of s.creatures.filter((c) => !zehn.has(c))) r.removeCreature(c);
        bildTakt(0);
        bildTakt(0);
        const B10 = befehle();
        ring(40, 30, 55, 101, -1);
        laufen(240);
        // DIE KOSTEN AN SCHIRM UND ÄNDERUNG (Gebot 7): ein Takt ohne Zeit schreibt nur die Plätze der Satz-Tiere, die sich
        // rührten; im Blick nach +x trägt das Auge jedes Satz-Tier im Frustum (keines fehlt) und nicht alle, der Wurf ebenso.
        const schreibe = A._gangSatzInstanz;
        let schriebe = 0;
        A._gangSatzInstanz = function (...a) {
            schriebe++;
            return schreibe.apply(this, a);
        };
        restore.push(() => (A._gangSatzInstanz = schreibe));
        const lage = (c) => [
            c.position.x,
            c.position.y,
            c.position.z,
            c.quaternion.x,
            c.quaternion.y,
            c.quaternion.z,
            c.quaternion.w,
        ];
        let ruehrte = 0;
        for (let i = 0; i < 4; i++) {
            const vor = new Map(s.creatures.filter((c) => c.userData._satz).map((c) => [c, lage(c)]));
            bildTakt(0);
            for (const [c, a] of vor) if (lage(c).some((x, k) => x !== a[k])) ruehrte++;
        }
        A._gangSatzInstanz = schreibe;
        const ruhe = { schriebe, ruehrte, senken: saetze().length };
        kamera(1, 0);
        laufen(2);
        const imSatz = s.creatures.filter((c) => c.userData._satz);
        const gesehen = imSatz.filter((c) => imBlick(c.position.x, c.position.y, c.position.z));
        const zahlVon = (teil) =>
            saetze()
                .filter((m) => m.userData.teil === teil)
                .reduce((n, m) => n + m.count, 0);
        const blick = {
            satz: imSatz.length,
            imBlick: gesehen.length,
            fehlt: gesehen.filter((c) => !satzPlatz(c, "fell")).length,
            fell: zahlVon("fell"),
            wurf: zahlVon("wurf"),
        };
        // DER PUFFER GEHÖRT DEM SKELETT (Lehre 19): je Gestalt der Gang-Puffer gegen die Ecken ihrer Senken; je Senke die
        // Vertex-Puffer ihrer Pipeline (WebGPU sagt über 8 die Pipeline ab)
        const vertexPuffer = Math.max(
            ...saetze().map(
                (m) =>
                    new Set(
                        Object.values(m.geometry.attributes).map((a) => (a.isInterleavedBufferAttribute ? a.data : a))
                    ).size
            )
        );
        const puffer = saetze()
            .filter((m) => m.userData.teil === "fell")
            .map((m) => ({
                puffer: m.userData.gang.bytes, // der Teil des Satzes auf seiner Seite (`_gangSeite`)
                ecken: [
                    ...new Set(
                        Object.values(m.geometry.attributes)
                            .filter((a) => !a.isInstancedBufferAttribute)
                            .map((a) => (a.isInterleavedBufferAttribute ? a.data.array : a.array))
                    ),
                ].reduce((n, a) => n + a.byteLength, 0),
            }));
        // DIE SICHT-KOPIEN (dieselbe Klasse): 8 Kopien eines Mitspielers im Ring 20–40 m stehen in der Menge — als Leib zeichnen
        // höchstens die `nahLeiber` Nächsten aller Tiere, eigene und Kopien zusammen
        const remote = s.p2p.remoteCreatures;
        restore.push(() => {
            for (const [key, rc] of remote) if (rc.peerId === "linse-satz") r._disposeRemoteCreature(key, rc);
        });
        const kopien = [];
        for (let i = 0; i < 8; i++) {
            const o = land(Math.cos(i * 0.785 + 0.3) * (20 + 2.5 * i), Math.sin(i * 0.785 + 0.3) * (20 + 2.5 * i));
            kopien.push({ id: "k" + i, x: o.x, y: o.y, z: o.z, yaw: 0, b: 1, soul: seelen[i % 4] });
        }
        for (let k = 0; k < 120; k++) {
            r._p2pHandleCreaturePos("linse-satz", { list: kopien });
            r._p2pTickRemoteCreatures(200 + k / 60, 1 / 60);
            bildTakt(1 / 60);
        }
        const kopieLeib = [...remote.values()].filter((rc) => {
            let n = 0;
            rc.mesh.traverse((o) => o.isMesh && sichtbar(o) && o.layers.mask & 1 && n++);
            return rc.peerId === "linse-satz" && n > 0;
        }).length;
        const kopieSatz = [...remote.values()].filter(
            (rc) => rc.peerId === "linse-satz" && rc.mesh.userData._satz
        ).length;
        const eigenLeib = befehle().leiber;
        return {
            kopie: { leib: kopieLeib, satz: kopieSatz, eigenLeib },
            b10: B10,
            b50: B50,
            nahLeiber: A.KREATUR_SATZ ? A.KREATUR_SATZ.nahLeiber : null,
            senken: saetze().length,
            ruhe,
            blick,
            puffer,
            vertexPuffer,
        };
    });

    /* LEBEN_BUEHNEN */
    return aus;
}

// ═══ DAS URTEIL (Node): Zahl → grün/rot mit Grund ═══
const PROBEN = [
    "geister",
    "sattel",
    "reload",
    "huepfer",
    "wachsen",
    "gier",
    "jagd",
    "herde",
    "schwarm",
    "peer",
    "zufall",
    "nexus",
    "temperament",
    "abstand",
    "jagdkreis",
    "mahl",
    "witterung",
    "rudel",
    "querhang",
    "ferngang",
    "gestalt",
    "todlage",
    "tiersatz",
];
function urteil(name, z) {
    if (!z) return { ok: false, grund: "keine Zahl" };
    if (z.fehler) return { ok: false, grund: z.fehler };
    const f = [];
    const soll = (bed, text) => {
        if (!bed) f.push(text);
    };
    if (name === "tiersatz") {
        soll(
            z.b50.leiber === z.b10.leiber &&
                Object.keys(z.b10.jeSeele || {}).every((k) => !(k in z.b50.jeSeele) || z.b50.jeSeele[k] === z.b10.jeSeele[k]) &&
                z.b50.wurf - z.b50.satzW === z.b10.wurf - z.b10.satzW &&
                z.b50.satz + z.b50.satzW <= z.senken,
            `Befehle der Tiere hängen an der Kopfzahl: 10 Tiere ${z.b10.haupt} Bild + ${z.b10.wurf} Wurf (Satz ${z.b10.satz} + ${z.b10.satzW}), 50 Tiere ${z.b50.haupt} + ${z.b50.wurf} (${z.b50.satz} + ${z.b50.satzW}) (Soll: die Leiber gleich, je Senke höchstens ein Befehl — ${z.senken} Senken)`
        );
        soll(
            z.nahLeiber != null && z.b50.leiber <= z.nahLeiber,
            `${z.b50.leiber} von 50 Tieren als Leib gezeichnet (Soll ≤ nahLeiber ${z.nahLeiber})`
        );
        const Rh = z.ruhe;
        soll(
            Rh.schriebe <= Rh.ruehrte * 4,
            `der Satz schreibt ohne Änderung: 4 Takte ohne Zeit schrieben ${Rh.schriebe} Instanzen, ${Rh.ruehrte}× rührte sich ein Satz-Tier (Soll ≤ 4 je Rühren)`
        );
        const B = z.blick;
        soll(
            B.satz >= 10 && B.fell < B.satz && B.fell <= B.wurf && B.wurf < B.satz,
            `das Auge zeichnet den Satz außer Blick: ${B.fell} Fell-Instanzen bei ${B.imBlick} von ${B.satz} Satz-Tieren im Blick, Wurf ${B.wurf} (Soll Auge ≤ Wurf < alle)`
        );
        soll(B.fehlt === 0, `dem Auge fehlen ${B.fehlt} von ${B.imBlick} Satz-Tieren im Blick (Soll 0)`);
        const Kp = z.kopie;
        soll(
            Kp.satz >= 4 && Kp.leib + Kp.eigenLeib <= z.nahLeiber,
            `die Sicht-Kopien zeichnen als Leib: ${Kp.leib} von 8 Kopien als Leib, ${Kp.satz} im Satz, dazu ${Kp.eigenLeib} eigene Leiber (Soll ≥ 4 im Satz, Leiber zusammen ≤ nahLeiber ${z.nahLeiber})`
        );
        const P = z.puffer || [];
        soll(
            P.length > 0 && P.every((p) => p.puffer <= p.ecken) && z.vertexPuffer <= 8,
            `der Gang-Puffer gehört den Ecken: ${P.map((p) => Math.round(p.puffer / 1024) + " KB gegen " + Math.round(p.ecken / 1024) + " KB Ecken").join(" · ")} ; Vertex-Puffer je Senke höchstens ${z.vertexPuffer} (Soll je Gestalt ≤ die Ecken ihrer Senke, ≤ 8 Vertex-Puffer)`
        );
        return { ok: !f.length, grund: f.join(" · ") };
    }
    MENSCH.urteil(name, z, soll);
    if (name === "geister") soll(z.geister === 0, `${z.geister} Geister nach clearCreatures (aus ${z.vorher})`);
    if (name === "sattel") {
        soll(z.aufgestiegen === true, "nicht aufgestiegen (Probe vakuös)");
        soll(z.nachTod === null, `nach dem Tod im Sattel: mountedArch ${z.nachTod}`);
    }
    if (name === "huepfer") {
        soll(z.luftAnteil < 0.03, `Luft-Anteil ${(z.luftAnteil * 100).toFixed(1)} % (Soll < 3 %)`);
        soll(z.starts > 0, "kein Sprung (die Aktionen hüpfen nicht — Probe vakuös)");
        soll(z.ausAktion === z.starts, `${z.starts - z.ausAktion} von ${z.starts} Sprüngen ohne Aktion`);
        soll(
            z.rufe === z.starts,
            `${z.starts - z.rufe} von ${z.starts} Sprüngen am Sprung-Gesetz vorbei (creatureJump startete ${z.rufe})`
        );
        soll(
            z.gesetzFehler !== null && z.gesetzFehler < 0.03,
            `Scheitel ${((z.gesetzFehler || 0) * 100).toFixed(1)} % neben dem Sprung-Gesetz (freude.hopHochM ${z.hopHochM} / hopBasisM ${z.hopBasisM} m)`
        );
        soll(
            z.flugVerhaeltnis !== null && Math.abs(z.flugVerhaeltnis - 1) < 0.05,
            `Flugzeit 144 Hz / 30 Hz = ${z.flugVerhaeltnis} (Soll 1)`
        );
        soll(
            z.frohFehler < 0.03,
            `der frohe Sprung steigt ${z.flug30.top} m (Sprung-Gesetz freude.hopHochM ${z.hopHochM} m)`
        );
        soll(
            z.basisFehler < 0.03,
            `der Grund-Sprung steigt ${z.basisTop} m (Sprung-Gesetz freude.hopBasisM ${z.hopBasisM} m)`
        );
    }
    if (name === "wachsen") soll(Math.abs(z.skala - 1) < 0.001, `Skala nach 3600 Takten ×${z.skala}`);
    if (name === "gier") {
        for (const art of Object.keys(z)) {
            const a = z[art];
            soll(a.laufFrames > 300, `${art}: nur ${a.laufFrames} Lauf-Frames`);
            soll(a.abwP90 !== null && a.abwP90 <= 20, `${art}: Lauf ↔ Blick p90 ${a.abwP90}° (Soll ≤ 20°)`);
            soll(a.rueckwaerts === 0, `${art}: ${(a.rueckwaerts * 100).toFixed(1)} % rückwärts`);
            soll(
                a.schlupfQuer !== null && a.schlupfQuer <= 0.2,
                `${art}: Stand-Schlupf quer ${a.schlupfQuer} (Soll ≤ 0,2; längs ${a.schlupfLaengs})`
            );
            soll(a.beschlMax <= 12, `${art}: Tempo-Sprung ${a.beschlMax} m/s² (Soll ≤ 12)`);
            soll(
                a.gasBremseJeMin !== null && a.gasBremseJeMin <= 30,
                `${art}: Folgen als Gas ↔ Bremse ${a.gasBremseJeMin} Wechsel je Minute (Soll ≤ 30, das Ankunfts-Gesetz)`
            );
        }
    }
    if (name === "jagd") {
        // der Jäger hetzt im Sprint der Gestalt (der Schritt-Weg holt ein ruhiges Kitz auch ein, er hetzt nie); ohne Hetze
        // ist die Probe zudem vakuös
        soll(z.hetzFrames >= 60, `die Jagd hetzt nie: ${z.hetzFrames} von ${z.jagdFrames} Jagd-Frames`);
        soll(
            z.achsAnteil !== null && z.achsAnteil < 0.1,
            `Jagd auf den Achsen (0,25°, der Lauf neben der Peilung des Ziels) ${(z.achsAnteil * 100).toFixed(1)} %`
        );
        const R = z.riss;
        soll(R.nah >= 1, "die Jagd reißt im Nah-Kreis nie (an drei Orten je 180 s, vakuös)");
        soll(
            R.mitJaeger === R.nah,
            `Riss ohne Jäger im Nah-Kreis: ${R.nah - R.mitJaeger} von ${R.nah} ohne ein Maul am Leib`
        );
        soll(
            R.risse >= 1 && R.gefallen === R.risse,
            `der Riss geht im Übergang verloren: ${R.risse - R.gefallen} von ${R.risse} Rissen im Nah-Kreis — ${R.amTod} standen nach ihrem Tod noch im Bestand ihrer Art (das Tier verlässt ihn mit seinem Leib: _bestandAus), ${R.risse - R.gefallen - R.amTod} erst nach dem Übergang wieder`
        );
        soll(
            R.da >= 1,
            `der Bestand liest die Kitze nicht: ${R.da} von ${R.lebend} lebenden nach dem Übergang in ihm (das Gesetz nimmt manche, Soll ≥ 1 — sonst ist der Riss oben vakuös)`
        );
    }
    if (name === "herde") {
        soll(z.blickDiffM < 1e-6, `Bewegung hängt am Blick: ${z.blickDiffM} m Unterschied`);
        // höchstens ein Nachzügler je fünf Glieder; Φ über die Takte, in denen die Herde flieht und ≥ 3 Glieder laufen; die
        // Kette trägt erst, wenn ein Glied aus zweiter Hand flieht
        const { wander: W, flucht: F, fensterRaum: FR } = z.verband;
        const { ausrichtung: R, alarm: K } = z;
        soll(
            Math.min(W.n, F.n, z.fremdN, ...z.id.fluchtS) >= 3 &&
                F.fluchtAnteil >= 0.1 &&
                W.fluchtAnteil === 0 &&
                K.zweiteHand >= 1,
            `Probe vakuös: Glieder ${W.n} / ${F.n} / fremd ${z.fremdN}, in Flucht ${F.fluchtAnteil} (Soll ≥ 0,1), wandernd ${W.fluchtAnteil} (Soll 0), aus zweiter Hand ${K.zweiteHand}, neben dem fremden ${z.id.fluchtS} s`
        );
        soll(
            W.mittel >= 0.9,
            `Verband zerfällt beim Wandern: im Mittel ${W.mittel} der ${W.n} Glieder binnen ${FR} Paar-Räumen vom Mittel von 10 bis 120 s (Soll ≥ 0,9; Wurf ${W.wurfAnteil})`
        );
        // DAS EINE REVIER DES VERBANDS: ein Revier je Glied (Täter herde-revier) zeigt sich auf einem von zwei Wegen — der Verband
        // zerfällt (oben), oder sein Zug hält jedes Glied gespannt fern seines Ankers (es zeigt „ziehen“ und steht). Die Probe sah
        // nur den ersten, und welcher Weg fällt, entscheiden die Leib-Größen: am Kopf d0104e7e hielt der Verband unter dem Täter
        // 0,794, mit den Größen aus der Los-Nummer (Tier-Leser, Welle SAMEN) 1,0 — jedes Glied 1,3–3,4 Leinen vor seinem Anker, die
        // Anker 30–50 m auseinander; gesund ≤ 0,6 Leinen (headless, 20.11.). Beide Wege zusammen lassen dem Täter keinen dritten.
        const L = W.leine || {};
        soll(
            L.jenseits <= 0.1,
            `Verband ohne gemeinsames Revier: ${Math.round(L.jenseits * 100)} % der Glied-Bilder von 10 bis 120 s jenseits der Leine ihres Ankers (Soll ≤ 10 %; bis ${L.max} Leinen, die Anker bis ${W.anker} m auseinander)`
        );
        soll(
            F.fluchtMittel !== null && F.fluchtMittel >= 0.8,
            `Verband zerfällt auf der Flucht: im Mittel ${F.fluchtMittel} der ${F.n} Glieder binnen ${FR} Paar-Räumen vom Mittel, solange die Herde flieht (Soll ≥ 0,8; am wenigsten ${F.fluchtMin}, Wurf ${F.wurfAnteil})`
        );
        // die Enge (Herde am Hang: EIN Pulk aus Leibern, nie ein Leib) — das engste Paar in Paar-Räumen, im Mittel ab 10 s; gemessen
        // 1,02 wandernd und 0,86 auf der Flucht (headless, 27.10.)
        const E = W.engst[0] < F.engst[0] ? W.engst : F.engst;
        soll(
            Math.min(W.enge, F.enge) >= 0.5,
            `Verband klumpt: das engste Paar ${W.enge} / ${F.enge} Paar-Räume (Soll ≥ 0,5), ${E[1]} und ${E[2]} auf ${E[0]} nach ${E[3]} s`
        );
        soll(R.takte >= 60 && R.mittel >= 0.8, `Verband flieht ungerichtet: Φ ${R.mittel} über ${R.takte} Takte`);
        soll(
            K.letzterS <= 1 && K.letzterS !== null,
            `Alarm-Kette reißt: der letzte von ${K.laufen} Flüchtern läuft ${K.letzterS} s nach dem ersten`
        );
        soll(z.fluchtWegM >= 30, `Fluchtweg ${z.fluchtWegM} m`);
        const I = z.id.bruch || [];
        soll(!I.length, `Verbands-ID bricht nach ${I[0]} s: Verband ${I[1]} liest ${I[2]} Leiber`);
        soll(!z.dorf[1], `Geburt im Reich des kommenden Orts ${z.dorf[0]}: ${z.dorf[1]} von 8 Orten tragen sie`);
    }
    if (name === "schwarm") {
        const [F, Ld] = [z.flucht || {}, z.landung || {}];
        soll(z.glieder >= 60 && z.takte >= 3000, `Probe vakuös: ${z.glieder} Glieder, ${z.takte} Takte`);
        soll(z.zuegeJeGlied >= 0.99, `Schwarm ohne Verband: ${z.zuegeJeGlied} Züge je Glied und Takt (Soll 1)`);
        soll(z.phi >= 0.8, `Schwarm fliegt ungerichtet: Φ ${z.phi} (Soll ≥ 0,8)`);
        soll(
            z.kohaesion >= 0.9,
            `Schwarm zerfällt: ${z.kohaesion} im größten Verbund, Glied zu Glied ≤ ${z.fensterM} m (Soll ≥ 0,9; min ${z.kohaesionMin})`
        );
        // Staffel 2: die Flucht als EIN Pulk, die Landung auf dem Scheitel der Krone
        soll(
            F.ausloesS != null,
            `Leittier ohne Ereignis: der Pulk flieht nie vor dem Spieler (30 s im Gang auf ihn zu)`
        );
        soll(!(F.ruheM - F.abstandM < 40), `der Pulk flieht nicht: Abstand ${F.abstandM} → ${F.ruheM} m (Soll + 40 m)`);
        soll(!(F.wegAnteil < 0.95), `kein Pulk: ${F.wegAnteil} der Glieder fliehen ≥ 20 m mit (Soll ≥ 0,95)`);
        soll(!(F.kohaesion < 0.9 || F.kohaesion > 1), `der Pulk zerfällt auf der Flucht: ${F.kohaesion} im größten Verbund (Soll ≥ 0,9)`); // prettier-ignore
        soll(F.ausloesS == null || Ld.nachS != null, `der Pulk landet nie in der Ruhe (Modus ${Ld.modus} nach 60 s)`);
        soll(!(Ld.dyM > 0.25), `landet neben dem Scheitel: ${Ld.dyM} m über dem Scheitel aus der Sichthöhe ${Ld.scheitelM} m (${Ld.krone}, Soll ± 0,25 m)`); // prettier-ignore
        soll(
            !(Ld.aufKrone < 0.99),
            `${Ld.aufKrone} der Glieder sitzen auf der Krone (Radius ${Ld.radiusM} m, Soll ≥ 0,99)`
        );
    }
    if (name === "reload") {
        soll(Math.abs(z.hpNach - z.hpVor) < 0.01, `hp vor dem Reload ${z.hpVor}, danach ${z.hpNach} (geheilt)`);
        soll(z.gierFehlerGrad <= 1, `die Gier kehrt ${z.gierFehlerGrad}° daneben zurück`);
        soll(!z.tierNah, `Probe vakuös: die Region des Begleiters steht nah (sein Tier reist ohnehin)`);
        soll(z.mitTier, `der Begleiter kehrt ohne sein Tier ${z.kennung[0]} wieder: seine Region reist nicht im Stand`);
        soll(z.annahmeTritt, `die Annahme nach dem Laden trägt die Kennung ${z.kennung[1]} eines Tiers im Stand: sie tritt nie in den Bestand`); // prettier-ignore
    }
    if (name === "peer") {
        soll(z.gierFehlerGrad <= 15, `Sicht-Kopie blickt ${z.gierFehlerGrad}° neben die Laufrichtung`);
        soll(z.gangV > 0.5, `Sicht-Kopie geht nicht (Gang-Tempo ${z.gangV})`);
        soll(z.groesse === 1.37, `Sicht-Kopie trägt Größe ${z.groesse} statt der gesandten 1,37`);
    }
    if (name === "zufall") {
        soll(z.fehlt.length === 0, `benannte Methode fehlt: ${z.fehlt.join(", ")}`);
        soll(z.methoden > z.benannt, `nur ${z.methoden} Methoden gelesen (die Tier-Klasse fehlt — Probe vakuös)`);
        soll(z.treffer.length === 0, `Math.random im Kreatur-Leben: ${z.treffer.join(", ")}`);
        soll(z.leiber >= 2, `Probe vakuös: der Wurf der Lose trägt ${z.leiber} Leiber`);
        soll(z.nummerAnders === 0, `ein Los des Leibs hängt an der laufenden Nummer: ${z.nummerAnders} von ${z.leiber} Geworfenen nach 100 000 Leibern anders (Los-Nummer, Größe, Name)`); // prettier-ignore
    }
    if (name === "nexus") {
        soll(
            z.koerperWuerfe === 0,
            `der Würfel schreibt ein Körper-Gesetz: ${z.koerperWuerfe} von ${z.wuerfe} Würfen (Gang/Sprung/Größe)`
        );
        const eps = 1e-6;
        soll(
            z.speedNach >= z.speedBand[0] - eps && z.speedNach <= z.speedBand[1] + eps,
            `Lauf-Tempo ${z.speedNach} m/s jenseits des Gesetz-Bands ${z.speedBand.join("–")} (Sprint ${z.sprintNach})`
        );
        soll(
            Math.abs(z.sprintNach - z.sprintSoll) < 1e-3,
            `Sprint ${z.sprintNach} ≠ Tempo × sprintMul ${z.sprintSoll}`
        );
        soll(
            z.sprungNach >= z.sprungBand[0] - eps && z.sprungNach <= z.sprungBand[1] + eps,
            `Sprungkraft ${z.sprungNach} jenseits des Gesetz-Bands ${z.sprungBand.join("–")}`
        );
        soll(z.groesseN > 0, "keine Tiere für die Größen-Probe (vakuös)");
        soll(z.ohneAchse === 0, `${z.ohneAchse} von ${z.groesseN} Tieren: Skala ohne bodySize-Achse`);
        soll(z.ausserBand === 0, `${z.ausserBand} von ${z.groesseN} Tieren: bodySize außerhalb der Spanne des Lebens-Gesetzes`);
        soll(
            z.tempoNach < z.tempoVor - 1e-6,
            `creatures_speed_mul ohne Leser: der Charakter ${z.tempoVor} → ${z.tempoNach} (der Tempo-Hauch wirkt nicht)`
        );
        soll(
            z.tempoNach >= z.tempoBand[0] - eps && z.tempoHoch <= z.tempoBand[1] + eps,
            `Tempo-Hauch ${z.tempoNach}/${z.tempoHoch} jenseits des Wander-Bands ${z.tempoBand.join("–")}`
        );
        soll(z.geburten > 0, "keine Nexus-Geburt (vakuös)");
        soll(z.geburtImBlick === 0, `${z.geburtImBlick} von ${z.geburten} Nexus-Geburten im Blick`);
        soll(
            z.geburtMinM !== null && z.geburtMinM >= 0.99 * z.fernMin,
            `Nexus-Geburt ${z.geburtMinM} m vor dem Spieler (Soll ≥ ${z.fernMin} m)`
        );
    }
    if (name === "temperament") {
        const SOLL = {
            "wesen@1": "scheu",
            "wolf@1": "wild",
            "baer@1": "wehrhaft",
            "fuchs@1": "scheu",
            "wesen@gross": "scheu", // das größte Erwachsene des Gesetzes (~207 kg) bleibt unter kolossKg 600
            "wolf@0.6": "scheu", // das Jungtier (13,8 kg) unter der Jagd-Grenze 21,5 kg
            "baer@0.7": "sanft",
        };
        const falsch = Object.keys(SOLL).filter((k) => z.art[k] !== SOLL[k]);
        soll(
            falsch.length === 0,
            `Temperament nicht aus Gattung und Größe: ${falsch.map((k) => `${k} ${z.art[k]} (Soll ${SOLL[k]})`).join(", ")}`
        );
        soll(
            z.masseQuelle === true,
            "eine zweite Masse: Temperament oder Beute lesen nicht die EINE Masse des Leibs (_leibMasse)"
        );
        soll(
            z.beute && z.beute.hirsch === true && z.beute.kitz === true && z.beute.baer === false,
            `das Beute-Urteil des Wolfs: Hirsch ${z.beute && z.beute.hirsch}, Kitz ${z.beute && z.beute.kitz}, Bär ${z.beute && z.beute.baer} (Soll true · true · false)`
        );
        for (const [wer, k] of [
            ["Hirsch", z.kampfHirsch],
            ["Bär", z.kampfBaer],
        ])
            soll(
                Math.abs(k.dauer - k.soll) < 0.05,
                `der Kampf liest ein anderes Temperament: ${wer} fürchtet ${k.dauer} s (Soll ${k.soll} s)`
            );
    }
    if (name === "abstand") {
        soll(z.tiere >= 6, "keine neugierige Schar (vakuös)");
        // Der EINE Leib-Löser im Sim-Schritt (`_leibKontakte`): keine Durchdringung überlebt ihn (erbeMaxM: geerbte Tiefe).
        soll(
            z.durchFrames === 0,
            `Durchdringung: in ${z.durchFrames} Takten durchdringen sich zwei Leiber über ihren Frame-Schritt hinaus (tiefste ${-z.minLeibLueckeM} m, geerbt ${z.erbeMaxM} m)`
        );
        soll(
            z.spielerFrames === 0,
            `Leib im Spieler: in ${z.spielerFrames} Takten (tiefste ${-z.minSpielerLueckeM} m)`
        );
        // DER RAUM DES SPIELERS (der Paar-Raum ist die Summe, auch zu ihm: seine Wand-Kapsel; tetrapoda `raumKugel` 1,3): der
        // nächste Leib steht in neun von zehn Takten mindestens Kugel an Kugel. Bis w27-wagen-spalt-2 sah die Linse nur den
        // Leib IM Spieler — mit der gezeichneten Haut der Bären (physik.K2 Staffel 2) hält der EINE Löser die Schar ohne
        // Spieler-Separation bis auf 0,2 cm aus ihm (Täter `abstand-spieler` unsichtbar), sie drängt sich aber an ihn: p10 0,909
        soll(z.spielerRaumP10 >= 1, `der Spieler hat keinen Raum: p10 ${z.spielerRaumP10} Körper-Kugeln (Soll ≥ 1)`);
        // Der persönliche Raum über die zweite Hälfte des Laufs (je Tier und Takt der nächste Nachbar in Körper-Kugeln):
        // die Schar steht im Mittel mindestens Kugel an Kugel, kaum enger.
        soll(
            z.nachbarRaumP50 >= 1 && z.nachbarRaumP10 >= 0.85,
            `kein persönlicher Raum: der nächste Nachbar p50 ${z.nachbarRaumP50} / p10 ${z.nachbarRaumP10} der Körper-Kugeln (Soll ≥ 1 / 0,85; zuletzt zwei Mitten ${z.paarMinM} m)`
        );
    }
    if (name === "gestalt") {
        soll(z.glieder > 0 && z.kapseln > 0, "der Wolf trägt keine Treffer-Kapseln (vakuös)");
        soll(z.fehlt.length === 0, `die Passung zerlegt den Wolf je Tier anders: ${z.fehlt.join(", ")}`);
        soll(
            z.maxAbw === 0,
            `die Treffer-Gestalt hängt am ersten Tier: die Kapsel ${z.glied} weicht ${z.maxAbw} ab (gepasst in Lage, Pose und Größe des Tiers statt in der Ruhe seiner Gattung)`
        );
        soll(z.gehalten === true, "die Passung verstellt die laufende Pose des Tiers");
        soll(
            z.vorrat.length === 0,
            `der Vorrat legt keine Glieder für ${z.vorrat.join(", ")} (Soll: jede Gattung des Lebensraums)`
        );
        const K = z.takt;
        soll(
            K.zerlegt === 0 && K.satz && K.ruf > 0,
            `der Takt zerlegt die Gestalt einer kalten Gattung: ${K.zerlegt}× zerlegt, Satz ${K.satz}, ${K.ruf} kalte Rufe (Soll 0× · true · > 0)`
        );
    }
    if (name === "todlage") {
        soll(z.imTod === 0, `der Tod rechnet seine Lage im Takt: ${z.imTod} Karten-Lesungen (Soll 0)`);
        soll(
            z.imTod > 0 || (z.steht && z.fenster > 1 && z.tafel === z.soll),
            `die Lage im Leerlauf: der Leib steht ${z.steht}, ${z.fenster} Fenster ohne Zeit, Tafel ${z.tafel} von ${z.soll}`
        );
    }
    if (name === "witterung") {
        // DIE FAHNE WINDAB (Karte 2 erleben.sinne.geruch#1): das Gesetz an der Funktion, dann die Suche am Takt
        const G = z.gesetz;
        const gegen = Math.max(...G.gegen);
        soll(G.ruhe <= 1e-9, `die Windstille trägt nicht das Radial-Gesetz exp(−r/80): Abweichung ${G.ruhe}`);
        soll(gegen === 0, `gegen den Wind > 0: ${gegen} in 10 · 40 m bei 2 · 4 · 8 m/s (Soll 0, kein Rest-Sockel)`);
        soll(
            G.quer.every((v, i) => i === 0 || v <= G.quer[i - 1]) && G.quer[0] > G.quer[3] && G.quer.at(-1) === 0,
            `quer fällt die Witterung nicht mit dem Winkel: ${G.quer.join(" · ")} bei 0 · 5 · 10 · 20 · 45 · 90° in 20 m (Soll fallend, quer 0)`
        );
        soll(
            G.reich[0] === G.kanteM && G.reich.every((v, i) => i === 0 || v > G.reich[i - 1]) && G.reich.at(-1) <= G.deckeM,
            `die Reichweite windab wächst nicht mit dem Wind oder sättigt nicht: ${G.reich.join(" · ")} m bei 0 · 2 · 4 · 8 · 16 m/s (Soll Windstille ${G.kanteM} m, wachsend, ≤ ${G.deckeM} m)`
        );
        const P = z.rudel;
        soll(!!P, "das Rudel fehlt");
        if (P)
            soll(
                P.windabS !== null && P.querS !== null && P.querS <= P.windabS + 1 && P.querWittert < 1,
                `das Rudel jagt nicht als eines: windab gewittert ${P.windabS} s, der Wolf quer (Witterung ${P.querWittert} der Kante) jagt mit ${P.querS} s (Soll ≤ 1 s danach, quer unter der Kante)`
            );
        const Bt = z.beute;
        soll(!!Bt, "die Beute-Probe fehlt");
        if (Bt)
            soll(
                Bt.luv === true && Bt.lee === false,
                `die Beute wittert nicht: der pirschende Wolf ${Bt.abstandM} m luvwärts ${Bt.luv ? "gemerkt" : "ungemerkt"}, windab ${Bt.lee ? "gemerkt" : "ungemerkt"} (Soll luvwärts gemerkt — dieselbe Fahne wie die des Jägers, Mech 1966 —, windab ungemerkt; Fluchtdistanz ${Bt.fluchtM} m)`
            );
        if (Bt)
            soll(
                Bt.frisch === false,
                `die Fahne ohne Laufzeit: der eben gesetzte Wolf ${Bt.abstandM} m luvwärts ${Bt.frisch ? "gemerkt" : "ungemerkt"} (Soll ungemerkt — seine Front braucht ${Bt.laufzeitS} s)`
            );
        const L = z.suche && z.suche.laeufe;
        soll(!!L, "die Suche fehlt");
        if (L) {
            const W = L.windab;
            const zeit = (l) => l.fundS ?? l.bisS;
            const f = W.fundS ? +(zeit(L.gegen) / W.fundS).toFixed(2) : null;
            soll(
                W.fundS !== null && W.witterS !== null && W.wegM <= 1.3 * 32,
                `windab findet der Wolf das Reh nicht gerade: gefunden ${W.fundS} s, gewittert ${W.witterS} s, Weg ${W.wegM} m (Soll ≤ 1,3 × 32 m)`
            );
            soll(
                f !== null && f >= 3,
                `die Suchzeit gegen den Wind ist ${f}× die windab (${zeit(L.gegen)} gegen ${W.fundS} s, Soll ≥ 3×)`
            );
            const jagdSpieler = Object.keys(L).filter((k) => L[k].spieler > 0);
            soll(!jagdSpieler.length, `der Wolf jagt den Spieler statt das Reh: ${jagdSpieler.join(", ")}`);
        }
    }
    if (name === "jagdkreis" || name === "mahl") {
        const R = z.riss;
        // DAS BAND DER NATUR (MacNulty et al. 2012, `Q.band` aus der Probe): ein Wolf reißt den gesunden Hirsch selten, vier ein
        // Fünftel bis zwei Fünftel der Jagden, das Kitz meist — die Quote und das Ende jeder Jagd misst jagdkreis (60 des Rudels,
        // 240, wo die 60 nicht entscheiden), das Mahl misst mahl (es jagt nur bis zum ersten Riss)
        if (name === "jagdkreis") {
            for (const sz of ["einWolf", "rudel", "kitz"]) {
                const Q = R.quote[sz],
                    [lo, hi] = Q.band,
                    v = Q.jagden ? +(Q.risse / Q.jagden).toFixed(2) : null;
                soll(
                    Q.jagden >= 10 && v >= lo && v <= hi,
                    `${v > hi ? "Beute ohne Leben" : "die Jagd reißt zu selten"} (${sz}): Riss-Quote ${Q.risse}/${Q.jagden} = ${v} außerhalb ${lo}–${hi} je Jagd (Beute ${Q.hp0} HP)`
                );
            }
            const Q = R.quote.rudel;
            soll(
                Q.jagden - Q.risse === Q.erschoepft,
                `die Jagd hat kein Ende: ${Q.jagden - Q.risse - Q.erschoepft} von ${Q.jagden - Q.risse} enden nie`
            );
        }
        soll(
            R.rissS !== null,
            `kein Riss: das Rudel fällt den gesunden Hirsch in keiner von ${R.quote.rudel.jagden} Jagden`
        );
        // die Kette nach dem Riss (nur mahl trägt sie: ihre Gäste kamen mit dem Riss)
        if (R.gaeste.length) {
            soll(R.fleisch0 > 0, "kein Kadaver: der gerissene Leib trägt kein Fleisch (_kreaturFaellt)");
            soll(
                R.fleischEnde !== null && R.fleischEnde < R.fleisch0,
                `Fressen verbraucht den Kadaver nicht: Fleisch ${R.fleisch0} → ${R.fleischEnde} kg in 120 s nach dem Riss bei ${R.rissS} s`
            );
            for (const G of R.gaeste)
                soll(G.frissS > 0, `kein Geruch: der ${G.seele} folgt dem Kadaver nicht (frisst ${G.frissS} s)`);
            // DAS MAHL (Tiere K2 Staffel 2): das Rudel frisst in den 120 s nach dem Riss ≥ 40 % dessen, was seine Mägen fassen
            // (Fuchs und Bär oben: im Fenster). Gemessen in kg, nie in Sekunden: die Sekunden am Kadaver hängen daran, wann der Bär
            // kommt und wie viele Wölfe zugleich am Leib Platz finden (herde-gesetz: dieselben 56 kg, das Rudel zu viert am Leib,
            // der Bär nach 19,7 s — leer nach 46 s, 55,2 s am Kadaver; main 105 s) — der magere Riss (4,7 kg) bleibt weit darunter
            soll(
                R.rudelKg >= 0.4 * R.rudelVoll,
                `das Rudel frisst nicht: ${R.rudelKg} kg in seine Mägen (${R.rudelVoll} kg) in 120 s nach dem Riss, ${R.fressS} s am Kadaver (Soll ≥ 40 %)`
            );
        }
    }
    if (name === "rudel") {
        soll(
            !z.ohnePirsch.some(Boolean),
            `das Rudel pirscht im Frieden / den leeren Anker: ${z.ohnePirsch.join(" / ")} Takte`
        );
        soll(z.pirschS !== null, `das Rudel pirscht den Spieler nicht: ${z.woelfe} Wölfe 45 m vom Wurf-Ort, 600 s`);
        soll(z.umstelltS !== null, `das Rudel umstellt nicht: kein Takt in 600 s mit ≥ 3 Jägern und Lücke ≤ 540°/n`);
        soll(
            z.lueckeBeimBiss !== null && z.lueckeBeimBiss <= 180,
            `das Rudel umstellt nicht: beim ersten Biss ${z.lueckeBeimBiss}° Lücke`
        );
    }
    if (name === "ferngang") {
        for (const [zone, Z] of [
            ["Grobstufen-Zone 45–60 m", z.grobstufe],
            ["Kapsel-Zone 70–90 m", z.kapsel],
        ]) {
            soll(Z.laufTakte >= 200, `${zone}: nur ${Z.laufTakte} laufende Takte (die Probe braucht ≥ 200)`);
            soll(
                Z.gleitAnteil !== null && Z.gleitAnteil <= 0.05,
                `ferner Gang gleitet: ${zone} ${Z.gleitTakte} von ${Z.laufTakte} laufenden Takten ohne Beinschlag (Soll ≤ 5 %; die Grobstufe trug ${Z.fernBild})`
            );
        }
    }
    if (name === "querhang") {
        // ZWEI ORTE: der Hang der Welt UND die feste Rampe der Prüfbühne (z.rampe); fehlt die Rampe, ist nichts gemessen
        const orte = [["am Querhang", z]];
        if (!z.rampe) soll(false, "die Rampe der Prüfbühne ist nicht gemessen (der Querhang hängt am Zufall der Welt)");
        else if (z.rampe.fehler) soll(false, z.rampe.fehler);
        else orte.push([`an der Rampe ${z.rampe.ort}`, z.rampe]);
        for (const [wo, Z] of orte)
            for (const [wer, a] of [
                ["Wolf", Z.stand.wolf],
                ["Hirsch", Z.stand.hirsch],
            ])
                soll(
                    a.lotMaxGrad <= 10,
                    `Bein-Lot ${wo} (${Z.hangGrad}°): ${wer} ${a.lotMaxGrad}° (Soll ≤ 10°; der Leib rollt ${a.rollGrad}°)`
                );
        for (const [wo, Z] of orte)
            for (const [wer, sl] of [
                ["Wolf", Z.schlupf.wolf],
                ["Hirsch", Z.schlupf.hirsch],
            ])
                soll(
                    sl !== null && sl <= 0.05,
                    `Stand-Schlupf ${wo} (${Z.hangGrad}°): ${wer} ${sl} (Soll ≤ 0,05, Ratsche K07)`
                );
    }
    // DIE BÜHNE DER HERDE (herde-bild): erst die Bühne selbst (der volle Wurf, die Tiere bewegt), dann das Soll S1–S5 des Entscheids
    // H3 — gesetzt vor jeder Messung, nie nach einem Ergebnis bewegt; S5 urteilt das Wolfsrudel (`art` wolf)
    if (name === "herde-bild") {
        soll(z.n === z.soll, `der Wurf trägt ${z.n} von ${z.soll} Tieren`);
        soll(z.bewegungM > 1, `die Bühne steht: Bewegung ${z.bewegungM} m über den Fahrplan (Soll > 1 m)`);
        const S1 = z.s1.aesen;
        soll(S1.ab200 === z.n, `S1: ${S1.ab200} von ${z.n} Tieren ≥ 200 px im Zustand äsen (${z.s1.quelle}; Soll ${z.n} von ${z.n})`); // prettier-ignore
        // Kopf unten urteilt, wer äst — der Wolf äst nicht (Ethogramm nahrung 0, `wolfSatt`): die Zeile fällt für ihn
        if (!z.einstellung.wolfSatt) soll(S1.kopfUntenAnteil >= 0.4, `S1: Anteil Kopf unten ${S1.kopfUntenAnteil} im Zustand äsen (Soll ≥ 0,4)`); // prettier-ignore
        soll(z.hufe && z.hufe.maxAbsM <= 0.03, z.hufe ? `Hufe: Sohle über dem Grund unter ihr bis ${z.hufe.maxAbsM} m (${z.hufe.proben} Proben stehender Leiber in stehen/äsen, Median ${z.hufe.median}; Soll ≤ 0,03)` : "Hufe ungemessen: kein stehender Leib in stehen/äsen"); // prettier-ignore
        const S2 = z.s2;
        soll(
            !S2.ungemessen && Math.abs(S2.gipfelGegen2f - 1) <= 0.1 && S2.amplitudeCm >= 2 && S2.amplitudeCm <= 5,
            S2.ungemessen
                ? `S2 ungemessen: ${S2.ungemessen}`
                : `S2: Gipfel der Kopfhöhe bei ${S2.gipfelHz} Hz = ${S2.gipfelGegen2f} × 2·f_Schritt, Amplitude ${S2.amplitudeCm} cm (Soll 2·f ± 10 %, 2–5 cm)` // prettier-ignore
        );
        const S3 = Object.entries(z.s3).sort((a, b) => b[1].max - a[1].max)[0];
        soll(S3[1].max <= 0.05, `S3: größter Sprung je Takt ${S3[1].max} rad am ${S3[0]} (${S3[1].zustand}, t ${S3[1].t} s; Soll ≤ 0,05 rad)`); // prettier-ignore
        const S4 = Math.max(z.s4.gesetz.querMS2, z.s4.welt.querSprintMS2);
        soll(S4 <= 9.8, `S4: Querbeschleunigung im Sprint ${S4} m/s² (Gesetz ${z.s4.gesetz.querMS2}, Welt ${z.s4.welt.querSprintMS2}; Soll ≤ 9,8)`); // prettier-ignore
        // DIE NATUR-ZAHLEN DES GANGS (N1–N5, die Quelle je Zeile im Kopf von `naturTakt`): je Gangart mit mindestens 10 Schritten
        const N = z.natur;
        if (N)
            for (const [art, a] of Object.entries(N.jeArt)) {
                if (!(a.schritte >= 10)) continue;
                if (a.slipQ) soll(a.slipQ[0] <= 0.03, `N1 ${art}: Schlupf des Bilds ${a.slipQ[0]} m im Median je Stand (Gesetz ${a.slipGesetzQ ? a.slipGesetzQ[0] : "—"}; Soll ≤ 0,03 wie die Hufe)`); // prettier-ignore
                soll(a.ajQ[1] >= 0.75 && a.ajQ[1] <= 1.33, `N2 ${art}: Schritt ${a.lamLMedian} L = ${a.ajQ[1]} × Alexander & Jayes 2,3·Fr^0,3 (λ je Schulterhöhe ${a.lamSchulterMedian}; Soll 0,75–1,33)`); // prettier-ignore
                if (a.imBand !== null) soll(a.imBand >= 0.9, `N2 ${art}: Froude-Zahl im Band ${a.band} nur ${a.imBand} der Takte (Median ${a.froudeQ[1]}; Soll ≥ 0,9)`); // prettier-ignore
                const tief = art === "schritt" ? 0.15 : 0.25;
                if (a.senkeLQ) soll(a.senkeLQ[1] <= tief, `N5 ${art}: Senke des Rumpfs p95 ${a.senkeLQ[1]} L (Soll ≤ ${tief}: Gard 2004, Lee & Farley 1998 — der Rumpf an der Decke h/3 ist die gedrückte Gestalt)`); // prettier-ignore
            }
        if (N && N.kopfTrab) soll(N.kopfTrab.ueber === 0, `N3: Kopf im Trab wippt bis ${N.kopfTrab.ampMaxCm} cm (Soll ≤ ${N.kopfTrab.sollCm} cm = HALTUNG_GESETZ.nick × L), ${N.kopfTrab.ueber} von ${N.kopfTrab.leiber} Leibern darüber`); // prettier-ignore
        if (N && N.flucht) {
            const F = N.flucht;
            soll(F.nnRaumQ[1] >= 1 && F.nnRaumQ[1] <= F.fensterRaum, `N4: nächster Nachbar auf der Flucht ${F.nnRaumQ[1]} Paar-Räume im Median (Soll 1–${F.fensterRaum}: getrennt, im Fenster des Verbands)`); // prettier-ignore
            soll(F.phiMittel >= 0.8, `N4: Ausrichtung der Flucht Φ ${F.phiMittel} (Soll ≥ 0,8)`);
        }
        if (z.art === "wolf") {
            const S5 = z.s5;
            soll(
                (S5.gang.trab || 0) >= 0.5 && S5.vMedianMS >= 1.9 && S5.vMedianMS <= 2.8 && S5.diagMedianZyklen !== null && S5.diagMedianZyklen <= 0.05, // prettier-ignore
                `S5: im Zug Trab ${S5.gang.trab || 0} der Leib-Takte, ${S5.vMedianMS} m/s, Diagonal-Versatz ${S5.diagMedianZyklen} Zyklen (Soll Trab, 1,9–2,8 m/s, ≤ 0,05)` // prettier-ignore
            );
        }
    }
    LEBEN.urteil(name, z, soll);
    return { ok: f.length === 0, grund: f.join(" · ") };
}

// DIE TÄTER des Selbsttests: je Probe jeder alte Defekt, den sie trägt, und das Wort, an dem das Urteil ihn beim Namen
// nennt — rot aus dem falschen Grund ist blind für den richtigen.
const TAETER = {
    geister: [["geister", /Geister/]],
    sattel: [["sattel", /mountedArch/]],
    reload: [
        ["reload", /geheilt|Gier/],
        ["reload-fern", /kehrt ohne sein Tier g-?\d+,-?\d+\/a\d+\.ich\.1 wieder/],
        ["reload-kennung", /trägt die Kennung g-?\d+,-?\d+\/a\d+\.ich\.1 eines Tiers im Stand/],
    ],
    huepfer: [
        ["huepfer", /ohne Aktion|Luft-Anteil/],
        ["huepfer-zwilling", /neben dem Sprung-Gesetz/],
        ["huepfer-scheitel", /Luft-Anteil[\s\S]*Flugzeit 144 Hz/],
    ],
    wachsen: [["wachsen", /Skala/]],
    gier: [
        ["gier", /Lauf ↔ Blick|rückwärts/],
        ["gier-folgen", /Gas ↔ Bremse/],
    ],
    jagd: [
        ["jagd", /Achsen/],
        ["jagd-ziel", /Achsen/],
        ["jagd-schritt", /die Jagd hetzt nie: 0 von/],
        ["riss", /Riss ohne Jäger im Nah-Kreis: [1-9]/],
        ["riss-verloren", /im Übergang verloren: [1-9]/],
        ["jaeger-faellt", /Riss ohne Jäger im Nah-Kreis: [1-9]/],
    ],
    // der dritte Eintrag je Täter: die Teile, die sein Urteil liest (`teil`) — die übrigen kommen aus dem Grund-Lauf
    herde: [
        ["herde", /am Blick/, ["wander", "blick"]],
        ["herde-artfremd", /Verbands-ID bricht nach 0 s: Verband 0 liest 10 Leiber/, ["fremd"]],
        // der Verband ohne seinen Zug zerfällt auf der Flucht (0,456 an main, 0,645 mit dem Revier, Soll ≥ 0,8); beim Wandern und
        // in der Richtung lag er am Rand (main 0,89 / Φ 0,784 gegen 0,9 / 0,8) und fällt mit dem Revier im Lebensraum
        // (w28-wander-revier: die Glieder ziehen zu Zielen IN der Leine des gemeinsamen Wurf-Ankers, 1 / Φ 0,879) — nicht sein Grund
        ["herde-zerfall", /zerfällt auf der Flucht: im Mittel 0\.[0-7]/, ["flucht"]],
        ["herde-revier", /zerfällt beim Wandern|ohne gemeinsames Revier: [1-9]\d* % /, ["wander"]],
        // ohne den Alarm aus zweiter Hand reißt die Kette auf eine von zwei Weisen: der letzte flieht spät (s ≥ 1) oder einer
        // flieht nie (null: am Merge herde ⊕ Samen-Lose 4 von 5 — das fünfte Glied sah den Fremden nie selbst)
        ["herde-alarm", /Alarm-Kette reißt: der letzte von [1-9] Flüchtern läuft (null|[1-9])/, ["flucht"]],
        // der Fluchtweg am Radius der Witterung ist kurz — auch 0 m (kein Flüchter kommt vom Fleck) nennt den Täter
        ["herde-fluchtweg", /Fluchtweg \d(\.\d+)? m/, ["flucht"]],
        ["herde-punkt", /Verband klumpt: das engste Paar 0 \/ 0 .+ und .+ auf 0 nach/, ["wander", "flucht"]],
        ["herde-park", /Probe vakuös: Glieder 1 \/ 1 /, ["wander", "flucht"]],
        ["herde-dorf", /Geburt im Reich des kommenden Orts -?\d+,-?\d+: 8 von 8/, []],
    ],
    schwarm: [
        ["schwarm-verband", /Schwarm zerfällt/],
        ["schwarm-zwilling", /Schwarm ohne Verband: 0 Züge/],
        ["leittier-uhr", /Leittier ohne Ereignis: der Pulk flieht nie/],
        ["leittier-hoehe", /landet neben dem Scheitel/],
    ],
    peer: [
        ["peer", /Sicht-Kopie/],
        ["peer-groesse", /Sicht-Kopie trägt Größe [0-9.]+ statt/],
    ],
    zufall: [
        ["zufall", /Math\.random im Kreatur-Leben: _pickCreatureName/],
        ["zufall-nummer", /ein Los des Leibs hängt an der laufenden Nummer: [1-9]/],
    ],
    nexus: [
        ["nexus-wuerfel", /der Würfel schreibt ein Körper-Gesetz/],
        ["nexus-gesetz", /jenseits des Gesetz-Bands/],
        ["nexus-groesse", /Skala ohne bodySize-Achse/],
        ["nexus-geburt", /Nexus-Geburten im Blick|Nexus-Geburt .* vor dem Spieler/],
    ],
    temperament: [
        ["temperament", /Temperament nicht aus Gattung und Größe/],
        ["temperament-masse", /eine zweite Masse/],
    ],
    abstand: [
        ["abstand", /Durchdringung|kein persönlicher Raum/],
        ["abstand-spieler", /Leib im Spieler|keinen Raum/],
    ],
    jagdkreis: [
        ["jagd-gradient", /kein Riss/],
        ["jagd-hp", /Beute ohne Leben/],
        ["jagd-flucht", /Beute ohne Leben \(rudel\)/],
        ["jagd-ohne-ende", /die Jagd hat kein Ende/],
        ["jagd-ohne-wunde", /reißt zu selten \(rudel\)/],
    ],
    mahl: [
        ["jagd-aas", /kein Kadaver/],
        ["jagd-duft", /kein Geruch/],
        ["jagd-mager", /das Rudel frisst nicht/],
    ],
    // der alte Weg (radial × Richtungs-Faktor, Rest-Sockel 0,4 gegen den Wind, die Nase jede Witterung > 0): er hält am Gesetz;
    // der Verband, der nichts teilt: er hält am Rudel; die Beute ohne Nase (ihre Fahne trägt nichts): sie hält an der Beute
    witterung: [
        ["witterung-sockel", /gegen den Wind > 0/],
        ["witterung-allein", /das Rudel jagt nicht als eines/],
        ["beute-ohne-nase", /die Beute wittert nicht/],
        ["fahne-ohne-laufzeit", /die Fahne ohne Laufzeit/],
    ],
    rudel: [
        ["rudel", /umstellt nicht/],
        ["rudel-beute", /pirscht den Spieler nicht/],
        ["rudel-leib", /Gestalt ohne Volumen/],
    ],
    // je Täter nennen BEIDE Orte ihn: der Hang der Welt und die Rampe der Prüfbühne
    querhang: [
        ["querhang", /Bein-Lot am Querhang[\s\S]*Bein-Lot an der Rampe/],
        ["querhang-gleiten", /Stand-Schlupf am Querhang[\s\S]*Stand-Schlupf an der Rampe/],
    ],
    ferngang: [
        ["ferngang", /ferner Gang gleitet/],
        ["ferngang-bindung", /ferner Gang gleitet: Grobstufen-Zone/],
    ],
    gestalt: [
        ["gestalt", /hängt am ersten Tier/],
        ["gestalt-vorrat", /Vorrat legt keine Glieder/],
        ["gestalt-takt", /der Takt zerlegt die Gestalt einer kalten Gattung: [1-9]/],
    ],
    todlage: [["todlage-takt", /der Tod rechnet seine Lage im Takt: [1-9]/]],
    tiersatz: [
        ["tiersatz-kopf", /hängen an der Kopfzahl/],
        ["tiersatz-blick", /Satz außer Blick/],
        ["tiersatz-schreiben", /schreibt ohne Änderung/],
        ["tiersatz-kopie", /Sicht-Kopien zeichnen als Leib/],
    ],
    // die Bühne der Herde: die Tiere gehalten (der Halter der Werkbank) — sie steht; die Kamera am alten Ort 140 m fern — S1 sieht
    // kein Tier; der Halt der Raten-Leiter aus — der stehende Fuß gleitet mit dem Leib (N1); der Rumpf an der Decke der Senke (N5)
    "herde-bild": [
        ["herde-bild-gehalten", /die Bühne steht: Bewegung 0 m/],
        ["herde-bild-fern", /S1: 0 von \d+ Tieren ≥ 200 px/],
        ["herde-bild-gleiten", /N1 (trab|galopp): Schlupf des Bilds 0\.[1-9]/],
        ["herde-bild-senke", /N5 (trab|galopp): Senke des Rumpfs p95 0\.(2[6-9]|3)/],
    ],
};

module.exports = {
    KREATUR_PROBEN_SRC: kreaturProben
        .toString()
        .replace("/* MENSCH_BUEHNEN */", () => MENSCH.BUEHNEN)
        .replace("/* LEBEN_BUEHNEN */", () => LEBEN.BUEHNEN),
    PROBEN: [...PROBEN, ...LEBEN.PROBEN, ...MENSCH.PROBEN],
    TAETER: Object.assign(TAETER, LEBEN.TAETER, MENSCH.TAETER, { "zielplan@stadt-voll": LEBEN.TAETER.zielplan }),
    // die Probe mit EINEM Lauf im Selbsttest: alle ihre Täter in ihm, das Urteil je Täter an seiner Sicht (`sicht`)
    EIN_LAUF: [...MENSCH.EIN_LAUF, ...LEBEN.EIN_LAUF],
    STADT_ORT: MENSCH.STADT_ORT,
    urteil,
};

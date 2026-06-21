// AnazhRealm — bake-core.js: die THREE-freie Skin-Isosurface-Mathe (DER BÄCKER, V18.314).
// EINE Quelle, geladen von Main-Thread (headless-sync + BufferGeometry-Zusammenbau) UND
// vom bake-worker (off-thread). KEINE THREE-Referenz (läuft im Worker). Wortgetreue
// Extraktion aus _buildCreatureSkinGeometryUncached — jede Formel/Konstante EXAKT gleich.
(function (root) {
    function bakeSkinGeometry(parts, opts) {
        if (!Array.isArray(parts) || !parts.length) return null;
        const rotV = (v, rot) => {
            if (!rot || (!rot.x && !rot.y && !rot.z)) return v;
            const cx = Math.cos(rot.x || 0),
                sx = Math.sin(rot.x || 0),
                cy = Math.cos(rot.y || 0),
                sy = Math.sin(rot.y || 0),
                cz = Math.cos(rot.z || 0),
                sz = Math.sin(rot.z || 0);
            const [x, y, z] = v; // Euler XYZ: R = Rx·Ry·Rz
            const x1 = cz * x - sz * y,
                y1 = sz * x + cz * y,
                z1 = z;
            const x2 = cy * x1 + sy * z1,
                y2 = y1,
                z2 = -sy * x1 + cy * z1;
            return [x2, cx * y2 - sx * z2, sx * y2 + cx * z2];
        };
        const bones = [];
        let mnx = 1e9,
            mny = 1e9,
            mnz = 1e9,
            mxx = -1e9,
            mxy = -1e9,
            mxz = -1e9;
        for (const p of parts) {
            if (!p.size || !p.position) continue;
            if (p.feature) continue; // Gesichts-Features (Augen/Ohren) werden NICHT umhüllt
            const sx = Math.abs(p.size.x) || 0.1,
                sy = Math.abs(p.size.y) || 0.1,
                sz = Math.abs(p.size.z) || 0.1;
            const rot = p.rotation;
            const rotated = !!(rot && (rot.x || rot.y || rot.z));
            if (!rotated) {
                // ANISOTROPES ELLIPSOID (achsen-ausgerichtete Körper-Masse; Schöpfer „kein fetter
                // Ball — schärfe die Regel"): die BOX-MASSE SIND die Halbachsen → eine TIEFE, SCHMALE
                // Brust (y groß, x klein, z lang) EMERGIERT aus den Maßen, statt zur runden Kugel
                // gezwungen zu werden (die runde Kapsel war die Wurzel des „fetten Balls"). Die Iso
                // (field=0) ist EXAKT das Ellipsoid; nur der Betrag fern davon skaliert mit der
                // kleinsten Achse (= die smin-Blendbreite).
                const rx = Math.max(0.03, (sx / 2) * 1.06),
                    ry = Math.max(0.03, (sy / 2) * 1.06),
                    rz = Math.max(0.03, (sz / 2) * 1.06);
                const c = [p.position.x, p.position.y, p.position.z];
                bones.push({
                    ell: true,
                    c,
                    r: [rx, ry, rz],
                    rmin: Math.min(rx, ry, rz),
                    kScale: p.kScale || 1,
                    def: !!p.def,
                    disp: !!p.disp,
                    amp: p.amp,
                    reach: p.reach,
                    mat: p.material,
                });
                const RR = [rx + 0.1, ry + 0.1, rz + 0.1];
                mnx = Math.min(mnx, c[0] - RR[0]);
                mny = Math.min(mny, c[1] - RR[1]);
                mnz = Math.min(mnz, c[2] - RR[2]);
                mxx = Math.max(mxx, c[0] + RR[0]);
                mxy = Math.max(mxy, c[1] + RR[1]);
                mxz = Math.max(mxz, c[2] + RR[2]);
                continue;
            }
            // RUNDE getaperte Kapsel (rotierte Glieder/Hals/Schwanz): Segment entlang der längsten
            // Achse, runder Querschnitt. WOLFF/Round-Cone: das tiefere Ende distal-dünn.
            const half = [sx / 2, sy / 2, sz / 2];
            let ax = 0;
            if (sy >= sx && sy >= sz) ax = 1;
            else if (sz >= sx && sz >= sy) ax = 2;
            const r = Math.max(0.025, (Math.min(sx, sy, sz) / 2) * 1.08);
            let dir = [0, 0, 0];
            dir[ax] = 1;
            dir = rotV(dir, p.rotation);
            const segHalf = Math.max(0, half[ax] - r * 0.8);
            const a = [
                p.position.x - dir[0] * segHalf,
                p.position.y - dir[1] * segHalf,
                p.position.z - dir[2] * segHalf,
            ];
            const b = [
                p.position.x + dir[0] * segHalf,
                p.position.y + dir[1] * segHalf,
                p.position.z + dir[2] * segHalf,
            ];
            const segLen = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
            let ra = r,
                rb = r;
            if (segLen > r * 1.6) {
                const taper = 0.6;
                if (a[1] >= b[1]) rb = r * taper;
                else ra = r * taper;
            }
            bones.push({
                a,
                b,
                ra,
                rb,
                rmin: Math.min(ra, rb),
                kScale: p.kScale || 1,
                def: !!p.def,
                amp: p.amp,
                reach: p.reach,
                mat: p.material,
            });
            const R = r + 0.12; // SDF-Oberfläche + smin-Fillet-Marge für die BBox
            for (const pt of [a, b]) {
                mnx = Math.min(mnx, pt[0] - R);
                mny = Math.min(mny, pt[1] - R);
                mnz = Math.min(mnz, pt[2] - R);
                mxx = Math.max(mxx, pt[0] + R);
                mxy = Math.max(mxy, pt[1] + R);
                mxz = Math.max(mxz, pt[2] + R);
            }
        }
        if (!bones.length) return null;
        const distSeg = (px, py, pz, a, b) => {
            const abx = b[0] - a[0],
                aby = b[1] - a[1],
                abz = b[2] - a[2];
            const ab2 = abx * abx + aby * aby + abz * abz;
            let t = ab2 > 1e-9 ? ((px - a[0]) * abx + (py - a[1]) * aby + (pz - a[2]) * abz) / ab2 : 0;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            const cx = a[0] + abx * t,
                cy = a[1] + aby * t,
                cz = a[2] + abz * t;
            return Math.hypot(px - cx, py - cy, pz - cz);
        };
        // wahrerguss System B — SDF + SMOOTH-MINIMUM (Inigo Quilez, der Profi-Kern, Schöpfer-
        // Recherche): jeder Knochen ist eine KAPSEL-SDF (signierte Distanz, <0 innen); smin
        // verschmilzt sie WEICH zu EINER Masse „wie aus Ton" — statt eines additiven Kugel-
        // BEUTELS (der die Klumpen + harten Schulter/Hüft-Nähte erzeugte). K = die Blend-Breite
        // (klein genug, dass das Feld ein gültiges SDF bleibt, sonst „floating island"-Artefakte).
        const smin = (a, b, k) => {
            const h = Math.max(0, Math.min(1, 0.5 + (0.5 * (b - a)) / k));
            return b * (1 - h) + a * h - k * h * (1 - h);
        };
        // getaperte Kapsel (interpolierter Radius entlang des Segments) — die Round-Cone-Form.
        const sdTaper = (px, py, pz, bn) => {
            const a = bn.a,
                b = bn.b;
            const abx = b[0] - a[0],
                aby = b[1] - a[1],
                abz = b[2] - a[2];
            const ab2 = abx * abx + aby * aby + abz * abz;
            let t = ab2 > 1e-9 ? ((px - a[0]) * abx + (py - a[1]) * aby + (pz - a[2]) * abz) / ab2 : 0;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            const dx = px - (a[0] + abx * t),
                dy = py - (a[1] + aby * t),
                dz = pz - (a[2] + abz * t);
            return Math.hypot(dx, dy, dz) - (bn.ra + (bn.rb - bn.ra) * t);
        };
        const sdEllipsoid = (px, py, pz, bn) => {
            const c = bn.c,
                r = bn.r;
            const ex = (px - c[0]) / r[0],
                ey = (py - c[1]) / r[1],
                ez = (pz - c[2]) / r[2];
            const kl = Math.sqrt(ex * ex + ey * ey + ez * ez);
            return (kl - 1) * bn.rmin; // Iso (=0) EXAKT das Ellipsoid; Betrag ~ kleinste Achse (smin-Blend)
        };
        // lebendiger-koerper §2½ WURZEL 1 — die smin-Blend-Breite k ist der erste TIEFPASS:
        // ein grosses k an den Körper-Massen zieht die anatomischen Scheiben (tiefe Brust ·
        // Flanken-Tuck · hohe Kruppe) zu ihrem Mittel = ein horizontales Ellipsoid. kMax ist
        // opt-parametrisiert (Default 0.12 = das vorige Verhalten), damit diag-koerper-tiefpass
        // den Tradeoff (definierte Kante vs. erodierende dünne Glieder) am Iso-Dump MISST.
        const kMax = opts && Number.isFinite(opts.kMax) ? opts.kMax : 0.12;
        const kFloor = opts && Number.isFinite(opts.kFloor) ? opts.kFloor : 0.04; // Mindest-Blend; KLEINER → schärfere Muskel-Täler (Sixpack/Linea alba), die die reine Feld-Normale gestochen liest
        // ── VERSCHIEBUNGS-SUBSTRAT (SMPL-Architektur, feature-geflaggt parallel zur Union) ──
        // Schöpfer-Wurzel: in der UNION (smin) sind Amplitude+Form+Blend an EINEM Primitiv gekoppelt
        // → Random-Walk, der nie konvergiert (Schulter-Ball/Waffel/Leisten-Bälle = die Kugel-Kappe,
        // die durchs min schlägt). DECOUPLING: die Basis-Fläche kommt aus den STRUKTUR-Knochen; jede
        // DEF-Muskel-Masse HEBT sie um eine EXPLIZITE Amplitude über ein authoriertes Tropfen-Profil
        // (smoothstep, anisotrop via die Ellipsoid-Extents) — amp/reach/Form einzeln einrastbar.
        const DISPLACE = !!(opts && opts.displace);
        const dispCap = opts && Number.isFinite(opts.dispCap) ? opts.dispCap : 0.45; // Validitäts-Deckel: zu viel Verschiebung bricht den ~Einheitsgradient (floating island/Pinch)
        const field = (x, y, z) => {
            let d = 1e9;
            for (const bn of bones) {
                if (DISPLACE && bn.def && bn.ell) continue; // FLEISCH-Muskel (def) = Verschiebung; KNOCHEN/Struktur (non-def) = scharfe Union. Das MATERIAL treibt das Substrat.
                // PRO-GELENK-k (Schöpfer-Brief „grosses k an der Schulter = kontinuierliches
                // Fleisch"): k skaliert mit dem kleinsten Radius des Knochens → dicke Körper-Massen
                // blenden mit GROSSEM k (glatte Schulter), schlanke Glieder mit kleinem k →
                // definierte Kante. Gedeckelt, damit das Feld ein gültiges SDF bleibt.
                // BEDINGUNG ii (lebendiger-koerper §2½ — LANDMARK-SCHÄRFE): ein Knochen mit
                // `kScale < 1` blendet TIGHT (knochige Kante: Schulterblatt-Gräte · Jochbein ·
                // Knie · Ellbogen · Hüfthöcker), einer mit `kScale > 1` weich (Muskel-Bauch). So
                // tragen weiche Muskeln UND scharfe Knochen-Vorsprünge in EINEM Feld (das Auge
                // liest „echt" an den Landmarken). Floor 0.012 hält das Feld ein gültiges SDF.
                // MATERIAL treibt die Schärfe: KNOCHEN blendet TIGHT (×0.66 → scharfe, FIXE Struktur),
                // FLEISCH weich (×1.0). Das Material tut, was es soll — keine Hand-Zahl pro Masse.
                const matK = bn.mat === "knochen" ? 0.66 : 1.0;
                const k = Math.max(kFloor, Math.min(kMax, Math.max(0.022, bn.rmin * 0.52)) * (bn.kScale || 1) * matK);
                d = smin(d, bn.ell ? sdEllipsoid(x, y, z, bn) : sdTaper(x, y, z, bn), k);
            }
            let f = -d; // Basis-Feld: SDF<0 (innen) → >0 für den Mesher (Konvention: >0 = innen)
            if (DISPLACE) {
                let disp = 0;
                for (const bn of bones) {
                    if (!bn.def || !bn.ell) continue;
                    const c = bn.c,
                        r = bn.r;
                    const ex = (x - c[0]) / r[0],
                        ey = (y - c[1]) / r[1],
                        ez = (z - c[2]) / r[2];
                    const kl = Math.sqrt(ex * ex + ey * ey + ez * ez); // 0 Zentrum · 1 Ellipsoid-Oberfläche
                    const reach = bn.reach || 1.6;
                    const tt = Math.max(0, 1 - kl / reach);
                    // AMP regel-getrieben: ∝ kleinster Halbachse (größerer Muskel schwillt mehr) — keine Hand-Zahl
                    const amp = bn.amp != null ? bn.amp : bn.rmin * 0.85;
                    disp += amp * tt * tt * (3 - 2 * tt); // smoothstep-Tropfen (kein Ball, kein Erbse)
                }
                f += Math.min(dispCap, disp); // Validitäts-Deckel (Einheitsgradient bewahren)
            }
            return f;
        };
        // ── SURFACE NETS (naiv, dual): ein Vertex pro Vorzeichen-wechselnder Zelle, an die
        //    gemittelten Kanten-Kreuzungen gesetzt; Quads über kreuzende Gitter-Kanten. ──
        const PAD = 0.02;
        const min = { x: mnx - PAD, y: mny - PAD, z: mnz - PAD };
        const span = Math.max(0.2, Math.max(mxx - mnx, mxy - mny, mxz - mnz) + 2 * PAD);
        // Gitter-Auflösung (wahrerguss System D: höher = weniger Facetten, glatter Leib + dünne
        // Spalten [Bein-Zwischenraum/Finger] werden aufgelöst). Der Avatar wird EINMAL gebaut →
        // er darf hoch auflösen (opts.res); Scatter-Kreaturen bleiben bei 64 (Perf, viele Spawns).
        let N = (opts && opts.res) | 0 || 64;
        // [PERF/TEST] Headless-Gate-Drossel (analog zum renderer.render-Stub): der Isosurface-
        // Build skaliert mit N³. Der res-128-Avatar (~70 Metaball-Teile) baut headless ~19 s —
        // das Gate ruft ihn mehrfach (Warmup + jeder player_soul/forgeAvatar-Band). Die Bands
        // prüfen LOGIK (baut · ist-Rig · Resonanz · Tags · count>0/Topologie), NIE die Isosurface-
        // TREUE (das ist Augen-/Screenshot-Sache, der Live-Build bleibt res 128). Ein optionaler
        // globaler Cap, NUR vom Playtest gesetzt, clampt N → der Gate-Avatar-Build fällt von
        // ~19 s auf ~2 s, ohne die Live-Qualität zu berühren. Default 0 = aus (Produktion unberührt).
        const skinResCap = (opts && opts.headlessResCap) | 0;
        if (skinResCap > 0 && N > skinResCap) N = skinResCap;
        const h = span / N;
        const off = [
            [0, 0, 0],
            [1, 0, 0],
            [0, 1, 0],
            [1, 1, 0],
            [0, 0, 1],
            [1, 0, 1],
            [0, 1, 1],
            [1, 1, 1],
        ];
        const edges = [
            [0, 1],
            [0, 2],
            [0, 4],
            [1, 3],
            [1, 5],
            [2, 3],
            [2, 6],
            [3, 7],
            [4, 5],
            [4, 6],
            [5, 7],
            [6, 7],
        ];
        const G = N + 1;
        const grid = new Float32Array(G * G * G);
        const gi = (i, j, k) => i + G * (j + G * k);
        for (let k = 0; k < G; k++)
            for (let j = 0; j < G; j++)
                for (let i = 0; i < G; i++) grid[gi(i, j, k)] = field(min.x + i * h, min.y + j * h, min.z + k * h);
        const cellVert = new Int32Array(N * N * N).fill(-1);
        const ci = (i, j, k) => i + N * (j + N * k);
        let verts = []; // V18.314: let (wird nach den Normalen zu Float32Array quantisiert — siehe unten)
        for (let k = 0; k < N; k++)
            for (let j = 0; j < N; j++)
                for (let i = 0; i < N; i++) {
                    let inside = 0;
                    const c = [];
                    for (let n = 0; n < 8; n++) {
                        const v = grid[gi(i + off[n][0], j + off[n][1], k + off[n][2])];
                        c.push(v);
                        if (v > 0) inside++;
                    }
                    if (inside === 0 || inside === 8) continue;
                    let vx = 0,
                        vy = 0,
                        vz = 0,
                        cnt = 0;
                    for (const [a, b] of edges) {
                        if (c[a] > 0 !== c[b] > 0) {
                            const t = c[a] / (c[a] - c[b]);
                            vx += off[a][0] + (off[b][0] - off[a][0]) * t;
                            vy += off[a][1] + (off[b][1] - off[a][1]) * t;
                            vz += off[a][2] + (off[b][2] - off[a][2]) * t;
                            cnt++;
                        }
                    }
                    cellVert[ci(i, j, k)] = verts.length / 3;
                    verts.push(min.x + (i + vx / cnt) * h, min.y + (j + vy / cnt) * h, min.z + (k + vz / cnt) * h);
                }
        const idx = [];
        const quad = (a, b, cc, d, flip) => {
            if (a < 0 || b < 0 || cc < 0 || d < 0) return;
            if (flip) idx.push(a, d, cc, a, cc, b);
            else idx.push(a, b, cc, a, cc, d);
        };
        for (let k = 0; k < N; k++)
            for (let j = 0; j < N; j++)
                for (let i = 0; i < N; i++) {
                    const g0 = grid[gi(i, j, k)] > 0;
                    if (i + 1 < G && j > 0 && k > 0 && g0 !== grid[gi(i + 1, j, k)] > 0)
                        quad(
                            cellVert[ci(i, j - 1, k - 1)],
                            cellVert[ci(i, j, k - 1)],
                            cellVert[ci(i, j, k)],
                            cellVert[ci(i, j - 1, k)],
                            g0
                        );
                    if (j + 1 < G && i > 0 && k > 0 && g0 !== grid[gi(i, j + 1, k)] > 0)
                        quad(
                            cellVert[ci(i - 1, j, k - 1)],
                            cellVert[ci(i - 1, j, k)],
                            cellVert[ci(i, j, k)],
                            cellVert[ci(i, j, k - 1)],
                            g0
                        );
                    if (k + 1 < G && i > 0 && j > 0 && g0 !== grid[gi(i, j, k + 1)] > 0)
                        quad(
                            cellVert[ci(i - 1, j - 1, k)],
                            cellVert[ci(i, j - 1, k)],
                            cellVert[ci(i, j, k)],
                            cellVert[ci(i - 1, j, k)],
                            g0
                        );
                }
        if (!verts.length || !idx.length) return null;
        // wahrerguss System D — SUBDIVISION/GLÄTTUNG: der rohe Surface-Nets-Leib ist
        // facettig/klumpig (klay-Look). TAUBIN-Glättung (λ schrumpft, μ bläht zurück →
        // volumen-erhaltend, kein Schrumpf-Bug der reinen Laplace-Glättung) rundet die
        // Haut zu einer glatten organischen Oberfläche. Adjazenz aus dem Dreiecks-Index.
        const VN = verts.length / 3;
        if (VN > 3) {
            const adj = new Array(VN);
            for (let v = 0; v < VN; v++) adj[v] = new Set();
            for (let t = 0; t + 2 < idx.length; t += 3) {
                const a = idx[t],
                    b = idx[t + 1],
                    c = idx[t + 2];
                adj[a].add(b);
                adj[a].add(c);
                adj[b].add(a);
                adj[b].add(c);
                adj[c].add(a);
                adj[c].add(b);
            }
            const relax = (factor) => {
                const src = verts.slice();
                for (let v = 0; v < VN; v++) {
                    const nb = adj[v];
                    if (!nb || !nb.size) continue;
                    let ax = 0,
                        ay = 0,
                        az = 0;
                    for (const n of nb) {
                        ax += src[n * 3];
                        ay += src[n * 3 + 1];
                        az += src[n * 3 + 2];
                    }
                    const inv = 1 / nb.size;
                    verts[v * 3] += (ax * inv - src[v * 3]) * factor;
                    verts[v * 3 + 1] += (ay * inv - src[v * 3 + 1]) * factor;
                    verts[v * 3 + 2] += (az * inv - src[v * 3 + 2]) * factor;
                }
            };
            // lebendiger-koerper §2½ WURZEL 1 — die Taubin-Pässe sind der zweite TIEFPASS: jeder
            // λ-Pass mittelt die Nachbar-Vertices, viele Pässe räumen die Stations-RINGE (Kruppe/
            // Brustkorb/Taille) weg, die _creatureSkeleton/_humanoidSkeleton in die VARIANZ zwischen
            // den Stationen kodieren. Passes + λ/μ sind opt-parametrisiert (Default = das vorige
            // Verhalten: 6× 0.46/−0.49), damit diag-koerper-tiefpass den Tradeoff (glatte Haut vs.
            // wegerodierte Anatomie) am Iso-Dump MISST statt blind zu halbieren.
            const tPasses = opts && Number.isFinite(opts.taubinPasses) ? opts.taubinPasses : 6;
            const tLambda = opts && Number.isFinite(opts.taubinLambda) ? opts.taubinLambda : 0.46;
            const tMu = opts && Number.isFinite(opts.taubinMu) ? opts.taubinMu : -0.49;
            for (let pass = 0; pass < tPasses; pass++) {
                relax(tLambda); // λ glätten
                relax(tMu); // μ<−λ zurück-blähen → Taubin (volumen-erhaltend, kein Schrumpf)
            }
        }
        // PROFI-TECHNIK (SDF-Rendering — Media Molecule „Dreams" · Clayxels · Inigo Quilez): die
        // Shading-NORMALE kommt aus dem FELD-GRADIENTEN (∇field via zentrale Differenzen), NICHT
        // aus dem wobbeligen Dreiecks-Mesh (computeVertexNormals mittelt die Mesh-Lumpen → sie
        // werden im Shading sichtbar = die „Unsauberkeiten"). Das Feld ist GLATT + symmetrisch →
        // eine butterweiche, saubere, links/rechts-symmetrische Oberfläche, unabhängig von der
        // Surface-Nets-Tesselierung. field>0 innen → ∇field zeigt nach INNEN → Außen-Normale = −∇field.
        const nrm = new Float32Array(verts.length);
        {
            const ge = h * (opts && Number.isFinite(opts.normalStep) ? opts.normalStep : 0.55); // Gradient-Schrittweite (kleiner = feinere Muskel-Täler in der Normale; das Feld ist analytisch glatt → bleibt sauber)
            for (let v = 0; v < verts.length; v += 3) {
                const x = verts[v],
                    y = verts[v + 1],
                    z = verts[v + 2];
                let nx = field(x - ge, y, z) - field(x + ge, y, z);
                let ny = field(x, y - ge, z) - field(x, y + ge, z);
                let nz = field(x, y, z - ge) - field(x, y, z + ge);
                const L = Math.hypot(nx, ny, nz) || 1;
                nrm[v] = nx / L;
                nrm[v + 1] = ny / L;
                nrm[v + 2] = nz / L;
            }
        }
        // V18.314 — f32-QUANTISIERUNG wie der Live-Pfad: dort wird `verts` an dieser Stelle in eine
        // `Float32BufferAttribute` gelegt (→ float32), und die ganze Rückhälfte (normalRelax · seamGroove ·
        // AO · crease) liest/schreibt diese float32-Position. Hier dasselbe → byte-identische Geometrie
        // (die Normalen oben werden, wie im Live-Pfad, noch aus dem float64-`verts` gerechnet).
        verts = new Float32Array(verts);
        // NORMAL-RELAX (opt `normalRelax` Pässe) — beruhigt die FELD-Gradienten-Normale über die Mesh-
        //   Adjazenz, BEVOR die seamGroove die Muskel-Furche einkippt. An DICHTEN Part-Stapeln
        //   (Schulter/Klavikel/Brust: Pec-Köpfe + Deltoid + Klavikel + Sternum + Trapez + SCM überlappen)
        //   ist das smin-Feld bumpig → die Gradient-Normale WACKELT → lumpige Schattierung (Schöpfer-
        //   Befund: „du schattierst die Normalen falsch"). Ein paar Laplace-Pässe glätten NUR die Normale
        //   (nicht die Geometrie/Silhouette); die seamGroove legt die Definition danach sauber drauf.
        const nRelax = opts && Number.isFinite(opts.normalRelax) ? opts.normalRelax : 0;
        if (nRelax > 0 && idx.length) {
            const VCn = nrm.length / 3;
            const adjN = new Array(VCn);
            for (let v = 0; v < VCn; v++) adjN[v] = [];
            for (let t = 0; t + 2 < idx.length; t += 3) {
                const a = idx[t],
                    b = idx[t + 1],
                    c = idx[t + 2];
                adjN[a].push(b, c);
                adjN[b].push(a, c);
                adjN[c].push(a, b);
            }
            for (let it = 0; it < nRelax; it++) {
                const sx = new Float32Array(VCn),
                    sy = new Float32Array(VCn),
                    sz = new Float32Array(VCn);
                for (let v = 0; v < VCn; v++) {
                    sx[v] = nrm[v * 3];
                    sy[v] = nrm[v * 3 + 1];
                    sz[v] = nrm[v * 3 + 2];
                }
                for (let v = 0; v < VCn; v++) {
                    const nb = adjN[v];
                    if (!nb.length) continue;
                    let ax = sx[v],
                        ay = sy[v],
                        az = sz[v];
                    for (const k of nb) {
                        ax += sx[k];
                        ay += sy[k];
                        az += sz[k];
                    }
                    const L = Math.hypot(ax, ay, az) || 1;
                    nrm[v * 3] = ax / L;
                    nrm[v * 3 + 1] = ay / L;
                    nrm[v * 3 + 2] = az / L;
                }
            }
        }
        // ── SEAM-GROOVE: die Muskel-Furche ANALYTISCH (die Antwort auf die Auflösungs-Wand) ──
        // Das Skelett TRÄGT die Anatomie (Sixpack/Pec/Lat als getrennte DEF-Massen, im Skel-Render
        // gestochen sichtbar) — aber das Gitter (h≈0.06) löst eine 0.16-Furche nicht auf, und die
        // Glättung verschluckt sie. Hier wird die Furche dort, wo zwei DEF-Massen sich treffen
        // (d1≈d2), DIREKT aus den SDFs gerechnet (gitter-/terrassen-UNABHÄNGIG im Wert) und die
        // Shading-Normale ins Tal gekippt → der Sixpack/Pec/Lat fängt Licht unter JEDER Beleuchtung,
        // auf der glatten Feld-Haut, ohne Lumpen. Das ist der Profi-„Detail-Normal"-Hebel, analytisch.
        const seamAmp = opts && Number.isFinite(opts.seamGroove) ? opts.seamGroove : 0;
        const hasDef = seamAmp > 0 && bones.some((b) => b.def);
        let seamG = null;
        if (hasDef) {
            const seamW = opts && Number.isFinite(opts.seamWidth) ? opts.seamWidth : 0.085;
            const VC2 = verts.length / 3;
            const sdAny = (bn, x, y, z) => (bn.ell ? sdEllipsoid(x, y, z, bn) : sdTaper(x, y, z, bn));
            const gArr = new Float32Array(VC2);
            for (let v = 0; v < VC2; v++) {
                const x = verts[v * 3],
                    y = verts[v * 3 + 1],
                    z = verts[v * 3 + 2];
                let d1 = 1e9,
                    d2 = 1e9,
                    def1 = false,
                    def2 = false; // nächste ZWEI Massen
                for (const bn of bones) {
                    const d = sdAny(bn, x, y, z);
                    if (d < d1) {
                        d2 = d1;
                        def2 = def1;
                        d1 = d;
                        def1 = !!bn.def;
                    } else if (d < d2) {
                        d2 = d;
                        def2 = !!bn.def;
                    }
                }
                if (def1 || def2) gArr[v] = Math.max(0, 1 - (d2 - d1) / seamW); // 1 an der Naht, 0 weg
            }
            // Adjazenz + mehrere Glättungspässe von g (SAUBERE, gleichmäßige Furche statt fleckiger
            // Konvergenz-Patches — die Referenz ist glatt+definiert, nicht mottled).
            const adj = new Array(VC2);
            for (let v = 0; v < VC2; v++) adj[v] = [];
            for (let t = 0; t + 2 < idx.length; t += 3) {
                const a = idx[t],
                    b = idx[t + 1],
                    c = idx[t + 2];
                adj[a].push(b, c);
                adj[b].push(a, c);
                adj[c].push(a, b);
            }
            for (let it = 0; it < 3; it++) {
                const src = gArr.slice();
                for (let v = 0; v < VC2; v++) {
                    const nb = adj[v];
                    if (!nb.length) continue;
                    let a = 0;
                    for (const k of nb) a += src[k];
                    gArr[v] = src[v] * 0.4 + (a / nb.length) * 0.6;
                }
            }
            // Normale entlang des tangentialen g-Gradienten ins Tal kippen (g scharf+analytisch →
            // starker, sauberer Kipp; beide Wände fächern zur Naht auf → die Furche poppt).
            for (let v = 0; v < VC2; v++) {
                const nb = adj[v];
                if (!nb.length) continue;
                const nx = nrm[v * 3],
                    ny = nrm[v * 3 + 1],
                    nz = nrm[v * 3 + 2];
                const px = verts[v * 3],
                    py = verts[v * 3 + 1],
                    pz = verts[v * 3 + 2];
                let gx = 0,
                    gy = 0,
                    gz = 0;
                for (const k of nb) {
                    let dx = verts[k * 3] - px,
                        dy = verts[k * 3 + 1] - py,
                        dz = verts[k * 3 + 2] - pz;
                    const dn = dx * nx + dy * ny + dz * nz;
                    dx -= dn * nx;
                    dy -= dn * ny;
                    dz -= dn * nz;
                    const L = Math.hypot(dx, dy, dz) || 1e-6;
                    const w = gArr[k] - gArr[v];
                    gx += (dx / L) * w;
                    gy += (dy / L) * w;
                    gz += (dz / L) * w;
                }
                const inv = 1 / nb.length;
                let mx = nx + gx * inv * seamAmp,
                    my = ny + gy * inv * seamAmp,
                    mz = nz + gz * inv * seamAmp;
                const L = Math.hypot(mx, my, mz) || 1;
                nrm[v * 3] = mx / L;
                nrm[v * 3 + 1] = my / L;
                nrm[v * 3 + 2] = mz / L;
            }
            seamG = gArr; // an den AO-Pass weiterreichen (die Furche auch verschatten)
        }
        // wahrerguss System A×D — GEBACKENE AO (Substanz, der „flach-einfarbig"-Heiler): die
        // KRÜMMUNG pro Vertex (Konkavität = Mulde → verschattet · Konvexität = Grat → voll) wird
        // in eine Vertex-Farbe gebacken; das Hide-Material multipliziert sie. Das legt den
        // Gelenk-/Achsel-/Schritt-/Falten-Schatten + das Muskel-Relief, das eine glatte Metaball-
        // Haut sonst uniform-plastik lässt — gerechnet aus der Form, nicht gemalt. Geteilt:
        // Avatar + jede Kreatur fließen durch denselben Pass. Konkavität wird über ein paar
        // Pässe in breite Höhlen gestreut (die Achsel ist kein Mikro-Knick — eine weite Mulde).
        let colors = null;
        try {
            const VC = verts.length / 3;
            const nbr = new Array(VC);
            for (let v = 0; v < VC; v++) nbr[v] = [];
            for (let t = 0; t + 2 < idx.length; t += 3) {
                const a = idx[t],
                    b = idx[t + 1],
                    c = idx[t + 2];
                nbr[a].push(b, c);
                nbr[b].push(a, c);
                nbr[c].push(a, b);
            }
            let occ = new Float32Array(VC);
            for (let v = 0; v < VC; v++) {
                const nb = nbr[v];
                if (!nb.length) continue;
                const px = verts[v * 3],
                    py = verts[v * 3 + 1],
                    pz = verts[v * 3 + 2],
                    nx = nrm[v * 3],
                    ny = nrm[v * 3 + 1],
                    nz = nrm[v * 3 + 2];
                let s = 0;
                for (const k of nb) {
                    let dx = verts[k * 3] - px,
                        dy = verts[k * 3 + 1] - py,
                        dz = verts[k * 3 + 2] - pz;
                    const L = Math.hypot(dx, dy, dz) || 1e-6;
                    s += (dx * nx + dy * ny + dz * nz) / L; // >0 = Nachbar VOR der Normale = konkav (Mulde)
                }
                occ[v] = s / nb.length;
            }
            for (let it = 0; it < 4; it++) {
                const src = occ.slice();
                for (let v = 0; v < VC; v++) {
                    const nb = nbr[v];
                    if (!nb.length) continue;
                    let a = 0;
                    for (const k of nb) a += src[k];
                    occ[v] = src[v] * 0.35 + (a / nb.length) * 0.65; // in breite Höhlen streuen
                }
            }
            // ── ANATOMIE-DETAIL-PASS (die Synthese: die Muskel-FURCHE emergiert aus dem Feld) ──
            // Taubin + smin glätten das Muskel-Relief flach (Pec/Lat/Sixpack/Schenkel · Hinterhand/
            // Schulter beim Tier liegen begraben). Hier wird es GEOMETRISCH zurückgeholt: eine
            // UNSCHÄRFE-MASKE verschiebt jeden Vertex entlang der Normale ∝ Konkavität — TAL tiefer,
            // GRAT höher — also genau die Anatomie, die wirklich im Feld liegt, wird geschärft. Dann
            // lesen die MESH-Normalen das Relief (das die glatte Feld-Normale verschluckt) → die
            // Muskeln fangen Licht+Schatten unter JEDER Beleuchtung. occ ist geglättet → es schärft
            // BREITE Anatomie, kein Facetten-Rauschen. Die Furche ist ECHT (im Feld, nicht gemalt).
            // GETEILT: Avatar · jede Kreatur · jedes Tier fließen durch DENSELBEN Pass (die Synergie).
            const sharpen = opts && Number.isFinite(opts.creaseSharpen) ? opts.creaseSharpen : 5.0;
            const wMesh = opts && Number.isFinite(opts.creaseMix) ? opts.creaseMix : 0.62;
            const nSmooth = opts && Number.isFinite(opts.normalSmooth) ? opts.normalSmooth : 3;
            // ENTKOPPELT: die Verschiebung (sharpen, lumpen-anfällig) und der Mesh-Normal-Blend
            // (liest das ECHTE Relief sauber) sind unabhängig. Avatar: sharpen 0 (kein Lumpen) +
            // Mesh-Blend (Sixpack/Pec aus der echten Geometrie, viel geglättet) → sauber UND scharf.
            if (sharpen > 0 || wMesh > 0) {
                if (sharpen > 0) {
                    // 1) UNSCHÄRFE-MASKE — Geometrie entlang der Feld-Normale ∝ Konkavität verschieben.
                    //    Der Betrag ist GRÖSSEN-/AUFLÖSUNGS-SKALIERT (≈2.2 % der Modell-Spanne): ein FESTER
                    //    Betrag zerriss die dünnen Glieder einer kleinen Kreatur bei res 64, während er den
                    //    Avatar bei res 96 gerade trug (GEMESSEN — die Kreatur schmolz). occ·sharpen ∈
                    //    [−1,1] ist der Anteil. Das Feld wird ZUERST geglättet (nur BREITE Anatomie, kein
                    //    Facetten-Rauschen → kein Lumpen-Look).
                    const dCap = span * 0.017;
                    const dispv = new Float32Array(VC);
                    for (let v = 0; v < VC; v++) dispv[v] = Math.max(-1, Math.min(1, occ[v] * sharpen)) * dCap;
                    for (let it = 0; it < 2; it++) {
                        const src = dispv.slice();
                        for (let v = 0; v < VC; v++) {
                            const nb = nbr[v];
                            if (!nb.length) continue;
                            let a = 0;
                            for (const k of nb) a += src[k];
                            dispv[v] = src[v] * 0.4 + (a / nb.length) * 0.6;
                        }
                    }
                    for (let v = 0; v < VC; v++) {
                        const d = dispv[v]; // occ>0 (Tal) → −n nach innen (tiefer) · occ<0 (Grat) → +n raus
                        verts[v * 3] = verts[v * 3] - nrm[v * 3] * d;
                        verts[v * 3 + 1] = verts[v * 3 + 1] - nrm[v * 3 + 1] * d;
                        verts[v * 3 + 2] = verts[v * 3 + 2] - nrm[v * 3 + 2] * d;
                    }
                }
                if (wMesh > 0) {
                    // 2) MESH-NORMALEN aus der geschärften Geometrie (Flächen-Normalen akkumuliert),
                    //    1 Glättungspass gegen Facetten-Wobble, dann mit der sauberen Feld-Normale
                    //    gemischt (Feld = weiche Basis, Mesh = Furchen-Detail) → Relief OHNE Müll.
                    const nm = new Float32Array(VC * 3);
                    for (let t = 0; t + 2 < idx.length; t += 3) {
                        const a = idx[t],
                            b = idx[t + 1],
                            c = idx[t + 2];
                        const ax = verts[a * 3],
                            ay = verts[a * 3 + 1],
                            az = verts[a * 3 + 2];
                        const ex1 = verts[b * 3] - ax,
                            ey1 = verts[b * 3 + 1] - ay,
                            ez1 = verts[b * 3 + 2] - az;
                        const ex2 = verts[c * 3] - ax,
                            ey2 = verts[c * 3 + 1] - ay,
                            ez2 = verts[c * 3 + 2] - az;
                        const fx = ey1 * ez2 - ez1 * ey2,
                            fy = ez1 * ex2 - ex1 * ez2,
                            fz = ex1 * ey2 - ey1 * ex2;
                        nm[a * 3] += fx;
                        nm[a * 3 + 1] += fy;
                        nm[a * 3 + 2] += fz;
                        nm[b * 3] += fx;
                        nm[b * 3 + 1] += fy;
                        nm[b * 3 + 2] += fz;
                        nm[c * 3] += fx;
                        nm[c * 3 + 1] += fy;
                        nm[c * 3 + 2] += fz;
                    }
                    for (let v = 0; v < VC * 3; v += 3) {
                        const L = Math.hypot(nm[v], nm[v + 1], nm[v + 2]) || 1;
                        nm[v] /= L;
                        nm[v + 1] /= L;
                        nm[v + 2] /= L;
                    }
                    let nmS = nm; // Glättungspässe (Nachbar-Mittel) gegen Facetten-Wobble
                    for (let it = 0; it < nSmooth; it++) {
                        const src = nmS;
                        const dst = new Float32Array(VC * 3);
                        for (let v = 0; v < VC; v++) {
                            const nb = nbr[v];
                            let ax = src[v * 3],
                                ay = src[v * 3 + 1],
                                az = src[v * 3 + 2];
                            for (const k of nb) {
                                ax += src[k * 3];
                                ay += src[k * 3 + 1];
                                az += src[k * 3 + 2];
                            }
                            const L = Math.hypot(ax, ay, az) || 1;
                            dst[v * 3] = ax / L;
                            dst[v * 3 + 1] = ay / L;
                            dst[v * 3 + 2] = az / L;
                        }
                        nmS = dst;
                    }
                    for (let v = 0; v < VC; v++) {
                        let fx = nrm[v * 3] * (1 - wMesh) + nmS[v * 3] * wMesh,
                            fy = nrm[v * 3 + 1] * (1 - wMesh) + nmS[v * 3 + 1] * wMesh,
                            fz = nrm[v * 3 + 2] * (1 - wMesh) + nmS[v * 3 + 2] * wMesh;
                        const L = Math.hypot(fx, fy, fz) || 1;
                        nrm[v * 3] = fx / L;
                        nrm[v * 3 + 1] = fy / L;
                        nrm[v * 3 + 2] = fz / L;
                    }
                }
            }
            colors = new Float32Array(VC * 3);
            for (let v = 0; v < VC; v++) {
                // Boden 0.6 + moderate Stärke: ein sanftes Relief (Gelenk/Muskel lesen), das ein
                // DUNKLES Material (Glutwesen) nicht in Schwarz erdrückt (Counter-Shading + Basis
                // stapeln sonst zu viel) — auf hellem Avatar trotzdem klar als Mulden-Schatten.
                // lebendiger-koerper §2½ — STÄRKERES Relief: tiefere Mulden (Muskel-/Gelenk-Furchen
                // + die scharfen Landmark-Kanten lesen) UND ein milder Grat-Highlight (konvexe
                // Muskel-Bäuche fangen Licht) → die Anatomie POPPT, statt im Flach-Einfarb zu
                // ertrinken. Floor 0.58 hält ein DUNKLES Material (Glutwesen) lesbar (kein
                // pechschwarzer Riss); der Grat-Boost ist gedeckelt (kein Über-Glanz).
                const cav = Math.max(0, occ[v]);
                const ridge = Math.max(0, -occ[v]); // konvex = Grat / Muskel-Bauch
                // SEAM-GROOVE verschattet die analytische Muskel-Naht zusätzlich (Schatten IM Tal →
                // der Sixpack/Pec liest auch bei flachem Licht, nicht nur über die Normale).
                const seam = seamG ? seamG[v] * seamG[v] : 0; // quadriert → nur das Naht-ZENTRUM verschattet (dünne Furche, kein breiter Fleck)
                const ao = Math.max(0.56, Math.min(1.1, 1 - cav * 1.35 + ridge * 0.45 - seam * 0.26)); // cav milder + Naht-AO dezent (Normale trägt die Definition) → keine Konvergenz-Flecken
                colors[v * 3] = ao;
                colors[v * 3 + 1] = ao;
                colors[v * 3 + 2] = ao;
            }
        } catch (_e) {
            // Bake fehlgeschlagen → eine neutrale weiße AO setzen, damit das Material-attribute("color")
            // (WebGPU-STRIKT) nie fehlt (Crash-Schutz) und die Haut einfach unverschattet bleibt.
            colors = new Float32Array((verts.length / 3) * 3).fill(1);
        }
        return { positions: verts, indices: idx, normals: nrm, colors: colors };
    }
    root.__bakeSkinGeometry = bakeSkinGeometry;
})(typeof self !== "undefined" ? self : typeof globalThis !== "undefined" ? globalThis : this);

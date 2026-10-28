class AnazhRealm_klang {
    // ===== ATLAS · Klang — Lofi-Symphonie · Umwelt-Klang · Resonanz-Pings =====
    // ### anazhSymphony ###
    // Web Audio: EIN Kontext, EIN Master (UMWELT.masterBasis × Master-Regler). Darauf: die Lofi-Musik (klang:GENRES)
    // und die KLANG-WELT (klang:UMWELT) — Wind · Laub · Ufer · Fluss · Fall · Regen · Glut · Vögel · Grillen aus der
    // Lage am Ohr, der Tier-Ruf aus dem Körper. Der AudioContext braucht eine User-Geste (Autoplay-Policy); headless
    // umgeht `--autoplay-policy=no-user-gesture-required` das.
    initSymphony() {
        const s = this.state.symphony;
        if (s.enabled) return true;
        const AudioCtor = typeof AudioContext !== "undefined" ? AudioContext : window.webkitAudioContext;
        if (!AudioCtor) {
            this.log("Web Audio API nicht verfügbar — Symphonie bleibt stumm", "WARNING");
            return false;
        }
        const UM = AnazhRealm._umweltGesetz(); // Kern-Pflicht VOR dem Kontext: kein halber Graph
        const ctx = new AudioCtor();
        if (ctx.state === "suspended" && typeof ctx.resume === "function") {
            ctx.resume();
        }
        // Master-Bus: UMWELT.masterBasis × masterVolume (0..1); der UI-Schieber zieht live nach (slidersInitDOM).
        const masterGain = ctx.createGain();
        const masterVol = typeof s.masterVolume === "number" ? s.masterVolume : 1.0;
        masterGain.gain.value = UM.UMWELT.masterBasis * masterVol;
        // Die Spitzen-Wand hinter dem Master (klang:UMWELT.spitze, Wirt UND Lab): bis −6 dBFS exakt linear, darüber
        // weich gegen −1 dBFS — das Knistern der Glut auf Armlänge und der Sturm im Wald clippen nicht mehr.
        const spitze = UM.kern.umweltSpitze(ctx);
        masterGain.connect(spitze.eingang);
        spitze.ausgang.connect(ctx.destination);
        s.spitze = spitze;

        // W4 V2 — die Lofi-Pad-Schicht (klang:GENRES).
        s.lofi = this._buildLofiLayer(ctx, masterGain);
        // Welle 5 Klang — die Klang-Welt (klang:UMWELT) auf ihrem Bus.
        s.umwelt = this._umweltKlangBauen(ctx, masterGain, UM);
        // Die Welle des Abrollens (klang:FAHRT, je Kontext einmal) backt beim Einschalten, nie beim Aufsitzen in Fahrt.
        UM.kern.fahrtWelle(ctx);

        s.ctx = ctx;
        s.masterGain = masterGain;
        s.enabled = true;
        this.log("anazhSymphony aktiviert: Lofi + Klang-Welt live", "INFO");
        return true;
    }

    disposeSymphony() {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx) return;
        try {
            if (s.umwelt && s.umwelt.graph) s.umwelt.graph.stopAlle();
            if (s.umwelt && s.umwelt.werkstatt) s.umwelt.werkstatt.terminate();
            s.ctx.close();
        } catch (err) {
            this.log(`Symphonie-Dispose-Fehler: ${err.message}`, "WARNING");
        }
        s.ctx = null;
        s.enabled = false;
        // Die Lofi-Oszillatoren und die Umwelt-Quellen sind transient (auto-stop); Gain + Filter räumt der GC
        // mit dem geschlossenen ctx.
        s.lofi = null;
        s.umwelt = null;
        s.fahrt = null; // die Stimme der Fahrt starb mit dem Kontext
        s.masterGain = null;
        s.spitze = null;
    }

    // ═══ DIE KLANG-WELT (Welle 5 Klang) ═══
    // Der Wirt ist das Sinnesorgan, das klang-Gesetzbuch das Gesetz: `_umweltLage` misst am Ohr, was dort IST
    // (Wetter-Feld + dieselbe wandernde Böe, die das Gras biegt · Kronen-Deckung aus dem Pflanz-Gesetz · Wasser im
    // Hör-Ring (Ufer) · der Kanal des Flusses · Wasserfälle der Region · Glut-Bauten · Sonne · Leben · Jahreszeit), `umweltMischung` macht daraus
    // Pegel/Filter/Panorama, `umweltGraph` spielt es — Lab und Linse bauen denselben Graphen. Kosten je Frame:
    // UMWELT.ohr.probenJeFrame Ring-Proben, die Glut aus dem Verzeichnis (`_blockerMit("glut")`), die Mischung im Takt ohr.mischSek;
    // Quellen laufen nur, solange ihre Stimme hörbar ist. Nie die Weltgröße. Gerechnet wird in der KLANG-WERKSTATT
    // (`_klangWerkstattBooten`, ein Worker): der Spiel-Takt rechnet keinen Sample. Linse: gate:klang-zensus.
    _umweltKlangBauen(ctx, masterGain, UM) {
        const K = UM.kern;
        const O = UM.UMWELT.ohr;
        const bus = ctx.createGain();
        const s = this.state.symphony;
        bus.gain.value = typeof s.creaturePingVolume === "number" ? s.creaturePingVolume : 1.0;
        bus.connect(masterGain);
        const um = { kern: K, bus, werkstatt: null, bestellt: 0, geliefert: 0, rufeBestellt: 0, rufeGespielt: 0 };
        um.werkstatt = this._klangWerkstattBooten(um);
        // Der Hör-Ring: Mitte + ohr.radien × ohr.richtungen, Einheits-Richtungen fest (Welt-Achsen).
        const punkte = [{ r: 0, ux: 0, uz: 0 }];
        for (const r of O.radien) {
            for (let k = 0; k < O.richtungen; k++) {
                const a = (k / O.richtungen) * Math.PI * 2;
                punkte.push({ r, ux: Math.sin(a), uz: Math.cos(a) });
            }
        }
        const seedStr = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + ":umwelt";
        let saat = 0;
        for (let i = 0; i < seedStr.length; i++) saat = (saat * 31 + seedStr.charCodeAt(i)) >>> 0;
        // Eine hörbare Stimme ohne Puffer bestellt ihr Paket bei der Werkstatt; die Antwort nimmt der Graph auf.
        const liefern = (name) => {
            um.bestellt++;
            if (um.werkstatt) um.werkstatt.postMessage({ typ: "stimme", name });
        };
        return Object.assign(um, {
            graph: K.umweltGraph(ctx, bus, liefern),
            ring: { punkte, nass: new Uint8Array(punkte.length), tempo: new Float32Array(punkte.length), idx: 0 },
            letzteMischung: -Infinity,
            folge: 0, // der Teil des Misch-Takts im nächsten Bild (1 Mischung · 2 Graph · 3 Tier-Rufe, `_umweltKlangTick`)
            rufDt: 0,
            rufSaat: saat || 1,
            lage: null,
            mix: null,
        });
    }

    // DIE KLANG-WERKSTATT: ein eigener Worker mit dem klang-Gesetzbuch (importScripts, ?v=) rechnet die Stimmen-Pakete
    // (Texturen + Eichung, `umweltPaket`) und die Tier-Rufe (`tierRufPuffer`); die Puffer reisen zero-copy zurück
    // (Lehre 24). Der Haupt-Thread nimmt auf und spielt. Fällt die Werkstatt aus, schweigt die Klang-Welt LAUT
    // (WARNING) — nie eine Ersatz-Rechnung im Spiel-Takt.
    _klangWerkstattBooten(um) {
        const base = typeof window !== "undefined" && window.location ? window.location.href : "";
        const kernUrl = new URL("klang-core.js?v=" + AnazhRealm.VERSION, base).href;
        const boot =
            "importScripts(" +
            JSON.stringify(kernUrl) +
            ");(function " +
            AnazhRealm._klangWerkstattSchale.toString() +
            ")();";
        let w = null;
        try {
            w = new Worker(URL.createObjectURL(new Blob([boot], { type: "text/javascript" })), { name: "klang" });
        } catch (e) {
            this.log(`Klang-Werkstatt startet nicht (${e && e.message}) — die Klang-Welt schweigt`, "WARNING");
            return null;
        }
        w.onerror = (e) => {
            this.log(
                `Klang-Werkstatt fiel aus (${(e && e.message) || "Worker-Fehler"}) — die Klang-Welt schweigt`,
                "WARNING"
            );
        };
        w.onmessage = (ev) => {
            const s = this.state.symphony;
            const m = ev.data;
            if (!m || s.umwelt !== um || !s.ctx) return; // abgebaut, während die Werkstatt rechnete
            if (m.typ === "stimme" && m.paket) {
                if (um.graph.aufnehmen(m.paket)) um.geliefert++;
            } else if (m.typ === "ruf" && m.tex) {
                if (um.kern.tierRufSpielen(s.ctx, um.bus, m.ruf, m.tex)) um.rufeGespielt++;
            }
        };
        return w;
    }

    // Der Rumpf der Werkstatt — läuft als Quelltext im Worker (nach importScripts des klang-Kerns), greift auf nichts
    // außerhalb ihres eigenen Rumpfs zu.
    static _klangWerkstattSchale() {
        const W = globalThis;
        const K = W.__klangCore;
        W.onmessage = (ev) => {
            const m = ev.data;
            if (!m || !K) return;
            if (m.typ === "stimme") {
                const p = K.umweltPaket(m.name);
                W.postMessage({ typ: "stimme", paket: p }, p ? p.texturen.map((t) => t.daten.buffer) : []);
            } else if (m.typ === "ruf") {
                const tex = K.tierRufPuffer(m.ruf);
                W.postMessage({ typ: "ruf", ruf: m.ruf, tex }, [tex.daten.buffer]);
            }
        };
    }

    // DER EINE UMWELT-TAKT (aus symphonyTick, jeden Frame): Proben fortsetzen (konstant je Frame), im Misch-Takt die
    // Lage, im nächsten Bild die Mischung, dann der Graph, dann die Tier-Rufe — je Bild höchstens EIN Teil des Misch-Takts
    // (klang.K5: alle in einem Bild trugen jedes sechste Bild über 0,2 ms, diag-klang-zensus --takt).
    _umweltKlangTick() {
        const s = this.state.symphony;
        const um = s.umwelt;
        if (!um || !s.ctx || !this.state.playerMesh) return;
        const p = this.state.playerMesh.position;
        const O = AnazhRealm._umweltGesetz().UMWELT.ohr;
        this._umweltRingProbe(um, p.x, p.z, O.probenJeFrame);
        const jetzt = s.ctx.currentTime;
        const teil = um.folge;
        if (teil) {
            um.folge = (teil + 1) % 4;
            if (teil === 1) um.mix = um.kern.umweltMischung(um.lage);
            else if (teil === 2) {
                um.graph.anwenden(um.mix, jetzt);
                this._untertitelStimmen(um.graph);
            } else this._tierRufTakt(um.rufDt);
            return;
        }
        if (jetzt - um.letzteMischung < O.mischSek) return;
        um.rufDt = Number.isFinite(um.letzteMischung) ? Math.min(1, jetzt - um.letzteMischung) : 0;
        um.letzteMischung = jetzt;
        um.lage = this._umweltLage();
        um.folge = 1;
    }

    // Der Hör-Ring: je Frame `n` Punkte (rund um die Uhr), je Punkt nass (`_nassAt`) und Strömung (die EINE
    // Strömungs-Quelle `_waterFlowAt`: ein fließender Punkt ist nie Ufer). Die Punkte wandern mit dem Ohr.
    _umweltRingProbe(um, px, pz, n) {
        const R = um.ring;
        for (let k = 0; k < n; k++) {
            const i = R.idx;
            R.idx = (R.idx + 1) % R.punkte.length;
            const pt = R.punkte[i];
            const x = px + pt.ux * pt.r;
            const z = pz + pt.uz * pt.r;
            const nass = this._nassAt(x, z);
            R.nass[i] = nass ? 1 : 0;
            const fl = nass ? this._waterFlowAt(x, z) : null;
            R.tempo[i] = fl ? Math.hypot(fl.x, fl.z) : 0;
        }
    }

    // Die Brenn-Fläche eines Baus (m²): Σ der Grundflächen seiner Teile mit Material „glut" (Kugel und Zylinder als
    // Ellipse · Quader als Rechteck · sonst die halbe Box) × Bau-Skala² — je Bauplan gemerkt. Ein Bett-Feuer knistert
    // mit seiner BRENNENDEN Fläche (klang:UMWELT.stimmen.glut, Bezug das Glutbett der Studio-Feuerstelle); die Höhe
    // einer Glut-Hülle ist Flammen-Luft, kein Brennstoff — bis 06.10. las das Ohr ihr Volumen (die Feuerstelle der
    // Architektur-Welle, 0,7 × 0,36 × 0,7 m, fiel damit −9,9 dB unter das Lagerfeuer, Dorf −36,4 dB).
    _glutFlaeche(entry) {
        const memo = this._glutFlaecheMemo || (this._glutFlaecheMemo = new Map());
        let a = memo.get(entry.type);
        if (a === undefined) {
            a = 0;
            const bp = this.state.blueprints && this.state.blueprints[entry.type];
            const parts = bp && Array.isArray(bp.parts) ? bp.parts : [];
            for (const pt of parts) {
                if (!pt || pt.material !== "glut" || !pt.size) continue;
                const sx = +pt.size.x || 0;
                const sz = +pt.size.z || 0;
                if (pt.shape === "sphere" || pt.shape === "cylinder") a += (Math.PI / 4) * sx * sz;
                else if (pt.shape === "box") a += sx * sz;
                else a += 0.5 * sx * sz;
            }
            memo.set(entry.type, a);
        }
        const sk = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
        return a * sk * sk;
    }

    // DER RAUM AM OHR (klang.K3, der EINE Richtungs-Weg jeder gerichteten Stimme und jedes Rufs): das Panorama eines
    // Abstands (dx, dz) zum Ohr = seine Richtung auf dem waagerechten RECHTS-Vektor der Kamera (−1 links … +1 rechts), am
    // Ohr selbst und ohne Kamera mittig. Linse: diag-klang-zensus (Ra).
    _umweltPanorama() {
        const cam = this.state.camera;
        const v = this._umweltBlick || (this._umweltBlick = new THREE.Vector3());
        if (cam) cam.getWorldDirection(v);
        const l = cam ? Math.hypot(v.x, v.z) : 0;
        const [rx, rz] = l > 1e-6 ? [-v.z / l, v.x / l] : [0, 0];
        return (dx, dz, d = Math.hypot(dx, dz)) => (d > 1e-3 ? Math.max(-1, Math.min(1, (dx * rx + dz * rz) / d)) : 0);
    }

    // DIE NÄCHSTE GLUT AM OHR (px, pz) → { d, flaeche, pan } — das Verzeichnis „glut" (`_blockerMit`: jeder Eintrag mit Brenn-Fläche,
    // gestempelt beim Eintritt; bis K11 lief ein Umlauf über alle Bauten) und der Brand des Felds — jenseits der Hörweite schweigt
    // das Gesetz. Die EINE Quelle des Knisterns (`_umweltLage`, die Linse des Brands).
    _glutAmOhr(px, pz, pan) {
        const glut = { d: Infinity, flaeche: 0, pan: 0 };
        for (const e of this._blockerMit("glut")) {
            if (!e.position) continue;
            const d = Math.hypot(e.position.x - px, e.position.z - pz);
            if (d < glut.d) {
                glut.d = d;
                glut.flaeche = this._glutFlaeche(e);
                glut.pan = pan(e.position.x - px, e.position.z - pz);
            }
        }
        // DER BRAND (stoffe.K2#2) knistert aus demselben Zustand, aus dem er leuchtet: die nächste glühende Zelle des Felds (der
        // Abstand zu ihrer Fläche, 0 in ihr), ihre Brenn-Fläche die Zelle × Glut (`brandFeld`, `_tickBrand`)
        const bf = this.state.brandFeld;
        if (bf && bf.size) {
            const cs = AnazhRealm.LIFE_FIELD.cell;
            for (const b of bf.values()) {
                if (!(b.glut > 0)) continue;
                const [x0, z0] = [b.cx * cs, b.cz * cs];
                const d = Math.hypot(Math.max(x0 - px, 0, px - x0 - cs), Math.max(z0 - pz, 0, pz - z0 - cs));
                if (d < glut.d) {
                    glut.d = d;
                    glut.flaeche = cs * cs * b.glut;
                    glut.pan = pan(x0 + cs / 2 - px, z0 + cs / 2 - pz);
                }
            }
        }
        return glut;
    }

    // DIE LAGE AM OHR — die Eingabe des Klang-Gesetzes (umweltMischung). Alles gelesen, nichts erfunden: der
    // EINE Wind am Ohr (`_windAt`), die Kronen-Deckung der STEHENDEN Bäume (die
    // Kronen-Karte `_kronenStreuAt` — dieselben Bytes, aus denen Boden und Nah-Wiese den Wald lesen; das Kronenlicht-
    // Feld der Platzierung sagt nur, wo Bäume wachsen DÜRFEN), Sonne (Tageszeit), Jahres-Phase, die singenden Vögel (ihre
    // Leiber, `state.voegel`), der Hör-Ring (Ufer), der Kanal des Flusses, der nächste Wasserfall der Region, die nächste Glut (Brenn-Fläche)
    // — und die ANTWORT der Wertung
    // (`_tatAntwortAm`: das abklingende δ der Tat, die hier am stärksten wirkt; affekt K1).
    _umweltLage() {
        const um = this.state.symphony.umwelt;
        const pm = this.state.playerMesh;
        if (!um || !pm) return null;
        const px = pm.position.x;
        const pz = pm.position.z;
        const wf = this._weatherFieldFor(this.state.weather);
        const wind = this._windAt(px, pz, this._bildZeit);
        const pan = this._umweltPanorama();
        // Der Ring: stilles Wasser (Ufer) — Abstand, Anteil, Richtung; ein fließender Punkt zählt nie als Ufer.
        const R = um.ring;
        const ufer = { d: Infinity, anteil: 0, pan: 0 };
        let nStill = 0;
        let wU = 0;
        let panU = 0;
        for (let i = 0; i < R.punkte.length; i++) {
            if (!R.nass[i] || R.tempo[i] > 0) continue;
            const pt = R.punkte[i];
            const w = 1 / Math.max(1, pt.r);
            nStill++;
            if (pt.r < ufer.d) ufer.d = pt.r;
            wU += w;
            panU += pan(pt.ux, pt.uz) * w;
        }
        ufer.anteil = nStill / R.punkte.length;
        if (wU > 0) ufer.pan = panU / wU;
        // DER FLUSS aus dem Gesetz des Kanals (klang.K2): der nächste RAND am Ohr (`_hydroDistAt`, gelaende-core `flussRand` über
        // die 3×3-Buckets, ≥ 32 m weit), die Richtung aus dem Gefälle seines Abstands, die Strömung an der Mittellinie aus der
        // EINEN Strömungs-Quelle `_waterFlowAt` — dieselben Kanal-Segmente, deren Fluss das Wasser-Bild treibt. Bis kk2-ufer las
        // der Fluss den Hör-Ring (4 Radien × 8 Richtungen): ein schmaler Bach fiel zwischen die Punkte, im Gang zum Bach der
        // Mess-Wiese schwieg er bei 13–14 m und 23–27 m Abstand, während das Bild ihn zeigte (diag-klang-zensus --gesehen r 0,68).
        const fluss = { d: Infinity, tempo: 0, pan: 0 };
        const rand = this._hydroDistAt(px, pz);
        if (rand.dist < Infinity) {
            const gx = this._hydroDistAt(px + 1, pz).dist - rand.dist;
            const gz = this._hydroDistAt(px, pz + 1).dist - rand.dist;
            const g = Math.hypot(gx, gz) || 1;
            const fl = this._waterFlowAt(px - (gx / g) * rand.dist, pz - (gz / g) * rand.dist);
            if (fl) {
                fluss.d = Math.max(0, rand.dist - rand.halfW);
                fluss.tempo = Math.hypot(fl.x, fl.z);
                fluss.pan = pan(-gx, -gz);
            }
        }
        // Der nächste Wasserfall der Region (wenige je Kachel).
        const fall = { d: Infinity, hoehe: 0, pan: 0 };
        const h = this._hydroFor(px, pz);
        const falls = h && Array.isArray(h.waterfalls) ? h.waterfalls : [];
        for (const wfall of falls) {
            const d = Math.hypot(wfall.x - px, wfall.z - pz);
            if (d < fall.d) {
                fall.d = d;
                fall.hoehe = Math.max(0, wfall.topY - wfall.bottomY);
                fall.pan = pan(wfall.x - px, wfall.z - pz);
            }
        }
        // Die singenden Vögel — die Leiber, die `_vogelTakt` zeichnet (`state.voegel`): Abstand zum Ohr und Richtung je Leib.
        const voegel = [];
        for (const v of this.state.voegel || []) {
            const dh = Math.hypot(v.x - px, v.z - pz);
            voegel.push({
                d: Math.hypot(dh, v.y - pm.position.y),
                pan: pan(v.x - px, v.z - pz),
            });
        }
        const glut = this._glutAmOhr(px, pz, pan);
        return {
            // der EINE Wind am Ohr (`_windAt` auf der Bild-Uhr, A9): die Stärke am Ort und die wandernde Böe — dieselben Zahlen
            // (WIND_BOE) und dieselbe Richtung wie `_windSwayOffset` im Shader: was das Gras biegt, rauscht im Ohr
            windFeld: wind.staerke,
            boe: wind.boe,
            deckung: this._kronenStreuAt(px, pz),
            regen: wf.rain,
            sonne: this._sonnenRichtung().y, // die Sonnenhöhe (sin) der EINEN Tag-Achse, mit der Neigung der Bahn
            // die Wärme der Grillen (stoffe.K3): das EINE Temperatur-Feld an der Höhe des Spielers zu Saison und Uhr der Welt, mit
            // der Trägheit ihres Lebensraums (klang:UMWELT.stimmen.grille.traegTage, der Boden ihrer Röhre) — die Sommernacht der
            // Wiese zirpt, über dem gefrorenen Bergsee schweigen sie
            temperatur: this._temperaturAt(pm.position.y, AnazhRealm._umweltGesetz().UMWELT.stimmen.grille.traegTage),
            voegel,
            ufer,
            fluss,
            fall,
            glut,
            antwort: this._tatAntwortAm(px, pz),
        };
    }

    // DER TIER-RUF — die Stimme folgt dem Körper (klang:UMWELT.tier): Länge = `_creatureKoerperLaenge`, Abstand und
    // Richtung zum Ohr, die Stimmung aus dem Innenleben (oder vom Rufer gesetzt). Zählt jeden Ruf (headless messbar);
    // nur ein hörbarer Ruf (über der Hörschwelle, hinter der Symphonie-Wand) geht an die Klang-Werkstatt, die ihn
    // rechnet — gespielt wird ihre Antwort (`_klangWerkstattBooten`).
    _tierRuf(creature, stimmung) {
        // RUF ← LEIB (klang.K1): es ruft nur ein Leib der Welt (`state.creatures`) — ein Ruf ohne Körper ist keiner
        if (!creature || !(this.state.creatures || []).includes(creature)) return null;
        const s = this.state.symphony;
        s.tierRufe = (s.tierRufe || 0) + 1;
        const um = s.umwelt;
        if (!s.enabled || !s.ctx || !um || !um.werkstatt || !creature.position) return null;
        const pm = this.state.playerMesh;
        const dx = pm ? creature.position.x - pm.position.x : 0;
        const dz = pm ? creature.position.z - pm.position.z : 0;
        const d = Math.hypot(dx, dz);
        if (!(um.kern.tierRufPegel(d) >= AnazhRealm._umweltGesetz().UMWELT.hoerschwelleDb)) return null;
        const ruf = {
            laengeM: this._creatureKoerperLaenge(creature),
            stimmung: stimmung || this._tierStimmung(creature),
            d,
            pan: this._umweltPanorama()(dx, dz),
            saat: (um.rufSaat = (Math.imul(um.rufSaat, 1664525) + 1013904223) >>> 0),
        };
        um.rufeBestellt++;
        um.werkstatt.postMessage({ typ: "ruf", ruf });
        this._untertitel("ruf", ruf.stimmung, creature.userData && creature.userData.name, ruf.pan);
        return ruf;
    }

    // Die Stimmung des Rufs aus dem Innenleben: Freude/Hoffnung/Staunen → freude, Trauer → trauer, Chaos → furcht,
    // sonst (Frieden, schwach) → ruhe.
    _tierStimmung(creature) {
        const e = creature && creature.userData && creature.userData.emotions;
        if (!e) return "ruhe";
        let best = "peace";
        let v = 0.15;
        for (const k of ["joy", "hope", "awe", "sorrow", "chaos", "peace"]) {
            if ((e[k] || 0) > v) {
                v = e[k];
                best = k;
            }
        }
        return best === "sorrow" ? "trauer" : best === "chaos" ? "furcht" : best === "peace" ? "ruhe" : "freude";
    }

    // Die Tiere rufen von selbst: je Kreatur im Hör-Radius ein Poisson-Ruf mit der Rate ihrer Stimmung
    // (UMWELT.tier.rufProMin). Kosten = die Kreaturen-Zahl (Populations-Deckel), nie die Weltgröße.
    _tierRufTakt(dt) {
        if (!(dt > 0)) return;
        const s = this.state.symphony;
        const um = s.umwelt;
        const T = AnazhRealm._umweltGesetz().UMWELT.tier;
        const pm = this.state.playerMesh;
        const cs = this.state.creatures;
        if (!um || !pm || !Array.isArray(cs)) return;
        for (const c of cs) {
            if (!c || !c.position) continue;
            if (Math.hypot(c.position.x - pm.position.x, c.position.z - pm.position.z) > T.hoerweiteM) continue;
            const stimmung = this._tierStimmung(c);
            um.rufSaat = (Math.imul(um.rufSaat, 1664525) + 1013904223) >>> 0;
            if (um.rufSaat / 4294967296 < ((T.rufProMin[stimmung] || 0) / 60) * dt) this._tierRuf(c, stimmung);
        }
    }

    // DER KLANG-ZENSUS (Linse gate:klang-zensus): je Umwelt-Stimme Gesetz · Pegel · läuft; dazu die Lage am Ohr und RUF ← LEIB
    // (klang.K1): die Vögel, die das Ohr jetzt hört, und die gezeichneten (der Pool trägt je Vogel seine Teile).
    _klangZensus() {
        const um = this.state.symphony && this.state.symphony.umwelt;
        if (!um) return null;
        const P = this.state.vogelPool;
        const je = AnazhRealm._vogelGesetz().V.leib.teile.length + 2;
        return {
            lage: um.lage,
            stimmen: um.graph.zensus(),
            leiber: { gehoert: this._umweltLage().voegel.length, gezeichnet: P ? P.mesh.count / je : 0 },
            tierRufe: this.state.symphony.tierRufe || 0,
            werkstatt: {
                laeuft: !!um.werkstatt,
                bestellt: um.bestellt,
                geliefert: um.geliefert,
                rufeBestellt: um.rufeBestellt,
                rufeGespielt: um.rufeGespielt,
            },
        };
    }

    // Das Ding im Slot klingt nach seiner stärksten Substanz-Achse — das Gesetz klang:SUBSTANZ.inventar (Schwelle,
    // Tonhöhe je Achse, Drossel gegen das Wischen) über den EINEN Ereignis-Chokepoint `_substanzKlang`.
    playInventoryHoverPing(tags) {
        if (!tags) return;
        const s = this.state.symphony;
        if (!s || !s.enabled || !s.ctx) return;
        const now = performance.now() / 1000;
        const abstand = AnazhRealm._umweltGesetz().kern.SUBSTANZ.inventar.abstandSek;
        if (now - (this.state.inventoryHoverLast || 0) < abstand) return;
        this.state.inventoryHoverLast = now;
        this._substanzKlang("inventar", tags);
    }

    // DER TREFFER IST EIN STOFF-PAAR (halten.K2 Staffel 2): das Werk, das trifft, und der Stoff, den es trifft — je eine
    // Zeile der Stoff-Tafel (`_stoff`). Ihr Klang ist das Gesetz klang:trefferPaar am Master, ihre Funken das Stoff-Gesetz
    // (`_funken`, am Ort `ort` mit dem Energie-Anteil e ∈ [0,1]). Leser: der Hieb (Tier und Bauwerk), der Pfeil und der Stoß
    // des Wagens — vorher klang jeder Treffer nur nach den Tags des Ziels (der Hirsch nach seinem Spawn-Rumpf aus Stein,
    // das Bauwerk gar nicht). Die Marke `state._trefferPaar` nennt das letzte Paar (headless messbar).
    _trefferPaar(waffe, ziel, ort, e) {
        const a = this._stoff(waffe);
        const b = this._stoff(ziel);
        if (!a || !b) return false;
        const funken = this._funken(a, b, ort, e);
        const klang = this._substanzKlang("treffer", a, b);
        this.state._trefferPaar = { waffe: a.name, ziel: b.name, funken, klang };
        return klang;
    }

    // DER EINE EREIGNIS-KLANG-CHOKEPOINT: art (treffer · singen · abschied · wasser · inventar) × Tags → die Einmal-
    // Quelle des klang-Gesetzbuchs am Master; der Treffer klingt aus dem Paar zweier Zeilen der Stoff-Tafel (`tags` die des
    // Werks, `zu` die des Getroffenen, klang:trefferPaar). Stumm ohne Symphonie. Was ein TIER tut (Auftrag, Stufe, Spawn, Tod), klingt nicht hier, sondern
    // mit seiner Stimme (`_tierRuf`).
    _substanzKlang(art, tags, zu) {
        const s = this.state.symphony;
        if (!s || !s.enabled || !s.ctx || !s.masterGain) return false;
        const K = AnazhRealm._umweltGesetz().kern;
        const q =
            art === "treffer"
                ? K.trefferPaar(s.ctx, s.masterGain, tags, zu)
                : K.substanzKlang(s.ctx, s.masterGain, art, tags || {});
        if (q) this._untertitel("substanz", art, art === "treffer" ? `${tags.name} auf ${zu.name}` : null, 0);
        return !!q;
    }

    // ═══ SCHRITT-KLANG ═══
    // Material-getriebene Schritt-/Lande-Klänge, asset-frei: Quelle ist IMMER ein Rausch-Burst, das
    // MATERIAL ist der Filter (Tabelle AnazhRealm.SCHRITT_KLANG). Rein RENDER-seitig (liest Gang-Phase,
    // isInAir, _fieldVy) — die fixe Sim liest und schreibt hier NIE. Linse: gate:schritt-klang.

    // DIE EINE COMPOUND-TAKT-BASIS: der zeit-getriebene Gang der Compound-/Nicht-Rig-Seelen (lokal +
    // Peer) liest EINE Kern-Zahl (fx.bewegung.schritt.taktCompound), skaliert über die Emotions-Brücke
    // (freq-Ratio des koerper-Bewegungsprofils; ohne Emotionen Faktor 1). Fail-closed (Kern-Pflicht).
    _compoundTaktHz(emotions) {
        let hz = AnazhRealm._bewegungsBlock("schritt", ["taktCompound", "klangTempoMin"]).taktCompound;
        if (emotions) {
            const mpv = this._koerperMotionProfile(true, emotions);
            const mpr = mpv ? this._koerperMotionProfile(true, null) : null;
            if (mpv && mpr && Number.isFinite(mpv.freq) && mpr.freq > 0) hz *= mpv.freq / mpr.freq;
        }
        return hz;
    }

    // DER EINE SCHRITT-TICK (aus animatePlayerSoul direkt nach dem Gang-Tick — keine eigene Uhr): je
    // Halbzyklus (π) der Gang-Phase EIN Schritt, nur geerdet + über der Tempo-Schwelle; Luft/Schwimmen/
    // Stand re-ankern den Zähler stumm (der Hit-Stop friert mit). Die LANDUNG ist die des Leib-Lösers: sein Aufprall-Ereignis
    // (`s._aufprall` aus `_loopPhysicsSync`, am Boden und ins Wasser — ein Bild mit zwei Schritten verliert keins, klang.K4); es
    // klingt, wenn der Leib steht (eins aus einer früheren Luft-Strecke verfällt) — NIE über _landImpactPending (die Ego-Kamera
    // nullt ihn vorher, der Kampf-Hit füttert ihn mit), nie über einen eigenen Fall-Zähler (er hörte 0,16–0,33 m/s zu wenig).
    // Schwelle = die EINE Konstante LAND_DIP_MIN_SPEED.
    _schrittKlangTick(halter, speed, underwater, mesh) {
        const s = this.state;
        if (!halter || !mesh) return;
        const k =
            s._schrittKlang ||
            (s._schrittKlang = {
                halb: null, // verankerter Halbzyklus-Index (floor(phase/π))
                aufprall: s._aufprall ? s._aufprall.n : 0, // das zuletzt gehörte Aufprall-Ereignis des Leib-Lösers
                schritte: 0, // Ereignis-Zähler (Linsen-Messpunkte, render-only)
                landungen: 0,
                letzter: null, // Parameter des letzten Ereignisses
            });
        const grounded = s.isInAir !== true;
        const A = s._aufprall;
        if (A && A.n !== k.aufprall) {
            k.aufprall = A.n;
            if (grounded && A.tempo >= AnazhRealm.LAND_DIP_MIN_SPEED) this._schrittKlangEreignis(mesh, true, A.tempo);
        }
        const T = AnazhRealm.SCHRITT_KLANG;
        const phase = Number.isFinite(halter.walkPhase) ? halter.walkPhase : 0;
        // der Ton fällt, wenn ein Fuß aufsetzt: bei der Phase des Aufsetzens des Gang-Gesetzes (je Bein um π versetzt)
        const auf = halter._gait && Number.isFinite(halter._gait.auf) ? halter._gait.auf : 0;
        const halb = Math.floor((phase - auf) / Math.PI);
        if (!grounded || underwater || !(speed > T.tempoMin) || k.halb === null || halb < k.halb) {
            k.halb = halb; // ankern OHNE Ereignis (Stand/Luft/Schwimmen/Phasen-Reset)
            return;
        }
        let n = halb - k.halb;
        if (n <= 0) return;
        k.halb = halb;
        if (n > T.maxProTick) n = T.maxProTick; // Frame-Hänger → kein Burst-Schwall
        for (let i = 0; i < n; i++) this._schrittKlangEreignis(mesh, false, 0);
    }

    // SCHRITT-EREIGNIS (Chokepoint für Schritt UND Landung): zählt IMMER (headless messbar), holt das
    // Material am FUSS (position.y − FOOT_OFFSET), die Stimme nur hinter der s.enabled-Wand.
    _schrittKlangEreignis(mesh, landung, impact) {
        const k = this.state._schrittKlang;
        if (!k) return;
        const fussY = mesh.position.y - AnazhRealm.PLAYER_FOOT_OFFSET;
        const material = this._schrittMaterialAt(mesh.position.x, mesh.position.z, fussY);
        const param = this._schrittKlangParams(material, landung, impact);
        if (landung) k.landungen++;
        else k.schritte++;
        k.letzter = param;
        const sym = this.state.symphony;
        if (sym && sym.enabled && sym.ctx && sym.masterGain && this._playSchrittOneShot(param))
            this._untertitel("schritt", landung ? "landung" : "schritt", param.material, 0);
    }

    // Der Stoff am Fuß — NASS SCHLÄGT FEST: unter dem Wasserspiegel (watender Ufer-Schritt) platscht er. Das EINE Urteil
    // „ist hier Wasser" (`_nassAt`, der Fuß ist sein Grund), sonst der Stoff, der den Fuß trägt (`_kontaktStoffAt`: die
    // Auflage eines Baus, das Eis des gefrorenen Spiegels, die Wiese, der Boden).
    _schrittMaterialAt(x, z, y) {
        const stoff = this._kontaktStoffAt(x, z, y);
        return stoff !== "eis" && this._nassAt(x, z, 0.02, y) ? "wasser" : stoff;
    }

    // Stoff → Timbre aus der Klang-Spalte seiner Zeile der Stoff-Tafel (`_stoff`, stoffe.K1; ein eigener Stoff klingt wie sein
    // nächster Verwandter). Die LANDUNG ist derselbe Burst, STÄRKER mit dem Aufprall-Tempo (√(2gh)): vom Pegel des Schritts
    // linear bis zur Decke beim Aufprall landVollMs — jeder Stoff steigt über die ganze Spanne (bis klang.K4 deckelte ein
    // Zusatz ab 11,7 m/s: 12 m klangen wie 8 m), länger und tiefer.
    _schrittKlangParams(material, landung, impact) {
        const T = AnazhRealm.SCHRITT_KLANG;
        const zeile = this._stoff(material);
        if (!zeile) return null; // der Melder hat gesprochen (`_stoff`), der Fuß schweigt
        const m = zeile.klang;
        const p = {
            material: zeile.name,
            filter: m.filter,
            freq: m.freq,
            q: m.q,
            dauer: m.dauer,
            gain: m.gain,
            landung: !!landung,
        };
        if (landung) {
            const im = Number.isFinite(impact) && impact > 0 ? impact : 0;
            p.aufprall = im;
            p.gain = m.gain + (Math.max(m.gain, T.gainDeckel) - m.gain) * Math.min(1, im / T.landVollMs);
            p.dauer = m.dauer * T.landDauerFaktor;
            p.freq = m.freq * T.landFreqFaktor;
        }
        return p;
    }

    // Die Stimme: gefilterter Rausch-Burst über state.symphony.masterGain (KEIN zweiter AudioContext;
    // Symphonie aus → stumm). EIN geteilter Rausch-Buffer je Kontext, zufälliger Start-Offset.
    // Math.random ist hier legal: reiner Klang-Körper, keine Welt-Substanz.
    _playSchrittOneShot(param) {
        const s = this.state.symphony;
        if (!s || !s.enabled || !s.ctx || !s.masterGain || !param) return false;
        const ctx = s.ctx;
        let buf = s._schrittNoiseCtx === ctx ? s._schrittNoise : null;
        if (!buf) {
            const n = Math.max(1, Math.floor(ctx.sampleRate * 0.25));
            buf = ctx.createBuffer(1, n, ctx.sampleRate);
            const ch = buf.getChannelData(0);
            for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
            s._schrittNoise = buf;
            s._schrittNoiseCtx = ctx;
        }
        const t = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filt = ctx.createBiquadFilter();
        filt.type = param.filter;
        filt.frequency.value = param.freq;
        filt.Q.value = param.q;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(param.gain, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + param.dauer);
        src.connect(filt);
        filt.connect(gain);
        gain.connect(s.masterGain);
        const spielraum = buf.duration - param.dauer - 0.02;
        src.start(t, spielraum > 0 ? Math.random() * spielraum : 0);
        src.stop(t + param.dauer + 0.02);
        return true;
    }

    // Symphonie-Tick (jeden Frame): die Lofi-Musik (eigener Akkord-Takt) und die Klang-Welt (eigener Misch-Takt).
    symphonyTick() {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx) return;
        this._lofiTick();
        this._umweltKlangTick();
        this._fahrtKlangTick();
    }

    // DIE STIMME DER FAHRT (Leben-Schau 2, fahr-bahn — Befund: Fahren war stumm): jeder Gesetz-Wagen in Fahrt klingt aus dem
    // Gesetzbuch (klang:FAHRT — der Motor aus der Zünd-Folge seiner Drehzahl im Gang, das Abrollen aus dem Tempo; die Quellen
    // baut klang-core `fahrtStimme`) auf dem Welt-Master: der im Sattel und jeder im Nachlauf (`_fahrLos`, gestoßen oder im
    // Flug verlassen — ohne Fahrer schweigt sein Motor). Der Wirt reicht nur die Lage: das Tempo des Fahr-Zustands, die
    // Deckel des Fahr-Satzes (vmax, rückwärts vehicle:FAHR.schritt.rueckVmax), das Gas aus den Fahr-Tasten (W, rückwärts S),
    // den Flug und das Ohr (klang:FAHRT_OHR, `fahrtAmOhr`: Doppler aus der Geschwindigkeit des Wagens `_fahrWagenGeschw`
    // gegen die des Leibs am Ohr, Abstand; im Sattel sitzt das Ohr im Wagen). Absteigen, ein Wagen-Wechsel, die Ruhe oder die
    // Hörweite stoppt eine Stimme. Kosten: eine Stimme je hörbarem Wagen in Fahrt.
    _fahrtKlangTick() {
        const s = this.state.symphony;
        const st = this.state;
        const pl = st.player;
        const pm = st.playerMesh;
        const v = st.playerVel;
        const { kern } = AnazhRealm._umweltGesetz();
        const S = AnazhRealm._fahrSchrittGesetz().S;
        const T = st.verbTafel; // Gas analog aus der Verb-Tafel; die Bremse unter bremsV treibt rückwärts
        const sattel = pl && pl.mountedArch != null && this._mountedEntry ? this._mountedEntry : null;
        const ohr = pm && {
            x: pm.position.x,
            y: pm.position.y,
            z: pm.position.z,
            vx: v ? v.x() : 0,
            vy: v ? v.y() : 0,
            vz: v ? v.z() : 0,
        };
        const stimmen = s.fahrt || (s.fahrt = new Map());
        const hoert = new Map();
        for (const e of sattel ? [sattel, ...(this._fahrLos || [])] : this._fahrLos || []) {
            const fz = e._fahrSatz && e._fahr && Number.isFinite(e._fahr.vlong) ? e._fahr : null;
            const imSattel = e === sattel && e.id === pl.mountedArch;
            const vw = fz && ohr && this._fahrWagenGeschw(e);
            if (!vw || hoert.has(e)) continue;
            const am = imSattel
                ? kern.fahrtAmOhr(ohr, ohr)
                : kern.fahrtAmOhr(
                      {
                          x: fz.x,
                          y: Number.isFinite(fz.y) ? fz.y : e.position.y,
                          z: fz.z,
                          vx: vw.x,
                          vy: fz.vy,
                          vz: vw.z,
                      },
                      ohr
                  );
            const vmax = e._fahrSatz.vmax;
            const lage = {
                v: fz.vlong,
                vmax,
                rueckVmax: vmax * S.rueckVmax,
                gas: imSattel ? Math.max(T.gas, fz.vlong <= S.bremsV ? T.bremse : 0) : 0,
                luft: !!fz.luft,
                motor: imSattel,
                doppler: am.doppler,
                dDb: am.dDb,
            };
            if (imSattel || kern.fahrtImOhr(lage).rollDb > -Infinity) hoert.set(e, lage);
        }
        for (const [e, stimme] of stimmen)
            if (!hoert.has(e)) {
                stimme.stop(s.ctx.currentTime);
                stimmen.delete(e);
            }
        for (const [e, lage] of hoert) {
            if (!stimmen.has(e)) stimmen.set(e, kern.fahrtStimme(s.ctx, s.masterGain));
            stimmen.get(e).anwenden(lage, s.ctx.currentTime);
            this._untertitel("fahrt", lage.motor ? "motor" : "rollen", null, 0);
        }
    }

    // ### Lofi-Pad-Schicht ###
    // Ruhige Minor-7th-Akkordfolge, leise neben der Klang-Welt, Web-Audio nativ. Emotion: hope hebt
    // die Terz (Moll → Dur), sorrow verlangsamt das Tempo.

    // Die Lofi-Schicht im Audio-Graph aufbauen: ein warmer Tiefpass + ein
    // leiser Gain an den Master-Bus. Die Akkord-Oszillatoren selbst sind
    // transient (je Akkord neu, mit Hüllkurve, auto-stop).
    _buildLofiLayer(ctx, masterGain) {
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 900; // warm, gedämpft — der Lofi-Charakter
        filter.Q.value = 0.6;
        const gain = ctx.createGain();
        gain.gain.value = 0.12; // leise — der Pad sitzt unter der Melodie
        filter.connect(gain);
        gain.connect(masterGain);
        // W4 V3 Phase 2 — die Lead-Stimme (Melodie) hat ihren eigenen Gain,
        // etwas präsenter als der Pad, damit die Melodie über ihm singt.
        const melodyGain = ctx.createGain();
        melodyGain.gain.value = 0.24; // V8.91 — Lead-Stimme −20% (Schöpfer-Wunsch)
        melodyGain.connect(masterGain);
        // W4 V3 Phase 3 — die Groove-Schicht (synthetische Trommeln) + ein
        // kurzer White-Noise-Puffer für Snare/Hihat (je Schlag eine frische,
        // billige BufferSource aus diesem geteilten Puffer).
        const grooveGain = ctx.createGain();
        grooveGain.gain.value = 0.5; // V8.92 — lauter (der Groove war zu leise; war 0.35)
        grooveGain.connect(masterGain);
        // W4 V3 Phase 4 — der Bass-Layer (folgt den Akkord-Wurzeln, eine
        // Oktave unter dem Pad; verzahnt sich mit der Kick).
        const bassGain = ctx.createGain();
        bassGain.gain.value = 0.46;
        bassGain.connect(masterGain);
        // DER RAUM (Genre-DNA `space`): gedämpfter Feedback-Delay-Bus als Hall-Ersatz (asset-frei). Der
        // Wet-Pegel folgt Return = space·returnProSpace; `_lofiTick` setzt ihn je Akkord aus dem Rezept
        // (ohne Rezept stumm). Bus-Zahlen = klang-Gesetz RAUM.echo (tempo-synchron via _lofiTick), je Kanal
        // ein Genre-Send (RAUM.DELAY_SENDS); der Bass bleibt trocken (Tiefbass im Hall = Matsch).
        // Kern ohne gültiges RAUM.echo ist ein BRUCH (_kernPflichtBruch), nie ein stiller Literal-Fallback.
        const RE0 = AnazhRealm.Gesetz("klang:RAUM.echo", null);
        if (!RE0 || !["hpHz", "lpHz", "feedback"].every((k) => Number.isFinite(RE0[k])))
            AnazhRealm._kernPflichtBruch("klang:RAUM.echo");
        const raumDelay = ctx.createDelay(2.0);
        raumDelay.delayTime.value = 0.31;
        const raumHochpass = ctx.createBiquadFilter();
        raumHochpass.type = "highpass";
        raumHochpass.frequency.value = RE0.hpHz;
        const raumDaempfer = ctx.createBiquadFilter();
        raumDaempfer.type = "lowpass";
        raumDaempfer.frequency.value = RE0.lpHz;
        const raumFeedback = ctx.createGain();
        raumFeedback.gain.value = RE0.feedback;
        const raumWet = ctx.createGain();
        raumWet.gain.value = 0;
        raumDelay.connect(raumHochpass);
        raumHochpass.connect(raumDaempfer);
        raumDaempfer.connect(raumFeedback);
        raumFeedback.connect(raumDelay);
        raumDaempfer.connect(raumWet);
        raumWet.connect(masterGain);
        // SCHLUSS-WELLE — die Genre-Sends je Kanal (Pad=harmony · Melodie=lead ·
        // Groove=drums); Start 1 = voller Send (byte-alt), der Tick setzt die
        // DELAY_SENDS-Zeile des gewählten Genres.
        const raumSendPad = ctx.createGain();
        const raumSendMelody = ctx.createGain();
        const raumSendGroove = ctx.createGain();
        gain.connect(raumSendPad);
        raumSendPad.connect(raumDelay);
        melodyGain.connect(raumSendMelody);
        raumSendMelody.connect(raumDelay);
        grooveGain.connect(raumSendGroove);
        raumSendGroove.connect(raumDelay);
        const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.4), ctx.sampleRate);
        const nd = noiseBuffer.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
        // W4 V3 — der Harmonie-RNG, deterministisch aus worldMeta.seed: jede
        // Welt bekommt ihr eigenes Lied (Mulberry32, wie das Sternenfeld; ein
        // ":lofi"-Suffix entkoppelt die Akkordfolge vom Stern-Muster).
        const seedStr = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + ":lofi";
        let seedNum = 0;
        for (let i = 0; i < seedStr.length; i++) seedNum = (seedNum * 31 + seedStr.charCodeAt(i)) >>> 0;
        return {
            filter,
            gain,
            melodyGain,
            grooveGain,
            bassGain,
            raumWet, // ZENSUS-REST V18.488 — der space-Wet-Pegel (Genre-DNA)
            raumDelay, // SCHLUSS-WELLE — der Tick synct das Echo aufs Genre-Tempo (RAUM.echo)
            raumSendPad, // SCHLUSS-WELLE — die Genre-Sends je Kanal (RAUM.DELAY_SENDS)
            raumSendMelody,
            raumSendGroove,
            noiseBuffer,
            degree: 0,
            bar: 0, // ZENSUS-REST V18.488 — der Takt-Zähler der progressionDeg-Wanderung
            lastChordAt: -Infinity,
            rngState: seedNum,
        };
    }

    // W4 V3 — ein Mulberry32-Schritt auf dem Lofi-Harmonie-RNG. Deterministisch
    // (seed-getrieben), aber über die Akkordfolge hinweg fortschreitend — die
    // Progression ist je Welt reproduzierbar, wiederholt sich aber nie exakt.
    _lofiRandom() {
        const lofi = this.state.symphony && this.state.symphony.lofi;
        if (!lofi) return Math.random();
        lofi.rngState = (lofi.rngState + 0x6d2b79f5) >>> 0;
        let t = lofi.rngState;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    // DIE EINE SKALEN-QUELLE: das Studio-Klang-Rezept führt die SKALA (fx.klang.scale, im Kern aus
    // scaleFor(darkness) vor-abgeleitet). Fehlt das Feld oder ist es unsauber (must-ignore), gilt die
    // Kern-Wahrheit des Host-Genres (fail-closed) — nie eine Stamm-Konstante. Nur ein nicht-leeres
    // Array endlicher Halbtöne führt.
    _lofiActiveScale() {
        const studio = this._klangStudioPreset();
        const sc = studio && studio.scale;
        if (Array.isArray(sc) && sc.length > 0 && sc.every((v) => Number.isFinite(v))) return sc;
        return this._klangGenreAusKern(AnazhRealm.KLANG_HOST_RECIPE).scale;
    }

    // Tonleiter-Index → Halbton zur Wurzel: `scale[idx mod n] + 12·floor(idx/n)` (Oktav-Faltung,
    // negative Indizes gewickelt). DER EINE Ton-Mapper: Akkord-Stapel (`_lofiChordFromDegree`), Melodie
    // (`_lofiMelodyNotes`) und Bass-Wurzel fließen hierdurch. Die LOFI_HARMONY-Wanderung bleibt 7-stufig
    // (0..6); bei einer 6-Ton-Skala (Blues) wird die "Septime" d+6 zur Oktav-Wurzel — gewollt.
    _lofiScaleSemitone(idx) {
        const scale = this._lofiActiveScale();
        const n = scale.length;
        const wrapped = ((idx % n) + n) % n;
        return scale[wrapped] + 12 * Math.floor(idx / n);
    }

    // W4 V3 — den diatonischen Septakkord einer Tonleiter-Stufe als Halbton-
    // Abstände: gestapelte Terzen (Stufe d, d+2, d+4, d+6), mit Oktav-Umbruch.
    // V18.491.136 COLOR_EXT — dna.color → chord stack width (4/5/6); fail-soft n=4.
    _lofiChordFromDegree(degree) {
        const studio = this._klangStudioPreset();
        const dna = studio && studio.dna ? studio.dna : null;
        const color = dna && Number.isFinite(dna.color) ? dna.color : 0;
        const kc = typeof globalThis !== "undefined" ? globalThis.__klangCore : null;
        const ext =
            kc && typeof kc.colorExt === "function"
                ? kc.colorExt(color)
                : 1 + (color > 0.35 ? 1 : 0) + (color > 0.7 ? 1 : 0);
        const n = 3 + (Number.isFinite(ext) ? ext : 1); // 4 / 5 / 6
        const offsets = [];
        for (let k = 0; k < n; k++) offsets.push(this._lofiScaleSemitone(degree + k * 2));
        return offsets;
    }

    // W4 V3 Phase 2 — die Melodie. Eine improvisierte Phrase über dem Akkord
    // der aktuellen Stufe, auf einem 8-Schritt-Rhythmus-Raster (Achtel-Gefühl).
    // V8.90 — eine ECHTE Rhythmik: nicht jeder Schritt trägt eine Note (eine
    // Onset-Wahrscheinlichkeit lässt PAUSEN), die Noten haben verschiedene
    // LÄNGEN (1-4 Schritte — Halbe, Viertel, Achtel) und DYNAMIK (ein starker
    // Takt-Schritt klingt lauter), plus eine kleine Zeit-Humanisierung — die
    // Phrase ist nicht mehr stur. Tonhöhe: startet auf einem Akkord-Ton,
    // wandert meist schrittweise (Sprünge lösen sich), der letzte Ton löst
    // auf. Liefert [{freq, start, dur, idx, vel}] — seed-deterministisch.
    _lofiMelodyNotes(degree, durSec) {
        const emotions = (this.state.player && this.state.player.emotions) || {};
        const joy = Math.max(0, Math.min(1, emotions.joy || 0));
        const peace = Math.max(0, Math.min(1, emotions.peace || 0));
        const STEPS = 8;
        const stepDur = durSec / STEPS;
        // Genre führt die Melodie (studio.melody + dna.flow/tension, klang-Gesetzbuch): None schweigt,
        // Lazy karg, MicroPoly dicht, BlueNotes b-Töne, CallResponse echot die 2. Takthälfte leiser.
        // flow verschiebt die Noten-Dichte um den Anker 0.35; tension: +1 Halbton Reibung, nie am Schluss.
        const studio = this._klangStudioPreset();
        const mStil = studio && typeof studio.melody === "string" ? studio.melody : null;
        if (mStil === "None") return [];
        const dna = studio && studio.dna ? studio.dna : null;
        const flow = dna && Number.isFinite(dna.flow) ? dna.flow : 0.35;
        const tension = dna && Number.isFinite(dna.tension) ? dna.tension : 0;
        const stilOnset = mStil === "Lazy" ? -0.2 : mStil === "MicroPoly" ? 0.2 : mStil === "PlayChanges" ? 0.05 : 0;
        // Onset-Neigung: joy belebt (mehr Noten), peace beruhigt (mehr Pausen).
        const onsetBias = Math.max(
            0.2,
            Math.min(0.95, 0.6 + joy * 0.3 - peace * 0.35 + (flow - 0.35) * 0.35 + stilOnset)
        );
        const chordIdx = [degree, degree + 2, degree + 4, degree + 6];
        let idx = chordIdx[Math.floor(this._lofiRandom() * chordIdx.length)];
        let lastDelta = 0;
        const notes = [];
        let step = 0;
        while (step < STEPS) {
            // Metrisches Gewicht: Takt-Eins stark, Schlag mittel, Off-Beat schwach.
            const strong = step % 4 === 0 ? 1.0 : step % 2 === 0 ? 0.65 : 0.4;
            // Schritt 0 startet die Phrase immer; sonst entscheidet die
            // Onset-Wahrscheinlichkeit — ein Nein ist eine PAUSE.
            const onsetProb = step === 0 ? 1 : onsetBias * strong;
            if (this._lofiRandom() >= onsetProb) {
                step += 1;
                continue;
            }
            // Noten-LÄNGE in Schritten: kurz/mittel/lang; peace dehnt.
            const lr = this._lofiRandom();
            let len = lr < 0.5 ? 1 : lr < 0.82 ? 2 : 3;
            if (peace > 0.5 && this._lofiRandom() < peace) len += 1;
            len = Math.min(len, STEPS - step);
            // DYNAMIK: ein starker Schritt klingt lauter.
            // ZENSUS-REST V18.488 — CallResponse echot die Antwort-Hälfte leiser.
            const vel = (0.14 + 0.16 * strong) * (mStil === "CallResponse" && step >= 4 ? 0.7 : 1);
            // Kleine Zeit-Humanisierung (±6 % eines Schritts) — nicht stur.
            const jitter = (this._lofiRandom() - 0.5) * 0.12 * stepDur;
            // ZENSUS-REST V18.488 — die FARBE des Genres: BlueNotes senken den
            // Ton mit 30 % Chance um einen Halbton (die blaue Terz/Quinte),
            // tension reibt mit tension·20 % Chance einen Halbton nach oben.
            let semi = this._lofiScaleSemitone(idx);
            if (mStil === "BlueNotes" && this._lofiRandom() < 0.3) semi -= 1;
            else if (tension > 0 && this._lofiRandom() < tension * 0.2) semi += 1;
            notes.push({
                freq: AnazhRealm.LOFI_BASE_FREQ * Math.pow(2, (semi + 24) / 12),
                start: Math.max(0, step * stepDur + jitter),
                dur: len * stepDur * 0.92,
                idx,
                vel,
            });
            // Tonhöhen-Walk: meist Schritt, selten Sprung; Sprünge lösen sich.
            const r = this._lofiRandom();
            const stepSize = r < 0.62 ? 1 : r < 0.86 ? 2 : 3;
            let dir = this._lofiRandom() < 0.5 ? -1 : 1;
            if (Math.abs(lastDelta) >= 2) dir = lastDelta > 0 ? -1 : 1;
            const delta = stepSize * dir;
            idx += delta;
            if (idx < degree - 2) idx = degree - 2 + stepSize;
            if (idx > degree + 12) idx = degree + 12 - stepSize;
            lastDelta = delta;
            step += len;
        }
        // Der letzte Ton löst auf dem nächstgelegenen Akkord-Ton auf.
        const last = notes[notes.length - 1];
        const resolveIdx = chordIdx.reduce(
            (best, c) => (Math.abs(c - last.idx) < Math.abs(best - last.idx) ? c : best),
            chordIdx[0]
        );
        last.idx = resolveIdx;
        last.freq = AnazhRealm.LOFI_BASE_FREQ * Math.pow(2, (this._lofiScaleSemitone(resolveIdx) + 24) / 12);
        return notes;
    }

    // W4 V3 Phase 2 — die Melodie-Phrase spielen: je Note ein Sinus-Oszillator
    // (klare, weiche Lead-Stimme über dem Dreieck-Pad) mit Pluck-Hüllkurve.
    _lofiPlayMelody(degree, durSec, t0) {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx || !s.lofi || !s.lofi.melodyGain) return;
        const ctx = s.ctx;
        const now = t0 != null ? t0 : ctx.currentTime;
        // GENRE-STIMMEN (18.07.) — die LEAD-Stimme des Gesetzbuchs (inst.lead
        // wählt Wellenform/Pegel/Anschlag; tilt.lead mischt) — Flöte singt,
        // LeadSynth sticht, Rhodes perlt. Fail-soft byte-alt (sine, Faktor 1).
        const ST = this._lofiInstStimme("lead");
        for (const note of this._lofiMelodyNotes(degree, durSec)) {
            const osc = ctx.createOscillator();
            osc.type = ST.type;
            osc.frequency.value = note.freq;
            const env = ctx.createGain();
            const t0 = now + note.start;
            // V8.88 — eine SINGENDE Hüllkurve (Anschlag → Halt → Ausklang).
            // V8.90 — der Spitzen-Pegel folgt der Noten-Dynamik (note.vel):
            // ein starker Takt-Schritt klingt lauter, ein schwacher leiser.
            const vel = note.vel * ST.gain;
            env.gain.setValueAtTime(0, t0);
            env.gain.linearRampToValueAtTime(vel, t0 + 0.05 * ST.attackMul);
            env.gain.linearRampToValueAtTime(vel * 0.6, t0 + note.dur * 0.7);
            env.gain.linearRampToValueAtTime(0, t0 + note.dur);
            osc.connect(env);
            env.connect(s.lofi.melodyGain);
            osc.start(t0);
            osc.stop(t0 + note.dur + 0.05);
        }
    }

    // W4 V3 Phase 3 — die Zeit eines Raster-Schritts mit Swing. Gerade
    // Schritte liegen auf dem Schlag; ungerade (Off-Beats) werden verzögert
    // (swing 0.5 = gerade, ~0.6 = Lofi/Jazz-Atem).
    _grooveStepTime(step, stepDur, swing) {
        if (step % 2 === 0) return step * stepDur;
        return (step - 1) * stepDur + swing * 2 * stepDur;
    }

    // Swing liest fx.klang.dna.swing des gewählten Rezepts (das Genre führt). Ohne dna (fremdes
    // Rezept, must-ignore) → Kern-Wahrheit des Host-Genres (fail-closed). swing 0 ist GÜLTIG.
    _grooveSwing() {
        const studio = this._klangStudioPreset();
        const sw = studio && studio.dna ? studio.dna.swing : null;
        return Number.isFinite(sw) ? sw : this._klangGenreAusKern(AnazhRealm.KLANG_HOST_RECIPE).dna.swing;
    }

    // Synthetische Kick: Sinus mit Tonhöhen-Abfall 200 → 70 Hz + kurzer Noise-Klick als Transient.
    // Nie tiefer (etwa 140 → 48 Hz) — auf Laptop-Lautsprechern praktisch stumm.
    _lofiKick(t) {
        const s = this.state.symphony;
        if (!s.ctx || !s.lofi || !s.lofi.grooveGain || !s.lofi.noiseBuffer) return;
        const ctx = s.ctx;
        const TB = this._lofiDrumTimbre(); // ZENSUS-REST V18.488 — inst.drums färbt
        // Körper: Sinus mit schnellem Tonhöhen-Abfall.
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(0.85 * (TB.gainMul || 1), t + 0.006);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.24 * TB.kickDauer);
        osc.connect(env);
        env.connect(s.lofi.grooveGain);
        osc.start(t);
        osc.stop(t + 0.28 * TB.kickDauer);
        // Klick: ein sehr kurzer hoch-gefilterter Noise-Tick — der Transient,
        // der den Schlag auch ohne Tiefbass-Wiedergabe trägt.
        const click = ctx.createBufferSource();
        click.buffer = s.lofi.noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 1600;
        const cenv = ctx.createGain();
        cenv.gain.setValueAtTime(0.0001, t);
        cenv.gain.exponentialRampToValueAtTime(0.5, t + 0.002);
        cenv.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
        click.connect(hp);
        hp.connect(cenv);
        cenv.connect(s.lofi.grooveGain);
        click.start(t);
        click.stop(t + 0.05);
    }

    // W4 V3 Phase 3 — eine synthetische Snare: ein White-Noise-Burst durch
    // einen Hochpass, kurze scharfe Hüllkurve.
    _lofiSnare(t) {
        const s = this.state.symphony;
        if (!s.ctx || !s.lofi || !s.lofi.grooveGain || !s.lofi.noiseBuffer) return;
        const ctx = s.ctx;
        const TB = this._lofiDrumTimbre(); // ZENSUS-REST V18.488 — inst.drums färbt
        const src = ctx.createBufferSource();
        src.buffer = s.lofi.noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 1200 * TB.snareHp;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(0.5 * (TB.gainMul || 1), t + 0.005);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.18 * TB.snareDauer);
        src.connect(hp);
        hp.connect(env);
        env.connect(s.lofi.grooveGain);
        src.start(t);
        src.stop(t + 0.22 * TB.snareDauer);
    }

    // W4 V3 Phase 3 — ein synthetisches Hihat: ein sehr kurzer, hoch-
    // gefilterter White-Noise-Tick.
    _lofiHihat(t) {
        const s = this.state.symphony;
        if (!s.ctx || !s.lofi || !s.lofi.grooveGain || !s.lofi.noiseBuffer) return;
        const ctx = s.ctx;
        const TB = this._lofiDrumTimbre(); // ZENSUS-REST V18.488 — inst.drums färbt
        const src = ctx.createBufferSource();
        src.buffer = s.lofi.noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        // W4 V4 Sub-Schritt 1 — eine glut-Region schärft das Hihat: der
        // Hochpass steigt 7000..9500 Hz (dünner, „tssss" — eine Spur
        // Spannung in der Klangfarbe, ohne eine einzige Note zu ändern).
        hp.frequency.value = (7000 + this._lofiWorldField().glut * 2500) * TB.hihatHp;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(0.22 * TB.hihatGain * (TB.gainMul || 1), t + 0.004);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
        src.connect(hp);
        hp.connect(env);
        env.connect(s.lofi.grooveGain);
        src.start(t);
        src.stop(t + 0.08);
    }

    // Das Genre wählt den Groove: RHYTHMUS_MUSTER (klang-Gesetzbuch) je LAWS.rhythm-Option, gewählt
    // über studio.rhythm. Genre ohne eigene Zeile (auch r=null, must-ignore) → Swing-Zeile.
    // Kalter Kern → Bruch, der schreit (kein Konstanten-Zwilling).
    _lofiGroovePattern() {
        const studio = this._klangStudioPreset();
        const r = studio && typeof studio.rhythm === "string" ? studio.rhythm : null;
        const M =
            (r ? AnazhRealm.Gesetz("klang:RHYTHMUS_MUSTER." + r, null) : null) ||
            AnazhRealm.Gesetz("klang:RHYTHMUS_MUSTER.Swing", null);
        if (M && Array.isArray(M.kick) && Array.isArray(M.snare) && Array.isArray(M.hihat)) return M;
        return AnazhRealm._kernPflichtBruch("klang:RHYTHMUS_MUSTER.Swing");
    }

    // Timbre-Faktoren je inst.drums-Wahl des Gesetzbuchs: LoFi/Acoustic Faktor 1, Electronic längere
    // Kick + schärfere Snare, Brush weiche Snare + leises Hihat, Perc helles Hihat. Tabelle vor if (M8).
    _lofiDrumTimbre() {
        const studio = this._klangStudioPreset();
        const d = studio && studio.inst && typeof studio.inst.drums === "string" ? studio.inst.drums : null;
        const T = {
            Electronic: { kickDauer: 1.35, snareHp: 1.35, snareDauer: 0.75, hihatHp: 1.15, hihatGain: 1 },
            Brush: { kickDauer: 0.9, snareHp: 0.8, snareDauer: 1.5, hihatHp: 0.9, hihatGain: 0.6 },
            Perc: { kickDauer: 0.85, snareHp: 1.2, snareDauer: 0.8, hihatHp: 1.35, hihatGain: 1.1 },
        };
        const tb = Object.assign(
            { kickDauer: 1, snareHp: 1, snareDauer: 1, hihatHp: 1, hihatGain: 1 },
            (d && T[d]) || null
        );
        // V18.491.129 TILT_VIS.host=role-db
        // GENRE-STIMMEN (18.07.) — tilt.drums (dB, die Genre-Mixer-Zeile des
        // Gesetzbuchs) reist als linearer Faktor auf alle Trommel-Pegel.
        const tDb = studio && studio.tilt && Number.isFinite(studio.tilt.drums) ? studio.tilt.drums : 0;
        tb.gainMul = Math.pow(10, tDb / 20);
        return tb;
    }

    // ═══ GENRE-STIMMEN — DIE INSTRUMENT-WAHL FÄRBT DIE MELODIE ═══
    // Der EINE Stimmen-Chokepoint: inst.{harmony,lead,bass} + tilt.<rolle> (klang-core) wählen
    // Wellenform + Pegel + Anschlag je Rolle (Tabelle vor if). Der Host bleibt Lofi-Ofen (Web-Audio-Osc):
    // die WAHL ist Gesetz, die Technik Leser-Sache. Kaltes Buch/unbekannter Name → historische Stimme
    // (triangle/sine/triangle, Faktor 1, Anschlag 1).
    _lofiInstStimme(rolle) {
        const studio = this._klangStudioPreset();
        // Die Komposita sind ECHTE Leser (der Konsum-Wächter rastert inst.*/
        // tilt.* nur über das Kompositum — die nackten Wörter kollidieren).
        const name =
            studio && studio.inst
                ? rolle === "harmony"
                    ? studio.inst.harmony
                    : rolle === "lead"
                      ? studio.inst.lead
                      : studio.inst.bass
                : null;
        const T = {
            GrandPiano: { type: "triangle", gain: 1, attackMul: 0.35 },
            Rhodes: { type: "sine", gain: 1.1, attackMul: 0.6 },
            Guitar: { type: "triangle", gain: 0.95, attackMul: 0.3 },
            DistGuitar: { type: "square", gain: 0.5, attackMul: 0.4 },
            Strings: { type: "sawtooth", gain: 0.5, attackMul: 1.6 },
            SynthPad: { type: "sawtooth", gain: 0.45, attackMul: 2.0 },
            LeadSynth: { type: "sawtooth", gain: 0.6, attackMul: 0.25 },
            SynthBrass: { type: "sawtooth", gain: 0.55, attackMul: 0.5 },
            Flute: { type: "sine", gain: 1.05, attackMul: 0.8 },
            Vibraphone: { type: "sine", gain: 1.05, attackMul: 0.25 },
            Marimba: { type: "sine", gain: 1, attackMul: 0.15 },
            Kalimba: { type: "sine", gain: 1, attackMul: 0.15 },
            Organ: { type: "square", gain: 0.5, attackMul: 0.9 },
            Clavinet: { type: "square", gain: 0.5, attackMul: 0.2 },
            DoubleBass: { type: "triangle", gain: 1, attackMul: 1 },
            PickBass: { type: "square", gain: 0.55, attackMul: 0.5 },
            SynthBass: { type: "sawtooth", gain: 0.6, attackMul: 0.6 },
            ReeseBass: { type: "sawtooth", gain: 0.6, attackMul: 1 },
            Sub808: { type: "sine", gain: 1.15, attackMul: 0.8 },
        };
        const alt = { harmony: "triangle", lead: "sine", bass: "triangle" };
        const v = (typeof name === "string" && T[name]) || { type: alt[rolle] || "sine", gain: 1, attackMul: 1 };
        // V18.491.129 TILT_VIS.host=role-db
        const tiltDb =
            studio && studio.tilt
                ? rolle === "harmony"
                    ? studio.tilt.harmony
                    : rolle === "lead"
                      ? studio.tilt.lead
                      : studio.tilt.bass
                : null;
        const gain = v.gain * (Number.isFinite(tiltDb) ? Math.pow(10, tiltDb / 20) : 1);
        return { type: v.type, gain, attackMul: v.attackMul, name: typeof name === "string" ? name : null };
    }

    // W4 V3 Phase 3 — den Groove einer Akkord-Dauer spielen: das Trommel-
    // Muster über das 8-Schritt-Raster, mit Swing. peace dünnt die Off-Beat-
    // Hihats aus (ruhiger), joy lässt sie voll (lebhafter).
    _lofiPlayGroove(durSec, t0) {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx || !s.lofi || !s.lofi.grooveGain || !s.lofi.noiseBuffer) return;
        const STEPS = 8;
        const stepDur = durSec / STEPS;
        const now = t0 != null ? t0 : s.ctx.currentTime;
        const pat = this._lofiGroovePattern(); // ZENSUS-REST V18.488 — das Genre wählt
        const emotions = (this.state.player && this.state.player.emotions) || {};
        const peace = Math.max(0, Math.min(1, emotions.peace || 0));
        const swing = this._grooveSwing(); // ZENSUS 17.07. — das Genre führt den Shuffle
        for (let step = 0; step < STEPS; step++) {
            const t = now + this._grooveStepTime(step, stepDur, swing);
            if (pat.kick.indexOf(step) >= 0) this._lofiKick(t);
            if (pat.snare.indexOf(step) >= 0) this._lofiSnare(t);
            // peace > 0.6 lässt die Off-Beat-Hihats aus — ein ruhigerer Groove.
            if (pat.hihat.indexOf(step) >= 0 && !(peace > 0.6 && step % 2 === 1)) this._lofiHihat(t);
        }
    }

    // Nächste Akkord-Stufe. Trägt das Studio-Rezept eine harmony-Wahl, wandert die Stufe über die
    // EINE Kern-Formel progressionDeg (RNG als Parameter — _lofiRandom bleibt der Welt-Seed-Strom);
    // sorrow > 0.6 färbt als inDev-Ausweichung (+4). Sonst Markov-Kette LOFI_HARMONY mit
    // Emotions-Bias: joy/hope → helle Stufen (III/VI), sorrow → dunkle (i/ii°/iv).
    _lofiNextDegree(degree) {
        const studio = this._klangStudioPreset();
        const kc = typeof globalThis !== "undefined" ? globalThis.__klangCore : null;
        if (studio && typeof studio.harmony === "string" && kc && typeof kc.progressionDeg === "function") {
            const lofi = this.state.symphony && this.state.symphony.lofi;
            let bar = lofi ? (lofi.bar = (Number.isFinite(lofi.bar) ? lofi.bar : 0) + 1) : 1;
            // Die Genre-FORM rahmt die Harmonie: am Abschnitts-Ende (FORM_TAKTE) springt der Takt-Zähler auf
            // den Abschnitts-Anfang → progressionDeg kehrt zur Tonika-Phase zurück. Free/kaltes Buch → nie.
            const FORM_TAKTE = { AAB: 3, AABA: 4, Vamp: 2, Build: 8, Sonata: 8 };
            const ft = typeof studio.form === "string" ? FORM_TAKTE[studio.form] : null;
            if (lofi && ft) {
                bar = ((bar - 1) % ft) + 1;
                lofi.formTakt = bar; // die Abschnitts-Uhr (Linse/HUD lesbar)
            }
            const emotions = (this.state.player && this.state.player.emotions) || {};
            const inDev = (Number(emotions.sorrow) || 0) > 0.6;
            try {
                const r = kc.progressionDeg(studio.harmony, bar, () => this._lofiRandom(), inDev);
                if (r && Number.isFinite(r.deg)) return ((r.deg % 7) + 7) % 7;
            } catch (_e) {}
        }
        const table = AnazhRealm.LOFI_HARMONY;
        const transitions = table[((degree % table.length) + table.length) % table.length] || table[0];
        const emotions = (this.state.player && this.state.player.emotions) || {};
        const bright = Math.max(0, Math.min(1, (emotions.joy || 0) * 0.5 + (emotions.hope || 0) * 0.5));
        const dark = Math.max(0, Math.min(1, emotions.sorrow || 0));
        // Zweiter, schwächerer Bias: das Welt-Affinitäts-Feld am Spieler (magieleitung/lebendig → hell,
        // glut → dunkel). Gewicht 0.4 = halb der Emotion-Bias (0.8) — die Emotion bleibt dominant.
        const field = this._lofiWorldField();
        const worldBright = Math.max(0, Math.min(1, field.magieleitung * 0.5 + field.lebendig * 0.5));
        const worldDark = field.glut;
        let total = 0;
        const weighted = transitions.map(([d, w]) => {
            let weight = w;
            if (AnazhRealm.LOFI_BRIGHT_DEGREES.indexOf(d) >= 0) weight *= 1 + bright * 0.8 + worldBright * 0.4;
            if (AnazhRealm.LOFI_DARK_DEGREES.indexOf(d) >= 0) weight *= 1 + dark * 0.8 + worldDark * 0.4;
            total += weight;
            return [d, weight];
        });
        let r = this._lofiRandom() * total;
        for (const [d, w] of weighted) {
            r -= w;
            if (r <= 0) return d;
        }
        return weighted[weighted.length - 1][0];
    }

    // Die Halbton-Abstände eines Akkords zu Frequenzen. majorLean (aus der
    // hope-Emotion) hebt die Terz (den 2. Ton) um einen Halbton: Moll → Dur,
    // der Akkord klingt heller.
    _lofiChordFreqs(offsets, majorLean) {
        const base = AnazhRealm.LOFI_BASE_FREQ;
        return offsets.map((semi, i) => {
            const lifted = majorLean && i === 1 ? semi + 1 : semi;
            return base * Math.pow(2, lifted / 12);
        });
    }

    // DIE EINE KLANG-QUELLE: Genre-Presets kommen als Daten durchs Buch (klang-core → __replyRecipes
    // → f.recipes, kind "klang"); Leser ist das bestehende Lofi-System (kein Parallel-Audio).
    // Das Host-Genre ist eine Daten-Zeile (KLANG_HOST_RECIPE). Kaltes Buch/Foundry aus →
    // GENRES-Tafel des Kerns (fail-closed via _klangGenreAusKern).
    _klangStudioPreset() {
        const f = this._foundry;
        // Die Welt-Klang-Wahl führt: state.klangPreset (in der Werkstatt gesetzt, persistiert) wählt das
        // Genre; ohne Wahl oder bei Nicht-klang-Rezept → das Host-Rezept.
        const chosen = this.state && typeof this.state.klangPreset === "string" ? this.state.klangPreset : null;
        // DIE PRÄGUNG DES GENRES (ws.studioOv, der EINE Übergabe-Kanal und die Werkstatt-Regler): Tempo und DNA über das Genre,
        // die Skala aus dem Gesetz des Kerns (scaleFor(darkness) + SCALES) — ohne Prägung das Genre selbst (byte-alt).
        const gepraegt = (k, id) => {
            const p = this._studioPraegung(id);
            if (!p || !k) return k;
            const dna = Object.assign({}, k.dna);
            for (const a in dna) if (typeof p[a] === "number") dna[a] = p[a];
            const scaleName = AnazhRealm.Gesetz("klang:scaleFor")(dna.darkness);
            const scale = AnazhRealm.Gesetz("klang:SCALES")[scaleName].slice();
            return Object.assign({}, k, { bpm: typeof p.bpm === "number" ? p.bpm : k.bpm, dna, scaleName, scale });
        };
        if (f && f.recipes) {
            const cRec = chosen ? f.recipes[chosen] : null;
            const id = cRec && cRec.kind === "klang" ? chosen : AnazhRealm.KLANG_HOST_RECIPE;
            const rec = f.recipes[id];
            const k = rec && rec.fx && rec.fx.klang;
            if (k && typeof k === "object") return gepraegt(k, id);
        }
        // Kaltes Buch (Worker aus/Boot-Fenster): die Wahl löst direkt gegen die GENRES-Tafel des
        // klang-Gesetzbuchs auf — dieselbe Quelle, aus der die Rezepte stammen (scaleFor(darkness) + SCALES).
        const kalt = chosen ? this._klangGenreAusKern(chosen) : null;
        return kalt
            ? gepraegt(kalt, chosen)
            : gepraegt(this._klangGenreAusKern(AnazhRealm.KLANG_HOST_RECIPE), AnazhRealm.KLANG_HOST_RECIPE);
    }

    // Genre-Leser des klang-Gesetzbuchs (kalte-Buch-Brücke von _klangStudioPreset): Rezept-Id →
    // GENRES-Zeile (lowercase, "-klang"-Suffix fällt), Skala über scaleFor(darkness) + SCALES.
    // Memo je Id (Tafel statisch); Kern kalt → _kernPflichtBruch; unbekannte Id → null (must-ignore).
    _klangGenreAusKern(id) {
        const memo = this._klangGenreMemo || (this._klangGenreMemo = new Map());
        if (memo.has(id)) return memo.get(id);
        // ZWILLINGS-ABSCHIED (19.07.): die Kern-Pflicht-Wand steht VOR jedem
        // try (ein eigener catch würde den Bruch ersticken) — der deklarierte
        // „Kern kalt → null → LOFI_*-Konstante"-Pfad ist gefallen.
        const G = AnazhRealm.Gesetz("klang:GENRES", null);
        const SC = AnazhRealm.Gesetz("klang:SCALES", null);
        const kc = typeof globalThis !== "undefined" ? globalThis.__klangCore : null;
        if (!G || !SC || !kc || typeof kc.scaleFor !== "function") return AnazhRealm._kernPflichtBruch("klang:GENRES");
        let out = null;
        const wunsch = String(id || "lofi")
            .toLowerCase()
            .replace(/-klang$/, "");
        let g = null;
        for (const name of Object.keys(G)) {
            if (name.toLowerCase() === wunsch) {
                g = G[name];
                break;
            }
        }
        if (g) {
            const scaleName = kc.scaleFor(g.darkness);
            const scale = Array.isArray(SC[scaleName]) ? SC[scaleName].slice() : null;
            out = {
                bpm: g.bpm,
                scaleName,
                scale,
                dna: {
                    swing: g.swing,
                    darkness: g.darkness,
                    color: g.color,
                    flow: g.flow,
                    tension: g.tension,
                    space: g.space,
                },
                form: g.form,
                harmony: g.harmony,
                rhythm: g.rhythm,
                bass: g.bass,
                melody: g.melody,
                inst: g.inst,
            };
        }
        if (out) memo.set(id, out); // Memo NUR im Erfolgs-Fall (unbekannter Wunsch memo-frei)
        return out;
    }
    // Genre-Echo-Anteile des Welt-Raum-Busses: RAUM.DELAY_SENDS des klang-Gesetzbuchs, aufgelöst über
    // die Rezept-Id (lowercase wie _klangGenreAusKern); Genre ohne Zeile → def-Zeile.
    // null = kalter Kern → die Sends bleiben auf ihrem Start (voll).
    _klangRaumSends() {
        const table = AnazhRealm.Gesetz("klang:RAUM.DELAY_SENDS", null);
        if (!table || typeof table !== "object") return null;
        const chosen =
            this.state && typeof this.state.klangPreset === "string"
                ? this.state.klangPreset
                : AnazhRealm.KLANG_HOST_RECIPE;
        const wunsch = String(chosen || "lofi")
            .toLowerCase()
            .replace(/-klang$/, "");
        for (const name of Object.keys(table)) {
            if (name.toLowerCase() === wunsch) return table[name];
        }
        return table.def || null;
    }
    // Akkord-Dauer in ms. Das Tempo führt das bpm des Studio-Klang-Rezepts; ohne bpm-Feld die
    // Kern-Wahrheit des Host-Genres (fail-closed). sorrow verlangsamt um bis zu 50 %.
    _lofiChordDurationMs() {
        const studio = this._klangStudioPreset();
        const bpm =
            studio && Number.isFinite(studio.bpm) && studio.bpm > 0
                ? studio.bpm
                : this._klangGenreAusKern(AnazhRealm.KLANG_HOST_RECIPE).bpm;
        const beatMs = 60000 / bpm;
        const base = beatMs * AnazhRealm.LOFI_CHORD_BEATS;
        const emotions = (this.state.player && this.state.player.emotions) || {};
        const sorrow = Math.max(0, Math.min(1, emotions.sorrow || 0));
        return base * (1 + sorrow * 0.5);
    }

    // Bass: folgt der Akkord-Wurzel eine Oktave unter dem Pad, auf den Kick-Schritten.
    // Dreieck statt Sinus — die Obertöne tragen ihn auch auf kleinen Lautsprechern.
    _lofiPlayBass(degree, durSec, t0) {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx || !s.lofi || !s.lofi.bassGain) return;
        const ctx = s.ctx;
        const now = t0 != null ? t0 : ctx.currentTime;
        const stepDur = durSec / 8;
        const chord = this._lofiChordFromDegree(degree);
        const rootOffset = chord[0];
        // Sub eine Oktave unter dem Pad (55-104 Hz) + Oktav-Stimme darüber (110-208 Hz): ~70 Hz ist die
        // Wiedergabe-Untergrenze kleiner Lautsprecher, ohne Oktav-Stimme wäre der Bass dort stumm.
        const subFreqOf = (semi) => AnazhRealm.LOFI_BASE_FREQ * Math.pow(2, (semi - 12) / 12);
        const swing = this._grooveSwing(); // ZENSUS 17.07. — derselbe Genre-Shuffle wie der Groove
        // GENRE-STIMMEN (18.07.) — die BASS-Stimme des Gesetzbuchs (inst.bass:
        // Sub808 rund, PickBass knurrt, DoubleBass byte-alt; tilt.bass mischt).
        const ST = this._lofiInstStimme("bass");
        const spiele = (t, semi, dur, subOnly) => {
            const subFreq = subFreqOf(semi);
            const voices = subOnly
                ? [{ freq: subFreq, attackPeak: 0.55, sustainPeak: 0.4 }]
                : [
                      { freq: subFreq, attackPeak: 0.5, sustainPeak: 0.32 },
                      { freq: subFreq * 2, attackPeak: 0.46, sustainPeak: 0.3 },
                  ];
            for (const voice of voices) {
                const osc = ctx.createOscillator();
                osc.type = ST.type;
                osc.frequency.value = voice.freq;
                const env = ctx.createGain();
                env.gain.setValueAtTime(0, t);
                env.gain.linearRampToValueAtTime(voice.attackPeak * ST.gain, t + 0.03);
                env.gain.linearRampToValueAtTime(voice.sustainPeak * ST.gain, t + dur * 0.6);
                env.gain.linearRampToValueAtTime(0, t + dur);
                osc.connect(env);
                env.connect(s.lofi.bassGain);
                osc.start(t);
                osc.stop(t + dur + 0.05);
            }
        };
        // Das Genre führt den Bass (studio.bass = LAWS.bass-Option; Tabelle vor if): Walking 1-3-5-7,
        // RootFive Grundton/Quinte, Achtel jeden Schritt, FunkRiff synkopiert, Riddim betont die Drei,
        // Sub808 nur Sub, Drone hält den Grundton, None schweigt. Ohne Rezept: Grundton auf den
        // Kick-Schritten. Der Grundton kommt IMMER aus _lofiChordFromDegree (EINE Skalen-Quelle).
        const studio = this._klangStudioPreset();
        const stil = studio && typeof studio.bass === "string" ? studio.bass : null;
        if (stil === "None") return;
        if (stil === "Drone") {
            spiele(now, rootOffset, durSec, false);
            return;
        }
        const kick = this._lofiGroovePattern().kick;
        let plan;
        if (stil === "Walking") {
            plan = [
                { step: 0, semi: chord[0] },
                { step: 2, semi: chord[1] },
                { step: 4, semi: chord[2] },
                { step: 6, semi: chord[3] },
            ];
        } else if (stil === "RootFive") {
            plan = kick.map((step, i) => ({ step, semi: i % 2 === 0 ? chord[0] : chord[2] }));
        } else if (stil === "Achtel") {
            plan = [0, 1, 2, 3, 4, 5, 6, 7].map((step) => ({ step, semi: chord[0], kurz: true }));
        } else if (stil === "FunkRiff") {
            plan = [
                { step: 0, semi: chord[0] },
                { step: 3, semi: chord[0], kurz: true },
                { step: 5, semi: chord[2], kurz: true },
                { step: 7, semi: chord[0] + 12, kurz: true },
            ];
        } else if (stil === "Riddim") {
            plan = [{ step: 4, semi: chord[0], lang: true }];
        } else if (stil === "Sub808") {
            plan = kick.map((step) => ({ step, semi: chord[0], lang: true, subOnly: true }));
        } else {
            plan = kick.map((step) => ({ step, semi: chord[0] })); // Root/byte-alt
        }
        for (const n of plan) {
            const t = now + this._grooveStepTime(n.step, stepDur, swing);
            const dur = stepDur * (n.lang ? 2.2 : n.kurz ? 0.9 : 1.4);
            spiele(t, n.semi, dur, !!n.subOnly);
        }
    }

    // Einen Akkord spielen: je Ton ein Dreieck-Oszillator (weich, pad-artig)
    // durch eine eigene Hüllkurve (langsamer Anschlag + Ausklang) in die
    // Lofi-Schicht. Die Oszillatoren stoppen selbst nach dem Akkord.
    _lofiPlayChord(offsets, t0) {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx || !s.lofi) return;
        const ctx = s.ctx;
        const now = t0 != null ? t0 : ctx.currentTime;
        const durSec = this._lofiChordDurationMs() / 1000;
        const emotions = (this.state.player && this.state.player.emotions) || {};
        const majorLean = (emotions.hope || 0) > 0.6;
        const freqs = this._lofiChordFreqs(offsets, majorLean);
        // Stimmen-Zahl wächst mit der Stimmung: joy + awe > 0.8 oder eine resonante Struktur in der Nähe
        // (computeSpatialTags.resoniert) → jeder Akkord-Ton bekommt eine leise Oktav-Dopplung.
        const bright = (emotions.joy || 0) + (emotions.awe || 0);
        const nearResonant = this._lofiNearResonantArchitecture();
        const voiceMults = bright > 0.8 || nearResonant ? [1, 2] : [1];
        // W4 V4 Sub-Schritt 1 — eine magieleitung-Region trägt einen leisen,
        // leicht verstimmten Oktav-Schimmer (das Welt-Feld färbt das Timbre).
        const shimmer = this._lofiWorldField().magieleitung > 0.6;
        // GENRE-STIMMEN (18.07.) — die HARMONIE-Stimme des Gesetzbuchs
        // (inst.harmony: GrandPiano perkussiv, SynthPad schwebt mit langem
        // Anschlag, Rhodes weich; tilt.harmony mischt). Byte-alt: triangle/1/1.
        const ST = this._lofiInstStimme("harmony");
        const attack = 0.8 * ST.attackMul;
        const release = 1.4;
        const sustainAt = now + Math.max(attack, durSec - release);
        for (const freq of freqs) {
            for (const mult of voiceMults) {
                const peak = (mult === 1 ? 0.25 : 0.1) * ST.gain; // die Oktav-Dopplung leiser
                const osc = ctx.createOscillator();
                osc.type = ST.type;
                osc.frequency.value = freq * mult;
                const env = ctx.createGain();
                env.gain.setValueAtTime(0, now);
                env.gain.linearRampToValueAtTime(peak, now + attack);
                env.gain.setValueAtTime(peak, sustainAt);
                env.gain.linearRampToValueAtTime(0, now + durSec);
                osc.connect(env);
                env.connect(s.lofi.filter);
                osc.start(now);
                osc.stop(now + durSec + 0.1);
            }
            if (shimmer) {
                const osc = ctx.createOscillator();
                osc.type = ST.type;
                osc.frequency.value = freq * 2 * 1.006; // Oktave, leicht verstimmt
                const env = ctx.createGain();
                env.gain.setValueAtTime(0, now);
                env.gain.linearRampToValueAtTime(0.045 * ST.gain, now + attack);
                env.gain.setValueAtTime(0.045 * ST.gain, sustainAt);
                env.gain.linearRampToValueAtTime(0, now + durSec);
                osc.connect(env);
                env.connect(s.lofi.filter);
                osc.start(now);
                osc.stop(now + durSec + 0.1);
            }
        }
    }

    // Lofi-Scheduler (aus symphonyTick): LOFI_VORLAUF_S vor dem Einsatz des nächsten Akkords (der letzte Einsatz + die
    // Akkord-Dauer) den Akkord der aktuellen Stufe planen, dann die nächste Stufe über _lofiNextDegree wählen. Pad, Melodie,
    // Bass, Groove und der Raum fallen je in EIN Bild, alle auf denselben Einsatz der Audio-Uhr
    // (klang.K5: in einem Bild trugen sie die Spitze des Klang-Takts, 2,6–3,4 ms auf der Radeon, diag-klang-zensus --takt).
    _lofiTick() {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx || !s.lofi) return;
        const L = s.lofi;
        if (L.folge && L.folge.length) return void L.folge.shift()();
        const now = s.ctx.currentTime;
        const durSec = this._lofiChordDurationMs() / 1000;
        const V = AnazhRealm.LOFI_VORLAUF_S;
        const einsatz = Number.isFinite(L.lastChordAt) ? L.lastChordAt + durSec : -Infinity;
        if (einsatz - now > V) return;
        // verspätet (der erste Akkord, ein Hänger): ein voller Vorlauf ab jetzt — die Folge endet vor dem Einsatz
        const t0 = einsatz - now >= V / 2 ? einsatz : now + V;
        const degree = L.degree;
        L.lastChordAt = t0;
        L.degree = this._lofiNextDegree(degree);
        this._lofiPlayChord(this._lofiChordFromDegree(degree), t0);
        this._untertitel("musik", "lofi", null, 0);
        L.folge = [
            () => this._lofiPlayMelody(degree, durSec, t0),
            () => this._lofiPlayBass(degree, durSec, t0),
            () => this._lofiPlayGroove(durSec, t0),
            () => this._lofiRaum(durSec),
        ];
    }

    // Der Raum des Akkords und das Welt-Timbre — das letzte Bild seiner Folge (`_lofiTick`).
    _lofiRaum(durSec) {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx || !s.lofi) return;
        // Raum des Genres: dna.space führt den Wet-Pegel des Delay-Busses (Return = space ·
        // RAUM.hall.returnProSpace); ohne Studio-Rezept bleibt der Bus stumm. Das Echo synct aufs
        // Genre-Tempo (RAUM.echo: punktierte Achtel, geklemmt); je Kanal führt DELAY_SENDS den Send.
        if (s.lofi.raumWet) {
            const st = this._klangStudioPreset();
            const space = st && st.dna && Number.isFinite(st.dna.space) ? st.dna.space : 0;
            // Kein Literal-Fallback: kalter/alter Kern ohne RAUM ist ein Bruch, der schreit
            // (_kernPflichtBruch, das _fahrGesetz-Muster).
            const RH = AnazhRealm.Gesetz("klang:RAUM.hall", null);
            const proSpace =
                RH && Number.isFinite(RH.returnProSpace)
                    ? RH.returnProSpace
                    : AnazhRealm._kernPflichtBruch("klang:RAUM.hall.returnProSpace");
            s.lofi.raumWet.gain.value = Math.max(0, Math.min(0.5, space * proSpace));
            const RE = AnazhRealm.Gesetz("klang:RAUM.echo", null);
            if (!RE || !Number.isFinite(RE.beatFrac) || !Number.isFinite(RE.minSec) || !Number.isFinite(RE.maxSec))
                AnazhRealm._kernPflichtBruch("klang:RAUM.echo");
            if (s.lofi.raumDelay) {
                const bpm =
                    st && Number.isFinite(st.bpm) && st.bpm > 0
                        ? st.bpm
                        : this._klangGenreAusKern(AnazhRealm.KLANG_HOST_RECIPE).bpm;
                const beatSec = 60 / bpm;
                s.lofi.raumDelay.delayTime.value = Math.max(RE.minSec, Math.min(RE.maxSec, beatSec * RE.beatFrac));
            }
            const ds = this._klangRaumSends();
            if (ds && s.lofi.raumSendPad) {
                s.lofi.raumSendPad.gain.value = Number.isFinite(ds.harmony) ? ds.harmony : 0;
                s.lofi.raumSendMelody.gain.value = Number.isFinite(ds.lead) ? ds.lead : 0;
                s.lofi.raumSendGroove.gain.value = Number.isFinite(ds.drums) ? ds.drums : 0;
            }
        }
        // W4 V4 — die Musik hört die Welt: das Welt-Affinitäts-Feld am
        // Spieler färbt die Klangfarbe der nächsten Akkord-Dauer.
        this._lofiApplyWorldTimbre(durSec);
    }

    // Welt-Affinitäts-Feld (worldFieldAt) am Spieler: lebendig/dichte/glut/magieleitung färben das
    // Timbre, nicht die Noten. Ohne playerMesh/worldFieldAt → neutrales Feld (0.5).
    _lofiWorldField() {
        const neutral = { lebendig: 0.5, dichte: 0.5, glut: 0.5, magieleitung: 0.5 };
        const pm = this.state.playerMesh;
        if (!pm || !pm.position || typeof this.auraAt !== "function") return neutral;
        const f = this.auraAt(pm.position.x, pm.position.z); // §5 (V17.25): via auraAt (living Lese-API)
        if (!f) return neutral;
        const c = (v) => Math.max(0, Math.min(1, v || 0));
        return {
            lebendig: c(f.lebendig),
            dichte: c(f.dichte),
            glut: c(f.glut),
            magieleitung: c(f.magieleitung),
        };
    }

    // Welt-Feld moduliert die Klangfarbe: lebendig öffnet den Pad-Tiefpass, dichte hebt den
    // Bass-Anteil. Sanfte Rampe über die Akkord-Dauer.
    _lofiApplyWorldTimbre(durSec) {
        const s = this.state.symphony;
        if (!s || !s.enabled || !s.ctx || !s.lofi) return;
        const field = this._lofiWorldField();
        const now = s.ctx.currentTime;
        const ramp = Math.max(0.5, Math.min(8, durSec || 4));
        // lebendig 0..1 → Pad-Tiefpass 750..1050 Hz (karg .. üppig-warm).
        if (s.lofi.filter && s.lofi.filter.frequency) {
            const cutoff = 750 + field.lebendig * 300;
            try {
                s.lofi.filter.frequency.cancelScheduledValues(now);
                s.lofi.filter.frequency.setValueAtTime(s.lofi.filter.frequency.value, now);
                s.lofi.filter.frequency.linearRampToValueAtTime(cutoff, now + ramp);
            } catch (e) {
                void e;
            }
        }
        // dichte 0..1 → Bass-Gain 0.40..0.56 (leicht .. schwer).
        if (s.lofi.bassGain && s.lofi.bassGain.gain) {
            const bg = 0.4 + field.dichte * 0.16;
            try {
                s.lofi.bassGain.gain.cancelScheduledValues(now);
                s.lofi.bassGain.gain.setValueAtTime(s.lofi.bassGain.gain.value, now);
                s.lofi.bassGain.gain.linearRampToValueAtTime(bg, now + ramp);
            } catch (e) {
                void e;
            }
        }
    }

    // Steht der Spieler nahe einer Struktur mit computeSpatialTags.resoniert ≥ resonance_strong?
    // Dann verdichtet sich der Pad (das Bauwerk „singt mit").
    _lofiNearResonantArchitecture() {
        const pm = this.state.playerMesh;
        const archs = this.state.architectures;
        if (!pm || !pm.position || !Array.isArray(archs) || !archs.length) return false;
        if (typeof this.computeSpatialTags !== "function") return false;
        const T = AnazhRealm.WORLD_EFFECT_THRESHOLDS;
        const strong = T.resonance_strong;
        const RADIUS2 = 24 * 24;
        // die Plätze um den Spieler (`_blockerUmPlatz`, in der Ordnung des Bestands) — vorher jeder Eintrag je Akkord
        const nahe = this._lofiNahe || (this._lofiNahe = []);
        nahe.length = 0;
        this._blockerUmPlatz(pm.position.x, pm.position.z, 24 + 1e-6, nahe);
        for (const e of nahe) {
            if (!e || !e.position) continue;
            const dx = e.position.x - pm.position.x;
            const dz = e.position.z - pm.position.z;
            if (dx * dx + dz * dz > RADIUS2) continue;
            const bp = this.state.blueprints && this.state.blueprints[e.type];
            if (!bp) continue;
            const tags = this.computeSpatialTags(bp);
            if (tags && (tags.resoniert || 0) >= strong) return true;
        }
        return false;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_klang]);

// ===== ATLAS · Klang — Außen-Konstanten =====
// Der EINE Timbre-Leser: das Material→Filter-Gesetz des Schritt-Klangs aus dem klang-Gesetzbuch
// (SCHRITT_TIMBRE); die Bewegungs-Schwelle wohnt getrennt im koerper-Gesetzbuch. Fail-closed; Memo
// nur im Erfolgs-Fall.
AnazhRealm._schrittTimbre = function () {
    if (AnazhRealm._schrittTimbreMemo) return AnazhRealm._schrittTimbreMemo;
    const t = AnazhRealm.Gesetz("klang:SCHRITT_TIMBRE", null);
    if (t && t.material && t.material.stein) {
        AnazhRealm._schrittTimbreMemo = t;
        return t;
    }
    return AnazhRealm._kernPflichtBruch("klang:SCHRITT_TIMBRE");
};
// Der EINE Umwelt-Klang-Leser (Welle 5 Klang): das Klang-Gesetz der Welt (UMWELT: Stimmen · Ohr · Tier · Orte) und
// die reinen Funktionen des Gesetzbuchs (Mischung · Graph · Tier-Ruf). Fail-closed: ein alter Kern ist ein Bruch,
// nie eine stille Ersatz-Welt. Memo nur im Erfolgs-Fall.
AnazhRealm._umweltGesetz = function () {
    if (AnazhRealm._umweltGesetzMemo) return AnazhRealm._umweltGesetzMemo;
    const U = AnazhRealm.Gesetz("klang:UMWELT", null);
    const kern = AnazhRealm.Gesetz("klang:umweltGraph", null) ? globalThis.__klangCore : null;
    if (
        U &&
        U.stimmen &&
        U.ohr &&
        U.tier &&
        Number.isFinite(U.masterBasis) &&
        Number.isFinite(U.hoerschwelleDb) &&
        Array.isArray(U.ohr.radien) &&
        U.spitze &&
        Number.isFinite(U.spitze.linearBisDb) &&
        Number.isFinite(U.spitze.deckeDb) &&
        kern &&
        kern.umweltMischung &&
        kern.umweltGraph &&
        kern.umweltSpitze &&
        kern.umweltPaket &&
        kern.tierRufPuffer &&
        kern.tierRufSpielen &&
        kern.tierRufPegel &&
        kern.substanzKlang &&
        kern.trefferPaar &&
        kern.SUBSTANZ &&
        kern.fahrtStimme &&
        kern.fahrtMischung &&
        kern.fahrtAmOhr &&
        kern.fahrtImOhr &&
        kern.FAHRT
    ) {
        AnazhRealm._umweltGesetzMemo = { UMWELT: U, kern };
        return AnazhRealm._umweltGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch("klang:UMWELT");
};
// Lofi-Pad-Schicht: Wurzel 110 Hz = A2; die Akkordfolge wächst aus
// Tonleiter + funktionaler Markov-Kette, ein Akkord je 4 Schläge. Web-Audio nativ, kein Asset.
AnazhRealm.LOFI_BASE_FREQ = 110; // A2
// Die Skala wohnt im klang-Gesetzbuch (SCALES + scaleFor; _lofiActiveScale liest fail-closed via
// _klangGenreAusKern).
// Funktionale Harmonie-Markov-Kette: je Stufe (0=i … 6=VII) eine Liste [nächste Stufe, Gewicht] —
// Tonika → Subdominante → Dominante → Tonika; seed-getrieben, nie exakt wiederholt, zielgerichtet.
AnazhRealm.LOFI_HARMONY = Object.freeze([
    Object.freeze([
        [3, 3],
        [5, 3],
        [1, 2],
        [4, 1],
        [2, 1],
    ]), // 0 i   → iv/VI/ii°
    Object.freeze([
        [4, 4],
        [6, 3],
        [0, 1],
    ]), // 1 ii° → v/VII
    Object.freeze([
        [5, 3],
        [3, 3],
        [1, 2],
        [0, 1],
    ]), // 2 III → VI/iv
    Object.freeze([
        [4, 3],
        [6, 3],
        [0, 2],
        [1, 1],
    ]), // 3 iv  → v/VII/i
    Object.freeze([
        [0, 5],
        [5, 2],
        [2, 1],
    ]), // 4 v   → i (Auflösung)
    Object.freeze([
        [3, 3],
        [1, 3],
        [4, 2],
        [2, 1],
    ]), // 5 VI  → iv/ii°
    Object.freeze([
        [0, 4],
        [2, 3],
        [5, 1],
    ]), // 6 VII → i/III
]);
// W4 V3 — helle (Dur-Qualität) + dunkle Stufen für die Emotion-Bias der
// Harmonie-Wahl: joy/hope ziehen zu hell, sorrow zu dunkel.
AnazhRealm.LOFI_BRIGHT_DEGREES = Object.freeze([2, 5]); // III, VI
AnazhRealm.LOFI_DARK_DEGREES = Object.freeze([0, 1, 3]); // i, ii°, iv
// Das Tempo wohnt im klang-Gesetzbuch (GENRES; Leser fail-closed via
// _klangGenreAusKern(KLANG_HOST_RECIPE)). KLANG_HOST_RECIPE = das Genre-Rezept des Host-Lofi-Pads
// (`_klangStudioPreset` liest f.recipes[..].fx.klang live).
AnazhRealm.KLANG_HOST_RECIPE = "lofi";
AnazhRealm.LOFI_CHORD_BEATS = 4; // ein Akkord je 4 Schläge
AnazhRealm.LOFI_VORLAUF_S = 0.3; // so weit vor seinem Einsatz plant `_lofiTick` den Akkord: seine Stimmen fallen je in ein Bild
// Das Trommel-Muster wohnt im klang-Gesetzbuch (RHYTHMUS_MUSTER, Leser _lofiGroovePattern), der
// Swing in fx.klang.dna.swing je Genre (Leser _grooveSwing) — beide fail-closed.
AnazhRealm.MOUNT_SPEED_FACTOR = 0.7; // Compounds fahren etwas langsamer als zu Fuß
// ═══ SCHRITT-KLANG — Material → Timbre (gate:schritt-klang) ═══
// Asset-freie Farnell-Synthese: Quelle ist immer ein Rausch-Burst, das MATERIAL ist der Filter (erde
// dumpf · stein hell · glut warm · quarz/eisen klirrend · wasser platschig); gain bewusst dezent unter
// dem Kampf-One-Shot. Die Bewegungs-Schwelle wohnt in bewegung.schritt.klangTempoMin, das
// Material→Timbre-Gesetz im klang-Gesetzbuch (SCHRITT_TIMBRE), gelesen als Klang-Spalte der Stoff-Tafel (`_stoff`);
// Tick-Deckel und Landungs-Wichtung sind Wirts-Mischpult.
AnazhRealm.SCHRITT_KLANG = Object.freeze({
    get tempoMin() {
        // m/s — darunter (Mikro-Rutsch im Stand) feuert kein Schritt
        return AnazhRealm._bewegungsBlock("schritt", ["taktCompound", "klangTempoMin"]).klangTempoMin;
    },
    maxProTick: 2, // Frame-Hänger feuern keinen Burst-Schwall (max 2 Füße/Frame)
    gainDeckel: 0.12, // absolute Decke jedes Bursts (unter dem Kampf-Treffer)
    landVollMs: 16, // m/s Aufprall (ein Sturz aus ≈ 13 m): hier erreicht die Landung die Decke, darunter steigt sie linear
    landDauerFaktor: 2.0, // die Landung klingt länger nach
    landFreqFaktor: 0.7, // und tiefer — Masse im Aufprall
});

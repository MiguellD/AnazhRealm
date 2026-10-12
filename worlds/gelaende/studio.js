// AnazhRealm — worlds/gelaende/studio.js: DAS GELÄNDE-STUDIO AUF DER WELT-ENGINE (K16b).
//
// `index.html?studio=gelaende` — die Welt läuft wie immer, das Studio legt ein schmales Panel über sie (Garage-Norm:
// halbtransparent, einklappbar) und führt die Kamera (Makro-Flug, langsamer Orbit, Augenhöhe). Es erzeugt nichts selbst:
//   · die REGLER sind die Parameter des EINEN Kerns (`__gelaendeCore.LANDFORM_REGLER`), das Panel baut jede Zeile aus
//     ihnen (Name, Einheit, Bereich, Schritt, Standard, Gesetz); die vier Gruppen zeigen ihre Haupt-Regler, der Rest liegt
//     hinter „mehr";
//   · die MAKRO-ANSICHT und die ZAHL-LEISTE rechnet der Makro-Worker mit demselben Gesetzbuch (`lageAus` → `hoehe`,
//     `statistik`, `urteil`) — sofort beim Griff, ohne den Takt der Welt;
//   · der EXPORT ist EIN Plan (`planNormal`: Saat + Regler), „Welt bauen" legt ihn durch die Welt-Tür des Stamms
//     (`_weltAusPlan` → `_weltBetreten`) — die Welt erwacht neu und liest ihn byte-gleich (gate:worker-dichte --studio).
// Saat-Würfel, vier benannte Landschaften (`LANDFORM_PRESETS`) und der A/B-Umschalter (A = die gebaute Welt, B = der
// Entwurf) liegen am selben Ort.
(function () {
    "use strict";
    let such;
    try {
        such = new URLSearchParams(location.search);
    } catch (_e) {
        return;
    }
    if (such.get("studio") !== "gelaende") return;
    const SKRIPT = document.currentScript && document.currentScript.src;
    const V = (() => {
        try {
            return new URL(SKRIPT).searchParams.get("v") || "";
        } catch (_e) {
            return "";
        }
    })();
    const WELT_SCHLUESSEL = "anazh.gelaende.welt"; // die Welt, die das Studio baut (je Betrachter)

    const CSS = `
#gelaende-studio{--panel:rgba(9,14,20,.72);--ink:#cdd8e2;--mut:#7f8f9c;--hair:rgba(90,140,170,.18);--steel:#4f8fa6;
  --hell:#6fd0e8;--pass:#4ec98a;--fail:#e0664a;--mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
  --sans:system-ui,-apple-system,"Segoe UI",sans-serif;position:fixed;top:14px;right:14px;width:296px;max-height:calc(100vh - 28px);
  overflow-y:auto;z-index:2147483100;background:var(--panel);border:1px solid var(--hair);border-radius:12px;padding:10px 11px 11px;
  backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);font-family:var(--sans);color:var(--ink);font-size:11px;
  box-shadow:0 10px 30px rgba(0,0,0,.28);scrollbar-width:thin;scrollbar-color:rgba(80,130,160,.3) transparent}
#gelaende-studio *{box-sizing:border-box}
#gelaende-studio .kopf{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
#gelaende-studio .eb{font-family:var(--mono);font-size:9.5px;letter-spacing:.3em;color:var(--steel)}
#gelaende-studio .saat{font-family:var(--mono);font-size:9.5px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px}
#gelaende-studio .zu-knopf{background:none;border:1px solid var(--hair);color:var(--mut);border-radius:6px;width:22px;height:20px;cursor:pointer;font-size:12px;line-height:1}
#gelaende-studio.zu{width:auto;padding:8px 10px}
#gelaende-studio.zu .leib{display:none}
#gelaende-studio .makro{position:relative;margin:9px 0 6px;border-radius:8px;overflow:hidden;border:1px solid var(--hair);aspect-ratio:1/1;background:#0b1218}
#gelaende-studio .makro canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:auto}
#gelaende-studio .makro .marke{position:absolute;left:7px;top:6px;font-family:var(--mono);font-size:9px;letter-spacing:.18em;
  color:#e9f3f8;text-shadow:0 1px 2px rgba(0,0,0,.7)}
#gelaende-studio .makro .rechnet{position:absolute;right:7px;top:6px;width:7px;height:7px;border-radius:50%;background:var(--hell);
  opacity:0;transition:opacity .2s;box-shadow:0 0 6px var(--hell)}
#gelaende-studio .makro.laeuft .rechnet{opacity:.9}
#gelaende-studio .reihe{display:flex;gap:5px;flex-wrap:wrap;margin:5px 0}
#gelaende-studio .btn{flex:1;min-width:52px;font-family:var(--sans);font-size:10.5px;color:var(--ink);background:rgba(80,130,160,.10);
  border:1px solid var(--hair);border-radius:7px;padding:6px 4px;cursor:pointer;transition:.13s;text-align:center;white-space:nowrap}
#gelaende-studio .btn:hover{background:rgba(80,130,160,.22)}
#gelaende-studio .btn.an{background:rgba(111,208,232,.16);border-color:rgba(111,208,232,.45);color:var(--hell)}
#gelaende-studio .btn.bau{flex:1 1 100%;font-size:11.5px;font-weight:600;color:#d8f3fb;padding:9px 4px;
  background:linear-gradient(180deg,rgba(111,208,232,.24),rgba(111,208,232,.10));border-color:rgba(111,208,232,.5)}
#gelaende-studio .leiste{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:6px 0 2px}
#gelaende-studio .zahl{border:1px solid var(--hair);border-radius:7px;padding:4px 6px;background:rgba(10,16,22,.35)}
#gelaende-studio .zahl .n{font-size:9px;color:var(--mut);letter-spacing:.04em}
#gelaende-studio .zahl .w{font-family:var(--mono);font-size:11px;margin-top:1px}
#gelaende-studio .zahl.gut{border-color:rgba(78,201,138,.45)} #gelaende-studio .zahl.gut .w{color:var(--pass)}
#gelaende-studio .zahl.rot{border-color:rgba(224,102,74,.55)} #gelaende-studio .zahl.rot .w{color:var(--fail)}
#gelaende-studio .zahl.leer .w{color:var(--mut)}
#gelaende-studio .hist{grid-column:1/3;height:30px;position:relative}
#gelaende-studio .hist canvas{width:100%;height:100%}
#gelaende-studio .sec{font-family:var(--mono);font-size:9px;letter-spacing:.24em;color:var(--steel);margin:10px 2px 3px}
#gelaende-studio .sl{margin:5px 2px 6px}
#gelaende-studio .sl-h{display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:2px}
#gelaende-studio .sl-h .v{font-family:var(--mono);color:var(--hell)}
#gelaende-studio .sl-h .v.std{color:var(--mut)}
#gelaende-studio input[type=range]{width:100%;height:3px;-webkit-appearance:none;appearance:none;background:rgba(120,150,175,.24);border-radius:2px;outline:none;margin:4px 0}
#gelaende-studio input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:var(--hell);cursor:pointer;box-shadow:0 0 0 3px rgba(111,208,232,.16)}
#gelaende-studio input[type=range]::-moz-range-thumb{width:12px;height:12px;border:none;border-radius:50%;background:var(--hell);cursor:pointer}
#gelaende-studio details>summary{cursor:pointer;font-family:var(--mono);font-size:9px;letter-spacing:.24em;color:var(--mut);margin:10px 2px 2px;list-style:none}
#gelaende-studio details>summary::before{content:"▸ ";} #gelaende-studio details[open]>summary::before{content:"▾ ";}
#gelaende-studio .law{font-family:var(--mono);font-size:8.5px;color:var(--mut);opacity:.8;line-height:1.3}
#gelaende-studio .abweichung{font-size:10px;line-height:1.45;color:#ffb4a8;border-left:2px solid #ff6e5a;padding:3px 0 3px 7px;margin:5px 0}
#gelaende-studio .abweichung:empty{display:none}
#gelaende-studio .hinweis{font-size:9.5px;color:var(--mut);margin-top:6px;line-height:1.45}
body.gelaende-studio-an #fadenkreuz,body.gelaende-studio-an #stats-hud,body.gelaende-studio-an #hotbar,
body.gelaende-studio-an #dialogue-box,body.gelaende-studio-an #console,body.gelaende-studio-an #topbar,
body.gelaende-studio-an #statusbar,body.gelaende-studio-an #fps{display:none!important}
`;

    const st = {
        realm: null,
        G: null,
        lageA: null, // A: das Abbild der gebauten Welt (`lageAbbild` ihrer Lage — jede Welt, wie sie steht)
        planB: null, // B: der Entwurf (der Plan, den „Welt bauen" in die Welt legt)
        zeige: "A", // das Studio öffnet über der Welt, wie sie steht
        abweichung: [], // was die Welt trägt und kein Plan (`abweichungDerWelt`) — „Welt bauen" legt die Welt ohne es
        kamera: "makro",
        worker: null,
        naechsteId: 1,
        erg: { A: null, B: null }, // je Spur: { id, lage, plan (nur B), grob, voll, schicht }
        jobs: new Map(), // id → "A" | "B"
        warten: [],
        abdruck: new Map(),
    };
    const $ = (sel) => document.querySelector("#gelaende-studio " + sel);
    const planText = (p) => JSON.stringify(st.G.planNormal(p));
    const zahlFmt = (v, r) => {
        const s = Number.isInteger(r.step) ? String(Math.round(v)) : v.toFixed(r.step < 0.1 ? 2 : r.step < 1 ? 2 : 1);
        return r.einheit === "1" ? s : r.einheit === "°" ? s + "°" : s + " " + r.einheit;
    };

    // ── der Worker ──
    function workerStart() {
        const url = new URL("makro-worker.js" + (V ? "?v=" + V : ""), SKRIPT).href;
        st.worker = new Worker(url);
        st.worker.onmessage = (ev) => {
            const m = ev.data;
            if (m.stufe === "abdruck" || (m.stufe === "fehler" && st.abdruck.has(m.id))) {
                const w = st.abdruck.get(m.id);
                st.abdruck.delete(m.id);
                if (w) m.stufe === "fehler" ? w.rej(new Error(m.grund)) : w.res(m.makroSha);
                return;
            }
            const welcher = st.jobs.get(m.id);
            if (!welcher) return;
            const e = st.erg[welcher];
            if (!e || e.id !== m.id) return;
            if (m.stufe === "fehler") {
                // EIN BRUCH IST LAUT: die Spur zeigt kein Bild mehr, sondern ihren Grund (`zeichne`), und die Konsole nennt ihn
                e.fehler = m.grund;
                console.error(`[Gelände-Studio] ${welcher} bricht: ${m.grund}`);
                if (st.realm && typeof st.realm.log === "function")
                    st.realm.log(`Gelände-Studio: ${welcher} bricht — ${m.grund}`, "ERROR");
                e.schicht = { ort: null, baender: null, urteil: null };
            } else e[m.stufe] = m;
            if (m.stufe === "voll" && !m.statistik) e.schicht = { ort: null };
            if (welcher === st.zeige) zeichne();
            if (e.schicht || e.fehler) {
                st.jobs.delete(m.id);
                ruhePruefen();
            }
        };
    }
    // Eine Lage in den Worker (A: die gebaute Welt, B: die Welt des Entwurfs): die Antwort überholt jeden älteren Auftrag.
    function rechne(welcher) {
        const id = st.naechsteId++;
        st.jobs.forEach((w, alt) => w === welcher && st.jobs.delete(alt));
        const plan = welcher === "B" ? st.G.planNormal(st.planB) : null;
        st.erg[welcher] = { id, plan, lage: plan ? st.G.planAbbild(plan) : st.lageA };
        st.jobs.set(id, welcher);
        st.worker.postMessage({ id, spur: welcher, lage: st.erg[welcher].lage, stufen: ["grob"] });
        const mk = $(".makro");
        if (mk) mk.classList.add("laeuft");
    }
    function ruhig() {
        // ruhig = beide Spuren stehen: A (die gebaute Welt) und B (der jüngste Entwurf)
        const fertig = () => {
            const a = st.erg.A;
            const b = st.erg.B;
            const steht = (e) => !!(e && (e.fehler || (e.voll && e.schicht)));
            return steht(a) && steht(b) && !!b.plan && planText(b.plan) === planText(st.planB);
        };
        if (fertig()) return Promise.resolve();
        return new Promise((res) => st.warten.push({ fertig, res }));
    }
    function ruhePruefen() {
        const mk = $(".makro");
        const e = st.erg[st.zeige];
        if (mk) mk.classList.toggle("laeuft", !(e && (e.schicht || e.fehler)));
        st.warten = st.warten.filter((w) => {
            if (!w.fertig()) return true;
            w.res();
            return false;
        });
    }

    // ── die Makro-Ansicht ──
    let bildCanvas = null;
    function zeichne() {
        const e = st.erg[st.zeige];
        const bild = e && (e.voll || e.grob);
        const cv = $("canvas.relief");
        // Unter A steht nur das Bild der gebauten Welt, unter B nur das des Entwurfs: rechnet die Spur noch, bleibt das Feld
        // leer (nie das Bild der anderen Spur unter diesem Namen); bricht sie, steht ihr Grund im Feld.
        if (cv && !bild) {
            const ctx = cv.getContext("2d");
            ctx.clearRect(0, 0, cv.width, cv.height);
            if (e && e.fehler) {
                ctx.fillStyle = "rgba(60,12,10,.92)";
                ctx.fillRect(0, 0, cv.width, cv.height);
                ctx.fillStyle = "#ffb4a8";
                ctx.font = "15px ui-monospace, monospace";
                const worte = `${st.zeige} BRICHT: ${e.fehler}`.split(" ");
                let zeile = "";
                let y = 40;
                for (const w of worte) {
                    if (ctx.measureText(zeile + w).width > cv.width - 40) {
                        ctx.fillText(zeile, 20, y);
                        zeile = "";
                        y += 22;
                    }
                    zeile += w + " ";
                }
                ctx.fillText(zeile, 20, y);
            }
        }
        if (bild && cv) {
            if (!bildCanvas || bildCanvas.width !== bild.n) {
                bildCanvas = document.createElement("canvas");
                bildCanvas.width = bildCanvas.height = bild.n;
            }
            bildCanvas
                .getContext("2d")
                .putImageData(new ImageData(new Uint8ClampedArray(bild.px), bild.n, bild.n), 0, 0);
            const ctx = cv.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(bildCanvas, 0, 0, cv.width, cv.height);
        }
        const marke = $(".makro .marke");
        if (marke)
            marke.textContent =
                (st.zeige === "A" ? "A · GEBAUT" : "B · ENTWURF") + (e && e.fehler ? " — BRUCH" : "");
        leiste();
    }
    // Der Ort des Spielers und der Blick der Kamera über dem Relief.
    function zeichneOrt() {
        const cv = $("canvas.ort");
        const r = st.realm;
        if (!cv || !r || !r.state || !r.state.playerMesh) return;
        const ctx = cv.getContext("2d");
        ctx.clearRect(0, 0, cv.width, cv.height);
        const p = r.state.playerMesh.position;
        const k = cv.width / (268 * 30);
        const x = (p.x + 4010) * k;
        const y = (p.z + 4010) * k;
        const cam = r.state.camera;
        if (cam) {
            const dx = p.x - cam.position.x;
            const dz = p.z - cam.position.z;
            const a = Math.atan2(dz, dx);
            const cx = (cam.position.x + 4010) * k;
            const cy = (cam.position.z + 4010) * k;
            ctx.fillStyle = "rgba(111,208,232,.16)";
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, 46, a - 0.5, a + 0.5);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "rgba(0,0,0,.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
    }

    // ── die Zahl-Leiste ──
    function leiste() {
        const box = $(".leiste");
        if (!box) return;
        const e = st.erg[st.zeige];
        const v = e && e.voll;
        const s = v && v.statistik;
        const u = (e && e.schicht && e.schicht.urteil) || (v && v.urteil) || {};
        const b = e && e.schicht && e.schicht.baender;
        const pz = (x) => (100 * x).toFixed(1).replace(".", ",");
        const kz = (x) => (x == null ? "–" : String(x).replace(".", ","));
        // Die Titel lesen den Korridor, die Linse und die Bänder des Kerns (`KORRIDOR`, `LINSE`, `HANG_BAENDER`) — kein Text-Zwilling.
        const K = st.G.KORRIDOR;
        const LI = st.G.LINSE;
        const HB = st.G.HANG_BAENDER;
        const bd = (b) => `${kz(b[0])}–${kz(b[1])}°`;
        const zeilen = [
            [
                "Senken > 1 m",
                s ? `${kz(s.senken1mJeKm2)} / km²` : "…",
                u.senken,
                `≤ ${kz(K.senkenJeKm2)} je km² (Lindsay & Creed)`,
            ],
            [
                "Flint θ",
                s ? `${kz(s.flint.theta)} · R² ${kz(s.flint.r2)}` : "…",
                u.flint,
                `θ ${kz(K.thetaMin)}–${kz(K.thetaMax)} bei R² ≥ ${kz(K.r2Min)}`,
            ],
            [
                "sanfte km²",
                s ? `${s.hammond.sanft} / ${s.hammond.fenster}` : "…",
                u.hammond,
                `Hammond: ≥ ${K.hammondSanft} Fenster, > ½ unter ${kz(100 * LI.hangSanft)} %`,
            ],
            [
                "Dorfplätze",
                s ? String(s.dorfplaetze) : "…",
                u.dorfplaetze,
                `≥ ${K.dorfplaetze} (${LI.platzSeite} m, ≤ ${kz(100 * LI.hangSanft)} %, ≤ ${kz(LI.platzSpanne)} m)`,
            ],
            [
                "Schicht-Gesetz",
                !e || !e.schicht
                    ? "…"
                    : b
                      ? `K ${pz(b.kliff)}  S ${pz(b.schutt)}  P ${pz(b.pediment)}`
                      : "kein Tafelland",
                u.schicht,
                `Kliff ≥ ${pz(K.kliff)} % · Schutt ≥ ${pz(K.schutt)} % · Pediment ≥ ${pz(K.pediment)} %`,
            ],
            [
                "Hang p50 · p90",
                s ? `${kz(s.hang.p50Prozent)} · ${kz(s.hang.p90Prozent)} %` : "…",
                null,
                "Anteil der Hänge",
            ],
        ];
        box.innerHTML = "";
        for (const [n, w, ok, titel] of zeilen) {
            const d = document.createElement("div");
            d.className = "zahl " + (ok === true ? "gut" : ok === false ? "rot" : "leer");
            d.title = titel;
            d.innerHTML = `<div class="n"></div><div class="w"></div>`;
            d.firstChild.textContent = n;
            d.lastChild.textContent = w;
            box.appendChild(d);
        }
        const h = document.createElement("div");
        h.className = "hist";
        h.title = `Hang-Histogramm je 5° (grün: Pediment ${bd(HB.pediment)}, ocker: Schutthang ${bd(HB.schutt)}, rot: Kliff ≥ ${kz(HB.kliff[0])}°)`;
        const cv = document.createElement("canvas");
        cv.width = 270;
        cv.height = 30;
        h.appendChild(cv);
        box.appendChild(h);
        const hist = s && s.hang.grad5;
        if (hist) {
            const ctx = cv.getContext("2d");
            const max = Math.max(1, ...hist.map((x) => Math.sqrt(x)));
            const w = cv.width / hist.length;
            // je Klasse [g, g + 5°) die Farbe des Bandes, das sie berührt
            const in_ = (b, g) => g < b[1] && g + 5 > b[0];
            hist.forEach((x, i) => {
                const g = i * 5;
                ctx.fillStyle = in_(HB.kliff, g)
                    ? "#e0664a"
                    : in_(HB.schutt, g)
                      ? "#d9a55a"
                      : in_(HB.pediment, g)
                        ? "#4ec98a"
                        : "#6d8a9c";
                const hh = (Math.sqrt(x) / max) * (cv.height - 2);
                ctx.fillRect(i * w + 1, cv.height - hh, w - 2, hh);
            });
        }
    }

    // ── das Panel ──
    function regler(id) {
        return st.G.LANDFORM_REGLER.find((r) => r.id === id);
    }
    function schieber(R) {
        const d = document.createElement("div");
        d.className = "sl";
        d.title = R.law;
        d.innerHTML = `<div class="sl-h"><span class="n"></span><span class="v"></span></div><input type="range">`;
        d.querySelector(".n").textContent = st.G.LANDFORM_NAMEN[R.id] || R.id;
        const inp = d.querySelector("input");
        inp.min = R.min;
        inp.max = R.max;
        inp.step = R.step;
        inp.dataset.regler = R.id;
        inp.addEventListener("input", () => {
            const v = Number(inp.value);
            st.planB = Object.assign({}, st.planB, { regler: Object.assign({}, st.planB.regler, { [R.id]: v }) });
            zeigeWerte();
            entwurfGeaendert();
        });
        inp.addEventListener("dblclick", () => {
            inp.value = R.def;
            inp.dispatchEvent(new Event("input"));
        });
        return d;
    }
    function zeigeWerte() {
        for (const inp of document.querySelectorAll("#gelaende-studio input[data-regler]")) {
            const R = regler(inp.dataset.regler);
            const v = st.planB.regler[R.id];
            if (Number(inp.value) !== v) inp.value = v;
            const w = inp.parentNode.querySelector(".v");
            w.textContent = zahlFmt(v, R);
            w.classList.toggle("std", v === R.def);
        }
        const s = $(".saat");
        if (s) s.textContent = st.planB.saat;
        for (const k of document.querySelectorAll("#gelaende-studio [data-preset]")) {
            const P = st.G.LANDFORM_PRESETS.find((p) => p.id === k.dataset.preset);
            const an = st.G.LANDFORM_REGLER.every(
                (R) => st.planB.regler[R.id] === (R.id in P.regler ? P.regler[R.id] : R.def)
            );
            k.classList.toggle("an", an);
        }
    }
    function entwurfGeaendert() {
        st.zeige = "B";
        ab();
        rechne("B");
        zeichne();
    }
    function ab() {
        for (const k of document.querySelectorAll("#gelaende-studio [data-ab]"))
            k.classList.toggle("an", k.dataset.ab === st.zeige);
    }
    function kameraKnoepfe() {
        for (const k of document.querySelectorAll("#gelaende-studio [data-kamera]"))
            k.classList.toggle("an", k.dataset.kamera === st.kamera);
    }
    function knopf(text, titel, fn, attr) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn";
        b.textContent = text;
        if (titel) b.title = titel;
        if (attr) for (const k in attr) b.dataset[k] = attr[k];
        b.addEventListener("click", fn);
        return b;
    }
    function baue() {
        const style = document.createElement("style");
        style.textContent = CSS;
        document.head.appendChild(style);
        document.body.classList.add("gelaende-studio-an");
        const p = document.createElement("section");
        p.id = "gelaende-studio";
        p.setAttribute("aria-label", "Gelände-Studio");
        p.innerHTML = `<div class="kopf"><span class="eb">GELÄNDE-STUDIO</span><span class="saat"></span><button type="button" class="zu-knopf" title="einklappen">–</button></div>
<div class="leib"><div class="makro"><canvas class="relief" width="536" height="536"></canvas><canvas class="ort" width="274" height="274"></canvas><span class="marke"></span><span class="rechnet"></span></div>
<div class="reihe ab"></div><div class="abweichung" role="status"></div><div class="leiste"></div><div class="sec">LANDSCHAFT</div><div class="reihe presets"></div><div class="gruppen"></div>
<details class="mehr"><summary>MEHR</summary><div class="mehr-leib"></div></details>
<div class="sec">KAMERA</div><div class="reihe kamera"></div><div class="reihe bauen"></div><div class="reihe datei"></div>
<div class="hinweis">Der Entwurf rechnet sofort im Kern; „Welt bauen" legt ihn durch die Welt-Tür — die Welt erwacht neu auf ihm. Doppelklick auf einen Regler: Standard.</div></div>`;
        document.body.appendChild(p);
        p.querySelector(".zu-knopf").addEventListener("click", () => {
            p.classList.toggle("zu");
            p.querySelector(".zu-knopf").textContent = p.classList.contains("zu") ? "+" : "–";
        });
        const abR = $(".reihe.ab");
        abR.appendChild(
            knopf("A · gebaut", "die Welt, wie sie steht", () => ((st.zeige = "A"), ab(), zeichne(), ruhePruefen()), {
                ab: "A",
            })
        );
        abR.appendChild(
            knopf(
                "B · Entwurf",
                "der Entwurf am selben Ort",
                () => ((st.zeige = "B"), ab(), zeichne(), ruhePruefen()),
                { ab: "B" }
            )
        );
        abR.appendChild(
            knopf("⚂ Saat", "eine neue Saat würfeln", () => {
                const z = (k) =>
                    Array.from(crypto.getRandomValues(new Uint8Array(k)), (x) => (x % 36).toString(36)).join("");
                st.planB = Object.assign({}, st.planB, { saat: `w-${z(12)}-${z(6)}` });
                zeigeWerte();
                entwurfGeaendert();
            })
        );
        const pr = $(".reihe.presets");
        for (const P of st.G.LANDFORM_PRESETS)
            pr.appendChild(
                knopf(
                    P.name,
                    P.bild,
                    () => {
                        const rg = {};
                        for (const R of st.G.LANDFORM_REGLER) rg[R.id] = R.id in P.regler ? P.regler[R.id] : R.def;
                        st.planB = Object.assign({}, st.planB, { regler: rg });
                        zeigeWerte();
                        entwurfGeaendert();
                    },
                    { preset: P.id }
                )
            );
        const gruppen = $(".gruppen");
        const mehr = $(".mehr-leib");
        const haupt = new Set();
        for (const g of Object.keys(st.G.LANDFORM_HAUPT)) {
            const sec = document.createElement("div");
            sec.className = "sec";
            sec.textContent = (st.G.LANDFORM_NAMEN[g] || g).toUpperCase();
            gruppen.appendChild(sec);
            for (const id of st.G.LANDFORM_HAUPT[g]) {
                haupt.add(id);
                gruppen.appendChild(schieber(regler(id)));
            }
        }
        let gruppe = null;
        for (const R of st.G.LANDFORM_REGLER) {
            if (haupt.has(R.id)) continue;
            if (R.gruppe !== gruppe) {
                gruppe = R.gruppe;
                const sec = document.createElement("div");
                sec.className = "sec";
                sec.textContent = (st.G.LANDFORM_NAMEN[gruppe] || gruppe).toUpperCase();
                mehr.appendChild(sec);
            }
            mehr.appendChild(schieber(R));
        }
        const kam = $(".reihe.kamera");
        kam.appendChild(knopf("Makro-Flug", "hoch über dem Land", () => kamera("makro"), { kamera: "makro" }));
        kam.appendChild(knopf("Orbit", "langsam um den Ort", () => kamera("orbit"), { kamera: "orbit" }));
        kam.appendChild(knopf("Augenhöhe", "zu Fuß in der Welt", () => kamera("auge"), { kamera: "auge" }));
        const bauR = $(".reihe.bauen");
        const bau = knopf("Welt bauen", "der Entwurf wird die Welt (die Welt erwacht neu)", weltBauen);
        bau.classList.add("bau");
        bauR.appendChild(bau);
        const dat = $(".reihe.datei");
        dat.appendChild(knopf("Plan exportieren", "EIN Plan: Saat + Regler", exportiere));
        dat.appendChild(knopf("Plan laden", "einen Plan als Entwurf öffnen", lade));
        dat.appendChild(
            knopf("Spielen", "das Studio schließen, die Welt bleibt", () => (location.href = location.pathname))
        );
        ab();
        kameraKnoepfe();
        zeigeWerte();
        setInterval(zeichneOrt, 250);
    }

    // ── Bauen, Export, Laden ──
    function weltBauen() {
        const r = st.realm;
        const snap = r._weltAusPlan(st.planB);
        let eigene = null;
        try {
            eigene = localStorage.getItem(WELT_SCHLUESSEL);
        } catch (_e) {
            /* ohne Speicher: jede Welt neu */
        }
        // Die Welt des Studios wird ersetzt, nie eine andere: steht das Studio über einer fremden Welt, legt es seine daneben.
        const aktiv = r.state.worldMeta && r.state.worldMeta.worldId;
        if (eigene && eigene === aktiv) {
            snap.worldMeta.worldId = eigene;
            snap.worldMeta.slug = r.state.worldMeta.slug || snap.worldMeta.slug;
        }
        try {
            localStorage.setItem(WELT_SCHLUESSEL, snap.worldMeta.worldId);
        } catch (_e) {
            /* */
        }
        const erg = r._weltBetreten(snap);
        if (!erg.ok) alert(`Die Welt ließ sich nicht bauen: ${erg.reason}`);
    }
    function exportPlan() {
        return JSON.stringify(st.G.planNormal(st.planB), null, 1);
    }
    function exportiere() {
        const blob = new Blob([exportPlan()], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `gelaende-plan-${st.planB.saat}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
    function lade() {
        const inp = document.createElement("input");
        inp.type = "file";
        inp.accept = "application/json,.json";
        inp.addEventListener("change", () => {
            const f = inp.files && inp.files[0];
            if (!f) return;
            f.text().then((t) => {
                try {
                    st.planB = st.G.planNormal(JSON.parse(t));
                    zeigeWerte();
                    entwurfGeaendert();
                } catch (e) {
                    alert(String((e && e.message) || e));
                }
            });
        });
        inp.click();
    }

    // ── die Kamera: Makro-Flug, Orbit, Augenhöhe ──
    const kam = { pos: null, ziel: null, t: 0, az: 0.6 };
    function kamera(modus) {
        st.kamera = modus;
        kameraKnoepfe();
        const r = st.realm;
        if (!r || typeof r.kameraFuehren !== "function") return;
        if (modus === "auge") {
            r.kameraFuehren(null);
            kam.pos = null;
            return;
        }
        // Erst kommt der Spieler an (das erste fertige Weltbild, `_weltbildDa`), dann steigt die Kamera — der Ladeschirm
        // wartet auf die Welt um den Spieler, nie auf einen Blick aus 400 m.
        if (!r.state._weltbildDa) {
            setTimeout(() => st.kamera === modus && kamera(modus), 250);
            return;
        }
        r.kameraFuehren(fuehre);
    }
    function fuehre(camera, t, p) {
        const dt = kam.t ? Math.min(0.1, Math.max(0, t - kam.t)) : 0; // t in Sekunden (der Loop-Takt)
        kam.t = t;
        const r = st.realm;
        const boden = (x, z) => {
            const y = r._terrainMacroSurfaceY(x, z, false);
            return Number.isFinite(y) ? y : p.y;
        };
        let wx;
        let wy;
        let wz;
        let zx = p.x;
        let zy;
        let zz = p.z;
        if (st.kamera === "makro") {
            // Hoch über dem GEBAUTEN Boden (die Kamera bleibt über dem Kreis der Chunks, der Blick geht weit übers Land);
            // langsam genug, dass die Szene-Auflösung voll bleibt (PERF_CAM_POSVEL_FULL: 11 m/s senkt sie auf 60 %).
            kam.az += dt * 0.012;
            const d = 110;
            wx = p.x - Math.sin(kam.az) * d;
            wz = p.z - Math.cos(kam.az) * d;
            wy = Math.max(boden(wx, wz) + 150, p.y + 210);
            zx = p.x + Math.sin(kam.az) * 900;
            zz = p.z + Math.cos(kam.az) * 900;
            zy = boden(zx, zz) - 60;
        } else {
            kam.az += dt * 0.022;
            const d = 150;
            wx = p.x - Math.sin(kam.az) * d;
            wz = p.z - Math.cos(kam.az) * d;
            wy = Math.max(boden(wx, wz) + 18, p.y + 55);
            zy = p.y + 6;
        }
        if (!kam.pos) kam.pos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
        if (!kam.ziel) kam.ziel = { x: zx, y: zy, z: zz };
        const k = 1 - Math.exp(-dt / 1.1);
        kam.pos.x += (wx - kam.pos.x) * k;
        kam.pos.y += (wy - kam.pos.y) * k;
        kam.pos.z += (wz - kam.pos.z) * k;
        kam.ziel.x += (zx - kam.ziel.x) * k;
        kam.ziel.y += (zy - kam.ziel.y) * k;
        kam.ziel.z += (zz - kam.ziel.z) * k;
        camera.position.set(kam.pos.x, kam.pos.y, kam.pos.z);
        camera.lookAt(kam.ziel.x, kam.ziel.y, kam.ziel.z);
    }

    // ── die Welt, der Entwurf und der Start ──
    // A ist die gebaute Welt, wie sie steht: das Abbild IHRER Lage (Saat, Basis, Wasser, jeder Term des Erbguts) — nie eine
    // Projektion auf einen Plan. Der Entwurf B beginnt bei ihrer Saat und den Reglern ihres Wildnis-Terms; B zeigt die Welt,
    // die „Welt bauen" aus ihm gebiert (`planAbbild`).
    function entwurfDerWelt(r) {
        const G = st.G;
        const L = r._gelaende();
        return G.planNormal({ art: G.PLAN_ART, v: G.PLAN_VERSION, saat: String(L.seed), regler: G.landformRegler(L) });
    }
    // WAS DIE WELT TRÄGT UND KEIN PLAN: der Entwurf beginnt bei ihrer Saat und den Reglern ihres Wildnis-Terms; jeder andere
    // Term, eine Basis, ein Meer oder eine Kachel neben dem Grund des Kerns fällt, wenn „Welt bauen" den Entwurf legt. Das
    // Studio nennt es (`.abweichung`), nie still — Leser: das Panel und die Studio-Probe (gate:gelaende-studio, Start-Wand).
    function abweichungDerWelt(lageA, plan) {
        const p = st.G.planAbbild(plan);
        const ab = [];
        (lageA.erbgut.terme || []).forEach((t, i) => {
            if (!(i === 0 && t.art === "wildnis")) ab.push(String(t.art));
        });
        const kz = (x) => String(Math.round(x * 10) / 10).replace(".", ",");
        if (lageA.baseHeight !== p.baseHeight) ab.push(`Basis ${kz(lageA.baseHeight)} m → ${kz(p.baseHeight)} m`);
        if (lageA.waterLevel !== p.waterLevel) ab.push(`Meer ${kz(lageA.waterLevel)} m → ${kz(p.waterLevel)} m`);
        if (lageA.regionSize !== p.regionSize) ab.push(`Kachel ${kz(lageA.regionSize)} m → ${kz(p.regionSize)} m`);
        return ab;
    }
    function zeigeAbweichung() {
        const el = $(".abweichung");
        if (!el) return;
        el.textContent = st.abweichung.length
            ? `Die Welt trägt, was kein Plan trägt: ${st.abweichung.join(" · ")} — „Welt bauen" legt sie ohne es.`
            : "";
    }
    function start() {
        const r = window.anazhRealm;
        const G = window.__gelaendeCore;
        // die Welt steht erst mit ihrem Wasserspiegel (`_buildWaterPlane`) — vorher wäre das Abbild ihrer Lage unvollständig
        const da = r && G && r.state && r.state.worldMeta && r.state.scene && typeof r._gelaende === "function";
        if (!da || typeof r.state.waterLevel !== "number") {
            setTimeout(start, 120);
            return;
        }
        st.realm = r;
        st.G = G;
        st.lageA = G.lageAbbild(r._gelaende());
        st.planB = entwurfDerWelt(r);
        st.abweichung = abweichungDerWelt(st.lageA, st.planB);
        workerStart();
        baue();
        zeigeAbweichung();
        rechne("A");
        rechne("B");
        kamera(st.kamera);
        // DIE PROBE (gate:worker-dichte --studio) und die Werkbank lesen das Studio hier.
        window.__gelaendeStudio = Object.freeze({
            ruhig,
            // der Stand der GEZEIGTEN Spur (A oder B) — plan ist immer der Entwurf
            zustand() {
                const e = st.erg[st.zeige] || {};
                const v = e.voll || {};
                return {
                    zeigt: st.zeige,
                    plan: st.G.planNormal(st.planB),
                    rasterSha: v.rasterSha || null,
                    makroSha: v.makroSha || null,
                    statistik: v.statistik || null,
                    urteil: (e.schicht && e.schicht.urteil) || v.urteil || null,
                    schicht: (e.schicht && e.schicht.baender) || null,
                    raster: v.raster || null,
                    abweichung: st.abweichung.slice(),
                    fehler: e.fehler || null,
                };
            },
            exportPlan,
            makroShaVon(plan) {
                const id = st.naechsteId++;
                return new Promise((res, rej) => {
                    st.abdruck.set(id, { res, rej });
                    st.worker.postMessage({ art: "abdruck", id, lage: st.G.planAbbild(plan) });
                });
            },
            kamera,
            zeige(w) {
                st.zeige = w === "A" ? "A" : "B";
                ab();
                zeichne();
            },
        });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
})();

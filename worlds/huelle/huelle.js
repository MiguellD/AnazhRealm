/* worlds/huelle/huelle.js — DIE STUDIO-HÜLLE (Studio-Welle 1, K41; Synthese §2.1, W4a).
 *
 * EIN UI-Modul, das die Studio-Shells (worlds/<studio>/index.html, `<script src="../huelle/huelle.js">`) UND die
 * Welt-Werkstatt (index.html, stamm §23) laden. Es erzeugt nichts, was ein Gesetzbuch kann: es liest die Regler-Zeilen
 * des Kerns (PARAMS_BY_KIND: id · lab · min · max · step · def · law · grp · dyn) und die Budget-Zeilen
 * (PORTAL_RENDER_CONFIG.lod.budget), und es spricht das EINE Portal-Protokoll der Heimat. Bausteine:
 *
 *   regler(ziel, zeilen, opt)  DER Regler-Generator — jede Zeile ein Schieber (eine 0/1-Zeile mit step 1 ein Schalter),
 *                              Gruppen-Titel aus grp, Gesetz-Zeile aus law, Entprellung (ruheMs, Standard 180 ms; 0 =
 *                              ein Aufbau je Bild), Zurücksetzen. Die Werte leben in `opt.werte` (das P der Shell, IN
 *                              PLACE beschrieben) — die Shell liest ihr P, nie das DOM.
 *   sitzung(opt)               Seed + Sperre je Achse + Undo/Redo über Werte-Diffs (Strg+Z · Strg+Umschalt+Z · Strg+Y);
 *                              `schritt(fn)` macht aus jeder Tat (Preset, Kultur, Würfel) EINEN Rückgängig-Schritt;
 *                              ein offener Regler-Zug wird sein Schritt, bevor der Verlauf geht (`abschliessen`).
 *   kosten(ziel, opt)          die Kosten-Leiste je LOD-Stufe: Dreiecke · Befehle · VRAM · Stoffe · Schatten gegen die
 *                              Budget-Zeile des Kerns, der Faktor zum Band; gemessen an der Welt-Gestalt (`bauen(stufe)` =
 *                              buildInstance des Kerns) oder an der Labor-Gestalt (`messen(obj, stufe)`), meshfrei benannt; die
 *                              Welt-Werkstatt setzt die am Foundry-Werk gezählten Kosten (`setzen(stufe, kosten)`). Reicht das
 *                              Studio seinen Renderer (`opt.renderer`, wie panorama()), steht neben jeder gezählten Zahl die
 *                              GEZEICHNETE: das Werk allein in einem eigenen Render-Abschnitt — renderer.info, die
 *                              Speicher-Karte je Werk-Puffer und die Zeitstempel des Abschnitts (studios.K3); VRAM und GPU-ms
 *                              gegen ihren Anteil am Profi-Band. Ein meshfreies Klang-Studio reicht seinen Kern (`opt.klang`):
 *                              die Audio-Graph-ms seines Umwelt-Graphen je Ort.
 *   bruecke(opt)               die Portal-Brücke + der DSL-Adapter (skeleton-Norm): ready EINMAL (kein Echo), nur der
 *                              Eltern-Rahmen spricht, `["chain", …]` rekursiv, das Einzelwort der Heimat (["w", …args])
 *                              ganz — nie op[0] je Element (aus "gt" wurde "g"). Esc bringt heim, außer die Welt behält ihn.
 *                              DER EINE ÜBERGABE-KANAL: `werk(kind, preset, seed, ov)` schickt das Werk des Studios in die
 *                              Welt, der Knopf „In der Welt ansehen" (opt.werk) schickt es und kehrt heim. Der Avatar des
 *                              enter (Leib · Inventar · Gehaltenes, `gepaeck`) bleibt drüben gehalten: `reisender()`.
 *   panorama(T, renderer, scene, ort, opt)  DAS ZIEL-BILD (D8): die Welt des Studios als Equirekt 512 × 256, linear, aus
 *                              ihrem eigenen Renderer, EINE CPU-Faltung für jede Engine — das Labor liest es selbst
 *                              (textur), die Brücke exportiert es (daten; unter r184 WebGPU ein Versprechen);
 *                              panoramaBild(maler) dasselbe für die flache Welt (sie malt ihr Equirekt selbst)
 *   matrix(opt)                DIE MATRIX-TAFEL (w11-leib): der Kern-Zustand des gezeigten Leibs — Skelett, Gang-Phase je Fuß,
 *                              der Schwerpunkt über der Stützfläche (der Stand aus tetrapoda `gangFuss`); Körper-Studio und
 *                              Tetrapoda lesen sie, `stand()` hält den letzten Einblick für die Linsen
 *   toast(text, ms) · zufall(seed) · knopfMitText(wurzel, wort) · zeiger(el) — DER EINE Zeiger-Fang jeder Seite
 *
 * Die Hülle ändert keine Bau-Bytes: sie reicht Werte durch, die Gesetzbücher bauen (gate:asset-contract unverändert).
 * Die Wand: gate:studio-huelle (scripts/diag-studio-huelle.cjs) — kein Hand-Regler, keine Brücken-Kopie außerhalb.
 */
(function (wurzel) {
    "use strict";
    if (wurzel.AnazhHuelle) return;
    var doc = wurzel.document;
    // der Ort dieses Skripts (Studio-Shell wie Welt-Werkstatt): von ihm aus liegt das Profi-Band (`band`, die Kosten-Leiste)
    var HIER = doc && doc.currentScript ? doc.currentScript.src : null;

    function el(tag, klasse, text) {
        var e = doc.createElement(tag);
        if (klasse) e.className = klasse;
        if (text != null) e.textContent = text;
        return e;
    }
    function zahl(v, ersatz) {
        return typeof v === "number" && isFinite(v) ? v : ersatz;
    }

    // ── DER ZUFALL MIT SAAT (mulberry32) — derselbe Same gibt dieselbe Variante ──
    function zufall(seed) {
        var a = seed >>> 0;
        return function () {
            a = (a + 0x6d2b79f5) >>> 0;
            var t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // ── DER ZEIGER — EIN Fang je Seite (w27-zeiger): requestPointerLock wirft synchron oder lehnt sein Versprechen ab — ohne Geste,
    // ohne Fokus (im sichtbaren Fenster der Proben: „WrongDocumentError … not valid for pointer lock“ aus enterPlay des Körper-Studios,
    // tiere.K3#2 an da0e790f ROT). Beides ist kein Seiten-Fehler: der nächste Klick fängt den Zeiger.
    function zeiger(el) {
        if (!el || typeof el.requestPointerLock !== "function") return;
        try {
            const p = el.requestPointerLock();
            if (p && typeof p.catch === "function") p.catch(function () {});
        } catch (_e) {
            /* ohne Geste kein Lock */
        }
    }

    // ── TOAST — EINE Meldungs-Zeile je Seite ──
    function toast(text, ms) {
        if (!doc || !doc.body) return;
        var t = doc.getElementById("h-toast");
        if (!t) {
            t = el("div", "h-toast");
            t.id = "h-toast";
            t.setAttribute("role", "status");
            doc.body.appendChild(t);
        }
        t.textContent = String(text);
        t.classList.add("an");
        clearTimeout(t._uhr);
        t._uhr = setTimeout(function () {
            t.classList.remove("an");
        }, ms || 2400);
    }

    // ── Werte-Schnappschuss und Diff (die Währung von Undo/Redo) ──
    // Ein Objekt-Wert (die Aufgabe der Schmiede, ein Farb-Satz …) reist als JSON-Text — ein In-Place-Umbau des Objekts
    // ist so ein Diff wie jeder andere, der Rückweg baut ein frisches Objekt.
    var ZUSTAND = "__zustand";
    var JSON_MARKE = "\u0000json:";
    function schnapp(werte, zustand) {
        var s = {};
        for (var k in werte)
            if (Object.prototype.hasOwnProperty.call(werte, k)) {
                var v = werte[k];
                s[k] = v !== null && typeof v === "object" ? JSON_MARKE + JSON.stringify(v) : v;
            }
        if (zustand) s[ZUSTAND] = JSON.stringify(zustand());
        return s;
    }
    function auspacken(v) {
        return typeof v === "string" && v.indexOf(JSON_MARKE) === 0 ? JSON.parse(v.slice(JSON_MARKE.length)) : v;
    }
    function diffVon(a, b) {
        var d = null;
        var k;
        for (k in b)
            if (Object.prototype.hasOwnProperty.call(b, k) && a[k] !== b[k]) {
                d = d || {};
                d[k] = [a[k], b[k]];
            }
        for (k in a)
            if (Object.prototype.hasOwnProperty.call(a, k) && !Object.prototype.hasOwnProperty.call(b, k)) {
                d = d || {};
                d[k] = [a[k], undefined];
            }
        return d;
    }

    function stellen(step) {
        if (!(step > 0) || step >= 1) return 0;
        var s = String(step);
        var i = s.indexOf(".");
        return i < 0 ? 0 : Math.min(4, s.length - i - 1);
    }
    function istSchalter(z) {
        return z.min === 0 && z.max === 1 && z.step === 1;
    }

    // ── DER GANG (studios.K2): Griff → erstes Bild mit neuem Bau-Hash. Der Bau-Hash ist der Plan der Bühne (die Werte der
    // Regler-Zeilen samt Zustand: Rezept, Saat — der Kern baut deterministisch, gleicher Plan = gleiche Bytes). Ein Griff stempelt
    // seine Zeit am Eingabe-Ereignis; hat der Zeichner der Seite den Plan angewandt (bei bzw. nachRuhe kehrte zurück), trägt der
    // nächste rAF-Rückruf (er läuft nach dem Render-Rückruf der Seite im selben Bild) das Bild. Leser: diag-studio-huelle --engine.
    function bauHash(s) {
        var t = JSON.stringify(s);
        var h = 0x811c9dc5;
        for (var i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 0x01000193);
        return (h >>> 0).toString(16);
    }
    var gang = { griffe: [], bild: null };
    var gangBild = 0;
    function jetzt() {
        return wurzel.performance ? wurzel.performance.now() : Date.now();
    }
    function imBild(fn) {
        return wurzel.requestAnimationFrame ? wurzel.requestAnimationFrame(fn) : setTimeout(fn, 16);
    }
    function gangGriff(z, t0) {
        gang.griffe.push({ id: z.id, uniform: !!z.uniform, t0: t0, hash: null, t1: null });
        if (gang.griffe.length > 256) gang.griffe.shift();
    }
    function gangBau(s) {
        var h = bauHash(s);
        var neu = gang.griffe.filter(function (g) {
            return g.hash == null;
        });
        if (!neu.length || h === gang.bild) return;
        neu.forEach(function (g) {
            g.hash = h;
        });
        if (gangBild) return;
        gangBild = imBild(function () {
            gangBild = 0;
            var t = jetzt();
            gang.griffe.forEach(function (g) {
                if (g.hash != null && g.t1 == null) {
                    g.t1 = t;
                    gang.bild = g.hash;
                }
            });
        });
    }

    // ── DER REGLER-GENERATOR ──
    // zeilen: die PARAMS-Zeilen des Kerns (oder Bedienungs-Zeilen der Shell in DERSELBEN Form).
    // opt: werte (P, in place) · start(z) Startwert ohne Wert · format(z, v) · bei(id, v, z) sofort · nachRuhe(ids, bau)
    //      entprellt (bau = eine Nicht-dyn-Zeile ist dabei) · ruheMs · sitzung · zuruecksetzen (false = kein Knopf) ·
    //      basis() die Werte des Zurücksetzens (Standard def) · domId(z) · klassen {zeile, kopf, wert, gruppe, knopf} ·
    //      gruppen (false = keine Titel) · gesetze (false = keine Gesetz-Zeile) · leeren (false = ziel nicht leeren)
    function regler(ziel, zeilen, opt) {
        opt = opt || {};
        var werte = opt.werte || {};
        var kl = opt.klassen || {};
        var liste = (zeilen || []).filter(function (z) {
            return z && typeof z.id === "string";
        });
        var nachId = {};
        var els = {};
        var offen = {};
        var vorher = null;
        var uhr = null;
        var bild = 0;
        var gesetzBild = 0;
        var gesetzOffen = {};
        var ruheMs = opt.ruheMs == null ? 180 : opt.ruheMs;
        var sitz = opt.sitzung || null;
        function startwert(z) {
            if (opt.start) {
                var s = opt.start(z);
                if (typeof s === "number" && isFinite(s)) return s;
            }
            return zahl(z.def, zahl(z.min, 0));
        }
        function fmt(z, v) {
            if (opt.format) {
                var f = opt.format(z, v);
                if (f != null) return String(f);
            }
            return istSchalter(z) ? (v ? "an" : "aus") : (+v).toFixed(stellen(z.step));
        }
        liste.forEach(function (z) {
            nachId[z.id] = z;
            if (typeof werte[z.id] !== "number" || !isFinite(werte[z.id])) werte[z.id] = startwert(z);
        });
        function anzeigen(z) {
            var e = els[z.id];
            if (!e) return;
            var v = werte[z.id];
            if (e.schalter) e.inp.checked = !!v;
            else e.inp.value = String(v);
            e.wert.textContent = fmt(z, v);
        }
        function flush() {
            uhr = null;
            bild = 0;
            gesetzOffen = {};
            var ids = Object.keys(offen);
            offen = {};
            if (!ids.length) return;
            var a = vorher;
            vorher = null;
            var bau = ids.some(function (id) {
                return !(nachId[id] && (nachId[id].dyn || nachId[id].uniform));
            });
            // erst die Folge (ein Meta-Gesetz leitet weitere Achsen ab), dann der Schritt: EIN Rückgängig für Zug + Folge
            if (opt.nachRuhe) {
                opt.nachRuhe(ids, bau);
                gangBau(stand());
            }
            if (sitz && a) {
                var d = diffVon(a, sitz.schnapp());
                if (d) sitz.merke(d);
            }
        }
        function stand() {
            return sitz ? sitz.schnapp() : schnapp(werte);
        }
        // EIN GESETZ-WERT WARTET NIE (studios.K2): eine Zeile mit `uniform: true` im Vertrag wirkt im nächsten Bild (nachRuhe
        // ohne Neubau), die Ruhe schreibt nur noch den Rückgängig-Schritt.
        function gesetzJetzt() {
            gesetzBild = 0;
            var ids = Object.keys(gesetzOffen);
            gesetzOffen = {};
            if (!ids.length) return;
            opt.nachRuhe(ids, false);
            gangBau(stand());
        }
        function planen(z) {
            if (ruheMs > 0) {
                clearTimeout(uhr);
                uhr = setTimeout(flush, ruheMs);
                if (z.uniform && opt.nachRuhe) {
                    gesetzOffen[z.id] = 1;
                    if (!gesetzBild) gesetzBild = imBild(gesetzJetzt);
                }
            } else if (!bild) {
                bild = imBild(flush);
            }
        }
        function eingabe(z, v, t0) {
            if (!vorher) vorher = stand();
            werte[z.id] = v;
            anzeigen(z);
            gangGriff(z, t0 == null ? jetzt() : t0);
            if (opt.bei) opt.bei(z.id, v, z);
            if (!opt.nachRuhe) gangBau(stand()); // ohne nachRuhe wendet bei den Plan an
            offen[z.id] = 1;
            planen(z);
        }
        var R = {
            werte: werte,
            zeilen: liste,
            el: ziel,
            eingabe: function (id) {
                return els[id] ? els[id].inp : null;
            },
            sync: function () {
                liste.forEach(anzeigen);
            },
            // der offene Zug wird JETZT sein Schritt (die Sitzung ruft es, bevor sie geht), die geplante Ruhe fällt
            abschliessen: function () {
                clearTimeout(uhr);
                if (bild) (wurzel.cancelAnimationFrame || clearTimeout).call(wurzel, bild);
                flush();
            },
            // Werte von außen setzen (Preset, Kultur, Undo): nur bekannte Zeilen, dann sichtbar; still = ohne nachRuhe.
            setzen: function (obj, still) {
                var ids = [];
                for (var k in obj)
                    if (nachId[k] && typeof obj[k] === "number" && isFinite(obj[k]) && werte[k] !== obj[k]) {
                        werte[k] = obj[k];
                        ids.push(k);
                    }
                R.sync();
                if (!still && ids.length && opt.nachRuhe) opt.nachRuhe(ids, true);
                return ids;
            },
            zuruecksetzen: function () {
                var basis = opt.basis ? opt.basis() : null;
                var ziel2 = {};
                liste.forEach(function (z) {
                    ziel2[z.id] = basis && typeof basis[z.id] === "number" ? basis[z.id] : startwert(z);
                });
                var tat = function () {
                    R.setzen(ziel2);
                };
                if (sitz) sitz.schritt(tat);
                else tat();
            },
        };
        if (!ziel) return R;
        if (opt.leeren !== false) ziel.textContent = "";
        if (sitz) ziel.setAttribute("data-sitzung", "1"); // diese Regler schreiben Rückgängig-Schritte
        var gruppe = null;
        liste.forEach(function (z) {
            if (opt.gruppen !== false && typeof z.grp === "string" && z.grp && z.grp !== gruppe) {
                gruppe = z.grp;
                ziel.appendChild(el("div", "h-gruppe" + (kl.gruppe ? " " + kl.gruppe : ""), z.grp));
            }
            var schalter = istSchalter(z);
            var zeile = el("div", "h-regler" + (schalter ? " h-schalter" : "") + (kl.zeile ? " " + kl.zeile : ""));
            zeile.setAttribute("data-regler", z.id);
            if (z.uniform) zeile.setAttribute("data-uniform", "1"); // die Klasse der Zeile steht im Vertrag (≤ 200 ms)
            var kopf = el("div", "h-kopf" + (kl.kopf ? " " + kl.kopf : ""));
            var lab = el("label", "h-lab", z.lab || z.id);
            if (typeof z.law === "string" && z.law) lab.title = z.law;
            var wert = el("span", "h-wert" + (kl.wert ? " " + kl.wert : ""));
            var inp = el("input", "h-eingabe");
            inp.type = schalter ? "checkbox" : "range";
            if (!schalter) {
                inp.min = String(zahl(z.min, 0));
                inp.max = String(zahl(z.max, 1));
                inp.step = String(zahl(z.step, 0.01));
            }
            var did = opt.domId ? opt.domId(z) : null;
            if (did) inp.id = did;
            inp.setAttribute("aria-label", z.lab || z.id);
            if (z.fest) {
                inp.disabled = true;
                zeile.title = typeof z.festText === "string" ? z.festText : "fest im Gesetzbuch";
                zeile.classList.add("h-fest");
            }
            els[z.id] = { inp: inp, wert: wert, schalter: schalter };
            inp.addEventListener(schalter ? "change" : "input", function (ev) {
                eingabe(z, schalter ? (inp.checked ? 1 : 0) : +inp.value, ev.timeStamp);
            });
            kopf.appendChild(lab);
            if (sitz && sitz.sperren && !z.fest) {
                var sp = el("button", "h-sperre", "");
                sp.type = "button";
                var malen = function () {
                    var g = sitz.gesperrt(z.id);
                    sp.textContent = g ? "\u{1F512}" : "\u{1F513}";
                    sp.title = g ? "gesperrt: der Würfel lässt diese Achse stehen" : "frei: der Würfel darf diese Achse ziehen";
                    sp.classList.toggle("an", g);
                };
                sp.addEventListener("click", function () {
                    sitz.sperre(z.id, !sitz.gesperrt(z.id));
                    malen();
                });
                malen();
                kopf.appendChild(sp);
            }
            kopf.appendChild(wert);
            if (schalter) {
                zeile.appendChild(inp);
                zeile.appendChild(kopf);
            } else {
                zeile.appendChild(kopf);
                zeile.appendChild(inp);
            }
            if (opt.gesetze !== false && typeof z.law === "string" && z.law) zeile.appendChild(el("div", "h-gesetz", "→ " + z.law));
            if (opt.zusatz) opt.zusatz(z, zeile, kopf); // ein Knopf der Domäne an der Zeile (Stumm am Mischpult …)
            ziel.appendChild(zeile);
            anzeigen(z);
        });
        if (opt.zuruecksetzen !== false && liste.length) {
            var reihe = el("div", "h-knoepfe");
            var b = el("button", "h-knopf" + (kl.knopf ? " " + kl.knopf : ""), "↺ Zurücksetzen");
            b.type = "button";
            b.title = "Alle Regler auf " + (opt.basis ? "die Vorlage" : "das Gesetzbuch (def)") + " zurücksetzen";
            b.addEventListener("click", R.zuruecksetzen);
            reihe.appendChild(b);
            ziel.appendChild(reihe);
        }
        if (sitz) sitz.binde(R);
        return R;
    }

    // ── DIE SITZUNG — Seed · Sperre · Undo/Redo · A/B · der Stand über das Neuladen ──
    // opt: werte (P) · anwenden(ids, quelle) nach Undo/Redo/Würfel/A-B/Laden · zustand() / zustandSetzen(z) für Nicht-Zahlen
    //      (Preset, Kultur …) · seed · beiSeed(seed) · sperren (Schloss je Achse) · tasten (false = keine Tasten)
    // DIE SITZUNG, DIE BLEIBT (studios.K2): jeder Schritt schreibt den Stand der Seite (Werte + Zustand + Same) in den EINEN
    // Speicher-Weg der Welt (localStorage, Schlüssel `anazh.sitzung.<seite>`, wie `anazh.vibePass`); beim Öffnen legt ihn die
    // Sitzung über den Weg des Verlaufs zurück (anwenden(ids, "laden")). A = der Stand, mit dem die Seite öffnete (gebaut),
    // B = der Entwurf; ein Zug unter A wird der neue Entwurf.
    function speicherOrt() {
        var l = wurzel.location;
        if (!l) return null;
        var studio = /[?&]studio=([\w-]+)/.exec(l.search || "");
        return "anazh.sitzung." + l.pathname + (studio ? "?studio=" + studio[1] : "") + (sitzungZahl++ ? "#" + sitzungZahl : "");
    }
    var sitzungZahl = 0;
    function sitzung(opt) {
        opt = opt || {};
        var werte = opt.werte || {};
        var ort = speicherOrt();
        var abA = null;
        var abB = null;
        var stapel = [];
        var zeiger = 0;
        var gesperrt = {};
        var regler_ = [];
        var anzeige = null;
        var S = {
            werte: werte,
            seed: (opt.seed >>> 0) || 1,
            sperren: !!opt.sperren,
            // ein neu gebauter Regler am selben Ort ersetzt den alten (die Schmiede baut ihre Leiste je modus neu)
            binde: function (r) {
                regler_ = regler_.filter(function (x) {
                    return !(r.el && x.el === r.el);
                });
                regler_.push(r);
            },
            gesperrt: function (id) {
                return !!gesperrt[id];
            },
            schnapp: function () {
                return schnapp(werte, opt.zustand);
            },
            sperre: function (id, an) {
                if (an) gesperrt[id] = 1;
                else delete gesperrt[id];
            },
            merke: function (d) {
                if (!d) return;
                stapel.length = zeiger;
                stapel.push(d);
                if (stapel.length > 200) stapel.shift();
                zeiger = stapel.length;
                abB = null; // ein Zug unter A ist der neue Entwurf
                malen();
                speichern();
            },
            // EINE Tat = EIN Schritt: Werte (und Zustand) vorher ↔ nachher.
            schritt: function (tat) {
                abschliessen();
                var a = schnapp(werte, opt.zustand);
                var r = tat();
                var d = diffVon(a, schnapp(werte, opt.zustand));
                if (d) S.merke(d);
                return r;
            },
            zurueck: function () {
                if (abB) S.ab("B"); // der Verlauf ist der des Entwurfs
                abschliessen();
                if (!zeiger) return toast("Nichts mehr rückgängig zu machen."), false;
                anwendenDiff(stapel[--zeiger], 0, "zurueck");
                return true;
            },
            vor: function () {
                if (abB) S.ab("B");
                abschliessen();
                if (zeiger >= stapel.length) return toast("Nichts zum Wiederholen."), false;
                anwendenDiff(stapel[zeiger++], 1, "vor");
                return true;
            },
            stand: function () {
                return { schritte: stapel.length, zeiger: zeiger };
            },
            seedSetzen: function (n, still) {
                S.seed = (n >>> 0) || 1;
                if (anzeige && anzeige.seed) anzeige.seed.value = String(S.seed);
                if (!still && opt.beiSeed) opt.beiSeed(S.seed);
                speichern();
            },
            // A/B gegen den gebauten Stand: "A" zeigt den Stand der Öffnung, "B" den Entwurf — kein Rückgängig-Schritt
            ab: function (seite) {
                abschliessen();
                if (!abA || (seite === "A") === !!abB) return false;
                var jetzt_ = S.schnapp();
                var ziel = seite === "A" ? abA : abB;
                if (seite === "A") abB = jetzt_;
                else abB = null;
                var d = diffVon(jetzt_, ziel);
                if (d) anwendenDiff(d, 1, seite === "A" ? "a" : "b");
                malen();
                return true;
            },
            zeigt: function () {
                return abB ? "A" : "B";
            },
            // Der Würfel: ein neuer Same zieht jede FREIE Achse der Zeilen aus dem Gesetz (min..max, auf step), EIN Schritt.
            wuerfeln: function (zeilen, neuerSame) {
                if (neuerSame !== false) S.seedSetzen((Date.now() ^ ((Math.random() * 4294967296) >>> 0)) >>> 0, true);
                var r = zufall(S.seed);
                return S.schritt(function () {
                    (zeilen || []).forEach(function (z) {
                        if (!z || gesperrt[z.id] || z.fest) return;
                        var lo = zahl(z.min, 0);
                        var hi = zahl(z.max, 1);
                        var st = zahl(z.step, 0);
                        var v = lo + r() * (hi - lo);
                        if (st > 0) v = Math.min(hi, lo + Math.round((v - lo) / st) * st);
                        werte[z.id] = +v.toFixed(6);
                    });
                    regler_.forEach(function (rr) {
                        rr.sync();
                    });
                    if (opt.beiSeed) opt.beiSeed(S.seed);
                    if (opt.anwenden) opt.anwenden(null, "wuerfel");
                });
            },
            // Die Leiste: ↶ ↷ · Same · (Würfel)
            leiste: function (ziel, lo) {
                lo = lo || {};
                var l = el("div", "h-sitzung");
                var z = el("button", "h-knopf", "↶");
                z.type = "button";
                z.title = "Rückgängig (Strg+Z)";
                var v = el("button", "h-knopf", "↷");
                v.type = "button";
                v.title = "Wiederholen (Strg+Umschalt+Z · Strg+Y)";
                var n = el("span", "h-stand", "");
                z.addEventListener("click", S.zurueck);
                v.addEventListener("click", S.vor);
                l.appendChild(z);
                l.appendChild(v);
                l.appendChild(n);
                anzeige = { z: z, v: v, n: n, seed: null, ab: [] };
                if (lo.ab !== false)
                    ["A", "B"].forEach(function (seite) {
                        var k = el("button", "h-knopf h-ab", seite);
                        k.type = "button";
                        k.setAttribute("data-ab", seite);
                        k.title = seite === "A" ? "A · gebaut: der Stand, mit dem die Seite öffnete" : "B · Entwurf: dein Stand";
                        k.addEventListener("click", function () {
                            S.ab(seite);
                        });
                        l.appendChild(k);
                        anzeige.ab.push(k);
                    });
                if (lo.seed !== false) {
                    var lab = el("label", "h-same", "Same");
                    var inp = el("input", "h-same-feld");
                    inp.type = "number";
                    inp.min = "1";
                    inp.step = "1";
                    inp.value = String(S.seed);
                    inp.addEventListener("change", function () {
                        S.seedSetzen(parseInt(inp.value, 10) || 1);
                    });
                    lab.appendChild(inp);
                    l.appendChild(lab);
                    anzeige.seed = inp;
                }
                if (lo.wuerfel) {
                    var w = el("button", "h-knopf", "\u{1F3B2}");
                    w.type = "button";
                    w.title = "Würfeln: ein neuer Same zieht jede freie Achse (das Schloss hält eine Achse fest)";
                    w.addEventListener("click", function () {
                        S.wuerfeln(lo.wuerfel());
                    });
                    l.appendChild(w);
                }
                if (ziel) ziel.appendChild(l);
                malen();
                return l;
            },
        };
        // Der Verlauf geht nie an einem offenen Zug vorbei: Strg+Z im selben Atemzug wie der Zug (vor der Ruhe, vor dem
        // nächsten Bild) nimmt DIESEN zurück, nie den davor; eine Tat (Preset, Würfel) nach dem Zug wird ihr eigener Schritt.
        function abschliessen() {
            regler_.forEach(function (r) {
                r.abschliessen();
            });
        }
        function malen() {
            if (!anzeige) return;
            anzeige.z.disabled = !zeiger;
            anzeige.v.disabled = zeiger >= stapel.length;
            anzeige.n.textContent = zeiger + "/" + stapel.length;
            anzeige.ab.forEach(function (k) {
                k.classList.toggle("an", k.getAttribute("data-ab") === S.zeigt());
            });
        }
        function speichern() {
            if (!ort || !wurzel.localStorage || !abA) return; // vor dem Laden schreibt nichts über den Stand von gestern
            try {
                wurzel.localStorage.setItem(ort, JSON.stringify({ v: 1, werte: abB || S.schnapp(), seed: S.seed }));
                gang.gespeichert = jetzt();
            } catch (e) {
                console.error("[huelle] die Sitzung ist nicht gespeichert (" + ort + "): " + e.message);
            }
        }
        // DAS LADEN nach dem Aufbau der Seite (ihr Skript lief, die Regler stehen): der Stand von gestern als EIN Diff über den
        // Weg des Verlaufs; eine Regler-Zeile, die der Stand nicht kennt (der Vertrag wuchs), behält ihren Startwert.
        function laden() {
            var alt = null;
            try {
                alt = ort && wurzel.localStorage ? JSON.parse(wurzel.localStorage.getItem(ort) || "null") : null;
            } catch (e) {
                console.error("[huelle] die Sitzung " + ort + " ist nicht lesbar: " + e.message);
            }
            if (alt && alt.v === 1 && alt.werte) {
                var d = diffVon(S.schnapp(), alt.werte);
                for (var k in d || {})
                    if (d[k][1] === undefined && regler_.some(function (r) {
                            return r.zeilen.some(function (z) {
                                return z.id === k;
                            });
                        }))
                        delete d[k];
                if (alt.seed) S.seed = alt.seed >>> 0 || S.seed;
                if (d && Object.keys(d).length) anwendenDiff(d, 1, "laden");
            }
            abA = S.schnapp();
            gang.geladen = ort || true;
            malen();
        }
        setTimeout(laden, 0);
        // Der Zustand zuerst (ein Preset setzt seine Werte), die Werte darüber (der Regler-Zug nach dem Preset).
        function anwendenDiff(d, i, quelle) {
            var ids = [];
            if (d[ZUSTAND] && opt.zustandSetzen && d[ZUSTAND][i] != null) opt.zustandSetzen(JSON.parse(d[ZUSTAND][i]));
            for (var k in d) {
                if (k === ZUSTAND) continue;
                if (d[k][i] === undefined) delete werte[k];
                else werte[k] = auspacken(d[k][i]);
                ids.push(k);
            }
            regler_.forEach(function (r) {
                r.sync();
            });
            if (opt.anwenden) opt.anwenden(ids, quelle);
            malen();
            speichern();
            var wort = { zurueck: "↶ rückgängig · ", vor: "↷ wiederholt · ", a: "A · gebaut", b: "B · Entwurf", laden: "die Sitzung von zuletzt" };
            toast(wort[quelle] + (quelle === "zurueck" || quelle === "vor" ? zeiger + "/" + stapel.length : ""), 1200);
        }
        if (opt.tasten !== false && wurzel.addEventListener)
            wurzel.addEventListener("keydown", function (ev) {
                if (!(ev.ctrlKey || ev.metaKey)) return;
                var t = ev.target;
                if (t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && t.type !== "range" && t.type !== "checkbox"))) return;
                var k = (ev.key || "").toLowerCase();
                if (k === "z") {
                    ev.preventDefault();
                    if (ev.shiftKey) S.vor();
                    else S.zurueck();
                } else if (k === "y") {
                    ev.preventDefault();
                    S.vor();
                }
            });
        return S;
    }

    // ── DIE KOSTEN-LEISTE je LOD-Stufe ──
    // opt: budget (lod.budget[kind] des Kerns) · stufen (kindStages[kind]) · bauen(stufe) → Object3D der Welt-Gestalt
    //      (buildInstance des Kerns) · titel · quelle (Text: woran gemessen) · meshfrei (Text: keine Gestalt, Vertrag §8) ·
    //      renderer (der Renderer des Studios oder eine Funktion, die ihn reicht — die Gegenzahl `zeichne`) · klang (der Kern
    //      eines meshfreien Klang-Studios — `klangKosten`)
    // Was eine Stufe zählt, ist das EINE Budget-Gesetz des Kerns (phyto-core budgetSippen/budgetWurf): ein Wurf-Teil (sein Stoff
    // zeichnet nicht, `visible: false` — er zeichnet nur in den Kaskaden) zählt nie zur Bild-Stufe; eine NUR-WURF-Stufe (`wurf`)
    // zählt ihre Werfer.
    function zurStufe(o, wurf) {
        if (wurf) return !!o.castShadow;
        return (Array.isArray(o.material) ? o.material : [o.material]).some(function (m) {
            return m && m.visible !== false;
        });
    }
    // DIE PUFFER, die ein Mesh zur GPU trägt (je(attribut, puffer)): jedes Attribut (verschränkt: sein Puffer), die
    // Morph-Attribute, der Index, die Instanz-Attribute; ihre Bytes nach der Regel der r184-Speicher-Karte (Info
    // `_getAttributeMemorySize`: das Feld, sonst count × itemSize × 4). `breit` (r184 WebGPU): das Gerät weitet jedes nicht
    // normierte 8/16-Bit-Feld, den Index eingeschlossen, auf 32 Bit (WebGPUAttributeUtils.createAttribute, `r.array = o`) —
    // die Leiste zählt, was die GPU hält, nicht was der Kern backt.
    function puffer(o, je) {
        var g = o.geometry,
            a = [g.index, o.instanceMatrix, o.instanceColor];
        for (var k in g.attributes) a.push(g.attributes[k]);
        for (var m in g.morphAttributes) a = a.concat(g.morphAttributes[m]);
        a.forEach(function (x) {
            if (x) je(x, x.isInterleavedBufferAttribute ? x.data : x);
        });
    }
    var SCHMAL = [Int8Array, Int16Array, Uint8Array, Uint16Array];
    function bytes(p, x, breit) {
        var a = p.array;
        if (breit && a && !x.normalized && SCHMAL.indexOf(a.constructor) >= 0) return a.length * 4;
        return a ? a.byteLength : p.count && p.itemSize ? p.count * p.itemSize * 4 : 0;
    }
    // was die Stufe zeichnet: ein sichtbares Mesh (jeder Ahne sichtbar) mit einem Stoff der Stufe — Zählung und Speicher lesen dasselbe
    function zurStufeGezeigt(o, wurf) {
        for (var p = o; p; p = p.parent) if (p.visible === false) return false;
        return o.isMesh && !!o.geometry && zurStufe(o, wurf);
    }
    function zaehle(obj, wurf, breit) {
        var tris = 0;
        var stoffe = {};
        var nStoffe = 0;
        var meshes = 0;
        var werfer = 0;
        var befehle = 0;
        var vram = 0;
        var gesehen = new Set();
        if (!obj || !obj.traverse) return { tris: 0, stoffe: 0, meshes: 0, werfer: 0, befehle: 0, vram: 0 };
        obj.traverse(function (o) {
            if (!zurStufeGezeigt(o, wurf)) return;
            var g = o.geometry;
            var n = g.index ? g.index.count / 3 : g.attributes && g.attributes.position ? g.attributes.position.count / 3 : 0;
            if (o.isInstancedMesh) n *= o.count;
            tris += n;
            meshes++;
            if (o.castShadow) werfer++;
            // die Befehle wie projectObject sie stellt: ein Stoff-Feld zeichnet je Gruppe mit sichtbarem Stoff (die Wurf-Stufe
            // zeichnet jeden), sonst EIN Befehl
            befehle += Array.isArray(o.material)
                ? (g.groups || []).filter(function (gr) {
                      var m = o.material[gr.materialIndex];
                      return m && (wurf || m.visible !== false);
                  }).length
                : 1;
            puffer(o, function (x, b) {
                if (!gesehen.has(b)) vram += bytes(b, x, breit);
                gesehen.add(b);
            });
            (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
                if (m && !stoffe[m.uuid]) {
                    stoffe[m.uuid] = 1;
                    nStoffe++;
                }
            });
        });
        return { tris: Math.round(tris), stoffe: nStoffe, meshes: meshes, werfer: werfer, befehle: befehle, vram: vram };
    }
    // DIE GEGENZAHL (studios.K3): das Werk ALLEIN in EINEM eigenen Render des Studio-Renderers — nur seine Meshes in einer
    // eigenen Szene (die Kamera sieht Ebene 30, Lichter bleiben draußen, also kein Schatten-Pass), ungekappt (frustumCulled
    // aus), in ein 1×1-Ziel unter EINEM Stoff (kein Programm je Werk-Stoff). Gezählt wird renderer.info je Abschnitt: die
    // Differenz der Zähler um den Render, gestempelt (Lehre 23: r184 `info.calls` genau +1 je Wurzel, r128 `info.render.frame`
    // unverändert — ein fremder Render dazwischen macht die Zahl ungültig). Eine Wegwerf-Gestalt (bauen) gibt danach ihre
    // Geometrie frei, sonst hielte der Renderer jede Mess-Gestalt (Lehre 27). Eine NUR-WURF-Stufe (`wurf`) zeichnet wie ihre
    // Kaskade: nur die Werfer, ihr Stoff im Abschnitt sichtbar (der Kaskaden-Stoff des Wirts zeichnet ihn). null = kein
    // Renderer, (r184) noch nicht bereit oder gestört.
    // DER SPEICHER (`vram`): je Werk-Puffer, was der Renderer nach dem Abschnitt für ihn hält — r184 seine Speicher-Karte
    // (`info.memoryMap`, je Attribut). r184 lädt nur, was das Programm liest (`RenderObject.getAttributes`): der Zähl-Stoff liest
    // dort jedes Attribut der Geometrie (× 0), das Werk reist ganz, wie unter r128 (WebGLGeometries.update lädt jedes
    // Attribut). r128 führt keine Karte — die Hülle führt sie am GL-Kontext (`glKarte`). DIE GPU-ZEIT (`zeit`, ein Versprechen):
    // die Zeitstempel des Abschnitts (`gpuUhr`); auf `?bank=n` dazu die Bank-Runde von `werkbank gpu-bank`
    // (scripts/lib/zerlege-linse.cjs `bankRunde`: n Render hintereinander, dann auf die GPU warten — Gesamtzeit / n gegen die CPU
    // je Render), 3 warme, 3 Runden, je Größe der Median; die GPU-ms sind dann der Median der Stempel derselben Render.
    var ZAEHL_EBENE = 30,
        zaehlMittel = null,
        glKarten = new WeakMap(),
        BANK = +((wurzel.location && /[?&]bank=(\d+)/.exec(wurzel.location.search)) || [])[1] || 0;
    // der Zähl-Stoff: r128 lädt ohnehin jedes Attribut; unter r184 liest er jedes Attribut der Geometrie (TSL, je Signatur ein Programm)
    function zaehlStoff(T, gpu) {
        if (!gpu) return new T.MeshBasicMaterial();
        var L = T.TSL,
            m = new T.MeshBasicNodeMaterial();
        m.positionNode = L.Fn(function (b) {
            return Object.keys(b.geometry.attributes).reduce(function (p, n) {
                return n === "position" ? p : p.add(L.attribute(n, "float").mul(0));
            }, L.positionLocal);
        })();
        return m;
    }
    // DIE SPEICHER-KARTE des r128-Kontexts (Feld → Bytes): jedes bufferData trägt das Feld des Attributs (WebGLAttributes
    // createBuffer), ein neues bufferData auf denselben Puffer und deleteBuffer nehmen es — einmal je Kontext gesetzt.
    function glKarte(R) {
        var gl = R.getContext && R.getContext();
        if (!gl || !gl.bufferData) return null;
        if (glKarten.has(gl)) return glKarten.get(gl);
        var K = new WeakMap(),
            gebunden = {},
            feldVon = new WeakMap(),
            bind = gl.bindBuffer,
            daten = gl.bufferData,
            weg = gl.deleteBuffer;
        gl.bindBuffer = function (ziel, b) {
            gebunden[ziel] = b;
            return bind.apply(this, arguments);
        };
        gl.bufferData = function (ziel, f) {
            var b = gebunden[ziel];
            if (b && feldVon.has(b)) K.delete(feldVon.get(b));
            if (b && f && typeof f === "object" && f.byteLength != null) K.set(f, f.byteLength), feldVon.set(b, f);
            return daten.apply(this, arguments);
        };
        gl.deleteBuffer = function (b) {
            if (b && feldVon.has(b)) K.delete(feldVon.get(b));
            return weg.apply(this, arguments);
        };
        glKarten.set(gl, K);
        return K;
    }
    // DIE UHR des Abschnitts: an() vor, ab() nach einem Render des Abschnitts (→ seine Marke), lesen(marken) → je Marke die ms
    // (null = verloren). r184: der EINE Zeitstempel-Pool des Renderers (WebGPUTimestampQueryPool), nur für die Render des
    // Abschnitts eingeschaltet (`backend.trackTimestamp`, das Gerät trägt timestamp-query) — die Marke sind die Schlüssel, die
    // sie in den Pool legen; r184 löst den Pool je Auflösen ganz und hält jeden Stempel in `timestamps` (die Hülle nimmt ihre
    // heraus), ein Auflösen, das vor dem Render lief, deckt sie nicht: höchstens sechs Züge. r128: EXT_disjoint_timer_query_webgl2
    // (TIME_ELAPSED), das Ergebnis frühestens nach der Rückkehr in die Ereignis-Schleife, ein Bruch (GPU_DISJOINT) verwirft es.
    // Ohne Uhr: der Grund als Text.
    function gpuUhr(R, gpu) {
        var vor = null,
            war = false,
            be = R.backend,
            pool = function () {
                return be.timestampQueryPool && be.timestampQueryPool.render;
            };
        if (gpu)
            return !be || !R.hasFeature("timestamp-query")
                ? "keine Zeitstempel (das Gerät trägt kein timestamp-query)"
                : {
                      an: function () {
                          vor = new Set(pool() ? pool().queryOffsets.keys() : []);
                          war = be.trackTimestamp;
                          be.trackTimestamp = true;
                      },
                      ab: function () {
                          be.trackTimestamp = war;
                          return pool() ? Array.from(pool().queryOffsets.keys()).filter((k) => !vor.has(k)) : [];
                      },
                      lesen: function (marken) {
                          var p = pool(),
                              alle = [].concat.apply([], marken);
                          var zug = function (i) {
                              be.trackTimestamp = true;
                              var w = R.resolveTimestampsAsync("render");
                              be.trackTimestamp = war;
                              // ein Auflösen im Flug (eines anderen Lesers) trägt die Stempel vielleicht schon: auch auf es warten
                              return Promise.all([w, p.pendingResolve]).then(function () {
                                  var fehlt = (u) => !p.timestamps.has(u);
                                  if (i < 5 && alle.some(fehlt)) return zug(i + 1);
                                  var ms = marken.map((m) => (m.length && !m.some(fehlt) ? m.reduce((s, u) => s + p.timestamps.get(u), 0) : null));
                                  alle.forEach((u) => p.timestamps.delete(u));
                                  return ms;
                              });
                          };
                          return p ? zug(0) : Promise.resolve(marken.map(() => null));
                      },
                  };
        var gl = R.getContext && R.getContext(),
            ext = gl && typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext && gl.getExtension("EXT_disjoint_timer_query_webgl2");
        if (!ext) return "keine Zeitstempel (der Kontext trägt kein EXT_disjoint_timer_query_webgl2)";
        return {
            an: function () {
                vor = gl.createQuery();
                gl.beginQuery(ext.TIME_ELAPSED_EXT, vor);
            },
            ab: function () {
                gl.endQuery(ext.TIME_ELAPSED_EXT);
                return vor;
            },
            lesen: function (marken) {
                return Promise.all(
                    marken.map(function (q) {
                        return new Promise(function (fertig) {
                            var n = 0;
                            (function frage() {
                                if (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE) && n++ < 500) return setTimeout(frage, 4);
                                fertig(n <= 500 && !gl.getParameter(ext.GPU_DISJOINT_EXT) ? gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6 : null);
                                gl.deleteQuery(q);
                            })();
                        });
                    })
                );
            },
        };
    }
    // DIE BANK-RUNDE — die EINE Messung von `werkbank gpu-bank`, `zerlegen` (scripts/lib/zerlege-linse.cjs) und der Bank der
    // Kosten-Leiste: n Bilder (`bild()`, im Rahmen `um`) direkt hintereinander, ohne rAF und VSync, dann auf die GPU warten
    // (`warte`, sonst die Schlange des r184-Geräts). Liegt die GPU je Bild über der CPU, ist Gesamtzeit / n die reine GPU-Zeit je
    // Bild (alle n in EINER Aufgabe: die Leinwand präsentiert erst danach — das Präsentieren steht nicht in der Bank). DIE STEMPEL:
    // wer den Zeitstempel-Pool je Bild auflöst (der Spiel-Loop, `_perfGpuResolveKick`), löst ihn in der Bank nicht — sie leert ihn
    // vor und nach den Bildern, außerhalb der Spanne (r184 setzt ihn nur beim Auflösen zurück, `__stempelWache`); ein Auflösen, das
    // schon läuft, deckt die Abfragen danach nicht: höchstens drei Züge.
    function bankRunde(R, n, bild, warte, um) {
        var t0 = 0,
            tAb = 0,
            cpu = 0,
            stempelAuf = function (i) {
                var be = R.backend,
                    pool = be && be.trackTimestamp === true && be.timestampQueryPool.render;
                if (pool && i < 3 && pool.currentQueryIndex > 0) return R.resolveTimestampsAsync("render").then(() => stempelAuf(i + 1));
            },
            leer = function () {
                return Promise.resolve(warte ? warte() : R.backend.device.queue.onSubmittedWorkDone());
            };
        return leer()
            .then(() => stempelAuf(0))
            .then(function () {
                (um || ((f) => f()))(function () {
                    t0 = performance.now();
                    for (var i = 0; i < n; i++) {
                        var c0 = performance.now();
                        bild();
                        cpu += performance.now() - c0;
                    }
                    tAb = performance.now();
                });
                return leer();
            })
            .then(function () {
                var t1 = performance.now();
                return Promise.resolve(stempelAuf(0)).then(() => ({ jeFrame: (t1 - t0) / n, cpuJeFrame: cpu / n, nachlauf: t1 - tAb }));
            });
    }
    var median = function (a) {
        a = a.slice().sort((x, y) => x - y);
        return a[Math.floor(a.length / 2)];
    };
    function zeichne(R, obj, wegwerf, wurf) {
        var T = wurzel.THREE;
        if (!R || !R.info || !T || !obj || !obj.traverse || R.initialized === false) return null;
        var gpu = !!R.isWebGPURenderer;
        if (!zaehlMittel || zaehlMittel.R !== R) {
            var kam = new T.PerspectiveCamera();
            kam.layers.set(ZAEHL_EBENE);
            zaehlMittel = { R: R, ziel: new (gpu ? T.RenderTarget : T.WebGLRenderTarget)(1, 1), kamera: kam, stoff: zaehlStoff(T, gpu), uhr: gpuUhr(R, gpu) };
        }
        var karte = gpu ? R.info.memoryMap : glKarte(R);
        // das Werk ist die Gestalt ABSEITS der Szene (frisch gebaut oder gezählt, bevor sie die Bühne betritt): was unter einer
        // Scene hängt, ist Bühne und zeichnet hier nicht — eine Leiste, die die Bühne mitzählt, steht ohne Gegenzahl
        var alle = [],
            wurzeln = [];
        obj.traverse(function (o) {
            if (o.isMesh) alle.push(o);
        });
        var werk = alle.filter(function (o) {
            var w = o;
            while (w.parent) w = w.parent;
            if (w.isScene || (wurf && !o.castShadow)) return false;
            if (wurzeln.indexOf(w) < 0) wurzeln.push(w);
            return true;
        });
        var stoffe = [];
        if (wurf)
            werk.forEach(function (o) {
                (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
                    if (m && stoffe.indexOf(m) < 0) stoffe.push(m);
                });
            });
        var info = R.info,
            r = info.render,
            draws = gpu ? "drawCalls" : "calls",
            stempel = function () {
                return gpu ? info.calls : r.frame;
            },
            uhr = werk.length && typeof zaehlMittel.uhr === "object" ? zaehlMittel.uhr : null,
            marken = [],
            szenen = wurzeln.map(function () {
                var s = new T.Scene();
                s.overrideMaterial = zaehlMittel.stoff;
                return s;
            });
        // der Abschnitt (fn darin): das Werk auf der Zähl-Ebene, ungekappt, (Wurf) seine Stoffe sichtbar, ins 1×1-Ziel — danach
        // steht alles wie davor; rund(): je Wurzel EIN Render, mit Uhr (jeder Render des Abschnitts zieht seine eigenen Stempel)
        function abschnitt(fn) {
            var stoffSicht = stoffe.map(function (m) {
                var v = m.visible;
                m.visible = true;
                return v;
            });
            var alt = werk.map(function (o) {
                var a = [o.layers.mask, o.frustumCulled];
                o.layers.enable(ZAEHL_EBENE);
                o.frustumCulled = false;
                return a;
            });
            var auto = info.autoReset,
                vorZiel = R.getRenderTarget();
            info.autoReset = false;
            R.setRenderTarget(zaehlMittel.ziel);
            try {
                return fn();
            } finally {
                R.setRenderTarget(vorZiel);
                info.autoReset = auto;
                werk.forEach(function (o, i) {
                    o.layers.mask = alt[i][0];
                    o.frustumCulled = alt[i][1];
                });
                stoffe.forEach(function (m, i) {
                    m.visible = stoffSicht[i];
                });
            }
        }
        function rund() {
            var c = { tris: 0, befehle: 0, gueltig: true };
            if (uhr) uhr.an();
            try {
                wurzeln.forEach(function (w, i) {
                    var s0 = stempel(),
                        t0 = r.triangles,
                        d0 = r[draws];
                    szenen[i].add(w);
                    try {
                        R.render(szenen[i], zaehlMittel.kamera);
                    } finally {
                        szenen[i].remove(w);
                    }
                    c.tris += r.triangles - t0;
                    c.befehle += r[draws] - d0;
                    if (stempel() !== s0 + (gpu ? 1 : 0)) c.gueltig = false;
                });
            } finally {
                if (uhr) marken.push(uhr.ab());
            }
            return c;
        }
        var c = abschnitt(rund),
            gesehen = new Set();
        c.vram = 0;
        werk.forEach(function (o) {
            if (!zurStufeGezeigt(o, wurf)) return;
            puffer(o, function (x, b) {
                var k = gpu ? x : b.array;
                if (k && !gesehen.has(k)) c.vram += (gpu ? (karte.get(x) || {}).size : karte && karte.get(k)) || 0;
                gesehen.add(k);
            });
        });
        var los = function () {
            if (wegwerf)
                alle.forEach(function (o) {
                    if (o.geometry) o.geometry.dispose();
                });
        };
        c.tris = Math.round(c.tris);
        var gueltig = c.gueltig;
        delete c.gueltig;
        if (!gueltig || !uhr) {
            if (gueltig) c.zeitFehlt = werk.length ? zaehlMittel.uhr : "kein Werk abseits der Szene";
            return los(), gueltig ? c : null;
        }
        // die Bank (auf `?bank=n`): die EINE Bank-Runde über den Abschnitt, k < 0 die warme (3 Render), dann 3 Runden; r128 wartet
        // am Lesen eines Pixels des Zähl-Ziels
        var warte = gpu
                ? null
                : function () {
                      R.readRenderTargetPixels(zaehlMittel.ziel, 0, 0, 1, 1, new Uint8Array(4));
                  },
            runden = [];
        var runde = function (k) {
            return bankRunde(R, k < 0 ? 3 : BANK, rund, warte, abschnitt).then(function (b) {
                if (k >= 0) runden.push(b);
                return k < 2 ? runde(k + 1) : null;
            });
        };
        c.zeit = (BANK ? runde(-1) : Promise.resolve())
            .then(function () {
                return uhr.lesen(marken);
            })
            .then(function (ms) {
                var z = {};
                if (BANK) {
                    ms = ms.slice(ms.length - 3 * BANK);
                    z.bank = median(runden.map((x) => x.jeFrame));
                    z.bankCpu = median(runden.map((x) => x.cpuJeFrame));
                }
                if (ms.indexOf(null) >= 0) z.zeitFehlt = "Zeitstempel verloren (" + ms.filter((x) => x == null).length + " von " + ms.length + ")";
                else z.ms = median(ms);
                return z;
            })
            .finally(los);
        return c;
    }
    // DER DECKEL je Größe (studios.K3#2): das Profi-Band (spec/profiband/haushalt.json `band`, seine EINE Quelle) teilt seine
    // Kosten nach dem Anteil der Welt-Zeile — das VRAM nach den Dreiecken (tris/dreiecke × vramMB, MB = 2^20 Bytes wie der
    // VRAM-Abgriff), die GPU-Zeit nach dem größeren Anteil an Dreiecken und Befehlen (jeder Befehl kostet die GPU, auch ohne
    // Fläche: eine Stufe mit 2 Dreiecken trägt 1 von 208 Befehlen).
    var band = null;
    function bandDeckel(tris, befehle) {
        if (!band)
            band = fetch(new URL("../../spec/profiband/haushalt.json", HIER))
                .then(function (a) {
                    return a.json();
                })
                .then(function (h) {
                    if (!(h.band && h.band.dreiecke > 0)) throw new Error("haushalt.json ohne band");
                    return h.band;
                });
        return band.then(function (b) {
            return { vram: Math.round((tris / b.dreiecke) * b.vramMB * 1048576), ms: Math.max(tris / b.dreiecke, (befehle || 0) / b.befehle) * b.gpuMs };
        });
    }
    // DAS URTEIL einer Zeile (die Leiste färbt und benennt nach ihm, gate:studio-huelle H8 liest dasselbe): je Größe [Name,
    // gezählt, Gegenzahl, Deckel] (null: ohne) — die Gegenzahl ±5 %, der Deckel; mit `gpu` die GPU-ms gegen ihren Deckel und, wo die
    // Bank stand oder gefordert ist (`bank`), gegen die Bank: eine Gegenzahl nur GPU-gebunden (gpu-bank: über × 1,15); der Klang je
    // Ort gegen das Quantum. Rückgabe: die Täter beim Namen („L0 VRAM 900000 ↔ 300000“).
    var abw = function (a, b) {
        return !(Math.abs(a / b - 1) <= 0.05);
    };
    function zeileUrteil(k, gpu, bank) {
        var rot = [],
            gebunden = +k.bank > 1.15 * k.bankCpu ? k.bank : "Bank " + k.bank + " CPU-gebunden",
            reihe = k.audio
                ? [["Audio-ms", k.audio, null, k.audioDeckel]]
                : [["△", k.leiste, k.gezeichnet, k.deckel], ["Befehle", k.befehle, k.befehleGezeichnet, null], ["VRAM", k.vram, k.vramGpu, k.vramDeckel]];
        if (gpu && !k.audio) reihe.push(["GPU-ms", k.ms, bank || k.bank != null ? gebunden : null, k.msDeckel]);
        reihe.forEach(function (r) {
            var wo = (k.audio ? "" : "L") + k.stufe + " " + r[0] + " " + r[1];
            if (r[2] !== null && abw(r[1], r[2])) rot.push(wo + " ↔ " + r[2]);
            if (r[3] !== null && !(+r[1] <= +r[3])) rot.push(wo + " über dem Deckel " + r[3]);
        });
        // die Bühne zeigt das Werk, das die Zeile zählt (studios.K4): das Maß ihrer Wurzel gegen den Bau des Kerns (`werkMass`)
        var zahl = function (t) {
            return String(t).split(",").map(Number);
        };
        if (k.werkWelt) werkUrteil({ buehne: zahl(k.werkBuehne), welt: zahl(k.werkWelt), werk: k.werk }).forEach(function (x) {
            rot.push("L" + k.stufe + " " + x);
        });
        return rot;
    }
    var MB = function (b) {
        return (b / 1048576).toLocaleString("de-DE", { maximumFractionDigits: 2 }) + " MB";
    };
    var MS = function (v) {
        return v.toLocaleString("de-DE", { maximumFractionDigits: 3 }) + " ms";
    };
    // DER KLANG (meshfrei): der EINE Umwelt-Graph des Kerns (umweltGraph — Lab, Welt und Linse bauen ihn gleich) je Ort des
    // Gesetzes (UMWELT.orte) offline gerechnet, 2 s bei 48 kHz: die Audio-Graph-ms je Quantum (128 Proben) = die Wanduhr des
    // Renderns / die Quanten, gegen den Echtzeit-Deckel des Quantums (128 / 48 000 s — mehr, und der Graph reißt). Jede hörbare
    // Stimme liegt vor dem Rendern bereit (ihre Texturen rechnet der Kern einmal je Seite, umweltPaket, außerhalb der Uhr) —
    // der Graph trägt, was das Gesetz am Ort klingen lässt (Stimmen-Deckel).
    var QUANT = 128,
        KLANG_SR = 48000,
        KLANG_S = 2;
    function klangKosten(box, K) {
        var U = K.UMWELT,
            pakete = {},
            deckel = (QUANT / KLANG_SR) * 1000;
        var zeilen = Object.keys(U.orte).map(function (ort) {
            var z = el("div", "h-kosten-zeile"),
                kopf = el("div", "h-kosten-kopf"),
                txt = el("span", "h-kosten-text", "…");
            kopf.appendChild(el("span", "h-kosten-stufe", ort));
            kopf.appendChild(txt);
            z.appendChild(kopf);
            box.appendChild(z);
            return { z: z, txt: txt, ort: ort };
        });
        var i = 0;
        (function naechster() {
            var zz = zeilen[i++];
            if (!zz) return;
            var weiter = function () {
                if (wurzel.requestIdleCallback) wurzel.requestIdleCallback(naechster, { timeout: 800 });
                else setTimeout(naechster, 30);
            };
            try {
                var ctx = new wurzel.OfflineAudioContext(2, KLANG_SR * KLANG_S, KLANG_SR),
                    aus = ctx.createGain(),
                    mix = K.umweltMischung(U.orte[zz.ort]),
                    graph = K.umweltGraph(ctx, aus);
                aus.connect(ctx.destination);
                for (var n in mix) if (mix[n] && mix[n].db >= U.hoerschwelleDb) graph.aufnehmen(pakete[n] || (pakete[n] = K.umweltPaket(n)));
                graph.anwenden(mix, 0);
                var stimmen = graph.zensus().filter((v) => v.an).length,
                    t0 = performance.now();
                ctx.startRendering()
                    .then(function () {
                        var ms = (performance.now() - t0) / ((KLANG_SR * KLANG_S) / QUANT);
                        Object.assign(zz.z.dataset, { stufe: zz.ort, audio: ms.toFixed(4), audioDeckel: deckel.toFixed(4), stimmen: stimmen, fertig: 1 });
                        zz.z.className = "h-kosten-zeile " + (ms > deckel ? "fail" : "pass");
                        zz.txt.textContent = "Audio-Graph " + MS(ms) + " / " + MS(deckel) + " je Quantum · " + stimmen + " Stimmen";
                    })
                    .catch(function (e) {
                        zz.z.dataset.audioFehlt = zz.txt.textContent = "Klang-Fehler: " + ((e && e.message) || e);
                        zz.z.dataset.fertig = 1;
                        zz.z.className = "h-kosten-zeile fail";
                    })
                    .then(weiter);
            } catch (e) {
                zz.z.dataset.audioFehlt = zz.txt.textContent = "Klang-Fehler: " + ((e && e.message) || e);
                zz.z.dataset.fertig = 1;
                zz.z.className = "h-kosten-zeile fail";
                weiter();
            }
        })();
    }
    function kosten(ziel, opt) {
        opt = opt || {};
        var budget = opt.budget || {};
        // jede Stufe der Zeile, die NUR-WURF-Stufe eingeschlossen (sie wird nie gezeigt, sie kostet im Schatten-Pass)
        var stufen = (opt.stufen || Object.keys(budget).filter(function (k) {
            return /^\d+$/.test(k);
        }).map(Number)).filter(function (s) {
            return !!budget[s];
        });
        var box = el("div", "h-kosten");
        box.appendChild(el("div", "h-gruppe", opt.titel || "KOSTEN JE STUFE"));
        var zeilen = {};
        var quelle = el("div", "h-kosten-quelle", opt.meshfrei || opt.quelle || "");
        if (opt.meshfrei) {
            box.appendChild(el("div", "h-kosten-kopf", "meshfrei · 0 Dreiecke"));
            if (opt.klang) klangKosten(box, opt.klang);
            box.appendChild(quelle);
            if (ziel) ziel.appendChild(box);
            return { el: box, neu: function () {}, messen: function () {}, stand: function () {
                return {};
            } };
        }
        stufen.forEach(function (s) {
            var z = el("div", "h-kosten-zeile");
            var kopf = el("div", "h-kosten-kopf");
            kopf.appendChild(el("span", "h-kosten-stufe", "L" + s + (budget[s].nurWurf ? "·Wurf" : "")));
            var txt = el("span", "h-kosten-text", "…");
            kopf.appendChild(txt);
            var bahn = el("div", "h-kosten-bahn");
            var balken = el("div", "h-kosten-balken");
            var bandMarke = el("div", "h-kosten-band");
            bahn.appendChild(balken);
            bahn.appendChild(bandMarke);
            z.appendChild(kopf);
            z.appendChild(bahn);
            box.appendChild(z);
            zeilen[s] = { z: z, txt: txt, balken: balken, band: bandMarke, gemessen: null, lauf: 0 };
        });
        box.appendChild(quelle);
        if (ziel) ziel.appendChild(box);
        var stand = {};
        var R = function () {
            return typeof opt.renderer === "function" ? opt.renderer() : opt.renderer;
        };
        // die Speicher-Karte des r128-Kontexts steht, bevor das erste Werk hochlädt
        if (R() && !R().isWebGPURenderer) glKarte(R());
        var breit = function () {
            return !!(R() && R().isWebGPURenderer);
        };
        var wurfStufe = function (s) {
            return !!(budget[s] && budget[s].nurWurf);
        };
        // die Zeile aus dem, was steht: c gezählt, c.gezeichnet die Gegenzahl aus dem Zähl-Abschnitt (ohne sie bleibt die
        // Befehls-Spalte die Budget-Zeile), zz.deckel die Band-Deckel — für ihre Leser (gate:studio-huelle H4, H7, H8) im dataset
        function schreibe(s) {
            var zz = zeilen[s],
                b = budget[s],
                c = zz.c,
                g = c.gezeichnet,
                d = zz.deckel || {};
            var deckel = b.tris || 1;
            var anteil = Math.min(1, c.tris / deckel);
            g = g || {};
            var daten = { stufe: s, leiste: c.tris, deckel: b.tris || 0, befehle: c.befehle, vram: c.vram, gezeichnet: g.tris, befehleGezeichnet: g.befehle };
            if (zz.werk) Object.assign(daten, { werk: zz.werk.werk, werkBuehne: String(zz.werk.buehne), werkWelt: String(zz.werk.welt) });
            Object.assign(daten, { vramGpu: g.vram, vramDeckel: d.vram, msDeckel: d.ms, deckelFehlt: d.fehlt, ms: g.ms, zeitFehlt: g.zeitFehlt, bank: g.bank, bankCpu: g.bankCpu });
            // fertig: die Gegenzahl, die Zeit (oder ihr Grund) und die Deckel (oder ihr Grund) stehen — der Gang liest erst dann
            daten.fertig = g.tris != null && (g.ms != null || g.zeitFehlt) && (d.vram != null || d.fehlt) ? 1 : null;
            Object.keys(daten).forEach(function (k) {
                var v = daten[k];
                if (v != null) zz.z.dataset[k] = typeof v === "number" ? +v.toFixed(4) : v;
                else delete zz.z.dataset[k];
            });
            g = c.gezeichnet;
            zz.balken.style.width = (anteil * 100).toFixed(1) + "%";
            if (b.band) {
                zz.band.style.left = ((b.band / deckel) * 100).toFixed(1) + "%";
                zz.band.style.display = "";
            } else zz.band.style.display = "none";
            // die fertige Zeile urteilt ganz — am dataset, dasselbe Urteil an denselben Zahlen wie der Gang —, die werdende (und die
            // Werkstatt ohne Gegenzahl) am Deckel
            var urteil = daten.fertig ? zeileUrteil(Object.assign({}, zz.z.dataset), daten.ms != null) : c.tris > deckel ? ["L" + s + " △ " + c.tris + " über dem Deckel " + deckel] : [];
            var klasse = urteil.length ? "fail" : b.band && c.tris > b.band ? "warn" : "pass";
            zz.z.className = "h-kosten-zeile " + klasse;
            var t = c.tris.toLocaleString("de-DE") + " / " + deckel.toLocaleString("de-DE") + " △";
            if (b.band) t += " · Band ×" + (c.tris / b.band).toFixed(2);
            var gezaehlt = c.befehle != null ? "gezählt " + c.befehle + ", " : "";
            if (g) t += " · gezeichnet " + g.tris.toLocaleString("de-DE") + " △ in " + g.befehle + " Befehlen (" + gezaehlt + "Zeile " + (b.draws || "–") + ")";
            else t += " · " + gezaehlt + (b.draws || "–") + " Befehle der Zeile";
            if (c.vram != null) t += " · VRAM " + MB(c.vram) + (g ? " (GPU " + MB(g.vram) + ")" : "") + (d.vram != null ? " / " + MB(d.vram) : "");
            if (g && (g.ms != null || g.zeitFehlt))
                t += " · GPU " + (g.ms != null ? MS(g.ms) + (d.ms != null ? " / " + MS(d.ms) : "") : "–: " + g.zeitFehlt) + (g.bank != null ? " (Bank " + MS(g.bank) + ", CPU " + MS(g.bankCpu) + ")" : "");
            if (d.fehlt) t += " · Deckel: " + d.fehlt;
            t += " · " + c.stoffe + " Stoffe";
            if (urteil.length) t += " · ROT " + urteil.join(" · ");
            else if (zz.werk) t += " · Werk = Welt";
            if (typeof b.schatten === "number") t += " · Wurf L" + b.schatten;
            zz.txt.textContent = t;
            zz.z.title =
                "Stufe " + s + ": " + c.meshes + " Meshes (" + c.werfer + " werfen im Labor) · Budget-Zeile tris " + deckel + (b.band ? " · band " + b.band : "") + " · draws " + b.draws + " · Schatten-Stufe " + b.schatten;
        }
        function zeigen(s, c, g) {
            var zz = zeilen[s];
            var b = budget[s];
            if (!zz || !b) return;
            var zeit = g && g.zeit,
                lauf = ++zz.lauf;
            if (g) delete g.zeit;
            if (g) c.gezeichnet = g;
            // DIE BÜHNE ZEIGT DAS WERK DER WELT (studios.K4): die erste Stufe misst je Bau die Wurzel der Bühne gegen den Bau des Kerns
            zz.werk = s === stufen[0] && werkWurzel ? werkMass() || { werk: "ohne Kern" } : null;
            stand[s] = zz.c = c;
            schreibe(s);
            var spaeter = function (fn) {
                return function (x) {
                    if (lauf !== zz.lauf) return;
                    fn(x);
                    schreibe(s);
                };
            };
            if (zeit)
                zeit.then(
                    spaeter(function (z) {
                        Object.assign(g, z);
                    }),
                    spaeter(function (e) {
                        g.zeitFehlt = "Zeitstempel-Fehler: " + ((e && e.message) || e);
                    })
                );
            if (!zz.deckel && b.tris)
                bandDeckel(b.tris, b.draws).then(
                    spaeter(function (d) {
                        zz.deckel = d;
                    }),
                    spaeter(function (e) {
                        zz.deckel = { fehlt: "Profi-Band nicht geladen (" + ((e && e.message) || e) + ")" };
                    })
                );
        }
        var uhr = null;
        var lauf = 0;
        var K = {
            el: box,
            stand: function () {
                return stand;
            },
            // die Labor-Gestalt der Stufe s direkt zählen (was der Schirm zeigt; wegwerf: eine Mess-Gestalt, die niemand zeigt)
            messen: function (obj, s, wegwerf) {
                if (s == null) s = stufen[0];
                zeigen(s, zaehle(obj, wurfStufe(s), breit()), zeichne(R(), obj, !!wegwerf, wurfStufe(s)));
            },
            // gezählte Kosten der Stufe s setzen ({ tris, stoffe, meshes, werfer, befehle, vram }) — die Welt-Werkstatt zählt das Werk der Foundry
            setzen: function (s, c) {
                zeigen(s, c);
            },
            // die Welt-Gestalt neu messen (entprellt, eine Stufe je Leerlauf — der Regler-Zug bleibt frei)
            neu: function () {
                if (!opt.bauen) return;
                clearTimeout(uhr);
                var meinLauf = ++lauf;
                uhr = setTimeout(function () {
                    var i = 0;
                    // ein Renderer, der noch nicht bereit ist (r184 vor init), schiebt den Lauf — die Leiste misst nie ohne Gegenzahl
                    if (R() && R().initialized === false) return K.neu();
                    var naechste = function () {
                        if (meinLauf !== lauf || i >= stufen.length) return;
                        var s = stufen[i++];
                        try {
                            var obj = opt.bauen(s);
                            zeigen(s, zaehle(obj, wurfStufe(s), breit()), zeichne(R(), obj, true, wurfStufe(s)));
                        } catch (e) {
                            zeilen[s].txt.textContent = "Bau-Fehler: " + ((e && e.message) || e);
                            zeilen[s].z.className = "h-kosten-zeile fail";
                        }
                        if (wurzel.requestIdleCallback) wurzel.requestIdleCallback(naechste, { timeout: 800 });
                        else setTimeout(naechste, 30);
                    };
                    naechste();
                }, opt.ruheMs == null ? 500 : opt.ruheMs);
            },
        };
        return K;
    }

    // ── DAS PANORAMA DES STUDIOS (D8, Karte „Das Tor als Fenster") — die EINE Quelle des Ziel-Bilds der Tor-Membran ──
    // Das Studio rendert seine EIGENE Welt (seine Szene, sein Renderer, Labor = Welt) einmal von einem Ort aus: sechs
    // 90°-Würfe (je Seite ein ebenes Ziel 256²), gefaltet ins Equirekt 512 × 256 (die Richtung je Texel wie three
    // `equirectUV`: u = atan2(z, x)/2π + ½, v = asin(y)/π + ½, Zeile 0 unten). DER BLICK DES STUDIOS: `opt.kamera` stellt den
    // Ort (ihre Lage), die Tiefe (nah/fern) und dreht das Bild, bis die Mitte der Öffnung (−z des Lesers, u = ¼) zeigt, was die
    // Kamera vor sich hat.
    // DIE WERTE sind die Bild-Werte des Studios, ins Lineare gelesen: die Würfe schreiben wie der Schirm (sRGB-Kodierung des Ziels
    // — Hintergrund und Nebel stehen in r128 in Bild-Werten, die Stoffe kodiert der Shader), die Faltung dekodiert; ohne
    // Tonabbildung (der Leser belichtet und tont selbst). opt: verbergen (Objekte, die nicht ins Bild gehören — die eigene
    // Membran), nah/fern, lesen (true: nur die Texel als Halbfloat-Puffer, der Welt-Export). Rückgabe { w, h, daten, textur } —
    // die textur (dieselben Halbfloat-Texel) liest das Labor selbst; unter r184 WebGPU als Versprechen.
    var PANO_W = 512,
        PANO_H = 256;
    function halb(x) {
        // float32 → float16 (IEEE 754 binary16, gerundet zur nächsten, Überlauf → ∞, unter dem Normalbereich subnormal)
        var f = halb.f || (halb.f = new Float32Array(1)),
            u = halb.u || (halb.u = new Uint32Array(f.buffer));
        f[0] = x;
        var b = u[0],
            s = (b >>> 16) & 0x8000,
            e = ((b >>> 23) & 0xff) - 112,
            m = b & 0x7fffff;
        if (e >= 31) return s | (((b >>> 23) & 0xff) === 0xff && m ? 0x7e00 : 0x7c00);
        if (e <= 0) {
            if (e < -10) return s;
            m = (m | 0x800000) >> (1 - e);
            return s | ((m + 0x1000) >> 13);
        }
        return s | ((e << 10) + ((m + 0x1000) >> 13));
    }
    function panorama(T, renderer, scene, ort, opt) {
        opt = opt || {};
        var kam = opt.kamera || null,
            drehung = 0;
        if (kam) {
            // die Tiefe des Blicks ist die der Kamera: was jenseits ihres fern liegt (die Kuppel, der Horizont-Ring), zeigt das
            // Studio nie — die Würfe auch nicht
            if (opt.nah == null) opt.nah = kam.near;
            if (opt.fern == null) opt.fern = kam.far;
            kam.updateMatrixWorld();
            ort = [kam.position.x, kam.position.y, kam.position.z];
            var vor = new T.Vector3();
            kam.getWorldDirection(vor);
            if (vor.x * vor.x + vor.z * vor.z > 1e-8) drehung = Math.atan2(vor.z, vor.x) + Math.PI / 2;
        }
        var kodiert = T.sRGBEncoding !== undefined;
        // SECHS EBENE WÜRFE statt eines Würfel-Ziels: auf der Radeon 890M (ANGLE/D3D11) löschte r128 den Hintergrund nur in EINER
        // Seite eines WebGLCubeRenderTarget — die übrigen fünf blieben schwarz, wo keine Geometrie stand (der Himmel des Fachwerks
        // schwarz, Mittel 0,309 statt 0,542 unter swiftshader). Je Seite ein eigenes 2D-Ziel mit eigener Kamera (90°, Seitenverhältnis
        // 1); die Faltung projiziert jede Richtung in die Seite mit dem größten Anteil.
        var SEITEN = [
            [1, 0, 0, 0, 1, 0],
            [-1, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, -1],
            [0, -1, 0, 0, 0, 1],
            [0, 0, 1, 0, 1, 0],
            [0, 0, -1, 0, 1, 0],
        ];
        var ziele = [],
            roh = [],
            vor6 = [],
            rechts6 = [],
            hoch6 = [];
        var verborgen = opt.verbergen || [];
        var sicht = verborgen.map(function (o) {
            return o.visible;
        });
        verborgen.forEach(function (o) {
            o.visible = false;
        });
        var tm = renderer.toneMapping,
            alt = renderer.getRenderTarget();
        renderer.toneMapping = T.NoToneMapping;
        try {
            for (var i = 0; i < 6; i++) {
                var S = SEITEN[i];
                var ziel = new (renderer.isWebGPURenderer ? T.RenderTarget : T.WebGLRenderTarget)(256, 256, {
                    type: T.HalfFloatType,
                    generateMipmaps: false,
                    minFilter: T.LinearFilter,
                    magFilter: T.LinearFilter,
                    encoding: kodiert ? T.sRGBEncoding : undefined,
                });
                var cam = new T.PerspectiveCamera(90, 1, opt.nah || 0.1, opt.fern || 4000);
                cam.position.set(ort[0], ort[1], ort[2]);
                cam.up.set(S[3], S[4], S[5]);
                cam.lookAt(ort[0] + S[0], ort[1] + S[1], ort[2] + S[2]);
                cam.updateMatrixWorld(true);
                var e = cam.matrixWorld.elements;
                rechts6.push(new T.Vector3(e[0], e[1], e[2]));
                hoch6.push(new T.Vector3(e[4], e[5], e[6]));
                vor6.push(new T.Vector3(S[0], S[1], S[2]));
                renderer.setRenderTarget(ziel);
                renderer.render(scene, cam);
                ziele.push(ziel);
                if (!renderer.isWebGPURenderer) {
                    var gl = renderer.getContext(),
                        px = new Float32Array(256 * 256 * 4);
                    gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.FLOAT, px); // das gebundene Ziel, Zeile 0 unten
                    roh.push(px);
                }
            }
        } finally {
            verborgen.forEach(function (o, i) {
                o.visible = sicht[i];
            });
        }
        renderer.setRenderTarget(alt);
        renderer.toneMapping = tm;
        // DIE EINE FALTUNG (beide Engines, die Ratsche H6 läuft auf ihr aus): die sechs Würfe kommen gelesen zurück — r184
        // WebGPU als Versprechen (Halbfloat; Zeile 0 OBEN auf dem WebGPU-Backend, UNTEN auf seinem WebGL2-Ersatz), r128 sofort
        // (RGBA/FLOAT, die Lese-Art, die WebGL2 jedem Float-Ziel erlaubt) — und falten sich auf der CPU: je Richtung die Seite mit
        // dem größten Anteil, bilinear an geklemmter Kante, die kodierten Bild-Werte erst danach ins Lineare.
        var N = 256,
            falten = function (seiten) {
                ziele.forEach(function (z) {
                    z.dispose();
                });
                var f = new Float32Array(PANO_W * PANO_H * 4),
                    c = [0, 0, 0],
                    zahl = function (v) {
                        return [v.x, v.y, v.z];
                    },
                    F = vor6.map(zahl),
                    R = rechts6.map(zahl),
                    H = hoch6.map(zahl),
                    cosA = [],
                    sinA = [];
                for (var i = 0; i < PANO_W; i++) {
                    var az = ((i + 0.5) / PANO_W - 0.5) * 2 * Math.PI + drehung;
                    cosA.push(Math.cos(az));
                    sinA.push(Math.sin(az));
                }
                for (var j = 0; j < PANO_H; j++) {
                    var el = ((j + 0.5) / PANO_H - 0.5) * Math.PI,
                        ce = Math.cos(el),
                        dy = Math.sin(el),
                        ay = Math.abs(dy);
                    for (i = 0; i < PANO_W; i++) {
                        var dx = ce * cosA[i],
                            dz = ce * sinA[i],
                            ax = Math.abs(dx),
                            azz = Math.abs(dz);
                        var s = ax >= ay && ax >= azz ? (dx > 0 ? 0 : 1) : ay >= azz ? (dy > 0 ? 2 : 3) : dz > 0 ? 4 : 5;
                        var fv = F[s],
                            rs = R[s],
                            hs = H[s],
                            z = dx * fv[0] + dy * fv[1] + dz * fv[2],
                            u = (((dx * rs[0] + dy * rs[1] + dz * rs[2]) / z) * 0.5 + 0.5) * N - 0.5,
                            v = (((dx * hs[0] + dy * hs[1] + dz * hs[2]) / z) * 0.5 + 0.5) * N - 0.5;
                        var x0 = Math.floor(u),
                            y0 = Math.floor(v),
                            fx = u - x0,
                            fy = v - y0,
                            xa = Math.max(0, Math.min(N - 1, x0)) * 4,
                            xb = Math.max(0, Math.min(N - 1, x0 + 1)) * 4,
                            ya = Math.max(0, Math.min(N - 1, y0)) * N * 4,
                            yb = Math.max(0, Math.min(N - 1, y0 + 1)) * N * 4,
                            q = seiten[s],
                            o = (j * PANO_W + i) * 4;
                        for (var k = 0; k < 3; k++) {
                            c[k] =
                                (q[ya + xa + k] * (1 - fx) + q[ya + xb + k] * fx) * (1 - fy) +
                                (q[yb + xa + k] * (1 - fx) + q[yb + xb + k] * fx) * fy;
                            f[o + k] = !kodiert ? c[k] : c[k] < 0.04045 ? c[k] / 12.92 : Math.pow((c[k] + 0.055) / 1.055, 2.4);
                        }
                        f[o + 3] = 1;
                    }
                }
                var daten = halbPuffer(f),
                    textur = null;
                if (!opt.lesen) {
                    // das Labor liest dieselben Texel, die der Export trägt (Halbfloat, Zeile 0 unten, linear gefiltert)
                    textur = new T.DataTexture(daten, PANO_W, PANO_H, T.RGBAFormat, T.HalfFloatType);
                    textur.minFilter = textur.magFilter = T.LinearFilter;
                    textur.needsUpdate = true;
                }
                return { w: PANO_W, h: PANO_H, daten: daten, textur: textur };
            };
        if (!renderer.isWebGPURenderer) return falten(roh);
        return Promise.all(
            ziele.map(function (z) {
                return renderer.readRenderTargetPixelsAsync(z, 0, 0, N, N);
            })
        ).then(function (halbe) {
            var oben = !!(renderer.backend && renderer.backend.isWebGPUBackend),
                Z = N * 4;
            return falten(
                halbe.map(function (r) {
                    var q = new Float32Array(N * Z);
                    for (var p = 0; p < N * Z; p++) q[(oben ? N - 1 - ((p / Z) | 0) : (p / Z) | 0) * Z + (p % Z)] = T.DataUtils.fromHalfFloat(r[p]);
                    return q;
                })
            );
        });
    }
    function halbPuffer(f) {
        var d = new Uint16Array(f.length);
        for (var i = 0; i < f.length; i++) d[i] = halb(f[i]);
        return d;
    }
    // DIE FLACHE WELT (D8): eine Welt ohne Szene (die Skelett-Leere, das Strom-Feld, der Klang) malt ihr Equirekt selbst in
    // IHRER Technik — `maler(ctx, w, h)` auf eine 2D-Fläche 512 × 256 (Zeile 0 OBEN wie jede Leinwand; die Mitte der Öffnung
    // ist u = ¼), Bild-Werte sRGB; die Hülle liest sie ins Lineare und legt Zeile 0 nach unten wie das Equirekt des Würfels.
    function panoramaBild(maler) {
        var cv = doc.createElement("canvas");
        cv.width = PANO_W;
        cv.height = PANO_H;
        var ctx = cv.getContext("2d");
        maler(ctx, PANO_W, PANO_H);
        var px = ctx.getImageData(0, 0, PANO_W, PANO_H).data;
        var f = new Float32Array(PANO_W * PANO_H * 4);
        var lin = function (c) {
            c /= 255;
            return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        for (var y = 0; y < PANO_H; y++)
            for (var x = 0; x < PANO_W; x++) {
                var q = ((PANO_H - 1 - y) * PANO_W + x) * 4,
                    z = (y * PANO_W + x) * 4;
                f[z] = lin(px[q]);
                f[z + 1] = lin(px[q + 1]);
                f[z + 2] = lin(px[q + 2]);
                f[z + 3] = 1;
            }
        return { w: PANO_W, h: PANO_H, daten: halbPuffer(f) };
    }

    var reisender = null; // der Avatar, den die Heimat beim Betreten schickte (`bruecke`, enter)
    // DAS MASS DES WERKS (studios.K4, Labor = Welt): `opt.werk` und `opt.wurzel` der Brücke — die Box der Wurzel der Bühne (die
    // sichtbaren Meshes, eine Instanz je Instanz-Matrix) gegen die Box des Werks, das der Kern der Welt für ihre Übergabe baut
    // (`buildInstance(preset, seed, 0, ov)` des Kerns, der die Art trägt — dasselbe baut die Brücke der Welt); null ohne Werk,
    // Wurzel oder Kern. Leser: gate:studio-huelle H9 (die Wurzel trägt das Werk der Welt).
    var werkDerBuehne = null,
        werkWurzel = null;
    function werkMass() {
        var T = wurzel.THREE,
            w = werkDerBuehne && werkDerBuehne(),
            g = werkWurzel && werkWurzel();
        var K = [wurzel]
            .concat(Object.keys(wurzel).filter(function (n) {
                return /^__\w+Core$/.test(n);
            }).map(function (n) {
                return wurzel[n];
            }))
            .filter(function (k) {
                return w && k && k.PARAMS_BY_KIND && k.PARAMS_BY_KIND[w.kind] && typeof k.buildInstance === "function";
            })[0];
        if (!T || !g || !K) return null;
        var mass = function (o, sicht) {
            var b = new T.Box3(),
                m = new T.Box3(),
                im = new T.Matrix4();
            o.updateMatrixWorld(true);
            o[sicht ? "traverseVisible" : "traverse"](function (x) {
                for (var i = 0; x.isMesh && i < (x.isInstancedMesh ? x.count : 1); i++) {
                    if (!x.geometry.boundingBox) x.geometry.computeBoundingBox();
                    m.copy(x.geometry.boundingBox);
                    if (x.isInstancedMesh) x.getMatrixAt(i, im), m.applyMatrix4(im);
                    b.union(m.applyMatrix4(x.matrixWorld));
                }
            });
            return b.isEmpty() ? null : b.getSize(new T.Vector3()).toArray().map(function (v) {
                return +v.toFixed(2);
            });
        };
        return { werk: w.kind + " " + w.preset, buehne: mass(g, true), welt: mass(K.buildInstance(w.preset, w.seed, 0, w.ov), false) };
    }
    // das Urteil (die Leiste und gate:studio-huelle H9 lesen dasselbe): eine Achse über 2 % des Halbmessers des Werks der Welt
    function werkUrteil(m) {
        var d =
            m && m.buehne && m.welt
                ? (2 * Math.max.apply(null, m.welt.map(function (v, i) {
                      return Math.abs(m.buehne[i] - v);
                  }))) / Math.hypot.apply(null, m.welt)
                : Infinity;
        return d <= 0.02 ? [] : ["die Wurzel der Bühne " + (m && m.buehne) + " m, das Werk der Welt " + (m && m.welt) + " m (" + (m && m.werk) + ")"];
    }

    // ── DIE PORTAL-BRÜCKE + DER DSL-ADAPTER (skeleton-Norm, EINE Kopie) ──
    // opt: welt · label · dsl (Wörter) | manifest (true = ./manifest.json lesen und melden) · wort(w, args) → die Tat ·
    //      enter(avatar, msg) · esc(ev) → false behält Esc in der Welt · sonst(msg) jede andere Nachricht der Heimat (das
    //      terrain-Labor reicht so die Asset-Kanäle an die Foundry-Brücke, foundryKanal) · panorama() → { THREE, renderer,
    //      scene, kamera | ort, verbergen } oder { bild(ctx, w, h) } (die flache Welt), auch als Versprechen — DER EXPORT DES
    //      ZIEL-BILDS (D8): fragt die Heimat `{ type: "panorama-bitte" }`, rendert die Hülle das Panorama der Welt (`panorama`
    //      bzw. `panoramaBild`, gelesen) und schickt `{ type: "panorama", world, w, h, daten }` (Halbfloat-Texel, übertragen);
    //      eine Welt ohne panorama() antwortet laut mit `fehler` · werk() → { kind, preset, seed, ov } das Werk der Bühne (Art und
    //      Rezept des Kerns, der Same des Baus, die Werte seiner Regler-Zeilen aus PARAMS_BY_KIND, beim Körper dazu die Wahlen)
    //      oder null (die Bühne trägt kein Werk des Vertrags) · wurzel() das Objekt der Bühne, das dieses Werk zeigt (`werkMass`) · werkOrt das Element, das den Knopf trägt (sonst schwebt er)
    function bruecke(opt) {
        opt = opt || {};
        var eltern = wurzel.parent && wurzel.parent !== wurzel ? wurzel.parent : null;
        werkDerBuehne = opt.werk || null;
        werkWurzel = opt.wurzel || null;
        function post(m) {
            if (!eltern) return;
            try {
                eltern.postMessage(m, "*");
            } catch (_e) {
                /* die Heimat ist fort */
            }
        }
        function wirke(programm) {
            if (!Array.isArray(programm) || typeof programm[0] !== "string") return;
            if (programm[0] === "chain") {
                for (var i = 1; i < programm.length; i++) wirke(programm[i]);
                return;
            }
            if (opt.wort) opt.wort(programm[0].toLowerCase().trim(), programm.slice(1));
        }
        // DER EINE ÜBERGABE-KANAL (pipeline.K1): das Werk reist als EINE Nachricht, die Welt schreibt es in ihren Prägungs-
        // Speicher (`_studioUebergabeEmpfang`) — kein Studio postet eine Übergabe selbst (gate:studio-uebergabe).
        function werk(kind, preset, seed, ov) {
            post({ type: "uebergabe", world: opt.welt, kind: kind, preset: preset, seed: seed, ov: ov || {} });
        }
        var B = {
            post: post,
            wirke: wirke,
            werk: werk,
            ereignis: function (text) {
                post({ type: "event", text: String(text) });
            },
        };
        if (!eltern) return B;
        // im Tor liegt die Zeile der Heimat (Esc — Heimkehr …) unten über der Welt: die Meldungs-Zeile steht darüber
        if (doc && doc.body) doc.body.classList.add("h-im-tor");
        if (opt.werk && doc && doc.body) {
            var knopf = el("button", "h-werk" + (opt.werkOrt ? "" : " h-werk-frei"), "In der Welt ansehen");
            knopf.type = "button";
            knopf.title = "Das Werk der Bühne reist in die Welt: das nächste gesetzte Werk dieser Art trägt es";
            knopf.addEventListener("click", function () {
                var w = opt.werk();
                if (!w) return toast("Diese Bühne trägt kein Werk des Vertrags — ihre Regler sind keine Zeilen des Kerns");
                werk(w.kind, w.preset, w.seed, w.ov);
                post({ type: "exit", world: opt.welt });
            });
            (opt.werkOrt || doc.body).appendChild(knopf);
        }
        wurzel.addEventListener("message", function (ev) {
            if (ev.source !== eltern) return;
            var m = ev.data;
            if (!m || typeof m !== "object") return;
            if (m.type === "enter") {
                // WAS DER REISENDE TRÄGT (tore.K3): die Hülle hält den Avatar der Heimat — Leib, Inventar und Gehaltenes
                // (`gepaeck`) stehen drüben byte-gleich, jede Welt liest ihn über `reisender()`, die Zeile sagt es dem Spieler
                reisender = m.avatar && typeof m.avatar === "object" ? m.avatar : {};
                var g = reisender.gepaeck;
                var n = 0;
                if (g && g.wield && g.inventar) {
                    (g.inventar.slots || []).forEach(function (s) {
                        n += s ? s.count || 1 : 0;
                    });
                    toast("Du trägst: " + (g.wield.held || "die leere Hand") + " · " + n + " Dinge im Inventar", 3200);
                }
                if (opt.enter) opt.enter(reisender, m);
            } else if (m.type === "dsl") wirke(m.program);
            else if (m.type === "panorama-bitte") {
                var antwort = { type: "panorama", world: opt.welt, reqId: m.reqId };
                var schick = function () {
                    try {
                        eltern.postMessage(antwort, "*", antwort.daten ? [antwort.daten.buffer] : []);
                    } catch (_e) {
                        /* die Heimat ist fort */
                    }
                };
                var bruch = function (e) {
                    antwort.daten = null;
                    antwort.fehler = String((e && e.message) || e);
                    schick();
                };
                // die Welt nennt ihr Bild — sofort oder als Versprechen, wenn sie erst wachsen muss
                new Promise(function (ja) {
                    ja(opt.panorama ? opt.panorama() : null);
                })
                    .then(function (q) {
                        var P = null;
                        if (q && typeof q.bild === "function") P = panoramaBild(q.bild);
                        else if (q && q.renderer && q.scene)
                            P = panorama(q.THREE || wurzel.THREE, q.renderer, q.scene, q.ort || [0, 1.7, 0], {
                                kamera: q.kamera,
                                verbergen: q.verbergen,
                                lesen: true,
                            });
                        return P; // r184 faltet als Versprechen (das gelesene Bild), r128 sofort
                    })
                    .then(function (P) {
                        if (!P) throw new Error("die Welt nennt kein Panorama (bruecke ohne panorama())");
                        antwort.w = P.w;
                        antwort.h = P.h;
                        antwort.daten = P.daten;
                        schick();
                    })
                    .catch(bruch);
            } else if (opt.sonst) opt.sonst(m);
        });
        wurzel.addEventListener("keydown", function (ev) {
            if (ev.key !== "Escape") return;
            if (opt.esc && opt.esc(ev) === false) return;
            post({ type: "exit", world: opt.welt });
        });
        function bereit(extra) {
            post(Object.assign({ type: "ready", world: opt.welt }, extra || {}));
        }
        if (opt.manifest)
            fetch("./manifest.json")
                .then(function (res) {
                    return res.ok ? res.json() : null;
                })
                .then(function (m) {
                    var dsl = m && Array.isArray(m.dsl) ? m.dsl : null;
                    var label = m && typeof m.label === "string" ? m.label : null;
                    bereit(dsl ? { dsl: dsl, label: label } : {});
                })
                .catch(function () {
                    bereit({});
                });
        else bereit(opt.dsl ? { label: opt.label, dsl: opt.dsl } : opt.label ? { label: opt.label } : {});
        return B;
    }

    // Ein Knopf, dessen Text das Wort ist (die Preset-Leisten der Studios): klicken, true; sonst false.
    function knopfMitText(wurzelEl, wort, sel) {
        var ks = (wurzelEl || doc).querySelectorAll(sel || "button");
        for (var i = 0; i < ks.length; i++)
            if ((ks[i].textContent || "").trim().toLowerCase() === wort) {
                ks[i].click();
                return true;
            }
        return false;
    }

    // DIE MATRIX-TAFEL (w11-leib): der Einblick in den Zustand des Kerns, den das Studio zeigt — EINE Anzeige-Schicht für jeden
    // Leib (das Körper-Studio und Tetrapoda lesen sie, beide gehen den Leib der Welt). Das Studio reicht `opt.lesen()` →
    // {glieder (Gelenke des Skeletts), art (Gangart), S (Fußweg), tast (Tastgrad), phasen [rad, je Fuß die Phase des Gang-
    // Gesetzes], fuesse [[x, z] Welt], namen, schwerpunkt [x, z], gier, meterJe} oder null (kein Kern-Gang). Ob ein Fuß steht,
    // sagt das Gesetz selbst (tetrapoda `gangFuss`: kein Hub = Stand); die Stützfläche ist die Hülle der stehenden Füße, ihr
    // Rand der kürzeste Abstand des Schwerpunkt-Lots zu ihr (+ innen, − außen). Die Tafel zeichnet im Rahmen des Leibs (vorn
    // = oben) und hält ihren letzten Stand (`stand()`) für die Linsen.
    function huelleKonvex(p) {
        if (p.length < 3) return p.slice();
        var q = p.slice().sort(function (a, b) {
            return a[0] - b[0] || a[1] - b[1];
        });
        var x = function (o, a, b) {
            return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        };
        var lo = [],
            hi = [];
        q.forEach(function (pt) {
            while (lo.length >= 2 && x(lo[lo.length - 2], lo[lo.length - 1], pt) <= 0) lo.pop();
            lo.push(pt);
        });
        q.slice().reverse().forEach(function (pt) {
            while (hi.length >= 2 && x(hi[hi.length - 2], hi[hi.length - 1], pt) <= 0) hi.pop();
            hi.push(pt);
        });
        return lo.slice(0, -1).concat(hi.slice(0, -1));
    }
    function stuetzRand(poly, c) {
        if (!poly.length) return null;
        var seg = function (a, b) {
            var dx = b[0] - a[0],
                dz = b[1] - a[1],
                l2 = dx * dx + dz * dz,
                u = l2 > 0 ? Math.max(0, Math.min(1, ((c[0] - a[0]) * dx + (c[1] - a[1]) * dz) / l2)) : 0;
            return Math.hypot(c[0] - a[0] - u * dx, c[1] - a[1] - u * dz);
        };
        if (poly.length < 3) return -(poly.length === 1 ? Math.hypot(c[0] - poly[0][0], c[1] - poly[0][1]) : seg(poly[0], poly[1]));
        var d = Infinity,
            innen = true;
        for (var i = 0; i < poly.length; i++) {
            var a = poly[i],
                b = poly[(i + 1) % poly.length];
            d = Math.min(d, seg(a, b));
            if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) < 0) innen = false;
        }
        return innen ? d : -d;
    }
    function matrix(opt) {
        opt = opt || {};
        var box = el("div", "h-matrix");
        box.appendChild(el("div", "h-gruppe", "MATRIX · DER KERN-ZUSTAND"));
        var quelle = el("div", "h-matrix-quelle", opt.quelle || "");
        box.appendChild(quelle);
        var cv = doc.createElement("canvas");
        cv.width = cv.height = 160;
        cv.className = "h-matrix-bild";
        box.appendChild(cv);
        var text = el("div", "h-matrix-text", "…");
        box.appendChild(text);
        var letzter = null;
        function zeichne() {
            var z = opt.lesen ? opt.lesen() : null;
            var c = cv.getContext && cv.getContext("2d");
            if (c) c.clearRect(0, 0, cv.width, cv.height);
            if (!z) {
                letzter = null;
                text.textContent = opt.ohne || "kein Kern-Gang";
                return null;
            }
            var TC = wurzel.__tetrapodaCore;
            var stehen = z.phasen.map(function (ph) {
                return !(z.S > 0) || TC.gangFuss(ph, z.S, z.tast).hub === 0;
            });
            var poly = huelleKonvex(
                z.fuesse.filter(function (f, i) {
                    return stehen[i];
                })
            );
            var rand = stuetzRand(poly, z.schwerpunkt);
            var mj = z.meterJe > 0 ? z.meterJe : 1;
            letzter = { stehen: stehen, rand: rand === null ? null : rand * mj, flaeche: poly.length, art: z.art, glieder: z.glieder };
            if (c) {
                // der Rahmen des Leibs: das Schwerpunkt-Lot in der Mitte, vorn oben
                var g = z.gier || 0,
                    sn = Math.sin(g),
                    cs = Math.cos(g),
                    s0 = z.schwerpunkt;
                var rahmen = function (p) {
                    var dx = p[0] - s0[0],
                        dz = p[1] - s0[1];
                    return [dx * cs - dz * sn, dx * sn + dz * cs];
                };
                var fr = z.fuesse.map(rahmen),
                    weit = 1e-6;
                fr.forEach(function (p) {
                    weit = Math.max(weit, Math.abs(p[0]), Math.abs(p[1]));
                });
                var k = 62 / weit,
                    M = cv.width / 2;
                var px = function (p) {
                    return [M - p[0] * k, M - p[1] * k];
                };
                if (poly.length) {
                    c.beginPath();
                    poly.map(rahmen).forEach(function (p, i) {
                        var q = px(p);
                        if (i) c.lineTo(q[0], q[1]);
                        else c.moveTo(q[0], q[1]);
                    });
                    c.closePath();
                    c.fillStyle = rand !== null && rand >= 0 ? "rgba(90,200,140,0.25)" : "rgba(220,110,80,0.25)";
                    c.strokeStyle = rand !== null && rand >= 0 ? "#5ac88c" : "#dc6e50";
                    c.fill();
                    c.stroke();
                }
                fr.forEach(function (p, i) {
                    var q = px(p);
                    c.beginPath();
                    c.arc(q[0], q[1], 5, 0, 2 * Math.PI);
                    c.fillStyle = stehen[i] ? "#e8d8a8" : "rgba(232,216,168,0.25)";
                    c.fill();
                    // die Phase des Fußes als Zeiger (der Takt des Gesetzes)
                    var ph = z.phasen[i];
                    c.beginPath();
                    c.moveTo(q[0], q[1]);
                    c.lineTo(q[0] + 9 * Math.sin(ph), q[1] - 9 * Math.cos(ph));
                    c.strokeStyle = "#e8d8a8";
                    c.stroke();
                    if (z.namen && z.namen[i]) {
                        c.fillStyle = "#998866";
                        c.fillText(z.namen[i], q[0] + 7, q[1] + 3);
                    }
                });
                c.beginPath();
                c.arc(M, M, 3.5, 0, 2 * Math.PI);
                c.fillStyle = "#ffffff";
                c.fill();
            }
            text.textContent =
                "Skelett " + z.glieder + " Gelenke · " + (z.art || "stand") + " · Tastgrad " + (+z.tast).toFixed(2) + "\n" +
                "Stand " + stehen.map(function (s) {
                    return s ? "■" : "□";
                }).join("") + " · Schwerpunkt " + (rand === null ? "ohne Stützfläche" : (rand >= 0 ? "+" : "") + (rand * mj * 100).toFixed(1) + " cm " + (rand >= 0 ? "innen" : "außen"));
            return letzter;
        }
        if (opt.ziel) opt.ziel.appendChild(box);
        return {
            el: box,
            zeichne: zeichne,
            stand: function () {
                return letzter;
            },
        };
    }

    // DIE KUGEL DES BLICKS (w12-studio-buehne): der Orbit einer Studio-Bühne als Glied der EINEN Hülle — die Kamera kreist um
    // `target` (Links-Zug dreht, Rechts-Zug oder Strg/Umschalt schiebt, Rad und Zwei-Finger-Kneifen zoomen), gedämpft wie die
    // three-OrbitControls, deren Gestalt sie trägt (target · enabled · enableDamping · dampingFactor · minDistance · maxDistance ·
    // minPolarAngle · maxPolarAngle · update). `update()` liest die Lage der Kamera neu: wer die Kamera setzt, setzt den Orbit.
    // Die Engine der Welt (three r184, vendor/) trägt kein Addon — bis hierher lud jede r128-Bühne das OrbitControls der
    // terrain-Familie (worlds/terrain/lib/OrbitControls.js).
    function kugel(kamera, dom) {
        const T = wurzel.THREE;
        const k = {
            target: new T.Vector3(),
            enabled: true,
            enableDamping: false,
            dampingFactor: 0.05,
            minDistance: 0,
            maxDistance: Infinity,
            minPolarAngle: 0,
            maxPolarAngle: Math.PI,
        };
        const off = new T.Vector3(),
            sph = new T.Spherical(),
            v = new T.Vector3(),
            schub = new T.Vector3(),
            finger = new Map();
        let [dTheta, dPhi, skala, zug, lx, ly, kneif] = [0, 0, 1, -1, 0, 0, 0];
        const mitte = () => {
            const [a, b] = [...finger.values()];
            return b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) } : a;
        };
        dom.style.touchAction = "none";
        dom.addEventListener("contextmenu", (e) => e.preventDefault());
        dom.addEventListener("pointerdown", (e) => {
            if (!k.enabled) return;
            finger.set(e.pointerId, { x: e.clientX, y: e.clientY });
            const m = mitte();
            [lx, ly, kneif] = [m.x, m.y, m.d || 0];
            zug = finger.size > 1 || e.button === 2 || e.ctrlKey || e.metaKey || e.shiftKey ? 2 : 0;
            if (dom.setPointerCapture) dom.setPointerCapture(e.pointerId);
        });
        dom.addEventListener("pointermove", (e) => {
            if (!finger.has(e.pointerId) || !k.enabled) return;
            finger.set(e.pointerId, { x: e.clientX, y: e.clientY });
            const m = mitte();
            const [dx, dy] = [m.x - lx, m.y - ly];
            [lx, ly] = [m.x, m.y];
            if (m.d && kneif) skala *= kneif / m.d;
            kneif = m.d || 0;
            const h = dom.clientHeight || 1;
            if (zug === 0) {
                dTheta -= (2 * Math.PI * dx) / h;
                dPhi -= (2 * Math.PI * dy) / h;
            } else if (zug === 2) {
                // ein Pixel am Schirm = ein Pixel am Ziel
                const d = (2 * off.copy(kamera.position).sub(k.target).length() * Math.tan(((kamera.fov || 50) * Math.PI) / 360)) / h;
                schub.addScaledVector(v.setFromMatrixColumn(kamera.matrix, 0), -dx * d);
                schub.addScaledVector(v.setFromMatrixColumn(kamera.matrix, 1), dy * d);
            }
        });
        const los = (e) => {
            finger.delete(e.pointerId);
            if (!finger.size) return void (zug = -1);
            const m = mitte();
            [lx, ly, kneif, zug] = [m.x, m.y, m.d || 0, 0];
        };
        dom.addEventListener("pointerup", los);
        dom.addEventListener("pointercancel", los);
        dom.addEventListener(
            "wheel",
            (e) => {
                if (!k.enabled) return;
                e.preventDefault();
                skala *= e.deltaY > 0 ? 1 / 0.95 : 0.95;
            },
            { passive: false }
        );
        k.update = () => {
            off.copy(kamera.position).sub(k.target);
            sph.setFromVector3(off);
            const f = k.enableDamping ? k.dampingFactor : 1;
            sph.theta += dTheta * f;
            sph.phi = Math.max(k.minPolarAngle, Math.min(k.maxPolarAngle, sph.phi + dPhi * f));
            sph.makeSafe();
            sph.radius = Math.max(k.minDistance, Math.min(k.maxDistance, sph.radius * skala));
            k.target.addScaledVector(schub, f);
            kamera.position.copy(k.target).add(off.setFromSpherical(sph));
            kamera.lookAt(k.target);
            [dTheta, dPhi, skala] = [dTheta * (1 - f), dPhi * (1 - f), 1];
            schub.multiplyScalar(1 - f);
            return true;
        };
        return k;
    }

    // ── DIE EINE BÜHNE (w28-studio-welt, studios.K4 „Studio = Welt im Bild") ──────────────────────────────────────────────
    // Ein Studio ist ein MODUS DER WELT-ENGINE: unter seiner Seite zeichnet, was die Welt zeichnet — ihre Engine (three r184
    // WebGPU), ihr Licht an ihrer Uhr (welt-licht.js `buehne`) und ihr STOFF. Der Stoff der Welt ist Glied der Stamm-Klasse
    // (`_foundryBuildGroup` → `_foundryTreeMaterial`: Stein, Lack, Fell, Haar, Laub); bis hier gab es ihn nur, wo die ganze Welt
    // bootet — der Boot hängt als letzte Zeile an der Zone Ankunft (stamm/dirigent-ankunft.js), wer die Klasse lud, bekam die Welt
    // (81 s). Darum trug jedes Studio einen eigenen Stoff (r128-GLSL neben dem TSL der Welt), eine eigene Engine und ein eigenes
    // Licht. Die Bühne lädt den Stamm OHNE seine Ankunft: die EINE Liste der Seite der Welt (die Skript-Zeilen von index.html, mit
    // ihrem ?v=), jede Zone außer der Ankunft — die Klasse steht in ~0,4 s, kein Boot, keine Welt; `new AnazhRealm()` ist der Wirt
    // des Stoffs. Das Werk kommt vom Foundry-Faden (derselbe Start `_foundryStart` wie die Welt: build-asset(id, seed, lod, ov))
    // und geht durch `_foundryBuildGroup` des Wirts — die Lieferung, die die Welt zeichnet, in dem Stoff, in dem sie sie zeichnet.
    // GEMESSEN (13.11., Tor „kathedrale", Pose der Station studios.K4 gegen das Welt-Bild der Radeon, Bühne auf swiftshader):
    // r128 mit Labor-Licht und Labor-Stoff 94,7 % · Engine und Licht der Welt mit dem Stoff des Kerns 73,9 % · mit dem Stoff der
    // Welt 63,2 % · in der Stufe, die die Welt an der Pose zeichnet (L2), 52,7 %. Auf der Radeon (dieselbe Karte wie das Welt-Bild
    // 900c28e6, die Formel der Station nachgerechnet): Haus „viktorianisch" 97,9 → 8,3 % (der Boden an der Null des Werks), Tor
    // 94,7 → 43,9 %, Klinge 52,8 → 52,8 % (ihr Rest ist der Spiegel-Pass der Welt, den die Bühne nicht trägt).
    // OFFEN beim Namen: kein Studio ruft `werk` (portale · fachwerk · terrain · koerperstudio · tetrapoda zeichnen r128); `werk` setzt
    // Rad-Ecken und Tür-Flügel nicht (die Welt setzt sie im Flatten, stamm/studio-gestalt.js: der Wagen steht auf dem Rad der Ecke 0).
    //   buehne(o) → B   o: { szene, renderer (sonst baut sie ihn), sonne (sonst baut sie sie), ziel (DOM, Vorgabe body), leicht,
    //                        uhr (Vorgabe ?uhr= der Seite, sonst Mittag), sonnenWeite (m), nachVorbau() }
    //     B.steht           Zusage: das Licht der Welt liegt (Belichtung) — vorher zeichnet die Bühne nichts
    //     B.bild(K)         EIN Bild durch das EINE Tor: der Vorbau (kein Bild wartet auf einen synchronen Pipeline-Bau), die Treue
    //                       (`buehneZeichnet`: unter dem Licht der Welt allein, sonst laut), die Leine der GPU; false = nächsten Takt
    //     B.uhr(u)          die Uhr der Welt (0..1) — Streiflicht, Vormittag, Mittag; die Nacht bricht laut (welt-licht)
    //     B.nackt(an)       das Werk in der 18-%-Karte (die Form allein im Licht)
    //     B.werk(w)         Zusage der Gestalt { preset, seed, lod, ov } wie die Welt sie zeichnet (Faden + Stoff des Wirts)
    //     B.leiste(ziel)    die schmale Zeile der Bühne: Früh · Mittag · Spät · Nackt
    const ANKUNFT = /(^|\/)stamm\/dirigent-ankunft\.js$/;
    let engineZusage = null;
    const weltBasis = () => new URL("../../", HIER).href;
    const stammKlasse = () => (typeof AnazhRealm === "function" ? AnazhRealm : null); // eslint-disable-line no-undef
    // die Seite der Welt, EINMAL geholt: ihre Skript-Zeilen sind die EINE Liste (Import-Karte, Bootstrap, Kerne, Zonen des Stamms)
    let seiteZusage = null;
    const weltSeite = () =>
        seiteZusage ||
        (seiteZusage = fetch(weltBasis() + "index.html").then((a) => {
            if (!a.ok) throw new Error("DIE BÜHNE: die Seite der Welt antwortet " + a.status);
            return a.text();
        }));
    // DIE ENGINE DER WELT in einer Seite, die nur die Hülle trägt (der Werk-Blick): die Import-Karte und der Bootstrap der Welt
    // (three r184 WebGPU, window.THREE) aus der EINEN Liste — die Karte steht, bevor das erste Modul lädt
    let threeZusage = null;
    function weltThree() {
        if (wurzel.THREE) return Promise.resolve(wurzel.THREE);
        if (threeZusage) return threeZusage;
        const basis = weltBasis();
        threeZusage = weltSeite().then((html) => {
            const karte = /<script type="importmap">([\s\S]*?)<\/script>/.exec(html);
            const boot = /<script type="module" src="(vendor\/three-bootstrap\.js[^"]*)"><\/script>/.exec(html);
            if (!karte || !boot) throw new Error("DIE BÜHNE: die Seite der Welt nennt Import-Karte und Bootstrap nicht");
            const k = JSON.parse(karte[1]);
            for (const n in k.imports) k.imports[n] = new URL(k.imports[n], basis).href;
            doc.head.appendChild(Object.assign(doc.createElement("script"), { type: "importmap", textContent: JSON.stringify(k) }));
            return new Promise((ok, bruch) => {
                const s = Object.assign(doc.createElement("script"), { type: "module", src: basis + boot[1] });
                s.onload = () => (wurzel.THREE ? ok(wurzel.THREE) : bruch(new Error("DIE BÜHNE: der Bootstrap der Welt reicht THREE nicht")));
                s.onerror = () => bruch(new Error("DIE BÜHNE: der Bootstrap der Welt lädt nicht"));
                doc.head.appendChild(s);
            });
        });
        return threeZusage;
    }
    function weltEngine() {
        if (engineZusage) return engineZusage;
        const basis = weltBasis();
        engineZusage = weltSeite()
            .then((html) => {
                const zeilen = [...html.matchAll(/<script src="([^"?:]+\.js)(\?[^"]*)?"(?: defer)?><\/script>/g)];
                const liste = zeilen.map((m) => ({ pfad: m[1], v: m[2] || "" }));
                if (!liste.some((z) => ANKUNFT.test(z.pfad)) || !liste.some((z) => /^stamm\/dirigent-kern\.js$/.test(z.pfad)))
                    throw new Error("DIE BÜHNE: die Seite der Welt nennt die Zonen des Stamms nicht");
                const da = new Set([...doc.querySelectorAll("script[src]")].map((s) => new URL(s.src).pathname));
                const fehlt = liste.filter(
                    (z) => !ANKUNFT.test(z.pfad) && !/^worlds\//.test(z.pfad) && !da.has(new URL(z.pfad, basis).pathname)
                );
                // alle zugleich geholt, in der Reihe der Seite der Welt gelaufen (`async = false`)
                return Promise.all(
                    fehlt.map(
                        (z) =>
                            new Promise((ok, bruch) => {
                                const s = doc.createElement("script");
                                s.src = basis + z.pfad + z.v;
                                s.async = false;
                                s.onload = ok;
                                s.onerror = () => bruch(new Error("DIE BÜHNE: " + z.pfad + " lädt nicht"));
                                doc.head.appendChild(s);
                            })
                    )
                );
            })
            .then(() => {
                const A = stammKlasse();
                if (!A || !wurzel.__weltLicht) throw new Error("DIE BÜHNE: der Stamm der Welt steht nicht (Klasse oder Licht fehlt)");
                return A;
            });
        return engineZusage;
    }
    // DER FADEN DER BÜHNE: derselbe Start wie die Welt (`_foundryStart` der Klasse, ihr EINER Abruf und die EINE Quelle), ohne
    // Transport-Schale und Platte (ein Regler-Bau ist ein Unikat) — `bau(w)` schickt build-asset und gibt die Lieferung roh
    function weltFaden(A) {
        const karte = doc.querySelector('script[type="importmap"]');
        const module = {};
        for (const [n, u] of Object.entries(karte ? JSON.parse(karte.textContent).imports || {} : {}))
            module[n] = new URL(u, wurzel.location.href).href;
        const start = { v: "?v=" + A.VERSION, base: weltBasis(), module };
        const fn = (m) => {
            const q = m.toString();
            return q.startsWith("async ") ? "async function " + q.slice(6) : "function " + q;
        };
        const blob = (text) => URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
        const quelle = new Worker(blob(`(${fn(A._quelleFaden)})(${fn(A._foundryQuelle)}, ${fn(A._modulImporte)});`), {
            name: "quelle",
        });
        const faden = new Worker(
            blob(
                `(${fn(A._foundryStart)})(${JSON.stringify(start)}, function () {}, null, null, ${fn(A._foundryHole)}, ${fn(A._modulImporte)});`
            ),
            { name: "buch" }
        );
        const kanal = new MessageChannel();
        faden.postMessage({ type: "quelle-port", port: kanal.port2 }, [kanal.port2]);
        quelle.postMessage({ nr: 1, type: "foundry", b: start, ports: [kanal.port1] }, [kanal.port1]);
        const offen = new Map();
        let [nr, bereit, bruch] = [1];
        const steht = new Promise((ok, nein) => ([bereit, bruch] = [ok, nein]));
        const faellt = (wer) => (ev) => {
            const e = new Error("DIE BÜHNE: " + wer + " fällt — " + ((ev && (ev.message || (ev.data && ev.data.fehler))) || "Boot-Fehler"));
            bruch(e);
            for (const p of offen.values()) p.nein(e);
            offen.clear();
        };
        quelle.onmessage = (ev) => ev.data && ev.data.fehler && faellt("die Quelle des Fadens")(ev);
        quelle.onerror = faellt("die Quelle des Fadens");
        faden.onerror = faellt("der Foundry-Faden");
        faden.onmessage = (ev) => {
            const m = ev.data;
            if (!m || typeof m !== "object") return;
            if (m.type === "ready" && m.world === "terrain") bereit();
            const p = offen.get(m.reqId);
            if (p) offen.delete(m.reqId), p.ok(m);
        };
        return {
            bau: (w) =>
                steht.then(
                    () =>
                        new Promise((ok, nein) => {
                            const reqId = "b" + nr++;
                            offen.set(reqId, { ok, nein });
                            faden.postMessage({ reqId, type: "build-asset", presetId: w.preset, seed: w.seed, lod: w.lod | 0, ov: w.ov || null });
                        })
                ),
        };
    }
    function buehne(o) {
        const T = wurzel.THREE;
        const szene = o.szene;
        const frage = new URLSearchParams(wurzel.location.search);
        const R = o.renderer || new T.WebGPURenderer({ antialias: !o.leicht });
        if (!o.renderer) {
            R.setSize(wurzel.innerWidth, wurzel.innerHeight);
            R.setPixelRatio(Math.min(wurzel.devicePixelRatio, 2));
            R.shadowMap.enabled = true;
            R.shadowMap.type = T.PCFShadowMap;
            (o.ziel || doc.body).appendChild(R.domElement);
        }
        // DIE SONNE DER WELT: EIN Richtlicht, Farbe, Stärke und Richtung setzt das Licht der Welt; es wirft den Schatten
        let sonne = o.sonne;
        if (!sonne) {
            sonne = new T.DirectionalLight();
            sonne.castShadow = true;
            sonne.shadow.mapSize.set(2048, 2048);
            sonne.shadow.bias = -0.0002;
            szene.add(sonne, sonne.target);
        }
        const B = { renderer: R, szene, sonne, welt: null, bildN: 0, steht: null, wirt: null };
        // die Uhr: eine Zahl 0..1 oder eine Stunde der Bühne beim Namen (`stunden`: frueh · mittag · spaet)
        let uhr = o.uhr != null ? o.uhr : frage.has("uhr") ? frage.get("uhr") : 0.5;
        let himmel = null;
        const zielen = () => {
            const weit = o.sonnenWeite || sonne.position.distanceTo(sonne.target.position) || 20;
            sonne.position.copy(sonne.target.position).addScaledVector(B.welt.richtung, weit);
        };
        // die Sonne über einem Punkt: ihr Ziel dort (der Schatten folgt dem Werk)
        B.sonneUeber = (x, y, z) => {
            sonne.target.position.set(x, y, z);
            sonne.target.updateMatrixWorld();
            if (B.welt) zielen();
        };
        // DAS CPU-RASTER ZEICHNET OHNE VIELFACH-ABTASTUNG (swiftshader, llvmpipe: wie three im Kompatibilitäts-Modus selbst)
        const software = (i) =>
            !!i && /swiftshader|llvmpipe|lavapipe|software|subzero/i.test([i.vendor, i.architecture, i.device, i.description].join(" "));
        const lichtAn = () => {
            const st = B.stunden();
            uhr = uhr in st ? st[uhr] : +uhr;
            if (!(uhr >= 0 && uhr <= 1)) throw new Error("DIE BÜHNE: die Uhr ist eine Zahl 0..1 oder frueh · mittag · spaet");
            B.welt = wurzel.__weltLicht.buehne({ renderer: R, szene, sonne, himmel, uhr });
            zielen();
            sonne.shadow.needsUpdate = true;
            return B.welt.steht.then(() => B);
        };
        // das Licht braucht nur den Baustein (welt-licht.js): trägt ihn die Seite, lädt die Bühne den Stamm erst mit dem Werk
        B.steht = (wurzel.__weltLicht ? Promise.resolve() : weltEngine())
            .then(() => R.init())
            .then(() => {
                const d = R.backend && R.backend.device;
                if (d && software(d.adapterInfo)) R._samples = 0;
                return lichtAn();
            });
        // DER HIMMEL DER HEIMAT: die Welt reicht beim Betreten ihren Himmel am Tor; kommt er vor dem Licht, nimmt es ihn beim Bau
        B.himmel = (z) => {
            himmel = z;
            if (B.welt) B.welt.himmelSetzen(z), zielen();
        };
        // DIE UHR DER WELT: das Licht entsteht an der neuen Stunde neu (Tafeln, Umgebung, Sonne, Belichtung); bis es liegt,
        // zeichnet die Bühne nichts. Der Knoten der Umgebung ist neu — jedes Programm baut der Vorbau neu.
        B.uhrIst = () => uhr;
        // Eine Stunde, die das Licht der Welt nicht trägt (die Nacht), bricht laut beim Rufer; die Bühne behält ihr Licht und ihre Uhr.
        B.uhr = (u) => {
            const wechsel = B.steht.then(() => {
                const [alt, vor] = [B.welt, uhr];
                uhr = u;
                let z;
                try {
                    z = lichtAn();
                } catch (e) {
                    uhr = vor;
                    throw e;
                }
                bauObjekt = new WeakMap();
                if (alt && alt.abschied) alt.abschied();
                return z;
            });
            B.steht = wechsel.catch(() => B);
            return wechsel;
        };
        // DIE STUNDEN DER BÜHNE: der Tag der Welt (die Tag-Achse ohne Ersatz-Lichter der Nacht) und in ihm das Streiflicht — die
        // erste und die letzte Stunde, in der die Sonne `hoehe` Grad über dem Horizont steht
        B.stunden = (hoehe) => {
            const L = wurzel.__weltLicht;
            const tag = [];
            for (let i = 0; i <= 400; i++) {
                const s = L.sonnenRichtung(L.sonnenWinkel(i / 400));
                const a = L.tagAchse(s[1]);
                if (a.nacht === 0 && a.daemmerung === 1 && (Math.asin(s[1]) * 180) / Math.PI >= (hoehe == null ? 15 : hoehe)) tag.push(i / 400);
            }
            return { frueh: tag[0], mittag: 0.5, spaet: tag[tag.length - 1] };
        };
        // NACKT: jedes Mesh in der 18-%-Karte, matt — die Form allein im Licht der Welt
        // (je Mesh, nie als Stoff der ganzen Szene: Linien, Schilder und Maße eines Studios behalten ihren Stoff; ein Teil, das
        // ein Studio nach dem Schalten baut, kleidet das nächste Bild)
        let [karte, nacktAn] = [null, false];
        const vorNackt = new WeakMap();
        const kleiden = () =>
            szene.traverse((x) => {
                if (!x.isMesh || !x.material || Array.isArray(x.material)) return;
                if (nacktAn && x.material !== karte) vorNackt.set(x, x.material), (x.material = karte);
                else if (!nacktAn && x.material === karte && vorNackt.has(x)) x.material = vorNackt.get(x);
            });
        B.nackt = (an) => {
            karte = karte || new T.MeshStandardMaterial({ color: new T.Color().setRGB(0.18, 0.18, 0.18, T.LinearSRGBColorSpace), roughness: 1, metalness: 0 });
            nacktAn = !!an;
            kleiden();
            sonne.shadow.needsUpdate = true;
        };
        B.istNackt = () => nacktAn;
        // ── DER VORBAU (w13-buehne-async, aus der Garage gehoben): kein Bild wartet auf einen synchronen Pipeline-Bau. Ein sichtbares
        // Objekt, das mit seinem Stoff (samt Version) und seiner Gestalt noch durch keinen Vorbau ging, hält das Bild an; EIN Bild
        // des Werks in ein verborgenes Ziel (1×1) baut jede Pipeline dieses Bilds asynchron in EINER Liste (derselbe Render-Kontext
        // wie die Leinwand, darum trifft das nächste Bild jede im Cache). Der Vorbau zeichnet NICHTS (`isReady` nein: kein Submit im
        // offenen Fehler-Bereich von r184) und wartet auf die Pipelines des Geräts selbst (`createRenderPipelineAsync`), nie auf
        // das Vendor-Versprechen (auf swiftshader löst es nie) — eine Absage bricht als Ablehnung laut.
        let bau = null;
        let bauObjekt = new WeakMap();
        const zeichnet = (x) => x.isMesh || x.isLine || x.isPoints || x.isSprite;
        const werkNeu = () => {
            let neu = false;
            szene.traverseVisible((x) => {
                if (neu || !zeichnet(x)) return;
                const a = bauObjekt.get(x);
                neu = !a || a[1] !== x.material || a[2] !== x.material.version || a[3] !== x.geometry;
            });
            return neu;
        };
        let [vorbauZiel, grundSteht] = [null, false];
        async function vorbau(K) {
            const P = R._pipelines;
            const eigen = P.getForRender;
            const [liste, roh, werk] = [[], [], []];
            const [aus, ziel, dev] = [R.getOutputRenderTarget(), R.getRenderTarget(), R.backend.device];
            const baut = dev.createRenderPipelineAsync;
            const eigenB = Object.getOwnPropertyDescriptor(dev, "createRenderPipelineAsync");
            vorbauZiel = vorbauZiel || new T.RenderTarget(1, 1);
            szene.traverseVisible((x) => zeichnet(x) && werk.push([x, x.material, x.material.version, x.geometry]));
            P.getForRender = function (ro) {
                return eigen.call(this, ro, liste);
            };
            P.isReady = () => false;
            dev.createRenderPipelineAsync = function (d) {
                const p = baut.call(this, d);
                roh.push(p);
                return p;
            };
            // DER HIMMEL GEHT NICHT DURCH DEN VORBAU: das Mesh des Grunds (r184 `Background`, je Szene eines) blieb schwarz, wenn sein
            // erstes Bild der Vorbau war — GEMESSEN (13.11., swiftshader, ein Pixel des Himmels über einem Würfel): ohne Vorbau
            // [172, 177, 185], mit Vorbau [0, 0, 0] in jedem Bild danach; die Garage stand so seit w13-buehne-async vor schwarzem
            // Himmel (Radeon 900c28e6, garage-buehne.png der Station studios.K4). Der ERSTE Vorbau zeichnet die Szene ohne Grund, das
            // erste Bild baut sein EINES Programm selbst; danach steht der Grund und geht mit (ein Wechsel des Grunds je Vorbau
            // baute sein Programm je Griff neu: garage Neubau 254 → 1546 ms auf swiftshader).
            const grund = szene.background;
            const ohneGrund = !grundSteht;
            grundSteht = true;
            try {
                try {
                    if (ohneGrund) szene.background = null;
                    R.setOutputRenderTarget(vorbauZiel);
                    R.render(szene, K);
                } finally {
                    szene.background = grund;
                    P.getForRender = eigen;
                    delete P.isReady;
                    if (eigenB) Object.defineProperty(dev, "createRenderPipelineAsync", eigenB);
                    else delete dev.createRenderPipelineAsync;
                    R.setOutputRenderTarget(aus);
                    R.setRenderTarget(ziel);
                }
                await Promise.all(roh);
            } finally {
                bau = null;
            }
            for (const a of werk) bauObjekt.set(a[0], a);
            sonne.shadow.needsUpdate = true;
            if (o.nachVorbau) o.nachVorbau();
        }
        const bauWenn = (K) => {
            if (!bau && B.welt && werkNeu()) bau = vorbau(K);
            return bau;
        };
        // jeder Leser, der ohne den Loop zeichnet, wartet hier, bis kein Vorbau mehr ansteht
        B.werkSteht = async (K) => {
            K.updateMatrixWorld();
            while (bauWenn(K)) await bau;
        };
        // darf dieses Bild gezeichnet werden? (der Vorbau steht, das Licht liegt, die Bühne ist treu, die Leine ist frei)
        B.darf = (K) => {
            if (nacktAn) kleiden();
            return !bauWenn(K) && wurzel.__weltLicht.buehneZeichnet(B.welt, szene, R);
        };
        B.bild = (K) => {
            if (!B.darf(K)) return false;
            R.render(szene, K);
            B.bildN++;
            return true;
        };
        // ── DAS WERK DER WELT: der Stamm ohne Ankunft, EIN Wirt je Bühne, EIN Faden je Seite ──
        let faden = null;
        B.engine = () =>
            weltEngine().then((A) => {
                if (!B.wirt) {
                    B.wirt = new A();
                    Object.assign(B.wirt.state, { renderer: R, scene: szene, rendererReady: true });
                }
                faden = faden || weltFaden(A);
                return B.wirt;
            });
        B.werk = (w) =>
            B.engine()
                .then(() => faden.bau(w))
                .then((r) => {
                    const g = r && r.meshes && r.meshes.length ? B.wirt._foundryBuildGroup(r.meshes, { lod: w.lod | 0, preset: null }) : null;
                    if (!g) throw new Error("DIE BÜHNE: der Faden liefert kein Werk (" + w.preset + " L" + (w.lod | 0) + ")");
                    return g;
                });
        // die Gestalt eines Werks geht (ihre Stoffe gehören dem Wirt: geteilt, nie entsorgt)
        B.werkFort = (g) => g && g.traverse((x) => x.isMesh && x.geometry && x.geometry.dispose());
        // DIE ZEILE DER BÜHNE: Früh · Mittag · Spät · Nackt — dieselbe in jedem Studio
        B.leiste = (ziel, beiWechsel) => {
            const z = el("div", "h-sitzung h-buehne");
            const knoepfe = {};
            const marke = () => {
                const st = B.stunden();
                for (const id in knoepfe) knoepfe[id].style.borderColor = id === "nackt" ? (B.istNackt() ? "var(--h-akzent)" : "") : Math.abs(st[id] - uhr) < 1e-6 ? "var(--h-akzent)" : "";
            };
            const knopf = (id, text, titel, tat) => {
                const k = (knoepfe[id] = el("button", "h-knopf", text));
                k.title = titel;
                k.dataset.buehne = id;
                k.onclick = () => Promise.resolve(tat()).then(() => (marke(), beiWechsel && beiWechsel()));
                z.appendChild(k);
            };
            knopf("frueh", "Früh", "Streiflicht des Morgens (die Sonne 15° über dem Horizont)", () => B.uhr(B.stunden().frueh));
            knopf("mittag", "Mittag", "der Mittag der Welt", () => B.uhr(0.5));
            knopf("spaet", "Spät", "Streiflicht des Abends (die Sonne 15° über dem Horizont)", () => B.uhr(B.stunden().spaet));
            knopf("nackt", "Nackt", "die Form allein: jedes Teil in der 18-%-Karte", () => B.nackt(!B.istNackt()));
            ziel.appendChild(z);
            B.steht.then(marke);
            return z;
        };
        if (frage.has("nackt")) B.nackt(true);
        wurzel.AnazhHuelle.buehneDerSeite = B;
        return B;
    }

    wurzel.AnazhHuelle = {
        buehne: buehne,
        weltThree: weltThree,
        matrix: matrix,
        regler: regler,
        sitzung: sitzung,
        kosten: kosten,
        zaehle: zaehle,
        zeileUrteil: zeileUrteil,
        bankRunde: bankRunde,
        bruecke: bruecke,
        gang: function () {
            return gang;
        },
        reisender: function () {
            return reisender;
        },
        werkMass: werkMass,
        werkUrteil: werkUrteil,
        panorama: panorama,
        panoramaBild: panoramaBild,
        toast: toast,
        zeiger: zeiger,
        zufall: zufall,
        knopfMitText: knopfMitText,
        kugel: kugel,
    };
})(typeof window !== "undefined" ? window : globalThis);

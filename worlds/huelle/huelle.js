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
 *   kosten(ziel, opt)          die Kosten-Leiste je LOD-Stufe: Dreiecke · Stoffe · Schatten gegen die Budget-Zeile des
 *                              Kerns, der Faktor zum Band; gemessen an der Welt-Gestalt (`bauen(stufe)` = buildInstance
 *                              des Kerns) oder an der Labor-Gestalt (`messen(obj, stufe)`), meshfrei benannt; die
 *                              Welt-Werkstatt setzt die am Foundry-Werk gezählten Kosten (`setzen(stufe, kosten)`).
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
 *   toast(text, ms) · zufall(seed) · knopfMitText(wurzel, wort)
 *
 * Die Hülle ändert keine Bau-Bytes: sie reicht Werte durch, die Gesetzbücher bauen (gate:asset-contract unverändert).
 * Die Wand: gate:studio-huelle (scripts/diag-studio-huelle.cjs) — kein Hand-Regler, keine Brücken-Kopie außerhalb.
 */
(function (wurzel) {
    "use strict";
    if (wurzel.AnazhHuelle) return;
    var doc = wurzel.document;

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
    //      (buildInstance des Kerns) · titel · quelle (Text: woran gemessen) · meshfrei (Text: keine Gestalt, Vertrag §8)
    function zaehle(obj) {
        var tris = 0;
        var stoffe = {};
        var nStoffe = 0;
        var meshes = 0;
        var werfer = 0;
        if (!obj || !obj.traverse) return { tris: 0, stoffe: 0, meshes: 0, werfer: 0 };
        obj.traverse(function (o) {
            if (!o.isMesh || !o.geometry) return;
            var vis = true;
            for (var p = o; p; p = p.parent) if (p.visible === false) vis = false;
            if (!vis) return;
            var g = o.geometry;
            var n = g.index ? g.index.count / 3 : g.attributes && g.attributes.position ? g.attributes.position.count / 3 : 0;
            if (o.isInstancedMesh) n *= o.count;
            tris += n;
            meshes++;
            if (o.castShadow) werfer++;
            (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
                if (m && !stoffe[m.uuid]) {
                    stoffe[m.uuid] = 1;
                    nStoffe++;
                }
            });
        });
        return { tris: Math.round(tris), stoffe: nStoffe, meshes: meshes, werfer: werfer };
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
            box.appendChild(el("div", "h-kosten-zeile pass", "meshfrei · 0 Dreiecke"));
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
            zeilen[s] = { z: z, txt: txt, balken: balken, band: bandMarke, gemessen: null };
        });
        box.appendChild(quelle);
        if (ziel) ziel.appendChild(box);
        var stand = {};
        function zeigen(s, c) {
            var zz = zeilen[s];
            var b = budget[s];
            if (!zz || !b) return;
            stand[s] = c;
            var deckel = b.tris || 1;
            var anteil = Math.min(1, c.tris / deckel);
            zz.balken.style.width = (anteil * 100).toFixed(1) + "%";
            if (b.band) {
                zz.band.style.left = ((b.band / deckel) * 100).toFixed(1) + "%";
                zz.band.style.display = "";
            } else zz.band.style.display = "none";
            var klasse = c.tris > deckel ? "fail" : b.band && c.tris > b.band ? "warn" : "pass";
            zz.z.className = "h-kosten-zeile " + klasse;
            var t = c.tris.toLocaleString("de-DE") + " / " + deckel.toLocaleString("de-DE") + " △";
            if (b.band) t += " · Band ×" + (c.tris / b.band).toFixed(2);
            t += " · " + c.stoffe + " Stoffe / " + (b.draws || "–") + " Befehle";
            if (typeof b.schatten === "number") t += " · Wurf L" + b.schatten;
            zz.txt.textContent = t;
            zz.z.title =
                "Stufe " + s + ": " + c.meshes + " Meshes (" + c.werfer + " werfen im Labor) · Budget-Zeile tris " + deckel + (b.band ? " · band " + b.band : "") + " · draws " + b.draws + " · Schatten-Stufe " + b.schatten;
        }
        var uhr = null;
        var lauf = 0;
        var K = {
            el: box,
            stand: function () {
                return stand;
            },
            // die Labor-Gestalt der Stufe s direkt zählen (was der Schirm zeigt)
            messen: function (obj, s) {
                zeigen(s == null ? stufen[0] : s, zaehle(obj));
            },
            // gezählte Kosten der Stufe s setzen ({ tris, stoffe, meshes, werfer }) — die Welt-Werkstatt zählt das Werk der Foundry
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
                    var naechste = function () {
                        if (meinLauf !== lauf || i >= stufen.length) return;
                        var s = stufen[i++];
                        try {
                            zeigen(s, zaehle(opt.bauen(s)));
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

    // ── DIE PORTAL-BRÜCKE + DER DSL-ADAPTER (skeleton-Norm, EINE Kopie) ──
    // opt: welt · label · dsl (Wörter) | manifest (true = ./manifest.json lesen und melden) · wort(w, args) → die Tat ·
    //      enter(avatar, msg) · esc(ev) → false behält Esc in der Welt · sonst(msg) jede andere Nachricht der Heimat (das
    //      terrain-Labor reicht so die Asset-Kanäle an die Foundry-Brücke, foundryKanal) · panorama() → { THREE, renderer,
    //      scene, kamera | ort, verbergen } oder { bild(ctx, w, h) } (die flache Welt), auch als Versprechen — DER EXPORT DES
    //      ZIEL-BILDS (D8): fragt die Heimat `{ type: "panorama-bitte" }`, rendert die Hülle das Panorama der Welt (`panorama`
    //      bzw. `panoramaBild`, gelesen) und schickt `{ type: "panorama", world, w, h, daten }` (Halbfloat-Texel, übertragen);
    //      eine Welt ohne panorama() antwortet laut mit `fehler` · werk() → { kind, preset, seed, ov } das Werk der Bühne (Art und
    //      Rezept des Kerns, der Same des Baus, die Werte seiner Regler-Zeilen aus PARAMS_BY_KIND, beim Körper dazu die Wahlen)
    //      oder null (die Bühne trägt kein Werk des Vertrags) · werkOrt das Element, das den Knopf trägt (sonst schwebt er)
    function bruecke(opt) {
        opt = opt || {};
        var eltern = wurzel.parent && wurzel.parent !== wurzel ? wurzel.parent : null;
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

    wurzel.AnazhHuelle = {
        regler: regler,
        sitzung: sitzung,
        kosten: kosten,
        zaehle: zaehle,
        bruecke: bruecke,
        gang: function () {
            return gang;
        },
        reisender: function () {
            return reisender;
        },
        panorama: panorama,
        panoramaBild: panoramaBild,
        toast: toast,
        zufall: zufall,
        knopfMitText: knopfMitText,
    };
})(typeof window !== "undefined" ? window : globalThis);

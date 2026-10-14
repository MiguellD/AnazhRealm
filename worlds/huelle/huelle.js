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
 *                              `schritt(fn)` macht aus jeder Tat (Preset, Kultur, Würfel) EINEN Rückgängig-Schritt.
 *   kosten(ziel, opt)          die Kosten-Leiste je LOD-Stufe: Dreiecke · Stoffe · Schatten gegen die Budget-Zeile des
 *                              Kerns, der Faktor zum Band; gemessen an der Welt-Gestalt (`bauen(stufe)` = buildInstance
 *                              des Kerns) oder an der Labor-Gestalt (`messen(obj, stufe)`), meshfrei benannt.
 *   bruecke(opt)               die Portal-Brücke + der DSL-Adapter (skeleton-Norm): ready EINMAL (kein Echo), nur der
 *                              Eltern-Rahmen spricht, `["chain", …]` rekursiv, das Einzelwort der Heimat (["w", …args])
 *                              ganz — nie op[0] je Element (aus "gt" wurde "g"). Esc bringt heim, außer die Welt behält ihn.
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
            var ids = Object.keys(offen);
            offen = {};
            if (!ids.length) return;
            var a = vorher;
            vorher = null;
            var bau = ids.some(function (id) {
                return !(nachId[id] && nachId[id].dyn);
            });
            // erst die Folge (ein Meta-Gesetz leitet weitere Achsen ab), dann der Schritt: EIN Rückgängig für Zug + Folge
            if (opt.nachRuhe) opt.nachRuhe(ids, bau);
            if (sitz && a) {
                var d = diffVon(a, sitz.schnapp());
                if (d) sitz.merke(d);
            }
        }
        function planen() {
            if (ruheMs > 0) {
                clearTimeout(uhr);
                uhr = setTimeout(flush, ruheMs);
            } else if (!bild) {
                bild = wurzel.requestAnimationFrame ? wurzel.requestAnimationFrame(flush) : setTimeout(flush, 16);
            }
        }
        function eingabe(z, v) {
            if (!vorher) vorher = sitz ? sitz.schnapp() : schnapp(werte);
            werte[z.id] = v;
            anzeigen(z);
            if (opt.bei) opt.bei(z.id, v, z);
            offen[z.id] = 1;
            planen();
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
            inp.addEventListener(schalter ? "change" : "input", function () {
                eingabe(z, schalter ? (inp.checked ? 1 : 0) : +inp.value);
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

    // ── DIE SITZUNG — Seed · Sperre · Undo/Redo ──
    // opt: werte (P) · anwenden(ids, quelle) nach Undo/Redo/Würfel · zustand() / zustandSetzen(z) für Nicht-Zahlen
    //      (Preset, Kultur …) · seed · beiSeed(seed) · sperren (Schloss je Achse) · tasten (false = keine Tasten)
    function sitzung(opt) {
        opt = opt || {};
        var werte = opt.werte || {};
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
                malen();
            },
            // EINE Tat = EIN Schritt: Werte (und Zustand) vorher ↔ nachher.
            schritt: function (tat) {
                var a = schnapp(werte, opt.zustand);
                var r = tat();
                var d = diffVon(a, schnapp(werte, opt.zustand));
                if (d) S.merke(d);
                return r;
            },
            zurueck: function () {
                if (!zeiger) return toast("Nichts mehr rückgängig zu machen."), false;
                anwendenDiff(stapel[--zeiger], 0, "zurueck");
                return true;
            },
            vor: function () {
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
                anzeige = { z: z, v: v, n: n, seed: null };
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
        function malen() {
            if (!anzeige) return;
            anzeige.z.disabled = !zeiger;
            anzeige.v.disabled = zeiger >= stapel.length;
            anzeige.n.textContent = zeiger + "/" + stapel.length;
        }
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
            toast((quelle === "zurueck" ? "↶ rückgängig · " : "↷ wiederholt · ") + zeiger + "/" + stapel.length, 1200);
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

    // ── DIE PORTAL-BRÜCKE + DER DSL-ADAPTER (skeleton-Norm, EINE Kopie) ──
    // opt: welt · label · dsl (Wörter) | manifest (true = ./manifest.json lesen und melden) · wort(w, args) → die Tat ·
    //      enter(avatar, msg) · esc(ev) → false behält Esc in der Welt · sonst(msg) jede andere Nachricht der Heimat (das
    //      terrain-Labor reicht so die Asset-Kanäle an die Foundry-Brücke, foundryKanal)
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
        var B = {
            post: post,
            wirke: wirke,
            ereignis: function (text) {
                post({ type: "event", text: String(text) });
            },
        };
        if (!eltern) return B;
        wurzel.addEventListener("message", function (ev) {
            if (ev.source !== eltern) return;
            var m = ev.data;
            if (!m || typeof m !== "object") return;
            if (m.type === "enter") {
                if (opt.enter) opt.enter(m.avatar && typeof m.avatar === "object" ? m.avatar : {}, m);
            } else if (m.type === "dsl") wirke(m.program);
            else if (opt.sonst) opt.sonst(m);
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
        toast: toast,
        zufall: zufall,
        knopfMitText: knopfMitText,
    };
})(typeof window !== "undefined" ? window : globalThis);

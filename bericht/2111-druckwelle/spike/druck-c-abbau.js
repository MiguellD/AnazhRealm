const st = r.state, D = window.__druckProbe;
// der Abbau der Probe: jedes Werk, das sie setzte oder ihr Bruch gebar, verlässt die Welt durch die EINE Tür, ihre Pläne fallen aus
// dem Buch; Speicher-Wunsch und Journal kehren zurück. Kein fremdes Werk wird berührt (Lauf 1 räumte nach „nicht im Bestand vor dem
// Aufbau" — der Bestand war im Boot noch leer).
if (!D) return { fehler: "kein Aufbau" };
let weg = 0;
const fehler = [];
for (const e of st.architectures.slice())
    if (D.eigen.has(e)) {
        try {
            r.removeArchitecture(e, { still: true });
            weg++;
        } catch (err) {
            fehler.push(e.type + ": " + ((err && err.message) || err));
        }
    }
let plaene = 0;
for (const n of Object.keys(st.blueprints))
    if (!D.plaeneVor.has(n) && (n.startsWith("probe_fenster") || n.startsWith("truemmer_"))) {
        delete st.blueprints[n];
        plaene++;
    }
// die Gegenprobe des Abbaus: welches Werk, das VOR dem Aufbau stand, steht nicht mehr (die Welt strömt während der Probe weiter)
const jetzt = new Set(st.architectures);
const fremdWeg = [...D.vor].filter((e) => !jetzt.has(e)).map((e) => e.type);
const fremdNeu = st.architectures.filter((e) => !D.vor.has(e)).map((e) => e.type);
delete r._scheduleEditSave;
delete r.journalAppend;
delete window.__druckProbe;
return { entfernt: weg, plaene, werkeJetzt: st.architectures.length, werkeVor: D.werkeVor, fremdWeg, fremdNeu, fehler };

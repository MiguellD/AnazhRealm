_ankunftsBild() {
        const st = this.state;
        if (st._weltbildDa) return true;
        const fehlt = this._weltbildFehlt();
        if (fehlt.length) {
            const jetzt = performance.now();
            const sig = fehlt.join(" · ");
            if (st._weltbildErsteFrage == null) st._weltbildErsteFrage = jetzt;
            if (st._weltbildLuecke !== sig) {
                st._weltbildLuecke = sig;
                st._weltbildLueckeSeit = jetzt;
            }
            // DER DECKEL (Gegenprüfung Runde 2): eine Lücke, deren Zahl ständig flackert, setzte die Ruhe-Uhr je Wechsel neu
            // und hielt den Ladeschirm ohne Grenze — nach WELTBILD_DECKEL_MS ab der ersten Frage weicht er laut wie bei Ruhe.
            const gedeckelt = jetzt - st._weltbildErsteFrage >= AnazhRealm.WELTBILD_DECKEL_MS;
            if (!st.playerMesh || (!gedeckelt && jetzt - st._weltbildLueckeSeit < AnazhRealm.WELTBILD_STILL_MS)) {
                this._ladeschirmStand(sig);
                return false;
            }
            this.log(
                gedeckelt
                    ? `Das erste Weltbild steht ohne: ${sig} — der Deckel von ${AnazhRealm.WELTBILD_DECKEL_MS} ms ist erreicht.`
                    : `Das erste Weltbild steht ohne: ${sig} — die Arbeit ruhte ${AnazhRealm.WELTBILD_STILL_MS} ms.`,
                "WARN"
            );
        }
        st._weltbildDa = performance.now();
        this._ladeschirmWeg();
        return true;
    }
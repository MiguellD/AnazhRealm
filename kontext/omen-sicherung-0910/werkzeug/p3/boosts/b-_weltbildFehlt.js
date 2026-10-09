_weltbildFehlt() {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm) return ["die Welt entsteht"];
        const out = [];
        const ring = this._builtRingRadius();
        const ringSoll = AnazhRealm.RING_EXIST_FLOOR;
        if (!(ring != null && ring >= ringSoll))
            out.push(`der Boden wächst (Ring ${ring != null && ring >= 0 ? ring + 1 : 0} von ${ringSoll + 1})`);
        if (!this._foundryEnabled()) return out;
        const f = this._foundry;
        if (!f || !f.ready || !f.recipes) {
            out.push("das Buch der Studios öffnet sich");
            return out;
        }
        if (f._prefetching) out.push("die Werkstatt backt vor");
        const p = pm.position;
        const R = Number.isFinite(st.architectureCullingRadius) ? st.architectureCullingRadius : 150;
        let ungebaut = 0;
        for (const e of st.architectures || []) {
            if (!e || !e.position) continue;
            const dx = e.position.x - p.x;
            const dz = e.position.z - p.z;
            if (dx * dx + dz * dz <= R * R && !this._archIsRendered(e)) ungebaut++;
        }
        if (ungebaut) out.push(`${ungebaut} Bäume und Bauten wachsen`);
        const SC = AnazhRealm.SCATTER;
        const regionen = st.scatterRegions;
        if (SC && regionen && !(st.atmosphere && st.atmosphere.gpuScatter === false)) {
            const rx0 = Math.floor(p.x / SC.regionM);
            const rz0 = Math.floor(p.z / SC.regionM);
            let warten = 0;
            for (let dz = -SC.ringRegions; dz <= SC.ringRegions; dz++)
                for (let dx = -SC.ringRegions; dx <= SC.ringRegions; dx++) {
                    const rx = rx0 + dx;
                    const rz = rz0 + dz;
                    if (!this._streuRegionInReichweite(rx, rz, p)) continue;
                    const reg = regionen.get(`${rx},${rz}`);
                    if (!reg || reg._deferredFoundry || reg._cont) warten++;
                }
            if (warten) out.push(`${warten} Wald-Stücke warten auf ihre Gestalt`);
        }
        const karten =
            (this._impostorBakeQueue ? this._impostorBakeQueue.length : 0) + (this._impostorBakePending ? 1 : 0);
        if (karten) out.push(`${karten} ferne Bäume werden gemalt`);
        return out;
    }
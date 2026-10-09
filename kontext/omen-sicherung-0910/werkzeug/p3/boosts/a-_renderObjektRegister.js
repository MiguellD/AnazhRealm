_renderObjektRegister(renderer) {
        const objs = renderer && renderer._objects;
        if (!objs || objs.__anazhRegister || typeof objs.createRenderObject !== "function") return;
        objs.__anazhRegister = true;
        const roh = objs.createRenderObject;
        objs.createRenderObject = function (...a) {
            const ro = roh.apply(this, a);
            const o = ro && ro.object;
            if (!o) return ro;
            const liste = o.__renderObjekte || (o.__renderObjekte = []);
            liste.push(ro);
            // r184 löst ein Render-Objekt selbst (ein neuer Schlüssel, ein entsorgter Stoff): es verlässt das Register.
            const roDispose = ro.onDispose;
            ro.onDispose = () => {
                const l = o.__renderObjekte;
                const i = l ? l.indexOf(ro) : -1;
                if (i >= 0) l.splice(i, 1);
                roDispose();
            };
            return ro;
        };
        // DER GEOMETRIE-HALTER FÄLLT: r184 hängt an jede gezeichnete Geometrie EINEN dispose-Hörer, der das ERSTE Render-
        // Objekt einfängt (`initGeometry`, gehalten in der Map `_geometryDisposeListeners`) — eine Fassade, die nie entsorgt
        // wird, hielt so ihre erste Senke samt Render-Objekt, Knoten-Zustand und Uniform-Puffern für immer (Heap-Halter-
        // Suche 06.10.: zehn abgeschiedene Gruppen, alle zehn über diesen Hörer am Leben). Und sein Entsorgen löschte die
        // Attribute DIESES Render-Objekts — auch Basis-Attribute, die eine Fassade mit lebenden Gruppen teilt. Die Residenz
        // trägt der Kehraus (`_gpuKehraus`: was kein Objekt des Graphen zeichnet, verlässt die GPU); der Hörer fällt, nur
        // die Geometrie-Zählung des Infos bleibt ehrlich.
        const geos = renderer._geometries;
        if (geos && typeof geos.initGeometry === "function" && geos._geometryDisposeListeners) {
            const init = geos.initGeometry;
            geos.initGeometry = function (ro) {
                init.call(this, ro);
                const g = ro.geometry;
                const hoerer = this._geometryDisposeListeners.get(g);
                if (!hoerer) return;
                g.removeEventListener("dispose", hoerer);
                this._geometryDisposeListeners.delete(g);
                const info = this.info;
                const zaehlung = () => {
                    info.memory.geometries--;
                    g.removeEventListener("dispose", zaehlung);
                };
                g.addEventListener("dispose", zaehlung);
            };
        }
    }
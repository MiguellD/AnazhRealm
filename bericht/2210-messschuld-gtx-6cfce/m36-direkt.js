// M36-Zerlegung direkt (Seiten-Code, kein Loop): die Zelle −4,−6 mit nH 300 bereitet sich vor (Export + Ort-Wahl, `_dorfBereiten`), dann
// erwacht sie EINMAL (`_autoSettlementSpawnCell`); jedes synchrone Glied des Erwachens je Aufruf gestoppt — dieselbe Arbeit, die im Spiel in
// das erste Bild nach dem Erwachen fällt (dort 460–469 ms).
const info = Object.assign({}, r._autoSettlementCellInfo(-4, -6), { nH: window.__nH || 300 });
await r._dorfBereiten(info.key, info);
const P = Object.getPrototypeOf(r), sum = {}, glieder = ["_ortPlanSetzen", "_dorfZug", "_spawnSettlementErlebnis", "_stlWegeBuild", "_bewohnerMelden", "_dorfLaterneSetzen", "_scheduleEditSave", "_spawnSettlementSlot", "_dorfZugSchritt", "_ortPlanWarten", "_erdbauWirkt"];
for (const g of glieder)
    if (typeof P[g] === "function")
        r[g] = function (...a) {
            const t0 = performance.now(), v = P[g].apply(this, a);
            sum[g] = sum[g] || { n: 0, ms: 0 };
            sum[g].n++;
            sum[g].ms = +(sum[g].ms + performance.now() - t0).toFixed(1);
            return v;
        };
const t0 = performance.now();
const v2 = await r._autoSettlementSpawnCell(-4, -6, info);
const gesamt = +(performance.now() - t0).toFixed(1);
for (const g of glieder) delete r[g];
return { nH: info.nH, gesamt, slots: v2 && v2.slots && v2.slots.length, glieder: sum };

// probe0.cjs — lädt der Kern? DORF in node, ein HAUS mit MASSNUR, Zeit.
const { laden } = require("./lade.cjs");
(async () => {
    const { FC, THREE } = await laden();
    console.log("FC", !!FC, typeof FC.DORF, typeof FC.HAUS, typeof FC.bauRezept);
    const t0 = process.hrtime.bigint();
    const pl = FC.DORF({ seed: 1, nH: 90 });
    const t1 = process.hrtime.bigint();
    console.log("DORF ms", Number(t1 - t0) / 1e6, pl.region, pl.jahr, pl.groesse, pl.houses.length, pl.grammatik);
    const h = pl.houses[5];
    console.log(JSON.stringify(h).slice(0, 400));
    const t2 = process.hrtime.bigint();
    const H = FC.HAUS(THREE, FC.mat, Object.assign({}, h, { nur: FC.MASSNUR }));
    const t3 = process.hrtime.bigint();
    console.log("HAUS ms", Number(t3 - t2) / 1e6, Object.keys(H.dims), H.windows.length, H.dims.rooms.length);
    const H2 = FC.HAUS(THREE, FC.mat, Object.assign({}, h));
    const t4 = process.hrtime.bigint();
    console.log("HAUS voll ms", Number(t4 - t3) / 1e6, H2.windows.length, H2.dims.rooms.length, H2.dims.stairZ0, H2.dims.stairZ1);
    console.log("MASSNUR", JSON.stringify(FC.MASSNUR));
})().catch((e) => { console.error(e); process.exit(1); });

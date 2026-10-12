// patch 14: die Enden des Geflechts folgen der Spreizung der Stränge — je Ende `stuecke` Ketten, jede mit dem größten
// Radius ihres Abschnitts (die Stränge spreizen linear über die letzten 12 %: rh · (1 + 0,7 · ramp)); vorher trug das ganze Ende
// den Radius der Spitze (× 1,7). Arg 2: Stücke je Ende (Standard 4).
const fs = require("fs");
const p = process.argv[2], k = Number(process.argv[3] || 4);
let s = fs.readFileSync(p, "utf8");
const ersetze = (alt, neu, name) => {
    const n = s.split(alt).length - 1;
    if (n !== 1) throw new Error(name + ": " + n + " Treffer");
    s = s.replace(alt, () => neu);
};
ersetze(
    "if(HU){var bA=[],bM=[],bE=[];for(var bq=0;bq<Fb.length;bq++){var bs=bq/(Fb.length-1),ber=Math.min(bs,1-bs),bramp=Math.max(0,1-ber/0.12),bp=new THREE.Vector3(Fb[bq].x,Fb[bq].y-bramp*0.18,0);if(bs<=0.12)bA.push(bp);if(bs>=0.12&&bs<=0.88)bM.push(bp);if(bs>=0.88)bE.push(bp);}hKette(HU,bA,rho*1.05*1.7+fib,bmatG,zoBr);hKette(HU,bM,rho*1.05+fib,bmatG,zoBr);hKette(HU,bE,rho*1.05*1.7+fib,bmatG,zoBr);}",
    "if(HU){var bSt=" + k + ",bK=[];for(var bj=0;bj<2*bSt+1;bj++)bK.push([]);for(var bq=0;bq<Fb.length;bq++){var bs=bq/(Fb.length-1),ber=Math.min(bs,1-bs),bramp=Math.max(0,1-ber/0.12),bp=new THREE.Vector3(Fb[bq].x,Fb[bq].y-bramp*0.18,0);for(var bj=0;bj<2*bSt+1;bj++){var b0=bj<bSt?bj*0.12/bSt:bj===bSt?0.12:0.88+(bj-bSt-1)*0.12/bSt,b1=bj<bSt?(bj+1)*0.12/bSt:bj===bSt?0.88:0.88+(bj-bSt)*0.12/bSt;if(bs>=b0-1e-9&&bs<=b1+1e-9)bK[bj].push(bp);}}for(var bj=0;bj<2*bSt+1;bj++){var bE0=bj<bSt?bj*0.12/bSt:bj===bSt?0.12:1-(0.88+(bj-bSt)*0.12/bSt);hKette(HU,bK[bj],rho*1.05*(1+0.7*Math.max(0,1-bE0/0.12))+fib,bmatG,zoBr);}}",
    "Geflecht"
);
fs.writeFileSync(p, s);
console.log("patch-14 ok (" + k + " Stücke je Ende)");

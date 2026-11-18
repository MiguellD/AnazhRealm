const src=require("fs").readFileSync(__dirname+"/pflanzen.cjs","utf8").split("// ───────────────────────── (0)")[0];
eval(src);
console.log(JSON.stringify(K.PRC.lod.kindStages), Object.keys(K.PRC.lod.budget).map(k=>k+":"+Object.keys(K.PRC.lod.budget[k]).join("/")).join(" "));

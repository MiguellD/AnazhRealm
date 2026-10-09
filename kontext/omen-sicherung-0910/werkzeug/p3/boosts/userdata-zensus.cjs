const fs=require("fs");const acorn=require(process.argv[3]+"/node_modules/acorn");
const q=fs.readFileSync(process.argv[2],"utf8");const ast=acorn.parse(q,{ecmaVersion:"latest",locations:true});
const out={literalOhne:0,literalMit:0,spread:0,anders:[]};let meth="";
(function l(n){if(!n||typeof n.type!=="string")return;if(n.type==="MethodDefinition")meth=n.key.name;
if(n.type==="AssignmentExpression"&&n.left.type==="MemberExpression"&&!n.left.computed&&n.left.property.name==="userData"){
 const r=n.right;if(r.type==="ObjectExpression"){if(r.properties.some(p=>p.type==="SpreadElement"))out.spread++;else if(r.properties.some(p=>p.key&&(p.key.name==="rauchQuelle"||p.key.value==="rauchQuelle")))out.literalMit++;else out.literalOhne++;}
 else out.anders.push(meth+":"+n.loc.start.line+" "+q.slice(n.start,Math.min(n.end,n.start+70)).replace(/\s+/g," "));}
for(const k in n){const v=n[k];if(Array.isArray(v))v.forEach(l);else if(v&&typeof v.type==="string")l(v)}})(ast);
console.log(JSON.stringify({literalOhne:out.literalOhne,literalMit:out.literalMit,spread:out.spread,anders:out.anders.length}));console.log(out.anders.join("\n"));

var presets=__tetrapodaCore.GATTUNGEN;   // GESTALT-DIALS — leben seit W-A6 im Kern ../../tetrapoda-core.js (EINE Quelle, sha256-Beleg im Wellen-Bericht)
var emoMode='idle';
var scene,camera,renderer,composer,fxaa,cinePass,controls,clock;
var wolf;
var H,sY,hY,sZ,hZ,lv,by,tv,bt,P={};
var groundMesh,contactShadow,keyLicht;
var _fp=new THREE.Vector3();
// DIE WELT-GRÖSSE (tetrapoda MASSSTAB): das Labor steht in Metern wie die Welt — der Leib unter seiner Hülle × meterJeEinheit
var MJ=__tetrapodaCore.MASSSTAB.meterJeEinheit;
// DER LEIB DER WELT (w11-leib — Labor = Welt): die Pose ist tetrapoda `tierPose`, DIESELBE Funktion, die jedes Tier der Welt
// geht (stamm `_animateTierBaum` ruft sie): der Gang aus dem Tempo (gangWahl → gangSchritt: Takt, Fußweg, Folge nach der
// Froude-Zahl), die Pfoten weltfest auf dem Boden (Pfoten-IK, Tritt, Landung), die Senke des Rumpfs, Wiegen und Federn im
// Takt des Leibs, Kopf, Ohren und Schwanz aus dem MOTION-Profil, die Aktion der Stimmung (VERHALTEN, `verhaltenWahl`).
// Der Leib GEHT: das Tempo v̂ (der Regler, v = v̂·√(g·L) an der Hüft-Höhe L in Metern) trägt ihn längs +z, die Kamera
// folgt ihm. Gefallen: die PD-Federn je Gelenk, die Rumpf-Feder aus der Zahl stehender Füße (`updateBodyPhysics`), das
// Senken auf die tiefste Pfote, die eigenen Aktionen aus Math.random (`getBeh`) — ein ANDERES Tier als die Welt.
var leib=null,tierBaum=null,laborUhr=0,aktionTakt=0,matrixTafel=null;
var wirt={M3:THREE,nowS:function(){return laborUhr;},boden:function(){return 0;},kipp:function(){return {laengs:0,quer:0};},
  zeile:function(){return null;},bruch:function(n){throw new Error('Labor: Kern-Pflicht '+n+' (fail-closed)');},tmp:{}};
// was die Fenster vom Gang lesen (die Linse gate:tier-gang, die Matrix-Tafel): die Phasen der vier Beine (die Phasen DES
// Leibs, tb._gang.ph), der Fußweg und der Tastgrad des Takts
var cpgPhase=[0,0,0,0],gangS=0,gangTast=0.5,gangArtIst='stand';
var gangWerte={tempo:0},gangRegler=null;
function gangTempo(vh){gangWerte.tempo=Math.max(0,+vh||0);if(gangRegler)gangRegler.setzen({tempo:gangWerte.tempo},true);}
// DIE STIMMUNG DES LABORS → die Stimmung des Verhaltens (VERHALTEN.stimmung): Flucht und Schau tragen keine Aktion (die Welt:
// die Flucht trägt keine)
var STIMMUNG={idle:'idle',joy:'joy',hunt:'jagd',alert:'alert'};
// EIN TAKT DES LEIBS (dt): die Kreatur-Uhr rückt, der Leib geht sein Tempo, alle 0,25 s wählt die Stimmung (wie der Takt der
// Welt), dann die Pose des Kerns; die Lage des Leibs steht danach in seiner Welt-Matrix (wie nach dem Bild der Welt)
function gangTakt(dt){
  if(!leib||!tierBaum)return null;var K=__tetrapodaCore,ud=leib.userData;
  laborUhr+=dt;
  var v=gangWerte.tempo*Math.sqrt(K.GANG_GESETZ.g*tierBaum.beinL);
  leib.position.z+=v*dt;folgen(0,v*dt);
  aktionTakt+=dt;
  if(aktionTakt>=0.25){aktionTakt=0;var mood=STIMMUNG[emoMode];
    if(mood)K.verhaltenWahl(K.VERHALTEN,mood,ud,0,laborUhr,false);else ud._verhaltenAktion=null;}
  K.tierPose(wirt,leib,tierBaum,laborUhr,0,v>0,K.MOTION[emoMode]||K.MOTION.idle,null);
  leib.updateMatrixWorld(true);
  var g=tierBaum._gang;
  cpgPhase=g.ph;gangS=g.S;gangTast=g.tast;
  if(g.art!==gangArtIst){gangArtIst=g.art;var a=document.getElementById('gangart');if(a)a.textContent=g.art;}
  return g;}
// DER BLICK FOLGT DEM LEIB (dx, dz): Kamera, Licht, Boden und Kontakt-Schatten gehen mit
function folgen(dx,dz){if(camera){camera.position.x+=dx;camera.position.z+=dz;}if(controls){controls.target.x+=dx;controls.target.z+=dz;}
  if(keyLicht){keyLicht.position.set(leib.position.x+6*MJ,8*MJ,leib.position.z+4*MJ);keyLicht.target.position.set(leib.position.x,0,leib.position.z);keyLicht.target.updateMatrixWorld();}
  if(groundMesh){groundMesh.position.x=leib.position.x;groundMesh.position.z=leib.position.z;}
  if(contactShadow){contactShadow.position.x=leib.position.x;contactShadow.position.z=leib.position.z;}}
// die Fenster-Stimmung (die Hülle und die Linse rufen sie über die Knöpfe)
var emo={name:'idle',set:function(name){this.name=name;if(leib){leib.userData._verhaltenAktion=null;leib.userData._verhaltenMood=undefined;leib.userData._verhaltenNext=undefined;}}};
/* LABOR = WELT (K45, Synthese §4 W5d „das Labor zeigt den Ofen-Körper"): die Gestalt des Labors IST der Guss der Welt —
   DERSELBE Bäcker wie Foundry-Worker und Wirts-Ofen (foundry-core BAKERS_BY_KIND.kreatur, Saat 0 wie der Kalt-Guss
   `_ofenKreaturTemplate`), aus denselben Dials, mit derselben LOD-Kette: L0 nah, L1 jenseits `ab` (± `hyst`) der Budget-
   Zeile, an die Knochen der feinen gebunden, und die Grobstufe wirft als Zwilling (die Welt-Regel `_gelenkGestalt` /
   `_gelenkStufe`, Maßstab 1 = Lab-Einheit). Gefallen: die Labor-Streu (Kugel-Perlen + 1,3 M Strähnen-Instanzen aus
   Math.random — ein ANDERES Tier als die Welt, ×21 über ihrer Zeile), ihr Guide-Mantel, ihre Fell-Textur und ihre zwei
   Shader. Die Stoffe webt `laborStoff` aus dem Bäcker-Stoff und den Gesetz-Daten FELL_LOOK · FELL_SCHALE — dieselben
   Zahlen liest der Welt-Stoff (stamm `fellSchale`, TSL). */
var BZ=__tetrapodaCore.PORTAL_RENDER_CONFIG.lod.budget.kreatur,STUFEN=__tetrapodaCore.PORTAL_RENDER_CONFIG.lod.kindStages.kreatur;
var FL=__tetrapodaCore.FELL_LOOK,FS=__tetrapodaCore.FELL_SCHALE;
var uZeit={value:0},stufeWahl='auto',gestalt=null,kostenStufen=null;
function gf(x){var s=(+x).toString();return s.indexOf('.')<0&&s.indexOf('e')<0?s+'.0':s;}
function gv(a){return 'vec3('+gf(a[0])+','+gf(a[1])+','+gf(a[2])+')';}
var GLSL_RAUSCHEN='vec3 mod289_s(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}\nvec4 mod289_s(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}\nvec4 permute_s(vec4 x){return mod289_s(((x*34.0)+1.0)*x);}\nvec4 taylorInvSqrt_s(vec4 r){return 1.79284291400159-0.85373472095314*r;}\nfloat snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289_s(i);vec4 p=permute_s(permute_s(permute_s(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt_s(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}\n';
// DER LABOR-STOFF: der Bäcker-Stoff (Farbe linear, Rauheit, Seite, Glut — dieselben Zahlen, die als mp reisen) + die
// Vertex-Farbe als Farbe (die Welt liest nur sie) + die Look-Gesetze der Klasse als r128-GLSL: Fell (Rim · Sheen ·
// microFur · Wrap · Atem), Strähne/Schale (Spitzen-Rim · Spec über die Strähnen-Achse) und das Haar-Raster der Schale.
function laborStoff(m0,geo,skin,cache){
  var k=(m0.userData&&m0.userData.__klasse)||'dunkel',vc=!!geo.attributes.color,key=k+(skin?'|s':'')+(vc?'|c':'');
  if(cache[key])return cache[key];
  var m=m0.clone();m.skinning=skin;if(vc){m.vertexColors=true;m.color.setRGB(1,1,1);}
  var schale=k==='fellSchale',koerper=k==='fell',strand=schale||k.indexOf('straehne')===0;
  if(koerper||strand){
    var L=koerper?FL.koerper:FL.straehne,ton=m0.color,tonL=Math.max(1e-4,0.2126*ton.r+0.7152*ton.g+0.0722*ton.b);
    if(schale)m.alphaTest=0.5;
    m.onBeforeCompile=function(sh){
      sh.uniforms.uZeit=uZeit;
      var vk='uniform float uZeit;\nvarying vec3 vGeo;\n'+(schale?'attribute vec3 aSchale;\nattribute vec3 aWurzel;\nvarying vec3 vSchale;\nvarying vec3 vWurzel;\nvarying vec3 vKamm;\n':'')+(koerper?GLSL_RAUSCHEN:'');
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+vk).replace('#include <begin_vertex>','#include <begin_vertex>\nvGeo=position;'+(schale?'\nvSchale=aSchale;\nvWurzel=aWurzel;\nvKamm=position-aWurzel;vKamm-=normal*dot(vKamm,normal);':''));
      if(koerper)sh.vertexShader=sh.vertexShader.replace('#include <skinning_vertex>','#include <skinning_vertex>\ntransformed+=objectNormal*snoise(transformed*'+gf(L.atem.freq)+'+uZeit*'+gf(L.atem.t)+')*'+gf(L.atem.amp)+';');
      var fk='varying vec3 vGeo;\n'+(schale?'varying vec3 vSchale;\nvarying vec3 vWurzel;\nvarying vec3 vKamm;\n':'');
      var raster=schale?'\nfloat tS=vSchale.x;vec3 pS=vWurzel*vSchale.z;vec3 zS=floor(pS);'+
        'float h1=fract(sin(dot(zS,vec3('+gf(FS.hashA[0])+','+gf(FS.hashA[1])+','+gf(FS.hashA[2])+')))*'+gf(FS.hashA[3])+');'+
        'float h2=fract(sin(dot(zS,vec3('+gf(FS.hashB[0])+','+gf(FS.hashB[1])+','+gf(FS.hashB[2])+')))*'+gf(FS.hashB[3])+');'+
        'vec3 mS=(vec3(h1,h2,fract((h1+h2)*'+gf(FS.hashC)+'))-0.5)*'+gf(FS.mitte)+';vec3 qS=fract(pS)-0.5-mS;float lS=dot(qS,vKamm/max(length(vKamm),1e-6));float dS=sqrt((dot(qS,qS)-lS*lS)*'+gf(FS.strich)+'+lS*lS/'+gf(FS.strich)+');'+
        'float rS=sqrt(vSchale.y)*'+gf(FS.radius)+'*(1.0-tS*'+gf(FS.zulauf)+');'+
        'float haarS=step(dS,rS)*step(tS,h1*'+gf(FS.endeSpanne)+'+'+gf(FS.ende)+');float wolleS=step(tS,'+gf(FS.wolle)+')*step('+gf(FS.wolleAb)+',vSchale.y);'+
        'diffuseColor.rgb*=mix('+gf(FS.wurzel)+','+gf(FS.spitze)+',tS);diffuseColor.a=max(haarS,wolleS);':'';
      var look='\nvec3 vdL=normalize(-vViewPosition);float ndvL=clamp(dot(normal,vdL),-1.0,1.0);float rimL=clamp(1.0-abs(ndvL),0.0,1.0);';
      if(koerper){var mf=L.microFur;look+='totalEmissiveRadiance+='+gv(L.rimFarbe)+'*pow(rimL,'+gf(L.rimPow)+')*'+gf(L.rimAmt)+'+'+gv(L.sheenFarbe)+'*pow(max(ndvL,0.0),'+gf(L.sheenPow)+')*'+gf(L.sheenAmt)+
        '+'+gv(mf.farbe)+'*pow(rimL,3.0)*step('+gf(mf.schwelle)+',fract(sin(dot(floor(vGeo.xz*'+gf(mf.dichte)+'),vec2('+gf(FS.hashA[0])+','+gf(FS.hashA[1])+')))*'+gf(FS.hashA[3])+'))*'+gf(mf.amt)+';';}
      else{/* ohne Vertex-Farbe ist der Ton der Anker selbst (die Welt füllt color mit mp.color): die Achse steht bei 1 */var sT=schale?'vSchale.x':!vc?'1.0':'clamp((dot(vColor,vec3(0.2126,0.7152,0.0722))/'+gf(tonL)+'-'+gf(L.wurzelAnker)+')/'+gf(Math.max(1e-3,1-L.wurzelAnker))+',0.0,1.0)';
        look+='float sTL='+sT+';totalEmissiveRadiance+='+gv(L.tipRimFarbe)+'*pow(rimL,'+gf(L.tipRimPow)+')*sTL+'+gv(L.specFarbe)+'*pow(max(ndvL,0.0),'+gf(L.specPow)+')*sTL*'+gf(L.specAmt)+';';}
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+fk).replace('#include <color_fragment>','#include <color_fragment>'+raster).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>'+look);
      if(koerper)sh.fragmentShader=sh.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );','outgoingLight*=max(ndvL,0.0)*'+gf(L.wrap)+'+'+gf(1-L.wrap)+';\ngl_FragColor = vec4( outgoingLight, diffuseColor.a );');
    };
    m.customProgramCacheKey=function(){return 'labor-welt-'+key;};
  }
  cache[key]=m;return m;
}
// DER GELENK-BAUM des Beipacks (die Welt: `_ofenAssembleAsset`): je Gelenk ein Knochen (die Haut bindet an ihn), benannt,
// in der Ruhe-Pose des Gusses.
function gelenkBaum(sk){var teile={},bones=Array.isArray(sk.skinJoints)&&sk.skinJoints.length>0,root=new THREE.Group();
  sk.joints.forEach(function(j){var b=bones?new THREE.Bone():new THREE.Group();b.name=j.name;teile[j.name]=b;});
  sk.joints.forEach(function(j){var b=teile[j.name];if(j.parent&&teile[j.parent])teile[j.parent].add(b);else if(j.name===sk.root)root.add(b);else(teile[sk.root]||root).add(b);b.position.fromArray(j.pos);b.quaternion.fromArray(j.quat);b.scale.fromArray(j.scale);});
  return {root:root,teile:teile};}
// EINE STUFE an den Baum: jedes Teil an sein Gelenk, jede Haut an die Knochen der FEINEN Stufe (die Grobstufe trägt dieselben
// Knochen — fehlt einer, bricht der Bau laut wie in der Welt).
function stufeAnlegen(lod,dials,baum,cache){
  var g=BAKERS_BY_KIND.kreatur(__tetrapodaCore,gattungAktiv,0,lod,dials),sk=g.userData.__skelett;
  if(!sk||!Array.isArray(sk.joints)||!sk.joints.length)throw new Error('Labor: der Ofen-Guss L'+lod+' trägt kein Skelett (fail-closed)');
  if(!baum)baum=gelenkBaum(sk);
  var liste=[];
  g.children.slice().forEach(function(m0){var geo=m0.geometry,skin=!!geo.attributes.skinIndex,mat=laborStoff(m0.material,geo,skin,cache);
    var n=skin?new THREE.SkinnedMesh(geo,mat):new THREE.Mesh(geo,mat),j=baum.teile[m0.userData.__assetJoint];
    if(!j)throw new Error('Labor: das Gelenk '+m0.userData.__assetJoint+' fehlt dem Baum (fail-closed)');
    n.userData.__seh=m0.material.userData.__seh;n.userData.__klasse=m0.material.userData.__klasse;n.receiveShadow=true;j.add(n);liste.push(n);});
  baum.root.updateMatrixWorld(true);
  var namen=Array.isArray(sk.skinJoints)?sk.skinJoints:[],bones=namen.map(function(nm){if(!baum.teile[nm])throw new Error('Labor: der Knochen '+nm+' der Stufe '+lod+' fehlt der feinen (fail-closed)');return baum.teile[nm];});
  liste.forEach(function(n){if(n.isSkinnedMesh)n.bind(new THREE.Skeleton(bones),n.matrixWorld.clone());});
  return {baum:baum,sk:sk,liste:liste};
}
function disposeAnimal(){if(!gestalt)return;scene.remove(gestalt.root);gestalt.root.traverse(function(o){if(o.isMesh){o.geometry.dispose();o.material.dispose();}});gestalt=null;wolf=null;leib=null;tierBaum=null;}
// DER STUFEN-SCHALTER (die Welt-Regel `_gelenkStufe`): jenseits ab × (1 ± hyst) trägt L1 das Bild, diesseits L0 — und L1 wirft
// immer als Zwilling. r128 prüft den Wurf gegen die Ebenen der HAUPT-Kamera (WebGLShadowMap), eine Schatten-Ebene wie in der
// Welt (r184) wirft hier nicht: der Zwilling zeichnet nah ohne Farbe und Tiefe, sein Tiefen-Stoff wirft. Wählbar: auto · L0 · L1.
var _sp=new THREE.Vector3();
function stufeSchalten(){if(!gestalt)return;var fern;
  if(stufeWahl==='auto'){wolf.getWorldPosition(_sp);var d=camera.position.distanceTo(_sp),h=gestalt.hyst;fern=!(d<gestalt.ab*(gestalt.istFern?1-h:1+h));}
  else fern=stufeWahl==='1';
  if(fern===gestalt.istFern)return;gestalt.istFern=fern;
  gestalt.l0.forEach(function(m){m.visible=!fern;});gestalt.m1.forEach(function(mt){mt.colorWrite=fern;mt.depthWrite=fern;});
  var el=document.getElementById('stufeIst');if(el)el.textContent='zeigt L'+(fern?1:0);}
function laborStufe(){return gestalt?(gestalt.istFern?1:0):null;}
/* DIE HÜLLE (K41): die fünf allometrischen Dials leben in T (geschrieben vom EINEN Generator aus PARAMS_BY_KIND.kreatur), nie im DOM. */
var T={},regler=null,sitz=null,kosten=null,gattungAktiv='wolf';
function deriveParams(){/* ULTRAGUSS U4: die Allometrie wohnt im Gesetzbuch (__tetrapodaCore.deriveTierParams) — die Shell reicht die Dials, ruft das EINE Gesetz. */return __tetrapodaCore.deriveTierParams({size:T.size,neckLen:T.neck,legLen:T.leg,diet:T.diet,build:T.build});}
function buildAnimal(){
  disposeAnimal();P=deriveParams();
  var dials={size:T.size,neck:T.neck,leg:T.leg,diet:T.diet,build:T.build},cache={};
  var s0=stufeAnlegen(STUFEN[0],dials,null,cache),s1=stufeAnlegen(STUFEN[1],dials,s0.baum,{}),teile=s0.baum.teile,m=s0.sk.masse||{};
  wolf=teile[s0.sk.root];
  H=m.H;sY=m.sY;hY=m.hY;sZ=m.sZ;hZ=m.hZ;lv=m.lv;by=m.by;tv=m.tv;bt=m.bt;
  // DIE SOHLE (die Welt: `_ofenAssembleAsset`): der Stand liest die Haut, nie die Fell-Schalen darunter.
  var sohle=new THREE.Box3();s0.liste.forEach(function(n){if(!n.geometry.attributes.aSchale)sohle.expandByObject(n);});
  var minY=Number.isFinite(sohle.min.y)?sohle.min.y:0;
  // DER BAUM DES LEIBS wie in der Welt (stamm `_tetrapodaSoulParts` → userData._tierBaum): die Bein-Maße des Kerns
  // (`tierBeinMass`, in der Ruhe der Vorlage vermessen), die Hüft-Höhe in Metern, der Schwanz
  var bein=__tetrapodaCore.tierBeinMass(THREE,{teile:teile,root:s0.baum.root,minY:minY},MJ);
  tierBaum={teile:teile,tailSegs:(s0.sk.tailSegs||[]).map(function(nm){return teile[nm];}).filter(Boolean),f:MJ,
    beinL:(new THREE.Vector3().setFromMatrixPosition(teile.legHL.matrixWorld).y-minY)*MJ,bein:bein};
  // DIE HÜLLE DES LEIBS (die Welt: `_leibHuelle`): die Gestalt × meterJeEinheit, die Sohle auf dem Boden
  var huelle=new THREE.Group();huelle.scale.setScalar(MJ);huelle.position.y=-minY*MJ;huelle.add(s0.baum.root);
  leib=new THREE.Group();leib.add(huelle);leib.userData._tierBaum=tierBaum;laborUhr=0;aktionTakt=0;
  // der Wurf: L0 wirft nach `schatten` der Zeile (1 = die Grobstufe ist ihr Zwilling), L1 mit ihrem Teil `wurf.seh`
  var z1=BZ[STUFEN[1]],seh=z1.wurf&&Array.isArray(z1.wurf.seh)?z1.wurf.seh:null;
  s0.liste.forEach(function(n){n.castShadow=BZ[STUFEN[0]].schatten===STUFEN[0];});
  s1.liste.forEach(function(n){n.castShadow=z1.schatten===STUFEN[1]&&(!seh||seh.indexOf(n.userData.__seh)>=0);});
  gestalt={root:leib,l0:s0.liste,l1:s1.liste,m1:s1.liste.map(function(n){return n.material;}).filter(function(mt,i,a){return a.indexOf(mt)===i;}),ab:z1.ab,hyst:BZ.hyst,istFern:null};
  if(kosten){kosten.messen({traverse:function(f){s0.liste.forEach(f);}},STUFEN[0]);kosten.messen({traverse:function(f){s1.liste.forEach(f);}},STUFEN[1]);}
  scene.add(leib);leib.updateMatrixWorld(true);stufeSchalten();
  if(contactShadow){contactShadow.scale.setScalar(H*0.55*MJ);contactShadow.position.set(0,0.002,0);}
  folgen(0,0);
  var aug=camera.position.clone().sub(controls.target);controls.target.set(0,sY*0.38*MJ,0);camera.position.copy(controls.target).add(aug);controls.update();emo.set(emoMode);gangTakt(0);document.getElementById('loading').style.display='none';
}
function init(){
  // DIE HÜLLE (K41): Sitzung (Undo/Redo über T samt Gattung) + der EINE Generator + die Kosten-Leiste der Labor-Gestalt.
  sitz=AnazhHuelle.sitzung({werte:T,zustand:function(){return {gattung:gattungAktiv,markiert:!!document.querySelector("#presets button.active")};},zustandSetzen:function(z){gattungAktiv=z.gattung;gattungMarke(z.markiert?z.gattung:null);},anwenden:function(){buildAnimal();}});
  sitz.leiste(document.getElementById("sitzung"),{seed:false});
  regler=AnazhHuelle.regler(document.getElementById("sliders"),__tetrapodaCore.PARAMS_BY_KIND.kreatur,{werte:T,sitzung:sitz,gruppen:false,ruheMs:200,
    basis:function(){return presets[gattungAktiv]||null;},
    format:function(z,v){return z.id==="diet"?(v>0.7?"Carn":v>0.3?"Omni":"Herb"):z.id==="size"?(+v).toFixed(1):(+v).toFixed(2);},
    bei:function(){gattungMarke(null);},nachRuhe:function(){buildAnimal();}});
  kosten=AnazhHuelle.kosten(document.getElementById("kosten"),{budget:BZ,stufen:STUFEN,renderer:function(){return renderer;},
    quelle:"gemessen an der gezeigten Gestalt = dem Welt-Guss (foundry-core BAKERS_BY_KIND.kreatur, dieselben Dials, Saat 0): L0 nah, L1 jenseits "+BZ[STUFEN[1]].ab+" (± "+Math.round(BZ.hyst*100)+" %) und als Wurf"});
  scene=new THREE.Scene();scene.background=new THREE.Color(0x080604);camera=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,0.1*MJ,200*MJ);camera.position.set(6*MJ,2*MJ,7*MJ);
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);if(THREE.sRGBEncoding!==undefined)renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  try{var c=document.createElement('canvas');c.width=256;c.height=256;var x=c.getContext('2d');var g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#ccaa88');g.addColorStop(0.5,'#443322');g.addColorStop(1,'#0a0805');x.fillStyle=g;x.fillRect(0,0,256,256);var t=new THREE.CanvasTexture(c);var p=new THREE.PMREMGenerator(renderer);scene.environment=p.fromEquirectangular(t).texture;t.dispose();}catch(e){}
  scene.add(new THREE.HemisphereLight(0xffeecc,0x332211,0.45));var key=keyLicht=new THREE.DirectionalLight(0xffd8a0,3.5);key.position.set(6*MJ,8*MJ,4*MJ);scene.add(key.target);key.castShadow=true;key.shadow.mapSize.width=2048;key.shadow.mapSize.height=2048;key.shadow.bias=-0.0001;key.shadow.camera.left=-8*MJ;key.shadow.camera.right=8*MJ;key.shadow.camera.top=8*MJ;key.shadow.camera.bottom=-8*MJ;key.shadow.camera.near=0.5*MJ;key.shadow.camera.far=30*MJ;scene.add(key);var rimL=new THREE.DirectionalLight(0x5588ff,1.4);rimL.position.set(-5,4,-5);scene.add(rimL);var fill=new THREE.DirectionalLight(0xaa7744,0.7);fill.position.set(0,2,-8);scene.add(fill);var goldBack=new THREE.DirectionalLight(0xff8833,0.5);goldBack.position.set(-3,3,8);scene.add(goldBack);
  var gC=document.createElement('canvas');gC.width=gC.height=512;var gx=gC.getContext('2d');var gg=gx.createRadialGradient(256,256,40,256,256,250);gg.addColorStop(0,'#1a1610');gg.addColorStop(0.4,'#0d0a07');gg.addColorStop(1,'#050302');gx.fillStyle=gg;gx.fillRect(0,0,512,512);var gTex=new THREE.CanvasTexture(gC);var groundMat=new THREE.MeshStandardMaterial({map:gTex,roughness:0.96,metalness:0});groundMesh=new THREE.Mesh(new THREE.CircleGeometry(20*MJ,64),groundMat);groundMesh.rotation.x=-Math.PI/2;groundMesh.position.y=-0.002;groundMesh.receiveShadow=true;scene.add(groundMesh);
  var csGeo=new THREE.CircleGeometry(1,48);var csMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false});contactShadow=new THREE.Mesh(csGeo,csMat);contactShadow.rotation.x=-Math.PI/2;contactShadow.position.y=0.001;scene.add(contactShadow);
  composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.35,0.4,0.85));fxaa=new THREE.ShaderPass(THREE.FXAAShader);fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);composer.addPass(fxaa);
  var cine={uniforms:{tDiffuse:{value:null},time:{value:0}},vertexShader:['varying vec2 vUv;','void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'].join('\n'),fragmentShader:['uniform sampler2D tDiffuse;','uniform float time;','varying vec2 vUv;','float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}','float getLum(vec2 uv){return dot(texture2D(tDiffuse,uv).rgb,vec3(0.299,0.587,0.114));}','void main(){vec2 uv=vUv;vec2 dir=uv-0.5;float dist=length(dir);vec2 offset=dir*dist*0.008;float r=texture2D(tDiffuse,uv+offset).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-offset).b;vec3 color=vec3(r,g,b);float lum=getLum(uv);float lL=getLum(uv-vec2(0.001,0.0));float lR=getLum(uv+vec2(0.001,0.0));float lU=getLum(uv-vec2(0.0,0.001));float lD=getLum(uv+vec2(0.0,0.001));float edge=abs(lL-lum)+abs(lR-lum)+abs(lU-lum)+abs(lD-lum);color*=(1.0+edge*2.0);color*=smoothstep(1.2,0.1,dist*1.3);color+=random(uv+time)*0.03-0.015;gl_FragColor=vec4(color,1.0);}'].join('\n')};cinePass=new THREE.ShaderPass(cine);cinePass.renderToScreen=true;composer.addPass(cinePass);
  controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=3*MJ;controls.maxDistance=80*MJ;controls.autoRotateSpeed=0.8;clock=new THREE.Clock();buildAnimal();
  document.querySelectorAll('#presets button').forEach(function(b){b.addEventListener('click',function(){sitz.schritt(function(){gattungMarke(b.dataset.p);var p=presets[b.dataset.p];regler.setzen({size:p.size,neck:p.neck,leg:p.leg,diet:p.diet,build:p.build},true);buildAnimal();});});});
  document.querySelectorAll('#stufen button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#stufen button').forEach(function(b2){b2.classList.toggle('active',b2===b);});stufeWahl=b.dataset.s;stufeSchalten();});});
  document.querySelectorAll('#emotions button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#emotions button').forEach(function(b2){b2.classList.remove('active');});b.classList.add('active');emoMode=b.dataset.e;emo.set(emoMode);});});
  gangRegler=AnazhHuelle.regler(document.getElementById("gang"),[{id:"tempo",lab:"Tempo v̂ (Froude-Wurzel)",min:0,max:4,step:0.05,def:0}],{werte:gangWerte,gruppen:false,ruheMs:0});
  // DAS FENSTER IN DEN KERN (die EINE Matrix-Tafel der Hülle, dieselbe im Körper-Studio): die Phasen des Leibs, die Pfoten,
  // das Lot der Rumpf-Wurzel über der Stützfläche der stehenden Pfoten
  matrixTafel=AnazhHuelle.matrix({ziel:document.body,quelle:'tetrapoda tierPose — der Leib der Welt',lesen:function(){
    if(!tierBaum||!tierBaum._gang||!wolf)return null;var g=tierBaum._gang,Tt=tierBaum.teile,f=[];
    [Tt.flP,Tt.frP,Tt.hlP,Tt.hrP].forEach(function(p){p.getWorldPosition(_fp);f.push([_fp.x,_fp.z]);});
    wolf.getWorldPosition(_fp);
    return {glieder:Object.keys(Tt).length,art:g.art,S:g.S,tast:g.tast,phasen:g.ph,fuesse:f,namen:['VL','VR','HL','HR'],schwerpunkt:[_fp.x,_fp.z],gier:leib.rotation.y,meterJe:1};}});
  animate();
}
function gattungMarke(g){gattungAktiv=g||gattungAktiv;document.querySelectorAll('#presets button').forEach(function(b){b.classList.toggle('active',!!g&&b.dataset.p===g);});}
function animate(){
  requestAnimationFrame(animate);if(!wolf||!leib)return;var t=clock.getElapsedTime(),dt=1/60;uZeit.value=t;cinePass.uniforms.time.value=t;controls.autoRotate=(emoMode==='showcase');
  // DER LEIB GEHT (tetrapoda tierPose, der Takt der Welt): die Kamera, das Licht, der Boden und der Kontakt-Schatten folgen ihm
  gangTakt(dt);
  if(matrixTafel)matrixTafel.zeichne();
  fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);controls.update();stufeSchalten();composer.render();
}
addEventListener('resize',function(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});
init();

/* ==================== DIE BRÜCKE ZUR HEIMAT (die Hülle, K41) ==================== */
/* EINE Brücke (../huelle/huelle.js): die DSL spricht die ECHTEN UI-Pfade — die vier Gattungen leben als #presets-Buttons
   (data-p, click() = exakt der Nutzer-Pfad, Regler + buildAnimal laufen), die sechs Bewegungsprofile als #emotions-
   Buttons (data-e, click() → emo.set). Die DSL-Wörter sind deutsch (Registry == Brücke wortgleich, Umlaute ASCII-
   gefaltet: baer), die Tabellen mappen auf die Lab-Werte. Esc meldet die Heimkehr. */
(function () {
    var GATTUNG = { wolf: "wolf", fuchs: "fox", baer: "bear", hirsch: "deer" };
    var EMOTION = {
        entspannt: "idle",
        freude: "joy",
        jagd: "hunt",
        flucht: "flee",
        wachsam: "alert",
        showcase: "showcase",
    };
    function clickBtn(sel) {
        var b = document.querySelector(sel);
        if (b) b.click();
        return !!b;
    }
    AnazhHuelle.bruecke({
        welt: "tetrapoda",
        // DAS ZIEL-BILD (D8): die Hülle rendert diese Welt als Panorama aus dem Blick ihrer Kamera — die Tor-Membran der Heimat zeigt es
        panorama: function () {
            return { THREE: THREE, renderer: renderer, scene: scene, kamera: camera };
        },
        label: "Tetrapoda — Evolution Lab",
        dsl: Object.keys(GATTUNG).concat(Object.keys(EMOTION)),
        wort: function (w) {
            if (GATTUNG[w]) clickBtn('#presets button[data-p="' + GATTUNG[w] + '"]');
            else if (EMOTION[w]) clickBtn('#emotions button[data-e="' + EMOTION[w] + '"]');
        },
        /* DAS WERK DER BÜHNE (der EINE Übergabe-Kanal der Hülle): die zuletzt gewählte Gattung (Regler-Feintuning löscht die
           active-Klasse, die Wahl bleibt gemerkt) mit den Dials ihrer Regler-Zeilen aus T (Saat 0 wie der Guss) — künftige
           Spawns der Gattung tragen sie; der Knopf steht nur im Portal. */
        werk: function () {
            var ov = {};
            __tetrapodaCore.PARAMS_BY_KIND.kreatur.forEach(function (z) {
                ov[z.id] = T[z.id];
            });
            return { kind: "kreatur", preset: gattungAktiv, seed: 0, ov: ov };
        },
        werkOrt: document.getElementById("werkOrt"),
    });
})();
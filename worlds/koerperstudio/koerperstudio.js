const params=Object.assign({},window.__koerperCore.START_PARAMS);   // START-GESTALT — lebt seit W-A6 im Kern ../../koerper-core.js (EINE Quelle, sha256-Beleg im Wellen-Bericht); die UI mutiert den Klon
const parts={};const base={};var emoMode='idle';
function PD(kp,kd){this.target=0;this.current=0;this.vel=0;this.kp=kp;this.kd=kd;}
PD.prototype.update=function(dt){var f=(this.target-this.current)*this.kp-this.vel*this.kd;this.vel+=f*dt;this.current+=this.vel*dt;return this.current;};
var physBase={headY:{kp:28,kd:4.5},headX:{kp:28,kd:4.5},headZ:{kp:12,kd:2.5},spineY:{kp:30,kd:4.5},spineX:{kp:28,kd:4.5},spineZ:{kp:15,kd:3},chestY:{kp:45,kd:6},breath:{kp:38,kd:5},armLY:{kp:42,kd:6},armRY:{kp:42,kd:6},armLZ:{kp:48,kd:7},armRZ:{kp:48,kd:7},armLX:{kp:36,kd:5},armRX:{kp:36,kd:5},elbowL:{kp:65,kd:9},elbowR:{kp:65,kd:9},hipLY:{kp:40,kd:5.5},hipRY:{kp:40,kd:5.5},hipLX:{kp:45,kd:6},hipRX:{kp:45,kd:6},hipLZ:{kp:28,kd:4},hipRZ:{kp:28,kd:4},kneeL:{kp:70,kd:9},kneeR:{kp:70,kd:9},ankleL:{kp:55,kd:7},ankleR:{kp:55,kd:7},bicepR:{kp:55,kd:8},bicepL:{kp:55,kd:8},quadR:{kp:48,kd:6},quadL:{kp:48,kd:6},bodyX:{kp:32,kd:5},bodyZ:{kp:22,kd:4}};
const phys={};for(var pk in physBase)phys[pk]=new PD(physBase[pk].kp,physBase[pk].kd);
var bodyPhys={y:0,vy:0};var fistState={l:0,r:0};var palmState={l:0,r:0};var groundSmooth=0;
// DIE PROPORTIONEN DES STUDIO-RIGS (die Beine des PD-Rigs, der Stand): labProportionen ist Kern-Pflicht — ein fehlendes Feld
// bricht laut (die Loomis-Literale des kalten Kerns fielen mit w4-koerper-park)
const _LP=window.__koerperCore.labProportionen();
['H','thighLen','calfLen','footBelowAnkle','trochanterY','standYWalkMul','standYRunMul'].forEach(function(k){if(!isFinite(_LP[k]))throw new Error('Kern-Pflicht: koerper labProportionen.'+k);});
const _H=_LP.H,L1=_LP.thighLen,L2=_LP.calfLen,footBelowAnkle=_LP.footBelowAnkle,standYBase=-(_LP.trochanterY-footBelowAnkle),standYWalk=standYBase*_LP.standYWalkMul,standYRun=standYBase*_LP.standYRunMul;
function solveIK(ty,tz,l1,l2){var d=Math.sqrt(ty*ty+tz*tz);d=Math.max(Math.abs(l1-l2)+0.001,Math.min(d,l1+l2-0.001));var c=(d*d-l1*l1-l2*l2)/(2*l1*l2);c=Math.max(-1,Math.min(1,c));var kr=Math.acos(c);var hb=-Math.atan2(tz,-ty);var g=Math.atan2(l2*Math.sin(kr),l1+l2*Math.cos(kr));return{hip:hb-g,knee:kr};}
function ankleYFromAngles(hx,kr){return -(L1+L2*Math.cos(kr))*Math.cos(hx)+L2*Math.sin(kr)*Math.sin(hx);}
// DAS EINE GANG-GESETZ (K07): Takt, Fussweg, Tastgrad und Hub aus tetrapoda gangSchritt/gangFuss mit der Zweibeiner-Zeile
// koerper-core fx.bewegung.gang -- dieselbe Formel, nach der Spieler, Peer, Bewohner und die Tiere gehen. Die Buehne traegt
// die Schwere der Welt im Mass des Gusses (G_BUEHNE, Einheiten/s^2: die Erd-Schwere LEIB.sprung.refG durch den Massstab der
// Gelenk-Einheit): die Froude-Zahl misst v gegen sie und die gebaute Beinlaenge wie in der Welt; vMax faellt (die Buehne kennt
// keine Lage-Spruenge). Fail-closed: ohne Kern kein Gang (kein Lab-Literal). Die Arcade-Schwere 44 fiel mit w4-koerper-park.
var G_BUEHNE=window.__koerperCore.LEIB.sprung.refG/window.__koerperCore.leibMassstab();
var _TC=window.__tetrapodaCore,_GZ0=window.__koerperCore.bewegung&&window.__koerperCore.bewegung.gang;
// jedes Feld der Zeile ist Pflicht (fehlt eines, faehrt kein stiller Tier-Gang); das Becken traegt tetrapoda gangBecken
if(!_TC||typeof _TC.gangSchritt!=='function'||typeof _TC.gangFuss!=='function'||typeof _TC.gangBecken!=='function'||typeof _TC.gangReich!=='function'||typeof _TC.gangPhaseHaelt!=='function'||!_GZ0||!['schrittBasis','schrittFroude','tastgrad','tastgradLauf','laufFroude','maxWinkel','hub','hubLauf','hubForm','beckenHub','rollWinkel','fersenAb','ballen','knoechel'].every(function(k){return isFinite(_GZ0[k]);}))throw new Error('Kern-Pflicht: tetrapoda gangSchritt/gangFuss/gangBecken/gangReich/gangPhaseHaelt + koerper fx.bewegung.gang');
var _GZ=Object.assign({},_GZ0,{g:G_BUEHNE,vMax:Infinity});
function gangGesetz(v,Lg){var gs=_TC.gangSchritt(v,Lg,_GZ);return{cad:gs.omega/(2*Math.PI),omega:gs.omega,S:gs.S,tast:gs.tast,hubE:gs.hub*Lg};}
// der Fuss zur Studio-Phase ph (0..1, der Stand zuerst): die Phase des Gesetzes beginnt mit dem Schwung; cs = die Skala
// des Leibs (Welt-Einheiten je Gelenk-Einheit), Rk = die Reichweite der Kette (gangReich) im Gelenk-Mass. Der Fuss rollt
// im spaeten Stand ueber den Ballen (tetrapoda gangRolle wie in der Welt): heb hebt den Knoechel, roll kippt die Sohle --
// vorher drehte ein zweites Modell (anklePhase) den Knoechel nach eigener Kurve, ohne dass das Becken davon wusste.
function gangFussStudio(ph,gs,sY,cs,Rk){var f=_TC.gangFuss(2*Math.PI*((ph+1-gs.tast)%1),gs.S,gs.tast,_GZ,Rk*cs,_TC.gangReich(L1+L2)*cs);return{y:sY+f.hub*gs.hubE/cs+f.heb/cs,z:f.dz/cs,heb:f.heb/cs,roll:f.roll};}
// der Ruhe-Stand des Studios aus MOTION.idle (Kern-Pflicht: das Literal des kalten Kerns fiel mit w4-koerper-park)
if(!window.__koerperCore.MOTION||!window.__koerperCore.MOTION.idle)throw new Error('Kern-Pflicht: koerper MOTION.idle');
// DAS TEMPO DES GANGS im Studio (Einheiten/s): das Gesetz der Welt — Gehen und Sprint der Seele (leibWerte der Dials) durch den
// Massstab; die Arcade-Tempi (NINJA_FEEL 6 / 10,5 / 18) fielen mit w4-koerper-park
function _tempoStudio(lauf){var W=window.__koerperCore.leibWerte(params);return (lauf?W.sprintSpeed:W.speed)/window.__koerperCore.leibMassstab();}
var emo={cur:Object.assign({},window.__koerperCore.MOTION.idle),tgt:null,name:'idle',behTimer:0,behType:null,behStart:0,
presets:window.__koerperCore.MOTION,   // BEWEGUNGS-PROFILE — das motion-Feld lebt im Kern (W-A6, EINE Quelle; emo.set kopiert je Wahl)
set:function(name){this.tgt=Object.assign({},this.presets[name]);this.name=name;this.behTimer=0;this.behType=null;var sY=standYBase;if(name==='run')sY=standYRun;if(name==='fear')sY=standYBase*0.96;if(name==='sad')sY=standYBase*0.99;if(name!=='run'&&name!=='fight'&&name!=='pwalk'&&name!=='slide'){var zL=0,zR=0;var ikL=solveIK(sY,zL,L1,L2),ikR=solveIK(sY,zR,L1,L2);this.tgt.hipLX=ikL.hip;this.tgt.hipRX=ikR.hip;this.tgt.kneeL=ikL.knee;this.tgt.kneeR=ikR.knee;}},
update:function(dt,t){if(!this.tgt)return;var c=this.cur,g=this.tgt,l=1-Math.exp(-3.1*dt);var keys=['headY','headX','headZ','spineY','spineX','spineZ','bodyX','bodyZ','armL','armR','armLX','armRX','elbowL','elbowR','hipLX','hipRX','hipLZ','hipRZ','kneeL','kneeR','breath','sway','freq','kpMul','irisSpeed','blinkRate'];for(var i=0;i<keys.length;i++)c[keys[i]]+=(g[keys[i]]-c[keys[i]])*l;this.behTimer+=dt;if(this.name==='idle'){var ib=['walk','walk','walk','lookaround','shift','breathe','glance','headtilt'];if(this.behTimer>2.5+Math.random()*3){this.behTimer=0;this.behType=ib[Math.floor(Math.random()*ib.length)];this.behStart=t;}}else if(this.name==='joy'){var jb=['dance','dance','jump','wave','spin','bounce','clap'];if(this.behTimer>2+Math.random()*2.5){this.behTimer=0;this.behType=jb[Math.floor(Math.random()*jb.length)];this.behStart=t;}}else if(this.name==='sad'){var sb=['wipetear','sigh','lookdown','droop','wilt'];if(this.behTimer>4+Math.random()*3){this.behTimer=0;this.behType=sb[Math.floor(Math.random()*sb.length)];this.behStart=t;}}else if(this.name==='angry'){var ab=['shout','clench','lunge','stomp','pound','glare'];if(this.behTimer>1.5+Math.random()*2){this.behTimer=0;this.behType=ab[Math.floor(Math.random()*ab.length)];this.behStart=t;}}else if(this.name==='fear'){var fb=['shrink','tremble','cower','flinch','cringe'];if(this.behTimer>1.2+Math.random()*1.5){this.behTimer=0;this.behType=fb[Math.floor(Math.random()*fb.length)];this.behStart=t;}}else if(this.name==='run'){this.behType='running';}else if(this.name==='pwalk'){this.behType='pwalking';}else if(this.name==='slide'){this.behType='sliding';}else if(this.name==='fight'){var fb2=['jab','cross','hook','guard','dodge','kick','combo'];if(this.behTimer>0.5+Math.random()*1.0){this.behTimer=0;this.behType=fb2[Math.floor(Math.random()*fb2.length)];this.behStart=t;}}else if(this.name==='showcase'){this.behType='showcase';}},
getBeh:function(t){var m={headY:0,headX:0,headZ:0,spineY:0,spineX:0,spineZ:0,bodyX:0,bodyZ:0,armL:0,armR:0,armLX:0,armRX:0,elbowL:0,elbowR:0,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,ankleL:0,ankleR:0,breathBoost:1,jumpY:0,tensionBoost:0,mouthBoost:0,browBoost:0};var pt;function guardBase(m){var ikL=solveIK(standYBase,0.2,L1,L2),ikR=solveIK(standYBase,-0.2,L1,L2);m.armRZ=0.1;m.armLZ=0.1;m.armRX=-0.45;m.armLX=-0.45;m.elbowR=1.35;m.elbowL=1.35;m.hipLX=ikL.hip;m.hipRX=ikR.hip;m.hipLZ=-0.12;m.hipRZ=0.12;m.kneeR=ikR.knee;m.kneeL=ikL.knee;m.ankleR=0.05;m.ankleL=0.05;}
if(this.behType==='walk'){var gs=gangGesetz(_tempoStudio(false),L1+L2),ph=(t*gs.cad)%1.0,pL=ph,pR=(ph+0.5)%1.0;var fL=gangFussStudio(pL,gs,standYWalk,1,_TC.gangReich(L1+L2)),fR=gangFussStudio(pR,gs,standYWalk,1,_TC.gangReich(L1+L2));var ikL=solveIK(fL.y,fL.z,L1,L2),ikR=solveIK(fR.y,fR.z,L1,L2);m.hipLX=ikL.hip;m.kneeL=ikL.knee;m.ankleL=fL.roll;m.hipRX=ikR.hip;m.kneeR=ikR.knee;m.ankleR=fR.roll;m.armLX=Math.cos(ph*2*Math.PI)*0.3;m.armRX=-Math.cos(ph*2*Math.PI)*0.3;m.elbowL=0.15+Math.abs(Math.cos(ph*2*Math.PI))*0.1;m.elbowR=0.15+Math.abs(Math.cos(ph*2*Math.PI+Math.PI))*0.1;m.spineY=Math.cos(ph*2*Math.PI)*0.05;m.bodyZ=Math.cos(ph*2*Math.PI+Math.PI/2)*0.02;m.jumpY=Math.abs(Math.sin(ph*2*Math.PI))*0.02;m.breathBoost=1.3;m.headY=Math.sin(ph*Math.PI)*0.04;m.tensionBoost=0.15;return m;}
if(this.behType==='running'){var gs=gangGesetz(_tempoStudio(true),L1+L2),ph=(t*gs.cad)%1.0,pL=ph,pR=(ph+0.5)%1.0;var fL=gangFussStudio(pL,gs,standYRun,1,_TC.gangReich(L1+L2)),fR=gangFussStudio(pR,gs,standYRun,1,_TC.gangReich(L1+L2));var ikL=solveIK(fL.y,fL.z,L1,L2),ikR=solveIK(fR.y,fR.z,L1,L2);m.hipLX=ikL.hip;m.kneeL=ikL.knee;m.ankleL=fL.roll;m.hipRX=ikR.hip;m.kneeR=ikR.knee;m.ankleR=fR.roll;var aS=Math.cos(ph*2*Math.PI);m.armLX=aS*1.25;m.armRX=-aS*1.25;m.armR=0.12;m.armL=0.12;m.elbowL=1.4+Math.max(0,aS)*0.55;m.elbowR=1.4+Math.max(0,-aS)*0.55;m.spineY=aS*0.26;m.headY=-aS*0.14;m.spineX=0.30;m.spineZ=aS*0.05;m.bodyX=0.18;m.bodyZ=-aS*0.06;m.jumpY=Math.pow(Math.abs(Math.sin(ph*2*Math.PI)),0.65)*0.30;m.breathBoost=2.0;m.headX=-0.08;m.tensionBoost=0.55;return m;}
if(this.behType==='pwalking'){var gs=gangGesetz(_tempoStudio(false),L1+L2),ph=(t*gs.cad)%1.0,pL=ph,pR=(ph+0.5)%1.0;var fL=gangFussStudio(pL,gs,standYBase,1,_TC.gangReich(L1+L2)),fR=gangFussStudio(pR,gs,standYBase,1,_TC.gangReich(L1+L2));var ikL=solveIK(fL.y,fL.z,L1,L2),ikR=solveIK(fR.y,fR.z,L1,L2);m.hipLX=ikL.hip;m.kneeL=ikL.knee;m.ankleL=fL.roll;m.hipRX=ikR.hip;m.kneeR=ikR.knee;m.ankleR=fR.roll;var aS=Math.cos(ph*2*Math.PI);m.armLX=aS*0.42;m.armRX=-aS*0.42;m.armR=0.04;m.armL=0.04;m.elbowL=0.32+Math.max(0,aS)*0.15;m.elbowR=0.32+Math.max(0,-aS)*0.15;m.spineY=aS*0.09;m.headY=-aS*0.05;m.spineZ=aS*0.035;m.spineX=0.05;m.bodyX=0.04;m.bodyZ=-aS*0.035;m.jumpY=Math.pow(Math.abs(Math.sin(ph*2*Math.PI)),0.8)*0.055;m.breathBoost=1.3;m.headX=-0.03;m.tensionBoost=0.12;return m;}
if(this.behType==='sliding'){m.hipRX=-0.55;m.kneeR=0.35;m.ankleR=0.18;m.hipLX=0.15;m.kneeL=1.75;m.ankleL=0.1;m.spineX=0.34;m.bodyX=0.20;m.spineY=0.12;m.spineZ=0.06;m.armRX=0.55;m.armLX=-0.30;m.armR=0.22;m.armL=0.16;m.elbowR=0.85;m.elbowL=0.55;m.headX=-0.30;m.headY=-0.06;m.breathBoost=1.5;m.tensionBoost=0.6;return m;}
if(this.behType==='dance'){pt=t-this.behStart;if(pt>5){this.behType=null;return m;}var dT=pt*2.8;m.hipLZ=Math.sin(dT)*0.1;m.hipRZ=-Math.sin(dT)*0.1;m.bodyZ=Math.sin(dT)*0.08;m.spineY=Math.sin(dT*0.5)*0.1;m.spineZ=Math.sin(dT)*0.04;m.armL=0.3+Math.sin(dT)*0.2;m.armR=0.3-Math.sin(dT)*0.2;m.armLX=-0.2+Math.sin(dT*0.7)*0.15;m.armRX=-0.2+Math.sin(dT*0.7+Math.PI)*0.15;m.elbowL=0.4+Math.sin(dT*1.3)*0.2;m.elbowR=0.4+Math.sin(dT*1.3+Math.PI)*0.2;m.kneeL=0.1+Math.abs(Math.sin(dT))*0.1;m.kneeR=0.1+Math.abs(Math.sin(dT+Math.PI))*0.1;m.jumpY=Math.abs(Math.sin(dT*2))*0.03;m.mouthBoost=0.1;m.headY=Math.sin(dT*0.7)*0.1;m.headZ=Math.sin(dT)*0.04;return m;}
if(this.behType==='wipetear'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}if(pt<0.2){var i=pt/0.2;m.armR=0.35*i;m.armRX=-0.45*i;m.elbowR=1.0*i;m.headX=0.15+0.02*i;m.headY=0.02*i;}else if(pt<0.45){var i=(pt-0.2)/0.25;m.armR=0.35;m.armRX=-0.45;m.elbowR=1.0;m.headY=0.02+0.08*i;m.headX=0.17+0.03*i;}else if(pt<0.7){var i=(pt-0.45)/0.25;m.armR=0.35*(1-i);m.armRX=-0.45*(1-i);m.elbowR=1.0*(1-i);m.headY=0.1-0.1*i;m.headX=0.2-0.05*i;}return m;}
if(this.behType==='shout'){pt=t-this.behStart;if(pt>1.8){this.behType=null;return m;}if(pt<0.2){var i=pt/0.2;m.armR=2.0*i;m.armRX=-0.3*i;m.elbowR=0.1*i;m.armL=0.8*i;m.armLX=-0.2*i;m.elbowL=0.3*i;m.headX=-0.05-0.12*i;m.bodyX=-0.04-0.06*i;m.mouthBoost=0.18*i;m.tensionBoost=0.5*i;m.spineX=-0.05*i;}else if(pt<1.2){m.armR=2.0+Math.sin(pt*8)*0.05;m.armRX=-0.3;m.elbowR=0.1;m.armL=0.8;m.armLX=-0.2;m.elbowL=0.3+Math.sin(pt*6)*0.1;m.headX=-0.17;m.bodyX=-0.1;m.mouthBoost=0.18+Math.sin(pt*5)*0.04;m.tensionBoost=0.5;m.browBoost=-0.15;m.spineX=-0.05;}else{var ft=(pt-1.2)/0.6;m.armR=2.0*(1-ft);m.armRX=-0.3*(1-ft);m.elbowR=0.1*(1-ft);m.armL=0.8*(1-ft);m.armLX=-0.2*(1-ft);m.elbowL=0.3*(1-ft);m.headX=-0.17+0.12*ft;m.bodyX=-0.1+0.06*ft;m.mouthBoost=0.18*(1-ft);m.tensionBoost=0.5*(1-ft);m.spineX=-0.05*(1-ft);}return m;}
if(this.behType==='shrink'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.spineY=Math.sin(t*2.5)*0.25*i;m.headY=Math.sin(t*2.5)*0.15*i;m.headX=0.08*i+Math.sin(t*4)*0.02;m.spineX=0.06*i;m.bodyZ=Math.sin(t*1.8)*0.03*i;m.bodyX=0.04*i;var sY=standYBase*(1-0.05*i);var ik=solveIK(sY,0,L1,L2);m.kneeL=ik.knee;m.kneeR=ik.knee;m.hipLX=ik.hip;m.hipRX=ik.hip;m.elbowL=0.3+i*0.4;m.elbowR=0.3+i*0.4;m.armLX=0.08*i;m.armRX=0.08*i;m.armL=0.05*i;m.armR=0.05*i;m.tensionBoost=0.2*i;return m;}
if(this.behType==='guard'){pt=(t-this.behStart)/2.0;if(pt>=1){this.behType=null;return m;}guardBase(m);var i=Math.sin(t*3.5);m.kneeR+=i*0.06;m.kneeL-=i*0.06;m.bodyZ=i*0.04;m.spineY=Math.sin(t*2)*0.06;m.headY=Math.sin(t*1.8)*0.04;m.headX=-0.06+Math.sin(t*4)*0.01;return m;}
if(this.behType==='jab'){guardBase(m);pt=t-this.behStart;if(pt>0.32){this.behType=null;return m;}if(pt<0.06){var i=pt/0.06;m.armLX=-0.45-0.55*i;m.elbowL=1.35-1.25*i;m.spineY=0.08*i;m.bodyX=0.03*i;}else if(pt<0.15){m.armLX=-1.0;m.elbowL=0.1;m.spineY=0.08;m.bodyX=0.03;}else{var ft=(pt-0.15)/0.17;m.armLX=-1.0+0.55*ft;m.elbowL=0.1+1.25*ft;m.spineY=0.08*(1-ft);m.bodyX=0.03*(1-ft);}return m;}
if(this.behType==='cross'){guardBase(m);pt=t-this.behStart;if(pt>0.45){this.behType=null;return m;}if(pt<0.09){var i=pt/0.09;m.armRX=-0.45-0.55*i;m.elbowR=1.35-1.25*i;m.spineY=-0.12*i;m.bodyX=0.05*i;}else if(pt<0.2){m.armRX=-1.0;m.elbowR=0.1;m.spineY=-0.12;m.bodyX=0.05;}else{var ft=(pt-0.2)/0.25;m.armRX=-1.0+0.55*ft;m.elbowR=0.1+1.25*ft;m.spineY=-0.12*(1-ft);m.bodyX=0.05*(1-ft);}return m;}
if(this.behType==='hook'){guardBase(m);pt=t-this.behStart;if(pt>0.55){this.behType=null;return m;}if(pt<0.18){var i=pt/0.18;m.armRZ=0.1-0.25*i;m.armRX=-0.45-0.2*i;m.elbowR=1.35-0.15*i;m.spineY=0.1*i;m.bodyZ=0.06*i;}else if(pt<0.3){m.armRZ=-0.15;m.armRX=-0.65;m.elbowR=1.2;m.spineY=0.1;m.bodyZ=0.06;}else{var ft=(pt-0.3)/0.25;m.armRZ=-0.15+0.25*ft;m.armRX=-0.65+0.2*ft;m.elbowR=1.2+0.15*ft;m.spineY=0.1*(1-ft);m.bodyZ=0.06*(1-ft);}return m;}
if(this.behType==='kick'){guardBase(m);pt=t-this.behStart;if(pt>1.2){this.behType=null;return m;}if(pt<0.22){var i=pt/0.22;m.bodyZ=-0.15*i;m.spineX=0.08*i;var kY=standYBase+0.8*i,kZ=-0.2-0.15*i;var ik=solveIK(kY,kZ,L1,L2);m.hipRX=ik.hip;m.kneeR=ik.knee;}else if(pt<0.38){var i=(pt-0.22)/0.16;m.bodyZ=-0.15;m.spineX=0.08;var kY=standYBase+0.6-0.6*i,kZ=-0.35+0.8*i;var ik=solveIK(kY,kZ,L1,L2);m.hipRX=ik.hip;m.kneeR=ik.knee;m.ankleR=0.5*i;}else{var ft=(pt-0.38)/0.82;m.bodyZ=-0.15*(1-ft);m.spineX=0.08*(1-ft);var ikR=solveIK(standYBase,-0.2,L1,L2);m.hipRX=ikR.hip;m.kneeR=ikR.knee;m.ankleR=0.5*(1-ft);}return m;}
if(this.behType==='combo'){guardBase(m);pt=t-this.behStart;if(pt>0.9){this.behType=null;return m;}if(pt<0.1){var i=pt/0.1;m.armLX=-0.45-0.55*i;m.elbowL=1.35-1.25*i;m.spineY=0.08*i;}else if(pt<0.18){m.armLX=-1.0;m.elbowL=0.1;m.spineY=0.08;}else if(pt<0.28){var ft1=(pt-0.18)/0.1;m.armLX=-1.0+0.55*ft1;m.elbowL=0.1+1.25*ft1;m.spineY=0.08*(1-ft1)-0.12*ft1;m.armRX=-0.45-0.55*ft1;m.elbowR=1.35-1.25*ft1;m.bodyX=0.05*ft1;}else if(pt<0.4){m.armLX=-0.45;m.elbowL=1.35;m.spineY=-0.12;m.armRX=-1.0;m.elbowR=0.1;m.bodyX=0.05;}else if(pt<0.55){var ft2=(pt-0.4)/0.15;m.armRX=-1.0+0.55*ft2;m.elbowR=0.1+1.25*ft2;m.spineY=-0.12*(1-ft2);m.bodyX=0.05*(1-ft2);}else{var ft3=(pt-0.55)/0.35;guardBase(m);m.spineY=0.05*(1-ft3);}return m;}
if(this.behType==='dodge'){guardBase(m);pt=(t-this.behStart)/0.55;if(pt>=1){this.behType=null;return m;}m.bodyZ=Math.sin(pt*Math.PI)*0.14;m.spineY=-Math.sin(pt*Math.PI)*0.12;m.headY=-Math.sin(pt*Math.PI)*0.08;return m;}
if(this.behType==='lookaround'){pt=(t-this.behStart)/4.5;if(pt>=1){this.behType=null;return m;}m.headY=Math.sin(pt*Math.PI*2)*0.28;m.headX=Math.sin(pt*Math.PI)*0.04;return m;}
if(this.behType==='shift'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}m.bodyZ=Math.sin(pt*Math.PI)*0.04;m.hipLZ=Math.sin(pt*Math.PI)*0.05;m.hipRZ=-Math.sin(pt*Math.PI)*0.05;return m;}
if(this.behType==='breathe'){pt=(t-this.behStart)/3.5;if(pt>=1){this.behType=null;return m;}m.breathBoost=1+Math.sin(pt*Math.PI)*0.8;return m;}
if(this.behType==='glance'){pt=(t-this.behStart)/1.5;if(pt>=1){this.behType=null;return m;}m.headY=Math.sin(pt*Math.PI)*0.18;m.headX=-Math.sin(pt*Math.PI)*0.03;return m;}
if(this.behType==='headtilt'){pt=(t-this.behStart)/3;if(pt>=1){this.behType=null;return m;}m.headZ=Math.sin(pt*Math.PI)*0.08;m.headY=Math.sin(pt*Math.PI*0.5)*0.05;return m;}
if(this.behType==='jump'){pt=t-this.behStart;if(pt>1.0){this.behType=null;return m;}if(pt<0.15){var i=pt/0.15;var jk=solveIK(standYBase*(1-0.12*i),0,L1,L2);m.kneeL=jk.knee;m.kneeR=jk.knee;m.hipLX=jk.hip;m.hipRX=jk.hip;m.bodyX=0.05*i;m.armL=0.3*i;m.armR=0.3*i;}else if(pt<0.55){var ft=(pt-0.15)/0.4;m.jumpY=Math.sin(ft*Math.PI)*0.45;var ext=standYBase*(0.88+0.12*Math.sin(ft*Math.PI));var jk2=solveIK(ext,0,L1,L2);m.kneeL=jk2.knee;m.kneeR=jk2.knee;m.hipLX=jk2.hip;m.hipRX=jk2.hip;m.bodyX=0.03;m.armL=0.4;m.armR=0.4;}else{var lt=(pt-0.55)/0.45;var jk3=solveIK(standYBase*(1-0.08*(1-lt)),0,L1,L2);m.kneeL=jk3.knee;m.kneeR=jk3.knee;m.hipLX=jk3.hip;m.hipRX=jk3.hip;m.bodyX=0.03*(1-lt);m.armL=0.4*(1-lt);m.armR=0.4*(1-lt);}return m;}
if(this.behType==='wave'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}m.armR=0.55+Math.sin(pt*Math.PI*8)*0.15;m.armRX=-0.3+Math.sin(pt*Math.PI*8)*0.05;m.elbowR=0.3+Math.sin(pt*Math.PI*8)*0.12;m.headY=Math.sin(pt*Math.PI)*0.1;m.mouthBoost=0.08*Math.sin(pt*Math.PI);return m;}
if(this.behType==='spin'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}m.bodyZ=Math.sin(pt*Math.PI*2)*0.12;m.spineY=Math.sin(pt*Math.PI*2)*0.22;m.headY=Math.sin(pt*Math.PI*2)*0.28;m.armL=0.35;m.armR=0.35;return m;}
if(this.behType==='bounce'){pt=t-this.behStart;if(pt>1.5){this.behType=null;return m;}m.jumpY=Math.abs(Math.sin(pt*4.5))*0.1;m.armL=Math.sin(pt*4.5)*0.12;m.armR=-Math.sin(pt*4.5)*0.12;var bk=solveIK(standYBase*(1-0.06*Math.abs(Math.sin(pt*4.5))),0,L1,L2);m.kneeL=bk.knee;m.kneeR=bk.knee;m.hipLX=bk.hip;m.hipRX=bk.hip;m.mouthBoost=0.1;return m;}
if(this.behType==='clap'){pt=t-this.behStart;if(pt>1.5){this.behType=null;return m;}var ci=Math.abs(Math.sin(pt*8));m.armL=0.3+ci*0.15;m.armR=0.3+ci*0.15;m.armLX=-0.3;m.armRX=-0.3;m.elbowL=0.4+ci*0.2;m.elbowR=0.4+ci*0.2;m.mouthBoost=0.1;return m;}
if(this.behType==='sigh'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}m.breathBoost=1+Math.sin(pt*Math.PI)*1.0;m.headX=Math.sin(pt*Math.PI)*0.08;m.bodyX=Math.sin(pt*Math.PI)*0.03;m.spineX=Math.sin(pt*Math.PI)*0.04;return m;}
if(this.behType==='lookdown'){pt=(t-this.behStart)/4.5;if(pt>=1){this.behType=null;return m;}m.headX=Math.sin(pt*Math.PI)*0.2;m.headY=Math.sin(pt*Math.PI*2)*0.05;return m;}
if(this.behType==='droop'){pt=(t-this.behStart)/3.5;if(pt>=1){this.behType=null;return m;}m.spineX=Math.sin(pt*Math.PI)*0.07;m.headX=Math.sin(pt*Math.PI)*0.06;m.bodyX=Math.sin(pt*Math.PI)*0.02;return m;}
if(this.behType==='wilt'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}m.spineX=0.06*Math.sin(pt*Math.PI);m.headX=0.07*Math.sin(pt*Math.PI);m.bodyX=0.03*Math.sin(pt*Math.PI);return m;}
if(this.behType==='clench'){pt=(t-this.behStart)/1.5;if(pt>=1){this.behType=null;return m;}m.tensionBoost=Math.sin(pt*Math.PI)*0.45;m.elbowL=0.15+Math.sin(pt*Math.PI)*0.2;m.elbowR=0.15+Math.sin(pt*Math.PI)*0.2;m.armLX=-0.12*Math.sin(pt*Math.PI);m.armRX=-0.12*Math.sin(pt*Math.PI);return m;}
if(this.behType==='lunge'){pt=t-this.behStart;if(pt>0.9){this.behType=null;return m;}if(pt<0.2){var i=pt/0.2;m.bodyX=0.08*i;m.spineX=0.05*i;m.elbowL=0.15+0.15*i;m.elbowR=0.15+0.15*i;m.tensionBoost=0.4*i;m.armLX=-0.15*i;m.armRX=-0.15*i;}else{var ft=(pt-0.2)/0.7;m.bodyX=0.08*(1-ft);m.spineX=0.05*(1-ft);m.elbowL=0.3-0.15*ft;m.elbowR=0.3-0.15*ft;m.tensionBoost=0.4*(1-ft);m.armLX=-0.15*(1-ft);m.armRX=-0.15*(1-ft);}return m;}
if(this.behType==='glare'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}m.headX=-Math.sin(pt*Math.PI)*0.05;m.browBoost=-0.15;m.tensionBoost=0.15*Math.sin(pt*Math.PI);return m;}
if(this.behType==='stomp'){pt=t-this.behStart;if(pt>0.6){this.behType=null;return m;}if(pt<0.15){var i=pt/0.15;var stY=standYBase*(1+0.15*i);var ik=solveIK(stY,-0.1,L1,L2);m.hipRX=ik.hip;m.kneeR=ik.knee;m.jumpY=0.03*i;}else if(pt<0.25){m.jumpY=0.03;}else{var ft=(pt-0.25)/0.35;var stY2=standYBase*(1.15-0.15*ft);var ik2=solveIK(stY2,-0.1+0.1*ft,L1,L2);m.hipRX=ik2.hip;m.kneeR=ik2.knee;m.jumpY=0.03*(1-ft)+Math.sin(ft*Math.PI)*0.04;m.bodyX=0.06*Math.sin(ft*Math.PI);m.tensionBoost=0.3*Math.sin(ft*Math.PI);m.ankleR=0.3*Math.sin(ft*Math.PI);}return m;}
if(this.behType==='pound'){pt=t-this.behStart;if(pt>0.8){this.behType=null;return m;}if(pt<0.15){var i=pt/0.15;m.armR=0.4*i;m.armRX=-0.5*i;m.elbowR=0.3*i;}else if(pt<0.3){m.armR=0.4;m.armRX=-0.5;m.elbowR=0.3;}else{var ft=(pt-0.3)/0.5;m.armR=0.4*(1-ft);m.armRX=-0.5*(1-ft);m.elbowR=0.3*(1-ft);m.bodyX=0.04*Math.sin(ft*Math.PI);}return m;}
if(this.behType==='tremble'){pt=t-this.behStart;if(pt>1.8){this.behType=null;return m;}m.bodyZ=Math.sin(t*12)*0.004;m.spineZ=Math.sin(t*11)*0.004;m.headZ=Math.sin(t*10)*0.003;m.headX=Math.sin(t*9)*0.003;m.elbowL=0.08+Math.sin(t*13)*0.015;m.elbowR=0.08+Math.sin(t*13)*0.015;return m;}
if(this.behType==='cower'){pt=(t-this.behStart)/2.2;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.bodyX=i*0.08;m.spineX=i*0.1;m.headX=i*0.08;m.elbowL=0.15+i*0.6;m.elbowR=0.15+i*0.6;var cwY=standYBase*(1-0.08*i);var ik=solveIK(cwY,0,L1,L2);m.kneeL=ik.knee;m.kneeR=ik.knee;m.hipLX=ik.hip;m.hipRX=ik.hip;m.armLX=0.1*i;m.armRX=0.1*i;return m;}
if(this.behType==='flinch'){pt=t-this.behStart;if(pt>0.5){this.behType=null;return m;}if(pt<0.1){var i=pt/0.1;m.bodyX=0.06*i;m.headX=0.04*i;m.elbowL=0.15+0.4*i;m.elbowR=0.15+0.4*i;var flY=standYBase*(1-0.06*i);var ik=solveIK(flY,0,L1,L2);m.kneeL=ik.knee;m.kneeR=ik.knee;m.hipLX=ik.hip;m.hipRX=ik.hip;m.armLX=0.08*i;m.armRX=0.08*i;}else{var ft=(pt-0.1)/0.4;m.bodyX=0.06*(1-ft);m.headX=0.04*(1-ft);m.elbowL=0.55-0.4*ft;m.elbowR=0.55-0.4*ft;var flY2=standYBase*(0.94+0.06*ft);var ik2=solveIK(flY2,0,L1,L2);m.kneeL=ik2.knee;m.kneeR=ik2.knee;m.hipLX=ik2.hip;m.hipRX=ik2.hip;m.armLX=0.08*(1-ft);m.armRX=0.08*(1-ft);}return m;}
if(this.behType==='cringe'){pt=(t-this.behStart)/1.5;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.bodyX=0.04*i;m.spineX=0.06*i;m.headX=0.05*i;m.elbowL=0.1+i*0.5;m.elbowR=0.1+i*0.5;m.armLX=0.1*i;m.armRX=0.1*i;var crY=standYBase*(1-0.06*i);var ik=solveIK(crY,0,L1,L2);m.kneeL=ik.knee;m.kneeR=ik.knee;m.hipLX=ik.hip;m.hipRX=ik.hip;return m;}
if(this.behType==='showcase'){m.headY=Math.sin(t*0.15)*0.3;m.headX=Math.sin(t*0.15*0.7+0.5)*0.05-0.02;m.headZ=Math.sin(t*0.15*0.5)*0.03;m.spineY=Math.sin(t*0.12)*0.06;m.bodyZ=Math.sin(t*0.1)*0.02;return m;}
return m;}};
const scene=new THREE.Scene();scene.background=new THREE.Color(0x080808);
const camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,0.1,100);camera.position.set(0,3,8);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
function env(){const c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#aabbcc');g.addColorStop(0.5,'#333');g.addColorStop(1,'#050505');x.fillStyle=g;x.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);const p=new THREE.PMREMGenerator(renderer);const e=p.fromEquirectangular(t).texture;t.dispose();return e;}
scene.environment=env();
// die Paletten wohnen im Gesetzbuch (koerper-core SKIN_TONES · HAIR_COLORS · CLOTH_COLORS) — die Wahlen münzen daraus die Guss-Farben
const SKIN_TONES=window.__koerperCore.SKIN_TONES,HAIR_COLORS=window.__koerperCore.HAIR_COLORS,CLOTH_COLORS=window.__koerperCore.CLOTH_COLORS;
const {trochanterY}=window.__koerperCore.labProportionen();
/* LABOR = WELT (K45-2, Synthese §4 W5d „das Labor zeigt den Ofen-Körper"): die Gestalt des Labors IST der Guss der Welt —
   DERSELBE Bäcker wie Foundry-Worker und Wirts-Ofen (foundry-core BAKERS_BY_KIND.koerper, Saat 0 wie `_ofenMenschTemplate`),
   aus denselben Dials und Farben (params = START_PARAMS + die Wahlen, die die Übergabe der Welt reicht; Haut- und Haar-Ton aus
   den Paletten wie `_menschGussFarben`), mit derselben LOD-Kette: L0 nah, L1 jenseits `ab` (± `hyst`) der Budget-Zeile, an die
   Knochen der feinen gebunden, und die Grobstufe wirft als Zwilling. Gefallen: der eigene Leib des Labors (bauMensch mit
   64er-Kugeln, die Haut-, Schädel- und Gesichts-Schalen, die Kleid-Schnitte mit Säumen, Klammern und Nähten, die Strähnen-
   Frisuren aus Math.random, die Haut-Textur) — 332 645 Dreiecke gegen die Welt-Zeile 40 000. Die Kleid-Gewichts-Vererbung
   lebt im Ofen (`__stoffErbtHaut`). Die Stoffe webt `laborStoff` aus dem Bäcker-Stoff und den Look-Gesetzen HAUT_LOOK ·
   HAAR_LOOK und der Webung der Kleid-Zeile — dieselben Zahlen liest der Welt-Stoff (stamm, TSL). */
var KC=window.__koerperCore,BZ=KC.PORTAL_RENDER_CONFIG.lod.budget.koerper,STUFEN=KC.PORTAL_RENDER_CONFIG.lod.kindStages.koerper;
var HL=KC.HAUT_LOOK,HAL=KC.HAAR_LOOK;
var uZeit={value:0},stufeWahl='auto',gestalt=null;
var character=null,torsoG=null,headGroup=null,irisL=null,irisR=null,lidTL=null,lidTR=null,hairGroup=null,torsoR=0.38;
function gf(x){var s=(+x).toString();return s.indexOf('.')<0&&s.indexOf('e')<0?s+'.0':s;}
function gv(a){return 'vec3('+gf(a[0])+','+gf(a[1])+','+gf(a[2])+')';}
var GLSL_RAUSCHEN='vec3 mod289_s(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}\nvec4 mod289_s(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}\nvec4 permute_s(vec4 x){return mod289_s(((x*34.0)+1.0)*x);}\nvec4 taylorInvSqrt_s(vec4 r){return 1.79284291400159-0.85373472095314*r;}\nfloat snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289_s(i);vec4 p=permute_s(permute_s(permute_s(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt_s(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}\n';
// DIE WEBUNG je Kleid-Zeile (die Welt: stamm `mp.webe` — Frequenz und Tiefe der Mikro-Struktur)
var WEBE=window.__koerperCore.WEBE;   // die EINE Webungs-Tafel (koerper-core WEBE, K2)
// DER LABOR-STOFF: der Bäcker-Stoff (Farbe linear, Rauheit, Seite, Glut — dieselben Zahlen, die als mp reisen) + die Vertex-
// Farbe als Farbe (die Welt liest nur sie) + die Look-Gesetze der Klasse als r128-GLSL: Haut (SSS-Saum, Klarlack), Haar
// (Spitzen-Rim · Spec über die Strähnen-Achse), Stoff (die Webung).
function laborStoff(m0,geo,skin,cache){
  var k=(m0.userData&&m0.userData.__klasse)||'skin',vc=!!geo.attributes.color,key=k+(skin?'|s':'')+(vc?'|c':'');
  if(cache[key])return cache[key];
  var haut=k==='haut'||k==='skin',haar=k==='hair',webe=m0.userData&&m0.userData.__webe&&WEBE[m0.userData.__webe];
  var m;
  if(haut){m=new THREE.MeshPhysicalMaterial({color:m0.color.clone(),roughness:m0.roughness,metalness:m0.metalness,clearcoat:HL.clearcoat,clearcoatRoughness:HL.clearcoatRoughness});m.userData=Object.assign({},m0.userData);}
  else m=m0.clone();
  m.skinning=skin;if(vc){m.vertexColors=true;m.color.setRGB(1,1,1);}
  if(haut||haar||webe){
    var tonL=Math.max(1e-4,0.2126*m0.color.r+0.7152*m0.color.g+0.0722*m0.color.b);
    m.onBeforeCompile=function(sh){
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGeo;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGeo=position;');
      var fk='varying vec3 vGeo;\n'+(webe?GLSL_RAUSCHEN:'');
      var farbe=webe?'\ndiffuseColor.rgb*=1.0+snoise(vGeo*'+gf(webe[0])+')*'+gf(webe[1])+';':'';
      var look='\nvec3 vdL=normalize(-vViewPosition);float ndvL=clamp(dot(normal,vdL),-1.0,1.0);float rimL=clamp(1.0-abs(ndvL),0.0,1.0);';
      if(haut)look+='totalEmissiveRadiance+='+gv(HL.sssFarbe)+'*pow(rimL,'+gf(HL.sssPow)+')*'+gf(HL.sssAmt)+';';
      else if(haar){var sT=!vc?'1.0':'clamp((dot(vColor,vec3(0.2126,0.7152,0.0722))/'+gf(tonL)+'-'+gf(HAL.wurzelAnker)+')/'+gf(Math.max(1e-3,1-HAL.wurzelAnker))+',0.0,1.0)';
        look+='float sTL='+sT+';totalEmissiveRadiance+='+gv(HAL.tipRimFarbe)+'*pow(rimL,'+gf(HAL.tipRimPow)+')*sTL+'+gv(HAL.specFarbe)+'*pow(max(ndvL,0.0),'+gf(HAL.specPow)+')*sTL*'+gf(HAL.specAmt)+';';}
      else look='';
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+fk).replace('#include <color_fragment>','#include <color_fragment>'+farbe).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>'+look);
    };
    m.customProgramCacheKey=function(){return 'labor-welt-mensch-'+key+(webe?'|'+m0.userData.__webe:'');};
  }
  cache[key]=m;return m;
}
// DER GELENK-BAUM des Beipacks (die Welt: `_ofenAssembleAsset`): je Gelenk ein Knochen (die Haut bindet an ihn), benannt,
// in der Ruhe-Pose des Gusses.
function gelenkBaum(sk){var teile={},bones=Array.isArray(sk.skinJoints)&&sk.skinJoints.length>0,root=new THREE.Group();
  sk.joints.forEach(function(j){var b=bones?new THREE.Bone():new THREE.Group();b.name=j.name;teile[j.name]=b;});
  sk.joints.forEach(function(j){var b=teile[j.name];if(j.parent&&teile[j.parent])teile[j.parent].add(b);else if(j.name===sk.root)root.add(b);else(teile[sk.root]||root).add(b);b.position.fromArray(j.pos);b.quaternion.fromArray(j.quat);b.scale.fromArray(j.scale);});
  return {root:root,teile:teile};}
// die Guss-Eingabe der Welt: die Dials samt Wahlen, Haut- und Haar-Ton aus den Paletten (stamm `_menschGussFarben`)
function gussOv(){return {dials:Object.assign({},params),skinColor:SKIN_TONES[params.skinTone].hex>>>0,hairColor:HAIR_COLORS[params.hairColor].base>>>0};}
// EINE STUFE an den Baum: jedes Teil an sein Gelenk, jede Haut an die Knochen der FEINEN Stufe (die Grobstufe trägt dieselben
// Knochen — fehlt einer, bricht der Bau laut wie in der Welt).
function stufeAnlegen(lod,ov,baum,cache){
  var g=BAKERS_BY_KIND.koerper(KC,'mensch',0,lod,ov),sk=g.userData.__skelett;
  if(!sk||!Array.isArray(sk.joints)||!sk.joints.length)throw new Error('Labor: der Ofen-Guss L'+lod+' trägt kein Skelett (fail-closed)');
  if(!baum)baum=gelenkBaum(sk);
  var liste=[];
  g.children.slice().forEach(function(m0){var geo=m0.geometry,skin=!!geo.attributes.skinIndex,mat=laborStoff(m0.material,geo,skin,cache);
    var n=skin?new THREE.SkinnedMesh(geo,mat):new THREE.Mesh(geo,mat),j=baum.teile[m0.userData.__assetJoint];
    if(!j)throw new Error('Labor: das Gelenk '+m0.userData.__assetJoint+' fehlt dem Baum (fail-closed)');
    n.userData.__seh=m0.material.userData.__seh;n.userData.__klasse=m0.material.userData.__klasse;n.userData.__webe=m0.material.userData.__webe||null;n.receiveShadow=true;j.add(n);liste.push(n);});
  baum.root.updateMatrixWorld(true);
  var namen=Array.isArray(sk.skinJoints)?sk.skinJoints:[],bones=namen.map(function(nm){if(!baum.teile[nm])throw new Error('Labor: der Knochen '+nm+' der Stufe '+lod+' fehlt der feinen (fail-closed)');return baum.teile[nm];});
  liste.forEach(function(n){if(n.isSkinnedMesh)n.bind(new THREE.Skeleton(bones),n.matrixWorld.clone());});
  return {baum:baum,sk:sk,liste:liste};
}
// DAS TUCH (haar.K4, Labor = Welt): derselbe weiche Löser des Körper-Kerns wie der Leib der Welt (`_tuchTakt`): das Gitter ist das
// Tuch der Grobstufe (L1), das Tuch der feinen (L0) folgt ihm, die Haut beider Stufen bleibt innen; je Bild EIN Schritt nach der
// Pose (die Welt-Matrizen stehen), solange L0 das Bild trägt — jenseits ruht das Tuch in der Pose (`tuchRuhe`).
function tuchAnlegen(s0,s1){var stoff=function(L){return L.filter(function(n){return n.isSkinnedMesh&&n.userData.__seh==='stoff';});},
  haut=s0.liste.concat(s1.liste).filter(function(n){return n.isSkinnedMesh&&n.userData.__seh==='haut'&&n.userData.__klasse==='haut';}),
  fein=stoff(s0.liste),grob=stoff(s1.liste),sim=grob.length?grob:fein,folge=grob.length?fein:[];
  if(!sim.length)return null;
  // die Ruhe-Lage beider Stufen über der Haut beider (wie der Wirt `_tuchVorlageDrapieren`); das Labor rechnet in Einheiten des Leibs
  s0.baum.root.updateMatrixWorld(true);if(KC.tuchDrapieren(fein.concat(grob),haut,KC.leibMassstab())>0)fein.concat(grob).forEach(function(n){n.geometry.computeVertexNormals();});
  return KC.tuchZustand(KC.tuchGitter(sim,folge,haut,sim.map(function(n){return n.userData.__webe;})),sim,folge,haut,KC.leibMassstab());}
function tuchTakt(dt){if(!gestalt||!gestalt.tuch)return;
  if(gestalt.istFern){if(!gestalt.tuchRuht){KC.tuchRuhe(gestalt.tuch);gestalt.tuchRuht=true;}return;}
  gestalt.tuchRuht=false;gestalt.root.updateMatrixWorld(true);KC.tuchTakt(gestalt.tuch,dt);}
function gestaltFort(){if(!gestalt)return;scene.remove(gestalt.root);gestalt.root.traverse(function(o){if(o.isMesh){o.geometry.dispose();o.material.dispose();}});gestalt=null;}
// DER STUFEN-SCHALTER (die Welt-Regel `_gelenkStufe`): jenseits ab × (1 ± hyst) trägt L1 das Bild, diesseits L0 — und L1 wirft
// immer als Zwilling (r128: der Zwilling zeichnet nah ohne Farbe und Tiefe, sein Tiefen-Stoff wirft). Wählbar: auto · L0 · L1.
var _sp=new THREE.Vector3();
function stufeSchalten(){if(!gestalt)return;var fern;
  if(stufeWahl==='auto'){(headGroup||character).getWorldPosition(_sp);var d=camera.position.distanceTo(_sp),h=gestalt.hyst;fern=!(d<gestalt.ab*(gestalt.istFern?1-h:1+h));}
  else fern=stufeWahl==='1';
  if(fern===gestalt.istFern)return;gestalt.istFern=fern;
  gestalt.l0.forEach(function(m){m.visible=!fern;});gestalt.m1.forEach(function(mt){mt.colorWrite=fern;mt.depthWrite=fern;});
  var el=document.getElementById('stufeIst');if(el)el.textContent='zeigt L'+(fern?1:0);}
function laborStufe(){return gestalt?(gestalt.istFern?1:0):null;}
// DER TORSO-HALBMESSER der Arm-Kapsel (_poseGuard) misst die gezeigte Haut: in der Taille (zwischen Hüft- und Kopf-Gelenk) der
// Median-Abstand der Haut-Ecken von der Leib-Achse — die Masse des Leibs schiebt kauernde Arme weiter hinaus.
function torsoHalbmesser(s0){var t=s0.baum.teile,inv=new THREE.Matrix4().copy(character.matrixWorld).invert(),v=new THREE.Vector3();
  var yH=0;['hip1','hip-1'].forEach(function(n){t[n].getWorldPosition(v);v.applyMatrix4(inv);yH+=v.y/2;});t.head.getWorldPosition(v);v.applyMatrix4(inv);var yW=yH+(v.y-yH)*0.35;
  var haut=s0.liste.find(function(n){return n.isSkinnedMesh&&n.userData.__klasse==='haut'&&n.parent===character;});if(!haut)return 0.38;
  var pa=haut.geometry.attributes.position,r=[],zc=0,i;for(i=0;i<pa.count;i++)if(Math.abs(pa.getY(i)-yW)<0.08){zc+=pa.getZ(i);r.push(i);}
  if(!r.length)return 0.38;zc/=r.length;var d=r.map(function(i){return Math.hypot(pa.getX(i),pa.getZ(i)-zc);}).sort(function(a,b){return a-b;});
  return d[d.length>>1]+0.08;}
// DER GUSS: beide Stufen aus EINEM Aufruf je Stufe, an EINEN Knochen-Baum (L0 nah, L1 fern und als Wurf) — die Regler, die Haar-
// und Kleid-Wahl und die Farben rufen ihn nach der Ruhe (die Welt bäckt je Dials+Farben, kein Live-Morph).
function gestaltNeu(){
  var lageAlt=character?{p:character.position.clone(),r:character.rotation.clone()}:null;
  gestaltFort();syncPickers();updateLabel();
  var ov=gussOv(),cache={};
  var s0=stufeAnlegen(STUFEN[0],ov,null,cache),s1=stufeAnlegen(STUFEN[1],ov,s0.baum,{}),t=s0.baum.teile;
  for(var k in parts)delete parts[k];Object.assign(parts,t);
  character=t[s0.sk.root];torsoG=t.torso;headGroup=t.head;irisL=t.irisL||null;irisR=t.irisR||null;lidTL=t.lidTL||null;lidTR=t.lidTR||null;
  ['arm1','arm-1'].forEach(function(n){if(t[n]){t[n].userData.baseRotZ=t[n].rotation.z;t[n].userData.baseRotX=t[n].rotation.x;}});
  if(lageAlt){character.position.copy(lageAlt.p);character.rotation.copy(lageAlt.r);}
  character.updateMatrixWorld(true);torsoR=torsoHalbmesser(s0);
  // der Wurf: L0 wirft nach `schatten` der Zeile (1 = die Grobstufe ist ihr Zwilling), L1 mit ihrem Teil `wurf.seh`
  var z1=BZ[STUFEN[1]],seh=z1.wurf&&Array.isArray(z1.wurf.seh)?z1.wurf.seh:null;
  s0.liste.forEach(function(n){n.castShadow=BZ[STUFEN[0]].schatten===STUFEN[0];});
  s1.liste.forEach(function(n){n.castShadow=z1.schatten===STUFEN[1]&&(!seh||seh.indexOf(n.userData.__seh)>=0);});
  // DIE SOHLE DER RUHE-POSE (wie `sohleY` der Welt): die tiefste Fläche der L0 im Rahmen der Wurzel — der Spiel-Modus stellt sie
  // auf den Fuß-Punkt des Leibs; das Skelett trägt die Kette des Lösers und das Volumen der Masse
  var sohle=Infinity,bb=new THREE.Box3(),pAlt=character.position.clone(),rAlt=character.rotation.clone();character.position.set(0,0,0);character.rotation.set(0,0,0);s0.baum.root.updateMatrixWorld(true);
  s0.liste.forEach(function(n){if(!n.geometry.boundingBox)n.geometry.computeBoundingBox();bb.copy(n.geometry.boundingBox).applyMatrix4(n.matrixWorld);if(bb.min.y<sohle)sohle=bb.min.y;});
  character.position.copy(pAlt);character.rotation.copy(rAlt);s0.baum.root.updateMatrixWorld(true);
  gestalt={root:s0.baum.root,l0:s0.liste,l1:s1.liste,m1:s1.liste.map(function(n){return n.material;}).filter(function(mt,i,a){return a.indexOf(mt)===i;}),ab:z1.ab,hyst:BZ.hyst,istFern:null,sk:s0.sk,sohleY:sohle};
  gestalt.tuch=tuchAnlegen(s0,s1);
  if(kosten){kosten.messen({traverse:function(f){s0.liste.forEach(f);}},STUFEN[0]);kosten.messen({traverse:function(f){s1.liste.forEach(f);}},STUFEN[1]);
    /* die Fern-Stufen zeigt das Labor nicht — die Leiste misst sie am Welt-Guss derselben Dials (eine Wegwerf-Gestalt) */
    STUFEN.slice(2).forEach(function(s){var g=BAKERS_BY_KIND.koerper(KC,'mensch',0,s,ov);g.traverse(function(n){if(n.isMesh)n.castShadow=BZ[s].schatten===s;});kosten.messen(g,s,true);});}
  scene.add(gestalt.root);stufeSchalten();
}
function updateLabel(){const lbl=document.getElementById('presetLabel');const age=Math.round(18+params.age*62);let body='athletisch',gen='Mann';if(params.mass>0.6)body='übergewichtig';else if(params.mass<0.2)body='mager';else if(params.tone>0.7)body='muskulös';else if(params.tone<0.3)body='schlank';if(params.gender<0.3)gen='Frau';else if(params.gender<0.6)gen='androgyn';lbl.textContent=`${body} ${gen} · ${age}`;}
var gC=document.createElement('canvas');gC.width=gC.height=512;var gx=gC.getContext('2d');var gg=gx.createRadialGradient(256,256,40,256,256,250);gg.addColorStop(0,'#1a1610');gg.addColorStop(0.4,'#0d0a07');gg.addColorStop(1,'#050302');gx.fillStyle=gg;gx.fillRect(0,0,512,512);var gTex=new THREE.CanvasTexture(gC);var groundMat=new THREE.MeshStandardMaterial({map:gTex,roughness:0.96,metalness:0});var groundMesh=new THREE.Mesh(new THREE.CircleGeometry(20,64),groundMat);groundMesh.rotation.x=-Math.PI/2;groundMesh.position.y=-0.002;groundMesh.receiveShadow=true;scene.add(groundMesh);
var csMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false});var contactShadow=new THREE.Mesh(new THREE.CircleGeometry(1,48),csMat);contactShadow.rotation.x=-Math.PI/2;contactShadow.position.y=0.001;scene.add(contactShadow);
scene.add(new THREE.HemisphereLight(0xffffff,0x444444,0.6));
const key=new THREE.DirectionalLight(0xffe0b0,3.0);key.position.set(5,8,5);key.castShadow=true;key.shadow.mapSize.width=2048;key.shadow.mapSize.height=2048;key.shadow.bias=-0.0001;key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;scene.add(key);
const rimL=new THREE.DirectionalLight(0x33aaff,2.0);rimL.position.set(-5,4,-5);scene.add(rimL);
const composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.3,0.4,0.9));const fxaa=new THREE.ShaderPass(THREE.FXAAShader);fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);composer.addPass(fxaa);
const cine={uniforms:{tDiffuse:{value:null},time:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float time;varying vec2 vUv;float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}float getLum(vec2 uv){return dot(texture2D(tDiffuse,uv).rgb,vec3(0.299,0.587,0.114));}void main(){vec2 uv=vUv;vec2 dir=uv-0.5;float dist=length(dir);vec2 offset=dir*dist*0.0035;float r=texture2D(tDiffuse,uv+offset).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-offset).b;vec3 color=vec3(r,g,b);float lum=getLum(uv);float lL=getLum(uv-vec2(0.001,0.0)),lR=getLum(uv+vec2(0.001,0.0)),lU=getLum(uv-vec2(0.0,0.001)),lD=getLum(uv+vec2(0.0,0.001));float edge=abs(lL-lum)+abs(lR-lum)+abs(lU-lum)+abs(lD-lum);color*=(1.0+edge*0.55);color*=smoothstep(1.2,0.1,dist*1.3);color+=random(uv+time)*0.014-0.007;gl_FragColor=vec4(color,1.0);}`};const cinePass=new THREE.ShaderPass(cine);cinePass.renderToScreen=true;composer.addPass(cinePass);
const controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,trochanterY,0);controls.minDistance=3;controls.maxDistance=15;controls.autoRotateSpeed=0.8;controls.update();
/* DIE HÜLLE (K41): die Sitzung trägt jede Tat (Regler-Zug, Haar-/Kleid-Wahl, Farbe, Zufall, Reset) als EINEN Rückgängig-Schritt über params; der EINE Generator liest PARAMS_BY_KIND.koerper (je grp ein Abschnitt) und schreibt params in place — der Guss folgt nach der Ruhe. */
function fmtVal(k){if(k==='height')return params.height.toFixed(2);if(k==='age')return Math.round(18+params.age*62);return Math.round(params[k]*100)+'%';}
var _gussT=null;function gussBald(){clearTimeout(_gussT);_gussT=setTimeout(gestaltNeu,150);}
const sitz=AnazhHuelle.sitzung({werte:params,anwenden:()=>{syncUI();gestaltNeu();}});sitz.leiste(document.getElementById('sitzung'));
const KPARAMS=window.__koerperCore.PARAMS_BY_KIND.koerper;
const kosten=AnazhHuelle.kosten(document.getElementById('kosten'),{budget:BZ,stufen:STUFEN,renderer:renderer,quelle:'gemessen an der gezeigten Gestalt = dem Welt-Guss (foundry-core BAKERS_BY_KIND.koerper, dieselben Dials und Farben, Saat 0): L0 nah, L1 jenseits '+BZ[STUFEN[1]].ab+' (± '+Math.round(BZ.hyst*100)+' %) und als Wurf'});
const reglerKoerper=['KOERPER','POSE','HAAR'].map(g=>AnazhHuelle.regler(document.getElementById(g==='KOERPER'?'reglerKoerper':g==='POSE'?'reglerPose':'reglerHaar'),KPARAMS.filter(z=>z.grp===g),{werte:params,sitzung:sitz,gruppen:false,zuruecksetzen:false,ruheMs:150,format:z=>fmtVal(z.id),bei:()=>updateLabel(),nachRuhe:()=>gussBald()}));
function syncUI(){reglerKoerper.forEach(r=>r.sync());}
const HAARSTILE=[...document.querySelectorAll('#hairStyles button')].map(b=>b.dataset.h);
document.getElementById('btnReset').addEventListener('click',()=>sitz.schritt(()=>{Object.assign(params,window.__koerperCore.START_PARAMS);syncUI();gestaltNeu();}));/* der Zufall zieht aus dem Samen der Sitzung (derselbe Same = derselbe Mensch) */document.getElementById('btnRandom').addEventListener('click',()=>{sitz.seedSetzen((Date.now()^((Math.random()*4294967296)>>>0))>>>0,true);const R=AnazhHuelle.zufall(sitz.seed);sitz.schritt(()=>{params.height=0.9+R()*0.25;params.mass=R();params.tone=R();params.age=R()*0.8;params.gender=R();params.hairLen=0.3+R()*1.5;params.hairVol=0.6+R()*1.2;params.arms=R()*0.3;params.hairStyle=HAARSTILE[Math.floor(R()*HAARSTILE.length)];params.hairColor=randKey(HAIR_COLORS,R);params.top=randPick(['tshirt','pullover','tank','poncho','tshirt','pullover'],R);params.topColor=randKey(CLOTH_COLORS,R);params.bottom=randPick(['pants','shorts','pants'],R);params.bottomColor=randKey(CLOTH_COLORS,R);params.shoes=randPick(['sneaker','boot','sneaker'],R);params.shoeColor=randKey(CLOTH_COLORS,R);params.skinTone=randKey(SKIN_TONES,R);syncUI();gestaltNeu();});});document.querySelectorAll('#emotions button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#emotions button').forEach(function(b2){b2.classList.remove('active');});b.classList.add('active');emoMode=b.dataset.e;emo.set(emoMode);});});
document.querySelectorAll('#stufen button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#stufen button').forEach(function(b2){b2.classList.toggle('active',b2===b);});stufeWahl=b.dataset.s;stufeSchalten();});});
function randPick(a,R){return a[Math.floor((R||Math.random)()*a.length)];}
function randKey(o,R){var k=Object.keys(o);return k[Math.floor((R||Math.random)()*k.length)];}
function buildSwatches(containerId,palette,getKey,onPick){var cont=document.getElementById(containerId);if(!cont)return;cont.innerHTML='';Object.keys(palette).forEach(function(key){var sw=document.createElement('div');sw.className='sw';sw.title=palette[key].name;var hex=(palette[key].base!=null)?palette[key].base:palette[key].hex;sw.style.background='#'+('000000'+hex.toString(16)).slice(-6);if(key===getKey())sw.classList.add('active');sw.addEventListener('click',function(){cont.querySelectorAll('.sw').forEach(function(x){x.classList.remove('active');});sw.classList.add('active');sitz.schritt(function(){onPick(key);});});cont.appendChild(sw);});}
function wirePicker(containerId,attr,onPick){var cont=document.getElementById(containerId);if(!cont)return;cont.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){cont.querySelectorAll('button').forEach(function(x){x.classList.remove('active');});b.classList.add('active');sitz.schritt(function(){onPick(b.dataset[attr]);});});});}
// jede Wahl ist eine Dial-Zeile des Gusses: Haut- und Haar-Ton, Frisur und Kleid backen neu (die Welt bäckt je Dials+Farben)
function syncPickers(){[['hairStyles','h','hairStyle'],['topStyles','t','top'],['botStyles','b','bottom'],['shoeStyles','s','shoes']].forEach(function(c){var cont=document.getElementById(c[0]);if(cont)cont.querySelectorAll('button').forEach(function(b){b.classList.toggle('active',b.dataset[c[1]]===params[c[2]]);});});buildSwatches('skinTones',SKIN_TONES,function(){return params.skinTone;},function(k){params.skinTone=k;gestaltNeu();});buildSwatches('hairColors',HAIR_COLORS,function(){return params.hairColor;},function(k){params.hairColor=k;gestaltNeu();});buildSwatches('topColors',CLOTH_COLORS,function(){return params.topColor;},function(k){params.topColor=k;gestaltNeu();});buildSwatches('botColors',CLOTH_COLORS,function(){return params.bottomColor;},function(k){params.bottomColor=k;gestaltNeu();});buildSwatches('shoeColors',CLOTH_COLORS,function(){return params.shoeColor;},function(k){params.shoeColor=k;gestaltNeu();});}
wirePicker('hairStyles','h',function(v){params.hairStyle=v;gestaltNeu();});
wirePicker('topStyles','t',function(v){params.top=v;gestaltNeu();});
wirePicker('botStyles','b',function(v){params.bottom=v;gestaltNeu();});
wirePicker('shoeStyles','s',function(v){params.shoes=v;gestaltNeu();});
gestaltNeu();syncUI();emo.set('idle');

// PROZEDURALE MIKRO-NOISE: zwei oszillatoren im goldenen-schnitt-verhaeltnis (x1.618) -> quasi-
// periodisch, wiederholt sich NIE. jeder kanal bekommt einen eigenen seed -> kopf/arme/huefte
// sind dekorreliert statt phasenstarr (der alte sinus-brei war nach ~20s als loop erkennbar,
// und beide arme teilten sich sin(t*0.8) in IDENTISCHER phase).
function _pn(t,f,s){return Math.sin(t*f+s*12.9898)*0.62+Math.sin(t*f*1.618+s*78.233)*0.38;}
// BLICK-SYSTEM: sakkaden-ziele pro emotion (angst: hektisch+weit / wut: starrer blick / trauer:
// gesenkt / freude: lebhaft / kampf: fokussiert). die augen springen SCHNELL zum ziel (14/s),
// der kopf bekommt dasselbe ziel klein aufaddiert und folgt TRAEGE ueber die PD-federn ->
// 'eyes lead, head follows'. jede ~2. sakkade loest ein blinzeln aus (menschlicher reflex).
var _gz={x:0,y:0,tx:0,ty:0,next:0,blinkKick:false},_blkNext=1.4,_blkPh=99;
function _gazeUpdate(dt,t,mode){
  if(t>_gz.next){var cad,ax,ay,by=0;
    if(mode==='fear'){cad=0.5+Math.random()*0.7;ax=1.0;ay=0.55;}
    else if(mode==='angry'){cad=2.6+Math.random()*2.4;ax=0.15;ay=0.10;}
    else if(mode==='sad'){cad=2.0+Math.random()*2.0;ax=0.40;ay=0.35;by=-0.55;}
    else if(mode==='joy'){cad=0.9+Math.random()*1.0;ax=0.90;ay=0.55;by=0.15;}
    else if(mode==='fight'){cad=0.8+Math.random()*0.8;ax=0.50;ay=0.20;}
    else{cad=1.4+Math.random()*2.2;ax=0.70;ay=0.40;}
    _gz.next=t+cad;_gz.tx=(Math.random()*2-1)*ax;_gz.ty=(Math.random()*2-1)*ay+by;
    _gz.blinkKick=Math.random()<0.55;}
  var k=1-Math.exp(-14*dt);_gz.x+=(_gz.tx-_gz.x)*k;_gz.y+=(_gz.ty-_gz.y)*k;}
const clock=new THREE.Clock(); var blinkTimer=0;
// DER TAKT DES LABORS: Emotion, Verhalten und PD-Federn treiben die GELENKE des Gusses (dieselben Namen liest der Stamm-Rig:
// mensch · torso · head · arm/elbow/hand · hip/knee/ankle · Lider · Iris) — was die Welt nicht als Gelenk trägt (Atem-Skalen
// der Brust, Muskel-Spannung, Finger-Faust, Brauen, Lippen), bewegt auch das Labor nicht mehr.
function animate(){requestAnimationFrame(animate);var dt=1/60,t=clock.getElapsedTime();uZeit.value=t;cinePass.uniforms.time.value=t;controls.autoRotate=(emoMode==='showcase');if(!character){composer.render();return;}
// DAS SPIEL FÜHRT ALLEIN (Labor = Welt): der Schritt des EINEN Gesetzes, die Pose der Welt, die Kamera — das PD-Rig des Studios ruht
if(play.on){playTakt(dt);stufeSchalten();tuchTakt(dt);composer.render();return;}
emo.update(dt,t);var bm=emo.getBeh(t);var e=emo.cur;
var targetY=bm.jumpY||0;var dy=targetY-bodyPhys.y;bodyPhys.vy+=dy*300*dt;bodyPhys.vy-=25*dt;bodyPhys.vy*=0.88;bodyPhys.y+=bodyPhys.vy*dt;if(bodyPhys.y<0){bodyPhys.y=0;if(bodyPhys.vy<0)bodyPhys.vy*=-0.15;}
// V18.491.141 KPMUL_VIS.lab=pd-gain
for(var k in phys){phys[k].kp=physBase[k].kp*e.kpMul;phys[k].kd=physBase[k].kd*e.kpMul;}
var microSway=(_pn(t,0.5,21)+_pn(t,0.27,25)*0.5)*e.sway;var breathWave=Math.sin(t*e.freq)*e.breath*bm.breathBoost;_gazeUpdate(dt,t,emoMode);
phys.bodyZ.target=e.bodyZ+bm.bodyZ+microSway;phys.bodyX.target=e.bodyX+bm.bodyX+_pn(t,0.7,7)*0.004;
phys.spineY.target=e.spineY+bm.spineY+_pn(t,0.25,5)*0.015;phys.spineX.target=e.spineX+bm.spineX+_pn(t,0.6,6)*0.008;phys.spineZ.target=e.spineZ+bm.spineZ+microSway*0.5;
phys.headY.target=e.headY+bm.headY+_pn(t,0.3,1)*0.04+_pn(t,0.17,2)*0.02+_gz.x*0.22;phys.headX.target=e.headX+bm.headX+_pn(t,0.5,3)*0.015+params.age*0.08+_gz.y*0.12;phys.headZ.target=e.headZ+bm.headZ+_pn(t,0.4,4)*0.008;
phys.breath.target=breathWave+Math.sin(t*e.freq*2.1)*e.breath*0.3*bm.breathBoost;phys.chestY.target=_pn(t,0.3,16)*0.012;
phys.armRZ.target=e.armR+bm.armR+_pn(t,0.8,8)*0.025+Math.sin(t*e.freq)*0.015*bm.breathBoost;phys.armLZ.target=e.armL+bm.armL+_pn(t,0.8,9)*0.025-Math.sin(t*e.freq)*0.015*bm.breathBoost;
phys.armRX.target=e.armRX+bm.armRX+_pn(t,0.5,10)*0.018;phys.armLX.target=e.armLX+bm.armLX+_pn(t,0.5,11)*0.018;
phys.elbowR.target=e.elbowR+bm.elbowR+_pn(t,1.2,12)*0.015;phys.elbowL.target=e.elbowL+bm.elbowL+_pn(t,1.2,13)*0.015;
phys.hipRX.target=e.hipRX+bm.hipRX+_pn(t,0.6,14)*0.008;phys.hipLX.target=e.hipLX+bm.hipLX+_pn(t,0.6,15)*0.008;
phys.hipRZ.target=e.hipRZ+bm.hipRZ;phys.hipLZ.target=e.hipLZ+bm.hipLZ;
phys.kneeR.target=e.kneeR+bm.kneeR;phys.kneeL.target=e.kneeL+bm.kneeL;
var comHeight=trochanterY*0.7;var comOffX=Math.sin(phys.bodyX.current)*comHeight;var comOffZ=Math.sin(phys.bodyZ.current)*comHeight;var balStrength=(emoMode==='run')?0.2:1.0;
phys.ankleR.target=Math.max(-0.2,Math.min(0.5,bm.ankleR+comOffX*0.03*balStrength));phys.ankleL.target=Math.max(-0.2,Math.min(0.5,bm.ankleL+comOffX*0.03*balStrength));
phys.kneeR.target+=Math.max(0,comOffZ)*0.05*balStrength;phys.kneeL.target+=Math.max(0,-comOffZ)*0.05*balStrength;
phys.hipRZ.target+=comOffZ*0.02*balStrength;phys.hipLZ.target-=comOffZ*0.02*balStrength;phys.kneeR.target+=Math.max(0,comOffX)*0.03*balStrength;phys.kneeL.target+=Math.max(0,comOffX)*0.03*balStrength;
for(var k2 in phys)phys[k2].update(dt);
// DYNAMIC BODY HEIGHT — from TARGETS (instant, no PD lag) + CLAMP to preset minimum
var tHR=e.hipRX+bm.hipRX,tKR=e.kneeR+bm.kneeR,tHL=e.hipLX+bm.hipLX,tKL=e.kneeL+bm.kneeL;
var aYR=ankleYFromAngles(tHR,tKR),aYL=ankleYFromAngles(tHL,tKL);
var gY=footBelowAnkle-trochanterY-Math.min(aYR,aYL);
var pGY=footBelowAnkle-trochanterY-Math.min(ankleYFromAngles(e.hipRX,e.kneeR),ankleYFromAngles(e.hipLX,e.kneeL));
gY=Math.max(gY,pGY-0.5); // clamp: can rise above preset (jump/flight) but not sink more than 0.5 below
groundSmooth+=(gY-groundSmooth)*(1-Math.exp(-40*dt));
character.position.y=bodyPhys.y+groundSmooth;
character.rotation.x=phys.bodyX.current;character.rotation.z=phys.bodyZ.current;
torsoG.rotation.y=phys.spineY.current;torsoG.rotation.x=phys.spineX.current;torsoG.rotation.z=phys.spineZ.current;
headGroup.rotation.y=phys.headY.current;headGroup.rotation.x=phys.headX.current;headGroup.rotation.z=phys.headZ.current;
if(parts['arm1']){parts['arm1'].rotation.z=parts['arm1'].userData.baseRotZ+phys.armRZ.current;parts['arm1'].rotation.x=parts['arm1'].userData.baseRotX+phys.armRX.current;}
if(parts['arm-1']){parts['arm-1'].rotation.z=parts['arm-1'].userData.baseRotZ-phys.armLZ.current;parts['arm-1'].rotation.x=parts['arm-1'].userData.baseRotX+phys.armLX.current;}
if(parts['elbow1'])parts['elbow1'].rotation.x=-phys.elbowR.current;
if(parts['elbow-1'])parts['elbow-1'].rotation.x=-phys.elbowL.current;
if(parts['hip1']){parts['hip1'].rotation.x=phys.hipRX.current;parts['hip1'].rotation.z=phys.hipRZ.current;}
if(parts['hip-1']){parts['hip-1'].rotation.x=phys.hipLX.current;parts['hip-1'].rotation.z=phys.hipLZ.current;}
if(parts['knee1'])parts['knee1'].rotation.x=phys.kneeR.current;
if(parts['knee-1'])parts['knee-1'].rotation.x=phys.kneeL.current;
if(parts['ankle1'])parts['ankle1'].rotation.x=phys.ankleR.current;
if(parts['ankle-1'])parts['ankle-1'].rotation.x=phys.ankleL.current;
// V18.491.131 AUGEN_VIS.lab=gaze-iris
blinkTimer+=dt;var rate=Math.max(0.1,e.blinkRate);
if(blinkTimer>=_blkNext){blinkTimer=0;_blkNext=(0.55+Math.random()*0.95)/rate;_blkPh=0;}   // randomisierte intervalle: kein metronom-blinzeln mehr
if(_gz.blinkKick){_gz.blinkKick=false;if(_blkPh>0.1)_blkPh=0;}                             // sakkade loest blinzeln aus (menschlicher reflex)
var blink=1.0;
if(_blkPh<0.09){_blkPh+=dt;var _bf=Math.min(1,_blkPh/0.09);blink=_bf<0.45?1.0-(_bf/0.45)*0.7:0.3+((_bf-0.45)/0.55)*0.7;}
if(lidTL)lidTL.scale.y=0.35*blink;if(lidTR)lidTR.scale.y=0.35*blink;
var irisX=_gz.x*0.016+_pn(t,2.0+e.irisSpeed*2.0,22)*0.003;var irisY=_gz.y*0.010+_pn(t,1.6+e.irisSpeed*1.6,23)*0.002;if(irisL)irisL.position.set(irisX,irisY,0.08);if(irisR)irisR.position.set(irisX,irisY,0.08);
if(contactShadow){var bh=bodyPhys.y+groundSmooth;contactShadow.material.opacity=0.35*Math.max(0.1,1-bh*2);contactShadow.scale.setScalar(3.0*Math.max(0.3,1+bh*0.5));}
fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);controls.update();_poseGuard();stufeSchalten();tuchTakt(dt);composer.render();}

// GELENK-LIMITS (profi-rigging: "careful rigging"/joint limits): laeuft NACH jeder posen-quelle
// (emotion, kampf-combo, ninja-modus) und erzwingt anatomische envelopes -> der arm kann nicht
// mehr durch den eigenen torso, das knie nicht in den gegenschenkel. selbstkollision wird an der
// QUELLE verhindert statt hinterher kaschiert.
// GELENK-LIMITS v2: harte anatomische anschlaege + KAPSEL-PUSHOUT statt pauschal-abduktion.
// v1 erzwang mindest-abduktion bei gebeugtem ellbogen -- das brach hook-punch (schwingt ueber die
// mitte!) und die angst-emotion (arme kauern nach innen). menschen koennen gebeugte arme VOR den
// koerper fuehren, nur nicht IN ihn. also: torso-kapsel (hueft-mitte->kopf-gelenk, folgt der lehne, radius
// skaliert mit der taille) -- nur bei echter penetration wird der arm minimal herausrotiert.
var _pgV1,_pgV2,_pgV3,_pgM;                               // lazy-init im guard: immun gegen aufruf-reihenfolge
function _segPointDist(px,py,pz,ax,ay,az,bx,by,bz){var abx=bx-ax,aby=by-ay,abz=bz-az;
  var t=((px-ax)*abx+(py-ay)*aby+(pz-az)*abz)/((abx*abx+aby*aby+abz*abz)||1);t=t<0?0:(t>1?1:t);
  return Math.hypot(px-(ax+abx*t),py-(ay+aby*t),pz-(az+abz*t));}
function _poseGuard(){
  if(!_pgM){_pgM=new THREE.Matrix4();_pgV1=new THREE.Vector3();_pgV2=new THREE.Vector3();_pgV3=new THREE.Vector3();}
  ['1','-1'].forEach(function(sd){var s=(sd==='1')?1:-1;
    var a=parts['arm'+sd],e=parts['elbow'+sd],h=parts['hip'+sd],k=parts['knee'+sd];
    if(e){if(e.rotation.x<-2.5)e.rotation.x=-2.5;if(e.rotation.x>0.06)e.rotation.x=0.06;}    // beuge-anschlag + KEINE hyperextension
    if(a){if(s*a.rotation.z>2.95)a.rotation.z=s*2.95;                                        // ueberkopf-anschlag
      if(s*a.rotation.z<-0.9)a.rotation.z=s*-0.9;                                            // adduktion max ~51 grad ueber mitte (hug/hook/kauern LEGAL, unmoegliches nicht)
      if(a.rotation.x<-2.9)a.rotation.x=-2.9;if(a.rotation.x>0.95)a.rotation.x=0.95;}
    if(k){if(k.rotation.x<-0.06)k.rotation.x=-0.06;if(k.rotation.x>2.4)k.rotation.x=2.4;}    // knie: keine hyperextension
    if(h&&k){var kf=Math.max(0,k.rotation.x);
      var minSpread=0.02+0.06*Math.min(1,kf/1.2);
      if(s*h.rotation.z<minSpread)h.rotation.z=s*minSpread;
      if(h.rotation.x<-1.9)h.rotation.x=-1.9;if(h.rotation.x>0.6)h.rotation.x=0.6;}});
  // die Kapsel steht an den Gelenken des Gusses: von der Hüft-Mitte (hip1 · hip-1) zum Kopf-Gelenk (der Hals), ihr Halbmesser misst
  // die gezeigte Haut (torsoHalbmesser beim Guss — die fette Figur schiebt kauernde Arme weiter hinaus)
  if(!character||!parts.hip1||!parts['hip-1']||!parts.head)return;
  character.updateMatrixWorld(true);
  _pgM.copy(character.matrixWorld).invert();
  parts.hip1.getWorldPosition(_pgV1);parts['hip-1'].getWorldPosition(_pgV3);_pgV1.add(_pgV3).multiplyScalar(0.5).applyMatrix4(_pgM);
  parts.head.getWorldPosition(_pgV2);_pgV2.applyMatrix4(_pgM);
  ['1','-1'].forEach(function(sd){var s=(sd==='1')?1:-1,a=parts['arm'+sd],eG=parts['elbow'+sd],hnd=parts['hand'+sd];
    if(!a||!eG||!hnd)return;
    for(var it=0;it<2;it++){                              // 2 fixpunkt-iterationen genuegen
      eG.getWorldPosition(_pgV3);_pgV3.applyMatrix4(_pgM);
      var d1=_segPointDist(_pgV3.x,_pgV3.y,_pgV3.z,_pgV1.x,_pgV1.y,_pgV1.z,_pgV2.x,_pgV2.y,_pgV2.z);
      hnd.getWorldPosition(_pgV3);_pgV3.applyMatrix4(_pgM);
      var d2=_segPointDist(_pgV3.x,_pgV3.y,_pgV3.z,_pgV1.x,_pgV1.y,_pgV1.z,_pgV2.x,_pgV2.y,_pgV2.z);
      var pen=torsoR-Math.min(d1,d2);
      if(pen<=0.005)break;
      a.rotation.z+=s*pen*0.9;                            // abduktion oeffnet den kuerzesten weg nach draussen
      a.updateMatrixWorld(true);}});}                     // nur den arm-teilbaum nachziehen (parent-matrizen sind frisch)
// ===================== DER SPIEL-MODUS: DER NINJA-PARK IST DER SPIELPLATZ DER WELT (w4-koerper-park) =====================
// LABOR = WELT: der Leib bewegt sich nach DEMSELBEN Gesetz wie der Spieler der Welt — je fester Schritt (1/60 s) der EINE Plan
// (koerper-core `leibPlan`: Antrieb, Sprung, Wand- und Doppelsprung, Klettern, Rutsch, die Verben an den Geräten), die Vertikale
// (`leibImpuls` · `leibFall`) und die Erdung (`leibLandung`) in Metern unter der Erd-Schwere; der Kontakt des Labors (die Park-
// Boxen: die Substanz der Werke, KIND_POLICY) trägt die Kapsel des Leibs (LEIB.kapsel). Die Pose: der Gang-Takt und die Rig-Pose
// der Welt (`leibGangTakt` · `leibRigPose`, das Rig auf denselben Gelenken wie `_buildHumanoidRig`), die Luft (`leibLuftPose`)
// und je Verb und Phase der EINE Löser (`leibVerbPose`). Der Park: die acht Geräte des Fachwerks (fachwerk GERAETE, gebaut von
// `buildInstance`, ihr Angebot `geraetAngebot`) auf einem Spielplatz-Boden. Die Arcade-Zeile (NINJA_FEEL), die Hocke, der
// Hocke-Tunnel, der kurze Sprung beim Loslassen und die Feel-Schichten (Anlauf-Neigung, Kurven-Lage) fielen: die Welt kennt sie nicht.
var FC = window.__fachwerkCore;
if (!FC || !FC.GERAETE || typeof FC.geraetAngebotIn !== 'function' || typeof FC.buildInstance !== 'function') throw new Error('Kern-Pflicht: fachwerk GERAETE/geraetAngebotIn/buildInstance (das Labor stellt die Werke der Welt auf)');
['leibPlan','leibSitz','leibGlieder','leibSchwenk','leibSchwenkPunkt','leibImpuls','leibFall','leibLandung','leibRichtung','leibZustand','leibKette','leibMasse','leibWerte','leibAbdruck','leibSprungKraft','leibGangTakt','leibRigPose','leibLuftPose','leibVerbPose','leibGeraetAusschwingen','leibMassstab','leibSohle','leibPoseWinkel','leibSollUrteil'].forEach(function(f){if(typeof KC[f]!=='function')throw new Error('Kern-Pflicht: koerper '+f);});
var M_E = KC.leibMassstab();                 // Meter je Gelenk-Einheit: die Bühne in Metern, der Leib im Maß des Gusses
var G_WELT = KC.LEIB.sprung.refG;            // die Erd-Schwere (m/s²), dieselbe wie die Welt bei Spiel-Beginn
var KAPSEL = KC.LEIB.kapsel;                 // die Kapsel des Leibs (Sohle, Stufe, Haftung, Wand-Radius) — die der Welt
var _KAM = window.__koerperCore.bewegung.kamera;   // K06 — DER LEIB DER KAMERA: armRadiusM (die Kugel) + armRuhe (die Glättung) aus fx.bewegung.kamera
if (!_KAM || !isFinite(_KAM.armRadiusM) || !isFinite(_KAM.armRuhe)) throw new Error('Kern-Pflicht: koerper fx.bewegung.kamera');
// DER PLATZ (Meter, Gier): der Start bei 0/0 blickt nach +z; die Kletterwand und das Gerüst wenden ihre Front zum Start
var PARK_PLAN = [
  { id: 'schwebebalken', x: -3.5, z: 5.5, gier: 0 },
  { id: 'kletterwand', x: 0.5, z: 9.0, gier: Math.PI },
  { id: 'hangelbahn', x: 4.5, z: 6.5, gier: 0 },
  { id: 'turnreck', x: 8.5, z: 3.0, gier: 0 },
  { id: 'sprossengeruest', x: -8.0, z: 9.5, gier: Math.PI },
  { id: 'turmrutsche', x: -4.0, z: 14.5, gier: 0 },
  { id: 'doppelschaukel', x: 6.5, z: 13.5, gier: 0 },
  { id: 'balkenwippe', x: 0.5, z: 18.0, gier: 0 },
];
var parkTeile = [], parkAngebote = [], parkSchwenk = [], parkGroup = new THREE.Group();
parkGroup.visible = false; parkGroup.scale.setScalar(1 / M_E); scene.add(parkGroup);
// ein Punkt bzw. eine Richtung des Werks in den Welt-Rahmen (die Lage des Plans: Gier um y wie THREE rotation.y, die Höhe y)
function _parkPunkt(P, q) { var c = Math.cos(P.gier), s = Math.sin(P.gier); return [P.x + q[0] * c + q[2] * s, (P.y || 0) + q[1], P.z - q[0] * s + q[2] * c]; }
// DAS WERK ALS GESETZ (Daten, ohne Bild): seine Substanz (KIND_POLICY, die Teile der Kollision) und sein Angebot (`geraetAngebotIn`,
// dieselbe Platzierung wie die Welt) an der Lage des Plans {id, x, y, z, gier}
function parkSubstanz(P) {
  var art = FC.GERAETE[P.id].kind, sub = FC.KIND_POLICY[art].substanz;
  sub.parts.forEach(function (t) {
    var rx = (t.rotation && t.rotation.x) || 0;
    parkTeile.push({ c: _parkPunkt(P, [t.position.x, t.position.y, t.position.z]), h: [t.size.x / 2, t.size.y / 2, t.size.z / 2], gier: P.gier, rx: rx, tritt: !!t.tritt, werk: P.id });
  });
  FC.geraetAngebotIn(P.id, { x: P.x, y: P.y || 0, z: P.z, gier: P.gier, skala: 1 }).forEach(function (b) { b.werk = P.id; parkAngebote.push(b); });
}
function buildPark() {
  // der Boden des Spielplatzes (Fallschutz: Rindenmulch) — Oberkante y = 0
  var boden = new THREE.Mesh(new THREE.BoxGeometry(44, 1, 44), new THREE.MeshStandardMaterial({ color: 0x5b4a3a, roughness: 0.97, metalness: 0 }));
  boden.position.set(0, -0.5, 8); boden.receiveShadow = true; parkGroup.add(boden);
  parkTeile.push({ c: [0, -0.5, 8], h: [22, 0.5, 22], gier: 0, rx: 0, tritt: true });
  PARK_PLAN.forEach(function (P) {
    var g = FC.buildInstance(P.id, 1, 0);
    g.position.set(P.x, 0, P.z); g.rotation.y = P.gier;
    g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } if (o.userData && o.userData.__schwenk) parkSchwenk.push({ obj: o, plan: P, info: o.userData.__schwenk }); });
    parkGroup.add(g);
    parkSubstanz(P);
  });
  parkSchwenk.forEach(function (S) { S.ang = parkAngebote.find(function (a) { return a.werk === S.plan.id && a.teil === S.info.teil; }) || null; if (!S.ang) throw new Error('Labor: das schwingende Teil ' + S.info.teil + ' von ' + S.plan.id + ' hat kein Angebot'); });
}
// ein Welt-Punkt in den Rahmen der Box (Gier um y, dann Neigung rx um x)
function _boxLokal(b, p) { var dx = p[0] - b.c[0], dy = p[1] - b.c[1], dz = p[2] - b.c[2], cg = Math.cos(b.gier), sg = Math.sin(b.gier); var x = dx * cg - dz * sg, z = dx * sg + dz * cg, c = Math.cos(b.rx), s = Math.sin(b.rx); return [x, dy * c + z * s, -dy * s + z * c]; }
buildPark();
// DER LEIB DES SPIELS: der Zustand des EINEN Gesetzes (dieselben Felder wie der Wirt), die Lage (m, der Fuß-Punkt: die Sohle steht
// dort), Blick und Kamera, das Leben (Ausdauer), der Gang-Halter; die Werte der Seele (Tempo, Sprung, Masse) aus dem Gesetz des Leibs
var play = { on: false, cam: 'third', yaw: 0, pitch: 0.22, p: [0, 0, 0], t: 0, L: null, leben: { stamina: 100 }, halter: { walkPhase: 0 }, camX: 0, camY: 5, camZ: -9, lookX: 0, lookY: 3, lookZ: 0, fov: 35, fovBase: 35, posY: 0, vx: 0, vy: 0, vz: 0, onGround: true, faceYaw: 0, werte: null, masse: 0, kette: null, rig: null, M: null, Z: null, sohleY: 0 };
var keys = {};
var leibGruppe = new THREE.Group(); scene.add(leibGruppe); leibGruppe.rotation.order = 'YXZ';
// DIE VERB-TAFEL des Schritts aus den Tasten (dieselben Felder und Tasten wie die Welt: W/S vor, A/D quer — quer + = links, A —,
// Shift Sprint, Leertaste Sprung, C Rutsch und Sitz)
function playTafel() { if (vorf) return vorfTafel(); return { vor: (keys['KeyW'] ? 1 : 0) - (keys['KeyS'] ? 1 : 0), quer: (keys['KeyA'] ? 1 : 0) - (keys['KeyD'] ? 1 : 0), sprint: !!keys['ShiftLeft'], sprung: !!keys['Space'], rutsch: !!keys['KeyC'] }; }
addEventListener('keydown', function (ev) { if (!play.on) return; keys[ev.code] = true;
  if (ev.code === 'KeyV' && !ev.repeat) play.cam = (play.cam === 'third') ? 'fps' : 'third';
  if (ev.code === 'Escape') exitPlay();
  if (ev.code === 'KeyR' && !ev.repeat) resetRun();
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'KeyC'].indexOf(ev.code) >= 0) ev.preventDefault(); });
addEventListener('keyup', function (ev) { keys[ev.code] = false; });
document.addEventListener('mousemove', function (ev) { if (!play.on || document.pointerLockElement !== renderer.domElement) return;
  play.yaw -= ev.movementX * 0.0024; play.pitch = Math.max(-0.85, Math.min(0.85, play.pitch - ev.movementY * 0.0022)); });
// DIE GESTALT IM SPIEL: das Rig der Welt auf den Gelenken des Gusses (dieselbe Zuordnung wie `_buildHumanoidRig`), die Kette des
// Lösers, die Bein-Maße in Metern (wie `_gaitBeinMass`: Gelenk-Länge × Skala × Maßstab), die Gang-Zeile der Erd-Schwere, die
// Sohle der Ruhe-Pose (die tiefste Fläche der L0 wie `sohleY` der Welt), die Werte und die Masse der Seele
function playLeib() {
  var t = parts, need = ['mensch', 'torso', 'head', 'arm1', 'arm-1', 'elbow1', 'elbow-1', 'hand1', 'hand-1', 'hip1', 'hip-1', 'knee1', 'knee-1', 'ankle1', 'ankle-1'];
  need.forEach(function (n) { if (!t[n]) throw new Error('Labor: dem Guss fehlt das Gelenk ' + n + ' (das Rig der Welt)'); });
  play.rig = { hips: t.mensch, spine: t.torso, chest: t.torso, neck: t.head, head: t.head,
    armL: { shoulder: t.arm1, elbow: t.elbow1, wrist: t.hand1 }, armR: { shoulder: t['arm-1'], elbow: t['elbow-1'], wrist: t['hand-1'] },
    legL: { hip: t.hip1, knee: t.knee1, ankle: t.ankle1 }, legR: { hip: t['hip-1'], knee: t['knee-1'], ankle: t['ankle-1'] } };
  var sk = gestalt.sk, s = t.mensch.scale;
  // die Höhe des Sitzes und die Dicke der Glieder aus der gegossenen Haut (koerper `leibSitz` · `leibGlieder`, dieselbe Messung wie die Welt)
  play.kette = KC.leibKette(Object.assign({}, sk, { sitz: KC.leibSitz(gestalt.root, sk, t), glieder: KC.leibGlieder(gestalt.root, sk, t) })); play.masse = KC.leibMasse(sk); play.werte = KC.leibWerte(params);
  var l1 = t.knee1.position.length(), l2 = t.ankle1.position.length();
  play.M = { l1: l1, l2: l2, wpl: Math.abs(s.y) * M_E, wz: Math.abs(s.z) * M_E, L: (l1 + l2) * Math.abs(s.y) * M_E };
  play.Z = Object.assign({}, KC.bewegung.gang, { g: G_WELT });
  play.sohleY = gestalt.sohleY;
  // die Sohle des gebauten Fußes (koerper `leibSohle`, dieselbe Messung wie die Welt): [Spitze, Sohle, Ferse] im Knöchel-Raum
  play.sohle = { 1: KC.leibSohle(gestalt.root, t.ankle1), '-1': KC.leibSohle(gestalt.root, t['ankle-1']) };
  if (!play.sohle[1] || !play.sohle['-1']) throw new Error('Labor: der Guss trägt keine Haut am Knöchel (leibSohle)');
}
function enterPlay() {
  play.on = true; controls.enabled = false; parkGroup.visible = true; emoMode = 'play';
  playLeib();
  // der Leib zieht in die Gruppe des Spiels (die Lage in Metern über ihr), der Baum der Gestalt hängt unter ihr
  leibGruppe.add(gestalt.root); gestalt.root.position.set(0, -play.sohleY, 0);
  document.getElementById('ui').style.display = 'none'; document.getElementById('playHint').style.display = 'block'; document.getElementById('hud').style.display = 'block';
  play.fovBase = camera.fov; play.fov = camera.fov; resetRun();
  renderer.domElement.requestPointerLock();
}
function exitPlay() {
  play.on = false; controls.enabled = true; parkGroup.visible = false;
  scene.add(gestalt.root); gestalt.root.position.set(0, 0, 0); leibGruppe.position.set(0, 0, 0); leibGruppe.rotation.set(0, 0, 0);
  if (headGroup) headGroup.visible = true; if (typeof hairGroup !== 'undefined' && hairGroup) hairGroup.visible = true;
  character.position.set(0, 0, 0); character.rotation.set(0, 0, 0);
  document.getElementById('ui').style.display = ''; document.getElementById('playHint').style.display = 'none'; document.getElementById('hud').style.display = 'none'; camera.fov = play.fovBase; camera.updateProjectionMatrix();
  if (document.pointerLockElement) document.exitPointerLock(); emoMode = 'idle'; emo.set('idle'); controls.target.set(0, trochanterY, 0); controls.update();
}
function resetRun() {
  play.L = KC.leibZustand(); play.p = [0, 0, 0]; play.t = 0; play.yaw = 0; play.leben = { stamina: 100 }; play.halter = { walkPhase: 0 };
  play.L.lastGroundedTime = 0; play.amBoden = true;
  parkAngebote.forEach(function (a) { a.zustand = {}; });
  play.camX = 0; play.camY = 5; play.camZ = -9;
}
renderer.domElement.addEventListener('click', function () { if (play.on && document.pointerLockElement !== renderer.domElement) renderer.domElement.requestPointerLock(); });
document.getElementById('btnPlay').addEventListener('click', enterPlay);
// DER WIRT DES GESETZES im Labor (die Rückrufe des Plans): geerdet nach dem letzten Kontakt, am Steilhang kein Sprung (das Labor
// trägt keinen), der Abdruck aus Kraft und Masse unter der Erd-Schwere, der Kopfraum unter den Park-Boxen
function _playOrt(T) {
  var W = play.werte, L = play.L;
  return { tempo: T.sprint ? W.sprintSpeed : W.speed, gehTempo: W.speed, hang: 1, ritt: null, rittKAcc: null, rittKBrake: null, reitet: false, fahr: null, wasser: false, wasserKBrake: 0,
    leben: play.leben, angebote: parkAngebote, lage: play.p, mass: play.kette.mass, masse: play.masse, g: G_WELT,
    amBoden: function () { return play.amBoden; }, hangSprung: function () { return false; },
    abdruck: function () { return KC.leibAbdruck(KC.leibSprungKraft(W.jumpPower), play.masse, G_WELT); }, kopfraum: function () { return _kopfraum(); } };
}
function _kopfraum() {
  var top = play.p[1] + 2 * KAPSEL.fussM, best = Infinity;
  parkTeile.forEach(function (b) { if (b.rx) return; var l = _boxLokal(b, [play.p[0], top, play.p[2]]); if (Math.abs(l[0]) < b.h[0] && Math.abs(l[2]) < b.h[2] && l[1] < -b.h[1]) best = Math.min(best, -b.h[1] - l[1]); });
  return best;
}
// DER KONTAKT DES LABORS (die Kapsel des Leibs gegen die Park-Boxen, Meter): waagrecht schiebt jede Box, die das Band über der
// Stufe trifft, den Leib hinaus (die Normale ist die Wand-Wahrheit des Wandsprungs und des Kletterns, gestempelt mit der Uhr des
// Schritts), lotrecht trägt die höchste Oberkante im Band [Sohle − Haftung, Sohle + Stufe] — die Haftung nur, wer geerdet war
// die tiefste Stelle des Bands (Sohle + Stufe … Kopf, lotrecht bei x/z) in der Box: im Rahmen der Box ist das Band eine Strecke
// (lotrecht nur ohne Neigung), geschnitten mit ihrer Höhe; quer bleibt x, längs wandert z mit der Neigung — am tiefsten liegt die
// Strecke an einem ihrer Enden oder dort, wo sie die Mitte der Box kreuzt (z = 0). null: das Band trifft die Box nicht
function _bandTief(b, x, y0, y1, z) {
  var a = _boxLokal(b, [x, y0, z]), e = _boxLokal(b, [x, y1, z]), dy = e[1] - a[1], u0 = 0, u1 = 1;
  if (Math.abs(dy) < 1e-12) { if (Math.abs(a[1]) > b.h[1]) return null; }
  else { var ua = (-b.h[1] - a[1]) / dy, ub = (b.h[1] - a[1]) / dy; u0 = Math.max(0, Math.min(ua, ub)); u1 = Math.min(1, Math.max(ua, ub)); if (u0 > u1) return null; }
  var dz = e[2] - a[2], us = [u0, u1];
  if (Math.abs(dz) > 1e-12) { var uz = -a[2] / dz; if (uz > u0 && uz < u1) us.push(uz); }
  var best = null, bd = Infinity;
  for (var k = 0; k < us.length; k++) {
    var lz = a[2] + us[k] * dz, ex = Math.abs(a[0]) - b.h[0], ez = Math.abs(lz) - b.h[2];
    var d = ex > 0 && ez > 0 ? Math.hypot(ex, ez) : Math.max(ex, ez);
    if (d < bd) { bd = d; best = [a[0], lz]; }
  }
  return best;
}
// die Oberkante der Box lotrecht über x/z (ihre Deckfläche, am geneigten Teil eine Ebene), null außerhalb ihres Grundrisses (+ m)
function _boxOben(b, x, z, m) {
  var dx = x - b.c[0], dz = z - b.c[2], cg = Math.cos(b.gier), sg = Math.sin(b.gier), xg = dx * cg - dz * sg, zg = dx * sg + dz * cg;
  var c = Math.cos(b.rx), s = Math.sin(b.rx), dy = (b.h[1] - zg * s) / c, lz = (zg - b.h[1] * s) / c;
  if (Math.abs(xg) > b.h[0] + m || Math.abs(lz) > b.h[2] + m) return null;
  return b.c[1] + dy;
}
// das Band eines Teils: ein geneigtes Teil ohne Tritt (die Böcke der Schaukel, die Streben des Recks) trägt keine Stufe — es ist
// Wand für die ganze Kapsel; jedes andere ist Wand über der Stufe (darunter steigt der Leib auf es)
function _bandUnten(b) { return b.rx && !b.tritt ? 0.05 : KAPSEL.stufeM + 0.05; }
function playKontakt(dt) {
  var L = play.L, v = L.playerVel, R = KAPSEL.radiusM, p = play.p;
  var vy = KC.leibImpuls(L); vy = KC.leibFall(L, vy, -G_WELT, dt);
  var nx = p[0] + v.x() * dt, ny = p[1] + vy * dt, nz = p[2] + v.z() * dt, vx = v.x(), vz = v.z();
  for (var i = 0; i < parkTeile.length; i++) {
    var b = parkTeile[i], unten = _bandUnten(b);
    // das Band der Kapsel gegen die Box: ihre tiefste Stelle trägt die Normale (auch am geneigten Holz)
    var l = _bandTief(b, nx, ny + unten, ny + 2 * KAPSEL.fussM, nz);
    if (!l) continue;
    var ex = Math.abs(l[0]) - b.h[0], ez = Math.abs(l[1]) - b.h[2];
    if (ex >= R || ez >= R) continue;
    // kreuzt das Band die Mitte des Teils, schiebt es zur Seite, von der der Leib kam
    var sz = Math.sign(l[1]) || Math.sign(_boxLokal(b, [p[0], ny + unten, p[2]])[2]) || 1;
    var dxl, dzl;
    if (ex > 0 && ez > 0) { var d = Math.hypot(ex, ez); if (d >= R) continue; dxl = Math.sign(l[0]) * ex * (R - d) / d; dzl = sz * ez * (R - d) / d; }
    else if (ex > ez) { dxl = (Math.sign(l[0]) || 1) * (R - ex); dzl = 0; } else { dxl = 0; dzl = sz * (R - ez); }
    // längs des geneigten Teils verschiebt ein Meter waagrecht die Lage im Rahmen der Box um cos(Neigung)
    dzl /= Math.max(0.2, Math.cos(b.rx));
    var cg = Math.cos(b.gier), sg = Math.sin(b.gier), wx = dxl * cg + dzl * sg, wz = -dxl * sg + dzl * cg;
    nx += wx; nz += wz;
    var n = Math.hypot(wx, wz);
    if (n > 1e-9) { var ux = wx / n, uz = wz / n, vn = vx * ux + vz * uz; if (vn < 0) { vx -= vn * ux; vz -= vn * uz; } L._wandKontaktNx = ux; L._wandKontaktNz = uz; L._wandKontaktAt = L._simZeit; }
  }
  // die Decke: wer steigt (Sprung, Klettern an der Wand), stößt mit dem Kopf an die Unterkante einer Box über ihm
  if (vy > 0) {
    var kopf = ny + 2 * KAPSEL.fussM;
    for (var c2 = 0; c2 < parkTeile.length; c2++) {
      var D = parkTeile[c2]; if (D.rx) continue;
      var dl = _boxLokal(D, [nx, kopf, nz]), unterK = D.c[1] - D.h[1];
      if (Math.abs(dl[0]) < D.h[0] + R * 0.5 && Math.abs(dl[2]) < D.h[2] + R * 0.5 && kopf > unterK && p[1] + 2 * KAPSEL.fussM <= unterK + 1e-6) { ny = unterK - 2 * KAPSEL.fussM; vy = 0; }
    }
  }
  // die Auflage: die höchste Deckfläche im Band [Sohle − Haftung, Sohle + Stufe] — das gerade Teil eben, das geneigte Tritt-Teil
  // (die Bahn der Rutsche) über seine Ebene; ein geneigtes Teil ohne Tritt trägt nie
  var sup = -Infinity;
  for (var j = 0; j < parkTeile.length; j++) {
    var B = parkTeile[j]; if (B.rx && !B.tritt) continue;
    var yTop = _boxOben(B, nx, nz, R * 0.55);
    if (yTop !== null && yTop <= ny + KAPSEL.stufeM && yTop > sup) sup = yTop;
  }
  var am = false;
  if (vy <= 0.5 && sup > -Infinity) {
    var gap = ny - sup;
    if ((gap <= 0 && gap >= -KAPSEL.stufeM) || (gap > 0 && gap <= KAPSEL.haftM && play.amBoden)) { ny = sup; vy = 0; am = true; }
  }
  play.p = [nx, ny, nz]; L._fieldVy = vy; L.playerVel.setValue(vx, vy, vz); play.amBoden = am;
  KC.leibLandung(L, am, false, L._simZeit);
  if (ny < -25) resetRun();
}
// DER SCHRITT (1/60 s, wie FIXED_DT der Welt): Tafel → Richtung → Plan → (das Gerät führt die Lage | der Kontakt des Labors) →
// die wachen Geräte schwingen aus
function playSchritt(T, dt) {
  var L = play.L;
  L._simZeit = play.t;
  KC.leibRichtung(L, play.yaw, T.vor, T.quer);
  KC.leibPlan(L, T, _playOrt(T), play.t, dt);
  if (L.leibVerb && L.leibVerb.lage) { play.p = L.leibVerb.lage.slice(); play.amBoden = false; }
  else { if (L._verbLage) { play.p = L._verbLage; L._verbLage = null; } playKontakt(dt); }
  parkAngebote.forEach(function (a) { if (!L.leibVerb || L.leibVerb.ang !== a) KC.leibGeraetAusschwingen(a, G_WELT, dt); });
  play.t += dt;
}
// DIE POSE DES SCHRITTS: der Gang (die Phase des Gesetzes am Halter, das Tempo des Leibs), die Rig-Pose der Welt über der neutralen
// (absolut, wie `_animateHumanoidRig`), die Luft und je Verb der Löser; die Gruppe steht im Fuß-Punkt und blickt längs der Fahrt
function playPose(dt) {
  var L = play.L, r = play.rig, v = L.playerVel, sp = Math.hypot(v.x(), v.z()), V = L.leibVerb;
  [r.hips, r.spine, r.head].forEach(function (b) { b.rotation.set(0, 0, 0); });
  [r.armL, r.armR, r.legL, r.legR].forEach(function (side) { for (var k in side) side[k].rotation.set(0, 0, 0); });
  r.hips.position.set(0, r._baseHipY == null ? r.hips.position.y : r._baseHipY, 0); r.hips.quaternion.identity();
  var amGang = !V || V.verb === 'balancieren', tempo = amGang && !L.isInAir ? sp : 0;
  var gs = _TC.gangSchritt(tempo, play.M.L, play.Z);
  var gait = KC.leibGangTakt(_TC, play.halter, gs, tempo, dt, 1, Math.max(1, play.werte.speed), play.M.L);
  KC.leibRigPose(r, play.t, play.halter.walkPhase, tempo > 0.05, gait, KC.MOTION.idle, KC.MOTION.idle, play.M, play.Z, _TC);
  var lehne = KC.leibLuftPose(r, L, play.t);
  // die Gier des Leibs: im Verb die des Geräts, frei längs der Fahrt (gleitend), im Stand der Blick
  var ziel = V && V.gier != null ? V.gier : (sp > 0.3 ? Math.atan2(v.x(), v.z()) : null);
  if (ziel != null) { var d = ((ziel - play.faceYaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; play.faceYaw += V ? d : d * (1 - Math.pow(0.00016, dt)); }
  leibGruppe.position.set(play.p[0] / M_E, play.p[1] / M_E, play.p[2] / M_E);
  leibGruppe.rotation.set(lehne || 0, play.faceYaw, 0);
  var P = V ? KC.leibVerbPose(play.kette, L, play.t) : null;
  if (P) {
    // die Wurzel aus der Welt-Lage des Lösers (Meter) in den Rahmen ihres Eltern-Gelenks, die Glieder lokal
    leibGruppe.rotation.set(0, 0, 0); leibGruppe.updateMatrixWorld(true);
    var eltern = r.hips.parent, w = new THREE.Vector3(P.wurzel.p[0] / M_E, P.wurzel.p[1] / M_E, P.wurzel.p[2] / M_E);
    eltern.worldToLocal(w); r.hips.position.copy(w);
    var qe = new THREE.Quaternion(); eltern.getWorldQuaternion(qe);
    r.hips.quaternion.copy(qe.invert().multiply(new THREE.Quaternion().fromArray(P.wurzel.q)));
    for (var n in P.q) if (parts[n]) parts[n].quaternion.fromArray(P.q[n]);
  }
  // die schwingenden Teile der Geräte folgen ihrem Zustand (die Schaukel θ, die Wippe φ)
  parkSchwenk.forEach(function (S) { var z = S.ang.zustand, w2 = S.ang.verb === 'schaukeln' ? z.theta || 0 : z.phi || 0; S.obj.quaternion.setFromAxisAngle(new THREE.Vector3().fromArray(S.info.achse), w2); });
  // der alte Schnittstellen-Spiegel für Kamera und HUD (Labor-Einheiten)
  play.posY = play.p[1] / M_E; play.vx = v.x(); play.vy = v.y(); play.vz = v.z(); play.onGround = play.amBoden;
  return P;
}
function playHud() {
  var h = document.getElementById('hud'); if (!h || !play.on) return;
  var L = play.L, V = L.leibVerb, v = L.playerVel, sp = Math.hypot(v.x(), v.z());
  var verb = V ? V.verb : L._parkourSlide ? 'rutschen (Boden)' : L._parkourKletter > 0 ? 'klettern (Wand)' : L.isInAir ? (L._airJumps ? 'Doppelsprung' : 'Sprung') : sp > play.werte.speed * 1.5 ? 'laufen' : sp > 0.1 ? 'gehen' : 'stehen';
  var tempo = V && isFinite(V.tempo) ? V.tempo : sp;
  var s = verb + (V ? ' · Phase ' + V.phase : '') + ' · ' + tempo.toFixed(2) + ' m/s · Ausdauer ' + Math.round(play.leben.stamina);
  // das Instrument: die Winkel der Pose (links), nach der Vorführung das Urteil des Kerns gegen VERB_SOLL
  var w = messung && play.winkel; if (w) s += ' · Knie ' + w.knieL.toFixed(0) + '° Hüfte ' + w.huefteL.toFixed(0) + '° Ellbogen ' + w.ellbogenL.toFixed(0) + '° Schulter ' + w.schulterL.toFixed(0) + '°';
  if (play.urteil && !vorf) s += play.urteil.length ? ' · Vorführung: ' + play.urteil.length + ' Verstöße — ' + play.urteil[0] : ' · Vorführung: jedes Verb im Soll';
  if (h.textContent !== s) h.textContent = s;
}
function playTakt(dt) {
  var T = playTafel();
  playSchritt(T, dt);
  play.leben.stamina = Math.min(100, play.leben.stamina + (play.L.leibVerb || play.L._parkourKletter > 0 ? 0 : 8 * dt));
  var P = playPose(dt);
  leibGruppe.updateMatrixWorld(true);
  if (messung) playMessen(P);
  playKamera(dt);
  playHud();
  if (vorf) vorfWeiter();
}
// ===================== DAS INSTRUMENT DER BEWEGUNG (w4-koerper-park: das Labor misst den Leib) =====================
// Je Takt die Winkel der gezeigten Pose (koerper `leibPoseWinkel`) je Verb und Phase, am Gerät die Hand am Anker und die Sohle
// des gebauten Fußes (koerper `leibSohle`) gegen seine Teile, die Tempi, beim Sprint die Kapsel gegen jedes Teil (das Band des
// Kontakts); das Urteil spricht der Kern (`leibSollUrteil` gegen VERB_SOLL) — das HUD zeigt die Winkel der Phase, die
// Vorführung fährt jedes Verb an seinem Gerät (der Knopf; headless `playVorfuehrung(true)`).
var messung = null, vorf = null, _V3 = new THREE.Vector3(), _GELENKE = ['mensch', 'head', 'hip1', 'hip-1', 'knee1', 'knee-1', 'ankle1', 'ankle-1', 'arm1', 'arm-1', 'elbow1', 'elbow-1', 'hand1', 'hand-1'];
function _wm(v) { return [v.x * M_E, v.y * M_E, v.z * M_E]; }
function _wl(n, l) { return _wm(l ? parts[n].localToWorld(_V3.set(l[0], l[1], l[2])) : parts[n].getWorldPosition(_V3)); }
// die Tiefe eines Punkts (m) in einem Teil des Parks (> 0: im Teil; auf der Tritt-Fläche steht er)
function _teilTiefe(b, p) { var l = _boxLokal(b, p); return b.tritt && l[1] >= b.h[1] - 0.01 ? -1 : Math.min(b.h[0] - Math.abs(l[0]), b.h[1] - Math.abs(l[1]), b.h[2] - Math.abs(l[2])); }
function _ankerAbstand(a, p) { var best = Infinity, d3 = function (q) { return Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]); };
  (a.griff || []).forEach(function (q) { best = Math.min(best, d3(q)); });
  (a.holme || []).forEach(function (h) { var A = h[0], ab = [h[1][0] - A[0], h[1][1] - A[1], h[1][2] - A[2]], u = Math.max(0, Math.min(1, ((p[0] - A[0]) * ab[0] + (p[1] - A[1]) * ab[1] + (p[2] - A[2]) * ab[2]) / (ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2]))); best = Math.min(best, d3([A[0] + ab[0] * u, A[1] + ab[1] * u, A[2] + ab[2] * u])); });
  return best; }
// der Name eines Angebots im Urteil: Werk, Verb, schwingendes Teil
function _angName(a) { return a.werk + ' ' + a.verb + (a.teil && a.verb === 'schaukeln' ? ' ' + a.teil : ''); }
// DIE HAUT GEGEN DAS GERÄT (w4-koerper-park, „kein Durchgreifen“): die Proben der gegossenen Haut (L0 ohne Augen, ein Punkt je 2-cm-Zelle
// der Bind-Lage, je Punkt sein tragender Knochen) — im Takt gehäutet (r128 `boneTransform`, dieselbe Rechnung wie der Shader) und gegen
// jedes Teil des Werks geprüft: die Substanz (Pfosten, Wand, Sprossen, Bahn) und die Teile am Leib aus dem Angebot (Sitz, Kette, Hebel,
// Hangel-Sprossen; was schwingt, steht an der Lage seines Zustands, koerper `leibSchwenk`). Die greifende Hand umschließt ihre Stange:
// ein Teil, dessen zwei kleine Maße ≤ 6 cm sind und das die Mitte der Hand oder einen ihrer Anker (um 3 cm) trägt, zählt für die
// Punkte dieser Hand nicht.
var _REGION = { mensch: 'Rumpf', torso: 'Rumpf', head: 'Kopf', arm: 'Oberarm', elbow: 'Unterarm', hand: 'Hand', hip: 'Oberschenkel', knee: 'Unterschenkel', ankle: 'Fuß' };
function _hautProben() {
  if (gestalt.__proben) return gestalt.__proben;
  var vox = 0.02 / M_E, liste = [], _bv = new THREE.Vector3();
  gestalt.l0.forEach(function (n) {
    if (/eye|iris|pupil/.test(n.userData.__klasse || '')) return;
    var pa = n.geometry.attributes.position, si = n.geometry.attributes.skinIndex, sw = n.geometry.attributes.skinWeight, zellen = {};
    for (var i = 0; i < pa.count; i++) {
      var key = Math.round(pa.getX(i) / vox) + ',' + Math.round(pa.getY(i) / vox) + ',' + Math.round(pa.getZ(i) / vox);
      if (zellen[key]) continue; zellen[key] = 1;
      var bone = null;
      if (n.isSkinnedMesh) { var bw = -1, ws = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)], is = [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)]; for (var c = 0; c < 4; c++) if (ws[c] > bw) { bw = ws[c]; bone = n.skeleton.bones[is[c]].name; } }
      else { var o = n.parent; while (o && !_REGION[o.name.replace(/-?1$/, '')]) o = o.parent; bone = o ? o.name : 'mensch'; }
      var basis = bone.replace(/-?1$/, ''), seite = /-1$/.test(bone) ? '-1' : /1$/.test(bone) ? '1' : '';
      // die Ecke im Bind-Raum (bindMatrix × Ecke) und ihre vier Gewichte — der Takt häutet sie wie der Shader (r128 boneTransform)
      _bv.set(pa.getX(i), pa.getY(i), pa.getZ(i)); if (n.isSkinnedMesh) _bv.applyMatrix4(n.bindMatrix);
      liste.push({ n: n, i: i, region: _REGION[basis] + (seite ? ' ' + seite : ''), hand: basis === 'hand' ? 'hand' + seite : null, bv: [_bv.x, _bv.y, _bv.z],
        si: n.isSkinnedMesh ? [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)] : null, sw: n.isSkinnedMesh ? [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)] : null });
    }
  });
  gestalt.__proben = liste;
  return liste;
}
function _teilName(t) { return (t.werk ? 'Teil' : 'Teil am Leib') + ' ' + t.h.map(function (x) { return (2 * x).toFixed(2); }).join('×') + ' m'; }
function _hautGegenGeraet(V, D) {
  var proben = _hautProben(), werk = V.ang.werk, teile = [];
  // je Teil seine Mitte an der Lage dieses Takts und der Halbmesser seiner Kugel (die Vorprüfung: nur Punkte in ihr rechnen den Rahmen)
  parkTeile.forEach(function (b) { if (b.werk === werk) teile.push({ b: b, S: null, m: b.c, r: Math.hypot(b.h[0], b.h[1], b.h[2]) }); });
  parkAngebote.forEach(function (a) { if (a.werk !== werk || !a.teile) return; var S = KC.leibSchwenk(a), U = S ? { p: S.p, ax: S.ax, w: -S.w } : null;
    a.teile.forEach(function (b) { teile.push({ b: b, S: U, m: S ? KC.leibSchwenkPunkt(S, b.c) : b.c, r: Math.hypot(b.h[0], b.h[1], b.h[2]) }); }); });
  // die Stangen, die eine Hand umschließt: ihre Mitte oder einer ihrer Anker (der Griff, den sie hält, den sie verlässt, den sie
  // erreicht — klettern `halt`/`von`/`ziel`, hangeln `griff`/`wechsel.griff`) liegt in ihr, um 3 cm
  var umgriff = {};
  ['hand1', 'hand-1'].forEach(function (h) { var anker = [_wl(h, gestalt.sk.handMitte[h])];
    if (V.verb === 'klettern') [V.halt, V.von, V.ziel].forEach(function (A) { if (A && A[h]) anker.push(A[h]); });
    if (V.verb === 'hangeln') { if (V.griff && V.griff[h]) anker.push(V.griff[h]); if (V.wechsel && V.wechsel.hand === h) anker.push(V.wechsel.griff); }
    umgriff[h] = teile.filter(function (T) { var b = T.b, hs = b.h.slice().sort(function (x, y) { return x - y; }); if (hs[1] > 0.03) return false;
      return anker.some(function (c) { var l = _boxLokal(b, T.S ? KC.leibSchwenkPunkt(T.S, c) : c); return Math.abs(l[0]) < b.h[0] + 0.03 && Math.abs(l[1]) < b.h[1] + 0.03 && Math.abs(l[2]) < b.h[2] + 0.03; }); }); });
  // je Haut einmal im Takt: A_b = matrixWorld × bindMatrixInverse × Knochen-Welt × boneInverse (dieselbe Folge wie boneTransform)
  var mats = new Map(), Mx = new THREE.Matrix4(), Mo = new THREE.Matrix4();
  gestalt.l0.forEach(function (n) { if (!n.isSkinnedMesh) return; Mo.multiplyMatrices(n.matrixWorld, n.bindMatrixInverse);
    mats.set(n, n.skeleton.bones.map(function (b, k) { return Mx.multiplyMatrices(b.matrixWorld, n.skeleton.boneInverses[k]).premultiply(Mo).elements.slice(); })); });
  for (var j = 0; j < proben.length; j++) {
    var q = proben[j], x = q.bv[0], y = q.bv[1], z = q.bv[2], p;
    if (q.si) { var A = mats.get(q.n), X = 0, Y = 0, Z = 0;
      for (var k = 0; k < 4; k++) { var wk = q.sw[k]; if (!wk) continue; var e = A[q.si[k]]; X += wk * (e[0] * x + e[4] * y + e[8] * z + e[12]); Y += wk * (e[1] * x + e[5] * y + e[9] * z + e[13]); Z += wk * (e[2] * x + e[6] * y + e[10] * z + e[14]); }
      p = [X * M_E, Y * M_E, Z * M_E]; }
    else { var e2 = q.n.matrixWorld.elements; p = [(e2[0] * x + e2[4] * y + e2[8] * z + e2[12]) * M_E, (e2[1] * x + e2[5] * y + e2[9] * z + e2[13]) * M_E, (e2[2] * x + e2[6] * y + e2[10] * z + e2[14]) * M_E]; }
    for (var t = 0; t < teile.length; t++) {
      var T = teile[t], b = T.b, dm0 = p[0] - T.m[0], dm1 = p[1] - T.m[1], dm2 = p[2] - T.m[2];
      if (dm0 * dm0 + dm1 * dm1 + dm2 * dm2 > T.r * T.r) continue;
      if (q.hand && umgriff[q.hand].indexOf(T) >= 0) continue;
      var l = _boxLokal(b, T.S ? KC.leibSchwenkPunkt(T.S, p) : p), e = Math.min(b.h[0] - Math.abs(l[0]), b.h[1] - Math.abs(l[1]), b.h[2] - Math.abs(l[2]));
      if (e > D.durch) { D.durch = e; D.durchWo = q.region + ' in ' + _teilName(b) + ' auf ' + (p[1] - V.ang.boden).toFixed(2) + ' m, Phase ' + V.phase; }
    }
  }
}
function playMessen(P) {
  var L = play.L, V = L.leibVerb, M = messung, S = vorf && vorf.szene, G = {}, w;
  _GELENKE.forEach(function (n) { G[n] = _wl(n); });
  var q = parts.mensch.getWorldQuaternion(new THREE.Quaternion()), f = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  // die Zeile: am Gerät Verb und Phase, frei die Art der Szene (die Luft nach dem Sprung, die Hocke, der Abstoß)
  var t = play.t, zeile = V ? V.verb + ':' + V.phase : S && S.frei && (!S.ab || vorf.n >= S.ab) ? (L.isInAir ? (t - (L._wandSprungAt || -Infinity) < KC.VERB_POSE.kickSec ? 'wandsprung:0' : t - (L._doppelSprungAt || -Infinity) < KC.VERB_POSE.tuckSec ? 'doppelsprung:0' : 'springen:' + (L.playerVel.y() > 0 ? 1 : 2)) : S.frei === 'springen' ? null : S.frei + ':0') : null;
  // am Gerät trägt jedes Angebot seine Zeilen (die Verben an JEDEM Gerät), frei die Messung
  var D = V && S ? M.geraete[V.ang.id] || (M.geraete[V.ang.id] = { name: _angName(V.ang), verb: V.verb, posen: 0, zeilen: {}, hand: 0, handWo: null, fuss: -Infinity, fussWo: null, durch: -Infinity, durchWo: null, griffe: {} }) : null;
  if (zeile) { w = KC.leibPoseWinkel(G, [f.x, f.y, f.z]); var ZZ = D ? D.zeilen : M.zeilen, Z = ZZ[zeile] || (ZZ[zeile] = { n: 0, w: {} }); Z.n++;
    for (var k in w) { var b = Z.w[k] || (Z.w[k] = [Infinity, -Infinity]); b[0] = Math.min(b[0], w[k]); b[1] = Math.max(b[1], w[k]); } play.winkel = w;
    // der Griff: die Hand des Paars, die an einen neuen Anker greift — ihr Ellbogen an seinem Tiefpunkt im Schwung
    if (D && V.verb === 'klettern' && V.paar >= 0) { var gh = V.paar === 0 ? 'hand1' : 'hand-1';
      if (_umgreift(V, gh)) { var gk = V.seitGlied.toFixed(4) + gh, ge = w[gh === 'hand1' ? 'ellbogenL' : 'ellbogenR'], GR = D.griffe[gk];
        if (!GR || ge < GR.w) D.griffe[gk] = { w: ge, wo: gh + ' Phase ' + V.phase + ' bei ' + play.t.toFixed(2) + ' s' }; } } }
  if (D) {
    D.posen++;
    if (D.posen % 3 === 1) _hautGegenGeraet(V, D);
    ['hand1', 'hand-1'].forEach(function (h) {
      // die Stand-Hände: im Kreuzgang greift eine um, am Holm die wechselnde
      if (!P || (V.verb === 'klettern' && _seitePaar(V, h) && _umgreift(V, h)) || (V.verb === 'hangeln' && V.wechsel && V.wechsel.hand === h)) return;
      var d = V.verb === 'klettern' || V.verb === 'hangeln' ? _ankerAbstand(V.ang, _wl(h, gestalt.sk.handMitte[h])) : P.fehler[h];
      if (d > D.hand) { D.hand = d; D.handWo = h + ' Phase ' + V.phase; } });
    ['1', '-1'].forEach(function (s) { var so = play.sohle[s];
      [[so[2], 'Ferse'], [play.kette.ballenZ, 'Ballen'], [so[0], 'Spitze']].forEach(function (z) { var p = _wl('ankle' + s, [0, -so[1], z[0]]);
        parkTeile.forEach(function (b) { if (b.werk !== V.ang.werk) return; var e = _teilTiefe(b, p); if (e > D.fuss) { D.fuss = e; D.fussWo = z[1] + ' ankle' + s + ' Phase ' + V.phase; } }); }); });
  }
  // NP-03 DIE KAMERA HAT EINEN LEIB (K06): nach dem Einschwingen jeder Szene steht sie in keinem Teil des Parks (um KAMERA_RAND
  // Lab-Maß), und zwischen Blickziel und Kamera liegt keins (die eigene Strecken-Probe, nie die des Lösers)
  if (S && vorf.n >= 60 && play.cam === 'third') { var K = M.kamera, wer = null, c = _wm(camera.position), Lk = _wm({ x: play.blick[0], y: play.blick[1], z: play.blick[2] }); K.takte++;
    parkTeile.forEach(function (b) { if (wer) return; var P = _boxLokal(b, c), A = _boxLokal(b, Lk), r = KAMERA_RAND * M_E, t0 = 0, t1 = 1, a;
      for (a = 0; a < 3 && Math.abs(P[a]) < b.h[a] + r; a++);
      if (a === 3) return (wer = 'Kamera in ' + (b.werk || 'Boden'));
      for (a = 0; a < 3; a++) { var D = P[a] - A[a]; if (Math.abs(D) < 1e-12) { if (Math.abs(A[a]) > b.h[a]) return; continue; } var u = (-b.h[a] - A[a]) / D, v = (b.h[a] - A[a]) / D; t0 = Math.max(t0, Math.min(u, v)); t1 = Math.min(t1, Math.max(u, v)); if (t0 > t1) return; }
      wer = (b.werk || 'Boden') + ' zwischen Ziel und Kamera'; });
    if (wer) { K.fehl++; if (!K.erste) K.erste = S.name + ' Takt ' + vorf.n + ': ' + wer; } }
  if (S && S.kapsel && !V) { var C = M.kapsel[S.name] || (M.kapsel[S.name] = { tief: 0, wo: null }), u = KAPSEL.stufeM + 0.05;
    parkTeile.forEach(function (b) { var un = b.rx && !b.tritt ? 0.05 : u; for (var i = 0; i <= 5; i++) { var h = un + i / 5 * (2 * KAPSEL.fussM - un), l = _boxLokal(b, [play.p[0], play.p[1] + h, play.p[2]]);
      if (Math.abs(l[1]) > b.h[1]) continue; var pen = KAPSEL.radiusM - Math.hypot(Math.max(0, Math.abs(l[0]) - b.h[0]), Math.max(0, Math.abs(l[2]) - b.h[2]));
      if (pen > C.tief) { C.tief = pen; C.wo = (b.werk || 'Boden') + ' ' + h.toFixed(2) + ' m'; } } }); }
}
// die Hand des Paars greift wirklich um (ihr Ziel ist nicht ihr Griff — sonst hält sie, während der Fuß des Paars umsetzt)
function _umgreift(V, h) { var a = V.von && V.von[h], b = V.ziel && V.ziel[h]; return !!(a && b && Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) > 1e-6); }
// die Hand der schwingenden Seite (der Kreuzgang: Paar 0 = Hand 1 + Fuß −1, Paar 1 = Hand −1 + Fuß 1)
function _seitePaar(V, h) { return (V.paar === 0 && h === 'hand1') || (V.paar === 1 && h === 'hand-1'); }
// DIE VORFÜHRUNG: je Szene der Ort (aus dem Angebot des Werks im Park), die Gier, die Tasten je Takt-Strecke (W A S D, + Umschalt,
// ^ Leertaste, C), die Hooks des Anfangs, des Takts und des Endes; das Ende trägt die Tempi in die Messung
function _ang(werk, verb, teil) { return parkAngebote.find(function (a) { return a.werk === werk && a.verb === verb && (!teil || a.teil === teil); }); }
function _vor(a, d) { var n = a.normale; return [a.flaeche[0] + n[0] * d, 0, a.flaeche[2] + n[1] * d]; }
// das Klettern: hinauf, auf halber Höhe hält der Leib (die Phase des Haltens an jedem Gerät), dann weiter — das Tempo misst den Stieg
function _klettert(werk) { return { name: 'klettern ' + werk, geraet: 'klettern ' + werk, ort: function () { var a = _ang(werk, 'klettern'); return { p: _vor(a, 0.4), gier: Math.atan2(-a.normale[0], -a.normale[1]) }; }, skript: [[40, 'W'], [40, ''], [560, 'W']],
  takt: function (st) { if (play.L.leibVerb && vorf.tasten === 'W') (st.v = st.v || []).push(play.L.leibVerb.tempo); }, ende: function (st) { (messung.tempo.klettern = messung.tempo.klettern || []).push(st.v ? st.v.reduce(function (x, y) { return x + y; }, 0) / st.v.length : NaN); } }; }
function _sprint(name, x, z, gier) { return { name: name, kapsel: true, ort: function () { return { p: [x, 0, z], gier: gier }; }, skript: [[150, 'W+']], ende: function () { messung.kapsel[name] = Object.assign(messung.kapsel[name] || { tief: 0 }, { weg: Math.hypot(play.p[0] - x, play.p[2] - z) }); } }; }
var VORFUEHRUNG = [
  { name: 'schaukeln', geraet: 'schaukeln', ort: function () { var a = _ang('doppelschaukel', 'schaukeln', 'sitz0'); return { p: [a.sitz[0], 0, a.sitz[2] + 0.3], gier: 0 }; }, skript: [[1, 'C'], [2, ''], [720, 'W'], [1, ''], [720, '']],
    takt: function (st) { var V = play.L.leibVerb; if (!V) return; var z = V.ang.zustand; if (vorf.n === 724) { z.theta = 0.25; z.omega = 0; st.nd = []; st.prev = 0.25; }
      if (st.nd) { if (st.prev < 0 && z.theta >= 0) st.nd.push(play.t); st.prev = z.theta; } },
    ende: function (st) { var a = _ang('doppelschaukel', 'schaukeln', 'sitz0'), Lp = a.achse.a[1] - a.sitz[1] - KC.VERB_GESETZ.schaukeln.sitzSchwerpunktM;
      messung.tempo.periode = [st.nd && st.nd.length > 1 ? (st.nd[st.nd.length - 1] - st.nd[0]) / (st.nd.length - 1) : NaN, 2 * Math.PI * Math.sqrt(Lp / G_WELT)]; } },
  { name: 'rutschen', geraet: 'rutschen', ort: function () { var a = _ang('turmrutsche', 'rutschen'); return { p: [a.bahn[0][0], a.podest, a.bahn[0][2] - 0.15], gier: 0 }; }, skript: [[1, 'C'], [600, '']],
    takt: function (st) { var V = play.L.leibVerb; if (V) st.vmax = Math.max(st.vmax || 0, V.tempo); else if (st.vmax && st.aus == null) st.aus = Math.hypot(play.L.playerVel.x(), play.L.playerVel.z()); },
    ende: function (st) { messung.tempo.rutscheMax = [st.vmax]; messung.tempo.rutscheAusgang = [st.aus]; } },
  { name: 'wippen', geraet: 'wippen', ort: function () { var a = _ang('balkenwippe', 'wippen'); return { p: [a.sitz[0][0], 0, a.sitz[0][2] + 0.3], gier: 0 }; }, skript: [[1, 'C'], [60, ''], [1, '^'], [90, '']],
    takt: function (st) { var V = play.L.leibVerb; if (V) { st.phi = Math.max(st.phi || 0, Math.abs(V.ang.zustand.phi)); st.max = V.ang.phiMax; } }, ende: function (st) { messung.tempo.wippe = [st.phi, st.max]; } },
  // der zweite Sitz der Doppelschaukel (jedes Angebot jedes Geräts): aufsitzen, anschwingen, ausschwingen
  { name: 'schaukeln sitz1', geraet: 'schaukeln', ort: function () { var a = _ang('doppelschaukel', 'schaukeln', 'sitz1'); return { p: [a.sitz[0], 0, a.sitz[2] + 0.3], gier: 0 }; }, skript: [[1, 'C'], [2, ''], [360, 'W'], [1, ''], [240, '']] },
  _klettert('sprossengeruest'), _klettert('kletterwand'), _klettert('turmrutsche'),
  { name: 'hangeln', geraet: 'hangeln hangelbahn', ort: function () { var h = _ang('hangelbahn', 'hangeln').holme[0]; return { p: [(h[0][0] + h[1][0]) / 2, 0, h[0][2]], gier: 0 }; }, skript: [[1, '^'], [60, '^'], [360, 'W']],
    takt: function (st) { if (play.L.leibVerb && !st.p0) { st.p0 = play.p.slice(); st.t0 = play.t; } }, ende: function (st) { messung.tempo.hangeln = [st.p0 ? Math.hypot(play.p[0] - st.p0[0], play.p[2] - st.p0[2]) / (play.t - st.t0) : NaN]; } },
  { name: 'reck', geraet: 'hangeln turnreck', ort: function () { var h = _ang('turnreck', 'hangeln').holme[0]; return { p: [(h[0][0] + h[1][0]) / 2, 0, h[0][2]], gier: 0 }; }, skript: [[1, '^'], [60, '^'], [240, 'A']],
    takt: function (st) { if (play.L.leibVerb && !st.p0) { st.p0 = play.p.slice(); st.t0 = play.t; } }, ende: function (st) { messung.tempo.hangelnQuer = [st.p0 ? Math.hypot(play.p[0] - st.p0[0], play.p[2] - st.p0[2]) / (play.t - st.t0) : NaN]; } },
  { name: 'balancieren', geraet: 'balancieren', ort: function () { var b = _ang('schwebebalken', 'balancieren').bahn[0]; return { p: [b[0], b[1], b[2] + 0.3], gier: 0 }; }, skript: [[2, 'W'], [180, 'W+']],
    takt: function (st) { if (play.L.leibVerb) st.v = Math.max(st.v || 0, play.L.leibVerb.tempo); }, ende: function (st) { messung.tempo.balancieren = [st.v]; } },
  { name: 'gehen', frei: 'gehen', ab: 60, ort: function () { return { p: [14, 0, -12], gier: 0 }; }, skript: [[300, 'W']], ende: function () { messung.tempo.gehen = [Math.hypot(play.L.playerVel.x(), play.L.playerVel.z())]; } },
  { name: 'laufen', frei: 'laufen', ab: 60, ort: function () { return { p: [14, 0, -12], gier: 0 }; }, skript: [[300, 'W+']], ende: function () { messung.tempo.laufen = [Math.hypot(play.L.playerVel.x(), play.L.playerVel.z())]; } },
  { name: 'springen', frei: 'springen', ort: function () { return { p: [16, 0, 0], gier: 0 }; }, skript: [[10, ''], [1, '^'], [120, '']], takt: function (st) { st.h = Math.max(st.h || 0, play.p[1]); }, ende: function (st) { messung.tempo.sprungHoehe = [st.h]; } },
  { name: 'doppelsprung', frei: 'springen', ort: function () { return { p: [16, 0, 4], gier: 0 }; }, skript: [[10, ''], [1, '^'], [12, ''], [1, '^'], [60, '']], takt: function () { if (play.L._doppelSprungAt != null) messung.doppel = true; } },
  { name: 'wandsprung', frei: 'springen', ort: function () { return { p: [16, 0, 8], gier: 0 }; }, skript: [[10, ''], [1, '^'], [8, ''], [1, '^'], [40, '']],
    takt: function () { if (vorf.n === 18) Object.assign(play.L, { _wandKontaktNx: 0, _wandKontaktNz: -1, _wandKontaktAt: play.t }); if (play.L._wandSprungAt != null) messung.wand = true; } },
  // NP-02 DIE GERÄTE HALTEN: der Sprint gegen Wand, Turm, Bock und Pfosten (die Kapsel des Kontakts, gate:kamera-laub)
  _sprint('Rücken der Kletterwand', 0.5, 13, Math.PI), _sprint('Turm der Rutsche', -7.5, 14.5, Math.PI / 2), _sprint('Bock der Schaukel', 2.5, 12.8, Math.PI / 2), _sprint('Pfosten der Hangel-Leiter', 2.4, 1.5, 0),
];
function vorfTafel() { var t = vorf.tasten || ''; if (typeof t === 'object') return Object.assign({ vor: 0, quer: 0, sprint: false, sprung: false, rutsch: false }, t); return { vor: (t.indexOf('W') >= 0 ? 1 : 0) - (t.indexOf('S') >= 0 ? 1 : 0), quer: (t.indexOf('A') >= 0 ? 1 : 0) - (t.indexOf('D') >= 0 ? 1 : 0), sprint: t.indexOf('+') >= 0, sprung: t.indexOf('^') >= 0, rutsch: t.indexOf('C') >= 0 }; }
// die nächste Szene: der Leib frisch an ihrem Ort (resetRun), die Strecken ihres Skripts der Reihe nach
function vorfSzene(i) { var S = (vorf.liste || VORFUEHRUNG)[i]; vorf.i = i; vorf.szene = S; vorf.n = 0; vorf.st = {}; vorf.k = 0; vorf.rest = S ? S.skript[0][0] : 0; if (!S) return;
  resetRun(); var o = S.ort(); play.p = o.p.slice(); play.yaw = play.faceYaw = o.gier; vorf.tasten = S.skript[0][1]; }
function vorfWeiter() { var S = vorf.szene; if (!S) return; if (S.takt) S.takt(vorf.st); vorf.n++;
  if (--vorf.rest > 0) return; if (++vorf.k < S.skript.length) { vorf.rest = S.skript[vorf.k][0]; vorf.tasten = S.skript[vorf.k][1]; return; }
  if (S.ende) S.ende(vorf.st); vorfSzene(vorf.i + 1); if (!vorf.szene) { vorf = null; resetRun(); play.urteil = KC.leibSollUrteil(messung); } }
// headless (sofort): die ganze Vorführung in einem Zug, die Messung zurück; der Knopf zeigt sie Takt für Takt
function playVorfuehrung(sofort, liste) { if (!play.on) enterPlay(); messungNeu(); vorf = { liste: liste || null }; vorfSzene(0); if (sofort) { while (vorf) playTakt(1 / 60); return messung; } return null; }
// Lab-Maß: der Rand um jedes Teil, in dem die Kamera nie steht — der Leib der Kamera (armRadiusM) bis auf die Bisektion des Lösers
// (10 Schritte, ≤ 1 % des Rands)
var KAMERA_RAND = _KAM.armRadiusM * 0.97;
function messungNeu() { messung = { zeilen: {}, geraete: {}, angebote: parkAngebote.map(function (a) { return { id: a.id, name: _angName(a) }; }), tempo: {}, kapsel: {}, kamera: { takte: 0, fehl: 0, erste: null }, doppel: false, wand: false }; return messung; }
document.getElementById('btnVorfuehrung').addEventListener('click', function () { playVorfuehrung(false); });
function _clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
function _mix(a, b, t) { return a + (b - a) * t; }
// DIE KAMERA GEGEN DIE WAHRE GESTALT (K06): die Strecke p + d·t (t 0..1, Labor-Maß) gegen das Teil b — im Rahmen des Teils (Gier
// und Neigung, wie der Kontakt), um r aufgeblasen: der Eintritt t, Infinity ohne Schnitt (Slab); eine geneigte Planke ist eine
// Planke, nie ihre Achsen-Box (der Blick des Rutschenden lag in der Box der ganzen Bahn)
function _kamSeg(px, py, pz, dx, dy, dz, b, r) { var P = _boxLokal(b, [px * M_E, py * M_E, pz * M_E]), Q = _boxLokal(b, [(px + dx) * M_E, (py + dy) * M_E, (pz + dz) * M_E]), t0 = 0, t1 = 1;
  for (var a = 0; a < 3; a++) { var D = Q[a] - P[a], lo = -b.h[a] - r * M_E, hi = b.h[a] + r * M_E; if (Math.abs(D) < 1e-12) { if (P[a] < lo || P[a] > hi) return Infinity; continue; } var u = (lo - P[a]) / D, v = (hi - P[a]) / D; if (u > v) { var q = u; u = v; v = q; } if (u > t0) t0 = u; if (v < t1) t1 = v; if (t0 > t1) return Infinity; }
  return t0; }
// der Punkt steht frei: in keinem Teil, um r aufgeblasen (Labor-Maß)
function _kamFrei(x, y, z, r) { for (var i = 0; i < parkTeile.length; i++) { var b = parkTeile[i], l = _boxLokal(b, [x * M_E, y * M_E, z * M_E]); if (Math.abs(l[0]) < b.h[0] + r * M_E && Math.abs(l[1]) < b.h[1] + r * M_E && Math.abs(l[2]) < b.h[2] + r * M_E) return false; } return true; }
// DIE KAMERA DES SPIELS (Labor-Einheiten; K06 DIE KAMERA HAT EINEN LEIB, NP-03): hinter dem Blick, über der Schulter, die Strecke
// Blickziel → Kamera gegen jede Park-Box um armRadiusM (in Labor-Maß) aufgeblasen; die Kamera hält vor dem ersten Eintritt
function playKamera(dt) {
  var c = leibGruppe.position, sp = Math.hypot(play.vx, play.vz) / M_E, R = _KAM.armRadiusM;
  var fT = play.fovBase + _clamp(sp / 18, 0, 1) * 7; play.fov += (fT - play.fov) * (1 - Math.pow(0.02, dt));
  if (Math.abs(camera.fov - play.fov) > 0.02) { camera.fov = play.fov; camera.updateProjectionMatrix(); }
  if (play.cam === 'third') {
    if (headGroup) headGroup.visible = true;
    var lead = Math.min(sp * 0.10, 2.2);
    var ltx = c.x + Math.sin(play.faceYaw) * lead - Math.cos(play.yaw) * 0.65, lty = c.y + 3.15, ltz = c.z + Math.cos(play.faceYaw) * lead + Math.sin(play.yaw) * 0.65;
    var dist = 11.6 + sp * 0.14, ldx = Math.sin(play.yaw) * Math.cos(play.pitch), ldy = Math.sin(play.pitch), ldz = Math.cos(play.yaw) * Math.cos(play.pitch);
    var shX = -Math.cos(play.yaw) * 1.75, shZ = Math.sin(play.yaw) * 1.75;
    var icx = c.x - ldx * dist + shX, icy = c.y + 3.85 - ldy * dist, icz = c.z - ldz * dist + shZ;
    var ks = 1 - Math.pow(_KAM.armRuhe, dt);
    play.camX = _mix(play.camX, icx, ks); play.camY = _mix(play.camY, icy, ks); play.camZ = _mix(play.camZ, icz, ks);
    play.lookX = _mix(play.lookX, ltx, ks * 1.4); play.lookY = _mix(play.lookY, lty, ks * 1.4); play.lookZ = _mix(play.lookZ, ltz, ks * 1.4);
    var kbx = c.x, kbz = c.z, klx = play.lookX - kbx, klz = play.lookZ - kbz, ks2 = 1;
    for (var i = 0; i < parkTeile.length; i++) { var h0 = _kamSeg(kbx, play.lookY, kbz, klx, 0, klz, parkTeile[i], R + 0.01); if (h0 > 0 && h0 < ks2) ks2 = h0; }
    var LX = kbx + klx * ks2, LY = play.lookY, LZ = kbz + klz * ks2;
    // der Blickpunkt liegt nie in einem Teil: hinkt die Glättung durch eins (der Ausstieg oben aufs Podest versetzt den Leib), springt
    // er auf sein Soll über dem Leib
    if (!_kamFrei(LX, LY, LZ, 0)) { LX = play.lookX = ltx; LY = play.lookY = lty; LZ = play.lookZ = ltz; }
    var kdx = play.camX - LX, kdy = play.camY - LY, kdz = play.camZ - LZ, kt = 1;
    for (var j = 0; j < parkTeile.length; j++) { var b = parkTeile[j], h = _kamSeg(LX, LY, LZ, kdx, kdy, kdz, b, R); if (h === 0) { h = _kamSeg(LX, LY, LZ, kdx, kdy, kdz, b, 0); h = h === 0 ? Infinity : Math.max(0, h - R / Math.hypot(kdx, kdy, kdz)); } if (h < kt) kt = h; }
    if (!_kamFrei(LX + kdx * kt, LY + kdy * kt, LZ + kdz * kt, R)) { var klo = 0, khi = kt; for (var k = 0; k < 10; k++) { var km = (klo + khi) / 2; if (_kamFrei(LX + kdx * km, LY + kdy * km, LZ + kdz * km, R)) klo = km; else khi = km; } kt = klo; }
    camera.position.set(LX + kdx * kt, LY + kdy * kt, LZ + kdz * kt); camera.lookAt(LX, LY, LZ); play.blick = [LX, LY, LZ];
  } else {
    if (headGroup) headGroup.visible = false;
    var hp = new THREE.Vector3(); headGroup.getWorldPosition(hp);
    camera.position.set(hp.x, hp.y + 0.15, hp.z);
    var lx = Math.sin(play.yaw) * Math.cos(play.pitch), ly = Math.sin(play.pitch), lz = Math.cos(play.yaw) * Math.cos(play.pitch);
    camera.lookAt(hp.x + lx, hp.y + 0.15 + ly, hp.z + lz);
  }
}
// ===================== END PLAY SYSTEM =====================
var BUILD='B64·benchmark';console.log('%cDA VINCI BUILD '+BUILD,'color:#7fd;font-weight:bold');
(function(){var d=document.createElement('div');d.id='buildtag';d.textContent=BUILD;d.style.cssText='position:fixed;right:8px;bottom:6px;font:10px monospace;color:#9fb2c8;opacity:.45;z-index:99;pointer-events:none;';document.body.appendChild(d);})();
animate();addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});

/* ==================== DIE BRÜCKE ZUR HEIMAT (die Hülle, K41) ==================== */
/* EINE Brücke (../huelle/huelle.js): die DSL spricht die ECHTEN UI-Pfade — die acht Bewegungs-/Emotions-Profile leben
   als #emotions-Buttons (data-e, click() → emo.set), "zufall"/"zuruecksetzen" klicken btnRandom/btnReset (exakt der
   Nutzer-Pfad). DSL-Wörter deutsch (Registry == Brücke wortgleich). Esc meldet die Heimkehr — im Ninja-Park-Spielmodus
   gehört Esc dem exitPlay, die Brücke schweigt dort. */
(function () {
    var EMOTION = {
        entspannt: "idle",
        freude: "joy",
        trauer: "sad",
        wut: "angry",
        angst: "fear",
        rennen: "run",
        kampf: "fight",
        showcase: "showcase",
    };
    AnazhHuelle.bruecke({
        welt: "koerperstudio",
        // DAS ZIEL-BILD (D8): die Hülle rendert diese Welt als Panorama aus dem Blick ihrer Kamera — die Tor-Membran der Heimat zeigt es
        panorama: function () {
            return { THREE: THREE, renderer: renderer, scene: scene, kamera: camera };
        },
        label: "Da Vinci Studio — Lebendiger Mensch",
        dsl: Object.keys(EMOTION).concat(["zufall", "zuruecksetzen"]),
        wort: function (w) {
            if (EMOTION[w]) {
                var b = document.querySelector('#emotions button[data-e="' + EMOTION[w] + '"]');
                if (b) b.click();
            } else if (w === "zufall") document.getElementById("btnRandom").click();
            else if (w === "zuruecksetzen") document.getElementById("btnReset").click();
        },
        esc: function () {
            return !(typeof play !== "undefined" && play && play.on); /* Esc = Ninja-Park verlassen (exitPlay) */
        },
        /* DAS WERK DER BÜHNE (der EINE Übergabe-Kanal der Hülle): die Dials und Wahlen des Gusses (Saat 0 wie `gussOv`) —
           die Welt prägt den Avatar damit; der Knopf steht nur im Portal. */
        werk: function () {
            return { kind: "koerper", preset: Object.keys(window.__koerperCore.PRESETS)[0], seed: 0, ov: Object.assign({}, params) };
        },
        werkOrt: document.getElementById("werkOrt"),
    });
})();
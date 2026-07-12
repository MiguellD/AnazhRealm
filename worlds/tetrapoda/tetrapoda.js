var presets=__tetrapodaCore.GATTUNGEN;   // GESTALT-DIALS — leben seit W-A6 im Kern ../../tetrapoda-core.js (EINE Quelle, sha256-Beleg im Wellen-Bericht)
var emoMode='idle';
var scene,camera,renderer,composer,fxaa,cinePass,controls,clock;
var wolf,furInstanced,matFur,matStrand,matStrandDk,matStrandLt;
var ribcage,belly,mane,throat,larynx,larynxUp,waist,flank,lowerAbd;
var gluteL,gluteR,quadL,quadR,hamL,hamR,tricepL,tricepR,deltL,deltR,gastroL,gastroR;
var headGroup,jawGroup,earL,earR,lidTL,lidTR,tailSegs=[],spineSegs=[],neckSegs=[];
var legFL,legFR,legHL,legHR,shoulderL,shoulderR,tailRoot;
var flU,flL,flP,frU,frL,frP,hlT,hlC,hlP,hrT,hrC,hrP;
var H,sY,hY,sZ,hZ,lv,by,tv,bt,P={};
var _geomCache={},furStrands=[];
var legNames=[['legFL','flU','flL','flP'],['legFR','frU','frL','frP'],['legHL','hlT','hlC','hlP'],['legHR','hrT','hrC','hrP']];
var groundMesh,contactShadow;
var _fp=new THREE.Vector3();
var pawOffsets=[0,0,0,0];
function PD(kp,kd){this.target=0;this.current=0;this.vel=0;this.kp=kp;this.kd=kd;}
PD.prototype.update=function(dt){var f=(this.target-this.current)*this.kp-this.vel*this.kd;this.vel+=f*dt;this.current+=this.vel*dt;return this.current;};
var cpgPhase=[0,0,0,0],cpgFreq=0;
var cpgCoupling=__tetrapodaCore.CPG_COUPLING;   // Kern-Quelle (W-A6)
function updateCPG(dt){/* ULTRAGUSS U4: das Gang-Netz-Gesetz wohnt im Kern. */__tetrapodaCore.cpgStep(cpgPhase,cpgFreq,cpgCoupling,dt);}
var bodyPhys={y:0,vy:0,vx:0,pitch:0,pitchVel:0};
function updateBodyPhysics(dt){
  var e=emo.cur;
  if(e.stride<0.002){bodyPhys.y*=0.6;bodyPhys.vy*=0.5;bodyPhys.vx*=0.8;bodyPhys.pitch*=0.7;bodyPhys.pitchVel*=0.7;return;}
  var support=0,fwdForce=0;
  for(var i=0;i<4;i++){var st=Math.max(0,-Math.sin(cpgPhase[i]));support+=st;if(st>0)fwdForce+=st*Math.cos(cpgPhase[i])*e.stride*30;}
  var targetY=-Math.max(0,1.5-support)*0.022*H*e.tension;
  var dy=targetY-bodyPhys.y;
  bodyPhys.vy+=dy*140*dt;bodyPhys.vy*=0.72;bodyPhys.y+=bodyPhys.vy*dt;
  if(bodyPhys.y<-0.04*H){bodyPhys.y=-0.04*H;if(bodyPhys.vy<0)bodyPhys.vy=0;}
  bodyPhys.vx+=fwdForce*dt;bodyPhys.vx*=0.85;
  bodyPhys.pitchVel+=(bodyPhys.vx*0.012-bodyPhys.pitch)*10*dt;
  bodyPhys.pitchVel*=0.82;bodyPhys.pitch+=bodyPhys.pitchVel*dt;
}
var standPose=__tetrapodaCore.STAND_POSE;   // Kern-Quelle (W-A6)
var phys={
  legPDs:{},spineZ:[],spineX:[],neckZ:[],neckX:[],neckY:[],
  headY:null,headX:null,headZ:null,tailPDs:[],
  earL:null,earR:null,jawPD:null,shoulderLPD:null,shoulderRPD:null,
  init:function(){
    var n=['legFL','flU','flL','flP','legFR','frU','frL','frP','legHL','hlT','hlC','hlP','legHR','hrT','hrC','hrP'];
    for(var i=0;i<n.length;i++)this.legPDs[n[i]]=new PD(250,15);
    this.spineZ=[];this.spineX=[];
    for(var i=0;i<spineSegs.length;i++){this.spineZ.push(new PD(80,8));this.spineX.push(new PD(80,8));}
    this.neckZ=[];this.neckX=[];this.neckY=[];
    for(var i=0;i<neckSegs.length;i++){this.neckZ.push(new PD(60,6));this.neckX.push(new PD(60,6));this.neckY.push(new PD(35,4));}
    this.headY=new PD(50,6);this.headX=new PD(50,6);this.headZ=new PD(20,3);
    this.tailPDs=[];for(var i=0;i<tailSegs.length;i++)this.tailPDs.push({y:new PD(100,10),x:new PD(50,5),z:new PD(35,4)});
    this.earL=new PD(55,5);this.earR=new PD(55,5);this.jawPD=new PD(80,8);
    this.shoulderLPD=new PD(120,10);this.shoulderRPD=new PD(120,10);
    this.legZPDs={};var lzn=['legFL','legFR','legHL','legHR'];for(var i=0;i<lzn.length;i++)this.legZPDs[lzn[i]]=new PD(150,10);
    this.spineY=[];for(var i=0;i<spineSegs.length;i++)this.spineY.push(new PD(60,6));
    this.neckYR=[];for(var i=0;i<neckSegs.length;i++)this.neckYR.push(new PD(40,4));
    this._prevSt=[0,0,0,0];cpgPhase=[0,0,0,0];bodyPhys={y:0,vy:0,vx:0,pitch:0,pitchVel:0};
    var sp=standPose,si=0;
    for(var li=0;li<4;li++){
      this.legPDs[n[si]].current=sp[li][0];this.legPDs[n[si]].target=sp[li][0];this.legPDs[n[si]].vel=0;
      this.legPDs[n[si+1]].current=sp[li][1];this.legPDs[n[si+1]].target=sp[li][1];this.legPDs[n[si+1]].vel=0;
      this.legPDs[n[si+2]].current=sp[li][2];this.legPDs[n[si+2]].target=sp[li][2];this.legPDs[n[si+2]].vel=0;
      this.legPDs[n[si+3]].current=sp[li][3];this.legPDs[n[si+3]].target=sp[li][3];this.legPDs[n[si+3]].vel=0;
      si+=4;
    }
  }
};
var emo={
  cur:{freq:0.25,stride:0,bodyX:0,bodyZ:0,headX:-0.01,headY:0,ear:0.15,tailAmp:0.10,tailRate:0.5,tension:0.9,bob:0.002,sway:0.006,kpMul:1.0},
  tgt:null,name:'idle',behTimer:0,behType:null,behStart:0,
  presets:__tetrapodaCore.MOTION,   // BEWEGUNGS-PROFILE — das motion-Feld lebt im Kern (W-A6, EINE Quelle; Nachlese-Welle heilte den W-A6-Alias [presets war doppelt geschachtelt -> emo.set warf])
  set:function(name){this.tgt=this.presets[name];this.name=name;this.behTimer=0;this.behType=null;if(this.tgt.phases)cpgPhase=this.tgt.phases.slice();},
  update:function(dt,t){
    if(!this.tgt)return;var c=this.cur,g=this.tgt,l=0.05;
    c.freq+=(g.freq-c.freq)*l;c.stride+=(g.stride-c.stride)*l;c.bodyX+=(g.bodyX-c.bodyX)*l;c.bodyZ+=(g.bodyZ-c.bodyZ)*l;c.headX+=(g.headX-c.headX)*l;c.headY+=(g.headY-c.headY)*l;c.ear+=(g.ear-c.ear)*l;c.tailAmp+=(g.tailAmp-c.tailAmp)*l;c.tailRate+=(g.tailRate-c.tailRate)*l;c.tension+=(g.tension-c.tension)*l;c.bob+=(g.bob-c.bob)*l;c.sway+=(g.sway-c.sway)*l;c.kpMul+=(g.kpMul-c.kpMul)*l;
    this.behTimer+=dt;
    if(this.name==='joy'){var jb=['playbow','bound','spin','prance','hop'];if(this.behTimer>2.0+Math.random()*2.0){this.behTimer=0;this.behType=jb[Math.floor(Math.random()*jb.length)];this.behStart=t;}}
    else if(this.name==='hunt'){var hb=['pounce','freeze','stalk','hop','circle'];if(this.behTimer>1.2+Math.random()*1.5){this.behTimer=0;this.behType=hb[Math.floor(Math.random()*hb.length)];this.behStart=t;}}
    else if(this.name==='flee'){if(Math.random()<dt*0.12&&this.behType===null){this.behType='lookback';this.behStart=t;}else if(Math.random()<dt*0.06&&this.behType===null){this.behType='zigzag';this.behStart=t;}else if(Math.random()<dt*0.04&&this.behType===null){this.behType='circle';this.behStart=t;}}
    else if(this.name==='alert'){var ab=['scan','snap','earflick'];if(this.behTimer>3+Math.random()*4){this.behTimer=0;this.behType=ab[Math.floor(Math.random()*ab.length)];this.behStart=t;}}
    else if(this.name==='idle'){var ib=['relax','shake','lookaround','sniff','yawn'];if(this.behTimer>5+Math.random()*8){this.behTimer=0;this.behType=ib[Math.floor(Math.random()*ib.length)];this.behStart=t;}}
    else if(this.name==='showcase'){this.behType='showcase';}
  },
  getBeh:function(t){
    var m={bodyX:0,bodyZ:0,bodyRotY:0,bodyRotZ:0,headX:0,headY:0,headZ:0,tailBoost:1,tailDir:0,tailZ:0,legOv:null,freqOv:null,impulseY:0,impulseX:0,jawBoost:0,earBoost:0,spineBoost:0,muscleBoost:0,pounceY:0};var pt;
    if(this.behType==='playbow'){pt=(t-this.behStart)/1.2;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.bodyX=0.22*i;m.headX=-0.20*i;m.tailBoost=1+4*i;m.jawBoost=0.03*i;m.spineBoost=0.6*i;return m;}
    if(this.behType==='bound'){pt=t-this.behStart;if(pt>0.4){this.behType=null;return m;}var i=Math.sin(pt/0.4*Math.PI);m.legOv=-0.30*i;m.impulseY=0.06*i;m.bodyX=-0.05*i;m.spineBoost=0.4*i;m.jawBoost=0.03*i;return m;}
    if(this.behType==='hop'){pt=t-this.behStart;if(pt>0.6){this.behType=null;return m;}if(pt<0.10){var i=pt/0.10;m.legOv=-0.40*i;m.bodyX=0.15*i;m.muscleBoost=0.3*i;return m;}if(pt<0.14){m.legOv=0.65;m.impulseY=0.18;m.impulseX=0.10;m.bodyX=-0.08;m.spineBoost=-0.3;return m;}if(pt<0.40){var ft=(pt-0.14)/0.26;m.pounceY=Math.sin(ft*Math.PI)*0.06*H;m.legOv=0.15;m.spineBoost=-0.1+Math.sin(ft*Math.PI)*0.2;return m;}var ft2=(pt-0.40)/0.20;m.legOv=-0.20*(1-ft2);m.bodyX=0.06*(1-ft2);return m;}
    if(this.behType==='spin'){pt=(t-this.behStart)/1.5;if(pt>=1){this.behType=null;return m;}m.bodyRotY=Math.sin(pt*Math.PI*2)*0.9;m.legOv=Math.sin(pt*Math.PI*4)*0.12;m.tailBoost=1+Math.sin(pt*Math.PI*2)*0.6;m.headY=Math.sin(pt*Math.PI*2)*0.35;m.spineBoost=0.5;return m;}
    if(this.behType==='prance'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.headX=0.10*i;m.bodyZ=0.03*Math.sin(pt*Math.PI*10)*i;m.tailBoost=1+3*i;m.spineBoost=0.4*i;m.jawBoost=0.03*i;m.legOv=Math.sin(pt*Math.PI*6)*0.08*i;return m;}
    if(this.behType==='pounce'){pt=t-this.behStart;if(pt<0.28){var i=pt/0.28;m.legOv=-0.75*i;m.bodyX=0.28*i;m.headX=-0.18*i;m.freqOv=0;m.muscleBoost=0.6*i;m.spineBoost=-0.3*i;return m;}else if(pt<0.32){m.legOv=1.0;m.impulseY=0.35;m.impulseX=0.22;m.bodyX=-0.14;m.headX=0.05;m.muscleBoost=0.8;m.spineBoost=0.5;return m;}else if(pt<0.75){var ft=(pt-0.32)/0.43;m.pounceY=Math.sin(ft*Math.PI)*0.15*H;m.legOv=0.12;m.bodyX=-0.05;m.headX=-0.05;m.spineBoost=-0.2+Math.sin(ft*Math.PI)*0.4;return m;}else if(pt<1.0){var lt=(pt-0.75)/0.25;m.legOv=-0.30*(1-lt);m.bodyX=0.12*(1-lt);m.headX=-0.08*(1-lt);m.spineBoost=-0.15*(1-lt);return m;}else{this.behType=null;return m;}}
    if(this.behType==='circle'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}var ang=pt*Math.PI*2;m.bodyRotY=Math.sin(ang)*0.7;m.bodyZ=Math.sin(ang)*0.03;m.headY=-Math.sin(ang)*0.2;m.spineBoost=0.25;m.tailDir=Math.sin(ang)*0.05;return m;}
    if(this.behType==='freeze'){pt=t-this.behStart;if(pt>1.8){this.behType=null;return m;}var fi=1-Math.min(1,pt*4);m.freqOv=0.001*fi;m.legOv=0;m.muscleBoost=0.4*fi;m.headX=-0.06*fi;return m;}
    if(this.behType==='stalk'){pt=(t-this.behStart)/3;if(pt>=1){this.behType=null;return m;}m.bodyX=0.12;m.headX=-0.10+Math.sin(pt*Math.PI*3)*0.03;m.headY=Math.sin(pt*Math.PI*2)*0.12;m.muscleBoost=0.25;return m;}
    if(this.behType==='lookback'){pt=t-this.behStart;if(pt>0.6){this.behType=null;return m;}var i=Math.sin(pt/0.6*Math.PI);m.headY=0.55*i;m.headX=0.04*i;m.bodyRotY=0.18*i;return m;}
    if(this.behType==='zigzag'){pt=(t-this.behStart)/1.2;if(pt>=1){this.behType=null;return m;}m.bodyRotY=Math.sin(pt*Math.PI*3)*0.30;m.bodyZ=Math.sin(pt*Math.PI*3)*0.025;m.spineBoost=0.35;return m;}
    if(this.behType==='scan'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}m.headY=Math.sin(pt*Math.PI*2)*0.40;m.headX=-0.04+Math.sin(pt*Math.PI)*0.04;return m;}
    if(this.behType==='snap'){pt=t-this.behStart;if(pt>1.5){this.behType=null;return m;}if(pt<0.1){m.headY=0.45*(Math.random()>0.5?1:-1);m.earBoost=0.12;}return m;}
    if(this.behType==='earflick'){pt=t-this.behStart;if(pt>0.5){this.behType=null;return m;}m.earBoost=0.15*Math.sin(pt/0.5*Math.PI);return m;}
    if(this.behType==='relax'){pt=(t-this.behStart)/5;if(pt>=1){this.behType=null;return m;}m.headX=0.005;m.headY=Math.sin(pt*Math.PI)*0.02;return m;}
    if(this.behType==='shake'){pt=(t-this.behStart)/1.2;if(pt>=1){this.behType=null;return m;}var si=Math.sin(pt*Math.PI);m.bodyRotZ=Math.sin(t*28)*0.08*si;m.headZ=Math.sin(t*28)*0.05*si;m.spineBoost=0.6*si;m.earBoost=-0.06*si;return m;}
    if(this.behType==='lookaround'){pt=(t-this.behStart)/4;if(pt>=1){this.behType=null;return m;}m.headY=Math.sin(pt*Math.PI*2)*0.30;m.headX=Math.sin(pt*Math.PI)*0.03-0.01;return m;}
    if(this.behType==='sniff'){pt=(t-this.behStart)/2;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.headX=0.15*i+Math.sin(pt*Math.PI*8)*0.03;m.jawBoost=0.015*i;return m;}
    if(this.behType==='yawn'){pt=(t-this.behStart)/2.5;if(pt>=1){this.behType=null;return m;}var i=Math.sin(pt*Math.PI);m.jawBoost=0.14*i;m.headX=-0.04*i;return m;}
    if(this.behType==='showcase'){m.headY=Math.sin(t*0.12)*0.45;m.headX=Math.sin(t*0.12*0.7+0.5)*0.06-0.02;m.headZ=Math.sin(t*0.12*0.5)*0.025;m.tailBoost=1.4;return m;}
    return m;
  }
};
function sphGeo(r,segs){segs=segs||48;var k=Math.round(r*1000);if(!_geomCache[k])_geomCache[k]=new THREE.SphereGeometry(r,segs,segs);return _geomCache[k];}
function s(r,m,sc){var me=new THREE.Mesh(sphGeo(r),m);if(sc)me.scale.set(sc[0],sc[1],sc[2]);me.castShadow=true;me.receiveShadow=true;return me;}
function boneSph(r,len,m){return s(r,m,[0.92,len/(2*r),0.92]);}
function cH(rt,rb,h,m){var me=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,10),m);me.castShadow=true;return me;}
function getStrandGeo(len,thick){var k=Math.round(len*1000)+'_'+Math.round(thick*10000);if(!_geomCache[k]){var w=thick*1.8,wt=Math.max(0.001,thick*0.65),l=len;var p=[-w,0,0,w,0,0,wt,-l,0,-wt,-l,0,0,0,-w,0,0,w,0,-l,wt,0,-l,-wt];var i=[0,1,2,0,2,3,4,5,6,4,6,7];var sy=[0,0,1,1,0,0,1,1];var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('aStrandY',new THREE.Float32BufferAttribute(sy,1));g.setIndex(i);g.computeVertexNormals();_geomCache[k]=g;}return _geomCache[k];}
function addStrand(pos,dir,len,thick,mat){var qlen=Math.round((len+Math.random()*0.015)/0.004)*0.004;var geo=getStrandGeo(qlen,thick);var quat=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),dir.clone().normalize());furStrands.push({pos:pos.clone(),quat:quat,mat:mat,geoId:geo.uuid,geo:geo});}
function fuzz(c,r,sc,d,density,len,thick,mat){for(var i=0;i<density;i++){var phi=Math.random()*Math.PI,theta=Math.random()*Math.PI*2;if(Math.cos(phi)<-0.05)continue;var pos=new THREE.Vector3(r*sc[0]*Math.sin(phi)*Math.cos(theta),r*sc[1]*Math.cos(phi),r*sc[2]*Math.sin(phi)*Math.sin(theta)).add(c);var dd=d.clone();dd.x+=(Math.random()-0.5)*0.4;dd.y+=(Math.random()-0.5)*0.3;dd.z+=(Math.random()-0.5)*0.4;var dn=dd.clone().normalize();pos.add(dn.clone().multiplyScalar(-0.012));addStrand(pos,dd,len,thick,mat);} }
function accentFur(c,r,sc,d,density,len,thick,mat,skip){skip=skip||-0.25;for(var i=0;i<density;i++){var phi=Math.random()*Math.PI,theta=Math.random()*Math.PI*2;if(Math.cos(phi)<skip)continue;var pos=new THREE.Vector3(r*sc[0]*Math.sin(phi)*Math.cos(theta),r*sc[1]*Math.cos(phi),r*sc[2]*Math.sin(phi)*Math.sin(theta)).add(c);var dd=d.clone();dd.x+=(Math.random()-0.5)*0.25;dd.y+=(Math.random()-0.5)*0.15;dd.z+=(Math.random()-0.5)*0.25;var dn=dd.clone().normalize();pos.add(dn.clone().multiplyScalar(-0.012));addStrand(pos,dd,len+Math.random()*0.03,thick,mat);} }
function buildInstancedFur(){var groups={};for(var i=0;i<furStrands.length;i++){var st=furStrands[i];var key=st.mat.uuid+'_'+st.geoId;if(!groups[key])groups[key]={mat:st.mat,strands:[],geo:st.geo};groups[key].strands.push(st);}var result=new THREE.Group();for(var key in groups){var g=groups[key];var count=g.strands.length;if(count===0)continue;var inst=new THREE.InstancedMesh(g.geo,g.mat,count);inst.castShadow=true;var dummy=new THREE.Object3D();for(var i=0;i<count;i++){dummy.position.copy(g.strands[i].pos);dummy.quaternion.copy(g.strands[i].quat);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);}inst.instanceMatrix.needsUpdate=true;result.add(inst);}return result;}
function addFurLocal(group,localC,r,sc,d,density,len,thick,mat){if(!group.userData.fg)group.userData.fg={};var key=mat.uuid;if(!group.userData.fg[key])group.userData.fg[key]={mat:mat,strands:[]};for(var i=0;i<density;i++){var phi=Math.random()*Math.PI,theta=Math.random()*Math.PI*2;if(Math.cos(phi)<-0.05)continue;var lp=new THREE.Vector3(r*sc[0]*Math.sin(phi)*Math.cos(theta),r*sc[1]*Math.cos(phi),r*sc[2]*Math.sin(phi)*Math.sin(theta)).add(localC);var dd=d.clone();dd.x+=(Math.random()-0.5)*0.4;dd.y+=(Math.random()-0.5)*0.3;dd.z+=(Math.random()-0.5)*0.4;var dn=dd.clone().normalize();lp.add(dn.clone().multiplyScalar(-0.012));var qlen=Math.round((len+Math.random()*0.015)/0.004)*0.004;var geo=getStrandGeo(qlen,thick);var quat=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),dd.clone().normalize());group.userData.fg[key].strands.push({pos:lp,quat:quat,geo:geo});} }
function addFurTube(group,vecFull,rTop,rBot,sc,d,totalDensity,len,thick,mat,offset){offset=offset||new THREE.Vector3(0,0,0);var n=Math.max(6,Math.ceil(totalDensity/60));var perSlice=Math.ceil(totalDensity/n);for(var i=0;i<n;i++){var frac=(i+0.5)/n;var r=rTop*(1-frac)+rBot*frac;var center=vecFull.clone().multiplyScalar(frac).add(offset);addFurLocal(group,center,r,sc,d,perSlice,len,thick,mat);} }
function buildGroupFur(group){if(!group.userData.fg)return;for(var mk in group.userData.fg){var fg=group.userData.fg[mk];var gg={};for(var i=0;i<fg.strands.length;i++){var gk=fg.strands[i].geo.uuid;if(!gg[gk])gg[gk]={mat:fg.mat,ss:[],geo:fg.strands[i].geo};gg[gk].ss.push(fg.strands[i]);}for(var gk in gg){var g2=gg[gk];var inst=new THREE.InstancedMesh(g2.geo,g2.mat,g2.ss.length);inst.castShadow=true;var d=new THREE.Object3D();for(var i=0;i<g2.ss.length;i++){d.position.copy(g2.ss[i].pos);d.quaternion.copy(g2.ss[i].quat);d.updateMatrix();inst.setMatrixAt(i,d.matrix);}inst.instanceMatrix.needsUpdate=true;group.add(inst);}}}
function createFurTex(baseColor){var aC=document.createElement('canvas');aC.width=aC.height=1024;var a=aC.getContext('2d');a.fillStyle=baseColor;a.fillRect(0,0,1024,1024);for(var i=0;i<80;i++){var v=Math.random();a.fillStyle='rgba('+(58+v*55)+','+(42+v*45)+','+(28+v*30)+',0.05)';a.beginPath();a.arc(Math.random()*1024,Math.random()*1024,50+Math.random()*100,0,Math.PI*2);a.fill();}for(var i=0;i<1500;i++){var x=Math.random()*1024,y=Math.random()*1024;a.strokeStyle='rgba('+(50+Math.random()*50)+','+(35+Math.random()*40)+','+(22+Math.random()*25)+',0.07)';a.lineWidth=0.4+Math.random()*0.8;a.beginPath();a.moveTo(x,y);a.lineTo(x+(Math.random()-0.5)*2,y+12+Math.random()*28);a.stroke();}for(var i=0;i<300;i++){var x=Math.random()*1024,y=Math.random()*1024;a.strokeStyle='rgba('+(120+Math.random()*60)+','+(85+Math.random()*50)+','+(35+Math.random()*30)+',0.04)';a.lineWidth=0.3+Math.random()*0.5;a.beginPath();a.moveTo(x,y);a.lineTo(x+(Math.random()-0.5)*1.5,y+10+Math.random()*25);a.stroke();}var albedo=new THREE.CanvasTexture(aC);albedo.wrapS=albedo.wrapT=THREE.RepeatWrapping;var nC=document.createElement('canvas');nC.width=nC.height=1024;var n=nC.getContext('2d');n.fillStyle='#8080ff';n.fillRect(0,0,1024,1024);var nI=n.getImageData(0,0,1024,1024);var hM=new Float32Array(1024*1024);for(var i=0;i<hM.length;i++)hM[i]=Math.random();for(var pass=0;pass<4;pass++){var hN=new Float32Array(1024*1024);for(var y=0;y<1024;y++)for(var x=0;x<1024;x++){var sum=0;for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){var nx=Math.max(0,Math.min(1023,x+dx)),ny=Math.max(0,Math.min(1023,y+dy));sum+=hM[ny*1024+nx];}hN[y*1024+x]=sum/9;}hM=hN;}for(var y=0;y<1024;y++)for(var x=0;x<1024;x++){var idx=y*1024+x;var dx=(hM[y*1024+Math.min(1023,x+1)]-hM[y*1024+Math.max(0,x-1)])*18;var dy=(hM[Math.min(1023,y+1)*1024+x]-hM[Math.max(0,y-1)*1024+x])*18;var l=Math.sqrt(dx*dx+dy*dy+1);var p=idx*4;nI.data[p]=((dx/l)*0.5+0.5)*255;nI.data[p+1]=((dy/l)*0.5+0.5)*255;nI.data[p+2]=((1/l)*0.5+0.5)*255;nI.data[p+3]=255;}n.putImageData(nI,0,0);var normal=new THREE.CanvasTexture(nC);normal.wrapS=normal.wrapT=THREE.RepeatWrapping;albedo.repeat.set(10,10);normal.repeat.set(10,10);return{albedo:albedo,normal:normal};}
function createDeepFurMat(hex,rough){var mat=new THREE.MeshStandardMaterial({color:hex,roughness:rough||0.92,metalness:0,side:THREE.DoubleSide});mat.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aStrandY;\nvarying float vStrandY;');sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStrandY=aStrandY;');sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vStrandY;');sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=mix(vec3(0.015,0.01,0.005),diffuseColor.rgb,vStrandY);');sh.fragmentShader=sh.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );','gl_FragColor=vec4(outgoingLight,diffuseColor.a);\nfloat NdotV=dot(vNormal,normalize(-vViewPosition));\nfloat tipRim=pow(1.0-abs(NdotV),3.0)*vStrandY;\ngl_FragColor.rgb+=vec3(0.55,0.28,0.07)*tipRim;\nfloat goldSpec=pow(max(NdotV,0.0),8.0)*vStrandY*0.4;\ngl_FragColor.rgb+=vec3(0.5,0.25,0.06)*goldSpec;');};mat.customProgramCacheKey=function(){return'deep_gold_fur_v3';};return mat;}
function createBodyGuideMesh(){var allPos=[],allIdx=[],vOff=0;wolf.updateMatrixWorld(true);wolf.traverse(function(obj){if(!obj.isMesh||obj.material!==matFur||!obj.geometry.attributes.position||!obj.geometry.index)return;var maxScale=Math.max(obj.scale.x,obj.scale.y,obj.scale.z);var r=obj.geometry.parameters?obj.geometry.parameters.radius:0.01;if(r*maxScale<0.03)return;var skip=false;var p=obj.parent;while(p){if(p===tailRoot||p===legFL||p===legFR||p===legHL||p===legHR||p===headGroup){skip=true;break;}p=p.parent;}if(skip)return;var pos=obj.geometry.attributes.position.array;var idx=obj.geometry.index.array;var m=obj.matrixWorld;var v=new THREE.Vector3();for(var j=0;j<pos.length;j+=3){v.set(pos[j],pos[j+1],pos[j+2]).applyMatrix4(m);allPos.push(v.x,v.y,v.z);}for(var j=0;j<idx.length;j++)allIdx.push(idx[j]+vOff);vOff+=pos.length/3;});var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(allPos,3));g.setIndex(allIdx);g.computeVertexNormals();return g;}
function placeFurOnMesh(geo,density,len,thick,mat,dirBase){var pos=geo.attributes.position.array;var nor=geo.attributes.normal.array;var idx=geo.index.array;var tc=idx.length/3;var areas=new Float32Array(tc),cum=new Float32Array(tc),total=0;var v0=new THREE.Vector3(),v1=new THREE.Vector3(),v2=new THREE.Vector3();var e1=new THREE.Vector3(),e2=new THREE.Vector3(),cr=new THREE.Vector3();for(var i=0;i<tc;i++){var a=idx[i*3],b=idx[i*3+1],c=idx[i*3+2];v0.set(pos[a*3],pos[a*3+1],pos[a*3+2]);v1.set(pos[b*3],pos[b*3+1],pos[b*3+2]);v2.set(pos[c*3],pos[c*3+1],pos[c*3+2]);e1.subVectors(v1,v0);e2.subVectors(v2,v0);cr.crossVectors(e1,e2);areas[i]=cr.length()*0.5;total+=areas[i];cum[i]=total;}var n0=new THREE.Vector3(),n1=new THREE.Vector3(),n2=new THREE.Vector3();var pt=new THREE.Vector3(),nm=new THREE.Vector3(),dir=new THREE.Vector3(),flow=new THREE.Vector3();for(var i=0;i<density;i++){var r=Math.random()*total;var lo=0,hi=tc-1;while(lo<hi){var mid=(lo+hi)>>1;if(cum[mid]<r)lo=mid+1;else hi=mid;}var t2=lo;var a=idx[t2*3],b=idx[t2*3+1],c=idx[t2*3+2];v0.set(pos[a*3],pos[a*3+1],pos[a*3+2]);v1.set(pos[b*3],pos[b*3+1],pos[b*3+2]);v2.set(pos[c*3],pos[c*3+1],pos[c*3+2]);n0.set(nor[a*3],nor[a*3+1],nor[a*3+2]);n1.set(nor[b*3],nor[b*3+1],nor[b*3+2]);n2.set(nor[c*3],nor[c*3+1],nor[c*3+2]);var r1=Math.random(),r2=Math.random();if(r1+r2>1){r1=1-r1;r2=1-r2;}var r3=1-r1-r2;pt.copy(v0).multiplyScalar(r3).addScaledVector(v1,r1).addScaledVector(v2,r2);nm.copy(n0).multiplyScalar(r3).addScaledVector(n1,r1).addScaledVector(n2,r2).normalize();if(nm.y<-0.85)continue;var dot=nm.dot(dirBase);flow.copy(dirBase).addScaledVector(nm,-dot);if(flow.lengthSq()<0.001)flow.copy(dirBase);flow.normalize();dir.copy(flow).multiplyScalar(0.7);dir.addScaledVector(nm,0.3);dir.x+=(Math.random()-0.5)*0.3;dir.y+=(Math.random()-0.5)*0.2;dir.z+=(Math.random()-0.5)*0.3;dir.normalize();pt.addScaledVector(nm,-0.012);addStrand(pt,dir,len,thick,mat);} }
function topY(z){var t=(sZ-z)/(sZ-hZ);t=Math.max(0,Math.min(1,t));return sY-t*(sY-hY);}
function disposeAnimal(){if(!wolf)return;scene.remove(wolf);furStrands=[];_geomCache={};tailSegs=[];spineSegs=[];neckSegs=[];}
function deriveParams(){/* ULTRAGUSS U4: die Allometrie wohnt im Gesetzbuch (__tetrapodaCore.deriveTierParams) — die Shell liest Slider, ruft das EINE Gesetz, pflegt Labels. */var size=parseFloat(document.getElementById('sSize').value),neckLen=parseFloat(document.getElementById('sNeck').value),legLen=parseFloat(document.getElementById('sLeg').value),diet=parseFloat(document.getElementById('sDiet').value),build=parseFloat(document.getElementById('sBuild').value);var P=__tetrapodaCore.deriveTierParams({size:size,neckLen:neckLen,legLen:legLen,diet:diet,build:build});document.getElementById('vSize').textContent=size.toFixed(1);document.getElementById('vNeck').textContent=neckLen.toFixed(2);document.getElementById('vLeg').textContent=legLen.toFixed(2);document.getElementById('vDiet').textContent=diet>0.7?'Carn':diet>0.3?'Omni':'Herb';document.getElementById('vBuild').textContent=build.toFixed(2);return P;}
function buildAnimal(){
  disposeAnimal();P=deriveParams();
  var __TK=__tetrapodaCore.TIER_MATERIAL_KLASSEN;   /* KONVERGENZ III: die tier-farben wohnen im gesetzbuch */
  var matNose=new THREE.MeshPhysicalMaterial({color:__TK.nase.c,roughness:0.10,clearcoat:1.0,clearcoatRoughness:0.03}),matEye=new THREE.MeshPhysicalMaterial({color:__TK.tierauge.c,roughness:0.06,clearcoat:1.0,emissive:__TK.tierauge.emissiv,emissiveIntensity:0.3}),matPupil=new THREE.MeshBasicMaterial({color:__TK.pupille.c}),matCornea=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:0,transparent:true,opacity:0.05,clearcoat:1.0}),matClaw=new THREE.MeshStandardMaterial({color:__TK.klaue.c,roughness:0.20}),matPad=new THREE.MeshPhysicalMaterial({color:__TK.ballen.c,roughness:0.45,clearcoat:0.4}),matTooth=new THREE.MeshStandardMaterial({color:__TK.zahn.c,roughness:0.18}),matGum=new THREE.MeshPhysicalMaterial({color:__TK.zahnfleisch.c,roughness:0.5}),matDark=new THREE.MeshBasicMaterial({color:__TK.dunkel.c});
  var furTex=createFurTex(P.base);
  if(!matFur){matFur=new THREE.MeshStandardMaterial({roughness:0.93,metalness:0,normalScale:new THREE.Vector2(0.45,0.45)});matFur.userData.uTime={value:0};matFur.onBeforeCompile=function(sh){sh.uniforms.uTime=matFur.userData.uTime;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;\nvec3 mod289_s(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}\nvec4 mod289_s(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}\nvec4 permute_s(vec4 x){return mod289_s(((x*34.0)+1.0)*x);}\nvec4 taylorInvSqrt_s(vec4 r){return 1.79284291400159-0.85373472095314*r;}\nfloat snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289_s(i);vec4 p=permute_s(permute_s(permute_s(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt_s(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}');sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat noise=snoise(position*1.4+uTime*0.14);\ntransformed+=normal*noise*0.007;');sh.fragmentShader=sh.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );','gl_FragColor=vec4(outgoingLight,diffuseColor.a);\nfloat NdotV=dot(vNormal,normalize(-vViewPosition));\nfloat rim=1.0-abs(NdotV);\nfloat sss=pow(rim,4.0);\ngl_FragColor.rgb+=vec3(0.55,0.25,0.07)*sss*0.5;\nfloat microFur=fract(sin(dot(floor(vUv*500.0),vec2(12.9898,78.233)))*43758.5453);\nmicroFur=step(0.55,microFur);\nfloat furRim=pow(rim,3.0)*microFur;\ngl_FragColor.rgb+=vec3(0.7,0.35,0.1)*furRim*0.3;\nfloat goldSheen=pow(max(NdotV,0.0),5.0)*0.15;\ngl_FragColor.rgb+=vec3(0.45,0.25,0.08)*goldSheen;\ngl_FragColor.rgb*=(0.5+0.5*max(NdotV,0.0));');};matFur.customProgramCacheKey=function(){return'wolf_aureus_v22';};}
  matFur.map=furTex.albedo;matFur.normalMap=furTex.normal;matFur.needsUpdate=true;matStrand=createDeepFurMat(P.cB);matStrandDk=createDeepFurMat(P.cD);matStrandLt=createDeepFurMat(P.cL,0.88);
  /* KONVERGENZ III: der teile-baum wohnt im gesetzbuch (__tetrapodaCore.bauTier) -- die shell reicht THREE-fabriken + streut ihr fell auf die rueckgaben. */
  var __M={fell:matFur,straehne:matStrand,nase:matNose,tierauge:matEye,pupille:matPupil,hornhaut:matCornea,klaue:matClaw,ballen:matPad,zahn:matTooth,zahnfleisch:matGum,dunkel:matDark};
  var __F={gruppe:function(){return new THREE.Group();},kugel:function(r,k,sc){return s(r,__M[k],sc);},zylinder:function(rt,rb,h,k){return cH(rt,rb,h,__M[k]);},kugelFein:function(r,k,segs){var me=new THREE.Mesh(new THREE.SphereGeometry(r,segs,segs),__M[k]);me.castShadow=true;return me;},v3:function(x,y,z){return new THREE.Vector3(x,y,z);},richte:function(node,dir){node.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());},
  fellSchweif:function(segG,segR,i){var Hh=P.size;var fBk=new THREE.Vector3(0,-0.12,-0.92);for(var j=0;j<(28-i*2)*9;j++){var phi=Math.random()*Math.PI,theta=Math.random()*Math.PI*2;if(Math.cos(phi)<-0.28)continue;var pos2=new THREE.Vector3(segR*0.95*Math.sin(phi)*Math.cos(theta),segR*1.18*Math.cos(phi),segR*1.18*Math.sin(phi)*Math.sin(theta)-0.048*Hh);var d=fBk.clone();d.x+=(Math.random()-0.5)*0.25;d.y+=(Math.random()-0.5)*0.15;d.z+=(Math.random()-0.5)*0.25;var qlen=Math.round((0.032-i*0.003+Math.random()*0.03)/0.004)*0.004;var geo2=getStrandGeo(qlen,0.012);var quat2=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),d.clone().normalize());var mesh2=new THREE.Mesh(geo2,matStrand);mesh2.position.copy(pos2);mesh2.quaternion.copy(quat2);segG.add(mesh2);}}};
  var __B=__tetrapodaCore.bauTier(__F,P);
  wolf=__B.teile.wolf;headGroup=__B.teile.headGroup;jawGroup=__B.teile.jawGroup;earL=__B.teile.earL;earR=__B.teile.earR;lidTL=__B.teile.lidTL;lidTR=__B.teile.lidTR;tailRoot=__B.teile.tailRoot;legFL=__B.teile.legFL;legFR=__B.teile.legFR;legHL=__B.teile.legHL;legHR=__B.teile.legHR;shoulderL=__B.teile.shoulderL;shoulderR=__B.teile.shoulderR;ribcage=__B.teile.ribcage;waist=__B.teile.waist;flank=__B.teile.flank;belly=__B.teile.belly;lowerAbd=__B.teile.lowerAbd;mane=__B.teile.mane;throat=__B.teile.throat;larynx=__B.teile.larynx;larynxUp=__B.teile.larynxUp;deltL=__B.teile.deltL;deltR=__B.teile.deltR;tricepL=__B.teile.tricepL;tricepR=__B.teile.tricepR;quadL=__B.teile.quadL;quadR=__B.teile.quadR;hamL=__B.teile.hamL;hamR=__B.teile.hamR;gastroL=__B.teile.gastroL;gastroR=__B.teile.gastroR;gluteL=__B.teile.gluteL;gluteR=__B.teile.gluteR;flU=__B.teile.flU;flL=__B.teile.flL;flP=__B.teile.flP;frU=__B.teile.frU;frL=__B.teile.frL;frP=__B.teile.frP;hlT=__B.teile.hlT;hlC=__B.teile.hlC;hlP=__B.teile.hlP;hrT=__B.teile.hrT;hrC=__B.teile.hrC;hrP=__B.teile.hrP;
  tailSegs=__B.tailSegs;spineSegs=__B.spineSegs;neckSegs=__B.neckSegs;
  pawOffsets[0]=__B.pawOffsets[0];pawOffsets[1]=__B.pawOffsets[1];pawOffsets[2]=__B.pawOffsets[2];pawOffsets[3]=__B.pawOffsets[3];
  H=__B.masse.H;sY=__B.masse.sY;hY=__B.masse.hY;sZ=__B.masse.sZ;hZ=__B.masse.hZ;lv=__B.masse.lv;by=__B.masse.by;tv=__B.masse.tv;bt=__B.masse.bt;
  var bX=__B.masse.bX,croup=__B.teile.croup,pelvis=__B.teile.pelvis,throatLower=__B.teile.throatLower,cranium=__B.teile.cranium,neckStart=__B.neckStart,neckDir=__B.neckDir,neckEnd=__B.neckEnd;

  var fBack=new THREE.Vector3(0,0.04,-0.78);var bodyMesh=createBodyGuideMesh();placeFurOnMesh(bodyMesh,P.uDens,P.underL,0.008,matStrandDk,fBack);placeFurOnMesh(bodyMesh,P.gDens,P.guardL,0.006,matStrand,fBack);placeFurOnMesh(bodyMesh,P.gDens*0.2,0.07,0.008,matStrandDk,fBack);placeFurOnMesh(bodyMesh,P.gDens*0.1,0.06,0.008,matStrandLt,fBack);
  var humLen2=P.legLen*H,humAng2=25*Math.PI/180;var humFull=new THREE.Vector3(0,-humLen2*Math.cos(humAng2),-humLen2*Math.sin(humAng2));var radLen2=P.legLen*1.45*H,radAng2=10*Math.PI/180;var radFull=new THREE.Vector3(0,-radLen2*Math.cos(radAng2),radLen2*Math.sin(radAng2));var metaLen2=P.legLen*0.91*H,metaAng2=15*Math.PI/180;var metaFull=new THREE.Vector3(0,-metaLen2*Math.cos(metaAng2),metaLen2*Math.sin(metaAng2));
  // Front leg fur: all addFurLocal on leg groups, no floating fuzz
  addFurLocal(legFL,new THREE.Vector3(0,0.04*H,0),0.085*H,[1.10,1.32,1.05*lv],new THREE.Vector3(0,0.02,-0.80),1000,0.032,0.006,matStrand);addFurLocal(legFR,new THREE.Vector3(0,0.04*H,0),0.085*H,[1.10,1.32,1.05*lv],new THREE.Vector3(0,0.02,-0.80),1000,0.032,0.006,matStrand);
  addFurLocal(legFL,new THREE.Vector3(0,0.075*H,0),0.035*H,[1.05,1.0,1.0*lv],new THREE.Vector3(0,0.02,-0.80),250,0.032,0.006,matStrand);addFurLocal(legFR,new THREE.Vector3(0,0.075*H,0),0.035*H,[1.05,1.0,1.0*lv],new THREE.Vector3(0,0.02,-0.80),250,0.032,0.006,matStrand);
  addFurTube(flU,humFull,0.10*H,0.055*H*Math.pow(bt,0.4),[0.9,1.0,0.65],new THREE.Vector3(0,0.02,-0.80),1500,0.032,0.006,matStrand);addFurTube(frU,humFull,0.10*H,0.055*H*Math.pow(bt,0.4),[0.9,1.0,0.65],new THREE.Vector3(0,0.02,-0.80),1500,0.032,0.006,matStrand);
  addFurLocal(flU,humFull,0.045*H*Math.pow(bt,0.4),[1.3,0.6,1.0],new THREE.Vector3(0,-0.02,-0.78),250,0.028,0.006,matStrand);addFurLocal(frU,humFull,0.045*H*Math.pow(bt,0.4),[1.3,0.6,1.0],new THREE.Vector3(0,-0.02,-0.78),250,0.028,0.006,matStrand);
  addFurTube(flL,radFull,0.055*H*Math.pow(bt,0.4),0.035*H*Math.pow(bt,0.8),[0.9,1.0,0.55],new THREE.Vector3(0,-0.02,-0.80),1000,0.028,0.006,matStrand);addFurTube(frL,radFull,0.055*H*Math.pow(bt,0.4),0.035*H*Math.pow(bt,0.8),[0.9,1.0,0.55],new THREE.Vector3(0,-0.02,-0.80),1000,0.028,0.006,matStrand);
  addFurLocal(flP,metaFull.clone().multiplyScalar(0.5),0.045*H*Math.pow(bt,0.8),[1.0,1.6,0.80],new THREE.Vector3(0,-0.05,-0.70),400,0.024,0.005,matStrand);addFurLocal(frP,metaFull.clone().multiplyScalar(0.5),0.045*H*Math.pow(bt,0.8),[1.0,1.6,0.80],new THREE.Vector3(0,-0.05,-0.70),400,0.024,0.005,matStrand);
  var femLen2=P.legLen*1.27*H,femAng2=35*Math.PI/180;var femFull2=new THREE.Vector3(0,-femLen2*Math.cos(femAng2),femLen2*Math.sin(femAng2));var tibLen2=P.legLen*1.73*H,tibAng2=45*Math.PI/180;var tibFull2=new THREE.Vector3(0,-tibLen2*Math.cos(tibAng2),-tibLen2*Math.sin(tibAng2));var metaTLen2=P.legLen*1.18*H,metaTAng2=5*Math.PI/180;var metaTFull2=new THREE.Vector3(0,-metaTLen2*Math.cos(metaTAng2),metaTLen2*Math.sin(metaTAng2));
  // Hind leg fur: Y scale matches glute mesh (1.10*lv), all on leg groups
  addFurLocal(legHL,new THREE.Vector3(0,0.030*H,-0.020*H),0.080*H*1.35,[1.10,1.10*lv,1.22*lv],new THREE.Vector3(0,0.05,-0.78),1200,0.032,0.006,matStrand);addFurLocal(legHR,new THREE.Vector3(0,0.030*H,-0.020*H),0.080*H*1.35,[1.10,1.10*lv,1.22*lv],new THREE.Vector3(0,0.05,-0.78),1200,0.032,0.006,matStrand);
  addFurLocal(legHL,new THREE.Vector3(0,0.060*H,-0.020*H),0.050*H*1.35,[1.15,1.10*lv,1.15*lv],new THREE.Vector3(0,0.10,-0.75),700,0.030,0.006,matStrand);addFurLocal(legHR,new THREE.Vector3(0,0.060*H,-0.020*H),0.050*H*1.35,[1.15,1.10*lv,1.15*lv],new THREE.Vector3(0,0.10,-0.75),700,0.030,0.006,matStrand);
  addFurLocal(legHL,new THREE.Vector3(0,0.06*H,-0.020*H),0.03*H*1.35,[1.05,1.10*lv,1.0*lv],new THREE.Vector3(0,0.05,-0.78),300,0.032,0.006,matStrand);addFurLocal(legHR,new THREE.Vector3(0,0.06*H,-0.020*H),0.03*H*1.35,[1.05,1.10*lv,1.0*lv],new THREE.Vector3(0,0.05,-0.78),300,0.032,0.006,matStrand);
  addFurTube(hlT,femFull2,0.10*H,0.055*H*Math.pow(bt,0.4),[0.9,1.0,0.7],new THREE.Vector3(0,-0.05,-0.75),1800,0.032,0.006,matStrand);addFurTube(hrT,femFull2,0.10*H,0.055*H*Math.pow(bt,0.4),[0.9,1.0,0.7],new THREE.Vector3(0,-0.05,-0.75),1800,0.032,0.006,matStrand);
  addFurLocal(hlT,femFull2,0.045*H*Math.pow(bt,0.4),[1.3,0.6,1.0],new THREE.Vector3(0,-0.05,-0.73),300,0.028,0.006,matStrand);addFurLocal(hrT,femFull2,0.045*H*Math.pow(bt,0.4),[1.3,0.6,1.0],new THREE.Vector3(0,-0.05,-0.73),300,0.028,0.006,matStrand);
  addFurLocal(hlT,new THREE.Vector3(0,0,0.045*H),0.055*H,[0.55,1.1,0.45],new THREE.Vector3(0,0.05,-0.75),500,0.032,0.006,matStrand);addFurLocal(hrT,new THREE.Vector3(0,0,0.045*H),0.055*H,[0.55,1.1,0.45],new THREE.Vector3(0,0.05,-0.75),500,0.032,0.006,matStrand);
  addFurTube(hlT,femFull2,0.08*H,0.04*H,[0.8,1.0,0.8],new THREE.Vector3(0,-0.05,-0.75),800,0.032,0.006,matStrand,new THREE.Vector3(0,0,-0.026*H));addFurTube(hrT,femFull2,0.08*H,0.04*H,[0.8,1.0,0.8],new THREE.Vector3(0,-0.05,-0.75),800,0.032,0.006,matStrand,new THREE.Vector3(0,0,-0.026*H));
  addFurTube(hlC,tibFull2,0.055*H*Math.pow(bt,0.4),0.035*H*Math.pow(bt,0.8),[0.9,1.0,0.5],new THREE.Vector3(0,-0.05,-0.75),1000,0.028,0.006,matStrand);addFurTube(hrC,tibFull2,0.055*H*Math.pow(bt,0.4),0.035*H*Math.pow(bt,0.8),[0.9,1.0,0.5],new THREE.Vector3(0,-0.05,-0.75),1000,0.028,0.006,matStrand);
  addFurLocal(hlC,tibFull2,0.040*H*Math.pow(bt,0.4),[1.3,0.6,1.0],new THREE.Vector3(0,-0.05,-0.72),250,0.028,0.006,matStrand);addFurLocal(hrC,tibFull2,0.040*H*Math.pow(bt,0.4),[1.3,0.6,1.0],new THREE.Vector3(0,-0.05,-0.72),250,0.028,0.006,matStrand);
  addFurLocal(hlP,metaTFull2.clone().multiplyScalar(0.5),0.045*H*Math.pow(bt,0.8),[1.0,1.6,0.80],new THREE.Vector3(0,-0.05,-0.70),400,0.024,0.005,matStrand);addFurLocal(hrP,metaTFull2.clone().multiplyScalar(0.5),0.045*H*Math.pow(bt,0.8),[1.0,1.6,0.80],new THREE.Vector3(0,-0.05,-0.70),400,0.024,0.005,matStrand);
  buildGroupFur(legFL);buildGroupFur(legFR);buildGroupFur(legHL);buildGroupFur(legHR);buildGroupFur(flU);buildGroupFur(frU);buildGroupFur(flL);buildGroupFur(frL);buildGroupFur(flP);buildGroupFur(frP);buildGroupFur(hlT);buildGroupFur(hrT);buildGroupFur(hlC);buildGroupFur(hrC);buildGroupFur(hlP);buildGroupFur(hrP);
  var fDown=new THREE.Vector3(0,-0.50,-0.20),fOut=new THREE.Vector3(0,0.04,-0.78);
  fuzz(belly.position,0.30*H,[bX*0.92,0.50+by*0.8,0.96],fDown,800,0.024,0.006,matStrand);fuzz(lowerAbd.position,0.28*H,[bX*0.83,0.48,0.90],fDown,600,0.022,0.006,matStrand);
  fuzz(new THREE.Vector3(0,sY-0.42*H+by*2,-0.40-by*1.5),0.12,[1.4,0.5,1.6],fDown,300,0.022,0.005,matStrand);
  fuzz(new THREE.Vector3(-0.16,hY-0.02*H,-0.60),0.10,[1.5,0.9,1.3],fOut,400,0.028,0.006,matStrand);fuzz(new THREE.Vector3(0.16,hY-0.02*H,-0.60),0.10,[1.5,0.9,1.3],fOut,400,0.028,0.006,matStrand);
  fuzz(new THREE.Vector3(-0.14,hY-0.06*H,-0.75),0.09,[1.4,0.9,1.3],fOut,350,0.028,0.006,matStrand);fuzz(new THREE.Vector3(0.14,hY-0.06*H,-0.75),0.09,[1.4,0.9,1.3],fOut,350,0.028,0.006,matStrand);
  fuzz(croup.position,0.20*H,[bX*1.04,0.44,0.36],fOut,500,0.030,0.006,matStrand);fuzz(pelvis.position,0.28*H,[bX*0.79,0.66,0.42],fOut,500,0.030,0.006,matStrand);
  accentFur(throat.position.clone().add(new THREE.Vector3(0,-0.02*H,0)),0.05*H,[1.0,0.8,1.2],new THREE.Vector3(0,-0.3,-0.6),600,0.05,0.007,matStrandDk,-0.5);
  accentFur(throatLower.position.clone().add(new THREE.Vector3(0,-0.015*H,0)),0.045*H,[1.0,0.8,1.2],new THREE.Vector3(0,-0.3,-0.6),500,0.045,0.007,matStrandDk,-0.5);
  if(P.maneCount>0)accentFur(mane.position,0.062*H,[0.85,0.70,1.38],new THREE.Vector3(0,0.15,-0.65),P.maneCount,P.maneLen,0.011,matStrandDk);var neckMidPos=neckStart.clone().add(neckDir.clone().multiplyScalar(0.5));accentFur(neckMidPos,0.10*H,[0.90,0.94,1.18],fOut,800,0.10,0.009,matStrand);accentFur(cranium.position.clone().add(headGroup.position),P.skullR*H,[0.95,0.96,1.26],new THREE.Vector3(0,0.04,-0.78),30,0.03,0.005,matStrandDk,0.10);
  furInstanced=buildInstancedFur();wolf.add(furInstanced);scene.add(wolf);
  if(contactShadow){contactShadow.scale.setScalar(H*0.55);contactShadow.position.y=0.002;}
  controls.target.set(0,sY*0.38,0);controls.update();phys.init();emo.set(emoMode);document.getElementById('loading').style.display='none';
}
function init(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x080604);camera=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,0.1,200);camera.position.set(6,2,7);
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);if(THREE.sRGBEncoding!==undefined)renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  try{var c=document.createElement('canvas');c.width=256;c.height=256;var x=c.getContext('2d');var g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#ccaa88');g.addColorStop(0.5,'#443322');g.addColorStop(1,'#0a0805');x.fillStyle=g;x.fillRect(0,0,256,256);var t=new THREE.CanvasTexture(c);var p=new THREE.PMREMGenerator(renderer);scene.environment=p.fromEquirectangular(t).texture;t.dispose();}catch(e){}
  scene.add(new THREE.HemisphereLight(0xffeecc,0x332211,0.45));var key=new THREE.DirectionalLight(0xffd8a0,3.5);key.position.set(6,8,4);key.castShadow=true;key.shadow.mapSize.width=2048;key.shadow.mapSize.height=2048;key.shadow.bias=-0.0001;key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;key.shadow.camera.near=0.5;key.shadow.camera.far=30;scene.add(key);var rimL=new THREE.DirectionalLight(0x5588ff,1.4);rimL.position.set(-5,4,-5);scene.add(rimL);var fill=new THREE.DirectionalLight(0xaa7744,0.7);fill.position.set(0,2,-8);scene.add(fill);var goldBack=new THREE.DirectionalLight(0xff8833,0.5);goldBack.position.set(-3,3,8);scene.add(goldBack);
  var gC=document.createElement('canvas');gC.width=gC.height=512;var gx=gC.getContext('2d');var gg=gx.createRadialGradient(256,256,40,256,256,250);gg.addColorStop(0,'#1a1610');gg.addColorStop(0.4,'#0d0a07');gg.addColorStop(1,'#050302');gx.fillStyle=gg;gx.fillRect(0,0,512,512);var gTex=new THREE.CanvasTexture(gC);var groundMat=new THREE.MeshStandardMaterial({map:gTex,roughness:0.96,metalness:0});groundMesh=new THREE.Mesh(new THREE.CircleGeometry(20,64),groundMat);groundMesh.rotation.x=-Math.PI/2;groundMesh.position.y=-0.002;groundMesh.receiveShadow=true;scene.add(groundMesh);
  var csGeo=new THREE.CircleGeometry(1,48);var csMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false});contactShadow=new THREE.Mesh(csGeo,csMat);contactShadow.rotation.x=-Math.PI/2;contactShadow.position.y=0.001;scene.add(contactShadow);
  composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.35,0.4,0.85));fxaa=new THREE.ShaderPass(THREE.FXAAShader);fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);composer.addPass(fxaa);
  var cine={uniforms:{tDiffuse:{value:null},time:{value:0}},vertexShader:['varying vec2 vUv;','void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'].join('\n'),fragmentShader:['uniform sampler2D tDiffuse;','uniform float time;','varying vec2 vUv;','float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}','float getLum(vec2 uv){return dot(texture2D(tDiffuse,uv).rgb,vec3(0.299,0.587,0.114));}','void main(){vec2 uv=vUv;vec2 dir=uv-0.5;float dist=length(dir);vec2 offset=dir*dist*0.008;float r=texture2D(tDiffuse,uv+offset).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-offset).b;vec3 color=vec3(r,g,b);float lum=getLum(uv);float lL=getLum(uv-vec2(0.001,0.0));float lR=getLum(uv+vec2(0.001,0.0));float lU=getLum(uv-vec2(0.0,0.001));float lD=getLum(uv+vec2(0.0,0.001));float edge=abs(lL-lum)+abs(lR-lum)+abs(lU-lum)+abs(lD-lum);color*=(1.0+edge*2.0);color*=smoothstep(1.2,0.1,dist*1.3);color+=random(uv+time)*0.03-0.015;gl_FragColor=vec4(color,1.0);}'].join('\n')};cinePass=new THREE.ShaderPass(cine);cinePass.renderToScreen=true;composer.addPass(cinePass);
  controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=3;controls.maxDistance=30;controls.autoRotateSpeed=0.8;clock=new THREE.Clock();buildAnimal();
  document.querySelectorAll('#presets button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#presets button').forEach(function(b2){b2.classList.remove('active');});b.classList.add('active');var p=presets[b.dataset.p];document.getElementById('sSize').value=p.size;document.getElementById('sNeck').value=p.neck;document.getElementById('sLeg').value=p.leg;document.getElementById('sDiet').value=p.diet;document.getElementById('sBuild').value=p.build;buildAnimal();});});
  document.querySelectorAll('#emotions button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#emotions button').forEach(function(b2){b2.classList.remove('active');});b.classList.add('active');emoMode=b.dataset.e;emo.set(emoMode);});});
  var rebuildTimer=null;['sSize','sNeck','sLeg','sDiet','sBuild'].forEach(function(id){document.getElementById(id).addEventListener('input',function(){document.querySelectorAll('#presets button').forEach(function(b){b.classList.remove('active');});clearTimeout(rebuildTimer);rebuildTimer=setTimeout(buildAnimal,200);});});animate();
}
function animate(){
  requestAnimationFrame(animate);if(!wolf)return;var t=clock.getElapsedTime(),dt=1/60;if(matFur)matFur.userData.uTime.value=t;cinePass.uniforms.time.value=t;controls.autoRotate=(emoMode==='showcase');emo.update(dt,t);var bm=emo.getBeh(t);var e=emo.cur;cpgFreq=(bm.freqOv!==null?bm.freqOv:e.freq);updateCPG(dt);var st=e.stride;updateBodyPhysics(dt);bodyPhys.vy+=bm.impulseY;bodyPhys.vx+=bm.impulseX;var breathing=(st<0.01)?Math.sin(t*0.6)*0.003*H:0;wolf.position.y=bodyPhys.y+bm.pounceY+breathing;
  // Body roll computed early for weight shift
  var bodyRollNow=Math.sin(cpgPhase[0]*2)*e.sway+e.bodyZ+bm.bodyRotZ;
  wolf.rotation.z=bodyRollNow;wolf.rotation.x=bodyPhys.pitch*0.15+e.bodyX+bm.bodyX;wolf.rotation.y=bm.bodyRotY;
  var sprintMul=(e.stride>0.08)?2.0:(e.stride>0.02?1.4:1.0);
  var legSides=[-1,1,-1,1];
  for(var leg=0;leg<4;leg++){
    var ph=cpgPhase[leg];var override=bm.legOv;var swing=Math.max(0,Math.sin(ph));var stanceA=Math.max(0,-Math.sin(ph));
    if(override!==null){
      phys.legPDs[legNames[leg][0]].target=override;
      phys.legPDs[legNames[leg][1]].target=override*0.5;
      phys.legPDs[legNames[leg][2]].target=Math.max(0,override+0.5)*0.3;
      phys.legPDs[legNames[leg][3]].target=Math.max(0,override+0.8)*0.2;
    }
    else if(e.stride<0.002){
      var wn=Math.sin(t*2.5+leg*1.7)*0.004+Math.sin(t*1.3+leg*2.3)*0.003;
      // Weight shift: body rolls right -> right legs extend, left legs compress
      var wShift=bodyRollNow*legSides[leg]*0.025;
      phys.legPDs[legNames[leg][0]].target=standPose[leg][0]+wn+wShift;
      phys.legPDs[legNames[leg][1]].target=standPose[leg][1]+wn*0.5+wShift*0.3;
      phys.legPDs[legNames[leg][2]].target=standPose[leg][2]+wn*0.3-wShift*0.2;
      phys.legPDs[legNames[leg][3]].target=standPose[leg][3]+wn*0.2;
    }
    else{
      phys.legPDs[legNames[leg][0]].target=Math.sin(ph)*st*sprintMul;
      phys.legPDs[legNames[leg][1]].target=Math.sin(ph)*st*0.4*sprintMul;
      phys.legPDs[legNames[leg][2]].target=swing*0.80+stanceA*0.12+Math.max(0,Math.sin(ph+0.5))*st*0.4;
      phys.legPDs[legNames[leg][3]].target=swing*0.45+stanceA*0.05+Math.max(0,Math.sin(ph+1.0))*st*0.25;
    }
  }
  for(var i=0;i<4;i++){var ns=Math.max(0,-Math.sin(cpgPhase[i]));if(phys._prevSt[i]<0.05&&ns>0.15&&e.stride>0.002){bodyPhys.vy-=0.01*e.tension;}phys._prevSt[i]=ns;}
  for(var name in phys.legPDs){var pd=phys.legPDs[name];pd.kp=Math.max(200,320*e.kpMul);pd.kd=18*e.kpMul;pd.update(dt);}
  legFL.rotation.x=phys.legPDs['legFL'].current;flU.rotation.x=phys.legPDs['flU'].current;flL.rotation.x=phys.legPDs['flL'].current;flP.rotation.x=phys.legPDs['flP'].current;legFR.rotation.x=phys.legPDs['legFR'].current;frU.rotation.x=phys.legPDs['frU'].current;frL.rotation.x=phys.legPDs['frL'].current;frP.rotation.x=phys.legPDs['frP'].current;legHL.rotation.x=phys.legPDs['legHL'].current;hlT.rotation.x=phys.legPDs['hlT'].current;hlC.rotation.x=phys.legPDs['hlC'].current;hlP.rotation.x=phys.legPDs['hlP'].current;legHR.rotation.x=phys.legPDs['legHR'].current;hrT.rotation.x=phys.legPDs['hrT'].current;hrC.rotation.x=phys.legPDs['hrC'].current;hrP.rotation.x=phys.legPDs['hrP'].current;
  phys.shoulderLPD.target=-phys.legPDs['legFL'].current*0.08;phys.shoulderRPD.target=-phys.legPDs['legFR'].current*0.08;phys.shoulderLPD.update(dt);phys.shoulderRPD.update(dt);if(shoulderL)shoulderL.rotation.x=phys.shoulderLPD.current;if(shoulderR)shoulderR.rotation.x=phys.shoulderRPD.current;
  if(bm.pounceY<0.01){
    wolf.updateMatrixWorld(true);
    var minFY=Infinity;var paws=[flP,frP,hlP,hrP];
    for(var i=0;i<paws.length;i++){paws[i].getWorldPosition(_fp);_fp.y-=pawOffsets[i];if(_fp.y<minFY)minFY=_fp.y;}
    if(minFY<0){wolf.position.y-=minFY;}
    else if(minFY>0.004&&e.stride<0.002){wolf.position.y-=(minFY-0.004)*0.5;}
  }
  if(contactShadow){var bodyH=wolf.position.y;contactShadow.material.opacity=0.35*Math.max(0.1,1-bodyH*2);contactShadow.scale.setScalar(H*0.55*Math.max(0.3,1+bodyH*0.5));}
  // Lateral Z: stronger response to body roll for natural compensation
  for(var leg=0;leg<4;leg++){var ph2=cpgPhase[leg];var legSide=legSides[leg];var swingP=Math.max(0,Math.sin(ph2));var latT=bodyRollNow*(0.6+e.sway*8)+(-bm.bodyRotY)*legSide*0.15+swingP*legSide*0.05;phys.legZPDs[legNames[leg][0]].target=latT;phys.legZPDs[legNames[leg][0]].update(dt);}legFL.rotation.z=phys.legZPDs['legFL'].current;legFR.rotation.z=phys.legZPDs['legFR'].current;legHL.rotation.z=phys.legZPDs['legHL'].current;legHR.rotation.z=phys.legZPDs['legHR'].current;flU.rotation.z=phys.legZPDs['legFL'].current*0.15;frU.rotation.z=phys.legZPDs['legFR'].current*0.15;hlT.rotation.z=phys.legZPDs['legHL'].current*0.15;hrT.rotation.z=phys.legZPDs['legHR'].current*0.15;
  var sb=bm.spineBoost;for(var i=0;i<phys.spineZ.length;i++){if(i===0){phys.spineZ[i].target=Math.sin(cpgPhase[0]*2)*e.sway*(3.0+sb*3);phys.spineX[i].target=Math.sin(cpgPhase[0]*2+1)*e.bob*(2.0+sb*2)+Math.sin(t*0.5+i*0.3)*0.01*(st<0.01?1:0);phys.spineY[i].target=Math.sin(cpgPhase[0]+i*0.4)*e.sway*(2.5+sb*2)+bm.bodyRotY*(i/phys.spineZ.length)*0.3;}else{phys.spineZ[i].target=phys.spineZ[i-1].current*0.7;phys.spineX[i].target=phys.spineX[i-1].current*0.7;phys.spineY[i].target=phys.spineY[i-1].current*0.7;}phys.spineZ[i].update(dt);phys.spineX[i].update(dt);phys.spineY[i].update(dt);spineSegs[i].rotation.z=phys.spineZ[i].current;spineSegs[i].rotation.x=phys.spineX[i].current+Math.sin(t*1.2+i*0.2)*0.008*(st<0.01?1:0);spineSegs[i].rotation.y=phys.spineY[i].current;}
  for(var i=0;i<phys.neckZ.length;i++){if(i===0){phys.neckZ[i].target=phys.spineZ[phys.spineZ.length-1].current*0.5+Math.sin(t*0.4+i*0.2)*0.014*(st<0.01?1:0);phys.neckX[i].target=phys.spineX[phys.spineX.length-1].current*0.5+Math.sin(t*0.5+i*0.1)*0.012*(st<0.01?1:0);phys.neckYR[i].target=phys.spineY[phys.spineY.length-1].current*0.4+Math.sin(t*0.3+i*0.15)*0.025*(st<0.01?1:0)+bm.headY*0.3;}else{phys.neckZ[i].target=phys.neckZ[i-1].current*0.7;phys.neckX[i].target=phys.neckX[i-1].current*0.7;phys.neckYR[i].target=phys.neckYR[i-1].current*0.7;}phys.neckY[i].target=Math.sin(t*0.3+i*0.15)*0.02*(st<0.01?1:0);phys.neckZ[i].update(dt);phys.neckX[i].update(dt);phys.neckY[i].update(dt);phys.neckYR[i].update(dt);neckSegs[i].rotation.z=phys.neckZ[i].current;neckSegs[i].rotation.x=phys.neckX[i].current;neckSegs[i].rotation.y=phys.neckYR[i].current+phys.neckY[i].current;}
  // Head: lifts and sways naturally, not just nods
  phys.headY.target=phys.neckYR[phys.neckYR.length-1].current*0.5+bm.headY+e.headY;
  phys.headX.target=phys.neckX[phys.neckX.length-1].current*0.5+bm.headX+e.headX;
  phys.headZ.target=bm.headZ||Math.sin(t*0.3)*0.008*(st<0.01?1:0);
  // Idle head sway: slow side-to-side + gentle lift
  if(st<0.01){
    phys.headY.target+=Math.sin(t*0.12)*0.06+Math.sin(t*0.07)*0.03;
    phys.headX.target+=Math.sin(t*0.18)*0.012;
  }
  phys.headY.update(dt);phys.headX.update(dt);phys.headZ.update(dt);headGroup.rotation.y=phys.headY.current;headGroup.rotation.x=phys.headX.current;headGroup.rotation.z=phys.headZ.current;
  // NO dynamic muscle Y-scaling: fur always matches mesh
  if(ribcage)ribcage.scale.y=0.76+Math.sin(t*1.2)*0.012*(st<0.01?1:0)+Math.sin(t*0.5)*0.008*(e.tension-0.9);
  var jawRate=emoMode==='joy'?5:emoMode==='flee'?10:emoMode==='hunt'?0.5:0.3;phys.jawPD.target=0.02+Math.abs(Math.sin(t*jawRate))*0.06*(st>0.01?1:0)+bm.jawBoost;phys.jawPD.update(dt);if(jawGroup)jawGroup.rotation.x=phys.jawPD.current+Math.sin(t*0.3)*0.003*(st<0.01?1:0);
  var earDir=Math.sin(t*0.07);var earRate=emoMode==='alert'?1.5:emoMode==='hunt'?0.5:emoMode==='flee'?0.3:0.8;phys.earL.target=e.ear+earDir*0.03+Math.sin(t*earRate)*0.025+Math.sin(t*4)*0.015+bm.earBoost;phys.earR.target=-e.ear+earDir*0.03+Math.sin(t*earRate+1.2)*0.025+Math.sin(t*4+0.5)*0.015+bm.earBoost;phys.earL.update(dt);phys.earR.update(dt);if(earL)earL.rotation.z=phys.earL.current;if(earR)earR.rotation.z=phys.earR.current;
  var tailMood=(Math.sin(t*0.03)+1)*0.5;for(var i=0;i<phys.tailPDs.length;i++){if(i===0)phys.tailPDs[i].y.target=Math.sin(t*e.tailRate)*e.tailAmp*bm.tailBoost*(0.7+tailMood*0.6)+bm.tailDir;else phys.tailPDs[i].y.target=phys.tailPDs[i-1].y.current*0.8;phys.tailPDs[i].x.target=Math.sin(t*0.8+i*0.2)*0.03+bm.tailZ;phys.tailPDs[i].z.target=Math.sin(t*e.tailRate*0.7+i*0.2)*0.02;phys.tailPDs[i].y.update(dt);phys.tailPDs[i].x.update(dt);phys.tailPDs[i].z.update(dt);tailSegs[i].rotation.y=phys.tailPDs[i].y.current;tailSegs[i].rotation.x=phys.tailPDs[i].x.current;tailSegs[i].rotation.z=phys.tailPDs[i].z.current;}
  var bt2=t%4.0,blink=1.0;if(bt2<0.12)blink=1.0-(bt2/0.12)*0.7;else if(bt2<0.24)blink=0.3+((bt2-0.12)/0.12)*0.7;if(lidTL)lidTL.scale.y=0.32*blink;if(lidTR)lidTR.scale.y=0.32*blink;
  fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);controls.update();composer.render();
}
addEventListener('resize',function(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});
init();

/* ==================== W12-PORTAL-BRÜCKE (AnazhRealm-Heimat) ==================== */
/* Das fachwerk.js-/schmiede.js-Muster: enter/ready-Handshake, die DSL spricht die
   ECHTEN UI-Pfade — die vier Gattungen leben als #presets-Buttons (data-p, click()
   = exakt der Nutzer-Pfad, Slider + buildAnimal laufen), die sechs Bewegungs-
   profile als #emotions-Buttons (data-e, click() → emo.set). Die DSL-Wörter sind
   deutsch (Registry == Brücke wortgleich, Umlaute ASCII-gefaltet: baer), die
   Tabellen mappen auf die Lab-Werte. Esc meldet die Heimkehr. */
(function () {
    if (typeof window === "undefined" || !window.parent || window.parent === window) return;
    function post(m) {
        try {
            window.parent.postMessage(m, "*");
        } catch (_e) {}
    }
    var GATTUNG = { wolf: "wolf", fuchs: "fox", baer: "bear", hirsch: "deer" };
    var EMOTION = {
        entspannt: "idle",
        freude: "joy",
        jagd: "hunt",
        flucht: "flee",
        wachsam: "alert",
        showcase: "showcase",
    };
    var DSL = Object.keys(GATTUNG).concat(Object.keys(EMOTION));
    var LABEL = "Tetrapoda — Evolution Lab";
    function clickBtn(sel) {
        var b = document.querySelector(sel);
        if (b) b.click();
        return !!b;
    }
    window.addEventListener("message", function (ev) {
        if (ev.source !== window.parent) return;
        var msg = ev.data;
        if (!msg || typeof msg !== "object") return;
        if (msg.type === "enter") {
            post({ type: "ready", world: "tetrapoda", label: LABEL, dsl: DSL });
        } else if (msg.type === "dsl" && Array.isArray(msg.program)) {
            for (var i = 0; i < msg.program.length; i++) {
                var op = msg.program[i];
                var word = String((op && op[0]) || op || "")
                    .toLowerCase()
                    .trim();
                if (GATTUNG[word]) clickBtn('#presets button[data-p="' + GATTUNG[word] + '"]');
                else if (EMOTION[word]) clickBtn('#emotions button[data-e="' + EMOTION[word] + '"]');
            }
        }
    });
    window.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape") post({ type: "exit", world: "tetrapoda" });
    });
    post({ type: "ready", world: "tetrapoda", label: LABEL, dsl: DSL });
})();

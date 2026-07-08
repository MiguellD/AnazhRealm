var SLIDERS=[
  ['VOK','h'],
  ['wMason','Mauerwerk',0,1,0.01,0.0,'',1],['wBraid','Geflecht',0,1,0.01,1.0,'',1],['wMono','Monolith',0,1,0.01,0.0,'',1],['wLace','Filigran',0,1,0.01,0.25,'',1],
  ['DEP','h'],
  ['orders','Ordnungen',1,9,1,3,'Staffel-Ebenen (Türfreiheit autom.)',2],['depth','Tiefe',0,1,0.01,0.45,'z-Staffelung Rahmen',2],['wave','Welle',0,1,0.01,0.45,'Oberflächen-Verformung (z)',2],['tunnel','Innentiefe',0,1,0.01,0.6,'Raymarch-Tiefe',2],['fractal','Fraktal',0,1,0.01,0.6,'Innen-Selbstähnlichkeit',2],['twist','Drall',0,1,0.01,0.4,'Drall',2],
  ['realm','Innenwelt',0,1,0.01,0.0,'Wurmloch↔Kristall',2],['swirl','Sog',0,1,0.01,0.3,'Gravitationslinse',2],['reflect','Spiegel',0,1,0.01,0.5,'Oberflächen-Spiegelung',2],['fog','Nebel',0,1.6,0.01,0.85,'Bodennebel (volumetrisch)',2],
  ['FORM','h'],
  ['k','Spitze',1.0,3.4,0.01,2.6,''],['rise','Stich',0.55,1.25,0.01,1.0,''],['ogee','Ogee',0,1,0.01,0,''],['horse','Hufeisen',0,1,0.01,0,''],['aspect','Schlank',1.4,2.8,0.01,2.4,''],['mass','Dicke',0,1,0.01,0.7,''],
  ['MAT','h'],
  ['metal','Metall',0,1,0.01,0.5,''],['glow','Glut',0,1,0.01,0.4,''],['hue','Farbe',0,1,0.01,0.45,''],['weather','Alter',0,1,0.01,0.1,''],['ruin','Ruine',0,1,0.01,0,''],['temp','Schwelle°',0,1,0.01,0.5,''],['energy','Energie',0,1,0.01,0.6,'']
];
var PRESETS={
  Drachentor:{wMason:0,wBraid:1,wMono:0,wLace:0.25,orders:2,depth:0.45,wave:0.5,tunnel:0.65,fractal:0.6,twist:0.5,realm:0.25,swirl:0.5,reflect:0.55,k:2.6,rise:1,ogee:0,horse:0,aspect:2.4,mass:0.7,metal:0.55,glow:0.45,hue:0.5,weather:0.1,ruin:0,temp:0.5,energy:0.6},
  Kathedrale:{wMason:0.95,wBraid:0,wMono:0.15,wLace:0.8,orders:4,depth:0.75,wave:0.3,tunnel:0.5,fractal:0.4,twist:0.2,realm:0.7,swirl:0.2,reflect:0.35,k:2.6,rise:1,ogee:0,horse:0,aspect:2.45,mass:0.8,metal:0.1,glow:0.15,hue:0.1,weather:0.3,ruin:0,temp:0.85,energy:0.3},
  Maschine:{wMason:0,wBraid:0.25,wMono:0.95,wLace:0.1,orders:3,depth:0.55,wave:0.4,tunnel:0.85,fractal:0.7,twist:0.6,realm:0.55,swirl:0.35,reflect:0.8,k:2,rise:1,ogee:0,horse:0,aspect:2.1,mass:0.6,metal:0.95,glow:0.5,hue:0.5,weather:0.05,ruin:0,temp:0.12,energy:0.78},
  Geisttor:{wMason:0,wBraid:0,wMono:0.05,wLace:1,orders:2,depth:0.3,wave:0.75,tunnel:0.95,fractal:1,twist:0.85,realm:0.85,swirl:0.7,reflect:0.3,k:2.4,rise:1.1,ogee:0.5,horse:0,aspect:2.3,mass:0.5,metal:0.4,glow:1,hue:0.6,weather:0,ruin:0,temp:0.6,energy:0.85},
  Verkalkt:{wMason:0.55,wBraid:0.55,wMono:0.1,wLace:0.3,orders:3,depth:0.55,wave:0.45,tunnel:0.6,fractal:0.5,twist:0.4,realm:0.45,swirl:0.4,reflect:0.5,k:2.4,rise:1,ogee:0,horse:0,aspect:2.2,mass:0.75,metal:0.4,glow:0.3,hue:0.3,weather:0.4,ruin:0,temp:0.6,energy:0.4},
  Ruine:{wMason:0.85,wBraid:0,wMono:0.1,wLace:0.2,orders:2,depth:0.6,wave:0.3,tunnel:0.45,fractal:0.3,twist:0.2,realm:0.2,swirl:0.15,reflect:0.25,k:1,rise:1,ogee:0,horse:0,aspect:1.55,mass:0.8,metal:0.1,glow:0.1,hue:0.2,weather:0.85,ruin:0.6,temp:0.5,energy:0.2},
  Maurentor:{wMason:0.7,wBraid:0.3,wMono:0.1,wLace:0.45,orders:3,depth:0.5,wave:0.4,tunnel:0.6,fractal:0.5,twist:0.3,realm:0.6,swirl:0.3,reflect:0.45,k:1.2,rise:1,ogee:0,horse:0.8,aspect:1.95,mass:0.7,metal:0.25,glow:0.3,hue:0.35,weather:0.3,ruin:0,temp:0.78,energy:0.35}
};

var scene,camera,renderer,composer,fxaa,cinePass,controls,clock;
var gate,membrane,memMat,rimMat,D,rebuildTimer=null,leafL=null,leafR=null,leafLB=null,leafRB=null,doorAngle=0,doorAngleB=0,doorTarget=0,doorTargetB=0,portalLight,fogGroup=null,fogMat=null,depthRT=null,DOOR_OPEN=1.95;
function lerp(a,b,t){return a+(b-a)*t;}function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function archProfile(p,steps){
  steps=steps||56;var M=p.M,k=Math.max(1.0,p.k),R=k*M,cx=(k-1)*M,i,x,y;var P=[];
  for(i=0;i<=steps;i++){x=-M+2*M*i/steps;var c=(x<=0)?cx:-cx;y=Math.sqrt(Math.max(0,R*R-(x-c)*(x-c)));P.push([x,y]);}
  for(i=0;i<P.length;i++)P[i][1]*=p.riseScale;
  if(p.ogee>0)for(i=0;i<P.length;i++){var f=Math.abs(P[i][0]/M);P[i][1]+=p.ogee*M*0.20*Math.sin(f*Math.PI)*(1-f);if(f<0.25)P[i][1]+=p.ogee*M*0.24*(1-f/0.25);}
  if(p.horseshoe>0)for(i=0;i<P.length;i++){var xr=Math.abs(P[i][0]/M);P[i][1]+=p.horseshoe*M*0.26*(1-Math.min(1,xr));P[i][0]*=(1-p.horseshoe*0.12*xr);}
  var rise=0;for(i=0;i<P.length;i++)rise=Math.max(rise,P[i][1]);
  var Q=[P[0]];for(i=1;i<P.length;i++)if(P[i][0]>Q[Q.length-1][0]+1e-5)Q.push(P[i]);
  return {pts:Q,rise:rise};
}
function interpTop(prof,x){var p=prof.pts;if(x<=p[0][0])return p[0][1];if(x>=p[p.length-1][0])return p[p.length-1][1];for(var i=1;i<p.length;i++)if(p[i][0]>=x){var t=(x-p[i-1][0])/(p[i][0]-p[i-1][0]);return p[i-1][1]+t*(p[i][1]-p[i-1][1]);}return 0;}
function deriveGate(p){
  var M=p.M,span=2*M,baseY=0,prof=archProfile(p,56),rise=prof.rise;
  var jambH=clamp(p.aspect*span-rise,span*0.4,span*3.2),springY=baseY+jambH,apexY=springY+rise;
  var thrustNorm=(M*Math.sqrt(3))/Math.max(0.25,rise),jambW=clamp(M*0.5*thrustNorm*p.mass,0.02,M*1.7);
  return {M:M,span:span,baseY:baseY,prof:prof,rise:rise,jambH:jambH,springY:springY,apexY:apexY,aspect:(apexY-baseY)/span,thrustNorm:thrustNorm,jambW:jambW,p:p,leftSpringX:prof.pts[0][0],rightSpringX:prof.pts[prof.pts.length-1][0],centerY:baseY+jambH*0.58};
}

// ---- Hilfen ----
function tubeMesh(pts,r,m,seg,rad){return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'centripetal'),seg||140,r,rad||8,false),m);}
function torusMesh(R,r,m,x,y,z){var me=new THREE.Mesh(new THREE.TorusGeometry(R,r,8,20),m);me.position.set(x,y,z);return me;}
function barBetween(x0,y0,x1,y1,m,z,th){var dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||0.01;var b=new THREE.Mesh(new THREE.BoxGeometry(len,th||0.04,0.1),m);b.position.set((x0+x1)/2,(y0+y1)/2,z);b.rotation.z=Math.atan2(dy,dx);return b;}
function quadBlock(c,depth,mat,zOff,jit){var cx=(c[0].x+c[1].x+c[2].x+c[3].x)/4,cy=(c[0].y+c[1].y+c[2].y+c[3].y)/4;var sh=new THREE.Shape();sh.moveTo(c[0].x-cx,c[0].y-cy);sh.lineTo(c[1].x-cx,c[1].y-cy);sh.lineTo(c[2].x-cx,c[2].y-cy);sh.lineTo(c[3].x-cx,c[3].y-cy);sh.lineTo(c[0].x-cx,c[0].y-cy);var g=new THREE.ExtrudeGeometry(sh,{depth:depth,bevelEnabled:true,bevelThickness:0.015,bevelSize:0.015,bevelSegments:1});g.translate(0,0,-depth/2);var me=new THREE.Mesh(g,mat);me.position.set(cx,cy,zOff+jit);me.castShadow=me.receiveShadow=true;return me;}
// in-plane Normalen entlang Pfad (auswaerts vom Aperturzentrum)
function normalsAlong(pts,refY){var N=pts.length,F=[];for(var i=0;i<N;i++){var a=pts[Math.max(0,i-1)],b=pts[Math.min(N-1,i+1)];var tx=b.x-a.x,ty=b.y-a.y,L=Math.hypot(tx,ty)||1;tx/=L;ty/=L;var nx=-ty,ny=tx;if((pts[i].x)*nx+(pts[i].y-refY)*ny<0){nx=-nx;ny=-ny;}F.push([nx,ny]);}return F;}

// ============================================================
//  EIN BUILDER — Strategien × ORDNUNGEN (gestaffelt, zurueckweichend)
// ============================================================
function buildGate(p){
  if(!p)p=readParams();
  if(gate)scene.remove(gate);
  D=deriveGate(p);var rng=mulberry32(0x50FA);
  var M=D.M,baseY=D.baseY,springY=D.springY,apexY=D.apexY,jambW=D.jambW,prof=D.prof;
  var frameDepth=Math.max(0.4,M*0.7),refY=baseY+D.jambH*0.5;
  var depthStep=(frameDepth*0.6)*(0.4+p.depth),ordersUser=Math.max(1,Math.round(p.orders));
  var orders=(p.wLace>0.03)?Math.max(ordersUser,1+Math.ceil(1.0/Math.max(0.18,depthStep))):ordersUser;   // Türfreiheit als Funktion der Tiefe, nicht fix 5
  D.orders=orders;D.depthStep=depthStep;D.zFace=(orders-1)*depthStep+0.06;
  gate=new THREE.Group();
  var stone=new THREE.Color().setHSL(0.62-(0.62-0.07)*p.hue,0.16+0.14*p.hue,0.40);
  var fmat=new THREE.MeshStandardMaterial({color:stone,roughness:lerp(0.88,0.16,p.metal),metalness:lerp(0.05,0.97,p.metal),emissive:new THREE.Color().setHSL(0.09,0.7,0.5),emissiveIntensity:lerp(0.04,0.55,p.glow)});
  var amat=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(0.11,0.6,0.55),roughness:0.28,metalness:1.0,emissive:0x2a1c06,emissiveIntensity:0.3+0.6*p.glow});
  var bmatG=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(0.11,0.7,0.55),roughness:0.2,metalness:1.0,emissive:new THREE.Color().setHSL(0.09,0.8,0.4),emissiveIntensity:0.4+0.6*p.glow});
  var bmatB=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(0.6,0.7,0.5),roughness:0.28,metalness:0.92,emissive:new THREE.Color().setHSL(0.62,0.8,0.35),emissiveIntensity:0.4+0.5*p.glow});
  var laceMat=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(0.11,0.7,0.6).multiplyScalar(0.55+1.05*Math.max(p.glow,0.25))});
  rimMat=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(0.11,0.6,0.55).multiplyScalar(0.55+1.5*Math.max(p.glow,0.25))});

  // ---- symmetrische Halbkante (Basis->Scheitel) + Normalen, einmal ----
  var nJ=7,j,half=[];
  for(j=0;j<=nJ;j++)half.push(new THREE.Vector3(D.leftSpringX,baseY+(springY-baseY)*j/nJ,0));
  for(var i=0;i<prof.pts.length;i++)if(prof.pts[i][0]<=1e-6)half.push(new THREE.Vector3(prof.pts[i][0],springY+prof.pts[i][1],0));
  var H=[half[0]];for(i=1;i<half.length;i++)if(half[i].distanceToSquared(H[H.length-1])>1e-6)H.push(half[i]);
  var hc=new THREE.CatmullRomCurve3(H,false,'centripetal'),hLen=hc.getLength();
  var Nh=Math.max(5,Math.round(hLen/(M*0.42)));var sp=hc.getSpacedPoints(Nh),nrm=normalsAlong(sp,refY);
  // volle Kante (Pfosten-Bogen-Pfosten) fuer Geflecht/Monolith
  var full=[];for(j=0;j<=nJ;j++)full.push(new THREE.Vector3(D.leftSpringX,baseY+(springY-baseY)*j/nJ,0));
  for(i=0;i<prof.pts.length;i++)full.push(new THREE.Vector3(prof.pts[i][0],springY+prof.pts[i][1],0));
  for(j=0;j<=nJ;j++)full.push(new THREE.Vector3(D.rightSpringX,springY-(springY-baseY)*j/nJ,0));
  var FU=[full[0]];for(i=1;i<full.length;i++)if(full[i].distanceToSquared(FU[FU.length-1])>1e-6)FU.push(full[i]);
  var fnrm=normalsAlong(FU,refY);

  function offsetFull(off){var o=[];for(var i=0;i<FU.length;i++)o.push(new THREE.Vector3(FU[i].x+fnrm[i][0]*off,FU[i].y+fnrm[i][1]*off,0));return o;}

  // ======== Pro ORDNUNG: zurueckweichend in z, nach aussen versetzt ========
  for(var o=0;o<orders;o++){
    var outOff=o*jambW, dep=frameDepth*(1+o*0.18), dens=(o===0?1:(o===1?0.7:0.5));
    var zoffs=(o===0)?[0]:[o*depthStep,-o*depthStep];                       // symmetrisch um z=0 → beidseitig durchgehbar
    for(var zi=0;zi<zoffs.length;zi++){var zO=zoffs[zi];
      if(p.wMason>0.03){var rad=jambW*p.wMason;
        for(i=0;i<Nh-1;i++){
          var inA=new THREE.Vector3(sp[i].x+nrm[i][0]*outOff,sp[i].y+nrm[i][1]*outOff,0);
          var inB=new THREE.Vector3(sp[i+1].x+nrm[i+1][0]*outOff,sp[i+1].y+nrm[i+1][1]*outOff,0);
          var ouA=new THREE.Vector3(sp[i].x+nrm[i][0]*(outOff+rad),sp[i].y+nrm[i][1]*(outOff+rad),0);
          var ouB=new THREE.Vector3(sp[i+1].x+nrm[i+1][0]*(outOff+rad),sp[i+1].y+nrm[i+1][1]*(outOff+rad),0);
          if(!(p.ruin>0&&rng()<p.ruin*0.4))gate.add(quadBlock([inA,inB,ouB,ouA],dep,fmat,zO,(rng()-0.5)*p.weather*0.02));
          if(!(p.ruin>0&&rng()<p.ruin*0.4)){var mA=inA.clone();mA.x*=-1;var mB=inB.clone();mB.x*=-1;var oA=ouA.clone();oA.x*=-1;var oB=ouB.clone();oB.x*=-1;gate.add(quadBlock([mB,mA,oA,oB],dep,fmat,zO,(rng()-0.5)*p.weather*0.02));}
        }
      }
      if(p.wBraid>0.03&&(o<2||orders<3)){
        var oc=offsetFull(outOff+jambW*0.5),Fb=new THREE.CatmullRomCurve3(oc,false,'centripetal').getSpacedPoints(280);
        var fn=normalsAlong(Fb,refY),rho=jambW*0.5*p.wBraid,fib=lerp(0.02,0.05,p.wBraid)*dens,turns=14,zoBr=zO;
        var strands=function(cnt,rh,hd,ph0,mat){for(var c=0;c<cnt;c++){var ph=ph0+c*(Math.PI*2/cnt)+rng()*0.1;var pts=[];for(var q=0;q<Fb.length;q++){var s=q/(Fb.length-1),er=Math.min(s,1-s),ramp=Math.max(0,1-er/0.12),rE=rh*(1+0.7*ramp),ang=ph+hd*turns*2*Math.PI*s;var off=Math.cos(ang)*rE,zz=Math.sin(ang)*rE;pts.push(new THREE.Vector3(Fb[q].x+fn[q][0]*off,Fb[q].y+fn[q][1]*off-ramp*0.18,zoBr+zz));}var t=tubeMesh(pts,fib,mat,240,6);t.castShadow=true;gate.add(t);}};
        var ns=Math.round(6*dens);strands(ns,rho*1.05,1,0,bmatG);strands(ns,rho*0.8,-1,Math.PI/6,bmatB);
      }
      if(p.wMono>0.03){var oc2=offsetFull(outOff+jambW*0.5),mt=tubeMesh(oc2,jambW*0.5*p.wMono+0.01,fmat,170,12);mt.position.z=zO;mt.castShadow=true;gate.add(mt);}
      if(o===0&&p.wMason>0.03){var rad2=jambW*p.wMason,ay=springY+D.rise;                       // Schlussstein zentral (von beiden Seiten sichtbar)
        var kb=new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.12,M*0.28),rad2*1.25,dep*1.15),fmat);kb.position.set(0,ay+rad2*0.12,0);kb.castShadow=true;gate.add(kb);
        var jw=new THREE.Mesh(new THREE.OctahedronGeometry(rad2*0.34,0),amat);jw.position.set(0,ay+rad2*0.12,0);gate.add(jw);}
    }
  }
  // --- TÜREN: vordere (E) + hintere (R) Flügel, beide an der vordersten Maueröffnung gelagert ---
  if(p.wLace>0.03){
    var zFace=D.zFace, nMull=Math.round(lerp(1,5,p.wLace));
    var frontOff=(orders-1)*jambW, FB=offsetFull(frontOff), apexIdx=0;        // vorderste Öffnung (= innere Kante des vordersten Ordens)
    for(var ii=0;ii<FB.length;ii++)if(FB[ii].y>FB[apexIdx].y)apexIdx=ii;
    var lxg=FB[0].x, rxg=FB[FB.length-1].x;
    var makeLeaf=function(side,zf){                                            // ein Flügel = halbe Maueröffnung, gelagert an der Außenkante
      var grp=new THREE.Group();
      var seg=side<0?FB.slice(0,apexIdx+1):FB.slice(apexIdx).reverse();        // von Außenkante(unten) → Scheitel(Mitte)
      var hingeX=seg[0].x, apexX=seg[seg.length-1].x, apY=seg[seg.length-1].y;
      grp.add(tubeMesh(seg,0.05,laceMat,Math.max(48,seg.length*4),6));         // Außenstiel + Bogen folgen dem Stein
      // (kein mittiger Schlagstiel — er stand als Balken vor dem Sheet; die Flügel treffen sich am Maßwerk-Rand & Bogenscheitel)
      grp.add(barBetween(hingeX,baseY+0.02,apexX,baseY+0.02,laceMat,0,0.05));  // unteres Holz auf der Schwelle
      grp.add(barBetween(hingeX,springY,apexX,springY,laceMat,0,0.05));        // Kämpferholz
      if(D.jambH>2.0)grp.add(barBetween(hingeX,baseY+D.jambH*0.5,apexX,baseY+D.jambH*0.5,laceMat,0,0.045));
      var segTopY=function(x){var best=baseY;for(var si=0;si<seg.length-1;si++){var pa=seg[si],pb=seg[si+1];if((pa.x-x)*(pb.x-x)<=0.0&&Math.abs(pb.x-pa.x)>1e-5){var tt=(x-pa.x)/(pb.x-pa.x),yy=pa.y+tt*(pb.y-pa.y);if(yy>best)best=yy;}}return best;};
      var nM2=Math.max(2,Math.round(2+nMull*0.6)),innerXs=[];                  // Pfosten bis zur BOGENLINIE (füllt das Feld)
      for(var k=1;k<=nM2;k++){var fx=hingeX+(apexX-hingeX)*k/(nM2+1);innerXs.push(fx);grp.add(barBetween(fx,baseY+0.02,fx,segTopY(fx)-0.03,laceMat,0,0.04));}
      var edgesX=[hingeX].concat(innerXs,[apexX]);
      for(var bj=0;bj<edgesX.length-1;bj++){                                   // je Feld: Haupt-Spitzbogen + verschachtelte Sub-Tracery (Tiefe)
        var a0=edgesX[bj],a1=edgesX[bj+1],am=(a0+a1)/2,ww=Math.abs(a1-a0);if(Math.abs(am)<0.42)continue;  // nur innerstes Feld frei → Mittelnaht sauber (volle Tracery sonst)
        var topF=Math.min(segTopY(am)-0.04, springY+ww*1.15);
        var Lp=[],Rp=[];for(var s=0;s<=8;s++){var tt=s/8;Lp.push(new THREE.Vector3(lerp(a0,am,tt),lerp(springY,topF,tt*tt),0));Rp.push(new THREE.Vector3(lerp(a1,am,tt),lerp(springY,topF,tt*tt),0));}
        grp.add(tubeMesh(Lp,0.022,laceMat,20,5));grp.add(tubeMesh(Rp,0.022,laceMat,20,5));
        if(ww>0.46){                                                           // NESTED Sub-Tracery auf ALLEN Feldern (volle gotische Tiefe — nicht abtragen)
          var subTop=springY+(topF-springY)*0.60, qL=(a0+am)/2, qR=(am+a1)/2;
          grp.add(barBetween(am,springY,am,subTop+0.03,laceMat,0,0.018));
          var sA=[],sB=[],sC=[],sD=[];for(var s2=0;s2<=6;s2++){var u=s2/6;
            sA.push(new THREE.Vector3(lerp(a0,qL,u),lerp(springY,subTop,u*u),0));sB.push(new THREE.Vector3(lerp(am,qL,u),lerp(springY,subTop,u*u),0));
            sC.push(new THREE.Vector3(lerp(am,qR,u),lerp(springY,subTop,u*u),0));sD.push(new THREE.Vector3(lerp(a1,qR,u),lerp(springY,subTop,u*u),0));}
          grp.add(tubeMesh(sA,0.012,laceMat,14,4));grp.add(tubeMesh(sB,0.012,laceMat,14,4));grp.add(tubeMesh(sC,0.012,laceMat,14,4));grp.add(tubeMesh(sD,0.012,laceMat,14,4));
          var foilR=Math.min(ww*0.15,0.12),foilY=subTop+(topF-subTop)*0.55,nFoil=4+Math.floor((p.realm*3.0+Math.abs(am)*1.7)%3.0);grp.add(torusMesh(foilR*0.5,0.010,laceMat,am,foilY,0));for(var pf=0;pf<nFoil;pf++){var pfa=pf/nFoil*6.2831+p.realm*1.5;grp.add(torusMesh(foilR*0.42,0.009,(p.wBraid>0.25&&pf%2)?bmatB:laceMat,am+Math.cos(pfa)*foilR*0.6,foilY+Math.sin(pfa)*foilR*0.6,0));}  // Mehrpass: Blattzahl aus realm+Feld (symmetrisch); Geflecht>0.25 → blaue Akzente = Verschmelzung Braid×Lace
          grp.add(torusMesh(ww*0.07,0.008,laceMat,qL,subTop*0.5+springY*0.5+0.05,0));                 // Dreipass in Sub-Zwickeln
          grp.add(torusMesh(ww*0.07,0.008,laceMat,qR,subTop*0.5+springY*0.5+0.05,0));
        }
        var zw=segTopY(am)-topF;if(zw>0.09)grp.add(torusMesh(Math.min(ww*0.17,zw*0.42),0.013,laceMat,am,topF+zw*0.5,0));
      }
      var oRos=Math.min(0.15,Math.abs(apexX-hingeX)*0.16);                     // Halb-Rose am Scheitel (zwei Flügel → volle Rose) — Math.abs: auch rechter Flügel
      if(oRos>0.05){var oy=apY-oRos*1.7;grp.add(torusMesh(oRos,0.016,laceMat,apexX,oy,0));var nf=5;for(var fi=0;fi<nf;fi++){var fa=fi/nf*6.2831;grp.add(torusMesh(oRos*0.33,0.011,laceMat,apexX+Math.cos(fa)*oRos*0.62,oy+Math.sin(fa)*oRos*0.62,0));}}
      // (kein mittiger Griff — E/R öffnet; nichts soll vor dem Sheet stehen)
      grp.children.forEach(function(c){c.position.x-=hingeX;});grp.position.set(hingeX,0,zf);grp.userData.side=side;return grp;
    };
    leafL=makeLeaf(-1,zFace);leafR=makeLeaf(1,zFace);leafLB=makeLeaf(-1,-zFace);leafRB=makeLeaf(1,-zFace);
    leafL.rotation.y=-doorAngle;leafR.rotation.y=doorAngle;leafLB.rotation.y=doorAngleB;leafRB.rotation.y=-doorAngleB;  // vorne→+z, hinten→-z
    gate.add(leafL);gate.add(leafR);gate.add(leafLB);gate.add(leafRB);
    var hxA=[lxg,rxg];                                                          // Scharniere an beiden Maueröffnungen → am Stein, Bügel zur Tür
    for(var zfi=0;zfi<2;zfi++){var zf=zfi===0?zFace:-zFace;for(var hsI=0;hsI<2;hsI++){var hx=hxA[hsI],hsg=hsI===0?-1:1;for(var hk=0;hk<5;hk++){var hy=baseY+0.2+hk*((springY-baseY-0.35)/4);var cyl=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,0.26,10),amat);cyl.position.set(hx,hy,zf);cyl.castShadow=true;gate.add(cyl);var br=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.045,0.06),amat);br.position.set(hx-hsg*0.08,hy,zf);gate.add(br);}}}
  }
  // --- FUNDAMENT: parametrisches Vokabular (abgeleitet aus Strategie × Masse × Ruine) ---
  var fullW=2*(M+jambW*orders),baseDepth=frameDepth+0.6+depthStep*2*orders,baseZ=0;
  if(p.wMason*p.mass>0.05){var nStep=1+Math.round(p.wMason*2),sH=0.12+0.32*p.mass;          // 1) Stylobat: zurueckspringende Stufen
    for(var st=0;st<nStep;st++){var sw=fullW+0.4+st*0.7,sd2=baseDepth+st*0.7;var me=new THREE.Mesh(new THREE.BoxGeometry(sw,sH,sd2),fmat);me.position.set(0,baseY-sH/2-st*sH,baseZ);me.castShadow=me.receiveShadow=true;gate.add(me);}}
  if(p.wBraid*p.mass>0.05){var nR=Math.round(lerp(3,7,p.wBraid)),jx=Math.abs(D.leftSpringX)+jambW*0.5;   // 2) Wurzeln am PFOSTENFUSS (außen), tauchen schräg in den Boden — nie in Öffnung/Sheet-Ebene
    for(var sdb=-1;sdb<=1;sdb+=2)for(var rr2=0;rr2<nR;rr2++){var spread=0.16+rr2*0.13,zr=(rr2-(nR-1)*0.5)*0.16;
      var pts=[new THREE.Vector3(sdb*jx,baseY+0.05,zr*0.5),new THREE.Vector3(sdb*(jx+spread*0.6),baseY-0.18,zr*0.9),new THREE.Vector3(sdb*(jx+spread),baseY-0.50-rr2*0.05,zr*1.3)];
      var tb=tubeMesh(pts,0.05+0.03*(1-rr2/nR),(rr2%2)?bmatB:bmatG,36,5);tb.castShadow=true;gate.add(tb);}}
  if(p.wMono*p.mass>0.05){var pw=fullW+0.5,ph=0.2+0.3*p.mass;                                // 3) Tech-Podest mit Leuchtnaht
    var pl=new THREE.Mesh(new THREE.BoxGeometry(pw,ph,baseDepth+0.3),fmat);pl.position.set(0,baseY-ph/2,baseZ);pl.castShadow=pl.receiveShadow=true;gate.add(pl);
    var seam=new THREE.Mesh(new THREE.BoxGeometry(pw*0.9,0.03,baseDepth*0.25),rimMat);seam.position.set(0,baseY-ph+0.05,baseZ+baseDepth*0.25);gate.add(seam);}
  if(p.glow>0.3||(p.wLace>0.4&&p.mass<0.4)){var rg=new THREE.Mesh(new THREE.TorusGeometry(M+jambW*0.5+0.3,0.05+0.05*p.glow,10,48),rimMat);rg.rotation.x=Math.PI/2;rg.position.set(0,baseY+0.02,baseZ);gate.add(rg);  // 4) Leuchtende Dais
    var disc=new THREE.Mesh(new THREE.CircleGeometry(M+jambW*0.5,40),new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(0.11,0.5,0.5).multiplyScalar(0.3+p.glow),transparent:true,opacity:0.2+0.4*p.glow,side:THREE.DoubleSide}));disc.rotation.x=-Math.PI/2;disc.position.set(0,baseY+0.012,baseZ);gate.add(disc);}
  if(p.ruin>0.2){var nRub=Math.round(p.ruin*8);for(var rbk=0;rbk<nRub;rbk++){var rsz=0.15+rng()*0.38;var rk=new THREE.Mesh(new THREE.BoxGeometry(rsz,rsz*0.7,rsz),fmat);rk.position.set((rng()-0.5)*fullW*1.3,baseY+rsz*0.3,baseZ+(rng()-0.5)*baseDepth*0.6);rk.rotation.set(rng()*1.5,rng()*3,rng()*1.5);rk.castShadow=true;gate.add(rk);}}  // 5) Schutt

  // --- gluehende Apertur-Kante (Trichter) ---
  var rimPts=[];for(i=0;i<prof.pts.length;i++)rimPts.push(new THREE.Vector3(prof.pts[i][0],springY+prof.pts[i][1],0.0));gate.add(tubeMesh(rimPts,0.04,rimMat,170,8));

  scene.add(gate);buildMembrane();buildFog();controls.target.set(0,D.springY*0.55,0);controls.update();updateLaw();
}

// ============================================================
//  PASSAGE — VERFORMTE 3D-Oberflaeche (Wasser, extrem) + RAYMARCH.
//  Echte z-Verformung (Geometrie faengt Licht) + weltverankerter
//  Strahlmarsch ins fraktale Innere = echte Parallaxe. Kein flaches Sheet.
// ============================================================
function buildMembrane(){
  if(membrane)scene.remove(membrane);
  var prof=D.prof,springY=D.springY,baseY=D.baseY,M=D.M,p=D.p;
  var left=D.leftSpringX,right=D.rightSpringX,apexY=D.apexY;
  var spanW=right-left,height=apexY-baseY,midY=(baseY+apexY)/2;
  // Bogen-Oberkante als DataTexture (robuste Beschneidung im Shader, statt GLSL-Array)
  var W=64,data=new Uint8Array(W*4);
  for(var i=0;i<W;i++){var xx=left+spanW*i/(W-1);var ty=interpTop(prof,xx)+springY;var tn=clamp((ty-baseY)/Math.max(0.001,height),0,1);var b=Math.round(tn*255);data[i*4]=b;data[i*4+1]=b;data[i*4+2]=b;data[i*4+3]=255;}
  var topTex=new THREE.DataTexture(data,W,1,THREE.RGBAFormat);topTex.minFilter=THREE.LinearFilter;topTex.magFilter=THREE.LinearFilter;topTex.needsUpdate=true;
  var warm=[1.95,1.45,0.85],cold=[0.4,0.6,1.5],core=[lerp(cold[0],warm[0],p.temp),lerp(cold[1],warm[1],p.temp),lerp(cold[2],warm[2],p.temp)];
  var centerW=new THREE.Vector3(0,baseY+D.jambH*0.55,0.0);
  // SATURIERTE Kosinus-Palette (IQ): a+b·cos(2π(c·t+d)). Familie aus temp, Sättigung aus energy, Verschiebung aus realm.
  var dWarm=[0.00,0.12,0.20],dCool=[0.60,0.50,0.42],dCryst=[0.30,0.55,0.85];
  var dd=[lerp(dCool[0],dWarm[0],p.temp),lerp(dCool[1],dWarm[1],p.temp),lerp(dCool[2],dWarm[2],p.temp)];
  dd=[lerp(dd[0],dCryst[0],p.realm*0.5),lerp(dd[1],dCryst[1],p.realm*0.5),lerp(dd[2],dCryst[2],p.realm*0.5)];
  var sat=0.42+0.34*p.energy;
  var PA=[0.5,0.5,0.5],PB=[sat,sat,sat],PC=[1.0+p.realm*0.8,1.0+p.realm*0.4,1.0],PD=dd;
  memMat=new THREE.ShaderMaterial({uniforms:{
      uTime:{value:0},uCam:{value:new THREE.Vector3()},
      uTopTex:{value:topTex},uLeft:{value:left},uW:{value:spanW},uBaseY:{value:baseY},uHspan:{value:height},uSpringX:{value:Math.max(Math.abs(left),Math.abs(right))},
      uWave:{value:clamp(p.wave,0,1)},uWaveDepth:{value:Math.max(0.05,D.zFace*0.10)},uRimAx:{value:Math.abs(D.leftSpringX)},uRimAy:{value:(D.apexY-D.baseY)*0.52},uStep:{value:0.06+p.tunnel*0.20},uTwist:{value:p.twist},uFrac:{value:p.fractal},uEnergy:{value:p.energy},uOpen:{value:clamp(0.4+p.energy*0.6,0,1)},uCenter:{value:centerW},
      uRealm:{value:p.realm},uSwirl:{value:p.swirl*0.5},uReflect:{value:p.reflect},uActivate:{value:doorAngle/DOOR_OPEN},uPulse:{value:1},
      uPA:{value:new THREE.Vector3(PA[0],PA[1],PA[2])},uPB:{value:new THREE.Vector3(PB[0],PB[1],PB[2])},uPC:{value:new THREE.Vector3(PC[0],PC[1],PC[2])},uPD:{value:new THREE.Vector3(PD[0],PD[1],PD[2])}},
    side:THREE.DoubleSide,transparent:false,depthWrite:true,
    vertexShader:[
      "precision highp float;uniform float uTime,uWave,uSwirl,uWaveDepth,uRimAx,uRimAy;uniform vec3 uCenter;varying vec2 vXY;varying vec3 vW;varying vec3 vN;",
      "float hash(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}",
      "float vn(vec2 p){vec2 i=floor(p),f=fract(p);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}",
      "float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*vn(p);p=p*2.05+1.3;a*=.5;}return s;}",
      "float Hfull(vec2 q){",
      " vec2 c=q-uCenter.xy;float r=length(c);float a=atan(c.y,c.x);float t=uTime;",
      " float Rb=1.0/sqrt(pow(cos(a)/uRimAx,2.0)+pow(sin(a)/uRimAy,2.0)+1e-4);",   // Randradius in Blickrichtung (Öffnungs-Ellipse)
      " float rr=clamp(r/Rb,0.0,1.4);",                                            // normiert: 1.0 = Sheetrand
      " float twist=a*2.0+uSwirl/(r+0.25);",                                        // gleiche Windung wie Farbspirale → verschmilzt
      " float om=t*3.0,kk=13.8;",                                                   // Wellenzahl skaliert mit Öffnung
      " float outw=sin(rr*kk-om+twist);",                                           // auslaufende Welle
      " float refl=sin((2.0-rr)*kk-om+twist);",                                     // am Rand REFLEKTIERT (Pfad 2-rr) → Interferenz
      " float wave=(outw+refl*0.72)*exp(-rr*0.7);",                                 // stehende Welle, am Rand verdichtet
      " float pierce=sin(t*2.2)*exp(-rr*rr*6.0)*1.5;",                             // zentraler Tropfen-Durchstoß (oszilliert durch)
      " float micro=fbm(c*3.0-vec2(t*0.3))*0.10;",
      " float h=clamp((wave*0.55+pierce+micro)*0.62,-1.0,1.0);",                    // normiert [-1,1]
      " return h*uWaveDepth*(0.65+0.35*uWave);",                                    // Tiefe aus Geometrie ((Ebenen-2)·Schritt), NIE über die Türebene
      "}",
      "void main(){vec2 xy=position.xy;vXY=xy;float e=0.06;float d0=Hfull(xy),dxx=Hfull(xy+vec2(e,0.0)),dyy=Hfull(xy+vec2(0.0,e));",
      " vec3 dx=vec3(e,0.0,dxx-d0),dy=vec3(0.0,e,dyy-d0);vec3 nrm=normalize(cross(dx,dy));",
      " vec3 pos=vec3(xy,d0);vec4 wp=modelMatrix*vec4(pos,1.0);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*nrm);",
      " gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);}"].join('\n'),
    fragmentShader:[
      "precision highp float;uniform float uTime,uLeft,uW,uBaseY,uHspan,uSpringX,uStep,uTwist,uFrac,uEnergy,uOpen,uRealm,uSwirl,uReflect,uActivate,uPulse;uniform vec3 uCam,uCenter,uPA,uPB,uPC,uPD;uniform sampler2D uTopTex;varying vec2 vXY;varying vec3 vW;varying vec3 vN;",
      "float hash(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}",
      "float vn(vec2 p){vec2 i=floor(p),f=fract(p);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}",
      "float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.05+1.3;a*=.5;}return s;}",
      "vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}",
      "vec3 pal(float t){return uPA+uPB*cos(6.28318*(uPC*t+uPD));}",
      "void main(){",
      " float u=clamp((vXY.x-uLeft)/uW,0.0,1.0);float topY=uBaseY+texture2D(uTopTex,vec2(u,0.5)).r*uHspan;",
      " if(vXY.y>topY+0.002||vXY.y<uBaseY-0.002||abs(vXY.x)>uSpringX+0.002)discard;",
      " vec3 N=normalize(vN);vec3 Vd=normalize(uCam-vW);vec3 rd=-Vd;",
      " float w0=max(0.0,1.0-abs(uRealm-0.0)/0.40);",
      " float w1=max(0.0,1.0-abs(uRealm-0.34)/0.40);",
      " float w2=max(0.0,1.0-abs(uRealm-0.67)/0.40);",
      " float w3=max(0.0,1.0-abs(uRealm-1.0)/0.40);",
      " float ws=w0+w1+w2+w3+1e-4;w0/=ws;w1/=ws;w2/=ws;w3/=ws;",
      " vec3 inter=vec3(0.0);float att=1.0;",
      " for(int i=0;i<12;i++){",
      "   vec3 q=vW+rd*(float(i)*uStep+0.04);vec3 rel=q-uCenter;",
      "   float r=max(length(rel.xy),0.003);float ang=atan(rel.y,rel.x);float dep=float(i)*uStep*1.6+r*0.1;",
      "   float t=uTime;float sp=t*(0.3+uEnergy*0.6);float lp=log(r)*2.0-sp;float swirl=ang+uSwirl/r;float frq=1.0+uFrac*2.2;",
      "   float v=0.0,tc=0.0;",
      "   if(w0>0.001){float s0=0.5+0.5*sin(lp*3.0*frq+swirl*2.0+uTwist*dep*4.0);v+=w0*s0*s0;tc+=w0*fract(lp*0.15+0.5*swirl/6.28318);}",
      "   if(w1>0.001){float K=8.0+uFrac*9.0;float fa=abs(mod(swirl,6.28318/K)-3.14159/K);float cc=0.5+0.5*cos(fa*K);v+=w1*cc*cc*cc*(0.5+0.5*sin(lp*4.0*frq));tc+=w1*fract(fa*1.5+lp*0.1);}",
      "   if(w2>0.001){float warp=fbm(vec2(lp*0.7*frq,dep*0.6+sp*0.2));float pf=fbm(vec2(ang*2.4+warp*3.5,dep*1.4*frq-sp*0.5));pf=1.0-abs(2.0*pf-1.0);float plasma=pow(clamp(pf,0.0,1.0),3.0);v+=w2*plasma*1.25;tc+=w2*fract(pf*1.3+lp*0.08+dep*0.15);}",
      "   if(w3>0.001){float n1=fbm(vec2(ang*1.0*frq+sin(lp)*0.6,dep*0.7+sp*0.12));float n2=fbm(vec2(ang*2.2*frq-n1*1.5,dep*1.3+sp*0.2));float neb=pow(clamp(n1*n2*2.0,0.0,1.0),2.0);v+=w3*neb*1.0;tc+=w3*fract(n1*1.2+dep*0.18);}",
      "   v=max(0.0,v-0.10)*1.4;",
      "   float g=v/(1.0+r*r*2.2+dep*0.35);",
      "   inter+=pal(tc)*g*att;att*=0.9;",
      " }",
      " vec3 Rf=reflect(-Vd,N);",
      " float st=step(0.955,hash(floor(Rf.xy*95.0+vec2(Rf.z*5.0))));",
      " vec3 sky=pal(Rf.y*0.5+0.5)*0.30+vec3(st)*0.42;",
      " float fres=pow(1.0-max(dot(N,Vd),0.0),3.0);",
      " float spec=pow(max(dot(Rf,normalize(vec3(0.4,0.7,0.6))),0.0),60.0);",
      " float dc=length((vW-uCenter).xy);float core=exp(-dc*dc*12.0)*(0.5+uOpen*0.5)*(0.7+0.3*sin(uTime*1.4));",
      " vec3 col=inter*1.35+sky*fres*uReflect*0.55+vec3(1.0,0.95,0.85)*spec*1.5*uReflect+pal(0.1)*core*1.0;",
      "  col*=1.4*(0.55+0.55*uActivate)*(0.90+0.13*uPulse);gl_FragColor=vec4(aces(col),1.0);",
      "}"].join('\n')});
  var geo=new THREE.PlaneGeometry(spanW,height,90,90);geo.translate(0,midY,0);
  membrane=new THREE.Mesh(geo,memMat);membrane.position.set(0,0,0.0);membrane.castShadow=false;membrane.frustumCulled=false;scene.add(membrane);
}

function pk(id){return id==='k'?'k':id==='rise'?'riseScale':id==='horse'?'horseshoe':id;}
function readParams(){var p={M:1.4};SLIDERS.forEach(function(s){if(s[1]==='h')return;p[pk(s[0])]=parseFloat(document.getElementById('s_'+s[0]).value);});return p;}
function setParams(v){SLIDERS.forEach(function(s){if(s[1]==='h')return;var el=document.getElementById('s_'+s[0]);if(v[s[0]]!==undefined){el.value=v[s[0]];document.getElementById('v_'+s[0]).textContent=(+v[s[0]]).toFixed(2);}});}
function updateLaw(){var el=document.getElementById('law');if(!el)return;el.textContent='Strategien: Mauer '+D.p.wMason.toFixed(2)+' Geflecht '+D.p.wBraid.toFixed(2)+' Mono '+D.p.wMono.toFixed(2)+' Lace '+D.p.wLace.toFixed(2)+'\nOrdnungen='+Math.round(D.p.orders)+' (gestaffelt, zurückweichend)\nStich='+D.rise.toFixed(2)+'→Schub='+D.thrustNorm.toFixed(2)+'→Dicke='+D.jambW.toFixed(2);}

function init(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x080808);
  camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,0.1,140);camera.position.set(0,3.6,15.6);
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  try{var c=document.createElement('canvas');c.width=256;c.height=256;var x=c.getContext('2d');var g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#aabbcc');g.addColorStop(0.5,'#333');g.addColorStop(1,'#050505');x.fillStyle=g;x.fillRect(0,0,256,256);var t=new THREE.CanvasTexture(c);var pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromEquirectangular(t).texture;t.dispose();}catch(e){}
  scene.add(new THREE.HemisphereLight(0xffffff,0x444444,0.6));
  var key=new THREE.DirectionalLight(0xffe0b0,3.0);key.position.set(5,8,5);key.castShadow=true;key.shadow.mapSize.width=2048;key.shadow.mapSize.height=2048;key.shadow.bias=-0.0001;key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=13;key.shadow.camera.bottom=-4;key.shadow.camera.near=0.5;key.shadow.camera.far=46;scene.add(key);
  var rl=new THREE.DirectionalLight(0x33aaff,2.0);rl.position.set(-5,4,-5);scene.add(rl);
  portalLight=new THREE.PointLight(0xffd9a0,0.3,14,2);portalLight.position.set(0,3,0.4);scene.add(portalLight);
  composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.24,0.5,1.05));
  var _pr=renderer.getPixelRatio()*0.42,_dw=Math.max(2,Math.floor(innerWidth*_pr)),_dh=Math.max(2,Math.floor(innerHeight*_pr));depthRT=new THREE.WebGLRenderTarget(_dw,_dh);depthRT.depthTexture=new THREE.DepthTexture(_dw,_dh);depthRT.depthTexture.type=THREE.UnsignedShortType;
  fxaa=new THREE.ShaderPass(THREE.FXAAShader);fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);composer.addPass(fxaa);
  var cine={uniforms:{tDiffuse:{value:null},time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D tDiffuse;uniform float time;varying vec2 vUv;float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}float getLum(vec2 uv){return dot(texture2D(tDiffuse,uv).rgb,vec3(0.299,0.587,0.114));}void main(){vec2 uv=vUv;vec2 dir=uv-0.5;float dist=length(dir);vec2 o=dir*dist*0.008;float r=texture2D(tDiffuse,uv+o).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-o).b;vec3 color=vec3(r,g,b);float lum=getLum(uv);float lL=getLum(uv-vec2(0.001,0.0)),lR=getLum(uv+vec2(0.001,0.0)),lU=getLum(uv-vec2(0.0,0.001)),lD=getLum(uv+vec2(0.0,0.001));float edge=abs(lL-lum)+abs(lR-lum)+abs(lU-lum)+abs(lD-lum);color*=(1.0+edge*2.0);color*=smoothstep(1.2,0.1,dist*1.3);color+=random(uv+time)*0.03-0.015;gl_FragColor=vec4(color,1.0);}'};
  cinePass=new THREE.ShaderPass(cine);cinePass.renderToScreen=true;composer.addPass(cinePass);
  controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=44;clock=new THREE.Clock();
  var sd=document.getElementById('sliders');
  SLIDERS.forEach(function(s){if(s[1]==='h'){var hd=document.createElement('div');hd.className='h';hd.textContent=s[0]==='VOK'?'— VOKABULAR —':s[0]==='DEP'?'— TIEFE / PASSAGE —':s[0]==='FORM'?'— FORM —':'— MATERIAL / SCHWELLE —';sd.appendChild(hd);return;}var cl=s[7]===1?' voc':s[7]===2?' dep':'';var row=document.createElement('div');row.className='sl'+cl;row.innerHTML='<label>'+s[1]+'</label><input type="range" id="s_'+s[0]+'" min="'+s[2]+'" max="'+s[3]+'" step="'+s[4]+'" value="'+s[5]+'"><span class="v" id="v_'+s[0]+'">'+(+s[5]).toFixed(2)+'</span>';sd.appendChild(row);});
  SLIDERS.forEach(function(s){if(s[1]==='h')return;document.getElementById('s_'+s[0]).addEventListener('input',function(){document.getElementById('v_'+s[0]).textContent=parseFloat(this.value).toFixed(2);clearTimeout(rebuildTimer);rebuildTimer=setTimeout(function(){buildGate();},90);[].forEach.call(document.getElementById('presets').children,function(b){b.classList.remove('active');});});});
  var pc=document.getElementById('presets');Object.keys(PRESETS).forEach(function(name,ix){var b=document.createElement('button');b.textContent=name;if(ix===0)b.className='active';b.onclick=function(){[].forEach.call(pc.children,function(x){x.classList.remove('active');});b.className='active';setParams(PRESETS[name]);buildGate();};pc.appendChild(b);});
  document.getElementById('rnd').onclick=function(){var v={};SLIDERS.forEach(function(s){if(s[1]==='h')return;v[s[0]]=s[4]>=1?Math.round(s[2]+Math.random()*(s[3]-s[2])):s[2]+Math.random()*(s[3]-s[2]);});setParams(v);[].forEach.call(pc.children,function(b){b.classList.remove('active');});buildGate();};
  setParams(PRESETS.Kathedrale);buildGate();animate();
}
function buildFog(){
  if(fogGroup&&fogGroup.parent)scene.remove(fogGroup);
  fogGroup=new THREE.Group();
  var cy=D.baseY+D.jambH*0.55, rimAx=Math.abs(D.leftSpringX), rimAy=(D.apexY-D.baseY)*0.52;
  var coneAdd=(D.orders-1)*D.jambW/rimAx;
  var hx=rimAx*(1.0+coneAdd)*1.08, hz=D.zFace*1.04;
  var mxY=cy+rimAy*(1.0+coneAdd)*1.08, mnY=D.baseY-0.12;                                                        // unten am Boden gekappt → Aura geht nicht durch den Boden
  fogMat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uAct:{value:0},uPulse:{value:1},uCam:{value:new THREE.Vector3()},
      uBoxMin:{value:new THREE.Vector3(-hx,mnY,-hz)},uBoxMax:{value:new THREE.Vector3(hx,mxY,hz)},
      uCenter:{value:new THREE.Vector3(0,cy,0)},uRimAx:{value:rimAx},uRimAy:{value:rimAy},uSwirl:{value:D.p.swirl*0.5},uZFace:{value:D.zFace},uConeAdd:{value:coneAdd},uFloorY:{value:D.baseY},
      uPA:{value:new THREE.Vector3(0.6,0.6,0.7)},uPB:{value:new THREE.Vector3(0.3,0.3,0.3)},uPC:{value:new THREE.Vector3(1,1,1)},uPD:{value:new THREE.Vector3(0,0.1,0.2)},
      uDepth:{value:depthRT?depthRT.depthTexture:null},uResolution:{value:new THREE.Vector2(innerWidth,innerHeight)},
      uNear:{value:0.1},uFar:{value:140.0},uViewMatrix:{value:new THREE.Matrix4()}},
    vertexShader:`precision highp float;varying vec3 vW;varying vec4 vClip;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vW=wp.xyz;vClip=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position=vClip;}`,
    fragmentShader:`precision highp float;
uniform float uTime,uAct,uPulse,uNear,uFar,uRimAx,uRimAy,uSwirl,uZFace,uConeAdd,uFloorY;uniform vec3 uCam,uBoxMin,uBoxMax,uCenter,uPA,uPB,uPC,uPD;
uniform vec2 uResolution;uniform mat4 uViewMatrix;uniform sampler2D uDepth;varying vec3 vW;varying vec4 vClip;
float h3(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm3(vec3 p){float s=0.,a=.5;for(int k=0;k<2;k++){s+=a*vn3(p);p=p*2.02+1.3;a*=.5;}return s*1.2;}
vec3 pal(float t){return uPA+uPB*cos(6.28318*(uPC*t+uPD));}
vec2 rayBox(vec3 ro,vec3 rd,vec3 bmin,vec3 bmax){vec3 t0=(bmin-ro)/rd,t1=(bmax-ro)/rd,tm=min(t0,t1),tx=max(t0,t1);return vec2(max(max(tm.x,tm.y),tm.z),min(min(tx.x,tx.y),tx.z));}
float h21(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5);}
float viewZ(float d){return (uNear*uFar)/((uFar-uNear)*d-uFar);}
void main(){
  vec3 ro=uCam, rd=normalize(vW-uCam);
  vec2 tb=rayBox(ro,rd,uBoxMin,uBoxMax);
  float tn=max(tb.x,0.0),tf=tb.y; if(tf<=tn)discard;
  vec2 suv=(vClip.xy/vClip.w)*0.5+0.5;
  float sceneVZ=viewZ(texture2D(uDepth,suv).x);
  float jit=h21(suv*uResolution+fract(uTime));
  float trans=1.0; vec3 acc=vec3(0.0); float dt=(tf-tn)/24.0;
  float om=uTime*3.0,kk=13.8;
  for(int i=0;i<24;i++){
    float tt=tn+(float(i)+jit)*dt; vec3 p=ro+rd*tt;
    if((uViewMatrix*vec4(p,1.0)).z < sceneVZ) break;
    vec2 c=p.xy-uCenter.xy; float r=length(c)+1e-3; float a=atan(c.y,c.x);
    float Rb=1.0/sqrt(pow(cos(a)/uRimAx,2.0)+pow(sin(a)/uRimAy,2.0)+1e-4);
    float rr=r/Rb;                                                          // 1.0 = Sheetrand (identisch zur Membran)
    float az=clamp(abs(p.z)/max(uZFace,0.2),0.0,1.0);
    float coneR=1.0+az*uConeAdd;                                           // konische Laibungswand (folgt dem Frame); az: 0=Sheet, 1=Tuer
    float twist=a*2.0+uSwirl/(r+0.25);
    float waveR=(sin(rr*kk-om+twist)+sin((2.0-rr)*kk-om+twist)*0.72)*exp(-rr*0.7);   // radiale Tropfenwelle (exakt Membran)
    float waveZ=sin(az*6.5-om*0.85+twist*0.4);                             // axiale Wellenfront zur Tuer -> 3D-Ausbreitung
    float w01=clamp((waveR*0.62+waveZ*0.38)*0.5+0.5,0.0,1.0);
    float fillIn=smoothstep(coneR*0.44,coneR*0.86,rr);                           // baut von der Achse zur konischen Wand auf
    float wallOut=smoothstep(coneR+0.06,coneR-0.20,rr);                    // an der Wand abschneiden -> aussen kaum sichtbar
    float n=fbm3(p*1.15+vec3(0.,0.,uTime*0.12));
    float radProf=fillIn*wallOut;
    float floorCut=smoothstep(uFloorY-0.12,uFloorY+0.10,p.y);                   // Aura endet am Boden, geht nicht hindurch
    float dens=radProf*floorCut*(0.12+0.88*smoothstep(0.15,0.85,w01))*(0.5+0.5*n)*uAct*(0.82+0.34*uPulse);
    if(dens>0.003){
      vec3 portalCol=max(pal(0.30+0.16*rr+0.16*w01),vec3(0.0));            // leuchtet in den Farben des Sheets
      float glow=0.42+0.95*w01;                                            // Wellenkaemme leuchten auf
      vec3 lum=mix(vec3(0.56,0.70,0.93),portalCol*1.85,0.78)*glow*(0.6+0.55*uPulse);
      float a2=1.0-exp(-dens*dt*6.5);
      acc+=trans*a2*lum; trans*=(1.0-a2);
    }
    if(trans<0.02)break;
  }
  float alpha=1.0-trans; if(alpha<0.01)discard;
  gl_FragColor=vec4(acc,alpha);
}`,
    transparent:true,depthWrite:false,depthTest:false,blending:THREE.NormalBlending,side:THREE.BackSide});
  var box=new THREE.Mesh(new THREE.BoxGeometry(hx*2.0,mxY-mnY,hz*2.0),fogMat);box.position.set(0,(mnY+mxY)*0.5,0);fogGroup.add(box);
  scene.add(fogGroup);
}
function updatePrompt(){var dp=document.getElementById('doorPrompt');if(!dp)return;dp.innerHTML='[E] Vordertür '+(doorTarget>0.5?'schließen':'öffnen')+'  ·  [R] Hintertür '+(doorTargetB>0.5?'schließen':'öffnen');}
function animate(){requestAnimationFrame(animate);var t=clock.getElapsedTime();
 doorAngle+=(doorTarget-doorAngle)*0.07;doorAngleB+=(doorTargetB-doorAngleB)*0.07;
 var openF=doorAngle/DOOR_OPEN,openB=doorAngleB/DOOR_OPEN,openM=Math.max(openF,openB);
 if(leafL)leafL.rotation.y=-doorAngle;if(leafR)leafR.rotation.y=doorAngle;
 if(leafLB)leafLB.rotation.y=doorAngleB;if(leafRB)leafRB.rotation.y=-doorAngleB;
 if(memMat){memMat.uniforms.uTime.value=t;memMat.uniforms.uCam.value.copy(camera.position);
  if(memMat.uniforms.uActivate)memMat.uniforms.uActivate.value=openM;
  if(memMat.uniforms.uPulse)memMat.uniforms.uPulse.value=0.5+0.5*Math.sin(t*1.25);
  if(memMat.uniforms.uWaveDepth&&D)memMat.uniforms.uWaveDepth.value=D.zFace*(0.10+0.85*openM);}   // zu: kaum; offen: bis zur Eingangsebene
 var pulse=0.5+0.5*Math.sin(t*1.25);                                   // gemeinsamer Atem — vereint Portal + Nebel
 if(fogMat&&D){fogMat.uniforms.uTime.value=t;fogMat.uniforms.uCam.value.copy(camera.position);fogMat.uniforms.uPulse.value=pulse;fogMat.uniforms.uAct.value=(D.p.fog!==undefined?D.p.fog:0.85)*(0.7+0.35*openM);
   if(memMat){fogMat.uniforms.uPA.value.copy(memMat.uniforms.uPA.value);fogMat.uniforms.uPB.value.copy(memMat.uniforms.uPB.value);fogMat.uniforms.uPC.value.copy(memMat.uniforms.uPC.value);fogMat.uniforms.uPD.value.copy(memMat.uniforms.uPD.value);}}
 if(portalLight&&D){portalLight.position.set(0,D.springY*0.55,0.0);portalLight.intensity=(0.3+openM*3.4)*(0.8+0.28*pulse);}
 cinePass.uniforms.time.value=t;if(rimMat){var pr=0.85+0.15*Math.sin(t*1.6);rimMat.color.setHSL(0.11,0.6,0.55);rimMat.color.multiplyScalar((0.7+2.6*Math.max(D.p.glow,0.25))*pr*(1.0+openM*0.9));}
 fxaa.uniforms['resolution'].value.set(1/innerWidth,1/innerHeight);controls.update();
 if(fogMat&&D&&depthRT){var pr=renderer.getPixelRatio()*0.42,dw=Math.max(2,Math.floor(innerWidth*pr)),dh=Math.max(2,Math.floor(innerHeight*pr));if(depthRT.width!==dw||depthRT.height!==dh)depthRT.setSize(dw,dh);fogGroup.visible=false;camera.updateMatrixWorld();renderer.setRenderTarget(depthRT);renderer.clear();renderer.render(scene,camera);renderer.setRenderTarget(null);fogGroup.visible=true;fogMat.uniforms.uViewMatrix.value.copy(camera.matrixWorldInverse);fogMat.uniforms.uNear.value=camera.near;fogMat.uniforms.uFar.value=camera.far;fogMat.uniforms.uResolution.value.set(dw,dh);}
 composer.render();}
addEventListener('resize',function(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);if(depthRT){var pr=renderer.getPixelRatio()*0.42;depthRT.setSize(Math.max(2,Math.floor(innerWidth*pr)),Math.max(2,Math.floor(innerHeight*pr)));}});
addEventListener('keydown',function(e){if(e.repeat)return;var ch=false;if(e.key==='e'||e.key==='E'){doorTarget=doorTarget>0.5?0.0:DOOR_OPEN;ch=true;}if(e.key==='r'||e.key==='R'){doorTargetB=doorTargetB>0.5?0.0:DOOR_OPEN;ch=true;}if(ch)updatePrompt();});
init();

/* ==================== W12-PORTAL-BRÜCKE (AnazhRealm-Heimat) ==================== */
(function () {
    if (typeof window === "undefined" || !window.parent || window.parent === window) return;
    function post(m) {
        try {
            window.parent.postMessage(m, "*");
        } catch (_e) {}
    }
    var DSL = ["drachentor", "kathedrale", "maschine", "geisttor", "verkalkt", "ruine", "maurentor", "zufall"];
    function clickPreset(word) {
        var pdiv = document.getElementById("presets");
        if (!pdiv) return false;
        var kids = pdiv.children;
        for (var i = 0; i < kids.length; i++) {
            if ((kids[i].textContent || "").toLowerCase() === word) {
                kids[i].click();
                return true;
            }
        }
        return false;
    }
    window.addEventListener("message", function (ev) {
        if (ev.source !== window.parent) return;
        var msg = ev.data;
        if (!msg || typeof msg !== "object") return;
        if (msg.type === "enter") {
            post({ type: "ready", world: "portale", label: "Porta — Ordnungen & fraktale Tiefe", dsl: DSL });
        } else if (msg.type === "dsl" && Array.isArray(msg.program)) {
            for (var i = 0; i < msg.program.length; i++) {
                var op = msg.program[i];
                var word = String((op && op[0]) || op || "").toLowerCase();
                if (word === "zufall") {
                    var r = document.getElementById("rnd");
                    if (r) r.click();
                } else clickPreset(word);
            }
        }
    });
    window.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape") post({ type: "exit", world: "portale" });
    });
    post({ type: "ready", world: "portale", label: "Porta — Ordnungen & fraktale Tiefe", dsl: DSL });
})();

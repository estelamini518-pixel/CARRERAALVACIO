// Carrera al Vacío — versión visual panorámica para escritorio y móvil.
const cv=document.getElementById('game'),ctx=cv.getContext('2d');
const W=cv.width=1280,H=cv.height=720;
const levelBadge=document.getElementById('levelBadge'),pointsBadge=document.getElementById('pointsBadge'),livesBadge=document.getElementById('livesBadge');
const message=document.getElementById('message'),shadowLabel=document.getElementById('shadowLabel'),shadowProgress=document.getElementById('shadowProgress');
const LEVELS=[
{name:'Estación Base',bg:'#080d26',len:3000,rocks:.6,dark:0,iris:'Bienvenida, Nova. Mueve la nave con las flechas y usa ESPACIO para el turbo.'},
{name:'Campo de Asteroides',bg:'#100d2b',len:4000,rocks:1.6,dark:0,iris:'Asteroides adelante. Recoge las cápsulas verdes: son combustible para el turbo.'},
{name:'Nebulosa Roja',bg:'#1b0924',len:4500,rocks:1.2,dark:.5,iris:'Casi no hay visibilidad... algo se mueve detrás de nosotros. Recoge baterías amarillas.'},
{name:'Nave Fantasma',bg:'#071a20',len:5000,rocks:1.8,dark:.7,iris:'Esta nave no aparece en ningún registro. Usa el pulso EMP (E) si La Sombra se acerca.'},
{name:'Zona Muda',bg:'#03030d',len:6000,rocks:2,dark:.9,rival:true,iris:'Kael va adelante y La Sombra te sigue. Llega primero a la meta. ¡Corre!'}
];
const keys={};let lvl=0,st='msg',s,reason='',points=0;
function reset(){s={x:W*.78,y:H*.58,hp:3,fuel:100,dist:0,gap:1,light:0,inv:0,emp:0,flash:0,t:0,kael:0,objs:[],stars:Array.from({length:150},()=>({x:Math.random()*W,y:Math.random()*H,z:Math.random()*2+0.5}))};}
reset();
function showMessage(text,visible=true){message.textContent=text;message.style.display=visible?'block':'none';}
addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();press(e.code);});
addEventListener('keyup',e=>keys[e.code]=false);
cv.addEventListener('pointerdown',()=>press('Enter'));
function bindButton(id,code){const b=document.getElementById(id);b.addEventListener('pointerdown',e=>{e.preventDefault();keys[code]=true;b.setPointerCapture?.(e.pointerId)});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,()=>keys[code]=false));}
bindButton('leftBtn','ArrowLeft');bindButton('rightBtn','ArrowRight');
function press(c){
 if(st==='play'&&c==='KeyE'&&s.emp<=0){s.emp=600;s.gap=Math.min(1,s.gap+.3);s.flash=15;beep(180,.3)}
 if((c==='Enter'||c==='Space')&&st!=='play'){
  if(st==='msg'){st='play';showMessage('',false)}
  else {if(st==='win'){lvl=0;points=0}reset();st='msg';showMessage('IRIS: '+LEVELS[lvl].iris+'  ·  Pulsa ENTER para continuar.')}
 }
}
let ac;function beep(f,d){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;o.connect(g);g.connect(ac.destination);g.gain.value=.06;o.start();o.stop(ac.currentTime+d)}catch(e){}}
function update(){
 const L=LEVELS[lvl];s.t++;s.emp=Math.max(0,s.emp-1);s.inv=Math.max(0,s.inv-1);s.light=Math.max(0,s.light-1);s.flash=Math.max(0,s.flash-1);
 const turbo=(keys.Space||keys.ShiftLeft)&&s.fuel>0,sp=turbo?8:4;
 if(turbo){s.fuel-=.35;s.gap=Math.min(1,s.gap+.0006)}
 const m=5;
 if(keys.ArrowLeft||keys.KeyA)s.x-=m;if(keys.ArrowRight||keys.KeyD)s.x+=m;
 if(keys.ArrowUp||keys.KeyW)s.y-=m;if(keys.ArrowDown||keys.KeyS)s.y+=m;
 s.x=Math.max(28,Math.min(W-28,s.x));s.y=Math.max(110,Math.min(H-70,s.y));s.dist+=sp;
 if(L.dark)s.gap-=.0005*(.4+L.dark);if(L.rival)s.kael+=4.8;
 if(Math.random()<.03*L.rocks)s.objs.push({k:'rock',x:Math.random()*W,y:-30,r:14+Math.random()*18});
 if(Math.random()<.012)s.objs.push({k:'fuel',x:Math.random()*W,y:-30,r:13});
 if(L.dark&&Math.random()<.004)s.objs.push({k:'bat',x:Math.random()*W,y:-30,r:14});
 s.stars.forEach(a=>{a.y+=a.z*sp/2;if(a.y>H){a.y=0;a.x=Math.random()*W}});
 s.objs.forEach(o=>o.y+=sp);
 s.objs=s.objs.filter(o=>{
  if(o.y>H+40)return false;
  if(Math.hypot(o.x-s.x,o.y-s.y)<o.r+19){
   if(o.k==='fuel'){s.fuel=Math.min(100,s.fuel+25);points+=50;beep(660,.1);return false}
   if(o.k==='bat'){s.gap=Math.min(1,s.gap+.35);s.light=300;points+=100;beep(880,.15);return false}
   if(s.inv<=0){s.hp--;s.inv=60;s.gap-=.08;beep(90,.2)}
  }return true;
 });
 if(L.rival&&s.kael>=L.len&&s.dist<L.len){st='over';reason='Kael llegó primero.'}
 else if(s.gap<=0){st='over';reason='La Sombra te alcanzó.'}
 else if(s.hp<=0){st='over';reason='Tu nave quedó destruida.'}
 else if(s.dist>=L.len){points+=500;if(lvl===LEVELS.length-1)st='win';else{lvl++;reset();st='msg';showMessage('NIVEL '+(lvl+1)+' · '+LEVELS[lvl].name+' — IRIS: '+LEVELS[lvl].iris+' Pulsa ENTER.');}}
 if(st==='over')showMessage('☠ '+reason+' Pulsa ENTER para reintentar.');
 if(st==='win')showMessage('✦ ¡GANASTE! Cruzaste la Zona Muda. Pulsa ENTER para volver a jugar.');
}
function txt(t,x,y,size,color='#fff',align='center'){ctx.font='700 '+size+'px system-ui,sans-serif';ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(t,x,y)}
function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function drawRocket(x,y,scale=1){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 ctx.shadowColor='#53eaff';ctx.shadowBlur=20;
 ctx.fillStyle='#bcefff';ctx.beginPath();ctx.moveTo(0,-36);ctx.quadraticCurveTo(20,-12,15,17);ctx.lineTo(-15,17);ctx.quadraticCurveTo(-20,-12,0,-36);ctx.fill();
 ctx.shadowBlur=0;ctx.fillStyle='#4adff5';ctx.beginPath();ctx.ellipse(0,-8,6,10,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#477bb4';ctx.beginPath();ctx.moveTo(-14,7);ctx.lineTo(-34,25);ctx.lineTo(-13,22);ctx.fill();ctx.beginPath();ctx.moveTo(14,7);ctx.lineTo(34,25);ctx.lineTo(13,22);ctx.fill();
 ctx.fillStyle='#ff9f43';ctx.beginPath();ctx.moveTo(-7,17);ctx.lineTo(0,42+Math.random()*7);ctx.lineTo(7,17);ctx.fill();ctx.restore();
}
function draw(){
 const L=LEVELS[lvl];ctx.fillStyle=L.bg;ctx.fillRect(0,0,W,H);
 // nebulosa difuminada y estrellas
 let g=ctx.createRadialGradient(W*.65,H*.64,5,W*.65,H*.64,260);g.addColorStop(0,L.dark?'rgba(198,28,139,.28)':'rgba(56,79,180,.16)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 s.stars.forEach(a=>{ctx.globalAlpha=.45+a.z*.25;ctx.fillStyle='#dcecff';ctx.fillRect(a.x,a.y,a.z*1.5,a.z*1.5)});ctx.globalAlpha=1;
 // planeta y portal decorativos
 ctx.fillStyle='#302a68';ctx.beginPath();ctx.arc(W*.13,H*.31,54,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#174d69';ctx.beginPath();ctx.arc(W*.89,H*.28,31,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.translate(W*.82,H*.3);ctx.rotate(-.25);ctx.strokeStyle='#c45bff';ctx.lineWidth=10;ctx.shadowColor='#c45bff';ctx.shadowBlur=15;ctx.beginPath();ctx.ellipse(0,0,53,23,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 s.objs.forEach(o=>{ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.fillStyle=o.k==='rock'?'#78809e':o.k==='fuel'?'#3ddc84':'#ffd34f';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;if(o.k==='fuel')txt('✦',o.x,o.y+5,14,'#efffca')});
 // sombra aproximándose desde la parte inferior
 if(L.dark&&s.gap<.9){const h=(1-s.gap)*H*.65,gr=ctx.createLinearGradient(0,H-h,0,H);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.96)');ctx.fillStyle=gr;ctx.fillRect(0,H-h,W,h);ctx.fillStyle='#ff387f';ctx.shadowColor='#ff387f';ctx.shadowBlur=15;ctx.beginPath();ctx.ellipse(W*.5-24,H-h+34,10,5,0,0,7);ctx.ellipse(W*.5+24,H-h+34,10,5,0,0,7);ctx.fill();ctx.shadowBlur=0}
 if(L.dark){const r=370-L.dark*170+(s.light>0?180:0),gr=ctx.createRadialGradient(s.x,s.y,r*.2,s.x,s.y,r);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,'+L.dark*.88+')');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H)}
 if(s.inv<=0||Math.floor(s.t/4)%2)drawRocket(s.x,s.y,1.05);
 if(s.flash>0){ctx.fillStyle='rgba(180,220,255,.45)';ctx.fillRect(0,0,W,H)}
 // panel superior dentro de la escena
 rounded(22,18,260,54,17,'rgba(9,15,42,.85)','#29386d');txt('✦ '+L.name,42,52,20,'#edf2ff','left');
 rounded(W-390,18,112,48,24,'rgba(30,25,70,.9)','#7865ff');txt('NIVEL '+(lvl+1),W-334,48,15,'#a8a0ff');
 rounded(W-264,18,124,48,24,'rgba(13,45,61,.9)','#25cdb7');txt('PUNTOS '+points,W-202,48,15,'#53ead1');
 rounded(W-128,18,106,48,24,'rgba(61,19,48,.9)','#f04d82');txt('VIDAS '+s.hp,W-75,48,15,'#ff739b');
 // barras discretas
 rounded(22,H-67,220,12,6,'#262447');rounded(22,H-67,220*s.fuel/100,12,6,'#3ddc84');
 txt('COMBUSTIBLE',22,H-76,12,'#b9c8f0','left');
 rounded(W-242,H-67,220,12,6,'#262447');rounded(W-242,H-67,220*s.dist/L.len,12,6,'#54dff6');
 txt('PROGRESO',W-242,H-76,12,'#b9c8f0','left');
 if(L.rival){rounded(W-242,H-103,220,9,5,'#262447');rounded(W-242,H-103,220*s.kael/L.len,9,5,'#ff9f43');txt('KAEL',W-242,H-111,11,'#ffbd77','left')}
 txt(s.emp>0?'EMP: '+Math.ceil(s.emp/60)+'s':'PULSO EMP LISTO · E',W*.5,H-33,13,s.emp>0?'#9098b8':'#ffe17a');
}
function syncHud(){levelBadge.textContent='NIVEL '+(lvl+1);pointsBadge.textContent='PUNTOS '+points;livesBadge.textContent='VIDAS '+s.hp;const pct=Math.round((1-s.gap)*100);shadowLabel.textContent='La sombra se acerca: '+Math.max(0,Math.min(100,pct))+'%';shadowProgress.style.width=Math.max(0,Math.min(100,pct))+'%'}
function loop(){if(st==='play')update();draw();syncHud();requestAnimationFrame(loop)}
showMessage('IRIS: '+LEVELS[0].iris+' · Pulsa ENTER para comenzar.');
loop();

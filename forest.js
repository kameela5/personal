(()=>{
const section=document.querySelector('.forest-journey'),canvas=document.querySelector('#forest'),ctx=canvas.getContext('2d');
const intro=document.querySelector('.forest-invitation'),name=document.querySelector('.name-reveal'),bar=document.querySelector('.journey-track span'),label=document.querySelector('.journey-label'),number=document.querySelector('.journey-number'),toggle=document.querySelector('.motion-toggle');
// The real intro lives in the sticky stage so the crossfade leads directly into usable content.
const destination=document.createElement('div');destination.className='intro-destination';
const hero=document.querySelector('#intro'),header=document.querySelector('.site-header');
const introNav=header.cloneNode(true);introNav.querySelector('nav').setAttribute('aria-label','Introduction navigation');
destination.append(introNav,hero);document.querySelector('.forest-stage').append(destination);
const sceneElements=[...document.querySelector('.forest-stage').children].filter(el=>el!==destination);
let completed=false,introMix=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches,w,h,dpr,progress=0,target=0,mx=0,my=0,px=0,py=0,last=0;
let raf=0,onscreen=true,lastPaint=0;
const mobile=matchMedia('(max-width: 690px)').matches;
function requestDraw(){if(!raf&&onscreen&&!document.hidden)raf=requestAnimationFrame(draw)}
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));const smooth=(a,b,v)=>{let x=clamp((v-a)/(b-a));return x*x*(3-2*x)};
function random(seed){let x=Math.sin(seed*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,mobile?1.5:2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);update()}
function update(){target=clamp(-section.getBoundingClientRect().top/(section.offsetHeight-h||1));if(target>=.76)completed=true;else if(scrollY<=4)completed=false;requestDraw()}
// Skipping the walk reaches the same intro rather than scrolling to a hidden element.
document.querySelector('.skip-forest').addEventListener('click',e=>{e.preventDefault();completed=true;window.scrollTo({top:section.offsetTop+section.offsetHeight-innerHeight,behavior:reduced.matches?'instant':'smooth'})});
addEventListener('resize',resize);addEventListener('scroll',update,{passive:true});addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2},{passive:true});
toggle.onclick=()=>{paused=!paused;toggle.textContent=paused?'resume motion':'pause motion';toggle.setAttribute('aria-pressed',String(paused));requestDraw()};toggle.textContent=paused?'resume motion':'pause motion';toggle.setAttribute('aria-pressed',String(paused));
// Original forest geometry from the first scenic-route version.
const plants=[];for(let i=0;i<68;i++){const side=i%2?1:-1;plants.push({z:1.3+Math.floor(i/2)*.48,x:side*(1.15+random(i+1)*3.8),height:2.8+random(i+12)*2,width:.075+random(i+23)*.09,seed:i})}
function draw(time){raf=0;if(!onscreen||document.hidden)return;
// Once the intro is opaque the forest has no visible pixels to paint.
if(introMix===1&&(completed||paused||reduced.matches)){last=time;return}
if(mobile&&time-lastPaint<1000/30){requestDraw();return}lastPaint=time;
let dt=Math.min((time-last)/16.67||1,3);last=time;progress+=(target-progress)*Math.min(1,.1*dt);px+=(mx-px)*.035*dt;py+=(my-py)*.035*dt;
const p=paused?1:progress,travel=14*Math.pow(smooth(0,.86,p),1.8);
// The rose-and-burgundy scene from the first uploaded-portfolio merge.
let sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#99b9cb');sky.addColorStop(.48,'#eed8d5');sky.addColorStop(1,'#ad8194');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
let glow=ctx.createRadialGradient(w*.51,h*.4,0,w*.51,h*.4,w*.5);glow.addColorStop(0,'rgba(255,237,221,.55)');glow.addColorStop(1,'rgba(238,187,181,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
ctx.fillStyle='#a16b7e';ctx.beginPath();ctx.moveTo(0,h*.57);ctx.quadraticCurveTo(w*.3,h*.42,w*.53,h*.53);ctx.quadraticCurveTo(w*.8,h*.43,w,h*.56);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
ctx.fillStyle='#d9b5b6';ctx.beginPath();ctx.moveTo(w*.5,h*.51);ctx.bezierCurveTo(w*.44,h*.68,w*.66,h*.72,w*.31,h);ctx.lineTo(w*.75,h);ctx.bezierCurveTo(w*.82,h*.76,w*.49,h*.66,w*.52,h*.51);ctx.fill();
// The original layered burgundy trees: slender trunks, alternating branches and broad overlapping foliage.
function originalTree(t,z){let scale=h*.8/z,x=w/2+(t.x-(paused?0:px*.12))*scale,y=h*.51+scale*.95,height=t.height*scale,width=t.width*scale;if(x+height*.7<0||x-height*.7>w)return;
let fog=clamp(z/16),light=Math.round(15+fog*44),sat=Math.round(26-fog*4);ctx.save();ctx.translate(x,y);ctx.globalAlpha=clamp((z-.18)*3)*(.95-fog*.1);
ctx.fillStyle=`hsl(338 ${sat}% ${light}%)`;ctx.beginPath();ctx.moveTo(-width*.6,0);ctx.lineTo(-width*.35,-height*.95);ctx.lineTo(width*.22,-height);ctx.lineTo(width*.55,0);ctx.fill();
for(let j=0;j<7;j++){let by=-height*(.31+j*.09),side=j%2?1:-1,reach=height*(.19+random(t.seed*7+j)*.18);ctx.lineWidth=Math.max(1,width*(.45-j*.035));ctx.strokeStyle=`hsl(338 ${sat}% ${light}%)`;ctx.beginPath();ctx.moveTo(0,by+height*.1);ctx.quadraticCurveTo(side*reach*.4,by,side*reach,by-height*.13);ctx.stroke();for(let k=0;k<4;k++){let lx=side*reach*(.3+k*.23),ly=by-height*(.04+k*.035),r=height*(.08+random(t.seed+j+k)*.05);ctx.fillStyle=`hsl(${330+random(j+t.seed)*15} ${sat+2}% ${light+random(k+j)*7}%)`;ctx.beginPath();ctx.ellipse(lx,ly,r*1.5,r,.2*side,0,Math.PI*2);ctx.fill()}}
ctx.fillStyle=`hsla(58,33%,77%,${.06+fog*.05})`;ctx.fillRect(-width*.13,-height*.9,width*.1,height*.9);ctx.restore()}
ctx.save();ctx.globalAlpha=1-smooth(.55,.93,p)*.92;
plants.map(t=>({t,z:t.z-travel})).filter(o=>o.z>.2).sort((a,b)=>b.z-a.z).forEach(({t,z})=>originalTree(t,z));ctx.restore();
[{x:-3.5,z:2.5,height:4.3,width:.13,seed:91},{x:3.5,z:2.5,height:4.6,width:.14,seed:93}].forEach(t=>originalTree(t,t.z));
let shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#37122555');shade.addColorStop(.4,'#37122510');shade.addColorStop(1,'#37122588');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
if(!paused)for(let i=0;i<18;i++){ctx.beginPath();ctx.fillStyle=`rgba(255,241,197,${.14+Math.sin(time*.001+i)*.1})`;ctx.arc(random(i+400)*w+Math.sin(time*.0003+i)*15,random(i+600)*h+Math.cos(time*.0002+i)*12,1+random(i+500)*1.4,0,Math.PI*2);ctx.fill()}
// Completion is latched: reverse scrolling cannot bring the forest back until the very top.
const desiredMix=paused||reduced.matches||completed?1:smooth(.56,.76,p);
introMix+=(desiredMix-introMix)*Math.min(1,.12*dt);if(Math.abs(desiredMix-introMix)<.001)introMix=desiredMix;
section.dataset.scene=completed?'intro':'forest';
destination.style.opacity=introMix;destination.inert=introMix<.98;destination.style.visibility=introMix>.001?'visible':'hidden';
sceneElements.forEach(el=>{el.style.opacity=1-introMix;el.style.visibility=introMix===1?'hidden':'visible';el.inert=introMix>.5});
intro.style.opacity=(1-smooth(.05,.3,p))*(1-introMix);name.style.display='none';
bar.style.width=`${p*100}%`;label.textContent='SCROLL TO WANDER';number.textContent='01 — THE SCENIC ROUTE';
requestDraw()}

new IntersectionObserver(([entry])=>{onscreen=entry.isIntersecting;if(!onscreen){cancelAnimationFrame(raf);raf=0;last=0}else requestDraw()}).observe(section);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0}else requestDraw()});
resize();requestDraw();
})();

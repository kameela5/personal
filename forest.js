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
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));const smooth=(a,b,v)=>{let x=clamp((v-a)/(b-a));return x*x*(3-2*x)};
function random(seed){let x=Math.sin(seed*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);update()}
function update(){target=clamp(-section.getBoundingClientRect().top/(section.offsetHeight-h||1));if(target>=.94)completed=true;else if(scrollY<=4)completed=false}
// Skipping the walk reaches the same intro rather than scrolling to a hidden element.
document.querySelector('.skip-forest').addEventListener('click',e=>{e.preventDefault();completed=true;window.scrollTo({top:section.offsetTop+section.offsetHeight-innerHeight,behavior:reduced.matches?'instant':'smooth'})});
addEventListener('resize',resize);addEventListener('scroll',update,{passive:true});addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2},{passive:true});
toggle.onclick=()=>{paused=!paused;toggle.textContent=paused?'resume motion':'pause motion';toggle.setAttribute('aria-pressed',String(paused));};toggle.textContent=paused?'resume motion':'pause motion';toggle.setAttribute('aria-pressed',String(paused));
const bend=z=>Math.sin(z*.065)*1.8+Math.sin(z*.14)*.5;
const tangent=z=>Math.cos(z*.065)*.117+Math.cos(z*.14)*.07;
// Original forest geometry from the first scenic-route version.
const plants=[];for(let i=0;i<68;i++){const side=i%2?1:-1;plants.push({z:1.3+Math.floor(i/2)*.48,x:side*(1.15+random(i+1)*3.8),height:2.8+random(i+12)*2,width:.075+random(i+23)*.09,seed:i})}
const pebbles=[];for(let i=0;i<450;i++)pebbles.push({z:random(i+970)*170,x:(random(i+1200)-.5)*1.8,size:.008+random(i+1400)*.018});
function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill()}
function draw(time){let dt=Math.min((time-last)/16.67||1,3);last=time;progress+=(target-progress)*Math.min(1,.1*dt);px+=(mx-px)*.035*dt;py+=(my-py)*.035*dt;
const p=paused?1:progress,travel=14*Math.pow(smooth(0,.86,p),1.8),cam=bend(travel),direction=tangent(travel),f=h*.83,horizon=h*.43+(paused?0:py*3),eye=1.3,road=w<600?.58:.91;
const project=(worldZ,x=0,y=0)=>{let z=worldZ-travel,scale=f/z;return{x:w/2+(bend(worldZ)+x-cam-direction*z-(paused?0:px*.055))*scale,y:horizon+(eye-y)*scale,scale}};
// Soft original-style illustration: pale dawn, rounded tree crowns and gentle hills.
let sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#e5d8dc');sky.addColorStop(.5,'#efd4ce');sky.addColorStop(1,'#c5c8ac');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
let sunlight=ctx.createRadialGradient(w*.53,h*.34,0,w*.53,h*.34,h*.5);sunlight.addColorStop(0,'#fff1d7bb');sunlight.addColorStop(1,'#fff1d700');ctx.fillStyle=sunlight;ctx.fillRect(0,0,w,h);
ctx.fillStyle='#a9b194';ctx.beginPath();ctx.moveTo(0,h*.49);ctx.quadraticCurveTo(w*.25,h*.38,w*.54,h*.5);ctx.quadraticCurveTo(w*.8,h*.4,w,h*.49);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
let ground=ctx.createLinearGradient(0,horizon,0,h);ground.addColorStop(0,'#c1c5a8');ground.addColorStop(1,'#8e9b79');ctx.fillStyle=ground;ctx.fillRect(0,horizon,w,h-horizon);
// Project a continuous winding ground path from world space, rather than enlarging a photograph.
for(let i=100;i>=0;i--){let z1=travel+.35+i*.85,z2=z1+.88;const a=project(z1,-road),b=project(z1,road),c=project(z2,road),d=project(z2,-road);ctx.globalAlpha=clamp(1-(z1-travel)/100);polygon([project(z1,-road-.13),project(z1,road+.13),project(z2,road+.13),project(z2,-road-.13)],'#b4bb96');let light=Math.sin(Math.floor(z1*1.3))*.8;polygon([a,b,c,d],`hsl(28 17% ${77+light}%)`)}ctx.globalAlpha=1;
// Pebbles anchored to the path travel under the viewer and make forward movement tangible.
for(const stone of pebbles){let z=stone.z-travel;if(z<.45||z>75)continue;let point=project(stone.z,stone.x*(road/.91));ctx.globalAlpha=clamp(1-z/65)*.35;ctx.fillStyle=stone.x>0?'#e2d3c4':'#756960';ctx.beginPath();ctx.ellipse(point.x,point.y,Math.max(.4,point.scale*stone.size),Math.max(.25,point.scale*stone.size*.35),0,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
// The original layered green trees: slender trunks, alternating branches and broad overlapping foliage.
function originalTree(t,z){let scale=h*.8/z,x=w/2+(t.x-(paused?0:px*.12))*scale,y=h*.51+scale*.95,height=t.height*scale,width=t.width*scale;if(x+height*.7<0||x-height*.7>w)return;
let fog=clamp(z/16),light=Math.round(19+fog*39),sat=Math.round(20-fog*4);ctx.save();ctx.translate(x,y);ctx.globalAlpha=clamp((z-.18)*3)*(.95-fog*.1);
ctx.fillStyle=`hsl(104 ${sat}% ${light}%)`;ctx.beginPath();ctx.moveTo(-width*.6,0);ctx.lineTo(-width*.35,-height*.95);ctx.lineTo(width*.22,-height);ctx.lineTo(width*.55,0);ctx.fill();
for(let j=0;j<7;j++){let by=-height*(.31+j*.09),side=j%2?1:-1,reach=height*(.19+random(t.seed*7+j)*.18);ctx.lineWidth=Math.max(1,width*(.45-j*.035));ctx.strokeStyle=`hsl(104 ${sat}% ${light}%)`;ctx.beginPath();ctx.moveTo(0,by+height*.1);ctx.quadraticCurveTo(side*reach*.4,by,side*reach,by-height*.13);ctx.stroke();for(let k=0;k<4;k++){let lx=side*reach*(.3+k*.23),ly=by-height*(.04+k*.035),r=height*(.08+random(t.seed+j+k)*.05);ctx.fillStyle=`hsl(${100+random(j+t.seed)*15} ${sat+2}% ${light+random(k+j)*7}%)`;ctx.beginPath();ctx.ellipse(lx,ly,r*1.5,r,.2*side,0,Math.PI*2);ctx.fill()}}
ctx.fillStyle=`hsla(58,33%,77%,${.06+fog*.05})`;ctx.fillRect(-width*.13,-height*.9,width*.1,height*.9);ctx.restore()}
ctx.save();ctx.globalAlpha=1-smooth(.55,.93,p)*.92;
plants.map(t=>({t,z:t.z-travel})).filter(o=>o.z>.2).sort((a,b)=>b.z-a.z).forEach(({t,z})=>originalTree(t,z));ctx.restore();
[{x:-3.5,z:2.5,height:4.3,width:.13,seed:91},{x:3.5,z:2.5,height:4.6,width:.14,seed:93}].forEach(t=>originalTree(t,t.z));
// Low morning mist blends the photograph and the flower-lined path.
let mist=ctx.createLinearGradient(0,horizon-h*.07,0,horizon+h*.24);mist.addColorStop(0,'rgba(219,183,199,0)');mist.addColorStop(.3,'rgba(219,183,199,.52)');mist.addColorStop(.65,'rgba(219,183,199,.15)');mist.addColorStop(1,'rgba(219,183,199,0)');ctx.fillStyle=mist;ctx.fillRect(0,horizon-h*.07,w,h*.31);
let shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#454c3622');shade.addColorStop(.5,'#454c3600');shade.addColorStop(1,'#454c3622');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
if(!paused)for(let i=0;i<18;i++){ctx.beginPath();ctx.fillStyle=`rgba(255,241,197,${.14+Math.sin(time*.001+i)*.1})`;ctx.arc(random(i+400)*w+Math.sin(time*.0003+i)*15,random(i+600)*h+Math.cos(time*.0002+i)*12,1+random(i+500)*1.4,0,Math.PI*2);ctx.fill()}
// Completion is latched: reverse scrolling cannot bring the forest back until the very top.
const desiredMix=paused||reduced.matches||completed?1:smooth(.78,.95,p);
introMix+=(desiredMix-introMix)*Math.min(1,.12*dt);if(Math.abs(desiredMix-introMix)<.001)introMix=desiredMix;
section.dataset.scene=completed?'intro':'forest';
destination.style.opacity=introMix;destination.inert=introMix<.98;destination.style.visibility=introMix>.001?'visible':'hidden';
sceneElements.forEach(el=>{el.style.opacity=1-introMix;el.inert=introMix>.5});
intro.style.opacity=(1-smooth(.05,.3,p))*(1-introMix);name.style.display='none';
bar.style.width=`${p*100}%`;label.textContent='SCROLL TO WANDER';number.textContent='01 — THE SCENIC ROUTE';
requestAnimationFrame(draw)}

resize();requestAnimationFrame(draw);
})();

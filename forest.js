(()=>{
const meadow=new Image();meadow.src='meadow.png';const trees=new Image();trees.src='trees.png';
const treeTexture=document.createElement('canvas');trees.onload=()=>{treeTexture.width=640;treeTexture.height=Math.round(640*trees.height/trees.width);treeTexture.getContext('2d').drawImage(trees,0,0,treeTexture.width,treeTexture.height)};
const section=document.querySelector('.forest-journey'),canvas=document.querySelector('#forest'),ctx=canvas.getContext('2d');
const intro=document.querySelector('.forest-invitation'),name=document.querySelector('.name-reveal'),bar=document.querySelector('.journey-track span'),label=document.querySelector('.journey-label'),number=document.querySelector('.journey-number'),toggle=document.querySelector('.motion-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches,w,h,dpr,progress=0,target=0,mx=0,my=0,px=0,py=0,last=0;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));const smooth=(a,b,v)=>{let x=clamp((v-a)/(b-a));return x*x*(3-2*x)};
function random(seed){let x=Math.sin(seed*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);update()}
function update(){target=clamp(-section.getBoundingClientRect().top/(section.offsetHeight-h||1))}
addEventListener('resize',resize);addEventListener('scroll',update,{passive:true});addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2},{passive:true});
toggle.onclick=()=>{paused=!paused;toggle.textContent=paused?'resume motion':'pause motion';toggle.setAttribute('aria-pressed',String(paused));};toggle.textContent=paused?'resume motion':'pause motion';toggle.setAttribute('aria-pressed',String(paused));
const bend=z=>Math.sin(z*.065)*1.8+Math.sin(z*.14)*.5;
const tangent=z=>Math.cos(z*.065)*.117+Math.cos(z*.14)*.07;
const plants=[];for(let i=0;i<264;i++){let z=2.3+Math.floor(i/4)*3.1,side=i%2?-1:1;plants.push({z,x:side*(2.05+(Math.floor(i/2)%2)*2.9+random(i+5)*.5),size:4.3+random(i+8)*1.2,seed:i})}
const pebbles=[];for(let i=0;i<450;i++)pebbles.push({z:random(i+970)*170,x:(random(i+1200)-.5)*1.8,size:.008+random(i+1400)*.018});
function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill()}
function draw(time){let dt=Math.min((time-last)/16.67||1,3);last=time;progress+=(target-progress)*Math.min(1,.1*dt);px+=(mx-px)*.035*dt;py+=(my-py)*.035*dt;
const p=paused?1:progress,travel=52*Math.pow(smooth(0,.91,p),1.55),cam=bend(travel),direction=tangent(travel),f=h*.83,horizon=h*.43+(paused?0:py*3),eye=1.3,road=w<600?.58:.91;
const project=(worldZ,x=0,y=0)=>{let z=worldZ-travel,scale=f/z;return{x:w/2+(bend(worldZ)+x-cam-direction*z-(paused?0:px*.055))*scale,y:horizon+(eye-y)*scale,scale}};
ctx.fillStyle='#cfb3bd';ctx.fillRect(0,0,w,h);
// Distant landscape stays distant: its size is constant throughout the walk.
if(meadow.complete&&meadow.naturalWidth){let scale=Math.max(w/meadow.width,h/meadow.height),iw=meadow.width*scale,ih=meadow.height*scale;ctx.drawImage(meadow,(w-iw)/2+(paused?0:px*3),(h-ih)/2,iw,ih)}
let ground=ctx.createLinearGradient(0,horizon-15,0,h);ground.addColorStop(0,'rgba(163,139,150,0)');ground.addColorStop(.12,'rgba(102,105,87,.87)');ground.addColorStop(.55,'#606b4e');ground.addColorStop(1,'#444f3b');ctx.fillStyle=ground;ctx.fillRect(0,horizon-15,w,h-horizon+15);
// Project a continuous winding ground path from world space, rather than enlarging a photograph.
for(let i=100;i>=0;i--){let z1=travel+.35+i*.85,z2=z1+.88;const a=project(z1,-road),b=project(z1,road),c=project(z2,road),d=project(z2,-road);ctx.globalAlpha=clamp(1-(z1-travel)/100);polygon([project(z1,-road-.13),project(z1,road+.13),project(z2,road+.13),project(z2,-road-.13)],'#898c6e');let light=Math.sin(Math.floor(z1*1.3))*.8;polygon([a,b,c,d],`hsl(28 17% ${64+light}%)`)}ctx.globalAlpha=1;
// Pebbles anchored to the path travel under the viewer and make forward movement tangible.
for(const stone of pebbles){let z=stone.z-travel;if(z<.45||z>75)continue;let point=project(stone.z,stone.x*(road/.91));ctx.globalAlpha=clamp(1-z/65)*.35;ctx.fillStyle=stone.x>0?'#e2d3c4':'#756960';ctx.beginPath();ctx.ellipse(point.x,point.y,Math.max(.4,point.scale*stone.size),Math.max(.25,point.scale*stone.size*.35),0,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
// Tall photographic trees line the path. Their trunks pass beside the camera while crowns form a canopy overhead.
if(treeTexture.width===640){plants.filter(t=>t.z-travel>.35&&t.z-travel<78).sort((a,b)=>b.z-a.z).forEach(t=>{let z=t.z-travel,pt=project(t.z,t.x*(w<600?.72:1)),width=t.size*pt.scale,height=width*trees.height/trees.width;if(pt.x+width/2<0||pt.x-width/2>w)return;let sway=paused?0:Math.sin(time*.00055+t.seed)*pt.scale*.012;ctx.save();ctx.globalAlpha=clamp((78-z)/25)*clamp((z-.35)*2);ctx.translate(pt.x+sway,pt.y);if(t.seed%3===0)ctx.scale(-1,1);ctx.drawImage(treeTexture,-width/2,-height,width,height);ctx.restore()})}
// Low morning mist blends the photograph and the flower-lined path.
let mist=ctx.createLinearGradient(0,horizon-h*.07,0,horizon+h*.24);mist.addColorStop(0,'rgba(219,183,199,0)');mist.addColorStop(.3,'rgba(219,183,199,.52)');mist.addColorStop(.65,'rgba(219,183,199,.15)');mist.addColorStop(1,'rgba(219,183,199,0)');ctx.fillStyle=mist;ctx.fillRect(0,horizon-h*.07,w,h*.31);
let shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#27132333');shade.addColorStop(.5,'#27132322');shade.addColorStop(1,'#27132366');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
if(!paused)for(let i=0;i<18;i++){ctx.beginPath();ctx.fillStyle=`rgba(255,241,197,${.14+Math.sin(time*.001+i)*.1})`;ctx.arc(random(i+400)*w+Math.sin(time*.0003+i)*15,random(i+600)*h+Math.cos(time*.0002+i)*12,1+random(i+500)*1.4,0,Math.PI*2);ctx.fill()}
const reveal=paused?1:smooth(.72,.92,p);intro.style.opacity=paused?0:1-smooth(.04,.23,p);intro.style.transform='translate(-50%,-50%)';name.style.opacity=reveal;name.style.transform=`translate(-50%,${-44-reveal*6}%)`;name.style.visibility=reveal>.01?'visible':'hidden';bar.style.width=`${p*100}%`;label.textContent=p>.9?'WELCOME TO MY WORLD':'SCROLL TO FOLLOW THE PATH';number.textContent=p>.75?'02 — THE CLEARING':'01 — THE WOODLAND';requestAnimationFrame(draw)}
new IntersectionObserver(([entry],observer)=>{if(entry.isIntersecting){entry.target.classList.add('arrive');observer.disconnect()}},{threshold:.3}).observe(document.querySelector('.hero-copy'));
resize();requestAnimationFrame(draw);
})();

(()=>{
const track=document.querySelector('#journey-scroll');if(!track)return;
const items=[...track.querySelectorAll('.journey-stop')],previous=document.querySelector('.journey-previous'),next=document.querySelector('.journey-next'),counter=document.querySelector('#journey-current');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function measure(){const step=items.length>1?items[1].offsetLeft-items[0].offsetLeft:track.clientWidth;return{step,max:Math.max(0,track.scrollWidth-track.clientWidth)}}
function update(){const{step,max}=measure(),position=track.scrollLeft;previous.disabled=position<2;next.disabled=position>=max-2;const start=items[0].offsetLeft,visible=items.map((item,index)=>({index,left:item.offsetLeft-start,width:item.offsetWidth})).filter(item=>Math.min(item.left+item.width,position+track.clientWidth)-Math.max(item.left,position)>=item.width*.5);const first=visible.length?visible[0].index+1:Math.min(items.length,Math.round(position/step)+1),last=visible.length?visible[visible.length-1].index+1:first;counter.textContent=String(first).padStart(2,'0')+(last>first?'–'+String(last).padStart(2,'0'):'')}
function go(direction){const{step,max}=measure();track.scrollTo({left:Math.min(max,Math.max(0,track.scrollLeft+direction*step)),behavior:reduced.matches?'instant':'smooth'})}
previous.addEventListener('click',()=>go(-1));next.addEventListener('click',()=>go(1));
track.addEventListener('scroll',update,{passive:true});
track.addEventListener('keydown',event=>{if(event.target!==track)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();go(event.key==='ArrowRight'?1:-1)}else if(event.key==='Home'||event.key==='End'){event.preventDefault();track.scrollTo({left:event.key==='Home'?0:measure().max,behavior:reduced.matches?'instant':'smooth'})}});
new ResizeObserver(update).observe(track);update();
})();

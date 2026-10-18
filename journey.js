(()=>{
const timeline=document.querySelector('.journey-timeline'),list=timeline?.querySelector('.journey-list');if(!list)return;
const items=[...list.children];
// Connect the centers of the first and last milestone, even when text reflows.
function measure(){if(items.length<2)return;list.style.setProperty('--journey-line-length',`${items[items.length-1].offsetTop-items[0].offsetTop}px`)}
new ResizeObserver(measure).observe(list);
// CSS animates only the small colored line, and pauses it while off screen.
new IntersectionObserver(([entry])=>timeline.classList.toggle('is-in-view',entry.isIntersecting)).observe(timeline);
measure();
})();

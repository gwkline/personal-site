<script lang="ts">
  export let icon: string;
  export let title: string;
  
  let card: HTMLDivElement;
  let isHovered = false;
  
  function handleMouseMove(event: MouseEvent) {
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(${isHovered ? 1.02 : 1})
    `;
  }
  
  function handleMouseEnter() {
    isHovered = true;
  }
  
  function handleMouseLeave() {
    isHovered = false;
    if (card) {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
  }
</script>

<div
  role="button"
  tabindex={0}
  bind:this={card}
  class="group p-8 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 hover:border-[#ff4800] transition-all duration-300 ease-out"
  onmousemove={handleMouseMove}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
>
  <div class="flex flex-col gap-4 relative z-10">
    <div 
      class="w-12 h-12 rounded-xl bg-[#ff4800]/10 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110"
    >
      <svg 
        class="w-6 h-6 text-[#ff4800] transform transition-transform duration-300 group-hover:rotate-12" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        {@html icon}
      </svg>
    </div>
    <h2 class="text-[#ff4800] text-xl font-semibold transform transition-transform duration-300 group-hover:translate-x-1">
      {title}
    </h2>
    <p class="text-zinc-300 transform transition-all duration-300 group-hover:text-zinc-100">
      <slot />
    </p>
  </div>
  
  <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ff4800]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
</div>

<style>
  div {
    transform-style: preserve-3d;
    backface-visibility: hidden;
  }
</style> 
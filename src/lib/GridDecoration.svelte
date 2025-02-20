<div class="aspect-square relative overflow-hidden rounded-xl border border-zinc-800">
  <div class="absolute inset-0 bg-gradient-to-br from-[#ff4800] to-black opacity-90"></div>
  <div class="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-4 p-8">
    {#each Array(36) as _, i}
      <div
        class="bg-white/5 rounded-lg transform transition-transform hover:scale-110 hover:bg-white/10"
        style="transition-delay: {i * 20}ms"
      ></div>
    {/each}
  </div>
</div> 
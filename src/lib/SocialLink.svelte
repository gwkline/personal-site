<script lang="ts">
  export let href: string;
  export let icon: string;
  export let label: string;
</script>

<a
  {href}
  class="group relative px-6 py-3 overflow-hidden bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-[#ff4800] transition-colors"
>
  <span class="relative text-zinc-100 font-medium flex items-center gap-2">
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      {@html icon}
    </svg>
    {label}
  </span>
</a> 
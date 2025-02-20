<script lang="ts">
let container: HTMLDivElement;
let gradientX = $state(50);
let gradientY = $state(50);

function handleMouseMove(event: MouseEvent) {
	if (!container) return;
	const rect = container.getBoundingClientRect();
	const x = event.clientX + window.scrollX - rect.left;
	const y = event.clientY + window.scrollY - rect.top;
	gradientX = (x / rect.width) * 100;
	gradientY = (y / rect.height) * 100;
}

import FeatureCard from "$lib/FeatureCard.svelte";
import GridDecoration from "$lib/GridDecoration.svelte";
import SocialLink from "$lib/SocialLink.svelte";
import { onMount } from "svelte";
import { fly } from "svelte/transition";

const socialLinks = [
	{
		href: "https://github.com/gwkline",
		label: "GitHub",
		icon: `<path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd">`,
	},
	{
		href: "https://www.linkedin.com/in/gavinkline/",
		label: "LinkedIn",
		icon: `<path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z">`,
	},
];

const features = [
	{
		icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>`,
		title: "Engineering Excellence",
		description:
			"Building high-performance, scalable applications with Go and TypeScript, emphasizing clean architecture and best practices.",
	},
	{
		icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>`,
		title: "Problem Solver",
		description:
			"Leveraging analytical thinking to transform complex challenges into elegant, efficient solutions.",
	},
	{
		icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>`,
		title: "Team Player",
		description:
			"Former D1 athlete bringing leadership experience and a collaborative mindset to software development.",
	},
];

onMount(() => {
	if (!container) return;
	const rect = container.getBoundingClientRect();
	gradientX = 50;
	gradientY = ((rect.height * 0.3) / rect.height) * 100;
});
</script>

<svelte:head>
  <title>Gavin Kline | Full Stack Engineer</title>
  <meta name="description" content="Full Stack Engineer specializing in modern web development - Building scalable applications with cutting-edge technologies" />
</svelte:head>

<div
  role="main"
  bind:this={container}
  class="relative min-h-[calc(100vh-4rem)] overflow-hidden"
  onmousemove={handleMouseMove}
  style="--gradient-x: {gradientX}%; --gradient-y: {gradientY}%"
>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="gradient-orb"></div>
  </div>

  <div class="relative z-10 px-6 py-12 min-h-[calc(100vh-4rem)] flex items-center">
    <div class="max-w-5xl mx-auto w-full">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
        <div class="lg:col-span-3 space-y-8" in:fly={{ y: 50, duration: 1000 }}>
          <h1 class="text-7xl font-bold tracking-tight">
            <div class="text-zinc-100" in:fly={{ y: 20, duration: 800, delay: 200 }}>Software</div>
            <div class="text-[#ff4800]" in:fly={{ y: 20, duration: 800, delay: 400 }}>Craftsman</div>
          </h1>
          
          <p 
            class="text-xl text-zinc-300"
            in:fly={{ y: 20, duration: 800, delay: 600 }}
          >
            Crafting exceptional digital experiences through modern technology and competitive excellence.
            Bringing the discipline of a former Division I athlete to the world of software engineering.
          </p>

          <div 
            class="flex gap-6 items-center"
            in:fly={{ y: 20, duration: 800, delay: 800 }}
          >
            {#each socialLinks as link}
              <SocialLink {...link} />
            {/each}
          </div>
        </div>

        <div class="lg:col-span-2" in:fly={{ x: 50, duration: 1000, delay: 200 }}>
          <GridDecoration />
        </div>
      </div>

      <div class="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each features as feature, i}
          <div in:fly={{ y: 50, duration: 800, delay: 600 + i * 200 }}>
            <FeatureCard icon={feature.icon} title={feature.title}>
              {feature.description}
            </FeatureCard>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .gradient-orb {
    position: absolute;
    width: 120vmax;
    height: 120vmax;
    background: radial-gradient(
      circle at var(--gradient-x) var(--gradient-y),
      rgba(255, 72, 0, 0.25) 0%,
      rgba(255, 72, 0, 0.15) 15%,
      rgba(255, 72, 0, 0.05) 35%,
      transparent 60%
    );
    opacity: 0.85;
    transform: translate(
      calc((var(--gradient-x) - 50%) * 1px),
      calc((var(--gradient-y) - 50%) * 1px)
    );
    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
    filter: blur(80px);
    mix-blend-mode: screen;
  }

  /* Add a subtle noise texture for depth */
  .gradient-orb::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.08;
    mix-blend-mode: overlay;
  }
</style>

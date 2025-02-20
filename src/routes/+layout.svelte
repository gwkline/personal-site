<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	const { children } = $props();

	let cursorX = $state(0);
	let cursorY = $state(0);
	let isHoveringInteractive = $state(false);

	function handleMouseMove(event: MouseEvent) {
		cursorX = event.clientX;
		cursorY = event.clientY;
	}

	function handleMouseEnterInteractive() {
		isHoveringInteractive = true;
	}

	function handleMouseLeaveInteractive() {
		isHoveringInteractive = false;
	}

	const navItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Projects', href: '/projects' },
		{ label: 'About', href: '/about' },
		{ label: 'Contact', href: '/contact' }
	];

	import { onDestroy, onMount } from 'svelte';

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('mousemove', handleMouseMove);
			cursorX = window.innerWidth / 2;
			cursorY = window.innerHeight / 2;
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('mousemove', handleMouseMove);
		}
	});
</script>

<!-- Custom cursor -->
<div
	class="fixed pointer-events-none z-[100] mix-blend-difference"
	style="transform: translate3d({cursorX}px, {cursorY}px, 0) scale({isHoveringInteractive ? 1.5 : 1})"
>
	<div class="w-6 h-6 -ml-3 -mt-3 bg-white rounded-full transition-transform duration-200"></div>
</div>

<div class="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
	<header class="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 backdrop-blur-md bg-zinc-950/50">
		<nav class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
			<a 
				href="/" 
				class="flex items-center gap-2 hover:text-[#ff4800] transition-colors"
				onmouseenter={handleMouseEnterInteractive}
				onmouseleave={handleMouseLeaveInteractive}
			>
				<img src="/kline_logo_orange.png" alt="Kline Logo" class="h-8 w-auto" />
			</a>

			<ul class="flex items-center gap-6">
				{#each navItems as item}
					<li>
						<a 
							href={item.href}
							class="text-sm {item.href === page.url.pathname ? 'text-zinc-100' : 'text-zinc-400'} hover:text-zinc-100 transition-colors"
							onmouseenter={handleMouseEnterInteractive}
							onmouseleave={handleMouseLeaveInteractive}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</header>

	<main class="flex-1 pt-16">
		{@render children()}
	</main>

	<footer class="border-t border-zinc-800/50">
		<div class="max-w-7xl mx-auto px-6 py-12">
			<div class="flex flex-col md:flex-row justify-between items-start gap-12">
				<div class="space-y-4 max-w-md">
					<div class="flex items-center gap-3">
						<img src="/kline_logo_orange.png" alt="Kline Logo" class="h-8 w-auto" />
						<h3 class="font-semibold text-xl">Gavin Kline</h3>
					</div>
					<p class="text-zinc-400">
						Crafting exceptional digital experiences in New York City.
						Former Division I athlete turned software engineer.
					</p>
					<div 
						role="button"
						tabindex={0}
						class="flex gap-4"
						onmouseenter={handleMouseEnterInteractive}
						onmouseleave={handleMouseLeaveInteractive}
					>
						<a 
							href="https://github.com/gwkline"
							class="text-zinc-400 hover:text-[#ff4800] transition-colors"
							target="_blank"
							rel="noopener noreferrer"
						>
							<span class="sr-only">GitHub</span>
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
							</svg>
						</a>
						<a 
							href="https://www.linkedin.com/in/gavinkline/"
							class="text-zinc-400 hover:text-[#ff4800] transition-colors"
							target="_blank"
							rel="noopener noreferrer"
						>
							<span class="sr-only">LinkedIn</span>
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
							</svg>
						</a>
					</div>
				</div>

				<nav class="grid grid-cols-2 gap-8 md:gap-12">
					<div>
						<h4 class="font-medium text-sm text-zinc-100 mb-3">Navigation</h4>
						<ul class="space-y-2">
							{#each navItems as item}
								<li>
									<a 
										href={item.href}
										class="text-sm text-zinc-400 hover:text-[#ff4800] transition-colors"
										onmouseenter={handleMouseEnterInteractive}
										onmouseleave={handleMouseLeaveInteractive}
									>
										{item.label}
									</a>
								</li>
							{/each}
						</ul>
					</div>

					<div>
						<h4 class="font-medium text-sm text-zinc-100 mb-3">Background</h4>
						<ul class="space-y-2">
							<li class="text-sm text-zinc-400">Syracuse University</li>
							<li class="text-sm text-zinc-400">Division I Lacrosse</li>
							<li class="text-sm text-zinc-400">New York City</li>
						</ul>
					</div>
				</nav>
			</div>

			<div class="mt-12 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
				<p class="text-sm text-zinc-400">&copy; {new Date().getFullYear()} Gavin Kline. All rights reserved.</p>
				<p class="text-sm text-zinc-500">Built with Svelte & Tailwind</p>
			</div>
		</div>
	</footer>
</div>

<style lang="postcss">
	:global(body) {
		@apply antialiased cursor-none;
	}

	:global(a), :global(button), :global(.interactive) {
		cursor: none;
	}
</style>

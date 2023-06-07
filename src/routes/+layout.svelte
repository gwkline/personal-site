<script lang="ts">
	import Nav from "$lib/Nav.svelte"
	import "./styles.css";
	let { children } = $props();

	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
 
	injectSpeedInsights();
</script>

<div class="app">
	<main>
		<Nav />
		{@render children()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

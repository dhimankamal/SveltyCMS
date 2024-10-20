<!--
@file src/components/SiteName.svelte
@description SiteName Component
This component renders the site name with optional styling for 'SveltyCMS'.
It can display the full site name or individual characters, useful for custom layouts or animations.

Features:
- Displays full site name or individual characters
- Special styling for 'SveltyCMS' (splits into main part and 'CMS')
- Customizable through props

Usage:
1. Full site name: <SiteName />
2. Individual character: <SiteName char="S" />

Props:
- char?: string | null - Optional. If provided, renders a single character of the site name.

Note: The component reads the site name from publicEnv.SITE_NAME.
Special styling is applied only when the site name is exactly 'SveltyCMS'.
-->

<script lang="ts">
	import { publicEnv } from '@root/config/public';

	interface Props {
		char?: string | null;
	}

	let { char = null }: Props = $props();

	const siteName = publicEnv.SITE_NAME;
	const targetSiteName = 'SveltyCMS';

	let mainPart = $state(siteName);
	let lastPart = $state('');

	if (siteName === targetSiteName) {
		mainPart = siteName.slice(0, -3); // Get everything except the last character
		lastPart = siteName.slice(-3); // Get only the last CMS characters
	}
</script>

{#if char !== null}
	<span class="font-bold">
		{#if siteName === targetSiteName && mainPart.includes(char)}
			{char}
		{:else if siteName === targetSiteName && lastPart.includes(char)}
			<span class="text-primary-500">{char}</span>
		{:else}
			{char}
		{/if}
	</span>
{:else}
	<span class="font-bold">
		{#if siteName === targetSiteName}
			{mainPart}<span class="text-primary-500">{lastPart}</span>
		{:else}
			{siteName}
		{/if}
	</span>
{/if}

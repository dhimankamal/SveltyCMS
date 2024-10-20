<!-- 
@file src/components/ParaglideSvelteKit.svelte
@description ParaglideSvelteKit component
-->

<script lang="ts">
	import { run } from 'svelte/legacy';

	import { browser } from '$app/environment';

	// Stores
	import { systemLanguage } from '@stores/store';

	import { languageTag, onSetLanguageTag, setLanguageTag } from '@src/paraglide/runtime';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	// initialize the language tag
	let _languageTag;
	run(() => {
		_languageTag = languageTag;
	});

	// Check if the environment is not server-side rendering (SSR)
	if (import.meta.env.SSR === false) {
		onSetLanguageTag((newLanguageTag) => {
			_languageTag = () => newLanguageTag;
		});
	}

	systemLanguage.subscribe((value: any) => {
		setLanguageTag(value); // Update the language tag
		browser && globalThis.localStorage.setItem('systemLanguage', value);
	});
</script>

{#key _languageTag}
	{@render children?.()}
{/key}

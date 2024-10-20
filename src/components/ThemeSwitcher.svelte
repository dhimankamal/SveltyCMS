<!--
@file src/components/ThemeSwitcher.svelte
@description ThemeSwitcher Component using Svelte 5 Runes

This component provides a toggle button to switch between light and dark themes,
utilizing the centralized theme store and Svelte 5 Runes for reactive state management.

Features:
- Toggles between light and dark themes
- Automatically updates the document's class based on the current theme
- Utilizes Svelte 5 Runes for efficient state management and reactivity
- Directly interacts with the centralized theme store for consistent state management
- Type-safe implementation using the custom Theme type

Usage:
1. Import the component:
   import ThemeSwitcher from './components/ThemeSwitcher.svelte';

2. Use the component in your Svelte template:
   <ThemeSwitcher />

Note: This component requires the 'themeStore' and 'updateTheme' function 
from '@stores/themeStore'. Ensure that the theme store is properly initialized
before using this component.

The Theme type is assumed to be an object with a 'name' property of either 'light' or 'dark'.
-->

<script lang="ts">
	import { themeStore, updateTheme } from '@stores/themeStore';

	// Derived value to check if the current theme is dark
	const isDarkTheme = $derived(themeStore.currentTheme?.name === 'dark');

	// Effect to update document class based on theme
	$effect(() => {
		if (isDarkTheme) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});

	// Function to toggle the theme
	function toggleTheme() {
		const newThemeName = isDarkTheme ? 'light' : 'dark';
		updateTheme(newThemeName);
	}
</script>

<button onclick={toggleTheme} class="hover:cursor-pointer">
	{#if isDarkTheme}
		<iconify-icon icon="bi:moon-fill" width="18" />
	{:else}
		<iconify-icon icon="bi:sun-fill" width="18" />
	{/if}
</button>

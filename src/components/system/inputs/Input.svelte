<!--
@file src/components/system/inputs/Input.svelte
@description A reusable input component using Svelte 5 Runes with customizable type, label, and styling.
-->

<script lang="ts">
	import type { Action } from 'svelte/action';

	// Define props with default values and types
	let {
		type = 'text',
		label = '',
		labelClass = '',
		inputClass = '',
		placeholder = '',
		value = '',
		name,
		required,
		disabled
	} = $props<{
		type?: 'text' | 'password' | 'email';
		label?: string;
		labelClass?: string;
		inputClass?: string;
		placeholder?: string;
		value?: string;
		name?: string;
		required?: boolean;
		disabled?: boolean;
	}>();

	// Internal state for input value
	let inputValue = $state(value);

	// Sync internal state with prop value
	$effect(() => {
		inputValue = value;
	});

	// Action to set input type
	const typeAction: Action<HTMLInputElement> = (node) => {
		const updateType = () => {
			node.type = type;
		};

		updateType();

		return {
			update: updateType
		};
	};

	// Compute input classes
	const inputClasses = $derived(`input grow text-black dark:text-primary-500 ${inputClass}`);
</script>

<div class="m-1 flex max-w-full items-center justify-between gap-2">
	{#if label}
		<label for="input" class="w-32 flex-none {labelClass}">{label}</label>
	{/if}
	<input use:typeAction id="input" class={inputClasses} bind:value={inputValue} {placeholder} {name} {required} {disabled} />
</div>

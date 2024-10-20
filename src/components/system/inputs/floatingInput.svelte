<!-- 
 @file src/components/system/inputs/floatingInput.svelte
 @description FloatingInput component

This FloatingInput component has the following properties:

- type: The type of the input element. Can be either 'text' or 'password'.
- value: The value of the input element.
- label: The text to display in the floating label.
- icon: The icon to display next to the input element.
- labelClass: Additional classes to apply to the label element.
- inputClass: Additional classes to apply to the input element.
- error: The error message to display. Can be either a string or a function that returns a string.
- name: The name of the input element.
- required: Whether the input is required. Defaults to false.
- disabled: Whether the input is disabled. Defaults to false.
- minlength: The minimum length of the input value.
- maxlength: The maximum length of the input value.
- onInput: A callback function that is called when the input value changes.
 -->

<script lang="ts">
	import { run, createBubbler, preventDefault } from 'svelte/legacy';

	const bubble = createBubbler();
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleClick(event) {
		event.stopPropagation();
		dispatch('click', event);
	}

	// Define an interface for the input properties
	interface InputProps {
		disabled?: boolean;
		icon?: string;
		iconColor?: string;
		inputClass?: string;
		label?: string;
		labelClass?: string;
		maxlength?: number;
		minlength?: number;
		id?: string;
		name?: string;
		onInput?: (value: string) => void;
		required?: boolean;
		showPasswordBackgroundColor?: 'light' | 'dark';
		textColor?: string;
		type?: 'text' | 'email' | 'password';
		value?: string;
		autocomplete?: 'on' | 'off';
	}


	export const onInput: InputProps['onInput'] = (value) => {};
	interface Props {
		disabled?: InputProps['disabled'];
		icon?: InputProps['icon'];
		iconColor?: InputProps['iconColor'];
		inputClass?: InputProps['inputClass'];
		label?: InputProps['label'];
		labelClass?: InputProps['labelClass'];
		minlength?: InputProps['minlength'];
		maxlength?: InputProps['maxlength'];
		name?: InputProps['name'];
		required?: InputProps['required'];
		showPasswordBackgroundColor?: InputProps['showPasswordBackgroundColor'];
		textColor?: InputProps['textColor'];
		type?: 'password' | 'text' | 'email';
		value?: InputProps['value'];
		tabindex?: number;
		id?: string;
		autocomplete?: string;
		showPassword?: boolean;
	}

	let {
		disabled = false,
		icon = '',
		iconColor = 'gray-500',
		inputClass = '',
		label = '',
		labelClass = '',
		minlength = undefined,
		maxlength = undefined,
		name = '',
		required = false,
		showPasswordBackgroundColor = 'light',
		textColor = '!text-error-500',
		type = 'text',
		value = $bindable(''),
		tabindex = 0,
		id = getIdValue(label) || 'defaultInputId',
		autocomplete = getAutocompleteValue(label),
		showPassword = $bindable(false)
	}: Props = $props();

	let inputElement: HTMLInputElement = $state();

	function getAutocompleteValue(label: string | undefined): string {
		if (label === undefined) {
			return '';
		}
		// Add checks for other types of labels here
		return '';
	}

	function getIdValue(label: string | undefined): string {
		if (label === undefined || label.trim() === '') {
			return 'defaultInputId';
		}
		return label.toLowerCase().replace(/\s+/g, '-');
	}

	const togglePasswordVisibility = () => {
		showPassword = !showPassword;
	};

	function initInput(node: HTMLInputElement) {
		node.type = type;
	}
	run(() => {
		if (type === 'password') showPassword ? inputElement && (inputElement.type = 'text') : inputElement && (inputElement.type = 'password');
	});
</script>

<div class="group relative w-full">
	<input
		use:initInput
		bind:this={inputElement}
		oninput={bubble('input')}
		onkeydown={bubble('keydown')}
		onclick={handleClick}
		bind:value
		{autocomplete}
		class="{inputClass} peer relative block w-full appearance-none rounded-none border-0 border-b-2 border-surface-300 bg-transparent pl-6 !text-{textColor} focus:border-tertiary-600 focus:!outline-none focus:ring-0 dark:border-surface-400 dark:focus:border-tertiary-500"
		{id}
		{name}
		{required}
		{disabled}
		{...minlength !== undefined && { minlength }}
		{...maxlength !== undefined && { maxlength }}
		{...autocomplete && { autocomplete }}
		aria-describedby="{id}-error"
	/>

	{#if icon}
		<iconify-icon aria-hidden="true" {icon} width="18" class="absolute top-3 text-{iconColor}"></iconify-icon>
	{/if}

	{#if type === 'password'}
		<iconify-icon
			{tabindex}
			role="button"
			aria-label="Toggle password visibility"
			icon={showPassword ? 'bi:eye-fill' : 'bi:eye-slash-fill'}
			class={`absolute right-0 ${showPasswordBackgroundColor === 'light' ? 'text-surface-700' : 'text-surface-300'}`}
			width="24"
			onkeydown={bubble('keydown')}
			onclick={preventDefault(togglePasswordVisibility)}
		></iconify-icon>
	{/if}

	{#if label}
		<label
			for={id}
			class="{labelClass} pointer-events-none absolute left-6 transform text-sm text-surface-400 transition-all duration-200 ease-in-out peer-placeholder-shown:-top-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-surface-400 peer-focus:-left-0 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-tertiary-500 {value &&
				'-left-0 -top-1.5 text-xs text-tertiary-500'}"
		>
			{label}
			{#if required}
				<span class="text-error-500">*</span>
			{/if}
		</label>
	{/if}
</div>

<style lang="postcss">
	div {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>

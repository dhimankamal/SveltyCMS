<script>
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte';

	/** @type {{show?: boolean, value?: string, key?: string, active?: string}} */
	let {
		show = false,
		value = '',
		key = '',
		active = $bindable('')
	} = $props();

	let _value;
	run(() => {
		_value = value;
	});
	run(() => {
		key != active && (show_input = false);
	});

	let show_input = $state(false);
	run(() => {
		show_input = false;
		show;
	});

	const ev = createEventDispatcher();
</script>

<div class:hidden={!show}>
	<button
		onclick={() => {
			show_input = !show_input;
			active = key;
		}}
		class="flex items-center"
	>
		<iconify-icon icon="material-symbols:description" width="20"></iconify-icon>
		description
	</button>
	{#if show_input}
		<div class="description">
			<input
				type="text"
				bind:value={_value}
				onkeydown={(e) => {
					if (e.key == 'Enter') {
						show_input = false;
						ev('submit', _value);
					}
				}}
			/>
		</div>
	{/if}
</div>

<style lang="postcss">
	.description {
		position: fixed;
		top: 100%;
		margin-top: 20px;
		left: 50%;
		transform: translate(-50%);
	}
	input {
		border: 1px solid;
		width: 200%;
		padding: 5px;
		border-radius: 5px;
	}
</style>

<!-- 
@file src/components/WatermarkSettings.svelte
@description  WatermarkSettings component 
-->

<script lang="ts">
	interface Props {
		size?: string;
		opacity?: number;
		positionX?: number;
		positionY?: number;
		rotation?: number;
	}

	let {
		size = $bindable('100%'),
		opacity = $bindable(1),
		positionX = $bindable(0),
		positionY = $bindable(0),
		rotation = $bindable(0)
	}: Props = $props();

	function handleSizeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		size = target.value;
	}

	function handleOpacityChange(event: Event) {
		const target = event.target as HTMLInputElement;
		opacity = parseFloat(target.value);
	}

	function handlePositionXChange(event: Event) {
		const target = event.target as HTMLInputElement;
		positionX = parseInt(target.value, 10);
	}

	function handlePositionYChange(event: Event) {
		const target = event.target as HTMLInputElement;
		positionY = parseInt(target.value, 10);
	}

	function handleRotationChange(event: Event) {
		const target = event.target as HTMLInputElement;
		rotation = parseInt(target.value, 10);
	}
</script>

<div class="grid grid-cols-2 gap-2">
	<div>
		<label class="block font-bold" for="size">Size</label>
		<input class="w-full" id="size" type="text" bind:value={size} oninput={handleSizeChange} placeholder="e.g., 100px or 50%" />
	</div>
	<div>
		<label class="block font-bold" for="opacity">Opacity</label>
		<input class="w-full" id="opacity" type="range" min="0" max="1" step="0.1" bind:value={opacity} oninput={handleOpacityChange} />
	</div>
	<div>
		<label class="block font-bold" for="positionX">Position X</label>
		<input class="w-full" id="positionX" type="number" bind:value={positionX} oninput={handlePositionXChange} />
	</div>
	<div>
		<label class="block font-bold" for="positionY">Position Y</label>
		<input class="w-full" id="positionY" type="number" bind:value={positionY} oninput={handlePositionYChange} />
	</div>
	<div>
		<label class="block font-bold" for="rotation">Rotation</label>
		<input class="w-full" id="rotation" type="number" bind:value={rotation} oninput={handleRotationChange} />
	</div>
</div>

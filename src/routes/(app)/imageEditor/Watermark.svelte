<script lang="ts">
	import type Konva from 'konva';
	
	const WATERMARK_POSITION = {
		'top-left': 'top-left',
		'top-center': 'top-center',
		'top-right': 'top-right',
		'center-left': 'center-left',
		'center': 'center',
		'center-right': 'center-right',
		'bottom-left': 'bottom-left',
		'bottom-center': 'bottom-center',
		'bottom-right': 'bottom-right'
	} as const;
	
	type WatermarkPosition = keyof typeof WATERMARK_POSITION;
	
	interface Props {
		stage: Konva.Stage;
		layer: Konva.Layer;
		imageNode: Konva.Image;
	}
	
	let { stage, layer, imageNode } = $props<Props>();
	
	let watermarkFile = $state<File | null>(null);
	let position = $state<WatermarkPosition>('center');
	let opacity = $state(1);
	let scale = $state(100);
	let offsetX = $state(0);
	let offsetY = $state(0);
	let rotation = $state(0);
	
	let watermarkPreview = $state<string | null>(null);
	let watermarkNode = $state<Konva.Image | null>(null);
	
	$effect(() => {
		return () => {
			if (watermarkNode) {
				watermarkNode.destroy();
			}
		};
	});
	
	function applyWatermark() {
		if (!watermarkPreview) return;
	
		if (watermarkNode) {
			watermarkNode.destroy();
		}
	
		const watermarkImage = new Image();
		watermarkImage.src = watermarkPreview;
		watermarkImage.onload = () => {
			watermarkNode = new Konva.Image({
				image: watermarkImage,
				opacity: opacity,
				scaleX: scale / 100,
				scaleY: scale / 100,
				rotation: rotation
			});
	
			const { x, y } = calculateWatermarkPosition();
			watermarkNode.position({ x: x + offsetX, y: y + offsetY });
	
			layer.add(watermarkNode);
			layer.batchDraw();
		};
	}
	
	function calculateWatermarkPosition() {
		const imageWidth = imageNode.width() * imageNode.scaleX();
		const imageHeight = imageNode.height() * imageNode.scaleY();
	
		let x = 0;
		let y = 0;
	
		switch (position) {
			case 'top-left':
				x = 0;
				y = 0;
				break;
			case 'top-center':
				x = imageWidth / 2;
				y = 0;
				break;
			case 'top-right':
				x = imageWidth;
				y = 0;
				break;
			case 'center-left':
				x = 0;
				y = imageHeight / 2;
				break;
			case 'center':
				x = imageWidth / 2;
				y = imageHeight / 2;
				break;
			case 'center-right':
				x = imageWidth;
				y = imageHeight / 2;
				break;
			case 'bottom-left':
				x = 0;
				y = imageHeight;
				break;
			case 'bottom-center':
				x = imageWidth / 2;
				y = imageHeight;
				break;
			case 'bottom-right':
				x = imageWidth;
				y = imageHeight;
				break;
		}
	
		return { x, y };
	}
	
	function handleChange() {
		applyWatermark();
		// Instead of dispatching an event, you might want to use a callback prop or a store
		// to communicate changes to the parent component in Svelte 5
	}
	
	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			watermarkFile = target.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				watermarkPreview = e.target?.result as string;
				applyWatermark();
			};
			reader.readAsDataURL(watermarkFile);
		}
	}
	
	function removeWatermark() {
		watermarkFile = null;
		watermarkPreview = null;
		if (watermarkNode) {
			watermarkNode.destroy();
			watermarkNode = null;
			layer.batchDraw();
		}
		handleChange();
	}
	
	function formatValue(value: number, suffix: string = ''): string {
		return `${value.toFixed(2)}${suffix}`;
	}
	</script>
	
	<div class="wrapper">
		<h3 class="mb-4 text-lg font-bold">Watermark Settings</h3>
	
		<div class="mb-4">
			{#if watermarkPreview}
				<div class="relative mb-2 h-32 w-32">
					<img src={watermarkPreview} alt="Watermark preview" class="border-base-300 h-full w-full rounded border object-contain" />
					<button class="bg-error absolute -right-2 -top-2 rounded-full p-1 text-xs text-white" on:click={removeWatermark}> X </button>
				</div>
			{:else}
				<label class="btn-primary btn mb-2">
					Upload Watermark
					<input type="file" accept="image/*" on:change={handleFileChange} class="hidden" />
				</label>
			{/if}
		</div>
	
		<div class="mb-4 grid grid-cols-2 gap-4">
			<label class="flex flex-col">
				<span class="mb-1">Position:</span>
				<select bind:value={position} on:change={handleChange} class="input-bordered input">
					{#each Object.entries(WATERMARK_POSITION) as [key, value]}
						<option {value}>{key}</option>
					{/each}
				</select>
			</label>
	
			<label class="flex flex-col">
				<span class="mb-1">Opacity: {formatValue(opacity)}</span>
				<input type="range" min="0" max="1" step="0.05" bind:value={opacity} on:input={handleChange} class="range" />
			</label>
	
			<label class="flex flex-col">
				<span class="mb-1">Scale: {formatValue(scale, '%')}</span>
				<input type="range" min="10" max="200" step="1" bind:value={scale} on:input={handleChange} class="range" />
			</label>
	
			<label class="flex flex-col">
				<span class="mb-1">Rotation: {formatValue(rotation, '°')}</span>
				<input type="range" min="0" max="360" step="1" bind:value={rotation} on:input={handleChange} class="range" />
			</label>
		</div>
	
		<div class="mb-4 grid grid-cols-2 gap-4">
			<label class="flex flex-col">
				<span class="mb-1">Offset X: {formatValue(offsetX, 'px')}</span>
				<input type="range" min="-100" max="100" step="1" bind:value={offsetX} on:input={handleChange} class="range" />
			</label>
	
			<label class="flex flex-col">
				<span class="mb-1">Offset Y: {formatValue(offsetY, 'px')}</span>
				<input type="range" min="-100" max="100" step="1" bind:value={offsetY} on:input={handleChange} class="range" />
			</label>
		</div>
	</div>
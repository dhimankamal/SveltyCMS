<!--
@file src/routes/(app)/dashboard/+page.svelte
@description Dashboard page using Svelte 5 runes and Skeleton.dev toast for notifications.
Features:
- Responsive grid layout for widgets
- Add/remove widgets dynamically
- Persistent user preferences
- Theme-aware components
- Skeleton.dev toast notifications
-->

<script lang="ts">
	import { onMount } from 'svelte';

// Stores
	import { userPreferences } from '@stores/userPreferences';
	import { screenSize } from '@stores/screenSizeStore';
	import { theme } from '@stores/themeStore';

	// Svelte-grid
	import { fade } from 'svelte/transition';
	import Grid, { GridItem } from 'svelte-grid-extended';
	

	// Components
	import PageTitle from '@components/PageTitle.svelte';
	import CPUWidget from './widgets/CPUWidget.svelte';
	import DiskWidget from './widgets/DiskWidget.svelte';
	import MemoryWidget from './widgets/MemoryWidget.svelte';
	import Last5MediaWidget from './widgets/Last5MediaWidget.svelte';
	import UserActivityWidget from './widgets/UserActivityWidget.svelte';
	import SystemMessagesWidget from './widgets/SystemMessagesWidget.svelte';

	// Skeleton
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	// Initialize the toast store
	const toastStore = getToastStore();

	// Props
	let { data } = $props();

	// State
	let items = $state([]);
	let dropdownOpen = $state(false);
	let gridElement = $state(null);

	// Derived values
	let itemSize = $derived(getItemSize($screenSize));
	let cols = $derived(getCols($screenSize));
	let currentTheme = $derived($theme);
	let availableWidgets = $derived(
		Object.keys(widgetComponents).filter(
			(componentName) => !items.some((item) => item.component === componentName)
		)
	);
	let canAddMoreWidgets = $derived(
		gridElement && availableWidgets.length > 0 && items.length < getMaxWidgets()
	);

	// Helper functions
	function getItemSize(size) {
		switch (size) {
			case 'sm': return { width: 150, height: 150 };
			case 'md': return { width: 200, height: 200 };
			default: return { width: 250, height: 250 };
		}
	}

	function getCols(size) {
		switch (size) {
			case 'sm': return 2;
			case 'md': return 3;
			default: return 4;
		}
	}

	function getMaxWidgets() {
		if (!gridElement) return 0;
		const gridWidth = Math.floor(gridElement.clientWidth / itemSize.width);
		const gridHeight = Math.floor(gridElement.clientHeight / itemSize.height);
		return gridWidth * gridHeight;
	}

	// Widget components map
	const widgetComponents = {
		CPUWidget: { component: CPUWidget, name: 'CPU Usage' },
		DiskWidget: { component: DiskWidget, name: 'Disk Usage' },
		MemoryWidget: { component: MemoryWidget, name: 'Memory Usage' },
		Last5MediaWidget: { component: Last5MediaWidget, name: 'Last 5 Media' },
		UserActivityWidget: { component: UserActivityWidget, name: 'User Activity' },
		SystemMessagesWidget: { component: SystemMessagesWidget, name: 'System Messages' }
	};

	// Grid management functions
	function resetGrid() {
		items = [];
		userPreferences.clearPreferences(data.user.id);
		showToast('All widgets have been reset.', 'warning');
	}

	function remove(id) {
		items = items.filter((item) => item.id !== id);
		saveWidgets();
		showToast('Widget removed successfully.');
	}

	function saveWidgets() {
		userPreferences.setPreference(data.user.id, $screenSize, items);
	}

	function findEmptySpace(gridWidth, gridHeight) {
		const grid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(false));

		// Mark occupied spaces
		items.forEach((item) => {
			for (let y = item.y; y < item.y + item.h; y++) {
				for (let x = item.x; x < item.x + item.w; x++) {
					if (y < gridHeight && x < gridWidth) {
						grid[y][x] = true;
					}
				}
			}
		});

		// Find first empty space
		for (let y = 0; y < gridHeight; y++) {
			for (let x = 0; x < gridWidth; x++) {
				if (!grid[y][x]) {
					return { x, y };
				}
			}
		}

		return null; // No empty space found
	}

	function addNewItem(componentName) {
		const componentInfo = widgetComponents[componentName];
		if (!componentInfo) {
			console.error('Component not found:', componentName);
			showToast('Error: Widget not found.', 'error');
			return;
		}

		if (!canAddMoreWidgets) {
			showToast('Cannot add more widgets. Grid is full.', 'warning');
			return;
		}

		const gridWidth = Math.floor(gridElement.clientWidth / itemSize.width);
		const gridHeight = Math.floor(gridElement.clientHeight / itemSize.height);
		const emptySpace = findEmptySpace(gridWidth, gridHeight);

		if (emptySpace) {
			const newItem = {
				id: crypto.randomUUID(),
				component: componentName,
				label: componentInfo.name,
				x: emptySpace.x,
				y: emptySpace.y,
				w: 1,
				h: 1,
				min: { w: 1, h: 1 },
				max: { w: 2, h: 2 },
				movable: true,
				resizable: true
			};
			items = [...items, newItem];
			saveWidgets();
			showToast(`${componentInfo.name} widget added successfully.`, 'success');
		} else {
			showToast('No empty space available for new widget.', 'warning');
		}
		dropdownOpen = false;
	}

	function handleLayoutChange(event) {
		if (Array.isArray(event.detail)) {
			items = event.detail.map((item) => ({
				...items.find((i) => i.id === item.id),
				...item
			}));
			saveWidgets();
		}
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function showToast(message, type = 'info') {
		const toast: ToastSettings = {
			message: message,
			background: type === 'error' ? 'variant-filled-error' : 
						type === 'warning' ? 'variant-filled-warning' : 
						type === 'success' ? 'variant-filled-success' : 
						'variant-filled-primary'
		};
		toastStore.trigger(toast);
	}

	// Effects
	$effect(() => {
		userPreferences.loadPreferences(data.user.id).then(() => {
			const loadedItems = $userPreferences[$screenSize];
			items = Array.isArray(loadedItems) ? loadedItems : [];
		});
	});
</script>

<!-- The rest of the template remains largely the same -->

<div class="my-2 flex items-center justify-between gap-2">
	<!-- Page Title -->
	<div class="flex items-center">
		<PageTitle name="Dashboard" icon="bi:bar-chart-line" />
	</div>

	<!-- Back Button -->
	<button on:click={() => history.back()} class="variant-outline-primary btn-icon">
		<iconify-icon icon="ri:arrow-left-line" width="20" />
	</button>
</div>

<div class="my-2 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
	<div class="mt-2 flex w-full justify-around gap-2 sm:ml-auto sm:mt-0 sm:w-auto sm:flex-row">
		{#if canAddMoreWidgets}
			<div class="relative">
				<button
					on:click={toggleDropdown}
					type="button"
					class="btn variant-filled-primary"
					aria-haspopup="true"
					aria-expanded={dropdownOpen}
				>
					<iconify-icon icon="carbon:add-filled" width="24"></iconify-icon>
					Add Widget
				</button>
				{#if dropdownOpen}
					<div
						class="card variant-filled-surface p-4 absolute right-0 z-10 mt-2 w-48"
						aria-label="Add Widget Menu"
					>
						{#each availableWidgets as componentName}
							<button
								on:click={() => addNewItem(componentName)}
								type="button"
								class="btn variant-soft-primary w-full mb-2"
							>
								{widgetComponents[componentName].name}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
		<button class="btn variant-filled-warning" on:click={resetGrid}>Reset All</button>
	</div>
</div>

<div class="relative h-screen" bind:this={gridElement}>
	{#if items && items.length > 0}
		<Grid {cols} {itemSize} on:change={handleLayoutChange}>
			{#each items as item (item.id)}
				<GridItem
					id={item.id}
					x={item.x}
					y={item.y}
					w={item.w}
					h={item.h}
					min={item.min}
					max={item.max}
					movable={item.movable}
					resizable={item.resizable}
				>
					<div transition:fade={{ duration: 300 }} class="relative h-full w-full">
						<div class="absolute right-1 top-1 z-10">
							<button on:click={() => remove(item.id)} class="btn btn-sm variant-filled-error" aria-label="Remove Widget">✕</button>
						</div>
						<div class="card variant-filled-surface p-4 h-full w-full">
							{#if widgetComponents[item.component]}
								<svelte:component this={widgetComponents[item.component].component} label={item.label} {currentTheme} />
							{:else}
								<div>Widget not found: {item.component}</div>
							{/if}
						</div>
					</div>
				</GridItem>
			{/each}
		</Grid>
	{:else}
		<p class="text-center p-4">No widgets added yet. Use the "Add Widget" button to add widgets.</p>
	{/if}
</div>

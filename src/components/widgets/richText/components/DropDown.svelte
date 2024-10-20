<!-- 
@file src/components/widgets/richText/components/DropDown.svelte
@description - Dropdown component
-->

<script lang="ts">
	const { icon, label, show, active, key, items } = $props<{
		icon?: string;
		label: string;
		show: boolean;
		active: string;
		key: string;
		items: {
			name: string;
			icon?: string;
			onClick: () => void;
			active: () => boolean;
		}[];
	}>();

	let expanded = $state(false);
	let wrapper = $state<HTMLDivElement | null>(null);

	let selected = $derived(() => items().filter((item) => item.active())[0]);

	$effect(() => {
		if (key() !== active()) {
			expanded = false;
		}
	});

	function setPosition(node: HTMLDivElement) {
		$effect(() => {
			if (!wrapper) return;

			const parent = wrapper.parentElement as HTMLElement;
			node.style.minWidth = wrapper.offsetWidth + 'px';
			const left_pos = wrapper.getBoundingClientRect().left - parent.getBoundingClientRect().left;

			if (left_pos + node.offsetWidth > parent.offsetWidth) {
				node.style.right = '0';
			} else {
				node.style.left = left_pos < 0 ? '0' : left_pos + 'px';
			}
		});
	}

	function toggleExpanded() {
		expanded = !expanded;
		active.set(key());
	}

	function handleItemClick(item: (typeof items)[number]) {
		item.onClick();
		expanded = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			toggleExpanded();
		}
	}

	function handleItemKeydown(e: KeyboardEvent, item: (typeof items)[number]) {
		if (e.key === 'Enter') {
			handleItemClick(item);
		}
	}
</script>

<div class="wrapper" class:hidden={!show()} onclick={toggleExpanded} bind:this={wrapper} role="button" tabindex="0" onkeydown={handleKeydown}>
	<div class="selected arrow" class:arrow_up={expanded}>
		<iconify-icon icon={icon() || selected()?.icon} width="20"></iconify-icon>
		<p class="max-w-[80px] overflow-hidden whitespace-nowrap">
			{selected() ? selected().name : label()}
		</p>
	</div>

	{#if expanded}
		<div class="items" use:setPosition>
			{#each items() as item}
				<div
					class="item"
					onclick={(e) => {
						e.stopPropagation();
						handleItemClick(item);
					}}
					class:active={item.active()}
					role="button"
					tabindex="0"
					onkeydown={(e) => handleItemKeydown(e, item)}
				>
					<iconify-icon icon={item.icon} width="20"></iconify-icon>
					{item.name}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	.wrapper {
		z-index: 10;
		position: relative;
		width: 150px;
		box-shadow: 0px 0px 3px 0px #3e1717;
		padding: 10px;
		cursor: pointer;
		border-radius: 4px;
	}

	.selected {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 5px;
		text-wrap: nowrap;
		text-overflow: ellipsis ' [..]';
	}

	.arrow::after {
		content: '';
		transform: translateY(-50%);
		border: solid #6b6b6b;
		border-width: 0 3px 3px 0;
		display: inline-block;
		padding: 3px;
		transform: rotate(45deg);
		margin-right: 10px;
		transition: transform 0.1s ease-in;
		margin-left: auto;
	}

	.arrow_up::after {
		transform: rotate(225deg);
	}

	.items {
		position: absolute;
		top: 100%;
		left: 0;
		background-color: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	.item {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 8px 10px;
		cursor: pointer;
	}

	.item:hover {
		background-color: #f0f0f0;
	}

	.item.active {
		background-color: #e0e0e0;
	}
</style>

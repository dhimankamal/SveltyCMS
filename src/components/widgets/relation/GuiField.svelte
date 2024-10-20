<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { Schema } from '@collections/types';

	// Stores
	import { collections } from '@stores/collectionStore';

	// Components
	import DropDown from '@components/system/dropDown/DropDown.svelte';

	interface Props {
		value?: Schema | string;
	}

	let { value = $bindable('') }: Props = $props();
	export const theme: 'dark' | 'light' = 'dark';
	export const label = '';

	let _value =
		$state(typeof value == 'string'
			? value
			: Object.values($collections).find((entry) => {
					return typeof value != 'string' && entry[1].name == value.name;
				})?.[0] || 'null');
	run(() => {
		value = _value;
	});
</script>

<DropDown items={Object.values($collections).map((collection) => collection.name)} bind:selected={_value} label="Select Collection" />

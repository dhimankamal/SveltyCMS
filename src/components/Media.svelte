<!-- 
@file src/components/Media.svelte
@description Media component for displaying and selecting media files
-->

<script lang="ts">
	import type { MediaImage } from '@utils/media/mediaModels';
	import { SIZES, formatBytes, debounce } from '@utils/utils';
	import axios from 'axios';
	import * as m from '@src/paraglide/messages';

	let files: MediaImage[] = [];
	let search = '';
	const searchDeb = debounce(500);
	let showInfo: boolean[] = [];

	export let onselect: (file: MediaImage) => void = () => {};

	async function refresh() {
		const response = await axios.get('/media/getAll');
		files = response.data;
		showInfo = Array(files.length).fill(false);
	}

	$: {
		searchDeb(refresh);
		search;
	}

	refresh();
</script>

{#if files.length === 0}
	<div class="mx-auto text-center text-tertiary-500 dark:text-primary-500">
		<iconify-icon icon="bi:exclamation-circle-fill" height="44" class="mb-2" />
		<p class="text-lg">{m.mediagallery_nomedia()}</p>
	</div>
{:else}
	<div class="header flex items-center gap-2">
		<label for="search" class="font-bold text-tertiary-500 dark:text-primary-500">Media</label>
		<input type="text" bind:value={search} placeholder="Search" class="input" id="search" />
	</div>
	<div class="flex max-h-[calc(100%-55px)] flex-wrap items-center justify-center overflow-auto">
		{#each files as file, index}
			<div 
				on:click={() => onselect(file)} 
				on:keydown={(e) => e.key === 'Enter' && onselect(file)}
				class="card relative flex w-[100%] flex-col md:w-[30%] cursor-pointer"
				role="button"
				tabindex="0"
			>
				<div class="absolute flex w-full items-center bg-surface-700">
					<button 
						class="ml-[2px] mt-[2px] block w-[30px]" 
						on:click|stopPropagation={() => showInfo[index] = !showInfo[index]}
						aria-label="Toggle file info"
					>
						<iconify-icon icon="raphael:info" width="25" class="text-tertiary-500" />
					</button>
					<p class="mx-auto pr-[30px] text-white">{file.name}</p>
				</div>
				{#if !showInfo[index]}
					<img src={file.thumbnails.sm.url} alt={file.name} class="mx-auto mt-auto max-h-[calc(100%-35px)] rounded-md" />
				{:else}
					<table class="mt-[30px] min-h-[calc(100%-30px)] w-full">
						<tbody class="table-compact">
							{#each Object.keys(SIZES) as size}
								<tr>
									<td class="!pl-[10px]">{size}</td>
									<td>{file.thumbnails[size].width}x{file.thumbnails[size].height}</td>
									<td>{formatBytes(file.thumbnails[size].size)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		{/each}
	</div>
{/if}
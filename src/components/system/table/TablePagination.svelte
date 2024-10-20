<!-- 
@file src/components/system/table/TablePagination.svelte
@description Table pagination component
-->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// ParaglideJS
	import * as m from '@src/paraglide/messages';

	interface Props {
		currentPage?: number;
		pagesCount?: number;
		rowsPerPage?: number;
		rowsPerPageOptions?: any;
	}

	let {
		currentPage = 1,
		pagesCount = 1,
		rowsPerPage = 10,
		rowsPerPageOptions = [5, 10, 25, 50, 100, 500]
	}: Props = $props();

	const dispatch = createEventDispatcher();

	function goToPage(page: number) {
		if (page >= 1 && page <= pagesCount) {
			dispatch('updatePage', page);
		}
	}

	function changeRowsPerPage(event: Event) {
		const value = parseInt((event.target as HTMLSelectElement).value);
		if (!isNaN(value)) {
			dispatch('updateRowsPerPage', value);
		}
	}

	let isFirstPage = $derived(currentPage === 1);
	let isLastPage = $derived(currentPage === pagesCount);
</script>

<!-- Pagination info -->
<div class="mb-1 text-xs md:mb-0 md:text-sm" aria-live="polite">
	<span>{m.entrylist_page()}</span>
	<span class="text-tertiary-500 dark:text-primary-500">{currentPage}</span>
	<span>{m.entrylist_of()}</span>
	<span class="text-tertiary-500 dark:text-primary-500">{pagesCount || 0}</span>
</div>

<!-- Pagination controls -->
<div class="variant-outline btn-group">
	<!-- First page button -->
	<button type="button" class="btn" disabled={isFirstPage} aria-label="Go to first page" onclick={() => goToPage(1)}>
		<iconify-icon icon="material-symbols:first-page" width="24"></iconify-icon>
	</button>

	<!-- Previous page button -->
	<button type="button" class="btn" disabled={isFirstPage} aria-label="Go to previous page" onclick={() => goToPage(currentPage - 1)}>
		<iconify-icon icon="material-symbols:chevron-left" width="24"></iconify-icon>
	</button>

	<!-- Rows per page select dropdown -->
	<select
		value={rowsPerPage}
		onchange={changeRowsPerPage}
		class="mt-0.5 bg-transparent text-center text-tertiary-500 dark:text-primary-500"
		aria-label="Rows per page"
	>
		{#each rowsPerPageOptions as pageSize}
			<option class="bg-surface-500 text-white" value={pageSize}>
				{pageSize}
				{m.entrylist_rows()}
			</option>
		{/each}
	</select>

	<!-- Next page button -->
	<button type="button" class="btn" disabled={isLastPage} aria-label="Go to next page" onclick={() => goToPage(currentPage + 1)}>
		<iconify-icon icon="material-symbols:chevron-right" width="24"></iconify-icon>
	</button>

	<!-- Last page button -->
	<button type="button" class="btn" disabled={isLastPage} aria-label="Go to last page" onclick={() => goToPage(pagesCount)}>
		<iconify-icon icon="material-symbols:last-page" width="24"></iconify-icon>
	</button>
</div>

<!-- 
@file src/components/widgets/seo/Seo.svelte
@description - SEO widget
-->

<script lang="ts">
	import { run } from 'svelte/legacy';

	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { publicEnv } from '@root/config/public';
	import { updateTranslationProgress, getFieldName } from '@utils/utils';

	// Stores
	import { contentLanguage } from '@stores/store';
	import { mode, collectionValue } from '@stores/collectionStore';

	// ParaglideJS
	import * as m from '@src/paraglide/messages';

	// Skeleton
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	// Components
	import Heatmap from './Heatmap.svelte';
	import TitleInput from './TitleInput.svelte';
	import DescriptionInput from './DescriptionInput.svelte';
	import RobotsMetaInput from './RobotsMetaInput.svelte';
	import SeoPreview from './SeoPreview.svelte';

	const fieldName = getFieldName(field);
	interface Props {
		field: any;
		value?: any;
	}

	let { field, value = $collectionValue[fieldName] || {} }: Props = $props();

	interface Suggestion {
		text: string;
		impact: number;
	}

	const _data = $state($mode === 'create' ? {} : value);

	let _language = field?.translated ? $contentLanguage : publicEnv.DEFAULT_CONTENT_LANGUAGE;

	// Initialize _data for the current language
	if (!_data[_language]) {
		_data[_language] = {};
	}

	// Initialize title, description, and robotsMeta from _data
	let title = $state(_data[_language].title || '');
	let description = $state(_data[_language].description || '');
	let robotsMeta = $state(_data[_language].robotsMeta || 'index, follow');

	let titleCharacterWidth = $state(0);
	let descriptionCharacterWidth = $state(0);
	let SeoPreviewToggle: boolean = $state(false);
	let score = 0;
	let progress = $state(0);
	let suggestions: Suggestion[] = $state([]);
	let hostUrl = $state('');
	let showHeatmap: boolean = $state(false);
	let seoContent = '';
	let seoKeywords: string[] = $state([]);
	let validationError: string | null = null;

	// Reactive statement to update progress
	run(() => {
		progress = Math.round((score / (8 * 3)) * 100);
	});

	// Update _data whenever title, description, or robotsMeta change
	run(() => {
		_data[_language] = {
			..._data[_language],
			title,
			description,
			robotsMeta
		};
	});

	// Update translation progress
	run(() => {
		updateTranslationProgress(_data, field);
	});

	onMount(() => {
		hostUrl = window.location.origin;
	});

	function calculateCharacterWidth(text: string, fontSize: number, fontFamily: string) {
		const span = document.createElement('span');
		span.style.fontSize = `${fontSize}px`;
		span.style.fontFamily = fontFamily;
		span.innerHTML = text;
		document.body.appendChild(span);
		const characterWidth = span.offsetWidth;
		document.body.removeChild(span);
		return characterWidth;
	}

	function handleTitleChange(event: Event) {
		title = (event.target as HTMLInputElement).value;
		titleCharacterWidth = calculateCharacterWidth(title, 16, 'Arial');
		suggestions = analyze(title, description);
	}

	function handleDescriptionChange(event: Event) {
		description = (event.target as HTMLInputElement).value;
		descriptionCharacterWidth = calculateCharacterWidth(description, 14, 'Arial');
		suggestions = analyze(title, description);
	}

	function analyze(title: string, description: string): Suggestion[] {
		// Analysis logic...
		return [];
	}

	function handleHeatmapGenerated(event: CustomEvent) {
		const { heatmapData, keywordDensity } = event.detail;
		console.log('Heatmap data:', heatmapData);
		console.log('Keyword density:', keywordDensity);
	}

	function handleKeywordsInput(event: Event) {
		seoKeywords = (event.target as HTMLInputElement).value.split(',').map((k) => k.trim().toLowerCase());
	}

	function toggleHeatmap() {
		showHeatmap = !showHeatmap;
	}

	function togglePreview() {
		SeoPreviewToggle = !SeoPreviewToggle;
	}

	// Export WidgetData for data binding with Fields.svelte
	export const WidgetData = async () => _data;
</script>

<div class="input-container">
	<!-- Pass handleTitleChange as a prop -->
	<TitleInput {title} {titleCharacterWidth} {handleTitleChange} />
</div>

<div class="input-container mt-2">
	<!-- Pass handleDescriptionChange as a prop -->
	<DescriptionInput {description} {descriptionCharacterWidth} {handleDescriptionChange} />
</div>

<div class="input-container mt-2">
	<RobotsMetaInput bind:value={robotsMeta} />
</div>

<button class="toggle-heatmap" onclick={toggleHeatmap}>
	{showHeatmap ? 'Hide' : 'Show'} Heatmap
</button>

{#if showHeatmap}
	<div class="seo-heatmap-section" transition:fade={{ duration: 300 }}>
		<h3>SEO Content Heatmap</h3>
		<div class="input-group">
			<label for="seo-keywords">Enter keywords (comma-separated):</label>
			<input id="seo-keywords" type="text" oninput={handleKeywordsInput} placeholder="keyword1, keyword2, ..." />
		</div>
		<!-- Corrected prop name to 'keywords' -->
		<Heatmap content={seoContent} language={$contentLanguage} keywords={seoKeywords} on:heatmapGenerated={handleHeatmapGenerated} />
	</div>
{/if}

<SeoPreview {title} {description} {hostUrl} {SeoPreviewToggle} on:togglePreview={togglePreview} />

<!-- Mobile ProgressRadial display -->
<div class="md:hidden">
	<h3 class="mb-2 text-center">{m.widget_seo_suggestionlist()}</h3>
	<div class="flex items-center justify-around">
		<ProgressRadial value={progress} stroke={200} meter="stroke-primary-500" width="w-20 sm:w-28" class="mr-6 mt-1 text-white">
			{progress}%
		</ProgressRadial>
		<div class="flex flex-col items-center justify-start text-xs sm:text-sm">
			<div class="gap sm:flex sm:gap-4">
				<div class="flex justify-center gap-2">
					<iconify-icon icon="mdi:close-octagon" class="text-error-500" width="20"></iconify-icon>
					<span class="flex-auto">0 - 49</span>
				</div>
				<div class="flex justify-center gap-2">
					<span><iconify-icon icon="bi:hand-thumbs-up-fill" width="20" class="text-tertiary-500"></iconify-icon></span>
					<span class="flex-auto">50 - 79</span>
				</div>
				<div class="flex justify-center gap-2">
					<span><iconify-icon icon="material-symbols:check-circle-outline" class="text-success-500" width="20"></iconify-icon></span>
					<span class="flex-auto">80 - 100</span>
				</div>
			</div>
			<p class="mt-1 hidden text-justify !text-sm sm:block">
				{m.widget_seo_suggestiontext()}
			</p>
		</div>
	</div>
</div>

<!-- Desktop ProgressRadial display -->
<div class="hidden md:block">
	<div class="mt-2 flex items-center justify-center dark:text-white">
		<ProgressRadial value={progress} stroke={200} meter="stroke-primary-500" class="mr-6 mt-1 w-20 text-2xl text-white">
			{progress}%
		</ProgressRadial>
		<div class="mb-2">
			<div class="mb-2 flex items-center justify-between lg:justify-start lg:gap-5">
				<h3 class="">{m.widget_seo_suggestionlist()}</h3>
				<div class="flex items-center gap-2">
					<iconify-icon icon="mdi:close-octagon" class="text-error-500" width="24"></iconify-icon>
					<span class="flex-auto">0 - 49</span>
				</div>
				<div class="flex items-center gap-2">
					<span><iconify-icon icon="bi:hand-thumbs-up-fill" width="24" class="text-tertiary-500"></iconify-icon></span>
					<span class="flex-auto">50 - 79</span>
				</div>
				<div class="flex items-center gap-2">
					<span><iconify-icon icon="material-symbols:check-circle-outline" class="text-success-500" width="24"></iconify-icon></span>
					<span class="flex-auto">80 - 100</span>
				</div>
			</div>
			<p>{m.widget_seo_suggestiontext()}</p>
		</div>
	</div>
</div>

<!-- Suggestions list -->
<ul class="mt-1 grid md:grid-cols-2">
	{#each suggestions as suggestion}
		<li class="flex items-start p-1">
			<div class="mr-4 flex-none">
				{#if suggestion.impact === 3}
					<iconify-icon icon="material-symbols:check-circle-outline" class="text-success-500" width="24"></iconify-icon>
				{:else if suggestion.impact === 2}
					<iconify-icon icon="bi:hand-thumbs-up-fill" width="24" class="text-tertiary-500"></iconify-icon>
				{:else}
					<iconify-icon icon="mdi:close-octagon" class="text-error-500" width="24"></iconify-icon>
				{/if}
			</div>
			<span class="flex-auto text-sm">{suggestion.text}</span>
		</li>
	{/each}
</ul>

<!-- Error Message -->
{#if validationError !== null}
	<p class="text-center text-sm text-error-500">
		{validationError}
	</p>
{/if}

<style lang="postcss">
	.input-label {
		color: gray;
	}
	.input-label.green {
		color: green;
	}
	.input-label.orange {
		color: orange;
	}
	.input-label.red {
		color: red;
	}
</style>

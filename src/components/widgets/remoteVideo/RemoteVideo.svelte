<!-- 
@file src/components/widgets/remoteVideo/RemoteVideo.svelte
@description RemoteVideo widget for fetching and displaying video information
-->

<script lang="ts">
	import { getFieldName } from '@utils/utils';
	// Stores
	import { validationStore } from '@stores/store';
	import { mode, collectionValue } from '@stores/collectionStore';
	// zod validation
	import * as z from 'zod';

	// Define FieldType if it's not imported from elsewhere
	type FieldType = {
		db_fieldName: string;
		placeholder?: string;
		required?: boolean;
		// Add other properties as needed
	};

	// Props
	let { field } = $props<{ field: FieldType }>();

	// State
	let fieldName = $state(getFieldName(field));
	let value = $state($collectionValue[fieldName] || '');
	let _data = $state($mode === 'create' ? {} : value);
	let validationError = $state<string | null>(null);
	let debounceTimeout = $state<number | undefined>(undefined);
	let myData = $state<any>(null);

	// Widget schema
	const widgetSchema = z.object({
		value: z.string().url('Invalid URL format').min(1, 'Video URL is required').optional(),
		db_fieldName: z.string(),
		icon: z.string().optional(),
		color: z.string().optional(),
		width: z.number().optional(),
		required: z.boolean().optional()
	});

	// Generic validation function that uses the provided schema to validate the input
	function validateSchema(schema: z.ZodSchema, data: any): string | null {
		try {
			schema.parse(data);
			validationStore.clearError(fieldName);
			return null; // No error
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errorMessage = error.errors[0]?.message || 'Invalid input';
				validationStore.setError(fieldName, errorMessage);
				return errorMessage;
			}
			return 'Invalid input';
		}
	}

	// Validate the input using the generic validateSchema function with debounce
	function validateInput() {
		if (debounceTimeout) clearTimeout(debounceTimeout);
		debounceTimeout = window.setTimeout(() => {
			validationError = validateSchema(widgetSchema, { value });
		}, 300);
	}

	// Handle video URL submission
	async function handleSubmit() {
		if (!value.trim()) return; // Don't fetch data if input is empty

		try {
			const formData = new FormData();
			formData.append('url', value.trim()); // Pass the URL without encoding
			const response = await fetch('/api/video', {
				method: 'POST',
				body: formData
			});
			const data = await response.json();
			myData = data;

			console.log('Video data fetched successfully', { myData });
		} catch (error) {
			console.log('Error fetching video data', error as Error);
		}
	}

	// Exported functions
	export const WidgetData = async () => _data;
</script>

<input
	type="url"
	bind:value
	onchange={handleSubmit}
	oninput={validateInput}
	name={field?.db_fieldName}
	id={field?.db_fieldName}
	placeholder={field?.placeholder || field?.db_fieldName}
	required={field?.required}
	class="input text-black dark:text-primary-500"
	aria-invalid={!!validationError}
	aria-describedby={validationError ? `${fieldName}-error` : undefined}
/>

<!-- Error Message -->
{#if validationError}
	<p id={`${fieldName}-error`} class="text-center text-sm text-error-500">
		{validationError}
	</p>
{/if}

{#if myData?.videoUrl}
	<div class="overflow-hidden rounded shadow-lg md:flex md:flex-row">
		<div class="px-6 py-4 md:w-1/2">
			<div class="mb-2 text-xl font-bold text-primary-500">{myData?.videoTitle}</div>
			<table class="text-base">
				<tbody>
					<tr>
						<td class="pr-4">User:</td>
						<td class="text-tertiary-500">{myData?.user_name}</td>
					</tr>
					<tr>
						<td class="pr-4">Dimension:</td>
						<td class="text-tertiary-500">{myData?.height}px x {myData?.width}px (height x width)</td>
					</tr>
					<tr>
						<td class="pr-4">Duration:</td>
						<td class="text-tertiary-500">{myData?.duration} min</td>
					</tr>
				</tbody>
			</table>
			<a href={myData?.videoUrl} target="_blank" rel="noreferrer" class="variant-filled-tertiary btn btn-sm mt-4">
				<span><iconify-icon icon="material-symbols:play-circle-outline" width="18"></iconify-icon></span>
				<span>Watch Video</span>
			</a>
		</div>
		<a href={myData?.videoUrl} target="_blank" rel="noreferrer">
			<img class="mt-1 w-full md:h-auto md:w-1/2" data-sveltekit-preload-data="hover" src={myData?.videoThumbnail} alt={myData?.videoTitle} />
		</a>
	</div>
{/if}

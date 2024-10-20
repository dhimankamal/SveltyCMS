<!-- 
@file src/components/widgets/rating/Rating.svelte
@description - Rating widget
-->

<script lang="ts">
	import type { FieldType } from '.';
	import { getFieldName } from '@utils/utils';

	// Stores
	import { validationStore } from '@stores/store';
	import { mode, collectionValue } from '@stores/collectionStore';

	// Skeleton
	import { Ratings } from '@skeletonlabs/skeleton';

	// zod validation
	import * as z from 'zod';



	const fieldName = getFieldName(field);
	interface Props {
		field: FieldType;
		maxRating?: number;
		color?: string;
		size?: number;
		iconEmpty?: string;
		iconHalf?: string;
		iconFull?: string;
		value?: any;
	}

	let {
		field,
		maxRating = 5,
		color = 'warning-500',
		size = 25,
		iconEmpty = 'material-symbols:star-outline',
		iconHalf = 'material-symbols:star-half',
		iconFull = 'material-symbols:star',
		value = $collectionValue[fieldName] || {}
	}: Props = $props();

	// Initialize _data based on mode
	const _data = $state($mode === 'create' ? {} : value);

	let validationError: string | null = $state(null);
	let debounceTimeout: number | undefined;

	// Define the validation schema for the rating widget
	const widgetSchema = z.object({
		value: z.number().min(1, 'Rating must be at least 1 star').max(maxRating, `Rating cannot exceed ${maxRating} stars`).optional(),
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

	// Handle rating click with debounce
	function handleIconClick(event: CustomEvent<{ index: number }>): void {
		if (debounceTimeout) clearTimeout(debounceTimeout);
		debounceTimeout = window.setTimeout(() => {
			_data.value = event.detail.index;
			validateInput();
		}, 300);
	}

	// Validate the input using the generic validateSchema function
	function validateInput() {
		validationError = validateSchema(widgetSchema, { value: _data.value });
	}

	// Export WidgetData for data binding with Fields.svelte
	export const WidgetData = async () => _data;
</script>

<!-- Ratings -->
<Ratings
	bind:value={_data.value}
	max={maxRating}
	interactive
	on:icon={handleIconClick}
	aria-invalid={!!validationError}
	aria-describedby={validationError ? `${fieldName}-error` : undefined}
>
	{#snippet empty()}
		<iconify-icon icon={iconEmpty} width={size} {color}></iconify-icon>
	{/snippet}
	{#snippet half()}
		<iconify-icon icon={iconHalf} width={size} {color}></iconify-icon>
	{/snippet}
	{#snippet full()}
		<iconify-icon icon={iconFull} width={size} {color}></iconify-icon>
	{/snippet}
</Ratings>

<!-- Error Message -->
{#if validationError}
	<p id={`${fieldName}-error`} class="text-center text-sm text-error-500">
		{validationError}
	</p>
{/if}

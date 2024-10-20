<!-- 
@file src/components/widgets/relation/Relation.svelte
@description - Relation widget
-->

<script lang="ts">
	import { run } from 'svelte/legacy';

	// Stores
	import { contentLanguage, saveFunction, validationStore } from '@stores/store';
	import { collectionValue, mode, collection, collections } from '@stores/collectionStore';

	// Components
	import DropDown from './DropDown.svelte';
	import Fields from '@components/Fields.svelte';

	import type { FieldType } from '.';

	// Utils
	import { getData } from '@utils/data';
	import { extractData, findById, getFieldName, saveFormData } from '@utils/utils';

	const fieldName = getFieldName(field);
	export const value = $collectionValue[fieldName];

	let dropDownData: any = $state();
	let selected: { display: any; _id: any } | undefined = $state(undefined);
	let fieldsData = $state({});
	let showDropDown = $state(false);
	let entryMode: 'create' | 'edit' | 'choose' = $state('choose');
	let relation_entry: any = $state();
	const relationCollection = $collections[field?.relation];

	let validationError: string | null = $state(null);
	let debounceTimeout: number | undefined;

	// zod validation
	import * as z from 'zod';
	interface Props {
		field: FieldType;
		expanded?: boolean;
	}

	let { field, expanded = $bindable(false) }: Props = $props();

	// Define the validation schema for the relation widget
	const widgetSchema = z.object({
		_id: z.string().optional(),
		display: z.string().min(1, 'Selection is required').optional()
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
			validationError = validateSchema(widgetSchema, { _id: selected?._id, display: selected?.display });
		}, 300);
	}

	export const WidgetData = async () => {
		let relation_id = '';
		if (!field) return;
		if (entryMode === 'create') {
			relation_id = (await saveFormData({ data: fieldsData, _collection: relationCollection, _mode: 'create' }))[0]?._id;
		} else if (entryMode === 'choose') {
			relation_id = selected?._id;
		} else if (entryMode === 'edit') {
			relation_id = (
				await saveFormData({
					data: fieldsData,
					_collection: relationCollection,
					_mode: 'edit',
					id: relation_entry._id
				})
			)[0]?._id;
		}
		validateInput();
		return validationError ? null : relation_id;
	};

	async function openDropDown() {
		if (!field) return;
		dropDownData = (
			await getData({
				collectionName: field.relation as any,
				limit: 10
			})
		).entryList;

		showDropDown = true;
		entryMode = 'choose';
	}

	let display = $state('');

	run(() => {
		(async (_) => {
			let data: any;
			if ($mode === 'edit' && field) {
				if (entryMode === 'edit' || entryMode === 'create') {
					data = await extractData(fieldsData);
				} else if (entryMode === 'choose') {
					if (typeof value === 'string') {
						data = await findById(value, relationCollection?.name as string);
					} else {
						data = value;
					}
				}
				!relation_entry && (relation_entry = data);
			} else {
				data = await extractData(fieldsData);
			}

			data = data[field.displayPath] ? data : value;
			data = $mode === 'create' ? {} : data;
			display = await field?.display({
				data,
				field,
				collection: $collection,
				entry: $collectionValue,
				contentLanguage: $contentLanguage
			});
		})(expanded);
	});

	function save() {
		expanded = false;
		$saveFunction.reset();
		validateInput();
	}
</script>

{#if !expanded && !showDropDown}
	<div class="relative mb-1 flex w-screen min-w-[200px] max-w-full items-center justify-start gap-0.5 rounded border py-1 pl-10 pr-2">
		<button class="flex-grow text-center dark:text-primary-500" onclick={openDropDown} aria-haspopup="listbox" aria-expanded={showDropDown}>
			{@html selected?.display || display || 'select new'}
		</button>

		<div class="ml-auto flex items-center pr-2">
			{#if $mode === 'create'}
				<button
					onclick={() => {
						expanded = !expanded;
						entryMode = 'create';
						fieldsData = {};
						selected = undefined;
						relation_entry = {};
					}}
					class="btn-icon"
					aria-label="Create new relation"
				>
					<iconify-icon icon="icons8:plus" width="30" class="dark:text-primary-500"></iconify-icon>
				</button>
			{/if}
			<button
				onclick={() => {
					expanded = !expanded;
					entryMode = 'edit';
					fieldsData = {};
					selected = undefined;
				}}
				class="btn-icons"
				aria-label="Edit relation"
			>
				<iconify-icon icon="mdi:pen" width="28" class="dark:text-primary-500"></iconify-icon>
			</button>
		</div>
	</div>
{:else if !expanded && showDropDown}
	<DropDown {dropDownData} {field} bind:selected bind:showDropDown on:select={validateInput} />
{:else}
	<Fields fields={relationCollection?.fields} root={false} bind:fieldsData customData={relation_entry} />
	{(($saveFunction.fn = save), '')}
{/if}

<!-- Error Message -->
{#if validationError}
	<p id={`${fieldName}-error`} class="text-center text-sm text-error-500">
		{validationError}
	</p>
{/if}

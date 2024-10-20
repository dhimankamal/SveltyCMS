<!-- 
@file src/components/widgets/imageArray/ImageArray.svelte
@description - ImageArray widget
-->

<script lang="ts">
	import { publicEnv } from '@root/config/public';
	import { saveFormData, getFieldName } from '@utils/utils';
	import type { FieldType } from '.';

	// Stores
	import { loadingProgress, validationStore } from '@stores/store';
	import { mode } from '@stores/collectionStore';

	// Components
	import Fields from '@components/Fields.svelte';
	import VerticalList from '@components/VerticalList.svelte';

	// Skeleton
	import { FileDropzone, ProgressBar, Avatar } from '@skeletonlabs/skeleton';

	// zod validation
	import * as z from 'zod';

	interface Props {
		field: FieldType;
	}

	let { field }: Props = $props();

	let files: any = $state([]);
	const _fieldsValue: any = $state([]);
	let name: any = $state();
	const optimizedFileName: string | undefined = undefined;
	const optimizedMimeType: string | undefined = undefined;
	let hashValue: string | undefined;
	let selectedFiles: string[] = [];
	let collapsedAll = $state(false);
	let validationError: string | null = $state(null);

	if (field.db_fieldName) {
		name = getFieldName(field);
	} else {
		name = 'defaultName';
	}

	// Define the validation schema for this widget
	const widgetSchema = z.array(
		z.object({
			file: z
				.instanceof(File)
				.refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
				.refine(
					(file) => ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'].includes(file.type),
					'Invalid file format'
				)
		})
	);

	// Generic validation function that uses the provided schema to validate the input
	function validateSchema(schema: z.ZodSchema, data: any): string | null {
		try {
			schema.parse(data);
			validationStore.clearError(name);
			return null; // No error
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errorMessage = error.errors[0]?.message || 'Invalid input';
				validationStore.setError(name, errorMessage);
				return errorMessage;
			}
			return 'Invalid input';
		}
	}

	export const WidgetData = async () => {
		for (let i = 0; i < files.length; i++) {
			const fieldsData = _fieldsValue[i];

			for (const key in fieldsData) {
				console.log(await fieldsData[key]());
			}

			fieldsData.id = crypto.randomUUID();

			await saveFormData(fieldsData);
		}
		if (!files.length) {
			const fieldsData = _fieldsValue;
			await saveFormData({ data: fieldsData });
		}
	};

	// update added files
	function onDropzoneChangeHandler(e: Event): void {
		const input = e.target as HTMLInputElement;
		const newFiles = Array.from(input.files || []);
		selectedFiles = newFiles.map((file) => file.name);
		files = newFiles;
		validateInput();
	}

	// Validate the input using the generic validateSchema function
	function validateInput() {
		validationError = validateSchema(
			widgetSchema,
			files.map((file: File) => ({ file }))
		);
	}

	const flipDurationMs = 200;
	const handleDndConsider = (e) => {
		const updatedItems = e.detail.items;
		files = updatedItems.map((item) => item.data);
	};

	const handleDndFinalize = (e) => {
		const updatedItems = e.detail.items;
		files = updatedItems.map((item) => item.data);
	};

	function toggleCollapseAll() {
		collapsedAll = !collapsedAll;

		if (Array.isArray(files)) {
			files.forEach((file) => {
				file.collapsed = collapsedAll ? false : !file.collapsed;
			});
		}
	}

	function toggleCollapse(index: number) {
		files[index].collapsed = !files[index].collapsed;
	}

	function deleteImage(index: number) {
		if (!Array.isArray(files)) {
			files = Array.from(files);
		}

		if (index >= 0 && index < files.length) {
			files.splice(index, 1);

			if (files.length === 0 || files.every((file) => file.collapsed)) {
				collapsedAll = false;
			}
		} else {
			console.error('Invalid index');
		}
	}

	function addMoreImages() {
		console.log('addMoreImages:');
	}
</script>

{#if files.length > 0}
	<div class="flex items-center justify-center gap-2">
		<div class="flex justify-start gap-2">
			<p class="text-primary-500">Drag & Drop to Sort</p>
		</div>
		<div class="flex justify-center gap-2">
			<p class="variant-filled-primary badge rounded-full">{files.length}</p>
			<p>Images</p>
		</div>
		<div class="flex justify-end gap-2">
			<button class="variant-outline-primary btn-icon" onclick={toggleCollapseAll}>
				<iconify-icon icon="mdi:collapse-all-outline" width="20"></iconify-icon>
			</button>
			<button class="variant-outline-primary btn-icon" onclick={addMoreImages}>
				<iconify-icon icon="material-symbols:add" width="20"></iconify-icon>
			</button>
		</div>
	</div>

	<VerticalList {files} {flipDurationMs} {handleDndConsider} {handleDndFinalize}>
		{#each files as file, index}
			<div class="relative my-2 rounded border-2 border-surface-300 p-2">
				<div class="flex w-full items-center justify-between {file.collapsed || collapsedAll ? '' : 'border-b pb-2'}">
					<div class="flex items-center gap-2">
						<p class="variant-ghost-primary badge rounded-full">{index}.</p>
						{#if collapsedAll || file.collapsed}
							<Avatar src={URL.createObjectURL(file)} width="w-10" rounded="rounded" />
						{/if}
						<p class="flex-auto font-bold text-primary-500">{file.name}</p>
					</div>

					<div class="flex items-center gap-2">
						<button class="variant-outline btn-icon" onclick={() => toggleCollapse(index)}>
							<iconify-icon icon="bxs:up-arrow" width="18" class:rotate-180={file.collapsed || collapsedAll}></iconify-icon>
						</button>

						<button class="variant-outline btn-icon" onclick={() => deleteImage(index)}>
							<iconify-icon icon="mdi:delete" width="18" class="text-error-500"></iconify-icon>
						</button>

						<iconify-icon icon="mdi:drag" width="18" class="ml-2 cursor-move"></iconify-icon>
					</div>
				</div>

				{#if $loadingProgress}
					<ProgressBar label="Image Optimization" value={$loadingProgress} max={100} meter="bg-surface-900-50-token" />
				{/if}

				{#if !file.collapsed && !collapsedAll}
					<div class="flex justify-around gap-2 md:mr-4">
						<img src={URL.createObjectURL(file)} alt="" class="mt-4 h-60 rounded-md border" />

						<div>
							<p class="text-lg font-semibold text-primary-500">
								{#if optimizedFileName}Uploaded File: <span class="text-primary-500">{optimizedFileName}</span>{/if}
								{#if $loadingProgress != 100}Optimized as <span class="uppercase">{publicEnv.MEDIA_OUTPUT_FORMAT_QUALITY.format}: </span>{/if}
							</p>
							<p>File size: <span class="text-primary-500">{(file.size / 1024).toFixed(2)} KB</span></p>
							<p>MIME type: <span class="text-primary-500">{optimizedMimeType || file.type}</span></p>
							<p>Hash: <span class="text-primary-500">{hashValue}</span></p>
						</div>
					</div>

					<Fields root={false} fields={field.fields} bind:fieldsData={_fieldsValue[index]} value={file} />
				{/if}
			</div>
		{/each}
	</VerticalList>
{:else if $mode == 'edit'}
	<ol class="list">
		<li>
			<span class="text-primary-500">{files.length}.</span>
			<span class="flex-auto"> test <Fields fields={field.fields} /></span>
		</li>
	</ol>
{:else}
	<FileDropzone {name} bind:files accept="image/*" type="file" multiple on:change={onDropzoneChangeHandler}>
		{#snippet lead()}
						<iconify-icon icon="fa6-solid:file-arrow-up" width="45"></iconify-icon>
					{/snippet}
		{#snippet message()}
						<span class="font-bold">Upload <span class="text-primary-500">Multiple </span>files</span> or drag & drop
					{/snippet}
		{#snippet meta()}
						PNG, JPG, GIF, WEBP, AVIF, and SVG allowed.
					{/snippet}
	</FileDropzone>
{/if}

<!-- Error Message -->
{#if validationError}
	<p id={`${name}-error`} class="text-center text-sm text-error-500">
		{validationError}
	</p>
{/if}

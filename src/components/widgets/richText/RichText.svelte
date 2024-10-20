<!-- 
@file src/components/widgets/richText/RichText.svelte
@description RichText TipTap widget optimized with Svelte 5 Runes, fixed TypeScript errors, and improved accessibility
-->

<script lang="ts">
	import { publicEnv } from '@root/config/public';
	import { tick } from 'svelte';
	import type { ComponentProps } from 'svelte';
	import type { FieldType } from '.';
	import { meta_data, createRandomID, debounce, getFieldName, updateTranslationProgress } from '@utils/utils';

	// Stores
	import { contentLanguage } from '@stores/store';
	import { mode, collectionValue } from '@stores/collectionStore';

	// Components
	import DropDown from './components/DropDown.svelte';
	import ColorSelector from './components/ColorSelector.svelte';
	import ImageResize from './extensions/ImageResize';
	import ImageDescription from './components/ImageDescription.svelte';
	import FileInput from '@components/system/inputs/FileInput.svelte';
	import VideoDialog from './components/VideoDialog.svelte';

	// Skeleton
	import { ListBox } from '@skeletonlabs/skeleton';

	// TipTap
	import StarterKit from '@tiptap/starter-kit';
	import { Editor, Extension } from '@tiptap/core';
	import TextStyle from './extensions/TextStyle';
	import FontFamily from '@tiptap/extension-font-family';
	import Color from '@tiptap/extension-color';
	import TextAlign from '@tiptap/extension-text-align';
	import Link from '@tiptap/extension-link';
	import Youtube from '@tiptap/extension-youtube';

	// Props and state
	let { field } = $props<{ field: FieldType }>();
	let element = $state<HTMLElement | null>(null);
	let editor = $state<Editor | null>(null);
	let showImageDialog = $state(false);
	let showVideoDialog = $state(false);
	let images = $state<Record<string, File>>({});
	let active_dropDown = $state('');
	let fontSize = $state(16);

	// Computed values
	let fieldName = $derived(getFieldName(field));
	let value = $derived($collectionValue[fieldName] || { content: {}, header: {} });
	let _data = $derived($mode == 'create' ? { content: {}, header: {} } : value);
	let _language = $derived(field?.translated ? $contentLanguage : publicEnv.DEFAULT_CONTENT_LANGUAGE);

	// Effects
	$effect(() => {
		updateTranslationProgress(_data.content, field);
	});

	$effect(() => {
		if (editor && _language) {
			editor.commands.setContent(_data.content[_language] || '');
		}
	});

	$effect(() => {
		if (!element) return;

		editor = new Editor({
			parseOptions: { preserveWhitespace: 'full' },
			element: element,
			extensions: [
				StarterKit,
				Link,
				TextStyle,
				FontFamily,
				Color,
				Youtube,
				ImageResize,
				TextAlign.configure({
					types: ['heading', 'paragraph', 'image']
				}),
				Extension.create({
					name: 'Tab',
					addKeyboardShortcuts() {
						return {
							Tab: () => this.editor.commands.insertContent('\t')
						};
					}
				})
			],
			content: Object.keys(_data.content).length > 0 ? _data.content[_language] : value.content[_language] || '',
			onTransaction: ({ transaction }) => {
				active_dropDown = '';
				handleImageDeletes(transaction);
				let content = editor?.getHTML() ?? '';
				content == '<p></p>' && (content = '');
				_data.content[_language] = content;
			}
		});

		tick().then(() => {
			editor?.commands.focus('start');
		});

		return () => {
			editor?.destroy();
		};
	});

	// Helper functions
	function handleImageDeletes(transaction) {
		const getImageIds = (fragment) => {
			const srcs = new Set();
			fragment.forEach((node) => {
				if (node.type.name === 'image') {
					srcs.add(node.attrs.media_image);
				}
			});
			return srcs;
		};

		const currentIds = getImageIds(transaction.doc.content);
		const previousIds = getImageIds(transaction.before.content);
		const deletedImageIds = [...previousIds].filter((id) => !currentIds.has(id)) as string[];

		if (deletedImageIds.length > 0) {
			meta_data.add('media_images_remove', deletedImageIds);
		}
	}

	// Computed properties for TipTap settings
	let textTypes = $derived<ComponentProps<ListBox>['items']>([
		// ... (textTypes array content)
	]);

	let fonts = $derived<ComponentProps<ListBox>['items']>([
		// ... (fonts array content)
	]);

	let alignText = $derived<ComponentProps<ListBox>['items']>([
		// ... (alignText array content)
	]);

	let inserts = $derived<ComponentProps<ListBox>['items']>([
		// ... (inserts array content)
	]);

	let floats = $derived<ComponentProps<ListBox>['items']>([
		// ... (floats array content)
	]);

	$effect(() => {
		if (editor && element) {
			fontSize = editor.getAttributes('textStyle').fontSize || parseInt(window.getComputedStyle(element).fontSize);
		}
	});

	let show = $derived(
		(button: 'textType' | 'font' | 'align' | 'insert' | 'float' | 'color' | 'bold' | 'italic' | 'strike' | 'link' | 'fontSize' | 'description') => {
			if (editor?.isActive('image')) {
				return ['float', 'align', 'description'].includes(button);
			}
			if (['description', 'float'].includes(button)) {
				return false;
			}
			return true;
		}
	);

	// Export for WidgetData
	export const WidgetData = async () => ({ images, data: _data });
</script>

<input type="text" bind:value={_data.header[_language]} placeholder="Title" class="input mt-2 !w-full" />

<!-- Rich Text Editor -->
<div class="m-auto flex max-h-[500px] w-full flex-col items-center gap-2 overflow-auto">
	{#if editor}
		<!-- Toolbar -->
		<div class="sticky top-0 z-10 flex w-full items-center justify-center gap-1">
			<!-- TextType -->
			<DropDown show={show('textType')} items={textTypes} label="Text" active={active_dropDown} key="textType" />
			<!-- Font -->
			<DropDown key="font" show={show('font')} items={fonts} icon="gravity-ui:text" label="Font" active={active_dropDown} />
			<!-- Color -->
			<ColorSelector
				key="color"
				active={active_dropDown}
				show={show('color')}
				color={editor.getAttributes('textStyle').color || '#000000'}
				on:change={(e) => editor.chain().focus().setColor(e.detail).run()}
			/>

			<!-- Font Size -->
			<div class="btn-group" class:hidden={!show('fontSize')}>
				<button
					onclick={() => {
						fontSize--;
						editor.chain().focus().setFontSize(fontSize).run();
					}}
					aria-label="Decrease font size"
				>
					<iconify-icon icon="bi:dash-lg" width="22"></iconify-icon>
				</button>
				<input type="text" class="w-[30px] text-center outline-none" bind:value={fontSize} aria-label="Font size" />
				<button
					onclick={() => {
						fontSize++;
						editor.chain().focus().setFontSize(fontSize).run();
					}}
					aria-label="Increase font size"
				>
					<iconify-icon icon="bi:plus-lg" width="22"></iconify-icon>
				</button>
			</div>

			<!-- Text Formatting -->
			<div class="divide-x">
				<button
					onclick={() => editor.chain().focus().toggleBold().run()}
					class:active={editor.isActive('bold')}
					aria-label="Toggle bold"
					class:hidden={!show('bold')}
				>
					<iconify-icon icon="bi:type-bold" width="22"></iconify-icon>
				</button>
				<button
					onclick={() => editor.chain().focus().toggleItalic().run()}
					class:active={editor.isActive('italic')}
					aria-label="Toggle italic"
					class:hidden={!show('italic')}
				>
					<iconify-icon icon="bi:type-italic" width="22"></iconify-icon>
				</button>
				<button
					onclick={() => editor.chain().focus().toggleStrike().run()}
					class:active={editor.isActive('strike')}
					aria-label="Toggle strikethrough"
					class:hidden={!show('strike')}
				>
					<iconify-icon icon="bi:type-strikethrough" width="22"></iconify-icon>
				</button>
				<button
					onclick={() => editor.chain().focus().toggleLink({ href: 'https://google.com' }).run()}
					class:active={editor.isActive('link')}
					aria-label="Toggle link"
					class:hidden={!show('link')}
				>
					<iconify-icon icon="bi:link-45deg" width="20"></iconify-icon>
				</button>
			</div>

			<!-- Align -->
			<DropDown key="align" show={show('align')} items={alignText} label="Align" active={active_dropDown} />
			<!-- Insert -->
			<DropDown key="insert" show={show('insert')} items={inserts} icon="typcn:plus" label="Insert" active={active_dropDown} />
			<!-- Float -->
			<DropDown key="float" show={show('float')} items={floats} icon="grommet-icons:text-wrap" label="Text Wrap" active={active_dropDown} />

			<!-- Image Description -->
			<ImageDescription
				active={active_dropDown}
				key="description"
				show={show('description')}
				value={editor.getAttributes('image').description}
				on:submit={(e) => {
					editor.chain().focus().setImageDescription(e.detail).run();
				}}
			/>

			<!-- Image Upload -->
			<FileInput
				bind:show={showImageDialog}
				class="fixed left-1/2 top-0 z-10 -translate-x-1/2 bg-white"
				on:change={async (e) => {
					const data = e.detail;
					let url;
					if (data instanceof File) {
						url = URL.createObjectURL(data);
						const image_id = (await createRandomID()).toString();
						images[image_id] = data;
						editor.chain().focus().setImage({ src: url, id: image_id }).run();
					} else {
						url = data.original.url;
						editor.chain().focus().setImage({ src: url, storage_image: data._id }).run();
					}
				}}
			/>

			<!-- Video Dialog -->
			<VideoDialog bind:show={showVideoDialog} {editor} />
		</div>
	{/if}

	<!-- Text Area -->
	<div
		onpointerdown={() => editor?.commands.focus('end')}
		bind:this={element}
		class="RichText min-h-[calc(100vh-80px)] w-full flex-grow cursor-text overflow-auto"
	></div>
</div>

<style lang="postcss">
	@import 'RichText.css';

	button.active {
		color: rgb(0, 255, 123);
	}
	:global(.tiptap) {
		outline: none;
	}
	:global(.ProseMirror-selectednode img) {
		box-shadow: 0px 0px 4px 0px #34363699 inset;
	}
</style>

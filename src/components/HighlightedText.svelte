<!-- 
@file src/components/HighlightedText.svelte
@description HighlightedText component
-->

<script lang="ts">
	interface Props {
		text?: string;
		term?: string;
	}

	let { text = '', term = '' }: Props = $props();

	function highlight(text: string, term: string): string {
		if (!term) {
			return text;
		}

		const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Properly escape regex metacharacters
		const regex = new RegExp(escapedTerm, 'gi'); // Match case-insensitively and globally
		return text.replace(regex, (match) => `<mark class="bg-waring-500 px-1">${match}</mark>`);
	}
</script>

{@html `<span>${highlight(text, term)}</span>`}

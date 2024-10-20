<!--
@file src/components/PermissionGuard.svelte
@description Guard component for permission-based access control.
-->

<script lang="ts">
	import { page } from '$app/stores';
	import type { PermissionConfig } from '@src/auth/permissionCheck';

	// Prop to receive permission configuration
	interface Props {
		config: PermissionConfig | undefined;
		children?: import('svelte').Snippet;
	}

	let { config, children }: Props = $props();

	// Reactive variables from page store
	let user = $derived($page.data.user);
	let permissions = $derived($page.data.permissions || {});
	let permissionData = $derived(config?.contextId ? permissions[config.contextId] || {} : {});
	let isAdmin = $derived(user?.role?.toLowerCase() === 'admin'); // Ensure user object has role and check for admin
	let hasPermission = $derived(isAdmin || permissionData.hasPermission || false); // Admins always have permission
	let isRateLimited = $derived(permissionData.isRateLimited || false);

	// Debugging logs for development
	// $: {
	// 	console.debug('PermissionGuard Debug Info:', {
	// 		user,
	// 		config,
	// 		permissions,
	// 		permissionData,
	// 		hasPermission,
	// 		isRateLimited,
	// 		isAdmin
	// 	});
	// }
</script>

<!-- Permission Handling -->
{#if config}
	{#if hasPermission && !isRateLimited}
		{@render children?.()}
	{:else if isRateLimited}
		<p>Rate limit reached. Please try again later.</p>
	{/if}
{:else}
	<p>Permission configuration is missing.</p>
{/if}

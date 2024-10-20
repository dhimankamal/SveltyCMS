<!-- 
@file src/components/ModalEditForm.svelte
@description A modal for editing user data.
-->

<script lang="ts">
	import axios from 'axios';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import * as m from '@src/paraglide/messages';
	import FloatingInput from '@components/system/inputs/floatingInput.svelte';
	import PermissionGuard from '@components/PermissionGuard.svelte';
	import type { PermissionConfig } from '@src/auth/permissionCheck';
	import { PermissionAction } from '@root/config/permissions';

	export let parent: any;
	export let isGivenData: boolean = false;
	export let username: string | null = null;
	export let email: string | null = null;
	export let role: string | null = null;
	export let user_id: string | null = null;

	const modalStore = getModalStore();
	const { roles, user, isFirstUser } = $page.data;

	const modaleEditFormConfig: PermissionConfig = {
		contextId: '/user/modaleEditForm',
		name: 'admin',
		action: PermissionAction.READ,
		contextType: 'user'
	};

	const isRoleActive = (roleName: string): boolean => 
		user?.role?.toLowerCase() === roleName.toLowerCase();

	const formData = {
		user_id: isGivenData ? user_id : user?._id,
		username: isGivenData ? (username ?? '') : (user?.username ?? ''),
		email: isGivenData ? (email ?? '') : (user?.email ?? ''),
		password: '',
		confirmPassword: '',
		role: isGivenData ? (role ?? '') : (user?.role ?? '')
	};

	let showPassword = false;
	let formElement: HTMLFormElement;

	const errorStatus = {
		username: { status: false, msg: '' },
		email: { status: false, msg: '' },
		password: { status: false, msg: '' },
		confirm: { status: false, msg: '' }
	};

	function onFormSubmit(): void {
		console.log('modal submitted.');
		if ($modalStore[0].response) $modalStore[0].response(formData);

		if ((isGivenData && user_id != user?._id) || (formData.password !== null && formData.password === formData.confirmPassword)) {
			modalStore.close();
		} else {
			console.log('error');
		}
	}

	async function deleteUser() {
		const formData = new FormData(formElement);
		formData.append('id', user._id);

		const res = await axios.post('?/deleteUser', formData);

		if (res.status === 200) {
			await invalidateAll();
			modalStore.close();
		}
	}

	const cBase = 'card p-4 w-modal shadow-xl space-y-4 bg-white';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={`text-center dark:text-primary-500 ${cHeader}`}>
			{$modalStore[0]?.title ?? '(title missing)'}
		</header>
		<article class="text-center text-sm">
			{$modalStore[0]?.body ?? '(body missing)'}
		</article>
		<form class="modal-form {cForm}" bind:this={formElement} id="change_user_form">
			<!-- Username field -->
			<div class="group relative z-0 mb-6 w-full">
				<iconify-icon icon="mdi:user-circle" width="18" class="absolute left-0 top-3.5 text-gray-400" />
				<FloatingInput
					type="text"
					name="username"
					label={m.form_username()}
					bind:value={formData.username}
					on:keydown={() => (errorStatus.username.status = false)}
					required
					disabled={isGivenData && user_id != user?._id}
				/>
				{#if !errorStatus.username.status}
					<div class="absolute left-0 top-11 text-xs text-error-500">
						{errorStatus.username.msg}
					</div>
				{/if}
			</div>

			<!-- Email field -->
			<div class="group relative z-0 mb-6 w-full">
				<iconify-icon icon="mdi:email" width="18" class="absolute left-0 top-3.5 text-gray-400" />
				<FloatingInput
					type="email"
					name="email"
					label={isGivenData ? (role === 'admin' ? m.form_emailaddress() : "Email Cannot be changed") : (user?.role === 'admin' ? m.form_emailaddress() : "Email Cannot be changed")}
					bind:value={formData.email}
					on:keydown={() => (errorStatus.email.status = false)}
					required
					disabled={!(isGivenData ? role === 'admin' : user?.role === 'admin')}
					icon="mdi:email"
					iconColor={!(isGivenData ? role === 'admin' : user?.role === 'admin') ? "white" : undefined}
					textColor={!(isGivenData ? role === 'admin' : user?.role === 'admin') ? "white" : undefined}
				/>
				{#if errorStatus.email.status}
					<div class="absolute left-0 top-11 text-xs text-error-500">
						{errorStatus.email.msg}
					</div>
				{/if}
			</div>

			{#if (user._id == user_id || !isGivenData) && user?.lastAuthMethod == 'token'}
				<!-- Password field -->
				<div class="group relative z-0 mb-6 w-full">
					<iconify-icon icon="mdi:password" width="18" class="absolute left-0 top-3.5 text-gray-400" />
					<FloatingInput
						type={showPassword ? "text" : "password"}
						name="password"
						id="password"
						label={m.modaleditform_newpassword()}
						bind:value={formData.password}
						on:keydown={() => (errorStatus.password.status = false)}
						autocomplete="current-password"
						required
					/>
					<button type="button" class="absolute right-2 top-2" on:click={() => (showPassword = !showPassword)}>
						<iconify-icon icon={showPassword ? "bi:eye-fill" : "bi:eye-slash-fill"} class={showPassword ? "" : "text-surface-500"} width="24" />
					</button>
					{#if errorStatus.password.status}
						<div class="absolute left-0 top-11 text-xs text-error-500">
							{errorStatus.password.msg}
						</div>
					{/if}
				</div>

				<!-- Password Confirm -->
				<div class="group relative z-0 mb-6 w-full">
					<iconify-icon icon="mdi:password" width="18" class="absolute left-0 top-3.5 text-gray-400" />
					<FloatingInput
						type={showPassword ? "text" : "password"}
						name="confirm_password"
						id="confirm_password"
						label={m.form_confirmpassword()}
						bind:value={formData.confirmPassword}
						on:keydown={() => (errorStatus.confirm.status = false)}
						required
					/>
					<button type="button" class="absolute right-2 top-2" on:click={() => (showPassword = !showPassword)}>
						<iconify-icon icon={showPassword ? "bi:eye-fill" : "bi:eye-slash-fill"} class={showPassword ? "" : "text-surface-500"} width="24" />
					</button>
					{#if errorStatus.confirm.status}
						<div class="absolute left-0 top-11 text-xs text-error-500">
							{errorStatus.confirm.msg}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Role Select -->
			<PermissionGuard config={modaleEditFormConfig}>
				<div class="flex flex-col gap-2 sm:flex-row">
					<div class="border-b text-center sm:w-1/4 sm:border-0 sm:text-left">{m.form_userrole()}</div>
					<div class="flex-auto">
						<div class="flex flex-wrap justify-center gap-2 space-x-2 sm:justify-start">
							{#if roles && roles.length > 0}
								{#each roles as role}
									<button
										type="button"
										class="chip {isRoleActive(role._id) ? 'variant-filled-tertiary' : 'variant-ghost-secondary'}"
										on:click={() => {
											formData.role = role._id;
											console.log('Selected Role:', formData.role);
										}}
									>
										{#if isRoleActive(role._id)}
											<span><iconify-icon icon="fa:check" /></span>
										{/if}
										<span class="capitalize">{role.name}</span>
									</button>
								{/each}
							{:else}
								<p class="text-tertiary-500 dark:text-primary-500">Loading roles...</p>
							{/if}
						</div>
					</div>
				</div>
			</PermissionGuard>

			<footer class="modal-footer {parent.regionFooter} justify-between">
				<!-- Delete User -->
				{#if isFirstUser}
					<button
						type="button"
						on:click={deleteUser}
						class="variant-filled-error btn"
						disabled={!isFirstUser && (!isGivenData || user._id == user_id)}
					>
						<iconify-icon icon="icomoon-free:bin" width="24" /><span class="hidden sm:block">{m.button_delete()}</span>
					</button>
				{:else}
					<div></div>
				{/if}

				<div class="flex justify-between gap-4">
					<!-- Cancel -->
					<button type="button" class="variant-outline-secondary btn" on:click={() => parent.onClose()}>{m.button_cancel()}</button>
					<!-- Save -->
					<button type="submit" class="variant-filled-tertiary btn btn dark:variant-filled-primary {parent.buttonPositive}" on:click={onFormSubmit}
						>{m.button_save()}</button
					>
				</div>
			</footer>
		</form>
	</div>
{/if}
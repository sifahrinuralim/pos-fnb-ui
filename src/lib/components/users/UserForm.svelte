<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { type UserRole } from '$lib/api/users';

	export let open = false;
	export let user: { id: string; name: string; email: string; role: UserRole; is_active: boolean } | null = null;

	interface SubmitPayload {
		name: string;
		email: string;
		password?: string;
		role: UserRole;
		is_active: boolean;
	}

	const dispatch = createEventDispatcher<{
		close: void;
		submit: { payload: SubmitPayload; isEdit: boolean; id?: string };
	}>();

	const ROLES: { value: UserRole; label: string }[] = [
		{ value: 'admin', label: 'Admin' },
		{ value: 'manager', label: 'Manager' },
		{ value: 'cashier', label: 'Cashier' },
		{ value: 'kitchen', label: 'Kitchen' },
		{ value: 'waiter', label: 'Waiter' }
	];

	let name = '';
	let email = '';
	let password = '';
	let role: UserRole = 'cashier';
	let is_active = true;
	let errors: Record<string, string[]> = {};
	let submitting = false;

	$: isEdit = !!user;
	$: mode = isEdit ? 'edit' : 'create';
	$: if (open) {
		if (user) {
			name = user.name;
			email = user.email;
			role = user.role;
			is_active = user.is_active;
			password = '';
		} else {
			name = '';
			email = '';
			password = '';
			role = 'cashier';
			is_active = true;
		}
		errors = {};
		submitting = false;
	}

	function fieldError(f: string): boolean { return !!errors[f]; }
	function handleClose(): void { dispatch('close'); }
	function handleSubmit(e: Event): void {
		e.preventDefault();
		const ve: Record<string, string[]> = {};
		if (!name.trim()) ve.name = ['Nama wajib diisi.'];
		if (!email.trim()) ve.email = ['Email wajib diisi.'];
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) ve.email = ['Format email tidak valid.'];
		if (!isEdit && !password) ve.password = ['Password wajib diisi untuk user baru.'];
		else if (password && password.length < 8) ve.password = ['Password minimal 8 karakter.'];
		if (Object.keys(ve).length > 0) { errors = ve; return; }
		submitting = true;
		dispatch('submit', {
			payload: {
				name: name.trim(),
				email: email.trim(),
				password: password || undefined,
				role,
				is_active
			},
			isEdit,
			id: user?.id
		});
	}
	export function setServerErrors(se: Record<string, string[]>): void { errors = se; submitting = false; }

{#if open}
	<div role="presentation" class="fixed inset-0 z-40 bg-black/50 transition-opacity" on:click={handleClose} />
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
		<div class="w-full max-w-lg rounded-xl bg-white shadow-2xl">
			<div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
				<h2 class="text-lg font-semibold text-gray-900">{mode === 'create' ? 'Tambah Pengguna' : 'Edit Pengguna'}</h2>
				<button type="button" class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" on:click={handleClose} aria-label="Tutup">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>
			<form on:submit|preventDefault={handleSubmit} class="p-6 space-y-5">
				<div>
					<label for="uf-name" class="mb-1.5 block text-sm font-medium text-gray-700">Nama <span class="text-red-500">*</span></label>
					<input id="uf-name" type="text" bind:value={name} placeholder="Nama lengkap"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						class:border-red-400={fieldError('name')} class:ring-1={fieldError('name')} class:ring-red-300={fieldError('name')} class:border-gray-300={!fieldError('name')} disabled={submitting} />
					{#if errors.name}<p class="mt-1.5 text-xs text-red-600">{errors.name[0]}</p>{/if}
				</div>
				<div>
					<label for="uf-email" class="mb-1.5 block text-sm font-medium text-gray-700">Email <span class="text-red-500">*</span></label>
					<input id="uf-email" type="email" bind:value={email} placeholder="contoh@email.com"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						class:border-red-400={fieldError('email')} class:ring-1={fieldError('email')} class:ring-red-300={fieldError('email')} class:border-gray-300={!fieldError('email')} disabled={submitting} />
					{#if errors.email}<p class="mt-1.5 text-xs text-red-600">{errors.email[0]}</p>{/if}
				</div>
				<div>
					<label for="uf-pw" class="mb-1.5 block text-sm font-medium text-gray-700">Password {isEdit ? "(kosongkan jika tidak diubah)" : ""} <span class="text-red-500">{isEdit ? "" : "*"}</span></label>
					<input id="uf-pw" type="password" bind:value={password} placeholder={isEdit ? "Kosongkan untuk tidak mengubah" : "Minimal 8 karakter"}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						class:border-red-400={fieldError('password')} class:ring-1={fieldError('password')} class:ring-red-300={fieldError('password')} class:border-gray-300={!fieldError('password')} disabled={submitting} />
					{#if errors.password}<p class="mt-1.5 text-xs text-red-600">{errors.password[0]}</p>{/if}
				</div>
				<div>
					<label for="uf-role" class="mb-1.5 block text-sm font-medium text-gray-700">Role <span class="text-red-500">*</span></label>
					<select id="uf-role" bind:value={role} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" disabled={submitting}>
						{#each ROLES as r}<option value={r.value}>{r.label}</option>{/each}
					</select>
				</div>
				<div class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
					<div>
						<p class="text-sm font-medium text-gray-700">Status Aktif</p>
						<p class="text-xs text-gray-500">User nonaktif tidak dapat login</p>
					</div>
					<button type="button" on:click={() => (is_active = !is_active)} class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" class:bg-blue-600={is_active} class:bg-gray-300={!is_active} role="switch" aria-checked={is_active}>
						<span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200" class:translate-x-5={is_active} class:translate-x-0={!is_active} />
					</button>
				</div>
				{#if errors._general}<div class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errors._general[0]}</div>{/if}
				<div class="flex justify-end gap-3 pt-2">
					<button type="button" on:click={handleClose} class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50" disabled={submitting}>Batal</button>
					<button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50" disabled={submitting}>
						{#if submitting}<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Menyimpan...{:else}{mode === 'create' ? 'Tambah' : 'Simpan'}{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

</script>
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { CategoryResponse } from '$lib/api/categories.api';

	export let open = false;
	export let category: CategoryResponse | null = null;

	const dispatch = createEventDispatcher<{
		close: void;
		submit: { payload: { name: string; description?: string; is_active: boolean }; isEdit: boolean; id?: string };
	}>();

	let name = '';
	let description = '';
	let is_active = true;
	let errors: Record<string, string[]> = {};
	let submitting = false;

	$: isEdit = !!category;
	$: mode = isEdit ? 'edit' : 'create';

	$: if (open) {
		if (category) {
			name = category.name;
			description = category.description ?? '';
			is_active = category.is_active;
		} else {
			name = '';
			description = '';
			is_active = true;
		}
		errors = {};
		submitting = false;
	}

	function handleClose(): void {
		dispatch('close');
	}

	function handleSubmit(e: Event): void {
		e.preventDefault();

		if (!name.trim()) {
			errors = { name: ['Nama kategori wajib diisi.'] };
			return;
		}

		if (name.trim().length > 100) {
			errors = { name: ['Nama kategori maksimal 100 karakter.'] };
			return;
		}

		submitting = true;
		dispatch('submit', {
			payload: { name: name.trim(), description: description.trim() || undefined, is_active },
			isEdit,
			id: category?.id
		});
	}

	export function setServerErrors(serverErrors: Record<string, string[]>): void {
		errors = serverErrors;
		submitting = false;
	}
</script>

<!-- Backdrop -->
{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div role="presentation" class="fixed inset-0 z-40 bg-black/50 transition-opacity" on:click={handleClose} />

	<!-- Modal -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
		<div class="w-full max-w-lg rounded-xl bg-white shadow-2xl transition-all">
			<!-- Header -->
			<div class="flex items-center justify-between border-b px-6 py-4">
				<h2 class="text-lg font-semibold text-gray-900">
					{mode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}
				</h2>
				<button
					type="button"
					class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
					on:click={handleClose}
					aria-label="Tutup"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Form -->
			<form on:submit|preventDefault={handleSubmit} class="p-6 space-y-5">
				<!-- Name -->
				<div>
					<label for="cat-name" class="mb-1.5 block text-sm font-medium text-gray-700">
						Nama Kategori <span class="text-red-500">*</span>
					</label>
					<input
						id="cat-name"
						type="text"
						bind:value={name}
						placeholder="Contoh: Minuman, Makanan, Snack"
						class="w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						class:border-red-400={!!errors.name}
						class:ring-1={!!errors.name}
						class:ring-red-300={!!errors.name}
						class:border-gray-300={!errors.name}
						maxlength="100"
					/>
					{#if errors.name}
						<p class="mt-1.5 text-xs text-red-600">{errors.name[0]}</p>
					{/if}
					<p class="mt-1 text-right text-xs text-gray-400">{name.length}/100</p>
				</div>

				<!-- Description -->
				<div>
					<label for="cat-desc" class="mb-1.5 block text-sm font-medium text-gray-700">Deskripsi</label>
					<textarea
						id="cat-desc"
						bind:value={description}
						rows="3"
						placeholder="Opsional — deskripsi kategori"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						maxlength="500"
					/>
					<p class="mt-1 text-right text-xs text-gray-400">{description.length}/500</p>
				</div>

				<!-- Is Active Toggle -->
				<div class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
					<div>
						<p class="text-sm font-medium text-gray-700">Status Aktif</p>
						<p class="text-xs text-gray-500">Kategori nonaktif tidak akan muncul di menu</p>
					</div>
					<button
						type="button"
						on:click={() => (is_active = !is_active)}
						class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						class:bg-blue-600={is_active}
						class:bg-gray-300={!is_active}
						role="switch"
						aria-checked={is_active}
					>
						<span
							class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
							class:translate-x-5={is_active}
							class:translate-x-0={!is_active}
						/>
					</button>
				</div>

				<!-- Error General -->
				{#if errors._general}
					<div class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
						{errors._general[0]}
					</div>
				{/if}

				<!-- Actions -->
				<div class="flex justify-end gap-3 pt-2">
					<button
						type="button"
						on:click={handleClose}
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
						disabled={submitting}
					>
						Batal
					</button>
					<button
						type="submit"
						class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
						disabled={submitting}
					>
						{#if submitting}
							<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Menyimpan...
						{:else}
							{mode === 'create' ? 'Tambah' : 'Simpan'}
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}


<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Table, TableCreate, TableStatus } from '$lib/api/tables';

	export let open = false;
	export let table: Table | null = null;

	const dispatch = createEventDispatcher<{
		close: void;
		submit: { payload: TableCreate; isEdit: boolean; id?: string };
	}>();

	let table_number = '';
	let name = '';
	let seat_capacity = '4';
	let status: TableStatus = 'available';
	let errors: Record<string, string[]> = {};
	let submitting = false;

	$: isEdit = !!table;
	$: mode = isEdit ? 'edit' : 'create';

	$: if (open) {
		if (table) {
			table_number = String(table.table_number);
			name = table.name ?? '';
			seat_capacity = String(table.seat_capacity);
			status = table.status;
		} else {
			table_number = '';
			name = '';
			seat_capacity = '4';
			status = 'available';
		}
		errors = {};
		submitting = false;
	}

	function handleClose(): void {
		dispatch('close');
	}

	function handleSubmit(e: Event): void {
		e.preventDefault();

		const number = Number(table_number);
		if (!String(table_number || '').trim() || !Number.isInteger(number) || number <= 0) {
			errors = { table_number: ['Nomor meja wajib diisi dan harus bilangan bulat positif.'] };
			return;
		}

		const capacity = Number(seat_capacity);
		if (!Number.isInteger(capacity) || capacity <= 0) {
			errors = { seat_capacity: ['Kapasitas kursi harus bilangan bulat minimal 1.'] };
			return;
		}

		if (String(name || '').trim().length > 100) {
			errors = { name: ['Nama meja maksimal 100 karakter.'] };
			return;
		}

		submitting = true;
		dispatch('submit', {
			payload: {
				table_number: number,
				name: String(name || '').trim() || undefined,
				seat_capacity: capacity,
				status
			},
			isEdit,
			id: table?.id
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
		<div class="w-full max-w-md rounded-xl bg-white shadow-2xl transition-all">
			<!-- Header -->
			<div class="flex items-center justify-between border-b px-6 py-4">
				<h2 class="text-lg font-semibold text-gray-900">
					{mode === 'create' ? 'Tambah Meja' : 'Edit Meja'}
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
			<form on:submit|preventDefault={handleSubmit} class="space-y-5 p-6">
				<!-- Nomor Meja -->
				<div>
					<label for="table-number" class="mb-1.5 block text-sm font-medium text-gray-700">
						Nomor Meja <span class="text-red-500">*</span>
					</label>
					<input
						id="table-number"
						type="number"
						bind:value={table_number}
						placeholder="Contoh: 1"
						min="1"
						step="1"
						class="w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						class:border-red-400={!!errors.table_number}
						class:ring-1={!!errors.table_number}
						class:ring-red-300={!!errors.table_number}
						class:border-gray-300={!errors.table_number}
					/>
					{#if errors.table_number}
						<p class="mt-1.5 text-xs text-red-600">{errors.table_number[0]}</p>
					{/if}
				</div>

				<!-- Nama Meja -->
				<div>
					<label for="table-name" class="mb-1.5 block text-sm font-medium text-gray-700">Nama Meja</label>
					<input
						id="table-name"
						type="text"
						bind:value={name}
						placeholder="Opsional — contoh: Meja Kaca, Area Teras"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						class:border-red-400={!!errors.name}
						class:ring-1={!!errors.name}
						class:ring-red-300={!!errors.name}
						class:border-gray-300={!errors.name}
						maxlength="100"
					/>
					{#if errors.name}
						<p class="mt-1.5 text-xs text-red-600">{errors.name[0]}</p>
					{/if}
				</div>

				<!-- Kapasitas Kursi -->
				<div>
					<label for="table-capacity" class="mb-1.5 block text-sm font-medium text-gray-700">Kapasitas Kursi</label>
					<input
						id="table-capacity"
						type="number"
						bind:value={seat_capacity}
						min="1"
						step="1"
						placeholder="4"
						class="w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						class:border-red-400={!!errors.seat_capacity}
						class:ring-1={!!errors.seat_capacity}
						class:ring-red-300={!!errors.seat_capacity}
						class:border-gray-300={!errors.seat_capacity}
					/>
					{#if errors.seat_capacity}
						<p class="mt-1.5 text-xs text-red-600">{errors.seat_capacity[0]}</p>
					{/if}
				</div>
				<!-- Status -->
				<div>
					<label for="table-status" class="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
					<select
						id="table-status"
						bind:value={status}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
					>
						<option value="available">Tersedia</option>
						<option value="occupied">Terisi</option>
						<option value="reserved">Dipesan</option>
					</select>
				</div>

				<!-- Error Umum -->
				{#if errors._general}
					<div class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
						{errors._general[0]}
					</div>
				{/if}

				<!-- Aksi -->
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

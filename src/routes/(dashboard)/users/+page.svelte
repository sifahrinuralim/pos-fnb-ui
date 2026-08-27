<script lang="ts">
	import { onMount } from 'svelte';
	import {
		listUsers,
		deleteUser,
		updateUser,
		createUser,
		type User,
		type UserRole,
		ROLE_LABELS,
		ROLE_BADGE_COLORS
	} from '$lib/api/users';
	import { Trash2, Edit2, Plus, UserCheck, UserX, ChevronLeft, ChevronRight, Inbox } from 'lucide-svelte';
	import { canAccess } from '$lib/utils/rbac';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import UserForm from '$lib/components/users/UserForm.svelte';

	let modalOpen = false;
	let editingUser: User | null = null;
	let errorMessage = '';
	let successMessage = '';
	let deleteConfirmId: string | null = null;
	let modalComponent: UserForm | undefined;

	let users: User[] = [];
	let totalUsers = 0;
	let loading = true;
	let filterActive: boolean | undefined = undefined;
	let skip = 0;
	const limit = 10;

	$: totalPages = Math.max(1, Math.ceil(totalUsers / limit));
	$: currentPage = Math.floor(skip / limit) + 1;
	$: hasNextPage = skip + limit < totalUsers;
	$: hasPrevPage = skip > 0;
	$: pageNumbers = getPageNumbers(currentPage, totalPages);
	$: from = totalUsers === 0 ? 0 : skip + 1;
	$: to = Math.min(skip + users.length, totalUsers);

	$: if ($authStore.loaded && !canAccess(['admin'])) {
		goto('/');
	}

	function getPageNumbers(page: number, total: number): (number | string)[] {
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
		if (page <= 3) return [1, 2, 3, 4, '...', total];
		if (page >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
		return [1, '...', page - 1, page, page + 1, '...', total];
	}

	onMount(() => { loadUsers(); });

	async function loadUsers(): Promise<void> {
		loading = true;
		errorMessage = '';
		successMessage = '';
		try {
			const res = await listUsers(skip, limit, filterActive);
			if (res.success) {
				users = res.data.items;
				totalUsers = res.data.total;
			} else {
				errorMessage = res.message || 'Gagal memuat data pengguna.';
			}
		} catch (err: unknown) {
			const e = err as { message?: string };
			errorMessage = e.message || 'Terjadi kesalahan saat memuat data.';
		} finally {
			loading = false;
		}
	}

	function handleOpenCreate(): void {
		editingUser = null;
		clearMsg();
		modalOpen = true;
	}

	function handleOpenEdit(u: User): void {
		editingUser = { ...u };
		clearMsg();
		modalOpen = true;
	}

	function handleCloseModal(): void {
		modalOpen = false;
		editingUser = null;
	}

	function clearMsg(): void {
		errorMessage = '';
		successMessage = '';
	}

	async function handleSubmit(event: CustomEvent<{
		payload: { name: string; email: string; password?: string; role: UserRole; is_active: boolean };
		isEdit: boolean;
		id?: string;
	}>): Promise<void> {
		const d = event.detail;
		clearMsg();
		try {
			if (d.isEdit && d.id) {
				const payload: Record<string, unknown> = {
					name: d.payload.name,
					email: d.payload.email,
					role: d.payload.role,
					is_active: d.payload.is_active
				};
				if (d.payload.password) {
					(payload as Record<string, string>).password = d.payload.password;
				}
				const r = await updateUser(d.id, payload);
				if (r.success) {
					successMessage = 'Pengguna berhasil diperbarui.';
					handleCloseModal();
					await loadUsers();
				} else {
					errorMessage = r.message || 'Gagal memperbarui pengguna.';
					if (r.errors) modalComponent?.setServerErrors(r.errors);
				}
			} else {
				const r = await createUser(d.payload);
				if (r.success) {
					successMessage = 'Pengguna berhasil ditambahkan.';
					handleCloseModal();
					await loadUsers();
				} else {
					errorMessage = r.message || 'Gagal menambahkan pengguna.';
					if (r.errors) modalComponent?.setServerErrors(r.errors);
				}
			}
		} catch (err: unknown) {
			const e = err as { message?: string; errors?: Record<string, string[]> };
			if (e.errors) {
				errorMessage = Object.entries(e.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ');
				modalComponent?.setServerErrors(e.errors);
			} else {
				errorMessage = e.message || 'Gagal menyimpan pengguna.';
			}
		}
	}

	function handleDelete(id: string): void {
		if (deleteConfirmId !== id) {
			deleteConfirmId = id;
			return;
		}
		clearMsg();
		deleteUser(id)
			.then((r) => {
				if (r.success) {
					successMessage = 'Pengguna berhasil dihapus.';
					deleteConfirmId = null;
					if (users.length === 1 && hasPrevPage) {
						skip -= limit;
					}
					loadUsers();
				} else {
					errorMessage = r.message || 'Gagal menghapus pengguna.';
				}
			})
			.catch((err: unknown) => {
				const e = err as { message?: string };
				errorMessage = e.message || 'Terjadi kesalahan saat menghapus.';
			});
	}

	function cancelDelete(): void { deleteConfirmId = null; }

	function goToPage(delta: number): void {
		const newSkip = skip + delta * limit;
		if (newSkip >= 0 && newSkip < totalUsers) {
			skip = newSkip;
			loadUsers();
		}
	}
</script>

<div class="p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold">User Management</h1>
		<button on:click={handleOpenCreate} class="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
			<Plus size={18} /> New User
		</button>
	</div>

	<div class="flex gap-2">
		<button on:click={() => { filterActive = undefined; skip = 0; loadUsers(); }} class="px-3 py-1.5 text-sm font-medium rounded-lg border transition whitespace-nowrap {filterActive === undefined ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}">Semua</button>
		<button on:click={() => { filterActive = true; skip = 0; loadUsers(); }} class="px-3 py-1.5 text-sm font-medium rounded-lg border transition whitespace-nowrap {filterActive === true ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}">Aktif</button>
		<button on:click={() => { filterActive = false; skip = 0; loadUsers(); }} class="px-3 py-1.5 text-sm font-medium rounded-lg border transition whitespace-nowrap {filterActive === false ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}">Nonaktif</button>
	</div>

	<div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
		{#if loading}
			<div class="flex items-center justify-center py-16"><div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
		{:else if users.length === 0}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<Inbox class="h-12 w-12 text-gray-300 mb-3" />
				<p class="text-sm font-medium text-gray-500">Tidak ada pengguna ditemukan</p>
				<p class="text-xs text-gray-400 mt-1">Coba ubah filter atau tambahkan pengguna baru</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead><tr class="bg-gray-50 border-b border-gray-200">
						<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
						<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
						<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
					</tr></thead>
					<tbody class="divide-y divide-gray-100">
						{#each users as user}
							<tr class="hover:bg-gray-50 transition">
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<div class="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-sm font-semibold text-gray-600 shrink-0">{user.name.charAt(0).toUpperCase()}</div>
										<span class="text-sm font-medium text-gray-900">{user.name}</span>
									</div>
								</td>
								<td class="px-6 py-4 text-sm text-gray-600">{user.email}</td>
								<td class="px-6 py-4">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize {ROLE_BADGE_COLORS[user.role]}">{ROLE_LABELS[user.role]}</span>
								</td>
								<td class="px-6 py-4">
									{#if user.is_active}<span class="inline-flex items-center gap-1.5 text-sm text-green-700"><UserCheck class="h-4 w-4" /> Aktif</span>
									{:else}<span class="inline-flex items-center gap-1.5 text-sm text-red-600"><UserX class="h-4 w-4" /> Nonaktif</span>{/if}
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center justify-end gap-2">
										{#if deleteConfirmId === user.id}
											<span class="hidden text-xs text-gray-500 sm:inline mr-1">Hapus?</span>
											<button on:click={() => handleDelete(user.id)} class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-700">Hapus</button>
											<button on:click={cancelDelete} class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50">Batal</button>
										{:else}
											<button on:click={() => handleOpenEdit(user)} class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"><Edit2 class="h-3.5 w-3.5" /><span class="hidden sm:inline">Edit</span></button>
											<button on:click={() => handleDelete(user.id)} class="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"><Trash2 class="h-3.5 w-3.5" /><span class="hidden sm:inline">Hapus</span></button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

<!-- Pagination -->
{#if totalPages > 1}
<div class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row">
<p class="text-sm text-gray-500">Menampilkan <span class="font-medium text-gray-700">{from}-{to}</span> dari <span class="font-medium text-gray-700">{totalUsers}</span> pengguna</p>
<nav class="flex items-center gap-1" aria-label="Pagination">
<button on:click={() => goToPage(-1)} disabled={!hasPrevPage} class="inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Halaman sebelumnya"><ChevronLeft class="h-4 w-4" /></button>
{#each pageNumbers as p, i (i)}
{#if p === '...'}<span class="px-2 text-sm text-gray-400">&hellip;</span>
{:else}<button on:click={() => { skip = (p - 1) * limit; loadUsers(); }} class="min-w-[2rem] rounded-lg px-3 py-2 text-sm font-medium transition {p === currentPage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}" aria-current={p === currentPage ? 'page' : undefined}>{p}</button>{/if}
{/each}
<button on:click={() => goToPage(1)} disabled={!hasNextPage} class="inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Halaman berikutnya"><ChevronRight class="h-4 w-4" /></button>
</nav>
</div>
{/if}
{/if}
</div>
</div>

<UserForm bind:this={modalComponent} open={modalOpen} user={editingUser} on:close={handleCloseModal} on:submit={handleSubmit} />

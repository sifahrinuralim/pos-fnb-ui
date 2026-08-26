<script lang="ts">
	import { onMount } from 'svelte';
	import { listUsers, type User } from '$lib/api/users';
	import { Trash2, Edit2, Plus, UserCheck, UserX } from 'lucide-svelte';
    import { canAccess } from '$lib/utils/rbac';
    import { goto } from '$app/navigation';

    onMount(() => {
        if (!canAccess(['admin'])) {
            goto('/');
        }
    });

	let users: User[] = [];
	let loading = true;
	let filterActive: boolean | undefined = undefined;

	async function loadUsers() {
		loading = true;
		try {
			const res = await listUsers(0, 50, filterActive);
			if (res.success) users = res.data.items;
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	onMount(loadUsers);

	const roleColors: Record<string, string> = {
		admin: 'bg-red-100 text-red-800',
		manager: 'bg-purple-100 text-purple-800',
		cashier: 'bg-blue-100 text-blue-800',
		kitchen: 'bg-amber-100 text-amber-800',
		waiter: 'bg-green-100 text-green-800'
	};
</script>

<div class="p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold">User Management</h1>
		<button class="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
			<Plus size={18} /> New User
		</button>
	</div>

	<div class="mb-4 flex gap-2">
		<button on:click={() => {filterActive = undefined; loadUsers();}} class="px-3 py-1 text-sm border rounded {filterActive === undefined ? 'bg-gray-200' : ''}">All</button>
		<button on:click={() => {filterActive = true; loadUsers();}} class="px-3 py-1 text-sm border rounded {filterActive === true ? 'bg-green-100' : ''}">Active</button>
		<button on:click={() => {filterActive = false; loadUsers();}} class="px-3 py-1 text-sm border rounded {filterActive === false ? 'bg-red-100' : ''}">Inactive</button>
	</div>

	{#if loading}
		<p>Loading...</p>
	{:else}
		<table class="w-full bg-white rounded-lg shadow overflow-hidden">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-3 text-left">Name</th>
					<th class="px-6 py-3 text-left">Email</th>
					<th class="px-6 py-3 text-left">Role</th>
					<th class="px-6 py-3 text-left">Status</th>
					<th class="px-6 py-3 text-right">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each users as user}
					<tr>
						<td class="px-6 py-4">{user.name}</td>
						<td class="px-6 py-4">{user.email}</td>
						<td class="px-6 py-4">
							<span class="px-2 py-1 text-xs font-semibold rounded-full capitalize {roleColors[user.role] || 'bg-gray-100'}">
								{user.role}
							</span>
						</td>
						<td class="px-6 py-4">
                            {#if user.is_active}
                                <span class="text-green-600 flex items-center gap-1"><UserCheck size={16}/> Active</span>
                            {:else}
                                <span class="text-red-600 flex items-center gap-1"><UserX size={16}/> Inactive</span>
                            {/if}
						</td>
						<td class="px-6 py-4 text-right space-x-2">
							<button class="text-indigo-600"><Edit2 size={18} /></button>
							<button class="text-red-600"><Trash2 size={18} /></button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

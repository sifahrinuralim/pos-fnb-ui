<script lang="ts">
    import { createUser, updateUser, type User } from '$lib/api/users';
    import { createEventDispatcher } from 'svelte';

    export let user: Partial<User> = { name: '', email: '', role: 'waiter', is_active: true };
    export let isEdit = false;
    
    const dispatch = createEventDispatcher();
    let password = '';
    let loading = false;

    async function handleSubmit() {
        loading = true;
        try {
            const data = { ...user, password: password || undefined };
            if (isEdit && user.id) {
                await updateUser(user.id, data);
            } else {
                await createUser(data as any);
            }
            dispatch('saved');
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
        <label class="block text-sm font-medium">Name</label>
        <input bind:value={user.name} required class="w-full border rounded p-2" />
    </div>
    <div>
        <label class="block text-sm font-medium">Email</label>
        <input bind:value={user.email} type="email" required class="w-full border rounded p-2" />
    </div>
    <div>
        <label class="block text-sm font-medium">Password {isEdit ? '(optional)' : ''}</label>
        <input bind:value={password} type="password" class="w-full border rounded p-2" />
    </div>
    <div>
        <label class="block text-sm font-medium">Role</label>
        <select bind:value={user.role} class="w-full border rounded p-2">
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="kitchen">Kitchen</option>
            <option value="waiter">Waiter</option>
        </select>
    </div>
    <div class="flex items-center gap-2">
        <input type="checkbox" bind:checked={user.is_active} />
        <label>Active</label>
    </div>
    <button type="submit" disabled={loading} class="w-full bg-indigo-600 text-white py-2 rounded">
        {loading ? 'Saving...' : 'Save User'}
    </button>
</form>

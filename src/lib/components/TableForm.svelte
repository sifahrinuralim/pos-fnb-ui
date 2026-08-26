<script lang="ts">
    import { createTable, updateTable } from '$lib/stores/tables';
    import { goto } from '$app/navigation';

    export let table = {
        table_number: '',
        name: '',
        seat_capacity: 4,
        status: 'available'
    };

    export let isEdit = false;
    export let id = null;

    const handleSubmit = async () => {
        if (isEdit && id) {
            await updateTable(id, table);
        } else {
            await createTable(table);
        }
        goto('/tables');
    };
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <input bind:value={table.table_number} placeholder="Nomor Meja" required class="w-full p-2 border rounded" />
    <input bind:value={table.name} placeholder="Nama Meja (Opsional)" class="w-full p-2 border rounded" />
    <input type="number" bind:value={table.seat_capacity} placeholder="Kapasitas" class="w-full p-2 border rounded" />
    <select bind:value={table.status} class="w-full p-2 border rounded">
        <option value="available">Available</option>
        <option value="occupied">Occupied</option>
        <option value="reserved">Reserved</option>
    </select>
    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
</form>

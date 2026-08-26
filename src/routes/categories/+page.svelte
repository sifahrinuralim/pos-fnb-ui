<script lang="ts">
  import { onMount } from 'svelte';
  import { categoriesStore } from '$lib/stores/categories';
  import { Plus, Pencil, Trash2 } from 'lucide-svelte';

  let showModal = false;
  let editingCategory: any = null;
  let formData = { name: '', description: '', is_active: true };

  onMount(() => {
    categoriesStore.loadCategories();
  });

  function openModal(category: any = null) {
    editingCategory = category;
    formData = category ? { ...category } : { name: '', description: '', is_active: true };
    showModal = true;
  }

  async function handleSubmit() {
    if (editingCategory) {
      await categoriesStore.updateCategory(editingCategory.id, formData);
    } else {
      await categoriesStore.createCategory(formData);
    }
    showModal = false;
    categoriesStore.loadCategories();
  }

  async function deleteCategory(id: string) {
    if (confirm('Are you sure?')) {
      await categoriesStore.deleteCategory(id);
      categoriesStore.loadCategories();
    }
  }
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Categories</h1>
    <button on:click={() => openModal()} class="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
      <Plus size={16} /> Add Category
    </button>
  </div>

  <table class="w-full bg-white rounded shadow">
    <thead>
      <tr class="border-b">
        <th class="p-4 text-left">Name</th>
        <th class="p-4 text-left">Description</th>
        <th class="p-4 text-left">Status</th>
        <th class="p-4 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each $categoriesStore.categories as cat}
        <tr class="border-b">
          <td class="p-4">{cat.name}</td>
          <td class="p-4">{cat.description || '-'}</td>
          <td class="p-4">
            <span class={`px-2 py-1 rounded text-xs ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {cat.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td class="p-4 flex gap-2">
            <button on:click={() => openModal(cat)} class="text-blue-600"><Pencil size={16} /></button>
            <button on:click={() => deleteCategory(cat.id)} class="text-red-600"><Trash2 size={16} /></button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if showModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div class="bg-white p-6 rounded w-96">
        <h2 class="text-xl font-bold mb-4">{editingCategory ? 'Edit' : 'Create'} Category</h2>
        <input bind:value={formData.name} placeholder="Name" class="w-full border p-2 mb-2 rounded" />
        <input bind:value={formData.description} placeholder="Description" class="w-full border p-2 mb-2 rounded" />
        <label class="flex items-center gap-2 mb-4">
          <input type="checkbox" bind:checked={formData.is_active} /> Active
        </label>
        <div class="flex justify-end gap-2">
          <button on:click={() => showModal = false} class="px-4 py-2 border rounded">Cancel</button>
          <button on:click={handleSubmit} class="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  {/if}
</div>

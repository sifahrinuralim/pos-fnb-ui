<script lang="ts" context="module">
    import { userRole } from '$lib/stores/auth';
    import { get } from 'svelte/store';

    export function canAccess(allowedRoles: string[]) {
        const role = get(userRole);
        return role && allowedRoles.includes(role);
    }
</script>

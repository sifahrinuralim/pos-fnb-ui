import { get } from 'svelte/store';
import { userRole } from '$lib/stores/auth';

export function canAccess(allowedRoles: string[]): boolean {
	const role = get(userRole);
	return !!role && allowedRoles.includes(role);
}

<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { AlertCircle, Loader2, Lock, Mail } from 'lucide-svelte';

	let email = '';
	let password = '';
	let errorMessage = '';
	let isLoading = false;

	// Redirect if already authenticated (client-only; store is empty during SSR)
	if (browser && $authStore.isAuthenticated) {
		goto('/');
	}

	async function handleLogin(): Promise<void> {
		errorMessage = '';
		isLoading = true;

		try {
			const response = await authStore.login({ email, password });

			if (response.success) {
				await goto('/');
			} else {
				errorMessage = response.message || 'Login gagal. Silakan coba lagi.';
			}
		} catch (error: unknown) {
			const err = error as { message?: string };
			errorMessage = err?.message || 'Terjadi kesalahan. Periksa koneksi Anda.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Login — POS F&B</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-4 py-12">
	<div class="w-full max-w-md">
		<!-- Logo / Brand -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
				<span class="text-2xl font-extrabold text-primary-700">POS</span>
			</div>
			<h1 class="text-2xl font-bold text-white">Food & Beverage</h1>
			<p class="text-primary-200 mt-1 text-sm">Masuk ke sistem Point of Sale</p>
		</div>

		<!-- Login Card -->
		<div class="bg-white rounded-2xl shadow-xl p-8">
			<h2 class="text-xl font-semibold text-gray-900 mb-6">Masuk ke Akun Anda</h2>

			{#if errorMessage}
				<div class="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
					<AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
					<span>{errorMessage}</span>
				</div>
			{/if}

			<form on:submit|preventDefault={handleLogin} class="space-y-5">
				<!-- Email -->
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">
						Email
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							autocomplete="email"
							placeholder="nama@restoran.com"
							disabled={isLoading}
							class="input-field pl-10"
						/>
					</div>
				</div>

				<!-- Password -->
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">
						Password
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="password"
							type="password"
							bind:value={password}
							required
							autocomplete="current-password"
							placeholder="••••••••"
							disabled={isLoading}
							class="input-field pl-10"
						/>
					</div>
				</div>

				<!-- Submit -->
				<button
					type="submit"
					disabled={isLoading || !email || !password}
					class="btn-primary w-full flex items-center justify-center gap-2"
				>
					{#if isLoading}
						<Loader2 class="w-5 h-5 animate-spin" />
						<span>Memproses...</span>
					{:else}
						<span>Masuk</span>
					{/if}
				</button>
			</form>
		</div>

		<!-- Footer -->
		<p class="text-center text-primary-200 text-xs mt-6">
			&copy; {new Date().getFullYear()} POS F&B System. All rights reserved.
		</p>
	</div>
</div>

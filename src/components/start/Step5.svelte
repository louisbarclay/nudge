<script context="module">
	export function focus(node: HTMLElement) {
		node.focus();
	}
</script>

<script lang="ts">
	import StepLayout from "./Layout.svelte";
	import { z } from "zod";
	export let onBack: () => void;
	export let onComplete: () => void;

	import browser from "webextension-polyfill";
	import { createClient } from "@supabase/supabase-js";

	const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLIC_KEY;

	const supabase = createClient(
		"https://ioatfvzpfwqyuincyhvc.supabase.co",
		supabaseKey,
	);

	let email = "";
	let emailError = "";
	let emailSent = false;

	const emailSchema = z.string().email("Please enter a valid email address");

	function validateEmail() {
		const result = emailSchema.safeParse(email);
		if (!result.success) {
			emailError = result.error.errors[0].message;
			return false;
		}
		emailError = "";
		return true;
	}

	export async function signInWithEmail() {
		if (!validateEmail()) return;

		const { data, error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: "https://louis.work/nudge",
			},
		});
		if (error) throw error;

		emailSent = true;
	}
</script>

<StepLayout
	{onBack}
	onNext={onComplete}
	showNext={false}
	buttonText="Sign Up"
	showRhs={false}
>
	<div
		class="flex flex-col items-center justify-center w-full space-y-4 text-center"
	>
		{#if emailSent}
			<h2 class="text-3xl font-semibold">Thank you!</h2>
			<p>Please check your inbox for a confirmation email.</p>
		{:else}
			<h2 class="mb-4 text-3xl font-semibold">Get started</h2>
			<p>Enter your email here:</p>
			<div class="w-full max-w-sm">
				<input
					type="email"
					bind:value={email}
					on:input={validateEmail}
					placeholder="your@email.com"
					class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					use:focus
					autocomplete="email"
				/>
				{#if emailError}
					<p class="mt-1 text-sm text-red-500">{emailError}</p>
				{/if}
			</div>
			<button
				class="px-4 py-2 rounded-[50px] bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
				on:click={signInWithEmail}
				disabled={!email || !!emailError}
			>
				Sign Up
			</button>
			<p class="text-sm">The only data we store is your email address.</p>
		{/if}
	</div>
</StepLayout>

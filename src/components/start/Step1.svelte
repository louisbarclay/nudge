<script lang="ts">
	import StepLayout from "./Layout.svelte";
	export let onBack: () => void;
	export let onNext: () => void;
	let showSection = false;
</script>

<StepLayout {onBack} {onNext} showBack={false} buttonText={"Next"}>
	<div class="space-y-4">
		<h2 class="mb-4 text-xl font-semibold">Welcome to Nudge!</h2>
		<div class="space-y-4">
			<p>
				Nudge hides distractions and replaces them with a simple, empty button.
			</p>
			<p>To show the distraction, click it.</p>
			<p>Try it here ➡️</p>
		</div>
	</div>
	<div
		slot="right"
		class="flex flex-col items-center justify-between h-full p-4 bg-gray-100"
	>
		<!-- Right side content -->
		<div class=""></div>
		<div class="items-center justify-center">
			{#if !showSection}
				<button
					class="px-4 py-2 bg-white rounded-[50px] text-2xl hover:bg-gray-300 text-white hover:text-gray-800 transition-colors"
					on:click={() => (showSection = true)}
				>
					Show Distraction
				</button>
			{:else}
				<div
					class="w-full p-4 text-2xl text-center text-red-300 bg-red-100 border-red-300 rounded"
				>
					Distraction
				</div>
			{/if}
		</div>
		<div class="">
			<p
				class={`text-sm text-center ${showSection ? "text-gray-700" : "text-transparent"}`}
			>
				When you next load the page, the distraction will be hidden once again.
			</p>
		</div>
	</div>
</StepLayout>

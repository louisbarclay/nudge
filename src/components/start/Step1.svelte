<script lang="ts">
	import StepLayout from "./Layout.svelte";
	export let onBack: () => void;
	export let onNext: () => void;
	let showSection = false;
</script>

<StepLayout {onBack} {onNext} showBack={false} buttonText={"Next"}>
	<div class="space-y-4">
		<h2 class="flex items-center gap-2 mb-4 text-xl font-semibold">
			<img src="/icon.svg" alt="Nudge icon" class="h-[1em]" />
			Welcome to Nudge!
		</h2>
		<div class="space-y-4">
			<p>
				Nudge hides distractions and replaces them with a simple, empty button.
			</p>
			<p>To show the distraction, click it.</p>
			<p>Try it here →</p>
		</div>
		<div class="flex items-center pt-6 space-x-2">
			<img
				src="/louis-profile-pic.jpeg"
				alt="Louis Barclay"
				class="w-12 h-12 rounded-full"
			/>
			<div>
				<p class="font-medium">Louis Barclay</p>
				<p class="text-sm text-gray-600">Founder of Nudge</p>
			</div>
		</div>
	</div>
	<div
		slot="right"
		class="flex flex-col items-center justify-between h-full p-4 bg-gray-100"
	>
		<!-- Right side content -->
		<div class="flex-1"></div>
		<div class="flex flex-col items-center justify-center flex-1 w-full">
			{#if !showSection}
				<button
					class="px-4 py-2 bg-white rounded-[50px] text-xl hover:bg-gray-300 text-white hover:text-gray-800 transition-colors"
					on:click={() => (showSection = true)}
				>
					Show Distraction
				</button>
			{:else}
				<div
					class="flex items-center justify-center w-full h-full p-4 text-2xl text-center text-red-300 bg-red-100 border-red-300 rounded"
				>
					Distraction
				</div>
			{/if}
		</div>
		<div class="flex flex-col justify-end flex-1">
			<p
				class={`text-sm text-center ${showSection ? "text-gray-700" : "text-transparent"}`}
			>
				When you next load the page, the distraction will be hidden once again.
				Hit refresh and try it out!
			</p>
		</div>
	</div>
</StepLayout>

<script lang="ts">
	import { writable } from "svelte/store";
	import Welcome from "./start/Welcome.svelte";
	import Step1 from "./start/Step1.svelte";
	import Step2 from "./start/Step2.svelte";
	import Step3 from "./start/Step3.svelte";
	import Step4 from "./start/Step4.svelte";
	import Step5 from "./start/Step5.svelte";

	// Initialize currentStep based on the initial URL hash
	const initialHash = window.location.hash.slice(1);
	const initialStep =
		initialHash === "welcome"
			? 0
			: initialHash.startsWith("step")
				? parseInt(initialHash.replace("step", ""))
				: 0;

	const currentStep = writable(initialStep);

	// Update URL hash when step changes
	$: {
		const path = $currentStep === 0 ? "welcome" : `step${$currentStep}`;
		if (window.location.hash.slice(1) !== path) {
			window.location.hash = path;
		}
	}

	// Update step when URL changes
	window.addEventListener("hashchange", () => {
		const hash = window.location.hash.slice(1);
		currentStep.set(
			hash === "welcome" ? 0 : parseInt(hash.replace("step", "")),
		);
	});

	function goNext() {
		currentStep.update((step) => step + 1);
	}

	function goBack() {
		currentStep.update((step) => step - 1);
	}
</script>

<main class="flex flex-col items-center justify-center h-full min-h-screen">
	<div class="progress-bar">
		{#each Array(6) as _, i}
			<div class="step" class:active={$currentStep === i}></div>
		{/each}
	</div>

	{#if $currentStep === 0}
		<Welcome onNext={goNext} />
	{:else if $currentStep === 1}
		<Step1 onBack={goBack} onNext={goNext} />
	{:else if $currentStep === 2}
		<Step2 onBack={goBack} onNext={goNext} />
	{:else if $currentStep === 3}
		<Step3 onBack={goBack} onNext={goNext} />
	{:else if $currentStep === 4}
		<Step4 onBack={goBack} onNext={goNext} />
	{:else if $currentStep === 5}
		<Step5 onBack={goBack} onComplete={() => console.log("Complete!")} />
	{/if}

	<div class="flex justify-center gap-4">
		{#if $currentStep !== 0}
			{#each Array(5) as _, i}
				<div
					class={`w-4 h-4 ${$currentStep === i + 1 ? "bg-blue-500" : "bg-gray-200"} rounded-full`}
				></div>
			{/each}
		{/if}
	</div>
</main>

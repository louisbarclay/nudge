<script lang="ts">
	import StepLayout from "./Layout.svelte";
	export let onBack: () => void;
	export let onNext: () => void;
	import { hideesStore } from "../../hidees";
	const domains = [...new Set(hideesStore.map((hidee) => hidee.domain))];
</script>

<StepLayout {onBack} {onNext} buttonText="Next">
	<div class="space-y-4">
		<h2 class="mb-4 text-xl font-semibold">Nudge is already live</h2>
		<p>
			Go to one of the sites on the right to see Nudge already in action. ➡️
		</p>
		<p>Don't forget to come back here afterwards!</p>
	</div>
	<div
		slot="right"
		class="flex flex-col items-center justify-center h-full p-4 space-y-4 bg-gray-100"
	>
		<!-- Right side content -->
		{#each domains as domain}<a
				href={`https://${domain}`}
				target="_blank"
				rel="noopener noreferrer"
				class="px-4 py-2 transition-colors duration-200 bg-white rounded-full cursor-pointer hover:bg-gray-300"
			>
				{domain}
			</a>
		{/each}
	</div>
</StepLayout>

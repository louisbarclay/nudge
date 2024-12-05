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
		<p>Go to one of these sites to see Nudge already in action →</p>
		<p>(You may need to log in)</p>
	</div>
	<div
		slot="right"
		class="flex flex-col items-center justify-center h-full bg-gray-100"
	>
		<div class="flex flex-wrap justify-center gap-2">
			<!-- Right side content -->
			{#each domains as domain}<a
					href={`https://${domain}`}
					target="_blank"
					rel="noopener noreferrer"
					class="px-3 py-1 text-sm text-white transition-colors duration-200 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600"
				>
					{domain}
				</a>
			{/each}
		</div>
	</div>
</StepLayout>

<script lang="ts">
	import StepLayout from "./Layout.svelte";
	export let onBack: () => void;
	export let onNext: () => void;
	import { hideesStore } from "../../hidees";
	const hideesCount = hideesStore.length;
	const uniqueDomainCount = new Set(hideesStore.map((hidee) => hidee.domain))
		.size;
</script>

<StepLayout {onBack} {onNext} buttonText="Next">
	<div class="space-y-4">
		<h2 class="mb-4 text-xl font-semibold">Help hide more distractions</h2>
		<p>
			Nudge ships with {hideesCount} hidden distractions across
			{uniqueDomainCount}
			sites, and we're rapidly adding to this number.
		</p>
		<p>
			Join our
			<a
				href="https://discord.gg/psxMtcWHdZ"
				class="font-bold text-blue-500 hover:text-blue-600"
				target="_blank">Discord community, Hide Everything,</a
			>
			to get involved.
		</p>
		<p>Or to request a specific hidden distraction, email hi@louis.work</p>
	</div>
	<div
		slot="right"
		class="flex items-center justify-center h-full p-4 bg-gray-100"
	>
		<!-- Right side content -->
		<a
			href="https://discord.gg/psxMtcWHdZ"
			target="_blank"
			class="text-white text-2xl bg-[#7289da] hover:bg-[#627cd6] px-5 py-3 rounded-[50px]"
			>Join the Discord</a
		>
	</div>
</StepLayout>

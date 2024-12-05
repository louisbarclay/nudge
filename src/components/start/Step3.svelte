<script lang="ts">
	import StepLayout from "./Layout.svelte";
	export let onBack: () => void;
	export let onNext: () => void;
</script>

<StepLayout {onBack} {onNext} buttonText="Next">
	<div class="space-y-4">
		<h2 class="mb-4 text-xl font-semibold">Choose what to hide</h2>
		<p>What you hide is completely up to you.</p>
		<p>For every distraction Nudge hides, you have 2 Options:</p>
		<div class="flex flex-col pt-2 mt-4 space-y-4">
			<label class="flex items-center gap-3 cursor-pointer select-none group">
				<input
					type="checkbox"
					checked
					class="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded cursor-pointer focus:ring-blue-500 focus:ring-offset-2 group-hover:border-blue-400"
				/>
				<span
					class="text-sm font-medium text-gray-700 group-hover:text-gray-900"
				>
					Hide (Hide distraction?)
				</span>
			</label>
			<label class="flex items-center gap-3 cursor-pointer select-none group">
				<input
					type="checkbox"
					checked
					class="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded cursor-pointer focus:ring-blue-500 focus:ring-offset-2 group-hover:border-blue-400"
				/>
				<span
					class="text-sm font-medium text-gray-700 group-hover:text-gray-900"
					>Button (Show button to unhide?)</span
				>
			</label>
		</div>
	</div>
	<div
		slot="right"
		class="flex flex-col justify-center h-full p-12 space-y-4 text-sm text-center bg-gray-100"
	>
		<!-- Right side content -->
		<p class="text-lg font-bold">✨ Set up your Options</p>

		<ol class="pl-4 space-y-4 text-left list-decimal list-outside">
			<li>Click puzzle piece in toolbar ↗</li>
			<li>
				Pin (📌) the Nudge icon (<img
					src="/icon.svg"
					alt="Nudge icon"
					class="h-[1em] inline pt-1 align-baseline"
				/>)
			</li>
		</ol>

		<p>Done! Click the Nudge icon any time to find your Options.</p>
	</div>
</StepLayout>

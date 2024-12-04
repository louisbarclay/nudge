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
		<label class="flex items-center gap-3 cursor-pointer group">
			<input
				type="checkbox"
				checked
				class="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded cursor-pointer focus:ring-blue-500 focus:ring-offset-2 group-hover:border-blue-400"
			/>
			<span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">
				Hide (Hide distraction?)
			</span>
		</label>
		<label class="flex items-center gap-3 cursor-pointer group">
			<input
				type="checkbox"
				checked
				class="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded cursor-pointer focus:ring-blue-500 focus:ring-offset-2 group-hover:border-blue-400"
			/>
			<span class="text-sm font-medium text-gray-700 group-hover:text-gray-900"
				>Button (Show button to unhide?)</span
			>
		</label>
	</div>
	<div
		slot="right"
		class="flex flex-col justify-center h-full p-4 space-y-4 text-sm bg-gray-100"
	>
		<!-- Right side content -->
		<p class="text-lg font-bold">🔎 Find your Nudge Options</p>
		<p class="">*Takes 5 seconds*</p>

		<ol class="pl-4 space-y-4 list-decimal list-outside">
			<li>
				Click the puzzle piece (like 🧩) in the browser toolbar just above this
				page ↗️
			</li>
			<li>Pin (📌) the Nudge icon</li>
		</ol>

		<p class="font-bold">That's it!</p>
		<p>
			Now, you can find Options either by clicking the Nudge icon (when on a
			site Nudge works on), or by right-clicking the icon and selecting
			'Options'.
		</p>
	</div>
</StepLayout>

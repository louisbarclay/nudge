<script lang="ts">
	export let onBack: () => void;
	export let onNext: () => void;
	export let showNext = true;
	export let showBack = true;
	export let buttonText = "Next";
	export let showRhs = true;
</script>

<div class="flex items-center justify-center w-full p-4 bg-gray-50">
	<div
		class="flex w-full h-auto max-w-2xl overflow-hidden bg-white border border-gray-200 rounded-lg min-h-96"
	>
		<div class={`flex flex-col  ${showRhs ? "w-1/2" : "w-full"} p-6`}>
			<div class="flex-1 overflow-y-auto text-sm">
				<slot />
			</div>
			<div
				class={`flex ${!showRhs ? "justify-center" : "justify-between"} mt-4`}
			>
				{#if showNext}
					<button
						class="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
						on:click={onNext}
					>
						{buttonText}
					</button>
				{/if}
				{#if showBack}
					<button
						class="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
						on:click={onBack}
					>
						Back
					</button>
				{/if}
			</div>
		</div>

		{#if showRhs}
			<div class="w-1/2">
				<slot name="right" />
			</div>
		{/if}
	</div>
</div>

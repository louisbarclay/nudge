<script lang="ts">
	import type { Hidee } from "../types";
	import optionsStoragePerDomain from "../options-storage";
	import { hideesStore } from "../hidees";

	const optionsStorage = optionsStoragePerDomain.getOptionsForOrigin();

	let hidees = $state<Hidee[]>([]);
	let searchQuery = $state("");
	let excludedHidees = $state<string[]>([]);
	let noMenuHidees = $state<string[]>([]);
	let domains = $state<string[]>([]);

	$effect(() => {
		optionsStorage.getAll().then((options) => {
			excludedHidees = JSON.parse(options.excludedHidees);
			noMenuHidees = JSON.parse(options.noMenuHidees);
			hidees = hideesStore;
			domains = [...new Set(hidees.map((h) => h.domain))];
		});
	});

	const filteredHidees = $derived(
		hidees.filter((hidee) =>
			hidee.slug.toLowerCase().includes(searchQuery.toLowerCase()),
		),
	);

	async function toggleExcludedHidee(slug: string) {
		if (excludedHidees.includes(slug)) {
			excludedHidees = excludedHidees.filter((h) => h !== slug);
		} else {
			excludedHidees = [...excludedHidees, slug];
		}
		await optionsStorage.set({
			excludedHidees: JSON.stringify(excludedHidees),
		});
	}

	async function toggleNoMenu(slug: string) {
		if (noMenuHidees.includes(slug)) {
			noMenuHidees = noMenuHidees.filter((s) => s !== slug);
		} else {
			noMenuHidees = [...noMenuHidees, slug];
		}
		await optionsStorage.set({ noMenuHidees: JSON.stringify(noMenuHidees) });
	}

	function setDomainFilter(domain: string) {
		searchQuery = domain;
	}
</script>

<div class="p-6 max-w-4xl mx-auto">
	<div class="space-y-6">
		<div>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search hidees..."
				class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
		</div>

		<div class="flex flex-wrap gap-2">
			{#each domains as domain}
				<button
					onclick={() => setDomainFilter(domain)}
					class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm hover:bg-blue-200 transition-colors"
				>
					{domain}
				</button>
			{/each}
		</div>

		<div class="space-y-4">
			{#each filteredHidees as hidee}
				<div
					class="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
				>
					<div class="flex-1">
						<h3 class="font-medium text-gray-900">{hidee.slug}</h3>
						{#if hidee.description}
							<p class="text-sm text-gray-500">{hidee.description}</p>
						{/if}
					</div>
					<div class="flex items-center space-x-4">
						<label class="flex items-center space-x-2">
							<input
								type="checkbox"
								checked={!noMenuHidees.includes(hidee.slug)}
								onchange={() => toggleNoMenu(hidee.slug)}
								class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<span class="text-sm text-gray-700">Show menu</span>
						</label>
						<label class="flex items-center space-x-2">
							<input
								type="checkbox"
								checked={excludedHidees.includes(hidee.slug)}
								onchange={() => toggleExcludedHidee(hidee.slug)}
								class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<span class="text-sm text-gray-700">Don't hide</span>
						</label>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<script lang="ts">
	import type { Hidee } from "../types";
	import optionsStoragePerDomain from "../options-storage";
	import { hideesStore } from "../hidees";
	import { Search, X } from "lucide-svelte";

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

	function clearSearch() {
		searchQuery = "";
	}
</script>

<div class="max-w-4xl p-8 mx-auto">
	<h1 class="mb-6 text-4xl font-bold text-gray-900">Options</h1>
	<p class="mb-8 text-lg text-gray-600">
		Choose which sections to hide, and whether to show a button to unhide them.
	</p>
	<div class="space-y-8">
		<label class="relative block">
			<span class="sr-only">Search sections</span>
			<span class="absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="w-5 h-5 text-gray-400" />
			</span>
			<input
				bind:value={searchQuery}
				class="w-full py-3 pl-10 pr-10 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				placeholder="Search sections..."
				type="text"
			/>
			{#if searchQuery}
				<button
					onclick={clearSearch}
					class="absolute inset-y-0 right-0 flex items-center pr-3"
					aria-label="Clear search"
				>
					<X class="w-5 h-5 text-gray-400 hover:text-gray-600" />
				</button>
			{/if}
		</label>

		<div class="flex flex-wrap gap-3">
			{#each domains as domain}
				<button
					onclick={() => setDomainFilter(domain)}
					class="px-4 py-2 text-sm font-medium text-gray-800 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
				>
					{domain}
				</button>
			{/each}
		</div>

		<div class="space-y-4">
			{#each filteredHidees as hidee}
				<div
					class="p-6 transition-colors bg-white border border-gray-200 rounded-xl hover:border-gray-300"
				>
					<div class="flex items-center justify-between">
						<div class="space-y-2">
							<span
								class="inline-block px-3 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full"
							>
								{hidee.domain}
							</span>
							<h3 class="text-xl font-semibold text-gray-900">
								{hidee.shortName || hidee.slug}
							</h3>
							<p class="text-sm text-gray-500">{hidee.slug}</p>
						</div>
						<div class="flex items-center gap-6">
							<label class="flex items-center gap-3 cursor-pointer group">
								<input
									type="checkbox"
									checked={!excludedHidees.includes(hidee.slug)}
									onchange={() => toggleExcludedHidee(hidee.slug)}
									class="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded cursor-pointer focus:ring-blue-500 focus:ring-offset-2 group-hover:border-blue-400"
								/>
								<span
									class="text-base font-medium text-gray-700 group-hover:text-gray-900"
									>Hide</span
								>
							</label>
							<label class="flex items-center gap-3 cursor-pointer group">
								<input
									type="checkbox"
									checked={!noMenuHidees.includes(hidee.slug)}
									onchange={() => toggleNoMenu(hidee.slug)}
									class="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded cursor-pointer focus:ring-blue-500 focus:ring-offset-2 group-hover:border-blue-400"
								/>
								<span
									class="text-base font-medium text-gray-700 group-hover:text-gray-900"
									>Button</span
								>
							</label>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

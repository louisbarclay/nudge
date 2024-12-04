<script lang="ts">
	import type { Hidee } from "../types";
	import optionsStoragePerDomain from "../options-storage";
	import { hideesStore } from "../hidees";
	import browser from "webextension-polyfill";

	const optionsStorage = optionsStoragePerDomain.getOptionsForOrigin();

	let hidees = $state<Hidee[]>([]);
	let excludedHidees = $state<string[]>([]);
	let noMenuHidees = $state<string[]>([]);
	let currentDomain = $state("");

	$effect(() => {
		getCurrentDomain().then((domain) => {
			currentDomain = domain;
			console.log(currentDomain);
			optionsStorage.getAll().then((options) => {
				excludedHidees = JSON.parse(options.excludedHidees);
				noMenuHidees = JSON.parse(options.noMenuHidees);
				console.log(hideesStore);
				hidees = hideesStore.filter((h) => currentDomain.includes(h.domain));
				console.log(hidees);
			});
		});
	});

	async function getCurrentDomain() {
		// Get the active tab in the current window
		const [activeTab] = await browser.tabs.query({
			active: true,
			currentWindow: true,
		});

		console.log(activeTab);
		// Extract domain from tab URL
		if (activeTab.url) {
			const url = new URL(activeTab.url);
			return url.hostname;
		} else {
			return "";
		}
	}

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
</script>

<div class="p-2 space-y-2">
	{#each hidees as hidee}
		<div
			class="p-4 transition-colors bg-white border border-gray-200 rounded-lg hover:border-gray-300"
		>
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-medium text-gray-900">
						{hidee.shortName || hidee.slug}
					</h3>
				</div>
				<div class="flex items-center gap-4">
					<label class="flex items-center gap-3 cursor-pointer group">
						<input
							type="checkbox"
							checked={!excludedHidees.includes(hidee.slug)}
							onchange={() => toggleExcludedHidee(hidee.slug)}
							class="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded cursor-pointer focus:ring-blue-500 focus:ring-offset-2 group-hover:border-blue-400"
						/>
						<span
							class="text-sm font-medium text-gray-700 group-hover:text-gray-900"
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
							class="text-sm font-medium text-gray-700 group-hover:text-gray-900"
							>Button</span
						>
					</label>
				</div>
			</div>
		</div>
	{/each}
</div>

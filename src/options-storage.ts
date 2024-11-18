import OptionsSyncPerDomain from "webext-options-sync-per-domain";

interface StorageOptions {
	excludedHidees: string;
	noMenuHidees: string;
	[key: string]: string | number | boolean;
}

const optionsStoragePerDomain = new OptionsSyncPerDomain<StorageOptions>({
	defaults: {
		excludedHidees: "[]",
		noMenuHidees: "[]",
	},
	migrations: [OptionsSyncPerDomain.migrations.removeUnused],
	logging: true,
});

export default optionsStoragePerDomain;

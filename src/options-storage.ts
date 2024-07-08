import OptionsSyncPerDomain from "webext-options-sync-per-domain";

const optionsStoragePerDomain = new OptionsSyncPerDomain({
	defaults: {
		colorRed: 244,
		colorGreen: 67,
		colorBlue: 54,
	},
	migrations: [OptionsSyncPerDomain.migrations.removeUnused],
	logging: true,
});

export default optionsStoragePerDomain;

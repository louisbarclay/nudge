// vite.config.ts
import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [
		svelte(),
		webExtension({ additionalInputs: ["src/start/start.html"] }),
	],
	build: {
		// Ensure production build
		minify: true,
		sourcemap: false,
	},
});

import { default as App } from "../components/Options.svelte";

const app = new App({
	target: document.getElementById("app")!,
});

export default app;

import { mount } from "svelte";
import App from "../components/Popup.svelte";

const target = document.getElementById("app");
if (target) {
	mount(App, { target });
}

export default App;

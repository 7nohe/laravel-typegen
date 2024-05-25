import "./bootstrap";
import "../css/app.css";

import { createInertiaApp } from "@inertiajs/vue3";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createApp, h } from "vue";
import { ZiggyVue } from "../../vendor/tightenco/ziggy/dist/vue.m";
import { Ziggy } from "./ziggy";

const appName =
	window.document.getElementsByTagName("title")[0]?.innerText || "Laravel";

createInertiaApp({
	progress: { color: "#4B5563" },
	title: (title) => `${title} - ${appName}`,
	resolve: (name) =>
		resolvePageComponent(
			`./Pages/${name}.vue`,
			// biome-ignore lint/suspicious/noExplicitAny: for example purposes
			import.meta.glob("../js/Pages/**/*.vue") as any,
		),
	setup({ el, App, props, plugin }) {
		createApp({ render: () => h(App, props) })
			.use(plugin)
			.use(ZiggyVue, Ziggy)
			.mount(el);
	},
});

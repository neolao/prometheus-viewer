import path from "node:path";
import { createApp } from "./createApp.js";

const port = Number(process.env.PORT ?? 3000);
const prometheusUrl = process.env.PROMETHEUS_URL ?? "http://localhost:9090";
const prometheusUsername = process.env.PROMETHEUS_USERNAME;
const prometheusPassword = process.env.PROMETHEUS_PASSWORD;
const isProduction = process.env.NODE_ENV === "production";

async function main() {
	if (isProduction) {
		const app = createApp({
			prometheusUrl,
			prometheusUsername,
			prometheusPassword,
			distDir: path.resolve(process.cwd(), "dist"),
		});
		app.listen(port, () => {
			console.log(`prometheus-viewer listening on :${port} (production)`);
		});
		return;
	}

	const { createServer: createViteServer } = await import("vite");
	const vite = await createViteServer({ server: { middlewareMode: true } });
	const app = createApp({
		prometheusUrl,
		prometheusUsername,
		prometheusPassword,
		viteMiddleware: vite.middlewares,
	});
	app.listen(port, () => {
		console.log(`prometheus-viewer listening on :${port} (development)`);
	});
}

main();

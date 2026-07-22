/// <reference types="vitest/config" />

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [react()],
		server: {
			allowedHosts: true,
			// Dev-only workaround for Prometheus servers that don't send CORS
			// headers: the browser talks to this same-origin dev server, which
			// then relays the request server-side (Node isn't subject to CORS).
			// Set PROMETHEUS_PROXY_TARGET and point VITE_PROMETHEUS_URL at
			// /prom-api to use it — see .env.example.
			proxy: env.PROMETHEUS_PROXY_TARGET
				? {
						"/prom-api": {
							target: env.PROMETHEUS_PROXY_TARGET,
							changeOrigin: true,
							rewrite: (path: string) => path.replace(/^\/prom-api/, ""),
						},
					}
				: undefined,
		},
		test: {
			environment: "jsdom",
			setupFiles: ["./src/test/setup.ts"],
			globals: true,
		},
	};
});

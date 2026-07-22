import path from "node:path";
import express, { type Express, type RequestHandler } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

export interface CreateAppOptions {
	prometheusUrl: string;
	prometheusUsername?: string;
	prometheusPassword?: string;
	/** Vite dev middleware — provide in development, omit in production. */
	viteMiddleware?: RequestHandler;
	/** Directory of the built frontend — provide in production, omit in development. */
	distDir?: string;
}

export function createApp(options: CreateAppOptions): Express {
	const app = express();

	app.use(
		"/prom-api",
		createProxyMiddleware({
			target: options.prometheusUrl,
			changeOrigin: true,
			pathRewrite: { "^/prom-api": "" },
			on: {
				proxyReq: (proxyReq) => {
					if (options.prometheusUsername && options.prometheusPassword) {
						const token = Buffer.from(
							`${options.prometheusUsername}:${options.prometheusPassword}`,
						).toString("base64");
						proxyReq.setHeader("Authorization", `Basic ${token}`);
					}
				},
				error: (_err, _req, res) => {
					const response = res as import("node:http").ServerResponse;
					response.writeHead(502, { "Content-Type": "application/json" });
					response.end(
						JSON.stringify({
							status: "error",
							error: "Prometheus server unreachable",
						}),
					);
				},
			},
		}),
	);

	if (options.viteMiddleware) {
		app.use(options.viteMiddleware);
	} else if (options.distDir) {
		app.use(express.static(options.distDir));
		app.get(/.*/, (_req, res) => {
			res.sendFile(path.join(options.distDir as string, "index.html"));
		});
	}

	return app;
}

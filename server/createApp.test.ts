// @vitest-environment node
import http from "node:http";
import type { AddressInfo } from "node:net";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./createApp.js";

interface FakeTarget {
	url: string;
	close: () => Promise<void>;
}

function startFakeTarget(handler: http.RequestListener): Promise<FakeTarget> {
	return new Promise((resolve) => {
		const server = http.createServer(handler);
		server.listen(0, () => {
			const { port } = server.address() as AddressInfo;
			resolve({
				url: `http://127.0.0.1:${port}`,
				close: () => new Promise((r) => server.close(() => r())),
			});
		});
	});
}

describe("createApp /prom-api proxy", () => {
	let target: FakeTarget | undefined;

	afterEach(async () => {
		await target?.close();
		target = undefined;
	});

	it("proxies the request to the configured Prometheus URL", async () => {
		target = await startFakeTarget((_req, res) => {
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ status: "success", data: ["up"] }));
		});
		const app = createApp({ prometheusUrl: target.url });

		const response = await request(app).get(
			"/prom-api/api/v1/label/__name__/values",
		);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ status: "success", data: ["up"] });
	});

	it("adds a Basic Authorization header when credentials are configured", async () => {
		let receivedAuth: string | undefined;
		target = await startFakeTarget((req, res) => {
			receivedAuth = req.headers.authorization;
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ status: "success", data: [] }));
		});
		const app = createApp({
			prometheusUrl: target.url,
			prometheusUsername: "alice",
			prometheusPassword: "s3cret",
		});

		await request(app).get("/prom-api/api/v1/label/__name__/values");

		expect(receivedAuth).toBe(
			`Basic ${Buffer.from("alice:s3cret").toString("base64")}`,
		);
	});

	it("does not add an Authorization header when credentials are not configured", async () => {
		let receivedAuth: string | undefined = "not-called";
		target = await startFakeTarget((req, res) => {
			receivedAuth = req.headers.authorization;
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ status: "success", data: [] }));
		});
		const app = createApp({ prometheusUrl: target.url });

		await request(app).get("/prom-api/api/v1/label/__name__/values");

		expect(receivedAuth).toBeUndefined();
	});

	it("forwards Prometheus's error status when credentials are rejected", async () => {
		target = await startFakeTarget((_req, res) => {
			res.writeHead(401, { "Content-Type": "application/json" });
			res.end(
				JSON.stringify({ status: "error", error: "invalid credentials" }),
			);
		});
		const app = createApp({
			prometheusUrl: target.url,
			prometheusUsername: "alice",
			prometheusPassword: "wrong",
		});

		const response = await request(app).get(
			"/prom-api/api/v1/label/__name__/values",
		);

		expect(response.status).toBe(401);
	});

	it("returns a 502 error when Prometheus is unreachable", async () => {
		const probe = await startFakeTarget((_req, res) => res.end());
		const unreachableUrl = probe.url;
		await probe.close();

		const app = createApp({ prometheusUrl: unreachableUrl });

		const response = await request(app).get(
			"/prom-api/api/v1/label/__name__/values",
		);

		expect(response.status).toBe(502);
	});
});

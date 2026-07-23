import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchInstances, fetchMetricNames } from "./prometheus";

function mockFetchOnce(
	response: Partial<Response> & { json?: () => Promise<unknown> },
) {
	const fetchMock = vi.fn().mockResolvedValue(response as Response);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

describe("fetchMetricNames", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns the metric names from a successful response", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: ["http_requests_total", "process_cpu_seconds_total"],
				}),
		});

		const result = await fetchMetricNames("http://localhost:9090");

		expect(result).toEqual([
			"http_requests_total",
			"process_cpu_seconds_total",
		]);
	});

	it("requests the label values endpoint on the given base URL", async () => {
		const fetchMock = mockFetchOnce({
			ok: true,
			json: () => Promise.resolve({ status: "success", data: [] }),
		});

		await fetchMetricNames("http://localhost:9090");

		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:9090/api/v1/label/__name__/values",
		);
	});

	it("returns an empty array when Prometheus has no metrics", async () => {
		mockFetchOnce({
			ok: true,
			json: () => Promise.resolve({ status: "success", data: [] }),
		});

		const result = await fetchMetricNames("http://localhost:9090");

		expect(result).toEqual([]);
	});

	it("throws when the HTTP response is not ok", async () => {
		mockFetchOnce({
			ok: false,
			status: 502,
			statusText: "Bad Gateway",
			json: () => Promise.resolve({}),
		});

		await expect(fetchMetricNames("http://localhost:9090")).rejects.toThrow(
			"502",
		);
	});

	it("throws with the Prometheus error message when the API reports an error status", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "error",
					errorType: "bad_data",
					error: "unknown label name",
				}),
		});

		await expect(fetchMetricNames("http://localhost:9090")).rejects.toThrow(
			"unknown label name",
		);
	});

	it("propagates a network failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("network error")),
		);

		await expect(fetchMetricNames("http://localhost:9090")).rejects.toThrow(
			"network error",
		);
	});
});

describe("fetchInstances", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns the instance names from a successful response", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: ["server-a:9100", "server-b:9100"],
				}),
		});

		const result = await fetchInstances("http://localhost:9090");

		expect(result).toEqual(["server-a:9100", "server-b:9100"]);
	});

	it("requests the instance label values endpoint on the given base URL", async () => {
		const fetchMock = mockFetchOnce({
			ok: true,
			json: () => Promise.resolve({ status: "success", data: [] }),
		});

		await fetchInstances("http://localhost:9090");

		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:9090/api/v1/label/instance/values",
		);
	});

	it("returns an empty array when Prometheus has no known instances", async () => {
		mockFetchOnce({
			ok: true,
			json: () => Promise.resolve({ status: "success", data: [] }),
		});

		const result = await fetchInstances("http://localhost:9090");

		expect(result).toEqual([]);
	});

	it("throws when the HTTP response is not ok", async () => {
		mockFetchOnce({
			ok: false,
			status: 502,
			statusText: "Bad Gateway",
			json: () => Promise.resolve({}),
		});

		await expect(fetchInstances("http://localhost:9090")).rejects.toThrow(
			"502",
		);
	});

	it("throws with the Prometheus error message when the API reports an error status", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "error",
					errorType: "bad_data",
					error: "unknown label name",
				}),
		});

		await expect(fetchInstances("http://localhost:9090")).rejects.toThrow(
			"unknown label name",
		);
	});

	it("propagates a network failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("network error")),
		);

		await expect(fetchInstances("http://localhost:9090")).rejects.toThrow(
			"network error",
		);
	});
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMachines, fetchMetricNames } from "./prometheus";

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

	it("requests the label values endpoint with a match[] filter scoped to the given machine", async () => {
		const fetchMock = mockFetchOnce({
			ok: true,
			json: () => Promise.resolve({ status: "success", data: [] }),
		});

		await fetchMetricNames("http://localhost:9090", "retrogaming");

		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:9090/api/v1/label/__name__/values?match%5B%5D=%7Bhost%3D%22retrogaming%22%7D",
		);
	});

	it("scopes the match[] filter to the exact machine name passed in", async () => {
		const fetchMock = mockFetchOnce({
			ok: true,
			json: () => Promise.resolve({ status: "success", data: [] }),
		});

		await fetchMetricNames("http://localhost:9090", "workstation");

		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:9090/api/v1/label/__name__/values?match%5B%5D=%7Bhost%3D%22workstation%22%7D",
		);
	});

	it("throws with the Prometheus error message when the API reports an error status for a machine-filtered request", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "error",
					errorType: "bad_data",
					error: "unknown label name",
				}),
		});

		await expect(
			fetchMetricNames("http://localhost:9090", "retrogaming"),
		).rejects.toThrow("unknown label name");
	});
});

describe("fetchMachines", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns the machine names from a successful response", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: ["retrogaming", "workstation"],
				}),
		});

		const result = await fetchMachines("http://localhost:9090");

		expect(result).toEqual(["retrogaming", "workstation"]);
	});

	it("requests the host label values endpoint on the given base URL", async () => {
		const fetchMock = mockFetchOnce({
			ok: true,
			json: () => Promise.resolve({ status: "success", data: [] }),
		});

		await fetchMachines("http://localhost:9090");

		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:9090/api/v1/label/host/values",
		);
	});

	it("returns an empty array when Prometheus has no known machines", async () => {
		mockFetchOnce({
			ok: true,
			json: () => Promise.resolve({ status: "success", data: [] }),
		});

		const result = await fetchMachines("http://localhost:9090");

		expect(result).toEqual([]);
	});

	it("throws when the HTTP response is not ok", async () => {
		mockFetchOnce({
			ok: false,
			status: 502,
			statusText: "Bad Gateway",
			json: () => Promise.resolve({}),
		});

		await expect(fetchMachines("http://localhost:9090")).rejects.toThrow("502");
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

		await expect(fetchMachines("http://localhost:9090")).rejects.toThrow(
			"unknown label name",
		);
	});

	it("propagates a network failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("network error")),
		);

		await expect(fetchMachines("http://localhost:9090")).rejects.toThrow(
			"network error",
		);
	});
});

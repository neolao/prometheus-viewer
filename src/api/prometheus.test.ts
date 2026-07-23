import { afterEach, describe, expect, it, vi } from "vitest";
import {
	fetchMachines,
	fetchMetricNames,
	fetchMetricRange,
	fetchMetricValue,
} from "./prometheus";

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

describe("fetchMetricValue", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns the current value for a single-series metric", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: {
						resultType: "vector",
						result: [
							{
								metric: {
									__name__: "http_requests_total",
									host: "retrogaming",
								},
								value: [1700000000, "42"],
							},
						],
					},
				}),
		});

		const result = await fetchMetricValue(
			"http://localhost:9090",
			"http_requests_total",
			"retrogaming",
		);

		expect(result).toEqual([
			{
				labels: { __name__: "http_requests_total", host: "retrogaming" },
				value: "42",
			},
		]);
	});

	it("requests the instant query endpoint with a PromQL expression scoped to the given machine", async () => {
		const fetchMock = mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: { resultType: "vector", result: [] },
				}),
		});

		await fetchMetricValue(
			"http://localhost:9090",
			"http_requests_total",
			"retrogaming",
		);

		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:9090/api/v1/query?query=http_requests_total%7Bhost%3D%22retrogaming%22%7D",
		);
	});

	it("returns one sample per series when the metric has multiple series for the machine", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: {
						resultType: "vector",
						result: [
							{
								metric: { __name__: "http_requests_total", method: "GET" },
								value: [1700000000, "10"],
							},
							{
								metric: { __name__: "http_requests_total", method: "POST" },
								value: [1700000000, "5"],
							},
						],
					},
				}),
		});

		const result = await fetchMetricValue(
			"http://localhost:9090",
			"http_requests_total",
			"retrogaming",
		);

		expect(result).toEqual([
			{
				labels: { __name__: "http_requests_total", method: "GET" },
				value: "10",
			},
			{
				labels: { __name__: "http_requests_total", method: "POST" },
				value: "5",
			},
		]);
	});

	it("returns an empty array when the metric has no current value for the machine", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: { resultType: "vector", result: [] },
				}),
		});

		const result = await fetchMetricValue(
			"http://localhost:9090",
			"http_requests_total",
			"retrogaming",
		);

		expect(result).toEqual([]);
	});

	it("throws when the HTTP response is not ok", async () => {
		mockFetchOnce({
			ok: false,
			status: 502,
			statusText: "Bad Gateway",
			json: () => Promise.resolve({}),
		});

		await expect(
			fetchMetricValue(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
			),
		).rejects.toThrow("502");
	});

	it("throws with the Prometheus error message when the API reports an error status", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "error",
					errorType: "bad_data",
					error: "invalid query",
				}),
		});

		await expect(
			fetchMetricValue(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
			),
		).rejects.toThrow("invalid query");
	});

	it("propagates a network failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("network error")),
		);

		await expect(
			fetchMetricValue(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
			),
		).rejects.toThrow("network error");
	});

	it("throws a clear error when the response payload is malformed", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: { resultType: "vector" },
				}),
		});

		await expect(
			fetchMetricValue(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
			),
		).rejects.toThrow(/malformed/i);
	});
});

describe("fetchMetricRange", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns the series with their points for a single-series metric", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: {
						resultType: "matrix",
						result: [
							{
								metric: { __name__: "http_requests_total", method: "GET" },
								values: [
									[1700000000, "10"],
									[1700000015, "12"],
								],
							},
						],
					},
				}),
		});

		const result = await fetchMetricRange(
			"http://localhost:9090",
			"http_requests_total",
			"retrogaming",
			1700000000,
			1700000015,
			15,
		);

		expect(result).toEqual([
			{
				labels: { __name__: "http_requests_total", method: "GET" },
				points: [
					{ timestamp: 1700000000, value: "10" },
					{ timestamp: 1700000015, value: "12" },
				],
			},
		]);
	});

	it("requests the range query endpoint with a PromQL expression and start/end/step scoped to the given machine", async () => {
		const fetchMock = mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: { resultType: "matrix", result: [] },
				}),
		});

		await fetchMetricRange(
			"http://localhost:9090",
			"http_requests_total",
			"retrogaming",
			1700000000,
			1700003600,
			15,
		);

		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:9090/api/v1/query_range?query=http_requests_total%7Bhost%3D%22retrogaming%22%7D&start=1700000000&end=1700003600&step=15",
		);
	});

	it("returns one series per label combination when the metric has multiple series", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: {
						resultType: "matrix",
						result: [
							{
								metric: { __name__: "http_requests_total", method: "GET" },
								values: [[1700000000, "10"]],
							},
							{
								metric: { __name__: "http_requests_total", method: "POST" },
								values: [[1700000000, "5"]],
							},
						],
					},
				}),
		});

		const result = await fetchMetricRange(
			"http://localhost:9090",
			"http_requests_total",
			"retrogaming",
			1700000000,
			1700003600,
			15,
		);

		expect(result).toEqual([
			{
				labels: { __name__: "http_requests_total", method: "GET" },
				points: [{ timestamp: 1700000000, value: "10" }],
			},
			{
				labels: { __name__: "http_requests_total", method: "POST" },
				points: [{ timestamp: 1700000000, value: "5" }],
			},
		]);
	});

	it("returns an empty array when the metric has no data for the machine in the range", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: { resultType: "matrix", result: [] },
				}),
		});

		const result = await fetchMetricRange(
			"http://localhost:9090",
			"http_requests_total",
			"retrogaming",
			1700000000,
			1700003600,
			15,
		);

		expect(result).toEqual([]);
	});

	it("throws when the HTTP response is not ok", async () => {
		mockFetchOnce({
			ok: false,
			status: 502,
			statusText: "Bad Gateway",
			json: () => Promise.resolve({}),
		});

		await expect(
			fetchMetricRange(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
				1700000000,
				1700003600,
				15,
			),
		).rejects.toThrow("502");
	});

	it("throws with the Prometheus error message when the API reports an error status", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "error",
					errorType: "bad_data",
					error: "invalid query",
				}),
		});

		await expect(
			fetchMetricRange(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
				1700000000,
				1700003600,
				15,
			),
		).rejects.toThrow("invalid query");
	});

	it("propagates a network failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("network error")),
		);

		await expect(
			fetchMetricRange(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
				1700000000,
				1700003600,
				15,
			),
		).rejects.toThrow("network error");
	});

	it("throws a clear error when the response payload is missing the result array", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: { resultType: "matrix" },
				}),
		});

		await expect(
			fetchMetricRange(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
				1700000000,
				1700003600,
				15,
			),
		).rejects.toThrow(/malformed/i);
	});

	it("throws a clear error when a series entry has no values array", async () => {
		mockFetchOnce({
			ok: true,
			json: () =>
				Promise.resolve({
					status: "success",
					data: {
						resultType: "matrix",
						result: [{ metric: { __name__: "http_requests_total" } }],
					},
				}),
		});

		await expect(
			fetchMetricRange(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
				1700000000,
				1700003600,
				15,
			),
		).rejects.toThrow(/malformed/i);
	});
});

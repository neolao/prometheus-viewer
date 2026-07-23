import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMetricValue } from "../../api/prometheus";
import { MetricValue } from "./MetricValue";

vi.mock("../../api/prometheus", () => ({
	fetchMetricValue: vi.fn(),
}));

const mockedFetchMetricValue = vi.mocked(fetchMetricValue);

describe("MetricValue", () => {
	afterEach(() => {
		mockedFetchMetricValue.mockReset();
	});

	it("shows a loading state before the value arrives", () => {
		mockedFetchMetricValue.mockReturnValue(new Promise(() => {}));

		render(
			<MetricValue
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it("displays the current value for a single-series metric", async () => {
		mockedFetchMetricValue.mockResolvedValue([
			{ labels: { method: "GET" }, value: "42" },
		]);

		render(
			<MetricValue
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		expect(await screen.findByText(/42/)).toBeInTheDocument();
	});

	it("requests the value scoped to the given metric and machine", async () => {
		mockedFetchMetricValue.mockResolvedValue([]);

		render(
			<MetricValue
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		await waitFor(() => {
			expect(mockedFetchMetricValue).toHaveBeenCalledWith(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
			);
		});
	});

	it("displays each series separately when the metric has multiple series", async () => {
		mockedFetchMetricValue.mockResolvedValue([
			{ labels: { method: "GET" }, value: "10" },
			{ labels: { method: "POST" }, value: "5" },
		]);

		render(
			<MetricValue
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		expect(await screen.findByText(/10/)).toBeInTheDocument();
		expect(screen.getByText(/5/)).toBeInTheDocument();
		expect(screen.getByText(/GET/)).toBeInTheDocument();
		expect(screen.getByText(/POST/)).toBeInTheDocument();
	});

	it("shows a clear message when the metric has no current value on this machine", async () => {
		mockedFetchMetricValue.mockResolvedValue([]);

		render(
			<MetricValue
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		expect(await screen.findByText(/no current value/i)).toBeInTheDocument();
	});

	it("shows an error message when the request fails", async () => {
		mockedFetchMetricValue.mockRejectedValue(new Error("network error"));

		render(
			<MetricValue
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("network error");
		});
	});

	it("re-fetches when the metric name changes", async () => {
		mockedFetchMetricValue.mockResolvedValue([]);

		const { rerender } = render(
			<MetricValue
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		await waitFor(() => {
			expect(mockedFetchMetricValue).toHaveBeenCalledWith(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
			);
		});

		rerender(
			<MetricValue
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="process_cpu_seconds_total"
			/>,
		);

		await waitFor(() => {
			expect(mockedFetchMetricValue).toHaveBeenCalledWith(
				"http://localhost:9090",
				"process_cpu_seconds_total",
				"retrogaming",
			);
		});
		expect(mockedFetchMetricValue).toHaveBeenCalledTimes(2);
	});
});

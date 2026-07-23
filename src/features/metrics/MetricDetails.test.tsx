import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMetricMetadata } from "../../api/prometheus";
import { MetricDetails } from "./MetricDetails";

vi.mock("../../api/prometheus", () => ({
	fetchMetricMetadata: vi.fn(),
}));

const mockedFetchMetricMetadata = vi.mocked(fetchMetricMetadata);

describe("MetricDetails", () => {
	afterEach(() => {
		mockedFetchMetricMetadata.mockReset();
	});

	it("displays the type and description once metadata is fetched", async () => {
		mockedFetchMetricMetadata.mockResolvedValue({
			type: "counter",
			help: "Total number of HTTP requests.",
		});

		render(
			<MetricDetails
				baseUrl="http://localhost:9090"
				metricName="http_requests_total"
			/>,
		);

		expect(await screen.findByText("counter")).toBeInTheDocument();
		expect(
			screen.getByText("Total number of HTTP requests."),
		).toBeInTheDocument();
	});

	it("requests metadata scoped to the given metric on the given base URL", async () => {
		mockedFetchMetricMetadata.mockResolvedValue({ type: "gauge", help: "" });

		render(
			<MetricDetails
				baseUrl="http://localhost:9090"
				metricName="process_cpu_seconds_total"
			/>,
		);

		await waitFor(() => {
			expect(mockedFetchMetricMetadata).toHaveBeenCalledWith(
				"http://localhost:9090",
				"process_cpu_seconds_total",
			);
		});
	});

	it("shows a loading state before the metadata arrives", () => {
		mockedFetchMetricMetadata.mockReturnValue(new Promise(() => {}));

		render(
			<MetricDetails
				baseUrl="http://localhost:9090"
				metricName="http_requests_total"
			/>,
		);

		expect(screen.getByText(/chargement/i)).toBeInTheDocument();
	});

	it("re-fetches metadata when the metric name changes", async () => {
		mockedFetchMetricMetadata.mockResolvedValue({
			type: "counter",
			help: "Total number of HTTP requests.",
		});

		const { rerender } = render(
			<MetricDetails
				baseUrl="http://localhost:9090"
				metricName="http_requests_total"
			/>,
		);

		await waitFor(() => {
			expect(mockedFetchMetricMetadata).toHaveBeenCalledWith(
				"http://localhost:9090",
				"http_requests_total",
			);
		});

		rerender(
			<MetricDetails
				baseUrl="http://localhost:9090"
				metricName="process_cpu_seconds_total"
			/>,
		);

		await waitFor(() => {
			expect(mockedFetchMetricMetadata).toHaveBeenCalledWith(
				"http://localhost:9090",
				"process_cpu_seconds_total",
			);
		});
		expect(mockedFetchMetricMetadata).toHaveBeenCalledTimes(2);
	});

	it("shows a clear message when no metadata is available for the metric", async () => {
		mockedFetchMetricMetadata.mockResolvedValue(null);

		render(
			<MetricDetails
				baseUrl="http://localhost:9090"
				metricName="custom_metric"
			/>,
		);

		expect(
			await screen.findByText(/aucune information disponible/i),
		).toBeInTheDocument();
	});

	it("shows an error message when the request fails", async () => {
		mockedFetchMetricMetadata.mockRejectedValue(new Error("network error"));

		render(
			<MetricDetails
				baseUrl="http://localhost:9090"
				metricName="http_requests_total"
			/>,
		);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("network error");
		});
	});
});

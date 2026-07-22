import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMetricNames } from "../../api/prometheus";
import { MetricList } from "./MetricList";

vi.mock("../../api/prometheus", () => ({
	fetchMetricNames: vi.fn(),
}));

const mockedFetchMetricNames = vi.mocked(fetchMetricNames);

describe("MetricList", () => {
	afterEach(() => {
		mockedFetchMetricNames.mockReset();
	});

	it("displays the fetched metric names", async () => {
		mockedFetchMetricNames.mockResolvedValue([
			"http_requests_total",
			"process_cpu_seconds_total",
		]);

		render(<MetricList baseUrl="http://localhost:9090" />);

		expect(await screen.findByText("http_requests_total")).toBeInTheDocument();
		expect(screen.getByText("process_cpu_seconds_total")).toBeInTheDocument();
	});

	it("shows a loading state before the metrics arrive", () => {
		mockedFetchMetricNames.mockReturnValue(new Promise(() => {}));

		render(<MetricList baseUrl="http://localhost:9090" />);

		expect(screen.getByText(/chargement/i)).toBeInTheDocument();
	});

	it("shows an empty state message when Prometheus has no metrics", async () => {
		mockedFetchMetricNames.mockResolvedValue([]);

		render(<MetricList baseUrl="http://localhost:9090" />);

		expect(
			await screen.findByText(/aucune métrique disponible/i),
		).toBeInTheDocument();
	});

	it("shows an error message when the request fails", async () => {
		mockedFetchMetricNames.mockRejectedValue(new Error("network error"));

		render(<MetricList baseUrl="http://localhost:9090" />);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("network error");
		});
	});
});

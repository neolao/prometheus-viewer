import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchMetricRange } from "../../api/prometheus";
import { MetricChart } from "./MetricChart";

vi.mock("../../api/prometheus", () => ({
	fetchMetricRange: vi.fn(),
}));

const mockedFetchMetricRange = vi.mocked(fetchMetricRange);
const now = new Date("2026-07-24T12:00:00Z");
const nowSeconds = Math.floor(now.getTime() / 1000);

describe("MetricChart", () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(now);
	});

	afterEach(() => {
		vi.useRealTimers();
		mockedFetchMetricRange.mockReset();
	});

	it("shows a loading state before the data arrives", () => {
		mockedFetchMetricRange.mockReturnValue(new Promise(() => {}));

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it("renders a chart once the data for the default (last hour) range arrives", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [
					{ timestamp: nowSeconds - 30, value: "1" },
					{ timestamp: nowSeconds, value: "2" },
				],
			},
		]);

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		expect(
			await screen.findByRole("img", { name: /metric evolution chart/i }),
		).toBeInTheDocument();
	});

	it("requests the last hour range by default, scoped to the metric and machine", async () => {
		mockedFetchMetricRange.mockResolvedValue([]);

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		await waitFor(() => {
			expect(mockedFetchMetricRange).toHaveBeenCalledWith(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
				nowSeconds - 3600,
				nowSeconds,
				15,
			);
		});
	});

	it("reloads the graph with a 6-hour range when the user selects it", async () => {
		mockedFetchMetricRange.mockResolvedValue([]);

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);
		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(1),
		);

		fireEvent.change(screen.getByLabelText(/time range/i), {
			target: { value: "6h" },
		});

		await waitFor(() => {
			expect(mockedFetchMetricRange).toHaveBeenCalledWith(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
				nowSeconds - 6 * 3600,
				nowSeconds,
				60,
			);
		});
	});

	it("reloads the graph with a 7-day range when the user selects it", async () => {
		mockedFetchMetricRange.mockResolvedValue([]);

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);
		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(1),
		);

		fireEvent.change(screen.getByLabelText(/time range/i), {
			target: { value: "7d" },
		});

		await waitFor(() => {
			expect(mockedFetchMetricRange).toHaveBeenCalledWith(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
				nowSeconds - 7 * 24 * 3600,
				nowSeconds,
				1800,
			);
		});
	});

	it("does not fetch a custom range until the user applies it", async () => {
		mockedFetchMetricRange.mockResolvedValue([]);

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);
		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(1),
		);

		fireEvent.change(screen.getByLabelText(/time range/i), {
			target: { value: "custom" },
		});

		expect(
			screen.getByText(/select a start and end date/i),
		).toBeInTheDocument();
		expect(mockedFetchMetricRange).toHaveBeenCalledTimes(1);
	});

	it("fetches a custom range once the user submits start and end dates", async () => {
		mockedFetchMetricRange.mockResolvedValue([]);
		const customStart = "2026-07-20T00:00";
		const customEnd = "2026-07-21T00:00";

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);
		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(1),
		);

		fireEvent.change(screen.getByLabelText(/time range/i), {
			target: { value: "custom" },
		});
		fireEvent.change(screen.getByLabelText(/^start$/i), {
			target: { value: customStart },
		});
		fireEvent.change(screen.getByLabelText(/^end$/i), {
			target: { value: customEnd },
		});
		fireEvent.click(screen.getByRole("button", { name: /apply/i }));

		const expectedStart = Math.floor(new Date(customStart).getTime() / 1000);
		const expectedEnd = Math.floor(new Date(customEnd).getTime() / 1000);
		const expectedStep = Math.max(
			15,
			Math.round((expectedEnd - expectedStart) / 300),
		);

		await waitFor(() => {
			expect(mockedFetchMetricRange).toHaveBeenCalledWith(
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
				expectedStart,
				expectedEnd,
				expectedStep,
			);
		});
	});

	it("displays each series as a separate line when the metric has multiple series", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [{ timestamp: nowSeconds, value: "1" }],
			},
			{
				labels: { method: "POST" },
				points: [{ timestamp: nowSeconds, value: "2" }],
			},
		]);

		const { container } = render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		await screen.findByRole("img", { name: /metric evolution chart/i });

		expect(container.querySelectorAll("polyline")).toHaveLength(2);
	});

	it("shows a clear message when the metric has no series for the selected range", async () => {
		mockedFetchMetricRange.mockResolvedValue([]);

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		expect(await screen.findByText(/no data/i)).toBeInTheDocument();
	});

	it("shows a clear message when the metric's series have no points in the selected range", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{ labels: { method: "GET" }, points: [] },
		]);

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		expect(await screen.findByText(/no data/i)).toBeInTheDocument();
	});

	it("shows an error message when the request fails", async () => {
		mockedFetchMetricRange.mockRejectedValue(new Error("network error"));

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("network error");
		});
	});
});

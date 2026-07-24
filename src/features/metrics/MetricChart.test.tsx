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
		vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
			left: 0,
			top: 0,
			right: 600,
			bottom: 200,
			width: 600,
			height: 200,
			x: 0,
			y: 0,
			toJSON() {
				return this;
			},
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		mockedFetchMetricRange.mockReset();
		vi.mocked(Element.prototype.getBoundingClientRect).mockRestore();
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

	it("renders a legend entry for each series with its label", async () => {
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

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		await screen.findByRole("img", { name: /metric evolution chart/i });

		expect(
			screen.getByRole("button", { name: 'method="GET"' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: 'method="POST"' }),
		).toBeInTheDocument();
	});

	it("shows a fallback label in the legend for a series with no labels", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{ labels: {}, points: [{ timestamp: nowSeconds, value: "1" }] },
		]);

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		await screen.findByRole("img", { name: /metric evolution chart/i });

		expect(
			screen.getByRole("button", { name: /no labels/i }),
		).toBeInTheDocument();
	});

	it("hides a series' line when its legend entry is toggled off", async () => {
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

		const getButton = screen.getByRole("button", { name: 'method="GET"' });
		fireEvent.click(getButton);

		expect(getButton).toHaveAttribute("aria-pressed", "false");
		expect(container.querySelectorAll("polyline")).toHaveLength(1);
	});

	it("keeps a visible series' line unchanged when another series is toggled off", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [
					{ timestamp: nowSeconds - 30, value: "1" },
					{ timestamp: nowSeconds, value: "5" },
				],
			},
			{
				labels: { method: "POST" },
				points: [
					{ timestamp: nowSeconds - 30, value: "100" },
					{ timestamp: nowSeconds, value: "200" },
				],
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

		const pointsBefore = container
			.querySelectorAll("polyline")[0]
			?.getAttribute("points");

		fireEvent.click(screen.getByRole("button", { name: 'method="POST"' }));

		const remainingPolylines = container.querySelectorAll("polyline");
		expect(remainingPolylines).toHaveLength(1);
		expect(remainingPolylines[0]?.getAttribute("points")).toBe(pointsBefore);
	});

	it("shows a fallback message and no chart when every series is hidden, and restores it when re-enabled", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [{ timestamp: nowSeconds, value: "1" }],
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
		const originalColor = container
			.querySelector("polyline")
			?.getAttribute("stroke");

		const getButton = screen.getByRole("button", { name: 'method="GET"' });
		fireEvent.click(getButton);

		expect(screen.getByText(/all series are hidden/i)).toBeInTheDocument();
		expect(
			screen.queryByRole("img", { name: /metric evolution chart/i }),
		).not.toBeInTheDocument();

		fireEvent.click(getButton);

		await screen.findByRole("img", { name: /metric evolution chart/i });
		expect(container.querySelector("polyline")?.getAttribute("stroke")).toBe(
			originalColor,
		);
	});

	it("shows a tooltip with the timestamp and each visible series' value near the pointer", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [
					{ timestamp: nowSeconds - 30, value: "1" },
					{ timestamp: nowSeconds, value: "2" },
				],
			},
			{
				labels: { method: "POST" },
				points: [
					{ timestamp: nowSeconds - 30, value: "100" },
					{ timestamp: nowSeconds, value: "200" },
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

		const chart = await screen.findByRole("img", {
			name: /metric evolution chart/i,
		});

		fireEvent.pointerMove(chart, { clientX: 600, clientY: 100 });

		const tooltip = await screen.findByRole("tooltip");
		expect(tooltip).toHaveTextContent('method="GET"');
		expect(tooltip).toHaveTextContent("2");
		expect(tooltip).toHaveTextContent('method="POST"');
		expect(tooltip).toHaveTextContent("200");
	});

	it("excludes series hidden via the legend from the tooltip", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [{ timestamp: nowSeconds, value: "2" }],
			},
			{
				labels: { method: "POST" },
				points: [{ timestamp: nowSeconds, value: "200" }],
			},
		]);

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		const chart = await screen.findByRole("img", {
			name: /metric evolution chart/i,
		});

		fireEvent.click(screen.getByRole("button", { name: 'method="GET"' }));
		fireEvent.pointerMove(chart, { clientX: 600, clientY: 100 });

		const tooltip = await screen.findByRole("tooltip");
		expect(tooltip).not.toHaveTextContent('method="GET"');
		expect(tooltip).toHaveTextContent('method="POST"');
	});

	it("hides the tooltip when the pointer leaves the chart", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [{ timestamp: nowSeconds, value: "2" }],
			},
		]);

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		const chart = await screen.findByRole("img", {
			name: /metric evolution chart/i,
		});

		fireEvent.pointerMove(chart, { clientX: 300, clientY: 100 });
		await screen.findByRole("tooltip");

		fireEvent.pointerLeave(chart);

		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("shows the single available point regardless of pointer position when the metric has one data point", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [{ timestamp: nowSeconds, value: "42" }],
			},
		]);

		render(
			<MetricChart
				baseUrl="http://localhost:9090"
				machine="retrogaming"
				metricName="http_requests_total"
			/>,
		);

		const chart = await screen.findByRole("img", {
			name: /metric evolution chart/i,
		});

		fireEvent.pointerMove(chart, { clientX: 50, clientY: 100 });

		const tooltip = await screen.findByRole("tooltip");
		expect(tooltip).toHaveTextContent("42");
	});

	it("zooms and refetches the selected time range when the user drags a selection beyond the threshold", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [
					{ timestamp: nowSeconds - 3600, value: "1" },
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

		const chart = await screen.findByRole("img", {
			name: /metric evolution chart/i,
		});
		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(1),
		);

		fireEvent.pointerDown(chart, { clientX: 0, pointerId: 1 });
		fireEvent.pointerMove(chart, { clientX: 300, pointerId: 1 });
		fireEvent.pointerUp(chart, { clientX: 300, pointerId: 1 });

		await waitFor(() => {
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(2);
		});
		expect(mockedFetchMetricRange).toHaveBeenNthCalledWith(
			2,
			"http://localhost:9090",
			"http_requests_total",
			"retrogaming",
			nowSeconds - 3600,
			nowSeconds - 1800,
			15,
		);
	});

	it("does not zoom when the drag distance stays below the minimum threshold", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [
					{ timestamp: nowSeconds - 3600, value: "1" },
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

		const chart = await screen.findByRole("img", {
			name: /metric evolution chart/i,
		});
		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(1),
		);

		fireEvent.pointerDown(chart, { clientX: 100, pointerId: 1 });
		fireEvent.pointerMove(chart, { clientX: 104, pointerId: 1 });
		fireEvent.pointerUp(chart, { clientX: 104, pointerId: 1 });

		expect(mockedFetchMetricRange).toHaveBeenCalledTimes(1);
	});

	it("shows a reset zoom control after zooming, and returns to the original range when clicked", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [
					{ timestamp: nowSeconds - 3600, value: "1" },
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

		const chart = await screen.findByRole("img", {
			name: /metric evolution chart/i,
		});
		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(1),
		);

		expect(
			screen.queryByRole("button", { name: /reset zoom/i }),
		).not.toBeInTheDocument();

		fireEvent.pointerDown(chart, { clientX: 0, pointerId: 1 });
		fireEvent.pointerMove(chart, { clientX: 300, pointerId: 1 });
		fireEvent.pointerUp(chart, { clientX: 300, pointerId: 1 });

		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(2),
		);

		const resetButton = await screen.findByRole("button", {
			name: /reset zoom/i,
		});
		fireEvent.click(resetButton);

		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(3),
		);
		expect(mockedFetchMetricRange).toHaveBeenNthCalledWith(
			3,
			"http://localhost:9090",
			"http_requests_total",
			"retrogaming",
			nowSeconds - 3600,
			nowSeconds,
			15,
		);
		expect(
			screen.queryByRole("button", { name: /reset zoom/i }),
		).not.toBeInTheDocument();
	});

	it("clears an active zoom when the user changes the time range dropdown", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [
					{ timestamp: nowSeconds - 3600, value: "1" },
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

		const chart = await screen.findByRole("img", {
			name: /metric evolution chart/i,
		});
		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(1),
		);

		fireEvent.pointerDown(chart, { clientX: 0, pointerId: 1 });
		fireEvent.pointerMove(chart, { clientX: 300, pointerId: 1 });
		fireEvent.pointerUp(chart, { clientX: 300, pointerId: 1 });

		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(2),
		);
		await screen.findByRole("button", { name: /reset zoom/i });

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
		expect(
			screen.queryByRole("button", { name: /reset zoom/i }),
		).not.toBeInTheDocument();
	});

	it("supports drag-to-zoom via touch pointer input", async () => {
		mockedFetchMetricRange.mockResolvedValue([
			{
				labels: { method: "GET" },
				points: [
					{ timestamp: nowSeconds - 3600, value: "1" },
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

		const chart = await screen.findByRole("img", {
			name: /metric evolution chart/i,
		});
		await waitFor(() =>
			expect(mockedFetchMetricRange).toHaveBeenCalledTimes(1),
		);

		fireEvent.pointerDown(chart, {
			clientX: 0,
			pointerId: 1,
			pointerType: "touch",
		});
		fireEvent.pointerMove(chart, {
			clientX: 300,
			pointerId: 1,
			pointerType: "touch",
		});
		fireEvent.pointerUp(chart, {
			clientX: 300,
			pointerId: 1,
			pointerType: "touch",
		});

		await waitFor(() => {
			expect(mockedFetchMetricRange).toHaveBeenNthCalledWith(
				2,
				"http://localhost:9090",
				"http_requests_total",
				"retrogaming",
				nowSeconds - 3600,
				nowSeconds - 1800,
				15,
			);
		});
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

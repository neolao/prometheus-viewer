import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMetricMetadata, fetchMetricNames } from "../../api/prometheus";
import { MetricList } from "./MetricList";

vi.mock("../../api/prometheus", () => ({
	fetchMetricNames: vi.fn(),
	fetchMetricMetadata: vi.fn(),
}));

const mockedFetchMetricNames = vi.mocked(fetchMetricNames);
const mockedFetchMetricMetadata = vi.mocked(fetchMetricMetadata);

describe("MetricList", () => {
	afterEach(() => {
		mockedFetchMetricNames.mockReset();
		mockedFetchMetricMetadata.mockReset();
	});

	it("displays the fetched metric names", async () => {
		mockedFetchMetricNames.mockResolvedValue([
			"http_requests_total",
			"process_cpu_seconds_total",
		]);

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);

		expect(await screen.findByText("http_requests_total")).toBeInTheDocument();
		expect(screen.getByText("process_cpu_seconds_total")).toBeInTheDocument();
	});

	it("requests the metrics scoped to the given machine", async () => {
		mockedFetchMetricNames.mockResolvedValue([]);

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);

		await waitFor(() => {
			expect(mockedFetchMetricNames).toHaveBeenCalledWith(
				"http://localhost:9090",
				"retrogaming",
			);
		});
	});

	it("re-fetches the metric list when the selected machine changes", async () => {
		mockedFetchMetricNames.mockResolvedValue([]);

		const { rerender } = render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);

		await waitFor(() => {
			expect(mockedFetchMetricNames).toHaveBeenCalledWith(
				"http://localhost:9090",
				"retrogaming",
			);
		});

		rerender(
			<MetricList baseUrl="http://localhost:9090" machine="workstation" />,
		);

		await waitFor(() => {
			expect(mockedFetchMetricNames).toHaveBeenCalledWith(
				"http://localhost:9090",
				"workstation",
			);
		});
		expect(mockedFetchMetricNames).toHaveBeenCalledTimes(2);
	});

	it("shows a loading state before the metrics arrive", () => {
		mockedFetchMetricNames.mockReturnValue(new Promise(() => {}));

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);

		expect(screen.getByText(/chargement/i)).toBeInTheDocument();
	});

	it("shows a message naming the machine when it exposes no metrics", async () => {
		mockedFetchMetricNames.mockResolvedValue([]);

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);

		expect(
			await screen.findByText(/aucune métrique disponible pour cette machine/i),
		).toBeInTheDocument();
	});

	it("shows an error message when the request fails", async () => {
		mockedFetchMetricNames.mockRejectedValue(new Error("network error"));

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("network error");
		});
	});

	it("filters the displayed metrics to those matching the typed search text", async () => {
		mockedFetchMetricNames.mockResolvedValue([
			"http_requests_total",
			"process_cpu_seconds_total",
			"http_response_size_bytes",
		]);

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);
		await screen.findByText("http_requests_total");

		fireEvent.change(screen.getByRole("searchbox"), {
			target: { value: "http_" },
		});

		expect(screen.getByText("http_requests_total")).toBeInTheDocument();
		expect(screen.getByText("http_response_size_bytes")).toBeInTheDocument();
		expect(
			screen.queryByText("process_cpu_seconds_total"),
		).not.toBeInTheDocument();
	});

	it("matches search text regardless of letter case", async () => {
		mockedFetchMetricNames.mockResolvedValue(["http_requests_total"]);

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);
		await screen.findByText("http_requests_total");

		fireEvent.change(screen.getByRole("searchbox"), {
			target: { value: "HTTP_REQUESTS" },
		});

		expect(screen.getByText("http_requests_total")).toBeInTheDocument();
	});

	it("shows the full machine-scoped list again when the search field is cleared", async () => {
		mockedFetchMetricNames.mockResolvedValue([
			"http_requests_total",
			"process_cpu_seconds_total",
		]);

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);
		await screen.findByText("http_requests_total");
		const searchField = screen.getByRole("searchbox");

		fireEvent.change(searchField, { target: { value: "http_" } });
		expect(
			screen.queryByText("process_cpu_seconds_total"),
		).not.toBeInTheDocument();

		fireEvent.change(searchField, { target: { value: "" } });

		expect(screen.getByText("http_requests_total")).toBeInTheDocument();
		expect(screen.getByText("process_cpu_seconds_total")).toBeInTheDocument();
	});

	it("shows a no-match message instead of an empty list when nothing matches the search text", async () => {
		mockedFetchMetricNames.mockResolvedValue(["http_requests_total"]);

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);
		await screen.findByText("http_requests_total");

		fireEvent.change(screen.getByRole("searchbox"), {
			target: { value: "does_not_exist" },
		});

		expect(screen.queryByText("http_requests_total")).not.toBeInTheDocument();
		expect(
			screen.getByText(/no metric matches "does_not_exist"/i),
		).toBeInTheDocument();
	});

	it("does not show the search field when the machine has no metrics", async () => {
		mockedFetchMetricNames.mockResolvedValue([]);

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);

		await screen.findByText(/aucune métrique disponible pour cette machine/i);

		expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
	});

	it("does not show metric details before a metric is clicked", async () => {
		mockedFetchMetricNames.mockResolvedValue(["http_requests_total"]);

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);
		await screen.findByText("http_requests_total");

		expect(mockedFetchMetricMetadata).not.toHaveBeenCalled();
	});

	it("shows the type and description of the metric clicked in the list", async () => {
		mockedFetchMetricNames.mockResolvedValue(["http_requests_total"]);
		mockedFetchMetricMetadata.mockResolvedValue({
			type: "counter",
			help: "Total number of HTTP requests.",
		});

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);
		await screen.findByText("http_requests_total");

		fireEvent.click(screen.getByText("http_requests_total"));

		expect(mockedFetchMetricMetadata).toHaveBeenCalledWith(
			"http://localhost:9090",
			"http_requests_total",
		);
		expect(await screen.findByText("counter")).toBeInTheDocument();
		expect(
			screen.getByText("Total number of HTTP requests."),
		).toBeInTheDocument();
	});

	it("replaces the shown details when a different metric is clicked", async () => {
		mockedFetchMetricNames.mockResolvedValue([
			"http_requests_total",
			"process_cpu_seconds_total",
		]);
		mockedFetchMetricMetadata.mockImplementation((_baseUrl, metricName) =>
			Promise.resolve(
				metricName === "http_requests_total"
					? { type: "counter", help: "Total number of HTTP requests." }
					: { type: "gauge", help: "CPU time spent in seconds." },
			),
		);

		render(
			<MetricList baseUrl="http://localhost:9090" machine="retrogaming" />,
		);
		await screen.findByText("http_requests_total");

		fireEvent.click(screen.getByText("http_requests_total"));
		expect(await screen.findByText("counter")).toBeInTheDocument();

		fireEvent.click(screen.getByText("process_cpu_seconds_total"));

		expect(await screen.findByText("gauge")).toBeInTheDocument();
		expect(screen.queryByText("counter")).not.toBeInTheDocument();
	});
});

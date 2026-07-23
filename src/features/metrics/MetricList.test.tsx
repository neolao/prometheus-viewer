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
});

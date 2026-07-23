import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { fetchMachines, fetchMetricNames } from "./api/prometheus";

vi.mock("./api/prometheus", () => ({
	fetchMachines: vi.fn(),
	fetchMetricNames: vi.fn(),
}));

const mockedFetchMachines = vi.mocked(fetchMachines);
const mockedFetchMetricNames = vi.mocked(fetchMetricNames);

describe("App", () => {
	it("renders the Prometheus Viewer heading", () => {
		mockedFetchMachines.mockReturnValue(new Promise(() => {}));

		render(<App />);

		expect(
			screen.getByRole("heading", { name: "Prometheus Viewer" }),
		).toBeInTheDocument();
	});

	it("shows the machine selector before any metric is fetched, without any login step", async () => {
		mockedFetchMachines.mockResolvedValue(["retrogaming"]);

		render(<App />);

		expect(await screen.findByText("retrogaming")).toBeInTheDocument();
		expect(mockedFetchMetricNames).not.toHaveBeenCalled();
		expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
	});

	it("displays the metric list and keeps the selected machine visible after a machine is chosen", async () => {
		mockedFetchMachines.mockResolvedValue(["retrogaming"]);
		mockedFetchMetricNames.mockResolvedValue(["http_requests_total"]);

		render(<App />);

		const machineOption = await screen.findByText("retrogaming");
		fireEvent.click(machineOption);

		expect(await screen.findByText("http_requests_total")).toBeInTheDocument();
		expect(screen.getByText("retrogaming")).toBeInTheDocument();
	});
});
